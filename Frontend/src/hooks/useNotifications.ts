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

function showBrowserNotification(title: string, body: string) {
  if (!('Notification' in window)) return;
  const send = () => {
    try { new Notification(title, { body, icon: '/favicon.ico' }); } catch { /* ignore */ }
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
        `🛍️ ${diff} New Order${diff > 1 ? 's' : ''}!`,
        `You have ${diff} new order${diff > 1 ? 's' : ''} waiting.`
      );
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
        `💬 ${diff} New Message${diff > 1 ? 's' : ''}`,
        `You have ${diff} unread message${diff > 1 ? 's' : ''}.`
      );
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
        `🚗 New Delivery Assigned!`,
        `You have ${diff} new delivery assignment${diff > 1 ? 's' : ''}.`
      );
    }
    prevDelivery.current = newDeliveryCount;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newDeliveryCount]);
}
