import React, { useState } from 'react';
import { Pencil, Trash2, Check, X, ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  value: string;
  code?: string;
  showCodeInput?: boolean;
  multiline?: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSave: (newValue: string, newCode?: string) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  prefixQuote?: boolean;
  compact?: boolean;
}

export const EditableListItem: React.FC<Props> = ({
  value,
  code = '',
  showCodeInput = false,
  multiline = false,
  isFirst,
  isLast,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
  prefixQuote = false,
  compact = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const [draftCode, setDraftCode] = useState(code);

  const startEdit = () => {
    setDraftValue(value);
    setDraftCode(code);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraftValue(value);
    setDraftCode(code);
    setIsEditing(false);
  };

  const commitEdit = () => {
    const trimmed = draftValue.trim();
    if (!trimmed) return;
    onSave(trimmed, showCodeInput ? draftCode.trim() : undefined);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-400 dark:border-emerald-700 space-y-2 shadow-xs">
        <div className={showCodeInput ? 'flex gap-1.5 items-start' : ''}>
          {showCodeInput && (
            <input
              type="text"
              value={draftCode}
              onChange={(e) => setDraftCode(e.target.value)}
              placeholder="Kod"
              className="w-20 shrink-0 px-2 py-1.5 text-xs rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          )}
          {multiline ? (
            <textarea
              rows={2}
              dir="auto"
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancelEdit();
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  commitEdit();
                }
              }}
              autoFocus
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          ) : (
            <input
              type="text"
              dir="auto"
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancelEdit();
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitEdit();
                }
              }}
              autoFocus
              className="w-full min-w-0 flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          )}
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={cancelEdit}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 hover:bg-slate-100 cursor-pointer"
          >
            <X size={12} />
            <span>Batal</span>
          </button>
          <button
            type="button"
            onClick={commitEdit}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <Check size={12} />
            <span>Simpan</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        compact ? 'p-2' : 'p-2.5 sm:p-3'
      } rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2 text-xs font-medium text-slate-800 dark:text-slate-200 group hover:border-slate-300 dark:hover:border-slate-600 transition-colors`}
    >
      <div
        dir="auto"
        onDoubleClick={startEdit}
        title="Klik dua kali atau tekan ikon pensel untuk sunting terus"
        className="flex-1 min-w-0 leading-relaxed break-words cursor-text"
      >
        {showCodeInput && code && (
          <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
            {code}
          </span>
        )}
        <span>{prefixQuote ? `"${value}"` : value}</span>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          title="Naik ke atas"
          className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ArrowUp size={13} />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          title="Turun ke bawah"
          className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ArrowDown size={13} />
        </button>
        <button
          type="button"
          onClick={startEdit}
          title="Sunting terus item ini"
          className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
        >
          <Pencil size={13} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Padam item ini"
          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};
