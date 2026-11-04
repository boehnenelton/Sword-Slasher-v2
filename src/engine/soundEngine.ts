/**
 * Library:         soundEngine.ts
 * Module Purpose:  BEJSON 105 Frequency-Driven Web Audio retro synthesizer & sound effects engine.
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com
 * Relational_ID:   9c4b1234-5678-4abc-8def-012345678912
 * Version:         200103
 */

export interface AudioSettings {
  masterVolume: number; // 0.0 - 1.0
  musicVolume: number;  // 0.0 - 1.0
  sfxVolume: number;    // 0.0 - 1.0
  isMuted: boolean;
}

export interface SoundEffectFrequencySpec {
  uuid: string;
  slugCode: string;
  title: string;
  waveform: OscillatorType | 'noise';
  startFreq: number;
  endFreq: number;
  rampType: 'exponential' | 'linear' | 'constant' | 'sequence';
  durationMs: number;
  volumeRatio: number;
  filterType: 'none' | 'bandpass' | 'highpass' | 'lowpass';
  filterCutoffHz: number;
  filterQFactor: number;
  noteSequence: Array<{ freq: number; dur: number; bass?: number }>;
  isLooping: boolean;
}

const STORAGE_KEY = 'SS2_AUDIO_CONFIG';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private isMuted: boolean = false;
  private masterVolume: number = 0.8;
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.8;

  private isMusicPlaying: boolean = false;
  private musicTimer: number | null = null;
  private chargeOsc: OscillatorNode | null = null;
  private chargeGain: GainNode | null = null;

  // O(1) Cached BEJSON 105 Sound Frequency Map keyed by aud_slug_code
  private sfxFrequencyMap: Map<string, SoundEffectFrequencySpec> = new Map();

  constructor() {
    this.loadAudioConfig();
    this.loadBejsonAudioManifest();
  }

  private loadAudioConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.masterVolume = typeof parsed.masterVolume === 'number' ? parsed.masterVolume : 0.8;
        this.musicVolume = typeof parsed.musicVolume === 'number' ? parsed.musicVolume : 0.5;
        this.sfxVolume = typeof parsed.sfxVolume === 'number' ? parsed.sfxVolume : 0.8;
        this.isMuted = !!parsed.isMuted;
      }
    } catch (e) {
      console.warn('[SoundEngine] Failed reading stored audio settings:', e);
    }
  }

  public saveAudioConfig() {
    try {
      const config: AudioSettings = {
        masterVolume: this.masterVolume,
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume,
        isMuted: this.isMuted,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('[SoundEngine] Failed saving audio settings:', e);
    }
  }

  // --- O(1) FIELD MAP CACHE BEJSON 105 INGESTION ---
  public async loadBejsonAudioManifest() {
    try {
      const res = await fetch('/data/audio/audio_manifest.105a.bejson');
      if (!res.ok) return;
      const bejsonDoc = await res.json();

      if (!bejsonDoc.Fields || !Array.isArray(bejsonDoc.Values)) return;

      // Build O(1) Field Map Cache with boundary-layer whitespace sanitization
      const colMap = new Map<string, number>();
      bejsonDoc.Fields.forEach((field: { name: string }, idx: number) => {
        if (field && typeof field.name === 'string') {
          colMap.set(field.name.trim(), idx);
        }
      });

      const getCol = (row: any[], fieldName: string) => {
        const idx = colMap.get(fieldName);
        return idx !== undefined && idx < row.length ? row[idx] : null;
      };

      bejsonDoc.Values.forEach((row: any[]) => {
        const slug = getCol(row, 'aud_slug_code');
        if (!slug || typeof slug !== 'string') return;

        const cleanSlug = slug.trim();
        const noteSeqRaw = getCol(row, 'aud_note_sequence_json');
        let noteSequence: Array<{ freq: number; dur: number; bass?: number }> = [];

        if (noteSeqRaw && typeof noteSeqRaw === 'string') {
          try {
            noteSequence = JSON.parse(noteSeqRaw);
          } catch (e) {
            noteSequence = [];
          }
        }

        const spec: SoundEffectFrequencySpec = {
          uuid: String(getCol(row, 'aud_uuid') || '').trim(),
          slugCode: cleanSlug,
          title: String(getCol(row, 'aud_display_title') || '').trim(),
          waveform: (String(getCol(row, 'aud_waveform_type') || 'sawtooth').trim() as any),
          startFreq: Number(getCol(row, 'aud_start_freq_hz') || 440),
          endFreq: Number(getCol(row, 'aud_end_freq_hz') || 440),
          rampType: (String(getCol(row, 'aud_frequency_ramp_type') || 'linear').trim() as any),
          durationMs: Number(getCol(row, 'aud_duration_ms_metric') || 150),
          volumeRatio: Number(getCol(row, 'aud_default_volume_ratio_metric') || 0.5),
          filterType: (String(getCol(row, 'aud_filter_type') || 'none').trim() as any),
          filterCutoffHz: Number(getCol(row, 'aud_filter_cutoff_hz') || 0),
          filterQFactor: Number(getCol(row, 'aud_filter_q_factor') || 1.0),
          noteSequence,
          isLooping: Boolean(getCol(row, 'aud_is_looping_flag')),
        };

        this.sfxFrequencyMap.set(cleanSlug, spec);
      });

      console.log(`[SoundEngine] Ingested ${this.sfxFrequencyMap.size} BEJSON 105 sound frequency specs via O(1) Field Map Cache.`);
    } catch (err) {
      console.warn('[SoundEngine] BEJSON audio manifest fetch note:', err);
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Pre-generate 1-second white noise buffer for procedural SFX
      const bufferSize = this.ctx.sampleRate;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const unlockAudio = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(err => console.warn('[SoundEngine] Audio resume note:', err));
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('click', unlockAudio);
      window.addEventListener('keydown', unlockAudio);
      window.addEventListener('touchstart', unlockAudio);
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
    this.saveAudioConfig();
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
    this.saveAudioConfig();
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
    this.saveAudioConfig();
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
    this.saveAudioConfig();
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  // --- DYNAMIC BEJSON FREQUENCY SYNTHESIZER DISPATCHER ---
  public playSfxBySlug(slug: string): boolean {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return false;

    const spec = this.sfxFrequencyMap.get(slug);
    if (!spec) return false;

    const now = this.ctx.currentTime;
    const durSec = spec.durationMs / 1000;

    // Sequence / Arpeggio Chime
    if (spec.rampType === 'sequence' && spec.noteSequence && spec.noteSequence.length > 0) {
      let delay = 0;
      spec.noteSequence.forEach((note) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = spec.waveform === 'noise' ? 'triangle' : spec.waveform;
        osc.frequency.setValueAtTime(note.freq, now + delay);

        gain.gain.setValueAtTime(spec.volumeRatio, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + note.dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + delay);
        osc.stop(now + delay + note.dur);

        delay += note.dur;
      });
      return true;
    }

    // Filtered White/Pink Noise SFX
    if (spec.waveform === 'noise' && this.noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = spec.filterType !== 'none' ? spec.filterType : 'bandpass';
      filter.frequency.setValueAtTime(spec.startFreq, now);
      if (spec.rampType === 'exponential' && spec.endFreq > 0) {
        filter.frequency.exponentialRampToValueAtTime(Math.max(10, spec.endFreq), now + durSec);
      } else if (spec.rampType === 'linear') {
        filter.frequency.linearRampToValueAtTime(spec.endFreq, now + durSec);
      }
      filter.Q.setValueAtTime(spec.filterQFactor || 1.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(spec.volumeRatio, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noiseSource.start(now);
      noiseSource.stop(now + durSec);
      return true;
    }

    // Oscillator Frequency Ramp SFX
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = spec.waveform === 'noise' ? 'sawtooth' : spec.waveform;
    osc.frequency.setValueAtTime(spec.startFreq, now);

    if (spec.rampType === 'exponential' && spec.endFreq > 0) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, spec.endFreq), now + durSec);
    } else if (spec.rampType === 'linear') {
      osc.frequency.linearRampToValueAtTime(spec.endFreq, now + durSec);
    }

    gain.gain.setValueAtTime(spec.volumeRatio, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + durSec);
    return true;
  }

  // --- RETRO CHIPTUNE BGM LOOP SYNTHESIZER ---
  public playMusic() {
    this.initCtx();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    const bgmSpec = this.sfxFrequencyMap.get('ganon_theme');
    const sequence = bgmSpec && bgmSpec.noteSequence && bgmSpec.noteSequence.length > 0
      ? bgmSpec.noteSequence
      : [
          { freq: 73.41, bass: 36.71, dur: 0.22 },
          { freq: 87.31, bass: 43.65, dur: 0.22 },
          { freq: 103.83, bass: 51.91, dur: 0.22 },
          { freq: 110.00, bass: 55.00, dur: 0.22 },
          { freq: 146.83, bass: 73.41, dur: 0.44 },
          { freq: 138.59, bass: 69.30, dur: 0.44 }
        ];

    let noteIdx = 0;
    const playNextNote = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain || this.isMuted) return;
      const note = sequence[noteIdx];
      noteIdx = (noteIdx + 1) % sequence.length;

      const now = this.ctx.currentTime;

      // Lead Channel
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();

      leadOsc.type = 'sawtooth';
      leadOsc.frequency.setValueAtTime(note.freq, now);

      leadGain.gain.setValueAtTime(0.18, now);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + note.dur * 0.92);

      leadOsc.connect(leadGain);
      leadGain.connect(this.musicGain);

      leadOsc.start(now);
      leadOsc.stop(now + note.dur);

      // Bass Sub Channel
      if (note.bass) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(note.bass, now);

        bassGain.gain.setValueAtTime(0.22, now);
        bassGain.gain.linearRampToValueAtTime(0.01, now + note.dur * 0.95);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);

        bassOsc.start(now);
        bassOsc.stop(now + note.dur);
      }

      this.musicTimer = window.setTimeout(playNextNote, note.dur * 1000);
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

  // --- WRAPPER CONVENIENCE METHODS (DELEGATE TO BEJSON SPECS) ---
  public playSlashSFX() {
    if (!this.playSfxBySlug('sword_slash')) {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.14);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.14);
    }
  }

  public playSpinAttackSFX() {
    this.stopChargeSFX();
    if (!this.playSfxBySlug('spin_attack')) {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(750, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);
      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  }

  public startChargeSFX() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted || this.chargeOsc) return;
    const spec = this.sfxFrequencyMap.get('charge_blade');
    const startF = spec ? spec.startFreq : 280;
    const endF = spec ? spec.endFreq : 620;

    const now = this.ctx.currentTime;
    this.chargeOsc = this.ctx.createOscillator();
    this.chargeGain = this.ctx.createGain();

    this.chargeOsc.type = 'triangle';
    this.chargeOsc.frequency.setValueAtTime(startF, now);
    this.chargeOsc.frequency.linearRampToValueAtTime(endF, now + 0.6);

    this.chargeGain.gain.setValueAtTime(0.01, now);
    this.chargeGain.gain.linearRampToValueAtTime(0.3, now + 0.15);

    this.chargeOsc.connect(this.chargeGain);
    this.chargeGain.connect(this.sfxGain);

    this.chargeOsc.start(now);
  }

  public stopChargeSFX() {
    if (this.chargeOsc && this.chargeGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.chargeGain.gain.setValueAtTime(this.chargeGain.gain.value, now);
        this.chargeGain.gain.linearRampToValueAtTime(0.001, now + 0.05);
        this.chargeOsc.stop(now + 0.05);
      } catch (e) {
        // Safe catch
      }
      this.chargeOsc = null;
      this.chargeGain = null;
    }
  }

  public playBoomerangSFX() {
    if (!this.playSfxBySlug('boomerang_whir')) {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.linearRampToValueAtTime(550, now + 0.08);
      osc.frequency.linearRampToValueAtTime(300, now + 0.16);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.16);
    }
  }

  public playPotBreakSFX() {
    if (!this.playSfxBySlug('pot_break')) {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || !this.noiseBuffer || this.isMuted) return;
      const now = this.ctx.currentTime;
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.15);
      filter.Q.setValueAtTime(3.0, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noiseSource.start(now);
      noiseSource.stop(now + 0.15);
    }
  }

  public playBushCutSFX() {
    if (!this.playSfxBySlug('bush_cut')) {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || !this.noiseBuffer || this.isMuted) return;
      const now = this.ctx.currentTime;
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2500, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.12);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noiseSource.start(now);
      noiseSource.stop(now + 0.12);
    }
  }

  public playHitSFX() {
    if (!this.playSfxBySlug('enemy_hit')) {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  }

  public playEnemyDeathSFX() {
    if (!this.playSfxBySlug('enemy_death')) {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || !this.noiseBuffer || this.isMuted) return;
      const now = this.ctx.currentTime;
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.28);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.55, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseSource.start(now);
      noiseSource.stop(now + 0.28);
    }
  }

  public playPlayerHurtSFX() {
    if (!this.playSfxBySlug('player_hurt')) {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.18);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  }

  public playHeartPickupSFX() {
    if (!this.playSfxBySlug('heart_pickup')) {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      [659.25, 783.99].forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.4, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.14);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.14);
      });
    }
  }

  public playRupeePickupSFX() {
    if (!this.playSfxBySlug('rupee_pickup')) {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      [987.77, 1318.51].forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.35, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.12);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.12);
      });
    }
  }

  public playChimeSFX() {
    if (!this.playSfxBySlug('item_chime')) {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.35, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.14);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.14);
      });
    }
  }

  public playTextBeepSFX() {
    if (!this.playSfxBySlug('text_beep')) {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(240 + Math.random() * 50, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  }

  public playDarkAuraSFX() {
    if (!this.playSfxBySlug('dark_aura')) {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.45);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  }
}

export const soundEngine = new SoundEngine();
