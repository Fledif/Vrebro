import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { createOrder, fetchCashbackSettings, fetchUserProfile, fetchStoreInfo } from '../api';
import type { OrderCreate, CashbackSettings } from '../api';
import { getUserId } from '../utils/user';

export default function Checkout() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '+380',
    address: '',
    comment: ''
  });
  
  useEffect(() => {
    const savedName = localStorage.getItem('vrebro_name') || '';
    const savedPhone = localStorage.getItem('vrebro_phone') || '+380';
    setFormData(prev => ({
      ...prev,
      name: savedName,
      phone: savedPhone
    }));
  }, []);
  
  const [cashbackSettings, setCashbackSettings] = useState<CashbackSettings | null>(null);
  const [userBalance, setUserBalance] = useState(0);
  const [useCashback, setUseCashback] = useState(false);
  const [settlementName, setSettlementName] = useState('Самовивіз');

  useEffect(() => {
    const loadCashback = async () => {
      try {
        const settings = await fetchCashbackSettings();
        setCashbackSettings(settings);
        if (settings.is_enabled) {
          const profile = await fetchUserProfile(getUserId());
          setUserBalance(profile.cashback_balance);
        }
      } catch (err) {
        console.error("Failed to load cashback data", err);
      }
    };
    loadCashback();
  }, []);

  useEffect(() => {
    const loadStoreInfo = async () => {
      try {
        const data = await fetchStoreInfo();
        setSettlementName(data.settlement_name || 'Самовивіз');
      } catch (err) {
        console.error('Failed to load store info', err);
      }
    };
    loadStoreInfo();
  }, []);
  
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

  const handleLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const street = data.address.road || data.address.pedestrian || "";
            const house = data.address.house_number || "";
            const addr = `${street} ${house}`.trim();
            if (addr) {
              setFormData(prev => ({ ...prev, address: addr }));
              toast.success("Адресу успішно знайдено!");
            } else {
              toast.error("Не вдалося визначити точну вулицю");
            }
          }
        } catch (e) {
          toast.error("Помилка доступу до сервісу карт");
        } finally {
          setLoading(false);
        }
      }, () => {
        setLoading(false);
        toast.error("Доступ до геолокації заборонено в налаштуваннях вашого пристрою");
      }, { enableHighAccuracy: true });
    } else {
      toast.error("Ваш пристрій не підтримує геолокацію");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.name.trim().length < 2) {
      setError("Введіть коректне ім'я");
      return;
    }
    
    // Strict phone validation: only digits, length must be 10 (e.g. 050...) or 12 (38050...)
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10 && cleanPhone.length !== 12) {
      setError("Введіть коректний номер телефону (наприклад: 0501234567)");
      return;
    }
    
    // Strict address validation
    if (settlementName !== 'Самовивіз' && formData.address.trim().length < 4) {
      setError("Введіть коректну адресу (вулиця, будинок)");
      return;
    }

    try {
      setLoading(true);
      
      const userId = getUserId();
      const orderPayload: OrderCreate = {
        user_id: userId,
        customer_name: formData.name,
        phone: formData.phone,
        address: settlementName === 'Самовивіз'
          ? 'Самовивіз (На винос)'
          : `[${settlementName}] ${formData.address}`,
        comment: formData.comment || "",
        use_cashback_amount: useCashback ? Math.min(userBalance, getTotalPrice() * ((cashbackSettings?.max_pay_percent || 100) / 100)) : 0,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      };

      await createOrder(orderPayload);
      
      // Save data for next time
      localStorage.setItem('vrebro_name', formData.name);
      localStorage.setItem('vrebro_phone', formData.phone);
      
      setSuccess(true);
      clearCart();
      toast.success("Замовлення оформлено", { duration: 4000 });
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
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
        <p className="text-gray-500 mb-6 text-sm">Переміщено до профілю, там можна переглянути статус.</p>
        <button onClick={() => navigate('/my-orders')} className="btn-primary w-full mb-3">ДО ПРОФІЛЮ</button>
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
          {settlementName === 'Самовивіз' ? (
            <div className="w-full bg-brand-charcoal border border-brand-orange/15 rounded-xl px-4 py-3 text-brand-orange font-bold flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              На винос (Самовивіз)
            </div>
          ) : (
            <div>
              <div className="flex gap-2 items-center">
                <div className="flex-shrink-0 px-3 py-3 bg-brand-orange/10 border border-brand-orange/30 rounded-xl">
                  <span className="text-brand-orange font-bold text-sm">{settlementName}</span>
                </div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="вул. Центральна, 1..."
                  className={`${inputClass} flex-1`}
                />
              </div>
              <div className="flex justify-between items-center mt-1.5 ml-1">
                <p className="text-xs text-neutral-600">Введіть вулицю та номер будинку</p>
                <button 
                  type="button" 
                  onClick={handleLocation}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs font-bold text-brand-orange hover:text-orange-400 active:scale-95 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {loading ? 'Шукаю...' : 'Визначити адресу'}
                </button>
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Коментар</label>
          <textarea name="comment" value={formData.comment} onChange={handleChange} placeholder="Деталі..." rows={3} className={`${inputClass} resize-none`} />
        </div>

        {error && (
          <div className="bg-red-500/5 border border-red-500/15 text-red-400 px-4 py-3 rounded-xl text-xs font-bold">{error}</div>
        )}

        <div className="pt-4 border-t border-white/10 mt-6">
          {cashbackSettings?.is_enabled && userBalance > 0 && (
            <div className="mb-4 bg-brand-charcoal border border-brand-orange/20 rounded-xl p-4 flex items-start gap-3">
              <input 
                type="checkbox" 
                checked={useCashback} 
                onChange={(e) => setUseCashback(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-white/20 bg-black accent-brand-orange"
              />
              <div>
                <p className="font-bold text-sm text-white">Списати бонуси</p>
                <p className="text-xs text-brand-orange mt-0.5">
                  Доступно: {userBalance.toFixed(2)} грн 
                  (Можна списати до {cashbackSettings.max_pay_percent}% від суми)
                </p>
              </div>
            </div>
          )}

          {cashbackSettings?.is_enabled && (
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400 font-semibold text-xs">Ви отримаєте кешбек:</span>
              <span className="text-brand-orange font-bold text-xs">
                +{((getTotalPrice() - (useCashback ? Math.min(userBalance, getTotalPrice() * (cashbackSettings.max_pay_percent / 100)) : 0)) * (cashbackSettings.percentage / 100)).toFixed(2)} бонусів
              </span>
            </div>
          )}

          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-500 font-semibold text-sm">До сплати:</span>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-black text-white">
                {(getTotalPrice() - (useCashback && cashbackSettings ? Math.min(userBalance, getTotalPrice() * (cashbackSettings.max_pay_percent / 100)) : 0)).toLocaleString('uk-UA')}
              </span>
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
