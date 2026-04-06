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
    <div className="h-full w-full bg-[#0d0d1a] relative overflow-hidden flex sm:flex-row flex-col z-10 transition-all duration-500">
      {/* Background blobs (simplified and safely positioned) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[#312e81]/40 blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#0e7490]/30 blur-[100px] translate-x-1/2 translate-y-1/2" />
      </div>

      <Sidebar />

      <div className="flex-1 min-h-0 h-full relative z-10 overflow-hidden">
        <Routes>
          <Route path={ROUTES_URL.DASHBOARD} element={<HomePage username={connectedUsername} />} />
          <Route path={ROUTES_URL.UPLOAD} element={<div className="w-full h-full overflow-y-auto pt-24 pb-12 px-6"><UploadPage /></div>} />
          <Route path={ROUTES_URL.GIFTS} element={<div className="w-full h-full overflow-y-auto pt-24 pb-12 px-6"><GiftPage /></div>} />
          <Route path={ROUTES_URL.TTS} element={<div className="w-full h-full overflow-y-auto pt-24 pb-12 px-6"><ModalTTS /></div>} />
        </Routes>
      </div>
      <FooterBar />
    </div>
  );
};

export default App;
