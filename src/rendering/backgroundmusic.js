/**
 * House Music Generator
 * A procedural house music generator using the Web Audio API
 *
 * Features:
 * - Four-on-the-floor kick drum at 124 BPM
 * - Offbeat hi-hats, claps on 2 and 4, percussion
 * - Deep rolling bassline with syncopation
 * - Warm 7th chord stabs and pads (Rhodes/organ quality)
 * - Endless arrangement with waxing/waning dynamics
 * - Reverb, delay, and filter sweep effects
 *
 * To test standalone (without dev server):
 * 1. Open test-audio.html in a browser, OR
 * 2. Open browser console and run: import('./audio.js').then(m => m.startHouseMusic())
 */

// ============================================================================
// AUDIO CONTEXT AND MASTER SETUP
// ============================================================================

let audioContext = null;
let masterGain = null;
let isPlaying = false;
let schedulerInterval = null;
let currentBeat = 0;
let nextNoteTime = 0;

// BPM and timing
const BPM = 124;
const SECONDS_PER_BEAT = 60 / BPM;
const SCHEDULE_AHEAD_TIME = 0.1;
const SCHEDULER_INTERVAL_MS = 25;

// ============================================================================
// EFFECTS CHAIN
// ============================================================================

let masterFilter = null;
let masterReverb = null;
let delayNode = null;
let delayFeedback = null;
let delayFilter = null;

function createReverb(context, duration = 2, decay = 2) {
  const sampleRate = context.sampleRate;
  const length = sampleRate * duration;
  const impulse = context.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }

  const convolver = context.createConvolver();
  convolver.buffer = impulse;
  return convolver;
}

function setupEffectsChain() {
  // Master filter for sweeps
  masterFilter = audioContext.createBiquadFilter();
  masterFilter.type = 'lowpass';
  masterFilter.frequency.value = 20000;
  masterFilter.Q.value = 1;

  // Reverb send
  masterReverb = createReverb(audioContext, 2.5, 2);
  const reverbGain = audioContext.createGain();
  reverbGain.gain.value = 0.3;

  // Delay
  delayNode = audioContext.createDelay(1);
  delayNode.delayTime.value = SECONDS_PER_BEAT * 0.75; // Dotted eighth

  delayFeedback = audioContext.createGain();
  delayFeedback.gain.value = 0.35;

  delayFilter = audioContext.createBiquadFilter();
  delayFilter.type = 'lowpass';
  delayFilter.frequency.value = 3000;

  // Delay feedback loop
  delayNode.connect(delayFilter);
  delayFilter.connect(delayFeedback);
  delayFeedback.connect(delayNode);

  // Delay output
  const delayWet = audioContext.createGain();
  delayWet.gain.value = 0.25;
  delayFilter.connect(delayWet);
  delayWet.connect(masterFilter);

  // Reverb chain
  masterReverb.connect(reverbGain);
  reverbGain.connect(masterFilter);

  // Master output
  masterFilter.connect(masterGain);
  masterGain.connect(audioContext.destination);
}

// ============================================================================
// ARRANGEMENT STATE - Controls which elements are active
// ============================================================================

const arrangement = {
  kick: { active: true, volume: 1.0 },
  hihat: { active: false, volume: 0.7 },
  clap: { active: false, volume: 0.6 },
  shaker: { active: false, volume: 0.4 },
  conga: { active: false, volume: 0.5 },
  bass: { active: false, volume: 0.8 },
  chord: { active: false, volume: 0.5 },
  pad: { active: false, volume: 0.4 },
  perc: { active: false, volume: 0.35 }
};

// Track current section for arrangement
let currentSection = 0;
let beatsInSection = 0;
const BEATS_PER_SECTION = 64; // 8 bars per section

// Filter sweep state
let filterSweepActive = false;
let filterSweepDirection = 1;
let filterBaseFreq = 20000;

// Chord progression state
let currentChordIndex = 0;
const CHORD_PROGRESSION = [
  // Am7 - Dm7 - G7 - Cmaj7 (classic house progression)
  { root: 57, type: 'min7' },  // Am7
  { root: 62, type: 'min7' },  // Dm7
  { root: 55, type: 'dom7' },  // G7
  { root: 60, type: 'maj7' }   // Cmaj7
];

// ============================================================================
// ARRANGEMENT MANAGER - Waxing and waning
// ============================================================================

function updateArrangement() {
  beatsInSection++;

  if (beatsInSection >= BEATS_PER_SECTION) {
    beatsInSection = 0;
    currentSection++;

    // Evolve the arrangement
    evolveArrangement();
  }

  // Update chord every 4 bars (16 beats)
  if (currentBeat % 16 === 0) {
    currentChordIndex = (currentChordIndex + 1) % CHORD_PROGRESSION.length;
  }

  // Gradual filter sweeps
  updateFilterSweep();
}

function evolveArrangement() {
  const section = currentSection % 16; // 16 section cycle

  // Define arrangement evolution for endless waxing/waning
  switch (section) {
    case 0: // Intro - just kick
      setArrangement({ kick: true, hihat: false, clap: false, shaker: false, conga: false, bass: false, chord: false, pad: false, perc: false });
      break;
    case 1: // Add hats
      setArrangement({ kick: true, hihat: true, clap: false, shaker: false, conga: false, bass: false, chord: false, pad: false, perc: false });
      break;
    case 2: // Add clap and bass
      setArrangement({ kick: true, hihat: true, clap: true, shaker: false, conga: false, bass: true, chord: false, pad: false, perc: false });
      break;
    case 3: // Add shaker
      setArrangement({ kick: true, hihat: true, clap: true, shaker: true, conga: false, bass: true, chord: false, pad: false, perc: false });
      break;
    case 4: // Add chords - building energy
      setArrangement({ kick: true, hihat: true, clap: true, shaker: true, conga: false, bass: true, chord: true, pad: false, perc: false });
      filterSweepActive = true;
      filterSweepDirection = 1;
      break;
    case 5: // Full arrangement
      setArrangement({ kick: true, hihat: true, clap: true, shaker: true, conga: true, bass: true, chord: true, pad: true, perc: true });
      filterSweepActive = false;
      masterFilter.frequency.value = 20000;
      break;
    case 6: // Peak - all elements
      setArrangement({ kick: true, hihat: true, clap: true, shaker: true, conga: true, bass: true, chord: true, pad: true, perc: true });
      break;
    case 7: // Start breakdown - drop kick and bass
      setArrangement({ kick: false, hihat: true, clap: false, shaker: true, conga: false, bass: false, chord: true, pad: true, perc: false });
      filterSweepActive = true;
      filterSweepDirection = -1;
      break;
    case 8: // Deep breakdown - minimal
      setArrangement({ kick: false, hihat: false, clap: false, shaker: true, conga: false, bass: false, chord: false, pad: true, perc: false });
      break;
    case 9: // Build back - add hats
      setArrangement({ kick: false, hihat: true, clap: false, shaker: true, conga: false, bass: false, chord: true, pad: true, perc: false });
      filterSweepActive = true;
      filterSweepDirection = 1;
      break;
    case 10: // Drop incoming - snare roll would go here
      setArrangement({ kick: false, hihat: true, clap: true, shaker: true, conga: true, bass: false, chord: true, pad: true, perc: true });
      break;
    case 11: // THE DROP - full energy
      setArrangement({ kick: true, hihat: true, clap: true, shaker: true, conga: true, bass: true, chord: true, pad: true, perc: true });
      filterSweepActive = false;
      masterFilter.frequency.value = 20000;
      break;
    case 12: // Maintain energy
      setArrangement({ kick: true, hihat: true, clap: true, shaker: true, conga: true, bass: true, chord: true, pad: false, perc: true });
      break;
    case 13: // Start winding down
      setArrangement({ kick: true, hihat: true, clap: true, shaker: false, conga: false, bass: true, chord: true, pad: false, perc: false });
      break;
    case 14: // Continue wind down
      setArrangement({ kick: true, hihat: true, clap: false, shaker: false, conga: false, bass: true, chord: false, pad: false, perc: false });
      break;
    case 15: // Outro - minimal before cycle repeats
      setArrangement({ kick: true, hihat: true, clap: false, shaker: false, conga: false, bass: false, chord: false, pad: false, perc: false });
      filterSweepActive = true;
      filterSweepDirection = -1;
      break;
  }
}

function setArrangement(config) {
  for (const [key, value] of Object.entries(config)) {
    arrangement[key].active = value;
  }
}

function updateFilterSweep() {
  if (!filterSweepActive) return;

  const sweepSpeed = 50; // Hz per beat
  filterBaseFreq += sweepSpeed * filterSweepDirection;
  filterBaseFreq = Math.max(200, Math.min(20000, filterBaseFreq));

  masterFilter.frequency.setTargetAtTime(filterBaseFreq, audioContext.currentTime, 0.1);
}

// ============================================================================
// SOUND GENERATORS
// ============================================================================

// --- KICK DRUM ---
function playKick(time, velocity = 1) {
  if (!arrangement.kick.active) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.05);

  gain.gain.setValueAtTime(velocity * arrangement.kick.volume, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

  // Add some click/transient
  const clickOsc = audioContext.createOscillator();
  const clickGain = audioContext.createGain();
  clickOsc.type = 'square';
  clickOsc.frequency.setValueAtTime(1000, time);
  clickOsc.frequency.exponentialRampToValueAtTime(100, time + 0.01);
  clickGain.gain.setValueAtTime(0.3 * velocity, time);
  clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

  osc.connect(gain);
  clickOsc.connect(clickGain);
  gain.connect(masterFilter);
  clickGain.connect(masterFilter);

  osc.start(time);
  osc.stop(time + 0.5);
  clickOsc.start(time);
  clickOsc.stop(time + 0.05);
}

// --- HI-HAT ---
function playHiHat(time, open = false, velocity = 1) {
  if (!arrangement.hihat.active) return;

  const fundamental = 40;
  const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];

  const gainNode = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7000;

  gainNode.gain.setValueAtTime(0.3 * velocity * arrangement.hihat.volume, time);
  gainNode.gain.exponentialRampToValueAtTime(0.001, time + (open ? 0.3 : 0.08));

  ratios.forEach(ratio => {
    const osc = audioContext.createOscillator();
    osc.type = 'square';
    osc.frequency.value = fundamental * ratio;
    osc.connect(filter);
    osc.start(time);
    osc.stop(time + (open ? 0.35 : 0.1));
  });

  filter.connect(gainNode);
  gainNode.connect(masterFilter);
  gainNode.connect(delayNode); // Send to delay
}

// --- CLAP ---
function playClap(time, velocity = 1) {
  if (!arrangement.clap.active) return;

  const noise = createNoise(audioContext, 0.15);
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 1;

  // Multiple short bursts for clap texture
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(velocity * arrangement.clap.volume, time + 0.005);
  gain.gain.linearRampToValueAtTime(0.1 * velocity, time + 0.01);
  gain.gain.linearRampToValueAtTime(velocity * arrangement.clap.volume * 0.8, time + 0.015);
  gain.gain.linearRampToValueAtTime(0.1 * velocity, time + 0.02);
  gain.gain.linearRampToValueAtTime(velocity * arrangement.clap.volume * 0.6, time + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(masterFilter);
  gain.connect(masterReverb); // Heavy reverb on clap

  noise.start(time);
  noise.stop(time + 0.2);
}

// --- SHAKER ---
function playShaker(time, velocity = 1) {
  if (!arrangement.shaker.active) return;

  const noise = createNoise(audioContext, 0.1);
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  filter.type = 'bandpass';
  filter.frequency.value = 8000;
  filter.Q.value = 2;

  gain.gain.setValueAtTime(velocity * 0.15 * arrangement.shaker.volume, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(masterFilter);

  noise.start(time);
  noise.stop(time + 0.1);
}

// --- CONGA ---
function playConga(time, pitch = 300, velocity = 1) {
  if (!arrangement.conga.active) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(pitch, time);
  osc.frequency.exponentialRampToValueAtTime(pitch * 0.7, time + 0.1);

  gain.gain.setValueAtTime(velocity * 0.4 * arrangement.conga.volume, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

  osc.connect(gain);
  gain.connect(masterFilter);
  gain.connect(masterReverb);

  osc.start(time);
  osc.stop(time + 0.25);
}

// --- ADDITIONAL PERCUSSION ---
function playPerc(time, velocity = 1) {
  if (!arrangement.perc.active) return;

  // Rim shot / side stick
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, time);
  osc.frequency.exponentialRampToValueAtTime(400, time + 0.02);

  filter.type = 'highpass';
  filter.frequency.value = 500;

  gain.gain.setValueAtTime(velocity * 0.3 * arrangement.perc.volume, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterFilter);
  gain.connect(delayNode);

  osc.start(time);
  osc.stop(time + 0.1);
}

// --- BASS ---
function playBass(time, note, duration, velocity = 1) {
  if (!arrangement.bass.active) return;

  const freq = midiToFreq(note);

  // Sub bass
  const subOsc = audioContext.createOscillator();
  const subGain = audioContext.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.value = freq;
  subGain.gain.setValueAtTime(velocity * 0.5 * arrangement.bass.volume, time);
  subGain.gain.setValueAtTime(velocity * 0.5 * arrangement.bass.volume, time + duration - 0.05);
  subGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  // Upper harmonic for presence
  const midOsc = audioContext.createOscillator();
  const midGain = audioContext.createGain();
  const midFilter = audioContext.createBiquadFilter();
  midOsc.type = 'sawtooth';
  midOsc.frequency.value = freq;
  midFilter.type = 'lowpass';
  midFilter.frequency.value = freq * 4;
  midFilter.Q.value = 2;
  midGain.gain.setValueAtTime(velocity * 0.2 * arrangement.bass.volume, time);
  midGain.gain.setValueAtTime(velocity * 0.2 * arrangement.bass.volume, time + duration - 0.05);
  midGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  subOsc.connect(subGain);
  subGain.connect(masterFilter);

  midOsc.connect(midFilter);
  midFilter.connect(midGain);
  midGain.connect(masterFilter);

  subOsc.start(time);
  subOsc.stop(time + duration + 0.1);
  midOsc.start(time);
  midOsc.stop(time + duration + 0.1);
}

// --- CHORD STABS ---
function playChord(time, chord, duration, velocity = 1) {
  if (!arrangement.chord.active) return;

  const notes = getChordNotes(chord.root, chord.type);

  notes.forEach((note, i) => {
    const freq = midiToFreq(note);

    // Rhodes-like sound using FM synthesis
    const carrier = audioContext.createOscillator();
    const modulator = audioContext.createOscillator();
    const modGain = audioContext.createGain();
    const carrierGain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    carrier.type = 'sine';
    carrier.frequency.value = freq;

    modulator.type = 'sine';
    modulator.frequency.value = freq * 2;
    modGain.gain.value = freq * 0.5; // Modulation depth

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 6, time);
    filter.frequency.exponentialRampToValueAtTime(freq * 2, time + 0.3);

    carrierGain.gain.setValueAtTime(0, time);
    carrierGain.gain.linearRampToValueAtTime(velocity * 0.15 * arrangement.chord.volume, time + 0.01);
    carrierGain.gain.setValueAtTime(velocity * 0.12 * arrangement.chord.volume, time + duration * 0.7);
    carrierGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(filter);
    filter.connect(carrierGain);
    carrierGain.connect(masterFilter);
    carrierGain.connect(delayNode);
    carrierGain.connect(masterReverb);

    carrier.start(time);
    carrier.stop(time + duration + 0.1);
    modulator.start(time);
    modulator.stop(time + duration + 0.1);
  });
}

// --- PAD ---
function playPad(time, chord, duration, velocity = 1) {
  if (!arrangement.pad.active) return;

  const notes = getChordNotes(chord.root, chord.type);

  notes.forEach(note => {
    const freq = midiToFreq(note);

    // Warm pad with multiple detuned oscillators
    for (let i = 0; i < 3; i++) {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      osc.type = i === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.value = freq * (1 + (i - 1) * 0.003); // Slight detune

      filter.type = 'lowpass';
      filter.frequency.value = 1500;
      filter.Q.value = 0.5;

      // Slow attack, long release
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(velocity * 0.08 * arrangement.pad.volume, time + 0.5);
      gain.gain.setValueAtTime(velocity * 0.08 * arrangement.pad.volume, time + duration - 1);
      gain.gain.linearRampToValueAtTime(0, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterFilter);
      gain.connect(masterReverb);

      osc.start(time);
      osc.stop(time + duration + 0.5);
    }
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createNoise(context, duration) {
  const bufferSize = context.sampleRate * duration;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = context.createBufferSource();
  noise.buffer = buffer;
  return noise;
}

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function getChordNotes(root, type) {
  const intervals = {
    'maj7': [0, 4, 7, 11],
    'min7': [0, 3, 7, 10],
    'dom7': [0, 4, 7, 10],
    'min9': [0, 3, 7, 10, 14]
  };
  return intervals[type].map(i => root + i);
}

// ============================================================================
// SEQUENCER / SCHEDULER
// ============================================================================

// Bass pattern - syncopated
const bassPattern = [
  { beat: 0, note: 0, duration: 0.5 },
  { beat: 0.75, note: 0, duration: 0.25 },
  { beat: 1.5, note: 0, duration: 0.5 },
  { beat: 2.25, note: 0, duration: 0.25 },
  { beat: 3, note: 0, duration: 0.5 },
  { beat: 3.5, note: 7, duration: 0.25 } // Fifth for movement
];

// Conga pattern
const congaPattern = [
  { beat: 0.5, pitch: 350 },
  { beat: 1, pitch: 300 },
  { beat: 2.5, pitch: 350 },
  { beat: 3.25, pitch: 280 },
  { beat: 3.75, pitch: 320 }
];

// Perc pattern
const percPattern = [
  { beat: 0.25 },
  { beat: 1.75 },
  { beat: 2.5 },
  { beat: 3.5 }
];

function scheduler() {
  while (nextNoteTime < audioContext.currentTime + SCHEDULE_AHEAD_TIME) {
    scheduleNote(currentBeat, nextNoteTime);
    nextBeat();
  }
}

function scheduleNote(beat, time) {
  const beatInBar = beat % 4;
  const beatInPhrase = beat % 16;
  const sixteenth = (beat * 4) % 16;

  // KICK - every beat (four on the floor)
  playKick(time);

  // HI-HATS - offbeat 8ths and some 16ths
  if (beatInBar % 1 === 0) {
    // Offbeat 8ths
    playHiHat(time + SECONDS_PER_BEAT * 0.5, false, 0.7);
  }
  // Occasional open hat
  if (beatInBar === 3.5 || (beatInPhrase === 15 && Math.random() > 0.5)) {
    playHiHat(time + SECONDS_PER_BEAT * 0.5, true, 0.8);
  }
  // Extra 16th notes for groove
  if (Math.random() > 0.7) {
    playHiHat(time + SECONDS_PER_BEAT * 0.25, false, 0.4);
  }
  if (Math.random() > 0.8) {
    playHiHat(time + SECONDS_PER_BEAT * 0.75, false, 0.4);
  }

  // CLAP - beats 2 and 4
  if (beatInBar === 1 || beatInBar === 3) {
    playClap(time);
  }

  // SHAKER - constant 16ths with accent pattern
  for (let i = 0; i < 4; i++) {
    const accent = (i === 0 || i === 2) ? 1 : 0.6;
    playShaker(time + SECONDS_PER_BEAT * (i / 4), accent);
  }

  // CONGA - syncopated pattern
  congaPattern.forEach(hit => {
    if (Math.abs(beatInBar - Math.floor(hit.beat)) < 0.01) {
      const offset = (hit.beat % 1) * SECONDS_PER_BEAT;
      playConga(time + offset, hit.pitch, 0.8);
    }
  });

  // PERC - rim shots
  percPattern.forEach(hit => {
    if (Math.abs(beatInBar - Math.floor(hit.beat)) < 0.01) {
      const offset = (hit.beat % 1) * SECONDS_PER_BEAT;
      playPerc(time + offset, 0.7);
    }
  });

  // BASS - syncopated pattern based on current chord
  const currentChord = CHORD_PROGRESSION[currentChordIndex];
  bassPattern.forEach(note => {
    if (Math.abs(beatInBar - Math.floor(note.beat)) < 0.01) {
      const offset = (note.beat % 1) * SECONDS_PER_BEAT;
      const bassNote = currentChord.root - 12 + note.note; // One octave down
      playBass(time + offset, bassNote, note.duration * SECONDS_PER_BEAT, 0.9);
    }
  });

  // CHORDS - on beat 1 of each bar, and sometimes beat 3
  if (beatInBar === 0) {
    playChord(time, currentChord, SECONDS_PER_BEAT * 1.5, 0.8);
  }
  if (beatInBar === 2 && Math.random() > 0.4) {
    playChord(time + SECONDS_PER_BEAT * 0.5, currentChord, SECONDS_PER_BEAT * 1, 0.5);
  }

  // PADS - sustained across 4 bars
  if (beatInPhrase === 0) {
    playPad(time, currentChord, SECONDS_PER_BEAT * 16, 0.6);
  }

  // Update arrangement state
  updateArrangement();
}

function nextBeat() {
  nextNoteTime += SECONDS_PER_BEAT;
  currentBeat++;
}

// ============================================================================
// PUBLIC API
// ============================================================================

export function startHouseMusic() {
  if (isPlaying) return;

  // Create or resume audio context
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.7;
    setupEffectsChain();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  isPlaying = true;
  currentBeat = 0;
  nextNoteTime = audioContext.currentTime;

  schedulerInterval = setInterval(scheduler, SCHEDULER_INTERVAL_MS);

  console.log('House music started! BPM:', BPM);
  return true;
}

export function stopHouseMusic() {
  if (!isPlaying) return;

  isPlaying = false;
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }

  console.log('House music stopped');
  return true;
}

export function setVolume(volume) {
  if (masterGain) {
    masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), audioContext.currentTime, 0.1);
  }
}

export function getArrangement() {
  return { ...arrangement };
}

export function toggleElement(element) {
  if (arrangement[element]) {
    arrangement[element].active = !arrangement[element].active;
    return arrangement[element].active;
  }
  return null;
}

export function setElementVolume(element, volume) {
  if (arrangement[element]) {
    arrangement[element].volume = Math.max(0, Math.min(1, volume));
    return true;
  }
  return false;
}

export function triggerFilterSweep(direction = 1) {
  filterSweepActive = true;
  filterSweepDirection = direction;
  setTimeout(() => {
    filterSweepActive = false;
  }, 8000); // 8 second sweep
}

export function getCurrentSection() {
  return {
    section: currentSection % 16,
    beatsInSection,
    totalBeats: currentBeat,
    chord: CHORD_PROGRESSION[currentChordIndex],
    bpm: BPM
  };
}

export function isAudioPlaying() {
  return isPlaying;
}

// ============================================================================
// STANDALONE TESTING SUPPORT
// ============================================================================

// Auto-attach to window for standalone testing
if (typeof window !== 'undefined') {
  window.HouseMusic = {
    start: startHouseMusic,
    stop: stopHouseMusic,
    setVolume,
    getArrangement,
    toggleElement,
    setElementVolume,
    triggerFilterSweep,
    getCurrentSection,
    isPlaying: isAudioPlaying
  };

  // Log instructions when loaded standalone
  console.log(`
========================================
  HOUSE MUSIC GENERATOR LOADED
========================================

To start the music, run:
  HouseMusic.start()

To stop:
  HouseMusic.stop()

Other controls:
  HouseMusic.setVolume(0.5)           // 0-1
  HouseMusic.toggleElement('kick')    // Toggle instruments
  HouseMusic.triggerFilterSweep(1)    // 1 = up, -1 = down
  HouseMusic.getCurrentSection()      // Get current state
  HouseMusic.getArrangement()         // See active elements

Available elements:
  kick, hihat, clap, shaker, conga,
  bass, chord, pad, perc

BPM: ${BPM}
========================================
  `);
}

// Default export for ES module import
export default {
  start: startHouseMusic,
  stop: stopHouseMusic,
  setVolume,
  getArrangement,
  toggleElement,
  setElementVolume,
  triggerFilterSweep,
  getCurrentSection,
  isPlaying: isAudioPlaying
};
