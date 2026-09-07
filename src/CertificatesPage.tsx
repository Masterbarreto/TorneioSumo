import { useState, useRef, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";


// ─── Types ───────────────────────────────────────────────────────────────────
type DocType = "badge" | "certificate";
type Member = { id: string; name: string; role: string; photo: string; checked: boolean };
type Team = { id: string; name: string; code: string; members: Member[]; placement: number };
type HistoryEntry = { id: string; label: string; sub: string; time: string; done: boolean };

// ─── Mock data ───────────────────────────────────────────────────────────────
const INIT_TEAMS: Team[] = [
  {
    id: "t1", name: "Alpha Technicians", code: "028", placement: 1,
    members: [
      { id: "m1", name: "Ricardo Oliveira", role: "Líder Técnico",   photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=faces&cs=tinysrgb&fit=crop&h=160&w=160", checked: true },
      { id: "m2", name: "Ana Costa",        role: "Eng. Mecânica",   photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=faces&cs=tinysrgb&fit=crop&h=160&w=160", checked: true },
      { id: "m3", name: "Marcus Vinícius",  role: "Programador",     photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=faces&cs=tinysrgb&fit=crop&h=160&w=160", checked: false },
    ],
  },
  {
    id: "t2", name: "Cyber Guardians", code: "017", placement: 2,
    members: [
      { id: "m4", name: "Beatriz Lima",    role: "Capitã",           photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?crop=faces&cs=tinysrgb&fit=crop&h=160&w=160", checked: true },
      { id: "m5", name: "Carlos Mendes",   role: "Programador",      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=faces&cs=tinysrgb&fit=crop&h=160&w=160", checked: true },
    ],
  },
  {
    id: "t3", name: "Iron Circuits", code: "034", placement: 3,
    members: [
      { id: "m6", name: "Fernanda Rocha",  role: "Eng. Elétrica",    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=faces&cs=tinysrgb&fit=crop&h=160&w=160", checked: true },
      { id: "m7", name: "João Pedro",      role: "Técnico Hardware",  photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?crop=faces&cs=tinysrgb&fit=crop&h=160&w=160", checked: false },
    ],
  },
];

const INIT_HISTORY: HistoryEntry[] = [
  { id: "h1", label: "Cyber Guardians",     sub: "12 credenciais · há 2 hrs",   time: "2h",  done: true  },
  { id: "h2", label: "Bruno Mendes (Ind.)", sub: "credenciais · há 1 hr",        time: "1h",  done: true  },
  { id: "h3", label: "Processo Agendado",   sub: "Emissão programada para hoje", time: "",    done: false },
];

const PLACEMENTS = ["1", "2", "3", "4", "5"];

// ─── QR code placeholder ─────────────────────────────────────────────────────
function QR({ size = 52 }: { size?: number }) {
  const s = size / 7;
  const grid = [
    [1,1,1,0,1,1,1],[1,0,1,0,1,0,1],[1,0,1,0,1,0,1],[0,0,0,1,0,1,0],
    [1,0,1,0,1,0,1],[1,0,1,0,0,0,1],[1,1,1,0,1,1,1],
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      {grid.map((row, y) => row.map((cell, x) =>
        cell ? <rect key={`${x}-${y}`} x={x * s} y={y * s} width={s - 0.5} height={s - 0.5} fill="currentColor" /> : null
      ))}
    </svg>
  );
}

// ─── Circuit board background SVG ────────────────────────────────────────────
function CircuitBg() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 260 210" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <g stroke="#00c8ff" strokeWidth="0.5" opacity="0.25">
        <line x1="0" y1="28" x2="70" y2="28"/><line x1="70" y1="28" x2="70" y2="55"/><line x1="70" y1="55" x2="130" y2="55"/>
        <circle cx="70" cy="28" r="2.5" fill="#00c8ff"/><circle cx="70" cy="55" r="2.5" fill="#00c8ff"/>
        <line x1="0" y1="95" x2="35" y2="95"/><line x1="35" y1="95" x2="35" y2="130"/><line x1="35" y1="130" x2="65" y2="130"/>
        <circle cx="35" cy="95" r="2.5" fill="#00c8ff"/><circle cx="35" cy="130" r="2.5" fill="#00c8ff"/>
        <line x1="190" y1="0" x2="190" y2="45"/><line x1="190" y1="45" x2="230" y2="45"/>
        <circle cx="190" cy="45" r="2.5" fill="#00c8ff"/>
        <line x1="150" y1="75" x2="260" y2="75"/>
        <circle cx="210" cy="75" r="2.5" fill="#00c8ff"/>
        <line x1="110" y1="155" x2="175" y2="155"/><line x1="175" y1="155" x2="175" y2="200"/>
        <circle cx="175" cy="155" r="2.5" fill="#00c8ff"/>
        <line x1="25" y1="170" x2="25" y2="210"/><line x1="25" y1="170" x2="65" y2="170"/>
        <circle cx="25" cy="170" r="2.5" fill="#00c8ff"/>
        <line x1="230" y1="100" x2="260" y2="100"/><line x1="230" y1="100" x2="230" y2="130"/>
        <circle cx="230" cy="100" r="2.5" fill="#00c8ff"/>
        <circle cx="55" cy="185" r="1.5" fill="#00c8ff"/>
        <circle cx="220" cy="20" r="1.5" fill="#00c8ff"/>
        <circle cx="245" cy="140" r="1.5" fill="#00c8ff"/>
        <circle cx="8" cy="58" r="1.5" fill="#00c8ff"/>
        <circle cx="100" cy="185" r="1.5" fill="#00c8ff"/>
        <circle cx="155" cy="10" r="1.5" fill="#00c8ff"/>
      </g>
    </svg>
  );
}

// ─── Robot illustration (SVG) ─────────────────────────────────────────────────
function RobotSVG() {
  return (
    <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Antenna */}
      <line x1="60" y1="8" x2="60" y2="22" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="60" cy="6" r="4" fill="#f59e0b"/>
      {/* Head */}
      <rect x="32" y="22" width="56" height="42" rx="8" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5"/>
      {/* Eyes */}
      <rect x="42" y="33" width="14" height="10" rx="3" fill="#00f2ff" opacity="0.9"/>
      <rect x="64" y="33" width="14" height="10" rx="3" fill="#00f2ff" opacity="0.9"/>
      <circle cx="49" cy="38" r="3" fill="#0ea5e9"/>
      <circle cx="71" cy="38" r="3" fill="#0ea5e9"/>
      {/* Mouth */}
      <rect x="44" y="50" width="32" height="5" rx="2.5" fill="#3b82f6"/>
      <rect x="48" y="50" width="6" height="5" rx="0" fill="#00f2ff" opacity="0.7"/>
      <rect x="58" y="50" width="6" height="5" rx="0" fill="#00f2ff" opacity="0.7"/>
      <rect x="68" y="50" width="6" height="5" rx="0" fill="#00f2ff" opacity="0.7"/>
      {/* Neck */}
      <rect x="52" y="64" width="16" height="8" rx="2" fill="#1e3a8a"/>
      {/* Body */}
      <rect x="24" y="72" width="72" height="50" rx="8" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5"/>
      {/* Chest panel */}
      <rect x="38" y="82" width="44" height="28" rx="4" fill="#0f2d6e"/>
      <circle cx="47" cy="92" r="5" fill="#f59e0b" opacity="0.9"/>
      <rect x="55" y="89" width="20" height="3" rx="1.5" fill="#00f2ff" opacity="0.6"/>
      <rect x="55" y="95" width="14" height="3" rx="1.5" fill="#00f2ff" opacity="0.4"/>
      <circle cx="47" cy="104" r="3" fill="#ef4444" opacity="0.8"/>
      {/* Arms */}
      <rect x="4" y="72" width="18" height="36" rx="8" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5"/>
      <rect x="98" y="72" width="18" height="36" rx="8" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5"/>
      {/* Hands */}
      <circle cx="13" cy="114" r="7" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5"/>
      <circle cx="107" cy="114" r="7" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5"/>
      {/* Legs */}
      <rect x="36" y="122" width="20" height="16" rx="4" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5"/>
      <rect x="64" y="122" width="20" height="16" rx="4" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5"/>
      {/* Feet */}
      <rect x="32" y="135" width="26" height="6" rx="3" fill="#1e3a8a"/>
      <rect x="62" y="135" width="26" height="6" rx="3" fill="#1e3a8a"/>
    </svg>
  );
}

// ─── Badge preview ───────────────────────────────────────────────────────────
function BadgeCard({ member, team, showPhoto, showQR, showSeal }: {
  member: Member; team: Team; showPhoto: boolean; showQR: boolean; showSeal: boolean;
}) {
  return (
    <div className="relative rounded-[14px] overflow-hidden shadow-2xl" style={{ width: 260, userSelect: "none", boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}>
      {/* ── Lanyard hole ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-5 h-5 rounded-full bg-[#0a1628] border-[3px] border-[#f59e0b]" />

      {/* ── DARK TOP SECTION ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(155deg, #0d1b2e 0%, #0a1f3a 60%, #061325 100%)", paddingTop: 18, paddingBottom: 0, minHeight: 210 }}>
        <CircuitBg />

        {/* Yellow top accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#f59e0b]" />

        {/* Event header — left */}
        <div className="relative z-10 px-4 flex items-start justify-between">
          <div style={{ flex: 1 }}>
            <div style={{ color: "#f59e0b", fontWeight: 900, fontSize: 10, letterSpacing: "3px", textTransform: "uppercase", fontFamily: "sans-serif" }}>
              9° Torneio de
            </div>
            <div style={{ color: "#ffffff", fontWeight: 900, fontSize: 22, letterSpacing: "1px", textTransform: "uppercase", lineHeight: 1, fontFamily: "sans-serif" }}>
              ROBÓTICA
            </div>
            <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: 9, letterSpacing: "4px", textTransform: "uppercase", fontFamily: "sans-serif", marginTop: 1 }}>
              SENAC
            </div>
            {showSeal && (
              <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 3, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)", borderRadius: 20, padding: "2px 7px" }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span style={{ color: "#f59e0b", fontSize: 7, letterSpacing: 1, textTransform: "uppercase", fontFamily: "sans-serif" }}>Verificado</span>
              </div>
            )}
          </div>

          {/* Personal photo (optional) */}
          {showPhoto && (
            <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", border: "2px solid #f59e0b", flexShrink: 0 }}>
              <img src={member.photo} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120"; }} />
            </div>
          )}
        </div>

        {/* Robot illustration */}
        <div className="relative z-10 flex justify-center" style={{ marginTop: 8, height: 130 }}>
          <div style={{ width: 110, height: 130 }}>
            <RobotSVG />
          </div>
        </div>
      </div>

      {/* ── WHITE BOTTOM SECTION ── */}
      <div style={{ background: "#ffffff", padding: "10px 14px 0" }}>
        {/* Yellow accent line */}
        <div style={{ height: 3, background: "#f59e0b", borderRadius: 2, marginBottom: 8 }} />

        {/* Name */}
        <div style={{ fontWeight: 900, fontSize: 18, color: "#0a1628", letterSpacing: "-0.3px", lineHeight: 1.1, fontFamily: "sans-serif" }}>
          {member.name.toUpperCase()}
        </div>

        {/* Team */}
        <div style={{ marginTop: 3, fontWeight: 700, fontSize: 10, color: "#f59e0b", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "sans-serif" }}>
          EQUIPE: {team.name}
        </div>

        {/* Role */}
        <div style={{ marginTop: 1, fontWeight: 400, fontSize: 9, color: "#94a3b8", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "sans-serif" }}>
          {member.role}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#e2e8f0", margin: "8px 0" }} />

        {/* QR + scan info + SENAC logo */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingBottom: 10 }}>
          {showQR ? (
            <div style={{ color: "#0a1628", flexShrink: 0 }}>
              <QR size={58} />
            </div>
          ) : null}

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#64748b", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "sans-serif", marginBottom: 4 }}>
              ESCANEIE PARA:
            </div>
            {["Confirmar participação", "Ver programação", "Acessar resultados"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: 8, color: "#475569", fontFamily: "sans-serif" }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Senac brand */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "flex-end", flexShrink: 0, gap: 2 }}>
            <div style={{ background: "#e30000", borderRadius: 4, padding: "2px 6px" }}>
              <span style={{ color: "white", fontWeight: 900, fontSize: 11, fontFamily: "sans-serif", letterSpacing: "-0.5px", textTransform: "uppercase" }}>SENAC</span>
            </div>
            <span style={{ fontSize: 7, color: "#94a3b8", letterSpacing: "0.5px", fontFamily: "sans-serif" }}>REALIZAÇÃO</span>
          </div>
        </div>

        {/* Yellow bottom stripe */}
        <div style={{ height: 8, background: "#f59e0b", margin: "0 -14px" }} />
      </div>
    </div>
  );
}

// ─── Certificate preview ──────────────────────────────────────────────────────
function CertCard({ member, team, placement, showQR }: {
  member: Member; team: Team; placement: number; showQR: boolean;
}) {
  const placelabel = ["1º Lugar", "2º Lugar", "3º Lugar", "4º Lugar", "5º Lugar"][placement - 1] ?? `${placement}º Lugar`;
  return (
    <div className="relative bg-white rounded-[12px] overflow-hidden shadow-2xl border border-[rgba(194,198,210,0.4)]" style={{ width: 320, userSelect: "none" }}>
      {/* Top accent line */}
      <div className="h-[4px]" style={{ background: "linear-gradient(90deg,#8c4f00,#00356a)" }} />

      {/* Content */}
      <div className="flex flex-col items-center px-8 pt-8 pb-6 gap-4">
        {/* Medal icon */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-full bg-[#edf4ff] border-4 border-[#c2d9f5] flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#8c4f00" stroke="#8c4f00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-['Liberation_Mono:Regular',monospace] text-[#8c4f00] text-[9px] tracking-[2px] uppercase">{placelabel}</span>
        </div>

        {/* Title */}
        <div className="text-center">
          <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[20px] leading-tight">Certificado de Excelência</h3>
          <p className="font-['Inter:Regular',Inter,sans-serif] text-[#475569] text-[12px] leading-relaxed mt-2">
            Pela participação e desempenho técnico exemplar na<br />
            <strong className="text-[#051d30]">Robotic Sync Championship 2026</strong>
          </p>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-[#e2e8f0]" />
          <span className="font-['Liberation_Mono:Regular',monospace] text-[#b0bac8] text-[8px] tracking-[1px] uppercase">Concedido a</span>
          <div className="flex-1 h-px bg-[#e2e8f0]" />
        </div>

        {/* Recipient */}
        <div className="text-center">
          <p className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[16px]">{member.name}</p>
          <p className="font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] text-[11px] uppercase tracking-[0.8px] mt-0.5">{member.role}</p>
          <p className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[#00356a] text-[12px] uppercase tracking-[1px] mt-2">Equipe {team.name}</p>
        </div>

        {/* Signature line */}
        <div className="w-full flex flex-col items-center gap-1 pt-2 border-t border-[#e2e8f0]">
          <div className="w-32 h-px bg-[#051d30] mb-1" />
          <p className="font-['Inter:Regular',Inter,sans-serif] text-[11px] text-[#051d30] font-semibold">Prof. Dr. Eduardo Silva</p>
          <p className="font-['Inter:Regular',Inter,sans-serif] text-[10px] text-[#8c9ab0] uppercase tracking-[0.5px]">Coordenação Geral</p>
        </div>

        {/* QR + branding */}
        <div className="w-full flex items-end justify-between pt-1">
          <span className="font-['Liberation_Mono:Regular',monospace] text-[#c2c6d2] text-[8px] tracking-[1px] uppercase">robotic-sync.senac.edu.br</span>
          {showQR && (
            <div className="text-[#051d30] opacity-30">
              <QR size={36} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#00356a,#8c4f00)" }} />
    </div>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────
function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-['Inter:Regular',Inter,sans-serif] text-[13px] text-[rgba(255,255,255,0.8)]">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-all duration-200 ${checked ? "bg-[#00f2ff]" : "bg-[rgba(255,255,255,0.2)]"}`}
      >
        <span className={`absolute top-[3px] w-[14px] h-[14px] bg-white rounded-full shadow transition-all duration-200 ${checked ? "left-[19px]" : "left-[3px]"}`} />
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CertificatesPage({
  onNavigate,
  onLogout,
}: {
  onNavigate: (key: string) => void;
  onLogout: () => void;
}) {
  const [teams, setTeams] = useState<Team[]>(INIT_TEAMS);
  const [history, setHistory] = useState<HistoryEntry[]>(INIT_HISTORY);
  const [docType, setDocType] = useState<DocType>("badge");
  const [selectedTeamId, setSelectedTeamId] = useState(INIT_TEAMS[0].id);
  const [placement, setPlacement] = useState(1);
  const [previewMemberId, setPreviewMemberId] = useState(INIT_TEAMS[0].members[0].id);

  // Layout toggles
  const [showPhoto, setShowPhoto] = useState(true);
  const [showQR, setShowQR] = useState(true);
  const [showSeal, setShowSeal] = useState(false);

  // Print state
  const [printing, setPrinting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch real teams from MongoDB
    fetch("http://localhost:3000/api/v1/Equipes", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mappedTeams: Team[] = data.map((t: any, tIdx: number) => {
            const teamName = t.name || t.nome || `Equipe ${tIdx + 1}`;
            const mList =
              Array.isArray(t.members) && t.members.length > 0
                ? t.members.map((m: any, mIdx: number) => ({
                    id: m.id || m.cpf || `m_${tIdx}_${mIdx}`,
                    name: m.name || `Integrante ${mIdx + 1}`,
                    role: m.role || "Competidor",
                    photo:
                      m.photo ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=faces&cs=tinysrgb&fit=crop&h=160&w=160",
                    checked: true,
                  }))
                : [
                    {
                      id: `m_${tIdx}_cap`,
                      name: `Capitão - ${teamName}`,
                      role: "Líder Técnico",
                      photo:
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=faces&cs=tinysrgb&fit=crop&h=160&w=160",
                      checked: true,
                    },
                  ];

            return {
              id: t.id || t._id,
              name: teamName,
              code: String((t.teamId || t._id || String(tIdx + 1)).slice(-3)),
              placement: (tIdx % 3) + 1,
              members: mList,
            };
          });

          setTeams(mappedTeams);
          setSelectedTeamId(mappedTeams[0].id);
          if (mappedTeams[0].members.length > 0) {
            setPreviewMemberId(mappedTeams[0].members[0].id);
          }
        }
      })
      .catch((err) => console.error("Erro ao carregar equipes em certificados:", err));

    // 2. Fetch history from MongoDB
    fetch("http://localhost:3000/api/v1/certificados", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setHistory(data);
        }
      })
      .catch((err) => console.error("Erro ao carregar histórico de certificados:", err));
  }, []);

  const team = teams.find((t) => t.id === selectedTeamId) ?? teams[0];
  const checkedMembers = team?.members ? team.members.filter((m) => m.checked) : [];
  const previewMember = team?.members ? (team.members.find((m) => m.id === previewMemberId) ?? checkedMembers[0] ?? team.members[0]) : { id: "p", name: "Participante", role: "Competidor", photo: "", checked: true };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const toggleMember = (tid: string, mid: string, val: boolean) =>
    setTeams((ts) => ts.map((t) => t.id === tid ? { ...t, members: t.members.map((m) => m.id === mid ? { ...m, checked: val } : m) } : t));

  const selectAll = (tid: string, val: boolean) =>
    setTeams((ts) => ts.map((t) => t.id === tid ? { ...t, members: t.members.map((m) => ({ ...m, checked: val })) } : t));

  const handleTeamChange = (newTeamId: string) => {
    setSelectedTeamId(newTeamId);
    const targetTeam = teams.find((t) => t.id === newTeamId);
    if (targetTeam && targetTeam.members.length > 0) {
      // Ensure all members are checked by default
      setTeams((prev) =>
        prev.map((t) =>
          t.id === newTeamId
            ? { ...t, members: t.members.map((m) => ({ ...m, checked: true })) }
            : t
        )
      );
      setPreviewMemberId(targetTeam.members[0].id);
    }
  };

  const handlePrint = () => {
    if (checkedMembers.length === 0) {
      showToast("Selecione ao menos um membro para imprimir.");
      return;
    }
    setPrinting(true);
    showToast(`Preparando impressão em lote de ${checkedMembers.length} ${docType === "badge" ? "credenciais" : "certificados"}...`);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 500);
  };

  const handleExport = async () => {
    if (checkedMembers.length === 0) {
      showToast("Selecione ao menos um membro para exportar.");
      return;
    }

    setExporting(true);
    showToast(`Gerando PDF de ${checkedMembers.length} ${docType === "badge" ? "credenciais" : "certificados"}...`);

    try {
      const isBadge = docType === "badge";
      // Badges: 100mm x 150mm. Certs: A4 landscape (297mm x 210mm)
      const pdf = isBadge
        ? new jsPDF({ orientation: "portrait", unit: "mm", format: [100, 150] })
        : new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      for (let i = 0; i < checkedMembers.length; i++) {
        const m = checkedMembers[i];
        const cardEl = document.getElementById(`export-card-${m.id}`);

        if (cardEl) {
          const canvas = await html2canvas(cardEl, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: isBadge ? "#0a1f3a" : "#ffffff",
          });

          const imgData = canvas.toDataURL("image/png");

          if (i > 0) {
            if (isBadge) {
              pdf.addPage([100, 150], "portrait");
            } else {
              pdf.addPage("a4", "landscape");
            }
          }

          if (isBadge) {
            pdf.addImage(imgData, "PNG", 5, 5, 90, 140);
          } else {
            pdf.addImage(imgData, "PNG", 15, 12, 267, 186);
          }
        }
      }

      const fileName = `${isBadge ? "Credenciais" : "Certificados"}_${team.name.replace(/\s+/g, "_")}.pdf`;
      pdf.save(fileName);

      // Save to backend database
      const res = await fetch("http://localhost:3000/api/v1/certificados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          teamId: team.id,
          teamName: team.name,
          docType,
          placement,
          members: checkedMembers,
        }),
      });

      if (res.ok) {
        const entry = await res.json();
        setHistory((h) => [entry, ...h]);
      }

      showToast(`✓ PDF "${fileName}" baixado com sucesso!`);
    } catch (e: any) {
      console.error("Erro na geração do PDF:", e);
      showToast("Erro ao gerar PDF.");
    } finally {
      setExporting(false);
    }
  };

  // Total issued %
  const totalMembers = teams.reduce((s, t) => s + t.members.length, 0);
  const issued = history.filter((h) => h.done).length * 2;
  const pct = Math.min(100, Math.round((issued / Math.max(totalMembers, 1)) * 100)) || 84;
  const remaining = Math.max(0, totalMembers - issued);



  return (
    <div className="fixed inset-0 bg-[#f7f9ff] z-[800]" style={{ animation: "certPageIn 0.3s ease both" }}>
      <style>{`
        @keyframes certPageIn { from { opacity:0; } to { opacity:1; } }
        @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @media print {
          @page {
            size: auto;
            margin: 5mm;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-batch-area,
          #printable-batch-area * {
            visibility: visible !important;
          }
          #printable-batch-area {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            z-index: 999999 !important;
            pointer-events: auto !important;
          }
          .print-page-break {
            page-break-after: always !important;
            break-after: page !important;
            min-height: 95vh !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 20px 0 !important;
          }
        }
      `}</style>


      <AdminSidebar active="certificados" onNavigate={onNavigate} onLogout={onLogout} />

      {/* Top bar */}
      <header className="fixed top-0 left-[256px] right-0 h-[64px] bg-[rgba(255,255,255,0.7)] backdrop-blur-[12px] border-b border-[rgba(226,232,240,0.15)] shadow-[0_1px_2px_rgba(0,0,0,0.05)] z-20 flex items-center justify-between px-8">
        <div>
          <p className="font-['Inter:Regular',Inter,sans-serif] text-[11px] text-[#8c9ab0] tracking-[0.5px] uppercase">DOCUMENTOS / EMISSÃO EM LOTE</p>
          <h1 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[18px] tracking-[-0.5px]">Credenciais e Certificados</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            API ONLINE (MongoDB Atlas)
          </span>
          <button
            onClick={handlePrint}

            disabled={printing || checkedMembers.length === 0}
            className="flex items-center gap-2 border border-[rgba(194,198,210,0.8)] bg-white text-[#051d30] font-['Inter:Bold',Inter,sans-serif] font-bold text-[12px] tracking-[0.8px] uppercase px-4 py-2.5 rounded-[6px] hover:bg-[#f7f9ff] disabled:opacity-50 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Imprimir Lote
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || checkedMembers.length === 0}
            className="flex items-center gap-2 bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1px] uppercase px-5 py-2.5 rounded-[6px] hover:bg-[#00468a] disabled:opacity-60 transition-all shadow-[0_4px_12px_rgba(0,53,106,0.25)]"
          >
            {exporting ? (
              <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Gerando...</>
            ) : (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Exportar PDFs</>
            )}
          </button>
        </div>
      </header>

      {/* Main 3-column layout */}
      <main className="absolute top-[64px] left-[256px] right-0 bottom-0 overflow-y-auto p-6 flex gap-5">

        {/* ── Left panel: Seleção ── */}
        <div className="flex flex-col gap-4 w-[240px] shrink-0">
          {/* Doc type */}
          <div className="bg-white rounded-[10px] border border-[rgba(194,198,210,0.4)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <p className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[14px] mb-3">Seleção</p>
              <p className="font-['Inter:Regular',Inter,sans-serif] text-[10px] text-[#8c9ab0] uppercase tracking-[0.8px] mb-2">Tipo de Documento</p>
              <div className="flex gap-2">
                {(["badge", "certificate"] as DocType[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDocType(d)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[6px] border text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[0.5px] transition-all ${docType === d ? "bg-[#051d30] text-white border-[#051d30]" : "bg-white text-[#475569] border-[rgba(194,198,210,0.6)] hover:border-[#00356a]"}`}
                  >
                    {d === "badge" ? (
                      <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L6 7h12l-2-4z"/></svg> Badge</>
                    ) : (
                      <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Certificado</>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Team selector */}
            <div className="px-4 py-3 border-t border-[#f0f4fa]">
              <p className="font-['Inter:Regular',Inter,sans-serif] text-[10px] text-[#8c9ab0] uppercase tracking-[0.8px] mb-2">Equipe</p>
              <select
                value={selectedTeamId}
                onChange={(e) => handleTeamChange(e.target.value)}
                className="w-full bg-[#f7f9ff] border border-[#e2e8f0] rounded-[6px] px-3 py-2.5 font-['Inter:Regular',Inter,sans-serif] text-[13px] text-[#051d30] outline-none focus:border-[#00356a] appearance-none cursor-pointer"
              >

                {teams.map((t) => <option key={t.id} value={t.id}>{t.name} (0{t.code})</option>)}
              </select>
            </div>

            {/* Placement (cert only) */}
            {docType === "certificate" && (
              <div className="px-4 py-3 border-t border-[#f0f4fa]">
                <p className="font-['Inter:Regular',Inter,sans-serif] text-[10px] text-[#8c9ab0] uppercase tracking-[0.8px] mb-2">Colocação</p>
                <select
                  value={placement}
                  onChange={(e) => setPlacement(Number(e.target.value))}
                  className="w-full bg-[#f7f9ff] border border-[#e2e8f0] rounded-[6px] px-3 py-2.5 font-['Inter:Regular',Inter,sans-serif] text-[13px] text-[#051d30] outline-none focus:border-[#00356a] appearance-none cursor-pointer"
                >
                  {PLACEMENTS.map((p, i) => <option key={p} value={i + 1}>{i + 1}</option>)}
                </select>
              </div>
            )}

            {/* Members */}
            <div className="px-4 py-3 border-t border-[#f0f4fa]">
              <div className="flex items-center justify-between mb-3">
                <p className="font-['Inter:Regular',Inter,sans-serif] text-[10px] text-[#8c9ab0] uppercase tracking-[0.8px]">Membros</p>
                <button
                  onClick={() => selectAll(team.id, !team.members.every((m) => m.checked))}
                  className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[10px] text-[#00356a] uppercase tracking-[0.5px] hover:underline"
                >
                  {team.members.every((m) => m.checked) ? "Desmarcar Todos" : "Selecionar Todos"}
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {team.members.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 cursor-pointer rounded-[6px] p-2 transition-colors hover:bg-[#f7f9ff] ${previewMemberId === m.id ? "bg-[#edf4ff]" : ""}`}
                    onClick={() => setPreviewMemberId(m.id)}
                  >
                    <div
                      className={`w-4 h-4 rounded-[3px] border-2 flex items-center justify-center transition-all shrink-0 ${m.checked ? "bg-[#00356a] border-[#00356a]" : "border-[#c2c6d2]"}`}
                      onClick={(e) => { e.stopPropagation(); toggleMember(team.id, m.id, !m.checked); }}
                    >
                      {m.checked && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <img src={m.photo} alt={m.name} className="w-7 h-7 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[#051d30] text-[12px] truncate">{m.name}</p>
                      <p className="font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] text-[10px] uppercase tracking-[0.3px] truncate">{m.role}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Layout toggles */}
          <div className="bg-[#051d30] rounded-[10px] px-4 py-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00f2ff" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 17h3m0 0h3m-3 0v-3m0 3v3"/></svg>
              <p className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-white text-[13px]">Layout</p>
            </div>
            <ToggleRow label="Foto do Perfil"         checked={showPhoto} onChange={setShowPhoto} />
            <ToggleRow label="QR Code de Acesso"      checked={showQR}    onChange={setShowQR}    />
            <ToggleRow label="Selo de Sustentabilidade" checked={showSeal}  onChange={setShowSeal}  />
          </div>
        </div>

        {/* ── Center panel: Preview ── */}
        <div className="flex-1 flex flex-col items-center gap-4 min-w-0">
          {/* Tab switcher */}
          <div className="flex items-center gap-2 bg-white border border-[rgba(194,198,210,0.4)] rounded-[8px] p-1 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            {(["badge", "certificate"] as DocType[]).map((d) => (
              <button
                key={d}
                onClick={() => setDocType(d)}
                className={`px-5 py-2 rounded-[6px] font-['Inter:Bold',Inter,sans-serif] font-bold text-[12px] tracking-[0.8px] uppercase transition-all ${docType === d ? "bg-[#051d30] text-white shadow" : "text-[#8c9ab0] hover:text-[#051d30]"}`}
              >
                {d === "badge" ? "Badge" : "Certificado"}
              </button>
            ))}
          </div>

          {/* Preview card */}
          <div className="flex-1 flex items-center justify-center w-full bg-white rounded-[12px] border border-[rgba(194,198,210,0.4)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] py-10">
            <div ref={printRef} className="print-area">
              {docType === "badge"
                ? <BadgeCard member={previewMember} team={team} showPhoto={showPhoto} showQR={showQR} showSeal={showSeal} />
                : <CertCard  member={previewMember} team={team} placement={placement} showQR={showQR} />
              }
            </div>
            {/* visible copy */}
            <div style={{ transform: "scale(1.05)", transformOrigin: "center" }}>
              {docType === "badge"
                ? <BadgeCard member={previewMember} team={team} showPhoto={showPhoto} showQR={showQR} showSeal={showSeal} />
                : <CertCard  member={previewMember} team={team} placement={placement} showQR={showQR} />
              }
            </div>
          </div>

          {/* Action toolbar */}
          <div className="flex items-center gap-6 bg-white border border-[rgba(194,198,210,0.4)] rounded-[8px] px-8 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            {[
              { label: "Zoom", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>, action: () => showToast("Zoom — use Ctrl+Scroll no preview") },
              { label: "Girar",  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.87"/></svg>, action: () => showToast("Girar — orientação alterada") },
              { label: "Editor", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, action: () => showToast("Editor avançado — em breve") },
            ].map(({ label, icon, action }) => (
              <button key={label} onClick={action} className="flex flex-col items-center gap-1.5 text-[#475569] hover:text-[#00356a] transition-colors group">
                <span className="group-hover:scale-110 transition-transform">{icon}</span>
                <span className="font-['Inter:Regular',Inter,sans-serif] text-[10px] tracking-[0.8px] uppercase">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right panel: Status ── */}
        <div className="flex flex-col gap-4 w-[220px] shrink-0">
          {/* Status card */}
          <div className="bg-white rounded-[10px] border border-[rgba(194,198,210,0.4)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8c4f00" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <p className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[14px]">Status Atual</p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[36px] leading-none">{pct}%</p>
                <p className="font-['Inter:Regular',Inter,sans-serif] text-[10px] text-[#8c9ab0] uppercase tracking-[0.5px] mt-0.5">Meta atingida</p>
              </div>
              <div className="text-right">
                <p className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[18px] leading-none">{remaining}</p>
                <p className="font-['Inter:Regular',Inter,sans-serif] text-[10px] text-[#8c9ab0] uppercase tracking-[0.5px] mt-0.5">Restantes</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-[#f0f4fa] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00356a] to-[#00f2ff] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <p className="font-['Inter:Regular',Inter,sans-serif] text-[12px] text-[#475569] leading-relaxed">
              Faltam poucas credenciais para completar todas as equipes inscritas no torneio atual.
            </p>
          </div>

          {/* History */}
          <div className="bg-white rounded-[10px] border border-[rgba(194,198,210,0.4)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[14px]">Histórico</p>
              <button className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[11px] text-[#00356a] uppercase tracking-[0.5px] hover:underline">Ver Mais</button>
            </div>
            <div className="flex flex-col gap-3">
              {history.map((h) => (
                <div key={h.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${h.done ? "bg-green-100" : "bg-amber-100"}`}>
                    {h.done
                      ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[#051d30] text-[12px] truncate">{h.label}</p>
                    <p className="font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] text-[11px] leading-tight mt-0.5">{h.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Batch Printable & Exportable Hidden Container ── */}
      <div
        id="printable-batch-area"
        style={{
          position: "fixed",
          left: -9999,
          top: 0,
          width: docType === "badge" ? 300 : 850,
          zIndex: -1,
          opacity: 1,
          pointerEvents: "none",
        }}
      >
        {checkedMembers.map((m) => (
          <div
            key={m.id}
            id={`export-card-${m.id}`}
            className="print-page-break"
            style={{
              padding: "16px 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: docType === "badge" ? "#061325" : "#ffffff",
            }}
          >
            {docType === "badge" ? (
              <BadgeCard member={m} team={team} showPhoto={showPhoto} showQR={showQR} showSeal={showSeal} />
            ) : (
              <CertCard member={m} team={team} placement={placement} showQR={showQR} />
            )}
          </div>
        ))}
      </div>

      {/* Toast */}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[900] bg-[#051d30] text-white px-5 py-3 rounded-[4px] shadow-2xl border-l-4 border-[#00f2ff] font-['Inter:Regular',Inter,sans-serif] text-[13px] flex items-center gap-3 max-w-sm" style={{ animation: "toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00f2ff" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {toast}
        </div>
      )}
    </div>
  );
}
