import React from 'react';
import { useReservations } from '../../hooks/useReservations';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { VisitIntelligenceCard } from '../../components/common/VisitIntelligenceCard';
import { Calendar, Clock, Users, XCircle, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { ReservationStatus } from '../../types';
import { ReservationService } from '../../services/reservationService';

export const CustomerReservations: React.FC = () => {
  const navigate = useNavigate();
  const { reservations, loading, refresh } = useReservations();

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'accepted':
      case 'confirmed':
        return <Badge variant="success">Confirmed & Preparing</Badge>;
      case 'preparing':
        return <Badge variant="warning">Staff Preparing Operations</Badge>;
      case 'ready':
        return <Badge variant="indigo">Table Ready</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'unable_to_fulfil':
        return <Badge variant="danger">Unable to Fulfil</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="warning">Pending Staff Review</Badge>;
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await ReservationService.updateReservationStatus(id, 'cancelled');
      refresh();
    } catch {
      // ignore
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
          <h1 className="text-2xl font-extrabold text-slate-900">My Reservations & Visit Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">Track pre-visit table preparation and staff updates in real time</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8" />}
          title="No reservations yet"
          description="Describe your visit on the home page to transmit pre-visit intelligence and reserve your table."
          actionLabel="Tell Us About Your Visit"
          onAction={() => navigate(ROUTES.CUSTOMER_HOME)}
        />
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <Card key={res.id} className="p-5 space-y-4 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{res.restaurant_name || 'Restaurant'}</h3>
                  {getStatusBadge(res.status)}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span>RES #{res.id.slice(-6)}</span>
                </div>
              </div>

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
              </div>

              {/* Attached Visit Intelligence */}
              {res.visit_intelligence && (
                <VisitIntelligenceCard intelligence={res.visit_intelligence} />
              )}

              {/* Polite Rejection Reason if Unable to Fulfil */}
              {res.status === 'unable_to_fulfil' && res.unable_to_fulfil_reason && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-2 text-amber-700 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Message from Restaurant Management:</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium mt-1">&ldquo;{res.unable_to_fulfil_reason}&rdquo;</p>
                </div>
              )}

              {res.status === 'pending' && (
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancel(res.id)}
                    className="text-rose-600 hover:bg-rose-50 text-xs"
                    icon={<XCircle className="w-4 h-4" />}
                  >
                    Cancel Reservation Request
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
