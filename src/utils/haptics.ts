/**
 * Haptic feedback utility for Aurum Luxury Habit Tracker.
 * Employs subtle, crisp vibration sequences via navigator.vibrate
 * to evoke a refined tactile sensation akin to a high-end physical timepiece or Taptic Engine.
 */

// Subtle haptic cadence presets (in milliseconds)
export const HAPTIC_PATTERNS = {
  // Primary check-in confirmation: soft primary click -> 40ms stillness -> crisp settling tap
  CHECK_IN: [12, 40, 18],
  // All habits completed milestone: nuanced celebratory cadence
  ALL_COMPLETED: [15, 40, 15, 40, 25],
  // Unchecking: ultra-light single release tap
  UNCHECK: [8],
  // Subtle selection tick
  SELECTION: [6],
} as const;

let audioCtx: AudioContext | null = null;

/**
 * Very quiet, high-frequency subtle acoustic tap (simulated tactile tick on desktop/non-vibrating devices)
 */
function playSubtleAcousticTick(frequency: number = 880, duration: number = 0.02, volume: number = 0.03) {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.4, audioCtx.currentTime + duration);

    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    // Audio context may be restricted by autoplay policy; silently ignore
  }
}

/**
 * Triggers tactile vibration using navigator.vibrate with graceful fallbacks.
 */
export function triggerHaptic(pattern: number | number[] | readonly number[]) {
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern as VibratePattern);
    } catch {
      // Ignore vibration errors (e.g. if user agent restricts in background)
    }
  }
}

/**
 * Tactile feedback for habit check-in actions.
 * @param isCheckingIn true if checking habit as completed, false if unchecking
 * @param isDayComplete true if this check-in completed all habits for the day
 */
export function triggerCheckInHaptic(isCheckingIn: boolean, isDayComplete: boolean = false) {
  if (isCheckingIn) {
    if (isDayComplete) {
      triggerHaptic(HAPTIC_PATTERNS.ALL_COMPLETED);
      playSubtleAcousticTick(960, 0.035, 0.04);
    } else {
      triggerHaptic(HAPTIC_PATTERNS.CHECK_IN);
      playSubtleAcousticTick(820, 0.025, 0.03);
    }
  } else {
    triggerHaptic(HAPTIC_PATTERNS.UNCHECK);
    playSubtleAcousticTick(440, 0.018, 0.02);
  }
}

/**
 * General subtle touch feedback for key CTA presses or tab selection
 */
export function triggerSelectionHaptic() {
  triggerHaptic(HAPTIC_PATTERNS.SELECTION);
}
