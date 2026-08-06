# VreBRO Project Codebase

## clear_live.py
`py
import requests

def purge():
    print("Logging in...")
    res = requests.post("https://vrebro.onrender.com/api/admin/login", data={"username": "admin", "password": "password"})
    if res.status_code != 200:
        print("Login failed with 'password', trying 'admin'...")
        res = requests.post("https://vrebro.onrender.com/api/admin/login", data={"username": "admin", "password": "admin"})
        if res.status_code != 200:
            print("Login completely failed:", res.text)
            return

    token = res.json()["access_token"]
    print("Got token, purging...")
    headers = {"Authorization": f"Bearer {token}"}
    purge_res = requests.post("https://vrebro.onrender.com/api/admin/purge", headers=headers)
    print("Purge result:", purge_res.status_code, purge_res.text)

if __name__ == "__main__":
    purge()

`

## export_code.py
`py
﻿import os

def export_code():
    project_root = r"c:\VreBRO"
    output_file = r"c:\VreBRO\full_codebase.md"
    
    include_exts = {'.py', '.ts', '.tsx', '.css', '.html', '.json'}
    exclude_dirs = {'node_modules', '.git', '__pycache__', 'dist', 'build', 'venv', '.venv'}
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write("# VreBRO Project Codebase\n\n")
        
        for root, dirs, files in os.walk(project_root):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in include_exts:
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, project_root)
                    
                    if file == 'package-lock.json':
                        continue
                        
                    outfile.write(f"## {rel_path}\n")
                    outfile.write(f"`{ext[1:]}\n")
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            outfile.write(infile.read())
                    except Exception as e:
                        outfile.write(f"// Error reading file: {e}\n")
                        
                    outfile.write("\n`\n\n")

if __name__ == '__main__':
    export_code()

`

## test_ai.py
`py
import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

from backend.routers.ai import call_groq

async def test():
    try:
        res = await call_groq([{"role": "user", "content": "Скажи одне слово: Працює"}], temperature=0.1)
        print("AI Response:", res)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(test())

`

## admin-panel\.oxlintrc.json
`json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}

`

## admin-panel\index.html
`html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>admin-panel</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

`

## admin-panel\package.json
`json
{
  "name": "admin-panel",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.19.0",
    "clsx": "^2.1.1",
    "lucide-react": "^1.28.0",
    "puppeteer": "^25.5.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.2",
    "tailwind-merge": "^3.6.0",
    "zustand": "^5.0.14"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.4",
    "oxlint": "^1.75.0",
    "tailwindcss": "^4.3.3",
    "typescript": "~6.0.2",
    "vite": "^8.2.0"
  }
}

`

## admin-panel\tsconfig.app.json
`json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}

`

## admin-panel\tsconfig.json
`json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}

`

## admin-panel\tsconfig.node.json
`json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}

`

## admin-panel\vite.config.ts
`ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5174, // Admin panel on a different port
    strictPort: true,
  }
})

`

## admin-panel\src\api.ts
`ts
import axios from 'axios';

export interface OrderItem {
  id: number;
  product_name?: string;
  product: { name: string; image_url: string } | null;
  quantity: number;
  price_at_purchase: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  comment: string;
  status: string;
  total_price: number;
  delivery_cost: number;
  created_at: string;
  items: OrderItem[];
}

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://vrebro.onrender.com/api');

export const api = axios.create({
  baseURL: API_URL,
});

export const updateProduct = (id: number, data: any) => api.put(`/products/${id}`, data).then(res => res.data);
export const deleteProduct = (id: number) => api.delete(`/products/${id}`).then(res => res.data);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      // Redirect to login only if not already on login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

`

## admin-panel\src\App.css
`css
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}

`

## admin-panel\src\App.tsx
`tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import Receipts from './pages/Receipts';
import ProtectedLayout from './components/ProtectedLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Orders />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

`

## admin-panel\src\index.css
`css
@import "tailwindcss";

@theme {
  --color-primary: #f97316;
  --color-primary-hover: #ea580c;
  --color-bg-dark: #121212;
  --color-surface: #1e1e1e;
  --color-surface-hover: #2a2a2a;
}

body {
  background-color: var(--color-bg-dark);
  color: white;
  font-family: ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--color-bg-dark);
}
::-webkit-scrollbar-thumb {
  background: var(--color-surface-hover);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #3a3a3a;
}

`

## admin-panel\src\main.tsx
`tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

`

## admin-panel\src\components\AiChatWidget.tsx
`tsx
import { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { Bot, X, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/admin/ai/chat', { messages: newMessages });
      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: 'Помилка з\'єднання з ШІ.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center text-white shadow-xl transition-all z-40 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <Bot size={28} />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-[var(--color-surface)] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="bg-neutral-800 p-4 flex justify-between items-center border-b border-neutral-700">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-orange-400" />
              <span className="font-bold">VreBRO AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm">
            {messages.length === 0 && (
              <div className="text-center text-neutral-500 mt-4">
                Привіт! Я ваш ШІ-асистент. Запитуйте мене про замовлення, статистику або поради.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-orange-500 text-white rounded-br-sm' : 'bg-neutral-800 text-neutral-200 rounded-bl-sm'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-800 p-3 rounded-2xl rounded-bl-sm flex gap-1">
                  <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-neutral-800 bg-neutral-900 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Напишіть повідомлення..."
              className="flex-1 bg-transparent border border-neutral-800 rounded-xl px-3 py-2 text-white outline-none focus:border-orange-500 text-sm"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

`

## admin-panel\src\components\ProtectedLayout.tsx
`tsx
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AiChatWidget from './AiChatWidget';

export default function ProtectedLayout() {
  const token = localStorage.getItem('admin_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-64 p-8">
        <Outlet />
      </div>
      <AiChatWidget />
    </div>
  );
}

`

## admin-panel\src\components\Sidebar.tsx
`tsx
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

`

## admin-panel\src\pages\Categories.tsx
`tsx
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

`

## admin-panel\src\pages\Login.tsx
`tsx
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

`

## admin-panel\src\pages\Orders.tsx
`tsx
import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Order } from '../api';
import { RefreshCcw, PackageOpen } from 'lucide-react';

const STATUSES = ["NEW", "REVIEWED", "EDITED", "PACKING", "SHIPPED", "CONFIRMED", "CANCELLED"];
const statusLabels: Record<string, string> = {
  NEW: 'Не розглянуто',
  REVIEWED: 'Розглянуто',
  EDITED: 'Відредаговано',
  PACKING: 'Упаковується',
  SHIPPED: 'Відправлено',
  CONFIRMED: 'Підтверджено',
  CANCELLED: 'Скасовано'
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.filter((o: Order) => o.status !== 'CONFIRMED'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    const wsUrl = api.defaults.baseURL?.replace('http', 'ws') + '/admin/ws/orders';
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      const token = localStorage.getItem('admin_token');
      if (token) ws.send(token);
    };
    
    ws.onmessage = (event) => {
      if (event.data === 'update') {
        fetchOrders();
      }
    };
    
    return () => {
      ws.close();
    };
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Помилка оновлення статусу');
    }
  };

  const handleDeliveryCostUpdate = async (orderId: number, cost: number) => {
    try {
      const currentStatus = orders.find(o => o.id === orderId)?.status || "NEW";
      await api.patch(`/admin/orders/${orderId}/status`, { status: currentStatus, delivery_cost: cost });
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Помилка оновлення вартості доставки');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Замовлення</h1>
        <button onClick={fetchOrders} className="p-2 text-neutral-400 hover:text-white bg-[var(--color-surface)] rounded-xl border border-neutral-800 cursor-pointer">
          <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div className="text-neutral-400 text-center py-12">Завантаження...</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-[var(--color-surface)] p-6 rounded-2xl border border-neutral-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">#{order.order_number}</h3>
                  <p className="text-sm text-neutral-400">{new Date(order.created_at).toLocaleString('uk-UA')}</p>
                </div>
                <select 
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 cursor-pointer outline-none
                    ${order.status === 'NEW' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                      order.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      order.status === 'SHIPPED' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 
                      'bg-orange-500/10 text-orange-500 border-orange-500/20'}
                  `}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s} className="bg-neutral-900 text-white">{statusLabels[s]}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm bg-neutral-800/30 p-4 rounded-xl border border-neutral-800">
                <div><span className="text-neutral-500">Клієнт:</span> {order.customer_name}</div>
                <div><span className="text-neutral-500">Телефон:</span> {order.phone}</div>
                <div className="col-span-2"><span className="text-neutral-500">Адреса:</span> {order.address}</div>
                {order.comment && <div className="col-span-2"><span className="text-neutral-500">Комент:</span> <span className="text-orange-400">{order.comment}</span></div>}
              </div>

              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-medium text-neutral-400 flex items-center gap-2"><PackageOpen size={16}/> Склад замовлення:</h4>
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-neutral-800/50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img src={item.product?.image_url || 'https://placehold.co/100x100/1a1a1a/555555?text=Видалено'} alt="" className="w-10 h-10 rounded object-cover" />
                      <span className="text-sm text-neutral-200">{item.product?.name || item.product_name || "Видалений товар"}</span>
                    </div>
                    <div className="text-sm font-medium">
                      x{item.quantity} = {item.quantity * item.price_at_purchase} грн
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                <span className="text-neutral-400">Вартість доставки:</span>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    id={`delivery-${order.id}`}
                    defaultValue={order.delivery_cost || 0}
                    className="bg-neutral-900 border border-neutral-700 px-3 py-1 rounded-lg w-24 text-white font-bold"
                  />
                  <button 
                    onClick={() => {
                      const val = (document.getElementById(`delivery-${order.id}`) as HTMLInputElement).value;
                      handleDeliveryCostUpdate(order.id, Number(val));
                    }}
                    className="px-3 py-1 bg-[var(--color-primary)] text-white rounded-lg text-sm font-bold hover:opacity-80"
                  >
                    Зберегти
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-neutral-800 mt-4">
                <span className="text-neutral-400 font-bold">Разом до сплати (з доставкою):</span>
                <span className="text-2xl font-black text-[var(--color-primary)]">{order.total_price + (order.delivery_cost || 0)} грн</span>
              </div>
            </div>
          ))}
          {orders.length === 0 && !loading && (
            <div className="text-neutral-400 text-center py-12 col-span-2">Немає замовлень</div>
          )}
        </div>
      )}
    </div>
  );
}

`

## admin-panel\src\pages\Products.tsx
`tsx
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
  is_weighted: boolean;
  weight_step: number | null;
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
    promo_price: '',
    is_weighted: false,
    weight_step: ''
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
        promo_price: prod.promo_price ? prod.promo_price.toString() : '',
        is_weighted: prod.is_weighted,
        weight_step: prod.weight_step ? prod.weight_step.toString() : ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', category_id: categories[0]?.id.toString() || '', description: '', 
        price: '', image_url: '', is_active: true, is_promo: false, promo_price: '',
        is_weighted: false, weight_step: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await api.post('/admin/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000 // 30 seconds timeout
      });
      if (res.data && res.data.url) {
        setFormData(prev => ({...prev, image_url: res.data.url}));
      } else {
        alert("Помилка: сервер не повернув посилання на фото");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Не вдалося завантажити фото: " + (err.response?.data?.detail || err.message || 'Невідома помилка'));
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
      promo_price: formData.promo_price ? parseFloat(formData.promo_price) : null,
      is_weighted: formData.is_weighted,
      weight_step: formData.weight_step ? parseInt(formData.weight_step) : null
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
                <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-neutral-800 pt-4 mt-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_weighted" checked={formData.is_weighted} onChange={e => setFormData({...formData, is_weighted: e.target.checked})} className="w-5 h-5 rounded border-neutral-800 bg-neutral-900 accent-orange-500" />
                    <label htmlFor="is_weighted" className="text-blue-400">Ваговий товар</label>
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Крок ваги (грами)</label>
                    <input type="number" step="1" value={formData.weight_step} onChange={e => setFormData({...formData, weight_step: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-white" disabled={!formData.is_weighted} required={formData.is_weighted} />
                  </div>
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

`

## admin-panel\src\pages\Receipts.tsx
`tsx
import { useState, useEffect } from 'react';
import { api } from '../api';
import { FileText, RefreshCcw } from 'lucide-react';
import type { Order } from '../api';

export default function Receipts() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders?status_filter=CONFIRMED&limit=100');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Чеки (Архів)</h1>
        <button onClick={fetchOrders} className="p-2 text-neutral-400 hover:text-white bg-[var(--color-surface)] rounded-xl border border-neutral-800 cursor-pointer">
          <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div className="text-neutral-400 text-center py-12">Завантаження...</div>
      ) : orders.length === 0 ? (
        <div className="text-neutral-500 text-center py-12 flex flex-col items-center">
          <FileText size={48} className="mb-4 opacity-50" />
          <p>Тут поки порожньо.</p>
          <p className="text-sm mt-2">Підтверджені замовлення потраплятимуть сюди.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map(order => (
            <div key={order.id} className="bg-[var(--color-surface)] p-6 rounded-2xl border border-neutral-800 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Замовлення #{order.order_number}
                </h3>
                <p className="text-sm text-neutral-400">
                  {new Date(order.created_at).toLocaleString('uk-UA')} • {order.customer_name} • {order.phone}
                </p>
                <div className="mt-2 text-sm text-neutral-500">
                  {order.items.map(item => (
                    <span key={item.id} className="mr-3">
                      {item.product ? item.product.name : 'Видалений товар'} (x{item.quantity})
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-neutral-500 mb-1">Загальна сума з доставкою</div>
                <div className="text-2xl font-black text-brand-orange">
                  {(order.total_price + (order.delivery_cost || 0)).toLocaleString('uk-UA')} грн
                </div>
                <div className="mt-2 inline-block px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-xs font-bold border border-green-500/20">
                  ПІДТВЕРДЖЕНО
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

`

## admin-panel\src\pages\Settings.tsx
`tsx
import { useState, useEffect } from 'react';
import { api } from '../api';
import { Save, Lock } from 'lucide-react';

export default function Settings() {
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // We can fetch the current card number even without password, if we want to show it.
    // But let's only fetch when unlocked for security if preferred. Actually our GET route is public.
    const fetchCard = async () => {
      try {
        const res = await api.get('/admin/settings/payment_card');
        setCardNumber(res.data.card_number);
      } catch (err) {
        console.error("Failed to fetch card", err);
      }
    };
    fetchCard();
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPassword.length > 0) {
      setIsUnlocked(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/admin/settings/payment_card', {
        card_number: cardNumber,
        master_password: masterPassword
      });
      alert('Збережено успішно!');
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert('Неправильний майстер-пароль!');
        setIsUnlocked(false);
        setMasterPassword('');
      } else {
        alert('Помилка при збереженні');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-[var(--color-surface)] p-8 rounded-2xl border border-neutral-800 text-center">
          <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-orange">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Налаштування</h2>
          <p className="text-neutral-400 mb-6">Введіть майстер-пароль для доступу</p>
          
          <form onSubmit={handleUnlock}>
            <input 
              type="password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              placeholder="Майстер-пароль"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-xl mb-4 focus:outline-none focus:border-brand-orange"
            />
            <button 
              type="submit"
              className="w-full py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
            >
              Увійти
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Налаштування Оплати</h1>
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-neutral-800">
        <h3 className="text-lg font-bold mb-4">Реквізити для оплати</h3>
        <p className="text-neutral-400 mb-6 text-sm">
          Цей номер картки буде відображатися клієнтам у їхньому боті (міні-аппі), коли статус замовлення перейде в роботу.
        </p>

        <div className="mb-6">
          <label className="block text-sm text-neutral-400 mb-2">Номер банківської картки</label>
          <input 
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="0000 0000 0000 0000"
            className="w-full px-4 py-3 bg-[#0a0a0a] border border-neutral-800 rounded-xl focus:outline-none focus:border-brand-orange text-lg tracking-widest font-mono"
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? "Збереження..." : "Зберегти"}
        </button>
      </div>
    </div>
  );
}

`

## backend\auth.py
`py
import jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import bcrypt
from config import settings

security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=1440) # 24 hours
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None or username != settings.ADMIN_USERNAME:
            raise HTTPException(status_code=401, detail="Invalid admin credentials")
        return username
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

`

## backend\bot.py
`py
import os
import logging
from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import Message, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton

TOKEN = os.getenv("BOT_TOKEN", "")
WEB_APP_URL = os.getenv("WEB_APP_URL", "")

logging.basicConfig(level=logging.INFO)

bot = Bot(token=TOKEN) if TOKEN else None
dp = Dispatcher()

@dp.message(CommandStart())
async def cmd_start(message: Message):
    if not WEB_APP_URL:
        await message.answer("Помилка: WEB_APP_URL не налаштовано на сервері.")
        return
        
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="🔥 Відкрити меню для замовлення",
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ])
    await message.answer(
        "Вітаємо у **VreBRO Mini App**!\nНатисніть кнопку нижче, щоб відкрити преміальне меню 🥩🦐",
        reply_markup=keyboard,
        parse_mode="Markdown"
    )

`

## backend\config.py
`py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "VreBRO Unified Backend"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///vrebro.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    BOT_TOKEN: str = os.getenv("BOT_TOKEN", "")
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD_HASH: str = os.getenv("ADMIN_PASSWORD_HASH", "$2b$12$K1nUaH54sL4n2e3aQJ/YzeR6j/J5D6mC7oV9E8C0aK/lqV/N.8cO") # bcrypt hash for "admin"
    IMGBB_API_KEY: str = os.getenv("IMGBB_API_KEY", "")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super-secret-jwt-key")
    ADMIN_CHAT_ID: str = os.getenv("ADMIN_CHAT_ID", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    MASTER_PASSWORD: str = os.getenv("MASTER_PASSWORD", "admin123")
settings = Settings()

`

## backend\database.py
`py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with async_session() as session:
        yield session

`

## backend\main.py
`py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from contextlib import asynccontextmanager
from database import engine
from models.base import Base

# Import all models here so metadata is aware of them
import models.product
import models.order
import models.user
from routers import admin, catalog, orders, ai

import asyncio
from bot import bot, dp

import sqlite3
import httpx

from aiogram.types import Update
from fastapi import Request

async def keep_awake():
    """Background task to ping the server every 3 minutes to keep it awake on Render."""
    while True:
        await asyncio.sleep(180)
        try:
            async with httpx.AsyncClient() as client:
                await client.get("https://vrebro.onrender.com/", headers={"User-Agent": "Render-Keep-Alive-Bot/1.0"})
            print("Keep-awake ping sent successfully.")
        except Exception as e:
            print(f"Keep-awake ping failed: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-migrate database for Render's persistent disk
    try:
        with sqlite3.connect("vrebro.db") as conn:
            conn.execute("ALTER TABLE orders ADD COLUMN delivery_cost FLOAT DEFAULT 0.0")
    except Exception as e:
        print(f"Migration: {e}") # Expected if column already exists

    try:
        with sqlite3.connect("vrebro.db") as conn:
            conn.execute("ALTER TABLE products ADD COLUMN is_weighted BOOLEAN DEFAULT 0")
            conn.execute("ALTER TABLE products ADD COLUMN weight_step INTEGER")
            conn.execute("ALTER TABLE order_items ADD COLUMN product_name VARCHAR")
    except Exception as e:
        print(f"Migration for products/order_items: {e}")

    try:
        with sqlite3.connect("vrebro.db") as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS store_settings (
                    key VARCHAR PRIMARY KEY,
                    value VARCHAR NOT NULL
                )
            """)
    except Exception as e:
        print(f"Migration: {e}")

    # Initialize DB
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    if bot:
        render_url = os.getenv("RENDER_EXTERNAL_URL")
        web_app_url = os.getenv("WEB_APP_URL", "").replace("/miniapp", "")
        base_url = render_url if render_url else web_app_url
        if base_url:
            webhook_url = f"{base_url}/api/webhook"
            await bot.set_webhook(webhook_url, drop_pending_updates=True)
            print(f"Telegram Bot webhook set to {webhook_url}!")
        else:
            print("Telegram Bot webhook NOT SET: RENDER_EXTERNAL_URL or WEB_APP_URL missing.")
        
    keep_awake_task = asyncio.create_task(keep_awake())
        
    yield
    

    if keep_awake_task:
        keep_awake_task.cancel()

app = FastAPI(title="VreBRO Unified Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(ai.router, prefix="/api/admin/ai", tags=["ai"])
app.include_router(catalog.router, prefix="/api/catalog", tags=["catalog"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])

@app.post("/api/webhook")
async def telegram_webhook(request: Request):
    if not bot:
        return {"status": "bot_not_configured"}
    try:
        update_data = await request.json()
        update = Update.model_validate(update_data, context={"bot": bot})
        await dp.feed_update(bot, update)
    except Exception as e:
        print(f"Webhook processing error: {e}")
    return {"status": "ok"}

admin_path = os.path.join(os.path.dirname(__file__), "..", "admin-panel", "dist")
miniapp_path = os.path.join(os.path.dirname(__file__), "..", "miniapp", "frontend", "dist")

if os.path.exists(os.path.join(admin_path, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(admin_path, "assets")), name="admin_assets")

if os.path.exists(os.path.join(miniapp_path, "assets")):
    app.mount("/miniapp/assets", StaticFiles(directory=os.path.join(miniapp_path, "assets")), name="miniapp_assets")

@app.get("/miniapp")
@app.get("/miniapp/")
@app.get("/miniapp/{full_path:path}")
async def serve_miniapp(full_path: str = ""):
    file_path = os.path.join(miniapp_path, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
        
    if full_path.endswith(".js") or full_path.endswith(".css"):
        raise HTTPException(status_code=404, detail="Asset not found")
    
    index_path = os.path.join(miniapp_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    return {"status": "ok", "message": "Mini App build not found"}

@app.get("/{full_path:path}")
async def serve_admin(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")
        
    if full_path.endswith(".js") or full_path.endswith(".css"):
        raise HTTPException(status_code=404, detail="Asset not found")
    
    file_path = os.path.join(admin_path, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    index_path = os.path.join(admin_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    return {"status": "ok", "message": "Admin Panel build not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

`

## backend\migrate.py
`py
import sqlite3

def run():
    print("Migrating vrebro.db...")
    try:
        conn = sqlite3.connect("vrebro.db")
        cursor = conn.cursor()
        
        # Add delivery_cost to orders
        try:
            cursor.execute("ALTER TABLE orders ADD COLUMN delivery_cost FLOAT DEFAULT 0.0")
            print("Added delivery_cost to orders.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print("Column delivery_cost already exists.")
            else:
                print(f"Error adding delivery_cost: {e}")
                
        # Create StoreSettings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS store_settings (
                key VARCHAR PRIMARY KEY,
                value VARCHAR NOT NULL
            )
        """)
        print("Created store_settings table.")
        
        conn.commit()
        conn.close()
        print("Migration complete!")
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == '__main__':
    run()

`

## backend\patch.py
`py
with open('c:\\VreBRO\\backend\\routers\\admin.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('@router.', '@protected_router.')

imports = """from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from database import get_db
from models.product import Category, Product
from models.order import Order, OrderItem
from schemas.product_schema import CategorySchema, CategoryCreate, CategoryUpdate, ProductSchema, ProductCreate, ProductUpdate
from schemas.order_schema import OrderSchema, OrderStatusUpdate
from auth import get_current_admin, verify_password, create_access_token
from config import settings
from bot import bot

router = APIRouter()
protected_router = APIRouter(dependencies=[Depends(get_current_admin)])

@router.post("/login")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username != settings.ADMIN_USERNAME or not verify_password(form_data.password, settings.ADMIN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}
"""

content = content.split('router = APIRouter()')[1]

with open('c:\\VreBRO\\backend\\routers\\admin.py', 'w', encoding='utf-8') as f:
    f.write(imports + content + '\nrouter.include_router(protected_router)\n')

`

## backend\recreate_db.py
`py
import asyncio
from database import engine
from models.base import Base
import models.product
import models.order
import models.user

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        print("Dropped tables")
        await conn.run_sync(Base.metadata.create_all)
        print("Created tables")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())

`

## backend\test_admin.py
`py
import asyncio
import httpx
from main import app
from database import engine
from models.base import Base

async def test_admin_api():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print("=== CREATED ENDPOINTS ===")
        print("POST /api/admin/categories")
        print("GET /api/admin/categories")
        print("GET /api/admin/categories/{id}")
        print("PUT /api/admin/categories/{id}")
        print("DELETE /api/admin/categories/{id}")
        print("POST /api/admin/products")
        print("GET /api/admin/products")
        print("GET /api/admin/products/{id}")
        print("PUT /api/admin/products/{id}")
        print("DELETE /api/admin/products/{id}")
        print("PATCH /api/admin/products/{id}/toggle")
        print("GET /api/admin/orders")
        print("GET /api/admin/orders/{id}")
        print("PATCH /api/admin/orders/{id}/status")
        
        print("\n=== TEST RESULTS ===")
        
        # 1. Create 1 category
        resp = await client.post("/api/admin/categories", json={"name": "Drinks", "icon": "🍹", "sort_order": 1})
        assert resp.status_code == 201, f"Failed to create category: {resp.text}"
        category_id = resp.json()["id"]
        print(f"Created category: {resp.json()['name']} (ID: {category_id})")
        
        # 2. Create 2 products
        resp = await client.post("/api/admin/products", json={
            "name": "Coca Cola",
            "description": "Cold drink",
            "price": 2.5,
            "image_url": "http://example.com/cola.png",
            "category_id": category_id
        })
        assert resp.status_code == 201, f"Failed to create product 1: {resp.text}"
        product1_id = resp.json()["id"]
        print(f"Created product: {resp.json()['name']} (ID: {product1_id})")
        
        resp = await client.post("/api/admin/products", json={
            "name": "Pepsi",
            "description": "Cold drink",
            "price": 2.0,
            "image_url": "http://example.com/pepsi.png",
            "category_id": category_id
        })
        assert resp.status_code == 201, f"Failed to create product 2: {resp.text}"
        product2_id = resp.json()["id"]
        print(f"Created product: {resp.json()['name']} (ID: {product2_id})")
        
        # 3. Create an order (we need to bypass admin for creation, or simulate it by direct DB insert)
        # Actually, let's just insert an order into the database since we are testing Admin CRUD
        from models.order import Order, OrderItem
        from database import async_session
        async with async_session() as db:
            new_order = Order(
                user_id=123,
                order_number="ORD-001",
                total_price=4.5,
                customer_name="Test User",
                phone="123456789",
                address="Test Address"
            )
            db.add(new_order)
            await db.commit()
            await db.refresh(new_order)
            order_id = new_order.id
            
            item1 = OrderItem(order_id=order_id, product_id=product1_id, quantity=1, price_at_purchase=2.5)
            item2 = OrderItem(order_id=order_id, product_id=product2_id, quantity=1, price_at_purchase=2.0)
            db.add(item1)
            db.add(item2)
            await db.commit()
            print(f"Created order: {new_order.order_number} (ID: {order_id})")

        # 4. Change order status
        resp = await client.patch(f"/api/admin/orders/{order_id}/status", json={"status": "ACCEPTED"})
        assert resp.status_code == 200, f"Failed to update order status: {resp.text}"
        print(f"Updated order status to: {resp.json()['status']}")
        
        # 5. Read all records back
        resp = await client.get("/api/admin/categories")
        assert len(resp.json()) == 1, "Expected 1 category"
        print(f"Read {len(resp.json())} categories.")
        
        resp = await client.get("/api/admin/products")
        assert len(resp.json()) == 2, "Expected 2 products"
        print(f"Read {len(resp.json())} products.")
        
        resp = await client.get("/api/admin/orders")
        assert len(resp.json()) == 1, "Expected 1 order"
        print(f"Read {len(resp.json())} orders.")
        
        print("\n=== READY FOR MINI APP INTEGRATION ===")
        print("Backend catalog CRUD is ready and fully functional!")
        
if __name__ == "__main__":
    asyncio.run(test_admin_api())

`

## backend\test_bcrypt.py
`py
import bcrypt

password = b"admin"
hashed = bcrypt.hashpw(password, bcrypt.gensalt())
print("Generated Hash:", hashed.decode('utf-8'))

is_valid = bcrypt.checkpw(password, hashed)
print("Is Valid:", is_valid)

`

## backend\test_db.py
`py
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.base import Base
from models.product import Category, Product
from models.order import Order, OrderItem
from models.user import User, Admin
from config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def test_db():
    # 1. Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # 2. Insert test data
    async with async_session() as session:
        # Category
        cat = Category(name="Burgers")
        session.add(cat)
        await session.commit()
        await session.refresh(cat)

        # Product
        prod = Product(category_id=cat.id, name="Cheeseburger", price=150.0)
        session.add(prod)
        await session.commit()
        await session.refresh(prod)

        # Order
        order = Order(
            customer_name="John", 
            phone="123", 
            address="Street", 
            total_price=150.0,
            status="NEW"
        )
        session.add(order)
        await session.commit()
        await session.refresh(order)

        # Order Item
        item = OrderItem(order_id=order.id, product_id=prod.id, quantity=1, price_at_purchase=150.0)
        session.add(item)
        await session.commit()
        
    # 3. Read back
    async with async_session() as session:
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload
        
        stmt = select(Order).options(selectinload(Order.items)).where(Order.id == 1)
        result = await session.execute(stmt)
        read_order = result.scalar_one()
        
        print("=== DB TEST SUCCESS ===")
        print(f"Read Order ID: {read_order.id}, Status: {read_order.status}, Customer: {read_order.customer_name}")
        for i in read_order.items:
            print(f" - Item: Product ID {i.product_id}, Qty: {i.quantity}")

if __name__ == "__main__":
    asyncio.run(test_db())

`

## backend\test_e2e.py
`py
import asyncio
import httpx
from main import app
from database import engine
from models.base import Base

async def run_audit():
    # Reset DB
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print("=== E2E AUDIT START ===")
        
        # 1. Create Category
        res = await client.post("/api/admin/categories", json={"name": "Ребра"})
        assert res.status_code == 201
        cat_id = res.json()["id"]
        
        # 2. Create Products
        products = [
            {"name": "Ребра BBQ", "price": 15.5, "image_url": "ribs.jpg", "description": "Smoked BBQ ribs", "category_id": cat_id},
            {"name": "Стейк Рібай", "price": 25.0, "image_url": "steak.jpg", "description": "Juicy ribeye", "category_id": cat_id},
            {"name": "Картопля фрі", "price": 4.5, "image_url": "fries.jpg", "description": "Crispy fries", "category_id": cat_id},
            {"name": "Кола", "price": 2.0, "image_url": "cola.jpg", "description": "Cold drink", "category_id": cat_id}
        ]
        
        prod_ids = []
        for p in products:
            res = await client.post("/api/admin/products", json=p)
            assert res.status_code == 201
            prod_ids.append(res.json()["id"])
            
        print("[PASSED] Created Category and 4 Products")
        
        # 3. Test Errors
        # - Invalid image_url (empty)
        res = await client.post("/api/admin/products", json={
            "name": "Invalid Prod", "price": 10.0, "image_url": "", "category_id": cat_id
        })
        if res.status_code == 400:
            print("[PASSED] Validation: Empty image_url correctly blocked")
        else:
            print(f"[FAILED] Validation: Empty image_url allowed (status {res.status_code})")
            
        # - Product without category (invalid category id)
        res = await client.post("/api/admin/products", json={
            "name": "No Cat", "price": 10.0, "image_url": "a.jpg", "category_id": 999
        })
        if res.status_code == 400:
            print("[PASSED] Validation: Product without valid category correctly blocked")
        else:
            print(f"[FAILED] Validation: Product without valid category allowed (status {res.status_code})")
            
        # 4. Catalog view check
        res = await client.get("/api/catalog/products")
        assert len(res.json()) == 4
        print("[PASSED] Catalog returned all 4 active products")
        
        # 5. Order Creation (simulating Cart -> Checkout)
        # Assuming missing phone/name is handled by frontend or Pydantic
        res = await client.post("/api/orders/", json={
            "user_id": 123,
            "customer_name": "", # empty name
            "phone": "123456789",
            "address": "Test",
            "items": [{"product_id": prod_ids[0], "quantity": 1, "price_at_purchase": 15.5}],
            "total_price": 15.5
        })
        if res.status_code == 422 or res.status_code == 400:
            print("[PASSED] Validation: Missing/Empty customer name blocked")
        else:
            print(f"[FAILED] Validation: Empty name allowed (status {res.status_code})")
            
        res = await client.post("/api/orders/", json={
            "user_id": 123,
            "customer_name": "John",
            "phone": "", # empty phone
            "address": "Test",
            "items": [{"product_id": prod_ids[0], "quantity": 1, "price_at_purchase": 15.5}],
            "total_price": 15.5
        })
        if res.status_code == 422 or res.status_code == 400:
            print("[PASSED] Validation: Missing/Empty phone blocked")
        else:
            print(f"[FAILED] Validation: Empty phone allowed (status {res.status_code})")
            
        # Empty cart
        res = await client.post("/api/orders/", json={
            "user_id": 123,
            "customer_name": "John",
            "phone": "123456",
            "address": "Test",
            "items": [], # empty cart
            "total_price": 0.0
        })
        if res.status_code == 400 or res.status_code == 422:
            print("[PASSED] Validation: Empty cart correctly blocked")
        else:
            print(f"[FAILED] Validation: Empty cart allowed (status {res.status_code})")
            
        # Valid order
        res = await client.post("/api/orders/", json={
            "user_id": 123,
            "customer_name": "Valid John",
            "phone": "123456789",
            "address": "Valid Address",
            "items": [
                {"product_id": prod_ids[0], "quantity": 2, "price_at_purchase": 15.5},
                {"product_id": prod_ids[1], "quantity": 1, "price_at_purchase": 25.0}
            ],
            "total_price": 56.0
        })
        assert res.status_code == 201
        print("[PASSED] Valid Order created in DB")
        
if __name__ == "__main__":
    asyncio.run(run_audit())

`

## backend\test_public.py
`py
import asyncio
import httpx
from main import app
from database import engine
from models.base import Base

async def test_public_api():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print("=== SELF TEST ===")
        # 1. Admin creates category and products
        resp = await client.post("/api/admin/categories", json={"name": "Burgers"})
        assert resp.status_code == 201
        category_id = resp.json()["id"]
        
        resp = await client.post("/api/admin/products", json={
            "name": "Classic Burger",
            "price": 10.0,
            "image_url": "burger.jpg",
            "category_id": category_id
        })
        assert resp.status_code == 201
        product_id = resp.json()["id"]

        resp = await client.post("/api/admin/products", json={
            "name": "Hidden Burger",
            "price": 12.0,
            "image_url": "hidden.jpg",
            "category_id": category_id
        })
        assert resp.status_code == 201
        hidden_product_id = resp.json()["id"]
        
        # Hide the second product
        await client.patch(f"/api/admin/products/{hidden_product_id}/toggle")

        # 2. Test Catalog (Public)
        resp = await client.get("/api/catalog/categories")
        assert resp.status_code == 200
        print(f"Catalog Categories: {len(resp.json())}")

        resp = await client.get("/api/catalog/products")
        assert resp.status_code == 200
        products = resp.json()
        print(f"Catalog Products (Active Only): {len(products)}")
        assert len(products) == 1, "Should only see 1 active product"
        assert products[0]["id"] == product_id

        # 3. Test Order Creation
        order_data = {
            "user_id": 1,
            "customer_name": "Test Cust",
            "phone": "999888777",
            "address": "123 Main St",
            "items": [
                {"product_id": product_id, "quantity": 2, "price_at_purchase": 10.0}
            ],
            "total_price": 20.0
        }
        resp = await client.post("/api/orders/", json=order_data)
        if resp.status_code != 201:
            print("Failed to create order:", resp.text)
        assert resp.status_code == 201
        order = resp.json()
        print(f"Order created successfully! ID: {order['id']}, Status: {order['status']}")

if __name__ == "__main__":
    asyncio.run(test_public_api())

`

## backend\test_security.py
`py
import asyncio
import httpx
from main import app
from database import engine
from models.base import Base
from models.product import Product
from models.order import Order
from database import async_session
from sqlalchemy.future import select

async def run_security_test():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Setup Data
        res = await client.post("/api/admin/categories", json={"name": "Drinks"})
        cat_id = res.json()["id"]
        
        # Product 1 - Active, Price 100
        res = await client.post("/api/admin/products", json={
            "name": "Expensive Drink", "price": 100.0, "image_url": "1.jpg", "category_id": cat_id
        })
        prod_active_id = res.json()["id"]
        
        # Product 2 - Inactive, Price 50
        res = await client.post("/api/admin/products", json={
            "name": "Hidden Drink", "price": 50.0, "image_url": "2.jpg", "category_id": cat_id
        })
        prod_inactive_id = res.json()["id"]
        await client.patch(f"/api/admin/products/{prod_inactive_id}/toggle")
        
        print("=== BEFORE ===")
        print("Earlier, users could send 'total_price: 1' and 'price_at_purchase: 1' to bypass the DB price.")
        print("=== AFTER ===")
        print("Now, the client payload does not contain prices. The server computes everything.")
        print("=== SECURITY TEST ===")
        
        # Test 1: Order active product (Should succeed and auto-calculate 100 * 2 = 200)
        res = await client.post("/api/orders/", json={
            "user_id": 1,
            "customer_name": "Alice",
            "phone": "12345",
            "address": "Home",
            "items": [{"product_id": prod_active_id, "quantity": 2}]
        })
        assert res.status_code == 201
        order = res.json()
        if order["total_price"] == 200.0:
            print(f"[PASSED] Server successfully computed total price from DB: {order['total_price']}")
        else:
            print(f"[FAILED] Price computation failed. Got: {order['total_price']}")
            
        # Test 2: Order inactive product (Should 400)
        res = await client.post("/api/orders/", json={
            "user_id": 1,
            "customer_name": "Bob",
            "phone": "12345",
            "address": "Home",
            "items": [{"product_id": prod_inactive_id, "quantity": 1}]
        })
        if res.status_code == 400:
            print(f"[PASSED] Server blocked ordering inactive product (status {res.status_code})")
        else:
            print(f"[FAILED] Server allowed inactive product! Status {res.status_code}")
            
        # Test 3: Order non-existent product (Should 404)
        res = await client.post("/api/orders/", json={
            "user_id": 1,
            "customer_name": "Charlie",
            "phone": "12345",
            "address": "Home",
            "items": [{"product_id": 9999, "quantity": 1}]
        })
        if res.status_code == 404:
            print(f"[PASSED] Server blocked non-existent product (status {res.status_code})")
        else:
            print(f"[FAILED] Server allowed non-existent product! Status {res.status_code}")
            
if __name__ == "__main__":
    asyncio.run(run_security_test())

`

## backend\websocket_manager.py
`py
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

`

## backend\models\base.py
`py
from sqlalchemy.orm import declarative_base

Base = declarative_base()

`

## backend\models\order.py
`py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from .base import Base

class Order(Base):
    __tablename__ = 'orders'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.telegram_id'), nullable=True)
    order_number = Column(String, unique=True, index=True)
    status = Column(String, default="NEW") # NEW, ACCEPTED, COOKING, READY, DELIVERING, COMPLETED, CANCELLED
    total_price = Column(Float, nullable=False)
    delivery_cost = Column(Float, default=0.0)
    customer_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = 'order_items'
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'))
    product_id = Column(Integer, ForeignKey('products.id'), nullable=True)
    product_name = Column(String, nullable=True)
    quantity = Column(Float, nullable=False)
    price_at_purchase = Column(Float, nullable=False)
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product")

`

## backend\models\product.py
`py
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from .base import Base

class Category(Base):
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    icon = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)
    
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = 'products'
    
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey('categories.id'))
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_promo = Column(Boolean, default=False)
    promo_price = Column(Float, nullable=True)
    is_weighted = Column(Boolean, default=False)
    weight_step = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    category = relationship("Category", back_populates="products")

`

## backend\models\settings.py
`py
from sqlalchemy import Column, String
from .base import Base

class StoreSettings(Base):
    __tablename__ = 'store_settings'
    
    key = Column(String, primary_key=True, index=True)
    value = Column(String, nullable=False)

`

## backend\models\user.py
`py
from sqlalchemy import Column, Integer, String, DateTime
import datetime
from .base import Base

class User(Base):
    __tablename__ = 'users'
    
    telegram_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=True)
    username = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Admin(Base):
    __tablename__ = 'admins'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)

`

## backend\routers\admin.py
`py
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
import jwt
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from database import get_db
from models.product import Category, Product
from models.order import Order, OrderItem
from models.settings import StoreSettings
from schemas.product_schema import CategorySchema, CategoryCreate, CategoryUpdate, ProductSchema, ProductCreate, ProductUpdate
from schemas.order_schema import OrderSchema, OrderStatusUpdate
from auth import get_current_admin, verify_password, create_access_token
from config import settings
from bot import bot
from websocket_manager import manager

router = APIRouter()
protected_router = APIRouter(dependencies=[Depends(get_current_admin)])

@router.websocket("/ws/orders")
async def websocket_orders(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        token = await websocket.receive_text()
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        if payload.get("sub") != settings.ADMIN_USERNAME:
            raise Exception("Invalid token")
        while True:
            await websocket.receive_text()
    except Exception:
        manager.disconnect(websocket)

@router.post("/login")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username != settings.ADMIN_USERNAME or not verify_password(form_data.password, settings.ADMIN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

from sqlalchemy import delete, update
from models.user import User

@protected_router.post("/purge")
async def purge_db(db: AsyncSession = Depends(get_db)):
    await db.execute(delete(OrderItem))
    await db.execute(delete(Order))
    await db.execute(delete(Product))
    await db.execute(delete(Category))
    await db.execute(delete(User))
    await db.commit()
    return {"message": "All data cleared"}


# --- CATEGORY CRUD ---

@protected_router.post("/categories", response_model=CategorySchema, status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryCreate, db: AsyncSession = Depends(get_db)):
    if not category.name.strip():
        raise HTTPException(status_code=400, detail="Category name cannot be empty")
        
    result = await db.execute(select(Category).where(Category.name == category.name))
    existing_category = result.scalars().first()
    if existing_category:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
        
    new_category = Category(**category.model_dump())
    db.add(new_category)
    await db.commit()
    await db.refresh(new_category)
    return new_category

@protected_router.get("/categories", response_model=List[CategorySchema])
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.sort_order))
    return result.scalars().all()

@protected_router.get("/categories/{id}", response_model=CategorySchema)
async def get_category(id: int, db: AsyncSession = Depends(get_db)):
    category = await db.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@protected_router.put("/categories/{id}", response_model=CategorySchema)
async def update_category(id: int, category_update: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    category = await db.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    if not category_update.name.strip():
        raise HTTPException(status_code=400, detail="Category name cannot be empty")
        
    if category.name != category_update.name:
        result = await db.execute(select(Category).where(Category.name == category_update.name))
        existing_category = result.scalars().first()
        if existing_category:
            raise HTTPException(status_code=400, detail="Category with this name already exists")
            
    for key, value in category_update.model_dump().items():
        setattr(category, key, value)
        
    await db.commit()
    await db.refresh(category)
    return category

@protected_router.delete("/categories/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(id: int, db: AsyncSession = Depends(get_db)):
    category = await db.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    result = await db.execute(select(Product).where(Product.category_id == id))
    products = result.scalars().all()
    if products:
        raise HTTPException(status_code=400, detail="Cannot delete category with associated products")
        
    await db.delete(category)
    await db.commit()
    return None

# --- PRODUCT CRUD ---

@protected_router.post("/products", response_model=ProductSchema, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate, db: AsyncSession = Depends(get_db)):
    if not product.name.strip():
        raise HTTPException(status_code=400, detail="Product name cannot be empty")
    if not product.image_url.strip():
        raise HTTPException(status_code=400, detail="Image URL cannot be empty")
    if product.price <= 0:
        raise HTTPException(status_code=400, detail="Price must be greater than 0")
        
    category = await db.get(Category, product.category_id)
    if not category:
        raise HTTPException(status_code=400, detail="Category does not exist")
        
    new_product = Product(**product.model_dump())
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return new_product

@protected_router.get("/dashboard/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order))
    orders = result.scalars().all()
    
    total_revenue = sum(order.total_price for order in orders if order.status != "CANCELLED")
    
    return {
        "total_revenue": total_revenue,
        "total_orders": len(orders)
    }

@protected_router.get("/imgbb-key")
async def get_imgbb_key():
    return {"key": settings.IMGBB_API_KEY}

@protected_router.post("/upload-image")
async def upload_image(image: UploadFile = File(...)):
    if not settings.IMGBB_API_KEY:
        raise HTTPException(status_code=500, detail="IMGBB_API_KEY is not configured on the server")
        
    image_bytes = await image.read()
    
    async with httpx.AsyncClient() as client:
        # ImgBB expects multipart/form-data
        files = {'image': (image.filename, image_bytes, image.content_type)}
        response = await client.post(
            f"https://api.imgbb.com/1/upload?key={settings.IMGBB_API_KEY}",
            files=files,
            timeout=30.0
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"ImgBB error: {response.text}")
            
        data = response.json()
        if data.get("success"):
            return {"url": data["data"]["url"]}
        else:
            raise HTTPException(status_code=400, detail="Failed to upload to ImgBB")

@protected_router.get("/products", response_model=List[ProductSchema])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))
    return result.scalars().all()

@protected_router.get("/products/{id}", response_model=ProductSchema)
async def get_product(id: int, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@protected_router.put("/products/{id}", response_model=ProductSchema)
async def update_product(id: int, product_update: ProductUpdate, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if not product_update.name.strip():
        raise HTTPException(status_code=400, detail="Product name cannot be empty")
    if not product_update.image_url.strip():
        raise HTTPException(status_code=400, detail="Image URL cannot be empty")
    if product_update.price <= 0:
        raise HTTPException(status_code=400, detail="Price must be greater than 0")
        
    if product.category_id != product_update.category_id:
        category = await db.get(Category, product_update.category_id)
        if not category:
            raise HTTPException(status_code=400, detail="Category does not exist")
            
    for key, value in product_update.model_dump().items():
        setattr(product, key, value)
        
    await db.commit()
    await db.refresh(product)
    return product

@protected_router.delete("/products/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(id: int, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Unlink from any order items to prevent Foreign Key constraints error
    await db.execute(update(OrderItem).where(OrderItem.product_id == id).values(product_id=None))
    
    await db.delete(product)
    await db.commit()
    return None

@protected_router.patch("/products/{id}/toggle", response_model=ProductSchema)
async def toggle_product(id: int, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product.is_active = not product.is_active
    await db.commit()
    await db.refresh(product)
    return product

# --- ORDER MANAGEMENT ---

ALLOWED_STATUSES = {"NEW", "REVIEWED", "EDITED", "PACKING", "SHIPPED", "CONFIRMED", "CANCELLED"}

@protected_router.get("/orders", response_model=List[OrderSchema])
async def get_orders(
    status_filter: Optional[str] = None, 
    skip: int = 0, 
    limit: int = 50, 
    db: AsyncSession = Depends(get_db)
):
    query = select(Order).options(selectinload(Order.items).selectinload(OrderItem.product)).order_by(Order.created_at.desc())
    if status_filter:
        query = query.where(Order.status == status_filter)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@protected_router.get("/orders/{id}", response_model=OrderSchema)
async def get_order(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).options(selectinload(Order.items).selectinload(OrderItem.product)).where(Order.id == id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@protected_router.patch("/orders/{id}/status", response_model=OrderSchema)
async def update_order_status(id: int, status_update: OrderStatusUpdate, db: AsyncSession = Depends(get_db)):
    if status_update.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {', '.join(ALLOWED_STATUSES)}")
        
    result = await db.execute(select(Order).options(selectinload(Order.items).selectinload(OrderItem.product)).where(Order.id == id))
    order = result.scalars().first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = status_update.status
    if status_update.delivery_cost is not None:
        order.delivery_cost = status_update.delivery_cost
        
    await db.commit()
    await db.refresh(order)
    
    await manager.broadcast("update")
    
    if bot and order.user_id:
        try:
            await bot.send_message(
                chat_id=order.user_id, 
                text=f"📦 Ваше замовлення #{order.order_number} змінило статус на: *{order.status}*",
                parse_mode="Markdown"
            )
        except Exception as e:
            print(f"Failed to send telegram notification: {e}")
            
    return order

from pydantic import BaseModel
class PaymentCardUpdate(BaseModel):
    card_number: str
    master_password: str

@router.get("/settings/payment_card")
async def get_payment_card(db: AsyncSession = Depends(get_db)):
    setting = await db.get(StoreSettings, "payment_card")
    return {"card_number": setting.value if setting else ""}

@protected_router.post("/settings/payment_card")
async def update_payment_card(data: PaymentCardUpdate, db: AsyncSession = Depends(get_db)):
    if data.master_password != settings.MASTER_PASSWORD:
        raise HTTPException(status_code=403, detail="Invalid master password")
        
    setting = await db.get(StoreSettings, "payment_card")
    if not setting:
        setting = StoreSettings(key="payment_card", value=data.card_number)
        db.add(setting)
    else:
        setting.value = data.card_number
    await db.commit()
    return {"status": "success", "card_number": setting.value}

router.include_router(protected_router)

`

## backend\routers\ai.py
`py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from models.order import Order
from models.product import Product
from auth import get_current_admin
from config import settings

router = APIRouter(dependencies=[Depends(get_current_admin)])

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

class DescriptionRequest(BaseModel):
    name: str

class CategorySuggestRequest(BaseModel):
    name: str
    categories: List[str]

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

async def call_groq(messages: list, model: str = "llama-3.1-8b-instant", temperature: float = 0.7):
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": messages,
                "temperature": temperature
            },
            timeout=30.0
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Groq API Error: {response.text}")
        
        data = response.json()
        return data["choices"][0]["message"]["content"]

@router.post("/generate-description")
async def generate_description(req: DescriptionRequest):
    prompt = f"Згенеруй короткий, привабливий та смачний опис для товару '{req.name}' в інтернет-магазин. Використовуй емодзі. Максимум 3-4 речення. Тільки опис, нічого зайвого."
    messages = [
        {"role": "system", "content": "Ти професійний копірайтер для магазину крафтової їжі, який продає варених раків, м'ясні делікатеси, морепродукти та закуски. Твоя ціль - викликати апетит у покупця."},
        {"role": "user", "content": prompt}
    ]
    description = await call_groq(messages)
    return {"description": description}

@router.post("/suggest-category")
async def suggest_category(req: CategorySuggestRequest):
    if not req.categories:
        return {"category": ""}
    
    prompt = f"У мене є товар '{req.name}'. В яку з цих категорій його найкраще помістити: {', '.join(req.categories)}? Напиши ТІЛЬКИ назву категорії з цього списку, без лапок і без пояснень."
    messages = [
        {"role": "user", "content": prompt}
    ]
    category = await call_groq(messages, temperature=0.1)
    category = category.strip('\'" .').strip()
    return {"category": category}

@router.post("/chat")
async def ai_chat(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    # Gather some basic stats for context
    orders_query = await db.execute(select(Order))
    orders = orders_query.scalars().all()
    
    products_query = await db.execute(select(Product))
    products = products_query.scalars().all()
    
    total_revenue = sum(o.total_price for o in orders if o.status != "CANCELLED")
    active_orders = len([o for o in orders if o.status in ["NEW", "REVIEWED", "EDITED", "PACKING", "SHIPPED"]])
    
    stats_text = (
        f"Статистика магазину:\n"
        f"- Всього товарів: {len(products)}\n"
        f"- Всього замовлень: {len(orders)}\n"
        f"- Активних замовлень: {active_orders}\n"
        f"- Загальний дохід (не скасовані): {total_revenue} грн\n"
    )
    
    system_msg = {
        "role": "system", 
        "content": (
            "Ти особистий ШІ-асистент (аналітик) для власника інтернет-магазину VreBRO. "
            "Ти спілкуєшся з власником, допомагаєш йому аналізувати бізнес, даєш поради та підтримуєш позитивний настрій. "
            "Відповідай коротко, по ділу, українською мовою. "
            "Ось поточна інформація про магазин, на яку ти можеш спиратися:\n" + stats_text
        )
    }
    
    messages = [system_msg] + [{"role": m.role, "content": m.content} for m in req.messages]
    
    reply = await call_groq(messages)
    return {"reply": reply}

`

## backend\routers\catalog.py
`py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from sqlalchemy import or_

from database import get_db
from models.product import Category, Product
from schemas.product_schema import CategorySchema, ProductSchema

router = APIRouter()

@router.get("/categories", response_model=List[CategorySchema])
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.sort_order))
    return result.scalars().all()

@router.get("/products", response_model=List[ProductSchema])
async def get_products(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(Product).where(Product.is_active == True)
    
    if category_id:
        query = query.where(Product.category_id == category_id)
        
    if search:
        query = query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%")
            )
        )
        
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/products/{id}", response_model=ProductSchema)
async def get_product(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == id, Product.is_active == True))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or inactive")
    return product

`

## backend\routers\orders.py
`py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_db
from models.order import Order, OrderItem
from models.product import Product
from schemas.order_schema import OrderSchema, OrderCreate
import uuid
from config import settings
from bot import bot
from websocket_manager import manager

router = APIRouter()

@router.post("/", response_model=OrderSchema, status_code=status.HTTP_201_CREATED)
async def create_order(order_data: OrderCreate, db: AsyncSession = Depends(get_db)):
    if not order_data.items:
        raise HTTPException(status_code=400, detail="Order must have items")
        
    total_price = 0.0
    validated_items = []
    
    for item in order_data.items:
        product = await db.get(Product, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} is inactive")
            
        actual_price = product.promo_price if product.is_promo and product.promo_price is not None else product.price
        validated_items.append({
            "product_id": item.product_id,
            "product_name": product.name,
            "quantity": item.quantity,
            "price_at_purchase": actual_price
        })
        total_price += actual_price * item.quantity

    from models.user import User
    
    # Upsert user
    user = await db.get(User, order_data.user_id)
    if not user:
        user = User(telegram_id=order_data.user_id, first_name=order_data.customer_name)
        db.add(user)
        await db.flush()
        
    order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    
    new_order = Order(
        user_id=order_data.user_id,
        order_number=order_number,
        total_price=total_price,
        customer_name=order_data.customer_name,
        phone=order_data.phone,
        address=order_data.address,
        comment=order_data.comment,
        status="NEW"
    )
    db.add(new_order)
    await db.flush() # To get the new_order.id
    
    for item_data in validated_items:
        new_item = OrderItem(
            order_id=new_order.id,
            product_id=item_data["product_id"],
            product_name=item_data["product_name"],
            quantity=item_data["quantity"],
            price_at_purchase=item_data["price_at_purchase"]
        )
        db.add(new_item)
        
    await db.commit()
    await db.refresh(new_order)
    
    await manager.broadcast("update")
    
    if bot and settings.ADMIN_CHAT_ID:
        try:
            items_text = "\n".join([f"- {i['product_name']} x{i['quantity']} ({i['price_at_purchase']} грн)" for i in validated_items])
            msg = f"🚨 **НОВЕ ЗАМОВЛЕННЯ {new_order.order_number}**\n\n" \
                  f"👤 Ім'я: {new_order.customer_name}\n" \
                  f"📞 Тел: {new_order.phone}\n" \
                  f"📍 Адреса: {new_order.address}\n" \
                  f"💬 Комент: {new_order.comment or '-'}\n\n" \
                  f"🛒 Товари:\n{items_text}\n\n" \
                  f"💰 Сума: **{new_order.total_price} грн**"
            await bot.send_message(chat_id=settings.ADMIN_CHAT_ID, text=msg, parse_mode="Markdown")
        except Exception as e:
            print(f"Failed to send admin notification: {e}")
    
    # Eager load the items for the response
    from sqlalchemy.orm import selectinload
    from sqlalchemy.future import select
    result = await db.execute(select(Order).options(selectinload(Order.items).selectinload(OrderItem.product)).where(Order.id == new_order.id))
    return result.scalars().first()

@router.get("/user/{user_id}", response_model=List[OrderSchema])
async def get_user_orders(user_id: int, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.orm import selectinload
    from sqlalchemy.future import select
    
    query = select(Order).options(selectinload(Order.items).selectinload(OrderItem.product)).where(Order.user_id == user_id).order_by(Order.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

`

## backend\routers\__init__.py
`py
# Routers module

`

## backend\schemas\order_schema.py
`py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from .product_schema import ProductSchema

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: float = Field(..., gt=0)

class OrderCreate(BaseModel):
    user_id: int
    customer_name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=1, max_length=30)
    address: str = Field(..., min_length=1, max_length=255)
    comment: Optional[str] = Field(default="", max_length=1000)
    items: List[OrderItemCreate]

class OrderStatusUpdate(BaseModel):
    status: str
    delivery_cost: Optional[float] = None

class OrderItemSchema(BaseModel):
    id: int
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    quantity: float
    price_at_purchase: float
    product: Optional[ProductSchema] = None

    class Config:
        from_attributes = True

class OrderSchema(BaseModel):
    id: int
    user_id: Optional[int] = None
    order_number: str
    status: str
    total_price: float
    delivery_cost: float = 0.0
    customer_name: str
    phone: str
    address: str
    comment: Optional[str] = None
    created_at: datetime
    items: List[OrderItemSchema] = []

    class Config:
        from_attributes = True

`

## backend\schemas\product_schema.py
`py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    icon: Optional[str] = Field(default=None, max_length=100)
    sort_order: int = 0

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategorySchema(CategoryBase):
    id: int

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    category_id: int
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: float = Field(..., gt=0)
    image_url: Optional[str] = Field(default=None, max_length=255)
    is_active: Optional[bool] = True
    is_promo: Optional[bool] = False
    promo_price: Optional[float] = Field(default=None, gt=0)
    is_weighted: Optional[bool] = False
    weight_step: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductSchema(ProductBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

`

## miniapp\miniapp_bot.py
`py
import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import Message, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton

import os
TOKEN = os.getenv("BOT_TOKEN", "")
WEB_APP_URL = os.getenv("WEB_APP_URL", "")

logging.basicConfig(level=logging.INFO)

bot = Bot(token=TOKEN)
dp = Dispatcher()

@dp.message(CommandStart())
async def cmd_start(message: Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="🔥 Відкрити меню для замовлення",
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ])
    await message.answer(
        "Вітаємо у **VreBRO Mini App**!\nНатисніть кнопку нижче, щоб відкрити преміальне меню 🥩🦐",
        reply_markup=keyboard,
        parse_mode="Markdown"
    )

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())

`

## miniapp\backend\main.py
`py
import sys
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add the bot directory to path so we can import its models and DB config
bot_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../vrebro_bot'))
sys.path.append(bot_path)

from routes import catalog, orders, favorites, admin

app = FastAPI(title="VreBRO Mini App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(catalog.router, prefix="/api/catalog", tags=["Catalog"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(favorites.router, prefix="/api/favorites", tags=["Favorites"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
def root():
    return {"status": "ok", "message": "VreBRO Mini App API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

`

## miniapp\backend\schemas.py
`py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CategorySchema(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None
    sort_order: int

    class Config:
        from_attributes = True

class ProductSchema(BaseModel):
    id: int
    category_id: int
    name: str
    description: Optional[str] = None
    price: float
    product_type: str
    photo_id: Optional[str] = None
    stock_quantity: int
    views_count: int
    rating: float
    is_active: bool

    class Config:
        from_attributes = True
        
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: float
    price_at_purchase: float

class OrderCreate(BaseModel):
    user_id: int
    customer_name: str
    phone: str
    address: str
    comment: Optional[str] = ""
    items: List[OrderItemCreate]
    total_price: float
    
class OrderItemSchema(BaseModel):
    id: int
    product_id: int
    quantity: float
    price_at_purchase: float
    product: Optional[ProductSchema] = None

    class Config:
        from_attributes = True

class OrderSchema(BaseModel):
    id: int
    user_id: int
    order_number: str
    status: str
    total_price: float
    created_at: datetime
    items: List[OrderItemSchema] = []

    class Config:
        from_attributes = True

`

## miniapp\backend\routes\admin.py
`py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.engine import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from schemas import OrderSchema
from pydantic import BaseModel
from typing import List

router = APIRouter()

class OrderItemUpdate(BaseModel):
    id: int
    quantity: float

class OrderUpdate(BaseModel):
    status: str
    items: List[OrderItemUpdate]

@router.get("/orders", response_model=List[OrderSchema])
def get_admin_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return orders

@router.put("/orders/{order_id}", response_model=OrderSchema)
def update_order(order_id: int, update_data: OrderUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update status
    order.status = update_data.status
    
    # Update items weight/quantity and recalculate total
    new_total = 0
    for update_item in update_data.items:
        db_item = db.query(OrderItem).filter(OrderItem.id == update_item.id, OrderItem.order_id == order_id).first()
        if db_item:
            db_item.quantity = update_item.quantity
            new_total += db_item.quantity * db_item.price_at_purchase
            
    order.total_price = new_total
    
    db.commit()
    db.refresh(order)
    return order

`

## miniapp\backend\routes\catalog.py
`py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from database.engine import async_session_maker
from app.repositories.product import ProductRepository, CategoryRepository
from schemas import ProductSchema, CategorySchema

router = APIRouter()

async def get_db():
    async with async_session_maker() as session:
        yield session

@router.get("/categories", response_model=List[CategorySchema])
async def get_categories(db = Depends(get_db)):
    repo = CategoryRepository(db)
    categories = await repo.get_all()
    return categories

@router.get("/products", response_model=List[ProductSchema])
async def get_products(category_id: int = None, db = Depends(get_db)):
    repo = ProductRepository(db)
    if category_id:
        products = await repo.get_by_category(category_id)
    else:
        products = await repo.get_all()
    return products

@router.get("/products/{product_id}", response_model=ProductSchema)
async def get_product(product_id: int, db = Depends(get_db)):
    repo = ProductRepository(db)
    product = await repo.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.views_count += 1
    await db.commit()
    return product

`

## miniapp\backend\routes\favorites.py
`py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.future import select
from sqlalchemy import delete
from database.engine import async_session_maker
from app.models.favorite import Favorite
from app.models.product import Product
from schemas import ProductSchema
from pydantic import BaseModel

router = APIRouter()

async def get_db():
    async with async_session_maker() as session:
        yield session

class FavoriteRequest(BaseModel):
    user_id: int
    product_id: int

@router.get("/{user_id}", response_model=List[ProductSchema])
async def get_favorites(user_id: int, db = Depends(get_db)):
    stmt = select(Product).join(Favorite, Favorite.product_id == Product.id).where(Favorite.user_id == user_id)
    result = await db.execute(stmt)
    products = result.scalars().all()
    return products

@router.post("/")
async def add_favorite(req: FavoriteRequest, db = Depends(get_db)):
    stmt = select(Favorite).where(Favorite.user_id == req.user_id, Favorite.product_id == req.product_id)
    result = await db.execute(stmt)
    if result.scalars().first():
        return {"status": "already added"}
        
    fav = Favorite(user_id=req.user_id, product_id=req.product_id)
    db.add(fav)
    await db.commit()
    return {"status": "added"}

@router.delete("/")
async def remove_favorite(req: FavoriteRequest, db = Depends(get_db)):
    stmt = delete(Favorite).where(Favorite.user_id == req.user_id, Favorite.product_id == req.product_id)
    await db.execute(stmt)
    await db.commit()
    return {"status": "removed"}

`

## miniapp\backend\routes\orders.py
`py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from database.engine import async_session_maker
from app.repositories.order import OrderRepository
from app.models.order import Order, OrderItem
from schemas import OrderCreate, OrderSchema
import datetime

router = APIRouter()

async def get_db():
    async with async_session_maker() as session:
        yield session

@router.post("/", response_model=OrderSchema)
async def create_order(order_data: OrderCreate, db = Depends(get_db)):
    repo = OrderRepository(db)
    
    order = Order(
        user_id=order_data.user_id,
        order_number=f"M-{int(datetime.datetime.now().timestamp())}",
        status="NEW",
        total_price=order_data.total_price
    )
    
    db.add(order)
    await db.commit()
    await db.refresh(order)
    
    for item in order_data.items:
        db_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_purchase=item.price_at_purchase
        )
        db.add(db_item)
    
    await db.commit()
    await db.refresh(order)
    
    return order

@router.get("/{user_id}", response_model=List[OrderSchema])
async def get_user_orders(user_id: int, db = Depends(get_db)):
    repo = OrderRepository(db)
    # the existing repo might not have get_by_user_id with eager loading items
    # let's just use existing or query directly
    orders = await repo.get_user_orders(user_id)
    return orders

`

## miniapp\backend\routes\__init__.py
`py
# init

`

## miniapp\frontend\.oxlintrc.json
`json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}

`

## miniapp\frontend\index.html
`html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preload" href="/splash-bg-new.png" as="image" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <title>VreBRO</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

`

## miniapp\frontend\package.json
`json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/postcss": "^4.3.3",
    "@twa-dev/sdk": "^8.0.2",
    "autoprefixer": "^10.5.4",
    "axios": "^1.19.0",
    "clsx": "^2.1.1",
    "framer-motion": "^13.0.0",
    "lucide-react": "^1.28.0",
    "postcss": "^8.5.25",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.2",
    "tailwind-merge": "^3.6.0",
    "tailwindcss": "^4.3.3",
    "zustand": "^5.0.14"
  },
  "devDependencies": {
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.4",
    "oxlint": "^1.75.0",
    "typescript": "~6.0.2",
    "vite": "^8.2.0"
  }
}

`

## miniapp\frontend\tsconfig.app.json
`json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "allowArbitraryExtensions": true,
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}

`

## miniapp\frontend\tsconfig.json
`json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}

`

## miniapp\frontend\tsconfig.node.json
`json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023"],
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "module": "nodenext",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}

`

## miniapp\frontend\vite.config.ts
`ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  preview: {
    allowedHosts: true,
    port: 5173
  }
})

`

## miniapp\frontend\src\App.css
`css
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}

`

## miniapp\frontend\src\App.tsx
`tsx
import React, { useEffect, Suspense } from 'react';
import WebApp from '@twa-dev/sdk';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import { Home as HomeIcon, LayoutGrid, ShoppingCart } from 'lucide-react';
import clsx from 'clsx';
import LoadingScreen from './components/LoadingScreen';
import { useCartStore } from './store/cartStore';

const Catalog = React.lazy(() => import('./pages/Catalog'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const MyOrders = React.lazy(() => import('./pages/MyOrders'));

import { User } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const totalCount = useCartStore((state) => state.getTotalCount());

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-brand-gray border-t border-gray-800 flex justify-around items-center h-16 z-50">
      <Link to="/" className={clsx("flex flex-col items-center transition-colors", isActive('/') ? "text-brand-orange" : "text-gray-400 hover:text-brand-orange")}>
        <HomeIcon size={20} />
        <span className="text-[10px] mt-1">Головна</span>
      </Link>
      <Link to="/catalog" className={clsx("flex flex-col items-center transition-colors", isActive('/catalog') ? "text-brand-orange" : "text-gray-400 hover:text-brand-orange")}>
        <LayoutGrid size={20} />
        <span className="text-[10px] mt-1">Каталог</span>
      </Link>
      <Link to="/cart" className={clsx("relative flex flex-col items-center transition-colors", isActive('/cart') ? "text-brand-orange" : "text-gray-400 hover:text-brand-orange")}>
        <ShoppingCart size={20} />
        <span className="text-[10px] mt-1">Кошик</span>
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {totalCount}
          </span>
        )}
      </Link>
      <Link to="/my-orders" className={clsx("flex flex-col items-center transition-colors", isActive('/my-orders') ? "text-brand-orange" : "text-gray-400 hover:text-brand-orange")}>
        <User size={20} />
        <span className="text-[10px] mt-1">Профіль</span>
      </Link>
    </nav>
  );
}

function App() {
  useEffect(() => {
    try {
      if (WebApp && typeof WebApp.ready === 'function') {
        WebApp.ready();
        WebApp.expand();
      }
    } catch (e) {
      console.warn("Not inside Telegram Web App");
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-brand-dark text-white pb-16 font-sans relative">
        <LoadingScreen />
        <main className="flex-grow overflow-x-hidden">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/my-orders" element={<MyOrders />} />
            </Routes>
          </Suspense>
        </main>
        <Navigation />
      </div>
    </BrowserRouter>
  );
}

export default App;

`

## miniapp\frontend\src\index.css
`css
@import "tailwindcss";

@theme {
  --color-brand-orange: #F97316;
  --color-brand-red: #DC2626;
  --color-brand-dark: #111111;
  --color-brand-gray: #222222;
}
body {
  background-color: #111111;
  color: white;
}

`

## miniapp\frontend\src\main.tsx
`tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

`

## miniapp\frontend\src\api\index.ts
`ts
import axios from 'axios';

// Since we have Vite proxy configured, we can just use /api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Category {
  id: number;
  name: string;
  icon?: string;
  sort_order: number;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active: boolean;
}

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
}

export interface OrderCreate {
  user_id: number;
  customer_name: string;
  phone: string;
  address: string;
  comment?: string;
  items: OrderItemCreate[];
}

export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get('/catalog/categories');
  return data;
};

export const fetchProducts = async (categoryId?: number): Promise<Product[]> => {
  const params = categoryId ? { category_id: categoryId } : {};
  const { data } = await api.get('/catalog/products', { params });
  return data;
};

export const fetchProduct = async (id: number): Promise<Product> => {
  const { data } = await api.get(`/catalog/products/${id}`);
  return data;
};

export const createOrder = async (order: OrderCreate): Promise<any> => {
  const { data } = await api.post('/orders/', order);
  return data;
};

export const fetchUserOrders = async (userId: number): Promise<any[]> => {
  const { data } = await api.get(`/orders/user/${userId}`);
  return data;
};

export const fetchPaymentCard = async (): Promise<string> => {
  const { data } = await api.get('/admin/settings/payment_card');
  return data.card_number;
};

export default api;

`

## miniapp\frontend\src\components\LoadingScreen.css
`css
.loading-screen-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: #0c0c0c;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-image: url('/splash-bg-new.png');
  background-size: cover;
  background-position: center;
  /* Safe area support */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  
  /* Fade out transition: 300ms */
  transition: opacity 0.3s ease-out, visibility 0.3s ease-out;
  will-change: opacity;
}

.loading-screen-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.loading-screen-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  position: relative;
  z-index: 10;
}

/* Background overlay to ensure text is readable */
.loading-screen-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(12,12,12,1) 0%, rgba(12,12,12,0.5) 40%, rgba(12,12,12,0.9) 100%);
  z-index: 1;
}

/* Logo with glow */
.loading-logo {
  font-size: 5rem;
  line-height: 1;
  font-weight: 900;
  text-transform: uppercase;
  font-style: italic;
  font-family: 'Impact', sans-serif;
  color: #fff;
  text-align: center;
  margin-bottom: 3rem;
  /* Orange glow */
  text-shadow: 0 0 20px rgba(249, 115, 22, 0.6), 0 0 40px rgba(220, 38, 38, 0.4);
  /* Slow glowing animation */
  animation: logo-glow 2.5s infinite alternate ease-in-out;
  will-change: filter, transform;
}

.loading-logo span {
  display: block;
  color: #f97316; /* brand-orange */
}

@keyframes logo-glow {
  0% {
    filter: brightness(1) drop-shadow(0 0 10px rgba(249, 115, 22, 0.4));
    transform: scale(0.98);
  }
  100% {
    filter: brightness(1.2) drop-shadow(0 0 25px rgba(249, 115, 22, 0.9));
    transform: scale(1.02);
  }
}

/* Loading text container */
.loading-text-container {
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
}

.loading-text {
  font-size: 1.125rem;
  font-weight: 700;
  color: #f3f4f6;
  text-align: center;
  position: absolute;
  width: 100%;
}

.loading-text-animate {
  /* Exactly 700ms per text change as requested */
  animation: fade-text 0.7s ease-in-out forwards;
  will-change: opacity, transform;
}

@keyframes fade-text {
  0% { opacity: 0; transform: translateY(8px); }
  15% { opacity: 1; transform: translateY(0); }
  85% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-8px); }
}

/* Embers particles using pure CSS - GPU friendly */
.ember-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 2;
  pointer-events: none;
}

.ember {
  position: absolute;
  bottom: -20px;
  background-color: #f97316;
  border-radius: 50%;
  box-shadow: 0 0 8px 2px rgba(249, 115, 22, 0.8);
  filter: blur(0.5px);
  animation: float-up linear infinite;
  will-change: transform, opacity;
}

@keyframes float-up {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.9;
  }
  80% {
    opacity: 0.9;
  }
  100% {
    /* Safe to assume a large negative Y for all devices */
    transform: translateY(-110vh) translateX(30px) scale(0.3);
    opacity: 0;
  }
}

/* Embers configuration */
.ember:nth-child(1) { left: 10%; width: 4px; height: 4px; animation-duration: 4s; animation-delay: 0s; }
.ember:nth-child(2) { left: 30%; width: 6px; height: 6px; animation-duration: 5.5s; animation-delay: 1.5s; }
.ember:nth-child(3) { left: 50%; width: 3px; height: 3px; animation-duration: 3.5s; animation-delay: 0.5s; }
.ember:nth-child(4) { left: 70%; width: 5px; height: 5px; animation-duration: 4.8s; animation-delay: 2s; }
.ember:nth-child(5) { left: 90%; width: 7px; height: 7px; animation-duration: 6s; animation-delay: 1s; }
.ember:nth-child(6) { left: 15%; width: 5px; height: 5px; animation-duration: 5s; animation-delay: 2.5s; }
.ember:nth-child(7) { left: 45%; width: 4px; height: 4px; animation-duration: 4.2s; animation-delay: 3s; }
.ember:nth-child(8) { left: 65%; width: 6px; height: 6px; animation-duration: 6.5s; animation-delay: 0.8s; }
.ember:nth-child(9) { left: 85%; width: 3px; height: 3px; animation-duration: 3.8s; animation-delay: 2.2s; }
.ember:nth-child(10){ left: 25%; width: 5px; height: 5px; animation-duration: 5.2s; animation-delay: 1.2s; }

`

## miniapp\frontend\src\components\LoadingScreen.tsx
`tsx
import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

const LOADING_MESSAGES = [
  "🔥 Розпалюємо мангал...",
  "🥩 Готуємо свіже м'ясо...",
  "🍖 Майже готово..."
];

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // 700ms interval for changing text
    const textInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 700);

    // Simulate completion after enough time to see all messages
    const loadTimeout = setTimeout(() => {
      setLoading(false);
    }, 2800);

    return () => {
      clearInterval(textInterval);
      clearTimeout(loadTimeout);
    };
  }, []);

  return (
    <div className={`loading-screen-overlay ${!loading ? 'loading-screen-hidden' : ''}`}>
      {/* Ember particles */}
      <div className="ember-container">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="ember" />
        ))}
      </div>
      
      <div className="loading-screen-content">
        <h1 className="loading-logo">
          В
          <span>Ребро</span>
        </h1>
        
        <div className="loading-text-container">
          <div key={messageIndex} className="loading-text loading-text-animate">
             {LOADING_MESSAGES[messageIndex]}
          </div>
        </div>
      </div>
    </div>
  );
}

`

## miniapp\frontend\src\components\ProductCard.tsx
`tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../api';
import { useCartStore } from '../store/cartStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-700/50 relative group flex flex-col">
      <Link to={`/product/${product.id}`} className="block relative h-40 bg-gray-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition duration-300 z-10" />
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover relative z-0" />
        ) : (
          <span className="text-gray-500 text-xs z-10 relative">Фото</span>
        )}
        
      </Link>
      
      <div className="p-4 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-bold text-white mb-1 leading-tight line-clamp-1">{product.name}</h3>
        </Link>
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {product.description || "Опис відсутній"}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-700/50">
          <div>
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              {product.price.toLocaleString('uk-UA')}
            </span>
            <span className="text-xs text-gray-400 ml-1">
              грн
            </span>
          </div>
          <button 
            onClick={handleAddToCart}
            className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-lg hover:bg-orange-500 active:scale-95 transition-transform"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

`

## miniapp\frontend\src\pages\Cart.tsx
`tsx
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

`

## miniapp\frontend\src\pages\Catalog.tsx
`tsx
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

`

## miniapp\frontend\src\pages\Checkout.tsx
`tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { useCartStore } from '../store/cartStore';
import { createOrder, type OrderCreate } from '../api';

export default function Checkout() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    comment: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (items.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (formData.name.trim().length < 2) {
      setError("Введіть коректне ім'я");
      return;
    }
    if (formData.phone.trim().length < 10) {
      setError("Введіть коректний номер телефону");
      return;
    }
    if (formData.address.trim().length < 5) {
      setError("Введіть повну адресу доставки");
      return;
    }

    try {
      setLoading(true);
      
      const orderPayload: OrderCreate = {
        user_id: WebApp.initDataUnsafe?.user?.id || 1,
        customer_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        comment: formData.comment || "",
        total_price: getTotalPrice(),
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      };

      await createOrder(orderPayload);
      
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError("Не вдалося завантажити дані. Сервер не відповідає. Спробуйте ще раз.");
      } else {
        const detail = err.response?.data?.detail;
        const msg = Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ') : (detail || err.message);
        setError(`Помилка: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4 pb-24 text-white text-center">
        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-black mb-2">Замовлення прийнято!</h2>
        <p className="text-gray-400 mb-8">Ми зв'яжемося з вами найближчим часом для підтвердження деталей.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-gray-800 rounded-xl font-bold text-white w-full"
        >
          НА ГОЛОВНУ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 pt-6 pb-8 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-900 rounded-full">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-black">Оформлення</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-1 ml-1">Ім'я</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ваше ім'я"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-orange transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 mb-1 ml-1">Телефон</label>
          <input 
            type="tel" 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+38 (000) 000-00-00"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-orange transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 mb-1 ml-1">Адреса доставки</label>
          <input 
            type="text" 
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Вулиця, будинок, квартира"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-orange transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 mb-1 ml-1">Коментар (необов'язково)</label>
          <textarea 
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Деталі до замовлення..."
            rows={3}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-orange transition-colors resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        <div className="pt-6">
          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-400 font-bold">До сплати:</span>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-black text-white">{getTotalPrice().toLocaleString('uk-UA')}</span>
              <span className="text-brand-orange font-bold mb-1">грн</span>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-lg text-white shadow-lg transition-all ${
              loading 
                ? 'bg-gray-700 text-gray-400' 
                : 'bg-gradient-to-r from-brand-orange to-red-500 shadow-brand-orange/20 active:scale-[0.98]'
            }`}
          >
            {loading ? 'ВІДПРАВКА...' : 'ПІДТВЕРДИТИ'}
          </button>
        </div>
      </form>
    </div>
  );
}

`

## miniapp\frontend\src\pages\Home.tsx
`tsx
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

`

## miniapp\frontend\src\pages\MyOrders.tsx
`tsx
import React, { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { fetchUserOrders, fetchPaymentCard } from '../api';
import { Package, CreditCard, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const statusLabels: Record<string, string> = {
  NEW: 'Не розглянуто',
  REVIEWED: 'Розглянуто',
  EDITED: 'Відредаговано',
  PACKING: 'Упаковується',
  SHIPPED: 'Відправлено',
  CONFIRMED: 'Підтверджено'
};

const statusColors: Record<string, string> = {
  NEW: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  REVIEWED: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  EDITED: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  PACKING: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  SHIPPED: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  CONFIRMED: 'text-green-500 bg-green-500/10 border-green-500/20'
};

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentCard, setPaymentCard] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        let userId = 1; // Default for testing outside telegram
        if (WebApp && WebApp.initDataUnsafe?.user?.id) {
          userId = WebApp.initDataUnsafe.user.id;
        }

        const [ordersData, cardData] = await Promise.all([
          fetchUserOrders(userId),
          fetchPaymentCard()
        ]);
        setOrders(ordersData);
        setPaymentCard(cardData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-gray-400 mt-20">Завантаження...</div>;
  }

  return (
    <div className="p-4 safe-bottom">
      <h1 className="text-2xl font-bold mb-6 mt-4">Мої замовлення</h1>
      
      {orders.length === 0 ? (
        <div className="text-center text-gray-400 mt-20 flex flex-col items-center">
          <Package size={48} className="mb-4 opacity-50" />
          <p>У вас ще немає замовлень</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={order.id} 
              className="bg-brand-gray p-4 rounded-2xl border border-gray-800"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">Замовлення #{order.order_number}</h3>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('uk-UA')}</p>
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-bold border ${statusColors[order.status] || 'text-gray-400 border-gray-700 bg-gray-800'}`}>
                  {statusLabels[order.status] || order.status}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-300 line-clamp-1 flex-1 pr-2">{item.product?.name || 'Товар'}</span>
                    <span className="text-gray-400 whitespace-nowrap">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-3 flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">Сума:</span>
                <span className="font-medium text-white">{order.total_price} грн</span>
              </div>
              
              {order.delivery_cost > 0 && (
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-400">Доставка:</span>
                  <span className="font-medium text-white">+{order.delivery_cost} грн</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-300">Всього до сплати:</span>
                <span className="font-black text-brand-orange text-lg">{order.total_price + (order.delivery_cost || 0)} грн</span>
              </div>

              {/* Show payment info if not NEW, meaning admin has reviewed it */}
              {order.status !== 'NEW' && order.status !== 'CONFIRMED' && paymentCard && (
                <div className="mt-4 bg-black/40 p-3 rounded-xl border border-brand-orange/30">
                  <h4 className="text-xs font-bold text-brand-orange flex items-center gap-1 mb-2">
                    <CreditCard size={14} /> Оплатіть замовлення:
                  </h4>
                  <div className="text-center font-mono text-lg tracking-widest bg-black p-2 rounded-lg border border-gray-800 mb-2 select-all">
                    {paymentCard}
                  </div>
                  <p className="text-[10px] text-gray-400 text-center">Після оплати статус зміниться автоматично</p>
                </div>
              )}
              
              {order.status === 'CONFIRMED' && (
                <div className="mt-4 bg-green-500/10 p-3 rounded-xl border border-green-500/30 flex items-center justify-center gap-2 text-green-500">
                  <Check size={16} />
                  <span className="text-xs font-bold">Оплачено та завершено</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

`

## miniapp\frontend\src\pages\ProductDetail.tsx
`tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProduct, type Product } from '../api';
import { useCartStore } from '../store/cartStore';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const addItem = useCartStore(state => state.addItem);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (id) {
        const prod = await fetchProduct(Number(id));
        setProduct(prod);
      }
    } catch (err) {
      setError('Не вдалося завантажити дані');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center text-white px-4">
        <p className="text-gray-400 mb-6">{error || 'Товар не знайдено'}</p>
        <div className="flex gap-4">
          <button 
            onClick={loadData} 
            className="px-6 py-2 bg-gray-800 text-brand-orange rounded-full font-bold border border-gray-700 active:scale-95 transition-transform"
          >
            Спробувати ще раз
          </button>
          <button 
            onClick={() => navigate(-1)} 
            className="px-6 py-2 bg-brand-orange text-white rounded-full font-bold active:scale-95 transition-transform"
          >
            Повернутися
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header with Back Button */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={() => navigate(-1)}
          className="bg-black/50 backdrop-blur-md p-2 rounded-full border border-gray-700/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="relative h-80 w-full bg-gray-900 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-500">Фото відсутнє</span>
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 -mt-10 relative z-10">
        <div className="flex justify-between items-end mb-2">
        </div>
        
        <h1 className="text-3xl font-black mb-2 leading-tight">{product.name}</h1>
        
        <div className="flex items-end gap-2 mb-6">
          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-red-500">
            {product.price.toLocaleString('uk-UA')}
          </span>
          <span className="text-xl text-gray-400 mb-1">
            грн
          </span>
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 mb-6 border border-gray-800">
          <h3 className="font-bold text-gray-300 mb-2">Опис</h3>
          <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
            {product.description || "Опис відсутній"}
          </p>
        </div>

        {/* Add to Cart Section */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex items-center justify-between">
          <button 
            onClick={() => {
              addItem(product);
            }}
            className="w-full py-4 bg-gradient-to-r from-brand-orange to-red-500 rounded-xl font-black text-lg text-white shadow-lg shadow-brand-orange/20 active:scale-[0.98] transition-transform"
          >
            ДОДАТИ В КОШИК
          </button>
        </div>
      </div>
    </div>
  );
}

`

## miniapp\frontend\src\store\cartStore.ts
`ts
import { create } from 'zustand';
import type { Product } from '../api';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.product.id === product.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { items: [...state.items, { product, quantity: 1 }] };
    });
  },
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },
  increaseQuantity: (productId) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ),
    }));
  },
  decreaseQuantity: (productId) => {
    set((state) => ({
      items: state.items
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0),
    }));
  },
  clearCart: () => set({ items: [] }),
  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },
  getTotalCount: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  },
}));

`

