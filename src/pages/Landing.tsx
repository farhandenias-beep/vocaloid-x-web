import { CodeConsole } from "@/components/vocaloid/code-console";
import { HeroScene } from "@/components/vocaloid/hero-scene";
import {
  CornerBrackets,
  HexIcon,
  HudPanel,
  MeterBar,
  SectionLabel,
} from "@/components/vocaloid/hud";
import {
  SideRail,
  SiteFooter,
  SiteNav,
} from "@/components/vocaloid/site-chrome";
import { SystemMonitor } from "@/components/vocaloid/system-monitor";
import { SystemTerminal } from "@/components/vocaloid/system-terminal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActiveSection, scrollToSection } from "@/hooks/use-active-section";
import { DEVELOPER_NAME } from "@/lib/brand";
import { api } from "@/convex/_generated/api";
import { cn, formatConvexError } from "@/lib/utils";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  ChevronDown,
  Clock,
  Code2,
  Cpu,
  Globe,
  Lock,
  Mail,
  MapPin,
  Rocket,
  Send,
  ShieldCheck,
  Terminal,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

const SECTION_IDS = ["home", "about", "features", "projects", "contact"];

const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

const PILLARS: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "MODERN CODE",
    description:
      "Menggunakan teknologi terbaru untuk performa maksimal dan efisiensi tinggi.",
    icon: Code2,
  },
  {
    title: "AI INTEGRATION",
    description:
      "Menggabungkan kecerdasan buatan untuk pengalaman yang lebih pintar dan adaptif.",
    icon: BrainCircuit,
  },
  {
    title: "HIGH SECURITY",
    description:
      "Sistem keamanan tingkat tinggi untuk melindungi data dan privasi Anda.",
    icon: ShieldCheck,
  },
  {
    title: "FUTURE READY",
    description:
      "Selalu berkembang dan siap menghadapi tantangan di masa depan.",
    icon: Rocket,
  },
];

const SYSTEMS: {
  index: string;
  name: string;
  icon: LucideIcon;
  summary: string;
  points: string[];
  stat: string;
}[] = [
  {
    index: "01",
    name: "GENESIS ENGINE",
    icon: Cpu,
    summary:
      "Runtime modular yang menjaga seluruh dunia VOCALOID-X tetap sinkron dalam satu tarikan napas.",
    points: [
      "Realtime sync ke semua perangkat operator",
      "Deploy tanpa downtime di tengah malam",
      "Skalabilitas otomatis mengikuti beban",
    ],
    stat: "latensi rata-rata 42ms",
  },
  {
    index: "02",
    name: "NEURAL SYNC",
    icon: BrainCircuit,
    summary:
      "Kecerdasan buatan yang belajar dari setiap interaksi untuk memahami konteks, bukan hanya perintah.",
    points: [
      "Model multimodal untuk teks, suara, dan citra",
      "Konteks percakapan jangka panjang",
      "Persona yang bisa diatur per project",
    ],
    stat: "12.4M parameter aktif",
  },
  {
    index: "03",
    name: "FORTRESS LAYER",
    icon: ShieldCheck,
    summary:
      "Perlindungan berlapis untuk data, identitas, dan setiap transmisi yang melewati sistem.",
    points: [
      "Enkripsi end-to-end di semua kanal",
      "Audit log realtime tanpa celah",
      "Kontrol akses berbasis peran",
    ],
    stat: "0 insiden tercatat",
  },
];

const PROJECTS: {
  name: string;
  tagline: string;
  stack: string[];
  status: "ONLINE" | "BETA" | "LOCKED";
  progress: number;
}[] = [
  {
    name: "VOCALOID-X CORE",
    tagline:
      "Kernel utama yang menyatukan AI, manusia, dan data realtime dalam satu kesadaran digital.",
    stack: ["TYPESCRIPT", "CONVEX", "REACT"],
    status: "ONLINE",
    progress: 94,
  },
  {
    name: "SHADOW.NEXUS",
    tagline:
      "Jaringan komunitas anonim dengan enkripsi penuh dan identitas terdesentralisasi.",
    stack: ["VITE", "WEBCRYPTO", "P2P"],
    status: "BETA",
    progress: 61,
  },
  {
    name: "NEURAL-VOICE",
    tagline:
      "Sintesis suara realtime dengan emosi adaptif untuk karakter digital apa pun.",
    stack: ["ONNX", "WEBAUDIO"],
    status: "BETA",
    progress: 48,
  },
  {
    name: "ABYSS.WALLET",
    tagline:
      "Dompet digital dengan verifikasi biometrik dan pemulihan sosial tanpa seed phrase.",
    stack: ["RUST", "WASM"],
    status: "LOCKED",
    progress: 22,
  },
];

const STATUS_STYLES: Record<string, string> = {
  ONLINE: "border-[#4ade80]/40 text-[#7dffb0] bg-[#4ade80]/10",
  BETA: "border-vx-ember/40 text-vx-ember bg-vx-ember/10",
  LOCKED: "border-vx-red/35 text-vx-red bg-vx-red/10",
};

function Hero() {
  return (
    <section
      id="home"
      className="relative isolate flex min-h-[100svh] scroll-mt-20 flex-col justify-center overflow-hidden pt-16"
    >
      <HeroScene />
      <div className="vx-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto w-full max-w-[1600px] px-5 py-14 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-10 xl:grid-cols-12">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
            }}
            className="xl:col-span-6"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, x: -18 }, show: { opacity: 1, x: 0 } }}
              className="vx-cut-sm inline-flex items-center gap-2 border border-vx-red/35 bg-vx-red/5 px-3 py-1.5"
            >
              <span className="vx-mono text-[10px] tracking-[0.3em] text-vx-red">
                //
              </span>
              <span className="vx-mono text-[10px] tracking-[0.3em] text-rose-100/90">
                WELCOME TO
              </span>
            </motion.div>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6 }}
              className="mt-6 font-display text-5xl leading-[0.95] font-black tracking-tight uppercase sm:text-6xl lg:text-7xl xl:text-[5.2rem]"
            >
              <span className="animate-vx-flicker bg-gradient-to-b from-white via-rose-200 to-vx-red bg-clip-text text-transparent drop-shadow-[0_0_38px_rgba(255,42,69,0.55)]">
                VOCALOID-X
              </span>
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              className="mt-5 font-display text-base font-bold tracking-[0.32em] text-rose-100 sm:text-lg"
            >
              CODE <span className="text-vx-red">×</span> DEMON{" "}
              <span className="text-vx-red">×</span> FUTURE
            </motion.p>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              className="mt-6 max-w-xl text-base leading-relaxed text-rose-100/70 sm:text-lg"
            >
              Bukan sekadar kode, tapi sebuah dunia di mana teknologi bertemu
              dengan kegelapan. VOCALOID-X adalah simbol dari ambisi, inovasi,
              dan kekuatan tanpa batas.
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Button
                asChild
                size="lg"
                className="vx-cut vx-mono gap-2 px-7 text-[11px] tracking-[0.24em] shadow-[0_0_36px_-8px_rgba(255,42,69,0.9)]"
              >
                <Link to="/dashboard">
                  EXPLORE NOW
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => scrollToSection("about")}
                className="vx-cut vx-mono border-vx-red/40 bg-transparent px-7 text-[11px] tracking-[0.24em] text-rose-100 hover:border-vx-red/80 hover:bg-vx-red/10 hover:text-white"
              >
                LEARN MORE
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="space-y-5 xl:col-span-4 xl:col-start-9"
          >
            <CodeConsole />
            <SystemMonitor />
            <div className="vx-cut-sm flex items-center justify-between border border-vx-red/25 bg-[#0a0509]/80 px-4 py-2.5">
              <span className="vx-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                BUILD v1.0.0
              </span>
              <span className="vx-mono text-[10px] tracking-[0.2em] text-vx-red">
                FUTURE: UNLIMITED
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollToSection("about")}
        className="vx-mono absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.3em] text-muted-foreground transition-colors hover:text-vx-red lg:flex"
      >
        <span className="flex size-8 items-center justify-center rounded-md border border-vx-red/40 text-vx-red">
          <ChevronDown className="size-4 animate-bounce" />
        </span>
        SCROLL DOWN
      </button>
    </section>
  );
}

function About() {
  return (
    <section
      id="about"
      className="relative scroll-mt-20 border-t border-vx-red/15 bg-[#07040a] py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-10">
          <motion.div {...reveal} className="lg:col-span-5">
            <SectionLabel>// ABOUT VOCALOID-X</SectionLabel>
            <h2 className="mt-5 font-display text-3xl leading-tight font-black uppercase sm:text-4xl lg:text-[2.9rem]">
              MORE THAN JUST <span className="vx-glow text-vx-red">CODE</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-rose-100/65">
              VOCALOID-X adalah sebuah project yang menggabungkan teknologi,
              kreativitas, dan dunia digital. Kami percaya bahwa masa depan
              bukan hanya tentang manusia, tapi juga tentang bagaimana kita
              berkolaborasi dengan AI dan sistem cerdas.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => scrollToSection("features")}
              className="vx-cut vx-mono mt-8 gap-2 border-vx-red/40 bg-transparent px-6 text-[11px] tracking-[0.22em] text-rose-100 hover:border-vx-red/80 hover:bg-vx-red/10 hover:text-white"
            >
              TENTANG KAMI
              <ArrowRight className="size-4" />
            </Button>
            <p className="vx-mono mt-7 text-[10px] tracking-[0.26em] text-muted-foreground">
              DEVELOPED BY <span className="text-vx-red">{DEVELOPER_NAME}</span>
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7 xl:grid-cols-4">
            {PILLARS.map((pillar, index) => (
              <motion.article
                key={pillar.title}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.08 }}
                className="vx-panel vx-cut group relative p-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <CornerBrackets className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <HexIcon>
                  <pillar.icon className="size-5" />
                </HexIcon>
                <h3 className="vx-mono mt-5 text-[12px] font-bold tracking-[0.14em] text-rose-50">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section
      id="features"
      className="relative scroll-mt-20 border-t border-vx-red/15 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">
        <motion.div
          {...reveal}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <SectionLabel>// CORE SYSTEMS</SectionLabel>
            <h2 className="mt-5 font-display text-3xl leading-tight font-black uppercase sm:text-4xl lg:text-[2.9rem]">
              TIGA LAPISAN <span className="vx-glow text-vx-red">KEKUATAN</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Setiap lapisan dirancang untuk saling menopang: mesin yang bergerak
            cepat, kecerdasan yang memahami konteks, dan benteng yang tidak bisa
            ditembus.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            {SYSTEMS.map((system, index) => (
              <motion.article
                key={system.name}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.08 }}
                className="vx-panel vx-cut group p-6"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <HexIcon className="h-11 w-11">
                    <system.icon className="size-5" />
                  </HexIcon>
                  <div>
                    <p className="vx-mono text-[10px] tracking-[0.3em] text-vx-red/80">
                      SYS-{system.index}
                    </p>
                    <h3 className="font-display text-lg font-bold tracking-[0.08em] text-rose-50">
                      {system.name}
                    </h3>
                  </div>
                  <span className="vx-mono ml-auto hidden text-[10px] tracking-[0.2em] text-muted-foreground sm:block">
                    {system.stat}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-rose-100/65">
                  {system.summary}
                </p>
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {system.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <Zap className="mt-0.5 size-3.5 shrink-0 text-vx-red" />
                      <span className="vx-mono text-[11px] leading-5 text-muted-foreground">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>

          <motion.div {...reveal} className="lg:col-span-5">
            <SystemTerminal />
            <HudPanel
              label="// PERFORMANCE"
              className="mt-5"
              bodyClassName="space-y-3 px-4 py-4"
            >
              {[
                { label: "UPTIME", value: 99.98, display: "99.98%" },
                { label: "SECURITY", value: 96, display: "A+" },
                { label: "SCALABILITY", value: 88, display: "∞" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="vx-mono w-24 text-[10px] tracking-[0.18em] text-muted-foreground">
                    {row.label}
                  </span>
                  <MeterBar value={row.value} className="flex-1" />
                  <span className="vx-mono w-12 text-right text-[10px] text-vx-red">
                    {row.display}
                  </span>
                </div>
              ))}
            </HudPanel>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section
      id="projects"
      className="relative scroll-mt-20 border-t border-vx-red/15 bg-[#07040a] py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">
        <motion.div
          {...reveal}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <SectionLabel>// PROJECTS</SectionLabel>
            <h2 className="mt-5 font-display text-3xl leading-tight font-black uppercase sm:text-4xl lg:text-[2.9rem]">
              ACTIVE <span className="vx-glow text-vx-red">OPERATIONS</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Sebagian project sudah berjalan, sebagian masih terkunci di dalam
            lab. Daftarkan project Anda sendiri dari console operator.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PROJECTS.map((project, index) => (
            <motion.article
              key={project.name}
              {...reveal}
              transition={{ ...reveal.transition, delay: index * 0.07 }}
              className="vx-panel vx-cut group flex flex-col p-5 transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "vx-mono rounded-sm border px-2 py-0.5 text-[9px] tracking-[0.24em]",
                    STATUS_STYLES[project.status],
                  )}
                >
                  {project.status}
                </span>
                <Terminal className="size-4 text-vx-red/60" />
              </div>

              <h3 className="mt-5 font-display text-base font-bold tracking-[0.06em] text-rose-50">
                {project.name}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {project.tagline}
              </p>

              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="vx-mono text-[9px] tracking-[0.2em] text-muted-foreground">
                    PROGRESS
                  </span>
                  <span className="vx-mono text-[10px] text-vx-red">
                    {project.progress}%
                  </span>
                </div>
                <MeterBar value={project.progress} />
              </div>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="vx-mono border border-vx-red/20 bg-vx-red/5 px-1.5 py-0.5 text-[9px] tracking-[0.16em] text-rose-100/70"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          {...reveal}
          className="vx-panel vx-cut mt-8 flex flex-col items-center justify-between gap-5 p-6 sm:flex-row"
        >
          <div className="flex items-center gap-4">
            <HexIcon className="h-11 w-11">
              <Activity className="size-5" />
            </HexIcon>
            <div>
              <p className="font-display text-sm font-bold tracking-[0.1em] text-rose-50">
                PUNYA PROJECT SENDIRI?
              </p>
              <p className="vx-mono mt-1 text-[11px] text-muted-foreground">
                Buka console operator dan daftarkan dalam hitungan detik.
              </p>
            </div>
          </div>
          <Button
            asChild
            className="vx-cut vx-mono gap-2 px-6 text-[11px] tracking-[0.22em]"
          >
            <Link to="/dashboard">
              BUKA CONSOLE
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function ContactForm() {
  const submitTransmission = useMutation(api.transmissions.submit);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");

    setIsSending(true);
    setError(null);
    try {
      await submitTransmission({ name, email, message });
      form.reset();
      toast.success("TRANSMISI TERKIRIM // Operator akan segera merespon.");
    } catch (err) {
      setError(formatConvexError(err, "Gagal mengirim transmisi. Coba lagi."));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="vx-label block">// NAMA</span>
          <Input
            name="name"
            required
            minLength={2}
            disabled={isSending}
            placeholder="Vocaloid Zero"
            className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm placeholder:text-muted-foreground/60 focus-visible:border-vx-red/70"
          />
        </label>
        <label className="block space-y-2">
          <span className="vx-label block">// EMAIL</span>
          <Input
            name="email"
            type="email"
            required
            disabled={isSending}
            placeholder="operator@vocaloid-x.dev"
            className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm placeholder:text-muted-foreground/60 focus-visible:border-vx-red/70"
          />
        </label>
      </div>
      <label className="block space-y-2">
        <span className="vx-label block">// PESAN</span>
        <Textarea
          name="message"
          required
          minLength={10}
          rows={5}
          disabled={isSending}
          placeholder="Ceritakan project atau ide yang ingin Anda bangun..."
          className="vx-mono vx-cut-sm border-vx-red/25 bg-[#0a0509] text-sm placeholder:text-muted-foreground/60 focus-visible:border-vx-red/70"
        />
      </label>

      {error && (
        <p className="vx-mono border border-vx-red/40 bg-vx-red/10 px-3 py-2 text-[11px] tracking-[0.1em] text-rose-200">
          ERROR // {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSending}
        className="vx-cut vx-mono w-full gap-2 text-[11px] tracking-[0.24em] shadow-[0_0_36px_-10px_rgba(255,42,69,0.9)] sm:w-auto sm:px-8"
      >
        {isSending ? "MENGIRIM..." : "KIRIM TRANSMISI"}
        <Send className="size-4" />
      </Button>
    </form>
  );
}

function Contact() {
  return (
    <section
      id="contact"
      className="relative scroll-mt-20 border-t border-vx-red/15 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <motion.div {...reveal} className="lg:col-span-7">
            <HudPanel label="// CONTACT CHANNEL" bodyClassName="p-6 sm:p-8">
              <SectionLabel>// KIRIM TRANSMISI</SectionLabel>
              <h2 className="mt-5 font-display text-3xl leading-tight font-black uppercase sm:text-4xl">
                BICARA DENGAN <span className="vx-glow text-vx-red">SISTEM</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-rose-100/65">
                Punya ide project, kolaborasi, atau pertanyaan teknis? Kirim
                transmisi Anda — pesannya langsung masuk ke console operator
                VOCALOID-X.
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </HudPanel>
          </motion.div>

          <motion.div {...reveal} className="space-y-5 lg:col-span-5">
            <HudPanel
              label="// CHANNEL INFO"
              bodyClassName="space-y-4 px-5 py-5"
            >
              {[
                { icon: Mail, label: "EMAIL", value: "hello@vocaloid-x.dev" },
                { icon: Clock, label: "RESPON", value: "< 24 jam kerja" },
                { icon: MapPin, label: "BASE", value: "Subang, Jawa Barat" },
                { icon: Globe, label: "ZONA WAKTU", value: "GMT+7 // 24/7 online" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center border border-vx-red/25 bg-vx-red/5 text-vx-red vx-cut-sm">
                    <row.icon className="size-4" />
                  </span>
                  <div>
                    <p className="vx-label">{row.label}</p>
                    <p className="vx-mono text-[12px] text-rose-100/85">
                      {row.value}
                    </p>
                  </div>
                </div>
              ))}
            </HudPanel>

            <HudPanel label="// SECURITY" bodyClassName="px-5 py-5">
              <div className="flex items-center gap-3">
                <Lock className="size-4 text-vx-red" />
                <p className="vx-mono text-[11px] leading-5 text-muted-foreground">
                  Setiap transmisi terenkripsi dan hanya dapat dibaca oleh
                  operator yang terautentikasi.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/auth?returnTo=%2Fdashboard"
                  className="vx-mono vx-cut-sm border border-vx-red/30 bg-vx-red/5 px-3 py-1.5 text-[10px] tracking-[0.2em] text-rose-100 transition-colors hover:border-vx-red/70 hover:text-vx-red"
                >
                  MASUK SEBAGAI OPERATOR
                </Link>
                <Link
                  to="/dashboard"
                  className="vx-mono vx-cut-sm border border-vx-red/30 bg-vx-red/5 px-3 py-1.5 text-[10px] tracking-[0.2em] text-rose-100 transition-colors hover:border-vx-red/70 hover:text-vx-red"
                >
                  LIHAT CONSOLE
                </Link>
              </div>
            </HudPanel>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const active = useActiveSection(SECTION_IDS);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <SiteNav active={active} />
      <SideRail active={active} />
      <main className="xl:pl-60">
        <Hero />
        <About />
        <Features />
        <Projects />
        <Contact />
        <SiteFooter />
      </main>
    </div>
  );
}
