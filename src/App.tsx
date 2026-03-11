import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClientProfile from "./pages/ClientProfile";
import DevProfile from "./pages/DevProfile";
import AdminPanel from "./pages/AdminPanel";
import Services from "./pages/Services";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Job from "./pages/Job";
import { ROUTES } from "./constants";

// ─── Protected Route ─────────────────────────────────────────
function Protected({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><span className="spinner" /></div>;
  if (!user) return <Navigate to={ROUTES.login} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={ROUTES.home} replace />;
  return <>{children}</>;
}

// ─── Profile Router ───────────────────────────────────────────
function ProfileRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to={ROUTES.login} replace />;
  if (user.role === "admin") return <Navigate to={ROUTES.adminPanel} replace />;
  if (user.role === "developer") return <Navigate to={ROUTES.devProfile} replace />;
  return <ClientProfile />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Header />
          <Routes>
            <Route path={ROUTES.home} element={<Home />} />
            <Route path={ROUTES.services} element={<Services />} />
            <Route path={ROUTES.about} element={<About />} />
            <Route path={ROUTES.blog} element={<Blog />} />
            <Route path={ROUTES.job} element={<Job />} />
            <Route path={ROUTES.login} element={<Login />} />
            <Route path={ROUTES.register} element={<Register />} />

            <Route
              path={ROUTES.profile}
              element={
                <Protected>
                  <ProfileRouter />
                </Protected>
              }
            />
            <Route
              path={ROUTES.devProfile}
              element={
                <Protected roles={["developer"]}>
                  <DevProfile />
                </Protected>
              }
            />
            <Route
              path={ROUTES.adminPanel}
              element={
                <Protected roles={["admin"]}>
                  <AdminPanel />
                </Protected>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
          </Routes>
          <Footer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
