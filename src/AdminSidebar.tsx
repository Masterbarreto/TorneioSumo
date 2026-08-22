import type { ReactNode } from "react";
import svgPaths from "@/imports/DashboardDoTecnico-1/svg-n9wrsd9n43";

type NavKey = "home" | "arenas" | "certificados" | "times" | "partidas" | "rules" | "documents";

interface NavItem {
  key: NavKey;
  label: string;
  iconPath?: string;
  viewBox?: string;
  w?: number;
  h?: number;
  customIcon?: (active: boolean) => ReactNode;
}

const NAV: NavItem[] = [
  { key: "home",        label: "Home",        iconPath: svgPaths.p1154e780, viewBox: "0 0 18.0318 18.5059", w: 18, h: 19 },
  { key: "arenas",      label: "Arenas",      iconPath: svgPaths.p22de3980, viewBox: "0 0 20 20",            w: 20, h: 20 },
  { key: "certificados",label: "Certificados", iconPath: svgPaths.p4c2b800,  viewBox: "0 0 18 18",            w: 18, h: 18 },
  { key: "times",       label: "Times",       iconPath: svgPaths.p39955c80, viewBox: "0 0 22 16",            w: 22, h: 16 },
  {
    key: "partidas", label: "Partidas",
    customIcon: (isActive) => (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 14L6 3L9 9L12 5L17 14H1Z" fill="none" stroke={isActive ? "#1e3a8a" : "#475569"} strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="1" y1="17" x2="17" y2="17" stroke={isActive ? "#1e3a8a" : "#475569"} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  { key: "rules",       label: "Rules",       iconPath: svgPaths.p19ed9400, viewBox: "0 0 18 19",            w: 18, h: 19 },
  { key: "documents",   label: "Documents",   iconPath: svgPaths.pc679c40,  viewBox: "0 0 16 20",            w: 16, h: 20 },
];

export default function AdminSidebar({
  active,
  onNavigate,
  onLogout,
}: {
  active: NavKey;
  onNavigate: (k: NavKey | "logout") => void;
  onLogout: () => void;
}) {
  return (
    <div
      className="fixed top-0 left-0 bg-[#edf4ff] flex flex-col justify-between z-[850]"
      style={{ width: 256, height: "100vh", paddingTop: 80, paddingBottom: 16, paddingLeft: 16, paddingRight: 17, borderRight: "1px solid rgba(194,198,210,0.15)" }}
    >
      {/* Logo — matches imported ROBOTIC_SYNC label */}
      <div className="absolute top-0 left-0 right-0 flex items-center" style={{ height: 64, paddingLeft: 16 }}>
        <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[20px] tracking-[2px] uppercase">ROBOTIC_SYNC</span>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-[4px] flex-1 overflow-y-auto">
        {NAV.map(({ key, label, iconPath, viewBox, w, h, customIcon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`flex items-center w-full px-[16px] py-[12px] rounded-[4px] text-left transition-all duration-150 ${
                isActive
                  ? "bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
                  : "hover:bg-white/50"
              }`}
            >
              {customIcon ? (
                <span className="shrink-0">{customIcon(isActive)}</span>
              ) : (
                <svg width={w} height={h} viewBox={viewBox} fill="none" preserveAspectRatio="none" className="shrink-0">
                  <path d={iconPath} fill={isActive ? "#1e3a8a" : "#475569"} />
                </svg>
              )}
              <span
                className="pl-[12px]"
                style={{
                  fontFamily: isActive ? "'Inter:Bold', Inter, sans-serif" : "'Inter:Regular', Inter, sans-serif",
                  fontWeight: isActive ? 700 : 400,
                  fontSize: 14,
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                  color: isActive ? "#1e3a8a" : "#475569",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
