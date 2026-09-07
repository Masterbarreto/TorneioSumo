import { useState, useEffect } from "react";
import { getUserSession, clearUserSession, saveUserSession, UserSession } from "./utils/cookies";
import AlunoOnboarding from "./AlunoOnboarding";
import CadastroEquipeWizard from "./CadastroEquipeWizard";
import EntrarEquipeModal from "./EntrarEquipeModal";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  docStatus: "approved" | "pending" | "rejected";
}

interface StudentTeam {
  id: string;
  name: string;
  code: string;
  captainCode?: string;
  robotName: string;
  robotWeight: string;
  robotDimensions: string;
  bladeType: string;
  category: string;
  status: string;
  members: TeamMember[];
}

interface MatchItem {
  id: string;
  code: string;
  phase: string;
  status: string;
  released: boolean;
  round1Winner?: string | null;
  round2Winner?: string | null;
  round3Winner?: string | null;
  round1Duration?: number | null;
  round2Duration?: number | null;
  team1: {
    id: string;
    name: string;
    robot?: string;
    score?: number;
    seed?: string;
  };
  team2: {
    id: string;
    name: string;
    robot?: string;
    score?: number;
    seed?: string;
  };
}

export default function AlunoPortal({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const [user, setUser] = useState<UserSession | null>(() => getUserSession());
  const [view, setView] = useState<"portal" | "onboarding" | "create_wizard">(() => {
    const session = getUserSession();
    // Se o usuário não tiver equipe ainda, mostra a tela de escolha/onboarding
    if (session && (session.teamId || session.teamName)) {
      return "portal";
    }
    return "onboarding";
  });
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const [isCheckingTeam, setIsCheckingTeam] = useState<boolean>(() => {
    const session = getUserSession();
    return !(session && (session.teamId || session.teamName));
  });

  const [activeTab, setActiveTab] = useState<"equipe" | "partidas" | "regras">("equipe");
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaptainCode, setCopiedCaptainCode] = useState(false);

  // Student team data
  const [team, setTeam] = useState<StudentTeam>({
    id: user?.teamId || "tm-sumo-01",
    name: user?.teamName || "CYBERKNIGHTS",
    code: "#TM-SUMO-01",
    captainCode: "CAP-CYBE-3429",
    robotName: user?.robotName || "Kensei Blade 3.0",
    robotWeight: "2.985 kg (Homologado)",
    robotDimensions: "20 x 19.5 x 12 cm",
    bladeType: "Aço Carbono Temperado 45°",
    category: "Heavyweight Sumô 3kg (Autônomo)",
    status: "HOMOLOGADO 100%",
    members: [
      { id: "m1", name: user?.name || "Gabriel Henrique", role: "Capitão & Estrategista", avatarColor: "#00356a", docStatus: "approved" },
      { id: "m2", name: "Lucas Barberato", role: "Programador de Sensores", avatarColor: "#0284c7", docStatus: "approved" },
      { id: "m3", name: "Mariana Souza", role: "Engenheira de Chassi", avatarColor: "#b45309", docStatus: "approved" },
    ],
  });

  useEffect(() => {
    const session = getUserSession();
    if (session) {
      setUser(session);
      if (session.teamName) {
        setTeam((prev) => ({ ...prev, name: session.teamName || prev.name }));
      }
    }

    // Carregar Equipes e Partidas da API
    const loadPortalData = async () => {
      try {
        const sessionNow = getUserSession();
        const userEmail = (sessionNow?.email || "").trim().toLowerCase();
        const userName = (sessionNow?.name || "").trim().toLowerCase();

        // 1. Carregar Equipes do torneio para identificar vínculo
        const teamsRes = await fetch("http://localhost:3000/api/v1/Equipes", { credentials: "include" });
        if (teamsRes.ok) {
          const allTeams = await teamsRes.json();
          if (Array.isArray(allTeams)) {
            const myTeam = allTeams.find((t: any) => {
              if (sessionNow?.teamId && (t.id === sessionNow.teamId || t._id === sessionNow.teamId || t.teamId === sessionNow.teamId)) return true;
              if (sessionNow?.teamName && (t.name?.toLowerCase() === sessionNow.teamName.toLowerCase() || t.nome?.toLowerCase() === sessionNow.teamName.toLowerCase())) return true;
              if (t.criadorId && sessionNow?.userId && t.criadorId === sessionNow.userId) return true;
              const memberList = Array.isArray(t.members) ? t.members : (Array.isArray(t.membros) ? t.membros : []);
              return memberList.some((m: any) => {
                const mEmail = (m.email || "").trim().toLowerCase();
                const mName = (m.name || m.nome || "").trim().toLowerCase();
                return (userEmail && mEmail === userEmail) || (userName && mName === userName);
              });
            });

            if (myTeam) {
              const teamCode = myTeam.teamId || myTeam.code || `#RA-2026-${(myTeam.id || myTeam._id || "001").slice(-3)}`;
              const memberList = Array.isArray(myTeam.members) ? myTeam.members : (Array.isArray(myTeam.membros) ? myTeam.membros : []);
              const formattedMembers = memberList.map((m: any, idx: number) => ({
                id: m.id || `m_${idx}`,
                name: m.name || m.nome || "Competidor",
                role: m.role || "Competidor Técnico",
                avatarColor: m.color || "#00356a",
                docStatus: m.docStatus || "approved",
              }));

              const fullTeamObj: StudentTeam = {
                id: (myTeam.id || myTeam._id || "").toString(),
                name: myTeam.name || myTeam.nome || "Equipe Sumô",
                code: teamCode,
                captainCode: myTeam.captainCode || "CAP-2026",
                robotName: myTeam.robotName || myTeam.robot || "Kensei Blade 3.0",
                robotWeight: myTeam.robotWeight || "2.985 kg (Homologado)",
                robotDimensions: myTeam.robotDimensions || "20 x 19.5 x 12 cm",
                bladeType: myTeam.bladeType || "Aço Carbono Temperado 45°",
                category: myTeam.category || "Heavyweight Sumô 3kg (Autônomo)",
                status: myTeam.status || "EQUIPE HOMOLOGADA",
                members: formattedMembers.length > 0 ? formattedMembers : [
                  { id: "m1", name: sessionNow?.name || "Aluno Competidor", role: "Competidor Técnico", avatarColor: "#00356a", docStatus: "approved" }
                ],
              };

              setTeam(fullTeamObj);
              setView("portal");

              if (sessionNow) {
                const updated: UserSession = {
                  ...sessionNow,
                  teamId: fullTeamObj.id,
                  teamName: fullTeamObj.name,
                  captainCode: fullTeamObj.captainCode,
                  robotName: fullTeamObj.robotName,
                };
                saveUserSession(updated, sessionNow.remember ?? true);
                setUser(updated);
              }
            }
          }
        }

        // 2. Carregar confrontos reais da API do MongoDB
        const matchesRes = await fetch("http://localhost:3000/api/v1/partidas", { credentials: "include" });
        if (matchesRes.ok) {
          const list = await matchesRes.json();
          if (Array.isArray(list)) {
            setMatches(list);
          }
        }
      } catch (err) {
        console.warn("API de equipes ou partidas offline:", err);
      } finally {
        setIsCheckingTeam(false);
        setLoading(false);
      }
    };

    loadPortalData();
  }, []);

  const handleLogoutClick = () => {
    clearUserSession();
    onLogout();
  };

  const handleTeamCreated = (teamData: any) => {
    const current = user || getUserSession() || {
      userId: "user-student",
      name: "Aluno Competidor",
      cargo: "ALUNO",
    };
    const updatedUser: UserSession = {
      ...current,
      teamId: teamData.id || teamData._id || teamData.teamId,
      teamName: teamData.nome || teamData.name,
      robotName: teamData.robotName || "Kensei Blade 3.0",
      captainCode: teamData.captainCode,
    };
    saveUserSession(updatedUser, current.remember ?? true);
    setUser(updatedUser);

    setTeam({
      id: teamData.id || teamData._id || "tm-new",
      name: teamData.nome || teamData.name || "NOVA EQUIPE",
      code: teamData.teamId || `#RA-2026-${Math.floor(100 + Math.random() * 900)}`,
      captainCode: teamData.captainCode || "CAP-NOVA-2026",
      robotName: teamData.robotName || "Kensei Blade 3.0",
      robotWeight: "2.985 kg (Homologado)",
      robotDimensions: "20 x 19.5 x 12 cm",
      bladeType: "Aço Carbono Temperado 45°",
      category: teamData.category || "Heavyweight Sumô 3kg (Autônomo)",
      status: "EM ANÁLISE TÉCNICA (5 DIAS)",
      members: (teamData.members || []).map((m: any, idx: number) => ({
        id: m.id || `m_${idx}`,
        name: m.name,
        role: m.role || "Competidor",
        avatarColor: m.color || "#00356a",
        docStatus: m.docStatus || "approved",
      })),
    });

    setView("portal");
  };

  const handleTeamJoined = (teamData: any) => {
    const current = user || getUserSession() || {
      userId: "user-student",
      name: "Aluno Competidor",
      cargo: "ALUNO",
    };
    const updatedUser: UserSession = {
      ...current,
      teamId: teamData.id || teamData._id,
      teamName: teamData.name || teamData.nome,
      robotName: teamData.robotName || "Kensei Blade 3.0",
      captainCode: teamData.captainCode,
    };
    saveUserSession(updatedUser, current.remember ?? true);
    setUser(updatedUser);

    setTeam({
      id: teamData.id || teamData._id || "tm-joined",
      name: teamData.name || teamData.nome,
      code: teamData.code || teamData.teamId || `#RA-2026-001`,
      captainCode: teamData.captainCode || "CAP-CYBE-3429",
      robotName: teamData.robotName || "Kensei Blade 3.0",
      robotWeight: "2.985 kg (Homologado)",
      robotDimensions: "20 x 19.5 x 12 cm",
      bladeType: "Aço Carbono Temperado 45°",
      category: "Heavyweight Sumô 3kg (Autônomo)",
      status: "EQUIPE HOMOLOGADA",
      members: (teamData.members || []).map((m: any, idx: number) => ({
        id: m.id || `m_${idx}`,
        name: m.name,
        role: m.role || "Competidor",
        avatarColor: m.color || "#00356a",
        docStatus: m.docStatus || "approved",
      })),
    });

    setIsJoinModalOpen(false);
    setView("portal");
  };

  // 1. View: Onboarding (Primeiro Acesso)
  // SE O USUÁRIO JÁ TIVER UMA EQUIPE, NUNCA DEVE APARECER
  if (view === "onboarding") {
    if (isCheckingTeam) {
      return (
        <div className="min-h-screen bg-[#f7f9ff] flex items-center justify-center font-['Inter',sans-serif]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#00356a] border-t-transparent rounded-full animate-spin" />
            <p className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-[#00356a]">
              Carregando dados da sua equipe...
            </p>
          </div>
        </div>
      );
    }

    if (user?.teamId || user?.teamName || (team.id && team.id !== "tm-sumo-01")) {
      setView("portal");
      return null;
    }

    return (
      <>
        <AlunoOnboarding
          user={user}
          onCreateTeam={() => setView("create_wizard")}
          onJoinTeam={() => setIsJoinModalOpen(true)}
          onLogout={handleLogoutClick}
        />
        <EntrarEquipeModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          user={user}
          onSuccess={handleTeamJoined}
        />
      </>
    );
  }

  // 2. View: Cadastro de Equipe (Wizard em 3 Passos)
  if (view === "create_wizard") {
    return (
      <CadastroEquipeWizard
        user={user}
        onCancel={() => setView("onboarding")}
        onComplete={handleTeamCreated}
        onLogout={handleLogoutClick}
      />
    );
  }

  // 3. View: Dashboard Principal do Aluno
  const myMatches = matches.filter(
    (m) =>
      m.team1?.name?.toUpperCase() === team.name.toUpperCase() ||
      m.team2?.name?.toUpperCase() === team.name.toUpperCase()
  );

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-[#051d30] flex flex-col">
      {/* ─── Top Header Bar ────────────────────────────────────────────── */}
      <header className="min-h-[68px] border-b border-[#e2e8f0] bg-white sticky top-0 z-40 px-4 sm:px-8 py-2.5 flex items-center justify-between flex-wrap gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#00356a] text-white flex items-center justify-center font-black text-[18px] shadow-sm">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk'] font-black text-[#00356a] text-[16px] tracking-wider uppercase">
                PORTAL DO COMPETIDOR
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#edf4ff] text-[#00356a] border border-[#c2d9f5]">
                SUMÔ 2026
              </span>
            </div>
            <p className="text-[11px] text-[#64748b] font-medium">
              Ambiente Oficial do Aluno • SENAC Engineering Committee
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Badge */}
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {team.status || "EQUIPE HOMOLOGADA"}
          </span>

          {/* User Profile & Logoff */}
          <div className="flex items-center gap-3 pl-3 border-l border-[#e2e8f0]">
            <div className="flex flex-col items-end">
              <span className="font-['Space_Grotesk'] font-bold text-[13px] text-[#051d30] leading-tight">
                {user?.name || "Aluno Competidor"}
              </span>
              <span className="font-mono text-[10px] text-[#8c4f00] font-bold tracking-wider uppercase">
                {team.name}
              </span>
            </div>

            <button
              onClick={handleLogoutClick}
              title="Encerrar sessão no portal"
              className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] bg-[#fee2e2] hover:bg-[#fecaca] text-[#991b1b] font-['Space_Grotesk'] font-bold text-[11px] tracking-wider uppercase transition-all shadow-xs cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Hero Banner: Team & Robot Overview ────────────────────────── */}
      <div className="bg-gradient-to-r from-[#002244] via-[#00356a] to-[#0a4d8c] text-white py-8 px-4 sm:px-8 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#fdba74] font-mono text-[11px] font-bold tracking-[2px] uppercase mb-1">
              <span>CATEGORIA OFICIAL</span>
              <span>•</span>
              <span>{team.category}</span>
            </div>
            <h1 className="text-[32px] sm:text-[40px] font-['Space_Grotesk'] font-black tracking-tight leading-none">
              {team.name}
            </h1>
            <p className="text-blue-200 text-[14px] mt-2 max-w-xl leading-relaxed">
              Robô Oficial de Combate: <strong className="text-white">{team.robotName}</strong> ({team.robotWeight}). Homologado para a arena Dohyo Oficial com partida de 02:00.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <a
              href="/partidas?proj=1"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-[#00f2ff] hover:bg-[#38bdf8] text-[#00356a] font-['Space_Grotesk'] font-bold text-[12px] tracking-wider uppercase px-4 py-2.5 rounded-[6px] shadow-lg transition-all active:scale-95"
            >
              <span>📺</span>
              <span>VER TELÃO AO VIVO</span>
            </a>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + "/partidas?proj=1");
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-['Space_Grotesk'] font-bold text-[12px] px-3.5 py-2.5 rounded-[6px] transition-colors border border-white/20"
            >
              <span>{copiedLink ? "✓ Link Copiado" : "🔗 Compartilhar"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Tabs Navigation Bar ───────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e2e8f0] px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex gap-2 sm:gap-6 overflow-x-auto">
          {[
            { key: "equipe", label: "Meu Robô & Equipe", icon: "🛡️" },
            { key: "partidas", label: "Minhas Lutas na Arena", icon: "⚔️" },
            { key: "regras", label: "Regulamento 2026", icon: "📜" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-3.5 px-2 border-b-2 font-['Space_Grotesk'] font-bold text-[13px] tracking-wider uppercase transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-[#00356a] text-[#00356a]"
                    : "border-transparent text-[#64748b] hover:text-[#051d30]"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Main Content Container ────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8">
        {/* ABA 1: MEU ROBÔ & EQUIPE */}
        {activeTab === "equipe" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1 & 2: Passaporte Técnico do Robô */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-white rounded-[12px] border border-[#e2e8f0] p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9]">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#00356a] uppercase tracking-wider">
                      PASSAPORTE TÉCNICO
                    </span>
                    <h2 className="text-[22px] font-['Space_Grotesk'] font-bold text-[#051d30]">
                      {team.robotName}
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    STATUS: APROVADO
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                  <div className="bg-[#f8fafc] p-4 rounded-[8px] border border-[#e2e8f0]">
                    <span className="text-[11px] font-mono text-[#64748b] uppercase tracking-wider">PESO HOMOLOGADO</span>
                    <div className="text-[18px] font-bold text-[#051d30] font-mono mt-0.5">{team.robotWeight}</div>
                  </div>

                  <div className="bg-[#f8fafc] p-4 rounded-[8px] border border-[#e2e8f0]">
                    <span className="text-[11px] font-mono text-[#64748b] uppercase tracking-wider">DIMENSÕES DE COMBATE</span>
                    <div className="text-[18px] font-bold text-[#051d30] font-mono mt-0.5">{team.robotDimensions}</div>
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-[8px] bg-[#eff6ff] border border-[#bfdbfe] flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div className="text-[13px] text-[#1e40af] leading-relaxed">
                    <strong>Dica para o combate:</strong> Certifique-se de que a arena esteja limpa antes do posicionamento (Dohyo-iri) e mantenha baterias reservas sempre carregadas nos boxes.
                  </div>
                </div>
              </div>

              {/* Roster de Integrantes */}
              <div className="bg-white rounded-[12px] border border-[#e2e8f0] p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9]">
                  <h3 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                    Integrantes da Equipe ({team.members.length})
                  </h3>
                  <span className="text-[12px] text-[#64748b]">Documentação 100% validada</span>
                </div>

                <div className="divide-y divide-[#f1f5f9] mt-2">
                  {team.members.map((m) => (
                    <div key={m.id} className="py-3 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[14px]"
                          style={{ backgroundColor: m.avatarColor }}
                        >
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-['Space_Grotesk'] font-bold text-[15px] text-[#051d30]">
                            {m.name}
                          </div>
                          <div className="text-[12px] text-[#64748b]">{m.role}</div>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        <span>✓</span>
                        <span>DOCUMENTOS APROVADOS</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna 3: Código de Acesso do Capitão & Integridade da Equipe */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-[12px] border border-[#c2d9f5] p-6 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔑</span>
                    <h3 className="font-['Space_Grotesk'] font-bold text-[16px] text-[#00356a]">
                      Código do Capitão
                    </h3>
                  </div>
                  <span className="bg-[#edf4ff] text-[#00356a] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border border-[#c2d9f5] uppercase tracking-wider">
                    Código Oficial
                  </span>
                </div>
                <p className="text-[12px] text-[#64748b] leading-relaxed mt-3 mb-4">
                  Compartilhe este código <strong>exclusivamente</strong> com os alunos autorizados a ingressar na sua equipe.
                </p>
                <div className="bg-[#f8fafc] border border-[#c2d9f5] rounded-[8px] p-3.5 flex items-center justify-between gap-3">
                  <span className="font-mono font-black text-[18px] text-[#00356a] tracking-wider select-all">
                    {team.captainCode || team.code || "CAP-CYBE-3429"}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(team.captainCode || team.code || "CAP-CYBE-3429");
                      setCopiedCaptainCode(true);
                      setTimeout(() => setCopiedCaptainCode(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-[6px] bg-[#00356a] hover:bg-[#00468a] text-white font-['Space_Grotesk'] font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer shrink-0"
                  >
                    {copiedCaptainCode ? "✓ Copiado!" : "Copiar"}
                  </button>
                </div>
                <div className="mt-4 flex items-start gap-2 text-[11px] text-[#8c4f00] bg-[#fffbeb] p-3 rounded-[6px] border border-[#fef3c7] leading-relaxed">
                  <span className="shrink-0 text-sm">🔒</span>
                  <span>A vinculação à equipe é <strong>definitiva</strong>. Não é permitida a troca ou saída após a confirmação.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: MINHAS LUTAS NA ARENA */}
        {activeTab === "partidas" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[22px] font-['Space_Grotesk'] font-bold text-[#051d30]">
                  Chave de Confrontos da Equipe
                </h2>
                <p className="text-[#64748b] text-[13px]">
                  Acompanhe os horários, oponentes e resultados oficiais homologados pela arbitragem.
                </p>
              </div>
              <a
                href="/partidas?proj=1"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-[#00356a] hover:bg-[#00468a] text-white px-4 py-2 rounded-[6px] font-['Space_Grotesk'] font-bold text-[12px] tracking-wider uppercase transition-all shadow-sm"
              >
                <span>📺</span>
                <span>Abrir Telão Oficial</span>
              </a>
            </div>

            {loading ? (
              <div className="py-16 text-center text-[#64748b] font-mono">
                Carregando confrontos em tempo real...
              </div>
            ) : myMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myMatches.map((m) => {
                  const isTeam1 = m.team1.name.toUpperCase() === team.name.toUpperCase();
                  const opponent = isTeam1 ? m.team2 : m.team1;
                  return (
                    <div key={m.id} className="bg-white rounded-[12px] border border-[#e2e8f0] p-6 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#64748b] pb-2 border-b border-[#f1f5f9]">
                          <span>{m.code} • {m.phase}</span>
                          <span className={m.status === "EM ANDAMENTO" ? "text-[#0284c7] animate-pulse" : ""}>
                            {m.status}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <span className="text-[10px] font-mono font-bold text-[#b91c1c] uppercase">Meu Time</span>
                            <div className="font-['Space_Grotesk'] font-bold text-[17px] text-[#051d30]">
                              {team.name}
                            </div>
                            <div className="text-[12px] text-[#64748b]">{team.robotName}</div>
                          </div>

                          <div className="font-mono font-black text-[20px] text-[#64748b]">VS</div>

                          <div className="flex-1 text-right">
                            <span className="text-[10px] font-mono font-bold text-[#0284c7] uppercase">Adversário</span>
                            <div className="font-['Space_Grotesk'] font-bold text-[17px] text-[#051d30]">
                              {opponent.name}
                            </div>
                            <div className="text-[12px] text-[#64748b]">{opponent.robot || "Robô de Combate"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[12px]">
                        <span className="text-[#64748b]">Tempo de combate: <strong>02:00</strong></span>
                        <span className="font-mono text-[11px] font-bold text-[#00356a]">Dohyo Oficial 01</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-[12px] border border-[#e2e8f0] p-8 text-center">
                <span className="text-4xl mb-2 block">⚔️</span>
                <h3 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                  Chaveamento em Andamento
                </h3>
                <p className="text-[#64748b] text-[13px] max-w-md mx-auto mt-1">
                  Seu confronto está sendo organizado na tabela de chaveamento oficial. Consulte a visão geral completa no telão da competição.
                </p>
                <div className="mt-5">
                  <a
                    href="/partidas?proj=1"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-[#00356a] text-white px-5 py-2.5 rounded-[6px] font-['Space_Grotesk'] font-bold text-[12px] uppercase shadow-sm"
                  >
                    Ver Chave Geral no Telão ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ABA 4: REGULAMENTO & REGRAS */}
        {activeTab === "regras" && (
          <div className="bg-white rounded-[16px] border border-[#e2e8f0] p-6 sm:p-8 shadow-sm max-w-4xl mx-auto flex flex-col gap-6">
            <div className="border-b border-[#f1f5f9] pb-4">
              <span className="text-[11px] font-mono font-bold text-[#00356a] uppercase tracking-wider">
                NORMAS DA MODALIDADE
              </span>
              <h2 className="text-[26px] font-['Space_Grotesk'] font-bold text-[#051d30]">
                Regulamento Oficial do Robot Sumô 3kg (2026)
              </h2>
            </div>

            <div className="space-y-4 text-[14px] text-[#475569] leading-relaxed">
              <div className="bg-[#f8fafc] p-4 rounded-[8px] border border-[#e2e8f0]">
                <h4 className="font-bold text-[#051d30] mb-1">1. Tempo de Combate (02:00)</h4>
                <p>
                  Cada round possui duração máxima de 2 minutos (120 segundos) contados no cronômetro oficial da arena. O vencedor do combate é a equipe que conquistar 2 rounds (melhor de 3).
                </p>
              </div>

              <div className="bg-[#f8fafc] p-4 rounded-[8px] border border-[#e2e8f0]">
                <h4 className="font-bold text-[#051d30] mb-1">2. Contagem de Imobilização (15s)</h4>
                <p>
                  Caso os dois robôs entrem em travamento mútuo ou fiquem inoperantes sem tocar o anel externo, o árbitro iniciará uma contagem de 15 segundos. Se nenhum se mover, o round é declarado empate (Yusei).
                </p>
              </div>

              <div className="bg-[#f8fafc] p-4 rounded-[8px] border border-[#e2e8f0]">
                <h4 className="font-bold text-[#051d30] mb-1">3. Queda do Dohyo (Shini-tai)</h4>
                <p>
                  O primeiro robô a tocar qualquer parte do corpo ou lâmina na superfície fora da borda branca externa do tatame é declarado perdedor daquele round.
                </p>
              </div>

              <div className="bg-[#f8fafc] p-4 rounded-[8px] border border-[#e2e8f0]">
                <h4 className="font-bold text-[#051d30] mb-1">4. Decisão Soberana</h4>
                <p>
                  As decisões da equipe de arbitragem do SENAC registradas no console do árbitro são soberanas e sincronizadas diretamente no banco de dados MongoDB Atlas da competição.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
