import { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Trash2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  icon: string | null;
  sort_order: number;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  
  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/categories', { name, sort_order: 0 });
      setName('');
      fetchCategories();
    } catch (err) {
      alert('Помилка створення');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити категорію?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert('Помилка видалення (можливо в ній є товари)');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-8">Категорії</h1>
      
      <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-neutral-800 mb-8 max-w-xl">
        <h2 className="text-lg font-bold mb-4">Додати категорію</h2>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Назва категорії..." 
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-white" 
            required 
          />
          <button type="submit" className="bg-[var(--color-primary)] hover:bg-orange-600 px-6 py-2 rounded-xl font-medium cursor-pointer flex items-center gap-2">
            <Plus size={18} /> Додати
          </button>
        </form>
      </div>

      <div className="bg-[var(--color-surface)] border border-neutral-800 rounded-2xl overflow-hidden max-w-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-800/50 border-b border-neutral-800 text-neutral-400 text-sm">
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Назва</th>
              <th className="p-4 font-medium text-right">Дії</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20">
                <td className="p-4 text-neutral-400">{c.id}</td>
                <td className="p-4 font-medium">{c.name}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={3} className="p-8 text-center text-neutral-500">Немає категорій</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
