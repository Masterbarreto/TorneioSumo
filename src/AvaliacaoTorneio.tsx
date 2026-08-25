import { useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  icon: string;
  description: string;
  tag: string;
};

type Team = {
  id: string;
  name: string;
  alias: string;
  wins: number;
  penalties: number;
  score: string;
  color: string;
};

const categories: Category[] = [
  {
    id: "sumo",
    name: "Sumô",
    icon: "⚙️",
    description: "Combate de força e estratégia, com foco em empurrão e controle de centro do tatame.",
    tag: "SUMÔ",
  },
  {
    id: "drag",
    name: "Drag Race",
    icon: "🏁",
    description: "Velocidade, aceleração e precisão em curvas e propulsion.",
    tag: "DRAG",
  },
  {
    id: "sprint",
    name: "Sprint",
    icon: "⚡",
    description: "Desempenho em velocidade, estabilidade e reação.",
    tag: "SPRINT",
  },
];

const allTeams: Team[] = [
  { id: "t1", name: "Cyber-Bear", alias: "CB", wins: 12, penalties: 1, score: "#12", color: "#f59e0b" },
  { id: "t2", name: "Nova-Prisme", alias: "NP", wins: 7, penalties: 2, score: "#07", color: "#f97316" },
  { id: "t3", name: "Titan-X", alias: "TX", wins: 10, penalties: 0, score: "#10", color: "#3b82f6" },
  { id: "t4", name: "Vold-Walker", alias: "VW", wins: 8, penalties: 3, score: "#08", color: "#60a5fa" },
  { id: "t5", name: "Nova-Prime", alias: "NP", wins: 9, penalties: 2, score: "#09", color: "#a78bfa" },
  { id: "t6", name: "AlphaBot", alias: "AB", wins: 11, penalties: 1, score: "#11", color: "#22c55e" },
];

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

function Sidebar() {
  return (
    <aside className="w-[220px] shrink-0 border-r border-[#d8e5f3] bg-[#edf4ff] p-3 flex flex-col">
      <div className="px-2 pb-4 pt-2">
        <div className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-black text-[14px] tracking-[3px] uppercase text-[#00356a]">
          ROBOTIC_SYNC
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="px-2 text-[10px] uppercase tracking-[1.5px] text-[#6b7a8e] font-['Inter:Bold',Inter,sans-serif] font-bold">
          Active team selector
        </div>

        <button className="flex w-full items-center justify-between rounded-md border border-[#dfeaf8] bg-white/80 px-3 py-2 text-left text-[12px] text-[#1e293b] shadow-sm">
          <span className="font-['Inter:Regular',Inter,sans-serif]">AlphaBot</span>
          <span className="text-[10px] text-[#64748b]">▾</span>
        </button>

        <nav className="mt-3 space-y-1">
          {[
            "Times",
            "Participantes",
            "Membros",
            "Notas",
            "Settings",
          ].map((item, index) => (
            <button
              key={item}
              className={`flex w-full items-center gap-3 rounded-[4px] px-[16px] py-[12px] text-left text-[13px] uppercase tracking-[0.7px] transition-all duration-150 hover:bg-white/50 ${
                index === 0 ? "bg-white/70 text-[#1f2937]" : "text-[#475569]"
              }`}
            >
              <svg width="18" height="19" viewBox="0 0 18 19" fill="none" aria-hidden="true" className="shrink-0">
                <path d="M0 19V17H12V19H0ZM5.65 14.15L0 8.5L2.1 6.35L7.8 12L5.65 14.15ZM12 7.8L6.35 2.1L8.5 0L14.15 5.65L12 7.8ZM16.6 18L3.55 4.95L4.95 3.55L18 16.6L16.6 18Z" fill="currentColor" />
              </svg>
              <span className="font-['Inter:Regular',Inter,sans-serif]">{item}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto space-y-2 border-t border-[#d8e5f3] pt-3">
        <button className="flex w-full items-center gap-2 rounded-[4px] px-3 py-2 text-[11px] uppercase tracking-[1px] text-[#475569] hover:bg-white/50">
          <span>◌</span>
          <span>Support</span>
        </button>
        <button className="flex w-full items-center gap-2 rounded-[4px] px-3 py-2 text-[11px] uppercase tracking-[1px] text-[#ef4444] hover:bg-white/50">
          <span>↩</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

function CategorySelectionScreen({
  selectedCategory,
  onSelectCategory,
  onContinue,
}: {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex-1 bg-[#edf4ff] p-6">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3 text-[12px] uppercase tracking-[1.8px] text-[#64748b] font-['Inter:Bold',Inter,sans-serif] font-bold">
          <span>TOURNAMENT ACTIVE</span>
          <span className="font-['Inter:Regular',Inter,sans-serif] text-[#00356a]">●</span>
        </div>
      </div>

      <div className="rounded-[10px] bg-[#edf4ff] p-1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[14px] uppercase tracking-[2px] text-[#64748b] font-['Inter:Bold',Inter,sans-serif] font-bold">
              Category: {selectedCategory.tag}
            </div>
            <h1 className="mt-2 text-[42px] font-black leading-none tracking-[-1.6px] text-[#00356a] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif]">
              Arena Selection Hub
            </h1>
            <p className="mt-3 max-w-[760px] text-[16px] text-[#475569] font-['Inter:Regular',Inter,sans-serif]">
              Selecione a categoria para inicializar a avaliação do tournament. Insira a arena correta antes de verificar o confronto.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[16px] border border-[#d8e5f3] bg-[#dfeeff] p-5">
          <div className="mb-4 text-[14px] font-bold uppercase tracking-[1.5px] text-[#00356a] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif]">
            Seleção de categoria
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {categories.map((category) => {
              const active = selectedCategory.id === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => onSelectCategory(category)}
                  className={`rounded-[14px] border p-4 text-left transition-all duration-200 ${
                    active
                      ? "border-[#00356a] bg-white shadow-[0_8px_22px_rgba(0,53,106,0.08)]"
                      : "border-[#d8e5f3] bg-[#f3f8ff] hover:border-[#7aa2d8]"
                  }`}
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#d7e8ff] text-[22px]">
                    {category.icon}
                  </div>
                  <div className="text-[18px] font-black text-[#00356a] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif]">
                    {category.name}
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#475569] font-['Inter:Regular',Inter,sans-serif]">
                    {category.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onContinue}
              className="rounded-[8px] bg-[#00356a] px-6 py-3 text-[12px] font-bold uppercase tracking-[1.5px] text-white shadow-[0_6px_18px_rgba(0,53,106,0.25)] transition-all hover:bg-[#00468a]"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamSelectionScreen({
  selectedCategory,
  teams,
  onSortear,
  onSelectMatch,
  onContinue,
}: {
  selectedCategory: Category;
  teams: Team[];
  onSortear: () => void;
  onSelectMatch: (index: number) => void;
  onContinue: () => void;
}) {
  const pairs = useMemo(() => {
    const ordered = [...teams];
    const result: Team[][] = [];
    for (let i = 0; i < ordered.length; i += 2) {
      if (i + 1 < ordered.length) {
        result.push([ordered[i], ordered[i + 1]]);
      }
    }
    return result;
  }, [teams]);

  return (
    <div className="flex-1 bg-[#edf4ff] p-6">
      <div className="flex items-center justify-between gap-3 pb-4">
        <div>
          <div className="text-[12px] uppercase tracking-[2px] text-[#64748b] font-['Inter:Bold',Inter,sans-serif] font-bold">
            {selectedCategory.tag}
          </div>
          <h1 className="mt-2 text-[42px] font-black leading-none tracking-[-1.6px] text-[#00356a] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif]">
            Seleção de Times
          </h1>
        </div>

        <button
          onClick={onSortear}
          className="rounded-[8px] bg-[#00356a] px-5 py-3 text-[11px] font-bold uppercase tracking-[1.4px] text-white shadow-[0_6px_18px_rgba(0,53,106,0.2)] transition-all hover:bg-[#00468a]"
        >
          Sortear times
        </button>
      </div>

      <div className="rounded-[16px] border border-[#d8e5f3] bg-[#dfeeff] p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="text-[14px] font-bold uppercase tracking-[1.5px] text-[#00356a] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif]">
            Confrontos
          </div>
          <button
            onClick={onContinue}
            className="rounded-[8px] border border-[#00356a] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[1.5px] text-[#00356a] transition-all hover:bg-[#edf4ff]"
          >
            Avaliar duelo
          </button>
        </div>

        <div className="grid gap-3">
          {pairs.map(([a, b], index) => (
            <button
              key={`${a.id}-${b.id}`}
              onClick={() => onSelectMatch(index)}
              className="flex w-full items-center justify-between rounded-[12px] border border-[#d8e5f3] bg-white px-4 py-3 text-left shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-all hover:border-[#7aa2d8] hover:bg-[#f7fbff]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full text-[12px] font-black text-white shadow-sm" style={{ background: a.color }}>
                  {a.alias}
                </div>
                <div>
                  <div className="text-[12px] uppercase tracking-[1.2px] text-[#64748b] font-['Inter:Bold',Inter,sans-serif] font-bold">
                    Team A
                  </div>
                  <div className="text-[20px] font-black tracking-[-0.8px] text-[#00356a] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif]">
                    {a.name}
                  </div>
                </div>
              </div>

              <div className="px-3 text-[24px] font-bold text-[#94a3b8]">VS</div>

              <div className="flex items-center gap-4">
                <div>
                  <div className="text-right text-[12px] uppercase tracking-[1.2px] text-[#64748b] font-['Inter:Bold',Inter,sans-serif] font-bold">
                    Team B
                  </div>
                  <div className="text-right text-[20px] font-black tracking-[-0.8px] text-[#00356a] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif]">
                    {b.name}
                  </div>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full text-[12px] font-black text-white shadow-sm" style={{ background: b.color }}>
                  {b.alias}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function EvaluationScreen({
  category,
  matchup,
  onBack,
}: {
  category: Category;
  matchup: [Team, Team];
  onBack: () => void;
}) {
  const [judgeNote, setJudgeNote] = useState(" ");
  const [timer, setTimer] = useState(14 * 60 + 42);

  const mm = String(Math.floor(timer / 60)).padStart(2, "0");
  const ss = String(timer % 60).padStart(2, "0");

  return (
    <div className="flex-1 bg-[#edf4ff] p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="text-[12px] uppercase tracking-[2px] text-[#64748b] font-['Inter:Bold',Inter,sans-serif] font-bold">
            {category.tag}
          </div>
          <h1 className="mt-2 text-[42px] font-black leading-none tracking-[-1.6px] text-[#00356a] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif]">
            {category.name}
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="rounded-[8px] border border-[#d8e5f3] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[1.2px] text-[#00356a] hover:bg-[#f8fbff]"
          >
            Voltar
          </button>
          <button className="rounded-[8px] bg-[#00356a] px-5 py-3 text-[11px] font-bold uppercase tracking-[1.2px] text-white shadow-[0_6px_18px_rgba(0,53,106,0.2)] hover:bg-[#00468a]">
            Gerar confrontos
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[18px] bg-[#0f3d78] p-6 shadow-[0_10px_25px_rgba(0,53,106,0.22)]">
            <div className="mb-5 flex items-center justify-between text-[11px] uppercase tracking-[1.8px] text-[#dbeafe] font-['Inter:Bold',Inter,sans-serif] font-bold">
              <span>Combat time</span>
              <span>Live</span>
            </div>

            <div className="flex items-center justify-center gap-6">
              <div className="text-center text-white">
                <div className="text-[11px] uppercase tracking-[1.4px] text-[#dbeafe] font-['Inter:Bold',Inter,sans-serif] font-bold">
                  {matchup[0].name}
                </div>
                <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-full font-black" style={{ background: matchup[0].color }}>
                  {matchup[0].alias}
                </div>
              </div>

              <div className="text-center text-[72px] font-black leading-none tracking-[-4px] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif]">
                {mm}:{ss}
              </div>

              <div className="text-center text-white">
                <div className="text-[11px] uppercase tracking-[1.4px] text-[#dbeafe] font-['Inter:Bold',Inter,sans-serif] font-bold">
                  {matchup[1].name}
                </div>
                <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-full font-black" style={{ background: matchup[1].color }}>
                  {matchup[1].alias}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-[10px] uppercase tracking-[1.2px] text-[#dbeafe] font-['Inter:Bold',Inter,sans-serif] font-bold">
              <span>Início</span>
              <span>Tempo</span>
              <span>Finais</span>
            </div>
          </div>

          <div className="rounded-[18px] border border-[#d8e5f3] bg-white p-4">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[1.5px] text-[#64748b] font-['Inter:Bold',Inter,sans-serif]">
              Observações do juiz
            </div>
            <textarea
              value={judgeNote}
              onChange={(event) => setJudgeNote(event.target.value)}
              placeholder="Insira observações técnicas, penalidades e critérios da avaliação."
              className="h-[120px] w-full resize-none rounded-[10px] border border-[#d8e5f3] bg-[#f8fbff] p-3 text-[14px] text-[#1e293b] outline-none placeholder:text-[#94a3b8]"
            />
          </div>
        </div>

        <div className="rounded-[18px] bg-[#0d2f5e] p-4 text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)]">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[1.6px] text-[#dbeafe] font-['Inter:Bold',Inter,sans-serif]">
            Avaliação
          </div>

          <div className="space-y-3">
            {[matchup[0], matchup[1]].map((team, idx) => (
              <div key={team.id} className="rounded-[12px] border border-white/10 bg-[#163d6c] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: team.color }}>
                      {team.alias}
                    </div>
                    <div className="text-[18px] font-black tracking-[-0.7px] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif]">
                      {team.name}
                    </div>
                  </div>
                  <div className="text-[12px] font-bold uppercase tracking-[1px] text-[#fbbf24]">
                    {idx === 0 ? "Winner" : "Penalty"}
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="rounded-[8px] bg-[#1f4d81] px-2 py-2 text-center text-[10px] uppercase tracking-[1px] text-[#dbeafe] font-['Inter:Bold',Inter,sans-serif]">
                    Pontos
                    <div className="mt-1 text-[20px] font-black text-white">{team.wins}</div>
                  </div>
                  <div className="rounded-[8px] bg-[#1f4d81] px-2 py-2 text-center text-[10px] uppercase tracking-[1px] text-[#dbeafe] font-['Inter:Bold',Inter,sans-serif]">
                    Penalidade
                    <div className="mt-1 text-[20px] font-black text-white">{team.penalties}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button className="flex-1 rounded-[8px] bg-[#f59e0b] px-3 py-3 text-[11px] font-bold uppercase tracking-[1.2px] text-white hover:bg-[#e88b00]">
              Registrar
            </button>
            <button className="flex-1 rounded-[8px] border border-white/20 bg-[#102b4f] px-3 py-3 text-[11px] font-bold uppercase tracking-[1.2px] text-white hover:bg-[#15376b]">
              Encerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AvaliacaoTorneio() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<Category>(categories[0]);
  const [teams, setTeams] = useState<Team[]>(() => shuffle(allTeams));
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number>(0);

  const selectedMatchup = useMemo<[Team, Team]>(() => {
    const pair = [...teams];
    const idx = selectedMatchIndex * 2;
    return [pair[idx], pair[idx + 1] ?? pair[0]] as [Team, Team];
  }, [selectedMatchIndex, teams]);

  const goToStep2 = () => setStep(2);
  const goToStep3 = () => setStep(3);

  return (
    <div className="min-h-screen bg-[#edf4ff] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] overflow-hidden border border-[#d8e5f3] bg-[#edf4ff] shadow-[0_15px_40px_rgba(15,23,42,0.06)]">
        <Sidebar />

        {step === 1 && (
          <CategorySelectionScreen
            selectedCategory={category}
            onSelectCategory={(next) => setCategory(next)}
            onContinue={goToStep2}
          />
        )}

        {step === 2 && (
          <TeamSelectionScreen
            selectedCategory={category}
            teams={teams}
            onSortear={() => setTeams(shuffle(allTeams))}
            onSelectMatch={(index) => {
              setSelectedMatchIndex(index);
              goToStep3();
            }}
            onContinue={goToStep3}
          />
        )}

        {step === 3 && (
          <EvaluationScreen
            category={category}
            matchup={selectedMatchup}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}
