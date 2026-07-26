export const ROUTES = {
  // Public
  LANDING: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  ROLE_SELECTION: '/role-selection',

  // Customer
  CUSTOMER_HOME: '/customer',
  CUSTOMER_DISCOVER: '/customer/discover',
  CUSTOMER_RESTAURANT_DETAILS: '/customer/restaurant/:id',
  CUSTOMER_RESERVATIONS: '/customer/reservations',
  CUSTOMER_ORDERS: '/customer/orders',
  CUSTOMER_PROFILE: '/customer/profile',

  // Business
  BUSINESS_HOME: '/business',
  BUSINESS_SETUP: '/business/setup',
  BUSINESS_MENU: '/business/menu',
  BUSINESS_ORDERS: '/business/orders',
  BUSINESS_RESERVATIONS: '/business/reservations',
  BUSINESS_PROFILE: '/business/profile',
} as const;
