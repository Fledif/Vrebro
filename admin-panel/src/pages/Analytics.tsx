import { useState, useEffect } from 'react';
import { api } from '../api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp, ShoppingBag, Users, DollarSign, Package } from 'lucide-react';

interface Summary {
  today: { count: number; revenue: number; avg_check: number };
  week: { count: number; revenue: number; avg_check: number };
  month: { count: number; revenue: number; avg_check: number };
  total_customers: number;
}

interface TopProduct {
  name: string;
  qty: number;
  orders: number;
}

interface ChartPoint {
  date: string;
  revenue: number;
}

const ORANGE = '#FF5100';

export default function Analytics() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, topRes, chartRes] = await Promise.all([
          api.get('/admin/analytics/summary'),
          api.get('/admin/analytics/top_products'),
          api.get('/admin/analytics/revenue_chart'),
        ]);
        setSummary(sumRes.data);
        setTopProducts(topRes.data);
        setChart(chartRes.data);
      } catch (err) {
        console.error('Analytics load error', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const currentPeriod = summary ? summary[period] : null;
  const maxQty = Math.max(...topProducts.map(p => p.qty), 1);

  const StatCard = ({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub?: string; icon: any; color: string }) => (
    <div className="bg-[var(--color-surface)] border border-neutral-800 rounded-2xl p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`} style={{ backgroundColor: `${color}15` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-neutral-400 text-sm">{label}</p>
        <p className="text-2xl font-black text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-neutral-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <TrendingUp className="text-brand-orange" size={32} />
          Аналітика
        </h1>
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${period === p ? 'bg-brand-orange text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}
            >
              {{ today: 'Сьогодні', week: 'Тиждень', month: 'Місяць' }[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Замовлень"
          value={String(currentPeriod?.count ?? 0)}
          icon={ShoppingBag}
          color="#FF5100"
        />
        <StatCard
          label="Виручка"
          value={`${(currentPeriod?.revenue ?? 0).toLocaleString('uk-UA')} ₴`}
          icon={DollarSign}
          color="#22c55e"
        />
        <StatCard
          label="Середній чек"
          value={`${(currentPeriod?.avg_check ?? 0).toFixed(0)} ₴`}
          icon={TrendingUp}
          color="#a855f7"
        />
        <StatCard
          label="Всього клієнтів"
          value={String(summary?.total_customers ?? 0)}
          icon={Users}
          color="#3b82f6"
        />
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="col-span-2 bg-[var(--color-surface)] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-base font-bold mb-6">Виручка за 30 днів</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chart} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#666', fontSize: 10 }}
                tickLine={false}
                interval={4}
              />
              <YAxis tick={{ fill: '#666', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                formatter={(v: number) => [`${v.toFixed(0)} ₴`, 'Виручка']}
              />
              <Line type="monotone" dataKey="revenue" stroke={ORANGE} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: ORANGE }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-[var(--color-surface)] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-base font-bold mb-5 flex items-center gap-2">
            <Package size={18} className="text-brand-orange" /> Топ товарів
          </h3>
          {topProducts.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center mt-10">Дані відсутні</p>
          ) : (
            <div className="space-y-3">
              {topProducts.slice(0, 8).map((p, i) => (
                <div key={p.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-white truncate flex-1 pr-2">{p.name}</span>
                    <span className="text-xs text-brand-orange font-bold whitespace-nowrap">{p.qty} шт</span>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(p.qty / maxQty) * 100}%`,
                        background: i === 0 ? ORANGE : `rgba(255,81,0,${0.7 - i * 0.07})`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bar chart by period */}
      <div className="bg-[var(--color-surface)] border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-base font-bold mb-6">Розподіл виручки по днях</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chart.slice(-14)} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
            <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} tickLine={false} />
            <YAxis tick={{ fill: '#666', fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
              formatter={(v: number) => [`${v.toFixed(0)} ₴`, 'Виручка']}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
              {chart.slice(-14).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === chart.slice(-14).length - 1 ? ORANGE : 'rgba(255,81,0,0.4)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
