/**
 * StreamBible Bulk Migration Script
 * Reads all KJV and Yoruba JSON files and upserts them into Supabase.
 *
 * Run: node migrate.js
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// ─── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = "";
// Service role key — bypasses RLS. NEVER use this in frontend code.
const SUPABASE_KEY = "";

const KJV_DIR = "";
const YOR_DIR = "";
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
  "1Samuel": "1SA",
  "2Samuel": "2SA",
  "1Kings": "1KI",
  "2Kings": "2KI",
  "1Chronicles": "1CH",
  "2Chronicles": "2CH",
  Ezra: "EZR",
  Nehemiah: "NEH",
  Esther: "EST",
  Job: "JOB",
  Psalms: "PSA",
  Proverbs: "PRO",
  Ecclesiastes: "ECC",
  SongofSolomon: "SNG",
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
  "1Corinthians": "1CO",
  "2Corinthians": "2CO",
  Galatians: "GAL",
  Ephesians: "EPH",
  Philippians: "PHP",
  Colossians: "COL",
  "1Thessalonians": "1TH",
  "2Thessalonians": "2TH",
  "1Timothy": "1TI",
  "2Timothy": "2TI",
  Titus: "TIT",
  Philemon: "PHM",
  Hebrews: "HEB",
  James: "JAS",
  "1Peter": "1PE",
  "2Peter": "2PE",
  "1John": "1JN",
  "2John": "2JN",
  "3John": "3JN",
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

async function migrateDir(supabase, dir, translation) {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json") && f !== "Books.json");
  let totalVerses = 0;

  for (const file of files) {
    const bookName = path.basename(file, ".json");
    const bookCode = BOOK_CODE_MAP[bookName];

    if (!bookCode) {
      console.warn(`  ⚠ Unknown book: ${bookName} — skipping`);
      continue;
    }

    console.log(
      `  📖 ${translation.toUpperCase()} — ${bookName} (${bookCode})`,
    );
    const data = parseJsonFile(path.join(dir, file));
    const rows = [];

    for (const chapterObj of data.chapters) {
      const chapter = parseInt(chapterObj.chapter, 10);
      for (const verseObj of chapterObj.verses) {
        rows.push({
          translation,
          book_code: bookCode,
          chapter,
          verse: parseInt(verseObj.verse, 10),
          text: verseObj.text.trim(),
        });
      }
    }

    await batchUpsert(supabase, rows);
    totalVerses += rows.length;
  }

  return totalVerses;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log("🚀 StreamBible Migration Starting...\n");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    console.log("📘 Migrating KJV (English)...");
    const kjvCount = await migrateDir(supabase, KJV_DIR, "kjv");
    console.log(
      `\n✅ KJV complete — ${kjvCount.toLocaleString()} verses inserted.\n`,
    );

    console.log("📗 Migrating Yoruba...");
    const yorCount = await migrateDir(supabase, YOR_DIR, "yor");
    console.log(
      `\n✅ Yoruba complete — ${yorCount.toLocaleString()} verses inserted.\n`,
    );

    console.log(
      `🎉 Migration complete! Total: ${(kjvCount + yorCount).toLocaleString()} verses in Supabase.`,
    );
  } catch (err) {
    console.error("\n❌ Migration failed:", err.message);
    process.exit(1);
  }
})();
