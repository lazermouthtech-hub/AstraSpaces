import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Download,
  Check,
  TrendingUp,
  TrendingDown,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAppConfig } from '../../context/AppConfigContext';
import {
  parseAndValidatePricingFile,
  applySpreadsheetPricesToConfig,
  downloadMultiSheetPricingWorkbook,
  downloadPricingSpreadsheet,
  SpreadsheetValidationResult,
  SpreadsheetPricingRow,
} from '../../utils/pricingSpreadsheet';
import { formatCurrency } from '../../utils/currency';

interface SpreadsheetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPricesApplied?: (appliedCount: number, updatedConfig?: any) => void;
}

export const SpreadsheetUploadModal: React.FC<SpreadsheetUploadModalProps> = ({
  isOpen,
  onClose,
  onPricesApplied,
}) => {
  const { config, updateConfig } = useAppConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<SpreadsheetValidationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterChangedOnly, setFilterChangedOnly] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<string>('all');

  if (!isOpen) return null;

  const handleReset = () => {
    setFileName(null);
    setFileSize(null);
    setValidationResult(null);
    setErrorMessage(null);
    setIsProcessing(false);
    setSelectedSheet('all');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setIsProcessing(true);
    setSelectedSheet('all');

    try {
      // Read as ArrayBuffer so both binary Excel (.xlsx, .xls) and CSV (.csv) parse properly!
      const buffer = await file.arrayBuffer();
      const validation = parseAndValidatePricingFile(buffer, config);
      setValidationResult(validation);

      if (validation.errors.length > 0) {
        setErrorMessage(
          `Found ${validation.errors.length} formatting issue(s) in spreadsheet. Please review.`
        );
      }
    } catch (err: any) {
      setErrorMessage(`Unable to parse spreadsheet file: ${err.message || 'Invalid format'}`);
      setValidationResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyChanges = () => {
    if (!validationResult || validationResult.validRows.length === 0) return;

    try {
      const { updatedConfig, appliedCount } = applySpreadsheetPricesToConfig(
        config,
        validationResult.validRows
      );

      // Save to global config and persistent storage
      updateConfig(updatedConfig);

      if (onPricesApplied) {
        onPricesApplied(appliedCount, updatedConfig);
      }

      handleClose();
    } catch (err: any) {
      setErrorMessage(`Failed to apply updated prices: ${err.message}`);
    }
  };

  // Filter rows by sheet and changed-only toggle
  const sheetFilteredRows = validationResult?.validRows.filter((r) => {
    if (selectedSheet === 'all') return true;
    return r.SheetName === selectedSheet;
  }) || [];

  const displayedRows = filterChangedOnly
    ? sheetFilteredRows.filter((r) => r.CurrentPriceUSD !== r.NewPriceUSD)
    : sheetFilteredRows;

  const totalChangedCount =
    validationResult?.validRows.filter((r) => r.CurrentPriceUSD !== r.NewPriceUSD).length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/60 via-amber-50/20 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                  Upload Updated Pricing Spreadsheet
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Excel .XLSX &amp; CSV
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Import updated prices to automatically synchronize the 3D Configurator, cost breakdowns, and customer orders.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* If no file or error, show upload dropzone */}
          {!validationResult ? (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
                    : isProcessing
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-gray-300 hover:border-emerald-400 bg-gray-50/50 hover:bg-emerald-50/20'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  onChange={handleFileChange}
                  className="hidden"
                  id="modal-pricing-file-input"
                />

                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-xs">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>

                <h4 className="font-bold text-gray-900 text-base mb-1">
                  {isDragging
                    ? 'Drop your spreadsheet here'
                    : 'Select or Drop your Updated Spreadsheet (.XLSX or .CSV)'}
                </h4>
                <p className="text-xs text-gray-500 max-w-lg mx-auto mb-5 leading-relaxed">
                  Upload your edited Excel workbook with separate sheets for each house model, or a standard CSV file. The system compares the new rates against live platform prices.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <label
                    htmlFor="modal-pricing-file-input"
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isProcessing ? 'Processing File...' : 'Browse & Select File (.XLSX / .CSV)'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => downloadMultiSheetPricingWorkbook(config)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Download Excel Template (.XLSX)</span>
                  </button>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-200/60 flex items-center justify-center gap-4 text-[11px] text-gray-400">
                  <span>✓ Multi-Sheet Excel (.XLSX)</span>
                  <span>✓ Standard CSV supported</span>
                  <span>✓ Instant live preview</span>
                </div>
              </div>

              {/* Quick instructions */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-950">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-emerald-950">Multi-Sheet Workflow:</h5>
                    <ol className="list-decimal list-inside space-y-1 text-emerald-800 text-[11px] mt-1 leading-relaxed">
                      <li>Download the Excel workbook (.XLSX) with separate sheets for each model (20ft, 30ft, 40ft, Apple Cabins, Space Capsules).</li>
                      <li>Edit the values in the <strong>NewPriceUSD</strong> column on any sheet in Excel or Google Sheets.</li>
                      <li>Upload the workbook back here. All sheets are analyzed simultaneously and updated live!</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* File Loaded - Preview Screen */
            <div className="space-y-4">
              {/* File Info Banner */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-gray-900 text-xs sm:text-sm font-mono">
                        {fileName}
                      </span>
                      {fileSize && (
                        <span className="text-[10px] text-gray-400 font-mono">({fileSize})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                      <span>{validationResult.validRows.length} items verified</span>
                      {validationResult.sheets && validationResult.sheets.length > 1 && (
                        <span>• {validationResult.sheets.length} model sheets detected</span>
                      )}
                      <span>•</span>
                      {totalChangedCount > 0 ? (
                        <span className="text-amber-700 font-bold font-mono">
                          {totalChangedCount} price changes detected
                        </span>
                      ) : (
                        <span className="text-gray-500">No price changes detected</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800 underline self-start sm:self-auto cursor-pointer"
                >
                  Change file
                </button>
              </div>

              {/* Sheet Navigator Tabs (if workbook has multiple sheets) */}
              {validationResult.sheets && validationResult.sheets.length > 1 && (
                <div className="p-3 bg-gradient-to-r from-emerald-50/70 via-teal-50/30 to-blue-50/30 rounded-2xl border border-emerald-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Workbook Sheets ({validationResult.sheets.length} Sheets):</span>
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Click a sheet tab to filter by house model
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                    <button
                      type="button"
                      onClick={() => setSelectedSheet('all')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        selectedSheet === 'all'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      All Sheets ({validationResult.validRows.length})
                    </button>

                    {validationResult.sheets.map((s) => (
                      <button
                        key={s.sheetName}
                        type="button"
                        onClick={() => setSelectedSheet(s.sheetName)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
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

              {/* Filter controls */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterChangedOnly(false)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      !filterChangedOnly
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Items ({sheetFilteredRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterChangedOnly(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      filterChangedOnly
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <span>Price Changes Only</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px]">
                      {sheetFilteredRows.filter((r) => r.CurrentPriceUSD !== r.NewPriceUSD).length}
                    </span>
                  </button>
                </div>

                <span className="text-[11px] text-gray-400">
                  Showing {displayedRows.length} items
                </span>
              </div>

              {/* Comparison Table */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 text-gray-500 font-black uppercase text-[10px] tracking-wider z-10">
                    <tr>
                      <th className="py-2.5 px-3">Sheet Tab</th>
                      <th className="py-2.5 px-3">Item ID</th>
                      <th className="py-2.5 px-3">Unit Model</th>
                      <th className="py-2.5 px-3">Item Name</th>
                      <th className="py-2.5 px-3 text-right">Current Price</th>
                      <th className="py-2.5 px-3 text-right">New Price</th>
                      <th className="py-2.5 px-3 text-center">Difference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayedRows.length > 0 ? (
                      displayedRows.map((row, idx) => {
                        const isChanged = row.CurrentPriceUSD !== row.NewPriceUSD;
                        const diff = row.NewPriceUSD - row.CurrentPriceUSD;
                        const uId = (row.UnitModelId || '').toLowerCase();

                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-gray-50/60 transition-colors ${
                              isChanged ? 'bg-amber-50/30' : ''
                            }`}
                          >
                            <td className="py-2 px-3 whitespace-nowrap">
                              {row.SheetName ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 border border-gray-200">
                                  📑 {row.SheetName}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[10px]">—</span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-gray-600">
                              {row.ItemId}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
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
                                <span className="text-gray-400 text-[10px]">All Units</span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-semibold text-gray-900">
                              {row.ItemName}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-gray-500">
                              ${row.CurrentPriceUSD.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-gray-950">
                              ${row.NewPriceUSD.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-center whitespace-nowrap">
                              {isChanged ? (
                                <span
                                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    diff > 0
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {diff > 0
                                    ? `+$${diff.toLocaleString()}`
                                    : `-$${Math.abs(diff).toLocaleString()}`}
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400">Unchanged</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-gray-400">
                          {filterChangedOnly
                            ? 'No price changes detected in this sheet. Toggle "All Items" to inspect all verified rates.'
                            : 'No rows found in this sheet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Error notice if any */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-900">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error: </span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-[#FAFAFC] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {validationResult && (
            <button
              type="button"
              onClick={handleApplyChanges}
              disabled={validationResult.validRows.length === 0}
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                validationResult.validRows.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Confirm &amp; Apply {totalChangedCount} Updated Price(s) Across All Sheets</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
