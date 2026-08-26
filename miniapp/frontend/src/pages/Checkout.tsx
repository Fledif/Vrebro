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
        setError("Сервер не відповідає. Спробуйте ще раз.");
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
      <div className="min-h-screen flex flex-col justify-center items-center px-4 pb-24 text-white text-center">
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-5 border border-green-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-black mb-2">Замовлення прийнято!</h2>
        <p className="text-gray-500 mb-6 text-sm">Ми зв'яжемося з вами найближчим часом.</p>
        <button onClick={() => navigate('/')} className="btn-secondary w-full">НА ГОЛОВНУ</button>
      </div>
    );
  }

  const inputClass = "w-full bg-brand-charcoal border border-white/6 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-orange/40 transition-colors text-sm";

  return (
    <div className="min-h-screen text-white px-4 pt-5 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-brand-charcoal flex items-center justify-center border border-white/6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-black">Оформлення</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Ім'я</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ваше ім'я" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Телефон</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+38 (000) 000-00-00" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Спосіб отримання</label>
          <div className="w-full bg-brand-charcoal border border-brand-orange/15 rounded-xl px-4 py-3 text-brand-orange font-bold flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            На винос (Самовивіз)
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Коментар</label>
          <textarea name="comment" value={formData.comment} onChange={handleChange} placeholder="Деталі..." rows={3} className={`${inputClass} resize-none`} />
        </div>

        {error && (
          <div className="bg-red-500/5 border border-red-500/15 text-red-400 px-4 py-3 rounded-xl text-xs font-bold">{error}</div>
        )}

        <div className="pt-4">
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-500 font-semibold text-sm">До сплати:</span>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-black text-white">{getTotalPrice().toLocaleString('uk-UA')}</span>
              <span className="text-brand-orange font-bold text-sm mb-0.5">грн</span>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-base transition-all ${
              loading ? 'bg-brand-charcoal text-gray-500' : 'btn-primary'
            }`}
          >
            {loading ? 'ВІДПРАВКА...' : 'ПІДТВЕРДИТИ'}
          </button>
        </div>
      </form>
    </div>
  );
}
