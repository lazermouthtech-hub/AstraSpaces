import React from 'react';

export interface FlatTreePosition {
  left: string; // horizontal percentage e.g. "12%"
  bottom: string; // vertical percentage e.g. "28%"
  scale: number; // sizing multiplier
  opacity: number; // flat background opacity
}

interface FlatTree {
  id: string;
  type: 'flat-pine' | 'flat-cypress' | 'flat-deciduous' | 'flat-birch' | 'flat-shrub' | 'flat-tall-pine';
  color: string;
  trunkColor: string;
  // Position for slide 0, slide 1, slide 2
  positions: FlatTreePosition[];
}

// Minimalist, flat architectural elevation trees for the hero section background
const FLAT_BACKGROUND_TREES: FlatTree[] = [
  // Left far flank - tall cypress
  {
    id: 'tree-left-far-cypress',
    type: 'flat-cypress',
    color: '#064e3b', // deep emerald/pine
    trunkColor: '#64748b',
    positions: [
      { left: '4%', bottom: '26%', scale: 1.15, opacity: 0.35 },
      { left: '7%', bottom: '28%', scale: 1.25, opacity: 0.4 },
      { left: '2%', bottom: '24%', scale: 1.05, opacity: 0.3 },
    ],
  },
  // Left mid - flat geometric pine
  {
    id: 'tree-left-mid-pine',
    type: 'flat-tall-pine',
    color: '#047857',
    trunkColor: '#94a3b8',
    positions: [
      { left: '11%', bottom: '30%', scale: 0.95, opacity: 0.28 },
      { left: '5%', bottom: '27%', scale: 0.85, opacity: 0.25 },
      { left: '14%', bottom: '32%', scale: 1.05, opacity: 0.32 },
    ],
  },
  // Left background - flat rounded deciduous
  {
    id: 'tree-left-bg-deciduous',
    type: 'flat-deciduous',
    color: '#059669',
    trunkColor: '#64748b',
    positions: [
      { left: '19%', bottom: '34%', scale: 0.85, opacity: 0.22 },
      { left: '24%', bottom: '36%', scale: 0.9, opacity: 0.24 },
      { left: '9%', bottom: '29%', scale: 0.8, opacity: 0.2 },
    ],
  },
  // Center-left backdrop - minimal birch
  {
    id: 'tree-center-left-birch',
    type: 'flat-birch',
    color: '#10b981',
    trunkColor: '#cbd5e1',
    positions: [
      { left: '29%', bottom: '36%', scale: 0.75, opacity: 0.18 },
      { left: '34%', bottom: '38%', scale: 0.8, opacity: 0.2 },
      { left: '22%', bottom: '35%', scale: 0.72, opacity: 0.16 },
    ],
  },
  // Center-right backdrop - flat pine
  {
    id: 'tree-center-right-pine',
    type: 'flat-pine',
    color: '#047857',
    trunkColor: '#94a3b8',
    positions: [
      { left: '69%', bottom: '37%', scale: 0.78, opacity: 0.18 },
      { left: '63%', bottom: '35%', scale: 0.82, opacity: 0.2 },
      { left: '73%', bottom: '38%', scale: 0.75, opacity: 0.16 },
    ],
  },
  // Right background - deciduous
  {
    id: 'tree-right-bg-deciduous',
    type: 'flat-deciduous',
    color: '#059669',
    trunkColor: '#64748b',
    positions: [
      { left: '78%', bottom: '33%', scale: 0.88, opacity: 0.24 },
      { left: '72%', bottom: '31%', scale: 0.82, opacity: 0.22 },
      { left: '82%', bottom: '35%', scale: 0.92, opacity: 0.26 },
    ],
  },
  // Right mid - pine
  {
    id: 'tree-right-mid-pine',
    type: 'flat-tall-pine',
    color: '#047857',
    trunkColor: '#94a3b8',
    positions: [
      { left: '87%', bottom: '28%', scale: 1.0, opacity: 0.32 },
      { left: '91%', bottom: '26%', scale: 1.1, opacity: 0.35 },
      { left: '85%', bottom: '30%', scale: 0.95, opacity: 0.3 },
    ],
  },
  // Right far flank - cypress
  {
    id: 'tree-right-far-cypress',
    type: 'flat-cypress',
    color: '#064e3b',
    trunkColor: '#64748b',
    positions: [
      { left: '95%', bottom: '25%', scale: 1.18, opacity: 0.35 },
      { left: '96%', bottom: '24%', scale: 1.12, opacity: 0.32 },
      { left: '93%', bottom: '27%', scale: 1.22, opacity: 0.38 },
    ],
  },
  // Subtle grounding flat topiary / shrubs along horizon
  {
    id: 'shrub-left',
    type: 'flat-shrub',
    color: '#10b981',
    trunkColor: '#64748b',
    positions: [
      { left: '8%', bottom: '24%', scale: 0.85, opacity: 0.3 },
      { left: '12%', bottom: '25%', scale: 0.9, opacity: 0.32 },
      { left: '6%', bottom: '23%', scale: 0.8, opacity: 0.28 },
    ],
  },
  {
    id: 'shrub-right',
    type: 'flat-shrub',
    color: '#10b981',
    trunkColor: '#64748b',
    positions: [
      { left: '91%', bottom: '23%', scale: 0.85, opacity: 0.3 },
      { left: '86%', bottom: '24%', scale: 0.9, opacity: 0.32 },
      { left: '94%', bottom: '22%', scale: 0.8, opacity: 0.28 },
    ],
  },
];

interface ArchitecturalTreesProps {
  slideIndex: number;
}

export const ArchitecturalTrees: React.FC<ArchitecturalTreesProps> = ({ slideIndex }) => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
    >
      {/* Subtle architectural horizon ground line */}
      <div className="absolute left-0 right-0 bottom-[24%] h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent" />

      {FLAT_BACKGROUND_TREES.map((tree) => {
        const posIndex = slideIndex % tree.positions.length;
        const currentPos = tree.positions[posIndex];

        return (
          <div
            key={tree.id}
            className="absolute transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              left: currentPos.left,
              bottom: currentPos.bottom,
              opacity: currentPos.opacity,
              transform: `translateX(-50%) scale(${currentPos.scale})`,
              transformOrigin: 'bottom center',
            }}
          >
            {renderFlatTree(tree.type, tree.color, tree.trunkColor)}
          </div>
        );
      })}
    </div>
  );
};

// Pure flat 2D architectural elevation silhouettes — clean, geometric, no gradients or shadows
function renderFlatTree(type: FlatTree['type'], color: string, trunkColor: string) {
  switch (type) {
    case 'flat-cypress':
      return (
        <svg width="34" height="150" viewBox="0 0 34 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Flat trunk line */}
          <rect x="15.5" y="125" width="3" height="25" fill={trunkColor} />
          {/* Clean flat vertical silhouette */}
          <path
            d="M17 6
               C24 16 30 40 30 75
               C30 105 25 125 17 125
               C9 125 4 105 4 75
               C4 40 10 16 17 6Z"
            fill={color}
          />
        </svg>
      );

    case 'flat-tall-pine':
      return (
        <svg width="54" height="150" viewBox="0 0 54 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Flat trunk */}
          <rect x="25.5" y="118" width="3" height="32" fill={trunkColor} />
          {/* Tier 1 */}
          <polygon points="27,10 38,40 16,40" fill={color} />
          {/* Tier 2 */}
          <polygon points="27,34 44,72 10,72" fill={color} />
          {/* Tier 3 */}
          <polygon points="27,64 50,102 4,102" fill={color} />
          {/* Tier 4 */}
          <polygon points="27,92 54,124 0,124" fill={color} />
        </svg>
      );

    case 'flat-pine':
      return (
        <svg width="48" height="130" viewBox="0 0 48 130" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="22.5" y="102" width="3" height="28" fill={trunkColor} />
          <polygon points="24,12 36,44 12,44" fill={color} />
          <polygon points="24,38 42,76 6,76" fill={color} />
          <polygon points="24,68 48,106 0,106" fill={color} />
        </svg>
      );

    case 'flat-deciduous':
      return (
        <svg width="68" height="135" viewBox="0 0 68 135" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Clean trunk & branch lines */}
          <rect x="32.5" y="80" width="3" height="55" fill={trunkColor} />
          {/* Clean flat circular canopy lobes */}
          <circle cx="34" cy="44" r="28" fill={color} />
          <circle cx="20" cy="58" r="18" fill={color} />
          <circle cx="48" cy="58" r="18" fill={color} />
          <circle cx="34" cy="68" r="20" fill={color} />
        </svg>
      );

    case 'flat-birch':
      return (
        <svg width="44" height="140" viewBox="0 0 44 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20.5" y="70" width="3" height="70" fill={trunkColor} />
          <ellipse cx="22" cy="38" rx="16" ry="26" fill={color} />
          <ellipse cx="14" cy="58" rx="12" ry="16" fill={color} />
          <ellipse cx="30" cy="58" rx="12" ry="16" fill={color} />
        </svg>
      );

    case 'flat-shrub':
      return (
        <svg width="46" height="30" viewBox="0 0 46 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 28 C2 14 12 4 23 4 C34 4 44 14 44 28 Z" fill={color} />
          <circle cx="16" cy="18" r="10" fill={color} />
          <circle cx="30" cy="18" r="10" fill={color} />
        </svg>
      );

    default:
      return null;
  }
}
