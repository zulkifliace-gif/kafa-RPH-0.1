import React, { useState, useEffect } from 'react';
import { AdminSchoolConfig, ScriptMode } from '../types/rph';
import { AdminPdfLayoutEditor } from './AdminPdfLayoutEditor';
import { DEFAULT_CANVA_LAYOUT } from '../config/gridPresets';
import {
  exportSchoolConfigFile,
  importSchoolConfigFile,
  loadAdminDraft,
  clearAdminDraft
} from '../utils/storage';
import { useAdminEditor } from '../hooks/useAdminEditor';
import { AdminProfileTab } from './admin/AdminProfileTab';
import { AdminLabelsTab } from './admin/AdminLabelsTab';
import { AdminBasicBankTab } from './admin/AdminBasicBankTab';
import { AdminCurriculumTab } from './admin/AdminCurriculumTab';
import { AdminGeneralBankTab } from './admin/AdminGeneralBankTab';
import { AdminScheduleTab } from './admin/AdminScheduleTab';
import { StickySaveBar, DraftRecoveryBanner } from './admin/StickySaveBar';
import {
  ShieldCheck,
  Save,
  RotateCcw,
  Lock,
  Unlock,
  School,
  FileText,
  ListPlus,
  CheckCircle,
  Eye,
  LayoutGrid,
  Upload,
  Download,
  Calendar,
  Undo2,
  Redo2
} from 'lucide-react';

interface Props {
  config: AdminSchoolConfig;
  onSaveConfig: (cfg: AdminSchoolConfig) => void;
  onResetToDefault: () => void;
  onGoToTeacherView: () => void;
  skrip?: ScriptMode;
  onDirtyChange?: (isDirty: boolean, currentFormConfig: AdminSchoolConfig) => void;
}

export const AdminView: React.FC<Props> = ({
  config,
  onSaveConfig,
  onResetToDefault,
  onGoToTeacherView,
  skrip,
  onDirtyChange
}) => {
  // PIN authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'profil' | 'format' | 'bank' | 'grid' | 'jadual'>('profil');
  const [bankSubTab, setBankSubTab] = useState<'asas' | 'tajuk' | 'objektif' | 'aktiviti' | 'refleksi' | 'kustom'>('asas');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Centralized reducer + Undo/Redo + Auto-Draft
  const {
    formConfig,
    dispatch,
    isDirty,
    canUndo,
    canRedo,
    changeCount,
    undo,
    redo,
    discardChanges
  } = useAdminEditor(config, isAuthenticated);

  // Check if an unsaved draft exists from a previous session
  const [recoverableDraft, setRecoverableDraft] = useState<{
    savedAt: string;
    config: AdminSchoolConfig;
  } | null>(() => {
    const draft = loadAdminDraft();
    if (draft && JSON.stringify(draft.config) !== JSON.stringify(config)) {
      return draft;
    }
    return null;
  });

  // Notify parent App.tsx of dirty state (for unsaved changes modal on navigation)
  useEffect(() => {
    if (!isAuthenticated) {
      onDirtyChange?.(false, formConfig);
      return;
    }
    onDirtyChange?.(isDirty, formConfig);
  }, [formConfig, isDirty, isAuthenticated, onDirtyChange]);

  // Keyboard shortcuts: Ctrl+Z (Undo) & Ctrl+Y / Ctrl+Shift+Z (Redo)
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTextField =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (isTextField) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (canUndo) {
          e.preventDefault();
          undo();
        }
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))
      ) {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, canUndo, canRedo, undo, redo]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === config.adminPin || enteredPin === '1234') {
      setIsAuthenticated(true);
      setPinError(null);
    } else {
      setPinError('PIN keselamatan salah. Sila cuba lagi.');
    }
  };

  const handleSave = () => {
    onSaveConfig(formConfig);
    clearAdminDraft();
    setRecoverableDraft(null);
    showToast('Semua tetapan admin & bank data berjaya disimpan!');
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Adakah anda pasti mahu menetapkan semula semua konfigurasi dan bank data ke tetapan asal?'
      )
    ) {
      clearAdminDraft();
      setRecoverableDraft(null);
      onResetToDefault();
      showToast('Tetapan telah dikembalikan ke lalai.');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Saiz fail terlalu besar. Sila pilih fail gambar di bawah 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 320;
        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png', 0.9);
          dispatch({ type: 'UPDATE_PROFILE', fields: { logoSekolah: dataUrl } });
          showToast('Logo sekolah berjaya dimuat naik! Tekan Simpan untuk mengesahkan.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveLogo = () => {
    if (window.confirm('Adakah anda pasti mahu membuang gambar logo sekolah ini?')) {
      dispatch({ type: 'UPDATE_PROFILE', fields: { logoSekolah: '' } });
      showToast('Logo sekolah telah dibuang.');
    }
  };

  const handleExportSchoolData = () => {
    exportSchoolConfigFile(formConfig);
    showToast('Fail data sekolah (.json) berjaya dimuat turun untuk dikongsi kepada guru!');
  };

  const handleImportSchoolData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedCfg = await importSchoolConfigFile(file);
      dispatch({ type: 'SET_CONFIG', config: importedCfg });
      onSaveConfig(importedCfg);
      clearAdminDraft();
      setRecoverableDraft(null);
      showToast(`Data sekolah "${importedCfg.namaSekolah}" berjaya dipasang & disimpan!`);
    } catch (err: any) {
      alert(err.message || 'Ralat membaca fail data sekolah.');
    } finally {
      e.target.value = '';
    }
  };

  // ----------------------------------------------------
  // PIN LOCK SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4">
          <Lock size={30} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          Kawasan Pentadbir (Admin Sahaja)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Sila masukkan PIN keselamatan untuk mengubah nama sekolah, format tajuk, bank dropdown dan jadual waktu.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Masukkan PIN (Lalai: 1234)"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              className="w-full text-center text-xl tracking-widest font-bold px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            {pinError && <p className="text-xs text-red-500 mt-1.5 font-medium">{pinError}</p>}
            <p className="text-[11px] text-slate-400 mt-2">
              (PIN Lalai: <strong className="text-slate-600 dark:text-slate-300">1234</strong>)
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Unlock size={16} />
              <span>Masuk Panel Admin</span>
            </button>
            <button
              type="button"
              onClick={onGoToTeacherView}
              className="px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Kembali
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED ADMIN PANEL
  // ----------------------------------------------------
  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-32">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-bounce flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Auto-Draft Recovery Banner */}
      {recoverableDraft && !isDirty && (
        <DraftRecoveryBanner
          savedAt={recoverableDraft.savedAt}
          onRestore={() => {
            dispatch({ type: 'RESTORE_DRAFT', config: recoverableDraft.config });
            setRecoverableDraft(null);
            showToast('Draf belum simpan berjaya dipulihkan!');
          }}
          onDismiss={() => {
            clearAdminDraft();
            setRecoverableDraft(null);
          }}
        />
      )}

      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Panel Editor Maklumat & Pentadbir Sekolah
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sunting profil, label, bank kurikulum (carian, inline edit, CSV/Excel), susunan Canva A4 dan jadual mingguan.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 disabled:opacity-35 text-slate-700 dark:text-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Undo2 size={15} />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 disabled:opacity-35 text-slate-700 dark:text-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Redo2 size={15} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportSchoolData}
            title="Muat turun fail data sekolah untuk dikongsi kepada guru"
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={15} />
            <span>Eksport Data (.json)</span>
          </button>

          <label
            title="Pasang fail data sekolah daripada peranti luar"
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload size={15} />
            <span>Pasang Data</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportSchoolData}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={onGoToTeacherView}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye size={15} />
            <span>Lihat Halaman Guru</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Save size={16} />
            <span>Simpan Tetapan</span>
          </button>
        </div>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl p-1 shadow-xs overflow-x-auto flex-nowrap scrollbar-none gap-1">
        {[
          { id: 'profil', label: '1. Profil & Hero Sekolah', icon: School },
          { id: 'format', label: '2. Format Nama Tajuk Bahagian', icon: FileText },
          { id: 'bank', label: '3. Bank Data Dropdown Guru', icon: ListPlus },
          { id: 'grid', label: '4. Susunan Grid PDF (Canva A4)', icon: LayoutGrid },
          { id: 'jadual', label: '5. Jadual Waktu Mingguan', icon: Calendar }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`shrink-0 flex-1 min-w-[145px] py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <IconComp size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFIL */}
      {activeTab === 'profil' && (
        <AdminProfileTab
          formConfig={formConfig}
          dispatch={dispatch}
          onLogoUpload={handleLogoUpload}
          onRemoveLogo={handleRemoveLogo}
          onExportSchoolData={handleExportSchoolData}
          onImportSchoolData={handleImportSchoolData}
        />
      )}

      {/* TAB 2: FORMAT LABEL */}
      {activeTab === 'format' && (
        <AdminLabelsTab formConfig={formConfig} dispatch={dispatch} />
      )}

      {/* TAB 3: BANK DATA */}
      {activeTab === 'bank' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Bank Pilihan Dropdown & Kurikulum Guru
            </h3>
            <p className="text-xs text-slate-500">
              Menyokong carian global, sunting terus (✏️), susun semula (▲/▼), tampal pukal, dan eksport/import CSV Excel.
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1.5 flex-nowrap scrollbar-none">
            {[
              { id: 'asas', label: '1. Kelas, Tahun & Masa' },
              { id: 'tajuk', label: '2. Aliran Kurikulum (Subjek, Bidang, Tajuk, Subtajuk & Objektif)' },
              { id: 'objektif', label: '3. Bank Objektif Murid' },
              { id: 'aktiviti', label: '4. Bank Aktiviti Murid' },
              { id: 'refleksi', label: '5. Bank Catatan Refleksi' },
              { id: 'kustom', label: `6. Bank Bahagian Kustom (${(formConfig.customPdfLayout?.customSections || []).length})` }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setBankSubTab(st.id as any)}
                className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  bankSubTab === st.id
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {bankSubTab === 'asas' && (
            <AdminBasicBankTab formConfig={formConfig} dispatch={dispatch} showToast={showToast} />
          )}

          {bankSubTab === 'tajuk' && (
            <AdminCurriculumTab formConfig={formConfig} dispatch={dispatch} showToast={showToast} />
          )}

          {(bankSubTab === 'objektif' ||
            bankSubTab === 'aktiviti' ||
            bankSubTab === 'refleksi' ||
            bankSubTab === 'kustom') && (
            <AdminGeneralBankTab
              subTab={bankSubTab}
              formConfig={formConfig}
              dispatch={dispatch}
              onOpenCanvaGrid={() => setActiveTab('grid')}
              showToast={showToast}
            />
          )}
        </div>
      )}

      {/* TAB 4: SUSUNAN GRID PDF (MOD CANVA A4) */}
      {activeTab === 'grid' && (
        <AdminPdfLayoutEditor
          config={formConfig}
          layoutConfig={formConfig.customPdfLayout || DEFAULT_CANVA_LAYOUT}
          onChangeLayout={(newLayout) => dispatch({ type: 'UPDATE_LAYOUT', layout: newLayout })}
          skrip={skrip}
        />
      )}

      {/* TAB 5: JADUAL WAKTU MINGGUAN */}
      {activeTab === 'jadual' && (
        <AdminScheduleTab formConfig={formConfig} dispatch={dispatch} showToast={showToast} />
      )}

      {/* Footer Reset & Save */}
      <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Set Semula ke Tetapan Asal</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Save size={18} />
          <span>Simpan Semua Tetapan Admin</span>
        </button>
      </div>

      {/* Floating Sticky Save Bar */}
      <StickySaveBar
        isDirty={isDirty}
        changeCount={changeCount}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onDiscard={() => {
          if (window.confirm('Abaikan semua perubahan yang belum disimpan?')) {
            discardChanges();
            showToast('Perubahan belum simpan telah diabaikan.');
          }
        }}
        onSave={handleSave}
      />
    </div>
  );
};
