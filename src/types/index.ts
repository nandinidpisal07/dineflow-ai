export type UserRole = 'customer' | 'restaurant_owner' | 'business';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole | null;
  phone?: string;
  profile_image?: string;
  location?: string;
  delivery_address?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerProfile extends UserProfile {
  role: 'customer';
  saved_location?: string;
}

export interface BusinessProfile extends UserProfile {
  role: 'restaurant_owner' | 'business';
  restaurant_id?: string;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  restaurant_name: string;
  description: string;
  logo?: string;
  cover_image?: string;
  cuisine: string;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  phone: string;
  email?: string;
  opening_time: string;
  closing_time: string;
  average_cost: number;
  table_capacity?: number;
  images?: string[];
  rating?: number;
  distance_km?: number;
  is_open?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VisitIntelligence {
  raw_input?: string;
  occasion: string; // e.g., Birthday, Anniversary, Business Meeting, Family Visit, Casual
  dietary_preference: string; // e.g., Jain, Vegan, Vegetarian, Non-Veg, Gluten-Free, None
  allergies: string; // e.g., Peanuts, Dairy, Nuts, Seafood, None
  accessibility: string; // e.g., Wheelchair required, Ground floor seating, Elevator access, None
  seating_preference: string; // e.g., Quiet corner, Window table, High chair for child, Outdoor, None
  time_constraints: string; // e.g., Express dining - Movie at 8 PM, 30 mins, None
  spice_preference: string; // e.g., Mild, Medium, Spicy, None
  special_requests: string; // e.g., Bring birthday slice with candle, Water at table upon arrival, None
  priority: 'High' | 'Medium' | 'Normal';
}

export type ReservationStatus = 'pending' | 'confirmed' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'unable_to_fulfil';

export interface Reservation {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  special_request?: string;
  status: ReservationStatus;
  visit_intelligence?: VisitIntelligence;
  unable_to_fulfil_reason?: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'delivered' | 'rejected' | 'cancelled' | 'unable_to_fulfil';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  order_status: OrderStatus;
  order_items: OrderItem[];
  total_amount: number;
  visit_intelligence?: VisitIntelligence;
  unable_to_fulfil_reason?: string;
  status_history?: { status: OrderStatus; timestamp: string }[];
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  is_veg: boolean;
  is_available: boolean;
  image_url?: string;
  ingredients?: string;
  allergens?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AppNotification {
  id: string;
  recipient_id: string; // user_id or restaurant_id
  title: string;
  message: string;
  type: 'order' | 'reservation';
  read: boolean;
  created_at: string;
}

export interface AIRecommendation {
  intent: string;
  cuisine_preference: string;
  budget_range: string;
  occasion: string;
  reasoning: string;
  suggested_keywords: string[];
  recommended_restaurants: Partial<Restaurant>[];
}

export interface BusinessInsight {
  greeting_summary: string;
  key_insights: string[];
  busy_hours_note: string;
  suggested_actions: string[];
  data_sufficient: boolean;
}
