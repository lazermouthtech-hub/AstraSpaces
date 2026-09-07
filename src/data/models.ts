import { ModelSpecification } from '../types';

export const BASE_MODELS: ModelSpecification[] = [
  {
    id: 'studio',
    name: 'Casita 20ft Studio',
    tagline: 'The Original Apple Cabin Architecture',
    sqft: 154,
    dimensions: {
      lengthFt: 20,
      widthFt: 9.5,
      heightFt: 8.5,
      metricStr: '5,800mm × 2,250mm × 2,530mm',
    },
    basePrice: 54900,
    leadTime: '3-4 Weeks',
    bedrooms: 0,
    bathrooms: 1,
    description:
      'Engineered directly on the iconic 20ft Apple Cabin framework. High-tensile galvanized steel chassis with aerospace-grade curved capsule corners, panoramic Low-E curtain glass, and fully pre-wired factory utilities.',
    includedFeatures: [
      'Galvanized Q235 steel structural frame',
      'Fluorocarbon aluminum exterior skin',
      'Dual-layer hollow tempered glass',
      'Pre-installed 100A electrical service',
      'R-24 eco-grade rock wool thermal envelope',
      'Factory pre-plumbed utility hookup ports',
    ],
  },
  {
    id: 'one-bedroom',
    name: 'Casita 1-Bedroom',
    tagline: 'Expanded Modular Living with Private Suite',
    sqft: 380,
    dimensions: {
      lengthFt: 20,
      widthFt: 19,
      heightFt: 8.5,
      metricStr: '5,800mm × 5,800mm × 2,530mm',
    },
    basePrice: 84900,
    leadTime: '4-6 Weeks',
    bedrooms: 1,
    bathrooms: 1,
    description:
      'A spacious dual-module floor plan uniting an expansive great room with a secluded master bedroom suite. Features floor-to-ceiling panoramic glass, full walk-around kitchenette, and integrated bath pod.',
    includedFeatures: [
      'Interlocking dual-chassis modular joinery',
      'Dedicated acoustically decoupled master suite',
      'Full open-concept galley kitchenette area',
      'Pre-wired 150A smart breaker load center',
      'Double sliding patio entrance glazing',
      'R-30 high-performance multi-layer insulation',
    ],
  },
  {
    id: 'two-bedroom',
    name: 'Casita 2-Bedroom',
    tagline: 'Multi-Room Family & Guest Residence',
    sqft: 620,
    dimensions: {
      lengthFt: 30,
      widthFt: 20,
      heightFt: 8.5,
      metricStr: '9,000mm × 5,800mm × 2,530mm',
    },
    basePrice: 119900,
    leadTime: '6-8 Weeks',
    bedrooms: 2,
    bathrooms: 1,
    description:
      'The flagship triple-module prefab home designed for permanent residency, ADU rental income, or luxury resort living. Two isolated private queen bedrooms flanking a central sunlit lounge and spa bath pod.',
    includedFeatures: [
      'Triple-module reinforced structural frame',
      'Two private bedrooms with integrated closets',
      'Central cathedral-feel living & dining lounge',
      'Dual 200A multi-zone smart electrical hub',
      'Wrap-around panoramic window envelope',
      'Dual exterior egress safety doors',
    ],
  },
];
