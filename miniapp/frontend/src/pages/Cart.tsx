import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function Cart() {
  const { items, increaseQuantity, decreaseQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4 pb-24 text-white">
        <h2 className="text-2xl font-bold mb-4">Кошик порожній</h2>
        <p className="text-gray-400 mb-8 text-center">Додайте щось смачненьке з нашого меню!</p>
        <Link 
          to="/catalog"
          className="px-8 py-3 bg-gradient-to-r from-brand-orange to-red-500 rounded-xl font-bold text-lg"
        >
          В КАТАЛОГ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 pt-6 pb-32">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black">Кошик</h1>
        <button onClick={clearCart} className="text-sm text-red-500 font-bold px-3 py-1 bg-red-500/10 rounded-lg">
          Очистити
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex bg-gray-900 rounded-2xl p-3 border border-gray-800 gap-3">
            <div className="w-20 h-20 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">Фото</div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col justify-between py-1">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-sm leading-tight line-clamp-2">{product.name}</h3>
                <button onClick={() => removeItem(product.id)} className="text-gray-500 hover:text-red-500 p-1">
                  ✕
                </button>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="font-black text-brand-orange">
                  {(product.price * quantity).toLocaleString('uk-UA')} грн
                </span>
                
                <div className="flex items-center gap-3 bg-black px-2 py-1 rounded-lg border border-gray-800">
                  <button 
                    onClick={() => decreaseQuantity(product.id)}
                    className="w-6 h-6 flex justify-center items-center text-gray-400 font-bold active:text-white"
                  >
                    -
                  </button>
                  <span className="font-bold w-4 text-center">{quantity}</span>
                  <button 
                    onClick={() => increaseQuantity(product.id)}
                    className="w-6 h-6 flex justify-center items-center text-brand-orange font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-16 left-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-4 px-4 z-40">
        <div className="flex justify-between items-end mb-4">
          <span className="text-gray-400 font-bold">Разом:</span>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-white">{getTotalPrice().toLocaleString('uk-UA')}</span>
            <span className="text-brand-orange font-bold mb-1">грн</span>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/checkout')}
          className="w-full py-4 bg-gradient-to-r from-brand-orange to-red-500 rounded-xl font-black text-lg text-white shadow-lg shadow-brand-orange/20 active:scale-[0.98] transition-transform"
        >
          ОФОРМИТИ ЗАМОВЛЕННЯ
        </button>
      </div>
    </div>
  );
}
