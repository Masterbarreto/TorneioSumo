import { useState, useEffect, useRef } from "react";
import AdminSidebar from "./AdminSidebar";
import { BracketMatch, SumoTournamentState } from "./ProjectionReceiver";

export default function PartidasPage({
  onNavigate,
  onLogout,
  championshipStarted,
  onStartChampionship,
}: {
  onNavigate: (key: string) => void;
  onLogout: () => void;
  championshipStarted: boolean;
  onStartChampionship: () => void;
}) {
  const [matches, setMatches] = useState<BracketMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePhase, setActivePhase] = useState<"ALL" | "OITAVAS" | "QUARTAS" | "SEMIFINAL" | "FINAL">("ALL");
  const [matchTimer, setMatchTimer] = useState<number>(() => {
    try {
      const s = localStorage.getItem("sumo_timer_sync");
      if (s) {
        const parsed = JSON.parse(s);
        if (typeof parsed.timer === "number") return parsed.timer;
      }
    } catch {}
    return 120;
  });
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [toast, setToast] = useState<string>("");

  const projChannel = useRef<BroadcastChannel | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // 1. Fetch Real Matches from MongoDB Atlas API
  const fetchMatchesFromApi = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/v1/partidas");
      if (res.ok) {
        const rawList = await res.json();
        if (Array.isArray(rawList) && rawList.length > 0) {
          const mapped: BracketMatch[] = rawList.map((m: any) => {
            const isReleased = m.released === true;
            const isLive = m.status === "EM ANDAMENTO";
            const isDone = m.status === "CONCLUÍDO";

            const t1Wins = isDone && (m.team1?.winner === true || m.winnerId === m.team1?.id || m.winnerName === m.team1?.name);
            const t2Wins = isDone && (m.team2?.winner === true || m.winnerId === m.team2?.id || m.winnerName === m.team2?.name);

            return {
              id: m._id || m.code,
              code: m.code,
              phase: m.phase,
              position: m.position,
              status: m.status,
              released: isReleased,
              winnerId: m.winnerId,
              winnerName: m.winnerName,
              round1Duration: m.round1Duration ?? null,
              round2Duration: m.round2Duration ?? null,
              round3Duration: m.round3Duration ?? null,
              team1: {
                id: m.team1?.id,
                name: (m.team1?.name || "AGUARDANDO...").toUpperCase(),
                code: m.team1?.code,
                robot: m.team1?.robot,
                seed: m.team1?.seed,
                score: isDone ? (m.team1?.score ?? 0) : (isLive ? "LIVE" : "--"),
                winner: t1Wins,
                isLive,
              },
              team2: {
                id: m.team2?.id,
                name: (m.team2?.name || "AGUARDANDO...").toUpperCase(),
                code: m.team2?.code,
                robot: m.team2?.robot,
                seed: m.team2?.seed,
                score: isDone ? (m.team2?.score ?? 0) : "--",
                winner: t2Wins,
              },
            };
          });

          setMatches(mapped);
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar partidas da API:", err);
    }
  };

  // 2. Initialize on Mount
  useEffect(() => {
    fetchMatchesFromApi();

    const ch = new BroadcastChannel("robotic_proj");
    projChannel.current = ch;

    ch.onmessage = (e: MessageEvent) => {
      if (e.data) {
        if (e.data.refresh || e.data.matches) {
          fetchMatchesFromApi();
        }
        if (e.data.type === "TIMER_SYNC" || e.data.timer !== undefined) {
          if (e.data.timer !== undefined) setMatchTimer(e.data.timer);
          if (e.data.isRunning !== undefined) setTimerRunning(e.data.isRunning);
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
          if (parsed.timer !== undefined) setMatchTimer(parsed.timer);
          if (parsed.isRunning !== undefined) setTimerRunning(parsed.isRunning);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      ch.close();
      window.removeEventListener("storage", handleStorage);
      projChannel.current = null;
    };
  }, []);

  // 3. Broadcast helper for real-time projection
  const broadcastSync = (updatedList = matches, newTimer = matchTimer, running = timerRunning) => {
    const state: SumoTournamentState = {
      category: "Sumô",
      status: running ? "EM ANDAMENTO" : "PAUSADO",
      timer: newTimer,
      matches: updatedList,
      finalist1: updatedList.find((m) => m.phase === "FINAL")?.team1.name || "TBD",
      finalist2: updatedList.find((m) => m.phase === "FINAL")?.team2.name || "TBD",
    };
    try {
      localStorage.setItem("sumo_projection_state", JSON.stringify(state));
      localStorage.setItem("sumo_timer_sync", JSON.stringify({ timer: newTimer, isRunning: running, timestamp: Date.now() }));
      projChannel.current?.postMessage({
        type: "TIMER_SYNC",
        sumoState: state,
        matches: updatedList,
        timer: newTimer,
        isRunning: running,
      });
    } catch (e) {}
  };

  // 4. Timer interval
  useEffect(() => {
    let id: any = null;
    if (timerRunning && matchTimer > 0) {
      id = setInterval(() => {
        setMatchTimer((t) => {
          const next = Math.max(0, t - 1);
          broadcastSync(matches, next, true);
          return next;
        });
      }, 1000);
    } else if (matchTimer === 0 && timerRunning) {
      setTimerRunning(false);
      broadcastSync(matches, 0, false);
    }
    return () => clearInterval(id);
  }, [timerRunning, matchTimer, matches]);

  // ─── Real API Actions ───────────────────────────────────────────────────────

  // Liberar / Bloquear resultado individual no MongoDB Atlas
  const toggleReleaseMatch = async (matchId: string) => {
    const m = matches.find((x) => x.id === matchId || x.code === matchId);
    if (!m) return;

    try {
      const res = await fetch(`http://localhost:3000/api/v1/partidas/${matchId}/release`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ released: !m.released }),
      });

      if (res.ok) {
        await fetchMatchesFromApi();
        broadcastSync();
        showToast(
          !m.released
            ? `Resultado de ${m.code} (${m.team1.name} x ${m.team2.name}) LIBERADO para o Telão!`
            : `Resultado de ${m.code} bloqueado do Telão.`
        );
      }
    } catch (e: any) {
      showToast("Erro ao atualizar exibição no servidor.");
    }
  };

  // Liberar todos os resultados no MongoDB Atlas
  const releaseAllResults = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/v1/partidas/release-all", { method: "POST" });
      if (res.ok) {
        await fetchMatchesFromApi();
        broadcastSync();
        showToast("100% dos resultados de Sumô liberados para o Telão!");
      }
    } catch (e) {
      showToast("Erro ao liberar resultados no servidor.");
    }
  };

  // Ocultar todos os resultados no MongoDB Atlas
  const hideAllResults = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/v1/partidas/hide-all", { method: "POST" });
      if (res.ok) {
        await fetchMatchesFromApi();
        broadcastSync();
        showToast("Todos os resultados de Sumô foram ocultados do Telão.");
      }
    } catch (e) {
      showToast("Erro ao ocultar resultados no servidor.");
    }
  };

  // Definir vencedor de um confronto no MongoDB Atlas (com cascata de avanço!)
  const setWinner = async (matchId: string, winningTeam: 1 | 2) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/partidas/${matchId}/winner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winningTeam }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchMatchesFromApi();
        broadcastSync();
        showToast(data.message || "Vitória gravada no MongoDB e promovida na chave!");
      }
    } catch (e: any) {
      showToast("Erro ao gravar vitória no servidor.");
    }
  };

  // Open Projection Window (?proj=1)
  const openProjectionWindow = () => {
    broadcastSync();
    window.open("/partidas?proj=1", "_blank");
  };

  // Filter matches by selected phase
  const filteredMatches = matches.filter((m) => {
    if (activePhase === "ALL") return true;
    return m.phase === activePhase;
  });

  return (
    <div className="fixed inset-0 z-[800] overflow-y-auto bg-[#f7f9ff] text-[#051d30] flex">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-8 z-[999] bg-[#051d30] text-white px-6 py-4 rounded-[6px] shadow-2xl border-l-4 border-[#00e5ff] flex items-center gap-3 animate-bounce">
          <span className="text-xl">📡</span>
          <div className="font-bold text-[13px]">{toast}</div>
        </div>
      )}

      {/* Admin Sidebar */}
      <AdminSidebar active="partidas" onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content Area */}
      <div className="flex-1 pl-0 md:pl-[256px] flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="min-h-[64px] border-b border-[#e2e8f0] bg-white flex items-center justify-between px-4 sm:px-8 pl-16 md:pl-8 py-2 shrink-0 flex-wrap gap-3">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[2px] uppercase text-[#8c4f00]">
              TORNEIO DE SUMÔ 3KG • CHAVE DE CONFRONTOS EM CASCATA
            </p>
            <h1 className="font-['Space_Grotesk'] font-bold text-[16px] sm:text-[18px] text-[#051d30] leading-tight">
              Gerenciamento Oficial de Partidas & Transmissão
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* MongoDB Atlas badge */}
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              MONGODB ATLAS CONECTADO
            </span>

            {/* Open Telão Button */}
            <button
              onClick={openProjectionWindow}
              className="flex items-center gap-2 bg-[#00356a] hover:bg-[#00468a] text-white font-['Space_Grotesk'] font-bold text-[12px] tracking-[1px] uppercase px-4 sm:px-5 py-2.5 rounded-[6px] transition-all shadow-md cursor-pointer"
            >
              <span>📺</span>
              <span>ABRIR TELÃO (?proj=1)</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-[12px] border border-[#e2e8f0] p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Timer Controller */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-12 h-12 rounded-[10px] bg-[#0c2a4d] flex items-center justify-center text-xl text-[#00f2ff]">
                ⏱
              </div>
              <div>
                <div className="text-[11px] font-mono font-bold text-[#64748b] tracking-wider uppercase">
                  Cronômetro da Arena Sumô
                </div>
                <div className="text-[32px] font-mono font-black text-[#051d30] leading-none mt-1">
                  {Math.floor(matchTimer / 60)}:{String(matchTimer % 60).padStart(2, "0")}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:ml-4">
                <button
                  onClick={() => {
                    const next = !timerRunning;
                    setTimerRunning(next);
                    broadcastSync(matches, matchTimer, next);
                  }}
                  className={`px-4 py-2 rounded-[6px] font-bold text-[12px] tracking-wider uppercase transition-colors cursor-pointer ${
                    timerRunning ? "bg-[#fee2e2] text-[#991b1b]" : "bg-[#ecfdf5] text-[#065f46]"
                  }`}
                >
                  {timerRunning ? "PAUSAR" : "INICIAR"}
                </button>
                <button
                  onClick={() => {
                    setMatchTimer(120);
                    setTimerRunning(false);
                    broadcastSync(matches, 120, false);
                  }}
                  className="px-3 py-2 rounded-[6px] border border-[#cbd5e1] text-[#64748b] hover:bg-[#f8fafc] text-[12px] font-bold transition-colors cursor-pointer"
                >
                  RESETAR (02:00)
                </button>
              </div>
            </div>

            {/* Global Projection Control Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={releaseAllResults}
                className="flex items-center gap-2 bg-[#00356a] hover:bg-[#00468a] text-white font-['Space_Grotesk'] font-bold text-[12px] tracking-wider uppercase px-4 py-2.5 rounded-[6px] transition-all shadow cursor-pointer"
              >
                <span>🔓</span>
                <span>LIBERAR RESULTADOS</span>
              </button>

              <button
                onClick={hideAllResults}
                className="flex items-center gap-2 border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#475569] font-['Space_Grotesk'] font-bold text-[12px] tracking-wider uppercase px-4 py-2.5 rounded-[6px] transition-all cursor-pointer"
              >
                <span>🔒</span>
                <span>OCULTAR TODOS</span>
              </button>
            </div>
          </div>

          {/* Phase Filter Tabs Bar */}
          <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
            <div className="flex items-center gap-2">
              {[
                { key: "ALL", label: "TODOS (15)" },
                { key: "OITAVAS", label: "OITAVAS DE FINAL (8)" },
                { key: "QUARTAS", label: "QUARTAS DE FINAL (4)" },
                { key: "SEMIFINAL", label: "SEMIFINAIS (2)" },
                { key: "FINAL", label: "GRANDE FINAL (1)" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActivePhase(tab.key as any)}
                  className={`px-4 py-2 rounded-[6px] font-['Space_Grotesk'] font-bold text-[12px] tracking-wider uppercase transition-all cursor-pointer ${
                    activePhase === tab.key
                      ? "bg-[#00356a] text-white shadow-sm"
                      : "text-[#64748b] hover:text-[#051d30] hover:bg-[#f1f5f9]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-[12px] font-mono text-[#64748b]">
              {filteredMatches.length} CONFRONTOS ENCONTRADOS
            </span>
          </div>

          {/* Match Cards List */}
          {loading ? (
            <div className="p-12 text-center text-[#64748b] font-mono">
              Carregando confrontos reais do MongoDB Atlas...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMatches.map((m) => (
                <div
                  key={m.id || m.code}
                  className={`bg-white rounded-[12px] border p-6 shadow-sm flex flex-col justify-between transition-all ${
                    m.released ? "border-[#93c5fd]" : "border-[#e2e8f0]"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[13px] font-bold text-[#0891b2]">
                        {m.code}
                      </span>
                      <span className="text-[11px] font-bold text-[#64748b] uppercase bg-[#f1f5f9] px-2 py-0.5 rounded">
                        {m.phase}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                          m.status === "EM ANDAMENTO"
                            ? "bg-[#e6fffa] text-[#0d9488]"
                            : m.status === "CONCLUÍDO"
                            ? "bg-[#dcfce7] text-[#15803d]"
                            : "bg-[#f1f5f9] text-[#475569]"
                        }`}
                      >
                        {m.status}
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          m.released ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {m.released ? "TRANSMITINDO" : "OCULTO"}
                      </span>
                    </div>
                  </div>

                  {/* Teams Display */}
                  <div className="py-5 flex flex-col gap-3">
                    {/* Team 1 */}
                    <div className="flex items-center justify-between bg-[#f8fafc] p-3 rounded-[8px]">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                        <span className="font-['Space_Grotesk'] font-bold text-[15px] text-[#051d30]">
                          {m.team1.name}
                        </span>
                        {m.team1.winner && (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            ✓ VENCEDOR
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[16px] text-[#051d30]">
                          {m.team1.score}
                        </span>
                        <button
                          onClick={() => setWinner(m.id, 1)}
                          className="px-2.5 py-1 rounded bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#065f46] text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Vitória
                        </button>
                      </div>
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center justify-between bg-[#f8fafc] p-3 rounded-[8px]">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                        <span className="font-['Space_Grotesk'] font-bold text-[15px] text-[#051d30]">
                          {m.team2.name}
                        </span>
                        {m.team2.winner && (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            ✓ VENCEDOR
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[16px] text-[#051d30]">
                          {m.team2.score}
                        </span>
                        <button
                          onClick={() => setWinner(m.id, 2)}
                          className="px-2.5 py-1 rounded bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#065f46] text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Vitória
                        </button>
                      </div>
                    </div>

                    {/* Rounds Duration Badges if recorded */}
                    {(m.round1Duration || m.round2Duration) && (
                      <div className="flex items-center gap-2 mt-1 px-1">
                        {m.round1Duration && (
                          <span className="text-[10px] font-mono font-bold bg-[#f1f5f9] text-[#475569] px-2 py-0.5 rounded border border-[#e2e8f0]">
                            ⏱ R1: {Math.floor(m.round1Duration / 60)}:{String(m.round1Duration % 60).padStart(2, "0")}
                          </span>
                        )}
                        {m.round2Duration && (
                          <span className="text-[10px] font-mono font-bold bg-[#f1f5f9] text-[#475569] px-2 py-0.5 rounded border border-[#e2e8f0]">
                            ⏱ R2: {Math.floor(m.round2Duration / 60)}:{String(m.round2Duration % 60).padStart(2, "0")}
                          </span>
                        )}
                        {m.round3Duration && (
                          <span className="text-[10px] font-mono font-bold bg-[#f1f5f9] text-[#475569] px-2 py-0.5 rounded border border-[#e2e8f0]">
                            ⏱ R3: {Math.floor(m.round3Duration / 60)}:{String(m.round3Duration % 60).padStart(2, "0")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-4 border-t border-[#f1f5f9] flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleReleaseMatch(m.id)}
                      className={`flex-1 py-2.5 rounded-[6px] font-['Space_Grotesk'] font-bold text-[11px] tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        m.released
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : "bg-[#00356a] text-white hover:bg-[#00468a]"
                      }`}
                    >
                      <span>{m.released ? "🔒 OCULTAR DO TELÃO" : "🔓 LIBERAR RESULTADO"}</span>
                    </button>

                    <button
                      onClick={() => onNavigate?.("rules")}
                      className="px-4 py-2.5 rounded-[6px] border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#051d30] font-['Space_Grotesk'] font-bold text-[11px] tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>⚖</span>
                      <span>AVALIAR</span>
                    </button>

                    <button
                      onClick={openProjectionWindow}
                      title="Ver no Telão"
                      className="p-2.5 border border-[#cbd5e1] hover:bg-[#f1f5f9] rounded-[6px] text-slate-600 transition-colors cursor-pointer"
                    >
                      📺
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
