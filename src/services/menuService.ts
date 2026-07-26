import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { MenuItem } from '../types';

const LOCAL_MENU_ITEMS_KEY = 'dineflow_menu_items';

export const MenuService = {
  async getMenuItemsByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('category', { ascending: true });

      if (!error && data) return data;
    }

    const items = this.getLocalMenuItems();
    return items.filter((i) => i.restaurant_id === restaurantId);
  },

  async saveMenuItem(itemData: Partial<MenuItem> & { restaurant_id: string }): Promise<MenuItem> {
    let savedItem: MenuItem;

    if (isSupabaseConfigured && supabase) {
      if (itemData.id) {
        const { data, error } = await supabase
          .from('menu_items')
          .update({
            ...itemData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', itemData.id)
          .select()
          .single();

        if (!error && data) savedItem = data;
      } else {
        const { data, error } = await supabase
          .from('menu_items')
          .insert([{
            ...itemData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
          .select()
          .single();

        if (!error && data) savedItem = data;
      }
    }

    const items = this.getLocalMenuItems();
    if (itemData.id) {
      const idx = items.findIndex((i) => i.id === itemData.id);
      if (idx !== -1) {
        const updated = { ...items[idx], ...itemData, updated_at: new Date().toISOString() } as MenuItem;
        items[idx] = updated;
        savedItem = updated;
      }
    }

    if (!savedItem!) {
      savedItem = {
        id: 'item_' + Date.now(),
        restaurant_id: itemData.restaurant_id,
        name: itemData.name || 'New Item',
        category: itemData.category || 'Main Course',
        description: itemData.description || '',
        price: itemData.price || 100,
        is_veg: itemData.is_veg ?? true,
        is_available: itemData.is_available ?? true,
        image_url: itemData.image_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      items.push(savedItem);
    }

    localStorage.setItem(LOCAL_MENU_ITEMS_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('dineflow_menu_updated', { detail: savedItem }));
    return savedItem;
  },

  async deleteMenuItem(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('menu_items').delete().eq('id', id);
    }

    const items = this.getLocalMenuItems();
    const filtered = items.filter((i) => i.id !== id);
    localStorage.setItem(LOCAL_MENU_ITEMS_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('dineflow_menu_updated', { detail: { id, deleted: true } }));
    return true;
  },

  async toggleAvailability(id: string, is_available: boolean): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('menu_items').update({ is_available }).eq('id', id);
    }

    const items = this.getLocalMenuItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx !== -1) {
      items[idx].is_available = is_available;
      localStorage.setItem(LOCAL_MENU_ITEMS_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent('dineflow_menu_updated', { detail: items[idx] }));
    }
    return true;
  },

  getLocalMenuItems(): MenuItem[] {
    try {
      const stored = localStorage.getItem(LOCAL_MENU_ITEMS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  },
};
