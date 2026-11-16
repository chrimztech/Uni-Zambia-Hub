const TOKEN_KEY = "ubirr_token";
const REQUEST_TIMEOUT_MS = 30_000;

export class ApiError extends Error {
  status: number;
  isNetworkError: boolean;
  constructor(message: string, status: number, isNetworkError = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

/** Extract a human-readable message from any thrown value. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === "string") return error || fallback;
  return fallback;
}

export type AppRole =
  | "super_admin"
  | "project_admin"
  | "content_manager"
  | "digitization_officer"
  | "reviewer"
  | "staff"
  | "student";

export type CurrentUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  unza_id: string | null;
  auth_type: "local" | "ldap" | "oap" | "hr";
  roles: AppRole[];
  admin: boolean;
  can_manage_content: boolean;
  last_login_at: string | null;
};

export type AuthResponse = {
  token: string;
  user: CurrentUser;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type CaptchaConfig = {
  enabled: boolean;
  provider: "hcaptcha" | "recaptcha" | string;
  site_key: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  count: number;
};

export type DepartmentItem = {
  id: string;
  name: string;
  code: string | null;
};

export type ContentFile = {
  id: string;
  original_file_name: string;
  mime_type: string | null;
  file_size: number | null;
  preview_url: string;
  download_url: string;
};

export type ResourceSummary = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content_type: string;
  access_level: string;
  published_at: string | null;
  thumbnail_url: string | null;
  category_slug: string | null;
  average_rating: number;
  review_count: number;
};

export type ResourceDetail = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  content_type: string;
  access_level: string;
  published_at: string | null;
  downloadable: boolean;
  copyright_status: string | null;
  licence_information: string | null;
  language: string | null;
  keywords: string | null;
  authors: string | null;
  publisher: string | null;
  publication_date: string | null;
  activity_date: string | null;
  source_institution: string | null;
  external_identifier: string | null;
  bibliographic_info: string | null;
  category: Category | null;
  files: ContentFile[];
  related_resources: ResourceSummary[];
  thumbnail_url: string | null;
  average_rating: number;
  review_count: number;
};

export type Review = {
  id: string;
  user_name: string;
  own: boolean;
  rating: number;
  body: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewAdmin = {
  id: string;
  content_item_id: string;
  resource_title: string;
  user_name: string;
  user_email: string;
  rating: number;
  body: string | null;
  created_at: string;
};

export type EventItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  venue: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  organizer: string | null;
  contact_email: string | null;
  registration_link: string | null;
  access_level: string;
  status: string;
  published_at: string | null;
  banner_image_url: string | null;
};

export type DemonstrationSite = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  district: string | null;
  site_type: string | null;
  technology: string | null;
  operational_status: string;
  operational_since: string | null;
  contact_person: string | null;
  contact_email: string | null;
  partner_institution: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  created_at: string;
  updated_at?: string;
  image_url: string | null;
};

export type HeroBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type HubStats = {
  total_resources: number;
  demonstration_sites: number;
  active_sites: number;
  published_events: number;
  training_materials: number;
  research_outputs: number;
};

export type HomeResponse = {
  resources: ResourceSummary[];
  events: EventItem[];
  stats: HubStats;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  affiliation: string | null;
  institution: string | null;
  job_title: string | null;
  status: string;
  created_at: string;
  last_login_at: string | null;
  roles: AppRole[];
};

export type BookmarkStatus = { saved: boolean };
export type Bookmark = { id: string; created_at: string; content: ResourceSummary };
export type RecentView = { viewed_at: string; content: ResourceSummary };
export type NotificationItem = {
  id: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

export type DashboardSummary = {
  total_resources: number;
  published_resources: number;
  draft_resources: number;
  pending_approval_resources: number;
  published_events: number;
  digitization_records: number;
  recent_content: { id: string; title: string; status: string; updated_at: string }[];
};

export type ContentEditor = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  content_type: string;
  status: string;
  access_level: string;
  downloadable: boolean;
  copyright_status: string | null;
  licence_information: string | null;
  language: string | null;
  keywords: string | null;
  authors: string | null;
  publisher: string | null;
  publication_date: string | null;
  activity_date: string | null;
  source_institution: string | null;
  external_identifier: string | null;
  bibliographic_info: string | null;
  category_id: string | null;
  department_id: string | null;
  author_id: string | null;
  published_at: string | null;
  thumbnail_url: string | null;
};

export type ApprovalItem = {
  id: string;
  title: string;
  slug: string;
  content_type: string;
  status: string;
  updated_at: string;
  summary: string | null;
};

export type EventAdmin = EventItem;

export type DigitizationRecord = {
  id: string;
  title: string;
  description: string | null;
  source_owner: string | null;
  physical_location: string | null;
  number_of_pages: number | null;
  digitization_status: string;
  scanned_file_path: string | null;
  scan_file_url: string | null;
  ocr_text: string | null;
  quality_status: string | null;
  copyright_status: string | null;
  content_item_id: string | null;
  scanned_by_name: string | null;
  reviewed_by_name: string | null;
  created_at: string;
  updated_at: string;
};

export type UserAdmin = {
  id: string;
  email: string;
  full_name: string;
  status: string;
  auth_type: "local" | "ldap" | "oap" | "hr";
  created_at: string;
  last_login_at: string | null;
  roles: AppRole[];
};

export type AdminSession = {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
  active: boolean;
  revoked_at: string | null;
};

export type TaxonomyEntry = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  code: string | null;
  school_id: string | null;
};

export type SystemSetting = {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string | null;
};

export type Reports = {
  total_resources: number;
  published_resources: number;
  pending_approval_resources: number;
  draft_resources: number;
  archived_resources: number;
  events: number;
  digitization_records: number;
  registered_users: number;
  files_stored: number;
  total_storage: string;
  total_views: number;
  total_downloads: number;
  content_by_type: Record<string, number>;
  recent_content: { id: string; title: string; status: string; updated_at: string }[];
};

export type ResourceAccessRow = {
  content_item_id: string;
  resource_title: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  view_count: number;
  download_count: number;
  last_accessed_at: string | null;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  old_value: string | null;
  new_value: string | null;
  ip_address: string | null;
  created_at: string;
};

export type Backup = {
  filename: string;
  type: "database" | "files" | "full" | "other";
  size_bytes: number;
  created_at: string;
};

export type BackupLocation = {
  path: string;
  is_default: boolean;
  writable: boolean;
};

export type ReadingListItem = {
  id: string;
  content_id: string;
  title: string;
  slug: string;
  note: string | null;
  position: number;
  added_at: string;
};

export type ReadingList = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  items: ReadingListItem[];
};

export type SiteMonitoringRecord = {
  id: string;
  site_id: string;
  visit_date: string;
  conducted_by: string | null;
  performance_rating: "excellent" | "good" | "fair" | "poor" | "needs_attention" | null;
  findings: string | null;
  recommendations: string | null;
  follow_up_required: boolean;
  follow_up_date: string | null;
  recorded_by_name: string | null;
  created_at: string;
};

export type RestoreResult = {
  filename: string;
  database_restored: boolean;
  files_restored: boolean;
  message: string;
};

export type TrainingSessionAdmin = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  mode: string | null;
  venue: string | null;
  instructor: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  capacity: number | null;
  requirements: string | null;
  contact_email: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  registration_count: number;
  image_url: string | null;
};

export type TrainingSessionListing = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  mode: string | null;
  venue: string | null;
  instructor: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  capacity: number | null;
  requirements: string | null;
  contact_email: string | null;
  status: string;
  published_at: string | null;
  registration_count: number;
  image_url: string | null;
};

export type TrainingSessionPublic = TrainingSessionListing & {
  registered: boolean;
};

export type TrainingRegistrationAdmin = {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  status: string;
  registered_at: string;
};

export type MyTrainingRegistration = {
  id: string;
  session_id: string;
  session_title: string;
  session_slug: string;
  session_start_date: string;
  status: string;
  registered_at: string;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  return trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080");
}

export function toApiUrl(path: string | null | undefined) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

function withAuthHeaders(headers?: HeadersInit) {
  const finalHeaders = new Headers(headers);
  const token = getAuthToken();
  if (token && !finalHeaders.has("Authorization")) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }
  return finalHeaders;
}

export function authorizedFetch(pathOrUrl: string, init: RequestInit = {}) {
  const target = /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : toApiUrl(pathOrUrl);
  return fetch(target, {
    ...init,
    headers: withAuthHeaders(init.headers),
  });
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  rawBody?: BodyInit | null;
  /** Override the default 30-second timeout (ms). Use a higher value for uploads. */
  timeout?: number;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { rawBody, headers, body, timeout = REQUEST_TIMEOUT_MS, ...rest } = options;
  const finalHeaders = withAuthHeaders(headers);
  let payload = rawBody ?? null;

  if (body != null && rawBody == null) {
    finalHeaders.set("Content-Type", "application/json");
    payload = typeof body === "string" ? body : JSON.stringify(body);
  }

  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeout);

  let response: Response;
  try {
    response = await fetch(toApiUrl(path), {
      ...rest,
      headers: finalHeaders,
      body: payload,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timerId);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out — please try again.", 0);
    }
    throw new ApiError("Unable to connect. Please check your internet connection.", 0, true);
  }
  clearTimeout(timerId);

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const text = await response.text();
      if (text) {
        try {
          const parsed = JSON.parse(text);
          message = parsed.message ?? message;
        } catch {
          message = text;
        }
      }
    } catch { /* ignore */ }

    const apiError = new ApiError(message, response.status);
    // For 401s outside auth routes, signal the app to clear the session
    if (response.status === 401 && !path.startsWith("/api/auth/")) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("api:unauthorized"));
      }
    }
    throw apiError;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }
  return response.text() as T;
}

export const api = {
  auth: {
    login: (payload: { email: string; password: string }) =>
      request<AuthResponse>("/api/auth/login", { method: "POST", body: payload }),
    ldapLogin: (payload: { unza_id: string; password: string }) =>
      request<AuthResponse>("/api/auth/ldap-login", { method: "POST", body: payload }),
    studentLogin: (payload: { username: string; password: string; instance: string }) =>
      request<AuthResponse>("/api/auth/student-login", { method: "POST", body: payload }),
    staffLogin: (payload: { username: string; password: string }) =>
      request<AuthResponse>("/api/auth/staff-login", { method: "POST", body: payload }),
    register: (payload: {
      full_name: string;
      email: string;
      password: string;
      phone?: string;
      affiliation?: string;
      unza_id?: string;
      institution?: string;
      job_title?: string;
      captcha_token?: string;
      website?: string;
    }) => request<AuthResponse>("/api/auth/register", { method: "POST", body: payload }),
    me: () => request<CurrentUser>("/api/auth/me"),
    verifyEmail: (token: string) =>
      request<void>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`),
    forgotPassword: (payload: { email: string }) =>
      request<ForgotPasswordResponse>("/api/auth/forgot-password", { method: "POST", body: payload }),
    resetPassword: (payload: { token: string; password: string }) =>
      request<void>("/api/auth/reset-password", { method: "POST", body: payload }),
    changePassword: (payload: { current_password: string; password: string }) =>
      request<void>("/api/auth/change-password", { method: "POST", body: payload }),
    logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  },
  public: {
    home: () => request<HomeResponse>("/api/public/home"),
    banners: () => request<HeroBanner[]>("/api/public/banners"),
    resources: (params: { q?: string; type?: string; category?: string; department?: string }) =>
      request<ResourceSummary[]>(`/api/public/resources?${new URLSearchParams({
        q: params.q ?? "",
        type: params.type ?? "all",
        ...(params.category ? { category: params.category } : {}),
        ...(params.department ? { department: params.department } : {}),
      }).toString()}`),
    resource: (slug: string) => request<ResourceDetail>(`/api/public/resources/${slug}`),
    recordView: (id: string) => request<void>(`/api/public/resources/${id}/views`, { method: "POST" }),
    reviews: (id: string) => request<Review[]>(`/api/public/resources/${id}/reviews`),
    events: () => request<EventItem[]>("/api/public/events"),
    event: (slug: string) => request<EventItem>(`/api/public/events/${slug}`),
    categories: () => request<Category[]>("/api/public/categories"),
    departments: () => request<DepartmentItem[]>("/api/public/departments"),
    gallery: () => request<ResourceSummary[]>("/api/public/gallery"),
    sites: () => request<DemonstrationSite[]>("/api/public/sites"),
    site: (slug: string) => request<DemonstrationSite>(`/api/public/sites/${slug}`),
    captchaConfig: () => request<CaptchaConfig>("/api/public/captcha-config"),
    trainingSessions: () => request<TrainingSessionListing[]>("/api/public/training"),
    rss: () => request<string>("/api/public/rss"),
    sitemap: () => request<string>("/api/public/sitemap"),
  },
  account: {
    profile: () => request<Profile>("/api/account/profile"),
    updateProfile: (payload: { full_name: string; phone: string; institution?: string; job_title?: string }) =>
      request<Profile>("/api/account/profile", { method: "PUT", body: payload }),
    bookmarks: () => request<Bookmark[]>("/api/account/bookmarks"),
    bookmarkStatus: (contentId: string) =>
      request<BookmarkStatus>(`/api/account/bookmarks/${contentId}/status`),
    addBookmark: (contentId: string) =>
      request<void>(`/api/account/bookmarks/${contentId}`, { method: "POST" }),
    removeBookmark: (contentId: string) =>
      request<void>(`/api/account/bookmarks/${contentId}`, { method: "DELETE" }),
    submitReview: (contentId: string, payload: { rating: number; body?: string }) =>
      request<Review>(`/api/account/reviews/${contentId}`, { method: "POST", body: payload }),
    deleteReview: (contentId: string) =>
      request<void>(`/api/account/reviews/${contentId}`, { method: "DELETE" }),
    recentViews: () => request<RecentView[]>("/api/account/recent-views"),
    notifications: () => request<NotificationItem[]>("/api/account/notifications"),
    markNotificationsRead: (payload: { all: boolean; ids?: string[] }) =>
      request<void>("/api/account/notifications/read", { method: "PUT", body: payload }),
    readingLists: () => request<ReadingList[]>("/api/account/reading-lists"),
    createReadingList: (payload: { name: string; description?: string; is_public?: boolean }) =>
      request<ReadingList>("/api/account/reading-lists", { method: "POST", body: payload }),
    updateReadingList: (id: string, payload: { name: string; description?: string; is_public?: boolean }) =>
      request<ReadingList>(`/api/account/reading-lists/${id}`, { method: "PUT", body: payload }),
    deleteReadingList: (id: string) =>
      request<void>(`/api/account/reading-lists/${id}`, { method: "DELETE" }),
    addReadingListItem: (id: string, payload: { content_id: string; note?: string }) =>
      request<ReadingList>(`/api/account/reading-lists/${id}/items`, { method: "POST", body: payload }),
    removeReadingListItem: (itemId: string) =>
      request<void>(`/api/account/reading-lists/items/${itemId}`, { method: "DELETE" }),
  },
  admin: {
    dashboard: () => request<DashboardSummary>("/api/admin/dashboard"),
    content: (status = "all") => request<ContentEditor[]>(`/api/admin/content?status=${encodeURIComponent(status)}`),
    createContent: (payload: Record<string, unknown>) =>
      request<ContentEditor>("/api/admin/content", { method: "POST", body: payload }),
    updateContent: (id: string, payload: Record<string, unknown>) =>
      request<ContentEditor>(`/api/admin/content/${id}`, { method: "PUT", body: payload }),
    transitionContent: (id: string, payload: { action: string; comments?: string }) =>
      request<void>(`/api/admin/content/${id}/transition`, { method: "POST", body: payload }),
    contentFiles: (id: string) => request<ContentFile[]>(`/api/admin/content/${id}/files`),
    uploadContentFile: (id: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request<ContentFile>(`/api/admin/content/${id}/files`, { method: "POST", rawBody: formData, timeout: 300_000 });
    },
    fixDraftAccessLevels: () =>
      request<{ fixed: number }>("/api/admin/content/fix-access-levels", { method: "POST" }),
    deleteContent: (id: string) =>
      request<void>(`/api/admin/content/${id}`, { method: "DELETE" }),
    deleteContentFile: (fileId: string) =>
      request<void>(`/api/admin/content/files/${fileId}`, { method: "DELETE" }),
    approvals: () => request<ApprovalItem[]>("/api/admin/approvals"),
    approvalAction: (id: string, payload: { action: string; comments?: string }) =>
      request<void>(`/api/admin/approvals/${id}/action`, { method: "POST", body: payload }),
    events: () => request<EventAdmin[]>("/api/admin/events"),
    createEvent: (payload: Record<string, unknown>) =>
      request<EventAdmin>("/api/admin/events", { method: "POST", body: payload }),
    updateEvent: (id: string, payload: Record<string, unknown>) =>
      request<EventAdmin>(`/api/admin/events/${id}`, { method: "PUT", body: payload }),
    publishEvent: (id: string) => request<void>(`/api/admin/events/${id}/publish`, { method: "POST" }),
    deleteEvent: (id: string) => request<void>(`/api/admin/events/${id}`, { method: "DELETE" }),
    uploadEventImage: (id: string, file: File) => {
      const form = new FormData();
      form.append("file", file);
      return request<{ url: string }>(`/api/admin/events/${id}/image`, { method: "POST", rawBody: form });
    },
    digitization: () => request<DigitizationRecord[]>("/api/admin/digitization"),
    createDigitization: (payload: Record<string, unknown>) =>
      request<DigitizationRecord>("/api/admin/digitization", { method: "POST", body: payload }),
    updateDigitization: (id: string, payload: Record<string, unknown>) =>
      request<DigitizationRecord>(`/api/admin/digitization/${id}`, { method: "PUT", body: payload }),
    advanceDigitizationStatus: (id: string, status: string) =>
      request<DigitizationRecord>(`/api/admin/digitization/${id}/status`, { method: "PATCH", body: { status } }),
    promoteToLibrary: (id: string) =>
      request<{ content_item_id: string; record: DigitizationRecord }>(`/api/admin/digitization/${id}/promote`, { method: "POST" }),
    uploadScanFile: (id: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request<DigitizationRecord>(`/api/admin/digitization/${id}/scan-file`, { method: "POST", rawBody: formData, timeout: 300_000 });
    },
    deleteDigitization: (id: string) =>
      request<void>(`/api/admin/digitization/${id}`, { method: "DELETE" }),
    users: () => request<UserAdmin[]>("/api/admin/users"),
    updateUserRoles: (id: string, roles: AppRole[]) =>
      request<void>(`/api/admin/users/${id}/roles`, { method: "PUT", body: { roles } }),
    updateUserStatus: (id: string, status: string) =>
      request<void>(`/api/admin/users/${id}/status`, { method: "PUT", body: { status } }),
    deleteUser: (id: string) =>
      request<void>(`/api/admin/users/${id}`, { method: "DELETE" }),
    adminResetPassword: (id: string, password: string) =>
      request<void>(`/api/admin/users/${id}/set-password`, { method: "POST", body: { password } }),
    sessions: () => request<AdminSession[]>("/api/admin/sessions"),
    revokeSession: (userId: string) =>
      request<void>(`/api/admin/sessions/${userId}`, { method: "DELETE" }),
    uploadThumbnail: (id: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request<{ url: string }>(`/api/admin/content/${id}/thumbnail`, { method: "POST", rawBody: formData, timeout: 120_000 });
    },
    taxonomy: (type: string) => request<TaxonomyEntry[]>(`/api/admin/taxonomy/${type}`),
    createTaxonomy: (type: string, payload: Record<string, unknown>) =>
      request<TaxonomyEntry>(`/api/admin/taxonomy/${type}`, { method: "POST", body: payload }),
    updateTaxonomy: (type: string, id: string, payload: Record<string, unknown>) =>
      request<TaxonomyEntry>(`/api/admin/taxonomy/${type}/${id}`, { method: "PUT", body: payload }),
    deleteTaxonomy: (type: string, id: string) =>
      request<void>(`/api/admin/taxonomy/${type}/${id}`, { method: "DELETE" }),
    settings: () => request<SystemSetting[]>("/api/admin/settings"),
    updateSetting: (key: string, value: string) =>
      request<SystemSetting>(`/api/admin/settings/${key}`, { method: "PUT", body: { value } }),
    reports: () => request<Reports>("/api/admin/reports"),
    resourceAccess: () => request<ResourceAccessRow[]>("/api/admin/reports/access"),
    reportDownloadUrl: () => "/api/admin/reports/download/pdf",
    reviews: () => request<ReviewAdmin[]>("/api/admin/reviews"),
    deleteReview: (id: string) => request<void>(`/api/admin/reviews/${id}`, { method: "DELETE" }),
    audit: (params?: { action?: string; entityType?: string }) => {
      const q = new URLSearchParams();
      if (params?.action) q.set("action", params.action);
      if (params?.entityType) q.set("entityType", params.entityType);
      const qs = q.toString();
      return request<AuditLog[]>(`/api/admin/audit${qs ? "?" + qs : ""}`);
    },
    listBackups: () => request<Backup[]>("/api/admin/backup"),
    createBackup: (type: "database" | "files" | "full") =>
      request<Backup>(`/api/admin/backup/${type}`, { method: "POST" }),
    deleteBackup: (filename: string) =>
      request<void>(`/api/admin/backup/${encodeURIComponent(filename)}`, { method: "DELETE" }),
    backupDownloadUrl: (filename: string) =>
      `/api/admin/backup/${encodeURIComponent(filename)}/download`,
    backupLocation: () => request<BackupLocation>("/api/admin/backup/location"),
    updateBackupLocation: (path: string) =>
      request<BackupLocation>("/api/admin/backup/location", { method: "PUT", body: { path } }),
    restoreBackup: (filename: string) =>
      request<RestoreResult>(`/api/admin/backup/${encodeURIComponent(filename)}/restore`, { method: "POST" }),
    banners: () => request<HeroBanner[]>("/api/admin/banners"),
    createBanner: (payload: Record<string, unknown>) =>
      request<HeroBanner>("/api/admin/banners", { method: "POST", body: payload }),
    updateBanner: (id: string, payload: Record<string, unknown>) =>
      request<HeroBanner>(`/api/admin/banners/${id}`, { method: "PUT", body: payload }),
    deleteBanner: (id: string) =>
      request<void>(`/api/admin/banners/${id}`, { method: "DELETE" }),
    uploadBannerImage: (id: string, file: File) => {
      const form = new FormData();
      form.append("file", file);
      return request<{ url: string }>(`/api/admin/banners/${id}/image`, { method: "POST", rawBody: form });
    },
    sites: () => request<DemonstrationSite[]>("/api/admin/sites"),
    createSite: (payload: Record<string, unknown>) =>
      request<DemonstrationSite>("/api/admin/sites", { method: "POST", body: payload }),
    updateSite: (id: string, payload: Record<string, unknown>) =>
      request<DemonstrationSite>(`/api/admin/sites/${id}`, { method: "PUT", body: payload }),
    deleteSite: (id: string) =>
      request<void>(`/api/admin/sites/${id}`, { method: "DELETE" }),
    uploadSiteImage: (id: string, file: File) => {
      const form = new FormData();
      form.append("file", file);
      return request<{ url: string }>(`/api/admin/sites/${id}/image`, { method: "POST", rawBody: form });
    },
    siteMonitoringRecords: (siteId: string) =>
      request<SiteMonitoringRecord[]>(`/api/admin/sites/${siteId}/monitoring`),
    createSiteMonitoringRecord: (siteId: string, payload: Record<string, unknown>) =>
      request<SiteMonitoringRecord>(`/api/admin/sites/${siteId}/monitoring`, { method: "POST", body: payload }),
    updateSiteMonitoringRecord: (recordId: string, payload: Record<string, unknown>) =>
      request<SiteMonitoringRecord>(`/api/admin/sites/monitoring/${recordId}`, { method: "PUT", body: payload }),
    deleteSiteMonitoringRecord: (recordId: string) =>
      request<void>(`/api/admin/sites/monitoring/${recordId}`, { method: "DELETE" }),
    trainingSessions: () => request<TrainingSessionAdmin[]>("/api/admin/training"),
    createTrainingSession: (payload: Record<string, unknown>) =>
      request<TrainingSessionAdmin>("/api/admin/training", { method: "POST", body: payload }),
    updateTrainingSession: (id: string, payload: Record<string, unknown>) =>
      request<TrainingSessionAdmin>(`/api/admin/training/${id}`, { method: "PUT", body: payload }),
    publishTrainingSession: (id: string) =>
      request<void>(`/api/admin/training/${id}/publish`, { method: "POST" }),
    deleteTrainingSession: (id: string) =>
      request<void>(`/api/admin/training/${id}`, { method: "DELETE" }),
    trainingRegistrations: (id: string) =>
      request<TrainingRegistrationAdmin[]>(`/api/admin/training/${id}/registrations`),
    uploadTrainingImage: (id: string, file: File) => {
      const form = new FormData();
      form.append("file", file);
      return request<{ url: string }>(`/api/admin/training/${id}/image`, { method: "POST", rawBody: form });
    },
  },
  userTraining: {
    sessions: () => request<TrainingSessionPublic[]>("/api/account/training"),
    register: (sessionId: string) =>
      request<void>(`/api/account/training/${sessionId}/register`, { method: "POST" }),
    cancel: (sessionId: string) =>
      request<void>(`/api/account/training/${sessionId}/register`, { method: "DELETE" }),
    myRegistrations: () => request<MyTrainingRegistration[]>("/api/account/training/my-registrations"),
  },
};
