import { useState, useRef, useEffect, type ChangeEvent } from "react";
import AdminSidebar from "./AdminSidebar";
import { API_BASE_URL } from "./config/api";

// ─── Types ─────────────────────────────────────────────────────────────────
type ArenaStatus = "Ativa" | "Inativa" | "Manutenção";
type ValidationT = "Automática" | "Manual";
type EvaluationT = "desafio" | "tempo" | "confronto" | "dancarino";
type TeamStatus = "Aprovado" | "Pendente" | "Rejeitado";
type Team = { id: string; name: string; institution: string; status: TeamStatus };
export type ChallengeObstacle = {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
};
export type ArenaRuleFile = {
  name: string;
  size?: string;
  sizeBytes?: number;
  dataUrl?: string;
  uploadedAt?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

type Arena = {
  id: string; name: string; description: string; status: ArenaStatus;
  capacity: number; dimensions: string; noiseLevel: string; lighting: string;
  validationType: ValidationT; evaluationType?: EvaluationT; tipoAvaliacao?: EvaluationT;
  restrictedAccess: boolean; requiresJudge: boolean;
  image: string; teams: Team[];
  challenges?: ChallengeObstacle[];
  rulesFile?: ArenaRuleFile | null;
};
type PageView = "list" | "create" | "edit" | "teams" | "challenges";

const DEFAULT_CHALLENGES: ChallengeObstacle[] = [
  {
    id: "obs-1",
    name: "Ponte Basculante Alpha",
    description: "Acionamento por sensor ultrassônico com rampa de inclinação variável.",
    maxPoints: 450,
  },
  {
    id: "obs-2",
    name: "Labirinto de Vidro UV",
    description: "Superfícies reflexivas para testes de sensores ópticos e infravermelhos.",
    maxPoints: 750,
  },
  {
    id: "obs-3",
    name: "Coleta Sustentável",
    description: "Identificação e triagem de blocos por cor em zona demarcada.",
    maxPoints: 200,
  },
];

const EVALUATION_OPTIONS: {
  id: EvaluationT;
  title: string;
  description: string;
  actionLabel: string;
}[] = [
  {
    id: "desafio",
    title: "Avaliação por Desafio",
    description: "Baseado em missões e objetivos específicos.",
    actionLabel: "CONFIGURAR DESAFIOS",
  },
  {
    id: "tempo",
    title: "Avaliação por Tempo",
    description: "Ex: Seguidores de linha e corridas.",
    actionLabel: "CONFIGURAR TEMPO",
  },
  {
    id: "confronto",
    title: "Avaliação por Confronto",
    description: "Ex: Sumô e batalhas de robôs.",
    actionLabel: "CONFIGURAR CONFRONTO",
  },
  {
    id: "dancarino",
    title: "Avaliação Dançarino",
    description: "Baseado em critérios artísticos e técnicos.",
    actionLabel: "CONFIGURAR CRITÉRIOS",
  },
];

const EVALUATION_LABELS: Record<EvaluationT, string> = {
  desafio: "Por Desafio",
  tempo: "Por Tempo",
  confronto: "Por Confronto",
  dancarino: "Dançarino",
};

function EvaluationTypeIcon({ type }: { type: EvaluationT }) {
  if (type === "desafio") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.61-1.61a2.404 2.404 0 0 1 1.705-.707c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894-.527-.967 1.02Z" />
      </svg>
    );
  }
  if (type === "tempo") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="10" x2="14" y1="2" y2="2" />
        <line x1="12" x2="12" y1="2" y2="5" />
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5" />
      </svg>
    );
  }
  if (type === "confronto") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
        <line x1="13" x2="19" y1="19" y2="13" />
        <line x1="16" x2="20" y1="16" y2="20" />
        <line x1="19" x2="21" y1="21" y2="19" />
        <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
        <line x1="5" x2="9" y1="14" y2="18" />
        <line x1="7" x2="4" y1="17" y2="20" />
        <line x1="3" x2="5" y1="19" y2="21" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

// ─── Initial data ───────────────────────────────────────────────────────────
const INIT_ARENAS: Arena[] = [
  {
    id: "1", name: "Labirinto",
    description: "Arena de percurso com obstáculos dinâmicos para robôs seguidores de linha e desafios de navegação autônoma.",
    status: "Ativa", capacity: 48, dimensions: "10m × 10m", noiseLevel: "Baixo",
    lighting: "Artificial", validationType: "Automática", restrictedAccess: false, requiresJudge: true,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    rulesFile: null,
    teams: [
      { id: "t1", name: "Cyber-Dragons", institution: "SENAC SP", status: "Aprovado" },
      { id: "t2", name: "Robo-Tech", institution: "FATEC Campinas", status: "Aprovado" },
      { id: "t3", name: "Iron Bots", institution: "ETEC Zona Sul", status: "Pendente" },
    ],
  },
  {
    id: "2", name: "Grand Prix",
    description: "Circuito de alta velocidade para competição de precisão e velocidade em pistas sinalizadas.",
    status: "Ativa", capacity: 64, dimensions: "15m × 8m", noiseLevel: "Alto",
    lighting: "Mista", validationType: "Manual", restrictedAccess: true, requiresJudge: true,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    teams: [
      { id: "t4", name: "Speed Demons", institution: "SENAC RJ", status: "Aprovado" },
      { id: "t5", name: "Turbo Coders", institution: "FATEC Santos", status: "Rejeitado" },
      { id: "t6", name: "Nitro Bots", institution: "ETEC Centro", status: "Pendente" },
    ],
  },
  {
    id: "3", name: "Arena Beta-2",
    description: "Zona experimental para categorias de dança e apresentação artística com robôs coreografados.",
    status: "Inativa", capacity: 32, dimensions: "8m × 8m", noiseLevel: "Médio",
    lighting: "Natural", validationType: "Automática", restrictedAccess: false, requiresJudge: false,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    teams: [
      { id: "t7", name: "DanceBots", institution: "SENAC MG", status: "Pendente" },
    ],
  },
];

let nextId = 4;

// ─── Helpers ────────────────────────────────────────────────────────────────
function uid() { return String(nextId++); }

const STATUS_COLORS: Record<ArenaStatus, string> = {
  "Ativa": "bg-green-100 text-green-700 border-green-200",
  "Inativa": "bg-slate-100 text-slate-600 border-slate-200",
  "Manutenção": "bg-amber-100 text-amber-700 border-amber-200",
};
const STATUS_DOT: Record<ArenaStatus, string> = {
  "Ativa": "bg-green-500", "Inativa": "bg-slate-400", "Manutenção": "bg-amber-500",
};
const TEAM_COLORS: Record<TeamStatus, string> = {
  "Aprovado": "bg-green-100 text-green-700", "Pendente": "bg-amber-100 text-amber-700", "Rejeitado": "bg-red-100 text-red-600",
};

// ─── Sidebar ────────────────────────────────────────────────────────────────
// ─── TopBar ─────────────────────────────────────────────────────────────────
function TopBar({ title, breadcrumb, children }: { title: string; breadcrumb?: string[]; children?: React.ReactNode }) {
  return (
    <header className="fixed top-0 left-0 md:left-[256px] right-0 min-h-[64px] bg-white border-b border-[rgba(194,198,210,0.4)] z-20 flex items-center justify-between px-4 sm:px-8 pl-16 md:pl-8 flex-wrap gap-2 py-2">
      <div className="flex flex-col">
        {breadcrumb && (
          <div className="flex items-center gap-1 text-[11px] font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] tracking-[0.5px] uppercase mb-0.5">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                <span>{b}</span>
              </span>
            ))}
          </div>
        )}
        <h1 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[18px] tracking-[-0.5px]">{title}</h1>
      </div>
      <div className="flex items-center gap-4">{children}</div>
    </header>
  );
}

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ArenaStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[0.8px] uppercase px-2 py-1 rounded-[4px] border ${STATUS_COLORS[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}

// ─── Arena Card ──────────────────────────────────────────────────────────────
function ArenaCard({ arena, onEdit, onDelete, onTeams, onRules }: { arena: Arena; onEdit: () => void; onDelete: () => void; onTeams: () => void; onRules: () => void }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="bg-white rounded-[8px] shadow-[0_1px_4px_rgba(0,0,0,0.07)] border border-[rgba(194,198,210,0.4)] overflow-hidden flex flex-col group hover:shadow-[0_4px_16px_rgba(0,53,106,0.12)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="relative h-[168px] bg-[#cfe5ff] overflow-hidden">
        <img
          src={imgErr ? "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400" : arena.image}
          alt={arena.name}
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,29,48,0.5)] to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <StatusBadge status={arena.status} />
          {Boolean(arena.rulesFile && arena.rulesFile.name) && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (arena.rulesFile?.dataUrl) {
                  const win = window.open();
                  if (win) {
                    win.document.title = arena.rulesFile.name;
                    win.document.write(`<iframe src="${arena.rulesFile.dataUrl}" style="border:0; position:fixed; top:0; left:0; width:100%; height:100%;" allowfullscreen></iframe>`);
                  }
                } else {
                  onRules();
                }
              }}
              className="inline-flex items-center gap-1 text-[10px] font-['Inter:Bold',Inter,sans-serif] font-bold text-amber-800 bg-amber-50/95 border border-amber-300 px-2 py-0.5 rounded-[4px] shadow-xs cursor-pointer hover:bg-amber-100"
              title={`Ver regras: ${arena.rulesFile.name}`}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              PDF Regras
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={onEdit} className="w-8 h-8 bg-white rounded-[4px] flex items-center justify-center shadow hover:bg-[#edf4ff] transition-colors" title="Editar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button onClick={onDelete} className="w-8 h-8 bg-white rounded-[4px] flex items-center justify-center shadow hover:bg-red-50 transition-colors" title="Excluir">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-5 flex-1">
        <div>
          <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[17px] uppercase">{arena.name}</h3>
          <p className="font-['Inter:Regular',Inter,sans-serif] text-[#475569] text-[13px] leading-[18px] mt-1 line-clamp-2">{arena.description}</p>
        </div>
        <div className="flex items-center gap-4 text-[12px] font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0]">
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {arena.capacity} cap.
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {arena.teams.length} equipes
          </span>
          <span className="flex items-center gap-1 font-semibold text-[#00356a]">
            {EVALUATION_LABELS[arena.evaluationType || arena.tipoAvaliacao || "desafio"]}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1 mt-auto">
          <button onClick={onEdit} className="text-[12px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[0.6px] uppercase text-[#00356a] border border-[#c2d9f5] rounded-[4px] py-2 hover:bg-[#edf4ff] transition-colors">Editar</button>
          <button onClick={onTeams} className="text-[12px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[0.6px] uppercase text-[#475569] border border-[rgba(194,198,210,0.6)] rounded-[4px] py-2 hover:bg-[#f7f9ff] transition-colors">Equipes</button>
          <button
            onClick={onRules}
            className={`text-[12px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[0.6px] uppercase rounded-[4px] py-2 transition-colors flex items-center justify-center gap-1 ${
              arena.rulesFile && arena.rulesFile.name
                ? "text-[#00356a] border border-[#c2d9f5] bg-[#edf4ff] hover:bg-[#dce8fc]"
                : "text-[#9a5b13] border border-[#fde68a] bg-[#fffbeb] hover:bg-[#fef3c7]"
            }`}
            title={arena.rulesFile && arena.rulesFile.name ? "Ver / Modificar Regras PDF" : "Subir PDF de Regras"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Regras
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ────────────────────────────────────────────────────────────
function DeleteModal({ arena, onConfirm, onCancel }: { arena: Arena; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-[rgba(5,29,48,0.5)] flex items-center justify-center backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-[8px] shadow-2xl w-full max-w-[420px] mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()} style={{ animation: "modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div className="h-1 bg-[#ba1a1a]" />
        <div className="p-8 flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <div>
              <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[20px]">Tem certeza?</h3>
              <p className="font-['Inter:Regular',Inter,sans-serif] text-[#475569] text-[14px] mt-1">
                Você está prestes a excluir a arena <strong className="text-[#051d30]">{arena.name}</strong>. Esta ação removerá permanentemente os dados da arena e o vínculo com{" "}
                <strong className="text-[#051d30]">{arena.teams.length} equipe{arena.teams.length !== 1 ? "s" : ""}</strong>.
              </p>
              <p className="font-['Inter:Regular',Inter,sans-serif] text-[#ba1a1a] text-[13px] mt-2">Esta ação não pode ser desfeita.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-3 border border-[rgba(194,198,210,0.8)] rounded-[6px] font-['Inter:Bold',Inter,sans-serif] font-bold text-[13px] tracking-[0.8px] uppercase text-[#475569] hover:bg-[#f7f9ff] transition-colors">Cancelar</button>
            <button onClick={onConfirm} className="flex-1 py-3 bg-[#ba1a1a] rounded-[6px] font-['Inter:Bold',Inter,sans-serif] font-bold text-[13px] tracking-[0.8px] uppercase text-white hover:bg-[#9b1515] transition-colors shadow-[0_4px_12px_rgba(186,26,26,0.3)]">Confirmar Exclusão</button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Arena Documentation / Rules Uploader ───────────────────────────────────
function ArenaDocumentationCard({
  rulesFile,
  onChange,
  onRemove,
  arenaName,
}: {
  rulesFile?: ArenaRuleFile | null;
  onChange: (file: ArenaRuleFile) => void;
  onRemove: () => void;
  arenaName?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      alert("Por favor, selecione um arquivo em formato PDF.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const formattedSize = formatFileSize(file.size);
      onChange({
        name: file.name,
        size: formattedSize,
        sizeBytes: file.size,
        dataUrl,
        uploadedAt: new Date().toLocaleDateString("pt-BR"),
      });

      // Sincroniza imediatamente o PDF de Regras com o Cloud Drive (/documents) no MongoDB
      try {
        await fetch(`${API_BASE_URL}/api/v1/drive/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            files: [
              {
                name: file.name,
                parentId: null,
                mimeType: "application/pdf",
                size: file.size,
                dataUrl,
              },
            ],
          }),
        });
      } catch (err) {
        console.error("Erro ao sincronizar PDF de regras com o módulo de Documentos:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handlePreviewPdf = () => {
    if (!rulesFile?.dataUrl) return;
    const win = window.open();
    if (win) {
      win.document.title = rulesFile.name;
      win.document.write(
        `<iframe src="${rulesFile.dataUrl}" style="border:0; position:fixed; top:0; left:0; width:100%; height:100%;" allowfullscreen></iframe>`
      );
    }
  };

  return (
    <div className="bg-white rounded-[12px] border border-[rgba(194,198,210,0.4)] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      {/* Header: Amber document icon + "Documentação" matching mockup */}
      <div className="flex items-center gap-2.5 mb-5">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9a5b13"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[18px] tracking-[-0.3px]">
          Documentação
        </h4>
        {arenaName && (
          <span className="text-[12px] font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] ml-auto">
            Arena: <strong className="text-[#00356a]">{arenaName}</strong>
          </span>
        )}
      </div>

      {/* Dashed upload box matching mockup */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-[10px] py-10 px-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
          isDragging
            ? "border-[#00356a] bg-[#e3efff]"
            : "border-[#c2d9f5] bg-[#edf4ff]/60 hover:bg-[#edf4ff]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        {/* Upload icon: document with thick arrow pointing up */}
        <div className="w-10 h-10 flex items-center justify-center text-[#051d30] mb-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#051d30"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="11" />
            <polyline points="9 14 12 11 15 14" />
          </svg>
        </div>
        <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[16px]">
          Upload PDF de Regras
        </span>
        <span className="font-['Inter:Regular',Inter,sans-serif] text-[#475569] text-[13px] mt-1">
          Arraste ou clique para selecionar
        </span>
      </div>

      {/* Uploaded / Selected file card matching mockup */}
      {Boolean(rulesFile && rulesFile.name) && (
        <div className="mt-4 bg-[#f1f5f9] border border-[#e2e8f0] rounded-[8px] p-3.5 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Blue PDF badge icon */}
            <div className="w-8 h-9 rounded-[3px] border-[1.8px] border-[#00356a] bg-white flex flex-col items-center justify-center shrink-0 shadow-xs">
              <span className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[8.5px] text-[#00356a] tracking-tight">
                PDF
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[#051d30] text-[13px] truncate"
                title={rulesFile.name}
              >
                {rulesFile.name}
              </span>
              <span className="font-['Inter:Regular',Inter,sans-serif] text-[#64748b] text-[11px] mt-0.5">
                {rulesFile.size ? `${rulesFile.size} • ` : ""}{rulesFile.dataUrl?.startsWith("data:") ? "Pronto para envio" : "Arquivo salvo no banco"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {rulesFile.dataUrl && (
              <button
                type="button"
                onClick={handlePreviewPdf}
                className="text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold uppercase tracking-wider text-[#00356a] hover:underline px-2 py-1 cursor-pointer"
                title="Visualizar PDF em nova aba"
              >
                Visualizar
              </button>
            )}
            <button
              type="button"
              onClick={onRemove}
              className="w-7 h-7 flex items-center justify-center text-[#ba1a1a] hover:bg-red-50 rounded transition-colors cursor-pointer"
              title="Remover arquivo"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Rules Modal (Upload rápido de regras por arena) ────────────────────────
function RulesModal({
  arena,
  onSave,
  onCancel,
}: {
  arena: Arena;
  onSave: (rulesFile: ArenaRuleFile | null) => Promise<void>;
  onCancel: () => void;
}) {
  const [currentRules, setCurrentRules] = useState<ArenaRuleFile | null>(
    arena.rulesFile || null
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(currentRules);
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-[rgba(5,29,48,0.5)] flex items-center justify-center backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-[12px] shadow-2xl w-full max-w-[580px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <div className="h-1 bg-[#00356a]" />
        <div className="p-6 sm:p-7 flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
            <div>
              <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[19px]">
                Regras da Arena: {arena.name}
              </h3>
              <p className="font-['Inter:Regular',Inter,sans-serif] text-[#64748b] text-[12px] mt-0.5">
                Faça o upload do documento oficial de regras em formato PDF para esta arena.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-[#8c9ab0] hover:text-[#051d30] p-1 text-lg font-bold"
            >
              ✕
            </button>
          </div>

          <ArenaDocumentationCard
            rulesFile={currentRules}
            onChange={(f) => setCurrentRules(f)}
            onRemove={() => setCurrentRules(null)}
            arenaName={arena.name}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 px-5 border border-[rgba(194,198,210,0.8)] rounded-[6px] font-['Inter:Bold',Inter,sans-serif] font-bold text-[12px] tracking-[0.8px] uppercase text-[#475569] hover:bg-[#f7f9ff] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="py-2.5 px-6 bg-[#00356a] rounded-[6px] font-['Inter:Bold',Inter,sans-serif] font-bold text-[12px] tracking-[0.8px] uppercase text-white hover:bg-[#00468a] disabled:opacity-60 transition-colors shadow-[0_4px_12px_rgba(0,53,106,0.25)] cursor-pointer flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Regras da Arena"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Field wrapper ───────────────────────────────────────────────────────────
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[#051d30] text-[12px] tracking-[0.6px] uppercase">{label}</label>
      {children}
      {hint && <span className="font-['Inter:Regular',Inter,sans-serif] text-red-500 text-[12px]">{hint}</span>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", error }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; error?: boolean }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-[#f7f9ff] border rounded-[6px] px-4 py-3 font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30] outline-none placeholder:text-[#b0bac8] focus:bg-white focus:border-[#00356a] focus:shadow-[0_0_0_3px_rgba(0,53,106,0.08)] transition-all ${error ? "border-red-400" : "border-[#e2e8f0]"}`}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#f7f9ff] border border-[#e2e8f0] rounded-[6px] px-4 py-3 font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30] outline-none placeholder:text-[#b0bac8] focus:bg-white focus:border-[#00356a] focus:shadow-[0_0_0_3px_rgba(0,53,106,0.08)] transition-all resize-none"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#f7f9ff] border border-[#e2e8f0] rounded-[6px] px-4 py-3 font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30] outline-none focus:bg-white focus:border-[#00356a] focus:shadow-[0_0_0_3px_rgba(0,53,106,0.08)] transition-all appearance-none cursor-pointer"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30]">{label}</span>
      <div
        className={`relative w-11 h-6 rounded-full transition-all duration-200 ${checked ? "bg-[#00356a]" : "bg-[#c2c6d2]"}`}
        onClick={() => onChange(!checked)}
      >
        <span className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all duration-200 ${checked ? "left-[23px]" : "left-[3px]"}`} />
      </div>
    </label>
  );
}

function SectionHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-6 h-6 bg-[#00356a] rounded-full flex items-center justify-center font-['Inter:Bold',Inter,sans-serif] font-bold text-white text-[11px]">{n}</span>
      <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[14px] uppercase tracking-[0.8px]">{title}</h4>
      <div className="flex-1 h-px bg-[#e2e8f0]" />
    </div>
  );
}

// ─── Arena Form ──────────────────────────────────────────────────────────────
type ArenaFormData = Omit<Arena, "id" | "teams">;
const EMPTY_FORM: ArenaFormData = {
  name: "", description: "", status: "Ativa", capacity: 0,
  dimensions: "", noiseLevel: "Baixo", lighting: "Artificial",
  validationType: "Automática", evaluationType: "desafio", restrictedAccess: false, requiresJudge: false, image: "",
  challenges: [],
  rulesFile: null,
};

function ArenaForm({
  initial,
  isEdit,
  onSave,
  onCancel,
  onConfigureChallenges,
}: {
  initial: ArenaFormData;
  isEdit: boolean;
  onSave: (f: ArenaFormData) => void;
  onCancel: () => void;
  onConfigureChallenges?: (currentForm: ArenaFormData) => void;
}) {
  const [form, setForm] = useState<ArenaFormData>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof ArenaFormData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ArenaFormData>(k: K) => (v: ArenaFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Nome obrigatório";
    if (!form.description.trim()) e.description = "Descrição obrigatória";
    if (!form.dimensions.trim()) e.dimensions = "Dimensões obrigatórias";
    if (form.capacity < 1) e.capacity = "Capacidade inválida";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    onSave(form);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      set("image")(ev.target?.result as string);
      setImgErr(false);
    };
    reader.readAsDataURL(file);
  };

  const previewUrl = form.image || "";

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[22px]">
            {isEdit ? `Editar Arena: ${initial.name}` : "Configuração de Arenas"}
          </h2>
          <p className="font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] text-[13px] mt-1">
            {isEdit ? "Atualize os dados da arena abaixo." : "Preencha os dados para criar uma nova arena de competição."}
          </p>
        </div>
      </div>

      <div className="flex gap-8 flex-1 min-h-0">
        {/* Left column — form sections */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
          {/* Section 1 */}
          <div className="bg-white rounded-[8px] border border-[rgba(194,198,210,0.4)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <SectionHeader n={1} title="Informações Básicas" />
            <div className="flex flex-col gap-4">
              <Field label="Nome da Arena" hint={errors.name}>
                <Input value={form.name} onChange={set("name")} placeholder="Ex: Arena Alpha-7" error={!!errors.name} />
              </Field>
              <Field label="Descrição" hint={errors.description}>
                <Textarea value={form.description} onChange={set("description")} placeholder="Descreva o propósito e características desta arena..." rows={3} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Capacidade Máxima" hint={errors.capacity as string}>
                  <Input value={String(form.capacity)} onChange={(v) => set("capacity")(Number(v))} type="number" placeholder="32" error={!!errors.capacity} />
                </Field>
                <Field label="Status">
                  <Select value={form.status} onChange={(v) => set("status")(v as ArenaStatus)} options={["Ativa", "Inativa", "Manutenção"]} />
                </Field>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-[8px] border border-[rgba(194,198,210,0.4)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <SectionHeader n={2} title="Requisitos" />
            <div className="flex flex-col gap-4">
              <Field label="Dimensões Mínimas" hint={errors.dimensions}>
                <Input value={form.dimensions} onChange={set("dimensions")} placeholder="Ex: 10m × 10m" error={!!errors.dimensions} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nível de Ruído">
                  <Select value={form.noiseLevel} onChange={set("noiseLevel")} options={["Baixo", "Médio", "Alto"]} />
                </Field>
                <Field label="Iluminação">
                  <Select value={form.lighting} onChange={set("lighting")} options={["Natural", "Artificial", "Mista"]} />
                </Field>
              </div>
            </div>
          </div>

          {/* Tipo de Avaliação Component */}
          <div className="bg-white rounded-[12px] border border-[rgba(194,198,210,0.4)] p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2.5 mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M8 16v-4" />
                <path d="M12 16v-6" />
                <path d="M16 16v-8" />
              </svg>
              <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[18px] tracking-[-0.3px]">
                Tipo de Avaliação
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EVALUATION_OPTIONS.map((opt) => {
                const isSelected = (form.evaluationType || "desafio") === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => set("evaluationType")(opt.id)}
                    className={`rounded-[10px] p-5 transition-all cursor-pointer flex flex-col justify-between min-h-[168px] ${
                      isSelected
                        ? "bg-[#f4f6f9] border-[1.5px] border-[#4a7298] shadow-[0_2px_8px_rgba(0,53,106,0.06)]"
                        : "bg-[#eef4ff] border-[1.5px] border-transparent hover:border-[#c2d9f5]"
                    }`}
                  >
                    <div>
                      <div className="mb-3">
                        <EvaluationTypeIcon type={opt.id} />
                      </div>
                      <h5 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[16px] leading-snug">
                        {opt.title}
                      </h5>
                      <p className="font-['Inter:Regular',Inter,sans-serif] text-[#475569] text-[13px] leading-[1.45] mt-1.5">
                        {opt.description}
                      </p>
                    </div>

                    {isSelected && (
                      <div
                        onClick={(e) => {
                          if (opt.id === "desafio") {
                            e.stopPropagation();
                            if (typeof onConfigureChallenges === "function") {
                              onConfigureChallenges(form);
                            }
                          }
                        }}
                        className="mt-4 pt-3.5 border-t border-[#e2e8f0] flex items-center justify-between hover:opacity-80 transition-opacity"
                      >
                        <span className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[#00356a] text-[11px] tracking-[0.8px] uppercase">
                          {opt.actionLabel}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documentação / Upload PDF de Regras */}
          <ArenaDocumentationCard
            rulesFile={form.rulesFile}
            onChange={(f) => set("rulesFile")(f)}
            onRemove={() => set("rulesFile")(null)}
            arenaName={form.name}
          />
        </div>

        {/* Right column — image + preview */}
        <div className="w-[340px] xl:w-[400px] flex flex-col gap-6 shrink-0">
          <div className="bg-white rounded-[8px] border border-[rgba(194,198,210,0.4)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[13px] uppercase tracking-[0.8px] mb-4">Imagem da Arena</h4>
            {/* Image preview */}
            <div
              className="relative w-full h-[200px] bg-[#edf4ff] rounded-[6px] overflow-hidden border border-dashed border-[#c2d9f5] flex items-center justify-center cursor-pointer hover:border-[#00356a] transition-colors group mb-3"
              onClick={() => fileRef.current?.click()}
            >
              {previewUrl && !imgErr ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" onError={() => setImgErr(true)} />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#8c9ab0]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span className="font-['Inter:Regular',Inter,sans-serif] text-[12px] text-center group-hover:text-[#00356a] transition-colors">Clique para enviar imagem</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <div className="flex flex-col gap-1.5">
              <label className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[11px] tracking-[0.6px] uppercase text-[#051d30]">ou cole URL da imagem</label>
              <Input value={imgErr ? "" : form.image} onChange={(v) => { set("image")(v); setImgErr(false); }} placeholder="https://..." />
            </div>
          </div>

          {/* Summary card */}
          <div className="bg-[#edf4ff] rounded-[8px] border border-[#c2d9f5] p-5">
            <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[13px] uppercase tracking-[0.8px] mb-3">Resumo</h4>
            <div className="flex flex-col gap-2 text-[13px] font-['Inter:Regular',Inter,sans-serif]">
              <div className="flex justify-between"><span className="text-[#8c9ab0]">Status</span><StatusBadge status={form.status} /></div>
              <div className="flex justify-between"><span className="text-[#8c9ab0]">Capacidade</span><span className="font-bold text-[#051d30]">{form.capacity}</span></div>
              <div className="flex justify-between"><span className="text-[#8c9ab0]">Avaliação</span><span className="font-semibold text-[#00356a]">{EVALUATION_LABELS[form.evaluationType || "desafio"]}</span></div>
              <div className="flex justify-between"><span className="text-[#8c9ab0]">Iluminação</span><span className="text-[#051d30]">{form.lighting}</span></div>
              <div className="flex justify-between items-center pt-2 border-t border-[#c2d9f5]">
                <span className="text-[#8c9ab0]">Regras PDF</span>
                <span className="font-bold text-[#00356a] text-[12px] truncate max-w-[140px]" title={form.rulesFile?.name || "Não anexado"}>
                  {form.rulesFile?.name ? form.rulesFile.name : "Não anexado"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-between items-center pt-6 mt-4 border-t border-[#e2e8f0]">
        <button onClick={onCancel} className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[13px] tracking-[0.8px] uppercase text-[#475569] px-6 py-3 rounded-[6px] border border-[rgba(194,198,210,0.8)] hover:bg-[#f7f9ff] transition-colors">CANCELAR</button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[13px] tracking-[1px] uppercase px-8 py-3 rounded-[6px] hover:bg-[#00468a] disabled:opacity-60 transition-all shadow-[0_4px_12px_rgba(0,53,106,0.25)] hover:shadow-[0_6px_20px_rgba(0,53,106,0.35)]"
        >
          {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> SALVANDO...</> : (isEdit ? "SALVAR ALTERAÇÕES" : "CRIAR ARENA")}
        </button>
      </div>
    </div>
  );
}

// ─── Status Table ────────────────────────────────────────────────────────────
function StatusTable({ arenas, onEdit, onDelete, onTeams, onRules }: { arenas: Arena[]; onEdit: (a: Arena) => void; onDelete: (a: Arena) => void; onTeams: (a: Arena) => void; onRules: (a: Arena) => void }) {
  const cols = ["Arena", "Status", "Capacidade", "Equipes", "Avaliação", "Regras", "Ações"];
  return (
    <div className="bg-white rounded-[8px] border border-[rgba(194,198,210,0.4)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(194,198,210,0.3)]">
        <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[15px]">Status Operacional</h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-['Inter:Regular',Inter,sans-serif] text-[12px] text-green-600">Sistema Operacional</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
         <thead>
          <tr className="bg-[#f7f9ff]">
            {cols.map((c) => (
              <th key={c} className="px-4 py-3 text-left font-['Inter:Bold',Inter,sans-serif] font-bold text-[11px] tracking-[0.8px] uppercase text-[#8c9ab0]">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {arenas.map((a, i) => (
            <tr key={a.id} className={`border-t border-[rgba(194,198,210,0.2)] hover:bg-[#f7f9ff] transition-colors ${i % 2 === 0 ? "" : ""}`}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[4px] overflow-hidden bg-[#cfe5ff] shrink-0">
                    <img src={a.image} alt={a.name} className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                  </div>
                  <span className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[#051d30] text-[13px] whitespace-nowrap">{a.name}</span>
                </div>
              </td>
              <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
              <td className="px-4 py-3 font-['Inter:Regular',Inter,sans-serif] text-[13px] text-[#051d30]">{a.capacity}</td>
              <td className="px-4 py-3 font-['Inter:Regular',Inter,sans-serif] text-[13px] text-[#051d30]">{a.teams.length}</td>
              <td className="px-4 py-3 font-['Inter:Bold',Inter,sans-serif] font-bold text-[13px] text-[#00356a]">{EVALUATION_LABELS[a.evaluationType || a.tipoAvaliacao || "desafio"]}</td>
              <td className="px-4 py-3">
                {Boolean(a.rulesFile && a.rulesFile.name) ? (
                  <button
                    onClick={() => onRules(a)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold text-[#9a5b13] bg-[#fffbeb] border border-[#fde68a] hover:bg-[#fef3c7] px-2.5 py-1 rounded-[4px] transition-colors cursor-pointer"
                    title={`PDF: ${a.rulesFile.name}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    {a.rulesFile.name.length > 12 ? a.rulesFile.name.slice(0, 11) + "..." : a.rulesFile.name}
                  </button>
                ) : (
                  <button
                    onClick={() => onRules(a)}
                    className="inline-flex items-center gap-1 text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold text-[#00356a] hover:underline cursor-pointer"
                    title="Subir regras para esta arena"
                  >
                    + Subir PDF
                  </button>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => onTeams(a)} className="text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[0.6px] uppercase text-[#00356a] hover:underline">Equipes</button>
                  <span className="text-[#c2c6d2]">·</span>
                  <button onClick={() => onEdit(a)} className="text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[0.6px] uppercase text-[#475569] hover:underline">Editar</button>
                  <span className="text-[#c2c6d2]">·</span>
                  <button onClick={() => onDelete(a)} className="text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[0.6px] uppercase text-[#ba1a1a] hover:underline">Excluir</button>
                </div>
              </td>
            </tr>
          ))}
         </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Teams View ──────────────────────────────────────────────────────────────
const TEAM_NAMES = ["Cyber-Dragons Alpha", "Torres Burns", "Iron Circuits", "Speed Demons", "Nitro Bots", "Robo-Tech Pro", "DanceBots MG", "Laser Squad", "Arc Welders", "Binary Storm", "Pixel Warriors", "Quantum Coders"];
const INSTITUTIONS = ["SENAC SP", "FATEC Campinas", "ETEC Zona Sul", "SENAC RJ", "FATEC Santos", "ETEC Centro", "SENAC MG"];

function TeamsView({ arena, onBack, onSave }: { arena: Arena; onBack: () => void; onSave: (teams: Team[]) => void }) {
  const [teams, setTeams] = useState<Team[]>(arena.teams);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newInst, setNewInst] = useState("SENAC SP");
  const [registeredTeams, setRegisteredTeams] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/equipes`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const names = data.map((t: any) => t.nome || t.name).filter(Boolean);
          if (names.length > 0) setRegisteredTeams(names);
        }
      })
      .catch((e) => console.error("Erro ao carregar equipes:", e));
  }, []);

  const addTeam = () => {
    if (!newName.trim()) return;
    setTeams((t) => [...t, { id: uid(), name: newName.trim(), institution: newInst, status: "Pendente" }]);
    setNewName("");
    setShowAdd(false);
  };

  const setStatus = (id: string, status: TeamStatus) =>
    setTeams((t) => t.map((tm) => tm.id === id ? { ...tm, status } : tm));

  const remove = (id: string) => setTeams((t) => t.filter((tm) => tm.id !== id));

  const counts = { Aprovado: teams.filter((t) => t.status === "Aprovado").length, Pendente: teams.filter((t) => t.status === "Pendente").length, Rejeitado: teams.filter((t) => t.status === "Rejeitado").length };

  return (
    <div className="flex flex-col gap-0 h-full">
      <div className="flex items-start gap-4 mb-6">
        <button onClick={onBack} className="mt-1 flex items-center gap-1.5 font-['Inter:Bold',Inter,sans-serif] font-bold text-[12px] tracking-[0.8px] uppercase text-[#00356a] hover:gap-2.5 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Voltar
        </button>
        <div>
          <h2 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[22px]">Gestão de Equipes por Arena</h2>
          <p className="font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] text-[13px] mt-0.5">Arena: <strong className="text-[#00356a]">{arena.name}</strong></p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total de Equipes", value: teams.length, color: "#00356a", bg: "#edf4ff" },
          { label: "Aprovadas", value: counts.Aprovado, color: "#15803d", bg: "#f0fdf4" },
          { label: "Pendentes", value: counts.Pendente, color: "#b45309", bg: "#fffbeb" },
          { label: "Rejeitadas", value: counts.Rejeitado, color: "#ba1a1a", bg: "#fff1f1" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-[8px] border border-[rgba(194,198,210,0.4)] p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[32px]" style={{ color }}>{String(value).padStart(2, "0")}</div>
            <div className="font-['Inter:Regular',Inter,sans-serif] text-[12px] text-[#8c9ab0] uppercase tracking-[0.5px]">{label}</div>
          </div>
        ))}
      </div>

      {/* Add team row */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[15px]">Equipes Cadastradas</h3>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-2 bg-[#00356a] text-white font-['Inter:Bold',Inter,sans-serif] font-bold text-[12px] tracking-[0.8px] uppercase px-4 py-2 rounded-[6px] hover:bg-[#00468a] transition-colors shadow-[0_2px_8px_rgba(0,53,106,0.2)]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Adicionar Equipe
        </button>
      </div>

      {showAdd && (
        <div className="bg-[#edf4ff] border border-[#c2d9f5] rounded-[8px] p-4 mb-4 flex gap-3 items-end" style={{ animation: "fadeDown 0.2s ease" }}>
          <div className="flex-1">
            <label className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[11px] uppercase tracking-[0.6px] text-[#051d30] mb-1 block">Nome da Equipe</label>
            <input
              list="registered-teams-list"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTeam()}
              placeholder="Ex: Robo Warriors (ou escolha equipe cadastrada)"
              className="w-full bg-white border border-[#e2e8f0] rounded-[6px] px-4 py-2.5 font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30] outline-none focus:border-[#00356a]"
            />

            <datalist id="registered-teams-list">
              {registeredTeams.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div className="w-44">
            <label className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[11px] uppercase tracking-[0.6px] text-[#051d30] mb-1 block">Instituição</label>
            <select value={newInst} onChange={(e) => setNewInst(e.target.value)} className="w-full bg-white border border-[#e2e8f0] rounded-[6px] px-3 py-2.5 font-['Inter:Regular',Inter,sans-serif] text-[13px] text-[#051d30] outline-none focus:border-[#00356a]">
              {INSTITUTIONS.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
          <button onClick={addTeam} className="bg-[#00356a] text-white font-['Inter:Bold',Inter,sans-serif] font-bold text-[12px] tracking-[0.8px] uppercase px-5 py-2.5 rounded-[6px] hover:bg-[#00468a] transition-colors whitespace-nowrap">Adicionar</button>
          <button onClick={() => setShowAdd(false)} className="px-3 py-2.5 border border-[rgba(194,198,210,0.8)] rounded-[6px] text-[#475569] hover:bg-white transition-colors">✕</button>
        </div>
      )}

      {/* Teams list */}
      <div className="bg-white rounded-[8px] border border-[rgba(194,198,210,0.4)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden flex-1 overflow-y-auto">
        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#8c9ab0]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <p className="font-['Inter:Regular',Inter,sans-serif] text-[14px] mt-3">Nenhuma equipe cadastrada nesta arena.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#f7f9ff] border-b border-[rgba(194,198,210,0.3)]">
                {["Equipe", "Instituição", "Status", "Ações"].map((c) => (
                  <th key={c} className="px-5 py-3 text-left font-['Inter:Bold',Inter,sans-serif] font-bold text-[11px] tracking-[0.8px] uppercase text-[#8c9ab0]">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-t border-[rgba(194,198,210,0.2)] hover:bg-[#f7f9ff] transition-colors">
                  <td className="px-5 py-3 font-['Inter:Bold',Inter,sans-serif] font-bold text-[#051d30] text-[14px]">{team.name}</td>
                  <td className="px-5 py-3 font-['Inter:Regular',Inter,sans-serif] text-[#475569] text-[13px]">{team.institution}</td>
                  <td className="px-5 py-3">
                    <select
                      value={team.status}
                      onChange={(e) => setStatus(team.id, e.target.value as TeamStatus)}
                      className={`text-[11px] font-bold tracking-[0.6px] uppercase px-2 py-1 rounded-[4px] border-0 outline-none cursor-pointer ${TEAM_COLORS[team.status]} bg-transparent`}
                    >
                      {(["Aprovado", "Pendente", "Rejeitado"] as TeamStatus[]).map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => remove(team.id)} className="text-[#ba1a1a] hover:underline font-['Inter:Bold',Inter,sans-serif] font-bold text-[11px] tracking-[0.6px] uppercase">Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-[#e2e8f0]">
        <button onClick={onBack} className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[13px] tracking-[0.8px] uppercase text-[#475569] px-6 py-3 rounded-[6px] border border-[rgba(194,198,210,0.8)] hover:bg-[#f7f9ff] transition-colors">CANCELAR</button>
        <button onClick={() => { onSave(teams); onBack(); }} className="bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[13px] tracking-[1px] uppercase px-8 py-3 rounded-[6px] hover:bg-[#00468a] transition-all shadow-[0_4px_12px_rgba(0,53,106,0.25)]">SALVAR EQUIPES</button>
      </div>
    </div>
  );
}

// ─── Challenges View (Gestão de Desafios) ────────────────────────────────────
function ChallengesView({
  arenaName,
  capacity,
  teamsCount,
  initialChallenges,
  onBack,
  onSaveChallenges,
}: {
  arenaName: string;
  capacity: number;
  teamsCount: number;
  initialChallenges: ChallengeObstacle[];
  onBack: () => void;
  onSaveChallenges?: (challenges: ChallengeObstacle[]) => void;
}) {
  const [challenges, setChallenges] = useState<ChallengeObstacle[]>(
    Array.isArray(initialChallenges) ? initialChallenges : []
  );
  const [obsName, setObsName] = useState("");
  const [obsDesc, setObsDesc] = useState("");
  const [obsPoints, setObsPoints] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 3;

  useEffect(() => {
    setChallenges(Array.isArray(initialChallenges) ? initialChallenges : []);
  }, [initialChallenges]);

  const totalPoints = challenges.reduce((acc, c) => acc + (Number(c.maxPoints) || 0), 0);
  const formattedTotalPoints = totalPoints.toLocaleString("pt-BR");
  const totalPages = Math.max(1, Math.ceil(challenges.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedChallenges = challenges.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSaveObstacle = () => {
    const cleanName = obsName.trim();
    if (!cleanName) return;
    const pts = Math.max(0, Number(obsPoints) || 0);

    let updated: ChallengeObstacle[];
    if (editingId) {
      updated = challenges.map((c) =>
        c.id === editingId
          ? { ...c, name: cleanName, description: obsDesc.trim(), maxPoints: pts }
          : c
      );
      setEditingId(null);
    } else {
      const newObs: ChallengeObstacle = {
        id: `obs-${uid()}`,
        name: cleanName,
        description: obsDesc.trim() || "Obstáculo técnico configurado para avaliação de precisão.",
        maxPoints: pts,
      };
      updated = [...challenges, newObs];
    }

    setChallenges(updated);
    if (typeof onSaveChallenges === "function") {
      onSaveChallenges(updated);
    }
    setObsName("");
    setObsDesc("");
    setObsPoints("");
  };

  const handleEditClick = (obs: ChallengeObstacle) => {
    setEditingId(obs.id);
    setObsName(obs.name);
    setObsDesc(obs.description);
    setObsPoints(String(obs.maxPoints));
  };

  const handleDeleteClick = (id: string) => {
    const updated = challenges.filter((c) => c.id !== id);
    setChallenges(updated);
    if (typeof onSaveChallenges === "function") {
      onSaveChallenges(updated);
    }
    if (editingId === id) {
      setEditingId(null);
      setObsName("");
      setObsDesc("");
      setObsPoints("");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-6xl">
      {/* Breadcrumb line matching mockup */}
      <div className="flex items-center gap-2 text-[12px] font-['Inter:Regular',Inter,sans-serif] text-[#64748b]">
        <button onClick={onBack} className="hover:text-[#00356a] transition-colors cursor-pointer">
          Arenas
        </button>
        <span>›</span>
        <button onClick={onBack} className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[#00356a] hover:underline cursor-pointer">
          Editar Arena
        </button>
        <span>›</span>
        <span className="text-[#475569]">criação de desafios</span>
      </div>

      {/* Back link + Title */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[12px] font-['Inter:Bold',Inter,sans-serif] font-bold text-[#0052cc] hover:text-[#00356a] transition-colors mb-3 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Voltar para tela anterior
        </button>

        <h1 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[32px] tracking-[-0.6px] leading-tight">
          Gestão de Desafios
        </h1>
        <p className="font-['Inter:Regular',Inter,sans-serif] text-[#475569] text-[14px] mt-1 max-w-xl leading-relaxed">
          {arenaName ? `${arenaName} — ` : ""}Defina parâmetros técnicos, níveis de complexidade e critérios de pontuação para o torneio de sustentabilidade.
        </p>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
        <div className="bg-[#eef4ff] rounded-[12px] px-6 py-5 border border-[#dce8fc]">
          <span className="text-[10px] font-['Inter:Bold',Inter,sans-serif] font-bold uppercase tracking-[0.8px] text-[#475569] block">
            TOTAL DE PONTOS POSSÍVEIS
          </span>
          <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[28px] text-[#00356a] mt-1 block leading-none">
            {formattedTotalPoints}
          </span>
        </div>

        <div className="bg-[#eef4ff] rounded-[12px] px-6 py-5 border border-[#dce8fc]">
          <span className="text-[10px] font-['Inter:Bold',Inter,sans-serif] font-bold uppercase tracking-[0.8px] text-[#475569] block">
            VAGAS
          </span>
          <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[28px] text-[#00356a] mt-1 block leading-none">
            {capacity}
          </span>
        </div>

        <div className="bg-[#eef4ff] rounded-[12px] px-6 py-5 border border-[#dce8fc]">
          <span className="text-[10px] font-['Inter:Bold',Inter,sans-serif] font-bold uppercase tracking-[0.8px] text-[#475569] block">
            EQUIPES INSCRITAS
          </span>
          <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[28px] text-[#00356a] mt-1 block leading-none">
            {teamsCount}
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-2">
        {/* Left Card: Novo Obstáculo */}
        <div className="lg:col-span-5 bg-white rounded-[16px] border border-[#e2e8f0] p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[16px]">
              {editingId ? "Editar Obstáculo" : "Novo Obstáculo"}
            </h3>
            <span className="w-6 h-6 rounded-full border-2 border-[#9a4d00] text-[#9a4d00] flex items-center justify-center font-bold text-sm leading-none">
              +
            </span>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <label className="block font-['Inter:Bold',Inter,sans-serif] font-bold text-[10px] tracking-[0.8px] uppercase text-[#475569] mb-2">
                NOME DO OBSTÁCULO
              </label>
              <input
                type="text"
                value={obsName}
                onChange={(e) => setObsName(e.target.value)}
                placeholder="Ex: Ponte Basculante"
                className="w-full bg-[#eef4ff] border border-transparent focus:border-[#00356a] focus:bg-white rounded-[8px] px-4 py-3 text-[13px] text-[#051d30] placeholder-[#94a3b8] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-['Inter:Bold',Inter,sans-serif] font-bold text-[10px] tracking-[0.8px] uppercase text-[#475569] mb-2">
                DESCRIÇÃO TÉCNICA
              </label>
              <textarea
                rows={4}
                value={obsDesc}
                onChange={(e) => setObsDesc(e.target.value)}
                placeholder="Detalhes de sensores e mecânica..."
                className="w-full bg-[#eef4ff] border border-transparent focus:border-[#00356a] focus:bg-white rounded-[8px] px-4 py-3 text-[13px] text-[#051d30] placeholder-[#94a3b8] outline-none transition-all resize-none"
              />
            </div>

            <div>
              <label className="block font-['Inter:Bold',Inter,sans-serif] font-bold text-[10px] tracking-[0.8px] uppercase text-[#475569] mb-2">
                PONTUAÇÃO MÁXIMA
              </label>
              <input
                type="number"
                min={0}
                value={obsPoints}
                onChange={(e) => setObsPoints(e.target.value)}
                placeholder="500"
                className="w-full bg-[#eef4ff] border border-transparent focus:border-[#00356a] focus:bg-white rounded-[8px] px-4 py-3 text-[13px] text-[#051d30] placeholder-[#94a3b8] outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveObstacle}
                className="w-full bg-[#00468a] hover:bg-[#00356a] text-white font-['Inter:Bold',Inter,sans-serif] font-bold text-[11px] tracking-[1px] uppercase py-3.5 rounded-[8px] transition-all shadow-[0_4px_12px_rgba(0,53,106,0.2)] cursor-pointer"
              >
                {editingId ? "SALVAR ALTERAÇÕES DO OBSTÁCULO" : "ADICIONAR NOVO OBSTÁCULO"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setObsName("");
                    setObsDesc("");
                    setObsPoints("");
                  }}
                  className="w-full text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 py-2 cursor-pointer"
                >
                  Cancelar Edição
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Obstáculos Cadastrados */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[16px]">
              Obstáculos Cadastrados
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="w-8 h-8 rounded-[6px] bg-[#eef4ff] text-[#00356a] flex items-center justify-center hover:bg-[#dce8fc] transition-colors"
                title="Filtrar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-[6px] bg-[#eef4ff] text-[#00356a] flex items-center justify-center hover:bg-[#dce8fc] transition-colors"
                title="Visualização em Lista"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          {challenges.length === 0 ? (
            <div className="bg-white rounded-[14px] border border-[#e2e8f0] p-10 text-center text-[#64748b] text-sm">
              Nenhum obstáculo cadastrado ainda. Adicione o primeiro obstáculo no formulário ao lado.
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {paginatedChallenges.map((obs) => (
                <div
                  key={obs.id}
                  className="bg-white rounded-[14px] border border-[#eef2f6] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#c2d9f5] transition-all"
                >
                  <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[15px]">
                    {obs.name}
                  </h4>
                  <p className="font-['Inter:Regular',Inter,sans-serif] text-[#475569] text-[13px] mt-1 line-clamp-2">
                    {obs.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-[#334155] text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold mt-2.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                      <path d="M4 22h16" />
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                    </svg>
                    <span>{obs.maxPoints} Pontos</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleEditClick(obs)}
                      className="text-[#475569] hover:text-[#00356a] transition-colors cursor-pointer"
                      title="Editar obstáculo"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(obs.id)}
                      className="text-[#ba1a1a] hover:text-red-700 transition-colors cursor-pointer"
                      title="Excluir obstáculo"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer pagination matching mockup */}
          <div className="flex items-center justify-between text-[11px] font-['Inter:Regular',Inter,sans-serif] text-[#64748b] pt-2">
            <span>
              Mostrando {paginatedChallenges.length} de {challenges.length} obstáculos cadastrados
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="disabled:opacity-40 hover:text-[#051d30] cursor-pointer"
              >
                ‹
              </button>
              <span className="font-semibold text-[#334155]">
                Página {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="disabled:opacity-40 hover:text-[#051d30] cursor-pointer"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ArenasPage ─────────────────────────────────────────────────────────
export default function ArenasPage({ onNavigate, onLogout }: { onNavigate: (key: string) => void; onLogout: () => void }) {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<PageView>("list");
  const [selected, setSelected] = useState<Arena | null>(null);
  const [draftForm, setDraftForm] = useState<ArenaFormData | null>(null);
  const [returnFormView, setReturnFormView] = useState<"create" | "edit">("edit");
  const [deleteTarget, setDeleteTarget] = useState<Arena | null>(null);
  const [rulesTarget, setRulesTarget] = useState<Arena | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchArenas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/arenas`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setArenas(data);
    } catch (err: any) {
      console.error("Falha ao carregar arenas:", err);
      showToast("Erro ao conectar à API do MongoDB. Verifique o backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArenas();
  }, []);

  const navigate = (key: string) => {
    if (key === "arenas") setView("list");
    else onNavigate(key);
  };

  const openCreate = () => { setSelected(null); setDraftForm(null); setView("create"); };
  const openEdit = (a: Arena) => { setSelected(a); setDraftForm(null); setView("edit"); };
  const openTeams = (a: Arena) => { setSelected(a); setView("teams"); };
  const goList = () => { setSelected(null); setDraftForm(null); setView("list"); };

  const openChallenges = (currentForm: ArenaFormData, fromView: "create" | "edit") => {
    setDraftForm(currentForm);
    setReturnFormView(fromView);
    setView("challenges");
  };

  const handleSaveChallenges = async (challenges: ChallengeObstacle[]) => {
    setDraftForm((prev) => (prev ? { ...prev, challenges } : prev));
    if (selected?.id) {
      const updatedArena: Arena = { ...selected, challenges };
      setSelected(updatedArena);
      setArenas((prev) => prev.map((a) => (a.id === selected.id ? updatedArena : a)));
      try {
        await fetch(`${API_BASE_URL}/api/v1/arenas/${selected.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...(draftForm || updatedArena),
            challenges,
            evaluationType: (draftForm?.evaluationType || selected.evaluationType || "desafio"),
            tipoAvaliacao: (draftForm?.evaluationType || selected.evaluationType || "desafio"),
          }),
        });
      } catch (e) {
        console.error("Erro ao sincronizar desafios da arena:", e);
      }
    }
    showToast("Lista de obstáculos de desafio atualizada!");
  };

  
  const handleSaveRules = async (arenaId: string, rulesFile: ArenaRuleFile | null) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/arenas/${arenaId}/rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rulesFile }),
      });
      if (!res.ok) throw new Error("Falha ao salvar regras");
      const updated = await res.json();
      setArenas((prev) => prev.map((a) => (a.id === arenaId ? updated : a)));
      showToast(rulesFile ? `Regras PDF da arena "${updated.name}" salvas com sucesso!` : "Regras removidas com sucesso.");
      setRulesTarget(null);
    } catch (err) {
      console.error(err);
      setArenas((prev) => prev.map((a) => (a.id === arenaId ? { ...a, rulesFile } : a)));
      showToast("Regras salvas localmente.");
      setRulesTarget(null);
    }
  };

  const handleCreate = async (f: ArenaFormData) => {
    const payload = {
      ...f,
      challenges: Array.isArray(f.challenges) ? f.challenges : [],
      evaluationType: f.evaluationType || "desafio",
      tipoAvaliacao: f.evaluationType || "desafio",
      rulesFile: f.rulesFile || null,
    };
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/arenas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Falha ao criar arena");
      const created = await res.json();
      setArenas((prev) => [...prev, created]);
      showToast(`Arena "${f.name}" (${EVALUATION_LABELS[payload.evaluationType]}) criada com sucesso no MongoDB!`);
      goList();
    } catch (err) {
      console.error(err);
      const arena: Arena = { ...payload, id: uid(), teams: [] };
      setArenas((prev) => [...prev, arena]);
      showToast(`Arena "${f.name}" salva localmente.`);
      goList();
    }
  };

  const handleEdit = async (f: ArenaFormData) => {
    if (!selected) return;
    const payload = {
      ...f,
      challenges: Array.isArray(f.challenges) ? f.challenges : Array.isArray(selected.challenges) ? selected.challenges : [],
      evaluationType: f.evaluationType || "desafio",
      tipoAvaliacao: f.evaluationType || "desafio",
      rulesFile: f.rulesFile !== undefined ? f.rulesFile : selected.rulesFile || null,
    };
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/arenas/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Falha ao atualizar arena");
      const updated = await res.json();
      setArenas((prev) => prev.map((a) => a.id === selected.id ? updated : a));
      showToast(`Arena "${f.name}" (${EVALUATION_LABELS[payload.evaluationType]}) atualizada no MongoDB!`);
      goList();
    } catch (err) {
      console.error(err);
      setArenas((prev) => prev.map((a) => a.id === selected.id ? { ...a, ...payload } : a));
      showToast(`Arena "${f.name}" atualizada!`);
      goList();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/arenas/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao excluir arena");
      setArenas((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      showToast(`Arena "${deleteTarget.name}" excluída do MongoDB.`);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      setArenas((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      showToast(`Arena "${deleteTarget.name}" excluída.`);
      setDeleteTarget(null);
    }
  };

  const handleSaveTeams = (arenaId: string) => async (teams: Team[]) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/arenas/${arenaId}/teams`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ teams }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar equipes");
      const updated = await res.json();
      setArenas((prev) => prev.map((a) => a.id === arenaId ? updated : a));
      showToast("Equipes salvas no MongoDB com sucesso!");
    } catch (err) {
      console.error(err);
      setArenas((prev) => prev.map((a) => a.id === arenaId ? { ...a, teams } : a));
      showToast("Equipes atualizadas!");
    }
  };

  const topBarTitle =
    view === "list"
      ? "Gestão de Arenas"
      : view === "create"
      ? "Nova Arena"
      : view === "edit"
      ? `Editar: ${selected?.name}`
      : view === "challenges"
      ? "Gestão de Desafios"
      : `Equipes — ${selected?.name}`;
  const breadcrumb = [
    "Admin",
    "Arenas",
    ...(view === "challenges"
      ? ["Editar Arena", "criação de desafios"]
      : view !== "list"
      ? [view === "create" ? "Nova" : view === "edit" ? "Editar" : "Equipes"]
      : []),
  ];

  return (
    <div className="fixed inset-0 bg-[#f7f9ff] z-[800]" style={{ animation: "fadeInPage 0.3s ease both" }}>
      <style>{`
        @keyframes fadeInPage { from { opacity:0; } to { opacity:1; } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes toastSlide { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
      `}</style>

      <AdminSidebar active="arenas" onNavigate={navigate} onLogout={onLogout} />

      <TopBar title={topBarTitle} breadcrumb={breadcrumb}>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            API ONLINE (MongoDB Atlas)
          </span>
          {view === "list" && (
            <button onClick={openCreate} className="flex items-center gap-2 bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1px] uppercase px-5 py-2.5 rounded-[6px] hover:bg-[#00468a] transition-all shadow-[0_4px_12px_rgba(0,53,106,0.2)] hover:shadow-[0_6px_20px_rgba(0,53,106,0.3)]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Nova Arena
            </button>
          )}
        </div>
      </TopBar>

      {/* Main content */}
      <main className="absolute top-[64px] left-0 md:left-[256px] right-0 bottom-0 overflow-y-auto p-6 sm:p-8 lg:px-10">
        {/* List view */}
        {view === "list" && (
          <div className="flex flex-col gap-8 w-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-[#8c9ab0]">
                <div className="w-10 h-10 border-3 border-[#00356a] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[16px]">Carregando arenas do MongoDB Atlas...</p>
              </div>
            ) : arenas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-[#8c9ab0]">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="5" width="18" height="13" rx="2"/><path d="M3 9H21"/><path d="M8 5V3M16 5V3"/></svg>
                <p className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[18px] mt-4">Nenhuma arena cadastrada</p>
                <p className="font-['Inter:Regular',Inter,sans-serif] text-[14px] mt-1 mb-6">Crie sua primeira arena de competição.</p>
                <button onClick={openCreate} className="bg-[#00356a] text-white font-bold text-[13px] tracking-[1px] uppercase px-8 py-3 rounded-[6px] hover:bg-[#00468a] transition-colors shadow-[0_4px_12px_rgba(0,53,106,0.25)]">Criar Arena</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {arenas.map((a) => (
                    <ArenaCard key={a.id} arena={a} onEdit={() => openEdit(a)} onDelete={() => setDeleteTarget(a)} onTeams={() => openTeams(a)} onRules={() => setRulesTarget(a)} />
                  ))}
                </div>
                <StatusTable arenas={arenas} onEdit={openEdit} onDelete={(a) => setDeleteTarget(a)} onTeams={openTeams} onRules={(a) => setRulesTarget(a)} />
              </>
            )}
          </div>
        )}


        {/* Create view */}
        {view === "create" && (
          <div className="w-full h-full flex flex-col" style={{ animation: "fadeDown 0.25s ease" }}>
            <ArenaForm
              initial={draftForm || EMPTY_FORM}
              isEdit={false}
              onSave={handleCreate}
              onCancel={goList}
              onConfigureChallenges={(f) => openChallenges(f, "create")}
            />
          </div>
        )}

        {/* Edit view */}
        {view === "edit" && selected && (
          <div className="w-full h-full flex flex-col" style={{ animation: "fadeDown 0.25s ease" }}>
            <ArenaForm
              initial={
                draftForm || {
                  name: selected.name,
                  description: selected.description,
                  status: selected.status,
                  capacity: selected.capacity,
                  dimensions: selected.dimensions,
                  noiseLevel: selected.noiseLevel,
                  lighting: selected.lighting,
                  validationType: selected.validationType,
                  evaluationType: selected.evaluationType || selected.tipoAvaliacao || "desafio",
                  restrictedAccess: selected.restrictedAccess,
                  requiresJudge: selected.requiresJudge,
                  image: selected.image,
                  challenges: Array.isArray(selected.challenges) ? selected.challenges : [],
                  rulesFile: selected.rulesFile || null,
                }
              }
              isEdit={true}
              onSave={handleEdit}
              onCancel={goList}
              onConfigureChallenges={(f) => openChallenges(f, "edit")}
            />
          </div>
        )}

        {/* Challenges view */}
        {view === "challenges" && (
          <div className="w-full flex flex-col" style={{ animation: "fadeDown 0.25s ease" }}>
            <ChallengesView
              arenaName={draftForm?.name || (returnFormView === "edit" ? selected?.name : "") || ""}
              capacity={
                draftForm?.capacity !== undefined
                  ? draftForm.capacity
                  : returnFormView === "edit" && selected
                  ? selected.capacity
                  : 0
              }
              teamsCount={returnFormView === "edit" && selected ? selected.teams?.length || 0 : 0}
              initialChallenges={
                Array.isArray(draftForm?.challenges)
                  ? draftForm.challenges
                  : returnFormView === "edit" && Array.isArray(selected?.challenges)
                  ? selected.challenges
                  : []
              }
              onBack={() => setView(returnFormView)}
              onSaveChallenges={handleSaveChallenges}
            />
          </div>
        )}

        {/* Teams view */}
        {view === "teams" && selected && (
          <div className="w-full flex flex-col" style={{ animation: "fadeDown 0.25s ease" }}>
            <TeamsView arena={arenas.find((a) => a.id === selected.id) || selected} onBack={goList} onSave={handleSaveTeams(selected.id)} />
          </div>
        )}
      </main>

      {/* Rules modal */}
      {rulesTarget && (
        <RulesModal
          arena={rulesTarget}
          onSave={(f) => handleSaveRules(rulesTarget.id, f)}
          onCancel={() => setRulesTarget(null)}
        />
      )}

      {/* Delete modal */}
      {deleteTarget && <DeleteModal arena={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] bg-[#051d30] text-white px-5 py-3 rounded-[4px] shadow-2xl border-l-4 border-[#00f2ff] font-['Inter:Regular',Inter,sans-serif] text-[13px] flex items-center gap-3" style={{ animation: "toastSlide 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00f2ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {toast}
        </div>
      )}
    </div>
  );
}
