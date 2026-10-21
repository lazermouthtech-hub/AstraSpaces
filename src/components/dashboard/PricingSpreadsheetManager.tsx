import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Eye,
  FileText,
  DollarSign,
  Info,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAppConfig } from '../../context/AppConfigContext';
import {
  downloadMultiSheetPricingWorkbook,
  generateSystemPricingCSV,
  parseAndValidatePricingFile,
  applySpreadsheetPricesToConfig,
  SpreadsheetPricingRow,
  SpreadsheetValidationResult,
  SheetSummary,
} from '../../utils/pricingSpreadsheet';
import { formatCurrency } from '../../utils/currency';

interface PricingSpreadsheetManagerProps {
  onPricesUpdated?: (appliedCount?: number, updatedConfig?: any) => void;
}

export const PricingSpreadsheetManager: React.FC<PricingSpreadsheetManagerProps> = ({
  onPricesUpdated,
}) => {
  const { config, updateConfig } = useAppConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<SpreadsheetValidationResult | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedSheet, setSelectedSheet] = useState<string>('all');

  // Handle Download Multi-Sheet Excel Workbook (.XLSX)
  const handleDownloadExcel = () => {
    downloadMultiSheetPricingWorkbook(config);
  };

  // Handle Download Single-Table CSV (.CSV)
  const handleDownloadCSV = () => {
    const csvContent = generateSystemPricingCSV(config);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `wanhai_system_pricing_single_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Universal File Processor (.xlsx, .xls, .csv)
  const handleProcessFile = async (file: File) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setFileName(file.name);
    setIsProcessing(true);
    setSelectedSheet('all');

    try {
      const buffer = await file.arrayBuffer();
      const validation = parseAndValidatePricingFile(buffer, config);
      setPreviewData(validation);

      if (validation.errors.length > 0) {
        setErrorMessage(
          `Found ${validation.errors.length} issue(s) while reading the spreadsheet. Please review before applying.`
        );
      }
    } catch (err: any) {
      setErrorMessage(`Failed to parse file: ${err.message || 'Invalid spreadsheet file'}`);
      setPreviewData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleProcessFile(file);
  };

  // Apply Changes to Live Config
  const handleApplyChanges = () => {
    if (!previewData || previewData.validRows.length === 0) return;

    try {
      const { updatedConfig, appliedCount, updatedItemNames } = applySpreadsheetPricesToConfig(
        config,
        previewData.validRows
      );

      updateConfig(updatedConfig);

      setSuccessMessage(
        `Successfully synchronized ${appliedCount} system item price(s) across all sheets and models on the website!`
      );
      setPreviewData(null);
      setFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onPricesUpdated) {
        onPricesUpdated(appliedCount, updatedConfig);
      }
    } catch (err: any) {
      setErrorMessage(`Error updating prices: ${err.message}`);
    }
  };

  // Cancel Upload
  const handleCancelPreview = () => {
    setPreviewData(null);
    setFileName(null);
    setErrorMessage(null);
    setSelectedSheet('all');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Filter preview rows by sheet AND by category/change status
  const filteredRows = previewData?.validRows.filter((row) => {
    // 1. Sheet Filter
    if (selectedSheet !== 'all' && row.SheetName && row.SheetName !== selectedSheet) {
      return false;
    }

    // 2. Type / Change Filter
    if (filterType === 'all') return true;
    if (filterType === 'changed') return row.CurrentPriceUSD !== row.NewPriceUSD;
    if (filterType === 'models') return row.ItemType === 'BASE_MODEL';
    if (filterType === 'options') return row.ItemType === 'OPTION';
    if (filterType === 'logistics') return row.ItemType === 'LOGISTICS' || row.ItemType === 'DEPOSIT';
    if (filterType === '20ft') return row.UnitModelId?.includes('20ft') || row.ItemId?.includes('20ft') || row.ItemName.includes('20FT') || row.SheetName?.includes('20FT');
    if (filterType === '30ft') return row.UnitModelId?.includes('30ft') || row.ItemId?.includes('30ft') || row.ItemName.includes('30FT') || row.SheetName?.includes('30FT');
    if (filterType === '40ft') return row.UnitModelId?.includes('40ft') || row.ItemId?.includes('40ft') || row.ItemName.includes('40FT') || row.SheetName?.includes('40FT');

    return true;
  });

  const changedRowsCount = previewData?.validRows.filter(
    (row) => row.CurrentPriceUSD !== row.NewPriceUSD
  ).length || 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 via-amber-50/20 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xs shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-gray-900 text-lg">
                  Multi-Sheet Spreadsheet Price Center
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Excel Multi-Sheet Enabled
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  1 Sheet Per Model
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                Download your catalog as a multi-sheet Excel workbook where each house model (20FT, 30FT, 40FT, Apple Cabin, Capsule) is organized on its own dedicated sheet. Edit prices comfortably in Excel or Google Sheets, then upload the file back here to automatically sync the entire website!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="px-3 py-2 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <HelpCircle className="w-4 h-4 text-gray-400" />
              <span>How It Works</span>
              {showHowItWorks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Primary Action: Download Multi-Sheet Excel */}
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:shadow-sm"
              title="Download Excel Workbook with 1 sheet per house model"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100 shrink-0" />
              <div className="text-left leading-tight">
                <span className="block font-black">Download Excel (.XLSX)</span>
                <span className="text-[9px] text-emerald-100 font-medium block">1 Sheet Per Model</span>
              </div>
            </button>

            {/* Secondary Action: Download CSV */}
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="px-3 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Download raw single-table CSV file"
            >
              <Download className="w-4 h-4 text-gray-500" />
              <span>CSV File</span>
            </button>

            {/* Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Upload modified spreadsheet file (.xlsx, .xls, .csv)"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Updated File</span>
            </button>
          </div>
        </div>

        {/* Collapsible How It Works Guide */}
        {showHowItWorks && (
          <div className="mt-5 pt-5 border-t border-emerald-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-in fade-in duration-200">
            <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100 space-y-1">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center mb-1">
                1
              </div>
              <h4 className="font-bold text-gray-900">Separate Sheets by Model</h4>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                Click <strong>"Download Excel (.XLSX)"</strong>. The workbook contains separate tabs: <em>20FT Expandable</em>, <em>30FT Expandable</em>, <em>40FT Expandable</em>, <em>Apple Cabins</em>, <em>Space Capsules</em>, and <em>Logistics</em>.
              </p>
            </div>

            <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100 space-y-1">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center mb-1">
                2
              </div>
              <h4 className="font-bold text-gray-900">Edit Tab by Tab</h4>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                Open in Excel or Google Sheets. Click on any house model's tab at the bottom to adjust prices specifically for that model in the <strong>NewPriceUSD</strong> column.
              </p>
            </div>

            <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100 space-y-1">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center mb-1">
                3
              </div>
              <h4 className="font-bold text-gray-900">Upload &amp; Auto-Sync</h4>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                Drop your updated workbook here. The platform scans all sheets simultaneously, displays a diff comparison, and synchronizes the 3D configurator, spec sheets, and order engine!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-7 space-y-6">
        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-950 text-xs">Spreadsheet Synchronized Successfully!</h4>
                <p className="text-emerald-800 text-xs mt-0.5">{successMessage}</p>
                <p className="text-emerald-700 text-[11px] mt-1">
                  The updated prices are now active across the 3D Configurator, Model Catalogs, Spec Sheet Blueprints, and Order Management.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-950 text-xs">Spreadsheet Notice</h4>
                <p className="text-red-800 text-xs mt-0.5">{errorMessage}</p>
                {previewData?.errors && previewData.errors.length > 0 && (
                  <ul className="mt-2 list-disc list-inside text-[11px] text-red-700 space-y-0.5 max-h-32 overflow-y-auto">
                    {previewData.errors.slice(0, 5).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {previewData.errors.length > 5 && (
                      <li>...and {previewData.errors.length - 5} more issues</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-700 hover:text-red-900 text-xs font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload Zone (if no preview currently loaded) */}
        {!previewData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Download Card */}
            <div className="p-5 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-gray-900 font-bold text-sm mb-1.5">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Step 1: Download Catalog by House Model</span>
                </div>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  Export all active models, modular pods, kitchenettes, roofs, finishes, and logistics. Each house model is separated into its own sheet for crystal-clear clarity.
                </p>

                <div className="space-y-1.5 mb-4 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-700 font-semibold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>Multi-Sheet Workbook Structure:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-600">
                    <span className="p-1.5 bg-white border border-gray-200 rounded-lg">📋 1. All Models Overview</span>
                    <span className="p-1.5 bg-white border border-gray-200 rounded-lg">🏡 2. 20FT Expandable</span>
                    <span className="p-1.5 bg-white border border-gray-200 rounded-lg">🏡 3. 30FT Expandable</span>
                    <span className="p-1.5 bg-white border border-gray-200 rounded-lg">🏡 4. 40FT Expandable</span>
                    <span className="p-1.5 bg-white border border-gray-200 rounded-lg">🍏 5. Apple Cabins</span>
                    <span className="p-1.5 bg-white border border-gray-200 rounded-lg">🚀 6. Space Capsules</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Download Excel (.XLSX)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="py-2.5 px-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Download single-sheet CSV"
                >
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Upload Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (!file) return;
                handleProcessFile(file);
              }}
              className={`p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col justify-between ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-100/50 scale-[1.01]'
                  : isProcessing
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-emerald-300 bg-emerald-50/20 hover:bg-emerald-50/40 hover:border-emerald-400'
              }`}
            >
              <div>
                <div className="flex items-center gap-2.5 text-emerald-950 font-bold text-sm mb-1.5">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Step 2: Upload Updated Spreadsheet</span>
                </div>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  Drop your modified Excel (.XLSX, .XLS) or CSV (.CSV) file here. The platform scans every sheet in the workbook and summarizes all model-specific changes.
                </p>

                <div className="p-3 bg-white/80 rounded-xl border border-emerald-100/80 mb-4 text-[11px] text-gray-600 space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Universal Multi-Sheet Parser:</span>
                  </div>
                  <p>
                    Edits made to any sheet (20ft, 30ft, 40ft, Apple Cabins, Space Capsules) will be applied directly to their respective models and options!
                  </p>
                </div>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pricing-spreadsheet-file-input"
                />

                <label
                  htmlFor="pricing-spreadsheet-file-input"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isProcessing ? 'Reading & Parsing Sheets...' : 'Select File to Upload (.XLSX / .CSV)'}</span>
                </label>
                <p className="text-[10px] text-center text-gray-400 mt-2">
                  Accepts multi-sheet Excel files (.xlsx) or comma-separated (.csv) files
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preview & Confirmation Screen */}
        {previewData && (
          <div className="space-y-4 animate-in fade-in">
            {/* Top Bar with summary and action buttons */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-gray-900 text-sm">
                    Spreadsheet Preview: <span className="font-mono text-emerald-700">{fileName}</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {previewData.validRows.length} Items Validated
                  </span>
                  {previewData.sheets && previewData.sheets.length > 1 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {previewData.sheets.length} Sheets Detected
                    </span>
                  )}
                  {changedRowsCount > 0 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {changedRowsCount} Price Changes Detected
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                      No Price Changes Detected
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Review the items below. Price changes are highlighted with old ➔ new values.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCancelPreview}
                  className="px-3.5 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleApplyChanges}
                  disabled={previewData.validRows.length === 0}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                    previewData.validRows.length > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Prices to Website</span>
                </button>
              </div>
            </div>

            {/* Workbook Sheets Navigator (when multiple sheets are present) */}
            {previewData.sheets && previewData.sheets.length > 1 && (
              <div className="p-3.5 bg-gradient-to-r from-emerald-50/70 via-teal-50/30 to-blue-50/30 rounded-2xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                      Workbook Sheets ({previewData.sheets.length} Model Sheets Detected)
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500">
                    Click a sheet to view only that house model's pricing
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedSheet('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedSheet === 'all'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    All Sheets ({previewData.validRows.length})
                  </button>

                  {previewData.sheets.map((s) => (
                    <button
                      key={s.sheetName}
                      type="button"
                      onClick={() => setSelectedSheet(s.sheetName)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        selectedSheet === s.sheetName
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <span>{s.sheetName}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          selectedSheet === s.sheetName
                            ? 'bg-emerald-900 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {s.rowCount}
                      </span>
                      {s.changedCount > 0 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-black">
                          {s.changedCount} new
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                    filterType === 'all'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Items ({previewData.validRows.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('changed')}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                    filterType === 'changed'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  Price Changes Only ({changedRowsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('20ft')}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                    filterType === '20ft'
                      ? 'bg-amber-700 text-white'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/80'
                  }`}
                >
                  20FT Unit
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('30ft')}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                    filterType === '30ft'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200/80'
                  }`}
                >
                  30FT Unit
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('40ft')}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                    filterType === '40ft'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200/80'
                  }`}
                >
                  40FT Unit
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('models')}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                    filterType === 'models'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Base Models
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('options')}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                    filterType === 'options'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Upgrades &amp; Options
                </button>
              </div>

              <div className="text-[11px] text-gray-400">
                Showing {filteredRows?.length || 0} of {previewData.validRows.length} items
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200 max-h-96">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                  <tr className="text-[10px] uppercase font-black tracking-wider text-gray-500">
                    <th className="py-2.5 px-3">Sheet Tab</th>
                    <th className="py-2.5 px-3">Item ID</th>
                    <th className="py-2.5 px-3">Unit Model</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3 text-right">Current Price</th>
                    <th className="py-2.5 px-3 text-right">New Price (USD)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredRows && filteredRows.length > 0 ? (
                    filteredRows.map((row, idx) => {
                      const isChanged = row.CurrentPriceUSD !== row.NewPriceUSD;
                      const diff = row.NewPriceUSD - row.CurrentPriceUSD;
                      const uId = (row.UnitModelId || '').toLowerCase();

                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-gray-50/70 transition-colors ${
                            isChanged ? 'bg-amber-50/30 font-semibold' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-semibold text-gray-700 whitespace-nowrap">
                            {row.SheetName ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 border border-gray-200/80">
                                📑 {row.SheetName}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-gray-600">
                            {row.ItemId}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {row.UnitModelName ? (
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  uId.includes('20ft')
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                    : uId.includes('30ft')
                                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                    : uId.includes('40ft')
                                    ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {row.UnitModelName}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400">All Units</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                row.ItemType === 'BASE_MODEL'
                                  ? 'bg-blue-100 text-blue-800'
                                  : row.ItemType === 'LOGISTICS'
                                  ? 'bg-purple-100 text-purple-800'
                                  : row.ItemType === 'DEPOSIT'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {row.ItemType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-500 text-[11px]">{row.Category}</td>
                          <td className="py-2.5 px-3 text-gray-900 font-bold">{row.ItemName}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-gray-500">
                            ${row.CurrentPriceUSD.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-950">
                            <span
                              className={
                                isChanged
                                  ? diff > 0
                                    ? 'text-orange-700 font-black'
                                    : 'text-emerald-700 font-black'
                                  : 'text-gray-900'
                              }
                            >
                              ${row.NewPriceUSD.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {isChanged ? (
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                  diff > 0
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {diff > 0 ? `+$${diff.toLocaleString()}` : `-$${Math.abs(diff).toLocaleString()}`}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-gray-400">Unchanged</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-gray-400">
                        No rows found matching the selected sheet or filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom confirmation action */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleCancelPreview}
                className="text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer"
              >
                ← Discard and choose another file
              </button>

              <button
                type="button"
                onClick={handleApplyChanges}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm &amp; Apply {changedRowsCount} Updated Price(s) Across All Sheets</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
