/**
 * Sound synthesis service for Radar alerts and telemetry using Web Audio API
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  /**
   * High tech radar optical beam trigger chirp
   */
  public playBeamTrigger() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore audio failure
    }
  }

  /**
   * Dual-tone Doppler radar overspeed siren alarm
   */
  public playOverspeedAlert() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Emergency two-tone alert
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.setValueAtTime(650, now + 0.12);
      osc.frequency.setValueAtTime(1050, now + 0.24);
      osc.frequency.setValueAtTime(750, now + 0.36);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.48);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // Ignore audio failure
    }
  }

  /**
   * Mechanical camera shutter click + capacitor whine for radar flash snapshot
   */
  public playCameraFlash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // White noise burst for mechanical click
      const bufferSize = this.ctx.sampleRate * 0.06;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      noise.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);

      // Electronic capacitor recharge tone
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now + 0.07);
      osc.frequency.exponentialRampToValueAtTime(3200, now + 0.35);

      oscGain.gain.setValueAtTime(0.04, now + 0.07);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(now + 0.07);
      osc.stop(now + 0.36);
    } catch {
      // Ignore
    }
  }

  /**
   * SpeechSynthesis verbal warning
   */
  public speak(text: string) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      // Cancel previous pending speech to avoid backlog
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.1;
      utterance.pitch = 0.95;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {
      // SpeechSynthesis may be blocked or unavailable
    }
  }
}

export const soundManager = new SoundService();
