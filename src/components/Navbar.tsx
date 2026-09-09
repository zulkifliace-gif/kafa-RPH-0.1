import React from 'react';
import { AppPage, ScriptMode } from '../types/rph';
import { BookOpenCheck, Settings, Languages, Moon, Sun } from 'lucide-react';

interface Props {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  namaSekolah: string;
  logoSekolah?: string;
  skrip: ScriptMode;
  onToggleSkrip: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentPage,
  onNavigate,
  namaSekolah,
  logoSekolah,
  skrip,
  onToggleSkrip,
  isDarkMode,
  onToggleDarkMode
}) => {
  const isJawi = skrip === 'jawi';

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-3">
          
          {/* Top Row on Mobile: Logo, School Name & Quick Tools */}
          <div className="flex items-center justify-between gap-2 w-full md:w-auto">
            
            {/* Logo & School Name */}
            <div
              onClick={() => onNavigate('guru')}
              className="flex items-center gap-2 cursor-pointer select-none group min-w-0"
            >
              {logoSekolah ? (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                  <img
                    src={logoSekolah}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <span className="font-jawi text-lg sm:text-xl font-bold">ق</span>
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white leading-tight truncate max-w-[150px] xs:max-w-[200px] sm:max-w-xs md:max-w-md">
                    {namaSekolah || 'RPH KAFA'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                    2 Page
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium truncate">
                  {isJawi ? 'سيسـتم ڤڠيسين ر.ڤ.هـ کـافـا' : 'Sistem Pengisian RPH KAFA Standard'}
                </p>
              </div>
            </div>

            {/* Right Tools on Mobile (Language Switcher & Dark Mode) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 md:order-last">
              
              {/* Jawi / Rumi Toggle */}
              <button
                type="button"
                onClick={onToggleSkrip}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 text-xs font-semibold transition-all shadow-xs"
                title="Tukar antara mod Jawi dan Rumi"
              >
                <Languages size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span className={`px-1 py-0.5 rounded text-[10px] sm:text-[11px] font-bold ${isJawi ? 'bg-emerald-600 text-white font-jawi' : 'text-slate-500'}`}>
                  جاوي
                </span>
                <span className={`px-1 py-0.5 rounded text-[10px] sm:text-[11px] font-bold ${!isJawi ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>
                  Rumi
                </span>
              </button>

              {/* Dark Mode */}
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isDarkMode ? 'Mod Terang' : 'Mod Gelap'}
              >
                {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>

            </div>

          </div>

          {/* 2-Page Switcher (Full width on phone, Centered on desktop) */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-full md:w-auto">
            {/* Page 1: Guru */}
            <button
              type="button"
              onClick={() => onNavigate('guru')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentPage === 'guru'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookOpenCheck size={15} />
              <span>{isJawi ? 'هالمن ڬورو' : 'Halaman Guru'}</span>
            </button>

            {/* Page 2: Admin */}
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentPage === 'admin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Settings size={14} />
              <span>{isJawi ? 'ڤانيل ادمين' : 'Panel Admin (Editor)'}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
