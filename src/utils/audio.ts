/**
 * Audio processing utilities for Gemini Live API
 * - Input: 16kHz PCM 16-bit little endian
 * - Output: 24kHz PCM 16-bit little endian
 */

// Resample Float32Array from inputRate to targetRate
function resampleFloat32(source: Float32Array, inputRate: number, targetRate: number): Float32Array {
  if (inputRate === targetRate) {
    return source;
  }
  const ratio = inputRate / targetRate;
  const targetLength = Math.round(source.length / ratio);
  const result = new Float32Array(targetLength);
  for (let i = 0; i < targetLength; i++) {
    const originIdx = i * ratio;
    const low = Math.floor(originIdx);
    const high = Math.min(low + 1, source.length - 1);
    const weight = originIdx - low;
    result[i] = source[low] * (1 - weight) + source[high] * weight;
  }
  return result;
}

// Convert Float32Array to 16-bit signed PCM ArrayBuffer
function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output.buffer;
}

// Convert ArrayBuffer to base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 string to Float32Array (from 16-bit signed PCM)
function base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0;
  }
  return float32;
}

export class LiveAudioRecorder {
  private audioCtx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private onChunkCallback: ((base64Pcm: string) => void) | null = null;
  private onVolumeCallback: ((vol: number) => void) | null = null;
  private isRecording: boolean = false;

  async start(
    onChunk: (base64Pcm: string) => void,
    onVolume?: (vol: number) => void
  ): Promise<void> {
    if (this.isRecording) return;
    this.onChunkCallback = onChunk;
    this.onVolumeCallback = onVolume || null;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Try 16000Hz or default context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      try {
        this.audioCtx = new AudioContextClass({ sampleRate: 16000 });
      } catch (e) {
        this.audioCtx = new AudioContextClass();
      }

      this.source = this.audioCtx.createMediaStreamSource(this.stream);
      // 4096 buffer length gives responsive 128ms packets
      this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1);

      this.source.connect(this.processor);
      this.processor.connect(this.audioCtx.destination);

      this.isRecording = true;

      this.processor.onaudioprocess = (e) => {
        if (!this.isRecording) return;
        const inputData = e.inputBuffer.getChannelData(0);

        // Volume calculation (RMS)
        if (this.onVolumeCallback) {
          let sumSquares = 0;
          for (let i = 0; i < inputData.length; i++) {
            sumSquares += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sumSquares / inputData.length);
          const normalized = Math.min(1, rms * 4); // Boost scale for UI visibility
          this.onVolumeCallback(normalized);
        }

        // Resample to 16000Hz if needed
        const resampled = resampleFloat32(inputData, this.audioCtx!.sampleRate, 16000);
        const pcm16Buffer = floatTo16BitPCM(resampled);
        const base64 = arrayBufferToBase64(pcm16Buffer);

        if (this.onChunkCallback) {
          this.onChunkCallback(base64);
        }
      };
    } catch (err) {
      this.stop();
      throw err;
    }
  }

  stop(): void {
    this.isRecording = false;
    if (this.processor) {
      try {
        this.processor.disconnect();
      } catch (e) {}
      this.processor = null;
    }
    if (this.source) {
      try {
        this.source.disconnect();
      } catch (e) {}
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
    if (this.onVolumeCallback) {
      this.onVolumeCallback(0);
    }
  }

  isActive(): boolean {
    return this.isRecording;
  }
}

export class LiveAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private onVolumeCallback: ((vol: number) => void) | null = null;
  private animFrameId: number | null = null;

  constructor(onVolume?: (vol: number) => void) {
    this.onVolumeCallback = onVolume || null;
  }

  private initContext(): void {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      // Output sample rate for Gemini Live is 24000Hz
      try {
        this.audioCtx = new AudioContextClass({ sampleRate: 24000 });
      } catch (e) {
        this.audioCtx = new AudioContextClass();
      }

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.connect(this.audioCtx.destination);
      this.startVolumeLoop();
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private startVolumeLoop(): void {
    if (!this.analyser || !this.onVolumeCallback) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const update = () => {
      if (this.analyser && this.onVolumeCallback) {
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 128);
        this.onVolumeCallback(normalized);
      }
      this.animFrameId = requestAnimationFrame(update);
    };
    this.animFrameId = requestAnimationFrame(update);
  }

  playChunk(base64Pcm: string): void {
    this.initContext();
    if (!this.audioCtx || !this.analyser) return;

    try {
      const float32Data = base64ToFloat32(base64Pcm);
      if (float32Data.length === 0) return;

      const buffer = this.audioCtx.createBuffer(1, float32Data.length, 24000);
      buffer.getChannelData(0).set(float32Data);

      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.analyser);

      const now = this.audioCtx.currentTime;
      const startTime = Math.max(now, this.nextStartTime);
      source.start(startTime);
      this.nextStartTime = startTime + buffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index > -1) {
          this.activeSources.splice(index, 1);
        }
      };
    } catch (e) {
      console.error('Error playing audio chunk:', e);
    }
  }

  interrupt(): void {
    // Stop all currently playing audio chunks immediately on interruption
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {}
    }
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    } else {
      this.nextStartTime = 0;
    }
    if (this.onVolumeCallback) {
      this.onVolumeCallback(0);
    }
  }

  stop(): void {
    this.interrupt();
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
    this.analyser = null;
  }
}
