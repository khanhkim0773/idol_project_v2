import React from "react";
import { useVideoStore } from "../hooks/useVideoStore";
import TikTokListener from "../components/TikTokListener";
import SelectThumbnail from "../components/SelectThumbnail";
import { BlackScreenVideo } from "../components/BlackScreenVideo";
import Background from "../components/Background";
import ResizableDraggable from "../components/ResizableDraggable";
import VideoGiftPodium from "../components/VideoGiftPodium";
import Leaderboard from "../components/Leaderboard";

const HomePage = ({ username }) => {
  const selectedVideo = useVideoStore((state) => state.selectedVideo);
  const dequeueVideo = useVideoStore((state) => state.dequeueVideo);
  const playId = useVideoStore((state) => state.playId);

  return (
    <>
      <div className="relative w-full h-full overflow-hidden">
        {username && (
          <div className="absolute top-6 left-6 z-10 bg-secondary/40 backdrop-blur-md border border-white/10 text-white px-5 py-2.5 rounded-2xl text-xs flex items-center gap-3 shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse" />
              <p className="tracking-wide">
                <span className="opacity-50 uppercase font-bold mr-1">Streamer:</span>
                <span className="font-bold text-luminous-cyan">@{username}</span>
              </p>
            </div>
          </div>
        )}
        {/* Main Viewport (iPhone Frame) */}
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
          <div className="relative sm:w-[390px] sm:h-full w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 rounded-[3.5rem] "></div>
            <div className="relative sm:w-[360px] sm:h-full w-full h-full sm:rounded-[3rem] overflow-hidden pointer-events-auto sm:border-4 border-white/80 bg-black shadow-2xl">
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
                className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10"
                style={{ zIndex: 2 }}
              ></div>
              <div
                className="absolute -top-1/4 -right-1/2 w-full h-[150%] bg-white/5 -rotate-45 blur-sm pointer-events-none"
                style={{ zIndex: 2 }}
              ></div>
            </div>
          </div>
        </div>

        {/* Floating UI Layers */}
        <div className="sm:block hidden">
          <ResizableDraggable
            title="DANCER MODELS"
            initialPos={{ x: 330, y: 80 }}
            initialSize={{ width: 300, height: 400 }}
            minSize={{ width: 180, height: 300 }}
          >
            <SelectThumbnail />
          </ResizableDraggable>

          <ResizableDraggable
            title="TIKTOK LIVE FEED"
            initialPos={{ x: 1180, y: 80 }}
            initialSize={{ width: 320, height: 400 }}
            minSize={{ width: 220, height: 250 }}
          >
            <TikTokListener />
          </ResizableDraggable>
          <ResizableDraggable
            title="TOP GIFTS & GIFTERS"
            initialPos={{ x: 20, y: 80 }}
            initialSize={{ width: 300, height: 400 }}
            minSize={{ width: 250, height: 300 }}
          >
            <Leaderboard />
          </ResizableDraggable>
        </div>
      </div>
    </>
  );
};

export default HomePage;
