import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Briefcase, FileText, Mail, Plus, Trash2,
  CheckCircle, XCircle, LayoutDashboard, PenLine, UserPlus,
  Copy, Eye, EyeOff, ExternalLink, Star, Server, MessageSquare, Download, Send, X, Settings,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { UserDB, JobDB, ContactDB, BlogDB, ProjectDB, ReviewDB, HostingDB, ChatDB, PasswordDB } from "../db";
import { ROUTES } from "../constants";
import type { User, JobApplication, ContactSubmission, BlogPost, Project, Review, HostingRequest } from "../types";
import "./Profile.css";
import "./Admin.css";

type Tab = "dashboard" | "users" | "projects" | "jobs" | "contacts" | "blog" | "reviews" | "hosting" | "chat" | "settings";

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hostingReqs, setHostingReqs] = useState<HostingRequest[]>([]);
  const [expandedProject, setExpandedProject] = useState<Project | null>(null);

  // Chat state — project chat
  const [chatProject, setChatProject] = useState<Project | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [adminChatInput, setAdminChatInput] = useState("");
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Chat state — dev-admin private chat
  const [chatSubTab, setChatSubTab] = useState<"project" | "dev">("project");
  const [selectedDev, setSelectedDev] = useState<User | null>(null);
  const [devChatMessages, setDevChatMessages] = useState<any[]>([]);
  const [devChatInput, setDevChatInput] = useState("");
  const devChatEndRef = React.useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddDev, setShowAddDev] = useState(false);
  const [devForm, setDevForm] = useState({ name: "", email: "", password: "" });
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [blogForm, setBlogForm] = useState({ title: "", excerpt: "", content: "", tags: "", published: true });

  const [approveModal, setApproveModal] = useState<JobApplication | null>(null);
  const [approveForm, setApproveForm] = useState({ email: "", password: "" });
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveSuccess, setApproveSuccess] = useState(false);
  const [showApprovePwd, setShowApprovePwd] = useState(false);
  const [copiedText, setCopiedText] = useState("");

  // Hosting delivery form
  const [deliverModal, setDeliverModal] = useState<HostingRequest | null>(null);
  const [deliverForm, setDeliverForm] = useState({ deliveryLink: "", credentials: "" });

  const [pwdForm, setPwdForm] = useState({ old: "", next: "", confirm: "" });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const handleChangePassword = async () => {
    setPwdError(""); setPwdSuccess(false);
    if (pwdForm.next !== pwdForm.confirm) { setPwdError("New passwords do not match."); return; }
    if (pwdForm.next.length < 6) { setPwdError("Password must be at least 6 characters."); return; }
    setPwdLoading(true);
    try {
      await PasswordDB.change(pwdForm.old, pwdForm.next);
      setPwdSuccess(true);
      setPwdForm({ old: "", next: "", confirm: "" });
    } catch (err: any) { setPwdError(err.message); }
    finally { setPwdLoading(false); }
  };

  useEffect(() => {
    if (!user) { navigate(ROUTES.login); return; }
    if (user.role !== "admin") { navigate(ROUTES.home); return; }
    loadAll();
  }, [user]);

  useEffect(() => {
    if (chatProject) loadChatMessages(chatProject.id);
  }, [chatProject]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const loadChatMessages = async (projectId: string) => {
    try { setChatMessages(await ChatDB.getForProject(projectId)); }
    catch (err) { console.error(err); }
  };

  const sendAdminMessage = async () => {
    if (!adminChatInput.trim() || !chatProject) return;
    try {
      await ChatDB.send({ projectId: chatProject.id, content: adminChatInput.trim() });
      setAdminChatInput("");
      loadChatMessages(chatProject.id);
    } catch (err) { console.error(err); }
  };

  const handleAdminChatKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAdminMessage(); }
  };

  useEffect(() => {
    if (selectedDev) loadDevChatMessages(selectedDev.id);
  }, [selectedDev]);

  useEffect(() => {
    devChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [devChatMessages]);

  const loadDevChatMessages = async (devId: string) => {
    try { setDevChatMessages(await ChatDB.getForProject(`admin-dev-${devId}`)); }
    catch (err) { console.error(err); }
  };

  const sendDevMessage = async () => {
    if (!devChatInput.trim() || !selectedDev) return;
    try {
      await ChatDB.send({ projectId: `admin-dev-${selectedDev.id}`, content: devChatInput.trim() });
      setDevChatInput("");
      loadDevChatMessages(selectedDev.id);
    } catch (err) { console.error(err); }
  };

  const handleDevChatKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendDevMessage(); }
  };

  const loadAll = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [u, j, c, p, pr, rv, hr] = await Promise.all([
        UserDB.getAll(), JobDB.getAll(), ContactDB.getAll(),
        BlogDB.getAll(false), ProjectDB.getAll(), ReviewDB.getAllAdmin(), HostingDB.getAll(),
      ]);
      setUsers(u); setJobs(j); setContacts(c);
      setPosts(p); setProjects(pr); setReviews(rv); setHostingReqs(hr);
    } catch (err: any) {
      setLoadError(err.message || "Failed to load data. Is the backend running?");
      console.error("Admin loadAll error:", err);
    } finally {
      setLoading(false);
    }
  };

  const devs = users.filter(u => u.role === "developer");
  const clients = users.filter(u => u.role === "client");
  const pendingJobs = jobs.filter(j => j.status === "pending");

  // Auto-assign: find least-loaded active dev
  const autoAssignDev = (): string | null => {
    const activeDev = devs.filter(d => d.isActive);
    if (activeDev.length === 0) return null;
    const devLoad = activeDev.map(d => ({
      id: d.id,
      load: projects.filter(p => p.developerId === d.id && !["completed"].includes(p.status)).length,
    }));
    devLoad.sort((a, b) => a.load - b.load);
    return devLoad[0].id;
  };

  const assignProject = async (projectId: string, devId: string) => {
    await ProjectDB.update(projectId, { developerId: devId, status: "assigned" });
    loadAll();
  };

  const autoAssign = async (projectId: string) => {
    const devId = autoAssignDev();
    if (!devId) { alert("No active developers available."); return; }
    await assignProject(projectId, devId);
  };

  const finalizeProject = async (projectId: string) => {
    await ProjectDB.update(projectId, { status: "completed" });
    loadAll();
  };

  const openApproveModal = (job: JobApplication) => {
    setApproveModal(job); setApproveForm({ email: job.email, password: "" }); setApproveSuccess(false);
  };

  const handleApproveAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveModal || !approveForm.email || !approveForm.password) return;
    setApproveLoading(true);
    try {
      await UserDB.addDeveloper({ name: approveModal.name, email: approveForm.email }, approveForm.password);
      await JobDB.updateStatus(approveModal.id, "approved");
      setApproveLoading(false); setApproveSuccess(true); loadAll();
    } catch (err: any) { setApproveLoading(false); alert(err.message); }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const addDeveloper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devForm.name || !devForm.email || !devForm.password) return;
    try {
      await UserDB.addDeveloper({ name: devForm.name, email: devForm.email }, devForm.password);
      setDevForm({ name: "", email: "", password: "" }); setShowAddDev(false); loadAll();
    } catch (err: any) { alert(err.message); }
  };

  const removeUser = async (id: string) => {
    if (window.confirm("Remove this user?")) { await UserDB.remove(id); loadAll(); }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !blogForm.title || !blogForm.content) return;
    try {
      await BlogDB.create({
        title: blogForm.title,
        slug: blogForm.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        excerpt: blogForm.excerpt, content: blogForm.content,
        tags: blogForm.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
        authorId: user.id, published: blogForm.published,
      });
      setBlogForm({ title: "", excerpt: "", content: "", tags: "", published: true });
      setShowBlogForm(false); loadAll();
    } catch (err: any) { alert(err.message); }
  };

  const confirmPayment = async (id: string) => {
    await HostingDB.update(id, { status: "in_progress", paymentConfirmed: true });
    loadAll();
  };

  const openDeliverModal = (req: HostingRequest) => {
    setDeliverModal(req);
    setDeliverForm({ deliveryLink: req.deliveryLink || "", credentials: req.credentials || "" });
  };

  const submitDelivery = async () => {
    if (!deliverModal) return;
    await HostingDB.update(deliverModal.id, {
      status: "delivered",
      deliveryLink: deliverForm.deliveryLink,
      credentials: deliverForm.credentials,
    });
    setDeliverModal(null); loadAll();
  };

  return (
    <main className="profile page">
      <div className="profile__orb" />

      {/* ── Approve Developer Modal ── */}
      {approveModal && (
        <div className="admin-overlay">
          <div className="admin-approve-modal glass-elevated">
            {!approveSuccess ? (
              <>
                <div className="admin-approve-header">
                  <div className="admin-approve-icon"><UserPlus size={22} /></div>
                  <div><h3>Approve & Create Account</h3><p className="admin-approve-sub">For: <strong>{approveModal.name}</strong></p></div>
                </div>
                <div className="admin-approve-applicant">
                  <div className="admin-approve-row"><span className="admin-approve-label">Email</span><span className="admin-approve-val">{approveModal.email}</span></div>
                  <div className="admin-approve-row"><span className="admin-approve-label">Skills</span><span className="admin-approve-val">{approveModal.skills?.join(", ")}</span></div>
                  <div className="admin-approve-row"><span className="admin-approve-label">Experience</span><span className="admin-approve-val">{approveModal.experience}</span></div>
                </div>
                <form onSubmit={handleApproveAndCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Login Email</label>
                    <input type="email" className="form-input" value={approveForm.email} onChange={e => setApproveForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Set Password</label>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <input type={showApprovePwd ? "text" : "password"} className="form-input" value={approveForm.password} onChange={e => setApproveForm(f => ({ ...f, password: e.target.value }))} style={{ paddingRight: 44 }} required />
                      <button type="button" className="auth__pwd-toggle" onClick={() => setShowApprovePwd(!showApprovePwd)}>
                        {showApprovePwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={approveLoading}>
                      {approveLoading ? <span className="spinner" /> : <><CheckCircle size={15} /> Approve & Create</>}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => setApproveModal(null)}>Cancel</button>
                  </div>
                </form>
              </>
            ) : (
              <div className="admin-approve-success">
                <div className="admin-approve-success-icon"><CheckCircle size={36} style={{ color: "var(--success)" }} /></div>
                <h3>Developer account created!</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: 20 }}>Share with <strong>{approveModal.name}</strong></p>
                <div className="admin-credentials">
                  {[{ label: "Login URL", val: "valcrion.com/login", key: "url" }, { label: "Email", val: approveForm.email, key: "email" }, { label: "Password", val: approveForm.password, key: "pwd" }].map(item => (
                    <div key={item.key} className="admin-credential-row">
                      <div><div className="admin-credential-label">{item.label}</div><div className="admin-credential-val">{item.val}</div></div>
                      <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(item.val, item.key)}>
                        <Copy size={12} /> {copiedText === item.key ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                    onClick={() => copyToClipboard(`Valcrion Developer Access\nURL: valcrion.com/login\nEmail: ${approveForm.email}\nPassword: ${approveForm.password}`, "all")}>
                    <Copy size={12} /> {copiedText === "all" ? "Copied!" : "Copy All"}
                  </button>
                </div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 20, width: "100%", justifyContent: "center" }} onClick={() => setApproveModal(null)}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Deliver Modal ── */}
      {deliverModal && (
        <div className="admin-overlay">
          <div className="admin-approve-modal glass-elevated">
            <div className="admin-approve-header">
              <div className="admin-approve-icon" style={{ background: "linear-gradient(135deg, #059669, #047857)" }}><Download size={22} /></div>
              <div><h3>Deliver to Client</h3><p className="admin-approve-sub">{deliverModal.projectTitle} — {deliverModal.type === "zip" ? "ZIP File" : "Hosting"}</p></div>
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => setDeliverModal(null)}><XCircle size={16} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">{deliverModal.type === "zip" ? "ZIP / Drive Download Link" : "Live Site URL"}</label>
                <input type="url" className="form-input" value={deliverForm.deliveryLink} onChange={e => setDeliverForm(f => ({ ...f, deliveryLink: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="form-label">Credentials / Access Info {deliverModal.type === "hosting" && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(hosting login, cPanel, etc.)</span>}</label>
                <textarea className="form-input" rows={4} value={deliverForm.credentials} onChange={e => setDeliverForm(f => ({ ...f, credentials: e.target.value }))} placeholder="Username: ...\nPassword: ...\nPanel: ..." />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={submitDelivery}><CheckCircle size={15} /> Mark as Delivered</button>
                <button className="btn btn-ghost" onClick={() => setDeliverModal(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Project Detail Modal ── */}
      {expandedProject && (
        <div className="admin-overlay" onClick={() => setExpandedProject(null)}>
          <div className="project-detail-modal glass-elevated" onClick={e => e.stopPropagation()}>
            <div className="project-detail-header">
              <div>
                <h2>{expandedProject.title}</h2>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <span className={`badge ${expandedProject.status === "completed" || expandedProject.status === "client_approved" ? "badge-green" : expandedProject.status === "review" ? "badge-yellow" : "badge-purple"}`}>{expandedProject.status.replace("_", " ")}</span>
                  <span className="tag">{expandedProject.plan}</span>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setExpandedProject(null)}><XCircle size={16} /></button>
            </div>
            <div className="project-detail-body">
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>{expandedProject.description}</p>
              {expandedProject.demoLink && (
                <a href={expandedProject.demoLink} target="_blank" rel="noreferrer" className="approve-demo-banner">
                  <ExternalLink size={14} /><span>Demo: {expandedProject.demoLink}</span><span style={{ marginLeft: "auto", color: "var(--accent)" }}>Open ↗</span>
                </a>
              )}
              {expandedProject.clientRating && (
                <div className="project-feedback-badge">
                  <div className="project-stars">
                    {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= expandedProject.clientRating! ? "#f59e0b" : "none"} stroke={s <= expandedProject.clientRating! ? "#f59e0b" : "var(--text-muted)"} />)}
                  </div>
                  {expandedProject.clientFeedback && <p className="project-feedback-text">"{expandedProject.clientFeedback}"</p>}
                </div>
              )}
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Created {new Date(expandedProject.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="container profile__layout">
        <aside className="profile__sidebar glass">
          <div className="profile__user">
            <div className="profile__avatar" style={{ background: "linear-gradient(135deg, #dc2626, #9333ea)" }}>A</div>
            <div>
              <div className="profile__name">Admin</div>
              <div className="profile__role badge badge-red">Admin Panel</div>
            </div>
          </div>
          <nav className="profile__nav">
            {([
              { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={15}/> },
              { key: "users",     label: "Users",     icon: <Users size={15}/> },
              { key: "projects",  label: "Projects",  icon: <Briefcase size={15}/> },
              { key: "jobs",      label: "Applications", icon: <FileText size={15}/>, count: pendingJobs.length },
              { key: "contacts",  label: "Messages",  icon: <Mail size={15}/>, count: contacts.filter(c=>!c.read).length },
              { key: "blog",      label: "Blog",      icon: <PenLine size={15}/> },
              { key: "reviews",   label: "Reviews",   icon: <Star size={15}/>, count: reviews.filter(r=>!r.approved).length },
              { key: "hosting",   label: "Hosting",   icon: <Server size={15}/>, count: hostingReqs.filter(h=>h.status==="pending_payment").length },
              { key: "chat",      label: "Chat",      icon: <MessageSquare size={15}/> },
              { key: "settings",  label: "Settings",  icon: <Settings size={15}/> },
            ] as any[]).map(item => (
              <button key={item.key} className={`profile__nav-btn ${tab === item.key ? "active" : ""}`} onClick={() => setTab(item.key as Tab)}>
                {item.icon} {item.label}
                {item.count > 0 && <span className="profile__nav-count">{item.count}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <div className="profile__main">
          {loadError && (
            <div style={{ padding: "16px 20px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "var(--radius)", marginBottom: 20, color: "var(--error)", fontSize: "0.88rem" }}>
              ⚠️ {loadError}
            </div>
          )}
          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
              <span className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          )}
          {!loading && tab === "dashboard" && (
            <div className="animate-fade-in">
              <div className="profile__section-header"><h2>Dashboard</h2></div>
              <div className="admin-stats">
                {[
                  { label: "Clients",      value: clients.length,                                       color: "#8b5cf6" },
                  { label: "Developers",   value: devs.length,                                          color: "#6d28d9" },
                  { label: "Projects",     value: projects.length,                                      color: "#7c3aed" },
                  { label: "Applications", value: pendingJobs.length,                                   color: "#a78bfa" },
                  { label: "Messages",     value: contacts.filter(c=>!c.read).length,                   color: "#c4b5fd" },
                  { label: "Reviews",      value: reviews.filter(r=>!r.approved).length + " pending",   color: "#ddd6fe" },
                  { label: "Hosting Reqs", value: hostingReqs.filter(h=>h.status!=="delivered").length, color: "#0ea5e9" },
                  { label: "Blog Posts",   value: posts.filter(p=>p.published).length,                  color: "#a78bfa" },
                ].map((s, i) => (
                  <div key={i} className="skeu-card admin-stat-card" style={{ borderTop: `2px solid ${s.color}` }}>
                    <div className="admin-stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="admin-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && tab === "users" && (
            <div className="animate-fade-in">
              <div className="profile__section-header">
                <h2>Users</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddDev(true)}><Plus size={14} /> Add Developer</button>
              </div>
              {showAddDev && (
                <div className="admin-modal glass">
                  <h3 style={{ marginBottom: 20 }}>Add Developer</h3>
                  <form onSubmit={addDeveloper} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div className="form-group"><label className="form-label">Name</label><input type="text" className="form-input" value={devForm.name} onChange={e => setDevForm(f=>({...f,name:e.target.value}))} required /></div>
                    <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={devForm.email} onChange={e => setDevForm(f=>({...f,email:e.target.value}))} required /></div>
                    <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" value={devForm.password} onChange={e => setDevForm(f=>({...f,password:e.target.value}))} required /></div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button type="submit" className="btn btn-primary btn-sm">Add</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddDev(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}
              <div className="admin-table-wrap glass">
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td><strong>{u.name}</strong></td>
                        <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{u.email}</td>
                        <td><span className="badge badge-purple">{u.role}</span></td>
                        <td><span className={`badge ${u.isActive ? "badge-green" : "badge-red"}`}>{u.isActive ? "Active" : "Off"}</span></td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => UserDB.toggleActive(u.id).then(loadAll)}>{u.isActive ? <XCircle size={13} /> : <CheckCircle size={13} />}</button>
                            {u.role !== "admin" && <button className="btn btn-danger btn-sm" onClick={() => removeUser(u.id)}><Trash2 size={13} /></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && tab === "projects" && (
            <div className="animate-fade-in">
              <div className="profile__section-header"><h2>All Projects</h2></div>
              <div className="admin-table-wrap glass">
                <table className="admin-table">
                  <thead><tr><th>Title</th><th>Plan</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {projects.map(p => (
                      <tr key={p.id}>
                        <td>
                          <button className="admin-title-btn" onClick={() => setExpandedProject(p)}>{p.title}</button>
                          {p.clientRating && (
                            <div style={{ display: "flex", gap: 2, marginTop: 3 }}>
                              {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: "0.72rem", color: s <= p.clientRating! ? "#f59e0b" : "var(--text-muted)" }}>★</span>)}
                            </div>
                          )}
                        </td>
                        <td><span className="tag" style={{ fontSize: "0.75rem" }}>{p.plan}</span></td>
                        <td><span className={`badge ${p.status === "completed" || p.status === "client_approved" ? "badge-green" : p.status === "review" ? "badge-yellow" : "badge-purple"}`} style={{ fontSize: "0.72rem" }}>{p.status.replace(/_/g, " ")}</span></td>
                        <td>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {!p.developerId ? (
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                <select className="form-input" style={{ padding: "4px 8px", fontSize: "0.78rem", minWidth: 100 }} defaultValue="" onChange={e => e.target.value && assignProject(p.id, e.target.value)}>
                                  <option value="">Assign...</option>
                                  {devs.filter(d=>d.isActive).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                <button className="btn btn-ghost btn-sm" onClick={() => autoAssign(p.id)} title="Auto-assign to least loaded dev">⚡ Auto</button>
                              </div>
                            ) : p.status === "client_approved" ? (
                              <button className="btn btn-primary btn-sm" onClick={() => finalizeProject(p.id)}><CheckCircle size={12} /> Finalize</button>
                            ) : p.status === "completed" ? (
                              <span className="badge badge-green" style={{ fontSize: "0.72rem" }}>✓ Done</span>
                            ) : (
                              <span className="badge badge-purple" style={{ fontSize: "0.72rem" }}>In progress</span>
                            )}
                            {p.demoLink && <a href={p.demoLink} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><ExternalLink size={12} /></a>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: 32 }}>No projects yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && tab === "jobs" && (
            <div className="animate-fade-in">
              <div className="profile__section-header"><h2>Job Applications</h2></div>
              <div className="admin-jobs">
                {jobs.length === 0 && <div className="profile__empty glass"><FileText size={32} style={{ color: "var(--text-muted)" }} /><p style={{ marginTop: 12, color: "var(--text-muted)" }}>No applications yet</p></div>}
                {jobs.map(j => (
                  <div key={j.id} className="skeu-card admin-job-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                      <h4>{j.name}</h4>
                      <span className={`badge ${j.status === "pending" ? "badge-yellow" : j.status === "approved" ? "badge-green" : "badge-red"}`}>{j.status}</span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 4 }}>{j.email}</p>
                    {j.phone && <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 6 }}>📞 {j.phone}</p>}
                    <p style={{ fontSize: "0.85rem", marginBottom: 4 }}><strong>Experience:</strong> {j.experience}</p>
                    <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", marginBottom: 8 }}><strong>Skills:</strong> {Array.isArray(j.skills) ? j.skills.join(", ") : j.skills}</p>
                    {j.portfolioUrl && <p style={{ fontSize: "0.82rem", marginBottom: 4 }}><a href={j.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>Portfolio ↗</a></p>}
                    {j.githubUrl && <p style={{ fontSize: "0.82rem", marginBottom: 8 }}><a href={j.githubUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>GitHub ↗</a></p>}
                    {j.cvUrl && j.cvUrl !== "pending" && (
                      <div className="admin-cv-link">
                        <FileText size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>CV:</span>
                        <a href={j.cvUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }}><ExternalLink size={12} /> View</a>
                      </div>
                    )}
                    <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)", marginBottom: 12, fontStyle: "italic", whiteSpace: "pre-wrap", lineHeight: 1.65 }}>"{j.coverLetter}"</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span className="tag">{new Date(j.appliedAt).toLocaleDateString()}</span>
                      {j.status === "pending" && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => openApproveModal(j)}><UserPlus size={13} /> Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => JobDB.updateStatus(j.id, "rejected").then(loadAll)}><XCircle size={13} /> Reject</button>
                        </>
                      )}
                      {j.status === "approved" && <span style={{ fontSize: "0.82rem", color: "var(--success)" }}>✓ Account created</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && tab === "contacts" && (
            <div className="animate-fade-in">
              <div className="profile__section-header"><h2>Messages</h2></div>
              <div className="admin-jobs">
                {contacts.length === 0 && <div className="profile__empty glass"><Mail size={32} style={{ color: "var(--text-muted)" }} /><p style={{ marginTop: 12, color: "var(--text-muted)" }}>No messages</p></div>}
                {contacts.map(c => (
                  <div key={c.id} className={`skeu-card admin-job-card ${!c.read ? "admin-job-card--unread" : ""}`}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <h4>{c.name}</h4>
                      {!c.read && <span className="badge badge-purple">New</span>}
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 6 }}>{c.email}</p>
                    <p style={{ fontSize: "0.88rem", fontWeight: 600, marginBottom: 4 }}>{c.subject}</p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{c.message}</p>
                    <div style={{ marginTop: 10 }}><span className="tag">{new Date(c.submittedAt).toLocaleDateString()}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && tab === "blog" && (
            <div className="animate-fade-in">
              <div className="profile__section-header">
                <h2>Blog Posts</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowBlogForm(!showBlogForm)}><Plus size={14} /> New Post</button>
              </div>
              {showBlogForm && (
                <div className="admin-modal glass" style={{ marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 20 }}>Create Post</h3>
                  <form onSubmit={createPost} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="form-group"><label className="form-label">Title *</label><input type="text" className="form-input" value={blogForm.title} onChange={e=>setBlogForm(f=>({...f,title:e.target.value}))} required /></div>
                    <div className="form-group"><label className="form-label">Excerpt</label><input type="text" className="form-input" value={blogForm.excerpt} onChange={e=>setBlogForm(f=>({...f,excerpt:e.target.value}))} /></div>
                    <div className="form-group"><label className="form-label">Content *</label><textarea className="form-input" rows={8} value={blogForm.content} onChange={e=>setBlogForm(f=>({...f,content:e.target.value}))} required /></div>
                    <div className="form-group"><label className="form-label">Tags (comma separated)</label><input type="text" className="form-input" placeholder="design, tips" value={blogForm.tags} onChange={e=>setBlogForm(f=>({...f,tags:e.target.value}))} /></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="checkbox" id="published" checked={blogForm.published} onChange={e=>setBlogForm(f=>({...f,published:e.target.checked}))} />
                      <label htmlFor="published" className="form-label" style={{ marginBottom: 0 }}>Publish immediately</label>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button type="submit" className="btn btn-primary btn-sm">Publish</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowBlogForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}
              <div className="admin-jobs">
                {posts.length === 0 && <div className="profile__empty glass"><PenLine size={32} style={{ color: "var(--text-muted)" }} /><p style={{ marginTop: 12, color: "var(--text-muted)" }}>No posts yet</p></div>}
                {posts.map(p => (
                  <div key={p.id} className="skeu-card admin-job-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                      <h4 style={{ fontSize: "1rem" }}>{p.title}</h4>
                      <span className={`badge ${p.published ? "badge-green" : "badge-yellow"}`}>{p.published ? "Published" : "Draft"}</span>
                    </div>
                    {p.excerpt && <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8, fontStyle: "italic" }}>{p.excerpt}</p>}
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{p.content}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      {p.tags.map((t: string) => <span key={t} className="tag">{t}</span>)}
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{new Date(p.publishedAt).toLocaleDateString()}</span>
                      <a href={`/blog`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}><ExternalLink size={12} /> View on site</a>
                      <button className="btn btn-danger btn-sm" onClick={() => BlogDB.remove(p.id).then(loadAll)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && tab === "reviews" && (
            <div className="animate-fade-in">
              <div className="profile__section-header">
                <h2>Customer Reviews</h2>
                {reviews.filter(r => !r.approved).length > 0 && (
                  <span className="badge badge-yellow">
                    {reviews.filter(r => !r.approved).length} pending
                  </span>
                )}
              </div>
              {reviews.length === 0 && (
                <div className="profile__empty glass">
                  <Star size={32} style={{ color: "var(--text-muted)" }} />
                  <p style={{ marginTop: 12, color: "var(--text-muted)" }}>No reviews yet</p>
                </div>
              )}
              <div className="admin-jobs">
                {reviews.map(r => (
                  <div key={r.id} className={`skeu-card admin-review-card ${!r.approved ? "admin-job-card--unread" : ""}`}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div className="admin-review-stars">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={16} fill={s <= r.rating ? "#f59e0b" : "none"} stroke={s <= r.rating ? "#f59e0b" : "var(--text-muted)"} />
                        ))}
                        <span style={{ marginLeft: 6, fontSize: "0.8rem", color: "var(--text-muted)" }}>{r.rating}/5</span>
                      </div>
                      <span className={`badge ${r.approved ? "badge-green" : "badge-yellow"}`}>
                        {r.approved ? "✓ Live" : "Pending"}
                      </span>
                    </div>
                    <p className="admin-review-quote">"{r.text}"</p>
                    <div className="admin-review-footer">
                      <div className="admin-review-author">
                        <div className="admin-review-avatar">{r.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="admin-review-name">{r.name}</div>
                          <div className="admin-review-role">{r.role}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span className="tag">{new Date(r.createdAt).toLocaleDateString()}</span>
                        {!r.approved && (
                          <button className="btn btn-primary btn-sm" onClick={() => ReviewDB.approve(r.id).then(loadAll)}>
                            <CheckCircle size={13} /> Approve
                          </button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => ReviewDB.remove(r.id).then(loadAll)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && tab === "hosting" && (
            <div className="animate-fade-in">
              <div className="profile__section-header"><h2>Hosting Requests</h2></div>
              {hostingReqs.length === 0 && <div className="profile__empty glass"><Server size={32} style={{ color: "var(--text-muted)" }} /><p style={{ marginTop: 12, color: "var(--text-muted)" }}>No hosting requests yet</p></div>}
              <div className="admin-jobs">
                {hostingReqs.map(h => (
                  <div key={h.id} className="skeu-card admin-job-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <h4>{h.projectTitle}</h4>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>{h.clientName}</p>
                      </div>
                      <span className={`badge ${h.status === "delivered" ? "badge-green" : h.status === "in_progress" ? "badge-purple" : h.status === "payment_confirmed" ? "badge-purple" : "badge-yellow"}`}>{h.status.replace(/_/g, " ")}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      <span className="tag">{h.type === "hosting" ? "🖥 Full Hosting" : "📦 ZIP File"}</span>
                      <span className="tag">₹{h.price.toLocaleString()}</span>
                      <span className="tag">{h.plan}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {h.status === "pending_payment" && (
                        <button className="btn btn-primary btn-sm" onClick={() => confirmPayment(h.id)}><CheckCircle size={13} /> Confirm Payment</button>
                      )}
                      {(h.status === "payment_confirmed" || h.status === "in_progress") && (
                        <button className="btn btn-primary btn-sm" onClick={() => openDeliverModal(h)}><Download size={13} /> Deliver</button>
                      )}
                      {h.status === "delivered" && <span className="badge badge-green">✓ Delivered</span>}
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 10 }}>{new Date(h.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && tab === "chat" && (
            <div className="animate-fade-in">
              <div className="profile__section-header"><h2>Chat</h2></div>

              {/* Sub-tab toggle */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <button className={`btn btn-sm ${chatSubTab === "project" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => { setChatSubTab("project"); setChatProject(null); setChatMessages([]); }}>
                  <MessageSquare size={13} /> Project Chats
                </button>
                <button className={`btn btn-sm ${chatSubTab === "dev" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => { setChatSubTab("dev"); setSelectedDev(null); setDevChatMessages([]); }}>
                  <MessageSquare size={13} /> Dev ↔ Admin
                </button>
              </div>

              {/* ── Project Chats ── */}
              {chatSubTab === "project" && (
                !chatProject ? (
                  <div>
                    {projects.length === 0 && (
                      <div className="profile__empty glass">
                        <MessageSquare size={32} style={{ color: "var(--text-muted)" }} />
                        <p style={{ marginTop: 12, color: "var(--text-muted)" }}>No projects yet</p>
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {projects.map(p => (
                        <button key={p.id} className="btn btn-ghost"
                          style={{ justifyContent: "space-between", padding: "14px 18px", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)" }}
                          onClick={() => setChatProject(p)}>
                          <span style={{ fontWeight: 600 }}>{p.title}</span>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span className={`badge ${p.status === "completed" ? "badge-green" : "badge-purple"}`} style={{ fontSize: "0.72rem" }}>{p.status.replace(/_/g," ")}</span>
                            <MessageSquare size={14} style={{ color: "var(--text-muted)" }} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="profile__chat">
                    <div className="profile__chat-project glass">
                      <strong>{chatProject.title}</strong>
                      <span className="badge badge-purple" style={{ fontSize: "0.72rem" }}>{chatProject.status.replace(/_/g," ")}</span>
                      <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => { setChatProject(null); setChatMessages([]); }}><X size={12} /></button>
                    </div>
                    <div style={{ padding: "8px 12px", background: "var(--accent-soft)", borderRadius: "var(--radius)", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>
                      💬 Visible to both client & developer. You appear as <strong>Valcrion</strong>.
                    </div>
                    <div className="profile__chat-messages">
                      {chatMessages.length === 0 && <div className="profile__chat-empty"><MessageSquare size={28} /><p>No messages yet.</p></div>}
                      {chatMessages.map(m => (
                        <div key={m.id} className={`chat-bubble ${m.senderRole === "admin" ? "chat-bubble--mine" : "chat-bubble--theirs"}`}>
                          <div className="chat-bubble__role">
                            {m.senderRole === "admin" ? "You (Valcrion)" : m.senderRole === "client" ? "Client ✦" : "Developer ✦"}
                          </div>
                          <div className="chat-bubble__content">{m.content}</div>
                          <div className="chat-bubble__time">{new Date(m.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="profile__chat-input">
                      <textarea className="form-input profile__chat-textarea" rows={2}
                        placeholder="Message client & developer... (Enter to send)"
                        value={adminChatInput}
                        onChange={e => setAdminChatInput(e.target.value)}
                        onKeyDown={handleAdminChatKey}
                      />
                      <button className="btn btn-primary" onClick={sendAdminMessage} disabled={!adminChatInput.trim()}><Send size={16} /></button>
                    </div>
                  </div>
                )
              )}

              {/* ── Dev ↔ Admin Private Chat ── */}
              {chatSubTab === "dev" && (
                !selectedDev ? (
                  <div>
                    {devs.length === 0 && (
                      <div className="profile__empty glass">
                        <MessageSquare size={32} style={{ color: "var(--text-muted)" }} />
                        <p style={{ marginTop: 12, color: "var(--text-muted)" }}>No developers yet</p>
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {devs.map(d => (
                        <button key={d.id} className="btn btn-ghost"
                          style={{ justifyContent: "space-between", padding: "14px 18px", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)" }}
                          onClick={() => setSelectedDev(d)}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: "0.88rem", flexShrink: 0 }}>
                              {d.name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ textAlign: "left" }}>
                              <div style={{ fontWeight: 600 }}>{d.name}</div>
                              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{d.email}</div>
                            </div>
                          </div>
                          <span className={`badge ${d.isActive ? "badge-green" : "badge-red"}`} style={{ fontSize: "0.7rem" }}>{d.isActive ? "Active" : "Off"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="profile__chat">
                    <div className="profile__chat-project glass">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: "0.8rem" }}>
                          {selectedDev.name.charAt(0)}
                        </div>
                        <strong>{selectedDev.name}</strong>
                      </div>
                      <span className="badge badge-purple" style={{ fontSize: "0.7rem" }}>Private</span>
                      <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => { setSelectedDev(null); setDevChatMessages([]); }}><X size={12} /></button>
                    </div>
                    <div style={{ padding: "8px 12px", background: "rgba(139,92,246,0.08)", borderRadius: "var(--radius)", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>
                      🔒 Private chat — only you and <strong>{selectedDev.name}</strong> can see this.
                    </div>
                    <div className="profile__chat-messages">
                      {devChatMessages.length === 0 && <div className="profile__chat-empty"><MessageSquare size={28} /><p>No messages yet.</p></div>}
                      {devChatMessages.map(m => (
                        <div key={m.id} className={`chat-bubble ${m.senderRole === "admin" ? "chat-bubble--mine" : "chat-bubble--theirs"}`}>
                          <div className="chat-bubble__role">{m.senderRole === "admin" ? "You (Admin)" : selectedDev.name}</div>
                          <div className="chat-bubble__content">{m.content}</div>
                          <div className="chat-bubble__time">{new Date(m.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
                        </div>
                      ))}
                      <div ref={devChatEndRef} />
                    </div>
                    <div className="profile__chat-input">
                      <textarea className="form-input profile__chat-textarea" rows={2}
                        placeholder="Private message to dev... (Enter to send)"
                        value={devChatInput}
                        onChange={e => setDevChatInput(e.target.value)}
                        onKeyDown={handleDevChatKey}
                      />
                      <button className="btn btn-primary" onClick={sendDevMessage} disabled={!devChatInput.trim()}><Send size={16} /></button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}


          {!loading && tab === "settings" && (
            <div className="profile__section animate-fade-in">
              <div className="profile__section-header"><h2>Settings</h2></div>
              <div className="profile__form glass" style={{ maxWidth: 440 }}>
                <h3 style={{ marginBottom: 4, fontSize: "1rem" }}>Change Password</h3>
                <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", marginBottom: 24 }}>
                  Keep your account secure with a strong password.
                </p>
                {pwdError && (
                  <div style={{ padding: "10px 14px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: "var(--radius)", color: "var(--error)", fontSize: "0.84rem", marginBottom: 16 }}>
                    {pwdError}
                  </div>
                )}
                {pwdSuccess && (
                  <div style={{ padding: "10px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "var(--radius)", color: "var(--success)", fontSize: "0.84rem", marginBottom: 16 }}>
                    ✓ Password changed successfully!
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password" className="form-input"
                      placeholder="Enter current password"
                      value={pwdForm.old}
                      onChange={e => setPwdForm(f => ({ ...f, old: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password" className="form-input"
                      placeholder="At least 6 characters"
                      value={pwdForm.next}
                      onChange={e => setPwdForm(f => ({ ...f, next: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password" className="form-input"
                      placeholder="Repeat new password"
                      value={pwdForm.confirm}
                      onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))}
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ justifyContent: "center" }}
                    onClick={handleChangePassword}
                    disabled={pwdLoading || !pwdForm.old || !pwdForm.next || !pwdForm.confirm}
                  >
                    {pwdLoading ? <span className="spinner" /> : "Update Password"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
