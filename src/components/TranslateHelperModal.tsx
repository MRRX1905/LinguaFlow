import React, { useState } from 'react';
import { HelpCircle, X, Search, Volume2, Sparkles, Send, Loader2 } from 'lucide-react';

interface TranslateHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLanguage: string;
  context: string;
  onSendPhrase: (phrase: string) => void;
  onSpeakPhrase: (phrase: string) => void;
}

export const TranslateHelperModal: React.FC<TranslateHelperModalProps> = ({
  isOpen,
  onClose,
  targetLanguage,
  context,
  onSendPhrase,
  onSpeakPhrase,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    translation: string;
    phonetic?: string;
    literal?: string;
    usageTip?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTranslate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/translate-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phrase: query.trim(),
          language: targetLanguage,
          context: context,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Failed to get translation hint:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickExamples = [
    'How do I say: Can I pay by card?',
    'How do I ask: What do you recommend?',
    'How do I say: I have a reservation',
    'How do I politely say: Could you speak a bit slower?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                How do I say...?
              </h3>
              <p className="text-xs text-slate-400">
                Instant native phrasing helper for {targetLanguage}
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

        {/* Input Form */}
        <form onSubmit={handleTranslate} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type what you want to say in English..."
            className="w-full pl-4 pr-11 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </form>

        {/* Quick Suggestions */}
        {!result && !loading && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Quick prompts:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {quickExamples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(ex.replace(/^How do I (say|ask): /, ''));
                  }}
                  className="text-left p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-700/40 transition truncate"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Translation Result Card */}
        {result && (
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                  Native Phrasing:
                </span>
                <p className="text-lg font-bold text-white mt-0.5">{result.translation}</p>
                {result.phonetic && (
                  <p className="text-xs text-indigo-300/80 font-mono mt-0.5">
                    Pronunciation: {result.phonetic}
                  </p>
                )}
              </div>
              <button
                onClick={() => onSpeakPhrase(result.translation)}
                title="Listen to pronunciation"
                className="p-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-white transition"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {result.literal && (
              <p className="text-xs text-slate-300">
                <strong className="text-slate-400">Breakdown:</strong> {result.literal}
              </p>
            )}

            {result.usageTip && (
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-amber-300/90 flex items-start space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{result.usageTip}</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-indigo-500/20">
              <button
                onClick={() => {
                  onSendPhrase(result.translation);
                  onClose();
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Use in Conversation</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
