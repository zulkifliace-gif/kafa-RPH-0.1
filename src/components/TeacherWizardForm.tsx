import React, { useState } from 'react';
import { AdminSchoolConfig, TeacherDailyForm, ScriptMode } from '../types/rph';
import { HARI_OPTIONS } from '../config/options';
import { getDayFromDate, getWeekNumber, formatMalayDate } from '../utils/jawiHelper';
import {
  Clock,
  BookOpen,
  Target,
  Lightbulb,
  Award,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Printer,
  Download,
  Check,
  Plus,
  Compass,
  CheckCircle2
} from 'lucide-react';

interface Props {
  config: AdminSchoolConfig;
  form: TeacherDailyForm;
  onUpdateForm: (fields: Partial<TeacherDailyForm>) => void;
  skrip: ScriptMode;
  onGeneratePdf: () => void;
  isGeneratingPdf: boolean;
  onPrint: () => void;
}

interface StepMeta {
  id: number;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  promptTitle: string;
  promptDescription: string;
}

export const TeacherWizardForm: React.FC<Props> = ({
  config,
  form,
  onUpdateForm,
  skrip,
  onGeneratePdf,
  isGeneratingPdf,
  onPrint
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [customObjektifInput, setCustomObjektifInput] = useState('');
  const [customAktivitiInput, setCustomAktivitiInput] = useState('');

  const isJawi = skrip === 'jawi';
  const customLabels = config.labelCustom;

  const getLabel = (key: keyof typeof customLabels) => {
    return isJawi ? customLabels[key]?.jawi || '' : customLabels[key]?.rumi || '';
  };

  const steps: StepMeta[] = [
    {
      id: 1,
      title: 'Waktu & Kelas',
      shortTitle: 'Waktu & Kelas',
      icon: Clock,
      promptTitle: 'Langkah 1: Tetapkan Masa, Tarikh & Kelas',
      promptDescription:
        'Sila pilih tarikh PdP, minggu persekolahan, tahun serta nama kelas dan masa pengajaran anda.'
    },
    {
      id: 2,
      title: 'Mata Pelajaran & Tajuk',
      shortTitle: 'Subjek & Tajuk',
      icon: BookOpen,
      promptTitle: 'Langkah 2: Pilih Subjek, Bidang & Tajuk',
      promptDescription:
        'Pilih mata pelajaran kurikulum KAFA 2025. Tajuk dan subtajuk akan ditapis secara automatik mengikut tahun yang dipilih.'
    },
    {
      id: 3,
      title: 'Objektif Pembelajaran',
      shortTitle: 'Objektif',
      icon: Target,
      promptTitle: 'Langkah 3: Objektif Pembelajaran (Murid dapat)',
      promptDescription:
        'Tandakan hasil pembelajaran yang ingin dicapai oleh murid di akhir sesi pengajaran ini.'
    },
    {
      id: 4,
      title: 'Aktiviti Pembelajaran',
      shortTitle: 'Aktiviti',
      icon: Lightbulb,
      promptTitle: 'Langkah 4: Aktiviti PdP (Murid diminta)',
      promptDescription:
        'Pilih cadangan aktiviti murid yang bersesuaian dengan tajuk atau tambah aktiviti kustom anda.'
    },
    {
      id: 5,
      title: 'Kemahiran Pentaksiran',
      shortTitle: 'Kemahiran',
      icon: Compass,
      promptTitle: 'Langkah 5: Penilaian Kemahiran',
      promptDescription:
        'Tandakan bentuk kemahiran murid yang dinilai semasa sesi pengajaran berlangsung.'
    },
    {
      id: 6,
      title: 'Refleksi Guru & Jana PDF',
      shortTitle: 'Refleksi & Siap',
      icon: Award,
      promptTitle: 'Langkah 6: Catatan Refleksi & Cetakan RPH',
      promptDescription:
        'Catatkan bilangan murid yang menguasai serta ulasan refleksi, kemudian terus jana PDF atau cetak RPH.'
    }
  ];

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
  const availableTajukList =
    kurikulumList.length > 0
      ? kurikulumList.filter((t) => {
          if (t.mataPelajaran !== form.mataPelajaran) return false;
          if (form.mataPelajaran === 'Al-Quran') {
            if (form.bidang && t.bidang && t.bidang !== form.bidang) return false;
          }
          if (form.tahun && t.tahun && t.tahun !== form.tahun) return false;
          return true;
        })
      : (config.bank.tajukList || []).filter(
          (t) => !t.mataPelajaran || t.mataPelajaran === form.mataPelajaran
        );

  // Find currently matched Tajuk
  const currentCurriculumTajuk = kurikulumList.find(
    (t) =>
      t.mataPelajaran === form.mataPelajaran &&
      (form.mataPelajaran !== 'Al-Quran' || !form.bidang || t.bidang === form.bidang) &&
      (!form.tahun || !t.tahun || t.tahun === form.tahun) &&
      t.teks === form.tajuk.teks
  );

  // Available Subtajuk list: only subtajuks registered for this specific tajuk
  const availableSubtajukList = currentCurriculumTajuk
    ? currentCurriculumTajuk.subtajukList || []
    : kurikulumList.length === 0
    ? config.bank.subtajukList || []
    : [];

  // Available Objektif list: only objectives registered for this specific tajuk
  const availableObjektifList =
    currentCurriculumTajuk &&
    currentCurriculumTajuk.objektifList &&
    currentCurriculumTajuk.objektifList.length > 0
      ? currentCurriculumTajuk.objektifList
      : form.tajuk.teks
      ? config.bank.objektifList || []
      : [];

  // Available Aktiviti list: only activities registered for this specific tajuk
  const availableAktivitiList =
    currentCurriculumTajuk &&
    currentCurriculumTajuk.aktivitiList &&
    currentCurriculumTajuk.aktivitiList.length > 0
      ? currentCurriculumTajuk.aktivitiList
      : form.tajuk.teks
      ? config.bank.aktivitiList || []
      : [];

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
        tajuk: { kod: form.tajuk.kod, teks: val },
        subtajuk: { kod: '', teks: '' },
        selectedObjektif: [],
        selectedAktiviti: []
      });
    }
  };

  // Subtajuk selection from Bank
  const handleSelectSubtajukFromBank = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
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

  // Objektif toggle
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

  // Aktiviti toggle
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

  // Kemahiran toggle
  const handleToggleKemahiran = (key: 'lisan' | 'bertulis' | 'pemerhatian') => {
    onUpdateForm({
      selectedKemahiran: {
        ...form.selectedKemahiran,
        [key]: !form.selectedKemahiran[key]
      }
    });
  };

  const activeStepMeta = steps.find((s) => s.id === currentStep) || steps[0];

  const goNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-5">
      {/* STEP PROGRESS STEPPER */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center justify-center">
              {currentStep}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-white">
              Langkah {currentStep} daripada 6: {activeStepMeta.title}
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            {Math.round((currentStep / 6) * 100)}% Selesai
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-4">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>

        {/* Clickable Step Pills */}
        <div className="grid grid-cols-6 gap-1.5">
          {steps.map((s) => {
            const isCurrent = currentStep === s.id;
            const isCompleted = currentStep > s.id;
            const IconComp = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(s.id)}
                title={`Ke Langkah ${s.id}: ${s.title}`}
                className={`py-2 px-1 rounded-xl text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-600 text-white font-bold shadow-xs ring-2 ring-emerald-400'
                    : isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-50 dark:bg-slate-700/40 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-1">
                  {isCompleted ? (
                    <Check size={13} strokeWidth={3} className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <IconComp size={13} />
                  )}
                  <span className="text-[11px] font-black">{s.id}</span>
                </div>
                <span className="text-[9px] truncate max-w-full hidden sm:inline leading-tight">
                  {s.shortTitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONVERSATIONAL PROMPT CARD */}
      <div className="p-4 bg-linear-to-r from-emerald-600 to-teal-700 text-white rounded-3xl shadow-md space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-full">
            Bimbingan Pintar RPH
          </span>
          <span className="text-[11px] text-emerald-100 font-medium">
            Langkah {currentStep} / 6
          </span>
        </div>
        <h3 className="text-sm font-bold pt-1 flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-300" />
          {activeStepMeta.promptTitle}
        </h3>
        <p className="text-xs text-emerald-50 leading-relaxed font-medium">
          {activeStepMeta.promptDescription}
        </p>
      </div>

      {/* STEP CONTENT CONTAINER */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
        
        {/* ==================================================== */}
        {/* STEP 1: WAKTU, TAHUN, KELAS & TARIKH                 */}
        {/* ==================================================== */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Clock size={16} className="text-emerald-600" />
                Maklumat Waktu & Jadual Sesi PdP
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Isi tarikh, hari dan minggu atau pilih masa serta kelas dari pilihan guru.
              </p>
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
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white mb-1.5 focus:ring-2 focus:ring-emerald-500"
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {getLabel('tahun')} (Tahun Persekolahan)
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

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {getLabel('kelas')} (Nama Kelas)
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

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {getLabel('masa')} (Sesi PdP)
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
        )}

        {/* ==================================================== */}
        {/* STEP 2: MATA PELAJARAN, BIDANG, TAJUK & SUBTAJUK      */}
        {/* ==================================================== */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-600" />
                Mata Pelajaran & Aliran Tajuk (Kurikulum 2025)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Tajuk yang dipaparkan adalah khusus untuk subjek dan tahun yang telah anda pilih.
              </p>
            </div>

            {/* Mata Pelajaran & Bidang */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {getLabel('mataPelajaran')}:
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

              {/* Bidang (Al-Quran Only) */}
              {form.mataPelajaran === 'Al-Quran' ? (
                <div className="animate-slide-down bg-amber-50/70 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60">
                  <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 mb-1">
                    {getLabel('bidang')} Al-Quran:
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
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center text-xs text-slate-500">
                  Tahun Terpilih: <strong className="ml-1 text-slate-800 dark:text-white">{form.tahun ? `Tahun ${form.tahun}` : '(Belum dipilih)'}</strong>
                </div>
              )}
            </div>

            {/* Dropdown Tajuk */}
            <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 dark:text-white">
                  {getLabel('tajuk')} (Pilih Dari Bank):
                </label>
                {form.mataPelajaran && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Aliran: {form.mataPelajaran}
                    {form.bidang ? ` > ${form.bidang}` : ''}
                    {form.tahun ? ` (Tahun ${form.tahun})` : ''}
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
                    {t.kod ? `${t.kod} ` : ''}
                    {t.teks}
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
                  {getLabel('subtajuk')} (Pilih Dari Bank):
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
                    {st.kod ? `${st.kod} ` : ''}
                    {st.teks}
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
        )}

        {/* ==================================================== */}
        {/* STEP 3: OBJEKTIF PEMBELAJARAN                        */}
        {/* ==================================================== */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Target size={16} className="text-emerald-600" />
                  {getLabel('objektif')}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tandakan objektif pengajaran yang ingin dicapai bagi tajuk ini.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                {form.selectedObjektif.length} Ditandakan
              </span>
            </div>

            {/* List of Objectives */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {!form.tajuk.teks ? (
                <div className="p-5 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  Sila kembali ke Langkah 2 untuk memilih Tajuk terlebih dahulu.
                </div>
              ) : availableObjektifList.length === 0 ? (
                <div className="p-5 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
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
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-xs'
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

            {/* Custom Objective input */}
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <input
                type="text"
                placeholder="+ Taip objektif tambahan jika tiada dalam senarai..."
                value={customObjektifInput}
                onChange={(e) => setCustomObjektifInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomObjektif())}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddCustomObjektif}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Tambah</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 4: AKTIVITI MURID                               */}
        {/* ==================================================== */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Lightbulb size={16} className="text-amber-500" />
                  {getLabel('aktiviti')}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih aktiviti pembelajaran yang dirancang untuk murid semasa sesi PdP.
                </p>
              </div>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded-xl border border-teal-200 dark:border-teal-800">
                {form.selectedAktiviti.length} Ditandakan
              </span>
            </div>

            {/* List of Activities */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {!form.tajuk.teks ? (
                <div className="p-5 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  Sila kembali ke Langkah 2 untuk memilih Tajuk terlebih dahulu.
                </div>
              ) : availableAktivitiList.length === 0 ? (
                <div className="p-5 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
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
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/80 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100 shadow-xs'
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

            {/* Custom Activity input */}
            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <input
                type="text"
                placeholder="+ Taip aktiviti murid tambahan jika tiada dalam senarai..."
                value={customAktivitiInput}
                onChange={(e) => setCustomAktivitiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomAktiviti())}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddCustomAktiviti}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Tambah</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 5: KEMAHIRAN                                    */}
        {/* ==================================================== */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Compass size={16} className="text-emerald-600" />
                {getLabel('kemahiran')} (Pentaksiran KAFA)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Tandakan satu atau lebih jenis kemahiran yang dinilai semasa sesi PdP.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                {
                  key: 'lisan' as const,
                  rumi: 'Lisan',
                  jawi: 'ليسن',
                  desc: 'Mendengar, membaca bertajwid, menghafaz, dan bersoal jawab lisan.'
                },
                {
                  key: 'bertulis' as const,
                  rumi: 'Bertulis',
                  jawi: 'برتوليس',
                  desc: 'Menulis huruf Jawi, latihan lembaran kerja, dan menyalin nota.'
                },
                {
                  key: 'pemerhatian' as const,
                  rumi: 'Pemerhatian',
                  jawi: 'ڤمرهاتين',
                  desc: 'Pemerhatian amali ibadah, adab, penglibatan aktif dan tingkah laku.'
                }
              ].map((k) => {
                const isChecked = form.selectedKemahiran[k.key];
                return (
                  <button
                    key={k.key}
                    type="button"
                    onClick={() => handleToggleKemahiran(k.key)}
                    className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isChecked
                        ? 'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {k.rumi}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs ${
                            isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                      <span className="font-jawi text-sm text-emerald-700 dark:text-emerald-400 font-bold block mb-1">
                        {k.jawi}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                        {k.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bahagian Khas Sekolah (Jika ada) */}
            {((config.customPdfLayout?.customSections || []).length > 0) && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                  <Sparkles size={15} />
                  <span>Maklumat Tambahan Sekolah ({(config.customPdfLayout?.customSections || []).length}):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(config.customPdfLayout?.customSections || []).map((sec) => {
                    const currentValue = form.customValues?.[sec.id];
                    return (
                      <div key={sec.id} className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-600 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                            {isJawi ? sec.namaJawi : sec.namaRumi}
                          </label>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 uppercase font-semibold">
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
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                          >
                            <option value="">-- Pilih Dari Bank --</option>
                            {(sec.pilihanBank || []).map((opt, i) => (
                              <option key={i} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : sec.jenis === 'checkbox' ? (
                          (sec.pilihanBank && sec.pilihanBank.length > 0) ? (
                            <div className="flex flex-wrap gap-1.5 pt-1">
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
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition-all ${
                                      isChecked
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
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
                        ) : (
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
                            placeholder={sec.nilaiLalai || 'Catatan tambahan...'}
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 6: REFLEKSI GURU & JANA DOKUMEN                 */}
        {/* ==================================================== */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Award size={16} className="text-emerald-600" />
                {getLabel('refleksi')}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Masukkan dapatan PdP dan pilih catatan refleksi sebelum menjana PDF akhir.
              </p>
            </div>

            {/* Numbers: Menguasai, Tidak Menguasai, Jumlah */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-700/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                  ✓ Murid Menguasai
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
                  className="w-full px-2.5 py-1.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="block text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-1">
                  ✗ Belum Menguasai
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
                  className="w-full px-2.5 py-1.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Murid Kelas
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
                  className="w-full px-2.5 py-1.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                />
              </div>
            </div>

            {/* Quick Notes Dropdown */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {getLabel('catatan')} (Pilih Dari Bank Admin):
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
                <option value="">-- Pilih Ayat Refleksi Pantas Dari Bank --</option>
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
                placeholder="Tulis ulasan refleksi pengajaran anda di sini..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
              />
            </div>

            {/* Action Buttons inside Wizard final step */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>RPH anda telah lengkap diisi! Sedia untuk dijana atau dicetak:</span>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onGeneratePdf}
                  disabled={isGeneratingPdf}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download size={15} />
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
                  onClick={onPrint}
                  className="px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Printer size={15} />
                  <span>{isJawi ? 'چيتک' : 'Cetak PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* BOTTOM WIZARD NAVIGATION (PREV / NEXT)               */}
        {/* ==================================================== */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentStep === 1}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Sebelumnya</span>
          </button>

          <span className="text-[11px] font-semibold text-slate-400">
            Langkah {currentStep} dari 6
          </span>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={goNext}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>Seterusnya</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onGeneratePdf}
              disabled={isGeneratingPdf}
              className="px-5 py-2.5 bg-linear-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download size={14} />
              <span>Jana PDF Akhir</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
