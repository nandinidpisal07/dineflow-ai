import React, { useEffect, useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ShoppingBag, Clock, CheckCircle, AlertCircle, Utensils, ArrowLeft, Check, ChefHat, Package, XCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { OrderStatus, Order } from '../../types';

export const CustomerOrders: React.FC = () => {
  const navigate = useNavigate();
  const { orders, loading } = useOrders();

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Received (Awaiting Acceptance)</Badge>;
      case 'accepted':
        return <Badge variant="info font-bold">Accepted by Kitchen</Badge>;
      case 'preparing':
        return <Badge variant="purple">Preparing Dishes</Badge>;
      case 'ready':
        return <Badge variant="info">Ready for Pickup / Serve</Badge>;
      case 'completed':
      case 'delivered':
        return <Badge variant="success">Completed</Badge>;
      case 'rejected':
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
    }
  };

  const STEPS: { status: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { status: 'pending', label: 'Received', icon: Clock },
    { status: 'accepted', label: 'Accepted', icon: Check },
    { status: 'preparing', label: 'Preparing', icon: ChefHat },
    { status: 'ready', label: 'Ready', icon: Package },
    { status: 'completed', label: 'Completed', icon: CheckCircle },
  ];

  const getStepStatus = (order: Order, stepStatus: OrderStatus) => {
    if (order.order_status === 'cancelled' || order.order_status === 'rejected') {
      return 'cancelled';
    }

    const orderIndex = STEPS.findIndex((s) => s.status === (order.order_status === 'delivered' ? 'completed' : order.order_status));
    const stepIndex = STEPS.findIndex((s) => s.status === stepStatus);

    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'upcoming';
  };

  const getTimestampForStatus = (order: Order, statusKey: OrderStatus) => {
    if (!order.status_history || !Array.isArray(order.status_history)) return null;
    const item = order.status_history.find(
      (h) => h.status === statusKey || (statusKey === 'completed' && h.status === 'delivered')
    );
    if (!item || !item.timestamp) return null;
    return formatTime(item.timestamp);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
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
          <h1 className="text-2xl font-extrabold text-slate-900">Live Order Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time order status and timeline history from the kitchen</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-slate-200/60 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="No food orders yet"
          description="You haven't placed any food orders yet. Pick a restaurant and order your favorite dishes."
          actionLabel="Explore Restaurants"
          onAction={() => navigate(ROUTES.CUSTOMER_DISCOVER)}
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isCancelled = order.order_status === 'cancelled' || order.order_status === 'rejected';

            return (
              <Card key={order.id} className="p-6 space-y-6 border border-slate-200/90 shadow-md">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Order #{order.id.slice(-6)}</span>
                    <h2 className="text-lg font-extrabold text-slate-900">{order.restaurant_name || 'Restaurant'}</h2>
                    <span className="text-xs text-slate-400">{formatDate(order.created_at)}</span>
                  </div>
                  <div>{getOrderStatusBadge(order.order_status)}</div>
                </div>

                {/* Timeline Stepper */}
                {isCancelled ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
                    <XCircle className="w-5 h-5 shrink-0 text-rose-600" />
                    <div>
                      <strong className="font-bold block">Order Cancelled</strong>
                      <span>This order was cancelled by the restaurant or diner.</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {STEPS.map((step) => {
                        const Icon = step.icon;
                        const state = getStepStatus(order, step.status);
                        const timeStr = getTimestampForStatus(order, step.status);

                        return (
                          <div key={step.status} className="flex flex-col items-center text-center space-y-1.5">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                state === 'completed'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : state === 'current'
                                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse'
                                  : 'bg-slate-200 text-slate-400'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <span
                              className={`text-xs font-bold ${
                                state === 'current'
                                  ? 'text-indigo-600'
                                  : state === 'completed'
                                  ? 'text-slate-900'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step.label}
                            </span>
                            {timeStr ? (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {timeStr}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                {state === 'current' ? 'In progress' : 'Pending'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Order Items Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Ordered Items</h4>
                  <div className="space-y-2 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                    {(order.order_items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-800 font-medium">
                          <strong className="text-indigo-600 font-bold mr-1.5">{item.quantity}x</strong> {item.name}
                        </span>
                        <span className="text-slate-700 font-bold">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Cost */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Paid</span>
                  <span className="text-base font-extrabold text-indigo-600">{formatCurrency(order.total_amount)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
