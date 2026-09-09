import React, { useState } from 'react';
import {
  CustomPdfLayoutConfig,
  GridTableBlock,
  GridRowConfig,
  CustomSectionDef,
  AdminSchoolConfig,
  ScriptMode
} from '../types/rph';
import {
  SENARAI_BAHAGIAN_STANDARD,
  PRESET_TAPAK_ASAL,
  PRESET_MODEN,
  PRESET_BLANK
} from '../config/gridPresets';
import { RphPreview } from './RphPreview';
import { DEFAULT_TEACHER_FORM } from '../config/options';
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Sparkles,
  Layers,
  LayoutGrid,
  Eye,
  Edit3,
  X,
  Check,
  Tag,
  BookOpen
} from 'lucide-react';

interface Props {
  config: AdminSchoolConfig;
  layoutConfig: CustomPdfLayoutConfig;
  onChangeLayout: (newLayout: CustomPdfLayoutConfig) => void;
  skrip?: ScriptMode;
}

interface ActiveCellTarget {
  blockId: string;
  side?: 'left' | 'right';
  rowId: string;
  cellId: string;
}

export const AdminPdfLayoutEditor: React.FC<Props> = ({
  config,
  layoutConfig,
  onChangeLayout,
  skrip = 'jawi'
}) => {

  // Canvas View Mode
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Modal State for "+" Button
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeCellTarget, setActiveCellTarget] = useState<ActiveCellTarget | null>(null);
  const [modalTab, setModalTab] = useState<'standard' | 'custom' | 'create'>('standard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form State for creating a new custom section
  const [newSectionRumi, setNewSectionRumi] = useState<string>('');
  const [newSectionJawi, setNewSectionJawi] = useState<string>('');
  const [newSectionJenis, setNewSectionJenis] = useState<'dropdown' | 'checkbox' | 'teks' | 'bullet' | 'statik'>('dropdown');
  const [newSectionBankOptions, setNewSectionBankOptions] = useState<string>('');
  const [newSectionLalai, setNewSectionLalai] = useState<string>('');

  // ----------------------------------------------------
  // HELPER FUNCTIONS
  // ----------------------------------------------------
  const updateBlocks = (blocks: GridTableBlock[]) => {
    onChangeLayout({
      ...layoutConfig,
      blocks
    });
  };

  const updateCustomSections = (customSections: CustomSectionDef[]) => {
    onChangeLayout({
      ...layoutConfig,
      customSections
    });
  };

  const getSectionDetails = (sectionId: string | null) => {
    if (!sectionId) return null;
    const std = SENARAI_BAHAGIAN_STANDARD.find((s) => s.id === sectionId);
    if (std) return { ...std, isCustom: false };

    const cst = (layoutConfig.customSections || []).find((c) => c.id === sectionId);
    if (cst) {
      return {
        id: cst.id,
        namaRumi: cst.namaRumi,
        namaJawi: cst.namaJawi,
        kategori: 'kustom',
        penerangan: `Bahagian Kustom: ${cst.jenis.toUpperCase()}`,
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        isCustom: true
      };
    }

    return {
      id: sectionId,
      namaRumi: sectionId,
      namaJawi: sectionId,
      kategori: 'lain',
      penerangan: 'Bahagian tambahan',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      isCustom: false
    };
  };

  // ----------------------------------------------------
  // TABLE CREATION TOOLS (Alat Nak Cipta Table)
  // ----------------------------------------------------
  const handleAddTableSingle = () => {
    const newBlockId = `tbl-${Date.now()}`;
    const newBlock: GridTableBlock = {
      id: newBlockId,
      title: 'Jadual 1 Petak (100%)',
      type: 'table',
      rows: [
        {
          id: `row-${Date.now()}-1`,
          cells: [
            {
              id: `cell-${Date.now()}-1`,
              widthPercent: 100,
              sectionId: null // Empty slot awaiting '+'
            }
          ]
        }
      ]
    };
    updateBlocks([...layoutConfig.blocks, newBlock]);
  };

  const handleAddTableDouble = () => {
    const newBlockId = `tbl-${Date.now()}`;
    const newBlock: GridTableBlock = {
      id: newBlockId,
      title: 'Jadual 2 Petak Sama (50% | 50%)',
      type: 'table',
      rows: [
        {
          id: `row-${Date.now()}-1`,
          cells: [
            { id: `c-${Date.now()}-1`, widthPercent: 50, sectionId: null },
            { id: `c-${Date.now()}-2`, widthPercent: 50, sectionId: null }
          ]
        }
      ]
    };
    updateBlocks([...layoutConfig.blocks, newBlock]);
  };

  const handleAddTableClassicRatio = () => {
    const newBlockId = `tbl-${Date.now()}`;
    const newBlock: GridTableBlock = {
      id: newBlockId,
      title: 'Jadual 2 Petak Nisbah Tapak (42% | 58%)',
      type: 'table',
      rows: [
        {
          id: `row-${Date.now()}-1`,
          cells: [
            { id: `c-${Date.now()}-1`, widthPercent: 42, sectionId: null },
            { id: `c-${Date.now()}-2`, widthPercent: 58, sectionId: null }
          ]
        }
      ]
    };
    updateBlocks([...layoutConfig.blocks, newBlock]);
  };

  const handleAddTableTriple = () => {
    const newBlockId = `tbl-${Date.now()}`;
    const newBlock: GridTableBlock = {
      id: newBlockId,
      title: 'Jadual 3 Petak Sebaris (33% x 3)',
      type: 'table',
      rows: [
        {
          id: `row-${Date.now()}-1`,
          cells: [
            { id: `c-${Date.now()}-1`, widthPercent: 33.33, sectionId: null },
            { id: `c-${Date.now()}-2`, widthPercent: 33.33, sectionId: null },
            { id: `c-${Date.now()}-3`, widthPercent: 33.34, sectionId: null }
          ]
        }
      ]
    };
    updateBlocks([...layoutConfig.blocks, newBlock]);
  };

  const handleAddTableQuad = () => {
    const newBlockId = `tbl-${Date.now()}`;
    const newBlock: GridTableBlock = {
      id: newBlockId,
      title: 'Jadual 4 Petak Sebaris (25% x 4)',
      type: 'table',
      rows: [
        {
          id: `row-${Date.now()}-1`,
          cells: [
            { id: `c-${Date.now()}-1`, widthPercent: 25, sectionId: null },
            { id: `c-${Date.now()}-2`, widthPercent: 25, sectionId: null },
            { id: `c-${Date.now()}-3`, widthPercent: 25, sectionId: null },
            { id: `c-${Date.now()}-4`, widthPercent: 25, sectionId: null }
          ]
        }
      ]
    };
    updateBlocks([...layoutConfig.blocks, newBlock]);
  };

  const handleAddSplitColumnContainer = () => {
    const newBlockId = `tbl-${Date.now()}`;
    const newBlock: GridTableBlock = {
      id: newBlockId,
      title: 'Jadual Belah 2 Lajur Bertingkat (42% / 58%)',
      type: 'split-columns',
      splitColumns: {
        right: {
          id: `col-r-${Date.now()}`,
          widthPercent: 42,
          rows: [
            { id: `r-r-${Date.now()}-1`, cells: [{ id: `c-r-${Date.now()}-1`, widthPercent: 100, sectionId: null }] }
          ]
        },
        left: {
          id: `col-l-${Date.now()}`,
          widthPercent: 58,
          rows: [
            { id: `r-l-${Date.now()}-1`, cells: [{ id: `c-l-${Date.now()}-1`, widthPercent: 100, sectionId: null }] }
          ]
        }
      }
    };
    updateBlocks([...layoutConfig.blocks, newBlock]);
  };

  // ----------------------------------------------------
  // BLOCK LEVEL ACTIONS (Move, Add Row, Delete)
  // ----------------------------------------------------
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= layoutConfig.blocks.length) return;
    const updated = [...layoutConfig.blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    updateBlocks(updated);
  };

  const handleDeleteBlock = (blockId: string) => {
    if (window.confirm('Adakah anda pasti mahu memadamkan jadual ini dari dokumen?')) {
      updateBlocks(layoutConfig.blocks.filter((b) => b.id !== blockId));
    }
  };

  const handleAddRowToTable = (blockId: string) => {
    const updated = layoutConfig.blocks.map((b) => {
      if (b.id !== blockId || b.type !== 'table') return b;
      const currentRows = b.rows || [];
      const colCount = currentRows.length > 0 ? currentRows[0].cells.length : 1;
      const width = Number((100 / colCount).toFixed(2));
      const newRow: GridRowConfig = {
        id: `row-${Date.now()}`,
        cells: Array.from({ length: colCount }).map((_, i) => ({
          id: `c-${Date.now()}-${i}`,
          widthPercent: width,
          sectionId: null
        }))
      };
      return {
        ...b,
        rows: [...currentRows, newRow]
      };
    });
    updateBlocks(updated);
  };

  const handleAddRowToSplitCol = (blockId: string, side: 'left' | 'right') => {
    const updated = layoutConfig.blocks.map((b) => {
      if (b.id !== blockId || b.type !== 'split-columns' || !b.splitColumns) return b;
      const targetCol = b.splitColumns[side];
      const newRow: GridRowConfig = {
        id: `r-${side}-${Date.now()}`,
        cells: [{ id: `c-${side}-${Date.now()}`, widthPercent: 100, sectionId: null }]
      };
      return {
        ...b,
        splitColumns: {
          ...b.splitColumns,
          [side]: {
            ...targetCol,
            rows: [...targetCol.rows, newRow]
          }
        }
      };
    });
    updateBlocks(updated);
  };

  const handleDeleteRow = (blockId: string, rowId: string, side?: 'left' | 'right') => {
    const updated = layoutConfig.blocks.map((b) => {
      if (b.id !== blockId) return b;
      if (b.type === 'table') {
        const rows = (b.rows || []).filter((r) => r.id !== rowId);
        return { ...b, rows };
      }
      if (b.type === 'split-columns' && b.splitColumns && side) {
        const targetCol = b.splitColumns[side];
        return {
          ...b,
          splitColumns: {
            ...b.splitColumns,
            [side]: {
              ...targetCol,
              rows: targetCol.rows.filter((r) => r.id !== rowId)
            }
          }
        };
      }
      return b;
    });
    updateBlocks(updated);
  };

  // ----------------------------------------------------
  // CELL LEVEL ACTIONS (Open Picker, Clear Cell, Assign)
  // ----------------------------------------------------
  const handleOpenPickerForCell = (target: ActiveCellTarget) => {
    setActiveCellTarget(target);
    setSearchQuery('');
    setModalTab('standard');
    setIsModalOpen(true);
  };

  const handleAssignSectionToCell = (sectionId: string) => {
    if (!activeCellTarget) return;

    const { blockId, side, rowId, cellId } = activeCellTarget;
    const updated = layoutConfig.blocks.map((b) => {
      if (b.id !== blockId) return b;
      if (b.type === 'table') {
        const rows = (b.rows || []).map((r) => {
          if (r.id !== rowId) return r;
          const cells = r.cells.map((c) => (c.id === cellId ? { ...c, sectionId } : c));
          return { ...r, cells };
        });
        return { ...b, rows };
      }
      if (b.type === 'split-columns' && b.splitColumns && side) {
        const targetCol = b.splitColumns[side];
        const rows = targetCol.rows.map((r) => {
          if (r.id !== rowId) return r;
          const cells = r.cells.map((c) => (c.id === cellId ? { ...c, sectionId } : c));
          return { ...r, cells };
        });
        return {
          ...b,
          splitColumns: {
            ...b.splitColumns,
            [side]: { ...targetCol, rows }
          }
        };
      }
      return b;
    });

    updateBlocks(updated);
    setIsModalOpen(false);
    setActiveCellTarget(null);
  };

  const handleClearCell = (target: ActiveCellTarget) => {
    const { blockId, side, rowId, cellId } = target;
    const updated = layoutConfig.blocks.map((b) => {
      if (b.id !== blockId) return b;
      if (b.type === 'table') {
        const rows = (b.rows || []).map((r) => {
          if (r.id !== rowId) return r;
          const cells = r.cells.map((c) => (c.id === cellId ? { ...c, sectionId: null } : c));
          return { ...r, cells };
        });
        return { ...b, rows };
      }
      if (b.type === 'split-columns' && b.splitColumns && side) {
        const targetCol = b.splitColumns[side];
        const rows = targetCol.rows.map((r) => {
          if (r.id !== rowId) return r;
          const cells = r.cells.map((c) => (c.id === cellId ? { ...c, sectionId: null } : c));
          return { ...r, cells };
        });
        return {
          ...b,
          splitColumns: {
            ...b.splitColumns,
            [side]: { ...targetCol, rows }
          }
        };
      }
      return b;
    });
    updateBlocks(updated);
  };

  // ----------------------------------------------------
  // CREATE NEW CUSTOM SECTION (Tambah Bahagian Baru)
  // ----------------------------------------------------
  const handleCreateNewCustomSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionRumi.trim()) {
      alert('Sila masukkan nama bahagian (Rumi).');
      return;
    }

    const newId = `custom_${Date.now()}`;
    const bankList = newSectionBankOptions
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newSection: CustomSectionDef = {
      id: newId,
      namaRumi: newSectionRumi.trim(),
      namaJawi: newSectionJawi.trim() || newSectionRumi.trim(),
      jenis: newSectionJenis,
      pilihanBank: bankList.length > 0 ? bankList : (newSectionLalai ? [newSectionLalai] : []),
      nilaiLalai: newSectionLalai.trim() || (bankList.length > 0 ? bankList[0] : undefined)
    };

    const currentList = layoutConfig.customSections || [];
    const updatedList = [...currentList, newSection];
    updateCustomSections(updatedList);

    // Reset inputs
    setNewSectionRumi('');
    setNewSectionJawi('');
    setNewSectionBankOptions('');
    setNewSectionLalai('');

    // If a cell was active, immediately assign this new section!
    if (activeCellTarget) {
      handleAssignSectionToCell(newId);
    } else {
      setModalTab('custom');
    }
  };

  // ----------------------------------------------------
  // PRESET LOADERS
  // ----------------------------------------------------
  const handleLoadPreset = (presetKey: 'asal' | 'moden' | 'blank') => {
    if (window.confirm('Muat templat ini? Susunan kanvas semasa akan digantikan.')) {
      if (presetKey === 'asal') {
        onChangeLayout({ ...PRESET_TAPAK_ASAL, customSections: layoutConfig.customSections || [] });
      } else if (presetKey === 'moden') {
        onChangeLayout({ ...PRESET_MODEN, customSections: layoutConfig.customSections || [] });
      } else {
        onChangeLayout({ ...PRESET_BLANK, customSections: layoutConfig.customSections || [] });
      }
    }
  };

  // Filtered standard sections
  const filteredStandardSections = SENARAI_BAHAGIAN_STANDARD.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.namaRumi.toLowerCase().includes(q) ||
      s.namaJawi.toLowerCase().includes(q) ||
      s.penerangan.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & TOOLBAR */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                <LayoutGrid size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Editor Susunan Grid PDF (Mod Canva Saiz A4)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Reka bentuk susunan jadual mengikut saiz A4 sebenar. Cipta table, dan tekan butang{' '}
              <strong className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-300">+</strong >{' '}
              untuk memilih bahagian RPH yang dikehendaki atau tambah bahagian kustom baru.
            </p>
          </div>

          {/* Mode Toggle & Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-slate-100 dark:bg-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'editor'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Edit3 size={14} />
                <span>Mod Struktur Canva</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'preview'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Eye size={14} />
                <span>Pratonton Sebenar</span>
              </button>
            </div>

            {/* Scale/Zoom */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="text-[11px] hidden sm:inline">Zum:</span>
              <button
                type="button"
                onClick={() => setZoomLevel(45)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  zoomLevel === 45 ? 'bg-white dark:bg-slate-800 text-purple-600 shadow-xs' : ''
                }`}
                title="Muat Skrin Telefon (45%)"
              >
                📱 Fit
              </button>
              {[65, 85, 100].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setZoomLevel(lvl)}
                  className={`px-1.5 py-0.5 rounded text-[11px] transition-all ${
                    zoomLevel === lvl ? 'bg-white dark:bg-slate-800 text-purple-600 font-bold shadow-xs' : ''
                  }`}
                >
                  {lvl}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. ALAT NAK CIPTA TABLE (Table Creation Toolbar) */}
        {/* ======================================================== */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Layers size={15} className="text-purple-600" />
              <span>Alat Cipta Table / Grid:</span>
            </div>

            {/* Quick Templates */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-400">Pilihan Templat:</span>
              <button
                type="button"
                onClick={() => handleLoadPreset('asal')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                Templat Tapak Asal KAFA
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('moden')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Templat Moden Penuh
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('blank')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Kosongkan Canva
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-2.5">
            <button
              type="button"
              onClick={handleAddTableSingle}
              className="p-2.5 bg-slate-50 hover:bg-purple-50 dark:bg-slate-700/50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-600 hover:border-purple-300 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center text-center gap-1 transition-all group"
            >
              <span className="w-full h-4 border border-slate-400 group-hover:border-purple-500 rounded-xs bg-slate-200 dark:bg-slate-600"></span>
              <span>+ 1 Petak (100%)</span>
            </button>

            <button
              type="button"
              onClick={handleAddTableDouble}
              className="p-2.5 bg-slate-50 hover:bg-purple-50 dark:bg-slate-700/50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-600 hover:border-purple-300 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center text-center gap-1 transition-all group"
            >
              <div className="w-full h-4 grid grid-cols-2 gap-0.5">
                <span className="border border-slate-400 group-hover:border-purple-500 rounded-xs bg-slate-200 dark:bg-slate-600"></span>
                <span className="border border-slate-400 group-hover:border-purple-500 rounded-xs bg-slate-200 dark:bg-slate-600"></span>
              </div>
              <span>+ 2 Petak (50/50)</span>
            </button>

            <button
              type="button"
              onClick={handleAddTableClassicRatio}
              className="p-2.5 bg-slate-50 hover:bg-purple-50 dark:bg-slate-700/50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-600 hover:border-purple-300 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center text-center gap-1 transition-all group"
            >
              <div className="w-full h-4 flex gap-0.5">
                <span className="w-[42%] border border-slate-400 group-hover:border-purple-500 rounded-xs bg-slate-200 dark:bg-slate-600"></span>
                <span className="w-[58%] border border-slate-400 group-hover:border-purple-500 rounded-xs bg-slate-200 dark:bg-slate-600"></span>
              </div>
              <span>+ 2 Petak (42/58)</span>
            </button>

            <button
              type="button"
              onClick={handleAddTableTriple}
              className="p-2.5 bg-slate-50 hover:bg-purple-50 dark:bg-slate-700/50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-600 hover:border-purple-300 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center text-center gap-1 transition-all group"
            >
              <div className="w-full h-4 grid grid-cols-3 gap-0.5">
                <span className="border border-slate-400 group-hover:border-purple-500 rounded-xs bg-slate-200 dark:bg-slate-600"></span>
                <span className="border border-slate-400 group-hover:border-purple-500 rounded-xs bg-slate-200 dark:bg-slate-600"></span>
                <span className="border border-slate-400 group-hover:border-purple-500 rounded-xs bg-slate-200 dark:bg-slate-600"></span>
              </div>
              <span>+ 3 Petak (33% x 3)</span>
            </button>

            <button
              type="button"
              onClick={handleAddTableQuad}
              className="p-2.5 bg-slate-50 hover:bg-purple-50 dark:bg-slate-700/50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-600 hover:border-purple-300 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center text-center gap-1 transition-all group"
            >
              <div className="w-full h-4 grid grid-cols-4 gap-0.5">
                <span className="border border-slate-400 group-hover:border-purple-500 rounded-xs bg-slate-200 dark:bg-slate-600"></span>
                <span className="border border-slate-400 group-hover:border-purple-500 rounded-xs bg-slate-200 dark:bg-slate-600"></span>
                <span className="border border-slate-400 group-hover:border-purple-500 rounded-xs bg-slate-200 dark:bg-slate-600"></span>
                <span className="border border-slate-400 group-hover:border-purple-500 rounded-xs bg-slate-200 dark:bg-slate-600"></span>
              </div>
              <span>+ 4 Petak (25% x 4)</span>
            </button>

            <button
              type="button"
              onClick={handleAddSplitColumnContainer}
              className="p-2.5 bg-slate-50 hover:bg-purple-50 dark:bg-slate-700/50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-600 hover:border-purple-300 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-col items-center text-center gap-1 transition-all group"
            >
              <div className="w-full h-4 flex gap-0.5">
                <div className="w-[42%] flex flex-col gap-0.5">
                  <span className="h-1.5 border border-slate-400 group-hover:border-purple-500 rounded-xs bg-slate-200 dark:bg-slate-600"></span>
                  <span className="h-1.5 border border-slate-400 group-hover:border-purple-500 rounded-xs bg-slate-200 dark:bg-slate-600"></span>
                </div>
                <div className="w-[58%] flex flex-col gap-0.5">
                  <span className="h-1.5 border border-slate-400 group-hover:border-purple-500 rounded-xs bg-slate-200 dark:bg-slate-600"></span>
                  <span className="h-1.5 border border-slate-400 group-hover:border-purple-500 rounded-xs bg-slate-200 dark:bg-slate-600"></span>
                </div>
              </div>
              <span>+ Belah 2 Lajur</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CANVA SHEET (Saiz Kertas A4) */}
      {/* ======================================================== */}
      <div className="bg-slate-200/90 dark:bg-slate-900/90 p-2 sm:p-8 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-inner flex flex-col items-center overflow-x-auto min-h-[600px] sm:min-h-[700px]">
        
        {/* A4 Paper Canvas */}
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            marginBottom: zoomLevel < 100 ? `-${(100 - zoomLevel) * 10.5}px` : undefined
          }}
          className="max-w-[780px] w-full min-h-[1050px] bg-white text-slate-900 p-4 sm:p-8 rounded-xl shadow-2xl border-2 border-slate-300 relative transition-all duration-200 shrink-0"
        >
          {/* A4 Watermark indicator */}
          <div className="absolute top-2 right-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase pointer-events-none select-none">
            A4 Canvas (210 × 297 mm)
          </div>

          {viewMode === 'preview' ? (
            /* REAL DOCUMENT PREVIEW */
            <div className="pt-2">
              <RphPreview
                data={{
                  tarikh: DEFAULT_TEACHER_FORM.tarikh,
                  hari: DEFAULT_TEACHER_FORM.hari,
                  minggu: DEFAULT_TEACHER_FORM.minggu,
                  tahun: DEFAULT_TEACHER_FORM.tahun,
                  kelas: DEFAULT_TEACHER_FORM.kelas,
                  masa: DEFAULT_TEACHER_FORM.masa,
                  mataPelajaran: DEFAULT_TEACHER_FORM.mataPelajaran,
                  bidang: DEFAULT_TEACHER_FORM.bidang,
                  tajuk: DEFAULT_TEACHER_FORM.tajuk,
                  subtajuk: DEFAULT_TEACHER_FORM.subtajuk,
                  objektifPembelajaran: DEFAULT_TEACHER_FORM.selectedObjektif,
                  aktivitiMurid: DEFAULT_TEACHER_FORM.selectedAktiviti,
                  kemahiran: {
                    lisan: Boolean(DEFAULT_TEACHER_FORM.selectedKemahiran.lisan),
                    bertulis: Boolean(DEFAULT_TEACHER_FORM.selectedKemahiran.bertulis),
                    pemerhatian: Boolean(DEFAULT_TEACHER_FORM.selectedKemahiran.pemerhatian)
                  },
                  refleksi: DEFAULT_TEACHER_FORM.refleksi,
                  skrip: skrip
                }}
                namaSekolah={config.namaSekolah}
                logoSekolah={config.logoSekolah}
                customLabels={config.labelCustom}
                skrip={skrip}
                layoutStyle="custom"
                customLayout={layoutConfig}
              />
            </div>
          ) : (
            /* CANVA STRUCTURE / WIREFRAME EDITOR */
            <div className="space-y-4 pt-4">
              {layoutConfig.blocks.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-300 rounded-2xl p-8">
                  <LayoutGrid size={40} className="mx-auto text-slate-300 mb-3" />
                  <h4 className="font-bold text-slate-700 text-sm">Kanvas A4 Masih Kosong</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                    Gunakan butang alatan di bahagian atas untuk menambah jadual 1 petak, 2 petak, atau muat templat asas.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleLoadPreset('asal')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20"
                  >
                    Muat Templat Tapak Asal KAFA
                  </button>
                </div>
              ) : (
                layoutConfig.blocks.map((block, bIdx) => (
                  <div
                    key={block.id}
                    className="group/block relative border-2 border-slate-300 hover:border-purple-400 rounded-xl bg-slate-50/40 p-2 transition-colors"
                  >
                    {/* Block Toolbar Header */}
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center text-[10px] font-bold">
                          #{bIdx + 1}
                        </span>
                        <span>{block.title || `Jadual ${bIdx + 1}`}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-normal">
                          {block.type === 'split-columns' ? 'Belah 2 Lajur' : 'Jadual Sebaris'}
                        </span>
                      </div>

                      {/* Block Controls */}
                      <div className="flex items-center gap-1 opacity-80 group-hover/block:opacity-100 transition-opacity">
                        {block.type === 'table' && (
                          <button
                            type="button"
                            onClick={() => handleAddRowToTable(block.id)}
                            className="px-2 py-0.5 text-[11px] bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium flex items-center gap-1"
                            title="Tambah baris baru dalam jadual ini"
                          >
                            <Plus size={11} />
                            <span>Baris</span>
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={bIdx === 0}
                          onClick={() => handleMoveBlock(bIdx, 'up')}
                          className="p-1 text-slate-500 hover:text-purple-700 hover:bg-purple-100 rounded disabled:opacity-30"
                          title="Naikkan ke atas"
                        >
                          <MoveUp size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={bIdx === layoutConfig.blocks.length - 1}
                          onClick={() => handleMoveBlock(bIdx, 'down')}
                          className="p-1 text-slate-500 hover:text-purple-700 hover:bg-purple-100 rounded disabled:opacity-30"
                          title="Turunkan ke bawah"
                        >
                          <MoveDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlock(block.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Padam jadual ini"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Block Content: Table or Split-columns */}
                    {block.type === 'table' ? (
                      <table className="w-full border-collapse border-2 border-slate-900 bg-white">
                        <tbody>
                          {(block.rows || []).map((row) => (
                            <tr key={row.id} className="relative group/row">
                              {row.cells.map((cell) => {
                                const section = getSectionDetails(cell.sectionId);
                                return (
                                  <td
                                    key={cell.id}
                                    style={{ width: `${cell.widthPercent || 100}%` }}
                                    className="border border-slate-900 p-2 align-middle min-h-[50px] relative transition-colors"
                                  >
                                    {section ? (
                                      /* Filled Slot Card */
                                      <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${section.badgeColor}`}>
                                              {section.namaJawi}
                                            </span>
                                            <span className="text-xs font-bold text-slate-900 truncate">
                                              {section.namaRumi}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleOpenPickerForCell({
                                                blockId: block.id,
                                                rowId: row.id,
                                                cellId: cell.id
                                              })
                                            }
                                            className="p-1 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded text-xs"
                                            title="Tukar bahagian"
                                          >
                                            <Edit3 size={13} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleClearCell({
                                                blockId: block.id,
                                                rowId: row.id,
                                                cellId: cell.id
                                              })
                                            }
                                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-xs"
                                            title="Kosongkan petak ini"
                                          >
                                            <X size={13} />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      /* Empty Slot '+' Button */
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleOpenPickerForCell({
                                            blockId: block.id,
                                            rowId: row.id,
                                            cellId: cell.id
                                          })
                                        }
                                        className="w-full py-3 px-2 border-2 border-dashed border-emerald-400 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all group/btn"
                                      >
                                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover/btn:scale-110 transition-transform">
                                          <Plus size={14} />
                                        </div>
                                        <span>+ Pilih Bahagian</span>
                                      </button>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      /* Split Columns Container (42% / 58%) */
                      <div className="border-2 border-slate-900 bg-white grid grid-cols-12 divide-x-2 divide-slate-900">
                        {/* Right Column (Info / Sesi - 42% in classic) */}
                        <div className="col-span-5 p-1 space-y-1 bg-slate-50/30">
                          <div className="flex items-center justify-between px-1.5 py-1 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                            <span>Lajur Maklumat Sesi (~42%)</span>
                            <button
                              type="button"
                              onClick={() => handleAddRowToSplitCol(block.id, 'right')}
                              className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[10px] font-semibold flex items-center gap-0.5"
                            >
                              <Plus size={10} />
                              <span>Baris</span>
                            </button>
                          </div>
                          <div className="space-y-1">
                            {block.splitColumns?.right.rows.map((row) => (
                              <div key={row.id} className="relative group/srow border border-slate-300 rounded p-1 bg-white">
                                {row.cells.map((cell) => {
                                  const sec = getSectionDetails(cell.sectionId);
                                  return sec ? (
                                    <div key={cell.id} className="flex items-center justify-between text-xs p-1">
                                      <div className="min-w-0">
                                        <span className={`text-[9px] font-bold px-1 rounded border mr-1 ${sec.badgeColor}`}>
                                          {sec.namaJawi}
                                        </span>
                                        <strong className="text-slate-800 text-xs">{sec.namaRumi}</strong>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleOpenPickerForCell({
                                              blockId: block.id,
                                              side: 'right',
                                              rowId: row.id,
                                              cellId: cell.id
                                            })
                                          }
                                          className="text-slate-400 hover:text-purple-600"
                                        >
                                          <Edit3 size={12} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleClearCell({
                                              blockId: block.id,
                                              side: 'right',
                                              rowId: row.id,
                                              cellId: cell.id
                                            })
                                          }
                                          className="text-slate-400 hover:text-rose-600"
                                        >
                                          <X size={12} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteRow(block.id, row.id, 'right')}
                                          className="text-slate-300 hover:text-rose-500 ml-1"
                                          title="Buang baris"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div key={cell.id} className="flex items-center justify-between gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleOpenPickerForCell({
                                            blockId: block.id,
                                            side: 'right',
                                            rowId: row.id,
                                            cellId: cell.id
                                          })
                                        }
                                        className="flex-1 py-1.5 border border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold flex items-center justify-center gap-1"
                                      >
                                        <Plus size={12} />
                                        <span>+ Pilih Bahagian</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteRow(block.id, row.id, 'right')}
                                        className="text-slate-300 hover:text-rose-500 p-1"
                                        title="Buang baris"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Left Column (Kandungan PdP - 58% in classic) */}
                        <div className="col-span-7 p-1 space-y-1 bg-white">
                          <div className="flex items-center justify-between px-1.5 py-1 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                            <span>Lajur Kandungan PdP (~58%)</span>
                            <button
                              type="button"
                              onClick={() => handleAddRowToSplitCol(block.id, 'left')}
                              className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[10px] font-semibold flex items-center gap-0.5"
                            >
                              <Plus size={10} />
                              <span>Baris</span>
                            </button>
                          </div>
                          <div className="space-y-1">
                            {block.splitColumns?.left.rows.map((row) => (
                              <div key={row.id} className="relative group/srow border border-slate-300 rounded p-1 bg-slate-50/50">
                                {row.cells.map((cell) => {
                                  const sec = getSectionDetails(cell.sectionId);
                                  return sec ? (
                                    <div key={cell.id} className="flex items-center justify-between text-xs p-1">
                                      <div className="min-w-0">
                                        <span className={`text-[9px] font-bold px-1 rounded border mr-1 ${sec.badgeColor}`}>
                                          {sec.namaJawi}
                                        </span>
                                        <strong className="text-slate-800 text-xs">{sec.namaRumi}</strong>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleOpenPickerForCell({
                                              blockId: block.id,
                                              side: 'left',
                                              rowId: row.id,
                                              cellId: cell.id
                                            })
                                          }
                                          className="text-slate-400 hover:text-purple-600"
                                        >
                                          <Edit3 size={12} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleClearCell({
                                              blockId: block.id,
                                              side: 'left',
                                              rowId: row.id,
                                              cellId: cell.id
                                            })
                                          }
                                          className="text-slate-400 hover:text-rose-600"
                                        >
                                          <X size={12} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteRow(block.id, row.id, 'left')}
                                          className="text-slate-300 hover:text-rose-500 ml-1"
                                          title="Buang baris"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div key={cell.id} className="flex items-center justify-between gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleOpenPickerForCell({
                                            blockId: block.id,
                                            side: 'left',
                                            rowId: row.id,
                                            cellId: cell.id
                                          })
                                        }
                                        className="flex-1 py-1.5 border border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold flex items-center justify-center gap-1"
                                      >
                                        <Plus size={12} />
                                        <span>+ Pilih Bahagian</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteRow(block.id, row.id, 'left')}
                                        className="text-slate-300 hover:text-rose-500 p-1"
                                        title="Buang baris"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MODAL DIALOG: PILIH BAHAGIAN YANG WUJUD / CIPTA BARU */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Pilih Bahagian RPH Untuk Petak Ini
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pilih daripada senarai bahagian standard yang wujud, atau cipta bahagian kustom baharu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 ml-2"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-2.5 sm:px-4 pt-2 gap-1.5 sm:gap-2 text-xs font-bold overflow-x-auto flex-nowrap scrollbar-none">
              <button
                type="button"
                onClick={() => setModalTab('standard')}
                className={`shrink-0 whitespace-nowrap pb-2.5 px-2.5 sm:px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === 'standard'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen size={14} />
                <span>Bahagian Standard ({SENARAI_BAHAGIAN_STANDARD.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('custom')}
                className={`shrink-0 whitespace-nowrap pb-2.5 px-2.5 sm:px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === 'custom'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Tag size={14} />
                <span>Bahagian Kustom ({(layoutConfig.customSections || []).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('create')}
                className={`shrink-0 whitespace-nowrap pb-2.5 px-2.5 sm:px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === 'create'
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-emerald-600 hover:text-emerald-800'
                }`}
              >
                <Plus size={14} />
                <span>+ Tambah Bahagian Baharu</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              
              {/* TAB 1: SENARAI BAHAGIAN STANDARD */}
              {modalTab === 'standard' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Cari bahagian... (cth: Tajuk, Masa, Tarikh, Objektif)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                    {filteredStandardSections.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleAssignSectionToCell(item.id)}
                        className="p-3 text-left border border-slate-200 dark:border-slate-700 hover:border-purple-400 bg-white dark:bg-slate-800 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 rounded-xl transition-all flex flex-col justify-between group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                            {item.namaJawi}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">
                            {item.kategori}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600">
                          {item.namaRumi}
                        </h4>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: BAHAGIAN KUSTOM YANG PERNAH DICIPTA */}
              {modalTab === 'custom' && (
                <div className="space-y-3">
                  {(layoutConfig.customSections || []).length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-300 rounded-xl p-6">
                      <Tag size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Belum ada bahagian kustom dicipta.
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 mb-4">
                        Anda boleh menambah label khas seperti "BBM", "Nilai Murni", "Elemen EMK", dsb.
                      </p>
                      <button
                        type="button"
                        onClick={() => setModalTab('create')}
                        className="px-3.5 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
                      >
                        + Cipta Bahagian Kustom Sekarang
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(layoutConfig.customSections || []).map((sec) => (
                        <div
                          key={sec.id}
                          className="p-3 border border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20 rounded-xl flex items-center justify-between gap-2"
                        >
                          <button
                            type="button"
                            onClick={() => handleAssignSectionToCell(sec.id)}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded border border-purple-300">
                                {sec.namaJawi}
                              </span>
                              <span className="text-[10px] text-purple-600 uppercase font-bold">
                                {sec.jenis}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {sec.namaRumi}
                            </h4>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Padam bahagian kustom "${sec.namaRumi}"?`)) {
                                updateCustomSections(
                                  (layoutConfig.customSections || []).filter((c) => c.id !== sec.id)
                                );
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                            title="Padam bahagian ini"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BORANG CIPTA BAHAGIAN BARU */}
              {modalTab === 'create' && (
                <form onSubmit={handleCreateNewCustomSection} className="space-y-4">
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                    <Sparkles size={16} className="shrink-0 mt-0.5" />
                    <span>
                      Bahagian baharu yang dicipta akan disimpan ke senarai bahagian sekolah anda dan terus dimasukkan ke dalam petak yang dipilih.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Bahagian (Rumi) *
                      </label>
                      <input
                        type="text"
                        placeholder="cth: Bahan Bantu Mengajar (BBM)"
                        value={newSectionRumi}
                        onChange={(e) => setNewSectionRumi(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Bahagian (Jawi)
                      </label>
                      <input
                        type="text"
                        placeholder="cth: باهن بنتو مڠاجر"
                        value={newSectionJawi}
                        onChange={(e) => setNewSectionJawi(e.target.value)}
                        dir="rtl"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-jawi text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Jenis Kandungan
                    </label>
                    <select
                      value={newSectionJenis}
                      onChange={(e) => setNewSectionJenis(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                    >
                      <option value="dropdown">Pilihan Dropdown Guru (Bank Data)</option>
                      <option value="checkbox">Kotak Tanda / Checkbox (Pilihan)</option>
                      <option value="teks">Teks Bebas / Catatan Guru</option>
                      <option value="bullet">Senarai Bullet Point</option>
                      <option value="statik">Teks Statik / Label Tetap</option>
                    </select>
                  </div>

                  {(newSectionJenis === 'dropdown' || newSectionJenis === 'checkbox') && (
                    <div className="bg-purple-50/70 dark:bg-purple-950/30 p-3 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-1">
                      <label className="block text-xs font-bold text-purple-900 dark:text-purple-200">
                        Senarai Pilihan Dropdown / Bank Data (Asingkan dengan koma):
                      </label>
                      <input
                        type="text"
                        placeholder="cth: Komputer Riba, Kad Imbasan, Buku Teks, Projektor LCD"
                        value={newSectionBankOptions}
                        onChange={(e) => setNewSectionBankOptions(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                      />
                      <p className="text-[10px] text-purple-600 dark:text-purple-300">
                        Pilihan ini akan terus masuk ke Bank Data Guru dan boleh ditambah lagi di Tab 3 Admin.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nilai Lalai / Contoh Pilihan Awal
                    </label>
                    <input
                      type="text"
                      placeholder="cth: Komputer Riba"
                      value={newSectionLalai}
                      onChange={(e) => setNewSectionLalai(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalTab('standard')}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <Check size={15} />
                      <span>Simpan & Letak Pada Petak Ini</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
