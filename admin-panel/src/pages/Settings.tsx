import { useState, useEffect } from 'react';
import { api } from '../api';
import { Save, Lock, Clock, Gift, Store, Bell, MapPin, Phone, AlarmClock, Truck, ShoppingBag, AlertTriangle, MessageSquare, Volume2 } from 'lucide-react';

interface StoreInfo {
  store_name: string;
  store_address: string;
  store_phone: string;
  store_greeting: string;
  store_closed_message: string;
  min_order_amount: number;
  avg_cooking_time: number;
  free_delivery_from: number;
  notifications_enabled: boolean;
  emergency_pause: boolean;
  settlement_name: string;
}

const SETTLEMENTS = ['Самовивіз', 'Десна', 'Хотянівка', 'Козаровичі', 'Демидів', 'Пірнове', 'Старі Петрівці', 'Нові Петрівці', 'Вишгород', 'Горобичі', 'Лютіж', 'Мощун'];

export default function Settings() {
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [isCardEnabled, setIsCardEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isHoursEnabled, setIsHoursEnabled] = useState(false);
  const [openTime, setOpenTime] = useState('10:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [savingHours, setSavingHours] = useState(false);

  const [isCashbackEnabled, setIsCashbackEnabled] = useState(false);
  const [cashbackPercentage, setCashbackPercentage] = useState('0');
  const [cashbackMaxPay, setCashbackMaxPay] = useState('100');
  const [savingCashback, setSavingCashback] = useState(false);

  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    store_name: 'VreBRO',
    store_address: '',
    store_phone: '',
    store_greeting: '',
    store_closed_message: 'На жаль, ми зараз зачинені. Повертайтесь пізніше!',
    min_order_amount: 0,
    avg_cooking_time: 30,
    free_delivery_from: 0,
    notifications_enabled: true,
    emergency_pause: false,
    settlement_name: 'Самовивіз',
  });
  const [savingStoreInfo, setSavingStoreInfo] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await api.get('/admin/settings/payment_card');
        setCardNumber(res.data.card_number);
        setIsCardEnabled(res.data.is_enabled !== false);
      } catch (err) {
        console.error("Failed to fetch card", err);
      }
    };
    const fetchHours = async () => {
      try {
        const res = await api.get('/admin/settings/hours');
        setIsHoursEnabled(res.data.is_enabled);
        setOpenTime(res.data.open_time);
        setCloseTime(res.data.close_time);
      } catch (err) {
        console.error("Failed to fetch hours", err);
      }
    };
    const fetchCashback = async () => {
      try {
        const res = await api.get('/admin/settings/cashback');
        setIsCashbackEnabled(res.data.is_enabled);
        setCashbackPercentage(res.data.percentage.toString());
        setCashbackMaxPay(res.data.max_pay_percent.toString());
      } catch (err) {
        console.error("Failed to fetch cashback settings", err);
      }
    };
    const fetchStoreInfo = async () => {
      try {
        const res = await api.get('/admin/settings/store_info');
        setStoreInfo(res.data);
      } catch (err) {
        console.error("Failed to fetch store info", err);
      }
    };
    fetchCard();
    fetchHours();
    fetchCashback();
    fetchStoreInfo();
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPassword.trim()) {
      setIsUnlocked(true);
    }
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/settings/payment_card', {
        card_number: cardNumber,
        master_password: masterPassword,
        is_enabled: isCardEnabled,
      });
      alert('Реквізити збережено!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    try {
      await api.post('/admin/settings/hours', {
        is_enabled: isHoursEnabled,
        open_time: openTime,
        close_time: closeTime,
      });
      alert('Графік збережено!');
    } catch (err) {
      alert('Помилка при збереженні графіка');
    } finally {
      setSavingHours(false);
    }
  };

  const handleSaveCashback = async () => {
    setSavingCashback(true);
    try {
      await api.post('/admin/settings/cashback', {
        is_enabled: isCashbackEnabled,
        percentage: parseFloat(cashbackPercentage),
        max_pay_percent: parseFloat(cashbackMaxPay)
      });
      alert('Налаштування кешбеку збережено!');
    } catch (err) {
      alert('Помилка при збереженні кешбеку');
    } finally {
      setSavingCashback(false);
    }
  };

  const handleSaveStoreInfo = async () => {
    setSavingStoreInfo(true);
    try {
      await api.post('/admin/settings/store_info', storeInfo);
      alert('Налаштування закладу збережено!');
    } catch (err) {
      alert('Помилка при збереженні налаштувань закладу');
    } finally {
      setSavingStoreInfo(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-xl focus:outline-none focus:border-brand-orange text-white";
  const toggleClass = (active: boolean) => `relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${active ? 'bg-brand-orange' : 'bg-neutral-700'}`;
  const toggleKnob = (active: boolean) => `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`;

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-[var(--color-surface)] p-8 rounded-2xl border border-neutral-800 text-center">
          <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Lock size={28} className="text-brand-orange" />
          </div>
          <h2 className="text-xl font-bold mb-2">Налаштування захищено</h2>
          <p className="text-neutral-400 text-sm mb-6">Введіть майстер-пароль для доступу</p>
          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              placeholder="Майстер-пароль"
              className={inputClass}
            />
            <button type="submit" className="w-full py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">
              Увійти
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Налаштування</h1>
      </div>

      {/* === STORE INFO === */}
      <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-neutral-800 mb-6">
        <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
          <Store size={20} className="text-brand-orange" /> Загальна інформація про заклад
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Назва закладу</label>
              <input className={inputClass} value={storeInfo.store_name} onChange={e => setStoreInfo({...storeInfo, store_name: e.target.value})} placeholder="VreBRO" />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Телефон підтримки</label>
              <input className={inputClass} value={storeInfo.store_phone} onChange={e => setStoreInfo({...storeInfo, store_phone: e.target.value})} placeholder="+38 000 000 00 00" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Адреса закладу</label>
            <input className={inputClass} value={storeInfo.store_address} onChange={e => setStoreInfo({...storeInfo, store_address: e.target.value})} placeholder="вул. Центральна, 1" />
          </div>

          {/* SETTLEMENT SELECTOR */}
          <div>
            <label className="block text-sm text-neutral-400 mb-2 flex items-center gap-1.5">
              <MapPin size={14} /> Населений пункт доставки
            </label>
            <div className="flex flex-wrap gap-2">
              {SETTLEMENTS.map(s => (
                <button
                  key={s}
                  onClick={() => setStoreInfo({...storeInfo, settlement_name: s})}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    storeInfo.settlement_name === s
                      ? 'bg-brand-orange text-white border-brand-orange'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-brand-orange/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-500 mt-2">У міні-додатку адреса буде виглядати: <span className="text-brand-orange">[{storeInfo.settlement_name}] вул. Довженка...</span></p>
          </div>
        </div>
        <button onClick={handleSaveStoreInfo} disabled={savingStoreInfo} className="mt-6 flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50">
          <Save size={18} /> {savingStoreInfo ? 'Збереження...' : 'Зберегти інформацію'}
        </button>
      </div>

      {/* === ORDER SETTINGS === */}
      <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-neutral-800 mb-6">
        <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
          <ShoppingBag size={20} className="text-brand-orange" /> Параметри замовлень
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <label className="block text-sm text-neutral-400 mb-2 flex items-center gap-1">
              <ShoppingBag size={13} /> Мін. сума замовлення (грн)
            </label>
            <input type="number" className={inputClass} value={storeInfo.min_order_amount} onChange={e => setStoreInfo({...storeInfo, min_order_amount: parseFloat(e.target.value) || 0})} min="0" />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2 flex items-center gap-1">
              <AlarmClock size={13} /> Час готування (хв)
            </label>
            <input type="number" className={inputClass} value={storeInfo.avg_cooking_time} onChange={e => setStoreInfo({...storeInfo, avg_cooking_time: parseInt(e.target.value) || 30})} min="1" />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2 flex items-center gap-1">
              <Truck size={13} /> Безкоштовна доставка від (грн)
            </label>
            <input type="number" className={inputClass} value={storeInfo.free_delivery_from} onChange={e => setStoreInfo({...storeInfo, free_delivery_from: parseFloat(e.target.value) || 0})} min="0" />
            <p className="text-xs text-neutral-500 mt-1">0 = не відображати</p>
          </div>
        </div>

        <div>
          <label className="block text-sm text-neutral-400 mb-2 flex items-center gap-1">
            <MessageSquare size={13} /> Вітальне повідомлення в боті
          </label>
          <textarea className={`${inputClass} resize-none`} rows={2} value={storeInfo.store_greeting} onChange={e => setStoreInfo({...storeInfo, store_greeting: e.target.value})} placeholder="Ласкаво просимо до VreBRO! Оберіть страву..." />
        </div>
        <div className="mt-4">
          <label className="block text-sm text-neutral-400 mb-2 flex items-center gap-1">
            <MessageSquare size={13} /> Повідомлення «Ми зачинені»
          </label>
          <textarea className={`${inputClass} resize-none`} rows={2} value={storeInfo.store_closed_message} onChange={e => setStoreInfo({...storeInfo, store_closed_message: e.target.value})} placeholder="На жаль, ми зараз зачинені..." />
        </div>

        <button onClick={handleSaveStoreInfo} disabled={savingStoreInfo} className="mt-5 flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50">
          <Save size={18} /> {savingStoreInfo ? 'Збереження...' : 'Зберегти параметри'}
        </button>
      </div>

      {/* === TOGGLES === */}
      <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-neutral-800 mb-6">
        <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
          <Bell size={20} className="text-brand-orange" /> Системні перемикачі
        </h3>
        <div className="space-y-4">
          {/* Notifications */}
          <div className="flex items-center justify-between p-4 bg-neutral-900/40 rounded-xl border border-neutral-800">
            <div>
              <p className="font-semibold text-white flex items-center gap-2"><Bell size={16} className="text-brand-orange" /> Авто-сповіщення клієнтам</p>
              <p className="text-xs text-neutral-500 mt-0.5">Бот надсилає повідомлення при кожній зміні статусу</p>
            </div>
            <button onClick={() => setStoreInfo({...storeInfo, notifications_enabled: !storeInfo.notifications_enabled})} className={toggleClass(storeInfo.notifications_enabled)}>
              <span className={toggleKnob(storeInfo.notifications_enabled)} />
            </button>
          </div>

          {/* Emergency Pause */}
          <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${storeInfo.emergency_pause ? 'bg-red-500/10 border-red-500/30' : 'bg-neutral-900/40 border-neutral-800'}`}>
            <div>
              <p className="font-semibold text-white flex items-center gap-2"><AlertTriangle size={16} className="text-red-400" /> Аварійна пауза прийому замовлень</p>
              <p className="text-xs text-neutral-500 mt-0.5">Миттєво блокує всі нові замовлення в міні-додатку</p>
            </div>
            <button onClick={() => setStoreInfo({...storeInfo, emergency_pause: !storeInfo.emergency_pause})} className={toggleClass(storeInfo.emergency_pause)}>
              <span className={toggleKnob(storeInfo.emergency_pause)} />
            </button>
          </div>
        </div>

        <button onClick={handleSaveStoreInfo} disabled={savingStoreInfo} className="mt-5 flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50">
          <Save size={18} /> {savingStoreInfo ? 'Збереження...' : 'Зберегти перемикачі'}
        </button>
      </div>

      {/* === PAYMENT CARD === */}
      <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-neutral-800 mb-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          💳 Реквізити оплати
        </h3>
        <form onSubmit={handleSaveCard} className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800">
            <input type="checkbox" id="cardEnabled" checked={isCardEnabled} onChange={(e) => setIsCardEnabled(e.target.checked)} className="w-5 h-5 accent-brand-orange" />
            <label htmlFor="cardEnabled" className="font-semibold cursor-pointer">Увімкнути відображення реквізитів клієнтам</label>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Номер картки / IBAN / Рахунок</label>
            <input className={inputClass} value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" />
          </div>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50">
            <Save size={18} /> {saving ? 'Збереження...' : 'Зберегти реквізити'}
          </button>
        </form>
      </div>

      {/* === WORKING HOURS === */}
      <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-neutral-800 mb-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock size={20} className="text-brand-orange" /> Графік роботи
        </h3>
        <div className="flex items-center gap-3 mb-5 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800">
          <input type="checkbox" id="hoursEnabled" checked={isHoursEnabled} onChange={(e) => setIsHoursEnabled(e.target.checked)} className="w-5 h-5 accent-brand-orange" />
          <label htmlFor="hoursEnabled" className="font-semibold cursor-pointer">Увімкнути контроль часу роботи</label>
        </div>
        {isHoursEnabled && (
          <div className="flex gap-4 mb-5">
            <div className="flex-1">
              <label className="block text-sm text-neutral-400 mb-2">Відкриття</label>
              <input type="time" className={inputClass} value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-neutral-400 mb-2">Закриття</label>
              <input type="time" className={inputClass} value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
            </div>
          </div>
        )}
        <button onClick={handleSaveHours} disabled={savingHours} className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50">
          <Save size={18} /> {savingHours ? 'Збереження...' : 'Зберегти графік'}
        </button>
      </div>

      {/* === CASHBACK === */}
      <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-neutral-800 mb-12">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Gift size={20} className="text-brand-orange" /> Система Кешбеку (Лояльність)
        </h3>
        <p className="text-neutral-400 mb-5 text-sm">Клієнти отримують бонуси за замовлення. 1 бонус = 1 грн.</p>

        <div className="flex items-center gap-3 mb-5 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800">
          <input type="checkbox" id="isCashbackEnabled" checked={isCashbackEnabled} onChange={(e) => setIsCashbackEnabled(e.target.checked)} className="w-5 h-5 accent-brand-orange" />
          <div>
            <label htmlFor="isCashbackEnabled" className="font-bold cursor-pointer text-white block">Увімкнути систему кешбеку</label>
            <span className="text-xs text-neutral-500">Якщо вимкнено, кешбек не нараховується і не списується.</span>
          </div>
        </div>

        {isCashbackEnabled && (
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm text-neutral-400 mb-2">Відсоток кешбеку (%)</label>
              <input type="number" value={cashbackPercentage} onChange={(e) => setCashbackPercentage(e.target.value)} min="0" max="100" className={inputClass} />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-neutral-400 mb-2">Макс. оплата бонусами (%)</label>
              <input type="number" value={cashbackMaxPay} onChange={(e) => setCashbackMaxPay(e.target.value)} min="1" max="100" className={inputClass} />
            </div>
          </div>
        )}

        <button onClick={handleSaveCashback} disabled={savingCashback} className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50">
          <Save size={18} /> {savingCashback ? 'Збереження...' : 'Зберегти кешбек'}
        </button>
      </div>
    </div>
  );
}
