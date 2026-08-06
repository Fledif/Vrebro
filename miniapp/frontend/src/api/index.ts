import axios from 'axios';

// Since we have Vite proxy configured, we can just use /api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
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
  const { data } = await api.post('/orders/', order);
  return data;
};

export const fetchUserOrders = async (userId: number): Promise<any[]> => {
  const { data } = await api.get(`/orders/user/${userId}`);
  return data;
};

export const fetchPaymentCard = async (): Promise<string> => {
  const { data } = await api.get('/settings/payment_card');
  return data.card_number;
};

export default api;
