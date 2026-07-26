import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { BusinessLayout } from '../layouts/BusinessLayout';

// Auth Pages
import { LandingPage } from '../features/authentication/LandingPage';
import { LoginPage } from '../features/authentication/LoginPage';
import { SignupPage } from '../features/authentication/SignupPage';
import { ForgotPasswordPage } from '../features/authentication/ForgotPasswordPage';
import { RoleSelectionPage } from '../features/authentication/RoleSelectionPage';

// Customer Pages
import { CustomerHome } from '../features/customer/CustomerHome';
import { CustomerDiscover } from '../features/customer/CustomerDiscover';
import { CustomerRestaurantDetails } from '../features/customer/CustomerRestaurantDetails';
import { CustomerReservations } from '../features/customer/CustomerReservations';
import { CustomerOrders } from '../features/customer/CustomerOrders';
import { CustomerProfile } from '../features/customer/CustomerProfile';

// Business Pages
import { BusinessSetupWizard } from '../features/business/BusinessSetupWizard';
import { BusinessBrain } from '../features/business/BusinessBrain';
import { BusinessMenu } from '../features/business/BusinessMenu';
import { BusinessOrders } from '../features/business/BusinessOrders';
import { BusinessReservations } from '../features/business/BusinessReservations';
import { BusinessProfile } from '../features/business/BusinessProfile';

// Guard Wrappers
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.LANDING} element={<LandingPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      </Route>

      {/* Role Selection Route (Protected) */}
      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.ROLE_SELECTION} element={<RoleSelectionPage />} />
      </Route>

      {/* Customer Application Routes */}
      <Route element={<RoleRoute allowedRole="customer" />}>
        <Route element={<CustomerLayout />}>
          <Route path={ROUTES.CUSTOMER_HOME} element={<CustomerHome />} />
          <Route path={ROUTES.CUSTOMER_DISCOVER} element={<CustomerDiscover />} />
          <Route path={ROUTES.CUSTOMER_RESTAURANT_DETAILS} element={<CustomerRestaurantDetails />} />
          <Route path={ROUTES.CUSTOMER_RESERVATIONS} element={<CustomerReservations />} />
          <Route path={ROUTES.CUSTOMER_ORDERS} element={<CustomerOrders />} />
          <Route path={ROUTES.CUSTOMER_PROFILE} element={<CustomerProfile />} />
        </Route>
      </Route>

      {/* Business Application Routes */}
      <Route element={<RoleRoute allowedRole="business" />}>
        <Route path={ROUTES.BUSINESS_SETUP} element={<BusinessSetupWizard />} />
        <Route element={<BusinessLayout />}>
          <Route path={ROUTES.BUSINESS_HOME} element={<BusinessBrain />} />
          <Route path={ROUTES.BUSINESS_MENU} element={<BusinessMenu />} />
          <Route path={ROUTES.BUSINESS_ORDERS} element={<BusinessOrders />} />
          <Route path={ROUTES.BUSINESS_RESERVATIONS} element={<BusinessReservations />} />
          <Route path={ROUTES.BUSINESS_PROFILE} element={<BusinessProfile />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
    </Routes>
  );
};
