import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAI } from '../../hooks/useAI';
import { useRestaurants } from '../../hooks/useRestaurants';
import { useAuth } from '../../contexts/AuthContext';
import { ReservationService } from '../../services/reservationService';
import { VisitIntelligenceCard } from '../../components/common/VisitIntelligenceCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Sparkles, Calendar, ArrowRight, Star, Utensils, Send, CheckCircle2, AlertCircle, ShoppingBag, Heart } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Restaurant } from '../../types';

export const CustomerHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [visitText, setVisitText] = useState('');
  const { visitIntelligence, loading: aiLoading, extractVisitIntelligence } = useAI();
  const { restaurants, loading: loadingRestaurants } = useRestaurants();

  // Reservation modal state
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [resDate, setResDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [resTime, setResTime] = useState('19:30');
  const [guestCount, setGuestCount] = useState(2);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const sampleVisits = [
    "It's my mother's birthday. My grandfather uses a wheelchair. We have a movie at 8 PM. Peanut allergy, need Jain food, quiet place.",
    "Business meeting for 4. Quiet window corner table required, express 30-min lunch, vegetarian options.",
    "Anniversary date night for 2. Quiet romantic corner, special cake slice with candle, mild spice.",
    "Family dinner with toddler. Need high chair, ground floor seating, non-spicy food options.",
  ];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (visitText.trim()) {
      await extractVisitIntelligence(visitText);
    }
  };

  const handleOpenBooking = (rest: Restaurant) => {
    setSelectedRestaurant(rest);
    setIsReserveModalOpen(true);
    setBookingSuccess(false);
  };

  const handleConfirmReservation = async () => {
    if (!selectedRestaurant || !user) return;
    setBookingLoading(true);

    try {
      await ReservationService.createReservation({
        restaurant_id: selectedRestaurant.id,
        restaurant_name: selectedRestaurant.restaurant_name,
        customer_id: user.id,
        customer_name: user.full_name || 'Diner',
        customer_phone: user.phone || '9876543210',
        reservation_date: resDate,
        reservation_time: resTime,
        guest_count: Number(guestCount),
        special_request: visitText || 'Special Visit Preparation Requested',
        visit_intelligence: visitIntelligence || undefined,
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setIsReserveModalOpen(false);
        navigate('/customer/reservations');
      }, 1500);
    } catch (err) {
      console.error('Failed to create reservation:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold w-fit mb-4 border border-indigo-500/30">
          <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
          <span>DineFlow AI • Visit Intelligence</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
          Tell us about your visit.
        </h1>
        <p className="text-xs sm:text-sm text-indigo-200 max-w-xl mb-6 leading-relaxed">
          Describe your upcoming dining occasion in natural language — accessibility needs, birthdays, food allergies, or time constraints. Our AI structures your intent for restaurant staff to prepare before you arrive.
        </p>

        <form onSubmit={handleAnalyze} className="space-y-3 max-w-2xl">
          <div className="relative">
            <textarea
              rows={3}
              placeholder="e.g. It's my mother's birthday. My grandfather uses a wheelchair. We have a movie at 8 PM. Peanut allergy, need Jain food, quiet place..."
              value={visitText}
              onChange={(e) => setVisitText(e.target.value)}
              className="w-full p-4 pr-32 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm rounded-2xl shadow-lg border-0 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"
            />
            <Button
              type="submit"
              loading={aiLoading}
              size="sm"
              icon={<Send className="w-3.5 h-3.5" />}
              className="absolute right-3 bottom-3 py-2 px-4 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700"
            >
              Analyze Intent
            </Button>
          </div>
        </form>

        {/* Preset Sample Prompts */}
        <div className="mt-4 pt-3 border-t border-indigo-800/60">
          <span className="text-[11px] text-indigo-300 font-medium block mb-2">Try sample visit descriptions:</span>
          <div className="flex flex-wrap gap-2">
            {sampleVisits.map((sv, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setVisitText(sv);
                  extractVisitIntelligence(sv);
                }}
                className="text-left px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium border border-white/10 transition-colors line-clamp-1 max-w-xs"
              >
                {sv}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visit Intelligence Result Preview */}
      {visitIntelligence && (
        <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
          <VisitIntelligenceCard intelligence={visitIntelligence} />

          <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Ready to transmit this intelligence?</h4>
              <p className="text-xs text-slate-600">Select a registered restaurant below to attach this structured preparation intelligence to your reservation or order.</p>
            </div>
          </div>
        </div>
      )}

      {/* Registered Restaurants Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Select Restaurant for Visit</h2>
            <p className="text-xs text-slate-500">Explore authentic registered restaurants that prepare for your visit in advance</p>
          </div>
        </div>

        {loadingRestaurants ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-56 bg-slate-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-6">
            <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No registered restaurants found yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              Restaurant owners can register their business to receive customer visit intelligence and manage live operations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {restaurants.map((rest) => (
              <Card
                key={rest.id}
                className="p-0 overflow-hidden group border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 bg-slate-200 overflow-hidden">
                    <img
                      src={
                        rest.cover_image ||
                        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={rest.restaurant_name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-slate-900 flex items-center gap-1 shadow-2xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{rest.rating || 4.8}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {rest.restaurant_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{rest.cuisine || 'Multi-Cuisine'}</p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{rest.address}, {rest.city}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    Avg {formatCurrency(rest.average_cost)}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/customer/restaurant/${rest.id}`)}
                      className="text-xs py-1.5 px-3"
                    >
                      View Menu
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleOpenBooking(rest)}
                      className="text-xs py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700"
                    >
                      Reserve Table
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Reservation Modal with Visit Intelligence */}
      {isReserveModalOpen && selectedRestaurant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Reserve Table at {selectedRestaurant.restaurant_name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Your visit intelligence will be transmitted to restaurant operations</p>
              </div>
              <button
                onClick={() => setIsReserveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-slate-900">Reservation & Intelligence Transmitted!</h4>
                <p className="text-xs text-slate-500">The restaurant team has received your table reservation and visit requirements.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visitIntelligence && (
                  <VisitIntelligenceCard intelligence={visitIntelligence} compact />
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Date"
                    type="date"
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                  />
                  <Input
                    label="Time"
                    type="time"
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Number of Guests</label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
                      <option key={n} value={n}>{n} Guests</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button variant="ghost" size="sm" onClick={() => setIsReserveModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    loading={bookingLoading}
                    onClick={handleConfirmReservation}
                    className="bg-indigo-600 hover:bg-indigo-700 text-xs px-5 py-2.5"
                  >
                    Transmit Reservation & Intelligence
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
