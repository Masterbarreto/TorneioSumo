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
  const [page, setPage] = useState<AdminPage>(() => {
    const p = window.location.pathname.replace("/", "").toLowerCase();
    if (p === "avaliar") return "rules";
    const validPages: AdminPage[] = ["home", "arenas", "certificados", "times", "partidas", "rules"];
    return validPages.includes(p as AdminPage) ? (p as AdminPage) : "home";
  });
  const [championshipStarted, setChampionshipStarted] = useState(false);

  const navigate = (key: string) => {
    if (key === "logout") {
      onLogout();
    } else {
      setPage(key as AdminPage);
      window.history.pushState(null, "", "/" + key);
    }
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
    return <AvaliacaoTorneio onNavigate={navigate} onLogout={onLogout} />;
  }

  return (
    <div
      className="relative w-full min-h-screen bg-[#f7f9ff]"
      style={{ animation: "dashIn 0.35s cubic-bezier(0.22,1,0.36,1) both" }}
    >
      <style>{`@keyframes dashIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div className="w-full">
        <DashboardDoTecnico
          onLogout={onLogout}
          onNavigate={navigate}
          championshipStarted={championshipStarted}
          onToggleChampionship={() => setChampionshipStarted(!championshipStarted)}
        />
      </div>

      {/* Shared sidebar sits on top of the imported one */}
      <AdminSidebar active="home" onNavigate={navigate} onLogout={onLogout} />
    </div>
  );
}
