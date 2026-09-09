export type ScriptMode = 'jawi' | 'rumi';

export type AppPage = 'guru' | 'admin';

export interface LabelPair {
  jawi: string;
  rumi: string;
}

export interface BankSubtajukItem {
  kod: string;
  teks: string;
}

export interface BankTajukItem {
  id: string;
  kod: string;
  teks: string;
  mataPelajaran: string;
  bidang?: string; // Only for Al-Quran
  tahun?: string; // '1' | '2' | '3' | '4' | '5' | '6'
  subtajukList: BankSubtajukItem[];
  objektifList: string[]; // Murid dapat
  aktivitiList: string[]; // Murid diminta
}

export interface AdminSchoolConfig {
  adminPin: string; // Default: '1234'
  namaSekolah: string;
  subSlogan: string;
  namaGuruBesar: string;
  logoSekolah?: string; // Base64 data URL for uploaded school logo

  // Custom section titles (configurable by admin per school)
  labelCustom: {
    tarikh: LabelPair;
    hari: LabelPair;
    minggu: LabelPair;
    tahun: LabelPair;
    kelas: LabelPair;
    masa: LabelPair;
    mataPelajaran: LabelPair;
    bidang: LabelPair;
    tajuk: LabelPair;
    subtajuk: LabelPair;
    objektif: LabelPair; // cth: "Objektif Pembelajaran: Murid dapat"
    aktiviti: LabelPair; // cth: "Aktiviti: Murid diminta"
    kemahiran: LabelPair; // cth: "Kemahiran:"
    refleksi: LabelPair; // cth: "Refleksi Guru:"
    catatan: LabelPair; // cth: "Tindakan Susulan / Catatan Guru:"
    tandatangan: LabelPair; // cth: "Tandatangan:"
    tandatanganGuru: LabelPair; // cth: "Tandatangan Guru"
    tandatanganGuruBesar: LabelPair; // cth: "Tandatangan Guru Besar / Penyelaras"
  };

  // Dropdown Banks configured by Admin
  bank: {
    tahun: string[];
    kelas: string[];
    masa: string[];
    mataPelajaran: string[];
    bidangAlQuran: string[];
    kurikulum: BankTajukItem[]; // Relational cascading curriculum
    tajukList?: { kod: string; teks: string; mataPelajaran?: string }[];
    subtajukList?: { kod: string; teks: string; tajukKod?: string }[];
    objektifList?: string[]; // Fallback / general objectives
    aktivitiList?: string[]; // Fallback / general activities
    kemahiranList: { id: string; rumi: string; jawi: string }[];
    refleksiCatatanList: string[]; // Bank of reflection comments / follow-up actions
  };

  // Custom PDF Grid / Canva A4 Layout
  customPdfLayout?: CustomPdfLayoutConfig;
}

// ==========================================
// CANVA A4 PDF GRID BUILDER TYPES
// ==========================================
export type StandardPdfSectionId =
  | 'header'
  | 'tarikh'
  | 'hari'
  | 'minggu'
  | 'tahun'
  | 'kelas'
  | 'masa'
  | 'mataPelajaran'
  | 'bidang'
  | 'tajuk'
  | 'subtajuk'
  | 'objektif'
  | 'aktiviti'
  | 'kemahiran'
  | 'refleksiNisbah'
  | 'catatan'
  | 'tandatangan';

export type PdfSectionId = StandardPdfSectionId | string;

export interface CustomSectionDef {
  id: string;
  namaRumi: string;
  namaJawi: string;
  jenis: 'dropdown' | 'checkbox' | 'teks' | 'bullet' | 'statik';
  pilihanBank?: string[]; // Array of dropdown choices or checklist items
  nilaiLalai?: string;
}

export interface GridCellConfig {
  id: string; // unique cell id
  widthPercent?: number; // e.g. 33.33, 50, 42, 58, 100
  colSpan?: number;
  sectionId: PdfSectionId | null; // null if empty slot awaiting '+'
  labelOverride?: {
    rumi?: string;
    jawi?: string;
  };
}

export interface GridRowConfig {
  id: string; // unique row id
  cells: GridCellConfig[];
}

export interface SplitColumnConfig {
  id: string;
  widthPercent: number; // e.g. 42 or 58
  rows: GridRowConfig[];
}

export interface GridTableBlock {
  id: string; // unique table block id
  title?: string;
  type: 'table' | 'split-columns';
  rows?: GridRowConfig[]; // used when type === 'table'
  splitColumns?: {
    left: SplitColumnConfig;
    right: SplitColumnConfig;
  }; // used when type === 'split-columns'
}

export interface CustomPdfLayoutConfig {
  isEnabled: boolean;
  blocks: GridTableBlock[];
  customSections: CustomSectionDef[];
}

export interface TeacherDailyForm {
  tarikh: string;
  hari: string;
  minggu: string;
  tahun: string;
  kelas: string;
  masa: string;
  mataPelajaran: string;
  bidang: string | null;
  tajuk: {
    kod: string;
    teks: string;
  };
  subtajuk: {
    kod: string;
    teks: string;
  };
  selectedObjektif: string[];
  selectedAktiviti: string[];
  selectedKemahiran: {
    lisan: boolean;
    bertulis: boolean;
    pemerhatian: boolean;
    [key: string]: boolean;
  };
  refleksi: {
    muridMenguasai: string;
    muridTidakMenguasai: string;
    jumlahMurid: string;
    catatan: string;
  };
  customValues?: Record<string, any>;
  skrip: ScriptMode;
}

export interface RphData {
  tarikh: string;
  hari: string;
  minggu: string;
  tahun: string;
  kelas: string;
  masa: string;
  tajuk: {
    kod: string;
    teks: string;
  };
  subtajuk?: {
    kod: string;
    teks: string;
  };
  mataPelajaran: string;
  bidang: string | null;
  objektifPembelajaran: string[];
  aktivitiMurid: string[];
  kemahiran: {
    lisan: boolean;
    bertulis: boolean;
    pemerhatian: boolean;
    [key: string]: boolean;
  };
  refleksi: {
    muridMenguasai: string;
    muridTidakMenguasai: string;
    jumlahMurid: string;
    catatan: string;
  };
  customValues?: Record<string, any>;
  skrip: ScriptMode;
}
