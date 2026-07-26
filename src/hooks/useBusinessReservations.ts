import { useState, useEffect } from 'react';
import { Reservation, ReservationStatus } from '../types';
import { ReservationService } from '../services/reservationService';

export function useBusinessReservations(restaurantId: string | undefined) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    if (!restaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ReservationService.getBusinessReservations(restaurantId);
      setReservations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch business reservations.');
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
  }, [restaurantId]);

  const updateStatus = async (reservationId: string, status: ReservationStatus) => {
    const updated = await ReservationService.updateReservationStatus(reservationId, status);
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status } : r))
    );
    return updated;
  };

  return {
    reservations,
    loading,
    error,
    refresh: fetchReservations,
    updateStatus,
  };
}
