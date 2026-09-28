/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DAYS,
  DayOfWeek,
  ALL_ROOM_IDS,
  ROOM_METADATA,
  calculateRoomStatus,
  getCurrentPeriodInfo,
  getFloorName,
  format12Hour,
  ParsedQuery,
  RoomStatus,
} from './data/timetableData';
import { Header } from './components/Header';
import { SidebarFilters } from './components/SidebarFilters';
import { RoomCard } from './components/RoomCard';
import { CampusMap3D } from './components/CampusMap3D';
import { RoomDetailModal } from './components/RoomDetailModal';
import { MasterTimetableModal } from './components/MasterTimetableModal';
import { SquadShareModal } from './components/SquadShareModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function App() {
  // Live time tracking
  const [deviceSeconds, setDeviceSeconds] = useState(() => {
    const d = new Date();
    return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  });

  const [deviceDay, setDeviceDay] = useState<DayOfWeek>(() => {
    const d = new Date();
    return DAYS[d.getDay()] || 'Mon';
  });

  // Simulation state (if user manually adjusted target day or time)
  const [isSimulated, setIsSimulated] = useState(false);
  const [simulatedDay, setSimulatedDay] = useState<DayOfWeek>('Mon');
  const [simulatedTimeMinutes, setSimulatedTimeMinutes] = useState(540); // 9:00 AM

  // Filtering states
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [minDuration, setMinDuration] = useState<number>(0);
  const [onlyFree, setOnlyFree] = useState<boolean>(false);
  const [onlyAC, setOnlyAC] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI Views & Modals
  const [activeView, setActiveView] = useState<'list' | 'map' | 'timetables'>('list');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activeModalRoomId, setActiveModalRoomId] = useState<string | null>(null);
  const [shareSquadRoomId, setShareSquadRoomId] = useState<string | null>(null);
  const [showTimetablesModal, setShowTimetablesModal] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 1-second clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const secs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      setDeviceSeconds(secs);
      setDeviceDay(DAYS[now.getDay()] || 'Mon');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Effective time & day for calculations
  const effectiveDay = isSimulated ? simulatedDay : deviceDay;
  const effectiveTimeMinutes = isSimulated
    ? simulatedTimeMinutes
    : Math.floor(deviceSeconds / 60);

  const currentPeriodInfo = useMemo(() => {
    return getCurrentPeriodInfo(effectiveTimeMinutes);
  }, [effectiveTimeMinutes]);

  // Compute status for all rooms
  const allStatuses = useMemo(() => {
    const map: Record<string, RoomStatus> = {};
    ALL_ROOM_IDS.forEach((roomId) => {
      map[roomId] = calculateRoomStatus(
        roomId,
        effectiveDay,
        effectiveTimeMinutes,
        minDuration
      );
    });
    return map;
  }, [effectiveDay, effectiveTimeMinutes, minDuration]);

  // Filtered rooms list
  const filteredRoomIds = useMemo(() => {
    return ALL_ROOM_IDS.filter((roomId) => {
      const status = allStatuses[roomId];
      const meta = ROOM_METADATA[roomId];
      if (!status || !meta) return false;

      // Floor filter
      if (selectedFloor !== null && status.floor !== selectedFloor) {
        return false;
      }

      // Only free filter
      if (onlyFree && !status.free) {
        return false;
      }

      // AC filter
      if (onlyAC && !meta.hasAC) {
        return false;
      }

      // Direct search query filter (room number, tag, floor)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRoom =
          meta.displayLabel.toLowerCase().includes(q) ||
          roomId.toLowerCase().includes(q) ||
          meta.tag.toLowerCase().includes(q) ||
          getFloorName(meta.floor).toLowerCase().includes(q);
        if (!matchesRoom) return false;
      }

      return true;
    });
  }, [allStatuses, selectedFloor, onlyFree, onlyAC, searchQuery]);

  // Total free count among visible or all rooms
  const freeRoomsCount = useMemo(() => {
    return ALL_ROOM_IDS.filter((r) => allStatuses[r]?.free).length;
  }, [allStatuses]);

  // Toast dispatch helper
  const addToast = useCallback(
    (type: 'success' | 'info' | 'warning', title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, description }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Return to live time handler
  const handleResetToLive = () => {
    setIsSimulated(false);
    addToast('info', 'Synced with Device Clock', 'Now showing live campus timetable status.');
  };

  // Switch simulation parameters
  const handleSelectDay = (day: DayOfWeek) => {
    setIsSimulated(true);
    setSimulatedDay(day);
  };

  const handleChangeTimeMinutes = (mins: number) => {
    setIsSimulated(true);
    setSimulatedTimeMinutes(mins);
  };

  // Natural query handler
  const handleApplyParsedQuery = (parsed: ParsedQuery) => {
    if (parsed.floor !== undefined) setSelectedFloor(parsed.floor);
    if (parsed.duration !== undefined) setMinDuration(parsed.duration);
    if (parsed.ac !== undefined) setOnlyAC(parsed.ac);
    if (parsed.day) {
      setIsSimulated(true);
      setSimulatedDay(parsed.day);
    }
    if (parsed.time) {
      const [h, m] = parsed.time.split(':').map(Number);
      setIsSimulated(true);
      setSimulatedTimeMinutes(h * 60 + m);
    }
    if (parsed.roomNumber) {
      setSelectedRoomId(parsed.roomNumber);
      setActiveModalRoomId(parsed.roomNumber);
    }

    addToast(
      'success',
      'Filter Applied',
      parsed.tagsSummary.length ? parsed.tagsSummary.join(' · ') : 'Criteria updated'
    );
  };

  // Squad WhatsApp share action (safe, avoids window.open)
  const handleShareSquad = (roomId: string) => {
    const s = allStatuses[roomId];
    const meta = ROOM_METADATA[roomId];
    if (!s) return;

    const untilText =
      s.until !== null ? `until ${format12Hour(s.until)}` : 'for the rest of the day';
    const message = `📍 Heading to ${meta?.displayLabel || roomId}. It's free ${untilText}. Come fast!`;

    // Copy to clipboard for immediate convenience
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message).catch(() => {});
    }

    // Open clean SquadShareModal
    setShareSquadRoomId(roomId);

    addToast(
      'success',
      'Squad Invite Ready!',
      `Copied message for ${meta?.displayLabel || roomId}`
    );
  };

  // Group filtered rooms by floor
  const roomsByFloor = useMemo(() => {
    const map: Record<number, string[]> = {};
    filteredRoomIds.forEach((roomId) => {
      const floor = ROOM_METADATA[roomId]?.floor ?? 1;
      if (!map[floor]) map[floor] = [];
      map[floor].push(roomId);
    });
    return map;
  }, [filteredRoomIds]);

  const sortedFloors = useMemo(() => {
    return Object.keys(roomsByFloor)
      .map(Number)
      .sort((a, b) => a - b);
  }, [roomsByFloor]);

  const currentSecondCounter = isSimulated
    ? effectiveTimeMinutes * 60 + (deviceSeconds % 60)
    : deviceSeconds;

  return (
    <div className="min-h-screen bg-[#f1f6f2] flex flex-col font-sans">
      {/* App Header */}
      <Header
        currentDay={effectiveDay}
        currentTimeMinutes={effectiveTimeMinutes}
        periodLabel={currentPeriodInfo.label}
        isSimulated={isSimulated}
        activeView={activeView}
        onViewChange={(v) => {
          if (v === 'timetables') {
            setShowTimetablesModal(true);
          } else {
            setActiveView(v);
          }
        }}
        onResetToLive={handleResetToLive}
        onOpenTimetables={() => setShowTimetablesModal(true)}
      />

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sticky Sidebar: Filters & Controls */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <SidebarFilters
              currentDay={effectiveDay}
              currentTimeMinutes={effectiveTimeMinutes}
              selectedFloor={selectedFloor}
              minDurationMinutes={minDuration}
              onlyFree={onlyFree}
              onlyAC={onlyAC}
              searchQuery={searchQuery}
              totalRooms={ALL_ROOM_IDS.length}
              freeRoomsCount={freeRoomsCount}
              matchingCount={filteredRoomIds.length}
              isSimulated={isSimulated}
              onSelectFloor={setSelectedFloor}
              onSelectDay={handleSelectDay}
              onChangeTimeMinutes={handleChangeTimeMinutes}
              onChangeMinDuration={setMinDuration}
              onToggleOnlyFree={setOnlyFree}
              onToggleOnlyAC={setOnlyAC}
              onSearchChange={setSearchQuery}
              onResetToLive={handleResetToLive}
              onApplyParsedQuery={handleApplyParsedQuery}
            />
          </aside>

          {/* Right Main Panel: Views (List or 3D Map) */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            {/* View Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fdfbfa] border border-[#b7cdc3]/70 rounded-2xl p-4 sm:px-6 shadow-xs">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#e8806a]">
                  Campus Real-Time Status
                </span>
                <h2 className="text-2xl font-black text-[#00484e] tracking-tight">
                  {selectedFloor !== null ? getFloorName(selectedFloor) : 'All Campus Rooms'}
                </h2>
                <p className="text-xs text-[#5f7377] mt-0.5">
                  Showing {filteredRoomIds.length} of {ALL_ROOM_IDS.length} rooms matching filters
                </p>
              </div>

              {/* View toggle badge */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTimetablesModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00484e] bg-white border border-[#b7cdc3] hover:bg-[#e6eeea] px-3 py-2 rounded-xl transition-colors shadow-2xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#e8806a]" />
                  <span>Section Timetables</span>
                </button>
              </div>
            </div>

            {/* View 1: 3D Campus Isometric Map */}
            {activeView === 'map' && (
              <div className="space-y-4">
                <CampusMap3D
                  roomStatuses={allStatuses}
                  selectedFloor={selectedFloor}
                  selectedRoomId={selectedRoomId}
                  currentDay={effectiveDay}
                  currentTimeMinutes={effectiveTimeMinutes}
                  currentSecondCounter={currentSecondCounter}
                  onSelectRoom={setSelectedRoomId}
                  onOpenDetailModal={setActiveModalRoomId}
                  onSelectFloor={setSelectedFloor}
                  onShareSquad={handleShareSquad}
                />
              </div>
            )}

            {/* View 2: Room Cards List */}
            {activeView === 'list' && (
              <div className="space-y-8">
                {sortedFloors.length === 0 ? (
                  <div className="bg-[#fdfbfa] border border-[#b7cdc3] rounded-2xl p-12 text-center shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-[#f0f5f2] text-[#5f7377] flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-[#00484e]">
                      No rooms match these filters
                    </h3>
                    <p className="text-xs text-[#5f7377] max-w-sm mx-auto mt-1">
                      Try lowering the minimum duration requirement, switching floors, or clearing the search query.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFloor(null);
                        setMinDuration(0);
                        setOnlyFree(false);
                        setOnlyAC(false);
                        setSearchQuery('');
                      }}
                      className="mt-4 px-4 py-2 bg-[#00484e] text-white text-xs font-bold rounded-xl hover:bg-[#00383d] transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  sortedFloors.map((floor) => {
                    const floorRoomIds = roomsByFloor[floor] || [];
                    const freeInFloor = floorRoomIds.filter(
                      (r) => allStatuses[r]?.free
                    ).length;

                    return (
                      <div key={floor} className="space-y-3">
                        {/* Floor Section Header */}
                        <div className="flex items-center justify-between pb-1 border-b border-[#b7cdc3]/60">
                          <div className="flex items-baseline gap-2.5">
                            <h3 className="text-lg font-black text-[#00484e] tracking-tight">
                              {getFloorName(floor)}
                            </h3>
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                              {freeInFloor} of {floorRoomIds.length} free
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-[#5f7377]">
                            {floor === 8 ? 'Tutorial Block' : `Level ${floor}`}
                          </span>
                        </div>

                        {/* Room Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {floorRoomIds.map((roomId) => (
                            <RoomCard
                              key={roomId}
                              status={allStatuses[roomId]}
                              currentDay={effectiveDay}
                              currentTimeMinutes={effectiveTimeMinutes}
                              onSelectRoom={setActiveModalRoomId}
                              onShareSquad={handleShareSquad}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Room Detail Modal with Countdown & Full Schedule */}
      {activeModalRoomId && (
        <RoomDetailModal
          roomId={activeModalRoomId}
          status={allStatuses[activeModalRoomId] || null}
          currentDay={effectiveDay}
          currentTimeMinutes={effectiveTimeMinutes}
          currentSecondCounter={currentSecondCounter}
          onClose={() => setActiveModalRoomId(null)}
          onShareWhatsApp={handleShareSquad}
          onCopySquadMessage={(text) => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(text);
              addToast('success', 'Squad Message Copied!', text);
            }
          }}
        />
      )}

      {/* Squad Share Modal */}
      {shareSquadRoomId && (
        <SquadShareModal
          roomId={shareSquadRoomId}
          status={allStatuses[shareSquadRoomId] || null}
          onClose={() => setShareSquadRoomId(null)}
        />
      )}

      {/* Master Class Timetables Modal */}
      {showTimetablesModal && (
        <MasterTimetableModal
          onClose={() => setShowTimetablesModal(false)}
          onSelectRoom={(roomId) => {
            setActiveModalRoomId(roomId);
            setShowTimetablesModal(false);
          }}
        />
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
