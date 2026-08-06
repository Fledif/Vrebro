import { useState, useEffect } from 'react';
import { api } from '../api';
import { Save, Lock } from 'lucide-react';

export default function Settings() {
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // We can fetch the current card number even without password, if we want to show it.
    // But let's only fetch when unlocked for security if preferred. Actually our GET route is public.
    const fetchCard = async () => {
      try {
        const res = await api.get('/settings/payment_card');
        setCardNumber(res.data.card_number);
      } catch (err) {
        console.error("Failed to fetch card", err);
      }
    };
    fetchCard();
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
        master_password: masterPassword
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

        <div className="mb-6">
          <label className="block text-sm text-neutral-400 mb-2">Номер банківської картки</label>
          <input 
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="0000 0000 0000 0000"
            className="w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-xl focus:outline-none focus:border-brand-orange text-lg tracking-widest font-mono"
          />
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
    </div>
  );
}
