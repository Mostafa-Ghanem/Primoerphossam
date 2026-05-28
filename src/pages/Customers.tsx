import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2,
  Car,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  car: string;
  plate: string;
  date: string;
}

const Customers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', car: '', plate: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/data/customers');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/data/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCustomer, date: new Date().toISOString().split('T')[0] })
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewCustomer({ name: '', phone: '', car: '', plate: '' });
        fetchCustomers();
      }
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      try {
        await fetch(`/api/data/customers/${id}`, { method: 'DELETE' });
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.includes(searchTerm) || c.phone.includes(searchTerm) || c.plate.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="البحث بالاسم، الرقم، أو رقم اللوحة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
        >
          <UserPlus size={20} />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-sm border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4 font-medium">اسم العميل</th>
                <th className="px-6 py-4 font-medium">رقم الهاتف</th>
                <th className="px-6 py-4 font-medium">نوع السيارة</th>
                <th className="px-6 py-4 font-medium">رقم اللوحة</th>
                <th className="px-6 py-4 font-medium">تاريخ الإضافة</th>
                <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold">{customer.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">{customer.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Car size={16} />
                        {customer.car}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold uppercase">{customer.plate}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{customer.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-blue-500 transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">لا يوجد عملاء حالياً</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg">{customer.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">{customer.phone}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="p-3 bg-red-50 text-red-600 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Car size={14} />
                    <span>{customer.car}</span>
                  </div>
                  <span className="font-bold uppercase bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-[10px]">
                    {customer.plate}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500">لا يوجد عملاء موجهون حالياً</div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">إضافة عميل جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={handleAddCustomer}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">اسم العميل</label>
                <input 
                  type="text" 
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">رقم الهاتف</label>
                <input 
                  type="tel" 
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">نوع السيارة</label>
                  <input 
                    type="text" 
                    value={newCustomer.car}
                    onChange={(e) => setNewCustomer({...newCustomer, car: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">رقم اللوحة</label>
                  <input 
                    type="text" 
                    value={newCustomer.plate}
                    onChange={(e) => setNewCustomer({...newCustomer, plate: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all mt-6 shadow-lg shadow-primary/20">
                حفظ العميل
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Customers;
