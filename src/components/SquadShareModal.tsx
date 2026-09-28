import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare, ExternalLink } from 'lucide-react';
import { ROOM_METADATA, format12Hour, RoomStatus } from '../data/timetableData';

interface SquadShareModalProps {
  roomId: string | null;
  status: RoomStatus | null;
  onClose: () => void;
}

export const SquadShareModal: React.FC<SquadShareModalProps> = ({
  roomId,
  status,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!roomId || !status) return null;

  const meta = ROOM_METADATA[roomId];
  const roomLabel = meta?.displayLabel || roomId;
  const untilText =
    status.until !== null
      ? `until ${format12Hour(status.until)}`
      : 'for the rest of the day';

  const message = `📍 Heading to ${roomLabel}. It's free ${untilText}. Come fast!`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Study Spot at ${roomLabel}`,
          text: message,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#fdfbfa] border border-[#b7cdc3] rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00484e] text-white flex items-center justify-center shadow-md">
              <MessageSquare className="w-5 h-5 text-[#e8806a]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#00484e]">
                Invite Squad to {roomLabel}
              </h3>
              <p className="text-xs text-[#5f7377]">
                Free {untilText}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5f7377] hover:text-[#00484e] hover:bg-[#e6eeea] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message bubble preview */}
        <div className="bg-[#e6eeea]/70 border border-[#b7cdc3]/70 rounded-2xl p-4 text-sm font-medium text-[#00484e] relative">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5f7377] block mb-1">
            Squad Message Preview
          </span>
          <p className="leading-relaxed select-all font-mono text-xs bg-white p-3 rounded-xl border border-[#b7cdc3]/50">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-sm py-3 px-4 rounded-xl shadow-xs transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Send on WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80 ml-1" />
          </a>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-[#b7cdc3] text-[#00484e] hover:bg-[#f0f5f2] font-bold text-xs py-2.5 px-3 rounded-xl transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Invite Text'}</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center justify-center gap-1.5 bg-[#00484e] text-white hover:bg-[#00383d] font-bold text-xs py-2.5 px-3 rounded-xl transition-colors shadow-2xs"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
