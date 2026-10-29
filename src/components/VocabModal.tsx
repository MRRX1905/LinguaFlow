import React, { useState } from 'react';
import { BookOpen, X, Volume2, Trash2, Search, Plus } from 'lucide-react';

interface SavedVocab {
  word: string;
  meaning: string;
  language: string;
  date: string;
}

interface VocabModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedVocab: SavedVocab[];
  onDeleteVocab: (index: number) => void;
  onAddVocab: (vocab: SavedVocab) => void;
  onSpeakPhrase: (text: string) => void;
  currentLanguage: string;
}

export const VocabModal: React.FC<VocabModalProps> = ({
  isOpen,
  onClose,
  savedVocab,
  onDeleteVocab,
  onAddVocab,
  onSpeakPhrase,
  currentLanguage,
}) => {
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');

  if (!isOpen) return null;

  const filtered = savedVocab.filter(
    (v) =>
      v.word.toLowerCase().includes(search.toLowerCase()) ||
      v.meaning.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newMeaning.trim()) return;
    onAddVocab({
      word: newWord.trim(),
      meaning: newMeaning.trim(),
      language: currentLanguage,
      date: new Date().toLocaleDateString(),
    });
    setNewWord('');
    setNewMeaning('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 relative max-h-[85vh] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Vocabulary Notebook</h3>
              <p className="text-xs text-slate-400">
                {savedVocab.length} words and idioms saved from practice
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Add Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved words..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder={`Target phrase in ${currentLanguage}`}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                autoFocus
              />
              <input
                type="text"
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
                placeholder="English meaning / definition"
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-purple-600 text-white text-xs font-semibold"
              >
                Save Word
              </button>
            </div>
          </form>
        )}

        {/* Vocab List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 stroke-1 text-slate-600" />
              <p className="text-xs">No vocabulary saved yet. Practice with your AI partner to collect words!</p>
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white group-hover:text-purple-200">
                      {item.word}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400">
                      {item.language}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{item.meaning}</p>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onSpeakPhrase(item.word)}
                    title="Pronounce"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteVocab(idx)}
                    title="Delete"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-700 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
