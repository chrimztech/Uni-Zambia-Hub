import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { PublicLayout } from "@/components/public-layout";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff } from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import ReCAPTCHA from "react-google-recaptcha";
import { api, type CaptchaConfig } from "@/lib/api";

export const Route = createFileRoute("/auth/pre-redesign/backup")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s.redirect === "string" ? s.redirect : "/admin" }),
  head: () => ({ meta: [{ title: "Sign in — Sanitation Hub" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

type Mode = "login" | "staff" | "student" | "register";

const AFFILIATIONS = [
  { value: "unza_student", label: "UNZA Student" },
  { value: "unza_staff", label: "UNZA Staff / Lecturer" },
  { value: "researcher", label: "Researcher / Academic" },
  { value: "government", label: "Government / Public Sector" },
  { value: "ngo", label: "NGO / Development Organisation" },
  { value: "private", label: "Private Sector" },
  { value: "public", label: "General Public" },
];

const isUnza = (a: string) => a === "unza_student" || a === "unza_staff";

const STUDENT_INSTANCES = [
  { value: "undergraduate", label: "Undergraduate (UG)" },
  { value: "postgraduate", label: "Postgraduate (PG)" },
  { value: "gsb", label: "Graduate School of Business (GSB)" },
  { value: "medicine", label: "School of Medicine" },
  { value: "law", label: "School of Law" },
  { value: "education", label: "School of Education" },
  { value: "engineering", label: "School of Engineering" },
  { value: "natural_sciences", label: "School of Natural Sciences" },
  { value: "humanities", label: "Humanities & Social Sciences" },
  { value: "veterinary", label: "School of Veterinary Medicine" },
];

function AuthPage() {
  const { user, loading, signIn, studentSignIn, staffSignIn, register } = useAuth();
  const nav = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<Mode>("student");

  // login fields
  const [staffEmail, setStaffEmail] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [studentInstance, setStudentInstance] = useState("undergraduate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // registration fields
  const [reg, setReg] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    affiliation: "",
    unza_id: "",
    institution: "",
    job_title: "",
  });
  const [showRegPw, setShowRegPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [captchaConfig, setCaptchaConfig] = useState<CaptchaConfig | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const hcaptchaRef = useRef<HCaptcha>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    api.public.captchaConfig().then(setCaptchaConfig).catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading && user) nav({ to: search.redirect as any, replace: true });
  }, [user, loading, nav, search.redirect]);

  const setR = (k: keyof typeof reg, v: string) => setReg((p) => ({ ...p, [k]: v }));

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "staff") {
        await staffSignIn(staffEmail, password);
        toast.success("Signed in with UNZA staff credentials");
      } else if (mode === "student") {
        await studentSignIn(studentNumber, password, studentInstance);
        toast.success("Signed in with UNZA student credentials");
      } else {
        await signIn(email, password);
        toast.success("Signed in");
      }
      nav({ to: search.redirect as any, replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reg.password !== reg.confirm_password) return toast.error("Passwords do not match");
    if (!reg.affiliation) return toast.error("Please select your affiliation");
    if (!agreed) return toast.error("Please accept the terms of use");
    if (captchaConfig?.enabled && !captchaToken) {
      return toast.error("Please complete the CAPTCHA verification");
    }
    setBusy(true);
    try {
      await register({
        full_name: reg.full_name,
        email: reg.email,
        password: reg.password,
        phone: reg.phone || undefined,
        affiliation: reg.affiliation || undefined,
        unza_id: reg.unza_id || undefined,
        institution: reg.institution || undefined,
        job_title: reg.job_title || undefined,
        captcha_token: captchaToken ?? undefined,
        website: "",
      });
      setRegistered(true);
    } catch (err: any) {
      toast.error(err.message ?? "Registration failed");
      hcaptchaRef.current?.resetCaptcha();
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PublicLayout>
      <section className="container-page flex justify-center py-12">
        <div className={`w-full ${mode === "register" ? "max-w-2xl" : "max-w-md"} rounded-lg border border-border bg-card p-8 shadow-sm transition-all`}>
          <div className="mb-5 flex items-center gap-3 border-b border-border pb-5">
            <img src="/logo.png" alt="University of Zambia" className="h-14 w-auto object-contain" />
            <div className="leading-tight">
              <div className="font-display text-lg font-bold text-foreground">UNZA Sanitation Hub</div>
              <div className="text-xs text-muted-foreground">Decentralized Sanitation Systems</div>
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold">
            {mode === "student" ? "UNZA Student sign in" : mode === "staff" ? "UNZA Staff sign in" : mode === "login" ? "Sign in" : "Create account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "student"
              ? "For University of Zambia students only. Use your student number and UNZA portal password."
              : mode === "staff"
              ? "For University of Zambia staff and faculty. Use your UNZA HR system email and password."
              : mode === "login"
              ? "Sign in with your Sanitation Hub account."
              : "Register to access resources and contribute to the platform."}
          </p>

          <div className="mt-5 flex rounded-lg border border-border bg-secondary/40 p-1">
            {(["student", "staff", "login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                suppressHydrationWarning
                onClick={() => setMode(m)}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${mode === m ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {m === "student" ? "Students" : m === "staff" ? "Staff" : m === "login" ? "Email" : "Register"}
              </button>
            ))}
          </div>

          {/* ── Login / LDAP form ── */}
          {mode !== "register" && (
            <form onSubmit={submitLogin} className="mt-6 space-y-4">
              {mode === "student" && (
                <>
                  <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                    This login is exclusively for enrolled students at the <strong>University of Zambia</strong>. Use the same credentials you use on the UNZA Student Portal.
                  </div>
                  <Field label="Programme type">
                    <select required suppressHydrationWarning value={studentInstance} onChange={(e) => setStudentInstance(e.target.value)} className="inp">
                      {STUDENT_INSTANCES.map((i) => (
                        <option key={i.value} value={i.value}>{i.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Student number">
                    <input required suppressHydrationWarning value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)}
                      placeholder="e.g. 2022531784" className="inp" />
                  </Field>
                </>
              )}
              {mode === "staff" && (
                <>
                  <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                    For University of Zambia staff and faculty only. Use the same credentials as the <strong>UNZA HR portal</strong>.
                  </div>
                  <Field label="UNZA email address">
                    <input required suppressHydrationWarning type="email" value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="e.g. firstname.lastname@unza.ac.zm" className="inp" />
                  </Field>
                </>
              )}
              {mode === "login" && (
                <Field label="Email address">
                  <input required suppressHydrationWarning type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="inp" />
                </Field>
              )}
              <Field label="Password">
                <div className="relative">
                  <input required suppressHydrationWarning type={showPw ? "text" : "password"} minLength={mode === "login" ? 8 : 1}
                    value={password} onChange={(e) => setPassword(e.target.value)} className="inp pr-10" />
                  <button type="button" suppressHydrationWarning onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              <button suppressHydrationWarning disabled={busy} className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
                {busy ? "Please wait…" : mode === "student" ? "Sign in as student" : mode === "staff" ? "Sign in as staff" : "Sign in"}
              </button>
              {mode === "login" && (
                <p className="text-center text-sm text-muted-foreground">
                  <a href="/reset-password" className="hover:text-primary">Forgot your password?</a>
                </p>
              )}
              {(mode === "student" || mode === "staff") && (
                <p className="text-center text-xs text-muted-foreground">
                  Not a UNZA student or staff?{" "}
                  <button type="button" suppressHydrationWarning onClick={() => setMode("register")} className="text-primary hover:underline">Register here</button>.
                </p>
              )}
            </form>
          )}

          {/* ── Rich Registration form ── */}
          {mode === "register" && registered && (
            <div className="mt-6 rounded-md border border-border bg-secondary/40 p-5 text-center">
              <p className="text-base font-semibold">Check your email</p>
              <p className="mt-2 text-sm text-muted-foreground">
                We've sent a verification link to <strong>{reg.email}</strong>.
                Open the link to activate your account before signing in.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">Didn't receive it? Check your spam folder.</p>
            </div>
          )}
          {mode === "register" && !registered && (
            <form onSubmit={submitRegister} className="mt-6 space-y-5">

              {/* Personal info */}
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personal information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name *" className="sm:col-span-2">
                    <input required suppressHydrationWarning value={reg.full_name} onChange={(e) => setR("full_name", e.target.value)}
                      placeholder="As on your ID or university record" className="inp" />
                  </Field>
                  <Field label="Email address *">
                    <input required suppressHydrationWarning type="email" value={reg.email} onChange={(e) => setR("email", e.target.value)}
                      placeholder="you@example.com" className="inp" />
                  </Field>
                  <Field label="Phone number">
                    <input suppressHydrationWarning type="tel" value={reg.phone} onChange={(e) => setR("phone", e.target.value)}
                      placeholder="+260 9X XXX XXXX" className="inp" />
                  </Field>
                </div>
              </section>

              {/* Affiliation */}
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Affiliation & background</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Affiliation / User type *" className="sm:col-span-2">
                    <select required suppressHydrationWarning value={reg.affiliation} onChange={(e) => setR("affiliation", e.target.value)} className="inp">
                      <option value="">— Select your affiliation —</option>
                      {AFFILIATIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                  </Field>

                  {isUnza(reg.affiliation) && (
                    <Field label="UNZA ID / Student number">
                      <input suppressHydrationWarning value={reg.unza_id} onChange={(e) => setR("unza_id", e.target.value)}
                        placeholder="e.g. 21XXXXX" className="inp" />
                      <p className="mt-1 text-xs text-muted-foreground">UNZA members should ideally use the LDAP tab for seamless sign-in.</p>
                    </Field>
                  )}

                  {reg.affiliation && !isUnza(reg.affiliation) && (
                    <Field label="Institution / Organisation">
                      <input suppressHydrationWarning value={reg.institution} onChange={(e) => setR("institution", e.target.value)}
                        placeholder="e.g. Ministry of Water, WWF Zambia" className="inp" />
                    </Field>
                  )}

                  <Field label="Job title / Position">
                    <input suppressHydrationWarning value={reg.job_title} onChange={(e) => setR("job_title", e.target.value)}
                      placeholder="e.g. Sanitation Engineer, Research Officer" className="inp" />
                  </Field>
                </div>
              </section>

              {/* Password */}
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Security</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Password *">
                    <div className="relative">
                      <input required suppressHydrationWarning type={showRegPw ? "text" : "password"} minLength={8}
                        value={reg.password} onChange={(e) => setR("password", e.target.value)}
                        placeholder="Minimum 8 characters" className="inp pr-10" />
                      <button type="button" suppressHydrationWarning onClick={() => setShowRegPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showRegPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={reg.password} />
                  </Field>
                  <Field label="Confirm password *">
                    <div className="relative">
                      <input required suppressHydrationWarning type={showRegPw ? "text" : "password"} minLength={8}
                        value={reg.confirm_password} onChange={(e) => setR("confirm_password", e.target.value)}
                        placeholder="Repeat your password" className="inp pr-10" />
                    </div>
                    {reg.confirm_password && reg.password !== reg.confirm_password && (
                      <p className="mt-1 text-xs text-destructive">Passwords do not match</p>
                    )}
                  </Field>
                </div>
              </section>

              {/* Honeypot — hidden from real users, bots fill it */}
              <input
                type="text"
                name="website"
                value=""
                onChange={() => {}}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}
              />

              {/* CAPTCHA */}
              {captchaConfig?.enabled && captchaConfig.site_key && (
                <div className="flex justify-center">
                  {captchaConfig.provider === "hcaptcha" ? (
                    <HCaptcha
                      ref={hcaptchaRef}
                      sitekey={captchaConfig.site_key}
                      onVerify={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken(null)}
                      onError={() => { setCaptchaToken(null); toast.error("CAPTCHA error. Please try again."); }}
                    />
                  ) : (
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={captchaConfig.site_key}
                      onChange={(token: string | null) => setCaptchaToken(token)}
                      onExpired={() => setCaptchaToken(null)}
                      onErrored={() => { setCaptchaToken(null); toast.error("CAPTCHA error. Please try again."); }}
                    />
                  )}
                </div>
              )}

              {/* Terms */}
              <label className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4 text-sm">
                <input suppressHydrationWarning type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-muted-foreground">
                  I agree to the <a href="/about" className="text-primary hover:underline">terms of use</a> of the UNZA Sanitation Hub.
                  I understand that my account is subject to approval and that misuse may result in suspension.
                </span>
              </label>

              <button suppressHydrationWarning disabled={busy} className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
                {busy ? "Creating account…" : "Create account"}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <button type="button" suppressHydrationWarning onClick={() => setMode("login")} className="text-primary hover:underline">Sign in</button>
              </p>
            </form>
          )}
        </div>
      </section>
      <style>{`.inp{display:block;width:100%;border-radius:.375rem;border:1px solid var(--color-border);background:var(--color-background);padding:.5rem .75rem;font-size:.875rem;line-height:1.25rem}.inp:focus{outline:none;border-color:var(--color-primary)}`}</style>
    </PublicLayout>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < score ? colors[score - 1] : "bg-border"}`} />
        ))}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{labels[score - 1] ?? "Too short"}</p>
    </div>
  );
}
