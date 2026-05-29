import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, reference, versionId, nltRef } = await req.json();

    const API_BIBLE_KEY = Deno.env.get('API_BIBLE_KEY');
    if (!API_BIBLE_KEY) {
      throw new Error('API_BIBLE_KEY environment variable is not set');
    }

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === 'fetch_versions') {
      // API.Bible doesn't have a single simple endpoint for all versions without pagination, 
      // and we are managing versions on the client. So we just return an empty array or basic response.
      return new Response(JSON.stringify({ data: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'fetch_verse') {
      if (!reference || !versionId) {
        throw new Error('Missing reference or versionId');
      }

      // 1. Check Global Cache
      const { data: cached, error: cacheError } = await supabase
        .from('bible_cache')
        .select('*')
        .eq('reference', reference)
        .eq('version_id', versionId.toString())
        .maybeSingle();

      if (cacheError) {
        console.error("Cache read error:", cacheError);
      }

      if (cached) {
        // Check if expired
        const isExpired = new Date(cached.expires_at) < new Date();
        if (!isExpired) {
          console.log(`[Cache Hit] ${reference} (${versionId})`);

          return new Response(JSON.stringify({ text: cached.text, source: 'cache', fums: cached.fums || '' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          console.log(`[Cache Expired] ${reference} (${versionId})`);
          // Proceed to fetch a fresh copy and overwrite
        }
      }

      // 2. Fetch from External API
      let verseText = "Text not found";

      if (versionId === 'nlt') {
        const NLT_API_KEY = Deno.env.get('NLT_API_KEY');
        if (!NLT_API_KEY) throw new Error('NLT_API_KEY environment variable is not set');

        const fetchRef = nltRef ? encodeURIComponent(nltRef) : reference;
        console.log(`[Cache Miss] Fetching ${fetchRef} from NLT.to...`);
        const apiRes = await fetch(`https://api.nlt.to/api/passages?ref=${fetchRef}&version=NLT&key=${NLT_API_KEY}`);
        
        if (!apiRes.ok) {
          const errText = await apiRes.text();
          console.error("NLT API Error:", apiRes.status, errText);
          throw new Error(`NLT API returned ${apiRes.status}: ${errText}`);
        }

        verseText = await apiRes.text(); // returns HTML
        
        // Remove structural elements and their contents
        verseText = verseText.replace(/<head>[\s\S]*?<\/head>/gi, '');
        verseText = verseText.replace(/<h2[^>]*>[\s\S]*?<\/h2>/gi, '');
        
        // Retain verse numbers securely encoded
        verseText = verseText.replace(/<span class="vn">([\d\w]+)<\/span>/gi, '{{v:$1}} ');
        verseText = verseText.replace(/<span class="v(?:erse_number)?">([\d\w]+)<\/span>/gi, '{{v:$1}} ');
        verseText = verseText.replace(/<a class="a-tn">[\s\S]*?<\/a>/gi, '');
        verseText = verseText.replace(/<span class="tn">[\s\S]*?<\/span>/gi, '');
        verseText = verseText.replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '');
      } else {
        console.log(`[Cache Miss] Fetching ${reference} (${versionId}) from API.Bible...`);
        const apiRes = await fetch(`https://rest.api.bible/v1/bibles/${versionId}/passages/${reference}?content-type=html&include-verse-numbers=true`, {
          headers: { "api-key": API_BIBLE_KEY, "Accept": "application/json" }
        });

        if (!apiRes.ok) {
          const errText = await apiRes.text();
          console.error("API.Bible Error:", apiRes.status, errText);
          throw new Error(`API.Bible returned ${apiRes.status}: ${errText}`);
        }

        verseText = await apiRes.text();
      }

      let fums = "";
      if (versionId === 'nlt') {
        // NLT specific text cleaning
        let cleanText = verseText.replace(/<[^>]*>?/gm, '').trim();
        cleanText = cleanText.replace(/\[(\d+)\]\s?/g, '{{v:$1}} ');
        verseText = cleanText.replace(/\s{2,}/g, ' ');
      } else {
        // API.Bible handling: no stripping, FUMS parsing
        try {
          const parsedData = JSON.parse(verseText);
          if (parsedData && parsedData.meta && parsedData.meta.fums) {
            fums = parsedData.meta.fums;
          }
          if (parsedData.data && parsedData.data.content) {
            verseText = parsedData.data.content;
          }
        } catch(e) {
          // If it was already parsed to a string of text, handle it.
          // Wait, verseText is already either content or JSON string.
        }
      }

      // 3. Save to Global Cache (30 Days)
      const { error: upsertError } = await supabase
        .from('bible_cache')
        .upsert(
          { 
            reference, 
            version_id: versionId.toString(), 
            text: verseText,
            fums: fums,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          },
          { onConflict: 'reference,version_id' }
        );

      if (upsertError) {
        console.error("Supabase Upsert Error:", upsertError);
      }

      return new Response(JSON.stringify({ text: verseText, source: 'api', fums }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
