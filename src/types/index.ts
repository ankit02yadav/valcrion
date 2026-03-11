// ============================================================
// VALCRION — TYPE DEFINITIONS
// ============================================================

export type UserRole = "client" | "developer" | "admin";
export type Theme = "dark" | "light";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Client extends User {
  role: "client";
  projectsCount: number;
  activePlan?: PricingPlan;
}

export interface Developer extends User {
  role: "developer";
  skills: string[];
  assignedProjects: string[];
  completedProjects: number;
  reputationScore: number;
}

export type PricingPlan =
  | "frontendOnly"
  | "backendHeavy"
  | "fullStack"
  | "fullDetailed";

export interface Project {
  id: string;
  clientId: string;
  developerId?: string;
  title: string;
  description: string;
  plan: PricingPlan;
  status: "pending" | "assigned" | "in_progress" | "review" | "client_approved" | "completed";
  documents: Document[];
  demoLink?: string;
  codeLink?: string;  // Drive link to source code — visible to client only after ZIP payment           // set by dev when submitting for review
  clientApproved?: boolean;    // true after client clicks Approve
  clientRating?: number;       // 1-5 stars from client
  clientFeedback?: string;     // text feedback from client
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderRole: UserRole;
  content: string;
  attachments?: Document[];
  timestamp: string;
  read: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  authorId: string; // always admin
  publishedAt: string;
  updatedAt: string;
  published: boolean;
}

export interface JobApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  portfolioUrl?: string;
  githubUrl?: string;
  cvUrl: string;
  coverLetter: string;
  appliedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  read: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  role: string;
  approved: boolean;
  createdAt: string;
}

export interface HostingRequest {
  id: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectTitle: string;
  plan: PricingPlan;
  type: "hosting" | "zip";
  price: number;
  status: "pending_payment" | "payment_confirmed" | "in_progress" | "delivered";
  paymentConfirmed: boolean;
  deliveryLink: string;
  credentials: string;
  createdAt: string;
  updatedAt: string;
}
