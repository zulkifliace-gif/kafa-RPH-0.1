import React from 'react';
import { AdminSchoolConfig } from '../../types/rph';
import { AdminEditorAction } from '../../hooks/useAdminEditor';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Key,
  FileJson,
  Download
} from 'lucide-react';

interface Props {
  formConfig: AdminSchoolConfig;
  dispatch: React.Dispatch<AdminEditorAction>;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
  onExportSchoolData: () => void;
  onImportSchoolData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AdminProfileTab: React.FC<Props> = ({
  formConfig,
  dispatch,
  onLogoUpload,
  onRemoveLogo,
  onExportSchoolData,
  onImportSchoolData
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
      <div className="border-b border-slate-100 dark:border-slate-700 pb-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Identiti Sekolah & Kepala Dokumen
        </h3>
        <p className="text-xs text-slate-500">
          Maklumat ini akan dipaparkan di bahagian atas halaman guru dan kepala dokumen PDF RPH.
        </p>
      </div>

      <div className="space-y-4">
        {/* Logo Sekolah Upload Section */}
        <div className="bg-slate-50 dark:bg-slate-700/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ImageIcon size={16} className="text-emerald-600" />
              <span>Gambar Logo Sekolah:</span>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Muat naik fail logo sekolah anda (PNG / JPG / WEBP). Logo ini akan dipaparkan pada Bar Navigasi, Header Hero Halaman Guru, dan Kepala Dokumen PDF RPH.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-xs">
              {formConfig.logoSekolah ? (
                <img
                  src={formConfig.logoSekolah}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <ImageIcon size={28} className="mx-auto mb-1 opacity-50" />
                  <span className="text-[9px] font-bold block">Tiada Logo</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <label className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors">
                <Upload size={14} />
                <span>{formConfig.logoSekolah ? 'Tukar Gambar Logo' : 'Muat Naik Gambar Logo'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={onLogoUpload}
                  className="hidden"
                />
              </label>

              {formConfig.logoSekolah && (
                <button
                  type="button"
                  onClick={onRemoveLogo}
                  className="px-3.5 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Buang Logo</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Nama Sekolah / Pusat KAFA:
          </label>
          <input
            type="text"
            value={formConfig.namaSekolah}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_PROFILE', fields: { namaSekolah: e.target.value } })
            }
            placeholder="Cth: KAFA INTEGRASI NURUL IMAN"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Slogan / Subtitle Kurikulum:
          </label>
          <input
            type="text"
            value={formConfig.subSlogan}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_PROFILE', fields: { subSlogan: e.target.value } })
            }
            placeholder="Cth: Tapak Standard Kurikulum KAFA (JAKIM / JAIN)"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Guru Besar / Penyelaras (Tandatangan):
            </label>
            <input
              type="text"
              value={formConfig.namaGuruBesar}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_PROFILE', fields: { namaGuruBesar: e.target.value } })
              }
              placeholder="Cth: USTAZAH FATIMAH BINTI AHMAD"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Key size={14} className="text-emerald-600" />
              PIN Keselamatan Admin:
            </label>
            <input
              type="text"
              value={formConfig.adminPin}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_PROFILE', fields: { adminPin: e.target.value } })
              }
              placeholder="1234"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white text-slate-900 dark:bg-slate-700 dark:text-white font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[11px] text-slate-400">
              Gunakan PIN ini untuk masuk semula ke halaman Admin kelak.
            </span>
          </div>
        </div>

        {/* Offline Data Distribution & Installation Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-5 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/60 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileJson size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                Pengedaran & Pemasangan Data Sekolah (100% Offline / Tanpa Cloud)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Sistem ini tidak memerlukan pangkalan data awan. Anda boleh memuat turun fail tetapan sekolah (<strong>.json</strong>) dan menghantarnya ke dalam kumpulan WhatsApp / Telegram guru. Guru hanya perlu klik butang <strong>"Pasang Data Sekolah"</strong> di telefon mereka untuk memuatkan logo, subjek, jadual, dan format sekolah secara serta-merta!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onExportSchoolData}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Download size={15} />
              <span>Muat Turun Fail Data Sekolah (.json)</span>
            </button>

            <label className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer">
              <Upload size={15} className="text-emerald-600" />
              <span>Pasang / Pulihkan Fail Data (.json)</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={onImportSchoolData}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
