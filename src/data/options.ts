import {
  WallCladdingId,
  GlazingId,
  LightingPackageId,
  ElectricalTierId,
  FlooringId,
  RoofOptionId,
  CabinetryId,
  CustomizationOptionItem,
  AddonOptionItem,
} from '../types';

export const WALL_CLADDING_OPTIONS: CustomizationOptionItem<WallCladdingId>[] = [
  {
    id: 'fluoro-white',
    name: 'Fluorocarbon White Aluminum',
    description:
      'Signature Boxabl pristine matte white finish. High-durability fluorocarbon-coated aviation alloy panels resistant to UV degradation and corrosion.',
    price: 0,
    category: 'Wall Panels',
    color: '#f8fafc',
    badge: 'Standard',
    specDetail: '0.8mm aerospace fluorocarbon sheet over 50mm PU rock wool core',
  },
  {
    id: 'fluoro-charcoal',
    name: 'Architectural Charcoal Matte',
    description:
      'Deep stealth slate grey with anti-scratch thermoset powder coating. Absorbs less solar radiation with infrared-reflective pigmentation.',
    price: 1850,
    category: 'Wall Panels',
    color: '#262d38',
    badge: 'Popular',
    specDetail: 'Fluorocarbon PVDF spray coat, RAL 7016, 25-year anti-fading warranty',
  },
  {
    id: 'carved-metal-slate',
    name: 'Carved Metal Ribbed Panels',
    description:
      'Embossed micro-ribbed horizontal metal panels directly from the 20ft Apple Cabin architectural series, creating contemporary rhythm and depth.',
    price: 2400,
    category: 'Wall Panels',
    color: '#475569',
    badge: '20ft Cabin Spec',
    specDetail: 'Steel carved plate with polyurethane thermal break layer (0.35mm embossed)',
  },
  {
    id: 'wpc-nordic-oak',
    name: 'Eco WPC Nordic Oak Slats',
    description:
      'Exterior-grade wood-plastic composite vertical battens over insulated metal backup panels. Natural Scandinavian warmth with zero rot.',
    price: 3800,
    category: 'Wall Panels',
    color: '#b48a60',
    badge: 'Premium Eco',
    specDetail: 'Co-extruded HDPE & recycled wood fiber, UV Class 4 weather rating',
  },
  {
    id: 'aviation-silver',
    name: 'Aviation Silver Monolithic',
    description:
      'Futuristic metallic silver brushed alloy shell echoing aerospace capsule aesthetics with polished corner trim.',
    price: 2950,
    category: 'Wall Panels',
    color: '#94a3b8',
    badge: 'Aerospace',
    specDetail: 'Brushed anodized aluminum composite with hydrophobic nano-coating',
  },
  {
    id: 'deep-forest-green',
    name: 'Deep Forest Green Matte',
    description:
      'A rich, custom #0D3512 forest green finish offering a harmonious integration with natural surroundings. Durable, low-glare matte coating.',
    price: 2100,
    category: 'Wall Panels',
    color: '#0D3512',
    badge: 'Custom Swatch',
    specDetail: 'Advanced biophilic pigment layer over Q235 steel, 15-year colorfast warranty',
  },
  {
    id: 'peechit-navy',
    name: 'Peechit Navy Architectural',
    description:
      'A striking #000066 custom navy blue for a bold, modern marine aesthetic. Highly resistant to salt spray and harsh coastal weather.',
    price: 2200,
    category: 'Wall Panels',
    color: '#000066',
    badge: 'Custom Swatch',
    specDetail: 'Marine-grade polyurethane finish over aluminum composite',
  },
];

export const GLAZING_OPTIONS: CustomizationOptionItem<GlazingId>[] = [
  {
    id: 'low-e-clear',
    name: 'Double-Layer Hollow Low-E Glass',
    description:
      '6mm+12A+6mm double tempered argon-filled glazing with Low-E thermal barrier and broken bridge aluminum frames.',
    price: 0,
    category: 'Glazing & Windows',
    color: '#93c5fd',
    badge: 'Standard',
    specDetail: 'U-value 1.4 W/m²K, Solar Heat Gain Coefficient (SHGC) 0.38, 40dB acoustic cutoff',
  },
  {
    id: 'low-e-bronze',
    name: 'Architectural Bronze Solar Tint',
    description:
      'Warm bronze-tinted tempered glass reducing interior glare by 65% while providing enhanced daytime exterior privacy.',
    price: 1450,
    category: 'Glazing & Windows',
    color: '#92400e',
    badge: 'High Solar Control',
    specDetail: '8mm+12A+8mm tempered safety glass with dual magnetron sputtered Low-E coating',
  },
  {
    id: 'floor-ceiling-curtain',
    name: 'Panoramic Full-Curtain Wall',
    description:
      'Extends the front facade into an uninterrupted structural glass curtain wall with slimline structural mullions.',
    price: 3600,
    category: 'Glazing & Windows',
    color: '#60a5fa',
    badge: 'Max Daylight',
    specDetail: 'Structural silicone glazed thermal broken system with heavy-duty rollers',
  },
  {
    id: 'privacy-smart-glass',
    name: 'PDLC Switchable Smart Glass',
    description:
      'Electrochromic smart glass that transitions from crystal clear to frosted privacy in under 100 milliseconds via wall switch or app.',
    price: 4900,
    category: 'Glazing & Windows',
    color: '#e2e8f0',
    badge: 'Smart Tech',
    specDetail: 'Polymer Dispersed Liquid Crystal interlayer, 5W power draw, 99% UV block',
  },
];

export const LIGHTING_OPTIONS: CustomizationOptionItem<LightingPackageId>[] = [
  {
    id: 'standard-recessed',
    name: 'Architectural Recessed Downlights',
    description:
      'Flush-mounted anti-glare warm white (3000K) LED downlights positioned for balanced interior illumination.',
    price: 0,
    category: 'Lighting System',
    color: '#fef08a',
    badge: 'Standard',
    specDetail: 'CRI 95+, 12W deep recessed spot array, flicker-free dimmable driver',
  },
  {
    id: 'halo-strip-ambient',
    name: 'Halo Ambient LED & Exterior Soffit Glow',
    description:
      'Continuous indirect LED cove lighting tracing the ceiling perimeter, lower baseboards, and exterior roof overhang fascia.',
    price: 1650,
    category: 'Lighting System',
    color: '#f59e0b',
    badge: 'Architectural Glow',
    specDetail: '24V COB dotless LED linear strips, 2700K-4000K tunable white, hidden aluminum channel',
  },
  {
    id: 'architectural-luxe-smart',
    name: 'Full Smart Scene Lighting Suite',
    description:
      'Fully addressable smart lighting with capacitive glass touch panels, automated dusk-to-dawn exterior presets, and RGBW mood channels.',
    price: 2900,
    category: 'Lighting System',
    color: '#ec4899',
    badge: 'Smart Connected',
    specDetail: 'Zigbee/Matter wireless integration, magnetic low-voltage track fixtures',
  },
];

export const ELECTRICAL_OPTIONS: CustomizationOptionItem<ElectricalTierId>[] = [
  {
    id: 'standard-100a',
    name: 'Pre-Wired 100A Service Center',
    description:
      'Factory installed distribution panel, tamper-resistant 110V/220V receptacles, dedicated high-draw appliance circuit, and external shore power plug.',
    price: 0,
    category: 'Electrical & Power',
    badge: 'Included',
    specDetail: 'Square D QO 100-amp load center, copper Romex wiring with grounding bar',
  },
  {
    id: 'smart-iot-200a',
    name: '200A Smart Load Center + USB-C PD',
    description:
      'Upgraded 200-amp service with integrated circuit-level energy monitoring, whole-home surge protection, and fast-charge USB-C PD wall ports.',
    price: 2150,
    category: 'Electrical & Power',
    badge: 'Energy Monitor',
    specDetail: 'Smart breaker panel with smartphone power analytics and bi-directional backup ready',
  },
  {
    id: 'off-grid-hybrid',
    name: 'Off-Grid Hybrid Power Prep',
    description:
      'Pre-plumbed conduits, heavy-gauge DC battery disconnect, automatic generator transfer switch, and hybrid inverter hookup hub.',
    price: 3800,
    category: 'Electrical & Power',
    badge: 'Off-Grid Ready',
    specDetail: 'Heavy gauge DC cabling, 50A automatic transfer switch, NEMA 3R outdoor enclosure',
  },
];

export const FLOORING_OPTIONS: CustomizationOptionItem<FlooringId>[] = [
  {
    id: 'spc-nordic-oak',
    name: 'Luxury SPC Nordic Pale Oak',
    description:
      'Stone Plastic Composite rigid core planks with authentic textured woodgrain, 100% waterproof construction, and pre-attached acoustic IXPE pad.',
    price: 0,
    category: 'Flooring',
    color: '#e2d5c3',
    badge: 'Standard',
    specDetail: '6.5mm total thickness, 20mil commercial wear layer, zero VOC emission',
  },
  {
    id: 'spc-terrazzo-grey',
    name: 'Polished Concrete Grey Terrazzo',
    description:
      'Contemporary large-format architectural concrete finish with micro-fleck terrazzo pattern. Industrial minimalist aesthetic.',
    price: 850,
    category: 'Flooring',
    color: '#94a3b8',
    badge: 'Urban Style',
    specDetail: 'High-density mineral composite with matte polyurethane anti-scuff topcoat',
  },
  {
    id: 'spc-american-walnut',
    name: 'Rich American Walnut Planks',
    description:
      'Deep, luxurious chocolate tones with expressive timber knots and micro-beveled edges for high-end boutique cabin ambiance.',
    price: 1100,
    category: 'Flooring',
    color: '#5c3d2e',
    badge: 'Warm Luxury',
    specDetail: 'Embossed-in-register (EIR) surface texture, Class 33 heavy domestic rating',
  },
  {
    id: 'polished-marble-white',
    name: 'Calacatta White Marble Tile',
    description:
      'Ultra-refined polished white marble porcelain with delicate grey veining, creating an airy luxury showroom atmosphere.',
    price: 2200,
    category: 'Flooring',
    color: '#f1f5f9',
    badge: 'Luxe Finish',
    specDetail: 'Porcelain composite tile with R10 slip resistance and rectified edges',
  },
  {
    id: 'deep-forest-green',
    name: 'Deep Forest Green Epoxy',
    description:
      'A seamless, high-gloss poured epoxy floor in a rich #0D3512 forest green. Incredibly durable and easy to clean.',
    price: 1850,
    category: 'Flooring',
    color: '#0D3512',
    badge: 'Custom Swatch',
    specDetail: '100% solid commercial-grade epoxy resin, seamless poured application',
  },
  {
    id: 'peechit-navy',
    name: 'Peechit Navy Matte Resin',
    description:
      'A luxurious #000066 custom navy resin floor with a velvet matte finish, offering a stunning contrast for contemporary spaces.',
    price: 1950,
    category: 'Flooring',
    color: '#000066',
    badge: 'Custom Swatch',
    specDetail: 'Polyurethane cast resin system, UV-stable matte topcoat',
  },
];

export const ROOF_OPTIONS: CustomizationOptionItem<RoofOptionId>[] = [
  {
    id: 'standard-parapet',
    name: 'Standard Integrated Parapet Flat Roof',
    description:
      'Aerodynamic concealed drainage roof with seamless SBS waterproof membrane and perimeter wind deflector cap.',
    price: 0,
    category: 'Roof & Energy',
    badge: 'Standard',
    specDetail: 'Galvanized roof trusses, multi-layer thermal insulation, 120kg/m² snow load',
  },
  {
    id: 'solar-array-3kw',
    name: '3.2 kW Bifacial Rooftop Solar Array',
    description:
      'High-efficiency monocrystalline solar panels with microinverters mounted flush to the roof rails, generating clean off-grid or net-meter power.',
    price: 5400,
    category: 'Roof & Energy',
    badge: 'Clean Energy',
    specDetail: '8x 400W Tier-1 bifacial panels, Enphase IQ8+ microinverters, app production telemetry',
  },
  {
    id: 'rooftop-terrace-deck',
    name: 'Rooftop Observation Terrace & Railing',
    description:
      'Walkable composite rooftop deck with perimeter aluminum safety balustrade, non-slip weather decking, and waterproof access hatch.',
    price: 4600,
    category: 'Roof & Energy',
    badge: 'Outdoor Space',
    specDetail: 'Reinforced 300kg/m² live load frame, 42-inch safety glass/aluminum perimeter guard',
  },
  {
    id: 'solar-deck-combo',
    name: 'Solar Canopy + Walkable Rooftop Deck',
    description:
      'Elevated solar pergola structure providing both maximum clean energy harvesting and shaded rooftop lounge seating below.',
    price: 8900,
    category: 'Roof & Energy',
    badge: 'Ultimate Roof',
    specDetail: 'Integrated 3.2kW solar pergola canopy + 140 sq ft composite walking deck',
  },
];

export const CABINETRY_OPTIONS: CustomizationOptionItem<CabinetryId>[] = [
  {
    id: 'matte-black',
    name: 'Matte Black Soft-Touch',
    description: 'Anti-fingerprint matte black Euro-style cabinets with integrated pulls.',
    price: 0,
    category: 'Cabinetry',
    color: '#1e293b',
    badge: 'Standard',
  },
  {
    id: 'gloss-white',
    name: 'High-Gloss White Acrylic',
    description: 'Seamless high-gloss white finish reflecting natural light to open the space.',
    price: 450,
    category: 'Cabinetry',
    color: '#ffffff',
  },
  {
    id: 'deep-forest-green',
    name: 'Deep Forest Green Matte',
    description: 'Custom #0D3512 forest green finish for a sophisticated, earthy kitchen aesthetic.',
    price: 850,
    category: 'Cabinetry',
    color: '#0D3512',
    badge: 'Custom Swatch',
  },
  {
    id: 'peechit-navy',
    name: 'Peechit Navy Matte',
    description: 'Custom #000066 navy finish, providing a striking modern contrast.',
    price: 950,
    category: 'Cabinetry',
    color: '#000066',
    badge: 'Custom Swatch',
  },
];

export const MODULAR_ADDONS: AddonOptionItem[] = [
  {
    id: 'hasKitchenetteModule',
    name: 'Gourmet Kitchenette Pod',
    description:
      'Solid quartz waterfall countertop, soft-close Euro cabinetry, 2-burner induction cooktop, stainless under-mount sink with pull-out faucet, and 12V/110V under-counter refrigerator.',
    price: 5800,
    category: 'Interior Modules',
    specDetail: 'Pre-plumbed PEX water lines, drain manifold, dedicated 30A appliance branch circuit',
  },
  {
    id: 'hasLuxuryBathPod',
    name: 'Integrated Waterproof Bath Pod',
    description:
      'Factory pre-molded seamless bathroom pod. Frameless glass shower with rainfall shower head, ceramic wall-hung toilet, floating vanity with backlit LED mirror, and high-CFM exhaust fan.',
    price: 6400,
    category: 'Interior Modules',
    specDetail: 'Fiberglass reinforced waterproof shell, hot/cold supply manifolds, odorless P-trap assembly',
  },
  {
    id: 'hasHvacMiniSplit',
    name: 'Ultra-Quiet Inverter Mini-Split HVAC',
    description:
      'High-efficiency heat pump providing whisper-quiet heating and air conditioning down to -15°F (-26°C), with smart WiFi mobile app control.',
    price: 3200,
    category: 'Climate Control',
    specDetail: '12,000 BTU, 22 SEER2 efficiency rating, pre-charged lineset with exterior protective shroud',
  },
  {
    id: 'hasExteriorPergolaDeck',
    name: 'Front Entry Modular Pergola & Patio Deck',
    description:
      'Quick-connect outdoor platform matching the cabin footprint with aluminum pergola overhead structure and weather-resistant composite decking.',
    price: 3950,
    category: 'Outdoor Living',
    specDetail: '160 sq ft composite deck platform with adjustable leveling piers and powder-coated trellis',
  },
  {
    id: 'hasSmartDoorLock',
    name: 'Biometric Smart Entry Door Suite',
    description:
      'Commercial-grade broken bridge entry door with fingerprint scanner, digital keypad, mobile NFC keyless entry, and integrated HD video doorbell.',
    price: 950,
    category: 'Smart Hardware',
    specDetail: 'Multi-point deadbolt locking mechanism with tamper siren and backup mechanical keys',
  },
  {
    id: 'hasElectricBlinds',
    name: 'Motorized Dual-Layer Blackout Blinds',
    description:
      'Concealed roller blinds for all panoramic glass expanses with solar sheer filtering and 100% blackout layers, remote and voice-controlled.',
    price: 1850,
    category: 'Smart Hardware',
    specDetail: 'Rechargeable lithium battery motorized rollers, whisper-drive quiet motor (<30dB)',
  },
];
