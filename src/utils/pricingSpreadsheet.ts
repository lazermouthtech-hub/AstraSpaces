/**
 * Pricing Spreadsheet (Multi-Sheet Excel .XLSX & CSV) Import/Export Utility
 * 
 * Supports:
 * - Multi-Sheet Excel Workbook (.XLSX) where each house model is on a separate sheet:
 *   1. "All Models Overview" (Base Models master catalog)
 *   2. "20FT Expandable" (20FT Expandable House & size-specific configurations)
 *   3. "30FT Expandable" (30FT Expandable House & size-specific configurations)
 *   4. "40FT Expandable" (40FT Flagship Expandable & size-specific configurations)
 *   5. "Apple Cabins" (Studio, 1-Bed, 2-Bed, AC-series models & options)
 *   6. "Space Capsules" (D2, D5, D7, D8, D9 capsules & aero pods)
 *   7. "Folding & Fast Assembly" (Z-Type & Fast Assembly container units)
 *   8. "Logistics & Deposits" (Freight, site prep, reservation fee)
 * - Single-table CSV (.CSV) format for legacy spreadsheet tools
 * - Reading & parsing all sheets from an uploaded Excel (.XLSX / .XLS) workbook
 * - Flexible currency parsing ($49,500, €49.500, 49500 USD, etc.)
 * - Automatic price diff detection against live system configuration per unit size
 * - Sheet-by-sheet inspection and preview before applying changes
 */

import * as XLSX from 'xlsx';
import {
  getItemPriceForModel,
  getItemUnitSpec,
  getUnitModelLabel,
  getModelSizeCategory,
} from './pricingCalculator';
import { BASE_MODELS } from '../data/models';
import { FLOOR_PLAN_OPTIONS } from '../data/options';

export interface SpreadsheetPricingRow {
  SheetName?: string;
  ItemType: 'BASE_MODEL' | 'OPTION' | 'LOGISTICS' | 'DEPOSIT';
  Category: string;
  UnitModelId?: string;
  UnitModelName?: string;
  ItemId: string;
  ItemName: string;
  CurrentPriceUSD: number;
  NewPriceUSD: number;
  DimensionsOrSpecs?: string;
  NotesOrDescription?: string;
}

export interface SheetSummary {
  sheetName: string;
  modelId?: string;
  rowCount: number;
  changedCount: number;
}

export interface SpreadsheetValidationResult {
  validRows: SpreadsheetPricingRow[];
  errors: string[];
  warnings: string[];
  totalParsed: number;
  sheets: SheetSummary[];
  isMultiSheet: boolean;
}

/**
 * Escapes CSV field value according to RFC 4180
 */
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (
    str.includes(',') ||
    str.includes(';') ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r')
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Parses raw CSV text into a 2D array of strings
 */
export function parseCSVToMatrix(csvText: string): string[][] {
  const normalized = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const firstLine = normalized.split('\n').find((l) => l.trim().length > 0) || '';

  let delimiter = ',';
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (semicolonCount > commaCount && semicolonCount > tabCount) {
    delimiter = ';';
  } else if (tabCount > commaCount && tabCount > semicolonCount) {
    delimiter = '\t';
  }

  const result: string[][] = [];
  let row: string[] = [];
  let currentVal = '';
  let inQuotes = false;
  let i = 0;

  while (i < normalized.length) {
    const char = normalized[i];
    const nextChar = normalized[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentVal += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentVal += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === delimiter) {
        row.push(currentVal.trim());
        currentVal = '';
        i++;
      } else if (char === '\n') {
        row.push(currentVal.trim());
        if (row.some((cell) => cell.length > 0)) {
          result.push(row);
        }
        row = [];
        currentVal = '';
        i++;
      } else {
        currentVal += char;
        i++;
      }
    }
  }

  if (currentVal.length > 0 || row.length > 0) {
    row.push(currentVal.trim());
    if (row.some((cell) => cell.length > 0)) {
      result.push(row);
    }
  }

  return result;
}

/**
 * Resiliently parses user-entered price strings from spreadsheet cells
 */
export function parsePriceValue(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    return isNaN(val) ? null : val;
  }
  let str = String(val).trim();
  if (!str) return null;

  // Remove currency signs & common currency tags
  str = str.replace(/[$€£¥₹]/g, '');
  str = str.replace(/\b(usd|eur|gbp|cad|aud|ghs)\b/gi, '');
  str = str.replace(/["']/g, '').trim();

  if (!str) return null;

  // European formatted number with dot thousands and comma decimal: "49.500,00"
  if (/^\d{1,3}(\.\d{3})*,\d{1,2}$/.test(str)) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else {
    // Standard format: remove commas and extra spaces
    str = str.replace(/,/g, '').replace(/\s+/g, '');
  }

  const num = parseFloat(str);
  return isNaN(num) ? null : Math.round(num * 100) / 100;
}

/**
 * Looks up an item's live current system price from currentConfig
 */
export function getItemCurrentSystemPrice(
  itemId: string,
  unitModelId?: string,
  config?: any
): number | null {
  if (!config) return null;

  // 1. Base Models
  if (Array.isArray(config.models)) {
    const model = config.models.find((m: any) => m.id === itemId);
    if (model && typeof model.basePrice === 'number') {
      return model.basePrice;
    }
  }

  // 2. Options, Finishes, & Modular Addons
  const optionLists = [
    config.addons,
    config.cabinetryOptions,
    config.roofOptions,
    config.flooringOptions,
    config.wallOptions,
    config.interiorWallOptions,
    config.glazingOptions,
    config.lightingOptions,
    config.electricalOptions,
    FLOOR_PLAN_OPTIONS,
  ];

  for (const list of optionLists) {
    if (Array.isArray(list)) {
      const opt = list.find((item: any) => item.id === itemId);
      if (opt) {
        if (unitModelId && unitModelId !== 'ALL') {
          return getItemPriceForModel(opt, unitModelId, config.models);
        }
        if (typeof opt.price === 'number') return opt.price;
      }
    }
  }

  // 3. Logistics & Site Prep
  if (itemId === 'logistics.freightCost') return config.logistics?.freightCost ?? 4500;
  if (itemId === 'logistics.sitePrepCost') return config.logistics?.sitePrepCost ?? 5500;

  // 4. Branding & Deposit
  if (itemId === 'branding.reservationFee') return config.branding?.reservationFee ?? 250;

  return null;
}

// =============================================================================
// MULTI-SHEET EXCEL WORKBOOK GENERATOR
// =============================================================================

interface SheetRowBuilder {
  ItemType: string;
  Category: string;
  UnitModelId: string;
  UnitModelName: string;
  ItemId: string;
  ItemName: string;
  CurrentPriceUSD: number;
  NewPriceUSD: number;
  DimensionsOrSpecs?: string;
  NotesOrDescription?: string;
}

/**
 * Builds rows specifically for a given unit model (e.g. 20ft, 30ft, 40ft)
 */
function buildRowsForUnitModel(
  modelId: string,
  modelName: string,
  config: any,
  allModels: any[]
): SheetRowBuilder[] {
  const rows: SheetRowBuilder[] = [];
  const model = allModels.find((m: any) => m.id === modelId);

  // 1. House Base Model
  if (model) {
    rows.push({
      ItemType: 'BASE_MODEL',
      Category: 'Home Structure',
      UnitModelId: model.id,
      UnitModelName: model.name,
      ItemId: model.id,
      ItemName: `${model.name} (Base Home)`,
      CurrentPriceUSD: model.basePrice || 0,
      NewPriceUSD: model.basePrice || 0,
      DimensionsOrSpecs: typeof model.dimensions === 'object' ? model.dimensions?.metricStr || '' : String(model.dimensions || ''),
      NotesOrDescription: `Full Turnkey Base Structure | ${model.sqft || 0} sq ft | Lead Time: ${model.leadTime || '3-4 Weeks'}`,
    });
  }

  // Helper to add options
  const addCategoryOptions = (list: any[], categoryLabel: string) => {
    if (!Array.isArray(list)) return;
    list.forEach((opt: any) => {
      const unitPrice = getItemPriceForModel(opt, modelId, allModels);
      const unitSpec = getItemUnitSpec(opt, modelId);
      const sizeCat = getModelSizeCategory(modelId);
      const sizeBadge = sizeCat.toUpperCase();

      rows.push({
        ItemType: 'OPTION',
        Category: categoryLabel,
        UnitModelId: modelId,
        UnitModelName: modelName,
        ItemId: opt.id,
        ItemName: `${opt.name} (${sizeBadge} Unit)`,
        CurrentPriceUSD: unitPrice,
        NewPriceUSD: unitPrice,
        DimensionsOrSpecs: unitSpec.specDetail || opt.specDetail || '',
        NotesOrDescription: unitSpec.description || opt.description || '',
      });
    });
  };

  // 2. Kitchen Cabinetry (size-sensitive)
  addCategoryOptions(config.cabinetryOptions, 'Kitchen Cabinetry');

  // 3. Modular Addon Pods (Kitchenettes, Bath pods, HVAC, Decks, Underfloor Heating)
  addCategoryOptions(config.addons, 'Modular Add-on Pods');

  // 4. Roof Architecture & Solar
  addCategoryOptions(config.roofOptions, 'Roof & Clean Energy');

  // 5. Floor Plans (for expandable models)
  if (modelId.includes('expandable') || model?.series === 'expandable') {
    const relevantPlans = FLOOR_PLAN_OPTIONS.filter((p) => {
      if (modelId === 'expandable-20ft') return p.bedrooms <= 2;
      if (modelId === 'expandable-30ft') return p.bedrooms >= 2 && p.bedrooms <= 3;
      if (modelId === 'expandable-40ft') return p.bedrooms >= 3;
      return true;
    });

    relevantPlans.forEach((plan) => {
      const planPrice = getItemPriceForModel(plan, modelId, allModels);
      rows.push({
        ItemType: 'OPTION',
        Category: 'Architectural Floor Plan',
        UnitModelId: modelId,
        UnitModelName: modelName,
        ItemId: plan.id,
        ItemName: `${plan.name} (${plan.bedrooms} Bed, ${plan.bathrooms} Bath)`,
        CurrentPriceUSD: planPrice,
        NewPriceUSD: planPrice,
        DimensionsOrSpecs: `${plan.bedrooms} Bedroom / ${plan.bathrooms} Bathroom Layout`,
        NotesOrDescription: plan.description || plan.tagline || '',
      });
    });
  }

  // 6. Flooring Finishes
  addCategoryOptions(config.flooringOptions, 'Interior Flooring');

  // 7. Wall Claddings (Exterior)
  addCategoryOptions(config.wallOptions, 'Exterior Wall Cladding');

  // 8. Interior Wall Paneling
  addCategoryOptions(config.interiorWallOptions, 'Interior Wall Paneling');

  // 9. Glazing & Windows
  addCategoryOptions(config.glazingOptions, 'Doors & Windows');

  // 10. Lighting Packages
  addCategoryOptions(config.lightingOptions, 'Lighting Systems');

  // 11. Electrical Systems
  addCategoryOptions(config.electricalOptions, 'Electrical Load Center');

  return rows;
}

/**
 * Builds rows for a group of non-expandable models (e.g. Apple Cabins or Space Capsules)
 */
function buildRowsForModelGroup(
  models: any[],
  groupTitle: string,
  config: any,
  allModels: any[]
): SheetRowBuilder[] {
  const rows: SheetRowBuilder[] = [];

  // Add each base model in this group
  models.forEach((model) => {
    rows.push({
      ItemType: 'BASE_MODEL',
      Category: `${groupTitle} Base Model`,
      UnitModelId: model.id,
      UnitModelName: model.name,
      ItemId: model.id,
      ItemName: `${model.name} (Base Home)`,
      CurrentPriceUSD: model.basePrice || 0,
      NewPriceUSD: model.basePrice || 0,
      DimensionsOrSpecs: typeof model.dimensions === 'object' ? model.dimensions?.metricStr || '' : String(model.dimensions || ''),
      NotesOrDescription: `${model.sqft || 0} sq ft | Lead Time: ${model.leadTime || '3-4 Weeks'}`,
    });
  });

  // Add applicable modular add-ons and finishes
  const representativeModelId = models[0]?.id || 'studio';
  const addCategoryOptions = (list: any[], categoryLabel: string) => {
    if (!Array.isArray(list)) return;
    list.forEach((opt: any) => {
      const unitPrice = getItemPriceForModel(opt, representativeModelId, allModels);
      const unitSpec = getItemUnitSpec(opt, representativeModelId);

      rows.push({
        ItemType: 'OPTION',
        Category: categoryLabel,
        UnitModelId: representativeModelId,
        UnitModelName: groupTitle,
        ItemId: opt.id,
        ItemName: opt.name,
        CurrentPriceUSD: unitPrice,
        NewPriceUSD: unitPrice,
        DimensionsOrSpecs: unitSpec.specDetail || opt.specDetail || '',
        NotesOrDescription: unitSpec.description || opt.description || '',
      });
    });
  };

  addCategoryOptions(config.addons, 'Modular Add-on Pods');
  addCategoryOptions(config.cabinetryOptions, 'Kitchen Cabinetry');
  addCategoryOptions(config.flooringOptions, 'Interior Flooring');
  addCategoryOptions(config.roofOptions, 'Roof & Energy');
  addCategoryOptions(config.glazingOptions, 'Doors & Windows');

  return rows;
}

/**
 * Converts array of SheetRowBuilder objects to an XLSX Worksheet with styling & column widths
 */
function rowsToWorksheet(rows: SheetRowBuilder[]): XLSX.WorkSheet {
  const headers = [
    'UnitModelId',
    'UnitModelName',
    'ItemId',
    'Category',
    'ItemName',
    'CurrentPriceUSD',
    'NewPriceUSD',
    'DimensionsOrSpecs',
    'NotesOrDescription',
  ];

  const dataMatrix: any[][] = [headers];

  rows.forEach((r) => {
    dataMatrix.push([
      r.UnitModelId,
      r.UnitModelName,
      r.ItemId,
      r.Category,
      r.ItemName,
      r.CurrentPriceUSD,
      r.NewPriceUSD,
      r.DimensionsOrSpecs || '',
      r.NotesOrDescription || '',
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(dataMatrix);

  // Set explicit column widths for Excel
  ws['!cols'] = [
    { wch: 18 }, // UnitModelId
    { wch: 26 }, // UnitModelName
    { wch: 24 }, // ItemId
    { wch: 22 }, // Category
    { wch: 42 }, // ItemName
    { wch: 16 }, // CurrentPriceUSD
    { wch: 16 }, // NewPriceUSD
    { wch: 45 }, // DimensionsOrSpecs
    { wch: 55 }, // NotesOrDescription
  ];

  return ws;
}

/**
 * Produces clean, unique sheet names compliant with Excel limits (<= 31 characters, no invalid symbols)
 */
export function getModelSheetName(model: any, usedNames: Set<string>): string {
  let candidate = '';
  const mId = (model.id || '').toLowerCase();

  if (mId === 'expandable-20ft') candidate = '20FT Expandable';
  else if (mId === 'expandable-30ft') candidate = '30FT Expandable';
  else if (mId === 'expandable-40ft') candidate = '40FT Expandable';
  else if (mId === 'studio') candidate = 'AC01 Apple Studio';
  else if (mId === 'one-bedroom') candidate = 'AC02 Apple Deluxe';
  else if (mId === 'apple-cabin-ac03') candidate = 'AC03 Apple Terrace';
  else if (mId === 'two-bedroom') candidate = 'AC04 Apple 2-Bed';
  else if (mId === 'apple-cabin-ad01') candidate = 'AD01 Modular Duplex';
  else if (mId === 'apple-cabin-ad03') candidate = 'AD03 Duplex Cabin';
  else if (mId === 'space-capsule-d2') candidate = 'D2 Space Capsule';
  else if (mId === 'space-capsule-d5') candidate = 'D5 Space Capsule';
  else if (mId === 'space-capsule-d7') candidate = 'D7 Space Capsule';
  else if (mId === 'space-capsule-d8') candidate = 'D8 Space Capsule';
  else if (mId === 'space-capsule-d9') candidate = 'D9 Space Capsule';
  else if (mId === 'folding-z-type-20ft') candidate = '20FT Folding Container';
  else if (mId === 'fast-assembly-container-20ft') candidate = '20FT Fast Assembly';
  else {
    candidate = String(model.name || model.id || 'Custom Model')
      .replace(/[\\/?*\[\]:]/g, '')
      .trim();
    if (candidate.length > 28) {
      candidate = candidate.slice(0, 28).trim();
    }
  }

  let finalName = candidate.slice(0, 31).trim();
  let counter = 2;
  while (usedNames.has(finalName.toLowerCase())) {
    const suffix = ` (${counter})`;
    finalName = `${candidate.slice(0, 31 - suffix.length)}${suffix}`.trim();
    counter++;
  }
  usedNames.add(finalName.toLowerCase());
  return finalName;
}

/**
 * Generates an Excel Workbook (.XLSX) where each house model is on a separate sheet!
 */
export function generateMultiSheetPricingWorkbook(config: any): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const allModels = (config.models?.length ? config.models : BASE_MODELS);

  // =========================================================================
  // SHEET 1: All Models Overview (Master Base Models Catalog)
  // =========================================================================
  const overviewHeaders = [
    'ItemType',
    'Series',
    'ModelId',
    'ModelName',
    'CurrentPriceUSD',
    'NewPriceUSD',
    'Dimensions',
    'AreaSqFt',
    'LeadTime',
    'NotesOrDescription',
  ];
  const overviewRows: any[][] = [overviewHeaders];

  allModels.forEach((model: any) => {
    overviewRows.push([
      'BASE_MODEL',
      model.series ? `${model.series.toUpperCase()} Series` : 'Base Model',
      model.id,
      model.name,
      model.basePrice || 0,
      model.basePrice || 0,
      typeof model.dimensions === 'object' ? model.dimensions?.metricStr || '' : String(model.dimensions || ''),
      model.sqft || 0,
      model.leadTime || '3-4 Weeks',
      model.description || `Turnkey prefab module, includes standard bathroom, electrical, and flooring`,
    ]);
  });

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewRows);
  wsOverview['!cols'] = [
    { wch: 14 }, // ItemType
    { wch: 18 }, // Series
    { wch: 22 }, // ModelId
    { wch: 32 }, // ModelName
    { wch: 16 }, // CurrentPriceUSD
    { wch: 16 }, // NewPriceUSD
    { wch: 24 }, // Dimensions
    { wch: 12 }, // AreaSqFt
    { wch: 14 }, // LeadTime
    { wch: 50 }, // NotesOrDescription
  ];
  XLSX.utils.book_append_sheet(wb, wsOverview, 'All Models Overview');

  // =========================================================================
  // DEDICATED SHEETS: ONE SEPARATE SHEET PER HOUSE MODEL
  // Each individual model gets its own sheet with full configuration & options
  // =========================================================================
  const usedSheetNames = new Set<string>(['all models overview']);

  allModels.forEach((model: any) => {
    const sheetName = getModelSheetName(model, usedSheetNames);
    const modelRows = buildRowsForUnitModel(
      model.id,
      model.name,
      config,
      allModels
    );
    XLSX.utils.book_append_sheet(wb, rowsToWorksheet(modelRows), sheetName);
  });

  // =========================================================================
  // GLOBAL LOGISTICS & RESERVATION DEPOSIT SHEET
  // =========================================================================
  const logisticsRows: SheetRowBuilder[] = [
    {
      ItemType: 'LOGISTICS',
      Category: 'Freight Logistics',
      UnitModelId: 'ALL',
      UnitModelName: 'Global Delivery',
      ItemId: 'logistics.freightCost',
      ItemName: 'Flat Freight Transport Estimate',
      CurrentPriceUSD: config.logistics?.freightCost ?? 4500,
      NewPriceUSD: config.logistics?.freightCost ?? 4500,
      DimensionsOrSpecs: 'Standard Ocean & Flatbed logistics baseline',
      NotesOrDescription: 'Transport from factory staging terminal to project port or site',
    },
    {
      ItemType: 'LOGISTICS',
      Category: 'Site & Groundwork',
      UnitModelId: 'ALL',
      UnitModelName: 'Global Site Prep',
      ItemId: 'logistics.sitePrepCost',
      ItemName: 'Site Prep & Foundation Baseline',
      CurrentPriceUSD: config.logistics?.sitePrepCost ?? 5500,
      NewPriceUSD: config.logistics?.sitePrepCost ?? 5500,
      DimensionsOrSpecs: 'Piers, anchors, leveling, crane hookup setup',
      NotesOrDescription: 'Rapid deployment ground anchoring and electrical/plumbing tie-in',
    },
    {
      ItemType: 'DEPOSIT',
      Category: 'Priority Deposit',
      UnitModelId: 'ALL',
      UnitModelName: 'Global Reservation',
      ItemId: 'branding.reservationFee',
      ItemName: 'Priority Production Reservation Fee',
      CurrentPriceUSD: config.branding?.reservationFee ?? 250,
      NewPriceUSD: config.branding?.reservationFee ?? 250,
      DimensionsOrSpecs: 'Refundable production slot deposit',
      NotesOrDescription: 'Locks factory build slot and assigns dedicated engineering specialist',
    },
  ];
  XLSX.utils.book_append_sheet(wb, rowsToWorksheet(logisticsRows), 'Logistics & Deposits');

  return wb;
}

/**
 * Downloads the Multi-Sheet Excel Workbook (.XLSX) with each house model on a separate sheet
 */
export function downloadMultiSheetPricingWorkbook(config: any, filename?: string): void {
  const wb = generateMultiSheetPricingWorkbook(config);
  const dateStr = new Date().toISOString().slice(0, 10);
  const finalName = filename || `wanhai_models_pricing_multisheet_${dateStr}.xlsx`;
  XLSX.writeFile(wb, finalName);
}

/**
 * Legacy single-sheet CSV export
 */
export function generateSystemPricingCSV(config: any): string {
  const headers = [
    'ItemType',
    'Category',
    'UnitModelId',
    'UnitModelName',
    'ItemId',
    'ItemName',
    'CurrentPriceUSD',
    'NewPriceUSD',
    'NotesOrDescription',
  ];

  const rows: string[][] = [headers];
  const allModels = (config.models?.length ? config.models : BASE_MODELS);
  const primaryUnitModels = [
    { id: 'expandable-10ft', name: '10FT Double-Wing Expandable' },
    { id: 'expandable-20ft', name: '20FT Double-Wing Expandable' },
    { id: 'expandable-30ft', name: '30FT Double-Wing Expandable' },
    { id: 'expandable-40ft', name: '40FT Flagship Expandable' },
  ];

  allModels.forEach((model: any) => {
    rows.push([
      'BASE_MODEL',
      model.series ? `${model.series.toUpperCase()} Series` : 'Base Model',
      model.id,
      model.name,
      model.id,
      model.name,
      String(model.basePrice || 0),
      String(model.basePrice || 0),
      `${typeof model.dimensions === 'object' ? model.dimensions?.metricStr || '' : model.dimensions || ''} | ${model.sqft || 0} sq ft`,
    ]);
  });

  const addOptionRows = (list: any[], categoryLabel: string, isSizeSensitive: boolean = false) => {
    if (!Array.isArray(list)) return;
    list.forEach((opt: any) => {
      if (isSizeSensitive) {
        primaryUnitModels.forEach((unit) => {
          const unitPrice = getItemPriceForModel(opt, unit.id, allModels);
          const unitSpec = getItemUnitSpec(opt, unit.id);
          const sizeBadge = unit.id === 'expandable-10ft' ? '10FT' : unit.id === 'expandable-20ft' ? '20FT' : unit.id === 'expandable-30ft' ? '30FT' : '40FT';

          rows.push([
            'OPTION',
            categoryLabel,
            unit.id,
            unit.name,
            opt.id,
            `${opt.name} (${sizeBadge} Unit)`,
            String(unitPrice),
            String(unitPrice),
            unitSpec.specDetail || opt.description || '',
          ]);
        });

        rows.push([
          'OPTION',
          categoryLabel,
          'ALL',
          'All Units (Baseline Default)',
          opt.id,
          `${opt.name} (Baseline Default)`,
          String(opt.price || 0),
          String(opt.price || 0),
          opt.description || '',
        ]);
      } else {
        rows.push([
          'OPTION',
          categoryLabel,
          'ALL',
          'All Units',
          opt.id,
          opt.name,
          String(opt.price || 0),
          String(opt.price || 0),
          opt.description || '',
        ]);
      }
    });
  };

  addOptionRows(config.addons, 'Modular Add-on Pods', true);
  addOptionRows(config.cabinetryOptions, 'Kitchen Cabinetry', true);
  addOptionRows(config.roofOptions, 'Roof & Clean Energy', true);
  addOptionRows(config.flooringOptions, 'Interior Flooring', false);
  addOptionRows(config.wallOptions, 'Exterior Cladding', false);
  addOptionRows(config.interiorWallOptions, 'Interior Wall Paneling', false);
  addOptionRows(config.glazingOptions, 'Window & Glazing Systems', false);
  addOptionRows(config.lightingOptions, 'Lighting Packages', false);
  addOptionRows(config.electricalOptions, 'Electrical & Power', false);

  rows.push([
    'LOGISTICS',
    'Freight Logistics',
    'ALL',
    'Global Delivery',
    'logistics.freightCost',
    'Flat Freight Transport Estimate',
    String(config.logistics?.freightCost ?? 4500),
    String(config.logistics?.freightCost ?? 4500),
    'Ocean & Flatbed Delivery baseline cost',
  ]);

  rows.push([
    'LOGISTICS',
    'Site & Groundwork',
    'ALL',
    'Global Site Prep',
    'logistics.sitePrepCost',
    'Site Prep & Foundation Baseline',
    String(config.logistics?.sitePrepCost ?? 5500),
    String(config.logistics?.sitePrepCost ?? 5500),
    'Foundation piers, grading and anchor set',
  ]);

  rows.push([
    'DEPOSIT',
    'Priority Queue Deposit',
    'ALL',
    'Global Reservation',
    'branding.reservationFee',
    'Priority Production Reservation Fee',
    String(config.branding?.reservationFee ?? 250),
    String(config.branding?.reservationFee ?? 250),
    'Refundable queue slot deposit paid during initial reservation',
  ]);

  return rows.map((r) => r.map(escapeCsvValue).join(',')).join('\n');
}

export function downloadPricingSpreadsheet(config: any, filename?: string): void {
  // By default, offer Multi-Sheet Excel Workbook for best user experience!
  downloadMultiSheetPricingWorkbook(config, filename);
}

// =============================================================================
// PARSER & VALIDATOR FOR MULTI-SHEET WORKBOOKS & CSVs
// =============================================================================

/**
 * Infers unit model ID from a sheet name (e.g. "20FT Expandable" -> "expandable-20ft", "AC01 Apple Studio" -> "studio")
 */
export function inferUnitModelIdFromSheetName(
  sheetName: string,
  allModels?: any[]
): string | undefined {
  if (!sheetName) return undefined;
  const lower = sheetName.toLowerCase().trim();

  // Overview and logistics sheets do not belong to a single model
  if (lower.includes('overview') || lower.includes('logistics') || lower.includes('deposit')) {
    return undefined;
  }

  // 1. Exact known model sheet matches
  if (lower.includes('20ft') && (lower.includes('expand') || lower.includes('wing'))) return 'expandable-20ft';
  if (lower.includes('30ft') && (lower.includes('expand') || lower.includes('wing'))) return 'expandable-30ft';
  if (lower.includes('40ft') && (lower.includes('expand') || lower.includes('flagship'))) return 'expandable-40ft';

  if (lower.includes('ac01') || lower.includes('apple studio') || lower === 'studio') return 'studio';
  if (lower.includes('ac02') || lower.includes('apple deluxe') || lower === 'one-bedroom') return 'one-bedroom';
  if (lower.includes('ac03') || lower.includes('terrace')) return 'apple-cabin-ac03';
  if (lower.includes('ac04') || lower.includes('apple 2-bed') || lower.includes('2-bedroom') || lower === 'two-bedroom') return 'two-bedroom';
  if (lower.includes('ad01') || lower.includes('modular duplex')) return 'apple-cabin-ad01';
  if (lower.includes('ad03') || lower.includes('duplex cabin')) return 'apple-cabin-ad03';

  if (lower.includes('d2')) return 'space-capsule-d2';
  if (lower.includes('d5')) return 'space-capsule-d5';
  if (lower.includes('d7')) return 'space-capsule-d7';
  if (lower.includes('d8')) return 'space-capsule-d8';
  if (lower.includes('d9')) return 'space-capsule-d9';

  if (lower.includes('folding') || lower.includes('z-type')) return 'folding-z-type-20ft';
  if (lower.includes('fast assembly') || lower.includes('fast-assembly')) return 'fast-assembly-container-20ft';

  // 2. Dynamic model search across allModels
  const models = allModels?.length ? allModels : BASE_MODELS;
  for (const m of models) {
    if (lower === m.id.toLowerCase()) return m.id;
    if (lower === m.name.toLowerCase()) return m.id;
    const cleanMName = m.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanSheet = lower.replace(/[^a-z0-9]/g, '');
    if (cleanSheet.includes(cleanMName) || cleanMName.includes(cleanSheet)) {
      return m.id;
    }
    if (lower.includes(m.id.toLowerCase())) return m.id;
  }

  return undefined;
}

/**
 * Parses a single 2D sheet matrix into SpreadsheetPricingRow array
 */
function parseSheetMatrix(
  matrix: any[][],
  sheetName: string,
  currentConfig?: any,
  errors: string[] = [],
  warnings: string[] = []
): SpreadsheetPricingRow[] {
  if (matrix.length < 2) return [];

  const headerRow = matrix[0].map((h) => String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''));

  // 1. ItemId detection
  let itemIdCol = headerRow.findIndex(
    (h) => h === 'itemid' || h === 'id' || h.endsWith('itemid') || h.includes('itemid') || h === 'code' || h === 'sku' || h === 'modelid'
  );

  // 2. UnitModelId detection
  const unitModelIdCol = headerRow.findIndex(
    (h) => h === 'unitmodelid' || h === 'modelid' || h === 'unitid' || h === 'unitmodel' || h === 'unitsize' || h === 'model'
  );

  // If itemIdCol matched 'modelid' and unitModelIdCol also matched 'modelid', prefer itemid or modelid
  if (itemIdCol === -1 && headerRow.includes('modelid')) {
    itemIdCol = headerRow.indexOf('modelid');
  }

  // 3. UnitModelName detection
  const unitModelNameCol = headerRow.findIndex(
    (h) => h === 'unitmodelname' || h === 'modelname' || h === 'unitname'
  );

  // 4. ItemName detection
  const itemNameCol = headerRow.findIndex(
    (h) => h === 'itemname' || h === 'name' || h.includes('itemname') || h === 'title' || h === 'label'
  );

  // 5. Category detection
  const categoryCol = headerRow.findIndex(
    (h) => h.includes('category') || h.includes('cat') || h === 'group' || h === 'section' || h === 'series'
  );

  // 6. ItemType detection
  const itemTypeCol = headerRow.findIndex(
    (h) => h === 'itemtype' || h === 'type' || h.includes('itemtype')
  );

  // 7. Notes detection
  const notesCol = headerRow.findIndex(
    (h) => h.includes('note') || h.includes('desc')
  );

  // 8. Specs detection
  const specsCol = headerRow.findIndex(
    (h) => h.includes('spec') || h.includes('dimension')
  );

  // 9. Prices columns
  let newPriceCol = -1;
  let currentPriceCol = -1;

  for (let c = 0; c < headerRow.length; c++) {
    const col = headerRow[c];
    if (col === 'newpriceusd' || col === 'newprice' || col === 'updatedprice' || col === 'targetprice') {
      newPriceCol = c;
    } else if (
      col === 'currentpriceusd' ||
      col === 'currentprice' ||
      col === 'oldprice' ||
      col === 'existingprice' ||
      col === 'basepriceusd' ||
      col === 'liveprice'
    ) {
      currentPriceCol = c;
    }
  }

  if (newPriceCol === -1 || currentPriceCol === -1) {
    for (let c = 0; c < headerRow.length; c++) {
      const col = headerRow[c];
      if (newPriceCol === -1 && col.includes('new') && col.includes('price')) {
        newPriceCol = c;
      }
      if (currentPriceCol === -1 && (col.includes('current') || col.includes('base') || col.includes('old')) && col.includes('price')) {
        currentPriceCol = c;
      }
    }
  }

  if (newPriceCol === -1 && currentPriceCol === -1) {
    const priceCol = headerRow.findIndex((h) => h.includes('price') || h === 'cost' || h === 'rate');
    if (priceCol !== -1) {
      newPriceCol = priceCol;
      currentPriceCol = priceCol;
    }
  }

  if (itemIdCol === -1 && newPriceCol === -1) {
    return [];
  }

  const validRows: SpreadsheetPricingRow[] = [];
  const defaultSheetUnitModelId = inferUnitModelIdFromSheetName(sheetName, currentConfig?.models);

  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row || row.length === 0 || !row.some((c) => String(c || '').trim().length > 0)) {
      continue;
    }

    let rawItemId = (itemIdCol !== -1 ? String(row[itemIdCol] || '').trim() : '');
    let unitModelId = (unitModelIdCol !== -1 ? String(row[unitModelIdCol] || '').trim() : '');
    const unitModelName = (unitModelNameCol !== -1 ? String(row[unitModelNameCol] || '').trim() : undefined);

    if (rawItemId.includes('@')) {
      const parts = rawItemId.split('@');
      rawItemId = parts[0].trim();
      if (!unitModelId) {
        unitModelId = parts[1].trim();
      }
    }

    // Fallback: if itemIdCol was not found or blank, check itemNameCol
    if (!rawItemId && itemNameCol !== -1) {
      rawItemId = String(row[itemNameCol] || '').trim();
    }

    // Resolve rawItemId and unitModelId against known models
    const allKnownModels = currentConfig?.models?.length ? currentConfig.models : BASE_MODELS;
    const matchModel = allKnownModels.find(
      (m: any) =>
        m.id.toLowerCase() === rawItemId.toLowerCase() ||
        m.name.toLowerCase() === rawItemId.toLowerCase()
    );
    if (matchModel) {
      rawItemId = matchModel.id;
      if (!unitModelId) {
        unitModelId = matchModel.id;
      }
    }

    if (unitModelId) {
      const matchUnitModel = allKnownModels.find(
        (m: any) =>
          m.id.toLowerCase() === unitModelId.toLowerCase() ||
          m.name.toLowerCase() === unitModelId.toLowerCase()
      );
      if (matchUnitModel) {
        unitModelId = matchUnitModel.id;
      }
    }

    if (!unitModelId && defaultSheetUnitModelId) {
      unitModelId = defaultSheetUnitModelId;
    }

    const itemId = rawItemId;
    if (!itemId) continue;

    const parsedNewPrice = newPriceCol !== -1 ? parsePriceValue(row[newPriceCol]) : null;
    const parsedCurrentPrice = currentPriceCol !== -1 ? parsePriceValue(row[currentPriceCol]) : null;

    if (parsedNewPrice === null && parsedCurrentPrice === null) {
      continue;
    }

    let determinedCurrentPrice = 0;
    let determinedNewPrice = 0;

    const systemLivePrice = currentConfig ? getItemCurrentSystemPrice(itemId, unitModelId, currentConfig) : null;

    if (parsedNewPrice !== null && parsedCurrentPrice !== null && parsedNewPrice !== parsedCurrentPrice) {
      // User explicitly specified a target NewPriceUSD different from CurrentPriceUSD
      determinedCurrentPrice = systemLivePrice !== null ? systemLivePrice : parsedCurrentPrice;
      determinedNewPrice = parsedNewPrice;
    } else if (systemLivePrice !== null) {
      determinedCurrentPrice = systemLivePrice;
      if (parsedNewPrice !== null && parsedNewPrice !== systemLivePrice) {
        determinedNewPrice = parsedNewPrice;
      } else if (parsedCurrentPrice !== null && parsedCurrentPrice !== systemLivePrice) {
        determinedNewPrice = parsedCurrentPrice;
      } else if (parsedNewPrice !== null) {
        determinedNewPrice = parsedNewPrice;
      } else if (parsedCurrentPrice !== null) {
        determinedNewPrice = parsedCurrentPrice;
      } else {
        determinedNewPrice = systemLivePrice;
      }
    } else {
      if (parsedNewPrice !== null) {
        determinedNewPrice = parsedNewPrice;
        determinedCurrentPrice = parsedCurrentPrice !== null ? parsedCurrentPrice : parsedNewPrice;
      } else {
        determinedNewPrice = parsedCurrentPrice!;
        determinedCurrentPrice = parsedCurrentPrice!;
      }
    }

    if (determinedNewPrice < 0) {
      errors.push(`[${sheetName}] Row #${r + 1} (${itemId}): Negative prices are not allowed.`);
      continue;
    }

    const itemTypeRaw = (itemTypeCol !== -1 ? String(row[itemTypeCol] || '').trim().toUpperCase() : '') || 'OPTION';
    let itemType: SpreadsheetPricingRow['ItemType'] = 'OPTION';
    if (itemTypeRaw.includes('MODEL')) itemType = 'BASE_MODEL';
    else if (itemTypeRaw.includes('LOGISTIC')) itemType = 'LOGISTICS';
    else if (itemTypeRaw.includes('DEPOSIT')) itemType = 'DEPOSIT';

    const rawItemName = itemNameCol !== -1 ? String(row[itemNameCol] || '').trim() : '';

    validRows.push({
      SheetName: sheetName,
      ItemType: itemType,
      Category: categoryCol !== -1 ? String(row[categoryCol] || '').trim() : '',
      UnitModelId: unitModelId || undefined,
      UnitModelName: unitModelName || (unitModelId === 'ALL' ? 'All Units' : (unitModelId ? getUnitModelLabel(unitModelId, currentConfig?.models) : undefined)),
      ItemId: itemId,
      ItemName: rawItemName || itemId,
      CurrentPriceUSD: determinedCurrentPrice,
      NewPriceUSD: determinedNewPrice,
      DimensionsOrSpecs: specsCol !== -1 ? String(row[specsCol] || '').trim() : '',
      NotesOrDescription: notesCol !== -1 ? String(row[notesCol] || '').trim() : '',
    });
  }

  return validRows;
}

/**
 * Universal validator & parser:
 * Accepts ArrayBuffer, Uint8Array, or CSV string.
 * Automatically parses all sheets in an Excel (.xlsx / .xls) workbook or CSV text!
 */
export function parseAndValidatePricingFile(
  fileData: ArrayBuffer | Uint8Array | string,
  currentConfig?: any
): SpreadsheetValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const allValidRows: SpreadsheetPricingRow[] = [];
  const sheets: SheetSummary[] = [];

  let isMultiSheet = false;

  try {
    let workbook: XLSX.WorkBook;

    if (typeof fileData === 'string') {
      // Could be CSV text or base64
      if (fileData.startsWith('{') || fileData.startsWith('<')) {
        return {
          validRows: [],
          errors: ['Unsupported file format. Please upload an Excel (.xlsx) or CSV (.csv) spreadsheet.'],
          warnings: [],
          totalParsed: 0,
          sheets: [],
          isMultiSheet: false,
        };
      }
      workbook = XLSX.read(fileData, { type: 'string' });
    } else {
      workbook = XLSX.read(fileData, { type: 'array' });
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return {
        validRows: [],
        errors: ['The workbook does not contain any readable sheets.'],
        warnings: [],
        totalParsed: 0,
        sheets: [],
        isMultiSheet: false,
      };
    }

    isMultiSheet = workbook.SheetNames.length > 1;

    // Deduplicate map for rows to avoid duplicates across multiple sheets if user edited same item
    const dedupeMap = new Map<string, SpreadsheetPricingRow>();

    // Process each sheet in the workbook
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) return;

      const matrix = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false,
      }) as any[][];

      const sheetRows = parseSheetMatrix(matrix, sheetName, currentConfig, errors, warnings);
      let sheetChangedCount = 0;

      sheetRows.forEach((row) => {
        const isChanged = row.CurrentPriceUSD !== row.NewPriceUSD;
        if (isChanged) sheetChangedCount++;

        const key = row.UnitModelId && row.UnitModelId !== 'ALL'
          ? `${row.ItemId}@${row.UnitModelId}`
          : row.ItemId;

        // If item changed on this sheet, prioritize it
        if (!dedupeMap.has(key) || isChanged) {
          dedupeMap.set(key, row);
        }
      });

      sheets.push({
        sheetName,
        modelId: inferUnitModelIdFromSheetName(sheetName),
        rowCount: sheetRows.length,
        changedCount: sheetChangedCount,
      });
    });

    dedupeMap.forEach((row) => {
      allValidRows.push(row);
    });

    if (allValidRows.length === 0 && errors.length === 0) {
      errors.push('No valid pricing items were found. Ensure your columns include ItemId and NewPriceUSD.');
    }
  } catch (err: any) {
    errors.push(`Failed to parse spreadsheet file: ${err.message || 'Corrupted or unsupported format'}`);
  }

  return {
    validRows: allValidRows,
    errors,
    warnings,
    totalParsed: allValidRows.length,
    sheets,
    isMultiSheet,
  };
}

/**
 * Backward compatibility wrapper for parseAndValidatePricingCSV
 */
export function parseAndValidatePricingCSV(
  csvText: string,
  currentConfig?: any
): SpreadsheetValidationResult {
  return parseAndValidatePricingFile(csvText, currentConfig);
}

/**
 * Applies spreadsheet rows to the current app configuration, returning the updated configuration object
 */
export function applySpreadsheetPricesToConfig(
  currentConfig: any,
  validRows: SpreadsheetPricingRow[]
): { updatedConfig: any; appliedCount: number; updatedItemNames: string[] } {
  const next = JSON.parse(JSON.stringify(currentConfig));
  let appliedCount = 0;
  const updatedItemNames: string[] = [];

  // Build lookup maps
  const basePriceMap = new Map<string, number>();
  const modelOverrideMap = new Map<string, number>(); // key: `${itemId}@${modelId}`

  validRows.forEach((row) => {
    // If it's a base model, or if UnitModelId === ItemId, or ItemType === 'BASE_MODEL'
    if (row.ItemType === 'BASE_MODEL' || row.ItemId === row.UnitModelId) {
      basePriceMap.set(row.ItemId, row.NewPriceUSD);
      if (row.UnitModelId) {
        modelOverrideMap.set(`${row.ItemId}@${row.UnitModelId}`, row.NewPriceUSD);
      }
    } else if (row.UnitModelId && row.UnitModelId !== 'ALL') {
      modelOverrideMap.set(`${row.ItemId}@${row.UnitModelId}`, row.NewPriceUSD);
    } else {
      basePriceMap.set(row.ItemId, row.NewPriceUSD);
    }
  });

  // 1. Update Base Models
  if (Array.isArray(next.models)) {
    next.models = next.models.map((model: any) => {
      let newP = basePriceMap.get(model.id);
      if (newP === undefined) {
        newP = modelOverrideMap.get(`${model.id}@${model.id}`);
      }
      if (newP === undefined) {
        const matchRow = validRows.find(
          (r) => (r.ItemType === 'BASE_MODEL' || r.ItemId === model.id) && r.ItemId === model.id
        );
        if (matchRow) newP = matchRow.NewPriceUSD;
      }

      if (newP !== undefined && typeof newP === 'number') {
        if (model.basePrice !== newP) {
          appliedCount++;
          updatedItemNames.push(`${model.name} ($${model.basePrice} ➔ $${newP})`);
        }
        return { ...model, basePrice: newP };
      }
      return model;
    });
  }

  // 2. Helper to update option lists with unit-specific overrides and baseline prices
  const updateOptionList = (listKey: string, categoryLabel: string) => {
    if (Array.isArray(next[listKey])) {
      next[listKey] = next[listKey].map((item: any) => {
        let modified = false;
        let updatedItem = { ...item };

        // 2a. Check if baseline price changed
        if (basePriceMap.has(item.id)) {
          const newP = basePriceMap.get(item.id)!;
          if (item.price !== newP) {
            appliedCount++;
            updatedItemNames.push(`${item.name} (${categoryLabel} Baseline: $${item.price} ➔ $${newP})`);
            updatedItem.price = newP;
            modified = true;
          }
        }

        // 2b. Check unit-specific prices
        const priceByModel = { ...(item.priceByModel || {}) };
        let unitPricesChanged = false;

        validRows.forEach((row) => {
          if (row.ItemId === item.id && row.UnitModelId && row.UnitModelId !== 'ALL') {
            const currentUnitPrice = priceByModel[row.UnitModelId] ?? item.price;
            if (currentUnitPrice !== row.NewPriceUSD) {
              appliedCount++;
              const uName = row.UnitModelName || getUnitModelLabel(row.UnitModelId, next.models);
              updatedItemNames.push(`${item.name} [${uName}] ($${currentUnitPrice} ➔ $${row.NewPriceUSD})`);
              priceByModel[row.UnitModelId] = row.NewPriceUSD;

              // Mirror to size category ('20ft', '30ft', '40ft') for instant configurator matching
              const sizeCat = getModelSizeCategory(row.UnitModelId);
              if (sizeCat && (sizeCat === '20ft' || sizeCat === '30ft' || sizeCat === '40ft')) {
                priceByModel[sizeCat] = row.NewPriceUSD;
              }

              unitPricesChanged = true;
              modified = true;
            }
          }
        });

        if (unitPricesChanged) {
          updatedItem.priceByModel = priceByModel;
        }

        return modified ? updatedItem : item;
      });
    }
  };

  updateOptionList('addons', 'Modular Add-on');
  updateOptionList('cabinetryOptions', 'Cabinetry');
  updateOptionList('roofOptions', 'Roof & Solar');
  updateOptionList('flooringOptions', 'Flooring');
  updateOptionList('wallOptions', 'Exterior Wall');
  updateOptionList('interiorWallOptions', 'Interior Wall');
  updateOptionList('glazingOptions', 'Glazing');
  updateOptionList('lightingOptions', 'Lighting');
  updateOptionList('electricalOptions', 'Electrical');

  // 3. Update Logistics & Site Prep
  if (!next.logistics) next.logistics = {};
  const freightPrice = basePriceMap.get('logistics.freightCost') ??
    validRows.find((r) => r.ItemId === 'logistics.freightCost')?.NewPriceUSD;
  if (freightPrice !== undefined && typeof freightPrice === 'number') {
    if (next.logistics.freightCost !== freightPrice) {
      appliedCount++;
      updatedItemNames.push(`Freight Transport ($${next.logistics.freightCost} ➔ $${freightPrice})`);
    }
    next.logistics.freightCost = freightPrice;
  }

  const sitePrice = basePriceMap.get('logistics.sitePrepCost') ??
    validRows.find((r) => r.ItemId === 'logistics.sitePrepCost')?.NewPriceUSD;
  if (sitePrice !== undefined && typeof sitePrice === 'number') {
    if (next.logistics.sitePrepCost !== sitePrice) {
      appliedCount++;
      updatedItemNames.push(`Site Prep & Groundwork ($${next.logistics.sitePrepCost} ➔ $${sitePrice})`);
    }
    next.logistics.sitePrepCost = sitePrice;
  }

  // 4. Update Reservation Fee
  if (!next.branding) next.branding = {};
  const feePrice = basePriceMap.get('branding.reservationFee') ??
    validRows.find((r) => r.ItemId === 'branding.reservationFee')?.NewPriceUSD;
  if (feePrice !== undefined && typeof feePrice === 'number') {
    if (next.branding.reservationFee !== feePrice) {
      appliedCount++;
      updatedItemNames.push(`Reservation Fee ($${next.branding.reservationFee} ➔ $${feePrice})`);
    }
    next.branding.reservationFee = feePrice;
  }

  return {
    updatedConfig: next,
    appliedCount,
    updatedItemNames,
  };
}
