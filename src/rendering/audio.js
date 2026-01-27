/**
 * Audio Manager
 * Wrapper for game audio including background music and sound effects
 */

import HouseMusic from './backgroundmusic.js';

// ============================================================================
// AUDIO MANAGER
// ============================================================================

class AudioManager {
  constructor() {
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.musicVolume = 0.7;
    this.sfxVolume = 1.0;
  }

  // --- Background Music Controls ---

  startMusic() {
    if (this.musicEnabled) {
      HouseMusic.start();
      HouseMusic.setVolume(this.musicVolume);
    }
  }

  stopMusic() {
    HouseMusic.stop();
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    HouseMusic.setVolume(this.musicVolume);
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  isMusicPlaying() {
    return HouseMusic.isPlaying();
  }

  // --- Music Element Controls (for advanced usage) ---

  toggleMusicElement(element) {
    return HouseMusic.toggleElement(element);
  }

  getMusicArrangement() {
    return HouseMusic.getArrangement();
  }

  getMusicStatus() {
    return HouseMusic.getCurrentSection();
  }

  triggerFilterSweep(direction = 1) {
    HouseMusic.triggerFilterSweep(direction);
  }

  // --- SFX Controls (placeholder for future sound effects) ---

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  getSfxVolume() {
    return this.sfxVolume;
  }

  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  // Placeholder methods for game sound effects
  playSound(soundName, options = {}) {
    if (!this.sfxEnabled) return;

    // Add sound effect implementations here as needed
    // Example: collision sounds, UI sounds, power-ups, etc.
    console.log(`Playing sound: ${soundName}`, options);
  }
}

// Create singleton instance
const audioManager = new AudioManager();

// ============================================================================
// EXPORTS
// ============================================================================

// Export the singleton
export default audioManager;

// Export individual functions for direct usage
export const startMusic = () => audioManager.startMusic();
export const stopMusic = () => audioManager.stopMusic();
export const toggleMusic = () => audioManager.toggleMusic();
export const setMusicVolume = (vol) => audioManager.setMusicVolume(vol);
export const isMusicPlaying = () => audioManager.isMusicPlaying();

// Export the HouseMusic module for direct access if needed
export { HouseMusic };

// Attach to window for standalone testing
if (typeof window !== 'undefined') {
  window.AudioManager = audioManager;
  window.HouseMusic = HouseMusic;
}
