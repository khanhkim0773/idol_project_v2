import React from "react";
import { useVideoStore } from "../hooks/useVideoStore";
import TikTokListener from "../components/TikTokListener";
import SelectThumbnail from "../components/SelectThumbnail";
import { BlackScreenVideo } from "../components/BlackScreenVideo";
import Background from "../components/Background";

const HomePage = () => {
  const selectedVideo = useVideoStore((state) => state.selectedVideo);
  const dequeueVideo = useVideoStore((state) => state.dequeueVideo);

  return (
    <>
      <div className="flex sm:justify-between w-full sm:p-2 h-full">
        <SelectThumbnail />
        <div className="w-full flex items-center justify-center z-0 pointer-events-none">
          <div className="relative sm:w-[390px] sm:h-[740px] w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 rounded-[3.5rem] animate-pulse bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 blur-[30px] opacity-70"></div>
            <div className="relative sm:w-[360px] sm:h-[720px] w-full h-full sm:rounded-[3rem] overflow-hidden pointer-events-auto sm:border-4 border-white/80 bg-black">
              <Background imgSrc="/images/background.png" />

              {selectedVideo && (
                <BlackScreenVideo
                  videoSrc={selectedVideo}
                  onVideoEnded={dequeueVideo}
                />
              )}

              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10" style={{ zIndex: 2 }}></div>
              <div className="absolute -top-1/4 -right-1/2 w-full h-[150%] bg-white/5 -rotate-45 blur-sm pointer-events-none" style={{ zIndex: 2 }}></div>
            </div>
          </div>
        </div>

        {/* UI Layer */}
        <TikTokListener />
      </div>
    </>
  );
};

export default HomePage;
