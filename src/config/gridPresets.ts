import { CustomPdfLayoutConfig, StandardPdfSectionId } from '../types/rph';

export interface StandardSectionMeta {
  id: StandardPdfSectionId;
  namaRumi: string;
  namaJawi: string;
  kategori: 'header' | 'waktu' | 'maklumat' | 'kandungan' | 'pentaksiran' | 'pengesahan';
  penerangan: string;
  badgeColor: string;
}

export const SENARAI_BAHAGIAN_STANDARD: StandardSectionMeta[] = [
  {
    id: 'header',
    namaRumi: 'Pengepala & Nama Sekolah',
    namaJawi: 'کڤالا دوکومن & نام سکوله',
    kategori: 'header',
    penerangan: 'Nama sekolah huruf tebal, logo "ق" dan tajuk rasmi RPH KAFA',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'tarikh',
    namaRumi: 'Tarikh',
    namaJawi: 'تاريخ',
    kategori: 'waktu',
    penerangan: 'Paparan tarikh sesi pengajaran',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    id: 'hari',
    namaRumi: 'Hari',
    namaJawi: 'هاري',
    kategori: 'waktu',
    penerangan: 'Nama hari persekolahan (Isnin - Jumaat / Ahad)',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    id: 'minggu',
    namaRumi: 'Minggu',
    namaJawi: 'ميڠݢو',
    kategori: 'waktu',
    penerangan: 'Nombor minggu persekolahan semasa',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    id: 'tahun',
    namaRumi: 'Tahun',
    namaJawi: 'تاهون',
    kategori: 'maklumat',
    penerangan: 'Tingkatan / tahun murid (Tahun 1 hingga 6)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    id: 'masa',
    namaRumi: 'Masa',
    namaJawi: 'ماس',
    kategori: 'maklumat',
    penerangan: 'Waktu mula dan tamat sesi PdP',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    id: 'kelas',
    namaRumi: 'Kelas',
    namaJawi: 'کلس',
    kategori: 'maklumat',
    penerangan: 'Nama kelas murid (cth: 1 Abu Bakar)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    id: 'mataPelajaran',
    namaRumi: 'Mata Pelajaran',
    namaJawi: 'مات ڤالجرن',
    kategori: 'maklumat',
    penerangan: 'Subjek yang diajar (Al-Quran, Akidah, Ibadah, Sirah, dll.)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'bidang',
    namaRumi: 'Bidang (Al-Quran)',
    namaJawi: 'بيدڠ',
    kategori: 'maklumat',
    penerangan: 'Bidang khusus bagi subjek Al-Quran (Tilawah, Hafazan, Tajwid, dll.)',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    id: 'tajuk',
    namaRumi: 'Tajuk',
    namaJawi: 'تاجوق',
    kategori: 'kandungan',
    penerangan: 'Tajuk utama pembelajaran berserta kod DSKP',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  {
    id: 'subtajuk',
    namaRumi: 'Subtajuk',
    namaJawi: 'سوبتاجوق',
    kategori: 'kandungan',
    penerangan: 'Pecahan tajuk yang lebih khusus (pilihan)',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  {
    id: 'objektif',
    namaRumi: 'Objektif: Murid dapat',
    namaJawi: 'اوبجيکتيف ڤمبلاجرن: موريد داڤت',
    kategori: 'kandungan',
    penerangan: 'Senarai objektif hasil pembelajaran PdP',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300'
  },
  {
    id: 'aktiviti',
    namaRumi: 'Aktiviti: Murid diminta',
    namaJawi: 'اَکتيۏيتي: موريد دمينتا',
    kategori: 'kandungan',
    penerangan: 'Senarai aktiviti pengajaran & pembelajaran dalam kelas',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  {
    id: 'kemahiran',
    namaRumi: 'Kemahiran Pentaksiran',
    namaJawi: 'کمهاريرن',
    kategori: 'pentaksiran',
    penerangan: 'Kotak semakan pentaksiran (Lisan, Bertulis, Pemerhatian)',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300'
  },
  {
    id: 'refleksiNisbah',
    namaRumi: 'Refleksi Nisbah Murid',
    namaJawi: 'ريفليکسي (نيسبه موريد)',
    kategori: 'pentaksiran',
    penerangan: 'Nisbah murid menguasai & belum menguasai PdP',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  {
    id: 'catatan',
    namaRumi: 'Tindakan Susulan / Catatan Refleksi',
    namaJawi: 'چاتتن / تيندقن سوسولن',
    kategori: 'pentaksiran',
    penerangan: 'Ulasan catatan guru dan tindakan susulan intervensi',
    badgeColor: 'bg-stone-100 text-stone-800 border-stone-300'
  },
  {
    id: 'tandatangan',
    namaRumi: 'Tandatangan & Pengesahan',
    namaJawi: 'تانداتاڠن ڬورو & ڬورو بسر',
    kategori: 'pengesahan',
    penerangan: 'Ruang tandatangan Guru dan Pengesahan Guru Besar/Penyelaras',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300'
  }
];

// Preset 1: Susunan Tapak Asal KAFA (2 Lajur Klasik)
export const PRESET_TAPAK_ASAL: CustomPdfLayoutConfig = {
  isEnabled: true,
  customSections: [],
  blocks: [
    {
      id: 'blk-header',
      title: 'Kepala Dokumen',
      type: 'table',
      rows: [
        {
          id: 'row-header',
          cells: [{ id: 'cell-header', widthPercent: 100, sectionId: 'header' }]
        }
      ]
    },
    {
      id: 'blk-waktu',
      title: 'Jadual Waktu Teratas (3 Petak)',
      type: 'table',
      rows: [
        {
          id: 'row-waktu',
          cells: [
            { id: 'cell-tarikh', widthPercent: 33.33, sectionId: 'tarikh' },
            { id: 'cell-hari', widthPercent: 33.33, sectionId: 'hari' },
            { id: 'cell-minggu', widthPercent: 33.34, sectionId: 'minggu' }
          ]
        }
      ]
    },
    {
      id: 'blk-utama-2-lajur',
      title: 'Bahagian Utama Tapak (2 Lajur)',
      type: 'split-columns',
      splitColumns: {
        // Dalam RTL (Jawi): Lajur Kanan ialah Info & Refleksi, Lajur Kiri ialah Kandungan PdP
        right: {
          id: 'col-info-sesi',
          widthPercent: 42,
          rows: [
            { id: 'row-tahun', cells: [{ id: 'c-tahun', widthPercent: 100, sectionId: 'tahun' }] },
            { id: 'row-masa', cells: [{ id: 'c-masa', widthPercent: 100, sectionId: 'masa' }] },
            { id: 'row-kelas', cells: [{ id: 'c-kelas', widthPercent: 100, sectionId: 'kelas' }] },
            { id: 'row-matapelajaran', cells: [{ id: 'c-matapelajaran', widthPercent: 100, sectionId: 'mataPelajaran' }] },
            { id: 'row-bidang', cells: [{ id: 'c-bidang', widthPercent: 100, sectionId: 'bidang' }] },
            { id: 'row-refleksinisbah', cells: [{ id: 'c-refleksinisbah', widthPercent: 100, sectionId: 'refleksiNisbah' }] }
          ]
        },
        left: {
          id: 'col-kandungan-pdp',
          widthPercent: 58,
          rows: [
            { id: 'row-tajuk', cells: [{ id: 'c-tajuk', widthPercent: 100, sectionId: 'tajuk' }] },
            { id: 'row-subtajuk', cells: [{ id: 'c-subtajuk', widthPercent: 100, sectionId: 'subtajuk' }] },
            { id: 'row-objektif', cells: [{ id: 'c-objektif', widthPercent: 100, sectionId: 'objektif' }] },
            { id: 'row-aktiviti', cells: [{ id: 'c-aktiviti', widthPercent: 100, sectionId: 'aktiviti' }] },
            { id: 'row-kemahiran', cells: [{ id: 'c-kemahiran', widthPercent: 100, sectionId: 'kemahiran' }] },
            { id: 'row-catatan', cells: [{ id: 'c-catatan', widthPercent: 100, sectionId: 'catatan' }] }
          ]
        }
      }
    },
    {
      id: 'blk-footer',
      title: 'Pengesahan & Tandatangan',
      type: 'table',
      rows: [
        {
          id: 'row-footer',
          cells: [{ id: 'cell-footer', widthPercent: 100, sectionId: 'tandatangan' }]
        }
      ]
    }
  ]
};

// Preset 2: Moden Grid Penuh (1 & 3 Lajur Tegak)
export const PRESET_MODEN: CustomPdfLayoutConfig = {
  isEnabled: true,
  customSections: [],
  blocks: [
    {
      id: 'm-blk-header',
      title: 'Pengepala Dokumen',
      type: 'table',
      rows: [
        { id: 'm-row-header', cells: [{ id: 'mc-header', widthPercent: 100, sectionId: 'header' }] }
      ]
    },
    {
      id: 'm-blk-waktu',
      title: 'Tarikh, Hari, Minggu',
      type: 'table',
      rows: [
        {
          id: 'm-row-waktu',
          cells: [
            { id: 'mc-tarikh', widthPercent: 33.33, sectionId: 'tarikh' },
            { id: 'mc-hari', widthPercent: 33.33, sectionId: 'hari' },
            { id: 'mc-minggu', widthPercent: 33.34, sectionId: 'minggu' }
          ]
        }
      ]
    },
    {
      id: 'm-blk-kelas',
      title: 'Tahun, Kelas, Masa',
      type: 'table',
      rows: [
        {
          id: 'm-row-kelas',
          cells: [
            { id: 'mc-tahun', widthPercent: 33.33, sectionId: 'tahun' },
            { id: 'mc-kelas', widthPercent: 33.33, sectionId: 'kelas' },
            { id: 'mc-masa', widthPercent: 33.34, sectionId: 'masa' }
          ]
        }
      ]
    },
    {
      id: 'm-blk-subjek',
      title: 'Mata Pelajaran & Bidang',
      type: 'table',
      rows: [
        {
          id: 'm-row-subjek',
          cells: [
            { id: 'mc-subjek', widthPercent: 66.66, sectionId: 'mataPelajaran' },
            { id: 'mc-bidang', widthPercent: 33.34, sectionId: 'bidang' }
          ]
        }
      ]
    },
    {
      id: 'm-blk-tajuk',
      title: 'Tajuk & Subtajuk',
      type: 'table',
      rows: [
        { id: 'm-row-tajuk', cells: [{ id: 'mc-tajuk', widthPercent: 100, sectionId: 'tajuk' }] },
        { id: 'm-row-subtajuk', cells: [{ id: 'mc-subtajuk', widthPercent: 100, sectionId: 'subtajuk' }] }
      ]
    },
    {
      id: 'm-blk-objektif',
      title: 'Objektif & Aktiviti',
      type: 'table',
      rows: [
        { id: 'm-row-objektif', cells: [{ id: 'mc-objektif', widthPercent: 100, sectionId: 'objektif' }] },
        { id: 'm-row-aktiviti', cells: [{ id: 'mc-aktiviti', widthPercent: 100, sectionId: 'aktiviti' }] }
      ]
    },
    {
      id: 'm-blk-pentaksiran',
      title: 'Kemahiran, Refleksi & Catatan',
      type: 'table',
      rows: [
        { id: 'm-row-kemahiran', cells: [{ id: 'mc-kemahiran', widthPercent: 100, sectionId: 'kemahiran' }] },
        { id: 'm-row-refleksi', cells: [{ id: 'mc-refleksi', widthPercent: 100, sectionId: 'refleksiNisbah' }] },
        { id: 'm-row-catatan', cells: [{ id: 'mc-catatan', widthPercent: 100, sectionId: 'catatan' }] }
      ]
    },
    {
      id: 'm-blk-footer',
      title: 'Tandatangan',
      type: 'table',
      rows: [
        { id: 'm-row-footer', cells: [{ id: 'mc-footer', widthPercent: 100, sectionId: 'tandatangan' }] }
      ]
    }
  ]
};

// Preset 3: Canva Kosong
export const PRESET_BLANK: CustomPdfLayoutConfig = {
  isEnabled: true,
  customSections: [],
  blocks: []
};

export const DEFAULT_CANVA_LAYOUT = PRESET_TAPAK_ASAL;
