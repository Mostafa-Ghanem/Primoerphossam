import React, { useState, useEffect } from 'react';
import { 
  Coffee, 
  Plus, 
  Trash2, 
  Search,
  ShoppingCart,
  X,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
  color: string;
}

interface CafeOrder {
  id: string;
  items: { name: string; price: number }[];
  total: number;
  status: 'pending' | 'completed';
  time: string;
}

const Cafe: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<CafeOrder[]>([]);
  const [cart, setCart] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchServices();
    fetchOrders();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/data/services');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setServices(data.filter((s: Service) => s.category === 'cafe'));
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/data/cafeOrders');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const addToCart = (service: Service) => {
    setCart([...cart, service]);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;
    
    const total = cart.reduce((acc, curr) => acc + curr.price, 0);
    const orderItems = cart.map(c => ({ name: c.name, price: c.price }));
    
    try {
      const res = await fetch('/api/data/cafeOrders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: orderItems,
          total,
          status: 'pending',
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        })
      });
      
      if (res.ok) {
        // Also create an invoice for this order
        await fetch('/api/data/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: 'عميل كافية',
            amount: total,
            method: 'نقدي',
            date: new Date().toLocaleDateString('en-GB'),
            status: 'paid',
            items: orderItems,
            description: 'طلبات كافية'
          })
        });

        setCart([]);
        fetchOrders();
      }
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  };

  const completeOrder = async (order: CafeOrder) => {
    try {
      // In-memory DB simulate update by delete + add (or just delete if we had real update)
      // Since our simple server doesn't have PUT/PATCH, we handle locally or ignore for now
      // Let's just delete the order to "complete" it for this demo
      await fetch(`/api/data/cafeOrders/${order.id}`, { method: 'DELETE' });
      fetchOrders();
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const totalCart = cart.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">كافية بريمو - PRIMO Cafe</h2>
          <p className="text-sm text-slate-500">إدارة طلبات الضيافة والمشروبات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="البحث في قائمة المشروبات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary h-14"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {services.filter(s => s.name.includes(searchQuery)).map((service) => (
              <motion.button
                key={service.id}
                whileActive={{ scale: 0.95 }}
                onClick={() => addToCart(service)}
                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all text-center flex flex-col items-center gap-3 group"
              >
                <div className={`w-12 h-12 rounded-2xl ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Coffee size={24} />
                </div>
                <h4 className="font-bold text-sm">{service.name}</h4>
                <p className="font-black text-primary">{service.price} ج.م</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Cart & Orders Section */}
        <div className="space-y-6">
          {/* Shopping Cart */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col h-fit">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingCart size={20} className="text-primary" />
              <h3 className="font-bold">سلة الطلبات</h3>
            </div>
            
            <div className="flex-1 space-y-3 min-h-[100px] overflow-y-auto max-h-[300px] mb-6">
              {cart.length > 0 ? (
                cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{item.name}</span>
                      <span className="text-[10px] text-slate-500">{item.price} ج.م</span>
                    </div>
                    <button onClick={() => removeFromCart(idx)} className="text-red-500 p-1 hover:bg-red-50 rounded-lg">
                      <X size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  السلة فارغة. ابدأ بإضافة مشروبات
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-6 space-y-4">
              <div className="flex justify-between items-center text-lg font-black">
                <span>الإجمالي</span>
                <span className="text-primary">{totalCart} ج.م</span>
              </div>
              <button 
                onClick={submitOrder}
                disabled={cart.length === 0}
                className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 ${
                  cart.length > 0 
                  ? 'bg-primary text-white hover:bg-primary-dark' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>تأكيد الطلب</span>
                <CheckCircle2 size={20} />
              </button>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Clock size={20} className="text-orange-500" />
              طلبات قيد التجهيز
            </h3>
            <div className="space-y-3">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="p-4 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-between group">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {order.items.map((item, i) => (
                          <span key={i} className="text-[10px] bg-slate-50 px-2 py-0.5 rounded text-slate-600">{item.name}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span className="font-bold text-primary">{order.total} ج.م</span>
                        <span>•</span>
                        <span>{order.time}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => completeOrder(order)}
                      className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                      title="مكتمل"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-slate-400 text-xs">لا توجد طلبات جارية</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cafe;
