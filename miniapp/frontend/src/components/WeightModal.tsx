import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';

export default function WeightModal() {
  const { weightModalProduct, closeWeightModal, addItemWithQuantity, items } = useCartStore();
  const [grams, setGrams] = useState<string>('');

  useEffect(() => {
    if (weightModalProduct) {
      // Find if item already exists in cart to pre-fill its current weight
      const existingItem = items.find(i => i.product.id === weightModalProduct.id);
      if (existingItem) {
        setGrams((existingItem.quantity * 1000).toString());
      } else {
        setGrams(weightModalProduct.weight_step ? weightModalProduct.weight_step.toString() : '500');
      }
    }
  }, [weightModalProduct, items]);

  if (!weightModalProduct) return null;

  const handleSave = () => {
    const parsedGrams = parseInt(grams);
    if (isNaN(parsedGrams) || parsedGrams <= 0) {
      alert("Будь ласка, введіть коректну вагу");
      return;
    }
    
    // Convert grams to multiplier (e.g. 450g = 0.45kg)
    const quantity = parsedGrams / 1000;
    addItemWithQuantity(weightModalProduct, quantity);
    toast.success(`${weightModalProduct.name} додано до кошика`);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    closeWeightModal();
  };

  const handleClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeWeightModal();
    }
  };

  // Calculate dynamic price based on input
  const parsedGrams = parseInt(grams) || 0;
  const currentPrice = weightModalProduct.is_promo && weightModalProduct.promo_price 
    ? weightModalProduct.promo_price 
    : weightModalProduct.price;
    
  const totalPrice = (parsedGrams / 1000) * currentPrice;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4 pb-0"
      onClick={handleClose}
    >
      <div 
        className="w-full sm:max-w-sm bg-[var(--color-surface)] border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">{weightModalProduct.name}</h3>
            <p className="text-sm text-neutral-400">Вкажіть потрібну вагу</p>
          </div>
          <button 
            onClick={closeWeightModal}
            className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden focus-within:border-brand-orange transition-colors">
            <input 
              type="number"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              className="w-full bg-transparent text-white text-2xl font-bold py-4 pl-8 pr-2 outline-none text-right"
              placeholder="0"
              autoFocus
            />
            <div className="pr-8 py-4 text-neutral-400 font-bold text-xl flex items-center justify-start min-w-[40px]">
              г
            </div>
          </div>
          {weightModalProduct.weight_step && (
            <div className="flex gap-2 mt-3 justify-center flex-wrap">
              {[100, 250, 500, 1000].map(w => (
                <button 
                  key={w}
                  onClick={() => setGrams(w.toString())}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                >
                  {w >= 1000 ? `${w/1000} кг` : `${w} г`}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6 bg-neutral-900/50 p-4 rounded-xl">
          <span className="text-neutral-400 font-medium">Вартість:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-brand-orange">
              {totalPrice > 0 ? totalPrice.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0"}
            </span>
            <span className="text-sm text-neutral-500">грн</span>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-4 bg-gradient-to-r from-brand-orange to-brand-red text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-transform"
        >
          Додати в кошик
        </button>
      </div>
    </div>
  );
}
