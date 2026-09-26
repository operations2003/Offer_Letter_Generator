import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { LoadingSpinner, EmptyState } from '../common/FeedbackStates.js';
import { ShieldX } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermissions?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermissions,
}) => {
  const { user, isLoading, hasRole, hasPermission } = useAuth();

  if (isLoading) {
    return <LoadingSpinner label="Authenticating session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return (
      <EmptyState
        icon={<ShieldX size={48} style={{ color: 'var(--danger)' }} />}
        title="Access Restricted"
        description={`This view requires one of the following administrative roles: [${allowedRoles.join(', ')}]. Your current role is ${user.roles[0]}.`}
        actionText="Back to Dashboard"
        onAction={() => window.location.assign('/dashboard')}
      />
    );
  }

  if (requiredPermissions && !hasPermission(...requiredPermissions)) {
    return (
      <EmptyState
        icon={<ShieldX size={48} style={{ color: 'var(--danger)' }} />}
        title="Permission Denied"
        description={`Your account lacks the permissions necessary to view this resource.`}
      />
    );
  }

  return <>{children}</>;
};
