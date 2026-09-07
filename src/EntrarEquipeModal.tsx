// filepath: src/EntrarEquipeModal.tsx
import { useState } from "react";
import { UserSession } from "./utils/cookies";

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
  const [captainCode, setCaptainCode] = useState("");
  const [role, setRole] = useState("Programador(a) de Sensores");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleJoin = async () => {
    setError("");
    const cleanCode = captainCode.trim().toUpperCase();

    if (!cleanCode) {
      setError("Por favor, digite o Código Único fornecido pelo capitão da sua equipe.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:3000/api/v1/Equipes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          captainCode: cleanCode,
          role,
          memberData: {
            name: user?.name || "Marcus Silva",
            email: user?.email || "marcus.silva@senac.edu.br",
          },
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        setError(data.error || "Não foi possível ingressar na equipe com este código.");
        return;
      }

      onSuccess(data.team);
    } catch (err) {
      setSubmitting(false);
      setError("Erro de conexão ao validar o código do capitão. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#00356a] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
              🔑
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] font-bold text-lg leading-tight">
                Entrar em uma Equipe
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Validação exclusiva por Código do Capitão
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

        {/* Security Alert Header */}
        <div className="bg-[#edf4ff] border-b border-[#c2d9f5] px-6 py-3 flex items-start gap-2.5">
          <span className="text-sm">🛡️</span>
          <p className="text-[11px] text-[#00356a] leading-relaxed">
            Para evitar invasões e entradas não autorizadas em equipes, o acesso só é liberado através do <strong>Código Único</strong> gerado pelo capitão.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-['Space_Grotesk']">
              Código Único do Capitão
            </label>
            <div className="relative">
              <input
                type="text"
                value={captainCode}
                onChange={(e) => setCaptainCode(e.target.value.toUpperCase())}
                placeholder="Ex: CAP-CYBE-3429"
                className="w-full px-4 py-3 bg-[#f0f4fa] border border-slate-200 rounded-xl text-base font-mono font-bold text-[#00356a] tracking-wider focus:bg-white focus:border-[#00356a] focus:ring-2 focus:ring-[#00356a]/10 outline-none transition-all placeholder:text-slate-400 uppercase"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Solicite o código oficial diretamente ao capitão da equipe da qual você faz parte.
            </p>
          </div>

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
            <span className="text-base">🔒</span>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              <strong>Atenção:</strong> A escolha da equipe é feita uma única vez e <strong>sem direito de alteração</strong> posterior. Verifique com seu capitão antes de confirmar.
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
                VALIDANDO CÓDIGO...
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

