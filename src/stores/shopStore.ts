import { create } from 'zustand';
import axios from 'axios';

// Interfaces for our Shop Management Modules
export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface POSItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  barcode: string;
  unit?: 'dona' | 'kg';
  description?: string;
  images?: string[];
}

// Category tree node
export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  iconUrl?: string;
  children?: Category[];
}

// Aksiya / Promo banner
export interface PromoBanner {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;          // Base64 yoki URL
  imageBase64?: string;       // Yuklangan rasm base64
  color: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
  productIds: string[];       // Qaysi mahsulotlarga tegishli
  createdAt: string;
}

// SMS sozlamalari
export interface SmsSettings {
  enabled: boolean;
  provider: 'eskiz';
  email: string;
  password: string;
  sender: string;
  token?: string;
  tokenExpiry?: string;
  events: {
    onOrderAccepted: boolean;
    onCustomerApproved: boolean;
    onPromoBlast: boolean;
    onDebtReminder: boolean;
  };
  templates: {
    orderAccepted: string;
    customerApproved: string;
    promoBlast: string;
    debtReminder: string;
  };
}

// SMS log yozuvi
export interface SmsLog {
  id: string;
  phone: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  event: string;
  timestamp: string;
  error?: string;
}

export interface CafeTable {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  activeOrders: CartItem[];
  totalAmount: number;
}

export interface LANNode {
  id: string;
  name: string;
  role: 'cashier' | 'waiter_1' | 'waiter_2' | 'kitchen';
  status: 'online' | 'offline' | 'reconnecting';
  ipAddress: string;
  latency: number;
  queueSize: number;
}

export interface IPCEventLog {
  id: string;
  timestamp: string;
  channel: string;
  direction: 'sent' | 'received';
  payload: string;
}

export interface LicenseInfo {
  hwid: string;
  licenseKey: string;
  status: 'trial' | 'active' | 'expired';
  trialDaysLeft: number;
  expiryDate: string;
  customerName: string;
  onlineVerified: boolean;
}

export interface TaskadeLog {
  id: string;
  title: string;
  type: 'Inventory' | 'Transaction' | 'Table' | 'License';
  qty: number;
  price: number;
  status: string;
  details: string;
}

export interface ShopState {
  // POS State
  posItems: POSItem[];
  cart: CartItem[];
  posLogs: string[];
  deliveryFee: number;

  // Categories
  categories: Category[];

  // Promo Banners
  promoBanners: PromoBanner[];

  // SMS
  smsSettings: SmsSettings;
  smsLogs: SmsLog[];
  
  // Cafe State
  cafeTables: CafeTable[];
  kitchenQueue: { id: string; tableName: string; items: CartItem[]; status: 'pending' | 'preparing' | 'ready' }[];
  
  // LAN Server State
  lanNodes: LANNode[];
  isLANServerOnline: boolean;
  lanSyncLogs: string[];
  offlineQueue: { type: string; data: any; timestamp: string }[];
  
  // IPC State
  ipcLogs: IPCEventLog[];
  isIPCAvailable: boolean;
  
  // License State
  license: LicenseInfo;
  licenseLogs: string[];
  
  // Taskade DB Sync
  taskadeProjectId: string;
  taskadeLogs: TaskadeLog[];
  isTaskadeSyncing: boolean;
  taskadeSyncError: string | null;

  // Actions
  // POS Actions
  addToCart: (item: POSItem, qty?: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  checkoutPOS: (paymentMethod: string) => Promise<void>;
  scanBarcode: (barcode: string) => void;
  setDeliveryFee: (fee: number) => void;

  // Category Actions
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, changes: Partial<Category>) => void;
  removeCategory: (id: string) => void;

  // Promo Banner Actions
  addPromoBanner: (banner: Omit<PromoBanner, 'id' | 'createdAt'>) => void;
  updatePromoBanner: (id: string, changes: Partial<PromoBanner>) => void;
  removePromoBanner: (id: string) => void;
  togglePromoBanner: (id: string) => void;

  // SMS Actions
  updateSmsSettings: (changes: Partial<SmsSettings>) => void;
  sendSms: (phone: string, message: string, event: string) => Promise<boolean>;
  sendSmsBlast: (phones: string[], message: string, event: string) => Promise<void>;
  eskizLogin: () => Promise<boolean>;
  addSmsLog: (log: Omit<SmsLog, 'id' | 'timestamp'>) => void;

  // Cafe Actions
  updateTableStatus: (tableId: string, status: 'available' | 'occupied' | 'reserved') => void;
  addOrderToTable: (tableId: string, items: CartItem[]) => void;
  clearTableOrders: (tableId: string) => Promise<void>;
  updateKitchenStatus: (orderId: string, status: 'preparing' | 'ready') => void;

  // LAN Server Actions
  toggleLANNode: (nodeId: string) => void;
  simulateLANServerState: (online: boolean) => void;
  triggerLANSync: () => Promise<void>;
  
  // IPC Actions
  sendIPCEvent: (channel: string, payload: any) => void;
  triggerHardwareEvent: (event: string) => void;
  clearIPCLogs: () => void;

  // License Actions
  activateLicenseKey: (key: string) => Promise<boolean>;
  checkLicenseOnline: () => Promise<void>;
  resetLicense: () => void;
  generateLicenseFile: () => string;
  verifyOfflineLicenseFile: (fileContent: string) => boolean;

  // Taskade Actions
  fetchFromTaskade: () => Promise<void>;
  logEventToTaskade: (module: string, eventType: string, details: string) => Promise<void>;
}

// Initial items
export const INITIAL_POS_ITEMS: POSItem[] = [
  { id: 'pos_1', name: 'Espresso Double', category: 'coffee', price: 3.5, stock: 150, barcode: '4780076010015', unit: 'dona' },
  { id: 'pos_2', name: 'Cappuccino XL', category: 'coffee', price: 4.2, stock: 120, barcode: '4780076010022', unit: 'dona' },
  { id: 'pos_3', name: 'Chicken Club Sandwich', category: 'food', price: 6.8, stock: 25, barcode: '4780076010039', unit: 'dona' },
  { id: 'pos_4', name: 'Cheesecake Slice', category: 'dessert', price: 4.5, stock: 18, barcode: '4780076010046', unit: 'dona' },
  { id: 'pos_5', name: 'Lavazza Coffee Beans (1kg)', category: 'retail', price: 15.0, stock: 50, barcode: '4780076010053', unit: 'kg' },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Ichimliklar', parentId: null },
  { id: 'cat_2', name: 'Ovqatlar', parentId: null },
  { id: 'cat_3', name: 'Shirinliklar', parentId: null },
  { id: 'cat_4', name: 'Chakana', parentId: null },
  { id: 'cat_5', name: 'Kofe', parentId: 'cat_1' },
  { id: 'cat_6', name: 'Choy', parentId: 'cat_1' },
];

export const DEFAULT_SMS_SETTINGS: SmsSettings = {
  enabled: false,
  provider: 'eskiz',
  email: '',
  password: '',
  sender: '4546',
  events: {
    onOrderAccepted: true,
    onCustomerApproved: true,
    onPromoBlast: true,
    onDebtReminder: true,
  },
  templates: {
    orderAccepted: "Hurmatli {ism}, buyurtmangiz qabul qilindi. Tez orada aloqaga chiqamiz. - {dokon}",
    customerApproved: "Hurmatli {ism}, hisobingiz tasdiqlandi. Endi online buyurtma bera olasiz! - {dokon}",
    promoBlast: "Aksiya! {sarlavha}: {matn} Batafsil: {link} - {dokon}",
    debtReminder: "Hurmatli {ism}, {summa} so'm qarzingiz bor. Iltimos to'lang. - {dokon}",
  },
};

export const INITIAL_TABLES: CafeTable[] = [
  { id: 'tab_1', name: 'Table 1 (Window)', capacity: 2, status: 'available', activeOrders: [], totalAmount: 0 },
  { id: 'tab_2', name: 'Table 2 (Couche)', capacity: 4, status: 'available', activeOrders: [], totalAmount: 0 },
  { id: 'tab_3', name: 'Table 3 (VIP Room)', capacity: 6, status: 'available', activeOrders: [], totalAmount: 0 },
  { id: 'tab_4', name: 'Table 4 (Outside)', capacity: 2, status: 'available', activeOrders: [], totalAmount: 0 },
  { id: 'tab_5', name: 'Table 5 (Bar Counter)', capacity: 1, status: 'available', activeOrders: [], totalAmount: 0 },
];

export const INITIAL_LAN_NODES: LANNode[] = [
  { id: 'node_cashier', name: 'Asosiy Kassa POS', role: 'cashier', status: 'online', ipAddress: '192.168.1.100', latency: 4, queueSize: 0 },
  { id: 'node_waiter1', name: 'Ofitsiant Plan_et 1', role: 'waiter_1', status: 'online', ipAddress: '192.168.1.101', latency: 24, queueSize: 0 },
  { id: 'node_waiter2', name: 'Ofitsiant Plan_et 2', role: 'waiter_2', status: 'online', ipAddress: '192.168.1.102', latency: 42, queueSize: 0 },
  { id: 'node_kitchen', name: 'Oshxona Monitori', role: 'kitchen', status: 'online', ipAddress: '192.168.1.110', latency: 12, queueSize: 0 },
];

export const getHWID = () => {
  return 'PRO-HWID-F38D-9102-BC89-10A2';
};

export const useShopStore = create<ShopState>((set, get) => ({
  posItems: INITIAL_POS_ITEMS,
  cart: [],
  posLogs: ['Savat tayyor.'],
  deliveryFee: 0,
  categories: INITIAL_CATEGORIES,
  promoBanners: [],
  smsSettings: DEFAULT_SMS_SETTINGS,
  smsLogs: [],
  
  cafeTables: INITIAL_TABLES,
  kitchenQueue: [],
  
  lanNodes: INITIAL_LAN_NODES,
  isLANServerOnline: true,
  lanSyncLogs: ['LAN Server ishga tushdi: 192.168.1.100:8080', 'Barcha terminallar bog\'langan.'],
  offlineQueue: [],
  
  ipcLogs: [
    { id: 'ipc_init', timestamp: new Date().toLocaleTimeString(), channel: 'system:init', direction: 'received', payload: 'IPC Handler initialized in desktop shell.' }
  ],
  isIPCAvailable: true,
  
  license: {
    hwid: getHWID(),
    licenseKey: '',
    status: 'trial',
    trialDaysLeft: 14,
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    customerName: 'Demo Foydalanuvchi',
    onlineVerified: false,
  },
  licenseLogs: ['Litsenziya tekshiruvi: Sinov muddati (14 kun qoldi).'],
  
  taskadeProjectId: 'U4WddfceJyNTQBeJ',
  taskadeLogs: [],
  isTaskadeSyncing: false,
  taskadeSyncError: null,

  // POS Actions
  addToCart: (item, qty = 1) => {
    set((state) => {
      const existing = state.cart.find((c) => c.id === item.id);
      let newCart;
      if (existing) {
        newCart = state.cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + qty } : c));
      } else {
        newCart = [...state.cart, { id: item.id, name: item.name, price: item.price, qty }];
      }
      return { 
        cart: newCart,
        posLogs: [`Savatga qo'shildi: ${item.name} x${qty}`, ...state.posLogs] 
      };
    });
    get().sendIPCEvent('scanner:beep', { success: true });
  },

  removeFromCart: (itemId) => {
    set((state) => {
      const item = state.cart.find((c) => c.id === itemId);
      return {
        cart: state.cart.filter((c) => c.id !== itemId),
        posLogs: [item ? `Savatdan olib tashlandi: ${item.name}` : 'Savat tahrirlandi', ...state.posLogs]
      };
    });
  },

  clearCart: () => set({ cart: [], posLogs: ['Savat tozalandi.', ...get().posLogs] }),

  checkoutPOS: async (paymentMethod) => {
    const { cart, isLANServerOnline, taskadeProjectId } = get();
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const orderId = `TRX-${Math.floor(1000 + Math.random() * 9000)}`;
    const details = cart.map(i => `${i.name} (${i.qty}x)`).join(', ');

    // Local checkout logging
    set((state) => ({
      posItems: state.posItems.map(item => {
        const cartItem = state.cart.find(c => c.id === item.id);
        return cartItem ? { ...item, stock: Math.max(0, item.stock - cartItem.qty) } : item;
      }),
      cart: [],
      posLogs: [`Sotuv yakunlandi! ID: ${orderId}, Jami: ${total.toFixed(2)} (${paymentMethod})`, ...state.posLogs],
    }));

    // Trigger local Thermal Receipt Printer via IPC
    get().sendIPCEvent('printer:print', { orderId, total, items: cart });

    // LAN Sync or Offline queueing
    if (isLANServerOnline) {
      set((state) => ({
        lanSyncLogs: [`Kassa Trx bog'landi: ${orderId} -> LAN Server`, ...state.lanSyncLogs]
      }));

      // Fire Taskade Webhook & directly log
      try {
        await axios.post('/api/taskade/webhooks/01KS319AH15FZWKHX8BT726YZS/run', {
          event_type: `Transaction Checkout: ${orderId}`,
          module: 'PRO Savdo',
          details: `POS transaction. Value: ${total.toFixed(2)}. Items: ${details}`
        });
        
        await axios.post(`/api/taskade/projects/${taskadeProjectId}/nodes`, {
          "/text": orderId,
          "/attributes/@e_typ": "opt_trx",
          "/attributes/@e_qty": 1,
          "/attributes/@e_prc": total,
          "/attributes/@e_stt": "st_compl",
          "/attributes/@e_det": `${paymentMethod} POS order: ${details}`
        });

        get().fetchFromTaskade();
      } catch (err) {
        console.error('Error logging transaction to Taskade:', err);
      }
    } else {
      // Offline mode
      set((state) => ({
        offlineQueue: [...state.offlineQueue, { type: 'checkout', data: { orderId, total, details, paymentMethod }, timestamp: new Date().toISOString() }],
        lanSyncLogs: [`OFLAYN REJIM: ${orderId} oflayn navbatga saqlandi.`, ...state.lanSyncLogs]
      }));
    }
  },

  setDeliveryFee: (fee) => set({ deliveryFee: fee }),

  // Category Actions
  addCategory: (cat) => {
    const id = `cat_${Date.now()}`;
    set((state) => ({ categories: [...state.categories, { ...cat, id }] }));
  },
  updateCategory: (id, changes) => {
    set((state) => ({
      categories: state.categories.map(c => c.id === id ? { ...c, ...changes } : c),
    }));
  },
  removeCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter(c => c.id !== id && c.parentId !== id),
    }));
  },

  // Promo Banner Actions
  addPromoBanner: (banner) => {
    const id = `promo_${Date.now()}`;
    const newBanner: PromoBanner = { ...banner, id, createdAt: new Date().toISOString() };
    set((state) => ({ promoBanners: [...state.promoBanners, newBanner] }));
    // SMS blast if enabled
    if (banner.active && get().smsSettings.enabled && get().smsSettings.events.onPromoBlast) {
      // blast asinxron  caller tomonidan boshqariladi
    }
  },
  updatePromoBanner: (id, changes) => {
    set((state) => ({
      promoBanners: state.promoBanners.map(b => b.id === id ? { ...b, ...changes } : b),
    }));
  },
  removePromoBanner: (id) => {
    set((state) => ({ promoBanners: state.promoBanners.filter(b => b.id !== id) }));
  },
  togglePromoBanner: (id) => {
    set((state) => ({
      promoBanners: state.promoBanners.map(b => b.id === id ? { ...b, active: !b.active } : b),
    }));
  },

  // SMS Actions
  updateSmsSettings: (changes) => {
    set((state) => ({ smsSettings: { ...state.smsSettings, ...changes } }));
  },

  addSmsLog: (log) => {
    const entry: SmsLog = { ...log, id: `sms_${Date.now()}`, timestamp: new Date().toISOString() };
    set((state) => ({ smsLogs: [entry, ...state.smsLogs].slice(0, 200) }));
  },

  eskizLogin: async () => {
    const { smsSettings } = get();
    if (!smsSettings.email || !smsSettings.password) return false;
    try {
      const res = await axios.post('https://notify.eskiz.uz/api/auth/login', {
        email: smsSettings.email,
        password: smsSettings.password,
      });
      const token = res.data?.data?.token;
      if (token) {
        set((state) => ({
          smsSettings: {
            ...state.smsSettings,
            token,
            tokenExpiry: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
          },
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  sendSms: async (phone, message, event) => {
    const { smsSettings } = get();
    if (!smsSettings.enabled || !smsSettings.token) {
      // Token yo'q  avval login qilib olishga urinib ko'r
      const ok = await get().eskizLogin();
      if (!ok) {
        get().addSmsLog({ phone, message, status: 'failed', event, error: 'Token olinmadi' });
        return false;
      }
    }
    try {
      const formData = new FormData();
      formData.append('mobile_phone', phone.replace(/\D/g, ''));
      formData.append('message', message);
      formData.append('from', smsSettings.sender);
      await axios.post('https://notify.eskiz.uz/api/message/sms/send', formData, {
        headers: { Authorization: `Bearer ${get().smsSettings.token}` },
      });
      get().addSmsLog({ phone, message, status: 'sent', event });
      return true;
    } catch (err: any) {
      get().addSmsLog({ phone, message, status: 'failed', event, error: err.message });
      return false;
    }
  },

  sendSmsBlast: async (phones, message, event) => {
    for (const phone of phones) {
      await get().sendSms(phone, message, event);
      await new Promise(r => setTimeout(r, 200)); // Eskiz rate limit uchun
    }
  },

  scanBarcode: (barcode) => {
    const item = get().posItems.find(i => i.barcode === barcode);
    if (item) {
      get().addToCart(item);
    } else {
      set((state) => ({
        posLogs: [`Xato: Shtrix-kod topilmadi: ${barcode}`, ...state.posLogs]
      }));
      get().sendIPCEvent('scanner:error', { barcode });
    }
  },

  // Cafe Actions
  updateTableStatus: (tableId, status) => {
    set((state) => ({
      cafeTables: state.cafeTables.map(t => t.id === tableId ? { ...t, status } : t)
    }));
    get().sendIPCEvent('table:update', { tableId, status });
  },

  addOrderToTable: (tableId, items) => {
    const table = get().cafeTables.find(t => t.id === tableId);
    if (!table) return;

    const newAmount = table.totalAmount + items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const updatedOrders = [...table.activeOrders];
    
    items.forEach(item => {
      const existing = updatedOrders.find(o => o.id === item.id);
      if (existing) {
        existing.qty += item.qty;
      } else {
        updatedOrders.push({ ...item });
      }
    });

    set((state) => ({
      cafeTables: state.cafeTables.map(t => t.id === tableId ? { ...t, status: 'occupied', activeOrders: updatedOrders, totalAmount: newAmount } : t),
      kitchenQueue: [...state.kitchenQueue, { id: `KTC-${Math.floor(1000 + Math.random() * 9000)}`, tableName: table.name, items, status: 'pending' }],
      lanSyncLogs: [`Stol Buyurtmasi: ${table.name} yangilandi -> LAN oshxona navbati.`, ...state.lanSyncLogs]
    }));

    get().sendIPCEvent('kitchen:order', { tableName: table.name, items });
  },

  clearTableOrders: async (tableId) => {
    const table = get().cafeTables.find(t => t.id === tableId);
    if (!table || table.activeOrders.length === 0) return;

    const total = table.totalAmount;
    const details = table.activeOrders.map(i => `${i.name} (${i.qty}x)`).join(', ');
    const orderId = `CAFE-${tableId.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    set((state) => ({
      cafeTables: state.cafeTables.map(t => t.id === tableId ? { ...t, status: 'available', activeOrders: [], totalAmount: 0 } : t),
      lanSyncLogs: [`Stol Yopildi: ${table.name} kassa jami: ${total.toFixed(2)}`, ...state.lanSyncLogs]
    }));

    get().sendIPCEvent('printer:print', { orderId, total, items: table.activeOrders });

    // LAN / Taskade sync
    if (get().isLANServerOnline) {
      try {
        await axios.post('/api/taskade/webhooks/01KS319AH15FZWKHX8BT726YZS/run', {
          event_type: `Cafe Checkout: ${orderId}`,
          module: 'PRO Cafe',
          details: `${table.name} completed. Value: ${total.toFixed(2)}. Orders: ${details}`
        });

        await axios.post(`/api/taskade/projects/${get().taskadeProjectId}/nodes`, {
          "/text": orderId,
          "/attributes/@e_typ": "opt_trx",
          "/attributes/@e_qty": 1,
          "/attributes/@e_prc": total,
          "/attributes/@e_stt": "st_compl",
          "/attributes/@e_det": `Cafe order for ${table.name}: ${details}`
        });

        get().fetchFromTaskade();
      } catch (err) {
        console.error('Error logging Cafe checkout:', err);
      }
    }
  },

  updateKitchenStatus: (orderId, status) => {
    set((state) => ({
      kitchenQueue: state.kitchenQueue.map(k => k.id === orderId ? { ...k, status } : k),
      lanSyncLogs: [`Oshxona Buyurtmasi [${orderId}]: ${status.toUpperCase()}`, ...state.lanSyncLogs]
    }));
    get().sendIPCEvent('kitchen:status', { orderId, status });
  },

  // LAN Server Actions
  toggleLANNode: (nodeId) => {
    set((state) => ({
      lanNodes: state.lanNodes.map(n => n.id === nodeId ? { ...n, status: n.status === 'online' ? 'offline' : 'online' } : n)
    }));
  },

  simulateLANServerState: (online) => {
    set((state) => ({
      isLANServerOnline: online,
      lanSyncLogs: [
        online ? 'LAN Tarmoq Serveri onlayn holatga qaytdi.' : 'LAN Tarmoq Serveri uzildi! Oflayn hisob-kitob yoqildi.',
        ...state.lanSyncLogs
      ]
    }));
    if (online) {
      get().triggerLANSync();
    }
  },

  triggerLANSync: async () => {
    const { offlineQueue, isLANServerOnline, taskadeProjectId } = get();
    if (offlineQueue.length === 0 || !isLANServerOnline) return;

    set((state) => ({
      lanSyncLogs: ['Oflayn navbatni server bilan sinxronlash boshlandi...', ...state.lanSyncLogs]
    }));

    for (const trx of offlineQueue) {
      if (trx.type === 'checkout') {
        const { orderId, total, details, paymentMethod } = trx.data;
        try {
          await axios.post(`/api/taskade/projects/${taskadeProjectId}/nodes`, {
            "/text": `${orderId}-OFL`,
            "/attributes/@e_typ": "opt_trx",
            "/attributes/@e_qty": 1,
            "/attributes/@e_prc": total,
            "/attributes/@e_stt": "st_compl",
            "/attributes/@e_det": `[Oflayn Sinxronlangan] ${paymentMethod} POS order: ${details}`
          });
        } catch (e) {
          console.error('Offline element sync failed:', e);
        }
      }
    }

    set((state) => ({
      offlineQueue: [],
      lanSyncLogs: ['Sinxronizatsiya muvaffaqiyatli yakunlandi! Oflayn ma\'lumotlar saqlandi.', ...state.lanSyncLogs]
    }));
    
    get().fetchFromTaskade();
  },

  // IPC Actions
  sendIPCEvent: (channel, payload) => {
    const event: IPCEventLog = {
      id: `ipc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      channel,
      direction: 'sent',
      payload: JSON.stringify(payload)
    };
    set((state) => ({
      ipcLogs: [event, ...state.ipcLogs].slice(0, 50)
    }));

    // Simulating hardware response after small delay
    setTimeout(() => {
      let replyPayload = { status: 'ok' };
      if (channel === 'printer:print') {
        replyPayload = { status: 'printed', message: 'Thermal ticket printed successfully on COM3.' };
      } else if (channel === 'scanner:beep') {
        replyPayload = { status: 'beeped', frequency: '2200Hz' };
      } else if (channel === 'kitchen:order') {
        replyPayload = { status: 'notified', terminalId: 'KTC-1' };
      }

      const reply: IPCEventLog = {
        id: `ipc_reply_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        channel: `${channel}:reply`,
        direction: 'received',
        payload: JSON.stringify(replyPayload)
      };

      set((state) => ({
        ipcLogs: [reply, ...state.ipcLogs]
      }));
    }, 400);
  },

  triggerHardwareEvent: (event) => {
    let channel = 'hardware:unknown';
    let payload: any = {};

    if (event === 'barcode_scan') {
      channel = 'scanner:data';
      const randomItem = get().posItems[Math.floor(Math.random() * get().posItems.length)];
      payload = { barcode: randomItem.barcode, symbol: 'EAN13' };
      get().scanBarcode(randomItem.barcode);
    } else if (event === 'cash_drawer_trigger') {
      channel = 'drawer:open';
      payload = { method: 'POS-trigger', status: 'opened' };
    }

    const log: IPCEventLog = {
      id: `ipc_hard_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      channel,
      direction: 'received',
      payload: JSON.stringify(payload)
    };

    set((state) => ({
      ipcLogs: [log, ...state.ipcLogs]
    }));
  },

  clearIPCLogs: () => set({ ipcLogs: [] }),

  // License Actions
  activateLicenseKey: async (key) => {
    const hwid = getHWID();
    set((state) => ({
      licenseLogs: [`Litsenziyani tekshirish kodi: ${key}...`, ...state.licenseLogs]
    }));

    const isValid = key.trim().toUpperCase().startsWith('PRO-SHOP-');
    if (isValid) {
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);

      set((state) => ({
        license: {
          ...state.license,
          licenseKey: key,
          status: 'active',
          trialDaysLeft: 365,
          expiryDate: expirationDate.toLocaleDateString(),
          customerName: 'Premium Tashkilot',
          onlineVerified: true
        },
        licenseLogs: [`Litsenziya muvaffaqiyatli faollashtirildi! HWID mos tushdi. Tugash muddati: ${expirationDate.toLocaleDateString()}`, ...state.licenseLogs]
      }));

      // Log activation in Taskade
      try {
        await axios.post(`/api/taskade/projects/${get().taskadeProjectId}/nodes`, {
          "/text": `Activated License: ${key}`,
          "/attributes/@e_typ": "opt_lic",
          "/attributes/@e_qty": 1,
          "/attributes/@e_prc": 199.00,
          "/attributes/@e_stt": "st_activ",
          "/attributes/@e_det": `Hardware ID: ${hwid}. Customer: Premium Tashkilot`
        });
        get().fetchFromTaskade();
      } catch (err) {
        console.error('License log to Taskade failed:', err);
      }

      return true;
    } else {
      set((state) => ({
        licenseLogs: [`Xato: Litsenziya kaliti haqiqiy emas yoki boshqa qurilmaga bog'langan!`, ...state.licenseLogs]
      }));
      return false;
    }
  },

  checkLicenseOnline: async () => {
    const { license, taskadeProjectId } = get();
    if (!license.licenseKey) {
      set((state) => ({
        licenseLogs: [`Onlayn tekshiruv: Kalit kiritilmagan. Sinov rejimida ishlashda davom etmoqda.`, ...state.licenseLogs]
      }));
      return;
    }

    set((state) => ({
      licenseLogs: [`PRO Server bilan bog'lanmoqda: litsenziya kaliti validatsiyasi...`, ...state.licenseLogs]
    }));

    try {
      const res = await axios.get(`/api/taskade/projects/${taskadeProjectId}/nodes`);
      const nodes = res.data.payload.nodes || [];
      const isRegistered = nodes.some((n: any) => n.fieldValues['/text']?.includes(license.licenseKey));

      if (isRegistered) {
        set((state) => ({
          license: { ...state.license, onlineVerified: true },
          licenseLogs: [`Onlayn tekshiruv muvaffaqiyatli! Litsenziya tasdiqlandi.`, ...state.licenseLogs]
        }));
      } else {
        set((state) => ({
          license: { ...state.license, onlineVerified: false },
          licenseLogs: [`Onlayn tekshiruv muvaffaqiyatsiz: Litsenziya topilmadi.`, ...state.licenseLogs]
        }));
      }
    } catch (err) {
      set((state) => ({
        licenseLogs: [`Onlayn tekshiruv: Server bog'lanishida uzilish, lokal keshdan tasdiqlandi.`, ...state.licenseLogs]
      }));
    }
  },

  resetLicense: () => {
    set((state) => ({
      license: {
        hwid: getHWID(),
        licenseKey: '',
        status: 'trial',
        trialDaysLeft: 14,
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        customerName: 'Demo Foydalanuvchi',
        onlineVerified: false,
      },
      licenseLogs: ['Litsenziya holati tozalab yuborildi.', ...state.licenseLogs]
    }));
  },

  generateLicenseFile: () => {
    const data = {
      hwid: getHWID(),
      licenseKey: get().license.licenseKey || 'PRO-SHOP-OFFLINE-TRIAL',
      status: get().license.status,
      created: new Date().toISOString(),
      checksum: 'A39BC8E90DF124'
    };
    return btoa(JSON.stringify(data));
  },

  verifyOfflineLicenseFile: (fileContent) => {
    try {
      const decoded = JSON.parse(atob(fileContent));
      if (decoded.hwid === getHWID() && decoded.licenseKey.startsWith('PRO-SHOP-')) {
        set((state) => ({
          license: {
            ...state.license,
            licenseKey: decoded.licenseKey,
            status: 'active',
            trialDaysLeft: 365,
            expiryDate: '31.12.2026',
            customerName: 'Oflayn Faollashtirilgan premium',
            onlineVerified: false
          },
          licenseLogs: [`Oflayn litsenziya fayli orqali tasdiqlandi! Kalit: ${decoded.licenseKey}`, ...state.licenseLogs]
        }));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    set((state) => ({
      licenseLogs: [`Oflayn litsenziya fayli yaroqsiz yoki shifrlash kodi mos kelmadi!`, ...state.licenseLogs]
    }));
    return false;
  },

  // Taskade Actions
  fetchFromTaskade: async () => {
    const { taskadeProjectId } = get();
    set({ isTaskadeSyncing: true, taskadeSyncError: null });

    try {
      const res = await axios.get(`/api/taskade/projects/${taskadeProjectId}/nodes`);
      const nodes = res.data.payload.nodes || [];

      const mappedLogs: TaskadeLog[] = nodes.map((n: any) => {
        const title = n.fieldValues['/text'] || '';
        const rawType = n.fieldValues['/attributes/@e_typ'] || '';
        const details = n.fieldValues['/attributes/@e_det'] || '';
        const qty = Number(n.fieldValues['/attributes/@e_qty']) || 0;
        const price = Number(n.fieldValues['/attributes/@e_prc']) || 0;
        const statusVal = n.fieldValues['/attributes/@e_stt'] || '';

        let type: 'Inventory' | 'Transaction' | 'Table' | 'License' = 'Inventory';
        if (rawType === 'opt_trx') type = 'Transaction';
        if (rawType === 'opt_tab') type = 'Table';
        if (rawType === 'opt_lic') type = 'License';

        return {
          id: n.id,
          title,
          type,
          qty,
          price,
          status: statusVal,
          details,
        };
      });

      set({ taskadeLogs: mappedLogs, isTaskadeSyncing: false });
    } catch (err: any) {
      set({ 
        taskadeSyncError: err.message || 'Taskade ulanish xatosi', 
        isTaskadeSyncing: false 
      });
    }
  },

  logEventToTaskade: async (module, eventType, details) => {
    try {
      await axios.post('/api/taskade/webhooks/01KS319AH15FZWKHX8BT726YZS/run', {
        event_type: eventType,
        module,
        details
      });
      get().fetchFromTaskade();
    } catch (e) {
      console.error(e);
    }
  }
})));


