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
  if (bibleBookMap[normalized]) {
    return bibleBookMap[normalized];
  }

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
  const splitIndex = normalizedQuery.lastIndexOf(" ");
  if (splitIndex === -1) return null;

  const bookName = normalizedQuery.slice(0, splitIndex);
  const chapterVerse = normalizedQuery.slice(splitIndex + 1);
  const [chapterText, verseText] = chapterVerse.split(":");
  const bookCode = getBookCode(bookName);
  const chapter = Number(chapterText);
  
  if (!bookCode || Number.isNaN(chapter)) return null;

  let verseStart: number | undefined;
  let verseEnd: number | undefined;
  
  if (verseText) {
    const rangeParts = verseText.split("-").map((value) => Number(value));
    if (rangeParts.some((value) => Number.isNaN(value))) return null;
    verseStart = rangeParts[0];
    verseEnd = rangeParts.length === 2 ? rangeParts[1] : verseStart;
  }

  return {
    bookCode,
    chapter,
    verseStart,
    verseEnd,
  };
}

export function getCanonicalBookName(bookCode: string): string {
  return canonicalBookNames[bookCode] || "";
}

/**
 * Fetch English Verse from Bible-api.com
 */
export async function fetchEnglishVerse(query: string): Promise<string> {
  const reference = parseReference(query);
  if (!reference) throw new Error("Unable to parse reference.");

  let urlQuery = `${canonicalBookNames[reference.bookCode]} ${reference.chapter}`;
  if (reference.verseStart) {
    urlQuery += `:${reference.verseStart}`;
    if (reference.verseEnd && reference.verseEnd !== reference.verseStart) {
      urlQuery += `-${reference.verseEnd}`;
    }
  }

  const res = await fetch(`https://bible-api.com/${encodeURIComponent(urlQuery)}`);
  if (!res.ok) {
    throw new Error("English verse not found.");
  }
  const data = await res.json();
  
  // Format the text by replacing newlines and trimming
  let text = data.text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  return text;
}

/**
 * Fetch Yoruba Verse from helloao.org
 */
export async function fetchYorubaVerse(query: string): Promise<string> {
  const reference = parseReference(query);
  if (!reference) throw new Error("Unable to parse Yoruba reference.");

  // HelloAO uses standard book codes (GEN, EXO) for Yoruba API
  const bookCode = reference.bookCode;
  const chapter = reference.chapter;
  let versesToFetch = [];

  if (reference.verseStart) {
    const end = reference.verseEnd ?? reference.verseStart;
    for (let i = reference.verseStart; i <= end; i++) {
      versesToFetch.push(i);
    }
  } else {
    // If no verse specified, throw error or handle chapter fetch
    throw new Error("Please specify a verse for Yoruba translation.");
  }

  try {
    const fetchPromises = versesToFetch.map(async (v) => {
      const res = await fetch(`https://helloao.org/api/available_translations/yor_bib/books/${bookCode}/chapters/${chapter}/verses/${v}.json`);
      if (!res.ok) throw new Error("Verse not found");
      const data = await res.json();
      return data.content || data.text || "";
    });

    const results = await Promise.all(fetchPromises);
    const combined = results.map(r => r.replace(/\n/g, " ").trim()).join(" ");
    
    if (!combined) throw new Error("Yoruba verse not found.");
    return combined;
  } catch (error) {
    throw new Error("Failed to fetch Yoruba translation.");
  }
}
