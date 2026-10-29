import React, { useState, useEffect, useRef } from 'react';
import { LanguageConfig, Scenario, CEFRLevel, LiveTranscript, CoachFeedback, SessionReport } from '../types';
import { LiveAudioRecorder, LiveAudioPlayer } from '../utils/audio';
import { AudioVisualizer } from './AudioVisualizer';
import { LiveCoachDrawer } from './LiveCoachDrawer';
import { TranslateHelperModal } from './TranslateHelperModal';
import { SessionSummaryModal } from './SessionSummaryModal';
import {
  Mic,
  MicOff,
  PhoneOff,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Volume2,
  Send,
  Languages,
  AlertCircle,
  RefreshCw,
  Award,
} from 'lucide-react';

interface VoiceRoomProps {
  language: LanguageConfig;
  level: CEFRLevel;
  scenario: Scenario;
  voiceId: string;
  onExit: () => void;
  onRecordMinutes: (mins: number) => void;
}

export const VoiceRoom: React.FC<VoiceRoomProps> = ({
  language,
  level,
  scenario,
  voiceId,
  onExit,
  onRecordMinutes,
}) => {
  // Connection and Session state
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'listening' | 'speaking' | 'muted' | 'idle' | 'error'
  >('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Audio visualization volumes
  const [userVolume, setUserVolume] = useState(0);
  const [aiVolume, setAiVolume] = useState(0);

  // Transcripts & Real-time coaching
  const [transcripts, setTranscripts] = useState<LiveTranscript[]>([]);
  const [latestFeedback, setLatestFeedback] = useState<CoachFeedback | null>(null);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [translatedMap, setTranslatedMap] = useState<Record<string, string>>({});

  // Text mode & in-call helpers
  const [textInput, setTextInput] = useState('');
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [showCoachDrawer, setShowCoachDrawer] = useState(false);

  // End of session report
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryReport, setSummaryReport] = useState<SessionReport | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Refs for audio instances & WebSocket
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<LiveAudioRecorder | null>(null);
  const playerRef = useRef<LiveAudioPlayer | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const currentAiTranscriptId = useRef<string | null>(null);
  const currentUserTranscriptId = useRef<string | null>(null);
  const lastAnalyzedTurn = useRef<string>('');

  const tutorPersona = language.voices.find((v) => v.id === voiceId)?.name || 'Elena';

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Scroll to bottom of transcripts
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Voice synthesis helper for repeating phrases
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language.id;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Analyze a user utterance with gemini-3.8-flash for coaching feedback
  const triggerCoachAnalysis = async (userText: string) => {
    if (!userText || userText.trim().length < 3) return;
    if (userText === lastAnalyzedTurn.current) return;
    lastAnalyzedTurn.current = userText;

    try {
      const res = await fetch('/api/analyze-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: userText,
          language: language.name,
          level: level,
          context: scenario.title,
        }),
      });
      const data = await res.json();
      if (data && (data.naturalAlternative || data.grammarCorrection || data.praise)) {
        setLatestFeedback(data);
        // Automatically check off missions if user completed them
        for (const mission of scenario.missions) {
          if (!completedMissions.includes(mission)) {
            const lowerUser = userText.toLowerCase();
            const lowerMission = mission.toLowerCase();
            // Basic heuristic or mark on progress
            if (lowerMission.split(' ').some((word) => word.length > 4 && lowerUser.includes(word))) {
              setCompletedMissions((prev) => [...prev, mission]);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Could not analyze user turn:', err);
    }
  };

  // Initialize Audio & WebSocket Connection
  const connectLiveSession = async () => {
    setConnectionStatus('connecting');
    setErrorMessage(null);

    // Initialize audio player
    playerRef.current = new LiveAudioPlayer((vol) => {
      setAiVolume(vol);
      if (vol > 0.05) {
        setConnectionStatus((prev) => (prev !== 'muted' ? 'speaking' : prev));
      } else {
        setConnectionStatus((prev) => (prev === 'speaking' ? 'listening' : prev));
      }
    });

    // Initialize audio recorder
    recorderRef.current = new LiveAudioRecorder();

    // Determine WS Protocol & URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live?language=${encodeURIComponent(
      language.name
    )}&level=${encodeURIComponent(level)}&scenario=${encodeURIComponent(
      scenario.title
    )}&voice=${encodeURIComponent(voiceId)}&tutor=${encodeURIComponent(tutorPersona)}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log('Connected to Live WebSocket');
        try {
          await recorderRef.current?.start(
            (base64Pcm) => {
              if (ws.readyState === WebSocket.OPEN && !isMuted) {
                ws.send(JSON.stringify({ type: 'audio', audio: base64Pcm }));
              }
            },
            (vol) => {
              setUserVolume(vol);
            }
          );
          setConnectionStatus('listening');
        } catch (micErr: any) {
          console.warn('Microphone access denied or failed:', micErr);
          setErrorMessage(
            'Microphone access was denied or is unavailable. You can still practice by typing messages below!'
          );
          setConnectionStatus('idle');
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'ready') {
            setConnectionStatus('listening');
          } else if (msg.type === 'audio' && msg.audio) {
            playerRef.current?.playChunk(msg.audio);
          } else if (msg.type === 'interrupted') {
            playerRef.current?.interrupt();
            setAiVolume(0);
          } else if (msg.type === 'outputTranscript' && msg.text) {
            // Append or update AI transcript
            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.speaker === 'ai' && last.id === currentAiTranscriptId.current) {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: last.text + ' ' + msg.text },
                ];
              } else {
                const newId = 'ai-' + Date.now();
                currentAiTranscriptId.current = newId;
                return [
                  ...prev,
                  {
                    id: newId,
                    speaker: 'ai',
                    text: msg.text,
                    timestamp: Date.now(),
                  },
                ];
              }
            });
          } else if (msg.type === 'inputTranscript' && msg.text) {
            // Append or update User transcript
            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.speaker === 'user' && last.id === currentUserTranscriptId.current) {
                const updatedText = last.text + ' ' + msg.text;
                triggerCoachAnalysis(updatedText);
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: updatedText },
                ];
              } else {
                const newId = 'user-' + Date.now();
                currentUserTranscriptId.current = newId;
                triggerCoachAnalysis(msg.text);
                return [
                  ...prev,
                  {
                    id: newId,
                    speaker: 'user',
                    text: msg.text,
                    timestamp: Date.now(),
                  },
                ];
              }
            });
          } else if (msg.type === 'turnComplete') {
            // Reset active turn IDs for fresh bubbles
            currentAiTranscriptId.current = null;
            currentUserTranscriptId.current = null;
          } else if (msg.type === 'error') {
            setErrorMessage(msg.message || 'Error occurred in live session');
          }
        } catch (e) {
          console.error('Error parsing live WS message:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('Live WS error:', err);
        setErrorMessage('Connection to live voice server failed. Please try reconnecting.');
        setConnectionStatus('error');
      };

      ws.onclose = () => {
        console.log('Live WS closed');
      };
    } catch (err: any) {
      console.error('Could not connect to Live WS:', err);
      setErrorMessage(err?.message || 'Could not connect to voice server');
      setConnectionStatus('error');
    }
  };

  // Start on mount, cleanup on unmount
  useEffect(() => {
    connectLiveSession();
    return () => {
      recorderRef.current?.stop();
      playerRef.current?.stop();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Toggle Mute
  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setConnectionStatus('listening');
    } else {
      setIsMuted(true);
      setConnectionStatus('muted');
    }
  };

  // Send Text Message into Live Session or Chat fallback
  const handleSendText = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim()) return;

    const message = textInput.trim();
    setTextInput('');

    // Add to transcripts immediately
    const userTurn: LiveTranscript = {
      id: 'user-' + Date.now(),
      speaker: 'user',
      text: message,
      timestamp: Date.now(),
    };
    setTranscripts((prev) => [...prev, userTurn]);
    triggerCoachAnalysis(message);

    // If WS open, send into live session
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text', text: message }));
    } else {
      // Fallback HTTP route
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            history: transcripts,
            language: language.name,
            level: level,
            scenario: scenario.title,
            persona: tutorPersona,
          }),
        });
        const data = await res.json();
        if (data.reply) {
          const aiTurn: LiveTranscript = {
            id: 'ai-' + Date.now(),
            speaker: 'ai',
            text: data.reply,
            timestamp: Date.now(),
          };
          setTranscripts((prev) => [...prev, aiTurn]);
          speakText(data.reply);
        }
      } catch (err) {
        console.error('Chat fallback failed:', err);
      }
    }
  };

  // End Session & Generate Report
  const handleEndSession = async () => {
    // Stop recording and player
    recorderRef.current?.stop();
    playerRef.current?.stop();
    if (wsRef.current) {
      wsRef.current.close();
    }

    onRecordMinutes(Math.max(1, Math.round(sessionSeconds / 60)));
    setShowSummaryModal(true);
    setSummaryLoading(true);

    try {
      const res = await fetch('/api/session-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcripts: transcripts,
          language: language.name,
          level: level,
          scenario: scenario.title,
          durationSeconds: sessionSeconds,
        }),
      });
      const data = await res.json();
      setSummaryReport(data);
    } catch (err) {
      console.error('Failed to generate summary report:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Translate a specific message bubble
  const handleTranslateBubble = async (id: string, text: string) => {
    if (translatedMap[id]) {
      // Toggle off
      setTranslatedMap((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      return;
    }

    try {
      const res = await fetch('/api/translate-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phrase: text,
          language: 'English',
          context: 'Conversation transcript',
        }),
      });
      const data = await res.json();
      if (data.translation) {
        setTranslatedMap((prev) => ({ ...prev, [id]: data.translation }));
      }
    } catch (err) {
      console.warn('Translate bubble failed:', err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 gap-4">
      {/* Top Session Status Bar */}
      <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="text-2xl sm:text-3xl">{language.flag}</span>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold text-white">
                {scenario.title}
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {level}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Partner: <strong className="text-slate-200">{tutorPersona}</strong> ({scenario.partnerRole})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Practice Timer */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/60 text-xs font-mono font-semibold text-slate-200 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{formatTime(sessionSeconds)}</span>
          </div>

          {/* Toggle Coach Drawer (mobile & compact) */}
          <button
            onClick={() => setShowCoachDrawer(!showCoachDrawer)}
            className={`p-2 rounded-xl text-xs font-medium border transition lg:hidden flex items-center space-x-1.5 ${
              showCoachDrawer
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Coach</span>
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndSession}
            className="inline-flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30 transition cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End & Review</span>
          </button>
        </div>
      </div>

      {/* Main Practice Workspace (2 columns on lg screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Column: Audio Visualizer + Live Transcripts Stream (7 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-4 overflow-hidden relative">
          {/* Top Visualizer Area */}
          <div className="shrink-0 border-b border-slate-800/80 pb-3">
            <AudioVisualizer
              status={connectionStatus}
              userVolume={userVolume}
              aiVolume={aiVolume}
              partnerName={tutorPersona}
              partnerRole={scenario.partnerRole}
              languageFlag={language.flag}
            />

            {/* Error / Alert banner if any */}
            {errorMessage && (
              <div className="mx-2 mt-2 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={connectLiveSession}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-[11px] transition flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}
          </div>

          {/* Middle: Real-Time Transcripts Stream */}
          <div className="flex-1 overflow-y-auto py-4 px-2 space-y-3 min-h-[160px]">
            {transcripts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 text-slate-500 space-y-2">
                <MessageSquare className="w-8 h-8 stroke-1 text-slate-600" />
                <p className="text-xs max-w-xs">
                  Your live spoken dialogue will be transcribed here in real-time. Speak into your microphone to practice!
                </p>
              </div>
            ) : (
              transcripts.map((t) => {
                const isAi = t.speaker === 'ai';
                return (
                  <div
                    key={t.id}
                    className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed relative group shadow-md transition ${
                        isAi
                          ? 'bg-slate-800/90 border border-slate-700/70 text-slate-100 rounded-tl-sm'
                          : 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-600/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isAi ? 'text-indigo-400' : 'text-indigo-200'
                          }`}
                        >
                          {isAi ? tutorPersona : 'You'}
                        </span>

                        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                          <button
                            onClick={() => speakText(t.text)}
                            title="Pronounce again"
                            className="p-1 hover:bg-black/20 rounded text-inherit"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleTranslateBubble(t.id, t.text)}
                            title="Translate"
                            className="p-1 hover:bg-black/20 rounded text-inherit"
                          >
                            <Languages className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className="font-medium">{t.text}</p>

                      {/* In-place translation preview */}
                      {translatedMap[t.id] && (
                        <div className="mt-2 pt-2 border-t border-white/20 text-xs italic opacity-90 text-indigo-100">
                          Translation: {translatedMap[t.id]}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* Bottom Controls Bar */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            {/* Quick Helper Button and Input Row */}
            <form onSubmit={handleSendText} className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleToggleMute}
                className={`p-3 rounded-2xl transition flex items-center justify-center shrink-0 cursor-pointer ${
                  isMuted
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                }`}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setShowTranslateModal(true)}
                className="px-3 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition text-xs font-semibold flex items-center space-x-1.5 shrink-0"
                title="How do I say..."
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">How do I say?</span>
              </button>

              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={`Speak into mic or type in ${language.name}...`}
                className="flex-1 bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />

              <button
                type="submit"
                disabled={!textInput.trim()}
                className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition shrink-0 shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Coach Drawer & Missions (4 cols on lg screens, modal or drawer on small) */}
        <div
          className={`lg:col-span-4 lg:block h-full ${
            showCoachDrawer
              ? 'fixed inset-x-4 top-20 bottom-4 z-40 block shadow-2xl'
              : 'hidden'
          }`}
        >
          <LiveCoachDrawer
            latestFeedback={latestFeedback}
            scenario={scenario}
            completedMissions={completedMissions}
            onToggleMission={(mission) => {
              if (completedMissions.includes(mission)) {
                setCompletedMissions(completedMissions.filter((m) => m !== mission));
              } else {
                setCompletedMissions([...completedMissions, mission]);
              }
            }}
            onSpeakPhrase={speakText}
            targetLanguage={language.name}
            targetLanguageId={language.id}
          />
        </div>
      </div>

      {/* Helper Modals */}
      <TranslateHelperModal
        isOpen={showTranslateModal}
        onClose={() => setShowTranslateModal(false)}
        targetLanguage={language.name}
        context={scenario.title}
        onSendPhrase={(phrase) => {
          setTextInput(phrase);
        }}
        onSpeakPhrase={speakText}
      />

      <SessionSummaryModal
        report={summaryReport}
        loading={summaryLoading}
        onClose={() => {
          setShowSummaryModal(false);
          onExit();
        }}
        onRestart={() => {
          setShowSummaryModal(false);
          setTranscripts([]);
          setLatestFeedback(null);
          setCompletedMissions([]);
          setSessionSeconds(0);
          connectLiveSession();
        }}
        onSpeakPhrase={speakText}
      />
    </div>
  );
};
