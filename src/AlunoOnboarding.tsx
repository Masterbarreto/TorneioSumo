// filepath: src/AlunoOnboarding.tsx
import { UserSession } from "./utils/cookies";

interface AlunoOnboardingProps {
  user: UserSession | null;
  onCreateTeam: () => void;
  onJoinTeam: () => void;
  onLogout: () => void;
}

export default function AlunoOnboarding({
  user,
  onCreateTeam,
  onJoinTeam,
  onLogout,
}: AlunoOnboardingProps) {
  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#051d30] flex flex-col font-['Inter',sans-serif]">
      {/* ─── Top Bar ────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sm:px-12 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-6">
          <span className="font-['Space_Grotesk'] font-bold text-[#00356a] tracking-[2.5px] text-[15px] uppercase">
            ROBOTIC_SYNC
          </span>
          <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Portal do Competidor
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00356a] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {(user?.name || "AL")[0].toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {user?.name || "Aluno Competidor"}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">
                Estudante / Competidor
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wider font-['Space_Grotesk'] flex items-center gap-1.5"
          >
            <span>🚪</span> Sair
          </button>
        </div>
      </header>

      {/* ─── Hero Content ──────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col justify-center gap-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block px-3.5 py-1 rounded-full bg-blue-100 text-[#00356a] text-[11px] font-bold tracking-wider uppercase font-['Space_Grotesk'] mb-3">
            PRIMEIRO ACESSO • TORNEIO 2026
          </span>
          <h1 className="font-['Space_Grotesk'] font-bold text-3xl sm:text-4xl text-[#051d30] tracking-tight">
            Bem-vindo à Arena SENAC Robotics!
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Olá, <strong>{user?.name || "Competidor"}</strong>. Para acessar a chave de lutas,
            o telão de projeção e a sua credencial técnica de box, você precisa fazer parte de uma equipe oficial.
            Escolha como deseja começar:
          </p>
        </div>

        {/* ─── Two Options Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Criar Nova Equipe */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-[#00356a] shadow-lg shadow-blue-900/5 hover:shadow-xl hover:shadow-blue-900/10 transition-all flex flex-col justify-between gap-6 group">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-['Space_Grotesk']">
                  Liderança & Capitania
                </span>
                <span className="text-3xl">🛡️</span>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] font-bold text-2xl text-[#051d30] group-hover:text-[#00356a] transition-colors">
                  Criar Minha Equipe
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
                  Seja o capitão e monte sua equipe do zero. Defina o nome, anexe os termos de ciência,
                  adicione seus colegas e homologue seu robô de combate na arena de Sumô.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-2 border border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Formulário em 3 etapas simples (Identidade, Membros, Revisão)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Adicione até 5 competidores técnicos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Geração imediata do código de convite para seu time</span>
                </div>
              </div>
            </div>

            <button
              onClick={onCreateTeam}
              className="w-full py-4 bg-[#00356a] hover:bg-[#00468a] text-white rounded-xl text-xs font-bold font-['Space_Grotesk'] uppercase tracking-wider shadow-md shadow-blue-900/15 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              CRIAR NOVA EQUIPE →
            </button>
          </div>

          {/* Card 2: Entrar para uma Equipe */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-[#0284c7] shadow-lg shadow-blue-900/5 hover:shadow-xl hover:shadow-blue-900/10 transition-all flex flex-col justify-between gap-6 group">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-sky-100 text-sky-800 rounded-full font-['Space_Grotesk']">
                  Ingresso Rápido
                </span>
                <span className="text-3xl">🤝</span>
              </div>

              <div>
                <h2 className="font-['Space_Grotesk'] font-bold text-2xl text-[#051d30] group-hover:text-[#0284c7] transition-colors">
                  Entrar para uma Equipe
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
                  Já recebeu um código de convite do seu capitão ou deseja encontrar a equipe de robótica
                  da sua turma ou instituição? Vincule-se em poucos cliques.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-2 border border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span>Insira o Código Único do Capitão (ex: CAP-CYBE-3429)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span>Defina sua função técnica (Programador, Mecânico, Piloto)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span>Acesso instantâneo ao crachá QR Code e à chave de lutas</span>
                </div>
              </div>
            </div>

            <button
              onClick={onJoinTeam}
              className="w-full py-4 bg-white hover:bg-sky-50 text-[#00356a] border-2 border-[#00356a] rounded-xl text-xs font-bold font-['Space_Grotesk'] uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              ENTRAR COM CÓDIGO DO CAPITÃO →
            </button>
          </div>
        </div>

        {/* Support hint */}
        <p className="text-center text-xs text-slate-400">
          Dúvidas sobre o regulamento ou formação de equipes? Acesse os{" "}
          <span className="text-[#00356a] font-semibold underline cursor-pointer">
            Manuais Técnicos Oficiais de 2026
          </span>
          .
        </p>
      </main>
    </div>
  );
}
