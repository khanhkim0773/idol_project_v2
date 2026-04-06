import React from "react";
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
  const dequeueVideo = useVideoStore((state) => state.dequeueVideo);
  const playId = useVideoStore((state) => state.playId);

  return (
    <div className="w-full h-full flex items-stretch gap-8 p-6 pt-6 overflow-hidden">

      {/* ── LEFT COLUMN: Leaderboard + Dancer Models (stacked) ── */}
      <div className="flex flex-col gap-4 w-[340px] shrink-0 min-h-0">

        {/* Streamer badge */}
        {username && (
          <div className="shrink-0 bg-white/[0.04] backdrop-blur-[40px] border border-white/[0.08] text-white px-5 py-2.5 rounded-2xl text-[12px] flex items-center gap-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
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

      {/* ── CENTER: Phone Frame ── */}
      <div className="flex-1 flex items-center justify-center min-h-0 min-w-0 relative">
        <div className="relative h-full flex items-center justify-center">
          {/* LED border ring behind phone */}
          <div className="absolute inset-[-12px] rounded-[3.25rem] overflow-hidden bg-[#18181b] shadow-[0_30px_100px_rgba(0,0,0,1)] border border-white/[0.08]">
            <div className="absolute inset-0 z-0 flex items-center justify-center mix-blend-screen bg-black/40">
              <div className="w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent_0_300deg,#d946ef_350deg,#fff_360deg)] animate-[spin_4s_linear_infinite]" />
            </div>
            <div className="absolute inset-0 z-0 flex items-center justify-center mix-blend-screen bg-black/40">
              <div className="w-[150%] h-[150%] bg-[conic-gradient(from_180deg,transparent_0_300deg,#06b6d4_350deg,#fff_360deg)] animate-[spin_4s_linear_infinite]" />
            </div>
          </div>

          {/* Phone screen */}
          <div
            className="relative sm:rounded-[2.8rem] bg-black overflow-hidden z-[20] shadow-[inset_0_0_80px_rgba(0,0,0,1)] border border-white/10 ring-[6px] ring-[#0a0a0a]"
            style={{ aspectRatio: "9/19.5", height: "100%" }}
          >
            <Background imgSrc="/images/background.png" />
            <VideoGiftPodium />
            {selectedVideo && (
              <BlackScreenVideo
                key={`${selectedVideo}:${playId}`}
                videoSrc={selectedVideo}
                onVideoEnded={dequeueVideo}
              />
            )}
            <div
              className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.05] to-transparent mix-blend-overlay"
              style={{ zIndex: 60 }}
            />
            <GiftNotification />
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN: TikTok Live Feed (full height) ── */}
      <GlassPanel title="TIKTOK LIVE FEED" className="w-[360px] shrink-0">
        <TikTokListener />
      </GlassPanel>

    </div>
  );
};

export default HomePage;
