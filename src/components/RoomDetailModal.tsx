import React, { useEffect, useState } from 'react';
import {
  X,
  Clock,
  Share2,
  Copy,
  Check,
  Wind,
  Users,
  Calendar,
  Sparkles,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import {
  RoomStatus,
  ROOM_METADATA,
  getFloorName,
  format12Hour,
  formatCountdown,
  DayOfWeek,
  FULL_DAYS,
  PERIOD_TIMINGS,
  schedule,
  ScheduleEntry,
} from '../data/timetableData';

interface RoomDetailModalProps {
  roomId: string | null;
  status: RoomStatus | null;
  currentDay: DayOfWeek;
  currentTimeMinutes: number;
  currentSecondCounter: number;
  onClose: () => void;
  onShareWhatsApp: (roomId: string) => void;
  onCopySquadMessage: (text: string) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  roomId,
  status,
  currentDay,
  currentTimeMinutes,
  currentSecondCounter,
  onClose,
  onShareWhatsApp,
  onCopySquadMessage,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!roomId || !status) return null;

  const meta = ROOM_METADATA[roomId];
  const floorName = getFloorName(status.floor);
  const daySchedule = (schedule[roomId] || {})[currentDay] || [];
  const periods = PERIOD_TIMINGS.standard2026;

  // Calculate live countdown in seconds
  let countdownSeconds: number | null = null;
  if (status.until !== null) {
    const targetSeconds = status.until * 60;
    countdownSeconds = Math.max(0, targetSeconds - currentSecondCounter);
  }

  const squadMessageText = `📍 Heading to ${meta?.displayLabel || roomId}. It's free ${
    status.until !== null ? `until ${format12Hour(status.until)}` : 'for the rest of the day'
  }. Come fast!`;

  const handleCopy = () => {
    onCopySquadMessage(squadMessageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-[#fdfbfa] border border-[#b7cdc3] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#b7cdc3]/60 flex items-start justify-between gap-4 sticky top-0 bg-[#fdfbfa]/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5f7377]">
                Room Overview
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  status.free
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {status.free ? 'FREE RIGHT NOW' : 'IN USE'}
              </span>
            </div>

            <h2 className="text-3xl font-extrabold text-[#00484e] tracking-tight mt-1 flex items-center gap-3">
              {meta?.displayLabel || roomId}
              {meta?.hasAC && (
                <span
                  title="Air Conditioned"
                  className="p-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-xs inline-flex items-center gap-1 font-semibold"
                >
                  <Wind className="w-3.5 h-3.5" />
                  AC
                </span>
              )}
            </h2>

            <p className="text-xs font-semibold text-[#5f7377] mt-1">
              {floorName} · {meta?.building === 'TB' ? 'Tutorial Block' : 'IST Academic Tower'} ·{' '}
              {meta?.tag} · ~{meta?.capacity || 60} Seats
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#5f7377] hover:text-[#00484e] hover:bg-[#e6eeea] rounded-full transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Big Countdown Hero Card */}
          <div className="bg-gradient-to-br from-[#00484e] via-[#003e43] to-[#002f33] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#a9cfcf]">
                {status.free ? 'REMAINING FREE TIME' : 'TIME REMAINING IN CURRENT CLASS'}
              </span>
              <span className="text-xs font-semibold bg-white/10 px-2.5 py-1 rounded-md">
                {FULL_DAYS[currentDay]} Schedule
              </span>
            </div>

            <div className="my-3 text-4xl sm:text-5xl font-black tracking-tight tabular-nums font-mono">
              {countdownSeconds !== null ? formatCountdown(countdownSeconds) : 'ALL DAY OPEN'}
            </div>

            <p className="text-xs text-white/80 font-medium">
              {status.until !== null
                ? status.free
                  ? `Next class starts at ${format12Hour(status.until)} (${status.nextClass?.sec || 'Scheduled Class'})`
                  : `Class concludes at ${format12Hour(status.until)}`
                : 'No more classes scheduled in this room for today.'}
            </p>
          </div>

          {/* Squad Share Fast Action */}
          <div className="bg-[#e6eeea]/70 border border-[#b7cdc3] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e8806a] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#00484e]">Need a study spot with friends?</h4>
                <p className="text-xs text-[#5f7377]">
                  Send this room invite directly to your WhatsApp group or study squad.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onShareWhatsApp(roomId)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-[#e8806a] hover:bg-[#d4644c] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-white border border-[#b7cdc3] text-[#00484e] font-bold text-xs px-3.5 py-2.5 rounded-xl hover:bg-[#f1f6f2] transition-all shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Daily Schedule Period Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#00484e]" />
                <h3 className="text-sm font-bold text-[#00484e] uppercase tracking-wider">
                  Full Day Schedule ({FULL_DAYS[currentDay]})
                </h3>
              </div>
              <span className="text-xs text-[#5f7377] font-semibold">
                9 Periods · Standard Timetable
              </span>
            </div>

            <div className="border border-[#b7cdc3]/70 rounded-2xl overflow-hidden divide-y divide-[#b7cdc3]/40 bg-white shadow-2xs">
              {periods.map((p) => {
                const entry = daySchedule.find((e) => e.s < p.e && p.s < e.e);
                const isCurrent = p.s <= currentTimeMinutes && currentTimeMinutes < p.e;

                return (
                  <div
                    key={p.period}
                    className={`p-3.5 flex items-center justify-between gap-3 text-xs transition-colors ${
                      isCurrent ? 'bg-[#e6eeea]/70 font-semibold' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                          isCurrent
                            ? 'bg-[#00484e] text-white'
                            : 'bg-[#f0f5f2] text-[#00484e] border border-[#b7cdc3]/60'
                        }`}
                      >
                        P{p.period}
                      </span>
                      <div>
                        <div className="font-bold text-[#00484e]">
                          {p.period === 5 ? 'Period 5 (Lunch Break)' : `Period ${p.period}`}
                        </div>
                        <span className="text-[11px] text-[#5f7377]">{p.label}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      {entry ? (
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded-md font-bold text-[11px] bg-rose-100 text-rose-800 border border-rose-200">
                            Occupied · {entry.sec}
                          </span>
                          <span className="block text-[10px] text-[#5f7377] mt-0.5">
                            {entry.p}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-md font-bold text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Empty / Free for Study
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#b7cdc3]/60 bg-[#fdfbfa] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#00484e] hover:bg-[#00383d] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
