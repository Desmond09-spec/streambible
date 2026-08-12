import React, { useRef, useState, useEffect, useLayoutEffect, useMemo } from "react";
import { List } from "lucide-react";
import {
  parseReferenceIncremental,
  parseVerseExpr,
  type ParsedReference,
  getBookCode,
  canonicalBookNames,
  bookChapterCounts,
} from "../../services/bibleService";
import { getAnyMaxVerse } from "../../services/bibleStore";

// ─── Props ────────────────────────────────────────────────────────────────────

interface SearchModuleProps {
  onReferenceResolved: (ref: ParsedReference) => void;
  onPushLive: () => void;
  onClear: () => void;
  externalQuery?: string;
  isSetlistOpen?: boolean;
  setIsSetlistOpen?: (val: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

type Block = "book" | "chapter" | "verse";

export const SearchModule: React.FC<SearchModuleProps> = ({
  onReferenceResolved,
  onPushLive,
  onClear,
  externalQuery,
  setIsSetlistOpen,
}) => {
  // ── State Machine Buffers ──
  const typedBook = useRef<string>("");
  const typedChapter = useRef<string>("");
  const typedVerse = useRef<string>("");
  const activeBlock = useRef<Block>("book");
  const blockSelected = useRef<boolean>(false);

  // ── Canonical Books Cache ──
  // Array of all canonical book names in Biblical order (Genesis -> Revelation)
  const canonicalBooksArray = useMemo(() => {
    return Object.values(canonicalBookNames);
  }, []);

  // ── UI State ──
  const [displayValue, setDisplayValue] = useState<string>("");
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Apply visual selection range
  useLayoutEffect(() => {
    if (selectionStart !== null && selectionEnd !== null && inputRef.current) {
      inputRef.current.setSelectionRange(selectionStart, selectionEnd);
    }
  }, [displayValue, selectionStart, selectionEnd]);

  // Main rendering/state calculation function
  const updateDisplay = () => {
    const bookCode = getBookCode(typedBook.current);
    const bookName = bookCode ? canonicalBookNames[bookCode] : "";

    if (!bookCode) {
      setDisplayValue(typedBook.current);
      setSelectionStart(typedBook.current.length);
      setSelectionEnd(typedBook.current.length);
      if (typedBook.current === "") {
        onClear();
      }
      return;
    }

    const maxChapters = bookChapterCounts[bookCode] ?? 1;
    let ch = parseInt(typedChapter.current) || 1;
    ch = Math.max(1, Math.min(ch, maxChapters));

    // Parse the verse expression: may be "1", "1-3", "1,3,5"
    const rawExpr = typedVerse.current || '1';
    const verses = parseVerseExpr(rawExpr);
    const firstVerse = verses[0] ?? 1;

    // Canonical always shows the first valid verse number; for multi-verse,
    // it shows the full expression (e.g. "Genesis 1:1-3")
    const verseDisplay = rawExpr.replace(/\s/g, '');
    const canonical = `${bookName} ${ch}:${verseDisplay}`;
    setDisplayValue(canonical);

    let start = 0;
    let end = 0;
    const chapterStart = bookName.length + 1;
    const verseStart = chapterStart + String(ch).length + 1;

    if (activeBlock.current === "book") {
      if (blockSelected.current) {
        start = 0;
        end = bookName.length;
      } else {
        start = Math.min(typedBook.current.length, bookName.length);
        end = bookName.length;
      }
    } else if (activeBlock.current === "chapter") {
      start = chapterStart;
      if (blockSelected.current) {
        end = start + String(ch).length;
      } else {
        start = start + typedChapter.current.length;
        end = start;
      }
    } else if (activeBlock.current === "verse") {
      if (blockSelected.current) {
        start = verseStart;
        end = canonical.length;
      } else {
        start = canonical.length;
        end = canonical.length;
      }
    }

    setSelectionStart(start);
    setSelectionEnd(end);

    onReferenceResolved({
      bookCode,
      chapter: ch,
      verse: firstVerse,
      verseExpr: verseDisplay,
      verses,
      canonical,
      selectionStart: start,
      selectionEnd: end
    });
  };

  // ── External query override ──
  useEffect(() => {
    if (!externalQuery?.trim()) return;

    const ref = parseReferenceIncremental(externalQuery);
    if (ref) {
      typedBook.current = canonicalBookNames[ref.bookCode] || ref.bookCode;
      typedChapter.current = String(ref.chapter);
      typedVerse.current = String(ref.verse);
      activeBlock.current = "verse";
      blockSelected.current = false;
      updateDisplay();
    }
    inputRef.current?.focus();
  }, [externalQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mouse Selection Handler ──
  const handleSelect = () => {
    setTimeout(() => {
      if (!inputRef.current) return;
      const start = inputRef.current.selectionStart;
      if (start === null) return;
      
      const bookCode = getBookCode(typedBook.current);
      if (!bookCode) return; 
      
      const bookName = canonicalBookNames[bookCode];
      const ch = Math.max(1, parseInt(typedChapter.current) || 1);
      
      const chapterStart = bookName.length + 1;
      const verseStart = chapterStart + String(ch).length + 1;
      
      let newBlock: Block = "book";
      if (start < chapterStart) {
        newBlock = "book";
      } else if (start < verseStart) {
        newBlock = "chapter";
      } else {
        newBlock = "verse";
      }

      if (activeBlock.current !== newBlock || !blockSelected.current) {
        activeBlock.current = newBlock;
        blockSelected.current = true;
        updateDisplay();
      }
    }, 0);
  };

  // ── Keyboard handler ──
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      typedBook.current = "";
      typedChapter.current = "";
      typedVerse.current = "";
      activeBlock.current = "book";
      blockSelected.current = false;
      updateDisplay();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (displayValue) {
        onPushLive();
      }
      return;
    }

    // ── Navigation: Left / Right ──
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      if (e.key === "ArrowLeft") {
        if (activeBlock.current === "verse") activeBlock.current = "chapter";
        else if (activeBlock.current === "chapter") activeBlock.current = "book";
        else if (activeBlock.current === "book") activeBlock.current = "verse";
      } else {
        if (activeBlock.current === "book") activeBlock.current = "chapter";
        else if (activeBlock.current === "chapter") activeBlock.current = "verse";
        else if (activeBlock.current === "verse") activeBlock.current = "book";
      }
      blockSelected.current = true;
      updateDisplay();
      return;
    }

    // ── Manipulation: Up / Down ──
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const isUp = e.key === "ArrowUp"; // Up = Decrement/Previous, Down = Increment/Next
      
      const bookCode = getBookCode(typedBook.current);
      const bookName = bookCode ? canonicalBookNames[bookCode] : "";

      if (activeBlock.current === "book") {
        // Find current book index in canonical list
        const currentIndex = canonicalBooksArray.indexOf(bookName);
        let nextIndex = 0;
        
        if (currentIndex !== -1) {
          if (isUp) {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : canonicalBooksArray.length - 1;
          } else {
            nextIndex = currentIndex < canonicalBooksArray.length - 1 ? currentIndex + 1 : 0;
          }
        }
        typedBook.current = canonicalBooksArray[nextIndex];
        blockSelected.current = true; // highlight new book entirely
        updateDisplay();
        return;
      }

      if (activeBlock.current === "chapter") {
        if (!bookCode) return;
        const maxChapters = bookChapterCounts[bookCode] ?? 1;
        let ch = parseInt(typedChapter.current) || 1;
        
        if (isUp) {
          ch = ch > 1 ? ch - 1 : maxChapters;
        } else {
          ch = ch < maxChapters ? ch + 1 : 1;
        }
        typedChapter.current = String(ch);
        blockSelected.current = true; // highlight new chapter entirely
        updateDisplay();
        return;
      }

      if (activeBlock.current === "verse") {
        // For simple single-verse, allow up/down to increment/decrement.
        // For multi-verse expressions (ranges/lists), don't modify.
        if (!typedVerse.current.includes('-') && !typedVerse.current.includes(',')) {
          const maxVerse = getAnyMaxVerse(bookCode, ch);
          let v = parseInt(typedVerse.current) || 1;
          if (isUp) {
            v = v > 1 ? v - 1 : maxVerse;
          } else {
            v = v < maxVerse ? v + 1 : 1;
          }
          typedVerse.current = String(v);
          blockSelected.current = true;
          updateDisplay();
        }
        return;
      }
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      if (activeBlock.current === "verse") {
        if (blockSelected.current) {
          if (typedVerse.current === "") {
            activeBlock.current = "chapter";
            blockSelected.current = true;
          } else {
            typedVerse.current = "";
          }
        } else {
          typedVerse.current = typedVerse.current.slice(0, -1);
          if (typedVerse.current === "") blockSelected.current = true;
        }
      } else if (activeBlock.current === "chapter") {
        if (blockSelected.current) {
          if (typedChapter.current === "") {
            activeBlock.current = "book";
            blockSelected.current = true;
          } else {
            typedChapter.current = "";
          }
        } else {
          typedChapter.current = typedChapter.current.slice(0, -1);
          if (typedChapter.current === "") blockSelected.current = true;
        }
      } else if (activeBlock.current === "book") {
        if (blockSelected.current) {
          typedBook.current = "";
          blockSelected.current = false;
        } else {
          typedBook.current = typedBook.current.slice(0, -1);
          if (typedBook.current === "") blockSelected.current = false;
        }
      }
      updateDisplay();
      return;
    }

    // Handle standard typing
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    const char = e.key;

    if (activeBlock.current === "book") {
      if (char === " " || char === ":") {
        activeBlock.current = "chapter";
        blockSelected.current = true;
        updateDisplay();
        return;
      }
      
      if (/\d/.test(char)) {
        const testBook = blockSelected.current ? char : typedBook.current + char;
        if (!getBookCode(testBook)) {
          activeBlock.current = "chapter";
          typedChapter.current = char;
          blockSelected.current = false;
          updateDisplay();
          return;
        }
      }
      
      const nextBook = blockSelected.current ? char : typedBook.current + char;
      if (getBookCode(nextBook) || nextBook.length <= 1) {
        typedBook.current = nextBook;
        blockSelected.current = false;
      }
      updateDisplay();
    } else if (activeBlock.current === "chapter") {
      if (char === " " || char === ":") {
        activeBlock.current = "verse";
        blockSelected.current = true;
        updateDisplay();
        return;
      }
      
      if (/\d/.test(char)) {
        typedChapter.current = blockSelected.current ? char : typedChapter.current + char;
        blockSelected.current = false;
        updateDisplay();
      }
    } else if (activeBlock.current === "verse") {
      // Allow digits, hyphen (for ranges), and comma (for lists)
      if (/[\d\-,]/.test(char)) {
        // Hyphen/comma only valid after at least one digit
        if ((char === '-' || char === ',') && typedVerse.current === '') return;
        typedVerse.current = blockSelected.current ? char : typedVerse.current + char;
        blockSelected.current = false;
        updateDisplay();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^\w\s:,\-]/g, "")
      .trim();
    if (!pasted) return;

    const ref = parseReferenceIncremental(pasted);
    if (ref) {
      typedBook.current = canonicalBookNames[ref.bookCode] || ref.bookCode;
      typedChapter.current = String(ref.chapter);
      // Preserve the verse expression from the paste if it contains range/list chars
      const verseMatch = pasted.match(/:([0-9,\-]+)\s*$/);
      typedVerse.current = verseMatch ? verseMatch[1] : String(ref.verse);
      activeBlock.current = "verse";
      blockSelected.current = false;
      updateDisplay();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div id="search-bar" className="search-bar">
      <span className="search-icon">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="6.5" cy="6.5" r="4" />
          <path d="M10 10L13.5 13.5" />
        </svg>
      </span>

      <input
        ref={inputRef}
        type="text"
        id="searchInput"
        placeholder="John 3:16 · Romans 8:28 · Psalms 23:1…"
        autoComplete="off"
        spellCheck={false}
        autoFocus
        value={displayValue}
        onChange={() => {}} 
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onClick={handleSelect}
        onMouseUp={handleSelect}
      />

      <kbd className="search-hint">Enter → Live</kbd>

      {setIsSetlistOpen && (
        <button
          onClick={() => setIsSetlistOpen(true)}
          style={{
            background: "transparent",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-secondary)",
            cursor: "pointer",
            padding: "4px",
            marginLeft: "4px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--color-accent-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-text-secondary)")
          }
          title="Open Setlists"
          tabIndex={-1}
        >
          <List size={20} />
        </button>
      )}
    </div>
  );
};
