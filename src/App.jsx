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

  if (isConnected) {
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
    <div className="w-screen h-screen relative overflow-hidden bg-black/80 flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 h-full sm:h-screen sm:px-3 overflow-auto">
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
