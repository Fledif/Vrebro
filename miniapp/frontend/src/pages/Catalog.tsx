import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import { fetchCategories, fetchProducts, type Category, type Product } from '../api';

export default function Catalog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [cats, prods] = await Promise.all([
        fetchCategories(),
        fetchProducts()
      ]);
      setCategories(cats.sort((a, b) => a.sort_order - b.sort_order));
      setProducts(prods);
      setActiveCategory(null);
    } catch (err) {
      setError('Не вдалося завантажити дані');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCategoryClick = async (categoryId: number | null) => {
    setActiveCategory(categoryId);
    try {
      setLoading(true);
      setError(null);
      const prods = await fetchProducts(categoryId || undefined);
      setProducts(prods);
    } catch (err) {
      setError('Не вдалося завантажити дані');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 min-h-screen">
      <div className="mb-5">
        <h1 className="text-2xl font-black text-white">Меню</h1>
        <p className="text-gray-500 text-sm mt-0.5">Оберіть найсмачніше</p>
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-5 pb-1 -mx-4 px-4">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all border ${
            activeCategory === null
              ? 'bg-gradient-to-r from-brand-orange to-brand-red text-white border-transparent shadow-[0_2px_12px_rgba(255,81,0,0.3)]'
              : 'bg-brand-charcoal text-gray-400 border-white/6 active:bg-white/10'
          }`}
        >
          Усі
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all flex items-center gap-1.5 border ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-brand-orange to-brand-red text-white border-transparent shadow-[0_2px_12px_rgba(255,81,0,0.3)]'
                : 'bg-brand-charcoal text-gray-400 border-white/6 active:bg-white/10'
            }`}
          >
            {cat.icon && <span>{cat.icon}</span>}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-12 glass-card rounded-2xl p-6">
          <span className="text-gray-400 mb-4">{error}</span>
          <button 
            onClick={activeCategory === null ? loadData : () => handleCategoryClick(activeCategory)}
            className="btn-secondary text-sm"
          >
            Спробувати ще раз
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {products.length === 0 && (
            <div className="col-span-2 text-center text-gray-500 py-12">
              Товарів не знайдено
            </div>
          )}
        </div>
      )}
    </div>
  );
}
