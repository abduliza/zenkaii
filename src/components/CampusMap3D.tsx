import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  Layers,
  Clock,
  Share2,
  Calendar,
} from 'lucide-react';
import {
  RoomStatus,
  ROOM_METADATA,
  ALL_ROOM_IDS,
  getFloorName,
  format12Hour,
  formatCountdown,
  DayOfWeek,
} from '../data/timetableData';

interface CampusMap3DProps {
  roomStatuses: Record<string, RoomStatus>;
  selectedFloor: number | null;
  selectedRoomId: string | null;
  currentDay: DayOfWeek;
  currentTimeMinutes: number;
  currentSecondCounter: number;
  onSelectRoom: (roomId: string) => void;
  onOpenDetailModal: (roomId: string) => void;
  onSelectFloor: (floor: number | null) => void;
  onShareSquad: (roomId: string) => void;
}

export const CampusMap3D: React.FC<CampusMap3DProps> = ({
  roomStatuses,
  selectedFloor,
  selectedRoomId,
  currentDay,
  currentTimeMinutes,
  currentSecondCounter,
  onSelectRoom,
  onOpenDetailModal,
  onSelectFloor,
  onShareSquad,
}) => {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [rotateZ, setRotateZ] = useState(-25);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    initPanX: number;
    initPanY: number;
  } | null>(null);

  const istFloors = [1, 2, 3, 4, 5, 6, 7];
  const tbRooms = ALL_ROOM_IDS.filter((r) => ROOM_METADATA[r]?.floor === 8);

  const handleZoom = (factor: number) => {
    setZoom((prev) => Math.min(2.5, Math.max(0.45, prev * factor)));
  };

  const handleResetFit = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setRotateZ(-25);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input')) return;
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initPanX: panX,
      initPanY: panY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !dragRef.current.isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPanX(dragRef.current.initPanX + dx);
    setPanY(dragRef.current.initPanY + dy);
  };

  const handlePointerUp = () => {
    if (dragRef.current) {
      dragRef.current.isDragging = false;
      dragRef.current = null;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    handleZoom(e.deltaY < 0 ? 1.08 : 0.92);
  };

  const getTileStyle = (roomId: string) => {
    const s = roomStatuses[roomId];
    if (!s) return { bg: '#e8806a', isFree: false, isSoon: false, isFilteredOut: false };

    const isFilteredOut = selectedFloor !== null && s.floor !== selectedFloor;
    const isSoon = s.free && s.until !== null && s.until - currentTimeMinutes <= 30;

    let bg = '#0a6b45'; // free emerald
    if (!s.free) {
      bg = '#e8806a'; // coral busy
    } else if (isSoon) {
      bg = '#b7791f'; // soon amber
    }

    return {
      bg,
      isFree: s.free,
      isSoon,
      isFilteredOut,
      status: s,
    };
  };

  const selectedRoomStatus = selectedRoomId ? roomStatuses[selectedRoomId] : null;

  // Compute countdown in seconds for selected room
  let countdownSeconds: number | null = null;
  if (selectedRoomStatus && selectedRoomStatus.until !== null) {
    const targetSeconds = selectedRoomStatus.until * 60;
    countdownSeconds = Math.max(0, targetSeconds - currentSecondCounter);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 3D Scene Container */}
      <div className="relative bg-gradient-to-b from-[#d9ebe0] via-[#cce3d5] to-[#bedbc8] rounded-2xl border border-[#b7cdc3] overflow-hidden shadow-inner select-none">
        {/* Floating Controls Bar */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <div className="bg-white/90 backdrop-blur-md border border-[#b7cdc3] rounded-xl p-1 shadow-md flex flex-col gap-1">
            <button
              onClick={() => handleZoom(1.2)}
              className="w-8 h-8 rounded-lg text-[#00484e] hover:bg-[#e6eeea] flex items-center justify-center font-bold text-base transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(0.8)}
              className="w-8 h-8 rounded-lg text-[#00484e] hover:bg-[#e6eeea] flex items-center justify-center font-bold text-base transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetFit}
              className="w-8 h-8 rounded-lg text-[#00484e] hover:bg-[#e6eeea] flex items-center justify-center text-xs font-bold transition-colors"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Left Building Labels & Floor Filter Indicator */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1">
          <div className="bg-white/90 backdrop-blur-md border border-[#b7cdc3] rounded-xl px-3 py-1.5 shadow-sm text-xs font-bold text-[#00484e] flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#e8806a]" />
            <span>3D Interactive Campus Model</span>
          </div>
          <span className="text-[11px] font-semibold text-[#00484e]/80 ml-1">
            IST Academic Tower (Left) & Tutorial Block (Right)
          </span>
        </div>

        {/* Interactive 3D Canvas Stage */}
        <div
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          style={{ height: '580px' }}
          className="w-full flex items-center justify-center cursor-grab active:cursor-grabbing perspective-stage touch-none relative"
        >
          <div
            className="scene-wrapper"
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            }}
          >
            {/* IST Building Block */}
            <div
              className="building-block"
              style={{
                left: '-260px',
                width: '520px',
                transform: `translate(-100px, 190px) rotateX(55deg) rotateZ(${rotateZ}deg)`,
              }}
            >
              {istFloors.map((floorNum, idx) => {
                const floorRooms = ALL_ROOM_IDS.filter(
                  (r) => ROOM_METADATA[r]?.floor === floorNum
                );
                const isIsolated = selectedFloor !== null && selectedFloor === floorNum;
                const isHiddenByIsolation = selectedFloor !== null && selectedFloor !== floorNum;

                return (
                  <div
                    key={floorNum}
                    className="floor-slice"
                    style={{
                      transform: `translateZ(${idx * 90}px)`,
                      background: isIsolated
                        ? 'rgba(255, 255, 255, 0.95)'
                        : isHiddenByIsolation
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'rgba(255, 255, 255, 0.72)',
                      border: isIsolated ? '2px solid #00484e' : '1px solid rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 8px 30px rgba(0, 72, 78, 0.1)',
                      opacity: isHiddenByIsolation ? 0.25 : 1,
                    }}
                  >
                    {/* Floor Label Tag */}
                    <div className="absolute right-[calc(100%+12px)] top-1 flex items-center gap-1.5 whitespace-nowrap bg-white/90 px-2 py-0.5 rounded-md border border-[#b7cdc3] shadow-xs">
                      <span className="text-xs font-extrabold text-[#00484e]">
                        {floorNum}F
                      </span>
                    </div>

                    {/* Room Grid */}
                    <div className="grid grid-cols-6 gap-1.5 p-1.5 h-full">
                      {floorRooms.map((roomId) => {
                        const tile = getTileStyle(roomId);
                        const isSelected = selectedRoomId === roomId;

                        return (
                          <button
                            key={roomId}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRoom(roomId);
                            }}
                            onMouseEnter={() => setHoveredRoom(roomId)}
                            onMouseLeave={() => setHoveredRoom(null)}
                            style={{
                              backgroundColor: tile.bg,
                            }}
                            className={`relative h-full py-2 rounded-md font-bold text-white text-xs flex items-center justify-center transition-all duration-150 shadow-xs cursor-pointer select-none ${
                              tile.isFilteredOut ? 'opacity-25' : 'hover:scale-105 hover:z-20'
                            } ${
                              isSelected
                                ? 'ring-3 ring-[#00484e] ring-offset-2 scale-110 z-30 font-black'
                                : ''
                            }`}
                          >
                            <span>{roomId}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TB Building Block (Tutorial Block) */}
            <div
              className="building-block"
              style={{
                left: '-70px',
                width: '140px',
                transform: `translate(330px, 190px) rotateX(55deg) rotateZ(${rotateZ}deg)`,
              }}
            >
              <div
                className="floor-slice"
                style={{
                  transform: 'translateZ(0px)',
                  background:
                    selectedFloor === 8
                      ? 'rgba(255, 255, 255, 0.95)'
                      : selectedFloor !== null
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.72)',
                  border: selectedFloor === 8 ? '2px solid #00484e' : '1px solid rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 8px 30px rgba(0, 72, 78, 0.1)',
                  opacity: selectedFloor !== null && selectedFloor !== 8 ? 0.25 : 1,
                }}
              >
                <div className="absolute right-[calc(100%+12px)] top-1 flex items-center gap-1 whitespace-nowrap bg-white/90 px-2 py-0.5 rounded-md border border-[#b7cdc3] shadow-xs">
                  <span className="text-xs font-extrabold text-[#00484e]">TB Block</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 p-1.5 h-full">
                  {tbRooms.map((roomId) => {
                    const tile = getTileStyle(roomId);
                    const isSelected = selectedRoomId === roomId;

                    return (
                      <button
                        key={roomId}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRoom(roomId);
                        }}
                        onMouseEnter={() => setHoveredRoom(roomId)}
                        onMouseLeave={() => setHoveredRoom(null)}
                        style={{
                          backgroundColor: tile.bg,
                        }}
                        className={`relative h-full py-2 rounded-md font-bold text-white text-xs flex items-center justify-center transition-all shadow-xs cursor-pointer select-none ${
                          tile.isFilteredOut ? 'opacity-25' : 'hover:scale-105 hover:z-20'
                        } ${
                          isSelected
                            ? 'ring-3 ring-[#00484e] ring-offset-2 scale-110 z-30 font-black'
                            : ''
                        }`}
                      >
                        <span>106</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hover room preview tooltip badge */}
        {hoveredRoom && (
          <div className="absolute bottom-16 left-4 z-20 pointer-events-none bg-white/95 backdrop-blur-md border border-[#b7cdc3] rounded-xl px-3.5 py-2 shadow-lg max-w-xs animate-in fade-in duration-100">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#00484e] text-sm">
                {ROOM_METADATA[hoveredRoom]?.displayLabel || hoveredRoom}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  roomStatuses[hoveredRoom]?.free
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {roomStatuses[hoveredRoom]?.free ? 'Free' : 'In Use'}
              </span>
            </div>
            <p className="text-xs text-[#5f7377] mt-0.5 line-clamp-1">
              {roomStatuses[hoveredRoom]?.text}
            </p>
          </div>
        )}

        {/* 3D Scene Footer: Legend & Angle Slider */}
        <div className="bg-white/95 backdrop-blur-md border-t border-[#b7cdc3] p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-[#5f7377]">
          {/* Legend */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#0a6b45]" />
              <span className="text-[#00484e] font-bold">Free</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#b7791f]" />
              <span className="text-[#00484e] font-bold">Class starts within 30 min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#e8806a]" />
              <span className="text-[#00484e] font-bold">In use</span>
            </div>
          </div>

          {/* Rotation Controller Slider */}
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-[#00484e]" />
            <span>Rotate:</span>
            <input
              type="range"
              min="-80"
              max="80"
              value={rotateZ}
              onChange={(e) => setRotateZ(Number(e.target.value))}
              className="w-28 accent-[#00484e] cursor-pointer"
            />
            <span className="tabular-nums font-bold text-[#00484e] w-8">
              {rotateZ}°
            </span>
          </div>
        </div>
      </div>

      {/* Selected Room Live Countdown Card (matches #det in original HTML) */}
      <div className="bg-[#fdfbfa] border border-[#b7cdc3] rounded-2xl p-6 shadow-xs">
        {selectedRoomStatus ? (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5f7377] block">
                  SELECTED ROOM
                </span>
                <h3 className="text-2xl font-black text-[#00484e] mt-0.5">
                  {ROOM_METADATA[selectedRoomStatus.roomId]?.displayLabel || selectedRoomStatus.roomId}
                </h3>
                <p className="text-xs font-semibold text-[#5f7377] mt-0.5">
                  {getFloorName(selectedRoomStatus.floor)} · {selectedRoomStatus.text}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide ${
                  selectedRoomStatus.free
                    ? 'bg-[#cfe8dc] text-[#0a6b45]'
                    : 'bg-[#fcdcd3] text-[#d4644c]'
                }`}
              >
                {selectedRoomStatus.free ? 'FREE' : 'BUSY'}
              </span>
            </div>

            {/* Big Countdown Box */}
            <div className="bg-[#00484e] text-white rounded-xl p-5 shadow-xs flex flex-col gap-1">
              <small className="text-[#a9cfcf] tracking-wider font-bold text-[11px] uppercase block">
                {selectedRoomStatus.free ? 'FREE FOR' : 'IN USE FOR'}
              </small>
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums font-mono py-1">
                {countdownSeconds !== null
                  ? formatCountdown(countdownSeconds)
                  : 'All day'}
              </div>
              <small className="text-[#a9cfcf]/90 text-xs">
                {selectedRoomStatus.until === null
                  ? 'No more classes today'
                  : selectedRoomStatus.free
                  ? 'Until the next class starts here'
                  : 'Until this class ends'}
              </small>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {selectedRoomStatus.free && (
                <button
                  type="button"
                  onClick={() => onShareSquad(selectedRoomStatus.roomId)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#e8806a] hover:bg-[#d4644c] text-white font-bold text-sm px-5 py-3 rounded-xl shadow-xs transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Call the squad on WhatsApp</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onOpenDetailModal(selectedRoomStatus.roomId)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white border border-[#b7cdc3] text-[#00484e] hover:bg-[#f0f5f2] font-bold text-sm px-5 py-3 rounded-xl shadow-2xs transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Full Day Schedule</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-sm font-semibold text-[#5f7377]">
            Tap a room on the map to see its countdown.
          </div>
        )}
      </div>

      <p className="text-xs text-[#5f7377] px-1">
        Scroll or use + / − to zoom, and drag the map to move it. TB is a separate block, drawn beside the IST block.
      </p>
    </div>
  );
};
