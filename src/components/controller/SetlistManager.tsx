import React, { useState, useEffect } from "react";
import { db, type Setlist } from "../../lib/db";
import { fetchVerse } from "../../services/bibleService";
import { RefreshCw, Play, Trash2, Plus, Check, ListMusic, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./SetlistManager.css";

const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
};

interface SetlistManagerProps {
  onSelectVerse: (reference: string) => void;
  primaryVersion: string;
  onClose?: () => void;
  style?: "modal" | "drawer";
}

export const SetlistManager: React.FC<SetlistManagerProps> = ({
  onSelectVerse,
  primaryVersion,
  onClose,
  style = "modal",
}) => {
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [newInput, setNewInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(false);
  const [isPreCaching, setIsPreCaching] = useState(false);
  const [preCacheProgress, setPreCacheProgress] = useState(0);

  // Fetch and sort setlists — returns the sorted list so callers can react to it
  const fetchSetlists = async (): Promise<Setlist[]> => {
    const lists = await db.setlists.toArray();
    lists.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return lists;
  };

  // Refresh state from the database
  const refreshSetlists = async (selectId?: string) => {
    const lists = await fetchSetlists();
    setSetlists(lists);
    if (selectId) {
      setActiveListId(selectId);
    } else if (lists.length > 0 && !activeListId) {
      setActiveListId(lists[0].id);
    }
  };

  // Initial load — data fetch is async so setState is called in a callback, not synchronously
  useEffect(() => {
    let cancelled = false;
    fetchSetlists().then((lists) => {
      if (cancelled) return;
      setSetlists(lists);
      if (lists.length > 0) setActiveListId((prev) => prev ?? lists[0].id);
    });
    return () => { cancelled = true; };
  }, []);

  const createNewSetlist = async () => {
    const newList: Setlist = {
      id: crypto.randomUUID(),
      name: `Service ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      verses: [],
    };
    await db.setlists.add(newList);
    await refreshSetlists(newList.id);
  };

  const addVerse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInput.trim() || !activeListId) return;

    setIsAdding(true);
    setAddError(false);

    try {
      // Validate verse by fetching it
      await fetchVerse(primaryVersion, newInput.trim());
      
      const list = setlists.find((l) => l.id === activeListId);
      if (list) {
        const updatedVerses = [
          ...list.verses,
          {
            versionId: primaryVersion,
            reference: newInput.trim(),
            source: "api.bible" as const,
          },
        ];
        await db.setlists.update(activeListId, { verses: updatedVerses });
        setNewInput("");
        refreshSetlists();
      }
    } catch {
      setAddError(true);
      setTimeout(() => setAddError(false), 2000);
    } finally {
      setIsAdding(false);
    }
  };

  const removeVerse = async (index: number) => {
    if (!activeListId) return;
    const list = setlists.find((l) => l.id === activeListId);
    if (list) {
      const updatedVerses = list.verses.filter((_, i) => i !== index);
      await db.setlists.update(activeListId, { verses: updatedVerses });
      refreshSetlists();
    }
  };

  const deleteActiveSetlist = async () => {
    if (!activeListId) return;
    if (!window.confirm("Are you sure you want to delete this setlist?")) return;
    
    await db.setlists.delete(activeListId);
    
    const lists = await fetchSetlists();
    setSetlists(lists);
    if (lists.length > 0) {
      setActiveListId(lists[0].id);
    } else {
      setActiveListId(null);
    }
  };

  const preCacheList = async () => {
    if (!activeListId) return;
    const list = setlists.find((l) => l.id === activeListId);
    if (!list || list.verses.length === 0) return;

    setIsPreCaching(true);
    setPreCacheProgress(0);

    let completed = 0;
    for (const v of list.verses) {
      try {
        await fetchVerse(v.versionId, v.reference);
        await new Promise((resolve) => setTimeout(resolve, 250)); // Throttle
      } catch (err) {
        console.warn("Failed to pre-cache", v.reference, err);
      }
      completed++;
      setPreCacheProgress(Math.round((completed / list.verses.length) * 100));
    }

    setTimeout(() => {
      setIsPreCaching(false);
      setPreCacheProgress(0);
    }, 1000);
  };

  const activeList = setlists.find((l) => l.id === activeListId);

  const isDrawer = style === "drawer";

  return (
    <div
      className={`setlist-overlay ${isDrawer ? "overlay-drawer" : "overlay-modal"}`}
      onClick={onClose}
    >
      <motion.div
        className={
          isDrawer ? "setlist-drawer-content" : "setlist-modal-content"
        }
        onClick={(e) => e.stopPropagation()}
        initial={isDrawer ? { y: "100%" } : { y: 50, opacity: 0, scale: 0.95 }}
        animate={isDrawer ? { y: 0 } : { y: 0, opacity: 1, scale: 1 }}
        exit={isDrawer ? { y: "100%" } : { y: 20, opacity: 0, scale: 0.95 }}
        transition={
          isDrawer
            ? { type: "spring", damping: 26, stiffness: 260 }
            : { type: "spring", damping: 25, stiffness: 300 }
        }
      >
        {isDrawer && (
          <div className="drawer-pull-tab">
            <div className="drawer-pull-indicator" />
          </div>
        )}
        <div className="setlist-header">
          <button className="btn-icon" onClick={createNewSetlist} title="New Setlist">
            <Plus size={22} />
          </button>
          <h3>Setlists</h3>
          <button className="btn-done" onClick={onClose}>
            Done
          </button>
        </div>

        {setlists.length === 0 ? (
          <div className="setlist-empty">
            <div className="setlist-empty-icon">
              <ListMusic size={48} strokeWidth={1.5} />
            </div>
            <h4>No Setlists</h4>
            <p>Create a setlist to save and manage verses for your upcoming services.</p>
            <button onClick={createNewSetlist} className="btn-apple-primary">
              Create Setlist
            </button>
          </div>
        ) : (
          <div className="setlist-body">
            {/* iOS Style Segmented Control */}
            <div className="segmented-control">
              {setlists.slice(0, 4).map((list) => (
                <button
                  key={list.id}
                  className={`segment-btn ${activeListId === list.id ? "active" : ""}`}
                  onClick={() => setActiveListId(list.id)}
                >
                  {formatDateLabel(list.date)}
                </button>
              ))}
            </div>

            {activeList && (
              <div className="setlist-active-view">
                <form onSubmit={addVerse} className="setlist-add-form">
                  <div className={`search-pill ${addError ? "error-shake" : ""}`}>
                    <Search size={16} className="search-pill-icon" />
                    <input
                      type="text"
                      placeholder={addError ? "Verse not found" : "Add verse (e.g., John 3:16)"}
                      value={newInput}
                      onChange={(e) => {
                        setNewInput(e.target.value);
                        setAddError(false);
                      }}
                      autoComplete="off"
                      spellCheck="false"
                      style={{ color: addError ? "#FF3B30" : undefined }}
                    />
                    <AnimatePresence>
                      {newInput && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          type="submit"
                          className="btn-add-pill"
                          disabled={isAdding}
                        >
                          {isAdding ? <RefreshCw size={14} className="spin" /> : "Add"}
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </form>

                <div className="ios-list-group">
                  <AnimatePresence initial={false}>
                    {activeList.verses.map((v, i) => (
                      <motion.div
                        key={`${v.reference}-${i}`}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ios-list-item"
                      >
                        <button
                          className="ios-list-btn"
                          onClick={() => onSelectVerse(v.reference)}
                        >
                          <div className="ios-list-icon play-icon">
                            <Play size={12} fill="currentColor" />
                          </div>
                          <span className="ios-list-text">{v.reference}</span>
                        </button>
                        <button
                          className="ios-list-remove"
                          onClick={() => removeVerse(i)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {activeList.verses.length === 0 && (
                    <div className="ios-list-item empty-hint">
                      <span>No verses added yet.</span>
                    </div>
                  )}
                </div>

                {activeList.verses.length > 0 && (
                  <button
                    className="btn-apple-secondary"
                    onClick={preCacheList}
                    disabled={isPreCaching}
                  >
                    {isPreCaching ? (
                      <>
                        <RefreshCw size={16} className="spin" /> Caching{" "}
                        {preCacheProgress}%
                      </>
                    ) : preCacheProgress === 100 ? (
                      <>
                        <Check size={16} /> Ready for Offline
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} /> Pre-cache Setlist
                      </>
                    )}
                  </button>
                )}
                
                <button className="btn-apple-destructive" style={{ marginTop: "12px" }} onClick={deleteActiveSetlist}>
                  <Trash2 size={16} /> Delete Setlist
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
