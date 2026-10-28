/**
 * Synthesizes pleasant institutional chime tones for price alerts and dip notifications
 * using Web Audio API (zero external assets, 100% offline & local).
 */
export function playAlertChime(type: 'dip' | 'target' | 'success' = 'dip'): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'dip') {
      // Urgent but pleasant harmonic chime (E5 -> B5)
      osc1.frequency.setValueAtTime(659.25, now); // E5
      osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.12); // B5
      osc2.frequency.setValueAtTime(329.63, now); // E4
      osc2.frequency.exponentialRampToValueAtTime(493.88, now + 0.12); // B4
    } else if (type === 'target') {
      // Target hit celebratory chime (C5 -> G5 -> C6)
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(783.99, now + 0.1); // G5
      osc1.frequency.setValueAtTime(1046.5, now + 0.2); // C6
      osc2.frequency.setValueAtTime(261.63, now); // C4
    } else {
      // Success bell
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.15); // A5
      osc2.frequency.setValueAtTime(440.0, now);
    }

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.55);
    osc2.stop(now + 0.55);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 800);
  } catch (err) {
    console.warn('Audio alert sound could not be initialized:', err);
  }
}

/**
 * Requests browser Notification API permission and sends a desktop alert.
 */
export async function sendDesktopNotification(title: string, body: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;

  try {
    let perm = Notification.permission;
    if (perm === 'default') {
      perm = await Notification.requestPermission();
    }
    if (perm === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon.svg',
      });
      return true;
    }
  } catch (err) {
    console.warn('Notification error:', err);
  }
  return false;
}
