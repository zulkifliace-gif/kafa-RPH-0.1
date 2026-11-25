import React, { useState } from 'react';
import {
  AdminSchoolConfig,
  RphClassSlot,
  WeeklyScheduleMap,
  WeeklyScheduleSlot
} from '../types/rph';
import { HARI_OPTIONS } from '../config/options';
import {
  Calendar,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  Download,
  Sparkles
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  config: AdminSchoolConfig;
  schedule: WeeklyScheduleMap;
  currentDay: string;
  currentDaySlots: RphClassSlot[];
  onSaveSchedule: (next: WeeklyScheduleMap) => void;
  onApplyDayToForm: (day: string, slots: WeeklyScheduleSlot[]) => void;
  onClose: () => void;
}

export const TeacherScheduleModal: React.FC<Props> = ({
  isOpen,
  config,
  schedule,
  currentDay,
  currentDaySlots,
  onSaveSchedule,
  onApplyDayToForm,
  onClose
}) => {
  const [selectedDay, setSelectedDay] = useState<string>(currentDay || 'Isnin');
  const [draft, setDraft] = useState<WeeklyScheduleMap>(schedule);

  React.useEffect(() => {
    if (isOpen) {
      setDraft(schedule);
      if (currentDay) setSelectedDay(currentDay);
    }
  }, [isOpen, schedule, currentDay]);

  if (!isOpen) return null;

  const daySlots = draft[selectedDay] || [];

  const updateDay = (day: string, slots: WeeklyScheduleSlot[]) => {
    setDraft({ ...draft, [day]: slots });
  };

  const handleAddSlot = () => {
    const defaultSub = config.bank.mataPelajaran[0] || 'Al-Quran';
    const newSlot: WeeklyScheduleSlot = {
      id: `tsched-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      tahun: config.bank.tahun[0] || '1',
      kelas: config.bank.kelas[0] || '',
      masa: config.bank.masa[daySlots.length % Math.max(1, config.bank.masa.length)] || '2.30 - 3.30',
      mataPelajaran: defaultSub,
      bidang: defaultSub === 'Al-Quran' ? config.bank.bidangAlQuran[0] || 'Tilawah' : null
    };
    updateDay(selectedDay, [...daySlots, newSlot]);
  };

  const handleUpdateSlot = (idx: number, fields: Partial<WeeklyScheduleSlot>) => {
    const next = daySlots.map((sl, i) => {
      if (i !== idx) return sl;
      const merged = { ...sl, ...fields };
      if (fields.mataPelajaran !== undefined) {
        merged.bidang =
          fields.mataPelajaran === 'Al-Quran'
            ? merged.bidang || config.bank.bidangAlQuran[0] || 'Tilawah'
            : null;
      }
      return merged;
    });
    updateDay(selectedDay, next);
  };

  const handleMove = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= daySlots.length) return;
    const copy = [...daySlots];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    updateDay(selectedDay, copy);
  };

  const handleSaveCurrentFormAsTodaySchedule = () => {
    const converted: WeeklyScheduleSlot[] = currentDaySlots.map((s, idx) => ({
      id: `tsched-from-form-${Date.now()}-${idx}`,
      tahun: s.tahun,
      kelas: s.kelas,
      masa: s.masa,
      mataPelajaran: s.mataPelajaran,
      bidang: s.mataPelajaran === 'Al-Quran' ? s.bidang : null
    }));
    const next = { ...draft, [selectedDay]: converted };
    setDraft(next);
    onSaveSchedule(next);
  };

  const handleLoadAdminTemplate = () => {
    if (!config.jadualWaktu || Object.keys(config.jadualWaktu).length === 0) {
      alert('Panel Admin belum menetapkan templat jadual waktu sekolah.');
      return;
    }
    setDraft(JSON.parse(JSON.stringify(config.jadualWaktu)));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Jadual Waktu Mingguan Saya (Auto-Isi Multi-RPH)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tetapkan sekali sahaja mengikut hari. Lain kali cuma tekan 1 klik untuk jana semua slot kelas hari tersebut!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Day selector */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {HARI_OPTIONS.map((h) => {
              const count = (draft[h.value] || []).length;
              const isActive = selectedDay === h.value;
              return (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => setSelectedDay(h.value)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{h.labelRumi}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={handleSaveCurrentFormAsTodaySchedule}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={12} />
                <span>Simpan {currentDaySlots.length} Kelas Borang Kini ke {selectedDay}</span>
              </button>
              {config.jadualWaktu && Object.keys(config.jadualWaktu).length > 0 && (
                <button
                  type="button"
                  onClick={handleLoadAdminTemplate}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download size={12} />
                  <span>Guna Templat Sekolah</span>
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddSlot}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} />
              <span>Tambah Slot</span>
            </button>
          </div>

          {/* Slots Editor */}
          {daySlots.length === 0 ? (
            <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400">
              Tiada jadual disimpan bagi hari <strong>{selectedDay}</strong>. Klik "Tambah Slot" atau "Simpan Kelas Borang Kini" di atas.
            </div>
          ) : (
            <div className="space-y-2.5">
              {daySlots.map((slot, idx) => (
                <div
                  key={slot.id || idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-300">
                      Kelas #{idx + 1}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, idx - 1)}
                        className="p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-25 cursor-pointer"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === daySlots.length - 1}
                        onClick={() => handleMove(idx, idx + 1)}
                        className="p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-25 cursor-pointer"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateDay(
                            selectedDay,
                            daySlots.filter((_, i) => i !== idx)
                          )
                        }
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <select
                      value={slot.masa}
                      onChange={(e) => handleUpdateSlot(idx, { masa: e.target.value })}
                      className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="">Masa</option>
                      {config.bank.masa.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>

                    <select
                      value={slot.tahun}
                      onChange={(e) => handleUpdateSlot(idx, { tahun: e.target.value })}
                      className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="">Tahun</option>
                      {config.bank.tahun.map((t) => (
                        <option key={t} value={t}>Tahun {t}</option>
                      ))}
                    </select>

                    <select
                      value={slot.kelas}
                      onChange={(e) => handleUpdateSlot(idx, { kelas: e.target.value })}
                      className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="">Kelas</option>
                      {config.bank.kelas.map((k) => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>

                    <select
                      value={slot.mataPelajaran}
                      onChange={(e) => handleUpdateSlot(idx, { mataPelajaran: e.target.value })}
                      className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="">Subjek</option>
                      {config.bank.mataPelajaran.map((mp) => (
                        <option key={mp} value={mp}>{mp}</option>
                      ))}
                    </select>

                    {slot.mataPelajaran === 'Al-Quran' ? (
                      <select
                        value={slot.bidang || ''}
                        onChange={(e) => handleUpdateSlot(idx, { bidang: e.target.value })}
                        className="px-2 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                      >
                        {config.bank.bidangAlQuran.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="px-2 py-1.5 text-[11px] rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center">
                        -
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-900/40">
          <button
            type="button"
            disabled={daySlots.length === 0}
            onClick={() => {
              onSaveSchedule(draft);
              onApplyDayToForm(selectedDay, daySlots);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Calendar size={14} />
            <span>Simpan & Muat {daySlots.length} Kelas ({selectedDay}) Sekarang</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                onSaveSchedule(draft);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Save size={14} />
              <span>Simpan Jadual</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
