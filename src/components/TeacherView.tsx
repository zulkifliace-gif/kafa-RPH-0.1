import React, { useState } from 'react';
import { RphData, AdminSchoolConfig, TeacherDailyForm, ScriptMode } from '../types/rph';
import { HARI_OPTIONS } from '../config/options';
import { getDayFromDate, getWeekNumber, formatMalayDate } from '../utils/jawiHelper';
import { RphPreview } from './RphPreview';
import { exportToPdf, getPdfFilename } from '../utils/pdfExport';
import { TeacherWizardForm } from './TeacherWizardForm';
import {
  importSchoolConfigFile,
  exportTeacherBackupFile,
  importTeacherBackupFile
} from '../utils/storage';
import {
  Clock,
  Bookmark,
  CheckCircle2,
  Lightbulb,
  Award,
  Download,
  Printer,
  Check,
  RotateCcw,
  FileText,
  Sparkles,
  Eye,
  ArrowLeft,
  FolderDown,
  Upload,
  FileJson,
  X,
  School
} from 'lucide-react';

interface Props {
  config: AdminSchoolConfig;
  form: TeacherDailyForm;
  onUpdateForm: (fields: Partial<TeacherDailyForm>) => void;
  onResetForm: () => void;
  onImportSchoolConfig?: (cfg: AdminSchoolConfig) => void;
  onImportTeacherForm?: (form: TeacherDailyForm) => void;
  skrip: ScriptMode;
}

export const TeacherView: React.FC<Props> = ({
  config,
  form,
  onUpdateForm,
  onResetForm,
  onImportSchoolConfig,
  onImportTeacherForm,
  skrip
}) => {
  const isJawi = skrip === 'jawi';
  const customLabels = config.labelCustom;

  const [entryMode, setEntryMode] = useState<'standard' | 'wizard'>('standard');
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [layoutStyle, setLayoutStyle] = useState<'modern' | 'classic' | 'custom'>('classic');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customObjektifInput, setCustomObjektifInput] = useState('');
  const [customAktivitiInput, setCustomAktivitiInput] = useState('');
  const [showDataModal, setShowDataModal] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleInstallSchoolData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedCfg = await importSchoolConfigFile(file);
      onImportSchoolConfig?.(importedCfg);
      showToast(`Data sekolah "${importedCfg.namaSekolah}" berjaya dipasang ke peranti anda! 🎉`);
      setShowDataModal(false);
    } catch (err: any) {
      alert(err.message || 'Ralat membaca fail data sekolah.');
    } finally {
      e.target.value = '';
    }
  };

  const handleExportTeacherBackup = () => {
    exportTeacherBackupFile(form);
    showToast('Sandaran borang RPH (.json) berjaya dimuat turun!');
  };

  const handleImportTeacherBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const importedForm = await importTeacherBackupFile(file);
      onImportTeacherForm?.(importedForm);
      showToast('Borang RPH berjaya dipulihkan daripada fail sandaran! 💾');
      setShowDataModal(false);
    } catch (err: any) {
      alert(err.message || 'Ralat membaca fail sandaran RPH.');
    } finally {
      e.target.value = '';
    }
  };

  const getLabel = (key: keyof typeof customLabels) => {
    return isJawi ? customLabels[key]?.jawi || '' : customLabels[key]?.rumi || '';
  };

  // Date change handler
  const handleDateChange = (val: string) => {
    const day = getDayFromDate(val);
    const week = getWeekNumber(val);
    const formatted = formatMalayDate(val);
    onUpdateForm({
      tarikh: formatted,
      ...(day ? { hari: day } : {}),
      ...(!form.minggu ? { minggu: week } : {})
    });
  };

  // Cascading Kurikulum Logic
  const kurikulumList = config.bank.kurikulum || [];

  // Filtered tajuk list based on chosen Mata Pelajaran, Bidang (if Al-Quran), and Tahun
  const availableTajukList = kurikulumList.length > 0
    ? kurikulumList.filter((t) => {
        if (t.mataPelajaran !== form.mataPelajaran) return false;
        if (form.mataPelajaran === 'Al-Quran') {
          if (form.bidang && t.bidang && t.bidang !== form.bidang) return false;
        }
        if (form.tahun && t.tahun && t.tahun !== form.tahun) return false;
        return true;
      })
    : (config.bank.tajukList || []).filter((t) => !t.mataPelajaran || t.mataPelajaran === form.mataPelajaran);

  // Find currently matched Tajuk
  const currentCurriculumTajuk = kurikulumList.find((t) =>
    t.mataPelajaran === form.mataPelajaran &&
    (form.mataPelajaran !== 'Al-Quran' || !form.bidang || t.bidang === form.bidang) &&
    (!form.tahun || !t.tahun || t.tahun === form.tahun) &&
    t.teks === form.tajuk.teks
  );

  // Available Subtajuk list: only subtajuks registered for this specific tajuk
  const availableSubtajukList = currentCurriculumTajuk
    ? (currentCurriculumTajuk.subtajukList || [])
    : (kurikulumList.length === 0 ? (config.bank.subtajukList || []) : []);

  // Available Objektif list: only objectives registered for this specific tajuk (or fallback if empty)
  const availableObjektifList =
    currentCurriculumTajuk && currentCurriculumTajuk.objektifList && currentCurriculumTajuk.objektifList.length > 0
      ? currentCurriculumTajuk.objektifList
      : (form.tajuk.teks ? (config.bank.objektifList || []) : []);

  // Available Aktiviti list: only activities registered for this specific tajuk (or fallback if empty)
  const availableAktivitiList =
    currentCurriculumTajuk && currentCurriculumTajuk.aktivitiList && currentCurriculumTajuk.aktivitiList.length > 0
      ? currentCurriculumTajuk.aktivitiList
      : (form.tajuk.teks ? (config.bank.aktivitiList || []) : []);

  // Year change with cascading reset
  const handleTahunChange = (newTahun: string) => {
    onUpdateForm({
      tahun: newTahun,
      tajuk: { kod: '', teks: '' },
      subtajuk: { kod: '', teks: '' },
      selectedObjektif: [],
      selectedAktiviti: []
    });
  };

  // Subject change with cascading reset
  const handleMataPelajaranChange = (sub: string) => {
    if (sub !== 'Al-Quran') {
      onUpdateForm({
        mataPelajaran: sub,
        bidang: null,
        tajuk: { kod: '', teks: '' },
        subtajuk: { kod: '', teks: '' },
        selectedObjektif: [],
        selectedAktiviti: []
      });
    } else {
      const defaultBidang = config.bank.bidangAlQuran[0] || 'Tilawah';
      onUpdateForm({
        mataPelajaran: sub,
        bidang: defaultBidang,
        tajuk: { kod: '', teks: '' },
        subtajuk: { kod: '', teks: '' },
        selectedObjektif: [],
        selectedAktiviti: []
      });
    }
  };

  // Bidang change for Al-Quran with cascading reset
  const handleBidangChange = (newBidang: string) => {
    onUpdateForm({
      bidang: newBidang,
      tajuk: { kod: '', teks: '' },
      subtajuk: { kod: '', teks: '' },
      selectedObjektif: [],
      selectedAktiviti: []
    });
  };

  // Tajuk selection from Bank with cascading reset of subtajuk, objektif, aktiviti
  const handleSelectTajukFromBank = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      onUpdateForm({
        tajuk: { kod: '', teks: '' },
        subtajuk: { kod: '', teks: '' },
        selectedObjektif: [],
        selectedAktiviti: []
      });
      return;
    }

    const found = availableTajukList.find((t) => t.teks === val);
    if (found) {
      onUpdateForm({
        tajuk: { kod: found.kod || '', teks: found.teks },
        subtajuk: { kod: '', teks: '' },
        selectedObjektif: [],
        selectedAktiviti: []
      });
    } else {
      onUpdateForm({
        tajuk: { kod: '', teks: val },
        subtajuk: { kod: '', teks: '' },
        selectedObjektif: [],
        selectedAktiviti: []
      });
    }
  };

  // Subtajuk selection from filtered bank
  const handleSelectSubtajukFromBank = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      onUpdateForm({
        subtajuk: { kod: '', teks: '' }
      });
      return;
    }
    const found = availableSubtajukList.find((st) => st.teks === val);
    if (found) {
      onUpdateForm({
        subtajuk: { kod: found.kod || '', teks: found.teks }
      });
    } else {
      onUpdateForm({
        subtajuk: { kod: form.subtajuk.kod, teks: val }
      });
    }
  };

  // Objektif tick from bank
  const handleToggleObjektif = (item: string) => {
    const exists = form.selectedObjektif.includes(item);
    if (exists) {
      onUpdateForm({
        selectedObjektif: form.selectedObjektif.filter((o) => o !== item)
      });
    } else {
      onUpdateForm({
        selectedObjektif: [...form.selectedObjektif, item]
      });
    }
  };

  const handleAddCustomObjektif = () => {
    if (!customObjektifInput.trim()) return;
    onUpdateForm({
      selectedObjektif: [...form.selectedObjektif, customObjektifInput.trim()]
    });
    setCustomObjektifInput('');
  };

  // Aktiviti tick from bank
  const handleToggleAktiviti = (item: string) => {
    const exists = form.selectedAktiviti.includes(item);
    if (exists) {
      onUpdateForm({
        selectedAktiviti: form.selectedAktiviti.filter((a) => a !== item)
      });
    } else {
      onUpdateForm({
        selectedAktiviti: [...form.selectedAktiviti, item]
      });
    }
  };

  const handleAddCustomAktiviti = () => {
    if (!customAktivitiInput.trim()) return;
    onUpdateForm({
      selectedAktiviti: [...form.selectedAktiviti, customAktivitiInput.trim()]
    });
    setCustomAktivitiInput('');
  };

  // Kemahiran tick
  const handleToggleKemahiran = (key: 'lisan' | 'bertulis' | 'pemerhatian') => {
    onUpdateForm({
      selectedKemahiran: {
        ...form.selectedKemahiran,
        [key]: !form.selectedKemahiran[key]
      }
    });
  };

  // Refleksi numbers
  const menguasaiNum = parseInt(form.refleksi.muridMenguasai || '0', 10);
  const tidakMenguasaiNum = parseInt(form.refleksi.muridTidakMenguasai || '0', 10);
  const jumlahNum = parseInt(form.refleksi.jumlahMurid || '10', 10);
  const totalStudents = menguasaiNum + tidakMenguasaiNum;
  const isRatioExceeded = jumlahNum > 0 && totalStudents > jumlahNum;

  // Validation before PDF
  const isAlQuran = form.mataPelajaran === 'Al-Quran';
  const hasKemahiran =
    form.selectedKemahiran.lisan ||
    form.selectedKemahiran.bertulis ||
    form.selectedKemahiran.pemerhatian;

  const isValidForPdf = Boolean(
    form.tarikh &&
    form.hari &&
    form.tahun &&
    form.kelas &&
    form.masa &&
    form.mataPelajaran &&
    (!isAlQuran || form.bidang) &&
    form.tajuk.teks &&
    form.selectedObjektif.length > 0 &&
    form.selectedAktiviti.length > 0 &&
    hasKemahiran &&
    form.refleksi.muridMenguasai !== '' &&
    !isRatioExceeded
  );

  const handleDownloadPdf = async () => {
    if (!isValidForPdf) {
      showToast('Sila lengkapkan pilihan dropdown sebelum menjana PDF.');
      return;
    }

    const currentRphData: RphData = {
      tarikh: form.tarikh,
      hari: form.hari,
      minggu: form.minggu,
      tahun: form.tahun,
      kelas: form.kelas,
      masa: form.masa,
      tajuk: form.tajuk,
      subtajuk: form.subtajuk,
      mataPelajaran: form.mataPelajaran,
      bidang: form.bidang,
      objektifPembelajaran: form.selectedObjektif,
      aktivitiMurid: form.selectedAktiviti,
      kemahiran: {
        lisan: Boolean(form.selectedKemahiran.lisan),
        bertulis: Boolean(form.selectedKemahiran.bertulis),
        pemerhatian: Boolean(form.selectedKemahiran.pemerhatian)
      },
      refleksi: form.refleksi,
      skrip: skrip
    };

    setIsGeneratingPdf(true);
    try {
      await exportToPdf('rph-pdf-printable-area', currentRphData);
      showToast(`Fail ${getPdfFilename(currentRphData)} berjaya dimuat turun!`);
    } catch (err) {
      console.error(err);
      showToast('Ralat semasa menjana PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-bounce flex items-center gap-2">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* School Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {config.logoSekolah && (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 shadow-md shrink-0 flex items-center justify-center border border-white/20 overflow-hidden">
                <img
                  src={config.logoSekolah}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-emerald-100 uppercase tracking-widest">
                  PORTAL GURU KAFA
                </span>
                <span className="text-xs text-emerald-200">
                  • {isJawi ? 'ڤڠيسين هارين برباسيکن دروڤدوءن' : 'Pengisian Harian Berasaskan Dropdown'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {config.namaSekolah}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1 font-medium">
                {config.subSlogan}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDataModal(true)}
              title="Pasang fail data sekolah (.json) atau buat sandaran RPH"
              className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs transition-colors shadow-xs cursor-pointer"
            >
              <FolderDown size={14} />
              <span>📁 Pasang Data / Sandaran</span>
            </button>
            <button
              type="button"
              onClick={onResetForm}
              title="Kosongkan semula borang"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile View Switcher (Visible on phone/tablet, hidden on desktop lg) */}
      <div className="lg:hidden flex items-center p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs no-print">
        <button
          type="button"
          onClick={() => setMobileView('form')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mobileView === 'form'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FileText size={15} />
          <span>Borang RPH</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView('preview')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mobileView === 'preview'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Eye size={15} />
          <span>Pratonton A4 & Cetak</span>
        </button>
      </div>

      {/* Main Grid: Left Column (Teacher Dropdown Form) & Right Column (Live A4 Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        
        {/* LEFT COLUMN: Teacher Dropdown Form */}
        <div className={`lg:col-span-6 space-y-5 no-print ${mobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>

          {/* Mode Switcher: Standard Form vs Wizard Form */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setEntryMode('standard')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                entryMode === 'standard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <FileText size={15} />
              <span>Mod Standard (Borang Penuh)</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('wizard')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                entryMode === 'wizard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles size={15} className={entryMode === 'wizard' ? 'text-yellow-300' : 'text-amber-500'} />
              <span>Mod Wizard (Langkah demi Langkah)</span>
            </button>
          </div>

          {entryMode === 'wizard' ? (
            <TeacherWizardForm
              config={config}
              form={form}
              onUpdateForm={onUpdateForm}
              skrip={skrip}
              onGeneratePdf={handleDownloadPdf}
              isGeneratingPdf={isGeneratingPdf}
              onPrint={handlePrint}
            />
          ) : (
            <>
              {/* SECTION 1: KELAS, TAHUN, MASA & TARIKH */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Clock size={16} className="text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                Maklumat Waktu, Tahun & Kelas
              </h3>
            </div>

            {/* Tarikh, Hari, Minggu */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {getLabel('tarikh')}
                </label>
                <input
                  type="date"
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white mb-1 focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  value={form.tarikh}
                  onChange={(e) => onUpdateForm({ tarikh: e.target.value })}
                  placeholder="7 September 2026"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {getLabel('hari')}
                </label>
                <select
                  value={form.hari}
                  onChange={(e) => onUpdateForm({ hari: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-semibold"
                >
                  <option value="">-- Pilih Hari --</option>
                  {HARI_OPTIONS.map((h) => (
                    <option key={h.value} value={h.value}>
                      {isJawi ? `${h.labelJawi} (${h.labelRumi})` : h.labelRumi}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {getLabel('minggu')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={form.minggu}
                  onChange={(e) => onUpdateForm({ minggu: e.target.value })}
                  placeholder="31"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-semibold"
                />
              </div>
            </div>

            {/* Dropdown Tahun, Kelas, Masa */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              
              {/* Dropdown Tahun */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {getLabel('tahun')} (Dropdown)
                </label>
                <select
                  value={form.tahun}
                  onChange={(e) => handleTahunChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-bold text-emerald-950 dark:text-emerald-300"
                >
                  <option value="">-- Pilih Tahun --</option>
                  {config.bank.tahun.map((t) => (
                    <option key={t} value={t}>
                      {isJawi ? `تاهون ${t}` : `Tahun ${t}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown Kelas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {getLabel('kelas')} (Dropdown)
                </label>
                <select
                  value={form.kelas}
                  onChange={(e) => onUpdateForm({ kelas: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-bold text-emerald-950 dark:text-emerald-300"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {config.bank.kelas.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown Masa */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {getLabel('masa')} (Dropdown)
                </label>
                <select
                  value={form.masa}
                  onChange={(e) => onUpdateForm({ masa: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                >
                  <option value="">-- Pilih Masa --</option>
                  {config.bank.masa.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* SECTION 2: MATA PELAJARAN, BIDANG, TAJUK & SUBTAJUK (DROPDOWN) */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Bookmark size={16} className="text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                Mata Pelajaran & Tajuk Pelajaran
              </h3>
            </div>

            {/* Mata Pelajaran & Bidang Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {getLabel('mataPelajaran')} (Dropdown)
                </label>
                <select
                  value={form.mataPelajaran}
                  onChange={(e) => handleMataPelajaranChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                >
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {config.bank.mataPelajaran.map((mp) => (
                    <option key={mp} value={mp}>
                      {mp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bidang Dropdown (ONLY Al-Quran) */}
              {form.mataPelajaran === 'Al-Quran' ? (
                <div className="animate-slide-down bg-amber-50/70 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60">
                  <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 mb-1">
                    {getLabel('bidang')} Al-Quran (Dropdown)
                  </label>
                  <select
                    value={form.bidang || ''}
                    onChange={(e) => handleBidangChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                  >
                    <option value="">-- Pilih Bidang --</option>
                    {config.bank.bidangAlQuran.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            {/* Dropdown Tajuk */}
            <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 dark:text-white">
                  {getLabel('tajuk')} (Pilih Dari Bank / Dropdown):
                </label>
                {form.mataPelajaran && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Aliran: {form.mataPelajaran}{form.bidang ? ` > ${form.bidang}` : ''}{form.tahun ? ` (Tahun ${form.tahun})` : ''}
                  </span>
                )}
              </div>
              <select
                value={form.tajuk.teks}
                onChange={handleSelectTajukFromBank}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-emerald-200 font-bold"
              >
                <option value="">
                  {availableTajukList.length > 0
                    ? `-- Pilih Tajuk (${availableTajukList.length} tajuk untuk ${form.mataPelajaran || 'subjek ini'}${form.tahun ? ` Tahun ${form.tahun}` : ''}) --`
                    : `-- Tiada tajuk dalam bank untuk ${form.mataPelajaran || 'subjek ini'}${form.tahun ? ` Tahun ${form.tahun}` : ''} --`}
                </option>
                {availableTajukList.map((t, idx) => (
                  <option key={idx} value={t.teks}>
                    {t.kod ? `${t.kod} ` : ''}{t.teks}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Kod (2.1)"
                  value={form.tajuk.kod}
                  onChange={(e) =>
                    onUpdateForm({
                      tajuk: { ...form.tajuk, kod: e.target.value }
                    })
                  }
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                />
                <input
                  type="text"
                  placeholder="Nama Tajuk"
                  value={form.tajuk.teks}
                  onChange={(e) =>
                    onUpdateForm({
                      tajuk: { ...form.tajuk, teks: e.target.value }
                    })
                  }
                  className="col-span-3 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* Dropdown Subtajuk */}
            <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 dark:text-white">
                  {getLabel('subtajuk')} (Pilih Dari Bank / Dropdown):
                </label>
                {form.tajuk.teks && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {availableSubtajukList.length} subtajuk berkaitan
                  </span>
                )}
              </div>
              <select
                value={form.subtajuk.teks}
                onChange={handleSelectSubtajukFromBank}
                disabled={!form.tajuk.teks && availableSubtajukList.length === 0}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800"
              >
                <option value="">
                  {!form.tajuk.teks
                    ? '-- Sila pilih Tajuk terlebih dahulu --'
                    : availableSubtajukList.length > 0
                    ? `-- Pilih Subtajuk (${availableSubtajukList.length} pilihan berkaitan tajuk ini) --`
                    : '-- Tiada subtajuk khusus (taip manual di bawah) --'}
                </option>
                {availableSubtajukList.map((st, idx) => (
                  <option key={idx} value={st.teks}>
                    {st.kod ? `${st.kod} ` : ''}{st.teks}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Kod (2.1.1)"
                  value={form.subtajuk.kod}
                  onChange={(e) =>
                    onUpdateForm({
                      subtajuk: { ...form.subtajuk, kod: e.target.value }
                    })
                  }
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                />
                <input
                  type="text"
                  placeholder="Nama Subtajuk"
                  value={form.subtajuk.teks}
                  onChange={(e) =>
                    onUpdateForm({
                      subtajuk: { ...form.subtajuk, teks: e.target.value }
                    })
                  }
                  className="col-span-3 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                />
              </div>
            </div>

          </div>

          {/* SECTION 3: OBJEKTIF PEMBELAJARAN (TICK / PILIH DARI BANK) */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                  {getLabel('objektif')}
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {form.selectedObjektif.length} Dipilih
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {currentCurriculumTajuk && currentCurriculumTajuk.objektifList && currentCurriculumTajuk.objektifList.length > 0
                  ? `Objektif khusus untuk "${form.tajuk.teks}":`
                  : form.tajuk.teks
                  ? 'Objektif pembelajaran:'
                  : 'Sila pilih Tajuk terlebih dahulu:'}
              </span>
              {currentCurriculumTajuk && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {availableObjektifList.length} Objektif Berkaitan
                </span>
              )}
            </div>

            {/* Bank of Objectives to Tick */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {!form.tajuk.teks ? (
                <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  Sila pilih Tajuk di atas untuk memaparkan senarai objektif yang bersambung dengan tajuk tersebut.
                </div>
              ) : availableObjektifList.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  Tiada senarai objektif khusus dalam bank bagi tajuk ini. Sila taip objektif anda di bawah.
                </div>
              ) : (
                availableObjektifList.map((obj, idx) => {
                  const isSelected = form.selectedObjektif.includes(obj);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleObjektif(obj)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg shrink-0 mt-0.5 flex items-center justify-center text-xs ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                      <span className="text-xs font-medium leading-relaxed">{obj}</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Optional Custom Objective Input */}
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <input
                type="text"
                placeholder="+ Taip objektif tambahan jika tiada dalam bank..."
                value={customObjektifInput}
                onChange={(e) => setCustomObjektifInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddCustomObjektif}
                className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Tambah
              </button>
            </div>
          </div>

          {/* SECTION 4: AKTIVITI MURID (TICK / PILIH DARI BANK) */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-500" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                  {getLabel('aktiviti')}
                </h3>
              </div>
              <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                {form.selectedAktiviti.length} Dipilih
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {currentCurriculumTajuk && currentCurriculumTajuk.aktivitiList && currentCurriculumTajuk.aktivitiList.length > 0
                  ? `Aktiviti khusus untuk "${form.tajuk.teks}":`
                  : form.tajuk.teks
                  ? 'Aktiviti pembelajaran:'
                  : 'Sila pilih Tajuk terlebih dahulu:'}
              </span>
              {currentCurriculumTajuk && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                  {availableAktivitiList.length} Aktiviti Berkaitan
                </span>
              )}
            </div>

            {/* Bank of Activities to Tick */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {!form.tajuk.teks ? (
                <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  Sila pilih Tajuk di atas untuk memaparkan aktiviti yang bersambung dengan tajuk tersebut.
                </div>
              ) : availableAktivitiList.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  Tiada senarai aktiviti khusus dalam bank bagi tajuk ini. Sila taip aktiviti anda di bawah.
                </div>
              ) : (
                availableAktivitiList.map((akt, idx) => {
                  const isSelected = form.selectedAktiviti.includes(akt);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleAktiviti(akt)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg shrink-0 mt-0.5 flex items-center justify-center text-xs ${
                          isSelected
                            ? 'bg-teal-600 text-white'
                            : 'border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                      <span className="text-xs font-medium leading-relaxed">{akt}</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Optional Custom Activity Input */}
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <input
                type="text"
                placeholder="+ Taip aktiviti tambahan jika tiada dalam bank..."
                value={customAktivitiInput}
                onChange={(e) => setCustomAktivitiInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddCustomAktiviti}
                className="px-3.5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
              >
                Tambah
              </button>
            </div>
          </div>

          {/* SECTION 5: KEMAHIRAN */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
              {getLabel('kemahiran')}
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { key: 'lisan' as const, rumi: 'Lisan', jawi: 'ليسن' },
                { key: 'bertulis' as const, rumi: 'Bertulis', jawi: 'برتوليس' },
                { key: 'pemerhatian' as const, rumi: 'Pemerhatian', jawi: 'ڤمرهاتين' }
              ].map((k) => {
                const isChecked = form.selectedKemahiran[k.key];
                return (
                  <button
                    key={k.key}
                    type="button"
                    onClick={() => handleToggleKemahiran(k.key)}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                      isChecked
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center text-xs ${
                          isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span className="text-xs font-bold">{k.rumi}</span>
                    </div>
                    <span className="font-jawi text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                      {k.jawi}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 6: REFLEKSI GURU & AYAT DROPDOWN */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Award size={16} className="text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                {getLabel('refleksi')}
              </h3>
            </div>

            {/* Numbers: Menguasai, Tidak Menguasai, Jumlah */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-slate-50 dark:bg-slate-700/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                  ✓ Menguasai
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.refleksi.muridMenguasai}
                  onChange={(e) =>
                    onUpdateForm({
                      refleksi: { ...form.refleksi, muridMenguasai: e.target.value }
                    })
                  }
                  className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-1">
                  ✗ Belum
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.refleksi.muridTidakMenguasai}
                  onChange={(e) =>
                    onUpdateForm({
                      refleksi: { ...form.refleksi, muridTidakMenguasai: e.target.value }
                    })
                  }
                  className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Kelas
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.refleksi.jumlahMurid}
                  onChange={(e) =>
                    onUpdateForm({
                      refleksi: { ...form.refleksi, jumlahMurid: e.target.value }
                    })
                  }
                  className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                />
              </div>
            </div>

            {/* Dropdown Pilihan Pantas Ayat Refleksi */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {getLabel('catatan')} (Pilih Ayat Dari Bank / Dropdown):
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onUpdateForm({
                      refleksi: { ...form.refleksi, catatan: e.target.value }
                    });
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
              >
                <option value="">-- Pilih Ayat Refleksi Dari Bank Admin --</option>
                {config.bank.refleksiCatatanList.map((rc, idx) => (
                  <option key={idx} value={rc}>
                    {rc}
                  </option>
                ))}
              </select>

              <textarea
                rows={3}
                value={form.refleksi.catatan}
                onChange={(e) =>
                  onUpdateForm({
                    refleksi: { ...form.refleksi, catatan: e.target.value }
                  })
                }
                placeholder="Ayat refleksi atau tindakan susulan..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium mt-1"
              />
            </div>

          </div>

          {/* BAHAGIAN KHAS SEKOLAH (JIKA ADA DITETAPKAN ADMIN) */}
          {((config.customPdfLayout?.customSections || []).length > 0) && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-purple-200 dark:border-purple-800/60 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Maklumat Tambahan Sekolah ({(config.customPdfLayout?.customSections || []).length})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Pilih daripada bank dropdown yang disediakan oleh pentadbir sekolah anda.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {(config.customPdfLayout?.customSections || []).map((sec) => {
                  const currentValue = form.customValues?.[sec.id];
                  return (
                    <div key={sec.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                          {isJawi ? sec.namaJawi : sec.namaRumi}
                          {sec.jenis === 'dropdown' && ' :'}
                        </label>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase font-semibold">
                          {sec.jenis}
                        </span>
                      </div>

                      {sec.jenis === 'dropdown' ? (
                        <select
                          value={currentValue || ''}
                          onChange={(e) => {
                            onUpdateForm({
                              customValues: {
                                ...(form.customValues || {}),
                                [sec.id]: e.target.value
                              }
                            });
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                        >
                          <option value="">-- Sila Pilih Dari Bank Dropdown --</option>
                          {(sec.pilihanBank || []).map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : sec.jenis === 'checkbox' ? (
                        (sec.pilihanBank && sec.pilihanBank.length > 0) ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {sec.pilihanBank.map((opt, i) => {
                              const isChecked = Array.isArray(currentValue) && currentValue.includes(opt);
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => {
                                    const currentArr = Array.isArray(currentValue) ? currentValue : [];
                                    const nextArr = isChecked
                                      ? currentArr.filter((item) => item !== opt)
                                      : [...currentArr, opt];
                                    onUpdateForm({
                                      customValues: {
                                        ...(form.customValues || {}),
                                        [sec.id]: nextArr
                                      }
                                    });
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                                    isChecked
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                      : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                                  }`}
                                >
                                  <span>{isChecked ? '☑' : '☐'}</span>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                            <input
                              type="checkbox"
                              checked={Boolean(currentValue)}
                              onChange={(e) => {
                                onUpdateForm({
                                  customValues: {
                                    ...(form.customValues || {}),
                                    [sec.id]: e.target.checked
                                  }
                                });
                              }}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>{sec.nilaiLalai || 'Aktif / Dicapai'}</span>
                          </label>
                        )
                      ) : sec.jenis === 'bullet' ? (
                        <input
                          type="text"
                          value={currentValue || ''}
                          onChange={(e) => {
                            onUpdateForm({
                              customValues: {
                                ...(form.customValues || {}),
                                [sec.id]: e.target.value
                              }
                            });
                          }}
                          placeholder={sec.nilaiLalai || 'Masukkan catatan mengikut mata (bullet)...'}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                        />
                      ) : (
                        <textarea
                          rows={2}
                          value={currentValue || ''}
                          onChange={(e) => {
                            onUpdateForm({
                              customValues: {
                                ...(form.customValues || {}),
                                [sec.id]: e.target.value
                              }
                            });
                          }}
                          placeholder={sec.nilaiLalai || 'Catatan untuk bahagian ini...'}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sticky Bottom Actions */}
          <div className="sticky bottom-4 z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className={`w-full sm:flex-1 py-3 sm:py-3.5 px-4 sm:px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                isValidForPdf && !isGeneratingPdf
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white shadow-emerald-500/20 active:scale-98'
                  : 'bg-emerald-600 text-white opacity-90'
              }`}
            >
              <Download size={18} />
              <span>
                {isGeneratingPdf
                  ? 'Sedang Menjana PDF...'
                  : isJawi
                  ? 'جانا & موات تورون ڤي.دي.ايف'
                  : 'Jana & Muat Turun PDF'}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto py-3 sm:py-3.5 px-4 sm:px-5 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer size={16} />
              <span>Cetak PDF</span>
            </button>

            {/* Quick Preview button on mobile */}
            <button
              type="button"
              onClick={() => setMobileView('preview')}
              className="lg:hidden w-full py-2.5 px-3 rounded-2xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye size={15} />
              <span>Lihat Pratonton Dokumen A4</span>
            </button>
          </div>
            </>
          )}

        </div>

        {/* RIGHT COLUMN: Live Printable A4 Preview */}
        <div className={`lg:col-span-6 space-y-4 ${mobileView === 'form' ? 'hidden lg:block' : 'block'}`}>
          
          {/* Preview Controls Bar */}
          <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 no-print">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pratonton Dokumen A4:
              </span>

              {/* Back to form button on mobile */}
              <button
                type="button"
                onClick={() => setMobileView('form')}
                className="lg:hidden px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 hover:bg-slate-200"
              >
                <ArrowLeft size={13} />
                <span>Isi Borang</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Layout Switcher */}
              <div className="inline-flex flex-wrap rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-700 text-[11px] sm:text-xs">
                <button
                  type="button"
                  onClick={() => setLayoutStyle('classic')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md font-medium transition-all ${
                    layoutStyle === 'classic'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Grid Tapak Asal
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutStyle('modern')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md font-medium transition-all ${
                    layoutStyle === 'modern'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Lajur Penuh
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutStyle('custom')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md font-medium transition-all ${
                    layoutStyle === 'custom'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Susunan Khas (Canva)
                </button>
              </div>

              {/* Mobile Zoom Scale */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg text-xs text-slate-600 dark:text-slate-300">
                <span className="text-[10px] text-slate-400">Skala:</span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(previewZoom === 60 ? 100 : 60)}
                  className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                >
                  {previewZoom === 60 ? '100%' : '📱 Muat Skrin'}
                </button>
              </div>
            </div>
          </div>

          {/* A4 Preview Container with Responsive Scaling */}
          <div className="overflow-x-auto pb-6 transition-all duration-200">
            <div
              style={
                previewZoom < 100
                  ? {
                      transform: `scale(${previewZoom / 100})`,
                      transformOrigin: 'top center',
                      width: `${100 / (previewZoom / 100)}%`,
                      marginBottom: `-${(100 - previewZoom) * 4}px`
                    }
                  : undefined
              }
            >
              <RphPreview
                data={{
                  tarikh: form.tarikh,
                  hari: form.hari,
                  minggu: form.minggu,
                  tahun: form.tahun,
                  kelas: form.kelas,
                  masa: form.masa,
                  tajuk: form.tajuk,
                  subtajuk: form.subtajuk,
                  mataPelajaran: form.mataPelajaran,
                  bidang: form.bidang,
                  objektifPembelajaran: form.selectedObjektif,
                  aktivitiMurid: form.selectedAktiviti,
                  kemahiran: {
                    lisan: Boolean(form.selectedKemahiran.lisan),
                    bertulis: Boolean(form.selectedKemahiran.bertulis),
                    pemerhatian: Boolean(form.selectedKemahiran.pemerhatian)
                  },
                  refleksi: form.refleksi,
                  customValues: form.customValues,
                  skrip: skrip
                }}
                namaSekolah={config.namaSekolah}
                logoSekolah={config.logoSekolah}
                customLabels={config.labelCustom}
                skrip={skrip}
                layoutStyle={layoutStyle}
                customLayout={config.customPdfLayout}
              />
            </div>
          </div>

          {/* Sticky Actions in Mobile Preview Mode */}
          <div className="lg:hidden sticky bottom-4 z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="w-full py-3 px-4 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center gap-2 shadow-md"
            >
              <Download size={16} />
              <span>{isGeneratingPdf ? 'Sedang Menjana...' : 'Jana & Muat Turun PDF'}</span>
            </button>
            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5"
              >
                <Printer size={15} />
                <span>Cetak PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileView('form')}
                className="flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={15} />
                <span>Edit Borang</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL PENGURUSAN DATA & SANDARAN PERANTI (100% OFFLINE) */}
      {showDataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <FolderDown size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Pemasangan Data & Sandaran Peranti
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    100% Luar Talian (Offline) • Tanpa Pelayan Awan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDataModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* SEKSYEN 1: PASANG DATA SEKOLAH DARI ADMIN */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <div className="flex items-start gap-2.5">
                <School size={18} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                    1. Pasang Fail Data Sekolah (.json)
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    Dapatkan fail data sekolah daripada Pentadbir / Admin anda (melalui WhatsApp / Telegram). Klik butang di bawah dan pilih fail tersebut untuk memuatkan logo, senarai kelas, subjek, dan format sekolah terus ke peranti ini.
                  </p>
                </div>
              </div>

              <label className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all">
                <Upload size={14} />
                <span>Pilih & Pasang Fail Data Sekolah (.json)</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleInstallSchoolData}
                  className="hidden"
                />
              </label>
            </div>

            {/* SEKSYEN 2: SANDARAN & PULIHKAN BORANG RPH GURU */}
            <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-start gap-2.5">
                <FileJson size={18} className="text-slate-600 dark:text-slate-300 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    2. Sandaran & Pemulihan Borang RPH Peribadi
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Simpan salinan borang pengajaran anda atau pulihkan semula jika anda bertukar ke telefon atau komputer baharu.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExportTeacherBackup}
                  className="py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={14} className="text-emerald-600" />
                  <span>Muat Turun Sandaran</span>
                </button>

                <label className="py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                  <Upload size={14} className="text-emerald-600" />
                  <span>Pulihkan Sandaran</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportTeacherBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowDataModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
