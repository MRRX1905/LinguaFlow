import React, { useState } from 'react';
import { LanguageConfig, Scenario, CEFRLevel } from '../types';
import { SUPPORTED_LANGUAGES, SCENARIOS } from '../data/languagesAndScenarios';
import { Sparkles, Compass, CheckCircle2, Mic, Volume2 } from 'lucide-react';

interface ScenarioPickerProps {
  selectedLanguage: LanguageConfig;
  onSelectLanguage: (lang: LanguageConfig) => void;
  selectedLevel: CEFRLevel;
  onSelectLevel: (lvl: CEFRLevel) => void;
  selectedScenario: Scenario;
  onSelectScenario: (sc: Scenario) => void;
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  onStartSession: () => void;
}

export const ScenarioPicker: React.FC<ScenarioPickerProps> = ({
  selectedLanguage,
  onSelectLanguage,
  selectedLevel,
  onSelectLevel,
  selectedScenario,
  onSelectScenario,
  selectedVoice,
  onSelectVoice,
  onStartSession,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Scenarios' },
    { id: 'daily', label: 'Everyday Life' },
    { id: 'travel', label: 'Travel & Tourism' },
    { id: 'work', label: 'Career & Work' },
    { id: 'social', label: 'Social & Culture' },
    { id: 'emergency', label: 'Health & Needs' },
  ];

  const levels: { id: CEFRLevel; label: string; desc: string }[] = [
    { id: 'A1', label: 'A1 Beginner', desc: 'Simple words & greetings' },
    { id: 'A2', label: 'A2 Elementary', desc: 'Basic daily tasks' },
    { id: 'B1', label: 'B1 Intermediate', desc: 'Conversational comfort' },
    { id: 'B2', label: 'B2 Upper-Int', desc: 'Fluency with idioms' },
    { id: 'C1', label: 'C1 Advanced', desc: 'Nuanced native debate' },
  ];

  const filteredScenarios = SCENARIOS.filter(
    (s) => categoryFilter === 'all' || s.category === categoryFilter
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900/90 to-purple-950/60 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Powered by Gemini Live Voice API</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Conversational Fluency, in Real Time.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Practice speaking naturally with an AI language partner that listens, speaks, and coaches you with zero awkward pauses. Complete realistic missions and conquer the fear of speaking.
          </p>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Language, Level & Voice Configuration Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Language selector */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Target Language
          </label>
          <div className="relative">
            <select
              value={selectedLanguage.id}
              onChange={(e) => {
                const found = SUPPORTED_LANGUAGES.find((l) => l.id === e.target.value);
                if (found) {
                  onSelectLanguage(found);
                  onSelectVoice(found.voices[0]?.id || found.defaultVoice);
                }
              }}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition appearance-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-slate-900 text-white">
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-3 text-slate-400 text-xs">
              ▼
            </div>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            Greeting: "{selectedLanguage.sampleGreeting}"
          </p>
        </div>

        {/* CEFR Level Selector */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Proficiency Level
          </label>
          <div className="grid grid-cols-5 gap-1">
            {levels.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => onSelectLevel(lvl.id)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition border ${
                  selectedLevel === lvl.id
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
                title={lvl.desc}
              >
                {lvl.id}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-indigo-300">
            {levels.find((l) => l.id === selectedLevel)?.desc}
          </p>
        </div>

        {/* Voice Persona Selector */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            AI Voice Partner
          </label>
          <div className="relative">
            <select
              value={selectedVoice}
              onChange={(e) => onSelectVoice(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition appearance-none cursor-pointer"
            >
              {selectedLanguage.voices.map((v) => (
                <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                  🎙️ {v.name} ({v.gender}) — {v.description}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-3 text-slate-400 text-xs">
              ▼
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            {selectedLanguage.voices.find((v) => v.id === selectedVoice)?.description || 'Natural speech'}
          </p>
        </div>
      </div>

      {/* Scenarios Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Choose a Practice Scenario</h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                  categoryFilter === cat.id
                    ? 'bg-slate-100 text-slate-900 border-white'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scenarios Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScenarios.map((scenario) => {
            const isSelected = selectedScenario.id === scenario.id;
            return (
              <div
                key={scenario.id}
                onClick={() => onSelectScenario(scenario)}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/80 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500'
                    : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 group-hover:scale-105 transition-transform">
                      {scenario.icon}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                        scenario.difficulty === 'Beginner'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : scenario.difficulty === 'Intermediate'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}
                    >
                      {scenario.difficulty}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition">
                      {scenario.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {scenario.description}
                    </p>
                  </div>

                  {/* Missions Preview */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Target Missions:
                    </span>
                    {scenario.missions.slice(0, 2).map((m, i) => (
                      <div key={i} className="flex items-start space-x-1.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span className="truncate">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Partner: <strong className="text-slate-200">{scenario.partnerRole}</strong>
                  </span>
                  <span
                    className={`font-semibold flex items-center space-x-1 ${
                      isSelected ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  >
                    <span>{isSelected ? 'Selected' : 'Select'}</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating / Sticky Start Bar */}
      <div className="sticky bottom-6 z-20 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-left w-full sm:w-auto">
          <span className="text-2xl">{selectedLanguage.flag}</span>
          <div>
            <h4 className="text-sm font-bold text-white">
              Ready to practice {selectedLanguage.name}?
            </h4>
            <p className="text-xs text-slate-400">
              Scenario: <strong className="text-indigo-300">{selectedScenario.title}</strong> • Level: {selectedLevel}
            </p>
          </div>
        </div>

        <button
          onClick={onStartSession}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Mic className="w-4 h-4 animate-pulse" />
          <span>Start Live Voice Practice</span>
        </button>
      </div>
    </div>
  );
};
