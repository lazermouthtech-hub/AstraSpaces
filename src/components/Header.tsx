import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HomeModelId } from '../types';
import { BASE_MODELS } from '../data/models';
import { FileText, RotateCcw, Share2, DollarSign, Globe, LayoutDashboard, Home, ChevronDown } from 'lucide-react';
import { useAppConfig } from '../context/AppConfigContext';
import { formatCurrency, normalizeCurrency, TWO_CURRENCIES } from '../utils/currency';
import { syncOrdersCurrency } from '../utils/orderManager';

interface HeaderProps {
  selectedModelId: HomeModelId;
  onSelectModel: (id: HomeModelId) => void;
  onOpenSpecSheet: () => void;
  onReset: () => void;
  totalPrice: number;
  onOpenReserve?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedModelId,
  onSelectModel,
  onOpenSpecSheet,
  onReset,
  totalPrice,
  onOpenReserve,
}) => {
  const { config, updateConfig, setCurrency } = useAppConfig();
  
  const displayModels = useMemo(() => {
    const list = config.models && config.models.length > 0 ? config.models : BASE_MODELS;
    return list.filter((m: any) => m.isAvailable !== false && m.isActive !== false);
  }, [config.models]);

  const currentModel =
    displayModels.find((m: any) => m.id === selectedModelId) ||
    config.models?.find((m: any) => m.id === selectedModelId) ||
    BASE_MODELS.find((m) => m.id === selectedModelId) ||
    displayModels[0] ||
    BASE_MODELS[0];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Configuration link copied to clipboard!');
    }
  };

  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-30 shadow-xs">
      {/* Brand Logo & Name */}
      <Link to="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity" title="Return to Homepage">
        <div className="w-8 h-8 flex items-center justify-center font-black text-white rounded-md shadow-xs text-base tracking-tighter" style={{ backgroundColor: config.branding.primaryColor }}>
          {config.branding.brandName ? config.branding.brandName.charAt(0).toUpperCase() : 'B'}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg sm:text-xl font-bold tracking-tighter text-gray-900">
            {config.branding.brandName || 'Boxabl'}
          </span>
          <span className="text-xs font-semibold text-gray-400 hidden sm:inline-block ml-1">
            {config.branding.headerText}
          </span>
        </div>
      </Link>

      {/* Center Model Selector (Desktop & Mobile) - CSS selector 1 */}
      <div className="flex items-center min-w-0 overflow-hidden gap-1.5 sm:gap-2.5 bg-white/95 hover:bg-orange-50/50 border border-gray-200 hover:border-orange-400/90 px-2 sm:px-3 py-1.5 rounded-xl shadow-xs ring-1 ring-black/5 transition-all max-w-[210px] sm:max-w-[340px] md:max-w-[400px]">
        <span className="flex h-2 w-2 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-200 px-1.5 py-0.5 rounded shrink-0 font-mono shadow-2xs whitespace-nowrap">
          {selectedModelId.includes('30ft')
            ? '30FT'
            : selectedModelId.includes('20ft')
            ? '20FT'
            : selectedModelId.includes('40ft')
            ? '40FT'
            : currentModel?.series
            ? currentModel.series.toUpperCase().slice(0, 6)
            : 'HOUSE'}
        </span>
        <select
          value={selectedModelId}
          onChange={(e) => onSelectModel(e.target.value as HomeModelId)}
          className="appearance-none bg-transparent text-xs font-black text-gray-950 border-none outline-none cursor-pointer pr-1 flex-1 min-w-0 truncate focus:ring-0 overflow-hidden"
        >
          {displayModels.map((model: any) => (
            <option key={model.id} value={model.id}>
              {model.name} — {model.sqft} sq ft ({formatCurrency(model.basePrice, config.currency)})
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 pointer-events-none" />
      </div>

      {/* Right Navigation Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Back to Home Link */}
        <Link
          to="/"
          className="hidden md:flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider"
          title="Return to Homepage"
        >
          <Home className="w-3.5 h-3.5 text-gray-400" />
          <span>Home</span>
        </Link>

        <button
          onClick={onOpenSpecSheet}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider cursor-pointer"
          title="View technical specification"
        >
          <FileText className="w-3.5 h-3.5 text-gray-400" />
          <span>Specs</span>
        </button>

        <button
          onClick={handleShare}
          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition-colors cursor-pointer"
          title="Share Configuration"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          onClick={onReset}
          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition-colors cursor-pointer"
          title="Reset to Defaults"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Two-Currency Switcher */}
        <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
          <div className="inline-flex p-0.5 bg-gray-100 rounded-lg border border-gray-200">
            {TWO_CURRENCIES.map((curr) => {
              const isActive = normalizeCurrency(config.currency) === curr.code;
              return (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => {
                    if (setCurrency) {
                      setCurrency(curr.code);
                    } else {
                      updateConfig({ ...config, currency: curr.code });
                    }
                    syncOrdersCurrency(curr.code);
                  }}
                  className={`px-2 py-1 text-[11px] font-extrabold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                    isActive
                      ? curr.code === 'GHS'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-black text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={`Switch entire website and all orders to single currency: ${curr.name} (${curr.symbol})`}
                >
                  <span className="font-mono">{curr.symbol}</span>
                  <span>{curr.code}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Total Price */}
        <div className="pl-2 border-l border-gray-200 hidden sm:block">
          <div className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
            Total Price
          </div>
          <div className="text-base font-extrabold text-gray-900 font-mono leading-none">
            {formatCurrency(totalPrice, config.currency)}
          </div>
        </div>

        {/* Admin Dashboard Navigation */}
        <Link
          to="/dashboard"
          className="p-2 text-gray-500 hover:text-gray-950 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1.5 text-xs font-bold"
          title="Admin Orders & Queue"
        >
          <LayoutDashboard className="w-4 h-4 text-orange-600" />
          <span className="hidden lg:inline text-[11px] text-gray-600">Admin</span>
        </Link>

        {/* Finalize Build Button */}
        {onOpenReserve && (
          <button
            onClick={onOpenReserve}
            style={{ backgroundColor: config.branding.primaryColor }}
            className="hover:opacity-90 text-white px-4 sm:px-5 py-2 rounded-full text-xs font-bold tracking-widest transition-all shadow-sm cursor-pointer whitespace-nowrap uppercase"
          >
            {config.branding.ctaText}
          </button>
        )}
      </div>
    </nav>
  );
};


