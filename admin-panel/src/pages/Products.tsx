import { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Edit2, Trash, X, Tag } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  category_id: number;
  description: string;
  price: number;
  image_url: string;
  is_active: boolean;
  is_promo: boolean;
  promo_price: number | null;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей товар?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Помилка видалення товару");
    }
  };
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isSuggestingCat, setIsSuggestingCat] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    image_url: '',
    is_active: true,
    is_promo: false,
    promo_price: ''
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (prod?: Product) => {
    if (prod) {
      setEditingId(prod.id);
      setFormData({
        name: prod.name,
        category_id: prod.category_id.toString(),
        description: prod.description || '',
        price: prod.price.toString(),
        image_url: prod.image_url || '',
        is_active: prod.is_active,
        is_promo: prod.is_promo,
        promo_price: prod.promo_price ? prod.promo_price.toString() : ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', category_id: categories[0]?.id.toString() || '', description: '', 
        price: '', image_url: '', is_active: true, is_promo: false, promo_price: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey) {
      alert("Ключ ImgBB не знайдено. Використовуємо картинку-заглушку для розробки.");
      setFormData(prev => ({...prev, image_url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzg4OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="}));
      return;
    }

    setIsUploading(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: data
      });
      const json = await res.json();
      if (json.success) {
        setFormData(prev => ({...prev, image_url: json.data.url}));
      } else {
        alert("Помилка ImgBB: " + json.error?.message);
      }
    } catch (err) {
      console.error(err);
      alert("Не вдалося завантажити фото");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) return alert("Спочатку введіть назву товару!");
    setIsGeneratingDesc(true);
    try {
      const res = await api.post('/admin/ai/generate-description', { name: formData.name });
      setFormData(prev => ({...prev, description: res.data.description}));
    } catch (err) {
      alert("Помилка генерації");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleSuggestCategory = async () => {
    if (!formData.name) return alert("Спочатку введіть назву товару!");
    setIsSuggestingCat(true);
    try {
      const res = await api.post('/admin/ai/suggest-category', { 
        name: formData.name,
        categories: categories.map(c => c.name)
      });
      const suggestedName = res.data.category;
      const cat = categories.find(c => c.name.toLowerCase().includes(suggestedName.toLowerCase()) || suggestedName.toLowerCase().includes(c.name.toLowerCase()));
      if (cat) {
        setFormData(prev => ({...prev, category_id: cat.id.toString()}));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggestingCat(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      category_id: parseInt(formData.category_id),
      description: formData.description,
      price: parseFloat(formData.price),
      image_url: formData.image_url,
      is_active: formData.is_active,
      is_promo: formData.is_promo,
      promo_price: formData.promo_price ? parseFloat(formData.promo_price) : null
    };

    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Помилка збереження');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Товари</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <Plus size={20} />
          Додати товар
        </button>
      </div>

      <div className="bg-[var(--color-surface)] border border-neutral-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-800/50 border-b border-neutral-800 text-neutral-400 text-sm">
              <th className="p-4 font-medium">Фото</th>
              <th className="p-4 font-medium">Назва</th>
              <th className="p-4 font-medium">Ціна</th>
              <th className="p-4 font-medium">Статус</th>
              <th className="p-4 font-medium text-right">Дії</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                <td className="p-4">
                  <img src={p.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-neutral-800" />
                </td>
                <td className="p-4 font-medium">
                  {p.name}
                  {p.is_promo && <span className="ml-2 inline-flex items-center gap-1 text-[10px] uppercase bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full"><Tag size={10}/> Акція</span>}
                </td>
                <td className="p-4">
                  {p.is_promo ? (
                    <div>
                      <span className="line-through text-neutral-500 text-sm mr-2">{p.price}</span>
                      <span className="text-orange-400 font-bold">{p.promo_price}</span>
                    </div>
                  ) : (
                    <span>{p.price}</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {p.is_active ? 'В наявності' : 'Немає'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(p)} className="p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-lg cursor-pointer">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-neutral-400 hover:text-red-500 bg-neutral-800 rounded-lg cursor-pointer">
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-surface)] border border-neutral-800 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingId ? 'Редагувати товар' : 'Новий товар'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white cursor-pointer"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-neutral-400 mb-1">Назва</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-white" required />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm text-neutral-400">Категорія</label>
                    <button type="button" onClick={handleSuggestCategory} disabled={isSuggestingCat} className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer">
                      ✨ {isSuggestingCat ? 'Підбираю...' : 'Авто-підбір'}
                    </button>
                  </div>
                  <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-white" required>
                    <option value="">Виберіть...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Фото товару</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 cursor-pointer"
                      />
                      {isUploading && <span className="text-xs text-orange-400">Завантаження...</span>}
                    </div>
                    {formData.image_url && (
                      <img src={formData.image_url} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-neutral-800" />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Базова ціна (грн)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-white" required />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Акційна ціна (грн)</label>
                  <input type="number" step="0.01" value={formData.promo_price} onChange={e => setFormData({...formData, promo_price: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-white" disabled={!formData.is_promo} required={formData.is_promo} />
                </div>
                <div className="col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm text-neutral-400">Опис</label>
                    <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDesc} className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer">
                      ✨ {isGeneratingDesc ? 'Генерую...' : 'Згенерувати ШІ'}
                    </button>
                  </div>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 h-24 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 rounded border-neutral-800 bg-neutral-900 accent-orange-500" />
                  <label htmlFor="is_active">В наявності</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_promo" checked={formData.is_promo} onChange={e => setFormData({...formData, is_promo: e.target.checked})} className="w-5 h-5 rounded border-neutral-800 bg-neutral-900 accent-orange-500" />
                  <label htmlFor="is_promo" className="text-orange-400">Діє акція</label>
                </div>
              </div>
              <button type="submit" className="w-full bg-[var(--color-primary)] hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition-colors mt-6 cursor-pointer">
                Зберегти
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
