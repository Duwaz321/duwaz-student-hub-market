import { useEffect, useRef, useCallback } from 'react';

// ── Sound generator using Web Audio API ──────────────────────────────────────
// No external file needed — generates tones programmatically.
// Works on mobile, offline, and doesn't require any assets.

type SoundType = 'order' | 'message' | 'delivery';

function playSound(type: SoundType) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const configs: Record<SoundType, { freqs: number[]; duration: number; volume: number }> = {
      // Order: two-tone ascending chime — loud and attention-grabbing
      order: { freqs: [880, 1100, 1320], duration: 0.18, volume: 0.9 },
      // Message: single soft ding
      message: { freqs: [660, 880], duration: 0.15, volume: 0.7 },
      // Delivery: triple beep for driver
      delivery: { freqs: [440, 440, 440], duration: 0.1, volume: 0.85 },
    };

    const { freqs, duration, volume } = configs[type];

    freqs.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode   = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type      = 'sine';
      oscillator.frequency.value = freq;

      const startTime = ctx.currentTime + i * (duration + 0.05);
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.01);
    });

    // Clean up audio context after sounds finish
    const totalDuration = (freqs.length * (duration + 0.05) + 0.5) * 1000;
    setTimeout(() => ctx.close(), totalDuration);

  } catch {
    // Web Audio not available (old browser) — silent fail
  }
}

// ── Browser push notification ─────────────────────────────────────────────────
function showBrowserNotification(title: string, body: string, icon = '/favicon.ico') {
  if (!('Notification' in window)) return;

  const send = () => {
    try {
      new Notification(title, { body, icon, badge: '/favicon.ico' });
    } catch {
      // Some browsers block notifications in iframes — ignore
    }
  };

  if (Notification.permission === 'granted') {
    send();
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') send();
    });
  }
}

// ── Main hook ─────────────────────────────────────────────────────────────────

interface NotifyOptions {
  /** Number of new orders to alert on */
  newOrderCount?: number;
  /** Number of new messages to alert on */
  newMessageCount?: number;
  /** Number of new delivery assignments to alert on */
  newDeliveryCount?: number;
}

/**
 * useNotifications
 *
 * Plays a loud sound and shows a browser notification whenever the
 * provided counts increase. Designed to be called from any dashboard.
 *
 * Usage:
 *   useNotifications({ newOrderCount: orders.length, newMessageCount: unread });
 *
 * On first render the baseline is recorded — only increases after that trigger alerts.
 */
export function useNotifications({
  newOrderCount    = 0,
  newMessageCount  = 0,
  newDeliveryCount = 0,
}: NotifyOptions) {

  const prevOrders    = useRef<number | null>(null);
  const prevMessages  = useRef<number | null>(null);
  const prevDelivery  = useRef<number | null>(null);

  // Request browser notification permission on first call
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Skip the very first render — just record the baseline
    if (prevOrders.current === null) {
      prevOrders.current = newOrderCount;
      return;
    }
    if (newOrderCount > prevOrders.current) {
      const diff = newOrderCount - prevOrders.current;
      playSound('order');
      showBrowserNotification(
        `🛍️ ${diff} New Order${diff > 1 ? 's' : ''}!`,
        `You have ${diff} new order${diff > 1 ? 's' : ''} waiting for action.`
      );
    }
    prevOrders.current = newOrderCount;
  }, [newOrderCount]);

  useEffect(() => {
    if (prevMessages.current === null) {
      prevMessages.current = newMessageCount;
      return;
    }
    if (newMessageCount > prevMessages.current) {
      const diff = newMessageCount - prevMessages.current;
      playSound('message');
      showBrowserNotification(
        `💬 ${diff} New Message${diff > 1 ? 's' : ''}`,
        `You have ${diff} unread message${diff > 1 ? 's' : ''}.`
      );
    }
    prevMessages.current = newMessageCount;
  }, [newMessageCount]);

  useEffect(() => {
    if (prevDelivery.current === null) {
      prevDelivery.current = newDeliveryCount;
      return;
    }
    if (newDeliveryCount > prevDelivery.current) {
      const diff = newDeliveryCount - prevDelivery.current;
      playSound('delivery');
      showBrowserNotification(
        `🚗 New Delivery Assigned!`,
        `You have ${diff} new delivery assignment${diff > 1 ? 's' : ''}.`
      );
    }
    prevDelivery.current = newDeliveryCount;
  }, [newDeliveryCount]);
}
