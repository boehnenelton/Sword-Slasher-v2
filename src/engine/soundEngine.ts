/**
 * Library:         soundEngine.ts
 * Module Purpose:  Web Audio retro synthesizer for dark chiptune music and Zelda sound effects
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   9c4b1234-5678-4abc-8def-012345678910
 * Version:         200101
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicTimer: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.4;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.6;
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.3;
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playMusic() {
    this.initCtx();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // Ominous Zelda Dark World Ganon Theme Arpeggios
    // Notes in Hz: D2 (73.4), F2 (87.3), G#2 (103.8), A2 (110.0), D3 (146.8), F3 (174.6), C#3 (138.6)
    const sequence = [
      { freq: 73.41, duration: 0.2, type: 'sawtooth' as OscillatorType },
      { freq: 87.31, duration: 0.2, type: 'sawtooth' as OscillatorType },
      { freq: 103.83, duration: 0.2, type: 'sawtooth' as OscillatorType },
      { freq: 110.00, duration: 0.2, type: 'sawtooth' as OscillatorType },
      { freq: 146.83, duration: 0.4, type: 'square' as OscillatorType },
      { freq: 138.59, duration: 0.4, type: 'square' as OscillatorType },
      { freq: 103.83, duration: 0.2, type: 'sawtooth' as OscillatorType },
      { freq: 87.31, duration: 0.2, type: 'sawtooth' as OscillatorType },
      // Minor shift
      { freq: 65.41, duration: 0.2, type: 'sawtooth' as OscillatorType },
      { freq: 77.78, duration: 0.2, type: 'sawtooth' as OscillatorType },
      { freq: 98.00, duration: 0.2, type: 'sawtooth' as OscillatorType },
      { freq: 110.00, duration: 0.2, type: 'sawtooth' as OscillatorType },
      { freq: 130.81, duration: 0.4, type: 'square' as OscillatorType },
      { freq: 123.47, duration: 0.4, type: 'square' as OscillatorType },
      { freq: 98.00, duration: 0.2, type: 'sawtooth' as OscillatorType },
      { freq: 77.78, duration: 0.2, type: 'sawtooth' as OscillatorType }
    ];

    let noteIdx = 0;
    const playNextNote = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      const note = sequence[noteIdx];
      noteIdx = (noteIdx + 1) % sequence.length;

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = note.type;
      osc.frequency.setValueAtTime(note.freq, this.ctx.currentTime);

      noteGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + note.duration * 0.95);

      osc.connect(noteGain);
      noteGain.connect(this.musicGain);

      osc.start();
      osc.stop(this.ctx.currentTime + note.duration);

      this.musicTimer = window.setTimeout(playNextNote, note.duration * 1000);
    };

    playNextNote();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  // SFX: Sword Slash
  public playSlashSFX() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // SFX: Dark Spin Attack
  public playSpinAttackSFX() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  // SFX: Retro Dialogue Text Beep
  public playTextBeepSFX() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220 + Math.random() * 40, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // SFX: Hit / Damage
  public playHitSFX() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  // SFX: Item / Chime
  public playChimeSFX() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.08 + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.15);
    });
  }

  // SFX: Ganon Dark Aura
  public playDarkAuraSFX() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(180, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }
}

export const soundEngine = new SoundEngine();
