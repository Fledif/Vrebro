import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function Cart() {
  const { items, increaseQuantity, decreaseQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 pb-24 text-white">
        <div className="w-16 h-16 rounded-full bg-brand-charcoal flex items-center justify-center mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Кошик порожній</h2>
        <p className="text-gray-500 mb-6 text-sm text-center">Додайте щось смачненьке з нашого меню!</p>
        <Link to="/catalog" className="btn-primary text-sm">В КАТАЛОГ</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-4 pt-5 pb-44">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-black">Кошик</h1>
        <button onClick={clearCart} className="text-xs text-red-500/70 font-bold px-3 py-1.5 bg-red-500/5 rounded-lg border border-red-500/10 active:bg-red-500/10">
          Очистити
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex glass-card rounded-xl p-3 gap-3">
            <div className="w-18 h-18 bg-brand-charcoal rounded-lg overflow-hidden flex-shrink-0">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600">Фото</div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col justify-between py-0.5">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-sm leading-tight line-clamp-2">{product.name}</h3>
                <button onClick={() => removeItem(product.id)} className="text-gray-600 active:text-red-500 p-0.5 text-xs">✕</button>
              </div>
              
              <div className="flex justify-between items-center mt-1.5">
                <span className="font-black text-brand-orange text-sm">
                  {(product.price * quantity).toLocaleString('uk-UA')} грн
                </span>
                
                <div className="flex items-center gap-2 bg-brand-charcoal px-2 py-1 rounded-lg border border-white/6">
                  <button 
                    onClick={() => decreaseQuantity(product.id)}
                    className="w-6 h-6 flex justify-center items-center text-gray-400 font-bold active:text-white"
                  >−</button>
                  <span className="font-bold min-w-[1rem] px-1 text-center text-sm whitespace-nowrap">
                    {product.is_weighted ? (quantity >= 1 ? `${quantity} кг` : `${quantity * 1000} г`) : quantity}
                  </span>
                  <button 
                    onClick={() => increaseQuantity(product.id)}
                    className="w-6 h-6 flex justify-center items-center text-brand-orange font-bold"
                  >+</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-16 left-0 w-full bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent pt-10 pb-4 px-4 z-40">
        <div className="flex justify-between items-end mb-3">
          <span className="text-gray-500 font-semibold text-sm">Разом:</span>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-black text-brand-orange text-glow-orange">{getTotalPrice().toLocaleString('uk-UA')}</span>
            <span className="text-gray-400 font-bold text-sm mb-0.5">грн</span>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/checkout')}
          className="w-full py-4 btn-primary text-base"
        >
          ОФОРМИТИ ЗАМОВЛЕННЯ
        </button>
      </div>
    </div>
  );
}
