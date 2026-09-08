import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BASE_MODELS } from '../data/models';
import {
  WALL_CLADDING_OPTIONS, GLAZING_OPTIONS, LIGHTING_OPTIONS, ELECTRICAL_OPTIONS,
  FLOORING_OPTIONS, ROOF_OPTIONS, CABINETRY_OPTIONS, MODULAR_ADDONS
} from '../data/options';

export const AppConfigContext = createContext<any>(null);

export const AppConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState(() => {
    const defaults = {
      models: BASE_MODELS,
      wallOptions: WALL_CLADDING_OPTIONS,
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
        brandName: 'Boxabl',
        headerText: 'Build Your Home',
        tagline: '20ft Cabin Series',
        ctaText: 'Reserve Now',
        reservationFee: 250,
        primaryColor: '#000000',
        supportEmail: 'support@boxabl.com',
      },
      viewerControls: {
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
        const mergeOptions = (parsedArr: any[], defaultArr: any[]) => {
          if (!parsedArr || !parsedArr.length) return defaultArr;
          const merged = [...parsedArr];
          defaultArr.forEach(defOpt => {
            if (!merged.find(p => p.id === defOpt.id)) {
              merged.push(defOpt);
            }
          });
          return merged;
        };

        return {
          ...defaults,
          ...parsed,
          models: mergeOptions(parsed.models, defaults.models),
          wallOptions: mergeOptions(parsed.wallOptions, defaults.wallOptions),
          glazingOptions: mergeOptions(parsed.glazingOptions, defaults.glazingOptions),
          lightingOptions: mergeOptions(parsed.lightingOptions, defaults.lightingOptions),
          electricalOptions: mergeOptions(parsed.electricalOptions, defaults.electricalOptions),
          flooringOptions: mergeOptions(parsed.flooringOptions, defaults.flooringOptions),
          roofOptions: mergeOptions(parsed.roofOptions, defaults.roofOptions),
          cabinetryOptions: mergeOptions(parsed.cabinetryOptions, defaults.cabinetryOptions),
          addons: mergeOptions(parsed.addons, defaults.addons),
          branding: { ...defaults.branding, ...(parsed.branding || {}) },
          viewerControls: { ...defaults.viewerControls, ...(parsed.viewerControls || {}) },
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
    updateConfig({
      ...config,
      currency: newCurrency,
    });
  };

  return (
    <AppConfigContext.Provider value={{ config, updateConfig, setCurrency }}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => useContext(AppConfigContext);
