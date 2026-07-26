import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Reservation, ReservationStatus } from '../types';
import { NotificationService } from './notificationService';

const LOCAL_RESERVATIONS_KEY = 'dineflow_reservations';

export const ReservationService = {
  async getCustomerReservations(customerId: string): Promise<Reservation[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (!error && data) return data;
    }

    const list = this.getLocalReservations();
    return list.filter((r) => r.customer_id === customerId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getBusinessReservations(restaurantId: string): Promise<Reservation[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (!error && data) return data;
    }

    const list = this.getLocalReservations();
    return list.filter((r) => r.restaurant_id === restaurantId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createReservation(
    data: Omit<Reservation, 'id' | 'status' | 'created_at' | 'updated_at'>
  ): Promise<Reservation> {
    const now = new Date().toISOString();
    const newReservation: Reservation = {
      ...data,
      id: 'res_' + Date.now(),
      status: 'pending',
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      const { data: created, error } = await supabase
        .from('reservations')
        .insert([{
          restaurant_id: newReservation.restaurant_id,
          customer_id: newReservation.customer_id,
          customer_name: newReservation.customer_name,
          customer_phone: newReservation.customer_phone,
          restaurant_name: newReservation.restaurant_name,
          reservation_date: newReservation.reservation_date,
          reservation_time: newReservation.reservation_time,
          guest_count: newReservation.guest_count,
          special_request: newReservation.special_request || '',
          visit_intelligence: newReservation.visit_intelligence || null,
          status: 'pending',
        }])
        .select()
        .single();

      if (!error && created) {
        newReservation.id = created.id;
      }
    }

    const list = this.getLocalReservations();
    list.unshift(newReservation);
    localStorage.setItem(LOCAL_RESERVATIONS_KEY, JSON.stringify(list));

    // Notify Restaurant Owner
    await NotificationService.addNotification({
      recipient_id: newReservation.restaurant_id,
      title: 'New Table Reservation Request',
      message: `Reservation request for ${newReservation.guest_count} guests on ${newReservation.reservation_date} at ${newReservation.reservation_time} from ${newReservation.customer_name || 'a diner'}.`,
      type: 'reservation',
    });

    window.dispatchEvent(new CustomEvent('dineflow_reservation_updated', { detail: newReservation }));
    return newReservation;
  },

  async updateReservationStatus(
    reservationId: string,
    status: ReservationStatus,
    unableToFulfilReason?: string
  ): Promise<Reservation> {
    const now = new Date().toISOString();
    const list = this.getLocalReservations();
    const idx = list.findIndex((r) => r.id === reservationId);

    let currentRes: Reservation | null = idx !== -1 ? list[idx] : null;

    if (!currentRes && isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('reservations').select('*').eq('id', reservationId).single();
      if (data) currentRes = data;
    }

    if (!currentRes) {
      throw new Error('Reservation not found.');
    }

    const updatedRes: Reservation = {
      ...currentRes,
      status,
      unable_to_fulfil_reason: unableToFulfilReason || currentRes.unable_to_fulfil_reason,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('reservations')
        .update({
          status,
          unable_to_fulfil_reason: unableToFulfilReason || currentRes.unable_to_fulfil_reason,
          updated_at: now,
        })
        .eq('id', reservationId);
    }

    if (idx !== -1) {
      list[idx] = updatedRes;
    } else {
      list.unshift(updatedRes);
    }
    localStorage.setItem(LOCAL_RESERVATIONS_KEY, JSON.stringify(list));

    // Notify Customer about status change
    const title =
      status === 'confirmed' || status === 'accepted'
        ? 'Reservation Confirmed!'
        : status === 'unable_to_fulfil'
        ? 'Reservation Update: Unable to Fulfil'
        : status === 'cancelled'
        ? 'Reservation Cancelled'
        : `Reservation Status: ${status}`;

    const msg =
      status === 'confirmed' || status === 'accepted'
        ? `Your table for ${updatedRes.guest_count} on ${updatedRes.reservation_date} at ${updatedRes.reservation_time} at ${updatedRes.restaurant_name || 'the restaurant'} is confirmed.`
        : status === 'unable_to_fulfil'
        ? unableToFulfilReason || `We regret that we cannot fulfill your request for ${updatedRes.restaurant_name || 'the restaurant'}.`
        : `Your reservation at ${updatedRes.restaurant_name || 'the restaurant'} has been ${status}.`;

    await NotificationService.addNotification({
      recipient_id: updatedRes.customer_id,
      title,
      message: msg,
      type: 'reservation',
    });

    window.dispatchEvent(new CustomEvent('dineflow_reservation_updated', { detail: updatedRes }));
    return updatedRes;
  },

  getLocalReservations(): Reservation[] {
    try {
      const stored = localStorage.getItem(LOCAL_RESERVATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  },
};
