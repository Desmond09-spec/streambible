import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.log("Invoking fetch-verse...");
  const { data, error } = await supabase.functions.invoke('fetch-verse', {
    body: { action: 'fetch_verse', reference: 'GEN.1.1', versionId: 'nlt', nltRef: 'Genesis.1.1' }
  });

  if (error) {
    console.error("Invoke Error:", error);
  }
  console.log("Data:", data);
}

test();
