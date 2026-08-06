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
