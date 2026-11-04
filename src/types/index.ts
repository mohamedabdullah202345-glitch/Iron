export interface Mission {
  id: string;
  t: string;
  days: number[]; // 0 = Mon, 6 = Sun
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD or ""
}

export interface FocusRun {
  end: number;
  min: number;
}

export interface QuoteDay {
  d: string;
  k: 'n' | 's'; // normal or soft/hard
  i: number;
}

export interface ReminderSettings {
  morningEnabled: boolean;
  morningTime: string; // e.g. "06:00"
  eveningEnabled: boolean;
  eveningTime: string; // e.g. "20:00"
  warningEnabled: boolean; // 2 hours before custom dayEnd
  timezone: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'local_only' | 'error';

export interface IronState {
  v: number;
  setup: number; // 0 = onboarding, 1 = ready
  name: string;
  goal: string;
  lang: 'en' | 'ar';
  dayEnd: number; // 0 to 23: when the 24h user day starts/ends
  start: string; // First active date YYYY-MM-DD
  missions: Mission[];
  done: Record<string, string[]>; // date -> missionId[]
  won: Record<string, number>; // date -> 1
  rest: Record<string, number>; // date -> 1
  snap: Record<string, Array<{ id: string; t: string }>>; // snapshot of won days
  notes: Record<string, string>;
  fix: Record<string, string>;
  focus: Record<string, number>; // date -> total minutes
  fses: Record<string, number>; // date -> session count
  frun: FocusRun | null;
  fmin: number; // 15, 25, 45, 60
  favs: string[]; // e.g. "n12", "s3"
  bagN: number[];
  bagS: number[];
  qday: QuoteDay | null;
  hard: Record<string, number>;
  lastBackup: number;
  persisted: number;
  reminders?: ReminderSettings;
  cloudMigrated?: boolean;
}

export interface CalculatedStats {
  st: Record<string, 'won' | 'shield' | 'rest' | 'now' | 'miss' | 'off' | 'none'>;
  used: Record<string, string>; // weekStart -> shielded date
  streak: number;
  best: number;
  total: number;
}

export interface RankInfo {
  nameEn: string;
  nameAr: string;
  threshold: number;
  roman: string;
}
