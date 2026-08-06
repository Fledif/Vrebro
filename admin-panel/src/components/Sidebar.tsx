import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, LogOut, FileText, Settings as SettingsIcon } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Замовлення', path: '/', icon: LayoutDashboard },
    { name: 'Чеки (Архів)', path: '/receipts', icon: FileText },
    { name: 'Товари', path: '/products', icon: Package },
    { name: 'Категорії', path: '/categories', icon: Tags },
    { name: 'Налаштування', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="w-64 bg-[var(--color-surface)] h-screen fixed left-0 top-0 border-r border-neutral-800 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Vre<span className="text-[var(--color-primary)]">BRO</span> Admin
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-[var(--color-primary)] text-white font-medium' 
                  : 'text-neutral-400 hover:bg-[var(--color-surface-hover)] hover:text-white'
              }`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-neutral-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-neutral-400 hover:text-red-400 hover:bg-neutral-800/50 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          Вийти
        </button>
      </div>
    </div>
  );
}
