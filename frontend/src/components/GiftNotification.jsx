import React from "react";
import { useVideoStore } from "../hooks/useVideoStore";

/**
 * GiftNotification
 * Hiển thị thông báo cảm ơn đồng bộ với video quà tặng.
 * Đọc state từ useVideoStore thay vì lắng nghe socket riêng,
 * đảm bảo xuất hiện cùng lúc với video + overlay + TTS.
 */
const GiftNotification = () => {
  const gift = useVideoStore((s) => s.activeGiftNotification);

  if (!gift) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none w-[90%] sm:w-[85%] max-w-[280px] sm:max-w-[320px]">
      <div
        key={gift.id}
        className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-1 pr-4 rounded-full flex items-center gap-3 shadow-2xl animate-[slideInChat_0.4s_ease-out_forwards]"
      >
        {/* Avatar / Icon Container */}
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-[#d946ef] to-[#8b5cf6] overflow-hidden relative border border-white/5">
          {gift.avatar ? (
            <img
              src={gift.avatar}
              alt=""
              className="absolute inset-0 w-full h-full rounded-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <span className="text-[10px] font-bold text-white">{gift.nickname.charAt(0)}</span>
          )}
        </div>

        {/* Info context */}
        <div className="flex flex-1 items-center gap-1.5 truncate text-[10px] sm:text-[12px] py-1">
          <span className="text-white font-bold truncate max-w-[80px] sm:max-w-[100px]">{gift.nickname}</span>
          <span className="text-white/40 font-medium">sent</span>
          <span className="text-[#fbbf24] font-bold scale-110">x{gift.amount}</span>
          <span className="text-[#d946ef] font-bold truncate">{gift.giftName}</span>
        </div>

        {/* Static decoration */}
        <div className="text-[13px] sm:text-[16px] shrink-0">🎁</div>
      </div>
    </div>
  );
};

export default GiftNotification;
