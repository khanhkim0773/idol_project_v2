import React from "react";
import { NavLink } from "react-router-dom";
import { MdDashboard, MdOndemandVideo, MdCardGiftcard } from "react-icons/md";
import { IMAGES, ROUTES_URL } from "../../utils/constant";

const Menu = [
  { name: "Dashboard", icon: <MdDashboard />, path: ROUTES_URL.DASHBOARD },
  { name: "Videos", icon: <MdOndemandVideo />, path: ROUTES_URL.UPLOAD },
  { name: "Gifts", icon: <MdCardGiftcard />, path: ROUTES_URL.GIFTS },
];

const Sidebar = () => {
  return (
    <div className="w-[290px] h-full bg-secondary sm:block hidden">
      <div className="w-full h-full flex flex-col gap-5 py-5 ">
        <div className="flex items-center gap-4 px-2 border-b border-white/30 pb-5">
          <img
            src={IMAGES.LOGO}
            alt="Logo"
            className="w-16 h-16 object-contain"
          />
          <div>
            <p className="uppercase text-white text-xl font-bold">
              Live Dancer
            </p>
            <p className="text-sm text-white">Chọn mẫu theo yêu cầu</p>
          </div>
        </div>
        <div className="px-2 flex flex-col gap-4">
          {Menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-white/20 text-neon"
                    : "text-white hover:bg-white/20"
                }`
              }
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xl font-medium">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
