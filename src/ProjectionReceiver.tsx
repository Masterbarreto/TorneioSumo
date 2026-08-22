import { useState, useEffect } from "react";

// ─── Types (mirrored from PartidasPage) ──────────────────────────────────────

type Category = "line_follower" | "dancerino" | "obstaculos";
type RoundKey = "r1" | "r2" | "r3" | "r4" | "r5" | "final";
type ProjSlide = "ranking" | "podium" | "bracket";

interface RoundScore {
  value: number | null;
  dnf: boolean;
}

interface TeamData {
  id: string;
  name: string;
  color: string;
  scores: Record<Category, Record<RoundKey, RoundScore>>;
}

interface ProjectionState {
  cat: Category;
  round: RoundKey;
  slide: ProjSlide;
  timer: number;
  teams: TeamData[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "line_follower", label: "Line Follower" },
  { key: "dancerino",    label: "Dançarino"     },
  { key: "obstaculos",   label: "Obstáculos"    },
];

const ROUND_LABELS: Record<RoundKey, string> = {
  r1: "Round 1", r2: "Round 2", r3: "Round 3",
  r4: "Round 4", r5: "Round 5", final: "Grand Final",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bestScore(team: TeamData, cat: Category, rounds: RoundKey[]): number | null {
  if (cat === "dancerino") {
    const vals = rounds.map((r) => team.scores[cat][r]).filter((s) => s && !s.dnf && s.value !== null).map((s) => s!.value!);
    return vals.length ? Math.max(...vals) : null;
  }
  const vals = rounds.map((r) => team.scores[cat][r]).filter((s) => s && !s.dnf && s.value !== null).map((s) => s!.value!);
  return vals.length ? Math.min(...vals) : null;
}

function rankTeams(teams: TeamData[], cat: Category, rounds: RoundKey[]) {
  return teams
    .map((t) => ({ team: t, best: bestScore(t, cat, rounds) }))
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

// ─── Projection screens ───────────────────────────────────────────────────────

function ProjRanking({ teams, cat, round, timer, slide, setSlide, onClose }: {
  teams: TeamData[]; cat: Category; round: RoundKey;
  timer: number; slide: ProjSlide; setSlide: (s: ProjSlide) => void; onClose: () => void;
}) {
  const ROUNDS_TO_SHOW: RoundKey[] = ["r1", "r2", "r3", "r4", "r5"];
  const ranked = rankTeams(teams, cat, ROUNDS_TO_SHOW);
  const catLabel = CATEGORIES.find((c) => c.key === cat)!.label.toUpperCase();
  const SLIDES: ProjSlide[] = ["ranking", "podium", "bracket"];

  return (
    <div className="fixed inset-0 z-0 flex flex-col" style={{ background: "#0b1221", fontFamily: "sans-serif" }}>
      <div className="flex items-center justify-between px-8 py-3" style={{ background: "#f59e0b" }}>
        <div className="flex items-center gap-4">
          <span className="font-black text-black text-[13px] tracking-[3px] uppercase">ROBOTIC_SYNC</span>
          <span className="text-black/60 text-[11px]">|</span>
          <span className="font-bold text-black text-[14px] tracking-[2px] uppercase">{catLabel} RANKING</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono font-bold text-black text-[18px] tracking-[2px]">{fmtTimer(timer)}</span>
          <button onClick={onClose} className="bg-black/20 hover:bg-black/40 transition-colors rounded px-3 py-1 text-black text-[11px] font-bold tracking-[1px]">
            ✕ FECHAR
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-10 py-6 flex flex-col gap-4">
        <div className="grid gap-4 px-4 mb-1" style={{ gridTemplateColumns: "60px 1fr 120px 120px 120px" }}>
          {["#", "EQUIPE", "MELHOR", "R1", "R2"].map((h) => (
            <span key={h} className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: "#8c9ab0" }}>{h}</span>
          ))}
        </div>
        {ranked.map(({ team, best }, i) => {
          const pos = i + 1;
          const isFirst = pos === 1;
          return (
            <div key={team.id}
              className="grid items-center gap-4 px-4 py-3 rounded-lg"
              style={{
                gridTemplateColumns: "60px 1fr 120px 120px 120px",
                background: isFirst ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.04)",
                border: isFirst ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.06)",
              }}>
              <span className="font-black text-[22px]" style={{ color: isFirst ? "#f59e0b" : "#8c9ab0" }}>
                {String(pos).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: team.color }} />
                <span className="font-bold text-[15px] tracking-[1px]" style={{ color: isFirst ? "#f59e0b" : "white" }}>
                  {team.name}
                </span>
              </div>
              <span className="font-mono font-bold text-[14px]" style={{ color: isFirst ? "#f59e0b" : "white" }}>
                {fmtVal(best, cat)}
              </span>
              {(["r1", "r2"] as RoundKey[]).map((r) => {
                const s = team.scores[cat][r];
                return (
                  <span key={r} className="font-mono text-[13px]" style={{ color: "#64748b" }}>
                    {s?.dnf ? "DNF" : fmtVal(s?.value ?? null, cat)}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between px-10 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <span className="font-mono font-bold text-[#f59e0b] text-[28px] tracking-[3px]">
          {fmtTimer(Math.max(0, timer % 3600))}
        </span>
        <div className="flex items-center gap-3">
          {SLIDES.map((s) => (
            <button key={s} onClick={() => setSlide(s)}
              className="rounded-full transition-all"
              style={{ width: slide === s ? 24 : 8, height: 8, background: slide === s ? "#f59e0b" : "rgba(255,255,255,0.25)" }} />
          ))}
        </div>
        <span className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: "#475569" }}>
          {ROUND_LABELS[round]}
        </span>
      </div>
    </div>
  );
}

function ProjPodium({ teams, cat, round, timer, slide, setSlide, onClose }: {
  teams: TeamData[]; cat: Category; round: RoundKey;
  timer: number; slide: ProjSlide; setSlide: (s: ProjSlide) => void; onClose: () => void;
}) {
  const ROUNDS_TO_SHOW: RoundKey[] = ["r1", "r2", "r3"];
  const ranked = rankTeams(teams, cat, ROUNDS_TO_SHOW);
  const [first, second, third] = ranked;
  const catLabel = CATEGORIES.find((c) => c.key === cat)!.label.toUpperCase();
  const SLIDES: ProjSlide[] = ["ranking", "podium", "bracket"];

  return (
    <div className="fixed inset-0 z-0 flex flex-col" style={{ background: "#0b1221", fontFamily: "sans-serif" }}>
      <div className="flex items-center justify-between px-8 py-3" style={{ background: "#f59e0b" }}>
        <div className="flex items-center gap-4">
          <span className="font-black text-black text-[13px] tracking-[3px] uppercase">ROBOTIC_SYNC</span>
          <span className="text-black/60 text-[11px]">|</span>
          <span className="font-bold text-black text-[14px] tracking-[2px] uppercase">{catLabel}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono font-bold text-black text-[18px]">{fmtTimer(timer)}</span>
          <button onClick={onClose} className="bg-black/20 hover:bg-black/40 transition-colors rounded px-3 py-1 text-black text-[11px] font-bold">✕ FECHAR</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-10">
        <div className="flex items-end justify-center gap-6" style={{ width: "100%", maxWidth: 800 }}>
          {second && (
            <div className="flex flex-col items-center gap-3" style={{ flex: 1 }}>
              <span className="font-black text-[48px]" style={{ color: "#94a3b8" }}>02</span>
              <div className="rounded-xl px-6 py-4 text-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", width: "100%" }}>
                <p className="font-bold text-[16px] text-white tracking-[1px]">{second.team.name}</p>
                <p className="font-mono text-[#94a3b8] text-[14px] mt-1">{fmtVal(second.best, cat)}</p>
              </div>
            </div>
          )}
          {first && (
            <div className="flex flex-col items-center gap-3" style={{ flex: 1.3 }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1" style={{ background: "#f59e0b" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              </div>
              <span className="font-black text-[64px] leading-none" style={{ color: "#f59e0b" }}>01</span>
              <div className="rounded-xl px-6 py-5 text-center" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.5)", width: "100%" }}>
                <p className="font-black text-[20px] tracking-[2px] uppercase" style={{ color: "#f59e0b" }}>{first.team.name}</p>
                <p className="font-mono font-bold text-white text-[18px] mt-1">{fmtVal(first.best, cat)}</p>
              </div>
            </div>
          )}
          {third && (
            <div className="flex flex-col items-center gap-3" style={{ flex: 1 }}>
              <span className="font-black text-[48px]" style={{ color: "#94a3b8" }}>03</span>
              <div className="rounded-xl px-6 py-4 text-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", width: "100%" }}>
                <p className="font-bold text-[16px] text-white tracking-[1px]">{third.team.name}</p>
                <p className="font-mono text-[#94a3b8] text-[14px] mt-1">{fmtVal(third.best, cat)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full" style={{ maxWidth: 800 }}>
          <div className="grid gap-2 px-4 mb-2" style={{ gridTemplateColumns: "50px 1fr 100px 100px 100px" }}>
            {["#", "EQUIPE", "R1", "R2", "R3"].map((h) => (
              <span key={h} className="text-[9px] font-bold tracking-[2px] uppercase" style={{ color: "#475569" }}>{h}</span>
            ))}
          </div>
          {ranked.map(({ team }, i) => (
            <div key={team.id} className="grid items-center gap-4 px-4 py-2.5 rounded-lg mb-1"
              style={{ gridTemplateColumns: "50px 1fr 100px 100px 100px", background: "rgba(255,255,255,0.03)" }}>
              <span className="font-bold text-[13px]" style={{ color: "#475569" }}>{String(i + 1).padStart(2, "0")}</span>
              <span className="font-semibold text-[13px] text-white tracking-[0.5px]">{team.name}</span>
              {(["r1", "r2", "r3"] as RoundKey[]).map((r) => {
                const s = team.scores[cat][r];
                return <span key={r} className="font-mono text-[12px]" style={{ color: "#64748b" }}>{s?.dnf ? "DNF" : fmtVal(s?.value ?? null, cat)}</span>;
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-10 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <span className="font-mono font-bold text-[#f59e0b] text-[28px] tracking-[3px]">{fmtTimer(Math.max(0, timer % 3600))}</span>
        <div className="flex items-center gap-3">
          {SLIDES.map((s) => (
            <button key={s} onClick={() => setSlide(s)} className="rounded-full transition-all"
              style={{ width: slide === s ? 24 : 8, height: 8, background: slide === s ? "#f59e0b" : "rgba(255,255,255,0.25)" }} />
          ))}
        </div>
        <span className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: "#475569" }}>{ROUND_LABELS[round]}</span>
      </div>
    </div>
  );
}

function ProjBracket({ teams, cat, timer, slide, setSlide, onClose }: {
  teams: TeamData[]; cat: Category;
  timer: number; slide: ProjSlide; setSlide: (s: ProjSlide) => void; onClose: () => void;
}) {
  const ROUNDS_TO_SHOW: RoundKey[] = ["r1", "r2", "r3"];
  const ranked = rankTeams(teams, cat, ROUNDS_TO_SHOW);
  const [s1, s2, s3, s4] = ranked.map((r) => r.team);
  const SLIDES: ProjSlide[] = ["ranking", "podium", "bracket"];
  const [bracketTimer, setBracketTimer] = useState(180);

  useEffect(() => {
    const id = setInterval(() => setBracketTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-0 flex flex-col" style={{ background: "#0b1221", fontFamily: "sans-serif" }}>
      <div className="flex items-center justify-between px-8 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-6">
          <span className="font-black text-[13px] tracking-[3px] uppercase" style={{ color: "#f59e0b" }}>ROBOTIC_SYNC</span>
          <div>
            <p className="font-black text-[20px] tracking-[2px] text-white uppercase">CHAVE DE CONFRONTOS</p>
            <p className="text-[11px] tracking-[1px] uppercase" style={{ color: "#475569" }}>Grand Final · Ao Vivo</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-[11px] font-bold tracking-[1px] uppercase">Ao Vivo</span>
          </div>
          <span className="font-mono font-bold text-white text-[18px]">{fmtTimer(timer)}</span>
          <button onClick={onClose} className="rounded px-3 py-1 text-[11px] font-bold text-white" style={{ background: "rgba(255,255,255,0.1)" }}>✕ FECHAR</button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center gap-0 px-8">
        <div className="flex flex-col gap-3" style={{ width: 220 }}>
          <p className="text-[9px] font-bold tracking-[2px] uppercase text-center mb-2" style={{ color: "#475569" }}>SEMI FINAL 1</p>
          {[s1, s3].map((t, i) => (
            <div key={i} className="rounded-lg px-4 py-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold" style={{ color: "#475569" }}>0{i + 1}</span>
                <div className="w-2 h-2 rounded-full" style={{ background: t?.color ?? "#475569" }} />
                <span className="font-bold text-[13px] text-white tracking-[0.5px]">{t?.name ?? "—"}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-4 px-6" style={{ width: 400 }}>
          <p className="font-black text-[13px] tracking-[3px] uppercase text-center mb-4" style={{ color: "#f59e0b" }}>GRANDE FINAL</p>
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 rounded-xl px-4 py-4 text-center" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <p className="text-[9px] font-bold tracking-[2px] uppercase mb-1" style={{ color: "#f59e0b" }}>TIME 1</p>
              <p className="font-black text-[15px] text-white tracking-[1px]">{s1?.name ?? "?"}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-black text-[24px] text-white">VS</span>
              <span className="font-mono font-bold text-[#f59e0b] text-[16px]">{fmtTimer(bracketTimer)}</span>
            </div>
            <div className="flex-1 rounded-xl px-4 py-4 text-center" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <p className="text-[9px] font-bold tracking-[2px] uppercase mb-1" style={{ color: "#f59e0b" }}>TIME 2</p>
              <p className="font-black text-[15px] text-white tracking-[1px]">{s2?.name ?? "?"}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3" style={{ width: 220 }}>
          <p className="text-[9px] font-bold tracking-[2px] uppercase text-center mb-2" style={{ color: "#475569" }}>SEMI FINAL 2</p>
          {[s2, s4].map((t, i) => (
            <div key={i} className="rounded-lg px-4 py-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold" style={{ color: "#475569" }}>0{i + 1}</span>
                <div className="w-2 h-2 rounded-full" style={{ background: t?.color ?? "#475569" }} />
                <span className="font-bold text-[13px] text-white tracking-[0.5px]">{t?.name ?? "—"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-10 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <span className="font-mono font-bold text-[#f59e0b] text-[28px] tracking-[3px]">{fmtTimer(bracketTimer)}</span>
        <div className="flex items-center gap-3">
          {SLIDES.map((s) => (
            <button key={s} onClick={() => setSlide(s)} className="rounded-full transition-all"
              style={{ width: slide === s ? 24 : 8, height: 8, background: slide === s ? "#f59e0b" : "rgba(255,255,255,0.25)" }} />
          ))}
        </div>
        <span className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: "#475569" }}>Grand Final</span>
      </div>
    </div>
  );
}

// ─── Waiting screen ───────────────────────────────────────────────────────────

function WaitingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6" style={{ background: "#0b1221" }}>
      <div className="flex items-center gap-3 mb-2">
        <span className="font-black text-[16px] tracking-[4px] uppercase" style={{ color: "#f59e0b" }}>ROBOTIC_SYNC</span>
        <span style={{ color: "#475569", fontSize: 13 }}>|</span>
        <span className="text-[13px] tracking-[2px] uppercase font-bold" style={{ color: "#475569" }}>Projeção</span>
      </div>
      <div className="w-12 h-12 rounded-full border-4 border-[#1e3a5f] border-t-[#f59e0b] animate-spin" />
      <p className="text-[13px] tracking-[1px]" style={{ color: "#475569" }}>
        Aguardando sinal do painel de administração...
      </p>
      <p className="text-[11px]" style={{ color: "#334155" }}>
        Clique em "Projetar" no painel admin para transmitir.
      </p>
    </div>
  );
}

// ─── ProjectionReceiver ───────────────────────────────────────────────────────

function readInitialState(): ProjectionState | null {
  try {
    const raw = localStorage.getItem("robotic_proj_state");
    return raw ? (JSON.parse(raw) as ProjectionState) : null;
  } catch {
    return null;
  }
}

export default function ProjectionReceiver() {
  const [state, setState] = useState<ProjectionState | null>(readInitialState);
  // Local slide lets the projection window navigate slides independently
  const [localSlide, setLocalSlide] = useState<ProjSlide | null>(null);

  useEffect(() => {
    // Sync title
    document.title = "ROBOTIC_SYNC — Projeção";

    const ch = new BroadcastChannel("robotic_proj");
    ch.onmessage = (e: MessageEvent<ProjectionState>) => {
      setState(e.data);
      // When admin explicitly changes the slide, follow it
      setLocalSlide(null);
    };
    return () => ch.close();
  }, []);

  if (!state) return <WaitingScreen />;

  const slide = localSlide ?? state.slide;

  const sharedProps = {
    teams: state.teams,
    cat: state.cat,
    round: state.round,
    timer: state.timer,
    slide,
    setSlide: (s: ProjSlide) => setLocalSlide(s),
    onClose: () => window.close(),
  };

  if (slide === "ranking") return <ProjRanking {...sharedProps} />;
  if (slide === "podium")  return <ProjPodium  {...sharedProps} />;
  return <ProjBracket teams={state.teams} cat={state.cat} timer={state.timer} slide={slide} setSlide={(s) => setLocalSlide(s)} onClose={() => window.close()} />;
}
