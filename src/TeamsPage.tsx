import { useState, useEffect } from "react";
import imgCyberBotsLogo from "@/imports/DashboardDoTecnico-2/c59b0854417cc2b0f31b4d09ac8d4857a88ed716.png";
import imgTechKnightsLogo from "@/imports/DashboardDoTecnico-2/e18b7015cb02a1e04d542279e6514f25357d4adf.png";
import imgMechEngLogo from "@/imports/DashboardDoTecnico-2/5d16b98e05035db093ea19ea95851a20eb1accdb.png";
import AdminSidebar from "./AdminSidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

type MemberDocStatus = "pending" | "docs_ok" | "awaiting" | "awaiting_review" | "awaiting_resend" | "approved";
type TeamStatus = "PENDENTE" | "AJUSTE NECESSÁRIO" | "APROVADO";

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
  logo?: string;
  status: TeamStatus;
  members: Member[];
  arenas: Arena[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const INITIAL_TEAMS: Team[] = [
  {
    id: "1",
    name: "CyberBots",
    fullName: "CyberBots Alpha",
    teamId: "#RA-2024-089",
    logo: imgCyberBotsLogo,
    status: "PENDENTE",
    arenas: [{ name: "Battle Arena A", confirmed: true }],
    members: [
      {
        id: "rm", initials: "RM", color: "#3b82f6",
        name: "Ricardo Mendes", memberId: "ID: 489.223.11-09",
        role: "Líder Técnico", team: "ALPHABOT",
        cpf: "123.456.789-00", rg: "12.345.678-9", birthDate: "15/05/2004",
        docStatus: "pending",
        history: [{ date: "12/03/2024, 11:00", label: "Inscrição Original", type: "neutral" }],
      },
      {
        id: "js", initials: "JS", color: "#10b981",
        name: "Juliana Silva", memberId: "ID: 489.223.11-09",
        role: "Programadora", team: "ALPHABOT",
        cpf: "987.654.321-00", rg: "98.765.432-1", birthDate: "20/03/2005",
        docStatus: "docs_ok",
        history: [{ date: "12/03/2024, 11:00", label: "Inscrição Original", type: "neutral" }],
      },
      {
        id: "lt", initials: "LT", color: "#94a3b8",
        name: "Lucas Torres", memberId: "ID: 112.334.44-87",
        role: "Mecânico", team: "ALPHABOT",
        cpf: "456.789.123-00", rg: "45.678.912-3", birthDate: "08/11/2005",
        docStatus: "awaiting",
        history: [{ date: "12/03/2024, 11:00", label: "Inscrição Original", type: "neutral" }],
      },
    ],
  },
  {
    id: "2",
    name: "TechKnights",
    fullName: "TechKnights BR",
    teamId: "#RA-2024-102",
    logo: imgTechKnightsLogo,
    status: "AJUSTE NECESSÁRIO",
    arenas: [{ name: "Arena Central", confirmed: false }],
    members: [
      {
        id: "ab", initials: "AB", color: "#f59e0b",
        name: "Ana Beatriz", memberId: "ID: 221.445.88-01",
        role: "Líder Técnica", team: "TECHKNIGHTS",
        cpf: "321.654.987-00", rg: "32.165.498-7", birthDate: "14/07/2004",
        docStatus: "awaiting_review",
        judgeNote: "Por favor, corrija: o documento de direito de imagem está faltando a assinatura do responsável.",
        history: [
          { date: "14/03/2024, 09:45", label: "Reprovação Anterior", type: "rejected", by: "Admin: Carla S.", note: "Por favor, corrija: o documento de direito de imagem está faltando a assinatura do responsável." },
          { date: "12/03/2024, 11:00", label: "Inscrição Original", type: "neutral" },
        ],
      },
      {
        id: "mv", initials: "MV", color: "#8b5cf6",
        name: "Marcos Vinícius", memberId: "ID: 334.221.77-02",
        role: "Programador", team: "TECHKNIGHTS",
        cpf: "789.123.456-00", rg: "78.912.345-6", birthDate: "30/09/2005",
        docStatus: "approved",
        approvalDate: "Oct 20, 2023",
        approvedBy: "Professor Barberato",
        history: [
          { date: "14/03/2024, 09:45", label: "Aprovação", type: "approved", by: "Admin: Carla S." },
          { date: "14/03/2024, 09:45", label: "Reprovação Anterior", type: "rejected", by: "Admin: Carla S.", note: "Documento ilegível." },
          { date: "12/03/2024, 11:00", label: "Inscrição Original", type: "neutral" },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "MechEng",
    fullName: "MechEng SustentTVei",
    teamId: "#RA-2024-043",
    logo: imgMechEngLogo,
    status: "APROVADO",
    arenas: [{ name: "Arena Tech B", confirmed: true }],
    members: [
      {
        id: "pt", initials: "PT", color: "#06b6d4",
        name: "Pedro Takeda", memberId: "ID: 554.332.99-11",
        role: "Líder Técnico", team: "MECHENG",
        cpf: "654.321.987-00", rg: "65.432.198-7", birthDate: "22/01/2004",
        docStatus: "approved",
        approvalDate: "Oct 20, 2023",
        approvedBy: "Professor Barberato",
        history: [
          { date: "14/03/2024, 09:45", label: "Aprovação", type: "approved", by: "Admin: Carla S." },
          { date: "12/03/2024, 11:00", label: "Inscrição Original", type: "neutral" },
        ],
      },
      {
        id: "lr", initials: "LR", color: "#ec4899",
        name: "Larissa Ramos", memberId: "ID: 443.112.66-22",
        role: "Programadora", team: "MECHENG",
        cpf: "111.222.333-00", rg: "11.122.233-3", birthDate: "05/06/2005",
        docStatus: "approved",
        approvalDate: "Oct 20, 2023",
        approvedBy: "Professor Barberato",
        history: [
          { date: "14/03/2024, 09:45", label: "Aprovação", type: "approved", by: "Admin: Carla S." },
          { date: "12/03/2024, 11:00", label: "Inscrição Original", type: "neutral" },
        ],
      },
      {
        id: "cs", initials: "CS", color: "#64748b",
        name: "Carlos Souza", memberId: "ID: 667.889.44-33",
        role: "Mecânico", team: "MECHENG",
        cpf: "444.555.666-00", rg: "44.455.566-6", birthDate: "17/09/2005",
        docStatus: "approved",
        approvalDate: "Oct 20, 2023",
        approvedBy: "Professor Barberato",
        history: [
          { date: "14/03/2024, 09:45", label: "Aprovação", type: "approved", by: "Admin: Carla S." },
          { date: "12/03/2024, 11:00", label: "Inscrição Original", type: "neutral" },
        ],
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusChip(status: TeamStatus) {
  const map: Record<TeamStatus, { bg: string; text: string; label: string }> = {
    "PENDENTE":          { bg: "#ffdcbf", text: "#7c3500", label: "PENDENTE" },
    "AJUSTE NECESSÁRIO": { bg: "#fce7e7", text: "#b91c1c", label: "AJUSTE NECESSÁRIO" },
    "APROVADO":          { bg: "#cfe5ff", text: "#1e3a5f", label: "APROVADO" },
  };
  const s = map[status];
  return (
    <span className="rounded-[3px] px-[8px] py-[3px] text-[10px] font-bold tracking-[0.5px] uppercase" style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

function memberDocBadge(status: MemberDocStatus) {
  if (status === "docs_ok")
    return <span className="rounded-[20px] px-3 py-1 text-[10px] font-bold" style={{ background: "#d1fae5", color: "#065f46" }}>DOCUMENTOS CORRETOS</span>;
  if (status === "awaiting" || status === "awaiting_review" || status === "awaiting_resend")
    return <span className="rounded-[20px] px-3 py-1 text-[10px] font-medium" style={{ background: "#f1f5f9", color: "#64748b" }}>AGUARDANDO ANÁLISE</span>;
  if (status === "approved")
    return <span className="rounded-[20px] px-3 py-1 text-[10px] font-bold" style={{ background: "#d1fae5", color: "#065f46" }}>APROVADO</span>;
  return <span className="rounded-[20px] px-3 py-1 text-[10px] font-bold" style={{ background: "#fee2e2", color: "#991b1b" }}>REVISAR DOCUMENTOS</span>;
}

function decisionStatusBadge(status: MemberDocStatus) {
  const map: Record<MemberDocStatus, { bg: string; text: string; border: string; label: string }> = {
    pending:          { bg: "#fff7ed", text: "#92400e", border: "#fcd34d", label: "Pendente de Revisão" },
    docs_ok:          { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7", label: "Documentos OK" },
    awaiting:         { bg: "#fff7ed", text: "#92400e", border: "#fcd34d", label: "Aguardando Análise" },
    awaiting_review:  { bg: "#fff7ed", text: "#92400e", border: "#fcd34d", label: "Aguardando Reavaliação" },
    awaiting_resend:  { bg: "#fff7ed", text: "#92400e", border: "#fcd34d", label: "Aguardando o Reenvio dos Arquivos." },
    approved:         { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7", label: "Aprovado" },
  };
  const s = map[status];
  return (
    <div className="w-full rounded-[6px] px-3 py-2 flex items-center gap-2" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s.text} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <span className="text-[11px] font-semibold" style={{ color: s.text }}>{s.label}</span>
    </div>
  );
}

// ─── MemberDetail view ───────────────────────────────────────────────────────

function MemberDetail({
  member, teamName, onBack, onUpdate,
}: {
  member: Member; teamName: string;
  onBack: () => void;
  onUpdate: (m: Member) => void;
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function approve() {
    const now = new Date().toLocaleDateString("pt-BR") + ", " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    onUpdate({
      ...member,
      docStatus: "approved",
      approvalDate: now,
      approvedBy: "Admin Panel",
      history: [
        { date: now, label: "Aprovação", type: "approved", by: "Admin Panel" },
        ...member.history,
      ],
    });
    showToast("Participante aprovado com sucesso.");
  }

  function reject() {
    if (!rejectReason.trim()) return;
    const now = new Date().toLocaleDateString("pt-BR") + ", " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    onUpdate({
      ...member,
      docStatus: "awaiting_resend",
      judgeNote: rejectReason,
      history: [
        { date: now, label: "Upload de Correção", type: "resubmit", note: rejectReason, by: "Admin" },
        { date: now, label: "Reprovação Anterior", type: "rejected", by: "Admin", note: rejectReason },
        ...member.history,
      ],
    });
    setRejectReason("");
    showToast("Inscrição reprovada. Participante notificado.");
  }

  function sendAlert() {
    const now = new Date().toLocaleDateString("pt-BR") + ", " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    onUpdate({
      ...member,
      history: [{ date: now, label: "Alerta Enviado", type: "rejected", by: "Admin" }, ...member.history],
    });
    showToast("Alerta enviado ao participante.");
  }

  function revertPending() {
    onUpdate({ ...member, docStatus: "pending" });
    showToast("Status revertido para Pendente.");
  }

  function revoke() {
    const now = new Date().toLocaleDateString("pt-BR") + ", " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    onUpdate({
      ...member,
      docStatus: "pending",
      approvalDate: undefined,
      approvedBy: undefined,
      history: [{ date: now, label: "Aprovação Revogada", type: "rejected", by: "Admin Panel" }, ...member.history],
    });
    showToast("Aprovação revogada.");
  }

  const docOk = member.docStatus === "approved" || member.docStatus === "docs_ok";

  return (
    <div className="flex-1 overflow-y-auto" style={{ paddingLeft: 40, paddingRight: 40, paddingTop: 28, paddingBottom: 40 }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#051d30] text-white text-sm px-4 py-3 rounded-lg shadow-xl">
          {toast}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <button onClick={onBack} className="text-[11px] font-medium text-[#8c9ab0] hover:text-[#00356a] tracking-[1px] uppercase transition-colors">
          PARTICIPANTES
        </button>
        <span className="text-[#8c9ab0] text-[11px]">›</span>
        <span className="text-[11px] font-bold text-[#051d30] tracking-[1px] uppercase">{member.name.toUpperCase()}</span>
      </div>

      {/* Resubmission alert banner */}
      {member.docStatus === "awaiting_review" && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-[6px]" style={{ background: "#fff7ed", border: "1px solid #fcd34d" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="#92400e"/></svg>
          <span className="text-[13px] text-[#92400e]">Novos documentos enviados pelo técnico após reprovação anterior.</span>
        </div>
      )}

      <div className="flex gap-5 items-start">
        {/* LEFT — profile + docs */}
        <div className="flex flex-col gap-5" style={{ flex: 1, minWidth: 0 }}>
          {/* Profile card */}
          <div className="bg-white rounded-[10px] p-6" style={{ border: "1px solid rgba(194,198,210,0.3)" }}>
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="w-[72px] h-[72px] rounded-[8px] flex items-center justify-center text-white font-bold text-[22px] shrink-0"
                style={{ background: member.color }}>
                {member.initials}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold tracking-[1.5px] uppercase" style={{ color: "#8c4f00" }}>{member.role}</p>
                <h2 className="font-bold text-[28px] text-[#051d30] leading-tight mt-0.5">{member.name}</h2>
                <p className="text-[12px] text-[#8c9ab0] mt-1">ID: #ROBO-2024-0492</p>
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
              {/* Team badge */}
              <div className="shrink-0">
                <span className="rounded-[4px] px-3 py-1 text-[10px] font-bold tracking-[1px] uppercase text-white" style={{ background: "#f59e0b" }}>
                  {member.team}
                </span>
              </div>
            </div>
          </div>

          {/* Documentação Digitalizada */}
          <div className="bg-white rounded-[10px] p-6" style={{ border: "1px solid rgba(194,198,210,0.3)" }}>
            <div className="flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <h3 className="font-semibold text-[14px] text-[#051d30]">Documentação Digitalizada</h3>
            </div>
            {[
              { label: "PDF de Identidade", meta: "ENVIADO EM 12/02/2024" },
              { label: "Direito de Imagem", meta: "Verified on Oct 14, 2023" },
            ].map((doc) => (
              <div key={doc.label} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
                <div className="flex items-center gap-3">
                  <div className="w-1 self-stretch rounded-full" style={{ background: docOk ? "#10b981" : "#ef4444" }} />
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={docOk ? "#10b981" : "#ef4444"} strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <div>
                      <p className="text-[13px] font-medium text-[#051d30]">{doc.label}</p>
                      <p className="text-[10px] text-[#8c9ab0] uppercase tracking-[0.5px]">{doc.meta}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {docOk && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
                  <button className="hover:opacity-70 transition-opacity">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Notas do juiz */}
          {member.judgeNote && (
            <div className="bg-white rounded-[10px] p-6" style={{ border: "1px solid rgba(194,198,210,0.3)" }}>
              <div className="flex items-center gap-2 mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <h3 className="font-semibold text-[14px] text-[#051d30]">Notas do juiz</h3>
              </div>
              <div className="rounded-[6px] px-4 py-3" style={{ background: "#edf4ff" }}>
                <p className="text-[12px] text-[#475569] italic">"{member.judgeNote}"</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — decision panel */}
        <div className="flex flex-col gap-4 shrink-0" style={{ width: 268 }}>
          {/* Decision panel */}
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
                  <svg className="mx-auto mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <p className="font-bold text-white text-[16px]">Participante<br />Aprovado</p>
                  <p className="text-[10px] text-white/70 mt-1">Status confirmed by Admin Panel</p>
                </div>
                <div className="mt-3 flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]"><span className="text-[#8c9ab0] uppercase tracking-[0.5px] text-[9px]">APPROVAL DATE</span><span className="font-medium text-[#051d30]">{member.approvalDate}</span></div>
                  <div className="flex justify-between text-[11px]"><span className="text-[#8c9ab0] uppercase tracking-[0.5px] text-[9px]">REVIEWER</span><span className="font-medium text-[#051d30]">{member.approvedBy}</span></div>
                </div>
                <button onClick={revoke} className="mt-4 w-full py-2.5 rounded-[6px] text-[12px] font-semibold text-[#dc2626] transition-colors hover:bg-red-50" style={{ border: "1px solid #dc2626" }}>
                  ⊘ Revogar Aprovação
                </button>
              </>
            ) : member.docStatus === "awaiting_resend" ? (
              <>
                <p className="text-[12px] text-[#475569] mt-3 mb-4 leading-relaxed">
                  Certifique-se de que todos os documentos foram verificados antes de proceder com a aprovação.
                </p>
                <button onClick={sendAlert} className="w-full py-2.5 rounded-[6px] text-[12px] font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90" style={{ background: "#dc2626" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  Enviar Novo Alerta
                </button>
                <button onClick={revertPending} className="mt-2 w-full py-2.5 rounded-[6px] text-[12px] font-semibold text-[#475569] transition-colors hover:bg-slate-50" style={{ border: "1px solid #cbd5e1" }}>
                  Reverter para Pendente
                </button>
              </>
            ) : (
              <>
                <p className="text-[12px] text-[#475569] mt-3 mb-4 leading-relaxed">
                  Certifique-se de que todos os documentos foram verificados antes de proceder com a aprovação.
                </p>
                <button onClick={approve} className="w-full py-2.5 rounded-[6px] text-[12px] font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90" style={{ background: "#16a34a" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  APROVAR PARTICIPANTE
                </button>
                <div className="my-3 flex items-center gap-2">
                  <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
                  <span className="text-[10px] text-[#8c9ab0] uppercase">OU</span>
                  <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
                </div>
                <p className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#8c9ab0] mb-2">MOTIVO DA REPROVAÇÃO</p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ex: CPF ilegível no documento enviado..."
                  className="w-full rounded-[6px] p-3 text-[12px] text-[#475569] resize-none outline-none focus:ring-1 focus:ring-[#00356a]"
                  style={{ border: "1px solid #e2e8f0", minHeight: 80 }}
                />
                <button onClick={reject} disabled={!rejectReason.trim()} className="mt-2 w-full py-2.5 rounded-[6px] text-[12px] font-semibold transition-all" style={{ border: "1px solid #dc2626", color: rejectReason.trim() ? "#dc2626" : "#94a3b8", borderColor: rejectReason.trim() ? "#dc2626" : "#e2e8f0", background: rejectReason.trim() ? "#fff5f5" : "transparent" }}>
                  ⊘ REPROVAR INSCRIÇÃO
                </button>
              </>
            )}
          </div>

          {/* Activity history */}
          {member.history.length > 0 && (
            <div className="bg-white rounded-[10px] p-5" style={{ border: "1px solid rgba(194,198,210,0.3)" }}>
              <h3 className="font-semibold text-[13px] text-[#051d30] mb-4">Histórico de Atividade</h3>
              <div className="flex flex-col gap-4">
                {member.history.map((h, i) => {
                  const dotColor = h.type === "approved" ? "#16a34a" : h.type === "rejected" ? "#dc2626" : h.type === "resubmit" ? "#f59e0b" : "#94a3b8";
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: dotColor }} />
                        {i < member.history.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: "#e2e8f0" }} />}
                      </div>
                      <div className="flex-1 pb-1">
                        <p className="text-[12px] font-semibold text-[#051d30]">{h.label}</p>
                        <p className="text-[10px] text-[#8c9ab0]">{h.date}{h.by ? ` • ${h.by}` : ""}</p>
                        {h.type === "resubmit" && (
                          <span className="text-[9px] font-bold tracking-[0.5px] uppercase" style={{ color: "#f59e0b" }}>AGUARDANDO REAVALIAÇÃO</span>
                        )}
                        {h.note && (
                          <div className="mt-1 rounded p-2 text-[11px] italic text-[#475569]" style={{ background: "#fef2f2" }}>
                            Motivo: "{h.note}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {member.docStatus !== "approved" && (
                <p className="mt-3 text-[10px] text-[#94a3b8]">• última modificação pelo sistema em {member.history[0]?.date ?? "—"}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TeamProfile view ────────────────────────────────────────────────────────

function TeamProfile({
  team, onBack, onMemberClick, onUpdate,
}: {
  team: Team;
  onBack: () => void;
  onMemberClick: (m: Member) => void;
  onUpdate: (t: Team) => void;
}) {
  const [search, setSearch] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showArenaModal, setShowArenaModal] = useState(false);
  const [newArena, setNewArena] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  const filtered = team.members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  function approveAll() {
    const now = new Date().toLocaleDateString("pt-BR") + ", " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    onUpdate({
      ...team,
      status: "APROVADO",
      members: team.members.map((m) => ({
        ...m,
        docStatus: "approved" as MemberDocStatus,
        approvalDate: now,
        approvedBy: "Admin Panel",
        history: [{ date: now, label: "Aprovação em Lote", type: "approved" as const, by: "Admin Panel" }, ...m.history],
      })),
    });
    setShowApproveModal(false);
    showToast("Time aprovado com sucesso!");
  }

  function addArena() {
    if (!newArena.trim()) return;
    onUpdate({ ...team, arenas: [...team.arenas, { name: newArena.trim(), confirmed: false }] });
    setNewArena("");
    setShowArenaModal(false);
    showToast(`Arena "${newArena.trim()}" adicionada.`);
  }

  function removeArena(idx: number) {
    onUpdate({ ...team, arenas: team.arenas.filter((_, i) => i !== idx) });
    showToast("Arena removida.");
  }

  function toggleArenaConfirm(idx: number) {
    onUpdate({ ...team, arenas: team.arenas.map((a, i) => i === idx ? { ...a, confirmed: !a.confirmed } : a) });
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ paddingLeft: 40, paddingRight: 40, paddingTop: 28, paddingBottom: 40 }}>
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#051d30] text-white text-sm px-4 py-3 rounded-lg shadow-xl">{toast}</div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={onBack} className="flex items-center gap-1 text-[10px] font-semibold tracking-[1.5px] uppercase text-[#f59e0b] hover:underline mb-1">
            ← TEAM PROFILE
          </button>
          <h1 className="font-bold text-[36px] text-[#051d30] leading-tight">{team.fullName}</h1>
          <p className="text-[13px] text-[#475569] mt-0.5">
            Verification status:{" "}
            <span style={{ color: team.status === "APROVADO" ? "#16a34a" : team.status === "AJUSTE NECESSÁRIO" ? "#dc2626" : "#d97706" }}>
              {team.status === "APROVADO" ? "Approved" : team.status === "AJUSTE NECESSÁRIO" ? "Adjustment Required" : "Pending Approval"}
            </span>
          </p>
        </div>

        {/* Arena registrations card */}
        <div className="bg-white rounded-[10px] p-4 min-w-[220px]" style={{ border: "1px solid rgba(194,198,210,0.3)" }}>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#8c9ab0] mb-3">ARENA REGISTRATIONS</p>
          {team.arenas.length === 0 && <p className="text-[12px] text-[#94a3b8]">Nenhuma arena registrada.</p>}
          {team.arenas.map((arena, i) => (
            <div key={i} className="flex items-center justify-between gap-3 mb-2">
              <span className="text-[13px] text-[#051d30]">{arena.name}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleArenaConfirm(i)} className={`rounded px-2 py-0.5 text-[9px] font-bold tracking-[0.5px] uppercase transition-all ${arena.confirmed ? "bg-[#cfe5ff] text-[#1e3a5f]" : "bg-[#f1f5f9] text-[#64748b]"}`}>
                  {arena.confirmed ? "CONFIRMED" : "PENDENTE"}
                </button>
                <button onClick={() => removeArena(i)} className="text-[#94a3b8] hover:text-[#dc2626] transition-colors ml-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => setShowArenaModal(true)} className="mt-2 text-[11px] font-semibold text-[#00356a] hover:underline flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Adicionar arena
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-[6px] px-3" style={{ border: "1px solid rgba(194,198,210,0.5)", height: 40 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="flex-1 text-[13px] outline-none bg-transparent placeholder:text-[#94a3b8]"
            placeholder="Buscar por nome do Participante"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="px-5 rounded-[6px] text-[12px] font-bold text-white" style={{ background: "#051d30", height: 40 }}>
          FILTRAR
        </button>
      </div>

      {/* Roster */}
      <div className="bg-white rounded-[10px] overflow-hidden" style={{ border: "1px solid rgba(194,198,210,0.3)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <h3 className="font-semibold text-[14px] text-[#051d30]">Participant Roster</h3>
          </div>
          <button className="flex items-center gap-1 text-[11px] font-medium text-[#475569] hover:text-[#051d30] transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            FILTER ROLES
          </button>
        </div>

        {filtered.map((m) => (
          <div key={m.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fafc] transition-colors cursor-pointer" style={{ borderBottom: "1px solid #f8fafc" }}
            onClick={() => onMemberClick(m)}>
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[12px] shrink-0" style={{ background: m.color }}>
              {m.initials}
            </div>
            {/* Name + ID */}
            <div style={{ width: 180 }}>
              <p className="font-semibold text-[13px] text-[#051d30]">{m.name}</p>
              <p className="text-[10px] text-[#8c9ab0]">{m.memberId}</p>
              <p className="text-[9px] text-[#94a3b8] uppercase tracking-[0.5px]">{m.role}</p>
            </div>
            {/* Doc status badge */}
            <div style={{ minWidth: 160 }}>{memberDocBadge(m.docStatus)}</div>
            {/* Doc icons */}
            <div className="flex items-center gap-3 ml-auto">
              {[{ label: "IDENTITY" }, { label: "IMAGE RIGHTS" }].map((d) => (
                <div key={d.label} className="flex flex-col items-center gap-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span className="text-[8px] text-[#94a3b8] uppercase tracking-[0.3px]">{d.label}</span>
                </div>
              ))}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </div>
          </div>
        ))}
      </div>

      {/* Final validation bar */}
      <div className="mt-5 flex items-center justify-between px-5 py-4 rounded-[10px]" style={{ background: "#edf4ff", border: "1px solid rgba(0,53,106,0.15)" }}>
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center" style={{ border: "1px solid rgba(0,53,106,0.2)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <p className="font-bold text-[13px] text-[#051d30]">Final Team Validation</p>
            <p className="text-[11px] text-[#475569]">Once all members are validated, the team status will transition to "Active".</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-4 py-2 rounded-[6px] text-[12px] font-semibold text-[#475569] hover:bg-white transition-colors" style={{ border: "1px solid #cbd5e1" }}>
            CANCEL REVIEW
          </button>
          <button onClick={() => setShowApproveModal(true)} className="px-4 py-2 rounded-[6px] text-[12px] font-bold text-white hover:opacity-90 transition-opacity" style={{ background: "#051d30" }}>
            APPROVE FULL TEAM
          </button>
        </div>
      </div>

      {/* Approve modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-[12px] p-6 shadow-2xl" style={{ width: 400 }}>
            <h3 className="font-bold text-[16px] text-[#051d30] mb-2">Aprovar time completo?</h3>
            <p className="text-[13px] text-[#475569] mb-5">Todos os participantes do time <strong>{team.fullName}</strong> serão aprovados e o status do time mudará para "Aprovado".</p>
            <div className="flex gap-3">
              <button onClick={() => setShowApproveModal(false)} className="flex-1 py-2.5 rounded-[6px] text-[13px] font-semibold text-[#475569]" style={{ border: "1px solid #cbd5e1" }}>Cancelar</button>
              <button onClick={approveAll} className="flex-1 py-2.5 rounded-[6px] text-[13px] font-bold text-white" style={{ background: "#16a34a" }}>Aprovar</button>
            </div>
          </div>
        </div>
      )}

      {/* Arena modal */}
      {showArenaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-[12px] p-6 shadow-2xl" style={{ width: 380 }}>
            <h3 className="font-bold text-[15px] text-[#051d30] mb-3">Adicionar Arena</h3>
            <input className="w-full rounded-[6px] px-3 py-2.5 text-[13px] outline-none focus:ring-1 focus:ring-[#00356a]"
              style={{ border: "1px solid #e2e8f0" }}
              placeholder="Nome da arena"
              value={newArena} onChange={(e) => setNewArena(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addArena()} />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowArenaModal(false)} className="flex-1 py-2.5 rounded-[6px] text-[13px] font-semibold text-[#475569]" style={{ border: "1px solid #cbd5e1" }}>Cancelar</button>
              <button onClick={addArena} className="flex-1 py-2.5 rounded-[6px] text-[13px] font-bold text-white" style={{ background: "#051d30" }}>Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TeamList view ───────────────────────────────────────────────────────────

function TeamList({
  teams, onSelectTeam,
}: {
  teams: Team[];
  onSelectTeam: (t: Team) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Categoria: Sumô");

  const pending = teams.filter((t) => t.status === "PENDENTE").length;
  const approved = teams.filter((t) => t.status === "APROVADO").length;

  const filtered = teams.filter((t) => {
    const matchSearch =
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.teamId.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Categoria: Sumô" || filter === "Status: Todos" || filter === "Todas as Categorias" || t.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex-1 overflow-y-auto" style={{ paddingLeft: 40, paddingRight: 40, paddingTop: 28, paddingBottom: 40 }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[2px] uppercase" style={{ color: "#8c4f00" }}>ADMINISTRAÇÃO TÉCNICA • SUMÔ</p>
          <h1 className="font-normal text-[36px] text-[#051d30] tracking-[-0.9px] mt-1">Análise de Inscrições - Sumô</h1>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="rounded-[2px] px-2 py-1 text-[10px] font-semibold tracking-[0.5px] uppercase" style={{ background: "#ffdcbf", color: "#2d1600" }}>
            {pending} PENDENTES
          </span>
          <span className="rounded-[2px] px-2 py-1 text-[10px] font-semibold tracking-[0.5px] uppercase" style={{ background: "#cfe5ff", color: "#051d30" }}>
            {approved} APROVADOS
          </span>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-[6px] px-3" style={{ border: "1px solid rgba(194,198,210,0.5)", height: 40 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="flex-1 text-[13px] outline-none bg-transparent placeholder:text-[#94a3b8]"
            placeholder="Buscar por nome da equipe, mentor ou ID..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="px-5 rounded-[6px] text-[12px] font-bold text-white" style={{ background: "#051d30", height: 40 }}>
          FILTRAR
        </button>
        <div className="relative">
          <select className="appearance-none bg-white rounded-[6px] px-4 pr-8 text-[13px] text-[#475569] outline-none cursor-pointer"
            style={{ border: "1px solid rgba(194,198,210,0.5)", height: 40 }}
            value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>Categoria: Sumô</option>
            <option>Status: Todos</option>
            <option>APROVADO</option>
            <option>PENDENTE</option>
            <option>AJUSTE NECESSÁRIO</option>
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      {/* Team rows */}
      <div className="flex flex-col gap-3">
        {filtered.map((team) => {
          const hasIssue = team.status === "AJUSTE NECESSÁRIO";
          return (
            <div key={team.id} className="bg-white rounded-[8px] flex items-center gap-5 px-5 py-4 hover:shadow-md transition-shadow cursor-pointer"
              style={{ border: `1px solid ${hasIssue ? "rgba(239,68,68,0.3)" : "rgba(194,198,210,0.3)"}`, borderLeft: hasIssue ? "3px solid #ef4444" : "1px solid rgba(194,198,210,0.3)" }}
              onClick={() => onSelectTeam(team)}>
              {/* Logo */}
              <div className="w-[52px] h-[52px] rounded-[6px] overflow-hidden shrink-0 bg-[#f1f5f9] flex items-center justify-center">
                {team.logo
                  ? <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                  : <span className="text-[16px] font-bold text-[#94a3b8]">{team.name[0]}</span>}
              </div>
              {/* Name + ID */}
              <div style={{ width: 180 }}>
                <p className="font-bold text-[15px] text-[#051d30]">{team.name}</p>
                <p className="font-normal text-[13px] text-[#051d30]">{team.fullName.replace(team.name, "").trim() || team.fullName}</p>
                <p className="text-[10px] text-[#8c9ab0] mt-0.5">ID: {team.teamId}</p>
              </div>
              {/* Member avatars */}
              <div className="flex items-center" style={{ minWidth: 100 }}>
                <div className="flex -space-x-2">
                  {team.members.slice(0, 3).map((m) => (
                    <div key={m.id} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white" style={{ background: m.color }}>
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
              {/* Doc status */}
              <div className="flex items-center gap-2 ml-auto">
                {team.status === "APROVADO" ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#16a34a]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    VERIFICADO
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {[{ label: "IDENTIDADE" }, { label: "DIREITO IMAGEM" }].map((d) => (
                      <div key={d.label} className="flex items-center gap-1 rounded-[4px] px-2 py-1" style={{ background: hasIssue ? "#fee2e2" : "#f1f5f9" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={hasIssue ? "#dc2626" : "#94a3b8"} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <span className="text-[9px] uppercase tracking-[0.3px] font-medium" style={{ color: hasIssue ? "#dc2626" : "#94a3b8" }}>{d.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Status */}
              <div style={{ minWidth: 120 }}>{statusChip(team.status)}</div>
              {/* Eye */}
              <button className="p-2 rounded-full hover:bg-[#edf4ff] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-[8px] p-10 text-center text-[13px] text-[#94a3b8]" style={{ border: "1px solid rgba(194,198,210,0.3)" }}>
            Nenhum time encontrado para "{search}".
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main TeamsPage ──────────────────────────────────────────────────────────

type View =
  | { type: "list" }
  | { type: "team"; teamId: string }
  | { type: "member"; teamId: string; memberId: string };

export default function TeamsPage({
  onNavigate,
  onLogout,
}: {
  onNavigate: (key: string) => void;
  onLogout: () => void;
}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>({ type: "list" });

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:3000/api/v1/Equipes", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const mappedTeams = data.map((t: any) => ({
          ...t,
          id: t.id || t._id,
          name: t.name || t.nome,
          fullName: t.fullName || t.nome || t.name,
          teamId: t.teamId || `#RA-2026-${(t.id || t._id).slice(-3)}`,
          logo:
            (t.name || t.nome) === "CyberBots"
              ? imgCyberBotsLogo
              : (t.name || t.nome) === "TechKnights"
              ? imgTechKnightsLogo
              : (t.name || t.nome) === "MechEng"
              ? imgMechEngLogo
              : undefined,
          arenas: t.arenas || [],
          members: (t.members || []).map((m: any) => ({
            ...m,
            id: m.id || m.cpf,
          })),
        }));
        setTeams(mappedTeams);
      })
      .catch((err) => console.error("Error loading teams:", err))
      .finally(() => setLoading(false));
  }, []);


  function navigate(key: string) {
    if (key === "times") setView({ type: "list" });
    else onNavigate(key);
  }

  async function updateTeam(updated: Team) {
    try {
      await fetch(`http://localhost:3000/api/v1/Equipes/${updated.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: updated.status }),
        credentials: "include"
      });
      
      for (const m of updated.members) {
        await fetch(`http://localhost:3000/api/v1/Equipes/${updated.id}/membros/${m.cpf}/doc-status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ docStatus: m.docStatus }),
          credentials: "include"
        });
      }
      
      setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error("Error updating team status:", err);
    }
  }

  async function updateMember(teamId: string, updated: Member) {
    try {
      await fetch(`http://localhost:3000/api/v1/Equipes/${teamId}/membros/${updated.cpf}/doc-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docStatus: updated.docStatus, judgeNote: updated.judgeNote }),
        credentials: "include"
      });
      
      setTeams((prev) =>
        prev.map((t) =>
          t.id === teamId
            ? { ...t, members: t.members.map((m) => (m.id === updated.id ? updated : m)) }
            : t
        )
      );
    } catch (err) {
      console.error("Error updating member doc status:", err);
    }
  }

  const activeTeam = view.type !== "list" ? teams.find((t) => t.id === view.teamId) : null;
  const activeMember = view.type === "member" && activeTeam
    ? activeTeam.members.find((m) => m.id === view.memberId)
    : null;

  return (
    <div className="fixed inset-0 z-[800] flex overflow-hidden" style={{ background: "#f7f9ff" }}>
      <AdminSidebar active="times" onNavigate={navigate} onLogout={onLogout} />
      <div className="flex flex-col flex-1 overflow-hidden" style={{ marginLeft: 256 }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-10 shrink-0" style={{ height: 64, borderBottom: "1px solid rgba(194,198,210,0.3)", background: "#f7f9ff" }}>
          <span className="font-bold text-[14px] text-[#051d30] tracking-[1.5px] uppercase">
            {view.type === "list" ? "Times" : view.type === "team" ? activeTeam?.fullName : activeMember?.name}
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              API ONLINE (MongoDB Atlas)
            </span>
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#edf4ff] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#edf4ff] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {view.type === "list" && (
            loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-[#8c9ab0]">
                <div className="w-10 h-10 border-3 border-[#00356a] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[16px]">Carregando equipes do MongoDB Atlas...</p>
              </div>
            ) : (
              <TeamList teams={teams} onSelectTeam={(t) => setView({ type: "team", teamId: t.id })} />
            )
          )}

          {view.type === "team" && activeTeam && (
            <TeamProfile
              team={activeTeam}
              onBack={() => setView({ type: "list" })}
              onMemberClick={(m) => setView({ type: "member", teamId: activeTeam.id, memberId: m.id })}
              onUpdate={updateTeam}
            />
          )}
          {view.type === "member" && activeTeam && activeMember && (
            <MemberDetail
              member={activeMember}
              teamName={activeTeam.fullName}
              onBack={() => setView({ type: "team", teamId: activeTeam.id })}
              onUpdate={(m) => { updateMember(activeTeam.id, m); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
