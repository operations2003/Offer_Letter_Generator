import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { DocumentsPage } from './pages/DocumentsPage.js';
import { OffersPage } from './pages/OffersPage.js';
import { TemplatesPage } from './pages/TemplatesPage.js';
import { AiStudioPage } from './pages/AiStudioPage.js';
import { AuditLogsPage } from './pages/AuditLogsPage.js';
import { OnboardingPage } from './pages/OnboardingPage.js';
import { LearningPage } from './pages/LearningPage.js';
import { AssessmentsPage } from './pages/AssessmentsPage.js';
import { PoliciesPage } from './pages/PoliciesPage.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { ProtectedRoute } from './components/layout/ProtectedRoute.js';
import { EmptyState } from './components/common/FeedbackStates.js';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="learning" element={<LearningPage />} />
        <Route path="assessments" element={<AssessmentsPage />} />
        <Route path="policies" element={<PoliciesPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="documents/create" element={<DocumentsPage createMode={true} />} />
        <Route path="offers" element={<OffersPage />} />
        <Route path="offers/create" element={<Navigate to="/offers?create=true" replace />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="ai-studio" element={<AiStudioPage />} />
        <Route
          path="audit-logs"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'AUDITOR']}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 Catch All */}
      <Route
        path="*"
        element={
          <div style={{ padding: '60px 20px', maxWidth: 600, margin: '0 auto' }}>
            <EmptyState
              title="Page Not Found"
              description="The page you requested does not exist or has been relocated."
              actionText="Return to Dashboard"
              onAction={() => window.location.assign('/dashboard')}
            />
          </div>
        }
      />
    </Routes>
  );
};
