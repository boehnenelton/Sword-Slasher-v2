/**
 * Library:         lib_bejson_gamingss2_engine_intro.ts
 * Family:          GamingSS2
 * Module Purpose:  Retro Web Audio dark synth soundtrack synthesizer and Ganon sanctuary cutscene player.
 * Architecture:    BEJSON 105 Format / Web Audio Subsystem
 * Version:         1.0.0
 * Release_Version: 300
 * Date:            2026-11-02
 * Author:          Elton Boehnen · boehnenelton2024@gmail.com · boehnenelton2024.pages.dev · github.com/boehnenelton
 * Format_Creator:  Elton Boehnen
 * RELATIONAL_ID:   fbb31187-7f51-4d63-85fe-320b9c179a56
 */

import { GamingAudioProfile } from './lib_bejson_Gaming_engine';

export class GamingSS2EngineIntro {
  private audioCtx: AudioContext | null = null;
  private isPlayingTheme: boolean = false;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private currentDroneHz: number = 0;

  private initAudioContext(): void {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  public playDarkSlashSFX(): void {
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

  public playSpinAttackSFX(): void {
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

  public playBiomeFootstep(audioProfile: GamingAudioProfile): void {
    this.initAudioContext();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = audioProfile.ambientWaveform === 'sawtooth' ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(audioProfile.footstepFreq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, audioProfile.footstepFreq * 0.4), now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(audioProfile.filterCutoff, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (0.06 * audioProfile.reverbDecay));

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + (0.06 * audioProfile.reverbDecay));
  }

  public updateAmbientBiomeDrone(audioProfile: GamingAudioProfile): void {
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
      this.ambientOsc.frequency.setValueAtTime(audioProfile.ambientDroneHz, now);

      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(audioProfile.filterCutoff, now);

      this.ambientGain.gain.setValueAtTime(0.01, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.08, now + 1.0);

      this.ambientOsc.connect(this.ambientFilter);
      this.ambientFilter.connect(this.ambientGain);
      this.ambientGain.connect(this.audioCtx.destination);

      this.ambientOsc.start(now);
    } else if (this.ambientOsc && this.ambientGain && this.ambientFilter) {
      this.ambientOsc.frequency.linearRampToValueAtTime(audioProfile.ambientDroneHz, now + 0.5);
      this.ambientFilter.frequency.linearRampToValueAtTime(audioProfile.filterCutoff, now + 0.5);
    }

    this.currentDroneHz = audioProfile.ambientDroneHz;
  }

  public stopAmbientBiomeDrone(): void {
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

  public playDarkSynthIntroTheme(): void {
    if (this.isPlayingTheme) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    this.isPlayingTheme = true;
    const notes = [110, 116.54, 130.81, 123.47, 110, 98]; // Low dark minor arpeggio
    let noteIdx = 0;

    const playNext = () => {
      if (!this.isPlayingTheme || !this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(notes[noteIdx], this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.4);

      noteIdx = (noteIdx + 1) % notes.length;
      setTimeout(playNext, 450);
    };

    playNext();
  }

  public stopIntroTheme(): void {
    this.isPlayingTheme = false;
  }
}
