import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { fetchUserOrders, fetchPaymentCard, fetchCashbackSettings, fetchUserProfile, fetchProducts } from '../api';
import type { CashbackSettings } from '../api';
import { Package, CreditCard, Check, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUserId } from '../utils/user';
import { useCartStore } from '../store/cartStore';

const statusLabels: Record<string, string> = {
  NEW: 'Не розглянуто',
  REVIEWED: 'Розглянуто',
  EDITED: 'Відредаговано',
  PACKING: 'Упаковується',
  SHIPPED: 'Відправлено',
  CONFIRMED: 'Підтверджено',
  CANCELLED: 'Скасовано'
};

const statusColors: Record<string, string> = {
  NEW: 'text-gray-400 bg-gray-500/5 border-gray-500/10',
  REVIEWED: 'text-brand-orange bg-orange-500/5 border-orange-500/10',
  EDITED: 'text-brand-orange bg-orange-500/5 border-orange-500/10',
  PACKING: 'text-yellow-500 bg-yellow-500/5 border-yellow-500/10',
  SHIPPED: 'text-purple-400 bg-purple-500/5 border-purple-500/10',
  CONFIRMED: 'text-green-500 bg-green-500/5 border-green-500/10',
  CANCELLED: 'text-red-500 bg-red-500/5 border-red-500/10'
};

const getStepIndex = (status: string) => {
  if (['NEW', 'REVIEWED', 'EDITED'].includes(status)) return 0;
  if (['PACKING'].includes(status)) return 1;
  if (['SHIPPED', 'CONFIRMED'].includes(status)) return 2;
  return -1;
};

export default function MyOrders() {
  const navigate = useNavigate();
  const { addItem, clearCart } = useCartStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentCard, setPaymentCard] = useState<{card_number: string, is_enabled: boolean} | null>(null);
  const [cashbackSettings, setCashbackSettings] = useState<CashbackSettings | null>(null);
  const [userBalance, setUserBalance] = useState(0);
  const prevOrdersRef = React.useRef<any[]>([]);

  const handleRepeatOrder = async (order: any) => {
    try {
      const allProducts = await fetchProducts();
      clearCart();
      for (const item of order.items) {
        const product = allProducts.find((p: any) => p.id === item.product_id || (item.product && p.id === item.product.id));
        if (product && !product.is_out_of_stock) {
          for (let i = 0; i < Math.round(item.quantity); i++) {
            addItem(product);
          }
        }
      }
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      navigate('/cart');
    } catch (err) {
      console.error('Repeat order failed', err);
    }
  };

  const playNotificationSound = () => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const loadData = async (showLoading = true) => {
      try {
        const userId = getUserId();

        const [ordersData, cardData, cashbackData] = await Promise.all([
          fetchUserOrders(userId),
          fetchPaymentCard(),
          fetchCashbackSettings()
        ]);
        
        if (cashbackData.is_enabled) {
          const profileData = await fetchUserProfile(userId);
          setUserBalance(profileData.cashback_balance);
        }
        setCashbackSettings(cashbackData);
        
        // Check for status changes
        if (prevOrdersRef.current.length > 0) {
          let hasChange = false;
          ordersData.forEach((newOrder: any) => {
            const oldOrder = prevOrdersRef.current.find((o) => o.id === newOrder.id);
            if (oldOrder && oldOrder.status !== newOrder.status) {
              hasChange = true;
            }
          });
          if (hasChange) {
            playNotificationSound();
          }
        }
        prevOrdersRef.current = ordersData;
        
        setOrders(ordersData);
        setPaymentCard(cardData);
      } catch (err) {
        console.error(err);
      } finally {
        if (showLoading) setLoading(false);
      }
    };
    
    loadData(true);
    intervalId = setInterval(() => { loadData(false); }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="p-4 flex justify-center mt-20">
        <div className="w-8 h-8 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      {cashbackSettings?.is_enabled && (
        <div className="bg-gradient-to-r from-brand-orange to-orange-500 rounded-2xl p-5 mb-6 text-white shadow-[0_4px_20px_rgba(255,81,0,0.3)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-sm font-semibold opacity-90 mb-1 flex items-center gap-1.5">
              <Gift size={16} /> Мій Кешбек
            </h2>
            <div className="flex items-end gap-1.5">
              <span className="text-4xl font-black">{userBalance.toFixed(2)}</span>
              <span className="text-lg font-bold mb-1 opacity-90">грн</span>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-xl font-black mb-5 mt-3">Мої замовлення</h1>
      
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 mt-20 flex flex-col items-center">
          <Package size={40} className="mb-4 opacity-30" />
          <p className="text-sm">У вас ще немає замовлень</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              key={order.id} 
              className="glass-card p-4 rounded-2xl"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-base">Замовлення #{order.order_number}</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">{new Date(order.created_at).toLocaleString('uk-UA')}</p>
                </div>
                {order.status === 'CANCELLED' && (
                  <div className="px-2 py-1 rounded-lg text-[11px] font-bold border text-red-500 bg-red-500/5 border-red-500/10">
                    Скасовано
                  </div>
                )}
              </div>

              {order.status !== 'CANCELLED' && (
                <div className="mb-4 mt-2">
                  <div className="flex justify-between relative px-2">
                    <div className="absolute top-1.5 left-4 right-4 h-0.5 bg-gray-800 -z-10 rounded-full"></div>
                    <div 
                      className="absolute top-1.5 left-4 h-0.5 bg-brand-orange -z-10 rounded-full transition-all duration-500" 
                      style={{ width: getStepIndex(order.status) === 0 ? '0%' : getStepIndex(order.status) === 1 ? '50%' : 'calc(100% - 2rem)' }}
                    ></div>
                    
                    {['Оформлено', 'Готується', 'Готово'].map((stepName, idx) => {
                      const currentStep = getStepIndex(order.status);
                      const isActive = idx <= currentStep;
                      const isCurrent = idx === currentStep;
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1.5 bg-[#111111] px-1 z-10">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isActive ? 'bg-brand-orange border-brand-orange' : 'bg-gray-800 border-gray-700'} ${isCurrent ? 'ring-2 ring-brand-orange/30' : ''}`} />
                          <span className={`text-[9px] font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>{stepName}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-1.5 mb-3">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-400 line-clamp-1 flex-1 pr-2">{item.product?.name || 'Товар'}</span>
                    <span className="text-gray-500 whitespace-nowrap text-xs">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t divider pt-3 space-y-1">
                {order.cashback_used > 0 && (
                  <div className="flex justify-between items-center text-brand-orange">
                    <span className="text-xs font-semibold">Списано бонусів:</span>
                    <span className="font-bold text-sm">-{order.cashback_used} грн</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Сума:</span>
                  <span className="font-medium text-white text-sm">{order.total_price} грн</span>
                </div>
                {order.delivery_cost > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Доставка:</span>
                    <span className="font-medium text-white text-sm">+{order.delivery_cost} грн</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400">Всього до сплати:</span>
                  <span className="font-black text-brand-orange">{Math.max(0, order.total_price + (order.delivery_cost || 0) - (order.cashback_used || 0))} грн</span>
                </div>
                {order.cashback_earned > 0 && (
                  <div className="flex justify-between items-center mt-1 text-green-500">
                    <span className="text-xs font-semibold">Буде нараховано бонусів:</span>
                    <span className="font-bold text-sm">+{order.cashback_earned}</span>
                  </div>
                )}
              </div>

              {order.status !== 'NEW' && order.status !== 'CONFIRMED' && order.status !== 'CANCELLED' && paymentCard?.is_enabled && paymentCard?.card_number && (
                <div className="mt-3 bg-brand-charcoal p-3 rounded-xl border border-brand-orange/10">
                  <h4 className="text-[11px] font-bold text-brand-orange flex items-center gap-1 mb-2">
                    <CreditCard size={13} /> Оплатіть замовлення:
                  </h4>
                  <div className="text-center font-mono text-base tracking-widest bg-black/40 p-2 rounded-lg border border-white/6 mb-1.5 select-all">
                    {paymentCard.card_number}
                  </div>
                  <p className="text-[10px] text-gray-600 text-center">Після оплати статус зміниться автоматично</p>
                </div>
              )}
              
              {order.status === 'CONFIRMED' && (
                <div className="mt-3 bg-green-500/5 p-3 rounded-xl border border-green-500/10 flex items-center justify-center gap-2 text-green-500">
                  <Check size={14} />
                  <span className="text-xs font-bold">Оплачено та завершено</span>
                </div>
              )}
              <button
                onClick={() => handleRepeatOrder(order)}
                className="mt-2 w-full py-2.5 rounded-xl bg-brand-charcoal border border-white/6 text-white/70 text-xs font-bold flex items-center justify-center gap-2 active:bg-white/5 transition-colors"
              >
                🔄 Повторити замовлення
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
