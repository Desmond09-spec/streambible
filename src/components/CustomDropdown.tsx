import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Loader2, Database } from 'lucide-react';

export interface Version {
  id: string;
  name?: string;
  title?: string;
  abbreviation: string;
  language?: string | { name: string };
}

interface CustomDropdownProps {
  value: string;
  onChange: (val: string) => void;
  onLoadMore: () => void;
  curatedVersions: Version[];
  extraVersions: Version[];
  showExtraVersions: boolean;
  fetchingExtra: boolean;
  isFallbackActive?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  onLoadMore,
  curatedVersions,
  extraVersions,
  showExtraVersions,
  fetchingExtra,
  isFallbackActive
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Normalize versions for easy searching and rendering
  const normalizedCurated = useMemo(() => curatedVersions.map(v => ({
    id: v.id,
    name: v.name || v.title || '',
    abbreviation: v.abbreviation,
    language: typeof v.language === 'string' ? v.language : (v.language?.name || 'Unknown'),
    isCurated: true
  })), [curatedVersions]);

  const normalizedExtra = useMemo(() => extraVersions.map(v => ({
    id: v.id,
    name: v.title || v.name || '',
    abbreviation: v.abbreviation,
    language: typeof v.language === 'string' ? v.language : (v.language?.name || 'Unknown'),
    isCurated: false
  })), [extraVersions]);

  const selectedItem = [...normalizedCurated, ...normalizedExtra].find(v => v.id.toString() === value.toString()) || normalizedCurated[0];

  const filteredCurated = normalizedCurated.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExtra = normalizedExtra.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="custom-dropdown-container" ref={dropdownRef} style={{ position: 'relative', width: '100%', minWidth: '220px' }}>
      
      {/* Trigger Button */}
      <button 
        type="button"
        className="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-1)',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 0 2px var(--color-accent-primary)' : 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden', flex: 1 }}>
          <span className="mobile-hidden" style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {selectedItem?.language}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
            <span style={{ fontWeight: 600 }}>{selectedItem?.abbreviation}</span>
            <span className="mobile-hidden" style={{ color: 'var(--text-2)' }}>- {selectedItem?.name}</span>
            {isFallbackActive && (
              <Database size={12} color="var(--warning)" style={{ flexShrink: 0 }} />
            )}
          </span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0, marginLeft: '8px' }}>
          <ChevronDown size={18} color="var(--text-3)" />
        </motion.div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="dropdown-menu-wrapper"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              zIndex: 50,
              background: 'rgba(25, 25, 25, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Search Bar */}
            <div style={{ padding: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={16} color="var(--text-3)" />
              <input 
                type="text" 
                placeholder="Search translations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-1)',
                  width: '100%',
                  fontSize: '14px'
                }}
                autoFocus
              />
            </div>

            {/* Scrollable List */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px' }} className="custom-scrollbar">
              
              {/* Curated Group */}
              {filteredCurated.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.5px' }}>
                    Popular Versions
                  </div>
                  {filteredCurated.map(v => (
                    <button
                      key={v.id}
                      onClick={() => handleSelect(v.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 8px',
                        background: value.toString() === v.id.toString() ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'var(--text-1)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'background 0.1s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = value.toString() === v.id.toString() ? 'rgba(255,255,255,0.1)' : 'transparent'}
                    >
                      <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span style={{ color: 'var(--color-accent-primary)', marginRight: '6px', fontWeight: 600 }}>{v.abbreviation}</span>
                        {v.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* All Versions Group */}
              {showExtraVersions && filteredExtra.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.5px', marginTop: '8px' }}>
                    All Versions
                  </div>
                  {filteredExtra.map(v => (
                    <button
                      key={v.id}
                      onClick={() => handleSelect(v.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 8px',
                        background: value.toString() === v.id.toString() ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'var(--text-1)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'background 0.1s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = value.toString() === v.id.toString() ? 'rgba(255,255,255,0.1)' : 'transparent'}
                    >
                      <span style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span style={{ color: 'var(--text-2)', marginRight: '6px', fontSize: '11px' }}>{v.language}</span>
                        <span style={{ fontWeight: 500 }}>{v.abbreviation}</span> - {v.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {!showExtraVersions && searchQuery === '' && (
                <button
                  onClick={(e) => { e.preventDefault(); onLoadMore(); }}
                  disabled={fetchingExtra}
                  style={{
                    width: '100%',
                    padding: '12px 8px',
                    background: 'transparent',
                    border: '1px dashed rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: 'var(--text-2)',
                    fontSize: '13px',
                    cursor: fetchingExtra ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { if (!fetchingExtra) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-1)'; } }}
                  onMouseLeave={(e) => { if (!fetchingExtra) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; } }}
                >
                  {fetchingExtra ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      Loading 3000+ versions...
                    </>
                  ) : (
                    "Load 3000+ more versions..."
                  )}
                </button>
              )}
              
              {/* No Results State */}
              {filteredCurated.length === 0 && filteredExtra.length === 0 && (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
                  No translations found for "{searchQuery}"
                  {!showExtraVersions && <div style={{ marginTop: '8px', color: 'var(--color-accent-primary)', cursor: 'pointer' }} onClick={onLoadMore}>Load all versions to search globally</div>}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 680px) {
          .custom-dropdown-container {
            width: auto !important;
            min-width: 0 !important;
          }
          .dropdown-trigger {
            width: auto !important;
          }
          .dropdown-menu-wrapper {
            min-width: 240px !important;
            max-width: calc(100vw - 40px) !important;
            width: max-content !important;
            left: auto !important; 
            right: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};
