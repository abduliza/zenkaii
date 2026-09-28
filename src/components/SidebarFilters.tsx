import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Clock,
  CalendarDays,
  Building,
  RotateCcw,
  Sparkles,
  Check,
  Wind,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  DAYS,
  DayOfWeek,
  FULL_DAYS,
  getFloorName,
  format12Hour,
  formatMinutesToHM,
  parseNaturalQuery,
  ParsedQuery,
} from '../data/timetableData';

interface SidebarFiltersProps {
  currentDay: DayOfWeek;
  currentTimeMinutes: number;
  selectedFloor: number | null; // null for all
  minDurationMinutes: number;
  onlyFree: boolean;
  onlyAC: boolean;
  searchQuery: string;
  totalRooms: number;
  freeRoomsCount: number;
  isSimulated: boolean;
  onSelectFloor: (floor: number | null) => void;
  onSelectDay: (day: DayOfWeek) => void;
  onChangeTimeMinutes: (minutes: number) => void;
  onChangeMinDuration: (minutes: number) => void;
  onToggleOnlyFree: (onlyFree: boolean) => void;
  onToggleOnlyAC: (onlyAC: boolean) => void;
  onSearchChange: (q: string) => void;
  onResetToLive: () => void;
  onApplyParsedQuery: (parsed: ParsedQuery) => void;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  currentDay,
  currentTimeMinutes,
  selectedFloor,
  minDurationMinutes,
  onlyFree,
  onlyAC,
  searchQuery,
  totalRooms,
  freeRoomsCount,
  isSimulated,
  onSelectFloor,
  onSelectDay,
  onChangeTimeMinutes,
  onChangeMinDuration,
  onToggleOnlyFree,
  onToggleOnlyAC,
  onSearchChange,
  onResetToLive,
  onApplyParsedQuery,
}) => {
  const [naturalQueryInput, setNaturalQueryInput] = useState('');
  const [activeParsedTags, setActiveParsedTags] = useState<string[]>([]);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const floorsList = [
    { id: null, label: 'All Floors' },
    { id: 1, label: '1F' },
    { id: 2, label: '2F' },
    { id: 3, label: '3F' },
    { id: 4, label: '4F' },
    { id: 5, label: '5F' },
    { id: 6, label: '6F' },
    { id: 7, label: '7F' },
    { id: 8, label: 'TB' },
  ];

  const quickDurationPresets = [0, 30, 60, 90, 120];

  const quickPeriodJumps = [
    { label: 'P1 (9:00)', mins: 540 },
    { label: 'P3 (10:50)', mins: 650 },
    { label: 'Lunch (12:30)', mins: 750 },
    { label: 'P6 (13:20)', mins: 800 },
    { label: 'P8 (15:10)', mins: 910 },
  ];

  const handleNaturalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!naturalQueryInput.trim()) return;

    const parsed = parseNaturalQuery(naturalQueryInput);
    setActiveParsedTags(parsed.tagsSummary);
    onApplyParsedQuery(parsed);
  };

  const handleSuggestionClick = (query: string) => {
    setNaturalQueryInput(query);
    const parsed = parseNaturalQuery(query);
    setActiveParsedTags(parsed.tagsSummary);
    onApplyParsedQuery(parsed);
  };

  const timeStringValue = formatMinutesToHM(currentTimeMinutes);

  return (
    <div className="bg-[#fdfbfa] border border-[#b7cdc3]/70 rounded-2xl p-5 shadow-xs flex flex-col gap-6">
      {/* Search Header & Natural Language Query */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#e8806a]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5f7377]">
              Smart Room Search
            </h3>
          </div>
          {isSimulated && (
            <button
              onClick={onResetToLive}
              className="text-xs font-semibold text-[#00484e] hover:text-[#e8806a] transition-colors inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Live time
            </button>
          )}
        </div>

        <form onSubmit={handleNaturalSubmit} className="relative">
          <input
            type="text"
            value={naturalQueryInput}
            onChange={(e) => {
              setNaturalQueryInput(e.target.value);
              onSearchChange(e.target.value);
            }}
            placeholder="e.g. Free room on 4th floor for 90 mins at 3pm"
            className="w-full pl-9 pr-20 py-2.5 bg-white border border-[#b7cdc3] rounded-xl text-sm text-[#00484e] placeholder:text-[#5f7377]/70 focus:outline-hidden focus:ring-2 focus:ring-[#e8806a] focus:border-transparent transition-all shadow-2xs"
          />
          <Search className="w-4 h-4 text-[#5f7377] absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#00484e] hover:bg-[#00383d] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Find
          </button>
        </form>

        {/* Suggestion prompt chips */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleSuggestionClick('Free on 4th floor for 60 min')}
            className="text-[11px] bg-[#e6eeea]/70 hover:bg-[#e6eeea] text-[#00484e] px-2.5 py-1 rounded-full border border-[#b7cdc3]/60 transition-colors"
          >
            4th floor · 1 hour
          </button>
          <button
            type="button"
            onClick={() => handleSuggestionClick('TB block seminar at 2pm')}
            className="text-[11px] bg-[#e6eeea]/70 hover:bg-[#e6eeea] text-[#00484e] px-2.5 py-1 rounded-full border border-[#b7cdc3]/60 transition-colors"
          >
            TB block at 2pm
          </button>
          <button
            type="button"
            onClick={() => handleSuggestionClick('AC room for 90 minutes')}
            className="text-[11px] bg-[#e6eeea]/70 hover:bg-[#e6eeea] text-[#00484e] px-2.5 py-1 rounded-full border border-[#b7cdc3]/60 transition-colors"
          >
            AC room · 90 min
          </button>
        </div>

        {/* Active Parsed Tags */}
        {activeParsedTags.length > 0 && (
          <div className="mt-2.5 p-2 bg-[#e6eeea]/50 rounded-xl border border-[#b7cdc3]/40 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-[#5f7377]">Applied:</span>
            {activeParsedTags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-medium bg-white text-[#00484e] px-2 py-0.5 rounded-md border border-[#b7cdc3]/60 shadow-2xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <hr className="border-[#b7cdc3]/40" />

      {/* Summary KPI Banner */}
      <div className="bg-gradient-to-br from-[#00484e] to-[#003438] text-white rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Availability Right Now
          </div>
          <div className="text-2xl font-extrabold mt-1 text-white tracking-tight">
            {freeRoomsCount}{' '}
            <span className="text-sm font-normal text-white/70">
              of {totalRooms} rooms free
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 border border-white/20">
            {Math.round((freeRoomsCount / (totalRooms || 1)) * 100)}% Free
          </span>
        </div>
      </div>

      {/* Floors Filter Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5f7377]">
            <Building className="w-3.5 h-3.5" />
            <span>Select Floor</span>
          </div>
          {selectedFloor !== null && (
            <button
              onClick={() => onSelectFloor(null)}
              className="text-xs text-[#00484e] font-semibold hover:underline"
            >
              Reset to All
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {floorsList.map((f) => {
            const isSelected = selectedFloor === f.id;
            return (
              <button
                key={String(f.id)}
                type="button"
                onClick={() => onSelectFloor(f.id)}
                className={`py-2 px-2 text-xs font-bold rounded-xl transition-all border text-center ${
                  isSelected
                    ? 'bg-[#e8806a] border-[#e8806a] text-white shadow-xs scale-[1.02]'
                    : 'bg-white border-[#b7cdc3] text-[#00484e] hover:bg-[#e6eeea]/50'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-[#b7cdc3]/40" />

      {/* Day Selector */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5f7377] mb-2">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Day of Week</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((d) => {
            const isSelected = currentDay === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => onSelectDay(d)}
                className={`py-2 text-[11px] font-bold rounded-lg transition-all border text-center ${
                  isSelected
                    ? 'bg-[#00484e] border-[#00484e] text-white shadow-2xs'
                    : 'bg-white border-[#b7cdc3]/70 text-[#00484e] hover:bg-[#e6eeea]/50'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time of Day */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5f7377]">
            <Clock className="w-3.5 h-3.5" />
            <span>Target Time</span>
          </div>
          <span className="text-xs font-bold text-[#00484e]">
            {format12Hour(currentTimeMinutes)}
          </span>
        </div>
        <input
          type="time"
          value={timeStringValue}
          onChange={(e) => {
            if (!e.target.value) return;
            const [h, m] = e.target.value.split(':').map(Number);
            onChangeTimeMinutes(h * 60 + m);
          }}
          className="w-full py-2 px-3 bg-white border border-[#b7cdc3] rounded-xl text-sm font-semibold text-[#00484e] focus:outline-hidden focus:ring-2 focus:ring-[#e8806a] focus:border-transparent shadow-2xs"
        />

        {/* Quick period jump chips */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {quickPeriodJumps.map((jump) => (
            <button
              key={jump.label}
              type="button"
              onClick={() => onChangeTimeMinutes(jump.mins)}
              className="text-[11px] bg-white hover:bg-[#e6eeea] text-[#00484e] font-medium px-2 py-0.5 rounded-md border border-[#b7cdc3]/60 transition-colors shadow-2xs"
            >
              {jump.label}
            </button>
          ))}
        </div>
      </div>

      {/* Free for at least (duration) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5f7377]">
            Minimum Free Window
          </span>
          <span className="text-xs font-bold text-[#00484e]">
            {minDurationMinutes === 0 ? 'Any duration' : `${minDurationMinutes} minutes`}
          </span>
        </div>
        <div className="flex gap-1.5">
          {quickDurationPresets.map((dur) => {
            const isSelected = minDurationMinutes === dur;
            return (
              <button
                key={dur}
                type="button"
                onClick={() => onChangeMinDuration(dur)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'bg-[#00484e] border-[#00484e] text-white'
                    : 'bg-white border-[#b7cdc3] text-[#00484e] hover:bg-[#e6eeea]/50'
                }`}
              >
                {dur === 0 ? 'Now' : `${dur}m`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-2 pt-1">
        <label className="flex items-center justify-between p-2.5 bg-white border border-[#b7cdc3]/70 rounded-xl cursor-pointer hover:bg-[#e6eeea]/30 transition-colors">
          <span className="text-xs font-bold text-[#00484e] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Show only unoccupied rooms
          </span>
          <input
            type="checkbox"
            checked={onlyFree}
            onChange={(e) => onToggleOnlyFree(e.target.checked)}
            className="w-4 h-4 rounded text-[#00484e] focus:ring-[#e8806a] border-[#b7cdc3]"
          />
        </label>

        <label className="flex items-center justify-between p-2.5 bg-white border border-[#b7cdc3]/70 rounded-xl cursor-pointer hover:bg-[#e6eeea]/30 transition-colors">
          <span className="text-xs font-bold text-[#00484e] flex items-center gap-2">
            <Wind className="w-3.5 h-3.5 text-sky-600" />
            Air Conditioned rooms only
          </span>
          <input
            type="checkbox"
            checked={onlyAC}
            onChange={(e) => onToggleOnlyAC(e.target.checked)}
            className="w-4 h-4 rounded text-[#00484e] focus:ring-[#e8806a] border-[#b7cdc3]"
          />
        </label>
      </div>

      <div className="mt-auto pt-3 border-t border-[#b7cdc3]/40 text-xs text-[#5f7377] leading-relaxed">
        <p>
          💡 <strong>Pro Tip:</strong> Data is synchronized with all 10 departmental timetables.
          A free room is not an official reservation; please yield politely if a lab session or scheduled faculty activity requires the hall.
        </p>
      </div>
    </div>
  );
};
