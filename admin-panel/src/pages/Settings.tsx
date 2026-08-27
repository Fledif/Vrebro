import { useState, useEffect } from 'react';
import { api } from '../api';
import { Save, Lock, Clock } from 'lucide-react';

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

  useEffect(() => {
    // We can fetch the current card number even without password, if we want to show it.
    // But let's only fetch when unlocked for security if preferred. Actually our GET route is public.
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
    fetchCard();
    fetchHours();
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPassword.length > 0) {
      setIsUnlocked(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/admin/settings/payment_card', {
        card_number: cardNumber,
        master_password: masterPassword,
        is_enabled: isCardEnabled
      });
      alert('Збережено успішно!');
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert('Неправильний майстер-пароль!');
        setIsUnlocked(false);
        setMasterPassword('');
      } else {
        alert('Помилка при збереженні');
      }
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
        close_time: closeTime
      });
      alert('Графік роботи збережено!');
    } catch (err) {
      alert('Помилка при збереженні графіка');
    } finally {
      setSavingHours(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-[var(--color-surface)] p-8 rounded-2xl border border-neutral-800 text-center">
          <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-orange">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Налаштування</h2>
          <p className="text-neutral-400 mb-6">Введіть майстер-пароль для доступу</p>
          
          <form onSubmit={handleUnlock}>
            <input 
              type="password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              placeholder="Майстер-пароль"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-xl mb-4 focus:outline-none focus:border-brand-orange"
            />
            <button 
              type="submit"
              className="w-full py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
            >
              Увійти
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Налаштування Оплати</h1>
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-neutral-800">
        <h3 className="text-lg font-bold mb-4">Реквізити для оплати</h3>
        <p className="text-neutral-400 mb-6 text-sm">
          Цей номер картки буде відображатися клієнтам у їхньому боті (міні-аппі), коли статус замовлення перейде в роботу.
        </p>

        <div className="mb-4">
          <label className="block text-sm text-neutral-400 mb-2">Номер банківської картки</label>
          <input 
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="0000 0000 0000 0000"
            className="w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-xl focus:outline-none focus:border-brand-orange text-lg tracking-widest font-mono"
          />
        </div>

        <div className="flex items-center gap-3 mb-8 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
          <input 
            type="checkbox" 
            id="isCardEnabled"
            checked={isCardEnabled}
            onChange={(e) => setIsCardEnabled(e.target.checked)}
            className="w-5 h-5 rounded border-neutral-700 bg-neutral-800 accent-brand-orange"
          />
          <div className="flex-1">
            <label htmlFor="isCardEnabled" className="font-bold cursor-pointer text-white block">Відображати картку клієнтам</label>
            <span className="text-xs text-neutral-500">Якщо вимкнено, картка не буде показуватись клієнтам в деталях замовлення.</span>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? "Збереження..." : "Зберегти"}
        </button>
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-neutral-800 mt-6 mb-12">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock size={20} className="text-brand-orange" /> Графік роботи
        </h3>
        <p className="text-neutral-400 mb-6 text-sm">
          Налаштуйте час роботи закладу. Якщо ввімкнути обмеження, клієнти не зможуть зробити замовлення в неробочий час.
        </p>

        <div className="flex items-center gap-3 mb-6 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
          <input 
            type="checkbox" 
            id="isHoursEnabled"
            checked={isHoursEnabled}
            onChange={(e) => setIsHoursEnabled(e.target.checked)}
            className="w-5 h-5 rounded border-neutral-700 bg-neutral-800 accent-brand-orange"
          />
          <div className="flex-1">
            <label htmlFor="isHoursEnabled" className="font-bold cursor-pointer text-white block">Обмежити прийом замовлень за часом</label>
            <span className="text-xs text-neutral-500">Якщо ввімкнено, міні-додаток блокуватиме замовлення поза робочим часом.</span>
          </div>
        </div>

        {isHoursEnabled && (
          <div className="flex gap-4 mb-8">
            <div className="flex-1">
              <label className="block text-sm text-neutral-400 mb-2">Відкриття</label>
              <input 
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-xl focus:outline-none focus:border-brand-orange text-lg text-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-neutral-400 mb-2">Закриття</label>
              <input 
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-xl focus:outline-none focus:border-brand-orange text-lg text-white"
              />
            </div>
          </div>
        )}

        <button 
          onClick={handleSaveHours}
          disabled={savingHours}
          className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {savingHours ? "Збереження..." : "Зберегти графік"}
        </button>
      </div>
    </div>
  );
}
