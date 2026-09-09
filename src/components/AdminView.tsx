import React, { useState } from 'react';
import { AdminSchoolConfig, ScriptMode, BankTajukItem, BankSubtajukItem } from '../types/rph';
import { KURIKULUM_PENJAJARAN_2025 } from '../data/kurikulumPenjajaran2025';
import { AdminPdfLayoutEditor } from './AdminPdfLayoutEditor';
import { DEFAULT_CANVA_LAYOUT } from '../config/gridPresets';
import { exportSchoolConfigFile, importSchoolConfigFile } from '../utils/storage';
import {
  ShieldCheck,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Key,
  School,
  FileText,
  ListPlus,
  CheckCircle,
  Eye,
  ChevronRight,
  Sparkles,
  BookOpen,
  LayoutGrid,
  Tag,
  X,
  Upload,
  Download,
  FileJson,
  Image as ImageIcon,
  PenTool
} from 'lucide-react';

interface Props {
  config: AdminSchoolConfig;
  onSaveConfig: (cfg: AdminSchoolConfig) => void;
  onResetToDefault: () => void;
  onGoToTeacherView: () => void;
  skrip?: ScriptMode;
}

export const AdminView: React.FC<Props> = ({
  config,
  onSaveConfig,
  onResetToDefault,
  onGoToTeacherView,
  skrip
}) => {
  // PIN authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Editable config state
  const [formConfig, setFormConfig] = useState<AdminSchoolConfig>(config);
  const [activeTab, setActiveTab] = useState<'profil' | 'format' | 'bank' | 'grid'>('profil');
  const [bankSubTab, setBankSubTab] = useState<'asas' | 'tajuk' | 'objektif' | 'aktiviti' | 'refleksi' | 'kustom'>('asas');
  const [newCustomOptionInput, setNewCustomOptionInput] = useState<{ [secId: string]: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Curriculum hierarchy editing state
  const [currSubject, setCurrSubject] = useState<string>('Al-Quran');
  const [currBidang, setCurrBidang] = useState<string>('Tilawah');
  const [currTahun, setCurrTahun] = useState<string>('Semua');
  const [currTajukId, setCurrTajukId] = useState<string>('');

  // Inputs for curriculum hierarchy
  const [newSubjekInput, setNewSubjekInput] = useState('');
  const [newBidangInput, setNewBidangInput] = useState('');
  const [newTajukKodInput, setNewTajukKodInput] = useState('');
  const [newTajukTeksInput, setNewTajukTeksInput] = useState('');
  const [newTajukTahunInput, setNewTajukTahunInput] = useState('1');
  const [subtajukInputKod, setSubtajukInputKod] = useState('');
  const [subtajukInputTeks, setSubtajukInputTeks] = useState('');
  const [objektifInputTeks, setObjektifInputTeks] = useState('');
  const [aktivitiInputTeks, setAktivitiInputTeks] = useState('');

  // Temporary input states for other bank items
  const [newKelas, setNewKelas] = useState('');
  const [newMasa, setNewMasa] = useState('');
  const [newObjektif, setNewObjektif] = useState('');
  const [newAktiviti, setNewAktiviti] = useState('');
  const [newRefleksi, setNewRefleksi] = useState('');

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
    showToast('Semua tetapan admin & bank data berjaya disimpan!');
  };

  const handleReset = () => {
    if (window.confirm('Adakah anda pasti mahu menetapkan semula semua konfigurasi dan bank data ke tetapan asal?')) {
      onResetToDefault();
      setFormConfig(config);
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
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png');
          setFormConfig((prev) => ({
            ...prev,
            logoSekolah: dataUrl
          }));
          showToast('Gambar logo sekolah berjaya dimuat naik!');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormConfig((prev) => ({
      ...prev,
      logoSekolah: ''
    }));
    showToast('Gambar logo sekolah telah dipadam.');
  };

  const handleExportSchoolData = () => {
    exportSchoolConfigFile(formConfig);
    showToast('Fail data sekolah (.json) berjaya dimuat turun!');
  };

  const handleImportSchoolData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importSchoolConfigFile(file);
      setFormConfig(imported);
      onSaveConfig(imported);
      showToast(`Data sekolah "${imported.namaSekolah}" berjaya dipasang!`);
    } catch (err: any) {
      alert(err.message || 'Ralat membaca fail data sekolah.');
    } finally {
      e.target.value = '';
    }
  };

  const handleTambahPilihanBank = (sectionId: string, sectionTitle: string) => {
    const val = (newCustomOptionInput[sectionId] || '').trim();
    if (!val) return;
    const currentSections = formConfig.customPdfLayout?.customSections || [];
    const updatedSections = currentSections.map((s) => {
      if (s.id !== sectionId) return s;
      const currentOptions = s.pilihanBank || [];
      if (currentOptions.includes(val)) return s;
      return {
        ...s,
        pilihanBank: [...currentOptions, val]
      };
    });
    setFormConfig({
      ...formConfig,
      customPdfLayout: {
        ...(formConfig.customPdfLayout || DEFAULT_CANVA_LAYOUT),
        customSections: updatedSections
      }
    });
    setNewCustomOptionInput({
      ...newCustomOptionInput,
      [sectionId]: ''
    });
    showToast(`Pilihan "${val}" berjaya ditambah ke bank ${sectionTitle}!`);
  };

  const handlePadamPilihanBank = (sectionId: string, optionIndex: number) => {
    const currentSections = formConfig.customPdfLayout?.customSections || [];
    const updatedSections = currentSections.map((s) => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        pilihanBank: (s.pilihanBank || []).filter((_, i) => i !== optionIndex)
      };
    });
    setFormConfig({
      ...formConfig,
      customPdfLayout: {
        ...(formConfig.customPdfLayout || DEFAULT_CANVA_LAYOUT),
        customSections: updatedSections
      }
    });
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
          Sila masukkan PIN keselamatan untuk mengubah nama sekolah, format tajuk, dan bank dropdown guru.
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
            {pinError && (
              <p className="text-xs text-red-500 mt-1.5 font-medium">{pinError}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-2">
              (PIN Lalai: <strong className="text-slate-600 dark:text-slate-300">1234</strong>)
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-500/20"
            >
              <Unlock size={16} />
              <span>Masuk Panel Admin</span>
            </button>
            <button
              type="button"
              onClick={onGoToTeacherView}
              className="px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
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
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-bounce flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Panel Editor Maklumat & Pentadbir Sekolah
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ubah nama sekolah, sesuaikan tajuk label mengikut format sekolah anda, dan tetapkan bank pilihan dropdown untuk guru.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye size={15} />
            <span>Lihat Halaman Guru</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Save size={16} />
            <span>Simpan Tetapan</span>
          </button>
        </div>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl p-1 shadow-xs overflow-x-auto flex-nowrap scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('profil')}
          className={`shrink-0 flex-1 min-w-[140px] sm:min-w-[150px] py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'profil'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <School size={16} />
          <span>1. Profil & Hero Sekolah</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('format')}
          className={`shrink-0 flex-1 min-w-[150px] sm:min-w-[170px] py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'format'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FileText size={16} />
          <span>2. Format Nama Tajuk Bahagian</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bank')}
          className={`shrink-0 flex-1 min-w-[160px] sm:min-w-[170px] py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'bank'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ListPlus size={16} />
          <span>3. Bank Data Dropdown Guru</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('grid')}
          className={`shrink-0 flex-1 min-w-[170px] sm:min-w-[190px] py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'grid'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <LayoutGrid size={16} />
          <span>4. Susunan Grid PDF (Canva A4)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PROFIL & HERO SEKOLAH */}
      {/* ======================================================== */}
      {activeTab === 'profil' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Identiti Sekolah & Kepala Dokumen
            </h3>
            <p className="text-xs text-slate-500">
              Maklumat ini akan dipaparkan di bahagian atas halaman guru dan kepala dokumen PDF RPH.
            </p>
          </div>

          <div className="space-y-4">
            {/* Logo Sekolah Upload Section */}
            <div className="bg-slate-50 dark:bg-slate-700/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ImageIcon size={16} className="text-emerald-600" />
                  <span>Gambar Logo Sekolah:</span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Muat naik fail logo sekolah anda (PNG / JPG / WEBP). Logo ini akan dipaparkan pada Bar Navigasi, Header Hero Halaman Guru, dan Kepala Dokumen PDF RPH.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                {/* Logo Preview Avatar */}
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-xs">
                  {formConfig.logoSekolah ? (
                    <img
                      src={formConfig.logoSekolah}
                      alt="Logo Sekolah"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon size={28} className="mx-auto mb-1 opacity-50" />
                      <span className="text-[9px] font-bold block">Tiada Logo</span>
                    </div>
                  )}
                </div>

                {/* Upload & Remove Buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <label className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors">
                    <Upload size={14} />
                    <span>{formConfig.logoSekolah ? 'Tukar Gambar Logo' : 'Muat Naik Gambar Logo'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>

                  {formConfig.logoSekolah && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3.5 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>Buang Logo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Sekolah / Pusat KAFA:
              </label>
              <input
                type="text"
                value={formConfig.namaSekolah}
                onChange={(e) =>
                  setFormConfig({ ...formConfig, namaSekolah: e.target.value })
                }
                placeholder="Cth: KAFA INTEGRASI NURUL IMAN"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Slogan / Subtitle Kurikulum:
              </label>
              <input
                type="text"
                value={formConfig.subSlogan}
                onChange={(e) =>
                  setFormConfig({ ...formConfig, subSlogan: e.target.value })
                }
                placeholder="Cth: Tapak Standard Kurikulum KAFA (JAKIM / JAIN)"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Guru Besar / Penyelaras (Tandatangan):
                </label>
                <input
                  type="text"
                  value={formConfig.namaGuruBesar}
                  onChange={(e) =>
                    setFormConfig({ ...formConfig, namaGuruBesar: e.target.value })
                  }
                  placeholder="Cth: USTAZAH FATIMAH BINTI AHMAD"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Key size={14} className="text-emerald-600" />
                  PIN Keselamatan Admin:
                </label>
                <input
                  type="text"
                  value={formConfig.adminPin}
                  onChange={(e) =>
                    setFormConfig({ ...formConfig, adminPin: e.target.value })
                  }
                  placeholder="1234"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-400">
                  Gunakan PIN ini untuk masuk semula ke halaman Admin kelak.
                </span>
              </div>
            </div>

            {/* Offline Data Distribution & Installation Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-5 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileJson size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    Pengedaran & Pemasangan Data Sekolah (100% Offline / Tanpa Cloud)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Sistem ini tidak memerlukan pangkalan data awan (Superbase / Firebase). Anda boleh memuat turun fail tetapan sekolah (<strong>.json</strong>) dan menghantarnya ke dalam kumpulan WhatsApp / Telegram guru. Guru hanya perlu klik butang <strong>"Pasang Data Sekolah"</strong> di telefon mereka untuk memuatkan logo, subjek, dan format sekolah secara serta-merta!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportSchoolData}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Download size={15} />
                  <span>Muat Turun Fail Data Sekolah (.json)</span>
                </button>

                <label className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer">
                  <Upload size={15} className="text-emerald-600" />
                  <span>Pasang / Pulihkan Fail Data (.json)</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportSchoolData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: FORMAT NAMA TAJUK BAHAGIAN (IKUT FORMAT SEKOLAH) */}
      {/* ======================================================== */}
      {activeTab === 'format' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Sesuaikan Format Nama Tajuk Setiap Bahagian
            </h3>
            <p className="text-xs text-slate-500">
              Admin bebas mengubah teks label (seperti "Objektif Pembelajaran: Murid dapat", "Aktiviti: Murid diminta", dll.) mengikut format atau kehendak pentadbiran sekolah masing-masing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Objektif Label */}
            <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                Label Bahagian Objektif:
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Versi Rumi:</label>
                <input
                  type="text"
                  value={formConfig.labelCustom.objektif.rumi}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      labelCustom: {
                        ...formConfig.labelCustom,
                        objektif: { ...formConfig.labelCustom.objektif, rumi: e.target.value }
                      }
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Versi Jawi:</label>
                <input
                  type="text"
                  dir="rtl"
                  value={formConfig.labelCustom.objektif.jawi}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      labelCustom: {
                        ...formConfig.labelCustom,
                        objektif: { ...formConfig.labelCustom.objektif, jawi: e.target.value }
                      }
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm font-jawi rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                />
              </div>
            </div>

            {/* Aktiviti Label */}
            <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                Label Bahagian Aktiviti:
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Versi Rumi:</label>
                <input
                  type="text"
                  value={formConfig.labelCustom.aktiviti.rumi}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      labelCustom: {
                        ...formConfig.labelCustom,
                        aktiviti: { ...formConfig.labelCustom.aktiviti, rumi: e.target.value }
                      }
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Versi Jawi:</label>
                <input
                  type="text"
                  dir="rtl"
                  value={formConfig.labelCustom.aktiviti.jawi}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      labelCustom: {
                        ...formConfig.labelCustom,
                        aktiviti: { ...formConfig.labelCustom.aktiviti, jawi: e.target.value }
                      }
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm font-jawi rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                />
              </div>
            </div>

            {/* Refleksi Label */}
            <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                Label Bahagian Refleksi:
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Versi Rumi:</label>
                <input
                  type="text"
                  value={formConfig.labelCustom.refleksi.rumi}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      labelCustom: {
                        ...formConfig.labelCustom,
                        refleksi: { ...formConfig.labelCustom.refleksi, rumi: e.target.value }
                      }
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Versi Jawi:</label>
                <input
                  type="text"
                  dir="rtl"
                  value={formConfig.labelCustom.refleksi.jawi}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      labelCustom: {
                        ...formConfig.labelCustom,
                        refleksi: { ...formConfig.labelCustom.refleksi, jawi: e.target.value }
                      }
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm font-jawi rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                />
              </div>
            </div>

            {/* Catatan / Tindakan Susulan Label */}
            <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                Label Tindakan Susulan / Catatan:
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Versi Rumi:</label>
                <input
                  type="text"
                  value={formConfig.labelCustom.catatan.rumi}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      labelCustom: {
                        ...formConfig.labelCustom,
                        catatan: { ...formConfig.labelCustom.catatan, rumi: e.target.value }
                      }
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Versi Jawi:</label>
                <input
                  type="text"
                  dir="rtl"
                  value={formConfig.labelCustom.catatan.jawi}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      labelCustom: {
                        ...formConfig.labelCustom,
                        catatan: { ...formConfig.labelCustom.catatan, jawi: e.target.value }
                      }
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm font-jawi rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                />
              </div>
            </div>

            {/* Kemahiran Label */}
            <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                Label Bahagian Kemahiran:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Rumi:</label>
                  <input
                    type="text"
                    value={formConfig.labelCustom.kemahiran.rumi}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        labelCustom: {
                          ...formConfig.labelCustom,
                          kemahiran: { ...formConfig.labelCustom.kemahiran, rumi: e.target.value }
                        }
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Jawi:</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formConfig.labelCustom.kemahiran.jawi}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        labelCustom: {
                          ...formConfig.labelCustom,
                          kemahiran: { ...formConfig.labelCustom.kemahiran, jawi: e.target.value }
                        }
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-sm font-jawi rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Tajuk & Subtajuk Label */}
            <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                Label Tajuk & Subtajuk:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Tajuk (Rumi):</label>
                  <input
                    type="text"
                    value={formConfig.labelCustom.tajuk.rumi}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        labelCustom: {
                          ...formConfig.labelCustom,
                          tajuk: { ...formConfig.labelCustom.tajuk, rumi: e.target.value }
                        }
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Tajuk (Jawi):</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formConfig.labelCustom.tajuk.jawi}
                    onChange={(e) =>
                      setFormConfig({
                        ...formConfig,
                        labelCustom: {
                          ...formConfig.labelCustom,
                          tajuk: { ...formConfig.labelCustom.tajuk, jawi: e.target.value }
                        }
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-sm font-jawi rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Tandatangan Label */}
            <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 md:col-span-2">
              <div className="border-b border-slate-200 dark:border-slate-600 pb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <PenTool size={14} className="text-emerald-600" />
                  Format Label Ruangan Tandatangan & Pengesahan:
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Sesuaikan teks label untuk ruangan tandatangan guru dan pengesahan guru besar / penyelaras mengikut format rasmi sekolah anda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tandatangan Guru */}
                <div className="space-y-2 bg-white dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-600">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Ruangan Tandatangan Guru:
                  </span>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Versi Rumi:</label>
                    <input
                      type="text"
                      value={formConfig.labelCustom.tandatanganGuru?.rumi || 'Tandatangan Guru'}
                      onChange={(e) =>
                        setFormConfig({
                          ...formConfig,
                          labelCustom: {
                            ...formConfig.labelCustom,
                            tandatanganGuru: {
                              jawi: formConfig.labelCustom.tandatanganGuru?.jawi || 'تانداتاڠن ڬورو',
                              rumi: e.target.value
                            }
                          }
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Versi Jawi:</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={formConfig.labelCustom.tandatanganGuru?.jawi || 'تانداتاڠن ڬورو'}
                      onChange={(e) =>
                        setFormConfig({
                          ...formConfig,
                          labelCustom: {
                            ...formConfig.labelCustom,
                            tandatanganGuru: {
                              rumi: formConfig.labelCustom.tandatanganGuru?.rumi || 'Tandatangan Guru',
                              jawi: e.target.value
                            }
                          }
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm font-jawi rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                    />
                  </div>
                </div>

                {/* Tandatangan Guru Besar / Penyelaras */}
                <div className="space-y-2 bg-white dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-600">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Ruangan Tandatangan Guru Besar / Penyelaras:
                  </span>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Versi Rumi:</label>
                    <input
                      type="text"
                      value={formConfig.labelCustom.tandatanganGuruBesar?.rumi || 'Tandatangan Guru Besar / Penyelaras'}
                      onChange={(e) =>
                        setFormConfig({
                          ...formConfig,
                          labelCustom: {
                            ...formConfig.labelCustom,
                            tandatanganGuruBesar: {
                              jawi: formConfig.labelCustom.tandatanganGuruBesar?.jawi || 'تانداتاڠن ڬورو بسر / ڤڽلارس',
                              rumi: e.target.value
                            }
                          }
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Versi Jawi:</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={formConfig.labelCustom.tandatanganGuruBesar?.jawi || 'تانداتاڠن ڬورو بسر / ڤڽلارس'}
                      onChange={(e) =>
                        setFormConfig({
                          ...formConfig,
                          labelCustom: {
                            ...formConfig.labelCustom,
                            tandatanganGuruBesar: {
                              rumi: formConfig.labelCustom.tandatanganGuruBesar?.rumi || 'Tandatangan Guru Besar / Penyelaras',
                              jawi: e.target.value
                            }
                          }
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm font-jawi rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: BANK PILIHAN DROPDOWN GURU */}
      {/* ======================================================== */}
      {activeTab === 'bank' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Bank Pilihan Dropdown Guru
            </h3>
            <p className="text-xs text-slate-500">
              Segala item yang anda masukkan di sini akan terus muncul dalam pilihan dropdown di Halaman Guru. Guru hanya tinggal klik dan pilih!
            </p>
          </div>

          {/* Sub-nav for bank categories */}
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
                className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  bankSubTab === st.id
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* BANK SUBTAB 1: ASAS (KELAS, TAHUN, MASA) */}
          {bankSubTab === 'asas' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* Kelas */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-white block">
                  Senarai Nama Kelas ({formConfig.bank.kelas.length}):
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tambah kelas cth: Umar 2"
                    value={newKelas}
                    onChange={(e) => setNewKelas(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newKelas.trim()) return;
                      setFormConfig({
                        ...formConfig,
                        bank: {
                          ...formConfig.bank,
                          kelas: [...formConfig.bank.kelas, newKelas.trim()]
                        }
                      });
                      setNewKelas('');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {formConfig.bank.kelas.map((k) => (
                    <div
                      key={k}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <span>{k}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormConfig({
                            ...formConfig,
                            bank: {
                              ...formConfig.bank,
                              kelas: formConfig.bank.kelas.filter((x) => x !== k)
                            }
                          })
                        }
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Masa */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-white block">
                  Senarai Julat Masa ({formConfig.bank.masa.length}):
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Cth: 2.30 - 3.30"
                    value={newMasa}
                    onChange={(e) => setNewMasa(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMasa.trim()) return;
                      setFormConfig({
                        ...formConfig,
                        bank: {
                          ...formConfig.bank,
                          masa: [...formConfig.bank.masa, newMasa.trim()]
                        }
                      });
                      setNewMasa('');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {formConfig.bank.masa.map((m) => (
                    <div
                      key={m}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <span>{m}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormConfig({
                            ...formConfig,
                            bank: {
                              ...formConfig.bank,
                              masa: formConfig.bank.masa.filter((x) => x !== m)
                            }
                          })
                        }
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
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
                <p className="text-[11px] text-slate-400">
                  Tahun standard KAFA 1 hingga 6.
                </p>
              </div>

            </div>
          )}

          {/* BANK SUBTAB 2: ALIRAN KURIKULUM BERPERINGKAT */}
          {bankSubTab === 'tajuk' && (() => {
            const kurikulumList = formConfig.bank.kurikulum || [];

            // Filter tajuks under current subject, (if Al-Quran) current bidang, and (if selected) current tahun
            const filteredTajukList = kurikulumList.filter((t) => {
              if (t.mataPelajaran !== currSubject) return false;
              if (currSubject === 'Al-Quran') {
                if (t.bidang !== currBidang) return false;
              }
              if (currTahun !== 'Semua' && t.tahun && t.tahun !== currTahun) {
                return false;
              }
              return true;
            });

            // The selected active Tajuk
            const activeTajuk =
              filteredTajukList.find((t) => t.id === currTajukId) ||
              filteredTajukList[0] ||
              null;

            // Sync helper to keep legacy flat arrays updated
            const syncLegacyArrays = (newKurikulum: BankTajukItem[]) => {
              const newTajukList = newKurikulum.map((k) => ({
                kod: k.kod,
                teks: k.teks,
                mataPelajaran: k.mataPelajaran
              }));
              const newSubtajukList = newKurikulum.flatMap((k) =>
                k.subtajukList.map((st) => ({
                  kod: st.kod,
                  teks: st.teks,
                  tajukKod: k.kod
                }))
              );
              return { tajukList: newTajukList, subtajukList: newSubtajukList };
            };

            // Restore complete official curriculum (317 items)
            const handleRestoreOfficialCurriculum = () => {
              if (
                window.confirm(
                  'Adakah anda pasti mahu memuat semula keseluruhan Kurikulum Rasmi JAWI 2025 (317 tajuk mengikut Lampiran A Penjajaran)? Perubahan manual pada senarai tajuk akan digantikan dengan versi piawai rasmi.'
                )
              ) {
                const { tajukList, subtajukList } = syncLegacyArrays(KURIKULUM_PENJAJARAN_2025);
                setFormConfig({
                  ...formConfig,
                  bank: {
                    ...formConfig.bank,
                    kurikulum: KURIKULUM_PENJAJARAN_2025,
                    mataPelajaran: ['Al-Quran', 'Akidah', 'Ibadah', 'Sirah', 'Adab', 'Jawi', 'Bahasa Arab'],
                    bidangAlQuran: ['Tilawah', 'Hafazan', 'Kefahaman', 'Tajwid'],
                    tajukList,
                    subtajukList
                  }
                });
                showToast('317 Kurikulum Rasmi JAWI 2025 berjaya dimuatkan ke Bank Data!');
              }
            };

            // 1. Add Subject
            const handleAddSubject = () => {
              if (!newSubjekInput.trim()) return;
              const subName = newSubjekInput.trim();
              if (formConfig.bank.mataPelajaran.includes(subName)) {
                showToast(`Mata pelajaran "${subName}" sudah ada.`);
                return;
              }
              setFormConfig({
                ...formConfig,
                bank: {
                  ...formConfig.bank,
                  mataPelajaran: [...formConfig.bank.mataPelajaran, subName]
                }
              });
              setNewSubjekInput('');
              setCurrSubject(subName);
              showToast(`Subjek "${subName}" berjaya ditambah!`);
            };

            // 1b. Delete Subject
            const handleDeleteSubject = (subjekToDelete: string) => {
              if (formConfig.bank.mataPelajaran.length <= 1) {
                alert('Mesti ada sekurang-kurangnya 1 mata pelajaran.');
                return;
              }
              const relatedTajukCount = kurikulumList.filter((t) => t.mataPelajaran === subjekToDelete).length;
              const msg = relatedTajukCount > 0
                ? `Adakah anda pasti mahu memadam subjek "${subjekToDelete}"?\n\nPerhatian: Sebanyak ${relatedTajukCount} tajuk di bawah subjek ini juga akan dikeluarkan daripada bank kurikulum.`
                : `Adakah anda pasti mahu memadam subjek "${subjekToDelete}"?`;
              
              if (!window.confirm(msg)) return;

              const updatedMataPelajaran = formConfig.bank.mataPelajaran.filter((s) => s !== subjekToDelete);
              const updatedKurikulum = kurikulumList.filter((t) => t.mataPelajaran !== subjekToDelete);
              const { tajukList, subtajukList } = syncLegacyArrays(updatedKurikulum);

              setFormConfig({
                ...formConfig,
                bank: {
                  ...formConfig.bank,
                  mataPelajaran: updatedMataPelajaran,
                  kurikulum: updatedKurikulum,
                  tajukList,
                  subtajukList
                }
              });

              if (currSubject === subjekToDelete) {
                const nextSubject = updatedMataPelajaran[0] || '';
                setCurrSubject(nextSubject);
                const firstTajuk = updatedKurikulum.find((t) => t.mataPelajaran === nextSubject);
                setCurrTajukId(firstTajuk ? firstTajuk.id : '');
              }
              showToast(`Subjek "${subjekToDelete}" berjaya dipadam.`);
            };

            // 2. Add Bidang (Al-Quran)
            const handleAddBidang = () => {
              if (!newBidangInput.trim()) return;
              const bName = newBidangInput.trim();
              if (formConfig.bank.bidangAlQuran.includes(bName)) {
                showToast(`Bidang "${bName}" sudah ada.`);
                return;
              }
              setFormConfig({
                ...formConfig,
                bank: {
                  ...formConfig.bank,
                  bidangAlQuran: [...formConfig.bank.bidangAlQuran, bName]
                }
              });
              setNewBidangInput('');
              setCurrBidang(bName);
              showToast(`Bidang "${bName}" berjaya ditambah!`);
            };

            // 2b. Delete Bidang (Al-Quran)
            const handleDeleteBidang = (bidangToDelete: string) => {
              if (formConfig.bank.bidangAlQuran.length <= 1) {
                alert('Mesti ada sekurang-kurangnya 1 bidang untuk Al-Quran.');
                return;
              }
              const relatedTajukCount = kurikulumList.filter(
                (t) => t.mataPelajaran === 'Al-Quran' && t.bidang === bidangToDelete
              ).length;
              const msg = relatedTajukCount > 0
                ? `Adakah anda pasti mahu memadam bidang "${bidangToDelete}"?\n\nPerhatian: Sebanyak ${relatedTajukCount} tajuk di bawah bidang ini juga akan dikeluarkan.`
                : `Adakah anda pasti mahu memadam bidang "${bidangToDelete}"?`;
              
              if (!window.confirm(msg)) return;

              const updatedBidang = formConfig.bank.bidangAlQuran.filter((b) => b !== bidangToDelete);
              const updatedKurikulum = kurikulumList.filter(
                (t) => !(t.mataPelajaran === 'Al-Quran' && t.bidang === bidangToDelete)
              );
              const { tajukList, subtajukList } = syncLegacyArrays(updatedKurikulum);

              setFormConfig({
                ...formConfig,
                bank: {
                  ...formConfig.bank,
                  bidangAlQuran: updatedBidang,
                  kurikulum: updatedKurikulum,
                  tajukList,
                  subtajukList
                }
              });

              if (currBidang === bidangToDelete) {
                const nextBidang = updatedBidang[0] || '';
                setCurrBidang(nextBidang);
                const firstTajuk = updatedKurikulum.find(
                  (t) => t.mataPelajaran === 'Al-Quran' && t.bidang === nextBidang
                );
                setCurrTajukId(firstTajuk ? firstTajuk.id : '');
              }
              showToast(`Bidang "${bidangToDelete}" berjaya dipadam.`);
            };

            // 3. Add Tajuk
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
              const updated = [...kurikulumList, newItem];
              const { tajukList, subtajukList } = syncLegacyArrays(updated);
              setFormConfig({
                ...formConfig,
                bank: {
                  ...formConfig.bank,
                  kurikulum: updated,
                  tajukList,
                  subtajukList
                }
              });
              setNewTajukKodInput('');
              setNewTajukTeksInput('');
              setCurrTajukId(newId);
              showToast(`Tajuk "${newItem.teks}" berjaya ditambah ke ${currSubject}!`);
            };

            // 4. Delete Tajuk
            const handleDeleteTajuk = (idToDelete: string) => {
              const updated = kurikulumList.filter((t) => t.id !== idToDelete);
              const { tajukList, subtajukList } = syncLegacyArrays(updated);
              setFormConfig({
                ...formConfig,
                bank: {
                  ...formConfig.bank,
                  kurikulum: updated,
                  tajukList,
                  subtajukList
                }
              });
              if (currTajukId === idToDelete) {
                setCurrTajukId('');
              }
              showToast('Tajuk dipadam daripada bank.');
            };

            // 5. Add Subtajuk to Active Tajuk
            const handleAddSubtajukToActiveTajuk = () => {
              if (!activeTajuk || !subtajukInputTeks.trim()) return;
              const newSub: BankSubtajukItem = {
                kod: subtajukInputKod.trim(),
                teks: subtajukInputTeks.trim()
              };
              const updated = kurikulumList.map((t) => {
                if (t.id === activeTajuk.id) {
                  return {
                    ...t,
                    subtajukList: [...t.subtajukList, newSub]
                  };
                }
                return t;
              });
              const { tajukList, subtajukList } = syncLegacyArrays(updated);
              setFormConfig({
                ...formConfig,
                bank: {
                  ...formConfig.bank,
                  kurikulum: updated,
                  tajukList,
                  subtajukList
                }
              });
              setSubtajukInputKod('');
              setSubtajukInputTeks('');
              showToast(`Subtajuk ditambah untuk ${activeTajuk.teks}!`);
            };

            // 6. Delete Subtajuk from Active Tajuk
            const handleDeleteSubtajukFromActiveTajuk = (subIdx: number) => {
              if (!activeTajuk) return;
              const updated = kurikulumList.map((t) => {
                if (t.id === activeTajuk.id) {
                  return {
                    ...t,
                    subtajukList: t.subtajukList.filter((_, i) => i !== subIdx)
                  };
                }
                return t;
              });
              const { tajukList, subtajukList } = syncLegacyArrays(updated);
              setFormConfig({
                ...formConfig,
                bank: {
                  ...formConfig.bank,
                  kurikulum: updated,
                  tajukList,
                  subtajukList
                }
              });
            };

            // 7. Add Objektif to Active Tajuk
            const handleAddObjektifToActiveTajuk = () => {
              if (!activeTajuk || !objektifInputTeks.trim()) return;
              const updated = kurikulumList.map((t) => {
                if (t.id === activeTajuk.id) {
                  return {
                    ...t,
                    objektifList: [...t.objektifList, objektifInputTeks.trim()]
                  };
                }
                return t;
              });
              setFormConfig({
                ...formConfig,
                bank: { ...formConfig.bank, kurikulum: updated }
              });
              setObjektifInputTeks('');
              showToast(`Objektif ditambah untuk ${activeTajuk.teks}!`);
            };

            // 8. Delete Objektif from Active Tajuk
            const handleDeleteObjektifFromActiveTajuk = (objIdx: number) => {
              if (!activeTajuk) return;
              const updated = kurikulumList.map((t) => {
                if (t.id === activeTajuk.id) {
                  return {
                    ...t,
                    objektifList: t.objektifList.filter((_, i) => i !== objIdx)
                  };
                }
                return t;
              });
              setFormConfig({
                ...formConfig,
                bank: { ...formConfig.bank, kurikulum: updated }
              });
            };

            // 9. Add Aktiviti to Active Tajuk
            const handleAddAktivitiToActiveTajuk = () => {
              if (!activeTajuk || !aktivitiInputTeks.trim()) return;
              const updated = kurikulumList.map((t) => {
                if (t.id === activeTajuk.id) {
                  return {
                    ...t,
                    aktivitiList: [...t.aktivitiList, aktivitiInputTeks.trim()]
                  };
                }
                return t;
              });
              setFormConfig({
                ...formConfig,
                bank: { ...formConfig.bank, kurikulum: updated }
              });
              setAktivitiInputTeks('');
              showToast(`Aktiviti ditambah untuk ${activeTajuk.teks}!`);
            };

            // 10. Delete Aktiviti from Active Tajuk
            const handleDeleteAktivitiFromActiveTajuk = (aktIdx: number) => {
              if (!activeTajuk) return;
              const updated = kurikulumList.map((t) => {
                if (t.id === activeTajuk.id) {
                  return {
                    ...t,
                    aktivitiList: t.aktivitiList.filter((_, i) => i !== aktIdx)
                  };
                }
                return t;
              });
              setFormConfig({
                ...formConfig,
                bank: { ...formConfig.bank, kurikulum: updated }
              });
            };

            return (
              <div className="space-y-6 pt-2">
                
                {/* Info Box */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-start gap-3">
                    <Sparkles size={18} className="shrink-0 mt-0.5 text-emerald-600" />
                    <div>
                      <strong className="block font-bold mb-0.5">Sistem Aliran Kurikulum Penjajaran 2025:</strong>
                      Terdapat <span className="font-extrabold text-emerald-700 dark:text-emerald-300">{kurikulumList.length} tajuk</span> rasmi merangkumi 7 subjek KAFA (Tahun 1 - 6). Apabila guru memilih Subjek, Bidang & Tahun di Halaman Guru, sistem secara automatik menapis tajuk, subtajuk, dan objektif yang berkaitan sahaja.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRestoreOfficialCurriculum}
                    className="self-start sm:self-center px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Muat Semula Kurikulum Rasmi (317)</span>
                  </button>
                </div>

                {/* LANGKAH 1: PILIH MATA PELAJARAN */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                      Pilih Mata Pelajaran:
                    </span>
                    <div className="flex gap-1.5 max-w-xs w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Tambah subjek..."
                        value={newSubjekInput}
                        onChange={(e) => setNewSubjekInput(e.target.value)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleAddSubject}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0"
                      >
                        + Subjek
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {formConfig.bank.mataPelajaran.map((mp) => {
                      const isActive = currSubject === mp;
                      const tajukCount = kurikulumList.filter((t) => t.mataPelajaran === mp).length;
                      return (
                        <div
                          key={mp}
                          className={`inline-flex items-center rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setCurrSubject(mp);
                              const firstTajuk = kurikulumList.find((t) => t.mataPelajaran === mp);
                              setCurrTajukId(firstTajuk ? firstTajuk.id : '');
                            }}
                            className="px-3 py-1.5 flex items-center gap-2 cursor-pointer"
                          >
                            <span>{mp}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                              }`}
                            >
                              {tajukCount} tajuk
                            </span>
                          </button>
                          <button
                            type="button"
                            title={`Padam subjek ${mp}`}
                            aria-label={`Padam subjek ${mp}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSubject(mp);
                            }}
                            className={`pr-2.5 pl-1 py-1.5 transition-colors cursor-pointer rounded-r-xl ${
                              isActive
                                ? 'text-emerald-200 hover:text-white hover:bg-emerald-700/60'
                                : 'text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* LANGKAH 2: PILIH BIDANG (HANYA MUNCUL JIKA SUBJEK AL-QURAN) */}
                {currSubject === 'Al-Quran' && (
                  <div className="space-y-3 bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                        Pilih Bidang Al-Quran (Khusus Al-Quran):
                      </span>
                      <div className="flex gap-1.5 max-w-xs w-full sm:w-auto">
                        <input
                          type="text"
                          placeholder="Tambah bidang..."
                          value={newBidangInput}
                          onChange={(e) => setNewBidangInput(e.target.value)}
                          className="px-2.5 py-1 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white text-slate-900 dark:bg-slate-700 dark:text-white flex-1"
                        />
                        <button
                          type="button"
                          onClick={handleAddBidang}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0"
                        >
                          + Bidang
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {formConfig.bank.bidangAlQuran.map((b) => {
                        const isActive = currBidang === b;
                        const tajukCount = kurikulumList.filter(
                          (t) => t.mataPelajaran === 'Al-Quran' && t.bidang === b
                        ).length;
                        return (
                          <div
                            key={b}
                            className={`inline-flex items-center rounded-xl text-xs font-bold transition-all ${
                              isActive
                                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-400'
                                : 'bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:border-amber-400'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setCurrBidang(b);
                                const firstTajuk = kurikulumList.find(
                                  (t) => t.mataPelajaran === 'Al-Quran' && t.bidang === b
                                );
                                setCurrTajukId(firstTajuk ? firstTajuk.id : '');
                              }}
                              className="px-3 py-1.5 flex items-center gap-2 cursor-pointer"
                            >
                              <span>{b}</span>
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                                }`}
                              >
                                {tajukCount} tajuk
                              </span>
                            </button>
                            <button
                              type="button"
                              title={`Padam bidang ${b}`}
                              aria-label={`Padam bidang ${b}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBidang(b);
                              }}
                              className={`pr-2.5 pl-1 py-1.5 transition-colors cursor-pointer rounded-r-xl ${
                                isActive
                                  ? 'text-amber-200 hover:text-white hover:bg-amber-700/60'
                                  : 'text-slate-400 hover:text-red-500 hover:bg-amber-50 dark:hover:bg-slate-700'
                              }`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAPIS MENGIKUT TAHUN */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-800 dark:text-white mr-1 flex items-center gap-1">
                    <span>Tapis Mengikut Tahun:</span>
                  </span>
                  {['Semua', '1', '2', '3', '4', '5', '6'].map((thn) => {
                    const isActive = currTahun === thn;
                    const count = kurikulumList.filter((t) => {
                      if (t.mataPelajaran !== currSubject) return false;
                      if (currSubject === 'Al-Quran' && t.bidang !== currBidang) return false;
                      if (thn !== 'Semua' && t.tahun !== thn) return false;
                      return true;
                    }).length;
                    return (
                      <button
                        key={thn}
                        type="button"
                        onClick={() => {
                          setCurrTahun(thn);
                          const firstMatch = kurikulumList.find((t) => {
                            if (t.mataPelajaran !== currSubject) return false;
                            if (currSubject === 'Al-Quran' && t.bidang !== currBidang) return false;
                            if (thn !== 'Semua' && t.tahun !== thn) return false;
                            return true;
                          });
                          setCurrTajukId(firstMatch ? firstMatch.id : '');
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                        }`}
                      >
                        {thn === 'Semua' ? 'Semua Tahun' : `Tahun ${thn}`} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* LANGKAH 3: SENARAI TAJUK PELAJARAN */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                        {currSubject === 'Al-Quran' ? '3' : '2'}
                      </span>
                      Senarai Tajuk ({currSubject}
                      {currSubject === 'Al-Quran' ? ` - ${currBidang}` : ''}
                      {currTahun !== 'Semua' ? ` - Tahun ${currTahun}` : ''}) :
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Klik pada mana-mana tajuk untuk menetapkan subtajuk & objektifnya di bawah.
                    </span>
                  </div>

                  {/* Form Tambah Tajuk Baharu */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 bg-slate-50 dark:bg-slate-700/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <select
                      value={newTajukTahunInput}
                      onChange={(e) => setNewTajukTahunInput(e.target.value)}
                      className="px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                    >
                      {['1', '2', '3', '4', '5', '6'].map((thn) => (
                        <option key={thn} value={thn}>
                          Tahun {thn}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Kod Tajuk (cth: 2.1)"
                      value={newTajukKodInput}
                      onChange={(e) => setNewTajukKodInput(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Nama Tajuk (cth: قاعده ڤنوليسن)"
                      value={newTajukTeksInput}
                      onChange={(e) => setNewTajukTeksInput(e.target.value)}
                      className="sm:col-span-2 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddTajuk}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Plus size={14} />
                      <span>Tambah Tajuk</span>
                    </button>
                  </div>

                  {/* Kad-Kad Tajuk */}
                  {filteredTajukList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {filteredTajukList.map((t) => {
                        const isSelected = activeTajuk?.id === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => setCurrTajukId(t.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 dark:border-emerald-600 ring-2 ring-emerald-400 shadow-sm'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                                {t.tahun && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                                    T{t.tahun}
                                  </span>
                                )}
                                {t.kod && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-bold shrink-0">
                                    {t.kod}
                                  </span>
                                )}
                                <span className="truncate">{t.teks}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                <span>{t.subtajukList.length} subtajuk</span>
                                <span>•</span>
                                <span>{t.objektifList.length} objektif</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                title="Padam Tajuk"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Adakah anda pasti mahu memadam tajuk "${t.teks}"?`)) {
                                    handleDeleteTajuk(t.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                              <ChevronRight
                                size={15}
                                className={isSelected ? 'text-emerald-600' : 'text-slate-300'}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-400">
                      Belum ada tajuk didaftarkan untuk subjek {currSubject}
                      {currSubject === 'Al-Quran' ? ` (Bidang: ${currBidang})` : ''}. Sila tambah tajuk di atas!
                    </div>
                  )}
                </div>

                {/* LANGKAH 4: PANEL KANDUNGAN ALIRAN KHUSUS BAGI TAJUK TERPILIH */}
                {activeTajuk && (
                  <div className="mt-4 p-5 rounded-3xl bg-slate-50/75 dark:bg-slate-700/40 border-2 border-emerald-500/40 dark:border-emerald-600/40 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-600 pb-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400 block">
                          Aliran Kandungan Bersambung
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <BookOpen size={16} className="text-emerald-600" />
                          <span>
                            Tajuk: {activeTajuk.kod ? `${activeTajuk.kod} ` : ''}{activeTajuk.teks}
                          </span>
                        </h4>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Hanya maklumat di bawah ini sahaja yang akan keluar dalam dropdown guru untuk tajuk ini!
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      
                      {/* KOLUM 1: SUBTAJUK */}
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Subtajuk ({activeTajuk.subtajukList.length}):
                          </span>
                          <span className="text-[10px] text-slate-400">Keluar dalam dropdown Subtajuk</span>
                        </div>

                        {/* Tambah Subtajuk Form */}
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="Kod Subtajuk (cth: 2.1.1)"
                            value={subtajukInputKod}
                            onChange={(e) => setSubtajukInputKod(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                          />
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Nama Subtajuk..."
                              value={subtajukInputTeks}
                              onChange={(e) => setSubtajukInputTeks(e.target.value)}
                              className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                            />
                            <button
                              type="button"
                              onClick={handleAddSubtajukToActiveTajuk}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Senarai Subtajuk */}
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                          {activeTajuk.subtajukList.map((st, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-1.5 font-medium text-slate-800 dark:text-slate-200"
                            >
                              <span className="truncate">
                                {st.kod ? `${st.kod} ` : ''}{st.teks}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteSubtajukFromActiveTajuk(sIdx)}
                                className="text-slate-400 hover:text-red-500 shrink-0"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                          {activeTajuk.subtajukList.length === 0 && (
                            <p className="text-[11px] text-slate-400 italic text-center py-2">
                              Tiada subtajuk didaftarkan.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* KOLUM 2: OBJEKTIF PEMBELAJARAN (MURID DAPAT) */}
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Objektif: Murid dapat ({activeTajuk.objektifList.length}):
                          </span>
                          <span className="text-[10px] text-slate-400">Senarai semak guru</span>
                        </div>

                        {/* Tambah Objektif Form */}
                        <div className="flex gap-1.5">
                          <textarea
                            rows={2}
                            placeholder="Taip objektif murid dapat bagi tajuk ini..."
                            value={objektifInputTeks}
                            onChange={(e) => setObjektifInputTeks(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                          />
                          <button
                            type="button"
                            onClick={handleAddObjektifToActiveTajuk}
                            className="px-3 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shrink-0 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>

                        {/* Senarai Objektif */}
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                          {activeTajuk.objektifList.map((obj, oIdx) => (
                            <div
                              key={oIdx}
                              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-xs flex items-start justify-between gap-2 font-medium text-slate-800 dark:text-slate-200"
                            >
                              <span className="leading-relaxed">{obj}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteObjektifFromActiveTajuk(oIdx)}
                                className="text-slate-400 hover:text-red-500 shrink-0 mt-0.5"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                          {activeTajuk.objektifList.length === 0 && (
                            <p className="text-[11px] text-slate-400 italic text-center py-2">
                              Tiada objektif khusus. (Guru boleh guna objektif umum bank).
                            </p>
                          )}
                        </div>
                      </div>

                      {/* KOLUM 3: AKTIVITI MURID (MURID DIMINTA) */}
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Aktiviti: Murid diminta ({activeTajuk.aktivitiList.length}):
                          </span>
                          <span className="text-[10px] text-slate-400">Senarai semak guru</span>
                        </div>

                        {/* Tambah Aktiviti Form */}
                        <div className="flex gap-1.5">
                          <textarea
                            rows={2}
                            placeholder="Taip aktiviti murid diminta bagi tajuk ini..."
                            value={aktivitiInputTeks}
                            onChange={(e) => setAktivitiInputTeks(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                          />
                          <button
                            type="button"
                            onClick={handleAddAktivitiToActiveTajuk}
                            className="px-3 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shrink-0 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>

                        {/* Senarai Aktiviti */}
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                          {activeTajuk.aktivitiList.map((akt, aIdx) => (
                            <div
                              key={aIdx}
                              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-xs flex items-start justify-between gap-2 font-medium text-slate-800 dark:text-slate-200"
                            >
                              <span className="leading-relaxed">{akt}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteAktivitiFromActiveTajuk(aIdx)}
                                className="text-slate-400 hover:text-red-500 shrink-0 mt-0.5"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                          {activeTajuk.aktivitiList.length === 0 && (
                            <p className="text-[11px] text-slate-400 italic text-center py-2">
                              Tiada aktiviti khusus. (Guru boleh guna aktiviti umum bank).
                            </p>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            );
          })()}

          {/* BANK SUBTAB 3: OBJEKTIF PEMBELAJARAN */}
          {bankSubTab === 'objektif' && (
            <div className="space-y-4 pt-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                Bank Objektif Pembelajaran Guru ({(formConfig.bank.objektifList || []).length} item):
              </span>
              <p className="text-xs text-slate-500">
                Objektif-objektif ini akan menjadi pilihan yang sedia di-tick oleh guru di Halaman Guru.
              </p>

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  placeholder="Taip objektif baharu (Cth: Menyatakan pengertian bersyukur dengan jelas...)"
                  value={newObjektif}
                  onChange={(e) => setNewObjektif(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newObjektif.trim()) return;
                    setFormConfig({
                      ...formConfig,
                      bank: {
                        ...formConfig.bank,
                        objektifList: [...(formConfig.bank.objektifList || []), newObjektif.trim()]
                      }
                    });
                    setNewObjektif('');
                  }}
                  className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus size={16} />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {(formConfig.bank.objektifList || []).map((obj, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-xs font-medium text-slate-800 dark:text-slate-200"
                  >
                    <span className="leading-relaxed">{obj}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormConfig({
                          ...formConfig,
                          bank: {
                            ...formConfig.bank,
                            objektifList: (formConfig.bank.objektifList || []).filter((_, i) => i !== idx)
                          }
                        })
                      }
                      className="text-slate-400 hover:text-red-500 mt-0.5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BANK SUBTAB 4: AKTIVITI MURID */}
          {bankSubTab === 'aktiviti' && (
            <div className="space-y-4 pt-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                Bank Aktiviti Murid ({(formConfig.bank.aktivitiList || []).length} item):
              </span>
              <p className="text-xs text-slate-500">
                Senarai aktiviti ini akan menjadi pilihan yang sedia di-tick oleh guru di Halaman Guru.
              </p>

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  placeholder="Taip aktiviti baharu (Cth: Melengkapkan pengertian bersyukur dihadapan kelas...)"
                  value={newAktiviti}
                  onChange={(e) => setNewAktiviti(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newAktiviti.trim()) return;
                    setFormConfig({
                      ...formConfig,
                      bank: {
                        ...formConfig.bank,
                        aktivitiList: [...(formConfig.bank.aktivitiList || []), newAktiviti.trim()]
                      }
                    });
                    setNewAktiviti('');
                  }}
                  className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus size={16} />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {(formConfig.bank.aktivitiList || []).map((akt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-xs font-medium text-slate-800 dark:text-slate-200"
                  >
                    <span className="leading-relaxed">{akt}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormConfig({
                          ...formConfig,
                          bank: {
                            ...formConfig.bank,
                            aktivitiList: (formConfig.bank.aktivitiList || []).filter((_, i) => i !== idx)
                          }
                        })
                      }
                      className="text-slate-400 hover:text-red-500 mt-0.5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BANK SUBTAB 5: AYAT CATATAN REFLEKSI */}
          {bankSubTab === 'refleksi' && (
            <div className="space-y-4 pt-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                Bank Ayat Tindakan Susulan / Refleksi ({formConfig.bank.refleksiCatatanList.length} pilihan):
              </span>
              <p className="text-xs text-slate-500">
                Guru boleh memilih ayat refleksi lazim ini secara pantas dari dropdown di Halaman Guru tanpa perlu menaip panjang.
              </p>

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  placeholder="Taip ayat refleksi lazim cth: Guru akan jalankan sesi tasmi' individu..."
                  value={newRefleksi}
                  onChange={(e) => setNewRefleksi(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newRefleksi.trim()) return;
                    setFormConfig({
                      ...formConfig,
                      bank: {
                        ...formConfig.bank,
                        refleksiCatatanList: [
                          ...formConfig.bank.refleksiCatatanList,
                          newRefleksi.trim()
                        ]
                      }
                    });
                    setNewRefleksi('');
                  }}
                  className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus size={16} />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {formConfig.bank.refleksiCatatanList.map((ref, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-xs font-medium text-slate-800 dark:text-slate-200"
                  >
                    <span className="leading-relaxed">"{ref}"</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormConfig({
                          ...formConfig,
                          bank: {
                            ...formConfig.bank,
                            refleksiCatatanList: formConfig.bank.refleksiCatatanList.filter((_, i) => i !== idx)
                          }
                        })
                      }
                      className="text-slate-400 hover:text-red-500 mt-0.5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BANK SUBTAB 6: BAHAGIAN KUSTOM */}
          {bankSubTab === 'kustom' && (
            <div className="space-y-6 pt-2">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white block">
                  Senarai Bank Pilihan Untuk Bahagian Kustom ({(formConfig.customPdfLayout?.customSections || []).length}):
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Uruskan senarai pilihan dropdown untuk bahagian kustom yang telah anda cipta dalam Canva A4 (cth: BBM, Nilai Murni, Kaedah PdP). Pilihan di sini akan terus dipaparkan dalam borang guru!
                </p>
              </div>

              {(formConfig.customPdfLayout?.customSections || []).length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 bg-slate-50 dark:bg-slate-800/40">
                  <Tag size={32} className="mx-auto text-slate-300 mb-2" />
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Belum Ada Bahagian Kustom Dicipta
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 mb-4">
                    Sila pergi ke Tab 4 (Susunan Grid PDF Canva A4) untuk menambah bahagian kustom baharu (cth: BBM, Nilai Murni).
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('grid')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-purple-700"
                  >
                    Buka Editor Canva A4 Sekarang
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(formConfig.customPdfLayout?.customSections || []).map((sec) => (
                    <div
                      key={sec.id}
                      className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
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
                        <span className="text-[11px] text-slate-500 font-semibold">
                          {(sec.pilihanBank || []).length} Pilihan Dropdown
                        </span>
                      </div>

                      {/* Input to add new option to this section */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={`Tambah pilihan dropdown baru untuk ${sec.namaRumi}...`}
                          value={newCustomOptionInput[sec.id] || ''}
                          onChange={(e) =>
                            setNewCustomOptionInput({
                              ...newCustomOptionInput,
                              [sec.id]: e.target.value
                            })
                          }
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => handleTambahPilihanBank(sec.id, sec.namaRumi)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs"
                        >
                          <Plus size={14} />
                          <span>Tambah Pilihan</span>
                        </button>
                      </div>

                      {/* Chips list of existing options */}
                      {(sec.pilihanBank || []).length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">
                          Belum ada pilihan dropdown dalam bank ini. Taip di atas untuk menambah.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(sec.pilihanBank || []).map((opt, oIdx) => (
                            <span
                              key={oIdx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs"
                            >
                              <span>{opt}</span>
                              <button
                                type="button"
                                onClick={() => handlePadamPilihanBank(sec.id, oIdx)}
                                className="text-slate-400 hover:text-rose-500"
                                title="Buang pilihan ini"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SUSUNAN GRID PDF (MOD CANVA A4) */}
      {/* ======================================================== */}
      {activeTab === 'grid' && (
        <AdminPdfLayoutEditor
          config={formConfig}
          layoutConfig={formConfig.customPdfLayout || DEFAULT_CANVA_LAYOUT}
          onChangeLayout={(newLayout) => {
            setFormConfig({
              ...formConfig,
              customPdfLayout: newLayout
            });
          }}
          skrip={skrip}
        />
      )}

      {/* Footer Reset button */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw size={14} />
          <span>Set Semula ke Tetapan Asal</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Save size={18} />
          <span>Simpan Semua Tetapan Admin</span>
        </button>
      </div>

    </div>
  );
};
