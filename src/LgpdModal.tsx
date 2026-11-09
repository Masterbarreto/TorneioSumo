import { useState, useEffect, useRef } from "react";

export interface LgpdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  confirmText?: string;
  cancelText?: string;
}

export default function LgpdModal({
  isOpen,
  onClose,
  onAccept,
  isLoading = false,
  title = "Termos de Privacidade e Proteção de Dados",
  subtitle = "Lei Federal nº 13.709/2018 (LGPD) • v1.0",
  confirmText = "Concordar e Prosseguir",
  cancelText = "Recusar e Voltar",
}: LgpdModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsChecked(false);
      setHasScrolledToBottom(false);
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 36;
    if (isNearBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const scrollToBottom = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setHasScrolledToBottom(true);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lgpd-modal-title"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#051d30]/80 backdrop-blur-sm p-3 sm:p-4"
      style={{ animation: "lgpdFadeIn 0.2s ease-out forwards" }}
    >
      <style>{`
        @keyframes lgpdFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lgpdScaleUp { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      <div
        className="bg-white rounded-[16px] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.35)] border border-[#e2e8f0] w-full max-w-[660px] max-h-[92vh] flex flex-col overflow-hidden"
        style={{ animation: "lgpdScaleUp 0.25s cubic-bezier(0.16,1,0.3,1) forwards" }}
      >
        {/* Header */}
        <div className="bg-[#00356a] px-5 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#ffc83b] shrink-0 shadow-inner">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3
                id="lgpd-modal-title"
                className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[17px] sm:text-[19px] leading-tight"
              >
                {title}
              </h3>
              <p className="text-[12px] text-blue-100 font-['Inter:Regular',Inter,sans-serif] mt-0.5 flex items-center gap-2">
                <span>{subtitle}</span>
                <span className="w-1 h-1 rounded-full bg-blue-300" />
                <span className="bg-white/15 px-1.5 py-0.5 rounded text-[10px] font-mono tracking-wider">CONFIDENCIALIDADE</span>
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Fechar modal de termos"
          >
            ✕
          </button>
        </div>

        {/* Security Notice Banner */}
        <div className="bg-[#edf4ff] border-b border-[#c2d9f5] px-5 sm:px-6 py-2.5 flex items-center gap-2.5 shrink-0">
          <span className="text-[#00356a] text-[15px] shrink-0">🛡️</span>
          <p className="text-[12px] text-[#00356a] leading-relaxed font-['Inter:Regular',Inter,sans-serif]">
            Seu consentimento é auditável e fica registrado com carimbo de data/hora e IP no banco de dados para segurança jurídica mútua.
          </p>
        </div>

        {/* Scrollable Terms Content */}
        <div className="relative flex-1 overflow-hidden flex flex-col">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            tabIndex={0}
            aria-label="Texto dos termos da LGPD"
            className="p-5 sm:p-6 overflow-y-auto flex-1 font-['Inter:Regular',Inter,sans-serif] text-[13px] text-[#334155] leading-relaxed space-y-4 outline-none focus:ring-1 focus:ring-[#00356a]/30"
          >
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-[12px] text-slate-700 leading-relaxed shadow-sm">
              <strong className="text-[#051d30]">Resumo dos Seus Direitos:</strong> Os dados informados nesta plataforma são tratados exclusivamente para possibilitar sua inscrição, chaveamento nas arenas, pontuação em tempo real e emissão de certificados oficiais do Torneio. Suas credenciais são protegidas com criptografia de ponta e nenhuma informação é repassada comercialmente a terceiros.
            </div>

            <div>
              <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[14px] mb-1 flex items-center gap-1.5">
                <span className="text-[#00356a]">1.</span> Identificação do Controlador
              </h4>
              <p>
                O <strong>Comitê das Engenharias & Diretoria de Robótica do Torneio</strong> atua como Controlador dos dados pessoais coletados nesta plataforma, responsabilizando-se pelo tratamento ético e seguro em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018).
              </p>
            </div>

            <div>
              <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[14px] mb-1 flex items-center gap-1.5">
                <span className="text-[#00356a]">2.</span> Dados Pessoais Coletados e Tratados
              </h4>
              <p>Para a criação de conta, auditoria de participação e credenciamento oficial, coletamos:</p>
              <ul className="list-disc list-inside mt-1.5 space-y-1 text-[#475569] pl-1">
                <li><strong>Identificação Civil:</strong> Nome completo e CPF (utilizados para conferência de autenticidade competitiva e prevenção de inscrições duplicadas);</li>
                <li><strong>Comunicação e Acesso:</strong> E-mail institucional ou pessoal (utilizado para autenticação, envio de código de segurança OTP e avisos de chaves);</li>
                <li><strong>Vínculo Acadêmico:</strong> Instituição de ensino, unidade e cargo (Aluno Competidor, Líder Técnico ou Administrador);</li>
                <li><strong>Dados de Robótica:</strong> Nome da equipe, especificações técnicas do robô e histórico de pontuações nas arenas.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[14px] mb-1 flex items-center gap-1.5">
                <span className="text-[#00356a]">3.</span> Base Legal e Finalidade Específica
              </h4>
              <p>O tratamento de dados fundamenta-se no Art. 7º, incisos I (Consentimento do Titular) e V (Execução de Procedimentos Técnicos da Competição):</p>
              <ul className="list-disc list-inside mt-1.5 space-y-1 text-[#475569] pl-1">
                <li>Autenticação multifator segura e controle de acesso a súmulas e painéis de combate;</li>
                <li>Geração automática de chaves classificatórias e ranking oficial;</li>
                <li>Emissão e validação pública de certificados digitais autenticados;</li>
                <li>Prevenção a fraudes, ataques de força bruta e integridade do software.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[14px] mb-1 flex items-center gap-1.5">
                <span className="text-[#00356a]">4.</span> Segurança da Informação, Criptografia e Armazenamento
              </h4>
              <p>
                Adotamos salvaguardas técnicas avançadas: senhas recebem hash criptográfico unilateral via <code>bcrypt</code> (fator de custo 10) com salt aleatório, sessões são transmitidas via HTTPS/TLS e armazenadas em cookies <code>HttpOnly</code> com proteção contra XSS e injeções NoSQL/SQL.
              </p>
            </div>

            <div>
              <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[14px] mb-1 flex items-center gap-1.5">
                <span className="text-[#00356a]">5.</span> Seus Direitos como Titular (Art. 18 da LGPD)
              </h4>
              <p>
                Como titular dos dados, você tem o direito garantido de solicitar: confirmação da existência de tratamento, acesso aos dados pessoais, correção de dados incompletos ou inexatos, anonimização ou exclusão de dados desnecessários e revogação deste consentimento a qualquer momento mediante contato com o comitê organizador.
              </p>
            </div>

            <div>
              <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[14px] mb-1 flex items-center gap-1.5">
                <span className="text-[#00356a]">6.</span> Auditoria de Consentimento
              </h4>
              <p>
                Ao clicar no botão de confirmação abaixo, um registro indelével contendo a versão dos termos (<code>v1.0</code>), data/hora UTC e endereço IP de conexão será gravado no banco de dados do sistema, cumprindo o ônus da prova estipulado no Art. 8º, § 2º da LGPD.
              </p>
            </div>
          </div>

          {/* Quick jump to bottom helper if not reached bottom */}
          {!hasScrolledToBottom && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="absolute bottom-3 right-5 z-10 bg-[#00356a]/90 hover:bg-[#00356a] text-white text-[11px] font-['Inter:Semi Bold',Inter,sans-serif] font-semibold py-1.5 px-3 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Rolar até o final dos termos</span>
              <span>↓</span>
            </button>
          )}
        </div>

        {/* Footer Actions & Consent Checkbox */}
        <div className="bg-[#f8fafc] border-t border-[#e2e8f0] p-4 sm:p-5 shrink-0 flex flex-col gap-3.5">
          <label className={`flex items-start gap-3 p-2.5 rounded-[8px] border transition-colors cursor-pointer select-none ${isChecked ? "bg-emerald-50/70 border-emerald-300" : "bg-white border-slate-200 hover:border-slate-300"}`}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#00356a] border-slate-300 rounded focus:ring-[#00356a] cursor-pointer"
            />
            <span className="text-[12.5px] sm:text-[13px] text-[#051d30] font-['Inter:Medium',Inter,sans-serif] leading-snug">
              Declaro que li, compreendi e concordo integralmente com os <strong>Termos de Privacidade e Proteção de Dados (LGPD)</strong> para a criação da minha conta.
            </span>
          </label>

          <div className="flex items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-[8px] border border-slate-300 text-slate-700 font-['Inter:Semi Bold',Inter,sans-serif] font-semibold text-[13px] hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                if (isChecked && !isLoading) {
                  onAccept();
                }
              }}
              disabled={!isChecked || isLoading}
              className="px-5 sm:px-6 py-2.5 rounded-[8px] bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[13px] tracking-[0.5px] uppercase shadow-[0_4px_12px_rgba(0,53,106,0.25)] hover:bg-[#00468a] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>SALVANDO...</span>
                </>
              ) : (
                <>
                  <span>{confirmText}</span>
                  <span>✓</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
