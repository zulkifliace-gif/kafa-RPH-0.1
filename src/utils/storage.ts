import { AdminSchoolConfig, TeacherDailyForm, WeeklyScheduleMap } from '../types/rph';
import { DEFAULT_ADMIN_CONFIG, DEFAULT_TEACHER_FORM } from '../config/options';

const STORAGE_KEY_ADMIN = 'rph_kafa_v3_admin_config';
const STORAGE_KEY_ADMIN_DRAFT = 'rph_kafa_v3_admin_draft';
const STORAGE_KEY_TEACHER = 'rph_kafa_v3_teacher_form';
const STORAGE_KEY_TEACHER_SCHEDULE = 'rph_kafa_v3_teacher_schedule';

export function loadAdminConfig(): AdminSchoolConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults in case of missing keys
      return {
        ...DEFAULT_ADMIN_CONFIG,
        ...parsed,
        labelCustom: {
          ...DEFAULT_ADMIN_CONFIG.labelCustom,
          ...(parsed.labelCustom || {})
        },
        bank: {
          ...DEFAULT_ADMIN_CONFIG.bank,
          ...(parsed.bank || {}),
          mataPelajaran: (parsed.bank?.mataPelajaran && parsed.bank.mataPelajaran.length >= 7)
            ? parsed.bank.mataPelajaran
            : DEFAULT_ADMIN_CONFIG.bank.mataPelajaran,
          bidangAlQuran: DEFAULT_ADMIN_CONFIG.bank.bidangAlQuran,
          kurikulum: (() => {
            if (!parsed.bank?.kurikulum || parsed.bank.kurikulum.length <= 20) {
              return DEFAULT_ADMIN_CONFIG.bank.kurikulum;
            }
            // Auto-upgrade if stored kurikulum still has old spaced Arabic text
            const hasOldArabic = parsed.bank.kurikulum.some(
              (k: any) => k.mataPelajaran === 'Bahasa Arab' && typeof k.teks === 'string' && k.teks.includes('ال م ف ر د')
            );
            if (hasOldArabic) {
              return DEFAULT_ADMIN_CONFIG.bank.kurikulum;
            }
            return parsed.bank.kurikulum;
          })()
        },
        customPdfLayout: parsed.customPdfLayout || DEFAULT_ADMIN_CONFIG.customPdfLayout,
        jadualWaktu: parsed.jadualWaktu || DEFAULT_ADMIN_CONFIG.jadualWaktu
      };
    }
  } catch (err) {
    console.error('Ralat membaca admin config:', err);
  }
  // Initialize storage with default config
  saveAdminConfig(DEFAULT_ADMIN_CONFIG);
  return DEFAULT_ADMIN_CONFIG;
}

export function saveAdminConfig(cfg: AdminSchoolConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(cfg));
  } catch (err) {
    console.error('Ralat menyimpan admin config:', err);
  }
}

export function resetAdminConfigToDefault(): AdminSchoolConfig {
  saveAdminConfig(DEFAULT_ADMIN_CONFIG);
  return DEFAULT_ADMIN_CONFIG;
}

export function loadTeacherForm(): TeacherDailyForm {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEACHER);
    if (raw) {
      const parsed = JSON.parse(raw);
      const activeIdx = typeof parsed.activeSlotIndex === 'number' ? parsed.activeSlotIndex : 0;
      
      // Ensure slots array is populated
      let slots = parsed.slots;
      if (!Array.isArray(slots) || slots.length === 0) {
        slots = [
          {
            id: 'slot-1',
            tahun: parsed.tahun || DEFAULT_TEACHER_FORM.tahun,
            kelas: parsed.kelas || DEFAULT_TEACHER_FORM.kelas,
            masa: parsed.masa || DEFAULT_TEACHER_FORM.masa,
            mataPelajaran: parsed.mataPelajaran || DEFAULT_TEACHER_FORM.mataPelajaran,
            bidang: parsed.bidang !== undefined ? parsed.bidang : DEFAULT_TEACHER_FORM.bidang,
            tajuk: { ...DEFAULT_TEACHER_FORM.tajuk, ...(parsed.tajuk || {}) },
            subtajuk: { ...DEFAULT_TEACHER_FORM.subtajuk, ...(parsed.subtajuk || {}) },
            selectedObjektif: Array.isArray(parsed.selectedObjektif) ? parsed.selectedObjektif : DEFAULT_TEACHER_FORM.selectedObjektif,
            selectedAktiviti: Array.isArray(parsed.selectedAktiviti) ? parsed.selectedAktiviti : DEFAULT_TEACHER_FORM.selectedAktiviti,
            selectedKemahiran: { ...DEFAULT_TEACHER_FORM.selectedKemahiran, ...(parsed.selectedKemahiran || {}) },
            refleksi: { ...DEFAULT_TEACHER_FORM.refleksi, ...(parsed.refleksi || {}) },
            customValues: parsed.customValues || {}
          }
        ];
      }

      return {
        ...DEFAULT_TEACHER_FORM,
        ...parsed,
        tajuk: { ...DEFAULT_TEACHER_FORM.tajuk, ...(parsed.tajuk || {}) },
        subtajuk: { ...DEFAULT_TEACHER_FORM.subtajuk, ...(parsed.subtajuk || {}) },
        selectedKemahiran: { ...DEFAULT_TEACHER_FORM.selectedKemahiran, ...(parsed.selectedKemahiran || {}) },
        refleksi: { ...DEFAULT_TEACHER_FORM.refleksi, ...(parsed.refleksi || {}) },
        slots,
        activeSlotIndex: Math.min(Math.max(activeIdx, 0), slots.length - 1)
      };
    }
  } catch (err) {
    console.error('Ralat membaca borang guru:', err);
  }
  return DEFAULT_TEACHER_FORM;
}

export function saveTeacherForm(form: TeacherDailyForm): void {
  try {
    localStorage.setItem(STORAGE_KEY_TEACHER, JSON.stringify(form));
  } catch (err) {
    console.error('Ralat menyimpan borang guru:', err);
  }
}

export function resetTeacherForm(): TeacherDailyForm {
  saveTeacherForm(DEFAULT_TEACHER_FORM);
  return DEFAULT_TEACHER_FORM;
}

/**
 * Eksport fail konfigurasi sekolah (.json) untuk dikongsi kepada guru atau peranti lain.
 */
export function exportSchoolConfigFile(config: AdminSchoolConfig): void {
  const exportPayload = {
    app: 'editor-rph-kafa',
    type: 'school-config',
    version: '3.0',
    exportedAt: new Date().toISOString(),
    schoolName: config.namaSekolah,
    data: config
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (config.namaSekolah || 'sekolah').toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.href = url;
  a.download = `tetapan_kafa_${safeName}_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import fail konfigurasi sekolah (.json) dan sahkan struktur data.
 */
export async function importSchoolConfigFile(file: File): Promise<AdminSchoolConfig> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        // Accept both wrapped payload { app, type, data } or direct AdminSchoolConfig
        const rawConfig: Partial<AdminSchoolConfig> = parsed.data && parsed.type === 'school-config'
          ? parsed.data
          : parsed;

        if (!rawConfig || typeof rawConfig !== 'object') {
          throw new Error('Format fail tidak sah. Sila pastikan fail JSON yang betul.');
        }

        // Validate essentials
        if (!rawConfig.namaSekolah && !rawConfig.bank && !rawConfig.labelCustom) {
          throw new Error('Fail ini bukan fail konfigurasi sekolah KAFA yang sah.');
        }

        const merged: AdminSchoolConfig = {
          ...DEFAULT_ADMIN_CONFIG,
          ...rawConfig,
          labelCustom: {
            ...DEFAULT_ADMIN_CONFIG.labelCustom,
            ...(rawConfig.labelCustom || {})
          },
          bank: {
            ...DEFAULT_ADMIN_CONFIG.bank,
            ...(rawConfig.bank || {}),
            mataPelajaran: (rawConfig.bank?.mataPelajaran && rawConfig.bank.mataPelajaran.length > 0)
              ? rawConfig.bank.mataPelajaran
              : DEFAULT_ADMIN_CONFIG.bank.mataPelajaran,
            kurikulum: (rawConfig.bank?.kurikulum && rawConfig.bank.kurikulum.length > 0)
              ? rawConfig.bank.kurikulum
              : DEFAULT_ADMIN_CONFIG.bank.kurikulum
          },
          customPdfLayout: rawConfig.customPdfLayout || DEFAULT_ADMIN_CONFIG.customPdfLayout,
          jadualWaktu: rawConfig.jadualWaktu || DEFAULT_ADMIN_CONFIG.jadualWaktu
        };

        saveAdminConfig(merged);
        resolve(merged);
      } catch (err: any) {
        reject(new Error(err.message || 'Ralat membaca fail data sekolah.'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca fail daripada peranti.'));
    reader.readAsText(file);
  });
}

/**
 * Eksport sandaran borang RPH guru (.json)
 */
export function exportTeacherBackupFile(form: TeacherDailyForm): void {
  const exportPayload = {
    app: 'editor-rph-kafa',
    type: 'teacher-form-backup',
    version: '3.0',
    exportedAt: new Date().toISOString(),
    data: form
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sandaran_rph_${form.tarikh || new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import sandaran borang RPH guru (.json)
 */
export async function importTeacherBackupFile(file: File): Promise<TeacherDailyForm> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        const rawForm: Partial<TeacherDailyForm> = parsed.data && parsed.type === 'teacher-form-backup'
          ? parsed.data
          : parsed;

        if (!rawForm || typeof rawForm !== 'object') {
          throw new Error('Format fail sandaran guru tidak sah.');
        }

        const merged: TeacherDailyForm = {
          ...DEFAULT_TEACHER_FORM,
          ...rawForm,
          tajuk: { ...DEFAULT_TEACHER_FORM.tajuk, ...(rawForm.tajuk || {}) },
          subtajuk: { ...DEFAULT_TEACHER_FORM.subtajuk, ...(rawForm.subtajuk || {}) },
          selectedKemahiran: { ...DEFAULT_TEACHER_FORM.selectedKemahiran, ...(rawForm.selectedKemahiran || {}) },
          refleksi: { ...DEFAULT_TEACHER_FORM.refleksi, ...(rawForm.refleksi || {}) }
        };

        saveTeacherForm(merged);
        resolve(merged);
      } catch (err: any) {
        reject(new Error(err.message || 'Ralat membaca fail sandaran guru.'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca fail.'));
    reader.readAsText(file);
  });
}

/**
 * Simpan draf suntingan Panel Admin secara automatik bagi mengelak kehilangan data jika pelayar ter-refresh.
 */
export function saveAdminDraft(cfg: AdminSchoolConfig): void {
  try {
    const payload = {
      savedAt: new Date().toISOString(),
      config: cfg
    };
    localStorage.setItem(STORAGE_KEY_ADMIN_DRAFT, JSON.stringify(payload));
  } catch (err) {
    console.error('Ralat menyimpan draf admin:', err);
  }
}

/**
 * Muatkan draf belum simpan Panel Admin jika wujud.
 */
export function loadAdminDraft(): { savedAt: string; config: AdminSchoolConfig } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_DRAFT);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.config && typeof parsed.config === 'object') {
      return {
        savedAt: parsed.savedAt || new Date().toISOString(),
        config: parsed.config
      };
    }
  } catch (err) {
    console.error('Ralat membaca draf admin:', err);
  }
  return null;
}

/**
 * Padam draf sementara Panel Admin selepas disimpan atau diabaikan.
 */
export function clearAdminDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ADMIN_DRAFT);
  } catch (err) {
    console.error('Ralat memadam draf admin:', err);
  }
}

/**
 * Muatkan Jadual Waktu Mingguan peribadi guru (atau guna templat sekolah daripada Admin sebagai lalai).
 */
export function loadTeacherSchedule(fallback?: WeeklyScheduleMap): WeeklyScheduleMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEACHER_SCHEDULE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Ralat membaca jadual guru:', err);
  }
  return fallback ? JSON.parse(JSON.stringify(fallback)) : {};
}

/**
 * Simpan Jadual Waktu Mingguan peribadi guru.
 */
export function saveTeacherSchedule(schedule: WeeklyScheduleMap): void {
  try {
    localStorage.setItem(STORAGE_KEY_TEACHER_SCHEDULE, JSON.stringify(schedule));
  } catch (err) {
    console.error('Ralat menyimpan jadual guru:', err);
  }
}
