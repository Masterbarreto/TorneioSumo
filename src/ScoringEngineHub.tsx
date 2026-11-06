import { useState, useEffect } from "react";

export type EvaluationModality = "desafio" | "tempo" | "confronto" | "dancarino";

export interface ArenaTeamItem {
  id: string;
  name: string;
  institution?: string;
  status?: string;
}

export interface ScoringTeamRowData {
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

export interface ScoringEngineHubProps {
  evaluationType: EvaluationModality;
  arenaName: string;
  arenaDescription?: string;
  arenaTeams?: ArenaTeamItem[];
  arenaChallenges?: { id: string; name: string; description: string; maxPoints: number }[];
  teamRows?: ScoringTeamRowData[];
  initialTeamId?: string | null;
  initialRound?: 1 | 2 | 3;
  onSaveRoundResult?: (
    teamId: string,
    round: 1 | 2 | 3,
    metric: string,
    points: number,
    details?: {
      splits?: string[];
      fouls?: number;
      retries?: number;
      observations?: string;
    }
  ) => void;
  onBack: () => void;
}

interface TeamEntry {
  id: string;
  name: string;
  code: string;
  robot: string;
  institution: string;
  bestMetric: string;
  points: number;
  round1Metric: string | null;
  round2Metric: string | null;
  round3Metric: string | null;
  round1Points: number;
  round2Points: number;
  round3Points: number;
  splitsByRound: Record<number, string[]>;
  foulsByRound: Record<number, number>;
  retriesByRound: Record<number, number>;
  observationsByRound: Record<number, string>;
}

const DEFAULT_TEAMS_BY_TYPE: Record<EvaluationModality, TeamEntry[]> = {
  tempo: [
    { id: "tm-4402", name: "Alpha Dynamics", code: "#4402", robot: "Cyber-Vortex (Seguidor Pro)", institution: "SENAC SP", bestMetric: "01:58.20", points: 950 },
    { id: "tm-1189", name: "Neon Circuit", code: "#1189", robot: "Photon-X (RoboCar Micro)", institution: "SENAC RJ", bestMetric: "02:02.11", points: 890 },
    { id: "tm-3050", name: "Speed Demons", code: "#3050", robot: "Velocity-9 (Grand Prix)", institution: "FATEC Campinas", bestMetric: "02:10.05", points: 840 },
  ],
  desafio: [
    { id: "tm-501", name: "Cyber-Dragons", code: "#LAB-042", robot: "MazeSolver X", institution: "SENAC SP", bestMetric: "3/3 Missões (01:12)", points: 920 },
    { id: "tm-502", name: "Robo-Tech", code: "#LAB-045", robot: "Labyrinth Alpha", institution: "FATEC Campinas", bestMetric: "2/3 Missões (01:28)", points: 860 },
    { id: "tm-503", name: "Iron Bots", code: "#LAB-049", robot: "PathFinder V2", institution: "ETEC Zona Sul", bestMetric: "2/3 Missões (01:45)", points: 790 },
  ],
  dancarino: [
    { id: "tm-701", name: "DanceBots", code: "#DNC-01", robot: "Disco-Mech Coreografado", institution: "SENAC MG", bestMetric: "Nota 9.85 / 10", points: 985 },
    { id: "tm-702", name: "Beat Bot 3000", code: "#DNC-02", robot: "Harmonic-Arm V3", institution: "SENAC SP", bestMetric: "Nota 9.60 / 10", points: 960 },
    { id: "tm-703", name: "Rhythm Pulse", code: "#DNC-03", robot: "Cyber-Dancer Pro", institution: "ETEC Centro", bestMetric: "Nota 9.25 / 10", points: 925 },
  ],
  confronto: [],
};

const MODALITY_META: Record<
  EvaluationModality,
  {
    badge: string;
    title: string;
    subtitle: string;
    accentBg: string;
    accentText: string;
  }
> = {
  desafio: {
    badge: "AVALIAÇÃO POR DESAFIO",
    title: "Console de Avaliação por Desafio",
    subtitle: "Avalie o cumprimento de missões, checkpoints atingidos, tempo de percurso e penalidades de navegação.",
    accentBg: "bg-indigo-50 border-indigo-200 text-indigo-800",
    accentText: "text-indigo-700",
  },
  tempo: {
    badge: "AVALIAÇÃO POR TEMPO",
    title: "Console de Tomada de Tempo & Circuito",
    subtitle: "Cronometragem de precisão para seguidores de linha e corridas, com registro de voltas (splits) e faltas técnicas.",
    accentBg: "bg-sky-50 border-sky-200 text-sky-800",
    accentText: "text-sky-700",
  },
  dancarino: {
    badge: "AVALIAÇÃO DANÇARINO",
    title: "Súmula Artística & Técnica (Robô Dançarino)",
    subtitle: "Avaliação exclusiva por critérios artísticos, sincronia musical, coreografia e complexidade mecânica.",
    accentBg: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800",
    accentText: "text-fuchsia-700",
  },
  confronto: {
    badge: "AVALIAÇÃO POR CONFRONTO",
    title: "Console de Confronto Direto",
    subtitle: "Sistema de chaves e combates.",
    accentBg: "bg-amber-50 border-amber-200 text-amber-800",
    accentText: "text-amber-700",
  },
};

function parseMetricToTimer(metric: string | null | undefined): { s: number; ms: number; isDnf: boolean } {
  if (!metric || metric.includes("--") || metric.includes("Nota")) {
    return { s: 0, ms: 0, isDnf: false };
  }
  const upper = metric.toUpperCase();
  if (upper.includes("NÃO TERMINADO") || upper.includes("NAO TERMINADO") || upper.includes("DNF")) {
    return { s: 0, ms: 0, isDnf: true };
  }
  const parenMatch = metric.match(/\((\d+):(\d+)\.(\d+)\)/);
  if (parenMatch) {
    return {
      s: parseInt(parenMatch[1], 10) * 60 + parseInt(parenMatch[2], 10),
      ms: parseInt(parenMatch[3], 10),
      isDnf: false,
    };
  }
  const mmssMatch = metric.match(/^(\d+):(\d+)\.(\d+)/);
  if (mmssMatch) {
    return {
      s: parseInt(mmssMatch[1], 10) * 60 + parseInt(mmssMatch[2], 10),
      ms: parseInt(mmssMatch[3], 10),
      isDnf: false,
    };
  }
  const secMatch = metric.match(/^(\d+)\.(\d+)s?$/i);
  if (secMatch) {
    return {
      s: parseInt(secMatch[1], 10),
      ms: parseInt(secMatch[2], 10),
      isDnf: false,
    };
  }
  return { s: 0, ms: 0, isDnf: false };
}

export default function ScoringEngineHub({
  evaluationType,
  arenaName,
  arenaDescription,
  arenaTeams = [],
  arenaChallenges = [],
  teamRows = [],
  initialTeamId = null,
  initialRound = 1,
  onSaveRoundResult,
  onBack,
}: ScoringEngineHubProps) {
  const defaultMetricLabel =
    evaluationType === "dancarino"
      ? "Nota -- / 10"
      : evaluationType === "desafio"
      ? "0/3 Missões"
      : "--:--.--";

  const buildMappedTeams = (): TeamEntry[] => {
    if (teamRows && teamRows.length > 0) {
      return teamRows.map((r, i) => ({
        id: r.id || `tm-${i + 1}`,
        name: r.name,
        code: r.code ? (r.code.startsWith("#") ? r.code : `#${r.code}`) : `#EQ-${String(i + 1).padStart(3, "0")}`,
        robot:
          evaluationType === "dancarino"
            ? "Robô Coreografado"
            : evaluationType === "desafio"
            ? "Robô Autônomo de Missão"
            : "Robô de Velocidade / Linha",
        institution: r.institution || "SENAC",
        bestMetric: r.bestMetric || r.round2Metric || r.round1Metric || defaultMetricLabel,
        points: r.totalPoints || 0,
        round1Metric: r.round1Metric ?? null,
        round2Metric: r.round2Metric ?? null,
        round3Metric: r.round3Metric ?? null,
        round1Points: r.round1Points || 0,
        round2Points: r.round2Points || 0,
        round3Points: r.round3Points || 0,
        splitsByRound: r.splitsByRound || {},
        foulsByRound: r.foulsByRound || {},
        retriesByRound: r.retriesByRound || {},
        observationsByRound: r.observationsByRound || {},
      }));
    }
    return arenaTeams.map((t: any, i) => ({
      id: t.id || `tm-${i + 1}`,
      name: t.name,
      code: t.code ? (t.code.startsWith("#") ? t.code : `#${t.code}`) : `#EQ-${String(i + 1).padStart(3, "0")}`,
      robot:
        evaluationType === "dancarino"
          ? "Robô Coreografado"
          : evaluationType === "desafio"
          ? "Robô Autônomo de Missão"
          : "Robô de Velocidade / Linha",
      institution: t.institution || "SENAC",
      bestMetric: t.bestMetric || t.round2Metric || t.round1Metric || defaultMetricLabel,
      points: Number(t.totalPoints) || 0,
      round1Metric: t.round1Metric ?? null,
      round2Metric: t.round2Metric ?? null,
      round3Metric: t.round3Metric ?? null,
      round1Points: Number(t.round1Points) || 0,
      round2Points: Number(t.round2Points) || 0,
      round3Points: Number(t.round3Points) || 0,
      splitsByRound: t.splitsByRound || {},
      foulsByRound: t.foulsByRound || {},
      retriesByRound: t.retriesByRound || {},
      observationsByRound: t.observationsByRound || {},
    }));
  };

  const mappedArenaTeams = buildMappedTeams();

  const [teamsList, setTeamsList] = useState<TeamEntry[]>(mappedArenaTeams);
  const [selectedTeam, setSelectedTeam] = useState<TeamEntry | null>(
    (initialTeamId && mappedArenaTeams.find((t) => t.id === initialTeamId)) || mappedArenaTeams[0] || null
  );
  const [round, setRound] = useState<1 | 2 | 3>(initialRound);

  // ─── Estado para TEMPO e DESAFIO (Cronômetro + Splits + Faltas) ───────────
  const [seconds, setSeconds] = useState(0);
  const [millis, setMillis] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [splits, setSplits] = useState<string[]>([]);
  const [fouls, setFouls] = useState(0);
  const [retries, setRetries] = useState(1);
  const [didNotFinish, setDidNotFinish] = useState(false);

  // ─── Estado específico para DESAFIO (Missões / Checkpoints) ───────────────
  const buildMissionsList = () => {
    if (arenaChallenges && arenaChallenges.length > 0) {
      return arenaChallenges.map((c, idx) => ({
        id: c.id || `m-${idx + 1}`,
        name: c.name || `Obstáculo ${String(idx + 1).padStart(2, "0")}`,
        description: c.description || "Desafio técnico de precisão e controle.",
        points: Number(c.maxPoints) || 200,
        status: "pending" as "pending" | "success" | "failed",
      }));
    }
    return [];
  };

  const [missions, setMissions] = useState(buildMissionsList);

  useEffect(() => {
    setMissions(buildMissionsList());
  }, [arenaName, JSON.stringify(arenaChallenges)]);

  // ─── Estado específico para DANÇARINO (3 Critérios: Synchronization, Creativity, Technical Complexity) ───
  const [danceScores, setDanceScores] = useState({
    synchronization: 8.5,
    creativity: 7.0,
    technicalComplexity: 9.0,
  });

  // Observações e Toast
  const [observations, setObservations] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync teamsList when parent rows or arenaTeams change
  useEffect(() => {
    const fresh = buildMappedTeams();
    setTeamsList(fresh);
    setSelectedTeam((prevSel) => {
      const targetId = prevSel?.id || initialTeamId;
      return (targetId && fresh.find((t) => t.id === targetId)) || fresh[0] || null;
    });
  }, [arenaName, evaluationType, arenaTeams, teamRows]);

  useEffect(() => {
    if (initialTeamId) {
      const found = teamsList.find((t) => t.id === initialTeamId);
      if (found) setSelectedTeam(found);
    }
    setRound(initialRound);
  }, [initialTeamId, initialRound]);

  // Hydrate timer, fouls, retries, and observations from selectedTeam + round
  useEffect(() => {
    if (!selectedTeam) return;
    setIsRunning(false);
    const roundMetric =
      round === 1
        ? selectedTeam.round1Metric
        : round === 2
        ? selectedTeam.round2Metric
        : selectedTeam.round3Metric;
    const savedFouls = selectedTeam.foulsByRound?.[round] ?? 0;
    const parsed = parseMetricToTimer(roundMetric);
    const baseSeconds =
      !parsed.isDnf && evaluationType !== "dancarino" && evaluationType !== "desafio"
        ? Math.max(0, parsed.s - savedFouls * 5)
        : parsed.s;
    setDidNotFinish(parsed.isDnf);
    setSeconds(baseSeconds);
    setMillis(parsed.ms);
    setSplits(selectedTeam.splitsByRound?.[round] || []);
    setFouls(savedFouls);
    setRetries(selectedTeam.retriesByRound?.[round] ?? 1);
    setObservations(selectedTeam.observationsByRound?.[round] || "");
  }, [selectedTeam?.id, round]);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setMillis((prevM) => {
        if (prevM >= 95) {
          setSeconds((prevS) => prevS + 1);
          return 0;
        }
        return prevM + 5;
      });
    }, 50);
    return () => clearInterval(id);
  }, [isRunning]);

  const formatDisplay = (s: number, ms: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    const m = String(ms).padStart(2, "0");
    return `${mm}:${ss}.${m}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setDidNotFinish(false);
    setSeconds(0);
    setMillis(0);
    setSplits([]);
  };

  const handleMarkDidNotFinish = () => {
    const nextDnf = !didNotFinish;
    setDidNotFinish(nextDnf);
    if (nextDnf) {
      setIsRunning(false);
      setSeconds(0);
      setMillis(0);
    }
  };

  const setMissionStatus = (id: string, targetStatus: "success" | "failed") => {
    setMissions((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === targetStatus ? "pending" : targetStatus } : m
      )
    );
  };

  const totalMissionPoints = missions.reduce((acc, m) => acc + (m.status === "success" ? m.points : 0), 0);

  const totalDanceRoundScore = (
    danceScores.synchronization +
    danceScores.creativity +
    danceScores.technicalComplexity
  ).toFixed(1);

  const resetDanceRound = () => {
    setDanceScores({
      synchronization: 8.5,
      creativity: 7.0,
      technicalComplexity: 9.0,
    });
  };

  const handleSaveScorecard = () => {
    if (!selectedTeam) return;
    let metricSummary = "";
    let newPoints = selectedTeam.points;

    if (didNotFinish) {
      metricSummary = "NÃO TERMINADO";
      newPoints = 0;
    } else if (evaluationType === "dancarino") {
      metricSummary = `${totalDanceRoundScore}`;
      newPoints = parseFloat(totalDanceRoundScore);
    } else if (evaluationType === "desafio") {
      const doneCount = missions.filter((m) => m.status === "success").length;
      metricSummary = `${doneCount}/${missions.length} Missões (${formatDisplay(seconds, millis)})`;
      newPoints = Math.max(0, totalMissionPoints);
    } else {
      const penaltySecs = fouls * 5;
      metricSummary = `${formatDisplay(seconds + penaltySecs, millis)}`;
      newPoints = Math.max(100, 1000 - (seconds + penaltySecs) * 3);
    }

    setTeamsList((prev) =>
      prev
        .map((t) => {
          if (t.id !== selectedTeam.id) return t;
          const r1M = round === 1 ? metricSummary : t.round1Metric;
          const r2M = round === 2 ? metricSummary : t.round2Metric;
          const r3M = round === 3 ? metricSummary : t.round3Metric;
          const r1P = round === 1 ? newPoints : t.round1Points;
          const r2P = round === 2 ? newPoints : t.round2Points;
          const r3P = round === 3 ? newPoints : t.round3Points;
          const maxPts = Math.max(r1P, r2P, r3P);
          const bestM =
            maxPts === r3P && r3M
              ? r3M
              : maxPts === r2P && r2M
              ? r2M
              : maxPts === r1P && r1M
              ? r1M
              : metricSummary;
          return {
            ...t,
            round1Metric: r1M,
            round2Metric: r2M,
            round3Metric: r3M,
            round1Points: r1P,
            round2Points: r2P,
            round3Points: r3P,
            bestMetric: bestM,
            points: maxPts,
            splitsByRound: { ...t.splitsByRound, [round]: splits },
            foulsByRound: { ...t.foulsByRound, [round]: fouls },
            retriesByRound: { ...t.retriesByRound, [round]: retries },
            observationsByRound: { ...t.observationsByRound, [round]: observations },
          };
        })
        .sort((a, b) => b.points - a.points)
    );

    onSaveRoundResult?.(selectedTeam.id, round, metricSummary, newPoints, {
      splits,
      fouls,
      retries,
      observations,
    });

    setToastMsg(`Avaliação (${MODALITY_META[evaluationType].badge}) de "${selectedTeam.name}" registrada!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const meta = MODALITY_META[evaluationType] || MODALITY_META.tempo;

  return (
    <div className="flex flex-col gap-7 max-w-[1600px] w-full mx-auto p-6 sm:p-10 animate-fadeIn">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-[999] bg-[#051d30] text-white px-6 py-4 rounded-[10px] shadow-2xl border-l-4 border-[#00f2ff] flex items-center gap-3">
          <span className="text-xl">✓</span>
          <div>
            <div className="font-bold text-[15px]">{toastMsg}</div>
            <div className="text-[13px] text-slate-400">Arena: {arenaName} • Classificação atualizada</div>
          </div>
        </div>
      )}

      {/* Top Header Bar (Oculto no modo Dançarino, que possui cabeçalho próprio conforme design) */}
      {evaluationType !== "dancarino" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div>
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-bold text-[#00356a] hover:underline mb-2.5 cursor-pointer transition-colors uppercase tracking-wider"
            >
              ← Voltar para Seleção de Arenas
            </button>
            <div className="flex flex-wrap items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-slate-500">
              <span>ARENA: <strong className="text-[#051d30]">{arenaName}</strong></span>
              <span>•</span>
              <span className={`px-3 py-1 rounded-full border text-xs ${meta.accentBg}`}>
                {meta.badge}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-['Space_Grotesk'] font-bold text-[#051d30] mt-1.5">
              {meta.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1">
              {arenaDescription || meta.subtitle}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2.5 bg-[#edf4ff] border border-[#c2d9f5] px-5 py-2.5 rounded-xl text-[#00356a] text-sm font-bold font-mono">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span>MODO EXCLUSIVO: {meta.badge}</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Bloqueado para outros tipos de avaliação
            </span>
          </div>
        </div>
      )}

      {evaluationType === "desafio" ? (
        /* ═══ LAYOUT ORGANIZADO PARA MODO DESAFIO: 3 Cards Superiores de Mesmo Tamanho + Obstacle Matrix Grande ═══ */
        <div className="flex flex-col gap-7">
          {/* Top Row: 3 Cards de mesmo tamanho (Select Team, Mission Time, Performance Round) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Card 1: Select Team (4 Cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4 h-full min-h-[340px]">
              <div className="flex items-center justify-between text-sm font-bold text-slate-500 uppercase tracking-wider">
                <span>Select Team</span>
                <span>{teamsList.length} equipes</span>
              </div>

              <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[250px] pr-1">
                {teamsList.length === 0 ? (
                  <div className="p-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500 my-auto">
                    Nenhuma equipe cadastrada nesta arena. Adicione equipes em <strong>Arenas → Equipes</strong>.
                  </div>
                ) : (
                  teamsList.map((t) => {
                    const isSel = selectedTeam?.id === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTeam(t)}
                        className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          isSel
                            ? "border-[#00356a] bg-[#eef4ff] shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <h4 className="text-base font-bold text-[#051d30] truncate">{t.name}</h4>
                          <p className={`text-xs font-mono ${isSel ? "text-[#00356a] font-semibold" : "text-slate-400"}`}>
                            Team ID: {t.code} • {t.institution}
                          </p>
                        </div>
                        {isSel ? (
                          <span className="w-7 h-7 rounded-full bg-[#00356a] text-white text-sm flex items-center justify-center font-bold shrink-0">
                            ✓
                          </span>
                        ) : (
                          <span className="w-6 h-6 rounded-full border-2 border-slate-300 shrink-0" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Card 2: Mission Time (4 Cols) */}
            <div className="lg:col-span-4 bg-[#00356a] rounded-2xl p-7 text-white shadow-xl flex flex-col items-center justify-between text-center gap-4 relative overflow-hidden h-full min-h-[340px]">
              <div className="flex items-center justify-between w-full text-xs sm:text-sm font-mono tracking-widest text-blue-200 uppercase">
                <span className="truncate pr-2">MISSION TIME • {selectedTeam?.name}</span>
                <span className="bg-white/10 px-3 py-1 rounded shrink-0">R{round}</span>
              </div>

              <div className="text-5xl xl:text-6xl font-mono font-bold tracking-tight text-white select-none my-auto py-2">
                {didNotFinish ? (
                  <span className="text-2xl sm:text-3xl text-red-300 font-black tracking-wider uppercase block">
                    NÃO TERMINADO (00:00.00 NO TELÃO)
                  </span>
                ) : (
                  formatDisplay(seconds, millis)
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
                <button
                  onClick={resetTimer}
                  className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-all cursor-pointer"
                  title="Resetar Cronômetro"
                >
                  ↺
                </button>
                <button
                  onClick={() => {
                    if (didNotFinish) setDidNotFinish(false);
                    setIsRunning((r) => !r);
                  }}
                  className={`px-7 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
                    isRunning ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-[#ff9900] hover:bg-[#e68a00] text-white"
                  }`}
                >
                  <span>{isRunning ? "⏸" : "▶"}</span>
                  <span>{isRunning ? "PAUSE" : "START"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleMarkDidNotFinish}
                  className={`px-4 py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer border ${
                    didNotFinish
                      ? "bg-red-600 border-red-400 text-white shadow-lg"
                      : "bg-white/10 hover:bg-red-500/30 border-white/20 text-red-200 hover:text-white"
                  }`}
                  title="Marcar que a equipe não conseguiu terminar em tempo hábil (zera o tempo no Telão e registra como Não Terminado no Admin)"
                >
                  <span>⚠️</span>
                  <span>{didNotFinish ? "NÃO TERMINADO" : "NÃO CONSEGUIU TERMINAR"}</span>
                </button>
              </div>
            </div>

            {/* Card 3: Performance Round (4 Cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4 h-full min-h-[340px]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Performance Round</span>
                <span className="text-xs font-mono font-bold text-[#00356a] bg-[#eef4ff] px-2.5 py-1 rounded">
                  BATERIA OFICIAL
                </span>
              </div>

              <div className="flex flex-col justify-center gap-3 flex-1">
                {([1, 2, 3] as const).map((r) => {
                  const rMetric =
                    r === 1
                      ? selectedTeam?.round1Metric
                      : r === 2
                      ? selectedTeam?.round2Metric
                      : selectedTeam?.round3Metric;
                  return (
                    <button
                      key={r}
                      onClick={() => setRound(r)}
                      className={`px-5 py-4 rounded-xl text-sm font-bold flex justify-between items-center transition-all cursor-pointer ${
                        round === r
                          ? "bg-[#00356a] text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span>Round {r}</span>
                      <span
                        className={`text-xs uppercase font-mono px-2.5 py-0.5 rounded ${
                          round === r
                            ? "bg-white/20 text-white"
                            : rMetric === "NÃO TERMINADO"
                            ? "bg-red-100 text-red-700"
                            : rMetric
                            ? "bg-emerald-100 text-emerald-800"
                            : "text-slate-400"
                        }`}
                      >
                        {round === r ? "Active" : rMetric ? rMetric : "Pending"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Obstacle Matrix (Largura Total, Cards Maiores e Organizados) */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 rounded-full bg-[#00468a]" />
                <h3 className="font-['Space_Grotesk'] font-bold text-[24px] text-[#051d30] tracking-[-0.3px]">
                  Obstacle Matrix
                </h3>
              </div>
              <span className="text-base font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-lg">
                {Math.max(0, totalMissionPoints)} PTS
              </span>
            </div>

            {missions.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-300 bg-white text-center text-sm text-slate-500 font-medium">
                Nenhum obstáculo/desafio cadastrado nesta arena. Configure os desafios em{" "}
                <strong>Arenas → Editar Arena → Configurar Desafios</strong>.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {missions.map((m, idx) => {
                  const isSuccess = m.status === "success";
                  const isFailed = m.status === "failed";
                  const obsNum = String(idx + 1).padStart(2, "0");
                  const titleText =
                    m.name ||
                    (m as any).label?.split(" — ")[0] ||
                    `Obstáculo ${obsNum}`;
                  const descText =
                    m.description ||
                    (m as any).label?.split(" — ")[1] ||
                    "Desafio técnico de precisão e controle.";

                  return (
                    <div
                      key={m.id}
                      className="bg-white rounded-[18px] border border-[#eef2f6] p-7 sm:p-8 min-h-[220px] shadow-[0_2px_14px_rgba(0,0,0,0.04)] flex flex-col justify-between gap-6 transition-all hover:border-[#cbd5e1]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-[11px] font-['Inter',sans-serif] font-extrabold uppercase tracking-[1px] text-[#0052cc]">
                              OBSTACLE {obsNum}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-[#00356a] bg-[#eef4ff] px-2.5 py-0.5 rounded">
                              +{m.points} PTS
                            </span>
                          </div>
                          <h4 className="font-['Space_Grotesk'] font-bold text-[22px] text-[#051d30] leading-snug mt-2">
                            {titleText}
                          </h4>
                          <p className="text-[14px] text-[#64748b] mt-1.5 line-clamp-2 leading-relaxed">
                            {descText}
                          </p>
                        </div>

                        <div className="w-12 h-12 rounded-[12px] bg-[#f1f5f9] text-[#00356a] flex items-center justify-center shrink-0">
                          {idx % 4 === 0 && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="8" y="2" width="14" height="14" rx="2" />
                              <path d="M4 6v12a2 2 0 0 0 2 2h12" />
                            </svg>
                          )}
                          {idx % 4 === 1 && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                              <path d="m12 8-4 2.5v5L12 18l4-2.5v-5L12 8z" />
                            </svg>
                          )}
                          {idx % 4 === 2 && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m17 11-5-5-5 5" />
                              <path d="m17 18-5-5-5 5" />
                            </svg>
                          )}
                          {idx % 4 === 3 && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 17H3v-6l2-4h6l2 4v6h-2" />
                              <circle cx="7" cy="17" r="2" />
                              <circle cx="15" cy="17" r="2" />
                              <path d="M13 11h5l3 4v2h-3" />
                            </svg>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setMissionStatus(m.id, "success")}
                          className={`py-3.5 px-5 rounded-[12px] border text-[12px] font-bold uppercase tracking-[0.8px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isSuccess
                              ? "bg-[#dcfce7] border-[#86efac] text-[#15803d] shadow-xs"
                              : "bg-[#f8fafc] border-[#f1f5f9] text-[#cbd5e1] hover:border-[#cbd5e1] hover:text-[#64748b]"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                              isSuccess
                                ? "bg-[#15803d] text-white"
                                : "border border-[#cbd5e1] text-[#cbd5e1]"
                            }`}
                          >
                            ✓
                          </span>
                          <span>SUPERADO</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMissionStatus(m.id, "failed")}
                          className={`py-3.5 px-5 rounded-[12px] border text-[12px] font-bold uppercase tracking-[0.8px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isFailed
                              ? "bg-[#fee2e2] border-[#fca5a5] text-[#b91c1c] shadow-xs"
                              : "bg-[#f8fafc] border-[#f1f5f9] text-[#cbd5e1] hover:border-[#cbd5e1] hover:text-[#64748b]"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                              isFailed
                                ? "bg-[#b91c1c] text-white"
                                : "border border-[#cbd5e1] text-[#cbd5e1]"
                            }`}
                          >
                            ✕
                          </span>
                          <span>FALHA</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Judge Observations (Largura Total) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Judge Observations</span>
            <textarea
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Insira observações técnicas do juiz sobre sensores, locomoção ou desempenho..."
              className="w-full text-sm p-3.5 rounded-lg border border-slate-200 outline-none focus:border-[#00356a] focus:ring-1 focus:ring-[#00356a] font-mono"
            />
            <div className="flex justify-between items-center text-xs text-slate-400 font-mono pt-1">
              <span>TECHNICAL LOG • TIPO: {evaluationType.toUpperCase()}</span>
              <button
                onClick={handleSaveScorecard}
                className="bg-[#00356a] hover:bg-[#00468a] text-white px-7 py-3.5 rounded-lg text-sm font-bold transition-colors cursor-pointer shadow-sm"
              >
                Confirmar & Salvar Avaliação
              </button>
            </div>
          </div>
        </div>
      ) : evaluationType === "dancarino" ? (
        /* ═══ LAYOUT OFICIAL PARA MODO DANÇARINO (100% em Português, Alinhado e Proporcional) ═══ */
        <div className="flex flex-col gap-6 max-w-[1400px] w-full mx-auto">
          {/* Cabeçalho Principal */}
          <div className="bg-white rounded-[22px] border border-[#e2e8f0] p-7 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#0052cc] hover:text-[#00356a] mb-3.5 cursor-pointer transition-colors uppercase tracking-wider"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
                <span>Voltar para Seleção de Arenas ({arenaName})</span>
              </button>
              <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                <span className="inline-flex items-center gap-1.5 bg-[#00356a] text-white text-[10px] font-bold uppercase tracking-[1.2px] px-3.5 py-1.5 rounded-full">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                  <span>CATEGORIA: DANÇARINO</span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#fef3c7] border border-[#fde68a] text-[#92400e] text-[10px] font-bold uppercase tracking-[1.2px] px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#d97706] animate-pulse" />
                  <span>AVALIAÇÃO AO VIVO</span>
                </span>
              </div>
              <h2 className="font-['Space_Grotesk'] font-bold text-[#051d30] text-[30px] sm:text-[36px] tracking-[-0.6px] leading-tight">
                Avaliação de Performance — Robô Dançarino
              </h2>
              <p className="text-[#475569] text-[14px] mt-1.5 max-w-2xl leading-relaxed">
                Avalie precisão rítmica, expressão coreográfica e complexidade mecânica da equipe ao longo das 3 rodadas oficiais de apresentação.
              </p>
            </div>

            {/* Resumo Rápido da Equipe Selecionada */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] px-5 py-4 flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-[12px] bg-[#eef4ff] border border-[#cfe2ff] text-[#00356a] flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                  <line x1="8" y1="16" x2="8" y2="16" />
                  <line x1="16" y1="16" x2="16" y2="16" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#64748b] block">
                  EQUIPE EM AVALIAÇÃO
                </span>
                <span className="font-['Space_Grotesk'] font-bold text-[17px] text-[#051d30] block leading-snug">
                  {selectedTeam?.name || "Selecione uma equipe"}
                </span>
                <span className="font-mono text-[11px] font-semibold text-[#0052cc]">
                  Protocolo: {selectedTeam?.code || "---"} • Rodada 0{round}
                </span>
              </div>
            </div>
          </div>

          {/* Grid Principal Alinhado (Mesma Altura entre Coluna Esquerda e Direita) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Coluna Esquerda (4 Cols): Selecionar Equipe + Rodada de Apresentação */}
            <div className="lg:col-span-4 flex flex-col gap-6 justify-between">
              {/* Card 1: Selecionar Equipe */}
              <div className="bg-white rounded-[22px] p-6 border border-[#e2e8f0] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[10px] bg-[#eef4ff] text-[#00356a] flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-['Space_Grotesk'] font-bold text-[#051d30] text-[16px] block leading-none">
                        Selecionar Equipe
                      </span>
                      <span className="text-[11px] text-[#64748b]">
                        Escolha o robô na pista
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-[#f1f5f9] text-[#475569] px-2.5 py-1 rounded-md">
                    {teamsList.length} equipes
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 flex-1 justify-center">
                  {teamsList.length === 0 ? (
                    <div className="p-5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                      Nenhuma equipe cadastrada nesta arena.
                    </div>
                  ) : (
                    teamsList.map((t) => {
                      const isSel = selectedTeam?.id === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTeam(t)}
                          className={`w-full p-3.5 rounded-[14px] transition-all cursor-pointer flex items-center justify-between text-left border ${
                            isSel
                              ? "bg-[#eef4ff] border-[#00356a] shadow-xs"
                              : "bg-[#f8fafc] hover:bg-white border-[#e2e8f0] hover:border-[#cbd5e1]"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div
                              className={`w-9 h-9 rounded-[10px] flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                                isSel
                                  ? "bg-[#00356a] text-white"
                                  : "bg-white border border-[#e2e8f0] text-[#475569]"
                              }`}
                            >
                              {t.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-[14px] font-bold text-[#051d30] truncate">
                                {t.name}
                              </h4>
                              <p className="text-[11px] font-mono text-[#64748b] mt-0.5 truncate">
                                Protocolo: <strong className="text-[#00356a]">{t.code}</strong>
                              </p>
                            </div>
                          </div>
                          {isSel ? (
                            <span className="w-6 h-6 rounded-full bg-[#00356a] text-white flex items-center justify-center shrink-0 shadow-xs">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full border-2 border-[#cbd5e1] shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Card 2: Rodada de Apresentação */}
              <div className="bg-white rounded-[22px] p-6 border border-[#e2e8f0] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[10px] bg-[#fef3c7] text-[#92400e] flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-['Space_Grotesk'] font-bold text-[#051d30] text-[16px] block leading-none">
                        Rodada de Apresentação
                      </span>
                      <span className="text-[11px] text-[#64748b]">
                        Selecione a bateria (1 a 3)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {([1, 2, 3] as const).map((r) => {
                    const isAct = round === r;
                    const rScore =
                      r === 1
                        ? selectedTeam?.round1Metric
                        : r === 2
                        ? selectedTeam?.round2Metric
                        : selectedTeam?.round3Metric;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRound(r)}
                        className={`w-full px-4 py-3.5 rounded-[12px] text-[13px] font-bold flex items-center justify-between gap-2 transition-all cursor-pointer border ${
                          isAct
                            ? "bg-[#00356a] text-white border-[#00356a] shadow-sm"
                            : "bg-[#f8fafc] text-[#051d30] border-[#e2e8f0] hover:bg-[#eef4ff] hover:border-[#cfe2ff]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-md text-xs font-mono font-bold flex items-center justify-center ${
                              isAct ? "bg-white/20 text-white" : "bg-[#e2e8f0] text-[#051d30]"
                            }`}
                          >
                            0{r}
                          </span>
                          <span>Rodada {r}</span>
                        </div>
                        <span
                          className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                            isAct
                              ? "bg-[#00f2ff]/20 text-[#00f2ff]"
                              : rScore
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200/70 text-[#64748b]"
                          }`}
                        >
                          {isAct ? "Em Avaliação" : rScore ? `${rScore} pts` : "Pendente"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Coluna Direita (8 Cols): 3 Cards de Nota Alinhados + Card de Critérios de Avaliação */}
            <div className="lg:col-span-8 flex flex-col gap-6 justify-between">
              {/* Top 3 Cards de Pontuação das Rodadas (Mesmo Tamanho) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {([1, 2, 3] as const).map((r) => {
                  const isAct = round === r;
                  const rVal =
                    r === 1
                      ? selectedTeam?.round1Metric
                      : r === 2
                      ? selectedTeam?.round2Metric
                      : selectedTeam?.round3Metric;
                  const displayScore = isAct
                    ? totalDanceRoundScore
                    : rVal
                    ? rVal.replace(/Nota\s*/i, "").replace(/\s*\/\s*10/i, "")
                    : "--";

                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRound(r)}
                      className={`rounded-[18px] p-5 border transition-all cursor-pointer flex items-center justify-between text-left h-[96px] ${
                        isAct
                          ? "bg-white border-2 border-[#00356a] shadow-[0_6px_20px_rgba(0,53,106,0.08)]"
                          : "bg-white border-[#e2e8f0] hover:border-[#cbd5e1]"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[#64748b] block">
                          NOTA RODADA 0{r}
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span
                            className={`font-['Space_Grotesk'] font-black text-[28px] leading-none ${
                              displayScore === "--" ? "text-[#cbd5e1]" : "text-[#00356a]"
                            }`}
                          >
                            {displayScore}
                          </span>
                          {displayScore !== "--" && (
                            <span className="text-xs font-bold text-[#94a3b8]">/30</span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 ${
                          isAct
                            ? "bg-[#00356a] text-white"
                            : displayScore !== "--"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {displayScore !== "--" ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20v-6M6 20V10M18 20V4" />
                          </svg>
                        ) : (
                          <span className="font-mono text-xs font-bold">R{r}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Card Principal: Critérios de Avaliação */}
              <div className="bg-white rounded-[22px] border border-[#e2e8f0] p-7 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-7 flex-1">
                {/* Cabeçalho do Card */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-[12px] bg-[#eef4ff] text-[#00356a] flex items-center justify-center shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="21" x2="4" y2="14" />
                        <line x1="4" y1="10" x2="4" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12" y2="3" />
                        <line x1="20" y1="21" x2="20" y2="16" />
                        <line x1="20" y1="12" x2="20" y2="3" />
                        <line x1="1" y1="14" x2="7" y2="14" />
                        <line x1="9" y1="8" x2="15" y2="8" />
                        <line x1="17" y1="16" x2="23" y2="16" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-['Space_Grotesk'] font-bold text-[#051d30] text-[20px] leading-tight">
                        Critérios de Avaliação
                      </h3>
                      <p className="text-[13px] text-[#64748b] mt-0.5">
                        Avaliando atualmente:{" "}
                        <strong className="text-[#00356a]">Rodada 0{round}</strong> •{" "}
                        <span className="font-semibold text-[#334155]">{selectedTeam?.name}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#fef3c7] border border-[#fde68a] px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[1px] text-[#92400e]">
                    <span className="w-2 h-2 rounded-full bg-[#d97706] animate-ping" />
                    <span> PONTUAÇÃO EM TEMPO REAL</span>
                  </div>
                </div>

                {/* 3 Critérios com Sliders Padronizados e Alinhados */}
                <div className="flex flex-col gap-5">
                  {/* 1. Sincronia Musical & Ritmo */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] p-5 transition-all hover:border-[#cbd5e1]">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[10px] bg-white border border-[#e2e8f0] text-[#00356a] flex items-center justify-center shrink-0 shadow-2xs">
                          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18V5l12-2v13" />
                            <circle cx="6" cy="18" r="3" />
                            <circle cx="18" cy="16" r="3" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-['Space_Grotesk'] font-bold text-[#051d30] text-[16px] leading-snug">
                            Sincronia Musical & Ritmo
                          </h4>
                          <p className="text-[12px] text-[#64748b]">
                            Alinhamento dos movimentos com a batida da música e precisão de BPM.
                          </p>
                        </div>
                      </div>
                      <div className="bg-white border border-[#dce8fc] px-3.5 py-1.5 rounded-[10px] text-right shrink-0">
                        <span className="font-['Space_Grotesk'] font-black text-[24px] text-[#00356a] leading-none">
                          {danceScores.synchronization.toFixed(1)}
                        </span>
                        <span className="text-[11px] font-bold text-[#94a3b8] ml-0.5">/10</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={danceScores.synchronization}
                      onChange={(e) =>
                        setDanceScores((prev) => ({
                          ...prev,
                          synchronization: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-[#dbeafe] rounded-lg appearance-none cursor-pointer accent-[#00356a]"
                    />
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-[1px] text-[#64748b] mt-2">
                      <span>REGULAR (0)</span>
                      <span>INTERMEDIÁRIO (5)</span>
                      <span>IMPECÁVEL (10)</span>
                    </div>
                  </div>

                  {/* 2. Criatividade & Coreografia */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] p-5 transition-all hover:border-[#cbd5e1]">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[10px] bg-white border border-[#e2e8f0] text-[#00356a] flex items-center justify-center shrink-0 shadow-2xs">
                          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-['Space_Grotesk'] font-bold text-[#051d30] text-[16px] leading-snug">
                            Criatividade & Coreografia
                          </h4>
                          <p className="text-[12px] text-[#64748b]">
                            Originalidade artística da apresentação, presença de palco e fluidez visual.
                          </p>
                        </div>
                      </div>
                      <div className="bg-white border border-[#dce8fc] px-3.5 py-1.5 rounded-[10px] text-right shrink-0">
                        <span className="font-['Space_Grotesk'] font-black text-[24px] text-[#00356a] leading-none">
                          {danceScores.creativity.toFixed(1)}
                        </span>
                        <span className="text-[11px] font-bold text-[#94a3b8] ml-0.5">/10</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={danceScores.creativity}
                      onChange={(e) =>
                        setDanceScores((prev) => ({
                          ...prev,
                          creativity: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-[#dbeafe] rounded-lg appearance-none cursor-pointer accent-[#00356a]"
                    />
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-[1px] text-[#64748b] mt-2">
                      <span>BÁSICO (0)</span>
                      <span>CRIATIVO (5)</span>
                      <span>VISIONÁRIO (10)</span>
                    </div>
                  </div>

                  {/* 3. Complexidade Técnica & Mecânica */}
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[16px] p-5 transition-all hover:border-[#cbd5e1]">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[10px] bg-white border border-[#e2e8f0] text-[#00356a] flex items-center justify-center shrink-0 shadow-2xs">
                          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-['Space_Grotesk'] font-bold text-[#051d30] text-[16px] leading-snug">
                            Complexidade Técnica & Mecânica
                          </h4>
                          <p className="text-[12px] text-[#64748b]">
                            Grau de dificuldade cinemática, controle de servomotores e estabilidade.
                          </p>
                        </div>
                      </div>
                      <div className="bg-white border border-[#dce8fc] px-3.5 py-1.5 rounded-[10px] text-right shrink-0">
                        <span className="font-['Space_Grotesk'] font-black text-[24px] text-[#00356a] leading-none">
                          {danceScores.technicalComplexity.toFixed(1)}
                        </span>
                        <span className="text-[11px] font-bold text-[#94a3b8] ml-0.5">/10</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={danceScores.technicalComplexity}
                      onChange={(e) =>
                        setDanceScores((prev) => ({
                          ...prev,
                          technicalComplexity: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-[#dbeafe] rounded-lg appearance-none cursor-pointer accent-[#00356a]"
                    />
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-[1px] text-[#64748b] mt-2">
                      <span>BAIXA (0)</span>
                      <span>AVANÇADA (5)</span>
                      <span>ESPECIALISTA (10)</span>
                    </div>
                  </div>
                </div>

                {/* Rodapé do Card: Nota Final da Rodada + Botões Padronizados */}
                <div className="pt-5 border-t border-[#f1f5f9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[14px] bg-[#00356a] text-white flex items-center justify-center shadow-sm shrink-0">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                        <path d="M4 22h16" />
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#64748b] block">
                        NOTA TOTAL DA RODADA 0{round} (R1–R3)
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-['Space_Grotesk'] font-black text-[36px] text-[#00356a] leading-none">
                          {totalDanceRoundScore}
                        </span>
                        <span className="font-['Space_Grotesk'] font-bold text-[16px] text-[#64748b]">
                          / 30 pts
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={resetDanceRound}
                      className="flex-1 sm:flex-initial h-12 px-5 rounded-[12px] bg-[#eef4ff] hover:bg-[#dce8fc] text-[#00356a] font-bold text-[13px] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                      <span>Resetar Rodada</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveScorecard}
                      className="flex-1 sm:flex-initial h-12 px-6 rounded-[12px] bg-[#00356a] hover:bg-[#00468a] text-white font-bold text-[13px] inline-flex items-center justify-center gap-2.5 shadow-[0_4px_14px_rgba(0,53,106,0.25)] transition-all cursor-pointer"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      <span>Salvar Rodada</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Main 3-Column Grid (Tempo) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left Column: Select Team (3 Cols) */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm font-bold text-slate-500 uppercase tracking-wider">
                <span>Select Team</span>
                <span>{teamsList.length} equipes</span>
              </div>

              <div className="flex flex-col gap-3">
                {teamsList.length === 0 ? (
                  <div className="p-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500">
                    Nenhuma equipe cadastrada nesta arena. Adicione equipes em <strong>Arenas → Equipes</strong>.
                  </div>
                ) : (
                  teamsList.map((t) => {
                    const isSel = selectedTeam?.id === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTeam(t)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          isSel
                            ? "border-[#00356a] bg-[#eef4ff] shadow-sm"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <h4 className="text-base font-bold text-[#051d30] truncate">{t.name}</h4>
                          <p className={`text-xs font-mono ${isSel ? "text-[#00356a] font-semibold" : "text-slate-400"}`}>
                            Team ID: {t.code} • {t.institution}
                          </p>
                        </div>
                        {isSel ? (
                          <span className="w-7 h-7 rounded-full bg-[#00356a] text-white text-sm flex items-center justify-center font-bold shrink-0">
                            ✓
                          </span>
                        ) : (
                          <span className="w-6 h-6 rounded-full border-2 border-slate-300 shrink-0" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Center Column: Mode-Specific Scoring Console (Tempo) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* ─── MODO: TEMPO (Circuito/Linha) ─── */}
            <div className="bg-[#00356a] rounded-2xl p-8 text-white shadow-xl flex flex-col items-center justify-center text-center gap-5 relative overflow-hidden">
              <div className="flex items-center justify-between w-full text-sm font-mono tracking-widest text-blue-200 uppercase">
                <span>CIRCUIT TIME • {selectedTeam?.name}</span>
                <span className="bg-white/10 px-3 py-1 rounded">R{round}</span>
              </div>

              <div className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-white select-none py-3">
                {didNotFinish ? (
                  <span className="text-3xl sm:text-4xl text-red-300 font-black tracking-wider uppercase block">
                    NÃO TERMINADO (00:00.00 NO TELÃO)
                  </span>
                ) : (
                  formatDisplay(seconds + fouls * 5, millis)
                )}
              </div>

              {!didNotFinish && fouls > 0 && (
                <div className="text-xs font-mono text-amber-300 bg-white/10 px-3 py-1 rounded-full -mt-2">
                  Tempo base: {formatDisplay(seconds, millis)} + Penalidade: +{(fouls * 5).toFixed(1)}s ({fouls}{" "}
                  {fouls === 1 ? "falta" : "faltas"})
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={resetTimer}
                  className="w-14 h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-all cursor-pointer"
                  title="Resetar Cronômetro"
                >
                  ↺
                </button>
                <button
                  onClick={() => {
                    if (didNotFinish) setDidNotFinish(false);
                    setIsRunning((r) => !r);
                  }}
                  className={`px-10 py-4 rounded-xl font-bold text-base tracking-wider uppercase shadow-md transition-all active:scale-95 flex items-center gap-2.5 cursor-pointer ${
                    isRunning ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-[#ff9900] hover:bg-[#e68a00] text-white"
                  }`}
                >
                  <span>{isRunning ? "⏸" : "▶"}</span>
                  <span>{isRunning ? "PAUSE" : "START"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleMarkDidNotFinish}
                  className={`px-5 py-4 rounded-xl font-bold text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer border ${
                    didNotFinish
                      ? "bg-red-600 border-red-400 text-white shadow-lg"
                      : "bg-white/10 hover:bg-red-500/30 border-white/20 text-red-200 hover:text-white"
                  }`}
                  title="Marcar que a equipe não conseguiu terminar em tempo hábil (zera o tempo no Telão e registra como Não Terminado no Admin)"
                >
                  <span>⚠️</span>
                  <span>{didNotFinish ? "NÃO TERMINADO (ATIVO)" : "NÃO CONSEGUIU TERMINAR"}</span>
                </button>
              </div>
            </div>

            {/* Technical Penalties */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Technical Penalties</span>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setFouls((f) => Math.max(0, f - 1))}
                  className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg flex items-center justify-center cursor-pointer"
                >
                  −
                </button>
                <div className="text-center">
                  <span className="text-3xl font-bold text-[#051d30]">{String(fouls).padStart(2, "0")}</span>
                  <span className="text-xs block text-slate-500 font-semibold uppercase">Fouls</span>
                </div>
                <button
                  onClick={() => setFouls((f) => f + 1)}
                  className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
              <div className="bg-red-50 text-red-700 text-sm font-bold py-1.5 px-3 rounded-md text-center border border-red-200">
                {`Time Added: +${(fouls * 5).toFixed(1)}s`}
              </div>
            </div>

            {/* Judge Observations */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Judge Observations</span>
              <textarea
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Insira observações técnicas do juiz sobre sensores, locomoção ou desempenho..."
                className="w-full text-sm p-3.5 rounded-lg border border-slate-200 outline-none focus:border-[#00356a] focus:ring-1 focus:ring-[#00356a] font-mono"
              />
              <div className="flex justify-between items-center text-xs text-slate-400 font-mono pt-1">
                <span>TECHNICAL LOG • TIPO: {evaluationType.toUpperCase()}</span>
                <button
                  onClick={handleSaveScorecard}
                  className="bg-[#00356a] hover:bg-[#00468a] text-white px-6 py-3 rounded-lg text-sm font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Confirmar & Salvar Avaliação
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Performance Round & Live Standings */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                {evaluationType === "dancarino" ? "Apresentação / Bateria" : "Performance Round"}
              </span>
              <div className="flex flex-col gap-2.5">
                {([1, 2, 3] as const).map((r) => {
                  const rMetric =
                    r === 1
                      ? selectedTeam?.round1Metric
                      : r === 2
                      ? selectedTeam?.round2Metric
                      : selectedTeam?.round3Metric;
                  return (
                    <button
                      key={r}
                      onClick={() => setRound(r)}
                      className={`px-4 py-3.5 rounded-xl text-sm font-bold flex justify-between items-center transition-all cursor-pointer ${
                        round === r
                          ? "bg-[#00356a] text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span>{evaluationType === "dancarino" ? `Apresentação ${r}` : `Round ${r}`}</span>
                      <span
                        className={`text-xs uppercase font-mono px-2.5 py-0.5 rounded ${
                          round === r
                            ? "bg-white/20 text-white"
                            : rMetric === "NÃO TERMINADO"
                            ? "bg-red-100 text-red-700"
                            : rMetric
                            ? "bg-emerald-100 text-emerald-800"
                            : "text-slate-400"
                        }`}
                      >
                        {round === r ? "Active" : rMetric ? rMetric : "Pending"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Live Standings ({arenaName})
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">RANKING</span>
              </div>

              <div className="flex flex-col gap-2.5 text-sm">
                {[...teamsList]
                  .sort((a, b) => b.points - a.points)
                  .map((tm, idx) => (
                    <div
                      key={tm.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between ${
                        idx === 0 && tm.points > 0
                          ? "bg-amber-50/80 border-amber-300 font-bold"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center ${
                            idx === 0 && tm.points > 0 ? "bg-amber-500" : "bg-slate-400"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 text-base">{tm.name}</span>
                          <div className="flex gap-1.5 mt-0.5 items-center">
                            {idx === 0 && tm.points > 0 && (
                              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-mono">
                                LÍDER
                              </span>
                            )}
                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-mono">
                              {tm.points} PTS
                            </span>
                            {(tm.round1Metric || tm.round2Metric || tm.round3Metric) && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                {[
                                  tm.round1Metric ? `R1: ${tm.round1Metric}` : null,
                                  tm.round2Metric ? `R2: ${tm.round2Metric}` : null,
                                  tm.round3Metric ? `R3: ${tm.round3Metric}` : null,
                                ]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-slate-900 text-sm sm:text-base">
                        {tm.bestMetric}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
