import { useState, useEffect } from 'react';
import { api } from '../api';
import { Users as UsersIcon, Search, Gift, Edit2, X, Check } from 'lucide-react';

interface User {
  telegram_id: number;
  first_name: string;
  username: string | null;
  phone: string | null;
  cashback_balance: number;
  created_at: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editBalance, setEditBalance] = useState<string>('0');
  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveBalance = async (userId: number) => {
    setSavingId(userId);
    try {
      await api.patch(`/admin/users/${userId}/cashback`, {
        cashback_balance: parseFloat(editBalance)
      });
      setUsers(users.map(u => u.telegram_id === userId ? { ...u, cashback_balance: parseFloat(editBalance) } : u));
      setEditingUserId(null);
    } catch (err) {
      alert("Помилка збереження балансу");
    } finally {
      setSavingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.first_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.phone || '').includes(search) ||
    (u.telegram_id.toString().includes(search))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <UsersIcon className="text-brand-orange" size={32} />
          Клієнти
        </h1>
      </div>

      <div className="bg-[var(--color-surface)] border border-neutral-800 rounded-2xl p-6 mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
          <input
            type="text"
            placeholder="Пошук за ім'ям, телефоном чи ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-xl focus:outline-none focus:border-brand-orange text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-500">Завантаження клієнтів...</div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-900/50 text-neutral-400 text-sm border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Клієнт</th>
                  <th className="px-6 py-4 font-medium">Телефон</th>
                  <th className="px-6 py-4 font-medium text-right">Бонуси (грн)</th>
                  <th className="px-6 py-4 font-medium text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                      Клієнтів не знайдено
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.telegram_id} className="hover:bg-neutral-900/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{user.first_name || 'Без імені'}</div>
                        <div className="text-sm text-neutral-500">ID: {user.telegram_id}</div>
                      </td>
                      <td className="px-6 py-4 text-neutral-300">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingUserId === user.telegram_id ? (
                          <div className="flex items-center justify-end gap-2">
                            <input 
                              type="number" 
                              value={editBalance}
                              onChange={(e) => setEditBalance(e.target.value)}
                              className="w-24 px-2 py-1 bg-[#0a0a0a] border border-brand-orange rounded text-right focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-orange/10 text-brand-orange rounded-full font-bold">
                            <Gift size={14} />
                            {user.cashback_balance.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingUserId === user.telegram_id ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setEditingUserId(null)}
                              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                              <X size={18} />
                            </button>
                            <button 
                              onClick={() => handleSaveBalance(user.telegram_id)}
                              disabled={savingId === user.telegram_id}
                              className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Check size={18} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditingUserId(user.telegram_id);
                              setEditBalance(user.cashback_balance.toString());
                            }}
                            className="p-2 text-neutral-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
