import { isOperatorEmail } from "@/convex/operatorEmails";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";

/** Layar penolakan untuk akun yang bukan owner toko. */
function OperatorDenied({
  email,
  onSignOut,
}: {
  email?: string | null;
  onSignOut: () => Promise<void>;
}) {
  const navigate = useNavigate();

  const handleSwitch = async () => {
    await onSignOut();
    navigate("/auth?returnTo=%2Fdashboard");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="vx-grid pointer-events-none absolute inset-0 opacity-20" />
      <Card className="vx-panel vx-cut relative w-full max-w-md gap-0 border-vx-red/30 bg-transparent py-0 shadow-none">
        <CardContent className="px-6 py-8 text-center">
          <ShieldAlert className="mx-auto size-8 text-vx-red" />
          <p className="vx-label mt-4">// AKSES DITOLAK</p>
          <h1 className="font-display mt-3 text-xl font-bold tracking-[0.12em]">
            AREA OWNER TERKUNCI
          </h1>
          <p className="vx-mono mt-3 text-[11px] leading-5 text-muted-foreground">
            Akun{" "}
            <span className="text-rose-100">
              {email && email.length > 0 ? email : "guest / tanpa email"}
            </span>{" "}
            tidak terdaftar sebagai operator toko. Console ini hanya bisa dibuka
            oleh owner VOCALOID-X.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="vx-cut-sm vx-mono h-10 gap-2 border-vx-red/35 bg-transparent text-[11px] tracking-[0.2em] text-rose-100 hover:bg-vx-red/10 hover:text-white"
            >
              <ArrowLeft className="size-4" />
              KEMBALI KE TOKO
            </Button>
            <Button
              variant="ghost"
              onClick={handleSwitch}
              className="vx-mono h-10 text-[11px] tracking-[0.18em] text-muted-foreground"
            >
              KELUAR / GANTI AKUN
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

/**
 * Gerbang untuk halaman console operator.
 * Wajib login DAN email-nya terdaftar di OPERATOR_EMAILS (lihat operatorEmails.ts).
 * Pengecekan yang sama juga dijalankan ulang di semua function Convex operator.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate to={`/auth?returnTo=${encodeURIComponent(returnTo)}`} replace />
    );
  }

  if (!isOperatorEmail(user?.email)) {
    return <OperatorDenied email={user?.email} onSignOut={signOut} />;
  }

  return children;
}
