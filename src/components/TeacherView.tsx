import React, { useState } from 'react';
import { RphData, AdminSchoolConfig, TeacherDailyForm, ScriptMode } from '../types/rph';
import { RphPreview } from './RphPreview';
import { exportToPdf, getPdfFilename } from '../utils/pdfExport';
import { TeacherWizardForm } from './TeacherWizardForm';
import {
  importSchoolConfigFile,
  exportTeacherBackupFile,
  importTeacherBackupFile
} from '../utils/storage';
import {
  Download,
  Printer,
  Check,
  RotateCcw,
  FileText,
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
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [layoutStyle, setLayoutStyle] = useState<'modern' | 'classic' | 'custom'>('classic');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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

      {/* Main Grid: Left Column (Teacher Wizard Form) & Right Column (Live A4 Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        
        {/* LEFT COLUMN: Teacher Wizard Form */}
        <div className={`lg:col-span-6 space-y-5 no-print min-w-0 ${mobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>
          <TeacherWizardForm
            config={config}
            form={form}
            onUpdateForm={onUpdateForm}
            skrip={skrip}
            onGeneratePdf={handleDownloadPdf}
            isGeneratingPdf={isGeneratingPdf}
            onPrint={handlePrint}
          />
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
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Susunan Admin
                </button>
              </div>

              {/* Fit Screen Zoom Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-0.5 rounded-lg border border-slate-200 dark:border-slate-600">
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
