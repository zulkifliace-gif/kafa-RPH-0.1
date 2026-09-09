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

  return (
    <div
      id="rph-pdf-printable-area"
      dir={isJawi ? 'rtl' : 'ltr'}
      className={`bg-white text-slate-900 mx-auto p-5 sm:p-7 rounded-xl shadow-lg border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full max-w-[780px] w-full transition-all ${
        isJawi ? 'font-jawi text-[13.5px]' : 'font-sans text-[12.5px]'
      }`}
      style={{
        color: '#0f172a',
        lineHeight: 1.45
      }}
    >
      {/* Header Banner with Nama Sekolah (Only if not already in custom layout) */}
      {!hasCustomHeader && (
        <div className="text-center pb-3 mb-3 border-b-2 border-emerald-800">
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
                {isJawi
                  ? 'رانچڠن ڤڠاجرن هارين (RPH) کـافـا'
                  : 'RANCANGAN PENGAJARAN HARIAN (RPH) KAFA'}
              </h2>
              <p className="text-[11px] text-slate-600 font-medium">
                {isJawi ? 'تاڤق ستندرد کوريکولوم کـافـا' : 'Tapak Standard Kurikulum KAFA (JAKIM / JAIN)'}
              </p>
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
        /* ==================== FORMAT 1: GRID TAPAK ASAL (2 LAJUR MENGIKUT DOKUMEN TAPAK RPH) ==================== */
        <table className="w-full border-collapse border-2 border-slate-900 text-xs sm:text-sm bg-white">
          <tbody>
            {/* Baris 1: Tarikh, Hari, Minggu (3 Petak Kemas Teratas) */}
            <tr className="border-b-2 border-slate-900 bg-slate-50/75">
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

            {/* Baris 2: Bahagian Utama 2 Lajur */}
            <tr>
              {/* Lajur Info & Refleksi Nisbah (Kanan dalam Jawi, Kiri dalam Rumi ~42%) */}
              <td className="w-[42%] border border-slate-900 align-top p-0">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-900">
                      <td className="p-2 border border-slate-900">
                        <span className="font-bold text-slate-900">{getLabel('tahun', 'tahun')} : </span>
                        <span className="font-bold text-slate-900">
                          {data.tahun ? (isJawi ? `تاهون ${formatNum(data.tahun)}` : `Tahun ${data.tahun}`) : '-'}
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-900">
                      <td className="p-2 border border-slate-900">
                        <span className="font-bold text-slate-900">{getLabel('masa', 'masa')} : </span>
                        <span className="font-bold text-slate-900">{data.masa ? formatNum(data.masa) : '-'}</span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-900">
                      <td className="p-2 border border-slate-900">
                        <span className="font-bold text-slate-900">{getLabel('kelas', 'kelas')} : </span>
                        <span className="font-bold text-slate-900">{data.kelas || '-'}</span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-900">
                      <td className="p-2 border border-slate-900">
                        <span className="font-bold text-slate-900">{getLabel('mataPelajaran', 'mataPelajaran')} : </span>
                        <span className="font-bold text-emerald-950">{formatMataPelajaran(data.mataPelajaran)}</span>
                      </td>
                    </tr>
                    {isAlQuran && (
                      <tr className="border-b border-slate-900 bg-amber-50/40">
                        <td className="p-2 border border-slate-900">
                          <span className="font-bold text-slate-900">{getLabel('bidang', 'bidang')} : </span>
                          <span className="font-bold text-amber-950">{data.bidang || ''}</span>
                        </td>
                      </tr>
                    )}
                    {/* Petak Refleksi Nisbah Murid */}
                    <tr>
                      <td className="p-2.5 border border-slate-900 bg-slate-50/30">
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
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>

              {/* Lajur Kandungan Pelajaran (Kiri dalam Jawi, Kanan dalam Rumi ~58%) */}
              <td className="w-[58%] border border-slate-900 align-top p-0">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-900">
                      <td className="p-2 border border-slate-900">
                        <span className="font-bold text-slate-900">{getLabel('tajuk', 'tajuk')} : </span>
                        <span className="font-bold text-slate-900">
                          {data.tajuk.kod ? `${data.tajuk.kod} ` : ''}{data.tajuk.teks || '-'}
                        </span>
                      </td>
                    </tr>
                    {data.subtajuk?.teks && (
                      <tr className="border-b border-slate-900 bg-slate-50/40">
                        <td className="p-2 border border-slate-900">
                          <span className="font-bold text-slate-800">{getLabel('subtajuk', 'subtajuk')} : </span>
                          <span className="font-medium text-slate-800">
                            {data.subtajuk.kod ? `${data.subtajuk.kod} ` : ''}{data.subtajuk.teks}
                          </span>
                        </td>
                      </tr>
                    )}
                    <tr className="border-b border-slate-900">
                      <td className="p-2.5 border border-slate-900">
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
                    <tr className="border-b border-slate-900 bg-slate-50/20">
                      <td className="p-2.5 border border-slate-900">
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
                    <tr className="border-b border-slate-900 bg-emerald-50/20">
                      <td className="p-2 border border-slate-900">
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
                      </td>
                    </tr>
                    {/* Tindakan Susulan / Catatan (Tiada petak bertindih) */}
                    <tr>
                      <td className="p-2.5 border border-slate-900">
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
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
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
        <div className="mt-5 pt-3 border-t-2 border-slate-400 grid grid-cols-2 text-center text-xs text-slate-800">
          <div>
            <div className="h-10"></div>
            <div className="w-36 border-b border-slate-600 mx-auto"></div>
            <p className="mt-1 font-bold">
              {customLabels?.tandatanganGuru
                ? (isJawi ? customLabels.tandatanganGuru.jawi : customLabels.tandatanganGuru.rumi)
                : (isJawi ? 'تانداتاڠن ڬورو' : 'Tandatangan Guru')}
            </p>
          </div>
          <div>
            <div className="h-10"></div>
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
