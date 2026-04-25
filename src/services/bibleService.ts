export interface BibleReference {
  bookCode: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
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
  
  // Matches book name (letters, optional leading 1/2/3) and trailing numbers/colons/hyphens
  const match = normalizedQuery.match(/^([123]?\s*[a-zA-Z\s]+?)\s*(\d[\d\s:\-]*?)?$/i);
  if (!match) return null;

  const bookName = match[1].trim();
  const bookCode = getBookCode(bookName);
  
  if (!bookCode) return null;

  const numberPart = match[2] ? match[2].trim() : "";
  
  let chapter = 1;
  let verseStart: number = 1;
  let verseEnd: number | undefined;

  if (numberPart) {
    // Clean up spaces around hyphens (e.g. "1 - 5" -> "1-5")
    const cleanNumbers = numberPart.replace(/\s*-\s*/g, "-");
    // Split by space or colon to separate chapter and verse (e.g. "1 5" or "1:5")
    const parts = cleanNumbers.split(/[\s:]+/);
    
    if (parts.length > 0 && parts[0]) {
      chapter = Number(parts[0]);
    }
    if (parts.length > 1 && parts[1]) {
      const vParts = parts[1].split("-");
      verseStart = Number(vParts[0]);
      if (vParts.length > 1 && vParts[1]) {
        verseEnd = Number(vParts[1]);
      }
    }
  }

  if (Number.isNaN(chapter) || Number.isNaN(verseStart)) return null;
  if (verseEnd !== undefined && Number.isNaN(verseEnd)) return null;

  return { bookCode, chapter, verseStart, verseEnd };
}

export function getCanonicalBookName(bookCode: string): string {
  return canonicalBookNames[bookCode] || "";
}

export function formatYouVersionReference(reference: BibleReference): string {
  if (!reference.verseStart) {
    return `${reference.bookCode}.${reference.chapter}`;
  }
  let refStr = `${reference.bookCode}.${reference.chapter}.${reference.verseStart}`;
  if (reference.verseEnd && reference.verseEnd !== reference.verseStart) {
    refStr += `-${reference.bookCode}.${reference.chapter}.${reference.verseEnd}`;
  }
  return refStr;
}

// ─── YouVersion-powered fetch functions via Supabase Edge Function ──────────
import { supabase } from '../lib/supabase';

export const curatedVersions = [
  { id: '1', name: 'King James Version', abbreviation: 'KJV', language: 'English', bibleBrainId: 'ENGKJVO2ET' },
  { id: '111', name: 'New International Version', abbreviation: 'NIV', language: 'English' }, // Exclusive to YV
  { id: '114', name: 'New King James Version', abbreviation: 'NKJV', language: 'English' }, // Exclusive to YV
  { id: '116', name: 'New Living Translation', abbreviation: 'NLT', language: 'English' }, // Exclusive to YV
  { id: '59', name: 'English Standard Version', abbreviation: 'ESV', language: 'English', bibleBrainId: 'ENGESVO2ET' },
  { id: '8', name: 'Amplified Bible', abbreviation: 'AMP', language: 'English' }, // Exclusive to YV
  { id: '97', name: 'The Message', abbreviation: 'MSG', language: 'English' }, // Exclusive to YV
  { id: '2079', name: 'Yoruba Contemporary Bible', abbreviation: 'YCB', language: 'Yoruba', bibleBrainId: 'YORBMZN2ET' },
  { id: '2533', name: 'Bibeli Mimo', abbreviation: 'BM', language: 'Yoruba', bibleBrainId: 'YORCBV' },
  { id: '206', name: 'World English Bible', abbreviation: 'WEB', language: 'English', bibleBrainId: 'ENGWEBO2ET' },
];

let circuitBreakerState: 'normal' | 'biblebrain_only' = 'normal';
let circuitBreakerResetTimer: any = null;

const BIBLE_BRAIN_KEY = 'fbc63a43-6c84-4861-b8d4-53106199480a';

function tripCircuitBreaker() {
  if (circuitBreakerState === 'biblebrain_only') return;
  console.warn("⚠️ Circuit Breaker Tripped: Switching to Bible Brain exclusively for 15 minutes.");
  circuitBreakerState = 'biblebrain_only';
  
  if (circuitBreakerResetTimer) clearTimeout(circuitBreakerResetTimer);
  
  circuitBreakerResetTimer = setTimeout(() => {
    console.log("🔄 Circuit Breaker Reset: Attempting YouVersion again.");
    circuitBreakerState = 'normal';
  }, 15 * 60 * 1000); // 15 minutes
}

/**
 * Utility to wrap promises with a timeout
 */
async function fetchWithTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string = 'Request timed out'): Promise<T> {
  let timerId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timerId));
}

/**
 * Secondary Fallback Mechanism (Tier 2)
 * Queries Faith Comes By Hearing's Bible Brain API.
 */
async function fetchBibleBrainFallback(versionId: string, reference: BibleReference): Promise<string> {
  const version = curatedVersions.find(v => v.id === versionId);
  if (!version || !version.bibleBrainId) {
    throw new Error(`Bible Brain ID not mapped for YouVersion ID: ${versionId}`);
  }

  const verseEndStr = reference.verseEnd ? `&verse_end=${reference.verseEnd}` : `&verse_end=${reference.verseStart}`;
  const url = `https://4.dbt.io/api/bibles/filesets/${version.bibleBrainId}/verses?book_id=${reference.bookCode}&chapter=${reference.chapter}&verse_start=${reference.verseStart}${verseEndStr}&key=${BIBLE_BRAIN_KEY}&v=4`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  let res;
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch (e: any) {
    if (e.name === 'AbortError') throw new Error('Failed to fetch (timeout)');
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    throw new Error(`Bible Brain API returned ${res.status}: ${await res.text()}`);
  }
  
  const data = await res.json();
  if (!data.data || data.data.length === 0) {
    throw new Error("Bible Brain returned empty data");
  }
  
  return data.data.map((v: any) => v.verse_text).join(' ').trim();
}

/**
 * Tertiary Fallback Mechanism (Tier 3)
 * Queries the static Supabase `verses` table (KJV & Yoruba).
 */
async function fetchLocalFallback(versionId: string, reference: BibleReference): Promise<string> {
  const isYoruba = ['2079', '2533'].includes(versionId.toString());
  const translationCode = isYoruba ? 'yor' : 'kjv';
  
  const verseEnd = reference.verseEnd ?? reference.verseStart;

  const { data, error } = await supabase
    .from('verses')
    .select('verse, text')
    .eq('translation', translationCode)
    .eq('book_code', reference.bookCode)
    .eq('chapter', reference.chapter)
    .gte('verse', reference.verseStart)
    .lte('verse', verseEnd)
    .order('verse', { ascending: true });

  if (error) throw new Error("Fallback failed: " + error.message);
  if (!data || data.length === 0) throw new Error("Verse not found in local fallback database.");

  return data.map((row: { verse: number; text: string }) => row.text.trim()).join(' ');
}

export type TriageCategory = 'client_network' | 'third_party_outage' | 'internal_error' | 'user_input' | null;

export async function fetchVerse(versionId: string, query: string): Promise<{ text: string, source: 'youversion' | 'biblebrain' | 'local', triageReason: TriageCategory }> {
  const reference = parseReference(query);
  if (!reference) throw new Error("Unable to parse reference.");

  const yvRef = formatYouVersionReference(reference);
  const cacheKey = `yv_${versionId}_${yvRef}`;

  // 1. Check Local Cache
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
       const parsed = JSON.parse(cached);
       if (parsed.text && parsed.source) {
          console.log(`[Tier 1] Serving from local cache: ${yvRef} (${versionId})`);
          return parsed;
       }
    } catch(e) {
       // Legacy cache was just string, ignore and refetch
    }
  }

  // 2. Multi-Tier Waterfall Query
  let verseText = "";
  let currentSource: 'youversion' | 'biblebrain' | 'local' = 'youversion';
  let currentTriage: TriageCategory = null;

  try {
    if (circuitBreakerState === 'biblebrain_only') {
       currentTriage = 'third_party_outage';
       throw new Error("Circuit breaker is tripped. Forcing fallback to Bible Brain.");
    }

    console.log(`[Tier 1] Fetching from Edge Function (YouVersion): ${yvRef} (${versionId})`);
    
    const invokePromise = supabase.functions.invoke('fetch-verse', {
      body: { action: 'fetch_verse', reference: yvRef, versionId: versionId }
    });

    // 6-second timeout for the primary fetch
    const { data, error } = await fetchWithTimeout(invokePromise, 6000, 'Failed to fetch (timeout)');

    if (error || data?.error) {
       // Check if it's a network connection issue vs an API outage
       if (error && error.message && error.message.toLowerCase().includes('failed to fetch')) {
          currentTriage = 'client_network';
       } else {
          currentTriage = 'third_party_outage';
          tripCircuitBreaker();
       }
       throw new Error("YouVersion fetch failed");
    }
    
    verseText = data.text;
    if (!verseText || verseText === "Text not found") {
        currentTriage = 'user_input';
        throw new Error("Verse not found.");
    }
    
    currentSource = 'youversion';
  } catch (err: any) {
    if (err.message && err.message.toLowerCase().includes('failed to fetch')) {
       currentTriage = 'client_network';
    }
    if (!currentTriage) currentTriage = 'internal_error';

    console.warn(`[Tier 2 Fallback] Attempting Bible Brain for ${yvRef} (${versionId})...`);
    try {
      verseText = await fetchBibleBrainFallback(versionId, reference);
      currentSource = 'biblebrain';
    } catch (bbErr: any) {
      if (bbErr.message && bbErr.message.toLowerCase().includes('failed to fetch')) {
         currentTriage = 'client_network';
      }

      console.warn(`[Tier 3 Fallback] Bible Brain unavailable. Querying Local DB for ${yvRef} (${versionId})...`);
      try {
        verseText = await fetchLocalFallback(versionId, reference);
        currentSource = 'local';
      } catch (localErr) {
        currentTriage = 'internal_error';
        throw localErr;
      }
    }
  }

  const result = { text: verseText, source: currentSource, triageReason: currentTriage };
  localStorage.setItem(cacheKey, JSON.stringify(result));
  return result;
}

export async function fetchAllYouVersionVersions() {
  const { data, error } = await supabase.functions.invoke('fetch-verse', {
    body: { action: 'fetch_versions' }
  });
  
  if (error || data?.error || data?.fault) {
    console.error("YouVersion API Error:", error || data);
    throw new Error("Failed to fetch extra versions. Check API Key permissions.");
  }
  
  // Ensure we return an array, handling various possible JSON structures
  let list = [];
  if (Array.isArray(data)) list = data;
  else if (data?.data && Array.isArray(data.data)) list = data.data;
  else if (data?.response?.data && Array.isArray(data.response.data)) list = data.response.data;
  
  return list;
}
