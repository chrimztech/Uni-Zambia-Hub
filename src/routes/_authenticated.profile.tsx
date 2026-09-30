import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { PublicLayout } from "@/components/public-layout";
import { toast } from "sonner";
import { Briefcase, Building, Calendar, Clock, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "My profile — UBIRR" }, { name: "robots", content: "noindex" }] }),
  component: ProfilePage,
});

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function roleLabel(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function roleBadgeClass(role: string) {
  if (role.includes("admin"))
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  if (role.includes("manager") || role.includes("officer") || role.includes("reviewer"))
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
  return "bg-secondary text-secondary-foreground";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    enabled: !!user,
    queryFn: () => api.account.profile(),
  });

  const { data: bookmarks } = useQuery({
    queryKey: ["bookmarks"],
    enabled: !!user,
    queryFn: () => api.account.bookmarks(),
  });

  const { data: recentViews } = useQuery({
    queryKey: ["recent-views"],
    enabled: !!user,
    queryFn: () => api.account.recentViews(),
  });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [institution, setInstitution] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [currentPwd, setCurrentPwd] = useState("");
  const [pwd, setPwd] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setInstitution(profile.institution ?? "");
      setJobTitle(profile.job_title ?? "");
    }
  }, [profile]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.account.updateProfile({ full_name: fullName, phone, institution, job_title: jobTitle });
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPwd(true);
    try {
      await api.auth.changePassword({ current_password: currentPwd, password: pwd });
      setCurrentPwd("");
      setPwd("");
      toast.success("Password updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setChangingPwd(false);
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container-page py-24 text-center text-muted-foreground">Loading profile…</div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container-page max-w-5xl py-10">

        {/* Profile hero */}
        <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {profile?.full_name ? getInitials(profile.full_name) : <User className="h-9 w-9" />}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold">{profile?.full_name || "—"}</h1>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            {profile?.job_title && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5 shrink-0" />
                {profile.job_title}
              </p>
            )}
            {profile?.institution && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building className="h-3.5 w-3.5 shrink-0" />
                {profile.institution}
              </p>
            )}
            {profile?.affiliation && !profile?.institution && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building className="h-3.5 w-3.5 shrink-0" />
                {profile.affiliation}
              </p>
            )}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {profile?.roles?.map((r) => (
                <span
                  key={r}
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeClass(r)}`}
                >
                  {roleLabel(r)}
                </span>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-1.5 text-xs text-muted-foreground sm:items-end">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                profile?.status === "active"
                  ? "bg-success-soft text-success-soft-foreground"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
              }`}
            >
              {profile?.status ?? "—"}
            </span>
            <span className="mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Member since {formatDate(profile?.created_at)}
            </span>
            {profile?.last_login_at && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last login {formatDate(profile.last_login_at)}
              </span>
            )}
          </div>
        </div>

        {/* Edit forms */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <form onSubmit={saveProfile} className="space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-lg font-semibold">Account details</h2>
              {(user?.auth_type === "oap" || user?.auth_type === "hr") && (
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Managed by UNZA
                </span>
              )}
            </div>
            {(user?.auth_type === "oap" || user?.auth_type === "hr") && (
              <p className="text-sm text-muted-foreground">
                Your details are sourced from UNZA systems and cannot be edited here.
              </p>
            )}
            <div>
              <label className="block text-sm font-medium">
                Full name{" "}
                {user?.auth_type === "local" && <span className="text-destructive">*</span>}
              </label>
              <input
                required={user?.auth_type === "local"}
                readOnly={user?.auth_type === "oap" || user?.auth_type === "hr"}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  user?.auth_type === "oap" || user?.auth_type === "hr"
                    ? "cursor-not-allowed opacity-70 select-none"
                    : ""
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input
                readOnly={user?.auth_type === "oap" || user?.auth_type === "hr"}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  user?.auth_type === "oap" || user?.auth_type === "hr"
                    ? "cursor-not-allowed opacity-70 select-none"
                    : ""
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Institution</label>
              <input
                readOnly={user?.auth_type === "oap" || user?.auth_type === "hr"}
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. University of Zambia"
                className={`mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  user?.auth_type === "oap" || user?.auth_type === "hr"
                    ? "cursor-not-allowed opacity-70 select-none"
                    : ""
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Job title</label>
              <input
                readOnly={user?.auth_type === "oap" || user?.auth_type === "hr"}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Research Associate"
                className={`mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  user?.auth_type === "oap" || user?.auth_type === "hr"
                    ? "cursor-not-allowed opacity-70 select-none"
                    : ""
                }`}
              />
            </div>
            {user?.auth_type !== "oap" && user?.auth_type !== "hr" && (
              <button
                disabled={saving}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            )}
          </form>

          {user?.auth_type === "local" ? (
            <form onSubmit={changePassword} className="space-y-4 rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Change password</h2>
              <p className="text-sm text-muted-foreground">
                Choose a strong password of at least 8 characters.
              </p>
              <div>
                <label className="block text-sm font-medium">Current password</label>
                <input
                  required
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">New password</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                disabled={changingPwd}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {changingPwd ? "Updating…" : "Update password"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col justify-center space-y-2 rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Password</h2>
              <p className="text-sm text-muted-foreground">
                Your password is managed by UNZA. To change it, please contact UNZA CICT for support.
              </p>
            </div>
          )}
        </div>

        {/* Recently viewed */}
        {recentViews && recentViews.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold">Recently viewed</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentViews.slice(0, 6).map((v) => (
                <ResourceCard
                  key={v.viewed_at + v.content.id}
                  title={v.content.title}
                  type={v.content.content_type}
                  slug={v.content.slug}
                  meta={`Viewed ${formatDate(v.viewed_at)}`}
                />
              ))}
            </div>
          </section>
        )}

        {/* Saved resources */}
        {bookmarks && bookmarks.length > 0 && (
          <section className="mt-10 pb-12">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Saved resources</h2>
              <Link to="/bookmarks" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {bookmarks.slice(0, 6).map((b) => (
                <ResourceCard
                  key={b.id}
                  title={b.content.title}
                  type={b.content.content_type}
                  slug={b.content.slug}
                  meta={`Saved ${formatDate(b.created_at)}`}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
}

function ResourceCard({
  title,
  type,
  slug,
  meta,
}: {
  title: string;
  type: string;
  slug: string;
  meta: string;
}) {
  return (
    <Link
      to="/resource/$slug"
      params={{ slug }}
      className="group flex flex-col gap-1.5 rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/50 hover:bg-secondary/50"
    >
      <span className="line-clamp-2 text-sm font-medium group-hover:text-primary">{title}</span>
      <div className="flex items-center gap-2">
        <span className="inline-block rounded bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          {(type ?? "").replace(/_/g, " ")}
        </span>
        <span className="text-[11px] text-muted-foreground">{meta}</span>
      </div>
    </Link>
  );
}
