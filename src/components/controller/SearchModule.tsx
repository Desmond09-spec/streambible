import React from 'react';

interface SearchModuleProps {
  query: string;
  setQuery: (val: string) => void;
  onFormSubmit: (e: React.FormEvent) => void;
}

export const SearchModule: React.FC<SearchModuleProps> = ({
  query,
  setQuery,
  onFormSubmit,
}) => {
  return (
    <form id="search-bar" className="search-bar" onSubmit={onFormSubmit}>
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
        type="text"
        id="searchInput"
        placeholder="John 3:16 · Romans 8:28 · Psalms 23:1…"
        autoComplete="off"
        spellCheck="false"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <kbd className="search-hint">Enter ↵</kbd>
    </form>
  );
};
