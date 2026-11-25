import React, { useState } from 'react';
import { AdminSchoolConfig } from '../../types/rph';
import { AdminEditorAction, SimpleBankListKey } from '../../hooks/useAdminEditor';
import { EditableListItem } from './EditableListItem';
import { BulkPasteModal } from './BulkPasteModal';
import { Plus, Layers, Tag } from 'lucide-react';

interface Props {
  subTab: 'objektif' | 'aktiviti' | 'refleksi' | 'kustom';
  formConfig: AdminSchoolConfig;
  dispatch: React.Dispatch<AdminEditorAction>;
  onOpenCanvaGrid: () => void;
  showToast: (msg: string) => void;
}

export const AdminGeneralBankTab: React.FC<Props> = ({
  subTab,
  formConfig,
  dispatch,
  onOpenCanvaGrid,
  showToast
}) => {
  const [newText, setNewText] = useState('');
  const [newCustomOptionInput, setNewCustomOptionInput] = useState<Record<string, string>>({});
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCustomSection, setBulkCustomSection] = useState<{ id: string; title: string; existing: string[] } | null>(null);

  // Handlers for Custom Sections Bank (preserved names for test clarity)
  const handleTambahPilihanBank = (sectionId: string, sectionTitle: string) => {
    const val = (newCustomOptionInput[sectionId] || '').trim();
    if (!val) return;
    dispatch({ type: 'ADD_CUSTOM_OPTION', sectionId, value: val });
    setNewCustomOptionInput({ ...newCustomOptionInput, [sectionId]: '' });
    showToast(`Pilihan "${val}" berjaya ditambah ke bank ${sectionTitle}!`);
  };

  const handlePadamPilihanBank = (sectionId: string, optionIndex: number) => {
    dispatch({ type: 'DELETE_CUSTOM_OPTION', sectionId, index: optionIndex });
  };

  if (subTab === 'kustom') {
    const sections = formConfig.customPdfLayout?.customSections || [];
    return (
      <div className="space-y-6 pt-2">
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-white block">
            Senarai Bank Pilihan Untuk Bahagian Kustom ({sections.length}):
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Uruskan senarai pilihan dropdown untuk bahagian kustom yang telah anda cipta dalam Canva A4 (cth: BBM, Nilai Murni, Kaedah PdP). Kini menyokong sunting terus, susun semula & tampal pukal!
          </p>
        </div>

        {sections.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 bg-slate-50 dark:bg-slate-800/40">
            <Tag size={32} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Belum Ada Bahagian Kustom Dicipta
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 mb-4">
              Sila pergi ke Tab 4 (Susunan Grid PDF Canva A4) untuk menambah bahagian kustom baharu.
            </p>
            <button
              type="button"
              onClick={onOpenCanvaGrid}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-purple-700 cursor-pointer"
            >
              Buka Editor Canva A4 Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((sec) => (
              <div
                key={sec.id}
                className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {sec.namaJawi}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {sec.namaRumi}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 uppercase font-mono">
                      {sec.jenis}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {(sec.pilihanBank || []).length} Pilihan
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setBulkCustomSection({
                          id: sec.id,
                          title: sec.namaRumi,
                          existing: sec.pilihanBank || []
                        })
                      }
                      className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Layers size={12} />
                      <span>Pukal</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    dir="auto"
                    placeholder={`Tambah pilihan dropdown baru untuk ${sec.namaRumi}...`}
                    value={newCustomOptionInput[sec.id] || ''}
                    onChange={(e) =>
                      setNewCustomOptionInput({
                        ...newCustomOptionInput,
                        [sec.id]: e.target.value
                      })
                    }
                    onKeyDown={(e) =>
                      e.key === 'Enter' && (e.preventDefault(), handleTambahPilihanBank(sec.id, sec.namaRumi))
                    }
                    className="w-0 flex-1 min-w-0 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleTambahPilihanBank(sec.id, sec.namaRumi)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Tambah Pilihan</span>
                  </button>
                </div>

                {(sec.pilihanBank || []).length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">
                    Belum ada pilihan dropdown dalam bank ini. Taip di atas untuk menambah.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {(sec.pilihanBank || []).map((opt, oIdx) => (
                      <EditableListItem
                        key={oIdx}
                        value={opt}
                        compact
                        isFirst={oIdx === 0}
                        isLast={oIdx === (sec.pilihanBank || []).length - 1}
                        onSave={(val) =>
                          dispatch({
                            type: 'EDIT_CUSTOM_OPTION',
                            sectionId: sec.id,
                            index: oIdx,
                            value: val
                          })
                        }
                        onDelete={() => handlePadamPilihanBank(sec.id, oIdx)}
                        onMoveUp={() =>
                          dispatch({
                            type: 'REORDER_CUSTOM_OPTION',
                            sectionId: sec.id,
                            fromIndex: oIdx,
                            toIndex: oIdx - 1
                          })
                        }
                        onMoveDown={() =>
                          dispatch({
                            type: 'REORDER_CUSTOM_OPTION',
                            sectionId: sec.id,
                            fromIndex: oIdx,
                            toIndex: oIdx + 1
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <BulkPasteModal
          isOpen={bulkCustomSection !== null}
          title={`Tambah Pukal Pilihan — ${bulkCustomSection?.title || ''}`}
          existingItems={bulkCustomSection?.existing || []}
          onClose={() => setBulkCustomSection(null)}
          onConfirm={(_raw, parsed) => {
            if (!bulkCustomSection) return;
            dispatch({
              type: 'BULK_ADD_CUSTOM_OPTIONS',
              sectionId: bulkCustomSection.id,
              values: parsed
            });
            showToast(`${parsed.length} pilihan baharu ditambah ke ${bulkCustomSection.title}!`);
          }}
        />
      </div>
    );
  }

  // Subtabs: objektif, aktiviti, refleksi
  const metaMap: Record<
    'objektif' | 'aktiviti' | 'refleksi',
    {
      listKey: SimpleBankListKey;
      heading: string;
      subtitle: string;
      placeholder: string;
      quote?: boolean;
    }
  > = {
    objektif: {
      listKey: 'objektifList',
      heading: 'Bank Objektif Umum (Fallback Murid Dapat)',
      subtitle: 'Digunakan apabila tajuk tertentu belum mempunyai senarai objektif khusus.',
      placeholder: 'Taip objektif pembelajaran umum cth: Menyatakan pengertian dengan jelas...'
    },
    aktiviti: {
      listKey: 'aktivitiList',
      heading: 'Bank Aktiviti Umum (Murid Diminta)',
      subtitle: 'Rujukan pantas aktiviti murid bagi guru.',
      placeholder: 'Taip aktiviti murid diminta cth: Membaca secara berpasangan...'
    },
    refleksi: {
      listKey: 'refleksiCatatanList',
      heading: 'Bank Ayat Tindakan Susulan / Refleksi',
      subtitle: 'Guru boleh memilih ayat refleksi lazim ini secara pantas dari dropdown di Halaman Guru tanpa perlu menaip panjang.',
      placeholder: "Taip ayat refleksi lazim cth: Guru akan jalankan sesi tasmi' individu...",
      quote: true
    }
  };

  const meta = metaMap[subTab];
  const list = formConfig.bank[meta.listKey] || [];

  const handleAdd = () => {
    if (!newText.trim()) return;
    dispatch({ type: 'ADD_LIST_ITEM', listKey: meta.listKey, value: newText.trim() });
    setNewText('');
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-white block">
            {meta.heading} ({list.length} pilihan):
          </span>
          <p className="text-xs text-slate-500 mt-0.5">{meta.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setBulkOpen(true)}
          className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Layers size={14} />
          <span>Tambah Pukal</span>
        </button>
      </div>

      <div className="flex gap-2">
        <textarea
          rows={2}
          dir="auto"
          placeholder={meta.placeholder}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className="w-0 flex-1 min-w-0 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          <span>Tambah</span>
        </button>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {list.map((item, idx) => (
          <EditableListItem
            key={idx}
            value={item}
            multiline
            prefixQuote={meta.quote}
            isFirst={idx === 0}
            isLast={idx === list.length - 1}
            onSave={(val) =>
              dispatch({ type: 'EDIT_LIST_ITEM', listKey: meta.listKey, index: idx, value: val })
            }
            onDelete={() =>
              dispatch({ type: 'DELETE_LIST_ITEM', listKey: meta.listKey, index: idx })
            }
            onMoveUp={() =>
              dispatch({
                type: 'REORDER_LIST_ITEM',
                listKey: meta.listKey,
                fromIndex: idx,
                toIndex: idx - 1
              })
            }
            onMoveDown={() =>
              dispatch({
                type: 'REORDER_LIST_ITEM',
                listKey: meta.listKey,
                fromIndex: idx,
                toIndex: idx + 1
              })
            }
          />
        ))}
      </div>

      <BulkPasteModal
        isOpen={bulkOpen}
        title={`Tambah Pukal — ${meta.heading}`}
        existingItems={list}
        onClose={() => setBulkOpen(false)}
        onConfirm={(_raw, parsed) => {
          dispatch({ type: 'BULK_ADD_LIST_ITEMS', listKey: meta.listKey, values: parsed });
          showToast(`${parsed.length} item baharu berjaya dimasukkan!`);
        }}
      />
    </div>
  );
};
