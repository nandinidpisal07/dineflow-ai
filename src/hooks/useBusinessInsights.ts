import { useState, useEffect } from 'react';
import { BusinessInsight, Order, Reservation } from '../types';
import { AIService } from '../services/aiService';

export function useBusinessInsights(
  restaurantName: string | undefined,
  orders: Order[],
  reservations: Reservation[]
) {
  const [insight, setInsight] = useState<BusinessInsight | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    if (!restaurantName) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await AIService.getRestaurantBrainInsights({
        restaurant_name: restaurantName,
        todayOrdersCount: orders.length,
        todayReservationsCount: reservations.length,
        upcomingReservations: reservations.filter((r) => r.status === 'pending' || r.status === 'confirmed'),
        pendingOrders: orders.filter((o) => o.order_status === 'pending' || o.order_status === 'preparing'),
      });
      setInsight(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate Restaurant Brain insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [restaurantName, orders.length, reservations.length]);

  return {
    insight,
    loading,
    error,
    refresh: fetchInsights,
  };
}
