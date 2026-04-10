import React, { useEffect } from "react";
import { useVideoStore } from "../hooks/useVideoStore";
import TikTokListener from "../components/TikTokListener";
import SelectThumbnail from "../components/SelectThumbnail";
import { BlackScreenVideo } from "../components/BlackScreenVideo";
import Background from "../components/Background";
import VideoGiftPodium from "../components/VideoGiftPodium";
import Leaderboard from "../components/Leaderboard";
import GiftNotification from "../components/GiftNotification";

/* ─── Reusable Glass Panel ─── */
const GlassPanel = ({ title, children, className = "" }) => (
  <div
    className={`flex flex-col bg-white/[0.06] backdrop-blur-[50px] border border-white/[0.12] rounded-[1.75rem] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] ${className}`}
  >
    {/* Top glow line */}
    <div className="shrink-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

    {/* Header */}
    {title && (
      <div className="shrink-0 h-11 px-5 flex items-center justify-between border-b border-white/[0.08] bg-gradient-to-r from-white/[0.06] to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#d946ef] to-[#06b6d4] shadow-[0_0_8px_rgba(217,70,239,0.7)]" />
          <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-[0.25em] select-none">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-white/10" />
        </div>
      </div>
    )}

    {/* Content */}
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

  // Auto-start or pick favorite on mount
  useEffect(() => {
    if (!selectedVideo) {
      processNext();
    }
  }, [selectedVideo, processNext]);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row items-stretch gap-3 md:gap-4 lg:gap-6 sm:p-3 sm:pt-3 md:p-4 md:pt-4 lg:p-6 lg:pt-6 overflow-hidden">

      {/* ── LEFT COLUMN: Leaderboard + Dancer Models (desktop only) ── */}
      <div className="hidden lg:flex flex-col gap-3 lg:gap-4 w-[280px] xl:w-[320px] shrink-0 min-h-0">

        {/* Streamer badge */}
        {username && (
          <div className="shrink-0 bg-white/[0.04] backdrop-blur-[40px] border border-white/[0.08] text-white px-4 py-2.5 rounded-2xl text-[12px] flex items-center gap-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
            <div className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-pulse shrink-0" />
            <span className="text-gray-400 uppercase font-extrabold text-[9px] tracking-widest">Streamer</span>
            <span className="font-extrabold text-[#d946ef] text-[13px]">@{username}</span>
          </div>
        )}

        {/* Top Gifts Panel */}
        <GlassPanel title="TOP GIFTS & GIFTERS" className="flex-[6] min-h-0">
          <Leaderboard />
        </GlassPanel>

        {/* Dancer Models Panel */}
        <GlassPanel title="DANCER MODELS" className="flex-[4] min-h-0">
          <SelectThumbnail />
        </GlassPanel>
      </div>

      {/* ── CENTER: Phone Frame (desktop) / Full Screen (mobile) ── */}
      <div className="flex-1 flex items-center justify-center min-h-0 min-w-0 relative">

        {/* ─── DESKTOP: LED ring + phone frame ─── */}
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
                <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl py-2 px-3 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.3)]">
                  <span className="text-[10px] font-black text-[#d946ef] uppercase tracking-widest">Đang trình diễn</span>
                  <div className="w-1 h-1 rounded-full bg-white/40" />
                  <span className="text-[12px] font-bold text-white uppercase">{currentGiftName}</span>
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
            <GiftNotification />
          </div>
        </div>

        {/* ─── MOBILE: True full-screen, fixed ─── */}
        <div className="sm:hidden fixed inset-0 z-[10] bg-[#0c0c12] overflow-hidden">
          <Background />
          <VideoGiftPodium />

          {/* Gift Performance Badge */}
          {videoMode === "queue" && currentGiftName && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[100] w-full px-4 pointer-events-none">
              <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl py-2 px-3 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.3)]">
                <span className="text-[10px] font-black text-[#d946ef] uppercase tracking-widest">Đang trình diễn</span>
                <div className="w-1 h-1 rounded-full bg-white/40" />
                <span className="text-[12px] font-bold text-white uppercase">{currentGiftName}</span>
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
          <GiftNotification />
        </div>

        {/* ── Leaderboard overlay mobile: fixed góc giữa-trái ── */}
        <div className="sm:hidden fixed left-0 top-1/2 -translate-y-1/2 z-[90] w-[175px] max-h-[55vh] flex flex-col rounded-r-2xl overflow-hidden shadow-[4px_0_30px_rgba(0,0,0,0.6)]">
          <div className="shrink-0 bg-black/60 backdrop-blur-md px-3 py-2 border-b border-white/10 flex items-center gap-2">
            <span className="text-[13px]">🏆</span>
            <span className="text-[9px] font-extrabold text-[#fbbf24] uppercase tracking-[0.2em]">Top Đại Gia</span>
          </div>
          <div className="flex-1 overflow-hidden bg-black/50 backdrop-blur-md">
            <Leaderboard />
          </div>
        </div>

      </div>

      {/* ── RIGHT COLUMN: TikTok Live Feed (desktop only) ── */}
      <GlassPanel title="TIKTOK LIVE FEED" className="hidden md:flex w-[300px] xl:w-[340px] shrink-0">
        <TikTokListener />
      </GlassPanel>

    </div>
  );
};

export default HomePage;
