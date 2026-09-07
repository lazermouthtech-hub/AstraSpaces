import React from 'react';
import { HomeModelId } from '../types';
import { FileText, RotateCcw, Share2 } from 'lucide-react';
import { useAppConfig } from '../context/AppConfigContext';

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
  const { config } = useAppConfig();
  const currentModel = config.models.find((m: any) => m.id === selectedModelId) || config.models[0];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Configuration link copied to clipboard!');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: config.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-30 shadow-xs">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2.5">
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
      </div>

      {/* Center Model Selector Pills (Desktop) */}
      <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
        {config.models.map((model: any) => {
          const isSelected = model.id === selectedModelId;
          return (
            <button
              key={model.id}
              onClick={() => onSelectModel(model.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>{model.name.replace('Casita ', '')}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isSelected ? 'font-bold' : 'text-gray-400'
                }`}
                style={isSelected ? { backgroundColor: `${config.branding.primaryColor}20`, color: config.branding.primaryColor } : {}}
              >
                {model.sqft} sq ft
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Navigation Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
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

        {/* Live Total Price */}
        <div className="pl-3 border-l border-gray-200 hidden sm:block">
          <div className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
            Total Price
          </div>
          <div className="text-base font-extrabold text-gray-900 font-mono leading-none">
            {formatCurrency(totalPrice)}
          </div>
        </div>

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


