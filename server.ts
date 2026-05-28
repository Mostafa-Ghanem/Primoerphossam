import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Simple in-memory DB
  let data: any = {
    bookings: [],
    customers: [],
    services: [
      { id: '1', name: 'غسيل بريمو سريع', price: 150, duration: '20 دقيقة', color: 'bg-blue-100 text-blue-600', category: 'wash' },
      { id: '2', name: 'غسيل VIP شامل', price: 400, duration: '60 دقيقة', color: 'bg-indigo-100 text-indigo-600', category: 'wash' },
      { id: '3', name: 'تلميع واكس', price: 800, duration: '120 دقيقة', color: 'bg-amber-100 text-amber-600', category: 'wash' },
      { id: 'product_1', name: 'بخاخ لمعة', price: 85, duration: '-', color: 'bg-zinc-100 text-zinc-600', category: 'product' },
      { id: 'product_2', name: 'شامبو سيارات', price: 110, duration: '-', color: 'bg-blue-100 text-blue-600', category: 'product' },
      { id: 'product_3', name: 'مناديل تنظيف', price: 20, duration: '-', color: 'bg-green-100 text-green-600', category: 'product' },
      { id: 'product_4', name: 'معطر سيارة', price: 35, duration: '-', color: 'bg-rose-100 text-rose-600', category: 'product' },
      { id: 'product_5', name: 'مساحات سيارات', price: 175, duration: '-', color: 'bg-slate-100 text-slate-600', category: 'product' },
      { id: 'product_6', name: 'شاحن سيارة', price: 375, duration: '-', color: 'bg-indigo-100 text-indigo-600', category: 'product' },
      { id: 'product_7', name: 'معطر جيل', price: 100, duration: '-', color: 'bg-emerald-100 text-emerald-600', category: 'product' },
      { id: 'product_8', name: 'معطر كارت', price: 70, duration: '-', color: 'bg-orange-100 text-orange-600', category: 'product' },
      { id: 'product_9', name: 'مسند عادي', price: 210, duration: '-', color: 'bg-zinc-100 text-zinc-600', category: 'product' },
      { id: '4', name: 'قهوة بريمو', price: 30, duration: '5 دقائق', color: 'bg-orange-100 text-orange-600', category: 'cafe' },
      { id: '5', name: 'نسكافيه', price: 25, duration: '5 دقائق', color: 'bg-brown-100 text-brown-600', category: 'cafe' },
      { id: '6', name: 'إسبريسو', price: 35, duration: '3 دقائق', color: 'bg-zinc-100 text-zinc-600', category: 'cafe' },
      { id: '7', name: 'شاي', price: 15, duration: '3 دقائق', color: 'bg-red-100 text-red-600', category: 'cafe' },
      { id: '8', name: 'عصير طبيعي', price: 40, duration: '10 دقائق', color: 'bg-green-100 text-green-600', category: 'cafe' },
    ],
    employees: [],
    invoices: [],
    expenses: [],
    cafeOrders: [],
    users: [
      { id: '1', name: 'أحمد سعيد', email: 'admin@primo.com', role: 'مدير نظام', lastActive: 'نشط الآن' },
      { id: '2', name: 'سارة محمد', email: 'sara@primo.com', role: 'محاسب', lastActive: 'منذ ساعتين' },
      { id: '3', name: 'خالد صبحي', email: 'khaled@primo.com', role: 'موظف استقبال', lastActive: 'منذ ٥ ساعات' },
    ],
    activities: [],
    settings: {
      invoice: {
        companyName: 'PRIMO',
        logo: '',
        address: 'القاهرة، مصر',
        phone: '',
        vatNumber: '',
        showLogo: true,
        showQRCode: true,
        footerText: 'شكراً لثقتكم في بريمو - نأمل رؤيتكم قريباً'
      },
      dashboard: {
        widgets: [
          { id: 'stats_grid', title: 'إحصائيات سريعة', enabled: true, order: 1 },
          { id: 'weekly_chart', title: 'مخطط الأداء الأسبوعي', enabled: true, order: 2 },
          { id: 'performance_memos', title: 'ملاحظات الأداء', enabled: true, order: 3 },
          { id: 'recent_activity', title: 'آخر العمليات', enabled: true, order: 4 }
        ]
      }
    }
  };

  let invoiceCounter = 0;

  app.get("/api/settings", (req, res) => {
    res.json(data.settings);
  });

  app.put("/api/settings/:key", (req, res) => {
    const { key } = req.params;
    if (data.settings[key]) {
      data.settings[key] = { ...data.settings[key], ...req.body };
      res.json(data.settings[key]);
    } else {
      res.status(404).json({ error: 'Settings key not found' });
    }
  });

  app.get("/api/data/:collection", (req, res) => {
    const { collection } = req.params;
    console.log(`Fetching collection: ${collection}`);
    if (!data[collection]) {
      console.warn(`Collection ${collection} not found in memory DB`);
    }
    res.setHeader('Content-Type', 'application/json');
    res.json(data[collection] || []);
  });

  app.post("/api/data/:collection", (req, res) => {
    const { collection } = req.params;
    let itemId;
    
    if (collection === 'invoices') {
      invoiceCounter++;
      itemId = `${invoiceCounter.toString().padStart(3, '0')}/2026`;
    } else {
      itemId = Math.random().toString(36).substr(2, 9);
    }
    
    const item = { ...req.body, id: itemId };
    
    if (!data[collection]) {
      data[collection] = [];
    }
    data[collection].push(item);

    // Log Activity
    if (collection !== 'activities') {
      const collNames: any = {
        'invoices': 'فاتورة جديدة',
        'expenses': 'مصروف جديد',
        'customers': 'عميل جديد',
        'services': 'خدمة جديدة',
        'users': 'مستخدم جديد',
        'cafeOrders': 'طلب كافيه'
      };
      const activity = {
        id: Math.random().toString(36).substr(2, 9),
        user: 'المدير',
        action: collNames[collection] || `إضافة في ${collection}`,
        details: item.name || item.amount || itemId,
        time: new Date().toLocaleTimeString('ar-EG'),
        date: new Date().toLocaleDateString('ar-EG')
      };
      if (!data.activities) data.activities = [];
      data.activities.unshift(activity);
    }

    res.json(item);
  });

  app.put("/api/data/:collection/:id", (req, res) => {
    const { collection, id } = req.params;
    if (data[collection]) {
      const index = data[collection].findIndex((item: any) => item.id === id);
      if (index !== -1) {
        data[collection][index] = { ...data[collection][index], ...req.body };
        
        // Log Activity
        if (collection !== 'activities') {
          const collNames: any = {
            'invoices': 'فاتورة',
            'expenses': 'مصروفات',
            'customers': 'بيانات عميل',
            'services': 'خدمة',
            'users': 'بيانات مستخدم',
            'cafeOrders': 'طلب كافيه'
          };
          const activity = {
            id: Math.random().toString(36).substr(2, 9),
            user: 'المدير',
            action: `تعديل ${collNames[collection] || collection}`,
            details: id,
            time: new Date().toLocaleTimeString('ar-EG'),
            date: new Date().toLocaleDateString('ar-EG')
          };
          if (!data.activities) data.activities = [];
          data.activities.unshift(activity);
        }

        res.json(data[collection][index]);
        return;
      }
    }
    res.status(404).json({ error: 'Item not found' });
  });

  app.delete("/api/data/:collection/:id", (req, res) => {
    const { collection, id } = req.params;
    if (data[collection]) {
      const itemToDelete = data[collection].find((item: any) => item.id === id);
      
      data[collection] = data[collection].filter((item: any) => item.id !== id);

      // Log Activity
      if (collection !== 'activities' && itemToDelete) {
        const collNames: any = {
          'invoices': 'فاتورة',
          'expenses': 'مصروف',
          'customers': 'عميل',
          'services': 'خدمة',
          'users': 'مستخدم',
          'cafeOrders': 'طلب'
        };
        const activity = {
          id: Math.random().toString(36).substr(2, 9),
          user: 'المدير',
          action: `حذف ${collNames[collection] || collection}`,
          details: itemToDelete.name || itemToDelete.amount || id,
          time: new Date().toLocaleTimeString('ar-EG'),
          date: new Date().toLocaleDateString('ar-EG')
        };
        if (!data.activities) data.activities = [];
        data.activities.unshift(activity);
      }
    }
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
