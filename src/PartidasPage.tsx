import { useState, useEffect, useRef } from "react";
import AdminSidebar from "./AdminSidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "line_follower" | "dancerino" | "obstaculos";
type RoundKey = "r1" | "r2" | "r3" | "r4" | "r5" | "final";
type ProjSlide = "ranking" | "podium" | "bracket";

interface RoundScore {
  value: number | null; // seconds for lf/obs, points 0-100 for dancerino
  dnf: boolean;
}

interface TeamData {
  id: string;
  name: string;
  color: string;
  scores: Record<Category, Record<RoundKey, RoundScore>>;
}

interface RoundMeta {
  key: RoundKey;
  label: string;
  released: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = "admin@2026";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "line_follower", label: "Line Follower" },
  { key: "dancerino",    label: "Dançarino"     },
  { key: "obstaculos",   label: "Obstáculos"    },
];

const ROUND_LABELS: Record<RoundKey, string> = {
  r1: "Round 1", r2: "Round 2", r3: "Round 3",
  r4: "Round 4", r5: "Round 5", final: "Grand Final",
};

const ROUNDS_META: RoundMeta[] = [
  { key: "r1",    label: "Round 1",     released: false },
  { key: "r2",    label: "Round 2",     released: false },
  { key: "r3",    label: "Round 3",     released: false },
  { key: "r4",    label: "Round 4",     released: false },
  { key: "r5",    label: "Round 5",     released: false },
  { key: "final", label: "Grand Final", released: false },
];

function emptyScores(): Record<Category, Record<RoundKey, RoundScore>> {
  const rounds: Record<RoundKey, RoundScore> = {
    r1: { value: null, dnf: false }, r2: { value: null, dnf: false },
    r3: { value: null, dnf: false }, r4: { value: null, dnf: false },
    r5: { value: null, dnf: false }, final: { value: null, dnf: false },
  };
  return {
    line_follower: { ...rounds, r1: { value: null, dnf: false }, r2: { value: null, dnf: false }, r3: { value: null, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } },
    dancerino:     { ...rounds },
    obstaculos:    { ...rounds },
  };
}

const INITIAL_TEAMS: TeamData[] = [
  { id: "t1", name: "ROBOTECH_PRIME", color: "#f59e0b", scores: { ...emptyScores(), line_follower: { r1: { value: 30.5, dnf: false }, r2: { value: 28.3, dnf: false }, r3: { value: 27.1, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } }, dancerino: { r1: { value: 89, dnf: false }, r2: { value: 91, dnf: false }, r3: { value: null, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } }, obstaculos: { r1: { value: 44.2, dnf: false }, r2: { value: 41.0, dnf: false }, r3: { value: null, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } } } },
  { id: "t2", name: "CYBER_SYNC_A",   color: "#3b82f6", scores: { ...emptyScores(), line_follower: { r1: { value: 32.1, dnf: false }, r2: { value: 30.0, dnf: false }, r3: { value: 29.5, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } }, dancerino: { r1: { value: 85, dnf: false }, r2: { value: 88, dnf: false }, r3: { value: null, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } }, obstaculos: { r1: { value: 46.8, dnf: false }, r2: { value: 43.2, dnf: false }, r3: { value: null, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } } } },
  { id: "t3", name: "VOID_WALKER",    color: "#10b981", scores: { ...emptyScores(), line_follower: { r1: { value: 35.7, dnf: false }, r2: { value: 33.2, dnf: false }, r3: { value: 31.0, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } }, dancerino: { r1: { value: 78, dnf: false }, r2: { value: 82, dnf: false }, r3: { value: null, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } }, obstaculos: { r1: { value: 50.1, dnf: false }, r2: { value: 47.5, dnf: false }, r3: { value: null, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } } } },
  { id: "t4", name: "OMEGA_POINT",    color: "#8b5cf6", scores: { ...emptyScores(), line_follower: { r1: { value: 38.0, dnf: false }, r2: { value: 36.4, dnf: false }, r3: { value: 34.1, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } }, dancerino: { r1: { value: 72, dnf: false }, r2: { value: 75, dnf: false }, r3: { value: null, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } }, obstaculos: { r1: { value: 53.3, dnf: false }, r2: { value: 51.0, dnf: false }, r3: { value: null, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } } } },
  { id: "t5", name: "TITAN_FORCE",    color: "#ec4899", scores: { ...emptyScores(), line_follower: { r1: { value: 41.2, dnf: false }, r2: { value: 39.8, dnf: false }, r3: { value: 38.5, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } }, dancerino: { r1: { value: 68, dnf: false }, r2: { value: 71, dnf: false }, r3: { value: null, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } }, obstaculos: { r1: { value: 58.7, dnf: false }, r2: { value: 55.2, dnf: false }, r3: { value: null, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } } } },
  { id: "t6", name: "CYBER_PULSE",    color: "#06b6d4", scores: { ...emptyScores(), line_follower: { r1: { value: null, dnf: true }, r2: { value: 42.1, dnf: false }, r3: { value: null, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } }, dancerino: { r1: { value: 63, dnf: false }, r2: { value: null, dnf: false }, r3: { value: null, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } }, obstaculos: { r1: { value: 61.0, dnf: false }, r2: { value: null, dnf: false }, r3: { value: null, dnf: false }, r4: { value: null, dnf: false }, r5: { value: null, dnf: false }, final: { value: null, dnf: false } } } },
];

// ─── Scoring helpers ──────────────────────────────────────────────────────────

function bestScore(team: TeamData, cat: Category, rounds: RoundKey[]): number | null {
  if (cat === "dancerino") {
    const vals = rounds.map((r) => team.scores[cat][r]).filter((s) => s && !s.dnf && s.value !== null).map((s) => s!.value!);
    return vals.length ? Math.max(...vals) : null;
  }
  const vals = rounds.map((r) => team.scores[cat][r]).filter((s) => s && !s.dnf && s.value !== null).map((s) => s!.value!);
  return vals.length ? Math.min(...vals) : null;
}

function rankTeams(teams: TeamData[], cat: Category, rounds: RoundKey[], releasedRounds: Set<RoundKey>) {
  const releasedRoundsList = rounds.filter((r) => releasedRounds.has(r));
  return teams
    .map((t) => ({ team: t, best: bestScore(t, cat, releasedRoundsList.length ? releasedRoundsList : rounds) }))
    .sort((a, b) => {
      if (a.best === null && b.best === null) return 0;
      if (a.best === null) return 1;
      if (b.best === null) return -1;
      if (cat === "dancerino") return b.best - a.best;
      return a.best - b.best;
    });
}

function fmtVal(v: number | null, cat: Category): string {
  if (v === null) return "—";
  if (cat === "dancerino") return v.toFixed(1);
  return v.toFixed(2) + "s";
}

function fmtTimer(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

// ─── Score edit modal ─────────────────────────────────────────────────────────

function ScoreModal({ team, cat, round, current, onSave, onClose }: {
  team: TeamData; cat: Category; round: RoundKey;
  current: RoundScore; onSave: (v: RoundScore) => void; onClose: () => void;
}) {
  const [pass, setPass] = useState("");
  const [authed, setAuthed] = useState(false);
  const [passErr, setPassErr] = useState(false);
  const [val, setVal] = useState(current.value !== null ? String(current.value) : "");
  const [dnf, setDnf] = useState(current.dnf);

  function tryAuth() {
    if (pass === ADMIN_PASSWORD) { setAuthed(true); setPassErr(false); }
    else { setPassErr(true); }
  }

  function save() {
    const num = parseFloat(val);
    onSave({ value: dnf ? null : (isNaN(num) ? null : num), dnf });
  }

  return (
    <div className="fixed inset-0 z-[9500] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white rounded-[14px] shadow-2xl p-7" style={{ width: 400 }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: team.color + "22" }}>
            <div className="w-3 h-3 rounded-full" style={{ background: team.color }} />
          </div>
          <div>
            <p className="font-bold text-[15px] text-[#051d30]">{team.name}</p>
            <p className="text-[11px] text-[#8c9ab0] uppercase tracking-[0.5px]">{CATEGORIES.find((c) => c.key === cat)!.label} · {ROUND_LABELS[round]}</p>
          </div>
        </div>

        {!authed ? (
          <>
            <p className="text-[13px] text-[#475569] mb-3">Digite a senha de administrador para editar este resultado.</p>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && tryAuth()}
              placeholder="Senha do administrador"
              className="w-full rounded-[8px] px-4 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#f59e0b] mb-1"
              style={{ border: `1px solid ${passErr ? "#ef4444" : "#e2e8f0"}` }} />
            {passErr && <p className="text-[11px] text-red-500 mb-3">Senha incorreta.</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-[8px] text-[13px] font-semibold text-[#475569]" style={{ border: "1px solid #e2e8f0" }}>Cancelar</button>
              <button onClick={tryAuth} className="flex-1 py-2.5 rounded-[8px] text-[13px] font-bold text-black" style={{ background: "#f59e0b" }}>Confirmar</button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={dnf} onChange={(e) => setDnf(e.target.checked)} className="w-4 h-4 accent-red-500" />
                <span className="text-[13px] font-semibold text-red-500">DNF (Não Finalizou)</span>
              </label>
            </div>
            {!dnf && (
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-[#8c9ab0] uppercase tracking-[1px] mb-1">
                  {cat === "dancerino" ? "Pontuação (0–100)" : "Tempo (segundos)"}
                </label>
                <input type="number" step="0.01" min="0" max={cat === "dancerino" ? "100" : undefined}
                  value={val} onChange={(e) => setVal(e.target.value)}
                  placeholder={cat === "dancerino" ? "Ex: 89.5" : "Ex: 32.48"}
                  className="w-full rounded-[8px] px-4 py-2.5 text-[15px] font-mono outline-none focus:ring-2 focus:ring-[#f59e0b]"
                  style={{ border: "1px solid #e2e8f0" }} />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-[8px] text-[13px] font-semibold text-[#475569]" style={{ border: "1px solid #e2e8f0" }}>Cancelar</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-[8px] text-[13px] font-bold text-black" style={{ background: "#f59e0b" }}>Salvar Resultado</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Admin scores table ───────────────────────────────────────────────────────

function ScoresTable({ teams, setTeams, cat, round, releasedRounds }: {
  teams: TeamData[]; setTeams: React.Dispatch<React.SetStateAction<TeamData[]>>;
  cat: Category; round: RoundKey;
  releasedRounds: Set<RoundKey>;
}) {
  const [editing, setEditing] = useState<{ teamId: string; cat: Category; round: RoundKey } | null>(null);

  const ranked = rankTeams(teams, cat, ["r1","r2","r3","r4","r5"], releasedRounds);

  function saveScore(teamId: string, score: RoundScore) {
    setTeams((prev) => prev.map((t) =>
      t.id === teamId ? { ...t, scores: { ...t.scores, [cat]: { ...t.scores[cat], [round]: score } } } : t
    ));
    setEditing(null);
  }

  const editTeam = editing ? teams.find((t) => t.id === editing.teamId) : null;

  return (
    <>
      {editing && editTeam && (
        <ScoreModal
          team={editTeam} cat={editing.cat} round={editing.round}
          current={editTeam.scores[editing.cat][editing.round]}
          onSave={(score) => saveScore(editing.teamId, score)}
          onClose={() => setEditing(null)} />
      )}
      <div className="bg-white rounded-[10px] overflow-hidden" style={{ border: "1px solid rgba(194,198,210,0.3)" }}>
        {/* Table header */}
        <div className="grid px-5 py-3 text-[10px] font-bold uppercase tracking-[1.5px]"
          style={{ gridTemplateColumns: "48px 1fr 120px 120px 120px 48px", color: "#8c9ab0", borderBottom: "1px solid #f1f5f9" }}>
          <span>#</span><span>Equipe</span><span>Melhor</span><span>{ROUND_LABELS[round]}</span><span>Status</span><span />
        </div>
        {ranked.map(({ team, best }, i) => {
          const sc = team.scores[cat][round];
          const released = releasedRounds.has(round);
          return (
            <div key={team.id} className="grid items-center px-5 py-3 hover:bg-[#f8fafc] transition-colors"
              style={{ gridTemplateColumns: "48px 1fr 120px 120px 120px 48px", borderBottom: "1px solid #f8fafc" }}>
              <span className="font-bold text-[14px]" style={{ color: i === 0 ? "#f59e0b" : "#94a3b8" }}>{String(i + 1).padStart(2, "0")}</span>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: team.color }} />
                <span className="font-semibold text-[13px] text-[#051d30]">{team.name}</span>
              </div>
              <span className="font-mono text-[13px] font-bold" style={{ color: i === 0 ? "#f59e0b" : "#051d30" }}>
                {fmtVal(best, cat)}
              </span>
              <span className="font-mono text-[13px]" style={{ color: sc?.dnf ? "#ef4444" : "#475569" }}>
                {sc?.dnf ? "DNF" : fmtVal(sc?.value ?? null, cat)}
              </span>
              <div>
                {released ? (
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.5px]" style={{ background: "#d1fae5", color: "#065f46" }}>Liberado</span>
                ) : (
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.5px]" style={{ background: "#fef3c7", color: "#92400e" }}>Pendente</span>
                )}
              </div>
              <button onClick={() => setEditing({ teamId: team.id, cat, round })}
                className="p-1.5 rounded-lg hover:bg-[#edf4ff] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Main PartidasPage ────────────────────────────────────────────────────────

export default function PartidasPage({
  onNavigate, onLogout, championshipStarted, onStartChampionship,
}: {
  onNavigate: (key: string) => void;
  onLogout: () => void;
  championshipStarted: boolean;
  onStartChampionship: () => void;
}) {
  const [teams, setTeams] = useState<TeamData[]>(INITIAL_TEAMS);
  const [rounds, setRounds] = useState<RoundMeta[]>(ROUNDS_META);
  const [cat, setCat] = useState<Category>("line_follower");
  const [activeRound, setActiveRound] = useState<RoundKey>("r1");
  const [projSlide, setProjSlide] = useState<ProjSlide>("ranking");
  const [timer, setTimer] = useState(3600);
  const [timerRunning, setTimerRunning] = useState(false);
  const [toast, setToast] = useState("");
  const projChannel = useRef<BroadcastChannel | null>(null);

  const releasedRounds = new Set<RoundKey>(rounds.filter((r) => r.released).map((r) => r.key));

  // Open a persistent BroadcastChannel for syncing the projection window
  useEffect(() => {
    projChannel.current = new BroadcastChannel("robotic_proj");
    return () => { projChannel.current?.close(); projChannel.current = null; };
  }, []);

  // Broadcast current state whenever any projection-relevant data changes
  useEffect(() => {
    if (!championshipStarted) return;
    const state = { cat, round: activeRound, slide: projSlide, timer, teams };
    try {
      localStorage.setItem("robotic_proj_state", JSON.stringify(state));
      projChannel.current?.postMessage(state);
    } catch {}
  }, [teams, cat, activeRound, projSlide, timer, championshipStarted]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  function toggleRelease(key: RoundKey) {
    setRounds((prev) => prev.map((r) => r.key === key ? { ...r, released: !r.released } : r));
    const meta = rounds.find((r) => r.key === key);
    showToast(meta?.released ? `${ROUND_LABELS[key]} bloqueado.` : `${ROUND_LABELS[key]} liberado!`);
  }

  function navigate(key: string) {
    if (key === "partidas") return;
    onNavigate(key);
  }

  function openProjectionWindow(slide: ProjSlide) {
    const state = { cat, round: activeRound, slide, timer, teams };
    try {
      localStorage.setItem("robotic_proj_state", JSON.stringify(state));
      projChannel.current?.postMessage(state);
    } catch {}
    window.open(
      window.location.origin + window.location.pathname + "?proj=1",
      "robotic_sync_proj",
      "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no"
    );
  }

  return (
    <div className="fixed inset-0 z-[800] flex overflow-hidden" style={{ background: "#f7f9ff" }}>
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#051d30] text-white text-sm px-4 py-3 rounded-lg shadow-xl">{toast}</div>
      )}

      <AdminSidebar active="partidas" onNavigate={navigate} onLogout={onLogout} />

      <div className="flex flex-col flex-1 overflow-hidden" style={{ marginLeft: 256 }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 shrink-0" style={{ height: 64, borderBottom: "1px solid rgba(194,198,210,0.3)", background: "#f7f9ff" }}>
          <div>
            <p className="text-[11px] font-semibold tracking-[2px] uppercase" style={{ color: "#8c4f00" }}>Administração de Partidas</p>
            <p className="font-bold text-[18px] text-[#051d30] leading-tight">Partidas</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Timer controls */}
            <div className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ background: "white", border: "1px solid rgba(194,198,210,0.4)" }}>
              <span className="font-mono font-bold text-[#051d30] text-[14px]">{fmtTimer(timer)}</span>
              <button onClick={() => setTimerRunning((v) => !v)} className="rounded px-2 py-0.5 text-[10px] font-bold" style={{ background: timerRunning ? "#fee2e2" : "#d1fae5", color: timerRunning ? "#dc2626" : "#065f46" }}>
                {timerRunning ? "⏸ Pausar" : "▶ Iniciar"}
              </button>
              <button onClick={() => { setTimer(3600); setTimerRunning(false); }} className="text-[10px] text-[#94a3b8] hover:text-[#475569]">↺</button>
            </div>

            {/* Project button — opens a separate browser window */}
            <button onClick={() => openProjectionWindow(projSlide)}
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-[12px] font-bold text-white hover:opacity-90 transition-opacity"
              style={{ background: "#00356a" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              Projetar
            </button>

            {/* Start championship */}
            {!championshipStarted ? (
              <button onClick={onStartChampionship}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-[12px] font-bold text-black hover:opacity-90 transition-opacity"
                style={{ background: "#f59e0b" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Iniciar Campeonato
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "#d1fae5", border: "1px solid #6ee7b7" }}>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[11px] font-bold text-green-700 uppercase tracking-[0.5px]">Campeonato Ativo</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {!championshipStarted ? (
            // Pre-championship state
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#fef3c7" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
              <h2 className="font-bold text-[22px] text-[#051d30]">Campeonato não iniciado</h2>
              <p className="text-[13px] text-[#8c9ab0] text-center" style={{ maxWidth: 380 }}>
                Clique em "Iniciar Campeonato" para ativar o gerenciamento de partidas e liberar os resultados para projeção.
              </p>
              <button onClick={onStartChampionship}
                className="mt-2 px-6 py-3 rounded-[10px] font-bold text-black text-[14px]" style={{ background: "#f59e0b" }}>
                Iniciar Campeonato Agora
              </button>
            </div>
          ) : (
            <>
              {/* Category tabs */}
              <div className="flex gap-2 mb-5">
                {CATEGORIES.map(({ key, label }) => (
                  <button key={key} onClick={() => setCat(key)}
                    className="px-5 py-2 rounded-[8px] text-[12px] font-bold transition-all"
                    style={{ background: cat === key ? "#051d30" : "white", color: cat === key ? "white" : "#475569", border: cat === key ? "none" : "1px solid rgba(194,198,210,0.4)" }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Round tabs + release toggle */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex gap-1.5 flex-wrap">
                  {rounds.map(({ key, label, released }) => (
                    <button key={key} onClick={() => setActiveRound(key)}
                      className="relative px-4 py-2 rounded-[6px] text-[11px] font-bold uppercase tracking-[0.5px] transition-all"
                      style={{ background: activeRound === key ? "#f59e0b" : "white", color: activeRound === key ? "black" : "#475569", border: activeRound === key ? "none" : "1px solid rgba(194,198,210,0.4)" }}>
                      {label}
                      {released && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                      )}
                    </button>
                  ))}
                </div>
                <button onClick={() => toggleRelease(activeRound)}
                  className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-[12px] font-bold transition-all"
                  style={{ background: releasedRounds.has(activeRound) ? "#fee2e2" : "#d1fae5", color: releasedRounds.has(activeRound) ? "#dc2626" : "#065f46", border: `1px solid ${releasedRounds.has(activeRound) ? "#fca5a5" : "#6ee7b7"}` }}>
                  {releasedRounds.has(activeRound) ? (
                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Bloquear</>
                  ) : (
                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg> Liberar Resultados</>
                  )}
                </button>
              </div>

              {/* Scores table */}
              <ScoresTable teams={teams} setTeams={setTeams} cat={cat} round={activeRound} releasedRounds={releasedRounds} />

              {/* Quick overview - all teams */}
              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#8c9ab0] mb-3">Classificação Geral — {CATEGORIES.find((c) => c.key === cat)!.label}</p>
                <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                  {rankTeams(teams, cat, ["r1","r2","r3","r4","r5"], releasedRounds).map(({ team, best }, i) => (
                    <div key={team.id} className="bg-white rounded-[8px] px-4 py-3 flex items-center gap-3"
                      style={{ border: `1px solid ${i === 0 ? "rgba(245,158,11,0.4)" : "rgba(194,198,210,0.3)"}` }}>
                      <span className="font-black text-[18px] w-8 shrink-0" style={{ color: i === 0 ? "#f59e0b" : "#94a3b8" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: team.color }} />
                      <span className="font-semibold text-[12px] text-[#051d30] flex-1 truncate">{team.name}</span>
                      <span className="font-mono font-bold text-[13px]" style={{ color: i === 0 ? "#f59e0b" : "#475569" }}>
                        {fmtVal(best, cat)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projection mode selector */}
              <div className="mt-6 p-5 rounded-[12px] flex items-center justify-between" style={{ background: "#051d30" }}>
                <div>
                  <p className="font-bold text-white text-[14px]">Modo Projeção</p>
                  <p className="text-[12px] mt-0.5" style={{ color: "#475569" }}>Escolha a tela a ser projetada durante o campeonato.</p>
                </div>
                <div className="flex gap-2">
                  {([["ranking","Ranking"], ["podium","Pódio"], ["bracket","Chave"]] as [ProjSlide, string][]).map(([s, lbl]) => (
                    <button key={s} onClick={() => { setProjSlide(s); openProjectionWindow(s as ProjSlide); }}
                      className="px-4 py-2 rounded-[8px] text-[12px] font-bold transition-all"
                      style={{ background: projSlide === s ? "#f59e0b" : "rgba(245,158,11,0.3)", color: "black" }}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
