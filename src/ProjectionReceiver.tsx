import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BracketTeam {
  id?: string;
  name: string;
  code?: string;
  robot?: string;
  seed?: string;
  score?: number | string;
  isLive?: boolean;
  winner?: boolean;
}

export interface BracketMatch {
  id: string;
  code: string;
  phase: "OITAVAS" | "QUARTAS" | "SEMIFINAL" | "FINAL";
  position?: number;
  team1: BracketTeam;
  team2: BracketTeam;
  status: "PENDENTE" | "EM ANDAMENTO" | "CONCLUÍDO";
  released?: boolean;
  winnerId?: string | null;
  winnerName?: string | null;
  round1Duration?: number | null;
  round2Duration?: number | null;
  round3Duration?: number | null;
}

export interface SumoTournamentState {
  category: string;
  status: string;
  timer: number;
  matches: BracketMatch[];
  finalist1?: string;
  finalist2?: string;
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ProjectionReceiver() {
  const [matches, setMatches] = useState<BracketMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<"ALL" | "OITAVAS" | "QUARTAS" | "SEMIFINAL" | "FINAL">("ALL");
  const [liveTimer, setLiveTimer] = useState<number>(() => {
    try {
      const cached = localStorage.getItem("sumo_timer_sync");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (typeof parsed.timer === "number") return parsed.timer;
      }
    } catch {}
    return 120; // 02:00 oficial do sumô
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
                score: isReleased ? (m.team1?.score ?? 0) : (isLive ? "LIVE" : "--"),
                winner: isReleased && t1Wins,
                isLive,
              },
              team2: {
                id: m.team2?.id,
                name: (m.team2?.name || "AGUARDANDO...").toUpperCase(),
                code: m.team2?.code,
                robot: m.team2?.robot,
                seed: m.team2?.seed,
                score: isReleased ? (m.team2?.score ?? 0) : "--",
                winner: isReleased && t2Wins,
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

  // 2. Lifecycle: Fetch on mount & poll every 3 seconds for 100% real-time accuracy with MongoDB
  useEffect(() => {
    fetchMatchesFromApi();
    const interval = setInterval(fetchMatchesFromApi, 3000);
    return () => clearInterval(interval);
  }, []);

  // 3. Listen to BroadcastChannel and localStorage for instant real-time synchronization
  useEffect(() => {
    const ch = new BroadcastChannel("robotic_proj");
    ch.onmessage = (e: MessageEvent) => {
      if (e.data) {
        if (e.data.matches && Array.isArray(e.data.matches)) {
          fetchMatchesFromApi();
        }
        if (e.data.type === "TIMER_SYNC" || e.data.timer !== undefined) {
          if (typeof e.data.timer === "number") {
            setLiveTimer(e.data.timer);
          }
          if (typeof e.data.isRunning === "boolean") {
            setIsTimerRunning(e.data.isRunning);
          }
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
          if (typeof parsed.timer === "number") setLiveTimer(parsed.timer);
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

  // 4. Timer interval countdown ONLY when match timer is running
  useEffect(() => {
    let id: any = null;
    if (isTimerRunning && liveTimer > 0) {
      id = setInterval(() => {
        setLiveTimer((t) => Math.max(0, t - 1));
      }, 1000);
    } else if (liveTimer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [isTimerRunning, liveTimer]);

  // Matches grouped by phase
  const oitavas = matches.filter((m) => m.phase === "OITAVAS");
  const quartas = matches.filter((m) => m.phase === "QUARTAS");
  const semifinais = matches.filter((m) => m.phase === "SEMIFINAL");
  const finalMatch = matches.find((m) => m.phase === "FINAL");

  const finTeam1Name = finalMatch?.team1?.name && finalMatch.team1.name !== "AGUARDANDO..." ? finalMatch.team1.name : "FINALISTA 01";
  const finTeam2Name = finalMatch?.team2?.name && finalMatch.team2.name !== "AGUARDANDO..." ? finalMatch.team2.name : "FINALISTA 02";

  // Card renderer for matches
  const renderMatchCard = (m: BracketMatch) => {
    const isLive = m.status === "EM ANDAMENTO";
    const t1Winner = m.team1.winner === true;
    const t2Winner = m.team2.winner === true;

    return (
      <div
        key={m.id || m.code}
        className={`rounded-[10px] p-3.5 transition-all ${
          isLive
            ? "bg-[#0a233f] border-2 border-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.25)]"
            : "bg-[#091b30] border border-[#163152] hover:border-[#1e4068]"
        }`}
      >
        {/* Match Code & Phase Tag */}
        <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-[#122b49]">
          <span className="text-[10px] font-mono font-bold text-[#00f2ff] tracking-wider">
            {m.code}
          </span>
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="bg-[#f59e0b] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                AO VIVO
              </span>
            )}
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                m.status === "CONCLUÍDO"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : isLive
                  ? "bg-amber-950 text-amber-400 border border-amber-800"
                  : "bg-[#122b49] text-slate-400"
              }`}
            >
              {m.status}
            </span>
          </div>
        </div>

        {/* Team 1 */}
        <div className="flex items-center justify-between py-1 border-b border-[#122b49]/60">
          <div className="flex items-center gap-2 truncate pr-2">
            {m.team1.seed && (
              <span className="text-[10px] font-mono font-bold text-[#f59e0b] bg-[#162a45] px-1 rounded">
                {m.team1.seed}
              </span>
            )}
            <span
              className={`font-bold text-[13px] tracking-wide truncate ${
                t1Winner ? "text-white" : isLive ? "text-[#00f2ff]" : "text-slate-200"
              }`}
            >
              {m.team1.name}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold shrink-0 ${
              t1Winner ? "bg-[#2563eb] text-white shadow" : "bg-[#122b49] text-[#64748b]"
            }`}
          >
            {m.team1.score}
          </span>
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between py-1 pt-1.5">
          <div className="flex items-center gap-2 truncate pr-2">
            {m.team2.seed && (
              <span className="text-[10px] font-mono font-bold text-[#00f2ff] bg-[#162a45] px-1 rounded">
                {m.team2.seed}
              </span>
            )}
            <span
              className={`text-[13px] tracking-wide truncate ${
                t2Winner ? "text-white font-bold" : "text-[#94a3b8]"
              }`}
            >
              {m.team2.name}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold shrink-0 ${
              t2Winner ? "bg-[#2563eb] text-white shadow" : "bg-[#122b49] text-[#64748b]"
            }`}
          >
            {m.team2.score}
          </span>
        </div>

        {/* Round durations if recorded */}
        {(m.round1Duration || m.round2Duration) && (
          <div className="flex items-center gap-2 pt-1.5 mt-1 border-t border-[#122b49]/40 text-[9px] font-mono text-slate-400">
            {m.round1Duration && (
              <span>R1: {Math.floor(m.round1Duration / 60)}:{String(m.round1Duration % 60).padStart(2, "0")}</span>
            )}
            {m.round2Duration && (
              <span>• R2: {Math.floor(m.round2Duration / 60)}:{String(m.round2Duration % 60).padStart(2, "0")}</span>
            )}
            {m.round3Duration && (
              <span>• R3: {Math.floor(m.round3Duration / 60)}:{String(m.round3Duration % 60).padStart(2, "0")}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto overflow-x-hidden flex flex-col justify-between select-none"
      style={{
        background: "radial-gradient(ellipse at center, #05162a 0%, #030c17 100%)",
        color: "#ffffff",
        fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ─── Top Header Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-[#11243e] bg-[#030c17]/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-['Space_Grotesk'] font-black text-[20px] tracking-[2.5px] uppercase text-white">
            ROBOTIC_SYNC
          </span>
          <span className="text-[#38bdf8] bg-[#0c2a4d] border border-[#0284c7]/40 px-3 py-0.5 rounded text-[11px] font-mono font-bold tracking-[1.5px] uppercase">
            ARENA SUMÔ OFICIAL
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-700/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            MONGODB ATLAS CONECTADO
          </span>
        </div>

        {/* Phase Filter Tabs */}
        <div className="flex items-center gap-2 bg-[#091b30] border border-[#163152] rounded-[8px] p-1">
          {[
            { key: "ALL", label: "VISÃO GERAL (15)" },
            { key: "OITAVAS", label: "OITAVAS (8)" },
            { key: "QUARTAS", label: "QUARTAS (4)" },
            { key: "SEMIFINAL", label: "SEMIFINAIS (2)" },
            { key: "FINAL", label: "FINAL (1)" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as any)}
              className={`px-3 py-1 rounded text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                activeView === tab.key
                  ? "bg-[#2563eb] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Title & Match Stats Subheader ─────────────────────────────── */}
      <div className="px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <span className="text-[#f59e0b] font-mono text-[12px] font-bold tracking-[2.5px] uppercase">
            TORNEIO PRINCIPAL DE SUMÔ • CHAVEAMENTO CASCATA
          </span>
          <h1 className="text-[34px] md:text-[42px] font-black tracking-[-1px] text-white leading-none mt-1 uppercase">
            CHAVE OFICIAL DE CONFRONTOS
          </h1>
        </div>

        {/* Right Info: Tempo de Partida & Status */}
        <div className="flex items-center gap-6 bg-[#091b30]/80 border border-[#163152] rounded-[12px] px-6 py-3 self-start md:self-auto shadow-lg">
          <div>
            <div className="text-[10px] font-mono font-bold text-[#94a3b8] tracking-[1.5px] uppercase">
              TEMPO DE COMBATE
            </div>
            <div className="text-[#f59e0b] font-mono font-black text-[26px] tracking-wider leading-none mt-1">
              {formatTime(liveTimer)}
            </div>
          </div>

          <div className="w-px h-10 bg-[#163152]" />

          <div>
            <div className="text-[10px] font-mono font-bold text-[#94a3b8] tracking-[1.5px] uppercase">
              TRANSMISSÃO
            </div>
            <div className="flex items-center gap-2 text-[#4ade80] font-bold text-[13px] tracking-wider uppercase mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80] animate-pulse" />
              <span>AO VIVO</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN BRACKET GRID (16 TEAMS / 15 MATCHES IN CASCADING BRACKET)
      ══════════════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-[#00f2ff] text-[16px] font-mono animate-pulse">
          Carregando confrontos reais do MongoDB Atlas...
        </div>
      ) : activeView === "ALL" ? (
        <div className="flex-1 px-8 py-3 grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* ─── Coluna 1: OITAVAS DE FINAL (MCH-001 a MCH-004) ─────────── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#64748b] tracking-[2px] uppercase pb-1 border-b border-[#122b49]">
              <span>OITAVAS DE FINAL</span>
              <span className="text-[#00f2ff]">CHAVE A</span>
            </div>
            {oitavas.slice(0, 4).map(renderMatchCard)}
          </div>

          {/* ─── Coluna 2: OITAVAS DE FINAL (MCH-005 a MCH-008) ─────────── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#64748b] tracking-[2px] uppercase pb-1 border-b border-[#122b49]">
              <span>OITAVAS DE FINAL</span>
              <span className="text-[#00f2ff]">CHAVE B</span>
            </div>
            {oitavas.slice(4, 8).map(renderMatchCard)}
          </div>

          {/* ─── Coluna 3: QUARTAS & SEMIFINAIS ──────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[11px] font-mono font-bold text-[#64748b] tracking-[2px] uppercase pb-1 border-b border-[#122b49] mb-2">
                QUARTAS DE FINAL
              </div>
              <div className="flex flex-col gap-2.5">
                {quartas.map(renderMatchCard)}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono font-bold text-[#64748b] tracking-[2px] uppercase pb-1 border-b border-[#122b49] mb-2">
                SEMIFINAIS
              </div>
              <div className="flex flex-col gap-2.5">
                {semifinais.map(renderMatchCard)}
              </div>
            </div>
          </div>

          {/* ─── Coluna 4: GRANDE FINAL (Podium & Gold Trophy) ──────────── */}
          <div className="flex flex-col items-center justify-center text-center p-6 bg-[#07192d]/80 border border-[#163152] rounded-[16px] shadow-2xl relative overflow-hidden">
            <div className="text-[52px] filter drop-shadow-[0_0_25px_rgba(245,158,11,0.5)] animate-pulse">
              🏆
            </div>

            <h2 className="text-[26px] font-black tracking-[2px] uppercase text-white mt-1">
              GRANDE FINAL
            </h2>
            <div className="text-[#64748b] font-mono text-[11px]">DISPUTA DE TÍTULO OFICIAL</div>

            {/* Finalist 01 */}
            <div className="mt-5 w-full bg-[#05162a]/90 p-3 rounded-[8px] border border-[#122b49]">
              <div className="text-[9px] font-mono font-bold text-[#f59e0b] tracking-[2px] uppercase">
                FINALISTA 01
              </div>
              <div className="text-[18px] font-black text-white tracking-wider uppercase mt-0.5 truncate">
                {finTeam1Name}
              </div>
            </div>

            {/* Metallic VS */}
            <div className="text-[36px] font-black text-slate-400 tracking-[4px] my-2 select-none filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              VS
            </div>

            {/* Finalist 02 */}
            <div className="w-full bg-[#05162a]/90 p-3 rounded-[8px] border border-[#122b49]">
              <div className="text-[9px] font-mono font-bold text-[#f59e0b] tracking-[2px] uppercase">
                FINALISTA 02
              </div>
              <div className="text-[18px] font-black text-white tracking-wider uppercase mt-0.5 truncate">
                {finTeam2Name}
              </div>
            </div>

            {/* Arena Live Timer Box */}
            <div className="mt-5 w-full bg-[#05162a] border border-[#0284c7]/50 rounded-[12px] p-3.5 text-center shadow-lg">
              <div className="flex items-center justify-center gap-2 text-[#ef4444] font-bold text-[9px] tracking-[2px] uppercase">
                <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
                <span>CRONÔMETRO OFICIAL</span>
              </div>
              <div className="text-[38px] font-mono font-black text-[#00f2ff] tracking-wider mt-0.5 drop-shadow-[0_0_12px_rgba(0,242,255,0.4)]">
                {formatTime(liveTimer)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Single Phase View */
        <div className="flex-1 px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {matches
              .filter((m) => m.phase === activeView)
              .map(renderMatchCard)}
          </div>
        </div>
      )}

      {/* ─── Bottom Modalidades Tab Bar (EXCLUSIVO SUMÔ) ────────────── */}
      <div className="h-[60px] border-t border-[#11243e] bg-[#020810] flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-2 text-[12px] font-mono text-[#94a3b8]">
          <span>CONFRONTOS OFICIAIS:</span>
          <span className="text-white font-bold">{matches.length}</span>
          <span className="mx-2">|</span>
          <span>CONCLUÍDOS:</span>
          <span className="text-emerald-400 font-bold">
            {matches.filter((m) => m.status === "CONCLUÍDO").length}
          </span>
        </div>

        <div className="flex items-center gap-2 px-6 py-2 rounded-[8px] text-[12px] font-bold uppercase tracking-wider bg-[#2563eb] text-white shadow-lg shadow-blue-500/30">
          <span>🤖</span>
          <span>MODALIDADE: SUMÔ 3KG (TATAME OFICIAL)</span>
        </div>
      </div>
    </div>
  );
}
