import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { login, register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    clearError();
  };

  const switchMode = (newMode: "login" | "register") => {
    reset();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      await login(email, password);
    } else {
      await register(name, email, password);
    }
    // If login/register succeeded the store will have a user — close modal
    const { user } = useAuthStore.getState();
    if (user) {
      reset();
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      reset();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Sign in" : "Create account"}
    >
      <div className="relative w-full max-w-md mx-4 bg-cream text-ink p-8 md:p-10 shadow-2xl">
        {/* Close button */}
        <button
          onClick={() => { reset(); onClose(); }}
          className="absolute top-4 right-4 text-ink/50 hover:text-ink transition-colors text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>

        {/* Header */}
        <h2 className="font-serif text-3xl md:text-4xl font-light text-center mb-2">
          {mode === "login" ? "Welcome Back" : "Join Us"}
        </h2>
        <p className="text-center text-sm text-muted-foreground mb-8">
          {mode === "login"
            ? "Sign in to add items to your bag"
            : "Create an account to start shopping"}
        </p>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "register" && (
            <div>
              <label htmlFor="auth-name" className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-ink/20 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors"
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-ink/20 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-ink/20 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors"
              placeholder={mode === "register" ? "At least 6 characters" : "Your password"}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-ink text-cream px-8 py-4 text-[11px] tracking-[0.3em] uppercase hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => switchMode("register")}
                className="text-ink underline underline-offset-4 hover:text-gold transition-colors"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => switchMode("login")}
                className="text-ink underline underline-offset-4 hover:text-gold transition-colors"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
