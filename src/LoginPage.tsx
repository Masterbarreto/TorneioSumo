import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import SenacLogo from "./images/Senac_logo.svg.webp";

/* ─── types ─────────────────────────────────────────────────────────── */
type Role = "ADMIN" | "JUIZ" | "TÉCNICO";
type Screen = "login" | "register" | "verify";

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
function IconJuiz() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  );
}
function IconTecnico() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07" />
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
      <div className="relative z-10 w-[390px] h-[210px] flex items-center justify-start">
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
  const roles: { id: Role; Icon: () => JSX.Element }[] = [
    { id: "ADMIN", Icon: IconAdmin },
    { id: "JUIZ", Icon: IconJuiz },
    { id: "TÉCNICO", Icon: IconTecnico },
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
  onRegister: () => void; onSubmit: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const ADMIN_CREDENTIALS = { email: "admin@senac.edu.br", password: "admin@2026" };

  const validate = () => {
    const e: typeof errors = {};
    if (!email.includes("@")) e.email = "Insira um e-mail válido";
    if (password.length < 6) e.password = "Senha deve ter ao menos 6 caracteres";
    if (role === "ADMIN" && Object.keys(e).length === 0) {
      if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
        e.email = "Credenciais de administrador inválidas";
        e.password = " ";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    onSubmit();
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
            <span className="font-['Liberation_Mono:Regular',monospace] text-[11px]">admin@senac.edu.br</span> / <span className="font-['Liberation_Mono:Regular',monospace] text-[11px]">admin@2026</span>
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
  onBack: () => void; onSubmit: () => void;
}) {
  const [form, setForm] = useState({ name: "", cpf: "", email: "", institution: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [showPw, setShowPw] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (form.name.trim().split(" ").length < 2) e.name = "Insira nome completo";
    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(form.cpf)) e.cpf = "Formato: 000.000.000-00";
    if (!form.email.includes("@")) e.email = "E-mail inválido";
    if (form.institution.trim().length < 3) e.institution = "Campo obrigatório";
    if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (form.confirm !== form.password) e.confirm = "Senhas não coincidem";
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
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    onSubmit();
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
function VerifyScreen({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
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
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSuccess(true);
    setTimeout(onDone, 1200);
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

/* ─── LoginPage (exported) ───────────────────────────────────────────── */
export default function LoginPage({ onBack, onAdminLogin }: { onBack: () => void; onAdminLogin?: () => void }) {
  const [screen, setScreen] = useState<Screen>("login");
  const [role, setRole] = useState<Role>("JUIZ");

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
          <div className="w-full max-w-[400px]">
            {screen === "login" && (
              <LoginScreen
                role={role} setRole={setRole}
                onRegister={() => setScreen("register")}
                onSubmit={() => setScreen("verify")}
              />
            )}
            {screen === "register" && (
              <RegisterScreen
                role={role} setRole={setRole}
                onBack={() => setScreen("login")}
                onSubmit={() => setScreen("verify")}
              />
            )}
            {screen === "verify" && (
              <VerifyScreen
                onBack={() => setScreen("login")}
                onDone={() => (role === "ADMIN" ? onAdminLogin?.() : onBack())}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
