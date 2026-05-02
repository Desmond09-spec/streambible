
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
    const { action, reference, versionId } = await req.json();

    const YOUVERSION_KEY = Deno.env.get('YOUVERSION_KEY');
    if (!YOUVERSION_KEY) {
      throw new Error('YOUVERSION_KEY environment variable is not set');
    }

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === 'fetch_versions') {
      // Proxy the request to fetch all versions
      const yvRes = await fetch(`https://api.youversion.com/v1/bibles`, {
        headers: { "X-YVP-App-Key": YOUVERSION_KEY, "Accept": "application/json" }
      });
      const yvData = await yvRes.json();
      return new Response(JSON.stringify(yvData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'fetch_verse') {
      if (!reference || !versionId) {
        throw new Error('Missing reference or versionId');
      }

      // 1. Check Global Cache
      const { data: cached } = await supabase
        .from('bible_cache')
        .select('*')
        .eq('reference', reference)
        .eq('version_id', versionId.toString())
        .single();

      if (cached) {
        // Check if expired
        const isExpired = new Date(cached.expires_at) < new Date();
        if (!isExpired) {
          console.log(`[Cache Hit] ${reference} (${versionId})`);

          // Silent ping to YouVersion for FUMS (Fair Use Management System) tracking
          fetch(`https://api.youversion.com/v1/bibles/${versionId}/passages/${reference}`, {
            headers: { "X-YVP-App-Key": YOUVERSION_KEY, "Accept": "application/json" }
          }).catch(err => console.error("FUMS Ping failed:", err));

          return new Response(JSON.stringify({ text: cached.text, source: 'cache' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          console.log(`[Cache Expired] ${reference} (${versionId})`);
          // We will proceed to fetch a fresh copy and overwrite
        }
      }

      // 2. Fetch from YouVersion
      console.log(`[Cache Miss] Fetching ${reference} (${versionId}) from YouVersion...`);
      const yvRes = await fetch(`https://api.youversion.com/v1/bibles/${versionId}/passages/${reference}`, {
        headers: { "X-YVP-App-Key": YOUVERSION_KEY, "Accept": "application/json" }
      });

      if (!yvRes.ok) {
        const errText = await yvRes.text();
        console.error("YouVersion API Error:", yvRes.status, errText);
        throw new Error(`YouVersion API returned ${yvRes.status}`);
      }

      const yvData = await yvRes.json();
      
      // The exact response shape depends on the YouVersion API. 
      // Usually it's { data: { content: "...", ... } } or similar.
      // We will assume a structure like { passage: "text" } or { data: { content: "text" } } based on typical REST APIs.
      // We will try to extract the text flexibly.
      
      // Let's assume the API returns { text: "..." } or { content: "..." }
      let verseText = "Text not found";
      if (yvData.text) verseText = yvData.text;
      else if (yvData.content) verseText = yvData.content;
      else if (yvData.response && yvData.response.data && yvData.response.data.content) verseText = yvData.response.data.content;
      else verseText = JSON.stringify(yvData); // Fallback to see structure in UI

      // Clean HTML tags if any
      const cleanText = verseText.replace(/<[^>]*>?/gm, '').trim();

      // 3. Save to Global Cache
      const { error: upsertError } = await supabase
        .from('bible_cache')
        .upsert(
          { 
            reference, 
            version_id: versionId.toString(), 
            text: cleanText,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
          },
          { onConflict: 'reference,version_id' }
        );

      if (upsertError) {
        console.error("Supabase Upsert Error:", upsertError);
      }

      return new Response(JSON.stringify({ text: cleanText, source: 'api' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
