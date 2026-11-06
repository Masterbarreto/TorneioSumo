export type SectionKey =
  | "navbar"
  | "hero"
  | "torneios"
  | "historico"
  | "galeria"
  | "knowledge"
  | "sobre"
  | "news"
  | "customBlocks"
  | "cta"
  | "footer";

export interface SectionOrderItem {
  id: SectionKey;
  label: string;
  visible: boolean;
}

export interface NavLinkItem {
  label: string;
  href: string;
}

export interface HistoryEditionItem {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  teams: number;
  matches: number;
  publicCount: string;
  championTeam: string;
  championRobot: string;
  championInst: string;
  viceTeam: string;
  viceRobot: string;
  viceInst: string;
  highlight: string;
}

export interface GalleryPhotoItem {
  id: string;
  category: string;
  title: string;
  desc: string;
  src: string;
}

export interface KnowledgeDocItem {
  id: string;
  name: string;
  size: number;
  title: string;
  desc: string;
  dataUrl?: string;
}

export interface NewsCardItem {
  id: string;
  img: string;
  tag: string;
  title: string;
  desc: string;
  modalBody?: string;
}

export interface CustomBlockItem {
  id: string;
  layout?: "split" | "centered" | "banner";
  eyebrow: string;
  title: string;
  content: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  bgStyle: "light" | "dark" | "blue";
}

export interface SiteConfig {
  id?: string;
  slug?: string;
  updatedAt?: string;
  sectionsOrder: SectionOrderItem[];
  theme: {
    primaryColor: string;
    accentColor: string;
    secondaryColor: string;
  };
  navbar: {
    showTopBar?: boolean;
    topBarTitle?: string;
    topBarBadge: string;
    brandTitle: string;
    navLinks: string[];
    navItems?: NavLinkItem[];
    showPortalButton?: boolean;
    portalButtonText: string;
  };
  hero: {
    showStatusBadge?: boolean;
    statusBadge: string;
    titleLine1: string;
    titleHighlight: string;
    description: string;
    showCtaButton?: boolean;
    ctaButtonText: string;
    showSecondaryButton?: boolean;
    secondaryButtonText?: string;
    showDateInfo?: boolean;
    dateLabel: string;
    dateValue: string;
    heroImageUrl: string;
    countdownLabel: string;
    countdownTitle: string;
    countdownTargetDate: string;
    showCountdown: boolean;
  };
  torneios: {
    eyebrow: string;
    heading: string;
    description: string;
  };
  historico: {
    eyebrow: string;
    heading: string;
    description: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
    stat4Value: string;
    stat4Label: string;
    editions: HistoryEditionItem[];
  };
  galeria: {
    eyebrow: string;
    heading: string;
    description: string;
    showInstagramBanner: boolean;
    items: GalleryPhotoItem[];
  };
  knowledge: {
    eyebrow: string;
    heading: string;
    description: string;
    docs: KnowledgeDocItem[];
  };
  sobre: {
    eyebrow: string;
    heading: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    courses: string[];
    instagramHandle: string;
    instagramUrl: string;
    instagramDesc: string;
  };
  news: {
    eyebrow: string;
    heading: string;
    cards: NewsCardItem[];
  };
  customBlocks: CustomBlockItem[];
  cta: {
    eyebrow: string;
    headingPart1: string;
    headingHighlight: string;
    showCard1?: boolean;
    card1Number: string;
    card1Title: string;
    card1Desc: string;
    card1Btn: string;
    showCard2?: boolean;
    card2Number: string;
    card2Title: string;
    card2Desc: string;
    card2Btn: string;
    card2DownloadUrl: string;
  };
  footer: {
    brandName: string;
    tagline: string;
    copyright: string;
    col1Title: string;
    col1Items: string[];
    col2Title: string;
    col2Items: string[];
    col3Title: string;
    col3Items: string[];
  };
}

export const ALL_AVAILABLE_SECTIONS: SectionOrderItem[] = [
  { id: "navbar", label: "Barra de Navegação Superior", visible: true },
  { id: "hero", label: "Banner Principal (Hero)", visible: true },
  { id: "torneios", label: "Torneios Ativos & Arenas", visible: true },
  { id: "historico", label: "Histórico de Torneios & Pódios", visible: true },
  { id: "galeria", label: "Galeria Oficial de Fotos", visible: true },
  { id: "knowledge", label: "Knowledge Hub (Manuais & Regras)", visible: true },
  { id: "sobre", label: "Sobre o Comitê & Instagram", visible: true },
  { id: "news", label: "Destaques & Ação em Tempo Real", visible: true },
  { id: "customBlocks", label: "Seções Personalizadas", visible: true },
  { id: "cta", label: "Chamada para Ação & Inscrições", visible: true },
  { id: "footer", label: "Rodapé Institucional", visible: true },
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  slug: "landing-page-main",
  sectionsOrder: [...ALL_AVAILABLE_SECTIONS],
  theme: {
    primaryColor: "#00356a",
    accentColor: "#00f2ff",
    secondaryColor: "#8c4f00",
  },
  navbar: {
    showTopBar: true,
    topBarTitle: "TORNEIO DE ROBÓTICA & ENGENHARIAS SENAC 2026",
    topBarBadge: "INSCRIÇÕES ABERTAS",
    brandTitle: "ENGENHARIAS SENAC",
    navLinks: ["TORNEIOS", "HISTÓRICO", "GALERIA", "SOBRE"],
    navItems: [
      { label: "TORNEIOS", href: "#torneios" },
      { label: "HISTÓRICO", href: "#historico" },
      { label: "GALERIA", href: "#galeria" },
      { label: "SOBRE", href: "#sobre" },
    ],
    showPortalButton: true,
    portalButtonText: "ENTRAR NO PORTAL",
  },
  hero: {
    showStatusBadge: true,
    statusBadge: "STATUS: INSCRIÇÕES ABERTAS • EDIÇÃO 2026",
    titleLine1: "Torneio de ",
    titleHighlight: "Robótica & Sumô",
    description:
      "Participe do campeonato oficial de robótica do Centro Universitário SENAC. Projete robôs autônomos de alta precisão, dispute em arenas oficiais e enfrente equipes de todo o país.",
    showCtaButton: true,
    ctaButtonText: "INSCREVER EQUIPE",
    showSecondaryButton: true,
    secondaryButtonText: "Ver Torneios Ativos",
    showDateInfo: true,
    dateLabel: "Grande Final",
    dateValue: "26 de Novembro de 2026",
    heroImageUrl:
      "https://images.unsplash.com/photo-1742767069929-0c663150b164?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    countdownLabel: "CONTAGEM REGRESSIVA OFICIAL",
    countdownTitle: "Torneio SENAC Robotics 2026",
    countdownTargetDate: "2026-11-26T09:00:00",
    showCountdown: true,
  },
  torneios: {
    eyebrow: "ARENAS & MODALIDADES HOMOLOGADAS",
    heading: "TORNEIOS ATIVOS",
    description:
      "Consulte as especificações oficiais das arenas do Centro Universitário SENAC e acesse as regras e diretrizes técnicas em PDF homologadas no sistema.",
  },
  historico: {
    eyebrow: "MEMÓRIA & HALL DA FAMA",
    heading: "HISTÓRICO DE TORNEIOS",
    description:
      "Conheça as edições históricas realizadas pelo Comitê de Engenharias do Centro Universitário SENAC, recordes conquistados e os campeões que marcaram a competição.",
    stat1Value: "8",
    stat1Label: "Edições Realizadas",
    stat2Value: "84+",
    stat2Label: "Equipes Formadas",
    stat3Value: "304",
    stat3Label: "Combates Disputados",
    stat4Value: "100%",
    stat4Label: "Projetos Autônomos",
    editions: [
      {
        id: "ed-2025",
        year: "2025",
        title: "8º Torneio de Robótica SENAC",
        subtitle: "Edição Nacional Santo Amaro",
        teams: 32,
        matches: 128,
        publicCount: "1.400+",
        championTeam: "Titan Alpha",
        championRobot: "Titan V3",
        championInst: "SENAC Santo Amaro",
        viceTeam: "CyberKnights",
        viceRobot: "KnightBlade",
        viceInst: "SENAC Tech",
        highlight: "Novo recorde nacional de tempo na pista com sensores ópticos de alta amostragem.",
      },
      {
        id: "ed-2024",
        year: "2024",
        title: "7º Torneio de Engenharia SENAC",
        subtitle: "Desafio de Automação & Combate",
        teams: 28,
        matches: 96,
        publicCount: "1.100+",
        championTeam: "RoboTigers",
        championRobot: "Claw-9",
        championInst: "SENAC Tech",
        viceTeam: "Quantum Drift",
        viceRobot: "DriftCore",
        viceInst: "SENAC MG",
        highlight: "Primeira edição com transmissão em tempo real e telemetria aberta para o público.",
      },
      {
        id: "ed-2023",
        year: "2023",
        title: "6º Torneio de Inverno SENAC",
        subtitle: "Competição Regional Universitária",
        teams: 24,
        matches: 80,
        publicCount: "950+",
        championTeam: "Valkyrie Bot",
        championRobot: "Valkyrie-X",
        championInst: "SENAC Lapa",
        viceTeam: "Delta Force",
        viceRobot: "DeltaOne",
        viceInst: "SENAC Tech",
        highlight: "Introdução da modalidade de robótica artística e desafios autônomos na grade.",
      },
    ],
  },
  galeria: {
    eyebrow: "REGISTROS & EMOÇÃO",
    heading: "GALERIA OFICIAL",
    description:
      "Confira os melhores momentos das competições: duelos acirrados no dohyo, concentração máxima na bancada de testes e a celebração das equipes de engenharia.",
    showInstagramBanner: true,
    items: [
      {
        id: "gal-1",
        category: "SUMÔ",
        title: "Combate de Robôs no Dohyo Oficial",
        desc: "Dois protótipos autônomos de 3kg em colisão frontal com medição de força e sensores de borda.",
        src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: "gal-2",
        category: "BANCADA",
        title: "Calibração de Sensores & Eletrônica",
        desc: "Ajuste milimétrico de sensores infravermelhos e microcontroladores na bancada de testes antes da partida.",
        src: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: "gal-3",
        category: "PISTA",
        title: "Curva em Alta Velocidade (Segue Linha)",
        desc: "Veículo autônomo tracionando na pista de alta velocidade com leitura de linha de alta frequência.",
        src: "https://images.unsplash.com/photo-1581092333322-31d2fd38a35e?auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: "gal-4",
        category: "BANCADA",
        title: "Desenvolvimento de Firmware & Algoritmos",
        desc: "Equipes ajustando parâmetros de controle PID e telemetria sem fio em ambiente de simulação.",
        src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: "gal-5",
        category: "PÓDIO",
        title: "Cerimônia de Premiação & Pódio",
        desc: "Celebração das equipes vencedoras com entrega de troféus e medalhas de honra ao mérito acadêmico.",
        src: "https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=1000&q=80",
      },
      {
        id: "gal-6",
        category: "COMITÊ",
        title: "Comitê de Engenharias & Avaliadores",
        desc: "Docentes e jurados técnicos conferindo os padrões de peso, dimensões e segurança dos robôs.",
        src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80",
      },
    ],
  },
  knowledge: {
    eyebrow: "MANUAIS TÉCNICOS & DIRETRIZES",
    heading: "KNOWLEDGE HUB",
    description:
      "Acesse toda a documentação oficial necessária para homologar o robô da sua equipe, entender as regras de combate e garantir conformidade com as normas técnicas.",
    docs: [
      {
        id: "doc-1",
        name: "Regulamento_Geral_Robótica_SENAC_2026.pdf",
        size: 2400000,
        title: "Regulamento Geral de Competição 2026",
        desc: "Normas completas de pontuação, conduta desportiva, composição de equipes e critérios de desempate.",
      },
      {
        id: "doc-2",
        name: "Manual_Inspecao_Tecnica_Sumo_3kg.pdf",
        size: 1850000,
        title: "Manual de Inspeção Técnica de Sumô",
        desc: "Gabarito dimensional (20x20cm), pesagem limite de 3.000g, tolerâncias e procedimentos de partida remota.",
      },
      {
        id: "doc-3",
        name: "Diretrizes_Seguranca_Baterias_LiPo.pdf",
        size: 1200000,
        title: "Diretrizes de Segurança Elétrica & LiPo",
        desc: "Requisitos de armazenamento, fusíveis de proteção, sacos antifogo e descarte seguro nos laboratórios.",
      },
      {
        id: "doc-4",
        name: "Guia_Programacao_Sensores_PID.pdf",
        size: 3100000,
        title: "Guia de Calibração & Algoritmos PID",
        desc: "Material didático com exemplos de controle em C++ para microcontroladores ESP32 e arquitetura RTOS.",
      },
    ],
  },
  sobre: {
    eyebrow: "CENTRO UNIVERSITÁRIO SENAC",
    heading: "COMITÊ DE ENGENHARIAS",
    paragraph1:
      "O Comitê de Engenharias do Centro Universitário SENAC integra os cursos de Engenharia de Computação, Engenharia Mecatrônica, Engenharia Elétrica e Engenharia de Software em iniciativas multidisciplinares de alta intensidade prática.",
    paragraph2:
      "O Torneio de Robótica SENAC é a maior vitrine de aplicação prática do conhecimento acadêmico, desafiando estudantes a projetarem hardware proprietário, controladores eletrônicos, sensoriamento avançado e código de controle autônomo sem intervenção humana.",
    paragraph3:
      "Com laboratórios modernos equipados com corte a laser, usinagem CNC, impressão 3D e estações de solda de precisão, oferecemos toda a infraestrutura necessária para transformar ideias em robôs campeões.",
    courses: [
      "Engenharia de Computação",
      "Engenharia Mecatrônica",
      "Engenharia Elétrica",
      "Engenharia de Software",
    ],
    instagramHandle: "@engenhariasenac",
    instagramUrl: "https://www.instagram.com/engenhariasenac/",
    instagramDesc:
      "Siga nosso perfil no Instagram para acompanhar avisos de chamadas para equipes, datas de calibração livre nas arenas, tutoriais técnicos dos professores e cobertura completa com lives dos combates decisivos!",
  },
  news: {
    eyebrow: "DESTAQUES & NOVIDADES",
    heading: "AÇÃO EM TEMPO REAL",
    cards: [
      {
        id: "card-1",
        img: "https://images.unsplash.com/photo-1581092333322-31d2fd38a35e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
        tag: "ENGENHARIA",
        title: "LIDERANÇA JOVEM NA\nROBÓTICA",
        desc: "Competidores aplicam conceitos avançados de eletrônica, inteligência computacional e controle.",
        modalBody:
          "Os estudantes do Centro Universitário SENAC desenvolvem protótipos de alta performance com microcontroladores ESP32 e STM32, implementando algoritmos de controle PID e telemetria em tempo real para os combates de robôs autônomos.",
      },
      {
        id: "card-2",
        img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
        tag: "COMPETIÇÃO",
        title: "ESPÍRITO DE EQUIPE &\nESTRATÉGIA",
        desc: "Colaboração multidisciplinar e resolução de problemas técnicos sob pressão nas finais regionais.",
        modalBody:
          "O campeonato de robótica reúne alunos de Engenharia de Computação, Mecatrônica, Elétrica e Software em um ambiente prático e colaborativo, simulando desafios reais da indústria.",
      },
      {
        id: "card-3",
        img: "https://images.unsplash.com/photo-1678225867994-e7a5b071ebfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
        tag: "INOVAÇÃO",
        title: "SENSORES DE ALTA\nPRECISÃO",
        desc: "Nova geração de sensores de reflexão e visão infravermelha elevam o nível técnico das arenas.",
        modalBody:
          "Sensores de distância a laser ToF (Time-of-Flight) e matrizes ópticas de alta taxa de atualização permitem que os robôs localizem adversários e identifiquem a linha do dohyo em milissegundos.",
      },
    ],
  },
  customBlocks: [],
  cta: {
    eyebrow: "PRONTO PARA O DESAFIO?",
    headingPart1: "SUA JORNADA TÉCNICA ",
    headingHighlight: "COMEÇA AQUI.",
    showCard1: true,
    card1Number: "01.",
    card1Title: "PORTAL DO COMPETIDOR",
    card1Desc:
      "Gerencie sua equipe, cadastre os integrantes, envie documentação técnica e acompanhe rankings nacionais em tempo real através do dashboard oficial.",
    card1Btn: "ENTRAR NO PORTAL",
    showCard2: true,
    card2Number: "02.",
    card2Title: "MANUAIS & REGULAMENTOS",
    card2Desc:
      "Baixe as regras oficiais de 2026 e os padrões de certificação exigidos para participação em cada uma das modalidades homologadas.",
    card2Btn: "BAIXAR REGULAMENTO",
    card2DownloadUrl: "",
  },
  footer: {
    brandName: "ENGENHARIAS SENAC",
    tagline:
      "Centro Universitário SENAC • Comitê de Engenharias.\nInovação, robótica avançada e formação técnica de excelência.",
    copyright: "© 2026 ENGENHARIAS SENAC. Todos os direitos reservados.",
    col1Title: "NAVEGAÇÃO",
    col1Items: ["Torneios Ativos", "Histórico de Torneios", "Galeria de Fotos", "Knowledge Hub"],
    col2Title: "INSTITUCIONAL",
    col2Items: ["Sobre o Comitê", "Centro Universitário SENAC", "Portal do Aluno"],
    col3Title: "REGULAMENTO",
    col3Items: [
      "Regras Sumô 3kg",
      "Seguidor de Linha",
      "Segurança de Baterias",
      "Termos de Participação",
    ],
  },
};

const VALID_SECTION_IDS = new Set<SectionKey>([
  "navbar",
  "hero",
  "torneios",
  "historico",
  "galeria",
  "knowledge",
  "sobre",
  "news",
  "customBlocks",
  "cta",
  "footer",
]);

export function mergeSiteConfig(partial?: Partial<SiteConfig> | null): SiteConfig {
  if (!partial) return DEFAULT_SITE_CONFIG;

  let sectionsOrder: SectionOrderItem[];
  if (Array.isArray(partial.sectionsOrder)) {
    sectionsOrder = partial.sectionsOrder.filter((s) => VALID_SECTION_IDS.has(s.id as SectionKey));
  } else {
    sectionsOrder = [...DEFAULT_SITE_CONFIG.sectionsOrder];
  }

  return {
    ...DEFAULT_SITE_CONFIG,
    ...partial,
    sectionsOrder,
    theme: { ...DEFAULT_SITE_CONFIG.theme, ...(partial.theme || {}) },
    navbar: {
      ...DEFAULT_SITE_CONFIG.navbar,
      ...(partial.navbar || {}),
      navLinks: Array.isArray(partial.navbar?.navLinks)
        ? partial.navbar!.navLinks
        : DEFAULT_SITE_CONFIG.navbar.navLinks,
    },
    hero: { ...DEFAULT_SITE_CONFIG.hero, ...(partial.hero || {}) },
    torneios: { ...DEFAULT_SITE_CONFIG.torneios, ...(partial.torneios || {}) },
    historico: {
      ...DEFAULT_SITE_CONFIG.historico,
      ...(partial.historico || {}),
      editions: Array.isArray(partial.historico?.editions)
        ? partial.historico!.editions
        : DEFAULT_SITE_CONFIG.historico.editions,
    },
    galeria: {
      ...DEFAULT_SITE_CONFIG.galeria,
      ...(partial.galeria || {}),
      items: Array.isArray(partial.galeria?.items)
        ? partial.galeria!.items
        : DEFAULT_SITE_CONFIG.galeria.items,
    },
    knowledge: {
      ...DEFAULT_SITE_CONFIG.knowledge,
      ...(partial.knowledge || {}),
      docs: Array.isArray(partial.knowledge?.docs)
        ? partial.knowledge!.docs
        : DEFAULT_SITE_CONFIG.knowledge.docs,
    },
    sobre: {
      ...DEFAULT_SITE_CONFIG.sobre,
      ...(partial.sobre || {}),
      courses: Array.isArray(partial.sobre?.courses)
        ? partial.sobre!.courses
        : DEFAULT_SITE_CONFIG.sobre.courses,
    },
    news: {
      ...DEFAULT_SITE_CONFIG.news,
      ...(partial.news || {}),
      cards: Array.isArray(partial.news?.cards)
        ? partial.news!.cards
        : DEFAULT_SITE_CONFIG.news.cards,
    },
    customBlocks: Array.isArray(partial.customBlocks) ? partial.customBlocks : [],
    cta: { ...DEFAULT_SITE_CONFIG.cta, ...(partial.cta || {}) },
    footer: {
      ...DEFAULT_SITE_CONFIG.footer,
      ...(partial.footer || {}),
      col1Items: Array.isArray(partial.footer?.col1Items)
        ? partial.footer!.col1Items
        : DEFAULT_SITE_CONFIG.footer.col1Items,
      col2Items: Array.isArray(partial.footer?.col2Items)
        ? partial.footer!.col2Items
        : DEFAULT_SITE_CONFIG.footer.col2Items,
      col3Items: Array.isArray(partial.footer?.col3Items)
        ? partial.footer!.col3Items
        : DEFAULT_SITE_CONFIG.footer.col3Items,
    },
  };
}
