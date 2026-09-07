import { useState, useRef, useEffect, type ChangeEvent } from "react";
import AdminSidebar from "./AdminSidebar";

// ─── Types ─────────────────────────────────────────────────────────────────
type ArenaStatus = "Ativa" | "Inativa" | "Manutenção";
type ValidationT = "Automática" | "Manual";
type TeamStatus = "Aprovado" | "Pendente" | "Rejeitado";
type Team = { id: string; name: string; institution: string; status: TeamStatus };
type Arena = {
  id: string; name: string; description: string; status: ArenaStatus;
  capacity: number; dimensions: string; noiseLevel: string; lighting: string;
  validationType: ValidationT; restrictedAccess: boolean; requiresJudge: boolean;
  image: string; teams: Team[];
};
type PageView = "list" | "create" | "edit" | "teams";

// ─── Initial data ───────────────────────────────────────────────────────────
const INIT_ARENAS: Arena[] = [
  {
    id: "1", name: "Labirinto",
    description: "Arena de percurso com obstáculos dinâmicos para robôs seguidores de linha e desafios de navegação autônoma.",
    status: "Ativa", capacity: 48, dimensions: "10m × 10m", noiseLevel: "Baixo",
    lighting: "Artificial", validationType: "Automática", restrictedAccess: false, requiresJudge: true,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    teams: [
      { id: "t1", name: "Cyber-Dragons", institution: "SENAC SP", status: "Aprovado" },
      { id: "t2", name: "Robo-Tech", institution: "FATEC Campinas", status: "Aprovado" },
      { id: "t3", name: "Iron Bots", institution: "ETEC Zona Sul", status: "Pendente" },
    ],
  },
  {
    id: "2", name: "Grand Prix",
    description: "Circuito de alta velocidade para competição de precisão e velocidade em pistas sinalizadas.",
    status: "Ativa", capacity: 64, dimensions: "15m × 8m", noiseLevel: "Alto",
    lighting: "Mista", validationType: "Manual", restrictedAccess: true, requiresJudge: true,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    teams: [
      { id: "t4", name: "Speed Demons", institution: "SENAC RJ", status: "Aprovado" },
      { id: "t5", name: "Turbo Coders", institution: "FATEC Santos", status: "Rejeitado" },
      { id: "t6", name: "Nitro Bots", institution: "ETEC Centro", status: "Pendente" },
    ],
  },
  {
    id: "3", name: "Arena Beta-2",
    description: "Zona experimental para categorias de dança e apresentação artística com robôs coreografados.",
    status: "Inativa", capacity: 32, dimensions: "8m × 8m", noiseLevel: "Médio",
    lighting: "Natural", validationType: "Automática", restrictedAccess: false, requiresJudge: false,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    teams: [
      { id: "t7", name: "DanceBots", institution: "SENAC MG", status: "Pendente" },
    ],
  },
];

let nextId = 4;

// ─── Helpers ────────────────────────────────────────────────────────────────
function uid() { return String(nextId++); }

const STATUS_COLORS: Record<ArenaStatus, string> = {
  "Ativa": "bg-green-100 text-green-700 border-green-200",
  "Inativa": "bg-slate-100 text-slate-600 border-slate-200",
  "Manutenção": "bg-amber-100 text-amber-700 border-amber-200",
};
const STATUS_DOT: Record<ArenaStatus, string> = {
  "Ativa": "bg-green-500", "Inativa": "bg-slate-400", "Manutenção": "bg-amber-500",
};
const TEAM_COLORS: Record<TeamStatus, string> = {
  "Aprovado": "bg-green-100 text-green-700", "Pendente": "bg-amber-100 text-amber-700", "Rejeitado": "bg-red-100 text-red-600",
};

// ─── Sidebar ────────────────────────────────────────────────────────────────
// ─── TopBar ─────────────────────────────────────────────────────────────────
function TopBar({ title, breadcrumb, children }: { title: string; breadcrumb?: string[]; children?: React.ReactNode }) {
  return (
    <header className="fixed top-0 left-[256px] right-0 h-[64px] bg-white border-b border-[rgba(194,198,210,0.4)] z-20 flex items-center justify-between px-8">
      <div className="flex flex-col">
        {breadcrumb && (
          <div className="flex items-center gap-1 text-[11px] font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] tracking-[0.5px] uppercase mb-0.5">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                <span>{b}</span>
              </span>
            ))}
          </div>
        )}
        <h1 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[18px] tracking-[-0.5px]">{title}</h1>
      </div>
      <div className="flex items-center gap-4">{children}</div>
    </header>
  );
}

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ArenaStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[0.8px] uppercase px-2 py-1 rounded-[4px] border ${STATUS_COLORS[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}

// ─── Arena Card ──────────────────────────────────────────────────────────────
function ArenaCard({ arena, onEdit, onDelete, onTeams }: { arena: Arena; onEdit: () => void; onDelete: () => void; onTeams: () => void }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="bg-white rounded-[8px] shadow-[0_1px_4px_rgba(0,0,0,0.07)] border border-[rgba(194,198,210,0.4)] overflow-hidden flex flex-col group hover:shadow-[0_4px_16px_rgba(0,53,106,0.12)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="relative h-[168px] bg-[#cfe5ff] overflow-hidden">
        <img
          src={imgErr ? "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400" : arena.image}
          alt={arena.name}
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,29,48,0.5)] to-transparent" />
        <div className="absolute top-3 left-3"><StatusBadge status={arena.status} /></div>
        <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={onEdit} className="w-8 h-8 bg-white rounded-[4px] flex items-center justify-center shadow hover:bg-[#edf4ff] transition-colors" title="Editar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00356a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button onClick={onDelete} className="w-8 h-8 bg-white rounded-[4px] flex items-center justify-center shadow hover:bg-red-50 transition-colors" title="Excluir">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-5 flex-1">
        <div>
          <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[17px] uppercase">{arena.name}</h3>
          <p className="font-['Inter:Regular',Inter,sans-serif] text-[#475569] text-[13px] leading-[18px] mt-1 line-clamp-2">{arena.description}</p>
        </div>
        <div className="flex items-center gap-4 text-[12px] font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0]">
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {arena.capacity} cap.
          </span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {arena.teams.length} equipes
          </span>
          <span className="flex items-center gap-1">{arena.validationType}</span>
        </div>
        <div className="flex gap-2 pt-1 mt-auto">
          <button onClick={onEdit} className="flex-1 text-[12px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[0.8px] uppercase text-[#00356a] border border-[#c2d9f5] rounded-[4px] py-2 hover:bg-[#edf4ff] transition-colors">Editar</button>
          <button onClick={onTeams} className="flex-1 text-[12px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[0.8px] uppercase text-[#475569] border border-[rgba(194,198,210,0.6)] rounded-[4px] py-2 hover:bg-[#f7f9ff] transition-colors">Equipes</button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ────────────────────────────────────────────────────────────
function DeleteModal({ arena, onConfirm, onCancel }: { arena: Arena; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-[rgba(5,29,48,0.5)] flex items-center justify-center backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-[8px] shadow-2xl w-full max-w-[420px] mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()} style={{ animation: "modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div className="h-1 bg-[#ba1a1a]" />
        <div className="p-8 flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </div>
            <div>
              <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[20px]">Tem certeza?</h3>
              <p className="font-['Inter:Regular',Inter,sans-serif] text-[#475569] text-[14px] mt-1">
                Você está prestes a excluir a arena <strong className="text-[#051d30]">{arena.name}</strong>. Esta ação removerá permanentemente os dados da arena e o vínculo com{" "}
                <strong className="text-[#051d30]">{arena.teams.length} equipe{arena.teams.length !== 1 ? "s" : ""}</strong>.
              </p>
              <p className="font-['Inter:Regular',Inter,sans-serif] text-[#ba1a1a] text-[13px] mt-2">Esta ação não pode ser desfeita.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-3 border border-[rgba(194,198,210,0.8)] rounded-[6px] font-['Inter:Bold',Inter,sans-serif] font-bold text-[13px] tracking-[0.8px] uppercase text-[#475569] hover:bg-[#f7f9ff] transition-colors">Cancelar</button>
            <button onClick={onConfirm} className="flex-1 py-3 bg-[#ba1a1a] rounded-[6px] font-['Inter:Bold',Inter,sans-serif] font-bold text-[13px] tracking-[0.8px] uppercase text-white hover:bg-[#9b1515] transition-colors shadow-[0_4px_12px_rgba(186,26,26,0.3)]">Confirmar Exclusão</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Field wrapper ───────────────────────────────────────────────────────────
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[#051d30] text-[12px] tracking-[0.6px] uppercase">{label}</label>
      {children}
      {hint && <span className="font-['Inter:Regular',Inter,sans-serif] text-red-500 text-[12px]">{hint}</span>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", error }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; error?: boolean }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-[#f7f9ff] border rounded-[6px] px-4 py-3 font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30] outline-none placeholder:text-[#b0bac8] focus:bg-white focus:border-[#00356a] focus:shadow-[0_0_0_3px_rgba(0,53,106,0.08)] transition-all ${error ? "border-red-400" : "border-[#e2e8f0]"}`}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#f7f9ff] border border-[#e2e8f0] rounded-[6px] px-4 py-3 font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30] outline-none placeholder:text-[#b0bac8] focus:bg-white focus:border-[#00356a] focus:shadow-[0_0_0_3px_rgba(0,53,106,0.08)] transition-all resize-none"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#f7f9ff] border border-[#e2e8f0] rounded-[6px] px-4 py-3 font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30] outline-none focus:bg-white focus:border-[#00356a] focus:shadow-[0_0_0_3px_rgba(0,53,106,0.08)] transition-all appearance-none cursor-pointer"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30]">{label}</span>
      <div
        className={`relative w-11 h-6 rounded-full transition-all duration-200 ${checked ? "bg-[#00356a]" : "bg-[#c2c6d2]"}`}
        onClick={() => onChange(!checked)}
      >
        <span className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all duration-200 ${checked ? "left-[23px]" : "left-[3px]"}`} />
      </div>
    </label>
  );
}

function SectionHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-6 h-6 bg-[#00356a] rounded-full flex items-center justify-center font-['Inter:Bold',Inter,sans-serif] font-bold text-white text-[11px]">{n}</span>
      <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[14px] uppercase tracking-[0.8px]">{title}</h4>
      <div className="flex-1 h-px bg-[#e2e8f0]" />
    </div>
  );
}

// ─── Arena Form ──────────────────────────────────────────────────────────────
type ArenaFormData = Omit<Arena, "id" | "teams">;
const EMPTY_FORM: ArenaFormData = {
  name: "", description: "", status: "Ativa", capacity: 32,
  dimensions: "", noiseLevel: "Baixo", lighting: "Artificial",
  validationType: "Automática", restrictedAccess: false, requiresJudge: false, image: "",
};

function ArenaForm({ initial, isEdit, onSave, onCancel }: { initial: ArenaFormData; isEdit: boolean; onSave: (f: ArenaFormData) => void; onCancel: () => void }) {
  const [form, setForm] = useState<ArenaFormData>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof ArenaFormData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ArenaFormData>(k: K) => (v: ArenaFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Nome obrigatório";
    if (!form.description.trim()) e.description = "Descrição obrigatória";
    if (!form.dimensions.trim()) e.dimensions = "Dimensões obrigatórias";
    if (form.capacity < 1) e.capacity = "Capacidade inválida";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    onSave(form);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      set("image")(ev.target?.result as string);
      setImgErr(false);
    };
    reader.readAsDataURL(file);
  };

  const previewUrl = form.image || "";

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[22px]">
            {isEdit ? `Editar Arena: ${initial.name}` : "Configuração de Arenas"}
          </h2>
          <p className="font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] text-[13px] mt-1">
            {isEdit ? "Atualize os dados da arena abaixo." : "Preencha os dados para criar uma nova arena de competição."}
          </p>
        </div>
      </div>

      <div className="flex gap-8 flex-1 min-h-0">
        {/* Left column — form sections */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
          {/* Section 1 */}
          <div className="bg-white rounded-[8px] border border-[rgba(194,198,210,0.4)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <SectionHeader n={1} title="Informações Básicas" />
            <div className="flex flex-col gap-4">
              <Field label="Nome da Arena" hint={errors.name}>
                <Input value={form.name} onChange={set("name")} placeholder="Ex: Arena Alpha-7" error={!!errors.name} />
              </Field>
              <Field label="Descrição" hint={errors.description}>
                <Textarea value={form.description} onChange={set("description")} placeholder="Descreva o propósito e características desta arena..." rows={3} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Capacidade Máxima" hint={errors.capacity as string}>
                  <Input value={String(form.capacity)} onChange={(v) => set("capacity")(Number(v))} type="number" placeholder="32" error={!!errors.capacity} />
                </Field>
                <Field label="Status">
                  <Select value={form.status} onChange={(v) => set("status")(v as ArenaStatus)} options={["Ativa", "Inativa", "Manutenção"]} />
                </Field>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-[8px] border border-[rgba(194,198,210,0.4)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <SectionHeader n={2} title="Requisitos" />
            <div className="flex flex-col gap-4">
              <Field label="Dimensões Mínimas" hint={errors.dimensions}>
                <Input value={form.dimensions} onChange={set("dimensions")} placeholder="Ex: 10m × 10m" error={!!errors.dimensions} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nível de Ruído">
                  <Select value={form.noiseLevel} onChange={set("noiseLevel")} options={["Baixo", "Médio", "Alto"]} />
                </Field>
                <Field label="Iluminação">
                  <Select value={form.lighting} onChange={set("lighting")} options={["Natural", "Artificial", "Mista"]} />
                </Field>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-[8px] border border-[rgba(194,198,210,0.4)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <SectionHeader n={3} title="Tipo de Validação" />
            <div className="flex gap-4">
              {(["Automática", "Manual"] as ValidationT[]).map((opt) => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer group flex-1 border border-[rgba(194,198,210,0.5)] rounded-[6px] px-4 py-3 hover:border-[#00356a] transition-colors" onClick={() => set("validationType")(opt)}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${form.validationType === opt ? "border-[#00356a]" : "border-[#c2c6d2]"}`}>
                    {form.validationType === opt && <div className="w-2 h-2 rounded-full bg-[#00356a]" />}
                  </div>
                  <span className="font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30]">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-[8px] border border-[rgba(194,198,210,0.4)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <SectionHeader n={4} title="Restrições de Acesso" />
            <div className="flex flex-col gap-4">
              <Toggle checked={form.restrictedAccess} onChange={set("restrictedAccess")} label="Acesso Restrito (requer credencial física)" />
              <div className="h-px bg-[#f0f4fa]" />
              <Toggle checked={form.requiresJudge} onChange={set("requiresJudge")} label="Requer Árbitro Presencial" />
            </div>
          </div>
        </div>

        {/* Right column — image + preview */}
        <div className="w-[280px] flex flex-col gap-4 shrink-0">
          <div className="bg-white rounded-[8px] border border-[rgba(194,198,210,0.4)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[13px] uppercase tracking-[0.8px] mb-4">Imagem da Arena</h4>
            {/* Image preview */}
            <div
              className="relative w-full h-[160px] bg-[#edf4ff] rounded-[6px] overflow-hidden border border-dashed border-[#c2d9f5] flex items-center justify-center cursor-pointer hover:border-[#00356a] transition-colors group mb-3"
              onClick={() => fileRef.current?.click()}
            >
              {previewUrl && !imgErr ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" onError={() => setImgErr(true)} />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#8c9ab0]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span className="font-['Inter:Regular',Inter,sans-serif] text-[12px] text-center group-hover:text-[#00356a] transition-colors">Clique para enviar imagem</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <div className="flex flex-col gap-1.5">
              <label className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[11px] tracking-[0.6px] uppercase text-[#051d30]">ou cole URL da imagem</label>
              <Input value={imgErr ? "" : form.image} onChange={(v) => { set("image")(v); setImgErr(false); }} placeholder="https://..." />
            </div>
          </div>

          {/* Summary card */}
          <div className="bg-[#edf4ff] rounded-[8px] border border-[#c2d9f5] p-5">
            <h4 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#00356a] text-[13px] uppercase tracking-[0.8px] mb-3">Resumo</h4>
            <div className="flex flex-col gap-2 text-[13px] font-['Inter:Regular',Inter,sans-serif]">
              <div className="flex justify-between"><span className="text-[#8c9ab0]">Status</span><StatusBadge status={form.status} /></div>
              <div className="flex justify-between"><span className="text-[#8c9ab0]">Capacidade</span><span className="font-bold text-[#051d30]">{form.capacity}</span></div>
              <div className="flex justify-between"><span className="text-[#8c9ab0]">Validação</span><span className="text-[#051d30]">{form.validationType}</span></div>
              <div className="flex justify-between"><span className="text-[#8c9ab0]">Iluminação</span><span className="text-[#051d30]">{form.lighting}</span></div>
              <div className="flex justify-between"><span className="text-[#8c9ab0]">Acesso restrito</span><span className="text-[#051d30]">{form.restrictedAccess ? "Sim" : "Não"}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-between items-center pt-6 mt-4 border-t border-[#e2e8f0]">
        <button onClick={onCancel} className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[13px] tracking-[0.8px] uppercase text-[#475569] px-6 py-3 rounded-[6px] border border-[rgba(194,198,210,0.8)] hover:bg-[#f7f9ff] transition-colors">CANCELAR</button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[13px] tracking-[1px] uppercase px-8 py-3 rounded-[6px] hover:bg-[#00468a] disabled:opacity-60 transition-all shadow-[0_4px_12px_rgba(0,53,106,0.25)] hover:shadow-[0_6px_20px_rgba(0,53,106,0.35)]"
        >
          {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> SALVANDO...</> : (isEdit ? "SALVAR ALTERAÇÕES" : "CRIAR ARENA")}
        </button>
      </div>
    </div>
  );
}

// ─── Status Table ────────────────────────────────────────────────────────────
function StatusTable({ arenas, onEdit, onDelete, onTeams }: { arenas: Arena[]; onEdit: (a: Arena) => void; onDelete: (a: Arena) => void; onTeams: (a: Arena) => void }) {
  const cols = ["Arena", "Status", "Capacidade", "Equipes", "Validação", "Ações"];
  return (
    <div className="bg-white rounded-[8px] border border-[rgba(194,198,210,0.4)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(194,198,210,0.3)]">
        <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[15px]">Status Operacional</h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-['Inter:Regular',Inter,sans-serif] text-[12px] text-green-600">Sistema Operacional</span>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-[#f7f9ff]">
            {cols.map((c) => (
              <th key={c} className="px-4 py-3 text-left font-['Inter:Bold',Inter,sans-serif] font-bold text-[11px] tracking-[0.8px] uppercase text-[#8c9ab0]">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {arenas.map((a, i) => (
            <tr key={a.id} className={`border-t border-[rgba(194,198,210,0.2)] hover:bg-[#f7f9ff] transition-colors ${i % 2 === 0 ? "" : ""}`}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[4px] overflow-hidden bg-[#cfe5ff] shrink-0">
                    <img src={a.image} alt={a.name} className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                  </div>
                  <span className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[#051d30] text-[13px]">{a.name}</span>
                </div>
              </td>
              <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
              <td className="px-4 py-3 font-['Inter:Regular',Inter,sans-serif] text-[13px] text-[#051d30]">{a.capacity}</td>
              <td className="px-4 py-3 font-['Inter:Regular',Inter,sans-serif] text-[13px] text-[#051d30]">{a.teams.length}</td>
              <td className="px-4 py-3 font-['Inter:Regular',Inter,sans-serif] text-[13px] text-[#051d30]">{a.validationType}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => onTeams(a)} className="text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[0.6px] uppercase text-[#00356a] hover:underline">Equipes</button>
                  <span className="text-[#c2c6d2]">·</span>
                  <button onClick={() => onEdit(a)} className="text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[0.6px] uppercase text-[#475569] hover:underline">Editar</button>
                  <span className="text-[#c2c6d2]">·</span>
                  <button onClick={() => onDelete(a)} className="text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold tracking-[0.6px] uppercase text-[#ba1a1a] hover:underline">Excluir</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Teams View ──────────────────────────────────────────────────────────────
const TEAM_NAMES = ["Cyber-Dragons Alpha", "Torres Burns", "Iron Circuits", "Speed Demons", "Nitro Bots", "Robo-Tech Pro", "DanceBots MG", "Laser Squad", "Arc Welders", "Binary Storm", "Pixel Warriors", "Quantum Coders"];
const INSTITUTIONS = ["SENAC SP", "FATEC Campinas", "ETEC Zona Sul", "SENAC RJ", "FATEC Santos", "ETEC Centro", "SENAC MG"];

function TeamsView({ arena, onBack, onSave }: { arena: Arena; onBack: () => void; onSave: (teams: Team[]) => void }) {
  const [teams, setTeams] = useState<Team[]>(arena.teams);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newInst, setNewInst] = useState("SENAC SP");
  const [registeredTeams, setRegisteredTeams] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/v1/equipes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const names = data.map((t: any) => t.nome || t.name).filter(Boolean);
          if (names.length > 0) setRegisteredTeams(names);
        }
      })
      .catch((e) => console.error("Erro ao carregar equipes:", e));
  }, []);

  const addTeam = () => {
    if (!newName.trim()) return;
    setTeams((t) => [...t, { id: uid(), name: newName.trim(), institution: newInst, status: "Pendente" }]);
    setNewName("");
    setShowAdd(false);
  };

  const setStatus = (id: string, status: TeamStatus) =>
    setTeams((t) => t.map((tm) => tm.id === id ? { ...tm, status } : tm));

  const remove = (id: string) => setTeams((t) => t.filter((tm) => tm.id !== id));

  const counts = { Aprovado: teams.filter((t) => t.status === "Aprovado").length, Pendente: teams.filter((t) => t.status === "Pendente").length, Rejeitado: teams.filter((t) => t.status === "Rejeitado").length };

  return (
    <div className="flex flex-col gap-0 h-full">
      <div className="flex items-start gap-4 mb-6">
        <button onClick={onBack} className="mt-1 flex items-center gap-1.5 font-['Inter:Bold',Inter,sans-serif] font-bold text-[12px] tracking-[0.8px] uppercase text-[#00356a] hover:gap-2.5 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Voltar
        </button>
        <div>
          <h2 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[22px]">Gestão de Equipes por Arena</h2>
          <p className="font-['Inter:Regular',Inter,sans-serif] text-[#8c9ab0] text-[13px] mt-0.5">Arena: <strong className="text-[#00356a]">{arena.name}</strong></p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total de Equipes", value: teams.length, color: "#00356a", bg: "#edf4ff" },
          { label: "Aprovadas", value: counts.Aprovado, color: "#15803d", bg: "#f0fdf4" },
          { label: "Pendentes", value: counts.Pendente, color: "#b45309", bg: "#fffbeb" },
          { label: "Rejeitadas", value: counts.Rejeitado, color: "#ba1a1a", bg: "#fff1f1" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-[8px] border border-[rgba(194,198,210,0.4)] p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[32px]" style={{ color }}>{String(value).padStart(2, "0")}</div>
            <div className="font-['Inter:Regular',Inter,sans-serif] text-[12px] text-[#8c9ab0] uppercase tracking-[0.5px]">{label}</div>
          </div>
        ))}
      </div>

      {/* Add team row */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[15px]">Equipes Cadastradas</h3>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-2 bg-[#00356a] text-white font-['Inter:Bold',Inter,sans-serif] font-bold text-[12px] tracking-[0.8px] uppercase px-4 py-2 rounded-[6px] hover:bg-[#00468a] transition-colors shadow-[0_2px_8px_rgba(0,53,106,0.2)]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Adicionar Equipe
        </button>
      </div>

      {showAdd && (
        <div className="bg-[#edf4ff] border border-[#c2d9f5] rounded-[8px] p-4 mb-4 flex gap-3 items-end" style={{ animation: "fadeDown 0.2s ease" }}>
          <div className="flex-1">
            <label className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[11px] uppercase tracking-[0.6px] text-[#051d30] mb-1 block">Nome da Equipe</label>
            <input
              list="registered-teams-list"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTeam()}
              placeholder="Ex: Robo Warriors (ou escolha equipe cadastrada)"
              className="w-full bg-white border border-[#e2e8f0] rounded-[6px] px-4 py-2.5 font-['Inter:Regular',Inter,sans-serif] text-[14px] text-[#051d30] outline-none focus:border-[#00356a]"
            />

            <datalist id="registered-teams-list">
              {registeredTeams.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div className="w-44">
            <label className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[11px] uppercase tracking-[0.6px] text-[#051d30] mb-1 block">Instituição</label>
            <select value={newInst} onChange={(e) => setNewInst(e.target.value)} className="w-full bg-white border border-[#e2e8f0] rounded-[6px] px-3 py-2.5 font-['Inter:Regular',Inter,sans-serif] text-[13px] text-[#051d30] outline-none focus:border-[#00356a]">
              {INSTITUTIONS.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
          <button onClick={addTeam} className="bg-[#00356a] text-white font-['Inter:Bold',Inter,sans-serif] font-bold text-[12px] tracking-[0.8px] uppercase px-5 py-2.5 rounded-[6px] hover:bg-[#00468a] transition-colors whitespace-nowrap">Adicionar</button>
          <button onClick={() => setShowAdd(false)} className="px-3 py-2.5 border border-[rgba(194,198,210,0.8)] rounded-[6px] text-[#475569] hover:bg-white transition-colors">✕</button>
        </div>
      )}

      {/* Teams list */}
      <div className="bg-white rounded-[8px] border border-[rgba(194,198,210,0.4)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden flex-1 overflow-y-auto">
        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#8c9ab0]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <p className="font-['Inter:Regular',Inter,sans-serif] text-[14px] mt-3">Nenhuma equipe cadastrada nesta arena.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#f7f9ff] border-b border-[rgba(194,198,210,0.3)]">
                {["Equipe", "Instituição", "Status", "Ações"].map((c) => (
                  <th key={c} className="px-5 py-3 text-left font-['Inter:Bold',Inter,sans-serif] font-bold text-[11px] tracking-[0.8px] uppercase text-[#8c9ab0]">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-t border-[rgba(194,198,210,0.2)] hover:bg-[#f7f9ff] transition-colors">
                  <td className="px-5 py-3 font-['Inter:Bold',Inter,sans-serif] font-bold text-[#051d30] text-[14px]">{team.name}</td>
                  <td className="px-5 py-3 font-['Inter:Regular',Inter,sans-serif] text-[#475569] text-[13px]">{team.institution}</td>
                  <td className="px-5 py-3">
                    <select
                      value={team.status}
                      onChange={(e) => setStatus(team.id, e.target.value as TeamStatus)}
                      className={`text-[11px] font-bold tracking-[0.6px] uppercase px-2 py-1 rounded-[4px] border-0 outline-none cursor-pointer ${TEAM_COLORS[team.status]} bg-transparent`}
                    >
                      {(["Aprovado", "Pendente", "Rejeitado"] as TeamStatus[]).map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => remove(team.id)} className="text-[#ba1a1a] hover:underline font-['Inter:Bold',Inter,sans-serif] font-bold text-[11px] tracking-[0.6px] uppercase">Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-[#e2e8f0]">
        <button onClick={onBack} className="font-['Inter:Bold',Inter,sans-serif] font-bold text-[13px] tracking-[0.8px] uppercase text-[#475569] px-6 py-3 rounded-[6px] border border-[rgba(194,198,210,0.8)] hover:bg-[#f7f9ff] transition-colors">CANCELAR</button>
        <button onClick={() => { onSave(teams); onBack(); }} className="bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[13px] tracking-[1px] uppercase px-8 py-3 rounded-[6px] hover:bg-[#00468a] transition-all shadow-[0_4px_12px_rgba(0,53,106,0.25)]">SALVAR EQUIPES</button>
      </div>
    </div>
  );
}

// ─── Main ArenasPage ─────────────────────────────────────────────────────────
export default function ArenasPage({ onNavigate, onLogout }: { onNavigate: (key: string) => void; onLogout: () => void }) {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<PageView>("list");
  const [selected, setSelected] = useState<Arena | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Arena | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchArenas = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/api/v1/arenas", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setArenas(data);
    } catch (err: any) {
      console.error("Falha ao carregar arenas:", err);
      showToast("Erro ao conectar à API do MongoDB. Verifique o backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArenas();
  }, []);

  const navigate = (key: string) => {
    if (key === "arenas") setView("list");
    else onNavigate(key);
  };

  const openCreate = () => { setSelected(null); setView("create"); };
  const openEdit = (a: Arena) => { setSelected(a); setView("edit"); };
  const openTeams = (a: Arena) => { setSelected(a); setView("teams"); };
  const goList = () => { setSelected(null); setView("list"); };

  const handleCreate = async (f: ArenaFormData) => {
    try {
      const res = await fetch("http://localhost:3000/api/v1/arenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(f),
      });
      if (!res.ok) throw new Error("Falha ao criar arena");
      const created = await res.json();
      setArenas((prev) => [...prev, created]);
      showToast(`Arena "${f.name}" criada com sucesso no MongoDB!`);
      goList();
    } catch (err) {
      console.error(err);
      const arena: Arena = { ...f, id: uid(), teams: [] };
      setArenas((prev) => [...prev, arena]);
      showToast(`Arena "${f.name}" salva localmente.`);
      goList();
    }
  };

  const handleEdit = async (f: ArenaFormData) => {
    if (!selected) return;
    try {
      const res = await fetch(`http://localhost:3000/api/v1/arenas/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(f),
      });
      if (!res.ok) throw new Error("Falha ao atualizar arena");
      const updated = await res.json();
      setArenas((prev) => prev.map((a) => a.id === selected.id ? updated : a));
      showToast(`Arena "${f.name}" atualizada no MongoDB!`);
      goList();
    } catch (err) {
      console.error(err);
      setArenas((prev) => prev.map((a) => a.id === selected.id ? { ...a, ...f } : a));
      showToast(`Arena "${f.name}" atualizada!`);
      goList();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`http://localhost:3000/api/v1/arenas/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao excluir arena");
      setArenas((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      showToast(`Arena "${deleteTarget.name}" excluída do MongoDB.`);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      setArenas((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      showToast(`Arena "${deleteTarget.name}" excluída.`);
      setDeleteTarget(null);
    }
  };

  const handleSaveTeams = (arenaId: string) => async (teams: Team[]) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/arenas/${arenaId}/teams`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ teams }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar equipes");
      const updated = await res.json();
      setArenas((prev) => prev.map((a) => a.id === arenaId ? updated : a));
      showToast("Equipes salvas no MongoDB com sucesso!");
    } catch (err) {
      console.error(err);
      setArenas((prev) => prev.map((a) => a.id === arenaId ? { ...a, teams } : a));
      showToast("Equipes atualizadas!");
    }
  };

  const topBarTitle = view === "list" ? "Gestão de Arenas" : view === "create" ? "Nova Arena" : view === "edit" ? `Editar: ${selected?.name}` : `Equipes — ${selected?.name}`;
  const breadcrumb = ["Admin", "Arenas", ...(view !== "list" ? [view === "create" ? "Nova" : view === "edit" ? "Editar" : "Equipes"] : [])];

  return (
    <div className="fixed inset-0 bg-[#f7f9ff] z-[800]" style={{ animation: "fadeInPage 0.3s ease both" }}>
      <style>{`
        @keyframes fadeInPage { from { opacity:0; } to { opacity:1; } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes toastSlide { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
      `}</style>

      <AdminSidebar active="arenas" onNavigate={navigate} onLogout={onLogout} />

      <TopBar title={topBarTitle} breadcrumb={breadcrumb}>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-['Inter:Bold',Inter,sans-serif] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            API ONLINE (MongoDB Atlas)
          </span>
          {view === "list" && (
            <button onClick={openCreate} className="flex items-center gap-2 bg-[#00356a] text-white font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[12px] tracking-[1px] uppercase px-5 py-2.5 rounded-[6px] hover:bg-[#00468a] transition-all shadow-[0_4px_12px_rgba(0,53,106,0.2)] hover:shadow-[0_6px_20px_rgba(0,53,106,0.3)]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Nova Arena
            </button>
          )}
        </div>
      </TopBar>

      {/* Main content */}
      <main className="absolute top-[64px] left-[256px] right-0 bottom-0 overflow-y-auto p-8">
        {/* List view */}
        {view === "list" && (
          <div className="flex flex-col gap-8 max-w-[1100px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-[#8c9ab0]">
                <div className="w-10 h-10 border-3 border-[#00356a] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[16px]">Carregando arenas do MongoDB Atlas...</p>
              </div>
            ) : arenas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-[#8c9ab0]">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="5" width="18" height="13" rx="2"/><path d="M3 9H21"/><path d="M8 5V3M16 5V3"/></svg>
                <p className="font-['Space_Grotesk:Bold','Space Grotesk',sans-serif] font-bold text-[#051d30] text-[18px] mt-4">Nenhuma arena cadastrada</p>
                <p className="font-['Inter:Regular',Inter,sans-serif] text-[14px] mt-1 mb-6">Crie sua primeira arena de competição.</p>
                <button onClick={openCreate} className="bg-[#00356a] text-white font-bold text-[13px] tracking-[1px] uppercase px-8 py-3 rounded-[6px] hover:bg-[#00468a] transition-colors shadow-[0_4px_12px_rgba(0,53,106,0.25)]">Criar Arena</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {arenas.map((a) => (
                    <ArenaCard key={a.id} arena={a} onEdit={() => openEdit(a)} onDelete={() => setDeleteTarget(a)} onTeams={() => openTeams(a)} />
                  ))}
                </div>
                <StatusTable arenas={arenas} onEdit={openEdit} onDelete={(a) => setDeleteTarget(a)} onTeams={openTeams} />
              </>
            )}
          </div>
        )}


        {/* Create view */}
        {view === "create" && (
          <div className="max-w-[1000px] h-full flex flex-col" style={{ animation: "fadeDown 0.25s ease" }}>
            <ArenaForm initial={EMPTY_FORM} isEdit={false} onSave={handleCreate} onCancel={goList} />
          </div>
        )}

        {/* Edit view */}
        {view === "edit" && selected && (
          <div className="max-w-[1000px] h-full flex flex-col" style={{ animation: "fadeDown 0.25s ease" }}>
            <ArenaForm
              initial={{ name: selected.name, description: selected.description, status: selected.status, capacity: selected.capacity, dimensions: selected.dimensions, noiseLevel: selected.noiseLevel, lighting: selected.lighting, validationType: selected.validationType, restrictedAccess: selected.restrictedAccess, requiresJudge: selected.requiresJudge, image: selected.image }}
              isEdit={true}
              onSave={handleEdit}
              onCancel={goList}
            />
          </div>
        )}

        {/* Teams view */}
        {view === "teams" && selected && (
          <div className="max-w-[900px] flex flex-col" style={{ animation: "fadeDown 0.25s ease" }}>
            <TeamsView arena={arenas.find((a) => a.id === selected.id) || selected} onBack={goList} onSave={handleSaveTeams(selected.id)} />
          </div>
        )}
      </main>

      {/* Delete modal */}
      {deleteTarget && <DeleteModal arena={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] bg-[#051d30] text-white px-5 py-3 rounded-[4px] shadow-2xl border-l-4 border-[#00f2ff] font-['Inter:Regular',Inter,sans-serif] text-[13px] flex items-center gap-3" style={{ animation: "toastSlide 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00f2ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {toast}
        </div>
      )}
    </div>
  );
}
