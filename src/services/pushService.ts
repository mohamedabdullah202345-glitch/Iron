import { supabase, isSupabaseConfigured } from './supabase';
import { ReminderSettings } from '../types';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function subscribeToPush(
  reminders: ReminderSettings,
  lang: 'en' | 'ar',
  dayEndHour: number,
  userId?: string | null
): Promise<{ success: boolean; error?: string }> {
  if (!isPushSupported()) {
    return { success: false, error: 'Push notifications are not supported by this browser.' };
  }

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidKey || vapidKey.includes('your-vapid-public-key')) {
    return {
      success: false,
      error: 'VAPID public key not configured. Please set VITE_VAPID_PUBLIC_KEY in your environment.'
    };
  }

  try {
    // Explicit user gesture permission request
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Notification permission was denied.' };
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as BufferSource,
      });
    }

    const subJson = subscription.toJSON();
    const endpoint = subJson.endpoint;
    const p256dh = subJson.keys?.p256dh;
    const auth = subJson.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return { success: false, error: 'Failed to extract push subscription keys.' };
    }

    // Save to Supabase table if configured
    if (supabase && isSupabaseConfigured()) {
      const { error: dbError } = await supabase.from('push_subscriptions').upsert(
        {
          endpoint,
          p256dh,
          auth,
          user_id: userId || null,
          morning_enabled: reminders.morningEnabled,
          morning_time: reminders.morningTime,
          evening_enabled: reminders.eveningEnabled,
          evening_time: reminders.eveningTime,
          warning_enabled: reminders.warningEnabled,
          day_end_hour: dayEndHour,
          timezone: reminders.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          lang: lang,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

      if (dbError) {
        console.warn('Failed to save push subscription to Supabase:', dbError.message);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Push subscription failed:', err);
    return { success: false, error: err.message || 'Push subscription failed.' };
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      if (supabase && isSupabaseConfigured() && endpoint) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function updatePushPreferences(
  reminders: ReminderSettings,
  lang: 'en' | 'ar',
  dayEndHour: number,
  userId?: string | null
) {
  if (!isPushSupported() || !supabase || !isSupabaseConfigured()) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const subJson = subscription.toJSON();
      if (subJson.endpoint && subJson.keys) {
        await supabase.from('push_subscriptions').upsert(
          {
            endpoint: subJson.endpoint,
            p256dh: subJson.keys.p256dh,
            auth: subJson.keys.auth,
            user_id: userId || null,
            morning_enabled: reminders.morningEnabled,
            morning_time: reminders.morningTime,
            evening_enabled: reminders.eveningEnabled,
            evening_time: reminders.eveningTime,
            warning_enabled: reminders.warningEnabled,
            day_end_hour: dayEndHour,
            timezone: reminders.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            lang: lang,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'endpoint' }
        );
      }
    }
  } catch (err) {
    console.warn('Could not update push preferences:', err);
  }
}
