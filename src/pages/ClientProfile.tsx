import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send, Plus, X, Package, MessageSquare, CheckCircle,
  ExternalLink, Link2, FileText, Star, Server, Archive,
  CreditCard, Clock, Download, Settings
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ProjectDB, ChatDB, HostingDB, PasswordDB } from "../db";
import { ROUTES, PRICING } from "../constants";
import type { Project, ChatMessage, PricingPlan, HostingRequest } from "../types";
import "./Profile.css";

type Tab = "projects" | "chat" | "new" | "hosting" | "settings";

const STATUS_COLORS: Record<string, string> = {
  pending: "badge-yellow", assigned: "badge-purple", in_progress: "badge-purple",
  review: "badge-yellow", client_approved: "badge-green", completed: "badge-green",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", assigned: "Assigned", in_progress: "In Progress",
  review: "Ready for Review", client_approved: "You Approved", completed: "Completed",
};

const PLAN_BASE: Record<string, number> = {
  frontendOnly: 4999, backendHeavy: 7999, fullStack: 14999, fullDetailed: 24999,
};
const SERVICE_FEE: Record<string, { hosting: number; zip: number }> = {
  frontendOnly: { hosting: 999,  zip: 499  },
  backendHeavy: { hosting: 1499, zip: 699  },
  fullStack:    { hosting: 1999, zip: 999  },
  fullDetailed: { hosting: 2999, zip: 1499 },
};
// Both ZIP and hosting charge: plan base + service fee
const getHostingPrice = (plan: string, type: "hosting" | "zip") => {
  const base = PLAN_BASE[plan] || 4999;
  const fee  = SERVICE_FEE[plan]?.[type] || 999;
  return base + fee;
};

export default function ClientProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [hostingRequests, setHostingRequests] = useState<HostingRequest[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [expandedProject, setExpandedProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [newForm, setNewForm] = useState({ title: "", description: "", plan: "frontendOnly" as PricingPlan, driveLink: "" });
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  // Approve + Rating modal
  const [approveModal, setApproveModal] = useState<Project | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [approveStep, setApproveStep] = useState<"confirm" | "rate" | "done">("confirm");
  const [approveLoading, setApproveLoading] = useState(false);

  // Hosting modal
  const [hostingModal, setHostingModal] = useState<Project | null>(null);
  const [hostingType, setHostingType] = useState<"hosting" | "zip">("hosting");
  const [hostingSubmitting, setHostingSubmitting] = useState(false);
  const [hostingSubmitted, setHostingSubmitted] = useState(false);

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
    if (user.role !== "client") { navigate(ROUTES.home); return; }
    loadProjects();
    loadHosting();
  }, [user]);

  useEffect(() => { if (selectedProject) loadMessages(selectedProject.id); }, [selectedProject]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadProjects = async () => {
    try { setProjects(await ProjectDB.getForClient()); } catch (err) { console.error(err); }
  };
  const loadHosting = async () => {
    try { setHostingRequests(await HostingDB.getAll()); } catch (err) { console.error(err); }
  };
  const loadMessages = async (projectId: string) => {
    try { setMessages(await ChatDB.getForProject(projectId)); } catch (err) { console.error(err); }
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

  const submitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.title || !newForm.description) return;
    setCreating(true);
    try {
      const desc = newForm.driveLink
        ? `${newForm.description}\n\n📎 Reference Files: ${newForm.driveLink}`
        : newForm.description;
      await ProjectDB.create({ title: newForm.title, description: desc, plan: newForm.plan });
      setCreating(false); setCreated(true);
      setNewForm({ title: "", description: "", plan: "frontendOnly", driveLink: "" });
      loadProjects();
      setTimeout(() => { setCreated(false); setTab("projects"); }, 1500);
    } catch (err: any) { setCreating(false); alert(err.message); }
  };

  const openApproveModal = (project: Project) => {
    setApproveModal(project); setApproveStep("confirm"); setRating(0); setFeedback("");
  };

  const submitRating = async () => {
    if (!approveModal || rating === 0) return;
    setApproveLoading(true);
    try {
      await ProjectDB.update(approveModal.id, {
        status: "client_approved", clientApproved: true, clientRating: rating, clientFeedback: feedback,
      });
      await ChatDB.send({
        projectId: approveModal.id,
        content: `✅ I've reviewed and approved this project! Rating: ${"⭐".repeat(rating)}${feedback ? ` — "${feedback}"` : ""}`,
      });
      setApproveLoading(false); setApproveStep("done"); loadProjects();
    } catch (err: any) { setApproveLoading(false); alert(err.message); }
  };

  const requestChanges = async (project: Project) => {
    try {
      await ProjectDB.update(project.id, { status: "in_progress" });
      await ChatDB.send({ projectId: project.id, content: "🔄 I've reviewed the demo and have some changes to request. Please check the chat for details." });
      loadProjects();
    } catch (err) { console.error(err); }
  };

  const openHostingModal = (project: Project) => {
    setHostingModal(project); setHostingType("hosting"); setHostingSubmitted(false);
  };

  const submitHostingRequest = async () => {
    if (!hostingModal) return;
    setHostingSubmitting(true);
    try {
      await HostingDB.submit({
        projectId: hostingModal.id,
        projectTitle: hostingModal.title,
        plan: hostingModal.plan,
        type: hostingType,
      });
      setHostingSubmitting(false); setHostingSubmitted(true);
      loadHosting();
    } catch (err: any) { setHostingSubmitting(false); alert(err.message); }
  };

  const completedProjects = projects.filter(p => p.status === "completed" || p.status === "client_approved");
  const reviewProjects = projects.filter(p => p.status === "review");

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
                  <span className={`badge ${STATUS_COLORS[expandedProject.status]}`}>{STATUS_LABELS[expandedProject.status]}</span>
                  <span className="tag">{PRICING[expandedProject.plan as PricingPlan]?.label || expandedProject.plan}</span>
                  <span className="tag">{PRICING[expandedProject.plan as PricingPlan]?.price}</span>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setExpandedProject(null)}><X size={16} /></button>
            </div>
            <div className="project-detail-body">
              <div className="form-group">
                <label className="form-label">Description</label>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>{expandedProject.description}</p>
              </div>
              {expandedProject.demoLink && (
                <div className="form-group">
                  <label className="form-label">Demo Link</label>
                  <a href={expandedProject.demoLink} target="_blank" rel="noreferrer" className="approve-demo-banner">
                    <ExternalLink size={14} />
                    <span>{expandedProject.demoLink}</span>
                    <span style={{ marginLeft: "auto", color: "var(--accent)", fontSize: "0.82rem" }}>Open ↗</span>
                  </a>
                </div>
              )}
              {expandedProject.clientRating && (
                <div className="form-group">
                  <label className="form-label">Your Rating</label>
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
                {expandedProject.status === "completed" && !hostingRequests.find(h => h.projectId === expandedProject.id) && (
                  <button className="btn btn-primary btn-sm" onClick={() => { setExpandedProject(null); openHostingModal(expandedProject); }}>
                    <Server size={13} /> Request Hosting / ZIP
                  </button>
                )}
              </div>
              <div style={{ marginTop: 12, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Created {new Date(expandedProject.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Approve & Rate Modal ── */}
      {approveModal && (
        <div className="admin-overlay">
          <div className="admin-approve-modal glass-elevated">
            {approveStep === "confirm" && (
              <>
                <div className="admin-approve-header">
                  <div className="admin-approve-icon" style={{ background: "linear-gradient(135deg, #059669, #047857)" }}><CheckCircle size={22} /></div>
                  <div><h3>Review Project</h3><p className="admin-approve-sub">{approveModal.title}</p></div>
                  <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => setApproveModal(null)}><X size={16} /></button>
                </div>
                {approveModal.demoLink && (
                  <a href={approveModal.demoLink} target="_blank" rel="noreferrer" className="approve-demo-banner">
                    <ExternalLink size={16} />
                    <div><div style={{ fontWeight: 600, fontSize: "0.88rem" }}>View Live Demo</div><div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{approveModal.demoLink}</div></div>
                    <span className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }}>Open ↗</span>
                  </a>
                )}
                <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>Have you reviewed the demo? Approve to proceed, or request changes.</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setApproveStep("rate")}><CheckCircle size={15} /> Approve Project</button>
                  <button className="btn btn-ghost" onClick={() => { requestChanges(approveModal); setApproveModal(null); }}>Request Changes</button>
                </div>
              </>
            )}
            {approveStep === "rate" && (
              <>
                <div className="admin-approve-header">
                  <div className="admin-approve-icon" style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}><Star size={22} /></div>
                  <div><h3>Rate the Work</h3><p className="admin-approve-sub">Help us improve</p></div>
                </div>
                <div className="rating-stars-row">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} className="rating-star-btn" onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(s)}>
                      <Star size={36} fill={(hoverRating || rating) >= s ? "#f59e0b" : "none"} stroke={(hoverRating || rating) >= s ? "#f59e0b" : "var(--text-muted)"} />
                    </button>
                  ))}
                </div>
                {rating > 0 && <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{["","Poor","Fair","Good","Great","Excellent!"][rating]}</p>}
                <div className="form-group">
                  <label className="form-label">Feedback <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span></label>
                  <textarea className="form-input" rows={3} placeholder="What did you like? What could be better?" value={feedback} onChange={e => setFeedback(e.target.value)} />
                </div>
                <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={submitRating} disabled={rating === 0 || approveLoading}>
                  {approveLoading ? <span className="spinner" /> : <><CheckCircle size={15} /> Submit & Approve</>}
                </button>
              </>
            )}
            {approveStep === "done" && (
              <div className="admin-approve-success">
                <div className="admin-approve-success-icon"><CheckCircle size={36} style={{ color: "var(--success)" }} /></div>
                <h3>Project Approved!</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>The admin will finalize and close the project.</p>
                <div className="rating-stars-row" style={{ marginTop: 8 }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={24} fill={s <= rating ? "#f59e0b" : "none"} stroke={s <= rating ? "#f59e0b" : "var(--text-muted)"} />)}
                </div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 20 }} onClick={() => setApproveModal(null)}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Hosting / ZIP Modal ── */}
      {hostingModal && (
        <div className="admin-overlay">
          <div className="admin-approve-modal glass-elevated">
            {!hostingSubmitted ? (
              <>
                <div className="admin-approve-header">
                  <div className="admin-approve-icon" style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}><Server size={22} /></div>
                  <div><h3>Hosting / ZIP Request</h3><p className="admin-approve-sub">{hostingModal.title}</p></div>
                  <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => setHostingModal(null)}><X size={16} /></button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 }}>
                  {(["hosting", "zip"] as const).map(t => {
                    const price = getHostingPrice(hostingModal.plan, t);
                    return (
                      <div key={t} className={`hosting-option ${hostingType === t ? "hosting-option--selected" : ""}`} onClick={() => setHostingType(t)}>
                        <div className="hosting-option__icon">{t === "hosting" ? <Server size={22} /> : <Archive size={22} />}</div>
                        <div className="hosting-option__title">{t === "hosting" ? "Full Hosting" : "ZIP File Only"}</div>
                        <div className="hosting-option__desc">{t === "hosting" ? "We host it, manage server, give you credentials" : "Download full source code as ZIP"}</div>
                        <div className="hosting-option__price">₹{price.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="hosting-paypal-box">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <CreditCard size={18} style={{ color: "var(--accent)" }} />
                    <strong style={{ fontSize: "0.95rem" }}>Pay via PayPal</strong>
                  </div>
                  <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.6 }}>
                    Send <strong>₹{getHostingPrice(hostingModal.plan, hostingType).toLocaleString()}</strong> to our PayPal and submit the request. We'll confirm payment manually and proceed.
                  </div>
                  <a
                    href="https://paypal.me/ankit02yadav"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center", marginBottom: 12, background: "#0070ba", boxShadow: "0 4px 16px rgba(0,112,186,0.3)" }}
                  >
                    <ExternalLink size={15} /> Pay ₹{getHostingPrice(hostingModal.plan, hostingType).toLocaleString()} on PayPal →
                  </a>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center" }}>
Includes project cost (₹{(PLAN_BASE[hostingModal.plan]||0).toLocaleString()}) + {hostingType === "hosting" ? "hosting setup fee" : "code delivery fee"}
                  </p>
                </div>

                <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4 }} onClick={submitHostingRequest} disabled={hostingSubmitting}>
                  {hostingSubmitting ? <span className="spinner" /> : <><CheckCircle size={15} /> I've Paid — Submit Request</>}
                </button>
              </>
            ) : (
              <div className="admin-approve-success">
                <div className="admin-approve-success-icon"><CheckCircle size={36} style={{ color: "var(--success)" }} /></div>
                <h3>Request Submitted!</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                  We'll verify your payment within 24 hours and get started. Check the <strong>Hosting & Delivery</strong> tab for updates.
                </p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 20 }} onClick={() => { setHostingModal(null); setTab("hosting"); }}>
                  View Status
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container profile__layout">
        <aside className="profile__sidebar glass">
          <div className="profile__user">
            <div className="profile__avatar">{user?.name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="profile__name">{user?.name}</div>
              <div className="profile__role badge badge-purple">Client</div>
            </div>
          </div>
          <nav className="profile__nav">
            <button className={`profile__nav-btn ${tab === "projects" ? "active" : ""}`} onClick={() => setTab("projects")}>
              <Package size={16} /> My Projects
              {reviewProjects.length > 0 && <span className="profile__nav-count">{reviewProjects.length}</span>}
            </button>
            <button className={`profile__nav-btn ${tab === "chat" ? "active" : ""}`} onClick={() => setTab("chat")}>
              <MessageSquare size={16} /> Chat
            </button>
            <button className={`profile__nav-btn ${tab === "new" ? "active" : ""}`} onClick={() => setTab("new")}>
              <Plus size={16} /> New Project
            </button>
            {(completedProjects.length > 0 || hostingRequests.length > 0) && (
              <button className={`profile__nav-btn ${tab === "hosting" ? "active" : ""}`} onClick={() => setTab("hosting")}>
                <Server size={16} /> Hosting & Delivery
                {hostingRequests.filter(h => h.status === "delivered").length > 0 && (
                  <span className="profile__nav-count">{hostingRequests.filter(h => h.status === "delivered").length}</span>
                )}
              </button>
            )}
            <button className={`profile__nav-btn ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>
              <Settings size={16} /> Settings
            </button>
          </nav>
          <div className="profile__hint"><p>Your identity remains anonymous to developers.</p></div>
        </aside>

        <div className="profile__main">

          {tab === "projects" && (
            <div className="profile__section animate-fade-in">
              <div className="profile__section-header">
                <h2>My Projects</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setTab("new")}><Plus size={14} /> New</button>
              </div>
              {projects.length === 0 ? (
                <div className="profile__empty glass">
                  <Package size={40} style={{ color: "var(--text-muted)", marginBottom: 16 }} />
                  <h3>No projects yet</h3>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => setTab("new")}>Create Project</button>
                </div>
              ) : (
                <div className="profile__projects">
                  {projects.map((p) => (
                    <div key={p.id} className={`skeu-card profile__project-card ${p.status === "review" ? "profile__project-card--attention" : ""}`}>
                      <div className="profile__project-top">
                        <h4 style={{ cursor: "pointer" }} onClick={() => setExpandedProject(p)}>{p.title}</h4>
                        <span className={`badge ${STATUS_COLORS[p.status]}`}>{STATUS_LABELS[p.status] || p.status}</span>
                      </div>
                      <p className="profile__project-desc">{p.description.slice(0, 120)}{p.description.length > 120 ? "..." : ""}</p>

                      {p.status === "review" && p.demoLink && (
                        <div className="project-review-banner">
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                            <span>🎉</span><strong style={{ fontSize: "0.9rem" }}>Your project is ready for review!</strong>
                          </div>
                          <a href={p.demoLink} target="_blank" rel="noreferrer" className="approve-demo-banner" style={{ marginBottom: 10 }}>
                            <ExternalLink size={14} /><span style={{ fontSize: "0.82rem" }}>View Demo</span>
                            <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: "var(--accent)" }}>Open ↗</span>
                          </a>
                          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => openApproveModal(p)}>Review & Approve</button>
                        </div>
                      )}

                      {(p.status === "completed" || p.status === "client_approved") && p.clientRating && (
                        <div className="project-feedback-badge">
                          <div className="project-stars">
                            {[1,2,3,4,5].map(s => <Star key={s} size={13} fill={s <= p.clientRating! ? "#f59e0b" : "none"} stroke={s <= p.clientRating! ? "#f59e0b" : "var(--text-muted)"} />)}
                            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginLeft: 6 }}>Your rating</span>
                          </div>
                          {p.clientFeedback && <p className="project-feedback-text">"{p.clientFeedback}"</p>}
                        </div>
                      )}

                      <div className="profile__project-footer">
                        <span className="tag">{PRICING[p.plan as PricingPlan]?.label || p.plan}</span>
                        <span className="profile__project-date">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setExpandedProject(p)}><ExternalLink size={13} /> View Details</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedProject(p); setTab("chat"); }}><MessageSquare size={13} /> Chat</button>
                        {p.status === "completed" && !hostingRequests.find(h => h.projectId === p.id) && (
                          <button className="btn btn-primary btn-sm" onClick={() => openHostingModal(p)}><Server size={13} /> Host / ZIP</button>
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
                  <h3>Select a project to chat</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16, width: "100%" }}>
                    {projects.map(p => (
                      <button key={p.id} className="btn btn-ghost" style={{ justifyContent: "space-between" }} onClick={() => setSelectedProject(p)}>
                        <span>{p.title}</span>
                        <span className={`badge ${STATUS_COLORS[p.status]}`}>{STATUS_LABELS[p.status]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="profile__chat">
                  <div className="profile__chat-project glass">
                    <strong>{selectedProject.title}</strong>
                    <span className={`badge ${STATUS_COLORS[selectedProject.status]}`}>{STATUS_LABELS[selectedProject.status]}</span>
                    <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => setSelectedProject(null)}><X size={12} /></button>
                  </div>
                  <div className="chat-drive-hint"><Link2 size={13} /><span>Share files? Paste a <strong>Google Drive link</strong> below.</span></div>
                  <div className="profile__chat-messages">
                    {messages.length === 0 && <div className="profile__chat-empty"><MessageSquare size={28} /><p>No messages yet.</p></div>}
                    {messages.map(m => (
                      <div key={m.id} className={`chat-bubble ${m.senderRole === "client" ? "chat-bubble--mine" : "chat-bubble--theirs"}`}>
                        <div className="chat-bubble__role">{m.senderRole === "client" ? "You" : m.senderRole === "admin" ? "Valcrion ✦" : "Developer ✦"}</div>
                        <div className="chat-bubble__content">{m.content}</div>
                        <div className="chat-bubble__time">{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="profile__chat-input">
                    <textarea className="form-input profile__chat-textarea" placeholder="Type a message... (Enter to send)" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={handleKey} rows={2} />
                    <button className="btn btn-primary" onClick={sendMessage} disabled={!chatInput.trim()}><Send size={16} /></button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "new" && (
            <div className="profile__section animate-fade-in">
              <div className="profile__section-header"><h2>New Project</h2></div>
              {created ? (
                <div className="profile__success glass"><CheckCircle size={40} style={{ color: "var(--success)" }} /><h3>Project submitted!</h3><p>We'll assign a developer soon.</p></div>
              ) : (
                <form onSubmit={submitProject} className="profile__form glass">
                  <div className="form-group">
                    <label className="form-label">Project Title *</label>
                    <input type="text" className="form-input" placeholder="e.g. E-commerce website for my clothing brand" value={newForm.title} onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description *</label>
                    <textarea className="form-input" placeholder="Describe your project in detail..." value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} rows={5} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Plan *</label>
                    <div className="profile__plan-grid">
                      {Object.entries(PRICING).map(([key, plan]) => (
                        <div key={key} className={`profile__plan-option ${newForm.plan === key ? "profile__plan-option--selected" : ""}`} onClick={() => setNewForm(f => ({ ...f, plan: key as PricingPlan }))}>
                          <div className="profile__plan-name">{plan.label}</div>
                          <div className="profile__plan-price">{plan.price}</div>
                          <div className="profile__plan-desc">{plan.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reference Files <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span></label>
                    <input type="url" className="form-input" placeholder="https://drive.google.com/..." value={newForm.driveLink} onChange={e => setNewForm(f => ({ ...f, driveLink: e.target.value }))} />
                    <div className="drive-hint">
                      <div className="drive-hint__icon"><FileText size={14} /></div>
                      <div><p className="drive-hint__title">Share files via Google Drive</p>
                        <ol className="drive-hint__steps"><li>Upload → right-click → <strong>Share</strong></li><li>Set <strong>"Anyone with the link"</strong></li><li>Paste above</li></ol>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} disabled={creating}>
                    {creating ? <><span className="spinner" /> Submitting...</> : <><Send size={16} /> Submit Project</>}
                  </button>
                </form>
              )}
            </div>
          )}

          {tab === "hosting" && (
            <div className="profile__section animate-fade-in">
              <div className="profile__section-header"><h2>Hosting & Delivery</h2></div>

              {completedProjects.length > 0 && hostingRequests.filter(h => !completedProjects.find(p => p.id === h.projectId)).length === 0 && (
                <div className="hosting-cta-banner glass">
                  <Server size={28} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  <div>
                    <h4 style={{ marginBottom: 4 }}>Ready to go live?</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Your completed projects can be hosted by us or downloaded as ZIP.</p>
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={() => setTab("projects")}>View Projects</button>
                </div>
              )}

              {hostingRequests.length === 0 ? (
                <div className="profile__empty glass">
                  <Server size={40} style={{ color: "var(--text-muted)", marginBottom: 16 }} />
                  <h3>No hosting requests yet</h3>
                  <p>Once your project is completed, request hosting or a ZIP download.</p>
                  {completedProjects.length > 0 && (
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => setTab("projects")}>Go to Projects</button>
                  )}
                </div>
              ) : (
                <div className="profile__projects">
                  {hostingRequests.map(h => (
                    <div key={h.id} className="skeu-card profile__project-card">
                      <div className="profile__project-top">
                        <h4>{h.projectTitle}</h4>
                        <span className={`badge ${
                          h.status === "delivered" ? "badge-green" :
                          h.status === "in_progress" ? "badge-purple" :
                          h.status === "payment_confirmed" ? "badge-purple" : "badge-yellow"
                        }`}>{h.status.replace("_", " ")}</span>
                      </div>

                      <div style={{ display: "flex", gap: 8, margin: "8px 0", flexWrap: "wrap" }}>
                        <span className="tag">{h.type === "hosting" ? "🖥 Full Hosting" : "📦 ZIP File"}</span>
                        <span className="tag">₹{(h.price||0).toLocaleString()}</span>
                        <span className="tag">{PRICING[h.plan]?.label || h.plan}</span>
                      </div>

                      <div className="hosting-status-steps">
                        {["pending_payment","payment_confirmed","in_progress","delivered"].map((s, i) => (
                          <div key={s} className={`hosting-step ${["pending_payment","payment_confirmed","in_progress","delivered"].indexOf(h.status) >= i ? "hosting-step--done" : ""}`}>
                            <div className="hosting-step__dot" />
                            <span>{s.replace(/_/g, " ")}</span>
                          </div>
                        ))}
                      </div>

                      {h.status === "pending_payment" && (
                        <div className="hosting-pending-box">
                          <Clock size={14} style={{ color: "var(--warning)" }} />
                          <p style={{ fontSize: "0.83rem", color: "var(--text-secondary)" }}>Waiting for payment verification (within 24 hours)</p>
                        </div>
                      )}

                      {h.status === "delivered" && h.deliveryLink && (
                        <a href={h.deliveryLink} target="_blank" rel="noreferrer" className="approve-demo-banner" style={{ marginTop: 10 }}>
                          <Download size={14} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{h.type === "zip" ? "⬇ Download Source Code" : "🌐 View Live Site"}</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{h.deliveryLink}</div>
                          </div>
                          <span style={{ marginLeft: "auto", color: "var(--accent)", fontSize: "0.82rem" }}>Open ↗</span>
                        </a>
                      )}
                      {h.status === "delivered" && h.credentials && (
                        <div className="admin-credentials" style={{ marginTop: 10 }}>
                          <div className="admin-credential-row">
                            <div><div className="admin-credential-label">Credentials / Access</div><div className="admin-credential-val" style={{ whiteSpace: "pre-wrap", fontSize: "0.82rem" }}>{h.credentials}</div></div>
                          </div>
                        </div>
                      )}

                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 10 }}>Requested {new Date(h.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
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
