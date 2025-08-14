import React, { useState } from "react";
import { Home, MapPinned, Truck, UserRound, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarItem {
  id: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { id: "order", icon: Home, label: "Buyurtmalar", path: "/order" },
  { id: "map", icon: MapPinned, label: "Xarita", path: "/map" },
  { id: "carriers", icon: Truck, label: "Tashuvchilar", path: "/carriers" },
  { id: "drivers", icon: UserRound, label: "Haydovchilar", path: "/drivers" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Faol elementni aniqlash
  const activeItem = sidebarItems.find((item) => {
    const normalizedPath = item.path.endsWith("/") ? item.path.slice(0, -1) : item.path;
    const normalizedLocation = location.pathname.endsWith("/") 
      ? location.pathname.slice(0, -1) 
      : location.pathname;
    return (
      normalizedLocation === normalizedPath ||
      normalizedLocation.startsWith(normalizedPath + "/")
    );
  })?.id || "";

  return (
    <>
      {/* Toggle Button (Mobile) */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden text-indigo-700"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-16 bg-white border-r border-indigo-100
        flex flex-col items-center py-4 space-y-6 z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        md:static md:h-auto md:pt-[100px] md:translate-x-0`}
      >
        {sidebarItems.map(({ id, icon: Icon, path }) => {
          const isActive = activeItem === id;
          return (
            <button
              key={id}
              onClick={() => {
                navigate(path);
                setIsOpen(false);
              }}
              className={`relative flex items-center justify-center w-12 h-12 rounded-lg transition-colors
                ${isActive
                  ? "text-indigo-600 bg-indigo-100"
                  : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              aria-label={id}
            >
              {isActive && (
                <span className="absolute right-0 top-0 h-full w-1 bg-indigo-600 rounded-tr-md rounded-br-md" />
              )}
              {Icon && <Icon size={24} />}
            </button>
          );
        })}
      </aside>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black opacity-40 z-30 md:hidden"
          aria-hidden="true"
        />
      )}
    </>
  );
}