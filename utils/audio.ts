// Simple Web Audio API Synthesizer for GashaQuiz
// This avoids external asset dependencies and provides snappy, procedural SFX.

let audioCtx: AudioContext | null = null;
let shuffleOscillator: OscillatorNode | null = null;
let shuffleGain: GainNode | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playCrank = () => {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(100, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
};

export const playShuffle = () => {
  const ctx = getCtx();
  if (shuffleOscillator) return; // Already playing

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Create a "rattle" effect using square wave and rapid modulation or just rapid pulses
  osc.type = 'square';
  osc.frequency.setValueAtTime(50, ctx.currentTime);

  // LFO to modulate amplitude for the rattle texture
  const lfo = ctx.createOscillator();
  lfo.type = 'sawtooth';
  lfo.frequency.value = 15; // Speed of rattle
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 500; // Depth

  filter.type = 'lowpass';
  filter.frequency.value = 400;

  gain.gain.setValueAtTime(0.1, ctx.currentTime);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  
  shuffleOscillator = osc;
  shuffleGain = gain;
};

export const stopShuffle = () => {
  if (shuffleOscillator && shuffleGain) {
    const ctx = getCtx();
    shuffleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    shuffleOscillator.stop(ctx.currentTime + 0.2);
    shuffleOscillator = null;
    shuffleGain = null;
  }
};

export const playPop = () => {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
};

export const playFlip = () => {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * 0.3; // 300ms
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // White noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, ctx.currentTime);
  filter.frequency.linearRampToValueAtTime(1500, ctx.currentTime + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
};
