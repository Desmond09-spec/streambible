import Dexie, { type Table } from 'dexie';

export interface CachedVerse {
  id: string; // Composite key: versionId_reference (e.g., "niv_John 3:16")
  versionId: string;
  reference: string;
  content: string; // The fetched HTML or pure text
  source: 'api.bible' | 'local' | 'nlt';
  fums?: string; // FUMS script payload for API.Bible
  timestamp: number;
}

export interface CachedChapter {
  id: string; // Composite key: versionId_chapterRef (e.g., "niv_GEN.3")
  versionId: string;
  reference: string; // The chapter ref
  content: string; // The raw fetched chapter HTML or text
  source: 'api.bible' | 'local' | 'nlt';
  timestamp: number;
}

export interface Setlist {
  id: string; // UUID or timestamp string
  name: string; // e.g., "Sunday Morning Service"
  date: string; // ISO date string
  verses: { versionId: string, reference: string, source: 'api.bible' | 'local' | 'nlt' }[];
}

export class StreamBibleDB extends Dexie {
  verses!: Table<CachedVerse>;
  chapters!: Table<CachedChapter>;
  setlists!: Table<Setlist>;

  constructor() {
    super('StreamBibleDB');
    this.version(2).stores({
      verses: 'id, versionId, reference', // Primary key and indexes
      chapters: 'id, versionId, reference',
      setlists: 'id, date'
    });
  }
}

export const db = new StreamBibleDB();
