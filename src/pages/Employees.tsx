import React, { useState, useEffect } from 'react';
import { 
  UserCircle, 
  Phone, 
  Star,
  Briefcase,
  Wallet,
  Clock,
  UserPlus,
  Trash2,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  salary: number;
  rating: number;
  status: string;
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', role: 'عامل غسيل', phone: '', salary: 3000 });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/data/employees');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/data/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEmployee, rating: 5.0, status: 'present' })
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewEmployee({ name: '', role: 'عامل غسيل', phone: '', salary: 3000 });
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      try {
        await fetch(`/api/data/employees/${id}`, { method: 'DELETE' });
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">إدارة الموظفين - PRIMO</h2>
          <p className="text-sm text-slate-500">متابعة الحضور، الرواتب وتقييم الأداء</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
        >
          <UserPlus size={20} />
          <span>إضافة موظف</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.length > 0 ? (
          employees.map((emp, i) => (
            <motion.div 
              key={emp.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-primary relative">
                    <UserCircle size={40} />
                    <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
                      emp.status === 'present' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{emp.name}</h4>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Briefcase size={12} />
                      <span>{emp.role}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteEmployee(emp.id)}
                  className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone size={14} />
                    <span>رقم الجوال</span>
                  </div>
                  <span className="font-mono text-xs">{emp.phone}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Wallet size={14} />
                    <span>الراتب الشهري</span>
                  </div>
                  <span className="font-bold text-primary">{emp.salary} ج.م</span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-200">
            لا يوجد موظفين مسجلين حالياً.
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
              <h3 className="text-xl font-bold">إضافة موظف جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={handleAddEmployee}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">اسم الموظف</label>
                <input 
                  type="text" 
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">الدور الوظيفي</label>
                  <select 
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="مشرف">مشرف</option>
                    <option value="فني تلميع">فني تلميع</option>
                    <option value="عامل غسيل">عامل غسيل</option>
                    <option value="كاشير">كاشير</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">الراتب (ج.م)</label>
                  <input 
                    type="number" 
                    value={newEmployee.salary || ''}
                    onChange={(e) => setNewEmployee({...newEmployee, salary: Number(e.target.value)})}
                    className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">رقم الهاتف</label>
                <input 
                  type="tel" 
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                  required 
                />
              </div>
              <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all mt-6 shadow-lg shadow-primary/20">
                حفظ الموظف
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Employees;
