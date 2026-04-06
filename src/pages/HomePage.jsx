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
      <div className="relative w-full h-full overflow-hidden bg-[#0f0f13]">
        {username && (
          <div className="absolute top-8 left-8 z-20 bg-[#1a1b23]/90 backdrop-blur-md border border-[#2e2f38] text-white px-6 py-3.5 rounded-2xl text-[13px] flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
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
            <div className="absolute inset-0 sm:inset-[-10px] sm:rounded-[3.2rem] overflow-hidden bg-[#050505] shadow-[0_0_100px_rgba(0,0,0,1)] pointer-events-auto">
              
              {/* Spinning Sharp LED Rays */}
              <div className="absolute inset-0 z-0 flex items-center justify-center">
                  <div className="w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_280deg,#d946ef_350deg,#fdf4ff_360deg)] animate-[spin_3s_linear_infinite]"></div>
              </div>
              <div className="absolute inset-0 z-0 flex items-center justify-center">
                  <div className="w-[200%] h-[200%] bg-[conic-gradient(from_180deg,transparent_0_280deg,#06b6d4_350deg,#ecfeff_360deg)] animate-[spin_3s_linear_infinite]"></div>
              </div>
            </div>

            {/* Inner Screen */}
            <div className="absolute inset-0 sm:rounded-[2.6rem] bg-black overflow-hidden z-[20] shadow-[inset_0_0_50px_rgba(0,0,0,0.9)] pointer-events-auto border border-white/5 ring-4 ring-black">
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
            initialPos={{ x: 340, y: 80 }}
            initialSize={{ width: 320, height: 420 }}
            minSize={{ width: 180, height: 300 }}
          >
            <div className="h-full bg-transparent overflow-hidden">
               <SelectThumbnail />
            </div>
          </ResizableDraggable>

          <ResizableDraggable
            title="TIKTOK LIVE FEED"
            initialPos={{ x: 1160, y: 80 }}
            initialSize={{ width: 340, height: 460 }}
            minSize={{ width: 220, height: 250 }}
          >
            <div className="h-full bg-transparent overflow-hidden">
              <TikTokListener />
            </div>
          </ResizableDraggable>
          <ResizableDraggable
            title="TOP GIFTS & GIFTERS"
            initialPos={{ x: 30, y: 150 }}
            initialSize={{ width: 320, height: 420 }}
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
