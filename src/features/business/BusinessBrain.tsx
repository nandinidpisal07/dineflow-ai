import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RestaurantService } from '../../services/restaurantService';
import { useBusinessOrders } from '../../hooks/useBusinessOrders';
import { useBusinessReservations } from '../../hooks/useBusinessReservations';
import { TodayVisitIntelligence } from './TodayVisitIntelligence';
import { AIOperationsAssistant } from './AIOperationsAssistant';
import { Restaurant } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';
import {
  Brain,
  Sparkles,
  ShoppingBag,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Lightbulb,
} from 'lucide-react';

export const BusinessBrain: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    if (user) {
      RestaurantService.getRestaurantByOwner(user.id).then((rest) => {
        if (!rest) {
          navigate(ROUTES.BUSINESS_SETUP);
        } else {
          setRestaurant(rest);
        }
      });
    }
  }, [user, navigate]);

  const { orders } = useBusinessOrders(restaurant?.id);
  const { reservations } = useBusinessReservations(restaurant?.id);

  const pendingOrdersCount = orders.filter((o) => o.order_status === 'pending').length;
  const pendingReservationsCount = reservations.filter((r) => r.status === 'pending').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {restaurant ? restaurant.restaurant_name : 'Restaurant Intelligence Dashboard'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-visit customer intelligence, operational preparation & live sync
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => navigate(ROUTES.BUSINESS_ORDERS)}
            icon={<ShoppingBag className="w-3.5 h-3.5" />}
          >
            Live Orders ({pendingOrdersCount})
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(ROUTES.BUSINESS_RESERVATIONS)}
            icon={<Calendar className="w-3.5 h-3.5" />}
          >
            Reservations ({pendingReservationsCount})
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Today's Orders</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{orders.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">{pendingOrdersCount} pending action</span>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Reservations</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{reservations.length}</p>
          <span className="text-[11px] text-amber-600 font-semibold">{pendingReservationsCount} awaiting review</span>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Est. Revenue</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(totalRevenue)}</p>
          <span className="text-[11px] text-indigo-600 font-semibold">From {orders.length} orders</span>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">AI Intelligence</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">Active</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Realtime Pre-Visit Analysis</span>
        </Card>
      </div>

      {/* Hero Section 1: Today's Visit Intelligence */}
      <TodayVisitIntelligence reservations={reservations} orders={orders} />

      {/* Hero Section 2: AI Operations Assistant */}
      <AIOperationsAssistant reservations={reservations} orders={orders} />
    </div>
  );
};
