import { LogoLockup, LogoMark } from "@/components/vocaloid/logo-mark";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import {
  DEVELOPER_NAME,
  INSTAGRAM_URL,
  ORDER_INTRO,
  STORE_TAGLINE,
  TIKTOK_URL,
  WHATSAPP_LABEL,
  YOUTUBE_URL,
  whatsappUrl,
} from "@/lib/brand";
import { scrollToSection } from "@/hooks/use-active-section";
import { cn } from "@/lib/utils";
import {
  Home,
  Instagram,
  Layers,
  ListOrdered,
  LogOut,
  Menu,
  MessageCircle,
  Music2,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

export const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "HOME", icon: Home },
  { id: "produk", label: "PRODUK", icon: ShoppingBag },
  { id: "keunggulan", label: "KEUNGGULAN", icon: ShieldCheck },
  { id: "cara-order", label: "CARA ORDER", icon: ListOrdered },
  { id: "order", label: "ORDER", icon: MessageCircle },
];

const DASHBOARD_HREF = "/dashboard";
const SIGN_IN_HREF = "/auth?returnTo=%2Fdashboard";

function OnlinePill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "vx-mono inline-flex items-center gap-2 text-[11px] tracking-[0.2em] text-[#7dffb0]",
        className,
      )}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#4ade80] opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-[#4ade80]" />
      </span>
      ONLINE
    </span>
  );
}

/** Fixed top command bar: logo, section nav, system status, operator controls. */
export function SiteNav({ active }: { active: string }) {
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleNav = (id: string) => scrollToSection(id);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-vx-red/20 bg-[#07040a]/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="shrink-0">
          <LogoLockup markClassName="h-7 w-7" className="[&_span]:text-base" />
        </Link>

        <nav className="mx-auto hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={cn(
                  "vx-mono relative px-4 py-2 text-[11px] tracking-[0.22em] transition-colors",
                  isActive
                    ? "text-vx-red"
                    : "text-muted-foreground hover:text-rose-100",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-px transition-opacity",
                    isActive
                      ? "bg-vx-red opacity-100 shadow-[0_0_12px_rgba(255,42,69,1)]"
                      : "opacity-0",
                  )}
                />
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <OnlinePill className="hidden sm:inline-flex" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="System settings"
                className="text-muted-foreground hover:text-vx-red"
              >
                <Settings className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="vx-label">
                // OPERATOR MENU
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate(DASHBOARD_HREF)}
              >
                <Layers className="mr-2 size-4" />
                Store console
              </DropdownMenuItem>
              {isAuthenticated ? (
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate(SIGN_IN_HREF)}
                >
                  <LogOut className="mr-2 size-4 rotate-180" />
                  Sign in
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            asChild
            size="sm"
            className="vx-mono vx-cut-sm hidden text-[11px] tracking-[0.18em] sm:inline-flex"
          >
            <Link to={isAuthenticated ? DASHBOARD_HREF : SIGN_IN_HREF}>
              {isAuthenticated ? "CONSOLE" : "SIGN IN"}
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation"
                className="text-rose-100 lg:hidden"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="border-vx-red/25 bg-[#0a0509] p-0"
            >
              <SheetHeader className="border-b border-vx-red/20 px-5 py-4">
                <SheetTitle className="flex items-center gap-2">
                  <LogoMark className="h-6 w-6" />
                  <span className="font-display text-sm tracking-[0.2em]">
                    NAVIGATION
                  </span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-3">
                {NAV_ITEMS.map((item) => (
                  <SheetClose asChild key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleNav(item.id)}
                      className={cn(
                        "vx-mono flex items-center gap-3 px-3 py-3 text-left text-[12px] tracking-[0.2em] transition-colors",
                        active === item.id
                          ? "text-vx-red"
                          : "text-muted-foreground hover:text-rose-100",
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </button>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto space-y-3 border-t border-vx-red/20 p-5">
                <OnlinePill />
                <SheetClose asChild>
                  <Button asChild className="vx-mono w-full text-[11px] tracking-[0.2em]">
                    <Link
                      to={isAuthenticated ? DASHBOARD_HREF : SIGN_IN_HREF}
                    >
                      {isAuthenticated ? "OPEN CONSOLE" : "SIGN IN"}
                    </Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-vx-red/60 to-transparent" />
    </header>
  );
}

/** Left HUD rail with system status, shown from xl upwards. */
export function SideRail({ active }: { active: string }) {
  const { user } = useAuth();

  return (
    <aside className="fixed top-16 bottom-0 left-0 z-40 hidden w-60 flex-col border-r border-vx-red/20 bg-[#08050b]/80 backdrop-blur-md xl:flex">
      <nav className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={cn(
                "group vx-mono relative flex items-center gap-3 px-3 py-3 text-[11px] tracking-[0.2em] transition-all",
                isActive
                  ? "bg-vx-red/12 text-vx-red"
                  : "text-muted-foreground hover:bg-vx-red/5 hover:text-rose-100",
              )}
            >
              <span
                className={cn(
                  "absolute inset-y-1 left-0 w-0.5 transition-all",
                  isActive
                    ? "bg-vx-red shadow-[0_0_12px_rgba(255,42,69,1)]"
                    : "bg-transparent",
                )}
              />
              <item.icon className="size-4" />
              {item.label}
              {isActive && (
                <span className="vx-mono ml-auto text-[10px] text-vx-red/70">
                  ›
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-5 p-5">
        <div className="flex justify-center py-4 text-vx-red">
          <LogoMark className="h-10 w-10 animate-vx-flicker" />
        </div>
        <div className="space-y-2 border-t border-vx-red/15 pt-4">
          <p className="vx-label">// SYSTEM STATUS</p>
          <OnlinePill className="text-[10px]" />
        </div>
        <div className="space-y-2 border-t border-vx-red/15 pt-4">
          <p className="vx-label">// USER</p>
          <p className="vx-mono text-[11px] tracking-[0.16em] text-vx-red">
            {user?.name?.toUpperCase() || "VOCALOID-X"}
          </p>
        </div>
        <div className="space-y-2 border-t border-vx-red/15 pt-4">
          <p className="vx-label">// DEVELOPER</p>
          <p className="vx-mono text-[11px] tracking-[0.16em] text-rose-100/85">
            {DEVELOPER_NAME}
          </p>
        </div>
      </div>
    </aside>
  );
}

const SOCIALS: { icon: LucideIcon; label: string; href: string }[] = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    href: whatsappUrl(`${ORDER_INTRO} paket FF PC.`),
  },
  { icon: Instagram, label: "Instagram", href: INSTAGRAM_URL },
  { icon: Music2, label: "TikTok", href: TIKTOK_URL },
  { icon: Youtube, label: "YouTube", href: YOUTUBE_URL },
].filter((social) => social.href.length > 0);

export function SiteFooter() {
  return (
    <footer className="relative border-t border-vx-red/20 bg-[#07040a]/90">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-vx-red/70 to-transparent" />
      <div className="flex flex-col gap-8 px-6 py-10 lg:flex-row lg:items-center lg:justify-between">
        {/* storefront footer */}
        <div className="flex items-center gap-5">
          <LogoMark className="h-9 w-9" />
          <div>
            <LogoLockup />
            <p className="vx-mono mt-2 text-[11px] tracking-[0.2em] text-muted-foreground">
              {STORE_TAGLINE} <span className="text-vx-red">//</span> WA{" "}
              {WHATSAPP_LABEL}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="vx-cut-sm flex size-9 items-center justify-center border border-vx-red/25 bg-vx-red/5 text-muted-foreground transition-colors hover:border-vx-red/60 hover:text-vx-red"
            >
              <social.icon className="size-4" />
            </a>
          ))}
        </div>

        <div className="vx-mono text-[11px] tracking-[0.14em] text-muted-foreground lg:text-right">
          <p>
            © 2026 VOCALOID-X.{" "}
            <span className="text-vx-red/80">ALL RIGHTS RESERVED.</span>
          </p>
          <p className="mt-1.5">
            DEVELOPED BY <span className="text-vx-red">{DEVELOPER_NAME}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
