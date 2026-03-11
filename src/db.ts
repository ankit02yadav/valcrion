// ============================================================
// VALCRION — API CLIENT  (replaces localStorage mock)
// All functions now call the Express backend.
// ============================================================

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// ─── Token helpers ────────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem("vl_token");
}

export function setToken(token: string): void {
  localStorage.setItem("vl_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("vl_token");
  localStorage.removeItem("vl_session");
}

// ─── Base fetch wrapper ───────────────────────────────────────
async function api(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch (networkErr) {
    throw new Error(
      "Cannot reach the server. Make sure the backend is running on port 5000. (cd valcrion/server && npm run dev)"
    );
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned invalid response (status ${res.status})`);
  }

  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────
export const AuthDB = {
  async login(email: string, password: string) {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false);
    setToken(data.token);
    localStorage.setItem("vl_session", JSON.stringify(data.user));
    return data.user;
  },

  async register(name: string, email: string, password: string) {
    const data = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }, false);
    setToken(data.token);
    localStorage.setItem("vl_session", JSON.stringify(data.user));
    return data.user;
  },
};

// ─── Users ────────────────────────────────────────────────────
export const UserDB = {
  getAll: () => api("/users"),

  addDeveloper: (data: { name: string; email: string }, password: string) =>
    api("/users/developer", {
      method: "POST",
      body: JSON.stringify({ ...data, password }),
    }),

  toggleActive: (id: string) =>
    api(`/users/${id}/toggle`, { method: "PATCH" }),

  remove: (id: string) =>
    api(`/users/${id}`, { method: "DELETE" }),
};

// ─── Projects ─────────────────────────────────────────────────
export const ProjectDB = {
  getAll: () => api("/projects"),
  getForClient: () => api("/projects"),
  getForDeveloper: () => api("/projects"),

  create: (data: { title: string; description: string; plan: string }) =>
    api("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, any>) =>
    api(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ─── Chat ─────────────────────────────────────────────────────
export const ChatDB = {
  getForProject: (projectId: string) => api(`/chat/${projectId}`),

  send: (data: { projectId: string; content: string }) =>
    api("/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Blog ─────────────────────────────────────────────────────
export const BlogDB = {
  getAll: (publishedOnly = false) =>
    api(`/blog${publishedOnly ? "" : "?all=true"}`, {}, !publishedOnly),

  create: (data: Record<string, any>) =>
    api("/blog", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    api(`/blog/${id}`, { method: "DELETE" }),
};

// ─── Jobs ─────────────────────────────────────────────────────
export const JobDB = {
  getAll: () => api("/jobs"),

  submit: (data: Record<string, any>) =>
    api("/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    }, false),

  updateStatus: (id: string, status: string) =>
    api(`/jobs/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// ─── Contact ──────────────────────────────────────────────────
export const ContactDB = {
  getAll: () => api("/contact"),

  submit: (data: Record<string, any>) =>
    api("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }, false),

  markRead: (id: string) =>
    api(`/contact/${id}/read`, { method: "PATCH" }),
};

// ─── Password
export const PasswordDB = {
  change: (oldPassword: string, newPassword: string) =>
    api("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
    }),
};

// ─── Reviews ──────────────────────────────────────────────────
export const ReviewDB = {
  getAll: ()  => api("/reviews", {}, false),        // public approved
  getAllAdmin: () => api("/reviews/all"),             // admin: all reviews
  submit: (data: Record<string, any>) => api("/reviews", { method: "POST", body: JSON.stringify(data) }),
  approve: (id: string) => api(`/reviews/${id}/approve`, { method: "PATCH" }),
  remove:  (id: string) => api(`/reviews/${id}`,   { method: "DELETE" }),
};

// ─── Hosting ──────────────────────────────────────────────────
export const HostingDB = {
  getAll: () => api("/hosting"),
  submit: (data: Record<string, any>) => api("/hosting", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, any>) => api(`/hosting/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

// ─── Seed (no-op — server handles seeding) ───────────────────
export function seedAdmin() {}
