export type HomeModelId =
  | 'studio'
  | 'one-bedroom'
  | 'two-bedroom'
  | 'expandable-20ft'
  | 'expandable-30ft'
  | 'expandable-40ft'
  | 'apple-cabin-ac01'
  | 'apple-cabin-ac02'
  | 'apple-cabin-ac03'
  | 'apple-cabin-ac04'
  | 'apple-cabin-ad03'
  | 'space-capsule-d2'
  | 'space-capsule-d5'
  | 'space-capsule-d7'
  | 'space-capsule-d8'
  | 'space-capsule-d9'
  | 'folding-z-type-20ft'
  | 'fast-assembly-20ft'
  | string;

export interface ModelSpecification {
  id: HomeModelId;
  name: string;
  series?: 'expandable' | 'apple-cabin' | 'space-capsule' | 'folding';
  tagline: string;
  sqft: number;
  areaM2?: number;
  weightKg?: number;
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
  isAvailable?: boolean;
  isActive?: boolean;
  specsHighlights?: {
    frame?: string;
    walls?: string;
    flooring?: string;
    windows?: string;
    power?: string;
    loading?: string;
  };
}

export type WallCladdingId =
  // --- 12 Factory Catalog Exterior Finishes ---
  | 'wenge'
  | 'big-eye-wood'
  | 'ancient-wall-grey'
  | 'angel-white'
  | 'desert-yellow'
  | 'multi-color-brick'
  | 'grass-green'
  | 'pine-knot'
  | 'culture-stone'
  | 'golden-buff-brick'
  | 'classic-red-brick'
  | 'antique-blue-brick'
  // --- Additional Exterior Options ---
  | 'soviet-pine'
  | 'red-chicken-wing'
  | 'dark-grey'
  | 'fluoro-white'
  | 'white'
  | 'he-tian-jade'
  | 'digital-camo'
  | 'orange-yellow'
  | 'white-brick'
  | 'silver-gray'
  | 'dark-gray-stone'
  | 'beige'
  | 'spotted-marble'
  | 'fluoro-charcoal'
  | 'carved-metal-slate'
  | 'wpc-nordic-oak'
  | 'aviation-silver'
  | 'deep-forest-green'
  | 'peechit-navy'
  | string;

export type GlazingId =
  | 'casement-window'
  | 'sliding-window'
  | 'tophanging-window'
  | 'overhanging-window'
  | 'broken-bridge-sliding-door'
  | 'broken-bridge-double-door'
  | 'aluminum-alloy-double-door'
  | 'kfc-double-door'
  | 'broken-bridge-grille-door'
  | 'privacy-smart-glass'
  | 'low-e-clear'
  | 'low-e-bronze'
  | 'floor-ceiling-curtain'
  | string;

export type LightingPackageId =
  | 'standard-recessed'
  | 'halo-strip-ambient'
  | 'architectural-luxe-smart'
  | string;

export type ElectricalTierId =
  | 'standard-100a'
  | 'smart-iot-200a'
  | 'off-grid-hybrid'
  | string;

export type FlooringId =
  // 1. Wood Grain (4 designs)
  | 'wood-nordic-pale-oak'
  | 'wood-honey-oak'
  | 'wood-rich-teak'
  | 'wood-smoked-walnut'
  // 2. Stone Grain (4 designs)
  | 'stone-pearl-white'
  | 'stone-mist-grey'
  | 'stone-basalt-charcoal'
  | 'stone-midnight-granite'
  // 3. Marble Grain (4 designs)
  | 'marble-calacatta-white'
  | 'marble-carrara-silver'
  | 'marble-nero-marquina'
  | 'marble-golden-vein'
  // 4. Solid Color (4 designs)
  | 'solid-pure-white'
  | 'solid-warm-cream'
  | 'solid-light-grey'
  | 'solid-charcoal-anthracite'
  // 5. Cement Look (4 designs)
  | 'cement-chalk-white'
  | 'cement-urban-grey'
  | 'cement-cast-slate'
  | 'cement-dark-obsidian'
  // 6. Patterned (4 designs)
  | 'pattern-floral-encaustic'
  | 'pattern-botanical-rosette'
  | 'pattern-chevron-parquet'
  | 'pattern-geometric-trellis'
  // Legacy mappings for backwards compatibility
  | 'fabric-cream-linen'
  | 'fabric-oatmeal-tweed'
  | 'fabric-charcoal-boucle'
  | 'fabric-midnight-obsidian'
  | 'metal-silver-sand'
  | 'metal-brushed-steel'
  | 'metal-brushed-bronze'
  | 'metal-matte-obsidian'
  | 'stone-calacatta-white'
  | 'stone-grey-slate'
  | 'stone-golden-sahara'
  | 'mirror-silver-chrome'
  | 'mirror-polished-gold'
  | 'mirror-smoked-bronze'
  | 'mirror-piano-black'
  | 'ripple-silver-fluid'
  | 'ripple-titanium-grey'
  | 'ripple-amber-bronze'
  | 'ripple-midnight-black'
  | 'spc-nordic-oak'
  | 'spc-terrazzo-grey'
  | 'spc-american-walnut'
  | 'polished-marble-white'
  | 'deep-forest-green'
  | 'peechit-navy'
  | 'industrial-cement'
  | 'patterned-parquet'
  | string;

export type RoofOptionId =
  | 'standard-parapet'
  | 'pitched-roof'
  | 'rooftop-terrace-deck'
  | 'pitched-terrace-combo'
  | 'solar-array-3kw'
  | 'solar-deck-combo'
  | string;

export type CabinetryId =
  | 'matte-black'
  | 'gloss-white'
  | 'deep-forest-green'
  | 'peechit-navy'
  | string;

export type InteriorWallId =
  // 1. Wood Grain ("Natural texture, warm and timeless")
  | 'wood-nordic-pale-oak'
  | 'wood-honey-oak'
  | 'wood-rich-teak'
  | 'wood-smoked-walnut'
  // 2. Fabric ("Soft touch, elegant and cozy")
  | 'fabric-cream-linen'
  | 'fabric-oatmeal-tweed'
  | 'fabric-charcoal-boucle'
  | 'fabric-midnight-obsidian'
  // 3. Metal ("Sleek and modern, stylish and luxurious")
  | 'metal-silver-sand'
  | 'metal-brushed-steel'
  | 'metal-brushed-bronze'
  | 'metal-matte-obsidian'
  // 4. Marble/Rock ("Natural stone look, bold and impressive")
  | 'stone-calacatta-white'
  | 'stone-grey-slate'
  | 'stone-nero-marquina'
  | 'stone-golden-sahara'
  // 5. Mirror ("Reflective beauty, expand the space")
  | 'mirror-silver-chrome'
  | 'mirror-polished-gold'
  | 'mirror-smoked-bronze'
  | 'mirror-piano-black'
  // 6. Water Ripple ("Unique ripple effect, artistic and dynamic")
  | 'ripple-silver-fluid'
  | 'ripple-titanium-grey'
  | 'ripple-amber-bronze'
  | 'ripple-midnight-black'
  // Factory Standard & Legacy
  | 'bamboo-charcoal-offwhite'
  | 'graphene-insulation-board'
  | 'nordic-oak-slat'
  | 'smoked-walnut-slat'
  | 'calacatta-marble-uv'
  | 'ivory-acoustic-linen'
  | 'industrial-slate-concrete'
  | 'muted-sage-fiber'
  | string;

export type FloorPlanId =
  | '2-bed-1-bath' // 2 bedrooms / 1 restroom / 1 living room (Executive Standard)
  | '3-bed-split-1-bath' // 3 bedrooms / 1 restroom / 1 living room (Dual Wing Split)
  | '3-bed-kitchen-lounge' // 3 bedrooms / 1 restroom / 1 living room (Kitchen Lounge Suite)
  | '1-bed-grand-dining' // 1 bedrooms / 1 restroom / 1 living room (Grand Dining & Great Room)
  | '1-bed-studio-suite' // 1 bedrooms / 1 restroom / 1 living room (Chef Kitchen & Workstation)
  | '4-bed-quad-suite'; // 4 bedrooms / 1 restroom (Quad Private Suites)

export interface FloorPlanOption {
  id: FloorPlanId;
  name: string;
  tagline: string;
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  description: string;
  price: number;
  badge: string;
  recommendedFor: string;
  features: string[];
}

export interface CustomizationState {
  modelId: HomeModelId;
  wallCladding: WallCladdingId; // Outdoor / Exterior Wall Cladding
  interiorWall?: InteriorWallId; // Indoor / Interior Wall Panels
  floorPlan?: FloorPlanId; // Double Wing Expandable Exclusive Floor Plan Layout
  glazing: GlazingId;
  lightingPackage: LightingPackageId;
  electricalTier: ElectricalTierId;
  flooring: FlooringId;
  roofOption: RoofOptionId;
  cabinetry: CabinetryId;
  // Core Modular Add-ons
  hasKitchenetteModule: boolean;
  hasLuxuryBathPod: boolean;
  hasLuxuryBedSuite: boolean;
  hasHvacMiniSplit: boolean;
  hasExteriorPergolaDeck: boolean;
  hasBioDigester: boolean;
  hasSmartDoorLock: boolean;
  hasElectricBlinds: boolean;
  // Wanhai Smart Living & Home Furnishings
  hasSmartControlPanel?: boolean;
  hasSoundSystem?: boolean;
  hasBreakfastBar?: boolean;
  hasFreshAirSystem?: boolean;
  hasUnderfloorHeating?: boolean;
  hasSkylight?: boolean;
  hasProjectionScreen?: boolean;
  hasLivingSofa?: boolean;
  hasWardrobe?: boolean;
  hasTvConsole?: boolean;
  isFoldedTransportMode?: boolean;
  bedroomLayout?: '1-bedroom' | '2-bedroom' | '3-bedroom' | '4-bedroom';
  duplexLevelView?: 'both' | 'ground' | 'upper';
  [key: string]: any;
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
    | 'hasLuxuryBedSuite'
    | 'hasHvacMiniSplit'
    | 'hasExteriorPergolaDeck'
    | 'hasBioDigester'
    | 'hasSmartDoorLock'
    | 'hasElectricBlinds'
    | 'hasSmartControlPanel'
    | 'hasSoundSystem'
    | 'hasBreakfastBar'
    | 'hasFreshAirSystem'
    | 'hasUnderfloorHeating'
    | 'hasSkylight'
    | 'hasProjectionScreen'
    | 'hasLivingSofa'
    | 'hasWardrobe'
    | 'hasTvConsole'
  > | string;
  name: string;
  description: string;
  price: number;
  category: string;
  includedInDefault?: boolean;
  specDetail: string;
}

export type ViewPerspective =
  | 'front-3-4'
  | 'rear-3-4'
  | 'side-elevation'
  | 'top-down-floorplan'
  | 'floor-inspection'
  | 'interior-walkthrough'
  | 'sectional-cutaway'
  | 'exterior-iso'
  | 'front-elevation'
  | 'bedroom-suite'
  | 'living-lounge'
  | 'back-patio'
  | 'rooftop-terrace'
  | 'rooftop-observatory';
export type LightingMode = 'daylight' | 'golden-hour' | 'night-ambient';

export type OrderStatus =
  | 'pending_review'
  | 'deposit_received'
  | 'site_assessment'
  | 'in_production'
  | 'quality_check'
  | 'ready_for_dispatch'
  | 'delivered'
  | 'cancelled';

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  deliveryAddress?: string;
  zipCode: string;
  landStatus: string;
  notes?: string;
}

export interface OrderItemCustomization {
  modelId: HomeModelId;
  modelName: string;
  wallCladdingName: string;
  wallCladdingColor?: string;
  glazingName: string;
  lightingName: string;
  electricalName: string;
  flooringName: string;
  roofName: string;
  cabinetryName: string;
  addonsList: string[];
  rawState?: CustomizationState;
}

export interface OrderPricing {
  basePrice: number;
  optionsTotal: number;
  freightCost: number;
  sitePrepCost: number;
  taxAmount: number;
  totalPrice: number;
  depositDue: number;
  depositPaid: boolean;
  currency: string;
}

export interface OrderInternalNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface CustomerOrder {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  customer: CustomerDetails;
  customization: OrderItemCustomization;
  pricing: OrderPricing;
  estimatedDeliveryDate: string;
  internalNotes: OrderInternalNote[];
}

