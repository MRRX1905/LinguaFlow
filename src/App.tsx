import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScenarioPicker } from './components/ScenarioPicker';
import { VoiceRoom } from './components/VoiceRoom';
import { VocabModal } from './components/VocabModal';
import { InfoModal } from './components/InfoModal';
import { SUPPORTED_LANGUAGES, SCENARIOS } from './data/languagesAndScenarios';
import { LanguageConfig, Scenario, CEFRLevel } from './types';

interface SavedVocab {
  word: string;
  meaning: string;
  language: string;
  date: string;
}

export default function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageConfig>(SUPPORTED_LANGUAGES[0]);
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>('B1');
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [selectedVoice, setSelectedVoice] = useState<string>('Zephyr');
  const [isInSession, setIsInSession] = useState<boolean>(false);

  // User stats & stored vocabulary
  const [streakDays, setStreakDays] = useState<number>(() => {
    const saved = localStorage.getItem('linguaflow_streak');
    return saved ? parseInt(saved, 10) : 5;
  });

  const [totalMinutes, setTotalMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('linguaflow_minutes');
    return saved ? parseInt(saved, 10) : 34;
  });

  const [savedVocab, setSavedVocab] = useState<SavedVocab[]>(() => {
    const saved = localStorage.getItem('linguaflow_vocab');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        word: 'Me gustaría pedir...',
        meaning: "I would like to order... (polite conditional form)",
        language: 'Spanish',
        date: new Date().toLocaleDateString(),
      },
      {
        word: '¿Cuánto cuesta?',
        meaning: 'How much does it cost?',
        language: 'Spanish',
        date: new Date().toLocaleDateString(),
      },
      {
        word: 'Por supuesto',
        meaning: 'Of course / naturally',
        language: 'Spanish',
        date: new Date().toLocaleDateString(),
      },
    ];
  });

  const [showVocabModal, setShowVocabModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('linguaflow_streak', streakDays.toString());
  }, [streakDays]);

  useEffect(() => {
    localStorage.setItem('linguaflow_minutes', totalMinutes.toString());
  }, [totalMinutes]);

  useEffect(() => {
    localStorage.setItem('linguaflow_vocab', JSON.stringify(savedVocab));
  }, [savedVocab]);

  const handleRecordMinutes = (mins: number) => {
    setTotalMinutes((prev) => prev + mins);
  };

  const handleAddVocab = (vocab: SavedVocab) => {
    setSavedVocab((prev) => [vocab, ...prev]);
  };

  const handleDeleteVocab = (index: number) => {
    setSavedVocab((prev) => prev.filter((_, i) => i !== index));
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage.id;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        language={selectedLanguage}
        level={selectedLevel}
        streakDays={streakDays}
        totalMinutes={totalMinutes}
        onOpenVocab={() => setShowVocabModal(true)}
        onOpenInfo={() => setShowInfoModal(true)}
        isInSession={isInSession}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isInSession ? (
          <VoiceRoom
            language={selectedLanguage}
            level={selectedLevel}
            scenario={selectedScenario}
            voiceId={selectedVoice}
            onExit={() => setIsInSession(false)}
            onRecordMinutes={handleRecordMinutes}
          />
        ) : (
          <ScenarioPicker
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
            selectedScenario={selectedScenario}
            onSelectScenario={setSelectedScenario}
            selectedVoice={selectedVoice}
            onSelectVoice={setSelectedVoice}
            onStartSession={() => setIsInSession(true)}
          />
        )}
      </main>

      {/* Modals */}
      <VocabModal
        isOpen={showVocabModal}
        onClose={() => setShowVocabModal(false)}
        savedVocab={savedVocab}
        onDeleteVocab={handleDeleteVocab}
        onAddVocab={handleAddVocab}
        onSpeakPhrase={speakText}
        currentLanguage={selectedLanguage.name}
      />

      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
}
