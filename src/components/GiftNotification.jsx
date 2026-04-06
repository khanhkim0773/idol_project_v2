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

      // Remove after 3 seconds
      setTimeout(() => {
        setGifts((prev) => prev.filter((g) => g.id !== id));
      }, 3000);
    });

    return () => socket.disconnect();
  }, []);

  if (gifts.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-2.5 z-[100] pointer-events-none w-[90%] max-w-[340px]">
      {gifts.map((g) => (
        <div 
          key={g.id} 
          className="bg-[#0a0a0a]/95 border border-white/10 p-1.5 pr-3 rounded-full flex items-center justify-between gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-[slideInChat_0.3s_ease-out_forwards]"
        >
          <div className="flex items-center gap-2.5 w-full overflow-hidden">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-bold overflow-hidden relative">
              {g.avatar ? (
                <>
                  <span className="text-[13px] uppercase drop-shadow-md z-0">{g.nickname.charAt(0)}</span>
                  <img 
                    src={g.avatar} 
                    alt="avatar" 
                    className="absolute inset-0 w-full h-full rounded-full object-cover z-10" 
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                </>
              ) : (
                <span className="text-[13px] uppercase drop-shadow-md z-0">{g.nickname.charAt(0)}</span>
              )}
            </div>
            
            {/* Context */}
            <div className="flex flex-1 items-center gap-1.5 truncate whitespace-nowrap text-[13px]">
              <span className="text-[#f43f5e] font-extrabold max-w-[100px] sm:max-w-[130px] truncate drop-shadow-sm">{g.nickname}</span>
              <span className="text-gray-300/80">sent</span>
              <span className="text-[#fbbf24] font-black px-0.5">x{g.amount}</span>
              <span className="text-white/90 font-medium truncate drop-shadow-sm">{g.giftName}</span>
            </div>
          </div>
          
          {/* Gift Icon */}
          <div className="text-[20px] shrink-0 drop-shadow-lg">
            🎁
          </div>
        </div>
      ))}
    </div>
  );
};

export default GiftNotification;
