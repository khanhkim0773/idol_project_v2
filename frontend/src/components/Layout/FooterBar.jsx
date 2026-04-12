import React from "react";
import { NavLink } from "react-router-dom";
import { MdCardGiftcard, MdDashboard, MdOndemandVideo } from "react-icons/md";
import { LuSpeech } from "react-icons/lu";
import { ROUTES_URL } from "../../utils/constant";

const Menu = [
  { name: "Dashboard", icon: <MdDashboard />, path: ROUTES_URL.DASHBOARD },
  { name: "Videos", icon: <MdOndemandVideo />, path: ROUTES_URL.UPLOAD },
  { name: "Gifts", icon: <MdCardGiftcard />, path: ROUTES_URL.GIFTS },
  { name: "TTS", icon: <LuSpeech />, path: ROUTES_URL.TTS },
];

const FooterBar = () => {
  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 bg-white/[0.06] backdrop-blur-[40px] border border-white/[0.1] rounded-full sm:hidden z-50 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-1 py-1.5 px-2">
        {Menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 transition-all duration-300 relative group px-3 py-2 rounded-full min-w-[56px] ${isActive
                ? "text-neon bg-white/[0.08]"
                : "text-white/50 hover:text-white"
              }`
            }
          >
            <span className="text-[22px]">{item.icon}</span>
            <span className="text-[8px] font-bold     leading-none">
              {item.name}
            </span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default FooterBar;
