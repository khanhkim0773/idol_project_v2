import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import ConnectForm from "./components/ConnectForm";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import GiftPage from "./pages/GiftPage";
import { useGiftStore } from "./hooks/useGiftStore";
import Sidebar from "./components/Layout/Sidebar";
import FooterBar from "./components/Layout/FooterBar";
import { ROUTES_URL } from "./utils/constant";

import { useVideoStore } from "./hooks/useVideoStore";
import ModalTTS from "./pages/ModalTTS";

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsername, setConnectedUsername] = useState("");
  const { fetchVideos } = useVideoStore();
  const { fetchGifts } = useGiftStore();

  useEffect(() => {
    fetchVideos();
    fetchGifts();
  }, [fetchVideos, fetchGifts]);

  if (!isConnected) {
    return (
      <div className="w-screen h-screen relative flex items-center justify-center bg-black overflow-hidden">
        {/* Background Image */}
        <img
          src="/images/background.png"
          alt="background"
          className="absolute inset-0 w-full h-full object-cover blur-sm opacity-40 z-0"
        />
        <ConnectForm onConnectSuccess={(username) => {
          setConnectedUsername(username);
          setIsConnected(true);
        }} />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden flex flex-col sm:flex-row">
      {/* Rich gradient background */}
      <div className="absolute inset-0 z-0 bg-[#0d0d1a]">
        {/* Top-left: deep indigo blob */}
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-[#312e81]/80 blur-[80px] pointer-events-none" />
        {/* Bottom-right: teal blob */}
        <div className="absolute -bottom-32 -right-32 w-[700px] h-[700px] rounded-full bg-[#0e7490]/70 blur-[80px] pointer-events-none" />
        {/* Center: purple spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-[#4f46e5]/25 blur-[120px] pointer-events-none" />
        {/* Top-right: pink/rose accent */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] rounded-full bg-[#db2777]/50 blur-[80px] pointer-events-none" />
      </div>

      <Sidebar />
      <div className="flex-1 h-full sm:h-screen sm:px-3 overflow-auto relative z-10">
        <Routes>
          <Route path={ROUTES_URL.DASHBOARD} element={<HomePage username={connectedUsername} />} />
          <Route path={ROUTES_URL.UPLOAD} element={<UploadPage />} />
          <Route path={ROUTES_URL.GIFTS} element={<GiftPage />} />
          <Route path={ROUTES_URL.TTS} element={<ModalTTS />} />
        </Routes>
      </div>
      <FooterBar />
    </div>
  );
};

export default App;
