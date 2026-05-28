import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Search,
  Calendar,
  X,
  TrendingDown
} from 'lucide-react';
import { motion } from 'motion/react';

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: 'عام', description: '', amount: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/data/expenses');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Expected JSON but got ${contentType}. Body: ${text.substring(0, 100)}`);
      }
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/data/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...newExpense, 
          date: new Date().toLocaleDateString('en-GB')
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewExpense({ category: 'عام', description: '', amount: 0 });
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل للمصروفات؟')) {
      try {
        await fetch(`/api/data/expenses/${id}`, { method: 'DELETE' });
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const filteredExpenses = expenses.filter(exp => 
    exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">سجل المصروفات - PRIMO</h2>
          <p className="text-sm text-slate-500">متابعة المصاريف اليومية والتشغيلية</p>
        </div>
        <div className="bg-red-50 px-6 py-3 rounded-2xl border border-red-100 flex items-center gap-3">
          <TrendingDown className="text-red-500" size={24} />
          <div>
            <p className="text-[10px] text-red-600 font-bold uppercase">إجمالي المصاريف</p>
            <p className="text-xl font-black text-red-700">{totalExpenses} ج.م</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="البحث في المصروفات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 shrink-0"
        >
          <Plus size={20} />
          <span>إضافة مصروف</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-sm border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4 font-medium">الفئة</th>
                <th className="px-6 py-4 font-medium">التوصيف</th>
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">المبلغ</th>
                <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-bold">{exp.category}</span>
                    </td>
                    <td className="px-6 py-4 font-medium">{exp.description}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{exp.date}</td>
                    <td className="px-6 py-4 font-black text-red-500">{exp.amount} ج.م</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleDeleteExpense(exp.id)}
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">لا توجد سجلات مصروفات حالياً</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((exp) => (
              <div key={exp.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold">{exp.category}</span>
                    <h4 className="font-bold text-base mt-1">{exp.description}</h4>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar size={10} />
                      {exp.date}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-black text-red-500">{exp.amount} ج.م</span>
                    <button 
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500">لا توجد مصروفات سجلات</div>
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
              <h3 className="text-xl font-bold">إضافة مصروف جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={handleAddExpense}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">الفئة</label>
                <select 
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="عام">عام</option>
                  <option value="معدات">معدات</option>
                  <option value="منظفات">منظفات</option>
                  <option value="رواتب">رواتب</option>
                  <option value="إيجار/كهرباء">إيجار/كهرباء</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">الوصف</label>
                <input 
                  type="text" 
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  placeholder="مثال: شراء صابون غسيل"
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">المبلغ (ج.م)</label>
                <input 
                  type="number" 
                  value={newExpense.amount || ''}
                  onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                  required 
                />
              </div>
              <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all mt-6 shadow-lg shadow-primary/20">
                حفظ المصروف
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
