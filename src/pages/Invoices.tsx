import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  X,
  Trash2,
  Upload,
  Settings as SettingsIcon,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

interface InvoiceItem {
  name: string;
  price: number;
}

interface Invoice {
  id: string;
  customer: string;
  phone: string;
  carType: string;
  description: string;
  date: string;
  amount: number;
  status: string;
  method: string;
  items?: InvoiceItem[];
}

interface InvoiceSettings {
  companyName: string;
  logo: string;
  address: string;
  phone: string;
  vatNumber: string;
  showLogo: boolean;
  showQRCode: boolean;
  footerText: string;
}

interface InvoicesProps {
  preFillData?: { amount: number; description: string } | null;
  clearPreFill?: () => void;
}

const Invoices: React.FC<InvoicesProps> = ({ preFillData, clearPreFill }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [settings, setSettings] = useState<InvoiceSettings>({
    companyName: 'PRIMO',
    logo: '',
    address: 'القاهرة، مصر',
    phone: '01XXXXXXXXX',
    vatNumber: '',
    showLogo: true,
    showQRCode: true,
    footerText: 'شكراً لثقتكم في بريمو - نأمل رؤيتكم قريباً'
  });
  const [newInvoice, setNewInvoice] = useState({ 
    customer: '', 
    phone: '',
    carType: '',
    amount: 0, 
    method: 'نقدي',
    description: ''
  });

  useEffect(() => {
    fetchInvoices();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.invoice);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings/invoice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setShowSettings(false);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (preFillData) {
      setNewInvoice(prev => ({
        ...prev,
        amount: preFillData.amount,
        description: preFillData.description
      }));
      setShowAddModal(true);
    }
  }, [preFillData]);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/data/invoices');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/data/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...newInvoice, 
          date: new Date().toLocaleDateString('en-GB'), 
          status: 'paid' 
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewInvoice({ 
          customer: '', 
          phone: '', 
          carType: '', 
          amount: 0, 
          method: 'نقدي', 
          description: '' 
        });
        clearPreFill?.();
        fetchInvoices();
      }
    } catch (error) {
      console.error('Error adding invoice:', error);
    }
  };

  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      await fetch(`/api/data/invoices/${encodeURIComponent(invoiceToDelete)}`, { method: 'DELETE' });
      setInvoiceToDelete(null);
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    clearPreFill?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="البحث بالعميل..."
              className="w-full pr-10 pl-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <SettingsIcon size={20} />
            <span>إعدادات الفاتورة</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            <span>إصدار فاتورة</span>
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl p-8 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">إعدادات قالب الفاتورة</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Section */}
                <div className="space-y-4">
                  <label className="text-sm font-medium">شعار المؤسسة</label>
                  <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                    {settings.logo ? (
                      <div className="relative group">
                        <img src={settings.logo} alt="Logo" className="w-32 h-32 object-contain rounded-lg" />
                        <button 
                          onClick={() => setSettings({...settings, logo: ''})}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <ImageIcon size={48} className="mb-2" />
                        <span className="text-xs">لم يتم رفع شعار</span>
                      </div>
                    )}
                    <label className="cursor-pointer px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                      <Upload size={16} />
                      <span>{settings.logo ? 'تغيير الشعار' : 'رفع شعار جديد'}</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                  </div>
                </div>

                {/* Info Section */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">اسم الشركة</label>
                    <input 
                      type="text" 
                      value={settings.companyName}
                      onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                      className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">العنوان</label>
                    <input 
                      type="text" 
                      value={settings.address}
                      onChange={(e) => setSettings({...settings, address: e.target.value})}
                      className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">رقم الهاتف</label>
                    <input 
                      type="text" 
                      value={settings.phone}
                      onChange={(e) => setSettings({...settings, phone: e.target.value})}
                      className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">الرقم الضريبي (إن وجد)</label>
                    <input 
                      type="text" 
                      value={settings.vatNumber}
                      onChange={(e) => setSettings({...settings, vatNumber: e.target.value})}
                      className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-sm">خيارات العرض</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={settings.showLogo} 
                      onChange={(e) => setSettings({...settings, showLogo: e.target.checked})}
                      className="w-4 h-4 text-primary" 
                    />
                    <span className="text-sm font-medium">عرض الشعار</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={settings.showQRCode} 
                      onChange={(e) => setSettings({...settings, showQRCode: e.target.checked})}
                      className="w-4 h-4 text-primary" 
                    />
                    <span className="text-sm font-medium">عرض رمز QR</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">نص التذييل (Footer)</label>
                <textarea 
                  value={settings.footerText}
                  onChange={(e) => setSettings({...settings, footerText: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                  حفظ التغييرات
                </button>
                <button 
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-8 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-sm border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4 font-medium">رقم الفاتورة</th>
                <th className="px-6 py-4 font-medium">العميل</th>
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">المبلغ</th>
                <th className="px-6 py-4 font-medium">طريقة الدفع</th>
                <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">{inv.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold">{inv.customer}</span>
                        <span className="text-[10px] text-slate-500">{inv.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{inv.carType || '---'}</span>
                        <span className="text-[10px] text-primary">{inv.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{inv.date}</td>
                    <td className="px-6 py-4 font-bold">{inv.amount} ج.م</td>
                    <td className="px-6 py-4 text-sm">{inv.method}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => { setSelectedInvoice(inv); setShowPreview(true); }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => setInvoiceToDelete(inv.id)}
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
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">لا توجد فواتير مصدرة حالياً</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
          {invoices.length > 0 ? (
            invoices.map((inv) => (
              <div key={inv.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono text-primary font-bold mb-1">{inv.id}</p>
                    <h4 className="font-bold text-base">{inv.customer}</h4>
                    <p className="text-[10px] text-slate-500">{inv.date} • {inv.method}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{inv.amount} ج.م</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setSelectedInvoice(inv); setShowPreview(true); }}
                        className="p-2 bg-slate-50 text-slate-600 rounded-lg"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => setInvoiceToDelete(inv.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500">لا توجد فواتير حالياً</div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl p-8 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">إصدار فاتورة جديدة</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={handleAddInvoice}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">اسم العميل</label>
                  <input 
                    type="text" 
                    value={newInvoice.customer}
                    onChange={(e) => setNewInvoice({...newInvoice, customer: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">رقم الهاتف</label>
                  <input 
                    type="tel" 
                    value={newInvoice.phone}
                    onChange={(e) => setNewInvoice({...newInvoice, phone: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="01xxxxxxxxx"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">نوع السيارة</label>
                  <input 
                    type="text" 
                    value={newInvoice.carType}
                    onChange={(e) => setNewInvoice({...newInvoice, carType: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="بي ام دبليو، هيونداي..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">نوع الخدمة</label>
                  <input 
                    type="text" 
                    value={newInvoice.description}
                    onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="غسيل سريع، تلميع..."
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">المبلغ الإجمالي (ج.م)</label>
                  <input 
                    type="number" 
                    value={newInvoice.amount || ''}
                    onChange={(e) => setNewInvoice({...newInvoice, amount: Number(e.target.value)})}
                    className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">طريقة الدفع</label>
                  <select 
                    value={newInvoice.method}
                    onChange={(e) => setNewInvoice({...newInvoice, method: e.target.value})}
                    className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="نقدي">نقدي</option>
                    <option value="بطاقة">بطاقة</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all mt-6 shadow-lg shadow-primary/20">
                إصدار الفاتورة وحفظها
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {showPreview && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:relative">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none flex flex-col"
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
                <p className="text-xs text-slate-500">يمكنك الطباعة مباشرة</p>
              </div>
            </div>

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
                      selectedInvoice.items.map((item, idx) => (
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
          </motion.div>
        </div>
      )}

      {invoiceToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center gap-4 text-red-500 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold">تأكيد الحذف</h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              هل أنت متأكد من رغبتك في حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleDeleteInvoice}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                نعم، احذف الفاتورة
              </button>
              <button 
                onClick={() => setInvoiceToDelete(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
