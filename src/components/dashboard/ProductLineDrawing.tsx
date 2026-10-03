import React, { useState } from 'react';
import { HomeModelId } from '../../types';

interface ProductLineDrawingProps {
  modelId: HomeModelId | string;
  modelName?: string;
  customization?: {
    wallCladdingName?: string;
    wallCladdingColor?: string;
    glazingName?: string;
    roofName?: string;
    lightingName?: string;
    flooringName?: string;
    cabinetryName?: string;
    addonsList?: string[];
  };
  initialView?: 'plan' | 'elevation' | 'foundation' | 'all';
  compact?: boolean;
}

export const ProductLineDrawing: React.FC<ProductLineDrawingProps> = ({
  modelId,
  modelName = 'Casita Prefab Cabin',
  customization,
  initialView = 'all',
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'plan' | 'elevation' | 'foundation'>(initialView);
  const [drawingStyle, setDrawingStyle] = useState<'cad-white' | 'blueprint-blue'>('cad-white');

  const normalizedId = modelId === 'one-bedroom' ? 'one-bedroom' : modelId === 'two-bedroom' ? 'two-bedroom' : 'studio';
  const hasSolar = customization?.roofName?.toLowerCase().includes('solar') || 
                   customization?.addonsList?.some(a => a.toLowerCase().includes('solar'));
  const hasPergola = customization?.addonsList?.some(a => a.toLowerCase().includes('deck') || a.toLowerCase().includes('pergola'));

  // Blueprint theme classes
  const isBlueprint = drawingStyle === 'blueprint-blue';
  const containerBg = isBlueprint ? 'bg-[#0B1E36] text-[#E0F2FE]' : 'bg-[#FAFAFA] text-gray-900';
  const gridPatternColor = isBlueprint ? 'rgba(56, 189, 248, 0.08)' : 'rgba(0, 0, 0, 0.04)';
  const strokeMain = isBlueprint ? '#38BDF8' : '#0F172A';
  const strokeSecondary = isBlueprint ? '#93C5FD' : '#475569';
  const strokeDim = isBlueprint ? '#3B82F6' : '#94A3B8';
  const strokeHighlight = isBlueprint ? '#F59E0B' : '#EA580C';
  const fillWall = isBlueprint ? '#0F2B48' : '#E2E8F0';
  const fillGlass = isBlueprint ? 'rgba(56, 189, 248, 0.25)' : 'rgba(186, 230, 253, 0.45)';
  const fillFoundation = isBlueprint ? '#1E293B' : '#F1F5F9';
  const textColor = isBlueprint ? '#BAE6FD' : '#0F172A';
  const textSub = isBlueprint ? '#7DD3FC' : '#64748B';

  /* =========================================================================
     1. PLAN VIEW (FLOOR PLAN & CAD SYMBOLS)
     ========================================================================= */
  const renderPlanView = () => {
    if (normalizedId === 'studio') {
      // 20ft x 9.5ft Studio (5,800mm x 2,250mm, 154 sqft)
      return (
        <svg
          viewBox="0 0 880 440"
          className="w-full h-auto max-h-[380px] select-none font-mono"
          style={{ backgroundImage: `radial-gradient(${gridPatternColor} 1px, transparent 1px)`, backgroundSize: '16px 16px' }}
        >
          {/* Outer Dimensions Lines Top & Right */}
          {/* Top dimension: 20'-0" (5,800 mm) */}
          <line x1="100" y1="40" x2="780" y2="40" stroke={strokeDim} strokeWidth="1" strokeDasharray="4,2" />
          <line x1="100" y1="30" x2="100" y2="50" stroke={strokeDim} strokeWidth="1.5" />
          <line x1="780" y1="30" x2="780" y2="50" stroke={strokeDim} strokeWidth="1.5" />
          <line x1="100" y1="40" x2="780" y2="40" stroke={strokeDim} strokeWidth="1" />
          {/* Dimension arrows */}
          <polygon points="100,40 108,37 108,43" fill={strokeDim} />
          <polygon points="780,40 772,37 772,43" fill={strokeDim} />
          <rect x="380" y="30" width="120" height="18" fill={isBlueprint ? '#0B1E36' : '#FFFFFF'} rx="3" />
          <text x="440" y="43" textAnchor="middle" fill={strokeHighlight} fontSize="11" fontWeight="bold">
            20&apos;-0&quot; [5,800 mm]
          </text>

          {/* Right dimension: 9&apos;-6&quot; (2,250 mm) */}
          <line x1="820" y1="80" x2="820" y2="380" stroke={strokeDim} strokeWidth="1" strokeDasharray="4,2" />
          <line x1="810" y1="80" x2="830" y2="80" stroke={strokeDim} strokeWidth="1.5" />
          <line x1="810" y1="380" x2="830" y2="380" stroke={strokeDim} strokeWidth="1.5" />
          <polygon points="820,80 817,88 823,88" fill={strokeDim} />
          <polygon points="820,380 817,372 823,372" fill={strokeDim} />
          <rect x="805" y="220" width="80" height="18" fill={isBlueprint ? '#0B1E36' : '#FFFFFF'} rx="3" />
          <text x="845" y="233" textAnchor="middle" fill={strokeHighlight} fontSize="10" fontWeight="bold">
            9&apos;-6&quot; [2,250 mm]
          </text>

          {/* Exterior Structural Walls (Rounded Apple Cabin capsule corners) */}
          {/* Wall thickness: 12px */}
          <rect
            x="100"
            y="80"
            width="680"
            height="300"
            rx="24"
            fill="none"
            stroke={strokeMain}
            strokeWidth="10"
          />
          {/* Interior boundary */}
          <rect
            x="110"
            y="90"
            width="660"
            height="280"
            rx="16"
            fill={isBlueprint ? '#0E2440' : '#FFFFFF'}
            stroke={strokeSecondary}
            strokeWidth="1.5"
          />

          {/* Grid Column Tags (A-1, A-2, B-1, B-2) */}
          <circle cx="100" cy="80" r="10" fill={isBlueprint ? '#1E3A8A' : '#E2E8F0'} stroke={strokeMain} strokeWidth="1.5" />
          <text x="100" y="84" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>A1</text>
          <circle cx="780" cy="80" r="10" fill={isBlueprint ? '#1E3A8A' : '#E2E8F0'} stroke={strokeMain} strokeWidth="1.5" />
          <text x="780" y="84" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>A2</text>
          <circle cx="100" cy="380" r="10" fill={isBlueprint ? '#1E3A8A' : '#E2E8F0'} stroke={strokeMain} strokeWidth="1.5" />
          <text x="100" y="384" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>B1</text>
          <circle cx="780" cy="380" r="10" fill={isBlueprint ? '#1E3A8A' : '#E2E8F0'} stroke={strokeMain} strokeWidth="1.5" />
          <text x="780" y="384" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>B2</text>

          {/* Crane Lift Corner Points (4x ISO twistlock pick points) */}
          <g>
            <circle cx="130" cy="110" r="5" fill="none" stroke={strokeHighlight} strokeWidth="1.5" />
            <line x1="125" y1="110" x2="135" y2="110" stroke={strokeHighlight} strokeWidth="1" />
            <line x1="130" y1="105" x2="130" y2="115" stroke={strokeHighlight} strokeWidth="1" />
            <text x="142" y="113" fontSize="8" fill={strokeHighlight}>LIFT-1</text>

            <circle cx="750" cy="110" r="5" fill="none" stroke={strokeHighlight} strokeWidth="1.5" />
            <line x1="745" y1="110" x2="755" y2="110" stroke={strokeHighlight} strokeWidth="1" />
            <line x1="750" y1="105" x2="750" y2="115" stroke={strokeHighlight} strokeWidth="1" />
            <text x="705" y="113" fontSize="8" fill={strokeHighlight}>LIFT-2</text>

            <circle cx="130" cy="350" r="5" fill="none" stroke={strokeHighlight} strokeWidth="1.5" />
            <line x1="125" y1="350" x2="135" y2="350" stroke={strokeHighlight} strokeWidth="1" />
            <line x1="130" y1="345" x2="130" y2="355" stroke={strokeHighlight} strokeWidth="1" />
            <text x="142" y="353" fontSize="8" fill={strokeHighlight}>LIFT-3</text>

            <circle cx="750" cy="350" r="5" fill="none" stroke={strokeHighlight} strokeWidth="1.5" />
            <line x1="745" y1="350" x2="755" y2="350" stroke={strokeHighlight} strokeWidth="1" />
            <line x1="750" y1="345" x2="750" y2="355" stroke={strokeHighlight} strokeWidth="1" />
            <text x="705" y="353" fontSize="8" fill={strokeHighlight}>LIFT-4</text>
          </g>

          {/* BATHROOM POD ENCLOSURE (Left Side, 110 to 270) */}
          <rect x="110" y="90" width="160" height="280" fill={isBlueprint ? '#122D4F' : '#F8FAFC'} stroke={strokeSecondary} strokeWidth="2" />
          <text x="190" y="110" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>BATHROOM POD</text>
          <text x="190" y="122" textAnchor="middle" fontSize="8" fill={textSub}>W: 5&apos;-2&quot; × L: 8&apos;-10&quot;</text>

          {/* Shower Stall (36" x 36") */}
          <rect x="115" y="130" width="95" height="95" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="3,3" />
          <line x1="115" y1="130" x2="210" y2="225" stroke={strokeDim} strokeWidth="0.75" />
          <line x1="210" y1="130" x2="115" y2="225" stroke={strokeDim} strokeWidth="0.75" />
          <circle cx="162" cy="177" r="4" fill="none" stroke={strokeHighlight} strokeWidth="1.5" />
          <text x="162" y="195" textAnchor="middle" fontSize="7" fill={textSub}>SHOWER DRAIN Ø2&quot;</text>

          {/* Toilet with 30" code clearance */}
          <ellipse cx="150" cy="275" rx="14" ry="18" fill="none" stroke={strokeSecondary} strokeWidth="1.5" />
          <rect x="132" y="245" width="36" height="15" rx="2" fill="none" stroke={strokeSecondary} strokeWidth="1.5" />
          <circle cx="150" cy="275" r="3" fill={strokeHighlight} />
          <text x="150" y="305" textAnchor="middle" fontSize="7" fill={textSub}>WC (3&quot; DWV DROP)</text>

          {/* Vanity Sink */}
          <rect x="120" y="325" width="55" height="35" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.5" />
          <ellipse cx="147" cy="342" rx="14" ry="10" fill="none" stroke={strokeDim} strokeWidth="1" />
          <text x="147" y="358" textAnchor="middle" fontSize="7" fill={textSub}>VANITY</text>

          {/* Bathroom Sliding Pocket Door */}
          <line x1="270" y1="210" x2="270" y2="270" stroke={strokeMain} strokeWidth="3" strokeDasharray="6,3" />
          <text x="275" y="244" fontSize="8" fill={strokeHighlight} transform="rotate(90,275,244)">28&quot; POCKET DOOR</text>

          {/* KITCHENETTE GALLEY COUNTERTOP (Top Center: 300 to 520, Y: 90 to 160) */}
          <rect x="300" y="90" width="220" height="70" fill={isBlueprint ? '#13335A' : '#F1F5F9'} stroke={strokeSecondary} strokeWidth="1.5" />
          <text x="410" y="110" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>KITCHENETTE MILLWORK</text>

          {/* Kitchen Sink */}
          <rect x="315" y="105" width="60" height="45" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.2" />
          <ellipse cx="345" cy="127" rx="18" ry="14" fill="none" stroke={strokeDim} strokeWidth="1" />
          <circle cx="345" cy="127" r="2.5" fill={strokeHighlight} />
          <text x="345" y="142" textAnchor="middle" fontSize="7" fill={textSub}>SINK (1/2&quot; PEX)</text>

          {/* Cooktop (2 Burner Induction) */}
          <rect x="390" y="105" width="55" height="45" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.2" />
          <circle cx="405" cy="127" r="10" fill="none" stroke={strokeDim} strokeWidth="1" />
          <circle cx="430" cy="127" r="8" fill="none" stroke={strokeDim} strokeWidth="1" />
          <text x="418" y="142" textAnchor="middle" fontSize="7" fill={textSub}>INDUCTION 240V</text>

          {/* Under-counter Fridge / Mech */}
          <rect x="460" y="105" width="50" height="45" rx="2" fill="none" stroke={strokeDim} strokeWidth="1" />
          <text x="485" y="130" textAnchor="middle" fontSize="7" fill={textSub}>FRIDGE</text>

          {/* LIVING / SLEEPING AREA (Right Side, 540 to 760) */}
          {/* Queen Bed Blueprint Outline (60" x 80" / 1,520mm x 2,030mm) */}
          <rect x="580" y="110" width="180" height="150" rx="6" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
          {/* Pillows */}
          <rect x="715" y="125" width="35" height="50" rx="4" fill="none" stroke={strokeDim} strokeWidth="1" />
          <rect x="715" y="195" width="35" height="50" rx="4" fill="none" stroke={strokeDim} strokeWidth="1" />
          <text x="640" y="180" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>QUEEN BED ZONE</text>
          <text x="640" y="195" textAnchor="middle" fontSize="8" fill={textSub}>60&quot; × 80&quot; [1,520 × 2,030 mm]</text>

          {/* MAIN ENTRANCE DOOR & SWING (Bottom Center, X: 360 to 440) */}
          {/* Door opening in wall */}
          <rect x="360" y="375" width="80" height="10" fill={isBlueprint ? '#0E2440' : '#FFFFFF'} />
          {/* Door leaf (36" / 915mm) */}
          <line x1="360" y1="375" x2="360" y2="305" stroke={strokeMain} strokeWidth="2.5" />
          {/* 90-degree swing arc */}
          <path d="M 360,305 A 70,70 0 0,1 430,375" fill="none" stroke={strokeDim} strokeWidth="1" strokeDasharray="3,3" />
          <text x="400" y="355" fontSize="8" fontWeight="bold" fill={strokeHighlight}>36&quot; EXTERIOR ENTRY</text>

          {/* PANORAMIC WINDOW GLAZING (Right wall & top wall glass tags) */}
          <rect x="775" y="130" width="10" height="200" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
          <text x="760" y="235" fontSize="8" fill={strokeHighlight} transform="rotate(-90,760,235)">PANORAMIC CURTAIN GLASS (Low-E)</text>

          {/* Front Window (Left of door: 280 to 350) */}
          <rect x="280" y="375" width="70" height="10" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
          <text x="315" y="405" textAnchor="middle" fontSize="7" fill={textSub}>GLAZING W1 (5&apos;0&quot; × 4&apos;0&quot;)</text>

          {/* Front Window (Right of door: 450 to 560) */}
          <rect x="450" y="375" width="110" height="10" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
          <text x="505" y="405" textAnchor="middle" fontSize="7" fill={textSub}>GLAZING W2 (7&apos;6&quot; × 5&apos;0&quot;)</text>

          {/* UTILITY PENETRATIONS & SERVICE INLETS */}
          {/* Main Electrical Load Center (MSP) */}
          <rect x="105" y="240" width="10" height="30" fill={strokeHighlight} />
          <text x="45" y="258" fontSize="8" fontWeight="bold" fill={strokeHighlight}>⚡ 100A MSP</text>

          {/* Water Inlet (3/4" PEX) */}
          <circle cx="105" cy="300" r="4" fill="#0284C7" />
          <text x="40" y="304" fontSize="8" fontWeight="bold" fill="#0284C7">💧 3/4&quot; INLET</text>

          {/* HVAC Mini-Split (Wall mounted head above 7ft) */}
          <rect x="620" y="85" width="80" height="12" rx="2" fill={isBlueprint ? '#1E3A8A' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1" />
          <text x="660" y="94" textAnchor="middle" fontSize="7" fontWeight="bold" fill={textColor}>❄ 12,000 BTU MINI-SPLIT</text>

          {/* Legend / Stamp inside drawing */}
          <g transform="translate(620, 310)">
            <rect x="0" y="0" width="150" height="55" fill={isBlueprint ? 'rgba(15,30,55,0.85)' : 'rgba(255,255,255,0.9)'} stroke={strokeDim} strokeWidth="1" rx="4" />
            <text x="8" y="14" fontSize="8" fontWeight="bold" fill={textColor}>SCALE: 1:30 ARCH CAD</text>
            <text x="8" y="26" fontSize="7" fill={textSub}>NET LIVING AREA: 154 SQ FT</text>
            <text x="8" y="38" fontSize="7" fill={textSub}>CEILING CLEAR: 8&apos;-6&quot; [2,590 mm]</text>
            <text x="8" y="48" fontSize="7" fontWeight="bold" fill={strokeHighlight}>FRAME: Q235 GALV. STEEL</text>
          </g>
        </svg>
      );
    } else if (normalizedId === 'one-bedroom') {
      // 20ft x 19ft 1-Bedroom (5,800mm x 5,800mm, 380 sqft)
      return (
        <svg
          viewBox="0 0 880 500"
          className="w-full h-auto max-h-[420px] select-none font-mono"
          style={{ backgroundImage: `radial-gradient(${gridPatternColor} 1px, transparent 1px)`, backgroundSize: '16px 16px' }}
        >
          {/* Dimension Lines */}
          <line x1="80" y1="35" x2="800" y2="35" stroke={strokeDim} strokeWidth="1" />
          <line x1="80" y1="25" x2="80" y2="45" stroke={strokeDim} strokeWidth="1.5" />
          <line x1="800" y1="25" x2="800" y2="45" stroke={strokeDim} strokeWidth="1.5" />
          <polygon points="80,35 88,32 88,38" fill={strokeDim} />
          <polygon points="800,35 792,32 792,38" fill={strokeDim} />
          <rect x="380" y="25" width="120" height="18" fill={isBlueprint ? '#0B1E36' : '#FFFFFF'} rx="3" />
          <text x="440" y="38" textAnchor="middle" fill={strokeHighlight} fontSize="11" fontWeight="bold">
            20&apos;-0&quot; [5,800 mm]
          </text>

          <line x1="835" y1="65" x2="835" y2="445" stroke={strokeDim} strokeWidth="1" />
          <line x1="825" y1="65" x2="845" y2="65" stroke={strokeDim} strokeWidth="1.5" />
          <line x1="825" y1="445" x2="845" y2="445" stroke={strokeDim} strokeWidth="1.5" />
          <polygon points="835,65 832,73 838,73" fill={strokeDim} />
          <polygon points="835,445 832,437 838,437" fill={strokeDim} />
          <rect x="815" y="245" width="90" height="18" fill={isBlueprint ? '#0B1E36' : '#FFFFFF'} rx="3" />
          <text x="860" y="258" textAnchor="middle" fill={strokeHighlight} fontSize="10" fontWeight="bold">
            19&apos;-0&quot; [5,800 mm]
          </text>

          {/* Dual Module Interlocking Outer Frame */}
          <rect x="80" y="65" width="720" height="380" rx="20" fill="none" stroke={strokeMain} strokeWidth="8" />
          <rect x="88" y="73" width="704" height="364" rx="14" fill={isBlueprint ? '#0E2440' : '#FFFFFF'} stroke={strokeSecondary} strokeWidth="1.5" />

          {/* Module Joinery Splice Line in center (Dual Chassis) */}
          <line x1="440" y1="65" x2="440" y2="445" stroke={strokeHighlight} strokeWidth="2" strokeDasharray="6,4" />
          <text x="440" y="55" textAnchor="middle" fontSize="9" fontWeight="bold" fill={strokeHighlight}>
            INTER-MODULE STRUCTURAL COUPLER (M1 / M2 SPLICE)
          </text>

          {/* MODULE 1: PRIVATE MASTER SUITE (Left Half: 88 to 440) */}
          <rect x="88" y="73" width="352" height="364" fill={isBlueprint ? 'rgba(15,40,70,0.5)' : '#F8FAFC'} />
          <text x="260" y="100" textAnchor="middle" fontSize="12" fontWeight="extrabold" fill={textColor}>
            MASTER BEDROOM SUITE
          </text>
          <text x="260" y="115" textAnchor="middle" fontSize="9" fill={textSub}>
            Private Acoustic Envelope (180 Sq Ft)
          </text>

          {/* King/Queen Bed in Master */}
          <rect x="120" y="140" width="180" height="190" rx="8" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="4,2" />
          <rect x="135" y="150" width="55" height="35" rx="3" fill="none" stroke={strokeDim} strokeWidth="1" />
          <rect x="230" y="150" width="55" height="35" rx="3" fill="none" stroke={strokeDim} strokeWidth="1" />
          <text x="210" y="235" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>KING BED (76&quot; × 80&quot;)</text>

          {/* Built-in Wardrobe / Closet */}
          <rect x="88" y="340" width="220" height="50" fill={isBlueprint ? '#13355F' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="1.2" />
          <text x="198" y="368" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>INTEGRATED WARDROBE (8&apos;0&quot; CLOSET)</text>

          {/* Master Bedroom Door */}
          <line x1="390" y1="280" x2="430" y2="280" stroke={strokeMain} strokeWidth="2.5" />
          <path d="M 430,280 A 40,40 0 0,0 430,240" fill="none" stroke={strokeDim} strokeWidth="1" strokeDasharray="3,3" />
          <text x="375" y="270" fontSize="8" fill={strokeHighlight}>32&quot; SUITE DOOR</text>

          {/* MODULE 2: GREAT ROOM & KITCHEN & BATH (Right Half: 440 to 792) */}
          {/* Bathroom Pod (Top Right corner) */}
          <rect x="580" y="73" width="212" height="150" fill={isBlueprint ? '#122D4F' : '#F1F5F9'} stroke={strokeSecondary} strokeWidth="2" />
          <text x="686" y="95" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>EN-SUITE SPA BATH POD</text>
          {/* Shower */}
          <rect x="590" y="110" width="70" height="70" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="3,3" />
          <circle cx="625" cy="145" r="3" fill={strokeHighlight} />
          <text x="625" y="160" textAnchor="middle" fontSize="7" fill={textSub}>SHOWER 36&quot;×36&quot;</text>
          {/* Toilet */}
          <ellipse cx="690" cy="150" rx="12" ry="16" fill="none" stroke={strokeSecondary} strokeWidth="1.2" />
          <text x="690" y="180" textAnchor="middle" fontSize="7" fill={textSub}>WC (3&quot; DWV)</text>
          {/* Vanity */}
          <rect x="730" y="110" width="50" height="40" rx="3" fill="none" stroke={strokeSecondary} strokeWidth="1.2" />
          <text x="755" y="135" textAnchor="middle" fontSize="7" fill={textSub}>VANITY</text>

          {/* Galley Kitchen (Along center demising wall: 450 to 570) */}
          <rect x="450" y="73" width="120" height="170" fill={isBlueprint ? '#13335A' : '#F8FAFC'} stroke={strokeSecondary} strokeWidth="1.5" />
          <text x="510" y="95" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>FULL KITCHEN</text>
          <text x="510" y="125" textAnchor="middle" fontSize="8" fill={textSub}>QUARTZ COUNTER</text>
          <rect x="460" y="135" width="45" height="35" rx="2" fill="none" stroke={strokeDim} strokeWidth="1" />
          <circle cx="482" cy="152" r="2.5" fill={strokeHighlight} />
          <text x="482" y="163" textAnchor="middle" fontSize="6" fill={textSub}>SINK</text>
          <rect x="515" y="135" width="45" height="35" rx="2" fill="none" stroke={strokeDim} strokeWidth="1" />
          <text x="537" y="155" textAnchor="middle" fontSize="6" fill={textSub}>COOKTOP</text>

          {/* Living / Dining Lounge (Bottom Right) */}
          <text x="620" y="270" textAnchor="middle" fontSize="12" fontWeight="extrabold" fill={textColor}>
            GREAT ROOM / LOUNGE
          </text>
          <text x="620" y="285" textAnchor="middle" fontSize="9" fill={textSub}>
            Open Concept Living Area (200 Sq Ft)
          </text>

          {/* Modular Sofa */}
          <rect x="520" y="310" width="180" height="65" rx="6" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="3,3" />
          <text x="610" y="348" textAnchor="middle" fontSize="8" fill={textSub}>MODULAR SECTIONAL SOFA</text>

          {/* Full Panoramic Sliding Glass Wall (Bottom Right) */}
          <rect x="510" y="437" width="220" height="8" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
          <text x="620" y="468" textAnchor="middle" fontSize="9" fontWeight="bold" fill={strokeHighlight}>
            DOUBLE SLIDING PATIO GLASS (10&apos;0&quot; CLEAR OPENING)
          </text>

          {/* Utility Tags */}
          <text x="450" y="475" fontSize="8" fontWeight="bold" fill={strokeHighlight}>⚡ 150A DUAL-BUS PANEL</text>
        </svg>
      );
    } else {
      // 30ft x 20ft 2-Bedroom Family (9,000mm x 5,800mm, 620 sqft)
      return (
        <svg
          viewBox="0 0 880 500"
          className="w-full h-auto max-h-[420px] select-none font-mono"
          style={{ backgroundImage: `radial-gradient(${gridPatternColor} 1px, transparent 1px)`, backgroundSize: '16px 16px' }}
        >
          {/* Top Dimension: 30'-0" (9,000mm) */}
          <line x1="50" y1="35" x2="830" y2="35" stroke={strokeDim} strokeWidth="1" />
          <polygon points="50,35 58,32 58,38" fill={strokeDim} />
          <polygon points="830,35 822,32 822,38" fill={strokeDim} />
          <rect x="380" y="25" width="120" height="18" fill={isBlueprint ? '#0B1E36' : '#FFFFFF'} rx="3" />
          <text x="440" y="38" textAnchor="middle" fill={strokeHighlight} fontSize="11" fontWeight="bold">
            30&apos;-0&quot; [9,000 mm]
          </text>

          {/* Side Dimension: 20'-0" */}
          <line x1="855" y1="65" x2="855" y2="445" stroke={strokeDim} strokeWidth="1" />
          <polygon points="855,65 852,73 858,73" fill={strokeDim} />
          <polygon points="855,445 852,437 858,437" fill={strokeDim} />
          <text x="860" y="258" textAnchor="middle" fill={strokeHighlight} fontSize="10" fontWeight="bold" transform="rotate(90,860,258)">
            20&apos;-0&quot; [5,800 mm]
          </text>

          {/* Outer Shell */}
          <rect x="50" y="65" width="780" height="380" rx="20" fill="none" stroke={strokeMain} strokeWidth="8" />
          <rect x="58" y="73" width="764" height="364" rx="14" fill={isBlueprint ? '#0E2440' : '#FFFFFF'} stroke={strokeSecondary} strokeWidth="1.5" />

          {/* 3 Modules: Bedroom 1 (Left), Living & Kitchen (Center), Bedroom 2 (Right) */}
          {/* Splice lines */}
          <line x1="280" y1="65" x2="280" y2="445" stroke={strokeHighlight} strokeWidth="1.5" strokeDasharray="6,4" />
          <line x1="600" y1="65" x2="600" y2="445" stroke={strokeHighlight} strokeWidth="1.5" strokeDasharray="6,4" />

          {/* BEDROOM 1 (Left Wing) */}
          <rect x="58" y="73" width="222" height="364" fill={isBlueprint ? 'rgba(15,40,70,0.5)' : '#F8FAFC'} />
          <text x="169" y="105" textAnchor="middle" fontSize="11" fontWeight="bold" fill={textColor}>BEDROOM 1 (QUEEN)</text>
          <rect x="80" y="140" width="140" height="170" rx="6" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="3,3" />
          <text x="150" y="230" textAnchor="middle" fontSize="9" fill={textSub}>QUEEN SUITE</text>

          {/* CENTER GREAT ROOM & KITCHEN */}
          <text x="440" y="105" textAnchor="middle" fontSize="13" fontWeight="extrabold" fill={textColor}>
            CENTRAL LIVING & DINING HUB
          </text>
          {/* Kitchen Island & Galley */}
          <rect x="310" y="130" width="260" height="70" fill={isBlueprint ? '#13335A' : '#F1F5F9'} stroke={strokeSecondary} strokeWidth="1.5" />
          <text x="440" y="160" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textColor}>CHEF&apos;S KITCHEN & DINING BAR</text>

          {/* Bath Pod in Center-Top */}
          <rect x="360" y="220" width="160" height="120" fill={isBlueprint ? '#122D4F' : '#E2E8F0'} stroke={strokeSecondary} strokeWidth="2" />
          <text x="440" y="250" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>CENTRAL BATH POD</text>
          <text x="440" y="270" textAnchor="middle" fontSize="8" fill={textSub}>Full Bath + Laundry Hookup</text>

          {/* BEDROOM 2 (Right Wing) */}
          <rect x="600" y="73" width="222" height="364" fill={isBlueprint ? 'rgba(15,40,70,0.5)' : '#F8FAFC'} />
          <text x="711" y="105" textAnchor="middle" fontSize="11" fontWeight="bold" fill={textColor}>BEDROOM 2 (GUEST)</text>
          <rect x="640" y="140" width="140" height="170" rx="6" fill="none" stroke={strokeSecondary} strokeWidth="1.5" strokeDasharray="3,3" />
          <text x="710" y="230" textAnchor="middle" fontSize="9" fill={textSub}>QUEEN / 2× TWINS</text>

          {/* Main Front Entrance Patio */}
          <rect x="350" y="437" width="180" height="8" fill={fillGlass} stroke={strokeMain} strokeWidth="2" />
          <text x="440" y="468" textAnchor="middle" fontSize="9" fontWeight="bold" fill={strokeHighlight}>
            GRAND SLIDING FOYER ENTRANCE
          </text>
        </svg>
      );
    }
  };

  /* =========================================================================
     2. FRONT ELEVATION (FACADE LINE DRAWING)
     ========================================================================= */
  const renderElevationView = () => {
    return (
      <svg
        viewBox="0 0 880 440"
        className="w-full h-auto max-h-[380px] select-none font-mono"
        style={{ backgroundImage: `radial-gradient(${gridPatternColor} 1px, transparent 1px)`, backgroundSize: '16px 16px' }}
      >
        {/* Height Dimension: 9'-6" (2,830mm) Overall */}
        <line x1="50" y1="90" x2="50" y2="350" stroke={strokeDim} strokeWidth="1" />
        <line x1="40" y1="90" x2="60" y2="90" stroke={strokeDim} strokeWidth="1.5" />
        <line x1="40" y1="350" x2="60" y2="350" stroke={strokeDim} strokeWidth="1.5" />
        <polygon points="50,90 47,98 53,98" fill={strokeDim} />
        <polygon points="50,350 47,342 53,342" fill={strokeDim} />
        <rect x="15" y="210" width="70" height="18" fill={isBlueprint ? '#0B1E36' : '#FFFFFF'} rx="3" />
        <text x="50" y="223" textAnchor="middle" fill={strokeHighlight} fontSize="10" fontWeight="bold">
          9&apos;-6&quot; [2,830 mm]
        </text>

        {/* Foundation Grade Line */}
        <line x1="70" y1="380" x2="830" y2="380" stroke={strokeSecondary} strokeWidth="2" />
        {/* Hatching under grade */}
        {[80, 140, 200, 260, 320, 380, 440, 500, 560, 620, 680, 740, 800].map((x) => (
          <line key={x} x1={x} y1="380" x2={x - 15} y2="395" stroke={strokeDim} strokeWidth="1" />
        ))}
        <text x="80" y="405" fontSize="9" fontWeight="bold" fill={textSub}>FINISHED GRADE LEVEL (±0.00)</text>

        {/* Foundation Piers (6 points) */}
        {[140, 280, 420, 560, 700].map((x, idx) => (
          <g key={idx}>
            <rect x={x - 20} y="340" width="40" height="40" fill={fillFoundation} stroke={strokeSecondary} strokeWidth="1.5" />
            <text x={x} y="365" textAnchor="middle" fontSize="7" fill={textSub}>PIER {idx + 1}</text>
          </g>
        ))}

        {/* Structural Steel Chassis Floor (12" / 300mm above ground) */}
        <rect x="100" y="325" width="680" height="25" fill={isBlueprint ? '#1E293B' : '#CBD5E1'} stroke={strokeMain} strokeWidth="2" />
        <text x="440" y="342" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>
          Q235 HIGH-TENSILE GALVANIZED CHASSIS BASE (+1&apos;-0&quot; AFF)
        </text>

        {/* Cabin Main Enclosure Body with Apple Cabin Capsule Curves */}
        <path
          d="M 124,100 L 756,100 Q 780,100 780,124 L 780,325 L 100,325 L 100,124 Q 100,100 124,100 Z"
          fill={isBlueprint ? '#0F243E' : '#F8FAFC'}
          stroke={strokeMain}
          strokeWidth="4"
        />

        {/* Architectural Cladding Panel Horizontal Rhythm Lines (spaced 30px) */}
        {[130, 160, 190, 220, 250, 280, 310].map((y) => (
          <line key={y} x1="102" y1={y} x2="778" y2={y} stroke={strokeDim} strokeWidth="0.75" strokeDasharray="6,2" />
        ))}

        {/* Left Side: Panoramic Low-E Window Module (130 to 330, Y: 130 to 290) */}
        <rect x="130" y="130" width="200" height="160" rx="6" fill={fillGlass} stroke={strokeMain} strokeWidth="3" />
        {/* Window Mullions */}
        <line x1="230" y1="130" x2="230" y2="290" stroke={strokeMain} strokeWidth="2" />
        <line x1="130" y1="210" x2="330" y2="210" stroke={strokeMain} strokeWidth="2" />
        {/* Glass reflection accents */}
        <line x1="150" y1="145" x2="210" y2="205" stroke={isBlueprint ? '#E0F2FE' : '#FFFFFF'} strokeWidth="1.5" strokeOpacity="0.7" />
        <line x1="250" y1="225" x2="310" y2="285" stroke={isBlueprint ? '#E0F2FE' : '#FFFFFF'} strokeWidth="1.5" strokeOpacity="0.7" />
        <text x="230" y="305" textAnchor="middle" fontSize="8" fontWeight="bold" fill={strokeHighlight}>
          DUAL-LAYER LOW-E ARGON GLAZING
        </text>

        {/* Center: Entrance Door with Vision Glass & Smart Lock */}
        <rect x="370" y="130" width="120" height="195" rx="3" fill={isBlueprint ? '#172554' : '#FFFFFF'} stroke={strokeMain} strokeWidth="2.5" />
        <rect x="390" y="150" width="80" height="85" rx="2" fill={fillGlass} stroke={strokeSecondary} strokeWidth="1.5" />
        {/* Door handle */}
        <circle cx="475" cy="235" r="4" fill={strokeHighlight} />
        <line x1="475" y1="235" x2="475" y2="250" stroke={strokeHighlight} strokeWidth="2" />
        <text x="430" y="315" textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>
          36&quot; × 80&quot; INSULATED ENTRY
        </text>

        {/* Right Side: Floor-to-Ceiling Panoramic Glass (530 to 740, Y: 120 to 310) */}
        <rect x="530" y="120" width="220" height="190" rx="6" fill={fillGlass} stroke={strokeMain} strokeWidth="3" />
        <line x1="640" y1="120" x2="640" y2="310" stroke={strokeMain} strokeWidth="2.5" />
        <text x="635" y="215" textAnchor="middle" fontSize="9" fontWeight="bold" fill={textColor}>
          CURTAIN WALL GLASS FACADE
        </text>

        {/* Roof Parapet & Solar PV Array (if equipped) */}
        <rect x="100" y="92" width="680" height="10" rx="3" fill={strokeSecondary} />
        {hasSolar ? (
          <g>
            <rect x="140" y="70" width="600" height="22" rx="2" fill={isBlueprint ? '#1E3A8A' : '#0F172A'} stroke={strokeHighlight} strokeWidth="1.5" />
            {[190, 240, 290, 340, 390, 440, 490, 540, 590, 640, 690].map((x) => (
              <line key={x} x1={x} y1="70" x2={x} y2="92" stroke={strokeHighlight} strokeWidth="1" />
            ))}
            <text x="440" y="62" textAnchor="middle" fontSize="9" fontWeight="bold" fill={strokeHighlight}>
              ☀ 3.6kW ROOF-INTEGRATED MONOCRYSTALLINE PV SOLAR ARRAY
            </text>
          </g>
        ) : (
          <text x="440" y="85" textAnchor="middle" fontSize="8" fill={textSub}>
            SEAMLESS EPDM / TPO ROOF MEMBRANE (1.5° PITCH TO REAR DRAIN)
          </text>
        )}

        {/* Crane Hook Pick Callouts */}
        <g>
          <path d="M 120,92 L 120,50 L 140,50" fill="none" stroke={strokeHighlight} strokeWidth="1.5" strokeDasharray="3,2" />
          <circle cx="120" cy="92" r="4" fill={strokeHighlight} />
          <text x="145" y="53" fontSize="8" fontWeight="bold" fill={strokeHighlight}>CRANE RIG LUG (12,000 LBS WLL)</text>

          <path d="M 760,92 L 760,50 L 740,50" fill="none" stroke={strokeHighlight} strokeWidth="1.5" strokeDasharray="3,2" />
          <circle cx="760" cy="92" r="4" fill={strokeHighlight} />
          <text x="615" y="53" fontSize="8" fontWeight="bold" fill={strokeHighlight}>CRANE RIG LUG (12,000 LBS WLL)</text>
        </g>
      </svg>
    );
  };

  /* =========================================================================
     3. FOUNDATION & MEP ENGINEERING SECTION
     ========================================================================= */
  const renderFoundationView = () => {
    return (
      <svg
        viewBox="0 0 880 440"
        className="w-full h-auto max-h-[380px] select-none font-mono"
        style={{ backgroundImage: `radial-gradient(${gridPatternColor} 1px, transparent 1px)`, backgroundSize: '16px 16px' }}
      >
        {/* Title */}
        <text x="440" y="30" textAnchor="middle" fontSize="13" fontWeight="bold" fill={textColor}>
          FOUNDATION ANCHOR BOLT GRID & MEP UTILITY PENETRATION MAP
        </text>
        <text x="440" y="46" textAnchor="middle" fontSize="9" fill={textSub}>
          Tolerance: ±1/8&quot; (3mm) • Concrete Compressive Strength: Min. 3,000 PSI @ 28 Days
        </text>

        {/* Foundation Slab / Pier Outline */}
        <rect x="120" y="70" width="640" height="280" rx="8" fill="none" stroke={strokeMain} strokeWidth="4" />
        <rect x="126" y="76" width="628" height="268" rx="4" fill={isBlueprint ? 'rgba(15,35,65,0.4)' : '#F8FAFC'} stroke={strokeSecondary} strokeWidth="1" strokeDasharray="4,4" />

        {/* 6 Structural Pier Locations with Anchor Bolts */}
        {[
          { x: 140, y: 90, label: 'P-1 (CORNER)' },
          { x: 440, y: 90, label: 'P-2 (MID-SPAN)' },
          { x: 740, y: 90, label: 'P-3 (CORNER)' },
          { x: 140, y: 330, label: 'P-4 (CORNER)' },
          { x: 440, y: 330, label: 'P-5 (MID-SPAN)' },
          { x: 740, y: 330, label: 'P-6 (CORNER)' },
        ].map((pier, i) => (
          <g key={i}>
            <circle cx={pier.x} cy={pier.y} r="22" fill={fillFoundation} stroke={strokeSecondary} strokeWidth="1.5" />
            <circle cx={pier.x} cy={pier.y} r="6" fill={strokeHighlight} />
            <line x1={pier.x - 12} y1={pier.y} x2={pier.x + 12} y2={pier.y} stroke={strokeHighlight} strokeWidth="1.5" />
            <line x1={pier.x} y1={pier.y - 12} x2={pier.x} y2={pier.y + 12} stroke={strokeHighlight} strokeWidth="1.5" />
            <text x={pier.x} y={pier.y > 200 ? pier.y + 35 : pier.y - 28} textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>
              {pier.label}
            </text>
            <text x={pier.x} y={pier.y > 200 ? pier.y + 45 : pier.y - 18} textAnchor="middle" fontSize="7" fill={textSub}>
              2× 5/8&quot; HDG BOLTS
            </text>
          </g>
        ))}

        {/* Utility Penetration Sleeves */}
        {/* 1. Electrical Ingress Conduit */}
        <g transform="translate(190, 160)">
          <rect x="0" y="0" width="80" height="50" rx="4" fill={isBlueprint ? '#1E293B' : '#FEF3C7'} stroke="#D97706" strokeWidth="1.5" />
          <circle cx="20" cy="25" r="8" fill="#F59E0B" />
          <text x="35" y="22" fontSize="8" fontWeight="bold" fill="#B45309">ELECTRICAL</text>
          <text x="35" y="34" fontSize="7" fill="#B45309">2&quot; SCH 40 PVC</text>
          <text x="35" y="44" fontSize="6" fill={textSub}>100A/150A FEED</text>
        </g>

        {/* 2. Water Service Inlet */}
        <g transform="translate(190, 230)">
          <rect x="0" y="0" width="80" height="50" rx="4" fill={isBlueprint ? '#1E293B' : '#E0F2FE'} stroke="#0284C7" strokeWidth="1.5" />
          <circle cx="20" cy="25" r="7" fill="#0284C7" />
          <text x="35" y="22" fontSize="8" fontWeight="bold" fill="#0369A1">WATER INLET</text>
          <text x="35" y="34" fontSize="7" fill="#0369A1">3/4&quot; PEX-A</text>
          <text x="35" y="44" fontSize="6" fill={textSub}>55 PSI RATED</text>
        </g>

        {/* 3. Sewer Waste Drain Drop */}
        <g transform="translate(300, 195)">
          <rect x="0" y="0" width="90" height="55" rx="4" fill={isBlueprint ? '#1E293B' : '#F1F5F9'} stroke="#64748B" strokeWidth="1.5" />
          <circle cx="22" cy="27" r="10" fill="#475569" />
          <text x="38" y="24" fontSize="8" fontWeight="bold" fill="#334155">SEWER DWV</text>
          <text x="38" y="36" fontSize="7" fill="#334155">3&quot; PVC DROP</text>
          <text x="38" y="46" fontSize="6" fill={textSub}>1/4&quot;/FT SLOPE</text>
        </g>

        {/* 4. HVAC Line-Set Wall Sleeve */}
        <g transform="translate(620, 195)">
          <rect x="0" y="0" width="95" height="55" rx="4" fill={isBlueprint ? '#1E293B' : '#ECFDF5'} stroke="#059669" strokeWidth="1.5" />
          <circle cx="22" cy="27" r="8" fill="#10B981" />
          <text x="36" y="24" fontSize="8" fontWeight="bold" fill="#047857">HVAC SLEEVE</text>
          <text x="36" y="36" fontSize="7" fill="#047857">3&quot; THRU-WALL</text>
          <text x="36" y="46" fontSize="6" fill={textSub}>LINE-SET + COND.</text>
        </g>

        {/* Dimensions across piers */}
        <line x1="140" y1="390" x2="440" y2="390" stroke={strokeDim} strokeWidth="1" />
        <polygon points="140,390 148,387 148,393" fill={strokeDim} />
        <polygon points="440,390 432,387 432,393" fill={strokeDim} />
        <text x="290" y="405" textAnchor="middle" fontSize="9" fontWeight="bold" fill={strokeHighlight}>
          10&apos;-0&quot; [3,050 mm]
        </text>

        <line x1="440" y1="390" x2="740" y2="390" stroke={strokeDim} strokeWidth="1" />
        <polygon points="440,390 448,387 448,393" fill={strokeDim} />
        <polygon points="740,390 732,387 732,393" fill={strokeDim} />
        <text x="590" y="405" textAnchor="middle" fontSize="9" fontWeight="bold" fill={strokeHighlight}>
          10&apos;-0&quot; [3,050 mm]
        </text>
      </svg>
    );
  };

  return (
    <div className={`rounded-2xl border ${isBlueprint ? 'border-sky-900 shadow-md' : 'border-gray-200 shadow-xs'} overflow-hidden`}>
      {/* Top Drawing Control Bar */}
      <div className={`p-3.5 flex flex-wrap items-center justify-between gap-3 border-b ${isBlueprint ? 'bg-[#071526] border-sky-950 text-white' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-mono text-xs font-black tracking-wider uppercase">
            ARCHITECTURAL LINE DRAWING &amp; CAD BLUEPRINT
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-orange-100 text-orange-800 border border-orange-200">
            {modelName}
          </span>
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
                <span>VIEW 1: ARCHITECTURAL FLOOR PLAN &amp; LIVING LAYOUT</span>
                <span className="text-[10px] opacity-75">DIMENSIONS: IMPERIAL &amp; METRIC</span>
              </div>
              {renderPlanView()}
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
                <span className="text-[10px] opacity-75">6-PIER BOLT LAYOUT &amp; SERVICE INGRESS</span>
              </div>
              {renderFoundationView()}
            </div>
          </div>
        )}

        {activeTab === 'plan' && (
          <div>
            <div className="text-center font-mono text-xs font-bold mb-3">PLAN VIEW (FLOOR PLAN &amp; INTERIOR LAYOUT)</div>
            {renderPlanView()}
          </div>
        )}

        {activeTab === 'elevation' && (
          <div>
            <div className="text-center font-mono text-xs font-bold mb-3">FRONT ELEVATION &amp; ENCLOSURE ENVELOPE</div>
            {renderElevationView()}
          </div>
        )}

        {activeTab === 'foundation' && (
          <div>
            <div className="text-center font-mono text-xs font-bold mb-3">FOUNDATION ANCHOR GRID &amp; UTILITY SCHEMATIC</div>
            {renderFoundationView()}
          </div>
        )}
      </div>

      {/* Drawing Metadata Footer */}
      <div className={`p-3 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 border-t ${isBlueprint ? 'bg-[#071526] border-sky-950 text-sky-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
        <div className="flex items-center gap-3">
          <span>APPROVED FOR PRODUCTION: <strong className="text-orange-500">YES</strong></span>
          <span>•</span>
          <span>AUTOCAD REV: <strong>2026.4</strong></span>
          <span>•</span>
          <span>IBC &amp; HUD CODE COMPLIANT</span>
        </div>
        <div className="text-[10px]">
          All dimensions field-verified prior to foundation pouring.
        </div>
      </div>
    </div>
  );
};
