import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../utils/constant";

const GiftNotification = () => {
  const [gifts, setGifts] = useState([]);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("tiktok_gift", (giftData) => {
      const id = Date.now() + Math.random();
      const newGift = {
        id,
        nickname: giftData.nickname || "Anonymous",
        avatar: giftData.profilePicture,
        amount: giftData.amount || 1,
        giftName: giftData.giftName || "Gift",
      };

      setGifts((prev) => [...prev, newGift].slice(-3)); 

      // Remove after 3.5 seconds to feel more smooth
      setTimeout(() => {
        setGifts((prev) => prev.filter((g) => g.id !== id));
      }, 3500);
    });

    return () => socket.disconnect();
  }, []);

  if (gifts.length === 0) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-1.5 z-[100] pointer-events-none w-[90%] sm:w-[85%] max-w-[280px] sm:max-w-[320px]">
      {gifts.map((g) => (
        <div 
          key={g.id} 
          className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-1 pr-4 rounded-full flex items-center gap-3 shadow-2xl animate-[slideInChat_0.4s_ease-out_forwards]"
        >
          {/* Avatar / Icon Container */}
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-[#d946ef] to-[#8b5cf6] overflow-hidden relative border border-white/5">
            {g.avatar ? (
              <img 
                src={g.avatar} 
                alt="" 
                className="absolute inset-0 w-full h-full rounded-full object-cover" 
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
            ) : (
              <span className="text-[10px] font-black text-white uppercase">{g.nickname.charAt(0)}</span>
            )}
          </div>
          
          {/* Info context */}
          <div className="flex flex-1 items-center gap-1.5 truncate text-[10px] sm:text-[12px] py-1">
            <span className="text-white font-black truncate max-w-[80px] sm:max-w-[100px]">{g.nickname}</span>
            <span className="text-white/40 font-medium">sent</span>
            <span className="text-[#fbbf24] font-black scale-110">x{g.amount}</span>
            <span className="text-[#d946ef] font-bold truncate">{g.giftName}</span>
          </div>
          
          {/* Static decoration */}
          <div className="text-[13px] sm:text-[16px] shrink-0">
            🎁
          </div>
        </div>
      ))}
    </div>
  );
};

export default GiftNotification;
