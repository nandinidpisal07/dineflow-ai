import { useState, useEffect } from 'react';
import { Restaurant } from '../types';
import { RestaurantService } from '../services/restaurantService';

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await RestaurantService.getAllRestaurants();
      setRestaurants(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load restaurants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return {
    restaurants,
    loading,
    error,
    refresh: fetchRestaurants,
  };
}
