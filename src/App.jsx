import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import AppRoutes from "./Routes";
import BottomNav from "./components/ui/BottomNav";
import FloatingChat from "./components/FloatingChat";
import ConfirmDialog from "./components/layout/ConfirmDialog";
import SidebarLayout from "./components/layout/SidebarLayout";
import { ThemeProvider } from "./context/ThemeContext";

import UserLogin from "./pages/user-login";
import UserRegistration from "./pages/user-registration";
import CandidateOnboarding from "./pages/candidate-onboarding";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages that should strictly NOT get the sidebar or bottom nav (auth/public pages)
const NO_SIDEBAR_PATHS = ['/', '/user-login', '/user-registration', '/candidate-onboarding'];

const AppShell = () => {
  const location = useLocation();
  const isPublicPage = NO_SIDEBAR_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      <div className="relative z-10">
        <Routes>
          {/* Public / auth pages — strictly NO sidebar */}
          <Route path="/" element={<Landing />} />
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/user-registration" element={<UserRegistration />} />
          <Route path="/candidate-onboarding" element={<CandidateOnboarding />} />

          {/* All authenticated pages — protected and wrapped in sidebar layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <AppRoutes />
                </SidebarLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* Floating chat & bottom nav only on authenticated app pages */}
      {!isPublicPage && <FloatingChat />}
      {!isPublicPage && <BottomNav />}
      <ConfirmDialog />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

export default App;
