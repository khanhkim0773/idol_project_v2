import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import ConnectForm from "./components/ConnectForm";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";

const App = () => {
  const [isConnected, setIsConnected] = useState(false);

  if (!isConnected) {
    return (
      <div className="w-screen h-screen relative flex items-center justify-center bg-black overflow-hidden">
        {/* Background Image */}
        <img
          src="/images/background.png"
          alt="background"
          className="absolute inset-0 w-full h-full object-cover blur-sm opacity-40 z-0"
        />
        <ConnectForm onConnectSuccess={() => setIsConnected(true)} />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-black/80 flex ">
      <Sidebar />
      <div className="flex-1 h-screen sm:py-10 sm:px-3">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
