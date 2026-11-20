import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/account/login")({
  component: AccountLoginPage,
  head: () => ({
    meta: [
      { title: "My Account — WAWA LA BEAUTY" },
      { name: "description", content: "Sign in or create your Wawa La Beauty account" },
    ],
  }),
});

function AccountLoginPage() {
  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState<"email" | "login" | "register">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // If already logged in, redirect
  if (user) {
    navigate({ to: "/" });
    return null;
  }

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStep("login");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    const { user: loggedIn } = useAuthStore.getState();
    if (loggedIn) navigate({ to: "/" });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(name, email, password);
    const { user: loggedIn } = useAuthStore.getState();
    if (loggedIn) navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-md mx-auto text-center">
          {/* Title */}
          <h1 className="font-serif text-3xl md:text-4xl tracking-wide mb-10">
            MY WAWA LA BEAUTY ACCOUNT
          </h1>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded text-left">
              {error}
            </div>
          )}

          {/* Step: email entry */}
          {step === "email" && (
            <>
              <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                OR
              </p>
              <h2 className="font-serif text-xl md:text-2xl tracking-wide mb-4">
                CONTINUE WITH YOUR EMAIL ADDRESS
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Sign in with your email and password or create a profile if you are new.
              </p>

              <form onSubmit={handleEmailContinue} className="space-y-5">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Email*"
                    className="w-full border border-ink/30 px-4 py-3.5 text-sm focus:outline-none focus:border-ink transition-colors bg-transparent placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-ink/40 text-cream px-8 py-3.5 text-[11px] tracking-[0.3em] uppercase hover:bg-ink/60 transition-colors"
                >
                  CONTINUE
                </button>
              </form>

              <div className="mt-12 pt-8 border-t border-ink/10">
                <h3 className="font-serif text-xl md:text-2xl tracking-wide mb-4">
                  JOIN MY WAWA LA BEAUTY
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Create an account to enjoy exclusive benefits and a personalised shopping experience.
                </p>
                <button
                  onClick={() => { clearError(); setStep("register"); }}
                  className="w-full border border-ink px-8 py-3.5 text-[11px] tracking-[0.3em] uppercase hover:bg-ink hover:text-cream transition-colors"
                >
                  CREATE AN ACCOUNT
                </button>
              </div>
            </>
          )}

          {/* Step: login (password) */}
          {step === "login" && (
            <>
              <h2 className="font-serif text-xl md:text-2xl tracking-wide mb-4">
                WELCOME BACK
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Enter your password to sign in as <strong>{email}</strong>
              </p>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Password*"
                    className="w-full border border-ink/30 px-4 py-3.5 text-sm focus:outline-none focus:border-ink transition-colors bg-transparent placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-ink text-cream px-8 py-3.5 text-[11px] tracking-[0.3em] uppercase hover:bg-ink/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "SIGNING IN..." : "SIGN IN"}
                </button>
              </form>

              <button
                onClick={() => { clearError(); setStep("email"); }}
                className="mt-6 text-sm underline underline-offset-4 text-muted-foreground hover:text-ink transition-colors"
              >
                Use a different email
              </button>
            </>
          )}

          {/* Step: register */}
          {step === "register" && (
            <>
              <h2 className="font-serif text-xl md:text-2xl tracking-wide mb-4">
                CREATE YOUR ACCOUNT
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Join Wawa La Beauty for a personalised luxury experience.
              </p>

              <form onSubmit={handleRegister} className="space-y-5 text-left">
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Full Name*"
                    className="w-full border border-ink/30 px-4 py-3.5 text-sm focus:outline-none focus:border-ink transition-colors bg-transparent placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Email*"
                    className="w-full border border-ink/30 px-4 py-3.5 text-sm focus:outline-none focus:border-ink transition-colors bg-transparent placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Password* (at least 6 characters)"
                    className="w-full border border-ink/30 px-4 py-3.5 text-sm focus:outline-none focus:border-ink transition-colors bg-transparent placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-ink text-cream px-8 py-3.5 text-[11px] tracking-[0.3em] uppercase hover:bg-ink/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                </button>
              </form>

              <button
                onClick={() => { clearError(); setStep("email"); }}
                className="mt-6 text-sm underline underline-offset-4 text-muted-foreground hover:text-ink transition-colors"
              >
                Already have an account? Sign in
              </button>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white text-ink px-6 md:px-10 pt-16 pb-8 border-t border-ink/10">
        <div className="flex flex-col md:flex-row justify-between gap-4 text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
          <p>© 2026 Wawa La Beauty. All rights reserved.</p>
          <p>Springs · Kwa-Thema · South Africa</p>
        </div>
      </footer>
    </div>
  );
}
