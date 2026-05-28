import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Calendar, 
  FileText, 
  UserCircle, 
  Wallet,
  Coffee,
  BarChart3,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Car,
  ShoppingCart
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', labelEn: 'Dashboard' },
    { id: 'pos', icon: ShoppingCart, label: 'نقطة البيع POS', labelEn: 'POS' },
    { id: 'customers', icon: Users, label: 'العملاء', labelEn: 'Customers' },
    { id: 'services', icon: Settings, label: 'الخدمات', labelEn: 'Services' },
    { id: 'invoices', icon: FileText, label: 'الفواتير', labelEn: 'Invoices' },
    { id: 'cafe', icon: Coffee, label: 'الكافية', labelEn: 'Cafe' },
    { id: 'employees', icon: UserCircle, label: 'الموظفين', labelEn: 'Employees' },
    { id: 'expenses', icon: Wallet, label: 'المصروفات', labelEn: 'Expenses' },
    { id: 'users', icon: UserCircle, label: 'المستخدمين والصلاحيات', labelEn: 'Users & Permissions' },
    { id: 'reports', icon: BarChart3, label: 'التقارير', labelEn: 'Reports' },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`min-h-screen flex rtl font-sans ${isDarkMode ? 'dark bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 280 : (isMobile ? 0 : 80),
          x: isMobile && !isSidebarOpen ? 280 : 0
        }}
        className={`fixed right-0 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 h-full z-50 flex flex-col overflow-hidden`}
      >
        <div className="p-6 flex items-center justify-between">
          <motion.div 
            animate={{ opacity: isSidebarOpen ? 1 : 0 }}
            className="flex items-center gap-2 text-primary font-bold text-xl"
          >
            <Car size={32} />
            <span>PRIMO</span>
          </motion.div>
          {!isMobile && (
            <button 
              onClick={toggleSidebar}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobile) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all relative ${
                activeTab === item.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              <item.icon size={22} className="min-w-[22px]" />
              {(isSidebarOpen || isMobile) && (
                <span className="whitespace-nowrap font-medium">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all font-medium"
          >
            {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            {isSidebarOpen && <span>{isDarkMode ? 'الوضع المضيء' : 'الوضع الليلي'}</span>}
          </button>
          <button className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-50 text-red-500 transition-all font-medium">
            <LogOut size={22} />
            {isSidebarOpen && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className={`flex-1 transition-all duration-300 ${!isMobile ? (isSidebarOpen ? 'mr-[280px]' : 'mr-[80px]') : 'mr-0'}`}
      >
        <header className="h-20 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button 
                onClick={toggleSidebar}
                className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-white"
              >
                <Menu size={24} />
              </button>
            )}
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white">
                {menuItems.find(item => item.id === activeTab)?.label}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="text-left rtl hidden sm:block">
              <p className="font-semibold text-sm">HOSSAM</p>
              <p className="text-xs text-slate-500">مدير PRIMO</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
              H
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Layout;
