import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { MdDashboard, MdOndemandVideo, MdCardGiftcard, MdMenu, MdClose, MdRecentActors, MdAutoAwesome, MdOpenWith, MdRecordVoiceOver } from "react-icons/md";
import { ROUTES_URL } from "../../utils/constant";
import { LuSpeech } from "react-icons/lu";

const Menu = [
  { name: "Dashboard", icon: <MdDashboard />, path: ROUTES_URL.DASHBOARD },
  { name: "Videos (Asset)", icon: <MdOndemandVideo />, path: ROUTES_URL.UPLOAD },
  { name: "Idols", icon: <MdRecentActors />, path: ROUTES_URL.IDOLS },
  { name: "Gifts", icon: <MdCardGiftcard />, path: ROUTES_URL.GIFTS },
  { name: "Overlays", icon: <MdAutoAwesome />, path: ROUTES_URL.OVERLAYS },
  { name: "Gift Zones", icon: <MdOpenWith />, path: ROUTES_URL.ZONES },
  { name: "Text to Speech", icon: <LuSpeech />, path: ROUTES_URL.TTS },
  { name: "MC Assistant", icon: <MdRecordVoiceOver />, path: ROUTES_URL.MC },
];

const NavItems = ({ onClose }) => (
  <div className="flex flex-col gap-2">
    {Menu.map((item) => (
      <NavLink
        key={item.name}
        to={item.path}
        onClick={onClose}
        className={({ isActive }) =>
          `group relative flex items-center gap-4 px-5 py-3 transition-all duration-300 rounded-full overflow-hidden ${isActive
            ? "sidebar-active-gradient"
            : "text-luminous-gray/80 hover:text-white hover:bg-white/[0.03]"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className={`text-xl transition-all duration-300 ${isActive ? "text-[#e2d1ff]" : ""}`}>
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
);

const Sidebar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <div className="hidden sm:flex w-[260px] lg:w-[300px] h-[calc(100vh-2rem)] bg-white/[0.03] backdrop-blur-2xl shrink-0 border border-white/[0.08] relative overflow-hidden my-4 ml-4 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex-col justify-between py-10 px-5 z-10">
        {/* Logo */}
        <div>
          <div className="mb-10 px-4">
            <h1 className="text-[26px] font-bold luminous-text-gradient tracking-tight">
              Luminous
            </h1>
            <p className="text-[9px] tracking-[0.2em] text-luminous-gray/70 mt-0.5 font-bold  ">
              MANAGEMENT
            </p>
          </div>
          <NavItems onClose={() => {}} />
        </div>

        {/* Footer Button */}
        <div className="px-1 pb-4 text-center">
          <button className="w-full h-[52px] rounded-full text-white font-bold text-[13px] luminous-btn-gradient shadow-[0_8px_20px_rgba(217,70,239,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
            Start Stream
          </button>
        </div>
      </div>

      <button
        onClick={() => setDrawerOpen(true)}
        className="sm:hidden fixed top-4 left-4 z-[100] w-11 h-11 flex items-center justify-center rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] text-white/70 shadow-2xl active:scale-95 transition-all"
        aria-label="Open menu"
      >
        <MdMenu size={22} />
      </button>

      {/* ── Mobile Drawer Backdrop ── */}
      {drawerOpen && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile Drawer Panel ── */}
      <div
        className={`sm:hidden fixed top-0 left-0 h-full z-50 w-72 bg-white/[0.03] backdrop-blur-2xl border-r border-white/10 shadow-2xl flex flex-col justify-between py-10 px-5 transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header row */}
        <div>
          <div className="flex items-center justify-between mb-10 px-2">
            <div>
              <h1 className="text-[24px] font-bold luminous-text-gradient tracking-tight">
                Luminous
              </h1>
              <p className="text-[9px] tracking-[0.2em] text-luminous-gray/70 mt-0.5 font-bold  ">
                MANAGEMENT
              </p>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.1] text-gray-400 hover:text-white transition active:scale-90"
            >
              <MdClose size={20} />
            </button>
          </div>
          <NavItems onClose={() => setDrawerOpen(false)} />
        </div>

        {/* Footer */}
        <div className="px-1 pb-4">
          <button className="w-full h-[52px] rounded-full text-white font-bold text-[13px] luminous-btn-gradient shadow-[0_8px_20px_rgba(217,70,239,0.3)] active:scale-[0.98] transition-all duration-300">
            Start Stream
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
