import { useState, useEffect } from "react";
import DashboardDoTecnico from "@/imports/DashboardDoTecnico-1/index";
import AdminSidebar from "./AdminSidebar";
import ArenasPage from "./ArenasPage";
import CertificatesPage from "./CertificatesPage";
import TeamsPage from "./TeamsPage";
import PartidasPage from "./PartidasPage";
import AvaliacaoTorneio from "./AvaliacaoTorneio";
import DocumentsPage from "./DocumentsPage";
import SiteCmsPage from "./SiteCmsPage";

type AdminPage =
  | "home"
  | "arenas"
  | "certificados"
  | "times"
  | "partidas"
  | "rules"
  | "documents"
  | "site";

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const resolvePageFromLocation = (): AdminPage => {
    const rawPath = window.location.pathname.replace(/^\/+/, "").toLowerCase();
    const firstSegment = rawPath.split("/")[0] || "home";
    if (firstSegment === "avaliar") return "rules";
    if (firstSegment === "documentos") return "documents";
    if (firstSegment === "cms" || firstSegment === "pagina-publica") return "site";
    const validPages: AdminPage[] = [
      "home",
      "arenas",
      "certificados",
      "times",
      "partidas",
      "rules",
      "documents",
      "site",
    ];
    return validPages.includes(firstSegment as AdminPage) ? (firstSegment as AdminPage) : "home";
  };

  const [page, setPage] = useState<AdminPage>(resolvePageFromLocation);
  const [championshipStarted, setChampionshipStarted] = useState(false);

  useEffect(() => {
    const handlePopState = () => setPage(resolvePageFromLocation());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (key: string) => {
    if (key === "logout") {
      onLogout();
    } else {
      const normalizedKey =
        key === "documentos"
          ? "documents"
          : key === "cms" || key === "pagina-publica"
          ? "site"
          : key;
      setPage(normalizedKey as AdminPage);
      window.history.pushState(null, "", "/" + normalizedKey);
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

  if (page === "documents") {
    return <DocumentsPage onNavigate={navigate} onLogout={onLogout} />;
  }

  if (page === "site") {
    return <SiteCmsPage onNavigate={navigate} onLogout={onLogout} />;
  }

  return (
    <div className="relative w-full min-h-screen bg-[#f7f9ff]">
      {/* Shared fixed sidebar */}
      <AdminSidebar active="home" onNavigate={navigate} onLogout={onLogout} />

      <div className="w-full">
        <DashboardDoTecnico
          onLogout={onLogout}
          onNavigate={navigate}
          championshipStarted={championshipStarted}
          onToggleChampionship={() => setChampionshipStarted(!championshipStarted)}
        />
      </div>
    </div>
  );
}
