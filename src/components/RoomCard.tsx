import React from 'react';
import {
  Clock,
  Share2,
  Wind,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Info,
  Calendar,
} from 'lucide-react';
import {
  RoomStatus,
  ROOM_METADATA,
  getFloorName,
  format12Hour,
  PERIOD_TIMINGS,
  DayOfWeek,
  schedule,
} from '../data/timetableData';

interface RoomCardProps {
  status: RoomStatus;
  currentDay: DayOfWeek;
  currentTimeMinutes: number;
  onSelectRoom: (roomId: string) => void;
  onShareSquad: (roomId: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  status,
  currentDay,
  currentTimeMinutes,
  onSelectRoom,
  onShareSquad,
}) => {
  const meta = ROOM_METADATA[status.roomId];
  const floorName = getFloorName(status.floor);
  const daySchedule = (schedule[status.roomId] || {})[currentDay] || [];

  // Determine badge styling
  let badgeConfig = {
    bg: 'bg-emerald-100/90 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-600',
    label: 'FREE NOW',
    icon: CheckCircle2,
  };

  if (!status.free) {
    if (status.currentClass) {
      badgeConfig = {
        bg: 'bg-rose-100 text-rose-800 border-rose-200',
        dot: 'bg-rose-500',
        label: 'IN USE',
        icon: XCircle,
      };
    } else {
      badgeConfig = {
        bg: 'bg-amber-100 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
        label: 'BUSY SOON',
        icon: AlertTriangle,
      };
    }
  } else if (status.isStartingSoon) {
    badgeConfig = {
      bg: 'bg-amber-100 text-amber-900 border-amber-300',
      dot: 'bg-amber-500',
      label: 'CLOSING SOON (<30M)',
      icon: AlertTriangle,
    };
  }

  // 9-period visual mini timeline for this day
  const periods = PERIOD_TIMINGS.standard2026;

  return (
    <div
      onClick={() => onSelectRoom(status.roomId)}
      className={`group relative bg-[#fdfbfa] border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer ${
        status.free
          ? 'border-[#b7cdc3]/80 hover:border-emerald-500/60'
          : 'border-[#b7cdc3]/50 hover:border-rose-400/50 bg-[#faf8f7]'
      }`}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-[#00484e] tracking-tight group-hover:text-[#e8806a] transition-colors">
                {meta?.displayLabel || status.roomId}
              </h3>
              {meta?.hasAC && (
                <span
                  title="Air Conditioned"
                  className="p-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200"
                >
                  <Wind className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-[#5f7377] mt-0.5">
              {floorName} · {meta?.tag}
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border tracking-wide shadow-2xs ${badgeConfig.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${badgeConfig.dot}`} />
            <span>{badgeConfig.label}</span>
          </div>
        </div>

        {/* Status description */}
        <p className="text-sm text-[#00484e] my-3 leading-snug line-clamp-2">
          {status.text}
        </p>

        {/* Daily Period Mini Timeline (1 to 9) */}
        <div className="my-3.5 p-2 bg-[#f0f5f2] rounded-xl border border-[#b7cdc3]/50">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#5f7377] mb-1.5 px-0.5">
            <span>PERIODS 1–9 TODAY</span>
            <span>
              {daySchedule.length === 0
                ? 'Open all day'
                : `${daySchedule.length} session${daySchedule.length > 1 ? 's' : ''}`}
            </span>
          </div>
          <div className="grid grid-cols-9 gap-1 h-3.5">
            {periods.map((p) => {
              const isOccupied = daySchedule.some((e) => e.s < p.e && p.s < e.e);
              const isCurrentPeriod = p.s <= currentTimeMinutes && currentTimeMinutes < p.e;
              return (
                <div
                  key={p.period}
                  title={`Period ${p.period} (${p.label}): ${isOccupied ? 'Occupied' : 'Free'}`}
                  className={`relative rounded-sm transition-transform hover:scale-110 ${
                    isOccupied
                      ? 'bg-[#e8806a]'
                      : p.period === 5
                      ? 'bg-emerald-300'
                      : 'bg-emerald-600'
                  } ${isCurrentPeriod ? 'ring-2 ring-[#00484e] ring-offset-1 z-10' : ''}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Card Footer / Quick Actions */}
      <div className="pt-3 border-t border-[#b7cdc3]/40 flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5f7377]">
          <Clock className="w-3.5 h-3.5 text-[#00484e]" />
          <span>
            {status.until !== null
              ? `Until ${format12Hour(status.until)}`
              : 'Free rest of day'}
          </span>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {status.free && (
            <button
              type="button"
              onClick={() => onShareSquad(status.roomId)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#00484e] hover:bg-[#00383d] px-3 py-1.5 rounded-lg shadow-2xs transition-all active:scale-95"
              title="Share room location on WhatsApp / Squad invite"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Squad</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onSelectRoom(status.roomId)}
            className="p-1.5 text-[#00484e] hover:text-[#e8806a] hover:bg-[#e6eeea] rounded-lg transition-colors"
            title="View complete schedule & countdown"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
