import React, { useState } from 'react';
import { X, Calendar, BookOpen, Clock, MapPin, Search } from 'lucide-react';
import {
  DAYS,
  DayOfWeek,
  FULL_DAYS,
  PERIOD_TIMINGS,
  RAW_TIMETABLES,
  format12Hour,
} from '../data/timetableData';

interface SectionSchedule {
  name: string;
  yearTiming: number;
  homeVenue: string;
  days: Record<DayOfWeek, { periods: string; room: string; time: string }[]>;
}

// Parse raw timetable into sections
function parseSectionTimetables(): SectionSchedule[] {
  const sections: SectionSchedule[] = [];
  let curSection: SectionSchedule | null = null;

  const DK: Record<string, DayOfWeek> = {
    M: 'Mon',
    T: 'Tue',
    W: 'Wed',
    Th: 'Thu',
    F: 'Fri',
  };

  const lines = RAW_TIMETABLES.trim().split('\n');
  lines.forEach((raw) => {
    const l = raw.trim();
    if (!l) return;
    if (l.includes('|')) {
      const [name, timing, venue] = l.split('|');
      curSection = {
        name,
        yearTiming: +timing,
        homeVenue: venue,
        days: {
          Mon: [],
          Tue: [],
          Wed: [],
          Thu: [],
          Fri: [],
          Sat: [],
          Sun: [],
        },
      };
      sections.push(curSection);
      return;
    }

    if (!curSection) return;
    const [d, ...tokens] = l.split(' ');
    const day = DK[d];
    if (!day) return;

    tokens.forEach((k) => {
      const m = k.match(/^(\d)(?:-(\d))?(?:v|@(.+))$/);
      if (!m) return;
      const a = +m[1];
      const b = +(m[2] || m[1]);
      const targetRoom = m[3] ? m[3] : curSection!.homeVenue;
      const timingPeriods =
        curSection!.yearTiming === 0
          ? PERIOD_TIMINGS.standard2026
          : PERIOD_TIMINGS.firstYear2024;
      const s = timingPeriods[a - 1]?.s ?? 540;
      const e = timingPeriods[b - 1]?.e ?? 600;

      curSection!.days[day].push({
        periods: a === b ? `P${a}` : `P${a}–P${b}`,
        room: targetRoom,
        time: `${format12Hour(s)} – ${format12Hour(e)}`,
      });
    });
  });

  return sections;
}

const parsedSections = parseSectionTimetables();

interface MasterTimetableModalProps {
  onClose: () => void;
  onSelectRoom: (roomId: string) => void;
}

export const MasterTimetableModal: React.FC<MasterTimetableModalProps> = ({
  onClose,
  onSelectRoom,
}) => {
  const [selectedSectionName, setSelectedSectionName] = useState(
    parsedSections[0]?.name || ''
  );
  const [search, setSearch] = useState('');

  const currentSection =
    parsedSections.find((s) => s.name === selectedSectionName) || parsedSections[0];

  const filteredSections = parsedSections.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-[#fdfbfa] border border-[#b7cdc3] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#b7cdc3]/60 flex items-start justify-between gap-4 sticky top-0 bg-[#fdfbfa]/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#e8806a]" />
              <h2 className="text-2xl font-black text-[#00484e] tracking-tight">
                Class Section Timetables
              </h2>
            </div>
            <p className="text-xs text-[#5f7377] mt-0.5">
              Explore the 10 published branch timetables & venue allocations for the 2026–27 session.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#5f7377] hover:text-[#00484e] hover:bg-[#e6eeea] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Section selector sidebar */}
          <div className="md:col-span-4 flex flex-col gap-2">
            <div className="relative mb-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter class sections..."
                className="w-full pl-8 pr-3 py-2 bg-white border border-[#b7cdc3] rounded-xl text-xs font-semibold text-[#00484e] focus:outline-hidden focus:ring-2 focus:ring-[#e8806a]"
              />
              <Search className="w-3.5 h-3.5 text-[#5f7377] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredSections.map((s) => {
                const isSelected = s.name === currentSection.name;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSelectedSectionName(s.name)}
                    className={`text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#00484e] text-white border-[#00484e] shadow-xs'
                        : 'bg-white text-[#00484e] border-[#b7cdc3]/60 hover:bg-[#e6eeea]/50'
                    }`}
                  >
                    <div>
                      <div>{s.name}</div>
                      <span
                        className={`text-[10px] font-normal ${
                          isSelected ? 'text-white/70' : 'text-[#5f7377]'
                        }`}
                      >
                        Home: {s.homeVenue}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[#f0f5f2] text-[#00484e]'
                      }`}
                    >
                      {s.yearTiming === 0 ? 'Standard' : 'FY'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Schedule Details */}
          <div className="md:col-span-8 flex flex-col gap-4">
            <div className="bg-[#e6eeea]/60 border border-[#b7cdc3] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-[#00484e]">
                  {currentSection.name}
                </h3>
                <p className="text-xs text-[#5f7377]">
                  Home Hall: <strong>Room {currentSection.homeVenue}</strong> · Timing Grid:{' '}
                  {currentSection.yearTiming === 0 ? 'Standard 2026–27' : 'First Year 2024–25'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectRoom(currentSection.homeVenue);
                  onClose();
                }}
                className="text-xs font-bold text-white bg-[#00484e] hover:bg-[#00383d] px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
              >
                Inspect Home Room
              </button>
            </div>

            {/* Days Tabs / View */}
            <div className="space-y-3">
              {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as DayOfWeek[]).map((d) => {
                const sessions = currentSection.days[d] || [];
                return (
                  <div
                    key={d}
                    className="border border-[#b7cdc3]/70 rounded-2xl p-3.5 bg-white shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#00484e] mb-2 pb-1.5 border-b border-[#b7cdc3]/40">
                      <span>{FULL_DAYS[d]}</span>
                      <span className="text-[#5f7377] font-semibold text-[11px]">
                        {sessions.length === 0 ? 'No classes' : `${sessions.length} scheduled sessions`}
                      </span>
                    </div>

                    {sessions.length === 0 ? (
                      <p className="text-xs text-[#5f7377] italic py-1">
                        Free day / self-study slots.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sessions.map((sess, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-[#f0f5f2]/80 border border-[#b7cdc3]/50 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-extrabold text-[#00484e]">
                                {sess.periods}
                              </span>
                              <span className="block text-[11px] text-[#5f7377]">
                                {sess.time}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2 py-0.5 bg-white border border-[#b7cdc3]/60 rounded-md font-bold text-[#00484e] text-[11px]">
                                Room {sess.room}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#b7cdc3]/60 bg-[#fdfbfa] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#00484e] hover:bg-[#00383d] text-white text-xs font-bold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
