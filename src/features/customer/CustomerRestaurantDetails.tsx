import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RestaurantService } from '../../services/restaurantService';
import { MenuService } from '../../services/menuService';
import { useReservations } from '../../hooks/useReservations';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { Restaurant, MenuItem } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatTime } from '../../utils/formatters';
import {
  Star,
  MapPin,
  Phone,
  Clock,
  Calendar,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  Plus,
  Minus,
  Home,
  AlertCircle,
  Utensils,
  Leaf,
  Drumstick,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export const CustomerRestaurantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { location, setLocation } = useLocation();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isMissingInfoModalOpen, setIsMissingInfoModalOpen] = useState(false);

  // Missing info form state
  const [missingPhone, setMissingPhone] = useState('');
  const [missingAddress, setMissingAddress] = useState('');
  const [missingLocation, setMissingLocation] = useState('');
  const [savingMissingInfo, setSavingMissingInfo] = useState(false);

  // Reservation form
  const { createReservation } = useReservations();
  const todayStr = new Date().toISOString().split('T')[0];
  const [resDate, setResDate] = useState(todayStr);
  const [resTime, setResTime] = useState('19:30');
  const [resGuests, setResGuests] = useState(2);
  const [resRequest, setResRequest] = useState('');
  const [resSubmitting, setResSubmitting] = useState(false);
  const [resSuccess, setResSuccess] = useState(false);
  const [resError, setResError] = useState<string | null>(null);

  // Order food form
  const { createOrder } = useOrders();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cartItems, setCartItems] = useState<{ [itemId: string]: number }>({});
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // AI Q&A
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      RestaurantService.getRestaurantById(id)
        .then(async (data) => {
          let targetRest = data;
          if (!targetRest) {
            const all = await RestaurantService.getAllRestaurants();
            targetRest = all[0] || null;
          }
          setRestaurant(targetRest);
          if (targetRest) {
            const items = await MenuService.getMenuItemsByRestaurant(targetRest.id);
            setMenuItems(items);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    setResError(null);

    // Validate future dates & guest count
    if (resDate < todayStr) {
      setResError('Please select a current or future reservation date.');
      return;
    }

    if (resGuests <= 0) {
      setResError('Guest count must be at least 1 person.');
      return;
    }

    setResSubmitting(true);
    try {
      await createReservation({
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.restaurant_name,
        reservation_date: resDate,
        reservation_time: resTime,
        guest_count: resGuests,
        special_request: resRequest,
      });
      setResSuccess(true);
      setTimeout(() => {
        setResSuccess(false);
        setIsReserveModalOpen(false);
        navigate(ROUTES.CUSTOMER_RESERVATIONS);
      }, 1500);
    } catch (err: any) {
      setResError(err.message || 'Failed to place reservation. Please try again.');
    } finally {
      setResSubmitting(false);
    }
  };

  const updateCart = (itemId: string, delta: number) => {
    setCartItems((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const calculateOrderTotal = () => {
    return Object.entries(cartItems).reduce((sum, [itemId, qty]) => {
      const item = menuItems.find((m) => m.id === itemId);
      const quantity = Number(qty);
      return sum + (item ? item.price * quantity : 0);
    }, 0);
  };

  const handleOrderInitiate = () => {
    if (!user) return;
    const hasPhone = Boolean(user.phone && user.phone.trim().length > 3);
    const hasAddress = Boolean(user.delivery_address && user.delivery_address.trim().length > 3);
    const hasLoc = Boolean((user.location || location) && (user.location || location).trim().length > 2);

    if (!hasPhone || !hasAddress || !hasLoc) {
      setMissingPhone(user.phone || '');
      setMissingAddress(user.delivery_address || '');
      setMissingLocation(user.location || location || '');
      setIsMissingInfoModalOpen(true);
      return;
    }

    executeOrderPlacement();
  };

  const handleMissingInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missingPhone.trim() || !missingAddress.trim() || !missingLocation.trim()) return;

    setSavingMissingInfo(true);
    try {
      await updateProfile({
        phone: missingPhone.trim(),
        delivery_address: missingAddress.trim(),
        location: missingLocation.trim(),
      });
      setLocation(missingLocation.trim());
      setIsMissingInfoModalOpen(false);
      executeOrderPlacement();
    } catch {
      // ignore
    } finally {
      setSavingMissingInfo(false);
    }
  };

  const executeOrderPlacement = async () => {
    if (!restaurant) return;
    const items = Object.entries(cartItems).map(([itemId, qty]) => {
      const item = menuItems.find((m) => m.id === itemId)!;
      return { id: item.id, name: item.name, quantity: Number(qty), price: item.price };
    });

    if (items.length === 0) return;

    setOrderSubmitting(true);
    setOrderError(null);
    try {
      await createOrder({
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.restaurant_name,
        order_items: items,
        total_amount: calculateOrderTotal(),
      });
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setIsOrderModalOpen(false);
        navigate(ROUTES.CUSTOMER_ORDERS);
      }, 1500);
    } catch (err: any) {
      setOrderError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || !restaurant) return;
    setAiLoading(true);
    setTimeout(() => {
      setAiAnswer(
        `At ${restaurant.restaurant_name}, guests praise the authentic flavors and cozy ambiance. Top recommended dish: Truffle Mushroom Tagliatelle paired with freshly baked garlic sourdough.`
      );
      setAiLoading(false);
    }, 800);
  };

  if (loading || !restaurant) {
    return (
      <div className="py-12 text-center text-slate-500 text-xs">
        Loading restaurant details...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-2 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl">
        <div className="h-60 sm:h-72 w-full relative">
          <img
            src={restaurant.cover_image}
            alt={restaurant.restaurant_name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="purple" size="md">
                {restaurant.cuisine}
              </Badge>
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>{restaurant.rating || 4.8}</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{restaurant.restaurant_name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">{restaurant.description}</p>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              onClick={() => setIsReserveModalOpen(true)}
              size="md"
              icon={<Calendar className="w-4 h-4" />}
            >
              Reserve Table
            </Button>
            <Button
              onClick={() => setIsOrderModalOpen(true)}
              variant="secondary"
              size="md"
              icon={<ShoppingBag className="w-4 h-4" />}
            >
              Order Food
            </Button>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Address</span>
            <span className="text-xs font-medium text-slate-800">{restaurant.address}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Opening Hours</span>
            <span className="text-xs font-medium text-slate-800">
              {formatTime(restaurant.opening_time)} - {formatTime(restaurant.closing_time)}
            </span>
          </div>
        </Card>

        <Card className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone & Contact</span>
            <span className="text-xs font-medium text-slate-800">{restaurant.phone}</span>
          </div>
        </Card>
      </div>

      {/* AI Q&A Card */}
      <Card className="bg-indigo-50/40 border-indigo-100 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Ask DineFlow AI about {restaurant.restaurant_name}</h3>
        </div>

        <form onSubmit={handleAskAI} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. What are the best signature dishes and ambiance highlights?"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs bg-white rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <Button type="submit" size="sm" loading={aiLoading}>
            Ask AI
          </Button>
        </form>

        {aiAnswer && (
          <div className="p-3.5 bg-white rounded-xl border border-indigo-100 text-xs text-slate-700 leading-relaxed animate-in fade-in">
            {aiAnswer}
          </div>
        )}
      </Card>

      {/* Menu Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Restaurant Menu</h2>
          </div>
          <Button
            size="sm"
            onClick={() => setIsOrderModalOpen(true)}
            icon={<ShoppingBag className="w-4 h-4" />}
          >
            Order Food Now
          </Button>
        </div>

        {menuItems.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            No dishes listed on the menu yet. Check back soon!
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <Card key={item.id} className="p-4 flex flex-col justify-between hover:border-indigo-200 transition-colors">
                <div className="flex items-start gap-3">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-500">
                      <Utensils className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`w-3 h-3 rounded-xs border flex items-center justify-center p-0.5 shrink-0 ${
                          item.is_veg ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-rose-600 bg-rose-50 text-rose-600'
                        }`}
                      >
                        {item.is_veg ? <Leaf className="w-2 h-2" /> : <Drumstick className="w-2 h-2" />}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-1">{item.description}</p>
                    {item.ingredients && (
                      <p className="text-[10px] text-slate-500 mb-1">
                        <strong className="font-medium text-slate-700">Ingredients:</strong> {item.ingredients}
                      </p>
                    )}
                    {item.allergens && (
                      <p className="text-[10px] text-amber-700 font-medium mb-2">
                        ⚠️ Allergens: {item.allergens}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">{formatCurrency(item.price)}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reserve Table Modal */}
      <Modal
        isOpen={isReserveModalOpen}
        onClose={() => {
          setIsReserveModalOpen(false);
          setResError(null);
        }}
        title={`Reserve Table at ${restaurant.restaurant_name}`}
      >
        {resSuccess ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-900">Reservation Confirmed!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your table request for {resGuests} guests on {resDate} at {resTime} has been saved.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReserveSubmit} className="space-y-4">
            {resError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resError}</span>
              </div>
            )}
            <Input
              label="Reservation Date"
              type="date"
              min={todayStr}
              value={resDate}
              onChange={(e) => setResDate(e.target.value)}
              required
            />
            <Input
              label="Preferred Time"
              type="time"
              value={resTime}
              onChange={(e) => setResTime(e.target.value)}
              required
            />
            <Input
              label="Number of Guests"
              type="number"
              min="1"
              max="20"
              value={resGuests}
              onChange={(e) => setResGuests(parseInt(e.target.value, 10))}
              required
            />
            <Input
              label="Special Request (Optional)"
              placeholder="e.g. Quiet table, anniversary celebration"
              value={resRequest}
              onChange={(e) => setResRequest(e.target.value)}
            />
            <Button type="submit" loading={resSubmitting} className="w-full mt-2">
              Confirm Reservation
            </Button>
          </form>
        )}
      </Modal>

      {/* Order Food Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setOrderError(null);
        }}
        title={`Order Food from ${restaurant.restaurant_name}`}
        maxWidth="lg"
      >
        {orderSuccess ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-900">Order Placed Successfully!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your order has been logged. You can track status in real-time under "Orders".
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{orderError}</span>
              </div>
            )}
            <p className="text-xs text-slate-500">Select items from the menu below:</p>
            <div className="space-y-2.5">
              {(menuItems || []).map((item) => {
                const qty = cartItems[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200/80"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs font-semibold text-indigo-600">{formatCurrency(item.price)}</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateCart(item.id, -1)}
                        className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{qty}</span>
                      <button
                        type="button"
                        onClick={() => updateCart(item.id, 1)}
                        className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Total Amount</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {formatCurrency(calculateOrderTotal())}
                </span>
              </div>
              <Button
                onClick={handleOrderInitiate}
                disabled={calculateOrderTotal() === 0 || orderSubmitting}
                loading={orderSubmitting}
              >
                Place Order
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Missing Information Prompt Modal */}
      <Modal
        isOpen={isMissingInfoModalOpen}
        onClose={() => setIsMissingInfoModalOpen(false)}
        title="Delivery Details Required"
      >
        <form onSubmit={handleMissingInfoSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Please provide your contact phone number, delivery address, and city location to complete your order.
          </p>

          <Input
            label="Phone Number"
            placeholder="+91 98765 43210"
            value={missingPhone}
            onChange={(e) => setMissingPhone(e.target.value)}
            required
            icon={<Phone className="w-4 h-4" />}
          />

          <Input
            label="Delivery Address"
            placeholder="Flat No, House/Building Name, Street"
            value={missingAddress}
            onChange={(e) => setMissingAddress(e.target.value)}
            required
            icon={<Home className="w-4 h-4" />}
          />

          <Input
            label="City / Location"
            placeholder="e.g. Bengaluru, KA or Indiranagar"
            value={missingLocation}
            onChange={(e) => setMissingLocation(e.target.value)}
            required
            icon={<MapPin className="w-4 h-4" />}
          />

          <Button type="submit" loading={savingMissingInfo} className="w-full mt-2">
            Save Details & Place Order
          </Button>
        </form>
      </Modal>
    </div>
  );
};
