import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function test() {
  const apiRes = await fetch(`https://rest.api.bible/v1/bibles/78a9f6124f344018-01/passages/GEN.1.1-GEN.1.2?content-type=text&include-verse-numbers=true`, {
    headers: { "api-key": process.env.API_BIBLE_KEY, "Accept": "application/json" }
  });
  const data = await apiRes.json();
  console.log("API.Bible:", data.data.content);
}

test();
