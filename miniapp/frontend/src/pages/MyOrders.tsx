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
