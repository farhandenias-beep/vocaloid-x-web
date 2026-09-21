import { LogoLockup, LogoMark } from "@/components/vocaloid/logo-mark";
import {
  HexIcon,
  HudPanel,
  MeterBar,
  SectionLabel,
} from "@/components/vocaloid/hud";
import { SystemMonitor } from "@/components/vocaloid/system-monitor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { cn, formatConvexError } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  FolderKanban,
  Inbox,
  LogOut,
  Mail,
  MailOpen,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

type ProjectStatus = "online" | "beta" | "locked";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  online: "ONLINE",
  beta: "BETA",
  locked: "LOCKED",
};

const STATUS_STYLES: Record<ProjectStatus, string> = {
  online: "border-[#4ade80]/40 text-[#7dffb0] bg-[#4ade80]/10",
  beta: "border-vx-ember/40 text-vx-ember bg-vx-ember/10",
  locked: "border-vx-red/35 text-vx-red bg-vx-red/10",
};

const STATUS_CYCLE: Record<ProjectStatus, ProjectStatus> = {
  online: "beta",
  beta: "locked",
  locked: "online",
};

function timeAgo(timestamp: number) {
  const minutes = Math.floor(Math.max(0, Date.now() - timestamp) / 60_000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

function ConsoleHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-vx-red/20 bg-[#07040a]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center gap-4 px-5 sm:px-8">
        <Link to="/" className="shrink-0">
          <LogoLockup markClassName="h-7 w-7" className="[&_span]:text-base" />
        </Link>
        <span className="vx-label hidden sm:inline">
          // OPERATOR CONSOLE
        </span>
        <div className="ml-auto flex items-center gap-3">
          <span className="vx-mono hidden items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground md:inline-flex">
            <span className="size-1.5 animate-vx-pulse rounded-full bg-vx-red" />
            SESSION ACTIVE
          </span>
          <span className="vx-mono hidden max-w-[180px] truncate text-[11px] text-rose-100/80 sm:block">
            {user?.email ?? user?.name ?? "operator"}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="vx-mono vx-cut-sm border-vx-red/35 bg-transparent gap-2 text-[10px] tracking-[0.18em] text-rose-100 hover:bg-vx-red/10 hover:text-white"
          >
            <LogOut className="size-3.5" />
            SIGN OUT
          </Button>
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-vx-red/60 to-transparent" />
    </header>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="vx-panel vx-cut px-4 py-3.5">
      <p className="vx-label">{label}</p>
      <p className="vx-mono mt-2 text-2xl font-bold text-vx-red">{value}</p>
      <p className="vx-mono mt-1 text-[10px] tracking-[0.16em] text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}

function ProjectRegistry({
  projects,
}: {
  projects: Doc<"projects">[] | undefined;
}) {
  const createProject = useMutation(api.projects.create);
  const removeProject = useMutation(api.projects.remove);
  const updateStatus = useMutation(api.projects.setStatus);

  const [status, setStatus] = useState<ProjectStatus>("beta");
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setIsSaving(true);
    try {
      await createProject({
        name: String(data.get("name") ?? ""),
        tagline: String(data.get("tagline") ?? ""),
        stack: String(data.get("stack") ?? ""),
        status,
      });
      form.reset();
      setStatus("beta");
      toast.success("PROJECT TERDAFTAR // Sistem menyinkronkan data.");
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal menyimpan project."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCycleStatus = async (
    projectId: Id<"projects">,
    current: ProjectStatus,
  ) => {
    try {
      await updateStatus({ projectId, status: STATUS_CYCLE[current] });
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal mengubah status."));
    }
  };

  const handleRemove = async (projectId: Id<"projects">) => {
    try {
      await removeProject({ projectId });
      toast.success("PROJECT DIHAPUS.");
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal menghapus project."));
    }
  };

  return (
    <HudPanel
      label="// PROJECT REGISTRY"
      right={
        <span className="vx-mono text-[10px] text-vx-red">
          {projects?.length ?? 0}/12 ACTIVE
        </span>
      }
      bodyClassName="p-5"
    >
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="vx-label block">// NAMA PROJECT</span>
            <Input
              name="name"
              required
              minLength={2}
              maxLength={60}
              disabled={isSaving}
              placeholder="ABYSS.CORE"
              className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
            />
          </label>
          <label className="block space-y-2">
            <span className="vx-label block">// STACK (PISAH DENGAN KOMA)</span>
            <Input
              name="stack"
              disabled={isSaving}
              placeholder="TYPESCRIPT, CONVEX"
              className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
            />
          </label>
        </div>
        <label className="block space-y-2">
          <span className="vx-label block">// DESKRIPSI SINGKAT</span>
          <Textarea
            name="tagline"
            rows={2}
            maxLength={160}
            disabled={isSaving}
            placeholder="Satu kalimat tentang apa yang dibangun."
            className="vx-mono vx-cut-sm border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as ProjectStatus)}
          >
            <SelectTrigger className="vx-mono vx-cut-sm h-11 w-[160px] border-vx-red/25 bg-[#0a0509] text-[11px] tracking-[0.18em]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">ONLINE</SelectItem>
              <SelectItem value="beta">BETA</SelectItem>
              <SelectItem value="locked">LOCKED</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="submit"
            disabled={isSaving}
            className="vx-cut vx-mono gap-2 text-[11px] tracking-[0.22em]"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            DAFTARKAN
          </Button>
        </div>
      </form>

      <div className="mt-6 border-t border-vx-red/15 pt-2">
        {projects === undefined ? (
          <div className="flex items-center gap-2 py-6 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span className="vx-mono text-[11px]">MEMUAT DATA...</span>
          </div>
        ) : projects.length === 0 ? (
          <p className="vx-mono py-6 text-[11px] leading-5 text-muted-foreground">
            Belum ada project terdaftar. Tambahkan project pertama Anda di atas.
          </p>
        ) : (
          <ul className="divide-y divide-vx-red/12">
            {projects.map((project) => (
              <li key={project._id} className="py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-sm font-bold tracking-[0.06em] text-rose-50">
                    {project.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      handleCycleStatus(project._id, project.status)
                    }
                    title="Klik untuk mengubah status"
                    className={cn(
                      "vx-mono rounded-sm border px-2 py-0.5 text-[9px] tracking-[0.22em] transition-opacity hover:opacity-80",
                      STATUS_STYLES[project.status],
                    )}
                  >
                    {STATUS_LABEL[project.status]}
                  </button>
                  <span className="vx-mono text-[10px] text-muted-foreground">
                    {timeAgo(project.createdAt)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Hapus ${project.name}`}
                    onClick={() => handleRemove(project._id)}
                    className="ml-auto size-8 text-muted-foreground hover:bg-vx-red/10 hover:text-vx-red"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                {project.tagline && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {project.tagline}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <MeterBar value={project.progress} className="max-w-[220px]" />
                  <span className="vx-mono text-[10px] text-vx-red">
                    {project.progress}%
                  </span>
                  <div className="ml-auto flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="vx-mono border border-vx-red/20 bg-vx-red/5 px-1.5 py-0.5 text-[9px] tracking-[0.16em] text-rose-100/70"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </HudPanel>
  );
}

function TransmissionInbox({
  transmissions,
}: {
  transmissions: Doc<"transmissions">[] | undefined;
}) {
  const markRead = useMutation(api.transmissions.markRead);

  const handleMarkRead = async (id: Id<"transmissions">) => {
    try {
      await markRead({ transmissionId: id });
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal menandai pesan."));
    }
  };

  return (
    <HudPanel
      label="// TRANSMISSIONS"
      right={
        <span className="vx-mono text-[10px] text-vx-red">
          {transmissions?.filter((item) => item.status === "new").length ?? 0} NEW
        </span>
      }
      bodyClassName="p-5"
    >
      {transmissions === undefined ? (
        <div className="flex items-center gap-2 py-4 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span className="vx-mono text-[11px]">MEMUAT INBOX...</span>
        </div>
      ) : transmissions.length === 0 ? (
        <p className="vx-mono py-3 text-[11px] leading-5 text-muted-foreground">
          Inbox kosong. Pesan dari formulir kontak landing page akan muncul di
          sini.
        </p>
      ) : (
        <ul className="space-y-4">
          {transmissions.map((item) => (
            <li
              key={item._id}
              className={cn(
                "border-l-2 pl-3",
                item.status === "new"
                  ? "border-vx-red"
                  : "border-vx-red/20 opacity-70",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="vx-mono text-[11px] text-rose-100">
                  {item.name}
                </span>
                <span className="vx-mono text-[10px] text-muted-foreground">
                  {item.email}
                </span>
                <span className="vx-mono ml-auto text-[10px] text-muted-foreground">
                  {timeAgo(item.createdAt)}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {item.message}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span className="vx-mono inline-flex items-center gap-1.5 text-[9px] tracking-[0.2em] text-muted-foreground">
                  {item.status === "new" ? (
                    <Mail className="size-3" />
                  ) : (
                    <MailOpen className="size-3" />
                  )}
                  {item.status === "new" ? "NEW" : "READ"}
                </span>
                {item.status === "new" && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(item._id)}
                    className="vx-mono text-[9px] tracking-[0.2em] text-vx-red transition-opacity hover:opacity-70"
                  >
                    TANDAI DIBACA
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </HudPanel>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const projects = useQuery(api.projects.listMine);
  const transmissions = useQuery(api.transmissions.listRecent);

  const onlineCount =
    projects?.filter((project) => project.status === "online").length ?? 0;
  const newTransmissions =
    transmissions?.filter((item) => item.status === "new").length ?? 0;
  const initials = (user?.name ?? user?.email ?? "VX")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="vx-grid pointer-events-none fixed inset-0 opacity-25" />
      <ConsoleHeader />

      <main className="relative mx-auto w-full max-w-[1500px] px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel>// CONSOLE SESSION</SectionLabel>
            <h1 className="mt-4 font-display text-3xl font-black uppercase sm:text-4xl">
              WELCOME BACK,{" "}
              <span className="vx-glow text-vx-red">
                {user?.name?.toUpperCase() || "OPERATOR"}
              </span>
            </h1>
            <p className="vx-mono mt-3 text-[11px] tracking-[0.16em] text-muted-foreground">
              SISTEM SIAP // SEMUA MODUL BERJALAN NORMAL
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="vx-cut vx-mono border-vx-red/35 bg-transparent text-[11px] tracking-[0.22em] text-rose-100 hover:bg-vx-red/10 hover:text-white"
          >
            <Link to="/">KEMBALI KE LANDING</Link>
          </Button>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="// PROJECTS"
            value={String(projects?.length ?? 0).padStart(2, "0")}
            hint={`${onlineCount} ONLINE`}
          />
          <StatCard
            label="// TRANSMISSIONS"
            value={String(transmissions?.length ?? 0).padStart(2, "0")}
            hint={`${newTransmissions} BELUM DIBACA`}
          />
          <StatCard label="// UPTIME" value="99.98%" hint="30 HARI TERAKHIR" />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <ProjectRegistry projects={projects} />
          </div>

          <div className="space-y-5 xl:col-span-5">
            <HudPanel label="// IDENTITY" bodyClassName="p-5">
              <div className="flex items-center gap-4">
                <span className="vx-mono flex size-12 items-center justify-center rounded-sm border border-vx-red/40 bg-vx-red/10 text-sm font-bold text-vx-red">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold tracking-[0.08em] text-rose-50">
                    {user?.name || "VOCALOID OPERATOR"}
                  </p>
                  <p className="vx-mono truncate text-[11px] text-muted-foreground">
                    {user?.email ?? "anonymous session"}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3 border-t border-vx-red/15 pt-4">
                {[
                  { icon: UserRound, label: "ROLE", value: user?.role ?? "member" },
                  { icon: ShieldCheck, label: "ACCESS", value: "console:full" },
                  {
                    icon: FolderKanban,
                    label: "SLOT",
                    value: `${projects?.length ?? 0} / 12 project`,
                  },
                  {
                    icon: Inbox,
                    label: "INBOX",
                    value: `${transmissions?.length ?? 0} pesan`,
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <row.icon className="size-4 text-vx-red" />
                    <span className="vx-label">{row.label}</span>
                    <span className="vx-mono ml-auto text-[11px] text-rose-100/85">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </HudPanel>

            <SystemMonitor />

            <HudPanel label="// NEXT STEP" bodyClassName="p-5">
              <div className="flex items-center gap-4">
                <HexIcon className="h-11 w-11">
                  <LogoMark className="h-5 w-5" />
                </HexIcon>
                <p className="vx-mono text-[11px] leading-5 text-muted-foreground">
                  Tambahkan project, lalu tampilkan statusnya di landing page.
                  Semua data tersimpan realtime di Convex.
                </p>
              </div>
            </HudPanel>
          </div>
        </div>

        <div className="mt-5">
          <TransmissionInbox transmissions={transmissions} />
        </div>
      </main>
    </div>
  );
}
