import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RestaurantService } from '../../services/restaurantService';
import { useBusinessReservations } from '../../hooks/useBusinessReservations';
import { useAI } from '../../hooks/useAI';
import { Restaurant, ReservationStatus, Reservation } from '../../types';
import { VisitIntelligenceCard } from '../../components/common/VisitIntelligenceCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate, formatTime } from '../../utils/formatters';
import { Calendar, Clock, Users, Phone, Check, X, CheckCircle2, ArrowLeft, AlertTriangle, Sparkles, ChefHat } from 'lucide-react';

export const BusinessReservations: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Modal state for Unable to Fulfil
  const [rejectionRes, setRejectionRes] = useState<Reservation | null>(null);
  const [rawReason, setRawReason] = useState('');
  const { rewriteRejectionReason, loading: aiLoading } = useAI();
  const [submittingRejection, setSubmittingRejection] = useState(false);

  useEffect(() => {
    if (user) {
      RestaurantService.getRestaurantByOwner(user.id).then((rest) => setRestaurant(rest));
    }
  }, [user]);

  const { reservations, loading, updateStatus } = useBusinessReservations(restaurant?.id);

  const filters = [
    { id: 'all', label: 'All Reservations' },
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready' },
    { id: 'completed', label: 'Completed' },
    { id: 'unable_to_fulfil', label: 'Unable to Fulfil' },
  ];

  const filteredReservations = reservations.filter((r) => {
    if (selectedFilter === 'all') return true;
    return r.status === selectedFilter;
  });

  const handleUnableToFulfilSubmit = async () => {
    if (!rejectionRes || !rawReason.trim()) return;
    setSubmittingRejection(true);

    try {
      // Rewrite reason into polite customer message
      const politeMessage = await rewriteRejectionReason(rawReason, rejectionRes.customer_name);
      await updateStatus(rejectionRes.id, 'unable_to_fulfil', politeMessage);
      setRejectionRes(null);
      setRawReason('');
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setSubmittingRejection(false);
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'accepted':
      case 'confirmed':
        return <Badge variant="success">Accepted</Badge>;
      case 'preparing':
        return <Badge variant="warning">Preparing Operations</Badge>;
      case 'ready':
        return <Badge variant="indigo">Table Ready</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'unable_to_fulfil':
        return <Badge variant="danger">Unable to Fulfil</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="warning">Awaiting Action</Badge>;
    }
  };

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
          <h1 className="text-2xl font-extrabold text-slate-900">Reservation Operations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational preparation, table readiness & guest intelligence management
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

      {/* Reservations List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredReservations.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8" />}
          title="No reservations found"
          description="There are currently no table reservations under this status category."
        />
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((res) => (
            <Card key={res.id} className="p-5 space-y-4 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{res.customer_name || 'Guest'}</h3>
                  {getStatusBadge(res.status)}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span>RES #{res.id.slice(-6)}</span>
                </div>
              </div>

              {/* Guest metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  {formatDate(res.reservation_date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  {formatTime(res.reservation_time)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  {res.guest_count} Guests
                </span>
                {res.customer_phone && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                    {res.customer_phone}
                  </span>
                )}
              </div>

              {/* Attached Visit Intelligence Card */}
              {res.visit_intelligence && (
                <VisitIntelligenceCard intelligence={res.visit_intelligence} />
              )}

              {/* Display Reason if Unable to Fulfil */}
              {res.status === 'unable_to_fulfil' && res.unable_to_fulfil_reason && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
                  <span className="font-bold block flex items-center gap-1 text-rose-700">
                    <AlertTriangle className="w-3.5 h-3.5" /> Customer Explanation Sent:
                  </span>
                  <p className="italic">&ldquo;{res.unable_to_fulfil_reason}&rdquo;</p>
                </div>
              )}

              {/* Operational Workflow Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Operational Preparation Status:
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant={res.status === 'accepted' || res.status === 'confirmed' ? 'primary' : 'outline'}
                    onClick={() => updateStatus(res.id, 'accepted')}
                    className="text-xs py-1 px-2.5"
                  >
                    Accepted
                  </Button>

                  <Button
                    size="sm"
                    variant={res.status === 'preparing' ? 'warning' : 'outline'}
                    onClick={() => updateStatus(res.id, 'preparing')}
                    className="text-xs py-1 px-2.5"
                  >
                    Preparing
                  </Button>

                  <Button
                    size="sm"
                    variant={res.status === 'ready' ? 'indigo' : 'outline'}
                    onClick={() => updateStatus(res.id, 'ready')}
                    className="text-xs py-1 px-2.5"
                  >
                    Table Ready
                  </Button>

                  <Button
                    size="sm"
                    variant={res.status === 'completed' ? 'secondary' : 'outline'}
                    onClick={() => updateStatus(res.id, 'completed')}
                    className="text-xs py-1 px-2.5"
                  >
                    Completed
                  </Button>

                  <Button
                    size="sm"
                    variant={res.status === 'unable_to_fulfil' ? 'danger' : 'outline'}
                    onClick={() => setRejectionRes(res)}
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

      {/* Unable to Fulfil Modal with Gemini Rewriter */}
      {rejectionRes && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Unable to Fulfil Request</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter internal staff reason. Gemini will rewrite it politely for the customer.
                </p>
              </div>
              <button
                onClick={() => setRejectionRes(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Internal Reason (Raw Staff Input):
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Kitchen ran out of Jain cottage cheese for today's lunch or Ramp maintenance in progress..."
                value={rawReason}
                onChange={(e) => setRawReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-2 text-xs text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Gemini will automatically rewrite this into a polite, empathetic apology for {rejectionRes.customer_name}.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setRejectionRes(null)}>
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
