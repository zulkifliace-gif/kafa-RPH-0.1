import { BankTajukItem, BankSubtajukItem } from '../types/rph';

/**
 * Pecahkan teks berbilang baris (1 baris = 1 item), buang baris kosong dan elak pendua.
 */
export function parseBulkLines(rawText: string, existing: string[] = []): string[] {
  const existingSet = new Set(existing.map((s) => s.trim()));
  const seen = new Set<string>();
  const result: string[] = [];

  for (const line of rawText.split(/\r?\n/)) {
    const cleaned = line.trim();
    if (!cleaned) continue;
    if (existingSet.has(cleaned) || seen.has(cleaned)) continue;
    seen.add(cleaned);
    result.push(cleaned);
  }
  return result;
}

/**
 * Pecahkan teks berbilang baris untuk Subtajuk (format: "Kod | Teks" atau "Kod Teks" atau "Teks sahaja")
 */
export function parseBulkSubtajukLines(
  rawText: string,
  existing: BankSubtajukItem[] = []
): BankSubtajukItem[] {
  const existingSet = new Set(existing.map((s) => `${s.kod.trim()}|${s.teks.trim()}`));
  const seen = new Set<string>();
  const result: BankSubtajukItem[] = [];

  for (const line of rawText.split(/\r?\n/)) {
    const cleaned = line.trim();
    if (!cleaned) continue;

    let kod = '';
    let teks = cleaned;

    if (cleaned.includes('|')) {
      const [first, ...rest] = cleaned.split('|');
      kod = first.trim();
      teks = rest.join('|').trim();
    } else {
      const match = cleaned.match(/^([0-9]+(?:\.[0-9]+)+)\s+(.+)$/);
      if (match) {
        kod = match[1].trim();
        teks = match[2].trim();
      }
    }

    if (!teks) continue;
    const key = `${kod}|${teks}`;
    if (existingSet.has(key) || seen.has(key)) continue;
    seen.add(key);
    result.push({ kod, teks });
  }
  return result;
}

/**
 * Escape satu sel CSV mengikut RFC-4180
 */
export function escapeCsvCell(value: string): string {
  const str = String(value ?? '');
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Jana kandungan teks CSV (dengan UTF-8 BOM untuk keserasian Microsoft Excel & tulisan Jawi/Arab)
 */
export function buildKurikulumCsvString(kurikulum: BankTajukItem[]): string {
  const headers = [
    'MataPelajaran',
    'Bidang',
    'Tahun',
    'KodTajuk',
    'Tajuk',
    'Subtajuk',
    'Objektif',
    'Aktiviti'
  ];

  const rows = kurikulum.map((item) => {
    const subtajukStr = (item.subtajukList || [])
      .map((st) => (st.kod ? `${st.kod} ${st.teks}` : st.teks))
      .join(' | ');
    const objektifStr = (item.objektifList || []).join(' | ');
    const aktivitiStr = (item.aktivitiList || []).join(' | ');

    return [
      item.mataPelajaran || '',
      item.bidang || '',
      item.tahun || '',
      item.kod || '',
      item.teks || '',
      subtajukStr,
      objektifStr,
      aktivitiStr
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  // UTF-8 BOM ensures Excel renders Jawi & Arabic characters properly
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Muat turun fail CSV Kurikulum (.csv) serasi Excel & Google Sheets
 */
export function exportKurikulumToCsv(kurikulum: BankTajukItem[], schoolName?: string): void {
  const csvContent = buildKurikulumCsvString(kurikulum);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (schoolName || 'kafa').toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.href = url;
  a.download = `kurikulum_${safeName}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Penghurai CSV patuh RFC-4180 (menyokong koma dalam petikan, baris baharu dalam petikan, dan BOM)
 */
export function parseCsvRows(csvText: string): string[][] {
  const text = csvText.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentCell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentCell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(currentCell);
        currentCell = '';
      } else if (ch === '\r' && next === '\n') {
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
        i++;
      } else if (ch === '\n' || ch === '\r') {
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += ch;
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

export interface CsvKurikulumImportResult {
  items: BankTajukItem[];
  subjects: string[];
  bidangAlQuran: string[];
  errors: string[];
}

/**
 * Huraikan teks CSV kepada senarai BankTajukItem untuk import pukal kurikulum.
 */
export function parseKurikulumCsv(csvText: string): CsvKurikulumImportResult {
  const rows = parseCsvRows(csvText);
  const errors: string[] = [];
  const items: BankTajukItem[] = [];
  const subjectSet = new Set<string>();
  const bidangSet = new Set<string>();

  if (rows.length < 2) {
    return {
      items: [],
      subjects: [],
      bidangAlQuran: [],
      errors: ['Fail CSV kosong atau tiada baris data selepas kepala lajur.']
    };
  }

  const headerRow = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, ''));
  const colIdx = (names: string[], fallback: number) => {
    const found = headerRow.findIndex((h) => names.includes(h));
    return found >= 0 ? found : fallback;
  };

  const idxMp = colIdx(['matapelajaran', 'subjek', 'subject'], 0);
  const idxBidang = colIdx(['bidang'], 1);
  const idxTahun = colIdx(['tahun', 'year'], 2);
  const idxKod = colIdx(['kodtajuk', 'kod', 'code'], 3);
  const idxTajuk = colIdx(['tajuk', 'teks', 'topic'], 4);
  const idxSubtajuk = colIdx(['subtajuk', 'subtajuklist'], 5);
  const idxObjektif = colIdx(['objektif', 'objektiflist'], 6);
  const idxAktiviti = colIdx(['aktiviti', 'aktivitilist'], 7);

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const mataPelajaran = (row[idxMp] || '').trim();
    const bidangRaw = (row[idxBidang] || '').trim();
    const tahun = (row[idxTahun] || '').trim();
    const kod = (row[idxKod] || '').trim();
    const teks = (row[idxTajuk] || '').trim();

    if (!mataPelajaran || !teks) {
      errors.push(`Baris ${i + 1} diabaikan: Mata Pelajaran atau Tajuk kosong.`);
      continue;
    }

    subjectSet.add(mataPelajaran);
    if (mataPelajaran === 'Al-Quran' && bidangRaw) {
      bidangSet.add(bidangRaw);
    }

    const subtajukRaw = (row[idxSubtajuk] || '').trim();
    const subtajukList: BankSubtajukItem[] = subtajukRaw
      ? subtajukRaw
          .split('|')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((part) => {
            const match = part.match(/^([0-9]+(?:\.[0-9]+)+)\s+(.+)$/);
            if (match) {
              return { kod: match[1].trim(), teks: match[2].trim() };
            }
            return { kod: '', teks: part };
          })
      : [];

    const objektifRaw = (row[idxObjektif] || '').trim();
    const objektifList = objektifRaw
      ? objektifRaw.split('|').map((s) => s.trim()).filter(Boolean)
      : [];

    const aktivitiRaw = (row[idxAktiviti] || '').trim();
    const aktivitiList = aktivitiRaw
      ? aktivitiRaw.split('|').map((s) => s.trim()).filter(Boolean)
      : [];

    items.push({
      id: `csv-${mataPelajaran.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${i}`,
      kod,
      teks,
      mataPelajaran,
      ...(mataPelajaran === 'Al-Quran' ? { bidang: bidangRaw || 'Tilawah' } : {}),
      ...(tahun ? { tahun } : {}),
      subtajukList,
      objektifList,
      aktivitiList
    });
  }

  return {
    items,
    subjects: Array.from(subjectSet),
    bidangAlQuran: Array.from(bidangSet),
    errors
  };
}
