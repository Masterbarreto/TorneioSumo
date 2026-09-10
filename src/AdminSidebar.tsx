import { useState, type ReactNode } from "react";
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
  { key: "rules",       label: "Avaliar",     iconPath: svgPaths.p19ed9400, viewBox: "0 0 18 19",            w: 18, h: 19 },
  { key: "documents",   label: "Documentos",  iconPath: svgPaths.pc679c40,  viewBox: "0 0 16 20",            w: 16, h: 20 },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-3 left-4 z-[999] w-10 h-10 rounded-[8px] bg-white border border-[#cbd5e1] text-[#00356a] flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-95"
        aria-label="Abrir Menu"
      >
        {mobileOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        )}
      </button>

      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-[840] bg-black/40 backdrop-blur-[2px] transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bg-[#edf4ff] flex flex-col justify-between z-[850] w-[256px] h-screen pt-[80px] pb-4 px-4 border-r border-[rgba(194,198,210,0.15)] transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="absolute top-0 left-0 right-0 flex items-center h-[64px] pl-4">
          <span className="font-['Space_Grotesk'] font-bold text-[#00356a] text-[20px] tracking-[2px] uppercase select-none">
            ROBOTIC_SYNC
          </span>
        </div>

        {/* Main nav */}
        <nav className="flex flex-col gap-[4px] flex-1 overflow-y-auto">
          {NAV.map(({ key, label, iconPath, viewBox, w, h, customIcon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => {
                  onNavigate(key);
                  setMobileOpen(false);
                }}
                className={`flex items-center w-full px-[16px] py-[12px] rounded-[4px] text-left transition-all duration-150 cursor-pointer ${
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

        {/* Bottom Logout Action */}
        <div className="pt-3 border-t border-[rgba(194,198,210,0.3)] shrink-0 mt-2">
          <button
            onClick={() => {
              setMobileOpen(false);
              onLogout();
            }}
            title="Encerrar sessão no sistema"
            className="flex items-center w-full px-[16px] py-[12px] rounded-[6px] text-left transition-all duration-150 text-[#b91c1c] hover:bg-[#fee2e2]/60 cursor-pointer group"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 transition-transform group-hover:-translate-x-0.5"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span
              className="pl-[12px] font-['Inter:Bold',Inter,sans-serif] font-bold text-[13px] tracking-[0.7px] uppercase"
            >
              LOGOFF / SAIR
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
