/**
 * StreamBible Open Source Migration Script
 * Reads the combined JSON files from the open-source directory and upserts them into Supabase.
 *
 * Usage: node scratch/migrate_open_source.js
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env.local") });

// ─── Config ───────────────────────────────────────────────────────────────────
// Replace these with your actual Supabase URL and Service Role Key (from your dashboard)
const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "YOUR_SUPABASE_URL_HERE";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE";

const OPEN_SOURCE_DIR = path.join(__dirname, "../open-source");
const BATCH_SIZE = 500;

// ─── Book name → code map ─────────────────────────────────────────────────────
const BOOK_CODE_MAP = {
  Genesis: "GEN",
  Exodus: "EXO",
  Leviticus: "LEV",
  Numbers: "NUM",
  Deuteronomy: "DEU",
  Joshua: "JOS",
  Judges: "JDG",
  Ruth: "RUT",
  "1 Samuel": "1SA",
  "2 Samuel": "2SA",
  "1 Kings": "1KI",
  "2 Kings": "2KI",
  "1 Chronicles": "1CH",
  "2 Chronicles": "2CH",
  Ezra: "EZR",
  Nehemiah: "NEH",
  Esther: "EST",
  Job: "JOB",
  Psalms: "PSA",
  Proverbs: "PRO",
  Ecclesiastes: "ECC",
  "Song of Solomon": "SNG",
  Isaiah: "ISA",
  Jeremiah: "JER",
  Lamentations: "LAM",
  Ezekiel: "EZK",
  Daniel: "DAN",
  Hosea: "HOS",
  Joel: "JOL",
  Amos: "AMO",
  Obadiah: "OBA",
  Jonah: "JON",
  Micah: "MIC",
  Nahum: "NAM",
  Habakkuk: "HAB",
  Zephaniah: "ZEP",
  Haggai: "HAG",
  Zechariah: "ZEC",
  Malachi: "MAL",
  Matthew: "MAT",
  Mark: "MRK",
  Luke: "LUK",
  John: "JHN",
  Acts: "ACT",
  Romans: "ROM",
  "1 Corinthians": "1CO",
  "2 Corinthians": "2CO",
  Galatians: "GAL",
  Ephesians: "EPH",
  Philippians: "PHP",
  Colossians: "COL",
  "1 Thessalonians": "1TH",
  "2 Thessalonians": "2TH",
  "1 Timothy": "1TI",
  "2 Timothy": "2TI",
  Titus: "TIT",
  Philemon: "PHM",
  Hebrews: "HEB",
  James: "JAS",
  "1 Peter": "1PE",
  "2 Peter": "2PE",
  "1 John": "1JN",
  "2 John": "2JN",
  "3 John": "3JN",
  Jude: "JUD",
  Revelation: "REV",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function batchUpsert(supabase, rows) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("verses")
      .upsert(batch, { onConflict: "translation,book_code,chapter,verse" });
    if (error) throw error;
    process.stdout.write(
      `  ✓ Inserted rows ${i + 1}–${Math.min(i + BATCH_SIZE, rows.length)}\n`,
    );
  }
}

function parseJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log("🚀 StreamBible Open Source Migration Starting...\n");

  if (SUPABASE_URL === "YOUR_SUPABASE_URL_HERE") {
    console.error(
      "❌ Please provide SUPABASE_URL and SUPABASE_KEY in the script or via env vars.",
    );
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    const files = fs
      .readdirSync(OPEN_SOURCE_DIR)
      .filter((f) => f.endsWith(".json"));
    let totalOverallVerses = 0;

    for (const file of files) {
      let translationCode = "unk";
      const filename = file.toUpperCase();

      if (filename.includes("AMERICAN STANDARD")) translationCode = "asv";
      else if (filename.includes("BEREAN STANDARD")) translationCode = "bsb";
      else if (filename.includes("WORLD ENGLISH")) translationCode = "web";
      else {
        console.warn(`  ⚠ Unknown translation file: ${file} — skipping`);
        continue;
      }

      console.log(
        `\n📘 Migrating ${translationCode.toUpperCase()} from ${file}...`,
      );
      const data = parseJsonFile(path.join(OPEN_SOURCE_DIR, file));

      let rows = [];
      let totalVerses = 0;

      for (const [bookName, chapters] of Object.entries(data)) {
        const bookCode = BOOK_CODE_MAP[bookName];
        if (!bookCode) {
          console.warn(`  ⚠ Unknown book: ${bookName} — skipping`);
          continue;
        }

        for (const [chapterNumStr, verses] of Object.entries(chapters)) {
          const chapter = parseInt(chapterNumStr, 10);
          for (const [verseNumStr, text] of Object.entries(verses)) {
            const verse = parseInt(verseNumStr, 10);

            rows.push({
              translation: translationCode,
              book_code: bookCode,
              chapter,
              verse,
              text: text.trim(),
            });

            // If we have enough rows, execute the batch upsert and clear array
            if (rows.length >= 10000) {
              await batchUpsert(supabase, rows);
              totalVerses += rows.length;
              rows = [];
            }
          }
        }
      }

      // Upsert any remaining rows
      if (rows.length > 0) {
        await batchUpsert(supabase, rows);
        totalVerses += rows.length;
      }

      console.log(
        `\n✅ ${translationCode.toUpperCase()} complete — ${totalVerses.toLocaleString()} verses inserted.`,
      );
      totalOverallVerses += totalVerses;
    }

    console.log(
      `\n🎉 Migration complete! Total: ${totalOverallVerses.toLocaleString()} verses upserted to Supabase.`,
    );
  } catch (err) {
    console.error("\n❌ Migration failed:", err.message);
    process.exit(1);
  }
})();
