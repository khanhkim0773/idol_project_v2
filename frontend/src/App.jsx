import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import ConnectForm from "./components/ConnectForm";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import GiftPage from "./pages/GiftPage";
import OverlayPage from "./pages/OverlayPage";
import IdolPage from "./pages/IdolPage";
import { useGiftStore } from "./hooks/useGiftStore";
import { useIdolStore } from "./hooks/useIdolStore";
import { useOverlayStore } from "./hooks/useOverlayStore";
import Sidebar from "./components/Layout/Sidebar";

import { ROUTES_URL } from "./utils/constant";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

import { useVideoStore } from "./hooks/useVideoStore";
import ModalTTS from "./pages/ModalTTS";

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsername, setConnectedUsername] = useState("");
  const { fetchVideos } = useVideoStore();
  const { fetchGifts } = useGiftStore();
  const { fetchIdols } = useIdolStore();
  const { fetchOverlays } = useOverlayStore();

  useEffect(() => {
    fetchIdols();
    fetchVideos();
    fetchGifts();
    fetchOverlays();

    // Init tsParticles once
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }, [fetchIdols, fetchVideos, fetchGifts, fetchOverlays]);

  if (!isConnected) {
    return (
      <div className="w-screen h-screen relative flex items-center justify-center bg-[#0a0a14] overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-60 -left-60 w-[1000px] h-[1000px] rounded-full bg-[#4338ca]/30 blur-[120px] opacity-100" />
          <div className="absolute -bottom-60 -right-60 w-[1000px] h-[1000px] rounded-full bg-[#0891b2]/30 blur-[120px] opacity-100" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#7c3aed]/10 blur-[100px] opacity-100" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        </div>

        {/* Background Image */}
        <img
          src="/images/background.png"
          alt="background"
          className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 z-0 scale-110"
        />

        <ConnectForm onConnectSuccess={(username) => {
          setConnectedUsername(username);
          setIsConnected(true);
        }} />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#0d0d1a] relative overflow-x-hidden overflow-y-hidden flex flex-row z-10">
      {/* Rich Cyber-Luxe Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top-left: deep indigo blob */}
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full bg-[#312e81]/60 blur-[100px] opacity-70" />
        
        {/* Bottom-right: teal blob */}
        <div className="absolute -bottom-40 -right-40 w-[800px] h-[800px] rounded-full bg-[#0e7490]/50 blur-[100px] opacity-60" />
        
        {/* Center: intense purple spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-[#4f46e5]/20 blur-[140px]" />
        
        {/* Top-right: pink/fuchsia accent */}
        <div className="absolute top-[-100px] right-[10%] w-[500px] h-[500px] rounded-full bg-[#db2777]/40 blur-[100px] opacity-50" />
        
        {/* Subtle animated overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <Sidebar />

      <div className="flex-1 min-h-0 h-full relative z-10 overflow-hidden">
        <Routes>
          <Route path={ROUTES_URL.DASHBOARD} element={<HomePage username={connectedUsername} />} />
          <Route path={ROUTES_URL.UPLOAD} element={<div className="w-full h-full overflow-y-auto pt-16 sm:pt-20 pb-12 px-4 sm:px-6"><UploadPage /></div>} />
          <Route path={ROUTES_URL.IDOLS} element={<div className="w-full h-full overflow-y-auto pt-16 sm:pt-20 pb-12 px-4 sm:px-6"><IdolPage /></div>} />
          <Route path={ROUTES_URL.GIFTS} element={<div className="w-full h-full overflow-y-auto pt-16 sm:pt-20 pb-12 px-4 sm:px-6"><GiftPage /></div>} />
          <Route path={ROUTES_URL.OVERLAYS} element={<div className="w-full h-full overflow-y-auto pt-16 sm:pt-20 pb-12 px-4 sm:px-6"><OverlayPage /></div>} />
          <Route path={ROUTES_URL.TTS} element={<div className="w-full h-full overflow-y-auto pt-16 sm:pt-20 pb-12 px-4 sm:px-6"><ModalTTS /></div>} />
        </Routes>
      </div>

    </div>
  );
};

export default App;
