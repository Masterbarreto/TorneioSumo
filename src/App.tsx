import { useState, useEffect, useRef, useCallback, type MouseEvent } from "react";
import svgPaths from "@/../imports/svg-sto6umt0ep";
import LoginPage from "./LoginPage";
import AdminDashboard from "./AdminDashboard";
import DashboardDoTecnico from "./imports/DashboardDoTecnico-1/index";
import AlunoPortal from "./AlunoPortal";
import { getUserSession, clearUserSession } from "./utils/cookies";

/* ─── Images ─────────────────────────────────────────────────────────── */
const IMG_HERO =
  "https://images.unsplash.com/photo-1742767069929-0c663150b164?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600";
const IMG_CARD1 =
  "https://images.unsplash.com/photo-1581092333322-31d2fd38a35e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";
const IMG_CARD2 =
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";
const IMG_CARD3 =
  "https://images.unsplash.com/photo-1678225867994-e7a5b071ebfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";
const IMG_SEGUIDOR =
  "https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600";
const IMG_DANARINO =
  "https://images.unsplash.com/photo-1737228813532-9cd720824ba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600";

/* ─── Toast ───────────────────────────────────────────────────────────── */
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
          className="pointer-events-auto flex items-center gap-3 bg-[#051d30] text-white px-5 py-3 rounded-[2px] shadow-2xl border-l-4 border-[#00f2ff]"
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

/* ─── Ripple button ───────────────────────────────────────────────────── */
type RippleProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  rippleColor?: string;
};
function RippleBtn({ children, className = "", rippleColor = "rgba(255,255,255,0.35)", onClick, ...rest }: RippleProps) {
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

/* ─── Scroll-reveal hook ──────────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Countdown ───────────────────────────────────────────────────────── */
const TARGET_DATE = new Date("2026-11-26T09:00:00");/*confirmar data*/
function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hrs: Math.floor((diff % 86400000) / 3600000),
      min: Math.floor((diff % 3600000) / 60000),
      seg: Math.floor((diff % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, []);
  return t;
}
function pad(n: number) { return String(n).padStart(2, "0"); }

/* ─── Modal ───────────────────────────────────────────────────────────── */
function Modal({ title, body, onClose }: { title: string; body: string; onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, []);
  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center bg-[rgba(5,29,48,0.7)] backdrop-blur-sm"
      style={{ animation: "fadeIn 0.2s ease" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2px] shadow-2xl max-w-md w-full mx-4 p-10 relative border-t-4 border-[#00356a]"
        style={{ animation: "scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[rgba(5,29,48,0.4)] hover:text-[#051d30] text-2xl leading-none transition-colors">×</button>
        <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[22px] uppercase mb-3">{title}</h3>
        <p className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(5,29,48,0.7)] text-[14px] leading-relaxed">{body}</p>
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

/* ─── CountdownWidget ─────────────────────────────────────────────────── */
function CountdownWidget() {
  const { days, hrs, min, seg } = useCountdown(TARGET_DATE);
  const units = [
    { value: pad(days), label: "DIAS" },
    { value: pad(hrs), label: "HRS" },
    { value: pad(min), label: "MIN" },
    { value: pad(seg), label: "SEG" },
  ];
  return (
    <div
      className="absolute bg-white bottom-[80px] right-[5%] rounded-[2px] p-8 w-[310px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.35)] z-10 border-l-8 border-[#8c4f00]"
      style={{ animation: "slideInRight 0.7s 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-['Liberation_Mono:Regular',monospace] text-[10px] text-[rgba(5,29,48,0.6)] tracking-[1px] uppercase leading-[15px]">CONTAGEM REGRESSIVA</p>
            <p className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-[#00356a] text-[18px] leading-[26px]">Torneio de sumo 2026</p>
          </div>
          <svg width="18" height="21" viewBox="0 0 18 21" fill="none">
            <path d={svgPaths.pe40b59c} fill="#8C4F00" />
          </svg>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {units.map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-1 items-center">
              <div className="bg-[#edf4ff] rounded-[2px] w-full flex items-center justify-center py-3 transition-all duration-300 hover:bg-[#00356a] group">
                <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[20px] leading-none group-hover:text-white transition-colors">{value}</span>
              </div>
              <span className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[#051d30] text-[9px] uppercase">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── HeroSection ─────────────────────────────────────────────────────── */
function HeroSection() {
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
      className="relative w-full min-h-[600px] lg:min-h-[740px] flex items-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, rgba(0,53,106,0.8) 0%, rgba(3,41,77,0.9) 50%, rgba(5,29,48,1) 100%)" }}
      onMouseMove={handleMouseMove}
    >
      {/* parallax bg */}
      <div
        className="absolute inset-[-4%] mix-blend-overlay pointer-events-none transition-transform duration-75 ease-out"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      >
        <img src={IMG_HERO} alt="" className="w-full h-full object-cover opacity-40" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#00356a] to-transparent opacity-80 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00356a]" />

      {/* Glowing scan line */}
      <div className="absolute left-0 right-0 h-px bg-[#00f2ff] opacity-20 pointer-events-none" style={{ animation: "scanLine 4s linear infinite" }} />

      <div className="relative z-10 flex flex-col gap-8 px-8 lg:px-16 py-24 max-w-4xl">
        {/* Status badge */}
        <div
          className="flex items-center gap-3 bg-[rgba(0,242,255,0.1)] border border-[rgba(0,242,255,0.3)] px-3 py-1 rounded-[2px] self-start cursor-default"
          style={{ animation: "fadeInUp 0.5s ease both" }}
        >
          <div className="w-2 h-2 rounded-full bg-[#00f2ff]" style={{ animation: "pulse 2s ease-in-out infinite" }} />
          <span className="font-['Liberation_Mono:Regular',monospace] text-[#00f2ff] text-[11px] tracking-[2.2px] uppercase">STATUS: INSCRIÇÕES NACIONAIS ABERTAS</span>
        </div>

        {/* Heading */}
        <div className="flex flex-col" style={{ animation: "fadeInUp 0.6s 0.1s ease both" }}>
          <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-white text-[clamp(56px,8vw,120px)] tracking-[-4px] uppercase leading-none" style={{ textShadow: "0 0 60px rgba(0,53,106,0.5)" }}>Torneio de </span>
          <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00f2ff] text-[clamp(56px,8vw,120px)] tracking-[-4px] uppercase leading-none" style={{ textShadow: "0 0 40px rgba(0,242,255,0.3)" }}>Sumo</span>
        </div>

        {/* Description */}
        <p
          className="font-['Inter:Light',Inter,sans-serif] font-light text-[rgba(255,255,255,0.8)] text-[18px] leading-relaxed max-w-2xl"
          style={{ animation: "fadeInUp 0.6s 0.2s ease both" }}
        >
          Participe do torneio de sumo e teste suas habilidades em robótica, programação e estratégia. Forme sua equipe, construa seu robô e prepare-se para a competição!
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-6 flex-wrap" style={{ animation: "fadeInUp 0.6s 0.3s ease both" }}>
          <RippleBtn
            className="group bg-[#00f2ff] px-10 py-5 rounded-[2px] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-sm tracking-[1.4px] uppercase transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_0_24px_rgba(0,242,255,0.5)] active:scale-[0.97]"
            onClick={() => { document.getElementById("modalidades")?.scrollIntoView({ behavior: "smooth" }); toast("Role para ver as modalidades!", "🤖"); }}
          >
            <span className="flex items-center gap-2">
              INSCREVER EQUIPE
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </span>
          </RippleBtn>
          <div className="flex flex-col cursor-default">
            <span className="font-['Liberation_Mono:Regular',monospace] text-[rgba(255,255,255,0.5)] text-[10px] tracking-[1px] uppercase">Em novembro</span>
            <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-white text-[18px] mt-1">Final: 26.11.2026</span> 
          </div>
        </div>
      </div>

      <CountdownWidget />
    </div>
  );
}

/* ─── NewsSection ─────────────────────────────────────────────────────── */
function NewsSection() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<"left" | "right">("right");
  const { ref, visible } = useReveal();

  const cards = [
    { img: IMG_CARD1, tag: "EDUCAÇÃO", title: "LIDERANÇA JOVEM NA\nENGENHARIA", desc: "Competidores de todo o país aplicam conceitos avançados de eletrônica e programação." },
    { img: IMG_CARD2, tag: "COMPETIÇÃO", title: "O ESPÍRITO DA EQUIPE", desc: "Colaboração e resolução de problemas técnicos sob pressão nas finais regionais." },
    { img: IMG_CARD3, tag: "INOVAÇÃO", title: "PROTÓTIPOS INTELIGENTES", desc: "Nova categoria de veículos autônomos desafia limites da percepção computacional." },
  ];

  const navigate = (d: "left" | "right") => {
    setDir(d);
    setActive((a) => d === "right" ? (a + 1) % cards.length : (a - 1 + cards.length) % cards.length);
  };

  const visible3 = [active, (active + 1) % cards.length, (active + 2) % cards.length];

  const [modal, setModal] = useState<null | { title: string; body: string }>(null);

  return (
    <section className="bg-white w-full py-24 px-8 lg:px-16" ref={ref}>
      {modal && <Modal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
      <div
        className="max-w-[1280px] mx-auto flex flex-col gap-16 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)" }}
      >
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#8c4f00] text-[12px] tracking-[4.8px] uppercase">DESTAQUES &amp; NOVIDADES</span>
            <h2 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-[#00356a] text-[clamp(28px,4vw,48px)] tracking-[-2px] uppercase leading-none">AÇÃO EM TEMPO REAL</h2>
          </div>
          <div className="flex gap-4">
            <RippleBtn rippleColor="rgba(0,53,106,0.15)" onClick={() => navigate("left")} className="w-12 h-12 flex items-center justify-center border border-[#c2c6d2] rounded-[12px] hover:bg-[#edf4ff] hover:border-[#00356a] hover:scale-110 transition-all duration-200 active:scale-95">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d={svgPaths.p300a1100} fill="#051D30" /></svg>
            </RippleBtn>
            <RippleBtn rippleColor="rgba(0,53,106,0.15)" onClick={() => navigate("right")} className="w-12 h-12 flex items-center justify-center border border-[#c2c6d2] rounded-[12px] hover:bg-[#edf4ff] hover:border-[#00356a] hover:scale-110 transition-all duration-200 active:scale-95">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d={svgPaths.p1a406200} fill="#051D30" /></svg>
            </RippleBtn>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible3.map((idx, i) => {
            const c = cards[idx];
            return (
              <div
                key={`${active}-${i}`}
                className="relative rounded-[2px] overflow-hidden aspect-[4/5] max-h-[480px] group cursor-pointer"
                style={{ animation: `cardSlide${dir === "right" ? "In" : "InLeft"} 0.4s ${i * 0.08}s cubic-bezier(0.22,1,0.36,1) both` }}
                onClick={() => setModal({ title: c.tag + ": " + c.title.replace("\n", " "), body: c.desc + " Clique no botão abaixo para saber mais sobre esta categoria de competição no torneio SENAC Robotics 2026." })}
              >
                <img src={c.img} alt={c.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,53,106,0.9)] via-[rgba(0,53,106,0.2)] to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                <div className="absolute bottom-0 left-0 p-8 flex flex-col gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="bg-[#8c4f00] text-white text-[10px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[1px] uppercase px-2 py-1 self-start">{c.tag}</span>
                  <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-white text-[22px] uppercase leading-[1.2] whitespace-pre-line mt-1">{c.title}</h3>
                  <p className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(255,255,255,0.7)] text-[14px] leading-[20px] max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-300 overflow-hidden">{c.desc}</p>
                  <div className="flex items-center gap-2 pt-2 group/link">
                    <span className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[#00f2ff] text-[12px] tracking-[1.2px] uppercase group-hover/link:underline">LEIA MAIS</span>
                    <svg className="transition-transform group-hover/link:translate-x-1" width="8" height="8" viewBox="0 0 7.58333 7.58333" fill="none">
                      <path d={svgPaths.p3a9a4000} fill="#00F2FF" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 -mt-8">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDir(i > active ? "right" : "left"); setActive(i); }}
              className={`rounded-full transition-all duration-300 ${i === active ? "w-6 h-2 bg-[#00356a]" : "w-2 h-2 bg-[#c2c6d2] hover:bg-[#8c9ab0]"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CtaSection ──────────────────────────────────────────────────────── */
function CtaSection({ onLoginClick }: { onLoginClick: () => void }) {
  const { ref, visible } = useReveal(0.1);
  const [portalClicked, setPortalClicked] = useState(false);

  return (
    <section className="bg-[#f7f9ff] w-full relative overflow-hidden border-t-8 border-[#8c4f00]" ref={ref}>
      <div className="absolute inset-2 opacity-30 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(0,75,147,0.1) 0%, transparent 70%)" }} />
      <div
        className="relative z-10 py-32 px-8 lg:px-32 flex flex-col items-center text-center gap-8 max-w-[1024px] mx-auto transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(50px)" }}
      >
        <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[14px] tracking-[7px] uppercase">PRONTO PARA O DESAFIO?</span>
        <h2 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-[#051d30] text-[clamp(36px,6vw,80px)] tracking-[-3px] uppercase leading-none">
          SUA JORNADA TÉCNICA{" "}
          <span className="text-[#00356a]" style={{ textShadow: "0 0 40px rgba(0,53,106,0.15)" }}>COMEÇA AQUI.</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-8 pt-4 w-full justify-center">
          {/* Portal card */}
          <div className={`relative bg-white rounded-[2px] w-full max-w-[420px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1)] border border-[rgba(194,198,210,0.3)] flex flex-col p-10 text-left overflow-hidden transition-all duration-300 hover:shadow-[0px_25px_35px_-5px_rgba(0,0,0,0.15)] hover:-translate-y-1 ${portalClicked ? "border-[#00356a]" : ""}`}>
            <div className="absolute top-0 right-0 bottom-0 w-1 bg-[#8c4f00]" />
            <span className="font-['Inter:Bold',Inter,sans-serif] font-black text-[#8c4f00] text-[48px] leading-none">01.</span>
            <div className="flex flex-col gap-3 mt-4">
              <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[22px] uppercase">PORTAL DO COMPETIDOR</h3>
              <p className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(5,29,48,0.7)] text-[14px] leading-[22px]">
                Gerencie sua equipe, envie documentação técnica e acompanhe rankings nacionais em tempo real através do dashboard oficial.
              </p>
              <RippleBtn
                className="bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[16px] tracking-[1.6px] uppercase py-5 rounded-[2px] mt-4 flex items-center justify-center gap-3 hover:bg-[#00468a] transition-all duration-200 active:scale-[0.98] hover:shadow-[0_8px_20px_rgba(0,53,106,0.35)] group"
                onClick={() => { setPortalClicked(true); setTimeout(() => { setPortalClicked(false); onLoginClick(); }, 900); }}
              >
                {portalClicked ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    AGUARDE...
                  </span>
                ) : (
                  <>
                    ENTRAR NO PORTAL
                    <svg className="transition-transform group-hover:translate-x-1" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d={svgPaths.p3dbaa380} fill="white" />
                    </svg>
                  </>
                )}
              </RippleBtn>
            </div>
          </div>

          {/* Manuais card */}
          <div className="relative bg-[#cfe5ff] rounded-[2px] w-full max-w-[420px] flex flex-col p-10 text-left gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,53,106,0.15)]">
            <span className="font-['Inter:Bold',Inter,sans-serif] font-black text-[#00356a] text-[48px] leading-none opacity-30">02.</span>
            <div className="flex flex-col gap-3">
              <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[22px] uppercase">MANUAIS TÉCNICOS</h3>
              <p className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(5,29,48,0.7)] text-[14px] leading-[22px]">
                Baixe as regras oficiais de 2026 e os padrões de certificação exigidos para participação em cada uma das modalidades.
              </p>
              <RippleBtn
                rippleColor="rgba(0,53,106,0.15)"
                className="border-2 border-[#00356a] text-[#00356a] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[16px] tracking-[1.6px] uppercase py-5 rounded-[2px] mt-2 flex items-center justify-center gap-3 hover:bg-[rgba(0,53,106,0.08)] hover:shadow-[0_4px_16px_rgba(0,53,106,0.2)] transition-all duration-200 active:scale-[0.98] group"
                onClick={() => toast("Download iniciado — regras SENAC Robotics 2026.pdf", "📥")}
              >
                DOWNLOAD DOCS
                <svg className="transition-transform group-hover:translate-y-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d={svgPaths.p1c92c780} fill="#00356A" />
                </svg>
              </RippleBtn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────────── */
function Footer({ onLoginClick }: { onLoginClick: () => void }) {
  const { ref, visible } = useReveal(0.05);
  const campeonato = ["Calendário 2026", "Regras Gerais", "Premiações", "Hall da Fama"];
  const institucional = ["Sobre o SENAC", "Comitê de Engenharia", "Transparência", "Contato"];
  const legal = ["Privacidade", "Termos de Uso", "LGPD"];

  return (
    <footer className="bg-[#051d30] border-t border-[rgba(255,255,255,0.1)] w-full" ref={ref}>
      <div
        className="flex flex-col lg:flex-row items-start justify-between gap-12 p-16 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)" }}
      >
        <div className="flex flex-col gap-6 max-w-xs">
          <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-white text-[22px] tracking-[-1px]">SENAC ROBOTICS</span>
          <p className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(255,255,255,0.5)] text-[12px] leading-relaxed">
            © 2026 Senac Engineering Committee.<br />Architecting the future of precision systems.
          </p>
          <div className="flex gap-4">
            {[svgPaths.p313c6040, svgPaths.p1c659f80].map((d, i) => (
              <RippleBtn
                key={i}
                rippleColor="rgba(255,255,255,0.15)"
                className="w-10 h-10 flex items-center justify-center border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,255,255,0.05)] hover:scale-110 transition-all duration-200 active:scale-95"
                onClick={() => toast(i === 0 ? "Abrindo LinkedIn..." : "Abrindo Instagram...", i === 0 ? "💼" : "📸")}
              >
                <svg width={i === 0 ? 10 : 12} height={i === 0 ? 12 : 10} viewBox={i === 0 ? "0 0 10.5 11.6667" : "0 0 11.6667 9.33333"} fill="none">
                  <path d={d} fill="white" />
                </svg>
              </RippleBtn>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-12">
          {[
            { title: "CAMPEONATO", items: campeonato },
            { title: "INSTITUCIONAL", items: institucional },
            { title: "LEGAL", items: legal },
          ].map(({ title, items }) => (
            <div key={title} className="flex flex-col gap-6">
              <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-white text-[10px] tracking-[1px] uppercase">{title}</span>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item}>
                    <button
                      className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(255,255,255,0.6)] text-[12px] hover:text-white hover:translate-x-1 transition-all duration-150 block text-left"
                      onClick={() => toast(item, "📄")}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between px-16 py-5">
        <span className="font-['Inter:Regular',Inter,sans-serif] text-[rgba(255,255,255,0.3)] text-[11px]">© 2026 SENAC Robotics. Todos os direitos reservados.</span>
        <RippleBtn
          className="flex items-center gap-2 bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1.2px] uppercase px-5 py-2.5 rounded-[2px] hover:bg-[#00468a] hover:shadow-[0_4px_16px_rgba(0,53,106,0.4)] transition-all duration-200 active:scale-95 group"
          onClick={onLoginClick}
        >
          ENTRAR NO PORTAL
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </RippleBtn>
      </div>

    </footer>
  );
}

/* ─── NavBar ──────────────────────────────────────────────────────────── */
function NavBar({ onLoginClick }: { onLoginClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeLink, setActiveLink] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["TORNEIOS", "KNOWLEDGE HUB", "SOBRE"];
  const handleLink = (l: string) => {
    setActiveLink(l);
    toast(`Navegando para ${l}`, "🔗");
    setOpen(false);
    setTimeout(() => setActiveLink(null), 600);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col" style={{ animation: "fadeInDown 0.5s ease both" }}>
      <div className="bg-[#00356a] flex justify-end">
        <span className="font-['Liberation_Mono:Regular',monospace] text-white text-[10px] tracking-[1px] uppercase px-8 py-1">INSCRIÇÕES ABERTAS</span>
      </div>
      <nav className={`backdrop-blur-[12px] border-b border-[rgba(194,198,210,0.3)] transition-all duration-300 ${scrolled ? "bg-[rgba(255,255,255,0.97)] shadow-[0_4px_24px_rgba(0,0,0,0.08)]" : "bg-[rgba(255,255,255,0.8)]"}`}>
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-10">
            <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[20px] tracking-[-1px] cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              SENAC ROBOTICS
            </span>
            <div className="hidden lg:flex items-center gap-8">
              {links.map((l) => (
                <button
                  key={l}
                  onClick={() => handleLink(l)}
                  className={`font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1.2px] uppercase transition-all duration-200 relative group ${activeLink === l ? "text-[#00356a]" : "text-[rgba(5,29,48,0.7)] hover:text-[#00356a]"}`}
                >
                  {l}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#00356a] group-hover:w-full transition-all duration-200" />
                </button>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <RippleBtn
              className="bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1.2px] uppercase px-6 py-2.5 rounded-[2px] shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.1)] hover:bg-[#00468a] hover:shadow-[0_6px_16px_rgba(0,53,106,0.3)] transition-all duration-200 active:scale-95"
              onClick={onLoginClick}
            >
              ENTRAR NO PORTAL
            </RippleBtn>
          </div>
          <button onClick={() => setOpen((o) => !o)} className="lg:hidden p-2 group">
            <div className="w-6 flex flex-col gap-1.5">
              <span className={`h-0.5 bg-[#00356a] transition-all duration-200 ${open ? "rotate-45 translate-y-2" : "group-hover:w-4"}`} />
              <span className={`h-0.5 bg-[#00356a] transition-all duration-200 ${open ? "opacity-0" : ""}`} />
              <span className={`h-0.5 bg-[#00356a] transition-all duration-200 ${open ? "-rotate-45 -translate-y-2" : "group-hover:w-5"}`} />
            </div>
          </button>
        </div>
        {open && (
          <div className="lg:hidden flex flex-col gap-4 px-8 pb-6 border-t border-[rgba(194,198,210,0.3)]" style={{ animation: "fadeInDown 0.2s ease" }}>
            {links.map((l) => (
              <button key={l} onClick={() => handleLink(l)} className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[rgba(5,29,48,0.7)] text-[12px] tracking-[1.2px] uppercase text-left hover:text-[#00356a] transition-colors">
                {l}
              </button>
            ))}
            <RippleBtn
              className="bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1.2px] uppercase px-6 py-3 rounded-[2px] text-center mt-2 active:scale-95"
              onClick={() => { setOpen(false); onLoginClick(); }}
            >
              ENTRAR NO PORTAL
            </RippleBtn>
          </div>
        )}
      </nav>
    </header>
  );
}

/* ─── Scroll-to-top ───────────────────────────────────────────────────── */
function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <RippleBtn
      className={`fixed bottom-6 left-6 z-50 w-10 h-10 bg-[#00356a] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#00468a] hover:scale-110 transition-all duration-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1L1 7M7 1L13 7M7 1V13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </RippleBtn>
  );
}

/* ─── Keyframes (injected once) ───────────────────────────────────────── */
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

/* ─── App ─────────────────────────────────────────────────────────────── */
export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(() => {
    const session = getUserSession();
    if (session && (session.cargo === "ADMIN" || session.cargo === "PROFESSOR" || session.cargo === "admin")) {
      return true;
    }
    const p = window.location.pathname.toLowerCase();
    const adminRoutes = ["/home", "/admin", "/dashboard", "/times", "/arenas", "/partidas", "/certificados", "/rules", "/avaliar"];
    return adminRoutes.some(r => p.startsWith(r));
  });
  const [showAluno, setShowAluno] = useState(() => {
    const session = getUserSession();
    if (session && (session.cargo === "ALUNO" || session.cargo === "COMPETIDOR" || session.cargo === "aluno")) {
      return true;
    }
    return window.location.pathname.toLowerCase().startsWith("/aluno");
  });

  useEffect(() => {
    const onPopState = () => {
      const session = getUserSession();
      const p = window.location.pathname.toLowerCase();
      const adminRoutes = ["/home", "/admin", "/dashboard", "/times", "/arenas", "/partidas", "/certificados", "/rules", "/avaliar"];
      if (adminRoutes.some(r => p.startsWith(r))) {
        setShowAdmin(true);
        setShowAluno(false);
      } else if (p.startsWith("/aluno")) {
        setShowAluno(true);
        setShowAdmin(false);
      } else if (p === "/" || p === "") {
        if (!session) {
          setShowAdmin(false);
          setShowAluno(false);
        }
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);

  const openAdmin = () => {
    setShowLogin(false);
    setShowAdmin(true);
    setShowAluno(false);
    if (window.location.pathname === "/" || window.location.pathname === "") {
      window.history.pushState(null, "", "/home");
    }
  };

  const openAluno = () => {
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
        await fetch(`http://localhost:3000/api/v1/users/logout/${session.userId}`, {
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
      addToastGlobal("Sessão encerrada com sucesso.", "👋");
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

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f7f9ff]">
      <GlobalStyles />
      <NavBar onLoginClick={openLogin} />
      <div className="pt-[72px]">
        <HeroSection />
        <NewsSection />
        <CtaSection onLoginClick={openLogin} />
        <Footer onLoginClick={openLogin} />
      </div>
      <ScrollTop />
      <ToastContainer />
      {showLogin && <LoginPage onBack={closeLogin} onAdminLogin={openAdmin} onStudentLogin={openAluno} />}
    </div>
  );
}
