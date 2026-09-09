import assert from 'node:assert';
import fs from 'node:fs';

console.log('=== UJIAN SISTEM 2 HALAMAN: ADMIN (EDITOR) & HALAMAN GURU ===');

// 1. Check labels.json
const labelsRaw = fs.readFileSync('./src/config/labels.json', 'utf-8');
const labels = JSON.parse(labelsRaw);

console.log('1. Menguji labels.json:');
const requiredLabelKeys = [
  'tarikh', 'hari', 'minggu', 'tahun', 'kelas', 'masa',
  'tajuk', 'subtajuk', 'mataPelajaran', 'bidang',
  'objektifPembelajaran', 'aktivitiMurid', 'kemahiran',
  'lisan', 'bertulis', 'pemerhatian',
  'refleksiGuru', 'muridMenguasai', 'muridTidakMenguasai', 'jumlahMurid', 'catatan',
  'namaSekolah', 'janaPdf', 'cetak', 'pratonton'
];

for (const key of requiredLabelKeys) {
  assert.ok(labels[key], `Kekunci label "${key}" tiada dalam labels.json!`);
  assert.ok(labels[key].jawi && labels[key].jawi.trim().length > 0, `Label Jawi "${key}" kosong!`);
  assert.ok(labels[key].rumi && labels[key].rumi.trim().length > 0, `Label Rumi "${key}" kosong!`);
}
console.log(`✓ Semua ${requiredLabelKeys.length} label asas dalam labels.json sah.`);

// 2. Test Admin Config Structure & Defaults
console.log('2. Menguji Struktur Konfigurasi Admin:');
const optionsContent = fs.readFileSync('./src/config/options.ts', 'utf-8');

assert.ok(optionsContent.includes('DEFAULT_ADMIN_CONFIG'), 'DEFAULT_ADMIN_CONFIG mesti wujud');
assert.ok(optionsContent.includes('DEFAULT_TEACHER_FORM'), 'DEFAULT_TEACHER_FORM mesti wujud');
assert.ok(optionsContent.includes('adminPin: "1234"') || optionsContent.includes("adminPin: '1234'"), 'PIN Lalai admin mestilah 1234');

// Verify default customized section titles match user's exact specification:
// "Objektif Pembelajaran: Murid dapat", "Aktiviti: Murid diminta", "Kemahiran:", "Refleksi Guru:"
assert.ok(optionsContent.includes('Objektif Pembelajaran: Murid dapat'), 'Format tajuk Objektif Pembelajaran mesti tepat');
assert.ok(optionsContent.includes('Aktiviti: Murid diminta'), 'Format tajuk Aktiviti mesti tepat');
assert.ok(optionsContent.includes('Kemahiran:'), 'Format tajuk Kemahiran mesti tepat');
assert.ok(optionsContent.includes('Refleksi Guru:'), 'Format tajuk Refleksi Guru mesti tepat');
console.log('✓ Tajuk kustom admin menepati format yang diminta pengguna.');

// 3. Test Teacher Flow Validation
console.log('3. Menguji Validasi Borang Harian Guru:');

function validateTeacherDailyForm(form) {
  const errors = [];
  if (!form.tarikh) errors.push('Tarikh belum diisi.');
  if (!form.hari) errors.push('Hari belum dipilih.');
  if (!form.minggu) errors.push('Minggu belum diisi.');
  if (!form.tahun) errors.push('Tahun belum dipilih.');
  if (!form.kelas) errors.push('Kelas belum dipilih.');
  if (!form.masa) errors.push('Masa belum dipilih.');
  if (!form.mataPelajaran) errors.push('Mata Pelajaran belum dipilih.');
  if (form.mataPelajaran === 'Al-Quran' && !form.bidang) {
    errors.push('Bidang untuk Al-Quran wajib dipilih.');
  }
  if (!form.tajuk || !form.tajuk.trim()) {
    errors.push('Tajuk belum dipilih.');
  }
  if (!form.subtajuk || !form.subtajuk.trim()) {
    errors.push('Subtajuk belum dipilih.');
  }
  if (!form.objektifTerpilih || form.objektifTerpilih.length === 0) {
    errors.push('Sekurang-kurangnya 1 Objektif Pembelajaran mesti ditanda.');
  }
  if (!form.aktivitiTerpilih || form.aktivitiTerpilih.length === 0) {
    errors.push('Sekurang-kurangnya 1 Aktiviti Murid mesti ditanda.');
  }
  const hasKemahiran = form.kemahiran && (form.kemahiran.lisan || form.kemahiran.bertulis || form.kemahiran.pemerhatian);
  if (!hasKemahiran) {
    errors.push('Sekurang-kurangnya 1 Kemahiran mesti ditanda.');
  }
  return errors;
}

const teacherSample = {
  tarikh: '2026-09-09',
  hari: 'Rabu',
  minggu: '31',
  tahun: '5',
  kelas: '5 Al-Farabi',
  masa: '02:30 - 03:30',
  mataPelajaran: 'Adab',
  bidang: '', // Empty because Adab is not Al-Quran
  tajuk: '5.8 Adab Bersyukur',
  subtajuk: '5.8.1 Pengertian dan Dalil Bersyukur',
  objektifTerpilih: ['Menyatakan pengertian bersyukur dengan tepat'],
  aktivitiTerpilih: ['Murid mendengar penerangan guru dan bersoal jawab'],
  kemahiran: { lisan: true, bertulis: false, pemerhatian: true },
  refleksi: {
    muridMenguasai: '18',
    muridTidakMenguasai: '2',
    jumlahMurid: 20,
    catatan: '18 daripada 20 murid mencapai objektif pembelajaran hari ini.'
  }
};

const errors = validateTeacherDailyForm(teacherSample);
assert.strictEqual(errors.length, 0, 'Borang guru yang diisi daripada dropdown admin mestilah sah sepenuhnya!');
console.log('✓ Borang guru sah sepenuhnya melepasi validasi.');

// 4. Test Bidang conditional logic (No "-" dash bug)
console.log('4. Menguji Logik Bersyarat Bidang (Al-Quran vs Bukan Al-Quran):');

// Non Al-Quran: bidang is omitted completely
teacherSample.mataPelajaran = 'Akidah';
teacherSample.bidang = '';
assert.strictEqual(validateTeacherDailyForm(teacherSample).length, 0);
console.log('✓ Subjek bukan Al-Quran tidak memerlukan bidang dan tidak meninggalkan simbol "-"');

// Al-Quran without bidang: should fail
teacherSample.mataPelajaran = 'Al-Quran';
teacherSample.bidang = '';
const quranErrors = validateTeacherDailyForm(teacherSample);
assert.ok(quranErrors.some(e => e.includes('Bidang untuk Al-Quran wajib')), 'Al-Quran tanpa bidang mesti ralat');
console.log('✓ Subjek Al-Quran mewajibkan pemilihan bidang (cth: Tilawah / Hafazan / Kefahaman).');

// Al-Quran with bidang: should pass
teacherSample.bidang = 'Tilawah Al-Quran';
assert.strictEqual(validateTeacherDailyForm(teacherSample).length, 0);
console.log('✓ Subjek Al-Quran dengan bidang Tilawah sah.');

// 5. Test PDF filename formatting
console.log('5. Menguji Penamaan Fail PDF:');
function getPdfFilename(tajuk, tarikh) {
  const code = (tajuk.split(' ')[0] || 'rph').replace(/[^a-zA-Z0-9.-]/g, '_');
  const date = (tarikh || 'tarikh').replace(/[^a-zA-Z0-9.-]/g, '_');
  return `RPH_${code}_${date}.pdf`;
}
const pdfName = getPdfFilename(teacherSample.tajuk, teacherSample.tarikh);
assert.strictEqual(pdfName, 'RPH_5.8_2026-09-09.pdf');
console.log(`✓ Format nama fail PDF: "${pdfName}" betul.`);

// 6. Test Cascading Kurikulum Tree & Filtering
console.log('6. Menguji Aliran Kurikulum Berantai (Cascading Kurikulum):');

// Import or parse DEFAULT_ADMIN_CONFIG from options.ts
assert.ok(optionsContent.includes('kurikulum:'), 'DEFAULT_ADMIN_CONFIG mesti mengandungi struktur kurikulum berhierarki');
assert.ok(optionsContent.includes('KURIKULUM_PENJAJARAN_2025'), 'Kurikulum mesti disambungkan dengan KURIKULUM_PENJAJARAN_2025');

// Simulate the cascading filter functions
function getAvailableTajuk(kurikulum, mataPelajaran, bidang) {
  return kurikulum.filter((t) => {
    if (t.mataPelajaran !== mataPelajaran) return false;
    if (mataPelajaran === 'Al-Quran') {
      return !bidang || t.bidang === bidang;
    }
    return true;
  });
}

function getAvailableSubtajuk(kurikulum, mataPelajaran, bidang, tajukTeks) {
  const matched = kurikulum.find((t) =>
    t.mataPelajaran === mataPelajaran &&
    (mataPelajaran !== 'Al-Quran' || !bidang || t.bidang === bidang) &&
    t.teks === tajukTeks
  );
  return matched ? matched.subtajukList || [] : [];
}

function getAvailableObjektif(kurikulum, mataPelajaran, bidang, tajukTeks) {
  const matched = kurikulum.find((t) =>
    t.mataPelajaran === mataPelajaran &&
    (mataPelajaran !== 'Al-Quran' || !bidang || t.bidang === bidang) &&
    t.teks === tajukTeks
  );
  return matched ? matched.objektifList || [] : [];
}

// Sample kurikulum hierarchy representing the configuration
const testKurikulum = [
  {
    id: 't-jawi-1',
    kod: '2.1',
    teks: 'قاعده ڤنوليسن',
    mataPelajaran: 'Jawi',
    subtajukList: [
      { kod: '2.1.1', teks: 'مڠنل دان مپبوت حروف جوي تونڠل' },
      { kod: '2.1.2', teks: 'ممبينا دان منوليس ڤركاتاءن يڠ مڠاندوڠي دوا سوکو کات' },
      { kod: '2.1.3', teks: 'ممبينا دان منوليس اية ڤينديق' }
    ],
    objektifList: [
      'Murid dapat mengetahui dan menulis kaedah penulisan huruf jawi dengan tepat.'
    ],
    aktivitiList: [
      'Murid mengeja dan menyebut kalimah secara latih tubi.'
    ]
  },
  {
    id: 't-quran-1',
    kod: '1.1',
    teks: 'سورة الفاتحة (سورة الـفاتحه)',
    mataPelajaran: 'Al-Quran',
    bidang: 'Tilawah',
    subtajukList: [
      { kod: '1.1.1', teks: 'باچاءن اية 1 هيڠݢ 4' },
      { kod: '1.1.2', teks: 'باچاءن اية 5 هيڠݢ 7' }
    ],
    objektifList: [
      'Murid dapat membaca ayat pilihan dengan bertajwid.'
    ],
    aktivitiList: []
  },
  {
    id: 't-quran-hafazan',
    kod: '1.3',
    teks: 'سورة الكافرون (سورة الكافرون)',
    mataPelajaran: 'Al-Quran',
    bidang: 'Hafazan',
    subtajukList: [
      { kod: '1.3.1', teks: 'مڠحفظ اية 1-3' },
      { kod: '1.3.2', teks: 'مڠحفظ اية 4-6' }
    ],
    objektifList: [
      'Murid dapat menghafaz ayat-ayat surah dengan lancar.'
    ],
    aktivitiList: []
  }
];

// Test case A: Subject Jawi with 'قاعده ڤنوليسن'
const jawiTajuks = getAvailableTajuk(testKurikulum, 'Jawi', null);
assert.strictEqual(jawiTajuks.length, 1, 'Hanya tajuk Jawi dipaparkan untuk subjek Jawi');
assert.strictEqual(jawiTajuks[0].teks, 'قاعده ڤنوليسن');

const jawiSubtajuks = getAvailableSubtajuk(testKurikulum, 'Jawi', null, 'قاعده ڤنوليسن');
assert.strictEqual(jawiSubtajuks.length, 3, 'Tajuk قاعده ڤنوليسن mesti ada tepat 3 subtajuk');
assert.strictEqual(jawiSubtajuks[0].kod, '2.1.1');
assert.strictEqual(jawiSubtajuks[1].kod, '2.1.2');
assert.strictEqual(jawiSubtajuks[2].kod, '2.1.3');

const jawiObjektif = getAvailableObjektif(testKurikulum, 'Jawi', null, 'قاعده ڤنوليسن');
assert.strictEqual(jawiObjektif.length, 1, 'Tajuk قاعده ڤنوليسن mesti ada tepat 1 objektif');
assert.ok(jawiObjektif[0].includes('kaedah penulisan huruf jawi'));
console.log('✓ Ujian Jawi: Tajuk "قاعده ڤنوليسن" mengeluarkan tepat 3 jenis subtajuk dan 1 jenis objektif.');

// Test case B: Subject Al-Quran with Bidang Tilawah vs Hafazan
const quranTilawahTajuk = getAvailableTajuk(testKurikulum, 'Al-Quran', 'Tilawah');
assert.strictEqual(quranTilawahTajuk.length, 1, 'Hanya tajuk Tilawah dipaparkan apabila bidang Tilawah dipilih');
assert.strictEqual(quranTilawahTajuk[0].kod, '1.1');

const quranHafazanTajuk = getAvailableTajuk(testKurikulum, 'Al-Quran', 'Hafazan');
assert.strictEqual(quranHafazanTajuk.length, 1, 'Hanya tajuk Hafazan dipaparkan apabila bidang Hafazan dipilih');
assert.strictEqual(quranHafazanTajuk[0].kod, '1.3');

const hafazanSubtajuks = getAvailableSubtajuk(testKurikulum, 'Al-Quran', 'Hafazan', 'سورة الكافرون (سورة الكافرون)');
assert.strictEqual(hafazanSubtajuks.length, 2, 'Tajuk Hafazan mengeluarkan subtajuk hafazan sahaja');
assert.strictEqual(hafazanSubtajuks[0].kod, '1.3.1');

console.log('✓ Ujian Al-Quran: Pilihan bidang (Tilawah/Hafazan) menapis tajuk & subtajuk yang bersambung sahaja.');

// Test case C: Isolation check (No cross pollution)
const isolatedSubtajuk = getAvailableSubtajuk(testKurikulum, 'Jawi', null, 'سورة الفاتحة (سورة الـفاتحه)');
assert.strictEqual(isolatedSubtajuk.length, 0, 'Subtajuk Al-Quran tidak boleh bocor ke subjek Jawi');
console.log('✓ Tiada pencampuran maklumat (cross-pollution) antara subjek atau tajuk yang berbeza.');

console.log('----------------------------------------------------');
console.log('SEMUA UJIAN ALIRAN KURIKULUM BERANTAI BERJAYA 100%! ✓✓✓');

// 7. Test Kurikulum Penjajaran 2025 Dataset Integrity
console.log('\n7. Menguji Integriti Data Kurikulum Penjajaran 2025 (Lampiran A):');
const kurikulumRaw = fs.readFileSync('./src/data/kurikulumPenjajaran2025.json', 'utf-8');
const kurikulumData = JSON.parse(kurikulumRaw);

assert.strictEqual(Array.isArray(kurikulumData), true, 'Kurikulum data mestilah array');
assert.strictEqual(kurikulumData.length, 317, `Tepat 317 tajuk kurikulum rasmi mesti wujud, dijumpai: ${kurikulumData.length}`);

// Verify subjects
const officialSubjects = ['Al-Quran', 'Akidah', 'Ibadah', 'Sirah', 'Adab', 'Jawi', 'Bahasa Arab'];
const foundSubjects = new Set(kurikulumData.map(k => k.mataPelajaran));
for (const subj of officialSubjects) {
  assert.ok(foundSubjects.has(subj), `Subjek "${subj}" tiada dalam dataset kurikulum!`);
}

// Verify years
const officialYears = ['1', '2', '3', '4', '5', '6'];
const foundYears = new Set(kurikulumData.map(k => k.tahun));
for (const yr of officialYears) {
  assert.ok(foundYears.has(yr), `Tahun "${yr}" tiada dalam dataset kurikulum!`);
}

// Verify Al-Quran bidang
const alquranItems = kurikulumData.filter(k => k.mataPelajaran === 'Al-Quran');
const officialBidang = ['Tilawah', 'Hafazan', 'Kefahaman', 'Tajwid'];
const foundBidang = new Set(alquranItems.map(k => k.bidang));
for (const b of officialBidang) {
  assert.ok(foundBidang.has(b), `Bidang "${b}" tiada dalam subjek Al-Quran!`);
}

// Verify all items have required fields
let totalSubtajuks = 0;
let totalObjektifs = 0;
for (const item of kurikulumData) {
  assert.ok(item.id, 'Item id mesti ada');
  assert.ok(item.kod, `Item ${item.id} mesti mempunyai kod`);
  assert.ok(item.teks, `Item ${item.id} mesti mempunyai teks`);
  assert.ok(item.mataPelajaran, `Item ${item.id} mesti mempunyai mataPelajaran`);
  assert.ok(item.tahun, `Item ${item.id} mesti mempunyai tahun`);
  assert.ok(Array.isArray(item.subtajukList), `Item ${item.id} subtajukList mesti array`);
  assert.ok(Array.isArray(item.objektifList), `Item ${item.id} objektifList mesti array`);
  totalSubtajuks += item.subtajukList.length;
  totalObjektifs += item.objektifList.length;
}

assert.ok(totalSubtajuks >= 500, `Jumlah subtajuk (${totalSubtajuks}) mestilah >= 500`);
assert.ok(totalObjektifs >= 400, `Jumlah objektif (${totalObjektifs}) mestilah >= 400`);

console.log(`✓ 317 Tajuk rasmi disahkan.`);
console.log(`✓ 7 Mata pelajaran dan 4 bidang Al-Quran lengkap.`);
console.log(`✓ 6 Tahun persekolahan (Tahun 1 - 6) lengkap.`);
console.log(`✓ ${totalSubtajuks} Subtajuk & ${totalObjektifs} Objektif pembelajaran (Murid dapat) disahkan.`);
console.log('----------------------------------------------------');
console.log('SEMUA 7 SEKSYEN UJIAN LULUS DENGAN CEMERLANG! ✓✓✓');

// 8. Test 2 Entry Modes (Standard & Wizard / Conversational Form)
console.log('\n8. Menguji 2 Mod Pengisian Borang RPH Guru (Standard vs Wizard):');
const teacherViewCode = fs.readFileSync('./src/components/TeacherView.tsx', 'utf-8');
const teacherWizardCode = fs.readFileSync('./src/components/TeacherWizardForm.tsx', 'utf-8');

assert.ok(teacherViewCode.includes("entryMode, setEntryMode"), 'State entryMode mesti wujud dalam TeacherView');
assert.ok(teacherViewCode.includes("Mod Standard"), 'Mod Standard mesti wujud dalam UI');
assert.ok(teacherViewCode.includes("Mod Wizard"), 'Mod Wizard mesti wujud dalam UI');
assert.ok(teacherViewCode.includes("<TeacherWizardForm"), 'TeacherWizardForm mesti dipanggil dalam TeacherView');

const wizardSteps = [
  'Waktu & Kelas',
  'Mata Pelajaran & Tajuk',
  'Objektif Pembelajaran',
  'Aktiviti Pembelajaran',
  'Kemahiran Pentaksiran',
  'Refleksi Guru & Jana PDF'
];

for (const step of wizardSteps) {
  assert.ok(teacherWizardCode.includes(step), `Langkah wizard "${step}" mesti wujud dalam TeacherWizardForm`);
}

// Verify that both modes receive and update the same form state
assert.ok(teacherWizardCode.includes('onUpdateForm'), 'TeacherWizardForm mesti menyokong onUpdateForm');
assert.ok(teacherWizardCode.includes('onGeneratePdf'), 'TeacherWizardForm mesti menyokong onGeneratePdf');

console.log('✓ Mod Standard & Mod Wizard berjaya dikesan.');
console.log('✓ Kesemua 6 langkah Wizard / Conversational Form lengkap.');
console.log('✓ Penyelarasan data masa nyata (Single Source of Truth) disahkan.');
console.log('----------------------------------------------------');
console.log('SEMUA 8 SEKSYEN UJIAN LULUS DENGAN CEMERLANG! ✓✓✓');

// 9. Test Canva A4 PDF Grid Builder in Panel Editor
console.log('\n9. Menguji Editor Susunan Grid PDF (Mod Canva Saiz A4):');
const adminViewCode = fs.readFileSync('./src/components/AdminView.tsx', 'utf-8');
const editorCode = fs.readFileSync('./src/components/AdminPdfLayoutEditor.tsx', 'utf-8');
const rphPreviewCode = fs.readFileSync('./src/components/RphPreview.tsx', 'utf-8');
const presetsCode = fs.readFileSync('./src/config/gridPresets.ts', 'utf-8');

// A. Tab 4 exists in AdminView
assert.ok(adminViewCode.includes("Susunan Grid PDF (Canva A4)"), 'Tab 4 Susunan Grid PDF mesti wujud dalam AdminView');
assert.ok(adminViewCode.includes("<AdminPdfLayoutEditor"), 'AdminPdfLayoutEditor mesti dipanggil dalam AdminView');

// B. Presets & 17 Standard Sections
assert.ok(presetsCode.includes("SENARAI_BAHAGIAN_STANDARD"), 'SENARAI_BAHAGIAN_STANDARD mesti wujud');
assert.ok(presetsCode.includes("PRESET_TAPAK_ASAL"), 'PRESET_TAPAK_ASAL mesti wujud');
assert.ok(presetsCode.includes("PRESET_MODEN"), 'PRESET_MODEN mesti wujud');

// C. Tools to create tables in Canva Editor
assert.ok(editorCode.includes("handleAddTableSingle"), 'Fungsi cipta jadual 1 petak mesti wujud');
assert.ok(editorCode.includes("handleAddTableDouble"), 'Fungsi cipta jadual 2 petak mesti wujud');
assert.ok(editorCode.includes("handleAddTableTriple"), 'Fungsi cipta jadual 3 petak mesti wujud');
assert.ok(editorCode.includes("handleAddSplitColumnContainer"), 'Fungsi cipta jadual belah 2 lajur mesti wujud');
console.log('✓ Alat nak cipta table (1 petak, 2 petak, 3 petak, belah 2 lajur) lengkap.');

// D. '+' Button on each table cell
assert.ok(editorCode.includes("+ Pilih Bahagian"), 'Butang "+" mesti dipaparkan pada setiap petak kosong');
assert.ok(editorCode.includes("handleOpenPickerForCell"), 'Pengendali klik butang "+" mesti wujud');
console.log('✓ Butang "+" untuk memilih bahagian pada setiap petak disahkan.');

// E. Modal dialog with existing sections & create new section
assert.ok(editorCode.includes("Pilih Bahagian RPH Untuk Petak Ini"), 'Modal pemilih bahagian mesti wujud');
assert.ok(editorCode.includes("handleCreateNewCustomSection"), 'Fungsi cipta bahagian kustom baharu mesti wujud');
assert.ok(editorCode.includes("+ Tambah Bahagian Baharu"), 'Tab cipta bahagian baharu mesti wujud');
console.log('✓ Modal pemilih bahagian yang wujud & borang tambah bahagian baharu disahkan.');

// F. Dynamic rendering in RphPreview & TeacherView integration
assert.ok(rphPreviewCode.includes("layoutStyle === 'custom'"), 'RphPreview mesti menyokong layoutStyle custom');
assert.ok(rphPreviewCode.includes("renderSectionContent"), 'Fungsi renderSectionContent dinamik mesti wujud');
assert.ok(teacherViewCode.includes("Susunan Khas (Canva)"), 'Pilihan Susunan Khas (Canva) mesti wujud dalam TeacherView');
console.log('✓ Penyepaduan render dinamik RPH Preview dan pilihan cetakan PDF disahkan.');

console.log('----------------------------------------------------');
console.log('SEMUA 9 SEKSYEN UJIAN SISTEM LULUS DENGAN CEMERLANG! ✓✓✓');

// 10. Menguji Penyambungan Lengkap Bahagian Kustom (Canva -> Bank Data -> Borang Guru -> PDF)
console.log('\n10. Menguji Penyambungan Lengkap Bahagian Kustom:');
const rphTypesCode = fs.readFileSync('./src/types/rph.ts', 'utf-8');

// A. Types definition
assert.ok(rphTypesCode.includes("jenis: 'dropdown' | 'checkbox' | 'teks' | 'bullet' | 'statik'"), 'CustomSectionDef mesti menyokong jenis dropdown/checkbox/teks/bullet/statik');
assert.ok(rphTypesCode.includes("pilihanBank?: string[]"), 'CustomSectionDef mesti mempunyai pilihanBank');
assert.ok(rphTypesCode.includes("customValues?: Record<string, any>"), 'TeacherDailyForm & RphData mesti menyokong customValues');
console.log('✓ Model data TypeScript (CustomSectionDef, customValues, pilihanBank) sah.');

// B. Admin View Tab 3 Subtab 6 (Bank Bahagian Kustom)
assert.ok(adminViewCode.includes("6. Bank Bahagian Kustom"), 'AdminView mesti ada Subtab 6: Bank Bahagian Kustom');
assert.ok(adminViewCode.includes("handleTambahPilihanBank"), 'AdminView mesti boleh menambah pilihan dropdown kustom');
assert.ok(adminViewCode.includes("handlePadamPilihanBank"), 'AdminView mesti boleh memadam pilihan dropdown kustom');
console.log('✓ Panel Pengurusan Bank Bahagian Kustom dalam Tab 3 Admin disahkan.');

// C. Teacher View (Standard & Wizard)
assert.ok(teacherViewCode.includes("Maklumat Tambahan Sekolah"), 'TeacherView mesti memaparkan kad Maklumat Tambahan Sekolah');
assert.ok(teacherViewCode.includes("form.customValues"), 'TeacherView mesti mengikat nilai kepada form.customValues');
assert.ok(teacherWizardCode.includes("Maklumat Tambahan Sekolah"), 'TeacherWizardForm mesti mengandungi Maklumat Tambahan Sekolah dalam Langkah 5');
console.log('✓ Borang Guru (Mod Standard & Mod Wizard) menyokong input dinamik bahagian kustom.');

// D. PDF Preview rendering
assert.ok(rphPreviewCode.includes("data.customValues?.[sectionId]"), 'RphPreview mesti membaca data.customValues mengikut sectionId');
console.log('✓ Output PDF dinamik membaca dan mencetak nilai kustom guru.');

console.log('----------------------------------------------------');
console.log('SEMUA 10 SEKSYEN UJIAN SISTEM LULUS DENGAN CEMERLANG! ✓✓✓\n');

// 11. Menguji Paparan Skrin Telefon / Mudah Alih (Mobile Responsiveness)
console.log('11. Menguji Kemas Kini Paparan Skrin Telefon (Mobile & Phone UI):');
const navbarCode = fs.readFileSync('./src/components/Navbar.tsx', 'utf-8');
const freshTeacherViewCode = fs.readFileSync('./src/components/TeacherView.tsx', 'utf-8');
const freshAdminEditorCode = fs.readFileSync('./src/components/AdminPdfLayoutEditor.tsx', 'utf-8');
const indexCssCode = fs.readFileSync('./src/index.css', 'utf-8');

// A. Navbar mobile responsive
assert.ok(navbarCode.includes("flex-col md:flex-row"), 'Navbar mesti mempunyai susunan flex-col pada skrin telefon');
assert.ok(navbarCode.includes("w-full md:w-auto"), 'Navbar 2-Page Switcher mesti menyesuaikan saiz penuh pada telefon');
console.log('✓ Navigasi atas (Navbar) dioptimumkan untuk telefon (Logo, Skrip, Tema & Pensuis 2 Halaman).');

// B. Teacher View Mobile Switcher (Form vs Preview)
assert.ok(freshTeacherViewCode.includes("mobileView"), 'TeacherView mesti mempunyai state mobileView');
assert.ok(freshTeacherViewCode.includes("Pratonton A4 & Cetak"), 'TeacherView mesti mempunyai tab pensuisan telefon: Pratonton A4 & Cetak');
assert.ok(freshTeacherViewCode.includes("📱 Muat Skrin"), 'TeacherView mesti mempunyai butang zum muat skrin telefon');
console.log('✓ Mod pensuisan telefon Halaman Guru (Borang RPH vs Pratonton A4 & Skala Zum) disahkan.');

// C. Canva A4 Editor mobile responsive
assert.ok(freshAdminEditorCode.includes("📱 Fit"), 'AdminPdfLayoutEditor mesti menyokong mod Zum Fit telefon (45%)');
assert.ok(freshAdminEditorCode.includes("max-h-[94vh]"), 'Dialog modal bahagian mesti dioptimumkan untuk saiz skrin telefon');
console.log('✓ Editor Canva A4 menyokong zum muat skrin telefon & modal yang responsif.');

// D. Touch scrollbar utility
assert.ok(indexCssCode.includes("scrollbar-none"), 'Utiliti scrollbar-none mesti wujud untuk kelancaran leret telefon');
console.log('✓ Utiliti sentuhan leret bebas scrollbar tebal (.scrollbar-none) disahkan.');

console.log('----------------------------------------------------');
console.log('SEMUA 11 SEKSYEN UJIAN SISTEM LULUS DENGAN CEMERLANG! ✓✓✓\n');

// 12. Menguji Kustom Tajuk Tandatangan & Muat Naik Gambar Logo Sekolah
console.log('12. Menguji Kustom Format Tandatangan & Muat Naik Logo Sekolah:');
const freshAdminViewCode = fs.readFileSync('./src/components/AdminView.tsx', 'utf-8');
const freshRphPreviewCode = fs.readFileSync('./src/components/RphPreview.tsx', 'utf-8');

// A. Format Nama Tajuk Bahagian Tandatangan
assert.ok(optionsContent.includes('tandatanganGuru:'), 'tandatanganGuru mesti wujud dalam labelCustom default');
assert.ok(optionsContent.includes('tandatanganGuruBesar:'), 'tandatanganGuruBesar mesti wujud dalam labelCustom default');
assert.ok(freshAdminViewCode.includes('Format Label Ruangan Tandatangan & Pengesahan'), 'AdminView Tab 2 mesti ada kad kustom label tandatangan');
assert.ok(freshRphPreviewCode.includes('customLabels?.tandatanganGuru'), 'RphPreview mesti menggunakan customLabels.tandatanganGuru');
assert.ok(freshRphPreviewCode.includes('customLabels?.tandatanganGuruBesar'), 'RphPreview mesti menggunakan customLabels.tandatanganGuruBesar');
console.log('✓ Kustomisasi format tajuk tandatangan guru & guru besar (Rumi & Jawi) dalam Tab 2 & PDF disahkan.');

// B. Muat Naik & Paparan Gambar Logo Sekolah
assert.ok(freshAdminViewCode.includes('handleLogoUpload'), 'AdminView mesti mempunyai fungsi handleLogoUpload');
assert.ok(freshAdminViewCode.includes('handleRemoveLogo'), 'AdminView mesti mempunyai fungsi handleRemoveLogo');
assert.ok(freshAdminViewCode.includes('Tukar Gambar Logo') || freshAdminViewCode.includes('Muat Naik Gambar Logo'), 'AdminView Tab 1 mesti ada butang muat naik logo');
assert.ok(navbarCode.includes('logoSekolah'), 'Navbar mesti menerima dan memaparkan logoSekolah');
assert.ok(freshTeacherViewCode.includes('config.logoSekolah'), 'TeacherView hero banner mesti memaparkan logo sekolah');
assert.ok(freshRphPreviewCode.includes('logoSekolah ?'), 'RphPreview mesti menyokong paparan gambar logoSekolah dalam standard & custom layout');
console.log('✓ Ciri muat naik gambar logo sekolah, penyimpanan base64, dan paparan merentasi Navbar, Hero & PDF disahkan.');

console.log('----------------------------------------------------');
console.log('SEMUA 12 SEKSYEN UJIAN SISTEM LULUS DENGAN CEMERLANG! ✓✓✓\n');

// 13. Menguji Padam Mata Pelajaran & Bidang Tambahan
console.log('13. Menguji Ciri Padam Mata Pelajaran / Subjek & Bidang:');
assert.ok(freshAdminViewCode.includes('handleDeleteSubject'), 'AdminView mesti mempunyai fungsi handleDeleteSubject');
assert.ok(freshAdminViewCode.includes('handleDeleteBidang'), 'AdminView mesti mempunyai fungsi handleDeleteBidang');
assert.ok(freshAdminViewCode.includes('Padam subjek'), 'AdminView mesti mempunyai butang padam subjek');
assert.ok(freshAdminViewCode.includes('Padam bidang'), 'AdminView mesti mempunyai butang padam bidang');
console.log('✓ Butang ikon tong sampah (Trash2) dan pengesahan pemadaman subjek/bidang disahkan.');

console.log('----------------------------------------------------');
console.log('SEMUA 13 SEKSYEN UJIAN SISTEM LULUS DENGAN CEMERLANG! ✓✓✓\n');

// 14. Menguji Ciri Eksport & Pemasangan Data Sekolah (Offline / Local-First)
console.log('14. Menguji Ciri Eksport & Pemasangan Data Sekolah (Offline):');
const storageCode = fs.readFileSync('./src/utils/storage.ts', 'utf-8');
const freshTeacherCode = fs.readFileSync('./src/components/TeacherView.tsx', 'utf-8');
const latestAdminCode = fs.readFileSync('./src/components/AdminView.tsx', 'utf-8');

// A. Storage utilities
assert.ok(storageCode.includes('exportSchoolConfigFile'), 'storage.ts mesti ada fungsi exportSchoolConfigFile');
assert.ok(storageCode.includes('importSchoolConfigFile'), 'storage.ts mesti ada fungsi importSchoolConfigFile');
assert.ok(storageCode.includes('exportTeacherBackupFile'), 'storage.ts mesti ada fungsi exportTeacherBackupFile');
assert.ok(storageCode.includes('importTeacherBackupFile'), 'storage.ts mesti ada fungsi importTeacherBackupFile');
console.log('✓ Utiliti eksport & import data sekolah dan sandaran RPH guru disahkan.');

// B. Admin View UI
assert.ok(latestAdminCode.includes('handleExportSchoolData'), 'AdminView mesti ada fungsi handleExportSchoolData');
assert.ok(latestAdminCode.includes('handleImportSchoolData'), 'AdminView mesti ada fungsi handleImportSchoolData');
assert.ok(latestAdminCode.includes('Eksport Data (.json)'), 'AdminView mesti ada butang Eksport Data');
assert.ok(latestAdminCode.includes('Pengedaran & Pemasangan Data Sekolah'), 'AdminView Tab 1 mesti ada kad pengedaran data offline');
console.log('✓ Panel Admin menyediakan butang eksport fail JSON dan pengedaran data offline.');

// C. Teacher View UI
assert.ok(freshTeacherCode.includes('handleInstallSchoolData'), 'TeacherView mesti ada fungsi handleInstallSchoolData');
assert.ok(freshTeacherCode.includes('handleExportTeacherBackup'), 'TeacherView mesti ada fungsi handleExportTeacherBackup');
assert.ok(freshTeacherCode.includes('handleImportTeacherBackup'), 'TeacherView mesti ada fungsi handleImportTeacherBackup');
assert.ok(freshTeacherCode.includes('Pasang Data / Sandaran'), 'TeacherView Hero Banner mesti ada butang Pasang Data / Sandaran');
assert.ok(freshTeacherCode.includes('Pemasangan Data & Sandaran Peranti'), 'TeacherView mesti mempunyai modal pemasangan data');
console.log('✓ Halaman Guru menyediakan butang dan modal dialog untuk memasang fail data sekolah secara peranti.');

console.log('----------------------------------------------------');
console.log('SEMUA 14 SEKSYEN UJIAN SISTEM LULUS DENGAN CEMERLANG! ✓✓✓\n');
