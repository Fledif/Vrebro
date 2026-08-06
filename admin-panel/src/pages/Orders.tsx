import { useEffect, useState } from 'react';
import { api } from '../api';
import { RefreshCcw, PackageOpen } from 'lucide-react';

interface OrderItem {
  id: number;
  product: { name: string; image_url: string };
  quantity: number;
  price_at_purchase: number;
}
interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  comment: string;
  status: string;
  total_price: number;
  created_at: string;
  items: OrderItem[];
}

const STATUSES = ["NEW", "ACCEPTED", "COOKING", "READY", "DELIVERING", "COMPLETED", "CANCELLED"];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data);
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
                      order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      'bg-orange-500/10 text-orange-500 border-orange-500/20'}
                  `}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s} className="bg-neutral-900 text-white">{s}</option>
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
                      <img src={item.product.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                      <span className="text-sm text-neutral-200">{item.product.name}</span>
                    </div>
                    <div className="text-sm font-medium">
                      x{item.quantity} = {item.quantity * item.price_at_purchase} грн
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                <span className="text-neutral-400">Загальна сума:</span>
                <span className="text-2xl font-bold text-[var(--color-primary)]">{order.total_price} грн</span>
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
