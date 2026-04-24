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

  const [firingGift, setFiringGift] = useState(null);
  const [firingComment, setFiringComment] = useState(null);
  const [lastFired, setLastFired] = useState(null); // { type: 'gift'|'comment', label, sender }
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetchGifts();
    fetchOverlays();
    fetchVideos();
  }, [fetchGifts, fetchOverlays, fetchVideos]);

  // ─── Gift triggers: gift trong useGiftStore khớp với video.gift của idol active ───
  const giftVideos = useVideoStore.getState().getGiftVideos();
  const assignedGiftNames = new Set(giftVideos.map((v) => v.gift).filter(Boolean));
  const simulatableGifts = gifts.filter((g) => assignedGiftNames.has(g.giftName));

  // ─── Comment triggers: lấy v.gift từ video active NHƯNG loại trừ những cái
  // đã là tên gift thật trong useGiftStore (vì chúng đã hiện ở phần Gift trên)
  const realGiftNames = new Set(gifts.map((g) => g.giftName));
  const commentTriggers = [...assignedGiftNames]
    .filter((name) => !realGiftNames.has(name))
    .sort();

  // ─────────────────────── Simulate Gift ───────────────────────
  const simulateGift = (gift) => {
    if (firingGift) return;
    const sender = FAKE_SENDERS[Math.floor(Math.random() * FAKE_SENDERS.length)];
    const giftName = gift.giftName;
    const amount = 1;
    const giftNameLower = giftName.toLowerCase().trim();

    setFiringGift(gift.giftId);
    setTimeout(() => setFiringGift(null), 700);
    setLastFired({ type: "gift", label: giftName, sender });

    const activeVideos = useVideoStore.getState().getGiftVideos();
    if (activeVideos.length === 0) return;

    const matchedVideos = activeVideos.filter(
      (v) => v.gift && v.gift.toLowerCase().trim() === giftNameLower
    );
    if (matchedVideos.length === 0) return;

    const giftDiamonds = gift.diamonds || 1;
    const giftImage = gift.image || null;

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
      notifData: { nickname: sender, avatar: null, amount, giftName: giftName || "Gift" },
    };

    const state = useVideoStore.getState();
    const lastQueued = state.videoQueue[state.videoQueue.length - 1] ?? state.selectedVideo;
    const curIdx = matchedVideos.findIndex((v) => v.video === lastQueued);
    const idx = ((curIdx === -1 ? 0 : curIdx) + 1) % matchedVideos.length;
    const v = matchedVideos[idx];

    useVideoStore.getState().enqueueVideo(v.video, `x${amount} ${giftName}`, sender, giftMeta);
    useVideoStore.getState().addIdolGift(v.idolId, giftDiamonds * amount, giftImage);
    useVideoStore.getState().addGiftScore(v.video, amount);
  };

  // ─────────────────────── Simulate Comment ───────────────────────
  const simulateComment = (commentText) => {
    if (firingComment) return;

    const sender = FAKE_SENDERS[Math.floor(Math.random() * FAKE_SENDERS.length)];
    const commentLower = commentText.toLowerCase().trim();

    setFiringComment(commentText);
    setTimeout(() => setFiringComment(null), 700);
    setLastFired({ type: "comment", label: commentText, sender });

    // Tái sử dụng logic từ TikTokListener.jsx – tiktok_chat handler
    const activeVideos = useVideoStore.getState().getGiftVideos();
    if (activeVideos.length === 0) return;

    const matchedVideos = activeVideos.filter(
      (v) => v.gift && v.gift.toLowerCase().trim() === commentLower
    );
    if (matchedVideos.length === 0) return;

    const state = useVideoStore.getState();
    const lastQueued = state.videoQueue[state.videoQueue.length - 1] ?? state.selectedVideo;
    const curIdx = matchedVideos.findIndex((v) => v.video === lastQueued);
    const idx = ((curIdx === -1 ? 0 : curIdx) + 1) % matchedVideos.length;
    const v = matchedVideos[idx];

    // Comment không có TTS/overlay/notification — giống TikTokListener
    useVideoStore.getState().enqueueVideo(v.video, `Lệnh: ${commentText}`, sender);
    useVideoStore.getState().addIdolGift(v.idolId, 0, null);
  };

  return (
    <div
      className={`
        flex flex-col bg-white/[0.03] backdrop-blur-2xl rounded-2xl
        border border-white/[0.05] overflow-hidden transition-all duration-300
        ${collapsed ? "max-h-[38px]" : "max-h-[400px]"}
      `}
    >
      {/* ── Header ── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="shrink-0 px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2
                   border-b border-white/[0.03] bg-white/[0.02] hover:bg-white/[0.04]
                   transition-colors w-full text-left select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-3 rounded-full bg-[#eab308] shrink-0" />
          <span className="text-[7.5px] sm:text-[8.5px] font-medium text-white/20">
            SIMULATOR
          </span>
          <span className="text-[7px] font-bold text-[#eab308]/50 bg-[#eab308]/10
                           rounded-full px-1.5 py-0.5 border border-[#eab308]/20">
            🎁{simulatableGifts.length}
          </span>
          <span className="text-[7px] font-bold text-[#06b6d4]/50 bg-[#06b6d4]/10
                           rounded-full px-1.5 py-0.5 border border-[#06b6d4]/20">
            💬{commentTriggers.length}
          </span>
        </div>
        <svg
          className={`w-3 h-3 text-white/20 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Body ── */}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col">

        {/* Last fired toast */}
        {lastFired && (
          <div className={`
            shrink-0 mx-3 mt-2 px-2.5 py-1.5 rounded-xl flex items-center gap-2
            ${lastFired.type === "gift"
              ? "bg-[#eab308]/10 border border-[#eab308]/20"
              : "bg-[#06b6d4]/10 border border-[#06b6d4]/20"
            }
          `}>
            <span className={`text-[9px] font-semibold shrink-0
              ${lastFired.type === "gift" ? "text-[#eab308]/80" : "text-[#06b6d4]/80"}`}>
              {lastFired.type === "gift" ? "🎁 Gift:" : "💬 Chat:"}
            </span>
            <span className="text-[9px] text-white/60 truncate">
              <span className="text-white/80 font-bold">{lastFired.label}</span>
              {" "}bởi <span className="text-[#d946ef]/80">{lastFired.sender}</span>
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* ── GIFT SECTION ── */}
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#eab308]/60" />
              <span className="text-[7px] font-bold text-white/20 tracking-widest">QUÀ TẶNG</span>
            </div>

            {simulatableGifts.length === 0 ? (
              <div className="flex items-center justify-center py-3 text-white/15 text-[8px] font-bold tracking-widest">
                CHƯA CÓ QUÀ ĐƯỢC GÁN
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {simulatableGifts.map((gift) => {
                  const isFiring = firingGift === gift.giftId;
                  return (
                    <button
                      key={gift.giftId}
                      onClick={() => simulateGift(gift)}
                      title={`Giả lập tặng: ${gift.giftName}`}
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
                      <div className={`relative w-8 h-8 rounded-lg overflow-hidden transition-transform duration-200 ${isFiring ? "scale-110" : "group-hover:scale-105"}`}>
                        {gift.image ? (
                          <img
                            src={gift.image.startsWith("http") ? gift.image : `${SOCKET_URL}${gift.image}`}
                            alt={gift.giftName}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center text-base">🎁</div>
                        )}
                        {isFiring && (
                          <div className="absolute inset-0 bg-[#eab308]/40 rounded-lg animate-ping pointer-events-none" />
                        )}
                      </div>
                      <span className={`text-[7px] font-semibold text-center truncate w-full leading-tight transition-colors duration-150 ${isFiring ? "text-[#eab308]" : "text-white/30 group-hover:text-white/60"}`}>
                        {gift.giftName}
                      </span>
                      {gift.diamonds > 0 && (
                        <span className="absolute -top-1 -right-1 text-[6px] font-bold bg-[#06b6d4]/80 text-white rounded-full px-1 py-0.5 border border-white/10 leading-none">
                          💎{gift.diamonds}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Divider ── */}
          <div className="mx-3 my-2 border-t border-white/[0.04]" />

          {/* ── COMMENT SECTION ── */}
          <div className="px-3 pb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]/60" />
              <span className="text-[7px] font-bold text-white/20 tracking-widest">GIẢ LẬP CHAT</span>
            </div>

            {commentTriggers.length === 0 ? (
              <div className="flex items-center justify-center py-3 text-white/15 text-[8px] font-bold tracking-widest">
                CHƯA CÓ COMMENT TRIGGER
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {commentTriggers.map((trigger) => {
                  const isFiring = firingComment === trigger;
                  // Lấy tên video liên kết để hiển thị tooltip
                  const linkedVideo = giftVideos.find(
                    (v) => v.gift && v.gift.toLowerCase().trim() === trigger.toLowerCase().trim()
                  );
                  return (
                    <button
                      key={trigger}
                      onClick={() => simulateComment(trigger)}
                      title={linkedVideo ? `Kích hoạt: ${linkedVideo.name || trigger}` : trigger}
                      className={`
                        flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
                        border text-[9px] font-bold transition-all duration-200
                        select-none active:scale-95 focus:outline-none
                        ${isFiring
                          ? "border-[#06b6d4]/60 bg-[#06b6d4]/20 text-[#06b6d4] shadow-[0_0_14px_rgba(6,182,212,0.4)] scale-95"
                          : "border-white/[0.08] bg-white/[0.03] text-white/40 hover:border-[#06b6d4]/30 hover:bg-[#06b6d4]/10 hover:text-[#06b6d4]/80"
                        }
                      `}
                    >
                      <span className={`text-[10px] transition-transform duration-200 ${isFiring ? "scale-125" : ""}`}>
                        💬
                      </span>
                      <span className="font-mono tracking-wide">{trigger}</span>
                      {linkedVideo?.name && (
                        <span className={`text-[7px] font-normal opacity-60 truncate max-w-[60px] ${isFiring ? "text-[#06b6d4]" : "text-white/30"}`}>
                          → {linkedVideo.name}
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
    </div>
  );
};

export default GiftSimulator;
