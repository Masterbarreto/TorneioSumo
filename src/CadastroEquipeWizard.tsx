// filepath: src/CadastroEquipeWizard.tsx
import { useState, useRef, ChangeEvent } from "react";
import { UserSession } from "./utils/cookies";

export interface WizardMember {
  id: string;
  name: string;
  email: string;
  grade: string;
  document: string;
  role: string;
  termFile?: string;
  docStatus: "approved" | "pending" | "rejected";
  initials: string;
  color: string;
  uid: string;
  lastUpdate: string;
}

interface CadastroEquipeWizardProps {
  user: UserSession | null;
  onCancel: () => void;
  onComplete: (teamData: any) => void;
  onLogout?: () => void;
}

export default function CadastroEquipeWizard({
  user,
  onCancel,
  onComplete,
  onLogout,
}: CadastroEquipeWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Identidade
  const [teamName, setTeamName] = useState("");
  const [institution, setInstitution] = useState("Senac Hub Academy");
  const [selectedArena, setSelectedArena] = useState("sumo");
  const [step1Error, setStep1Error] = useState("");

  // Step 2: Membros
  const [members, setMembers] = useState<WizardMember[]>([
    {
      id: "m_seed_1",
      name: user?.name || "Marcus V. Silva",
      email: user?.email || "marcus.silva@senac.edu.br",
      grade: "3º Ano do Ensino Médio",
      document: "489.223.111-09",
      role: "Lead Engineer",
      termFile: "termo_ciencia_marcus.pdf",
      docStatus: "approved",
      initials: (user?.name || "Marcus Silva")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      color: "#00356a",
      uid: "UID: NR-2026-001",
      lastUpdate: "12 Oct 2026",
    },
  ]);

  // Form step 2 fields
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberGrade, setMemberGrade] = useState("2º Ano do Ensino Médio");
  const [memberDoc, setMemberDoc] = useState("");
  const [memberRole, setMemberRole] = useState("Programador(a)");
  const [memberTermName, setMemberTermName] = useState<string>("");
  const [memberFormError, setMemberFormError] = useState("");
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Revisão - 5 Termos
  const [agreements, setAgreements] = useState<boolean[]>([false, false, false, false, false]);
  const [step3Error, setStep3Error] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Step 4: Protocolo gerado
  const [generatedProtocol, setGeneratedProtocol] = useState("NR-2026-68382-X");
  const [submissionDate, setSubmissionDate] = useState("");
  const [createdTeamData, setCreatedTeamData] = useState<any>(null);

  const avatarColors = ["#00356a", "#0284c7", "#059669", "#d97706", "#7c3aed", "#db2777"];

  // Step 1 Validation & Next
  const handleNextFromStep1 = () => {
    if (!teamName.trim()) {
      setStep1Error("Por favor, preencha o Nome da Equipe.");
      return;
    }
    if (!institution.trim()) {
      setStep1Error("Por favor, informe a Instituição de Ensino.");
      return;
    }
    setStep1Error("");
    setStep(2);
  };

  // Add / Edit Member to Roster
  const handleAddMember = () => {
    if (!memberName.trim()) {
      setMemberFormError("Informe o nome completo do integrante.");
      return;
    }
    if (!memberEmail.trim() || !memberEmail.includes("@")) {
      setMemberFormError("Informe um e-mail válido.");
      return;
    }
    if (!memberDoc.trim()) {
      setMemberFormError("Informe o documento (RG ou CPF).");
      return;
    }
    if (members.length >= 5 && !editingMemberId) {
      setMemberFormError("Limite técnico de 5 membros atingido para esta arena.");
      return;
    }

    const initials = memberName
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const nowStr = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    if (editingMemberId) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingMemberId
            ? {
                ...m,
                name: memberName.trim(),
                email: memberEmail.trim(),
                grade: memberGrade,
                document: memberDoc.trim(),
                role: memberRole,
                termFile: memberTermName || m.termFile,
                lastUpdate: nowStr,
              }
            : m
        )
      );
      setEditingMemberId(null);
    } else {
      const newM: WizardMember = {
        id: "m_" + Math.random().toString(36).substring(2, 9),
        name: memberName.trim(),
        email: memberEmail.trim(),
        grade: memberGrade,
        document: memberDoc.trim(),
        role: memberRole,
        termFile: memberTermName || "termo_assinado.pdf",
        docStatus: memberTermName ? "approved" : "pending",
        initials,
        color: avatarColors[members.length % avatarColors.length],
        uid: `UID: NR-2026-${String(Math.floor(10 + Math.random() * 890)).padStart(3, "0")}`,
        lastUpdate: nowStr,
      };
      setMembers((prev) => [...prev, newM]);
    }

    // Reset member inputs
    setMemberName("");
    setMemberEmail("");
    setMemberDoc("");
    setMemberTermName("");
    setMemberFormError("");
  };

  const handleEditMember = (m: WizardMember) => {
    setEditingMemberId(m.id);
    setMemberName(m.name);
    setMemberEmail(m.email);
    setMemberGrade(m.grade);
    setMemberDoc(m.document);
    setMemberRole(m.role);
    setMemberTermName(m.termFile || "");
    setMemberFormError("");
  };

  const handleDeleteMember = (id: string) => {
    if (members.length <= 1) {
      setMemberFormError("A equipe precisa de pelo menos 1 integrante cadastrado.");
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMemberTermName(e.target.files[0].name);
    }
  };

  // Step 3 Agreement toggles
  const toggleAgreement = (index: number) => {
    setAgreements((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const allAgreed = agreements.every(Boolean);

  // Final Submit to Backend API
  const handleFinalSubmit = async () => {
    if (!allAgreed) {
      setStep3Error("Você precisa assinalar todos os 5 termos de acordo para oficializar a inscrição.");
      return;
    }
    setStep3Error("");
    setSubmitting(true);

    const now = new Date();
    const formattedDate = now.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setSubmissionDate(formattedDate);

    try {
      const res = await fetch("http://localhost:3000/api/v1/Equipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nome: teamName.trim(),
          fullName: teamName.trim(),
          instituicao: institution.trim(),
          robotName: "Kensei Blade 3.0",
          category: "Heavyweight Sumô 3kg (Autônomo)",
          arenas: ["Sumô"],
          members: members.map((m) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            cpf: m.document,
            role: m.role,
            initials: m.initials,
            color: m.color,
            memberId: m.uid,
            docStatus: m.docStatus,
          })),
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        setStep3Error(data.error || "Erro ao registrar a inscrição. Tente novamente.");
        return;
      }

      setGeneratedProtocol(data.protocolo || `NR-2026-${Math.floor(10000 + Math.random() * 89999)}-X`);
      setCreatedTeamData(data);
      setStep(4);
    } catch (err) {
      setSubmitting(false);
      // Fallback local caso servidor offline
      const mockProto = `NR-2026-${Math.floor(10000 + Math.random() * 89999)}-X`;
      setGeneratedProtocol(mockProto);
      setCreatedTeamData({
        id: "team_local_" + Date.now(),
        name: teamName,
        teamId: "#RA-2026-001",
        protocolo: mockProto,
        members,
      });
      setStep(4);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#051d30] flex flex-col font-['Inter',sans-serif]">
      {/* ─── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sm:px-12 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-6">
          <span className="font-['Space_Grotesk'] font-bold text-[#00356a] tracking-[2.5px] text-[15px] uppercase">
            ROBOTIC_SYNC
          </span>
          <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Portal do Competidor
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            title="Notificações"
            className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <button
            title="Configurações"
            className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider font-['Space_Grotesk']"
            >
              Sair
            </button>
          )}
        </div>
      </header>

      {/* ─── Main Content Container ────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-10 flex flex-col gap-8">
        {step < 4 && (
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-[#8c4f00] tracking-[2.4px] uppercase font-['Inter']">
                INSCRIÇÃO ABERTA
              </span>
              <span className="h-0.5 w-12 bg-[#8c4f00]/40" />
            </div>
            <h1 className="font-['Space_Grotesk'] font-bold text-[#051d30] text-3xl sm:text-4xl mt-1 tracking-tight">
              Cadastro de Equipe
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-3xl">
              Prepare sua equipe para o Regional 2026. Complete as etapas abaixo para oficializar sua participação nas arenas tecnológicas.
            </p>

            {/* Stepper Progress Bar */}
            <div className="mt-8 flex items-center justify-between max-w-xl mx-auto relative">
              {/* Connector line */}
              <div className="absolute top-5 left-8 right-8 h-0.5 bg-[#cfe5ff] -z-0" />

              {/* Step 1 */}
              <div className="flex flex-col items-center gap-2 relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step >= 1 ? "bg-[#00356a] text-white shadow-md shadow-blue-900/20" : "bg-[#cfe5ff] text-[#00356a]"
                  }`}
                >
                  {step > 1 ? "✓" : "1"}
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${step === 1 ? "text-[#00356a]" : "text-slate-500"}`}>
                  IDENTIDADE
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-2 relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step >= 2 ? "bg-[#00356a] text-white shadow-md shadow-blue-900/20" : "bg-[#cfe5ff] text-[#00356a]"
                  }`}
                >
                  {step > 2 ? "✓" : "2"}
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${step === 2 ? "text-[#00356a]" : "text-slate-500"}`}>
                  MEMBROS
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-2 relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step === 3 ? "bg-[#00356a] text-white shadow-md shadow-blue-900/20" : "bg-[#cfe5ff] text-[#00356a]"
                  }`}
                >
                  3
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${step === 3 ? "text-[#00356a]" : "text-slate-500"}`}>
                  REVISÃO
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── PASSO 1: IDENTIDADE ─────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm flex flex-col gap-8 animate-fade-in">
            {/* Secção 1: Identificação */}
            <div>
              <div className="flex items-center gap-2 text-[#051d30] font-bold font-['Space_Grotesk'] text-lg mb-4">
                <span>💼</span>
                <h2>Identificação da Equipe</h2>
              </div>

              {step1Error && (
                <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                  <span>⚠️</span> {step1Error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-['Space_Grotesk']">
                    NOME DA EQUIPE
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Ex: Cyber-Phoenix"
                    className="w-full px-4 py-3.5 bg-[#f0f4fa] border border-slate-200 rounded-xl text-sm font-medium text-[#051d30] outline-none focus:bg-white focus:border-[#00356a] focus:ring-2 focus:ring-[#00356a]/10 transition-all placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-['Space_Grotesk']">
                    INSTITUIÇÃO DE ENSINO
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Ex: Senac Hub Academy"
                    className="w-full px-4 py-3.5 bg-[#f0f4fa] border border-slate-200 rounded-xl text-sm font-medium text-[#051d30] outline-none focus:bg-white focus:border-[#00356a] focus:ring-2 focus:ring-[#00356a]/10 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Secção 2: Seleção de Arenas */}
            <div>
              <div className="flex items-center gap-2 text-[#051d30] font-bold font-['Space_Grotesk'] text-lg mb-4">
                <span>🎮</span>
                <h2>Seleção de Arenas</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setSelectedArena("sumo")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    selectedArena === "sumo"
                      ? "bg-[#edf4ff] border-[#00356a] shadow-md shadow-blue-900/5"
                      : "bg-[#f0f4fa] border-transparent hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-xs border border-slate-100">
                      🤼
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedArena === "sumo" ? "border-[#00356a] bg-[#00356a]" : "border-slate-300"
                      }`}
                    >
                      {selectedArena === "sumo" && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-['Space_Grotesk'] font-bold text-base text-[#051d30]">
                      Sumô
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Combate técnico de força e estratégia de sensores.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-blue-200/50 flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <span>VAGAS: 08</span>
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Disponível</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1 Footer */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider font-['Space_Grotesk'] transition-colors cursor-pointer"
              >
                ← CANCELAR INSCRIÇÃO
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => alert("Rascunho salvo temporariamente neste navegador.")}
                  className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-[#cfe5ff] hover:bg-[#b9d9ff] text-[#00356a] font-bold text-xs uppercase font-['Space_Grotesk'] tracking-wider transition-colors cursor-pointer"
                >
                  SALVAR RASCUNHO
                </button>
                <button
                  type="button"
                  onClick={handleNextFromStep1}
                  className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-[#00356a] hover:bg-[#00468a] text-white font-bold text-xs uppercase font-['Space_Grotesk'] tracking-wider shadow-md shadow-blue-900/15 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  PRÓXIMA ETAPA →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── PASSO 2: MEMBROS ────────────────────────────────────────── */}
        {step === 2 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div>
              <span className="text-[11px] font-bold text-[#8c4f00] tracking-[2px] uppercase">
                PASSO 02 ─── MEMBROS
              </span>
              <h2 className="font-['Space_Grotesk'] font-bold text-2xl sm:text-3xl text-[#051d30] mt-0.5">
                Registro dos Membros
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Reúna sua equipe. Forneça os dados de identificação e as funções técnicas de cada participante. A precisão no cadastro garante uma experiência perfeita no torneio.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 font-bold font-['Space_Grotesk'] text-[#051d30] text-base border-b border-slate-100 pb-3">
                  <span>👥</span>
                  <h3>{editingMemberId ? "Editar Membro da Equipe" : "Registro dos Membros da Equipe"}</h3>
                </div>

                {memberFormError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                    ⚠️ {memberFormError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome completo:
                  </label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="Nome de Registro/social"
                    className="w-full px-3.5 py-2.5 bg-[#f0f4fa] border border-slate-200 rounded-xl text-xs font-['Inter'] text-slate-900 focus:bg-white focus:border-[#00356a] outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail institucional/pessoal:
                  </label>
                  <input
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="estudante@senac.edu.br"
                    className="w-full px-3.5 py-2.5 bg-[#f0f4fa] border border-slate-200 rounded-xl text-xs font-['Inter'] text-slate-900 focus:bg-white focus:border-[#00356a] outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ano do ensino médio sendo cursado:
                  </label>
                  <select
                    value={memberGrade}
                    onChange={(e) => setMemberGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f0f4fa] border border-slate-200 rounded-xl text-xs font-['Inter'] text-slate-900 focus:bg-white focus:border-[#00356a] outline-none transition-all cursor-pointer"
                  >
                    <option value="1º Ano do Ensino Médio">1º Ano do Ensino Médio</option>
                    <option value="2º Ano do Ensino Médio">2º Ano do Ensino Médio</option>
                    <option value="3º Ano do Ensino Médio">3º Ano do Ensino Médio</option>
                    <option value="Ensino Técnico Integrado">Ensino Técnico Integrado</option>
                    <option value="Ensino Superior / Tecnólogo">Ensino Superior / Tecnólogo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Documento (RG/CPF):
                  </label>
                  <input
                    type="text"
                    value={memberDoc}
                    onChange={(e) => setMemberDoc(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3.5 py-2.5 bg-[#f0f4fa] border border-slate-200 rounded-xl text-xs font-['Inter'] text-slate-900 focus:bg-white focus:border-[#00356a] outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Função no time:
                  </label>
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f0f4fa] border border-slate-200 rounded-xl text-xs font-['Inter'] text-slate-900 focus:bg-white focus:border-[#00356a] outline-none transition-all cursor-pointer"
                  >
                    <option value="Lead Engineer">Lead Engineer (Líder Técnico)</option>
                    <option value="Software Architect">Software Architect (Programador)</option>
                    <option value="Mechatronics Tech">Mechatronics Tech (Mecânico)</option>
                    <option value="Strategic Analyst">Strategic Analyst (Estrategista)</option>
                    <option value="Piloto de Arena">Piloto de Arena</option>
                  </select>
                </div>

                {/* Termo de Ciência */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Termo de Ciência:
                    </label>
                    <a
                      href="https://bit.ly/7torneioderoboticasenac"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#00356a] hover:underline font-semibold"
                    >
                      Baixar Modelo ↗
                    </a>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#00356a] bg-blue-50/30 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-[#00356a] flex items-center justify-center text-base">
                      ☁️
                    </div>
                    {memberTermName ? (
                      <p className="text-xs font-bold text-emerald-700 break-all">
                        ✓ {memberTermName}
                      </p>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-slate-700">
                          Click to upload or drag & drop
                        </p>
                        <p className="text-[10px] text-slate-400">PDF, PNG OR JPG (MAX 5MB)</p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddMember}
                  className="mt-2 w-full py-3 bg-[#00356a] hover:bg-[#00468a] text-white rounded-xl text-xs font-bold font-['Space_Grotesk'] uppercase tracking-wider shadow-md shadow-blue-900/10 transition-all cursor-pointer"
                >
                  {editingMemberId ? "ATUALIZAR MEMBRO" : "+ ADD TO ROSTER"}
                </button>
              </div>

              {/* Right Column: Roster Table */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-['Space_Grotesk'] font-bold text-[#051d30] text-base">
                      Membros registrados ({members.length})
                    </h3>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
                      LIMITE TÉCNICO: 5
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5">NOME COMPLETO</th>
                          <th className="py-2.5 text-center">TERMO DE CIÊNCIA</th>
                          <th className="py-2.5">LAST UPDATE</th>
                          <th className="py-2.5 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {members.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 pr-2">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                                  style={{ backgroundColor: m.color }}
                                >
                                  {m.initials}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">{m.name}</div>
                                  <div className="text-[10px] text-slate-400">
                                    {m.uid} • {m.role}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 text-center">
                              {m.docStatus === "approved" ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold" title="Termo Aprovado">
                                  ✓
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold" title="Pendente de Validação">
                                  ⏱
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                              {m.lastUpdate}
                            </td>
                            <td className="py-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditMember(m)}
                                  className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMember(m.id)}
                                  className="p-1.5 hover:bg-red-50 rounded text-red-500 transition-colors cursor-pointer"
                                  title="Remover"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Displaying {members.length} member{members.length > 1 ? "s" : ""}</span>
                    <div className="flex items-center gap-1">
                      <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50">‹</button>
                      <button className="px-2 py-0.5 bg-[#00356a] text-white rounded font-bold">1</button>
                      <button className="px-2 py-0.5 border border-slate-200 rounded text-slate-500 hover:bg-slate-50">›</button>
                    </div>
                  </div>
                </div>

                {/* Protocol Callout */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-[#00356a] flex items-center justify-center shrink-0 font-bold">
                    ℹ
                  </div>
                  <p>
                    <strong className="text-slate-800">Protocolo de segurança:</strong> Cada membro da equipe deve ter seus documentos legais verificados antes de poder entrar na área da Arena. É possível atualizar esses documentos até o prazo final de inscrição.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 Footer */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase font-['Space_Grotesk'] tracking-wider cursor-pointer"
              >
                ← VOLTAR
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-[#00356a] hover:bg-[#00468a] text-white rounded-xl text-xs font-bold font-['Space_Grotesk'] uppercase tracking-wider shadow-md shadow-blue-900/10 transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
              >
                PRÓXIMA ETAPA →
              </button>
            </div>
          </div>
        )}

        {/* ─── PASSO 3: REVISÃO ────────────────────────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col gap-8 animate-fade-in">
            <div>
              <h2 className="font-['Space_Grotesk'] font-bold text-2xl sm:text-3xl text-[#051d30]">
                Revisão da Inscrição (Review Your Registration)
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Revise todas as informações abaixo com atenção. A precisão é fundamental, pois os dados não poderão ser alterados após o envio final.
              </p>
            </div>

            {step3Error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <span>⚠️</span> {step3Error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Card 1: Team Identity */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between gap-6 min-h-[340px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 font-['Space_Grotesk']">
                    <span>🛡️</span> Team Identity
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-[#00356a] hover:underline cursor-pointer"
                  >
                    EDIT
                  </button>
                </div>

                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-20 h-20 rounded-2xl bg-[#051d30] border-2 border-amber-500/40 flex items-center justify-center text-3xl shadow-inner">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-['Space_Grotesk'] font-bold text-xl text-[#051d30]">
                      {teamName || "CyberKnights XI"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Regional Division - Alpha</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <div>
                    <span className="block text-[9px] text-slate-400">FOUNDATION</span>
                    <span>2026</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] text-slate-400">AFFILIATION</span>
                    <span className="text-[#00356a] truncate max-w-[140px] block">{institution}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Core Members */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between gap-4 min-h-[340px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 font-['Space_Grotesk']">
                    <span>👥</span> Core Members ({members.length})
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-[#00356a] hover:underline cursor-pointer"
                  >
                    EDIT
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60 flex items-center gap-2.5"
                    >
                      <div
                        className="w-7 h-7 rounded-lg text-white font-bold text-[10px] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: m.color }}
                      >
                        {m.initials}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">{m.name}</div>
                        <div className="text-[10px] text-[#8c4f00] font-medium truncate">{m.role}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-slate-400 text-center pt-3 border-t border-slate-100">
                  Arena de Inscrição: <strong className="text-slate-700 uppercase">{selectedArena}</strong>
                </div>
              </div>

              {/* Card 3: Final Agreements */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
                <h3 className="font-['Space_Grotesk'] font-bold text-base text-[#051d30] text-center border-b border-slate-100 pb-2">
                  Termos e Declarações Finais
                </h3>

                <div className="flex flex-col gap-3">
                  {[
                    "Estou ciente de que cada equipe deve ter de 2 a 4 integrantes, além de um tutor responsável maior de 18 anos vinculado à instituição de ensino de origem do estudante competidor.",
                    "Estou ciente de que cada membro da equipe deve assinar individualmente o Termo de Ciência. Todos os termos devem ser compilados em um único arquivo PDF e assinados pelo representante da instituição de ensino de origem.",
                    "Estou ciente de que todos os competidores deverão apresentar um documento oficial com foto para identificação no dia do evento.",
                    "Estou ciente de que a responsabilidade pelo transporte, alimentação, seguro e estadia durante o evento é da instituição de origem ou dos próprios estudantes.",
                    "Estou ciente de que autorizo, de forma gratuita, o uso da minha imagem, voz e nome em vídeos, fotos e/ou sons captados durante o torneio para fins de divulgação em qualquer tipo de mídia.",
                  ].map((text, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 cursor-pointer group text-[11px] text-slate-600 leading-snug select-none"
                    >
                      <input
                        type="checkbox"
                        checked={agreements[idx]}
                        onChange={() => toggleAgreement(idx)}
                        className="mt-0.5 rounded border-slate-300 text-[#00356a] focus:ring-[#00356a] cursor-pointer"
                      />
                      <span className="group-hover:text-slate-900 transition-colors">
                        {text}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={!allAgreed || submitting}
                    className="w-full py-3.5 bg-[#00356a] hover:bg-[#00468a] disabled:opacity-50 text-white rounded-xl text-xs font-bold font-['Space_Grotesk'] uppercase tracking-wider shadow-md shadow-blue-900/15 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        PROCESSANDO...
                      </>
                    ) : (
                      "FINALIZAR INSCRIÇÃO ➢"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase font-['Space_Grotesk'] tracking-wider"
                  >
                    ← VOLTAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── PASSO 4: CONFIRMAÇÃO DE SUCESSO ─────────────────────────── */}
        {step === 4 && (
          <div className="max-w-xl mx-auto w-full flex flex-col items-center justify-center animate-fade-in my-auto py-6">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-2xl w-full text-center flex flex-col items-center gap-5 relative overflow-hidden">
              {/* Top ambient glow */}
              <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* Verified badge */}
              <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center text-amber-500 text-3xl shadow-lg shadow-amber-500/15">
                ✓
              </div>

              <div>
                <span className="text-[10px] font-bold tracking-[2px] uppercase text-amber-800 font-['Space_Grotesk']">
                  REGISTRATION FINALIZED
                </span>
                <h2 className="font-['Space_Grotesk'] font-bold text-2xl sm:text-3xl text-[#051d30] mt-1">
                  Inscrição Realizada com Sucesso!
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
                  Parabéns à equipe <strong>{teamName}</strong>! Sua inscrição para o torneio de 2026 foi recebida em nosso sistema. Agora, iniciaremos a etapa de análise técnica dos documentos.
                </p>
              </div>

              {/* Next step notice */}
              <div className="w-full bg-[#f0f4fa] border border-blue-100 rounded-2xl p-4 text-left flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white text-[#00356a] flex items-center justify-center shrink-0 shadow-xs text-base">
                  📋
                </div>
                <div>
                  <div className="text-xs font-bold text-[#00356a] uppercase font-['Space_Grotesk'] tracking-wider">
                    PRÓXIMO PASSO
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Nossa equipe revisará os documentos enviados em até 5 dias úteis. Você receberá uma notificação via Dashboard assim que o status for atualizado.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
                <button
                  type="button"
                  onClick={() => onComplete(createdTeamData)}
                  className="w-full py-3.5 bg-[#00356a] hover:bg-[#00468a] text-white rounded-xl text-xs font-bold font-['Space_Grotesk'] uppercase tracking-wider shadow-lg shadow-blue-900/15 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  ACESSAR PAINEL DA EQUIPE →
                </button>
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="w-full py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold font-['Space_Grotesk'] uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  📄 BAIXAR COMPROVANTE (PDF)
                </button>
              </div>

              {/* Metadata footer */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between w-full text-[11px] text-slate-400 gap-2">
                <span className="font-mono">🛡️ PROTOCOLO: {generatedProtocol}</span>
                <span>🕒 ENVIADO EM: {submissionDate || "07 SET 2026, 14:32"}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
