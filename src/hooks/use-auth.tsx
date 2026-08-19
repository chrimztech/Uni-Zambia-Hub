import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, clearAuthToken, getAuthToken, setAuthToken, type AppRole, type CurrentUser, type ForgotPasswordResponse } from "@/lib/api";

function parseJwtFallback(token: string): CurrentUser | null {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64));
    const roles: AppRole[] = (payload.roles ?? []) as AppRole[];
    const adminRoles: AppRole[] = ["super_admin", "project_admin"];
    const contentRoles: AppRole[] = ["super_admin", "project_admin", "content_manager", "digitization_officer", "reviewer"];
    return {
      id: payload.sub,
      email: payload.email ?? "",
      full_name: "",
      phone: null,
      unza_id: null,
      auth_type: "local",
      roles,
      admin: roles.some((r) => adminRoles.includes(r)),
      can_manage_content: roles.some((r) => contentRoles.includes(r)),
      last_login_at: null,
    };
  } catch {
    return null;
  }
}

type Session = { access_token: string };
type User = CurrentUser;

interface AuthCtx {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  ldapSignIn: (unzaId: string, password: string) => Promise<void>;
  studentSignIn: (username: string, password: string, instance: string) => Promise<void>;
  staffSignIn: (username: string, password: string) => Promise<void>;
  register: (payload: { full_name: string; email: string; password: string; phone?: string; affiliation?: string; unza_id?: string; institution?: string; job_title?: string; captcha_token?: string; website?: string }) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<ForgotPasswordResponse>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (r: AppRole | AppRole[]) => boolean;
  canManageContent: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const hydrate = async () => {
    const token = getAuthToken();
    if (!token) {
      setSession(null);
      setUser(null);
      setRoles([]);
      setLoading(false);
      return;
    }
    try {
      const me = await api.auth.me();
      setSession({ access_token: token });
      setUser(me);
      setRoles(me.roles);
    } catch {
      // Any failure (401, network, 5xx) — keep session using JWT payload.
      // The server validates the JWT on every protected API call anyway, so
      // a transient /me failure should not log the user out.
      const fallback = parseJwtFallback(token);
      if (fallback) {
        setSession({ access_token: token });
        setUser(fallback);
        setRoles(fallback.roles);
      } else {
        clearAuthToken();
        setSession(null);
        setUser(null);
        setRoles([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrate();
  }, []);

  // When any API call returns 401 (token expired mid-session), clear state so
  // _authenticated.tsx redirects to login automatically.
  useEffect(() => {
    const handler = () => {
      clearAuthToken();
      setSession(null);
      setUser(null);
      setRoles([]);
    };
    window.addEventListener("api:unauthorized", handler);
    return () => window.removeEventListener("api:unauthorized", handler);
  }, []);

  const hasRole = (r: AppRole | AppRole[]) => {
    const arr = Array.isArray(r) ? r : [r];
    return arr.some((x) => roles.includes(x));
  };

  const value: AuthCtx = {
    user,
    session,
    roles,
    loading,
    signIn: async (email, password) => {
      const result = await api.auth.login({ email, password });
      setAuthToken(result.token);
      setSession({ access_token: result.token });
      setUser(result.user);
      setRoles(result.user.roles);
    },
    ldapSignIn: async (unzaId, password) => {
      const result = await api.auth.ldapLogin({ unza_id: unzaId, password });
      setAuthToken(result.token);
      setSession({ access_token: result.token });
      setUser(result.user);
      setRoles(result.user.roles);
    },
    studentSignIn: async (username, password, instance) => {
      const result = await api.auth.studentLogin({ username, password, instance });
      setAuthToken(result.token);
      setSession({ access_token: result.token });
      setUser(result.user);
      setRoles(result.user.roles);
    },
    staffSignIn: async (username, password) => {
      const result = await api.auth.staffLogin({ username, password });
      setAuthToken(result.token);
      setSession({ access_token: result.token });
      setUser(result.user);
      setRoles(result.user.roles);
    },
    register: async (payload) => {
      await api.auth.register(payload);
      // Account is pending email verification — do not set auth state
    },
    requestPasswordReset: async (email) => api.auth.forgotPassword({ email }),
    resetPassword: async (token, password) => {
      await api.auth.resetPassword({ token, password });
    },
    changePassword: async (currentPassword, password) => {
      await api.auth.changePassword({ current_password: currentPassword, password });
    },
    signOut: async () => {
      try {
        await api.auth.logout();
      } finally {
        clearAuthToken();
        setSession(null);
        setUser(null);
        setRoles([]);
      }
    },
    hasRole,
    isAdmin: hasRole(["super_admin", "project_admin"]),
    canManageContent: hasRole(["super_admin","project_admin","content_manager","digitization_officer","reviewer"]),
    refresh: async () => { setLoading(true); await hydrate(); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
