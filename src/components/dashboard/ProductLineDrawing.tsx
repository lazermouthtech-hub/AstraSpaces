import React, { useState } from 'react';
import { HomeModelId, FloorPlanId } from '../../types';

export interface ProductLineDrawingProps {
  modelId: HomeModelId | string;
  modelName?: string;
  floorPlanId?: FloorPlanId | string;
  customization?: {
    wallCladdingName?: string;
    wallCladdingColor?: string;
    interiorWallName?: string;
    floorPlanName?: string;
    floorPlanId?: string;
    glazingName?: string;
    roofName?: string;
    lightingName?: string;
    flooringName?: string;
    cabinetryName?: string;
    addonsList?: string[];
    hasWardrobe?: boolean;
    hasLivingSofa?: boolean;
    hasTvConsole?: boolean;
    hasBreakfastBar?: boolean;
    [key: string]: any;
  };
  initialView?: 'plan' | 'elevation' | 'foundation' | 'all';
  compact?: boolean;
}

export const ProductLineDrawing: React.FC<ProductLineDrawingProps> = ({
  modelId,
  modelName = 'Casita Prefab Cabin',
  floorPlanId,
  customization,
  initialView = 'all',
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'plan' | 'elevation' | 'foundation'>(initialView);
  const [drawingStyle, setDrawingStyle] = useState<'cad-white' | 'blueprint-blue'>('cad-white');

  // Determine model category and size accurately without substring overlap
  const mId = (modelId || '').toLowerCase();
  const mName = (modelName || '').toLowerCase();

  const isAppleCabin =
    mId.includes('apple-cabin') ||
    mId === 'studio' ||
    mId === 'one-bedroom' ||
    mId === 'two-bedroom' ||
    mName.includes('apple cabin');

  const isSpaceCapsule =
    mId.includes('space-capsule') ||
    mId.includes('capsule') ||
    mName.includes('space capsule');

  const isFolding =
    mId.includes('folding') ||
    mId.includes('fast-assembly') ||
    mName.includes('folding');

  const isExpandable =
    !isAppleCabin &&
    !isSpaceCapsule &&
    !isFolding &&
    (mId.includes('expandable') ||
      mName.includes('expandable') ||
      mId.startsWith('expandable') ||
      mId === 'expandable-10ft' ||
      mId === 'expandable-20ft' ||
      mId === 'expandable-30ft' ||
      mId === 'expandable-40ft');

  const is40ft = isExpandable && (mId.includes('40ft') || mName.includes('40ft'));
  const is30ft = isExpandable && (mId.includes('30ft') || mName.includes('30ft'));
  const is10ft = isExpandable && (mId.includes('10ft') || mName.includes('10ft'));
  const is20ft = isExpandable && !is30ft && !is40ft && !is10ft;

  // Active Floor Plan ID (defaults to '2-bed-1-bath' for expandable houses)
  const activePlanId: FloorPlanId = (floorPlanId ||
    customization?.floorPlanId ||
    customization?.floorPlan ||
    '2-bed-1-bath') as FloorPlanId;

  const hasSolar =
    customization?.roofName?.toLowerCase().includes('solar') ||
    customization?.addonsList?.some((a) => a.toLowerCase().includes('solar'));

  const hasTvConsole = Boolean(customization?.hasTvConsole);

  // Blueprint theme classes
  const isBlueprint = drawingStyle === 'blueprint-blue';
  const containerBg = isBlueprint ? 'bg-[#0B1E36] text-[#E0F2FE]' : 'bg-[#FAFAFA] text-gray-900';
  const gridPatternColor = isBlueprint ? 'rgba(56, 189, 248, 0.08)' : 'rgba(0, 0, 0, 0.04)';
  const strokeMain = isBlueprint ? '#38BDF8' : '#0F172A';
  const strokeSecondary = isBlueprint ? '#93C5FD' : '#475569';
  const strokeDim = isBlueprint ? '#3B82F6' : '#94A3B8';
  const strokeHighlight = isBlueprint ? '#F59E0B' : '#EA580C';
  const strokeStructural = isBlueprint ? '#38BDF8' : '#1E293B';
  const fillWall = isBlueprint ? '#0F2B48' : '#E2E8F0';
  const fillGlass = isBlueprint ? 'rgba(56, 189, 248, 0.25)' : 'rgba(186, 230, 253, 0.45)';
  const fillFoundation = isBlueprint ? '#1E293B' : '#F1F5F9';
  const textColor = isBlueprint ? '#BAE6FD' : '#0F172A';
  const textSub = isBlueprint ? '#7DD3FC' : '#64748B';

  /* =========================================================================
     1. EXPANDABLE CONTAINER HOUSES - ACTUAL SELECTED FLOOR PLAN
     ========================================================================= */
  const renderExpandableFloorPlan = () => {
    // Dimension strings based on selected model
    const lengthStr = is40ft ? '38\'-9" [11,800 mm]' : is30ft ? '29\'-6" [9,000 mm]' : is10ft ? '10\'-2" [3,100 mm]' : '21\'-0" [6,400 mm]';
    const widthStr = (is10ft || is20ft) ? '19\'-4" [5,900 mm]' : '21\'-0" [6,400 mm]';
    const sqftStr = is40ft ? '807 sq ft (75 m²)' : is30ft ? '624 sq ft (58 m²)' : is10ft ? '195 sq ft (18 m²)' : '409 sq ft (38 m²)';
    const modelTag = is40ft ? '40FT FLAGSHIP EXPANDABLE' : is30ft ? '30FT EXPANDABLE RESIDENCE' : is10ft ? '10FT DUAL-WING MICRO EXPANDABLE' : '20FT DOUBLE-WING EXPANDABLE';

    // Left Wing: X=60 to 280 (W=220)
    // Central Spine: X=280 to 600 (W=320)
    // Right Wing: X=600 to 820 (W=220)
    // Overall Height: Y=60 to 460 (H=400)
    return (
      <svg
        viewBox="0 0 880 520"
        className="w-full h-auto max-h-[460px] select-none font-mono"
        style={{
          backgroundImage: `radial-gradient(${gridPatternColor} 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      >
        {/* Top Outer Dimension Line */}
        <line x1="60" y1="30" x2="820" y2="30" stroke={strokeDim} strokeWidth="1" strokeDasharray="4,2" />
        <line x1="60" y1="20" x2="60" y2="40" stroke={strokeDim} strokeWidth="1.5" />
        <line x1="820" y1="20" x2="820" y2="40" stroke={strokeDim} strokeWidth="1.5" />
        <polygon points="60,30 68,27 68,33" fill={strokeDim} />
        <polygon points="820,30 812,27 812,33" fill={strokeDim} />
        <rect x="360" y="20" width="160" height="20" fill={isBlueprint ? '#0B1E36' : '#FFFFFF'} rx="4" />
        <text x="440" y="34" textAnchor="middle" fill={strokeHighlight} fontSize="11" fontWeight="bold">
          {lengthStr}
        </text>

        {/* Right Outer Dimension Line */}
        <line x1="850" y1="60" x2="850" y2="460" stroke={strokeDim} strokeWidth="1" strokeDasharray="4,2" />
        <line x1="840" y1="60" x2="860" y2="60" stroke={strokeDim} strokeWidth="1.5" />
        <line x1="840" y1="460" x2="860" y2="460" stroke={strokeDim} strokeWidth="1.5" />
        <polygon points="850,60 847,68 853,68" fill={strokeDim} />
        <polygon points="850,460 847,452 853,452" fill={strokeDim} />
        <rect x="830" y="250" width="40" height="20" fill={isBlueprint ? '#0B1E36' : '#FFFFFF'} rx="3" />
        <text x="850" y="264" textAnchor="middle" fill={strokeHighlight} fontSize="9" fontWeight="bold">
          {widthStr.split(' ')[0]}
        </text>

        {/* Model Spec Callout Badge */}
        <g transform="translate(65, 40)">
          <rect x="0" y="0" width="220" height="18" rx="3" fill={isBlueprint ? '#122D4F' : '#EEF2F6'} stroke={strokeSecondary} strokeWidth="0.8" />
          <text x="6" y="13" fontSize="8" fontWeight="bold" fill={strokeHighlight}>
            {modelTag} • {sqftStr}
          </text>
        </g>

        {/* 1. Footprint Floor Slab (Left Wing, Central Core, Right Wing) */}
        {/* Left Wing Floor */}
        <rect x="60" y="60" width="220" height="400" fill={isBlueprint ? '#0E2440' : '#FDFBF7'} stroke={strokeSecondary} strokeWidth="1" />
        {/* Central Core Transport Spine Floor */}
        <rect x="280" y="60" width="320" height="400" fill={isBlueprint ? '#112C4C' : '#F8F6F0'} stroke={strokeSecondary} strokeWidth="1" />
        {/* Right Wing Floor */}
        <rect x="600" y="60" width="220" height="400" fill={isBlueprint ? '#0E2440' : '#FDFBF7'} stroke={strokeSecondary} strokeWidth="1" />

        {/* Dual Mechanical Wing Hinges & Fold Lines (Transport Spine Dividers) */}
        <line x1="280" y1="60" x2="280" y2="460" stroke={strokeHighlight} strokeWidth="2" strokeDasharray="6,4" />
        <line x1="600" y1="60" x2="600" y2="460" stroke={strokeHighlight} strokeWidth="2" strokeDasharray="6,4" />
        <text x="280" y="55" textAnchor="middle" fontSize="7" fontWeight="bold" fill={strokeHighlight}>WING HINGE A</text>
        <text x="600" y="55" textAnchor="middle" fontSize="7" fontWeight="bold" fill={strokeHighlight}>WING HINGE B</text>

        {/* 2. Structural Steel Perimeter Enclosure Walls (Q235 High-Tensile) */}
        <rect x="60" y="60" width="760" height="400" rx="8" fill="none" stroke={strokeMain} strokeWidth="6" />

        {/* 3. 4x ISO Twistlock Crane Rigging Points (Corner Castings) */}
        <g>
          {[
            { cx: 75, cy: 75, id: 'LIFT-1' },
            { cx: 805, cy: 75, id: 'LIFT-2' },
            { cx: 75, cy: 445, id: 'LIFT-3' },
            { cx: 805, cy: 445, id: 'LIFT-4' },
          ].map((pt) => (
            <g key={pt.id}>
              <circle cx={pt.cx} cy={pt.cy} r="6" fill="none" stroke={strokeHighlight} strokeWidth="1.5" />
              <line x1={pt.cx - 6} y1={pt.cy} x2={pt.cx + 6} y2={pt.cy} stroke={strokeHighlight} strokeWidth="1" />
              <line x1={pt.cx} y1={pt.cy - 6} x2={pt.cx} y2={pt.cy + 6} stroke={strokeHighlight} strokeWidth="1" />
              <text x={pt.cx > 440 ? pt.cx - 28 : pt.cx + 10} y={pt.cy + 3} fontSize="7" fontWeight="bold" fill={strokeHighlight}>
                {pt.id}
              </text>
            </g>
          ))}
        </g>

        {/* 4. Windows: Side, Front, and Rear Architectural Apertures */}
        {/* Left Side Windows: 3 on each side for 40ft flagship, 2 on each side for 20ft/30ft */}
        {is40ft ? (
          <>
            <rect x="57" y="100" width="6" height="55" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
            <rect x="57" y="232" width="6" height="55" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
            <rect x="57" y="365" width="6" height="55" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
            <text x="48" y="127" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={textColor} transform="rotate(-90, 48, 127)">
              920×920mm SLIDING WINDOW
            </text>
            <text x="48" y="260" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={textColor} transform="rotate(-90, 48, 260)">
              920×920mm SLIDING WINDOW
            </text>
            <text x="48" y="392" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={textColor} transform="rotate(-90, 48, 392)">
              920×920mm SLIDING WINDOW
            </text>
          </>
        ) : (
          <>
            <rect x="57" y="120" width="6" height="70" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
            <rect x="57" y="320" width="6" height="70" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
            <text x="48" y="160" textAnchor="middle" fontSize="7" fontWeight="bold" fill={textColor} transform="rotate(-90, 48, 160)">
              920×920mm SLIDING WINDOW
            </text>
            <text x="48" y="360" textAnchor="middle" fontSize="7" fontWeight="bold" fill={textColor} transform="rotate(-90, 48, 360)">
              920×920mm SLIDING WINDOW
            </text>
          </>
        )}

        {/* Right Side Windows: 3 on each side for 40ft flagship, 2 on each side for 20ft/30ft */}
        {is40ft ? (
          <>
            <rect x="817" y="100" width="6" height="55" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
            <rect x="817" y="232" width="6" height="55" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
            <rect x="817" y="365" width="6" height="55" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
            <text x="832" y="127" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={textColor} transform="rotate(90, 832, 127)">
              920×920mm SLIDING WINDOW
            </text>
            <text x="832" y="260" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={textColor} transform="rotate(90, 832, 260)">
              920×920mm SLIDING WINDOW
            </text>
            <text x="832" y="392" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={textColor} transform="rotate(90, 832, 392)">
              920×920mm SLIDING WINDOW
            </text>
          </>
        ) : (
          <>
            <rect x="817" y="120" width="6" height="70" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
            <rect x="817" y="320" width="6" height="70" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
            <text x="832" y="160" textAnchor="middle" fontSize="7" fontWeight="bold" fill={textColor} transform="rotate(90, 832, 160)">
              920×920mm SLIDING WINDOW
            </text>
            <text x="832" y="360" textAnchor="middle" fontSize="7" fontWeight="bold" fill={textColor} transform="rotate(90, 832, 360)">
              920×920mm SLIDING WINDOW
            </text>
          </>
        )}

        {/* Front Wing Windows (920×920mm centered in each deployed wing front wall) */}
        <rect x="145" y="457" width="50" height="7" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
        <text x="170" y="476" textAnchor="middle" fontSize="7" fontWeight="bold" fill={strokeHighlight}>
          WING WINDOW (920×920)
        </text>
        <rect x="685" y="457" width="50" height="7" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
        <text x="710" y="476" textAnchor="middle" fontSize="7" fontWeight="bold" fill={strokeHighlight}>
          WING WINDOW (920×920)
        </text>

        {/* Rear Wall Windows (920×920mm centered in each wing rear wall) */}
        <rect x="145" y="56" width="50" height="7" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
        <text x="170" y="52" textAnchor="middle" fontSize="7" fontWeight="bold" fill={textSub}>
          REAR WINDOW
        </text>
        <rect x="685" y="56" width="50" height="7" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
        <text x="710" y="52" textAnchor="middle" fontSize="7" fontWeight="bold" fill={textSub}>
          REAR WINDOW
        </text>

        {/* 5. Main Front Entrance: Grand Double-Glazed Sliding Patio Door (Bottom Center of 2.2m Core) */}
        <rect x="380" y="457" width="120" height="7" fill={fillGlass} stroke={strokeMain} strokeWidth="2.5" />
        <path d="M 380,457 A 50,50 0 0,0 430,410" fill="none" stroke={strokeDim} strokeWidth="1" strokeDasharray="3,3" />
        <path d="M 500,457 A 50,50 0 0,1 450,410" fill="none" stroke={strokeDim} strokeWidth="1" strokeDasharray="3,3" />
        {/* Smart Biometric Lock Keypad */}
        <rect x="504" y="455" width="8" height="11" rx="1.5" fill="#F97316" stroke="#0F172A" strokeWidth="0.8" />
        <text x="440" y="482" textAnchor="middle" fontSize="8" fontWeight="bold" fill={strokeHighlight}>
          MAIN ENTRY: 1880×2220mm PATIO SLIDING DOOR + SMART LOCK
        </text>

        {/* 6. Central Sanitary Bathroom Pod (In Transport Spine at Top) */}
        <rect x="360" y="60" width="160" height="120" rx="3" fill={isBlueprint ? '#122D4F' : '#EAEFF5'} stroke={strokeSecondary} strokeWidth="2" />
        <text x="440" y="80" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
          TURN-KEY CENTRAL BATH POD
        </text>
        <text x="440" y="92" textAnchor="middle" fontSize="7" fill={textSub}>
          Factory Pre-Plumbed In Transport Spine
        </text>

        {/* Walk-in Shower (Rear-Left of Bath Pod) */}
        <rect x="368" y="100" width="55" height="55" rx="2" fill={fillGlass} stroke="#0284C7" strokeWidth="1.5" />
        <circle cx="395" cy="127" r="4" fill="#0284C7" />
        <text x="395" y="145" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0284C7">SHOWER 36&quot;×36&quot;</text>

        {/* Smart Toilet (Center of Bath Pod) */}
        <rect x="430" y="102" width="22" height="10" rx="2" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
        <ellipse cx="441" cy="120" rx="8" ry="11" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
        <text x="441" y="145" textAnchor="middle" fontSize="6" fill={textSub}>SMART WC</text>

        {/* Vanity with Backlit LED Mirror (Right of Bath Pod) */}
        <rect x="465" y="100" width="45" height="28" rx="2" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
        <ellipse cx="487" cy="114" rx="10" ry="7" fill="#F1F5F9" stroke="#64748B" strokeWidth="0.8" />
        <line x1="465" y1="99" x2="510" y2="99" stroke="#38BDF8" strokeWidth="2" />
        <text x="487" y="145" textAnchor="middle" fontSize="6" fill={textSub}>LED VANITY</text>

        {/* Bathroom Access Door (Swings Inward at Bottom of Bath Pod) */}
        <line x1="390" y1="180" x2="435" y2="180" stroke={strokeMain} strokeWidth="2.5" />
        <path d="M 390,180 A 35,35 0 0,1 425,145" fill="none" stroke={strokeDim} strokeWidth="1" strokeDasharray="2,2" />
        <text x="410" y="195" textAnchor="middle" fontSize="7" fill={strokeHighlight}>BATH DOOR</text>

        {/* 7. Intermediate Structural Columns (Highlighted for 40FT / 30FT) */}
        {is40ft && (
          <g id="structural-columns-40ft">
            {/* Column 1 at Z = -1.97m (X = 600, Y = 190) */}
            <rect x="594" y="185" width="12" height="12" fill={strokeHighlight} stroke={strokeMain} strokeWidth="1" />
            <text x="615" y="194" fontSize="7" fontWeight="bold" fill={strokeHighlight}>Q235 COLUMN (POST 1)</text>

            {/* Column 2 at Z = +1.97m (X = 600, Y = 330) */}
            <rect x="594" y="325" width="12" height="12" fill={strokeHighlight} stroke={strokeMain} strokeWidth="1" />
            <text x="615" y="334" fontSize="7" fontWeight="bold" fill={strokeHighlight}>Q235 COLUMN (POST 2)</text>

            {/* Left side mirror columns */}
            <rect x="274" y="185" width="12" height="12" fill={strokeHighlight} stroke={strokeMain} strokeWidth="1" />
            <rect x="274" y="325" width="12" height="12" fill={strokeHighlight} stroke={strokeMain} strokeWidth="1" />
          </g>
        )}

        {is30ft && (
          <g id="structural-columns-30ft">
            <rect x="594" y="255" width="12" height="12" fill={strokeHighlight} stroke={strokeMain} strokeWidth="1" />
            <rect x="274" y="255" width="12" height="12" fill={strokeHighlight} stroke={strokeMain} strokeWidth="1" />
            <text x="615" y="264" fontSize="7" fontWeight="bold" fill={strokeHighlight}>MID-SPAN Q235 POST</text>
          </g>
        )}

        {/* 8. PLAN-SPECIFIC ARCHITECTURAL ROOM LAYOUTS */}
        {/* =========================================================================
            PLAN 1: 2-bed-1-bath (Executive Family Suite)
           ========================================================================= */}
        {activePlanId === '2-bed-1-bath' && (
          <g id="layout-2-bed-1-bath">
            {/* Right Wing Demising Wall: Divides Bedroom 1 and Bedroom 2 */}
            <line x1="600" y1="260" x2="820" y2="260" stroke={strokeStructural} strokeWidth="3" />
            {/* Right Corridor Demising Wall with Doors */}
            <line x1="600" y1="60" x2="600" y2="460" stroke={strokeStructural} strokeWidth="3" strokeDasharray="140,40,40,40,140" />

            {/* Bedroom 1 (Top-Right Master Suite) */}
            <text x="710" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
              MASTER BEDROOM 1
            </text>
            <text x="710" y="97" textAnchor="middle" fontSize="8" fill={textSub}>Queen Suite (160 Sq Ft)</text>
            {/* Queen Bed with Nightstands */}
            <rect x="660" y="115" width="100" height="120" rx="4" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
            <rect x="670" y="125" width="35" height="25" rx="2" fill="none" stroke={strokeDim} strokeWidth="1" />
            <rect x="715" y="125" width="35" height="25" rx="2" fill="none" stroke={strokeDim} strokeWidth="1" />
            <text x="710" y="180" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>QUEEN BED</text>
            {/* Built-in Wardrobe */}
            <rect x="780" y="115" width="35" height="80" rx="2" fill={isBlueprint ? '#13355F' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1" />
            <text x="797" y="155" textAnchor="middle" fontSize="7" fontWeight="bold" fill={textColor} transform="rotate(90, 797, 155)">
              WARDROBE
            </text>
            {/* Suite Door Swing */}
            <text x="615" y="245" fontSize="7" fill={strokeHighlight}>32&quot; DOOR</text>

            {/* Bedroom 2 (Bottom-Right Guest / Family Suite) */}
            <text x="710" y="285" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
              BEDROOM 2 (GUEST)
            </text>
            <text x="710" y="297" textAnchor="middle" fontSize="8" fill={textSub}>Double / Twin Suite</text>
            {/* Queen Bed */}
            <rect x="660" y="315" width="100" height="120" rx="4" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
            <rect x="670" y="325" width="35" height="25" rx="2" fill="none" stroke={strokeDim} strokeWidth="1" />
            <rect x="715" y="325" width="35" height="25" rx="2" fill="none" stroke={strokeDim} strokeWidth="1" />
            <text x="710" y="380" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>FULL / QUEEN</text>
            {/* Built-in Wardrobe */}
            <rect x="780" y="335" width="35" height="80" rx="2" fill={isBlueprint ? '#13355F' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1" />
            <text x="797" y="375" textAnchor="middle" fontSize="7" fontWeight="bold" fill={textColor} transform="rotate(90, 797, 375)">
              WARDROBE
            </text>

            {/* Left Wing Top: L-Shaped Corner Kitchenette */}
            <path
              d="M 65 65 L 225 65 L 225 110 L 115 110 L 115 160 L 65 160 Z"
              fill={isBlueprint ? '#13335A' : '#F1F5F9'}
              stroke={strokeSecondary}
              strokeWidth="1.5"
            />
            <text x="145" y="80" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={textColor}>
              L-SHAPED CHEF&apos;S KITCHENETTE
            </text>
            {/* Stainless Sink centered under Rear Window (Window at x: 145-195) */}
            <rect x="135" y="85" width="35" height="20" rx="2" fill="#94A3B8" />
            <circle cx="152" cy="95" r="2.5" fill="#E2E8F0" />
            {/* 2-Burner Induction Cooktop on Return Arm */}
            <circle cx="90" cy="125" r="4.5" fill="#0F172A" stroke="#F97316" strokeWidth="1" />
            <circle cx="90" cy="142" r="4.5" fill="#0F172A" stroke="#F97316" strokeWidth="1" />

            {/* Left Wing Bottom: Living Room Lounge with TV Wall */}
            <text x="170" y="240" textAnchor="middle" fontSize="11" fontWeight="extrabold" fill={textColor}>
              LIVING ROOM LOUNGE &amp; ENTERTAINMENT
            </text>
            {/* Area Rug */}
            <rect x="75" y="270" width="170" height="170" rx="6" fill={isBlueprint ? 'rgba(56, 189, 248, 0.1)' : '#EEF2FF'} stroke={strokeDim} strokeWidth="1" strokeDasharray="3,3" />
            {/* 3-Seater Sofa against Left Wall facing East */}
            <rect x="80" y="290" width="55" height="130" rx="4" fill={isBlueprint ? '#1E3A8A' : '#CBD5E1'} stroke={strokeMain} strokeWidth="1.5" />
            <text x="107" y="360" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor} transform="rotate(-90, 107, 360)">
              3-SEATER SOFA
            </text>
            {/* Coffee Table */}
            <rect x="155" y="325" width="45" height="60" rx="3" fill={isBlueprint ? '#0F243E' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1.2" />
            <text x="177" y="358" textAnchor="middle" fontSize="7" fill={textSub}>COFFEE TABLE</text>

            {/* TV Console Mounted on Corridor Wall (X=280) (Optional Add-on) */}
            {hasTvConsole && (
              <>
                <rect x="268" y="345" width="12" height="85" rx="2" fill={isBlueprint ? '#1E293B' : '#334155'} stroke={strokeMain} strokeWidth="1.5" />
                <line x1="280" y1="340" x2="280" y2="435" stroke={strokeHighlight} strokeWidth="2" />
                <text x="255" y="390" textAnchor="middle" fontSize="7" fontWeight="bold" fill={strokeHighlight} transform="rotate(-90, 255, 390)">
                  65&quot; TV CONSOLE (CLEAR OF PILLAR)
                </text>
              </>
            )}
          </g>
        )}

        {/* =========================================================================
            PLAN 2: 3-bed-split-1-bath (Dual-Wing Split Layout)
           ========================================================================= */}
        {activePlanId === '3-bed-split-1-bath' && (
          <g id="layout-3-bed-split">
            {is40ft ? (
              /* -------------------------------------------------------------
                 40FT FLAGSHIP 3-BEDROOM EXPANDABLE BLUEPRINT LAYOUT:
                 - Right Wing: 3 Enclosed Bedroom Suites (Rear, Center, Front bays)
                   separated by columns at Y=190 and Y=330, each with its own
                   920x920mm side window and private hallway door
                 - Left Wing: 11.8m Great Room with Chef's Kitchen & Dining,
                   Living Room Lounge with 3-Seater Sofa & TV Wall, and Executive Study
                 ------------------------------------------------------------- */
              <>
                {/* Right Wing 2 Transverse Partition Walls at Y=190 and Y=330 */}
                <line x1="600" y1="190" x2="820" y2="190" stroke={strokeStructural} strokeWidth="3" />
                <line x1="600" y1="330" x2="820" y2="330" stroke={strokeStructural} strokeWidth="3" />

                {/* Right Corridor Demising Wall with 3 Suite Doors */}
                <line x1="600" y1="60" x2="600" y2="460" stroke={strokeStructural} strokeWidth="3" strokeDasharray="95,35,60,35,75,35,85" />

                {/* Bedroom 1 (Master Suite, Rear-Right, Bay 1) */}
                <text x="710" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  MASTER SUITE 1 (REAR)
                </text>
                <text x="710" y="97" textAnchor="middle" fontSize="8" fill={textSub}>Queen Suite &amp; Wardrobe</text>
                <rect x="660" y="105" width="100" height="75" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="710" y="145" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={textColor}>QUEEN BED</text>
                <rect x="780" y="100" width="35" height="55" rx="2" fill={isBlueprint ? '#13355F' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1" />
                <text x="797" y="130" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={textColor} transform="rotate(90, 797, 130)">
                  WARDROBE
                </text>

                {/* Bedroom 2 (Mid-Suite, Bay 2) */}
                <text x="710" y="215" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  BEDROOM 2 (MID-SUITE)
                </text>
                <text x="710" y="227" textAnchor="middle" fontSize="8" fill={textSub}>Double / Queen Suite</text>
                <rect x="660" y="235" width="100" height="80" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="710" y="280" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={textColor}>QUEEN BED</text>
                <rect x="780" y="235" width="35" height="55" rx="2" fill={isBlueprint ? '#13355F' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1" />
                <text x="797" y="265" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={textColor} transform="rotate(90, 797, 265)">
                  WARDROBE
                </text>

                {/* Bedroom 3 (Front-Suite, Bay 3) */}
                <text x="710" y="355" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  BEDROOM 3 (FRONT-SUITE)
                </text>
                <text x="710" y="367" textAnchor="middle" fontSize="8" fill={textSub}>Guest / Kids Suite</text>
                <rect x="660" y="375" width="100" height="75" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="710" y="415" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={textColor}>FULL / QUEEN</text>
                <rect x="780" y="375" width="35" height="55" rx="2" fill={isBlueprint ? '#13355F' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1" />
                <text x="797" y="405" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={textColor} transform="rotate(90, 797, 405)">
                  WARDROBE
                </text>

                {/* Left Wing Top: L-Shaped Chef's Kitchenette */}
                <path
                  d="M 65 65 L 225 65 L 225 110 L 115 110 L 115 160 L 65 160 Z"
                  fill={isBlueprint ? '#13335A' : '#F1F5F9'}
                  stroke={strokeSecondary}
                  strokeWidth="1.5"
                />
                <text x="145" y="80" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={textColor}>
                  L-SHAPED CHEF&apos;S KITCHENETTE
                </text>
                {/* Stainless Sink centered under Rear Window (Window at x: 145-195) */}
                <rect x="135" y="85" width="35" height="20" rx="2" fill="#94A3B8" />
                <circle cx="152" cy="95" r="2.5" fill="#E2E8F0" />
                {/* 2-Burner Induction Cooktop on Return Arm */}
                <circle cx="90" cy="125" r="4.5" fill="#0F172A" stroke="#F97316" strokeWidth="1" />
                <circle cx="90" cy="142" r="4.5" fill="#0F172A" stroke="#F97316" strokeWidth="1" />

                {/* 4-Person Dining Nook */}
                <rect x="100" y="130" width="85" height="45" rx="3" fill={isBlueprint ? '#1E3A8A' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1.2" />
                <text x="142" y="157" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>
                  DINING TABLE
                </text>

                {/* Left Wing Middle Bay: Living Room Lounge with 3-Seater Sofa & TV Wall */}
                <text x="170" y="210" textAnchor="middle" fontSize="10" fontWeight="extrabold" fill={textColor}>
                  LIVING ROOM LOUNGE
                </text>
                <rect x="75" y="225" width="170" height="100" rx="4" fill={isBlueprint ? 'rgba(56, 189, 248, 0.1)' : '#EEF2FF'} stroke={strokeDim} strokeWidth="1" strokeDasharray="3,3" />
                <rect x="80" y="235" width="50" height="80" rx="3" fill={isBlueprint ? '#1E3A8A' : '#CBD5E1'} stroke={strokeMain} strokeWidth="1.5" />
                <text x="105" y="278" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill={textColor} transform="rotate(-90, 105, 278)">
                  3-SEATER SOFA
                </text>
                <rect x="150" y="250" width="35" height="50" rx="2" fill={isBlueprint ? '#0F243E' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1" />
                <text x="167" y="278" textAnchor="middle" fontSize="6.5" fill={textSub}>TABLE</text>
                {hasTvConsole && (
                  <>
                    <rect x="268" y="245" width="12" height="60" rx="2" fill={isBlueprint ? '#1E293B' : '#334155'} stroke={strokeMain} strokeWidth="1.5" />
                    <text x="256" y="278" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={strokeHighlight} transform="rotate(-90, 256, 278)">
                      65&quot; TV
                    </text>
                  </>
                )}

                {/* Left Wing Front Bay: Executive Study / Reading Nook */}
                <text x="170" y="355" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  EXECUTIVE STUDY / FOYER
                </text>
                <rect x="85" y="375" width="110" height="55" rx="3" fill={isBlueprint ? '#13355F' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1.2" />
                <text x="140" y="405" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>
                  WORK DESK &amp; LOUNGE
                </text>
              </>
            ) : (
              /* Standard 20ft / 30ft Split 3-Bed Layout */
              <>
                {/* Right Wing Dividers: Bedrooms 2 & 3 */}
                <line x1="600" y1="260" x2="820" y2="260" stroke={strokeStructural} strokeWidth="3" />
                <line x1="600" y1="60" x2="600" y2="460" stroke={strokeStructural} strokeWidth="3" strokeDasharray="140,40,40,40,140" />

                {/* Left Wing Divider: Separates Kitchen & Dining from Bedroom 1 */}
                <line x1="60" y1="260" x2="280" y2="260" stroke={strokeStructural} strokeWidth="3" />
                <line x1="280" y1="60" x2="280" y2="460" stroke={strokeStructural} strokeWidth="3" strokeDasharray="150,40,70,40,100" />

                {/* Top-Left: Kitchen & 4-Person Dining Nook */}
                <text x="170" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  KITCHEN &amp; DINING NOOK
                </text>
                <rect x="65" y="95" width="140" height="45" rx="2" fill={isBlueprint ? '#13335A' : '#F1F5F9'} stroke={strokeSecondary} strokeWidth="1.2" />
                <circle cx="170" cy="180" r="28" fill={isBlueprint ? '#1E3A8A' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1" />
                <text x="170" y="184" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>DINING TABLE</text>

                {/* Bottom-Left: Bedroom 1 (Front-Left Suite) */}
                <text x="170" y="285" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  BEDROOM 1 (FRONT-LEFT)
                </text>
                <rect x="110" y="315" width="110" height="120" rx="4" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="165" y="380" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>QUEEN BED</text>
                <rect x="65" y="335" width="30" height="80" rx="2" fill={isBlueprint ? '#13355F' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1" />

                {/* Right Wing Bedrooms 2 & 3 */}
                <text x="710" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  BEDROOM 2 (TOP-RIGHT)
                </text>
                <rect x="660" y="115" width="100" height="120" rx="4" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="710" y="180" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>QUEEN BED</text>

                <text x="710" y="285" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  BEDROOM 3 (BOTTOM-RIGHT)
                </text>
                <rect x="660" y="315" width="100" height="120" rx="4" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="710" y="380" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>QUEEN BED</text>

                {/* Central Corridor Living Hub */}
                <text x="440" y="330" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>
                  CENTRAL CORRIDOR LIVING ACCESS
                </text>
              </>
            )}
          </g>
        )}

        {/* =========================================================================
            PLAN 3: 3-bed-kitchen-lounge (Peninsula Kitchen & Living Lounge)
           ========================================================================= */}
        {activePlanId === '3-bed-kitchen-lounge' && (
          <g id="layout-3-bed-kitchen-lounge">
            {is40ft ? (
              /* 40FT Dual-Wing 3-Bedroom with Peninsula Bar & Front Living Lounge */
              <>
                {/* Left Wing Rear: Master Bedroom 1 */}
                <line x1="60" y1="190" x2="280" y2="190" stroke={strokeStructural} strokeWidth="3" />
                <line x1="280" y1="60" x2="280" y2="190" stroke={strokeStructural} strokeWidth="3" strokeDasharray="95,35" />
                <text x="170" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  MASTER BEDROOM 1 (REAR SUITE)
                </text>
                <rect x="110" y="105" width="110" height="75" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="165" y="145" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={textColor}>KING / QUEEN BED</text>

                {/* Peninsula Kitchen Counter Divider Wall */}
                <rect x="65" y="200" width="180" height="35" rx="3" fill={isBlueprint ? '#13335A' : '#334155'} stroke={strokeMain} strokeWidth="1.5" />
                <text x="155" y="221" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FFFFFF">
                  PENINSULA BAR &amp; BREAKFAST ISLAND
                </text>
                <circle cx="100" cy="217" r="3.5" fill="#F97316" />
                <circle cx="120" cy="217" r="3.5" fill="#F97316" />

                {/* Front Living Lounge in Left Wing */}
                <text x="170" y="260" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  FRONT LIVING ROOM LOUNGE
                </text>
                <rect x="80" y="280" width="55" height="110" rx="3" fill={isBlueprint ? '#1E3A8A' : '#CBD5E1'} stroke={strokeMain} strokeWidth="1.5" />
                <text x="107" y="338" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill={textColor} transform="rotate(-90, 107, 338)">
                  LOUNGE SOFA
                </text>
                <rect x="150" y="310" width="45" height="55" rx="2" fill={isBlueprint ? '#0F243E' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1" />
                {hasTvConsole && (
                  <>
                    <rect x="268" y="300" width="12" height="75" rx="2" fill={isBlueprint ? '#1E293B' : '#334155'} stroke={strokeMain} strokeWidth="1.5" />
                    <text x="256" y="340" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={strokeHighlight} transform="rotate(-90, 256, 340)">
                      TV CONSOLE
                    </text>
                  </>
                )}

                {/* Right Wing Dividers & Bedrooms */}
                <line x1="600" y1="190" x2="820" y2="190" stroke={strokeStructural} strokeWidth="3" />
                <line x1="600" y1="330" x2="820" y2="330" stroke={strokeStructural} strokeWidth="3" />
                <line x1="600" y1="60" x2="600" y2="460" stroke={strokeStructural} strokeWidth="3" strokeDasharray="95,35,60,35,75,35,85" />

                {/* Bedroom 2 (Top-Right) */}
                <text x="710" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  BEDROOM 2 (REAR-RIGHT)
                </text>
                <rect x="660" y="105" width="100" height="75" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="710" y="145" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={textColor}>QUEEN BED</text>

                {/* Mid-Right Bay: Media & Study Nook */}
                <text x="710" y="215" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  MEDIA &amp; STUDY NOOK
                </text>
                <rect x="650" y="240" width="120" height="65" rx="3" fill={isBlueprint ? '#13355F' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1" />
                <text x="710" y="275" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>WORK DESK &amp; LOUNGE</text>

                {/* Bedroom 3 (Bottom-Right) */}
                <text x="710" y="355" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  BEDROOM 3 (FRONT-RIGHT)
                </text>
                <rect x="660" y="375" width="100" height="75" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="710" y="415" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={textColor}>QUEEN BED</text>
              </>
            ) : (
              /* Standard 20ft / 30ft Lounge Layout */
              <>
                {/* Right Wing Dividers: Bedrooms 2 & 3 */}
                <line x1="600" y1="260" x2="820" y2="260" stroke={strokeStructural} strokeWidth="3" />
                <line x1="600" y1="60" x2="600" y2="460" stroke={strokeStructural} strokeWidth="3" strokeDasharray="140,40,40,40,140" />

                {/* Left Wing Top: Bedroom 1 (Rear-Left Suite) */}
                <line x1="60" y1="210" x2="280" y2="210" stroke={strokeStructural} strokeWidth="3" />
                <text x="170" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  BEDROOM 1 (REAR SUITE)
                </text>
                <rect x="110" y="95" width="110" height="95" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="165" y="145" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>QUEEN BED</text>

                {/* Peninsula Kitchen Counter Divider Wall */}
                <rect x="65" y="215" width="180" height="35" rx="3" fill={isBlueprint ? '#13335A' : '#334155'} stroke={strokeMain} strokeWidth="1.5" />
                <text x="155" y="236" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FFFFFF">
                  PENINSULA COUNTER &amp; BREAKFAST BAR
                </text>
                <circle cx="100" cy="232" r="3.5" fill="#F97316" />
                <circle cx="120" cy="232" r="3.5" fill="#F97316" />

                {/* Left Wing Bottom: Intimate Living Lounge */}
                <text x="170" y="275" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  FRONT LIVING ROOM LOUNGE
                </text>
                {/* Sofa */}
                <rect x="80" y="300" width="50" height="110" rx="3" fill={isBlueprint ? '#1E3A8A' : '#CBD5E1'} stroke={strokeMain} strokeWidth="1.5" />
                <text x="105" y="360" textAnchor="middle" fontSize="7" fontWeight="bold" fill={textColor} transform="rotate(-90, 105, 360)">
                  LOUNGE SOFA
                </text>
                <rect x="150" y="335" width="40" height="50" rx="2" fill={isBlueprint ? '#0F243E' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1" />
                {/* TV Console on Corridor Wall closer to entrance (Optional Add-on) */}
                {hasTvConsole && (
                  <>
                    <rect x="268" y="345" width="12" height="85" rx="2" fill={isBlueprint ? '#1E293B' : '#334155'} stroke={strokeMain} strokeWidth="1.5" />
                    <text x="255" y="390" textAnchor="middle" fontSize="7" fontWeight="bold" fill={strokeHighlight} transform="rotate(-90, 255, 390)">
                      TV CONSOLE
                    </text>
                  </>
                )}

                {/* Right Wing Bedrooms 2 & 3 */}
                <text x="710" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  BEDROOM 2 (TOP-RIGHT)
                </text>
                <rect x="660" y="115" width="100" height="120" rx="4" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="710" y="180" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>QUEEN BED</text>

                <text x="710" y="285" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  BEDROOM 3 (BOTTOM-RIGHT)
                </text>
                <rect x="660" y="315" width="100" height="120" rx="4" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="710" y="380" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>QUEEN BED</text>
              </>
            )}
          </g>
        )}

        {/* =========================================================================
            PLAN 4: 1-bed-grand-dining (Grand Dining & Entertainer's Suite)
           ========================================================================= */}
        {activePlanId === '1-bed-grand-dining' && (
          <g id="layout-1-bed-grand-dining">
            {/* Encloses only Top-Right Master Suite */}
            <line x1="600" y1="230" x2="820" y2="230" stroke={strokeStructural} strokeWidth="3" />
            <line x1="600" y1="60" x2="600" y2="230" stroke={strokeStructural} strokeWidth="3" />

            {/* Top-Right: Master Suite Retreat */}
            <text x="710" y="85" textAnchor="middle" fontSize="11" fontWeight="bold" fill={textColor}>
              EXECUTIVE MASTER RETREAT
            </text>
            <rect x="660" y="105" width="110" height="110" rx="4" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
            <text x="715" y="165" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>KING BED</text>

            {/* Bottom-Right: Open Lounge */}
            <text x="710" y="265" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
              MEDIA &amp; SOCIAL LOUNGE
            </text>
            <rect x="640" y="290" width="140" height="60" rx="4" fill={isBlueprint ? '#1E3A8A' : '#CBD5E1'} stroke={strokeMain} strokeWidth="1.5" />
            <text x="710" y="325" textAnchor="middle" fontSize="8" fill={textColor}>MODULAR SOFA</text>

            {/* Gourmet Chef's Wall Kitchen (Left Wall) */}
            <rect x="65" y="65" width="180" height="60" rx="2" fill={isBlueprint ? '#13335A' : '#F1F5F9'} stroke={strokeSecondary} strokeWidth="1.5" />
            <text x="155" y="95" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>
              GOURMET PREP KITCHEN
            </text>

            {/* Massive 8-Person Banquet Dining Table in Great Room */}
            <rect x="220" y="240" width="280" height="110" rx="6" fill={isBlueprint ? '#1E3A8A' : '#334155'} stroke={strokeSecondary} strokeWidth="2" />
            <text x="360" y="295" textAnchor="middle" fontSize="11" fontWeight="extrabold" fill="#FFFFFF">
              8-PERSON BANQUET DINING TABLE
            </text>
            {/* 8 Dining Chairs */}
            {[250, 310, 370, 430].map((cx) => (
              <g key={cx}>
                <rect x={cx - 15} y="215" width="30" height="18" rx="2" fill={isBlueprint ? '#0F243E' : '#475569'} />
                <rect x={cx - 15} y="358" width="30" height="18" rx="2" fill={isBlueprint ? '#0F243E' : '#475569'} />
              </g>
            ))}
          </g>
        )}

        {/* =========================================================================
            PLAN 5: 1-bed-studio-suite (Chef Kitchen & Executive Worksuite)
           ========================================================================= */}
        {activePlanId === '1-bed-studio-suite' && (
          <g id="layout-1-bed-studio-suite">
            {/* Dedicated Right Wing Master Bedroom & Study */}
            <line x1="600" y1="60" x2="600" y2="460" stroke={strokeStructural} strokeWidth="3" />

            {/* Top-Right: Master Bedroom */}
            <text x="710" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
              MASTER BEDROOM SUITE
            </text>
            <rect x="660" y="105" width="110" height="120" rx="4" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
            <text x="715" y="165" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>KING BED</text>

            {/* Bottom-Right: Executive Workstation */}
            <line x1="600" y1="260" x2="820" y2="260" stroke={strokeSecondary} strokeWidth="2" strokeDasharray="4,4" />
            <text x="710" y="285" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
              EXECUTIVE WORKSUITE
            </text>
            <rect x="640" y="310" width="140" height="55" rx="3" fill={isBlueprint ? '#13355F' : '#334155'} stroke={strokeMain} strokeWidth="1.5" />
            <text x="710" y="340" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FFFFFF">
              DUAL-MONITOR WORK DESK
            </text>
            <circle cx="710" cy="390" r="14" fill={isBlueprint ? '#1E3A8A' : '#64748B'} />
            <text x="710" y="394" textAnchor="middle" fontSize="7" fill="#FFFFFF">TASK CHAIR</text>

            {/* Left Wing: Extended Chef's Kitchen */}
            <rect x="65" y="65" width="180" height="65" rx="2" fill={isBlueprint ? '#13335A' : '#F1F5F9'} stroke={strokeSecondary} strokeWidth="1.5" />
            <text x="155" y="95" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>
              EXTENDED CHEF&apos;S KITCHEN
            </text>

            {/* 4-Person Dining Nook (Bottom-Left) */}
            <rect x="100" y="300" width="120" height="80" rx="4" fill={isBlueprint ? '#1E3A8A' : '#334155'} stroke={strokeSecondary} strokeWidth="1.5" />
            <text x="160" y="345" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#FFFFFF">4-PERSON DINING</text>
          </g>
        )}

        {/* =========================================================================
            PLAN 6: 4-bed-quad-suite (Quad Private Suites)
           ========================================================================= */}
        {activePlanId === '4-bed-quad-suite' && (
          <g id="layout-4-bed-quad-suite">
            {is40ft ? (
              /* -------------------------------------------------------------
                 40FT FLAGSHIP 4-BEDROOM EXPANDABLE BLUEPRINT
                 - Right Wing: 3 Enclosed Bedroom Suites (Bays 1, 2, 3)
                 - Left Wing:
                   * Rear Bay (Bay 1): Chef's Kitchen & Dining
                   * Middle Bay (Bay 2): Living Room Lounge with 3-Seater Sofa & TV
                   * Front Bay (Bay 3): Enclosed Bedroom 4 Suite
                 - Central Hallway with direct access to all rooms & bath pod
                 ------------------------------------------------------------- */
              <>
                {/* Right Wing 2 Transverse Partition Walls at Y=190 and Y=330 */}
                <line x1="600" y1="190" x2="820" y2="190" stroke={strokeStructural} strokeWidth="3" />
                <line x1="600" y1="330" x2="820" y2="330" stroke={strokeStructural} strokeWidth="3" />

                {/* Right Corridor Demising Wall with 3 Suite Doors */}
                <line x1="600" y1="60" x2="600" y2="460" stroke={strokeStructural} strokeWidth="3" strokeDasharray="95,35,60,35,75,35,85" />

                {/* Bedroom 1 (Master Suite, Rear-Right, Bay 1) */}
                <text x="710" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  MASTER SUITE 1 (REAR)
                </text>
                <text x="710" y="97" textAnchor="middle" fontSize="8" fill={textSub}>Queen Suite &amp; Wardrobe</text>
                <rect x="660" y="105" width="100" height="75" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="710" y="145" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={textColor}>QUEEN BED</text>
                <rect x="780" y="100" width="35" height="55" rx="2" fill={isBlueprint ? '#13355F' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1" />
                <text x="797" y="130" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={textColor} transform="rotate(90, 797, 130)">
                  WARDROBE
                </text>

                {/* Bedroom 2 (Mid-Suite, Bay 2) */}
                <text x="710" y="215" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  BEDROOM 2 (MID-SUITE)
                </text>
                <text x="710" y="227" textAnchor="middle" fontSize="8" fill={textSub}>Double / Queen Suite</text>
                <rect x="660" y="235" width="100" height="80" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="710" y="280" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={textColor}>QUEEN BED</text>
                <rect x="780" y="235" width="35" height="55" rx="2" fill={isBlueprint ? '#13355F' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1" />
                <text x="797" y="265" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={textColor} transform="rotate(90, 797, 265)">
                  WARDROBE
                </text>

                {/* Bedroom 3 (Front-Suite, Bay 3) */}
                <text x="710" y="355" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  BEDROOM 3 (FRONT-SUITE)
                </text>
                <text x="710" y="367" textAnchor="middle" fontSize="8" fill={textSub}>Guest / Kids Suite</text>
                <rect x="660" y="375" width="100" height="75" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="710" y="415" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={textColor}>FULL / QUEEN</text>
                <rect x="780" y="375" width="35" height="55" rx="2" fill={isBlueprint ? '#13355F' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1" />
                <text x="797" y="405" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={textColor} transform="rotate(90, 797, 405)">
                  WARDROBE
                </text>

                {/* Left Wing Transverse Wall partitioning Bedroom 4 (Y = 330) */}
                <line x1="60" y1="330" x2="280" y2="330" stroke={strokeStructural} strokeWidth="3" />

                {/* Left Corridor Demising Wall for Bedroom 4 Door */}
                <line x1="280" y1="330" x2="280" y2="460" stroke={strokeStructural} strokeWidth="3" strokeDasharray="40,35,55" />

                {/* Bedroom 4 (Front-Left Suite, Bay 3) */}
                <text x="170" y="355" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>
                  BEDROOM 4 (FRONT-LEFT)
                </text>
                <text x="170" y="367" textAnchor="middle" fontSize="8" fill={textSub}>Private 4th Bedroom</text>
                <rect x="120" y="375" width="100" height="75" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="170" y="415" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={textColor}>FULL / QUEEN</text>
                <rect x="70" y="375" width="35" height="55" rx="2" fill={isBlueprint ? '#13355F' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1" />
                <text x="87" y="405" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={textColor} transform="rotate(90, 87, 405)">
                  WARDROBE
                </text>

                {/* Left Wing Rear Bay: L-Shaped Chef's Kitchenette & Dining Nook */}
                <path
                  d="M 65 65 L 225 65 L 225 110 L 115 110 L 115 160 L 65 160 Z"
                  fill={isBlueprint ? '#13335A' : '#F1F5F9'}
                  stroke={strokeSecondary}
                  strokeWidth="1.5"
                />
                <text x="145" y="80" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={textColor}>
                  L-SHAPED CHEF&apos;S KITCHENETTE
                </text>
                {/* Stainless Sink centered under Rear Window (Window at x: 145-195) */}
                <rect x="135" y="85" width="35" height="20" rx="2" fill="#94A3B8" />
                <circle cx="152" cy="95" r="2.5" fill="#E2E8F0" />
                {/* 2-Burner Induction Cooktop on Return Arm */}
                <circle cx="90" cy="125" r="4.5" fill="#0F172A" stroke="#F97316" strokeWidth="1" />
                <circle cx="90" cy="142" r="4.5" fill="#0F172A" stroke="#F97316" strokeWidth="1" />

                {/* Dining Table */}
                <rect x="95" y="130" width="100" height="50" rx="3" fill={isBlueprint ? '#1E3A8A' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1.2" />
                <text x="145" y="160" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>
                  4-PERSON DINING
                </text>

                {/* Left Wing Middle Bay: Living Room Lounge with 3-Seater Sofa & TV */}
                <rect x="70" y="200" width="150" height="115" rx="3" fill={isBlueprint ? '#0F2746' : '#EEF2FF'} stroke={strokeSecondary} strokeWidth="1" strokeDasharray="4,2" />
                <rect x="75" y="215" width="35" height="85" rx="3" fill={isBlueprint ? '#1D4ED8' : '#C7D2FE'} stroke={strokeSecondary} strokeWidth="1.2" />
                <text x="92" y="260" textAnchor="middle" fontSize="7" fontWeight="bold" fill={textColor} transform="rotate(90, 92, 260)">
                  3-SEATER SOFA
                </text>
                <rect x="125" y="235" width="30" height="45" rx="2" fill={isBlueprint ? '#1E3A8A' : '#CBD5E1'} stroke={strokeSecondary} strokeWidth="1" />
                {hasTvConsole && (
                  <>
                    <line x1="278" y1="220" x2="278" y2="295" stroke={strokeHighlight} strokeWidth="3" />
                    <text x="268" y="260" textAnchor="middle" fontSize="7" fontWeight="bold" fill={strokeHighlight} transform="rotate(90, 268, 260)">
                      65&quot; 4K MEDIA DISPLAY
                    </text>
                  </>
                )}
                <text x="150" y="305" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>
                  LIVING ROOM LOUNGE
                </text>

                {/* Central Hallway Spine */}
                <text x="440" y="330" textAnchor="middle" fontSize="9" fontWeight="bold" fill={strokeHighlight}>
                  CENTRAL SPINE ACCESS CORRIDOR
                </text>
                <text x="440" y="345" textAnchor="middle" fontSize="7" fill={textSub}>
                  Direct Access to All 4 Private Suites, Living &amp; Restroom Pod
                </text>
              </>
            ) : (
              /* Standard 20ft / 30ft Quad Suite */
              <>
                {/* Left Wing Horizontal Split: Bed 1 & Bed 2 */}
                <line x1="60" y1="260" x2="280" y2="260" stroke={strokeStructural} strokeWidth="3" />
                {/* Right Wing Horizontal Split: Bed 3 & Bed 4 */}
                <line x1="600" y1="260" x2="820" y2="260" stroke={strokeStructural} strokeWidth="3" />

                {/* Central Spine Hallway Corridor */}
                <line x1="280" y1="60" x2="280" y2="460" stroke={strokeStructural} strokeWidth="3" strokeDasharray="140,40,40,40,140" />
                <line x1="600" y1="60" x2="600" y2="460" stroke={strokeStructural} strokeWidth="3" strokeDasharray="140,40,40,40,140" />

                {/* Bed 1: Top-Left Bedroom */}
                <text x="170" y="85" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>
                  BEDROOM 1 (TOP-LEFT)
                </text>
                <rect x="110" y="105" width="110" height="110" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="165" y="165" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>QUEEN BED</text>

                {/* Bed 2: Bottom-Left Bedroom */}
                <text x="170" y="285" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>
                  BEDROOM 2 (BOTTOM-LEFT)
                </text>
                <rect x="110" y="305" width="110" height="110" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="165" y="365" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>QUEEN BED</text>

                {/* Bed 3: Top-Right Bedroom */}
                <text x="710" y="85" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>
                  BEDROOM 3 (TOP-RIGHT)
                </text>
                <rect x="660" y="105" width="110" height="110" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="715" y="165" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>QUEEN BED</text>

                {/* Bed 4: Bottom-Right Bedroom */}
                <text x="710" y="285" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>
                  BEDROOM 4 (BOTTOM-RIGHT)
                </text>
                <rect x="660" y="305" width="110" height="110" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="715" y="365" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>QUEEN BED</text>

                {/* Central Hallway Spine */}
                <text x="440" y="330" textAnchor="middle" fontSize="9" fontWeight="bold" fill={strokeHighlight}>
                  CENTRAL SPINE ACCESS CORRIDOR
                </text>
                <text x="440" y="345" textAnchor="middle" fontSize="7" fill={textSub}>
                  Direct Door Access to All 4 Suites &amp; Restroom Pod
                </text>
              </>
            )}
          </g>
        )}

        {/* 9. Utility Ingress & Connection Tags */}
        <g transform="translate(65, 470)">
          <text x="0" y="12" fontSize="8" fontWeight="bold" fill={strokeHighlight}>
            ⚡ 200A DUAL-BUS MAIN LOAD CENTER
          </text>
          <text x="260" y="12" fontSize="8" fontWeight="bold" fill="#0284C7">
            🚰 3/4&quot; PEX-A WATER SUPPLY MANIFOLD
          </text>
          <text x="540" y="12" fontSize="8" fontWeight="bold" fill="#64748B">
            🚽 3&quot; PVC DWV SANITARY GRAVITY DRAIN
          </text>
        </g>
      </svg>
    );
  };

  /* =========================================================================
     2. APPLE CABIN ARCHITECTURAL SERIES - CAD BLUEPRINT
     ========================================================================= */
  const renderAppleCabinPlan = () => {
    const isAC02 = mId.includes('ac02') || mId === 'one-bedroom';
    const isAC03 = mId.includes('ac03');
    const isAC04 = mId.includes('ac04') || mId === 'two-bedroom';
    const isAD01 = mId.includes('ad01') || mId.includes('ad03') || mName.includes('duplex');

    const cabinLength = isAC04
      ? "38'-9\" [11,800 mm]"
      : isAC02
      ? "32'-10\" [10,000 mm]"
      : isAC03
      ? "27'-11\" [8,500 mm]"
      : "19'-0\" [5,800 mm]";
    const cabinWidth = isAC02 ? "11'-6\" [3,500 mm]" : "7'-2\" [2,200 mm]";

    return (
      <svg
        viewBox="0 0 880 440"
        className="w-full h-auto max-h-[400px] select-none font-mono"
        style={{
          backgroundImage: `radial-gradient(${gridPatternColor} 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      >
        {/* Dimensions Top & Right */}
        <line x1="80" y1="30" x2="800" y2="30" stroke={strokeDim} strokeWidth="1" strokeDasharray="4,2" />
        <line x1="80" y1="20" x2="80" y2="40" stroke={strokeDim} strokeWidth="1.5" />
        <line x1="800" y1="20" x2="800" y2="40" stroke={strokeDim} strokeWidth="1.5" />
        <polygon points="80,30 88,27 88,33" fill={strokeDim} />
        <polygon points="800,30 792,27 792,33" fill={strokeDim} />
        <rect x="360" y="20" width="160" height="20" fill={isBlueprint ? '#0B1E36' : '#FFFFFF'} rx="3" />
        <text x="440" y="34" textAnchor="middle" fill={strokeHighlight} fontSize="11" fontWeight="bold">
          {cabinLength}
        </text>

        <line x1="835" y1="65" x2="835" y2="385" stroke={strokeDim} strokeWidth="1" strokeDasharray="4,2" />
        <line x1="825" y1="65" x2="845" y2="65" stroke={strokeDim} strokeWidth="1.5" />
        <line x1="825" y1="385" x2="845" y2="385" stroke={strokeDim} strokeWidth="1.5" />
        <text x="855" y="230" textAnchor="middle" fill={strokeHighlight} fontSize="10" fontWeight="bold" transform="rotate(90, 855, 230)">
          {cabinWidth}
        </text>

        {/* Capsule Curved Monolithic Frame */}
        <rect x="80" y="65" width="720" height="320" rx="32" fill="none" stroke={strokeMain} strokeWidth="8" />
        <rect x="90" y="75" width="700" height="300" rx="24" fill={isBlueprint ? '#0E2440' : '#FFFFFF'} stroke={strokeSecondary} strokeWidth="1.5" />

        {/* Rooftop observation deck annotation for AC03 */}
        {isAC03 && (
          <g>
            <rect x="85" y="65" width="200" height="40" fill={isBlueprint ? '#122D4F' : '#FEF3C7'} rx="4" />
            <text x="185" y="88" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#B45309">
              + 18.7 m² WALKABLE ROOF TERRACE &amp; STAIRS
            </text>
          </g>
        )}

        {/* Layout for Studio / AC01 */}
        {!isAC02 && !isAC04 && !isAD01 && (
          <g>
            {/* Left: Spa Bathroom Pod */}
            <rect x="90" y="75" width="180" height="300" fill={isBlueprint ? '#122D4F' : '#F1F5F9'} stroke={strokeSecondary} strokeWidth="2" />
            <text x="180" y="110" textAnchor="middle" fontSize="11" fontWeight="bold" fill={textColor}>SPA BATH POD</text>
            <rect x="105" y="135" width="80" height="80" fill={fillGlass} stroke="#0284C7" strokeWidth="1.2" />
            <text x="145" y="180" textAnchor="middle" fontSize="7" fill="#0284C7">RAIN SHOWER</text>
            <ellipse cx="225" cy="180" rx="10" ry="14" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
            <text x="225" y="210" textAnchor="middle" fontSize="7" fill={textSub}>SMART WC</text>

            {/* Center: Kitchenette & Wardrobe */}
            <rect x="290" y="75" width="140" height="60" rx="2" fill={isBlueprint ? '#13335A' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1.2" />
            <text x="360" y="110" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>BAR KITCHENETTE</text>

            {/* Right: Master Queen Sleeping Capsule */}
            <rect x="520" y="115" width="200" height="190" rx="6" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
            <text x="620" y="200" textAnchor="middle" fontSize="12" fontWeight="extrabold" fill={textColor}>QUEEN CAPSULE BED</text>
            <text x="620" y="220" textAnchor="middle" fontSize="8" fill={textSub}>Panoramic Window Views</text>

            {/* Front: Full Curved Low-E Curtain Wall */}
            <rect x="460" y="367" width="310" height="8" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
            <text x="615" y="398" textAnchor="middle" fontSize="9" fontWeight="bold" fill={strokeHighlight}>
              PANORAMIC CURVED LOW-E CURTAIN GLASS
            </text>
          </g>
        )}

        {/* Layout for AC02 Deluxe Suite */}
        {isAC02 && (
          <g>
            {/* Left: Master Bedroom */}
            <rect x="90" y="75" width="320" height="300" fill={isBlueprint ? 'rgba(15,40,70,0.5)' : '#F8FAFC'} />
            <text x="250" y="110" textAnchor="middle" fontSize="12" fontWeight="extrabold" fill={textColor}>MASTER BEDROOM SUITE</text>
            <rect x="150" y="130" width="180" height="180" rx="6" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
            <text x="240" y="220" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>KING BED (76&quot; × 80&quot;)</text>

            {/* Center: Galley Kitchen & Bath Pod */}
            <rect x="420" y="75" width="160" height="140" fill={isBlueprint ? '#122D4F' : '#F1F5F9'} stroke={strokeSecondary} strokeWidth="1.5" />
            <text x="500" y="100" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>SPA BATH POD</text>
            <rect x="420" y="225" width="160" height="150" fill={isBlueprint ? '#13335A' : '#F8FAFC'} stroke={strokeSecondary} strokeWidth="1.5" />
            <text x="500" y="270" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>GALLEY KITCHEN</text>

            {/* Right: Great Room Living Area */}
            <text x="690" y="110" textAnchor="middle" fontSize="12" fontWeight="extrabold" fill={textColor}>GREAT ROOM LOUNGE</text>
            <rect x="600" y="160" width="160" height="100" rx="6" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="680" y="215" textAnchor="middle" fontSize="9" fill={textSub}>SECTIONAL SOFA</text>
          </g>
        )}

        {/* Layout for AC04 2-Bedroom Linear Suite */}
        {isAC04 && (
          <g>
            {/* Bedroom 1 (Left) */}
            <rect x="90" y="75" width="210" height="300" fill={isBlueprint ? 'rgba(15,40,70,0.5)' : '#F8FAFC'} />
            <text x="195" y="110" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>BEDROOM 1</text>
            <rect x="120" y="140" width="130" height="150" rx="4" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="185" y="215" textAnchor="middle" fontSize="9" fill={textColor}>QUEEN BED</text>

            {/* Central Spa Bath & Living Hub */}
            <rect x="310" y="75" width="140" height="140" fill={isBlueprint ? '#122D4F' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1.5" />
            <text x="380" y="110" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>BATH POD</text>
            <text x="480" y="260" textAnchor="middle" fontSize="11" fontWeight="bold" fill={textColor}>CENTRAL LOUNGE &amp; BAR</text>

            {/* Bedroom 2 (Right) */}
            <rect x="580" y="75" width="210" height="300" fill={isBlueprint ? 'rgba(15,40,70,0.5)' : '#F8FAFC'} />
            <text x="685" y="110" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>BEDROOM 2</text>
            <rect x="610" y="140" width="130" height="150" rx="4" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="675" y="215" textAnchor="middle" fontSize="9" fill={textColor}>QUEEN BED</text>
          </g>
        )}
      </svg>
    );
  };

  /* =========================================================================
     3. FRONT ELEVATION (FACADE LINE DRAWING)
     ========================================================================= */
  const renderElevationView = () => {
    // Proportional dimensions for Expandable House front elevation
    const wingWidthStr = is20ft ? "1,850 mm [6'-1\"]" : "2,100 mm [6'-11\"]";
    const coreWidthStr = "2,200 mm [7'-3\"]";
    const totalWidthStr = is20ft ? "5,900 mm [19'-4\"]" : "6,400 mm [21'-0\"]";

    return (
      <svg
        viewBox="0 0 880 440"
        className="w-full h-auto max-h-[380px] select-none font-mono"
        style={{
          backgroundImage: `radial-gradient(${gridPatternColor} 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      >
        {/* Height Dimension Left */}
        <line x1="50" y1="90" x2="50" y2="350" stroke={strokeDim} strokeWidth="1" />
        <line x1="40" y1="90" x2="60" y2="90" stroke={strokeDim} strokeWidth="1.5" />
        <line x1="40" y1="350" x2="60" y2="350" stroke={strokeDim} strokeWidth="1.5" />
        <polygon points="50,90 47,98 53,98" fill={strokeDim} />
        <polygon points="50,350 47,342 53,342" fill={strokeDim} />
        <rect x="15" y="210" width="70" height="18" fill={isBlueprint ? '#0B1E36' : '#FFFFFF'} rx="3" />
        <text x="50" y="223" textAnchor="middle" fill={strokeHighlight} fontSize="10" fontWeight="bold">
          8&apos;-2&quot; [2,500 mm]
        </text>

        {/* Top Width Dimensions across Left Wing, Central Core, and Right Wing */}
        {isExpandable && (
          <g id="top-elevation-dimensions">
            {/* Top Dimension Line */}
            <line x1="100" y1="50" x2="780" y2="50" stroke={strokeDim} strokeWidth="1" strokeDasharray="3,2" />
            <line x1="100" y1="42" x2="100" y2="58" stroke={strokeDim} strokeWidth="1.5" />
            <line x1="310" y1="42" x2="310" y2="58" stroke={strokeDim} strokeWidth="1.5" />
            <line x1="570" y1="42" x2="570" y2="58" stroke={strokeDim} strokeWidth="1.5" />
            <line x1="780" y1="42" x2="780" y2="58" stroke={strokeDim} strokeWidth="1.5" />

            {/* Left Wing Width */}
            <text x="205" y="44" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>
              LEFT WING: {wingWidthStr}
            </text>
            {/* Central Core Width */}
            <text x="440" y="44" textAnchor="middle" fontSize="8" fontWeight="bold" fill={strokeHighlight}>
              RIGID CORE: {coreWidthStr}
            </text>
            {/* Right Wing Width */}
            <text x="675" y="44" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>
              RIGHT WING: {wingWidthStr}
            </text>
          </g>
        )}

        {/* Finished Grade Ground Level */}
        <line x1="60" y1="380" x2="840" y2="380" stroke={strokeSecondary} strokeWidth="2" />
        {[70, 130, 190, 250, 310, 370, 430, 490, 550, 610, 670, 730, 790, 830].map((x) => (
          <line key={x} x1={x} y1="380" x2={x - 12} y2="395" stroke={strokeDim} strokeWidth="1" />
        ))}
        <text x="80" y="405" fontSize="9" fontWeight="bold" fill={textSub}>
          FINISHED GRADE LEVEL (±0.00)
        </text>

        {/* Foundation Concrete Piers (Supporting the 2.2m central transport core) */}
        {[340, 540].map((x, idx) => (
          <g key={idx}>
            <rect x={x - 22} y="335" width="44" height="45" fill={fillFoundation} stroke={strokeSecondary} strokeWidth="1.5" rx="2" />
            <text x={x} y="362" textAnchor="middle" fontSize="7" fontWeight="bold" fill={textSub}>
              CORE PIER {idx + 1}
            </text>
          </g>
        ))}

        {/* Wing Leveling Support Jacks (Under Left and Right Wings) */}
        {isExpandable && (
          <g id="elevation-support-jacks">
            {/* Left Wing Jack */}
            <rect x="145" y="335" width="16" height="45" fill={isBlueprint ? '#1E293B' : '#475569'} stroke={strokeMain} strokeWidth="1" />
            <rect x="135" y="375" width="36" height="5" fill="#1E293B" rx="1" />
            <text x="153" y="396" textAnchor="middle" fontSize="6" fontWeight="bold" fill={textSub}>
              WING JACK
            </text>

            {/* Right Wing Jack */}
            <rect x="715" y="335" width="16" height="45" fill={isBlueprint ? '#1E293B' : '#475569'} stroke={strokeMain} strokeWidth="1" />
            <rect x="705" y="375" width="36" height="5" fill="#1E293B" rx="1" />
            <text x="723" y="396" textAnchor="middle" fontSize="6" fontWeight="bold" fill={textSub}>
              WING JACK
            </text>
          </g>
        )}

        {/* Structural Steel Chassis Base Floor (Q235 High-Tensile Beam) */}
        <rect x="100" y="325" width="680" height="25" fill={isBlueprint ? '#1E293B' : '#CBD5E1'} stroke={strokeMain} strokeWidth="2" />
        <text x="440" y="341" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>
          Q235 GALVANIZED STEEL CHASSIS (+1&apos;-0&quot; AFF)
        </text>

        {isExpandable ? (
          /* =========================================================================
             EXPANDABLE CONTAINER HOUSE AUTHENTIC FRONT FACADE DESIGN
             ========================================================================= */
          <g id="expandable-front-elevation">
            {/* 1. Main Enclosure Outline */}
            <rect x="100" y="90" width="680" height="235" fill={isBlueprint ? '#0F243E' : '#F8FAFC'} stroke={strokeMain} strokeWidth="3" />

            {/* Vertical Wall Cladding Siding Joints (75mm insulated thermal panels) */}
            {[140, 180, 220, 260, 300, 580, 620, 660, 700, 740].map((x) => (
              <line key={x} x1={x} y1="91" x2={x} y2="324" stroke={strokeDim} strokeWidth="0.75" strokeDasharray="8,2" />
            ))}

            {/* 2. Dual Mechanical Folding Wing Hinges (At Core Junctions X = 310 and X = 570) */}
            {/* Left Hinge Line */}
            <line x1="310" y1="90" x2="310" y2="325" stroke={strokeHighlight} strokeWidth="3" />
            <rect x="306" y="115" width="8" height="18" rx="1" fill={strokeHighlight} />
            <rect x="306" y="215" width="8" height="18" rx="1" fill={strokeHighlight} />
            <rect x="306" y="300" width="8" height="18" rx="1" fill={strokeHighlight} />
            <text x="310" y="82" textAnchor="middle" fontSize="7" fontWeight="bold" fill={strokeHighlight}>
              HINGE A
            </text>

            {/* Right Hinge Line */}
            <line x1="570" y1="90" x2="570" y2="325" stroke={strokeHighlight} strokeWidth="3" />
            <rect x="566" y="115" width="8" height="18" rx="1" fill={strokeHighlight} />
            <rect x="566" y="215" width="8" height="18" rx="1" fill={strokeHighlight} />
            <rect x="566" y="300" width="8" height="18" rx="1" fill={strokeHighlight} />
            <text x="570" y="82" textAnchor="middle" fontSize="7" fontWeight="bold" fill={strokeHighlight}>
              HINGE B
            </text>

            {/* 3. Central Transport Container Core (X = 310 to 570, Width = 260px / 2.2m) */}
            {/* Container Corner Columns (150×210mm profile) */}
            <rect x="310" y="90" width="12" height="235" fill={isBlueprint ? '#13355F' : '#334155'} stroke={strokeMain} strokeWidth="1" />
            <rect x="558" y="90" width="12" height="235" fill={isBlueprint ? '#13355F' : '#334155'} stroke={strokeMain} strokeWidth="1" />

            {/* Top Transverse Steel Header Beam (80×140mm) */}
            <rect x="310" y="90" width="260" height="16" fill={isBlueprint ? '#13355F' : '#334155'} stroke={strokeMain} strokeWidth="1.5" />
            <text x="440" y="102" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#FFFFFF">
              2.2m RIGID TRANSPORT CORE • Q235 HEAVY BEAM
            </text>

            {/* ISO Twistlock Rigging Corner Castings at Top Corners */}
            <g id="crane-corner-castings">
              <rect x="310" y="90" width="18" height="16" fill="#0F172A" stroke={strokeHighlight} strokeWidth="1" />
              <ellipse cx="319" cy="98" rx="4" ry="3" fill="#FFFFFF" />
              <rect x="552" y="90" width="18" height="16" fill="#0F172A" stroke={strokeHighlight} strokeWidth="1" />
              <ellipse cx="561" cy="98" rx="4" ry="3" fill="#FFFFFF" />
              <text x="319" y="82" textAnchor="middle" fontSize="6" fontWeight="bold" fill={strokeHighlight}>LIFT-1</text>
              <text x="561" y="82" textAnchor="middle" fontSize="6" fontWeight="bold" fill={strokeHighlight}>LIFT-2</text>
            </g>

            {/* Solid Header Panel above entrance door (Y = 106 to 130) */}
            <rect x="322" y="106" width="236" height="24" fill={isBlueprint ? '#0F243E' : '#F1F5F9'} stroke={strokeSecondary} strokeWidth="0.8" />

            {/* Main Entrance Door (Centered in Core: 1880×2220mm Broken-Bridge Double Sliding Patio Door) */}
            <rect x="345" y="130" width="190" height="195" rx="2" fill={isBlueprint ? '#071526' : '#FFFFFF'} stroke={strokeMain} strokeWidth="2.5" />
            {/* Protective Overhang Drip Canopy */}
            <rect x="340" y="125" width="200" height="5" fill="#334155" rx="1" />

            {/* Left Sliding Door Leaf */}
            <rect x="350" y="135" width="90" height="185" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
            <rect x="355" y="140" width="80" height="175" fill="none" stroke={strokeSecondary} strokeWidth="1" />
            {/* Right Sliding Door Leaf */}
            <rect x="440" y="135" width="90" height="185" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
            <rect x="445" y="140" width="80" height="175" fill="none" stroke={strokeSecondary} strokeWidth="1" />

            {/* Door Center Interlocking Stile */}
            <line x1="440" y1="135" x2="440" y2="320" stroke={strokeMain} strokeWidth="2.5" />

            {/* Vertical Ergonomic Stainless Steel D-Pull Handle */}
            <rect x="432" y="200" width="4" height="46" rx="1" fill="#FFFFFF" stroke="#334155" strokeWidth="0.8" />
            <circle cx="434" cy="203" r="1.5" fill="#0F172A" />
            <circle cx="434" cy="243" r="1.5" fill="#0F172A" />

            {/* Illuminated Biometric Smart Keypad Lock */}
            <rect x="446" y="210" width="7" height="18" rx="1" fill="#F97316" stroke="#0F172A" strokeWidth="0.75" />
            <text x="475" y="222" fontSize="6" fontWeight="bold" fill={strokeHighlight}>
              SMART LOCK
            </text>

            {/* Main Entrance Callout Badge */}
            <text x="440" y="318" textAnchor="middle" fontSize="7" fontWeight="bold" fill={textColor}>
              1880×2220mm PATIO ENTRANCE
            </text>

            {/* 4. Left Fold-Out Wing: Centered 920×920mm Architectural Window */}
            {/* Window Opening at X = 160 to 250 (W = 90, H = 88, centered in Left Wing 100-310) */}
            <rect x="160" y="175" width="90" height="88" rx="2" fill={fillGlass} stroke={strokeMain} strokeWidth="2.5" />
            {/* Projecting Sloped Window Sill */}
            <rect x="156" y="263" width="98" height="5" rx="1" fill="#334155" stroke="#1E293B" strokeWidth="0.8" />
            {/* Dual Sliding Sashes Divider */}
            <line x1="205" y1="175" x2="205" y2="263" stroke={strokeMain} strokeWidth="1.8" />
            {/* Interior Sash Panes */}
            <rect x="164" y="179" width="37" height="80" fill="none" stroke={strokeSecondary} strokeWidth="1" />
            <rect x="209" y="179" width="37" height="80" fill="none" stroke={strokeSecondary} strokeWidth="1" />
            <text x="205" y="280" textAnchor="middle" fontSize="7" fontWeight="bold" fill={strokeHighlight}>
              920×920mm DUAL LOW-E
            </text>
            <text x="205" y="291" textAnchor="middle" fontSize="6" fill={textSub}>
              LEFT WING FRONT WINDOW
            </text>

            {/* 5. Right Fold-Out Wing: Centered 920×920mm Architectural Window */}
            {/* Window Opening at X = 630 to 720 (W = 90, H = 88, centered in Right Wing 570-780) */}
            <rect x="630" y="175" width="90" height="88" rx="2" fill={fillGlass} stroke={strokeMain} strokeWidth="2.5" />
            {/* Projecting Sloped Window Sill */}
            <rect x="626" y="263" width="98" height="5" rx="1" fill="#334155" stroke="#1E293B" strokeWidth="0.8" />
            {/* Dual Sliding Sashes Divider */}
            <line x1="675" y1="175" x2="675" y2="263" stroke={strokeMain} strokeWidth="1.8" />
            {/* Interior Sash Panes */}
            <rect x="634" y="179" width="37" height="80" fill="none" stroke={strokeSecondary} strokeWidth="1" />
            <rect x="679" y="179" width="37" height="80" fill="none" stroke={strokeSecondary} strokeWidth="1" />
            <text x="675" y="280" textAnchor="middle" fontSize="7" fontWeight="bold" fill={strokeHighlight}>
              920×920mm DUAL LOW-E
            </text>
            <text x="675" y="291" textAnchor="middle" fontSize="6" fill={textSub}>
              RIGHT WING FRONT WINDOW
            </text>
          </g>
        ) : isAppleCabin ? (
          /* Apple Cabin Monolithic Capsule Front Elevation */
          <g id="apple-cabin-front-elevation">
            <rect x="100" y="90" width="680" height="235" rx="28" fill={isBlueprint ? '#0F243E' : '#F8FAFC'} stroke={strokeMain} strokeWidth="4" />
            {/* Panoramic Low-E Curved Glass Front */}
            <rect x="240" y="115" width="510" height="195" rx="14" fill={fillGlass} stroke={strokeMain} strokeWidth="3" />
            <text x="495" y="220" textAnchor="middle" fontSize="12" fontWeight="extrabold" fill={strokeHighlight}>
              PANORAMIC CURVED GLASS CURTAIN FACADE
            </text>
          </g>
        ) : (
          /* General Modular Container Front Elevation */
          <g id="modular-container-front-elevation">
            <rect x="100" y="90" width="680" height="235" rx="4" fill={isBlueprint ? '#0F243E' : '#F8FAFC'} stroke={strokeMain} strokeWidth="3" />
            <rect x="360" y="130" width="160" height="195" fill={fillGlass} stroke={strokeMain} strokeWidth="2.5" />
            <rect x="150" y="175" width="90" height="90" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
            <rect x="640" y="175" width="90" height="90" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
          </g>
        )}

        {/* Solar Panels on Roof if equipped */}
        {hasSolar && (
          <g id="roof-solar-array">
            <rect x="120" y="65" width="640" height="22" rx="2" fill={isBlueprint ? '#1E3A8A' : '#0F172A'} stroke={strokeHighlight} strokeWidth="1.5" />
            <text x="440" y="58" textAnchor="middle" fontSize="9" fontWeight="bold" fill={strokeHighlight}>
              ☀ ROOF-INTEGRATED MONOCRYSTALLINE PV SOLAR ARRAY
            </text>
          </g>
        )}
      </svg>
    );
  };

  /* =========================================================================
     4. FOUNDATION & MEP ENGINEERING SECTION
     ========================================================================= */
  const renderFoundationView = () => {
    return (
      <svg
        viewBox="0 0 880 440"
        className="w-full h-auto max-h-[380px] select-none font-mono"
        style={{
          backgroundImage: `radial-gradient(${gridPatternColor} 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      >
        <text x="440" y="30" textAnchor="middle" fontSize="13" fontWeight="bold" fill={textColor}>
          FOUNDATION ANCHOR BOLT GRID &amp; MEP UTILITY PENETRATION MAP
        </text>
        <text x="440" y="46" textAnchor="middle" fontSize="9" fill={textSub}>
          Tolerance: ±1/8&quot; (3mm) • Concrete Compressive Strength: Min. 3,000 PSI @ 28 Days
        </text>

        {/* Foundation Slab / Pier Outline */}
        <rect x="100" y="70" width="680" height="280" rx="8" fill="none" stroke={strokeMain} strokeWidth="4" />

        {/* 6 to 8 Structural Pier Locations with Anchor Bolts */}
        {[
          { x: 130, y: 90, label: 'P-1 (FRONT-L)' },
          { x: 330, y: 90, label: 'P-2 (MID-L)' },
          { x: 550, y: 90, label: 'P-3 (MID-R)' },
          { x: 750, y: 90, label: 'P-4 (FRONT-R)' },
          { x: 130, y: 330, label: 'P-5 (REAR-L)' },
          { x: 330, y: 330, label: 'P-6 (MID-L)' },
          { x: 550, y: 330, label: 'P-7 (MID-R)' },
          { x: 750, y: 330, label: 'P-8 (REAR-R)' },
        ].map((pier, i) => (
          <g key={i}>
            <circle cx={pier.x} cy={pier.y} r="20" fill={fillFoundation} stroke={strokeSecondary} strokeWidth="1.5" />
            <circle cx={pier.x} cy={pier.y} r="5" fill={strokeHighlight} />
            <text x={pier.x} y={pier.y > 200 ? pier.y + 32 : pier.y - 25} textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>
              {pier.label}
            </text>
          </g>
        ))}

        {/* Utility Penetrations */}
        <g transform="translate(180, 160)">
          <rect x="0" y="0" width="85" height="50" rx="4" fill={isBlueprint ? '#1E293B' : '#FEF3C7'} stroke="#D97706" strokeWidth="1.5" />
          <circle cx="20" cy="25" r="8" fill="#F59E0B" />
          <text x="35" y="22" fontSize="8" fontWeight="bold" fill="#B45309">ELECTRICAL</text>
          <text x="35" y="34" fontSize="7" fill="#B45309">2&quot; SCH 40 PVC</text>
          <text x="35" y="44" fontSize="6" fill={textSub}>200A SERVICE</text>
        </g>

        <g transform="translate(180, 230)">
          <rect x="0" y="0" width="85" height="50" rx="4" fill={isBlueprint ? '#1E293B' : '#E0F2FE'} stroke="#0284C7" strokeWidth="1.5" />
          <circle cx="20" cy="25" r="7" fill="#0284C7" />
          <text x="35" y="22" fontSize="8" fontWeight="bold" fill="#0369A1">WATER INLET</text>
          <text x="35" y="34" fontSize="7" fill="#0369A1">3/4&quot; PEX-A</text>
          <text x="35" y="44" fontSize="6" fill={textSub}>55 PSI RATED</text>
        </g>

        <g transform="translate(300, 195)">
          <rect x="0" y="0" width="95" height="55" rx="4" fill={isBlueprint ? '#1E293B' : '#F1F5F9'} stroke="#64748B" strokeWidth="1.5" />
          <circle cx="22" cy="27" r="10" fill="#475569" />
          <text x="38" y="24" fontSize="8" fontWeight="bold" fill="#334155">SEWER DWV</text>
          <text x="38" y="36" fontSize="7" fill="#334155">3&quot; PVC DROP</text>
          <text x="38" y="46" fontSize="6" fill={textSub}>GRAVITY DRAIN</text>
        </g>
      </svg>
    );
  };

  // Switch between floor plan types
  const renderCurrentPlanView = () => {
    if (isExpandable) {
      return renderExpandableFloorPlan();
    }
    return renderAppleCabinPlan();
  };

  return (
    <div className={`rounded-2xl border ${isBlueprint ? 'border-sky-900 shadow-md' : 'border-gray-200 shadow-xs'} overflow-hidden`}>
      {/* Top Drawing Control Bar */}
      <div className={`p-3.5 flex flex-wrap items-center justify-between gap-3 border-b ${isBlueprint ? 'bg-[#071526] border-sky-950 text-white' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-mono text-xs font-black tracking-wider uppercase">
            ARCHITECTURAL LINE DRAWING &amp; CAD BLUEPRINT
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-orange-100 text-orange-800 border border-orange-200">
            {modelName}
          </span>
          {isExpandable && (
            <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-blue-100 text-blue-900 border border-blue-200">
              Active Plan: {activePlanId}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Selector */}
          <div className="inline-flex p-0.5 bg-black/10 rounded-xl">
            {(['all', 'plan', 'elevation', 'foundation'] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setActiveTab(view)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all capitalize cursor-pointer ${
                  activeTab === view
                    ? isBlueprint
                      ? 'bg-sky-500 text-black shadow-xs'
                      : 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {view === 'all' ? 'All Views' : view}
              </button>
            ))}
          </div>

          {/* Blueprint Theme Toggle */}
          <button
            type="button"
            onClick={() => setDrawingStyle(isBlueprint ? 'cad-white' : 'blueprint-blue')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
              isBlueprint
                ? 'bg-sky-950/80 text-sky-300 border-sky-800 hover:bg-sky-900'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
            title="Toggle between Crisp CAD White and Engineering Blueprint Blue"
          >
            {isBlueprint ? '📘 Blueprint Blue' : '📄 CAD White'}
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className={`p-4 sm:p-6 transition-colors duration-200 ${containerBg}`}>
        {activeTab === 'all' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-current/10 text-xs font-mono font-bold">
                <span>VIEW 1: ACTUAL SELECTED ARCHITECTURAL FLOOR PLAN &amp; LIVING LAYOUT</span>
                <span className="text-[10px] opacity-75">DIMENSIONS: IMPERIAL &amp; METRIC</span>
              </div>
              {renderCurrentPlanView()}
            </div>

            <div className="pt-4 border-t border-current/15">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-current/10 text-xs font-mono font-bold">
                <span>VIEW 2: FRONT EXTERIOR ORTHOGRAPHIC ELEVATION &amp; RIGGING</span>
                <span className="text-[10px] opacity-75">WALL PANELS &amp; CURTAIN GLASS</span>
              </div>
              {renderElevationView()}
            </div>

            <div className="pt-4 border-t border-current/15">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-current/10 text-xs font-mono font-bold">
                <span>VIEW 3: STRUCTURAL FOUNDATION ANCHOR GRID &amp; MEP ROUGH-IN</span>
                <span className="text-[10px] opacity-75">PIER BOLT LAYOUT &amp; SERVICE INGRESS</span>
              </div>
              {renderFoundationView()}
            </div>
          </div>
        )}

        {activeTab === 'plan' && (
          <div>
            <div className="text-center font-mono text-xs font-bold mb-3">
              ACTUAL SELECTED ARCHITECTURAL FLOOR PLAN &amp; SPACE LAYOUT
            </div>
            {renderCurrentPlanView()}
          </div>
        )}

        {activeTab === 'elevation' && (
          <div>
            <div className="text-center font-mono text-xs font-bold mb-3">
              FRONT ELEVATION &amp; ENCLOSURE ENVELOPE
            </div>
            {renderElevationView()}
          </div>
        )}

        {activeTab === 'foundation' && (
          <div>
            <div className="text-center font-mono text-xs font-bold mb-3">
              FOUNDATION ANCHOR GRID &amp; UTILITY SCHEMATIC
            </div>
            {renderFoundationView()}
          </div>
        )}
      </div>

      {/* Drawing Metadata Footer */}
      <div
        className={`p-3 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 border-t ${
          isBlueprint ? 'bg-[#071526] border-sky-950 text-sky-300' : 'bg-gray-50 border-gray-200 text-gray-600'
        }`}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span>
            APPROVED FOR PRODUCTION: <strong className="text-orange-500">YES</strong>
          </span>
          <span>•</span>
          <span>
            AUTOCAD REV: <strong>2026.4</strong>
          </span>
          <span>•</span>
          <span>IBC &amp; HUD CODE COMPLIANT</span>
          <span>•</span>
          <span>TOLERANCE: <strong>±1/8&quot; [3.2mm]</strong></span>
        </div>
        <div className="text-[10px]">
          Engineering dimensions factory verified. All rights reserved.
        </div>
      </div>
    </div>
  );
};
