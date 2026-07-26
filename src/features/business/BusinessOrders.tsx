import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RestaurantService } from '../../services/restaurantService';
import { useBusinessOrders } from '../../hooks/useBusinessOrders';
import { useAI } from '../../hooks/useAI';
import { Restaurant, OrderStatus, Order } from '../../types';
import { VisitIntelligenceCard } from '../../components/common/VisitIntelligenceCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ShoppingBag, Check, X, Clock, ChefHat, CheckCircle2, ArrowLeft, Store, AlertTriangle, Sparkles } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export const BusinessOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Rejection modal state
  const [rejectionOrder, setRejectionOrder] = useState<Order | null>(null);
  const [rawReason, setRawReason] = useState('');
  const { rewriteRejectionReason, loading: aiLoading } = useAI();
  const [submittingRejection, setSubmittingRejection] = useState(false);

  useEffect(() => {
    if (user) {
      RestaurantService.getRestaurantByOwner(user.id).then((rest) => setRestaurant(rest));
    }
  }, [user]);

  const { orders, loading, updateStatus } = useBusinessOrders(restaurant?.id);

  const filters = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Received' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready' },
    { id: 'completed', label: 'Completed' },
    { id: 'unable_to_fulfil', label: 'Unable to Fulfil' },
  ];

  const filteredOrders = orders.filter((o) => {
    if (selectedFilter === 'all') return true;
    return o.order_status === selectedFilter;
  });

  const handleUnableToFulfilSubmit = async () => {
    if (!rejectionOrder || !rawReason.trim()) return;
    setSubmittingRejection(true);

    try {
      const politeMessage = await rewriteRejectionReason(rawReason, rejectionOrder.customer_name);
      await updateStatus(rejectionOrder.id, 'unable_to_fulfil', politeMessage);
      setRejectionOrder(null);
      setRawReason('');
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setSubmittingRejection(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Received (New)</Badge>;
      case 'accepted':
        return <Badge variant="info">Accepted</Badge>;
      case 'preparing':
        return <Badge variant="purple">Preparing in Kitchen</Badge>;
      case 'ready':
        return <Badge variant="indigo">Ready for Serving</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'unable_to_fulfil':
        return <Badge variant="danger">Unable to Fulfil</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (!restaurant) {
    return (
      <div className="py-12 text-center max-w-lg mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <Store className="w-12 h-12 text-indigo-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">No Restaurant Configured</h2>
        <p className="text-xs text-slate-500">Please set up your restaurant profile first to view and accept incoming orders.</p>
        <Button onClick={() => navigate(ROUTES.BUSINESS_SETUP)} className="w-full">
          Set Up Restaurant Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Live Orders Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept incoming food pre-orders, update kitchen status, and sync guest intelligence in real time.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === f.id
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="No orders found"
          description="There are currently no orders under this status category."
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-5 space-y-4 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">#{order.id.slice(-6)}</span>
                    <h3 className="text-sm font-bold text-slate-900">{order.customer_name || 'Guest Diner'}</h3>
                  </div>
                  <span className="text-[11px] text-slate-400 block">{formatDate(order.created_at)}</span>
                </div>
                {getStatusBadge(order.order_status)}
              </div>

              {/* Items Breakdown */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {(order.order_items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-800 font-medium">
                      <strong className="text-indigo-600 font-bold mr-1">{item.quantity}x</strong> {item.name}
                    </span>
                    <span className="text-slate-600 font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Attached Visit Intelligence Card */}
              {order.visit_intelligence && (
                <VisitIntelligenceCard intelligence={order.visit_intelligence} />
              )}

              {/* Display Reason if Unable to Fulfil */}
              {order.order_status === 'unable_to_fulfil' && order.unable_to_fulfil_reason && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
                  <span className="font-bold block flex items-center gap-1 text-rose-700">
                    <AlertTriangle className="w-3.5 h-3.5" /> Customer Explanation Sent:
                  </span>
                  <p className="italic">&ldquo;{order.unable_to_fulfil_reason}&rdquo;</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <span className="text-sm font-extrabold text-slate-900">
                  Total: {formatCurrency(order.total_amount)}
                </span>

                {/* Workflow Action Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant={order.order_status === 'accepted' ? 'primary' : 'outline'}
                    onClick={() => updateStatus(order.id, 'accepted')}
                    className="text-xs py-1 px-2.5"
                  >
                    Accepted
                  </Button>

                  <Button
                    size="sm"
                    variant={order.order_status === 'preparing' ? 'warning' : 'outline'}
                    onClick={() => updateStatus(order.id, 'preparing')}
                    className="text-xs py-1 px-2.5"
                  >
                    Preparing
                  </Button>

                  <Button
                    size="sm"
                    variant={order.order_status === 'ready' ? 'indigo' : 'outline'}
                    onClick={() => updateStatus(order.id, 'ready')}
                    className="text-xs py-1 px-2.5"
                  >
                    Ready
                  </Button>

                  <Button
                    size="sm"
                    variant={order.order_status === 'completed' ? 'secondary' : 'outline'}
                    onClick={() => updateStatus(order.id, 'completed')}
                    className="text-xs py-1 px-2.5"
                  >
                    Completed
                  </Button>

                  <Button
                    size="sm"
                    variant={order.order_status === 'unable_to_fulfil' ? 'danger' : 'outline'}
                    onClick={() => setRejectionOrder(order)}
                    className="text-xs py-1 px-2.5 text-rose-600 hover:bg-rose-50"
                  >
                    Unable to Fulfil
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Rejection Reason Modal with Gemini Rewriter */}
      {rejectionOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Unable to Fulfil Order</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter internal kitchen reason. Gemini will rewrite it politely for the customer.
                </p>
              </div>
              <button
                onClick={() => setRejectionOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Internal Kitchen Reason (Raw Staff Input):
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Out of stock for Truffle Pasta ingredients or kitchen oven maintenance..."
                value={rawReason}
                onChange={(e) => setRawReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-2 text-xs text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Gemini will automatically rewrite this into a polite explanation for {rejectionOrder.customer_name}.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setRejectionOrder(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                loading={submittingRejection || aiLoading}
                onClick={handleUnableToFulfilSubmit}
                className="text-xs px-4"
              >
                Rewrite & Send to Guest
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
