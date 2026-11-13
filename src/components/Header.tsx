import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomeModelId } from '../types';
import { BASE_MODELS } from '../data/models';
import { RotateCcw, DollarSign, Globe, LayoutDashboard, Home, ChevronDown, User, LogIn, Clock, Check, X, Box, Sparkles } from 'lucide-react';
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
  onOpenSpecSheet?: () => void;
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

  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModelDropdownOpen(false);
    };
    if (isModelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModelDropdownOpen]);

  return (
    <nav className="h-16 landscape:h-11 sm:landscape:h-11 bg-white border-b border-gray-200 flex items-center justify-between px-2.5 sm:px-4 md:px-5 lg:px-8 landscape:px-2.5 shrink-0 z-30 shadow-xs relative">
      {/* Brand Logo & Name */}
      <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity shrink-0" title="Return to Homepage">
        <img
          src="https://res.cloudinary.com/ddaxljfgp/image/upload/v1791201844/10apples_logo_main_eqm9wf.png"
          alt="10Apples Logo"
          className="h-6 sm:h-7 md:h-8 landscape:h-5 w-auto object-contain shrink-0"
        />
      </Link>

      {/* Center Model Selector (Desktop, Tablet & Mobile) - CSS selector 1 */}
      <div
        ref={modelDropdownRef}
        className="relative min-w-0 mx-1 sm:mx-1.5 md:mx-2"
      >
        {/* Accessible Model Trigger Button */}
        <button
          type="button"
          onClick={() => setIsModelDropdownOpen((prev) => !prev)}
          className={`flex items-center min-w-0 overflow-hidden gap-1.5 sm:gap-2 bg-white hover:bg-orange-50/50 border ${
            isModelDropdownOpen
              ? 'border-orange-500 ring-2 ring-orange-500/30 bg-orange-50/40 shadow-xs'
              : 'border-gray-200/90 hover:border-orange-400 shadow-2xs'
          } px-2 sm:px-2.5 md:px-3 py-1.5 rounded-xl cursor-pointer ring-1 ring-black/5 transition-all text-left max-w-[125px] xs:max-w-[160px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-[320px] xl:max-w-[420px] select-none group active:scale-[0.98] shrink-0`}
          aria-expanded={isModelDropdownOpen}
          aria-haspopup="dialog"
          title="Switch House Model & Size (10FT, 20FT, 30FT, 40FT)"
        >
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>

          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-200 px-1.5 py-0.5 rounded shrink-0 font-mono shadow-2xs whitespace-nowrap group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-colors">
            {selectedModelId.includes('30ft')
              ? '30FT'
              : selectedModelId.includes('20ft')
              ? '20FT'
              : selectedModelId.includes('40ft')
              ? '40FT'
              : selectedModelId.includes('10ft')
              ? '10FT'
              : currentModel?.series
              ? currentModel.series.toUpperCase().slice(0, 6)
              : 'HOUSE'}
          </span>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <span className="text-xs font-black text-gray-950 truncate block leading-tight">
              {currentModel.name}
            </span>
            <span className="text-[10px] text-gray-500 font-mono truncate hidden lg:block">
              {currentModel.sqft} sq ft · {currentModel.bedrooms || 2} Bed · {formatCurrency(currentModel.basePrice, config.currency, { ratesMap: config.exchangeRates })}
            </span>
          </div>

          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
              isModelDropdownOpen ? 'rotate-180 text-orange-600' : 'text-gray-400 group-hover:text-gray-700'
            }`}
          />
        </button>

        {/* Dropdown Menu - Quick Access to All Models & Sizes */}
        {isModelDropdownOpen && (
          <>
            {/* Backdrop for click outside dismiss */}
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs sm:bg-black/10"
              onClick={() => setIsModelDropdownOpen(false)}
            />

            <div className="fixed inset-x-2.5 top-17 sm:absolute sm:inset-auto sm:top-full sm:mt-2 sm:left-0 sm:translate-x-0 w-auto sm:w-[420px] max-w-md bg-white rounded-2xl border border-gray-200/90 shadow-2xl p-3 sm:p-3.5 z-50 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[calc(100dvh-160px)] sm:max-h-[500px] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-gray-900">
                    House Models & Sizes
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 1-Tap Quick Size Switcher */}
              <div className="space-y-1 mb-2.5 shrink-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block">
                  Quick 1-Tap Size Switcher:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'expandable-10ft', size: '10FT', sqft: '195 sqft' },
                    { id: 'expandable-20ft', size: '20FT', sqft: '409 sqft' },
                    { id: 'expandable-30ft', size: '30FT', sqft: '624 sqft' },
                    { id: 'expandable-40ft', size: '40FT', sqft: '807 sqft' },
                  ].map((sz) => {
                    const isSelected = selectedModelId === sz.id;
                    return (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => {
                          onSelectModel(sz.id as HomeModelId);
                          setIsModelDropdownOpen(false);
                        }}
                        className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs font-black scale-[1.02]'
                            : 'bg-gray-50 hover:bg-orange-50 hover:border-orange-200 text-gray-800 border-gray-200'
                        }`}
                        title={`Switch to ${sz.size} Expandable House (${sz.sqft})`}
                      >
                        <div className="text-xs font-black leading-none">{sz.size}</div>
                        <div className={`text-[9px] font-mono mt-0.5 leading-none ${isSelected ? 'text-orange-100' : 'text-gray-500'}`}>
                          {sz.sqft}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* All Catalog Models Detailed List */}
              <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block">
                  All Catalog Models ({displayModels.length}):
                </span>
                {displayModels.map((model: any) => {
                  const isSelected = selectedModelId === model.id;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        onSelectModel(model.id as HomeModelId);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 border ${
                        isSelected
                          ? 'bg-orange-50/80 border-orange-400 ring-1 ring-orange-500/30 shadow-2xs'
                          : 'bg-white hover:bg-gray-50 border-gray-200/80'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-gray-950 truncate">
                            {model.name}
                          </span>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold bg-gray-100 text-gray-700">
                            {model.series || 'PREFAB'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-500 font-medium">
                          <span>{model.sqft} sq ft</span>
                          <span>·</span>
                          <span>{model.bedrooms} Bed · {model.bathrooms} Bath</span>
                          {model.dimensions?.lengthFt && (
                            <>
                              <span>·</span>
                              <span className="font-mono">{model.dimensions.lengthFt}ft × {model.dimensions.widthFt}ft</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-gray-950">
                          {formatCurrency(model.basePrice, config.currency, { ratesMap: config.exchangeRates })}
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 justify-end text-[10px] font-extrabold text-orange-600 mt-0.5">
                            <Check className="w-3 h-3" />
                            <span>SELECTED</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Currency / Denomination Switcher inside the Menu (Mobile & Desktop) */}
              <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between gap-2 bg-gray-50/90 p-2 rounded-xl shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Globe className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 truncate">
                    Denomination:
                  </span>
                </div>
                <div className="inline-flex p-0.5 bg-white rounded-lg border border-gray-200 shrink-0 shadow-2xs">
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
                          className={`px-2 py-1 text-[11px] font-black rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                            isActive
                              ? curr.code === 'USD'
                                ? 'bg-black text-white shadow-xs'
                                : 'bg-orange-600 text-white shadow-xs'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <span className="font-mono">{curr.symbol}</span>
                          <span>{curr.code}</span>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Navigation Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 shrink-0">
        {/* Back to Home Link - Desktop Only */}
        <Link
          to="/"
          className="hidden xl:flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider"
          title="Return to Homepage"
        >
          <Home className="w-3.5 h-3.5 text-gray-400" />
          <span>Home</span>
        </Link>

        {/* Reset Button - Large Desktop Only */}
        <button
          onClick={onReset}
          className="hidden xl:flex p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition-colors cursor-pointer"
          title="Reset to Defaults"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Currency Switcher / Denomination Changer */}
        <div className="flex items-center shrink-0 border-l border-gray-200/90 pl-1 sm:pl-1.5 md:pl-2">
          {/* Mobile & Tablet View: Compact Dropdown Pill */}
          <div className="relative lg:hidden inline-flex items-center">
            {(() => {
              const activeCode = normalizeCurrency(config.currency);
              const items = [
                { code: 'USD', symbol: '$' },
                ...(activeCode !== 'USD'
                  ? [{ code: activeCode, symbol: getCurrencySymbol(activeCode) }]
                  : [{ code: 'GHS', symbol: 'GH₵' }]),
              ];
              const uniqueItems = Array.from(new Map(items.map((i) => [i.code, i])).values());
              const currentActive = uniqueItems.find((i) => i.code === activeCode) || uniqueItems[0];

              return (
                <div className="relative inline-flex items-center">
                  <div className={`px-1.5 sm:px-2 py-1 text-[10px] sm:text-[11px] font-black rounded-lg transition-all flex items-center gap-1 shadow-2xs border ${
                    activeCode === 'USD'
                      ? 'bg-black text-white border-black'
                      : 'bg-orange-600 text-white border-orange-600'
                  }`}>
                    <span className="font-mono text-[9px] sm:text-[10px]">{currentActive.symbol}</span>
                    <span>{currentActive.code}</span>
                    <ChevronDown className="w-3 h-3 ml-0.5 opacity-90 shrink-0" />
                  </div>
                  <select
                    value={activeCode}
                    onChange={(e) => {
                      const newCurr = e.target.value;
                      if (setCurrency) {
                        setCurrency(newCurr);
                      } else {
                        updateConfig({ ...config, currency: newCurr });
                      }
                      syncOrdersCurrency(newCurr);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    aria-label="Change currency denomination"
                  >
                    {uniqueItems.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })()}
          </div>

          {/* Large Desktop View: Full Segmented Controls */}
          <div className="hidden lg:inline-flex p-0.5 bg-gray-100 rounded-lg border border-gray-200 shadow-2xs shrink-0">
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
                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-black rounded-md transition-all flex items-center gap-0.5 sm:gap-1 cursor-pointer shrink-0 ${
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
                    <span className="font-mono text-[9px] sm:text-[10px]">{curr.symbol}</span>
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
            className="pl-2 sm:pl-2.5 pr-1.5 sm:pr-2 py-0.5 sm:py-1 border-l border-gray-200 hidden sm:flex flex-col text-left hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group shrink-0"
            title={showInvestmentBreakdown ? 'Hide Investment Breakdown' : 'Show Investment Breakdown'}
          >
            <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] uppercase font-bold text-gray-400 group-hover:text-orange-600 transition-colors tracking-wider whitespace-nowrap">
              <span>Total Price</span>
              <span className="text-[8px] px-1.5 py-0.2 rounded bg-gray-100 group-hover:bg-orange-100 group-hover:text-orange-700 font-extrabold hidden lg:inline-block">
                {showInvestmentBreakdown ? 'Hide Breakdown' : 'Show Breakdown'}
              </span>
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-gray-900 font-mono leading-none mt-0.5 whitespace-nowrap">
              {formatCurrency(totalPrice, config.currency, { ratesMap: config.exchangeRates })}
            </div>
          </button>
        ) : (
          <div className="pl-2 sm:pl-2.5 border-l border-gray-200 hidden sm:block shrink-0">
            <div className="text-[8px] sm:text-[9px] uppercase font-bold text-gray-400 tracking-wider whitespace-nowrap">
              Total Price
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-gray-900 font-mono leading-none whitespace-nowrap">
              {formatCurrency(totalPrice, config.currency, { ratesMap: config.exchangeRates })}
            </div>
          </div>
        )}

        {/* User Account / Dashboard Navigation Button */}
        {currentUser ? (
          <button
            type="button"
            onClick={() => navigate('/user-dashboard')}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 md:px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-200 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 shrink-0 whitespace-nowrap"
            title={`Signed in as ${currentUser.fullName} (${currentUser.email}). Click to open User Dashboard.`}
          >
            <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs">
              {currentUser.fullName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline font-bold">Dashboard</span>
            <span className="text-[10px] bg-orange-200/90 text-orange-900 px-1.5 py-0.2 rounded font-mono font-bold">
              {currentUser.savedProjects?.length || 0}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/user-dashboard')}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 md:px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold transition-all cursor-pointer shadow-2xs group hover:border-orange-300 hover:text-orange-950 active:scale-95 shrink-0 whitespace-nowrap"
            title="Open User Dashboard to manage your modular projects & activities"
          >
            <User className="w-3.5 h-3.5 text-gray-500 group-hover:text-orange-600 transition-colors" />
            <span className="hidden md:inline font-bold">Dashboard</span>
            {timerSecondsRemaining !== undefined && timerSecondsRemaining > 0 && timerSecondsRemaining <= 240 && (
              <span
                className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono text-orange-600 font-extrabold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/80"
                title="Auto-save timer active (prompts at 4 minutes). Click to save to dashboard."
              >
                <Clock className="w-2.5 h-2.5 animate-pulse text-orange-500" />
                <span>{Math.floor(timerSecondsRemaining / 60)}:{(timerSecondsRemaining % 60).toString().padStart(2, '0')}</span>
              </span>
            )}
          </button>
        )}

        {/* Admin Dashboard Navigation - Desktop Only */}
        <Link
          to="/dashboard"
          className="hidden xl:flex p-2 text-gray-500 hover:text-gray-950 hover:bg-gray-100 rounded-full transition-colors items-center gap-1.5 text-xs font-bold shrink-0"
          title="Admin Orders & Queue"
        >
          <LayoutDashboard className="w-4 h-4 text-orange-600" />
          <span className="text-[11px] text-gray-600">Admin</span>
        </Link>

        {/* Finalize Build CTA Button */}
        {onOpenReserve && (
          <button
            onClick={onOpenReserve}
            style={{ backgroundColor: config.branding.primaryColor }}
            className="hover:opacity-90 text-white px-3 sm:px-3.5 md:px-4 lg:px-5 py-2 rounded-full text-[11px] sm:text-xs font-bold tracking-wider transition-all shadow-sm cursor-pointer whitespace-nowrap uppercase shrink-0"
          >
            {config.branding.ctaText}
          </button>
        )}
      </div>
    </nav>
  );
};


