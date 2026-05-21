import React, { useState } from 'react';
import { useShopStore } from '../stores/shopStore';
import { Shield, Key, ShieldCheck, ShieldAlert, Cpu, Download, Upload, RefreshCw } from 'lucide-react';

export const LitsenziyaModule: React.FC = () => {
  const {
    license,
    licenseLogs,
    activateLicenseKey,
    checkLicenseOnline,
    resetLicense,
    generateLicenseFile,
    verifyOfflineLicenseFile,
  } = useShopStore();

  const [inputKey, setInputKey] = useState<string>('');
  const [offlineFileText, setOfflineFileText] = useState<string>('');
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey) return;
    setIsActivating(true);
    // Add brief network delay simulation
    setTimeout(async () => {
      await activateLicenseKey(inputKey);
      setInputKey('');
      setIsActivating(false);
    }, 800);
  };

  const handleOnlineCheck = async () => {
    setIsChecking(true);
    setTimeout(async () => {
      await checkLicenseOnline();
      setIsChecking(false);
    }, 800);
  };

  const handleDownloadFile = () => {
    const b64 = generateLicenseFile();
    const blob = new Blob([b64], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRO-SHOP-ACTIVATE-${license.hwid.slice(-4)}.lic`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      verifyOfflineLicenseFile(text);
    };
    reader.readAsText(file);
  };

  const isTrial = license.status === 'trial';
  const isActive = license.status === 'active';
  const isExpired = license.status === 'expired';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
      {/* License Status Card */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-border/40">
            <div>
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                PRO Litsenziya (Xavfsizlik)
              </h2>
              <p className="text-sm text-muted-foreground">HWID himoyalangan litsenziyalash tizimi</p>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-full border border-border/50">
              <Shield className="h-6 w-6 text-amber-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* HWID Details */}
            <div className="p-5 border border-border/60 rounded-xl bg-background/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <Cpu className="h-4 w-4 text-blue-400" />
                <span>Qurilma Hardware ID (HWID)</span>
              </div>
              <p className="font-mono text-sm font-bold text-foreground bg-zinc-950/70 p-3 rounded-lg border border-zinc-900 select-all">
                {license.hwid}
              </p>
              <p className="text-[11px] text-muted-foreground">
                * Ushbu kompyuter imzosi protsessor, ona plata va qattiq disk kodlaridan hosil qilingan va litsenziya unga qulflanadi.
              </p>
            </div>

            {/* Validation Info */}
            <div className="p-5 border border-border/60 rounded-xl bg-background/40 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Litsenziya Holati</span>
                  <div className="flex items-center gap-1.5">
                    {isActive ? (
                      <span className="text-emerald-400 font-bold text-lg flex items-center gap-1">
                        <ShieldCheck className="h-5 w-5" /> FAOL (Premium)
                      </span>
                    ) : isExpired ? (
                      <span className="text-red-400 font-bold text-lg flex items-center gap-1">
                        <ShieldAlert className="h-5 w-5" /> MUDDATI TUGAGAN
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold text-lg flex items-center gap-1">
                        <Key className="h-5 w-5 animate-pulse" /> SINOV REJIMI (TRIAL)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs text-muted-foreground font-semibold">Online Sync:</span>
                  <span className={`text-xs font-bold ${license.onlineVerified ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {license.onlineVerified ? 'TASDIQLANGAN' : 'LOKAL KESH'}
                  </span>
                </div>
              </div>

              <div className="border-t border-border/20 pt-3 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground font-semibold">Mijoz:</span>
                  <p className="font-bold text-foreground mt-0.5">{license.customerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Tugash muddati:</span>
                  <p className="font-bold text-foreground mt-0.5">{license.expiryDate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Kun qoldi:</span>
                  <p className="font-bold text-foreground mt-0.5">{license.trialDaysLeft} kun</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activation Form */}
          <form onSubmit={handleActivate} className="p-5 border border-border/50 rounded-xl bg-background/20 space-y-4">
            <h3 className="font-bold text-sm text-foreground">Litsenziya Kaliti orqali faollashtirish</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="PRO-SHOP-XXXXX-XXXXX-XXXXX..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="flex-1 font-mono uppercase bg-background/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <button
                type="submit"
                disabled={isActivating || !inputKey}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 text-white ${
                  isActivating || !inputKey
                    ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 active:scale-95 shadow-lg shadow-amber-500/10'
                }`}
              >
                {isActivating && <RefreshCw className="h-4 w-4 animate-spin" />}
                <span>Faollashtirish</span>
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              * Kalit formatsiyasi: `PRO-SHOP-` prefiksi bilan boshlanadigan har qanday kalit sinov uchun to'g'ri keladi (masalan: `PRO-SHOP-RETAIL-COFFEE-2026`).
            </p>
          </form>
        </div>

        {/* Offline Activator block */}
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Download className="h-4 w-4 text-blue-400" />
            <span>Oflayn Faollashtirish (Internet bo'lmaganda)</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Agar kassadagi kompyuterda internet bo'lmasa, HWID bo'yicha litsenziya faylini generatsiya qilib, shu yerda yuklash orqali oflayn rejimda ishga tushirishingiz mumkin.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 border border-border/40 rounded-xl bg-background/20 space-y-3">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">1. Litsenziya Faylini Yuklab Olish</h4>
              <p className="text-[11px] text-muted-foreground">
                Ushbu kompyuterning litsenziya kodi va HWID bog'langan faylini (.lic) yuklab oling va premium serverga yuboring.
              </p>
              <button
                onClick={handleDownloadFile}
                className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-border/60 text-foreground font-bold py-2 rounded-lg text-xs transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Litsenziya faylini yuklash</span>
              </button>
            </div>

            <div className="p-4 border border-border/40 rounded-xl bg-background/20 space-y-3">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">2. Faollashtirish faylini yuklash</h4>
              <p className="text-[11px] text-muted-foreground">
                Serverdan olingan tasdiqlangan faollashtirish faylini bu yerga yuklang va tizimni premium qiling.
              </p>
              <label className="w-full flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 font-bold py-2 rounded-lg text-xs transition cursor-pointer">
                <Upload className="h-3.5 w-3.5" />
                <span>Faylni yuklash (.lic)</span>
                <input
                  type="file"
                  accept=".lic"
                  onChange={handleUploadFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* License Logs & Actions sidebar */}
      <div className="space-y-6">
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex justify-between items-center border-b border-border/30 pb-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Litsenziya Validatsiyasi</span>
            </h3>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleOnlineCheck}
              disabled={isChecking}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-blue-500/10"
            >
              {isChecking ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              <span>Onlayn Validatsiya (Taskade DB)</span>
            </button>
            <button
              onClick={resetLicense}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-border/60 text-muted-foreground hover:text-foreground font-bold py-2 rounded-xl text-xs transition"
            >
              Litsenziyani Tozalash (Reset)
            </button>
          </div>

          {/* Scrolling Terminal logs */}
          <div className="bg-zinc-950/70 border border-zinc-900 rounded-xl p-4 font-mono text-[10px] space-y-2">
            <div className="text-zinc-500 border-b border-zinc-900 pb-1 font-bold uppercase tracking-wider">
              Xavfsizlik & Tizim Jurnali
            </div>
            <div className="h-[210px] overflow-y-auto space-y-2 text-zinc-400 scrollbar-thin">
              {licenseLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-zinc-600">&gt;</span>
                  <span className="break-all">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

