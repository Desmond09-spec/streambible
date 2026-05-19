import React, { useState, useEffect } from 'react';
import { db, type Setlist } from '../../lib/db';
import { fetchVerse } from '../../services/bibleService';
import { RefreshCw, Play, Trash2, Plus, Check } from 'lucide-react';
import './SetlistManager.css';

interface SetlistManagerProps {
  onSelectVerse: (reference: string) => void;
  primaryVersion: string;
}

export const SetlistManager: React.FC<SetlistManagerProps> = ({ onSelectVerse, primaryVersion }) => {
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [newInput, setNewInput] = useState('');
  const [isPreCaching, setIsPreCaching] = useState(false);
  const [preCacheProgress, setPreCacheProgress] = useState(0);

  const loadSetlists = React.useCallback(async () => {
    const lists = await db.setlists.toArray();
    setSetlists(lists);
    if (lists.length > 0 && !activeListId) {
      setActiveListId(lists[0].id);
    }
  }, [activeListId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSetlists();
  }, [loadSetlists]);

  const createNewSetlist = async () => {
    const newList: Setlist = {
      id: crypto.randomUUID(),
      name: `Sunday Service ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      verses: []
    };
    await db.setlists.add(newList);
    await loadSetlists();
    setActiveListId(newList.id);
  };

  const addVerse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInput.trim() || !activeListId) return;

    const list = setlists.find(l => l.id === activeListId);
    if (list) {
      const updatedVerses = [...list.verses, { versionId: primaryVersion, reference: newInput.trim(), source: 'api.bible' as const }];
      await db.setlists.update(activeListId, { verses: updatedVerses });
      setNewInput('');
      loadSetlists();
    }
  };

  const removeVerse = async (index: number) => {
    if (!activeListId) return;
    const list = setlists.find(l => l.id === activeListId);
    if (list) {
      const updatedVerses = list.verses.filter((_, i) => i !== index);
      await db.setlists.update(activeListId, { verses: updatedVerses });
      loadSetlists();
    }
  };

  const preCacheList = async () => {
    if (!activeListId) return;
    const list = setlists.find(l => l.id === activeListId);
    if (!list || list.verses.length === 0) return;

    setIsPreCaching(true);
    setPreCacheProgress(0);

    let completed = 0;
    for (const v of list.verses) {
      try {
        await fetchVerse(v.versionId, v.reference);
        // Throttle to protect API quotas
        await new Promise(resolve => setTimeout(resolve, 250));
      } catch (err) {
        console.warn('Failed to pre-cache', v.reference, err);
      }
      completed++;
      setPreCacheProgress(Math.round((completed / list.verses.length) * 100));
    }

    setTimeout(() => {
      setIsPreCaching(false);
      setPreCacheProgress(0);
    }, 1000);
  };

  const activeList = setlists.find(l => l.id === activeListId);

  return (
    <div className="setlist-manager">
      <div className="setlist-header">
        <h3>Service Setlists</h3>
        <button className="btn-icon" onClick={createNewSetlist} title="New Setlist">
          <Plus size={16} />
        </button>
      </div>

      {setlists.length === 0 ? (
        <div className="setlist-empty">
          <p>No setlists created yet.</p>
          <button onClick={createNewSetlist} className="btn-primary" style={{ marginTop: '10px' }}>
            Create First Setlist
          </button>
        </div>
      ) : (
        <>
          <div className="setlist-tabs">
            {setlists.map(list => (
              <button
                key={list.id}
                className={`setlist-tab ${activeListId === list.id ? 'active' : ''}`}
                onClick={() => setActiveListId(list.id)}
              >
                {new Date(list.date).toLocaleDateString(undefined, { weekday: 'short' })}
              </button>
            ))}
          </div>

          {activeList && (
            <div className="setlist-content">
              <form onSubmit={addVerse} className="setlist-add-form">
                <input
                  type="text"
                  placeholder="Add verse (e.g., John 3:16)"
                  value={newInput}
                  onChange={e => setNewInput(e.target.value)}
                  className="setlist-input"
                />
                <button type="submit" className="btn-secondary" disabled={!newInput.trim()}>Add</button>
              </form>

              <div className="setlist-items">
                {activeList.verses.map((v, i) => (
                  <div key={i} className="setlist-item">
                    <button className="setlist-item-play" onClick={() => onSelectVerse(v.reference)}>
                      <Play size={14} />
                      <span>{v.reference}</span>
                    </button>
                    <button className="setlist-item-remove" onClick={() => removeVerse(i)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {activeList.verses.length === 0 && (
                  <p className="setlist-empty-hint">Add verses to prepare for Sunday.</p>
                )}
              </div>

              {activeList.verses.length > 0 && (
                <div className="setlist-actions">
                  <button 
                    className="btn-precache" 
                    onClick={preCacheList} 
                    disabled={isPreCaching}
                  >
                    {isPreCaching ? (
                      <>
                        <RefreshCw size={14} className="spin" />
                        Caching... {preCacheProgress}%
                      </>
                    ) : preCacheProgress === 100 ? (
                      <>
                        <Check size={14} />
                        Ready for Offline
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} />
                        Pre-cache for Offline
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
