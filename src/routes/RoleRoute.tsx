import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { ROUTES } from '../constants/routes';

interface RoleRouteProps {
  allowedRole: UserRole;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // If user hasn't selected role yet, force role selection
  if (!user.role) {
    return <Navigate to={ROUTES.ROLE_SELECTION} replace />;
  }

  const isBusinessAllowed = allowedRole === 'business' || allowedRole === 'restaurant_owner';
  const isUserBusiness = user.role === 'business' || user.role === 'restaurant_owner';

  const isCustomerAllowed = allowedRole === 'customer';
  const isUserCustomer = user.role === 'customer';

  if (isBusinessAllowed && !isUserBusiness) {
    return <Navigate to={ROUTES.CUSTOMER_HOME} replace />;
  }

  if (isCustomerAllowed && !isUserCustomer) {
    return <Navigate to={ROUTES.BUSINESS_HOME} replace />;
  }

  return <Outlet />;
};
