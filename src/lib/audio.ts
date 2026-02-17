import { Howl } from "howler";

export type SoundTrack = "rain" | "nature" | "gentle";

class SoundManager {
  private sounds: Map<SoundTrack, Howl> = new Map();
  private currentTrack: SoundTrack | null = null;
  private _enabled = false;
  private _volume = 0.3;

  private getOrCreateSound(track: SoundTrack): Howl {
    if (!this.sounds.has(track)) {
      const sound = new Howl({
        src: [`/sounds/ambient-${track}.mp3`],
        loop: true,
        volume: 0,
        html5: true,
      });
      this.sounds.set(track, sound);
    }
    return this.sounds.get(track)!;
  }

  play(track: SoundTrack = "rain") {
    if (this.currentTrack && this.currentTrack !== track) {
      this.pause();
    }

    const sound = this.getOrCreateSound(track);
    this.currentTrack = track;
    this._enabled = true;

    if (!sound.playing()) {
      sound.play();
    }
    sound.fade(sound.volume(), this._volume, 2000);
  }

  pause() {
    if (!this.currentTrack) return;
    const sound = this.sounds.get(this.currentTrack);
    if (sound) {
      sound.fade(sound.volume(), 0, 1500);
      setTimeout(() => {
        if (!this._enabled) sound.pause();
      }, 1500);
    }
    this._enabled = false;
  }

  toggle(track: SoundTrack = "rain") {
    if (this._enabled) {
      this.pause();
    } else {
      this.play(track);
    }
  }

  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.currentTrack) {
      const sound = this.sounds.get(this.currentTrack);
      if (sound) sound.volume(this._volume);
    }
  }

  get enabled() {
    return this._enabled;
  }

  get volume() {
    return this._volume;
  }

  destroy() {
    this.sounds.forEach((sound) => sound.unload());
    this.sounds.clear();
    this.currentTrack = null;
    this._enabled = false;
  }
}

export const soundManager = new SoundManager();
