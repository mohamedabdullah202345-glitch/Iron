// ========================================================
// Supabase Edge Function: send-reminders
// Runs on Deno runtime every 15 minutes via pg_cron
// ========================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import webPush from 'npm:web-push@3.6.7';

const MORNING_QUOTES_EN = [
  "Waste no more time arguing what a good man should be. Be one. — Marcus Aurelius",
  "At dawn, when you have trouble getting out of bed, tell yourself: I have to go to work, as a human being. — Marcus Aurelius",
  "First say to yourself what you would be; then do what you have to do. — Epictetus",
  "Nobody is coming to save you. Get up. — IRON",
  "Win the morning. Win the day. — IRON",
  "Do the hard thing first. Your day will thank you. — IRON"
];

const MORNING_QUOTES_AR = [
  "لا تضيّع مزيدًا من الوقت في الجدال عما يجب أن يكون عليه الرجل الصالح. كن أنت ذلك الرجل. — ماركوس أوريليوس",
  "عند الفجر، حين تستصعب النهوض من الفراش، قل لنفسك: عليّ أن أبدأ العمل كإنسان. — ماركوس أوريليوس",
  "قل لنفسك أولاً ما تريد أن تكون؛ ثم افعل ما يجب عليك فعله. — إبكتيتوس",
  "لن يأتي أحد لإنقاذك. انهض وابدأ العمل. — IRON",
  "اكسب الصباح، تكسب يومك كاملاً. — IRON",
  "أنجز أصعب مهمة أولاً وسيشكرك يومك. — IRON"
];

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@ironapp.com';
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(JSON.stringify({ error: 'Missing VAPID keys in secrets.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch active subscriptions
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const now = new Date();
    let notificationsSent = 0;

    for (const sub of subs || []) {
      const tz = sub.timezone || 'UTC';
      let userDateStr = '';
      let userHour = 0;
      let userMinute = 0;

      try {
        const dateFormatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: tz,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        userDateStr = dateFormatter.format(now);

        const timeFormatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const [h, m] = timeFormatter.format(now).split(':').map(Number);
        userHour = h;
        userMinute = m;
      } catch {
        continue;
      }

      const isArabic = sub.lang === 'ar';
      const userTotalMinutes = userHour * 60 + userMinute;

      // 1. MORNING REMINDER CHECK (within 15 min window)
      if (sub.morning_enabled && sub.last_morning_sent !== userDateStr) {
        const [mH, mM] = (sub.morning_time || '06:00').split(':').map(Number);
        const morningTotalMin = mH * 60 + mM;

        if (Math.abs(userTotalMinutes - morningTotalMin) <= 15) {
          const quotes = isArabic ? MORNING_QUOTES_AR : MORNING_QUOTES_EN;
          const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

          const payload = JSON.stringify({
            title: isArabic ? 'IRON — صباح الانضباط' : 'IRON — Morning Discipline',
            body: randomQuote,
            url: '/',
            tag: 'iron-morning',
          });

          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          };

          try {
            await webPush.sendNotification(pushSubscription, payload);
            notificationsSent++;
            await supabase
              .from('push_subscriptions')
              .update({ last_morning_sent: userDateStr })
              .eq('id', sub.id);
            continue;
          } catch (e: any) {
            if (e.statusCode === 410 || e.statusCode === 404) {
              await supabase.from('push_subscriptions').delete().eq('id', sub.id);
            }
          }
        }
      }

      // 2. EVENING REMINDER CHECK (within 15 min window)
      if (sub.evening_enabled && sub.last_evening_sent !== userDateStr) {
        const [eH, eM] = (sub.evening_time || '20:00').split(':').map(Number);
        const eveningTotalMin = eH * 60 + eM;

        if (Math.abs(userTotalMinutes - eveningTotalMin) <= 15) {
          const payload = JSON.stringify({
            title: isArabic ? 'IRON — تذكير المساء' : 'IRON — Evening Missions Check',
            body: isArabic
              ? 'ما زالت لديك مهام اليوم. لا تكسر التسلسل.'
              : 'You still have missions today. Do not break the streak.',
            url: '/',
            tag: 'iron-evening',
          });

          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          };

          try {
            await webPush.sendNotification(pushSubscription, payload);
            notificationsSent++;
            await supabase
              .from('push_subscriptions')
              .update({ last_evening_sent: userDateStr })
              .eq('id', sub.id);
            continue;
          } catch (e: any) {
            if (e.statusCode === 410 || e.statusCode === 404) {
              await supabase.from('push_subscriptions').delete().eq('id', sub.id);
            }
          }
        }
      }

      // 3. EVENING WARNING (2 hours before user custom dayEnd hour)
      if (sub.warning_enabled && sub.last_warning_sent !== userDateStr) {
        const dayEndHour = sub.day_end_hour ?? 0;
        const warningHour = (dayEndHour - 2 + 24) % 24;

        if (userHour === warningHour && userMinute <= 15) {
          const payload = JSON.stringify({
            title: isArabic ? 'IRON — تحذير: تسلسلك في خطر!' : 'IRON — Streak at Risk!',
            body: isArabic
              ? 'ساعتان فقط تفصلك عن نهاية يومك. أنجز مهامك الآن واحمِ تسلسلك.'
              : 'Only 2 hours left before your day ends. Finish your missions now to protect your streak.',
            url: '/',
            tag: 'iron-warning',
          });

          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          };

          try {
            await webPush.sendNotification(pushSubscription, payload);
            notificationsSent++;
            await supabase
              .from('push_subscriptions')
              .update({ last_warning_sent: userDateStr })
              .eq('id', sub.id);
          } catch (e: any) {
            if (e.statusCode === 410 || e.statusCode === 404) {
              await supabase.from('push_subscriptions').delete().eq('id', sub.id);
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: subs?.length || 0,
        notificationsSent,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
