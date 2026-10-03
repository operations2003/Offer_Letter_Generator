import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { DocumentsPage } from './pages/DocumentsPage.js';
import { OffersPage } from './pages/OffersPage.js';
import { TemplatesPage } from './pages/TemplatesPage.js';
import { AiStudioPage } from './pages/AiStudioPage.js';
import { AuditLogsPage } from './pages/AuditLogsPage.js';
import { PdfToStructuredLetterPage } from './pages/PdfToStructuredLetterPage.js';
import { EmployeesPage } from './pages/EmployeesPage.js';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage.js';
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
        <Route index element={<Navigate to="/employees" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="employees/:id" element={<EmployeeProfilePage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="documents/create" element={<DocumentsPage createMode={true} />} />
        <Route path="offers" element={<OffersPage />} />
        <Route path="offers/create" element={<Navigate to="/offers?create=true" replace />} />
        <Route path="pdf-to-letter" element={<PdfToStructuredLetterPage />} />
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
