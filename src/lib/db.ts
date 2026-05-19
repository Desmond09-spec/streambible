import Dexie, { type Table } from 'dexie';

export interface CachedVerse {
  id: string; // Composite key: versionId_reference (e.g., "niv_John 3:16")
  versionId: string;
  reference: string;
  content: string; // The fetched HTML or pure text
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
  setlists!: Table<Setlist>;

  constructor() {
    super('StreamBibleDB');
    this.version(1).stores({
      verses: 'id, versionId, reference', // Primary key and indexes
      setlists: 'id, date'
    });
  }
}

export const db = new StreamBibleDB();
