import React from "react";
import { useVideoStore } from "../hooks/useVideoStore";
import TikTokListener from "../components/TikTokListener";
import SelectThumbnail from "../components/SelectThumbnail";
import { BlackScreenVideo } from "../components/BlackScreenVideo";
import Background from "../components/Background";
import ResizableDraggable from "../components/ResizableDraggable";
import VideoGiftPodium from "../components/VideoGiftPodium";
import Leaderboard from "../components/Leaderboard";
import GiftNotification from "../components/GiftNotification";

const HomePage = ({ username }) => {
  const selectedVideo = useVideoStore((state) => state.selectedVideo);
  const dequeueVideo = useVideoStore((state) => state.dequeueVideo);
  const playId = useVideoStore((state) => state.playId);

  return (
    <>
      <div className="relative w-full h-full overflow-hidden">
        {username && (
          <div className="absolute top-8 left-8 z-20 bg-white/[0.03] backdrop-blur-[40px] border border-white/[0.08] text-white px-6 py-3.5 rounded-2xl text-[13px] flex items-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.7)] animate-pulse" />
              <p className="tracking-wide">
                <span className="text-gray-400 uppercase font-extrabold mr-2 text-[10px] tracking-widest">Streamer</span>
                <span className="font-extrabold text-[#d946ef] text-[14px]">@{username}</span>
              </p>
            </div>
          </div>
        )}
        {/* Main Viewport (Animated Intense LED Frame) */}
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
          <div className="relative sm:w-[420px] sm:h-[88%] w-full h-full flex items-center justify-center p-0">

            {/* removed outer led glow */}

            {/* Solid Neon Thick Border Outwards */}
            <div className="absolute inset-0 sm:inset-[-12px] sm:rounded-[3.2rem] overflow-hidden bg-[#18181b] shadow-[0_30px_100px_rgba(0,0,0,1)] pointer-events-auto border border-white/[0.08]">

              {/* Spinning Sharp LED Rays */}
              <div className="absolute inset-0 z-0 flex items-center justify-center mix-blend-screen bg-black/40">
                <div className="w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent_0_300deg,#d946ef_350deg,#fff_360deg)] animate-[spin_4s_linear_infinite]"></div>
              </div>
              <div className="absolute inset-0 z-0 flex items-center justify-center mix-blend-screen bg-black/40">
                <div className="w-[150%] h-[150%] bg-[conic-gradient(from_180deg,transparent_0_300deg,#06b6d4_350deg,#fff_360deg)] animate-[spin_4s_linear_infinite]"></div>
              </div>
            </div>

            {/* Inner Screen */}
            <div className="absolute inset-0 sm:rounded-[2.8rem] bg-black overflow-hidden z-[20] shadow-[inset_0_0_80px_rgba(0,0,0,1)] pointer-events-auto border border-white/10 ring-[6px] ring-[#0a0a0a]">
              <Background imgSrc="/images/background.png" />

              <VideoGiftPodium />

              {selectedVideo && (
                <BlackScreenVideo
                  key={`${selectedVideo}:${playId}`}
                  videoSrc={selectedVideo}
                  onVideoEnded={dequeueVideo}
                />
              )}

              {/* Subtile Screen Interlacing or Glare */}
              <div
                className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.05] to-transparent mix-blend-overlay"
                style={{ zIndex: 60 }}
              ></div>

              <GiftNotification />
            </div>

          </div>
        </div>

        {/* Floating UI Layers */}
        <div className="sm:block hidden">
          <ResizableDraggable
            title="DANCER MODELS"
            initialPos={{ x: 330, y: 70 }}
            initialSize={{ width: 310, height: 430 }}
            minSize={{ width: 180, height: 300 }}
          >
            <div className="h-full bg-transparent overflow-hidden">
              <SelectThumbnail />
            </div>
          </ResizableDraggable>

          <ResizableDraggable
            title="TIKTOK LIVE FEED"
            initialPos={{ x: 1155, y: 70 }}
            initialSize={{ width: 330, height: 460 }}
            minSize={{ width: 220, height: 250 }}
          >
            <div className="h-full bg-transparent overflow-hidden">
              <TikTokListener />
            </div>
          </ResizableDraggable>
          <ResizableDraggable
            title="TOP GIFTS & GIFTERS"
            initialPos={{ x: 18, y: 140 }}
            initialSize={{ width: 305, height: 430 }}
            minSize={{ width: 250, height: 300 }}
          >
            <div className="h-full bg-transparent overflow-hidden">
              <Leaderboard />
            </div>
          </ResizableDraggable>
        </div>
      </div>
    </>
  );
};

export default HomePage;
