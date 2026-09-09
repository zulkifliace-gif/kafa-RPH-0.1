import { AdminSchoolConfig, TeacherDailyForm } from '../types/rph';
import { KURIKULUM_PENJAJARAN_2025 } from '../data/kurikulumPenjajaran2025';
import { DEFAULT_CANVA_LAYOUT } from './gridPresets';

export const DEFAULT_ADMIN_CONFIG: AdminSchoolConfig = {
  adminPin: "1234",
  namaSekolah: "KAFA INTEGRASI NURUL IMAN",
  subSlogan: "Tapak Standard Kurikulum KAFA (JAKIM / JAIN)",
  namaGuruBesar: "USTAZAH FATIMAH BINTI AHMAD",
  customPdfLayout: DEFAULT_CANVA_LAYOUT,

  labelCustom: {
    tarikh: { jawi: "تاريخ", rumi: "Tarikh" },
    hari: { jawi: "هاري", rumi: "Hari" },
    minggu: { jawi: "ميڠݢو", rumi: "Minggu" },
    tahun: { jawi: "تاهون", rumi: "Tahun" },
    kelas: { jawi: "کلس", rumi: "Kelas" },
    masa: { jawi: "ماس", rumi: "Masa" },
    mataPelajaran: { jawi: "مات ڤالجرن", rumi: "Mata Pelajaran" },
    bidang: { jawi: "بيدڠ", rumi: "Bidang" },
    tajuk: { jawi: "تاجوق", rumi: "Tajuk" },
    subtajuk: { jawi: "سوبتاجوق", rumi: "Subtajuk" },
    objektif: { jawi: "اوبجيکتيف ڤمبالجرن: موريد داڤت", rumi: "Objektif Pembelajaran: Murid dapat" },
    aktiviti: { jawi: "اکتيۏيتي: موريد دمينتا", rumi: "Aktiviti: Murid diminta" },
    kemahiran: { jawi: "کماهيرن:", rumi: "Kemahiran:" },
    refleksi: { jawi: "رفليکسي ڬورو:", rumi: "Refleksi Guru:" },
    catatan: { jawi: "چاتتن / تيندقن سوسولن", rumi: "Tindakan Susulan / Catatan Guru" },
    tandatangan: { jawi: "تانداتاڠن", rumi: "Tandatangan" },
    tandatanganGuru: { jawi: "تانداتاڠن ڬورو", rumi: "Tandatangan Guru" },
    tandatanganGuruBesar: { jawi: "تانداتاڠن ڬورو بسر / ڤڽلارس", rumi: "Tandatangan Guru Besar / Penyelaras" }
  },
  logoSekolah: "",

  bank: {
    tahun: ["1", "2", "3", "4", "5", "6"],
    kelas: [
      "Umar",
      "Bilal",
      "Uthman",
      "Ali",
      "Hamzah",
      "Zubair",
      "Aisyah",
      "Fatimah",
      "Khadijah"
    ],
    masa: [
      "2.30 - 3.30",
      "3.30 - 4.30",
      "2.30 - 4.30",
      "4.30 - 5.30",
      "5.30 - 6.30"
    ],
    mataPelajaran: [
      "Al-Quran",
      "Akidah",
      "Ibadah",
      "Sirah",
      "Adab",
      "Jawi",
      "Bahasa Arab"
    ],
    bidangAlQuran: [
      "Tilawah",
      "Hafazan",
      "Kefahaman",
      "Tajwid"
    ],
    kurikulum: KURIKULUM_PENJAJARAN_2025,
    tajukList: KURIKULUM_PENJAJARAN_2025.map((k) => ({
      kod: k.kod,
      teks: k.teks,
      mataPelajaran: k.mataPelajaran
    })),
    subtajukList: KURIKULUM_PENJAJARAN_2025.flatMap((k) =>
      k.subtajukList.map((st) => ({
        kod: st.kod,
        teks: st.teks,
        tajukKod: k.kod
      }))
    ),
    objektifList: [
      "Menyatakan pengertian bersyukur dengan jelas.",
      "Membaca dalil naqli kewajipan bersyukur dengan bimbingan guru.",
      "Membaca ayat dengan sebutan makhraj huruf dan tajwid yang betul.",
      "Menyebut dan menyenaraikan fakta pelajaran dengan tepat.",
      "Menjelaskan contoh pengamalan adab dalam kehidupan harian.",
      "Menulis perkataan/ayat dengan ejaan yang betul."
    ],
    aktivitiList: [
      "Melengkapkan pengertian bersyukur dihadapan kelas.",
      "Mendengar penerangan guru dan kaedah talaqqi musyafahah.",
      "Membaca ayat / petikan secara berpasangan dan kumpulan kecil.",
      "Aktiviti sumbang saran dan perbincangan berkumpulan.",
      "Latihan bertulis / lembaran kerja pengukuhan.",
      "Soal jawab spontan antara murid dan guru."
    ],
    kemahiranList: [
      { id: "lisan", rumi: "Lisan", jawi: "ليسن" },
      { id: "bertulis", rumi: "Bertulis", jawi: "برتوليس" },
      { id: "pemerhatian", rumi: "Pemerhatian", jawi: "ڤمرهاتين" }
    ],
    refleksiCatatanList: [
      "Majoriti murid menguasai objektif pembelajaran dengan baik dan aktif melibatkan diri.",
      "Guru perlu pelbagaikan lagi BBM untuk menarik minat murid dalam pelajaran.",
      "Guru akan menjalankan bimbingan tasmi' individu bagi murid yang belum lancar sebutan.",
      "Latihan pengukuhan tambahan diberikan untuk murid yang belum menguasai.",
      "Aktiviti pengayaan diberikan kepada murid yang telah mencapai tahap cemerlang."
    ]
  }
};

export const DEFAULT_TEACHER_FORM: TeacherDailyForm = {
  tarikh: "2026-09-07",
  hari: "Isnin",
  minggu: "31",
  tahun: "5",
  kelas: "Umar",
  masa: "2.30 - 3.30",
  mataPelajaran: "Adab",
  bidang: null,
  tajuk: {
    kod: "5.8",
    teks: "Adab Bersyukur"
  },
  subtajuk: {
    kod: "5.8.1",
    teks: "Pengertian Bersyukur dan Dalil"
  },
  selectedObjektif: [
    "Menyatakan pengertian bersyukur dengan jelas."
  ],
  selectedAktiviti: [
    "Melengkapkan pengertian bersyukur dihadapan kelas."
  ],
  selectedKemahiran: {
    lisan: true,
    bertulis: false,
    pemerhatian: false
  },
  refleksi: {
    muridMenguasai: "7",
    muridTidakMenguasai: "3",
    jumlahMurid: "10",
    catatan: "Guru perlu pelbagaikan lagi BBM untuk menarik minat murid dalam pelajaran."
  },
  skrip: "jawi"
};

export const HARI_OPTIONS = [
  { value: "Isnin", labelRumi: "Isnin", labelJawi: "اثنين", dayIndex: 1 },
  { value: "Selasa", labelRumi: "Selasa", labelJawi: "ثلاثاء", dayIndex: 2 },
  { value: "Rabu", labelRumi: "Rabu", labelJawi: "رابو", dayIndex: 3 },
  { value: "Khamis", labelRumi: "Khamis", labelJawi: "خميس", dayIndex: 4 },
  { value: "Jumaat", labelRumi: "Jumaat", labelJawi: "جمعة", dayIndex: 5 },
  { value: "Sabtu", labelRumi: "Sabtu", labelJawi: "سبتو", dayIndex: 6 },
  { value: "Ahad", labelRumi: "Ahad", labelJawi: "أحد", dayIndex: 0 }
];
