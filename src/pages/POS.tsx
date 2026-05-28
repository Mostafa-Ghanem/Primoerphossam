import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  User, 
  Package, 
  Settings,
  CreditCard,
  DollarSign,
  Coffee,
  Car,
  FileText,
  Printer,
  X,
  Edit2,
  Save,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

interface Item {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends Item {
  quantity: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

const POS: React.FC = () => {
  const [services, setServices] = useState<Item[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [serviceQuantity, setServiceQuantity] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('نقدي');
  const [discount, setDiscount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isSavingService, setIsSavingService] = useState(false);
  
  // Service Management State
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Item | null>(null);
  const [serviceFormData, setServiceFormData] = useState({ name: '', price: 0, category: 'wash' });

  const [settings, setSettings] = useState<any>({
    companyName: 'بريمو لغسيل السيارات',
    phone: '',
    address: 'القاهرة، مصر',
    footerText: 'شكراً لزيارتكم، نتمنى لكم يوماً سعيداً',
    showQRCode: true,
    showLogo: true
  });

  useEffect(() => {
    fetchData();
    fetchInvoices();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/data/settings');
      if (res.ok) setSettings(await res.json());
    } catch (e) { console.error(e); }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenServiceModal = (service?: Item) => {
    if (service) {
      setEditingService(service);
      setServiceFormData({ name: service.name, price: service.price, category: service.category });
    } else {
      setEditingService(null);
      setServiceFormData({ name: '', price: 0, category: activeCategory === 'all' ? 'wash' : activeCategory });
    }
    setShowServiceModal(true);
  };

  const handleSaveService = async () => {
    if (!serviceFormData.name) {
      alert('الرجاء إدخال اسم الخدمة');
      return;
    }
    
    setIsSavingService(true);
    try {
      const url = editingService ? `/api/data/services/${editingService.id}` : '/api/data/services';
      const method = editingService ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceFormData)
      });

      if (res.ok) {
        await fetchData();
        setShowServiceModal(false);
      } else {
        const err = await res.json();
        alert(`خطأ في الحفظ: ${err.error || res.statusText}`);
      }
    } catch (e) { 
      console.error(e);
      alert('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsSavingService(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
    try {
      const res = await fetch(`/api/data/services/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const filteredItems = services.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/data/invoices');
      if (res.ok) {
        const data = await res.json();
        // Show last 5 invoices
        setRecentInvoices(data.reverse().slice(0, 5));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    try {
      const [servicesRes, customersRes] = await Promise.all([
        fetch('/api/data/services'),
        fetch('/api/data/customers')
      ]);
      const servicesData = await servicesRes.json();
      const customersData = await customersRes.json();
      setServices(servicesData);
      setCustomers(customersData);
    } catch (e) {
      console.error(e);
    }
  };

  const addToCart = (itemId: string, quantity: number) => {
    const item = services.find(s => s.id === itemId);
    if (!item) return;

    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing) {
        return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const total = subtotal - discount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const customer = customers.find(c => c.id === selectedCustomerId);
    
    try {
      const res = await fetch('/api/data/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customer?.name || 'عميل نقدي',
          phone: customer?.phone || '-',
          amount: total,
          method: paymentMethod,
          date: new Date().toLocaleDateString('en-GB'),
          status: 'paid',
          description: cart.map(i => i.name).join(', '),
          items: cart.map(i => ({ name: i.name, price: i.price })),
          carType: plateNumber || 'سيارة زبون'
        })
      });

      if (res.ok) {
        const savedInvoice = await res.json();
        setShowSuccess(true);
        fetchInvoices();
        
        // Auto-show preview after 1 second
        setTimeout(() => {
          setSelectedInvoice(savedInvoice);
          setShowPreview(true);
          setShowSuccess(false);
          setCart([]);
          setDiscount(0);
          setPlateNumber('');
        }, 1000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20">
            الدور: admin
          </div>
          <div className="text-slate-500 text-sm">
            المستخدم: <span className="font-bold text-slate-800 dark:text-white">مدير النظام</span>
          </div>
        </div>
        <div className="text-left rtl">
          <h2 className="text-xl font-black">نقطة البيع POS</h2>
          <p className="text-xs text-slate-500">بيع الخدمات والمنتجات وتحديث المخزون تلقائياً</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Selection Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search & Categories */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-72">
                <input 
                  type="text"
                  placeholder="بحث عن خدمة أو منتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-12 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                />
                <Settings className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'wash', label: 'مغسلة' },
                  { id: 'product', label: 'منتجات' },
                  { id: 'cafe', label: 'كافيه' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-100'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Add New Service Card */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenServiceModal()}
                className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all text-center flex flex-col items-center justify-center h-32 gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Plus size={24} />
                </div>
                <span className="text-xs font-bold text-slate-500">إضافة جديد</span>
              </motion.button>

              {filteredItems.map(item => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  key={item.id}
                  className="relative p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50 hover:shadow-md transition-all text-right flex flex-col justify-between h-32 group"
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-2 rounded-xl ${item.category === 'wash' ? 'bg-blue-50 text-blue-500' : item.category === 'product' ? 'bg-zinc-50 text-zinc-500' : 'bg-orange-50 text-orange-500'}`}>
                      {item.category === 'wash' ? <Car size={16} /> : item.category === 'product' ? <Package size={16} /> : <Coffee size={16} />}
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleOpenServiceModal(item)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => addToCart(item.id, 1)}
                        className="p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="cursor-pointer" onClick={() => addToCart(item.id, 1)}>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white line-clamp-1">{item.name}</h4>
                    <p className="text-primary font-bold">{item.price} ج.م</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Customer & Plate Section */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  العميل (اختياري)
                </h3>
                <select 
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">عميل نقدي (بدون تسجيل)</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Package size={20} className="text-primary" />
                  رقم اللوحة / السيارة
                </h3>
                <input 
                  type="text"
                  placeholder="مثال: ب ب ب 111"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cart & Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
             <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <ShoppingCart size={20} className="text-primary" />
                  السلة
                </h3>
                <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">{cart.length} أصناف</span>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-3">
               <AnimatePresence>
                 {cart.length > 0 ? cart.map((item) => (
                   <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-700 border border-slate-50 dark:border-slate-600 gap-4"
                   >
                     <div className="flex-1">
                       <p className="text-sm font-bold truncate">{item.name}</p>
                       <p className="text-[10px] text-slate-400">{item.quantity} x {item.price} ج.م</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="font-bold text-sm">{(item.price * item.quantity).toFixed(2)}</span>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>
                   </motion.div>
                 )) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                     <ShoppingCart size={48} className="mb-2 opacity-20" />
                     <p className="text-xs">السلة فارغة</p>
                   </div>
                 )}
               </AnimatePresence>
             </div>

             <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 px-2 block">طريقة الدفع</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setPaymentMethod('نقدي')}
                      className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${paymentMethod === 'نقدي' ? 'bg-primary text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700'}`}
                    >
                      <DollarSign size={14} />
                      نقدي
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('فيزا')}
                      className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${paymentMethod === 'فيزا' ? 'bg-primary text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700'}`}
                    >
                      <CreditCard size={14} />
                      فيزا
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>الإجمالي قبل الخصم</span>
                    <span className="font-bold">{subtotal.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>الخصم</span>
                    <input 
                      type="number" 
                      value={discount || ''}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-20 text-left bg-transparent border-b border-slate-200 outline-none focus:border-primary font-bold"
                    />
                  </div>
                  <div className="flex justify-between items-center text-lg font-black text-slate-800 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span>الإجمالي النهائي</span>
                    <span className="text-primary">{total.toFixed(2)} ج.م</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {showSuccess ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 size={24} />
                      تم الحفظ
                    </div>
                  ) : 'إتمام البيع وطباعة الفاتورة'}
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b dark:border-slate-700 pb-4">
          <div className="text-left rtl">
            <h3 className="text-lg font-bold">آخر الفواتير</h3>
            <p className="text-xs text-slate-500">يمكنك استعراض أو طباعة أو إلغاء الفاتورة</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="text-slate-400 border-b dark:border-slate-700">
                <th className="py-4 font-bold">رقم الفاتورة</th>
                <th className="py-4 font-bold">العميل</th>
                <th className="py-4 font-bold">السيارة</th>
                <th className="py-4 font-bold">الإجمالي</th>
                <th className="py-4 font-bold">طريقة الدفع</th>
                <th className="py-4 font-bold text-center">الحالة</th>
                <th className="py-4 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="text-slate-700 dark:text-slate-200">
                  <td className="py-4 font-mono text-xs">INV-{inv.id}</td>
                  <td className="py-4 font-bold">{inv.customer}</td>
                  <td className="py-4 font-medium">{inv.carType || '-'}</td>
                  <td className="py-4 font-black">{inv.amount} ج.م</td>
                  <td className="py-4 italic text-slate-400 capitalize">{inv.method === 'نقدي' ? 'cash' : 'card'}</td>
                  <td className="py-4 text-center">
                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold">
                      مدفوعة
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setShowPreview(true);
                        }}
                        className="px-3 py-1 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100"
                      >
                        عرض
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm('هل تريد إلغاء هذه الفاتورة؟')) {
                            await fetch(`/api/data/invoices/${encodeURIComponent(inv.id)}`, { method: 'DELETE' });
                            fetchInvoices();
                          }
                        }}
                        className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100"
                      >
                        إلغاء
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {recentInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">لا توجد عمليات حديثة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-white">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 print:hidden">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handlePrint}
                    className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all flex items-center gap-2 hover:bg-slate-50"
                  >
                    <Printer size={18} />
                    <span>طباعة</span>
                  </button>
                  <button 
                    onClick={() => setShowPreview(false)}
                    className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all hover:bg-slate-300"
                  >
                    إغلاق
                  </button>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">عرض الفاتورة</h3>
                  <p className="text-xs text-slate-500">تفاصيل وسجل الفاتورة</p>
                </div>
              </div>

              <div className="overflow-y-auto flex-1">
                <div id="printable-invoice" className="p-8 space-y-6 bg-white text-slate-900 border-x-8 border-white">
                  {/* Center Header: QR and Info */}
                  <div className="flex flex-col items-center text-center space-y-4">
                    {settings.showQRCode && (
                      <div className="p-1 border border-slate-100 rounded-lg">
                        <QRCodeSVG value={`INV-${selectedInvoice.id}-${settings.companyName}`} size={100} />
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <h1 className="text-2xl font-black text-slate-900 uppercase">{settings.companyName}</h1>
                      <p className="text-sm font-medium text-slate-600">أهلاً بكم في مغسلتنا</p>
                      <p className="text-xs text-slate-500 tracking-widest">{settings.phone}</p>
                      <p className="text-xs text-slate-500">{settings.address}</p>
                    </div>
                  </div>

                  {/* Invoice Meta */}
                  <div className="space-y-1 text-[11px] font-bold text-slate-700 flex flex-col items-end">
                    <div className="flex gap-2">
                      <span>INV-{selectedInvoice.id}</span>
                      <span className="text-slate-400">:الفاتورة</span>
                    </div>
                    <div className="flex gap-2">
                      <span>{selectedInvoice.date}</span>
                      <span className="text-slate-400">:التاريخ</span>
                    </div>
                    <div className="flex gap-2">
                      <span>{selectedInvoice.customer}</span>
                      <span className="text-slate-400">:العميل</span>
                    </div>
                    {selectedInvoice.carType && (
                      <div className="flex gap-2">
                        <span>{selectedInvoice.carType}</span>
                        <span className="text-slate-400">:اللوحة</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <span className="uppercase">{selectedInvoice.method === 'نقدي' ? 'cash' : 'card'}</span>
                      <span className="text-slate-400">:الدفع</span>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="w-full">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-100">
                          <th className="py-2 text-right">إجمالي</th>
                          <th className="py-2 text-right">ك سعر</th>
                          <th className="py-2 text-right pr-4">الصنف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dashed divide-slate-200">
                        {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                          selectedInvoice.items.map((item: any, idx: number) => (
                            <tr key={idx} className="text-slate-700">
                              <td className="py-2.5 text-right font-bold">{item.price.toFixed(2)} ج.م</td>
                              <td className="py-2.5 text-right font-bold">1 <span className="text-slate-400 font-normal">x</span> {item.price.toFixed(2)} ج.م</td>
                              <td className="py-2.5 text-right pr-4 font-bold">{item.name}</td>
                            </tr>
                          ))
                        ) : (
                          <tr className="text-slate-700">
                            <td className="py-2.5 text-right font-bold">{selectedInvoice.amount.toFixed(2)} ج.م</td>
                            <td className="py-2.5 text-right font-bold">1 <span className="text-slate-400 font-normal">x</span> {selectedInvoice.amount.toFixed(2)} ج.م</td>
                            <td className="py-2.5 text-right pr-4 font-bold">{selectedInvoice.description}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Section */}
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                      <span>{selectedInvoice.amount.toFixed(2)} ج.م</span>
                      <span>قبل الخصم</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                      <span>0.00 ج.م</span>
                      <span>الخصم</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100">
                      <span className="text-xl font-black text-slate-900">{selectedInvoice.amount.toLocaleString()} ج.م</span>
                      <span className="text-lg font-black text-slate-900">الإجمالي</span>
                    </div>
                  </div>

                  {/* Footer text */}
                  <div className="pt-6 text-center">
                    <p className="text-[10px] text-slate-400 font-bold">{settings.footerText}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Service Add/Edit Modal */}
      <AnimatePresence>
        {showServiceModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <button onClick={() => setShowServiceModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X size={20} />
                </button>
                <div className="text-right">
                  <h3 className="text-lg font-black">{editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}</h3>
                  <p className="text-xs text-slate-500">أدخل بيانات الخدمة أو المنتج الجديد</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 px-2 block">اسم الخدمة / المنتج</label>
                  <input 
                    type="text"
                    value={serviceFormData.name}
                    onChange={(e) => setServiceFormData({...serviceFormData, name: e.target.value})}
                    placeholder="مثال: غسيل كامل"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-right font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 px-2 block">السعر (ج.م)</label>
                    <input 
                      type="number"
                      value={serviceFormData.price || ''}
                      onChange={(e) => setServiceFormData({...serviceFormData, price: Number(e.target.value)})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-right font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 px-2 block">التصنيف</label>
                    <select 
                      value={serviceFormData.category}
                      onChange={(e) => setServiceFormData({...serviceFormData, category: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-right font-bold"
                    >
                      <option value="wash">مغسلة</option>
                      <option value="product">منتجات</option>
                      <option value="cafe">كافيه</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={handleSaveService}
                    disabled={isSavingService}
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingService ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    {isSavingService ? 'جاري الحفظ...' : 'حفظ البيانات'}
                  </button>
                  {editingService && (
                    <button 
                      onClick={() => {
                        handleDeleteService(editingService.id);
                        setShowServiceModal(false);
                      }}
                      className="px-4 py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default POS;
