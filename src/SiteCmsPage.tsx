import React, { useState, useEffect, useCallback } from "react";
import AdminSidebar from "./AdminSidebar";
import { API_BASE_URL } from "./config/api";
import {
  type SiteConfig,
  type SectionKey,
  type CustomBlockItem,
  type NewsCardItem,
  type HistoryEditionItem,
  type GalleryPhotoItem,
  type KnowledgeDocItem,
  ALL_AVAILABLE_SECTIONS,
  DEFAULT_SITE_CONFIG,
  mergeSiteConfig,
} from "./config/siteConfigTypes";

type EditorTab =
  | "layout"
  | "navbar"
  | "hero"
  | "torneios"
  | "historico"
  | "galeria"
  | "knowledge"
  | "sobre"
  | "news"
  | "custom"
  | "cta"
  | "footer"
  | "theme";

type WorkspaceView = "editor" | "split" | "preview";

export const SITE_CONFIG_CACHE_KEY = "torneio_sumo_site_cms_cache_v2";

function notifySiteConfigUpdated(cfg: SiteConfig) {
  localStorage.setItem(SITE_CONFIG_CACHE_KEY, JSON.stringify(cfg));
  window.dispatchEvent(new CustomEvent("site-config-updated", { detail: cfg }));
}

export default function SiteCmsPage({
  onNavigate,
  onLogout,
}: {
  onNavigate: (key: any) => void;
  onLogout: () => void;
}) {
  const [config, setConfig] = useState<SiteConfig>(() => {
    try {
      const cached = localStorage.getItem(SITE_CONFIG_CACHE_KEY);
      if (cached) return mergeSiteConfig(JSON.parse(cached));
    } catch {}
    return DEFAULT_SITE_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<EditorTab>("layout");
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("editor");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [newNavLink, setNewNavLink] = useState("");
  const [newCourseName, setNewCourseName] = useState("");

  const showNotice = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  /* ─── Persist to Backend API (Manual Save Only) ────────────────────────── */
  const saveConfigToApi = useCallback(async (nextConfig: SiteConfig, silent = false) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/site-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(nextConfig),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar no servidor");
      }

      const data = await res.json();
      const merged = mergeSiteConfig(data);
      setConfig(merged);
      notifySiteConfigUpdated(merged);
      setHasUnsavedChanges(false);
      if (!silent) {
        showNotice("Alterações salvas e publicadas na página pública (http://localhost:5173).");
      }
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      notifySiteConfigUpdated(nextConfig);
      if (!silent) {
        showNotice("Salvo localmente. Verifique a conexão com a API.");
      }
    } finally {
      setSaving(false);
    }
  }, []);

  /* ─── Initial Load from MongoDB ────────────────────────────────────────── */
  const fetchConfigFromDb = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/site-config`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const merged = mergeSiteConfig(data);
        setConfig(merged);
        notifySiteConfigUpdated(merged);
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error("Erro ao carregar configurações da página pública:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigFromDb();
  }, [fetchConfigFromDb]);

  /* ─── Update Local Draft Config (Only Saves When User Clicks Atualizar) ─ */
  const updateConfig = useCallback((updater: (prev: SiteConfig) => SiteConfig) => {
    setConfig((prev) => updater(prev));
    setHasUnsavedChanges(true);
  }, []);

  /* ─── Clear Entire Page in Draft (Blank Canvas) ────────────────────────── */
  const handleClearAll = () => {
    if (
      !window.confirm(
        "Deseja limpar todas as seções no rascunho? A página pública só será alterada quando você clicar em Atualizar Página."
      )
    ) {
      return;
    }
    updateConfig((prev) => ({
      ...prev,
      sectionsOrder: [],
      navbar: { ...prev.navbar, showTopBar: false, navLinks: [] },
      news: { ...prev.news, eyebrow: "", heading: "", cards: [] },
      customBlocks: [],
    }));
    showNotice("Rascunho limpo. Clique em 'Atualizar Página' para aplicar no site.");
  };

  /* ─── Reset to Factory Default ─────────────────────────────────────────── */
  const handleResetDefault = () => {
    if (
      !window.confirm(
        "Deseja carregar o modelo padrão completo (todas as 11 seções atuais) no rascunho? Clique em 'Atualizar Página' depois para publicar."
      )
    ) {
      return;
    }
    setConfig(DEFAULT_SITE_CONFIG);
    setHasUnsavedChanges(true);
    showNotice("Modelo padrão carregado no rascunho. Clique em 'Atualizar Página' para salvar.");
  };

  /* ─── Section Management (Move, Toggle, Remove, Add) ───────────────────── */
  const handleMoveSection = (index: number, direction: "up" | "down") => {
    updateConfig((prev) => {
      const arr = [...prev.sectionsOrder];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= arr.length) return prev;
      const temp = arr[index];
      arr[index] = arr[targetIdx];
      arr[targetIdx] = temp;
      return { ...prev, sectionsOrder: arr };
    });
  };

  const handleToggleSectionVisible = (id: SectionKey) => {
    updateConfig((prev) => ({
      ...prev,
      sectionsOrder: prev.sectionsOrder.map((s) =>
        s.id === id ? { ...s, visible: !s.visible } : s
      ),
    }));
  };

  const handleRemoveSectionFromPage = (id: SectionKey) => {
    updateConfig((prev) => ({
      ...prev,
      sectionsOrder: prev.sectionsOrder.filter((s) => s.id !== id),
    }));
    showNotice("Seção removida do rascunho. Clique em 'Atualizar Página' para aplicar.");
  };

  const handleAddSectionToPage = (sec: { id: SectionKey; label: string }) => {
    updateConfig((prev) => {
      if (prev.sectionsOrder.some((s) => s.id === sec.id)) {
        return {
          ...prev,
          sectionsOrder: prev.sectionsOrder.map((s) =>
            s.id === sec.id ? { ...s, visible: true } : s
          ),
        };
      }
      return {
        ...prev,
        sectionsOrder: [
          ...prev.sectionsOrder,
          { id: sec.id, label: sec.label, visible: true },
        ],
      };
    });
    showNotice(`Seção "${sec.label}" inserida no rascunho.`);
  };

  /* ─── File Upload to Base64 Helper ─────────────────────────────────────── */
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoaded: (dataUrl: string, file: File) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onLoaded(reader.result, file);
        showNotice(`Arquivo "${file.name}" carregado no rascunho.`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* ─── History Editions Helpers ─────────────────────────────────────────── */
  const handleAddHistoryEdition = () => {
    const newEd: HistoryEditionItem = {
      id: `ed-${Date.now()}`,
      year: "2026",
      title: "Nova Edição do Torneio SENAC",
      subtitle: "Edição Oficial de Engenharia",
      teams: 30,
      matches: 100,
      publicCount: "1.200+",
      championTeam: "Equipe Campeã",
      championRobot: "Robô Campeão",
      championInst: "SENAC Santo Amaro",
      viceTeam: "Equipe Vice",
      viceRobot: "Robô Vice",
      viceInst: "SENAC Tech",
      highlight: "Destaque técnico desta edição do torneio.",
    };
    updateConfig((prev) => ({
      ...prev,
      historico: {
        ...prev.historico,
        editions: [newEd, ...prev.historico.editions],
      },
    }));
    showNotice("Nova edição histórica adicionada ao rascunho.");
  };

  const handleRemoveHistoryEdition = (editionId: string) => {
    updateConfig((prev) => ({
      ...prev,
      historico: {
        ...prev.historico,
        editions: prev.historico.editions.filter((e) => e.id !== editionId),
      },
    }));
    showNotice("Edição removida do rascunho.");
  };

  /* ─── Gallery Photos Helpers ───────────────────────────────────────────── */
  const handleAddGalleryPhoto = () => {
    const newPhoto: GalleryPhotoItem = {
      id: `gal-${Date.now()}`,
      category: "SUMÔ",
      title: "Novo Registro Oficial",
      desc: "Descrição do momento registrado durante o torneio.",
      src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80",
    };
    updateConfig((prev) => ({
      ...prev,
      galeria: {
        ...prev.galeria,
        items: [newPhoto, ...prev.galeria.items],
      },
    }));
    showNotice("Nova foto adicionada ao rascunho da galeria.");
  };

  const handleRemoveGalleryPhoto = (photoId: string) => {
    updateConfig((prev) => ({
      ...prev,
      galeria: {
        ...prev.galeria,
        items: prev.galeria.items.filter((i) => i.id !== photoId),
      },
    }));
    showNotice("Foto removida do rascunho.");
  };

  /* ─── Knowledge Hub Docs Helpers ───────────────────────────────────────── */
  const handleAddKnowledgeDoc = () => {
    const newDoc: KnowledgeDocItem = {
      id: `doc-${Date.now()}`,
      name: "Novo_Manual_Tecnico_SENAC.pdf",
      size: 1500000,
      title: "Novo Manual ou Regulamento Técnico",
      desc: "Descreva o conteúdo deste documento oficial para orientar as equipes.",
    };
    updateConfig((prev) => ({
      ...prev,
      knowledge: {
        ...prev.knowledge,
        docs: [...prev.knowledge.docs, newDoc],
      },
    }));
    showNotice("Novo documento adicionado ao rascunho do Knowledge Hub.");
  };

  const handleRemoveKnowledgeDoc = (docId: string) => {
    updateConfig((prev) => ({
      ...prev,
      knowledge: {
        ...prev.knowledge,
        docs: prev.knowledge.docs.filter((d) => d.id !== docId),
      },
    }));
    showNotice("Documento removido do rascunho.");
  };

  /* ─── News Cards Draft Helpers ─────────────────────────────────────────── */
  const handleAddNewsCard = () => {
    const newCard: NewsCardItem = {
      id: `card-${Date.now()}`,
      img: "https://images.unsplash.com/photo-1581092333322-31d2fd38a35e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      tag: "DESTAQUE",
      title: "NOVO CARD DE CONTEÚDO",
      desc: "Descreva aqui as informações deste card para os visitantes.",
      modalBody: "Texto detalhado exibido quando o visitante clica no card.",
    };
    updateConfig((prev) => ({
      ...prev,
      news: { ...prev.news, cards: [...prev.news.cards, newCard] },
    }));
    showNotice("Novo card adicionado ao rascunho.");
  };

  const handleRemoveNewsCard = (cardId: string) => {
    updateConfig((prev) => ({
      ...prev,
      news: {
        ...prev.news,
        cards: prev.news.cards.filter((c) => c.id !== cardId),
      },
    }));
    showNotice("Card removido do rascunho.");
  };

  /* ─── Custom Blocks Draft Helpers ──────────────────────────────────────── */
  const handleAddCustomBlock = () => {
    const newBlock: CustomBlockItem = {
      id: `block-${Date.now()}`,
      layout: "split",
      eyebrow: "COMUNICADO",
      title: "NOVA SEÇÃO PERSONALIZADA",
      content:
        "Adicione avisos importantes, cronograma de baterias, patrocinadores ou instruções para as equipes participantes.",
      imageUrl: "",
      buttonText: "",
      buttonUrl: "",
      bgStyle: "light",
    };
    updateConfig((prev) => {
      const hasCustomInOrder = prev.sectionsOrder.some((s) => s.id === "customBlocks");
      return {
        ...prev,
        sectionsOrder: hasCustomInOrder
          ? prev.sectionsOrder
          : [
              ...prev.sectionsOrder,
              { id: "customBlocks", label: "Seções Personalizadas", visible: true },
            ],
        customBlocks: [...prev.customBlocks, newBlock],
      };
    });
    setActiveTab("custom");
    showNotice("Nova seção criada no rascunho.");
  };

  const handleRemoveCustomBlock = (blockId: string) => {
    updateConfig((prev) => ({
      ...prev,
      customBlocks: prev.customBlocks.filter((b) => b.id !== blockId),
    }));
    showNotice("Seção removida do rascunho.");
  };

  const jumpToSectionTab = (secId: SectionKey) => {
    if (secId === "navbar") setActiveTab("navbar");
    else if (secId === "hero") setActiveTab("hero");
    else if (secId === "torneios") setActiveTab("torneios");
    else if (secId === "historico") setActiveTab("historico");
    else if (secId === "galeria") setActiveTab("galeria");
    else if (secId === "knowledge") setActiveTab("knowledge");
    else if (secId === "sobre") setActiveTab("sobre");
    else if (secId === "news") setActiveTab("news");
    else if (secId === "customBlocks") setActiveTab("custom");
    else if (secId === "cta") setActiveTab("cta");
    else if (secId === "footer") setActiveTab("footer");
  };

  const removedSections = ALL_AVAILABLE_SECTIONS.filter(
    (avail) => !config.sectionsOrder.some((s) => s.id === avail.id)
  );

  /* ─── Live Preview Component (Used in Split & Preview Modes) ───────────── */
  const renderLivePreview = () => (
    <div className="bg-white rounded-[12px] border border-[#cbd5e1] shadow-lg overflow-hidden">
      <div className="bg-[#f1f5f9] px-4 py-2.5 border-b border-[#cbd5e1] flex items-center justify-between text-[12px] text-[#475569]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]" />
          <span className="ml-2 font-mono text-[11px] bg-white px-3 py-1 rounded border border-[#e2e8f0] text-[#0f172a]">
            http://localhost:5173
          </span>
        </div>
        <span className="text-[11px] font-medium text-[#64748b]">
          Clique em qualquer seção abaixo para editá-la
        </span>
      </div>

      {config.sectionsOrder.filter((s) => s.visible).length === 0 ? (
        <div className="py-24 px-6 text-center space-y-4">
          <p className="font-['Space_Grotesk'] font-bold text-[18px] text-[#0f172a]">
            A página pública está em branco
          </p>
          <p className="text-[13px] text-[#64748b] max-w-md mx-auto">
            Todas as seções foram removidas ou ocultadas. Adicione as seções que desejar na aba "Estrutura da Página".
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {config.sectionsOrder.map((sec) => {
            if (!sec.visible) return null;

            if (sec.id === "navbar") {
              return (
                <div
                  key="navbar"
                  onClick={() => setActiveTab("navbar")}
                  className="cursor-pointer hover:ring-2 hover:ring-[#00356a] transition-all"
                >
                  {config.navbar.showTopBar !== false && (
                    <div
                      style={{ backgroundColor: config.theme.primaryColor }}
                      className="flex items-center justify-between px-6 py-1.5"
                    >
                      <span className="font-mono text-white text-[10px] tracking-[1px] uppercase">
                        {config.navbar.topBarTitle || "TORNEIO DE ROBÓTICA & ENGENHARIAS SENAC 2026"}
                      </span>
                      <span className="font-mono text-[#00f2ff] text-[10px] tracking-[1px] uppercase font-bold">
                        {config.navbar.topBarBadge}
                      </span>
                    </div>
                  )}
                  <div className="bg-white px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <span
                        style={{ color: config.theme.primaryColor }}
                        className="font-['Space_Grotesk'] font-bold text-[18px]"
                      >
                        {config.navbar.brandTitle}
                      </span>
                      <div className="hidden md:flex items-center gap-6">
                        {config.navbar.navLinks.map((lnk, idx) => (
                          <span
                            key={`${lnk}-${idx}`}
                            className="font-['Space_Grotesk'] font-bold text-[11px] text-[#475569] uppercase"
                          >
                            {lnk}
                          </span>
                        ))}
                      </div>
                    </div>
                    {config.navbar.showPortalButton !== false && config.navbar.portalButtonText && (
                      <span
                        style={{ backgroundColor: config.theme.primaryColor }}
                        className="text-white font-['Space_Grotesk'] font-bold text-[11px] uppercase px-4 py-2 rounded-[2px]"
                      >
                        {config.navbar.portalButtonText}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            if (sec.id === "hero") {
              return (
                <div
                  key="hero"
                  onClick={() => setActiveTab("hero")}
                  className="relative min-h-[360px] flex flex-col justify-center p-8 lg:p-12 overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#00356a] transition-all"
                  style={{
                    background: `radial-gradient(ellipse at center, ${config.theme.primaryColor}cc 0%, #03294de6 50%, #051d30 100%)`,
                  }}
                >
                  {config.hero.heroImageUrl && (
                    <img
                      src={config.hero.heroImageUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none"
                    />
                  )}
                  <div className="relative z-10 max-w-2xl space-y-4">
                    {config.hero.showStatusBadge !== false && config.hero.statusBadge && (
                      <div className="inline-flex items-center gap-2 bg-black/30 border border-[#00f2ff]/40 px-3 py-1 rounded-[2px]">
                        <span
                          style={{ backgroundColor: config.theme.accentColor }}
                          className="w-2 h-2 rounded-full"
                        />
                        <span
                          style={{ color: config.theme.accentColor }}
                          className="font-mono text-[10px] tracking-[2px] uppercase"
                        >
                          {config.hero.statusBadge}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col">
                      {config.hero.titleLine1 && (
                        <span className="font-['Space_Grotesk'] font-black text-white text-3xl sm:text-5xl uppercase leading-none">
                          {config.hero.titleLine1}
                        </span>
                      )}
                      {config.hero.titleHighlight && (
                        <span
                          style={{ color: config.theme.accentColor }}
                          className="font-['Space_Grotesk'] font-bold text-3xl sm:text-5xl uppercase leading-none"
                        >
                          {config.hero.titleHighlight}
                        </span>
                      )}
                    </div>

                    {config.hero.description && (
                      <p className="text-white/80 text-sm leading-relaxed">
                        {config.hero.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 flex-wrap pt-1">
                      {config.hero.showCtaButton !== false && config.hero.ctaButtonText && (
                        <span
                          style={{
                            backgroundColor: config.theme.accentColor,
                            color: config.theme.primaryColor,
                          }}
                          className="px-5 py-2.5 rounded-[2px] font-['Space_Grotesk'] font-bold text-xs uppercase tracking-[1.2px]"
                        >
                          {config.hero.ctaButtonText}
                        </span>
                      )}
                      {config.hero.showSecondaryButton !== false && (
                        <span className="px-4 py-2.5 rounded-[2px] border border-white/30 text-white font-['Space_Grotesk'] font-bold text-xs uppercase">
                          {config.hero.secondaryButtonText || "Ver Torneios Ativos"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            if (sec.id === "torneios") {
              return (
                <div
                  key="torneios"
                  onClick={() => setActiveTab("torneios")}
                  className="bg-[#f8fafc] p-8 lg:p-10 border-t border-[#e2e8f0] space-y-6 cursor-pointer hover:ring-2 hover:ring-[#00356a] transition-all"
                >
                  <div>
                    <span
                      style={{ color: config.theme.secondaryColor }}
                      className="font-['Space_Grotesk'] font-bold text-[11px] tracking-[3px] uppercase block"
                    >
                      {config.torneios.eyebrow}
                    </span>
                    <h2
                      style={{ color: config.theme.primaryColor }}
                      className="font-['Space_Grotesk'] font-black text-2xl uppercase mt-1"
                    >
                      {config.torneios.heading}
                    </h2>
                    <p className="text-xs text-slate-600 max-w-2xl mt-1">{config.torneios.description}</p>
                  </div>

                  {/* Grid de Arenas com Imagens em Destaque */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        title: "Arena Sumô (Principal)",
                        mod: "Confronto Direto",
                        img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500",
                        dim: "154cm diâmetro",
                        cap: "64 vagas",
                        rule: "Regulamento_Oficial_Sumo_2026.pdf",
                      },
                      {
                        title: "Arena de Corrida",
                        mod: "Cronometrada",
                        img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500",
                        dim: "10m x 10m",
                        cap: "32 vagas",
                        rule: "Regulamento geral no Knowledge Hub",
                      },
                      {
                        title: "Arena de Desafios",
                        mod: "Confronto Direto",
                        img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500",
                        dim: "8m x 8m",
                        cap: "24 vagas",
                        rule: "Regulamento geral no Knowledge Hub",
                      },
                      {
                        title: "Arena Dançarino",
                        mod: "Confronto Direto",
                        img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500",
                        dim: "6m x 6m",
                        cap: "20 vagas",
                        rule: "Regulamento geral no Knowledge Hub",
                      },
                    ].map((a, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-[6px] border border-[#cbd5e1] overflow-hidden shadow-2xs flex flex-col"
                      >
                        <div className="relative h-28 bg-slate-200 overflow-hidden">
                          <img src={a.img} alt={a.title} className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-xs">
                            • ATIVA
                          </span>
                        </div>
                        <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-mono text-[#00356a] font-bold uppercase block">
                              {a.mod}
                            </span>
                            <h4 className="font-['Space_Grotesk'] font-bold text-xs uppercase text-[#051d30]">
                              {a.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                              <span>{a.dim}</span>
                              <span>•</span>
                              <span>{a.cap}</span>
                            </div>
                          </div>
                          <div className="text-[10px] bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-600 truncate font-mono">
                            📄 {a.rule}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (sec.id === "historico") {
              return (
                <div
                  key="historico"
                  onClick={() => setActiveTab("historico")}
                  className="bg-white p-8 lg:p-10 border-t border-[#e2e8f0] space-y-6 cursor-pointer hover:ring-2 hover:ring-[#00356a] transition-all"
                >
                  <div>
                    <span
                      style={{ color: config.theme.secondaryColor }}
                      className="font-['Space_Grotesk'] font-bold text-[11px] tracking-[3px] uppercase block"
                    >
                      {config.historico.eyebrow}
                    </span>
                    <h2
                      style={{ color: config.theme.primaryColor }}
                      className="font-['Space_Grotesk'] font-black text-2xl uppercase mt-1"
                    >
                      {config.historico.heading}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">{config.historico.description}</p>
                  </div>

                  <div
                    style={{ backgroundColor: config.theme.primaryColor }}
                    className="grid grid-cols-4 gap-3 p-4 text-white rounded-[6px]"
                  >
                    <div>
                      <span className="text-lg font-black text-[#00f2ff] block">
                        {config.historico.stat1Value}
                      </span>
                      <span className="text-[10px] uppercase text-slate-300">
                        {config.historico.stat1Label}
                      </span>
                    </div>
                    <div>
                      <span className="text-lg font-black text-[#00f2ff] block">
                        {config.historico.stat2Value}
                      </span>
                      <span className="text-[10px] uppercase text-slate-300">
                        {config.historico.stat2Label}
                      </span>
                    </div>
                    <div>
                      <span className="text-lg font-black text-[#00f2ff] block">
                        {config.historico.stat3Value}
                      </span>
                      <span className="text-[10px] uppercase text-slate-300">
                        {config.historico.stat3Label}
                      </span>
                    </div>
                    <div>
                      <span className="text-lg font-black text-[#00f2ff] block">
                        {config.historico.stat4Value}
                      </span>
                      <span className="text-[10px] uppercase text-slate-300">
                        {config.historico.stat4Label}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {config.historico.editions.map((ed) => (
                      <div key={ed.id} className="p-4 rounded bg-[#f8fafc] border border-slate-200 space-y-2">
                        <span className="px-2 py-0.5 bg-[#00356a] text-white text-[10px] font-bold rounded">
                          ANO {ed.year}
                        </span>
                        <h4 className="font-bold text-sm text-[#051d30]">{ed.title}</h4>
                        <p className="text-[11px] text-slate-500">1º {ed.championTeam} ({ed.championRobot})</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (sec.id === "galeria") {
              return (
                <div
                  key="galeria"
                  onClick={() => setActiveTab("galeria")}
                  className="bg-[#f8fafc] p-8 lg:p-10 border-t border-[#e2e8f0] space-y-5 cursor-pointer hover:ring-2 hover:ring-[#00356a] transition-all"
                >
                  <div>
                    <span
                      style={{ color: config.theme.secondaryColor }}
                      className="font-['Space_Grotesk'] font-bold text-[11px] tracking-[3px] uppercase block"
                    >
                      {config.galeria.eyebrow}
                    </span>
                    <h2
                      style={{ color: config.theme.primaryColor }}
                      className="font-['Space_Grotesk'] font-black text-2xl uppercase mt-1"
                    >
                      {config.galeria.heading}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">{config.galeria.description}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {config.galeria.items.slice(0, 6).map((item) => (
                      <div key={item.id} className="relative rounded overflow-hidden aspect-[4/3] bg-slate-900">
                        <img src={item.src} alt={item.title} className="w-full h-full object-cover opacity-80" />
                        <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent text-white">
                          <span className="text-[9px] uppercase font-bold text-[#00f2ff]">{item.category}</span>
                          <p className="text-xs font-bold truncate">{item.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (sec.id === "knowledge") {
              return (
                <div
                  key="knowledge"
                  onClick={() => setActiveTab("knowledge")}
                  className="bg-white p-8 lg:p-10 border-t border-[#e2e8f0] space-y-5 cursor-pointer hover:ring-2 hover:ring-[#00356a] transition-all"
                >
                  <div>
                    <span
                      style={{ color: config.theme.secondaryColor }}
                      className="font-['Space_Grotesk'] font-bold text-[11px] tracking-[3px] uppercase block"
                    >
                      {config.knowledge.eyebrow}
                    </span>
                    <h2
                      style={{ color: config.theme.primaryColor }}
                      className="font-['Space_Grotesk'] font-black text-2xl uppercase mt-1"
                    >
                      {config.knowledge.heading}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1">{config.knowledge.description}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {config.knowledge.docs.map((doc) => (
                      <div key={doc.id} className="p-3.5 rounded bg-[#f8fafc] border border-slate-200">
                        <p className="font-bold text-xs text-[#051d30]">{doc.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{doc.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (sec.id === "sobre") {
              return (
                <div
                  key="sobre"
                  onClick={() => setActiveTab("sobre")}
                  className="bg-[#f8fafc] p-8 lg:p-10 border-t border-[#e2e8f0] space-y-4 cursor-pointer hover:ring-2 hover:ring-[#00356a] transition-all"
                >
                  <span
                    style={{ color: config.theme.secondaryColor }}
                    className="font-['Space_Grotesk'] font-bold text-[11px] tracking-[3px] uppercase block"
                  >
                    {config.sobre.eyebrow}
                  </span>
                  <h2
                    style={{ color: config.theme.primaryColor }}
                    className="font-['Space_Grotesk'] font-black text-2xl uppercase"
                  >
                    {config.sobre.heading}
                  </h2>
                  <p className="text-xs text-slate-600 line-clamp-2">{config.sobre.paragraph1}</p>
                  <div className="flex flex-wrap gap-2">
                    {config.sobre.courses.map((c, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded text-[11px] font-semibold text-[#00356a]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              );
            }

            if (sec.id === "news") {
              return (
                <div
                  key="news"
                  onClick={() => setActiveTab("news")}
                  className="bg-white p-8 lg:p-12 space-y-6 cursor-pointer border-t border-[#e2e8f0] hover:ring-2 hover:ring-[#00356a] transition-all"
                >
                  <div>
                    {config.news.eyebrow && (
                      <span
                        style={{ color: config.theme.secondaryColor }}
                        className="font-['Space_Grotesk'] font-bold text-[11px] tracking-[4px] uppercase block"
                      >
                        {config.news.eyebrow}
                      </span>
                    )}
                    {config.news.heading && (
                      <h2
                        style={{ color: config.theme.primaryColor }}
                        className="font-['Space_Grotesk'] font-black text-2xl uppercase mt-1"
                      >
                        {config.news.heading}
                      </h2>
                    )}
                  </div>

                  {config.news.cards.length === 0 ? (
                    <p className="text-xs text-[#64748b] italic">
                      Nenhum card cadastrado nesta seção.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {config.news.cards.map((c) => (
                        <div
                          key={c.id}
                          className="relative rounded-[4px] overflow-hidden aspect-[4/5] max-h-[260px] bg-slate-900"
                        >
                          {c.img && (
                            <img
                              src={c.img}
                              alt={c.title}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#00356a]/90 via-[#00356a]/30 to-transparent" />
                          <div className="absolute bottom-0 left-0 p-4 text-white">
                            {c.tag && (
                              <span
                                style={{ backgroundColor: config.theme.secondaryColor }}
                                className="text-[9px] font-bold uppercase px-2 py-0.5"
                              >
                                {c.tag}
                              </span>
                            )}
                            <h3 className="font-['Space_Grotesk'] font-bold text-sm uppercase mt-1.5 whitespace-pre-line">
                              {c.title}
                            </h3>
                            <p className="text-xs text-white/80 mt-1 line-clamp-2">{c.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            if (sec.id === "customBlocks") {
              if (config.customBlocks.length === 0) return null;
              return (
                <div
                  key="customBlocks"
                  onClick={() => setActiveTab("custom")}
                  className="cursor-pointer"
                >
                  {config.customBlocks.map((b) => (
                    <div
                      key={b.id}
                      className={`p-8 lg:p-12 border-t border-[#e2e8f0] ${
                        b.bgStyle === "dark"
                          ? "bg-[#051d30] text-white"
                          : b.bgStyle === "blue"
                          ? "bg-[#edf4ff] text-[#051d30]"
                          : "bg-white text-[#051d30]"
                      }`}
                    >
                      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 space-y-2.5">
                          {b.eyebrow && (
                            <span
                              style={{
                                color:
                                  b.bgStyle === "dark"
                                    ? config.theme.accentColor
                                    : config.theme.secondaryColor,
                              }}
                              className="font-['Space_Grotesk'] font-bold text-[11px] tracking-[3px] uppercase block"
                            >
                              {b.eyebrow}
                            </span>
                          )}
                          {b.title && (
                            <h3 className="font-['Space_Grotesk'] font-black text-2xl uppercase">
                              {b.title}
                            </h3>
                          )}
                          {b.content && (
                            <p className="text-sm leading-relaxed opacity-85 whitespace-pre-line">
                              {b.content}
                            </p>
                          )}
                          {b.buttonText && (
                            <span
                              style={{ backgroundColor: config.theme.primaryColor }}
                              className="inline-block mt-2 px-5 py-2 rounded-[2px] text-white font-['Space_Grotesk'] font-bold text-xs uppercase"
                            >
                              {b.buttonText}
                            </span>
                          )}
                        </div>
                        {b.imageUrl && (
                          <img
                            src={b.imageUrl}
                            alt={b.title}
                            className="w-full md:w-64 h-44 object-cover rounded-[4px] shadow-md"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            if (sec.id === "cta") {
              return (
                <div
                  key="cta"
                  onClick={() => setActiveTab("cta")}
                  style={{ borderTopColor: config.theme.secondaryColor }}
                  className="bg-[#f7f9ff] p-8 lg:p-12 border-t-8 text-center space-y-5 cursor-pointer hover:ring-2 hover:ring-[#00356a] transition-all"
                >
                  {config.cta.eyebrow && (
                    <span
                      style={{ color: config.theme.primaryColor }}
                      className="font-['Space_Grotesk'] font-bold text-xs tracking-[5px] uppercase block"
                    >
                      {config.cta.eyebrow}
                    </span>
                  )}
                  <h2 className="font-['Space_Grotesk'] font-black text-2xl sm:text-3xl text-[#051d30] uppercase">
                    {config.cta.headingPart1}
                    <span style={{ color: config.theme.primaryColor }}>
                      {config.cta.headingHighlight}
                    </span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto text-left pt-2">
                    {config.cta.showCard1 !== false && (
                      <div className="bg-white p-5 rounded-[2px] shadow-sm border border-[#e2e8f0]">
                        <span
                          style={{ color: config.theme.secondaryColor }}
                          className="font-black text-2xl"
                        >
                          {config.cta.card1Number}
                        </span>
                        <h3
                          style={{ color: config.theme.primaryColor }}
                          className="font-['Space_Grotesk'] font-bold text-base uppercase mt-1"
                        >
                          {config.cta.card1Title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1">{config.cta.card1Desc}</p>
                      </div>
                    )}
                    {config.cta.showCard2 !== false && (
                      <div className="bg-[#cfe5ff] p-5 rounded-[2px]">
                        <span
                          style={{ color: config.theme.primaryColor }}
                          className="font-black text-2xl opacity-30"
                        >
                          {config.cta.card2Number}
                        </span>
                        <h3
                          style={{ color: config.theme.primaryColor }}
                          className="font-['Space_Grotesk'] font-bold text-base uppercase mt-1"
                        >
                          {config.cta.card2Title}
                        </h3>
                        <p className="text-xs text-slate-700 mt-1">{config.cta.card2Desc}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            if (sec.id === "footer") {
              return (
                <div
                  key="footer"
                  onClick={() => setActiveTab("footer")}
                  className="bg-[#051d30] text-white p-8 lg:p-10 cursor-pointer hover:ring-2 hover:ring-[#00f2ff] transition-all"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-8">
                    <div>
                      <p className="font-['Space_Grotesk'] font-black text-lg">
                        {config.footer.brandName}
                      </p>
                      <p className="text-xs text-white/50 whitespace-pre-line mt-2">
                        {config.footer.tagline}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-xs">
                      <div>
                        <p className="font-bold text-[10px] uppercase mb-2">
                          {config.footer.col1Title}
                        </p>
                        {config.footer.col1Items.map((it, idx) => (
                          <p key={`${it}-${idx}`} className="text-white/60 py-0.5">
                            {it}
                          </p>
                        ))}
                      </div>
                      <div>
                        <p className="font-bold text-[10px] uppercase mb-2">
                          {config.footer.col2Title}
                        </p>
                        {config.footer.col2Items.map((it, idx) => (
                          <p key={`${it}-${idx}`} className="text-white/60 py-0.5">
                            {it}
                          </p>
                        ))}
                      </div>
                      <div>
                        <p className="font-bold text-[10px] uppercase mb-2">
                          {config.footer.col3Title}
                        </p>
                        {config.footer.col3Items.map((it, idx) => (
                          <p key={`${it}-${idx}`} className="text-white/60 py-0.5">
                            {it}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-white/10 mt-6 pt-4 text-[11px] text-white/40">
                    {config.footer.copyright}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative w-full min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <AdminSidebar active="site" onNavigate={onNavigate} onLogout={onLogout} />

      <div className="pl-0 md:pl-[256px] w-full min-h-screen flex flex-col">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#cbd5e1] px-4 sm:px-8 py-4 pl-16 md:pl-8 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-['Space_Grotesk'] font-bold text-[20px] text-[#051d30]">
                Gerenciador da Página Pública
              </h1>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  saving
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : hasUnsavedChanges
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {saving
                  ? "Salvando no banco..."
                  : hasUnsavedChanges
                  ? "Alterações pendentes (clique em Atualizar Página)"
                  : "Sincronizado com o Banco de Dados"}
              </span>
            </div>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              Gerencie todas as 11 seções atuais de http://localhost:5173 e clique em "Atualizar Página" para publicar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex rounded-[8px] bg-[#f1f5f9] p-1 border border-[#cbd5e1]">
              {(
                [
                  { id: "editor", label: "Modo Editor" },
                  { id: "split", label: "Editor + Preview" },
                  { id: "preview", label: "Tela Cheia (Preview)" },
                ] as const
              ).map((v) => (
                <button
                  key={v.id}
                  onClick={() => setWorkspaceView(v.id)}
                  className={`px-3 py-1.5 rounded-[6px] text-[12px] font-semibold cursor-pointer transition-colors ${
                    workspaceView === v.id
                      ? "bg-[#00356a] text-white"
                      : "text-[#475569] hover:text-[#0f172a]"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {hasUnsavedChanges && (
              <button
                onClick={fetchConfigFromDb}
                disabled={saving}
                className="px-3.5 py-2 rounded-[8px] border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[12px] cursor-pointer transition-colors"
              >
                Descartar Alterações
              </button>
            )}

            <button
              onClick={handleClearAll}
              disabled={saving}
              className="px-3.5 py-2 rounded-[8px] border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-[12px] cursor-pointer transition-colors"
            >
              Zerar Página
            </button>

            <button
              onClick={handleResetDefault}
              disabled={saving}
              className="px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] bg-white hover:bg-[#f1f5f9] text-[#334155] font-semibold text-[12px] cursor-pointer transition-colors"
            >
              Restaurar Padrão
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-[8px] border border-[#00356a] text-[#00356a] hover:bg-[#edf4ff] font-semibold text-[12px] inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Abrir Site Público</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>

            <button
              onClick={() => saveConfigToApi(config, false)}
              disabled={saving}
              className={`px-5 py-2 rounded-[8px] font-['Space_Grotesk'] font-bold text-[12px] uppercase tracking-[0.5px] cursor-pointer shadow-xs transition-all ${
                hasUnsavedChanges
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300"
                  : "bg-[#00356a] hover:bg-[#00468a] text-white"
              }`}
            >
              {saving ? "Atualizando..." : "Atualizar Página"}
            </button>
          </div>
        </header>

        {/* Navigation Tabs Bar */}
        {workspaceView !== "preview" && (
          <div className="bg-white border-b border-[#e2e8f0] px-4 sm:px-8 py-2.5 flex items-center gap-2 overflow-x-auto">
            {(
              [
                { id: "layout", label: "Estrutura da Página" },
                { id: "navbar", label: "Barra Superior" },
                { id: "hero", label: "Banner Hero" },
                { id: "torneios", label: "Torneios Ativos" },
                { id: "historico", label: `Histórico (${config.historico.editions.length})` },
                { id: "galeria", label: `Galeria (${config.galeria.items.length})` },
                { id: "knowledge", label: `Knowledge Hub (${config.knowledge.docs.length})` },
                { id: "sobre", label: "Sobre & Instagram" },
                { id: "news", label: `Destaques (${config.news.cards.length})` },
                { id: "custom", label: `Seções Extras (${config.customBlocks.length})` },
                { id: "cta", label: "Chamada Final" },
                { id: "footer", label: "Rodapé" },
                { id: "theme", label: "Cores" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2 rounded-[8px] text-[12px] font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === t.id
                    ? "bg-[#00356a] text-white"
                    : "bg-[#f8fafc] text-[#475569] border border-[#e2e8f0] hover:bg-[#edf4ff] hover:text-[#00356a]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Main Page Body — Scrolls Naturally Down the Page */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1600px] w-full mx-auto">
          {loading ? (
            <div className="bg-white rounded-[12px] border border-[#cbd5e1] p-12 text-center text-[#64748b]">
              Carregando configurações salvas no banco de dados...
            </div>
          ) : workspaceView === "preview" ? (
            renderLivePreview()
          ) : (
            <div
              className={
                workspaceView === "split"
                  ? "grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"
                  : "max-w-4xl mx-auto"
              }
            >
              {/* ─── EDITOR COLUMN ──────────────────────────────────────────── */}
              <div className={workspaceView === "split" ? "xl:col-span-5 space-y-6" : "space-y-6"}>
                {activeTab === "layout" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-[12px] border border-[#cbd5e1] p-6 space-y-5 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">
                        <div>
                          <h2 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                            Seções Ativas na Página ({config.sectionsOrder.length})
                          </h2>
                          <p className="text-[13px] text-[#64748b] mt-0.5">
                            Reordene a posição de cada bloco, oculte temporariamente ou remova da página.
                          </p>
                        </div>
                        <button
                          onClick={handleAddCustomBlock}
                          className="px-4 py-2 rounded-[8px] bg-[#00356a] hover:bg-[#00468a] text-white font-semibold text-[12px] cursor-pointer"
                        >
                          + Criar Seção Personalizada
                        </button>
                      </div>

                      {config.sectionsOrder.length === 0 ? (
                        <div className="p-8 rounded-[10px] border border-dashed border-[#cbd5e1] bg-[#f8fafc] text-center space-y-2">
                          <p className="font-semibold text-[14px] text-[#0f172a]">
                            Nenhuma seção ativa na página pública
                          </p>
                          <p className="text-[12px] text-[#64748b]">
                            Use o catálogo abaixo para adicionar apenas as seções que você quer exibir.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {config.sectionsOrder.map((sec, idx) => (
                            <div
                              key={sec.id}
                              className={`p-4 rounded-[10px] border flex flex-wrap items-center justify-between gap-4 transition-all ${
                                sec.visible
                                  ? "bg-white border-[#cbd5e1]"
                                  : "bg-[#f8fafc] border-dashed border-[#cbd5e1] opacity-70"
                              }`}
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <span className="w-8 h-8 rounded-[8px] bg-[#edf4ff] text-[#00356a] font-mono font-bold text-[13px] flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <div>
                                  <p className="font-bold text-[14px] text-[#0f172a]">
                                    {sec.label}
                                  </p>
                                  <span
                                    className={`text-[11px] font-semibold ${
                                      sec.visible ? "text-emerald-700" : "text-[#64748b]"
                                    }`}
                                  >
                                    {sec.visible ? "Visível na página pública" : "Oculta"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => jumpToSectionTab(sec.id)}
                                  className="px-3 py-1.5 rounded-[6px] bg-[#edf4ff] hover:bg-[#dce8fc] text-[#00356a] font-semibold text-[12px] cursor-pointer"
                                >
                                  Editar Conteúdo
                                </button>

                                <button
                                  onClick={() => handleMoveSection(idx, "up")}
                                  disabled={idx === 0}
                                  className={`px-2.5 py-1.5 rounded-[6px] border border-[#cbd5e1] text-[12px] font-semibold ${
                                    idx === 0
                                      ? "opacity-30 cursor-not-allowed"
                                      : "hover:bg-[#f1f5f9] cursor-pointer"
                                  }`}
                                >
                                  Subir
                                </button>

                                <button
                                  onClick={() => handleMoveSection(idx, "down")}
                                  disabled={idx === config.sectionsOrder.length - 1}
                                  className={`px-2.5 py-1.5 rounded-[6px] border border-[#cbd5e1] text-[12px] font-semibold ${
                                    idx === config.sectionsOrder.length - 1
                                      ? "opacity-30 cursor-not-allowed"
                                      : "hover:bg-[#f1f5f9] cursor-pointer"
                                  }`}
                                >
                                  Descer
                                </button>

                                <button
                                  onClick={() => handleToggleSectionVisible(sec.id)}
                                  className={`px-3 py-1.5 rounded-[6px] border text-[12px] font-semibold cursor-pointer ${
                                    sec.visible
                                      ? "border-[#cbd5e1] text-[#334155] hover:bg-[#f1f5f9]"
                                      : "border-emerald-300 bg-emerald-50 text-emerald-800"
                                  }`}
                                >
                                  {sec.visible ? "Ocultar" : "Mostrar"}
                                </button>

                                <button
                                  onClick={() => handleRemoveSectionFromPage(sec.id)}
                                  className="px-3 py-1.5 rounded-[6px] border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[12px] font-semibold cursor-pointer"
                                >
                                  Remover
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-[12px] border border-[#cbd5e1] p-6 space-y-4 shadow-2xs">
                      <div>
                        <h3 className="font-['Space_Grotesk'] font-bold text-[16px] text-[#051d30]">
                          Adicionar Seções à Página
                        </h3>
                        <p className="text-[12px] text-[#64748b] mt-0.5">
                          Recoloque qualquer seção removida ou insira novos blocos personalizados quando quiser.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {removedSections.map((sec) => (
                          <div
                            key={sec.id}
                            className="p-3.5 rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between gap-3"
                          >
                            <span className="font-semibold text-[13px] text-[#334155]">
                              {sec.label}
                            </span>
                            <button
                              onClick={() => handleAddSectionToPage(sec)}
                              className="px-3 py-1.5 rounded-[6px] bg-[#00356a] hover:bg-[#00468a] text-white text-[12px] font-semibold cursor-pointer shrink-0"
                            >
                              + Inserir
                            </button>
                          </div>
                        ))}

                        <div className="p-3.5 rounded-[10px] border border-[#cfe2ff] bg-[#edf4ff] flex items-center justify-between gap-3">
                          <span className="font-semibold text-[13px] text-[#00356a]">
                            Novo Bloco de Conteúdo Livre
                          </span>
                          <button
                            onClick={handleAddCustomBlock}
                            className="px-3 py-1.5 rounded-[6px] bg-[#00356a] hover:bg-[#00468a] text-white text-[12px] font-semibold cursor-pointer shrink-0"
                          >
                            + Criar Bloco
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "navbar" && (
                  <div className="bg-white rounded-[12px] border border-[#cbd5e1] p-6 space-y-5 shadow-2xs">
                    <div className="border-b border-[#e2e8f0] pb-4">
                      <h2 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                        Barra de Navegação Superior
                      </h2>
                      <p className="text-[12px] text-[#64748b]">
                        Configure o cabeçalho, faixa de aviso, links de navegação e botão do portal.
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-[8px] bg-[#f8fafc] border border-[#e2e8f0]">
                      <span className="text-[13px] font-semibold text-[#0f172a]">
                        Exibir faixa superior institucional
                      </span>
                      <input
                        type="checkbox"
                        checked={config.navbar.showTopBar !== false}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            navbar: { ...p.navbar, showTopBar: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 accent-[#00356a] cursor-pointer"
                      />
                    </div>

                    {config.navbar.showTopBar !== false && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                            Texto Esquerdo da Faixa Superior
                          </label>
                          <input
                            type="text"
                            value={config.navbar.topBarTitle || "TORNEIO DE ROBÓTICA & ENGENHARIAS SENAC 2026"}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                navbar: { ...p.navbar, topBarTitle: e.target.value },
                              }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                          />
                        </div>
                        <div>
                          <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                            Selo Direito da Faixa Superior
                          </label>
                          <input
                            type="text"
                            value={config.navbar.topBarBadge}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                navbar: { ...p.navbar, topBarBadge: e.target.value },
                              }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                        Título / Marca Principal
                      </label>
                      <input
                        type="text"
                        value={config.navbar.brandTitle}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            navbar: { ...p.navbar, brandTitle: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                      />
                    </div>

                    <div className="space-y-3 pt-2 border-t border-[#e2e8f0]">
                      <label className="text-[12px] font-semibold text-[#334155] block">
                        Links de Navegação do Menu ({config.navbar.navLinks.length})
                      </label>
                      <div className="space-y-2">
                        {config.navbar.navLinks.map((lnk, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={lnk}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateConfig((p) => ({
                                  ...p,
                                  navbar: {
                                    ...p.navbar,
                                    navLinks: p.navbar.navLinks.map((item, i) =>
                                      i === idx ? val : item
                                    ),
                                  },
                                }));
                              }}
                              className="flex-1 px-3 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                            />
                            <button
                              onClick={() =>
                                updateConfig((p) => ({
                                  ...p,
                                  navbar: {
                                    ...p.navbar,
                                    navLinks: p.navbar.navLinks.filter((_, i) => i !== idx),
                                  },
                                }))
                              }
                              className="px-3 py-2 rounded-[8px] border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[12px] font-semibold cursor-pointer"
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={newNavLink}
                          onChange={(e) => setNewNavLink(e.target.value)}
                          placeholder="Novo item do menu (ex: KNOWLEDGE HUB)"
                          className="flex-1 px-3 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                        <button
                          onClick={() => {
                            if (!newNavLink.trim()) return;
                            updateConfig((p) => ({
                              ...p,
                              navbar: {
                                ...p.navbar,
                                navLinks: [...p.navbar.navLinks, newNavLink.trim()],
                              },
                            }));
                            setNewNavLink("");
                          }}
                          className="px-4 py-2 rounded-[8px] bg-[#00356a] text-white text-[12px] font-semibold cursor-pointer"
                        >
                          + Adicionar Link
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#e2e8f0] space-y-3">
                      <div className="flex items-center justify-between p-3.5 rounded-[8px] bg-[#f8fafc] border border-[#e2e8f0]">
                        <span className="text-[13px] font-semibold text-[#0f172a]">
                          Exibir botão de acesso ao portal no topo
                        </span>
                        <input
                          type="checkbox"
                          checked={config.navbar.showPortalButton !== false}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              navbar: { ...p.navbar, showPortalButton: e.target.checked },
                            }))
                          }
                          className="w-4 h-4 accent-[#00356a] cursor-pointer"
                        />
                      </div>

                      {config.navbar.showPortalButton !== false && (
                        <div>
                          <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                            Texto do Botão do Portal
                          </label>
                          <input
                            type="text"
                            value={config.navbar.portalButtonText}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                navbar: { ...p.navbar, portalButtonText: e.target.value },
                              }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "hero" && (
                  <div className="bg-white rounded-[12px] border border-[#cbd5e1] p-6 space-y-5 shadow-2xs">
                    <div className="border-b border-[#e2e8f0] pb-4">
                      <h2 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                        Banner Principal (Hero) e Contagem Regressiva
                      </h2>
                      <p className="text-[12px] text-[#64748b]">
                        Edite ou oculte individualmente cada elemento do topo da página.
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-[8px] bg-[#f8fafc] border border-[#e2e8f0]">
                      <span className="text-[13px] font-semibold text-[#0f172a]">
                        Mostrar selo de status superior
                      </span>
                      <input
                        type="checkbox"
                        checked={config.hero.showStatusBadge !== false}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            hero: { ...p.hero, showStatusBadge: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 accent-[#00356a] cursor-pointer"
                      />
                    </div>

                    {config.hero.showStatusBadge !== false && (
                      <div>
                        <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                          Texto do Selo de Status
                        </label>
                        <input
                          type="text"
                          value={config.hero.statusBadge}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              hero: { ...p.hero, statusBadge: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                          Título Principal (Linha 1)
                        </label>
                        <input
                          type="text"
                          value={config.hero.titleLine1}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              hero: { ...p.hero, titleLine1: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                          Título em Destaque (Linha 2)
                        </label>
                        <input
                          type="text"
                          value={config.hero.titleHighlight}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              hero: { ...p.hero, titleHighlight: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                        Descrição do Banner
                      </label>
                      <textarea
                        rows={3}
                        value={config.hero.description}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            hero: { ...p.hero, description: e.target.value },
                          }))
                        }
                        className="w-full p-3.5 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#e2e8f0]">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[12px] font-semibold text-[#334155]">
                            Botão Principal
                          </label>
                          <input
                            type="checkbox"
                            checked={config.hero.showCtaButton !== false}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                hero: { ...p.hero, showCtaButton: e.target.checked },
                              }))
                            }
                            className="w-4 h-4 accent-[#00356a] cursor-pointer"
                          />
                        </div>
                        {config.hero.showCtaButton !== false && (
                          <input
                            type="text"
                            value={config.hero.ctaButtonText}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                hero: { ...p.hero, ctaButtonText: e.target.value },
                              }))
                            }
                            className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[12px] font-semibold text-[#334155]">
                            Botão Secundário ("Ver Torneios")
                          </label>
                          <input
                            type="checkbox"
                            checked={config.hero.showSecondaryButton !== false}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                hero: { ...p.hero, showSecondaryButton: e.target.checked },
                              }))
                            }
                            className="w-4 h-4 accent-[#00356a] cursor-pointer"
                          />
                        </div>
                        {config.hero.showSecondaryButton !== false && (
                          <input
                            type="text"
                            value={config.hero.secondaryButtonText || "Ver Torneios Ativos"}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                hero: { ...p.hero, secondaryButtonText: e.target.value },
                              }))
                            }
                            className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                          />
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[12px] font-semibold text-[#334155]">
                          Imagem de Fundo do Banner
                        </label>
                        {config.hero.heroImageUrl && (
                          <button
                            onClick={() =>
                              updateConfig((p) => ({
                                ...p,
                                hero: { ...p.hero, heroImageUrl: "" },
                              }))
                            }
                            className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
                          >
                            Remover Imagem
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={config.hero.heroImageUrl}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              hero: { ...p.hero, heroImageUrl: e.target.value },
                            }))
                          }
                          placeholder="Cole a URL da imagem ou envie do computador"
                          className="flex-1 px-3 py-2 rounded-[8px] border border-[#cbd5e1] bg-white text-[12px]"
                        />
                        <label className="px-4 py-2 rounded-[8px] bg-[#00356a] hover:bg-[#00468a] text-white font-semibold text-[12px] cursor-pointer">
                          Enviar do Computador
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, (dataUrl) =>
                                updateConfig((p) => ({
                                  ...p,
                                  hero: { ...p.hero, heroImageUrl: dataUrl },
                                }))
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div className="p-4 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[13px] text-[#0f172a]">
                          Exibir Card de Contagem Regressiva
                        </span>
                        <input
                          type="checkbox"
                          checked={config.hero.showCountdown}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              hero: { ...p.hero, showCountdown: e.target.checked },
                            }))
                          }
                          className="w-4 h-4 accent-[#00356a] cursor-pointer"
                        />
                      </div>

                      {config.hero.showCountdown && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          <div>
                            <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                              Subtítulo
                            </label>
                            <input
                              type="text"
                              value={config.hero.countdownLabel}
                              onChange={(e) =>
                                updateConfig((p) => ({
                                  ...p,
                                  hero: { ...p.hero, countdownLabel: e.target.value },
                                }))
                              }
                              className="w-full px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                              Título do Contador
                            </label>
                            <input
                              type="text"
                              value={config.hero.countdownTitle}
                              onChange={(e) =>
                                updateConfig((p) => ({
                                  ...p,
                                  hero: { ...p.hero, countdownTitle: e.target.value },
                                }))
                              }
                              className="w-full px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                              Data Alvo
                            </label>
                            <input
                              type="datetime-local"
                              value={config.hero.countdownTargetDate.slice(0, 16)}
                              onChange={(e) =>
                                updateConfig((p) => ({
                                  ...p,
                                  hero: { ...p.hero, countdownTargetDate: e.target.value },
                                }))
                              }
                              className="w-full px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "torneios" && (
                  <div className="bg-white rounded-[12px] border border-[#cbd5e1] p-6 space-y-5 shadow-2xs">
                    <div className="border-b border-[#e2e8f0] pb-4">
                      <h2 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                        Torneios Ativos & Arenas Homologadas
                      </h2>
                      <p className="text-[12px] text-[#64748b]">
                        Personalize os textos de cabeçalho da seção de Torneios Ativos. As arenas exibidas vêm diretamente do módulo de Arenas.
                      </p>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                        Subtítulo Superior (Eyebrow)
                      </label>
                      <input
                        type="text"
                        value={config.torneios.eyebrow}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            torneios: { ...p.torneios, eyebrow: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                        Título Principal da Seção
                      </label>
                      <input
                        type="text"
                        value={config.torneios.heading}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            torneios: { ...p.torneios, heading: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                        Descrição da Seção
                      </label>
                      <textarea
                        rows={3}
                        value={config.torneios.description}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            torneios: { ...p.torneios, description: e.target.value },
                          }))
                        }
                        className="w-full p-3.5 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "historico" && (
                  <div className="bg-white rounded-[12px] border border-[#cbd5e1] p-6 space-y-5 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">
                      <div>
                        <h2 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                          Histórico de Torneios & Hall da Fama ({config.historico.editions.length})
                        </h2>
                        <p className="text-[12px] text-[#64748b]">
                          Edite os indicadores estatísticos e cada edição histórica exibida na página pública.
                        </p>
                      </div>
                      <button
                        onClick={handleAddHistoryEdition}
                        className="px-4 py-2 rounded-[8px] bg-[#00356a] hover:bg-[#00468a] text-white font-semibold text-[12px] cursor-pointer"
                      >
                        + Nova Edição
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                          Subtítulo Superior
                        </label>
                        <input
                          type="text"
                          value={config.historico.eyebrow}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              historico: { ...p.historico, eyebrow: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                          Título Principal
                        </label>
                        <input
                          type="text"
                          value={config.historico.heading}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              historico: { ...p.historico, heading: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                        Descrição do Histórico
                      </label>
                      <textarea
                        rows={2}
                        value={config.historico.description}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            historico: { ...p.historico, description: e.target.value },
                          }))
                        }
                        className="w-full p-3 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                      />
                    </div>

                    {/* 4 Stat Counters */}
                    <div className="p-4 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                      <span className="font-bold text-[12px] text-[#00356a] uppercase block">
                        Faixa de Indicadores Numéricos
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(
                          [
                            { val: "stat1Value", lbl: "stat1Label" },
                            { val: "stat2Value", lbl: "stat2Label" },
                            { val: "stat3Value", lbl: "stat3Label" },
                            { val: "stat4Value", lbl: "stat4Label" },
                          ] as const
                        ).map((st, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <input
                              type="text"
                              value={config.historico[st.val]}
                              onChange={(e) =>
                                updateConfig((p) => ({
                                  ...p,
                                  historico: { ...p.historico, [st.val]: e.target.value },
                                }))
                              }
                              placeholder="Valor"
                              className="w-full px-2.5 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px] font-bold"
                            />
                            <input
                              type="text"
                              value={config.historico[st.lbl]}
                              onChange={(e) =>
                                updateConfig((p) => ({
                                  ...p,
                                  historico: { ...p.historico, [st.lbl]: e.target.value },
                                }))
                              }
                              placeholder="Legenda"
                              className="w-full px-2.5 py-1.5 rounded border border-[#cbd5e1] bg-white text-[11px]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {config.historico.editions.map((ed, idx) => (
                        <div
                          key={ed.id}
                          className="p-5 rounded-[10px] bg-[#f8fafc] border border-[#cbd5e1] space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[13px] text-[#00356a]">
                              Edição #{idx + 1} ({ed.year})
                            </span>
                            <button
                              onClick={() => handleRemoveHistoryEdition(ed.id)}
                              className="px-3 py-1 rounded-[6px] border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[12px] font-semibold cursor-pointer"
                            >
                              Excluir Edição
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                Ano
                              </label>
                              <input
                                type="text"
                                value={ed.year}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateConfig((p) => ({
                                    ...p,
                                    historico: {
                                      ...p.historico,
                                      editions: p.historico.editions.map((item) =>
                                        item.id === ed.id ? { ...item, year: val } : item
                                      ),
                                    },
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                Título da Edição
                              </label>
                              <input
                                type="text"
                                value={ed.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateConfig((p) => ({
                                    ...p,
                                    historico: {
                                      ...p.historico,
                                      editions: p.historico.editions.map((item) =>
                                        item.id === ed.id ? { ...item, title: val } : item
                                      ),
                                    },
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="sm:col-span-2">
                              <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                Subtítulo
                              </label>
                              <input
                                type="text"
                                value={ed.subtitle}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateConfig((p) => ({
                                    ...p,
                                    historico: {
                                      ...p.historico,
                                      editions: p.historico.editions.map((item) =>
                                        item.id === ed.id ? { ...item, subtitle: val } : item
                                      ),
                                    },
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                Nº Equipes
                              </label>
                              <input
                                type="number"
                                value={ed.teams}
                                onChange={(e) => {
                                  const val = Number(e.target.value) || 0;
                                  updateConfig((p) => ({
                                    ...p,
                                    historico: {
                                      ...p.historico,
                                      editions: p.historico.editions.map((item) =>
                                        item.id === ed.id ? { ...item, teams: val } : item
                                      ),
                                    },
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                Público Estimado
                              </label>
                              <input
                                type="text"
                                value={ed.publicCount}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateConfig((p) => ({
                                    ...p,
                                    historico: {
                                      ...p.historico,
                                      editions: p.historico.editions.map((item) =>
                                        item.id === ed.id ? { ...item, publicCount: val } : item
                                      ),
                                    },
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <input
                              type="text"
                              value={ed.championTeam}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateConfig((p) => ({
                                  ...p,
                                  historico: {
                                    ...p.historico,
                                    editions: p.historico.editions.map((item) =>
                                      item.id === ed.id ? { ...item, championTeam: val } : item
                                    ),
                                  },
                                }));
                              }}
                              placeholder="1º Lugar (Equipe)"
                              className="px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                            />
                            <input
                              type="text"
                              value={ed.championRobot}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateConfig((p) => ({
                                  ...p,
                                  historico: {
                                    ...p.historico,
                                    editions: p.historico.editions.map((item) =>
                                      item.id === ed.id ? { ...item, championRobot: val } : item
                                    ),
                                  },
                                }));
                              }}
                              placeholder="1º Lugar (Robô)"
                              className="px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                            />
                            <input
                              type="text"
                              value={ed.championInst}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateConfig((p) => ({
                                  ...p,
                                  historico: {
                                    ...p.historico,
                                    editions: p.historico.editions.map((item) =>
                                      item.id === ed.id ? { ...item, championInst: val } : item
                                    ),
                                  },
                                }));
                              }}
                              placeholder="1º Lugar (Unidade)"
                              className="px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <input
                              type="text"
                              value={ed.viceTeam}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateConfig((p) => ({
                                  ...p,
                                  historico: {
                                    ...p.historico,
                                    editions: p.historico.editions.map((item) =>
                                      item.id === ed.id ? { ...item, viceTeam: val } : item
                                    ),
                                  },
                                }));
                              }}
                              placeholder="2º Lugar (Equipe)"
                              className="px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                            />
                            <input
                              type="text"
                              value={ed.viceRobot}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateConfig((p) => ({
                                  ...p,
                                  historico: {
                                    ...p.historico,
                                    editions: p.historico.editions.map((item) =>
                                      item.id === ed.id ? { ...item, viceRobot: val } : item
                                    ),
                                  },
                                }));
                              }}
                              placeholder="2º Lugar (Robô)"
                              className="px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                            />
                            <input
                              type="text"
                              value={ed.viceInst}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateConfig((p) => ({
                                  ...p,
                                  historico: {
                                    ...p.historico,
                                    editions: p.historico.editions.map((item) =>
                                      item.id === ed.id ? { ...item, viceInst: val } : item
                                    ),
                                  },
                                }));
                              }}
                              placeholder="2º Lugar (Unidade)"
                              className="px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                              Destaque Técnico
                            </label>
                            <input
                              type="text"
                              value={ed.highlight}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateConfig((p) => ({
                                  ...p,
                                  historico: {
                                    ...p.historico,
                                    editions: p.historico.editions.map((item) =>
                                      item.id === ed.id ? { ...item, highlight: val } : item
                                    ),
                                  },
                                }));
                              }}
                              className="w-full px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "galeria" && (
                  <div className="bg-white rounded-[12px] border border-[#cbd5e1] p-6 space-y-5 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">
                      <div>
                        <h2 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                          Galeria Oficial de Fotos ({config.galeria.items.length})
                        </h2>
                        <p className="text-[12px] text-[#64748b]">
                          Adicione novas fotos, altere categorias ou substitua imagens da galeria.
                        </p>
                      </div>
                      <button
                        onClick={handleAddGalleryPhoto}
                        className="px-4 py-2 rounded-[8px] bg-[#00356a] hover:bg-[#00468a] text-white font-semibold text-[12px] cursor-pointer"
                      >
                        + Adicionar Foto
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                          Subtítulo Superior
                        </label>
                        <input
                          type="text"
                          value={config.galeria.eyebrow}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              galeria: { ...p.galeria, eyebrow: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                          Título Principal da Galeria
                        </label>
                        <input
                          type="text"
                          value={config.galeria.heading}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              galeria: { ...p.galeria, heading: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                        Descrição da Galeria
                      </label>
                      <textarea
                        rows={2}
                        value={config.galeria.description}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            galeria: { ...p.galeria, description: e.target.value },
                          }))
                        }
                        className="w-full p-3 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-[8px] bg-[#f8fafc] border border-[#e2e8f0]">
                      <span className="text-[13px] font-semibold text-[#0f172a]">
                        Exibir banner do Instagram abaixo da galeria
                      </span>
                      <input
                        type="checkbox"
                        checked={config.galeria.showInstagramBanner !== false}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            galeria: { ...p.galeria, showInstagramBanner: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 accent-[#00356a] cursor-pointer"
                      />
                    </div>

                    <div className="space-y-4">
                      {config.galeria.items.map((item, idx) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-[10px] bg-[#f8fafc] border border-[#cbd5e1] space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[13px] text-[#00356a]">
                              Foto #{idx + 1}
                            </span>
                            <button
                              onClick={() => handleRemoveGalleryPhoto(item.id)}
                              className="px-3 py-1 rounded-[6px] border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[12px] font-semibold cursor-pointer"
                            >
                              Remover Foto
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                Categoria (Filtro)
                              </label>
                              <input
                                type="text"
                                value={item.category}
                                onChange={(e) => {
                                  const val = e.target.value.toUpperCase();
                                  updateConfig((p) => ({
                                    ...p,
                                    galeria: {
                                      ...p.galeria,
                                      items: p.galeria.items.map((it) =>
                                        it.id === item.id ? { ...it, category: val } : it
                                      ),
                                    },
                                  }));
                                }}
                                placeholder="SUMÔ, PISTA, BANCADA..."
                                className="w-full px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                Título da Foto
                              </label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateConfig((p) => ({
                                    ...p,
                                    galeria: {
                                      ...p.galeria,
                                      items: p.galeria.items.map((it) =>
                                        it.id === item.id ? { ...it, title: val } : it
                                      ),
                                    },
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                              Legenda / Descrição
                            </label>
                            <input
                              type="text"
                              value={item.desc}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateConfig((p) => ({
                                  ...p,
                                  galeria: {
                                    ...p.galeria,
                                    items: p.galeria.items.map((it) =>
                                      it.id === item.id ? { ...it, desc: val } : it
                                    ),
                                  },
                                }));
                              }}
                              className="w-full px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              value={item.src}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateConfig((p) => ({
                                  ...p,
                                  galeria: {
                                    ...p.galeria,
                                    items: p.galeria.items.map((it) =>
                                      it.id === item.id ? { ...it, src: val } : it
                                    ),
                                  },
                                }));
                              }}
                              placeholder="URL da foto"
                              className="flex-1 px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                            />
                            <label className="px-3.5 py-1.5 rounded bg-[#00356a] hover:bg-[#00468a] text-white font-semibold text-[12px] cursor-pointer shrink-0">
                              Enviar Foto
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(e, (dataUrl) =>
                                    updateConfig((p) => ({
                                      ...p,
                                      galeria: {
                                        ...p.galeria,
                                        items: p.galeria.items.map((it) =>
                                          it.id === item.id ? { ...it, src: dataUrl } : it
                                        ),
                                      },
                                    }))
                                  )
                                }
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "knowledge" && (
                  <div className="bg-white rounded-[12px] border border-[#cbd5e1] p-6 space-y-5 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">
                      <div>
                        <h2 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                          Knowledge Hub — Manuais & Diretrizes ({config.knowledge.docs.length})
                        </h2>
                        <p className="text-[12px] text-[#64748b]">
                          Gerencie os manuais técnicos e arquivos PDF disponibilizados na página inicial.
                        </p>
                      </div>
                      <button
                        onClick={handleAddKnowledgeDoc}
                        className="px-4 py-2 rounded-[8px] bg-[#00356a] hover:bg-[#00468a] text-white font-semibold text-[12px] cursor-pointer"
                      >
                        + Adicionar Documento
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                          Subtítulo Superior
                        </label>
                        <input
                          type="text"
                          value={config.knowledge.eyebrow}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              knowledge: { ...p.knowledge, eyebrow: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                          Título Principal
                        </label>
                        <input
                          type="text"
                          value={config.knowledge.heading}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              knowledge: { ...p.knowledge, heading: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                        Descrição da Seção
                      </label>
                      <textarea
                        rows={2}
                        value={config.knowledge.description}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            knowledge: { ...p.knowledge, description: e.target.value },
                          }))
                        }
                        className="w-full p-3 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                      />
                    </div>

                    <div className="space-y-4">
                      {config.knowledge.docs.map((doc, idx) => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-[10px] bg-[#f8fafc] border border-[#cbd5e1] space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[13px] text-[#00356a]">
                              Documento #{idx + 1}
                            </span>
                            <button
                              onClick={() => handleRemoveKnowledgeDoc(doc.id)}
                              className="px-3 py-1 rounded-[6px] border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[12px] font-semibold cursor-pointer"
                            >
                              Remover
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                Título do Documento
                              </label>
                              <input
                                type="text"
                                value={doc.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateConfig((p) => ({
                                    ...p,
                                    knowledge: {
                                      ...p.knowledge,
                                      docs: p.knowledge.docs.map((d) =>
                                        d.id === doc.id ? { ...d, title: val } : d
                                      ),
                                    },
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                Nome do Arquivo PDF
                              </label>
                              <input
                                type="text"
                                value={doc.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateConfig((p) => ({
                                    ...p,
                                    knowledge: {
                                      ...p.knowledge,
                                      docs: p.knowledge.docs.map((d) =>
                                        d.id === doc.id ? { ...d, name: val } : d
                                      ),
                                    },
                                  }));
                                }}
                                className="w-full px-3 py-1.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                              Descrição do Manual
                            </label>
                            <textarea
                              rows={2}
                              value={doc.desc}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateConfig((p) => ({
                                  ...p,
                                  knowledge: {
                                    ...p.knowledge,
                                    docs: p.knowledge.docs.map((d) =>
                                      d.id === doc.id ? { ...d, desc: val } : d
                                    ),
                                  },
                                }));
                              }}
                              className="w-full p-2.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-[#64748b]">
                              {doc.dataUrl ? "PDF anexado pronto para visualização/download" : "Sem arquivo anexado (exibe ficha homologada)"}
                            </span>
                            <label className="px-3.5 py-1.5 rounded bg-[#00356a] hover:bg-[#00468a] text-white font-semibold text-[12px] cursor-pointer">
                              Anexar PDF do Computador
                              <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(e, (dataUrl, file) =>
                                    updateConfig((p) => ({
                                      ...p,
                                      knowledge: {
                                        ...p.knowledge,
                                        docs: p.knowledge.docs.map((d) =>
                                          d.id === doc.id
                                            ? { ...d, name: file.name, size: file.size, dataUrl }
                                            : d
                                        ),
                                      },
                                    }))
                                  )
                                }
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "sobre" && (
                  <div className="bg-white rounded-[12px] border border-[#cbd5e1] p-6 space-y-5 shadow-2xs">
                    <div className="border-b border-[#e2e8f0] pb-4">
                      <h2 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                        Sobre o Comitê de Engenharias & Instagram
                      </h2>
                      <p className="text-[12px] text-[#64748b]">
                        Edite os parágrafos institucionais, cursos participantes e card do Instagram oficial.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                          Subtítulo Superior
                        </label>
                        <input
                          type="text"
                          value={config.sobre.eyebrow}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              sobre: { ...p.sobre, eyebrow: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                          Título Principal
                        </label>
                        <input
                          type="text"
                          value={config.sobre.heading}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              sobre: { ...p.sobre, heading: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                        Parágrafo 1
                      </label>
                      <textarea
                        rows={3}
                        value={config.sobre.paragraph1}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            sobre: { ...p.sobre, paragraph1: e.target.value },
                          }))
                        }
                        className="w-full p-3 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                        Parágrafo 2
                      </label>
                      <textarea
                        rows={3}
                        value={config.sobre.paragraph2}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            sobre: { ...p.sobre, paragraph2: e.target.value },
                          }))
                        }
                        className="w-full p-3 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                        Parágrafo 3
                      </label>
                      <textarea
                        rows={3}
                        value={config.sobre.paragraph3}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            sobre: { ...p.sobre, paragraph3: e.target.value },
                          }))
                        }
                        className="w-full p-3 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                      />
                    </div>

                    {/* Courses List */}
                    <div className="space-y-3 pt-2 border-t border-[#e2e8f0]">
                      <label className="text-[12px] font-semibold text-[#334155] block">
                        Cursos de Engenharia Exibidos ({config.sobre.courses.length})
                      </label>
                      <div className="space-y-2">
                        {config.sobre.courses.map((course, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={course}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateConfig((p) => ({
                                  ...p,
                                  sobre: {
                                    ...p.sobre,
                                    courses: p.sobre.courses.map((c, i) => (i === idx ? val : c)),
                                  },
                                }));
                              }}
                              className="flex-1 px-3 py-1.5 rounded-[6px] border border-[#cbd5e1] text-[13px]"
                            />
                            <button
                              onClick={() =>
                                updateConfig((p) => ({
                                  ...p,
                                  sobre: {
                                    ...p.sobre,
                                    courses: p.sobre.courses.filter((_, i) => i !== idx),
                                  },
                                }))
                              }
                              className="px-3 py-1.5 rounded-[6px] border border-red-200 bg-red-50 text-red-700 text-[12px] font-semibold cursor-pointer"
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newCourseName}
                          onChange={(e) => setNewCourseName(e.target.value)}
                          placeholder="Novo curso (ex: Engenharia de Produção)"
                          className="flex-1 px-3 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                        <button
                          onClick={() => {
                            if (!newCourseName.trim()) return;
                            updateConfig((p) => ({
                              ...p,
                              sobre: {
                                ...p.sobre,
                                courses: [...p.sobre.courses, newCourseName.trim()],
                              },
                            }));
                            setNewCourseName("");
                          }}
                          className="px-4 py-2 rounded-[8px] bg-[#00356a] text-white text-[12px] font-semibold cursor-pointer"
                        >
                          + Adicionar Curso
                        </button>
                      </div>
                    </div>

                    {/* Instagram Info */}
                    <div className="p-4 rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0] space-y-3">
                      <span className="font-bold text-[12px] text-[#00356a] uppercase block">
                        Card do Instagram Oficial
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                            Arroba (@)
                          </label>
                          <input
                            type="text"
                            value={config.sobre.instagramHandle}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                sobre: { ...p.sobre, instagramHandle: e.target.value },
                              }))
                            }
                            className="w-full px-3 py-2 rounded border border-[#cbd5e1] bg-white text-[12px]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                            URL do Perfil
                          </label>
                          <input
                            type="text"
                            value={config.sobre.instagramUrl}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                sobre: { ...p.sobre, instagramUrl: e.target.value },
                              }))
                            }
                            className="w-full px-3 py-2 rounded border border-[#cbd5e1] bg-white text-[12px]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                          Descrição do Card do Instagram
                        </label>
                        <textarea
                          rows={2}
                          value={config.sobre.instagramDesc}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              sobre: { ...p.sobre, instagramDesc: e.target.value },
                            }))
                          }
                          className="w-full p-2.5 rounded border border-[#cbd5e1] bg-white text-[12px]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "news" && (
                  <div className="bg-white rounded-[12px] border border-[#cbd5e1] p-6 space-y-5 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">
                      <div>
                        <h2 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                          Seção de Destaques e Cards ({config.news.cards.length})
                        </h2>
                        <p className="text-[12px] text-[#64748b]">
                          Edite os títulos da seção, adicione novos cards ou remova todos os cards se preferir.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {config.news.cards.length > 0 && (
                          <button
                            onClick={() =>
                              updateConfig((p) => ({ ...p, news: { ...p.news, cards: [] } }))
                            }
                            className="px-3 py-2 rounded-[8px] border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-[12px] cursor-pointer"
                          >
                            Remover Todos os Cards
                          </button>
                        )}
                        <button
                          onClick={handleAddNewsCard}
                          className="px-4 py-2 rounded-[8px] bg-[#00356a] hover:bg-[#00468a] text-white font-semibold text-[12px] cursor-pointer"
                        >
                          + Novo Card
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                          Subtítulo Superior (Eyebrow)
                        </label>
                        <input
                          type="text"
                          value={config.news.eyebrow}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              news: { ...p.news, eyebrow: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                          Título Principal da Seção
                        </label>
                        <input
                          type="text"
                          value={config.news.heading}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              news: { ...p.news, heading: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {config.news.cards.map((card, idx) => (
                        <div
                          key={card.id}
                          className="p-5 rounded-[10px] bg-[#f8fafc] border border-[#cbd5e1] space-y-3.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[13px] text-[#00356a]">
                              Card #{idx + 1}
                            </span>
                            <button
                              onClick={() => handleRemoveNewsCard(card.id)}
                              className="px-3 py-1 rounded-[6px] border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[12px] font-semibold cursor-pointer"
                            >
                              Excluir Card
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                Categoria (Tag)
                              </label>
                              <input
                                type="text"
                                value={card.tag}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateConfig((p) => ({
                                    ...p,
                                    news: {
                                      ...p.news,
                                      cards: p.news.cards.map((c) =>
                                        c.id === card.id ? { ...c, tag: val } : c
                                      ),
                                    },
                                  }));
                                }}
                                className="w-full px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                Título do Card
                              </label>
                              <input
                                type="text"
                                value={card.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateConfig((p) => ({
                                    ...p,
                                    news: {
                                      ...p.news,
                                      cards: p.news.cards.map((c) =>
                                        c.id === card.id ? { ...c, title: val } : c
                                      ),
                                    },
                                  }));
                                }}
                                className="w-full px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                              Resumo no Card
                            </label>
                            <textarea
                              rows={2}
                              value={card.desc}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateConfig((p) => ({
                                  ...p,
                                  news: {
                                    ...p.news,
                                    cards: p.news.cards.map((c) =>
                                      c.id === card.id ? { ...c, desc: val } : c
                                    ),
                                  },
                                }));
                              }}
                              className="w-full p-2.5 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                              Texto Completo do Modal ("Ler Detalhes")
                            </label>
                            <textarea
                              rows={2}
                              value={card.modalBody || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateConfig((p) => ({
                                  ...p,
                                  news: {
                                    ...p.news,
                                    cards: p.news.cards.map((c) =>
                                      c.id === card.id ? { ...c, modalBody: val } : c
                                    ),
                                  },
                                }));
                              }}
                              className="w-full p-2.5 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              value={card.img}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateConfig((p) => ({
                                  ...p,
                                  news: {
                                    ...p.news,
                                    cards: p.news.cards.map((c) =>
                                      c.id === card.id ? { ...c, img: val } : c
                                    ),
                                  },
                                }));
                              }}
                              placeholder="URL da imagem do card"
                              className="flex-1 px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                            />
                            <label className="px-3.5 py-2 rounded-[6px] bg-[#00356a] hover:bg-[#00468a] text-white font-semibold text-[12px] cursor-pointer shrink-0">
                              Enviar Imagem
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(e, (dataUrl) =>
                                    updateConfig((p) => ({
                                      ...p,
                                      news: {
                                        ...p.news,
                                        cards: p.news.cards.map((c) =>
                                          c.id === card.id ? { ...c, img: dataUrl } : c
                                        ),
                                      },
                                    }))
                                  )
                                }
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "custom" && (
                  <div className="bg-white rounded-[12px] border border-[#cbd5e1] p-6 space-y-5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
                      <div>
                        <h2 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                          Seções Personalizadas ({config.customBlocks.length})
                        </h2>
                        <p className="text-[12px] text-[#64748b]">
                          Crie quantas seções extras desejar para cronogramas, regulamentos, patrocinadores ou avisos.
                        </p>
                      </div>
                      <button
                        onClick={handleAddCustomBlock}
                        className="px-4 py-2 rounded-[8px] bg-[#00356a] hover:bg-[#00468a] text-white font-semibold text-[12px] cursor-pointer"
                      >
                        + Nova Seção
                      </button>
                    </div>

                    {config.customBlocks.length === 0 ? (
                      <div className="p-10 rounded-[10px] border border-dashed border-[#cbd5e1] bg-[#f8fafc] text-center space-y-3">
                        <p className="font-semibold text-[14px] text-[#334155]">
                          Nenhuma seção personalizada cadastrada
                        </p>
                        <p className="text-[12px] text-[#64748b]">
                          Clique no botão abaixo para inserir um novo bloco de conteúdo na página pública.
                        </p>
                        <button
                          onClick={handleAddCustomBlock}
                          className="px-4 py-2 rounded-[8px] bg-[#00356a] text-white font-semibold text-[12px] cursor-pointer"
                        >
                          + Criar Primeira Seção
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {config.customBlocks.map((block, idx) => (
                          <div
                            key={block.id}
                            className="p-5 rounded-[10px] bg-[#f8fafc] border border-[#cbd5e1] space-y-3.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[13px] text-[#00356a]">
                                Seção Personalizada #{idx + 1}
                              </span>
                              <button
                                onClick={() => handleRemoveCustomBlock(block.id)}
                                className="px-3 py-1 rounded-[6px] border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[12px] font-semibold cursor-pointer"
                              >
                                Excluir Seção
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                  Subtítulo Superior (Opcional)
                                </label>
                                <input
                                  type="text"
                                  value={block.eyebrow}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateConfig((p) => ({
                                      ...p,
                                      customBlocks: p.customBlocks.map((b) =>
                                        b.id === block.id ? { ...b, eyebrow: val } : b
                                      ),
                                    }));
                                  }}
                                  className="w-full px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                  Tema de Fundo
                                </label>
                                <select
                                  value={block.bgStyle}
                                  onChange={(e) => {
                                    const val = e.target.value as CustomBlockItem["bgStyle"];
                                    updateConfig((p) => ({
                                      ...p,
                                      customBlocks: p.customBlocks.map((b) =>
                                        b.id === block.id ? { ...b, bgStyle: val } : b
                                      ),
                                    }));
                                  }}
                                  className="w-full px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                                >
                                  <option value="light">Fundo Branco</option>
                                  <option value="blue">Fundo Azul Suave</option>
                                  <option value="dark">Fundo Azul Escuro</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                Título da Seção
                              </label>
                              <input
                                type="text"
                                value={block.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateConfig((p) => ({
                                    ...p,
                                    customBlocks: p.customBlocks.map((b) =>
                                      b.id === block.id ? { ...b, title: val } : b
                                    ),
                                  }));
                                }}
                                className="w-full px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                Conteúdo / Texto
                              </label>
                              <textarea
                                rows={3}
                                value={block.content}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateConfig((p) => ({
                                    ...p,
                                    customBlocks: p.customBlocks.map((b) =>
                                      b.id === block.id ? { ...b, content: val } : b
                                    ),
                                  }));
                                }}
                                className="w-full p-2.5 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                  Texto do Botão (deixe vazio para ocultar)
                                </label>
                                <input
                                  type="text"
                                  value={block.buttonText || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateConfig((p) => ({
                                      ...p,
                                      customBlocks: p.customBlocks.map((b) =>
                                        b.id === block.id ? { ...b, buttonText: val } : b
                                      ),
                                    }));
                                  }}
                                  className="w-full px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-[#64748b] block mb-1">
                                  Link do Botão (URL)
                                </label>
                                <input
                                  type="text"
                                  value={block.buttonUrl || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateConfig((p) => ({
                                      ...p,
                                      customBlocks: p.customBlocks.map((b) =>
                                        b.id === block.id ? { ...b, buttonUrl: val } : b
                                      ),
                                    }));
                                  }}
                                  placeholder="https://... ou #secao"
                                  className="w-full px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                                />
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="text"
                                value={block.imageUrl || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateConfig((p) => ({
                                    ...p,
                                    customBlocks: p.customBlocks.map((b) =>
                                      b.id === block.id ? { ...b, imageUrl: val } : b
                                    ),
                                  }));
                                }}
                                placeholder="URL de imagem lateral (opcional)"
                                className="flex-1 px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                              />
                              {block.imageUrl && (
                                <button
                                  onClick={() =>
                                    updateConfig((p) => ({
                                      ...p,
                                      customBlocks: p.customBlocks.map((b) =>
                                        b.id === block.id ? { ...b, imageUrl: "" } : b
                                      ),
                                    }))
                                  }
                                  className="px-3 py-2 rounded-[6px] border border-red-200 bg-red-50 text-red-700 text-[12px] font-semibold cursor-pointer"
                                >
                                  Limpar Imagem
                                </button>
                              )}
                              <label className="px-3.5 py-2 rounded-[6px] bg-[#00356a] hover:bg-[#00468a] text-white font-semibold text-[12px] cursor-pointer shrink-0">
                                Enviar Imagem
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleFileUpload(e, (dataUrl) =>
                                      updateConfig((p) => ({
                                        ...p,
                                        customBlocks: p.customBlocks.map((b) =>
                                          b.id === block.id ? { ...b, imageUrl: dataUrl } : b
                                        ),
                                      }))
                                    )
                                  }
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "cta" && (
                  <div className="bg-white rounded-[12px] border border-[#cbd5e1] p-6 space-y-5 shadow-2xs">
                    <div className="border-b border-[#e2e8f0] pb-4">
                      <h2 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                        Chamada para Ação e Manuais
                      </h2>
                      <p className="text-[12px] text-[#64748b]">
                        Personalize os textos ou desative qualquer um dos cards se não quiser exibi-los.
                      </p>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                        Subtítulo Superior
                      </label>
                      <input
                        type="text"
                        value={config.cta.eyebrow}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            cta: { ...p.cta, eyebrow: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                          Título (Parte 1)
                        </label>
                        <input
                          type="text"
                          value={config.cta.headingPart1}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              cta: { ...p.cta, headingPart1: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                          Título em Destaque (Parte 2)
                        </label>
                        <input
                          type="text"
                          value={config.cta.headingHighlight}
                          onChange={(e) =>
                            updateConfig((p) => ({
                              ...p,
                              cta: { ...p.cta, headingHighlight: e.target.value },
                            }))
                          }
                          className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                        />
                      </div>
                    </div>

                    {/* Card 01 */}
                    <div className="p-4 rounded-[10px] bg-[#f8fafc] border border-[#cbd5e1] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[13px] text-[#00356a]">
                          Card 01 — Acesso ao Portal
                        </span>
                        <label className="flex items-center gap-2 text-[12px] font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.cta.showCard1 !== false}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                cta: { ...p.cta, showCard1: e.target.checked },
                              }))
                            }
                            className="w-4 h-4 accent-[#00356a]"
                          />
                          Exibir Card 01
                        </label>
                      </div>
                      {config.cta.showCard1 !== false && (
                        <>
                          <div className="grid grid-cols-3 gap-2.5">
                            <input
                              type="text"
                              value={config.cta.card1Number}
                              onChange={(e) =>
                                updateConfig((p) => ({
                                  ...p,
                                  cta: { ...p.cta, card1Number: e.target.value },
                                }))
                              }
                              className="px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                            />
                            <input
                              type="text"
                              value={config.cta.card1Title}
                              onChange={(e) =>
                                updateConfig((p) => ({
                                  ...p,
                                  cta: { ...p.cta, card1Title: e.target.value },
                                }))
                              }
                              className="col-span-2 px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={config.cta.card1Desc}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                cta: { ...p.cta, card1Desc: e.target.value },
                              }))
                            }
                            className="w-full p-2.5 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                          />
                          <input
                            type="text"
                            value={config.cta.card1Btn}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                cta: { ...p.cta, card1Btn: e.target.value },
                              }))
                            }
                            className="w-full px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                          />
                        </>
                      )}
                    </div>

                    {/* Card 02 */}
                    <div className="p-4 rounded-[10px] bg-[#f8fafc] border border-[#cbd5e1] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[13px] text-[#00356a]">
                          Card 02 — Manuais e Documentos
                        </span>
                        <label className="flex items-center gap-2 text-[12px] font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.cta.showCard2 !== false}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                cta: { ...p.cta, showCard2: e.target.checked },
                              }))
                            }
                            className="w-4 h-4 accent-[#00356a]"
                          />
                          Exibir Card 02
                        </label>
                      </div>
                      {config.cta.showCard2 !== false && (
                        <>
                          <div className="grid grid-cols-3 gap-2.5">
                            <input
                              type="text"
                              value={config.cta.card2Number}
                              onChange={(e) =>
                                updateConfig((p) => ({
                                  ...p,
                                  cta: { ...p.cta, card2Number: e.target.value },
                                }))
                              }
                              className="px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                            />
                            <input
                              type="text"
                              value={config.cta.card2Title}
                              onChange={(e) =>
                                updateConfig((p) => ({
                                  ...p,
                                  cta: { ...p.cta, card2Title: e.target.value },
                                }))
                              }
                              className="col-span-2 px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={config.cta.card2Desc}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                cta: { ...p.cta, card2Desc: e.target.value },
                              }))
                            }
                            className="w-full p-2.5 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                          />
                          <input
                            type="text"
                            value={config.cta.card2Btn}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                cta: { ...p.cta, card2Btn: e.target.value },
                              }))
                            }
                            className="w-full px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "footer" && (
                  <div className="bg-white rounded-[12px] border border-[#cbd5e1] p-6 space-y-5 shadow-2xs">
                    <div className="border-b border-[#e2e8f0] pb-4">
                      <h2 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                        Rodapé Institucional
                      </h2>
                      <p className="text-[12px] text-[#64748b]">
                        Edite a marca, descrição, copyright e colunas do rodapé.
                      </p>
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                        Título da Marca no Rodapé
                      </label>
                      <input
                        type="text"
                        value={config.footer.brandName}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            footer: { ...p.footer, brandName: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                        Descrição Institucional
                      </label>
                      <textarea
                        rows={2}
                        value={config.footer.tagline}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            footer: { ...p.footer, tagline: e.target.value },
                          }))
                        }
                        className="w-full p-3 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                      />
                    </div>

                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">
                        Texto de Direitos Autorais (Copyright)
                      </label>
                      <input
                        type="text"
                        value={config.footer.copyright}
                        onChange={(e) =>
                          updateConfig((p) => ({
                            ...p,
                            footer: { ...p.footer, copyright: e.target.value },
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-[8px] border border-[#cbd5e1] text-[13px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#e2e8f0]">
                      {(
                        [
                          { titleKey: "col1Title", itemsKey: "col1Items", label: "Coluna 1" },
                          { titleKey: "col2Title", itemsKey: "col2Items", label: "Coluna 2" },
                          { titleKey: "col3Title", itemsKey: "col3Items", label: "Coluna 3" },
                        ] as const
                      ).map((col) => (
                        <div
                          key={col.titleKey}
                          className="p-3.5 rounded-[8px] bg-[#f8fafc] border border-[#e2e8f0] space-y-2.5"
                        >
                          <label className="text-[11px] font-bold uppercase text-[#475569] block">
                            {col.label}
                          </label>
                          <input
                            type="text"
                            value={config.footer[col.titleKey]}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                footer: { ...p.footer, [col.titleKey]: e.target.value },
                              }))
                            }
                            placeholder="Título da coluna"
                            className="w-full px-2.5 py-1.5 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px] font-semibold"
                          />
                          <textarea
                            rows={4}
                            value={(config.footer[col.itemsKey] as string[]).join("\n")}
                            onChange={(e) =>
                              updateConfig((p) => ({
                                ...p,
                                footer: {
                                  ...p.footer,
                                  [col.itemsKey]: e.target.value
                                    .split("\n")
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                },
                              }))
                            }
                            placeholder="Um item por linha"
                            className="w-full p-2 rounded-[6px] border border-[#cbd5e1] bg-white text-[12px]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "theme" && (
                  <div className="bg-white rounded-[12px] border border-[#cbd5e1] p-6 space-y-5 shadow-2xs">
                    <div className="border-b border-[#e2e8f0] pb-4">
                      <h2 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#051d30]">
                        Identidade Visual e Cores da Página
                      </h2>
                      <p className="text-[12px] text-[#64748b]">
                        Ajuste as cores principais aplicadas aos botões, títulos e destaques.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {(
                        [
                          { key: "primaryColor", label: "Cor Primária Institucional" },
                          { key: "accentColor", label: "Cor de Destaque (Neon/Ação)" },
                          { key: "secondaryColor", label: "Cor Secundária (Tags/Selos)" },
                        ] as const
                      ).map((item) => (
                        <div
                          key={item.key}
                          className="p-4 rounded-[10px] bg-[#f8fafc] border border-[#cbd5e1] space-y-3"
                        >
                          <label className="text-[12px] font-semibold text-[#334155] block">
                            {item.label}
                          </label>
                          <div className="flex items-center gap-2.5">
                            <input
                              type="color"
                              value={config.theme[item.key]}
                              onChange={(e) =>
                                updateConfig((p) => ({
                                  ...p,
                                  theme: { ...p.theme, [item.key]: e.target.value },
                                }))
                              }
                              className="w-10 h-10 rounded cursor-pointer border border-[#cbd5e1]"
                            />
                            <input
                              type="text"
                              value={config.theme[item.key]}
                              onChange={(e) =>
                                updateConfig((p) => ({
                                  ...p,
                                  theme: { ...p.theme, [item.key]: e.target.value },
                                }))
                              }
                              className="w-full px-3 py-2 rounded-[6px] border border-[#cbd5e1] bg-white font-mono text-[12px]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ─── SPLIT LIVE PREVIEW COLUMN ──────────────────────────────── */}
              {workspaceView === "split" && (
                <div className="xl:col-span-7 sticky top-24">
                  {renderLivePreview()}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Clean Status Notification Bar (No Emojis) */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#051d30] text-white px-5 py-3.5 rounded-[8px] shadow-xl border-l-4 border-[#00f2ff] text-[13px] font-medium">
          {statusMessage}
        </div>
      )}
    </div>
  );
}
