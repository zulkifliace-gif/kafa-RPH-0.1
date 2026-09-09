import React, { useState } from 'react';
import { SPECIAL_JAWI_CHARS, transliterateSimpleRumiToJawi } from '../utils/jawiHelper';
import { Sparkles, Copy, Check } from 'lucide-react';

interface Props {
  onInsertChar?: (char: string) => void;
  skrip: 'jawi' | 'rumi';
}

export const VirtualJawiBar: React.FC<Props> = ({ onInsertChar, skrip }) => {
  const [copiedChar, setCopiedChar] = useState<string | null>(null);
  const [translitInput, setTranslitInput] = useState('');
  const [translitOutput, setTranslitOutput] = useState('');
  const [showTranslit, setShowTranslit] = useState(false);

  const handleCharClick = (char: string) => {
    if (onInsertChar) {
      onInsertChar(char);
    }
    // Also copy to clipboard for convenience
    navigator.clipboard.writeText(char);
    setCopiedChar(char);
    setTimeout(() => setCopiedChar(null), 1500);
  };

  const handleTransliterate = (val: string) => {
    setTranslitInput(val);
    setTranslitOutput(transliterateSimpleRumiToJawi(val));
  };

  return (
    <div className="bg-emerald-50/80 dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-3 shadow-sm mb-4 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {skrip === 'jawi' ? 'حروف جاوي خاص:' : 'Kekunci Huruf Jawi Khas:'}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            (Klik untuk salin / masukkan)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowTranslit(!showTranslit)}
            className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
          >
            <Sparkles size={13} />
            <span>{skrip === 'jawi' ? 'توليسن رومي ⇄ جاوي' : 'Bantuan Rumi ⇄ Jawi'}</span>
          </button>
        </div>
      </div>

      {/* Jawi Character buttons */}
      <div className="flex flex-wrap gap-1.5 mt-2.5" dir="rtl">
        {SPECIAL_JAWI_CHARS.map((item) => (
          <button
            key={item.char}
            type="button"
            onClick={() => handleCharClick(item.char)}
            title={`${item.name} - Klik untuk salin`}
            className="w-10 h-10 flex flex-col items-center justify-center bg-white dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-slate-200 dark:border-slate-600 hover:border-emerald-400 rounded-lg shadow-xs transition-all transform active:scale-95 group"
          >
            <span className="font-jawi text-xl font-bold text-slate-800 dark:text-emerald-200 group-hover:text-emerald-700 leading-none">
              {item.char}
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-400 leading-none mt-0.5" dir="ltr">
              {item.sound}
            </span>
          </button>
        ))}
        {copiedChar && (
          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2 py-1 self-center animate-fade-in" dir="ltr">
            <Check size={14} /> Disalin: {copiedChar}
          </div>
        )}
      </div>

      {/* Bonus Transliteration Box */}
      {showTranslit && (
        <div className="mt-3 pt-3 border-t border-emerald-200/60 dark:border-slate-700 animate-slide-down">
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Transliterasi Pantas (Rumi → Jawi):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Taip perkataan Rumi (cth: adab bersyukur)..."
              value={translitInput}
              onChange={(e) => handleTransliterate(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex items-center gap-2">
              <div
                dir="rtl"
                className="flex-1 px-3 py-1.5 text-base font-jawi bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg min-h-[36px] flex items-center text-emerald-800 dark:text-emerald-300"
              >
                {translitOutput || '...حاصيل جاوي'}
              </div>
              {translitOutput && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(translitOutput);
                    setCopiedChar(translitOutput);
                    setTimeout(() => setCopiedChar(null), 1500);
                  }}
                  title="Salin hasil Jawi"
                  className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg text-xs flex items-center gap-1 transition-colors"
                >
                  <Copy size={13} />
                  Salin
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
