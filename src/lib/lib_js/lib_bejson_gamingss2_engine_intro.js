/**
 * Library:         lib_bejson_gamingss2_engine_intro.js
 * Family:          GamingSS2
 * Module Purpose:  JavaScript Mirror - Retro Web Audio synth engine & Biome Environmental Audio
 * Architecture:    BEJSON 105 Format / Web Audio Subsystem
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-10
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   b8c9d0e1-2026-1110-9999-000000000001
 */

export class GamingSS2EngineIntro {
  constructor() {
    this.audioCtx = null;
    this.isPlayingTheme = false;
    this.ambientOsc = null;
    this.ambientGain = null;
    this.ambientFilter = null;
    this.currentDroneHz = 0;
  }

  initAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  playDarkSlashSFX() {
    this.initAudioContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.15);
  }

  playSpinAttackSFX() {
    this.initAudioContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, this.audioCtx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.35);
  }

  playBiomeFootstep(audioProfile) {
    this.initAudioContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = audioProfile.ambientWaveform === 'sawtooth' ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(audioProfile.footstepFreq || 220, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, (audioProfile.footstepFreq || 220) * 0.4), now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(audioProfile.filterCutoff || 900, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (0.06 * (audioProfile.reverbDecay || 0.8)));

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + (0.06 * (audioProfile.reverbDecay || 0.8)));
  }

  updateAmbientBiomeDrone(audioProfile) {
    this.initAudioContext();
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    if (this.currentDroneHz === audioProfile.ambientDroneHz && this.ambientOsc) return;

    const now = this.audioCtx.currentTime;

    if (!this.ambientOsc) {
      this.ambientOsc = this.audioCtx.createOscillator();
      this.ambientGain = this.audioCtx.createGain();
      this.ambientFilter = this.audioCtx.createBiquadFilter();

      this.ambientOsc.type = audioProfile.ambientWaveform || 'sine';
      this.ambientOsc.frequency.setValueAtTime(audioProfile.ambientDroneHz || 65, now);

      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(audioProfile.filterCutoff || 900, now);

      this.ambientGain.gain.setValueAtTime(0.01, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.08, now + 1.0);

      this.ambientOsc.connect(this.ambientFilter);
      this.ambientFilter.connect(this.ambientGain);
      this.ambientGain.connect(this.audioCtx.destination);

      this.ambientOsc.start(now);
    } else if (this.ambientOsc && this.ambientGain && this.ambientFilter) {
      this.ambientOsc.frequency.linearRampToValueAtTime(audioProfile.ambientDroneHz || 65, now + 0.5);
      this.ambientFilter.frequency.linearRampToValueAtTime(audioProfile.filterCutoff || 900, now + 0.5);
    }

    this.currentDroneHz = audioProfile.ambientDroneHz || 65;
  }

  stopAmbientBiomeDrone() {
    if (this.ambientOsc && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      if (this.ambientGain) {
        this.ambientGain.gain.linearRampToValueAtTime(0.001, now + 0.5);
      }
      setTimeout(() => {
        try {
          this.ambientOsc?.stop();
          this.ambientOsc?.disconnect();
        } catch (_) {}
        this.ambientOsc = null;
        this.ambientGain = null;
        this.ambientFilter = null;
        this.currentDroneHz = 0;
      }, 500);
    }
  }
}

export default GamingSS2EngineIntro;
