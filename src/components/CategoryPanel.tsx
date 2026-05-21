import React, { useState } from 'react';
import { useShopStore, Category } from '../stores/shopStore';
import { FolderOpen, FolderPlus, Trash2, ChevronRight, ChevronDown, Plus, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface TreeNodeProps {
  cat: Category;
  allCats: Category[];
  depth: number;
  onAdd: (parentId: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, name: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ cat, allCats, depth, onAdd, onRemove, onEdit }) => {
  const children = allCats.filter(c => c.parentId === cat.id);
  const [open, setOpen]         = useState(true);
  const [editing, setEditing]   = useState(false);
  const [editVal, setEditVal]   = useState(cat.name);
  const hasChildren = children.length > 0;

  const handleSave = () => { onEdit(cat.id, editVal); setEditing(false); };

  return (
    <div className={cn('ml-4 border-l border-border/30', depth === 0 && 'ml-0 border-l-0')}>
      <div className={cn(
        'flex items-center gap-2 p-2 rounded-xl group hover:bg-background/40 transition-all',
        'border border-transparent hover:border-border/30'
      )} style={{ marginLeft: depth * 16 + 'px' }}>
        <button onClick={() => setOpen(o => !o)} className="text-muted-foreground hover:text-foreground transition shrink-0 w-4">
          {hasChildren ? (open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />) : <span className="h-3.5 w-3.5 block" />}
        </button>
        <FolderOpen className="h-4 w-4 text-amber-400 shrink-0" />

        {editing ? (
          <div className="flex items-center gap-2 flex-1">
            <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
              className="flex-1 bg-background/80 border border-indigo-500/50 rounded-lg px-2 py-1 text-sm focus:outline-none" />
            <button onClick={handleSave} className="text-emerald-400 hover:text-emerald-300"><Check className="h-4 w-4" /></button>
            <button onClick={() => setEditing(false)} className="text-zinc-500 hover:text-zinc-300"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <span onDoubleClick={() => { setEditVal(cat.name); setEditing(true); }}
            className="flex-1 text-sm font-medium cursor-text select-none">{cat.name}</span>
        )}

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onAdd(cat.id)} title="Ichki kategoriya qo'shish"
            className="p-1 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition">
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onRemove(cat.id)} title="O'chirish"
            className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const CategoryPanel: React.FC = () => {
  const { categories, addCategory, removeCategory, updateCategory } = useShopStore();

  const [addingTo, setAddingTo]   = useState<string | null>(null);
  const [newName, setNewName]     = useState('');

  const rootCats = categories.filter(c => c.parentId === null);

  const handleAdd = (parentId: string | null) => {
    setAddingTo(parentId ?? 'root');
    setNewName('');
  };

  const handleConfirmAdd = () => {
    if (!newName.trim()) return;
    addCategory({ name: newName.trim(), parentId: addingTo === 'root' ? null : addingTo });
    setAddingTo(null); setNewName('');
  };

  const handleEdit = (id: string, name: string) => {
    if (name.trim()) updateCategory(id, { name: name.trim() });
  };

  return (
    <div className="space-y-6 p-4 max-w-2xl mx-auto">
      <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <FolderOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Mahsulot Kategoriyalari
              </h2>
              <p className="text-xs text-muted-foreground">Daraxt strukturasida kategoriyalarni boshqaring</p>
            </div>
          </div>
          <button onClick={() => handleAdd(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all shadow-lg">
            <FolderPlus className="h-4 w-4" />Asosiy Kategoriya
          </button>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl space-y-2">
        {categories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Kategoriya yo'q. Qo'shing!
          </div>
        )}
        {rootCats.map(cat => (
          <TreeNode key={cat.id} cat={cat} allCats={categories} depth={0} onAdd={handleAdd} onRemove={removeCategory} onEdit={handleEdit} />
        ))}

        {addingTo !== null && (
          <div className={cn(
            'flex items-center gap-2 p-2 rounded-xl border border-amber-500/40 bg-amber-500/5',
            addingTo !== 'root' ? 'ml-8' : ''
          )}>
            <FolderOpen className="h-4 w-4 text-amber-400 shrink-0" />
            <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleConfirmAdd(); if (e.key === 'Escape') setAddingTo(null); }}
              placeholder="Kategoriya nomi..."
              className="flex-1 bg-background/80 border border-amber-500/40 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
            <button onClick={handleConfirmAdd} className="text-emerald-400 hover:text-emerald-300 p-1"><Check className="h-4 w-4" /></button>
            <button onClick={() => setAddingTo(null)} className="text-zinc-500 hover:text-zinc-300 p-1"><X className="h-4 w-4" /></button>
          </div>
        )}
      </div>

      <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-4 shadow-xl">
        <p className="text-xs text-muted-foreground text-center">
          Kategoriya nomini <span className="text-amber-400 font-semibold">ikki marta bosing</span>  tahrirlash uchun.
          <span className="text-blue-400 font-semibold ml-2">+ tugma</span>  ichki kategoriya qo'shish.
        </p>
      </div>
    </div>
  );
};

          </button>
        </div>
      </div>

      {open && hasChildren && (
        <div>
          {children.map(child => (
            <TreeNode key={child.id} cat={child} allCats={allCats} depth={depth + 1} onAdd={onAdd} onRemove={onRemove} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
};
