export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface ExercisePlan {
  name: string;
  sets: string; // "4 × 8" or "3 × AMRAP"
  targets: string;
}

export interface GymSession {
  id: string;
  dateISO: string; // YYYY-MM-DD
  startISO: string; // full ISO
  endISO: string;
  minutes: number;
  calories: number;
  timeOfDay: TimeOfDay;
  exercises: { name: string; note?: string }[]; // completed exercise names
  note?: string;
}

export interface SleepLog {
  id: string;
  dateISO: string; // day woken up
  hours: number;
  quality: 1 | 2 | 3 | 4 | 5;
  note?: string;
}

export interface MeditationLog {
  id: string;
  dateISO: string;
  minutes: number;
  kind: string; // breath / guided / mindfulness / other
}

export interface ReadingLog {
  id: string;
  dateISO: string;
  minutes: number;
  book: string;
  category: string; // fiction / non-fiction / self-development / biography / other
}

export interface ChessLog {
  id: string;
  dateISO: string;
  minutes: number;
  kind: string; // games / puzzles / study
  games?: number;
}

export interface ReleaseLog {
  id: string;
  dateISO: string; // date (with time) of release
}

export interface Settings {
  weightKg: number;
  notifications: boolean;
  notifAsked: boolean;
  reminders: {
    gym: string; // "HH:MM"
    meditate: string;
    read: string;
    chess: string;
    sleep: string;
  };
}

export interface State {
  settings: Settings;
  gymSessions: GymSession[];
  sleepLogs: SleepLog[];
  meditationLogs: MeditationLog[];
  readingLogs: ReadingLog[];
  chessLogs: ChessLog[];
  releases: ReleaseLog[];
  dismissedAlerts: Record<string, string>; // key -> dateISO dismissed
  seenCongrats: string[]; // congrats keys already celebrated
}
