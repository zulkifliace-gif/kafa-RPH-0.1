import React, { useState, useMemo } from 'react';
import { Layers, Plus, X } from 'lucide-react';
import { parseBulkLines } from '../../utils/csvHelper';

interface Props {
  isOpen: boolean;
  title: string;
  description?: string;
  placeholder?: string;
  existingItems?: string[];
  onClose: () => void;
  onConfirm: (rawText: string, parsedLines: string[]) => void;
}

export const BulkPasteModal: React.FC<Props> = ({
  isOpen,
  title,
  description = 'Tampal atau taip berbilang item di bawah (1 baris = 1 item). Baris kosong dan item pendua akan ditapis secara automatik.',
  placeholder = 'Baris 1\nBaris 2\nBaris 3...',
  existingItems = [],
  onClose,
  onConfirm
}) => {
  const [rawText, setRawText] = useState('');

  const parsedLines = useMemo(
    () => parseBulkLines(rawText, existingItems),
    [rawText, existingItems]
  );

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (parsedLines.length === 0) return;
    onConfirm(rawText, parsedLines);
    setRawText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2">
          <textarea
            rows={7}
            dir="auto"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={placeholder}
            autoFocus
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              Tip: Salin terus daripada Word, Excel, atau WhatsApp dan tampal di sini.
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
              {parsedLines.length} item baharu dikesan
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={parsedLines.length === 0}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Masukkan {parsedLines.length} Item</span>
          </button>
        </div>
      </div>
    </div>
  );
};
