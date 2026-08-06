import axios from 'axios';

export interface OrderItem {
  id: number;
  product: { name: string; image_url: string };
  quantity: number;
  price_at_purchase: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  comment: string;
  status: string;
  total_price: number;
  delivery_cost: number;
  created_at: string;
  items: OrderItem[];
}

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://vrebro.onrender.com/api');

export const api = axios.create({
  baseURL: API_URL,
});

export const updateProduct = (id: number, data: any) => api.put(`/products/${id}`, data).then(res => res.data);
export const deleteProduct = (id: number) => api.delete(`/products/${id}`).then(res => res.data);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      // Redirect to login only if not already on login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
