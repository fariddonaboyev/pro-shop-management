import React, { useEffect } from 'react';
import { useShopStore } from '../stores/shopStore';
import { Database, RefreshCw, AlertCircle, Calendar, DollarSign, Tag, CheckCircle } from 'lucide-react';

export const TaskadeDbViewer: React.FC = () => {
  const {
    taskadeLogs,
    isTaskadeSyncing,
    taskadeSyncError,
    fetchFromTaskade,
  } = useShopStore();

  useEffect(() => {
    fetchFromTaskade();
  }, []);

  const isSyncing = isTaskadeSyncing;
  const hasError = taskadeSyncError !== null;
  const isLogsEmpty = taskadeLogs.length === 0;

  return (
    <div className="bg-card/40 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex justify-between items-center border-b border-border/30 pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-emerald-400" />
          <div>
            <h3 className="font-bold text-foreground">Taskade Markaziy Ombori</h3>
            <p className="text-[11px] text-muted-foreground">Sinxronizatsiya qilingan bulut ma'lumotlar bazasi</p>
          </div>
        </div>
        <button
          onClick={fetchFromTaskade}
          disabled={isSyncing}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-border/60 rounded-xl transition text-foreground"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {hasError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex gap-2 items-center">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{taskadeSyncError}</span>
        </div>
      )}

      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
        {isLogsEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
            <Database className="h-8 w-8 text-zinc-600 animate-pulse" />
            <p className="text-xs">Ulanmoqda yoki ma'lumotlar bazasi bo'sh...</p>
          </div>
        ) : (
          taskadeLogs.map((log) => {
            const isTrx = log.type === 'Transaction';
            const isLic = log.type === 'License';
            const isTab = log.type === 'Table';

            return (
              <div
                key={log.id}
                className="p-3 bg-background/40 hover:bg-background/80 border border-border/30 rounded-xl flex justify-between items-center transition"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className={`p-2 rounded-lg ${
                    isTrx ? 'bg-emerald-500/10 text-emerald-400' : isLic ? 'bg-amber-500/10 text-amber-400' : isTab ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {isTrx ? <DollarSign className="h-4 w-4" /> : isLic ? <CheckCircle className="h-4 w-4" /> : <Tag className="h-4 w-4" />}
                  </div>
                  <div className="truncate">
                    <h5 className="font-bold text-xs text-foreground truncate">{log.title}</h5>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{log.details}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-3">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    isTrx ? 'bg-emerald-500/10 text-emerald-400' : isLic ? 'bg-amber-500/10 text-amber-400' : isTab ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {log.type}
                  </span>
                  {log.price > 0 && (
                    <p className="text-xs font-bold text-emerald-400 mt-1">${log.price.toFixed(2)}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
