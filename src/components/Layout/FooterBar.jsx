import React from "react";
import { NavLink } from "react-router-dom";
import { MdCardGiftcard, MdDashboard, MdOndemandVideo } from "react-icons/md";
import { ROUTES_URL } from "../../utils/constant";

const Menu = [
  { name: "Dashboard", icon: <MdDashboard />, path: ROUTES_URL.DASHBOARD },
  { name: "Videos", icon: <MdOndemandVideo />, path: ROUTES_URL.UPLOAD },
    { name: "Gifts", icon: <MdCardGiftcard />, path: ROUTES_URL.GIFTS },
  
];

const FooterBar = () => {
  return (
    <div className="fixed bottom-2 left-0 right-0 backdrop-blur-md border-t border-white/5 rounded-full sm:hidden z-50 w-fit mx-auto">
      <div className="w-full flex items-center gap-10 py-2 px-2">
        {Menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group px-2 py-2 ${
                isActive
                  ? "text-neon"
                  : "text-white/60 hover:text-white"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider">
              {item.name}
            </span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default FooterBar;
