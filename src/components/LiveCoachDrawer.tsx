import React from 'react';
import { CoachFeedback, Scenario } from '../types';
import { Sparkles, CheckCircle2, AlertCircle, Lightbulb, TrendingUp, Volume2 } from 'lucide-react';

interface LiveCoachDrawerProps {
  latestFeedback: CoachFeedback | null;
  scenario: Scenario;
  completedMissions: string[];
  onToggleMission: (mission: string) => void;
  onSpeakPhrase: (text: string) => void;
  targetLanguage: string;
  targetLanguageId?: string;
}

export const LiveCoachDrawer: React.FC<LiveCoachDrawerProps> = ({
  latestFeedback,
  scenario,
  completedMissions,
  onToggleMission,
  onSpeakPhrase,
  targetLanguage,
  targetLanguageId,
}) => {
  const activePhrases =
    (targetLanguageId && scenario.languagePhrases?.[targetLanguageId]) ||
    scenario.suggestedPhrases;
  return (
    <div className="flex flex-col h-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-5">
      {/* Real-time Coach Insights Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Live AI Coach</h3>
            <p className="text-[11px] text-slate-400">Instant grammar & fluency hints</p>
          </div>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
          Active
        </span>
      </div>

      {/* Latest Coaching Alert / Tip */}
      {latestFeedback ? (
        <div className="space-y-3">
          {latestFeedback.praise && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Great job!</span>
                <p className="text-emerald-200/90 leading-relaxed">{latestFeedback.praise}</p>
              </div>
            </div>
          )}

          {latestFeedback.naturalAlternative && (
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1.5">
              <div className="flex items-center justify-between text-indigo-300 font-medium">
                <span className="flex items-center space-x-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Native Phrasing</span>
                </span>
                <button
                  onClick={() => onSpeakPhrase(latestFeedback.naturalAlternative!)}
                  title="Listen to pronunciation"
                  className="p-1 hover:bg-indigo-800/40 rounded text-indigo-300 hover:text-white transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm font-medium text-white italic">
                "{latestFeedback.naturalAlternative}"
              </p>
              {latestFeedback.englishTranslation && (
                <p className="text-[11px] text-slate-400">
                  Meaning: {latestFeedback.englishTranslation}
                </p>
              )}
            </div>
          )}

          {latestFeedback.grammarCorrection && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300 block mb-0.5">Grammar Nuance</span>
                <p className="leading-relaxed text-amber-100/90">{latestFeedback.grammarCorrection}</p>
              </div>
            </div>
          )}

          {latestFeedback.vocabularyBoost && (
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 flex items-start space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-purple-300 block mb-0.5">Vocabulary Boost</span>
                <p className="leading-relaxed text-purple-100/90">{latestFeedback.vocabularyBoost}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-center py-6">
          <p className="text-xs text-slate-400">
            Start speaking in {targetLanguage}! As you speak, your AI coach will highlight natural phrasing, grammatical improvements, and idiomatic expressions in real-time.
          </p>
        </div>
      )}

      {/* Scenario Missions Checklist */}
      <div className="pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Missions Checklist
          </h4>
          <span className="text-[11px] text-indigo-400 font-medium">
            {completedMissions.length}/{scenario.missions.length} done
          </span>
        </div>
        <div className="space-y-2">
          {scenario.missions.map((mission, idx) => {
            const isCompleted = completedMissions.includes(mission);
            return (
              <button
                key={idx}
                onClick={() => onToggleMission(mission)}
                className={`w-full text-left p-2.5 rounded-xl text-xs flex items-start space-x-2.5 transition border ${
                  isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200 line-through opacity-80'
                    : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center border transition ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : 'border-slate-600'
                  }`}
                >
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="leading-snug">{mission}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Suggested Starter Phrases */}
      {activePhrases && activePhrases.length > 0 && (
        <div className="pt-2 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
            Suggested Phrases
          </h4>
          <div className="space-y-2">
            {activePhrases.map((phrase, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50 transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-indigo-200 group-hover:text-indigo-100">
                    {phrase.target}
                  </span>
                  <button
                    onClick={() => onSpeakPhrase(phrase.target)}
                    title="Pronounce"
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{phrase.english}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cultural Etiquette Note */}
      {scenario.culturalNote && (
        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300/90 leading-relaxed">
          <span className="font-semibold block mb-0.5 text-amber-200">🌍 Cultural Etiquette</span>
          {scenario.culturalNote}
        </div>
      )}
    </div>
  );
};
