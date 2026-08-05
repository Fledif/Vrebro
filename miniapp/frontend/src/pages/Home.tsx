import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, type Product } from '../api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const prods = await fetchProducts();
      // Just take top 4 by id for "Popular"
      const top = prods.slice(0, 4);
      setPopularProducts(top);
    } catch (err) {
      console.error("Failed to fetch popular products", err);
      setError("Не вдалося завантажити дані");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="p-4 bg-black min-h-screen">
      <div className="text-center mb-8 mt-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-orange to-red-500 text-transparent bg-clip-text">
          В Ребро
        </h1>
        <p className="text-gray-400 mt-2">Свіжі продукти. Швидке замовлення. Якісний сервіс.</p>
        
        <Link 
          to="/catalog" 
          className="mt-6 inline-block w-full py-4 bg-gradient-to-r from-brand-orange to-red-500 rounded-xl font-black text-lg text-white shadow-lg shadow-brand-orange/20 active:scale-[0.98] transition-transform"
        >
          ПЕРЕЙТИ В КАТАЛОГ
        </Link>
      </div>
      
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
          🔥 Популярне
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-orange"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-6 bg-gray-900 rounded-2xl border border-gray-800 p-4">
            <span className="text-gray-400 mb-4">{error}</span>
            <button 
              onClick={loadData}
              className="px-6 py-2 bg-gray-800 text-brand-orange rounded-full font-bold border border-gray-700 active:scale-95 transition-transform"
            >
              Спробувати ще раз
            </button>
          </div>
        ) : popularProducts.length === 0 ? (
          <div className="flex justify-center items-center py-6 text-gray-500">
            Товарів не знайдено
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {popularProducts.map(product => (
              <div key={product.id} className="min-w-[160px] snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
