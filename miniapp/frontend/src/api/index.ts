import axios from 'axios';

// Since we have Vite proxy configured, we can just use /api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (config.method?.toLowerCase() === 'get') {
    config.params = { ...config.params, _t: new Date().getTime() };
  }
  return config;
});

export interface Category {
  id: number;
  name: string;
  icon?: string;
  sort_order: number;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active: boolean;
  is_promo?: boolean;
  promo_price?: number;
  is_weighted?: boolean;
  weight_step?: number;
  stock_quantity?: number | null;
  is_out_of_stock?: boolean;
  cross_sell_ids?: string;
}

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
}

export interface OrderCreate {
  user_id: number;
  customer_name: string;
  phone: string;
  address: string;
  comment?: string;
  use_cashback_amount?: number;
  items: OrderItemCreate[];
}

export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get('/catalog/categories');
  return data;
};

export const fetchProducts = async (categoryId?: number): Promise<Product[]> => {
  const params = categoryId ? { category_id: categoryId } : {};
  const { data } = await api.get('/catalog/products', { params });
  return data;
};

export const fetchProduct = async (id: number): Promise<Product> => {
  const { data } = await api.get(`/catalog/products/${id}`);
  return data;
};

export const createOrder = async (order: OrderCreate): Promise<any> => {
  const { data } = await api.post('/orders', order);
  return data;
};

export const fetchUserOrders = async (userId: number): Promise<any[]> => {
  const { data } = await api.get(`/orders/user/${userId}`);
  return data;
};

export const fetchUserProfile = async (userId: number): Promise<{ cashback_balance: number }> => {
  const { data } = await api.get(`/orders/user_profile/${userId}`);
  return data;
};

export const fetchPaymentCard = async (): Promise<{ card_number: string, is_enabled: boolean }> => {
  const { data } = await api.get('/admin/settings/payment_card');
  return data;
};

export interface StoreStatus {
  is_open: boolean;
  open_time: string;
  close_time: string;
  is_enabled: boolean;
}

export const fetchStoreStatus = async (): Promise<StoreStatus> => {
  const { data } = await api.get('/catalog/store_status');
  return data;
};

export interface CashbackSettings {
  is_enabled: boolean;
  percentage: number;
  max_pay_percent: number;
}

export const fetchCashbackSettings = async (): Promise<CashbackSettings> => {
  const { data } = await api.get('/catalog/cashback_settings');
  return data;
};

export interface StoreInfo {
  store_name: string;
  store_address: string;
  store_phone: string;
  store_greeting: string;
  store_closed_message: string;
  min_order_amount: number;
  avg_cooking_time: number;
  free_delivery_from: number;
  emergency_pause: boolean;
  settlement_name: string;
}

export const fetchStoreInfo = async (): Promise<StoreInfo> => {
  const { data } = await api.get('/catalog/store_info');
  return data;
};

export default api;
