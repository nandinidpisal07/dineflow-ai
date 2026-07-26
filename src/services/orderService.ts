import { Order, OrderStatus } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { NotificationService } from './notificationService';

const LOCAL_ORDERS_KEY = 'dineflow_orders_db';

export const OrderService = {
  async getCustomerOrders(customerId: string): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (!error && data) return data as Order[];
    }

    const local = localStorage.getItem(LOCAL_ORDERS_KEY);
    const list: Order[] = local ? JSON.parse(local) : [];
    return list.filter((o) => o.customer_id === customerId);
  },

  async getRestaurantOrders(restaurantId: string): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (!error && data) return data as Order[];
    }

    const local = localStorage.getItem(LOCAL_ORDERS_KEY);
    const list: Order[] = local ? JSON.parse(local) : [];
    return list.filter((o) => o.restaurant_id === restaurantId);
  },

  async getBusinessOrders(restaurantId: string): Promise<Order[]> {
    return this.getRestaurantOrders(restaurantId);
  },

  async createOrder(
    order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_status'>
  ): Promise<Order> {
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...order,
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      order_status: 'pending',
      status_history: [{ status: 'pending', timestamp: now }],
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('orders').insert([newOrder]).select().single();
      if (!error && data) {
        // Dispatch window event for live sync
        window.dispatchEvent(new CustomEvent('dineflow_order_updated', { detail: data }));

        // Notify Restaurant Owner
        await NotificationService.addNotification({
          recipient_id: newOrder.restaurant_id,
          title: 'New Food Order Received!',
          message: `New order #${newOrder.id.slice(-6)} placed for ${newOrder.restaurant_name || 'your restaurant'}.`,
          type: 'order',
        });

        return data as Order;
      }
    }

    const local = localStorage.getItem(LOCAL_ORDERS_KEY);
    const list: Order[] = local ? JSON.parse(local) : [];
    list.unshift(newOrder);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(list));

    window.dispatchEvent(new CustomEvent('dineflow_order_updated', { detail: newOrder }));

    // Notify Restaurant Owner
    await NotificationService.addNotification({
      recipient_id: newOrder.restaurant_id,
      title: 'New Food Order Received!',
      message: `New order #${newOrder.id.slice(-6)} placed for ${newOrder.restaurant_name || 'your restaurant'}.`,
      type: 'order',
    });

    return newOrder;
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    unableToFulfilReason?: string
  ): Promise<Order | null> {
    const now = new Date().toISOString();
    const local = localStorage.getItem(LOCAL_ORDERS_KEY);
    const list: Order[] = local ? JSON.parse(local) : [];
    const idx = list.findIndex((o) => o.id === orderId);

    let updatedOrder: Order;

    if (idx !== -1) {
      const history = list[idx].status_history || [];
      updatedOrder = {
        ...list[idx],
        order_status: status,
        unable_to_fulfil_reason: unableToFulfilReason || list[idx].unable_to_fulfil_reason,
        status_history: [...history, { status, timestamp: now }],
        updated_at: now,
      };
    } else {
      updatedOrder = {
        id: orderId,
        restaurant_id: '',
        customer_id: '',
        order_status: status,
        order_items: [],
        total_amount: 0,
        unable_to_fulfil_reason: unableToFulfilReason,
        status_history: [{ status, timestamp: now }],
        created_at: now,
        updated_at: now,
      };
    }

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('orders')
        .update({
          order_status: status,
          unable_to_fulfil_reason: unableToFulfilReason || updatedOrder.unable_to_fulfil_reason,
          status_history: updatedOrder.status_history,
          updated_at: now,
        })
        .eq('id', orderId);
    }

    if (idx !== -1) {
      list[idx] = updatedOrder;
    } else {
      list.unshift(updatedOrder);
    }
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(list));

    // Notify Customer about status change
    const statusLabels: Record<OrderStatus, string> = {
      pending: 'Received',
      accepted: 'Accepted',
      preparing: 'Preparing in Kitchen',
      ready: 'Ready for Serving / Pickup',
      completed: 'Completed',
      delivered: 'Completed',
      cancelled: 'Cancelled',
      rejected: 'Cancelled',
      unable_to_fulfil: 'Unable to Fulfil',
    };

    const msg =
      status === 'unable_to_fulfil' && unableToFulfilReason
        ? unableToFulfilReason
        : `Your order from ${updatedOrder.restaurant_name || 'the restaurant'} is now ${statusLabels[status] || status}.`;

    await NotificationService.addNotification({
      recipient_id: updatedOrder.customer_id,
      title: `Order Status: ${statusLabels[status] || status}`,
      message: msg,
      type: 'order',
    });

    window.dispatchEvent(new CustomEvent('dineflow_order_updated', { detail: updatedOrder }));

    return updatedOrder;
  },
};
