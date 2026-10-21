import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomeModelId } from '../types';
import { BASE_MODELS } from '../data/models';
import { FileText, RotateCcw, Share2, DollarSign, Globe, LayoutDashboard, Home, ChevronDown, User, LogIn, Clock } from 'lucide-react';
import { useAppConfig } from '../context/AppConfigContext';
import {
  formatCurrency,
  normalizeCurrency,
  TWO_CURRENCIES,
  getExchangeRate,
  getCurrencySymbol,
} from '../utils/currency';
import { syncOrdersCurrency } from '../utils/orderManager';
import { UserAccount } from '../utils/authManager';

interface HeaderProps {
  selectedModelId: HomeModelId;
  onSelectModel: (id: HomeModelId) => void;
  onOpenSpecSheet: () => void;
  onReset: () => void;
  totalPrice: number;
  onOpenReserve?: () => void;
  showInvestmentBreakdown?: boolean;
  onToggleInvestmentBreakdown?: () => void;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
  timerSecondsRemaining?: number;
}

export const Header: React.FC<HeaderProps> = ({
  selectedModelId,
  onSelectModel,
  onOpenSpecSheet,
  onReset,
  totalPrice,
  onOpenReserve,
  showInvestmentBreakdown,
  onToggleInvestmentBreakdown,
  currentUser,
  onOpenAuthModal,
  timerSecondsRemaining,
}) => {
  const { config, updateConfig, setCurrency } = useAppConfig();
  const navigate = useNavigate();
  
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
        <img
          src="https://res.cloudinary.com/ddaxljfgp/image/upload/v1791201844/10apples_logo_main_eqm9wf.png"
          alt="10Apples Logo"
          className="h-7 sm:h-8 w-auto object-contain"
        />
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
              {model.name} — {model.sqft} sq ft ({formatCurrency(model.basePrice, config.currency, { ratesMap: config.exchangeRates })})
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

        {/* Currency Switcher */}
        <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
          <div className="inline-flex p-0.5 bg-gray-100 rounded-lg border border-gray-200">
            {(() => {
              const activeCode = normalizeCurrency(config.currency);
              const items = [
                { code: 'USD', symbol: '$' },
                ...(activeCode !== 'USD'
                  ? [{ code: activeCode, symbol: getCurrencySymbol(activeCode) }]
                  : [{ code: 'GHS', symbol: 'GH₵' }]),
              ];
              const uniqueItems = Array.from(new Map(items.map((i) => [i.code, i])).values());

              return uniqueItems.map((curr) => {
                const isActive = activeCode === curr.code;
                const rate =
                  curr.code === 'USD'
                    ? 1.0
                    : getExchangeRate(curr.code, config.exchangeRates);

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
                        ? curr.code === 'USD'
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-orange-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title={
                      curr.code === 'USD'
                        ? 'Master Default: USD ($) · Baseline Rate: 1.0000'
                        : `Switch to ${curr.code} (${curr.symbol}) · Prevailing Rate: 1 USD = ${rate} ${curr.code}`
                    }
                  >
                    <span className="font-mono">{curr.symbol}</span>
                    <span>{curr.code}</span>
                  </button>
                );
              });
            })()}
          </div>
        </div>

        {/* Live Total Price & Breakdown Toggle */}
        {onToggleInvestmentBreakdown ? (
          <button
            type="button"
            onClick={onToggleInvestmentBreakdown}
            className="pl-2.5 pr-2 py-1 border-l border-gray-200 hidden sm:flex flex-col text-left hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
            title={showInvestmentBreakdown ? 'Hide Investment Breakdown' : 'Show Investment Breakdown'}
          >
            <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-gray-400 group-hover:text-orange-600 transition-colors tracking-wider">
              <span>Total Price</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 group-hover:bg-orange-100 group-hover:text-orange-700 font-extrabold">
                {showInvestmentBreakdown ? 'Hide Breakdown' : 'Show Breakdown'}
              </span>
            </div>
            <div className="text-base font-extrabold text-gray-900 font-mono leading-none mt-0.5">
              {formatCurrency(totalPrice, config.currency, { ratesMap: config.exchangeRates })}
            </div>
          </button>
        ) : (
          <div className="pl-2 border-l border-gray-200 hidden sm:block">
            <div className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
              Total Price
            </div>
            <div className="text-base font-extrabold text-gray-900 font-mono leading-none">
              {formatCurrency(totalPrice, config.currency, { ratesMap: config.exchangeRates })}
            </div>
          </div>
        )}

        {/* User Account / Dashboard Navigation Button (button:nth-of-type(5)) */}
        {currentUser ? (
          <button
            type="button"
            onClick={() => navigate('/user-dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-200 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
            title={`Signed in as ${currentUser.fullName} (${currentUser.email}). Click to open User Dashboard.`}
          >
            <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs">
              {currentUser.fullName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline font-bold">Dashboard</span>
            <span className="text-[10px] bg-orange-200/90 text-orange-900 px-1.5 py-0.2 rounded font-mono font-bold">
              {currentUser.savedProjects?.length || 0}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/user-dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold transition-all cursor-pointer shadow-2xs group hover:border-orange-300 hover:text-orange-950 active:scale-95"
            title="Open User Dashboard to manage your modular projects & activities"
          >
            <User className="w-3.5 h-3.5 text-gray-500 group-hover:text-orange-600 transition-colors" />
            <span className="hidden sm:inline font-bold">Dashboard</span>
            {timerSecondsRemaining !== undefined && timerSecondsRemaining > 0 && timerSecondsRemaining <= 240 && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-mono text-orange-600 font-extrabold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/80"
                title="Auto-save timer active (prompts at 4 minutes). Click to save to dashboard."
              >
                <Clock className="w-2.5 h-2.5 animate-pulse text-orange-500" />
                <span>{Math.floor(timerSecondsRemaining / 60)}:{(timerSecondsRemaining % 60).toString().padStart(2, '0')}</span>
              </span>
            )}
          </button>
        )}

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


