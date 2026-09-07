import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BASE_MODELS } from '../data/models';
import {
  WALL_CLADDING_OPTIONS, GLAZING_OPTIONS, LIGHTING_OPTIONS, ELECTRICAL_OPTIONS,
  FLOORING_OPTIONS, ROOF_OPTIONS, CABINETRY_OPTIONS, MODULAR_ADDONS
} from '../data/options';

export const AppConfigContext = createContext<any>(null);

export const AppConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('boxabl_app_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
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
  });

  const updateConfig = (newConfig: any) => {
    setConfig(newConfig);
    localStorage.setItem('boxabl_app_config', JSON.stringify(newConfig));
  };

  return (
    <AppConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => useContext(AppConfigContext);
