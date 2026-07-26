import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { AppNotification } from '../types';

const LOCAL_NOTIFICATIONS_KEY = 'dineflow_notifications';

export const NotificationService = {
  async getNotifications(recipientId: string): Promise<AppNotification[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: false });

      if (!error && data) return data;
    }

    const all = this.getLocalNotifications();
    return all.filter((n) => n.recipient_id === recipientId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async addNotification(notif: Omit<AppNotification, 'id' | 'created_at' | 'read'>): Promise<AppNotification> {
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      read: false,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('notifications').insert([newNotif]);
    }

    const all = this.getLocalNotifications();
    all.unshift(newNotif);
    localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(all));

    // Dispatch a custom window event for instant UI update
    window.dispatchEvent(new CustomEvent('dineflow_notification', { detail: newNotif }));

    return newNotif;
  },

  async markAsRead(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    }

    const all = this.getLocalNotifications();
    const idx = all.findIndex((n) => n.id === id);
    if (idx !== -1) {
      all[idx].read = true;
      localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(all));
    }
  },

  async markAllAsRead(recipientId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('notifications').update({ read: true }).eq('recipient_id', recipientId);
    }

    const all = this.getLocalNotifications();
    all.forEach((n) => {
      if (n.recipient_id === recipientId) n.read = true;
    });
    localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(all));
  },

  getLocalNotifications(): AppNotification[] {
    try {
      const stored = localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  },
};
