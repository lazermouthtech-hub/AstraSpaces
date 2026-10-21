/**
 * Unit & Size Specific Pricing Calculator
 *
 * Handles calculating custom prices for options, modular add-ons, kitchenettes,
 * cabinetry, and finishes based on the specific home unit/size (20ft, 30ft, 40ft,
 * Apple Cabins, Space Capsules, etc.).
 */

import { BASE_MODELS } from '../data/models';

export type UnitSizeCategory = '10ft' | '20ft' | '30ft' | '40ft' | 'compact' | 'large';

/**
 * Categorizes a model ID into a normalized unit size
 */
export function getModelSizeCategory(modelId: string): UnitSizeCategory {
  if (!modelId) return '20ft';
  const lower = modelId.toLowerCase();

  if (lower.includes('10ft')) {
    return '10ft';
  }
  if (lower.includes('40ft') || lower === 'two-bedroom' || lower.includes('ac04') || lower.includes('d9') || lower.includes('d8')) {
    return '40ft';
  }
  if (lower.includes('30ft') || lower === 'one-bedroom' || lower.includes('ac02') || lower.includes('ac03') || lower.includes('ad03') || lower.includes('d5') || lower.includes('d7')) {
    return '30ft';
  }
  if (lower.includes('20ft') || lower === 'studio' || lower.includes('ac01') || lower.includes('d2') || lower.includes('fast-assembly') || lower.includes('folding')) {
    return '20ft';
  }

  return '20ft';
}

/**
 * Returns a human-friendly model label (e.g. "20FT Double-Wing", "30FT Expandable", etc.)
 */
export function getUnitModelLabel(modelId: string, allModels?: any[]): string {
  const models = allModels?.length ? allModels : BASE_MODELS;
  const match = models.find((m: any) => m.id === modelId);
  if (match) return match.name;

  if (modelId === 'expandable-10ft') return '10FT Double-Wing Expandable';
  if (modelId === 'expandable-20ft') return '20FT Double-Wing Expandable';
  if (modelId === 'expandable-30ft') return '30FT Double-Wing Expandable';
  if (modelId === 'expandable-40ft') return '40FT Flagship Expandable';
  if (modelId === 'studio') return '20FT Studio Apple Cabin';
  if (modelId === 'one-bedroom') return '30FT 1-Bedroom Apple Cabin';
  if (modelId === 'two-bedroom') return '40FT 2-Bedroom Apple Cabin';

  return modelId;
}

/**
 * Retrieves unit-specific price for an option/add-on for a given model.
 * 
 * Precedence:
 * 1. Exact model ID match in item.priceByModel (e.g. priceByModel['expandable-30ft'])
 * 2. Size category match (e.g. priceByModel['30ft'] or priceByModel['expandable-20ft'])
 * 3. Fallback to item.price (base price)
 */
export function getItemPriceForModel(
  item: { price?: number; priceByModel?: Record<string, number> } | null | undefined,
  modelId: string,
  allModels?: any[]
): number {
  if (!item) return 0;
  const basePrice = typeof item.price === 'number' ? item.price : 0;
  if (!modelId) return basePrice;

  // 1. Direct modelId lookup
  if (item.priceByModel && typeof item.priceByModel[modelId] === 'number') {
    return item.priceByModel[modelId];
  }

  // 2. Check for size-based key in priceByModel ('20ft', '30ft', '40ft')
  const sizeCat = getModelSizeCategory(modelId);
  if (item.priceByModel && typeof item.priceByModel[sizeCat] === 'number') {
    return item.priceByModel[sizeCat];
  }

  // 3. Check for matching model series (e.g. 'expandable-20ft' when model is 'folding-z-type-20ft')
  if (item.priceByModel) {
    if (sizeCat === '10ft' && typeof item.priceByModel['expandable-10ft'] === 'number') {
      return item.priceByModel['expandable-10ft'];
    }
    if (sizeCat === '20ft' && typeof item.priceByModel['expandable-20ft'] === 'number') {
      return item.priceByModel['expandable-20ft'];
    }
    if (sizeCat === '30ft' && typeof item.priceByModel['expandable-30ft'] === 'number') {
      return item.priceByModel['expandable-30ft'];
    }
    if (sizeCat === '40ft' && typeof item.priceByModel['expandable-40ft'] === 'number') {
      return item.priceByModel['expandable-40ft'];
    }
  }

  // 4. Default base price
  return basePrice;
}

/**
 * Retrieves unit-specific sizing label and spec details (e.g. kitchenette dimensions in 20ft vs 30ft vs 40ft)
 */
export function getItemUnitSpec(
  item: any,
  modelId: string
): { sizeLabel?: string; specDetail?: string; description?: string } {
  if (!item) return {};

  // Check custom unitSpecs map
  if (item.unitSpecs && item.unitSpecs[modelId]) {
    return item.unitSpecs[modelId];
  }

  const sizeCat = getModelSizeCategory(modelId);
  if (item.unitSpecs && item.unitSpecs[sizeCat]) {
    return item.unitSpecs[sizeCat];
  }

  // Generated dynamic size labels for prominent items
  if (item.id === 'hasKitchenetteModule') {
    if (sizeCat === '10ft') {
      return {
        sizeLabel: '10FT Micro "L"-Shaped Kitchenette (1.45m Run)',
        specDetail: 'Micro "L"-Shaped Kitchenette with quartz countertop, undermount stainless sink, 2-burner ceramic induction cooktop, and lower cabinets (Optional)',
      };
    }
    if (sizeCat === '40ft') {
      return {
        sizeLabel: '40FT Chef Suite (3.2m Run)',
        specDetail: 'Full Chef L/U-Kitchenette (3200×600mm quartz, prep island, double sink & dual 40A branch circuits)',
      };
    }
    if (sizeCat === '30ft') {
      return {
        sizeLabel: '30FT Extended (2.4m Run)',
        specDetail: 'Extended L-Shaped Kitchenette (2400×600mm quartz, breakfast peninsula return, 30A circuit)',
      };
    }
    return {
      sizeLabel: '20FT Compact (1.8m Run)',
      specDetail: 'Compact L-Shaped Kitchenette (1800×600mm quartz counter, 2-burner cooktop, integrated mini-fridge nook)',
    };
  }

  if (item.id === 'hasLuxuryBathPod') {
    if (sizeCat === '10ft') {
      return {
        sizeLabel: '10FT Micro Bath Pod (1.2m Run)',
        specDetail: 'Compact Integrated Restroom Pod (1200×1100mm) with ceramic toilet, vanity sink, mirror, and shower system (Optional)',
      };
    }
    if (sizeCat === '40ft') {
      return {
        sizeLabel: '40FT Dual/Deluxe Bath Suite',
        specDetail: 'Expanded Master Bath Pod (2400×1400mm) with dual rainfall showers and double floating vanity',
      };
    }
    if (sizeCat === '30ft') {
      return {
        sizeLabel: '30FT Family Bath Pod',
        specDetail: 'Full Family Bath Pod (2000×1300mm) with walk-in glass shower enclosure and LED backlit vanity',
      };
    }
    return {
      sizeLabel: '20FT Integrated Bath Pod',
      specDetail: 'Standard Seamless Waterproof Bath Pod (1600×1200mm) with rainfall shower and smart toilet',
    };
  }

  if (item.id === 'hasUnderfloorHeating') {
    if (sizeCat === '40ft') {
      return {
        sizeLabel: '40FT Coverage (807 sq ft)',
        specDetail: 'Full-house carbon crystal radiant underfloor heating across 75 m² (807 sq ft) with dual smart thermostats',
      };
    }
    if (sizeCat === '30ft') {
      return {
        sizeLabel: '30FT Coverage (624 sq ft)',
        specDetail: 'Full-house carbon crystal radiant underfloor heating across 58 m² (624 sq ft) with zoned digital control',
      };
    }
    return {
      sizeLabel: '20FT Coverage (409 sq ft)',
      specDetail: 'Carbon crystal radiant underfloor heating across 38 m² (409 sq ft) living and bedroom wing',
    };
  }

  if (item.id === 'hasExteriorPergolaDeck') {
    if (sizeCat === '40ft') {
      return {
        sizeLabel: '40FT Deck (320 sq ft)',
        specDetail: 'Full-facade 38ft WPC composite terrace platform (320 sq ft) with dual aluminum pergola louvers',
      };
    }
    if (sizeCat === '30ft') {
      return {
        sizeLabel: '30FT Deck (240 sq ft)',
        specDetail: '30ft length matching outdoor terrace platform (240 sq ft) with adjustable leveling foundation piers',
      };
    }
    return {
      sizeLabel: '20FT Deck (160 sq ft)',
      specDetail: '20ft front entryway deck platform (160 sq ft) with aluminum overhead pergola frame',
    };
  }

  if (item.id === 'hasHvacMiniSplit') {
    if (sizeCat === '40ft') {
      return {
        sizeLabel: '40FT Multi-Split (24,000 BTU)',
        specDetail: 'Dual-Zone Inverter Multi-Split (24,000 BTU total) with independent living and master bedroom head units',
      };
    }
    if (sizeCat === '30ft') {
      return {
        sizeLabel: '30FT High-Capacity (18,000 BTU)',
        specDetail: 'High-Efficiency Inverter Mini-Split Heat Pump (18,000 BTU, 22 SEER2) with multi-room airflow vents',
      };
    }
    return {
      sizeLabel: '20FT Inverter (12,000 BTU)',
      specDetail: 'Ultra-Quiet Inverter Mini-Split Heat Pump (12,000 BTU, 22 SEER2) rated down to -15°F (-26°C)',
    };
  }

  if (item.id === 'hasElectricBlinds') {
    if (sizeCat === '40ft') {
      return {
        sizeLabel: '40FT Complete Package (10 Openings)',
        specDetail: 'Motorized blackout curtains for 8 panoramic sliding windows and 2 double-entry glass patio doors',
      };
    }
    if (sizeCat === '30ft') {
      return {
        sizeLabel: '30FT Package (7 Openings)',
        specDetail: 'Motorized whisper-drive curtains for 6 sliding windows and front patio double door',
      };
    }
    return {
      sizeLabel: '20FT Package (5 Openings)',
      specDetail: 'Motorized whisper-drive curtains for 4 sliding windows and double-glazed patio entrance door',
    };
  }

  if (item.id === 'rooftop-terrace-deck') {
    if (sizeCat === '40ft') {
      return {
        sizeLabel: '40FT Full Rooftop (807 sq ft)',
        specDetail: '40ft commercial-grade walkable rooftop observation deck with perimeter glass balustrades & exterior staircase',
      };
    }
    if (sizeCat === '30ft') {
      return {
        sizeLabel: '30FT Walkable Deck (624 sq ft)',
        specDetail: '30ft walkable rooftop observation deck with marine-grade composite boards and stainless steel railing',
      };
    }
    return {
      sizeLabel: '20FT Walkable Deck (409 sq ft)',
      specDetail: '20ft walkable rooftop observation terrace deck with fold-up ladder and perimeter safety railings',
    };
  }

  return {
    sizeLabel: `${sizeCat.toUpperCase()} Sized`,
    specDetail: item.specDetail,
    description: item.description,
  };
}
