import { IronState, CalculatedStats, Mission } from '../types';

export function padZero(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function dateToString(d: Date): string {
  return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
}

export function parseDate(str: string): Date {
  const parts = str.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

export function addDays(str: string, n: number): string {
  const d = parseDate(str);
  d.setDate(d.getDate() + n);
  return dateToString(d);
}

/**
 * Calculates user's "current day" string YYYY-MM-DD.
 * If dayEnd = 5, the new day starts at 5:00 AM, meaning 3:00 AM is still counted as yesterday.
 */
export function getEffectiveToday(dayEndHour: number = 0): string {
  const now = new Date();
  const adjusted = new Date(now.getTime() - dayEndHour * 3600 * 1000);
  return dateToString(adjusted);
}

/**
 * Returns 0 for Monday, 6 for Sunday.
 */
export function getDayOfWeekIndex(dateStr: string): number {
  const d = parseDate(dateStr);
  return (d.getDay() + 6) % 7;
}

/**
 * Returns Monday of that week in YYYY-MM-DD.
 */
export function getWeekStart(dateStr: string): string {
  const dayIdx = getDayOfWeekIndex(dateStr);
  return addDays(dateStr, -dayIdx);
}

/**
 * Seconds left until the current 24-hour cycle completes (at next dayEnd hour).
 */
export function getSecondsRemaining(dayEndHour: number = 0): number {
  const todayStr = getEffectiveToday(dayEndHour);
  const t = parseDate(todayStr);
  const end = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1, dayEndHour);
  const diff = Math.floor((end.getTime() - Date.now()) / 1000);
  return Math.max(0, diff);
}

export function getTasksForDay(state: IronState, dateStr: string): Array<{ id: string; t: string }> {
  if (state.snap[dateStr]) {
    return state.snap[dateStr];
  }
  const dayIdx = getDayOfWeekIndex(dateStr);
  return state.missions
    .filter((m) => {
      const activeDay = m.days.includes(dayIdx);
      const afterFrom = !m.from || m.from <= dateStr;
      const beforeTo = !m.to || dateStr < m.to;
      return activeDay && afterFrom && beforeTo;
    })
    .map((m) => ({ id: m.id, t: m.t }));
}

export function getDoneOnDay(state: IronState, dateStr: string): string[] {
  return state.done[dateStr] || [];
}

export function getDoneCountOnDay(state: IronState, dateStr: string): number {
  const doneIds = getDoneOnDay(state, dateStr);
  const tasks = getTasksForDay(state, dateStr);
  return tasks.filter((m) => doneIds.includes(m.id)).length;
}

export function isRestUsedThisWeek(state: IronState, todayStr: string): boolean {
  const monday = getWeekStart(todayStr);
  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i);
    if (state.rest[d] && d !== todayStr) {
      return true;
    }
  }
  return false;
}

/**
 * Computes streak, best streak, total wins, and day statuses.
 * Includes shield logic: 1 shield per week that protects a single isolated missed day.
 */
export function computeIronStats(state: IronState): CalculatedStats {
  const todayStr = getEffectiveToday(state.dayEnd);
  const st: CalculatedStats['st'] = {};
  const used: CalculatedStats['used'] = {};

  let run = 0;
  let best = 0;
  let prev = '';
  let d = state.start || todayStr;
  if (d > todayStr) d = todayStr;

  while (d <= todayStr) {
    let s: 'won' | 'shield' | 'rest' | 'now' | 'miss' | 'off';

    if (state.won[d]) {
      s = 'won';
    } else if (state.rest[d]) {
      s = 'rest';
    } else if (d === todayStr) {
      s = 'now';
    } else if (!getTasksForDay(state, d).length) {
      s = 'off';
    } else {
      const wk = getWeekStart(d);
      if (!used[wk] && prev !== 'shield' && prev !== 'miss') {
        s = 'shield';
        used[wk] = d;
      } else {
        s = 'miss';
      }
    }

    if (s === 'won') {
      run++;
      if (run > best) best = run;
    } else if (s === 'miss') {
      run = 0;
    }

    st[d] = s;
    prev = s;
    d = addDays(d, 1);
  }

  const totalWon = Object.keys(state.won).length;

  return {
    st,
    used,
    streak: run,
    best,
    total: totalWon
  };
}

export function getWeekStatsSummary(state: IronState) {
  const todayStr = getEffectiveToday(state.dayEnd);
  const monday = getWeekStart(todayStr);
  let d = monday;
  let wonCount = 0;
  const doneCounts: Record<string, number> = {};
  const missCounts: Record<string, number> = {};

  while (d <= todayStr) {
    if (d < state.start) {
      d = addDays(d, 1);
      continue;
    }
    if (state.won[d]) wonCount++;
    if (!state.rest[d]) {
      const tasks = getTasksForDay(state, d);
      const doneIds = getDoneOnDay(state, d);
      if (tasks.length) {
        tasks.forEach((m) => {
          if (doneIds.includes(m.id)) {
            doneCounts[m.t] = (doneCounts[m.t] || 0) + 1;
          } else if (d < todayStr) {
            missCounts[m.t] = (missCounts[m.t] || 0) + 1;
          }
        });
      }
    }
    d = addDays(d, 1);
  }

  const getTopKey = (obj: Record<string, number>) => {
    let top: string | null = null;
    let max = 0;
    Object.keys(obj).forEach((k) => {
      if (obj[k] > max) {
        max = obj[k];
        top = k;
      }
    });
    return top;
  };

  return {
    wonCount,
    bestTask: getTopKey(doneCounts),
    skippedTask: getTopKey(missCounts)
  };
}
