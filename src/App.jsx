import React, { useState } from "react";
import ConnectForm from "./components/ConnectForm";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";


const App = () => {
  const [isConnected, setIsConnected] = useState(false);

  if (isConnected) {
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
      <HomePage />
    </div>
  );
};

export default App;
