import React from 'react';
import { ROUTES } from './routes';
import { Sparkles, Compass, Calendar, ShoppingBag, User, Brain, Utensils } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CUSTOMER_NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: ROUTES.CUSTOMER_HOME, icon: Sparkles },
  { label: 'Discover', path: ROUTES.CUSTOMER_DISCOVER, icon: Compass },
  { label: 'Reservations', path: ROUTES.CUSTOMER_RESERVATIONS, icon: Calendar },
  { label: 'Orders', path: ROUTES.CUSTOMER_ORDERS, icon: ShoppingBag },
  { label: 'Profile', path: ROUTES.CUSTOMER_PROFILE, icon: User },
];

export const BUSINESS_NAV_ITEMS: NavItem[] = [
  { label: 'Restaurant Brain', path: ROUTES.BUSINESS_HOME, icon: Brain },
  { label: 'Menu', path: ROUTES.BUSINESS_MENU, icon: Utensils },
  { label: 'Orders', path: ROUTES.BUSINESS_ORDERS, icon: ShoppingBag },
  { label: 'Reservations', path: ROUTES.BUSINESS_RESERVATIONS, icon: Calendar },
  { label: 'Profile', path: ROUTES.BUSINESS_PROFILE, icon: User },
];
