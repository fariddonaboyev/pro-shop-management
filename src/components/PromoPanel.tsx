import React, { useState, useRef } from 'react';
import { useShopStore, PromoBanner } from '../stores/shopStore';
import { Tag, Plus, Trash2, ImagePlus, CheckCircle2, Eye, EyeOff, Send, Calendar, X } from 'lucide-react';
import { cn } from '../lib/utils';

const COLORS = [
  { label: 'Ko`k',    value: 'from-blue-600 to-indigo-700',   badge: 'bg-blue-500' },
  { label: 'Yashil',  value: 'from-emerald-600 to-teal-700',  badge: 'bg-emerald-500' },
  { label: 'Qizil',   value: 'from-rose-600 to-pink-700',     badge: 'bg-rose-500' },
  { label: 'To`q',    value: 'from-orange-600 to-amber-700',  badge: 'bg-orange-500' },
  { label: 'Binafsha', value: 'from-purple-600 to-violet-700', badge: 'bg-purple-500' },
];

const emptyForm = (): Omit<PromoBanner, 'id' | 'createdAt'> => ({
  title: '', description: '', imageUrl: undefined, imageBase64: undefined,
  color: COLORS[0].value, active: true, startDate: '', endDate: '', productIds: [],
});

export const PromoPanel: React.FC = () => {
  const { promoBanners, addPromoBanner, updatePromoBanner, removePromoBanner, togglePromoBanner, smsSettings, sendSmsBlast } = useShopStore();

  const [showForm, setShowForm]           = useState(false);
  const [form, setForm]                   = useState(emptyForm());
  const [editId, setEditId]               = useState<string | null>(null);
  const [blastPhone, setBlastPhone]       = useState('');
  const [blastBannerId, setBlastBannerId] = useState<string | null>(null);
  const [blasting, setBlasting]           = useState(false);
  const [blastDone, setBlastDone]         = useState(false);
  const fileRef                            = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, imageBase64: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editId) { updatePromoBanner(editId, form); } else { addPromoBanner(form); }
    setForm(emptyForm()); setEditId(null); setShowForm(false);
  };

  const handleEdit = (b: PromoBanner) => {
    setForm({ title: b.title, description: b.description, imageUrl: b.imageUrl, imageBase64: b.imageBase64,
      color: b.color, active: b.active, startDate: b.startDate || '', endDate: b.endDate || '', productIds: b.productIds });
    setEditId(b.id); setShowForm(true);
  };

  const handleBlast = async (banner: PromoBanner) => {
    const phones = blastPhone.split(/[\n,;]+/).map(p => p.trim()).filter(Boolean);
    if (!phones.length) return;
    setBlasting(true);
    const msg = smsSettings.templates.promoBlast
      .replace('{sarlavha}', banner.title).replace('{matn}', banner.description)
      .replace('{link}', '').replace('{dokon}', 'PRO Savdo');
    await sendSmsBlast(phones, msg, 'promoBlast');
    setBlasting(false); setBlastDone(true);
    setTimeout(() => { setBlastDone(false); setBlastBannerId(null); setBlastPhone(''); }, 3000);
  };

  const imgSrc = form.imageBase64 || form.imageUrl;

  return (
    <div className="space-y-6 p-4 max-w-3xl mx-auto">
      <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Tag className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Aksiya va Bannerlar</h2>
              <p className="text-xs text-muted-foreground">Reklama bannerlari va SMS blast</p>
            </div>
          </div>
          <button onClick={() => { setForm(emptyForm()); setEditId(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition-all shadow-lg">
            <Plus className="h-4 w-4" />Yangi Aksiya
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-card/50 backdrop-blur border border-rose-500/30 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">{editId ? 'Aksiyani Tahrirlash' : 'Yangi Aksiya'}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
          </div>
          <div className={cn('relative rounded-2xl overflow-hidden h-36 bg-gradient-to-br', form.color)}>
            {imgSrc && <img src={imgSrc} alt="banner" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <h3 className="font-extrabold text-white text-lg drop-shadow">{form.title || 'Aksiya Sarlavhasi'}</h3>
              <p className="text-white/80 text-xs mt-1 line-clamp-2">{form.description || 'Tavsif bu yerda...'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sarlavha *</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Yozgi Chegirma!"
                className="w-full bg-background/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rasm</label>
              <div className="flex gap-2">
                <button onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 bg-background/50 border border-border/80 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:border-rose-500/50 transition-all">
                  <ImagePlus className="h-4 w-4" />{imgSrc ? 'Almashtirildi' : 'Rasm tanlang'}
                </button>
                {imgSrc && (
                  <button onClick={() => setForm(f => ({ ...f, imageBase64: undefined, imageUrl: undefined }))}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tavsif</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="20% chegirma! Faqat bugun."
              className="w-full bg-background/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Banner rangi</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c.value} onClick={() => setForm(f => ({ ...f, color: c.value }))} title={c.label}
                  className={cn('h-7 w-7 rounded-full transition-all border-2 shadow', c.badge,
                    form.color === c.value ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100')} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Boshlanish</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full bg-background/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tugash</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full bg-background/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50" />
            </div>
          </div>
          <button onClick={handleSave} disabled={!form.title.trim()}
            className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" />{editId ? 'Saqlash' : 'Aksiya Yaratish'}
          </button>
        </div>
      )}

      {promoBanners.length === 0 && !showForm ? (
        <div className="text-center py-16 text-muted-foreground">
          <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Hech qanday aksiya mavjud emas.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {promoBanners.map(banner => (
            <div key={banner.id} className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl overflow-hidden shadow-xl">
              <div className={cn('relative h-28 bg-gradient-to-br', banner.color)}>
                {(banner.imageBase64 || banner.imageUrl) && (
                  <img src={banner.imageBase64 || banner.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                )}
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <h3 className="font-extrabold text-white text-base drop-shadow">{banner.title}</h3>
                  <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{banner.description}</p>
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  {banner.startDate && (
                    <span className="flex items-center gap-1 text-white/70 text-[10px] bg-black/30 px-2 py-0.5 rounded-full">
                      <Calendar className="h-3 w-3" />{banner.startDate}{banner.endDate ? ` - ${banner.endDate}` : ''}
                    </span>
                  )}
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
                    banner.active ? 'bg-emerald-500 text-white' : 'bg-zinc-700 text-zinc-300')}>
                    {banner.active ? 'Faol' : "Off"}
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-wrap items-center gap-2">
                <button onClick={() => togglePromoBanner(banner.id)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-background/60 transition-all">
                  {banner.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {banner.active ? "O'chirish" : 'Yoqish'}
                </button>
                <button onClick={() => handleEdit(banner)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-background/60 transition-all">
                  Tahrirlash
                </button>
                <button onClick={() => setBlastBannerId(blastBannerId === banner.id ? null : banner.id)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 transition-all">
                  <Send className="h-3.5 w-3.5" />SMS Blast
                </button>
                <button onClick={() => removePromoBanner(banner.id)}
                  className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {blastBannerId === banner.id && (
                <div className="border-t border-border/40 p-4 bg-background/30 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SMS Blast  raqamlar (vergul bilan ajrating)</p>
                  <textarea rows={3} value={blastPhone} onChange={e => setBlastPhone(e.target.value)}
                    placeholder="+998901234567, +998901234568"
                    className="w-full bg-background/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-mono" />
                  <div className="flex gap-2 items-center">
                    <button onClick={() => handleBlast(banner)} disabled={blasting || !blastPhone.trim() || !smsSettings.enabled}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all">
                      <Send className="h-4 w-4" />{blasting ? 'Yuborilmoqda...' : 'Blast Yuborish'}
                    </button>
                    {blastDone && <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold"><CheckCircle2 className="h-4 w-4" />Yuborildi!</span>}
                    {!smsSettings.enabled && <span className="text-xs text-amber-400">SMS moduli yoqilmagan</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
