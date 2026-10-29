import React from 'react';
import { Sparkles, X, Mic, Volume2, ShieldCheck, Zap } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 relative space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">How LinguaFlow Works</h3>
              <p className="text-xs text-slate-400">Real-time voice conversational immersion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start space-x-3">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Gemini Live API (gemini-3.8-live)</strong>
              <span>
                Unlike standard chatbots, your voice streams directly in raw 16kHz PCM audio and responses play back instantly in 24kHz studio quality. There are no awkward delays or turn-taking pauses.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start space-x-3">
            <Mic className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Natural Barge-In & Interruption</strong>
              <span>
                You can interrupt the AI at any time just like a human conversation! If you speak while the AI is talking, it stops immediately and listens to your question or reply.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start space-x-3">
            <Volume2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Adaptive CEFR Coaching</strong>
              <span>
                The AI adapts its speaking speed, vocabulary, and sentence complexity to your chosen level (A1 to C2). The background coach flags subtle grammar points and offers native phrasing hints.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Microphone & Privacy</strong>
              <span>
                Microphone audio is processed exclusively for your interactive practice session and is never stored permanently.
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
          >
            Got it, Let's Practice!
          </button>
        </div>
      </div>
    </div>
  );
};
