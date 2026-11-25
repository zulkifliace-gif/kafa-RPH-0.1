import React, { useState, useMemo } from 'react';
import { AdminSchoolConfig, BankTajukItem } from '../../types/rph';
import { KURIKULUM_PENJAJARAN_2025 } from '../../data/kurikulumPenjajaran2025';
import { AdminEditorAction } from '../../hooks/useAdminEditor';
import { EditableListItem } from './EditableListItem';
import { BulkPasteModal } from './BulkPasteModal';
import {
  exportKurikulumToCsv,
  parseKurikulumCsv,
  parseBulkSubtajukLines,
  CsvKurikulumImportResult
} from '../../utils/csvHelper';
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Layers,
  Download,
  Upload,
  Sparkles,
  BookOpen,
  FileSpreadsheet
} from 'lucide-react';

interface Props {
  formConfig: AdminSchoolConfig;
  dispatch: React.Dispatch<AdminEditorAction>;
  showToast: (msg: string) => void;
}

export const AdminCurriculumTab: React.FC<Props> = ({ formConfig, dispatch, showToast }) => {
  const [currSubject, setCurrSubject] = useState<string>(formConfig.bank.mataPelajaran[0] || 'Al-Quran');
  const [currBidang, setCurrBidang] = useState<string>(formConfig.bank.bidangAlQuran[0] || 'Tilawah');
  const [currTahun, setCurrTahun] = useState<string>('Semua');
  const [currTajukId, setCurrTajukId] = useState<string>('');

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');

  // Add form inputs
  const [newSubjekInput, setNewSubjekInput] = useState('');
  const [newBidangInput, setNewBidangInput] = useState('');
  const [newTajukKodInput, setNewTajukKodInput] = useState('');
  const [newTajukTeksInput, setNewTajukTeksInput] = useState('');
  const [newTajukTahunInput, setNewTajukTahunInput] = useState('1');
  const [subtajukInputKod, setSubtajukInputKod] = useState('');
  const [subtajukInputTeks, setSubtajukInputTeks] = useState('');
  const [objektifInputTeks, setObjektifInputTeks] = useState('');
  const [aktivitiInputTeks, setAktivitiInputTeks] = useState('');

  // Inline rename Subject / Bidang
  const [renamingSubject, setRenamingSubject] = useState<string | null>(null);
  const [renameSubjectDraft, setRenameSubjectDraft] = useState('');
  const [renamingBidang, setRenamingBidang] = useState<string | null>(null);
  const [renameBidangDraft, setRenameBidangDraft] = useState('');

  // Inline edit active Tajuk
  const [editingTajukId, setEditingTajukId] = useState<string | null>(null);
  const [editTajukKod, setEditTajukKod] = useState('');
  const [editTajukTeks, setEditTajukTeks] = useState('');
  const [editTajukTahun, setEditTajukTahun] = useState('');

  // Bulk Paste modal target
  const [bulkChildTarget, setBulkChildTarget] = useState<'subtajuk' | 'objektif' | 'aktiviti' | null>(null);

  // CSV Import review modal
  const [pendingCsvImport, setPendingCsvImport] = useState<CsvKurikulumImportResult | null>(null);

  const kurikulumList = formConfig.bank.kurikulum || [];

  // Instant Global Search results across all 317+ Tajuk, Subtajuk, Objektif
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const matches: { item: BankTajukItem; matchedIn: string }[] = [];
    for (const item of kurikulumList) {
      if (
        (item.kod || '').toLowerCase().includes(q) ||
        (item.teks || '').toLowerCase().includes(q) ||
        (item.mataPelajaran || '').toLowerCase().includes(q)
      ) {
        matches.push({ item, matchedIn: 'Tajuk' });
      } else if (
        (item.subtajukList || []).some(
          (st) => st.kod.toLowerCase().includes(q) || st.teks.toLowerCase().includes(q)
        )
      ) {
        matches.push({ item, matchedIn: 'Subtajuk' });
      } else if ((item.objektifList || []).some((o) => o.toLowerCase().includes(q))) {
        matches.push({ item, matchedIn: 'Objektif' });
      } else if ((item.aktivitiList || []).some((a) => a.toLowerCase().includes(q))) {
        matches.push({ item, matchedIn: 'Aktiviti' });
      }
      if (matches.length >= 25) break;
    }
    return matches;
  }, [searchQuery, kurikulumList]);

  const handleJumpToSearchResult = (item: BankTajukItem) => {
    setCurrSubject(item.mataPelajaran);
    if (item.mataPelajaran === 'Al-Quran' && item.bidang) {
      setCurrBidang(item.bidang);
    }
    setCurrTahun(item.tahun || 'Semua');
    setCurrTajukId(item.id);
    setSearchQuery('');
  };

  // Filtered tajuks for current Subject / Bidang / Tahun
  const filteredTajukList = useMemo(
    () =>
      kurikulumList.filter((t) => {
        if (t.mataPelajaran !== currSubject) return false;
        if (currSubject === 'Al-Quran' && t.bidang !== currBidang) return false;
        if (currTahun !== 'Semua' && t.tahun && t.tahun !== currTahun) return false;
        return true;
      }),
    [kurikulumList, currSubject, currBidang, currTahun]
  );

  const activeTajuk =
    filteredTajukList.find((t) => t.id === currTajukId) || filteredTajukList[0] || null;

  const filteredScopeIds = useMemo(() => filteredTajukList.map((t) => t.id), [filteredTajukList]);

  // Handlers: Subjects
  const handleAddSubject = () => {
    const subName = newSubjekInput.trim();
    if (!subName) return;
    if (formConfig.bank.mataPelajaran.includes(subName)) {
      showToast(`Mata pelajaran "${subName}" sudah ada.`);
      return;
    }
    dispatch({ type: 'ADD_SUBJECT', name: subName });
    setNewSubjekInput('');
    setCurrSubject(subName);
    showToast(`Subjek "${subName}" berjaya ditambah!`);
  };

  const handleCommitRenameSubject = (oldName: string) => {
    const next = renameSubjectDraft.trim();
    if (!next || next === oldName) {
      setRenamingSubject(null);
      return;
    }
    if (formConfig.bank.mataPelajaran.includes(next)) {
      alert(`Subjek "${next}" sudah wujud.`);
      return;
    }
    dispatch({ type: 'RENAME_SUBJECT', oldName, newName: next });
    if (currSubject === oldName) setCurrSubject(next);
    setRenamingSubject(null);
    showToast(`Subjek "${oldName}" ditukar kepada "${next}" (semua tajuk berkaitan turut dikemas kini)!`);
  };

  const handleDeleteSubject = (subjekToDelete: string) => {
    if (formConfig.bank.mataPelajaran.length <= 1) {
      alert('Mesti ada sekurang-kurangnya 1 mata pelajaran.');
      return;
    }
    const relatedCount = kurikulumList.filter((t) => t.mataPelajaran === subjekToDelete).length;
    const msg =
      relatedCount > 0
        ? `Adakah anda pasti mahu memadam subjek "${subjekToDelete}"?\n\nPerhatian: Sebanyak ${relatedCount} tajuk di bawah subjek ini juga akan dikeluarkan daripada bank kurikulum.`
        : `Adakah anda pasti mahu memadam subjek "${subjekToDelete}"?`;
    if (!window.confirm(msg)) return;

    dispatch({ type: 'DELETE_SUBJECT', name: subjekToDelete });
    if (currSubject === subjekToDelete) {
      const remaining = formConfig.bank.mataPelajaran.filter((s) => s !== subjekToDelete);
      setCurrSubject(remaining[0] || '');
      setCurrTajukId('');
    }
    showToast(`Subjek "${subjekToDelete}" berjaya dipadam.`);
  };

  // Handlers: Bidang (Al-Quran)
  const handleAddBidang = () => {
    const bName = newBidangInput.trim();
    if (!bName) return;
    if (formConfig.bank.bidangAlQuran.includes(bName)) {
      showToast(`Bidang "${bName}" sudah ada.`);
      return;
    }
    dispatch({ type: 'ADD_BIDANG', name: bName });
    setNewBidangInput('');
    setCurrBidang(bName);
    showToast(`Bidang "${bName}" berjaya ditambah!`);
  };

  const handleCommitRenameBidang = (oldName: string) => {
    const next = renameBidangDraft.trim();
    if (!next || next === oldName) {
      setRenamingBidang(null);
      return;
    }
    if (formConfig.bank.bidangAlQuran.includes(next)) {
      alert(`Bidang "${next}" sudah wujud.`);
      return;
    }
    dispatch({ type: 'RENAME_BIDANG', oldName, newName: next });
    if (currBidang === oldName) setCurrBidang(next);
    setRenamingBidang(null);
    showToast(`Bidang "${oldName}" ditukar kepada "${next}" (semua tajuk Al-Quran berkaitan turut dikemas kini)!`);
  };

  const handleDeleteBidang = (bidangToDelete: string) => {
    if (formConfig.bank.bidangAlQuran.length <= 1) {
      alert('Mesti ada sekurang-kurangnya 1 bidang untuk Al-Quran.');
      return;
    }
    const relatedCount = kurikulumList.filter(
      (t) => t.mataPelajaran === 'Al-Quran' && t.bidang === bidangToDelete
    ).length;
    const msg =
      relatedCount > 0
        ? `Adakah anda pasti mahu memadam bidang "${bidangToDelete}"?\n\nPerhatian: Sebanyak ${relatedCount} tajuk di bawah bidang ini juga akan dikeluarkan.`
        : `Adakah anda pasti mahu memadam bidang "${bidangToDelete}"?`;
    if (!window.confirm(msg)) return;

    dispatch({ type: 'DELETE_BIDANG', name: bidangToDelete });
    if (currBidang === bidangToDelete) {
      const remaining = formConfig.bank.bidangAlQuran.filter((b) => b !== bidangToDelete);
      setCurrBidang(remaining[0] || '');
      setCurrTajukId('');
    }
    showToast(`Bidang "${bidangToDelete}" berjaya dipadam.`);
  };

  // Handlers: Tajuk
  const handleAddTajuk = () => {
    if (!newTajukTeksInput.trim()) return;
    const newId = `${currSubject.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const newItem: BankTajukItem = {
      id: newId,
      kod: newTajukKodInput.trim(),
      teks: newTajukTeksInput.trim(),
      mataPelajaran: currSubject,
      ...(currSubject === 'Al-Quran' ? { bidang: currBidang } : {}),
      tahun: newTajukTahunInput || (currTahun !== 'Semua' ? currTahun : '1'),
      subtajukList: [],
      objektifList: [],
      aktivitiList: []
    };
    dispatch({ type: 'ADD_TAJUK', item: newItem });
    setNewTajukKodInput('');
    setNewTajukTeksInput('');
    setCurrTajukId(newId);
    showToast(`Tajuk "${newItem.teks}" berjaya ditambah!`);
  };

  const handleStartEditTajuk = (t: BankTajukItem) => {
    setEditingTajukId(t.id);
    setEditTajukKod(t.kod || '');
    setEditTajukTeks(t.teks || '');
    setEditTajukTahun(t.tahun || '1');
  };

  const handleCommitEditTajuk = () => {
    if (!editingTajukId || !editTajukTeks.trim()) return;
    dispatch({
      type: 'EDIT_TAJUK',
      tajukId: editingTajukId,
      fields: {
        kod: editTajukKod.trim(),
        teks: editTajukTeks.trim(),
        tahun: editTajukTahun || '1'
      }
    });
    setEditingTajukId(null);
    showToast('Maklumat tajuk berjaya dikemas kini!');
  };

  const handleDeleteTajuk = (tajukId: string) => {
    if (!window.confirm('Padam tajuk ini beserta semua subtajuk, objektif, dan aktivitinya?')) return;
    dispatch({ type: 'DELETE_TAJUK', tajukId });
    if (currTajukId === tajukId) setCurrTajukId('');
    showToast('Tajuk berjaya dipadam.');
  };

  // Handlers: Active Tajuk children
  const handleAddSubtajuk = () => {
    if (!activeTajuk || !subtajukInputTeks.trim()) return;
    dispatch({
      type: 'ADD_TAJUK_SUBTAJUK',
      tajukId: activeTajuk.id,
      item: { kod: subtajukInputKod.trim(), teks: subtajukInputTeks.trim() }
    });
    setSubtajukInputKod('');
    setSubtajukInputTeks('');
  };

  const handleAddObjektif = () => {
    if (!activeTajuk || !objektifInputTeks.trim()) return;
    dispatch({
      type: 'ADD_TAJUK_TEXT_CHILD',
      tajukId: activeTajuk.id,
      field: 'objektifList',
      value: objektifInputTeks.trim()
    });
    setObjektifInputTeks('');
  };

  const handleAddAktiviti = () => {
    if (!activeTajuk || !aktivitiInputTeks.trim()) return;
    dispatch({
      type: 'ADD_TAJUK_TEXT_CHILD',
      tajukId: activeTajuk.id,
      field: 'aktivitiList',
      value: aktivitiInputTeks.trim()
    });
    setAktivitiInputTeks('');
  };

  // CSV Import / Export
  const handleExportCsv = () => {
    exportKurikulumToCsv(kurikulumList, formConfig.namaSekolah);
    showToast(`Fail CSV (${kurikulumList.length} tajuk) sedia dibuka dalam Excel / Google Sheets!`);
  };

  const handleSelectCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || '');
      const result = parseKurikulumCsv(text);
      if (result.items.length === 0) {
        alert(result.errors[0] || 'Tiada data tajuk sah ditemui dalam fail CSV.');
        return;
      }
      setPendingCsvImport(result);
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleConfirmCsvImport = (mode: 'merge' | 'replace') => {
    if (!pendingCsvImport) return;
    dispatch({
      type: 'IMPORT_KURIKULUM',
      items: pendingCsvImport.items,
      subjects: pendingCsvImport.subjects,
      bidangAlQuran: pendingCsvImport.bidangAlQuran,
      mode
    });
    showToast(
      `Import CSV berjaya! ${pendingCsvImport.items.length} tajuk ${
        mode === 'merge' ? 'digabungkan' : 'digantikan'
      }.`
    );
    setPendingCsvImport(null);
  };

  const handleRestoreOfficialCurriculum = () => {
    if (
      window.confirm(
        'Adakah anda pasti mahu memuat semula keseluruhan Kurikulum Rasmi JAWI 2025 (317 tajuk mengikut Lampiran A Penjajaran)? Perubahan manual pada senarai tajuk akan digantikan dengan versi piawai rasmi.'
      )
    ) {
      dispatch({
        type: 'RESTORE_OFFICIAL_KURIKULUM',
        officialItems: KURIKULUM_PENJAJARAN_2025
      });
      showToast('317 Kurikulum Rasmi JAWI 2025 berjaya dimuatkan ke Bank Data!');
    }
  };

  return (
    <div className="space-y-5 pt-2">
      {/* BAR CARIAN GLOBAL + EKSPORT/IMPORT CSV EXCEL */}
      <div className="bg-gradient-to-r from-slate-50 to-emerald-50/60 dark:from-slate-700/40 dark:to-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Global Instant Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              dir="auto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari pantas merentasi ${kurikulumList.length} tajuk, subtajuk & objektif (cth: 5.8, bersyukur, قاعدة)...`}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* CSV Excel Export / Import & Official Restore */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              title="Eksport seluruh bank kurikulum ke format CSV (serasi Microsoft Excel & tulisan Jawi)"
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download size={14} />
              <span>Eksport CSV/Excel</span>
            </button>

            <label
              title="Import kurikulum daripada fail CSV (Excel / Google Sheets)"
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Upload size={14} />
              <span>Import CSV</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleSelectCsvFile}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleRestoreOfficialCurriculum}
              title="Muat semula 317 tajuk Kurikulum Penjajaran 2025 rasmi"
              className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Kurikulum 2025 (317)</span>
            </button>
          </div>
        </div>

        {/* Search Results Dropdown Panel */}
        {searchQuery.trim() && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-emerald-300 dark:border-emerald-700 p-2.5 space-y-1.5 max-h-60 overflow-y-auto shadow-md">
            <div className="text-[11px] font-bold text-slate-500 px-1 flex items-center justify-between">
              <span>Hasil Carian Global ({searchResults.length} ditemui):</span>
              <span className="text-emerald-600">Klik untuk terus sunting</span>
            </div>
            {searchResults.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-2 text-center">
                Tiada tajuk, subtajuk atau objektif yang sepadan dengan "{searchQuery}".
              </p>
            ) : (
              searchResults.map(({ item, matchedIn }) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleJumpToSearchResult(item)}
                  className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-transparent hover:border-emerald-200 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate" dir="auto">
                      {item.kod ? `${item.kod} ` : ''}{item.teks}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{item.mataPelajaran}</span>
                      {item.bidang && <span>• {item.bidang}</span>}
                      {item.tahun && <span>• Tahun {item.tahun}</span>}
                    </div>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    Padan: {matchedIn}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* LANGKAH 1: PILIH / TAMBAH / TUKAR NAMA MATA PELAJARAN */}
      <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <BookOpen size={15} className="text-emerald-600" />
            1. Mata Pelajaran ({formConfig.bank.mataPelajaran.length}) — Klik pensel untuk tukar nama berkait:
          </span>
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="+ Subjek baharu..."
              value={newSubjekInput}
              onChange={(e) => setNewSubjekInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddSubject}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {formConfig.bank.mataPelajaran.map((mp) => {
            const isActive = currSubject === mp;
            const count = kurikulumList.filter((t) => t.mataPelajaran === mp).length;

            if (renamingSubject === mp) {
              return (
                <div
                  key={mp}
                  className="inline-flex items-center gap-1 p-1 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-400"
                >
                  <input
                    type="text"
                    value={renameSubjectDraft}
                    onChange={(e) => setRenameSubjectDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCommitRenameSubject(mp);
                      if (e.key === 'Escape') setRenamingSubject(null);
                    }}
                    autoFocus
                    className="w-32 px-2 py-1 text-xs rounded-lg border border-amber-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => handleCommitRenameSubject(mp)}
                    className="p-1 bg-emerald-600 text-white rounded-lg cursor-pointer"
                    title="Simpan nama baharu"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingSubject(null)}
                    className="p-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={mp}
                className={`inline-flex items-center rounded-xl border transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setCurrSubject(mp);
                    setCurrTajukId('');
                  }}
                  className="px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{mp}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRenamingSubject(mp);
                    setRenameSubjectDraft(mp);
                  }}
                  title={`Tukar nama subjek ${mp}`}
                  className={`p-1 transition-colors cursor-pointer ${
                    isActive ? 'text-emerald-100 hover:text-white' : 'text-slate-400 hover:text-amber-600'
                  }`}
                >
                  <Pencil size={11} />
                </button>
                {formConfig.bank.mataPelajaran.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSubject(mp)}
                    title={`Padam subjek ${mp}`}
                    className={`p-1 pr-2 transition-colors cursor-pointer ${
                      isActive ? 'text-emerald-100 hover:text-rose-200' : 'text-slate-400 hover:text-rose-600'
                    }`}
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* BIDANG KHUSUS AL-QURAN */}
        {currSubject === 'Al-Quran' && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Bidang Al-Quran ({formConfig.bank.bidangAlQuran.length}):
              </span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="+ Bidang baharu..."
                  value={newBidangInput}
                  onChange={(e) => setNewBidangInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBidang())}
                  className="px-2.5 py-1 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddBidang}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {formConfig.bank.bidangAlQuran.map((b) => {
                const isActive = currBidang === b;
                if (renamingBidang === b) {
                  return (
                    <div
                      key={b}
                      className="inline-flex items-center gap-1 p-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-500"
                    >
                      <input
                        type="text"
                        value={renameBidangDraft}
                        onChange={(e) => setRenameBidangDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommitRenameBidang(b);
                          if (e.key === 'Escape') setRenamingBidang(null);
                        }}
                        autoFocus
                        className="w-28 px-2 py-1 text-xs rounded-lg border border-amber-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => handleCommitRenameBidang(b)}
                        className="p-1 bg-emerald-600 text-white rounded-lg cursor-pointer"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingBidang(null)}
                        className="p-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={b}
                    className={`inline-flex items-center rounded-xl border transition-all ${
                      isActive
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setCurrBidang(b);
                        setCurrTajukId('');
                      }}
                      className="px-3 py-1.5 text-xs font-bold cursor-pointer"
                    >
                      {b}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRenamingBidang(b);
                        setRenameBidangDraft(b);
                      }}
                      title={`Tukar nama bidang ${b}`}
                      className={`p-1 cursor-pointer ${
                        isActive ? 'text-amber-100 hover:text-white' : 'text-amber-700/60 hover:text-amber-900'
                      }`}
                    >
                      <Pencil size={11} />
                    </button>
                    {formConfig.bank.bidangAlQuran.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteBidang(b)}
                        title={`Padam bidang ${b}`}
                        className={`p-1 pr-2 cursor-pointer ${
                          isActive ? 'text-amber-100 hover:text-rose-200' : 'text-amber-700/60 hover:text-rose-600'
                        }`}
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PENAPIS TAHUN */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Tapis Tahun:</span>
          {['Semua', ...formConfig.bank.tahun].map((thn) => (
            <button
              key={thn}
              type="button"
              onClick={() => {
                setCurrTahun(thn);
                setCurrTajukId('');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                currTahun === thn
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
              }`}
            >
              {thn === 'Semua' ? 'Semua Tahun' : `Tahun ${thn}`}
            </button>
          ))}
        </div>
      </div>

      {/* LANGKAH 2: SENARAI TAJUK (INLINE EDIT + REORDER) */}
      <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            2. Senarai Tajuk — {currSubject}
            {currSubject === 'Al-Quran' ? ` (${currBidang})` : ''} ({filteredTajukList.length} tajuk):
          </span>
        </div>

        {/* Add Tajuk row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <select
            value={newTajukTahunInput}
            onChange={(e) => setNewTajukTahunInput(e.target.value)}
            className="sm:col-span-2 px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
          >
            {formConfig.bank.tahun.map((t) => (
              <option key={t} value={t}>Tahun {t}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Kod (cth: 5.8)"
            value={newTajukKodInput}
            onChange={(e) => setNewTajukKodInput(e.target.value)}
            className="sm:col-span-2 px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
          <input
            type="text"
            dir="auto"
            placeholder="Taip nama tajuk baharu (Rumi atau Jawi)..."
            value={newTajukTeksInput}
            onChange={(e) => setNewTajukTeksInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTajuk())}
            className="sm:col-span-6 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          />
          <button
            type="button"
            onClick={handleAddTajuk}
            className="sm:col-span-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus size={14} />
            <span>Tambah Tajuk</span>
          </button>
        </div>

        {/* Tajuk List */}
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {filteredTajukList.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-4">
              Tiada tajuk bagi penapis ini. Tambah tajuk baharu di atas.
            </p>
          ) : (
            filteredTajukList.map((t, idx) => {
              const isSelected = activeTajuk?.id === t.id;
              const isEditingThis = editingTajukId === t.id;

              if (isEditingThis) {
                return (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-400 space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <select
                        value={editTajukTahun}
                        onChange={(e) => setEditTajukTahun(e.target.value)}
                        className="sm:col-span-2 px-2 py-1 text-xs rounded-lg border border-amber-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      >
                        {formConfig.bank.tahun.map((th) => (
                          <option key={th} value={th}>Tahun {th}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={editTajukKod}
                        onChange={(e) => setEditTajukKod(e.target.value)}
                        placeholder="Kod"
                        className="sm:col-span-2 px-2 py-1 text-xs rounded-lg border border-amber-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      />
                      <input
                        type="text"
                        dir="auto"
                        value={editTajukTeks}
                        onChange={(e) => setEditTajukTeks(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommitEditTajuk();
                          if (e.key === 'Escape') setEditingTajukId(null);
                        }}
                        autoFocus
                        className="sm:col-span-8 px-2.5 py-1 text-xs rounded-lg border border-amber-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingTajukId(null)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 text-xs font-bold text-slate-600 dark:text-slate-200 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleCommitEditTajuk}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                      >
                        Simpan Tajuk
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={t.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 ring-1 ring-emerald-400'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setCurrTajukId(t.id)}
                    className="flex-1 min-w-0 text-left flex items-center gap-2 cursor-pointer"
                  >
                    {t.tahun && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-black text-slate-600 dark:text-slate-300">
                        T{t.tahun}
                      </span>
                    )}
                    {t.kod && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-[10px] font-black text-emerald-800 dark:text-emerald-300">
                        {t.kod}
                      </span>
                    )}
                    <span dir="auto" className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {t.teks}
                    </span>
                    <span className="shrink-0 text-[10px] text-slate-400 hidden md:inline">
                      ({t.subtajukList.length} sub • {t.objektifList.length} obj)
                    </span>
                  </button>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() =>
                        dispatch({
                          type: 'REORDER_TAJUK',
                          tajukId: t.id,
                          direction: 'up',
                          scopeIds: filteredScopeIds
                        })
                      }
                      title="Naik ke atas"
                      className="p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-25 cursor-pointer"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === filteredTajukList.length - 1}
                      onClick={() =>
                        dispatch({
                          type: 'REORDER_TAJUK',
                          tajukId: t.id,
                          direction: 'down',
                          scopeIds: filteredScopeIds
                        })
                      }
                      title="Turun ke bawah"
                      className="p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-25 cursor-pointer"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEditTajuk(t)}
                      title="Sunting kod, tahun & nama tajuk"
                      className="p-1 text-slate-400 hover:text-amber-600 cursor-pointer"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTajuk(t.id)}
                      title="Padam tajuk ini"
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* LANGKAH 3: PENGURUSAN SUBTAJUK, OBJEKTIF & AKTIVITI BAGI TAJUK TERPILIH */}
      {activeTajuk && (
        <div className="space-y-3">
          <div className="px-1 flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300" dir="auto">
              3. Kandungan Tajuk Aktif: {activeTajuk.kod ? `${activeTajuk.kod} ` : ''}{activeTajuk.teks}
            </h4>
            <span className="text-[11px] text-slate-500">
              Klik ikon pensel (✏️) untuk sunting terus atau (▲/▼) untuk susun urutan.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* KOLUM 1: SUBTAJUK */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Subtajuk ({activeTajuk.subtajukList.length}):
                </span>
                <button
                  type="button"
                  onClick={() => setBulkChildTarget('subtajuk')}
                  className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Layers size={11} />
                  <span>Pukal</span>
                </button>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Kod"
                  value={subtajukInputKod}
                  onChange={(e) => setSubtajukInputKod(e.target.value)}
                  className="w-16 shrink-0 px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  dir="auto"
                  placeholder="Nama subtajuk..."
                  value={subtajukInputTeks}
                  onChange={(e) => setSubtajukInputTeks(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtajuk())}
                  className="w-0 flex-1 min-w-0 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddSubtajuk}
                  className="shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {activeTajuk.subtajukList.map((st, sIdx) => (
                  <EditableListItem
                    key={`${st.kod}-${sIdx}`}
                    value={st.teks}
                    code={st.kod}
                    showCodeInput
                    compact
                    isFirst={sIdx === 0}
                    isLast={sIdx === activeTajuk.subtajukList.length - 1}
                    onSave={(newTeks, newKod) =>
                      dispatch({
                        type: 'EDIT_TAJUK_SUBTAJUK',
                        tajukId: activeTajuk.id,
                        index: sIdx,
                        item: { kod: newKod ?? st.kod, teks: newTeks }
                      })
                    }
                    onDelete={() =>
                      dispatch({
                        type: 'DELETE_TAJUK_SUBTAJUK',
                        tajukId: activeTajuk.id,
                        index: sIdx
                      })
                    }
                    onMoveUp={() =>
                      dispatch({
                        type: 'REORDER_TAJUK_SUBTAJUK',
                        tajukId: activeTajuk.id,
                        fromIndex: sIdx,
                        toIndex: sIdx - 1
                      })
                    }
                    onMoveDown={() =>
                      dispatch({
                        type: 'REORDER_TAJUK_SUBTAJUK',
                        tajukId: activeTajuk.id,
                        fromIndex: sIdx,
                        toIndex: sIdx + 1
                      })
                    }
                  />
                ))}
                {activeTajuk.subtajukList.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic text-center py-2">
                    Tiada subtajuk didaftarkan.
                  </p>
                )}
              </div>
            </div>

            {/* KOLUM 2: OBJEKTIF */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Objektif: Murid dapat ({activeTajuk.objektifList.length}):
                </span>
                <button
                  type="button"
                  onClick={() => setBulkChildTarget('objektif')}
                  className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Layers size={11} />
                  <span>Pukal</span>
                </button>
              </div>

              <div className="flex gap-1.5">
                <textarea
                  rows={2}
                  dir="auto"
                  placeholder="Taip objektif murid dapat bagi tajuk ini..."
                  value={objektifInputTeks}
                  onChange={(e) => setObjektifInputTeks(e.target.value)}
                  className="w-0 flex-1 min-w-0 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddObjektif}
                  className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {activeTajuk.objektifList.map((obj, oIdx) => (
                  <EditableListItem
                    key={oIdx}
                    value={obj}
                    multiline
                    compact
                    isFirst={oIdx === 0}
                    isLast={oIdx === activeTajuk.objektifList.length - 1}
                    onSave={(val) =>
                      dispatch({
                        type: 'EDIT_TAJUK_TEXT_CHILD',
                        tajukId: activeTajuk.id,
                        field: 'objektifList',
                        index: oIdx,
                        value: val
                      })
                    }
                    onDelete={() =>
                      dispatch({
                        type: 'DELETE_TAJUK_TEXT_CHILD',
                        tajukId: activeTajuk.id,
                        field: 'objektifList',
                        index: oIdx
                      })
                    }
                    onMoveUp={() =>
                      dispatch({
                        type: 'REORDER_TAJUK_TEXT_CHILD',
                        tajukId: activeTajuk.id,
                        field: 'objektifList',
                        fromIndex: oIdx,
                        toIndex: oIdx - 1
                      })
                    }
                    onMoveDown={() =>
                      dispatch({
                        type: 'REORDER_TAJUK_TEXT_CHILD',
                        tajukId: activeTajuk.id,
                        field: 'objektifList',
                        fromIndex: oIdx,
                        toIndex: oIdx + 1
                      })
                    }
                  />
                ))}
                {activeTajuk.objektifList.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic text-center py-2">
                    Tiada objektif khusus.
                  </p>
                )}
              </div>
            </div>

            {/* KOLUM 3: AKTIVITI */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Aktiviti: Murid diminta ({activeTajuk.aktivitiList.length}):
                </span>
                <button
                  type="button"
                  onClick={() => setBulkChildTarget('aktiviti')}
                  className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Layers size={11} />
                  <span>Pukal</span>
                </button>
              </div>

              <div className="flex gap-1.5">
                <textarea
                  rows={2}
                  dir="auto"
                  placeholder="Taip aktiviti murid diminta bagi tajuk ini..."
                  value={aktivitiInputTeks}
                  onChange={(e) => setAktivitiInputTeks(e.target.value)}
                  className="w-0 flex-1 min-w-0 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddAktiviti}
                  className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {activeTajuk.aktivitiList.map((akt, aIdx) => (
                  <EditableListItem
                    key={aIdx}
                    value={akt}
                    multiline
                    compact
                    isFirst={aIdx === 0}
                    isLast={aIdx === activeTajuk.aktivitiList.length - 1}
                    onSave={(val) =>
                      dispatch({
                        type: 'EDIT_TAJUK_TEXT_CHILD',
                        tajukId: activeTajuk.id,
                        field: 'aktivitiList',
                        index: aIdx,
                        value: val
                      })
                    }
                    onDelete={() =>
                      dispatch({
                        type: 'DELETE_TAJUK_TEXT_CHILD',
                        tajukId: activeTajuk.id,
                        field: 'aktivitiList',
                        index: aIdx
                      })
                    }
                    onMoveUp={() =>
                      dispatch({
                        type: 'REORDER_TAJUK_TEXT_CHILD',
                        tajukId: activeTajuk.id,
                        field: 'aktivitiList',
                        fromIndex: aIdx,
                        toIndex: aIdx - 1
                      })
                    }
                    onMoveDown={() =>
                      dispatch({
                        type: 'REORDER_TAJUK_TEXT_CHILD',
                        tajukId: activeTajuk.id,
                        field: 'aktivitiList',
                        fromIndex: aIdx,
                        toIndex: aIdx + 1
                      })
                    }
                  />
                ))}
                {activeTajuk.aktivitiList.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic text-center py-2">
                    Tiada aktiviti khusus.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Paste Modal for Subtajuk / Objektif / Aktiviti */}
      {activeTajuk && (
        <BulkPasteModal
          isOpen={bulkChildTarget !== null}
          title={
            bulkChildTarget === 'subtajuk'
              ? `Tambah Pukal Subtajuk (${activeTajuk.teks})`
              : bulkChildTarget === 'objektif'
              ? `Tambah Pukal Objektif (${activeTajuk.teks})`
              : `Tambah Pukal Aktiviti (${activeTajuk.teks})`
          }
          description={
            bulkChildTarget === 'subtajuk'
              ? '1 baris = 1 subtajuk. Boleh guna format "5.8.1 Pengertian Bersyukur" atau "5.8.1 | Pengertian Bersyukur".'
              : '1 baris = 1 item. Baris kosong dan item pendua akan ditapis secara automatik.'
          }
          placeholder={
            bulkChildTarget === 'subtajuk'
              ? '5.8.1 Pengertian Bersyukur\n5.8.2 Dalil Kewajipan Bersyukur\n5.8.3 Cara Bersyukur'
              : 'Menyatakan pengertian dengan jelas.\nMembaca dalil naqli dengan betul.'
          }
          existingItems={
            bulkChildTarget === 'objektif'
              ? activeTajuk.objektifList
              : bulkChildTarget === 'aktiviti'
              ? activeTajuk.aktivitiList
              : []
          }
          onClose={() => setBulkChildTarget(null)}
          onConfirm={(rawText, parsedLines) => {
            if (bulkChildTarget === 'subtajuk') {
              const items = parseBulkSubtajukLines(rawText, activeTajuk.subtajukList);
              if (items.length > 0) {
                dispatch({
                  type: 'BULK_ADD_TAJUK_SUBTAJUK',
                  tajukId: activeTajuk.id,
                  items
                });
                showToast(`${items.length} subtajuk baharu berjaya ditambah!`);
              }
            } else if (bulkChildTarget === 'objektif' || bulkChildTarget === 'aktiviti') {
              dispatch({
                type: 'BULK_ADD_TAJUK_TEXT_CHILDREN',
                tajukId: activeTajuk.id,
                field: bulkChildTarget === 'objektif' ? 'objektifList' : 'aktivitiList',
                values: parsedLines
              });
              showToast(`${parsedLines.length} item baharu berjaya ditambah!`);
            }
          }}
        />
      )}

      {/* CSV Import Confirmation Modal (Merge vs Replace) */}
      {pendingCsvImport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Sahkan Import Kurikulum CSV/Excel
                </h3>
                <p className="text-xs text-slate-500">
                  {pendingCsvImport.items.length} tajuk sah dikesan daripada {pendingCsvImport.subjects.length} subjek.
                </p>
              </div>
            </div>

            {pendingCsvImport.errors.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 max-h-24 overflow-y-auto">
                {pendingCsvImport.errors.slice(0, 5).map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Pilih cara anda ingin memasukkan data daripada fail CSV ini ke dalam Bank Kurikulum:
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleConfirmCsvImport('merge')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Gabung (Tambah & Kemas Kini Tanpa Padam Yang Lama)
              </button>
              <button
                type="button"
                onClick={() => handleConfirmCsvImport('replace')}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold cursor-pointer"
              >
                Ganti Keseluruhan Bank Kurikulum Dengan Fail Ini
              </button>
              <button
                type="button"
                onClick={() => setPendingCsvImport(null)}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
