import React, { useState } from 'react';
import { AdminSchoolConfig } from '../../types/rph';
import { AdminEditorAction } from '../../hooks/useAdminEditor';
import { EditableListItem } from './EditableListItem';
import { BulkPasteModal } from './BulkPasteModal';
import { Plus, Layers } from 'lucide-react';

interface Props {
  formConfig: AdminSchoolConfig;
  dispatch: React.Dispatch<AdminEditorAction>;
  showToast: (msg: string) => void;
}

export const AdminBasicBankTab: React.FC<Props> = ({ formConfig, dispatch, showToast }) => {
  const [newKelas, setNewKelas] = useState('');
  const [newMasa, setNewMasa] = useState('');
  const [bulkTarget, setBulkTarget] = useState<'kelas' | 'masa' | null>(null);

  const handleAddKelas = () => {
    if (!newKelas.trim()) return;
    dispatch({ type: 'ADD_LIST_ITEM', listKey: 'kelas', value: newKelas.trim() });
    setNewKelas('');
  };

  const handleAddMasa = () => {
    if (!newMasa.trim()) return;
    dispatch({ type: 'ADD_LIST_ITEM', listKey: 'masa', value: newMasa.trim() });
    setNewMasa('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
      {/* Kelas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-white">
            Senarai Nama Kelas ({formConfig.bank.kelas.length}):
          </span>
          <button
            type="button"
            onClick={() => setBulkTarget('kelas')}
            title="Tampal banyak nama kelas sekaligus"
            className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <Layers size={12} />
            <span>Pukal</span>
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tambah kelas cth: Umar 2"
            value={newKelas}
            onChange={(e) => setNewKelas(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKelas())}
            className="w-0 flex-1 min-w-0 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAddKelas}
            className="shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {formConfig.bank.kelas.map((k, idx) => (
            <EditableListItem
              key={`${k}-${idx}`}
              value={k}
              compact
              isFirst={idx === 0}
              isLast={idx === formConfig.bank.kelas.length - 1}
              onSave={(val) =>
                dispatch({ type: 'EDIT_LIST_ITEM', listKey: 'kelas', index: idx, value: val })
              }
              onDelete={() =>
                dispatch({ type: 'DELETE_LIST_ITEM', listKey: 'kelas', index: idx })
              }
              onMoveUp={() =>
                dispatch({ type: 'REORDER_LIST_ITEM', listKey: 'kelas', fromIndex: idx, toIndex: idx - 1 })
              }
              onMoveDown={() =>
                dispatch({ type: 'REORDER_LIST_ITEM', listKey: 'kelas', fromIndex: idx, toIndex: idx + 1 })
              }
            />
          ))}
        </div>
      </div>

      {/* Masa */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-white">
            Senarai Julat Masa ({formConfig.bank.masa.length}):
          </span>
          <button
            type="button"
            onClick={() => setBulkTarget('masa')}
            title="Tampal banyak julat masa sekaligus"
            className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <Layers size={12} />
            <span>Pukal</span>
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Cth: 2.30 - 3.30"
            value={newMasa}
            onChange={(e) => setNewMasa(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMasa())}
            className="w-0 flex-1 min-w-0 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAddMasa}
            className="shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {formConfig.bank.masa.map((m, idx) => (
            <EditableListItem
              key={`${m}-${idx}`}
              value={m}
              compact
              isFirst={idx === 0}
              isLast={idx === formConfig.bank.masa.length - 1}
              onSave={(val) =>
                dispatch({ type: 'EDIT_LIST_ITEM', listKey: 'masa', index: idx, value: val })
              }
              onDelete={() =>
                dispatch({ type: 'DELETE_LIST_ITEM', listKey: 'masa', index: idx })
              }
              onMoveUp={() =>
                dispatch({ type: 'REORDER_LIST_ITEM', listKey: 'masa', fromIndex: idx, toIndex: idx - 1 })
              }
              onMoveDown={() =>
                dispatch({ type: 'REORDER_LIST_ITEM', listKey: 'masa', fromIndex: idx, toIndex: idx + 1 })
              }
            />
          ))}
        </div>
      </div>

      {/* Tahun */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-800 dark:text-white block">
          Senarai Tahun:
        </span>
        <div className="flex flex-wrap gap-2">
          {formConfig.bank.tahun.map((t) => (
            <span
              key={t}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              Tahun {t}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Tahun standard KAFA 1 hingga 6. Gunakan butang pensel (✏️) dan anak panah (▲/▼) pada senarai Kelas & Masa untuk menyunting atau menyusun semula urutan pilihan guru.
        </p>
      </div>

      <BulkPasteModal
        isOpen={bulkTarget !== null}
        title={bulkTarget === 'kelas' ? 'Tambah Pukal Senarai Kelas' : 'Tambah Pukal Julat Masa'}
        placeholder={
          bulkTarget === 'kelas'
            ? 'Abu Bakar\nUmar\nUthman\nAli'
            : '2.30 - 3.00\n3.00 - 3.30\n3.30 - 4.00\n4.30 - 5.30'
        }
        existingItems={bulkTarget ? formConfig.bank[bulkTarget] : []}
        onClose={() => setBulkTarget(null)}
        onConfirm={(_raw, parsed) => {
          if (!bulkTarget) return;
          dispatch({ type: 'BULK_ADD_LIST_ITEMS', listKey: bulkTarget, values: parsed });
          showToast(`${parsed.length} item baharu berjaya ditambah ke senarai ${bulkTarget}!`);
        }}
      />
    </div>
  );
};
