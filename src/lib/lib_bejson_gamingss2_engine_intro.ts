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
 * RELATIONAL_ID:   b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e
 */

export class GamingSS2EngineIntro {
  private audioCtx: AudioContext | null = null;
  private isPlayingTheme: boolean = false;

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
