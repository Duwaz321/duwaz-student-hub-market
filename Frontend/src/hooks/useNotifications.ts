import { useEffect, useRef } from 'react';

type SoundType = 'order' | 'message' | 'delivery';

function playSound(type: SoundType) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const configs: Record<SoundType, { freqs: number[]; duration: number; volume: number }> = {
      order:    { freqs: [880, 1100, 1320], duration: 0.18, volume: 0.9 },
      message:  { freqs: [660, 880],        duration: 0.15, volume: 0.7 },
      delivery: { freqs: [440, 440, 440],   duration: 0.1,  volume: 0.85 },
    };
    const { freqs, duration, volume } = configs[type];
    freqs.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * (duration + 0.05);
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.start(t);
      osc.stop(t + duration + 0.01);
    });
    setTimeout(() => ctx.close(), (freqs.length * (duration + 0.05) + 0.5) * 1000);
  } catch { /* silent fail */ }
}

const ATTENTION_STORAGE_KEY = 'duwaz_attention_count';

function setAttentionBadge(count: number) {
  try {
    localStorage.setItem(ATTENTION_STORAGE_KEY, String(Math.max(1, count)));
    window.dispatchEvent(new CustomEvent('duwaz-attention-change', { detail: { count: Math.max(1, count) } }));
  } catch { /* ignore */ }

  try {
    if ('setAppBadge' in navigator && typeof navigator.setAppBadge === 'function') {
      navigator.setAppBadge(count).catch(() => undefined);
      return;
    }
  } catch { /* ignore */ }

  if (count > 0 && document.visibilityState !== 'visible') {
    const previousTitle = document.title;
    document.title = `(${count}) Duwaz needs your attention`;
    (document as any).__duwaz_prevTitle = previousTitle;
  }
}

function clearAttentionBadge() {
  try {
    localStorage.removeItem(ATTENTION_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('duwaz-attention-change', { detail: { count: 0 } }));
  } catch { /* ignore */ }

  try {
    if ('clearAppBadge' in navigator && typeof navigator.clearAppBadge === 'function') {
      navigator.clearAppBadge().catch(() => undefined);
    }
  } catch { /* ignore */ }

  if ((document as any).__duwaz_prevTitle) {
    document.title = (document as any).__duwaz_prevTitle;
    delete (document as any).__duwaz_prevTitle;
  }
}

function showBrowserNotification(title: string, body: string) {
  if ('vibrate' in navigator) {
    try { navigator.vibrate([500, 180, 500, 180, 900]); } catch { /* ignore */ }
  }

  if (!('Notification' in window)) return;
  const send = () => {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'duwaz-attention',
        requireInteraction: true,
        silent: false,
      });
    } catch { /* ignore */ }
  };
  if (Notification.permission === 'granted') send();
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(p => { if (p === 'granted') send(); });
  }
}

interface NotifyOptions {
  newOrderCount?:    number;
  newMessageCount?:  number;
  newDeliveryCount?: number;
}

/**
 * Plays a sound and shows a browser notification when counts increase.
 *
 * Key fix: baseline is recorded only AFTER the data has loaded (i.e. count > 0
 * or after first non-undefined value). This prevents false alerts on mount
 * and stops the reload loop caused by re-rendering on every poll cycle.
 */
export function useNotifications({
  newOrderCount    = 0,
  newMessageCount  = 0,
  newDeliveryCount = 0,
}: NotifyOptions) {

  // null = not yet initialised (waiting for first real data)
  const prevOrders   = useRef<number | null>(null);
  const prevMessages = useRef<number | null>(null);
  const prevDelivery = useRef<number | null>(null);

  // Request permission once on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Orders
  useEffect(() => {
    if (prevOrders.current === null) {
      // Record baseline on first data arrival — do NOT alert
      prevOrders.current = newOrderCount;
      return;
    }
    if (newOrderCount > prevOrders.current) {
      const diff = newOrderCount - prevOrders.current;
      playSound('order');
      showBrowserNotification(
        'Duwaz needs your attention',
        `You have ${diff} new order${diff > 1 ? 's' : ''} waiting.`
      );
      if (document.visibilityState === 'hidden') {
        setAttentionBadge(diff);
      }
    }
    prevOrders.current = newOrderCount;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOrderCount]);

  // Messages
  useEffect(() => {
    if (prevMessages.current === null) {
      prevMessages.current = newMessageCount;
      return;
    }
    if (newMessageCount > prevMessages.current) {
      const diff = newMessageCount - prevMessages.current;
      playSound('message');
      showBrowserNotification(
        'Duwaz needs your attention',
        `You have ${diff} unread message${diff > 1 ? 's' : ''}.`
      );
      if (document.visibilityState === 'hidden') {
        setAttentionBadge(diff);
      }
    }
    prevMessages.current = newMessageCount;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessageCount]);

  // Deliveries (driver)
  useEffect(() => {
    if (prevDelivery.current === null) {
      prevDelivery.current = newDeliveryCount;
      return;
    }
    if (newDeliveryCount > prevDelivery.current) {
      const diff = newDeliveryCount - prevDelivery.current;
      playSound('delivery');
      showBrowserNotification(
        'Duwaz needs your attention',
        `You have ${diff} new delivery assignment${diff > 1 ? 's' : ''}.`
      );
      if (document.visibilityState === 'hidden') {
        setAttentionBadge(diff);
      }
    }
    prevDelivery.current = newDeliveryCount;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newDeliveryCount]);

  // Keep the installed app badge/title in sync so the home-screen icon visibly
  // signals there is something that needs the shop owner’s attention.
  useEffect(() => {
    const totalAttention = (newOrderCount || 0) + (newMessageCount || 0) + (newDeliveryCount || 0);
    if (totalAttention > 0) {
      setAttentionBadge(totalAttention);
      return;
    }
    clearAttentionBadge();
  }, [newOrderCount, newMessageCount, newDeliveryCount]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        clearAttentionBadge();
        return;
      }

      const totalAttention = (newOrderCount || 0) + (newMessageCount || 0) + (newDeliveryCount || 0);
      if (totalAttention > 0) {
        setAttentionBadge(totalAttention);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [newOrderCount, newMessageCount, newDeliveryCount]);
}
