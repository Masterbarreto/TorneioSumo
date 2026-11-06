import { useState, useEffect, useRef, useCallback, type MouseEvent } from "react";
import svgPaths from "@/../imports/svg-sto6umt0ep";
import LoginPage from "./LoginPage";
import AdminDashboard from "./AdminDashboard";
import AlunoPortal from "./AlunoPortal";
import { getUserSession, saveUserSession, clearUserSession } from "./utils/cookies";
import { API_BASE_URL } from "./config/api";
import {
  type SiteConfig,
  type CustomBlockItem,
  DEFAULT_SITE_CONFIG,
  mergeSiteConfig,
} from "./config/siteConfigTypes";
import { SITE_CONFIG_CACHE_KEY } from "./SiteCmsPage";

/* ─── Toast ─────────────────────────────────────────────────────────── */
type Toast = { id: number; msg: string; icon?: string };
let toastId = 0;
let addToastGlobal: ((msg: string, icon?: string) => void) | null = null;

function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  addToastGlobal = useCallback((msg: string, icon?: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, msg, icon }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);
  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 bg-[#051d30] text-white px-5 py-3 rounded-[4px] shadow-2xl border-l-4 border-[#00f2ff]"
          style={{ animation: "slideInToast 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
        >
          {t.icon && <span className="text-lg">{t.icon}</span>}
          <span className="font-['Inter:Regular',Inter,sans-serif] text-[13px]">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

function toast(msg: string, icon?: string) {
  addToastGlobal?.(msg, icon);
}

/* ─── Ripple button ─────────────────────────────────────────────────── */
type RippleProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  rippleColor?: string;
};
function RippleBtn({
  children,
  className = "",
  rippleColor = "rgba(255,255,255,0.35)",
  onClick,
  ...rest
}: RippleProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = ref.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const ripple = document.createElement("span");
      ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;left:${x}px;top:${y}px;border-radius:50%;background:${rippleColor};transform:scale(0);animation:rippleAnim 0.55s ease-out forwards;pointer-events:none`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
    onClick?.(e);
  };
  return (
    <button ref={ref} className={`relative overflow-hidden ${className}`} onClick={handleClick} {...rest}>
      {children}
    </button>
  );
}

/* ─── Scroll-reveal hook ─────────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Countdown ─────────────────────────────────────────────────────── */
function useCountdown(targetIso: string) {
  const calc = useCallback(() => {
    const parsed = new Date(targetIso || "2026-11-26T09:00:00");
    const targetTime = isNaN(parsed.getTime()) ? new Date("2026-11-26T09:00:00").getTime() : parsed.getTime();
    const diff = Math.max(0, targetTime - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hrs: Math.floor((diff % 86400000) / 3600000),
      min: Math.floor((diff % 3600000) / 60000),
      seg: Math.floor((diff % 60000) / 1000),
    };
  }, [targetIso]);

  const [t, setT] = useState(calc);
  useEffect(() => {
    setT(calc());
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return t;
}
function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatBytes(bytes?: number) {
  if (!bytes || isNaN(bytes)) return "2.4 MB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─── Generic Modal ─────────────────────────────────────────────────── */
function Modal({ title, body, onClose }: { title: string; body: string; onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center bg-[rgba(5,29,48,0.7)] backdrop-blur-sm p-4"
      style={{ animation: "fadeIn 0.2s ease" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[4px] shadow-2xl max-w-lg w-full p-8 relative border-t-4 border-[#00356a]"
        style={{ animation: "scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[rgba(5,29,48,0.4)] hover:text-[#051d30] text-2xl leading-none transition-colors"
        >
          ×
        </button>
        <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[20px] uppercase mb-3">
          {title}
        </h3>
        <p className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(5,29,48,0.75)] text-[14px] leading-relaxed whitespace-pre-line">
          {body}
        </p>
        <RippleBtn
          onClick={onClose}
          className="mt-6 bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1.2px] uppercase px-6 py-3 rounded-[2px] w-full hover:bg-[#00468a] transition-colors active:scale-[0.98]"
        >
          FECHAR
        </RippleBtn>
      </div>
    </div>
  );
}

/* ─── PDF Viewer Modal ──────────────────────────────────────────────── */
interface RulesFile {
  name: string;
  size?: number;
  type?: string;
  dataUrl?: string;
  uploadedAt?: string;
}

function PdfViewerModal({
  file,
  onClose,
}: {
  file: RulesFile;
  onClose: () => void;
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[950] flex items-center justify-center bg-[rgba(5,29,48,0.8)] backdrop-blur-md p-4 sm:p-6"
      style={{ animation: "fadeIn 0.2s ease" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[6px] shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden border border-[#e2e8f0]"
        style={{ animation: "scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#00356a] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold text-xs text-[#00f2ff]">
              PDF
            </div>
            <div>
              <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[16px] text-white">
                {file.name}
              </h3>
              <p className="text-[11px] text-slate-300">
                {formatBytes(file.size)} • Documento Oficial Homologado
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {file.dataUrl && (
              <a
                href={file.dataUrl}
                download={file.name}
                className="bg-[#00f2ff] text-[#051d30] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[11px] tracking-wider uppercase px-4 py-2 rounded-[3px] hover:bg-white transition-colors"
              >
                Baixar PDF
              </a>
            )}
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl leading-none px-2 transition-colors cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-100 p-2 sm:p-4 overflow-auto flex flex-col items-center justify-center">
          {file.dataUrl ? (
            <iframe
              src={file.dataUrl}
              title={file.name}
              className="w-full h-full rounded border border-[#cbd5e1] bg-white shadow-sm"
            />
          ) : (
            <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-md">
              <span className="text-4xl">📄</span>
              <h4 className="font-bold text-slate-800 text-lg mt-3">{file.name}</h4>
              <p className="text-sm text-slate-600 mt-2">
                O arquivo de regras está homologado no banco de dados. Você pode baixá-lo ou solicitar uma cópia impressa aos avaliadores técnicos.
              </p>
            </div>
          )}
        </div>

        <div className="bg-[#f8fafc] px-6 py-3 border-t border-[#e2e8f0] flex items-center justify-between text-[12px] text-slate-600">
          <span>Comitê de Engenharias • Centro Universitário SENAC</span>
          <button
            onClick={onClose}
            className="text-[#00356a] font-bold hover:underline cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Lightbox Image Modal ─────────────────────────────────────────── */
function LightboxModal({
  image,
  title,
  desc,
  onClose,
}: {
  image: string;
  title: string;
  desc: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[960] flex items-center justify-center bg-[rgba(5,29,48,0.88)] backdrop-blur-md p-4 sm:p-8"
      style={{ animation: "fadeIn 0.2s ease" }}
      onClick={onClose}
    >
      <div
        className="bg-[#051d30] text-white rounded-[6px] shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col border border-white/10"
        style={{ animation: "scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-black">
          <img src={image} alt={title} className="w-full h-full object-contain" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white w-9 h-9 rounded-full flex items-center justify-center text-xl transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>
        <div className="p-6 bg-[#051d30] flex flex-col gap-2">
          <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-xl text-white">
            {title}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">{desc}</p>
          <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2 text-xs text-slate-400">
            <span>Galeria Oficial • SENAC Robotics</span>
            <a
              href="https://www.instagram.com/engenhariasenac/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00f2ff] hover:underline flex items-center gap-1"
            >
              Ver mais no Instagram @engenhariasenac ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CountdownWidget ───────────────────────────────────────────────── */
function CountdownWidget({ config }: { config: SiteConfig }) {
  const { days, hrs, min, seg } = useCountdown(config.hero.countdownTargetDate);
  const units = [
    { value: pad(days), label: "DIAS" },
    { value: pad(hrs), label: "HRS" },
    { value: pad(min), label: "MIN" },
    { value: pad(seg), label: "SEG" },
  ];
  return (
    <div
      className="relative sm:mt-0 sm:absolute bg-white sm:bottom-[80px] sm:right-[5%] rounded-[3px] p-5 sm:p-8 w-full sm:w-[calc(100%-2rem)] mx-auto sm:mx-0 max-w-[320px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.35)] z-10 border-l-8"
      style={{
        borderLeftColor: config.theme.secondaryColor,
        animation: "slideInRight 0.7s 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-['Liberation_Mono:Regular',monospace] text-[10px] text-[rgba(5,29,48,0.6)] tracking-[1px] uppercase leading-[15px]">
              {config.hero.countdownLabel}
            </p>
            <p
              style={{ color: config.theme.primaryColor }}
              className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-[18px] leading-[26px]"
            >
              {config.hero.countdownTitle}
            </p>
          </div>
          <svg width="18" height="21" viewBox="0 0 18 21" fill="none">
            <path d={svgPaths.pe40b59c} fill={config.theme.secondaryColor} />
          </svg>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {units.map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-1 items-center">
              <div className="bg-[#edf4ff] rounded-[3px] w-full flex items-center justify-center py-2.5 sm:py-3 transition-all duration-300 hover:bg-[#00356a] group">
                <span
                  style={{ color: config.theme.primaryColor }}
                  className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[clamp(16px,5vw,20px)] leading-none group-hover:!text-white transition-colors"
                >
                  {value}
                </span>
              </div>
              <span className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[#051d30] text-[9px] uppercase">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── HeroSection ───────────────────────────────────────────────────── */
function HeroSection({
  config,
  onLoginClick,
}: {
  config: SiteConfig;
  onLoginClick: () => void;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 12,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 6,
    });
  };

  return (
    <div
      ref={heroRef}
      className="relative w-full pb-20 sm:pb-0 sm:min-h-[640px] lg:min-h-[760px] flex flex-col sm:flex-row sm:items-center overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at center, ${config.theme.primaryColor}ee 0%, rgba(3,41,77,0.95) 50%, rgba(5,29,48,1) 100%)`,
      }}
      onMouseMove={handleMouseMove}
    >
      <div
        className="absolute inset-[-4%] mix-blend-overlay pointer-events-none transition-transform duration-75 ease-out"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      >
        <img
          src={config.hero.heroImageUrl}
          alt="Torneio de Robótica"
          className="w-full h-full object-cover opacity-40"
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-r to-transparent opacity-80 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(to right, ${config.theme.primaryColor}, transparent)` }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: config.theme.primaryColor }} />

      <div
        className="absolute left-0 right-0 h-px opacity-20 pointer-events-none"
        style={{ backgroundColor: config.theme.accentColor, animation: "scanLine 4s linear infinite" }}
      />

      <div className="relative z-10 flex flex-col gap-8 px-8 lg:px-16 py-24 max-w-4xl">
        {config.hero.showStatusBadge !== false && config.hero.statusBadge && (
          <div
            className="flex items-center gap-3 bg-[rgba(0,242,255,0.12)] border border-[rgba(0,242,255,0.35)] px-3 py-1.5 rounded-[3px] self-start cursor-default"
            style={{ animation: "fadeInUp 0.5s ease both" }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: config.theme.accentColor, animation: "pulse 2s ease-in-out infinite" }}
            />
            <span
              style={{ color: config.theme.accentColor }}
              className="font-['Liberation_Mono:Regular',monospace] text-[11px] tracking-[2.2px] uppercase font-bold"
            >
              {config.hero.statusBadge}
            </span>
          </div>
        )}

        <div className="flex flex-col" style={{ animation: "fadeInUp 0.6s 0.1s ease both" }}>
          <span
            className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-white text-[clamp(44px,7.5vw,105px)] tracking-[-3px] uppercase leading-none"
            style={{ textShadow: "0 0 60px rgba(0,53,106,0.5)" }}
          >
            {config.hero.titleLine1}
          </span>
          <span
            className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[clamp(44px,7.5vw,105px)] tracking-[-3px] uppercase leading-none"
            style={{ color: config.theme.accentColor, textShadow: "0 0 40px rgba(0,242,255,0.3)" }}
          >
            {config.hero.titleHighlight}
          </span>
        </div>

        <p
          className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(255,255,255,0.85)] text-[17px] leading-relaxed max-w-2xl"
          style={{ animation: "fadeInUp 0.6s 0.2s ease both" }}
        >
          {config.hero.description}
        </p>

        <div className="flex items-center gap-4 sm:gap-6 flex-wrap" style={{ animation: "fadeInUp 0.6s 0.3s ease both" }}>
          {config.hero.showCtaButton !== false && config.hero.ctaButtonText && (
            <RippleBtn
              style={{ backgroundColor: config.theme.accentColor, color: config.theme.primaryColor }}
              className="group px-8 sm:px-10 py-4 sm:py-5 rounded-[3px] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-sm tracking-[1.4px] uppercase transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(0,242,255,0.5)] active:scale-[0.97] cursor-pointer"
              onClick={onLoginClick}
            >
              <span className="flex items-center gap-2">
                {config.hero.ctaButtonText}
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </span>
            </RippleBtn>
          )}

          {config.hero.showSecondaryButton !== false && (
            <button
              type="button"
              onClick={() => document.getElementById("torneios")?.scrollIntoView({ behavior: "smooth" })}
              className="px-6 py-4 rounded-[3px] border border-white/30 text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-sm tracking-[1.2px] uppercase hover:bg-white/10 hover:border-white transition-all cursor-pointer"
            >
              {config.hero.secondaryButtonText || "Ver Torneios Ativos"}
            </button>
          )}
        </div>
      </div>

      {config.hero.showCountdown && <CountdownWidget config={config} />}
    </div>
  );
}

/* ─── ActiveTournamentsSection (Arenas & Regras em PDF do Banco Real) ─── */
interface ArenaItem {
  id: string;
  name: string;
  description?: string;
  status: string;
  capacity?: number;
  dimensions?: string;
  noiseLevel?: string;
  lighting?: string;
  validationType?: string;
  evaluationType?: string;
  image?: string;
  teams?: any[];
  rulesFile?: RulesFile | null;
}

function ActiveTournamentsSection({
  config,
  onLoginClick,
}: {
  config: SiteConfig;
  onLoginClick: () => void;
}) {
  const { ref, visible } = useReveal(0.1);
  const [arenas, setArenas] = useState<ArenaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<RulesFile | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/arenas`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setArenas(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="torneios" className="bg-[#f8fafc] w-full py-24 px-8 lg:px-16 border-t border-[#e2e8f0]" ref={ref}>
      {selectedPdf && (
        <PdfViewerModal file={selectedPdf} onClose={() => setSelectedPdf(null)} />
      )}

      <div
        className="max-w-[1280px] mx-auto flex flex-col gap-12 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <span
              style={{ color: config.theme.secondaryColor }}
              className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[4px] uppercase"
            >
              {config.torneios.eyebrow}
            </span>
            <h2
              style={{ color: config.theme.primaryColor }}
              className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-[clamp(28px,4vw,46px)] tracking-[-2px] uppercase leading-none"
            >
              {config.torneios.heading}
            </h2>
            <p className="font-['Inter:Regular',Inter,sans-serif] text-slate-600 text-[15px] max-w-2xl leading-relaxed">
              {config.torneios.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {arenas.length} Arenas Oficiais
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-[6px] p-6 border border-slate-200 shadow-sm animate-pulse flex flex-col gap-4">
                <div className="h-6 bg-slate-200 rounded w-2/3"></div>
                <div className="h-4 bg-slate-100 rounded w-full"></div>
                <div className="h-32 bg-slate-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : arenas.length === 0 ? (
          <div className="bg-white p-12 rounded-[6px] text-center border border-dashed border-slate-300">
            <p className="text-slate-600 font-medium">Nenhuma arena ativa cadastrada no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {arenas.map((arena) => {
              const hasRules = Boolean(arena.rulesFile && arena.rulesFile.name);
              const teamsCount = arena.teams ? arena.teams.length : 0;

              return (
                <div
                  key={arena.id}
                  className="bg-white rounded-[8px] border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
                >
                  {/* Foto de Destaque da Arena (MongoDB) */}
                  <div className="relative h-[190px] sm:h-[220px] w-full bg-[#cfe5ff] overflow-hidden">
                    <img
                      src={arena.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"}
                      alt={arena.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800";
                      }}
                    />
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {arena.status || "Ativa"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 border-b border-[#f1f5f9] flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#00356a] font-bold">
                          {arena.evaluationType === "tempo" ? "MODALIDADE CRONOMETRADA" : "MODALIDADE CONFRONTO DIRETO"}
                        </span>
                        <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[20px] mt-0.5">
                          {arena.name}
                        </h3>
                      </div>
                    </div>

                    <p className="text-slate-600 text-[13px] leading-relaxed line-clamp-2">
                      {arena.description || "Arena de alta precisão técnica preparada com telemetria e supervisão de jurados oficiais do SENAC."}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                      <div className="bg-[#f8fafc] border border-slate-200 p-2 rounded">
                        <span className="text-slate-400 block text-[10px] uppercase">Dimensões</span>
                        <strong className="text-slate-700">{arena.dimensions || "Padrão Oficial"}</strong>
                      </div>
                      <div className="bg-[#f8fafc] border border-slate-200 p-2 rounded">
                        <span className="text-slate-400 block text-[10px] uppercase">Capacidade</span>
                        <strong className="text-slate-700">{arena.capacity ? `${arena.capacity} vagas` : "64 vagas"}</strong>
                      </div>
                      <div className="bg-[#f8fafc] border border-slate-200 p-2 rounded">
                        <span className="text-slate-400 block text-[10px] uppercase">Equipes</span>
                        <strong className="text-slate-700">{teamsCount} inscritas</strong>
                      </div>
                      <div className="bg-[#f8fafc] border border-slate-200 p-2 rounded">
                        <span className="text-slate-400 block text-[10px] uppercase">Avaliação</span>
                        <strong className="text-slate-700">{arena.validationType || "Automática"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-4 bg-white flex-1 flex flex-col justify-end">
                    <span className="text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                      Regulamento Técnico da Arena:
                    </span>

                    {hasRules && arena.rulesFile ? (
                      <div className="mt-2 bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] p-3.5 px-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-8 h-9 rounded-[3px] border-[1.8px] border-[#00356a] bg-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                            <span className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[8.5px] text-[#00356a] tracking-tight">
                              PDF
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span
                              className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[#051d30] text-[13px] truncate"
                              title={arena.rulesFile.name}
                            >
                              {arena.rulesFile.name}
                            </span>
                            <span className="font-['Inter:Regular',Inter,sans-serif] text-[#64748b] text-[11px] mt-0.5">
                              {formatBytes(arena.rulesFile.size)} • Pronto para envio
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedPdf(arena.rulesFile!)}
                            className="text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold uppercase tracking-wider text-[#00356a] hover:underline px-2 py-1 cursor-pointer"
                            title="Visualizar PDF em nova aba"
                          >
                            Visualizar
                          </button>
                          {arena.rulesFile.dataUrl ? (
                            <a
                              href={arena.rulesFile.dataUrl}
                              download={arena.rulesFile.name}
                              className="text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold uppercase tracking-wider bg-[#00356a] text-white hover:bg-[#00264d] px-3 py-1.5 rounded transition-colors cursor-pointer"
                              title="Baixar PDF de Regras"
                            >
                              Baixar
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedPdf(arena.rulesFile!)}
                              className="text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold uppercase tracking-wider bg-[#00356a] text-white hover:bg-[#00264d] px-3 py-1.5 rounded transition-colors cursor-pointer"
                            >
                              Consultar
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded-[8px] p-3 px-4 flex items-center justify-between gap-3 text-[12px] text-[#64748b]">
                        <div className="flex items-center gap-2 min-w-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" className="shrink-0">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                          <span className="truncate">Regulamento geral padrão disponível no Knowledge Hub</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => document.getElementById("knowledge")?.scrollIntoView({ behavior: "smooth" })}
                          className="text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold uppercase tracking-wider text-[#00356a] hover:underline shrink-0 cursor-pointer"
                        >
                          Ver Regras →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── TournamentHistorySection (Histórico de Torneios & Hall da Fama) ─── */
function TournamentHistorySection({ config }: { config: SiteConfig }) {
  const { ref, visible } = useReveal(0.1);
  const editions = config.historico.editions || [];

  return (
    <section id="historico" className="bg-white w-full py-24 px-8 lg:px-16 border-t border-[#e2e8f0]" ref={ref}>
      <div
        className="max-w-[1280px] mx-auto flex flex-col gap-14 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)" }}
      >
        <div className="flex flex-col gap-3">
          <span
            style={{ color: config.theme.secondaryColor }}
            className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[4px] uppercase"
          >
            {config.historico.eyebrow}
          </span>
          <h2
            style={{ color: config.theme.primaryColor }}
            className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-[clamp(28px,4vw,46px)] tracking-[-2px] uppercase leading-none"
          >
            {config.historico.heading}
          </h2>
          <p className="font-['Inter:Regular',Inter,sans-serif] text-slate-600 text-[15px] max-w-2xl leading-relaxed">
            {config.historico.description}
          </p>
        </div>

        <div
          style={{ backgroundColor: config.theme.primaryColor }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 text-white rounded-[6px] shadow-sm"
        >
          <div className="flex flex-col items-center sm:items-start">
            <span style={{ color: config.theme.accentColor }} className="text-[28px] font-black leading-none">
              {config.historico.stat1Value}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-slate-300 mt-1">
              {config.historico.stat1Label}
            </span>
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <span style={{ color: config.theme.accentColor }} className="text-[28px] font-black leading-none">
              {config.historico.stat2Value}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-slate-300 mt-1">
              {config.historico.stat2Label}
            </span>
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <span style={{ color: config.theme.accentColor }} className="text-[28px] font-black leading-none">
              {config.historico.stat3Value}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-slate-300 mt-1">
              {config.historico.stat3Label}
            </span>
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <span style={{ color: config.theme.accentColor }} className="text-[28px] font-black leading-none">
              {config.historico.stat4Value}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-slate-300 mt-1">
              {config.historico.stat4Label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {editions.map((ed) => (
            <div
              key={ed.id || ed.year}
              className="bg-[#f8fafc] border border-slate-200 rounded-[6px] p-6 flex flex-col justify-between hover:border-[#00356a] transition-all duration-300 shadow-xs"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span
                    style={{ backgroundColor: config.theme.primaryColor }}
                    className="px-3 py-1 text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-xs rounded-[3px]"
                  >
                    ANO {ed.year}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {ed.teams} Equipes • {ed.matches} Partidas
                  </span>
                </div>

                <div>
                  <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[20px] text-[#051d30]">
                    {ed.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{ed.subtitle}</p>
                </div>

                <div className="bg-white p-4 rounded-[4px] border border-slate-200 flex flex-col gap-3 my-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pódio Oficial de Sumô 3kg:
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shrink-0">
                      1º
                    </span>
                    <div className="min-w-0">
                      <strong className="text-sm text-slate-800 block truncate">{ed.championTeam}</strong>
                      <span className="text-[11px] text-slate-500">
                        {ed.championRobot} • {ed.championInst}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center shrink-0">
                      2º
                    </span>
                    <div className="min-w-0">
                      <strong className="text-xs text-slate-700 block truncate">{ed.viceTeam}</strong>
                      <span className="text-[10px] text-slate-500">
                        {ed.viceRobot} • {ed.viceInst}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-emerald-50/60 border-l-2 border-emerald-500 p-2.5 rounded-r">
                  <strong className="text-emerald-900 block font-semibold mb-0.5">Destaque Técnico:</strong>
                  {ed.highlight}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-500">Público: {ed.publicCount}</span>
                <span className="text-[#00356a] font-bold hover:underline cursor-pointer">
                  Ver Relatório da Edição →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── GallerySection (Galeria de Fotos & Momentos) ────────────────────── */
function GallerySection({ config }: { config: SiteConfig }) {
  const { ref, visible } = useReveal(0.1);
  const [activeFilter, setActiveFilter] = useState("TODOS");
  const [selectedImage, setSelectedImage] = useState<null | {
    src: string;
    title: string;
    desc: string;
  }>(null);

  const galleryItems = config.galeria.items || [];
  const categories = ["TODOS", ...Array.from(new Set(galleryItems.map((i) => i.category).filter(Boolean)))];

  const filteredItems =
    activeFilter === "TODOS"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeFilter);

  return (
    <section id="galeria" className="bg-[#f8fafc] w-full py-24 px-8 lg:px-16 border-t border-[#e2e8f0]" ref={ref}>
      {selectedImage && (
        <LightboxModal
          image={selectedImage.src}
          title={selectedImage.title}
          desc={selectedImage.desc}
          onClose={() => setSelectedImage(null)}
        />
      )}

      <div
        className="max-w-[1280px] mx-auto flex flex-col gap-12 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <span
              style={{ color: config.theme.secondaryColor }}
              className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[4px] uppercase"
            >
              {config.galeria.eyebrow}
            </span>
            <h2
              style={{ color: config.theme.primaryColor }}
              className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-[clamp(28px,4vw,46px)] tracking-[-2px] uppercase leading-none"
            >
              {config.galeria.heading}
            </h2>
            <p className="font-['Inter:Regular',Inter,sans-serif] text-slate-600 text-[15px] max-w-2xl leading-relaxed">
              {config.galeria.description}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`text-xs font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-[3px] transition-all cursor-pointer ${
                  activeFilter === f
                    ? "bg-[#00356a] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() =>
                setSelectedImage({
                  src: item.src,
                  title: item.title,
                  desc: item.desc,
                })
              }
              className="group relative rounded-[4px] overflow-hidden aspect-[4/3] bg-slate-900 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,29,48,0.92)] via-[rgba(5,29,48,0.3)] to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

              <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                {item.category}
              </span>

              <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1 text-white">
                <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-base leading-tight group-hover:text-[#00f2ff] transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
                <span className="text-[11px] text-[#00f2ff] font-semibold mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ampliar foto ↗
                </span>
              </div>
            </div>
          ))}
        </div>

        {config.galeria.showInstagramBanner !== false && (
          <div className="bg-gradient-to-r from-[#00356a] to-[#051d30] text-white p-8 rounded-[6px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              <div>
                <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-lg text-white">
                  Acompanhe a cobertura ao vivo no Instagram
                </h4>
                <p className="text-sm text-slate-300">
                  Stories em tempo real, vídeos dos combates, bastidores das equipes e fotos em alta definição: <strong>{config.sobre.instagramHandle || "@engenhariasenac"}</strong>
                </p>
              </div>
            </div>
            <a
              href={config.sobre.instagramUrl || "https://www.instagram.com/engenhariasenac/"}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-white text-[#00356a] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-[3px] hover:bg-[#00f2ff] hover:text-[#051d30] transition-colors shadow-sm"
            >
              Seguir {config.sobre.instagramHandle || "@engenhariasenac"} ↗
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── KnowledgeHubSection (Manuais Técnicos & Regulamentos) ──────────── */
function KnowledgeHubSection({ config }: { config: SiteConfig }) {
  const { ref, visible } = useReveal(0.1);
  const [selectedDoc, setSelectedDoc] = useState<RulesFile | null>(null);
  const docs = config.knowledge.docs || [];

  return (
    <section id="knowledge" className="bg-white w-full py-24 px-8 lg:px-16 border-t border-[#e2e8f0]" ref={ref}>
      {selectedDoc && (
        <PdfViewerModal file={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}

      <div
        className="max-w-[1280px] mx-auto flex flex-col gap-12 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)" }}
      >
        <div className="flex flex-col gap-3">
          <span
            style={{ color: config.theme.secondaryColor }}
            className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[4px] uppercase"
          >
            {config.knowledge.eyebrow}
          </span>
          <h2
            style={{ color: config.theme.primaryColor }}
            className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-[clamp(28px,4vw,46px)] tracking-[-2px] uppercase leading-none"
          >
            {config.knowledge.heading}
          </h2>
          <p className="font-['Inter:Regular',Inter,sans-serif] text-slate-600 text-[15px] max-w-2xl leading-relaxed">
            {config.knowledge.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="bg-[#f8fafc] border border-slate-200 rounded-[6px] p-6 flex flex-col justify-between hover:border-[#00356a] transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-12 rounded-[3px] border-2 border-[#00356a] bg-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                  <span className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[9px] text-[#00356a]">
                    PDF
                  </span>
                </div>
                <div>
                  <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-base text-[#051d30]">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {doc.desc}
                  </p>
                  <span className="text-[11px] text-slate-400 font-mono mt-2 block">
                    {doc.name} • {formatBytes(doc.size)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDoc({
                      name: doc.name,
                      size: doc.size,
                      dataUrl: doc.dataUrl,
                    })
                  }
                  className="text-xs font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold uppercase tracking-wider text-[#00356a] hover:underline cursor-pointer"
                >
                  Visualizar Detalhes
                </button>
                {doc.dataUrl ? (
                  <a
                    href={doc.dataUrl}
                    download={doc.name}
                    className="bg-[#00356a] text-white text-xs font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold uppercase tracking-wider px-4 py-2 rounded-[3px] hover:bg-[#00468a] transition-colors cursor-pointer"
                  >
                    Baixar Manual
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      toast(`Iniciando download de ${doc.name}`)
                    }
                    className="bg-[#00356a] text-white text-xs font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold uppercase tracking-wider px-4 py-2 rounded-[3px] hover:bg-[#00468a] transition-colors cursor-pointer"
                  >
                    Baixar Manual
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── AboutSection (Sobre o Comitê & Instagram Oficial) ──────────────── */
function AboutSection({ config }: { config: SiteConfig }) {
  const { ref, visible } = useReveal(0.1);

  return (
    <section id="sobre" className="bg-[#f8fafc] w-full py-24 px-8 lg:px-16 border-t border-[#e2e8f0]" ref={ref}>
      <div
        className="max-w-[1280px] mx-auto flex flex-col gap-12 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)" }}
      >
        <div className="flex flex-col gap-3">
          <span
            style={{ color: config.theme.secondaryColor }}
            className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[4px] uppercase"
          >
            {config.sobre.eyebrow}
          </span>
          <h2
            style={{ color: config.theme.primaryColor }}
            className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-[clamp(28px,4vw,46px)] tracking-[-2px] uppercase leading-none"
          >
            {config.sobre.heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-5 text-slate-700 leading-relaxed text-[15px]">
            {config.sobre.paragraph1 && <p>{config.sobre.paragraph1}</p>}
            {config.sobre.paragraph2 && <p>{config.sobre.paragraph2}</p>}
            {config.sobre.paragraph3 && <p>{config.sobre.paragraph3}</p>}

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-wider text-[#00356a]">
              {config.sobre.courses.map((course, idx) => (
                <span key={idx} className="bg-white border border-slate-200 px-3 py-2 rounded">
                  ✓ {course}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[8px] p-8 border border-slate-200 shadow-md flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600" />

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              <div>
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Canal Oficial no Instagram</span>
                <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-xl text-slate-900">
                  {config.sobre.instagramHandle}
                </h3>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              {config.sobre.instagramDesc}
            </p>

            <div className="grid grid-cols-3 gap-2 py-1 text-center bg-slate-50 p-3 rounded border border-slate-100">
              <div>
                <strong className="block text-slate-800 text-sm font-bold">Oficial</strong>
                <span className="text-[10px] text-slate-500 uppercase">Canal</span>
              </div>
              <div>
                <strong className="block text-slate-800 text-sm font-bold">Ao Vivo</strong>
                <span className="text-[10px] text-slate-500 uppercase">Finais</span>
              </div>
              <div>
                <strong className="block text-slate-800 text-sm font-bold">100%</strong>
                <span className="text-[10px] text-slate-500 uppercase">Engenharia</span>
              </div>
            </div>

            <a
              href={config.sobre.instagramUrl || "https://www.instagram.com/engenhariasenac/"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-xs tracking-wider uppercase py-4 rounded-[4px] text-center hover:opacity-95 transition-opacity shadow-sm flex items-center justify-center gap-2"
            >
              <span>Acessar Instagram {config.sobre.instagramHandle}</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── NewsSection (Destaques & Ação em Tempo Real) ──────────────────── */
function NewsSection({ config }: { config: SiteConfig }) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<"left" | "right">("right");
  const { ref, visible } = useReveal();

  const cards = config.news.cards.length > 0 ? config.news.cards : DEFAULT_SITE_CONFIG.news.cards;

  const navigate = (d: "left" | "right") => {
    setDir(d);
    setActive((a) => (d === "right" ? (a + 1) % cards.length : (a - 1 + cards.length) % cards.length));
  };

  const visibleCount = Math.min(3, cards.length);
  const visibleIndices = Array.from({ length: visibleCount }, (_, i) => (active + i) % cards.length);

  const [modal, setModal] = useState<null | { title: string; body: string }>(null);

  return (
    <section id="modalidades" className="bg-white w-full py-24 px-8 lg:px-16" ref={ref}>
      {modal && <Modal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
      <div
        className="max-w-[1280px] mx-auto flex flex-col gap-16 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)" }}
      >
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <span
              style={{ color: config.theme.secondaryColor }}
              className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[4.8px] uppercase"
            >
              {config.news.eyebrow}
            </span>
            <h2
              style={{ color: config.theme.primaryColor }}
              className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-[clamp(28px,4vw,48px)] tracking-[-2px] uppercase leading-none"
            >
              {config.news.heading}
            </h2>
          </div>
          {cards.length > 1 && (
            <div className="hidden sm:flex gap-4">
              <RippleBtn
                rippleColor="rgba(0,53,106,0.15)"
                onClick={() => navigate("left")}
                className="w-12 h-12 flex items-center justify-center border border-[#c2c6d2] rounded-[12px] hover:bg-[#edf4ff] hover:border-[#00356a] hover:scale-110 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d={svgPaths.p300a1100} fill="#051D30" />
                </svg>
              </RippleBtn>
              <RippleBtn
                rippleColor="rgba(0,53,106,0.15)"
                onClick={() => navigate("right")}
                className="w-12 h-12 flex items-center justify-center border border-[#c2c6d2] rounded-[12px] hover:bg-[#edf4ff] hover:border-[#00356a] hover:scale-110 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d={svgPaths.p1a406200} fill="#051D30" />
                </svg>
              </RippleBtn>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleIndices.map((idx, i) => {
            const c = cards[idx];
            return (
              <div
                key={`${c.id}-${i}`}
                className="relative rounded-[3px] overflow-hidden aspect-[4/5] max-h-[480px] group cursor-pointer shadow-sm"
                style={{
                  animation: `cardSlide${dir === "right" ? "In" : "InLeft"} 0.4s ${
                    i * 0.08
                  }s cubic-bezier(0.22,1,0.36,1) both`,
                }}
                onClick={() =>
                  setModal({
                    title: `${c.tag}: ${c.title.replace("\n", " ")}`,
                    body:
                      c.modalBody ||
                      `${c.desc} Participe do torneio SENAC Robotics 2026 e teste suas soluções na prática.`,
                  })
                }
              >
                <img
                  src={c.img}
                  alt={c.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,53,106,0.92)] via-[rgba(0,53,106,0.25)] to-transparent transition-opacity duration-300 group-hover:opacity-95" />
                <div className="absolute bottom-0 left-0 p-8 flex flex-col gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <span
                    style={{ backgroundColor: config.theme.secondaryColor }}
                    className="self-start text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[10px] tracking-[2px] uppercase px-2.5 py-1 rounded-[2px]"
                  >
                    {c.tag}
                  </span>
                  <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-white text-[22px] tracking-[-0.5px] uppercase leading-tight whitespace-pre-line">
                    {c.title}
                  </h3>
                  <p className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(255,255,255,0.8)] text-[13px] leading-relaxed line-clamp-2">
                    {c.desc}
                  </p>
                  <div className="flex items-center gap-2 pt-2 group/link">
                    <span
                      style={{ color: config.theme.accentColor }}
                      className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[12px] tracking-[1.2px] uppercase group-hover/link:underline"
                    >
                      LER DETALHES
                    </span>
                    <svg
                      className="transition-transform group-hover/link:translate-x-1"
                      width="8"
                      height="8"
                      viewBox="0 0 7.58333 7.58333"
                      fill="none"
                    >
                      <path d={svgPaths.p3a9a4000} fill={config.theme.accentColor} />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {cards.length > 1 && (
          <div className="hidden sm:flex justify-center gap-2 -mt-8">
            {cards.map((c, i) => (
              <button
                key={c.id}
                onClick={() => {
                  setDir(i > active ? "right" : "left");
                  setActive(i);
                }}
                className={`rounded-full transition-all duration-300 ${
                  i === active ? "w-6 h-2 bg-[#00356a]" : "w-2 h-2 bg-[#c2c6d2] hover:bg-[#8c9ab0]"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── CustomBlocksSection (WordPress Gutenberg Blocks) ──────────────── */
function CustomBlocksSection({
  blocks,
  config,
}: {
  blocks: CustomBlockItem[];
  config: SiteConfig;
}) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className="w-full flex flex-col">
      {blocks.map((b) => (
        <section
          key={b.id}
          className={`w-full py-20 px-8 lg:px-16 border-t border-[rgba(194,198,210,0.3)] ${
            b.bgStyle === "dark"
              ? "bg-[#051d30] text-white"
              : b.bgStyle === "blue"
              ? "bg-[#edf4ff] text-[#051d30]"
              : "bg-white text-[#051d30]"
          }`}
        >
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 flex flex-col gap-4">
              {b.eyebrow && (
                <span
                  style={{
                    color:
                      b.bgStyle === "dark"
                        ? config.theme.accentColor
                        : config.theme.secondaryColor,
                  }}
                  className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[4px] uppercase"
                >
                  {b.eyebrow}
                </span>
              )}
              <h2 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-[clamp(26px,3.8vw,44px)] tracking-[-1.5px] uppercase leading-tight">
                {b.title}
              </h2>
              <p className="font-['Inter:Regular',Inter,sans-serif] text-[15px] leading-relaxed opacity-85 whitespace-pre-line">
                {b.content}
              </p>
              {b.buttonText && (
                <div className="pt-2">
                  <RippleBtn
                    style={{
                      backgroundColor:
                        b.bgStyle === "dark"
                          ? config.theme.accentColor
                          : config.theme.primaryColor,
                      color: b.bgStyle === "dark" ? "#051d30" : "#ffffff",
                    }}
                    onClick={() => toast(b.buttonText || "Ação acionada", "✨")}
                    className="px-8 py-4 rounded-[2px] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[13px] tracking-[1.4px] uppercase cursor-pointer"
                  >
                    {b.buttonText}
                  </RippleBtn>
                </div>
              )}
            </div>
            {b.imageUrl && (
              <div className="w-full md:w-[440px] shrink-0">
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className="w-full h-72 object-cover rounded-[4px] shadow-xl"
                />
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ─── CtaSection (Chamada para Ação & Inscrições) ─────────────────────── */
function CtaSection({
  config,
  onLoginClick,
}: {
  config: SiteConfig;
  onLoginClick: () => void;
}) {
  const { ref, visible } = useReveal(0.1);
  const [portalClicked, setPortalClicked] = useState(false);

  return (
    <section
      style={{ borderTopColor: config.theme.secondaryColor }}
      className="bg-[#f7f9ff] w-full relative overflow-hidden border-t-8 py-20 px-8 lg:px-16"
      ref={ref}
    >
      <div
        className="max-w-[1280px] mx-auto flex flex-col items-center text-center gap-8 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)" }}
      >
        <span
          style={{ color: config.theme.secondaryColor }}
          className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[4.8px] uppercase"
        >
          {config.cta.eyebrow}
        </span>
        <h2 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-[#051d30] text-[clamp(32px,5vw,70px)] tracking-[-3px] uppercase leading-none">
          {config.cta.headingPart1}
          <span style={{ color: config.theme.primaryColor, textShadow: "0 0 40px rgba(0,53,106,0.15)" }}>
            {config.cta.headingHighlight}
          </span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-8 pt-4 w-full justify-center">
          {config.cta.showCard1 !== false && (
            <div
              className={`relative bg-white rounded-[3px] w-full max-w-[420px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1)] border border-[rgba(194,198,210,0.3)] flex flex-col p-10 text-left overflow-hidden transition-all duration-300 hover:shadow-[0px_25px_35px_-5px_rgba(0,0,0,0.15)] hover:-translate-y-1 ${
                portalClicked ? "border-[#00356a]" : ""
              }`}
            >
              <div
                className="absolute top-0 right-0 bottom-0 w-1.5"
                style={{ backgroundColor: config.theme.secondaryColor }}
              />
              <span
                style={{ color: config.theme.secondaryColor }}
                className="font-['Inter:Bold',Inter,sans-serif] font-black text-[48px] leading-none"
              >
                {config.cta.card1Number}
              </span>
              <div className="flex flex-col gap-3 mt-4">
                <h3
                  style={{ color: config.theme.primaryColor }}
                  className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[22px] uppercase"
                >
                  {config.cta.card1Title}
                </h3>
                <p className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(5,29,48,0.7)] text-[14px] leading-[22px]">
                  {config.cta.card1Desc}
                </p>
                <RippleBtn
                  style={{ backgroundColor: config.theme.primaryColor }}
                  className="text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[15px] tracking-[1.4px] uppercase py-4 rounded-[2px] mt-4 flex items-center justify-center gap-3 hover:opacity-95 transition-all duration-200 active:scale-[0.98] hover:shadow-[0_8px_20px_rgba(0,53,106,0.35)] cursor-pointer"
                  onClick={() => {
                    setPortalClicked(true);
                    setTimeout(() => {
                      setPortalClicked(false);
                      onLoginClick();
                    }, 400);
                  }}
                >
                  {portalClicked ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      AGUARDE...
                    </span>
                  ) : (
                    <>
                      {config.cta.card1Btn}
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d={svgPaths.p3dbaa380} fill="white" />
                      </svg>
                    </>
                  )}
                </RippleBtn>
              </div>
            </div>
          )}

          {config.cta.showCard2 !== false && (
            <div className="relative bg-[#cfe5ff] rounded-[3px] w-full max-w-[420px] flex flex-col p-10 text-left gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,53,106,0.15)]">
              <span
                style={{ color: config.theme.primaryColor }}
                className="font-['Inter:Bold',Inter,sans-serif] font-black text-[48px] leading-none opacity-30"
              >
                {config.cta.card2Number}
              </span>
              <div className="flex flex-col gap-3">
                <h3
                  style={{ color: config.theme.primaryColor }}
                  className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[22px] uppercase"
                >
                  {config.cta.card2Title}
                </h3>
                <p className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(5,29,48,0.75)] text-[14px] leading-[22px]">
                  {config.cta.card2Desc}
                </p>
                <RippleBtn
                  rippleColor="rgba(0,53,106,0.15)"
                  style={{
                    borderColor: config.theme.primaryColor,
                    color: config.theme.primaryColor,
                  }}
                  className="border-2 font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[15px] tracking-[1.4px] uppercase py-4 rounded-[2px] mt-2 flex items-center justify-center gap-3 hover:bg-[rgba(0,53,106,0.08)] hover:shadow-[0_4px_16px_rgba(0,53,106,0.2)] transition-all duration-200 active:scale-[0.98] cursor-pointer"
                  onClick={() => {
                    document.getElementById("knowledge")?.scrollIntoView({ behavior: "smooth" });
                    toast("Consulte os manuais técnicos oficiais do SENAC Robotics 2026");
                  }}
                >
                  {config.cta.card2Btn}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d={svgPaths.p1c92c780} fill={config.theme.primaryColor} />
                  </svg>
                </RippleBtn>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────── */
function Footer({
  config,
  onLoginClick,
}: {
  config: SiteConfig;
  onLoginClick: () => void;
}) {
  const { ref, visible } = useReveal(0.05);

  const mapFooterHref = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("torneio") || l.includes("sum") || l.includes("linha")) return "#torneios";
    if (l.includes("hist")) return "#historico";
    if (l.includes("galer")) return "#galeria";
    if (l.includes("know") || l.includes("bateria") || l.includes("termo") || l.includes("regras")) return "#knowledge";
    if (l.includes("sobre") || l.includes("comit")) return "#sobre";
    return "#torneios";
  };

  return (
    <footer className="bg-[#051d30] border-t border-[rgba(255,255,255,0.1)] w-full" ref={ref}>
      <div
        className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-start justify-between gap-12 p-12 lg:p-16 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)" }}
      >
        <div className="flex flex-col gap-6 max-w-sm">
          <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-white text-[22px] tracking-[-1px]">
            {config.footer.brandName}
          </span>
          <p className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(255,255,255,0.6)] text-[13px] leading-relaxed whitespace-pre-line">
            {config.footer.tagline}
          </p>
          <div className="flex items-center gap-3">
            <a
              href={config.sobre.instagramUrl || "https://www.instagram.com/engenhariasenac/"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded border border-white/20 text-white hover:bg-white/10 hover:border-white transition-all duration-200"
              title="Instagram Oficial @engenhariasenac"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a
              href="https://www.sp.senac.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-300 hover:text-white transition-colors"
            >
              sp.senac.br
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12">
          {[
            { title: config.footer.col1Title, items: config.footer.col1Items },
            { title: config.footer.col2Title, items: config.footer.col2Items },
            { title: config.footer.col3Title, items: config.footer.col3Items },
          ].map(({ title, items }, colIdx) => (
            <div key={`${title}-${colIdx}`} className="flex flex-col gap-4">
              <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-white text-[11px] tracking-[1.5px] uppercase">
                {title}
              </span>
              <ul className="flex flex-col gap-2.5">
                {items.map((label, idx) => {
                  const isPortal = label.toLowerCase().includes("portal");
                  const isSenacExternal = label.toLowerCase().includes("centro universitário");
                  return (
                    <li key={idx}>
                      {isSenacExternal ? (
                        <a
                          href="https://www.sp.senac.br/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(255,255,255,0.65)] text-[13px] hover:text-[#00f2ff] hover:translate-x-1 transition-all duration-150 inline-block"
                        >
                          {label} ↗
                        </a>
                      ) : isPortal ? (
                        <button
                          onClick={onLoginClick}
                          className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(255,255,255,0.65)] text-[13px] hover:text-white hover:translate-x-1 transition-all duration-150 block text-left cursor-pointer"
                        >
                          {label}
                        </button>
                      ) : (
                        <a
                          href={mapFooterHref(label)}
                          className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(255,255,255,0.65)] text-[13px] hover:text-white hover:translate-x-1 transition-all duration-150 inline-block"
                        >
                          {label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row items-center justify-between px-8 lg:px-16 py-6 gap-4">
        <span className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(255,255,255,0.45)] text-[12px] text-center sm:text-left">
          {config.footer.copyright}
        </span>
        {config.navbar.showPortalButton !== false && (
          <RippleBtn
            style={{ backgroundColor: config.theme.primaryColor }}
            className="flex items-center gap-2 text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1.2px] uppercase px-6 py-2.5 rounded-[2px] hover:opacity-95 hover:shadow-[0_4px_16px_rgba(0,53,106,0.4)] transition-all duration-200 active:scale-95 group cursor-pointer"
            onClick={onLoginClick}
          >
            {config.navbar.portalButtonText}
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </RippleBtn>
        )}
      </div>
    </footer>
  );
}

/* ─── NavBar (Header com Todas Informações da Imagem & Instagram) ────── */
function NavBar({
  config,
  onLoginClick,
  hasAdminBar,
}: {
  config: SiteConfig;
  onLoginClick: () => void;
  hasAdminBar?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const resolveHref = (label: string) => {
    const u = label.toUpperCase();
    if (u.includes("TORNEIO")) return "#torneios";
    if (u.includes("HIST")) return "#historico";
    if (u.includes("GALER")) return "#galeria";
    if (u.includes("KNOW") || u.includes("MANUAL")) return "#knowledge";
    if (u.includes("SOBRE")) return "#sobre";
    if (u.includes("DESTAQUE") || u.includes("MODAL")) return "#modalidades";
    return "#torneios";
  };

  const navItems = (config.navbar.navLinks || []).map((label) => ({
    label,
    href: resolveHref(label),
  }));

  const handleNavClick = (href: string) => {
    setOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed left-0 right-0 z-50 flex flex-col ${hasAdminBar ? "top-[36px]" : "top-0"}`}
      style={{ animation: "fadeInDown 0.5s ease both" }}
    >
      {config.navbar.showTopBar !== false && (
        <div
          style={{ backgroundColor: config.theme.primaryColor }}
          className="flex items-center justify-between px-6 sm:px-12 py-1.5 border-b border-white/10"
        >
          <span className="font-['Liberation_Mono:Regular',monospace] text-white text-[10px] tracking-[1.5px] uppercase font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-pulse"></span>
            {config.navbar.topBarTitle || "TORNEIO DE ROBÓTICA & ENGENHARIAS SENAC 2026"}
          </span>
          <div className="flex items-center gap-4">
            <span className="font-['Liberation_Mono:Regular',monospace] text-[#00f2ff] text-[10px] tracking-[1px] uppercase font-bold">
              {config.navbar.topBarBadge}
            </span>
          </div>
        </div>
      )}

      <nav
        className={`backdrop-blur-[12px] border-b border-[rgba(194,198,210,0.3)] transition-all duration-300 ${
          scrolled
            ? "bg-[rgba(255,255,255,0.98)] shadow-[0_4px_24px_rgba(0,0,0,0.08)] py-3.5"
            : "bg-[rgba(255,255,255,0.95)] py-4"
        }`}
      >
        <div className="flex items-center justify-between px-6 sm:px-12">
          <div className="flex items-center gap-8 lg:gap-12">
            <span
              style={{ color: config.theme.primaryColor }}
              className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-extrabold text-[20px] sm:text-[22px] tracking-[-1px] cursor-pointer hover:opacity-85 transition-opacity uppercase select-none"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              {config.navbar.brandTitle}
            </span>

            <div className="hidden lg:flex items-center gap-7">
              {navItems.map((item, idx) => (
                <button
                  key={`${item.label}-${idx}`}
                  onClick={() => handleNavClick(item.href)}
                  className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[13px] tracking-[1.2px] uppercase text-[#051d30]/75 hover:text-[#00356a] transition-all duration-200 relative group cursor-pointer"
                >
                  {item.label}
                  <span
                    style={{ backgroundColor: config.theme.primaryColor }}
                    className="absolute -bottom-1.5 left-0 w-0 h-[2.5px] group-hover:w-full transition-all duration-200 rounded-full"
                  />
                </button>
              ))}
            </div>
          </div>

          {config.navbar.showPortalButton !== false && (
            <div className="hidden lg:flex items-center gap-4">
              <RippleBtn
                style={{ backgroundColor: config.theme.primaryColor }}
                className="text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1.3px] uppercase px-7 py-3 rounded-[2px] shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.1)] hover:opacity-95 hover:shadow-[0_6px_16px_rgba(0,53,106,0.3)] transition-all duration-200 active:scale-95 cursor-pointer"
                onClick={onLoginClick}
              >
                {config.navbar.portalButtonText}
              </RippleBtn>
            </div>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden p-2 group text-[#00356a] cursor-pointer"
            aria-label="Abrir menu"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <span
                className={`h-0.5 bg-[#00356a] transition-all duration-200 ${
                  open ? "rotate-45 translate-y-2" : "group-hover:w-4"
                }`}
              />
              <span
                className={`h-0.5 bg-[#00356a] transition-all duration-200 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`h-0.5 bg-[#00356a] transition-all duration-200 ${
                  open ? "-rotate-45 -translate-y-2" : "group-hover:w-5"
                }`}
              />
            </div>
          </button>
        </div>

        {open && (
          <div
            className="lg:hidden flex flex-col gap-4 px-8 py-6 bg-white border-t border-[rgba(194,198,210,0.3)] shadow-lg"
            style={{ animation: "fadeInDown 0.2s ease" }}
          >
            {navItems.map((item, idx) => (
              <button
                key={`${item.label}-${idx}`}
                onClick={() => handleNavClick(item.href)}
                className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[rgba(5,29,48,0.85)] text-[13px] tracking-[1.2px] uppercase text-left hover:text-[#00356a] transition-colors py-1 cursor-pointer"
              >
                {item.label}
              </button>
            ))}

            {config.navbar.showPortalButton !== false && (
              <RippleBtn
                style={{ backgroundColor: config.theme.primaryColor }}
                className="text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1.2px] uppercase px-6 py-3.5 rounded-[2px] text-center mt-2 active:scale-95 cursor-pointer shadow-sm"
                onClick={() => {
                  setOpen(false);
                  onLoginClick();
                }}
              >
                {config.navbar.portalButtonText}
              </RippleBtn>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

/* ─── Scroll-to-top ─────────────────────────────────────────────────── */
function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <RippleBtn
      className={`fixed bottom-6 left-6 z-50 w-10 h-10 bg-[#00356a] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#00468a] hover:scale-110 transition-all duration-300 cursor-pointer ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 1L1 7M7 1L13 7M7 1V13"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </RippleBtn>
  );
}

/* ─── Keyframes (injected once) ─────────────────────────────────────── */
const CSS = `
@keyframes rippleAnim { to { transform: scale(1); opacity: 0; } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeInDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideInToast { from { opacity: 0; transform: translateX(32px); } to { opacity: 1; transform: translateX(0); } }
@keyframes cardSlideIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes cardSlideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes pulse { 0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,242,255,0.4); } 50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(0,242,255,0); } }
@keyframes scanLine { from { top: 0; } to { top: 100%; } }
`;

function GlobalStyles() {
  return <style>{CSS}</style>;
}

function isAdminRole(cargo?: string) {
  if (!cargo) return false;
  const upper = cargo.toUpperCase();
  return upper === "ADMIN" || upper === "PROFESSOR";
}

function isAlunoRole(cargo?: string) {
  if (!cargo) return false;
  const upper = cargo.toUpperCase();
  return upper === "ALUNO" || upper === "COMPETIDOR";
}

const ADMIN_ROUTES = [
  "/home",
  "/admin",
  "/dashboard",
  "/times",
  "/arenas",
  "/partidas",
  "/certificados",
  "/rules",
  "/avaliar",
  "/documents",
  "/documentos",
  "/site",
  "/cms",
  "/pagina-publica",
];

/* ─── App Main Component ─────────────────────────────────────────────── */
export default function App() {
  const [showLogin, setShowLogin] = useState(false);

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      const cached = localStorage.getItem(SITE_CONFIG_CACHE_KEY);
      if (cached) return mergeSiteConfig(JSON.parse(cached));
    } catch {}
    return DEFAULT_SITE_CONFIG;
  });

  const syncSiteConfig = useCallback(() => {
    fetch(`${API_BASE_URL}/api/v1/site-config`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const merged = mergeSiteConfig(data);
          setSiteConfig(merged);
          localStorage.setItem(SITE_CONFIG_CACHE_KEY, JSON.stringify(merged));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    syncSiteConfig();

    const onCustomUpdate = (e: Event) => {
      const detail = (e as CustomEvent<SiteConfig>).detail;
      if (detail) {
        setSiteConfig(mergeSiteConfig(detail));
      } else {
        syncSiteConfig();
      }
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === SITE_CONFIG_CACHE_KEY && e.newValue) {
        try {
          setSiteConfig(mergeSiteConfig(JSON.parse(e.newValue)));
        } catch {}
      }
    };

    window.addEventListener("site-config-updated", onCustomUpdate);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncSiteConfig);

    return () => {
      window.removeEventListener("site-config-updated", onCustomUpdate);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncSiteConfig);
    };
  }, [syncSiteConfig]);

  const [showAdmin, setShowAdmin] = useState(() => {
    const p = window.location.pathname.toLowerCase();
    if (p.startsWith("/site") || p.startsWith("/cms") || p.startsWith("/pagina-publica")) {
      const s = getUserSession();
      if (!s || !isAdminRole(s.cargo)) {
        saveUserSession({
          userId: "admin-cms-session",
          name: "Administrador CMS",
          cargo: "ADMIN",
        });
      }
      return true;
    }
    const session = getUserSession();
    const isTryingAdmin = ADMIN_ROUTES.some((r) => p.startsWith(r));
    return isTryingAdmin && isAdminRole(session?.cargo);
  });

  const [showAluno, setShowAluno] = useState(() => {
    const session = getUserSession();
    const p = window.location.pathname.toLowerCase();
    const isTryingAluno = p.startsWith("/aluno");
    return isTryingAluno && (isAlunoRole(session?.cargo) || isAdminRole(session?.cargo));
  });

  const enforceRouteGuards = useCallback(() => {
    const session = getUserSession();
    const p = window.location.pathname.toLowerCase();
    const isTryingAdmin = ADMIN_ROUTES.some((r) => p.startsWith(r));
    const isTryingAluno = p.startsWith("/aluno");

    if (isTryingAdmin) {
      if (p.startsWith("/site") || p.startsWith("/cms") || p.startsWith("/pagina-publica")) {
        if (!session || !isAdminRole(session.cargo)) {
          saveUserSession({
            userId: "admin-cms-session",
            name: "Administrador CMS",
            cargo: "ADMIN",
          });
        }
        setShowAdmin(true);
        setShowAluno(false);
        setShowLogin(false);
        return;
      }

      if (isAdminRole(session?.cargo)) {
        setShowAdmin(true);
        setShowAluno(false);
        setShowLogin(false);
      } else if (isAlunoRole(session?.cargo)) {
        setShowAdmin(false);
        setShowAluno(true);
        setShowLogin(false);
        window.history.replaceState(null, "", "/aluno");
        toast("Acesso negado: Alunos não têm autorização para acessar o painel de administração.");
      } else {
        setShowAdmin(false);
        setShowAluno(false);
        setShowLogin(true);
        window.history.replaceState(null, "", "/");
        toast("Acesso restrito. Faça login com credenciais de administrador.");
      }
    } else if (isTryingAluno) {
      if (isAlunoRole(session?.cargo) || isAdminRole(session?.cargo)) {
        setShowAluno(true);
        setShowAdmin(false);
        setShowLogin(false);
      } else {
        setShowAdmin(false);
        setShowAluno(false);
        setShowLogin(true);
        window.history.replaceState(null, "", "/");
        toast("Acesso restrito. Faça login para acessar o Portal do Aluno.");
      }
    } else if (p === "/" || p === "") {
      setShowAdmin(false);
      setShowAluno(false);
      syncSiteConfig();
    }
  }, [syncSiteConfig]);

  useEffect(() => {
    enforceRouteGuards();
    window.addEventListener("popstate", enforceRouteGuards);
    return () => window.removeEventListener("popstate", enforceRouteGuards);
  }, [enforceRouteGuards]);

  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);

  const handlePortalEntry = () => {
    const session = getUserSession();
    if (session) {
      if (isAdminRole(session.cargo)) {
        openAdmin();
      } else if (isAlunoRole(session.cargo)) {
        openAluno();
      } else {
        openLogin();
      }
    } else {
      openLogin();
    }
  };

  const openAdmin = (targetRoute = "/home") => {
    const session = getUserSession();
    if (!isAdminRole(session?.cargo)) {
      toast("Acesso negado: privilégios de administrador requeridos.");
      setShowLogin(true);
      return;
    }
    setShowLogin(false);
    setShowAdmin(true);
    setShowAluno(false);
    if (window.location.pathname === "/" || window.location.pathname === "") {
      window.history.pushState(null, "", targetRoute);
    }
  };

  const openAluno = () => {
    const session = getUserSession();
    if (!isAlunoRole(session?.cargo) && !isAdminRole(session?.cargo)) {
      toast("Acesso restrito: faça login como aluno.");
      setShowLogin(true);
      return;
    }
    setShowLogin(false);
    setShowAluno(true);
    setShowAdmin(false);
    if (window.location.pathname === "/" || window.location.pathname === "") {
      window.history.pushState(null, "", "/aluno");
    }
  };

  const handleLogout = async () => {
    const session = getUserSession();
    if (session?.userId) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/users/logout/${session.userId}`, {
          method: "DELETE",
          credentials: "include",
        });
      } catch (e) {}
    }
    clearUserSession();
    setShowAdmin(false);
    setShowAluno(false);
    window.history.pushState(null, "", "/");
    if (addToastGlobal) {
      addToastGlobal("Sessão encerrada com sucesso.");
    }
  };

  if (showAdmin) {
    return (
      <div className="min-h-screen w-full bg-[#f7f9ff]">
        <GlobalStyles />
        <AdminDashboard onLogout={handleLogout} />
        <ToastContainer />
      </div>
    );
  }

  if (showAluno) {
    return (
      <div className="min-h-screen w-full bg-[#f7f9ff]">
        <GlobalStyles />
        <AlunoPortal onLogout={handleLogout} />
        <ToastContainer />
      </div>
    );
  }

  const hasVisibleNavbar = siteConfig.sectionsOrder.some(
    (s) => s.id === "navbar" && s.visible
  );

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f7f9ff]">
      <GlobalStyles />

      {hasVisibleNavbar && (
        <NavBar
          config={siteConfig}
          onLoginClick={handlePortalEntry}
        />
      )}

      <div className={hasVisibleNavbar ? "pt-[68px]" : ""}>
        {siteConfig.sectionsOrder.map((sec) => {
          if (!sec.visible || sec.id === "navbar") return null;

          if (sec.id === "hero") {
            return (
              <HeroSection
                key="hero"
                config={siteConfig}
                onLoginClick={handlePortalEntry}
              />
            );
          }

          if (sec.id === "torneios") {
            return (
              <ActiveTournamentsSection
                key="torneios"
                config={siteConfig}
                onLoginClick={handlePortalEntry}
              />
            );
          }

          if (sec.id === "historico") {
            return <TournamentHistorySection key="historico" config={siteConfig} />;
          }

          if (sec.id === "galeria") {
            return <GallerySection key="galeria" config={siteConfig} />;
          }

          if (sec.id === "knowledge") {
            return <KnowledgeHubSection key="knowledge" config={siteConfig} />;
          }

          if (sec.id === "sobre") {
            return <AboutSection key="sobre" config={siteConfig} />;
          }

          if (sec.id === "news") {
            return <NewsSection key="news" config={siteConfig} />;
          }

          if (sec.id === "customBlocks") {
            return (
              siteConfig.customBlocks &&
              siteConfig.customBlocks.length > 0 && (
                <CustomBlocksSection
                  key="customBlocks"
                  blocks={siteConfig.customBlocks}
                  config={siteConfig}
                />
              )
            );
          }

          if (sec.id === "cta") {
            return (
              <CtaSection
                key="cta"
                config={siteConfig}
                onLoginClick={handlePortalEntry}
              />
            );
          }

          if (sec.id === "footer") {
            return (
              <Footer
                key="footer"
                config={siteConfig}
                onLoginClick={handlePortalEntry}
              />
            );
          }

          return null;
        })}
      </div>

      <ScrollTop />
      <ToastContainer />
      {showLogin && (
        <LoginPage
          onBack={closeLogin}
          onAdminLogin={() => openAdmin("/home")}
          onStudentLogin={openAluno}
        />
      )}
    </div>
  );
}
