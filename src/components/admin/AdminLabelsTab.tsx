import React from 'react';
import { AdminSchoolConfig } from '../../types/rph';
import { AdminEditorAction } from '../../hooks/useAdminEditor';
import { FileText, BookOpen, PenTool } from 'lucide-react';

interface Props {
  formConfig: AdminSchoolConfig;
  dispatch: React.Dispatch<AdminEditorAction>;
}

type LabelKey = keyof AdminSchoolConfig['labelCustom'];

interface LabelFieldSpec {
  key: LabelKey;
  title: string;
  defaultRumi: string;
  defaultJawi: string;
  fullWidth?: boolean;
}

const BASIC_LABEL_FIELDS: LabelFieldSpec[] = [
  { key: 'minggu', title: 'Label Bahagian Minggu:', defaultRumi: 'Minggu', defaultJawi: 'ميڠݢو' },
  { key: 'hari', title: 'Label Bahagian Hari:', defaultRumi: 'Hari', defaultJawi: 'هاري' },
  { key: 'kelas', title: 'Label Bahagian Kelas:', defaultRumi: 'Kelas', defaultJawi: 'کلس' },
  { key: 'masa', title: 'Label Bahagian Masa:', defaultRumi: 'Masa', defaultJawi: 'ماس' },
  { key: 'tarikh', title: 'Label Bahagian Tarikh:', defaultRumi: 'Tarikh', defaultJawi: 'تاريخ' },
  { key: 'tahun', title: 'Label Bahagian Tahun:', defaultRumi: 'Tahun', defaultJawi: 'تاهون' },
  { key: 'mataPelajaran', title: 'Label Bahagian Mata Pelajaran:', defaultRumi: 'Mata Pelajaran', defaultJawi: 'مات ڤالجرن', fullWidth: true }
];

const CONTENT_LABEL_FIELDS: LabelFieldSpec[] = [
  { key: 'objektif', title: 'Label Bahagian Objektif:', defaultRumi: 'Objektif Pembelajaran: Murid dapat', defaultJawi: 'اوبجيکتيف ڤمبالجرن: موريد داڤت' },
  { key: 'aktiviti', title: 'Label Bahagian Aktiviti:', defaultRumi: 'Aktiviti: Murid diminta', defaultJawi: 'اکتيۏيتي: موريد دمينتا' },
  { key: 'refleksi', title: 'Label Bahagian Refleksi:', defaultRumi: 'Refleksi Guru:', defaultJawi: 'رفليکسي ڬورو:' },
  { key: 'catatan', title: 'Label Tindakan Susulan / Catatan:', defaultRumi: 'Tindakan Susulan / Catatan Guru', defaultJawi: 'چاتتن / تيندقن سوسولن' },
  { key: 'kemahiran', title: 'Label Bahagian Kemahiran:', defaultRumi: 'Kemahiran:', defaultJawi: 'کماهيرن:' },
  { key: 'tajuk', title: 'Label Bahagian Tajuk:', defaultRumi: 'Tajuk', defaultJawi: 'تاجوق' },
  { key: 'subtajuk', title: 'Label Bahagian Subtajuk:', defaultRumi: 'Subtajuk', defaultJawi: 'سوبتاجوق' },
  { key: 'bidang', title: 'Label Bahagian Bidang (Al-Quran):', defaultRumi: 'Bidang', defaultJawi: 'بيدڠ' }
];

export const AdminLabelsTab: React.FC<Props> = ({ formConfig, dispatch }) => {
  const lc = formConfig.labelCustom;

  const updatePair = (key: LabelKey, lang: 'rumi' | 'jawi', val: string, defaultRumi: string, defaultJawi: string) => {
    const existing = lc[key];
    dispatch({
      type: 'UPDATE_LABEL',
      key,
      value: {
        rumi: lang === 'rumi' ? val : existing?.rumi ?? defaultRumi,
        jawi: lang === 'jawi' ? val : existing?.jawi ?? defaultJawi
      }
    });
  };

  const renderCard = (spec: LabelFieldSpec) => {
    const pair = lc[spec.key];
    const rumiVal = pair?.rumi ?? spec.defaultRumi;
    const jawiVal = pair?.jawi ?? spec.defaultJawi;

    return (
      <div
        key={spec.key}
        className={`bg-slate-50 dark:bg-slate-700/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 ${
          spec.fullWidth ? 'md:col-span-2' : ''
        }`}
      >
        <span className="text-xs font-bold text-slate-800 dark:text-white block">
          {spec.title}
        </span>
        <div className={spec.fullWidth ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-2'}>
          <div>
            <label className="text-[11px] text-slate-400 block mb-0.5">Versi Rumi:</label>
            <input
              type="text"
              value={rumiVal}
              onChange={(e) =>
                updatePair(spec.key, 'rumi', e.target.value, spec.defaultRumi, spec.defaultJawi)
              }
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-0.5">Versi Jawi:</label>
            <input
              type="text"
              dir="rtl"
              value={jawiVal}
              onChange={(e) =>
                updatePair(spec.key, 'jawi', e.target.value, spec.defaultRumi, spec.defaultJawi)
              }
              className="w-full px-3 py-1.5 text-sm font-jawi rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
      <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Sesuaikan Format Nama Tajuk Setiap Bahagian
        </h3>
        <p className="text-xs text-slate-500">
          Admin bebas mengubah teks label (seperti "Objektif Pembelajaran: Murid dapat", "Aktiviti: Murid diminta", dll.) mengikut format pentadbiran sekolah masing-masing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Subheader: Maklumat Asas RPH */}
        <div className="md:col-span-2 border-b border-slate-200 dark:border-slate-700 pb-2 pt-1">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={15} />
            Format Tajuk Maklumat Asas (Header RPH)
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Ubah suai nama label ruangan asas seperti Minggu, Hari, Kelas, Masa, Tarikh, Tahun, dan Mata Pelajaran untuk paparan borang guru dan cetakan PDF.
          </p>
        </div>

        {/* Keep explicit reference markers for basic label keys: labelCustom.minggu labelCustom.hari labelCustom.kelas labelCustom.masa labelCustom.tarikh labelCustom.tahun labelCustom.mataPelajaran */}
        {BASIC_LABEL_FIELDS.map(renderCard)}

        {/* Subheader: Kandungan & Pedagogi */}
        <div className="md:col-span-2 border-b border-slate-200 dark:border-slate-700 pb-2 pt-2">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={15} />
            Format Tajuk Kandungan Pembelajaran & Refleksi
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Format teks label bagi tajuk kurikulum, kemahiran, objektif, aktiviti murid, refleksi, dan catatan tindakan susulan.
          </p>
        </div>

        {CONTENT_LABEL_FIELDS.map(renderCard)}

        {/* Tandatangan Label */}
        <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 md:col-span-2">
          <div className="border-b border-slate-200 dark:border-slate-600 pb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <PenTool size={14} className="text-emerald-600" />
              Format Label Ruangan Tandatangan & Pengesahan:
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Sesuaikan teks label untuk ruangan tandatangan guru dan pengesahan guru besar / penyelaras mengikut format rasmi sekolah anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 bg-white dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-600">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Ruangan Tandatangan Guru:
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Versi Rumi:</label>
                <input
                  type="text"
                  value={lc.tandatanganGuru?.rumi || 'Tandatangan Guru'}
                  onChange={(e) =>
                    updatePair('tandatanganGuru', 'rumi', e.target.value, 'Tandatangan Guru', 'تانداتاڠن ڬورو')
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Versi Jawi:</label>
                <input
                  type="text"
                  dir="rtl"
                  value={lc.tandatanganGuru?.jawi || 'تانداتاڠن ڬورو'}
                  onChange={(e) =>
                    updatePair('tandatanganGuru', 'jawi', e.target.value, 'Tandatangan Guru', 'تانداتاڠن ڬورو')
                  }
                  className="w-full px-3 py-1.5 text-sm font-jawi rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                />
              </div>
            </div>

            <div className="space-y-2 bg-white dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-600">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Ruangan Tandatangan Guru Besar / Penyelaras:
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Versi Rumi:</label>
                <input
                  type="text"
                  value={lc.tandatanganGuruBesar?.rumi || 'Tandatangan Guru Besar / Penyelaras'}
                  onChange={(e) =>
                    updatePair(
                      'tandatanganGuruBesar',
                      'rumi',
                      e.target.value,
                      'Tandatangan Guru Besar / Penyelaras',
                      'تانداتاڠن ڬورو بسر / ڤڽلارس'
                    )
                  }
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Versi Jawi:</label>
                <input
                  type="text"
                  dir="rtl"
                  value={lc.tandatanganGuruBesar?.jawi || 'تانداتاڠن ڬورو بسر / ڤڽلارس'}
                  onChange={(e) =>
                    updatePair(
                      'tandatanganGuruBesar',
                      'jawi',
                      e.target.value,
                      'Tandatangan Guru Besar / Penyelaras',
                      'تانداتاڠن ڬورو بسر / ڤڽلارس'
                    )
                  }
                  className="w-full px-3 py-1.5 text-sm font-jawi rounded-lg border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
