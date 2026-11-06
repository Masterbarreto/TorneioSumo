import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import { BracketMatch, SumoTournamentState } from "./ProjectionReceiver";
import { API_BASE_URL } from "./config/api";
import ScoringEngineHub, { EvaluationModality } from "./ScoringEngineHub";

interface ArenaOption {
  id: string;
  name: string;
  description: string;
  status: string;
  capacity?: number;
  image?: string;
  evaluationType: EvaluationModality;
  teams: { id: string; name: string; institution?: string; status?: string }[];
  challenges?: { id: string; name: string; description: string; maxPoints: number }[];
}

const EVAL_SHORT_LABELS: Record<EvaluationModality, string> = {
  desafio: "Por Desafio",
  tempo: "Por Tempo",
  confronto: "Por Confronto",
  dancarino: "Dançarino",
};

const ARENA_STATUS_COLORS: Record<string, string> = {
  Ativa: "bg-green-100 text-green-700 border-green-200",
  Inativa: "bg-slate-100 text-slate-600 border-slate-200",
  Manutenção: "bg-amber-100 text-amber-700 border-amber-200",
};

const ARENA_STATUS_DOT: Record<string, string> = {
  Ativa: "bg-green-500",
  Inativa: "bg-slate-400",
  Manutenção: "bg-amber-500",
};

const EVAL_TYPE_META: Record<
  EvaluationModality,
  { label: string; icon: string; badgeClass: string; buttonText: string }
> = {
  confronto: {
    label: "Avaliação por Confronto",
    icon: "⚔️",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    buttonText: "Acessar Chaves →",
  },
  desafio: {
    label: "Avaliação por Desafio",
    icon: "🧩",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
    buttonText: "Avaliar Desafios →",
  },
  tempo: {
    label: "Avaliação por Tempo",
    icon: "⏱️",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
    buttonText: "Avaliar Tempo →",
  },
  dancarino: {
    label: "Avaliação Dançarino",
    icon: "🎵",
    badgeClass: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
    buttonText: "Súmula Artística →",
  },
};

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
  activeMenu = "rules",
}: {
  onNavigate?: (key: string) => void; //Resolver questão de undefined - diferença entre obrigatório e opcional
  onLogout?: () => void;
  activeMenu?: "partidas" | "rules";
}) {
  // Step state: 1 = Arena Selection Hub, 2 = Gerenciamento Oficial de Partidas & Transmissão (Confronto), 3 = Robot Sumô Console (Confronto), 4 = Console Exclusivo (Desafio / Tempo / Dançarino)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [arenasList, setArenasList] = useState<ArenaOption[]>([]);
  const [selectedArena, setSelectedArena] = useState<ArenaOption | null>(null);
  const [filterEvalType, setFilterEvalType] = useState<"ALL" | EvaluationModality>("ALL");

  // Backend / MongoDB Data
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDENTE" | "EM ANDAMENTO" | "CONCLUÍDO">("ALL");
  const [activePhaseTab, setActivePhaseTab] = useState<"ALL" | "OITAVAS" | "QUARTAS" | "SEMIFINAL" | "FINAL">("ALL");
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

  // Fetch Real Arenas from MongoDB Atlas API
  const fetchArenasFromApi = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/arenas`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mappedArenas: ArenaOption[] = data.map((a: any) => ({
            id: a.id || a._id,
            name: a.name,
            description: a.description || "",
            status: a.status || "Ativa",
            capacity: Number(a.capacity) || 32,
            image: a.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
            evaluationType: (a.evaluationType || a.tipoAvaliacao || "desafio") as EvaluationModality,
            teams: Array.isArray(a.teams) ? a.teams : [],
            challenges: Array.isArray(a.challenges) ? a.challenges : [],
          }));
          setArenasList(mappedArenas);

          // Hydrate individualTeamsMap from real MongoDB team records when available
          setIndividualTeamsMap((prev) => {
            const nextMap = { ...prev };
            for (const ar of mappedArenas) {
              if (ar.evaluationType !== "confronto" && ar.teams.length > 0) {
                const hasRealScoresInDb = ar.teams.some(
                  (t: any) => t.round1Metric || t.round2Metric || t.round3Metric || t.totalPoints !== undefined
                );
                if (hasRealScoresInDb && !nextMap[ar.id]) {
                  nextMap[ar.id] = buildDefaultIndividualRows(ar);
                }
              }
            }
            return nextMap;
          });
        }
      }
    } catch (e) {
      console.error("Erro ao carregar arenas na avaliação:", e);
    }
  };

  useEffect(() => {
    fetchMatchesFromApi();
    fetchArenasFromApi();

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

  // 🔀 SORTEIO AUTOMÁTICO: Resets and shuffles in MongoDB Atlas or shuffles custom arena teams!
  const handleSorteioAutomatico = async () => {
    if (selectedArena && !isDefaultSumoArena) {
      const teams = [...(selectedArena.teams || [])];
      if (teams.length === 0) {
        setToastMessage("Nenhuma equipe cadastrada nesta arena para sortear.");
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }
      // Fisher-Yates shuffle
      for (let i = teams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [teams[i], teams[j]] = [teams[j], teams[i]];
      }
      const shuffledArena: ArenaOption = { ...selectedArena, teams };
      const shuffledMatches = buildDynamicArenaMatches(shuffledArena);
      setDynamicArenaMatchesMap((prev) => ({
        ...prev,
        [selectedArena.id]: shuffledMatches,
      }));
      setToastMessage(`Sorteio automático concluído com ${teams.length} equipes de ${selectedArena.name}!`);
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
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

      if (selectedArena && !isDefaultSumoArena) {
        setDynamicArenaMatchesMap((prev) => {
          const current = prev[selectedArena.id] || buildDynamicArenaMatches(selectedArena);
          const next = current.map((m) =>
            m.id === selectedMatch.id || m.code === selectedMatch.code
              ? {
                  ...m,
                  status: "COMPLETED" as const,
                  winner: winningTeam as "teamA" | "teamB",
                  round1Winner,
                  round2Winner,
                  round3Winner,
                  round1Duration: round1Duration || 60,
                  round2Duration: round2Duration || 60,
                  round3Duration: round3Duration || null,
                }
              : m
          );
          return { ...prev, [selectedArena.id]: next };
        });
        setToastMessage(`Resultado confirmado! Vencedor da partida: ${winnerName} (promovido na chave).`);
        setTimeout(() => {
          setToastMessage(null);
          setStep(2);
        }, 2500);
        return;
      }

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

  const [dynamicArenaMatchesMap, setDynamicArenaMatchesMap] = useState<Record<string, MatchData[]>>({});

  interface IndividualTeamRow {
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
    splitsByRound?: Record<number, string[]>;
    foulsByRound?: Record<number, number>;
    retriesByRound?: Record<number, number>;
    observationsByRound?: Record<number, string>;
  }

  const [individualTeamsMap, setIndividualTeamsMap] = useState<Record<string, IndividualTeamRow[]>>(() => {
    try {
      const saved = localStorage.getItem("robotic_individual_arenas_state");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });
  const [activeRoundTab, setActiveRoundTab] = useState<"ALL" | "R1" | "R2" | "R3">("ALL");
  const [selectedIndividualTeamId, setSelectedIndividualTeamId] = useState<string | null>(null);
  const [selectedIndividualRound, setSelectedIndividualRound] = useState<1 | 2 | 3>(1);

  const persistAndBroadcastIndividual = (
    nextMap: Record<string, IndividualTeamRow[]>,
    arenaToSync?: ArenaOption | null
  ) => {
    try {
      localStorage.setItem("robotic_individual_arenas_state", JSON.stringify(nextMap));
      const ch = new BroadcastChannel("robotic_proj");
      ch.postMessage({ type: "INDIVIDUAL_ARENA_SYNC", individualMap: nextMap, timestamp: Date.now() });
      setTimeout(() => ch.close(), 100);
    } catch {}

    const targetArena = arenaToSync ?? selectedArena;
    if (targetArena && nextMap[targetArena.id]) {
      const rows = nextMap[targetArena.id];
      const mergedTeams = rows.map((r) => {
        const orig = (targetArena.teams || []).find((t) => t.id === r.id) || {};
        return {
          ...orig,
          id: r.id,
          code: r.code,
          name: r.name,
          institution: r.institution,
          status: orig.status || "Aprovado",
          evalStatus: r.status,
          released: r.released,
          round1Released: r.round1Released,
          round2Released: r.round2Released,
          round3Released: r.round3Released,
          round1Metric: r.round1Metric,
          round2Metric: r.round2Metric,
          round3Metric: r.round3Metric,
          round1Points: r.round1Points,
          round2Points: r.round2Points,
          round3Points: r.round3Points,
          totalPoints: r.totalPoints,
          bestMetric: r.bestMetric,
          splitsByRound: r.splitsByRound || {},
          foulsByRound: r.foulsByRound || {},
          retriesByRound: r.retriesByRound || {},
          observationsByRound: r.observationsByRound || {},
        };
      });
      fetch(`${API_BASE_URL}/api/v1/arenas/${targetArena.id}/teams`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: mergedTeams }),
      }).catch(() => {});
    }
  };

  const buildDefaultIndividualRows = (arena: ArenaOption): IndividualTeamRow[] => {
    const tList = arena.teams || [];
    const defaultMetric =
      arena.evaluationType === "dancarino"
        ? "Nota -- / 10"
        : arena.evaluationType === "desafio"
        ? "0/3 Missões"
        : "--:--.--";
    // Pre-seed realistic initial round times/scores for Tempo / Desafio / Dançarino so the telão & cards look rich immediately
    const sampleTempoR1 = ["39.40s", "30.00s", "44.50s", "46.80s", "52.10s", "54.20s"];
    const sampleTempoR2 = ["38.12s", "32.85s", "44.10s", "47.20s", "50.88s", "53.05s"];
    const sampleTempoR3 = ["38.12s", "31.12s", null, null, null, null];
    const sampleTempoBest = ["38.12s", "31.12s", "44.10s", "46.80s", "50.88s", "53.05s"];
    const samplePts = [950, 910, 860, 820, 780, 740];

    return tList.map((t: any, idx) => {
      if (t.round1Metric !== undefined || t.round2Metric !== undefined || t.totalPoints !== undefined) {
        return {
          id: t.id || `tm-${idx + 1}`,
          code: t.code || `EQ-${String(idx + 1).padStart(3, "0")}`,
          name: t.name,
          institution: t.institution || "SENAC",
          status: t.evalStatus || (t.round3Metric ? "CONCLUÍDO" : t.round1Metric || t.round2Metric ? "EM ANDAMENTO" : "PENDENTE"),
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
          bestMetric: t.bestMetric || t.round2Metric || t.round1Metric || defaultMetric,
          splitsByRound: t.splitsByRound || {},
          foulsByRound: t.foulsByRound || {},
          retriesByRound: t.retriesByRound || {},
          observationsByRound: t.observationsByRound || {},
        };
      }
      if (arena.evaluationType === "tempo") {
        const r1 = sampleTempoR1[idx] || "45.00s";
        const r2 = sampleTempoR2[idx] || "44.20s";
        const r3 = sampleTempoR3[idx] ?? null;
        const best = sampleTempoBest[idx] || r2;
        const pts = samplePts[idx] || 700;
        const isRel = idx < 2;
        return {
          id: t.id || `tm-${idx + 1}`,
          code: `EQ-${String(idx + 1).padStart(3, "0")}`,
          name: t.name,
          institution: t.institution || "SENAC",
          status: r3 ? "CONCLUÍDO" : "EM ANDAMENTO",
          released: isRel,
          round1Released: isRel,
          round2Released: isRel,
          round3Released: isRel,
          round1Metric: r1,
          round2Metric: r2,
          round3Metric: r3,
          round1Points: pts - 20,
          round2Points: pts,
          round3Points: r3 ? pts + 15 : 0,
          totalPoints: r3 ? pts + 15 : pts,
          bestMetric: best,
          splitsByRound: {},
          foulsByRound: {},
          retriesByRound: {},
          observationsByRound: {},
        };
      }
      return {
        id: t.id || `tm-${idx + 1}`,
        code: `EQ-${String(idx + 1).padStart(3, "0")}`,
        name: t.name,
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
        bestMetric: defaultMetric,
        splitsByRound: {},
        foulsByRound: {},
        retriesByRound: {},
        observationsByRound: {},
      };
    });
  };

  const activeIndividualRows: IndividualTeamRow[] =
    selectedArena && selectedArena.evaluationType !== "confronto"
      ? individualTeamsMap[selectedArena.id] ?? buildDefaultIndividualRows(selectedArena)
      : [];

  const toggleReleaseIndividualTeam = (teamId: string) => {
    if (!selectedArena) return;
    setIndividualTeamsMap((prev) => {
      const current = prev[selectedArena.id] ?? buildDefaultIndividualRows(selectedArena);
      const next = current.map((row) => {
        if (row.id !== teamId) return row;
        const r1Rel = row.round1Released ?? row.released;
        const r2Rel = row.round2Released ?? row.released;
        const r3Rel = row.round3Released ?? row.released;
        const allRel = r1Rel && r2Rel && r3Rel;
        const nextVal = !allRel;
        return {
          ...row,
          released: nextVal,
          round1Released: nextVal,
          round2Released: nextVal,
          round3Released: nextVal,
        };
      });
      const updatedMap = { ...prev, [selectedArena.id]: next };
      persistAndBroadcastIndividual(updatedMap);
      return updatedMap;
    });
    setToastMessage("Status de todos os rounds da equipe no Telão atualizado!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleReleaseIndividualRound = (teamId: string, roundNum: 1 | 2 | 3) => {
    if (!selectedArena) return;
    setIndividualTeamsMap((prev) => {
      const current = prev[selectedArena.id] ?? buildDefaultIndividualRows(selectedArena);
      const next = current.map((row) => {
        if (row.id !== teamId) return row;
        const curR1 = row.round1Released ?? row.released;
        const curR2 = row.round2Released ?? row.released;
        const curR3 = row.round3Released ?? row.released;
        const nextR1 = roundNum === 1 ? !curR1 : curR1;
        const nextR2 = roundNum === 2 ? !curR2 : curR2;
        const nextR3 = roundNum === 3 ? !curR3 : curR3;
        return {
          ...row,
          round1Released: nextR1,
          round2Released: nextR2,
          round3Released: nextR3,
          released: Boolean(nextR1 || nextR2 || nextR3),
        };
      });
      const updatedMap = { ...prev, [selectedArena.id]: next };
      persistAndBroadcastIndividual(updatedMap);
      return updatedMap;
    });
    setToastMessage(`Round 0${roundNum} atualizado no Telão!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveIndividualRoundResult = (
    teamId: string,
    roundNum: 1 | 2 | 3,
    metric: string,
    points: number,
    details?: {
      splits?: string[];
      fouls?: number;
      retries?: number;
      observations?: string;
    }
  ) => {
    if (!selectedArena) return;
    setIndividualTeamsMap((prev) => {
      const current = prev[selectedArena.id] ?? buildDefaultIndividualRows(selectedArena);
      const next = current
        .map((row) => {
          if (row.id !== teamId) return row;
          const r1M = roundNum === 1 ? metric : row.round1Metric;
          const r2M = roundNum === 2 ? metric : row.round2Metric;
          const r3M = roundNum === 3 ? metric : row.round3Metric;
          const r1P = roundNum === 1 ? points : row.round1Points;
          const r2P = roundNum === 2 ? points : row.round2Points;
          const r3P = roundNum === 3 ? points : row.round3Points;
          const maxPts = Math.max(r1P, r2P, r3P);
          const bestM =
            maxPts === r3P && r3M
              ? r3M
              : maxPts === r2P && r2M
              ? r2M
              : maxPts === r1P && r1M
              ? r1M
              : metric;
          const allDone = Boolean(r1M && r2M && r3M);
          const nextSplits = { ...(row.splitsByRound || {}) };
          if (details?.splits) nextSplits[roundNum] = details.splits;
          const nextFouls = { ...(row.foulsByRound || {}) };
          if (details?.fouls !== undefined) nextFouls[roundNum] = details.fouls;
          const nextRetries = { ...(row.retriesByRound || {}) };
          if (details?.retries !== undefined) nextRetries[roundNum] = details.retries;
          const nextObs = { ...(row.observationsByRound || {}) };
          if (details?.observations !== undefined) nextObs[roundNum] = details.observations;

          return {
            ...row,
            round1Metric: r1M,
            round2Metric: r2M,
            round3Metric: r3M,
            round1Points: r1P,
            round2Points: r2P,
            round3Points: r3P,
            totalPoints: maxPts,
            bestMetric: bestM,
            splitsByRound: nextSplits,
            foulsByRound: nextFouls,
            retriesByRound: nextRetries,
            observationsByRound: nextObs,
            status: (allDone ? "CONCLUÍDO" : "EM ANDAMENTO") as "CONCLUÍDO" | "EM ANDAMENTO",
          };
        })
        .sort((a, b) => b.totalPoints - a.totalPoints);
      const updatedMap = { ...prev, [selectedArena.id]: next };
      persistAndBroadcastIndividual(updatedMap, selectedArena);
      return updatedMap;
    });
  };

  // Liberar / Bloquear resultado individual no MongoDB Atlas ou local da arena
  const toggleReleaseMatch = async (matchId: string) => {
    if (selectedArena && !isDefaultSumoArena) {
      setDynamicArenaMatchesMap((prev) => {
        const current = prev[selectedArena.id] || buildDynamicArenaMatches(selectedArena);
        const next = current.map((x) =>
          x.id === matchId || x.code === matchId ? { ...x, released: !x.released } : x
        );
        return { ...prev, [selectedArena.id]: next };
      });
      setToastMessage("Status de exibição no Telão atualizado!");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const m = matches.find((x) => x.id === matchId || x.code === matchId);
    if (!m) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/partidas/${matchId}/release`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ released: !m.released }),
      });
      if (res.ok) {
        await fetchMatchesFromApi();
        broadcastSync();
        setToastMessage(
          !m.released
            ? `Resultado de ${m.code} (${m.teamA.name} x ${m.teamB.name}) LIBERADO para o Telão!`
            : `Resultado de ${m.code} bloqueado do Telão.`
        );
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (e) {
      setToastMessage("Erro ao atualizar exibição no servidor.");
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Liberar todos os resultados no MongoDB Atlas ou local da arena
  const releaseAllResults = async () => {
    if (selectedArena && selectedArena.evaluationType !== "confronto") {
      setIndividualTeamsMap((prev) => {
        const current = prev[selectedArena.id] ?? buildDefaultIndividualRows(selectedArena);
        const updatedMap = {
          ...prev,
          [selectedArena.id]: current.map((row) => {
            const curR1 = row.round1Released ?? row.released;
            const curR2 = row.round2Released ?? row.released;
            const curR3 = row.round3Released ?? row.released;
            const nextR1 = activeRoundTab === "ALL" || activeRoundTab === "R1" ? true : curR1;
            const nextR2 = activeRoundTab === "ALL" || activeRoundTab === "R2" ? true : curR2;
            const nextR3 = activeRoundTab === "ALL" || activeRoundTab === "R3" ? true : curR3;
            return {
              ...row,
              round1Released: nextR1,
              round2Released: nextR2,
              round3Released: nextR3,
              released: Boolean(nextR1 || nextR2 || nextR3),
            };
          }),
        };
        persistAndBroadcastIndividual(updatedMap);
        return updatedMap;
      });
      setToastMessage(
        activeRoundTab === "ALL"
          ? `Todos os resultados de ${selectedArena.name} liberados para o Telão!`
          : `Resultados do ${activeRoundTab} de ${selectedArena.name} liberados para o Telão!`
      );
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    if (selectedArena && !isDefaultSumoArena) {
      setDynamicArenaMatchesMap((prev) => {
        const current = prev[selectedArena.id] || buildDynamicArenaMatches(selectedArena);
        return { ...prev, [selectedArena.id]: current.map((x) => ({ ...x, released: true })) };
      });
      setToastMessage(`Todos os resultados de ${selectedArena.name} liberados para o Telão!`);
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/partidas/release-all`, { method: "POST" });
      if (res.ok) {
        await fetchMatchesFromApi();
        broadcastSync();
        setToastMessage("100% dos resultados de Sumô liberados para o Telão!");
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (e) {
      setToastMessage("Erro ao liberar resultados no servidor.");
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Ocultar todos os resultados no MongoDB Atlas ou local da arena
  const hideAllResults = async () => {
    if (selectedArena && selectedArena.evaluationType !== "confronto") {
      setIndividualTeamsMap((prev) => {
        const current = prev[selectedArena.id] ?? buildDefaultIndividualRows(selectedArena);
        const updatedMap = {
          ...prev,
          [selectedArena.id]: current.map((row) => {
            const curR1 = row.round1Released ?? row.released;
            const curR2 = row.round2Released ?? row.released;
            const curR3 = row.round3Released ?? row.released;
            const nextR1 = activeRoundTab === "ALL" || activeRoundTab === "R1" ? false : curR1;
            const nextR2 = activeRoundTab === "ALL" || activeRoundTab === "R2" ? false : curR2;
            const nextR3 = activeRoundTab === "ALL" || activeRoundTab === "R3" ? false : curR3;
            return {
              ...row,
              round1Released: nextR1,
              round2Released: nextR2,
              round3Released: nextR3,
              released: Boolean(nextR1 || nextR2 || nextR3),
            };
          }),
        };
        persistAndBroadcastIndividual(updatedMap);
        return updatedMap;
      });
      setToastMessage(
        activeRoundTab === "ALL"
          ? `Resultados de ${selectedArena.name} ocultados do Telão.`
          : `Resultados do ${activeRoundTab} de ${selectedArena.name} ocultados do Telão.`
      );
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    if (selectedArena && !isDefaultSumoArena) {
      setDynamicArenaMatchesMap((prev) => {
        const current = prev[selectedArena.id] || buildDynamicArenaMatches(selectedArena);
        return { ...prev, [selectedArena.id]: current.map((x) => ({ ...x, released: false })) };
      });
      setToastMessage(`Resultados de ${selectedArena.name} ocultados do Telão.`);
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/partidas/hide-all`, { method: "POST" });
      if (res.ok) {
        await fetchMatchesFromApi();
        broadcastSync();
        setToastMessage("Todos os resultados de Sumô foram ocultados do Telão.");
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (e) {
      setToastMessage("Erro ao ocultar resultados no servidor.");
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Definir vencedor rápido de um confronto no MongoDB Atlas (com cascata de avanço)
  const setWinner = async (matchId: string, winningTeam: 1 | 2) => {
    if (selectedArena && !isDefaultSumoArena) {
      setDynamicArenaMatchesMap((prev) => {
        const current = prev[selectedArena.id] || buildDynamicArenaMatches(selectedArena);
        const next = current.map((x) => {
          if (x.id !== matchId && x.code !== matchId) return x;
          const winnerId = winningTeam === 1 ? x.teamA.id : x.teamB.id;
          return {
            ...x,
            status: "CONCLUÍDO" as const,
            released: true,
            winnerId,
            teamA: { ...x.teamA, score: winningTeam === 1 ? 2 : 0 },
            teamB: { ...x.teamB, score: winningTeam === 2 ? 2 : 0 },
          };
        });
        return { ...prev, [selectedArena.id]: next };
      });
      setToastMessage("Vitória registrada na chave da arena!");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/partidas/${matchId}/winner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winningTeam }),
      });
      if (res.ok) {
        const data = await res.json();
        await fetchMatchesFromApi();
        broadcastSync();
        setToastMessage(data.message || "Vitória gravada no MongoDB e promovida na chave!");
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (e) {
      setToastMessage("Erro ao gravar vitória no servidor.");
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Open Projection Window (?proj=1 or ?proj=1/<Tipo>/<arenaSlug>)
  const openProjectionWindow = () => {
    broadcastSync();
    if (selectedArena) {
      if (selectedArena.evaluationType !== "confronto") {
        const currentRows = individualTeamsMap[selectedArena.id] ?? buildDefaultIndividualRows(selectedArena);
        persistAndBroadcastIndividual({ ...individualTeamsMap, [selectedArena.id]: currentRows });
      }
      const typeLabelMap: Record<EvaluationModality, string> = {
        tempo: "Tempo",
        desafio: "Desafio",
        dancarino: "Dancarino",
        confronto: "Confronto",
      };
      const typeSegment = typeLabelMap[selectedArena.evaluationType] || "Tempo";
      const slug = toArenaSlug(selectedArena.name) || selectedArena.id;
      if (selectedArena.evaluationType !== "confronto") {
        window.open(`/partidas?proj=1/${typeSegment}/${slug}`, "_blank");
        return;
      }
    }
    window.open("/partidas?proj=1", "_blank");
  };

  // Slug helper for URL routing (e.g. /rules/arena-sumo-2)
  const toArenaSlug = (name: string) =>
    (name || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // Build dynamic bracket matches when a Confronto arena has custom registered teams
  const buildDynamicArenaMatches = (arena: ArenaOption): MatchData[] => {
    const tList = arena.teams || [];
    if (tList.length === 0) return [];
    const pairCount = Math.ceil(tList.length / 2);
    const phaseLabel: "OITAVAS" | "QUARTAS" | "SEMIFINAL" | "FINAL" =
      pairCount > 4 ? "OITAVAS" : pairCount > 2 ? "QUARTAS" : pairCount > 1 ? "SEMIFINAL" : "FINAL";

    const list: MatchData[] = [];
    for (let i = 0; i < pairCount; i++) {
      const tA = tList[i * 2];
      const tB = tList[i * 2 + 1];
      const code = `MCH-${String(i + 1).padStart(3, "0")}`;
      list.push({
        id: `${arena.id}-${code}`,
        code,
        phase: phaseLabel,
        position: i + 1,
        status: "PENDENTE",
        released: false,
        winnerId: null,
        teamA: {
          id: tA?.id || `teamA-${i}`,
          name: tA?.name || "AGUARDANDO...",
          code: `#EQ-${String(i * 2 + 1).padStart(2, "0")}`,
          robot: tA?.institution || "Robô de Combate",
          colorCorner: "red",
          seed: `A${i + 1}`,
          score: 0,
          status: tA?.status || "APROVADO",
        },
        teamB: {
          id: tB?.id || `teamB-${i}`,
          name: tB?.name || "AGUARDANDO...",
          code: `#EQ-${String(i * 2 + 2).padStart(2, "0")}`,
          robot: tB?.institution || "Robô de Combate",
          colorCorner: "blue",
          seed: `B${i + 1}`,
          score: 0,
          status: tB?.status || "APROVADO",
        },
        round1Winner: null,
        round2Winner: null,
        round3Winner: null,
        round1Duration: null,
        round2Duration: null,
        round3Duration: null,
        currentRound: 1,
      });
    }
    return list;
  };

  const isDefaultSumoArena =
    !selectedArena ||
    selectedArena.id === "sumo-3kg-oficial" ||
    selectedArena.name.toLowerCase().includes("principal") ||
    selectedArena.name.toLowerCase() === "sumô 3kg (oficial)";

  const activeArenaMatches: MatchData[] =
    selectedArena && selectedArena.evaluationType === "confronto" && !isDefaultSumoArena
      ? dynamicArenaMatchesMap[selectedArena.id] ?? buildDynamicArenaMatches(selectedArena)
      : matches;

  // Filtered matches for Step 2
  const matchesInActivePhase =
    activePhaseTab === "ALL"
      ? activeArenaMatches
      : activeArenaMatches.filter((m) => m.phase === activePhaseTab);
  const filteredMatches = matchesInActivePhase.filter((m) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "PENDENTE") return m.status === "PENDENTE";
    if (activeFilter === "EM ANDAMENTO") return m.status === "EM ANDAMENTO" || (m.status as any) === "LIVE";
    if (activeFilter === "CONCLUÍDO") return m.status === "CONCLUÍDO" || (m.status as any) === "COMPLETED";
    return m.status === activeFilter;
  });

  const handleSelectArenaForEvaluation = (arena: ArenaOption, pushUrl = true) => {
    setSelectedArena(arena);
    setActivePhaseTab(activeMenu === "partidas" ? "ALL" : "OITAVAS");
    setActiveRoundTab("ALL");
    setActiveFilter("ALL");
    setSelectedIndividualTeamId(null);
    setSelectedIndividualRound(1);
    if (pushUrl) {
      const baseRoute = activeMenu === "partidas" ? "partidas" : "rules";
      const slug = toArenaSlug(arena.name) || arena.id;
      window.history.pushState(null, "", `/${baseRoute}/${slug}`);
    }
    if (activeMenu === "partidas" || arena.evaluationType === "confronto") {
      setStep(2);
    } else {
      setStep(4);
    }
  };

  const handleBackToArenaHub = () => {
    setSelectedArena(null);
    setStep(1);
    const baseRoute = activeMenu === "partidas" ? "partidas" : "rules";
    window.history.pushState(null, "", `/${baseRoute}`);
  };

  const handleDeleteArenaFromHub = async (arena: ArenaOption) => {
    if (!window.confirm(`Deseja realmente excluir a arena "${arena.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/arenas/${arena.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setArenasList((prev) => prev.filter((a) => a.id !== arena.id));
        setToastMessage(`Arena "${arena.name}" excluída.`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (e) {
      setArenasList((prev) => prev.filter((a) => a.id !== arena.id));
    }
  };

  // Arenas exibidas no Hub (inclui Sumô 3kg Oficial como Confronto + todas as arenas criadas no banco)
  const hasSumoInDb = arenasList.some((a) => a.evaluationType === "confronto" || a.name.toLowerCase().includes("sum"));
  const allHubArenas: ArenaOption[] = [
    ...(!hasSumoInDb
      ? [
          {
            id: "sumo-3kg-oficial",
            name: "Sumô 3kg (Oficial)",
            description: "Combate técnico de força e estratégia de sensores em Dohyo oficial.",
            status: "Ativa",
            capacity: 64,
            image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
            evaluationType: "confronto" as EvaluationModality,
            teams: Array.from({ length: 16 }, (_, i) => ({ id: `s-${i}`, name: `Equipe ${i + 1}` })),
          },
        ]
      : []),
    ...arenasList,
  ];

  const visibleHubArenas =
    filterEvalType === "ALL"
      ? allHubArenas
      : allHubArenas.filter((a) => a.evaluationType === filterEvalType);

  // Sync URL sub-route (e.g. /rules/arena-sumo-2 or /partidas/arena-sumo-2) with selectedArena
  useEffect(() => {
    const syncArenaFromPathname = () => {
      const segments = window.location.pathname.replace(/^\/+/, "").split("/").filter(Boolean);
      const slug = segments[1] ? decodeURIComponent(segments[1]).toLowerCase() : "";
      if (!slug) {
        if (step !== 1) {
          setSelectedArena(null);
          setStep(1);
        }
        return;
      }
      if (allHubArenas.length > 0 && (!selectedArena || toArenaSlug(selectedArena.name) !== slug)) {
        const matched = allHubArenas.find(
          (a) =>
            toArenaSlug(a.name) === slug ||
            a.id.toLowerCase() === slug ||
            a.name.toLowerCase() === slug
        );
        if (matched) {
          handleSelectArenaForEvaluation(matched, false);
        }
      }
    };

    syncArenaFromPathname();
    window.addEventListener("popstate", syncArenaFromPathname);
    return () => window.removeEventListener("popstate", syncArenaFromPathname);
  }, [arenasList.length]);

  return (
    <div className="fixed inset-0 z-[800] overflow-y-auto bg-[#f8fafc] text-[#051d30] flex">
      {/* Admin Sidebar */}
      <AdminSidebar active={activeMenu} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content Area */}
      <div className="flex-1 pl-0 md:pl-[256px] flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        {!(step === 2 && activeMenu === "partidas") && (
          <div
            className="sticky top-0 z-30 backdrop-blur-[12px] bg-[rgba(255,255,255,0.85)] flex h-[64px] items-center justify-between pl-16 pr-6 md:px-8 w-full border-b border-[rgba(226,232,240,0.4)] shadow-xs"
            data-name="Top Navigation Bar"
          >
            <div className="relative shrink-0" data-name="Container">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
                <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
                  <div className="[word-break:break-word] flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#00356a] text-[20px] tracking-[2px] uppercase w-[168.73px]">
                    <p className="leading-[28px]">ROBOTIC_SYNC</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 relative z-10 flex-wrap">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#edf4ff] border border-[rgba(194,198,210,0.2)]">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[11px] font-bold text-[#00356a] uppercase tracking-[0.5px]">API Conectada</span>
              </div>
              <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-[#e2e8f0]">
                <div className="flex flex-col items-end">
                  <span className="font-['Space_Grotesk'] font-bold text-[13px] text-[#051d30] leading-tight">Administrador</span>
                  <span className="font-['Inter',sans-serif] text-[10px] text-[#727782] tracking-wider uppercase">ADMIN</span>
                </div>
                <button
                  onClick={onLogout}
                  title="Encerrar sessão (Logoff)"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] bg-[#fee2e2] text-[#991b1b] hover:bg-[#fecaca] font-['Space_Grotesk'] font-bold text-[11px] tracking-wider uppercase transition-all shadow-xs cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        )}

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
            <h1 className="text-[40px] font-['Space_Grotesk'] font-bold text-[#051d30] leading-tight tracking-[-1px]">
              {activeMenu === "partidas" ? "Gerenciamento de Partidas" : "Avaliação de Arenas"}
            </h1>

            <p className="text-[#64748b] text-[15px] mt-2 max-w-3xl leading-relaxed">
              {activeMenu === "partidas" ? (
                <>
                  Selecione uma arena abaixo para visualizar as chaves, controlar o cronômetro oficial e gerenciar a <strong>transmissão ao vivo das partidas</strong> no telão.
                </>
              ) : (
                <>
                  Selecione uma arena abaixo para iniciar a arbitragem. Cada arena abre <strong>exclusivamente o seu sistema de avaliação configurado</strong> (Confronto, Desafio, Tempo ou Dançarino).
                </>
              )}
            </p>

            <div className="mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 text-[15px] font-bold text-[#051d30] uppercase tracking-wider">
                  <span>🎮</span>
                  <span>
                    {activeMenu === "partidas"
                      ? `Arenas com Partidas (${visibleHubArenas.length})`
                      : `Arenas para Avaliação (${visibleHubArenas.length})`}
                  </span>
                </div>

                {/* Filtro por Tipo de Avaliação */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: "ALL", label: "Todas" },
                    { id: "confronto", label: "⚔️ Confronto" },
                    { id: "desafio", label: "🧩 Desafio" },
                    { id: "tempo", label: "⏱️ Tempo" },
                    { id: "dancarino", label: "🎵 Dançarino" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilterEvalType(tab.id as any)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        filterEvalType === tab.id
                          ? "bg-[#00356a] text-white shadow-sm"
                          : "bg-white border border-[#e2e8f0] text-[#64748b] hover:text-[#051d30]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {visibleHubArenas.map((arena) => {
                  const statusStyle = ARENA_STATUS_COLORS[arena.status] || ARENA_STATUS_COLORS.Ativa;
                  const dotStyle = ARENA_STATUS_DOT[arena.status] || ARENA_STATUS_DOT.Ativa;
                  return (
                    <div
                      key={arena.id}
                      onClick={() => handleSelectArenaForEvaluation(arena)}
                      className="bg-white rounded-[8px] shadow-[0_1px_4px_rgba(0,0,0,0.07)] border border-[rgba(194,198,210,0.4)] overflow-hidden flex flex-col group hover:shadow-[0_4px_16px_rgba(0,53,106,0.12)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                    >
                      <div className="relative h-[168px] bg-[#cfe5ff] overflow-hidden">
                        <img
                          alt={arena.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          src={arena.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,29,48,0.5)] to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[0.8px] uppercase px-2 py-1 rounded-[4px] border ${statusStyle}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
                            {arena.status}
                          </span>
                        </div>
                        <div
                          className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onNavigate?.("arenas")}
                            className="w-8 h-8 bg-white rounded-[4px] flex items-center justify-center shadow hover:bg-[#edf4ff] transition-colors"
                            title="Editar"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteArenaFromHub(arena)}
                            className="w-8 h-8 bg-white rounded-[4px] flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                            title="Excluir"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 p-5 flex-1">
                        <div>
                          <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[17px] uppercase">
                            {arena.name}
                          </h3>
                          <p className="font-['Inter:Regular',Inter,sans-serif] text-[#475569] text-[13px] leading-[18px] mt-1 line-clamp-2">
                            {arena.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-[12px] font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0]">
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            {arena.capacity || 32} cap.
                          </span>
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {arena.teams?.length || 0} equipes
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-[#00356a]">
                            {EVAL_SHORT_LABELS[arena.evaluationType || "desafio"]}
                          </span>
                        </div>

                        <div className="flex gap-2 pt-1 mt-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectArenaForEvaluation(arena);
                            }}
                            className="w-full text-[12px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[0.8px] uppercase text-[#00356a] border border-[#c2d9f5] rounded-[4px] py-2 hover:bg-[#edf4ff] transition-colors cursor-pointer"
                          >
                            {activeMenu === "partidas" ? "ver partidas" : "Avaliar "}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SCREEN 2 (Partidas): Gerenciamento Oficial de Partidas & Transmissão
            SCREEN 2 (Rules): Gestão de Chaves e Sorteio (com Sorteio Automático)
        ══════════════════════════════════════════════════════════════════ */}
        {step === 2 && activeMenu === "rules" && (
          <div className="p-8 max-w-7xl w-full mx-auto animate-fadeIn">
            {/* Header with Title & Sorteio Automático Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={handleBackToArenaHub}
                    className="text-[11px] font-['Space_Grotesk'] font-bold text-[#00356a] hover:bg-[#edf4ff] border border-[#c2d9f5] px-3 py-1 rounded-[6px] flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-colors"
                  >
                    <span>←</span>
                    <span>Arenas</span>
                  </button>
                  <span className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#8c4f00]">
                    {(selectedArena?.name || "Sumô 3kg (Oficial)").toUpperCase()}
                  </span>
                </div>
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
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { key: "OITAVAS", label: `OITAVAS DE FINAL (${activeArenaMatches.filter((m) => m.phase === "OITAVAS").length})` },
                  { key: "QUARTAS", label: `QUARTAS (${activeArenaMatches.filter((m) => m.phase === "QUARTAS").length})` },
                  { key: "SEMIFINAL", label: `SEMIFINAIS (${activeArenaMatches.filter((m) => m.phase === "SEMIFINAL").length})` },
                  { key: "FINAL", label: `GRANDE FINAL (${activeArenaMatches.filter((m) => m.phase === "FINAL").length})` },
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
              <div className="flex items-center gap-2 flex-wrap">
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
                    {selectedArena?.name || "Sumô"} -{" "}
                    {activePhaseTab === "OITAVAS"
                      ? "Oitavas de Final"
                      : activePhaseTab === "QUARTAS"
                      ? "Quartas de Final"
                      : activePhaseTab === "SEMIFINAL"
                      ? "Semifinais"
                      : activePhaseTab === "FINAL"
                      ? "Grande Final"
                      : "Todos os Confrontos"}
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
              ) : filteredMatches.length === 0 ? (
                <div className="bg-white rounded-[12px] border border-[#e2e8f0] p-12 text-center flex flex-col items-center gap-3">
                  <div className="text-3xl">🤖</div>
                  <h3 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                    Nenhuma equipe cadastrada em {selectedArena?.name || "esta arena"}
                  </h3>
                  <p className="text-[#64748b] text-[14px] max-w-md">
                    Esta arena possui <strong>0 equipes</strong> vinculadas no momento. Adicione equipes em <strong>Arenas → Equipes</strong> para gerar os confrontos e realizar o sorteio.
                  </p>
                  <button
                    onClick={() => onNavigate?.("arenas")}
                    className="mt-2 bg-[#00356a] hover:bg-[#00468a] text-white font-['Space_Grotesk'] font-bold text-[12px] tracking-wider uppercase px-5 py-2.5 rounded-[6px] transition-all cursor-pointer"
                  >
                    Gerenciar Equipes da Arena
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredMatches.map((m) => {
                    const isInProgress = m.status === "EM ANDAMENTO" || (m.status as any) === "LIVE";
                    const isDone = m.status === "CONCLUÍDO" || (m.status as any) === "COMPLETED";

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

        {step === 2 && activeMenu === "partidas" && (
          <div className="flex flex-col flex-1 animate-fadeIn">
            {/* Top Header Bar */}
            <header className="min-h-[64px] border-b border-[#e2e8f0] bg-white flex items-center justify-between px-4 sm:px-8 pl-16 md:pl-8 py-2 shrink-0 flex-wrap gap-3">
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold tracking-[2px] uppercase text-[#8c4f00]">
                  {(selectedArena?.name || "TORNEIO DE SUMÔ 3KG").toUpperCase()} •{" "}
                  {selectedArena?.evaluationType === "confronto"
                    ? "CHAVE DE CONFRONTOS EM CASCATA"
                    : selectedArena?.evaluationType === "tempo"
                    ? "RANKING & BATERIAS DE TOMADA DE TEMPO"
                    : selectedArena?.evaluationType === "dancarino"
                    ? "APRESENTAÇÕES ARTÍSTICAS & NOTAS POR BATERIA"
                    : "BATERIAS DE MISSÕES & PONTUAÇÃO POR ROUND"}
                </p>
                <h1 className="font-['Space_Grotesk'] font-bold text-[16px] sm:text-[18px] text-[#051d30] leading-tight">
                  Gerenciamento Oficial de Partidas & Transmissão
                </h1>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleBackToArenaHub}
                  className="text-[11px] font-['Space_Grotesk'] font-bold text-[#00356a] hover:bg-[#edf4ff] border border-[#c2d9f5] px-3 py-1.5 rounded-[6px] flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-colors"
                >
                  <span>←</span>
                  <span>Arenas</span>
                </button>

                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  MONGODB ATLAS CONECTADO
                </span>

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
                      Cronômetro — {selectedArena?.name || "Arena Sumô"}
                    </div>
                    <div className="text-[32px] font-mono font-black text-[#051d30] leading-none mt-1">
                      {Math.floor(matchTimer / 60)}:{String(matchTimer % 60).padStart(2, "0")}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:ml-4">
                    <button
                      onClick={() => {
                        const next = !isTimerRunning;
                        setIsTimerRunning(next);
                        broadcastTimer(matchTimer, next);
                      }}
                      className={`px-4 py-2 rounded-[6px] font-bold text-[12px] tracking-wider uppercase transition-colors cursor-pointer ${
                        isTimerRunning ? "bg-[#fee2e2] text-[#991b1b]" : "bg-[#ecfdf5] text-[#065f46]"
                      }`}
                    >
                      {isTimerRunning ? "PAUSAR" : "INICIAR"}
                    </button>
                    <button
                      onClick={() => {
                        setMatchTimer(120);
                        setIsTimerRunning(false);
                        broadcastTimer(120, false);
                      }}
                      className="px-3 py-2 rounded-[6px] border border-[#cbd5e1] text-[#64748b] hover:bg-[#f8fafc] text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      RESETAR (02:00)
                    </button>
                  </div>
                </div>

                {/* Global Projection Control Buttons */}
                <div className="flex items-center gap-3 flex-wrap">
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

              {selectedArena && selectedArena.evaluationType !== "confronto" ? (
                <>
                  {/* Filter Tabs Bar for Desafio / Tempo / Dançarino */}
                  <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4 flex-wrap gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { key: "ALL", label: `TODAS AS EQUIPES (${activeIndividualRows.length})` },
                        {
                          key: "R1",
                          label:
                            selectedArena.evaluationType === "dancarino"
                              ? "APRESENTAÇÃO 1"
                              : "ROUND 1 (TOMADA 1)",
                        },
                        {
                          key: "R2",
                          label:
                            selectedArena.evaluationType === "dancarino"
                              ? "APRESENTAÇÃO 2"
                              : "ROUND 2 (TOMADA 2)",
                        },
                        {
                          key: "R3",
                          label:
                            selectedArena.evaluationType === "dancarino"
                              ? "APRESENTAÇÃO 3 (FINAL)"
                              : "ROUND 3 (MELHOR MARCA)",
                        },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveRoundTab(tab.key as any)}
                          className={`px-4 py-2 rounded-[6px] font-['Space_Grotesk'] font-bold text-[12px] tracking-wider uppercase transition-all cursor-pointer ${
                            activeRoundTab === tab.key
                              ? "bg-[#00356a] text-white shadow-sm"
                              : "text-[#64748b] hover:text-[#051d30] hover:bg-[#f1f5f9]"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <span className="text-[12px] font-mono text-[#64748b]">
                      {activeIndividualRows.length} EQUIPES NA BATERIA •{" "}
                      {EVAL_SHORT_LABELS[selectedArena.evaluationType].toUpperCase()}
                    </span>
                  </div>

                  {/* Stacked Team Rows (One below the other with Rounds R1, R2, R3 & Score) */}
                  {activeIndividualRows.length === 0 ? (
                    <div className="bg-white rounded-[12px] border border-[#e2e8f0] p-12 text-center flex flex-col items-center gap-3">
                      <div className="text-3xl">🤖</div>
                      <h3 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                        Nenhuma equipe cadastrada em {selectedArena.name}
                      </h3>
                      <p className="text-[#64748b] text-[14px] max-w-md">
                        Esta arena possui <strong>0 equipes</strong> vinculadas no momento. Adicione equipes em{" "}
                        <strong>Arenas → Equipes</strong> para gerenciar suas baterias, rounds e pontuações.
                      </p>
                      <button
                        onClick={() => onNavigate?.("arenas")}
                        className="mt-2 bg-[#00356a] hover:bg-[#00468a] text-white font-['Space_Grotesk'] font-bold text-[12px] tracking-wider uppercase px-5 py-2.5 rounded-[6px] transition-all cursor-pointer"
                      >
                        Gerenciar Equipes da Arena
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {activeIndividualRows.map((row, idx) => {
                        const rankPos = idx + 1;
                        const isLeader = idx === 0 && row.totalPoints > 0;
                        const roundPrefix =
                          selectedArena.evaluationType === "dancarino" ? "APRES." : "ROUND";
                        const metricLabel =
                          selectedArena.evaluationType === "dancarino"
                            ? "MÉDIA ARTÍSTICA"
                            : selectedArena.evaluationType === "tempo"
                            ? "MELHOR TEMPO"
                            : "MISSÕES / TEMPO";

                        return (
                          <div
                            key={row.id}
                            className={`bg-white rounded-[12px] border p-5 sm:p-6 shadow-sm transition-all flex flex-col gap-4 ${
                              row.released
                                ? "border-[#93c5fd] shadow-[0_4px_14px_rgba(0,53,106,0.08)]"
                                : isLeader
                                ? "border-amber-300"
                                : "border-[#e2e8f0]"
                            }`}
                          >
                            {/* Top Row: Rank + Team Identity + Status/Broadcast Badges */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-[8px] font-['Space_Grotesk'] font-bold text-[14px] flex items-center justify-center shrink-0 ${
                                    rankPos === 1
                                      ? "bg-amber-500 text-white shadow-xs"
                                      : rankPos === 2
                                      ? "bg-slate-300 text-slate-800"
                                      : rankPos === 3
                                      ? "bg-amber-700/80 text-white"
                                      : "bg-[#f1f5f9] text-[#475569]"
                                  }`}
                                >
                                  #{rankPos}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-[12px] font-bold text-[#0891b2]">
                                      {row.code}
                                    </span>
                                    <span className="font-['Space_Grotesk'] font-bold text-[17px] text-[#051d30] uppercase">
                                      {row.name}
                                    </span>
                                    <span className="text-[11px] font-medium text-[#64748b] bg-[#f1f5f9] px-2.5 py-0.5 rounded">
                                      {row.institution}
                                    </span>
                                    {isLeader && (
                                      <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                        🏆 LÍDER DA ARENA
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                                    row.status === "EM ANDAMENTO"
                                      ? "bg-[#e6fffa] text-[#0d9488]"
                                      : row.status === "CONCLUÍDO"
                                      ? "bg-[#dcfce7] text-[#15803d]"
                                      : "bg-[#f1f5f9] text-[#475569]"
                                  }`}
                                >
                                  {row.status}
                                </span>

                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                                    (row.round1Released ?? row.released) ||
                                    (row.round2Released ?? row.released) ||
                                    (row.round3Released ?? row.released)
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {(row.round1Released ?? row.released) &&
                                  (row.round2Released ?? row.released) &&
                                  (row.round3Released ?? row.released)
                                    ? "TODOS NO TELÃO"
                                    : (row.round1Released ?? row.released) ||
                                      (row.round2Released ?? row.released) ||
                                      (row.round3Released ?? row.released)
                                    ? `TRANSMITINDO (${[
                                        (row.round1Released ?? row.released) ? "R1" : null,
                                        (row.round2Released ?? row.released) ? "R2" : null,
                                        (row.round3Released ?? row.released) ? "R3" : null,
                                      ]
                                        .filter(Boolean)
                                        .join(", ")})`
                                    : "OCULTO"}
                                </span>
                              </div>
                            </div>

                            {/* Middle Row: 3 Rounds (R1, R2, R3) + Total Points Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              {[
                                {
                                  r: 1 as const,
                                  metric: row.round1Metric,
                                  pts: row.round1Points,
                                  highlight: activeRoundTab === "R1",
                                  isRel: row.round1Released ?? row.released,
                                },
                                {
                                  r: 2 as const,
                                  metric: row.round2Metric,
                                  pts: row.round2Points,
                                  highlight: activeRoundTab === "R2",
                                  isRel: row.round2Released ?? row.released,
                                },
                                {
                                  r: 3 as const,
                                  metric: row.round3Metric,
                                  pts: row.round3Points,
                                  highlight: activeRoundTab === "R3",
                                  isRel: row.round3Released ?? row.released,
                                },
                              ].map((rd) => (
                                <div
                                  key={rd.r}
                                  className={`p-3.5 rounded-[8px] border flex flex-col justify-between transition-all ${
                                    rd.highlight
                                      ? "bg-[#edf4ff] border-[#00356a] ring-1 ring-[#00356a]/20"
                                      : rd.isRel
                                      ? "bg-[#f8fafc] border-blue-300"
                                      : rd.metric
                                      ? "bg-[#f8fafc] border-emerald-200"
                                      : "bg-[#f8fafc] border-[#e2e8f0]"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-mono font-bold text-[#475569] uppercase tracking-wider">
                                      {roundPrefix} 0{rd.r}
                                    </span>
                                    {rd.metric ? (
                                      <span
                                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                          rd.metric === "NÃO TERMINADO"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-emerald-100 text-emerald-800"
                                        }`}
                                      >
                                        {rd.metric === "NÃO TERMINADO" ? "0 PTS (DNF)" : `${rd.pts} PTS`}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-mono text-[#94a3b8]">
                                        PENDENTE
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-2 flex items-baseline justify-between gap-2">
                                    <span
                                      className={`font-mono font-bold text-[15px] ${
                                        rd.metric === "NÃO TERMINADO"
                                          ? "text-red-600 text-[13px]"
                                          : "text-[#051d30]"
                                      }`}
                                    >
                                      {rd.metric || "--:--.--"}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setSelectedIndividualTeamId(row.id);
                                        setSelectedIndividualRound(rd.r);
                                        setStep(4);
                                      }}
                                      className="text-[10px] font-bold text-[#00356a] hover:underline uppercase cursor-pointer"
                                    >
                                      {rd.metric ? "Editar →" : "Lançar →"}
                                    </button>
                                  </div>

                                  <div className="mt-2.5 pt-2 border-t border-[#e2e8f0]/80 flex items-center justify-between">
                                    <button
                                      type="button"
                                      onClick={() => toggleReleaseIndividualRound(row.id, rd.r)}
                                      className={`w-full py-1 px-2 rounded text-[10px] font-['Space_Grotesk'] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                        rd.isRel
                                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                                          : "bg-white hover:bg-[#edf4ff] text-[#475569] border border-[#cbd5e1]"
                                      }`}
                                      title={
                                        rd.isRel
                                          ? `Ocultar ${roundPrefix} 0${rd.r} do Telão`
                                          : `Liberar ${roundPrefix} 0${rd.r} no Telão`
                                      }
                                    >
                                      <span>{rd.isRel ? "🔓" : "🔒"}</span>
                                      <span>
                                        {rd.isRel
                                          ? `NO TELÃO (R${rd.r})`
                                          : `LIBERAR R${rd.r} NO TELÃO`}
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {/* Summary Box: Melhor Marca & Pontuação Geral */}
                              <div className="p-3.5 rounded-[8px] bg-[#081b2e] text-white flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono font-bold text-[#93c5fd] uppercase tracking-wider">
                                    {metricLabel}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold text-[#00f2ff]">
                                    GERAL
                                  </span>
                                </div>
                                <div className="mt-1.5 flex items-baseline justify-between">
                                  <span className="font-mono font-bold text-[14px] text-white truncate">
                                    {row.bestMetric}
                                  </span>
                                  <span className="font-['Space_Grotesk'] font-black text-[20px] text-[#00f2ff] leading-none">
                                    {row.totalPoints} <small className="text-[10px] font-mono">PTS</small>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Footer Row: Actions (Escolher Round ou Liberar/Ocultar Todos do Telão, Avaliar Equipe, Ver no Telão) */}
                            <div className="pt-3 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-mono font-bold text-[#64748b] uppercase tracking-wider mr-1">
                                  TELÃO POR ROUND:
                                </span>
                                {([1, 2, 3] as const).map((rNum) => {
                                  const isRRel =
                                    rNum === 1
                                      ? row.round1Released ?? row.released
                                      : rNum === 2
                                      ? row.round2Released ?? row.released
                                      : row.round3Released ?? row.released;
                                  return (
                                    <button
                                      key={rNum}
                                      type="button"
                                      onClick={() => toggleReleaseIndividualRound(row.id, rNum)}
                                      className={`px-2.5 py-1.5 rounded-[6px] font-mono font-bold text-[11px] uppercase transition-all cursor-pointer flex items-center gap-1 ${
                                        isRRel
                                          ? "bg-blue-600 text-white shadow-2xs hover:bg-blue-700"
                                          : "bg-[#f1f5f9] text-[#475569] border border-[#cbd5e1] hover:bg-[#e2e8f0]"
                                      }`}
                                    >
                                      <span>{isRRel ? "🔓" : "🔒"}</span>
                                      <span>R{rNum}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              <button
                                onClick={() => toggleReleaseIndividualTeam(row.id)}
                                className={`flex-1 min-w-[180px] py-2.5 rounded-[6px] font-['Space_Grotesk'] font-bold text-[11px] tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                  (row.round1Released ?? row.released) &&
                                  (row.round2Released ?? row.released) &&
                                  (row.round3Released ?? row.released)
                                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                                    : "bg-[#00356a] text-white hover:bg-[#00468a]"
                                }`}
                              >
                                <span>
                                  {(row.round1Released ?? row.released) &&
                                  (row.round2Released ?? row.released) &&
                                  (row.round3Released ?? row.released)
                                    ? "🔒 OCULTAR TODOS OS ROUNDS"
                                    : "🔓 LIBERAR TODOS OS ROUNDS"}
                                </span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedIndividualTeamId(row.id);
                                  const nextRound = !row.round1Metric
                                    ? 1
                                    : !row.round2Metric
                                    ? 2
                                    : 3;
                                  setSelectedIndividualRound(nextRound);
                                  setStep(4);
                                }}
                                className="px-5 py-2.5 rounded-[6px] border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#051d30] font-['Space_Grotesk'] font-bold text-[11px] tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <span>⚖</span>
                                <span>AVALIAR ROUNDS</span>
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
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Phase Filter Tabs Bar */}
                  <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4 flex-wrap gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { key: "ALL", label: `TODOS (${activeArenaMatches.length})` },
                        { key: "OITAVAS", label: `OITAVAS DE FINAL (${activeArenaMatches.filter((m) => m.phase === "OITAVAS").length})` },
                        { key: "QUARTAS", label: `QUARTAS DE FINAL (${activeArenaMatches.filter((m) => m.phase === "QUARTAS").length})` },
                        { key: "SEMIFINAL", label: `SEMIFINAIS (${activeArenaMatches.filter((m) => m.phase === "SEMIFINAL").length})` },
                        { key: "FINAL", label: `GRANDE FINAL (${activeArenaMatches.filter((m) => m.phase === "FINAL").length})` },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActivePhaseTab(tab.key as any)}
                          className={`px-4 py-2 rounded-[6px] font-['Space_Grotesk'] font-bold text-[12px] tracking-wider uppercase transition-all cursor-pointer ${
                            activePhaseTab === tab.key
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
                  {loadingTeams ? (
                    <div className="p-12 text-center text-[#64748b] font-mono">
                      Carregando confrontos reais do MongoDB Atlas...
                    </div>
                  ) : filteredMatches.length === 0 ? (
                    <div className="bg-white rounded-[12px] border border-[#e2e8f0] p-12 text-center flex flex-col items-center gap-3">
                      <div className="text-3xl">🤖</div>
                      <h3 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                        Nenhuma equipe cadastrada em {selectedArena?.name || "esta arena"}
                      </h3>
                      <p className="text-[#64748b] text-[14px] max-w-md">
                        Esta arena possui <strong>0 equipes</strong> vinculadas no momento. Adicione equipes em <strong>Arenas → Equipes</strong> para gerar os confrontos automaticamente.
                      </p>
                      <button
                        onClick={() => onNavigate?.("arenas")}
                        className="mt-2 bg-[#00356a] hover:bg-[#00468a] text-white font-['Space_Grotesk'] font-bold text-[12px] tracking-wider uppercase px-5 py-2.5 rounded-[6px] transition-all cursor-pointer"
                      >
                        Gerenciar Equipes da Arena
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredMatches.map((m) => {
                        const isLive = m.status === "LIVE" || m.status === ("EM ANDAMENTO" as any);
                        const isDone = m.status === "COMPLETED" || m.status === ("CONCLUÍDO" as any);
                        const t1Wins =
                          isDone &&
                          (m.winner === "teamA" ||
                            (m as any).winnerId === m.teamA.id ||
                            (m.teamA.score ?? 0) > (m.teamB.score ?? 0));
                        const t2Wins =
                          isDone &&
                          (m.winner === "teamB" ||
                            (m as any).winnerId === m.teamB.id ||
                            (m.teamB.score ?? 0) > (m.teamA.score ?? 0));

                        return (
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
                                    isLive
                                      ? "bg-[#e6fffa] text-[#0d9488]"
                                      : isDone
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
                                    {m.teamA.name.toUpperCase()}
                                  </span>
                                  {t1Wins && (
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                      ✓ VENCEDOR
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-bold text-[16px] text-[#051d30]">
                                    {isDone ? (m.teamA.score ?? 0) : isLive ? "LIVE" : "--"}
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
                                    {m.teamB.name.toUpperCase()}
                                  </span>
                                  {t2Wins && (
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                      ✓ VENCEDOR
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-bold text-[16px] text-[#051d30]">
                                    {isDone ? (m.teamB.score ?? 0) : "--"}
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
                                onClick={() => handleOpenEvaluation(m)}
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
                        );
                      })}
                    </div>
                  )}
                </>
              )}
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
                OBSERVAÇÕES TÉCNICAS DO JUIZ
              </span>
              <div className="bg-white rounded-[12px] border border-[#e2e8f0] p-4 shadow-sm mt-2">
                <textarea
                  value={judgeObservations}
                  onChange={(e) => setJudgeObservations(e.target.value)} // Enter technical feedback regarding robot sensors or mechanical performance...
                  placeholder="Insira feedback técnico sobre os sensores ou o desempenho mecânico do robô..."
                  className="w-full min-h-[90px] border-none outline-none text-[#1e293b] text-[13px] placeholder:text-[#94a3b8] resize-y"
                />
              </div>
              <div className="text-[10px] font-mono text-[#94a3b8] mt-2">
                TECHNICAL LOG V1.0 • MONGODB ATLAS SYNCED
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SCREEN 4: Console de Avaliação Exclusivo (Desafio / Tempo / Dançarino)
        ══════════════════════════════════════════════════════════════════ */}
        {step === 4 && selectedArena && (
          <ScoringEngineHub
            evaluationType={selectedArena.evaluationType}
            arenaName={selectedArena.name}
            arenaDescription={selectedArena.description}
            arenaTeams={selectedArena.teams}
            arenaChallenges={selectedArena.challenges}
            teamRows={activeIndividualRows}
            initialTeamId={selectedIndividualTeamId}
            initialRound={selectedIndividualRound}
            onSaveRoundResult={handleSaveIndividualRoundResult}
            onBack={() => {
              if (activeMenu === "partidas") {
                setStep(2);
              } else {
                handleBackToArenaHub();
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
