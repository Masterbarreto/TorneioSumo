import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import AdminSidebar from "./AdminSidebar";
import { API_BASE_URL } from "./config/api";

/* ─── Types & Interfaces ──────────────────────────────────────────────────── */
type DriveSection = "my-files" | "recent" | "starred" | "trash";
type ViewMode = "grid" | "list";
type SortBy = "name" | "date" | "size";
type FolderColor = "blue" | "amber" | "emerald" | "purple" | "rose" | "slate";

export interface DriveItem {
  id: string;
  name: string;
  kind: "folder" | "file";
  parentId: string | null; // null = root ("Meus Arquivos")
  mimeType: string;
  size: number; // in bytes
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  starred: boolean;
  trashed: boolean;
  folderColor?: FolderColor;
  dataUrl?: string; // Base64 / DataURL stored in MongoDB for real preview & download
  textPreview?: string;
}

/* ─── Formatting Helpers ──────────────────────────────────────────────────── */
function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(i === 0 ? 0 : 1).replace(".", ",")} ${sizes[i]}`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} às ${hours}:${mins}`;
  } catch {
    return iso;
  }
}

function getFileCategory(mime: string, name: string): {
  label: string;
  ext: string;
  bg: string;
  text: string;
  border: string;
} {
  const lower = name.toLowerCase();
  const dot = lower.lastIndexOf(".");
  const ext = dot !== -1 ? lower.slice(dot + 1).toUpperCase() : "ARQ";

  if (mime.startsWith("image/") || ["JPG", "JPEG", "PNG", "SVG", "WEBP", "GIF"].includes(ext)) {
    return { label: "Imagem", ext, bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" };
  }
  if (mime === "application/pdf" || ext === "PDF") {
    return { label: "Documento PDF", ext: "PDF", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
  }
  if (["XLS", "XLSX", "CSV"].includes(ext) || mime.includes("spreadsheet") || mime.includes("excel")) {
    return { label: "Planilha", ext, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
  }
  if (["DOC", "DOCX", "ODT", "RTF"].includes(ext) || mime.includes("word")) {
    return { label: "Documento Word", ext, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
  }
  if (["PPT", "PPTX"].includes(ext) || mime.includes("presentation")) {
    return { label: "Apresentação", ext, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
  }
  if (["ZIP", "RAR", "7Z", "TAR", "GZ"].includes(ext)) {
    return { label: "Arquivo Compactado", ext, bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" };
  }
  if (mime.startsWith("video/") || ["MP4", "WEBM", "MOV", "AVI"].includes(ext)) {
    return { label: "Vídeo", ext, bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200" };
  }
  if (mime.startsWith("text/") || ["TXT", "MD", "JSON", "JS", "TS", "HTML", "CSS"].includes(ext)) {
    return { label: "Arquivo de Texto", ext, bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" };
  }
  return { label: `Arquivo ${ext}`, ext, bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" };
}

const FOLDER_COLOR_MAP: Record<FolderColor, { fill: string; tab: string; label: string }> = {
  blue: { fill: "#3B82F6", tab: "#2563EB", label: "Azul Padrão" },
  amber: { fill: "#F59E0B", tab: "#D97706", label: "Amarelo" },
  emerald: { fill: "#10B981", tab: "#059669", label: "Verde" },
  purple: { fill: "#8B5CF6", tab: "#7C3AED", label: "Roxo" },
  rose: { fill: "#F43F5E", tab: "#E11D48", label: "Rosa / Vermelho" },
  slate: { fill: "#64748B", tab: "#475569", label: "Cinza" },
};

function CloudFolderIcon({ color = "blue", size = 40 }: { color?: FolderColor; size?: number }) {
  const palette = FOLDER_COLOR_MAP[color] || FOLDER_COLOR_MAP.blue;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="shrink-0">
      <path
        d="M4 11C4 8.79086 5.79086 7 8 7H17.3431C18.404 7 19.4214 7.42143 20.1716 8.17157L23 11H40C42.2091 11 44 12.7909 44 15V37C44 39.2091 42.2091 41 40 41H8C5.79086 41 4 39.2091 4 37V11Z"
        fill={palette.tab}
      />
      <path
        d="M4 16C4 14.3431 5.34315 13 7 13H41C42.6569 13 44 14.3431 44 16V37C44 39.2091 42.2091 41 40 41H8C5.79086 41 4 39.2091 4 37V16Z"
        fill={palette.fill}
      />
    </svg>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function DocumentsPage({
  onNavigate,
  onLogout,
}: {
  onNavigate: (key: any) => void;
  onLogout: () => void;
}) {
  // All items stored in MongoDB (/api/v1/drive)
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Navigation & UI States
  const [activeSection, setActiveSection] = useState<DriveSection>("my-files");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Modals
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState<FolderColor>("blue");

  const [renamingItem, setRenamingItem] = useState<DriveItem | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [movingItem, setMovingItem] = useState<DriveItem | null>(null);
  const [moveTargetFolderId, setMoveTargetFolderId] = useState<string | null>(null);

  const [previewItem, setPreviewItem] = useState<DriveItem | null>(null);
  const [detailsItem, setDetailsItem] = useState<DriveItem | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  /* ─── Fetch Items from MongoDB Backend ─────────────────────────────────── */
  const fetchDriveItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/drive`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setItems(data);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar itens do Drive no banco de dados:", err);
      showToast("Erro ao conectar ao banco de dados do Drive.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDriveItems();
  }, [fetchDriveItems]);

  /* ─── Breadcrumb Trail Calculation ─────────────────────────────────────── */
  const breadcrumbs = useMemo(() => {
    const trail: { id: string | null; name: string }[] = [{ id: null, name: "Meus Arquivos" }];
    if (!currentFolderId) return trail;

    const map = new Map<string, DriveItem>();
    items.forEach((it) => {
      if (it.kind === "folder") map.set(it.id, it);
    });

    const chain: { id: string | null; name: string }[] = [];
    let cursor = map.get(currentFolderId);
    let safety = 0;
    while (cursor && safety < 50) {
      chain.unshift({ id: cursor.id, name: cursor.name });
      cursor = cursor.parentId ? map.get(cursor.parentId) : undefined;
      safety++;
    }
    return [...trail, ...chain];
  }, [currentFolderId, items]);

  /* ─── Filtered & Sorted Items ──────────────────────────────────────────── */
  const q = searchQuery.trim().toLowerCase();

  const visibleItems = useMemo(() => {
    let pool: DriveItem[] = [];

    if (activeSection === "trash") {
      pool = items.filter((it) => it.trashed);
    } else if (activeSection === "starred") {
      pool = items.filter((it) => !it.trashed && it.starred);
    } else if (activeSection === "recent") {
      pool = items
        .filter((it) => !it.trashed && it.kind === "file")
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } else {
      // "my-files"
      if (q) {
        pool = items.filter((it) => !it.trashed);
      } else {
        pool = items.filter((it) => !it.trashed && (it.parentId || null) === currentFolderId);
      }
    }

    if (q) {
      pool = pool.filter((it) => it.name.toLowerCase().includes(q));
    }

    return [...pool].sort((a, b) => {
      if (activeSection !== "recent") {
        if (a.kind === "folder" && b.kind !== "folder") return -1;
        if (a.kind !== "folder" && b.kind === "folder") return 1;
      }

      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name, "pt-BR");
      else if (sortBy === "date") cmp = a.updatedAt.localeCompare(b.updatedAt);
      else if (sortBy === "size") cmp = a.size - b.size;

      return sortAsc ? cmp : -cmp;
    });
  }, [items, activeSection, currentFolderId, q, sortBy, sortAsc]);

  const foldersList = visibleItems.filter((it) => it.kind === "folder");
  const filesList = visibleItems.filter((it) => it.kind === "file");

  const totalStorageUsed = useMemo(
    () => items.filter((it) => !it.trashed).reduce((acc, it) => acc + (it.size || 0), 0),
    [items]
  );

  /* ─── Create Real Folder in MongoDB ────────────────────────────────────── */
  const handleCreateFolder = async () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) {
      showToast("Digite um nome para a pasta.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/drive/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: trimmed,
          parentId: activeSection === "my-files" ? currentFolderId : null,
          folderColor: newFolderColor,
        }),
      });

      if (!res.ok) {
        throw new Error("Falha ao criar pasta no banco de dados.");
      }

      const createdFolder: DriveItem = await res.json();
      setItems((prev) => [createdFolder, ...prev]);
      setNewFolderName("");
      setIsNewFolderOpen(false);
      if (activeSection !== "my-files") setActiveSection("my-files");
      showToast(`Pasta "${trimmed}" salva no banco de dados!`);
    } catch (err) {
      console.error(err);
      showToast("Erro ao salvar pasta no banco de dados.");
    }
  };

  /* ─── Real File Upload to MongoDB ──────────────────────────────────────── */
  const processUploadedFiles = async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    setUploading(true);
    const targetParentId = activeSection === "my-files" ? currentFolderId : null;
    const preparedFiles: Partial<DriveItem>[] = [];

    for (const file of filesArray) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
      });

      let textPreview: string | undefined = undefined;
      if (
        file.type.startsWith("text/") ||
        /\.(txt|md|csv|json|xml|log|js|ts|html|css)$/i.test(file.name)
      ) {
        textPreview = await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = () =>
            resolve(typeof r.result === "string" ? r.result.slice(0, 20000) : "");
          r.onerror = () => resolve("");
          r.readAsText(file);
        });
      }

      preparedFiles.push({
        name: file.name,
        parentId: targetParentId,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        dataUrl,
        textPreview,
      });
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/drive/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ files: preparedFiles }),
      });

      if (!res.ok) {
        throw new Error("Falha ao enviar arquivos para o banco de dados.");
      }

      const savedFiles: DriveItem[] = await res.json();
      setItems((prev) => [...savedFiles, ...prev]);
      if (activeSection !== "my-files") setActiveSection("my-files");
      showToast(
        savedFiles.length === 1
          ? `Arquivo "${savedFiles[0].name}" salvo no banco de dados!`
          : `${savedFiles.length} arquivos salvos no banco de dados!`
      );
    } catch (err) {
      console.error(err);
      showToast("Erro ao salvar arquivos no banco de dados.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  /* ─── Item Actions in MongoDB (Star, Rename, Move, Trash, Delete) ──────── */
  const handleToggleStar = async (item: DriveItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/drive/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ starred: !item.starred }),
      });
      if (res.ok) {
        const updated: DriveItem = await res.json();
        setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
        showToast(
          updated.starred
            ? `"${item.name}" adicionado aos Favoritos!`
            : `"${item.name}" removido dos Favoritos.`
        );
      }
    } catch {
      showToast("Erro ao atualizar favorito no banco.");
    }
  };

  const handleSaveRename = async () => {
    if (!renamingItem || !renameValue.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/drive/${renamingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      if (res.ok) {
        const updated: DriveItem = await res.json();
        setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
        setRenamingItem(null);
        showToast("Renomeado e salvo no banco de dados!");
      }
    } catch {
      showToast("Erro ao renomear no banco de dados.");
    }
  };

  const handleSaveMove = async () => {
    if (!movingItem) return;
    if (movingItem.id === moveTargetFolderId) {
      showToast("Não é possível mover uma pasta para dentro dela mesma.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/drive/${movingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ parentId: moveTargetFolderId }),
      });
      if (res.ok) {
        const updated: DriveItem = await res.json();
        setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
        setMovingItem(null);
        showToast(`"${movingItem.name}" movido com sucesso!`);
      }
    } catch {
      showToast("Erro ao mover item no banco de dados.");
    }
  };

  const handleMoveToTrash = async (item: DriveItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/drive/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ trashed: true }),
      });
      if (res.ok) {
        const updated: DriveItem = await res.json();
        setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
        if (selectedId === item.id) setSelectedId(null);
        showToast(`"${item.name}" movido para a Lixeira.`);
      }
    } catch {
      showToast("Erro ao mover para a lixeira.");
    }
  };

  const handleRestoreFromTrash = async (item: DriveItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/drive/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ trashed: false }),
      });
      if (res.ok) {
        const updated: DriveItem = await res.json();
        setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
        showToast(`"${item.name}" restaurado!`);
      }
    } catch {
      showToast("Erro ao restaurar item.");
    }
  };

  const handlePermanentDelete = async (item: DriveItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/drive/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const deletedSet = new Set<string>(data.deletedIds || [item.id]);
        setItems((prev) => prev.filter((it) => !deletedSet.has(it.id)));
        if (selectedId && deletedSet.has(selectedId)) setSelectedId(null);
        showToast(`"${item.name}" excluído permanentemente do banco de dados.`);
      }
    } catch {
      showToast("Erro ao excluir do banco de dados.");
    }
  };

  const handleEmptyTrash = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/drive/trash/empty`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((it) => !it.trashed));
        showToast("Lixeira esvaziada no banco de dados!");
      }
    } catch {
      showToast("Erro ao esvaziar lixeira.");
    }
  };

  const handleDownloadFile = (item: DriveItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!item.dataUrl) {
      showToast("Arquivo sem dados para download.");
      return;
    }
    const a = document.createElement("a");
    a.href = item.dataUrl;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Download de "${item.name}" iniciado!`);
  };

  const handleOpenItem = (item: DriveItem) => {
    if (item.trashed) return;
    if (item.kind === "folder") {
      setActiveSection("my-files");
      setCurrentFolderId(item.id);
      setSelectedId(null);
      setSearchQuery("");
    } else {
      setPreviewItem(item);
    }
  };

  const countFolderChildren = (folderId: string): number =>
    items.filter((it) => !it.trashed && it.parentId === folderId).length;

  const allAvailableFolders = items.filter((it) => !it.trashed && it.kind === "folder");

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!isDraggingOver) setIsDraggingOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDraggingOver(false);
      }}
      onDrop={handleDrop}
      className="fixed inset-0 bg-[#f8fafc] z-[800] flex overflow-y-auto text-[#0f172a]"
    >
      <AdminSidebar active="documents" onNavigate={onNavigate} onLogout={onLogout} />

      {/* Hidden Multiple File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Drag & Drop Fullscreen Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-[950] bg-[#00356a]/80 backdrop-blur-xs flex items-center justify-center p-8 pointer-events-none">
          <div className="border-2 border-dashed border-white rounded-[24px] p-12 text-center text-white max-w-lg w-full flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center text-3xl">
              ☁️
            </div>
            <h2 className="font-['Space_Grotesk'] font-bold text-2xl">
              Solte os arquivos para salvar no Banco de Dados
            </h2>
            <p className="text-sm text-white/80">
              Os arquivos serão gravados em{" "}
              <strong>{breadcrumbs[breadcrumbs.length - 1]?.name || "Meus Arquivos"}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 pl-0 md:pl-[256px] flex flex-col min-h-screen">
        {/* ─── Top Bar ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 min-h-[68px] bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] flex items-center justify-between px-4 sm:px-8 pl-16 md:pl-8 py-3 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#00356a] to-[#005fb8] text-white flex items-center justify-center shadow-xs">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-600 tracking-[1px] uppercase flex items-center gap-1.5">
                <span>● SINCRONIZADO COM MONGODB</span>
              </p>
              <h1 className="font-['Space_Grotesk'] font-bold text-[#0f172a] text-[19px] tracking-[-0.3px]">
                Meus Arquivos & Pastas
              </h1>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md min-w-[220px]">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.2"
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar pastas e arquivos no banco..."
              className="w-full pl-10 pr-8 py-2 rounded-full bg-[#f1f5f9] border border-transparent focus:border-[#005fb8] focus:bg-white text-[13px] text-[#0f172a] outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0f172a] text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Buttons: Nova Pasta + Subir Arquivos */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setNewFolderName("");
                setNewFolderColor("blue");
                setIsNewFolderOpen(true);
              }}
              className="px-4 py-2 rounded-[10px] border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-[#0f172a] font-bold text-[12px] inline-flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#005fb8" strokeWidth="2.2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                <line x1="12" y1="11" x2="12" y2="17" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
              <span>Nova Pasta</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 rounded-[10px] bg-[#005fb8] hover:bg-[#004c94] text-white font-bold text-[12px] inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{uploading ? "Salvando no Banco..." : "Subir Arquivos"}</span>
            </button>
          </div>
        </header>

        {/* ─── Body with Drive Sidebar + Main Canvas ───────────────────────── */}
        <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto p-4 sm:p-6 gap-6">
          {/* Left Drive Navigation Rail (OneDrive / Google Drive style) */}
          <aside className="w-full lg:w-[230px] shrink-0 flex flex-col gap-4">
            <div className="bg-white rounded-[16px] border border-[#e2e8f0] p-2.5 flex flex-row lg:flex-col gap-1 overflow-x-auto">
              {(
                [
                  { key: "my-files", label: "Meus Arquivos", icon: "📁" },
                  { key: "recent", label: "Recentes", icon: "🕒" },
                  { key: "starred", label: "Favoritos", icon: "⭐" },
                  { key: "trash", label: "Lixeira", icon: "🗑️" },
                ] as const
              ).map((nav) => {
                const active = activeSection === nav.key;
                const badgeCount =
                  nav.key === "trash"
                    ? items.filter((i) => i.trashed).length
                    : nav.key === "starred"
                    ? items.filter((i) => !i.trashed && i.starred).length
                    : 0;

                return (
                  <button
                    key={nav.key}
                    onClick={() => {
                      setActiveSection(nav.key);
                      setSelectedId(null);
                    }}
                    className={`px-3.5 py-2.5 rounded-[10px] text-[13px] font-semibold flex items-center justify-between gap-2.5 transition-all cursor-pointer shrink-0 ${
                      active
                        ? "bg-[#e5f3ff] text-[#005fb8]"
                        : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span>{nav.icon}</span>
                      <span>{nav.label}</span>
                    </span>
                    {badgeCount > 0 && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white text-[#475569] border border-[#e2e8f0]">
                        {badgeCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Storage Meter */}
            <div className="bg-white rounded-[16px] border border-[#e2e8f0] p-4 hidden lg:flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[12px] font-bold text-[#334155]">
                <span>🗄️ Banco MongoDB</span>
                <span className="font-mono text-[#005fb8]">{formatBytes(totalStorageUsed)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
                <div
                  className="h-full bg-[#005fb8] transition-all"
                  style={{
                    width: `${Math.min(100, totalStorageUsed > 0 ? Math.max(4, (totalStorageUsed / (50 * 1024 * 1024)) * 100) : 0)}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-[#64748b]">
                {items.filter((i) => !i.trashed && i.kind === "folder").length} pastas •{" "}
                {items.filter((i) => !i.trashed && i.kind === "file").length} arquivos no banco
              </p>
            </div>
          </aside>

          {/* Main Drive Explorer Area */}
          <main
            onClick={() => setSelectedId(null)}
            className="flex-1 bg-white rounded-[18px] border border-[#e2e8f0] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col min-h-[540px] overflow-hidden"
          >
            {/* ─── Breadcrumb & View Controls Bar ──────────────────────────── */}
            <div className="px-5 py-3.5 border-b border-[#e2e8f0] flex items-center justify-between gap-3 flex-wrap bg-[#fbfcfe]">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-1 text-[13px] overflow-x-auto no-scrollbar">
                {activeSection === "my-files" ? (
                  breadcrumbs.map((bc, idx) => {
                    const isLast = idx === breadcrumbs.length - 1;
                    return (
                      <React.Fragment key={bc.id || "root"}>
                        {idx > 0 && <span className="text-[#94a3b8] px-1">›</span>}
                        <button
                          onClick={() => {
                            setCurrentFolderId(bc.id);
                            setSelectedId(null);
                          }}
                          className={`px-2 py-1 rounded-[8px] transition-colors cursor-pointer whitespace-nowrap ${
                            isLast
                              ? "font-bold text-[#0f172a] bg-[#f1f5f9]"
                              : "font-medium text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                          }`}
                        >
                          {idx === 0 ? "📁 Meus Arquivos" : bc.name}
                        </button>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <span className="font-bold text-[#0f172a] px-2 py-1">
                    {activeSection === "recent" && "🕒 Arquivos Recentes"}
                    {activeSection === "starred" && "⭐ Itens Favoritos"}
                    {activeSection === "trash" && "🗑️ Lixeira"}
                  </span>
                )}
              </div>

              {/* Right Controls: Sort + View Mode + Trash Empty */}
              <div className="flex items-center gap-2">
                {activeSection === "trash" && visibleItems.length > 0 && (
                  <button
                    onClick={handleEmptyTrash}
                    className="px-3 py-1.5 rounded-[8px] bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[11px] cursor-pointer transition-colors"
                  >
                    Esvaziar Lixeira
                  </button>
                )}

                <select
                  value={`${sortBy}-${sortAsc ? "asc" : "desc"}`}
                  onChange={(e) => {
                    const [field, dir] = e.target.value.split("-") as [SortBy, string];
                    setSortBy(field);
                    setSortAsc(dir === "asc");
                  }}
                  className="px-3 py-1.5 rounded-[8px] border border-[#e2e8f0] bg-white text-[12px] text-[#475569] font-medium outline-none cursor-pointer"
                >
                  <option value="name-asc">Nome (A → Z)</option>
                  <option value="name-desc">Nome (Z → A)</option>
                  <option value="date-desc">Mais recentes</option>
                  <option value="date-asc">Mais antigos</option>
                  <option value="size-desc">Maior tamanho</option>
                  <option value="size-asc">Menor tamanho</option>
                </select>

                <div className="flex items-center rounded-[8px] border border-[#e2e8f0] p-0.5 bg-[#f8fafc]">
                  <button
                    onClick={() => setViewMode("grid")}
                    title="Visualização em Grade"
                    className={`px-2.5 py-1 rounded-[6px] text-[12px] cursor-pointer transition-colors ${
                      viewMode === "grid"
                        ? "bg-white text-[#005fb8] shadow-2xs font-bold"
                        : "text-[#64748b] hover:text-[#0f172a]"
                    }`}
                  >
                    ⊞ Grade
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    title="Visualização em Lista"
                    className={`px-2.5 py-1 rounded-[6px] text-[12px] cursor-pointer transition-colors ${
                      viewMode === "list"
                        ? "bg-white text-[#005fb8] shadow-2xs font-bold"
                        : "text-[#64748b] hover:text-[#0f172a]"
                    }`}
                  >
                    ☰ Lista
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Content Canvas ──────────────────────────────────────────── */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-6">
              {loading ? (
                <div className="flex-1 flex items-center justify-center text-sm text-[#64748b]">
                  Sincronizando com o banco de dados MongoDB...
                </div>
              ) : visibleItems.length === 0 ? (
                /* ─── ZERADO / EMPTY STATE ────────────────────────────────── */
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4">
                  <div className="w-20 h-20 rounded-full bg-[#f1f5f9] flex items-center justify-center mb-4">
                    <CloudFolderIcon color="blue" size={48} />
                  </div>
                  <h3 className="font-['Space_Grotesk'] font-bold text-[18px] text-[#0f172a]">
                    {activeSection === "trash"
                      ? "A lixeira está vazia"
                      : activeSection === "starred"
                      ? "Nenhum item favorito"
                      : q
                      ? "Nenhum resultado encontrado"
                      : "Esta pasta está vazia"}
                  </h3>
                  <p className="text-[13px] text-[#64748b] max-w-md mt-1.5 leading-relaxed">
                    {activeSection === "my-files" && !q
                      ? "Crie pastas ou envie arquivos do seu computador. Tudo é salvo diretamente no banco de dados MongoDB."
                      : "Não há itens para exibir nesta seção no momento."}
                  </p>

                  {activeSection === "my-files" && !q && (
                    <div className="flex items-center gap-3 mt-6">
                      <button
                        onClick={() => {
                          setNewFolderName("");
                          setIsNewFolderOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-[10px] border border-[#cbd5e1] bg-white hover:bg-[#f8fafc] text-[#0f172a] font-bold text-[12px] cursor-pointer transition-colors"
                      >
                        + Criar Nova Pasta
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-[10px] bg-[#005fb8] hover:bg-[#004c94] text-white font-bold text-[12px] cursor-pointer transition-colors shadow-xs"
                      >
                        📤 Subir Arquivos do PC
                      </button>
                    </div>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                /* ─── GRID VIEW (Google Drive / OneDrive Style) ────────────── */
                <div className="flex flex-col gap-6">
                  {/* Pastas Section */}
                  {foldersList.length > 0 && (
                    <div>
                      <h2 className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#64748b] mb-3">
                        Pastas ({foldersList.length})
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
                        {foldersList.map((folder) => {
                          const isSel = selectedId === folder.id;
                          const childrenCount = countFolderChildren(folder.id);
                          return (
                            <div
                              key={folder.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(folder.id);
                              }}
                              onDoubleClick={() => handleOpenItem(folder)}
                              className={`group p-3.5 rounded-[14px] border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                                isSel
                                  ? "bg-[#e5f3ff] border-[#005fb8] shadow-xs"
                                  : "bg-[#f8fafc] border-[#e2e8f0] hover:bg-white hover:border-[#cbd5e1] hover:shadow-xs"
                              }`}
                            >
                              <div
                                onClick={() => handleOpenItem(folder)}
                                className="flex items-center gap-3 min-w-0 flex-1"
                              >
                                <CloudFolderIcon color={folder.folderColor || "blue"} size={38} />
                                <div className="min-w-0">
                                  <p className="font-semibold text-[13px] text-[#0f172a] truncate">
                                    {folder.name}
                                  </p>
                                  <p className="text-[11px] text-[#64748b]">
                                    {childrenCount === 0
                                      ? "Pasta vazia"
                                      : `${childrenCount} ${childrenCount === 1 ? "item" : "itens"}`}
                                  </p>
                                </div>
                              </div>

                              {/* Folder Quick Actions */}
                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                {!folder.trashed ? (
                                  <>
                                    <button
                                      onClick={(e) => handleToggleStar(folder, e)}
                                      title="Favoritar"
                                      className="p-1.5 rounded-full hover:bg-black/5 text-xs cursor-pointer"
                                    >
                                      {folder.starred ? "⭐" : "☆"}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setRenamingItem(folder);
                                        setRenameValue(folder.name);
                                      }}
                                      title="Renomear pasta"
                                      className="p-1.5 rounded-full hover:bg-black/5 text-xs cursor-pointer"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={(e) => handleMoveToTrash(folder, e)}
                                      title="Mover para a Lixeira"
                                      className="p-1.5 rounded-full hover:bg-red-50 text-red-600 text-xs cursor-pointer"
                                    >
                                      🗑️
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={(e) => handleRestoreFromTrash(folder, e)}
                                      title="Restaurar"
                                      className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold cursor-pointer"
                                    >
                                      Restaurar
                                    </button>
                                    <button
                                      onClick={(e) => handlePermanentDelete(folder, e)}
                                      title="Excluir permanentemente"
                                      className="px-2 py-1 rounded bg-red-50 text-red-600 text-[11px] font-bold cursor-pointer"
                                    >
                                      Excluir
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Arquivos Section */}
                  {filesList.length > 0 && (
                    <div>
                      <h2 className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#64748b] mb-3">
                        Arquivos ({filesList.length})
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filesList.map((file) => {
                          const isSel = selectedId === file.id;
                          const badge = getFileCategory(file.mimeType, file.name);
                          const isImage =
                            file.mimeType.startsWith("image/") && Boolean(file.dataUrl);

                          return (
                            <div
                              key={file.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(file.id);
                              }}
                              onDoubleClick={() => handleOpenItem(file)}
                              className={`group rounded-[14px] border overflow-hidden flex flex-col justify-between cursor-pointer transition-all ${
                                isSel
                                  ? "bg-[#e5f3ff] border-[#005fb8] shadow-sm"
                                  : "bg-white border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-sm"
                              }`}
                            >
                              {/* Preview Thumbnail Box */}
                              <div
                                onClick={() => handleOpenItem(file)}
                                className="h-36 bg-[#f8fafc] border-b border-[#f1f5f9] flex items-center justify-center relative overflow-hidden p-3"
                              >
                                {isImage ? (
                                  <img
                                    src={file.dataUrl}
                                    alt={file.name}
                                    className="w-full h-full object-cover rounded-[8px]"
                                  />
                                ) : (
                                  <div
                                    className={`px-4 py-2.5 rounded-[12px] border font-mono font-bold text-sm ${badge.bg} ${badge.text} ${badge.border}`}
                                  >
                                    .{badge.ext}
                                  </div>
                                )}

                                <button
                                  onClick={(e) => handleToggleStar(file, e)}
                                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 shadow-2xs flex items-center justify-center text-xs cursor-pointer"
                                  title="Favoritar"
                                >
                                  {file.starred ? "⭐" : "☆"}
                                </button>
                              </div>

                              {/* File Footer */}
                              <div className="p-3.5">
                                <p
                                  className="font-semibold text-[13px] text-[#0f172a] truncate"
                                  title={file.name}
                                >
                                  {file.name}
                                </p>
                                <div className="flex items-center justify-between text-[11px] text-[#64748b] mt-1">
                                  <span>{formatBytes(file.size)}</span>
                                  <span>{badge.label}</span>
                                </div>

                                <div className="flex items-center justify-between gap-1 mt-3 pt-2.5 border-t border-[#f1f5f9]">
                                  {!file.trashed ? (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenItem(file);
                                        }}
                                        className="px-2.5 py-1 rounded-[6px] bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] font-semibold text-[11px] cursor-pointer"
                                      >
                                        Abrir
                                      </button>
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={(e) => handleDownloadFile(file, e)}
                                          title="Baixar arquivo"
                                          className="p-1.5 rounded-[6px] hover:bg-[#f1f5f9] text-xs cursor-pointer"
                                        >
                                          ⬇️
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setRenamingItem(file);
                                            setRenameValue(file.name);
                                          }}
                                          title="Renomear"
                                          className="p-1.5 rounded-[6px] hover:bg-[#f1f5f9] text-xs cursor-pointer"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setMovingItem(file);
                                            setMoveTargetFolderId(file.parentId);
                                          }}
                                          title="Mover para pasta"
                                          className="p-1.5 rounded-[6px] hover:bg-[#f1f5f9] text-xs cursor-pointer"
                                        >
                                          📁
                                        </button>
                                        <button
                                          onClick={(e) => handleMoveToTrash(file, e)}
                                          title="Excluir"
                                          className="p-1.5 rounded-[6px] hover:bg-red-50 text-red-600 text-xs cursor-pointer"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex items-center justify-end gap-2 w-full">
                                      <button
                                        onClick={(e) => handleRestoreFromTrash(file, e)}
                                        className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold cursor-pointer"
                                      >
                                        Restaurar
                                      </button>
                                      <button
                                        onClick={(e) => handlePermanentDelete(file, e)}
                                        className="px-2.5 py-1 rounded bg-red-50 text-red-600 text-[11px] font-bold cursor-pointer"
                                      >
                                        Excluir
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* ─── LIST VIEW (OneDrive Table Style) ─────────────────────── */
                <div className="border border-[#e2e8f0] rounded-[12px] overflow-hidden">
                  <div className="grid grid-cols-12 px-4 py-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] text-[11px] font-bold uppercase tracking-[0.6px] text-[#64748b]">
                    <div className="col-span-6 sm:col-span-5">Nome</div>
                    <div className="col-span-3 hidden sm:block">Modificado em</div>
                    <div className="col-span-2 hidden md:block">Tamanho</div>
                    <div className="col-span-6 sm:col-span-4 md:col-span-2 text-right">Ações</div>
                  </div>

                  <div className="divide-y divide-[#f1f5f9]">
                    {visibleItems.map((item) => {
                      const isSel = selectedId === item.id;
                      const badge =
                        item.kind === "file" ? getFileCategory(item.mimeType, item.name) : null;

                      return (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(item.id);
                          }}
                          onDoubleClick={() => handleOpenItem(item)}
                          className={`grid grid-cols-12 items-center px-4 py-3 text-[13px] cursor-pointer transition-colors ${
                            isSel ? "bg-[#e5f3ff]" : "hover:bg-[#f8fafc]"
                          }`}
                        >
                          <div
                            onClick={() => handleOpenItem(item)}
                            className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0 pr-3"
                          >
                            {item.kind === "folder" ? (
                              <CloudFolderIcon color={item.folderColor || "blue"} size={28} />
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge?.bg} ${badge?.text} ${badge?.border}`}
                              >
                                {badge?.ext}
                              </span>
                            )}
                            <span className="font-medium text-[#0f172a] truncate">{item.name}</span>
                          </div>

                          <div className="col-span-3 hidden sm:block text-[12px] text-[#64748b]">
                            {formatDate(item.updatedAt)}
                          </div>

                          <div className="col-span-2 hidden md:block text-[12px] font-mono text-[#64748b]">
                            {item.kind === "folder"
                              ? `${countFolderChildren(item.id)} itens`
                              : formatBytes(item.size)}
                          </div>

                          <div className="col-span-6 sm:col-span-4 md:col-span-2 flex items-center justify-end gap-1">
                            {!item.trashed ? (
                              <>
                                <button
                                  onClick={(e) => handleToggleStar(item, e)}
                                  className="p-1.5 rounded hover:bg-black/5 text-xs cursor-pointer"
                                  title="Favoritar"
                                >
                                  {item.starred ? "⭐" : "☆"}
                                </button>
                                {item.kind === "file" && (
                                  <button
                                    onClick={(e) => handleDownloadFile(item, e)}
                                    className="p-1.5 rounded hover:bg-black/5 text-xs cursor-pointer"
                                    title="Baixar"
                                  >
                                    ⬇️
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRenamingItem(item);
                                    setRenameValue(item.name);
                                  }}
                                  className="p-1.5 rounded hover:bg-black/5 text-xs cursor-pointer"
                                  title="Renomear"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDetailsItem(item);
                                  }}
                                  className="p-1.5 rounded hover:bg-black/5 text-xs cursor-pointer"
                                  title="Detalhes"
                                >
                                  ℹ️
                                </button>
                                <button
                                  onClick={(e) => handleMoveToTrash(item, e)}
                                  className="p-1.5 rounded hover:bg-red-50 text-red-600 text-xs cursor-pointer"
                                  title="Excluir"
                                >
                                  🗑️
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => handleRestoreFromTrash(item, e)}
                                  className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold cursor-pointer"
                                >
                                  Restaurar
                                </button>
                                <button
                                  onClick={(e) => handlePermanentDelete(item, e)}
                                  className="px-2 py-1 rounded bg-red-50 text-red-600 text-[11px] font-bold cursor-pointer"
                                >
                                  Excluir
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ─── MODAL: CRIAR NOVA PASTA ───────────────────────────────────────────── */}
      {isNewFolderOpen && (
        <div
          onClick={() => setIsNewFolderOpen(false)}
          className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[900] flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[18px] max-w-sm w-full p-6 border border-[#e2e8f0] shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <CloudFolderIcon color={newFolderColor} size={40} />
              <div>
                <h3 className="font-['Space_Grotesk'] font-bold text-[17px] text-[#0f172a]">
                  Nova Pasta
                </h3>
                <p className="text-[12px] text-[#64748b]">
                  Em: {breadcrumbs[breadcrumbs.length - 1]?.name}
                </p>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-[#475569] block mb-1">
                Nome da Pasta
              </label>
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                placeholder="Ex: Documentos do Torneio"
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#cbd5e1] focus:border-[#005fb8] text-[13px] outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-[#475569] block mb-1.5">
                Cor da Pasta
              </label>
              <div className="flex items-center gap-2">
                {(Object.keys(FOLDER_COLOR_MAP) as FolderColor[]).map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setNewFolderColor(col)}
                    style={{ backgroundColor: FOLDER_COLOR_MAP[col].fill }}
                    className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${
                      newFolderColor === col ? "scale-115 ring-2 ring-offset-2 ring-[#005fb8]" : ""
                    }`}
                    title={FOLDER_COLOR_MAP[col].label}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsNewFolderOpen(false)}
                className="px-4 py-2 rounded-[10px] border border-[#cbd5e1] text-[#475569] font-bold text-[12px] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-5 py-2 rounded-[10px] bg-[#005fb8] hover:bg-[#004c94] text-white font-bold text-[12px] cursor-pointer"
              >
                Criar Pasta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: RENOMEAR ITEM ──────────────────────────────────────────────── */}
      {renamingItem && (
        <div
          onClick={() => setRenamingItem(null)}
          className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[900] flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[18px] max-w-sm w-full p-6 border border-[#e2e8f0] shadow-2xl space-y-4"
          >
            <h3 className="font-['Space_Grotesk'] font-bold text-[17px] text-[#0f172a]">
              Renomear {renamingItem.kind === "folder" ? "Pasta" : "Arquivo"}
            </h3>

            <input
              type="text"
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#cbd5e1] focus:border-[#005fb8] text-[13px] outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRenamingItem(null)}
                className="px-4 py-2 rounded-[10px] border border-[#cbd5e1] text-[#475569] font-bold text-[12px] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRename}
                className="px-5 py-2 rounded-[10px] bg-[#005fb8] text-white font-bold text-[12px] cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: MOVER PARA PASTA ───────────────────────────────────────────── */}
      {movingItem && (
        <div
          onClick={() => setMovingItem(null)}
          className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[900] flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[18px] max-w-md w-full p-6 border border-[#e2e8f0] shadow-2xl space-y-4"
          >
            <h3 className="font-['Space_Grotesk'] font-bold text-[17px] text-[#0f172a]">
              Mover &quot;{movingItem.name}&quot; para...
            </h3>

            <div className="max-h-60 overflow-y-auto border border-[#e2e8f0] rounded-[12px] divide-y divide-[#f1f5f9]">
              <button
                onClick={() => setMoveTargetFolderId(null)}
                className={`w-full px-4 py-2.5 text-left text-[13px] flex items-center gap-2.5 cursor-pointer ${
                  moveTargetFolderId === null ? "bg-[#e5f3ff] font-bold text-[#005fb8]" : "hover:bg-[#f8fafc]"
                }`}
              >
                <span>📁</span>
                <span>Meus Arquivos (Raiz)</span>
              </button>
              {allAvailableFolders
                .filter((f) => f.id !== movingItem.id)
                .map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setMoveTargetFolderId(f.id)}
                    className={`w-full px-4 py-2.5 text-left text-[13px] flex items-center gap-2.5 cursor-pointer ${
                      moveTargetFolderId === f.id
                        ? "bg-[#e5f3ff] font-bold text-[#005fb8]"
                        : "hover:bg-[#f8fafc]"
                    }`}
                  >
                    <CloudFolderIcon color={f.folderColor || "blue"} size={20} />
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMovingItem(null)}
                className="px-4 py-2 rounded-[10px] border border-[#cbd5e1] text-[#475569] font-bold text-[12px] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMove}
                className="px-5 py-2 rounded-[10px] bg-[#005fb8] text-white font-bold text-[12px] cursor-pointer"
              >
                Mover Aqui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: DETALHES DO ITEM ───────────────────────────────────────────── */}
      {detailsItem && (
        <div
          onClick={() => setDetailsItem(null)}
          className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[900] flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[18px] max-w-md w-full p-6 border border-[#e2e8f0] shadow-2xl space-y-4 text-[13px]"
          >
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <h3 className="font-['Space_Grotesk'] font-bold text-[17px] text-[#0f172a] truncate">
                Detalhes no Banco de Dados
              </h3>
              <button
                onClick={() => setDetailsItem(null)}
                className="text-[#64748b] hover:text-[#0f172a] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-[#334155]">
              <div className="flex justify-between gap-2">
                <span className="text-[#64748b]">ID no Banco:</span>
                <span className="font-mono text-xs">{detailsItem.id}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#64748b]">Nome:</span>
                <span className="font-semibold text-right break-all">{detailsItem.name}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#64748b]">Tipo MIME:</span>
                <span className="font-mono text-xs">{detailsItem.mimeType}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#64748b]">Tamanho:</span>
                <span className="font-mono">{formatBytes(detailsItem.size)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#64748b]">Criado em:</span>
                <span>{formatDate(detailsItem.createdAt)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#64748b]">Modificado em:</span>
                <span>{formatDate(detailsItem.updatedAt)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailsItem(null)}
                className="px-5 py-2 rounded-[10px] bg-[#005fb8] text-white font-bold text-[12px] cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: PREVIEW DE ARQUIVOS (IMAGENS, PDF, VÍDEO, TEXTO) ─────────── */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[920] flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[18px] max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#cbd5e1]"
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-[#0f172a] text-white flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-[14px] truncate">{previewItem.name}</h3>
                <p className="text-[11px] text-slate-400">
                  {formatBytes(previewItem.size)} • {formatDate(previewItem.updatedAt)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadFile(previewItem)}
                  className="px-3.5 py-1.5 rounded-[8px] bg-[#005fb8] hover:bg-[#004c94] text-white font-bold text-[12px] cursor-pointer"
                >
                  ⬇ Baixar Original
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="w-8 h-8 rounded-[8px] bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Viewer Body */}
            <div className="flex-1 bg-[#f1f5f9] p-6 overflow-auto flex items-center justify-center min-h-[380px]">
              {previewItem.mimeType.startsWith("image/") && previewItem.dataUrl ? (
                <img
                  src={previewItem.dataUrl}
                  alt={previewItem.name}
                  className="max-h-[70vh] w-auto object-contain rounded-[8px] shadow-md"
                />
              ) : previewItem.mimeType === "application/pdf" && previewItem.dataUrl ? (
                <iframe
                  src={previewItem.dataUrl}
                  title={previewItem.name}
                  className="w-full h-[70vh] rounded-[8px] bg-white border border-[#cbd5e1]"
                />
              ) : previewItem.mimeType.startsWith("video/") && previewItem.dataUrl ? (
                <video
                  src={previewItem.dataUrl}
                  controls
                  className="max-h-[70vh] w-auto rounded-[8px] shadow-md"
                />
              ) : previewItem.textPreview !== undefined ? (
                <pre className="w-full max-h-[68vh] overflow-auto bg-white p-5 rounded-[12px] border border-[#cbd5e1] text-[13px] font-mono text-[#0f172a] whitespace-pre-wrap">
                  {previewItem.textPreview || "(Arquivo de texto vazio)"}
                </pre>
              ) : (
                <div className="text-center p-8 bg-white rounded-[16px] border border-[#e2e8f0] max-w-sm">
                  <p className="font-bold text-[15px] text-[#0f172a] mb-1">{previewItem.name}</p>
                  <p className="text-[12px] text-[#64748b] mb-4">
                    Este formato ({previewItem.mimeType}) está pronto para download.
                  </p>
                  <button
                    onClick={() => handleDownloadFile(previewItem)}
                    className="px-5 py-2.5 rounded-[10px] bg-[#005fb8] text-white font-bold text-[12px] cursor-pointer"
                  >
                    ⬇ Baixar Arquivo ({formatBytes(previewItem.size)})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[999] bg-[#0f172a] text-white px-5 py-3.5 rounded-[12px] shadow-2xl border-l-4 border-[#005fb8] text-[13px] font-semibold flex items-center gap-3">
          <span>✓</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
