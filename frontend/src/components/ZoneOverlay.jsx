import React from "react";
import { useZoneStore } from "../hooks/useZoneStore";
import { useGiftStore } from "../hooks/useGiftStore";

const ZoneOverlay = () => {
  const zones = useZoneStore((state) => state.zones);
  const gifts = useGiftStore((state) => state.gifts);

  // Phân loại các khu dựa theo tên
  const leftZones = zones.filter((z) => {
    const name = z.name.toLowerCase();
    return name.includes("lệnh") || name.includes("hiệu ứng") || (!name.includes("đạo") && !name.includes("đặc biệt"));
  });

  const rightZones = zones.filter((z) => {
    const name = z.name.toLowerCase();
    return name.includes("vũ đạo") || name.includes("đặc biệt");
  });

  const renderZone = (zone) => {
    const zoneGifts = zone.gifts
      .map((zg) => {
        const fullGift = gifts.find((g) => g.giftId === zg.giftId);
        if (!fullGift) return null;
        return { ...zg, ...fullGift };
      })
      .filter(Boolean);

    if (zoneGifts.length === 0) return null;

    return (
      <div
        key={zone.id}
        className="flex flex-col bg-transparent overflow-hidden pointer-events-auto shrink-0 mb-1"
      >
        {/* Header */}
        <div className="px-2 py-1.5 flex items-center justify-center relative overflow-hidden">
          {/* Subtle accent glow in header */}
          <div
            className="absolute inset-0 opacity-20"
            style={{ background: `linear-gradient(90deg, transparent, ${zone.color}, transparent)` }}
          />
          <span
            className="text-[9px] sm:text-[10.5px] font-bold text-white uppercase tracking-wider relative z-10 drop-shadow-md"
            style={{ textShadow: `0 0 10px ${zone.color}80` }}
          >
            {zone.name}
          </span>
        </div>

        {/* Capsule List */}
        <div className="p-1 flex flex-col gap-1">
          {zoneGifts.map((gift) => (
            <button
              key={gift.giftId}
              className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full bg-transparent hover:bg-white/[0.05] transition-all active:scale-95 group relative overflow-hidden"
            >
              {/* Subtle button glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r from-transparent via-white to-transparent" />

              <img
                src={gift.image}
                alt={gift.title}
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain drop-shadow-md shrink-0"
              />
              <span className="text-[10px] sm:text-[12px] font-bold text-white/95 text-left leading-tight truncate transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                {gift.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Left Column */}
      <div className="absolute top-[140px] sm:top-[160px] left-2 sm:left-4 bottom-4 w-[130px] sm:w-[160px] flex flex-col gap-3 overflow-y-auto custom-scrollbar z-50 pointer-events-none">
        {leftZones.map(renderZone)}
      </div>

      {/* Right Column */}
      <div className="absolute top-[140px] sm:top-[160px] right-2 sm:right-4 bottom-4 w-[130px] sm:w-[160px] flex flex-col gap-3 overflow-y-auto custom-scrollbar z-50 pointer-events-none">
        {rightZones.map(renderZone)}
      </div>
    </>
  );
};

export default ZoneOverlay;
