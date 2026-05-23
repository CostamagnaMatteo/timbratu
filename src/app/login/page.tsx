"use client";

import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ── design tokens ────────────────────────────────────────────────────────
const INK    = "#1f1d1a";
const PAPER  = "#f8f3e6";
const MUTED  = "#8a8579";
const ACCENT = "#d44a2c";
const OK     = "#3f7d4f";

type Tipo = "login" | "registra";
type Step = "scelta" | "email" | "verifica";

// ── primitives ────────────────────────────────────────────────────────────

function Scribble({ w = 130 }: { w?: number }) {
  return (
    <svg width={w} height={5} viewBox={`0 0 ${w} 5`} className="block mx-auto">
      <path
        d={`M2 3 Q ${w * 0.25} 1 ${w * 0.5} 3 T ${w - 2} 3`}
        stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round"
      />
    </svg>
  );
}

function GoogleMark() {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full border-[1.5px] border-[#1f1d1a] bg-[#f8f3e6] leading-none shrink-0"
      style={{ width: 22, height: 22, fontFamily: "var(--font-caveat)", fontSize: 15, fontWeight: 700, color: INK }}
    >G</span>
  );
}

function CTA({
  children, onClick, type = "button", disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full py-[10px] flex items-center justify-center gap-2 bg-[#1f1d1a] text-[#f8f3e6] border-2 border-[#1f1d1a] rounded-[10px] shadow-[2px_2px_0_rgba(31,29,26,0.2)] disabled:opacity-50 transition-opacity"
      style={{ fontFamily: "var(--font-caveat)", fontSize: 24, fontWeight: 700 }}
    >
      {children}
    </button>
  );
}

function OutlineBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-[9px] flex items-center justify-center gap-2 border-[1.5px] border-[#1f1d1a] rounded-[10px] bg-[#f8f3e6] shadow-[2px_2px_0_rgba(31,29,26,0.08)]"
      style={{ fontFamily: "var(--font-caveat)", fontSize: 22, fontWeight: 700, color: INK }}
    >
      {children}
    </button>
  );
}

function Sketchbox({ children, dashed = false, className = "" }: {
  children: React.ReactNode;
  dashed?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`border-2 border-[#1f1d1a] rounded-[10px] bg-[#f8f3e6] shadow-[2px_2px_0_rgba(31,29,26,0.13)] ${dashed ? "border-dashed" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

function Banner({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f7d9d2] border-[1.5px] border-[#d44a2c] rounded-lg px-3 py-2 text-[#d44a2c] text-[12px] leading-relaxed">
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-2 text-[11px]" style={{ color: MUTED }}>
      <div className="flex-1 border-t border-dashed border-[#1f1d1a] opacity-50" />
      <span>oppure</span>
      <div className="flex-1 border-t border-dashed border-[#1f1d1a] opacity-50" />
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder, hint, error, suffix, onSuffixClick,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  suffix?: string;
  onSuffixClick?: () => void;
}) {
  const filled = value !== "";
  return (
    <div>
      <div
        className="text-[10px] uppercase mb-1"
        style={{ letterSpacing: "0.6px", color: INK }}
      >
        {label} <span style={{ color: ACCENT }}>*</span>
      </div>
      <div
        className="flex items-center rounded-lg bg-[#f8f3e6] px-3 min-h-[36px]"
        style={{
          border: `${error ? 2 : 1.5}px ${filled || error ? "solid" : "dashed"} ${error ? ACCENT : INK}`,
          boxShadow: error ? `2px 2px 0 ${ACCENT}33` : "none",
        }}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none py-1.5"
          style={{
            fontFamily: "var(--font-patrick-hand)",
            fontSize: 14,
            color: INK,
          }}
        />
        {suffix && (
          <button
            type="button"
            onClick={onSuffixClick}
            className="shrink-0 ml-2"
            style={{ fontSize: 11, color: MUTED }}
          >
            {suffix}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[11px] mt-0.5" style={{ color: ACCENT }}>⚠ {error}</p>
      )}
      {!error && hint && (
        <p className="text-[11px] mt-0.5" style={{ color: MUTED }}>{hint}</p>
      )}
    </div>
  );
}

function Check({ checked, onChange, children }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 text-[12px] leading-snug" style={{ color: INK }}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="w-4 h-4 mt-0.5 border-[1.5px] rounded-sm bg-[#f8f3e6] flex items-center justify-center shrink-0 font-bold text-[11px]"
        style={{ borderColor: INK }}
      >
        {checked ? "✓" : ""}
      </button>
      <span>{children}</span>
    </div>
  );
}

// ── screens ───────────────────────────────────────────────────────────────

function ScreenSceltaLogin({
  onGoogle, onEmail, onRegistra, loading,
}: {
  onGoogle: () => void;
  onEmail: () => void;
  onRegistra: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="mt-6 text-center">
        <div
          className="leading-none"
          style={{ fontFamily: "var(--font-caveat)", fontSize: 44, fontWeight: 700, color: INK, transform: "rotate(-2deg)" }}
        >
          Timbratuu
        </div>
        <Scribble w={160} />
        <p className="mt-3 text-[14px]" style={{ color: MUTED }}>bentornato</p>
      </div>

      <div className="flex-1" />

      <p className="text-center text-[12px] uppercase" style={{ letterSpacing: 1, color: MUTED }}>
        come vuoi accedere?
      </p>

      <CTA onClick={onGoogle} disabled={loading}>
        <GoogleMark /> continua con Google
      </CTA>

      <Divider />

      <OutlineBtn onClick={onEmail}>
        email e password <span style={{ color: MUTED }}>›</span>
      </OutlineBtn>

      <div className="flex-1" />

      <p className="text-center text-[13px]" style={{ color: INK }}>
        non hai un account?{" "}
        <button
          type="button"
          onClick={onRegistra}
          className="underline font-bold"
          style={{ color: INK }}
        >
          crea account
        </button>
      </p>

      <p className="text-center text-[11px]" style={{ color: MUTED }}>
        <a href="#" className="underline">privacy</a>
        <span className="mx-1.5">·</span>
        <a href="#" className="underline">termini</a>
      </p>
    </div>
  );
}

function ScreenEmailLogin({
  email, password, showPass, ricordami, errore, loading,
  onEmail, onPassword, onTogglePass, onRicordami, onSubmit, onBack,
}: {
  email: string;
  password: string;
  showPass: boolean;
  ricordami: boolean;
  errore: string | null;
  loading: boolean;
  onEmail: (v: string) => void;
  onPassword: (v: string) => void;
  onTogglePass: () => void;
  onRicordami: (v: boolean) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
    >
      <button
        type="button"
        onClick={onBack}
        className="text-left text-[13px]"
        style={{ color: MUTED }}
      >
        ‹ indietro
      </button>

      <div className="text-center">
        <div
          style={{ fontFamily: "var(--font-caveat)", fontSize: 30, fontWeight: 700, color: INK, transform: "rotate(-1deg)" }}
        >
          accedi con email
        </div>
        <Scribble w={140} />
        <p className="mt-2 text-[12px]" style={{ color: MUTED }}>inserisci le tue credenziali</p>
      </div>

      <Field
        label="email"
        value={email}
        onChange={onEmail}
        type="email"
        placeholder="mario.rossi@comune.it"
      />
      <Field
        label="password"
        value={password}
        onChange={onPassword}
        type={showPass ? "text" : "password"}
        placeholder="••••••••"
        suffix={showPass ? "nascondi" : "mostra"}
        onSuffixClick={onTogglePass}
      />

      <div className="flex items-center justify-between text-[12px]">
        <Check checked={ricordami} onChange={onRicordami}>
          ricordami
        </Check>
        <a href="#" className="underline" style={{ color: INK }}>password dimenticata?</a>
      </div>

      <CTA type="submit" disabled={loading}>
        {loading ? "..." : "accedi"}
      </CTA>

      {errore && <Banner><b>credenziali non valide.</b> {errore}</Banner>}

      <div className="flex-1" />

      <p className="text-center text-[12px]">
        <button type="button" onClick={onBack} className="underline" style={{ color: MUTED }}>
          ‹ usa un altro metodo
        </button>
      </p>
    </form>
  );
}

function ScreenSceltaRegistra({
  onGoogle, onEmail, onLogin, loading,
}: {
  onGoogle: () => void;
  onEmail: () => void;
  onLogin: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onLogin}
        className="text-left text-[13px]"
        style={{ color: MUTED }}
      >
        ‹ indietro
      </button>

      <div className="mt-2 text-center">
        <div
          style={{ fontFamily: "var(--font-caveat)", fontSize: 40, fontWeight: 700, color: INK, transform: "rotate(-2deg)" }}
        >
          Timbratuu
        </div>
        <Scribble w={160} />
        <p className="mt-3 text-[14px]" style={{ color: MUTED }}>crea il tuo account</p>
      </div>

      <div className="flex-1" />

      <p className="text-center text-[12px] uppercase" style={{ letterSpacing: 1, color: MUTED }}>
        come vuoi registrarti?
      </p>

      <CTA onClick={onGoogle} disabled={loading}>
        <GoogleMark /> registrati con Google
      </CTA>

      <Divider />

      <OutlineBtn onClick={onEmail}>
        email e password <span style={{ color: MUTED }}>›</span>
      </OutlineBtn>

      <div className="flex-1" />

      <p className="text-center text-[13px]" style={{ color: INK }}>
        hai già un account?{" "}
        <button type="button" onClick={onLogin} className="underline font-bold" style={{ color: INK }}>
          accedi
        </button>
      </p>

      <p className="text-center text-[11px]" style={{ color: MUTED }}>
        <a href="#" className="underline">privacy</a>
        <span className="mx-1.5">·</span>
        <a href="#" className="underline">termini</a>
      </p>
    </div>
  );
}

function ScreenEmailRegistra({
  email, password, showPass, accetta, errore, loading,
  onEmail, onPassword, onTogglePass, onAccetta, onSubmit, onBack,
}: {
  email: string;
  password: string;
  showPass: boolean;
  accetta: boolean;
  errore: string | null;
  loading: boolean;
  onEmail: (v: string) => void;
  onPassword: (v: string) => void;
  onTogglePass: () => void;
  onAccetta: (v: boolean) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
    >
      <button
        type="button"
        onClick={onBack}
        className="text-left text-[13px]"
        style={{ color: MUTED }}
      >
        ‹ indietro
      </button>

      <div className="text-center">
        <div
          style={{ fontFamily: "var(--font-caveat)", fontSize: 30, fontWeight: 700, color: INK, transform: "rotate(-1deg)" }}
        >
          registrati con email
        </div>
        <Scribble w={150} />
        <p className="mt-2 text-[12px]" style={{ color: MUTED }}>servono solo due cose</p>
      </div>

      <Field
        label="email"
        value={email}
        onChange={onEmail}
        type="email"
        placeholder="mario.rossi@comune.it"
      />
      <Field
        label="password"
        value={password}
        onChange={onPassword}
        type={showPass ? "text" : "password"}
        placeholder="••••••••"
        hint="min 8 caratteri"
        suffix={showPass ? "nascondi" : "mostra"}
        onSuffixClick={onTogglePass}
      />

      <Check checked={accetta} onChange={onAccetta}>
        accetto i{" "}
        <a href="#" className="underline">termini di servizio</a>
        {" "}e la{" "}
        <a href="#" className="underline">privacy policy</a>
        {" "}<span style={{ color: ACCENT }}>*</span>
      </Check>

      <CTA type="submit" disabled={loading || !accetta}>
        {loading ? "..." : "crea account"}
      </CTA>

      {errore && (
        <Banner>
          <b>errore durante la registrazione.</b> {errore}
        </Banner>
      )}

      <div className="flex-1" />

      <p className="text-center text-[12px]">
        <button type="button" onClick={onBack} className="underline" style={{ color: MUTED }}>
          ‹ usa un altro metodo
        </button>
      </p>
    </form>
  );
}

function ScreenVerifica({
  email, timer, onResend, onCambia,
}: {
  email: string;
  timer: number;
  onResend: () => void;
  onCambia: () => void;
}) {
  const timerStr = timer > 0 ? `00:${String(timer).padStart(2, "0")}` : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="mt-4 text-center">
        {/* envelope icon */}
        <div
          className="mx-auto flex items-center justify-center rounded-full border-[2.5px] border-[#1f1d1a]"
          style={{ width: 96, height: 96, background: "#fff8e8", boxShadow: `3px 3px 0 ${INK}22` }}
        >
          <svg width="60" height="40" viewBox="0 0 60 40" overflow="visible">
            <rect x="4" y="4" width="52" height="32" rx="3" fill={PAPER} stroke={INK} strokeWidth="2" />
            <path d="M5 6 L30 24 L55 6" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="48" cy="30" r="10" fill={OK} stroke={INK} strokeWidth="1.5" />
            <path d="M43 30 L47 34 L54 26" stroke={PAPER} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div
          className="mt-4"
          style={{ fontFamily: "var(--font-caveat)", fontSize: 30, fontWeight: 700, color: INK }}
        >
          controlla la tua email
        </div>
        <Scribble w={130} />
        <p className="mt-3 text-[13px] leading-relaxed" style={{ color: MUTED }}>
          ti abbiamo inviato un link di verifica a
        </p>
        <p className="text-[14px] font-bold mt-0.5" style={{ color: INK }}>{email}</p>
        <p className="mt-2 text-[11px] italic" style={{ color: MUTED }}>il link scade tra 24 ore</p>
      </div>

      <Sketchbox dashed className="p-3 text-center">
        <p className="text-[12px]" style={{ color: MUTED }}>
          non hai ricevuto nulla? controlla lo spam, poi:
        </p>
        {timerStr ? (
          <p className="mt-1.5 text-[14px] font-bold" style={{ color: MUTED }}>
            invia di nuovo · {timerStr}
          </p>
        ) : (
          <button
            type="button"
            onClick={onResend}
            className="mt-1.5 text-[14px] font-bold underline"
            style={{ color: INK }}
          >
            invia di nuovo
          </button>
        )}
      </Sketchbox>

      <p className="text-center text-[12px]" style={{ color: INK }}>
        indirizzo sbagliato?{" "}
        <button type="button" onClick={onCambia} className="underline font-bold" style={{ color: INK }}>
          cambia email
        </button>
      </p>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { user, loading, login, loginWithEmail, registerWithEmail } = useAuth();
  const router = useRouter();

  const [tipo, setTipo]           = useState<Tipo>("login");
  const [step, setStep]           = useState<Step>("scelta");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [ricordami, setRicordami] = useState(true);
  const [accetta, setAccetta]     = useState(false);
  const [errore, setErrore]       = useState<string | null>(null);
  const [invio, setInvio]         = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (step === "verifica") setResendTimer(60);
  }, [step]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  function switchTipo(t: Tipo) {
    setTipo(t);
    setStep("scelta");
    setErrore(null);
    setPassword("");
  }

  function goEmail()        { setErrore(null); setStep("email"); }
  function goScelta()       { setErrore(null); setStep("scelta"); }
  function goCambiaEmail()  { setErrore(null); setPassword(""); setStep("email"); }

  async function handleGoogle() {
    setErrore(null);
    setInvio(true);
    try {
      await login();
    } catch (err) {
      setErrore(messaggioErrore(err));
    } finally {
      setInvio(false);
    }
  }

  async function handleEmail() {
    setErrore(null);
    setInvio(true);
    try {
      if (tipo === "login") {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
        if (auth.currentUser) {
          try { await sendEmailVerification(auth.currentUser); } catch { /* ignore */ }
        }
        setStep("verifica");
      }
    } catch (err) {
      setErrore(messaggioErrore(err));
    } finally {
      setInvio(false);
    }
  }

  async function handleResend() {
    if (!auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      setResendTimer(60);
    } catch { /* ignore */ }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-5 py-10"
      style={{ background: PAPER }}
    >
      <div className="w-full max-w-[360px]">
        {step === "scelta" && tipo === "login" && (
          <ScreenSceltaLogin
            onGoogle={handleGoogle}
            onEmail={goEmail}
            onRegistra={() => switchTipo("registra")}
            loading={invio}
          />
        )}
        {step === "scelta" && tipo === "registra" && (
          <ScreenSceltaRegistra
            onGoogle={handleGoogle}
            onEmail={goEmail}
            onLogin={() => switchTipo("login")}
            loading={invio}
          />
        )}
        {step === "email" && tipo === "login" && (
          <ScreenEmailLogin
            email={email}
            password={password}
            showPass={showPass}
            ricordami={ricordami}
            errore={errore}
            loading={invio}
            onEmail={setEmail}
            onPassword={setPassword}
            onTogglePass={() => setShowPass((p) => !p)}
            onRicordami={setRicordami}
            onSubmit={handleEmail}
            onBack={goScelta}
          />
        )}
        {step === "email" && tipo === "registra" && (
          <ScreenEmailRegistra
            email={email}
            password={password}
            showPass={showPass}
            accetta={accetta}
            errore={errore}
            loading={invio}
            onEmail={setEmail}
            onPassword={setPassword}
            onTogglePass={() => setShowPass((p) => !p)}
            onAccetta={setAccetta}
            onSubmit={handleEmail}
            onBack={goScelta}
          />
        )}
        {step === "verifica" && (
          <ScreenVerifica
            email={email}
            timer={resendTimer}
            onResend={handleResend}
            onCambia={goCambiaEmail}
          />
        )}

        {/* errore Google fuori form (scelta step) */}
        {step === "scelta" && errore && (
          <div className="mt-4">
            <Banner><b>accesso non riuscito.</b> {errore}</Banner>
          </div>
        )}
      </div>
    </main>
  );
}

function messaggioErrore(err: unknown): string {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code ?? "";
    const map: Record<string, string> = {
      "auth/popup-blocked":          "Popup bloccato dal browser. Abilita i popup e riprova.",
      "auth/popup-closed-by-user":   "Finestra chiusa prima del completamento.",
      "auth/invalid-credential":     "Email o password non corretti.",
      "auth/user-not-found":         "Nessun account trovato con questa email.",
      "auth/wrong-password":         "Password non corretta.",
      "auth/email-already-in-use":   "Questo indirizzo è già registrato.",
      "auth/weak-password":          "La password deve essere di almeno 6 caratteri.",
      "auth/invalid-email":          "Indirizzo email non valido.",
      "auth/too-many-requests":      "Troppi tentativi. Attendi qualche minuto.",
    };
    return map[code] ?? "Errore durante l'accesso. Riprova.";
  }
  return "Errore sconosciuto.";
}
