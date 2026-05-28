import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Shield, 
  MoreVertical, 
  Search, 
  Trash2, 
  Edit2, 
  Mail, 
  CheckCircle2, 
  Clock,
  X,
  Lock,
  Eye,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  status?: 'active' | 'inactive';
}

interface Activity {
  id: string;
  user: string;
  action: string;
  details: string;
  time: string;
  date: string;
}

const roles = [
  { id: 'admin', name: 'مدير نظام', permissions: ['الكل'], color: 'bg-red-50 text-red-600', icon: Shield },
  { id: 'manager', name: 'محاسب', permissions: ['الفواتير', 'المصروفات', 'التقارير'], color: 'bg-blue-50 text-blue-600', icon: Settings },
  { id: 'staff', name: 'موظف استقبال', permissions: ['نقطة البيع', 'الخدمات'], color: 'bg-emerald-50 text-emerald-600', icon: Eye },
];

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'موظف استقبال' });
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchActivities();
    const interval = setInterval(fetchActivities, 5000); // Poll for activities every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/data/users');
      const data = await res.json();
      setUsers(data);
    } catch (e) { console.error('Error fetching users:', e); }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/data/activities');
      const data = await res.json();
      setActivities(data.slice(0, 20)); // Top 20 activities
    } catch (e) { console.error('Error fetching activities:', e); }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'موظف استقبال' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      alert('الرجاء إدخال كافة البيانات');
      return;
    }
    
    setIsSaving(true);
    try {
      const isEditing = !!editingUser;
      const url = isEditing ? `/api/data/users/${editingUser.id}` : '/api/data/users';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, lastActive: 'نشط الآن' })
      });

      if (res.ok) {
        await fetchUsers();
        await fetchActivities();
        setShowModal(false);
      } else {
        const err = await res.json();
        alert(`خطأ: ${err.error || 'فشل الحفظ'}`);
      }
    } catch (e) { 
      console.error('Save error:', e);
      alert('فشل الاتصال بالخادم');
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/data/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchUsers();
        await fetchActivities();
        setDeletingId(null);
      } else {
        alert('فشل حذف المستخدم');
      }
    } catch (e) { 
      console.error('Delete error:', e);
      alert('حدث خطأ أثناء المحاولة');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">المستخدمين والصلاحيات</h2>
          <p className="text-slate-500 text-sm mt-1">إدارة الطاقم وتحديد صلاحيات الوصول للنظام</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:-translate-y-1 active:translate-y-0"
        >
          <UserPlus size={20} />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User List Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="relative mb-6">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pr-12 pl-4 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-slate-50 dark:border-slate-700">
                    <th className="pb-4 pt-2 font-bold text-slate-400 text-xs px-2">الاسم والبيانات</th>
                    <th className="pb-4 pt-2 font-bold text-slate-400 text-xs px-2">الرتبة</th>
                    <th className="pb-4 pt-2 font-bold text-slate-400 text-xs px-2">آخر نشاط</th>
                    <th className="pb-4 pt-2 font-bold text-slate-400 text-xs px-2 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white leading-none mb-1">{user.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          user.role === 'مدير نظام' ? 'bg-red-50 text-red-600' : 
                          user.role === 'محاسب' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <Clock size={12} />
                          {user.lastActive}
                        </div>
                      </td>
                      <td className="py-4 px-2 text-left">
                        <div className="flex items-center gap-2 justify-end">
                          <button 
                            onClick={() => handleOpenModal(user)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-primary transition-all"
                            title="تعديل"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
                                handleDelete(user.id);
                              }
                            }}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-slate-400 hover:text-red-500 transition-all"
                            title="حذف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400 font-bold">لا يوجد مستخدمين مطابقين للبحث</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Roles Details Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200 dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Shield size={24} className="text-primary" />
                سجل النشاط المباشر
              </h3>
              <button 
                onClick={fetchActivities}
                className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-all"
                title="تحديث النشاط"
              >
                <div className="animate-pulse">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full block" />
                </div>
              </button>
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {activities.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-8">لا توجد سجلات بعد</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{activity.user}</span>
                      <span className="text-[10px] text-white/40">{activity.time}</span>
                    </div>
                    <p className="text-sm font-bold mb-1">{activity.action}</p>
                    <p className="text-[10px] text-white/60 line-clamp-1">{activity.details}</p>
                    <div className="absolute left-0 bottom-0 top-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-800">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
              <Lock size={20} />
              الأدوار والصلاحيات
            </h3>
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.id} className="p-3 bg-white dark:bg-slate-800/50 rounded-xl border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${role.color}`}>
                      <role.icon size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{role.name}</span>
                  </div>
                  <div className="flex gap-1">
                    {role.permissions.map((p, i) => (
                      <span key={i} className="text-[8px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between">
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                  <X size={24} />
                </button>
                <div className="text-right">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                    {editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">أدخل بيانات العضو الجديد في الفريق</p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2 text-right">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 px-1">الاسم بالكامل</label>
                  <div className="relative">
                    <UsersIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pr-12 pl-4 py-4 focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                      placeholder="مثال: محمد أحمد"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 px-1">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pr-12 pl-4 py-4 focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 px-1">رتبة الوصول</label>
                  <div className="grid grid-cols-3 gap-3">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => setFormData({...formData, role: role.name})}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                          formData.role === role.name 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                        }`}
                      >
                        <role.icon size={24} />
                        <span className="text-xs font-black">{role.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/30 hover:bg-primary-dark hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isSaving && <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />}
                  {editingUser ? 'حفظ التعديلات' : 'تأكيد الإضافة'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;
