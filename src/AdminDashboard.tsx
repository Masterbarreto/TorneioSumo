import { useState } from "react";
import DashboardDoTecnico from "@/imports/DashboardDoTecnico-1/index";
import AdminSidebar from "./AdminSidebar";
import ArenasPage from "./ArenasPage";
import CertificatesPage from "./CertificatesPage";
import TeamsPage from "./TeamsPage";
import PartidasPage from "./PartidasPage";
import AvaliacaoTorneio from "./AvaliacaoTorneio";

type AdminPage = "home" | "arenas" | "certificados" | "times" | "partidas" | "rules";

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<AdminPage>("home");
  const [championshipStarted, setChampionshipStarted] = useState(false);

  const navigate = (key: string) => {
    if (key === "logout") onLogout();
    else setPage(key as AdminPage);
  };

  if (page === "arenas") {
    return <ArenasPage onNavigate={navigate} onLogout={onLogout} />;
  }

  if (page === "certificados") {
    return <CertificatesPage onNavigate={navigate} onLogout={onLogout} />;
  }

  if (page === "times") {
    return <TeamsPage onNavigate={navigate} onLogout={onLogout} />;
  }

  if (page === "partidas") {
    return (
      <PartidasPage
        onNavigate={navigate}
        onLogout={onLogout}
        championshipStarted={championshipStarted}
        onStartChampionship={() => setChampionshipStarted(true)}
      />
    );
  }

  if (page === "rules") {
    return <AvaliacaoTorneio />;
  }

  return (
    <div
      className="fixed inset-0 z-[800] overflow-auto bg-[#f7f9ff]"
      style={{ animation: "dashIn 0.35s cubic-bezier(0.22,1,0.36,1) both" }}
    >
      <style>{`@keyframes dashIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div className="min-w-[1280px]">
        <DashboardDoTecnico />
      </div>

      {/* Shared sidebar sits on top of the imported one */}
      <AdminSidebar active="home" onNavigate={navigate} onLogout={onLogout} />

      {/* Championship status badge / start button — fixed top-right above sidebar */}
      <div className="fixed z-[860]" style={{ top: 14, right: 16 }}>
        {championshipStarted ? (
          <div className="flex items-center gap-2 rounded-full px-4 py-2 shadow-lg" style={{ background: "#d1fae5", border: "1px solid #6ee7b7" }}>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[12px] font-bold text-green-700 uppercase tracking-[0.5px]">Campeonato Ativo</span>
          </div>
        ) : (
          <button onClick={() => setChampionshipStarted(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg font-bold text-[12px] text-black hover:opacity-90 transition-opacity"
            style={{ background: "#f59e0b" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Iniciar Campeonato
          </button>
        )}
      </div>
    </div>
  );
}
