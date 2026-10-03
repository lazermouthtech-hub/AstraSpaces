import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BASE_MODELS } from '../data/models';
import {
  WALL_CLADDING_OPTIONS, INTERIOR_WALL_OPTIONS, GLAZING_OPTIONS, LIGHTING_OPTIONS, ELECTRICAL_OPTIONS,
  FLOORING_OPTIONS, ROOF_OPTIONS, CABINETRY_OPTIONS, MODULAR_ADDONS
} from '../data/options';
import { normalizeCurrency } from '../utils/currency';
import { syncOrdersCurrency } from '../utils/orderManager';

export const AppConfigContext = createContext<any>(null);

export const getActivePublicModelId = (models: any[], preferredId?: string): string => {
  const publicList = (models || []).filter((m: any) => m.isAvailable !== false && m.isActive !== false);
  if (preferredId) {
    const matched = publicList.find((m: any) => m.id === preferredId);
    if (matched) return matched.id;
  }
  return publicList[0]?.id || 'expandable-20ft';
};

export const AppConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState(() => {
    const defaults = {
      models: BASE_MODELS,
      defaultModelId: 'expandable-20ft',
      wallOptions: WALL_CLADDING_OPTIONS,
      interiorWallOptions: INTERIOR_WALL_OPTIONS,
      glazingOptions: GLAZING_OPTIONS,
      lightingOptions: LIGHTING_OPTIONS,
      electricalOptions: ELECTRICAL_OPTIONS,
      flooringOptions: FLOORING_OPTIONS,
      roofOptions: ROOF_OPTIONS,
      cabinetryOptions: CABINETRY_OPTIONS,
      addons: MODULAR_ADDONS,
      currency: 'USD',
      markup: 0,
      branding: {
        brandName: 'WANHAI',
        headerText: 'Modular Living Solutions',
        tagline: 'Built on Steel. Designed for Life.',
        ctaText: 'Reserve Now',
        reservationFee: 250,
        primaryColor: '#000000',
        supportEmail: 'shelley@wanhaisteel.com',
      },
      viewerControls: {
        defaultModelId: 'expandable-20ft',
        defaultLighting: 'day', // 'day' | 'sunset' | 'night'
        defaultCutaway: false,
      },
      logistics: {
        freightCost: 4500,
        sitePrepCost: 5500,
        taxRate: 0,
      }
    };

    const saved = localStorage.getItem('boxabl_app_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleanText = (str: string) =>
          str
            .replace(/^WANHAI\s+/i, '')
            .replace(/\bWANHAI[’']s\b/gi, 'our')
            .replace(/\bWANHAI\b/gi, '')
            .replace(/\s*[\(（][^\)）]*[\u4e00-\u9fa5]+[^\)）]*[\)）]/g, '')
            .replace(/[\u4e00-\u9fa5]/g, '')
            .trim();

        // Merge models: preserve user dashboard public/hidden status strictly
        const mergeModels = (parsedArr: any[], defaultArr: any[]) => {
          if (!parsedArr || !parsedArr.length) return defaultArr;
          
          const result: any[] = [];
          // First include all models from parsedArr (which contains exact isAvailable/isActive settings from dashboard)
          parsedArr.forEach((p: any) => {
            const defOpt = defaultArr.find((d: any) => d.id === p.id);
            const rawName = p.name || defOpt?.name || '';
            const cleanedName = cleanText(rawName);
            const rawDesc = p.description || defOpt?.description || '';
            const cleanedDesc = cleanText(rawDesc);
            result.push({
              ...(defOpt || {}),
              ...p,
              name: cleanedName || defOpt?.name,
              description: cleanedDesc || defOpt?.description,
              // Strictly preserve user availability toggles from dashboard
              isAvailable: p.isAvailable !== undefined ? Boolean(p.isAvailable) : (defOpt?.isAvailable !== undefined ? Boolean(defOpt.isAvailable) : true),
              isActive: p.isActive !== undefined ? Boolean(p.isActive) : (defOpt?.isActive !== undefined ? Boolean(defOpt.isActive) : true),
              dimensions: p.dimensions || defOpt?.dimensions,
              series: p.series || defOpt?.series,
            });
          });

          // Also ensure any base models that might not have been in an older parsed config are included
          defaultArr.forEach((defOpt: any) => {
            if (!result.some((r) => r.id === defOpt.id)) {
              result.push({ ...defOpt, isAvailable: true, isActive: true });
            }
          });

          return result;
        };

        // Merge options: if user modified or deleted options in the dashboard, respect their saved list
        const mergeOptions = (parsedArr: any[], defaultArr: any[]) => {
          if (!parsedArr || !Array.isArray(parsedArr)) return defaultArr;
          if (parsedArr.length === 0) return []; // User deleted all items or cleared list
          const result = parsedArr.map((p: any) => {
            const defOpt = defaultArr.find((d: any) => d.id === p.id);
            const baseName = defOpt?.name || p.name || '';
            const baseDesc = defOpt?.description || p.description || '';
            return {
              ...(defOpt || {}),
              ...p,
              name: cleanText(baseName),
              color: defOpt?.color || p.color,
              badge: defOpt?.badge || p.badge,
              category: defOpt?.category || p.category,
              specDetail: defOpt?.specDetail || p.specDetail,
              description: cleanText(baseDesc),
              isAvailable: p.isAvailable !== undefined ? Boolean(p.isAvailable) : true,
              isActive: p.isActive !== undefined ? Boolean(p.isActive) : true,
            };
          });
          defaultArr.forEach((defOpt: any) => {
            if (!result.some((r: any) => r.id === defOpt.id)) {
              result.push({ ...defOpt, isAvailable: true, isActive: true });
            }
          });
          return result;
        };

        const mergedModels = mergeModels(parsed.models, defaults.models);
        const resolvedDefaultModelId = getActivePublicModelId(
          mergedModels,
          parsed.defaultModelId || parsed.viewerControls?.defaultModelId
        );

        return {
          ...defaults,
          ...parsed,
          defaultModelId: resolvedDefaultModelId,
          models: mergedModels,
          wallOptions: mergeOptions(parsed.wallOptions, defaults.wallOptions),
          interiorWallOptions: mergeOptions(parsed.interiorWallOptions, defaults.interiorWallOptions),
          glazingOptions: mergeOptions(parsed.glazingOptions, defaults.glazingOptions),
          lightingOptions: mergeOptions(parsed.lightingOptions, defaults.lightingOptions),
          electricalOptions: mergeOptions(parsed.electricalOptions, defaults.electricalOptions),
          flooringOptions: mergeOptions(parsed.flooringOptions, defaults.flooringOptions),
          roofOptions: mergeOptions(parsed.roofOptions, defaults.roofOptions),
          cabinetryOptions: mergeOptions(parsed.cabinetryOptions, defaults.cabinetryOptions),
          addons: mergeOptions(parsed.addons, defaults.addons),
          branding: { ...defaults.branding, ...(parsed.branding || {}) },
          viewerControls: {
            ...defaults.viewerControls,
            defaultModelId: resolvedDefaultModelId,
            ...(parsed.viewerControls || {}),
          },
          logistics: { ...defaults.logistics, ...(parsed.logistics || {}) },
        };
      } catch (e) {}
    }
    return defaults;
  });

  const updateConfig = (newConfig: any) => {
    setConfig(newConfig);
    localStorage.setItem('boxabl_app_config', JSON.stringify(newConfig));
  };

  const setCurrency = (newCurrency: string) => {
    const normalized = normalizeCurrency(newCurrency);
    updateConfig({
      ...config,
      currency: normalized,
    });
    syncOrdersCurrency(normalized);
  };

  return (
    <AppConfigContext.Provider value={{ config, updateConfig, setCurrency }}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => useContext(AppConfigContext);
