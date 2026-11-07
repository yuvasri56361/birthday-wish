const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const bpm = 72;
const beatSec = 60 / bpm; // ~0.833 sec per beat
const barSec = beatSec * 4; // ~3.333 sec per bar
const totalBars = 8;
const totalDuration = barSec * totalBars; // ~26.667 sec
const totalSamples = Math.floor(totalDuration * sampleRate);

const leftChannel = new Float32Array(totalSamples);
const rightChannel = new Float32Array(totalSamples);

// Note frequencies (Hz)
const notes = {
    // Bass & Chords
    D2: 73.42, A2: 110.00, B2: 123.47, Fs2: 92.50, G2: 98.00,
    D3: 146.83, E3: 164.81, Fs3: 185.00, G3: 196.00, A3: 220.00, B3: 246.94, Cs4: 277.18,
    D4: 293.66, E4: 329.63, Fs4: 369.99, G4: 392.00, A4: 440.00, B4: 493.88, Cs5: 554.37,
    D5: 587.33, E5: 659.25, Fs5: 739.99, G5: 783.99, A5: 880.00, B5: 987.77, Cs6: 1108.73, D6: 1174.66
};

// Piano Note Synthesizer
function addPianoNote(freq, startTime, duration, velocity, pan = 0) {
    const startSample = Math.floor(startTime * sampleRate);
    const numSamples = Math.floor(duration * sampleRate);

    for (let i = 0; i < numSamples; i++) {
        const idx = startSample + i;
        if (idx >= totalSamples) break;

        const t = i / sampleRate;
        // Attack 8ms, then exponential decay
        const attack = Math.min(1, t / 0.008);
        const decay = Math.exp(-t * 2.5);
        const env = attack * decay * velocity * 0.18;

        // Harmonics for warm piano tone
        const fundamental = Math.sin(2 * Math.PI * freq * t);
        const h2 = Math.sin(2 * Math.PI * freq * 2 * t) * 0.5;
        const h3 = Math.sin(2 * Math.PI * freq * 3 * t) * 0.25;
        const h4 = Math.sin(2 * Math.PI * freq * 4 * t) * 0.12;

        const sampleVal = (fundamental + h2 + h3 + h4) * env;

        const leftGain = Math.cos((pan + 1) * Math.PI / 4);
        const rightGain = Math.sin((pan + 1) * Math.PI / 4);

        leftChannel[idx] += sampleVal * leftGain;
        rightChannel[idx] += sampleVal * rightGain;
    }
}

// Celesta / Music Box Bell Note Synthesizer
function addBellNote(freq, startTime, duration, velocity, pan = 0) {
    const startSample = Math.floor(startTime * sampleRate);
    const numSamples = Math.floor(duration * sampleRate);

    for (let i = 0; i < numSamples; i++) {
        const idx = startSample + i;
        if (idx >= totalSamples) break;

        const t = i / sampleRate;
        const attack = Math.min(1, t / 0.004);
        const decay = Math.exp(-t * 1.8);
        const env = attack * decay * velocity * 0.15;

        // Sine with subtle high shimmer
        const fundamental = Math.sin(2 * Math.PI * freq * t);
        const shimmer = Math.sin(2 * Math.PI * freq * 2.75 * t) * 0.2;
        const bellTone = (fundamental + shimmer) * env;

        const leftGain = Math.cos((pan + 1) * Math.PI / 4);
        const rightGain = Math.sin((pan + 1) * Math.PI / 4);

        leftChannel[idx] += bellTone * leftGain;
        rightChannel[idx] += bellTone * rightGain;
    }
}

// Chord Progression: D -> A -> Bm -> F#m -> G -> D -> G -> A
const chords = [
    { bass: notes.D2, notes: [notes.D3, notes.Fs3, notes.A3, notes.D4] },
    { bass: notes.A2, notes: [notes.Cs3 || 138.59, notes.E3, notes.A3, notes.Cs4] },
    { bass: notes.B2, notes: [notes.D3, notes.Fs3, notes.B3, notes.D4] },
    { bass: notes.Fs2, notes: [notes.Cs3 || 138.59, notes.Fs3, notes.A3, notes.Cs4] },
    { bass: notes.G2, notes: [notes.D3, notes.G3, notes.B3, notes.D4] },
    { bass: notes.D2, notes: [notes.D3, notes.Fs3, notes.A3, notes.D4] },
    { bass: notes.G2, notes: [notes.D3, notes.G3, notes.B3, notes.D4] },
    { bass: notes.A2, notes: [notes.Cs4, notes.E4, notes.G4, notes.A4] }
];

// 1. Build Arpeggiated Piano Chords & Bass
chords.forEach((chord, barIdx) => {
    const barStart = barIdx * barSec;

    // Bass note on beat 1 and beat 3
    addPianoNote(chord.bass, barStart, barSec * 0.9, 0.85, -0.2);
    addPianoNote(chord.bass, barStart + beatSec * 2, barSec * 0.45, 0.65, -0.2);

    // Arpeggiated chord pattern: 8 eighth notes per bar
    for (let step = 0; step < 8; step++) {
        const noteIdx = step % chord.notes.length;
        const noteTime = barStart + step * (beatSec / 2);
        const vel = step === 0 ? 0.75 : (step % 2 === 0 ? 0.55 : 0.45);
        const pan = (step % 2 === 0 ? -0.25 : 0.25);
        addPianoNote(chord.notes[noteIdx], noteTime, beatSec * 1.5, vel, pan);
    }
});

// 2. Sweet Lyrical Romantic Melody (Celesta / Music Box)
const melody = [
    // Bar 1 (D): F#5 -> E5 -> D5
    { note: notes.Fs5, time: 0, dur: beatSec * 1.5, vel: 0.9, pan: 0.15 },
    { note: notes.E5, time: beatSec * 1.5, dur: beatSec * 0.5, vel: 0.75, pan: -0.1 },
    { note: notes.D5, time: beatSec * 2, dur: beatSec * 2, vel: 0.85, pan: 0.2 },

    // Bar 2 (A): C#5 -> D5 -> E5
    { note: notes.Cs5, time: barSec * 1, dur: beatSec * 1.5, vel: 0.85, pan: -0.15 },
    { note: notes.D5, time: barSec * 1 + beatSec * 1.5, dur: beatSec * 0.5, vel: 0.75, pan: 0.1 },
    { note: notes.E5, time: barSec * 1 + beatSec * 2, dur: beatSec * 2, vel: 0.85, pan: -0.2 },

    // Bar 3 (Bm): D5 -> C#5 -> B4
    { note: notes.D5, time: barSec * 2, dur: beatSec * 1.5, vel: 0.9, pan: 0.2 },
    { note: notes.Cs5, time: barSec * 2 + beatSec * 1.5, dur: beatSec * 0.5, vel: 0.75, pan: -0.1 },
    { note: notes.B4, time: barSec * 2 + beatSec * 2, dur: beatSec * 2, vel: 0.85, pan: 0.15 },

    // Bar 4 (F#m): A4 -> B4 -> C#5
    { note: notes.A4, time: barSec * 3, dur: beatSec * 1.5, vel: 0.85, pan: -0.2 },
    { note: notes.B4, time: barSec * 3 + beatSec * 1.5, dur: beatSec * 0.5, vel: 0.75, pan: 0.1 },
    { note: notes.Cs5, time: barSec * 3 + beatSec * 2, dur: beatSec * 2, vel: 0.85, pan: -0.15 },

    // Bar 5 (G): B4 -> C#5 -> D5 -> F#5
    { note: notes.B4, time: barSec * 4, dur: beatSec, vel: 0.85, pan: 0.2 },
    { note: notes.Cs5, time: barSec * 4 + beatSec, dur: beatSec, vel: 0.8, pan: -0.1 },
    { note: notes.D5, time: barSec * 4 + beatSec * 2, dur: beatSec, vel: 0.9, pan: 0.15 },
    { note: notes.Fs5, time: barSec * 4 + beatSec * 3, dur: beatSec, vel: 0.95, pan: 0.25 },

    // Bar 6 (D): E5 -> D5 -> A4
    { note: notes.E5, time: barSec * 5, dur: beatSec * 1.5, vel: 0.9, pan: -0.15 },
    { note: notes.D5, time: barSec * 5 + beatSec * 1.5, dur: beatSec * 0.5, vel: 0.75, pan: 0.1 },
    { note: notes.A4, time: barSec * 5 + beatSec * 2, dur: beatSec * 2, vel: 0.85, pan: -0.2 },

    // Bar 7 (G): B4 -> D5 -> G5
    { note: notes.B4, time: barSec * 6, dur: beatSec * 1.5, vel: 0.85, pan: 0.2 },
    { note: notes.D5, time: barSec * 6 + beatSec * 1.5, dur: beatSec * 0.5, vel: 0.8, pan: 0.1 },
    { note: notes.G5, time: barSec * 6 + beatSec * 2, dur: beatSec * 2, vel: 0.95, pan: 0.25 },

    // Bar 8 (A): F#5 -> E5 -> D5 (Gentle resolve)
    { note: notes.Fs5, time: barSec * 7, dur: beatSec * 1.5, vel: 0.9, pan: 0.15 },
    { note: notes.E5, time: barSec * 7 + beatSec * 1.5, dur: beatSec * 1.5, vel: 0.85, pan: -0.15 },
    { note: notes.D5, time: barSec * 7 + beatSec * 3, dur: beatSec * 1.5, vel: 0.8, pan: 0 }
];

melody.forEach(m => {
    addBellNote(m.note, m.time, m.dur, m.vel, m.pan);
});

// 3. Stereo Ping-Pong Delay / Reverb Effect
const delayTime = Math.floor(sampleRate * 0.28);
const feedback = 0.28;
for (let i = delayTime; i < totalSamples; i++) {
    leftChannel[i] += rightChannel[i - delayTime] * feedback;
    rightChannel[i] += leftChannel[i - delayTime] * feedback;
}

// 4. Normalization and Interleaved 16-bit PCM buffer
let maxVal = 0;
for (let i = 0; i < totalSamples; i++) {
    maxVal = Math.max(maxVal, Math.abs(leftChannel[i]), Math.abs(rightChannel[i]));
}

const normGain = maxVal > 0 ? 0.85 / maxVal : 1;
const interleaved = new Float32Array(totalSamples * 2);
for (let i = 0; i < totalSamples; i++) {
    interleaved[i * 2] = leftChannel[i] * normGain;
    interleaved[i * 2 + 1] = rightChannel[i] * normGain;
}

// 5. Build WAV header & file
function createWavBuffer(sampleRate, samples) {
    const numChannels = 2;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = samples.length * bytesPerSample;
    const buffer = Buffer.alloc(44 + dataSize);

    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bytesPerSample * 8, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
        const val = Math.max(-1, Math.min(1, samples[i]));
        buffer.writeInt16LE(val < 0 ? val * 0x8000 : val * 0x7FFF, offset);
        offset += 2;
    }
    return buffer;
}

const wavBuffer = createWavBuffer(sampleRate, interleaved);

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

const bgmPath = path.join(assetsDir, 'romantic-bgm.wav');
fs.writeFileSync(bgmPath, wavBuffer);
console.log('Successfully generated romantic-bgm.wav: ' + wavBuffer.length + ' bytes');

// Also write into assets/birthday-song.mp3 and assets/proposal-song.mp3 so they aren't 0-byte files!
// Many browsers happily play standard PCM RIFF even if named .mp3 or we supply both
fs.writeFileSync(path.join(assetsDir, 'romantic-bgm.mp3'), wavBuffer);
fs.writeFileSync(path.join(assetsDir, 'birthday-song.mp3'), wavBuffer);
fs.writeFileSync(path.join(assetsDir, 'proposal-song.mp3'), wavBuffer);

console.log('Populated assets audio files successfully!');
