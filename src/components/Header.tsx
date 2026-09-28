import React from 'react';
import {
  Clock,
  RotateCcw,
  LayoutGrid,
  Box,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { DayOfWeek, FULL_DAYS } from '../data/timetableData';

interface HeaderProps {
  currentDay: DayOfWeek;
  currentTimeMinutes: number;
  periodLabel: string;
  isSimulated: boolean;
  activeView: 'list' | 'map' | 'timetables';
  onViewChange: (view: 'list' | 'map' | 'timetables') => void;
  onResetToLive: () => void;
  onOpenTimetables: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDay,
  currentTimeMinutes,
  periodLabel,
  isSimulated,
  activeView,
  onViewChange,
  onResetToLive,
}) => {
  const hours = Math.floor(currentTimeMinutes / 60);
  const minutes = Math.floor(currentTimeMinutes % 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const timeFormatted = `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;

  return (
    <header className="bg-[#fdfbfa] border-b border-[#b7cdc3]/60 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand & Live status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#00484e] text-white flex items-center justify-center font-extrabold text-2xl shadow-md ring-2 ring-[#00484e]/20">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-[#00484e] leading-tight">
                    RoomPulse
                  </h1>
                  <span className="text-[10px] tracking-wider font-bold uppercase bg-[#00484e]/10 text-[#00484e] px-2 py-0.5 rounded-full">
                    Campus Finder
                  </span>
                </div>
                <p className="text-xs text-[#5f7377] font-medium">
                  IST & TB Blocks · 2026–27 Academic Schedule
                </p>
              </div>
            </div>

            {/* Live Clock Pill */}
            <div className="hidden sm:flex items-center gap-3 bg-[#e6eeea]/80 border border-[#b7cdc3]/50 rounded-xl px-3.5 py-1.5 ml-2">
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isSimulated ? 'bg-amber-500 animate-pulse' : 'bg-[#e8806a] animate-pulse'}`} />
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#5f7377]">
                  {isSimulated ? 'Simulated' : 'Live'}
                </span>
              </div>
              <div className="h-4 w-px bg-[#b7cdc3]" />
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-base text-[#00484e] tabular-nums">
                  {timeFormatted}
                </span>
                <span className="text-[10px] font-semibold text-[#5f7377]">IST</span>
              </div>
              <div className="h-4 w-px bg-[#b7cdc3]" />
              <span className="text-xs font-semibold text-[#00484e] bg-white px-2 py-0.5 rounded-md border border-[#b7cdc3]/60 shadow-2xs">
                {periodLabel}
              </span>
              <span className="text-xs text-[#5f7377] font-medium hidden lg:inline">
                {FULL_DAYS[currentDay]}
              </span>
            </div>
          </div>

          {/* Action controls & View switch */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
            {isSimulated && (
              <button
                onClick={onResetToLive}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                title="Reset simulation to current device live time"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-700 animate-spin-reverse" />
                <span>Return to Live</span>
              </button>
            )}

            {/* View Mode Segmented Control */}
            <div className="flex items-center p-1 bg-[#f1f6f2] border border-[#b7cdc3] rounded-xl shadow-inner">
              <button
                type="button"
                onClick={() => onViewChange('list')}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  activeView === 'list'
                    ? 'bg-[#00484e] text-white shadow-xs'
                    : 'text-[#00484e] hover:text-[#00484e] hover:bg-white/60'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Room Cards</span>
              </button>

              <button
                type="button"
                onClick={() => onViewChange('map')}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  activeView === 'map'
                    ? 'bg-[#00484e] text-white shadow-xs'
                    : 'text-[#00484e] hover:text-[#00484e] hover:bg-white/60'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Campus Map</span>
              </button>

              <button
                type="button"
                onClick={() => onViewChange('timetables')}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  activeView === 'timetables'
                    ? 'bg-[#00484e] text-white shadow-xs'
                    : 'text-[#00484e] hover:text-[#00484e] hover:bg-white/60'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Timetables</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile live status strip */}
        <div className="flex sm:hidden items-center justify-between mt-2.5 pt-2 border-t border-[#b7cdc3]/40 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSimulated ? 'bg-amber-500' : 'bg-[#e8806a]'}`} />
            <span className="font-bold text-[#00484e]">{timeFormatted}</span>
            <span className="text-[#5f7377]">({FULL_DAYS[currentDay]})</span>
          </div>
          <span className="font-semibold text-[#00484e] bg-[#e6eeea] px-2 py-0.5 rounded text-[11px]">
            {periodLabel}
          </span>
        </div>
      </div>
    </header>
  );
};
