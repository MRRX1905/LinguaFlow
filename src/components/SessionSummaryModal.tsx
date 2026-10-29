import React from 'react';
import { SessionReport } from '../types';
import { Award, CheckCircle2, AlertTriangle, BookOpen, ArrowRight, X, Volume2, Sparkles, RefreshCw } from 'lucide-react';

interface SessionSummaryModalProps {
  report: SessionReport | null;
  loading: boolean;
  onClose: () => void;
  onRestart: () => void;
  onSpeakPhrase: (phrase: string) => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  report,
  loading,
  onClose,
  onRestart,
  onSpeakPhrase,
}) => {
  if (!loading && !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 relative max-h-[90vh] overflow-y-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center animate-bounce">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Analyzing Your Practice Session</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-md">
                Our pedagogical AI is compiling your CEFR fluency metrics, grammar corrections, and vocabulary achievements...
              </p>
            </div>
          </div>
        ) : report ? (
          <>
            {/* Header / CEFR badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Practice Session Report</h2>
                  <p className="text-xs text-slate-400">Comprehensive CEFR fluency breakdown</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
                <span className="text-xs text-slate-400">Estimated CEFR:</span>
                <span className="text-lg font-black text-indigo-400 tracking-wide">
                  {report.estimatedCEFR || 'B1'}
                </span>
              </div>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800 text-center space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Fluency
                </span>
                <div className="text-2xl font-black text-emerald-400">
                  {report.fluencyScore}%
                </div>
                <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${report.fluencyScore}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800 text-center space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Accuracy
                </span>
                <div className="text-2xl font-black text-indigo-400">
                  {report.accuracyScore}%
                </div>
                <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${report.accuracyScore}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-800 text-center space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Vocabulary
                </span>
                <div className="text-2xl font-black text-purple-400">
                  {report.vocabularyRichnessScore}%
                </div>
                <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${report.vocabularyRichnessScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Overall Feedback */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Coach Evaluation</span>
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {report.overallFeedback}
              </p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Key Strengths</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-emerald-200/90">
                  {report.keyStrengths?.map((str, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Growth Focus</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-amber-200/90">
                  {report.areasToImprove?.map((area, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mistakes and Corrections */}
            {report.mistakesAndCorrections && report.mistakesAndCorrections.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <span>Grammar & Native Phrasing Refinements</span>
                </h4>
                <div className="space-y-2">
                  {report.mistakesAndCorrections.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1.5"
                    >
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium line-through">
                          {item.original}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                          {item.corrected}
                        </span>
                        <button
                          onClick={() => onSpeakPhrase(item.corrected)}
                          title="Pronounce"
                          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">{item.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acquired Vocabulary */}
            {report.vocabularyLearned && report.vocabularyLearned.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Vocabulary Acquired This Session</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {report.vocabularyLearned.map((vocab, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-300">{vocab.word}</span>
                        <button
                          onClick={() => onSpeakPhrase(vocab.word)}
                          title="Pronounce"
                          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium">{vocab.meaning}</p>
                      {vocab.example && (
                        <p className="text-[10px] text-slate-400 italic">"{vocab.example}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Recommendation */}
            {report.nextMissionRecommendation && (
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-semibold text-indigo-200">Recommended Next Step</h5>
                  <p className="text-xs text-indigo-100/90 mt-0.5 leading-relaxed">
                    {report.nextMissionRecommendation}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              >
                Close Report
              </button>
              <button
                onClick={() => {
                  onClose();
                  onRestart();
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-lg shadow-indigo-600/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Practice Another Scenario</span>
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
