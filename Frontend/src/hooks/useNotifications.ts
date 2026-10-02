import { useEffect, useRef } from 'react';

type SoundType = 'order' | 'message' | 'delivery';

let audioContext: AudioContext | null = null;

function unlockAudioContext() {
  const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtor) return;

  if (!audioContext) {
    audioContext = new AudioCtor();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => undefined);
  }
}

function playSound(type: SoundType) {
  try {
    unlockAudioContext();
    const ctx = audioContext ?? new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!ctx) return;
    const configs: Record<SoundType, { freqs: number[]; duration: number; volume: number }> = {
      order:    { freqs: [880, 1100, 1320], duration: 0.18, volume: 0.9 },
      message:  { freqs: [660, 880],        duration: 0.15, volume: 0.7 },
      delivery: { freqs: [440, 440, 440],   duration: 0.1,  volume: 0.85 },
    };
    const { freqs, duration, volume } = configs[type];
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => undefined);
    }
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
    setTimeout(() => {
      if (audioContext && audioContext.state === 'running') {
        audioContext.resume().catch(() => undefined);
      }
    }, 100);
  } catch { /* silent fail */ }
}

const ATTENTION_STORAGE_KEY = 'duwaz_attention_count';

function setAttentionBadge(count: number) {
  const safeCount = Math.max(0, Number.isFinite(count) ? count : 0);

  try {
    if (safeCount > 0) {
      localStorage.setItem(ATTENTION_STORAGE_KEY, String(safeCount));
    } else {
      localStorage.removeItem(ATTENTION_STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent('duwaz-attention-change', { detail: { count: safeCount } }));
  } catch { /* ignore */ }

  try {
    if ('setAppBadge' in navigator && typeof navigator.setAppBadge === 'function') {
      if (safeCount > 0) {
        navigator.setAppBadge(safeCount).catch(() => undefined);
      } else {
        navigator.clearAppBadge?.().catch(() => undefined);
      }
      return;
    }
  } catch { /* ignore */ }

  if (safeCount > 0 && document.visibilityState !== 'visible') {
    const previousTitle = (document as any).__duwaz_prevTitle || document.title;
    document.title = `(${safeCount}) Duwaz needs your attention`;
    (document as any).__duwaz_prevTitle = previousTitle;
  } else if (safeCount === 0 && (document as any).__duwaz_prevTitle) {
    document.title = (document as any).__duwaz_prevTitle;
    delete (document as any).__duwaz_prevTitle;
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
    try { navigator.vibrate([200, 120, 240, 120, 600]); } catch { /* ignore */ }
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const options: NotificationOptions = {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `duwaz-${Date.now()}`,
    requireInteraction: true,
    silent: true,
  };
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => registration.showNotification(title, options))
      .catch(() => undefined);
  } else {
    try { new Notification(title, options); } catch { /* ignore */ }
  }
}

interface NotifyOptions {
  newOrderCount?:    number;
  newOrderIds?:      number[];
  newMessageCount?:  number;
  newDeliveryCount?: number;
  newDeliveryIds?:   number[];
}

function getSeenStorageKey(kind: 'orders' | 'deliveries') {
  try {
    const rawUser = localStorage.getItem('duwaz_user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    const userId = user?.userId ?? 'guest';
    const role = user?.role ?? 'guest';
    return `duwaz_seen_${kind}_${role}_${userId}`;
  } catch {
    return `duwaz_seen_${kind}_guest`;
  }
}

function readSeenIds(key: string): Set<number> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n): n is number => typeof n === 'number' && Number.isFinite(n)));
  } catch {
    return new Set();
  }
}

function writeSeenIds(key: string, ids: number[]) {
  try {
    const unique = [...new Set(ids.filter(id => Number.isFinite(id)))].sort((a, b) => a - b);
    localStorage.setItem(key, JSON.stringify(unique));
    window.dispatchEvent(new CustomEvent('duwaz-attention-change', { detail: { count: unique.length } }));
  } catch { /* ignore */ }
}

/**
 * Plays a sound and shows a browser notification when counts increase.
 *
 * The real fix here is to compare actual IDs, not just the total count. That way
 * we only report genuinely new orders/deliveries while ignoring older pending work.
 */
export function useNotifications({
  newOrderCount    = 0,
  newOrderIds      = [],
  newMessageCount  = 0,
  newDeliveryCount = 0,
  newDeliveryIds   = [],
}: NotifyOptions) {

  // null = not yet initialised (waiting for first real data)
  const prevOrders   = useRef<number | null>(null);
  const prevMessages = useRef<number | null>(null);
  const prevDelivery = useRef<number | null>(null);

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'DUWAZ_PUSH') return;
      const notification = event.data.notification as { title?: string; body?: string; tag?: string; data?: Record<string, unknown> };
      const kind = notification?.data?.type;
      const targetId = Number(notification?.data?.targetId);

      if (kind === 'order' && Number.isFinite(targetId)) {
        const key = getSeenStorageKey('orders');
        writeSeenIds(key, [...readSeenIds(key), targetId]);
      } else if (kind === 'message' && prevMessages.current !== null) {
        prevMessages.current += 1;
      } else if (kind === 'delivery' && Number.isFinite(targetId)) {
        const key = getSeenStorageKey('deliveries');
        writeSeenIds(key, [...readSeenIds(key), targetId]);
      }

      if (!document.hidden) {
        const sound = kind === 'order' ? 'order' : kind === 'delivery' ? 'delivery' : 'message';
        playSound(sound);
        showBrowserNotification(notification?.title ?? 'Duwaz alert', notification?.body ?? 'You have a new update.');
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
  }, []);
  // Audio is unlocked after the user's first interaction; notification permission
  // is requested explicitly by the push settings control, never on page load.
  useEffect(() => {
    const unlock = () => unlockAudioContext();
    const events = ['pointerdown', 'keydown', 'touchstart', 'click'];
    events.forEach((eventName) => window.addEventListener(eventName, unlock, { passive: true }));
    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, unlock));
    };
  }, []);

  // Keep the badge in sync with unresolved work, but only sound/notify when a new
  // order, message, or delivery arrives (not repeatedly every few seconds).
  useEffect(() => {
    const activeAlertCount = (newOrderCount || 0) + (newDeliveryCount || 0) + (newMessageCount || 0);
    if (activeAlertCount > 0) setAttentionBadge(activeAlertCount);
    else clearAttentionBadge();
  }, [newOrderCount, newDeliveryCount, newMessageCount]);

  // Orders: compare IDs so we only flag truly new pending orders.
  useEffect(() => {
    const seenKey = getSeenStorageKey('orders');
    const seen = readSeenIds(seenKey);
    const currentIds = newOrderIds.filter(id => Number.isFinite(id));
    const newIds = currentIds.filter(id => !seen.has(id));

    if (newIds.length > 0) {
      playSound('order');
      showBrowserNotification(
        'Duwaz needs your attention',
        `You have ${newIds.length} new order${newIds.length > 1 ? 's' : ''} waiting.`
      );
    }

    // Maintain the visible badge based on live pending work, not only on diff.
    if (newOrderCount > 0) {
      setAttentionBadge(newOrderCount);
    }

    writeSeenIds(seenKey, [...seen, ...currentIds]);
    prevOrders.current = newOrderCount;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOrderCount, JSON.stringify(newOrderIds)]);

  // Messages
  useEffect(() => {
    if (prevMessages.current === null) {
      prevMessages.current = newMessageCount;
      if (newMessageCount > 0) {
        setAttentionBadge(newMessageCount);
      }
      return;
    }
    if (newMessageCount > prevMessages.current) {
      const diff = newMessageCount - prevMessages.current;
      playSound('message');
      showBrowserNotification(
        'Duwaz needs your attention',
        `You have ${diff} unread message${diff > 1 ? 's' : ''}.`
      );
    }
    if (newMessageCount > 0) {
      setAttentionBadge(newMessageCount);
    }
    prevMessages.current = newMessageCount;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessageCount]);

  // Deliveries (driver): compare actual assignment IDs so older job counts don't keep firing.
  useEffect(() => {
    const seenKey = getSeenStorageKey('deliveries');
    const seen = readSeenIds(seenKey);
    const currentIds = newDeliveryIds.filter(id => Number.isFinite(id));
    const newIds = currentIds.filter(id => !seen.has(id));

    if (newIds.length > 0) {
      playSound('delivery');
      showBrowserNotification(
        'Duwaz needs your attention',
        `You have ${newIds.length} new delivery assignment${newIds.length > 1 ? 's' : ''}.`
      );
    }

    if (newDeliveryCount > 0) {
      setAttentionBadge(newDeliveryCount);
    }

    writeSeenIds(seenKey, [...seen, ...currentIds]);
    prevDelivery.current = newDeliveryCount;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newDeliveryCount, JSON.stringify(newDeliveryIds)]);

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
      const totalAttention = (newOrderCount || 0) + (newMessageCount || 0) + (newDeliveryCount || 0);
      if (totalAttention > 0) {
        setAttentionBadge(totalAttention);
        return;
      }

      clearAttentionBadge();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [newOrderCount, newMessageCount, newDeliveryCount]);
}
