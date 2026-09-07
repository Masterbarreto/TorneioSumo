// filepath: src/EntrarEquipeModal.tsx
import { useState, useEffect } from "react";
import { UserSession } from "./utils/cookies";

interface TeamItem {
  id: string;
  name: string;
  teamId?: string;
  code?: string;
  status: string;
  members?: any[];
}

interface EntrarEquipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSession | null;
  onSuccess: (teamData: any) => void;
}

export default function EntrarEquipeModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: EntrarEquipeModalProps) {
  const [mode, setMode] = useState<"code" | "list">("code");
  const [teamCode, setTeamCode] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [role, setRole] = useState("Programador(a)");
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setLoadingTeams(true);
      fetch("http://localhost:3000/api/v1/Equipes")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setTeams(data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingTeams(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleJoin = async () => {
    setError("");
    const targetCode = mode === "code" ? teamCode.trim() : "";
    const targetId = mode === "list" ? selectedTeamId : "";

    if (mode === "code" && !targetCode) {
      setError("Por favor, insira o código de convite da equipe.");
      return;
    }
    if (mode === "list" && !targetId) {
      setError("Selecione uma equipe da lista para ingressar.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:3000/api/v1/Equipes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          teamCode: targetCode || undefined,
          teamId: targetId || undefined,
          role,
          memberData: {
            name: user?.name || "Aluno Competidor",
            email: user?.email || "",
          },
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        setError(data.error || "Não foi possível ingressar na equipe.");
        return;
      }

      onSuccess(data.team);
    } catch (err) {
      setSubmitting(false);
      setError("Erro ao conectar ao servidor. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#00356a] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
              🤝
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] font-bold text-lg leading-tight">
                Entrar para uma Equipe
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Vincule-se como competidor em um time já existente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3">
          <button
            onClick={() => setMode("code")}
            className={`pb-3 text-xs font-bold font-['Space_Grotesk'] tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              mode === "code"
                ? "border-[#00356a] text-[#00356a]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            🔑 Código de Convite
          </button>
          <button
            onClick={() => setMode("list")}
            className={`pb-3 text-xs font-bold font-['Space_Grotesk'] tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              mode === "list"
                ? "border-[#00356a] text-[#00356a]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            📋 Equipes Cadastradas ({teams.length})
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium flex items-center gap-2">
              <span className="text-base">⚠️</span>
              {error}
            </div>
          )}

          {mode === "code" ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-['Space_Grotesk']">
                Código da Equipe / ID
              </label>
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                placeholder="Ex: #RA-2026-299 ou CYBERKNIGHTS"
                className="w-full px-4 py-3 bg-[#f0f4fa] border border-slate-200 rounded-xl text-sm font-['Inter'] text-slate-900 focus:bg-white focus:border-[#00356a] focus:ring-2 focus:ring-[#00356a]/10 outline-none transition-all uppercase placeholder:normal-case placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Peça o código de 7 dígitos ao capitão ou líder técnico da sua equipe.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-['Space_Grotesk']">
                Selecione a Equipe
              </label>
              {loadingTeams ? (
                <div className="p-4 text-center text-xs text-slate-500 animate-pulse">
                  Carregando equipes ativas...
                </div>
              ) : teams.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  Nenhuma equipe encontrada no momento. Crie sua própria equipe!
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {teams.map((t) => (
                    <label
                      key={t.id}
                      className={`flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedTeamId === t.id ? "bg-blue-50/70 border-l-4 border-[#00356a]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="team_select"
                          checked={selectedTeamId === t.id}
                          onChange={() => setSelectedTeamId(t.id)}
                          className="accent-[#00356a]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 uppercase">
                            {t.name}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {t.teamId || t.code || "Equipe Homologada"} • {t.members?.length || 0}/5 membros
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                        {t.status}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-['Space_Grotesk']">
              Sua Função Técnica no Time
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-[#f0f4fa] border border-slate-200 rounded-xl text-sm font-['Inter'] text-slate-900 focus:bg-white focus:border-[#00356a] outline-none transition-all cursor-pointer"
            >
              <option value="Piloto / Operador">🎮 Piloto / Operador da Arena</option>
              <option value="Programador(a) de Sensores">💻 Programador(a) de Sensores & Estratégia</option>
              <option value="Engenheiro(a) Mecânico">⚙️ Engenheiro(a) Mecânico / Chassi & Lâmina</option>
              <option value="Estrategista Técnico">📊 Estrategista & Telemetria</option>
              <option value="Capitão(ã) Adjunto">🛡️ Capitão(ã) Adjunto</option>
            </select>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
            <span className="text-base">📌</span>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Ao ingressar na equipe, você terá acesso à credencial de box, ao passaporte técnico do robô e às lutas marcadas da equipe no telão.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase font-['Space_Grotesk'] tracking-wider cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleJoin}
            disabled={submitting}
            className="px-6 py-2.5 bg-[#00356a] hover:bg-[#00468a] text-white rounded-xl text-xs font-bold font-['Space_Grotesk'] uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-blue-900/10 active:scale-[0.98] cursor-pointer flex items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                VINCULANDO...
              </>
            ) : (
              "CONFIRMAR ENTRADA →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
