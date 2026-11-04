-- ========================================================
-- IRON — Supabase Database Schema & RLS Policies
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER_STATE TABLE (Cloud state auto-sync)
CREATE TABLE IF NOT EXISTS public.user_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_state: Users can only read, insert, and update their own row
CREATE POLICY "Users can select own state"
  ON public.user_state
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own state"
  ON public.user_state
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own state"
  ON public.user_state
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own state"
  ON public.user_state
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. PUSH_SUBSCRIPTIONS TABLE (Web Push notifications)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  morning_enabled BOOLEAN NOT NULL DEFAULT true,
  morning_time TEXT NOT NULL DEFAULT '06:00',
  evening_enabled BOOLEAN NOT NULL DEFAULT true,
  evening_time TEXT NOT NULL DEFAULT '20:00',
  warning_enabled BOOLEAN NOT NULL DEFAULT true,
  day_end_hour INTEGER NOT NULL DEFAULT 0,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  lang TEXT NOT NULL DEFAULT 'en',
  last_morning_sent DATE,
  last_evening_sent DATE,
  last_warning_sent DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow public/authenticated to insert/update their endpoint
CREATE POLICY "Anyone can upsert push subscription by endpoint"
  ON public.push_subscriptions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Index for cron lookup efficiency
CREATE INDEX IF NOT EXISTS idx_push_subs_lookup 
  ON public.push_subscriptions (morning_enabled, evening_enabled, warning_enabled);

-- ========================================================
-- 3. CRON JOB CONFIGURATION (Runs every 15 minutes)
-- Requires pg_cron and pg_net extensions in Supabase
-- ========================================================
-- To activate in Supabase SQL Editor:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Replace YOUR_PROJECT_REF and YOUR_SERVICE_ROLE_KEY below:
/*
SELECT cron.schedule(
  'send-reminders-every-15m',
  '*\/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    ),
    body := '{}'::jsonb
  );
  $$
);
*/
