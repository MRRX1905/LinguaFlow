import React from 'react';

interface AudioVisualizerProps {
  status: 'connecting' | 'listening' | 'speaking' | 'muted' | 'idle' | 'error';
  userVolume: number;
  aiVolume: number;
  partnerName: string;
  partnerRole: string;
  languageFlag: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  status,
  userVolume,
  aiVolume,
  partnerName,
  partnerRole,
  languageFlag,
}) => {
  // Determine dominant volume and active color palette
  const isAiSpeaking = status === 'speaking' || aiVolume > 0.05;
  const isUserSpeaking = userVolume > 0.08 && status !== 'muted';
  const activeVol = isAiSpeaking ? aiVolume : isUserSpeaking ? userVolume : 0.02;

  // Scale multipliers for visual waves
  const scaleRing1 = 1 + activeVol * 0.45;
  const scaleRing2 = 1 + activeVol * 0.9;
  const scaleRing3 = 1 + activeVol * 1.4;

  const getStatusBadge = () => {
    switch (status) {
      case 'connecting':
        return { text: 'Connecting Live Voice...', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'speaking':
        return { text: `${partnerName} is speaking...`, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'listening':
        return { text: isUserSpeaking ? 'Hearing you...' : 'Listening to you...', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'muted':
        return { text: 'Microphone Muted', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'error':
        return { text: 'Voice Offline', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      default:
        return { text: 'Ready', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="relative flex flex-col items-center justify-center py-6 px-4 select-none">
      {/* Outer Soundwave Rings */}
      <div className="relative flex items-center justify-center w-52 h-52 sm:w-60 sm:h-60">
        {/* Ring 3 (outermost) */}
        <div
          className={`absolute inset-0 rounded-full transition-transform duration-100 ease-out pointer-events-none ${
            isAiSpeaking
              ? 'bg-gradient-to-tr from-emerald-500/10 via-teal-400/15 to-transparent blur-md'
              : isUserSpeaking
              ? 'bg-gradient-to-tr from-indigo-500/15 via-violet-400/20 to-transparent blur-md'
              : 'bg-slate-700/10'
          }`}
          style={{ transform: `scale(${scaleRing3})` }}
        />

        {/* Ring 2 */}
        <div
          className={`absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border transition-transform duration-100 ease-out pointer-events-none ${
            isAiSpeaking
              ? 'border-emerald-400/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
              : isUserSpeaking
              ? 'border-indigo-400/40 shadow-[0_0_30px_rgba(99,102,241,0.25)]'
              : 'border-slate-700/40'
          }`}
          style={{ transform: `scale(${scaleRing2})` }}
        />

        {/* Ring 1 (inner wave) */}
        <div
          className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border transition-all duration-75 ease-out pointer-events-none ${
            isAiSpeaking
              ? 'border-teal-300/50 bg-teal-500/10'
              : isUserSpeaking
              ? 'border-violet-300/50 bg-violet-500/10'
              : 'border-slate-600/30 bg-slate-800/40'
          }`}
          style={{ transform: `scale(${scaleRing1})` }}
        />

        {/* Core Partner Orb */}
        <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700/80 shadow-2xl flex flex-col items-center justify-center p-3 text-center overflow-hidden">
          {/* Subtle glowing core */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              isAiSpeaking
                ? 'bg-emerald-500/20 opacity-100 animate-pulse'
                : isUserSpeaking
                ? 'bg-indigo-500/20 opacity-100 animate-pulse'
                : 'opacity-0'
            }`}
          />

          <span className="text-3xl sm:text-4xl filter drop-shadow mb-1 relative z-10">
            {languageFlag}
          </span>
          <span className="text-xs font-semibold text-slate-200 tracking-wide truncate max-w-[90px] relative z-10">
            {partnerName}
          </span>
          <span className="text-[10px] text-slate-400 truncate max-w-[95px] relative z-10">
            {partnerRole}
          </span>
        </div>
      </div>

      {/* Real-time Status Badge */}
      <div className="mt-4 flex items-center space-x-2">
        <div
          className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md transition-all ${badge.color}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'speaking'
                ? 'bg-emerald-400 animate-ping'
                : status === 'listening'
                ? 'bg-indigo-400 animate-pulse'
                : status === 'connecting'
                ? 'bg-amber-400 animate-spin'
                : 'bg-rose-400'
            }`}
          />
          <span>{badge.text}</span>
        </div>
      </div>

      {/* Dynamic Soundwave Bars */}
      <div className="flex items-center justify-center space-x-1.5 mt-3 h-6">
        {[0.4, 0.7, 1.0, 0.8, 0.5, 0.9, 0.6, 0.3].map((multiplier, idx) => {
          const height = Math.max(
            4,
            Math.min(24, Math.round(activeVol * 45 * multiplier + Math.random() * 3))
          );
          return (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all duration-75 ${
                isAiSpeaking
                  ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]'
                  : isUserSpeaking
                  ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]'
                  : 'bg-slate-700'
              }`}
              style={{ height: `${height}px` }}
            />
          );
        })}
      </div>
    </div>
  );
};
