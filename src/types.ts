export type HomeModelId = 'studio' | 'one-bedroom' | 'two-bedroom';

export interface ModelSpecification {
  id: HomeModelId;
  name: string;
  tagline: string;
  sqft: number;
  dimensions: {
    lengthFt: number;
    widthFt: number;
    heightFt: number;
    metricStr: string;
  };
  basePrice: number;
  leadTime: string;
  bedrooms: number;
  bathrooms: number;
  description: string;
  includedFeatures: string[];
}

export type WallCladdingId = 'fluoro-white' | 'fluoro-charcoal' | 'carved-metal-slate' | 'wpc-nordic-oak' | 'aviation-silver' | 'deep-forest-green' | 'peechit-navy';
export type GlazingId = 'low-e-clear' | 'low-e-bronze' | 'floor-ceiling-curtain' | 'privacy-smart-glass';
export type LightingPackageId = 'standard-recessed' | 'halo-strip-ambient' | 'architectural-luxe-smart';
export type ElectricalTierId = 'standard-100a' | 'smart-iot-200a' | 'off-grid-hybrid';
export type FlooringId = 'spc-nordic-oak' | 'spc-terrazzo-grey' | 'spc-american-walnut' | 'polished-marble-white' | 'deep-forest-green' | 'peechit-navy';
export type RoofOptionId = 'standard-parapet' | 'solar-array-3kw' | 'rooftop-terrace-deck' | 'solar-deck-combo';
export type CabinetryId = 'matte-black' | 'gloss-white' | 'deep-forest-green' | 'peechit-navy';

export interface CustomizationState {
  modelId: HomeModelId;
  wallCladding: WallCladdingId;
  glazing: GlazingId;
  lightingPackage: LightingPackageId;
  electricalTier: ElectricalTierId;
  flooring: FlooringId;
  roofOption: RoofOptionId;
  cabinetry: CabinetryId;
  // Toggles for modular add-ons
  hasKitchenetteModule: boolean;
  hasLuxuryBathPod: boolean;
  hasHvacMiniSplit: boolean;
  hasExteriorPergolaDeck: boolean;
  hasSmartDoorLock: boolean;
  hasElectricBlinds: boolean;
}

export interface CustomizationOptionItem<T extends string> {
  id: T;
  name: string;
  description: string;
  price: number;
  category: string;
  color?: string;
  badge?: string;
  specDetail?: string;
}

export interface AddonOptionItem {
  id: keyof Pick<
    CustomizationState,
    | 'hasKitchenetteModule'
    | 'hasLuxuryBathPod'
    | 'hasHvacMiniSplit'
    | 'hasExteriorPergolaDeck'
    | 'hasSmartDoorLock'
    | 'hasElectricBlinds'
  >;
  name: string;
  description: string;
  price: number;
  category: string;
  includedInDefault?: boolean;
  specDetail: string;
}

export type ViewPerspective = 'exterior-iso' | 'front-elevation' | 'top-down-floorplan' | 'interior-walkthrough' | 'back-patio';
export type LightingMode = 'daylight' | 'golden-hour' | 'night-ambient';
