import React, { useState, useEffect } from 'react';
import { AdminSchoolConfig, TeacherDailyForm, AppPage, ScriptMode } from './types/rph';
import {
  loadAdminConfig,
  saveAdminConfig,
  resetAdminConfigToDefault,
  loadTeacherForm,
  saveTeacherForm,
  resetTeacherForm
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { TeacherView } from './components/TeacherView';
import { AdminView } from './components/AdminView';
import { AlertTriangle, Save, X } from 'lucide-react';

const SCRIPT_STORAGE_KEY = 'rph_kafa_v3_script_mode';
const THEME_STORAGE_KEY = 'rph_kafa_v3_theme';

export const App: React.FC = () => {
  // Admin school configuration & bank
  const [adminConfig, setAdminConfig] = useState<AdminSchoolConfig>(() => loadAdminConfig());

  // Track admin unsaved changes
  const [adminIsDirty, setAdminIsDirty] = useState<boolean>(false);
  const [pendingAdminConfig, setPendingAdminConfig] = useState<AdminSchoolConfig | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false);

  // Teacher daily form data
  const [teacherForm, setTeacherForm] = useState<TeacherDailyForm>(() => loadTeacherForm());

  // 2 Pages: 'guru' (default home) or 'admin'
  const [currentPage, setCurrentPage] = useState<AppPage>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'admin' || hash === 'guru') {
      return hash;
    }
    return 'guru'; // default to teacher page
  });

  // Script Mode (Jawi ⇄ Rumi)
  const [skrip, setSkrip] = useState<ScriptMode>(() => {
    try {
      const saved = localStorage.getItem(SCRIPT_STORAGE_KEY);
      if (saved === 'jawi' || saved === 'rumi') return saved;
    } catch {
      // ignore
    }
    return 'jawi';
  });

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Sync route with window.location.hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'guru' && adminIsDirty) {
        // Intercept hash navigation if admin has unsaved changes
        setShowUnsavedModal(true);
        window.location.hash = 'admin';
        return;
      }
      if (hash === 'admin' || hash === 'guru') {
        setCurrentPage(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [adminIsDirty]);

  const navigateTo = (page: AppPage) => {
    if (currentPage === 'admin' && page === 'guru' && adminIsDirty) {
      setShowUnsavedModal(true);
      return;
    }
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDarkMode]);

  // Sync script mode
  const handleToggleSkrip = () => {
    const next = skrip === 'jawi' ? 'rumi' : 'jawi';
    setSkrip(next);
    localStorage.setItem(SCRIPT_STORAGE_KEY, next);
  };

  // Admin save handler
  const handleSaveAdminConfig = (newConfig: AdminSchoolConfig) => {
    saveAdminConfig(newConfig);
    setAdminConfig(newConfig);
  };

  const handleResetAdminConfig = () => {
    const def = resetAdminConfigToDefault();
    setAdminConfig(def);
  };

  // Teacher form update handler
  const handleUpdateTeacherForm = (fields: Partial<TeacherDailyForm>) => {
    const updated = { ...teacherForm, ...fields };
    setTeacherForm(updated);
    saveTeacherForm(updated);
  };

  const handleResetTeacherForm = () => {
    const reset = resetTeacherForm();
    setTeacherForm(reset);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900 transition-colors">
      
      {/* 2-Page Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        namaSekolah={adminConfig.namaSekolah}
        logoSekolah={adminConfig.logoSekolah}
        skrip={skrip}
        onToggleSkrip={handleToggleSkrip}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-6">
        {currentPage === 'guru' && (
          <TeacherView
            config={adminConfig}
            form={teacherForm}
            onUpdateForm={handleUpdateTeacherForm}
            onResetForm={handleResetTeacherForm}
            onImportSchoolConfig={handleSaveAdminConfig}
            onImportTeacherForm={(imported) => {
              setTeacherForm(imported);
              saveTeacherForm(imported);
            }}
            skrip={skrip}
          />
        )}

        {currentPage === 'admin' && (
          <AdminView
            config={adminConfig}
            onSaveConfig={(newCfg) => {
              handleSaveAdminConfig(newCfg);
              setAdminIsDirty(false);
              setPendingAdminConfig(null);
            }}
            onResetToDefault={handleResetAdminConfig}
            onGoToTeacherView={() => navigateTo('guru')}
            skrip={skrip}
            onDirtyChange={(dirty, currentCfg) => {
              setAdminIsDirty(dirty);
              setPendingAdminConfig(currentCfg);
            }}
          />
        )}
      </main>

      {/* Pop-up Amaran Belum Simpan Bila Pergi Ke Halaman Guru */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl shrink-0">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Perubahan Belum Disimpan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Panel Pentadbir / Admin Sekolah
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Anda sedang membuat perubahan pada tetapan atau bank data yang <strong>belum disimpan</strong>. Adakah anda ingin menyimpan perubahan ini sekarang sebelum beralih ke Halaman Guru?
            </p>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (pendingAdminConfig) {
                    handleSaveAdminConfig(pendingAdminConfig);
                  }
                  setAdminIsDirty(false);
                  setShowUnsavedModal(false);
                  setCurrentPage('guru');
                  window.location.hash = 'guru';
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Save size={16} />
                <span>Simpan Perubahan & Teruskan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminIsDirty(false);
                  setPendingAdminConfig(null);
                  setShowUnsavedModal(false);
                  setCurrentPage('guru');
                  window.location.hash = 'guru';
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-rose-200 dark:border-rose-800"
              >
                <X size={16} />
                <span>Jangan Simpan (Abaikan Perubahan)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUnsavedModal(false)}
                className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium text-xs text-center transition-colors cursor-pointer"
              >
                Batal (Kekal di Panel Admin)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400 no-print mt-auto">
        <p>
          {adminConfig.namaSekolah} &copy; 2026. Sistem RPH KAFA 2 Halaman (Halaman Guru & Panel Admin).
        </p>
      </footer>

    </div>
  );
};
