# 🌐 LinguaFlow — Real-Time Conversational AI Language Partner

LinguaFlow is an immersive language learning application providing real-time, low-latency voice conversations with an adaptive AI conversational partner. Powered by Google's **Gemini Live API (`gemini-3.8-live`)** and **`gemini-3.8-flash`**, LinguaFlow allows learners to build speaking confidence through realistic roleplays, natural speech interactions, and instant pedagogical feedback.

---

## ✨ Features

### 🎙️ 1. Real-Time Voice Immersion with Gemini Live API (`gemini-3.8-live`)
- **Direct Low-Latency Audio Duplex**: Captures microphone audio in 16-bit 16kHz raw PCM and streams it directly to Gemini Live over WebSockets. Receives and plays back 24kHz studio-quality voice responses gaplessly via Web Audio API.
- **Natural Barge-In & Interruption**: Speak freely—if you interject while the AI is talking, playback stops immediately and the AI listens, replicating real human conversation dynamics.
- **Live Two-Way Transcriptions**: Real-time speech-to-text captions displayed for both the user's speech and the AI partner's responses.
- **Dynamic Soundwave Visualizer**: Multi-ring audio presence indicator that reacts dynamically to voice volume and frequency.

### 🌍 2. 10 Supported Languages & CEFR Adaptation
- **Supported Languages**:
  - 🇪🇸 Spanish (*Español*)
  - 🇫🇷 French (*Français*)
  - 🇯🇵 Japanese (*日本語*)
  - 🇩🇪 German (*Deutsch*)
  - 🇮🇹 Italian (*Italiano*)
  - 🇨🇳 Mandarin Chinese (*中文*)
  - 🇰🇷 Korean (*한국어*)
  - 🇧🇷 Portuguese (*Português*)
  - 🇮🇩 Indonesian (*Bahasa Indonesia*)
  - 🇬🇧 English (*ESL Practice*)
- **CEFR Level Selection (A1–C2)**:
  - **A1–A2 (Beginner / Elementary)**: Simpler vocabulary, shorter sentences, slower pacing, gentle bilingual guidance.
  - **B1–B2 (Intermediate / Upper-Intermediate)**: Everyday natural banter, common idioms, conversational follow-ups.
  - **C1–C2 (Advanced / Mastery)**: Nuanced vocabulary, colloquial slang, authentic native rhythm, cultural debates.
- **Voice Personas**: Choose from prebuilt Gemini voice profiles (`Zephyr`, `Puck`, `Kore`, `Charon`, `Fenrir`) mapped to friendly tutor personas.

### 🎭 3. Realistic Scenarios & Mission Objectives
- **Ordering at a Cozy Café**: Customize drinks, ask about pastries, and request the WiFi code.
- **Boutique Hotel Check-In**: Check in, request quiet upper-floor rooms, and inquire about breakfast hours.
- **Warung & Indonesian Street Food**: Order Nasi Goreng or Sate Ayam, specify spice levels, and chat with Pak Budi.
- **Tech & Career Job Interview**: Present career milestones and answer behavioral questions in formal registers.
- **Farmer's Market & Produce**: Select seasonal fruits and negotiate prices politely.
- **Casual Dinner & Hobbies Mixer**: Make friends, discuss favorite films, and share weekend plans.
- **Train Station & Travel**: Purchase tickets, verify departure platforms, and ask about transfers.
- **Pharmacy Consultation**: Describe symptoms and understand medication instructions.
- **Open Dialogue & Freeflow**: Chat about any topic, philosophy, culture, or daily life.

### 💡 4. Real-Time AI Coach
- **Instant Grammar Notes**: Identifies tense, gender, or preposition slips as you speak.
- **Native Phrasing Suggestions**: Suggests natural everyday expressions instead of literal translations.
- **Vocabulary Upgrades**: Highlights idiomatic phrasing and advanced synonyms.
- **Pronunciation Playback**: Listen to native pronunciation of any suggested sentence at any time.

### 🔍 5. In-Call "How Do I Say...?" Helper
- Stuck mid-sentence? Type what you want to say in English to receive:
  - Natural native expression in the target language
  - Phonetic guide and romanization
  - Literal breakdown and formality tips
  - One-click insertion into the ongoing conversation

### 📊 6. Post-Session CEFR Learning Report & Notebook
- **Performance Scores**: Fluency, Accuracy, and Vocabulary Richness percentages.
- **Estimated CEFR Rating**: Objective benchmark based on vocabulary complexity and conversation flow.
- **Key Strengths & Growth Focus**: Actionable advice for your next practice session.
- **Corrections Table**: Side-by-side comparison of learner turns and recommended native phrasing.
- **Vocabulary Notebook**: Save acquired words and idioms with meanings and audio playback.

---

## 🛠️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser (Client)                      │
│                                                             │
│  React 19 + Tailwind CSS + Web Audio API                    │
│  - 16kHz PCM Audio Recording (LiveAudioRecorder)            │
│  - 24kHz PCM Audio Playback (LiveAudioPlayer)               │
│  - Visualizer, Transcripts, Coach Drawer, Helper Modals     │
└───────────────▲─────────────────────────────▲───────────────┘
                │                             │
    WebSocket: /live (PCM Audio)      HTTP REST (/api/*)
                │                             │
┌───────────────▼─────────────────────────────▼───────────────┐
│                      Express Full-Stack Server              │
│                                                             │
│  server.ts                                                  │
│  - Vite Middleware (development mode)                       │
│  - WebSocket Server (bridges client mic & Gemini Live)      │
│  - API Routes:                                              │
│    • /api/chat            (gemini-3.8-flash fallback)       │
│    • /api/analyze-turn    (Instant grammar & coaching)      │
│    • /api/translate-hint  (How-do-I-say assistant)          │
│    • /api/session-summary (CEFR evaluation report)          │
└──────────────────────────────▲──────────────────────────────┘
                               │
                       @google/genai SDK
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Google Gemini API                        │
│                                                             │
│  • gemini-3.8-live  (Real-time audio streaming duplex)      │
│  • gemini-3.8-flash (Turn analysis, translation, summaries) │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or v22 recommended)
- `GEMINI_API_KEY` configured in `.env` (automatically provided in Google AI Studio)

### Installation
```bash
npm install
```

### Running Locally
```bash
npm run dev
```
The application will start on `http://localhost:3000`.

### Building for Production
```bash
npm run build
npm start
```

---

## 🔒 Privacy & Audio Handling
- Audio is streamed over encrypted WebSockets directly to the Gemini Live session.
- No audio recordings are permanently saved on disk; all evaluations and transcripts are kept in memory for the active session.
