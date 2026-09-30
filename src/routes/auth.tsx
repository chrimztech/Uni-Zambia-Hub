import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { PublicLayout } from "@/components/public-layout";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import ReCAPTCHA from "react-google-recaptcha";
import { api, type CaptchaConfig } from "@/lib/api";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s.redirect === "string" ? s.redirect : "/admin" }),
  head: () => ({ meta: [{ title: "Sign in - Sanitation Hub" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

type Mode = "login" | "staff" | "student" | "register";

type ModeMeta = {
  tabLabel: string;
  tabHint: string;
  title: string;
  description: string;
  submitLabel: string;
  badge: string;
  heroTitle: string;
  heroDescription: string;
  heroPoints: string[];
  icon: LucideIcon;
};

const MODE_ORDER: Mode[] = ["student", "staff", "login", "register"];

const MODE_META: Record<Mode, ModeMeta> = {
  student: {
    tabLabel: "Students",
    tabHint: "Portal access",
    title: "UNZA Student sign in",
    description: "Use your student number and the same password you already use for the UNZA student portal.",
    submitLabel: "Sign in as student",
    badge: "Student gateway",
    heroTitle: "Continue your research with the credentials you already trust.",
    heroDescription:
      "The student pathway keeps access simple for coursework, projects, and field research with a clean sign-in experience built around the University's existing portal flow.",
    heroPoints: [
      "Use your student number and programme instance.",
      "Open the library, saved resources, and research updates faster.",
      "Stay inside the University's familiar authentication path.",
    ],
    icon: GraduationCap,
  },
  staff: {
    tabLabel: "Staff",
    tabHint: "HR credentials",
    title: "UNZA Staff sign in",
    description: "Use your UNZA email address and the same password you use for the HR portal.",
    submitLabel: "Sign in as staff",
    badge: "Institutional access",
    heroTitle: "A cleaner sign-in flow for teaching, research, and administration.",
    heroDescription:
      "Staff and faculty can move straight into the Sanitation Hub with professional access designed around existing University credentials and a more polished handoff into the platform.",
    heroPoints: [
      "Sign in with your official UNZA email address.",
      "Support teaching, supervision, and repository management workflows.",
      "Keep institutional access separate from external community accounts.",
    ],
    icon: Briefcase,
  },
  login: {
    tabLabel: "Email",
    tabHint: "Community login",
    title: "Sign in with email",
    description: "Use your Sanitation Hub account to continue browsing resources, events, and saved materials.",
    submitLabel: "Sign in",
    badge: "Community account",
    heroTitle: "A polished login for researchers, partners, and public users.",
    heroDescription:
      "External users can access the Hub through a refined email sign-in flow that feels credible, secure, and aligned with the rest of the platform.",
    heroPoints: [
      "Ideal for researchers, practitioners, and partner organisations.",
      "Manage bookmarks, follow published content, and return to saved work.",
      "Use password recovery when you need to regain access quickly.",
    ],
    icon: Mail,
  },
  register: {
    tabLabel: "Register",
    tabHint: "New account",
    title: "Create your account",
    description: "Join the Sanitation Hub to access resources, save content, and participate as an approved community member.",
    submitLabel: "Create account",
    badge: "New member onboarding",
    heroTitle: "Professional onboarding for the wider sanitation community.",
    heroDescription:
      "The registration flow is designed to feel trustworthy from the first screen, with clearer structure for personal details, affiliation, and account security.",
    heroPoints: [
      "Create an account for external research and collaboration.",
      "Share your affiliation so approvals and role decisions are easier.",
      "Set up a secure password and verify your email before signing in.",
    ],
    icon: UserPlus,
  },
};

const AFFILIATIONS = [
  { value: "unza_student", label: "UNZA Student" },
  { value: "unza_staff", label: "UNZA Staff / Lecturer" },
  { value: "researcher", label: "Researcher / Academic" },
  { value: "government", label: "Government / Public Sector" },
  { value: "ngo", label: "NGO / Development Organisation" },
  { value: "private", label: "Private Sector" },
  { value: "public", label: "General Public" },
];

const STUDENT_INSTANCES = [
  { value: "ug", label: "Undergraduate (UG)" },
  { value: "pg", label: "Postgraduate (PG)" },
  { value: "gsb", label: "Graduate School of Business (GSB)" },
  { value: "ide", label: "Distance Education Students " },
  { value: "zou", label: "Zimbabwe Open University" },
  { value: "ecampus", label: "Online Students (eCampus)" },
];

const VALUE_CARDS = [
  {
    label: "Research access",
    value: "Library-ready",
    description: "Open curated sanitation resources and training content in one place.",
  },
  {
    label: "Account model",
    value: "Multi-path sign in",
    description: "Student, staff, and external users each get a tailored entry point.",
  },
  {
    label: "Trust signal",
    value: "Approval-aware onboarding",
    description: "Registration captures the context needed for safer account approvals.",
  },
];

const isUnza = (affiliation: string) => affiliation === "unza_student" || affiliation === "unza_staff";

function AuthPage() {
  const { user, loading, signIn, studentSignIn, staffSignIn, register } = useAuth();
  const nav = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<Mode>("student");

  const [staffEmail, setStaffEmail] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [studentInstance, setStudentInstance] = useState("ug");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

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

  const activeMode = MODE_META[mode];
  const ActiveIcon = activeMode.icon;

  useEffect(() => {
    api.public.captchaConfig().then(setCaptchaConfig).catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading && user) nav({ to: search.redirect as any, replace: true });
  }, [user, loading, nav, search.redirect]);

  const setR = (key: keyof typeof reg, value: string) => setReg((prev) => ({ ...prev, [key]: value }));

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
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at top left, rgba(194, 153, 70, 0.18), transparent 32%), radial-gradient(circle at right 20%, rgba(22, 101, 52, 0.12), transparent 36%), linear-gradient(180deg, rgba(22, 101, 52, 0.05), transparent 48%)",
          }}
        />
        <div className="container-page relative py-8 sm:py-12 lg:py-16">
          <div className={`grid gap-8 xl:gap-10 ${mode === "register" ? "xl:grid-cols-[1.05fr_1.25fr]" : "xl:grid-cols-[1.1fr_minmax(0,32rem)]"}`}>
            <aside className="relative overflow-hidden rounded-[2rem] border border-primary/10 bg-[linear-gradient(145deg,#153f2b_0%,#102f22_50%,#0a1f18_100%)] px-6 py-7 text-white shadow-[0_30px_80px_-40px_rgba(16,47,34,0.95)] sm:px-8 sm:py-9">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(194,153,70,0.22),transparent_28%)]" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-[#f2d27a]" />
                  Secure access
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
                    <img src="/logo.png" alt="University of Zambia" className="h-12 w-auto object-contain" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f2d27a]">University of Zambia</p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">{activeMode.heroTitle}</h1>
                  </div>
                </div>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-[15px]">{activeMode.heroDescription}</p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {VALUE_CARDS.map((card) => (
                    <div key={card.label} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">{card.label}</p>
                      <p className="mt-2 text-base font-semibold text-white">{card.value}</p>
                      <p className="mt-2 text-sm leading-6 text-white/65">{card.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/10 p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#f2d27a] ring-1 ring-white/15">
                      <ActiveIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">{activeMode.badge}</p>
                      <p className="text-lg font-semibold text-white">{activeMode.title}</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {activeMode.heroPoints.map((point) => (
                      <div key={point} className="flex items-start gap-3 text-sm leading-6 text-white/78">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#f2d27a]" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-card/95 p-5 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.5)] backdrop-blur-md sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(22,101,52,0.08),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(194,153,70,0.08),transparent_28%)]" />
              <div className="relative">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-primary/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                      <ActiveIcon className="h-3.5 w-3.5" />
                      {activeMode.badge}
                    </div>
                    <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-[2.15rem]">{activeMode.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-[15px]">{activeMode.description}</p>
                  </div>
                  <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 sm:flex">
                    <ActiveIcon className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-4">
                  {MODE_ORDER.map((item) => {
                    const meta = MODE_META[item];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={item}
                        type="button"
                        suppressHydrationWarning
                        onClick={() => setMode(item)}
                        className={`auth-tab ${mode === item ? "auth-tab-active" : ""}`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{meta.tabLabel}</span>
                        </span>
                        <span className="mt-1 block text-left text-[11px] font-medium leading-4 text-inherit/70">{meta.tabHint}</span>
                      </button>
                    );
                  })}
                </div>

                {mode !== "register" && (
                  <form onSubmit={submitLogin} className="mt-8 space-y-5">
                    {mode === "student" && (
                      <>
                        <AuthNotice icon={ShieldCheck}>
                          This sign-in path is reserved for enrolled <strong>University of Zambia students</strong>. Use the same credentials you use on the UNZA student portal.
                        </AuthNotice>
                        <Field label="Programme type" hint="Choose the portal instance connected to your student account.">
                          <select
                            required
                            suppressHydrationWarning
                            value={studentInstance}
                            onChange={(e) => setStudentInstance(e.target.value)}
                            className="auth-input appearance-none"
                          >
                            {STUDENT_INSTANCES.map((instance) => (
                              <option key={instance.value} value={instance.value}>
                                {instance.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Student number">
                          <input
                            required
                            suppressHydrationWarning
                            value={studentNumber}
                            onChange={(e) => setStudentNumber(e.target.value)}
                            placeholder="e.g. 2022531784"
                            autoComplete="username"
                            inputMode="numeric"
                            className="auth-input"
                          />
                        </Field>
                      </>
                    )}

                    {mode === "staff" && (
                      <>
                        <AuthNotice icon={ShieldCheck}>
                          This sign-in path is for <strong>UNZA staff and faculty</strong>. Use the same credentials you use for the UNZA HR portal.
                        </AuthNotice>
                        <Field label="UNZA email address">
                          <input
                            required
                            suppressHydrationWarning
                            type="email"
                            value={staffEmail}
                            onChange={(e) => setStaffEmail(e.target.value)}
                            placeholder="e.g. firstname.lastname@unza.ac.zm"
                            autoComplete="username"
                            className="auth-input"
                          />
                        </Field>
                      </>
                    )}

                    {mode === "login" && (
                      <Field label="Email address">
                        <input
                          required
                          suppressHydrationWarning
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="username"
                          placeholder="you@example.com"
                          className="auth-input"
                        />
                      </Field>
                    )}

                    <Field label="Password">
                      <div className="relative">
                        <input
                          required
                          suppressHydrationWarning
                          type={showPw ? "text" : "password"}
                          minLength={mode === "login" ? 8 : 1}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="current-password"
                          placeholder={mode === "login" ? "Enter your account password" : "Enter your portal password"}
                          className="auth-input pr-12"
                        />
                        <button
                          type="button"
                          suppressHydrationWarning
                          onClick={() => setShowPw((value) => !value)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={showPw ? "Hide password" : "Show password"}
                        >
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </Field>

                    <button suppressHydrationWarning disabled={busy} className="auth-submit">
                      <span>{busy ? "Please wait..." : activeMode.submitLabel}</span>
                      {!busy && <ArrowRight className="h-4 w-4" />}
                    </button>

                    {mode === "login" && (
                      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                        <span>Need help getting back into your account?</span>
                        <Link to="/reset-password" className="font-semibold text-primary transition-colors hover:text-primary/80">
                          Reset password
                        </Link>
                      </div>
                    )}

                    {(mode === "student" || mode === "staff") && (
                      <p className="text-center text-sm text-muted-foreground">
                        Not using University credentials?{" "}
                        <button type="button" suppressHydrationWarning onClick={() => setMode("register")} className="font-semibold text-primary hover:underline">
                          Create a community account
                        </button>
                        .
                      </p>
                    )}
                  </form>
                )}

                {mode === "register" && registered && (
                  <div className="mt-8 rounded-[1.75rem] border border-primary/12 bg-primary/6 p-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                      <Mail className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-lg font-semibold text-foreground">Check your email</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      We&apos;ve sent a verification link to <strong>{reg.email}</strong>. Open it to activate your account before signing in.
                    </p>
                    <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">If you do not see it, check your spam folder.</p>
                  </div>
                )}

                {mode === "register" && !registered && (
                  <form onSubmit={submitRegister} className="mt-8 space-y-5">
                    <FormSection icon={BookOpen} title="Personal information" description="Tell us who you are so your account profile is clear and credible.">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Full name *" className="sm:col-span-2">
                          <input
                            required
                            suppressHydrationWarning
                            value={reg.full_name}
                            onChange={(e) => setR("full_name", e.target.value)}
                            placeholder="As it appears on your ID or university record"
                            autoComplete="name"
                            className="auth-input"
                          />
                        </Field>
                        <Field label="Email address *">
                          <input
                            required
                            suppressHydrationWarning
                            type="email"
                            value={reg.email}
                            onChange={(e) => setR("email", e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            className="auth-input"
                          />
                        </Field>
                        <Field label="Phone number">
                          <input
                            suppressHydrationWarning
                            type="tel"
                            value={reg.phone}
                            onChange={(e) => setR("phone", e.target.value)}
                            placeholder="+260 9X XXX XXXX"
                            autoComplete="tel"
                            className="auth-input"
                          />
                        </Field>
                      </div>
                    </FormSection>

                    <FormSection
                      icon={Briefcase}
                      title="Affiliation and background"
                      description="This helps the platform understand how you relate to the sanitation and research community."
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Affiliation / User type *" className="sm:col-span-2">
                          <select
                            required
                            suppressHydrationWarning
                            value={reg.affiliation}
                            onChange={(e) => setR("affiliation", e.target.value)}
                            className="auth-input appearance-none"
                          >
                            <option value="">Select your affiliation</option>
                            {AFFILIATIONS.map((affiliation) => (
                              <option key={affiliation.value} value={affiliation.value}>
                                {affiliation.label}
                              </option>
                            ))}
                          </select>
                        </Field>

                        {isUnza(reg.affiliation) && (
                          <Field label="UNZA ID / Student number">
                            <input
                              suppressHydrationWarning
                              value={reg.unza_id}
                              onChange={(e) => setR("unza_id", e.target.value)}
                              placeholder="e.g. 21XXXXX"
                              className="auth-input"
                            />
                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                              UNZA members will usually have a smoother experience signing in through the dedicated student or staff tabs.
                            </p>
                          </Field>
                        )}

                        {reg.affiliation && !isUnza(reg.affiliation) && (
                          <Field label="Institution / Organisation">
                            <input
                              suppressHydrationWarning
                              value={reg.institution}
                              onChange={(e) => setR("institution", e.target.value)}
                              placeholder="e.g. Ministry of Water, WWF Zambia"
                              className="auth-input"
                            />
                          </Field>
                        )}

                        <Field label="Job title / Position">
                          <input
                            suppressHydrationWarning
                            value={reg.job_title}
                            onChange={(e) => setR("job_title", e.target.value)}
                            placeholder="e.g. Sanitation Engineer, Research Officer"
                            className="auth-input"
                          />
                        </Field>
                      </div>
                    </FormSection>

                    <FormSection icon={LockKeyhole} title="Security" description="Choose a strong password and confirm it before creating your account.">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Password *">
                          <div className="relative">
                            <input
                              required
                              suppressHydrationWarning
                              type={showRegPw ? "text" : "password"}
                              minLength={8}
                              value={reg.password}
                              onChange={(e) => setR("password", e.target.value)}
                              autoComplete="new-password"
                              placeholder="Minimum 8 characters"
                              className="auth-input pr-12"
                            />
                            <button
                              type="button"
                              suppressHydrationWarning
                              onClick={() => setShowRegPw((value) => !value)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                              aria-label={showRegPw ? "Hide password" : "Show password"}
                            >
                              {showRegPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <PasswordStrength password={reg.password} />
                        </Field>
                        <Field label="Confirm password *">
                          <input
                            required
                            suppressHydrationWarning
                            type={showRegPw ? "text" : "password"}
                            minLength={8}
                            value={reg.confirm_password}
                            onChange={(e) => setR("confirm_password", e.target.value)}
                            autoComplete="new-password"
                            placeholder="Repeat your password"
                            className="auth-input"
                          />
                          {reg.confirm_password && reg.password !== reg.confirm_password && (
                            <p className="mt-2 text-xs font-medium text-destructive">Passwords do not match.</p>
                          )}
                        </Field>
                      </div>
                    </FormSection>

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

                    {captchaConfig?.enabled && captchaConfig.site_key && (
                      <div className="auth-section flex justify-center">
                        {captchaConfig.provider === "hcaptcha" ? (
                          <HCaptcha
                            ref={hcaptchaRef}
                            sitekey={captchaConfig.site_key}
                            onVerify={(token) => setCaptchaToken(token)}
                            onExpire={() => setCaptchaToken(null)}
                            onError={() => {
                              setCaptchaToken(null);
                              toast.error("CAPTCHA error. Please try again.");
                            }}
                          />
                        ) : (
                          <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={captchaConfig.site_key}
                            onChange={(token: string | null) => setCaptchaToken(token)}
                            onExpired={() => setCaptchaToken(null)}
                            onErrored={() => {
                              setCaptchaToken(null);
                              toast.error("CAPTCHA error. Please try again.");
                            }}
                          />
                        )}
                      </div>
                    )}

                    <label className="flex items-start gap-3 rounded-[1.5rem] border border-border/80 bg-muted/25 p-4 text-sm leading-6">
                      <input
                        suppressHydrationWarning
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
                      />
                      <span className="text-muted-foreground">
                        I agree to the{" "}
                        <Link to="/about" className="font-semibold text-primary hover:underline">
                          terms of use
                        </Link>{" "}
                        of the UNZA Sanitation Hub. I understand that my account may require approval and that misuse can result in suspension.
                      </span>
                    </label>

                    <button suppressHydrationWarning disabled={busy} className="auth-submit">
                      <span>{busy ? "Creating account..." : activeMode.submitLabel}</span>
                      {!busy && <ArrowRight className="h-4 w-4" />}
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <button type="button" suppressHydrationWarning onClick={() => setMode("login")} className="font-semibold text-primary hover:underline">
                        Sign in
                      </button>
                      .
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .auth-input {
          display: block;
          width: 100%;
          border-radius: 1rem;
          border: 1px solid var(--color-border);
          background: color-mix(in srgb, var(--color-background) 88%, white);
          padding: 0.875rem 1rem;
          font-size: 0.95rem;
          line-height: 1.4rem;
          transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
        }
        .auth-input::placeholder {
          color: var(--color-muted-foreground);
          opacity: 0.85;
        }
        .auth-input:hover {
          border-color: color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
        }
        .auth-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px rgba(22, 101, 52, 0.12);
        }
        .auth-tab {
          border-radius: 1.1rem;
          border: 1px solid color-mix(in srgb, var(--color-border) 88%, white);
          background: color-mix(in srgb, var(--color-card) 88%, white);
          padding: 0.85rem 0.95rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--color-muted-foreground);
          transition: border-color 180ms ease, background-color 180ms ease, color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
        }
        .auth-tab:hover {
          transform: translateY(-1px);
          border-color: color-mix(in srgb, var(--color-primary) 26%, var(--color-border));
          color: var(--color-foreground);
        }
        .auth-tab-active {
          border-color: color-mix(in srgb, var(--color-primary) 28%, white);
          background: linear-gradient(180deg, rgba(22, 101, 52, 0.1), rgba(22, 101, 52, 0.04));
          color: var(--color-primary);
          box-shadow: 0 18px 35px -28px rgba(22, 101, 52, 0.7);
        }
        .auth-section {
          border-radius: 1.5rem;
          border: 1px solid color-mix(in srgb, var(--color-border) 84%, white);
          background: color-mix(in srgb, var(--color-card) 92%, white);
          padding: 1.25rem;
        }
        .auth-submit {
          display: inline-flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          border-radius: 1rem;
          background: linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 76%, black));
          padding: 0.95rem 1.2rem;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-primary-foreground);
          box-shadow: 0 22px 35px -24px rgba(22, 101, 52, 0.95);
          transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
        }
        .auth-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 24px 42px -24px rgba(22, 101, 52, 1);
        }
        .auth-submit:disabled {
          cursor: not-allowed;
          opacity: 0.65;
          transform: none;
          box-shadow: none;
        }
      `}</style>
    </PublicLayout>
  );
}

function AuthNotice({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-[1.35rem] border border-primary/12 bg-primary/6 p-4 text-sm leading-6 text-foreground/82">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-semibold text-foreground">{label}</span>
      {hint ? <span className="mt-1 block text-xs leading-5 text-muted-foreground">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="auth-section">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
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
  const colors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-success"];

  return (
    <div className="mt-3">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className={`h-1.5 flex-1 rounded-full ${index < score ? colors[score - 1] : "bg-border"}`} />
        ))}
      </div>
      <p className="mt-2 text-xs font-medium text-muted-foreground">{labels[score - 1] ?? "Too short"}</p>
    </div>
  );
}
