import { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { OrderService } from '../services/orderService';

export function useBusinessOrders(restaurantId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!restaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await OrderService.getBusinessOrders(restaurantId);
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch business orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleUpdate = () => {
      fetchOrders();
    };

    window.addEventListener('dineflow_order_updated', handleUpdate);
    return () => {
      window.removeEventListener('dineflow_order_updated', handleUpdate);
    };
  }, [restaurantId]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const updated = await OrderService.updateOrderStatus(orderId, status);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, order_status: status } : o))
    );
    return updated;
  };

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders,
    updateStatus,
  };
}
