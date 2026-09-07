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
        return {
          ...defaults,
          ...parsed,
          models: parsed.models?.length ? parsed.models : defaults.models,
          wallOptions: parsed.wallOptions?.length ? parsed.wallOptions : defaults.wallOptions,
          glazingOptions: parsed.glazingOptions?.length ? parsed.glazingOptions : defaults.glazingOptions,
          lightingOptions: parsed.lightingOptions?.length ? parsed.lightingOptions : defaults.lightingOptions,
          electricalOptions: parsed.electricalOptions?.length ? parsed.electricalOptions : defaults.electricalOptions,
          flooringOptions: parsed.flooringOptions?.length ? parsed.flooringOptions : defaults.flooringOptions,
          roofOptions: parsed.roofOptions?.length ? parsed.roofOptions : defaults.roofOptions,
          cabinetryOptions: parsed.cabinetryOptions?.length ? parsed.cabinetryOptions : defaults.cabinetryOptions,
          addons: parsed.addons?.length ? parsed.addons : defaults.addons,
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
