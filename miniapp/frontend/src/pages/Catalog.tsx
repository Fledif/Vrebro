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
    <div className="pb-24 pt-4 px-4 min-h-screen bg-black">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-black text-white leading-none">Меню</h1>
          <p className="text-gray-400 text-sm mt-1">Оберіть найсмачніше</p>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-6 pb-2 -mx-4 px-4">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
            activeCategory === null
              ? 'bg-brand-orange text-white'
              : 'bg-gray-800 text-gray-300 border border-gray-700'
          }`}
        >
          Усі
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all flex items-center gap-2 ${
              activeCategory === cat.id
                ? 'bg-brand-orange text-white'
                : 'bg-gray-800 text-gray-300 border border-gray-700'
            }`}
          >
            {cat.icon && <span>{cat.icon}</span>}
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-12 bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <span className="text-gray-400 mb-6">{error}</span>
          <button 
            onClick={activeCategory === null ? loadData : () => handleCategoryClick(activeCategory)}
            className="px-8 py-3 bg-gray-800 text-brand-orange rounded-full font-bold border border-gray-700 active:scale-95 transition-transform text-lg"
          >
            Спробувати ще раз
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {products.length === 0 && (
            <div className="col-span-2 text-center text-gray-500 py-8">
              Товарів не знайдено
            </div>
          )}
        </div>
      )}
    </div>
  );
}
