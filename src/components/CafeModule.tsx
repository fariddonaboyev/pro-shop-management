import React, { useState } from 'react';
import { useShopStore, CafeTable, CartItem } from '../stores/shopStore';
import { Coffee, User, Wifi, WifiOff, Clock, Server, Monitor, HardDrive, RefreshCw } from 'lucide-react';

export const CafeModule: React.FC = () => {
  const {
    cafeTables,
    posItems,
    kitchenQueue,
    lanNodes,
    isLANServerOnline,
    lanSyncLogs,
    offlineQueue,
    updateTableStatus,
    addOrderToTable,
    clearTableOrders,
    updateKitchenStatus,
    toggleLANNode,
    simulateLANServerState,
  } = useShopStore();

  const [selectedTable, setSelectedTable] = useState<CafeTable | null>(null);
  const [orderCart, setOrderCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);

  const handleTableSelect = (table: CafeTable) => {
    setSelectedTable(table);
    setOrderCart([]);
  };

  const handleAddProductToOrder = (item: any) => {
    setOrderCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const handleRemoveProductFromOrder = (itemId: string) => {
    setOrderCart((prev) => prev.filter((p) => p.id !== itemId));
  };

  const handleSendOrder = () => {
    if (!selectedTable || orderCart.length === 0) return;
    addOrderToTable(selectedTable.id, orderCart);
    setOrderCart([]);
    setSelectedTable(null);
  };

  const handleCloseTable = async (tableId: string) => {
    await clearTableOrders(tableId);
    setSelectedTable(null);
  };

  // Convert string checks to simple booleans to prevent JSX syntax errors
  const hasSelectedTable = selectedTable !== null;
  const isOrderCartEmpty = orderCart.length === 0;
  const hasActiveOrders = selectedTable?.activeOrders && selectedTable.activeOrders.length > 0;
  const isKitchenQueueEmpty = kitchenQueue.length === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
      {/* Tables Layout */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                PRO Cafe (Stollar)
              </h2>
              <p className="text-sm text-muted-foreground">Stollar xaritasi va oshxona buyurtmalari</p>
            </div>
            {/* LAN Switcher */}
            <div className="flex items-center gap-3 bg-background/50 border border-border/60 rounded-xl p-2.5">
              <span className="text-xs font-semibold text-muted-foreground">LAN Server:</span>
              <button
                onClick={() => simulateLANServerState(!isLANServerOnline)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                  isLANServerOnline
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse'
                }`}
              >
                {isLANServerOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                <span>{isLANServerOnline ? 'ONLAYN' : 'OFLAYN'}</span>
              </button>
            </div>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {cafeTables.map((table) => {
              const isOccupied = table.status === 'occupied';
              const isReserved = table.status === 'reserved';
              return (
                <div
                  key={table.id}
                  onClick={() => handleTableSelect(table)}
                  className={`relative border rounded-2xl p-5 bg-background/40 hover:bg-background/80 cursor-pointer shadow transition-all flex flex-col justify-between h-[150px] ${
                    isOccupied
                      ? 'border-purple-500/40 hover:border-purple-500 shadow-purple-500/5'
                      : isReserved
                      ? 'border-amber-500/40 hover:border-amber-500 shadow-amber-500/5'
                      : 'border-border/60 hover:border-blue-500/40'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm text-foreground">{table.name}</span>
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        isOccupied ? 'bg-purple-500' : isReserved ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <User className="h-3 w-3" /> {table.capacity} kishilik
                    </span>
                  </div>

                  <div className="mt-4">
                    {isOccupied ? (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-purple-400">band</span>
                        <div className="text-[11px] font-semibold text-emerald-400">
                          Jami: ${table.totalAmount.toFixed(2)}
                        </div>
                      </div>
                    ) : isReserved ? (
                      <span className="text-xs font-bold text-amber-400">bron qilingan</span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-400">bo'sh</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kitchen Live Status display */}
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-400" />
            <span>Oshxona Buyurtmalar Navbati</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isKitchenQueueEmpty ? (
              <p className="text-sm text-muted-foreground italic col-span-2">Oshxonada hech qanday tayyorlanayotgan buyurtmalar yo'q.</p>
            ) : (
              kitchenQueue.map((order) => {
                const isPending = order.status === 'pending';
                const isPreparing = order.status === 'preparing';
                const isReady = order.status === 'ready';

                return (
                  <div
                    key={order.id}
                    className={`border rounded-xl p-4 bg-background/50 space-y-3 flex flex-col justify-between ${
                      isReady ? 'border-emerald-500/20 opacity-70' : 'border-border/60'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-purple-400 font-mono">{order.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          isPending ? 'bg-amber-500/10 text-amber-400' : isPreparing ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm mt-1">{order.tableName}</h4>
                      <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            " {item.name} x{item.qty}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-1.5 mt-4">
                      {isPending && (
                        <button
                          onClick={() => updateKitchenStatus(order.id, 'preparing')}
                          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold text-xs py-1.5 rounded-lg transition"
                        >
                          Tayyorlash
                        </button>
                      )}
                      {isPreparing && (
                        <button
                          onClick={() => updateKitchenStatus(order.id, 'ready')}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs py-1.5 rounded-lg transition"
                        >
                          Tayyor Bo'ldi
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* LAN Server & Table Orders Sidebar */}
      <div className="space-y-6">
        {/* Table Orders Management Sheet */}
        {hasSelectedTable ? (
          <div className="bg-card/50 backdrop-blur border border-purple-500/30 rounded-2xl p-6 shadow-xl space-y-5 flex flex-col justify-between h-[360px] animate-in fade-in-50 duration-200">
            <div className="space-y-3 overflow-hidden flex flex-col h-full">
              <div className="flex justify-between items-center border-b border-border/40 pb-2">
                <h3 className="font-bold text-base text-foreground">{selectedTable?.name} buyurtmalari</h3>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="text-xs text-zinc-500 hover:text-foreground font-semibold"
                >
                  Yopish
                </button>
              </div>

              {/* Order Cart */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                {hasActiveOrders && (
                  <div className="mb-4 bg-purple-500/5 border border-purple-500/10 rounded-xl p-3">
                    <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Mavjud hisob</div>
                    {selectedTable?.activeOrders.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{item.name} (x{item.qty})</span>
                        <span className="font-semibold text-zinc-300">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="text-xs font-bold text-emerald-400 mt-2 border-t border-purple-500/10 pt-2 flex justify-between">
                      <span>Jami hisob:</span>
                      <span>${selectedTable?.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Yangi Buyurtma Qo'shish</div>
                <div className="space-y-1">
                  {posItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleAddProductToOrder(item)}
                      className="flex justify-between items-center p-2 border border-border/30 hover:bg-background/40 rounded-xl text-xs cursor-pointer transition"
                    >
                      <span>{item.name}</span>
                      <span className="font-bold text-emerald-400">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {orderCart.length > 0 && (
                  <div className="mt-4 border-t border-border/20 pt-2">
                    <div className="text-xs font-bold text-foreground mb-1">Savatga kiritilganlar:</div>
                    {orderCart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs text-muted-foreground mt-1 bg-background/50 p-1.5 rounded-lg">
                        <span>{item.name} (x{item.qty})</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-300">${(item.price * item.qty).toFixed(2)}</span>
                          <button
                            onClick={() => handleRemoveProductFromOrder(item.id)}
                            className="text-red-400 hover:text-red-300 font-bold"
                          >
                            x
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 border-t border-border/30 pt-3 mt-2">
              {hasActiveOrders && (
                <button
                  onClick={() => handleCloseTable(selectedTable!.id)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs transition"
                >
                  Hisobni yopish
                </button>
              )}
              <button
                onClick={handleSendOrder}
                disabled={isOrderCartEmpty}
                className={`flex-1 font-bold py-2 rounded-xl text-xs transition ${
                  isOrderCartEmpty
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                    : 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/10'
                }`}
              >
                Oshxonaga yuborish
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl h-[360px] flex flex-col items-center justify-center text-center space-y-2">
            <Coffee className="h-10 w-10 text-purple-400" />
            <h4 className="font-bold text-foreground">Stol buyurtmalari</h4>
            <p className="text-xs text-muted-foreground max-w-[200px]">Buyurtma qo'shish yoki hisobni yopish uchun stol ustiga bosing.</p>
          </div>
        )}

        {/* LAN Networks Status Monitor */}
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-border/30 pb-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-400" />
              <span>LAN Terminallar tarmog'i</span>
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold font-mono">
              IP 192.168.1.1
            </span>
          </div>

          <div className="space-y-2.5">
            {lanNodes.map((node) => {
              const isNodeOnline = node.status === 'online';
              return (
                <div
                  key={node.id}
                  className="flex justify-between items-center p-2.5 border border-border/30 rounded-xl bg-background/30 text-xs hover:bg-background/50 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-zinc-800 rounded-lg">
                      {node.role === 'cashier' ? (
                        <Monitor className="h-3.5 w-3.5 text-blue-400" />
                      ) : node.role === 'kitchen' ? (
                        <Clock className="h-3.5 w-3.5 text-purple-400" />
                      ) : (
                        <HardDrive className="h-3.5 w-3.5 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-bold text-foreground">{node.name}</h5>
                      <span className="text-[10px] text-zinc-500">{node.ipAddress}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-[10px] font-bold ${
                        isNodeOnline ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {isNodeOnline ? `${node.latency}ms` : 'uzilgan'}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleLANNode(node.id)}
                      className={`h-2.5 w-2.5 rounded-full ${
                        isNodeOnline ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-zinc-950/70 border border-zinc-900 rounded-xl p-3 font-mono text-[10px] space-y-1.5">
            <div className="text-zinc-500 border-b border-zinc-900 pb-1 flex justify-between font-bold">
              <span>LAN SYNC LOGS</span>
              <span className="text-blue-400">Offline Queue: {offlineQueue.length}</span>
            </div>
            <div className="h-[90px] overflow-y-auto space-y-1 text-zinc-400 scrollbar-thin">
              {lanSyncLogs.slice(0, 10).map((log, idx) => (
                <div key={idx} className="truncate">
                  &gt; {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

