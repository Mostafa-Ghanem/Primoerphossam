import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Coffee,
  Car,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';

interface Invoice {
  id: string;
  amount: number;
  date: string;
  description: string;
  items?: { name: string; price: number }[];
}

const COLORS = ['#0EA5E9', '#F59E0B', '#10B981', '#6366F1', '#EC4899', '#8B5CF6'];

const Reports: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [invRes, expRes] = await Promise.all([
        fetch('/api/data/invoices'),
        fetch('/api/data/expenses')
      ]);
      if (invRes.ok) setInvoices(await invRes.json());
      if (expRes.ok) setExpenses(await expRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Processing Data
  const totalRevenue = invoices.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  
  const cafeRevenue = invoices
    .filter(inv => inv.description?.includes('كافية') || inv.description?.includes('طلبات'))
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    
  const carWashRevenue = totalRevenue - cafeRevenue;

  // Source Breakdown
  const sourceData = [
    { name: 'غسيل واعتناء', value: carWashRevenue },
    { name: 'مبيعات الكافيه', value: cafeRevenue },
  ];

  // Service Breakdown
  const serviceMap: { [key: string]: number } = {};
  invoices.forEach(inv => {
    if (inv.description === 'طلبات كافية') return;
    const desc = inv.description || 'أخرى';
    serviceMap[desc] = (serviceMap[desc] || 0) + (Number(inv.amount) || 0);
  });
  const serviceData = Object.entries(serviceMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Monthly Data (Mocking month groupings based on date strings "DD/MM/YYYY")
  const monthlyMap: { [key: string]: number } = {};
  invoices.forEach(inv => {
    const parts = inv.date.split('/');
    if (parts.length === 3) {
      const monthYear = `${parts[1]}/${parts[2]}`;
      monthlyMap[monthYear] = (monthlyMap[monthYear] || 0) + (Number(inv.amount) || 0);
    }
  });
  const monthlyData = Object.entries(monthlyMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => {
      const [m1, y1] = a.name.split('/').map(Number);
      const [m2, y2] = b.name.split('/').map(Number);
      return y1 !== y2 ? y1 - y2 : m1 - m2;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">التقارير المالية</h2>
          <p className="text-sm text-slate-500">تحليل مصادر الدخل والأداء العام للمؤسسة</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm print:hidden"
          >
            <PieChartIcon size={18} className="text-primary" />
            <span>طباعة التقرير</span>
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium">
            <Calendar size={18} className="text-slate-400" />
            <span>آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-primary p-6 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden group"
        >
          <div className="relative z-10">
            <p className="text-primary-foreground/80 text-xs font-medium mb-1">إجمالي الإيرادات</p>
            <h3 className="text-2xl font-black">{totalRevenue.toLocaleString()} <span className="text-sm font-normal">ج.م</span></h3>
            <div className="flex items-center gap-1 mt-2 text-[10px] bg-white/20 w-fit px-2 py-0.5 rounded-full backdrop-blur-sm">
              <TrendingUp size={12} />
              <span>+12% عن الشهر الماضي</span>
            </div>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform" size={100} />
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-emerald-500 p-6 rounded-3xl text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group"
        >
          <div className="relative z-10">
            <p className="text-emerald-100 text-xs font-medium mb-1">صافي الأرباح</p>
            <h3 className="text-2xl font-black">{netProfit.toLocaleString()} <span className="text-sm font-normal">ج.م</span></h3>
            <div className="flex items-center gap-1 mt-2 text-[10px] bg-white/20 w-fit px-2 py-0.5 rounded-full backdrop-blur-sm">
              <TrendingUp size={12} />
              <span>أداء ربحي ممتاز</span>
            </div>
          </div>
          <BarChart3 className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform" size={100} />
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-center"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
              <Car size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-[10px]">خدمات الغسيل</p>
              <h4 className="text-lg font-bold">{carWashRevenue.toLocaleString()} ج.م</h4>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
              style={{ width: `${totalRevenue > 0 ? (carWashRevenue / totalRevenue) * 100 : 0}%` }}
            ></div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-center"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
              <Coffee size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-[10px]">مبيعات الكافيه</p>
              <h4 className="text-lg font-bold">{cafeRevenue.toLocaleString()} ج.م</h4>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
              style={{ width: `${totalRevenue > 0 ? (cafeRevenue / totalRevenue) * 100 : 0}%` }}
            ></div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Source Pie Chart */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-500">
              <PieChartIcon size={20} />
            </div>
            <h3 className="text-lg font-bold">توزيع مصادر الدخل</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Breakdown Bar Chart */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-500">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-lg font-bold">الإيرادات حسب نوع الخدمة</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#0EA5E9" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Timeline */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-500">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-bold">تطور الإيرادات الشهرية</h3>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="total" stroke="#0EA5E9" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
