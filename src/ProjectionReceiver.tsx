import { useState, useEffect } from "react";
import { API_BASE_URL } from "./config/api";

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

export interface IndividualProjectionRow {
  id: string;
  code: string;
  name: string;
  institution: string;
  status: "PENDENTE" | "EM ANDAMENTO" | "CONCLUÍDO";
  released: boolean;
  round1Released?: boolean;
  round2Released?: boolean;
  round3Released?: boolean;
  round1Metric: string | null;
  round2Metric: string | null;
  round3Metric: string | null;
  round1Points: number;
  round2Points: number;
  round3Points: number;
  totalPoints: number;
  bestMetric: string;
}

function toArenaSlug(name: string) {
  return (name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ProjectionReceiver() {
  // Parse ?proj=1 or ?proj=1/Tempo/arena-de-corrida
  const projParam = new URLSearchParams(window.location.search).get("proj") || "1";
  const projParts = projParam.split("/").filter(Boolean); // e.g. ["1", "Tempo", "arena-de-corrida"]
  const urlModeRaw = (projParts[1] || "").toLowerCase();
  const urlArenaSlug = (projParts[2] || "").toLowerCase();

  const initialTabMode: "tempo" | "confronto" | "dancarino" | "desafio" =
    urlModeRaw.includes("tempo") || urlModeRaw.includes("linha")
      ? "tempo"
      : urlModeRaw.includes("danc")
      ? "dancarino"
      : urlModeRaw.includes("desaf") || urlModeRaw.includes("obst")
      ? "desafio"
      : urlArenaSlug
      ? "tempo"
      : "confronto";

  const [projectionMode, setProjectionMode] = useState<"tempo" | "confronto" | "dancarino" | "desafio">(initialTabMode);
  const [autoCycle, setAutoCycle] = useState<boolean>(false);
  const [dbArenasList, setDbArenasList] = useState<
    { id: string; name: string; slug: string; evaluationType: "tempo" | "confronto" | "dancarino" | "desafio" }[]
  >([]);
  const [selectedArenaSlug, setSelectedArenaSlug] = useState<string>(urlArenaSlug || "");
  const [targetArenaName, setTargetArenaName] = useState<string>(
    urlArenaSlug ? urlArenaSlug.replace(/-/g, " ").toUpperCase() : "ARENA SEGUE LINHA"
  );
  const [individualRows, setIndividualRows] = useState<IndividualProjectionRow[]>([]);

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
      const res = await fetch(`${API_BASE_URL}/api/v1/partidas`);
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

  // 1b. Fetch Individual Arena & Teams (Tempo / Desafio / Dançarino) and sync with localStorage
  const fetchIndividualArenaData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/arenas`);
      if (res.ok) {
        const arenas = await res.json();
        if (Array.isArray(arenas)) {
          const mappedDbArenas = arenas.map((ar: any) => ({
            id: ar.id || ar._id,
            name: ar.name || "Arena",
            slug: toArenaSlug(ar.name || ""),
            evaluationType: (ar.evaluationType || ar.tipoAvaliacao || "desafio") as
              | "tempo"
              | "confronto"
              | "dancarino"
              | "desafio",
          }));
          setDbArenasList(mappedDbArenas);

          let matched = arenas.find((a: any) => {
            const slug = toArenaSlug(a.name || "");
            const activeSlug = selectedArenaSlug || urlArenaSlug;
            return activeSlug && (slug === activeSlug || (a.id || a._id) === activeSlug);
          });
          if (!matched) {
            matched = arenas.find(
              (a: any) => (a.evaluationType || a.tipoAvaliacao || "desafio") === projectionMode
            );
          }
          if (matched) {
            const matchedSlug = toArenaSlug(matched.name || "");
            if (!selectedArenaSlug && matchedSlug) {
              setSelectedArenaSlug(matchedSlug);
            }
            setTargetArenaName((matched.name || "ARENA").toUpperCase());
            const arenaId = matched.id || matched._id;
            const savedRaw = localStorage.getItem("robotic_individual_arenas_state");
            if (savedRaw) {
              try {
                const parsedMap = JSON.parse(savedRaw);
                if (parsedMap && Array.isArray(parsedMap[arenaId]) && parsedMap[arenaId].length > 0) {
                  setIndividualRows(parsedMap[arenaId]);
                  return;
                }
              } catch {}
            }
            // Build rows from matched.teams (prefer real MongoDB evaluation fields if present)
            const sampleR1 = ["39.40s", "30.00s", "44.50s", "46.80s", "52.10s", "54.20s"];
            const sampleR2 = ["38.12s", "32.85s", "44.10s", "47.20s", "50.88s", "53.05s"];
            const sampleR3 = ["38.12s", "31.12s", null, null, null, null];
            const sampleBest = ["38.12s", "31.12s", "44.10s", "46.80s", "50.88s", "53.05s"];
            const samplePts = [965, 925, 860, 820, 780, 740];
            const tList = Array.isArray(matched.teams) ? matched.teams : [];
            const built: IndividualProjectionRow[] = tList.map((t: any, idx: number) => {
              if (t.round1Metric !== undefined || t.round2Metric !== undefined || t.totalPoints !== undefined) {
                return {
                  id: t.id || `tm-${idx + 1}`,
                  code: t.code || `EQ-${String(idx + 1).padStart(3, "0")}`,
                  name: t.name || `EQUIPE ${idx + 1}`,
                  institution: t.institution || "SENAC",
                  status: t.evalStatus || (t.round3Metric ? "CONCLUÍDO" : "EM ANDAMENTO"),
                  released: Boolean(t.released),
                  round1Released: t.round1Released ?? Boolean(t.released),
                  round2Released: t.round2Released ?? Boolean(t.released),
                  round3Released: t.round3Released ?? Boolean(t.released),
                  round1Metric: t.round1Metric ?? null,
                  round2Metric: t.round2Metric ?? null,
                  round3Metric: t.round3Metric ?? null,
                  round1Points: Number(t.round1Points) || 0,
                  round2Points: Number(t.round2Points) || 0,
                  round3Points: Number(t.round3Points) || 0,
                  totalPoints: Number(t.totalPoints) || 0,
                  bestMetric: t.bestMetric || t.round2Metric || t.round1Metric || "--:--.--",
                };
              }
              return {
                id: t.id || `tm-${idx + 1}`,
                code: t.code || `EQ-${String(idx + 1).padStart(3, "0")}`,
                name: t.name || `EQUIPE ${idx + 1}`,
                institution: t.institution || "SENAC",
                status: "PENDENTE",
                released: false,
                round1Released: false,
                round2Released: false,
                round3Released: false,
                round1Metric: null,
                round2Metric: null,
                round3Metric: null,
                round1Points: 0,
                round2Points: 0,
                round3Points: 0,
                totalPoints: 0,
                bestMetric: "00:00.00",
              };
            });
            setIndividualRows(built);
          }
        }
      }
    } catch (e) {
      console.error("Erro ao buscar arena para projeção:", e);
    }
  };

  // 2. Lifecycle: Fetch on mount & poll every 3 seconds for 100% real-time accuracy with MongoDB
  useEffect(() => {
    fetchMatchesFromApi();
    fetchIndividualArenaData();
    const interval = setInterval(() => {
      fetchMatchesFromApi();
      fetchIndividualArenaData();
    }, 3000);
    return () => clearInterval(interval);
  }, [projectionMode, selectedArenaSlug]);

  // 3. Listen to BroadcastChannel and localStorage for instant real-time synchronization
  useEffect(() => {
    const ch = new BroadcastChannel("robotic_proj");
    ch.onmessage = (e: MessageEvent) => {
      if (e.data) {
        if (e.data.matches && Array.isArray(e.data.matches)) {
          fetchMatchesFromApi();
        }
        if (e.data.type === "INDIVIDUAL_ARENA_SYNC") {
          fetchIndividualArenaData();
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
      if (e.key === "robotic_individual_arenas_state") {
        fetchIndividualArenaData();
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
  }, [projectionMode]);

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

  const selectArenaOnProjector = (
    arena: { id: string; name: string; slug: string; evaluationType: "tempo" | "confronto" | "dancarino" | "desafio" },
    keepAuto = false
  ) => {
    if (!keepAuto) setAutoCycle(false);
    setProjectionMode(arena.evaluationType);
    setSelectedArenaSlug(arena.slug);
    setTargetArenaName(arena.name.toUpperCase());
    const modeLabel =
      arena.evaluationType === "tempo"
        ? "Tempo"
        : arena.evaluationType === "confronto"
        ? "Confronto"
        : arena.evaluationType === "dancarino"
        ? "Dancarino"
        : "Desafio";
    window.history.replaceState(null, "", `/partidas?proj=1/${modeLabel}/${arena.slug}`);
  };

  // 5. Auto-cycle timer (muda automaticamente entre as arenas reais do banco a cada 10s quando AUTO estiver ativo)
  useEffect(() => {
    if (!autoCycle || dbArenasList.length === 0) return;
    const interval = setInterval(() => {
      const currentIdx = dbArenasList.findIndex(
        (a) => a.slug === selectedArenaSlug || a.evaluationType === projectionMode
      );
      const nextIdx = (currentIdx + 1) % dbArenasList.length;
      const nextArena = dbArenasList[nextIdx];
      if (nextArena) {
        selectArenaOnProjector(nextArena, true);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [autoCycle, dbArenasList, selectedArenaSlug, projectionMode]);

  const getArenaIcon = (mode: "tempo" | "confronto" | "dancarino" | "desafio") => {
    if (mode === "tempo") {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="2" />
          <circle cx="18" cy="18" r="2" />
          <path d="M8 6h7a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h7" />
        </svg>
      );
    }
    if (mode === "confronto") {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="5" r="2" />
          <circle cx="16" cy="5" r="2" />
          <path d="m5 20 3-7 3 2 2-2 3 7" />
          <path d="M6 11h12" />
        </svg>
      );
    }
    if (mode === "dancarino") {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="7" y="3" width="10" height="7" rx="2" />
          <path d="M12 10v5" />
          <path d="m8 21 4-6 4 6" />
          <path d="m5 12 7 2 7-2" />
        </svg>
      );
    }
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  };

  const renderBottomNavigationFooter = () => {
    return (
      <footer className="h-[68px] border-t border-[#0d2238] bg-[#020812] rounded-t-[18px] flex items-center justify-center gap-4 sm:gap-10 lg:gap-14 px-6 shrink-0 mt-auto overflow-x-auto">
        {dbArenasList.map((arena) => {
          const isActive =
            selectedArenaSlug
              ? selectedArenaSlug === arena.slug
              : projectionMode === arena.evaluationType;

          return (
            <button
              key={arena.id}
              type="button"
              onClick={() => selectArenaOnProjector(arena, false)}
              className={`flex flex-col items-center justify-center gap-1.5 px-6 py-2 rounded-[10px] transition-all cursor-pointer min-w-[115px] shrink-0 ${
                isActive
                  ? "bg-[#2563eb] text-white shadow-[0_0_24px_rgba(37,99,235,0.55)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {getArenaIcon(arena.evaluationType)}
              <span className="text-[9px] font-mono font-bold tracking-[1.5px] uppercase leading-none whitespace-nowrap">
                {arena.name}
              </span>
            </button>
          );
        })}

        {/* Botão AUTO para alternar automaticamente entre as arenas existentes */}
        <button
          type="button"
          onClick={() => setAutoCycle((v) => !v)}
          title="Alternar automaticamente entre as arenas cadastradas no banco a cada 10 segundos"
          className={`flex flex-col items-center justify-center gap-1.5 px-5 py-2 rounded-[10px] transition-all cursor-pointer min-w-[95px] shrink-0 border ${
            autoCycle
              ? "bg-emerald-600/90 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.45)]"
              : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={autoCycle ? "animate-spin" : ""}
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          <span className="text-[9px] font-mono font-bold tracking-[1.5px] uppercase leading-none">
            {autoCycle ? "AUTO (ON)" : "AUTOMÁTICO"}
          </span>
        </button>
      </footer>
    );
  };
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

  if (projectionMode !== "confronto") {
    const formatProjectorMetric = (val: string | null | undefined, fallback = "00:00.00") => {
      if (!val) return fallback;
      const upper = val.toUpperCase();
      if (upper.includes("NÃO TERMINADO") || upper.includes("NAO TERMINADO") || upper.includes("DNF")) {
        return "00:00.00";
      }
      return val;
    };

    const extractMatchTime = (val: string | null | undefined) => {
      if (!val) return "00:00.00";
      const upper = val.toUpperCase();
      if (upper.includes("NÃO TERMINADO") || upper.includes("NAO TERMINADO") || upper.includes("DNF")) {
        return "00:00.00";
      }
      const parenMatch = val.match(/\((\d+:\d+\.\d+)\)/);
      if (parenMatch) return parenMatch[1];
      const timeMatch = val.match(/(\d+:\d+\.\d+)/);
      if (timeMatch) return timeMatch[1];
      return val;
    };

    const getVisibleChallengeStats = (row: IndividualProjectionRow | undefined) => {
      if (!row) return { points: 0, time: "00:00.00", anyRel: false };
      const r1Rel = row.round1Released ?? row.released;
      const r2Rel = row.round2Released ?? row.released;
      const r3Rel = row.round3Released ?? row.released;
      const anyRel = Boolean(r1Rel || r2Rel || r3Rel);
      if (!anyRel) return { points: 0, time: "00:00.00", anyRel: false };

      const p1Pts = r1Rel ? row.round1Points || 0 : 0;
      const p2Pts = r2Rel ? row.round2Points || 0 : 0;
      const p3Pts = r3Rel ? row.round3Points || 0 : 0;
      const maxPts = Math.max(p1Pts, p2Pts, p3Pts, row.totalPoints || 0);

      const rawMetric =
        (r3Rel && row.round3Metric) ||
        (r2Rel && row.round2Metric) ||
        (r1Rel && row.round1Metric) ||
        row.bestMetric;

      return {
        points: maxPts,
        time: extractMatchTime(rawMetric),
        anyRel: true,
      };
    };

    const p1 = individualRows[0];
    const p2 = individualRows[1];
    const p3 = individualRows[2];

    if (projectionMode === "desafio") {
      const p1Stats = getVisibleChallengeStats(p1);
      const p2Stats = getVisibleChallengeStats(p2);
      const p3Stats = getVisibleChallengeStats(p3);

      return (
        <div
          className="fixed inset-0 z-[99999] overflow-y-auto overflow-x-hidden flex flex-col select-none"
          style={{
            background: "#020b16",
            color: "#ffffff",
            fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {/* ─── Top Bar ─────────────────────────────────────────────────────── */}
          <header className="flex items-center justify-between px-8 py-3.5 border-b border-[#0d2238] bg-[#030d1a] shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-['Space_Grotesk'] font-bold text-[15px] tracking-[2px] uppercase text-slate-200">
                ROBOTIC_SYNC
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-[#3b82f6] font-mono text-[11px] font-bold tracking-[1.5px] uppercase">
                {targetArenaName || "ARENA DE DESAFIOS"}
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span title="Configurações" className="text-sm cursor-pointer hover:text-white">⚙</span>
              <span title="Sinal Ao Vivo" className="text-sm text-[#38bdf8] cursor-pointer">((•))</span>
              <span title="Perfil" className="text-sm cursor-pointer hover:text-white">👤</span>
            </div>
          </header>

          {/* ─── Main Content Container (Desafio Layout) ────────────────────── */}
          <div className="flex-1 max-w-[1680px] w-full mx-auto px-6 sm:px-10 lg:px-14 py-8 flex flex-col gap-7">
            {/* Title Section */}
            <div>
              <span className="text-[#d97706] font-mono text-[11px] font-bold tracking-[3px] uppercase block">
                TOURNAMENT ARENA
              </span>
              <h1 className="text-[36px] sm:text-[46px] font-black tracking-[-0.5px] text-white leading-none mt-2 uppercase">
                AVALIAÇÃO POR DESAFIO
              </h1>
            </div>

            {/* ─── Top 3 Podium Cards (02 | 01 | 03) ────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* 02 - Second Place */}
              <div className="rounded-[12px] bg-gradient-to-b from-[#062246] to-[#031329] border border-[#0d2e59] p-8 flex flex-col items-center justify-end text-center min-h-[235px]">
                <div className="text-[46px] font-black text-[#64748b] leading-none">02</div>
                <div className="text-[18px] font-bold text-white uppercase tracking-wider mt-2.5">
                  {(p2?.name || "CYBER_DYNE_A").toUpperCase().replace(/\s+/g, "_")}
                </div>
                <div className="text-[14px] font-semibold text-[#f59e0b] mt-1">
                  {p2Stats.anyRel ? `${p2Stats.points} pontos` : "0 pontos"}
                </div>
              </div>

              {/* 01 - First Place (Highlighted Center Card) */}
              <div className="rounded-[12px] bg-gradient-to-b from-[#063268] via-[#09438a] to-[#052958] border border-[#92400e]/90 shadow-[0_0_35px_rgba(14,116,144,0.3)] p-8 flex flex-col items-center justify-end text-center min-h-[250px] relative">
                <div className="my-auto pt-4">
                  <div className="text-[64px] font-black text-white leading-none drop-shadow-[0_0_16px_rgba(255,255,255,0.25)]">
                    01
                  </div>
                  <div className="text-[22px] font-black text-white uppercase tracking-wider mt-2">
                    {(p1?.name || "ROBOTECH_PRIME").toUpperCase().replace(/\s+/g, "_")}
                  </div>
                  <div className="text-[16px] font-bold text-[#f59e0b] mt-1">
                    {p1Stats.anyRel ? `${p1Stats.points} pontos` : "0 pontos"}
                  </div>
                </div>
              </div>

              {/* 03 - Third Place */}
              <div className="rounded-[12px] bg-gradient-to-b from-[#062246] to-[#031329] border border-[#0d2e59] p-8 flex flex-col items-center justify-end text-center min-h-[235px]">
                <div className="text-[46px] font-black text-[#64748b] leading-none">03</div>
                <div className="text-[18px] font-bold text-white uppercase tracking-wider mt-2.5">
                  {(p3?.name || "VOID_WALKER").toUpperCase().replace(/\s+/g, "_")}
                </div>
                <div className="text-[14px] font-semibold text-[#f59e0b] mt-1">
                  {p3Stats.anyRel ? `${p3Stats.points} pontos` : "0 pontos"}
                </div>
              </div>
            </div>

            {/* ─── TABELA DE CLASSIFICAÇÃO COMPLETA ─────────────────────────── */}
            <div className="rounded-[12px] bg-[#040f1e] border border-[#0c213b] overflow-hidden shadow-xl">
              <div className="px-7 py-5 border-b border-[#0c213b]">
                <span className="font-mono text-[13px] font-bold uppercase tracking-[2px] text-slate-300">
                  TABELA DE CLASSIFICAÇÃO COMPLETA
                </span>
              </div>

              {/* Table Columns Header */}
              <div className="grid grid-cols-12 px-10 py-4 border-b border-[#0c213b] text-[10px] font-mono font-bold uppercase tracking-[1.5px] text-slate-400">
                <div className="col-span-2 text-center">POS</div>
                <div className="col-span-3">EQUIPE / ROBÔ</div>
                <div className="col-span-3">INSTITUIÇÃO</div>
                <div className="col-span-2">TEMPO DE PARTIDA</div>
                <div className="col-span-2 text-right">PONTOS TOTAIS</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-[#0a1c33]">
                {individualRows.map((row, index) => {
                  const pos = String(index + 1).padStart(2, "0");
                  const stats = getVisibleChallengeStats(row);

                  return (
                    <div
                      key={row.id}
                      className="grid grid-cols-12 items-center px-10 py-5 hover:bg-[#07182e]/70 transition-colors"
                    >
                      {/* POS */}
                      <div className="col-span-2 text-center font-mono font-bold text-[15px] text-slate-200">
                        {pos}
                      </div>

                      {/* EQUIPE / ROBÔ */}
                      <div className="col-span-3 pr-4">
                        <div className="font-['Space_Grotesk'] font-bold text-[14px] text-white uppercase tracking-wide truncate">
                          {row.name.replace(/\s+/g, "-")}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                          {row.code || `RB-PROTO-${index + 1}`}
                        </div>
                      </div>

                      {/* INSTITUIÇÃO */}
                      <div className="col-span-3 text-[13px] text-slate-300 truncate pr-4">
                        {row.institution || "SENAC SP"}
                      </div>

                      {/* TEMPO DE PARTIDA */}
                      <div className="col-span-2 font-mono text-[14px] text-slate-200">
                        {stats.anyRel ? (
                          stats.time
                        ) : (
                          <span className="text-slate-500 text-xs">🔒 Aguardando</span>
                        )}
                      </div>

                      {/* PONTOS TOTAIS */}
                      <div className="col-span-2 text-right font-mono font-bold text-[15px] text-[#38bdf8]">
                        {stats.anyRel ? stats.points : 0}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {renderBottomNavigationFooter()}
        </div>
      );
    }

    if (projectionMode === "dancarino") {
      const formatDanceRound = (
        metric: string | null | undefined,
        pts: number | undefined,
        isRel: boolean | undefined
      ) => {
        if (!isRel) return "--";
        if (metric) {
          const numMatch = metric.match(/(\d+(?:\.\d+)?)/);
          if (numMatch) {
            return parseFloat(numMatch[1]).toFixed(1);
          }
        }
        if (pts && pts > 0) {
          return (pts / 10).toFixed(1);
        }
        return "--";
      };

      const getDanceTotalDisplay = (row: IndividualProjectionRow) => {
        const r1Rel = row.round1Released ?? row.released;
        const r2Rel = row.round2Released ?? row.released;
        const r3Rel = row.round3Released ?? row.released;
        const anyRel = Boolean(r1Rel || r2Rel || r3Rel);
        if (!anyRel) return "0.0";

        if (row.bestMetric) {
          const m = row.bestMetric.match(/(\d+(?:\.\d+)?)/);
          if (m) return parseFloat(m[1]).toFixed(1);
        }
        if (row.totalPoints && row.totalPoints > 0) {
          return row.totalPoints > 100
            ? (row.totalPoints / 10).toFixed(1)
            : row.totalPoints.toFixed(1);
        }
        return "0.0";
      };

      const sortedDanceRows = [...individualRows].sort((a, b) => {
        const scoreA = parseFloat(getDanceTotalDisplay(a)) || 0;
        const scoreB = parseFloat(getDanceTotalDisplay(b)) || 0;
        return scoreB - scoreA;
      });

      return (
        <div
          className="fixed inset-0 z-[99999] overflow-y-auto overflow-x-hidden flex flex-col select-none"
          style={{
            background: "#020b16",
            color: "#ffffff",
            fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {/* ─── Top Bar ─────────────────────────────────────────────────────── */}
          <header className="flex items-center justify-between px-8 py-3.5 border-b border-[#0d2238] bg-[#030d1a] shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-['Space_Grotesk'] font-bold text-[15px] tracking-[2px] uppercase text-slate-200">
                ROBOTIC_SYNC
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-[#3b82f6] font-mono text-[11px] font-bold tracking-[1.5px] uppercase">
                {targetArenaName || "ARENA DANÇARINO"}
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span title="Configurações" className="text-sm cursor-pointer hover:text-white">⚙</span>
              <span title="Sinal Ao Vivo" className="text-sm text-[#38bdf8] cursor-pointer">((•))</span>
              <span title="Perfil" className="text-sm cursor-pointer hover:text-white">👤</span>
            </div>
          </header>

          {/* ─── Main Content Container (Dançarino Layout) ──────────────────── */}
          <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 sm:px-10 lg:px-14 py-10 flex flex-col gap-8">
            {/* Title Section */}
            <div>
              <span className="text-[#d97706] font-mono text-[11px] font-bold tracking-[3px] uppercase block">
                TOURNAMENT ARENA
              </span>
              <h1 className="text-[44px] sm:text-[58px] font-black tracking-[-1px] text-white leading-none mt-1.5">
                Dançarino
              </h1>
            </div>

            {/* Table Column Header */}
            <div className="grid grid-cols-12 items-center px-8 py-2 text-[11px] font-mono font-bold uppercase tracking-[2px] text-[#94a3b8]">
              <div className="col-span-5 pl-14">EQUIPE / ROBÔ</div>
              <div className="col-span-2 text-center">ROUND 1</div>
              <div className="col-span-2 text-center">ROUND 2</div>
              <div className="col-span-1 text-center">ROUND 3</div>
              <div className="col-span-2 text-right">PONTUAÇÃO TÉCNICA</div>
            </div>

            {/* Stacked Horizontal Team Cards */}
            <div className="flex flex-col gap-4">
              {sortedDanceRows.map((row, index) => {
                const pos = String(index + 1).padStart(2, "0");
                const isFirst = index === 0;
                const r1Rel = row.round1Released ?? row.released;
                const r2Rel = row.round2Released ?? row.released;
                const r3Rel = row.round3Released ?? row.released;

                const r1Score = formatDanceRound(row.round1Metric, row.round1Points, r1Rel);
                const r2Score = formatDanceRound(row.round2Metric, row.round2Points, r2Rel);
                const r3Score = formatDanceRound(row.round3Metric, row.round3Points, r3Rel);
                const totalScore = getDanceTotalDisplay(row);

                return (
                  <div
                    key={row.id}
                    className={`grid grid-cols-12 items-center px-8 py-6 rounded-[12px] transition-all ${
                      isFirst
                        ? "bg-gradient-to-r from-[#073470] via-[#062b5d] to-[#041d40] border border-[#1d4ed8]/60 shadow-[0_8px_32px_rgba(7,52,112,0.45)]"
                        : "bg-[#051324] border border-[#0b213d] hover:bg-[#071930]"
                    }`}
                  >
                    {/* POS + EQUIPE / PROTOCOLO */}
                    <div className="col-span-5 flex items-center gap-6 pr-4">
                      <span
                        className={`font-['Space_Grotesk'] font-black text-[28px] sm:text-[32px] leading-none w-10 text-center ${
                          isFirst ? "text-[#f59e0b]" : "text-[#475569]"
                        }`}
                      >
                        {pos}
                      </span>

                      <div className="min-w-0">
                        <div className="font-['Space_Grotesk'] font-bold text-[18px] sm:text-[20px] text-white uppercase tracking-wide truncate">
                          {row.name}
                        </div>
                        <div
                          className={`font-mono text-[10px] uppercase tracking-[1.5px] mt-0.5 ${
                            isFirst ? "text-[#93c5fd]" : "text-[#64748b]"
                          }`}
                        >
                          PROTOCOLO: {row.code || `DN-${index + 1}`}
                        </div>
                      </div>
                    </div>

                    {/* ROUND 1 */}
                    <div className="col-span-2 text-center">
                      <span className="text-[9px] font-mono uppercase tracking-[1.5px] text-[#64748b] block mb-1">
                        R1
                      </span>
                      <span
                        className={`font-['Space_Grotesk'] font-bold text-[18px] ${
                          r1Score === "--" ? "text-[#475569]" : "text-white"
                        }`}
                      >
                        {r1Score}
                      </span>
                    </div>

                    {/* ROUND 2 */}
                    <div className="col-span-2 text-center">
                      <span className="text-[9px] font-mono uppercase tracking-[1.5px] text-[#64748b] block mb-1">
                        R2
                      </span>
                      <span
                        className={`font-['Space_Grotesk'] font-bold text-[18px] ${
                          r2Score === "--" ? "text-[#475569]" : "text-white"
                        }`}
                      >
                        {r2Score}
                      </span>
                    </div>

                    {/* ROUND 3 */}
                    <div className="col-span-1 text-center">
                      <span className="text-[9px] font-mono uppercase tracking-[1.5px] text-[#64748b] block mb-1">
                        R3
                      </span>
                      <span
                        className={`font-['Space_Grotesk'] font-bold text-[18px] ${
                          r3Score === "--" ? "text-[#475569]" : "text-white"
                        }`}
                      >
                        {r3Score}
                      </span>
                    </div>

                    {/* PONTUAÇÃO TÉCNICA */}
                    <div className="col-span-2 text-right">
                      <span
                        className={`font-['Space_Grotesk'] font-black leading-none ${
                          isFirst
                            ? "text-[34px] sm:text-[38px] text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                            : "text-[26px] sm:text-[30px] text-[#93c5fd]"
                        }`}
                      >
                        {totalScore}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {renderBottomNavigationFooter()}
        </div>
      );
    }

    const titleLabel =
      projectionMode === "tempo"
        ? "LINE FOLLOWER RANKING"
        : projectionMode === "dancarino"
        ? "ROBOT DANCE RANKING"
        : "CHALLENGE MISSION RANKING";
    const recordTime = formatProjectorMetric(p1?.bestMetric, "00:38.12");
    const recordTeam = p1?.name ? p1.name.toUpperCase() : "SPEED DEMONS";

    return (
      <div
        className="fixed inset-0 z-[99999] overflow-y-auto overflow-x-hidden flex flex-col justify-between select-none"
        style={{
          background: "#020b16",
          color: "#ffffff",
          fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* ─── Top Bar ─────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-8 py-3.5 border-b border-[#0d2238] bg-[#030d1a] shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-['Space_Grotesk'] font-bold text-[15px] tracking-[2px] uppercase text-slate-200">
              ROBOTIC_SYNC
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[#3b82f6] font-mono text-[11px] font-bold tracking-[1.5px] uppercase">
              {targetArenaName || "ARENA SEGUE LINHA"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span title="Configurações" className="text-sm cursor-pointer hover:text-white">⚙</span>
            <span title="Sinal Ao Vivo" className="text-sm text-[#38bdf8] cursor-pointer">((•))</span>
            <span title="Perfil" className="text-sm cursor-pointer hover:text-white">👤</span>
          </div>
        </header>

        {/* ─── Main Content Container ──────────────────────────────────────── */}
        <div className="flex-1 max-w-[1680px] w-full mx-auto px-6 sm:px-10 lg:px-14 py-8 flex flex-col gap-7">
          {/* Subheader Title + Live Tracking Pill */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[#f59e0b] font-mono text-[13px] font-bold tracking-[3px] uppercase block">
                CLASSIFICAÇÃO EM TEMPO REAL
              </span>
              <h1 className="text-[40px] sm:text-[52px] lg:text-[58px] font-black tracking-[-0.5px] text-white leading-none mt-1.5 uppercase">
                {titleLabel}
              </h1>
            </div>

            <div className="bg-[#09192b] border border-[#173252] rounded-[10px] px-5 py-3 flex flex-col items-end">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-[1.5px]">
                STATUS DA ARENA
              </span>
              <div className="flex items-center gap-2 text-[#4ade80] font-mono font-bold text-[14px] tracking-wider uppercase mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80] animate-pulse" />
                <span>LIVE TRACKING</span>
              </div>
            </div>
          </div>

          {/* ─── Top 3 Podium Cards (02 | 01 | 03) ────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* 02 - Second Place */}
            <div className="rounded-[14px] bg-gradient-to-b from-[#062246] to-[#04152d] border border-[#0f3463] p-8 flex flex-col items-center justify-end text-center min-h-[220px]">
              <div className="text-[48px] font-black text-[#64748b] leading-none">02</div>
              <div className="text-[20px] font-bold text-white uppercase tracking-wider mt-3">
                {(p2?.name || "TURBO CODERS").toUpperCase().replace(/\s+/g, "_")}
              </div>
              <div className="text-[16px] font-mono font-bold text-[#f59e0b] mt-1.5">
                {formatProjectorMetric(p2?.bestMetric, "32.85s")}
              </div>
            </div>

            {/* 01 - First Place (Highlighted Center Card with Gold Ribbon Icon) */}
            <div className="rounded-[14px] bg-gradient-to-br from-[#07336b] via-[#0a448f] to-[#062857] border-2 border-[#b45309]/80 shadow-[0_0_35px_rgba(14,116,144,0.35)] p-8 flex flex-col items-center justify-between text-center min-h-[244px] relative">
              <div className="w-full flex justify-start">
                <span className="text-[#f59e0b] text-3xl" title="Líder Oficial">
                  🎖️
                </span>
              </div>
              <div className="my-auto">
                <div className="text-[64px] font-black text-white leading-none">01</div>
                <div className="text-[22px] font-black text-white uppercase tracking-wider mt-2">
                  {(p1?.name || "SPEED DEMONS").toUpperCase().replace(/\s+/g, "_")}
                </div>
                <div className="text-[18px] font-mono font-bold text-[#f59e0b] mt-1.5">
                  {formatProjectorMetric(p1?.bestMetric, "38.12s")}
                </div>
              </div>
            </div>

            {/* 03 - Third Place */}
            <div className="rounded-[14px] bg-gradient-to-b from-[#062246] to-[#04152d] border border-[#0f3463] p-8 flex flex-col items-center justify-end text-center min-h-[220px]">
              <div className="text-[48px] font-black text-[#64748b] leading-none">03</div>
              <div className="text-[20px] font-bold text-white uppercase tracking-wider mt-3">
                {(p3?.name || "NITRO BOTS").toUpperCase().replace(/\s+/g, "_")}
              </div>
              <div className="text-[16px] font-mono font-bold text-[#f59e0b] mt-1.5">
                {formatProjectorMetric(p3?.bestMetric, "44.10s")}
              </div>
            </div>
          </div>

          {/* ─── Orange Banner: RECORDISTA ATUAL ──────────────────────────── */}
          <div
            className="rounded-[14px] px-8 py-5 flex items-center justify-between shadow-lg"
            style={{
              background: "linear-gradient(90deg, #f59e0b 0%, #fb923c 50%, #f59e0b 100%)",
              color: "#051d30",
            }}
          >
            <div>
              <span className="text-[12px] font-mono font-black uppercase tracking-[2px] block text-[#051d30]/80">
                RECORDISTA ATUAL
              </span>
              <div className="text-[38px] font-mono font-black leading-tight text-[#051d30]">
                {recordTime.includes(":") ? recordTime : `00:${recordTime.replace("s", "")}`}
              </div>
              <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#051d30]/80 block mt-0.5">
                EQUIPE: {recordTeam.replace(/\s+/g, "-")}
              </span>
            </div>

            <div className="text-4xl text-[#051d30]">🎖️</div>
          </div>

          {/* ─── Ranking Table (RANK | TEAM NAME | ROUND 1 | ROUND 2 | ROUND 3 | FINAL SCORE) ─ */}
          <div className="rounded-[14px] bg-[#081729] border border-[#122b49] overflow-hidden shadow-xl">
            <div className="grid grid-cols-12 px-8 py-4.5 border-b border-[#122b49] text-[13px] font-mono font-bold uppercase tracking-[1.5px] text-slate-400">
              <div className="col-span-1">RANK</div>
              <div className="col-span-4">TEAM NAME</div>
              <div className="col-span-2 text-center">ROUND 1</div>
              <div className="col-span-2 text-center">ROUND 2</div>
              <div className="col-span-1 text-center">ROUND 3</div>
              <div className="col-span-2 text-right text-[#f59e0b]">FINAL SCORE</div>
            </div>

            <div className="divide-y divide-[#11243e]">
              {individualRows.map((row, index) => {
                const pos = index + 1;
                const isFirst = pos === 1;
                const r1Rel = row.round1Released ?? row.released;
                const r2Rel = row.round2Released ?? row.released;
                const r3Rel = row.round3Released ?? row.released;
                const anyReleased = Boolean(r1Rel || r2Rel || r3Rel);
                const rawVisibleFinalScore =
                  (r3Rel && row.round3Metric) ||
                  (r2Rel && row.round2Metric) ||
                  (r1Rel && row.round1Metric) ||
                  row.bestMetric;
                const visibleFinalScore = formatProjectorMetric(rawVisibleFinalScore, "00:00.00");

                return (
                  <div
                    key={row.id}
                    className={`grid grid-cols-12 items-center px-8 py-5 transition-colors ${
                      isFirst ? "bg-[#0a213d]/90" : "hover:bg-[#0b1d35]/60"
                    }`}
                  >
                    {/* RANK */}
                    <div className="col-span-1">
                      <span
                        className={`font-mono font-black text-[20px] ${
                          isFirst ? "text-[#f59e0b]" : "text-slate-400"
                        }`}
                      >
                        #{pos}
                      </span>
                    </div>

                    {/* TEAM NAME */}
                    <div className="col-span-4 font-['Space_Grotesk'] font-bold text-[19px] text-white uppercase tracking-wide truncate pr-3">
                      {row.name.replace(/\s+/g, "_")}
                    </div>

                    {/* ROUND 1 */}
                    <div className="col-span-2 text-center font-mono text-[17px] text-slate-200">
                      {r1Rel && row.round1Metric ? (
                        formatProjectorMetric(row.round1Metric)
                      ) : (
                        <span className="text-slate-400 text-base" title="Round 1 Oculto / Aguardando Liberação">
                          🔒
                        </span>
                      )}
                    </div>

                    {/* ROUND 2 */}
                    <div
                      className={`col-span-2 text-center font-mono text-[17px] ${
                        isFirst ? "font-bold text-white" : "text-slate-200"
                      }`}
                    >
                      {r2Rel && row.round2Metric ? (
                        formatProjectorMetric(row.round2Metric)
                      ) : (
                        <span className="text-slate-400 text-base" title="Round 2 Oculto / Aguardando Liberação">
                          🔒
                        </span>
                      )}
                    </div>

                    {/* ROUND 3 */}
                    <div className="col-span-1 text-center font-mono text-[17px] font-bold text-white">
                      {r3Rel && row.round3Metric ? (
                        formatProjectorMetric(row.round3Metric)
                      ) : (
                        <span className="text-slate-400 text-base" title="Round 3 Oculto / Aguardando Liberação">
                          🔒
                        </span>
                      )}
                    </div>

                    {/* FINAL SCORE */}
                    <div className="col-span-2 flex justify-end">
                      {anyReleased ? (
                        <span className="font-mono font-bold text-[19px] text-white">
                          {visibleFinalScore}
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-2 text-[11px] font-mono text-slate-400 uppercase tracking-wider text-right">
                          <span className="text-sm">🔒</span>
                          <span className="leading-tight">
                            AGUARDANDO
                            <br />
                            LIBERAÇÃO DO JUIZ
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Bottom Countdown Bar: PRÓXIMO ROUND EM ───────────────────── */}
          <div className="rounded-[14px] bg-[#040d1a] border border-[#0f233d] px-8 py-5 flex items-center gap-5">
            <div className="w-14 h-14 rounded-[10px] bg-[#091e3a] border border-[#1d4ed8]/40 flex items-center justify-center text-[#3b82f6] text-2xl">
              ⏱
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-[2px] text-slate-400 block">
                PRÓXIMO ROUND EM
              </span>
              <span className="text-[32px] font-mono font-black text-white leading-none mt-1 block">
                {formatTime(liveTimer)}
              </span>
            </div>
          </div>
        </div>

        {renderBottomNavigationFooter()}
      </div>
    );
  }

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
            {targetArenaName || "ARENA SUMÔ OFICIAL"}
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

      {/* ─── Bottom Modalidades Tab Bar (Presente em todas as telas do Telão) ─── */}
      {renderBottomNavigationFooter()}
    </div>
  );
}
