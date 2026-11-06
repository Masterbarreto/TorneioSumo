import AvaliacaoTorneio from "./AvaliacaoTorneio";

export default function PartidasPage({
  onNavigate,
  onLogout,
}: {
  onNavigate: (key: string) => void;
  onLogout: () => void;
  championshipStarted?: boolean;
  onStartChampionship?: () => void;
}) {
  return <AvaliacaoTorneio onNavigate={onNavigate} onLogout={onLogout} activeMenu="partidas" />;
}

