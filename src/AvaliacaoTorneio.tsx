import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import { BracketMatch, SumoTournamentState } from "./ProjectionReceiver";
import { API_BASE_URL } from "./config/api";

// ─── Interfaces & Types ───────────────────────────────────────────────────────

export interface TeamMatch {
  id: string;
  name: string;
  code: string;
  robot: string;
  colorCorner: "red" | "blue";
  seed?: string;
  score?: number;
  status?: string;
}

export interface MatchData {
  id: string;
  code: string; // e.g. MCH-001
  phase: "OITAVAS" | "QUARTAS" | "SEMIFINAL" | "FINAL";
  position?: number;
  status: "PENDENTE" | "EM ANDAMENTO" | "CONCLUÍDO";
  teamA: TeamMatch;
  teamB: TeamMatch;
  round1Winner?: "teamA" | "teamB" | "draw" | null;
  round2Winner?: "teamA" | "teamB" | "draw" | null;
  round3Winner?: "teamA" | "teamB" | "draw" | null;
  round1Duration?: number | null;
  round2Duration?: number | null;
  round3Duration?: number | null;
  currentRound?: number;
  winnerId?: string | null;
  released?: boolean;
}

// ─── Main AvaliacaoTorneio Component ──────────────────────────────────────────

export default function AvaliacaoTorneio({
  onNavigate,
  onLogout,
}: {
  onNavigate?: (key: string) => void; //Resolver questão de undefined - diferença entre obrigatório e opcional
  onLogout?: () => void;
}) {
  // Step state: 1 = Arena Selection Hub, 2 = Gestão de Chaves e Sorteio, 3 = Robot Sumô Console
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Backend / MongoDB Data
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDENTE" | "EM ANDAMENTO" | "CONCLUÍDO">("ALL");
  const [activePhaseTab, setActivePhaseTab] = useState<"OITAVAS" | "QUARTAS" | "SEMIFINAL" | "FINAL">("OITAVAS");
  const [loadingTeams, setLoadingTeams] = useState<boolean>(true);

  // Step 3 (Evaluation Console) State
  const [matchTimer, setMatchTimer] = useState<number>(() => {
    try {
      const cached = localStorage.getItem("sumo_timer_sync");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (typeof parsed.timer === "number") return parsed.timer;
      }
    } catch {}
    return 120; // 2:00 in seconds
  });
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem("sumo_timer_sync");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (typeof parsed.isRunning === "boolean") return parsed.isRunning;
      }
    } catch {}
    return false;
  });
  const [imobilizacaoTimer, setImobilizacaoTimer] = useState<number | null>(null);
  const [isImobilizacaoRunning, setIsImobilizacaoRunning] = useState<boolean>(false);

  // Rounds state for selected match
  const [round1Winner, setRound1Winner] = useState<"teamA" | "teamB" | "draw" | null>(null);
  const [round2Winner, setRound2Winner] = useState<"teamA" | "teamB" | "draw" | null>(null);
  const [round3Winner, setRound3Winner] = useState<"teamA" | "teamB" | "draw" | null>(null);
  const [round1Duration, setRound1Duration] = useState<number | null>(null);
  const [round2Duration, setRound2Duration] = useState<number | null>(null);
  const [round3Duration, setRound3Duration] = useState<number | null>(null);
  const [currentRoundNumber, setCurrentRoundNumber] = useState<1 | 2 | 3>(1);
  const [judgeObservations, setJudgeObservations] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Broadcast Timer to Telão and Partidas
  const broadcastTimer = (newTimer: number, running: boolean) => {
    try {
      localStorage.setItem(
        "sumo_timer_sync",
        JSON.stringify({ timer: newTimer, isRunning: running, timestamp: Date.now() })
      );
      const ch = new BroadcastChannel("robotic_proj");
      ch.postMessage({
        type: "TIMER_SYNC",
        timer: newTimer,
        isRunning: running,
        matchCode: selectedMatch?.code,
        round: currentRoundNumber,
      });
      setTimeout(() => ch.close(), 100);
    } catch (e) {}
  };

  // 1. Fetch Real Matches from MongoDB Atlas API
  const fetchMatchesFromApi = async () => {
    setLoadingTeams(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/partidas`);
      if (res.ok) {
        const rawList = await res.json();
        if (Array.isArray(rawList) && rawList.length > 0) {
          const mapped: MatchData[] = rawList.map((m: any) => ({
            id: m._id || m.code,
            code: m.code,
            phase: m.phase,
            position: m.position,
            status: m.status,
            released: !!m.released,
            winnerId: m.winnerId,
            teamA: {
              id: m.team1?.id || m.team1Id || `team1-${m.code}`,
              name: m.team1?.name || "AGUARDANDO...",
              code: m.team1?.code || `#TM-${m.code}-1`,
              robot: m.team1?.robot || "Robô de Combate",
              colorCorner: "red",
              seed: m.team1?.seed || "A1",
              score: m.team1?.score ?? 0,
              status: "APROVADO",
            },
            teamB: {
              id: m.team2?.id || m.team2Id || `team2-${m.code}`,
              name: m.team2?.name || "AGUARDANDO...",
              code: m.team2?.code || `#TM-${m.code}-2`,
              robot: m.team2?.robot || "Robô de Combate",
              colorCorner: "blue",
              seed: m.team2?.seed || "B1",
              score: m.team2?.score ?? 0,
              status: "APROVADO",
            },
            round1Winner: m.rounds?.[0]?.winnerId === m.team1?.id ? "teamA" : m.rounds?.[0]?.winnerId === m.team2?.id ? "teamB" : m.rounds?.[0]?.winnerId === "draw" ? "draw" : null,
            round2Winner: m.rounds?.[1]?.winnerId === m.team1?.id ? "teamA" : m.rounds?.[1]?.winnerId === m.team2?.id ? "teamB" : m.rounds?.[1]?.winnerId === "draw" ? "draw" : null,
            round3Winner: m.rounds?.[2]?.winnerId === m.team1?.id ? "teamA" : m.rounds?.[2]?.winnerId === m.team2?.id ? "teamB" : m.rounds?.[2]?.winnerId === "draw" ? "draw" : null,
            round1Duration: m.round1Duration ?? (m.rounds?.[0]?.duration || null),
            round2Duration: m.round2Duration ?? (m.rounds?.[1]?.duration || null),
            round3Duration: m.round3Duration ?? (m.rounds?.[2]?.duration || null),
            currentRound: 1,
          }));

          setMatches(mapped);

          // Select default match if none selected
          if (!selectedMatch) {
            const m3 = mapped.find((x) => x.code === "MCH-003");
            setSelectedMatch(m3 || mapped[0]);
          } else {
            // Keep selected match synced with fresh data
            const updated = mapped.find((x) => x.code === selectedMatch.code || x.id === selectedMatch.id);
            if (updated) setSelectedMatch(updated);
          }
        }
      }
    } catch (err) {
      console.error("Erro ao carregar partidas da API:", err);
    } finally {
      setLoadingTeams(false);
    }
  };

  useEffect(() => {
    fetchMatchesFromApi();

    const ch = new BroadcastChannel("robotic_proj");
    ch.onmessage = (e: MessageEvent) => {
      if (e.data) {
        if (e.data.refresh || e.data.matches) {
          fetchMatchesFromApi();
        }
        if (e.data.type === "TIMER_SYNC" || e.data.timer !== undefined) {
          if (typeof e.data.timer === "number") setMatchTimer(e.data.timer);
          if (typeof e.data.isRunning === "boolean") setIsTimerRunning(e.data.isRunning);
        }
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "sumo_projection_state") {
        fetchMatchesFromApi();
      }
      if (e.key === "sumo_timer_sync" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (typeof parsed.timer === "number") setMatchTimer(parsed.timer);
          if (typeof parsed.isRunning === "boolean") setIsTimerRunning(parsed.isRunning);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      ch.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Broadcast helper for match state
  const broadcastSync = () => {
    try {
      const ch = new BroadcastChannel("robotic_proj");
      ch.postMessage({ matches, refresh: true });
      setTimeout(() => ch.close(), 100);
    } catch (e) {}
  };

  // Combat Timer 2:00 interval with real-time broadcasting
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && matchTimer > 0) {
      interval = setInterval(() => {
        setMatchTimer((prev) => {
          const next = Math.max(0, prev - 1);
          broadcastTimer(next, true);
          return next;
        });
      }, 1000);
    } else if (matchTimer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      broadcastTimer(0, false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, matchTimer]);

  // 15-second Imobilização Timer
  useEffect(() => {
    let interval: any = null;
    if (isImobilizacaoRunning && imobilizacaoTimer !== null && imobilizacaoTimer > 0) {
      interval = setInterval(() => {
        setImobilizacaoTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (imobilizacaoTimer === 0 && isImobilizacaoRunning) {
      setIsImobilizacaoRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isImobilizacaoRunning, imobilizacaoTimer]);

  // Format MM:SS
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  // Start 15s immobilization countdown
  const handleStartImobilizacao = () => {
    setImobilizacaoTimer(15);
    setIsImobilizacaoRunning(true);
  };

  // 🔀 SORTEIO AUTOMÁTICO: Resets and shuffles in MongoDB Atlas!
  const handleSorteioAutomatico = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/partidas/reset-sorteio`, { method: "POST" });
      if (res.ok) {
        await fetchMatchesFromApi();
        broadcastSync();
        setToastMessage("Sorteio automático concluído com 100% das 16 equipes aprovadas no MongoDB Atlas!");
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (e: any) {
      setToastMessage("Erro ao executar sorteio no servidor.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Select match and enter evaluation console (Step 3)
  const handleOpenEvaluation = (match: MatchData) => {
    setSelectedMatch(match);
    setRound1Winner(match.round1Winner || null);
    setRound2Winner(match.round2Winner || null);
    setRound3Winner(match.round3Winner || null);
    setRound1Duration(match.round1Duration || null);
    setRound2Duration(match.round2Duration || null);
    setRound3Duration(match.round3Duration || null);
    if (!match.round1Winner) {
      setCurrentRoundNumber(1);
    } else if (!match.round2Winner) {
      setCurrentRoundNumber(2);
    } else {
      setCurrentRoundNumber(3);
    }
    setMatchTimer(120);
    setIsTimerRunning(false);
    broadcastTimer(120, false);
    setImobilizacaoTimer(null);
    setIsImobilizacaoRunning(false);
    setStep(3);
  };

  // Concluir Round 1: Salva o tempo do round 1 e ZERA o cronômetro para o Round 2
  const handleSelectRound1Winner = (winner: "teamA" | "teamB" | "draw") => {
    setRound1Winner(winner);
    // Tempo decorrido no round 1 (máximo 120s)
    const elapsed = Math.max(1, 120 - matchTimer);
    setRound1Duration(elapsed);
    // Para e ZERA o cronômetro para 02:00 (120s) para o Round 2
    setIsTimerRunning(false);
    setMatchTimer(120);
    broadcastTimer(120, false);
    setCurrentRoundNumber(2);
    setToastMessage(`Round 1 gravado (${formatTimer(elapsed)})! Cronômetro zerado para 02:00 (Round 2).`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Concluir Round 2: Salva o tempo do round 2 e ZERA o cronômetro para o Round 3
  const handleSelectRound2Winner = (winner: "teamA" | "teamB" | "draw") => {
    setRound2Winner(winner);
    const elapsed = Math.max(1, 120 - matchTimer);
    setRound2Duration(elapsed);
    // Para e ZERA o cronômetro para 02:00 (120s) para o Round 3 (desempate)
    setIsTimerRunning(false);
    setMatchTimer(120);
    broadcastTimer(120, false);
    setCurrentRoundNumber(3);
    setToastMessage(`Round 2 gravado (${formatTimer(elapsed)})! Cronômetro zerado para 02:00 (Round 3).`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Concluir Round 3: Salva o tempo do round 3
  const handleSelectRound3Winner = (winner: "teamA" | "teamB" | "draw") => {
    setRound3Winner(winner);
    const elapsed = Math.max(1, 120 - matchTimer);
    setRound3Duration(elapsed);
    setIsTimerRunning(false);
    broadcastTimer(matchTimer, false);
    setToastMessage(`Round 3 gravado (${formatTimer(elapsed)})! Decisão pronta para confirmação.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Confirm match result (Decisão Soberana) & save to MongoDB Atlas!
  const handleConfirmResult = async () => {
    if (!selectedMatch) return;
    setIsSaving(true);
    try {
      let teamAWins = 0;
      let teamBWins = 0;
      if (round1Winner === "teamA") teamAWins++;
      if (round1Winner === "teamB") teamBWins++;
      if (round2Winner === "teamA") teamAWins++;
      if (round2Winner === "teamB") teamBWins++;
      if (round3Winner === "teamA") teamAWins++;
      if (round3Winner === "teamB") teamBWins++;

      const winningTeam = teamBWins > teamAWins ? "teamB" : "teamA";
      const winnerId = winningTeam === "teamB" ? selectedMatch.teamB.id : selectedMatch.teamA.id;
      const winnerName = winningTeam === "teamB" ? selectedMatch.teamB.name : selectedMatch.teamA.name;

      // Real API POST to MongoDB com tempos de cada round!
      const res = await fetch(`${API_BASE_URL}/api/v1/Rouds/partidas/${selectedMatch.code || selectedMatch.id}/rounds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winnerId,
          round1Winner,
          round2Winner,
          round3Winner,
          round1Duration: round1Duration || 60,
          round2Duration: round2Duration || 60,
          round3Duration: round3Duration || null,
          duration: (round1Duration || 60) + (round2Duration || 60) + (round3Duration || 0),
          team1ActiveDuration: 60,
          team2ActiveDuration: 60,
          isExtraRound: !!round3Winner,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro na gravação do round no servidor.");
      }

      await fetchMatchesFromApi();
      broadcastSync();

      setToastMessage(`Resultado confirmado! Vencedor da partida: ${winnerName} (promovido na chave).`);
      setTimeout(() => {
        setToastMessage(null);
        setStep(2);
      }, 2500);
    } catch (e: any) {
      alert("Erro ao confirmar resultado: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered matches for Step 2
  const matchesInActivePhase = matches.filter((m) => m.phase === activePhaseTab);
  const filteredMatches = matchesInActivePhase.filter((m) => {
    if (activeFilter === "ALL") return true;
    return m.status === activeFilter;
  });

  return (
    <div className="fixed inset-0 z-[800] overflow-y-auto bg-[#f8fafc] text-[#051d30] flex">
      {/* Admin Sidebar */}
      <AdminSidebar active="rules" onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content Area */}
      <div className="flex-1 pl-0 md:pl-[256px] flex flex-col min-h-screen">
        {/* Top Header Bar / Stepper */}
        <header className="min-h-[64px] border-b border-[#e2e8f0] bg-white flex items-center justify-between px-4 sm:px-8 pl-16 md:pl-8 py-2 shrink-0 flex-wrap gap-2">
          {/* Stepper Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[12px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                step === 1
                  ? "bg-[#00356a] text-white"
                  : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#051d30]"
              }`}
            >
              <span>1. Arena Hub</span>
            </button>

            <span className="text-[#cbd5e1] text-xs">›</span>

            <button
              onClick={() => setStep(2)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[12px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                step === 2
                  ? "bg-[#00356a] text-white"
                  : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#051d30]"
              }`}
            >
              <span>2. Chaves & Confrontos</span>
            </button>

            <span className="text-[#cbd5e1] text-xs">›</span>

            <button
              onClick={() => setStep(3)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[12px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                step === 3
                  ? "bg-[#00356a] text-white"
                  : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#051d30]"
              }`}
            >
              <span>3. Robot Sumô (Avaliação)</span>
            </button>
          </div>

          {/* Right Status & Icons */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>16 EQUIPES NO MONGODB ATLAS</span>
            </div>
          </div>
        </header>

        {/* ─── Notification Toast ────────────────────────────────────────── */}
        {toastMessage && (
          <div className="fixed top-20 right-8 z-[999] bg-[#051d30] text-white px-6 py-4 rounded-[6px] shadow-2xl border-l-4 border-[#00e5ff] flex items-center gap-3 animate-bounce">
            <span className="text-xl">🏆</span>
            <div>
              <div className="font-bold text-[14px]">{toastMessage}</div>
              <div className="text-[12px] text-[#94a3b8]">Sincronizado em tempo real com MongoDB Atlas</div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SCREEN 1: Arena Selection Hub
        ══════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="p-8 max-w-7xl w-full mx-auto animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-[#0f172a] text-[#f8fafc] px-3 py-1 rounded-[4px] text-[11px] font-mono tracking-[1.5px] uppercase mb-4">
              <span>TOURNAMENT ACTIVE</span>
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            </div>

            <h1 className="text-[40px] font-['Space_Grotesk'] font-bold text-[#051d30] leading-tight tracking-[-1px]">
              Arena Selection Hub
            </h1>

            <p className="text-[#64748b] text-[15px] mt-2 max-w-3xl leading-relaxed">
              Selecione a arena de combate de Sumô para inicializar o console de avaliação de confrontos oficiais.
            </p>

            <div className="mt-8">
              <div className="flex items-center gap-2 text-[15px] font-bold text-[#051d30] uppercase tracking-wider mb-4">
                <span>🎮</span>
                <span>Seleção de Arenas</span>
              </div>

              <div className="bg-[#f0f5ff] rounded-[16px] p-6 border border-[#e2e8f0]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    onClick={() => setStep(2)}
                    className="bg-white rounded-[12px] p-6 border-2 border-[#3b82f6] shadow-md hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-[10px] bg-[#eff6ff] flex items-center justify-center text-[24px] mb-4 text-[#2563eb]">
                      🤖
                    </div>

                    <div className="text-[20px] font-['Space_Grotesk'] font-bold text-[#051d30] group-hover:text-[#2563eb] transition-colors">
                      Sumô 3kg (Oficial)
                    </div>

                    <p className="text-[13px] text-[#64748b] mt-1 line-clamp-2">
                      Combate técnico de força e estratégia de sensores em Dohyo oficial.
                    </p>

                    <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-[#051d30] tracking-wider">
                        EQUIPES: 16
                      </span>
                      <span className="text-[12px] font-bold text-[#2563eb] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Acessar Chaves →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SCREEN 2: Gestão de Chaves e Sorteio (media_1788746775922.png)
        ══════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="p-8 max-w-7xl w-full mx-auto animate-fadeIn">
            {/* Header with Title & Sorteio Automático Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-[36px] font-['Space_Grotesk'] font-bold text-[#051d30] leading-tight">
                  Gestão de Chaves e Sorteio
                </h1>
                <p className="text-[#64748b] text-[14px] mt-1">
                  Organize os confrontos e gerencie o fluxo das competições de forma automatizada.
                </p>
              </div>

              {/* Cyan Action Button: Sorteio Automático */}
              <button
                onClick={handleSorteioAutomatico}
                className="bg-[#00e5ff] hover:bg-[#00f2ff] text-[#00356a] px-6 py-3 rounded-[4px] font-['Space_Grotesk'] font-bold text-[12px] tracking-[1.2px] uppercase shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 self-start md:self-auto cursor-pointer"
              >
                <span>🔀</span>
                <span>SORTEIO AUTOMÁTICO</span>
              </button>
            </div>

            {/* Filter Bar (White container) */}
            <div className="mt-6 bg-white rounded-[8px] border border-[#e2e8f0] px-5 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              {/* Phase Tabs */}
              <div className="flex items-center gap-2">
                {[
                  { key: "OITAVAS", label: "OITAVAS DE FINAL (8)" },
                  { key: "QUARTAS", label: "QUARTAS (4)" },
                  { key: "SEMIFINAL", label: "SEMIFINAIS (2)" },
                  { key: "FINAL", label: "GRANDE FINAL (1)" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActivePhaseTab(tab.key as any)}
                    className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                      activePhaseTab === tab.key
                        ? "bg-[#00356a] text-white shadow-sm"
                        : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#051d30]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveFilter("PENDENTE")}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all cursor-pointer ${
                    activeFilter === "PENDENTE"
                      ? "border border-[#10b981] text-[#059669] bg-[#ecfdf5]"
                      : "text-[#64748b] hover:text-[#051d30]"
                  }`}
                >
                  PENDENTE
                </button>
                <button
                  onClick={() => setActiveFilter("EM ANDAMENTO")}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all cursor-pointer ${
                    activeFilter === "EM ANDAMENTO"
                      ? "border border-[#00e5ff] text-[#00356a] bg-[#e6fffa]"
                      : "text-[#64748b] hover:text-[#051d30]"
                  }`}
                >
                  EM ANDAMENTO
                </button>
                <button
                  onClick={() => setActiveFilter("CONCLUÍDO")}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all cursor-pointer ${
                    activeFilter === "CONCLUÍDO"
                      ? "border border-[#64748b] text-[#334155] bg-[#f1f5f9]"
                      : "text-[#64748b] hover:text-[#051d30]"
                  }`}
                >
                  CONCLUÍDO
                </button>
                <button
                  onClick={() => setActiveFilter("ALL")}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all cursor-pointer ${
                    activeFilter === "ALL"
                      ? "border border-[#3b82f6] text-[#1d4ed8] bg-[#eff6ff]"
                      : "text-[#64748b] hover:text-[#051d30]"
                  }`}
                >
                  TODAS
                </button>
              </div>
            </div>

            {/* Section: Sumô - Chave Oficial */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[16px] font-bold text-[#051d30]">
                  <span>🦾</span>
                  <span>
                    Sumô -{" "}
                    {activePhaseTab === "OITAVAS"
                      ? "Oitavas de Final"
                      : activePhaseTab === "QUARTAS"
                      ? "Quartas de Final"
                      : activePhaseTab === "SEMIFINAL"
                      ? "Semifinais"
                      : "Grande Final"}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#64748b] tracking-wider uppercase bg-white border border-[#e2e8f0] px-3 py-1 rounded-full">
                  {filteredMatches.length} CONFRONTOS
                </span>
              </div>

              {/* Match Cards Grid */}
              {loadingTeams ? (
                <div className="flex flex-col items-center justify-center py-16 text-[#64748b]">
                  <div className="w-8 h-8 border-2 border-[#00356a] border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="font-bold text-[14px]">Carregando confrontos reais do MongoDB Atlas...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredMatches.map((m) => {
                    const isInProgress = m.status === "EM ANDAMENTO";
                    const isDone = m.status === "CONCLUÍDO";

                    return (
                      <div
                        key={m.id || m.code}
                        className={`bg-white rounded-[12px] p-6 transition-all relative flex flex-col justify-between ${
                          isInProgress
                            ? "border-2 border-[#00f2ff] shadow-[0_4px_20px_rgba(0,242,255,0.15)]"
                            : isDone
                            ? "border-2 border-emerald-300 shadow-sm"
                            : "border border-[#e2e8f0] shadow-sm hover:border-[#94a3b8]"
                        }`}
                      >
                        {/* Match Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9]">
                          <span
                            className={`font-mono text-[13px] font-bold ${
                              isInProgress ? "text-[#0891b2]" : "text-[#64748b]"
                            }`}
                          >
                            {m.code}
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                              isInProgress
                                ? "bg-[#e6fffa] text-[#0d9488]"
                                : isDone
                                ? "bg-[#dcfce7] text-[#15803d]"
                                : "bg-[#f1f5f9] text-[#475569]"
                            }`}
                          >
                            {isInProgress && <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-ping" />}
                            {m.status}
                          </span>
                        </div>

                        {/* Match Teams Confrontation Layout */}
                        <div className="py-6 flex flex-col items-center gap-3">
                          {/* Team A */}
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-9 h-9 rounded-full bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center font-mono text-[11px] font-bold text-[#334155] shrink-0">
                              {m.teamA.seed || "A1"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-['Space_Grotesk'] font-bold text-[15px] text-[#051d30] truncate">
                                {m.teamA.name}
                              </div>
                              <div className="text-[12px] font-mono text-[#94a3b8]">
                                {m.teamA.code}
                              </div>
                            </div>
                            {isDone && (
                              <span className="font-mono font-bold text-[16px] text-[#051d30]">
                                {m.teamA.score}
                              </span>
                            )}
                          </div>

                          {/* VS Pill */}
                          <div className="flex items-center justify-center my-1">
                            <span className="text-[11px] font-mono font-bold text-[#94a3b8] uppercase tracking-widest bg-[#f8fafc] px-3 py-0.5 rounded-full border border-[#e2e8f0]">
                              vs
                            </span>
                          </div>

                          {/* Team B */}
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-9 h-9 rounded-full bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center font-mono text-[11px] font-bold text-[#334155] shrink-0">
                              {m.teamB.seed || "B4"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-['Space_Grotesk'] font-bold text-[15px] text-[#051d30] truncate">
                                {m.teamB.name}
                              </div>
                              <div className="text-[12px] font-mono text-[#94a3b8]">
                                {m.teamB.code}
                              </div>
                            </div>
                            {isDone && (
                              <span className="font-mono font-bold text-[16px] text-[#051d30]">
                                {m.teamB.score}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom Button matching screenshot */}
                        <div className="pt-4 border-t border-[#f1f5f9]">
                          {isInProgress ? (
                            <button
                              onClick={() => handleOpenEvaluation(m)}
                              className="w-full bg-[#005f73] hover:bg-[#0a6677] text-white py-2.5 rounded-[4px] font-['Space_Grotesk'] font-bold text-[11px] tracking-[1.2px] uppercase transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                            >
                              <span>👁</span>
                              <span>ACOMPANHAR AVALIAÇÃO</span>
                            </button>
                          ) : isDone ? (
                            <button
                              onClick={() => handleOpenEvaluation(m)}
                              className="w-full bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#065f46] border border-emerald-300 py-2.5 rounded-[4px] font-['Space_Grotesk'] font-bold text-[11px] tracking-[1.2px] uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <span>✓</span>
                              <span>REAVALIAR CONFRONTO</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenEvaluation(m)}
                              className="w-full border border-[#0891b2] text-[#0891b2] hover:bg-[#ecfeff] py-2.5 rounded-[4px] font-['Space_Grotesk'] font-bold text-[11px] tracking-[1.2px] uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <span>▶</span>
                              <span>INICIAR AVALIAÇÃO</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Info note */}
              <div className="mt-8 flex items-center justify-center gap-2 text-[#64748b] text-[13px]">
                <span>ℹ</span>
                <span>Mais chaves serão geradas conforme a progressão do torneio no MongoDB Atlas.</span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SCREEN 3: Robot Sumô - Evaluation Console (media_1788746800673.png)
        ══════════════════════════════════════════════════════════════════ */}
        {step === 3 && selectedMatch && (
          <div className="p-8 max-w-7xl w-full mx-auto animate-fadeIn">
            {/* Top Category Tag */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#b45309] uppercase tracking-[1.5px]">
                CATEGORY: HEAVYWEIGHT • SUMÔ ({selectedMatch.code} - {selectedMatch.phase})
              </span>
              <button
                onClick={() => setStep(2)}
                className="text-[12px] font-bold text-[#00356a] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>←</span>
                <span>Voltar às Chaves</span>
              </button>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-[42px] font-['Space_Grotesk'] font-bold text-[#051d30] leading-none mt-2 tracking-[-1.5px]">
              Robot Sumô
            </h1>
            <p className="text-[#64748b] text-[14px] mt-2 max-w-2xl">
              Console oficial de arbitragem conectado ao MongoDB Atlas. Registre os rounds, cronometre o combate e confirme a decisão soberana.
            </p>

            {/* ─── Top 3 Summary Cards Row (Red Corner | Timer | Blue Corner) ─ */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 1: Canto Vermelho */}
              <div className="bg-[#fff5f5] rounded-[16px] p-6 border border-[#fee2e2] flex flex-col justify-between shadow-sm">
                <div>
                  <span className="inline-block bg-[#ffe4e6] text-[#e11d48] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                    Canto Vermelho
                  </span>
                  <div className="text-[26px] font-['Space_Grotesk'] font-bold text-[#051d30] mt-4">
                    {selectedMatch.teamA.name}
                  </div>
                  <div className="text-[#64748b] text-[13px] mt-1">
                    {selectedMatch.teamA.robot}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#fecdd3] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#991b1b] uppercase tracking-wider">
                    Semente: {selectedMatch.teamA.seed || "A1"}
                  </span>
                  <span className="text-[11px] font-bold text-[#e11d48]">
                    {selectedMatch.teamA.code}
                  </span>
                </div>
              </div>

              {/* Card 2: Tempo de Combate (Dark Navy Digital Timer) */}
              <div className="bg-[#081b2e] rounded-[16px] p-6 text-white flex flex-col justify-between relative shadow-xl overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#93c5fd] tracking-[2px] uppercase">
                      TEMPO DE COMBATE
                    </span>
                    <span className="bg-[#0c2a4d] border border-[#00f2ff]/40 text-[#00f2ff] px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider">
                      ROUND {currentRoundNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isTimerRunning ? "bg-[#4ade80] animate-pulse" : "bg-slate-500"
                      }`}
                    />
                    <span className={isTimerRunning ? "text-[#4ade80]" : "text-slate-400"}>
                      {isTimerRunning ? "LIVE" : "PAUSADO"}
                    </span>
                  </div>
                </div>

                {/* Digital Timer (Glowing Cyan) */}
                <div className="text-center py-2">
                  <div className="text-[58px] font-['Space_Grotesk'] font-black text-[#00f2ff] tracking-wider leading-none select-none drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">
                    {formatTimer(matchTimer)}
                  </div>
                </div>

                {/* 3 Circular Controls */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    onClick={() => {
                      const next = !isTimerRunning;
                      setIsTimerRunning(next);
                      broadcastTimer(matchTimer, next);
                    }}
                    title={isTimerRunning ? "Pausar Combate" : "Iniciar Combate"}
                    className="w-12 h-12 rounded-full bg-[#00f2ff] hover:bg-[#38bdf8] text-[#00356a] flex items-center justify-center text-xl shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {isTimerRunning ? "⏸" : "▶"}
                  </button>

                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      broadcastTimer(matchTimer, false);
                    }}
                    title="Pausar"
                    className="w-12 h-12 rounded-full bg-[#1e293b] hover:bg-[#334155] text-white flex items-center justify-center text-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    ⏸
                  </button>

                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setMatchTimer(120);
                      broadcastTimer(120, false);
                    }}
                    title="Reiniciar Tempo (2:00)"
                    className="w-12 h-12 rounded-full bg-[#1e293b] hover:bg-[#334155] text-white flex items-center justify-center text-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    ↻
                  </button>
                </div>
              </div>

              {/* Card 3: Canto Azul */}
              <div className="bg-[#f0f7ff] rounded-[16px] p-6 border border-[#e0f2fe] flex flex-col justify-between shadow-sm">
                <div>
                  <span className="inline-block bg-[#e0f2fe] text-[#0284c7] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                    Canto Azul
                  </span>
                  <div className="text-[26px] font-['Space_Grotesk'] font-bold text-[#051d30] mt-4">
                    {selectedMatch.teamB.name}
                  </div>
                  <div className="text-[#64748b] text-[13px] mt-1">
                    {selectedMatch.teamB.robot}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#bae6fd] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#0369a1] uppercase tracking-wider">
                    Semente: {selectedMatch.teamB.seed || "B4"}
                  </span>
                  <span className="text-[11px] font-bold text-[#0284c7]">
                    {selectedMatch.teamB.code}
                  </span>
                </div>
              </div>
            </div>

            {/* ─── Middle Section (Left 65% Registro de Rounds | Right 35% Imobilização & Decisão) ─ */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6 items-start">
              {/* Left Column: Registro de Rounds */}
              <div className="bg-white rounded-[16px] border border-[#e2e8f0] p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9]">
                  <h2 className="text-[18px] font-['Space_Grotesk'] font-bold text-[#051d30]">
                    Registro de Rounds
                  </h2>
                  <span className="bg-[#f1f5f9] text-[#64748b] px-3 py-1 rounded-full text-[11px] font-bold">
                    Melhor de 3
                  </span>
                </div>

                {/* Rows for Round 1, Round 2, Round 3 */}
                <div className="divide-y divide-[#f1f5f9]">
                  {/* Round 1 */}
                  <div className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    currentRoundNumber === 1 && !round1Winner ? "bg-[#f8fafc] px-3 rounded-[8px]" : ""
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full font-bold text-[13px] flex items-center justify-center shrink-0 ${
                        round1Winner ? "bg-[#059669] text-white" : currentRoundNumber === 1 ? "bg-[#0284c7] text-white ring-2 ring-[#0284c7]/30" : "bg-[#cbd5e1] text-[#334155]"
                      }`}>
                        1
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[15px] text-[#051d30]">Round 1</span>
                        {round1Duration !== null && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ecfeff] text-[#0891b2] border border-[#a5f3fc] text-[11px] font-mono font-bold">
                            ⏱ {formatTimer(round1Duration)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSelectRound1Winner("teamA")}
                        className={`px-3 py-1.5 rounded text-[12px] font-bold transition-all cursor-pointer ${
                          round1Winner === "teamA"
                            ? "bg-[#ef4444] text-white shadow"
                            : "border border-[#ef4444] text-[#ef4444] hover:bg-[#fef2f2]"
                        }`}
                      >
                        {selectedMatch.teamA.name.split(" ")[0]} (V)
                      </button>

                      <button
                        onClick={() => handleSelectRound1Winner("teamB")}
                        className={`px-3 py-1.5 rounded text-[12px] font-bold transition-all cursor-pointer ${
                          round1Winner === "teamB"
                            ? "bg-[#0891b2] text-white shadow"
                            : "border border-[#0891b2] text-[#0891b2] hover:bg-[#ecfeff]"
                        }`}
                      >
                        {selectedMatch.teamB.name.split(" ")[0]} (A)
                      </button>

                      <button
                        onClick={() => handleSelectRound1Winner("draw")}
                        className={`px-3 py-1.5 rounded text-[12px] font-bold transition-all cursor-pointer ${
                          round1Winner === "draw"
                            ? "bg-[#64748b] text-white shadow"
                            : "border border-[#cbd5e1] text-[#64748b] hover:bg-[#f8fafc]"
                        }`}
                      >
                        Empate
                      </button>
                    </div>
                  </div>

                  {/* Round 2 */}
                  <div className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    currentRoundNumber === 2 && !round2Winner ? "bg-[#f8fafc] px-3 rounded-[8px]" : ""
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full font-bold text-[13px] flex items-center justify-center shrink-0 ${
                        round2Winner ? "bg-[#059669] text-white" : currentRoundNumber === 2 ? "bg-[#0284c7] text-white ring-2 ring-[#0284c7]/30" : "bg-[#cbd5e1] text-[#334155]"
                      }`}>
                        2
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[15px] text-[#051d30]">Round 2</span>
                        {round2Duration !== null && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ecfeff] text-[#0891b2] border border-[#a5f3fc] text-[11px] font-mono font-bold">
                            ⏱ {formatTimer(round2Duration)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {round1Winner ? (
                        <>
                          <button
                            onClick={() => handleSelectRound2Winner("teamA")}
                            className={`px-3 py-1.5 rounded text-[12px] font-bold transition-all cursor-pointer ${
                              round2Winner === "teamA"
                                ? "bg-[#ef4444] text-white shadow"
                                : "border border-[#ef4444] text-[#ef4444] hover:bg-[#fef2f2]"
                            }`}
                          >
                            {selectedMatch.teamA.name.split(" ")[0]} (V)
                          </button>

                          <button
                            onClick={() => handleSelectRound2Winner("teamB")}
                            className={`px-3 py-1.5 rounded text-[12px] font-bold transition-all cursor-pointer ${
                              round2Winner === "teamB"
                                ? "bg-[#0891b2] text-white shadow"
                                : "border border-[#0891b2] text-[#0891b2] hover:bg-[#ecfeff]"
                            }`}
                          >
                            {selectedMatch.teamB.name.split(" ")[0]} (A)
                          </button>

                          <button
                            onClick={() => handleSelectRound2Winner("draw")}
                            className={`px-3 py-1.5 rounded text-[12px] font-bold transition-all cursor-pointer ${
                              round2Winner === "draw"
                                ? "bg-[#64748b] text-white shadow"
                                : "border border-[#cbd5e1] text-[#64748b] hover:bg-[#f8fafc]"
                            }`}
                          >
                            Empate
                          </button>
                        </>
                      ) : (
                        <span className="text-[12px] text-[#94a3b8] bg-[#f8fafc] px-3 py-1 rounded border border-[#e2e8f0]">
                          Aguardando Round 1
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Round 3 (Desempate / Decisão) */}
                  <div className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    currentRoundNumber === 3 && !round3Winner ? "bg-[#f8fafc] px-3 rounded-[8px]" : ""
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full font-bold text-[13px] flex items-center justify-center shrink-0 ${
                        round3Winner ? "bg-[#059669] text-white" : currentRoundNumber === 3 ? "bg-[#0284c7] text-white ring-2 ring-[#0284c7]/30" : "bg-[#cbd5e1] text-[#334155]"
                      }`}>
                        3
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[15px] text-[#051d30]">Round 3</span>
                        {round3Duration !== null && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ecfeff] text-[#0891b2] border border-[#a5f3fc] text-[11px] font-mono font-bold">
                            ⏱ {formatTimer(round3Duration)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {round2Winner ? (
                        <>
                          <button
                            onClick={() => handleSelectRound3Winner("teamA")}
                            className={`px-3 py-1.5 rounded text-[12px] font-bold transition-all cursor-pointer ${
                              round3Winner === "teamA"
                                ? "bg-[#ef4444] text-white shadow"
                                : "border border-[#ef4444] text-[#ef4444] hover:bg-[#fef2f2]"
                            }`}
                          >
                            {selectedMatch.teamA.name.split(" ")[0]} (V)
                          </button>

                          <button
                            onClick={() => handleSelectRound3Winner("teamB")}
                            className={`px-3 py-1.5 rounded text-[12px] font-bold transition-all cursor-pointer ${
                              round3Winner === "teamB"
                                ? "bg-[#0891b2] text-white shadow"
                                : "border border-[#0891b2] text-[#0891b2] hover:bg-[#ecfeff]"
                            }`}
                          >
                            {selectedMatch.teamB.name.split(" ")[0]} (A)
                          </button>

                          <button
                            onClick={() => handleSelectRound3Winner("draw")}
                            className={`px-3 py-1.5 rounded text-[12px] font-bold transition-all cursor-pointer ${
                              round3Winner === "draw"
                                ? "bg-[#64748b] text-white shadow"
                                : "border border-[#cbd5e1] text-[#64748b] hover:bg-[#f8fafc]"
                            }`}
                          >
                            Empate
                          </button>
                        </>
                      ) : (
                        <span className="text-[12px] text-[#94a3b8] bg-[#f8fafc] px-3 py-1 rounded border border-[#e2e8f0]">
                          Aguardando Round 2
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Imobilização & Decisão Soberana */}
              <div className="flex flex-col gap-6">
                {/* Card 1: Imobilização */}
                <div className="bg-white rounded-[16px] border border-[#e2e8f0] p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-[15px] font-bold text-[#051d30]">
                    <span className="text-amber-500">⚠️</span>
                    <span>Imobilização</span>
                  </div>
                  <p className="text-[13px] text-[#64748b] mt-1">
                    Inicie a contagem de 15 segundos caso um robô pareça inoperante no tatame.
                  </p>

                  <div
                    onClick={handleStartImobilizacao}
                    className={`mt-4 border-2 border-[#f97316] text-[#f97316] hover:bg-[#fff7ed] rounded-[10px] py-4 px-4 flex items-center justify-center gap-2 font-['Space_Grotesk'] font-bold text-[13px] tracking-wider uppercase cursor-pointer transition-all ${
                      isImobilizacaoRunning ? "bg-[#fff7ed] animate-pulse" : ""
                    }`}
                  >
                    <span>⏱</span>
                    <span>
                      {isImobilizacaoRunning && imobilizacaoTimer !== null
                        ? `CONTAGEM: ${imobilizacaoTimer}S RESTANTES`
                        : "INICIAR 15S"}
                    </span>
                  </div>
                </div>

                {/* Card 2: Decisão Soberana */}
                <div className="bg-[#061a30] rounded-[16px] p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="text-[18px] font-['Space_Grotesk'] font-bold">
                    Decisão Soberana
                  </div>
                  <p className="text-[#94a3b8] text-[13px] mt-1 leading-relaxed">
                    Ação gravada diretamente no MongoDB Atlas. O resultado será publicado no Telão de Projeção imediatamente.
                  </p>

                  {/* Big Glowing Cyan Button */}
                  <button
                    disabled={isSaving}
                    onClick={handleConfirmResult}
                    className="mt-5 w-full bg-[#00e5ff] hover:bg-[#00f2ff] text-[#00356a] font-['Space_Grotesk'] font-black tracking-wider uppercase text-[12px] py-3.5 px-4 rounded-[4px] shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>✓</span>
                    <span>{isSaving ? "CONFIRMANDO..." : "CONFIRMAR RESULTADO"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Bottom Section: JUDGE OBSERVATIONS ────────────────────── */}
            <div className="mt-8">
              <span className="text-[11px] font-bold text-[#64748b] tracking-[1.5px] uppercase">
                JUDGE OBSERVATIONS
              </span>
              <div className="bg-white rounded-[12px] border border-[#e2e8f0] p-4 shadow-sm mt-2">
                <textarea
                  value={judgeObservations}
                  onChange={(e) => setJudgeObservations(e.target.value)}
                  placeholder="Enter technical feedback regarding robot sensors or mechanical performance..."
                  className="w-full min-h-[90px] border-none outline-none text-[#1e293b] text-[13px] placeholder:text-[#94a3b8] resize-y"
                />
              </div>
              <div className="text-[10px] font-mono text-[#94a3b8] mt-2">
                TECHNICAL LOG V1.0 • MONGODB ATLAS SYNCED
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
