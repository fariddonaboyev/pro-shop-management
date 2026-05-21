import React, { useState } from 'react';
import { useShopStore, POSItem } from '../stores/shopStore';
import { ShoppingCart, Barcode, Trash2, CreditCard, DollarSign, Cpu, FileText, Truck } from 'lucide-react';

export const SavdoModule: React.FC = () => {
  const {
    posItems,
    cart,
    posLogs,
    ipcLogs,
    categories,
    deliveryFee,
    addToCart,
    removeFromCart,
    clearCart,
    checkoutPOS,
    triggerHardwareEvent,
    clearIPCLogs,
    setDeliveryFee,
  } = useShopStore();

  const [paymentMethod, setPaymentMethod] = useState<'naqd' | 'karta'>('naqd');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [deliveryMode, setDeliveryMode] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + (deliveryMode ? deliveryFee : 0);

  const filteredItems = posItems.filter(item => {
    const matchesCat = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.barcode.includes(search);
    return matchesCat && matchesSearch;
  });

  const handleCheckout = () => {
    checkoutPOS(paymentMethod === 'naqd' ? 'Naqd Pul' : 'Bank Karta');
  };

  const isCartEmpty = cart.length === 0;
  const isIpcLogsEmpty = ipcLogs.length === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
      {/* POS Catalog */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                PRO Savdo (Kassa)
              </h2>
              <p className="text-sm text-muted-foreground">Tezkor savdo va kassa tizimi</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => triggerHardwareEvent('barcode_scan')}
                className="flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 rounded-xl px-4 py-2 text-sm transition-all shadow-lg active:scale-95"
              >
                <Barcode className="h-4 w-4" />
                <span>Shtrix Skaner (Simulyatsiya)</span>
              </button>
              <button
                onClick={() => triggerHardwareEvent('cash_drawer_trigger')}
                className="flex items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 rounded-xl px-4 py-2 text-sm transition-all shadow-lg active:scale-95"
              >
                <Cpu className="h-4 w-4" />
                <span>Kassani Ochish</span>
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Mahsulot nomi yoki shtrix-kodi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-background/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <div className="flex gap-1 overflow-x-auto p-1 bg-background/30 rounded-xl border border-border/50">
              {['all', ...categories.filter(c => c.parentId === null).map(c => c.id)].map((catId) => {
                const catName = catId === 'all' ? 'Barchasi' : (categories.find(c => c.id === catId)?.name ?? catId);
                return (
                  <button
                    key={catId}
                    onClick={() => setFilterCategory(catId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                      filterCategory === catId
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-muted-foreground hover:bg-background/80 hover:text-foreground'
                    }`}
                  >
                    {catName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const isOutOfStock = item.stock <= 0;
              return (
                <div
                  key={item.id}
                  onClick={() => !isOutOfStock && addToCart(item)}
                  className={`group relative flex flex-col justify-between border rounded-xl p-4 bg-background/40 hover:bg-background/80 transition-all cursor-pointer shadow hover:shadow-lg ${
                    isOutOfStock ? 'opacity-50 cursor-not-allowed border-dashed' : 'border-border/60 hover:border-blue-500/40'
                  }`}
                >
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 mb-2">
                      {item.category}
                    </span>
                    <h4 className="font-semibold text-sm group-hover:text-blue-400 transition-colors">{item.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">Kod: {item.barcode}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-base text-emerald-400">${item.price.toFixed(2)}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      item.stock > 10 ? 'bg-zinc-800 text-zinc-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {isOutOfStock ? 'Qolmagan' : `${item.stock} dona`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* IPC Logger Terminal */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-3 font-mono">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-zinc-300">IPC Bridge Events (Local Hardware link)</h3>
            </div>
            <button
              onClick={clearIPCLogs}
              className="text-[11px] hover:text-zinc-300 transition text-zinc-500"
            >
              Tozalash
            </button>
          </div>
          <div className="h-[220px] overflow-y-auto text-xs space-y-2 p-2 bg-black/40 rounded-xl border border-zinc-900 scrollbar-thin scrollbar-thumb-zinc-800">
            {isIpcLogsEmpty ? (
              <p className="text-zinc-600 italic">Hech qanday IPC hodisalari mavjud emas.</p>
            ) : (
              ipcLogs.map((log) => {
                const isReceived = log.direction === 'received';
                return (
                  <div key={log.id} className="border-b border-zinc-900 pb-1.5 last:border-0">
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>{log.timestamp}</span>
                      <span className={isReceived ? 'text-indigo-400' : 'text-amber-400'}>
                        {isReceived ? 'ê LOCAL_REPLY' : 'í ELECTRON_SEND'}
                      </span>
                    </div>
                    <div className="font-semibold text-zinc-300 mt-0.5 flex gap-1">
                      <span className="text-emerald-500">[{log.channel}]</span>
                      <span className="text-zinc-400 truncate">{log.payload}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="space-y-6">
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl flex flex-col h-[520px] justify-between">
          <div className="space-y-4 overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-center border-b border-border/40 pb-3">
              <h3 className="font-bold flex items-center gap-2 text-foreground">
                <ShoppingCart className="h-5 w-5 text-blue-400" />
                <span>Savatcha</span>
              </h3>
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-bold">
                {cart.reduce((sum, item) => sum + item.qty, 0)} dona
              </span>
            </div>

            {/* Cart Scroll */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
              {isCartEmpty ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <div className="p-3 bg-zinc-800/40 rounded-full border border-border/40">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Savatingiz bo'sh. Mahsulot qo'shing.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-background/30 hover:bg-background/60 border border-border/30 rounded-xl transition-all"
                  >
                    <div className="truncate flex-1 pr-2">
                      <h5 className="font-semibold text-sm truncate text-foreground">{item.name}</h5>
                      <span className="text-xs text-muted-foreground">
                        {item.qty} x ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-emerald-400">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-border/40 pt-4 mt-4 space-y-4">
            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To'lov Usuli</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('naqd')}
                  className={`flex items-center justify-center gap-2 p-3 border rounded-xl font-medium text-sm transition-all ${
                    paymentMethod === 'naqd'
                      ? 'bg-blue-500/10 border-blue-500/80 text-blue-400 shadow-md'
                      : 'border-border/60 hover:bg-background/60 text-muted-foreground'
                  }`}
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Kassa Naqd</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('karta')}
                  className={`flex items-center justify-center gap-2 p-3 border rounded-xl font-medium text-sm transition-all ${
                    paymentMethod === 'karta'
                      ? 'bg-blue-500/10 border-blue-500/80 text-blue-400 shadow-md'
                      : 'border-border/60 hover:bg-background/60 text-muted-foreground'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Terminal Karta</span>
                </button>
              </div>
            </div>

            {/* Delivery toggle */}
            <div className="flex items-center justify-between p-3 bg-background/30 border border-border/30 rounded-xl">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">Yetkazib berish</span>
              </div>
              <div className="flex items-center gap-2">
                {deliveryMode && (
                  <input
                    type="number"
                    min={0}
                    value={deliveryFee}
                    onChange={e => setDeliveryFee(Number(e.target.value))}
                    className="w-20 bg-background/50 border border-border/80 rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  />
                )}
                <button
                  onClick={() => setDeliveryMode(d => !d)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${deliveryMode ? 'bg-blue-500' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${deliveryMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Total price */}
            <div className="space-y-1 bg-background/50 border border-border/40 rounded-xl p-4">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {deliveryMode && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Yetkazib berish</span>
                  <span className="text-blue-400">+${deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Soliq (0%)</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-base font-bold text-foreground border-t border-border/30 pt-2 mt-1">
                <span>JAMI</span>
                <span className="text-emerald-400">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isCartEmpty}
              className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isCartEmpty
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white shadow-lg hover:shadow-emerald-500/20'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>Sotuvni Yakunlash (Chek Chiqarish)</span>
            </button>
          </div>
        </div>

        {/* Local POS Logs */}
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-5 shadow-xl space-y-3">
          <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Kassa Jurnali</h4>
          <div className="h-[120px] overflow-y-auto space-y-2 text-xs scrollbar-thin">
            {posLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2 text-muted-foreground p-1 border-b border-border/20 last:border-0">
                <span className="text-zinc-500">Ò</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

