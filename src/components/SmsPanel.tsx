import React, { useState } from 'react';
import { useShopStore } from '../stores/shopStore';
import {
  MessageSquare, Send, Key, Eye, EyeOff,
  CheckCircle2, XCircle, Loader2, Zap,
  ToggleLeft, ToggleRight, Bell,
} from 'lucide-react';
import { cn } from '../lib/utils';

const EVENT_KEYS = [
  { key: 'onOrderAccepted',    label: 'Buyurtma qabul qilinganda',  icon: '=', tplKey: 'orderAccepted' },
  { key: 'onCustomerApproved', label: 'Yangi mijoz tasdiqlanganda', icon: '=', tplKey: 'customerApproved' },
  { key: 'onPromoBlast',       label: "Aksiya e'lonida (blast)",    icon: '<', tplKey: 'promoBlast' },
  { key: 'onDebtReminder',     label: 'Qarz eslatmasi',             icon: '=', tplKey: 'debtReminder' },
];

const TEMPLATE_HINTS: Record<string, string> = {
  orderAccepted:    '{ism}, {dokon}',
  customerApproved: '{ism}, {dokon}',
  promoBlast:       '{sarlavha}, {matn}, {link}, {dokon}',
  debtReminder:     '{ism}, {summa}, {dokon}',
};

export const SmsPanel: React.FC = () => {
  const { smsSettings, smsLogs, updateSmsSettings, eskizLogin, sendSms } = useShopStore();

  const [showPass, setShowPass]         = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMsg, setLoginMsg]         = useState<{ ok: boolean; text: string } | null>(null);
  const [testPhone, setTestPhone]       = useState('');
  const [testMsg, setTestMsg]           = useState('PRO Savdo sinov SMS xabari.');
  const [testLoading, setTestLoading]   = useState(false);
  const [testResult, setTestResult]     = useState<{ ok: boolean; text: string } | null>(null);
  const [activeSection, setActiveSection] = useState<'sozlamalar' | 'shablon' | 'jurnal'>('sozlamalar');

  const hasToken = !!smsSettings.token;

  const handleLogin = async () => {
    setLoginLoading(true); setLoginMsg(null);
    const ok = await eskizLogin();
    setLoginLoading(false);
    setLoginMsg(ok
      ? { ok: true,  text: 'Eskiz.uz ga ulandi! Token saqlandi.' }
      : { ok: false, text: 'Ulanib bolmadi. Email/parol tekshiring.' }
    );
  };

  const handleTestSend = async () => {
    if (!testPhone.trim()) return;
    setTestLoading(true); setTestResult(null);
    const ok = await sendSms(testPhone.trim(), testMsg, 'test');
    setTestLoading(false);
    setTestResult(ok
      ? { ok: true,  text: 'SMS yuborildi: ' + testPhone }
      : { ok: false, text: 'Yuborib bolmadi. Tokenni tekshiring.' }
    );
  };

  const updateEvent = (key: string, val: boolean) =>
    updateSmsSettings({ events: { ...smsSettings.events, [key]: val } });

  const updateTemplate = (tplKey: string, val: string) =>
    updateSmsSettings({ templates: { ...smsSettings.templates, [tplKey]: val } });

  const btnCls = (s: string) => cn(
    'px-4 py-2 rounded-lg text-xs font-bold transition-all',
    activeSection === s ? 'bg-indigo-500 text-white shadow' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
  );

  return (
    <div className="space-y-6 p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                SMS Xabarnoma Moduli
              </h2>
              <p className="text-xs text-muted-foreground">Eskiz.uz API orqali avtomatik SMS</p>
            </div>
          </div>
          <button
            onClick={() => updateSmsSettings({ enabled: !smsSettings.enabled })}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border',
              smsSettings.enabled
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:bg-zinc-700/60'
            )}
          >
            {smsSettings.enabled ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
            {smsSettings.enabled ? "SMS Yoqilgan" : "SMS O'chirilgan"}
          </button>
        </div>
        <div className={cn(
          'mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border w-fit',
          hasToken ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        )}>
          {hasToken ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
          {hasToken ? 'Ulangan  Token faol' : "Token yo'q  Eskiz.uz ga ulaning"}
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-zinc-800/40 border border-border/60 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveSection('sozlamalar')} className={btnCls('sozlamalar')}>™ Sozlamalar</button>
        <button onClick={() => setActiveSection('shablon')}    className={btnCls('shablon')}>= Shablonlar</button>
        <button onClick={() => setActiveSection('jurnal')}     className={btnCls('jurnal')}>= Jurnal ({smsLogs.length})</button>
      </div>

      {/* SOZLAMALAR */}
      {activeSection === 'sozlamalar' && (
        <div className="space-y-4">
          <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2"><Key className="h-4 w-4 text-indigo-400" />Eskiz.uz Kredensiallari</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Email</label>
                <input type="email" placeholder="sizning@email.com" value={smsSettings.email}
                  onChange={e => updateSmsSettings({ email: e.target.value })}
                  className="w-full bg-background/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Parol</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} placeholder="""""""""" value={smsSettings.password}
                    onChange={e => updateSmsSettings({ password: e.target.value })}
                    className="w-full bg-background/50 border border-border/80 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Sender</label>
                <input type="text" placeholder="4546" value={smsSettings.sender}
                  onChange={e => updateSmsSettings({ sender: e.target.value })}
                  className="w-full bg-background/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
              <button onClick={handleLogin} disabled={loginLoading || !smsSettings.email || !smsSettings.password}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg">
                {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {loginLoading ? 'Ulanilmoqda...' : 'Eskiz.uz ga Ulaning'}
              </button>
              {loginMsg && (
                <div className={cn('flex items-center gap-2 text-xs px-3 py-2 rounded-lg border',
                  loginMsg.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400')}>
                  {loginMsg.ok ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                  {loginMsg.text}
                </div>
              )}
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2"><Bell className="h-4 w-4 text-indigo-400" />Hodisa Sozlamalari</h3>
            <div className="space-y-3">
              {EVENT_KEYS.map(ev => {
                const isOn = smsSettings.events[ev.key as keyof typeof smsSettings.events];
                return (
                  <div key={ev.key} className="flex items-center justify-between p-3 bg-background/30 border border-border/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{ev.icon}</span>
                      <span className="text-sm font-medium">{ev.label}</span>
                    </div>
                    <button onClick={() => updateEvent(ev.key, !isOn)}
                      className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', isOn ? 'bg-indigo-500' : 'bg-zinc-700')}>
                      <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow', isOn ? 'translate-x-6' : 'translate-x-1')} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2"><Send className="h-4 w-4 text-indigo-400" />Sinov SMS</h3>
            <div className="space-y-3">
              <input type="tel" placeholder="+998901234567" value={testPhone} onChange={e => setTestPhone(e.target.value)}
                className="w-full bg-background/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              <textarea rows={3} value={testMsg} onChange={e => setTestMsg(e.target.value)}
                className="w-full bg-background/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none" />
              <button onClick={handleTestSend} disabled={testLoading || !testPhone.trim() || !hasToken}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all">
                {testLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {testLoading ? 'Yuborilmoqda...' : 'Sinov SMS Yuborish'}
              </button>
              {testResult && (
                <div className={cn('flex items-center gap-2 text-xs px-3 py-2 rounded-lg border',
                  testResult.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400')}>
                  {testResult.ok ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                  {testResult.text}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SHABLONLAR */}
      {activeSection === 'shablon' && (
        <div className="space-y-4">
          {EVENT_KEYS.map(ev => (
            <div key={ev.key} className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{ev.icon}</span>
                <h4 className="font-bold text-sm">{ev.label}</h4>
              </div>
              <textarea rows={4}
                value={smsSettings.templates[ev.tplKey as keyof typeof smsSettings.templates]}
                onChange={e => updateTemplate(ev.tplKey, e.target.value)}
                className="w-full bg-background/50 border border-border/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-mono" />
              <p className="text-xs text-muted-foreground">
                O'zgaruvchilar: <span className="text-indigo-400 font-mono">{TEMPLATE_HINTS[ev.tplKey]}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* JURNAL */}
      {activeSection === 'jurnal' && (
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-indigo-400" />SMS Tarixi ({smsLogs.length} yozuv)
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
            {smsLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Hech qanday SMS yuborilmagan</div>
            ) : (
              smsLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-background/30 border border-border/30 rounded-xl">
                  <div className={cn('mt-0.5 h-2 w-2 rounded-full shrink-0',
                    log.status === 'sent' ? 'bg-emerald-500' : log.status === 'failed' ? 'bg-red-500' : 'bg-amber-500')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground">{log.phone}</span>
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString('uz-UZ')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.message}</p>
                    {log.error && <p className="text-xs text-red-400 mt-0.5">{log.error}</p>}
                    <span className="text-[10px] text-zinc-500 uppercase">{log.event}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

