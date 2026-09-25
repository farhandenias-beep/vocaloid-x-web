import { HeroScene } from "@/components/vocaloid/hero-scene";
import { LogoMark } from "@/components/vocaloid/logo-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

const fieldClass =
  "vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm placeholder:text-muted-foreground/60 focus-visible:border-vx-red/70";

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengirim kode verifikasi. Coba lagi.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Kode verifikasi yang Anda masukkan salah.");
      setIsLoading(false);
      setOtp("");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <HeroScene className="opacity-45" />
      <div className="vx-grid pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-8 flex flex-col items-center gap-3 text-center"
          >
            <LogoMark className="h-12 w-12 animate-vx-flicker" />
            <span className="font-display text-lg font-extrabold tracking-[0.16em]">
              VOCALOID<span className="text-vx-red">-X</span>
            </span>
            <span className="vx-label">// AUTH TERMINAL</span>
          </Link>

          <Card className="vx-panel vx-cut gap-0 border-vx-red/25 bg-transparent py-0 shadow-none">
            {step === "signIn" ? (
              <>
                <div className="border-b border-vx-red/20 px-6 py-5 text-center">
                  <p className="vx-label">// IDENTIFIKASI OPERATOR</p>
                  <h1 className="font-display mt-3 text-xl font-bold tracking-[0.1em]">
                    MASUK / DAFTAR
                  </h1>
                  <p className="vx-mono mt-2 text-[11px] leading-5 text-muted-foreground">
                    Masukkan email untuk menerima kode akses.
                  </p>
                </div>
                <form onSubmit={handleEmailSubmit}>
                  <CardContent className="px-6 py-6">
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute top-3.5 left-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="email"
                          placeholder="name@example.com"
                          type="email"
                          className={`${fieldClass} pl-9`}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        disabled={isLoading}
                        className="vx-cut-sm size-11 border-vx-red/35 text-vx-red hover:bg-vx-red/10 hover:text-white"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {error && (
                      <p className="vx-mono mt-3 border border-vx-red/40 bg-vx-red/10 px-3 py-2 text-[11px] text-rose-200">
                        ERROR // {error}
                      </p>
                    )}

                    <p className="vx-mono mt-5 border-l-2 border-vx-red/30 pl-3 text-[10px] leading-5 text-muted-foreground">
                      Console operator bersifat privat. Hanya email owner toko
                      yang bisa membuka katalog, QRIS, dan daftar order.
                    </p>
                  </CardContent>
                </form>
              </>
            ) : (
              <>
                <div className="border-b border-vx-red/20 px-6 py-5 text-center">
                  <p className="vx-label">// VERIFIKASI</p>
                  <h1 className="font-display mt-3 text-xl font-bold tracking-[0.1em]">
                    CEK EMAIL ANDA
                  </h1>
                  <p className="vx-mono mt-2 text-[11px] leading-5 text-muted-foreground">
                    Kode akses dikirim ke {step.email}
                  </p>
                </div>
                <form onSubmit={handleOtpSubmit}>
                  <CardContent className="px-6 py-6">
                    <input type="hidden" name="email" value={step.email} />
                    <input type="hidden" name="code" value={otp} />

                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            otp.length === 6 &&
                            !isLoading
                          ) {
                            const form = (e.target as HTMLElement).closest(
                              "form",
                            );
                            if (form) form.requestSubmit();
                          }
                        }}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {error && (
                      <p className="vx-mono mt-4 border border-vx-red/40 bg-vx-red/10 px-3 py-2 text-center text-[11px] text-rose-200">
                        ERROR // {error}
                      </p>
                    )}
                    <p className="vx-mono mt-5 text-center text-[11px] text-muted-foreground">
                      Tidak menerima kode?{" "}
                      <button
                        type="button"
                        onClick={() => setStep("signIn")}
                        className="text-vx-red underline-offset-4 hover:underline"
                      >
                        Kirim ulang
                      </button>
                    </p>
                  </CardContent>
                  <CardContent className="flex flex-col gap-3 border-t border-vx-red/20 px-6 py-5">
                    <Button
                      type="submit"
                      disabled={isLoading || otp.length !== 6}
                      className="vx-cut vx-mono h-11 w-full gap-2 text-[11px] tracking-[0.2em]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          MEMVERIFIKASI...
                        </>
                      ) : (
                        <>
                          VERIFIKASI KODE
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep("signIn")}
                      disabled={isLoading}
                      className="vx-mono w-full text-[11px] tracking-[0.16em] text-muted-foreground"
                    >
                      Gunakan email lain
                    </Button>
                  </CardContent>
                </form>
              </>
            )}

            <div className="vx-mono border-t border-vx-red/20 bg-vx-red/5 px-6 py-4 text-center text-[10px] tracking-[0.14em] text-muted-foreground">
              SECURED BY <span className="text-vx-red">FARHANLVLY</span>
            </div>
          </Card>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/"
              className="vx-mono vx-cut-sm border border-vx-red/25 bg-vx-red/5 px-3 py-1.5 text-[10px] tracking-[0.2em] text-rose-100 transition-colors hover:border-vx-red/70 hover:text-vx-red"
            >
              LANDING PAGE
            </Link>
            <Link
              to="/dashboard"
              className="vx-mono vx-cut-sm border border-vx-red/25 bg-vx-red/5 px-3 py-1.5 text-[10px] tracking-[0.2em] text-rose-100 transition-colors hover:border-vx-red/70 hover:text-vx-red"
            >
              OPERATOR CONSOLE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
