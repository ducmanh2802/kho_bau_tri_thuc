/**
 * Sound Service using Web Audio API & Web Speech API.
 * 100% self-contained, no external audio files needed!
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private voiceEnabled: boolean = true;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  private bgMusicEnabled: boolean = false;
  private bgMusicContext: AudioContext | null = null;
  private bgMusicGain: GainNode | null = null;
  private bgMusicOscillators: OscillatorNode[] = [];
  private bgMusicVolume: number = 0.1; // Low volume by default

  constructor() {
    // Voiceless/broken platforms must never crash the app at import time: the
    // key can exist while the object is unusable, so every touch is guarded.
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        this.cachedVoices = window.speechSynthesis.getVoices() ?? [];
        window.speechSynthesis.onvoiceschanged = () => {
          try {
            this.cachedVoices = window.speechSynthesis.getVoices() ?? [];
          } catch {
            this.cachedVoices = [];
          }
        };
      }
    } catch {
      this.cachedVoices = [];
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
  }

  public getVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  // Cute bubble click sound
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Ignore audio error
    }
  }

  // Joyful chime for correct answer
  public playCorrect() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
      });
    } catch {
      // Ignore audio error
    }
  }

  // Gentle soft boing for wrong attempt (encouraging, never harsh)
  public playWrong() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {
      // Ignore audio error
    }
  }

  // Sparkling star twinkle
  public playStar() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [880, 1174.66, 1318.51, 1760]; // A5, D6, E6, A6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);

        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.36);
      });
    } catch {
      // Ignore audio error
    }
  }

  // Victory fanfare on lesson/game completion
  public playLevelUp() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const chordNotes = [
        { f: 523.25, t: 0 },
        { f: 659.25, t: 0.1 },
        { f: 783.99, t: 0.2 },
        { f: 1046.5, t: 0.35 },
        { f: 1046.5, t: 0.55 },
        { f: 1318.51, t: 0.75 },
      ];

      chordNotes.forEach(({ f, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + t);

        gain.gain.setValueAtTime(0, ctx.currentTime + t);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.45);
      });
    } catch {
      // Ignore audio error
    }
  }

  // Pop balloon effect
  public playPop() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Ignore audio error
    }
  }

  // Text to speech (Vietnamese & English)
  public speak(text: string, lang: 'vi-VN' | 'en-US' | 'en-GB' = 'vi-VN') {
    if (this.isMuted || !this.voiceEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel(); // Stop any pending utterances
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = lang === 'vi-VN' ? 0.9 : 0.85; // Slightly slower, clear for grade 1 kids
      utterance.pitch = 1.1; // Friendly, warm pitch

      const matchingVoice = this.pickVoice(lang);
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis error handled quietly without crashing
    }
  }

  /**
   * Voice selection chain (§7):
   *   1. exact locale match ('en-GB')
   *   2. regional variant of the same locale ('en-GB-SCT')
   *   3. any voice sharing the base language ('en-*')
   * Returns null when the platform offers nothing usable, so the caller can
   * fall back to text/captions instead of pretending an audio happened.
   */
  public pickVoice(lang: 'vi-VN' | 'en-US' | 'en-GB'): SpeechSynthesisVoice | null {
    const allVoices = this.cachedVoices.length > 0 ? this.cachedVoices : this.getVoices();
    if (allVoices.length === 0) return null;

    const base = lang.split('-')[0];
    const exact = allVoices.find((v) => v.lang === lang || v.lang.replace('_', '-') === lang);
    if (exact) return exact;

    const regional = allVoices.find((v) => v.lang.replace('_', '-').startsWith(`${lang}-`));
    if (regional) return regional;

    return allVoices.find((v) => v.lang.replace('_', '-').startsWith(base)) ?? null;
  }

  /** Re-reads the platform voice list (populated asynchronously on load). */
  public getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) this.cachedVoices = voices;
      return this.cachedVoices;
    } catch {
      return this.cachedVoices;
    }
  }

  /** True when a voice for this exact locale exists on the device. */
  public hasVoiceFor(lang: 'vi-VN' | 'en-US' | 'en-GB'): boolean {
    return this.getVoices().some((v) => v.lang === lang || v.lang.replace('_', '-') === lang);
  }


  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // ------------------------------
  // Background music
  // ------------------------------

  /** Set background music enabled state. */
  public setBgMusicEnabled(enabled: boolean): void {
    this.bgMusicEnabled = enabled;
    if (enabled) {
      this.startBgMusic();
    } else {
      this.stopBgMusic();
    }
  }

  /** Get background music enabled state. */
  public getBgMusicEnabled(): boolean {
    return this.bgMusicEnabled;
  }

  /** Start background music with initial delay. */
  private startBgMusic(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.bgMusicContext = new AudioCtx();
        this.bgMusicGain = this.bgMusicContext.createGain();
        this.bgMusicGain.gain.value = this.bgMusicVolume;
        this.bgMusicGain.connect(this.bgMusicContext.destination);

        // Schedule first loop after user interaction guarantee
        this.playBgMusicLoop();
      }
    } catch {
      this.bgMusicContext = null;
      this.bgMusicGain = null;
    }
  }

  /** Stop background music. */
  private stopBgMusic(): void {
    if (this.bgMusicContext) {
      this.stopBgMusicInner();
      try {
        this.bgMusicContext.suspend();
      } catch {
        // ignore
      }
      this.bgMusicContext = null;
      this.bgMusicGain = null;
    }
  }

  /** Play background music loop (home/map gentle sequence). */
  private playBgMusicLoop(): void {
    if (!this.bgMusicEnabled || !this.bgMusicContext) return;

    // Cancel any existing oscillators
    this.stopBgMusicInner();

    // Home/Map music pattern: gentle, ascending/descending sequences
    const pattern = this.getHomeMusicPattern();

    // Create oscillators for the pattern
    this.bgMusicOscillators = [];
    for (let i = 0; i < pattern.length; i++) {
      const note = pattern[i];
      const osc = this.bgMusicContext!.createOscillator();
      const gain = this.bgMusicContext!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, this.bgMusicContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        note.freq,
        this.bgMusicContext.currentTime + note.duration,
      );

      gain.gain.setValueAtTime(this.bgMusicVolume, this.bgMusicContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        this.bgMusicVolume * 0.8,
        this.bgMusicContext.currentTime + note.duration,
      );

      osc.connect(gain);
      gain.connect(this.bgMusicGain!);

      osc.start(this.bgMusicContext.currentTime);
      osc.stop(this.bgMusicContext.currentTime + note.duration);

      this.bgMusicOscillators.push(osc);
    }

    // Schedule next loop
    requestAnimationFrame(() => this.playBgMusicLoop());
  }

  /** Home/Map music pattern: gentle, ascending/descending sequences. */
  private getHomeMusicPattern(): Array<{ freq: number; duration: number }> {
    return [
      { freq: 392, duration: 1.5 }, // G4
      { freq: 329.63, duration: 1.5 }, // E5
      { freq: 349.23, duration: 1.5 }, // F5
      { freq: 392, duration: 2.0 }, // G4
      { freq: 261.63, duration: 2.0 }, // C5
      { freq: 329.63, duration: 2.5 }, // E5
    ];
  }

  private stopBgMusicInner(): void {
    this.bgMusicOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // ignore
      }
    });
    this.bgMusicOscillators = [];
    if (this.bgMusicGain) {
      try {
        this.bgMusicGain.disconnect();
      } catch {
        // ignore
      }
    }
  }

  // ------------------------------
  // New sound effects
  // ------------------------------

  /** Play combo sound (rising pitch for correct streak). */
  public playCombo(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq * (1 + idx * 0.1), ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.3);
      });
    } catch {
      // Ignore audio error
    }
  }

  /** Play chest opening sound. */
  public playChestOpen(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Ignore audio error
    }
  }

  /** Play sticker pickup sound. */
  public playStickerPickup(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, ctx.currentTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(523.25, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 0.3);
    } catch {
      // Ignore audio error
    }
  }

  /** Play soft button tick sound. */
  public playButtonTick(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(261.63, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Ignore audio error
    }
  }
}

export const sound = new SoundService();