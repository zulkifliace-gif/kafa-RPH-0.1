// Helper functions for Jawi handling, Malay date parsing, and numeral conversions

export const SPECIAL_JAWI_CHARS = [
  { char: 'ڤ', name: 'Pa (ڤ)', sound: 'P' },
  { char: 'چ', name: 'Ca (چ)', sound: 'C' },
  { char: 'ݢ', name: 'Ga (ݢ)', sound: 'G' },
  { char: 'ڽ', name: 'Nya (ڽ)', sound: 'NY' },
  { char: 'ۏ', name: 'Va (ۏ)', sound: 'V' },
  { char: 'ء', name: 'Hamzah (ء)', sound: '-' },
  { char: 'ة', name: 'Ta Marbutah (ة)', sound: 'T/H' },
  { char: 'ڠ', name: 'Nga (ڠ)', sound: 'NG' }
];

// Convert Western digits (0-9) to Arabic-Indic digits (٠-٩)
export function toArabicDigits(str: string | number): string {
  const westernToArabic: Record<string, string> = {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
  };
  return String(str).replace(/[0-9]/g, (w) => westernToArabic[w] || w);
}

// Convert YYYY-MM-DD to "7 September 2026"
export function formatMalayDate(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const bulanMalay = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
  ];
  
  const bulan = bulanMalay[monthIdx] || parts[1];
  return `${day} ${bulan} ${year}`;
}

// Determine Malay day of week from YYYY-MM-DD
export function getDayFromDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const days = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
  return days[date.getDay()];
}

// Calculate week number of year (1-52)
export function getWeekNumber(dateString: string): string {
  if (!dateString) return '1';
  const target = new Date(dateString);
  if (isNaN(target.getTime())) return '1';
  
  const d = new Date(Date.UTC(target.getFullYear(), target.getMonth(), target.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return String(Math.min(Math.max(weekNo, 1), 52));
}

// Basic Latin to Jawi phonetic transliteration dictionary for common KAFA educational words
const COMMON_DICTIONARY: Record<string, string> = {
  'adab': 'ادب',
  'bersyukur': 'برشکور',
  'pengertian': 'ڤڠرتين',
  'dalil': 'دليل',
  'dan': 'دان',
  'solat': 'صلاة',
  'ibadah': 'عبادة',
  'wuduk': 'وضوء',
  'puasa': 'ڤواسا',
  'syarat': 'شرط',
  'sah': 'صح',
  'rukun': 'روکون',
  'guru': 'ڬورو',
  'murid': 'موريد',
  'kelas': 'کلس',
  'pelajaran': 'ڤلاجرن',
  'objektif': 'اوبجيکتيف',
  'aktiviti': 'اکتيۏيتي',
  'tilawah': 'تلاوة',
  'tajwid': 'تجويد',
  'hafazan': 'حفظن',
  'tasmi': 'تسميع',
  'fasih': 'فصيح',
  'akhlak': 'اخلاق',
  'sirah': 'سيرة',
  'jawi': 'جاوي',
  'al-quran': 'القرءان',
  'alquran': 'القرءان',
  'quran': 'قرءان',
  'lisan': 'ليسن',
  'bertulis': 'برتوليس',
  'pemerhatian': 'ڤمرهاتين'
};

export function transliterateSimpleRumiToJawi(text: string): string {
  if (!text) return '';
  const words = text.split(/(\s+|[.,:;!?()[\]{}])/);
  return words.map(w => {
    const cleanWord = w.toLowerCase().trim();
    if (COMMON_DICTIONARY[cleanWord]) {
      return COMMON_DICTIONARY[cleanWord];
    }
    return w;
  }).join('');
}

export const JAWI_DAYS: Record<string, string> = {
  'ahad': 'احد',
  'isnin': 'اثنين',
  'selasa': 'ثلاثاء',
  'rabu': 'رابو',
  'khamis': 'خميس',
  'jumaat': 'جمعة',
  'sabtu': 'سبتو'
};

export const JAWI_MONTHS: Record<string, string> = {
  'januari': 'جانواري',
  'februari': 'فيبرواري',
  'mac': 'مچ',
  'april': 'اڤريل',
  'mei': 'مي',
  'jun': 'جون',
  'julai': 'جولاي',
  'ogos': 'اوݢوس',
  'september': 'سڤتيمبر',
  'oktober': 'اوکتوبر',
  'november': 'نوۏيمبر',
  'disember': 'ديسيمبر'
};

export const JAWI_SUBJECTS: Record<string, string> = {
  'al-quran': 'القرءان',
  'alquran': 'القرءان',
  'jawi': 'جاوي',
  'adab': 'ادب',
  'sirah': 'سيرة',
  'akidah': 'عقيدة',
  'aqidah': 'عقيدة',
  'ibadah': 'عبادة',
  'bahasa arab': 'بهاس عرب',
  'fardhu ain': 'فرض عين',
  'fardu ain': 'فرض عين',
  'akhlak': 'اخلاق'
};

export function toJawiDay(day: string): string {
  if (!day) return '';
  const clean = day.trim().toLowerCase();
  return JAWI_DAYS[clean] || day;
}

export function toJawiDate(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();

  const bulanMalay = [
    'januari', 'februari', 'mac', 'april', 'mei', 'jun',
    'julai', 'ogos', 'september', 'oktober', 'november', 'disember'
  ];

  // 1. Pattern: "7 September 2026" or "07 September 2026" or Jawi month "7 سڤتيمبر 2026"
  const dmyWords = trimmed.match(/^([0-9\u0660-\u0669]{1,2})\s+([a-zA-Z\u0600-\u06FF]+)\s+([0-9\u0660-\u0669]{4})$/);
  if (dmyWords) {
    const day = toArabicDigits(dmyWords[1]);
    const rawM = dmyWords[2].toLowerCase();
    const jawiM = JAWI_MONTHS[rawM] || dmyWords[2];
    const year = toArabicDigits(dmyWords[3]);
    return `${year} / ${jawiM} / ${day}`;
  }

  // 2. Pattern: ISO "YYYY-MM-DD" or "YYYY/MM/DD"
  const iso = trimmed.match(/^([0-9]{4})[-/.]([0-9]{1,2})[-/.]([0-9]{1,2})$/);
  if (iso) {
    const year = toArabicDigits(iso[1]);
    const mIdx = parseInt(iso[2], 10) - 1;
    const jawiM = JAWI_MONTHS[bulanMalay[mIdx]] || toArabicDigits(iso[2]);
    const day = toArabicDigits(parseInt(iso[3], 10));
    return `${year} / ${jawiM} / ${day}`;
  }

  // 3. Pattern: "DD-MM-YYYY" or "DD/MM/YYYY"
  const dmy = trimmed.match(/^([0-9]{1,2})[-/.]([0-9]{1,2})[-/.]([0-9]{4})$/);
  if (dmy) {
    const day = toArabicDigits(parseInt(dmy[1], 10));
    const mIdx = parseInt(dmy[2], 10) - 1;
    const jawiM = JAWI_MONTHS[bulanMalay[mIdx]] || toArabicDigits(dmy[2]);
    const year = toArabicDigits(dmy[3]);
    return `${year} / ${jawiM} / ${day}`;
  }

  // 4. Fallback for strings containing month name anywhere
  for (const [rumiMonth, jawiMonth] of Object.entries(JAWI_MONTHS)) {
    const reg = new RegExp(`([0-9\\u0660-\\u0669]{1,2})?\\s*\\b${rumiMonth}\\b\\s*([0-9\\u0660-\\u0669]{4})?`, 'i');
    const match = trimmed.match(reg);
    if (match && match[1] && match[2]) {
      return `${toArabicDigits(match[2])} / ${jawiMonth} / ${toArabicDigits(match[1])}`;
    }
  }

  let result = trimmed;
  for (const [rumiMonth, jawiMonth] of Object.entries(JAWI_MONTHS)) {
    const reg = new RegExp(`\\b${rumiMonth}\\b`, 'i');
    if (reg.test(result)) {
      result = result.replace(reg, jawiMonth);
      break;
    }
  }
  return toArabicDigits(result);
}

export function toJawiSubject(subject: string): string {
  if (!subject) return '';
  const clean = subject.trim().toLowerCase();
  return JAWI_SUBJECTS[clean] || subject;
}

