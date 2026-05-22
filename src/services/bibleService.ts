export interface BibleReference {
  bookCode: string;
  chapter: number;
  verses: number[];
}

const bibleBookMap: Record<string, string> = {
  // Genesis
  genesis: "GEN", gen: "GEN", gene: "GEN", ge: "GEN",
  // Exodus
  exodus: "EXO", exo: "EXO", ex: "EXO",
  // Leviticus
  leviticus: "LEV", lev: "LEV", le: "LEV",
  // Numbers
  numbers: "NUM", num: "NUM", no: "NUM", nm: "NUM",
  // Deuteronomy
  deuteronomy: "DEU", deut: "DEU", deu: "DEU", dt: "DEU",
  // Joshua
  joshua: "JOS", josh: "JOS", jos: "JOS", jo: "JOS",
  // Judges
  judges: "JDG", judg: "JDG", jdg: "JDG",
  // Ruth
  ruth: "RUT", ru: "RUT",
  // 1 Samuel
  "1 samuel": "1SA", "1samuel": "1SA", "1 sam": "1SA", "1sam": "1SA", "1 sa": "1SA", "1sa": "1SA",
  // 2 Samuel
  "2 samuel": "2SA", "2samuel": "2SA", "2 sam": "2SA", "2sam": "2SA", "2 sa": "2SA", "2sa": "2SA",
  // 1 Kings
  "1 kings": "1KI", "1kings": "1KI", "1 kin": "1KI", "1kin": "1KI", "1 ki": "1KI", "1ki": "1KI",
  // 2 Kings
  "2 kings": "2KI", "2kings": "2KI", "2 kin": "2KI", "2kin": "2KI", "2 ki": "2KI", "2ki": "2KI",
  // 1 Chronicles
  "1 chronicles": "1CH", "1chronicles": "1CH", "1 chr": "1CH", "1chr": "1CH", "1 ch": "1CH", "1ch": "1CH",
  // 2 Chronicles
  "2 chronicles": "2CH", "2chronicles": "2CH", "2 chr": "2CH", "2chr": "2CH", "2 ch": "2CH", "2ch": "2CH",
  // Ezra
  ezra: "EZR", ez: "EZR",
  // Nehemiah
  nehemiah: "NEH", neh: "NEH",
  // Esther
  esther: "EST", est: "EST",
  // Job
  job: "JOB", jb: "JOB",
  // Psalms
  psalms: "PSA", psalm: "PSA", psa: "PSA", ps: "PSA", psm: "PSA",
  // Proverbs
  proverbs: "PRO", prov: "PRO", pro: "PRO", pr: "PRO",
  // Ecclesiastes
  ecclesiastes: "ECC", eccl: "ECC", ecc: "ECC", ec: "ECC",
  // Song of Solomon
  "song of solomon": "SNG", "song of songs": "SNG", song: "SNG", sos: "SNG", "song solomon": "SNG",
  // Isaiah
  isaiah: "ISA", isa: "ISA", is: "ISA",
  // Jeremiah
  jeremiah: "JER", jer: "JER", je: "JER",
  // Lamentations
  lamentations: "LAM", lam: "LAM", la: "LAM",
  // Ezekiel
  ezekiel: "EZK", ezek: "EZK", ezk: "EZK",
  // Daniel
  daniel: "DAN", dan: "DAN", da: "DAN",
  // Hosea
  hosea: "HOS", hos: "HOS", ho: "HOS",
  // Joel
  joel: "JOL", jl: "JOL",
  // Amos
  amos: "AMO", am: "AMO",
  // Obadiah
  obadiah: "OBA", oba: "OBA",
  // Jonah
  jonah: "JON", jon: "JON", jona: "JON",
  // Micah
  micah: "MIC", mic: "MIC",
  // Nahum
  nahum: "NAM", nah: "NAM", na: "NAM",
  // Habakkuk
  habakkuk: "HAB", hab: "HAB",
  // Zephaniah
  zephaniah: "ZEP", zep: "ZEP",
  // Haggai
  haggai: "HAG", hag: "HAG",
  // Zechariah
  zechariah: "ZEC", zec: "ZEC",
  // Malachi
  malachi: "MAL", mal: "MAL",
  // Matthew
  matthew: "MAT", matt: "MAT", mat: "MAT", mt: "MAT",
  // Mark
  mark: "MRK", mrk: "MRK", mr: "MRK",
  // Luke
  luke: "LUK", luk: "LUK", lk: "LUK",
  // John
  john: "JHN", jhn: "JHN", jn: "JHN", joh: "JHN",
  // Acts
  acts: "ACT", act: "ACT", ac: "ACT",
  // Romans
  romans: "ROM", rom: "ROM", ro: "ROM",
  // 1 Corinthians
  "1 corinthians": "1CO", "1corinthians": "1CO", "1 cor": "1CO", "1cor": "1CO", "1 co": "1CO", "1co": "1CO", "1 corin": "1CO", "1corin": "1CO",
  // 2 Corinthians
  "2 corinthians": "2CO", "2corinthians": "2CO", "2 cor": "2CO", "2cor": "2CO", "2 co": "2CO", "2co": "2CO", "2 corin": "2CO", "2corin": "2CO",
  // Galatians
  galatians: "GAL", gal: "GAL", ga: "GAL",
  // Ephesians
  ephesians: "EPH", eph: "EPH", ep: "EPH",
  // Philippians
  philippians: "PHP", phil: "PHP", php: "PHP", ph: "PHP",
  // Colossians
  colossians: "COL", col: "COL", co: "COL",
  // 1 Thessalonians
  "1 thessalonians": "1TH", "1thessalonians": "1TH", "1 thess": "1TH", "1thess": "1TH", "1 th": "1TH", "1th": "1TH",
  // 2 Thessalonians
  "2 thessalonians": "2TH", "2thessalonians": "2TH", "2 thess": "2TH", "2thess": "2TH", "2 th": "2TH", "2th": "2TH",
  // 1 Timothy
  "1 timothy": "1TI", "1timothy": "1TI", "1 tim": "1TI", "1tim": "1TI", "1 ti": "1TI", "1ti": "1TI",
  // 2 Timothy
  "2 timothy": "2TI", "2timothy": "2TI", "2 tim": "2TI", "2tim": "2TI", "2 ti": "2TI", "2ti": "2TI",
  // Titus
  titus: "TIT", tit: "TIT",
  // Philemon
  philemon: "PHM", phm: "PHM",
  // Hebrews
  hebrews: "HEB", heb: "HEB", he: "HEB",
  // James
  james: "JAS", jas: "JAS", jm: "JAS",
  // 1 Peter
  "1 peter": "1PE", "1peter": "1PE", "1 pet": "1PE", "1pet": "1PE", "1 pe": "1PE", "1pe": "1PE",
  // 2 Peter
  "2 peter": "2PE", "2peter": "2PE", "2 pet": "2PE", "2pet": "2PE", "2 pe": "2PE", "2pe": "2PE",
  // 1 John
  "1 john": "1JN", "1john": "1JN", "1 jn": "1JN", "1jn": "1JN",
  // 2 John
  "2 john": "2JN", "2john": "2JN", "2 jn": "2JN", "2jn": "2JN",
  // 3 John
  "3 john": "3JN", "3john": "3JN", "3 jn": "3JN", "3jn": "3JN",
  // Jude
  jude: "JUD", jud: "JUD",
  // Revelation
  revelation: "REV", rev: "REV", re: "REV",
};

export const canonicalBookNames: Record<string, string> = {
  GEN: "Genesis", EXO: "Exodus", LEV: "Leviticus", NUM: "Numbers", DEU: "Deuteronomy",
  JOS: "Joshua", JDG: "Judges", RUT: "Ruth", "1SA": "1 Samuel", "2SA": "2 Samuel",
  "1KI": "1 Kings", "2KI": "2 Kings", "1CH": "1 Chronicles", "2CH": "2 Chronicles",
  EZR: "Ezra", NEH: "Nehemiah", EST: "Esther", JOB: "Job", PSA: "Psalms", PRO: "Proverbs",
  ECC: "Ecclesiastes", SNG: "Song of Solomon", ISA: "Isaiah", JER: "Jeremiah", LAM: "Lamentations",
  EZK: "Ezekiel", DAN: "Daniel", HOS: "Hosea", JOL: "Joel", AMO: "Amos", OBA: "Obadiah",
  JON: "Jonah", MIC: "Micah", NAM: "Nahum", HAB: "Habakkuk", ZEP: "Zephaniah", HAG: "Haggai",
  ZEC: "Zechariah", MAL: "Malachi", MAT: "Matthew", MRK: "Mark", LUK: "Luke", JHN: "John",
  ACT: "Acts", ROM: "Romans", "1CO": "1 Corinthians", "2CO": "2 Corinthians", GAL: "Galatians",
  EPH: "Ephesians", PHP: "Philippians", COL: "Colossians", "1TH": "1 Thessalonians",
  "2TH": "2 Thessalonians", "1TI": "1 Timothy", "2TI": "2 Timothy", TIT: "Titus", PHM: "Philemon",
  HEB: "Hebrews", JAS: "James", "1PE": "1 Peter", "2PE": "2 Peter", "1JN": "1 John",
  "2JN": "2 John", "3JN": "3 John", JUD: "Jude", REV: "Revelation",
};

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
}

function getBookCode(bookName: string): string | null {
  const normalized = normalizeName(bookName);
  if (bibleBookMap[normalized]) return bibleBookMap[normalized];

  let bestMatch: string | null = null;
  let bestLength = 0;
  for (const alias in bibleBookMap) {
    if (alias.startsWith(normalized) && normalized.length > bestLength) {
      bestMatch = bibleBookMap[alias];
      bestLength = normalized.length;
    }
  }
  return bestMatch;
}

export function parseReference(query: string): BibleReference | null {
  const normalizedQuery = query.trim().replace(/\s+/g, " ");
  
  // Matches book name (letters, optional leading 1/2/3) and trailing numbers/colons/hyphens/commas
  const match = normalizedQuery.match(/^([123]?\s*[a-zA-Z\s]+?)\s*(\d[\d\s:,\-]*?)?$/i);
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
          const rangeParts = cleanGroup.split("-").map(s => Number(s.trim()));
          if (rangeParts.length === 2 && !Number.isNaN(rangeParts[0]) && !Number.isNaN(rangeParts[1])) {
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

export function getCanonicalBookName(bookCode: string): string {
  return canonicalBookNames[bookCode] || "";
}

export function formatYouVersionReference(reference: BibleReference): string {
  if (!reference.verses || reference.verses.length === 0) {
    return `${reference.bookCode}.${reference.chapter}`;
  }
  return `${reference.bookCode}.${reference.chapter}.${reference.verses.join(',')}`;
}

// ─── YouVersion-powered fetch functions via Supabase Edge Function ──────────
import { supabase } from '../lib/supabase';
import { db } from '../lib/db';

export const curatedVersions = [
  { id: 'nlt', name: 'New Living Translation', abbreviation: 'NLT', language: 'English' },
  { id: '63097d2a0a2f7db3-01', name: 'New King James Version', abbreviation: 'NKJV', language: 'English' },
  { id: '78a9f6124f344018-01', name: 'New International Version', abbreviation: 'NIV', language: 'English' },
  { id: 'a81b73293d3080c9-01', name: 'Amplified Bible', abbreviation: 'AMP', language: 'English' },
  { id: 'bsb', name: 'Berean Standard Bible', abbreviation: 'BSB', language: 'English' },
  { id: 'web', name: 'World English Bible', abbreviation: 'WEB', language: 'English' },
  { id: 'asv', name: 'American Standard Version', abbreviation: 'ASV', language: 'English' },
  { id: '1', name: 'King James Version', abbreviation: 'KJV', language: 'English' },
  { id: '2533', name: 'Bibeli Mimo', abbreviation: 'BM', language: 'Yoruba' },
];

// IDs whose text is natively stored in the local Supabase DB
const LOCAL_NATIVE_VERSION_IDS = new Set(['1', '2533', 'asv', 'bsb', 'web']); // KJV, Bibeli Mimo, ASV, BSB, WEB

/**
 * Utility to wrap promises with a timeout
 */
async function fetchWithTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string = 'Request timed out'): Promise<T> {
  let timerId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timerId));
}

// (Removed BibleBrain fallback)
/**
 * Tier 1 (Primary for KJV/BM): Supabase `verses` table.
 * Always serves KJV for English requests, BM for Yoruba requests.
 * Zero external dependencies — works offline.
 */
async function fetchLocalFallback(versionId: string, reference: BibleReference): Promise<string> {
  let translationCode = 'kjv';
  if (versionId === '2533') translationCode = 'yor';
  else if (versionId === 'asv') translationCode = 'asv';
  else if (versionId === 'bsb') translationCode = 'bsb';
  else if (versionId === 'web') translationCode = 'web';
  
  let query = supabase
    .from('verses')
    .select('verse, text')
    .eq('translation', translationCode)
    .eq('book_code', reference.bookCode)
    .eq('chapter', reference.chapter);

  if (reference.verses && reference.verses.length > 0) {
    query = query.in('verse', reference.verses);
  }

  const { data, error } = await query.order('verse', { ascending: true });

  if (error) throw new Error("Fallback failed: " + error.message);
  if (!data || data.length === 0) throw new Error("Verse not found in local fallback database.");

  return data.map((row: { verse: number; text: string }) => `{{v:${row.verse}}} ${row.text.trim()}`).join(' ');
}

export type TriageCategory = 'client_network' | 'third_party_outage' | 'internal_error' | 'user_input' | null;

export async function fetchVerse(versionId: string, query: string): Promise<{ text: string, source: 'api.bible' | 'local' | 'nlt', triageReason: TriageCategory }> {
  const reference = parseReference(query);
  if (!reference) throw new Error("Unable to parse reference.");

  // For API.Bible, the format is usually BOOK.CHAPTER.VERSE, identical to YouVersion.
  const formattedRef = formatYouVersionReference(reference);
  const cacheKey = `sb_${versionId}_${formattedRef}`;
  
  const canonicalBook = getCanonicalBookName(reference.bookCode);
  const isWholeChapter = !reference.verses || reference.verses.length === 0;
  
  // Create an edge-function friendly chapter reference
  const chapterRef = `${reference.bookCode}.${reference.chapter}`;
  const nltChapterRef = `${canonicalBook}.${reference.chapter}`;

  // Check client-side cache (IndexedDB)
  try {
    const cached = await db.verses.get(cacheKey);
    if (cached) {
      const isValidText = cached.content && cached.content !== "Text not found" && cached.content !== "Verse not found.";
      if (isValidText && cached.source) {
        console.log(`[Cache] Serving: ${formattedRef} (${versionId})`);
        return { text: cached.content, source: cached.source, triageReason: null };
      } else {
        await db.verses.delete(cacheKey);
      }
    }
  } catch (err) {
    console.warn("IndexedDB cache read failed:", err);
  }

  let verseText = "";
  let currentSource: 'api.bible' | 'local' | 'nlt' = 'local';
  let currentTriage: TriageCategory = null;
  const isNativeLocal = LOCAL_NATIVE_VERSION_IDS.has(versionId.toString());

  if (isNativeLocal) {
    // ── Tier 1: Supabase Local DB (KJV / BM) ──────────────
    try {
      console.log(`[Tier 1] Local DB: ${formattedRef} (${versionId})`);
      verseText = await fetchLocalFallback(versionId, reference);
      currentSource = 'local';
    } catch (err: unknown) {
      console.error("Local fallback error:", err);
      currentTriage = 'internal_error';
      throw new Error("Local DB fetch failed");
    }
  } else {
    // ── Tier 2: API.Bible via Supabase Edge Function ──────────────
    console.warn(`[Tier 2] API.Bible: ${formattedRef} (${versionId})`);
    try {
      const invokePromise = supabase.functions.invoke('fetch-verse', {
        body: { action: 'fetch_verse', reference: chapterRef, versionId: versionId, nltRef: nltChapterRef }
      });
      const { data, error } = await fetchWithTimeout(invokePromise, 6000, 'Failed to fetch (timeout)');

      if (error || data?.error) {
        if (error?.message?.toLowerCase().includes('failed to fetch')) currentTriage = 'client_network';
        else currentTriage = 'third_party_outage';
        throw new Error(data?.error || "API.Bible fetch failed");
      }

      let fullChapterText = data.text;
      if (!fullChapterText || fullChapterText === "Text not found") {
        currentTriage = 'user_input';
        throw new Error("Verse not found.");
      }
      
      // Slicing logic: extract only requested verses if verses array is provided
      if (!isWholeChapter) {
        const verseMatches = fullChapterText.match(/\{\{v:\d+\}\}.*?(?=\{\{v:\d+\}\}|$)/gs);
        if (verseMatches) {
          const selectedVerses = verseMatches.filter((match: string) => {
            const vNumMatch = match.match(/\{\{v:(\d+)\}\}/);
            if (vNumMatch) {
              const vNum = parseInt(vNumMatch[1], 10);
              return reference.verses.includes(vNum);
            }
            return false;
          });
          if (selectedVerses.length > 0) {
            verseText = selectedVerses.join(' ').trim();
          } else {
            currentTriage = 'user_input';
            throw new Error("Requested verse(s) not found in chapter.");
          }
        } else {
          // If the regex slice fails but we have text, we just fallback to full text
          verseText = fullChapterText;
        }
      } else {
        verseText = fullChapterText;
      }
      
      currentSource = versionId === 'nlt' ? 'nlt' : 'api.bible';
      currentTriage = null;
    } catch (apiErr: unknown) {
      if (apiErr instanceof Error && apiErr.message?.toLowerCase().includes('failed to fetch')) currentTriage = 'client_network';
      else if (!currentTriage) currentTriage = 'internal_error';
      throw apiErr;
    }
  }

  const result = { text: verseText, source: currentSource, triageReason: currentTriage };
  // Only cache a genuine successful response — never cache errors or empty text
  if (verseText && verseText !== "Text not found" && verseText !== "Verse not found.") {
    try {
      await db.verses.put({
        id: cacheKey,
        versionId: versionId,
        reference: formattedRef,
        content: verseText,
        source: currentSource,
        timestamp: Date.now()
      });
    } catch (err) {
      console.warn("IndexedDB cache write failed:", err);
    }
  }
  return result;
}
