import React from "react";
import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import MainDashboard from './pages/main-dashboard';
import ApplicationTracker from './pages/application-tracker';
import UserProfileManagement from './pages/user-profile-management';
import Settings from 'pages/Settings';
import ResumeToolsPage from './pages/resume-tools';
import AIInterviewPage from './pages/ai-interview/InterviewPage';
import AtsAnalyzer from './pages/resume-tools/AtsAnalyzer';

// Jobs pages (Talentd API)
import AllJobs from './pages/jobs/AllJobs';
import FreshersJobs from './pages/jobs/FreshersJobs';
import InternshipsJobs from './pages/jobs/InternshipsJobs';

const Routes = () => {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Core application routes */}
        <Route path="/" element={<Navigate to="/main-dashboard" replace />} />
        <Route path="/main-dashboard" element={<MainDashboard />} />
        <Route path="/application-tracker" element={<ApplicationTracker />} />
        <Route path="/internship-recommendations" element={<Navigate to="/jobs" replace />} />
        <Route path="/resume-tools" element={<ResumeToolsPage />} />
        <Route path="/resume-builder" element={<Navigate to="/resume-tools" replace />} />
        <Route path="/user-profile-management" element={<UserProfileManagement />} />
        <Route path="/profile" element={<Navigate to="/user-profile-management" replace />} />
        <Route path="/settings" element={<Settings />} />

        {/* Feature routes */}
        <Route path="/ai-interview" element={<AIInterviewPage />} />
        <Route path="/ats-analyzer" element={<AtsAnalyzer />} />
        <Route path="/job-search" element={<Navigate to="/jobs" replace />} />
        <Route path="/discover" element={<Navigate to="/jobs" replace />} />

        {/* Jobs routes (Talentd API) */}
        <Route path="/jobs" element={<AllJobs />} />
        <Route path="/jobs/freshers" element={<FreshersJobs />} />
        <Route path="/jobs/internships" element={<InternshipsJobs />} />

        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </ErrorBoundary>
  );
};

export default Routes;
