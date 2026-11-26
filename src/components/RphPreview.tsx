import React from 'react';
import { RphData, ScriptMode, AdminSchoolConfig, CustomPdfLayoutConfig } from '../types/rph';
import labelsData from '../config/labels.json';
import { toArabicDigits, toJawiDay, toJawiDate, toJawiSubject } from '../utils/jawiHelper';

interface Props {
  data: RphData;
  namaSekolah?: string;
  logoSekolah?: string;
  customLabels?: AdminSchoolConfig['labelCustom'];
  skrip: ScriptMode;
  layoutStyle: 'modern' | 'classic' | 'custom';
  customLayout?: CustomPdfLayoutConfig;
}

export const RphPreview: React.FC<Props> = ({
  data,
  namaSekolah,
  logoSekolah,
  customLabels,
  skrip,
  layoutStyle,
  customLayout
}) => {
  const isJawi = skrip === 'jawi';

  const formatNum = (num: string | number) => {
    if (num === undefined || num === null || num === '') return '';
    return isJawi ? toArabicDigits(num) : String(num);
  };

  const getLabel = (key: string, fallbackKey: keyof typeof labelsData) => {
    if (customLabels && (customLabels as any)[key]) {
      return isJawi ? (customLabels as any)[key].jawi : (customLabels as any)[key].rumi;
    }
    return isJawi ? labelsData[fallbackKey].jawi : labelsData[fallbackKey].rumi;
  };

  const formatTarikh = (val?: string) => {
    if (!val) return '-';
    return isJawi ? toJawiDate(val) : val;
  };

  const formatHari = (val?: string) => {
    if (!val) return '-';
    return isJawi ? toJawiDay(val) : val;
  };

  const formatMataPelajaran = (val?: string) => {
    if (!val) return '-';
    return isJawi ? toJawiSubject(val) : val;
  };

  const isAlQuran = data.mataPelajaran === 'Al-Quran';

  // Check if custom layout already includes header or signature blocks
  const hasCustomHeader =
    layoutStyle === 'custom' &&
    customLayout?.blocks?.some((b) => {
      if (b.type === 'table') {
        return b.rows?.some((r) => r.cells.some((c) => c.sectionId === 'header'));
      }
      if (b.type === 'split-columns' && b.splitColumns) {
        return (
          b.splitColumns.left.rows.some((r) => r.cells.some((c) => c.sectionId === 'header')) ||
          b.splitColumns.right.rows.some((r) => r.cells.some((c) => c.sectionId === 'header'))
        );
      }
      return false;
    });

  const hasCustomSignature =
    layoutStyle === 'custom' &&
    customLayout?.blocks?.some((b) => {
      if (b.type === 'table') {
        return b.rows?.some((r) => r.cells.some((c) => c.sectionId === 'tandatangan'));
      }
      if (b.type === 'split-columns' && b.splitColumns) {
        return (
          b.splitColumns.left.rows.some((r) => r.cells.some((c) => c.sectionId === 'tandatangan')) ||
          b.splitColumns.right.rows.some((r) => r.cells.some((c) => c.sectionId === 'tandatangan'))
        );
      }
      return false;
    });

  // Render individual section dynamically inside whatever cell it is placed in
  const renderSectionContent = (sectionId: string | null) => {
    if (!sectionId) {
      return (
        <div className="py-2 text-center text-slate-300 italic text-[11px]">
          [ Ruang Kosong ]
        </div>
      );
    }

    // Standard Header Banner
    if (sectionId === 'header') {
      return (
        <div className="text-center py-1">
          {namaSekolah && (
            <div className="text-xs sm:text-sm font-bold tracking-wider text-slate-800 uppercase mb-0.5">
              {namaSekolah}
            </div>
          )}
          <div className="flex items-center justify-center gap-2.5">
            {logoSekolah ? (
              <div className="w-10 h-10 rounded-full border border-emerald-800 bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                <img
                  src={logoSekolah}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                {isJawi ? 'ق' : 'K'}
              </div>
            )}
            <div>
              <h2 className={`font-bold text-emerald-950 ${isJawi ? 'text-xl' : 'text-base sm:text-lg uppercase tracking-tight'}`}>
                {isJawi ? 'رانچڠن ڤڠاجرن هارين (RPH) کـافـا' : 'RANCANGAN PENGAJARAN HARIAN (RPH) KAFA'}
              </h2>
              <p className="text-[11px] text-slate-600 font-medium">
                {isJawi ? 'تاڤق ستندرد کوريکولوم کـافـا' : 'Tapak Standard Kurikulum KAFA (JAKIM / JAIN)'}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Tarikh
    if (sectionId === 'tarikh') {
      return (
        <div>
          <span className="font-bold text-slate-900">{getLabel('tarikh', 'tarikh')} : </span>
          <span className="font-bold text-slate-900">{formatTarikh(data.tarikh)}</span>
        </div>
      );
    }

    // Hari
    if (sectionId === 'hari') {
      return (
        <div>
          <span className="font-bold text-slate-900">{getLabel('hari', 'hari')} : </span>
          <span className="font-bold text-slate-900">{formatHari(data.hari)}</span>
        </div>
      );
    }

    // Minggu
    if (sectionId === 'minggu') {
      return (
        <div>
          <span className="font-bold text-slate-900">{getLabel('minggu', 'minggu')} : </span>
          <span className="font-bold text-slate-900">{data.minggu ? formatNum(data.minggu) : '-'}</span>
        </div>
      );
    }

    // Tahun
    if (sectionId === 'tahun') {
      return (
        <div>
          <span className="font-bold text-slate-900">{getLabel('tahun', 'tahun')} : </span>
          <span className="font-bold text-slate-900">
            {data.tahun ? (isJawi ? `تاهون ${formatNum(data.tahun)}` : `Tahun ${data.tahun}`) : '-'}
          </span>
        </div>
      );
    }

    // Masa
    if (sectionId === 'masa') {
      return (
        <div>
          <span className="font-bold text-slate-900">{getLabel('masa', 'masa')} : </span>
          <span className="font-bold text-slate-900">{data.masa ? formatNum(data.masa) : '-'}</span>
        </div>
      );
    }

    // Kelas
    if (sectionId === 'kelas') {
      return (
        <div>
          <span className="font-bold text-slate-900">{getLabel('kelas', 'kelas')} : </span>
          <span className="font-bold text-slate-900">{data.kelas || '-'}</span>
        </div>
      );
    }

    // Mata Pelajaran
    if (sectionId === 'mataPelajaran') {
      return (
        <div>
          <span className="font-bold text-slate-900">{getLabel('mataPelajaran', 'mataPelajaran')} : </span>
          <span className="font-bold text-emerald-950">{formatMataPelajaran(data.mataPelajaran)}</span>
        </div>
      );
    }

    // Bidang (Al-Quran)
    if (sectionId === 'bidang') {
      return (
        <div>
          <span className="font-bold text-slate-900">{getLabel('bidang', 'bidang')} : </span>
          <span className="font-bold text-amber-950">{data.bidang || (isAlQuran ? '' : '-')}</span>
        </div>
      );
    }

    // Tajuk
    if (sectionId === 'tajuk') {
      return (
        <div>
          <span className="font-bold text-slate-900">{getLabel('tajuk', 'tajuk')} : </span>
          <span className="font-bold text-slate-900">
            {data.tajuk.kod ? `${data.tajuk.kod} ` : ''}{data.tajuk.teks || '-'}
          </span>
        </div>
      );
    }

    // Subtajuk
    if (sectionId === 'subtajuk') {
      return (
        <div>
          <span className="font-bold text-slate-800">{getLabel('subtajuk', 'subtajuk')} : </span>
          <span className="font-medium text-slate-800">
            {data.subtajuk?.kod ? `${data.subtajuk.kod} ` : ''}{data.subtajuk?.teks || '-'}
          </span>
        </div>
      );
    }

    // Objektif Pembelajaran
    if (sectionId === 'objektif') {
      return (
        <div>
          <div className="font-bold text-slate-900 mb-1">
            {getLabel('objektif', 'objektifPembelajaran')} :
          </div>
          <ul className="list-disc pr-5 pl-5 space-y-1">
            {data.objektifPembelajaran && data.objektifPembelajaran.filter((o: string) => o.trim()).length > 0 ? (
              data.objektifPembelajaran.filter((o: string) => o.trim()).map((obj: string, i: number) => (
                <li key={i} className="text-slate-900 font-medium leading-normal">{obj}</li>
              ))
            ) : (
              <li className="text-slate-400 italic list-none">Tiada objektif dimasukkan.</li>
            )}
          </ul>
        </div>
      );
    }

    // Aktiviti Murid
    if (sectionId === 'aktiviti') {
      return (
        <div>
          <div className="font-bold text-slate-900 mb-1">
            {getLabel('aktiviti', 'aktivitiMurid')} :
          </div>
          <ul className="list-disc pr-5 pl-5 space-y-1">
            {data.aktivitiMurid && data.aktivitiMurid.filter((a: string) => a.trim()).length > 0 ? (
              data.aktivitiMurid.filter((a: string) => a.trim()).map((akt: string, i: number) => (
                <li key={i} className="text-slate-900 font-medium leading-normal">{akt}</li>
              ))
            ) : (
              <li className="text-slate-400 italic list-none">Tiada aktiviti dimasukkan.</li>
            )}
          </ul>
        </div>
      );
    }

    // Kemahiran
    if (sectionId === 'kemahiran') {
      return (
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-slate-900">
            {getLabel('kemahiran', 'kemahiran')} :
          </span>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
              <span className={`text-base font-extrabold ${data.kemahiran?.lisan ? 'text-emerald-900' : 'text-slate-400'}`}>
                {data.kemahiran?.lisan ? '☑' : '☐'}
              </span>
              <span>{isJawi ? 'ليسن' : 'Lisan'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
              <span className={`text-base font-extrabold ${data.kemahiran?.bertulis ? 'text-emerald-900' : 'text-slate-400'}`}>
                {data.kemahiran?.bertulis ? '☑' : '☐'}
              </span>
              <span>{isJawi ? 'برتوليس' : 'Bertulis'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
              <span className={`text-base font-extrabold ${data.kemahiran?.pemerhatian ? 'text-emerald-900' : 'text-slate-400'}`}>
                {data.kemahiran?.pemerhatian ? '☑' : '☐'}
              </span>
              <span>{isJawi ? 'ڤمرهاتين' : 'Pemerhatian'}</span>
            </span>
          </div>
        </div>
      );
    }

    // Refleksi Nisbah
    if (sectionId === 'refleksiNisbah') {
      return (
        <div>
          <div className="font-bold text-slate-900 mb-1.5 pb-1 border-b border-slate-300">
            {getLabel('refleksi', 'refleksiGuru')} :
          </div>
          <div className="space-y-1.5 text-xs sm:text-sm font-medium text-slate-900">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
              <span>
                <strong>{formatNum(data.refleksi.muridMenguasai || '0')}/{formatNum(data.refleksi.jumlahMurid || '0')}</strong>{' '}
                {isJawi ? 'موريد مڠواساءي ڤمبلاجرن' : 'murid menguasai pembelajaran'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              <span>
                <strong>{formatNum(data.refleksi.muridTidakMenguasai || '0')}/{formatNum(data.refleksi.jumlahMurid || '0')}</strong>{' '}
                {isJawi ? 'موريد تيدق داڤت مڠواساءي ڤمبلاجرن' : 'murid tidak dapat menguasai pembelajaran'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Tindakan Susulan / Catatan
    if (sectionId === 'catatan') {
      return (
        <div>
          <div className="font-bold text-slate-900 mb-1">
            {getLabel('catatan', 'catatan')} :
          </div>
          {data.refleksi.catatan ? (
            <p className="text-slate-900 text-xs sm:text-sm leading-relaxed px-1 font-normal whitespace-pre-wrap">
              {data.refleksi.catatan}
            </p>
          ) : (
            <p className="text-slate-400 italic text-xs px-1">
              {isJawi ? 'تياد چاتتن دماسوقکن' : 'Tiada catatan tambahan.'}
            </p>
          )}
        </div>
      );
    }

    // Tandatangan
    if (sectionId === 'tandatangan') {
      const labelTtdGuru = customLabels?.tandatanganGuru
        ? (isJawi ? customLabels.tandatanganGuru.jawi : customLabels.tandatanganGuru.rumi)
        : (isJawi ? 'تانداتاڠن ڬورو' : 'Tandatangan Guru');

      const labelTtdGuruBesar = customLabels?.tandatanganGuruBesar
        ? (isJawi ? customLabels.tandatanganGuruBesar.jawi : customLabels.tandatanganGuruBesar.rumi)
        : (isJawi ? 'تانداتاڠن ڬورو بسر / ڤڽلارس' : 'Tandatangan Guru Besar / Penyelaras');

      return (
        <div className="py-2 grid grid-cols-2 text-center text-xs text-slate-800">
          <div>
            <div className="h-9"></div>
            <div className="w-36 border-b border-slate-600 mx-auto"></div>
            <p className="mt-1 font-bold">{labelTtdGuru}</p>
          </div>
          <div>
            <div className="h-9"></div>
            <div className="w-36 border-b border-slate-600 mx-auto"></div>
            <p className="mt-1 font-bold">{labelTtdGuruBesar}</p>
          </div>
        </div>
      );
    }

    // Custom Section (from customSections list)
    const customDef = (customLayout?.customSections || []).find((c) => c.id === sectionId);
    if (customDef) {
      const teacherVal = data.customValues?.[sectionId];
      const hasTeacherVal = teacherVal !== undefined && teacherVal !== null && teacherVal !== '';
      const displayVal = hasTeacherVal ? teacherVal : customDef.nilaiLalai;

      return (
        <div>
          <div className="font-bold text-slate-900 mb-1">
            {isJawi ? customDef.namaJawi : customDef.namaRumi} :
          </div>
          {customDef.jenis === 'dropdown' ? (
            <p className="text-slate-900 text-xs sm:text-sm font-semibold px-1">
              {displayVal || (isJawi ? 'تياد ڤيليهن' : 'Tiada pilihan dibuat')}
            </p>
          ) : customDef.jenis === 'checkbox' ? (
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              {Array.isArray(displayVal) ? (
                displayVal.length > 0 ? (
                  displayVal.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 font-bold text-slate-900">
                      <span className="text-base text-emerald-800">☑</span>
                      <span>{item}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic text-xs">Tiada pilihan ditanda</span>
                )
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                  <span className="text-base text-emerald-800">☑</span>
                  <span>{String(displayVal || (isJawi ? 'دچلاي' : 'Dicapai'))}</span>
                </span>
              )}
            </div>
          ) : customDef.jenis === 'bullet' ? (
            <ul className="list-disc pr-5 pl-5 space-y-1">
              {Array.isArray(displayVal) ? (
                displayVal.map((item, idx) => (
                  <li key={idx} className="text-slate-900 font-medium leading-normal">{item}</li>
                ))
              ) : (
                <li className="text-slate-900 font-medium leading-normal">{String(displayVal || '-')}</li>
              )}
            </ul>
          ) : (
            <p className="text-slate-900 text-xs sm:text-sm leading-relaxed px-1 font-normal whitespace-pre-wrap">
              {String(displayVal || (isJawi ? 'تياد باهن دماسوقکن' : 'Tiada maklumat dimasukkan.'))}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="text-xs text-slate-700">
        <span className="font-bold">{sectionId}</span>
      </div>
    );
  };

  const slotList = data.slots && data.slots.length > 0 ? data.slots : [data];
  const slotCount = slotList.length;
  const isCompactMulti = slotCount >= 3;

  // Render bullet items inline so Jawi dots ALWAYS sit cleanly beside the text in PDF/iOS
  const renderBulletList = (items: string[], emptyText: string, compactSpacing: boolean) => {
    const clean = (items || []).filter((x) => x && x.trim());
    if (clean.length === 0) {
      return <div className="text-slate-400 italic text-[11px]">{emptyText}</div>;
    }
    return (
      <div className={compactSpacing ? 'space-y-0.5' : 'space-y-1'}>
        {clean.map((txt, idx) => (
          <div key={idx} className="flex items-start gap-1.5 leading-snug text-slate-900 font-medium">
            <span className="shrink-0 font-bold text-emerald-800">•</span>
            <span className="flex-1 min-w-0">{txt}</span>
          </div>
        ))}
      </div>
    );
  };

  // Render 4-row ultra-clear Compact RPH Slot (fits up to 4 RPHs cleanly in 1 single A4 page!)
  const renderCompactFourPerPageSlot = (slot: any, slotIdx: number, totalSlots: number) => {
    const isSlotAlQuran = slot.mataPelajaran === 'Al-Quran';
    const sObjektif = slot.selectedObjektif || slot.objektifPembelajaran || [];
    const sAktiviti = slot.selectedAktiviti || slot.aktivitiMurid || [];
    const sKemahiran = slot.selectedKemahiran || slot.kemahiran || {};
    const sRefleksi = slot.refleksi || {
      muridMenguasai: '0',
      muridTidakMenguasai: '0',
      jumlahMurid: '10',
      catatan: ''
    };

    return (
      <div key={slot.id || slotIdx} className="border-2 border-slate-900 bg-white">
        {/* Baris 1: Header Kelas Padat (Tahun, Kelas, Masa, Subjek, Bidang) */}
        <div className="bg-emerald-800 text-white font-bold text-[11.5px] px-2.5 py-1 flex flex-wrap items-center justify-between gap-2 border-b border-slate-900">
          <span>
            {isJawi
              ? `کلس ${formatNum(slotIdx + 1)} : تاهون ${formatNum(slot.tahun)} ${slot.kelas || ''}  |  ${getLabel('masa', 'masa')}: ${formatNum(slot.masa)}`
              : `KELAS ${slotIdx + 1}/${totalSlots} : Tahun ${slot.tahun || '-'} ${slot.kelas || ''}  |  Masa: ${slot.masa || '-'}`}
          </span>
          <span className="text-emerald-100">
            {formatMataPelajaran(slot.mataPelajaran)}
            {isSlotAlQuran && slot.bidang ? ` (${slot.bidang})` : ''}
          </span>
        </div>

        <table className="w-full border-collapse text-[11px] bg-white">
          <tbody>
            {/* Baris 2: Tajuk & Subtajuk sebaris */}
            <tr className="border-b border-slate-900 bg-slate-50/70">
              <td colSpan={2} className="px-2 py-1 border-slate-900 leading-snug">
                <span className="font-bold text-slate-900">{getLabel('tajuk', 'tajuk')} : </span>
                <span className="font-bold text-slate-900">
                  {slot.tajuk?.kod ? `${slot.tajuk.kod} ` : ''}
                  {slot.tajuk?.teks || '-'}
                </span>
                {slot.subtajuk?.teks && (
                  <span className="text-slate-700">
                    {' '}
                    — <strong className="text-slate-800">{getLabel('subtajuk', 'subtajuk')}:</strong>{' '}
                    {slot.subtajuk.kod ? `${slot.subtajuk.kod} ` : ''}
                    {slot.subtajuk.teks}
                  </span>
                )}
              </td>
            </tr>

            {/* Baris 3: Objektif (50%) & Aktiviti (50%) sebelah-menyebelah supaya jimat ruang menegak */}
            <tr className="border-b border-slate-900">
              <td className="w-1/2 p-1.5 border-e border-slate-900 align-top">
                <div className="font-bold text-slate-900 mb-0.5 text-[11px]">
                  {getLabel('objektif', 'objektifPembelajaran')} :
                </div>
                {renderBulletList(sObjektif, 'Tiada objektif.', true)}
              </td>
              <td className="w-1/2 p-1.5 align-top bg-slate-50/30">
                <div className="font-bold text-slate-900 mb-0.5 text-[11px]">
                  {getLabel('aktiviti', 'aktivitiMurid')} :
                </div>
                {renderBulletList(sAktiviti, 'Tiada aktiviti.', true)}
              </td>
            </tr>

            {/* Baris 4: Refleksi + Catatan (Kanan/Kiri 58%) & Kemahiran (42%) */}
            <tr>
              <td className="w-[58%] px-2 py-1 border-e border-slate-900 align-top">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 leading-snug">
                  <span>
                    <strong className="text-slate-900">{getLabel('refleksi', 'refleksiGuru')}</strong>{' '}
                    <strong className="text-emerald-900">
                      {formatNum(sRefleksi.muridMenguasai || '0')}/{formatNum(sRefleksi.jumlahMurid || '0')}
                    </strong>{' '}
                    {isJawi ? 'مڠواساءي' : 'menguasai'},{' '}
                    <strong className="text-rose-700">
                      {formatNum(sRefleksi.muridTidakMenguasai || '0')}/{formatNum(sRefleksi.jumlahMurid || '0')}
                    </strong>{' '}
                    {isJawi ? 'تيدق مڠواساءي' : 'belum'}
                  </span>
                </div>
                {sRefleksi.catatan && (
                  <div className="text-slate-800 mt-0.5 leading-snug">
                    <strong>{getLabel('catatan', 'catatan')} :</strong> {sRefleksi.catatan}
                  </div>
                )}
              </td>
              <td className="w-[42%] px-2 py-1 align-middle bg-emerald-50/20">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                  <span className="font-bold text-slate-900">{getLabel('kemahiran', 'kemahiran')}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                    <span className={sKemahiran?.lisan ? 'text-emerald-900' : 'text-slate-400'}>
                      {sKemahiran?.lisan ? '☑' : '☐'}
                    </span>
                    <span>{isJawi ? 'ليسن' : 'Lisan'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                    <span className={sKemahiran?.bertulis ? 'text-emerald-900' : 'text-slate-400'}>
                      {sKemahiran?.bertulis ? '☑' : '☐'}
                    </span>
                    <span>{isJawi ? 'برتوليس' : 'Bertulis'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                    <span className={sKemahiran?.pemerhatian ? 'text-emerald-900' : 'text-slate-400'}>
                      {sKemahiran?.pemerhatian ? '☑' : '☐'}
                    </span>
                    <span>{isJawi ? 'ڤمرهاتين' : 'Pemerhatian'}</span>
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Render a single class slot in Classic 2-column layout (used when 1-2 classes)
  const renderClassicSlot = (slot: any, slotIdx?: number, totalSlots?: number) => {
    const isSlotAlQuran = slot.mataPelajaran === 'Al-Quran';
    const sObjektif = slot.selectedObjektif || slot.objektifPembelajaran || [];
    const sAktiviti = slot.selectedAktiviti || slot.aktivitiMurid || [];
    const sKemahiran = slot.selectedKemahiran || slot.kemahiran || {};
    const sRefleksi = slot.refleksi || { muridMenguasai: '0', muridTidakMenguasai: '0', jumlahMurid: '10', catatan: '' };
    const compactCell = totalSlots && totalSlots >= 2 ? 'p-1.5' : 'p-1.5 sm:p-2';

    return (
      <div key={slot.id || slotIdx}>
        {totalSlots && totalSlots > 1 && (
          <div className="bg-emerald-800 text-white font-bold text-xs px-3 py-1 flex items-center justify-between border-2 border-b-0 border-slate-900">
            <span className="tracking-wide">
              {isJawi
                ? `کلس ${formatNum(slotIdx! + 1)} : تاهون ${formatNum(slot.tahun)} ${slot.kelas || ''} (${formatNum(slot.masa)})`
                : `KELAS ${slotIdx! + 1} : TAHUN ${slot.tahun} ${slot.kelas || ''} (${slot.masa || ''})`}
            </span>
            <span className="text-[11px] font-semibold text-emerald-200">
              {formatMataPelajaran(slot.mataPelajaran)}{slot.bidang ? ` - ${slot.bidang}` : ''}
            </span>
          </div>
        )}

        <table className="w-full border-collapse border-2 border-slate-900 text-xs sm:text-sm bg-white">
          <tbody>
            <tr>
              {/* Lajur Info & Refleksi Nisbah (~42%) */}
              <td className="w-[42%] border border-slate-900 align-top p-0">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-900">
                      <td className={`${compactCell} border border-slate-900`}>
                        <span className="font-bold text-slate-900">{getLabel('tahun', 'tahun')} : </span>
                        <span className="font-bold text-slate-900">
                          {slot.tahun ? (isJawi ? `تاهون ${formatNum(slot.tahun)}` : `Tahun ${slot.tahun}`) : '-'}
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-900">
                      <td className={`${compactCell} border border-slate-900`}>
                        <span className="font-bold text-slate-900">{getLabel('masa', 'masa')} : </span>
                        <span className="font-bold text-slate-900">{slot.masa ? formatNum(slot.masa) : '-'}</span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-900">
                      <td className={`${compactCell} border border-slate-900`}>
                        <span className="font-bold text-slate-900">{getLabel('kelas', 'kelas')} : </span>
                        <span className="font-bold text-slate-900">{slot.kelas || '-'}</span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-900">
                      <td className={`${compactCell} border border-slate-900`}>
                        <span className="font-bold text-slate-900">{getLabel('mataPelajaran', 'mataPelajaran')} : </span>
                        <span className="font-bold text-emerald-950">{formatMataPelajaran(slot.mataPelajaran)}</span>
                      </td>
                    </tr>
                    {isSlotAlQuran && (
                      <tr className="border-b border-slate-900 bg-amber-50/40">
                        <td className={`${compactCell} border border-slate-900`}>
                          <span className="font-bold text-slate-900">{getLabel('bidang', 'bidang')} : </span>
                          <span className="font-bold text-amber-950">{slot.bidang || ''}</span>
                        </td>
                      </tr>
                    )}
                    {/* Petak Refleksi Nisbah Murid */}
                    <tr>
                      <td className="p-2 border border-slate-900 bg-slate-50/30">
                        <div className="font-bold text-slate-900 mb-1 pb-0.5 border-b border-slate-300 text-xs">
                          {getLabel('refleksi', 'refleksiGuru')} :
                        </div>
                        <div className="space-y-1 text-xs font-medium text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                            <span>
                              <strong>{formatNum(sRefleksi.muridMenguasai || '0')}/{formatNum(sRefleksi.jumlahMurid || '0')}</strong>{' '}
                              {isJawi ? 'موريد مڠواساءي ڤمبلاجرن' : 'murid menguasai pembelajaran'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                            <span>
                              <strong>{formatNum(sRefleksi.muridTidakMenguasai || '0')}/{formatNum(sRefleksi.jumlahMurid || '0')}</strong>{' '}
                              {isJawi ? 'موريد تيدق داڤت مڠواساءي ڤمبلاجرن' : 'murid tidak dapat menguasai pembelajaran'}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>

              {/* Lajur Kandungan Pelajaran (~58%) */}
              <td className="w-[58%] border border-slate-900 align-top p-0">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-900">
                      <td className={`${compactCell} border border-slate-900`}>
                        <span className="font-bold text-slate-900">{getLabel('tajuk', 'tajuk')} : </span>
                        <span className="font-bold text-slate-900">
                          {slot.tajuk?.kod ? `${slot.tajuk.kod} ` : ''}{slot.tajuk?.teks || '-'}
                        </span>
                      </td>
                    </tr>
                    {slot.subtajuk?.teks && (
                      <tr className="border-b border-slate-900 bg-slate-50/40">
                        <td className={`${compactCell} border border-slate-900`}>
                          <span className="font-bold text-slate-800">{getLabel('subtajuk', 'subtajuk')} : </span>
                          <span className="font-medium text-slate-800">
                            {slot.subtajuk.kod ? `${slot.subtajuk.kod} ` : ''}{slot.subtajuk.teks}
                          </span>
                        </td>
                      </tr>
                    )}
                    <tr className="border-b border-slate-900">
                      <td className="p-2 border border-slate-900">
                        <div className="font-bold text-slate-900 mb-1 text-xs">
                          {getLabel('objektif', 'objektifPembelajaran')} :
                        </div>
                        <div className="text-xs px-1">
                          {renderBulletList(sObjektif, 'Tiada objektif dimasukkan.', Boolean(totalSlots && totalSlots >= 2))}
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-900 bg-slate-50/20">
                      <td className="p-2 border border-slate-900">
                        <div className="font-bold text-slate-900 mb-1 text-xs">
                          {getLabel('aktiviti', 'aktivitiMurid')} :
                        </div>
                        <div className="text-xs px-1">
                          {renderBulletList(sAktiviti, 'Tiada aktiviti dimasukkan.', Boolean(totalSlots && totalSlots >= 2))}
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-900 bg-emerald-50/20">
                      <td className={`${compactCell} border border-slate-900`}>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-bold text-slate-900 text-xs">
                            {getLabel('kemahiran', 'kemahiran')} :
                          </span>
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                              <span className={`text-sm font-extrabold ${sKemahiran?.lisan ? 'text-emerald-900' : 'text-slate-400'}`}>
                                {sKemahiran?.lisan ? '☑' : '☐'}
                              </span>
                              <span>{isJawi ? 'ليسن' : 'Lisan'}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                              <span className={`text-sm font-extrabold ${sKemahiran?.bertulis ? 'text-emerald-900' : 'text-slate-400'}`}>
                                {sKemahiran?.bertulis ? '☑' : '☐'}
                              </span>
                              <span>{isJawi ? 'برتوليس' : 'Bertulis'}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                              <span className={`text-sm font-extrabold ${sKemahiran?.pemerhatian ? 'text-emerald-900' : 'text-slate-400'}`}>
                                {sKemahiran?.pemerhatian ? '☑' : '☐'}
                              </span>
                              <span>{isJawi ? 'ڤمرهاتين' : 'Pemerhatian'}</span>
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* Tindakan Susulan / Catatan */}
                    <tr>
                      <td className="p-2 border border-slate-900">
                        <div className="font-bold text-slate-900 mb-0.5 text-xs">
                          {getLabel('catatan', 'catatan')} :
                        </div>
                        {sRefleksi.catatan ? (
                          <p className="text-slate-900 text-xs leading-relaxed px-1 font-normal whitespace-pre-wrap">
                            {sRefleksi.catatan}
                          </p>
                        ) : (
                          <p className="text-slate-400 italic text-[11px] px-1">
                            {isJawi ? 'تياد چاتتن دماسوقکن' : 'Tiada catatan tambahan.'}
                          </p>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      id="rph-pdf-printable-area"
      dir={isJawi ? 'rtl' : 'ltr'}
      className={`bg-white text-slate-900 mx-auto ${
        isCompactMulti ? 'p-3 sm:p-4' : 'p-5 sm:p-6'
      } rounded-xl shadow-lg border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full max-w-[780px] w-full transition-all ${
        isJawi
          ? isCompactMulti
            ? 'font-jawi text-[12px]'
            : 'font-jawi text-[13.5px]'
          : isCompactMulti
          ? 'font-sans text-[11px]'
          : 'font-sans text-[12.5px]'
      }`}
      style={{
        color: '#0f172a',
        lineHeight: isCompactMulti ? 1.3 : 1.45
      }}
    >
      {/* Header Banner with Nama Sekolah (Only if not already in custom layout) */}
      {!hasCustomHeader && (
        <div className={`text-center ${isCompactMulti ? 'pb-1.5 mb-2' : 'pb-2.5 mb-2.5'} border-b-2 border-emerald-800`}>
          {namaSekolah && (
            <div className={`${isCompactMulti ? 'text-[11px]' : 'text-xs sm:text-sm'} font-bold tracking-wider text-slate-800 uppercase mb-0.5`}>
              {namaSekolah}
            </div>
          )}
          <div className="flex items-center justify-center gap-2">
            {logoSekolah ? (
              <div className={`${isCompactMulti ? 'w-8 h-8' : 'w-10 h-10'} rounded-full border border-emerald-800 bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs`}>
                <img
                  src={logoSekolah}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className={`${isCompactMulti ? 'w-7 h-7 text-sm' : 'w-8 h-8 text-base'} rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs shrink-0`}>
                {isJawi ? 'ق' : 'K'}
              </div>
            )}
            <div>
              <h2 className={`font-bold text-emerald-950 ${
                isJawi
                  ? isCompactMulti ? 'text-base' : 'text-xl'
                  : isCompactMulti ? 'text-sm uppercase tracking-tight' : 'text-base sm:text-lg uppercase tracking-tight'
              }`}>
                {isJawi
                  ? 'رانچڠن ڤڠاجرن هارين (RPH) کـافـا'
                  : 'RANCANGAN PENGAJARAN HARIAN (RPH) KAFA'}
              </h2>
              {!isCompactMulti && (
                <p className="text-[11px] text-slate-600 font-medium">
                  {isJawi ? 'تاڤق ستندرد کوريکولوم کـافـا' : 'Tapak Standard Kurikulum KAFA (JAKIM / JAIN)'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {layoutStyle === 'custom' && customLayout && customLayout.blocks ? (
        /* ==================== FORMAT 3: CANVA A4 CUSTOM GRID LAYOUT ==================== */
        <div className="space-y-3">
          {customLayout.blocks.map((block) => {
            if (block.type === 'table') {
              return (
                <table
                  key={block.id}
                  className="w-full border-collapse border-2 border-slate-900 text-xs sm:text-sm bg-white"
                >
                  <tbody>
                    {(block.rows || []).map((row) => (
                      <tr key={row.id} className="border-b border-slate-900 last:border-b-0">
                        {row.cells.map((cell) => (
                          <td
                            key={cell.id}
                            style={{ width: `${cell.widthPercent || 100}%` }}
                            className="border border-slate-900 p-2 align-top"
                          >
                            {renderSectionContent(cell.sectionId)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            }

            if (block.type === 'split-columns' && block.splitColumns) {
              const rightWidth = block.splitColumns.right.widthPercent || 42;
              const leftWidth = block.splitColumns.left.widthPercent || 58;
              return (
                <table
                  key={block.id}
                  className="w-full border-collapse border-2 border-slate-900 text-xs sm:text-sm bg-white"
                >
                  <tbody>
                    <tr>
                      {/* Right / Sesi column in RTL */}
                      <td style={{ width: `${rightWidth}%` }} className="border border-slate-900 align-top p-0">
                        <table className="w-full border-collapse">
                          <tbody>
                            {block.splitColumns.right.rows.map((row) => (
                              <tr key={row.id} className="border-b border-slate-900 last:border-b-0">
                                {row.cells.map((cell) => (
                                  <td key={cell.id} className="p-2 border border-slate-900 align-top">
                                    {renderSectionContent(cell.sectionId)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>

                      {/* Left / PdP column in RTL */}
                      <td style={{ width: `${leftWidth}%` }} className="border border-slate-900 align-top p-0">
                        <table className="w-full border-collapse">
                          <tbody>
                            {block.splitColumns.left.rows.map((row) => (
                              <tr key={row.id} className="border-b border-slate-900 last:border-b-0">
                                {row.cells.map((cell) => (
                                  <td key={cell.id} className="p-2 border border-slate-900 align-top">
                                    {renderSectionContent(cell.sectionId)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              );
            }

            return null;
          })}
        </div>
      ) : layoutStyle === 'classic' ? (
        /* ==================== FORMAT 1: GRID TAPAK ASAL (AUTO KOMPAK 4 RPH DALAM 1 A4) ==================== */
        <div className={isCompactMulti ? 'space-y-2' : 'space-y-2.5'}>
          {/* Baris 1: Tarikh, Hari, Minggu (3 Petak Kemas Teratas - Dikongsi untuk Hari Ini) */}
          <table
            className={`w-full border-collapse border-2 border-slate-900 bg-white ${
              isCompactMulti ? 'text-[11px]' : 'text-xs sm:text-sm'
            }`}
          >
            <tbody>
              <tr className="bg-slate-50/75">
                <td className={`w-1/3 border border-slate-900 text-center ${isCompactMulti ? 'p-1' : 'p-1.5 sm:p-2'}`}>
                  <span className="font-bold text-slate-900">{getLabel('tarikh', 'tarikh')} : </span>
                  <span className="font-bold text-slate-900">{formatTarikh(data.tarikh)}</span>
                </td>
                <td className={`w-1/3 border border-slate-900 text-center ${isCompactMulti ? 'p-1' : 'p-1.5 sm:p-2'}`}>
                  <span className="font-bold text-slate-900">{getLabel('hari', 'hari')} : </span>
                  <span className="font-bold text-slate-900">{formatHari(data.hari)}</span>
                </td>
                <td className={`w-1/3 border border-slate-900 text-center ${isCompactMulti ? 'p-1' : 'p-1.5 sm:p-2'}`}>
                  <span className="font-bold text-slate-900">{getLabel('minggu', 'minggu')} : </span>
                  <span className="font-bold text-slate-900">{data.minggu ? formatNum(data.minggu) : '-'}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Senarai RPH Kelas: 3+ kelas guna susunan padat 4-dalam-1 A4 supaya muat jelas dalam 1 muka surat */}
          {isCompactMulti
            ? slotList.map((slot, idx) => renderCompactFourPerPageSlot(slot, idx, slotCount))
            : slotList.map((slot, idx) => renderClassicSlot(slot, idx, slotCount))}
        </div>
      ) : slotCount > 1 ? (
        /* ==================== FORMAT 2 (MULTI-RPH): LAJUR PENUH KOMPAK ==================== */
        <div className={isCompactMulti ? 'space-y-2' : 'space-y-2.5'}>
          <table
            className={`w-full border-collapse border-2 border-slate-900 bg-white ${
              isCompactMulti ? 'text-[11px]' : 'text-xs sm:text-sm'
            }`}
          >
            <tbody>
              <tr className="bg-slate-50/75">
                <td className={`w-1/3 border border-slate-900 text-center ${isCompactMulti ? 'p-1' : 'p-2'}`}>
                  <span className="font-bold text-slate-900">{getLabel('tarikh', 'tarikh')} : </span>
                  <span className="font-bold text-slate-900">{formatTarikh(data.tarikh)}</span>
                </td>
                <td className={`w-1/3 border border-slate-900 text-center ${isCompactMulti ? 'p-1' : 'p-2'}`}>
                  <span className="font-bold text-slate-900">{getLabel('hari', 'hari')} : </span>
                  <span className="font-bold text-slate-900">{formatHari(data.hari)}</span>
                </td>
                <td className={`w-1/3 border border-slate-900 text-center ${isCompactMulti ? 'p-1' : 'p-2'}`}>
                  <span className="font-bold text-slate-900">{getLabel('minggu', 'minggu')} : </span>
                  <span className="font-bold text-slate-900">{data.minggu ? formatNum(data.minggu) : '-'}</span>
                </td>
              </tr>
            </tbody>
          </table>
          {slotList.map((slot, idx) => renderCompactFourPerPageSlot(slot, idx, slotCount))}
        </div>
      ) : (
        /* ==================== FORMAT 2: GRID KEMAS & MODEN (SETIAP PETAK BERGARIS TEGAK & JELAS) ==================== */
        <table className="w-full border-collapse border-2 border-slate-900 text-xs sm:text-sm bg-white">
          <tbody>
            {/* Baris 1: Tarikh, Hari, Minggu (3 Petak Sama Saiz) */}
            <tr className="bg-slate-50/75">
              <td className="w-1/3 border border-slate-900 p-2 text-center">
                <span className="font-bold text-slate-900">{getLabel('tarikh', 'tarikh')} : </span>
                <span className="font-bold text-slate-900">{formatTarikh(data.tarikh)}</span>
              </td>
              <td className="w-1/3 border border-slate-900 p-2 text-center">
                <span className="font-bold text-slate-900">{getLabel('hari', 'hari')} : </span>
                <span className="font-bold text-slate-900">{formatHari(data.hari)}</span>
              </td>
              <td className="w-1/3 border border-slate-900 p-2 text-center">
                <span className="font-bold text-slate-900">{getLabel('minggu', 'minggu')} : </span>
                <span className="font-bold text-slate-900">{data.minggu ? formatNum(data.minggu) : '-'}</span>
              </td>
            </tr>

            {/* Baris 2: Tahun, Kelas, Masa (3 Petak Sama Saiz) */}
            <tr>
              <td className="w-1/3 border border-slate-900 p-2 text-center">
                <span className="font-bold text-slate-900">{getLabel('tahun', 'tahun')} : </span>
                <span className="font-bold text-slate-900">
                  {data.tahun ? (isJawi ? `تاهون ${formatNum(data.tahun)}` : `Tahun ${data.tahun}`) : '-'}
                </span>
              </td>
              <td className="w-1/3 border border-slate-900 p-2 text-center">
                <span className="font-bold text-slate-900">{getLabel('kelas', 'kelas')} : </span>
                <span className="font-bold text-slate-900">{data.kelas || '-'}</span>
              </td>
              <td className="w-1/3 border border-slate-900 p-2 text-center">
                <span className="font-bold text-slate-900">{getLabel('masa', 'masa')} : </span>
                <span className="font-bold text-slate-900">{data.masa ? formatNum(data.masa) : '-'}</span>
              </td>
            </tr>

            {/* Baris 3: Mata Pelajaran & Bidang (Bidang HANYA jika Al-Quran) */}
            <tr>
              {isAlQuran ? (
                <>
                  <td colSpan={2} className="border border-slate-900 p-2">
                    <span className="font-bold text-slate-900">{getLabel('mataPelajaran', 'mataPelajaran')} : </span>
                    <span className="font-bold text-emerald-950">{formatMataPelajaran(data.mataPelajaran)}</span>
                  </td>
                  <td colSpan={1} className="border border-slate-900 p-2 bg-amber-50/40">
                    <span className="font-bold text-slate-900">{getLabel('bidang', 'bidang')} : </span>
                    <span className="font-bold text-amber-950">{data.bidang || ''}</span>
                  </td>
                </>
              ) : (
                <td colSpan={3} className="border border-slate-900 p-2">
                  <span className="font-bold text-slate-900">{getLabel('mataPelajaran', 'mataPelajaran')} : </span>
                  <span className="font-bold text-emerald-950">{formatMataPelajaran(data.mataPelajaran)}</span>
                </td>
              )}
            </tr>

            {/* Baris 4: Tajuk */}
            <tr>
              <td colSpan={3} className="border border-slate-900 p-2">
                <span className="font-bold text-slate-900">{getLabel('tajuk', 'tajuk')} : </span>
                <span className="font-bold text-slate-900">
                  {data.tajuk.kod ? `${data.tajuk.kod} ` : ''}{data.tajuk.teks || '-'}
                </span>
              </td>
            </tr>

            {/* Baris 5: Subtajuk (Pilihan) */}
            {data.subtajuk?.teks && (
              <tr className="bg-slate-50/40">
                <td colSpan={3} className="border border-slate-900 p-2">
                  <span className="font-bold text-slate-800">{getLabel('subtajuk', 'subtajuk')} : </span>
                  <span className="font-medium text-slate-800">
                    {data.subtajuk.kod ? `${data.subtajuk.kod} ` : ''}{data.subtajuk.teks}
                  </span>
                </td>
              </tr>
            )}

            {/* Baris 6: Objektif Pembelajaran */}
            <tr>
              <td colSpan={3} className="border border-slate-900 p-2.5">
                <div className="font-bold text-slate-900 mb-1">
                  {getLabel('objektif', 'objektifPembelajaran')} :
                </div>
                <ul className="list-disc pr-5 pl-5 space-y-1">
                  {data.objektifPembelajaran && data.objektifPembelajaran.filter((o: string) => o.trim()).length > 0 ? (
                    data.objektifPembelajaran.filter((o: string) => o.trim()).map((obj: string, i: number) => (
                      <li key={i} className="text-slate-900 font-medium leading-normal">{obj}</li>
                    ))
                  ) : (
                    <li className="text-slate-400 italic list-none">Tiada objektif dimasukkan.</li>
                  )}
                </ul>
              </td>
            </tr>

            {/* Baris 7: Aktiviti Murid */}
            <tr className="bg-slate-50/20">
              <td colSpan={3} className="border border-slate-900 p-2.5">
                <div className="font-bold text-slate-900 mb-1">
                  {getLabel('aktiviti', 'aktivitiMurid')} :
                </div>
                <ul className="list-disc pr-5 pl-5 space-y-1">
                  {data.aktivitiMurid && data.aktivitiMurid.filter((a: string) => a.trim()).length > 0 ? (
                    data.aktivitiMurid.filter((a: string) => a.trim()).map((akt: string, i: number) => (
                      <li key={i} className="text-slate-900 font-medium leading-normal">{akt}</li>
                    ))
                  ) : (
                    <li className="text-slate-400 italic list-none">Tiada aktiviti dimasukkan.</li>
                  )}
                </ul>
              </td>
            </tr>

            {/* Baris 8: Kemahiran (TICK BOXES) */}
            <tr className="bg-emerald-50/20">
              <td colSpan={3} className="border border-slate-900 p-2">
                <div className="flex flex-wrap items-center gap-6">
                  <span className="font-bold text-slate-900">
                    {getLabel('kemahiran', 'kemahiran')} :
                  </span>
                  <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                      <span className={`text-base font-extrabold ${data.kemahiran?.lisan ? 'text-emerald-900' : 'text-slate-400'}`}>
                        {data.kemahiran?.lisan ? '☑' : '☐'}
                      </span>
                      <span>{isJawi ? 'ليسن' : 'Lisan'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                      <span className={`text-base font-extrabold ${data.kemahiran?.bertulis ? 'text-emerald-900' : 'text-slate-400'}`}>
                        {data.kemahiran?.bertulis ? '☑' : '☐'}
                      </span>
                      <span>{isJawi ? 'برتوليس' : 'Bertulis'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                      <span className={`text-base font-extrabold ${data.kemahiran?.pemerhatian ? 'text-emerald-900' : 'text-slate-400'}`}>
                        {data.kemahiran?.pemerhatian ? '☑' : '☐'}
                      </span>
                      <span>{isJawi ? 'ڤمرهاتين' : 'Pemerhatian'}</span>
                    </span>
                  </div>
                </div>
              </td>
            </tr>

            {/* Baris 9: Refleksi Guru & Tindakan Susulan */}
            <tr>
              <td colSpan={3} className="border border-slate-900 p-2.5">
                <div className="font-bold text-slate-900 mb-1">
                  {getLabel('refleksi', 'refleksiGuru')} :
                </div>
                
                <div className="space-y-1.5 text-xs sm:text-sm font-medium text-slate-900 mb-2.5 pr-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                    <span>
                      <strong>{formatNum(data.refleksi.muridMenguasai || '0')}/{formatNum(data.refleksi.jumlahMurid || '0')}</strong>{' '}
                      {isJawi ? 'موريد مڠواساءي ڤمبلاجرن' : 'murid menguasai pembelajaran'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                    <span>
                      <strong>{formatNum(data.refleksi.muridTidakMenguasai || '0')}/{formatNum(data.refleksi.jumlahMurid || '0')}</strong>{' '}
                      {isJawi ? 'موريد تيدق داڤت مڠواساءي ڤمبلاجرن' : 'murid tidak dapat menguasai pembelajaran'}
                    </span>
                  </div>
                </div>

                {/* Tindakan Susulan / Catatan (Tiada petak berasingan yang bertindih) */}
                <div className="mt-2.5 pt-2 border-t border-slate-300">
                  <div className="font-bold text-slate-900 text-xs sm:text-sm mb-1">
                    {getLabel('catatan', 'catatan')} :
                  </div>
                  {data.refleksi.catatan ? (
                    <p className="text-slate-900 text-xs sm:text-sm leading-relaxed px-1 font-normal whitespace-pre-wrap">
                      {data.refleksi.catatan}
                    </p>
                  ) : (
                    <p className="text-slate-400 italic text-xs px-1">
                      {isJawi ? 'تياد چاتتن دماسوقکن' : 'Tiada catatan tambahan.'}
                    </p>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Footer Tandatangan Guru & Guru Besar */}
      {!hasCustomSignature && (
        <div
          className={`${
            isCompactMulti ? 'mt-2.5 pt-2' : 'mt-4 pt-3'
          } border-t-2 border-slate-400 grid grid-cols-2 text-center ${
            isCompactMulti ? 'text-[11px]' : 'text-xs'
          } text-slate-800`}
        >
          <div>
            <div className={isCompactMulti ? 'h-6' : 'h-9'}></div>
            <div className="w-36 border-b border-slate-600 mx-auto"></div>
            <p className="mt-1 font-bold">
              {customLabels?.tandatanganGuru
                ? (isJawi ? customLabels.tandatanganGuru.jawi : customLabels.tandatanganGuru.rumi)
                : (isJawi ? 'تانداتاڠن ڬورو' : 'Tandatangan Guru')}
            </p>
          </div>
          <div>
            <div className={isCompactMulti ? 'h-6' : 'h-9'}></div>
            <div className="w-36 border-b border-slate-600 mx-auto"></div>
            <p className="mt-1 font-bold">
              {customLabels?.tandatanganGuruBesar
                ? (isJawi ? customLabels.tandatanganGuruBesar.jawi : customLabels.tandatanganGuruBesar.rumi)
                : (isJawi ? 'تانداتاڠن ڬورو بسر / ڤڽلارس' : 'Tandatangan Guru Besar / Penyelaras')}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
