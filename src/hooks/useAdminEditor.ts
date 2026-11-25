import { useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  AdminSchoolConfig,
  BankTajukItem,
  BankSubtajukItem,
  CustomPdfLayoutConfig,
  LabelPair,
  WeeklyScheduleMap
} from '../types/rph';
import { DEFAULT_CANVA_LAYOUT } from '../config/gridPresets';
import { saveAdminDraft, clearAdminDraft } from '../utils/storage';

const MAX_HISTORY = 30;

export type SimpleBankListKey =
  | 'kelas'
  | 'masa'
  | 'objektifList'
  | 'aktivitiList'
  | 'refleksiCatatanList';

export type TajukChildType = 'subtajuk' | 'objektif' | 'aktiviti';

export interface EditorHistoryState {
  past: AdminSchoolConfig[];
  present: AdminSchoolConfig;
  future: AdminSchoolConfig[];
}

export type AdminEditorAction =
  | { type: 'SYNC_FROM_SAVED'; config: AdminSchoolConfig }
  | { type: 'RESTORE_DRAFT'; config: AdminSchoolConfig }
  | { type: 'SET_CONFIG'; config: AdminSchoolConfig }
  | { type: 'UPDATE_PROFILE'; fields: Partial<Pick<AdminSchoolConfig, 'namaSekolah' | 'subSlogan' | 'namaGuruBesar' | 'adminPin' | 'logoSekolah'>> }
  | { type: 'UPDATE_LABEL'; key: keyof AdminSchoolConfig['labelCustom']; value: LabelPair }
  | { type: 'UPDATE_LAYOUT'; layout: CustomPdfLayoutConfig }
  | { type: 'UPDATE_SCHEDULE'; jadualWaktu: WeeklyScheduleMap }
  // Basic / General list operations (Inline edit, Reorder, Bulk add, Delete)
  | { type: 'ADD_LIST_ITEM'; listKey: SimpleBankListKey; value: string }
  | { type: 'BULK_ADD_LIST_ITEMS'; listKey: SimpleBankListKey; values: string[] }
  | { type: 'EDIT_LIST_ITEM'; listKey: SimpleBankListKey; index: number; value: string }
  | { type: 'DELETE_LIST_ITEM'; listKey: SimpleBankListKey; index: number }
  | { type: 'REORDER_LIST_ITEM'; listKey: SimpleBankListKey; fromIndex: number; toIndex: number }
  // Custom section bank options
  | { type: 'ADD_CUSTOM_OPTION'; sectionId: string; value: string }
  | { type: 'BULK_ADD_CUSTOM_OPTIONS'; sectionId: string; values: string[] }
  | { type: 'EDIT_CUSTOM_OPTION'; sectionId: string; index: number; value: string }
  | { type: 'DELETE_CUSTOM_OPTION'; sectionId: string; index: number }
  | { type: 'REORDER_CUSTOM_OPTION'; sectionId: string; fromIndex: number; toIndex: number }
  // Subject & Bidang operations (with cascading rename & delete)
  | { type: 'ADD_SUBJECT'; name: string }
  | { type: 'RENAME_SUBJECT'; oldName: string; newName: string }
  | { type: 'DELETE_SUBJECT'; name: string }
  | { type: 'ADD_BIDANG'; name: string }
  | { type: 'RENAME_BIDANG'; oldName: string; newName: string }
  | { type: 'DELETE_BIDANG'; name: string }
  // Curriculum Tajuk operations
  | { type: 'ADD_TAJUK'; item: BankTajukItem }
  | { type: 'EDIT_TAJUK'; tajukId: string; fields: Partial<Pick<BankTajukItem, 'kod' | 'teks' | 'tahun' | 'bidang'>> }
  | { type: 'DELETE_TAJUK'; tajukId: string }
  | { type: 'REORDER_TAJUK'; tajukId: string; direction: 'up' | 'down'; scopeIds: string[] }
  // Tajuk child (Subtajuk / Objektif / Aktiviti) operations
  | { type: 'ADD_TAJUK_SUBTAJUK'; tajukId: string; item: BankSubtajukItem }
  | { type: 'BULK_ADD_TAJUK_SUBTAJUK'; tajukId: string; items: BankSubtajukItem[] }
  | { type: 'EDIT_TAJUK_SUBTAJUK'; tajukId: string; index: number; item: BankSubtajukItem }
  | { type: 'DELETE_TAJUK_SUBTAJUK'; tajukId: string; index: number }
  | { type: 'REORDER_TAJUK_SUBTAJUK'; tajukId: string; fromIndex: number; toIndex: number }
  | { type: 'ADD_TAJUK_TEXT_CHILD'; tajukId: string; field: 'objektifList' | 'aktivitiList'; value: string }
  | { type: 'BULK_ADD_TAJUK_TEXT_CHILDREN'; tajukId: string; field: 'objektifList' | 'aktivitiList'; values: string[] }
  | { type: 'EDIT_TAJUK_TEXT_CHILD'; tajukId: string; field: 'objektifList' | 'aktivitiList'; index: number; value: string }
  | { type: 'DELETE_TAJUK_TEXT_CHILD'; tajukId: string; field: 'objektifList' | 'aktivitiList'; index: number }
  | { type: 'REORDER_TAJUK_TEXT_CHILD'; tajukId: string; field: 'objektifList' | 'aktivitiList'; fromIndex: number; toIndex: number }
  // Bulk curriculum import / restore
  | { type: 'IMPORT_KURIKULUM'; items: BankTajukItem[]; subjects: string[]; bidangAlQuran: string[]; mode: 'merge' | 'replace' }
  | { type: 'RESTORE_OFFICIAL_KURIKULUM'; officialItems: BankTajukItem[] }
  // Undo / Redo
  | { type: 'UNDO' }
  | { type: 'REDO' };

function syncLegacyArrays(newKurikulum: BankTajukItem[]) {
  return {
    tajukList: newKurikulum.map((k) => ({
      kod: k.kod,
      teks: k.teks,
      mataPelajaran: k.mataPelajaran
    })),
    subtajukList: newKurikulum.flatMap((k) =>
      (k.subtajukList || []).map((st) => ({
        kod: st.kod,
        teks: st.teks,
        tajukKod: k.kod
      }))
    )
  };
}

function moveArrayItem<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex < 0 || fromIndex >= arr.length || toIndex < 0 || toIndex >= arr.length || fromIndex === toIndex) {
    return arr;
  }
  const copy = [...arr];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}

function applyMutation(config: AdminSchoolConfig, action: AdminEditorAction): AdminSchoolConfig {
  switch (action.type) {
    case 'SET_CONFIG':
      return action.config;

    case 'UPDATE_PROFILE':
      return { ...config, ...action.fields };

    case 'UPDATE_LABEL':
      return {
        ...config,
        labelCustom: {
          ...config.labelCustom,
          [action.key]: action.value
        }
      };

    case 'UPDATE_LAYOUT':
      return {
        ...config,
        customPdfLayout: action.layout
      };

    case 'UPDATE_SCHEDULE':
      return {
        ...config,
        jadualWaktu: action.jadualWaktu
      };

    case 'ADD_LIST_ITEM': {
      const val = action.value.trim();
      if (!val) return config;
      const current = config.bank[action.listKey] || [];
      return {
        ...config,
        bank: {
          ...config.bank,
          [action.listKey]: [...current, val]
        }
      };
    }

    case 'BULK_ADD_LIST_ITEMS': {
      if (!action.values.length) return config;
      const current = config.bank[action.listKey] || [];
      return {
        ...config,
        bank: {
          ...config.bank,
          [action.listKey]: [...current, ...action.values]
        }
      };
    }

    case 'EDIT_LIST_ITEM': {
      const val = action.value.trim();
      if (!val) return config;
      const current = config.bank[action.listKey] || [];
      return {
        ...config,
        bank: {
          ...config.bank,
          [action.listKey]: current.map((item, idx) => (idx === action.index ? val : item))
        }
      };
    }

    case 'DELETE_LIST_ITEM': {
      const current = config.bank[action.listKey] || [];
      return {
        ...config,
        bank: {
          ...config.bank,
          [action.listKey]: current.filter((_, idx) => idx !== action.index)
        }
      };
    }

    case 'REORDER_LIST_ITEM': {
      const current = config.bank[action.listKey] || [];
      return {
        ...config,
        bank: {
          ...config.bank,
          [action.listKey]: moveArrayItem(current, action.fromIndex, action.toIndex)
        }
      };
    }

    case 'ADD_CUSTOM_OPTION': {
      const val = action.value.trim();
      if (!val) return config;
      const layout = config.customPdfLayout || DEFAULT_CANVA_LAYOUT;
      return {
        ...config,
        customPdfLayout: {
          ...layout,
          customSections: (layout.customSections || []).map((s) => {
            if (s.id !== action.sectionId) return s;
            const opts = s.pilihanBank || [];
            if (opts.includes(val)) return s;
            return { ...s, pilihanBank: [...opts, val] };
          })
        }
      };
    }

    case 'BULK_ADD_CUSTOM_OPTIONS': {
      if (!action.values.length) return config;
      const layout = config.customPdfLayout || DEFAULT_CANVA_LAYOUT;
      return {
        ...config,
        customPdfLayout: {
          ...layout,
          customSections: (layout.customSections || []).map((s) => {
            if (s.id !== action.sectionId) return s;
            const opts = s.pilihanBank || [];
            return { ...s, pilihanBank: [...opts, ...action.values] };
          })
        }
      };
    }

    case 'EDIT_CUSTOM_OPTION': {
      const val = action.value.trim();
      if (!val) return config;
      const layout = config.customPdfLayout || DEFAULT_CANVA_LAYOUT;
      return {
        ...config,
        customPdfLayout: {
          ...layout,
          customSections: (layout.customSections || []).map((s) => {
            if (s.id !== action.sectionId) return s;
            return {
              ...s,
              pilihanBank: (s.pilihanBank || []).map((o, idx) => (idx === action.index ? val : o))
            };
          })
        }
      };
    }

    case 'DELETE_CUSTOM_OPTION': {
      const layout = config.customPdfLayout || DEFAULT_CANVA_LAYOUT;
      return {
        ...config,
        customPdfLayout: {
          ...layout,
          customSections: (layout.customSections || []).map((s) => {
            if (s.id !== action.sectionId) return s;
            return {
              ...s,
              pilihanBank: (s.pilihanBank || []).filter((_, idx) => idx !== action.index)
            };
          })
        }
      };
    }

    case 'REORDER_CUSTOM_OPTION': {
      const layout = config.customPdfLayout || DEFAULT_CANVA_LAYOUT;
      return {
        ...config,
        customPdfLayout: {
          ...layout,
          customSections: (layout.customSections || []).map((s) => {
            if (s.id !== action.sectionId) return s;
            return {
              ...s,
              pilihanBank: moveArrayItem(s.pilihanBank || [], action.fromIndex, action.toIndex)
            };
          })
        }
      };
    }

    case 'ADD_SUBJECT': {
      const name = action.name.trim();
      if (!name || config.bank.mataPelajaran.includes(name)) return config;
      return {
        ...config,
        bank: {
          ...config.bank,
          mataPelajaran: [...config.bank.mataPelajaran, name]
        }
      };
    }

    case 'RENAME_SUBJECT': {
      const newName = action.newName.trim();
      if (!newName || newName === action.oldName || config.bank.mataPelajaran.includes(newName)) {
        return config;
      }
      const updatedSubjects = config.bank.mataPelajaran.map((s) =>
        s === action.oldName ? newName : s
      );
      const updatedKurikulum = (config.bank.kurikulum || []).map((t) =>
        t.mataPelajaran === action.oldName ? { ...t, mataPelajaran: newName } : t
      );
      const { tajukList, subtajukList } = syncLegacyArrays(updatedKurikulum);

      // Cascading update to weekly schedule
      let updatedSchedule = config.jadualWaktu;
      if (updatedSchedule) {
        updatedSchedule = Object.fromEntries(
          Object.entries(updatedSchedule).map(([day, slots]) => [
            day,
            slots.map((sl) =>
              sl.mataPelajaran === action.oldName ? { ...sl, mataPelajaran: newName } : sl
            )
          ])
        );
      }

      return {
        ...config,
        jadualWaktu: updatedSchedule,
        bank: {
          ...config.bank,
          mataPelajaran: updatedSubjects,
          kurikulum: updatedKurikulum,
          tajukList,
          subtajukList
        }
      };
    }

    case 'DELETE_SUBJECT': {
      if (config.bank.mataPelajaran.length <= 1) return config;
      const updatedSubjects = config.bank.mataPelajaran.filter((s) => s !== action.name);
      const updatedKurikulum = (config.bank.kurikulum || []).filter(
        (t) => t.mataPelajaran !== action.name
      );
      const { tajukList, subtajukList } = syncLegacyArrays(updatedKurikulum);
      return {
        ...config,
        bank: {
          ...config.bank,
          mataPelajaran: updatedSubjects,
          kurikulum: updatedKurikulum,
          tajukList,
          subtajukList
        }
      };
    }

    case 'ADD_BIDANG': {
      const name = action.name.trim();
      if (!name || config.bank.bidangAlQuran.includes(name)) return config;
      return {
        ...config,
        bank: {
          ...config.bank,
          bidangAlQuran: [...config.bank.bidangAlQuran, name]
        }
      };
    }

    case 'RENAME_BIDANG': {
      const newName = action.newName.trim();
      if (!newName || newName === action.oldName || config.bank.bidangAlQuran.includes(newName)) {
        return config;
      }
      const updatedBidang = config.bank.bidangAlQuran.map((b) =>
        b === action.oldName ? newName : b
      );
      const updatedKurikulum = (config.bank.kurikulum || []).map((t) =>
        t.mataPelajaran === 'Al-Quran' && t.bidang === action.oldName
          ? { ...t, bidang: newName }
          : t
      );
      const { tajukList, subtajukList } = syncLegacyArrays(updatedKurikulum);

      let updatedSchedule = config.jadualWaktu;
      if (updatedSchedule) {
        updatedSchedule = Object.fromEntries(
          Object.entries(updatedSchedule).map(([day, slots]) => [
            day,
            slots.map((sl) =>
              sl.mataPelajaran === 'Al-Quran' && sl.bidang === action.oldName
                ? { ...sl, bidang: newName }
                : sl
            )
          ])
        );
      }

      return {
        ...config,
        jadualWaktu: updatedSchedule,
        bank: {
          ...config.bank,
          bidangAlQuran: updatedBidang,
          kurikulum: updatedKurikulum,
          tajukList,
          subtajukList
        }
      };
    }

    case 'DELETE_BIDANG': {
      if (config.bank.bidangAlQuran.length <= 1) return config;
      const updatedBidang = config.bank.bidangAlQuran.filter((b) => b !== action.name);
      const updatedKurikulum = (config.bank.kurikulum || []).filter(
        (t) => !(t.mataPelajaran === 'Al-Quran' && t.bidang === action.name)
      );
      const { tajukList, subtajukList } = syncLegacyArrays(updatedKurikulum);
      return {
        ...config,
        bank: {
          ...config.bank,
          bidangAlQuran: updatedBidang,
          kurikulum: updatedKurikulum,
          tajukList,
          subtajukList
        }
      };
    }

    case 'ADD_TAJUK': {
      const updatedKurikulum = [...(config.bank.kurikulum || []), action.item];
      const { tajukList, subtajukList } = syncLegacyArrays(updatedKurikulum);
      return {
        ...config,
        bank: {
          ...config.bank,
          kurikulum: updatedKurikulum,
          tajukList,
          subtajukList
        }
      };
    }

    case 'EDIT_TAJUK': {
      const updatedKurikulum = (config.bank.kurikulum || []).map((t) =>
        t.id === action.tajukId ? { ...t, ...action.fields } : t
      );
      const { tajukList, subtajukList } = syncLegacyArrays(updatedKurikulum);
      return {
        ...config,
        bank: {
          ...config.bank,
          kurikulum: updatedKurikulum,
          tajukList,
          subtajukList
        }
      };
    }

    case 'DELETE_TAJUK': {
      const updatedKurikulum = (config.bank.kurikulum || []).filter((t) => t.id !== action.tajukId);
      const { tajukList, subtajukList } = syncLegacyArrays(updatedKurikulum);
      return {
        ...config,
        bank: {
          ...config.bank,
          kurikulum: updatedKurikulum,
          tajukList,
          subtajukList
        }
      };
    }

    case 'REORDER_TAJUK': {
      const kurikulum = [...(config.bank.kurikulum || [])];
      const scopeIdx = action.scopeIds.indexOf(action.tajukId);
      const neighborScopeIdx = action.direction === 'up' ? scopeIdx - 1 : scopeIdx + 1;
      if (scopeIdx < 0 || neighborScopeIdx < 0 || neighborScopeIdx >= action.scopeIds.length) {
        return config;
      }
      const targetId = action.scopeIds[neighborScopeIdx];
      const idxA = kurikulum.findIndex((t) => t.id === action.tajukId);
      const idxB = kurikulum.findIndex((t) => t.id === targetId);
      if (idxA < 0 || idxB < 0) return config;

      [kurikulum[idxA], kurikulum[idxB]] = [kurikulum[idxB], kurikulum[idxA]];
      const { tajukList, subtajukList } = syncLegacyArrays(kurikulum);
      return {
        ...config,
        bank: {
          ...config.bank,
          kurikulum,
          tajukList,
          subtajukList
        }
      };
    }

    case 'ADD_TAJUK_SUBTAJUK': {
      const updatedKurikulum = (config.bank.kurikulum || []).map((t) =>
        t.id === action.tajukId
          ? { ...t, subtajukList: [...(t.subtajukList || []), action.item] }
          : t
      );
      const { tajukList, subtajukList } = syncLegacyArrays(updatedKurikulum);
      return {
        ...config,
        bank: { ...config.bank, kurikulum: updatedKurikulum, tajukList, subtajukList }
      };
    }

    case 'BULK_ADD_TAJUK_SUBTAJUK': {
      if (!action.items.length) return config;
      const updatedKurikulum = (config.bank.kurikulum || []).map((t) =>
        t.id === action.tajukId
          ? { ...t, subtajukList: [...(t.subtajukList || []), ...action.items] }
          : t
      );
      const { tajukList, subtajukList } = syncLegacyArrays(updatedKurikulum);
      return {
        ...config,
        bank: { ...config.bank, kurikulum: updatedKurikulum, tajukList, subtajukList }
      };
    }

    case 'EDIT_TAJUK_SUBTAJUK': {
      const updatedKurikulum = (config.bank.kurikulum || []).map((t) =>
        t.id === action.tajukId
          ? {
              ...t,
              subtajukList: (t.subtajukList || []).map((st, idx) =>
                idx === action.index ? action.item : st
              )
            }
          : t
      );
      const { tajukList, subtajukList } = syncLegacyArrays(updatedKurikulum);
      return {
        ...config,
        bank: { ...config.bank, kurikulum: updatedKurikulum, tajukList, subtajukList }
      };
    }

    case 'DELETE_TAJUK_SUBTAJUK': {
      const updatedKurikulum = (config.bank.kurikulum || []).map((t) =>
        t.id === action.tajukId
          ? { ...t, subtajukList: (t.subtajukList || []).filter((_, idx) => idx !== action.index) }
          : t
      );
      const { tajukList, subtajukList } = syncLegacyArrays(updatedKurikulum);
      return {
        ...config,
        bank: { ...config.bank, kurikulum: updatedKurikulum, tajukList, subtajukList }
      };
    }

    case 'REORDER_TAJUK_SUBTAJUK': {
      const updatedKurikulum = (config.bank.kurikulum || []).map((t) =>
        t.id === action.tajukId
          ? {
              ...t,
              subtajukList: moveArrayItem(t.subtajukList || [], action.fromIndex, action.toIndex)
            }
          : t
      );
      const { tajukList, subtajukList } = syncLegacyArrays(updatedKurikulum);
      return {
        ...config,
        bank: { ...config.bank, kurikulum: updatedKurikulum, tajukList, subtajukList }
      };
    }

    case 'ADD_TAJUK_TEXT_CHILD': {
      const val = action.value.trim();
      if (!val) return config;
      const updatedKurikulum = (config.bank.kurikulum || []).map((t) =>
        t.id === action.tajukId
          ? { ...t, [action.field]: [...(t[action.field] || []), val] }
          : t
      );
      return {
        ...config,
        bank: { ...config.bank, kurikulum: updatedKurikulum }
      };
    }

    case 'BULK_ADD_TAJUK_TEXT_CHILDREN': {
      if (!action.values.length) return config;
      const updatedKurikulum = (config.bank.kurikulum || []).map((t) =>
        t.id === action.tajukId
          ? { ...t, [action.field]: [...(t[action.field] || []), ...action.values] }
          : t
      );
      return {
        ...config,
        bank: { ...config.bank, kurikulum: updatedKurikulum }
      };
    }

    case 'EDIT_TAJUK_TEXT_CHILD': {
      const val = action.value.trim();
      if (!val) return config;
      const updatedKurikulum = (config.bank.kurikulum || []).map((t) =>
        t.id === action.tajukId
          ? {
              ...t,
              [action.field]: (t[action.field] || []).map((item, idx) =>
                idx === action.index ? val : item
              )
            }
          : t
      );
      return {
        ...config,
        bank: { ...config.bank, kurikulum: updatedKurikulum }
      };
    }

    case 'DELETE_TAJUK_TEXT_CHILD': {
      const updatedKurikulum = (config.bank.kurikulum || []).map((t) =>
        t.id === action.tajukId
          ? {
              ...t,
              [action.field]: (t[action.field] || []).filter((_, idx) => idx !== action.index)
            }
          : t
      );
      return {
        ...config,
        bank: { ...config.bank, kurikulum: updatedKurikulum }
      };
    }

    case 'REORDER_TAJUK_TEXT_CHILD': {
      const updatedKurikulum = (config.bank.kurikulum || []).map((t) =>
        t.id === action.tajukId
          ? {
              ...t,
              [action.field]: moveArrayItem(t[action.field] || [], action.fromIndex, action.toIndex)
            }
          : t
      );
      return {
        ...config,
        bank: { ...config.bank, kurikulum: updatedKurikulum }
      };
    }

    case 'IMPORT_KURIKULUM': {
      const mergedSubjects = Array.from(
        new Set([...(action.mode === 'replace' ? [] : config.bank.mataPelajaran), ...action.subjects])
      );
      const mergedBidang = Array.from(
        new Set([...(action.mode === 'replace' ? ['Tilawah', 'Hafazan', 'Kefahaman', 'Tajwid'] : config.bank.bidangAlQuran), ...action.bidangAlQuran])
      );

      let nextKurikulum: BankTajukItem[];
      if (action.mode === 'replace') {
        nextKurikulum = action.items;
      } else {
        const existingMap = new Map<string, BankTajukItem>();
        for (const item of config.bank.kurikulum || []) {
          const key = `${item.mataPelajaran}|${item.bidang || ''}|${item.tahun || ''}|${item.kod}|${item.teks}`;
          existingMap.set(key, item);
        }
        for (const incoming of action.items) {
          const key = `${incoming.mataPelajaran}|${incoming.bidang || ''}|${incoming.tahun || ''}|${incoming.kod}|${incoming.teks}`;
          existingMap.set(key, incoming);
        }
        nextKurikulum = Array.from(existingMap.values());
      }

      const { tajukList, subtajukList } = syncLegacyArrays(nextKurikulum);
      return {
        ...config,
        bank: {
          ...config.bank,
          mataPelajaran: mergedSubjects.length > 0 ? mergedSubjects : config.bank.mataPelajaran,
          bidangAlQuran: mergedBidang.length > 0 ? mergedBidang : config.bank.bidangAlQuran,
          kurikulum: nextKurikulum,
          tajukList,
          subtajukList
        }
      };
    }

    case 'RESTORE_OFFICIAL_KURIKULUM': {
      const { tajukList, subtajukList } = syncLegacyArrays(action.officialItems);
      return {
        ...config,
        bank: {
          ...config.bank,
          kurikulum: action.officialItems,
          mataPelajaran: ['Al-Quran', 'Akidah', 'Ibadah', 'Sirah', 'Adab', 'Jawi', 'Bahasa Arab'],
          bidangAlQuran: ['Tilawah', 'Hafazan', 'Kefahaman', 'Tajwid'],
          tajukList,
          subtajukList
        }
      };
    }

    default:
      return config;
  }
}

export function adminEditorReducer(
  state: EditorHistoryState,
  action: AdminEditorAction
): EditorHistoryState {
  if (action.type === 'SYNC_FROM_SAVED') {
    return {
      past: [],
      present: action.config,
      future: []
    };
  }

  if (action.type === 'RESTORE_DRAFT') {
    return {
      past: [...state.past, state.present].slice(-MAX_HISTORY),
      present: action.config,
      future: []
    };
  }

  if (action.type === 'UNDO') {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    return {
      past: state.past.slice(0, -1),
      present: previous,
      future: [state.present, ...state.future].slice(0, MAX_HISTORY)
    };
  }

  if (action.type === 'REDO') {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    return {
      past: [...state.past, state.present].slice(-MAX_HISTORY),
      present: next,
      future: state.future.slice(1)
    };
  }

  const nextPresent = applyMutation(state.present, action);
  if (nextPresent === state.present) {
    return state;
  }

  return {
    past: [...state.past, state.present].slice(-MAX_HISTORY),
    present: nextPresent,
    future: []
  };
}

export function useAdminEditor(savedConfig: AdminSchoolConfig, isAuthenticated: boolean) {
  const [state, dispatch] = useReducer(adminEditorReducer, {
    past: [],
    present: savedConfig,
    future: []
  });

  const savedJsonRef = useRef<string>(JSON.stringify(savedConfig));

  // Sync if savedConfig changes externally (e.g., reset to default)
  useEffect(() => {
    const nextSavedJson = JSON.stringify(savedConfig);
    if (nextSavedJson !== savedJsonRef.current) {
      savedJsonRef.current = nextSavedJson;
      dispatch({ type: 'SYNC_FROM_SAVED', config: savedConfig });
    }
  }, [savedConfig]);

  const isDirty = useMemo(
    () => JSON.stringify(state.present) !== JSON.stringify(savedConfig),
    [state.present, savedConfig]
  );

  // Auto-save draft when dirty & authenticated (debounced 400ms)
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!isDirty) {
      clearAdminDraft();
      return;
    }
    const timer = window.setTimeout(() => {
      saveAdminDraft(state.present);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [state.present, isDirty, isAuthenticated]);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const discardChanges = useCallback(() => {
    clearAdminDraft();
    dispatch({ type: 'SYNC_FROM_SAVED', config: savedConfig });
  }, [savedConfig]);

  return {
    formConfig: state.present,
    dispatch,
    isDirty,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    changeCount: state.past.length,
    undo,
    redo,
    discardChanges
  };
}
