import React, { useState, useEffect } from "react";
import { useGiftStore } from "../hooks/useGiftStore";
import { useVideoStore } from "../hooks/useVideoStore";
import { useOverlayStore } from "../hooks/useOverlayStore";
import { SOCKET_URL } from "../utils/constant";

const FAKE_SENDERS = [
  "tester_01", "demo_user", "fan_chay", "viewer99", "ghostsend",
  "ngocbich2k", "truongan", "bomvang", "user_fake", "sim_master",
];

const GiftSimulator = () => {
  const gifts = useGiftStore((s) => s.gifts);
  const fetchGifts = useGiftStore((s) => s.fetchGifts);
  const fetchVideos = useVideoStore((s) => s.fetchVideos);
  const overlays = useOverlayStore((s) => s.overlays);
  const fetchOverlays = useOverlayStore((s) => s.fetchOverlays);

  const [firing, setFiring] = useState(null);
  const [lastFired, setLastFired] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetchGifts();
    fetchOverlays();
    fetchVideos();
  }, [fetchGifts, fetchOverlays, fetchVideos]);

  // ─── Lọc: chỉ lấy gift đã được gán vào video của idol đang active ───
  // getGiftVideos() trả về các video active, không phải idle, của idol đang active
  // Mỗi video có field `gift` = tên gift kích hoạt nó
  const giftVideos = useVideoStore.getState().getGiftVideos();
  const assignedGiftNames = new Set(
    giftVideos.map((v) => v.gift).filter(Boolean)
  );

  // Chỉ hiển thị các gift mà tên của nó nằm trong tập giftNames đã được assign
  const simulatableGifts = gifts.filter(
    (g) => assignedGiftNames.has(g.giftName)
  );

  const simulateGift = (gift) => {
    if (firing) return;

    const sender = FAKE_SENDERS[Math.floor(Math.random() * FAKE_SENDERS.length)];
    const giftName = gift.giftName;
    const amount = 1;
    const displayGiftName = `x${amount} ${giftName}`;
    const giftNameLower = giftName.toLowerCase().trim();

    setFiring(gift.giftId);
    setTimeout(() => setFiring(null), 700);
    setLastFired({ giftName, sender });

    // Lấy lại gift videos tại thời điểm click (mới nhất)
    const activeVideos = useVideoStore.getState().getGiftVideos();
    if (activeVideos.length === 0) return;

    // Chỉ Tier 1: khớp đúng tên gift — KHÔNG có fallback
    const matchedVideos = activeVideos.filter(
      (v) => v.gift && v.gift.toLowerCase().trim() === giftNameLower
    );
    if (matchedVideos.length === 0) return;

    const giftDiamonds = gift.diamonds || 1;
    const giftImage = gift.image || null;

    // Tìm overlay config nếu có
    let overlayConfig = null;
    if (gift.overlayId) {
      const overlay = overlays.find((o) => String(o.id) === String(gift.overlayId));
      if (overlay && overlay.active) overlayConfig = overlay;
    }

    const giftMeta = {
      overlayConfig,
      ttsText: sender,
      ttsAmount: amount,
      ttsGiftName: giftName,
      notifData: {
        nickname: sender,
        avatar: null,
        amount,
        giftName: giftName || "Gift",
      },
    };

    const state = useVideoStore.getState();
    const lastQueued = state.videoQueue[state.videoQueue.length - 1] ?? state.selectedVideo;
    const curIdx = matchedVideos.findIndex((v) => v.video === lastQueued);
    const idx = ((curIdx === -1 ? 0 : curIdx) + 1) % matchedVideos.length;
    const v = matchedVideos[idx];

    useVideoStore.getState().enqueueVideo(v.video, displayGiftName, sender, giftMeta);
    useVideoStore.getState().addIdolGift(v.idolId, giftDiamonds * amount, giftImage);
    useVideoStore.getState().addGiftScore(v.video, amount);
  };

  return (
    <div
      className={`
        flex flex-col bg-white/[0.03] backdrop-blur-2xl rounded-2xl
        border border-white/[0.05] overflow-hidden transition-all duration-300
        ${collapsed ? "max-h-[38px]" : "max-h-[260px]"}
      `}
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="shrink-0 px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2
                   border-b border-white/[0.03] bg-white/[0.02] hover:bg-white/[0.04]
                   transition-colors w-full text-left select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-3 rounded-full bg-[#eab308] shrink-0" />
          <span className="text-[7.5px] sm:text-[8.5px] font-medium text-white/20">
            GIFT SIMULATOR
          </span>
          {simulatableGifts.length > 0 ? (
            <span className="text-[7px] font-bold text-[#eab308]/60 bg-[#eab308]/10
                             rounded-full px-1.5 py-0.5 border border-[#eab308]/20">
              {simulatableGifts.length}
            </span>
          ) : (
            <span className="text-[7px] font-bold text-white/20 bg-white/5
                             rounded-full px-1.5 py-0.5 border border-white/10">
              0
            </span>
          )}
        </div>
        <svg
          className={`w-3 h-3 text-white/20 transition-transform duration-200
                      ${collapsed ? "" : "rotate-180"}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Body */}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
        {/* Last fired toast */}
        {lastFired && (
          <div className="shrink-0 mx-3 mt-2 px-2.5 py-1.5 rounded-xl bg-[#eab308]/10
                          border border-[#eab308]/20 flex items-center gap-2">
            <span className="text-[9px] text-[#eab308]/80 font-semibold shrink-0">🎁 Vừa bắn:</span>
            <span className="text-[9px] text-white/60 truncate">
              <span className="text-white/80 font-bold">{lastFired.giftName}</span>
              {" "}bởi <span className="text-[#d946ef]/80">{lastFired.sender}</span>
            </span>
          </div>
        )}

        {/* Gift grid */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {simulatableGifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-1.5 py-6">
              <span className="text-2xl opacity-20">🎁</span>
              <span className="text-white/15 text-[8px] font-bold tracking-widest text-center">
                CHƯA CÓ QUÀ NÀO<br />ĐƯỢC GÁN CHO IDOL ACTIVE
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {simulatableGifts.map((gift) => {
                const isFiring = firing === gift.giftId;
                return (
                  <button
                    key={gift.giftId}
                    onClick={() => simulateGift(gift)}
                    title={`Giả lập: ${gift.giftName}`}
                    className={`
                      relative flex flex-col items-center gap-1 p-1.5 rounded-xl
                      border transition-all duration-200 select-none
                      active:scale-90 focus:outline-none group
                      ${isFiring
                        ? "border-[#eab308]/60 bg-[#eab308]/20 scale-95 shadow-[0_0_16px_rgba(234,179,8,0.5)]"
                        : "border-white/[0.06] bg-white/[0.03] hover:border-[#eab308]/30 hover:bg-white/[0.06]"
                      }
                    `}
                  >
                    {/* Gift image / fallback emoji */}
                    <div className={`
                      relative w-9 h-9 rounded-lg overflow-hidden
                      transition-transform duration-200
                      ${isFiring ? "scale-110" : "group-hover:scale-105"}
                    `}>
                      {gift.image ? (
                        <img
                          src={gift.image.startsWith("http") ? gift.image : `${SOCKET_URL}${gift.image}`}
                          alt={gift.giftName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full bg-white/10 flex items-center justify-center text-lg"
                        style={{ display: gift.image ? "none" : "flex" }}
                      >
                        🎁
                      </div>

                      {/* Fire flash */}
                      {isFiring && (
                        <div className="absolute inset-0 bg-[#eab308]/40 rounded-lg
                                        animate-ping pointer-events-none" />
                      )}
                    </div>

                    {/* Gift name */}
                    <span className={`
                      text-[7px] font-semibold text-center truncate w-full leading-tight
                      transition-colors duration-150
                      ${isFiring ? "text-[#eab308]" : "text-white/35 group-hover:text-white/60"}
                    `}>
                      {gift.giftName}
                    </span>

                    {/* Diamonds badge */}
                    {gift.diamonds > 0 && (
                      <span className="absolute -top-1 -right-1 text-[6px] font-bold
                                       bg-[#06b6d4]/80 text-white rounded-full px-1 py-0.5
                                       border border-white/10 leading-none">
                        💎{gift.diamonds}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftSimulator;
