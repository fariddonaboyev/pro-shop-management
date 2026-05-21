import * as React from 'react';
import { useState, useEffect } from 'react';
import { useShopStore } from './stores/shopStore';
import { SavdoModule } from './components/SavdoModule';
import { CafeModule } from './components/CafeModule';
import { LitsenziyaModule } from './components/LitsenziyaModule';
import { TaskadeDbViewer } from './components/TaskadeDbViewer';
import { SmartAgentChat } from './components/SmartAgentChat';
import { SmsPanel } from './components/SmsPanel';
import { PromoPanel } from './components/PromoPanel';
import { CategoryPanel } from './components/CategoryPanel';
import { ShoppingCart, Coffee, Shield, Database, Sparkles, Cpu, Wifi, WifiOff, MessageSquare, Tag, FolderOpen, CloudLightning } from 'lucide-react';

const App: React.FC = function () {
  const [activeTab, setActiveTab] = useState<'savdo' | 'cafe' | 'litsenziya' | 'baza' | 'sms' | 'promo' | 'kategoriya'>('savdo');
  const {
    license,
    isLANServerOnline,
    offlineQueue,
    isTaskadeSyncing,
    fetchFromTaskade,
  } = useShopStore();

  useEffect(() => {
    // Initial fetch from Taskade markaziy database
    fetchFromTaskade();
    
    // Simulate real-time terminal sync ping every 30 seconds
    const interval = setInterval(() => {
      fetchFromTaskade();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const hasOfflineQueue = offlineQueue.length > 0;
  const isPremium = license.status === 'active';
  const isTrial = license.status === 'trial';
  const isExpired = license.status === 'expired';

  return (
    <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-background to-background flex flex-col justify-between selection:bg-blue-500/20">
      
      {/* Top Header Navigation */}
      <header className="border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/10">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight text-foreground">PRO Shop Management</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                  v2.8
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">Devin AI & EVE Sync Edition</p>
            </div>
          </div>

          {/* Module Selector Tabs */}
          <nav className="hidden md:flex gap-1 bg-zinc-800/40 border border-border/60 p-1 rounded-xl flex-wrap">
            <button
              onClick={() => setActiveTab('savdo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'savdo'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/15'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              }`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>PRO Savdo</span>
            </button>
            <button
              onClick={() => setActiveTab('cafe')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'cafe'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/15'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              }`}
            >
              <Coffee className="h-3.5 w-3.5" />
              <span>PRO Cafe</span>
            </button>
            <button
              onClick={() => setActiveTab('baza')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'baza'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/15'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>Markaziy Baza</span>
            </button>
            <button
              onClick={() => setActiveTab('litsenziya')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'litsenziya'
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/15'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>PRO Litsenziya</span>
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'sms'
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/15'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>SMS</span>
            </button>
            <button
              onClick={() => setActiveTab('promo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'promo'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/15'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              <span>Aksiya</span>
            </button>
            <button
              onClick={() => setActiveTab('kategoriya')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'kategoriya'
                  ? 'bg-amber-400 text-zinc-900 shadow-lg shadow-amber-400/15'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              }`}
            >
              <FolderOpen className="h-3.5 w-3.5" />
              <span>Kategoriya</span>
            </button>
          </nav>

          {/* System Status Indicators */}
          <div className="flex items-center gap-4">
            {/* Sync indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-bold text-muted-foreground font-mono">
                {isLANServerOnline ? 'LAN CON:' : 'LAN OFL:'}
              </span>
              <span className={`text-[11px] font-bold ${isLANServerOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                {isLANServerOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            {/* Trial/Premium Info */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              isPremium 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
            }`}>
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">{isPremium ? 'PRO ACTIVATED' : `TRIAL: ${license.trialDaysLeft} KUN`}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Top Alert Banner for Reconnections & Offline Sync queues */}
      {hasOfflineQueue && (
        <div className="bg-amber-500/15 border-b border-amber-500/20 py-2.5 px-4 text-center text-amber-400 text-xs font-bold animate-in slide-in-from-top-3 flex items-center justify-center gap-2">
          <CloudLightning className="h-4 w-4 animate-bounce" />
          <span>Sinxronizatsiya navbatida {offlineQueue.length} ta oflayn sotuvlar kutmoqda! LAN aloqasi tiklanganda avtomatik saqlanadi.</span>
        </div>
      )}

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Mobile Navigation controls */}
        <div className="md:hidden flex gap-1 bg-zinc-800/40 border border-border/60 p-1 rounded-xl mb-6 flex-wrap">
          {[
            { id: 'savdo',      label: 'Savdo',      color: 'bg-blue-500' },
            { id: 'cafe',       label: 'Cafe',       color: 'bg-purple-500' },
            { id: 'baza',       label: 'Baza',       color: 'bg-emerald-500' },
            { id: 'litsenziya', label: 'Litsenziya', color: 'bg-amber-500' },
            { id: 'sms',        label: 'SMS',        color: 'bg-indigo-500' },
            { id: 'promo',      label: 'Aksiya',     color: 'bg-rose-500' },
            { id: 'kategoriya', label: 'Kat.',       color: 'bg-amber-400' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center min-w-[4rem] ${
                activeTab === tab.id ? tab.color + ' text-white' : 'text-muted-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Modules Routing Rendering */}
        <div className="animate-in fade-in-50 duration-300">
          {activeTab === 'savdo' && <SavdoModule />}
          {activeTab === 'cafe' && <CafeModule />}
          {activeTab === 'litsenziya' && <LitsenziyaModule />}
          {activeTab === 'sms' && <SmsPanel />}
          {activeTab === 'promo' && <PromoPanel />}
          {activeTab === 'kategoriya' && <CategoryPanel />}
          {activeTab === 'baza' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <TaskadeDbViewer />
              <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl space-y-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span>IPC, LAN va Litsenziyalash tizimi sinxronizatsiyasi</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ushbu tizim <strong>Devin AI</strong> tomonidan yozilgan kassa algoritmlarini real-vaqtda sinxronlashtiradi:
                </p>
                <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                  <li><strong>IPC Handlerlar:</strong> Electron qobig'ida COM3 portiga ulangan termal chek printeri va shtrix-kod skanerini emulyatsiya qiladi.</li>
                  <li><strong>LAN Server:</strong> Mahalliy waiter (ofitsiant) va cashier (kassa) terminallari o'rtasidagi ma'lumotlar oqimini keshlab, asosiy baza bilan sinxronlashtiradi.</li>
                  <li><strong>License Manager:</strong> Qurilma protsessor imzosi (HWID) orqali litsenziyani bulutli Taskade databazasi va oflayn kalitlar bilan real-vaqtda tekshiradi.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer System Status details */}
      <footer className="border-t border-border/40 bg-zinc-950/40 py-4 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 font-mono">
          <span>Tizim xavfsizlik protokoli: TLS 1.3 / SHA256 AES-GCM</span>
          <span>Sinxronizatsiya holati: 100% Sinxron (Lokal kesh faol)</span>
        </div>
      </footer>

      {/* Floating Smart AI Agent Chat Panel */}
      <SmartAgentChat />
    </div>
  );
};

export default App;

