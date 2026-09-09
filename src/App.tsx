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

const SCRIPT_STORAGE_KEY = 'rph_kafa_v3_script_mode';
const THEME_STORAGE_KEY = 'rph_kafa_v3_theme';

export const App: React.FC = () => {
  // Admin school configuration & bank
  const [adminConfig, setAdminConfig] = useState<AdminSchoolConfig>(() => loadAdminConfig());

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
      if (hash === 'admin' || hash === 'guru') {
        setCurrentPage(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: AppPage) => {
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
            onSaveConfig={handleSaveAdminConfig}
            onResetToDefault={handleResetAdminConfig}
            onGoToTeacherView={() => navigateTo('guru')}
            skrip={skrip}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400 no-print mt-auto">
        <p>
          {adminConfig.namaSekolah} &copy; 2026. Sistem RPH KAFA 2 Halaman (Halaman Guru & Panel Admin).
        </p>
      </footer>

    </div>
  );
};
