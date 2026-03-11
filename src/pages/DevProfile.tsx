import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Package, MessageSquare, Code, Star, ExternalLink, Link2, X, CheckCircle, FileText, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ProjectDB, ChatDB, PasswordDB } from "../db";
import { ROUTES, PRICING } from "../constants";
import type { Project, ChatMessage, PricingPlan } from "../types";
import "./Profile.css";

type Tab = "projects" | "chat" | "admin-chat" | "settings";

const STATUS_COLORS: Record<string, string> = {
  pending: "badge-yellow", assigned: "badge-purple", in_progress: "badge-purple",
  review: "badge-yellow", client_approved: "badge-green", completed: "badge-green",
};

export default function DevProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [expandedProject, setExpandedProject] = useState<Project | null>(null);
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [adminChatInput, setAdminChatInput] = useState("");
  const adminChatEndRef = useRef<HTMLDivElement>(null);

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

  // Submit for review modal
  const [reviewModal, setReviewModal] = useState<Project | null>(null);
  const [demoLink, setDemoLink] = useState("");
  const [codeLink, setCodeLink] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate(ROUTES.login); return; }
    if (user.role !== "developer") { navigate(ROUTES.home); return; }
    loadProjects();
  }, [user]);

  useEffect(() => {
    if (selectedProject) loadMessages(selectedProject.id);
  }, [selectedProject]);

  useEffect(() => {
    if (user) loadAdminMessages();
  }, [user]);

  useEffect(() => {
    adminChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [adminMessages]);

  const loadAdminMessages = async () => {
    if (!user) return;
    try { setAdminMessages(await ChatDB.getForProject(`admin-dev-${user.id}`)); }
    catch (err) { console.error(err); }
  };

  const sendAdminMessage = async () => {
    if (!adminChatInput.trim() || !user) return;
    try {
      await ChatDB.send({ projectId: `admin-dev-${user.id}`, content: adminChatInput.trim() });
      setAdminChatInput("");
      loadAdminMessages();
    } catch (err) { console.error(err); }
  };

  const handleAdminKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAdminMessage(); }
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadProjects = async () => {
    try { const data = await ProjectDB.getForDeveloper(); setProjects(data); }
    catch (err) { console.error(err); }
  };

  const loadMessages = async (projectId: string) => {
    try { const data = await ChatDB.getForProject(projectId); setMessages(data); }
    catch (err) { console.error(err); }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !selectedProject) return;
    try {
      await ChatDB.send({ projectId: selectedProject.id, content: chatInput.trim() });
      setChatInput("");
      loadMessages(selectedProject.id);
    } catch (err) { console.error(err); }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const startWorking = async (projectId: string) => {
    await ProjectDB.update(projectId, { status: "in_progress" });
    loadProjects();
  };

  const openReviewModal = (project: Project) => {
    setReviewModal(project);
    setDemoLink(project.demoLink || "");
    setCodeLink(project.codeLink || "");
  };

  const submitForReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal || !demoLink.trim()) return;
    setReviewLoading(true);
    try {
      await ProjectDB.update(reviewModal.id, {
        status: "review",
        demoLink: demoLink.trim(),
        codeLink: codeLink.trim(),
      });
      // Also send a chat message to notify the client
      await ChatDB.send({
        projectId: reviewModal.id,
        content: `🚀 I've submitted this project for review. You can preview it here: ${demoLink.trim()}`,
      });
      setReviewLoading(false);
      setReviewModal(null);
      setDemoLink("");
      setCodeLink("");
      loadProjects();
    } catch (err: any) {
      setReviewLoading(false);
      alert(err.message);
    }
  };

  return (
    <main className="profile page">
      <div className="profile__orb" />

      {/* ── Project Detail Modal ── */}
      {expandedProject && (
        <div className="admin-overlay" onClick={() => setExpandedProject(null)}>
          <div className="project-detail-modal glass-elevated" onClick={e => e.stopPropagation()}>
            <div className="project-detail-header">
              <div>
                <h2>{expandedProject.title}</h2>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <span className={`badge ${STATUS_COLORS[expandedProject.status]}`}>{expandedProject.status.replace("_", " ")}</span>
                  <span className="tag">{expandedProject.plan}</span>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setExpandedProject(null)}><X size={16} /></button>
            </div>
            <div className="project-detail-body">
              <div className="form-group">
                <label className="form-label">Full Description</label>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>{expandedProject.description}</p>
              </div>
              {expandedProject.demoLink && (
                <div className="form-group">
                  <label className="form-label">Demo Link (submitted)</label>
                  <a href={expandedProject.demoLink} target="_blank" rel="noreferrer" className="approve-demo-banner">
                    <ExternalLink size={14} /><span>{expandedProject.demoLink}</span>
                    <span style={{ marginLeft: "auto", color: "var(--accent)" }}>Open ↗</span>
                  </a>
                </div>
              )}
              {expandedProject.clientRating && (
                <div className="form-group">
                  <label className="form-label">Client Rating</label>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={18} fill={s <= expandedProject.clientRating! ? "#f59e0b" : "none"} stroke={s <= expandedProject.clientRating! ? "#f59e0b" : "var(--text-muted)"} />
                    ))}
                    {expandedProject.clientFeedback && <span style={{ marginLeft: 8, fontSize: "0.85rem", color: "var(--text-secondary)", fontStyle: "italic" }}>"{expandedProject.clientFeedback}"</span>}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setExpandedProject(null); setSelectedProject(expandedProject); setTab("chat"); }}>
                  <MessageSquare size={13} /> Open Chat
                </button>
                {expandedProject.status === "in_progress" && (
                  <button className="btn btn-primary btn-sm" onClick={() => { setExpandedProject(null); openReviewModal(expandedProject); }}>
                    <Send size={13} /> Submit for Review
                  </button>
                )}
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 12 }}>Created {new Date(expandedProject.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Submit for Review Modal ── */}
      {reviewModal && (
        <div className="admin-overlay">
          <div className="admin-approve-modal glass-elevated">
            <div className="admin-approve-header">
              <div className="admin-approve-icon"><Link2 size={22} /></div>
              <div>
                <h3>Submit for Review</h3>
                <p className="admin-approve-sub">{reviewModal.title}</p>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => setReviewModal(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submitForReview} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Demo / Preview Link *</label>
                <input
                  type="url"
                  className="form-input"
                  value={demoLink}
                  onChange={e => setDemoLink(e.target.value)}
                  placeholder="https://your-demo.vercel.app"
                  required
                  autoFocus
                />
                <div className="drive-hint" style={{ marginTop: 10 }}>
                  <div className="drive-hint__icon"><ExternalLink size={14} /></div>
                  <div>
                    <p className="drive-hint__title">Free ways to share a live demo</p>
                    <ol className="drive-hint__steps">
                      <li><strong>Vercel</strong> — <code>vercel deploy</code> → instant public URL</li>
                      <li><strong>Netlify</strong> — drag & drop your build folder at netlify.com</li>
                      <li><strong>ngrok</strong> — <code>ngrok http 3000</code> for local tunnel</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Source Code Drive Link *</label>
                <input
                  type="url"
                  className="form-input"
                  value={codeLink}
                  onChange={e => setCodeLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  required
                />
                <div className="drive-hint" style={{ marginTop: 10 }}>
                  <div className="drive-hint__icon"><FileText size={14} /></div>
                  <div>
                    <p className="drive-hint__title">Share your source code via Google Drive</p>
                    <ol className="drive-hint__steps">
                      <li>Upload ZIP → right-click → <strong>Share</strong></li>
                      <li>Set <strong>"Anyone with the link"</strong></li>
                      <li>Paste link above</li>
                    </ol>
                    <p style={{ fontSize: "0.76rem", color: "var(--warning)", marginTop: 6 }}>
                      ⚠️ This link is only shown to the client after they pay for the code download.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={reviewLoading || !demoLink.trim() || !codeLink.trim()}>
                  {reviewLoading ? <span className="spinner" /> : <><Send size={15} /> Submit for Review</>}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setReviewModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="container profile__layout">
        <aside className="profile__sidebar glass">
          <div className="profile__user">
            <div className="profile__avatar" style={{ background: "linear-gradient(135deg, #6d28d9, #4c1d95)" }}>
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="profile__name">{user?.name}</div>
              <div className="profile__role badge badge-purple">Developer</div>
            </div>
          </div>
          <nav className="profile__nav">
            <button className={`profile__nav-btn ${tab === "projects" ? "active" : ""}`} onClick={() => setTab("projects")}>
              <Package size={16} /> My Projects
              {projects.length > 0 && <span className="profile__nav-count">{projects.length}</span>}
            </button>
            <button className={`profile__nav-btn ${tab === "chat" ? "active" : ""}`} onClick={() => setTab("chat")}>
              <MessageSquare size={16} /> Project Chat
            </button>
            <button className={`profile__nav-btn ${tab === "admin-chat" ? "active" : ""}`} onClick={() => { setTab("admin-chat"); loadAdminMessages(); }}>
              <MessageSquare size={16} /> Admin Chat
            </button>
            <button className={`profile__nav-btn ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>
              <Settings size={16} /> Settings
            </button>
          </nav>
          <div className="profile__hint">
            <Star size={14} style={{ color: "var(--accent)" }} />
            <p style={{ marginTop: 6 }}>Client identities are hidden. Focus on the work.</p>
          </div>
        </aside>

        <div className="profile__main">

          {tab === "projects" && (
            <div className="profile__section animate-fade-in">
              <div className="profile__section-header"><h2>Assigned Projects</h2></div>
              {projects.length === 0 ? (
                <div className="profile__empty glass">
                  <Code size={40} style={{ color: "var(--text-muted)", marginBottom: 16 }} />
                  <h3>No projects assigned yet</h3>
                  <p>The admin will assign projects to you. Check back soon.</p>
                </div>
              ) : (
                <div className="profile__projects">
                  {projects.map((p) => (
                    <div key={p.id} className="skeu-card profile__project-card">
                      <div className="profile__project-top">
                        <h4 style={{ cursor: "pointer" }} onClick={() => setExpandedProject(p)}>{p.title}</h4>
                        <span className={`badge ${STATUS_COLORS[p.status]}`}>{p.status.replace("_", " ")}</span>
                      </div>
                      <p className="profile__project-desc">{p.description}</p>

                      {/* Demo link if already submitted */}
                      {p.demoLink && (
                        <a href={p.demoLink} target="_blank" rel="noreferrer" className="project-demo-link">
                          <ExternalLink size={13} /> {p.demoLink}
                        </a>
                      )}

                      {/* Client feedback if given */}
                      {p.clientRating && (
                        <div className="project-feedback-badge">
                          <div className="project-stars">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={13} fill={s <= p.clientRating! ? "var(--accent)" : "none"} stroke={s <= p.clientRating! ? "var(--accent)" : "var(--text-muted)"} />
                            ))}
                          </div>
                          {p.clientFeedback && <p className="project-feedback-text">"{p.clientFeedback}"</p>}
                        </div>
                      )}

                      <div className="profile__project-footer">
                        <span className="tag">{PRICING[p.plan as PricingPlan]?.label || p.plan}</span>
                        <span className="profile__project-date">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setExpandedProject(p)}><ExternalLink size={13} /> Details</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedProject(p); setTab("chat"); }}>
                          <MessageSquare size={13} /> Chat
                        </button>
                        {p.status === "assigned" && (
                          <button className="btn btn-primary btn-sm" onClick={() => startWorking(p.id)}>
                            Start Working
                          </button>
                        )}
                        {p.status === "in_progress" && (
                          <button className="btn btn-primary btn-sm" onClick={() => openReviewModal(p)}>
                            <Send size={13} /> Submit for Review
                          </button>
                        )}
                        {p.status === "review" && (
                          <span className="badge badge-yellow" style={{ padding: "6px 12px" }}>⏳ Awaiting client review</span>
                        )}
                        {p.status === "client_approved" && (
                          <span className="badge badge-green" style={{ padding: "6px 12px" }}>✓ Client approved — admin finalizing</span>
                        )}
                        {p.status === "completed" && (
                          <span className="badge badge-green" style={{ padding: "6px 12px" }}>🎉 Completed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "chat" && (
            <div className="profile__section animate-fade-in profile__chat-section">
              <div className="profile__section-header"><h2>Project Chat</h2></div>
              {!selectedProject ? (
                <div className="profile__empty glass">
                  <MessageSquare size={40} style={{ color: "var(--text-muted)", marginBottom: 16 }} />
                  <h3>Select a project</h3>
                  <p>Choose a project from My Projects to open its chat</p>
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={() => setTab("projects")}>View Projects</button>
                </div>
              ) : (
                <div className="profile__chat">
                  <div className="profile__chat-project glass">
                    <span className="tag">{PRICING[selectedProject.plan as PricingPlan]?.label || selectedProject.plan}</span>
                    <strong>{selectedProject.title}</strong>
                    <span className={`badge ${STATUS_COLORS[selectedProject.status]}`}>{selectedProject.status}</span>
                  </div>
                  <div className="profile__chat-messages">
                    {messages.length === 0 && <div className="profile__chat-empty"><MessageSquare size={28} /><p>No messages yet.</p></div>}
                    {messages.map((m) => (
                      <div key={m.id} className={`chat-bubble ${m.senderRole === "developer" ? "chat-bubble--mine" : "chat-bubble--theirs"}`}>
                        <div className="chat-bubble__role">{m.senderRole === "developer" ? "You" : m.senderRole === "admin" ? "Valcrion ✦" : "Client ✦"}</div>
                        <div className="chat-bubble__content">{m.content}</div>
                        <div className="chat-bubble__time">{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="profile__chat-input">
                    <textarea className="form-input profile__chat-textarea" placeholder="Type a message... (Enter to send)" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleKey} rows={2} />
                    <button className="btn btn-primary" onClick={sendMessage} disabled={!chatInput.trim()}><Send size={16} /></button>
                  </div>
                </div>
              )}
            </div>
          )}
          {tab === "admin-chat" && (
            <div className="profile__section animate-fade-in profile__chat-section">
              <div className="profile__section-header"><h2>Admin Chat</h2></div>
              <div className="profile__chat">
                <div style={{ padding: "10px 14px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "var(--radius)", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 8 }}>
                  🔒 Private channel between you and <strong>Valcrion Admin</strong>. Clients cannot see this.
                </div>
                <div className="profile__chat-messages">
                  {adminMessages.length === 0 && (
                    <div className="profile__chat-empty">
                      <MessageSquare size={28} />
                      <p>No messages yet. Start a conversation with admin.</p>
                    </div>
                  )}
                  {adminMessages.map(m => (
                    <div key={m.id} className={`chat-bubble ${m.senderRole === "developer" ? "chat-bubble--mine" : "chat-bubble--theirs"}`}>
                      <div className="chat-bubble__role">{m.senderRole === "developer" ? "You" : "Valcrion Admin ✦"}</div>
                      <div className="chat-bubble__content">{m.content}</div>
                      <div className="chat-bubble__time">{new Date(m.timestamp).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
                    </div>
                  ))}
                  <div ref={adminChatEndRef} />
                </div>
                <div className="profile__chat-input">
                  <textarea className="form-input profile__chat-textarea" rows={2}
                    placeholder="Message admin privately... (Enter to send)"
                    value={adminChatInput}
                    onChange={e => setAdminChatInput(e.target.value)}
                    onKeyDown={handleAdminKey}
                  />
                  <button className="btn btn-primary" onClick={sendAdminMessage} disabled={!adminChatInput.trim()}><Send size={16} /></button>
                </div>
              </div>
            </div>
          )}

          {tab === "settings" && (
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
