import React from 'react';
import { Sparkles, Flame, Clock, BookOpen, Volume2 } from 'lucide-react';
import { LanguageConfig, CEFRLevel } from '../types';

interface HeaderProps {
  language: LanguageConfig;
  level: CEFRLevel;
  streakDays: number;
  totalMinutes: number;
  onOpenVocab: () => void;
  onOpenInfo: () => void;
  isInSession: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  level,
  streakDays,
  totalMinutes,
  onOpenVocab,
  onOpenInfo,
  isInSession,
}) => {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight text-white">
                LinguaFlow
              </span>
              <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold">
                <Sparkles className="w-3 h-3" />
                <span>Live Audio</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Real-time conversational language immersion
            </p>
          </div>
        </div>

        {/* Center / Current Language Badge */}
        {!isInSession && (
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <span>{language.flag}</span>
            <span className="font-semibold text-slate-200">{language.name}</span>
            <span className="text-slate-500">•</span>
            <span className="text-indigo-400 font-bold">{level}</span>
          </div>
        )}

        {/* Stats & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Practice Streak */}
          <div
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold"
            title="Daily practice streak"
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{streakDays}d Streak</span>
          </div>

          {/* Total Minutes */}
          <div
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium"
            title="Total practice time"
          >
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{totalMinutes} min</span>
          </div>

          {/* Vocab Notebook */}
          <button
            onClick={onOpenVocab}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center space-x-1.5 text-xs font-medium cursor-pointer"
            title="Saved Vocabulary & Idioms"
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Notebook</span>
          </button>

          {/* Info Modal */}
          <button
            onClick={onOpenInfo}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="About Live Voice Conversation"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
