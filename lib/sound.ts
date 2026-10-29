// Web Audio API Synthesizer for Spider-Man sound effects (zero external files required)

class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('spider_sense_sound');
      this.enabled = stored !== null ? stored === 'true' : true;
    }
  }

  private initCtx() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('spider_sense_sound', String(this.enabled));
    }
    return this.enabled;
  }

  // Classic Spidey "THWIP!" web shooter sound
  public playWebThwip() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Spider-Sense Tingling pulse sound
  public playSpiderSenseTingle() {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        // Tremolo vibrato
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 16;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 25;
        lfo.connect(osc.frequency);
        lfo.start(now + idx * 0.08);
        lfo.stop(now + idx * 0.08 + 0.22);

        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.23);
      });
    } catch {
      // AudioContext policy fallback
    }
  }

  // Mode Switch Swoosh
  public playModeSwitch(toSpider: boolean) {
    if (!this.enabled) return;
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = toSpider ? 'sawtooth' : 'sine';
      const startFreq = toSpider ? 220 : 660;
      const endFreq = toSpider ? 660 : 220;

      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.21);
    } catch {
      // AudioContext policy fallback
    }
  }
}

export const sound = new SoundFX();
