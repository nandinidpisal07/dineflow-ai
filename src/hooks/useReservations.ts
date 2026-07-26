import { useState, useEffect } from 'react';
import { Reservation } from '../types';
import { ReservationService } from '../services/reservationService';
import { useAuth } from '../contexts/AuthContext';

export function useReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ReservationService.getCustomerReservations(user.id);
      setReservations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();

    const handleUpdate = () => {
      fetchReservations();
    };

    window.addEventListener('dineflow_reservation_updated', handleUpdate);
    return () => {
      window.removeEventListener('dineflow_reservation_updated', handleUpdate);
    };
  }, [user]);

  const createReservation = async (
    data: Omit<Reservation, 'id' | 'status' | 'created_at' | 'updated_at' | 'customer_id'>
  ) => {
    if (!user) throw new Error('You must be logged in.');
    const newRes = await ReservationService.createReservation({
      ...data,
      customer_id: user.id,
      customer_name: user.full_name,
      customer_phone: user.phone,
    });
    setReservations((prev) => [newRes, ...prev]);
    return newRes;
  };

  return {
    reservations,
    loading,
    error,
    refresh: fetchReservations,
    createReservation,
  };
}
