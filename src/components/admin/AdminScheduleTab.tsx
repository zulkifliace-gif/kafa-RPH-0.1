import React, { useState } from 'react';
import { AdminSchoolConfig, WeeklyScheduleMap, WeeklyScheduleSlot } from '../../types/rph';
import { AdminEditorAction } from '../../hooks/useAdminEditor';
import { HARI_OPTIONS } from '../../config/options';
import {
  Calendar,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Clock
} from 'lucide-react';

interface Props {
  formConfig: AdminSchoolConfig;
  dispatch: React.Dispatch<AdminEditorAction>;
  showToast: (msg: string) => void;
}

export const AdminScheduleTab: React.FC<Props> = ({ formConfig, dispatch, showToast }) => {
  const [selectedDay, setSelectedDay] = useState<string>('Isnin');
  const [copyTargetDay, setCopyTargetDay] = useState<string>('Selasa');

  const schedule: WeeklyScheduleMap = formConfig.jadualWaktu || {};
  const daySlots: WeeklyScheduleSlot[] = schedule[selectedDay] || [];

  const updateDaySlots = (day: string, nextSlots: WeeklyScheduleSlot[]) => {
    dispatch({
      type: 'UPDATE_SCHEDULE',
      jadualWaktu: {
        ...schedule,
        [day]: nextSlots
      }
    });
  };

  const handleAddSlot = () => {
    const defaultSub = formConfig.bank.mataPelajaran[0] || 'Al-Quran';
    const newSlot: WeeklyScheduleSlot = {
      id: `sched-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tahun: formConfig.bank.tahun[0] || '1',
      kelas: formConfig.bank.kelas[0] || '',
      masa: formConfig.bank.masa[daySlots.length % Math.max(1, formConfig.bank.masa.length)] || '2.30 - 3.30',
      mataPelajaran: defaultSub,
      bidang: defaultSub === 'Al-Quran' ? formConfig.bank.bidangAlQuran[0] || 'Tilawah' : null
    };
    updateDaySlots(selectedDay, [...daySlots, newSlot]);
  };

  const handleUpdateSlot = (slotIdx: number, fields: Partial<WeeklyScheduleSlot>) => {
    const updated = daySlots.map((sl, idx) => {
      if (idx !== slotIdx) return sl;
      const merged = { ...sl, ...fields };
      if (fields.mataPelajaran !== undefined) {
        merged.bidang =
          fields.mataPelajaran === 'Al-Quran'
            ? merged.bidang || formConfig.bank.bidangAlQuran[0] || 'Tilawah'
            : null;
      }
      return merged;
    });
    updateDaySlots(selectedDay, updated);
  };

  const handleDeleteSlot = (slotIdx: number) => {
    updateDaySlots(
      selectedDay,
      daySlots.filter((_, idx) => idx !== slotIdx)
    );
  };

  const handleMoveSlot = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= daySlots.length) return;
    const copy = [...daySlots];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    updateDaySlots(selectedDay, copy);
  };

  const handleCopyDay = () => {
    if (copyTargetDay === selectedDay || daySlots.length === 0) return;
    const cloned = daySlots.map((s, idx) => ({
      ...s,
      id: `sched-${Date.now()}-${idx}`
    }));
    updateDaySlots(copyTargetDay, cloned);
    showToast(`Jadual hari ${selectedDay} (${cloned.length} kelas) berjaya disalin ke hari ${copyTargetDay}!`);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
      <div className="border-b border-slate-100 dark:border-slate-700 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar size={16} className="text-emerald-600" />
            <span>Templat Jadual Waktu Mingguan Sekolah (Isnin – Ahad)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tetapkan templat kelas harian supaya guru boleh memuatkan semua slot kelas hari tersebut ke dalam borang Multi-RPH dengan 1 klik sahaja.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddSlot}
          className="self-start sm:self-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus size={14} />
          <span>Tambah Slot ({selectedDay})</span>
        </button>
      </div>

      {/* Day Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {HARI_OPTIONS.map((h) => {
          const count = (schedule[h.value] || []).length;
          const isActive = selectedDay === h.value;
          return (
            <button
              key={h.value}
              type="button"
              onClick={() => setSelectedDay(h.value)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>{h.labelRumi}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : count > 0
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slot List */}
      {daySlots.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-2">
          <Clock size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Tiada slot kelas ditetapkan bagi hari {selectedDay}.
          </p>
          <p className="text-[11px] text-slate-400">
            Klik butang "Tambah Slot ({selectedDay})" di atas untuk menetapkan masa, tahun, kelas dan mata pelajaran.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {daySlots.map((slot, idx) => (
            <div
              key={slot.id || idx}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 space-y-3"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-600/60 pb-2">
                <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                  Slot Kelas #{idx + 1} ({selectedDay})
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSlot(idx, idx - 1)}
                    title="Naik"
                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === daySlots.length - 1}
                    onClick={() => handleMoveSlot(idx, idx + 1)}
                    title="Turun"
                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(idx)}
                    title="Padam slot ini"
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Masa</label>
                  <select
                    value={slot.masa}
                    onChange={(e) => handleUpdateSlot(idx, { masa: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="">-- Masa --</option>
                    {formConfig.bank.masa.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Tahun</label>
                  <select
                    value={slot.tahun}
                    onChange={(e) => handleUpdateSlot(idx, { tahun: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="">-- Tahun --</option>
                    {formConfig.bank.tahun.map((t) => (
                      <option key={t} value={t}>Tahun {t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Kelas</label>
                  <select
                    value={slot.kelas}
                    onChange={(e) => handleUpdateSlot(idx, { kelas: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="">-- Kelas --</option>
                    {formConfig.bank.kelas.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Mata Pelajaran</label>
                  <select
                    value={slot.mataPelajaran}
                    onChange={(e) => handleUpdateSlot(idx, { mataPelajaran: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="">-- Subjek --</option>
                    {formConfig.bank.mataPelajaran.map((mp) => (
                      <option key={mp} value={mp}>{mp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Bidang (Al-Quran)</label>
                  {slot.mataPelajaran === 'Al-Quran' ? (
                    <select
                      value={slot.bidang || ''}
                      onChange={(e) => handleUpdateSlot(idx, { bidang: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                    >
                      {formConfig.bank.bidangAlQuran.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-400">
                      Tidak berkenaan
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Copy schedule to another day */}
      {daySlots.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500">
            Salin jadual hari <strong>{selectedDay}</strong> ke hari lain:
          </span>
          <div className="flex items-center gap-2">
            <select
              value={copyTargetDay}
              onChange={(e) => setCopyTargetDay(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-semibold"
            >
              {HARI_OPTIONS.filter((h) => h.value !== selectedDay).map((h) => (
                <option key={h.value} value={h.value}>
                  {h.labelRumi}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCopyDay}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Copy size={13} />
              <span>Salin ke {copyTargetDay}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
