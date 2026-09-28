/**
 * RoomPulse Campus Timetable Data & Scheduling Engine
 * Based on 10 class section timetables and 2026-27 / 2024-25 academic period structures.
 */

export interface ScheduleEntry {
  s: number; // Start minute of day (e.g. 540 = 09:00)
  e: number; // End minute of day (e.g. 590 = 09:50)
  sec: string; // Section name (e.g. "IV ECE-A")
  p: string; // Period label (e.g. "Periods 1–4")
  periodStart: number;
  periodEnd: number;
}

export interface RoomStatus {
  roomId: string;
  floor: number;
  free: boolean;
  until: number | null; // minute of day when status changes
  kind: 'free' | 'busy';
  text: string;
  isStartingSoon?: boolean; // starts in less than 30 min
  currentClass?: ScheduleEntry;
  nextClass?: ScheduleEntry;
}

export interface RoomInfo {
  id: string;
  floor: number;
  building: 'IST' | 'TB';
  displayLabel: string;
  tag: string;
  capacity?: number;
  hasAC?: boolean;
}

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export type DayOfWeek = (typeof DAYS)[number];

export const FULL_DAYS: Record<DayOfWeek, string> = {
  Sun: 'Sunday',
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
};

const DK: Record<string, DayOfWeek> = {
  M: 'Mon',
  T: 'Tue',
  W: 'Wed',
  Th: 'Thu',
  F: 'Fri',
};

export const PERIOD_TIMINGS = {
  standard2026: [
    { period: 1, s: 540, e: 590, label: '09:00 - 09:50' },
    { period: 2, s: 590, e: 640, label: '09:50 - 10:40' },
    { period: 3, s: 650, e: 700, label: '10:50 - 11:40' },
    { period: 4, s: 700, e: 750, label: '11:40 - 12:30' },
    { period: 5, s: 750, e: 800, label: '12:30 - 01:20 (Lunch)' },
    { period: 6, s: 800, e: 850, label: '01:20 - 02:10' },
    { period: 7, s: 850, e: 900, label: '02:10 - 03:00' },
    { period: 8, s: 910, e: 960, label: '03:10 - 04:00' },
    { period: 9, s: 960, e: 1010, label: '04:00 - 04:50' },
  ],
  firstYear2024: [
    { period: 1, s: 540, e: 590, label: '09:00 - 09:50' },
    { period: 2, s: 595, e: 645, label: '09:55 - 10:45' },
    { period: 3, s: 650, e: 700, label: '10:50 - 11:40' },
    { period: 4, s: 705, e: 755, label: '11:45 - 12:35' },
    { period: 5, s: 755, e: 810, label: '12:35 - 01:30' },
    { period: 6, s: 810, e: 860, label: '01:30 - 02:20' },
    { period: 7, s: 865, e: 915, label: '02:25 - 03:15' },
    { period: 8, s: 920, e: 970, label: '03:20 - 04:10' },
    { period: 9, s: 975, e: 1025, label: '04:15 - 05:05' },
  ],
};

const TTS: [number, number][][] = [
  PERIOD_TIMINGS.standard2026.map((p) => [p.s, p.e]),
  PERIOD_TIMINGS.firstYear2024.map((p) => [p.s, p.e]),
];

export const RAW_TIMETABLES = `
IV ECE-A|0|225
M 1v 3-4v
T 1-4v
W 1v 2@108 3-4v
Th 1-4v
F 1-4v
III ECE-DS|0|519
M 1-4v
T 1-4v 6-7@108/107
W 1-4v 8-9@625
Th 1-4v
F 1-4v 6@625 8-9@108/107
III ECE-B|0|518
M 1-2@108/309 6-9v
T 1-2@625 6-9v
W 1@625 6-9v
Th 1-2@108/309 6-9v
F 6-9v
III ECE-A|0|518
M 1-4v 6-7@625
T 1-4v 7@625
W 1-4v 8-9@108/309
Th 1-4v
F 1-4v 6-7@108/309
III BME|0|211
M 1-2@625 3-4@107 6-9v
T 1-2@108 3@625 6-9v
W 6-9v
Th 4@108 6-9v
F 1@108 6-9v
II ECE-DS B|0|411
M 3-4@309/107 6-9v
T 1-2@309/107 6-9v
W 1@401 6-9v
Th 1-2@401 3-4@TB106 6-9v
F 1@TB106 6-9v
II ECE-DS A|0|416
M 1-4v 6-7@602 8-9@309/107
T 1-4v 6@602 8-9@TB106
W 1-4v 7@TB106
Th 1-4v 6-7@309/107
F 1-4v
II BME|0|602
M 1-4v 6-7@107/309
T 1-4v 6-7@TB106
W 1-3v 6@TB106 7@602
Th 1-4v 8-9@107/309
F 1-4v 8-9@602
I ECE-A|1|602
M 1-4@602 8-9@710
T 1-4@602
W 1-3@602 6-7@618 8-9@108
Th 1-4@602 6-7@510 8-9@201
F 1-4@602 6@602 7-9@626
I ECE-B & EEE|1|602
M 1@609 2@710/520 6-9@602
T 6-9@602
W 1@710/520 2@617 3-4@510 5@618 7-9@602
Th 1-2@201 3@626 4@710 6-9@602
F 1-2@617 4-6@626 8-9@602
I ECE-DS|1|502
M 1@710 3-4@617 6-9@502
T 3-4@201 6-9@502
W 1-2@510 3@710 5-6@617 7-9@502
Th 1@710 2@510 3@710 4-9@502
F 1-3@626
I Biotech-B|1|702
M 1@520 4@710/520 6-9@702
T 1-2@710 3@520 4@710 7-9@702
W 6-9@702
Th 3@710 4@510/520 6-9@702
F 1-6@702
`;

// Parse schedule into rooms and entries
export const schedule: Record<string, Partial<Record<DayOfWeek, ScheduleEntry[]>>> = {};

function addEntry(
  r: string,
  d: DayOfWeek,
  s: number,
  e: number,
  sec: string,
  p: string,
  periodStart: number,
  periodEnd: number
) {
  if (!schedule[r]) schedule[r] = {};
  if (!schedule[r][d]) schedule[r][d] = [];
  schedule[r][d]!.push({ s, e, sec, p, periodStart, periodEnd });
}

let curHeader: { n: string; t: number; v: string } | null = null;
RAW_TIMETABLES.trim()
  .split('\n')
  .forEach((rawLine) => {
    const l = rawLine.trim();
    if (!l) return;
    if (l.includes('|')) {
      const [n, t, v] = l.split('|');
      curHeader = { n, t: +t, v };
      return;
    }
    if (!curHeader) return;
    const [d, ...tokens] = l.split(' ');
    const day = DK[d];
    if (!day) return;

    tokens.forEach((k) => {
      const m = k.match(/^(\d)(?:-(\d))?(?:v|@(.+))$/);
      if (!m) return;
      const a = +m[1];
      const b = +(m[2] || m[1]);
      const T = TTS[curHeader!.t];
      if (!T || !T[a - 1] || !T[b - 1]) return;

      const s = T[a - 1][0];
      const e = T[b - 1][1];
      const targetRooms = m[3] ? m[3].split('/') : [curHeader!.v];
      const periodLabel = a === b ? `Period ${a}` : `Periods ${a}–${b}`;

      targetRooms.forEach((r) => {
        addEntry(r, day, s, e, curHeader!.n, periodLabel, a, b);
      });
    });
  });

// Sort each room's daily schedule chronologically
Object.values(schedule).forEach((dayMap) => {
  Object.values(dayMap).forEach((entries) => {
    entries.sort((x, y) => x.s - y.s);
  });
});

export const ROOM_METADATA: Record<string, RoomInfo> = {};
Object.keys(schedule).forEach((r) => {
  const isTB = /^TB/.test(r);
  const floor = isTB ? 8 : /^\d/.test(r) ? +r[0] : 1;
  const label = isTB ? `TB ${r.slice(2)}` : `IST ${r}`;
  let tag = 'Smart Classroom';
  if (['107', '108', '309', '617', '618', '625', '626'].includes(r)) {
    tag = 'Specialized Lab';
  } else if (['201', '211', '401', '502', '510', '520', '602', '702'].includes(r)) {
    tag = 'Lecture Hall';
  } else if (isTB) {
    tag = 'Seminar & Discussion Room';
  }

  ROOM_METADATA[r] = {
    id: r,
    floor,
    building: isTB ? 'TB' : 'IST',
    displayLabel: label,
    tag,
    capacity: isTB ? 45 : ['201', '602', '702'].includes(r) ? 75 : 60,
    hasAC: ['108', '201', '309', '401', '518', '519', '602', 'TB106'].includes(r),
  };
});

export const ALL_ROOM_IDS = Object.keys(ROOM_METADATA).sort();

export function getFloorName(floor: number): string {
  if (floor === 8) return 'Tutorial Block (TB)';
  if (floor === 0) return 'Ground Floor';
  const suffix = floor === 1 ? 'st' : floor === 2 ? 'nd' : floor === 3 ? 'rd' : 'th';
  return `${floor}${suffix} Floor`;
}

export function formatMinutesToHM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function format12Hour(minutes: number): string {
  let h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function formatCountdown(secondsTotal: number): string {
  const s = Math.max(0, Math.floor(secondsTotal));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${String(m).padStart(2, '0')}m`);
  parts.push(`${String(sec).padStart(2, '0')}s`);
  return parts.join(' ');
}

export function calculateRoomStatus(
  roomId: string,
  day: DayOfWeek,
  tMinutes: number,
  requiredFreeDurationMin: number = 0
): RoomStatus {
  const daySchedule = (schedule[roomId] || {})[day] || [];
  const currentClass = daySchedule.find((x) => x.s <= tMinutes && tMinutes < x.e);
  const nextClass = daySchedule.find((x) => x.s > tMinutes);
  const floor = ROOM_METADATA[roomId]?.floor ?? 1;

  if (currentClass) {
    return {
      roomId,
      floor,
      free: false,
      until: currentClass.e,
      kind: 'busy',
      text: `In use · ${currentClass.sec} (${currentClass.p}) until ${format12Hour(currentClass.e)}`,
      currentClass,
      nextClass,
    };
  }

  // Not currently occupied. Check if upcoming class breaks the required free duration
  const requiredFreeThreshold = tMinutes + Math.max(requiredFreeDurationMin, 1);
  if (nextClass && nextClass.s < requiredFreeThreshold) {
    const isStartingSoon = nextClass.s - tMinutes <= 30;
    return {
      roomId,
      floor,
      free: false,
      until: nextClass.s,
      kind: 'free',
      isStartingSoon,
      text: `Free now, but ${nextClass.sec} (${nextClass.p}) starts at ${format12Hour(nextClass.s)}`,
      nextClass,
    };
  }

  const isStartingSoon = Boolean(nextClass && nextClass.s - tMinutes <= 30);
  return {
    roomId,
    floor,
    free: true,
    until: nextClass ? nextClass.s : null,
    kind: 'free',
    isStartingSoon,
    text: nextClass
      ? `Free until ${format12Hour(nextClass.s)} (Next: ${nextClass.sec})`
      : 'No more classes scheduled today',
    nextClass,
  };
}

export function getCurrentPeriodInfo(tMinutes: number): {
  label: string;
  isClassTime: boolean;
  periodIndex: number | null;
} {
  const periods = PERIOD_TIMINGS.standard2026;
  const idx = periods.findIndex((p) => p.s <= tMinutes && tMinutes < p.e);
  if (idx >= 0) {
    if (idx === 4) return { label: 'Period 5 (Lunch Break)', isClassTime: false, periodIndex: 5 };
    return { label: `Period ${idx + 1}`, isClassTime: true, periodIndex: idx + 1 };
  }
  if (tMinutes < periods[0].s) return { label: 'Before Classes (Campus Open)', isClassTime: false, periodIndex: null };
  if (tMinutes >= periods[periods.length - 1].e) return { label: 'Classes Concluded', isClassTime: false, periodIndex: null };
  return { label: 'Passing Break / Transition', isClassTime: false, periodIndex: null };
}

export interface ParsedQuery {
  floor?: number;
  duration?: number;
  time?: string;
  day?: DayOfWeek;
  ac?: boolean;
  building?: 'IST' | 'TB';
  roomNumber?: string;
  tagsSummary: string[];
}

export function parseNaturalQuery(raw: string): ParsedQuery {
  const s = raw.toLowerCase().trim();
  const res: ParsedQuery = { tagsSummary: [] };

  // Specific room lookup
  const roomMatch = s.match(/(?:room|lab|hall)?\s*(tb\s*106|\b\d{3}\b)/i);
  if (roomMatch) {
    const rm = roomMatch[1].replace(/\s+/g, '').toUpperCase();
    if (ALL_ROOM_IDS.includes(rm)) {
      res.roomNumber = rm;
      res.tagsSummary.push(`Room ${rm}`);
    }
  }

  // Floor extraction
  if (/\bground\b|\b0th\b/.test(s)) {
    res.floor = 0;
    res.tagsSummary.push('Ground Floor');
  } else {
    const fMatch =
      s.match(/(\d)(?:st|nd|rd|th)?\s*floor/) ||
      s.match(/\b(first|second|third|fourth|fifth|sixth|seventh)\s*floor/);
    if (fMatch) {
      const wordMap: Record<string, number> = {
        first: 1,
        second: 2,
        third: 3,
        fourth: 4,
        fifth: 5,
        sixth: 6,
        seventh: 7,
      };
      const fl = isNaN(+fMatch[1]) ? wordMap[fMatch[1]] : +fMatch[1];
      if (fl !== undefined) {
        res.floor = fl;
        res.tagsSummary.push(getFloorName(fl));
      }
    }
  }

  // Tutorial block
  if (/\btb\b|tutorial\s*block/.test(s)) {
    res.floor = 8;
    res.building = 'TB';
    res.tagsSummary.push('TB Block');
  }

  // AC filter
  if (/non[\s-]?ac|without ac|no ac/.test(s)) {
    res.ac = false;
    res.tagsSummary.push('Standard Ventilated');
  } else if (/\bac\b|air[\s-]?condition/.test(s)) {
    res.ac = true;
    res.tagsSummary.push('AC Equipped');
  }

  // Duration
  const hourMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/);
  const minMatch = s.match(/(\d+)\s*(?:minutes?|mins?)\b/);
  if (hourMatch) {
    res.duration = Math.round(+hourMatch[1] * 60);
    res.tagsSummary.push(`≥ ${res.duration} min`);
  } else if (minMatch) {
    res.duration = +minMatch[1];
    res.tagsSummary.push(`≥ ${res.duration} min`);
  } else if (/an hour/.test(s)) {
    res.duration = 60;
    res.tagsSummary.push('≥ 60 min');
  }

  // Time
  const atMatch = s.match(/\bat\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (atMatch) {
    let hr = +atMatch[1];
    const ampm = atMatch[3]?.toLowerCase();
    if (ampm === 'pm' && hr < 12) hr += 12;
    if (ampm === 'am' && hr === 12) hr = 0;
    // Default afternoon context if student says "at 3"
    if (!ampm && hr <= 5) hr += 12;
    const mins = +atMatch[2] || 0;
    res.time = formatMinutesToHM(hr * 60 + mins);
    res.tagsSummary.push(`At ${format12Hour(hr * 60 + mins)}`);
  }

  // Day
  const foundDay = DAYS.find((d) => new RegExp(`\\b${d.toLowerCase()}`).test(s));
  if (foundDay) {
    res.day = foundDay;
    res.tagsSummary.push(FULL_DAYS[foundDay]);
  }

  return res;
}
