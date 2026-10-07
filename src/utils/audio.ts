// Tactical Web Audio Synthesizer & Speech Engine

class TacticalAudioEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Lazy initialize on first user gesture
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled() {
    return this.soundEnabled;
  }

  // Drone 1: Acoustic Tapping / Echo ping sound under debris
  public playAcousticTapping() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      // 3 quick rhythmic knocks (survivor tapping pattern)
      [0, 0.18, 0.36].forEach((offset) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        // Rubble resonance frequency (~800Hz)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(780, t + offset);
        osc.frequency.exponentialRampToValueAtTime(140, t + offset + 0.08);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, t + offset);

        gain.gain.setValueAtTime(0.35, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.08);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + offset);
        osc.stop(t + offset + 0.09);
      });
    } catch (e) {
      // AudioContext policy safe catch
    }
  }

  // Drone 2: Thermal Sensor Lock Tone
  public playThermalLock() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(1174.66, t + 0.06); // D6 note

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    } catch (e) {}
  }

  // Drone 3: Subsurface 20ft Seismic Micro-Vibration Rumble
  public playSeismicPulse() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Very low frequency ground-penetrating micro rumble
      osc.frequency.setValueAtTime(65, t);
      osc.frequency.linearRampToValueAtTime(45, t + 0.25);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.32);
    } catch (e) {}
  }

  // Urgent Triage Priority Klaxon
  public playPriorityAlert() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.linearRampToValueAtTime(950, t + 0.12);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    } catch (e) {}
  }

  // Multilingual Speech Synthesis for Tactical Radio readout
  public speakTacticalRadio(text: string, langCode: string = 'en') {
    if (!this.soundEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      utterance.volume = 0.8;

      const langMap: Record<string, string> = {
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        hi: 'hi-IN',
        ta: 'ta-IN',
        ja: 'ja-JP',
        zh: 'zh-CN',
        ar: 'ar-SA',
      };

      utterance.lang = langMap[langCode] || langCode || 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis unavailable');
    }
  }
}

export const tacticalAudio = new TacticalAudioEngine();
