import React, { useState, useEffect } from "react";
import { db, type Setlist } from "../../lib/db";
import { fetchVerse } from "../../services/bibleService";
import { RefreshCw, Play, Trash2, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./SetlistManager.css";

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          <h3>Setlists</h3>
          <div className="setlist-header-actions">
            <button
              className="btn-icon"
              onClick={createNewSetlist}
              title="New Setlist"
            >
              <Plus size={18} />
            </button>
            <button className="btn-done" onClick={onClose}>
              Done
            </button>
          </div>
        </div>

        {setlists.length === 0 ? (
          <div className="setlist-empty">
            <p>No setlists created yet.</p>
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
                  {new Date(list.date).toLocaleDateString(undefined, {
                    weekday: "short",
                  })}
                </button>
              ))}
            </div>

            {activeList && (
              <div className="setlist-active-view">
                <form onSubmit={addVerse} className="setlist-add-form">
                  <div className="search-pill">
                    <input
                      type="text"
                      placeholder="Add verse (e.g., John 3:16)"
                      value={newInput}
                      onChange={(e) => setNewInput(e.target.value)}
                      autoComplete="off"
                      spellCheck="false"
                    />
                    {newInput && (
                      <button type="submit" className="btn-add-pill">
                        Add
                      </button>
                    )}
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
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
