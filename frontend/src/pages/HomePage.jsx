import React, { useEffect, useState } from "react";
import { useVideoStore } from "../hooks/useVideoStore";
import TikTokListener from "../components/TikTokListener";
import SelectThumbnail from "../components/SelectThumbnail";
import { BlackScreenVideo } from "../components/BlackScreenVideo";
import Background from "../components/Background";
import VideoGiftPodium from "../components/VideoGiftPodium";
import Leaderboard from "../components/Leaderboard";
import GiftNotification from "../components/GiftNotification";
import OverlayPlayer from "../components/OverlayPlayer";

/* â”€â”€â”€ TikTok-style Ultra-Glass Panel â”€â”€â”€ */
const GlassPanel = ({ title, children, className = "" }) => (
  <div className={`flex flex-col bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.05] overflow-hidden ${className}`}>
    {title && (
      <div className="shrink-0 px-4 py-2 sm:py-2.5 flex items-center gap-2 border-b border-white/[0.03] bg-white/[0.02]">
        <div className="w-[3px] h-3 rounded-full bg-[#d946ef] shrink-0" />
        <span className="text-[7.5px] sm:text-[8.5px] font-medium text-white/20 select-none">
          {title}
        </span>
      </div>
    )}
    <div className="flex-1 overflow-hidden min-h-0">
      {children}
    </div>
  </div>
);


const HomePage = ({ username }) => {
  const selectedVideo = useVideoStore((state) => state.selectedVideo);
  const processNext = useVideoStore((state) => state.processNext);
  const playId = useVideoStore((state) => state.playId);
  const videoMode = useVideoStore((state) => state.videoMode);
  const currentGiftName = useVideoStore((state) => state.currentGiftName);
  const currentGiftSender = useVideoStore((state) => state.currentGiftSender);

  const [showLiveFeed, setShowLiveFeed] = useState(false);

  // Auto-start or pick favorite on mount
  useEffect(() => {
    if (!selectedVideo) {
      processNext();
    }
  }, [selectedVideo, processNext]);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row items-stretch gap-3 md:gap-4 lg:gap-6 sm:p-3 sm:pt-3 md:p-4 md:pt-4 lg:p-6 lg:pt-6 overflow-hidden">

      {/* â”€â”€ LEFT COLUMN: Leaderboard + Dancer Models (Desktop) â”€â”€ */}
      <div className="hidden lg:flex flex-col gap-3 lg:gap-4 w-[280px] xl:w-[320px] shrink-0 min-h-0">
        {/* Streamer badge */}
        {username && (
          <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/[0.03] backdrop-blur-2xl border border-white/5 shadow-2xl">
            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[7.5px] sm:text-[8.5px] font-medium text-white/30">Streamer</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#d946ef] ml-0.5 text-shadow-glow">@{username}</span>
          </div>
        )}

        <GlassPanel title="BXH đại gia" className="flex-[6] min-h-0">
          <Leaderboard />
        </GlassPanel>

        <GlassPanel title="Thành viên" className="flex-[4] min-h-0">
          <SelectThumbnail />
        </GlassPanel>
      </div>

      {/* â”€â”€ CENTER: Phone Frame (Desktop) / Full Screen (Mobile) â”€â”€ */}
      <div className="flex-1 flex items-center justify-center min-h-0 min-w-0 relative">

        {/* â”€â”€â”€ DESKTOP: LED ring + phone frame â”€â”€â”€ */}
        <div className="hidden sm:flex relative h-full items-center justify-center">
          {/* LED border ring */}
          <div className="absolute inset-[-12px] rounded-[3.25rem] overflow-hidden bg-white/[0.1] backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/20">
            <div className="absolute inset-0 z-0 flex items-center justify-center mix-blend-screen">
              <div className="w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent_0_300deg,#d946ef_350deg,#fff_360deg)] animate-[spin_3s_linear_infinite] opacity-100 scale-110" />
            </div>
            <div className="absolute inset-0 z-0 flex items-center justify-center mix-blend-screen">
              <div className="w-[150%] h-[150%] bg-[conic-gradient(from_180deg,transparent_0_300deg,#06b6d4_350deg,#fff_360deg)] animate-[spin_3s_linear_infinite] opacity-100 scale-110" />
            </div>
          </div>

          {/* Phone screen */}
          <div
            className="relative rounded-[2.8rem] bg-[#0c0c12] overflow-hidden z-[20] shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] border border-white/20 ring-[6px] ring-white/10"
            style={{ aspectRatio: "9/19.5", height: "100%" }}
          >
            <Background />
            <VideoGiftPodium />

            {/* Gift Performance Badge */}
            {videoMode === "queue" && currentGiftName && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] w-full px-4 pointer-events-none">
                <div className="bg-white/[0.12] backdrop-blur-2xl border border-white/20 rounded-2xl py-2.5 px-5 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.6)]">
                  <span className="text-[10px] sm:text-[11px] font-bold text-white text-center leading-tight">
                    Cảm ơn <span className="text-[#d946ef]">{currentGiftSender || "bạn"}</span> đã tặng <span className="text-[#eab308]">{currentGiftName}</span>
                  </span>
                </div>
              </div>
            )}

            {selectedVideo && (
              <BlackScreenVideo
                key={`${selectedVideo}:${playId}`}
                videoSrc={selectedVideo}
                onVideoEnded={processNext}
              />
            )}
            <OverlayPlayer id="tsparticles-desktop" />
            <GiftNotification />
          </div>
        </div>

        {/* â”€â”€â”€ MOBILE: True full-screen, fixed â”€â”€â”€ */}
        <div className="sm:hidden fixed inset-0 z-[10] bg-[#0c0c12] overflow-hidden">
          <Background />
          <VideoGiftPodium />

          {/* Gift Performance Badge */}
          {videoMode === "queue" && currentGiftName && (
            <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-[100] w-full px-4 pointer-events-none animate-bounce-subtle">
              <div className="bg-white/[0.12] backdrop-blur-2xl border border-white/20 rounded-2xl py-2.5 px-5 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.6)]">
                <span className="text-[10px] sm:text-[11px] font-bold text-white text-center leading-tight">
                  Cảm ơn <span className="text-[#d946ef]">{currentGiftSender || "bạn"}</span> đã tặng <span className="text-[#eab308]">{currentGiftName}</span>
                </span>
              </div>
            </div>
          )}

          {/* Streamer Badge Mobile */}
          {username && (
            <div className="absolute top-2 right-2 z-[100] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xl scale-90">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse shrink-0" />
              <span className="text-white/20 font-semibold text-[7px] leading-none">Live</span>
              <span className="font-bold text-[#d946ef] text-[9px] leading-none tracking-tight">@{username}</span>
            </div>
          )}

          {selectedVideo && (
            <BlackScreenVideo
              key={`${selectedVideo}:${playId}`}
              videoSrc={selectedVideo}
              onVideoEnded={processNext}
            />
          )}
          <OverlayPlayer id="tsparticles-mobile" />
          <GiftNotification />
        </div>

        {/* â”€â”€ MOBILE OVERLAYS: TikTok Style (Light Glass) â”€â”€ */}
        <div className="sm:hidden fixed right-2 top-48 bottom-24 w-[130px] z-[90] pointer-events-none flex flex-col items-end gap-1.5">

          {/* Member List */}
          <div className="pointer-events-auto bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-white/[0.05] overflow-hidden flex-col h-fit shadow-2xl">
            <Leaderboard />
          </div>

          {/* Toggle Live Feed Button */}
          <button
            onClick={() => setShowLiveFeed(!showLiveFeed)}
            className="pointer-events-auto w-fit px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/50 text-[9px] font-bold backdrop-blur-md active:scale-95 transition-all mt-1"
          >
            {showLiveFeed ? "Ẩn Chat" : "Hiện Chat"}
          </button>
        </div>

        {/* Mobile Live Feed Overlay */}
        {showLiveFeed && (
          <div className="sm:hidden fixed left-2 bottom-24 right-[140px] top-1/2 z-[90] pointer-events-auto bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-white/[0.05] overflow-hidden shadow-2xl animate-fade-in">
            <TikTokListener />
          </div>
        )}

      </div>

      {/* â”€â”€ RIGHT COLUMN: TikTok Live Feed (Desktop) â”€â”€ */}
      <GlassPanel title="TikTok live feed" className="hidden md:flex w-[300px] xl:w-[340px] shrink-0">
        <TikTokListener />
      </GlassPanel>

    </div>
  );
};

export default HomePage;



