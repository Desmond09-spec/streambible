export interface BibleReference {
  bookCode: string;
  chapter: number;
  verses: number[];
}

const bibleBookMap: Record<string, string> = {
  // Genesis
  genesis: "GEN",
  gen: "GEN",
  gene: "GEN",
  ge: "GEN",
  // Exodus
  exodus: "EXO",
  exo: "EXO",
  ex: "EXO",
  // Leviticus
  leviticus: "LEV",
  lev: "LEV",
  le: "LEV",
  // Numbers
  numbers: "NUM",
  num: "NUM",
  no: "NUM",
  nm: "NUM",
  // Deuteronomy
  deuteronomy: "DEU",
  deut: "DEU",
  deu: "DEU",
  dt: "DEU",
  // Joshua
  joshua: "JOS",
  josh: "JOS",
  jos: "JOS",
  jo: "JOS",
  // Judges
  judges: "JDG",
  judg: "JDG",
  jdg: "JDG",
  // Ruth
  ruth: "RUT",
  ru: "RUT",
  // 1 Samuel
  "1 samuel": "1SA",
  "1samuel": "1SA",
  "1 sam": "1SA",
  "1sam": "1SA",
  "1 sa": "1SA",
  "1sa": "1SA",
  // 2 Samuel
  "2 samuel": "2SA",
  "2samuel": "2SA",
  "2 sam": "2SA",
  "2sam": "2SA",
  "2 sa": "2SA",
  "2sa": "2SA",
  // 1 Kings
  "1 kings": "1KI",
  "1kings": "1KI",
  "1 kin": "1KI",
  "1kin": "1KI",
  "1 ki": "1KI",
  "1ki": "1KI",
  // 2 Kings
  "2 kings": "2KI",
  "2kings": "2KI",
  "2 kin": "2KI",
  "2kin": "2KI",
  "2 ki": "2KI",
  "2ki": "2KI",
  // 1 Chronicles
  "1 chronicles": "1CH",
  "1chronicles": "1CH",
  "1 chr": "1CH",
  "1chr": "1CH",
  "1 ch": "1CH",
  "1ch": "1CH",
  // 2 Chronicles
  "2 chronicles": "2CH",
  "2chronicles": "2CH",
  "2 chr": "2CH",
  "2chr": "2CH",
  "2 ch": "2CH",
  "2ch": "2CH",
  // Ezra
  ezra: "EZR",
  ez: "EZR",
  // Nehemiah
  nehemiah: "NEH",
  neh: "NEH",
  // Esther
  esther: "EST",
  est: "EST",
  // Job
  job: "JOB",
  jb: "JOB",
  // Psalms
  psalms: "PSA",
  psalm: "PSA",
  psa: "PSA",
  ps: "PSA",
  psm: "PSA",
  // Proverbs
  proverbs: "PRO",
  prov: "PRO",
  pro: "PRO",
  pr: "PRO",
  // Ecclesiastes
  ecclesiastes: "ECC",
  eccl: "ECC",
  ecc: "ECC",
  ec: "ECC",
  // Song of Solomon
  "song of solomon": "SNG",
  "song of songs": "SNG",
  song: "SNG",
  sos: "SNG",
  "song solomon": "SNG",
  // Isaiah
  isaiah: "ISA",
  isa: "ISA",
  is: "ISA",
  // Jeremiah
  jeremiah: "JER",
  jer: "JER",
  je: "JER",
  // Lamentations
  lamentations: "LAM",
  lam: "LAM",
  la: "LAM",
  // Ezekiel
  ezekiel: "EZK",
  ezek: "EZK",
  ezk: "EZK",
  // Daniel
  daniel: "DAN",
  dan: "DAN",
  da: "DAN",
  // Hosea
  hosea: "HOS",
  hos: "HOS",
  ho: "HOS",
  // Joel
  joel: "JOL",
  jl: "JOL",
  // Amos
  amos: "AMO",
  am: "AMO",
  // Obadiah
  obadiah: "OBA",
  oba: "OBA",
  // Jonah
  jonah: "JON",
  jon: "JON",
  jona: "JON",
  // Micah
  micah: "MIC",
  mic: "MIC",
  // Nahum
  nahum: "NAM",
  nah: "NAM",
  na: "NAM",
  // Habakkuk
  habakkuk: "HAB",
  hab: "HAB",
  // Zephaniah
  zephaniah: "ZEP",
  zep: "ZEP",
  // Haggai
  haggai: "HAG",
  hag: "HAG",
  // Zechariah
  zechariah: "ZEC",
  zec: "ZEC",
  // Malachi
  malachi: "MAL",
  mal: "MAL",
  // Matthew
  matthew: "MAT",
  matt: "MAT",
  mat: "MAT",
  mt: "MAT",
  // Mark
  mark: "MRK",
  mrk: "MRK",
  mr: "MRK",
  // Luke
  luke: "LUK",
  luk: "LUK",
  lk: "LUK",
  // John
  john: "JHN",
  jhn: "JHN",
  jn: "JHN",
  joh: "JHN",
  // Acts
  acts: "ACT",
  act: "ACT",
  ac: "ACT",
  // Romans
  romans: "ROM",
  rom: "ROM",
  ro: "ROM",
  // 1 Corinthians
  "1 corinthians": "1CO",
  "1corinthians": "1CO",
  "1 cor": "1CO",
  "1cor": "1CO",
  "1 co": "1CO",
  "1co": "1CO",
  "1 corin": "1CO",
  "1corin": "1CO",
  // 2 Corinthians
  "2 corinthians": "2CO",
  "2corinthians": "2CO",
  "2 cor": "2CO",
  "2cor": "2CO",
  "2 co": "2CO",
  "2co": "2CO",
  "2 corin": "2CO",
  "2corin": "2CO",
  // Galatians
  galatians: "GAL",
  gal: "GAL",
  ga: "GAL",
  // Ephesians
  ephesians: "EPH",
  eph: "EPH",
  ep: "EPH",
  // Philippians
  philippians: "PHP",
  phil: "PHP",
  php: "PHP",
  ph: "PHP",
  // Colossians
  colossians: "COL",
  col: "COL",
  co: "COL",
  // 1 Thessalonians
  "1 thessalonians": "1TH",
  "1thessalonians": "1TH",
  "1 thess": "1TH",
  "1thess": "1TH",
  "1 th": "1TH",
  "1th": "1TH",
  // 2 Thessalonians
  "2 thessalonians": "2TH",
  "2thessalonians": "2TH",
  "2 thess": "2TH",
  "2thess": "2TH",
  "2 th": "2TH",
  "2th": "2TH",
  // 1 Timothy
  "1 timothy": "1TI",
  "1timothy": "1TI",
  "1 tim": "1TI",
  "1tim": "1TI",
  "1 ti": "1TI",
  "1ti": "1TI",
  // 2 Timothy
  "2 timothy": "2TI",
  "2timothy": "2TI",
  "2 tim": "2TI",
  "2tim": "2TI",
  "2 ti": "2TI",
  "2ti": "2TI",
  // Titus
  titus: "TIT",
  tit: "TIT",
  // Philemon
  philemon: "PHM",
  phm: "PHM",
  // Hebrews
  hebrews: "HEB",
  heb: "HEB",
  he: "HEB",
  // James
  james: "JAS",
  jas: "JAS",
  jm: "JAS",
  // 1 Peter
  "1 peter": "1PE",
  "1peter": "1PE",
  "1 pet": "1PE",
  "1pet": "1PE",
  "1 pe": "1PE",
  "1pe": "1PE",
  // 2 Peter
  "2 peter": "2PE",
  "2peter": "2PE",
  "2 pet": "2PE",
  "2pet": "2PE",
  "2 pe": "2PE",
  "2pe": "2PE",
  // 1 John
  "1 john": "1JN",
  "1john": "1JN",
  "1 jn": "1JN",
  "1jn": "1JN",
  // 2 John
  "2 john": "2JN",
  "2john": "2JN",
  "2 jn": "2JN",
  "2jn": "2JN",
  // 3 John
  "3 john": "3JN",
  "3john": "3JN",
  "3 jn": "3JN",
  "3jn": "3JN",
  // Jude
  jude: "JUD",
  jud: "JUD",
  // Revelation
  revelation: "REV",
  rev: "REV",
  re: "REV",
};

export const canonicalBookNames: Record<string, string> = {
  GEN: "Genesis",
  EXO: "Exodus",
  LEV: "Leviticus",
  NUM: "Numbers",
  DEU: "Deuteronomy",
  JOS: "Joshua",
  JDG: "Judges",
  RUT: "Ruth",
  "1SA": "1 Samuel",
  "2SA": "2 Samuel",
  "1KI": "1 Kings",
  "2KI": "2 Kings",
  "1CH": "1 Chronicles",
  "2CH": "2 Chronicles",
  EZR: "Ezra",
  NEH: "Nehemiah",
  EST: "Esther",
  JOB: "Job",
  PSA: "Psalms",
  PRO: "Proverbs",
  ECC: "Ecclesiastes",
  SNG: "Song of Solomon",
  ISA: "Isaiah",
  JER: "Jeremiah",
  LAM: "Lamentations",
  EZK: "Ezekiel",
  DAN: "Daniel",
  HOS: "Hosea",
  JOL: "Joel",
  AMO: "Amos",
  OBA: "Obadiah",
  JON: "Jonah",
  MIC: "Micah",
  NAM: "Nahum",
  HAB: "Habakkuk",
  ZEP: "Zephaniah",
  HAG: "Haggai",
  ZEC: "Zechariah",
  MAL: "Malachi",
  MAT: "Matthew",
  MRK: "Mark",
  LUK: "Luke",
  JHN: "John",
  ACT: "Acts",
  ROM: "Romans",
  "1CO": "1 Corinthians",
  "2CO": "2 Corinthians",
  GAL: "Galatians",
  EPH: "Ephesians",
  PHP: "Philippians",
  COL: "Colossians",
  "1TH": "1 Thessalonians",
  "2TH": "2 Thessalonians",
  "1TI": "1 Timothy",
  "2TI": "2 Timothy",
  TIT: "Titus",
  PHM: "Philemon",
  HEB: "Hebrews",
  JAS: "James",
  "1PE": "1 Peter",
  "2PE": "2 Peter",
  "1JN": "1 John",
  "2JN": "2 John",
  "3JN": "3 John",
  JUD: "Jude",
  REV: "Revelation",
};

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
}

export function getBookCode(bookName: string): string | null {
  const normalized = normalizeName(bookName);

  // 1. Exact alias match — highest priority
  if (bibleBookMap[normalized]) return bibleBookMap[normalized];

  // 2. First prefix match in Bible canonical order (map insertion order).
  //    If the user types "j", the first 'j' book in Bible order wins.
  //    Operators learn this quickly and type more characters to be specific.
  for (const alias in bibleBookMap) {
    if (alias.startsWith(normalized)) {
      return bibleBookMap[alias];
    }
  }

  return null;
}

export function parseReference(query: string): BibleReference | null {
  const normalizedQuery = query.trim().replace(/\s+/g, " ");

  // Matches book name (letters, optional leading 1/2/3) and trailing numbers/colons/hyphens/commas
  const match = normalizedQuery.match(
    /^([123]?\s*[a-zA-Z\s]+?)\s*(\d[\d\s:,\-]*?)?$/i,
  );
  if (!match) return null;

  const bookName = match[1].trim();
  const bookCode = getBookCode(bookName);

  if (!bookCode) return null;

  const numberPart = match[2] ? match[2].trim() : "";

  let chapter = 1;
  let verses: number[] = [];

  if (numberPart) {
    let chapterStr = "";
    let verseStr = "";

    if (numberPart.includes(":")) {
      const parts = numberPart.split(":");
      chapterStr = parts[0];
      verseStr = parts.slice(1).join(":"); // handles accidental multiple colons
    } else {
      // split by first space for format "3 16-18, 20"
      const parts = numberPart.split(/\s+/);
      chapterStr = parts[0];
      if (parts.length > 1) {
        verseStr = parts.slice(1).join("");
      }
    }

    chapter = Number(chapterStr.trim());

    if (verseStr) {
      // parse ranges and commas: "16-18, 20, 22-23"
      const groups = verseStr.split(",");
      for (const group of groups) {
        const cleanGroup = group.trim();
        if (!cleanGroup) continue;
        if (cleanGroup.includes("-")) {
          const rangeParts = cleanGroup.split("-").map((s) => Number(s.trim()));
          if (
            rangeParts.length === 2 &&
            !Number.isNaN(rangeParts[0]) &&
            !Number.isNaN(rangeParts[1])
          ) {
            for (let i = rangeParts[0]; i <= rangeParts[1]; i++) {
              verses.push(i);
            }
          }
        } else {
          const v = Number(cleanGroup);
          if (!Number.isNaN(v)) {
            verses.push(v);
          }
        }
      }
    }
  }

  if (Number.isNaN(chapter)) return null;

  // Deduplicate and sort
  verses = Array.from(new Set(verses)).sort((a, b) => a - b);

  return { bookCode, chapter, verses };
}

// ─── Incremental Parser ───────────────────────────────────────────────────────

/**
 * Chapter counts per book (66-book Protestant canon).
 * Used for fused-digit disambiguation: e.g. "john316" → chapter=3, verse=16
 * because John has only 21 chapters (so 31 is invalid, but 3 is valid).
 */
export const bookChapterCounts: Record<string, number> = {
  GEN: 50, EXO: 40, LEV: 27, NUM: 36, DEU: 34,
  JOS: 24, JDG: 21, RUT: 4,
  "1SA": 31, "2SA": 24, "1KI": 22, "2KI": 25,
  "1CH": 29, "2CH": 36,
  EZR: 10, NEH: 13, EST: 10, JOB: 42,
  PSA: 150, PRO: 31, ECC: 12, SNG: 8,
  ISA: 66, JER: 52, LAM: 5, EZK: 48, DAN: 12,
  HOS: 14, JOL: 3, AMO: 9, OBA: 1, JON: 4, MIC: 7,
  NAM: 3, HAB: 3, ZEP: 3, HAG: 2, ZEC: 14, MAL: 4,
  MAT: 28, MRK: 16, LUK: 24, JHN: 21, ACT: 28,
  ROM: 16, "1CO": 16, "2CO": 13, GAL: 6, EPH: 6,
  PHP: 4, COL: 4, "1TH": 5, "2TH": 3, "1TI": 6,
  "2TI": 4, TIT: 3, PHM: 1, HEB: 13, JAS: 5,
  "1PE": 5, "2PE": 3, "1JN": 5, "2JN": 1, "3JN": 1,
  JUD: 1, REV: 22,
};

/**
 * The structured result of a successful incremental parse.
 * `canonical` is always a well-formatted reference string (e.g. "John 3:16").
 */
export interface ParsedReference {
  bookCode: string;
  chapter: number;
  verse: number;
  canonical: string;
  selectionStart: number;
  selectionEnd: number;
}

/**
 * Parses user input incrementally, applying the EasyWorship model:
 *
 * - Returns `null` if no book can be identified → caller should freeze the UI.
 * - Defaults missing chapter to 1, missing verse to 1.
 * - Clamps out-of-range chapter/verse values rather than failing.
 * - Resolves fused inputs like "john316" using Bible structure knowledge.
 *
 * This function is stateless and pure — safe to call on every keystroke.
 *
 * @example
 * parseReferenceIncremental("j")         // → { bookCode: "JOS", chapter: 1, verse: 1, canonical: "Joshua 1:1" }
 * parseReferenceIncremental("joh")       // → { bookCode: "JHN", chapter: 1, verse: 1, canonical: "John 1:1" }
 * parseReferenceIncremental("john3:16")  // → { bookCode: "JHN", chapter: 3, verse: 16, canonical: "John 3:16" }
 * parseReferenceIncremental("john316")   // → { bookCode: "JHN", chapter: 3, verse: 16, canonical: "John 3:16" }
 * parseReferenceIncremental("rom8:28")   // → { bookCode: "ROM", chapter: 8, verse: 28, canonical: "Romans 8:28" }
 * parseReferenceIncremental("xyzzy")     // → null  (UI freezes)
 */
export function parseReferenceIncremental(
  input: string,
): ParsedReference | null {
  if (!input.trim()) return null;

  const normalized = input.trim().replace(/\s+/g, " ");

  // Split into book part (letters + optional leading 1/2/3) and number part.
  // The book-name group is lazy so it stops before the first standalone digit.
  const match = normalized.match(
    /^([123]?\s*[a-zA-Z][a-zA-Z\s]*?)\s*(\d[\d\s:]*)?$/i,
  );
  if (!match) return null;

  const bookPart = match[1].trim();
  const numberPart = (match[2] ?? "").trim();

  const bookCode = getBookCode(bookPart);
  if (!bookCode) return null;

  const maxChapters = bookChapterCounts[bookCode] ?? 1;
  const { chapter, verse, provided } = _parseNumbers(numberPart, maxChapters);

  const bookName = canonicalBookNames[bookCode];
  const canonical = `${bookName} ${chapter}:${verse}`;

  let selectionStart = 0;
  let selectionEnd = 0;

  if (provided === "none") {
    // Typing the book part. Match exactly what they typed up to book name length.
    selectionStart = Math.min(bookPart.length, bookName.length);
    selectionEnd = bookName.length; // Highlight the rest of the book name
    // If they typed a trailing space, move selection past the space (cursor only).
    if (input.endsWith(" ")) {
      selectionStart = bookName.length + 1;
      selectionEnd = selectionStart;
    }
  } else if (provided === "chapter") {
    selectionStart = bookName.length + 1 + String(chapter).length;
    selectionEnd = canonical.length; // Highlight the separator and default verse
  } else if (provided === "separator") {
    selectionStart = bookName.length + 1 + String(chapter).length + 1;
    selectionEnd = canonical.length; // Highlight the default verse
  } else if (provided === "verse") {
    selectionStart = canonical.length;
    selectionEnd = selectionStart;
  }

  return { bookCode, chapter, verse, canonical, selectionStart, selectionEnd };
}

/**
 * Parses the numeric portion of a reference string into chapter + verse.
 * Handles: explicit colons ("3:16"), space-separated ("3 16"), and
 * fused digits ("316") using maxChapters for disambiguation.
 */
function _parseNumbers(
  numberPart: string,
  maxChapters: number,
): { chapter: number; verse: number; provided: "none" | "chapter" | "separator" | "verse" } {
  if (!numberPart) return { chapter: 1, verse: 1, provided: "none" };

  // Colon-separated: "3:16" or "3:"
  if (numberPart.includes(":")) {
    const [chStr, verseStr] = numberPart.split(":");
    const chapter = Math.max(1, Math.min(parseInt(chStr, 10) || 1, maxChapters));
    const verse = Math.max(1, parseInt(verseStr, 10) || 1);
    return { chapter, verse, provided: verseStr ? "verse" : "separator" };
  }

  // Space-separated: "3 16"
  if (numberPart.includes(" ")) {
    const parts = numberPart.split(" ");
    const chapter = Math.max(1, Math.min(parseInt(parts[0], 10) || 1, maxChapters));
    const verse = Math.max(1, parseInt(parts[1], 10) || 1);
    return { chapter, verse, provided: parts[1] ? "verse" : "separator" };
  }

  // Pure digits — could be chapter-only ("23") or fused chapter+verse ("316").
  const digits = numberPart.replace(/\D/g, "");
  if (!digits) return { chapter: 1, verse: 1, provided: "none" };

  const asChapter = parseInt(digits, 10);

  // If the entire digit string is a valid chapter, treat it as chapter-only.
  // e.g. "ps23" → Psalm 23 (verse 1), not Psalm 2 verse 3.
  if (asChapter <= maxChapters) {
    return { chapter: asChapter, verse: 1, provided: "chapter" };
  }

  // Fused: try splitting from the left, longest valid chapter prefix wins.
  // e.g. "john316" (max 21 ch): try ch=31 (>21 ✗), ch=3 (≤21 ✓) → verse=16
  for (let i = Math.min(digits.length - 1, 3); i >= 1; i--) {
    const chNum = parseInt(digits.slice(0, i), 10);
    if (chNum >= 1 && chNum <= maxChapters) {
      const verse = Math.max(1, parseInt(digits.slice(i), 10) || 1);
      return { chapter: chNum, verse, provided: "verse" };
    }
  }

  // Fallback: clamp to last chapter, verse 1
  return { chapter: maxChapters, verse: 1, provided: "chapter" };
}

export function getCanonicalBookName(bookCode: string): string {
  return canonicalBookNames[bookCode] || "";
}

/**
 * Convert canonical book name to filename format (remove spaces)
 * e.g., "1 Kings" → "1Kings", "Song of Solomon" → "SongofSolomon"
 */
function bookNameToFilename(bookName: string): string {
  return bookName.replace(/\s+/g, "");
}

export function formatYouVersionReference(reference: BibleReference): string {
  if (!reference.verses || reference.verses.length === 0) {
    return `${reference.bookCode}.${reference.chapter}`;
  }
  return `${reference.bookCode}.${reference.chapter}.${reference.verses.join(",")}`;
}

// ─── YouVersion-powered fetch functions via Supabase Edge Function ──────────
// import { supabase } from "../lib/supabase";
// import { db } from "../lib/db";

export const curatedVersions = [
  {
    id: "1",
    name: "King James Version",
    abbreviation: "KJV",
    language: "English",
  },
  { id: "2533", name: "Bibeli Mimo", abbreviation: "BM", language: "Yoruba" },
  // Commented out for offline version - only local files available
  // {
  //   id: "nlt",
  //   name: "New Living Translation",
  //   abbreviation: "NLT",
  //   language: "English",
  // },
  // {
  //   id: "63097d2a0a2f7db3-01",
  //   name: "New King James Version",
  //   abbreviation: "NKJV",
  //   language: "English",
  // },
  // {
  //   id: "78a9f6124f344018-01",
  //   name: "New International Version",
  //   abbreviation: "NIV",
  //   language: "English",
  // },
  // {
  //   id: "a81b73293d3080c9-01",
  //   name: "Amplified Bible",
  //   abbreviation: "AMP",
  //   language: "English",
  // },
  // {
  //   id: "bsb",
  //   name: "Berean Standard Bible",
  //   abbreviation: "BSB",
  //   language: "English",
  // },
  // {
  //   id: "web",
  //   name: "World English Bible",
  //   abbreviation: "WEB",
  //   language: "English",
  // },
  // {
  //   id: "asv",
  //   name: "American Standard Version",
  //   abbreviation: "ASV",
  //   language: "English",
  // },
];

// IDs whose text is natively stored in local JSON files
// const LOCAL_NATIVE_VERSION_IDS = new Set(["1", "2533"]); // KJV, Bibeli Mimo (offline version) - unused in offline version

/**
 * Utility to wrap promises with a timeout
 */
// async function fetchWithTimeout<T>(
//   promise: Promise<T>,
//   timeoutMs: number,
//   errorMessage: string = "Request timed out",
// ): Promise<T> {
//   let timerId: ReturnType<typeof setTimeout>;
//   const timeoutPromise = new Promise<never>((_, reject) => {
//     timerId = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
//   });
//   return Promise.race([promise, timeoutPromise]).finally(() =>
//     clearTimeout(timerId),
//   );
// }

// (Removed BibleBrain fallback)
/**
 * Local JSON file fetching for offline version.
 * Reads Bible data from local JSON files in public directory.
 */
async function fetchLocalFile(
  versionId: string,
  reference: BibleReference,
): Promise<string> {
  // Map version ID to directory
  const directory = versionId === "2533" ? "Bible-yoruba" : "Bible-kjv";
  
  // Map book code to filename using canonical book names
  const bookName = getCanonicalBookName(reference.bookCode);
  console.log(`[fetchLocalFile] bookCode: ${reference.bookCode}, bookName: ${bookName}`);
  if (!bookName) {
    throw new Error(`Unknown book code: ${reference.bookCode}`);
  }
  
  // Convert canonical name to filename format (remove spaces)
  const filename = `${bookNameToFilename(bookName)}.json`;
  const url = `/${directory}/${filename}`;
  console.log(`[fetchLocalFile] URL: ${url}`);
  
  try {
    const response = await fetch(url);
    console.log(`[fetchLocalFile] Response status: ${response.status}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[fetchLocalFile] Data loaded, chapters count: ${data.chapters?.length}`);
    
    // Find the requested chapter
    const chapter = data.chapters?.find((ch: any) => ch.chapter === reference.chapter.toString());
    console.log(`[fetchLocalFile] Looking for chapter ${reference.chapter}, found:`, chapter ? 'yes' : 'no');
    if (!chapter) {
      throw new Error(`Chapter ${reference.chapter} not found in ${bookName}`);
    }
    
    console.log(`[fetchLocalFile] Chapter verses count: ${chapter.verses?.length}`);
    console.log(`[fetchLocalFile] Requested verses: ${reference.verses}`);
    
    // Filter verses if specific verses requested, otherwise return all
    let versesToReturn: any[] = [];
    if (reference.verses && reference.verses.length > 0) {
      versesToReturn = chapter.verses.filter((v: any) => 
        reference.verses.includes(parseInt(v.verse, 10))
      );
      console.log(`[fetchLocalFile] Filtered verses count: ${versesToReturn.length}`);
    } else {
      versesToReturn = chapter.verses;
    }
    
    if (versesToReturn.length === 0) {
      throw new Error(`No verses found for ${bookName} ${reference.chapter}`);
    }
    
    // Format verses with verse number markers
    const result = versesToReturn
      .map((v: any) => `{{v:${parseInt(v.verse, 10)}}} ${v.text.trim()}`)
      .join(" ");
    console.log(`[fetchLocalFile] Success, result length: ${result.length}`);
    return result;
  } catch (error) {
    console.error(`[fetchLocalFile] Error:`, error);
    throw new Error(`Failed to fetch from local file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Tier 1 (Primary for KJV/BM): Supabase `verses` table.
 * Always serves KJV for English requests, BM for Yoruba requests.
 * Zero external dependencies — works offline.
 * COMMENTED OUT FOR OFFLINE VERSION
 */
// async function fetchLocalFallback(
//   versionId: string,
//   reference: BibleReference,
// ): Promise<string> {
//   let translationCode = "kjv";
//   if (versionId === "2533") translationCode = "yor";
//   else if (versionId === "asv") translationCode = "asv";
//   else if (versionId === "bsb") translationCode = "bsb";
//   else if (versionId === "web") translationCode = "web";

//   let query = supabase
//     .from("verses")
//     .select("verse, text")
//     .eq("translation", translationCode)
//     .eq("book_code", reference.bookCode)
//     .eq("chapter", reference.chapter);

//   if (reference.verses && reference.verses.length > 0) {
//     query = query.in("verse", reference.verses);
//   }

//   const { data, error } = await query.order("verse", { ascending: true });

//   if (error) throw new Error("Fallback failed: " + error.message);
//   if (!data || data.length === 0)
//     throw new Error("Verse not found in local fallback database.");

//   return data
//     .map(
//       (row: { verse: number; text: string }) =>
//         `{{v:${row.verse}}} ${row.text.trim()}`,
//     )
//     .join(" ");
// }

export type TriageCategory =
  | "client_network"
  | "third_party_outage"
  | "internal_error"
  | "user_input"
  | null;

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

export async function fetchVerse(
  versionId: string,
  query: string,
): Promise<{
  text: string;
  source: "api.bible" | "local" | "nlt";
  triageReason: TriageCategory;
  fums?: string;
}> {
  const reference = parseReference(query);
  if (!reference) throw new Error("Unable to parse reference.");

  const formattedRef = formatYouVersionReference(reference);

  // COMMENTED OUT: IndexedDB caching for offline version
  // const cacheKey = `sb_${versionId}_${formattedRef}`;
  // const canonicalBook = getCanonicalBookName(reference.bookCode);
  // const chapterRef = `${reference.bookCode}.${reference.chapter}`;
  // const nltChapterRef = `${canonicalBook}.${reference.chapter}`;
  // const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  // COMMENTED OUT: IndexedDB verse cache check
  // try {
  //   const cached = await db.verses.get(cacheKey);
  //   if (cached) {
  //     if (Date.now() - cached.timestamp > THIRTY_DAYS_MS) {
  //       await db.verses.delete(cacheKey);
  //     } else {
  //       const isValidText =
  //         cached.content &&
  //         cached.content !== "Text not found" &&
  //         cached.content !== "Verse not found.";
  //       if (isValidText && cached.source) {
  //         console.log(`[Cache] Serving Verse: ${formattedRef} (${versionId})`);
  //         return {
  //           text: cached.content,
  //           source: cached.source,
  //           triageReason: null,
  //           fums: undefined,
  //         };
  //       } else {
  //         await db.verses.delete(cacheKey);
  //       }
  //     }
  //   }
  // } catch (err) {
  //   console.warn("IndexedDB verse cache read failed:", err);
  // }

  // COMMENTED OUT: IndexedDB chapter cache check
  // if (!isWholeChapter && !LOCAL_NATIVE_VERSION_IDS.has(versionId.toString())) {
  //   try {
  //     const chapterCacheKey = `sb_chap_${versionId}_${chapterRef}`;
  //     const cachedChapter = await db.chapters.get(chapterCacheKey);
  //     if (cachedChapter) {
  //       if (Date.now() - cachedChapter.timestamp > THIRTY_DAYS_MS) {
  //         await db.chapters.delete(chapterCacheKey);
  //       } else {
  //         const isValidText =
  //           cachedChapter.content && cachedChapter.content !== "Text not found";
  //         if (isValidText && cachedChapter.source) {
  //           console.log(
  //             `[Cache] Serving Chapter slice: ${formattedRef} (${versionId})`,
  //           );
  //           let slicedText = "";
  //           const verseMatches = cachedChapter.content.match(
  //             /\{\{v:\d+\}\}.*?(?=\{\{v:\d+\}\}|$)/gs,
  //           );
  //           if (verseMatches) {
  //             const selectedVerses = verseMatches.filter((match: string) => {
  //               const vNumMatch = match.match(/\{\{v:(\d+)\}\}/);
  //               if (vNumMatch) {
  //                 const vNum = parseInt(vNumMatch[1], 10);
  //                 return reference.verses.includes(vNum);
  //               }
  //               return false;
  //             });
  //             if (selectedVerses.length > 0) {
  //               slicedText = selectedVerses.join(" ").trim();
  //               try {
  //                 await db.verses.put({
  //                   id: cacheKey,
  //                   versionId: versionId,
  //                   reference: formattedRef,
  //                   content: slicedText,
  //                   source: cachedChapter.source,
  //                   timestamp: Date.now(),
  //                 });
  //               } catch (e) {}
  //               return {
  //                 text: slicedText,
  //                 source: cachedChapter.source,
  //                 triageReason: null,
  //                 fums: undefined,
  //               };
  //             } else {
  //               throw new Error("Requested verse(s) not found in chapter.");
  //             }
  //           } else {
  //             throw new ParseError("Cached chapter could not be sliced.");
  //           }
  //         }
  //       }
  //     }
  //   } catch (err) {
  //     console.warn("IndexedDB chapter cache read failed:", err);
  //   }
  // }

  let verseText = "";
  let currentSource: "api.bible" | "local" | "nlt" = "local";
  let currentTriage: TriageCategory = null;

  // ── Local File Fetching (Offline Version) ──────────────
  try {
    console.log(`[Local File] Fetching: ${formattedRef} (${versionId})`);
    verseText = await fetchLocalFile(versionId, reference);
    currentSource = "local";
    currentTriage = null;
  } catch (err: unknown) {
    console.error("Local file fetch error:", err);
    currentTriage = "internal_error";
    throw new Error(`Local file fetch failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // COMMENTED OUT: API.Bible via Supabase Edge Function
  // else {
  //   console.warn(`[Tier 2] API.Bible: ${formattedRef} (${versionId})`);
  //   try {
  //     const invokePromise = supabase.functions.invoke("fetch-verse", {
  //       body: {
  //         action: "fetch_verse",
  //         reference: chapterRef,
  //         versionId: versionId,
  //         nltRef: nltChapterRef,
  //       },
  //     });
  //     const { data, error } = await fetchWithTimeout(
  //       invokePromise,
  //       6000,
  //       "Failed to fetch (timeout)",
  //     );

  //     if (error || data?.error) {
  //       if (error?.message?.toLowerCase().includes("failed to fetch"))
  //         currentTriage = "client_network";
  //       else currentTriage = "third_party_outage";
  //       throw new Error(data?.error || "API.Bible fetch failed");
  //     }

  //     let fullChapterText = data.text;
  //     if (data.fums) {
  //       fumsData = data.fums;
  //     }
  //     if (!fullChapterText || fullChapterText === "Text not found") {
  //       currentTriage = "user_input";
  //       throw new Error("Verse not found.");
  //     }

  //     try {
  //       await db.chapters.put({
  //         id: `sb_chap_${versionId}_${chapterRef}`,
  //         versionId: versionId,
  //         reference: chapterRef,
  //         content: fullChapterText,
  //         source: versionId === "nlt" ? "nlt" : "api.bible",
  //         timestamp: Date.now(),
  //       });
  //     } catch (err) {}

  //     if (!isWholeChapter) {
  //       const verseMatches = fullChapterText.match(
  //         /\{\{v:\d+\}\}.*?(?=\{\{v:\d+\}\}|$)/gs,
  //       );
  //       if (verseMatches) {
  //         const selectedVerses = verseMatches.filter((match: string) => {
  //           const vNumMatch = match.match(/\{\{v:(\d+)\}\}/);
  //           if (vNumMatch) {
  //             const vNum = parseInt(vNumMatch[1], 10);
  //             return reference.verses.includes(vNum);
  //           }
  //           return false;
  //         });
  //         if (selectedVerses.length > 0) {
  //           verseText = selectedVerses.join(" ").trim();
  //         } else {
  //           currentTriage = "user_input";
  //           throw new Error("Requested verse(s) not found in chapter.");
  //         }
  //       } else {
  //         throw new ParseError("Cached chapter could not be sliced.");
  //       }
  //     } else {
  //       verseText = fullChapterText;
  //     }

  //     currentSource = versionId === "nlt" ? "nlt" : "api.bible";
  //     currentTriage = null;
  //   } catch (apiErr: unknown) {
  //     if (
  //       apiErr instanceof Error &&
  //       apiErr.message?.toLowerCase().includes("failed to fetch")
  //     )
  //       currentTriage = "client_network";
  //     else if (!currentTriage) currentTriage = "internal_error";
  //     throw apiErr;
  //   }
  // }

  const result = {
    text: verseText,
    source: currentSource,
    triageReason: currentTriage,
    fums: undefined,
  };

  // COMMENTED OUT: IndexedDB cache write
  // if (
  //   verseText &&
  //   verseText !== "Text not found" &&
  //   verseText !== "Verse not found."
  // ) {
  //   try {
  //     await db.verses.put({
  //       id: cacheKey,
  //       versionId: versionId,
  //       reference: formattedRef,
  //       content: verseText,
  //       source: currentSource,
  //       fums: fumsData,
  //       timestamp: Date.now(),
  //     });
  //   } catch (err) {
  //     console.warn("IndexedDB cache write failed:", err);
  //   }
  // }
  
  return result;
}
