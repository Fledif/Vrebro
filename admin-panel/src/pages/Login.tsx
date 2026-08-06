import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Lock } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await api.post('/admin/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      localStorage.setItem('admin_token', response.data.access_token);
      navigate('/');
    } catch (err) {
      setError('Неправильний логін або пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)] flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] p-8 rounded-2xl w-full max-w-md border border-neutral-800 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center">
            <Lock className="text-orange-500" size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-white mb-2">Вхід в панель</h1>
        <p className="text-neutral-400 text-center mb-8">VreBRO Admin Dashboard</p>
        
        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-6 text-center border border-red-500/20">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Логін</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Пароль</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl transition-colors mt-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>
      </div>
    </div>
  );
}
