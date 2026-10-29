import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/live' });
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Shared Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for building system prompt
function buildSystemInstruction(language: string, level: string, scenario: string, tutorName: string): string {
  return `You are ${tutorName}, a warm, encouraging, native-speaking language partner and coach practicing ${language} with a learner.
Target Language: ${language}
Learner's CEFR Level: ${level}
Roleplay Scenario / Context: ${scenario}

Core conversational rules:
1. Speak ONLY in ${language} during normal conversation, unless the learner explicitly asks for an explanation, translation, or looks stuck.
2. Adapt your vocabulary, sentence structure, and speed to their level (${level}):
   - If Beginner (A1-A2): Use simple, clear, everyday vocabulary. Keep sentences short. If they hesitate, gently guide them.
   - If Intermediate (B1-B2): Converse naturally, incorporate common idioms, ask follow-up questions, and encourage them to elaborate.
   - If Advanced (C1-C2): Use authentic colloquial expressions, nuanced vocabulary, and talk at a natural native pace.
3. Stay strictly in character for the scenario "${scenario}". For example, if it's a café, act like a welcoming barista; if it's a job interview, be a professional interviewer; if it's casual banter, be a friendly peer.
4. Keep spoken responses concise (1 to 3 conversational sentences max per turn) so the conversation flows back and forth naturally like a real human voice chat. Do not lecture.
5. If the learner makes a slight grammar slip, you can naturally model the correct phrase back in your response without breaking character, or offer a brief 1-sentence tip if it aids comprehension.
6. Make the interaction fun, empathetic, lively, and realistic!`;
}

// WebSocket bridge for Gemini Live API
wss.on('connection', async (clientWs: WebSocket, req) => {
  console.log('Client connected to Live WebSocket');

  // Parse query parameters
  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const language = url.searchParams.get('language') || 'Spanish';
  const level = url.searchParams.get('level') || 'Intermediate (B1-B2)';
  const scenario = url.searchParams.get('scenario') || 'Casual Friendly Chat';
  const voiceName = url.searchParams.get('voice') || 'Zephyr';
  const tutorName = url.searchParams.get('tutor') || 'Elena';

  let session: any = null;
  let isSessionReady = false;

  try {
    const systemInstruction = buildSystemInstruction(language, level, scenario, tutorName);

    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName,
            },
          },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: systemInstruction,
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          if (clientWs.readyState !== WebSocket.OPEN) return;

          const content = message.serverContent;
          if (content?.inputTranscription?.text) {
            clientWs.send(
              JSON.stringify({
                type: 'inputTranscript',
                text: content.inputTranscription.text,
              })
            );
          }

          if (content?.outputTranscription?.text) {
            clientWs.send(
              JSON.stringify({
                type: 'outputTranscript',
                text: content.outputTranscription.text,
              })
            );
          }

          for (const part of content?.modelTurn?.parts ?? []) {
            if (part.inlineData?.data) {
              clientWs.send(
                JSON.stringify({
                  type: 'audio',
                  audio: part.inlineData.data,
                })
              );
            }
          }

          if (content?.interrupted) {
            clientWs.send(
              JSON.stringify({
                type: 'interrupted',
                interrupted: true,
              })
            );
          }

          if (content?.turnComplete) {
            clientWs.send(
              JSON.stringify({
                type: 'turnComplete',
              })
            );
          }
        },
        onerror: (err: any) => {
          console.error('Gemini Live session error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(
              JSON.stringify({
                type: 'error',
                message: err?.message || 'Error occurred in voice conversation session',
              })
            );
          }
        },
        onclose: () => {
          console.log('Gemini Live session closed');
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'closed' }));
          }
        },
      },
    });

    isSessionReady = true;
    clientWs.send(JSON.stringify({ type: 'ready' }));

    // Send initial greeting trigger to the model so the AI initiates the conversation naturally
    try {
      session.send({
        clientContent: {
          turns: [
            {
              role: 'user',
              parts: [
                {
                  text: `[SYSTEM EVENT: The learner just joined the session. Greet them warmly in ${language} as your persona in the "${scenario}" scenario in 1-2 friendly sentences to kick off our practice.]`,
                },
              ],
            },
          ],
          turnComplete: true,
        },
      });
    } catch (e) {
      console.warn('Could not send initial greeting trigger:', e);
    }
  } catch (err: any) {
    console.error('Failed to initialize Gemini Live session:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: 'error',
          message: err?.message || 'Unable to connect to Gemini Live. Check your API key or network.',
        })
      );
    }
    return;
  }

  clientWs.on('message', (rawData) => {
    if (!isSessionReady || !session) return;
    try {
      const msg = JSON.parse(rawData.toString());

      if (msg.type === 'audio' && msg.audio) {
        session.sendRealtimeInput({
          audio: {
            data: msg.audio,
            mimeType: 'audio/pcm;rate=16000',
          },
        });
      } else if (msg.type === 'text' && msg.text) {
        session.send({
          clientContent: {
            turns: [
              {
                role: 'user',
                parts: [{ text: msg.text }],
              },
            ],
            turnComplete: true,
          },
        });
      }
    } catch (e) {
      console.error('Error handling client message:', e);
    }
  });

  clientWs.on('close', () => {
    if (session) {
      try {
        session.close();
      } catch (e) {
        // ignore
      }
      session = null;
    }
  });
});

// API Routes
// 1. Text-based conversation fallback with gemini-3.8-flash
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, language, level, scenario, persona } = req.body;
    const systemInstruction = buildSystemInstruction(
      language || 'Spanish',
      level || 'Intermediate (B1-B2)',
      scenario || 'Casual conversation',
      persona || 'Partner'
    );

    const formattedContents = [
      ...(history || []).map((h: any) => ({
        role: h.role === 'ai' ? 'model' : 'user',
        parts: [{ text: h.text }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate response' });
  }
});

// 2. Real-time feedback & grammar coaching on a user turn
app.post('/api/analyze-turn', async (req, res) => {
  try {
    const { text, language, level, context } = req.body;
    if (!text || text.trim().length === 0) {
      return res.json({ analysis: null });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an elite language coach. Analyze this learner's utterance in ${language} (CEFR level: ${level}):
Utterance: "${text}"
Recent context: "${context || 'Conversation'}"

Provide a structured JSON response evaluating this utterance:
- isAccurate: boolean (true if natural and grammatically correct)
- naturalAlternative: string (the most natural native way to express this idea)
- englishTranslation: string (accurate English translation of what they meant)
- grammarCorrection: string or null (brief clear note if there was a grammar/gender/tense mistake)
- vocabularyBoost: string or null (one interesting advanced synonym or idiom related to this)
- praise: string (brief 1-sentence supportive remark)
`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: error?.message || 'Failed to analyze turn' });
  }
});

// 3. Instant translation helper ("How do I say X")
app.post('/api/translate-hint', async (req, res) => {
  try {
    const { phrase, language, context } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `The learner wants to say: "${phrase}" in ${language}.
Context: "${context || 'General conversation'}"

Return JSON:
{
  "translation": "natural native translation in ${language}",
  "phonetic": "pronunciation guide or romanization",
  "literal": "word-by-word breakdown or literal meaning if helpful",
  "usageTip": "brief cultural or formality tip"
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Translate hint error:', error);
    res.status(500).json({ error: error?.message || 'Failed to translate' });
  }
});

// 4. End-of-session evaluation report
app.post('/api/session-summary', async (req, res) => {
  try {
    const { transcripts, language, level, scenario, durationSeconds } = req.body;

    const transcriptText = (transcripts || [])
      .map((t: any) => `${t.speaker}: ${t.text}`)
      .join('\n');

    const prompt = `You are a certified master language assessor. Review this language practice session transcript in ${language}:
Learner target level: ${level}
Scenario: ${scenario}
Duration: ${durationSeconds || 120} seconds

Transcript:
${transcriptText || '(Short practice)'}

Generate a comprehensive, uplifting, and pedagogical assessment report in JSON format:
{
  "estimatedCEFR": "e.g. B1",
  "fluencyScore": 85,
  "accuracyScore": 80,
  "vocabularyRichnessScore": 75,
  "overallFeedback": "2-3 paragraphs of encouraging, specific feedback",
  "keyStrengths": ["Strength 1", "Strength 2", "Strength 3"],
  "areasToImprove": ["Area 1", "Area 2"],
  "mistakesAndCorrections": [
    {
      "original": "what learner said",
      "corrected": "native correct phrasing",
      "explanation": "why this is better"
    }
  ],
  "vocabularyLearned": [
    {
      "word": "target word",
      "meaning": "definition in English",
      "example": "example sentence in ${language}"
    }
  ],
  "nextMissionRecommendation": "Specific tip or next topic to practice"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const report = JSON.parse(response.text || '{}');
    res.json(report);
  } catch (error: any) {
    console.error('Session summary error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate session summary' });
  }
});

// Setup Vite in Dev or Static files in Prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LinguaFlow server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
