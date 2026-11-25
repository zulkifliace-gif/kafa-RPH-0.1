import React from 'react';
import { Save, Undo2, Redo2, RotateCcw, AlertCircle, History, X } from 'lucide-react';

interface StickySaveBarProps {
  isDirty: boolean;
  changeCount: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

export const StickySaveBar: React.FC<StickySaveBarProps> = ({
  isDirty,
  changeCount,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onDiscard,
  onSave
}) => {
  if (!isDirty && !canUndo && !canRedo) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-4xl no-print">
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white rounded-2xl px-4 py-3 shadow-2xl border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <AlertCircle size={18} />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>{isDirty ? 'Perubahan Belum Disimpan' : 'Tiada Perubahan Tertunggak'}</span>
              {changeCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black">
                  {changeCount} tindakan
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300">
              Draf disimpan automatik secara sementara. Gunakan <kbd className="px-1 py-0.5 rounded bg-slate-800 text-[10px]">Ctrl+Z</kbd> untuk Undo.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo perubahan terakhir (Ctrl+Z)"
            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-35 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Undo2 size={14} />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo perubahan (Ctrl+Y)"
            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-35 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Redo2 size={14} />
            <span className="hidden sm:inline">Redo</span>
          </button>

          {isDirty && (
            <>
              <button
                type="button"
                onClick={onDiscard}
                title="Abaikan semua perubahan belum simpan"
                className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Abaikan</span>
              </button>

              <button
                type="button"
                onClick={onSave}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/30 transition-all cursor-pointer"
              >
                <Save size={15} />
                <span>Simpan Sekarang</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface DraftRecoveryBannerProps {
  savedAt: string;
  onRestore: () => void;
  onDismiss: () => void;
}

export const DraftRecoveryBanner: React.FC<DraftRecoveryBannerProps> = ({
  savedAt,
  onRestore,
  onDismiss
}) => {
  const formattedTime = (() => {
    try {
      return new Date(savedAt).toLocaleString('ms-MY', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return savedAt;
    }
  })();

  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
      <div className="flex items-start gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
          <History size={18} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200">
            Draf Suntingan Belum Disimpan Ditemui ({formattedTime})
          </h4>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
            Anda mempunyai perubahan yang disimpan secara automatik sebelum pelayar ditutup atau dimuat semula.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          type="button"
          onClick={onRestore}
          className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
        >
          Pulihkan Draf
        </button>
        <button
          type="button"
          onClick={onDismiss}
          title="Buang draf sementara ini"
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
