import {
  WallCladdingId,
  InteriorWallId,
  GlazingId,
  LightingPackageId,
  ElectricalTierId,
  FlooringId,
  RoofOptionId,
  CabinetryId,
  FloorPlanId,
  FloorPlanOption,
  CustomizationOptionItem,
  AddonOptionItem,
} from '../types';

// =========================================================================
// 1. EXTERIOR WALL CLADDING & FINISH PANELS (Page 21-23, 58)
// =========================================================================
export const WALL_CLADDING_OPTIONS: CustomizationOptionItem<WallCladdingId>[] = [
  // --- 12 Factory Catalog Expandable House Exterior Designs (From Official Spec Sheet) ---
  {
    id: 'wenge',
    name: 'Wenge',
    description:
      'Deep architectural wenge timber pattern with fine dark grain figures. Creates an upscale resort homestay and luxury cabin character.',
    price: 1450,
    category: 'Factory 12 Catalog',
    color: '#5c2c16',
    badge: 'Wenge Wood',
    specDetail: 'Weatherproof thermoset woodgrain coating, Class B1 fire rated, 0.45mm steel',
  },
  {
    id: 'big-eye-wood',
    name: 'Big Eye Wood',
    description:
      'Warm natural honey-pine timber grain featuring distinctive organic knot burl rings for a cozy alpine chalet and lodge aesthetic.',
    price: 1350,
    category: 'Factory 12 Catalog',
    color: '#c68a4c',
    badge: 'Natural Timber',
    specDetail: 'UV-printed high-definition timber texture over anti-corrosion galvanized base',
  },
  {
    id: 'ancient-wall-grey',
    name: 'Ancient Wall Grey',
    description:
      'Aged historical slate-grey carved horizontal masonry seams. Combines heritage architectural charm with high-density thermal break insulation.',
    price: 1200,
    category: 'Factory 12 Catalog',
    color: '#787d82',
    badge: 'Carved Slate',
    specDetail: 'Embossed textured relief with integrated thermal barrier, matte anti-scratch coat',
  },
  {
    id: 'angel-white',
    name: 'Angel White',
    description:
      'Pure sculpted architectural white carved panel with clean horizontal masonry reliefs for sleek, high-end modern facades.',
    price: 0,
    category: 'Factory 12 Catalog',
    color: '#f8fafc',
    badge: 'Standard / Included',
    specDetail: 'Fluorocarbon PVDF spray coat with self-cleaning anti-dirt technology, 75mm core',
  },
  {
    id: 'desert-yellow',
    name: 'Desert Yellow',
    description:
      'Warm textured sandstone brick relief mimicking desert canyon architecture with superior UV and thermal reflection.',
    price: 1100,
    category: 'Factory 12 Catalog',
    color: '#d9a74a',
    badge: 'Warm Sandstone',
    specDetail: 'Al-Zn alloy coated steel sheet with polyurethane foam insulation',
  },
  {
    id: 'multi-color-brick',
    name: 'Multi-Color Brick',
    description:
      'Artisan multi-colored brick facade featuring staggered ceramic tones of mauve, terracotta, and warm stone with crisp recessed mortar joints.',
    price: 1650,
    category: 'Factory 12 Catalog',
    color: '#9a6277',
    badge: 'Multi-Tone Brick',
    specDetail: 'Multi-color roller printing with textured ceramic brick stamp relief',
  },
  {
    id: 'grass-green',
    name: 'Grass Green',
    description:
      'Vibrant nature-inspired grass green horizontal siding with anti-corrosion fluorocarbon coating that harmonizes into forests and meadows.',
    price: 1150,
    category: 'Factory 12 Catalog',
    color: '#58933b',
    badge: 'Biophilic Eco',
    specDetail: 'High-chroma polyester baking varnish with UV stabilizer and anti-fade warranty',
  },
  {
    id: 'pine-knot',
    name: 'Pine Knot',
    description:
      'Warm cedar and redwood tone woodgrain with scattered natural pine knots and textured relief, evoking Scandinavian woodland cabins.',
    price: 1400,
    category: 'Factory 12 Catalog',
    color: '#93452c',
    badge: 'Rustic Timber',
    specDetail: 'Embossed woodgrain with organic knot figures over galvanized steel backing',
  },
  {
    id: 'culture-stone',
    name: 'Culture Stone',
    description:
      'High-relief natural stacked fieldstone and rubble rock texture carved into insulated panels for an authentic mountain villa appearance.',
    price: 1850,
    category: 'Factory 12 Catalog',
    color: '#695c52',
    badge: 'Stacked Stone',
    specDetail: '3D deep-embossed stone relief pattern with polyurethane thermal core',
  },
  {
    id: 'golden-buff-brick',
    name: 'Golden Buff Brick',
    description:
      'Sunlit golden buff brick bond pattern creating a welcoming suburban residence and modern country estate aesthetic.',
    price: 1250,
    category: 'Factory 12 Catalog',
    color: '#cb9652',
    badge: 'Golden Masonry',
    specDetail: 'Embossed textured brick bond with weather-resistant fluorocarbon finish',
  },
  {
    id: 'classic-red-brick',
    name: 'Classic Red Brick',
    description:
      'Timeless heritage terracotta red brick pattern with authentic mortar joints, delivering classic architectural charm.',
    price: 1300,
    category: 'Factory 12 Catalog',
    color: '#8c3e34',
    badge: 'Heritage Brick',
    specDetail: 'Traditional kiln red brick reproduction on insulated metal sheet',
  },
  {
    id: 'antique-blue-brick',
    name: 'Antique Blue Brick',
    description:
      'Traditional Chinese courtyard blue-grey brick pattern with realistic recessed mortar joints and subtle vintage stone weathering.',
    price: 1500,
    category: 'Factory 12 Catalog',
    color: '#4e5d6c',
    badge: 'Courtyard Brick',
    specDetail: 'Multi-layer pigment dispersion reproducing authentic historic cyan masonry',
  },

  // --- Extended Color Steel Plate Finishes ---
  {
    id: 'fluoro-white',
    name: 'Crisp White Plate',
    description:
      'Signature crisp modern white finish. Weather-resistant color steel plate over 75mm high-density thermal break insulation core.',
    price: 0,
    category: 'Color Steel Plate',
    color: '#f8fafc',
    badge: 'Standard',
    specDetail: '0.45mm color steel sheet with 75mm bamboo-wood-fiber / EPS core',
  },
  {
    id: 'dark-grey',
    name: 'Dark Grey',
    description:
      'Understated contemporary charcoal grey with anti-scratch thermoset coating. Clean architectural look for private retreats.',
    price: 950,
    category: 'Color Steel Plate',
    color: '#2b303a',
    badge: 'Modern',
    specDetail: 'Matte PVDF powder coat, RAL 7016, 20-year colorfast warranty',
  },
  {
    id: 'soviet-pine',
    name: 'Soviet Pine',
    description:
      'Warm natural Siberian pine vertical woodgrain reproduction on galvanized color steel. Delivers organic timber aesthetics with zero maintenance.',
    price: 1200,
    category: 'Color Steel Plate',
    color: '#c88a4a',
    badge: 'Woodgrain',
    specDetail: 'UV-printed realistic woodgrain over anti-corrosion galvanized base',
  },
  {
    id: 'red-chicken-wing',
    name: 'Red Chicken Wing Wood',
    description:
      'Deep reddish-brown fine timber pattern with prominent grain figures, offering an upscale resort homestay character.',
    price: 1450,
    category: 'Color Steel Plate',
    color: '#7b2e20',
    badge: 'Luxury Wood',
    specDetail: 'Weatherproof thermoset woodgrain coating, Class B1 fire rated',
  },
  {
    id: 'he-tian-jade',
    name: 'He Tian Jade',
    description:
      'Subtle crystalline jade green marble pattern reflecting light softly. Inspired by traditional Chinese jade luxury.',
    price: 1800,
    category: 'Color Steel Plate',
    color: '#c2d7d5',
    badge: 'Mineral Stone',
    specDetail: 'High-definition mineral ink transfer with protective anti-graffiti layer',
  },
  {
    id: 'digital-camo',
    name: 'Digital Camouflage',
    description:
      'Pixelated earth-tone camouflage finish for wildlife observation cabins, forestry stations, and tactical basecamps.',
    price: 1600,
    category: 'Color Steel Plate',
    color: '#737559',
    badge: 'Tactical',
    specDetail: 'Multi-layer pigment dispersion, matte low-reflectivity finish',
  },
  {
    id: 'orange-yellow',
    name: 'Orange Yellow',
    description:
      'Eye-catching high-visibility orange-yellow designed for creative studios, mobile pop-up cafes, and coastal glamping.',
    price: 1100,
    category: 'Color Steel Plate',
    color: '#ea580c',
    badge: 'Vibrant',
    specDetail: 'High-chroma polyester baking varnish with UV stabilizer',
  },
  {
    id: 'white-brick',
    name: 'White Brick',
    description:
      'Classic white subway brick pattern creating a welcoming suburban cottage and garden ADU presence.',
    price: 1350,
    category: 'Color Steel Plate',
    color: '#f1f5f9',
    badge: 'Masonry',
    specDetail: 'Embossed textured relief over galvanized steel backing',
  },
  {
    id: 'silver-gray',
    name: 'Silver Gray',
    description:
      'Clean metallic silver grey delivering an authentic industrial precision look for work camps and modern dwellings.',
    price: 1200,
    category: 'Color Steel Plate',
    color: '#9ca3af',
    badge: 'Industrial',
    specDetail: 'Metallic mica pigment in thermosetting resin coating',
  },
  {
    id: 'dark-gray-stone',
    name: 'Dark Gray Culture Stone',
    description:
      'Rugged stacked stone texture with deep slate shadowlines. Gives the impression of solid mountain masonry.',
    price: 1900,
    category: 'Color Steel Plate',
    color: '#3a4149',
    badge: 'Culture Stone',
    specDetail: '3D embossed stone relief pattern on 0.5mm steel plate',
  },
  {
    id: 'beige',
    name: 'Beige',
    description:
      'Gentle warm sandy beige that blends harmoniously into coastal dunes, deserts, and sunlit garden surroundings.',
    price: 850,
    category: 'Color Steel Plate',
    color: '#e2ceb1',
    badge: 'Earth Tone',
    specDetail: 'Matte polyester coating with anti-stain fluorocarbon topcoat',
  },
  {
    id: 'spotted-marble',
    name: 'Spotted Marble',
    description:
      'Refined white and grey terrazzo marble pattern for luxury boutique cabins and executive resort suites.',
    price: 1950,
    category: 'Color Steel Plate',
    color: '#c8cdd3',
    badge: 'Terrazzo Luxe',
    specDetail: 'Mineral quartz simulated print over insulated backing',
  },

  // --- Metal Carved Panel Series (Page 23) ---
  {
    id: 'carved-metal-slate',
    name: 'Ribbed Carved Metal Slate Panel',
    description:
      'Embossed micro-ribbed horizontal metal panels from the Apple Cabin series, creating contemporary rhythm and depth.',
    price: 2400,
    category: 'Metal Carved Panel',
    color: '#475569',
    badge: 'Apple Cabin Spec',
    specDetail: 'Steel carved plate with polyurethane thermal break layer (0.35mm embossed)',
  },
  {
    id: 'wenge-carved',
    name: 'Wenge Carved Timber Panel',
    description:
      'Deep architectural wenge timber texture stamped on heavy-gauge carved metal panel with polyurethane insulation.',
    price: 2600,
    category: 'Metal Carved Panel',
    color: '#4a2c2a',
    badge: 'Carved Wood',
    specDetail: 'Carved metal panel with 16mm PU insulation and aluminum foil backing',
  },
  {
    id: 'ancient-wall-grey',
    name: 'Ancient Wall Grey Panel',
    description:
      'Aged historical slate grey carved with interlocking flagstone seams. Combines heritage charm with modern insulation.',
    price: 2300,
    category: 'Metal Carved Panel',
    color: '#52525b',
    badge: 'Masonry',
    specDetail: 'Deep-draw embossed steel with integrated thermal barrier',
  },
  {
    id: 'angel-white-carved',
    name: 'Angel White Carved Panel',
    description:
      'Pure sculpted white carved panel with geometric horizontal reliefs for sleek, high-end architectural facades.',
    price: 2400,
    category: 'Metal Carved Panel',
    color: '#ffffff',
    badge: 'Sculpted',
    specDetail: 'Fluorocarbon PVDF spray coat with anti-dirt self-cleaning technology',
  },
  {
    id: 'desert-yellow-carved',
    name: 'Desert Yellow Carved Panel',
    description:
      'Warm textured sandstone relief mimicking desert canyon architecture. Excellent UV and thermal reflection.',
    price: 2250,
    category: 'Metal Carved Panel',
    color: '#d4a373',
    badge: 'Sandstone',
    specDetail: 'Al-Zn alloy coated steel sheet with polyurethane foam insulation',
  },
  {
    id: 'culture-stone-carved',
    name: 'Culture Stone Carved Panel',
    description:
      'High-relief natural stacked fieldstone carved into insulated metal sheets. Premium rustic exterior appearance.',
    price: 2700,
    category: 'Metal Carved Panel',
    color: '#3f3f46',
    badge: 'Stacked Stone',
    specDetail: '16mm total thickness with fireproof polyurethane core',
  },
  {
    id: 'antique-blue-brick',
    name: 'Antique Blue Brick Panel',
    description:
      'Traditional Chinese courtyard blue-grey brick pattern with realistic recessed mortar joints on steel panel.',
    price: 2650,
    category: 'Metal Carved Panel',
    color: '#475569',
    badge: 'Heritage',
    specDetail: 'Multi-color roller printing on galvanized substrate',
  },

  // --- Aerospace Metallic Fluorocarbon Series (Page 58) ---
  {
    id: 'aviation-silver',
    name: 'Aerospace Metallic Fluorocarbon Silver',
    description:
      'Monocoque aerospace aluminum alloy exterior finished in metallic fluorocarbon baking paint. Weather-resistant and color-fast.',
    price: 2950,
    category: 'Aerospace Shell',
    color: '#94a3b8',
    badge: 'Space Capsule Spec',
    specDetail: 'Aerospace-grade aluminum alloy panels + 100mm PU thermal layer',
  },
  {
    id: 'fluoro-charcoal',
    name: 'Titanium Obsidian Fluorocarbon',
    description:
      'Deep metallic obsidian black fluorocarbon finish with satin luster, giving space capsules and cabins a stealth presence.',
    price: 2850,
    category: 'Aerospace Shell',
    color: '#1e293b',
    badge: 'Stealth Capsule',
    specDetail: 'Multi-coat metallic baking paint over aviation alloy shell',
  },
  {
    id: 'wpc-nordic-oak',
    name: 'Eco WPC Nordic Oak Slat Accents',
    description:
      'Exterior-grade wood-plastic composite vertical battens over insulated metal backup panels. Natural warmth with zero rot.',
    price: 3800,
    category: 'Wood Composite',
    color: '#b48a60',
    badge: 'Premium Eco',
    specDetail: 'Co-extruded HDPE & recycled wood fiber, UV Class 4 weather rating',
  },
];

// =========================================================================
// 1B. INDOOR / INTERIOR WALL PANELS & FINISHES
// =========================================================================
export const INTERIOR_WALL_OPTIONS: CustomizationOptionItem<InteriorWallId>[] = [
  // =========================================================================
  // 1. WOOD GRAIN ("Natural texture, warm and timeless")
  // =========================================================================
  {
    id: 'wood-nordic-pale-oak',
    name: 'Nordic Pale Blonde Oak',
    description:
      'Natural pale Scandinavian blonde oak wallboard with vertical fine grain, delivering a warm, bright, and timeless Nordic interior aesthetic.',
    price: 0,
    category: 'Wood Grain',
    color: '#d6c4a8',
    badge: 'Standard Included',
    specDetail: '9mm integrated bamboo-wood-fiber core, Class B1 flame retardant, seamless tongue-and-groove',
  },
  {
    id: 'wood-honey-oak',
    name: 'Warm Honey Golden Oak',
    description:
      'Rich golden honey oak interior wall panels featuring organic cathedral grain patterns and gentle satin sheen.',
    price: 750,
    category: 'Wood Grain',
    color: '#a67b4f',
    badge: 'Warm & Timeless',
    specDetail: 'EIR embossed-in-register surface texture with zero-formaldehyde moisture barrier',
  },
  {
    id: 'wood-rich-teak',
    name: 'Rich Amber Teak & Walnut',
    description:
      'Warm medium-toned teak and American walnut wall panels with deep grain contrast, perfect for high-end boutique living spaces.',
    price: 1100,
    category: 'Wood Grain',
    color: '#754b28',
    badge: 'Mid-Century Luxe',
    specDetail: 'Multi-layer composite rigid core, UV-cured matte finish, Class 33 durability rating',
  },
  {
    id: 'wood-smoked-walnut',
    name: 'Dark Smoked Walnut & Ebony',
    description:
      'Deep smoked espresso walnut and ebony timber wall panels with subtle linear grain, creating dramatic mood and executive luxury.',
    price: 1350,
    category: 'Wood Grain',
    color: '#2b211b',
    badge: 'Boutique Dark',
    specDetail: 'Deep wire-brushed finish with matte anti-scratch polyurethane wear layer',
  },

  // =========================================================================
  // 2. FABRIC ("Soft touch, elegant and cozy")
  // =========================================================================
  {
    id: 'fabric-cream-linen',
    name: 'Ivory Cream Woven Linen',
    description:
      'Finely woven acoustic tactile linen texture in clean ivory cream, offering soft-touch wall finish and cozy minimalist elegance.',
    price: 1200,
    category: 'Fabric',
    color: '#ded8ce',
    badge: 'Soft Touch',
    specDetail: 'Acoustic textile-polymer composite wallboard, stain-shield nano-coating, acoustic dampening',
  },
  {
    id: 'fabric-oatmeal-tweed',
    name: 'Oatmeal Heathered Tweed',
    description:
      'Warm textured heathered oatmeal tweed weave with multi-tonal yarn depth for a relaxed, welcoming residential atmosphere.',
    price: 1350,
    category: 'Fabric',
    color: '#968a78',
    badge: 'Elegant & Cozy',
    specDetail: 'Tactile woven vinyl composite wall panel with integrated sound absorption layer',
  },
  {
    id: 'fabric-charcoal-boucle',
    name: 'Taupe Charcoal Bouclé Weave',
    description:
      'Architectural bouclé looped textile texture in rich charcoal taupe, providing sophisticated visual depth and whisper-quiet acoustic comfort.',
    price: 1500,
    category: 'Fabric',
    color: '#4f4841',
    badge: 'Tactile Warmth',
    specDetail: 'Acoustic fiber core with Sound Transmission Class 62, Class B1 fireproof rating',
  },
  {
    id: 'fabric-midnight-obsidian',
    name: 'Midnight Obsidian Fabric Weave',
    description:
      'Deep midnight black textile weave with intricate tactile micro-relief, blending high-end gallery aesthetic with acoustic luxury.',
    price: 1650,
    category: 'Fabric',
    color: '#1c1c1f',
    badge: 'Acoustic Luxe',
    specDetail: 'Seamless woven acoustic polymer surface with flame-retardant Class A certification',
  },

  // =========================================================================
  // 3. METAL ("Sleek and modern, stylish and luxurious")
  // =========================================================================
  {
    id: 'metal-silver-sand',
    name: 'Silver Sand Anodized Aluminum',
    description:
      'Sleek sandblasted anodized silver aluminum wall panel, offering ultra-clean industrial minimalism and gentle metallic reflectivity.',
    price: 1450,
    category: 'Metal',
    color: '#a1a8b0',
    badge: 'Sleek & Modern',
    specDetail: 'Precision aluminum-faced composite panel with satin anti-fingerprint coating',
  },
  {
    id: 'metal-brushed-steel',
    name: 'Brushed Hairline Stainless Steel',
    description:
      'Directional hairline brushed stainless steel metallic finish reflecting ambient lighting with sleek, aerospace precision.',
    price: 1650,
    category: 'Metal',
    color: '#b8bcc2',
    badge: 'Modern Industrial',
    specDetail: 'Heavy-gauge brushed alloy surface bonded to high-density fireproof core',
  },
  {
    id: 'metal-brushed-bronze',
    name: 'Brushed Bronze & Champagne Gold',
    description:
      'Warm architectural brushed bronze with shimmering champagne gold undertones, imparting boutique hotel luxury to bedroom suites.',
    price: 1850,
    category: 'Metal',
    color: '#7a5a3a',
    badge: 'Stylish Luxury',
    specDetail: 'PVD metallic coat on rigid composite core, extreme abrasion and scratch resistance',
  },
  {
    id: 'metal-matte-obsidian',
    name: 'Matte Obsidian Titanium Metal',
    description:
      'Deep matte black anodized titanium metallic wall panel with silky micro-brushed sheen for sleek, futuristic luxury.',
    price: 1950,
    category: 'Metal',
    color: '#181b1f',
    badge: 'Dark Titanium',
    specDetail: 'High-tech nano-ceramic coated metallic composite, moisture and stain proof',
  },

  // =========================================================================
  // 4. MARBLE/ROCK ("Natural stone look, bold and impressive")
  // =========================================================================
  {
    id: 'stone-calacatta-white',
    name: 'Calacatta White Veined Marble',
    description:
      'Luminous pure white Italian marble wallboard with bold, flowing charcoal and grey dramatic veins and diamond gloss glaze.',
    price: 1750,
    category: 'Marble/Rock',
    color: '#f1f4f8',
    badge: 'Bold & Impressive',
    specDetail: '3.0mm stone plastic composite (SPC) marble slab with mirror UV coating and Class A fire rating',
  },
  {
    id: 'stone-grey-slate',
    name: 'Textured Silver Grey Slate Rock',
    description:
      'Organic cleft slate rock with layered mineral textures and matte earthen tactile topography for mountain cabin aesthetics.',
    price: 1550,
    category: 'Marble/Rock',
    color: '#8a8d91',
    badge: 'Natural Stone',
    specDetail: 'Deeply textured natural slate relief on heavy mineral composite core',
  },
  {
    id: 'stone-nero-marquina',
    name: 'Nero Marquina Black Marble',
    description:
      'Dramatic Spanish Nero Marquina black marble wall panel with striking, crisp white lightning veining.',
    price: 1950,
    category: 'Marble/Rock',
    color: '#14171c',
    badge: 'Striking Luxury',
    specDetail: 'Ultra-durable polished porcelain stone composite with high-gloss wear glaze',
  },
  {
    id: 'stone-golden-sahara',
    name: 'Golden Sahara Calacatta Marble',
    description:
      'Warm creamy ivory marble base adorned with dynamic caramel and honey-gold architectural veining.',
    price: 1850,
    category: 'Marble/Rock',
    color: '#f5edd6',
    badge: 'Warm Marble',
    specDetail: 'Large-format rectified porcelain composite wall slab with satin polish glaze',
  },

  // =========================================================================
  // 5. MIRROR ("Reflective beauty, expand the space")
  // =========================================================================
  {
    id: 'mirror-silver-chrome',
    name: 'Silver Chrome Reflective Mirror',
    description:
      'High-specular liquid silver mirror finish that reflects interior lighting and surroundings to dramatically expand spatial perception.',
    price: 2100,
    category: 'Mirror',
    color: '#c8d1db',
    badge: 'Expand Space',
    specDetail: 'Multi-layer scratch-resistant optical mirror acrylic with anti-shatter backing',
  },
  {
    id: 'mirror-polished-gold',
    name: 'Polished Imperial Gold Mirror',
    description:
      'Gleaming polished gold mirror finish casting warm amber reflections across the living lounge and bedroom suites.',
    price: 2300,
    category: 'Mirror',
    color: '#c9963f',
    badge: 'Reflective Beauty',
    specDetail: 'PVD gold mirror reflective coating with diamond-hard scratch-resistant topcoat',
  },
  {
    id: 'mirror-smoked-bronze',
    name: 'Smoked Amber Bronze Mirror',
    description:
      'Moody smoked bronze reflective mirror surface offering subtle, sophisticated reflections with deep amber warmth.',
    price: 2200,
    category: 'Mirror',
    color: '#6e4c2c',
    badge: 'Smoked Luxe',
    specDetail: 'Toned architectural mirror surface with safety laminate and impact protection',
  },
  {
    id: 'mirror-piano-black',
    name: 'Piano Black Obsidian Mirror',
    description:
      'Flawless ultra-high-gloss piano black mirror surface producing mirror-sharp specular reflections and boundless spatial depth.',
    price: 2150,
    category: 'Mirror',
    color: '#0a0b0d',
    badge: 'High-Gloss Mirror',
    specDetail: 'Liquid-poured optical polymer mirror with self-healing anti-scratch surface',
  },

  // =========================================================================
  // 6. WATER RIPPLE ("Unique ripple effect, artistic and dynamic")
  // =========================================================================
  {
    id: 'ripple-silver-fluid',
    name: 'Silver Fluid Water Ripple',
    description:
      'Artistic hammered fluid silver water ripple metallic finish, creating flowing liquid light reflections under interior spotlights.',
    price: 2400,
    category: 'Water Ripple',
    color: '#cfd8e3',
    badge: 'Dynamic Ripple',
    specDetail: '3D embossed stamped stainless steel ripple sheet bonded to structural wall core',
  },
  {
    id: 'ripple-titanium-grey',
    name: 'Titanium Grey Water Ripple',
    description:
      'Smoky titanium grey hammered metal with rhythmic fluid wave undulations for avant-garde architectural style.',
    price: 2500,
    category: 'Water Ripple',
    color: '#7a828c',
    badge: 'Artistic & Dynamic',
    specDetail: 'Micro-hammered titanium alloy surface with specular caustic light diffusion',
  },
  {
    id: 'ripple-amber-bronze',
    name: 'Amber Bronze Water Ripple',
    description:
      'Warm golden amber liquid water ripple finish evoking shimmering sunlit water across the bedroom and lounge walls.',
    price: 2600,
    category: 'Water Ripple',
    color: '#6e4e2e',
    badge: 'Liquid Gold',
    specDetail: 'Embossed champagne bronze metal composite with dynamic caustic illumination effect',
  },
  {
    id: 'ripple-midnight-black',
    name: 'Midnight Black Water Ripple',
    description:
      'Dramatic midnight black hammered water ripple surface with subtle specular crests, like moonlight over deep water.',
    price: 2700,
    category: 'Water Ripple',
    color: '#121417',
    badge: 'Obsidian Liquid',
    specDetail: 'Deep-draw stamped black titanium alloy with liquid crystal protective coating',
  },

  // Legacy / Factory Standard Fallback
  {
    id: 'bamboo-charcoal-offwhite',
    name: 'Bamboo Charcoal Wood Fiber Integrated Wallboard',
    description:
      'Standard architectural bamboo charcoal wood-fiber composite integrated wall panel in crisp off-white with micro V-groove joints. Class B1 fireproof, waterproof, zero formaldehyde.',
    price: 0,
    category: 'Wood Grain',
    color: '#f8fafc',
    badge: 'Factory Standard',
    specDetail: '9mm multi-hollow bamboo charcoal fiber core, Class B1 flame retardant, seamless tongue-and-groove',
  },
];

// =========================================================================
// 2. WINDOWS & ENTRANCE DOORS
// =========================================================================
export const GLAZING_OPTIONS: CustomizationOptionItem<GlazingId>[] = [
  // --- Windows (Top Row) ---
  {
    id: 'casement-window',
    name: 'Casement window',
    description:
      'Outward-opening side-hinged casement window with dual sashes, broken bridge aluminum frame, multi-point lock lever handle, and argon-filled Low-E double glazing.',
    price: 650,
    category: 'Windows',
    color: '#2b303a',
    badge: 'Side Opening',
    specDetail: 'Dual casement sash with 304 stainless friction hinges, EPDM compression seals, multi-point handle',
  },
  {
    id: 'sliding-window',
    name: 'Sliding window',
    description:
      'Dual-track horizontal sliding window with precision whisper-quiet rollers, interlocking meeting rail, flush latches, and Low-E tempered double glazing.',
    price: 0,
    category: 'Windows',
    color: '#2b303a',
    badge: 'Standard Window',
    specDetail: 'Twin nylon tandem rollers, concealed drain channels, anti-lift interlock, dual Low-E panes',
  },
  {
    id: 'tophanging-window',
    name: 'Tophanging window',
    description:
      'Top-hung awning window pivoting outward from the bottom. Engineered to allow refreshing ventilation during rain without permitting water intrusion.',
    price: 750,
    category: 'Windows',
    color: '#2b303a',
    badge: 'Rain Deflecting',
    specDetail: 'Top scissor friction hinges, perimeter drip channel, positive multi-point latching',
  },
  {
    id: 'overhanging-window',
    name: 'Overhanging window',
    description:
      'Bottom-hung hopper window that tilts open inward or outward from the top. Directs incoming airflow upward to eliminate floor drafts while maintaining high security.',
    price: 750,
    category: 'Windows',
    color: '#2b303a',
    badge: 'Draft-Free Hopper',
    specDetail: 'Reinforced bottom pivot track, multi-position stay arm, dual compression lever lock',
  },

  // --- Doors (Bottom Row) ---
  {
    id: 'broken-bridge-sliding-door',
    name: 'Broken bridge aluminum sliding door',
    description:
      'Wide-aperture 1880×2220mm two-panel sliding glass entrance door with heavy-duty stainless steel ball-bearing rollers and thermal break profile.',
    price: 0,
    category: 'Entrance Doors',
    color: '#2b303a',
    badge: 'Standard Door',
    specDetail: '1880×2220mm broken-bridge aluminum profile, double Low-E tempered glass, multi-point lock',
  },
  {
    id: 'broken-bridge-double-door',
    name: 'Broken bridge aluminum double door',
    description:
      'Grand French-style dual swinging glass doors with concealed European heavy-duty hinges, dual lever handles, and acoustic thermal-break frame.',
    price: 1450,
    category: 'Entrance Doors',
    color: '#2b303a',
    badge: 'French Double Door',
    specDetail: 'Dual outward/inward swing, 3-point latching mechanism, flush rebate center astragal',
  },
  {
    id: 'aluminum-alloy-double-door',
    name: 'Aluminum alloy double door',
    description:
      'Crisp clean white aluminum alloy double swing doors featuring architectural divided lite grille mullions, center pull handles, and reinforced subframe.',
    price: 1650,
    category: 'Entrance Doors',
    color: '#f8fafc',
    badge: 'White Lite Mullions',
    specDetail: 'Pure white powder-coat finish (RAL 9016), decorative muntin bars, stainless deadbolt lockset',
  },
  {
    id: 'kfc-double-door',
    name: 'KFC double door',
    description:
      'Commercial heavy-duty high-traffic double swing doors with concealed overhead door closers, floor springs, and full-length vertical tubular push-pull handles.',
    price: 1850,
    category: 'Entrance Doors',
    color: '#2b303a',
    badge: 'Commercial Heavy-Duty',
    specDetail: 'Reinforced thick-wall aluminum extrusion, 304 stainless continuous tubular handles, auto-closing dampers',
  },
  {
    id: 'broken-bridge-grille-door',
    name: 'Broken Bridge Entrance Door Grille',
    description:
      'High-security white broken-bridge aluminum entrance door with internal vertical architectural grilles built inside the double-glazed safety glass.',
    price: 1950,
    category: 'Entrance Doors',
    color: '#ffffff',
    badge: 'Security & Style',
    specDetail: 'Internal aluminum security grille bars, 5-point mortise security lock, thermal-break frame',
  },
  {
    id: 'privacy-smart-glass',
    name: 'PDLC Panoramic Switchable Smart Glass',
    description:
      'Electrochromic PDLC smart film laminated between glass layers. Transitions from crystal clear to frosted privacy via wall switch, app, or remote.',
    price: 4900,
    category: 'Smart Glass',
    color: '#e2e8f0',
    badge: 'Smart Privacy',
    specDetail: 'Polymer Dispersed Liquid Crystal interlayer, <100ms response, 99% UV block',
  },
];

// =========================================================================
// 3. ROOFS, OUTDOOR TERRACES & BALCONIES (Page 29, 38)
// =========================================================================
export const ROOF_OPTIONS: CustomizationOptionItem<RoofOptionId>[] = [
  {
    id: 'standard-parapet',
    name: 'Standard Integrated Parapet Flat Roof',
    description:
      'Aerodynamic concealed drainage flat roof with seamless waterproof SBS membrane and perimeter wind deflector cap.',
    price: 0,
    category: 'Roof & Structure',
    badge: 'Standard',
    specDetail: 'Galvanized roof trusses, multi-layer thermal insulation, 120kg/m² load',
  },
  {
    id: 'pitched-roof',
    name: 'Pitched Gable Roof with Thermal Air Gap',
    description:
      'Steep pitched roof engineered for fast water and snow runoff. Creates a cooling convective air gap for superior summer insulation.',
    price: 1850,
    category: 'Roof & Structure',
    badge: 'All-Weather',
    specDetail: 'Color steel roof sheets over triangular galvanized trusses with ridge cap and eaves',
  },
  {
    id: 'rooftop-terrace-deck',
    name: 'Walkable Rooftop Terrace & Staircase (18.7 m² Observation Deck)',
    description:
      'Walkable rooftop observation deck with perimeter aluminum safety balustrade, outdoor composite wood decking, and external steel staircase.',
    price: 4600,
    category: 'Outdoor Terrace',
    badge: 'Resort Living',
    specDetail: 'Reinforced 300kg/m² live load frame, 42-inch safety guard, exterior steel stair flight',
  },
  {
    id: 'pitched-terrace-combo',
    name: 'Pitched Roof + Front Walkable Terrace Combo',
    description:
      'The ultimate architectural combination: reliable pitched roof weather protection over the cabin plus an extended outdoor terrace deck.',
    price: 5900,
    category: 'Outdoor Terrace',
    badge: 'Ultimate Combo',
    specDetail: 'Pitched gable roof structure coupled with composite outdoor lounge platform and railings',
  },
  {
    id: 'solar-array-3kw',
    name: '3.2 kW Bifacial Rooftop Solar Array',
    description:
      'High-efficiency monocrystalline solar panels with microinverters mounted to roof rails, generating clean off-grid power.',
    price: 5400,
    category: 'Clean Energy',
    badge: 'Solar Power',
    specDetail: '8x 400W Tier-1 bifacial panels, Enphase microinverters, app production monitoring',
  },
  {
    id: 'solar-deck-combo',
    name: 'Solar Pergola Canopy + Walkable Rooftop Deck',
    description:
      'Elevated solar pergola structure providing both clean energy harvesting and shaded rooftop lounge seating below.',
    price: 8900,
    category: 'Clean Energy',
    badge: 'Solar Lounge',
    specDetail: 'Integrated 3.2kW solar canopy + 140 sq ft composite walking deck',
  },
];

// =========================================================================
// 4. FLOORING COLLECTIONS - 6 Collections, 24 Material Finishes
// =========================================================================
export const FLOORING_OPTIONS: CustomizationOptionItem<FlooringId>[] = [
  // =========================================================================
  // 1. WOOD GRAIN ("Natural wood look, warm and timeless")
  // =========================================================================
  {
    id: 'wood-nordic-pale-oak',
    name: 'Nordic Pale Oak',
    description:
      'Natural pale Scandinavian blonde oak with fine vertical grain, delivering a warm, bright, and timeless Nordic interior aesthetic.',
    price: 0,
    category: 'Wood Grain',
    color: '#d8c5aa',
    badge: 'Standard / Included',
    specDetail: '6.0mm rigid core SPC with 20mil commercial wear layer and IXPE sound-dampening backing',
  },
  {
    id: 'wood-honey-oak',
    name: 'Warm Honey Oak',
    description:
      'Rich golden honey oak timber planks featuring organic cathedral grain patterns and gentle satin sheen.',
    price: 750,
    category: 'Wood Grain',
    color: '#a97d52',
    badge: 'Warm & Timeless',
    specDetail: 'EIR embossed-in-register surface texture with micro-beveled acoustic planks',
  },
  {
    id: 'wood-rich-teak',
    name: 'Rich Amber Teak',
    description:
      'Warm medium-toned teak and American walnut planks with deep grain contrast, perfect for high-end boutique living.',
    price: 1100,
    category: 'Wood Grain',
    color: '#784d2a',
    badge: 'Mid-Century Luxe',
    specDetail: 'Multi-layer composite rigid core, UV-cured ceramic bead finish, Class 33 commercial rating',
  },
  {
    id: 'wood-smoked-walnut',
    name: 'Dark Smoked Walnut',
    description:
      'Deep smoked espresso walnut and ebony timber with subtle linear grain, creating dramatic mood and executive luxury.',
    price: 1350,
    category: 'Wood Grain',
    color: '#31231c',
    badge: 'Smoked Luxe',
    specDetail: 'Deep wire-brushed finish with matte anti-scratch polyurethane wear layer',
  },

  // =========================================================================
  // 2. STONE GRAIN ("Realistic stone texture, durable and elegant")
  // =========================================================================
  {
    id: 'stone-pearl-white',
    name: 'Pearl White Stone',
    description:
      'Light pearl limestone texture with delicate mineral grain, soft micro-fossil variations, and durable wear resistance.',
    price: 950,
    category: 'Stone Grain',
    color: '#dededc',
    badge: 'Natural Stone',
    specDetail: 'Realistic stone embossed texture, 6.0mm stone plastic composite, 100% waterproof',
  },
  {
    id: 'stone-mist-grey',
    name: 'Mist Grey Slate',
    description:
      'Balanced neutral mist grey stone texture with fine organic cleft relief, offering durable and elegant residential style.',
    price: 1150,
    category: 'Stone Grain',
    color: '#9a9c9b',
    badge: 'Durable & Elegant',
    specDetail: 'Textured natural slate relief on heavy mineral composite core, R10 anti-slip',
  },
  {
    id: 'stone-basalt-charcoal',
    name: 'Basalt Charcoal Stone',
    description:
      'Dark volcanic basalt charcoal stone with fine mineral fissures and micro-textured matte surface for refined warmth.',
    price: 1350,
    category: 'Stone Grain',
    color: '#585959',
    badge: 'Basalt Rock',
    specDetail: 'High-density mineral core, matte scratch-resistant polyurethane finish',
  },
  {
    id: 'stone-midnight-granite',
    name: 'Midnight Nero Granite',
    description:
      'Deep midnight granite with dark graphite crystallization and subtle organic veining for bold architectural contrast.',
    price: 1500,
    category: 'Stone Grain',
    color: '#2c2e30',
    badge: 'Deep Mineral',
    specDetail: 'Commercial heavy-traffic wear layer, sound-absorbing IXPE acoustic underlayment',
  },

  // =========================================================================
  // 3. MARBLE GRAIN ("Luxury marble look, refined and stylish")
  // =========================================================================
  {
    id: 'marble-calacatta-white',
    name: 'Calacatta White Marble',
    description:
      'Luminous pure white Italian marble featuring soft flowing grey dramatic veins and refined high-end residential presence.',
    price: 1450,
    category: 'Marble Grain',
    color: '#f3f4f6',
    badge: 'Luxury Marble',
    specDetail: 'Large format rectified luxury vinyl marble slab with high-clarity wear layer',
  },
  {
    id: 'marble-carrara-silver',
    name: 'Carrara Silver Marble',
    description:
      'Classic Carrara silver marble with delicate cloudy feathered veining, offering refined and stylish European elegance.',
    price: 1550,
    category: 'Marble Grain',
    color: '#cfd3d8',
    badge: 'Refined & Stylish',
    specDetail: 'Satin gloss protective glaze, stain-shield nano-coating, 100% waterproof',
  },
  {
    id: 'marble-nero-marquina',
    name: 'Nero Marquina Black Marble',
    description:
      'Dramatic Spanish Nero Marquina black marble with high-contrast striking white lightning veins for sophisticated luxury.',
    price: 1850,
    category: 'Marble Grain',
    color: '#16181c',
    badge: 'Striking Luxury',
    specDetail: 'Ultra-durable polished stone composite tile with high-definition mineral print',
  },
  {
    id: 'marble-golden-vein',
    name: 'Imperial Gold Vein Marble',
    description:
      'Warm creamy ivory marble base adorned with dynamic honey-gold and caramel architectural veining for a bespoke luxury ambiance.',
    price: 1750,
    category: 'Marble Grain',
    color: '#f6f1e5',
    badge: 'Gold Luxury',
    specDetail: 'Rectified luxury tile with subtle amber mica highlights and satin wear layer',
  },

  // =========================================================================
  // 4. SOLID COLOR ("Pure and clean surface, simple and modern")
  // =========================================================================
  {
    id: 'solid-pure-white',
    name: 'Pure Minimalist White',
    description:
      'Pure, immaculate white seamless matte surface, creating an expansive, ultra-bright architectural gallery floor.',
    price: 650,
    category: 'Solid Color',
    color: '#fafafa',
    badge: 'Pure & Clean',
    specDetail: 'Uniform solid color composite with anti-stain matte UV fluorocarbon topcoat',
  },
  {
    id: 'solid-warm-cream',
    name: 'Warm Sand Cream',
    description:
      'Gentle warm sand and ivory cream solid surface that harmonizes softly with light natural timber and soft textiles.',
    price: 750,
    category: 'Solid Color',
    color: '#ded4c5',
    badge: 'Soft Neutral',
    specDetail: 'Micro-textured satin solid surface, warm underfoot touch, sound-dampening core',
  },
  {
    id: 'solid-light-grey',
    name: 'Architectural Slate Grey',
    description:
      'Modern architectural mid-tone grey with uniform satin surface, offering simple, modern, and versatile sophistication.',
    price: 850,
    category: 'Solid Color',
    color: '#a9acad',
    badge: 'Simple & Modern',
    specDetail: 'Commercial grade solid wear surface, Class B1 fire rated, zero VOC emissions',
  },
  {
    id: 'solid-charcoal-anthracite',
    name: 'Dark Graphite Anthracite',
    description:
      'Deep matte charcoal anthracite solid surface delivering clean monochrome contrast to bright minimalist walls.',
    price: 950,
    category: 'Solid Color',
    color: '#3a3d40',
    badge: 'Monochrome',
    specDetail: 'Heavy-traffic scratch-shield coating with integrated thermal barrier',
  },

  // =========================================================================
  // 5. CEMENT LOOK ("Industrial cement style, modern and versatile")
  // =========================================================================
  {
    id: 'cement-chalk-white',
    name: 'Chalk White Concrete',
    description:
      'Light polished chalk cement screed with soft artisan trowel variations and subtle industrial modern warmth.',
    price: 1050,
    category: 'Cement Look',
    color: '#e2e2e0',
    badge: 'Polished Screed',
    specDetail: 'Micro-cement replica with natural trowel movement and matte urethane sealant',
  },
  {
    id: 'cement-urban-grey',
    name: 'Urban Concrete Grey',
    description:
      'Classic raw urban concrete screed with authentic micro-aggregate texture and contemporary loft character.',
    price: 1250,
    category: 'Cement Look',
    color: '#9a9a99',
    badge: 'Modern & Versatile',
    specDetail: 'Textured industrial cement composite plank with sound-deadening cork underlay',
  },
  {
    id: 'cement-cast-slate',
    name: 'Cast Industrial Slate',
    description:
      'Deep industrial cast concrete slate with textured mineral clouding and subtle artisanal burnished sheen.',
    price: 1350,
    category: 'Cement Look',
    color: '#636465',
    badge: 'Industrial Style',
    specDetail: 'Heavy-duty industrial wear layer with authentic concrete surface relief',
  },
  {
    id: 'cement-dark-obsidian',
    name: 'Dark Obsidian Cement',
    description:
      'Dark moody charcoal industrial cement screed with deep matte finish for edgy contemporary architecture.',
    price: 1450,
    category: 'Cement Look',
    color: '#353738',
    badge: 'Dark Industrial',
    specDetail: 'Abrasion-resistant industrial composite with seamless joint aesthetic',
  },

  // =========================================================================
  // 6. PATTERNED ("Creative patterns, unique and artistic")
  // =========================================================================
  {
    id: 'pattern-floral-encaustic',
    name: 'Floral Star Encaustic Tile',
    description:
      'Soft neutral greige and cream geometric floral star encaustic motif, imparting vintage Mediterranean creative charm.',
    price: 1650,
    category: 'Patterned',
    color: '#d8d2c7',
    badge: 'Creative Pattern',
    specDetail: 'Precision patterned encaustic tile composite with stain-proof matte glaze',
  },
  {
    id: 'pattern-botanical-rosette',
    name: 'Botanical Rosette Encaustic',
    description:
      'Classic black and ivory botanical rosette tile pattern with delicate floral star medallions, unique and artistic.',
    price: 1800,
    category: 'Patterned',
    color: '#f1ede4',
    badge: 'Unique & Artistic',
    specDetail: 'High-definition Victorian encaustic geometric reproduction with non-slip R10 rating',
  },
  {
    id: 'pattern-chevron-parquet',
    name: 'Chevron Oak Parquet',
    description:
      'Warm golden oak wood planks laid in a classic geometric chevron / herringbone parquet pattern with natural depth.',
    price: 1950,
    category: 'Patterned',
    color: '#a87848',
    badge: 'Heritage Parquet',
    specDetail: 'French chevron parquet wood composite with authentic micro-beveled plank seams',
  },
  {
    id: 'pattern-geometric-trellis',
    name: 'Moroccan Geometric Trellis',
    description:
      'Bold black geometric quatrefoil crosses and diamond trellis motif on crisp off-white ceramic field.',
    price: 1850,
    category: 'Patterned',
    color: '#f7f6f2',
    badge: 'Moroccan Trellis',
    specDetail: 'Artistic geometric artisan tile with UV-cured scratch resistant shield',
  },
];

// =========================================================================
// 5. LIGHTING & ELECTRICAL SYSTEMS
// =========================================================================
export const LIGHTING_OPTIONS: CustomizationOptionItem<LightingPackageId>[] = [
  {
    id: 'standard-recessed',
    name: 'Architectural Recessed LED Downlights',
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
    badge: 'Ambient Glow',
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
    name: 'Pre-Wired 100A Factory Service Center',
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

// =========================================================================
// 6. CABINETRY FINISHES
// =========================================================================
export const CABINETRY_OPTIONS: CustomizationOptionItem<CabinetryId>[] = [
  {
    id: 'matte-black',
    name: 'Matte Black Soft-Touch',
    description: 'Anti-fingerprint matte black Euro-style cabinets with integrated concealed J-pulls.',
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

// =========================================================================
// 7. ACCESSORIES, HOME FURNISHINGS & SMART LIVING (Page 28, 44, 70)
// =========================================================================
export const MODULAR_ADDONS: AddonOptionItem[] = [
  // --- Factory Turnkey Modules & Furnishings (Page 28) ---
  {
    id: 'hasLuxuryBathPod',
    name: 'Integrated Waterproof Bath Pod',
    description:
      'Factory pre-molded seamless bathroom pod. Includes frameless glass shower with rainfall head, ceramic toilet, floating vanity cabinet with LED backlit mirror, and odorless floor drain.',
    price: 6400,
    category: 'Interior Modules',
    specDetail: 'Fiberglass waterproof shell, PEX hot/cold supply manifolds, odorless P-trap assembly',
  },
  {
    id: 'hasKitchenetteModule',
    name: 'L-Shaped Modular Kitchen Cabinet',
    description:
      'L-shaped quartz countertop with integrated under-mount stainless sink, pull-out faucet, 2-burner induction cooktop, soft-close Euro cabinetry, and under-counter refrigerator space.',
    price: 5800,
    category: 'Interior Modules',
    specDetail: 'Pre-plumbed PEX water lines, drain manifold, dedicated 30A appliance branch circuit',
  },
  {
    id: 'hasLuxuryBedSuite',
    name: 'Architectural Sleeping Suite',
    description:
      'Designer-curated sleeping suite with a floating cantilevered timber platform, luxury memory-foam hybrid mattress, quilted folded duvet, and integrated bedside nightstands.',
    price: 3500,
    category: 'Home Furnishings',
    specDetail: 'Floating plinth base, 12-inch memory foam hybrid mattress, linen bedding, reading sconces',
  },
  {
    id: 'hasLivingSofa',
    name: 'Designer Living Room Sofa Suite',
    description:
      'Contemporary low-profile modular living sofa in durable stain-resistant textured fabric with high-density foam cushions and black steel legs.',
    price: 1450,
    category: 'Home Furnishings',
    specDetail: '3-seater Scandinavian design, 2100mm wide, stain-resistant polyester blend upholstery',
  },
  {
    id: 'hasWardrobe',
    name: 'Custom Fitted Bedroom Wardrobe Suite',
    description:
      'Optional modular floor-to-ceiling wardrobes with integrated clothes hanging rails, shelves, soft-close drawers, and integrated LED lighting for private bedrooms.',
    price: 1250,
    category: 'Home Furnishings',
    specDetail: 'E0 eco-grade board, 1200×520×2220mm, damping hinges and aluminum hanging rod',
  },
  {
    id: 'hasTvConsole',
    name: 'Television & Floating Media Console',
    description:
      'Wall-mounted 50-inch 4K Smart TV paired with a minimalist floating timber entertainment console with concealed cable management.',
    price: 950,
    category: 'Home Furnishings',
    specDetail: '50" 4K HDR Smart TV with HDMI hub + 1800mm floating storage credenza',
  },
  {
    id: 'hasHvacMiniSplit',
    name: 'Ultra-Quiet Inverter Mini-Split HVAC',
    description:
      'High-efficiency heat pump providing whisper-quiet heating and air conditioning down to -15°F (-26°C), with smart WiFi mobile app control.',
    price: 3200,
    category: 'Climate & Comfort',
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

  // --- Smart Living & AI Intelligence System (Page 44, 70) ---
  {
    id: 'hasSmartControlPanel',
    name: '01 Intelligent Central Control Panel',
    description:
      'Central in-wall capacitive glass touchscreen panel controlling all room lights, climate, motorized curtains, scenes, and music from a single unified hub.',
    price: 750,
    category: 'Smart Living',
    specDetail: '10.1-inch IPS high-resolution touchscreen, Zigbee/Matter gateway, voice command support',
  },
  {
    id: 'hasSoundSystem',
    name: '02 Integrated Bluetooth Hi-Fi Sound System',
    description:
      'Ceiling-recessed high-fidelity stereo speakers with built-in Bluetooth 5.2 amplifier, delivering rich acoustic surround sound throughout the cabin.',
    price: 850,
    category: 'Smart Living',
    specDetail: 'Dual 6.5-inch 80W kevlar cone ceiling speakers, Class-D digital amplifier, optical/aux in',
  },
  {
    id: 'hasBreakfastBar',
    name: '05 Modern Breakfast Bar / Island Counter',
    description:
      'Cantilevered waterfall quartz dining island counter with integrated 110V/220V pop-up power tower and seating for 2–3 barstools.',
    price: 1100,
    category: 'Interior Modules',
    specDetail: 'Solid quartz slab top with metal support frame, 1400×500×900mm',
  },
  {
    id: 'hasFreshAirSystem',
    name: '10 Fresh-Air Ventilation System with Heat Recovery',
    description:
      'Continuous balanced positive-pressure fresh air filtration system with HEPA H13 filters and sensible heat exchange, ensuring purified indoor air 24/7.',
    price: 1650,
    category: 'Climate & Comfort',
    specDetail: '150 m³/h capacity, PM2.5 filtration efficiency >99%, silent dual-centrifugal motor (<28dB)',
  },
  {
    id: 'hasElectricBlinds',
    name: '09 Motorized Automatic Curtains / Electric Blinds',
    description:
      'Motorized floor-to-ceiling drapery track for all panoramic glass walls. Whisper-drive motor with remote, wall switch, and smart schedule integration.',
    price: 1850,
    category: 'Smart Living',
    specDetail: 'Rechargeable lithium battery motorized track, ultra-quiet drive (<30dB), app timing presets',
  },
  {
    id: 'hasUnderfloorHeating',
    name: '12 Electric Underfloor Radiant Heating',
    description:
      'Ultra-thin carbon crystal underfloor radiant heating mats installed beneath the SPC flooring. Provides gentle, even warmth with digital room thermostat.',
    price: 2200,
    category: 'Climate & Comfort',
    specDetail: 'Far-infrared carbon crystal heating film (180W/m²), dual temperature sensor thermostat',
  },
  {
    id: 'hasSkylight',
    name: '13 Starry Starlight Skylight with Motorized Blind',
    description:
      'Ceiling panoramic tempered glass skylight with motorized electric blackout shade. View the night stars and clouds directly from bed.',
    price: 2450,
    category: 'Smart Living',
    specDetail: '1000×800mm tempered laminated double glass, rain-sensor auto-close, motorized honeycomb blind',
  },
  {
    id: 'hasProjectionScreen',
    name: '14 Automatic Drop-Down Projection Screen / Home Cinema',
    description:
      'Ceiling-recessed motorized 100-inch ambient light rejecting (ALR) projector screen that drops down automatically at the touch of a button.',
    price: 1350,
    category: 'Smart Living',
    specDetail: '100-inch 16:9 motorized tensioned ALR screen, tubular quiet motor, wireless remote sync',
  },
  {
    id: 'hasSmartDoorLock',
    name: 'Biometric Smart Access Control Door Lock',
    description:
      'Commercial-grade broken bridge entry lock with semiconductor fingerprint sensor, digital anti-peep keypad, RFID keycard, and mobile app unlocking.',
    price: 950,
    category: 'Smart Living',
    specDetail: 'Multi-point deadbolt locking mechanism with tamper alarm, backup mechanical keys',
  },
  {
    id: 'hasBioDigester',
    name: 'Advanced Off-Grid Aerobic Bio-Digester Unit',
    description:
      'Self-contained, odorless aerobic bio-digester unit for complete blackwater and greywater processing. Ideal for off-grid and remote glamping sites.',
    price: 4500,
    category: 'Utilities & Off-Grid',
    specDetail: 'Tri-chamber polyethylene tank, aerator pump (110V/15W), active carbon filter stack',
  },
];

// =========================================================================
// 8. DOUBLE-WING EXPANDABLE HOUSE FLOOR PLANS ("CUSTOMIZE YOUR LAYOUT")
// Space Planning for the Way You Live (20FT, 30FT, 40FT Exclusive)
// =========================================================================
export const FLOOR_PLAN_OPTIONS: FloorPlanOption[] = [
  {
    id: '2-bed-1-bath',
    name: '2 Bedrooms, 1 Restroom, 1 Living Room',
    tagline: 'Executive Family Suite - Master & Guest Wing',
    bedrooms: 2,
    bathrooms: 1,
    livingRooms: 1,
    description:
      'Two private bedrooms along the right wing with a full left-wing living lounge featuring a 3-seater sofa, coffee table, rug, media console, and corner kitchenette.',
    price: 0,
    badge: 'Standard Included',
    recommendedFor: 'Couples, small families, and vacation guest houses',
    features: [
      '2 Private Right-Wing Bedrooms (Queen + Full)',
      'Full Left-Wing Living Lounge & TV Zone',
      'Plumbed Central Bathroom Pod in Transport Spine',
      'Corner Kitchenette & Prep Counter',
      'Spacious Central Corridor & Dining Nook',
    ],
  },
  {
    id: '3-bed-split-1-bath',
    name: '3 Bedrooms, 1 Restroom, 1 Living Room',
    tagline: 'Dual-Wing Split Layout - Maximum Bedroom Utility',
    bedrooms: 3,
    bathrooms: 1,
    livingRooms: 1,
    description:
      'Three private bedrooms separated across both wings (Bedroom 1 at front-left, Bedrooms 2 & 3 on the right wing), with top-left kitchenette and central living corridor.',
    price: 1200,
    badge: 'Popular 3-Bed',
    recommendedFor: 'Families with children, co-living, and rental properties',
    features: [
      '3 Separate Enclosed Bedrooms with Private Doors',
      'Split Wing Privacy Layout (Left & Right Wings)',
      'Top-Left Kitchen & Refrigerator Nook',
      'Direct Central Restroom Pod Access',
      'Optimized Sleeping Capacity (Up to 6 guests)',
    ],
  },
  {
    id: '3-bed-kitchen-lounge',
    name: '3 Bedrooms, 1 Restroom, 1 Living Room',
    tagline: 'Lounge Suite - Peninsula Kitchen & Living Area',
    bedrooms: 3,
    bathrooms: 1,
    livingRooms: 1,
    description:
      'Three bedrooms with Bedroom 1 at rear-left, Bedrooms 2 & 3 on right wing, and an architectural kitchen counter divider creating an intimate front-left living room lounge.',
    price: 1400,
    badge: 'Architectural Split',
    recommendedFor: 'Modern family living with dedicated socializing space',
    features: [
      '3 Private Bedrooms (1 Rear-Left + 2 Right-Wing)',
      'Integrated Peninsula Counter Divider Wall',
      'Front-Left Intimate Living Lounge with Sofa & Table',
      'Rear-Left Private Quiet Bedroom Suite',
      'Convenient Central Bath Access',
    ],
  },
  {
    id: '1-bed-grand-dining',
    name: '1 Bedroom, 1 Restroom, 1 Living Room',
    tagline: "Grand Dining & Entertainer's Great Room",
    bedrooms: 1,
    bathrooms: 1,
    livingRooms: 1,
    description:
      'A luxurious open-concept layout with a single expansive master bedroom suite at rear-right, dedicating the entire core and left wing to an 8-person banquet dining table and entertaining lounge.',
    price: 850,
    badge: 'Entertainer Suite',
    recommendedFor: 'Hosts, executive retreats, clubhouses, and luxury singles/couples',
    features: [
      'Expansive Open-Concept Great Room Lounge',
      'Full 8-Person Banquet Dining Table & Chairs',
      'Private Rear-Right Master Bedroom Retreat',
      'Gourmet Wall Kitchenette & Prep Counter',
      'Unobstructed Panoramic Sightlines',
    ],
  },
  {
    id: '1-bed-studio-suite',
    name: '1 Bedroom, 1 Restroom, 1 Living Room',
    tagline: 'Studio Kitchen & Dedicated Workstation Suite',
    bedrooms: 1,
    bathrooms: 1,
    livingRooms: 1,
    description:
      "Generous master bedroom occupying the right wing with private study desk and wardrobe, paired with a full chef's kitchen at top-left, 4-person dining table, and cozy living zone.",
    price: 650,
    badge: 'Executive Worksuite',
    recommendedFor: 'Remote professionals, long-term residential living, and studio creators',
    features: [
      'Executive Master Bedroom + Integrated Work Desk',
      "Complete Chef Kitchen & Long Prep Counter",
      'Dedicated 4-Person Dining Nook',
      'Media Credenza & Entertainment Center',
      'Seamless Open-Plan Circulation Flow',
    ],
  },
  {
    id: '4-bed-quad-suite',
    name: '4 Bedrooms, 1 Restroom',
    tagline: 'Quad Suite - Maximum Sleeping Capacity',
    bedrooms: 4,
    bathrooms: 1,
    livingRooms: 0,
    description:
      'Four symmetrically enclosed private bedrooms (2 in left wing, 2 in right wing) accessed via a central spine hallway with direct access to the central restroom. Perfect for worker housing or glamping dorms.',
    price: 1800,
    badge: 'Max Occupancy (4 Bed)',
    recommendedFor: 'Workforce accommodation, mining/agri camps, retreat lodges, and rental yield',
    features: [
      '4 Fully Independent Private Enclosed Bedrooms',
      'Symmetrical Quad-Wing Enclosures (2 Left + 2 Right)',
      'High-Density Sleeping (Accommodates 4-8 persons)',
      'Central Hallway Corridor with Private Bedroom Entries',
      'Maximized Investment & Rental Return',
    ],
  },
];
