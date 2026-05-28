import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Clock, 
  DollarSign,
  Edit3,
  Trash2,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  color: string;
  category: string;
}

interface ServicesProps {
  onQuickInvoice?: (amount: number, description: string) => void;
}

const Services: React.FC<ServicesProps> = ({ onQuickInvoice }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({ name: '', price: 0, duration: '30 دقيقة', color: 'bg-blue-100 text-blue-600', category: 'wash' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/data/services');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/data/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewService({ name: '', price: 0, duration: '30 دقيقة', color: 'bg-blue-100 text-blue-600', category: 'wash' });
        fetchServices();
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
      try {
        await fetch(`/api/data/services/${id}`, { method: 'DELETE' });
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">خدمات المغسلة</h2>
          <p className="text-sm text-slate-500">إدارة قائمة الخدمات والأسعار</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          <span>خدمة جديدة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services.length > 0 ? (
          services.map((service, i) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onQuickInvoice?.(service.price, service.name)}
              className="group relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center mb-6`}>
                <Settings size={24} />
              </div>
              
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold">{service.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  service.category === 'cafe' ? 'bg-orange-100 text-orange-600' : 
                  service.category === 'product' ? 'bg-zinc-100 text-zinc-600' : 
                  'bg-blue-100 text-blue-600'
                }`}>
                  {service.category === 'cafe' ? 'كافية' : 
                   service.category === 'product' ? 'منتج' : 
                   'مغسلة'}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Clock size={16} />
                  <span>المدة: {service.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <DollarSign size={16} />
                  <span className="font-bold text-slate-900 dark:text-white">السعر: {service.price} ج.م</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-blue-500 transition-colors">
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <span className="text-xs font-medium text-slate-400">كود: #{service.id}</span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
            لا توجد خدمات مضافة حالياً.
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">إضافة خدمة جديدة</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={handleAddService}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">القسم</label>
                <select 
                  value={newService.category}
                  onChange={(e) => setNewService({...newService, category: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="wash">مغسلة السيارات</option>
                  <option value="product">منتجات</option>
                  <option value="cafe">الكافية</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">اسم الخدمة</label>
                <input 
                  type="text" 
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">السعر (ج.م)</label>
                  <input 
                    type="number" 
                    value={newService.price || ''}
                    onChange={(e) => setNewService({...newService, price: Number(e.target.value)})}
                    className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">المدة المتوقعة</label>
                  <input 
                    type="text" 
                    value={newService.duration}
                    onChange={(e) => setNewService({...newService, duration: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all mt-6 shadow-lg shadow-primary/20">
                حفظ الخدمة
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Services;
