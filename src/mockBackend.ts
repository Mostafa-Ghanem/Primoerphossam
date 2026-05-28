export function mockBackend() {
  const originalFetch = window.fetch;

  if (!localStorage.getItem('primo_db')) {
    localStorage.setItem('primo_db', JSON.stringify({
      services: [
        { id: '1', name: 'غسيل خارجي', price: 50, duration: '20 دقيقة', color: 'bg-blue-100 text-blue-600', category: 'wash' },
        { id: '2', name: 'غسيل داخلي وخارجي', price: 100, duration: '45 دقيقة', color: 'bg-indigo-100 text-indigo-600', category: 'wash' },
        { id: '3', name: 'غسيل كيماوي', price: 300, duration: '120 دقيقة', color: 'bg-purple-100 text-purple-600', category: 'wash' },
        { id: '4', name: 'معطر سيارة', price: 20, duration: 'فوري', color: 'bg-pink-100 text-pink-600', category: 'product' },
        { id: '5', name: 'قهوة اسبريسو', price: 30, duration: '5 دقائق', color: 'bg-orange-100 text-orange-600', category: 'cafe' },
      ],
      customers: [],
      invoices: [],
      expenses: [],
      users: [
        { id: '1', name: 'أحمد سعيد', email: 'admin@primo.com', role: 'مدير نظام', lastActive: 'نشط الآن' },
        { id: '2', name: 'سارة محمد', email: 'sara@primo.com', role: 'محاسب', lastActive: 'منذ ساعتين' },
      ],
      employees: [],
      cafeOrders: [],
      activities: [],
      settings: {
        invoice: {
          companyName: 'بريمو لغسيل السيارات',
          phone: "01000000000",
          address: "القاهرة، مصر",
          taxNumber: "",
          footerText: "شكراً لزيارتكم، نتمنى لكم يوماً سعيداً",
          showQRCode: true,
          showLogo: true
        },
        dashboard: {
          widgets: [
            { id: 'stats_grid', title: 'شبكة الإحصائيات', enabled: true, order: 1 },
            { id: 'weekly_chart', title: 'الرسم البياني الأسبوعي', enabled: true, order: 2 },
            { id: 'performance_memos', title: 'ملاحظات الأداء', enabled: true, order: 3 },
            { id: 'recent_activity', title: 'النشاط الأخير', enabled: true, order: 4 }
          ]
        }
      }
    }));
  }

  function getDb() {
    return JSON.parse(localStorage.getItem('primo_db') || '{}');
  }

  function saveDb(db: any) {
    localStorage.setItem('primo_db', JSON.stringify(db));
  }

  function logActivity(db: any, collection: string, item: any, actionType: 'add' | 'edit' | 'delete') {
    if (collection === 'activities') return;
    
    const collNames: any = {
      'invoices': 'فاتورة',
      'expenses': 'مصروف',
      'customers': 'عميل',
      'services': 'خدمة',
      'users': 'مستخدم',
      'cafeOrders': 'طلب'
    };

    let actionName = actionType === 'add' ? `إضافة ${collNames[collection] || collection}` :
                     actionType === 'edit' ? `تعديل ${collNames[collection] || collection}` :
                     `حذف ${collNames[collection] || collection}`;

    const activity = {
      id: Math.random().toString(36).substr(2, 9),
      user: 'المدير',
      action: actionName,
      details: item.name || item.amount || item.id || 'عنصر',
      time: new Date().toLocaleTimeString('ar-EG'),
      date: new Date().toLocaleDateString('ar-EG')
    };
    
    if (!db.activities) db.activities = [];
    db.activities.unshift(activity);
  }

  window.fetch = async (...args) => {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
    
    if (url.startsWith('/api/')) {
      const db = getDb();
      const options = args[1] || {};
      const method = (options.method || 'GET').toUpperCase();
      const pathParts = url.split('/').filter(Boolean); // ['api', 'data', 'services']
      
      // /api/settings or /api/data/settings
      if (pathParts[1] === 'settings' || (pathParts[1] === 'data' && pathParts[2] === 'settings')) {
         if (method === 'GET') {
            return new Response(JSON.stringify(db.settings), {
               status: 200,
               headers: { 'Content-Type': 'application/json' }
            });
         }
         // PUT or POST
         const body = JSON.parse(options.body as string || '{}');
         db.settings = { ...db.settings, ...body };
         saveDb(db);
         return new Response(JSON.stringify(db.settings), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      
      // /api/data/:collection
      if (pathParts[1] === 'data' && pathParts[2]) {
         const collection = pathParts[2];
         const id = pathParts[3];
         
         if (!db[collection]) db[collection] = [];
         
         await new Promise(r => setTimeout(r, 150)); // Sim network latency
         
         if (method === 'GET') {
            if (id) {
               const item = db[collection].find((i: any) => i.id === id);
               if (item) return new Response(JSON.stringify(item), { status: 200, headers: { 'Content-Type': 'application/json' }});
               return new Response(JSON.stringify({error: 'Not found'}), { status: 404, headers: { 'Content-Type': 'application/json' }});
            }
            return new Response(JSON.stringify(db[collection]), { status: 200, headers: { 'Content-Type': 'application/json' }});
         }
         
         if (method === 'POST') {
            const body = JSON.parse(options.body as string || '{}');
            const newItem = { id: Math.random().toString(36).substr(2, 9), ...body };
            db[collection].push(newItem);
            logActivity(db, collection, newItem, 'add');
            saveDb(db);
            return new Response(JSON.stringify(newItem), { status: 201, headers: { 'Content-Type': 'application/json' } });
         }
         
         if (method === 'PUT') {
            const body = JSON.parse(options.body as string || '{}');
            const index = db[collection].findIndex((i: any) => i.id === id);
            if (index !== -1) {
               db[collection][index] = { ...db[collection][index], ...body };
               logActivity(db, collection, db[collection][index], 'edit');
               saveDb(db);
               return new Response(JSON.stringify(db[collection][index]), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }
            return new Response(JSON.stringify({error: 'Not found'}), { status: 404, headers: { 'Content-Type': 'application/json' } });
         }
         
         if (method === 'DELETE') {
            const item = db[collection].find((i: any) => i.id === id);
            if (item) {
              db[collection] = db[collection].filter((i: any) => i.id !== id);
              logActivity(db, collection, item, 'delete');
              saveDb(db);
            }
            return new Response(JSON.stringify({success: true}), { status: 200, headers: { 'Content-Type': 'application/json' } });
         }
      }
      
      return new Response(JSON.stringify({error: 'Not found'}), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
  
    return originalFetch(...args);
  };
}
