// src/utility/formWizard/SnapshotBar.tsx
import { useEffect, useMemo, useState } from 'react';
import { useSnapshotStore } from './snapshotStore';

export function SnapshotBar() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');

  const { snapshots, saveSnapshot, loadSnapshot, deleteSnapshot } = useSnapshotStore();

  // ESC zamyka panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const sorted = useMemo(
    () => [...snapshots].sort((a, b) => b.created - a.created),
    [snapshots]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? sorted.filter(s => s.name.toLowerCase().includes(q)) : sorted;
  }, [sorted, query]);

  const quickSave = () => {
    const stamp = new Date().toLocaleString();
    saveSnapshot(`Snapshot ${stamp}`);
  };

  const create = () => {
    const n = name.trim();
    if (!n) return;
    saveSnapshot(n);
    setName('');
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        title="Snapshoty"
        className="fixed right-4 bottom-4 bg-black text-white p-3 rounded-full shadow hover:bg-gray-900"
      >
        📸
      </button>

      {/* Prawy panel (kompaktowy) */}
      {open && (
        <div className="fixed right-0 top-0 h-full w-64 bg-white border-l z-50 flex flex-col">
          {/* Nagłówek */}
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="font-semibold text-sm">Snapshoty</div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-black text-lg leading-none"
              aria-label="Zamknij"
              title="Zamknij"
            >
              ×
            </button>
          </div>

          {/* Sterowanie */}
          <div className="p-3 border-b space-y-2">
            <div className="flex gap-2">
              <input
                className="border px-2 py-1 rounded w-full text-sm"
                placeholder="Nazwa snapshotu"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && create()}
              />
              <button
                onClick={create}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 rounded"
              >
                Zapisz
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={quickSave}
                className="text-xs text-blue-700 underline"
              >
                Szybki zapis
              </button>
              <input
                className="border px-2 py-1 rounded text-xs w-32"
                placeholder="Szukaj…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Lista */}
          <div className="p-3 overflow-y-auto text-sm space-y-2">
            {filtered.length === 0 ? (
              <div className="text-gray-500 text-xs text-center mt-4">
                Brak snapshotów
              </div>
            ) : (
              filtered.map(s => (
                <div key={s.id} className="border rounded p-2">
                  <div className="font-medium truncate" title={s.name}>{s.name}</div>
                  <div className="text-[11px] text-gray-500">
                    {new Date(s.created).toLocaleString()}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => loadSnapshot(s.id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                    >
                      Wczytaj
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Usunąć „${s.name}”?`)) deleteSnapshot(s.id);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
