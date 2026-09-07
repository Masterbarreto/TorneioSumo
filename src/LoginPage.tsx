import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import SenacLogo from "./images/Senac_logo.svg.webp";
import { saveUserSession } from "./utils/cookies";

export const isValidEmail = (val: string) => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val.trim());
};

/* ─── types ─────────────────────────────────────────────────────────── */
type Role = "ADMIN" | "ALUNO";
type Screen = "login" | "register" | "verify" | "register-team";

/* ─── robot arm bg (reusing existing unsplash) ───────────────────────── */
const IMG_ROBOT =
  "https://images.unsplash.com/photo-1742767069929-0c663150b164?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900";

/* ─── icons ──────────────────────────────────────────────────────────── */
function IconAdmin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      <path d="M16 3.5a4 4 0 0 1 0 7M20 20c0-2.7-1.6-5-4-6.3" />
    </svg>
  );
}
function IconAluno() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconEye({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  );
}
function IconArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5m0 0l7 7m-7-7 7-7" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/* ─── Left panel ─────────────────────────────────────────────────────── */
function LeftPanel() {
  return (
    <div className="hidden md:flex relative flex-col justify-between p-10 w-[420px] shrink-0 overflow-visible bg-[#051d30]">
      {/* BG image */}
      <div className="absolute inset-0 overflow-hidden">
        <img src={IMG_ROBOT} alt="" className="w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,30,60,0.6)] via-[rgba(0,53,106,0.5)] to-[rgba(5,29,48,0.95)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#8c4f00] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
            </svg>
          </div>
          <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-white text-[13px] tracking-[2px] uppercase">ROBOTIC_SYNC</span>
        </div>

        {/* Headline */}
        <div className="mt-6">
          <h1 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-white text-[42px] leading-[1.1] tracking-[-1px]">
            Torneio de<br />Robótica
          </h1>
          <p className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00f2ff] text-[22px] mt-2">Portal de Acesso</p>
        </div>

        <p className="font-['Inter:Light',Inter,sans-serif] font-light text-[rgba(255,255,255,0.65)] text-[14px] leading-[1.7] max-w-[280px]">
          Onde a precisão da engenharia encontra a inovação sustentável. Acesse o portal oficial para gerenciar equipes, matches e avaliações técnicas.
        </p>
      </div>

      {/* Footer logo */}
      <div className="relative z-10 w-[160px] h-[80px] flex items-center justify-start">
        <img
          src={SenacLogo}
          alt="SENAC"
          className="w-full h-full object-contain object-left"
        />
      </div>
    </div>
  );
}

/* ─── Role tab ───────────────────────────────────────────────────────── */
function RoleTabs({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  const roles: { id: Role; Icon: () => any }[] = [
    { id: "ADMIN", Icon: IconAdmin },
    { id: "ALUNO", Icon: IconAluno },
  ];
  return (
    <div className="flex gap-2 bg-[#f0f4fa] p-1.5 rounded-[8px]">
      {roles.map(({ id, Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-[6px] transition-all duration-200 ${value === id ? "bg-white shadow-sm text-[#00356a]" : "text-[#8c9ab0] hover:text-[#00356a]"}`}
        >
          <Icon />
          <span className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[10px] tracking-[0.8px] uppercase">{id}</span>
        </button>
      ))}
    </div>
  );
}

/* ─── Input ──────────────────────────────────────────────────────────── */
function Field({ label, children, hint, action }: { label: string; children: React.ReactNode; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="font-['Inter:Semi Bold',Inter,sans-serif] font-semibold text-[#051d30] text-[13px] tracking-[0.5px] uppercase">{label}</label>
        {action}
      </div>
      {children}
      {hint && <p className="text-[11px] text-red-500 font-['Inter:Regular',Inter,sans-serif]">{hint}</p>}
    </div>
  );
}

function TextInput({ icon, placeholder, type = "text", value, onChange, error }: {
  icon?: React.ReactNode; placeholder: string; type?: string;
  value: string; onChange: (v: string) => void; error?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 bg-[#f0f4fa] border rounded-[8px] px-4 py-3 transition-all duration-150 focus-within:bg-white focus-within:border-[#00356a] focus-within:shadow-[0_0_0_3px_rgba(0,53,106,0.1)] ${error ? "border-red-400" : "border-[#e2e8f0]"}`}>
      {icon && <span className="text-[#8c9ab0] shrink-0">{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30] outline-none placeholder:text-[#b0bac8]"
      />
    </div>
  );
}

/* ─── OTP input ──────────────────────────────────────────────────────── */
function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  const handle = (i: number, ch: string) => {
    if (!/^\d?$/.test(ch)) return;
    const next = [...value];
    next[i] = ch;
    onChange(next);
    if (ch && i < 5) refs[i + 1].current?.focus();
  };
  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs[i - 1].current?.focus();
  };

  return (
    <div className="flex gap-3">
      {refs.map((ref, i) => (
        <input
          key={i}
          ref={ref}
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handle(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          className={`w-full aspect-square max-w-[56px] text-center text-[22px] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold rounded-[8px] border-2 outline-none transition-all duration-150 bg-[#f0f4fa] ${value[i] ? "border-[#00356a] bg-white text-[#00356a] shadow-[0_0_0_3px_rgba(0,53,106,0.1)]" : "border-[#e2e8f0] text-transparent"}`}
        />
      ))}
    </div>
  );
}

/* ─── Countdown for OTP ──────────────────────────────────────────────── */
function useTimer(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) return;
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [left]);
  const reset = () => setLeft(seconds);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return { label: `${mm}:${ss}`, expired: left === 0, reset };
}

/* ─── Login screen ───────────────────────────────────────────────────── */
function LoginScreen({ role, setRole, onRegister, onSubmit }: {
  role: Role; setRole: (r: Role) => void;
  onRegister: () => void; onSubmit: (cargo: string, userId: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; adminCode?: string }>({});

  const ADMIN_CREDENTIALS = { email: "admin@senac.edu.br", password: "admin@2026", code: "SENAC2026" };

  const validate = () => {
    const e: typeof errors = {};
    const trimmed = email.trim();
    if (!trimmed) {
      e.email = "Insira seu e-mail cadastrado.";
    } else if (!isValidEmail(trimmed)) {
      e.email = "Formato de e-mail inválido (ex: seu.nome@dominio.com).";
    }
    if (password.length < 6) {
      e.password = "A senha deve ter no mínimo 6 caracteres.";
    }
    if (role === "ADMIN" && Object.keys(e).length === 0) {
      if (trimmed !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
        e.email = "Credenciais de administrador inválidas.";
        e.password = " ";
      }
      if (adminCode !== ADMIN_CREDENTIALS.code) {
        e.adminCode = "Código especial inválido.";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      setLoading(false);
      if (res.status !== 200) {
        setErrors({ email: data.message || data.error || "Credenciais inválidas." });
        return;
      }
      
      saveUserSession({
        userId: data.userId || data._id || "user-01",
        name: data.name || data.nome || (role === "ADMIN" ? "Administrador" : "Aluno Competidor"),
        email: email.trim(),
        cargo: data.cargo || data.role || role,
        teamId: data.teamId,
      });
      onSubmit(data.cargo || role, data.userId);
    } catch (err) {
      setLoading(false);
      setErrors({ email: "Sem conexão com o servidor de login." });
    }
  };

  return (
    <div className="flex flex-col gap-7" style={{ animation: "loginSlideIn 0.35s cubic-bezier(0.22,1,0.36,1) both" }}>
      <div>
        <h2 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[26px] leading-tight">Bem-vindo ao Portal</h2>
        <p className="font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] text-[14px] mt-1">Selecione seu perfil para continuar a jornada técnica.</p>
      </div>

      <RoleTabs value={role} onChange={setRole} />

      {role === "ADMIN" && (
        <div className="flex items-start gap-2 bg-[#edf4ff] border border-[#c2d9f5] rounded-[8px] px-4 py-3">
          <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          <div className="font-['Inter:Regular',Inter,sans-serif] text-[12px] text-[#00356a] leading-relaxed">
            <span className="font-['Inter:Bold',Inter,sans-serif] font-bold">Acesso restrito.</span> Use as credenciais de administrador:<br />
            <span className="font-['Liberation_Mono:Regular',monospace] text-[11px]">admin@senac.edu.br</span> / <span className="font-['Liberation_Mono:Regular',monospace] text-[11px]">admin@2026</span><br />
            Código Especial: <span className="font-['Liberation_Mono:Regular',monospace] text-[11px]">SENAC2026</span>
          </div>
        </div>
      )}

      <Field label="E-mail Institucional" hint={errors.email}>
        <div className="relative">
          <TextInput icon={<IconMail />} placeholder="nome.sobrenome@senac.edu.br" value={email} onChange={setEmail} error={!!errors.email} />
        </div>
      </Field>

      <Field
        label="Senha"
        hint={errors.password}
        action={
          <button className="font-['Inter:Semi Bold',Inter,sans-serif] font-semibold text-[#00356a] text-[12px] hover:underline" onClick={() => {}}>
            Esqueceu a senha?
          </button>
        }
      >
        <div className={`flex items-center gap-3 bg-[#f0f4fa] border rounded-[8px] px-4 py-3 transition-all duration-150 focus-within:bg-white focus-within:border-[#00356a] focus-within:shadow-[0_0_0_3px_rgba(0,53,106,0.1)] ${errors.password ? "border-red-400" : "border-[#e2e8f0]"}`}>
          <span className="text-[#8c9ab0] shrink-0"><IconLock /></span>
          <input
            type={showPw ? "text" : "password"}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30] outline-none placeholder:text-[#b0bac8]"
          />
          <button type="button" className="text-[#8c9ab0] hover:text-[#051d30] transition-colors" onClick={() => setShowPw((v) => !v)}>
            <IconEye open={showPw} />
          </button>
        </div>
      </Field>

      {role === "ADMIN" && (
        <Field label="Código Especial" hint={errors.adminCode}>
          <div className="relative">
            <TextInput
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
              placeholder="Insira o código especial"
              type="password"
              value={adminCode}
              onChange={setAdminCode}
              error={!!errors.adminCode}
            />
          </div>
        </Field>
      )}

      <label className="flex items-center gap-3 cursor-pointer group">
        <div
          className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center transition-all duration-150 ${remember ? "bg-[#00356a] border-[#00356a]" : "border-[#c2c6d2] group-hover:border-[#00356a]"}`}
          onClick={() => setRemember((v) => !v)}
        >
          {remember && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </div>
        <span className="font-['Inter:Regular',Inter,sans-serif] text-[#051d30] text-[13px]">Manter sessão ativa neste dispositivo</span>
      </label>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="relative overflow-hidden bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[14px] tracking-[1.6px] uppercase py-4 rounded-[8px] flex items-center justify-center gap-2 hover:bg-[#00468a] disabled:opacity-70 transition-all duration-200 active:scale-[0.99] shadow-[0_4px_16px_rgba(0,53,106,0.25)] hover:shadow-[0_8px_24px_rgba(0,53,106,0.35)]"
      >
        {loading ? (
          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> VERIFICANDO...</>
        ) : (
          <>ACESSAR PORTAL <span>→</span></>
        )}
      </button>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-[#e2e8f0]" />
        <span className="font-['Inter:Regular',Inter,sans-serif] text-[#b0bac8] text-[11px] tracking-[1px] uppercase">OU CADASTRE SUA EQUIPE</span>
        <div className="flex-1 h-px bg-[#e2e8f0]" />
      </div>

      <button
        onClick={onRegister}
        className="border-2 border-[#00356a] text-[#00356a] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[13px] tracking-[1.4px] uppercase py-3.5 rounded-[8px] flex items-center justify-center gap-2 hover:bg-[#edf4ff] transition-all duration-200 active:scale-[0.99] group"
      >
        <span className="transition-transform group-hover:rotate-90 duration-200"><IconPlus /></span>
        REGISTRAR NOVA EQUIPE
      </button>

      <p className="font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] text-[13px] text-center">
        Primeira vez no torneio?{" "}
        <button onClick={onRegister} className="font-['Inter:Semi Bold',Inter,sans-serif] font-semibold text-[#8c4f00] hover:underline">Veja as regras de participação.</button>
      </p>
    </div>
  );
}

/* ─── Register screen ────────────────────────────────────────────────── */
function RegisterScreen({ role, setRole, onBack, onSubmit }: {
  role: Role; setRole: (r: Role) => void;
  onBack: () => void; onSubmit: (email: string, password: string) => void;
}) {
  const [form, setForm] = useState({ name: "", cpf: "", email: "", institution: "", password: "", confirm: "", adminCode: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [showPw, setShowPw] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (form.name.trim().split(" ").length < 2) e.name = "Insira seu nome completo";
    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(form.cpf)) e.cpf = "Formato de CPF: 000.000.000-00";
    if (!isValidEmail(form.email)) e.email = "Formato de e-mail inválido (ex: seu.nome@dominio.com)";
    if (form.institution.trim().length < 3) e.institution = "Campo obrigatório";
    if (form.password.length < 6) e.password = "A senha deve ter no mínimo 6 caracteres";
    if (form.confirm !== form.password) e.confirm = "As senhas não coincidem";
    if (role === "ADMIN" && form.adminCode !== "SENAC2026") {
      e.adminCode = "Código de administrador inválido";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const formatCpf = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    return n.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/v1/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim(),
          cargo: role === "ADMIN" ? "PROFESSOR" : "ALUNO"
        })
      });
      const data = await res.json();
      setLoading(false);
      if (res.status !== 201) {
        setErrors({ email: data.error || "Erro no registro." });
        return;
      }
      
      onSubmit(form.email, form.password);
    } catch (err) {
      setLoading(false);
      setErrors({ email: "Sem conexão com o servidor de registro." });
    }
  };

  return (
    <div className="flex flex-col gap-5" style={{ animation: "loginSlideIn 0.35s cubic-bezier(0.22,1,0.36,1) both" }}>
      <button onClick={onBack} className="flex items-center gap-2 text-[#00356a] font-['Inter:Semi Bold',Inter,sans-serif] font-semibold text-[13px] hover:gap-3 transition-all w-fit">
        <IconArrowLeft /> Voltar para o Login
      </button>

      <div>
        <h2 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[26px]">Create Profile</h2>
        <p className="font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] text-[14px] mt-1">Fill in technical credentials to continue.</p>
      </div>

      <RoleTabs value={role} onChange={setRole} />

      <Field label="Nome Completo" hint={errors.name}>
        <TextInput placeholder="Ex: Roberto Carlos da Silva" value={form.name} onChange={set("name")} error={!!errors.name} />
      </Field>

      <Field label="CPF" hint={errors.cpf}>
        <TextInput placeholder="000.000.000-00" value={form.cpf} onChange={(v) => set("cpf")(formatCpf(v))} error={!!errors.cpf} />
      </Field>

      <Field label="E-mail" hint={errors.email}>
        <TextInput icon={<IconMail />} placeholder="digite seu melhor e-mail" value={form.email} onChange={set("email")} error={!!errors.email} />
      </Field>

      <Field label="Instituição de Ensino" hint={errors.institution}>
        <TextInput placeholder="Ex: SENAC Robotics Lab" value={form.institution} onChange={set("institution")} error={!!errors.institution} />
      </Field>

      {role === "ADMIN" && (
        <Field label="Código de Administrador (code-admin)" hint={errors.adminCode}>
          <TextInput placeholder="Insira o código especial de administrador" type="password" value={form.adminCode} onChange={set("adminCode")} error={!!errors.adminCode} />
        </Field>
      )}

      <Field label="Senha" hint={errors.password}>
        <div className={`flex items-center gap-3 bg-[#f0f4fa] border rounded-[8px] px-4 py-3 transition-all focus-within:bg-white focus-within:border-[#00356a] focus-within:shadow-[0_0_0_3px_rgba(0,53,106,0.1)] ${errors.password ? "border-red-400" : "border-[#e2e8f0]"}`}>
          <span className="text-[#8c9ab0]"><IconLock /></span>
          <input type={showPw ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => set("password")(e.target.value)} className="flex-1 bg-transparent font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30] outline-none placeholder:text-[#b0bac8]" />
          <button type="button" className="text-[#8c9ab0] hover:text-[#051d30] transition-colors" onClick={() => setShowPw((v) => !v)}><IconEye open={showPw} /></button>
        </div>
      </Field>

      <Field label="Confirmação de Senha" hint={errors.confirm}>
        <div className={`flex items-center gap-3 bg-[#f0f4fa] border rounded-[8px] px-4 py-3 transition-all focus-within:bg-white focus-within:border-[#00356a] focus-within:shadow-[0_0_0_3px_rgba(0,53,106,0.1)] ${errors.confirm ? "border-red-400" : "border-[#e2e8f0]"}`}>
          <span className="text-[#8c9ab0]"><IconLock /></span>
          <input type="password" placeholder="••••••••" value={form.confirm} onChange={(e) => set("confirm")(e.target.value)} className="flex-1 bg-transparent font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30] outline-none placeholder:text-[#b0bac8]" />
        </div>
      </Field>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[14px] tracking-[1.6px] uppercase py-4 rounded-[8px] flex items-center justify-center gap-2 hover:bg-[#00468a] disabled:opacity-70 transition-all duration-200 active:scale-[0.99] shadow-[0_4px_16px_rgba(0,53,106,0.25)] mt-2"
      >
        {loading ? (
          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> ENVIANDO...</>
        ) : "FINALIZAR CADASTRO"}
      </button>

      <p className="font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] text-[13px] text-center">
        Já tenho conta?{" "}
        <button onClick={onBack} className="font-['Inter:Semi Bold',Inter,sans-serif] font-semibold text-[#00356a] hover:underline">Acessar Portal</button>
      </p>
    </div>
  );
}

/* ─── Verify screen ──────────────────────────────────────────────────── */
function VerifyScreen({ email, password, onBack, onDone }: { email: string; password: string; onBack: () => void; onDone: (userData: any) => void }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const { label, expired, reset } = useTimer(165);

  const filled = otp.every((c) => c !== "");

  const handleVerify = async () => {
    if (!filled || attempted) return;
    setAttempted(true);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/v1/users/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp.join("") })
      });
      const data = await res.json();
      if (res.status !== 200) {
        setLoading(false);
        setAttempted(false);
        alert(data.error || "Código de verificação incorreto.");
        return;
      }

      // Login automatically upon verification success
      const loginRes = await fetch("http://localhost:3000/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password })
      });
      const loginData = await loginRes.json();
      setLoading(false);

      if (loginRes.status === 200) {
        saveUserSession({
          userId: loginData.userId || loginData._id || "user-01",
          name: loginData.name || loginData.nome || "Aluno Competidor",
          email: email.trim(),
          cargo: loginData.cargo || "ALUNO",
          teamId: loginData.teamId,
        });
        setSuccess(true);
        setTimeout(() => onDone(loginData), 1200);
      } else {
        alert("Erro ao efetuar login automático.");
      }
    } catch (err) {
      setLoading(false);
      setAttempted(false);
      alert("Sem conexão com o servidor de verificação.");
    }
  };

  return (
    <div className="flex flex-col gap-7" style={{ animation: "loginSlideIn 0.35s cubic-bezier(0.22,1,0.36,1) both" }}>
      <button onClick={onBack} className="flex items-center gap-2 text-[#00356a] font-['Inter:Semi Bold',Inter,sans-serif] font-semibold text-[13px] hover:gap-3 transition-all w-fit">
        <IconArrowLeft /> Voltar para etapa anterior
      </button>

      <div>
        <h2 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[26px]">Verificar Código</h2>
        <p className="font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] text-[14px] mt-2 leading-relaxed">
          Enviamos um código de 6 dígitos para seu e-mail.<br />Por favor, insira-o abaixo para continuar.
        </p>
      </div>

      <OtpInput value={otp} onChange={attempted ? () => {} : setOtp} />

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-[8px] py-4 flex items-center justify-center gap-2 text-green-700 font-['Inter:Semi Bold',Inter,sans-serif] font-semibold text-[14px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          Código verificado! Redirecionando...
        </div>
      ) : !attempted ? (
        <button
          onClick={handleVerify}
          disabled={!filled || loading}
          className="bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[14px] tracking-[1px] py-4 rounded-[8px] flex items-center justify-center gap-2 hover:bg-[#00468a] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.99] shadow-[0_4px_16px_rgba(0,53,106,0.25)]"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> VERIFICANDO...</>
          ) : <>Verificar →</>}
        </button>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-[8px] py-3 px-4 flex items-center gap-2 text-amber-700 font-['Inter:Regular',Inter,sans-serif] text-[13px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          Código já utilizado. Reenvie para obter um novo.
        </div>
      )}

      <div className="flex items-center justify-between text-[13px]">
        <span className="font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0]">
          Não recebeu o código?{" "}
          <button
            disabled={!expired}
            onClick={() => { reset(); setOtp(Array(6).fill("")); setAttempted(false); }}
            className={`font-['Inter:Semi Bold',Inter,sans-serif] font-semibold transition-colors ${expired ? "text-[#00356a] hover:underline" : "text-[#b0bac8] cursor-default"}`}
          >
            Reenviar código
          </button>
        </span>
        <div className="flex items-center gap-1.5 text-[#8c9ab0] font-['Inter:Regular',Inter,sans-serif]">
          <IconClock />
          <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[0.5px]">EXPIRA EM {label}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── RegisterTeamScreen ────────────────────────────────────────────── */
function RegisterTeamScreen({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState("");
  const [category, setCategory] = useState("Sumô 3kg Autônomo");
  const [institution, setInstitution] = useState("");
  
  // Pre-fill one leader member
  const [members, setMembers] = useState<any[]>([
    { name: "Ricardo Mendes", role: "Líder Técnico", cpf: "123.456.789-00", birthDate: "15/05/2004", docUploaded: true }
  ]);

  // Form states for adding member
  const [mName, setMName] = useState("");
  const [mRole, setMRole] = useState("Competidor");
  const [mCpf, setMCpf] = useState("");
  const [mBirth, setMBirth] = useState("");
  const [mDoc, setMDoc] = useState(false);
  const [mError, setMError] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);

  const formatCpf = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    return n.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  };

  const handleAddMember = () => {
    if (!mName || !mCpf || !mBirth) {
      setMError("Preencha todos os campos do membro.");
      return;
    }
    if (members.some(m => m.cpf === mCpf)) {
      setMError("Membro com este CPF já adicionado.");
      return;
    }
    setMembers([...members, { name: mName, role: mRole, cpf: mCpf, birthDate: mBirth, docUploaded: mDoc }]);
    setMName("");
    setMRole("Competidor");
    setMCpf("");
    setMBirth("");
    setMDoc(false);
    setMError("");
  };

  const handleRemoveMember = (cpf: string) => {
    setMembers(members.filter(m => m.cpf !== cpf));
  };

  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const teamRes = await fetch("http://localhost:3000/api/v1/Equipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: teamName }),
        credentials: "include"
      });
      const teamData = await teamRes.json();
      if (teamRes.status !== 201) {
        alert(teamData.error || "Erro ao criar equipe.");
        setSubmitting(false);
        return;
      }

      const teamId = teamData._id;

      for (const m of members) {
        await fetch(`http://localhost:3000/api/v1/Equipes/${teamId}/membros`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: m.name,
            email: m.name.toLowerCase().replace(/ /g, ".") + "@senac.edu.br",
            cpf: m.cpf.replace(/\D/g, ""),
            birthDate: m.birthDate,
            role: m.role
          }),
          credentials: "include"
        });
      }

      setSubmitting(false);
      setShowSuccess(true);
    } catch (err) {
      setSubmitting(false);
      alert("Sem conexão com o servidor ao cadastrar equipe.");
    }
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center" style={{ animation: "loginSlideIn 0.35s cubic-bezier(0.22,1,0.36,1) both" }}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[28px] mb-2">Inscrição Realizada com Sucesso!</h2>
        <p className="font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] text-[15px] max-w-[360px] mb-8 leading-relaxed">
          Sua equipe <strong className="text-[#051d30]">{teamName || "Sem Nome"}</strong> foi cadastrada para o Torneio de Sumô. Aguarde a validação dos documentos pelos juízes.
        </p>
        <button
          onClick={onDone}
          className="w-full bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[14px] tracking-[1.6px] uppercase py-4 rounded-[8px] flex items-center justify-center gap-2 hover:bg-[#00468a] transition-all duration-200"
        >
          Finalizar e Acessar Portal
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-[loginSlideIn_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div className="mb-4">
        {/* INSCRIÇÃO ABERTA orange text with line */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#b45309] text-[11px] tracking-[1.5px] uppercase">Inscrição Aberta</span>
          <div className="w-12 h-[2px] bg-[#b45309]" />
        </div>
        <h2 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[34px] leading-tight mb-2">Cadastro de Equipe</h2>
        <p className="font-['Inter:Regular',Inter,sans-serif] text-[#727782] text-[14px] leading-relaxed">
          Prepare sua equipe para o Regional 2024. Complete as etapas abaixo para oficializar sua participação nas arenas tecnológicas.
        </p>
      </div>

      {/* Stepper progress */}
      <div className="relative flex items-center justify-between mb-8 px-4">
        {/* Background line */}
        <div className="absolute left-10 right-10 top-5 h-[2px] bg-[#e2e8f0] z-0" />
        
        {/* Step 1 */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[14px] transition-colors ${step >= 1 ? "bg-[#00356a] text-white animate-pulse" : "bg-[#edf4ff] text-[#8c9ab0]"}`}>
            1
          </div>
          <span className={`text-[10px] font-bold tracking-[0.8px] uppercase font-['Inter:Bold',Inter,sans-serif] ${step === 1 ? "text-[#00356a]" : "text-[#727782]"}`}>Identidade</span>
        </div>

        {/* Step 2 */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[14px] transition-colors ${step >= 2 ? "bg-[#00356a] text-white" : "bg-[#edf4ff] text-[#8c9ab0]"}`}>
            2
          </div>
          <span className={`text-[10px] font-bold tracking-[0.8px] uppercase font-['Inter:Bold',Inter,sans-serif] ${step === 2 ? "text-[#00356a]" : "text-[#727782]"}`}>Membros</span>
        </div>

        {/* Step 3 */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[14px] transition-colors ${step >= 3 ? "bg-[#00356a] text-white" : "bg-[#edf4ff] text-[#8c9ab0]"}`}>
            3
          </div>
          <span className={`text-[10px] font-bold tracking-[0.8px] uppercase font-['Inter:Bold',Inter,sans-serif] ${step === 3 ? "text-[#00356a]" : "text-[#727782]"}`}>Revisão</span>
        </div>
      </div>

      {/* Step 1: Info */}
      {step === 1 && (
        <div className="bg-white rounded-[16px] border border-[#e2e8f0] p-8 shadow-sm flex flex-col gap-6">
          
          {/* Section: Identificação da Equipe */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#b45309]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </span>
              <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[16px]">Identificação da Equipe</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-['Inter:Semi Bold',Inter,sans-serif] font-semibold text-[#57606a] text-[11px] tracking-[0.5px] uppercase">Nome da Equipe</label>
                <div className="flex items-center bg-[#edf4ff] rounded-[8px] px-4 py-3.5 border border-transparent focus-within:border-[#00356a] transition-all">
                  <input
                    type="text"
                    placeholder="Ex: Cyber-Phoenix"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-transparent outline-none font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30] placeholder:text-[#b0bac8]"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="font-['Inter:Semi Bold',Inter,sans-serif] font-semibold text-[#57606a] text-[11px] tracking-[0.5px] uppercase">Instituição de Ensino</label>
                <div className="flex items-center bg-[#edf4ff] rounded-[8px] px-4 py-3.5 border border-transparent focus-within:border-[#00356a] transition-all">
                  <input
                    type="text"
                    placeholder="Ex: Senac Hub Academy"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full bg-transparent outline-none font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30] placeholder:text-[#b0bac8]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Seleção de Arenas */}
          <div className="border-t border-[#f0f4fa] pt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#b45309]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/>
                  <line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/>
                  <rect x="2" y="6" width="20" height="12" rx="3"/>
                </svg>
              </span>
              <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[16px]">Seleção de Arenas</h3>
            </div>

            <div className="max-w-[280px] p-4 bg-[#edf4ff] border-2 border-[#00356a] rounded-[12px] relative flex flex-col gap-3">
              <div className="w-10 h-10 bg-[#00356a] rounded-[8px] flex items-center justify-center text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zM6 14a4 4 0 0 0-4 4v4h8v-4a4 4 0 0 0-4-4zm12 0a4 4 0 0 0-4 4v4h8v-4a4 4 0 0 0-4-4z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[15px]">Sumô</h4>
                <p className="font-['Inter:Regular',Inter,sans-serif] text-[11px] text-[#727782] leading-tight mt-1">
                  Combate técnico de força e estratégia de sensores.
                </p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[10px] tracking-[0.5px] uppercase">Vagas: 08</span>
                <div className="w-4 h-4 rounded-full border-2 border-[#00356a] bg-[#00356a] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="border-t border-[#f0f4fa] pt-6 flex items-center justify-between mt-2">
            <button
              onClick={onBack}
              className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[12px] tracking-[1px] text-[#727782] hover:text-[#051d30] uppercase transition-colors"
            >
              ← Cancelar Inscrição
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="bg-[#edf4ff] text-[#00356a] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1px] uppercase px-6 py-3.5 rounded-[6px] hover:bg-[#c2d9f5] transition-colors"
              >
                Salvar Rascunho
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!teamName || !institution}
                className="bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1px] uppercase px-6 py-3.5 rounded-[6px] hover:bg-[#00468a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima Etapa
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Step 2: Members */}
      {step === 2 && (
        <div className="flex flex-col gap-6 animate-[loginSlideIn_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
          {/* Header */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#b45309] text-[11px] tracking-[1.5px] uppercase">Passo 02 — Membros</span>
              <div className="w-12 h-[2px] bg-[#b45309]" />
            </div>
            <h2 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[28px] leading-tight mb-2">Registro dos Membros</h2>
            <p className="font-['Inter:Regular',Inter,sans-serif] text-[#727782] text-[14px] leading-relaxed">
              Reúna sua equipe. Forneça os dados de identificação e as funções técnicas de cada participante. A precisão no cadastro garante uma experiência perfeita no torneio.
            </p>
          </div>

          {/* Two Columns Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column - Form Card */}
            <div className="lg:col-span-5 bg-white border border-[#e2e8f0] rounded-[16px] p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-2 text-[#00356a]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[15px]">Registro dos Membros da Equipe</h3>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-['Inter:Semi Bold',Inter,sans-serif] font-semibold text-[#57606a] text-[11px] uppercase tracking-[0.5px]">Nome completo:</label>
                  <input
                    type="text"
                    placeholder="Nome de Registro/social"
                    value={mName}
                    onChange={(e) => setMName(e.target.value)}
                    className="bg-[#edf4ff] rounded-[8px] px-4 py-3 text-[13px] text-[#051d30] placeholder:text-[#b0bac8] outline-none border border-transparent focus:border-[#00356a]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-['Inter:Semi Bold',Inter,sans-serif] font-semibold text-[#57606a] text-[11px] uppercase tracking-[0.5px]">E-mail:</label>
                  <input
                    type="email"
                    placeholder="Nome de Registro/social"
                    value={mRole} // Using mRole as a text field or helper here
                    onChange={(e) => setMRole(e.target.value)}
                    className="bg-[#edf4ff] rounded-[8px] px-4 py-3 text-[13px] text-[#051d30] placeholder:text-[#b0bac8] outline-none border border-transparent focus:border-[#00356a]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-['Inter:Semi Bold',Inter,sans-serif] font-semibold text-[#57606a] text-[11px] uppercase tracking-[0.5px]">Ano do ensino médio sendo cursado:</label>
                  <select
                    className="bg-[#edf4ff] rounded-[8px] px-4 py-3 text-[13px] text-[#051d30] outline-none border border-transparent focus:border-[#00356a]"
                    defaultValue="1"
                  >
                    <option value="1">1º Ano</option>
                    <option value="2">2º Ano</option>
                    <option value="3">3º Ano</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-['Inter:Semi Bold',Inter,sans-serif] font-semibold text-[#57606a] text-[11px] uppercase tracking-[0.5px]">Document (RG/CPF)</label>
                  <input
                    type="text"
                    placeholder="(RG/CPF)"
                    value={mCpf}
                    onChange={(e) => setMCpf(formatCpf(e.target.value))}
                    className="bg-[#edf4ff] rounded-[8px] px-4 py-3 text-[13px] text-[#051d30] placeholder:text-[#b0bac8] outline-none border border-transparent focus:border-[#00356a]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-['Inter:Semi Bold',Inter,sans-serif] font-semibold text-[#57606a] text-[11px] uppercase tracking-[0.5px]">Termo de Ciência</label>
                  <span className="text-[10px] text-[#727782] mb-1">Modelo: <a href="https://bit.ly/7torneioderoboticsenac" target="_blank" rel="noreferrer" className="text-[#00356a] hover:underline">https://bit.ly/7torneioderoboticsenac</a></span>
                  <div className="border-2 border-dashed border-[#c2d9f5] rounded-[8px] bg-[#edf4ff] p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#e0f2fe] transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-[11px] text-[#00356a] font-semibold">Click to upload or drag & drop</span>
                    <span className="text-[9px] text-[#727782] mt-1">PDF, PNG OR JPG (MAX 5MB)</span>
                  </div>
                </div>

                {mError && <p className="text-red-500 text-xs">{mError}</p>}

                <button
                  type="button"
                  onClick={handleAddMember}
                  className="bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1px] uppercase py-3.5 rounded-[8px] hover:bg-[#00468a] transition-all text-center mt-2"
                >
                  + Add to Roster
                </button>
              </div>
            </div>

            {/* Right Column - Table & Alert */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Members Table Card */}
              <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[16px]">Membros registrados ({members.length})</h3>
                  <span className="bg-[#fef3c7] text-[#b45309] font-['Inter:Bold',Inter,sans-serif] font-bold text-[9px] tracking-[0.5px] uppercase px-2 py-1 rounded-[4px]">Limite Técnico: 5</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#e2e8f0] text-[10px] text-[#727782] font-bold tracking-[0.5px] uppercase">
                        <th className="pb-3 font-semibold">Nome Completo</th>
                        <th className="pb-3 font-semibold">Termo de Ciência</th>
                        <th className="pb-3 font-semibold">Last Update</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
                      {members.map((m, idx) => (
                        <tr key={idx} className="hover:bg-[#f8fafc] transition-colors">
                          <td className="py-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#dbeafe] text-[#1e40af] flex items-center justify-center font-bold text-[11px]">
                              {m.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-[#051d30]">{m.name}</div>
                              <div className="text-[10px] text-[#727782] font-mono">UID: NR-2024-{100 + idx}</div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center">
                              {m.docUploaded ? (
                                <svg className="text-green-600" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-[11px] text-[#727782]">
                            12 Oct 2023
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-3 text-[#727782]">
                              <button className="hover:text-[#00356a] transition-colors">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                              </button>
                              {idx > 0 && (
                                <button onClick={() => handleRemoveMember(m.cpf)} className="hover:text-red-600 transition-colors">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-4 mt-4 text-[11px] text-[#727782]">
                  <span>Displaying {members.length} of {members.length} members (AlphaBot)</span>
                  <div className="flex items-center gap-2">
                    <button className="p-1 rounded hover:bg-[#f1f5f9]">&lt;</button>
                    <button className="px-2 py-0.5 rounded bg-[#00356a] text-white font-bold">1</button>
                    <button className="p-1 rounded hover:bg-[#f1f5f9]">&gt;</button>
                  </div>
                </div>
              </div>

              {/* Security Alert Card */}
              <div className="bg-[#f1f5f9] border border-[#cbd5e1] rounded-[12px] p-4 flex items-start gap-3 text-[#334155]">
                <svg className="mt-0.5 shrink-0 text-[#475569]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p className="text-[11px] leading-relaxed">
                  <strong>Protocolo de segurança:</strong> Cada membro da equipe deve ter seus documentos legais verificados antes de poder entrar na área da Arena. É possível atualizar esses documentos até o prazo final de inscrição.
                </p>
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[12px] tracking-[1px] text-[#727782] hover:text-[#051d30] uppercase transition-colors"
                >
                  ← Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={members.length < 2}
                  className="bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1px] uppercase px-6 py-3.5 rounded-[6px] hover:bg-[#00468a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima Etapa
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="flex flex-col gap-6 animate-[loginSlideIn_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
          {/* Header */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#b45309] text-[11px] tracking-[1.5px] uppercase">Revisão Final</span>
              <div className="w-12 h-[2px] bg-[#b45309]" />
            </div>
            <h2 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[28px] leading-tight mb-2">Review Your Registration</h2>
            <p className="font-['Inter:Regular',Inter,sans-serif] text-[#727782] text-[14px] leading-relaxed">
              Please review all the information below. Accuracy is critical as data cannot be modified once the final submission is completed.
            </p>
          </div>

          {/* Three Columns / Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Column 1: Team Identity */}
            <div className="lg:col-span-4 bg-white border border-[#e2e8f0] rounded-[16px] p-6 shadow-sm relative flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <div className="flex items-center gap-2 text-[#00356a]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[14px]">Team Identity</h3>
                </div>
                <button onClick={() => setStep(1)} className="text-[11px] font-bold text-[#00356a] hover:underline uppercase">Edit</button>
              </div>

              <div className="flex flex-col items-center py-4">
                <div className="w-20 h-20 bg-[#0f172a] rounded-[12px] flex items-center justify-center text-white mb-3">
                  {/* Robot logo icon */}
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4" />
                    <line x1="8" y1="16" x2="8" y2="16" />
                    <line x1="16" y1="16" x2="16" y2="16" />
                  </svg>
                </div>
                <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[18px]">{teamName || "CyberKnights XI"}</h4>
                <span className="text-[11px] text-[#727782] mt-1">{category}</span>
              </div>

              <div className="flex flex-col gap-2 text-[12px] border-t border-[#f1f5f9] pt-3">
                <div className="flex justify-between">
                  <span className="text-[#727782] uppercase tracking-[0.5px]">Foundation</span>
                  <strong className="text-[#051d30]">2021</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#727782] uppercase tracking-[0.5px]">Affiliation</span>
                  <strong className="text-[#051d30]">{institution || "SENAC TECH"}</strong>
                </div>
              </div>
            </div>

            {/* Column 2: Core Members */}
            <div className="lg:col-span-4 bg-white border border-[#e2e8f0] rounded-[16px] p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <div className="flex items-center gap-2 text-[#00356a]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[14px]">Core Members ({members.length})</h3>
                </div>
                <button onClick={() => setStep(2)} className="text-[11px] font-bold text-[#00356a] hover:underline uppercase">Edit</button>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[250px] overflow-y-auto pr-1">
                {members.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px]">
                    <div className="w-9 h-9 rounded-full bg-[#dbeafe] text-[#1e40af] flex items-center justify-center font-bold text-[12px]">
                      {m.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#051d30] text-[13px]">{m.name}</h4>
                      <p className="text-[10px] text-[#727782]">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Final Agreements */}
            <div className="lg:col-span-4 bg-white border border-[#e2e8f0] rounded-[16px] p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[15px] border-b pb-3">Final Agreements</h3>

              <div className="flex flex-col gap-4">
                {[
                  "Estou ciente de que cada equipe deve ter de 2 a 4 integrantes, além de um tutor responsável maior de 18 anos vinculado à instituição de ensino de Origem do estudante competidor.",
                  "Estou ciente de que cada membro da equipe deve assinar individualmente o Termo de Ciência. Todos os termos devem ser compilados em um único arquivo PDF e assinados pelo representante da Instituição de ensino de origem.",
                  "Estou ciente de que todos os competidores deverão apresentar um documento oficial com foto para identificação no dia do evento.",
                  "Estou ciente de que a responsabilidade pelo transporte, alimentação, seguro e estadia durante o evento é da instituição de origem ou dos próprios estudantes.",
                  "Estou ciente de que autorizo, de forma gratuita, o uso da minha imagem, voz e nome em vídeos, fotos e/ou sons captados durante o torneio para fins de divulgação em qualquer tipo de mídia."
                ].map((text, idx) => (
                  <label key={idx} className="flex items-start gap-3 cursor-pointer group text-[11px] text-[#334155] leading-relaxed">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded text-[#00356a] focus:ring-[#00356a] border-[#cbd5e1] mt-0.5"
                    />
                    <span>{text}</span>
                  </label>
                ))}
              </div>

              <div className="border-t border-[#f1f5f9] pt-4 flex flex-col gap-3 mt-2">
                <button
                  onClick={handleFinish}
                  className="w-full bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1px] uppercase py-3.5 rounded-[6px] hover:bg-[#00468a] transition-all flex items-center justify-center gap-1.5"
                >
                  Finalizar Inscrição ⊳
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] text-[#727782] font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1px] uppercase py-3 rounded-[6px] hover:bg-[#f1f5f9] transition-all"
                >
                  ← Voltar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* ─── LoginPage (exported) ───────────────────────────────────────────── */
export default function LoginPage({ onBack, onAdminLogin, onStudentLogin }: { onBack: () => void; onAdminLogin?: () => void; onStudentLogin?: () => void }) {
  const [screen, setScreen] = useState<Screen>("login");
  const [role, setRole] = useState<Role>("ALUNO");
  const [tempEmail, setTempEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[800] flex bg-[#f0f4fa]"
      style={{ animation: "loginPageIn 0.4s cubic-bezier(0.22,1,0.36,1) both" }}
    >
      <style>{`
        @keyframes loginPageIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        @keyframes loginSlideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      <LeftPanel />

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#e2e8f0] bg-white">
          <div className="flex items-center gap-2 text-[#8c9ab0] font-['Inter:Regular',Inter,sans-serif] text-[12px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
            PROTOCOLO V24.1.0
          </div>
          <div className="flex items-center gap-6">
            <button className="font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] text-[12px] hover:text-[#051d30] transition-colors">SUPORTE</button>
            <button className="font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] text-[12px] hover:text-[#051d30] transition-colors">PRIVACIDADE</button>
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 font-['Inter:Semi Bold',Inter,sans-serif] font-semibold text-[#051d30] text-[12px] hover:text-[#00356a] transition-colors group"
            >
              <span className="transition-transform group-hover:-translate-x-0.5"><IconArrowLeft /></span> VOLTAR AO SITE
            </button>
          </div>
        </div>

        {/* form area */}
        <div className="flex-1 flex items-start justify-center py-12 px-8">
          <div className={`w-full transition-all duration-300 ${screen === "register-team" ? "max-w-[1100px]" : "max-w-[400px]"}`}>
            {screen === "login" && (
              <LoginScreen
                role={role} setRole={setRole}
                onRegister={() => setScreen("register")}
                onSubmit={async (userRole: string, userId: string) => {
                  setRole(userRole === "ADMIN" ? "ADMIN" : "ALUNO");
                  if (userRole === "ADMIN" || userRole === "PROFESSOR") {
                    onAdminLogin?.();
                  } else {
                    // Check if they already have a team
                    try {
                      const res = await fetch("http://localhost:3000/api/v1/Equipes", { credentials: "include" });
                      const teams = await res.json();
                      const userTeam = teams.find((t: any) => t.criadorId === userId);
                      if (userTeam) {
                        onStudentLogin?.();
                      } else {
                        setScreen("register-team");
                      }
                    } catch (err) {
                      setScreen("register-team");
                    }
                  }
                }}
              />
            )}
            {screen === "register" && (
              <RegisterScreen
                role={role} setRole={setRole}
                onBack={() => setScreen("login")}
                onSubmit={(regEmail: string, regPassword: string) => {
                  setTempEmail(regEmail);
                  setTempPassword(regPassword);
                  setScreen("verify");
                }}
              />
            )}
            {screen === "verify" && (
              <VerifyScreen
                email={tempEmail}
                password={tempPassword}
                onBack={() => setScreen("login")}
                onDone={(userData: any) => {
                  if (userData.cargo === "ADMIN" || userData.cargo === "PROFESSOR") {
                    onAdminLogin?.();
                  } else {
                    setScreen("register-team");
                  }
                }}
              />
            )}
            {screen === "register-team" && (
              <RegisterTeamScreen
                onBack={() => setScreen("login")}
                onDone={() => (onStudentLogin ? onStudentLogin() : onBack())}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
