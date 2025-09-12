// /components/SnapshotSidebar.tsx

import React, { useState, useMemo } from 'react';
import { Trash2, Save, Clock, Search, Tag, X, Copy, Check } from 'lucide-react';
import { useFormSchemaStore, useFormSnapshots } from '@/utility/formWizard';

interface SnapshotSidebarProps {
  processId: string;
  onClose?: () => void;
  className?: string;
}

export const SnapshotSidebar: React.FC<SnapshotSidebarProps> = ({ 
  processId, 
  onClose,
  className = "" 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [snapshotName, setSnapshotName] = useState("");
  const [snapshotDescription, setSnapshotDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const { getData, setData, loadFromSnapshot } = useFormSchemaStore();
  const { snapshots, save, delete: deleteSnapshot, search } = useFormSnapshots(processId);
  
  const currentFormData = getData(processId);
  
  const filteredSnapshots = useMemo(() => {
    if (!searchQuery) return snapshots;
    return search(searchQuery);
  }, [searchQuery, snapshots, search]);
  
  const availableTags = ["production", "test", "draft", "backup", "final", "temporary"];
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return "Dzisiaj";
    if (diffDays === 1) return "Wczoraj";
    if (diffDays < 7) return `${diffDays} dni temu`;
    return date.toLocaleDateString('pl-PL');
  };
  
  const handleSaveSnapshot = () => {
    if (!snapshotName.trim()) return;
    save(snapshotName, currentFormData, snapshotDescription, selectedTags);
    setShowSaveDialog(false);
    setSnapshotName("");
    setSnapshotDescription("");
    setSelectedTags([]);
  };

  // 1) Preferowany wariant: użyj core'owego loadFromSnapshot(id)
  const handleLoadSnapshotById = (id: string) => {
    loadFromSnapshot(processId, id);
  };
  
  // 2) Alternatywnie: bezpośrednie setData z REPLACE (gdyby korzystać z samych danych)
  const handleLoadSnapshotData = (snapshotData: any) => {
    setData(processId, snapshotData, { mode: "replace" });
  };
  
  const handleDeleteSnapshot = (id: string) => {
    if (window.confirm("Czy na pewno chcesz usunąć ten snapshot?")) {
      deleteSnapshot(id);
    }
  };
  
  const handleCopySnapshot = (snapshot: any) => {
    navigator.clipboard.writeText(JSON.stringify(snapshot.data, null, 2));
    setCopiedId(snapshot.id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  return (
    <div className={`flex flex-col h-full bg-white border-l border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Zapisane wersje</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Szukaj snapshotów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Save button */}
        <button
          onClick={() => setShowSaveDialog(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Zapisz obecny stan
        </button>
      </div>
      
      {/* Snapshots list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredSnapshots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Brak zapisanych wersji</p>
            <p className="text-sm mt-1">Zapisz obecny stan formularza</p>
          </div>
        ) : (
          filteredSnapshots.map(snapshot => (
            <div
              key={snapshot.id}
              className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 flex-1">{snapshot.name}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopySnapshot(snapshot)}
                    className="p-1 text-gray-500 hover:text-blue-600"
                    title="Kopiuj dane"
                  >
                    {copiedId === snapshot.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteSnapshot(snapshot.id)}
                    className="p-1 text-gray-500 hover:text-red-600"
                    title="Usuń"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {snapshot.description && (
                <p className="text-sm text-gray-600 mb-2">{snapshot.description}</p>
              )}
              
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">{formatDate(snapshot.updatedAt)}</span>
              </div>
              
              {snapshot.tags && snapshot.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {snapshot.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleLoadSnapshotById(snapshot.id)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                >
                  Wczytaj
                </button>
                <button
                  onClick={() => handleLoadSnapshotData(snapshot.data)}
                  className="px-3 py-1.5 bg-gray-50 text-gray-500 text-sm rounded hover:bg-gray-100 transition-colors"
                  title="Wczytaj (replace przez setData)"
                >
                  Wczytaj (R)
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Zapisz snapshot</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nazwa *
                </label>
                <input
                  type="text"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="np. Wersja produkcyjna"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opis (opcjonalny)
                </label>
                <textarea
                  value={snapshotDescription}
                  onChange={(e) => setSnapshotDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Dodaj opis..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagi (opcjonalne)
                </label>
                <div className="flex flex-wrap gap-2">
                  {["production", "test", "draft", "backup", "final", "temporary"].map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTags(prev =>
                          prev.includes(tag)
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      } border`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleSaveSnapshot}
                disabled={!snapshotName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
