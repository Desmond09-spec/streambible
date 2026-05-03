import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { error, count } = await supabase
  .from('bible_cache')
  .delete({ count: 'exact' })
  .eq('version_id', 'nlt');

if (error) {
  console.error('❌ Error:', error.message);
} else {
  console.log(`✅ Cleared ${count ?? 'all'} stale NLT cache rows from Supabase.`);
}
