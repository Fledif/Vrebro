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

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch (A5)
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); // Drop to A4
      
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio play failed", e);
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
        playNotificationSound();
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
                      x{parseFloat(Number(item.quantity).toFixed(3))} = {Math.round(item.quantity * item.price_at_purchase)} грн
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
