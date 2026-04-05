import React from "react";
import { NavLink } from "react-router-dom";
import { MdDashboard, MdOndemandVideo, MdCardGiftcard } from "react-icons/md";
import { IMAGES, ROUTES_URL } from "../../utils/constant";
import { LuSpeech } from "react-icons/lu";

const Menu = [
  { name: "Dashboard", icon: <MdDashboard />, path: ROUTES_URL.DASHBOARD },
  { name: "Videos", icon: <MdOndemandVideo />, path: ROUTES_URL.UPLOAD },
  { name: "Gifts", icon: <MdCardGiftcard />, path: ROUTES_URL.GIFTS },
  { name: "Text to Speech", icon: <LuSpeech />, path: ROUTES_URL.TTS },
];

const Sidebar = () => {
  return (
    <div className="w-[300px] h-[calc(100vh-2rem)] bg-secondary sm:block hidden border border-white/5 relative overflow-hidden my-4 ml-4 rounded-[2rem] shadow-2xl">
      <div className="w-full h-full flex flex-col justify-between py-10 px-5 relative z-10">
        <div>
          {/* Logo Section */}
          <div className="mb-10 px-4">
            <h1 className="text-[28px] font-black luminous-text-gradient tracking-tight">
              Luminous
            </h1>
            <p className="text-[9px] tracking-[0.2em] text-luminous-gray/70 mt-0.5 font-bold uppercase">
              MANAGEMENT
            </p>
          </div>

          {/* Menu Section */}
          <div className="flex flex-col gap-2">
            {Menu.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-4 px-5 py-3 transition-all duration-300 rounded-full overflow-hidden ${isActive
                    ? "sidebar-active-gradient"
                    : "text-luminous-gray/80 hover:text-white hover:bg-white/[0.03]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`text-[20px] transition-all duration-300 ${isActive ? "text-[#e2d1ff]" : ""}`}>
                      {item.icon}
                    </span>
                    <span className="text-[13px] font-semibold tracking-wide transition-all duration-300">
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Footer Button */}
        <div className="px-1 pb-4 text-center">
          <button className="w-full h-[52px] rounded-full text-white font-bold text-[13px] luminous-btn-gradient shadow-[0_8px_20px_rgba(217,70,239,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
            Start Stream
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
