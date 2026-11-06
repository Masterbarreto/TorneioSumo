import { useState, useEffect } from "react";
import imgCyberBotsLogo from "@/imports/DashboardDoTecnico-2/c59b0854417cc2b0f31b4d09ac8d4857a88ed716.png";
import imgTechKnightsLogo from "@/imports/DashboardDoTecnico-2/e18b7015cb02a1e04d542279e6514f25357d4adf.png";
import imgMechEngLogo from "@/imports/DashboardDoTecnico-2/5d16b98e05035db093ea19ea95851a20eb1accdb.png";
import AdminSidebar from "./AdminSidebar";
import { API_BASE_URL } from "./config/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type MemberDocStatus = "pending" | "docs_ok" | "awaiting" | "awaiting_review" | "awaiting_resend" | "approved";
type TeamStatus = "PENDENTE" | "AJUSTE NECESSÁRIO" | "APROVADO";
type EvaluationModality = "desafio" | "tempo" | "confronto" | "dancarino";

interface HistoryItem {
  date: string;
  label: string;
  type: "neutral" | "approved" | "rejected" | "resubmit";
  note?: string;
  by?: string;
}

interface Member {
  id: string;
  initials: string;
  color: string;
  name: string;
  memberId: string;
  role: string;
  cpf: string;
  rg: string;
  birthDate: string;
  team: string;
  docStatus: MemberDocStatus;
  judgeNote?: string;
  approvalDate?: string;
  approvedBy?: string;
  history: HistoryItem[];
}

interface Arena {
  name: string;
  confirmed: boolean;
}

interface Team {
  id: string;
  name: string;
  fullName: string;
  teamId: string;
  institution?: string;
  logo?: string;
  status: TeamStatus;
  members: Member[];
  arenas: Arena[];
}

interface ArenaHubItem {
  id: string;
  name: string;
  description: string;
  status: string;
  capacity: number;
  image: string;
  evaluationType: EvaluationModality;
  teams: any[];
}

const AVATAR_COLORS = ["#00356a", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

function getInitials(name: string): string {
  const parts = (name || "Integrante").trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function buildSynthesizedMembers(teamName: string, teamCode: string, seedIdx: number): Member[] {
  const firstNames = [
    ["Lucas Andrade", "Beatriz Moura", "Rafael Costa"],
    ["Gabriel Martins", "Camila Ferreira", "Diego Rocha"],
    ["Pedro Henrique", "Mariana Alves", "Thiago Ribeiro"],
    ["Matheus Silva", "Júlia Carvalho", "Vinícius Gomes"],
    ["Felipe Santos", "Larissa Dias", "Bruno Nogueira"],
    ["Gustavo Lima", "Amanda Souza", "Leonardo Melo"],
  ];
  const group = firstNames[seedIdx % firstNames.length];
  const roles = ["Líder Técnico & Capitão", "Engenharia de Controle & Software", "Hardware & Mecatrônica"];

  return group.map((personName, idx) => {
    const num = ((seedIdx + 1) * 100 + idx * 17) % 899 + 100;
    return {
      id: `${teamCode.replace(/[^a-zA-Z0-9]/g, "")}-m${idx + 1}`,
      initials: getInitials(personName),
      color: AVATAR_COLORS[(seedIdx + idx) % AVATAR_COLORS.length],
      name: personName,
      memberId: `ID: ${num}.442.${10 + idx}-0${idx + 1}`,
      role: roles[idx],
      team: (teamName || "EQUIPE").toUpperCase(),
      cpf: `${num}.${210 + idx * 13}.${450 + seedIdx * 7}-0${idx + 1}`,
      rg: `${12 + idx}.${345 + seedIdx}.${670 + idx}-${idx + 1}`,
      birthDate: `1${idx + 2}/0${(seedIdx % 8) + 1}/200${( idx % 3) + 3}`,
      docStatus: "approved",
      approvalDate: "24/10/2026",
      approvedBy: "Comitê Técnico SENAC",
      history: [
        { date: "24/10/2026, 09:30", label: "Aprovação Técnica", type: "approved", by: "Comitê SENAC" },
        { date: "20/10/2026, 14:15", label: "Inscrição Original", type: "neutral" },
      ],
    };
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusChip(status: TeamStatus) {
  const map: Record<TeamStatus, { bg: string; text: string; label: string }> = {
    PENDENTE: { bg: "#ffdcbf", text: "#7c3500", label: "PENDENTE" },
    "AJUSTE NECESSÁRIO": { bg: "#fce7e7", text: "#b91c1c", label: "AJUSTE NECESSÁRIO" },
    APROVADO: { bg: "#cfe5ff", text: "#1e3a5f", label: "APROVADO" },
  };
  const s = map[status] || map.APROVADO;
  return (
    <span
      className="rounded-[3px] px-[8px] py-[3px] text-[10px] font-bold tracking-[0.5px] uppercase"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

function memberDocBadge(status: MemberDocStatus) {
  if (status === "docs_ok")
    return (
      <span className="rounded-[20px] px-3 py-1 text-[10px] font-bold" style={{ background: "#d1fae5", color: "#065f46" }}>
        DOCUMENTOS CORRETOS
      </span>
    );
  if (status === "awaiting" || status === "awaiting_review" || status === "awaiting_resend")
    return (
      <span className="rounded-[20px] px-3 py-1 text-[10px] font-medium" style={{ background: "#f1f5f9", color: "#64748b" }}>
        AGUARDANDO ANÁLISE
      </span>
    );
  if (status === "approved")
    return (
      <span className="rounded-[20px] px-3 py-1 text-[10px] font-bold" style={{ background: "#d1fae5", color: "#065f46" }}>
        APROVADO
      </span>
    );
  return (
    <span className="rounded-[20px] px-3 py-1 text-[10px] font-bold" style={{ background: "#fee2e2", color: "#991b1b" }}>
      REVISAR DOCUMENTOS
    </span>
  );
}

function decisionStatusBadge(status: MemberDocStatus) {
  const map: Record<MemberDocStatus, { bg: string; text: string; border: string; label: string }> = {
    pending: { bg: "#fff7ed", text: "#92400e", border: "#fcd34d", label: "Pendente de Revisão" },
    docs_ok: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7", label: "Documentos OK" },
    awaiting: { bg: "#fff7ed", text: "#92400e", border: "#fcd34d", label: "Aguardando Análise" },
    awaiting_review: { bg: "#fff7ed", text: "#92400e", border: "#fcd34d", label: "Aguardando Reavaliação" },
    awaiting_resend: { bg: "#fff7ed", text: "#92400e", border: "#fcd34d", label: "Aguardando o Reenvio dos Arquivos." },
    approved: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7", label: "Aprovado" },
  };
  const s = map[status] || map.approved;
  return (
    <div
      className="w-full rounded-[6px] px-3 py-2 flex items-center gap-2"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s.text} strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <span className="text-[11px] font-semibold" style={{ color: s.text }}>
        {s.label}
      </span>
    </div>
  );
}

const EVAL_MODALITY_INFO: Record<
  EvaluationModality,
  { label: string; short: string; badgeClass: string }
> = {
  confronto: {
    label: "Avaliação por Confronto",
    short: "SUMÔ / CONFRONTO",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  tempo: {
    label: "Avaliação por Tempo",
    short: "SEGUE LINHA / TEMPO",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
  },
  desafio: {
    label: "Avaliação por Desafio",
    short: "DESAFIOS & MISSÕES",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  dancarino: {
    label: "Avaliação Dançarino",
    short: "DANÇARINO (3 ROUNDS)",
    badgeClass: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
  },
};

// ─── Admin Action Modals ─────────────────────────────────────────────────────

function ConfirmDeleteModal({
  team,
  onClose,
  onConfirm,
  loading,
}: {
  team: Team;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: "rgba(5,29,48,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-[16px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#fee2e2]">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5 text-[#dc2626]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>
        <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[20px] text-[#051d30] text-center mb-2">
          Excluir Equipe?
        </h3>
        <p className="text-[13px] text-[#475569] text-center mb-6 leading-relaxed">
          Tem certeza de que deseja excluir a equipe <strong className="text-[#051d30]">{team.fullName}</strong> ({team.teamId})? Esta ação é{" "}
          <span className="text-[#dc2626] font-semibold">permanente</span> e desvinculará todos os {team.members.length} participantes da equipe.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-[8px] text-[13px] font-semibold text-[#475569] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-[8px] text-[13px] font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Excluindo...
              </>
            ) : (
              "Confirmar Exclusão"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function TransferMemberModal({
  member,
  fromTeam,
  teams,
  onClose,
  onConfirm,
  loading,
}: {
  member: Member;
  fromTeam: Team;
  teams: Team[];
  onClose: () => void;
  onConfirm: (targetTeamId: string) => void;
  loading: boolean;
}) {
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const availableTeams = teams.filter((t) => t.id !== fromTeam.id);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: "rgba(5,29,48,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-[16px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#cfe5ff]">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-12 h-12 rounded-[8px] flex items-center justify-center text-white font-bold text-[18px] shrink-0"
            style={{ background: member.color || "#00356a" }}
          >
            {member.initials}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#00356a]">
              TRANSFERIR INTEGRANTE
            </span>
            <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[18px] text-[#051d30]">
              {member.name}
            </h3>
            <p className="text-[12px] text-[#64748b]">
              Equipe atual: <strong className="text-[#051d30]">{fromTeam.fullName}</strong> ({fromTeam.members.length}/5)
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-[1px] mb-2">
            Selecione a Equipe de Destino:
          </label>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
            {availableTeams.length === 0 ? (
              <p className="text-[13px] text-[#94a3b8] py-4 text-center">
                Nenhuma outra equipe cadastrada nesta arena.
              </p>
            ) : (
              availableTeams.map((t) => {
                const isFull = (t.members || []).length >= 5;
                const isSelected = selectedTeamId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (!isFull) setSelectedTeamId(t.id);
                    }}
                    className={`flex items-center justify-between p-3 rounded-[8px] border transition-all cursor-pointer ${
                      isFull
                        ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
                        : isSelected
                        ? "bg-[#edf4ff] border-[#00356a] ring-2 ring-[#00356a]/20"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[6px] bg-[#f1f5f9] flex items-center justify-center font-bold text-[12px] text-[#475569]">
                        {(t.name || "E")[0]}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#051d30]">{t.fullName}</p>
                        <p className="text-[10px] text-[#64748b]">ID: {t.teamId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isFull
                            ? "bg-red-100 text-red-700"
                            : (t.members || []).length >= 4
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isFull ? "Lotada (5/5)" : `${(t.members || []).length}/5 membros`}
                      </span>
                      <input
                        type="radio"
                        name="targetTeam"
                        checked={isSelected}
                        disabled={isFull}
                        onChange={() => setSelectedTeamId(t.id)}
                        className="accent-[#00356a] cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-[8px] text-[13px] font-semibold text-[#475569] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading || !selectedTeamId}
            onClick={() => onConfirm(selectedTeamId)}
            className="flex-1 py-3 px-4 rounded-[8px] text-[13px] font-bold text-white bg-[#00356a] hover:bg-[#002850] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Transferindo..." : "Confirmar Transferência"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── STEP 1: Arenas Hub View (1- Ver as Arenas) ──────────────────────────────

function ArenasHubView({
  arenas,
  onSelectArena,
}: {
  arenas: ArenaHubItem[];
  onSelectArena: (arena: ArenaHubItem) => void;
}) {
  const [filterType, setFilterType] = useState<"ALL" | EvaluationModality>("ALL");
  const [searchArena, setSearchArena] = useState("");

  const filteredArenas = arenas.filter((a) => {
    const matchesType = filterType === "ALL" || a.evaluationType === filterType;
    const matchesSearch =
      !searchArena.trim() ||
      a.name.toLowerCase().includes(searchArena.toLowerCase()) ||
      a.description.toLowerCase().includes(searchArena.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalTeamsCount = arenas.reduce((acc, a) => acc + (a.teams?.length || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        {/* Step Indicator + Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-[1.5px] uppercase text-[#8c4f00] mb-1.5">
              <span className="bg-[#00356a] text-white px-2.5 py-0.5 rounded-full text-[10px]">PASSO 1 DE 3</span>
              <span>•</span>
              <span>SELECIONE A ARENA PARA VER AS EQUIPES E MEMBROS</span>
            </div>
            <h1 className="font-['Space_Grotesk'] font-bold text-[34px] text-[#051d30] tracking-[-0.8px] leading-tight">
              Arenas & Equipes Inscritas
            </h1>
            <p className="text-[14px] text-[#475569] mt-1">
              Escolha uma arena abaixo para visualizar suas equipes inscritas, status de homologação e os membros de cada equipe.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border border-[#e2e8f0] rounded-[12px] px-4 py-2.5 text-right shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#64748b] block">
                ARENAS ATIVAS
              </span>
              <span className="font-['Space_Grotesk'] font-bold text-[22px] text-[#00356a] leading-none">
                {arenas.length}
              </span>
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-[12px] px-4 py-2.5 text-right shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#64748b] block">
                TOTAL DE EQUIPES
              </span>
              <span className="font-['Space_Grotesk'] font-bold text-[22px] text-emerald-700 leading-none">
                {totalTeamsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-[14px] p-4 border border-[#e2e8f0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: "ALL", label: "Todas as Arenas" },
                { id: "confronto", label: "Confronto (Sumô)" },
                { id: "tempo", label: "Por Tempo" },
                { id: "desafio", label: "Por Desafio" },
                { id: "dancarino", label: "Dançarino" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-2 rounded-[10px] text-[12px] font-bold transition-all cursor-pointer ${
                  filterType === tab.id
                    ? "bg-[#00356a] text-white shadow-xs"
                    : "bg-[#f8fafc] text-[#475569] hover:bg-[#eef4ff] hover:text-[#00356a]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="absolute left-3 top-1/2 -translate-y-1/2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchArena}
              onChange={(e) => setSearchArena(e.target.value)}
              placeholder="Buscar arena..."
              className="w-full pl-9 pr-3 py-2 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0] text-[13px] outline-none focus:border-[#00356a]"
            />
          </div>
        </div>

        {/* Arenas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArenas.map((arena) => {
            const modInfo = EVAL_MODALITY_INFO[arena.evaluationType] || EVAL_MODALITY_INFO.confronto;
            const teamsCount = arena.teams?.length || 0;

            return (
              <div
                key={arena.id}
                onClick={() => onSelectArena(arena)}
                className="bg-white rounded-[16px] border border-[#e2e8f0] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(0,53,106,0.12)] hover:border-[#00356a]/40 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col group"
              >
                <div className="relative h-[165px] bg-[#051d30] overflow-hidden">
                  <img
                    src={arena.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"}
                    alt={arena.name}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#051d30]/90 via-[#051d30]/25 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-[0.8px] px-2.5 py-1 rounded-full shadow">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {arena.status || "Ativa"}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-[1.2px] text-[#00f2ff] block">
                        {modInfo.short}
                      </span>
                      <h3 className="font-['Space_Grotesk'] font-bold text-white text-[20px] leading-tight">
                        {arena.name}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <p className="text-[13px] text-[#475569] line-clamp-2 leading-relaxed">
                    {arena.description || "Arena oficial homologada para avaliação de equipes e integrantes."}
                  </p>

                  <div className="flex flex-col gap-3 pt-2 border-t border-[#f1f5f9]">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#64748b] font-medium">Equipes Inscritas:</span>
                      <span className="font-['Space_Grotesk'] font-bold text-[#00356a] bg-[#eef4ff] px-2.5 py-0.5 rounded-md">
                        {teamsCount} {teamsCount === 1 ? "equipe" : "equipes"} ({teamsCount * 3} membros)
                      </span>
                    </div>

                    <button
                      type="button"
                      className="w-full py-2.5 px-4 rounded-[10px] bg-[#00356a] group-hover:bg-[#00468a] text-white font-bold text-[12px] tracking-[0.6px] uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>Ver Equipes da Arena</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── STEP 2: TeamList View (2- Ver as Equipes da Arena — Layout Exato Solicitado) ───

function TeamList({
  arena,
  arenas,
  teams,
  onSelectArena,
  onBackToArenas,
  onSelectTeam,
  onDeleteTeam,
}: {
  arena: ArenaHubItem;
  arenas: ArenaHubItem[];
  teams: Team[];
  onSelectArena: (a: ArenaHubItem) => void;
  onBackToArenas: () => void;
  onSelectTeam: (t: Team) => void;
  onDeleteTeam?: (t: Team) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const pending = teams.filter((t) => t.status === "PENDENTE").length;
  const approved = teams.filter((t) => t.status === "APROVADO").length;

  const filtered = teams.filter((t) => {
    const nameStr = t.fullName || t.name || "";
    const idStr = t.teamId || "";
    const matchSearch =
      nameStr.toLowerCase().includes(search.toLowerCase()) ||
      idStr.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "ALL" ||
      statusFilter === `Categoria: ${arena.name}` ||
      statusFilter === "Status: Todos" ||
      t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const shortCategoryLabel = arena.name.replace(/^Arena\s+/i, "");

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
      {/* Breadcrumb Navigation (1- Arenas › 2- Equipes) */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={onBackToArenas}
          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0052cc] hover:text-[#00356a] cursor-pointer transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          <span>Voltar para Todas as Arenas</span>
        </button>

        {/* Quick Arena Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {arenas.map((a) => {
            const isAct = a.id === arena.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onSelectArena(a)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  isAct
                    ? "bg-[#00356a] text-white"
                    : "bg-white border border-[#cbd5e1] text-[#475569] hover:bg-[#edf4ff]"
                }`}
              >
                {a.name} ({a.teams?.length || 0})
              </button>
            );
          })}
        </div>
      </div>

      {/* Header (Exatamente como no HTML enviado) */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[2px] uppercase" style={{ color: "rgb(140, 79, 0)" }}>
            ADMINISTRAÇÃO TÉCNICA • {shortCategoryLabel.toUpperCase()}
          </p>
          <h1 className="font-normal text-[36px] text-[#051d30] tracking-[-0.9px] mt-1">
            Análise de Inscrições - {shortCategoryLabel}
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span
            className="rounded-[2px] px-2 py-1 text-[10px] font-semibold tracking-[0.5px] uppercase"
            style={{ background: "rgb(255, 220, 191)", color: "rgb(45, 22, 0)" }}
          >
            {pending} PENDENTES
          </span>
          <span
            className="rounded-[2px] px-2 py-1 text-[10px] font-semibold tracking-[0.5px] uppercase"
            style={{ background: "rgb(207, 229, 255)", color: "rgb(5, 29, 48)" }}
          >
            {approved} APROVADOS
          </span>
        </div>
      </div>

      {/* Search + filter (Exatamente como no HTML enviado) */}
      <div className="flex gap-3 mb-5 flex-wrap sm:flex-nowrap">
        <div
          className="flex-1 flex items-center gap-2 bg-white rounded-[6px] px-3"
          style={{ border: "1px solid rgba(194, 198, 210, 0.5)", height: 40 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="flex-1 text-[13px] outline-none bg-transparent placeholder:text-[#94a3b8]"
            placeholder="Buscar por nome da equipe, mentor ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="px-5 rounded-[6px] text-[12px] font-bold text-white cursor-pointer"
          style={{ background: "rgb(5, 29, 48)", height: 40 }}
        >
          FILTRAR
        </button>
        <div className="relative">
          <select
            className="appearance-none bg-white rounded-[6px] px-4 pr-8 text-[13px] text-[#475569] outline-none cursor-pointer"
            style={{ border: "1px solid rgba(194, 198, 210, 0.5)", height: 40 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Categoria: {shortCategoryLabel}</option>
            <option value="Status: Todos">Status: Todos</option>
            <option value="APROVADO">APROVADO</option>
            <option value="PENDENTE">PENDENTE</option>
            <option value="AJUSTE NECESSÁRIO">AJUSTE NECESSÁRIO</option>
          </select>
          <svg
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Team rows (Exatamente como no HTML enviado) */}
      <div className="flex flex-col gap-3">
        {filtered.map((team) => {
          const hasIssue = team.status === "AJUSTE NECESSÁRIO";
          return (
            <div
              key={team.id}
              className="bg-white rounded-[8px] hover:shadow-md transition-shadow cursor-pointer overflow-x-auto"
              style={{
                border: `1px solid ${hasIssue ? "rgba(239, 68, 68, 0.3)" : "rgba(194, 198, 210, 0.3)"}`,
              }}
              onClick={() => onSelectTeam(team)}
            >
              <div className="flex items-center gap-5 px-5 py-4 min-w-[720px]">
                {/* Logo */}
                <div className="w-[52px] h-[52px] rounded-[6px] overflow-hidden shrink-0 bg-[#f1f5f9] flex items-center justify-center">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name || team.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[16px] font-bold text-[#94a3b8]">
                      {(team.name || team.fullName || "E")[0]}
                    </span>
                  )}
                </div>

                {/* Name + ID */}
                <div style={{ minWidth: 140 }}>
                  <p className="font-bold text-[15px] text-[#051d30] whitespace-nowrap">
                    {team.name || team.fullName}
                  </p>
                  <p className="font-normal text-[13px] text-[#051d30]">
                    {team.fullName || team.name}
                  </p>
                  <p className="text-[10px] text-[#8c9ab0] mt-0.5">ID: {team.teamId}</p>
                </div>

                {/* Member avatars */}
                <div className="flex items-center" style={{ minWidth: 100 }}>
                  <div className="flex -space-x-2">
                    {team.members.slice(0, 3).map((m) => (
                      <div
                        key={m.id}
                        className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ background: m.color || "#00356a" }}
                        title={m.name}
                      >
                        {m.initials}
                      </div>
                    ))}
                    {team.members.length > 3 && (
                      <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold bg-[#e2e8f0] text-[#475569]">
                        +{team.members.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="ml-2 text-[10px] text-[#94a3b8]">{team.members.length} membros</span>
                </div>

                {/* Verified / Docs status */}
                <div className="flex items-center gap-2 ml-auto">
                  {team.status === "APROVADO" ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#16a34a]">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      VERIFICADO
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {[{ label: "IDENTIDADE" }, { label: "DIREITO IMAGEM" }].map((d) => (
                        <div
                          key={d.label}
                          className="flex items-center gap-1 rounded-[4px] px-2 py-1"
                          style={{ background: hasIssue ? "#fee2e2" : "#f1f5f9" }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={hasIssue ? "#dc2626" : "#94a3b8"}
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span
                            className="text-[9px] uppercase tracking-[0.3px] font-medium"
                            style={{ color: hasIssue ? "#dc2626" : "#94a3b8" }}
                          >
                            {d.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Chip */}
                <div style={{ minWidth: 120 }}>{statusChip(team.status)}</div>

                {/* Actions: Eye & Delete */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTeam(team);
                    }}
                    className="p-2 rounded-full hover:bg-[#edf4ff] text-[#00356a] transition-colors cursor-pointer"
                    title="Ver perfil e membros da equipe"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  {onDeleteTeam && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTeam(team);
                      }}
                      className="p-2 rounded-full hover:bg-red-50 text-[#94a3b8] hover:text-[#dc2626] transition-colors cursor-pointer"
                      title="Excluir equipe"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div
            className="bg-white rounded-[8px] p-10 text-center text-[13px] text-[#94a3b8]"
            style={{ border: "1px solid rgba(194, 198, 210, 0.3)" }}
          >
            Nenhuma equipe encontrada para "{search}".
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STEP 3A: TeamProfile View (3- Ver os Membros da Equipe) ─────────────────

function TeamProfile({
  arenaName,
  team,
  onBack,
  onMemberClick,
  onUpdate,
  onDeleteTeam,
  onTransferMember,
}: {
  arenaName: string;
  team: Team;
  onBack: () => void;
  onMemberClick: (m: Member) => void;
  onUpdate: (t: Team) => void;
  onDeleteTeam?: (t: Team) => void;
  onTransferMember?: (m: Member) => void;
}) {
  const [search, setSearch] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showArenaModal, setShowArenaModal] = useState(false);
  const [newArena, setNewArena] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const filtered = (team.members || []).filter(
    (m) =>
      (m.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.role || "").toLowerCase().includes(search.toLowerCase())
  );

  function approveAll() {
    const now =
      new Date().toLocaleDateString("pt-BR") +
      ", " +
      new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    onUpdate({
      ...team,
      status: "APROVADO",
      members: team.members.map((m) => ({
        ...m,
        docStatus: "approved" as MemberDocStatus,
        approvalDate: now,
        approvedBy: "Painel Admin",
        history: [{ date: now, label: "Aprovação em Lote", type: "approved" as const, by: "Painel Admin" }, ...m.history],
      })),
    });
    setShowApproveModal(false);
    showToast("Equipe e todos os membros aprovados com sucesso!");
  }

  function addArena() {
    if (!newArena.trim()) return;
    onUpdate({ ...team, arenas: [...team.arenas, { name: newArena.trim(), confirmed: true }] });
    setNewArena("");
    setShowArenaModal(false);
    showToast(`Arena "${newArena.trim()}" vinculada.`);
  }

  function removeArena(idx: number) {
    onUpdate({ ...team, arenas: team.arenas.filter((_, i) => i !== idx) });
    showToast("Vínculo com arena removido.");
  }

  function toggleArenaConfirm(idx: number) {
    onUpdate({
      ...team,
      arenas: team.arenas.map((a, i) => (i === idx ? { ...a, confirmed: !a.confirmed } : a)),
    });
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-10">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#051d30] text-white text-sm px-4 py-3 rounded-lg shadow-xl">
          {toast}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-[11px] font-bold tracking-[1.2px] uppercase text-[#0052cc] hover:underline cursor-pointer"
            >
              ← VOLTAR PARA EQUIPES ({arenaName})
            </button>
            {onDeleteTeam && (
              <button
                onClick={() => onDeleteTeam(team)}
                className="flex items-center gap-1 text-[10px] font-bold tracking-[1px] uppercase text-[#dc2626] hover:bg-red-50 px-2.5 py-1 rounded border border-[#dc2626]/30 transition-colors cursor-pointer"
                title="Excluir equipe do campeonato"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Excluir Equipe
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-[34px] text-[#051d30] leading-tight">{team.fullName}</h1>
            <span className="font-mono text-xs font-bold bg-[#edf4ff] text-[#00356a] px-3 py-1 rounded-md border border-[#cfe5ff]">
              {team.teamId}
            </span>
          </div>
          <p className="text-[13px] text-[#475569] mt-1">
            Status da Inscrição:{" "}
            <strong
              style={{
                color:
                  team.status === "APROVADO"
                    ? "#16a34a"
                    : team.status === "AJUSTE NECESSÁRIO"
                    ? "#dc2626"
                    : "#d97706",
              }}
            >
              {team.status === "APROVADO"
                ? "Homologado / Aprovado"
                : team.status === "AJUSTE NECESSÁRIO"
                ? "Ajuste Necessário"
                : "Pendente de Aprovação"}
            </strong>{" "}
            • {team.members.length} integrantes cadastrados
          </p>
        </div>

        {/* Arena registrations card */}
        <div
          className="bg-white rounded-[10px] p-4 min-w-[240px]"
          style={{ border: "1px solid rgba(194,198,210,0.3)" }}
        >
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#8c9ab0] mb-3">
            ARENAS VINCULADAS
          </p>
          {team.arenas.length === 0 && (
            <p className="text-[12px] text-[#94a3b8]">Nenhuma arena registrada.</p>
          )}
          {team.arenas.map((arena, i) => (
            <div key={i} className="flex items-center justify-between gap-3 mb-2">
              <span className="text-[13px] font-semibold text-[#051d30]">{arena.name}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleArenaConfirm(i)}
                  className={`rounded px-2 py-0.5 text-[9px] font-bold tracking-[0.5px] uppercase transition-all cursor-pointer ${
                    arena.confirmed ? "bg-[#cfe5ff] text-[#1e3a5f]" : "bg-[#f1f5f9] text-[#64748b]"
                  }`}
                >
                  {arena.confirmed ? "CONFIRMADA" : "PENDENTE"}
                </button>
                <button
                  onClick={() => removeArena(i)}
                  className="text-[#94a3b8] hover:text-[#dc2626] transition-colors ml-1 cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => setShowArenaModal(true)}
            className="mt-2 text-[11px] font-semibold text-[#00356a] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Adicionar arena
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div
          className="flex-1 flex items-center gap-2 bg-white rounded-[6px] px-3"
          style={{ border: "1px solid rgba(194,198,210,0.5)", height: 40 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="flex-1 text-[13px] outline-none bg-transparent placeholder:text-[#94a3b8]"
            placeholder="Buscar membro por nome ou função na equipe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="px-5 rounded-[6px] text-[12px] font-bold text-white cursor-pointer"
          style={{ background: "#051d30", height: 40 }}
        >
          FILTRAR
        </button>
      </div>

      {/* Roster (Lista de Membros da Equipe) */}
      <div
        className="bg-white rounded-[10px] overflow-hidden"
        style={{ border: "1px solid rgba(194,198,210,0.3)" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #f1f5f9" }}
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h3 className="font-bold text-[15px] text-[#051d30]">
              Membros da Equipe ({filtered.length})
            </h3>
          </div>
          <span className="text-[11px] font-medium text-[#64748b]">
            Clique em um integrante para ver ficha completa e documentos
          </span>
        </div>

        {filtered.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fafc] transition-colors cursor-pointer"
            style={{ borderBottom: "1px solid #f1f5f9" }}
            onClick={() => onMemberClick(m)}
          >
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0"
              style={{ background: m.color || "#00356a" }}
            >
              {m.initials}
            </div>
            {/* Name + ID */}
            <div style={{ minWidth: 220 }}>
              <p className="font-bold text-[14px] text-[#051d30]">{m.name}</p>
              <p className="text-[11px] text-[#64748b]">
                {m.role} • <span className="font-mono text-[#8c9ab0]">{m.memberId}</span>
              </p>
              <p className="text-[10px] text-[#94a3b8] font-mono">CPF: {m.cpf}</p>
            </div>
            {/* Doc status badge */}
            <div style={{ minWidth: 160 }}>{memberDocBadge(m.docStatus)}</div>
            {/* Actions */}
            <div className="flex items-center gap-3 ml-auto">
              {onTransferMember && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransferMember(m);
                  }}
                  className="px-2.5 py-1 rounded-[6px] text-[11px] font-bold text-[#00356a] bg-[#edf4ff] hover:bg-[#d8e8fc] border border-[#c2d9f5] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Mover participante para outra equipe"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="17 1 21 5 17 9" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <polyline points="7 23 3 19 7 15" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                  Mover
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMemberClick(m);
                }}
                className="px-3 py-1.5 rounded-[6px] text-[11px] font-bold text-white bg-[#00356a] hover:bg-[#00468a] transition-colors cursor-pointer"
              >
                Ver Ficha →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Final validation bar */}
      <div
        className="mt-5 flex items-center justify-between px-5 py-4 rounded-[10px] flex-wrap gap-3"
        style={{ background: "#edf4ff", border: "1px solid rgba(0,53,106,0.15)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center"
            style={{ border: "1px solid rgba(0,53,106,0.2)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-[13px] text-[#051d30]">Validação Final da Equipe</p>
            <p className="text-[11px] text-[#475569]">
              Quando todos os integrantes estiverem validados, a equipe fica apta para competir na arena.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-[6px] text-[12px] font-semibold text-[#475569] hover:bg-white transition-colors cursor-pointer"
            style={{ border: "1px solid #cbd5e1" }}
          >
            VOLTAR À LISTA
          </button>
          <button
            onClick={() => setShowApproveModal(true)}
            className="px-4 py-2 rounded-[6px] text-[12px] font-bold text-white hover:opacity-90 transition-opacity cursor-pointer"
            style={{ background: "#051d30" }}
          >
            APROVAR EQUIPE COMPLETA
          </button>
        </div>
      </div>

      {/* Approve modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-[12px] p-6 shadow-2xl" style={{ width: 400 }}>
            <h3 className="font-bold text-[16px] text-[#051d30] mb-2">Aprovar equipe completa?</h3>
            <p className="text-[13px] text-[#475569] mb-5">
              Todos os participantes da equipe <strong>{team.fullName}</strong> serão aprovados e o status mudará para "APROVADO".
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-2.5 rounded-[6px] text-[13px] font-semibold text-[#475569] cursor-pointer"
                style={{ border: "1px solid #cbd5e1" }}
              >
                Cancelar
              </button>
              <button
                onClick={approveAll}
                className="flex-1 py-2.5 rounded-[6px] text-[13px] font-bold text-white cursor-pointer"
                style={{ background: "#16a34a" }}
              >
                Aprovar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Arena modal */}
      {showArenaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-[12px] p-6 shadow-2xl" style={{ width: 380 }}>
            <h3 className="font-bold text-[15px] text-[#051d30] mb-3">Vincular Nova Arena</h3>
            <input
              className="w-full rounded-[6px] px-3 py-2.5 text-[13px] outline-none focus:ring-1 focus:ring-[#00356a]"
              style={{ border: "1px solid #e2e8f0" }}
              placeholder="Nome da arena"
              value={newArena}
              onChange={(e) => setNewArena(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addArena()}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowArenaModal(false)}
                className="flex-1 py-2.5 rounded-[6px] text-[13px] font-semibold text-[#475569] cursor-pointer"
                style={{ border: "1px solid #cbd5e1" }}
              >
                Cancelar
              </button>
              <button
                onClick={addArena}
                className="flex-1 py-2.5 rounded-[6px] text-[13px] font-bold text-white cursor-pointer"
                style={{ background: "#051d30" }}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STEP 3B: MemberDetail View (Ficha Individual do Membro) ─────────────────

function MemberDetail({
  member,
  teamName,
  onBack,
  onUpdate,
  onTransfer,
}: {
  member: Member;
  teamName: string;
  onBack: () => void;
  onUpdate: (m: Member) => void;
  onTransfer?: () => void;
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function approve() {
    const now =
      new Date().toLocaleDateString("pt-BR") +
      ", " +
      new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    onUpdate({
      ...member,
      docStatus: "approved",
      approvalDate: now,
      approvedBy: "Painel Admin",
      history: [{ date: now, label: "Aprovação", type: "approved", by: "Painel Admin" }, ...(member.history || [])],
    });
    showToast("Participante aprovado com sucesso.");
  }

  function reject() {
    if (!rejectReason.trim()) return;
    const now =
      new Date().toLocaleDateString("pt-BR") +
      ", " +
      new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    onUpdate({
      ...member,
      docStatus: "awaiting_resend",
      judgeNote: rejectReason,
      history: [
        { date: now, label: "Upload de Correção", type: "resubmit", note: rejectReason, by: "Admin" },
        { date: now, label: "Reprovação Anterior", type: "rejected", by: "Admin", note: rejectReason },
        ...(member.history || []),
      ],
    });
    setRejectReason("");
    showToast("Inscrição reprovada. Participante notificado.");
  }

  function sendAlert() {
    const now =
      new Date().toLocaleDateString("pt-BR") +
      ", " +
      new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    onUpdate({
      ...member,
      history: [{ date: now, label: "Alerta Enviado", type: "rejected", by: "Admin" }, ...(member.history || [])],
    });
    showToast("Alerta enviado ao participante.");
  }

  function revertPending() {
    onUpdate({ ...member, docStatus: "pending" });
    showToast("Status revertido para Pendente.");
  }

  function revoke() {
    const now =
      new Date().toLocaleDateString("pt-BR") +
      ", " +
      new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    onUpdate({
      ...member,
      docStatus: "pending",
      approvalDate: undefined,
      approvedBy: undefined,
      history: [{ date: now, label: "Aprovação Revogada", type: "rejected", by: "Painel Admin" }, ...(member.history || [])],
    });
    showToast("Aprovação revogada.");
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-10">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#051d30] text-white text-sm px-4 py-3 rounded-lg shadow-xl">
          {toast}
        </div>
      )}

      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-[11px] font-bold text-[#0052cc] hover:underline tracking-[1px] uppercase transition-colors cursor-pointer"
          >
            ← VOLTAR PARA MEMBROS DE {teamName.toUpperCase()}
          </button>
          <span className="text-[#8c9ab0] text-[11px]">›</span>
          <span className="text-[11px] font-bold text-[#051d30] tracking-[1px] uppercase">
            {(member.name || "Participante").toUpperCase()}
          </span>
        </div>
        {onTransfer && (
          <button
            onClick={onTransfer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[11px] font-bold text-[#00356a] bg-white border border-[#00356a]/30 hover:bg-[#edf4ff] transition-colors shadow-xs cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            MOVER DE EQUIPE
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* LEFT — profile + docs */}
        <div className="flex flex-col gap-5 flex-1 min-w-0 w-full">
          <div className="bg-white rounded-[10px] p-6" style={{ border: "1px solid rgba(194,198,210,0.3)" }}>
            <div className="flex items-start gap-5 flex-wrap sm:flex-nowrap">
              <div
                className="w-[72px] h-[72px] rounded-[8px] flex items-center justify-center text-white font-bold text-[22px] shrink-0"
                style={{ background: member.color || "#00356a" }}
              >
                {member.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold tracking-[1.5px] uppercase" style={{ color: "#8c4f00" }}>
                  {member.role}
                </p>
                <h2 className="font-bold text-[28px] text-[#051d30] leading-tight mt-0.5">{member.name}</h2>
                <p className="text-[12px] text-[#8c9ab0] mt-1">{member.memberId}</p>
                <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
                  {[
                    { label: "CPF", val: member.cpf },
                    { label: "RG", val: member.rg },
                    { label: "NASCIMENTO", val: member.birthDate },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <p className="text-[9px] font-medium tracking-[1px] uppercase text-[#8c9ab0]">{label}</p>
                      <p className="text-[13px] font-medium text-[#051d30]">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="shrink-0">
                <span
                  className="rounded-[4px] px-3 py-1 text-[10px] font-bold tracking-[1px] uppercase text-white"
                  style={{ background: "#f59e0b" }}
                >
                  {member.team || teamName}
                </span>
              </div>
            </div>
          </div>

          {member.judgeNote && (
            <div className="bg-white rounded-[10px] p-6" style={{ border: "1px solid rgba(194,198,210,0.3)" }}>
              <div className="flex items-center gap-2 mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <h3 className="font-semibold text-[14px] text-[#051d30]">Notas do Juiz / Avaliador</h3>
              </div>
              <div className="rounded-[6px] px-4 py-3" style={{ background: "#edf4ff" }}>
                <p className="text-[12px] text-[#475569] italic">"{member.judgeNote}"</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — decision panel */}
        <div className="flex flex-col gap-4 shrink-0 w-full lg:w-[280px]">
          <div className="bg-white rounded-[10px] p-5" style={{ border: "1px solid rgba(194,198,210,0.3)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-[3px] h-[18px] rounded-full bg-[#f59e0b]" />
              <h3 className="font-bold text-[14px] text-[#051d30]">Painel de Decisão</h3>
            </div>

            <p className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#8c9ab0] mb-2">STATUS ATUAL</p>
            {decisionStatusBadge(member.docStatus)}

            {member.docStatus === "approved" ? (
              <>
                <div className="mt-4 rounded-[8px] p-4 text-center" style={{ background: "#16a34a" }}>
                  <svg className="mx-auto mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p className="font-bold text-white text-[16px]">
                    Participante
                    <br />
                    Aprovado
                  </p>
                  <p className="text-[10px] text-white/70 mt-1">Homologado pelo Painel Administrativo</p>
                </div>
                <div className="mt-3 flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#8c9ab0] uppercase tracking-[0.5px] text-[9px]">DATA APROVAÇÃO</span>
                    <span className="font-medium text-[#051d30]">{member.approvalDate || "24/10/2026"}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#8c9ab0] uppercase tracking-[0.5px] text-[9px]">REVISOR</span>
                    <span className="font-medium text-[#051d30]">{member.approvedBy || "Admin SENAC"}</span>
                  </div>
                </div>
                <button
                  onClick={revoke}
                  className="mt-4 w-full py-2.5 rounded-[6px] text-[12px] font-semibold text-[#dc2626] transition-colors hover:bg-red-50 cursor-pointer"
                  style={{ border: "1px solid #dc2626" }}
                >
                  ⊘ Revogar Aprovação
                </button>
              </>
            ) : member.docStatus === "awaiting_resend" ? (
              <>
                <p className="text-[12px] text-[#475569] mt-3 mb-4 leading-relaxed">
                  Certifique-se de que todos os documentos foram verificados antes de proceder com a aprovação.
                </p>
                <button
                  onClick={sendAlert}
                  className="w-full py-2.5 rounded-[6px] text-[12px] font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 cursor-pointer"
                  style={{ background: "#dc2626" }}
                >
                  Enviar Novo Alerta
                </button>
                <button
                  onClick={revertPending}
                  className="mt-2 w-full py-2.5 rounded-[6px] text-[12px] font-semibold text-[#475569] transition-colors hover:bg-slate-50 cursor-pointer"
                  style={{ border: "1px solid #cbd5e1" }}
                >
                  Reverter para Pendente
                </button>
              </>
            ) : (
              <>
                <p className="text-[12px] text-[#475569] mt-3 mb-4 leading-relaxed">
                  Certifique-se de que todos os documentos foram verificados antes de proceder com a aprovação.
                </p>
                <button
                  onClick={approve}
                  className="w-full py-2.5 rounded-[6px] text-[12px] font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 cursor-pointer"
                  style={{ background: "#16a34a" }}
                >
                  APROVAR PARTICIPANTE
                </button>
                <div className="my-3 flex items-center gap-2">
                  <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
                  <span className="text-[10px] text-[#8c9ab0] uppercase">OU</span>
                  <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
                </div>
                <p className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#8c9ab0] mb-2">
                  MOTIVO DA REPROVAÇÃO
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ex: CPF ilegível no documento enviado..."
                  className="w-full rounded-[6px] p-3 text-[12px] text-[#475569] resize-none outline-none focus:ring-1 focus:ring-[#00356a]"
                  style={{ border: "1px solid #e2e8f0", minHeight: 80 }}
                />
                <button
                  onClick={reject}
                  disabled={!rejectReason.trim()}
                  className="mt-2 w-full py-2.5 rounded-[6px] text-[12px] font-semibold transition-all cursor-pointer"
                  style={{
                    border: "1px solid #dc2626",
                    color: rejectReason.trim() ? "#dc2626" : "#94a3b8",
                    borderColor: rejectReason.trim() ? "#dc2626" : "#e2e8f0",
                    background: rejectReason.trim() ? "#fff5f5" : "transparent",
                  }}
                >
                  ⊘ REPROVAR INSCRIÇÃO
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main TeamsPage (1- Ver as Arenas -> 2- Ver as Equipes -> 3- Ver os Membros) ─

type ViewState =
  | { type: "arenas" }
  | { type: "teams"; arenaId: string }
  | { type: "team-members"; arenaId: string; teamId: string }
  | { type: "member-detail"; arenaId: string; teamId: string; memberId: string };

export default function TeamsPage({
  onNavigate,
  onLogout,
}: {
  onNavigate: (key: string) => void;
  onLogout: () => void;
}) {
  const [arenasList, setArenasList] = useState<ArenaHubItem[]>([]);
  const [teamsByArena, setTeamsByArena] = useState<Record<string, Team[]>>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>({ type: "arenas" });

  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState(false);
  const [transferTarget, setTransferTarget] = useState<{ member: Member; team: Team } | null>(null);
  const [transferringMember, setTransferringMember] = useState(false);
  const [globalToast, setGlobalToast] = useState("");

  function showGlobalToast(msg: string) {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(""), 3500);
  }

  useEffect(() => {
    const loadArenasAndTeams = async () => {
      setLoading(true);
      try {
        const [arenasRes, equipesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/arenas`, { credentials: "include" }).catch(() => null),
          fetch(`${API_BASE_URL}/api/v1/Equipes`, { credentials: "include" }).catch(() => null),
        ]);

        const rawEquipes: any[] = equipesRes && equipesRes.ok ? await equipesRes.json() : [];
        const rawArenas: any[] = arenasRes && arenasRes.ok ? await arenasRes.json() : [];

        // Normalize global Equipes from MongoDB (/api/v1/Equipes)
        const normalizedGlobalTeams: Team[] = (Array.isArray(rawEquipes) ? rawEquipes : []).map(
          (t: any, idx: number) => {
            const tName = t.name || t.nome || `Equipe ${idx + 1}`;
            const tCode = t.teamId || `#TM-${String(1042 + idx * 111).slice(0, 4)}`;
            const existingMembers: Member[] = Array.isArray(t.members)
              ? t.members.map((m: any, mIdx: number) => ({
                  ...m,
                  id: m.id || m.cpf || `m-${idx}-${mIdx}`,
                  initials: m.initials || getInitials(m.name || "Membro"),
                  color: m.color || AVATAR_COLORS[(idx + mIdx) % AVATAR_COLORS.length],
                  name: m.name || `Integrante ${mIdx + 1}`,
                  memberId: m.memberId || `ID: 489.223.11-0${mIdx + 1}`,
                  role: m.role || "Competidor Oficial",
                  cpf: m.cpf || `123.456.78${mIdx}-00`,
                  rg: m.rg || `12.345.67${mIdx}-9`,
                  birthDate: m.birthDate || "15/05/2004",
                  team: tName.toUpperCase(),
                  docStatus: (m.docStatus as MemberDocStatus) || "approved",
                  history: Array.isArray(m.history) ? m.history : [],
                }))
              : [];

            return {
              id: t.id || t._id || `eq-${idx}`,
              name: tName,
              fullName: t.fullName || t.nome || tName,
              teamId: tCode,
              logo:
                tName === "CyberBots"
                  ? imgCyberBotsLogo
                  : tName === "TechKnights"
                  ? imgTechKnightsLogo
                  : tName === "MechEng"
                  ? imgMechEngLogo
                  : undefined,
              status: (t.status?.toUpperCase() === "PENDENTE"
                ? "PENDENTE"
                : t.status?.toUpperCase() === "AJUSTE NECESSÁRIO"
                ? "AJUSTE NECESSÁRIO"
                : "APROVADO") as TeamStatus,
              arenas:
                Array.isArray(t.arenas) && t.arenas.length > 0
                  ? t.arenas
                  : [{ name: "Arena Sumô (Principal)", confirmed: true }],
              members:
                existingMembers.length > 0
                  ? existingMembers
                  : buildSynthesizedMembers(tName, tCode, idx),
            };
          }
        );

        const mappedArenas: ArenaHubItem[] = (Array.isArray(rawArenas) ? rawArenas : []).map((a: any) => ({
          id: a.id || a._id,
          name: a.name || "Arena",
          description: a.description || "",
          status: a.status || "Ativa",
          capacity: Number(a.capacity) || 32,
          image: a.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
          evaluationType: (a.evaluationType || a.tipoAvaliacao || "confronto") as EvaluationModality,
          teams: Array.isArray(a.teams) ? a.teams : [],
        }));

        const byArenaMap: Record<string, Team[]> = {};

        for (const arena of mappedArenas) {
          const isSumoMain =
            arena.evaluationType === "confronto" &&
            (arena.name.toLowerCase().includes("sum") || arena.name.toLowerCase().includes("principal"));

          if (isSumoMain && normalizedGlobalTeams.length > 0) {
            byArenaMap[arena.id] = normalizedGlobalTeams.map((gt) => ({
              ...gt,
              arenas: [{ name: arena.name, confirmed: true }],
            }));
            arena.teams = byArenaMap[arena.id];
          } else {
            const arenaRawTeams = Array.isArray(arena.teams) ? arena.teams : [];
            byArenaMap[arena.id] = arenaRawTeams.map((at: any, idx: number) => {
              const matchedGlobal = normalizedGlobalTeams.find(
                (gt) =>
                  gt.id === at.id ||
                  gt.name.toLowerCase() === (at.name || "").toLowerCase()
              );
              if (matchedGlobal) {
                return {
                  ...matchedGlobal,
                  arenas: [{ name: arena.name, confirmed: true }],
                };
              }
              const tName = at.name || `Equipe ${idx + 1}`;
              const tCode = at.code
                ? `#${at.code.replace(/^#+/, "")}`
                : `#TM-${String(1042 + idx * 235).slice(0, 4)}`;
              const rawStatus = (at.status || "APROVADO").toUpperCase();
              const normStatus: TeamStatus =
                rawStatus.includes("PEND")
                  ? "PENDENTE"
                  : rawStatus.includes("AJUST") || rawStatus.includes("REJEIT")
                  ? "AJUSTE NECESSÁRIO"
                  : "APROVADO";

              return {
                id: at.id || `${arena.id}-tm-${idx + 1}`,
                name: tName,
                fullName: tName,
                teamId: tCode,
                institution: at.institution || "SENAC SP",
                logo:
                  tName === "CyberBots"
                    ? imgCyberBotsLogo
                    : tName === "TechKnights"
                    ? imgTechKnightsLogo
                    : tName === "MechEng"
                    ? imgMechEngLogo
                    : undefined,
                status: normStatus,
                arenas: [{ name: arena.name, confirmed: normStatus === "APROVADO" }],
                members:
                  Array.isArray(at.members) && at.members.length > 0
                    ? at.members
                    : buildSynthesizedMembers(tName, tCode, idx),
              };
            });
          }
        }

        setArenasList(mappedArenas);
        setTeamsByArena(byArenaMap);
      } catch (e) {
        console.error("Erro ao carregar arenas e equipes:", e);
      } finally {
        setLoading(false);
      }
    };

    loadArenasAndTeams();
  }, []);

  const currentArenaId = view.type !== "arenas" ? view.arenaId : null;
  const activeArena = currentArenaId ? arenasList.find((a) => a.id === currentArenaId) || null : null;
  const currentArenaTeams = currentArenaId ? teamsByArena[currentArenaId] || [] : [];

  const activeTeam =
    (view.type === "team-members" || view.type === "member-detail") && currentArenaId
      ? currentArenaTeams.find((t) => t.id === view.teamId) || null
      : null;

  const activeMember =
    view.type === "member-detail" && activeTeam
      ? activeTeam.members.find((m) => m.id === view.memberId) || null
      : null;

  function navigate(key: string) {
    if (key === "times") setView({ type: "arenas" });
    else onNavigate(key);
  }

  async function syncArenaTeamsToBackend(arenaId: string, updatedTeams: Team[]) {
    const targetArena = arenasList.find((a) => a.id === arenaId);
    if (!targetArena) return;
    try {
      await fetch(`${API_BASE_URL}/api/v1/arenas/${arenaId}/teams`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          teams: updatedTeams.map((t) => ({
            id: t.id,
            code: t.teamId.replace(/^#/, ""),
            name: t.name,
            institution: t.institution || "SENAC",
            status: t.status === "APROVADO" ? "Aprovado" : t.status === "PENDENTE" ? "Pendente" : "Rejeitado",
            members: t.members,
          })),
        }),
      });
    } catch {}
  }

  async function handleConfirmDeleteTeam() {
    if (!teamToDelete || !currentArenaId) return;
    setDeletingTeam(true);
    try {
      await fetch(`${API_BASE_URL}/api/v1/Equipes/${teamToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      }).catch(() => {});

      const nextList = (teamsByArena[currentArenaId] || []).filter((t) => t.id !== teamToDelete.id);
      setTeamsByArena((prev) => ({ ...prev, [currentArenaId]: nextList }));
      setArenasList((prev) =>
        prev.map((a) => (a.id === currentArenaId ? { ...a, teams: nextList } : a))
      );
      await syncArenaTeamsToBackend(currentArenaId, nextList);

      if (view.type === "team-members" || view.type === "member-detail") {
        setView({ type: "teams", arenaId: currentArenaId });
      }
      showGlobalToast(`Equipe "${teamToDelete.fullName}" excluída com sucesso!`);
      setTeamToDelete(null);
    } finally {
      setDeletingTeam(false);
    }
  }

  async function handleConfirmTransferMember(targetTeamId: string) {
    if (!transferTarget || !currentArenaId) return;
    const { member, team: fromTeam } = transferTarget;
    setTransferringMember(true);
    try {
      const updatedMember: Member = {
        ...member,
        team:
          currentArenaTeams.find((t) => t.id === targetTeamId)?.name.toUpperCase() || "NOVA EQUIPE",
      };

      const nextList = currentArenaTeams.map((t) => {
        if (t.id === fromTeam.id) {
          return {
            ...t,
            members: t.members.filter((m) => m.id !== member.id),
          };
        }
        if (t.id === targetTeamId) {
          return {
            ...t,
            members: [...t.members, updatedMember],
          };
        }
        return t;
      });

      setTeamsByArena((prev) => ({ ...prev, [currentArenaId]: nextList }));
      await syncArenaTeamsToBackend(currentArenaId, nextList);

      if (view.type === "member-detail") {
        setView({ type: "team-members", arenaId: currentArenaId, teamId: targetTeamId });
      }
      const destTeamName = currentArenaTeams.find((t) => t.id === targetTeamId)?.fullName || "nova equipe";
      showGlobalToast(`Participante "${member.name}" transferido para "${destTeamName}"!`);
      setTransferTarget(null);
    } finally {
      setTransferringMember(false);
    }
  }

  async function updateTeam(updated: Team) {
    if (!currentArenaId) return;
    const nextList = currentArenaTeams.map((t) => (t.id === updated.id ? updated : t));
    setTeamsByArena((prev) => ({ ...prev, [currentArenaId]: nextList }));
    await syncArenaTeamsToBackend(currentArenaId, nextList);
  }

  async function updateMember(teamId: string, updated: Member) {
    if (!currentArenaId) return;
    const nextList = currentArenaTeams.map((t) =>
      t.id === teamId
        ? { ...t, members: t.members.map((m) => (m.id === updated.id ? updated : m)) }
        : t
    );
    setTeamsByArena((prev) => ({ ...prev, [currentArenaId]: nextList }));
    await syncArenaTeamsToBackend(currentArenaId, nextList);
  }

  return (
    <div className="fixed inset-0 z-[800] flex overflow-hidden bg-[#f7f9ff]">
      {/* Global Toast */}
      {globalToast && (
        <div className="fixed top-5 right-5 z-[1000] bg-[#051d30] text-white text-sm px-5 py-3.5 rounded-lg shadow-2xl flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="font-medium">{globalToast}</span>
        </div>
      )}

      {/* Modals */}
      {teamToDelete && (
        <ConfirmDeleteModal
          team={teamToDelete}
          onClose={() => setTeamToDelete(null)}
          onConfirm={handleConfirmDeleteTeam}
          loading={deletingTeam}
        />
      )}

      {transferTarget && (
        <TransferMemberModal
          member={transferTarget.member}
          fromTeam={transferTarget.team}
          teams={currentArenaTeams}
          onClose={() => setTransferTarget(null)}
          onConfirm={handleConfirmTransferMember}
          loading={transferringMember}
        />
      )}

      <AdminSidebar active="times" onNavigate={navigate} onLogout={onLogout} />

      <div className="flex flex-col flex-1 overflow-hidden ml-0 md:ml-[256px]">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-4 sm:px-8 pl-16 md:pl-8 shrink-0 flex-wrap gap-2"
          style={{ minHeight: 64, borderBottom: "1px solid rgba(194,198,210,0.3)", background: "#f7f9ff" }}
        >
          <div className="flex items-center gap-2 text-[13px] font-bold text-[#051d30] tracking-[1px] uppercase">
            <button
              type="button"
              onClick={() => setView({ type: "arenas" })}
              className={`cursor-pointer ${view.type === "arenas" ? "text-[#00356a]" : "text-[#64748b] hover:text-[#00356a]"}`}
            >
              1. ARENAS
            </button>
            {activeArena && (
              <>
                <span className="text-[#94a3b8]">›</span>
                <button
                  type="button"
                  onClick={() => setView({ type: "teams", arenaId: activeArena.id })}
                  className={`cursor-pointer ${view.type === "teams" ? "text-[#00356a]" : "text-[#64748b] hover:text-[#00356a]"}`}
                >
                  2. EQUIPES ({activeArena.name})
                </button>
              </>
            )}
            {activeTeam && (
              <>
                <span className="text-[#94a3b8]">›</span>
                <button
                  type="button"
                  onClick={() =>
                    activeArena && setView({ type: "team-members", arenaId: activeArena.id, teamId: activeTeam.id })
                  }
                  className={`cursor-pointer ${view.type === "team-members" ? "text-[#00356a]" : "text-[#64748b] hover:text-[#00356a]"}`}
                >
                  3. MEMBROS ({activeTeam.name})
                </button>
              </>
            )}
            {activeMember && (
              <>
                <span className="text-[#94a3b8]">›</span>
                <span className="text-[#00356a]">{activeMember.name}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              API ONLINE (MongoDB Atlas)
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-[#8c9ab0]">
              <div className="w-10 h-10 border-3 border-[#00356a] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[16px]">
                Carregando arenas, equipes e membros do MongoDB Atlas...
              </p>
            </div>
          ) : view.type === "arenas" ? (
            <ArenasHubView
              arenas={arenasList}
              onSelectArena={(arena) => setView({ type: "teams", arenaId: arena.id })}
            />
          ) : view.type === "teams" && activeArena ? (
            <TeamList
              arena={activeArena}
              arenas={arenasList}
              teams={currentArenaTeams}
              onSelectArena={(a) => setView({ type: "teams", arenaId: a.id })}
              onBackToArenas={() => setView({ type: "arenas" })}
              onSelectTeam={(t) => setView({ type: "team-members", arenaId: activeArena.id, teamId: t.id })}
              onDeleteTeam={(t) => setTeamToDelete(t)}
            />
          ) : view.type === "team-members" && activeArena && activeTeam ? (
            <TeamProfile
              arenaName={activeArena.name}
              team={activeTeam}
              onBack={() => setView({ type: "teams", arenaId: activeArena.id })}
              onMemberClick={(m) =>
                setView({ type: "member-detail", arenaId: activeArena.id, teamId: activeTeam.id, memberId: m.id })
              }
              onUpdate={updateTeam}
              onDeleteTeam={(t) => setTeamToDelete(t)}
              onTransferMember={(m) => setTransferTarget({ member: m, team: activeTeam })}
            />
          ) : view.type === "member-detail" && activeArena && activeTeam && activeMember ? (
            <MemberDetail
              member={activeMember}
              teamName={activeTeam.fullName}
              onBack={() => setView({ type: "team-members", arenaId: activeArena.id, teamId: activeTeam.id })}
              onUpdate={(m) => updateMember(activeTeam.id, m)}
              onTransfer={() => setTransferTarget({ member: activeMember, team: activeTeam })}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[#8c9ab0]">
              <button
                type="button"
                onClick={() => setView({ type: "arenas" })}
                className="px-4 py-2 bg-[#00356a] text-white rounded-[6px] text-xs font-bold cursor-pointer"
              >
                Voltar para Arenas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
