import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  CheckCircle2, 
  Calendar as CalendarIcon,
  DollarSign,
  UserCircle,
  Settings as SettingsIcon,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Layout as LayoutIcon,
  GripVertical,
  Image as ImageIcon,
  Camera,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, Reorder, AnimatePresence } from 'motion/react';

const data = [
  { name: 'السبت', value: 400 },
  { name: 'الأحد', value: 300 },
  { name: 'الاثنين', value: 600 },
  { name: 'الثلاثاء', value: 800 },
  { name: 'الأربعاء', value: 500 },
  { name: 'الخميس', value: 900 },
  { name: 'الجمعة', value: 1100 },
];

interface WidgetConfig {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
}

const Dashboard: React.FC = () => {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [stats, setStats] = useState([
    { title: 'سيارات اليوم', value: '0', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'الأرباح اليومية', value: '0 ج.م', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'الموظفين', value: '0', icon: UserCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'العمليات المكتملة', value: '0', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ]);

  const [chartData, setChartData] = useState(data);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardSettings();
    fetchStats();
    
    // Live updates every 5 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setWidgets(data.dashboard.widgets.sort((a: any, b: any) => a.order - b.order));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateWidgetSettings = async (updatedWidgets: WidgetConfig[]) => {
    try {
      setWidgets(updatedWidgets);
      await fetch('/api/settings/dashboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets: updatedWidgets })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
      const fetchCollection = async (coll: string) => {
        const res = await fetch(`/api/data/${coll}`);
        return res.json();
      };

      const [customers, invoices, employees, expenses, activitiesRes] = await Promise.all([
        fetchCollection('customers'),
        fetchCollection('invoices'),
        fetchCollection('employees'),
        fetchCollection('expenses'),
        fetchCollection('activities')
      ]);

      setActivities(activitiesRes.slice(0, 5));

      // Calculate Dynamic Chart Data
      const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const chartMap = new Map();
      days.forEach(day => chartMap.set(day, 0));

      invoices.forEach((inv: any) => {
        try {
          const date = new Date(inv.date);
          const dayName = days[date.getDay()];
          if (chartMap.has(dayName)) {
            chartMap.set(dayName, chartMap.get(dayName) + (Number(inv.amount) || 0));
          }
        } catch (e) { /* ignore invalid dates */ }
      });

      const dynamicChartData = days.map(name => ({
        name,
        value: chartMap.get(name)
      }));

      setChartData(dynamicChartData);

      const totalRevenue = invoices.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
      const totalExpenses = expenses.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
      const netProfit = totalRevenue - totalExpenses;

      setStats([
        { title: 'إجمالي العملاء', value: customers.length.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { title: 'صافي الأرباح', value: `${netProfit} ج.م`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
        { title: 'طاقم العمل', value: employees.length.toString(), icon: UserCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
        { title: 'إجمالي المصاريف', value: `${totalExpenses} ج.م`, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleWidget = (id: string) => {
    const updated = widgets.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w);
    updateWidgetSettings(updated);
  };

  const renderWidget = (id: string) => {
    switch (id) {
      case 'stats_grid':
        return (
          <div key="stats_grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center md:items-start text-center md:text-right gap-3 md:gap-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${stat.bg} dark:bg-slate-700 flex items-center justify-center shrink-0`}>
                  <stat.icon className={stat.color} size={20} />
                </div>
                <div>
                  <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.title}</p>
                  <h3 className="text-sm md:text-2xl font-bold dark:text-white truncate">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>
        );
      case 'weekly_chart':
        return (
          <div key="weekly_chart" className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">إحصائيات الأداء الأسبوعي</h3>
                  <p className="text-xs text-slate-500">تحليل الإيرادات على مدار أيام الأسبوع</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-500 text-sm font-medium bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
                <Sparkles size={16} />
                <span>بيانات حيّة ودقيقة</span>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748B', fontWeight: 'bold' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                    tickFormatter={(val) => `${val} ج.م`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', textAlign: 'right' }}
                    labelStyle={{ fontWeight: 'black', marginBottom: '4px' }}
                    formatter={(val: any) => [`${val.toLocaleString()} ج.م`, 'الإيرادات']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0EA5E9" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 'performance_memos':
        return (
          <div key="performance_memos" className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-6">ملاحظات الأداء</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-600">
                <p className="text-sm font-bold mb-2">💡 نصيحة اليوم</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  غسيل VIP يحقق أعلى معدل ربح هذا الأسبوع. حاول توجيه العملاء لاختياره للحصول على نتائج أفضل.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-sm font-bold text-primary mb-2">🚀 تحديث PRIMO</p>
                <p className="text-xs text-primary/70 leading-relaxed">
                  تم تفعيل نظام طباعة الفواتير المباشر بنجاح. يمكنك الآن طباعة أي فاتورة بلمسة زر واحدة.
                </p>
              </div>
            </div>
          </div>
        );
      case 'recent_activity':
        return (
          <div key="recent_activity" className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-6">سجل العمليات الأخير</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="text-slate-500 text-sm border-b border-slate-100 dark:border-slate-700">
                    <th className="pb-4 font-medium px-4">المستخدم</th>
                    <th className="pb-4 font-medium px-4">العملية</th>
                    <th className="pb-4 font-medium px-4">التفاصيل</th>
                    <th className="pb-4 font-medium px-4">الوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {activities.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">لا توجد عمليات مؤرشفة مسبقاً</td>
                    </tr>
                  ) : (
                    activities.map((item) => (
                      <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-700 dark:text-slate-200">{item.user}</span>
                        </td>
                        <td className="py-4 px-4 text-primary font-medium">{item.action}</td>
                        <td className="py-4 px-4 text-slate-500 text-xs">{item.details}</td>
                        <td className="py-4 px-4 text-slate-400 text-xs">{item.time}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen -m-8 p-8 space-y-8 overflow-hidden">
      {/* Dynamic Car Background */}
      <div 
        className="absolute inset-x-0 bottom-0 top-0 -z-10 bg-[url('https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center bg-fixed opacity-[0.08] dark:opacity-[0.12] grayscale hover:grayscale-0 transition-all duration-1000"
        aria-hidden="true"
      />
      <div 
        className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50/50 via-transparent to-slate-50/50 dark:from-slate-900/50 dark:to-slate-900/50 pointer-events-none"
        aria-hidden="true"
      />

      <div className="flex items-center justify-between relative z-10">
        <h2 className="text-2xl font-bold">لوحة التحكم</h2>
        <button 
          onClick={() => setShowCustomizer(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
        >
          <LayoutIcon size={20} />
          <span>تخصيص اللوحة</span>
        </button>
      </div>

      <div className="space-y-8">
        {widgets.filter(w => w.enabled).map(w => renderWidget(w.id))}
      </div>

      {showCustomizer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-8 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">تخصيص لوحة التحكم</h3>
              <button onClick={() => setShowCustomizer(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-6">اسحب العناصر لإعادة ترتيبها، أو استخدم الأيقونات لإظهار/إخفاء المكونات.</p>
            
            <Reorder.Group 
              axis="y" 
              values={widgets} 
              onReorder={(reordered) => {
                const updated = reordered.map((w, idx) => ({ ...w, order: idx + 1 }));
                updateWidgetSettings(updated);
              }}
              className="space-y-3"
            >
              {widgets.map((widget) => (
                <Reorder.Item 
                  key={widget.id} 
                  value={widget}
                  className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600 flex items-center justify-between cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="text-slate-400" size={18} />
                    <span className="font-medium text-sm">{widget.title}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWidget(widget.id);
                    }}
                    className={`p-2 rounded-lg transition-colors ${widget.enabled ? 'text-primary bg-primary/10' : 'text-slate-400 bg-slate-100'}`}
                  >
                    {widget.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            <button 
              onClick={() => setShowCustomizer(false)}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all mt-8"
            >
              إغلاق
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
