/**
 * bibleStore.ts
 *
 * In-memory Bible store for StreamBible's real-time preview path.
 *
 * All book JSON files for each active translation are fetched once at startup
 * and held in a nested Map. After loading, every verse lookup is synchronous
 * and O(1) — no I/O, no async, no debounce needed per keystroke.
 *
 * Architecture:
 *   Map<versionId, Map<bookCode, Map<chapter, Map<verse, text>>>>
 */

import { canonicalBookNames } from "./bibleService";

// ─── Types ────────────────────────────────────────────────────────────────────

/** chapter number → verse number → verse text */
type ChapterMap = Map<number, Map<number, string>>;

/** bookCode → chapters */
type BookMap = Map<string, ChapterMap>;

/** versionId → books */
type VersionStore = Map<string, BookMap>;

// ─── Directory mapping ────────────────────────────────────────────────────────

function getDirectory(versionId: string): string {
  return versionId === "2533" ? "Bible-yoruba" : "Bible-kjv";
}

function bookNameToFilename(bookName: string): string {
  return bookName.replace(/\s+/g, "");
}

// ─── Module-level singleton state ─────────────────────────────────────────────

const store: VersionStore = new Map();
let _isLoaded = false;
let _loadPromise: Promise<void> | null = null;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Load all Bible books for the given version IDs into memory.
 * Safe to call multiple times — subsequent calls return the same promise.
 */
export async function loadBibleStore(versionIds: string[]): Promise<void> {
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    for (const versionId of versionIds) {
      const versionStore: BookMap = new Map();
      const directory = getDirectory(versionId);

      for (const [bookCode, bookName] of Object.entries(canonicalBookNames)) {
        const filename = bookNameToFilename(bookName);
        // Force relative path. In Electron, absolute paths (like /Bible-kjv...) resolve to the root of the C: drive.
        // Relative paths (./Bible-kjv...) correctly resolve relative to the dist/index.html file!
        const url = `./${directory}/${filename}.json`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            console.warn(`[BibleStore] ${url} → ${response.status}`);
            continue;
          }

          const data = await response.json();
          const chapterMap: ChapterMap = new Map();

          for (const ch of data.chapters ?? []) {
            const chNum = parseInt(ch.chapter, 10);
            if (Number.isNaN(chNum)) continue;

            const verseMap = new Map<number, string>();
            for (const v of ch.verses ?? []) {
              const vNum = parseInt(v.verse, 10);
              if (!Number.isNaN(vNum) && v.text) {
                verseMap.set(vNum, v.text.trim());
              }
            }
            chapterMap.set(chNum, verseMap);
          }

          versionStore.set(bookCode, chapterMap);
        } catch (err) {
          console.warn(`[BibleStore] Failed to load ${bookName} (${versionId}):`, err);
        }
      }

      store.set(versionId, versionStore);
    }

    _isLoaded = true;
  })();

  return _loadPromise;
}

/**
 * Returns true once loadBibleStore has completed for all requested versions.
 */
export function isBibleStoreLoaded(): boolean {
  return _isLoaded;
}

/**
 * Synchronous verse lookup. Returns formatted verse text or null.
 *
 * Chapter and verse are automatically clamped to valid ranges — the caller
 * never needs to validate bounds. If the reference is out of range, the
 * nearest valid verse is returned.
 *
 * Output format: `{{v:N}} Verse text here.`  (matches existing pipeline)
 */
export function getVerse(
  versionId: string,
  bookCode: string,
  chapter: number,
  verse: number,
): string | null {
  const versionStore = store.get(versionId);
  if (!versionStore) return null;

  const chapterMap = versionStore.get(bookCode);
  if (!chapterMap || chapterMap.size === 0) return null;

  // Clamp chapter
  const chapterNums = Array.from(chapterMap.keys());
  const maxChapter = Math.max(...chapterNums);
  const clampedChapter = Math.max(1, Math.min(chapter, maxChapter));

  const verseMap = chapterMap.get(clampedChapter);
  if (!verseMap || verseMap.size === 0) return null;

  // Clamp verse
  const verseNums = Array.from(verseMap.keys());
  const maxVerse = Math.max(...verseNums);
  const clampedVerse = Math.max(1, Math.min(verse, maxVerse));

  const text = verseMap.get(clampedVerse);
  if (!text) return null;

  return `{{v:${clampedVerse}}} ${text}`;
}

/**
 * Returns the maximum chapter number for a given book and version.
 * Returns 1 if the book is not loaded.
 */
export function getMaxChapter(versionId: string, bookCode: string): number {
  const chapterMap = store.get(versionId)?.get(bookCode);
  if (!chapterMap || chapterMap.size === 0) return 1;
  return Math.max(...chapterMap.keys());
}

/**
 * Returns the maximum verse number for a given chapter.
 * Returns 1 if the chapter is not loaded.
 */
export function getMaxVerse(
  versionId: string,
  bookCode: string,
  chapter: number,
): number {
  const verseMap = store.get(versionId)?.get(bookCode)?.get(chapter);
  if (!verseMap || verseMap.size === 0) return 1;
  return Math.max(...verseMap.keys());
}

/**
 * Returns the maximum verse number across ANY loaded version.
 * Useful for UI navigation when the specific version ID isn't directly available.
 */
export function getAnyMaxVerse(bookCode: string, chapter: number): number {
  let max = 1;
  for (const versionMap of store.values()) {
    const verseMap = versionMap.get(bookCode)?.get(chapter);
    if (verseMap && verseMap.size > 0) {
      max = Math.max(max, ...verseMap.keys());
    }
  }
  return max;
}
