import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { useCartStore } from '../store/cartStore';
import { createOrder, type OrderCreate } from '../api';

export default function Checkout() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    comment: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (items.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (formData.name.trim().length < 2) {
      setError("Введіть коректне ім'я");
      return;
    }
    if (formData.phone.trim().length < 10) {
      setError("Введіть коректний номер телефону");
      return;
    }

    try {
      setLoading(true);
      
      const orderPayload: OrderCreate = {
        user_id: WebApp.initDataUnsafe?.user?.id || 1,
        customer_name: formData.name,
        phone: formData.phone,
        address: "Самовивіз (На винос)",
        comment: formData.comment || "",
        total_price: getTotalPrice(),
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      };

      await createOrder(orderPayload);
      
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError("Не вдалося завантажити дані. Сервер не відповідає. Спробуйте ще раз.");
      } else {
        const detail = err.response?.data?.detail;
        const msg = Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ') : (detail || err.message);
        setError(`Помилка: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4 pb-24 text-white text-center">
        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-black mb-2">Замовлення прийнято!</h2>
        <p className="text-gray-400 mb-8">Ми зв'яжемося з вами найближчим часом для підтвердження деталей.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-gray-800 rounded-xl font-bold text-white w-full"
        >
          НА ГОЛОВНУ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 pt-6 pb-8 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-900 rounded-full">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-black">Оформлення</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-1 ml-1">Ім'я</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ваше ім'я"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-orange transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 mb-1 ml-1">Телефон</label>
          <input 
            type="tel" 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+38 (000) 000-00-00"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-orange transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 mb-1 ml-1">Спосіб доставки</label>
          <div className="w-full bg-gray-900 border border-brand-orange/30 rounded-xl px-4 py-3 text-brand-orange font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Тільки на винос (Самовивіз)
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 mb-1 ml-1">Коментар (необов'язково)</label>
          <textarea 
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Деталі до замовлення..."
            rows={3}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-orange transition-colors resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        <div className="pt-6">
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-400 font-bold">До сплати:</span>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-black text-white">{getTotalPrice().toLocaleString('uk-UA')}</span>
              <span className="text-brand-orange font-bold mb-1">грн</span>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-lg text-white shadow-lg transition-all ${
              loading 
                ? 'bg-gray-700 text-gray-400' 
                : 'bg-gradient-to-r from-brand-orange to-red-500 shadow-brand-orange/20 active:scale-[0.98]'
            }`}
          >
            {loading ? 'ВІДПРАВКА...' : 'ПІДТВЕРДИТИ'}
          </button>
        </div>
      </form>
    </div>
  );
}
