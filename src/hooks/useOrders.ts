import { useState, useEffect } from 'react';
import { Order } from '../types';
import { OrderService } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await OrderService.getCustomerOrders(user.id);
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders.');
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
  }, [user]);

  const createOrder = async (
    data: Omit<Order, 'id' | 'order_status' | 'created_at' | 'updated_at' | 'customer_id'>
  ) => {
    if (!user) throw new Error('You must be logged in.');
    const newOrd = await OrderService.createOrder({
      ...data,
      customer_id: user.id,
      customer_name: user.full_name,
    });
    setOrders((prev) => [newOrd, ...prev]);
    return newOrd;
  };

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders,
    createOrder,
  };
}
