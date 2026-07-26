import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Restaurant } from '../types';

const LOCAL_RESTAURANTS_KEY = 'dineflow_restaurants';

export const RestaurantService = {
  async getRestaurantByOwner(ownerId: string): Promise<Restaurant | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', ownerId)
        .maybeSingle();

      if (!error && data) return data;
    }

    const restaurants = this.getLocalRestaurants();
    return restaurants.find((r) => r.owner_id === ownerId) || null;
  },

  async saveRestaurant(restaurantData: Omit<Restaurant, 'id'> & { id?: string }): Promise<Restaurant> {
    if (isSupabaseConfigured && supabase) {
      if (restaurantData.id) {
        const { data, error } = await supabase
          .from('restaurants')
          .update({
            ...restaurantData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', restaurantData.id)
          .select()
          .single();

        if (!error && data) return data;
      } else {
        const { data, error } = await supabase
          .from('restaurants')
          .insert([{
            ...restaurantData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
          .select()
          .single();

        if (!error && data) return data;
      }
    }

    // Local storage persistence
    const restaurants = this.getLocalRestaurants();
    if (restaurantData.id) {
      const idx = restaurants.findIndex((r) => r.id === restaurantData.id);
      if (idx !== -1) {
        const updated = { ...restaurants[idx], ...restaurantData, updated_at: new Date().toISOString() };
        restaurants[idx] = updated;
        localStorage.setItem(LOCAL_RESTAURANTS_KEY, JSON.stringify(restaurants));
        return updated;
      }
    }

    const newRestaurant: Restaurant = {
      ...restaurantData,
      id: 'rest_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    restaurants.push(newRestaurant);
    localStorage.setItem(LOCAL_RESTAURANTS_KEY, JSON.stringify(restaurants));
    return newRestaurant;
  },

  async getAllRestaurants(): Promise<Restaurant[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('restaurants').select('*');
      if (!error && data) return data;
    }

    return this.getLocalRestaurants();
  },

  async getRestaurantsByCity(locationQuery: string): Promise<Restaurant[]> {
    if (!locationQuery || locationQuery === 'Select Location') {
      return this.getAllRestaurants();
    }

    // Extract main city name e.g. "Satara, MH" -> "Satara", "GPS (17.68, 73.99)" -> skip or use raw
    const cleanCity = locationQuery.split(',')[0].trim().replace(/^GPS\s*\(.*\)$/i, '').trim();

    if (!cleanCity) {
      return this.getAllRestaurants();
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .or(`city.ilike.%${cleanCity}%,address.ilike.%${cleanCity}%`);

      if (!error && data) return data;
    }

    const all = this.getLocalRestaurants();
    const queryLower = cleanCity.toLowerCase();
    return all.filter((r) => {
      const rCity = (r.city || '').toLowerCase();
      const rAddr = (r.address || '').toLowerCase();
      return rCity.includes(queryLower) || rAddr.includes(queryLower);
    });
  },

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('restaurants').select('*').eq('id', id).maybeSingle();
      if (!error && data) return data;
    }

    const restaurants = this.getLocalRestaurants();
    return restaurants.find((r) => r.id === id) || null;
  },

  getLocalRestaurants(): Restaurant[] {
    try {
      const stored = localStorage.getItem(LOCAL_RESTAURANTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  },
};
