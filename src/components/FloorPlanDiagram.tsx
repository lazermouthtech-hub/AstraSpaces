import React, { useState } from 'react';
import { FloorPlanId } from '../types';

export interface FloorPlanDiagramProps {
  planId?: FloorPlanId | string;
  modelId?: string;
  hasWardrobe?: boolean;
  hasTvConsole?: boolean;
  hasHvacMiniSplit?: boolean;
  hasKitchenette?: boolean;
  hasBathPod?: boolean;
  className?: string;
  showLabels?: boolean;
  modelName?: string;
  dimensions?: string;
  is40ft?: boolean;
  is30ft?: boolean;
  layoutVariant20ft?: 'split' | 'side-by-side';
  onLayoutVariant20ftChange?: (variant: 'split' | 'side-by-side') => void;
}

export function FloorPlanDiagram({
  planId = '2-bed-1-bath',
  modelId = 'expandable-20ft',
  hasWardrobe = false,
  hasTvConsole = false,
  hasHvacMiniSplit = false,
  hasKitchenette = true,
  hasBathPod = true,
  className = 'w-full h-44',
  showLabels = false,
  modelName,
  dimensions,
  is40ft: propIs40ft,
  is30ft: propIs30ft,
  layoutVariant20ft: propVariant20ft,
  onLayoutVariant20ftChange,
}: FloorPlanDiagramProps) {
  // Architectural color palette
  const wallStroke = '#334155';
  const interiorWallStroke = '#475569';
  const floorFill = '#fdfbf7';
  const bedWood = '#1e293b';
  const bedLinen = '#ffffff';
  const duvetFill = '#475569';
  const bathFloor = '#cbd5e1';
  const fixtureFill = '#f8fafc';
  const sofaFill = '#94a3b8';
  const woodTable = '#334155';

  const mId = (modelId || '').toLowerCase();
  const mName = (modelName || '').toLowerCase();

  // Model Category Resolution
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

  const isExpandable = !isAppleCabin && !isSpaceCapsule && !isFolding;

  const is40ft =
    isExpandable &&
    (Boolean(propIs40ft) || mId.includes('40ft') || mName.includes('40ft'));
  const is30ft =
    isExpandable &&
    !is40ft &&
    (Boolean(propIs30ft) || mId.includes('30ft') || mName.includes('30ft'));
  const is10ft = isExpandable && (mId.includes('10ft') || mName.includes('10ft'));
  const is20ft = isExpandable && !is30ft && !is40ft && !is10ft;

  // Normalized active planId
  const activePlanId: FloorPlanId = (planId || '2-bed-1-bath') as FloorPlanId;

  // Dimension string
  const dimStr =
    dimensions ||
    (is40ft
      ? '11,800mm × 6,400mm (38.7′ × 21.0′)'
      : is30ft
      ? '9,000mm × 6,400mm (29.5′ × 21.0′)'
      : is10ft
      ? '3,100mm × 5,900mm (10.2′ × 19.4′)'
      : isAppleCabin
      ? (mId.includes('40ft') || mId.includes('ac04') || mId === 'two-bedroom'
          ? '11,800mm × 3,500mm (38.7′ × 11.5′)'
          : '5,800mm × 2,200mm (19.0′ × 7.2′)')
      : isSpaceCapsule
      ? '8,500mm × 3,300mm (27.9′ × 10.8′)'
      : '6,400mm × 5,900mm (21.0′ × 19.4′)');

  // Common Bed Component
  const renderBed = (x: number, y: number, w = 32, h = 40, label = '') => {
    return (
      <g transform={`translate(${x}, ${y})`}>
        <rect x="0" y="0" width={w} height="4" rx="1" fill={bedWood} />
        <rect x="1" y="4" width={w - 2} height={h - 4} rx="2" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
        <rect x="3" y="6" width={(w - 8) / 2} height="8" rx="2" fill={bedLinen} stroke="#cbd5e1" strokeWidth="0.8" />
        <rect x={5 + (w - 8) / 2} y="6" width={(w - 8) / 2} height="8" rx="2" fill={bedLinen} stroke="#cbd5e1" strokeWidth="0.8" />
        <rect x="2" y="17" width={w - 4} height={h - 19} rx="1.5" fill={duvetFill} opacity="0.85" />
        <rect x="-8" y="2" width="6" height="8" rx="1" fill={bedWood} />
        <circle cx="-5" cy="6" r="1.5" fill="#ffffff" />
        <rect x={w + 2} y="2" width="6" height="8" rx="1" fill={bedWood} />
        <circle cx={w + 5} cy="6" r="1.5" fill="#ffffff" />
        {label && (
          <text x={w / 2} y={h - 8} textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="#ffffff">
            {label}
          </text>
        )}
      </g>
    );
  };

  // Kitchen counter with sink & stove (Single L-Shaped Kitchenette with strict window clearance)
  const renderKitchen = (x: number, y: number, w: number, h: number, horizontal = true, isL = (x === 18 && y === 16)) => {
    if (isL) {
      const returnL = 16;
      const returnW = 14;
      return (
        <g transform={`translate(${x}, ${y})`}>
          {/* Single Unified L-Shaped Counter Base */}
          <path
            d={`M 0 0 L ${w} 0 L ${w} ${h} L ${returnW} ${h} L ${returnW} ${h + returnL} L 0 ${h + returnL} Z`}
            fill="#334155"
            stroke="#1e293b"
            strokeWidth="1"
          />
          {/* Undermount Double Sink positioned directly under Rear Exterior Window */}
          <rect x={w / 2 - 10} y="3" width="16" height={h - 6} rx="2" fill="#94a3b8" />
          <circle cx={w / 2 - 2} cy={h / 2} r="2" fill="#e2e8f0" />
          {/* 2-Burner Ceramic Induction Cooktop on L-Return Arm */}
          <circle cx={returnW / 2} cy={h + 5} r="3.5" fill="#0f172a" stroke="#f97316" strokeWidth="1" />
          <circle cx={returnW / 2} cy={h + 12} r="3.5" fill="#0f172a" stroke="#f97316" strokeWidth="1" />
        </g>
      );
    }
    return (
      <g transform={`translate(${x}, ${y})`}>
        <rect x="0" y="0" width={w} height={h} rx="1.5" fill="#334155" stroke="#1e293b" strokeWidth="1" />
        {horizontal ? (
          <>
            <rect x="4" y="3" width="14" height={h - 6} rx="2" fill="#94a3b8" />
            <circle cx="11" cy={h / 2} r="2" fill="#e2e8f0" />
            <circle cx={w - 18} cy={h / 2} r="4" fill="#0f172a" stroke="#f97316" strokeWidth="1" />
            <circle cx={w - 8} cy={h / 2} r="4" fill="#0f172a" stroke="#f97316" strokeWidth="1" />
            <rect x={w + 2} y="0" width="18" height={h} rx="1" fill="#64748b" />
          </>
        ) : (
          <>
            <rect x="3" y="4" width={w - 6} height="14" rx="2" fill="#94a3b8" />
            <circle cx={w / 2} cy={11} r="2" fill="#e2e8f0" />
            <circle cx={w / 2} cy={h - 12} r="4" fill="#0f172a" stroke="#f97316" strokeWidth="1" />
          </>
        )}
      </g>
    );
  };

  // Detailed Sofa
  const renderDetailedSofa = (x: number, y: number, w: number, h: number, facing: 'east' | 'south' = 'east') => {
    if (facing === 'east') {
      return (
        <g id="detailed-sofa-east">
          <rect x={x - 1} y={y - 1} width={w + 2} height={h + 2} rx="2" fill="#1e293b" opacity="0.6" />
          <rect x={x} y={y} width={w} height={h} rx="3" fill={sofaFill} stroke="#475569" strokeWidth="1" />
          <rect x={x} y={y} width="4" height={h} rx="1" fill="#475569" />
          <rect x={x} y={y} width={w} height="4" rx="1.5" fill="#334155" />
          <rect x={x} y={y + h - 4} width={w} height="4" rx="1.5" fill="#334155" />
          <rect x={x + 4} y={y + 5} width={w - 5} height={(h - 12) / 2} rx="1.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x={x + 4} y={y + 7 + (h - 12) / 2} width={w - 5} height={(h - 12) / 2} rx="1.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x={x + 4} y={y + 6} width="5" height="7" rx="1" fill="#18181b" transform={`rotate(-15, ${x + 6}, ${y + 9})`} />
          <rect x={x + 4} y={y + h - 13} width="5" height="7" rx="1" fill="#e2e8f0" transform={`rotate(15, ${x + 6}, ${y + h - 10})`} />
          <rect x={x + 2} y={y + h - 5} width={w - 2} height="3" rx="0.5" fill="#475569" />
        </g>
      );
    }
    return (
      <g id="detailed-sofa-south">
        <rect x={x - 1} y={y - 1} width={w + 2} height={h + 2} rx="2" fill="#1e293b" opacity="0.6" />
        <rect x={x} y={y} width={w} height={h} rx="3" fill={sofaFill} stroke="#475569" strokeWidth="1" />
        <rect x={x} y={y} width={w} height="4" rx="1" fill="#475569" />
        <rect x={x} y={y} width="4" height={h} rx="1.5" fill="#334155" />
        <rect x={x + w - 4} y={y} width="4" height={h} rx="1.5" fill="#334155" />
        <rect x={x + 5} y={y + 4} width={(w - 12) / 2} height={h - 5} rx="1.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
        <rect x={x + 7 + (w - 12) / 2} y={y + 4} width={(w - 12) / 2} height={h - 5} rx="1.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
      </g>
    );
  };

  // Universal Architectural CAD Door Component
  // Clean, millimeter-accurate 90-degree door swing with hinge pin, door leaf, jamb stop, and swing arc
  const renderDoor = (
    hx: number,
    hy: number,
    cxOrWidth: number = 14,
    cyOrWall: number | 'h' | 'v' = 'v',
    oxOrSwing?: number | 's' | 'n' | 'w' | 'e',
    oyOrLabel?: number | string,
    sweep: 0 | 1 = 0,
    label = ''
  ) => {
    // If called with full explicit coordinates: (hx, hy, cx, cy, ox, oy, sweep, label)
    if (typeof cyOrWall === 'number' && typeof oxOrSwing === 'number' && typeof oyOrLabel === 'number') {
      const cx = cxOrWidth;
      const cy = cyOrWall;
      const ox = oxOrSwing;
      const oy = oyOrLabel;
      const r = Math.round(Math.hypot(cx - hx, cy - hy) * 10) / 10;
      const arcPath = `M ${cx} ${cy} A ${r} ${r} 0 0 ${sweep} ${ox} ${oy}`;
      const midX = (hx + ox) / 2;
      const midY = (hy + oy) / 2;

      return (
        <g className="architectural-door">
          {/* Jamb stop */}
          <circle cx={cx} cy={cy} r="0.9" fill="#475569" />
          {/* Hinge Pin */}
          <circle cx={hx} cy={hy} r="1.3" fill="#d97706" stroke="#92400e" strokeWidth="0.5" />
          {/* Solid Timber / Composite Door Leaf */}
          <line
            x1={hx}
            y1={hy}
            x2={ox}
            y2={oy}
            stroke="#9a3412"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* 90° Swing Arc */}
          <path
            d={arcPath}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="0.8"
            strokeDasharray="2,1.5"
          />
          {label && (
            <text
              x={midX}
              y={midY - 1.5}
              textAnchor="middle"
              fontSize="3.2"
              fontWeight="bold"
              fill="#64748b"
            >
              {label}
            </text>
          )}
        </g>
      );
    }

    // Otherwise standard directional wall-based calculation
    const width = typeof cxOrWidth === 'number' ? cxOrWidth : 14;
    const wall = (cyOrWall as 'h' | 'v') || 'v';
    const swing = (oxOrSwing as 's' | 'n' | 'w' | 'e') || 'w';
    const lbl = typeof oyOrLabel === 'string' ? oyOrLabel : label;
    const r = width;

    let cx = hx;
    let cy = hy;
    let ox = hx;
    let oy = hy;
    let sw: 0 | 1 = 0;

    if (wall === 'h') {
      if (swing === 's') {
        cx = hx + r;
        cy = hy;
        ox = hx;
        oy = hy + r;
        sw = 1;
      } else {
        cx = hx + r;
        cy = hy;
        ox = hx;
        oy = hy - r;
        sw = 0;
      }
    } else {
      if (swing === 'w') {
        // Vertical wall, opening was from hy - r to hy, swings into room to the West
        cx = hx;
        cy = hy - r;
        ox = hx - r;
        oy = hy;
        sw = 0;
      } else {
        // Vertical wall, opening was from hy - r to hy, swings into room to the East
        cx = hx;
        cy = hy - r;
        ox = hx + r;
        oy = hy;
        sw = 1;
      }
    }

    const arcPath = `M ${cx} ${cy} A ${r} ${r} 0 0 ${sw} ${ox} ${oy}`;
    return (
      <g className="architectural-door">
        <circle cx={cx} cy={cy} r="0.9" fill="#475569" />
        <circle cx={hx} cy={hy} r="1.3" fill="#d97706" stroke="#92400e" strokeWidth="0.5" />
        <line
          x1={hx}
          y1={hy}
          x2={ox}
          y2={oy}
          stroke="#9a3412"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d={arcPath}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="0.8"
          strokeDasharray="2,1.5"
        />
        {lbl && (
          <text
            x={(hx + ox) / 2}
            y={(hy + oy) / 2 - 1.5}
            textAnchor="middle"
            fontSize="3.2"
            fontWeight="bold"
            fill="#64748b"
          >
            {lbl}
          </text>
        )}
      </g>
    );
  };

  const renderSlidingPatioDoor = (x1: number, x2: number, y: number, label = 'DOUBLE SLIDING PATIO ENTRY (1880×2220mm)') => {
    const w = x2 - x1;
    const midX = (x1 + x2) / 2;
    return (
      <g id="main-entrance">
        {/* Track Line */}
        <line x1={x1} y1={y} x2={x2} y2={y} stroke="#0284c7" strokeWidth="2.5" />
        {/* Left Sash */}
        <rect x={x1 + 1} y={y - 2.8} width={w * 0.52} height={2.2} rx={0.5} fill="#bae6fd" stroke="#0284c7" strokeWidth="0.8" />
        {/* Right Sash */}
        <rect x={midX - 1} y={y - 0.4} width={w * 0.52} height={2.2} rx={0.5} fill="#bae6fd" stroke="#0284c7" strokeWidth="0.8" />
        {/* Direction indicators */}
        <text x={x1 + w * 0.25} y={y - 3.8} fontSize="2.8" fill="#0284c7" textAnchor="middle" fontWeight="bold">◀ SLIDE</text>
        <text x={x2 - w * 0.25} y={y + 5.5} fontSize="2.8" fill="#0284c7" textAnchor="middle" fontWeight="bold">SLIDE ▶</text>
        {/* Jamb Stops */}
        <rect x={x1 - 1.5} y={y - 3.5} width={3} height={7} fill="#1e293b" rx="0.5" />
        <rect x={x2 - 1.5} y={y - 3.5} width={3} height={7} fill="#1e293b" rx="0.5" />
        {showLabels && (
          <text x={midX} y={y + 9} textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#0284c7">
            {label}
          </text>
        )}
      </g>
    );
  };

  // Central Bathroom Pod for Expandable House
  const renderRestroom = () => (
    <g id="restroom-pod">
      <rect x="85" y="12" width="50" height="42" fill={bathFloor} stroke={interiorWallStroke} strokeWidth="2" rx="1" />
      {/* Shower Enclosure */}
      <rect x="87" y="14" width="21" height="22" fill="#93c5fd" opacity="0.65" stroke="#3b82f6" strokeWidth="1" />
      <circle cx="97.5" cy="25" r="3.5" fill="#1d4ed8" />
      <line x1="108" y1="14" x2="108" y2="36" stroke="#0284c7" strokeWidth="1.5" />
      {/* Toilet */}
      <rect x="112" y="14" width="12" height="5" rx="1.5" fill={fixtureFill} stroke="#94a3b8" strokeWidth="1" />
      <ellipse cx="118" cy="24" rx="5" ry="6" fill={fixtureFill} stroke="#94a3b8" strokeWidth="1" />
      {/* Vanity Sink */}
      <rect x="122" y="32" width="11" height="18" rx="1" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
      <ellipse cx="127.5" cy="41" rx="3.5" ry="5.5" fill="#ffffff" stroke="#64748b" strokeWidth="1" />
      <line x1="133.5" y1="33" x2="133.5" y2="49" stroke="#38bdf8" strokeWidth="1.5" />
      {/* Restroom Door Opening at Y = 54 (X: 94 to 108) with authentic door swing */}
      <line x1="85" y1="54" x2="94" y2="54" stroke={interiorWallStroke} strokeWidth="2" />
      <line x1="108" y1="54" x2="135" y2="54" stroke={interiorWallStroke} strokeWidth="2" />
      {renderDoor(94, 54, 14, 'h', 's', showLabels ? 'BATH' : '')}
      {showLabels && (
        <text x="112" y="38" textAnchor="middle" fontSize="4.2" fontWeight="bold" fill="#1e293b">
          BATH POD
        </text>
      )}
    </g>
  );

  /* =========================================================================
     1. APPLE CABIN ARCHITECTURAL VECTOR FLOOR PLAN
     ========================================================================= */
  if (isAppleCabin) {
    const isAC04 = mId.includes('40ft') || mId.includes('ac04') || mId === 'two-bedroom';
    const isAC02 = mId.includes('ac02') || mId === 'one-bedroom';

    return (
      <div className={`relative flex items-center justify-center p-3 bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] rounded-2xl border border-sky-200/80 shadow-inner overflow-hidden select-none ${className}`}>
        <svg viewBox="0 0 280 140" className="w-full h-full max-h-[460px] drop-shadow-sm font-sans" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cabin-parquet" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 0 4 L 8 4 M 4 0 L 4 8" fill="none" stroke="#e2e8f0" strokeWidth="0.4" />
            </pattern>
          </defs>

          {/* Dimension Header */}
          {showLabels && (
            <g id="dimension-lines">
              <line x1="20" y1="8" x2="260" y2="8" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3,1" />
              <line x1="20" y1="5" x2="20" y2="11" stroke="#64748b" strokeWidth="1" />
              <line x1="260" y1="5" x2="260" y2="11" stroke="#64748b" strokeWidth="1" />
              <rect x="90" y="4" width="100" height="9" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
              <text x="140" y="10.5" textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="#0284c7">
                APPLE CABIN • LENGTH: {dimStr.split(' ')[0]}
              </text>
            </g>
          )}

          {/* Monolithic Capsule Shell with Rounded Aerodynamic Corners */}
          <rect x="20" y="18" width="240" height="106" rx="20" fill="#fdfbf7" stroke={wallStroke} strokeWidth="3" />
          <rect x="22" y="20" width="236" height="102" rx="18" fill="url(#cabin-parquet)" opacity="0.7" />

          {/* Front Curved Low-E Panoramic Curtain Wall (Bottom side) */}
          <path d="M 40 124 L 240 124" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
          <text x="140" y="130" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#0284c7">
            PANORAMIC CURVED LOW-E GLASS CURTAIN WALL
          </text>

          {/* Spa Bathroom Pod (Left side) */}
          <rect x="24" y="22" width="60" height="60" rx="3" fill={bathFloor} stroke={interiorWallStroke} strokeWidth="2" />
          <rect x="26" y="24" width="26" height="30" fill="#93c5fd" opacity="0.7" stroke="#0284c7" strokeWidth="1" />
          <circle cx="39" cy="39" r="3" fill="#1d4ed8" />
          <line x1="52" y1="24" x2="52" y2="54" stroke="#0284c7" strokeWidth="1.2" />
          <rect x="58" y="24" width="14" height="6" rx="1.5" fill={fixtureFill} stroke="#94a3b8" strokeWidth="1" />
          <ellipse cx="65" cy="36" rx="5" ry="6" fill={fixtureFill} stroke="#94a3b8" strokeWidth="1" />
          <rect x="62" y="52" width="16" height="20" rx="1.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
          <text x="54" y="74" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#1e293b">
            SPA BATH POD
          </text>

          {/* Center Bar Kitchenette */}
          <rect x="90" y="22" width="48" height="20" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1" />
          <rect x="94" y="25" width="14" height="14" rx="2" fill="#94a3b8" />
          <circle cx="101" cy="32" r="2.5" fill="#e2e8f0" />
          <circle cx="124" cy="32" r="3.5" fill="#0f172a" stroke="#f97316" strokeWidth="1" />
          <circle cx="132" cy="32" r="3.5" fill="#0f172a" stroke="#f97316" strokeWidth="1" />
          <text x="114" y="48" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#475569">
            BAR KITCHENETTE
          </text>

          {/* Right: Master Capsule Bed Suite */}
          {renderBed(180, 26, 68, 56, isAC04 || isAC02 ? 'KING SUITE' : 'QUEEN CAPSULE')}
          <text x="214" y="94" textAnchor="middle" fontSize="4" fontWeight="bold" fill="#1e293b">
            {isAC04 ? 'DELUXE SLEEPING CAPSULE' : 'PANORAMIC QUEEN BED'}
          </text>

          {/* Modern Living Lounge Zone (Bottom-Center) */}
          <rect x="92" y="80" width="60" height="34" rx="3" fill="#e0e7ff" opacity="0.6" />
          {renderDetailedSofa(96, 84, 14, 28, 'east')}
          <rect x="116" y="88" width="16" height="18" rx="1.5" fill={woodTable} stroke="#451a03" strokeWidth="0.8" />
          <text x="124" y="118" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#1e293b">
            LIVING LOUNGE
          </text>
        </svg>
      </div>
    );
  }

  /* =========================================================================
     2. SPACE CAPSULE AERODYNAMIC ARCHITECTURAL VECTOR FLOOR PLAN
     ========================================================================= */
  if (isSpaceCapsule) {
    return (
      <div className={`relative flex items-center justify-center p-3 bg-gradient-to-b from-[#0F172A] to-[#1E293B] rounded-2xl border border-sky-900 shadow-inner overflow-hidden select-none ${className}`}>
        <svg viewBox="0 0 280 140" className="w-full h-full max-h-[460px] drop-shadow-sm font-sans" xmlns="http://www.w3.org/2000/svg">
          {/* Dimension Header */}
          {showLabels && (
            <g id="capsule-dims">
              <line x1="20" y1="8" x2="260" y2="8" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3,1" />
              <rect x="80" y="4" width="120" height="9" rx="2" fill="#0B132B" stroke="#38bdf8" strokeWidth="0.8" />
              <text x="140" y="10.5" textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="#38bdf8">
                SPACE CAPSULE POD • {dimStr.split(' ')[0]}
              </text>
            </g>
          )}

          {/* Aerodynamic Capsule Hull */}
          <path
            d="
              M 35 25
              Q 20 25 20 70
              Q 20 115 35 115
              L 230 115
              Q 265 115 265 70
              Q 265 25 230 25
              Z
            "
            fill="#1E293B"
            stroke="#38bdf8"
            strokeWidth="3"
          />

          {/* 270° Panoramic Front Glass Bubble */}
          <path
            d="M 230 27 Q 262 27 262 70 Q 262 113 230 113"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="4"
          />
          <text x="246" y="73" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#7dd3fc" transform="rotate(90, 246, 73)">
            270° OBSERVATION BUBBLE
          </text>

          {/* Rear Luxury Ensuite Bathroom */}
          <rect x="26" y="32" width="50" height="76" rx="4" fill="#0B132B" stroke="#38bdf8" strokeWidth="1.5" />
          <rect x="28" y="34" width="24" height="34" fill="#0284c7" opacity="0.4" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="40" cy="51" r="3" fill="#38bdf8" />
          <ellipse cx="62" cy="50" rx="5" ry="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
          <text x="51" y="80" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#93c5fd">
            POD ENSUITE
          </text>

          {/* Center Smart Control Center */}
          <rect x="85" y="32" width="30" height="14" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
          <text x="100" y="41" textAnchor="middle" fontSize="3" fontWeight="bold" fill="#38bdf8">
            AI CONSOLE
          </text>

          {/* Panoramic Skylight Glass Roof Frame */}
          <rect x="125" y="40" width="80" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4,2" />
          <text x="165" y="47" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#7dd3fc">
            STAR-VIEW PANORAMIC SKYLIGHT
          </text>

          {/* King Capsule Bed inside Skylight Zone */}
          {renderBed(135, 52, 60, 44, 'SKY SUITE')}
        </svg>
      </div>
    );
  }

  /* =========================================================================
     3. EXPANDABLE CONTAINER HOUSE - ACTUAL DUAL-WING FLOOR PLAN
     ========================================================================= */
  const [internalVariant20ft, setInternalVariant20ft] = useState<'split' | 'side-by-side'>('split');
  const variant20ft = propVariant20ft || internalVariant20ft;

  // Dimension and proportional scaling for 10ft, 20ft, 30ft, and 40ft
  const svgViewBox = is40ft
    ? '0 0 240 230'
    : is30ft
    ? '0 0 240 210'
    : is10ft
    ? '0 0 240 145'
    : '0 0 240 195';

  const floorHeight = is40ft ? 190 : is30ft ? 172 : is10ft ? 104 : 156;
  const bottomWallY = 12 + floorHeight;

  return (
    <div
      className={`relative flex items-center justify-center p-3 bg-gradient-to-b from-[#FAF7F2] to-[#F2EDE4] rounded-2xl border border-amber-200/80 shadow-inner overflow-hidden select-none ${className}`}
    >
      {/* 20FT Layout Variant Switcher for 2-Bedroom Plan */}
      {is20ft && activePlanId === '2-bed-1-bath' && (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl border border-amber-300/80 shadow-2xs">
          <span className="text-[9px] font-black text-gray-700 uppercase tracking-wider hidden sm:inline">20FT Layout:</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setInternalVariant20ft('split');
              if (onLayoutVariant20ftChange) onLayoutVariant20ftChange('split');
            }}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-black cursor-pointer transition-all ${
              variant20ft === 'split' ? 'bg-amber-600 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="Split wings: Bedroom 1 at rear-left, Bedroom 2 at rear-right, central bath and front living"
          >
            Dual-Wing Split (Factory Standard)
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setInternalVariant20ft('side-by-side');
              if (onLayoutVariant20ftChange) onLayoutVariant20ftChange('side-by-side');
            }}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-black cursor-pointer transition-all ${
              variant20ft === 'side-by-side' ? 'bg-amber-600 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="Side-by-side: Both bedrooms on right wing, open living & kitchen on left wing"
          >
            Right Wing 2-Bed
          </button>
        </div>
      )}

      <svg
        viewBox={svgViewBox}
        className="w-full h-full max-h-[480px] drop-shadow-sm font-sans"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="parquet-grid" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 0 6 L 12 6 M 6 0 L 6 12" fill="none" stroke="#f1e5d3" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Dimension Headers (Shown in enlarged/submittal mode) */}
        {showLabels && (
          <g id="dimension-lines">
            <line x1="20" y1="5" x2="220" y2="5" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3,1" />
            <line x1="20" y1="2" x2="20" y2="8" stroke="#64748b" strokeWidth="1" />
            <line x1="220" y1="2" x2="220" y2="8" stroke="#64748b" strokeWidth="1" />
            <rect x="75" y="1" width="90" height="9" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
            <text x="120" y="7.5" textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="#ea580c">
              {is40ft ? '40FT FLAGSHIP: ' : is30ft ? '30FT EXPANDABLE: ' : is10ft ? '10FT DUAL-WING: ' : '20FT DOUBLE-WING: '}
              {dimStr.split(' ')[0]}
            </text>

            <text x="49" y="16" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#64748b">
              LEFT FOLD WING (2.1m)
            </text>
            <text x="120" y="16" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#ea580c">
              TRANSPORT CORE (2.2m)
            </text>
            <text x="176" y="16" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#64748b">
              RIGHT FOLD WING (2.1m)
            </text>
          </g>
        )}

        {/* 1. Exterior Footprint Floor Slab (Left Wing, Center Core, Right Wing) */}
        <g transform="translate(6, 4)">
          {/* Left Wing Floor */}
          <rect x="14" y="12" width="70" height={floorHeight} fill={floorFill} />
          {/* Center Spine Floor */}
          <rect x="84" y="12" width="52" height={floorHeight} fill={floorFill} />
          {/* Right Wing Floor */}
          <rect x="136" y="12" width="70" height={floorHeight} fill={floorFill} />
          {/* Parquet Pattern Overlay */}
          <rect x="14" y="12" width="192" height={floorHeight} fill="url(#parquet-grid)" opacity="0.6" />

          {/* Wing Fold-Out Mechanical Hinge Seams */}
          <line x1="84" y1="12" x2="84" y2={bottomWallY} stroke="#d97706" strokeWidth="1" strokeDasharray="4,2" />
          <line x1="136" y1="12" x2="136" y2={bottomWallY} stroke="#d97706" strokeWidth="1" strokeDasharray="4,2" />

          {/* 2. Structural Exterior Outer Walls with Door Openings */}
          <path
            d={`
              M 14 12 L 206 12 L 206 ${bottomWallY} L 124 ${bottomWallY}
              M 96 ${bottomWallY} L 14 ${bottomWallY} Z
            `}
            fill="none"
            stroke={wallStroke}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Front Entrance Sliding Patio Door (Centered in spine 96 to 124) */}
          {renderSlidingPatioDoor(96, 124, bottomWallY, 'DOUBLE SLIDING PATIO ENTRY (1880×2220mm)')}

          {/* Exterior Windows (Double-glazed 920×920mm Broken-Bridge Aluminum) */}
          <g id="exterior-windows">
            {/* Rear Wall Windows */}
            <line x1="38" y1="12" x2="62" y2="12" stroke="#38bdf8" strokeWidth="3" strokeLinecap="square" />
            <line x1="158" y1="12" x2="182" y2="12" stroke="#38bdf8" strokeWidth="3" strokeLinecap="square" />
            {/* Left & Right Wing Side Windows */}
            {is10ft ? (
              <>
                {/* 10FT Model: Exactly 1 Window centered per side */}
                <line x1="14" y1={12 + floorHeight / 2 - 14} x2="14" y2={12 + floorHeight / 2 + 14} stroke="#38bdf8" strokeWidth="3" strokeLinecap="square" />
                <line x1="206" y1={12 + floorHeight / 2 - 14} x2="206" y2={12 + floorHeight / 2 + 14} stroke="#38bdf8" strokeWidth="3" strokeLinecap="square" />
              </>
            ) : (
              <>
                <line x1="14" y1="32" x2="14" y2="58" stroke="#38bdf8" strokeWidth="3" strokeLinecap="square" />
                <line x1="14" y1={bottomWallY - 46} x2="14" y2={bottomWallY - 20} stroke="#38bdf8" strokeWidth="3" strokeLinecap="square" />
                <line x1="206" y1="32" x2="206" y2="58" stroke="#38bdf8" strokeWidth="3" strokeLinecap="square" />
                <line x1="206" y1={bottomWallY - 46} x2="206" y2={bottomWallY - 20} stroke="#38bdf8" strokeWidth="3" strokeLinecap="square" />
                {(is30ft || is40ft) && (
                  <>
                    <line x1="14" y1="90" x2="14" y2="114" stroke="#38bdf8" strokeWidth="3" strokeLinecap="square" />
                    <line x1="206" y1="90" x2="206" y2="114" stroke="#38bdf8" strokeWidth="3" strokeLinecap="square" />
                  </>
                )}
              </>
            )}
          </g>

          {/* 3. Common Bathroom Pod in Central Spine (Optional for 10ft) */}
          {is10ft ? (
            hasBathPod !== false ? (
              <g id="restroom-pod-10ft">
                <rect x="84" y="12" width="52" height="36" fill={bathFloor} />
                <path d="M 84 48 L 84 12 L 136 12 L 136 48" fill="none" stroke={wallStroke} strokeWidth="2.5" />
                <line x1="84" y1="48" x2="94" y2="48" stroke={wallStroke} strokeWidth="2.5" />
                <line x1="106" y1="48" x2="136" y2="48" stroke={wallStroke} strokeWidth="2.5" />
                {renderDoor(94, 48, 12, 'h', 's', showLabels ? 'BATH' : '')}

                {/* Walk-in Shower Enclosure (Rear-Left) */}
                <rect x="86" y="14" width="18" height="18" rx="1" fill="#bae6fd" opacity="0.6" stroke="#38bdf8" strokeWidth="0.8" />
                <circle cx="95" cy="23" r="2.5" fill="#0284c7" />
                <line x1="104" y1="14" x2="104" y2="32" stroke="#0284c7" strokeWidth="1.2" />

                {/* Elongated Toilet (Rear-Right) */}
                <rect x="110" y="14" width="10" height="4.5" rx="1.5" fill={fixtureFill} stroke="#94a3b8" strokeWidth="0.8" />
                <ellipse cx="115" cy="23" rx="4" ry="5" fill={fixtureFill} stroke="#94a3b8" strokeWidth="0.8" />

                {/* Floating Vanity Counter & Porcelain Vessel Basin (Front-Right, Flush to Right Wall) */}
                <rect x="124" y="31" width="10.5" height="13" rx="1" fill="#334155" stroke="#1e293b" strokeWidth="0.8" />
                <rect x="123.5" y="30.5" width="11" height="14" rx="0.8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
                <ellipse cx="129" cy="37.5" rx="3.5" ry="4.5" fill="#ffffff" stroke="#64748b" strokeWidth="0.8" />
                <circle cx="132.5" cy="37.5" r="1.2" fill="#0284c7" />

                {showLabels && (
                  <text x="115" y="34" textAnchor="middle" fontSize="3.2" fontWeight="bold" fill="#475569">
                    BATH POD (OPT)
                  </text>
                )}
              </g>
            ) : (
              <g id="open-foyer-10ft">
                <text x="110" y="36" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#94a3b8">
                  OPEN FOYER / NO BATH
                </text>
              </g>
            )
          ) : (
            renderRestroom()
          )}

          {/* Intermediate Structural Q235 Steel Columns for 30ft/40ft */}
          {(is40ft || is30ft) && (
            <g id="structural-columns">
              <rect x="82.5" y="60" width="3" height="3" fill="#ea580c" stroke="#1e293b" strokeWidth="0.5" />
              <rect x="134.5" y="60" width="3" height="3" fill="#ea580c" stroke="#1e293b" strokeWidth="0.5" />
              <rect x="82.5" y="115" width="3" height="3" fill="#ea580c" stroke="#1e293b" strokeWidth="0.5" />
              <rect x="134.5" y="115" width="3" height="3" fill="#ea580c" stroke="#1e293b" strokeWidth="0.5" />
              {is40ft && (
                <>
                  <rect x="82.5" y="155" width="3" height="3" fill="#ea580c" stroke="#1e293b" strokeWidth="0.5" />
                  <rect x="134.5" y="155" width="3" height="3" fill="#ea580c" stroke="#1e293b" strokeWidth="0.5" />
                </>
              )}
            </g>
          )}

          {/* Dedicated 10FT Fixed 1-Bedroom Layout */}
          {(is10ft || activePlanId === '10ft-1bed') && (
            <g id="layout-10ft-1bed">
              {/* Right Wing: Open Master Bedroom Suite (Seamless open-concept studio: no wall, no door) */}

              {/* Master Queen Bed */}
              {renderBed(152, 16, 36, 44, showLabels ? 'QUEEN BED' : '')}
              <rect x="140" y="16" width="9" height="9" rx="1.5" fill="#334155" stroke="#1e293b" strokeWidth="0.8" />
              <circle cx="144.5" cy="20.5" r="2" fill="#fef08a" />
              <rect x="190" y="16" width="9" height="9" rx="1.5" fill="#334155" stroke="#1e293b" strokeWidth="0.8" />
              <circle cx="194.5" cy="20.5" r="2" fill="#fef08a" />

              {/* Optional Wardrobe if enabled */}
              {hasWardrobe && (
                <rect x="142" y={bottomWallY - 22} width="24" height="15" rx="1.5" fill="#475569" stroke="#1e293b" strokeWidth="0.8" />
              )}

              {showLabels && (
                <text x="171" y={bottomWallY - 10} textAnchor="middle" fontSize="3.6" fontWeight="bold" fill="#1e293b">
                  MASTER SUITE (1-BED)
                </text>
              )}

              {/* Left Wing: "L"-Shaped Kitchenette */}
              {hasKitchenette !== false ? (
                <>
                  {/* "L"-Shaped Gourmet Kitchenette along Rear & Left Wall */}
                  {renderKitchen(16, 14, 52, 14, true, true)}
                  {showLabels && (
                    <text x="42" y="22" textAnchor="middle" fontSize="2.8" fontWeight="bold" fill="#ffffff">
                      "L"-SHAPED KITCHENETTE (OPT)
                    </text>
                  )}
                </>
              ) : (
                <>
                  {/* Open Living Lounge when Kitchenette is removed */}
                  {renderDetailedSofa(18, 20, 22, 46, 'east')}
                  <rect x="44" y="30" width="18" height="24" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                  {showLabels && (
                    <text x="50" y={bottomWallY - 18} textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#475569">
                      OPEN LOUNGE / STUDIO
                    </text>
                  )}
                </>
              )}
            </g>
          )}

          {/* 4. Plan-Specific Layouts for Larger Models */}
          {!is10ft && activePlanId !== '10ft-1bed' && activePlanId === '2-bed-1-bath' && (
            <g id="layout-2-bed-1-bath">
              {is20ft && variant20ft === 'split' ? (
                /* -------------------------------------------------------------
                   20FT STANDARD FACTORY SPLIT-WING LAYOUT:
                   - Bed 1: Left Wing Rear with Door swinging into bedroom
                   - Bed 2: Right Wing Rear with Door swinging into bedroom
                   - Bathroom: Center Spine Rear
                   - Kitchenette: Center Spine / Hallway
                   - Living Lounge: Left Wing Front
                   - Dining Area: Right Wing Front
                   ------------------------------------------------------------- */
                <>
                  {/* Left Bedroom 1 Transverse Partition Wall at Y = 84 */}
                  <line x1="14" y1="84" x2="84" y2="84" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {/* Spine Wall at X = 84 with Bedroom 1 Door Opening (68 to 82) */}
                  <line x1="84" y1="12" x2="84" y2="68" stroke={interiorWallStroke} strokeWidth="2.5" />
                  <line x1="84" y1="82" x2="84" y2="84" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(84, 82, 14, 'v', 'w', showLabels ? 'BED 1' : '')}

                  {/* Right Bedroom 2 Transverse Partition Wall at Y = 84 */}
                  <line x1="136" y1="84" x2="206" y2="84" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {/* Spine Wall at X = 136 with Bedroom 2 Door Opening (68 to 82) */}
                  <line x1="136" y1="12" x2="136" y2="68" stroke={interiorWallStroke} strokeWidth="2.5" />
                  <line x1="136" y1="82" x2="136" y2="84" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, 82, 14, 'v', 'e', showLabels ? 'BED 2' : '')}

                  {/* Bedroom 1 (Left Rear Master) */}
                  {renderBed(24, 22, 34, 42, showLabels ? 'MASTER BED 1' : '')}
                  <rect x="62" y="16" width="18" height="12" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />
                  {showLabels && (
                    <text x="41" y="76" textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#1e293b">
                      BEDROOM 1 (MASTER)
                    </text>
                  )}

                  {/* Bedroom 2 (Right Rear Guest) */}
                  {renderBed(154, 22, 34, 42, showLabels ? 'BEDROOM 2' : '')}
                  <rect x="140" y="16" width="18" height="12" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />
                  {showLabels && (
                    <text x="171" y="76" textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#1e293b">
                      BEDROOM 2 (GUEST)
                    </text>
                  )}

                  {/* Central Spine Kitchenette & Prep Counter */}
                  {renderKitchen(88, 66, 44, 15, true)}
                  {showLabels && (
                    <text x="110" y="86" textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#475569">
                      KITCHENETTE
                    </text>
                  )}

                  {/* Front-Left Living Room Lounge */}
                  <rect x="18" y={bottomWallY - 54} width="58" height="48" rx="3" fill="#e0e7ff" opacity="0.6" />
                  {renderDetailedSofa(20, bottomWallY - 50, 14, 42, 'east')}
                  <rect x="42" y={bottomWallY - 38} width="14" height="20" rx="2" fill={woodTable} stroke="#451a03" strokeWidth="1" />
                  {/* TV Media Console (Optional Add-on) */}
                  {hasTvConsole && (
                    <rect x="22" y="86" width="30" height="4" rx="1" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
                  )}
                  {showLabels && (
                    <text x="48" y={bottomWallY - 58} textAnchor="middle" fontSize="4" fontWeight="bold" fill="#1e293b">
                      LIVING LOUNGE
                    </text>
                  )}

                  {/* Front-Right Dining / Multi-use Zone */}
                  <rect x="148" y={bottomWallY - 44} width="40" height="24" rx="3" fill={woodTable} stroke="#451a03" strokeWidth="1" />
                  <rect x="156" y={bottomWallY - 48} width="8" height="3" rx="0.5" fill="#78350f" />
                  <rect x="172" y={bottomWallY - 48} width="8" height="3" rx="0.5" fill="#78350f" />
                  <rect x="156" y={bottomWallY - 18} width="8" height="3" rx="0.5" fill="#78350f" />
                  <rect x="172" y={bottomWallY - 18} width="8" height="3" rx="0.5" fill="#78350f" />
                  {showLabels && (
                    <text x="168" y={bottomWallY - 54} textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#1e293b">
                      DINING NOOK
                    </text>
                  )}
                </>
              ) : (
                /* -------------------------------------------------------------
                   SIDE-BY-SIDE RIGHT WING LAYOUT:
                   - Both bedrooms on right wing (Top & Bottom)
                   - Left wing dedicated to Great Room living & kitchen
                   ------------------------------------------------------------- */
                <>
                  {/* Transverse wall dividing Right Wing at Y = 88 */}
                  <line x1="136" y1="88" x2="206" y2="88" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {/* Spine Wall at X = 136 with two doors */}
                  <line x1="136" y1="12" x2="136" y2="72" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, 86, 14, 'v', 'e', showLabels ? 'BED 1' : '')}
                  <line x1="136" y1="86" x2="136" y2="90" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, 90, 136, 104, 150, 90, 0, showLabels ? 'BED 2' : '')}
                  <line x1="136" y1="104" x2="136" y2={bottomWallY} stroke={interiorWallStroke} strokeWidth="2.5" />

                  {/* Bedroom 1 (Top-Right Master) */}
                  {renderBed(156, 18, 34, 42, showLabels ? 'MASTER BED 1' : '')}
                  {hasWardrobe && <rect x="194" y="24" width="10" height="28" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />}
                  {showLabels && (
                    <text x="173" y="16" textAnchor="middle" fontSize="4" fontWeight="bold" fill="#1e293b">
                      MASTER SUITE 1
                    </text>
                  )}

                  {/* Bedroom 2 (Bottom-Right Second Bedroom) */}
                  {renderBed(156, bottomWallY - 50, 32, 40, showLabels ? 'BEDROOM 2' : '')}
                  {showLabels && (
                    <text x="172" y={bottomWallY - 54} textAnchor="middle" fontSize="4" fontWeight="bold" fill="#1e293b">
                      BEDROOM 2
                    </text>
                  )}

                  {/* Left Wing: Kitchenette at top-left */}
                  {renderKitchen(18, 16, 44, 15)}
                  {showLabels && (
                    <text x="40" y="36" textAnchor="middle" fontSize="4" fontWeight="bold" fill="#1e293b">
                      KITCHENETTE
                    </text>
                  )}

                  {/* Left Wing: Living Room Lounge */}
                  <rect x="20" y={bottomWallY - 54} width="56" height="48" rx="3" fill="#e0e7ff" opacity="0.7" />
                  {renderDetailedSofa(22, bottomWallY - 50, 14, 42, 'east')}
                  <rect x="44" y={bottomWallY - 38} width="14" height="20" rx="2" fill={woodTable} stroke="#1e293b" strokeWidth="1" />

                  {/* TV Console (Optional Add-on) */}
                  {hasTvConsole && (
                    <>
                      <line x1="134.5" y1={bottomWallY - 44} x2="134.5" y2={bottomWallY - 14} stroke="#334155" strokeWidth="1.5" />
                      <rect x="133" y={bottomWallY - 40} width="2" height="26" rx="0.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
                    </>
                  )}

                  {/* Living Room HVAC Mini-Split (Optional Add-on) */}
                  {hasHvacMiniSplit && (
                    <g id="living-hvac-unit">
                      <rect x="34" y={bottomWallY - 14} width="28" height="4.5" rx="1" fill="#ffffff" stroke="#334155" strokeWidth="0.8" />
                      <line x1="36" y1={bottomWallY - 11} x2="60" y2={bottomWallY - 11} stroke="#64748b" strokeWidth="0.5" />
                      {showLabels && (
                        <text x="48" y={bottomWallY - 16} textAnchor="middle" fontSize="3" fontWeight="bold" fill="#0f172a">
                          MINI-SPLIT AC
                        </text>
                      )}
                    </g>
                  )}
                  {showLabels && (
                    <text x="49" y={bottomWallY - 58} textAnchor="middle" fontSize="4" fontWeight="bold" fill="#1e293b">
                      LIVING LOUNGE
                    </text>
                  )}
                </>
              )}
            </g>
          )}

          {activePlanId === '3-bed-split-1-bath' && (
            <g id="layout-3-bed-split">
              {is40ft ? (
                /* -------------------------------------------------------------
                   40FT FLAGSHIP 3-BEDROOM EXPANDABLE ARCHITECTURAL LAYOUT:
                   - 3 Windows per side (Rear, Center, Front bays)
                   - Right Wing partitioned into 3 Enclosed Bedroom Suites
                     (Master Suite 1, Bedroom 2, Bedroom 3), each with private
                     door to central corridor and dedicated side sliding window
                   - Left Wing: Open 11.8m Great Room with Chef's Kitchen & Dining,
                     Primary Living Room Lounge, and Executive Study / Foyer
                   - Central Transport Spine: Pre-Plumbed Bath Pod + Central Hall
                   ------------------------------------------------------------- */
                <>
                  {/* Right Wing 2 Transverse Partition Walls at Bay Dividers (Y = 74 & Y = 138) */}
                  <line x1="136" y1="74" x2="206" y2="74" stroke={interiorWallStroke} strokeWidth="2.5" />
                  <line x1="136" y1="138" x2="206" y2="138" stroke={interiorWallStroke} strokeWidth="2.5" />

                  {/* Right Spine Wall with 3 Private Bedroom Doors */}
                  <line x1="136" y1="12" x2="136" y2="58" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, 72, 14, 'v', 'e', showLabels ? 'BED 1' : '')}
                  <line x1="136" y1="72" x2="136" y2="76" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, 76, 14, 'v', 'e', showLabels ? 'BED 2' : '')}
                  <line x1="136" y1="90" x2="136" y2="140" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, 140, 14, 'v', 'e', showLabels ? 'BED 3' : '')}
                  <line x1="136" y1="154" x2="136" y2={bottomWallY} stroke={interiorWallStroke} strokeWidth="2.5" />

                  {/* Bedroom 1 (Master Suite, Rear-Right, Bay 1) */}
                  {renderBed(156, 18, 34, 42, showLabels ? 'MASTER BED 1' : '')}
                  <rect x="194" y="24" width="10" height="28" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />
                  {showLabels && (
                    <text x="173" y="16" textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#1e293b">
                      MASTER SUITE 1
                    </text>
                  )}

                  {/* Bedroom 2 (Mid-Suite, Bay 2) */}
                  {renderBed(156, 82, 34, 42, showLabels ? 'BEDROOM 2' : '')}
                  <rect x="194" y="88" width="10" height="28" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />
                  {showLabels && (
                    <text x="173" y="80" textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#1e293b">
                      BEDROOM 2
                    </text>
                  )}

                  {/* Bedroom 3 (Front-Suite, Bay 3) */}
                  {renderBed(156, 146, 34, 42, showLabels ? 'BEDROOM 3' : '')}
                  <rect x="194" y="152" width="10" height="28" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />
                  {showLabels && (
                    <text x="173" y="144" textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#1e293b">
                      BEDROOM 3
                    </text>
                  )}

                  {/* Left Wing Great Room: Rear Chef's Kitchen & Dining Nook */}
                  {renderKitchen(18, 16, 48, 15)}
                  <rect x="28" y="44" width="38" height="20" rx="3" fill={woodTable} stroke="#451a03" strokeWidth="1" />
                  <rect x="34" y="40" width="8" height="3" rx="0.5" fill="#78350f" />
                  <rect x="50" y="40" width="8" height="3" rx="0.5" fill="#78350f" />
                  <rect x="34" y="65" width="8" height="3" rx="0.5" fill="#78350f" />
                  <rect x="50" y="65" width="8" height="3" rx="0.5" fill="#78350f" />
                  {showLabels && (
                    <text x="47" y="38" textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#1e293b">
                      CHEF&apos;S KITCHEN &amp; DINING
                    </text>
                  )}

                  {/* Left Wing Middle Bay: Living Room Lounge with 3-Seater Sofa & TV */}
                  <rect x="18" y="78" width="58" height="54" rx="3" fill="#e0e7ff" opacity="0.6" />
                  {renderDetailedSofa(20, 84, 14, 42, 'east')}
                  <rect x="42" y="95" width="14" height="20" rx="2" fill={woodTable} stroke="#451a03" strokeWidth="1" />
                  {hasTvConsole && (
                    <rect x="81" y="88" width="3" height="34" rx="1" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
                  )}
                  {showLabels && (
                    <text x="48" y="76" textAnchor="middle" fontSize="4" fontWeight="bold" fill="#1e293b">
                      LIVING ROOM LOUNGE
                    </text>
                  )}

                  {/* Left Wing Front Bay: Executive Study & Foyer */}
                  <rect x="22" y="152" width="48" height="20" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                  <circle cx="46" cy="180" r="4.5" fill="#64748b" />
                  {showLabels && (
                    <text x="46" y="148" textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#1e293b">
                      EXECUTIVE STUDY / FOYER
                    </text>
                  )}
                </>
              ) : (
                /* Standard 20ft / 30ft Split 3-Bed Layout */
                <>
                  {/* Right Wing Dividers & Doors */}
                  <line x1="136" y1="88" x2="204" y2="88" stroke={interiorWallStroke} strokeWidth="2.5" />
                  <line x1="136" y1="12" x2="136" y2="72" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, 86, 14, 'v', 'e', showLabels ? 'BED 2' : '')}
                  <line x1="136" y1="86" x2="136" y2="90" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, 90, 136, 104, 150, 90, 0, showLabels ? 'BED 3' : '')}
                  <line x1="136" y1="104" x2="136" y2={bottomWallY} stroke={interiorWallStroke} strokeWidth="2.5" />

                  {/* Left Wing Front Bedroom 1 Divider & Door */}
                  <line x1="14" y1="92" x2="84" y2="92" stroke={interiorWallStroke} strokeWidth="2.5" />
                  <line x1="84" y1="12" x2="84" y2="92" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(84, 94, 84, 108, 70, 94, 1, showLabels ? 'BED 1' : '')}
                  <line x1="84" y1="108" x2="84" y2={bottomWallY} stroke={interiorWallStroke} strokeWidth="2.5" />

                  {/* Top-Left Kitchen & Dining */}
                  {renderKitchen(18, 16, 48, 15)}
                  <circle cx="56" cy="58" r="10" fill={woodTable} />
                  {showLabels && (
                    <text x="56" y="74" textAnchor="middle" fontSize="4" fontWeight="bold" fill="#1e293b">
                      KITCHEN &amp; DINING
                    </text>
                  )}

                  {/* Bottom-Left Bedroom 1 */}
                  {renderBed(34, bottomWallY - 50, 32, 40, showLabels ? 'BEDROOM 1' : '')}
                  {showLabels && (
                    <text x="50" y={bottomWallY - 54} textAnchor="middle" fontSize="4" fontWeight="bold" fill="#1e293b">
                      BEDROOM 1
                    </text>
                  )}

                  {/* Top-Right Bedroom 2 */}
                  {renderBed(156, 18, 34, 42, showLabels ? 'BEDROOM 2' : '')}
                  {/* Bottom-Right Bedroom 3 */}
                  {renderBed(156, bottomWallY - 50, 32, 40, showLabels ? 'BEDROOM 3' : '')}
                </>
              )}
            </g>
          )}

          {activePlanId === '3-bed-kitchen-lounge' && (
            <g id="layout-3-bed-lounge">
              {is40ft ? (
                /* 40FT Dual-Wing 3-Bedroom with Peninsula Bar & Grand Living Lounge */
                <>
                  {/* Master Bedroom 1 in Rear-Left (Bay 1 Left) */}
                  <line x1="14" y1="74" x2="84" y2="74" stroke={interiorWallStroke} strokeWidth="2.5" />
                  <line x1="84" y1="12" x2="84" y2="58" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(84, 72, 14, 'v', 'w', showLabels ? 'BED 1' : '')}
                  {renderBed(34, 18, 34, 42, showLabels ? 'MASTER BED 1' : '')}
                  <rect x="18" y="24" width="10" height="28" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />
                  {showLabels && (
                    <text x="49" y="16" textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#1e293b">
                      MASTER SUITE 1
                    </text>
                  )}

                  {/* Gourmet Peninsula Counter & Breakfast Bar in Middle-Left */}
                  <rect x="18" y="80" width="58" height="14" rx="1.5" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                  {showLabels && (
                    <text x="47" y="99" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#1e293b">
                      PENINSULA BAR &amp; ISLAND
                    </text>
                  )}

                  {/* Front Living Lounge in Left Wing */}
                  <rect x="18" y="136" width="58" height="54" rx="3" fill="#e0e7ff" opacity="0.6" />
                  {renderDetailedSofa(20, 142, 14, 42, 'east')}
                  <rect x="42" y="153" width="14" height="20" rx="2" fill={woodTable} stroke="#451a03" strokeWidth="1" />
                  {hasTvConsole && (
                    <rect x="81" y="146" width="3" height="34" rx="1" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
                  )}
                  {showLabels && (
                    <text x="48" y="134" textAnchor="middle" fontSize="4" fontWeight="bold" fill="#1e293b">
                      FRONT LIVING LOUNGE
                    </text>
                  )}

                  {/* Right Wing Dividers & Bedrooms */}
                  <line x1="136" y1="74" x2="206" y2="74" stroke={interiorWallStroke} strokeWidth="2.5" />
                  <line x1="136" y1="138" x2="206" y2="138" stroke={interiorWallStroke} strokeWidth="2.5" />
                  <line x1="136" y1="12" x2="136" y2="58" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, 72, 14, 'v', 'e', showLabels ? 'BED 2' : '')}
                  <line x1="136" y1="72" x2="136" y2="140" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, 140, 14, 'v', 'e', showLabels ? 'BED 3' : '')}
                  <line x1="136" y1="154" x2="136" y2={bottomWallY} stroke={interiorWallStroke} strokeWidth="2.5" />

                  {/* Bedroom 2 (Rear-Right, Bay 1) */}
                  {renderBed(156, 18, 34, 42, showLabels ? 'BEDROOM 2' : '')}
                  <rect x="194" y="24" width="10" height="28" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />

                  {/* Mid-Right Bay: Media & Study Nook */}
                  <rect x="148" y="86" width="46" height="22" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                  {showLabels && (
                    <text x="171" y="99" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#38bdf8">
                      MEDIA &amp; WORK NOOK
                    </text>
                  )}

                  {/* Bedroom 3 (Front-Right, Bay 3) */}
                  {renderBed(156, 146, 34, 42, showLabels ? 'BEDROOM 3' : '')}
                  <rect x="194" y="152" width="10" height="28" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />
                </>
              ) : (
                /* Standard 20ft / 30ft Lounge Layout */
                <>
                  {/* Right Wing Dividers & Doors */}
                  <line x1="136" y1="88" x2="204" y2="88" stroke={interiorWallStroke} strokeWidth="2.5" />
                  <line x1="136" y1="12" x2="136" y2="72" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, 86, 14, 'v', 'e', showLabels ? 'BED 2' : '')}
                  <line x1="136" y1="86" x2="136" y2="90" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, 90, 136, 104, 150, 90, 0, showLabels ? 'BED 3' : '')}
                  <line x1="136" y1="104" x2="136" y2={bottomWallY} stroke={interiorWallStroke} strokeWidth="2.5" />

                  {/* Left Wing Rear Bedroom 1 Divider & Door */}
                  <line x1="14" y1="74" x2="84" y2="74" stroke={interiorWallStroke} strokeWidth="2.5" />
                  <line x1="84" y1="12" x2="84" y2="58" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(84, 72, 14, 'v', 'w', showLabels ? 'BED 1' : '')}
                  <line x1="84" y1="72" x2="84" y2={bottomWallY} stroke={interiorWallStroke} strokeWidth="2.5" />

                  {renderBed(34, 18, 32, 40, showLabels ? 'BEDROOM 1' : '')}

                  {/* Kitchen Peninsula */}
                  <rect x="18" y="80" width="56" height="14" rx="1.5" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                  {showLabels && (
                    <text x="46" y="98" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#1e293b">
                      PENINSULA BAR
                    </text>
                  )}

                  {/* Living Lounge */}
                  <rect x="20" y={bottomWallY - 50} width="54" height="44" rx="2" fill="#e0e7ff" opacity="0.6" />
                  {renderDetailedSofa(20, bottomWallY - 46, 14, 36, 'east')}
                  {renderBed(156, 18, 34, 42, showLabels ? 'BEDROOM 2' : '')}
                  {renderBed(156, bottomWallY - 50, 32, 40, showLabels ? 'BEDROOM 3' : '')}
                </>
              )}
            </g>
          )}

          {activePlanId === '1-bed-grand-dining' && (
            <g id="layout-1-bed-grand-dining">
              <line x1="136" y1="78" x2="204" y2="78" stroke={interiorWallStroke} strokeWidth="2.5" />
              <line x1="136" y1="12" x2="136" y2="64" stroke={interiorWallStroke} strokeWidth="2.5" />
              {renderDoor(136, 78, 14, 'v', 'e', showLabels ? 'MASTER' : '')}
              <line x1="136" y1="78" x2="136" y2={bottomWallY} stroke={interiorWallStroke} strokeWidth="2.5" />

              {renderBed(156, 18, 34, 42, showLabels ? 'KING MASTER' : '')}
              {renderKitchen(18, 16, 52, 16)}

              {/* 8-Person Banquet Dining Table */}
              <rect x="26" y="90" width="48" height="28" rx="3" fill={woodTable} stroke="#451a03" strokeWidth="1" />
              {showLabels && (
                <text x="50" y="126" textAnchor="middle" fontSize="4" fontWeight="bold" fill="#ea580c">
                  8-PERSON BANQUET DINING
                </text>
              )}
            </g>
          )}

          {activePlanId === '1-bed-studio-suite' && (
            <g id="layout-1-bed-studio">
              <line x1="136" y1="12" x2="136" y2="62" stroke={interiorWallStroke} strokeWidth="2.5" />
              {renderDoor(136, 76, 14, 'v', 'e', showLabels ? 'SUITE' : '')}
              <line x1="136" y1="76" x2="136" y2={bottomWallY} stroke={interiorWallStroke} strokeWidth="2.5" />

              {renderBed(156, 18, 34, 42, showLabels ? 'KING MASTER' : '')}

              {/* Executive Work Desk */}
              <rect x="150" y={bottomWallY - 44} width="44" height="18" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1" />
              {showLabels && (
                <text x="172" y={bottomWallY - 50} textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#1e293b">
                  WORK DESK &amp; CHAIR
                </text>
              )}

              {renderKitchen(18, 16, 56, 16)}
              <rect x="26" y={bottomWallY - 44} width="36" height="22" rx="3" fill={woodTable} stroke="#451a03" strokeWidth="1" />
            </g>
          )}

          {activePlanId === '4-bed-quad-suite' && (
            <g id="layout-4-bed-quad">
              {is40ft ? (
                /* -------------------------------------------------------------
                   40FT FLAGSHIP 4-BEDROOM EXPANDABLE ARCHITECTURAL LAYOUT:
                   - 3 Windows per side (Rear, Center, Front bays)
                   - Right Wing partitioned into 3 Enclosed Bedroom Suites
                     (Master Suite 1, Bedroom 2, Bedroom 3), each with private
                     door to central corridor and dedicated side sliding window
                   - Left Wing:
                     * Rear Bay (Bay 1): Chef's Kitchen & Dining Area
                     * Middle Bay (Bay 2): Living Room Lounge with 3-Seater Sofa & TV
                     * Front Bay (Bay 3): Enclosed Private Bedroom 4 Suite with
                       its own door, wardrobe, and dedicated side window
                   - Central Transport Spine: Pre-Plumbed Bath Pod + Central Hall
                   ------------------------------------------------------------- */
                <>
                  {/* Right Wing 2 Transverse Partition Walls at Bay Dividers (Y = 74 & Y = 138) */}
                  <line x1="136" y1="74" x2="206" y2="74" stroke={interiorWallStroke} strokeWidth="2.5" />
                  <line x1="136" y1="138" x2="206" y2="138" stroke={interiorWallStroke} strokeWidth="2.5" />

                  {/* Right Spine Wall with 3 Private Bedroom Doors */}
                  <line x1="136" y1="12" x2="136" y2="58" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, 72, 14, 'v', 'e', showLabels ? 'BED 1' : '')}
                  <line x1="136" y1="72" x2="136" y2="76" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, 76, 14, 'v', 'e', showLabels ? 'BED 2' : '')}
                  <line x1="136" y1="90" x2="136" y2="140" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, 140, 14, 'v', 'e', showLabels ? 'BED 3' : '')}
                  <line x1="136" y1="154" x2="136" y2={bottomWallY} stroke={interiorWallStroke} strokeWidth="2.5" />

                  {/* Bedroom 1 (Master Suite, Rear-Right, Bay 1) */}
                  {renderBed(156, 18, 34, 42, showLabels ? 'MASTER BED 1' : '')}
                  <rect x="194" y="24" width="10" height="28" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />
                  {showLabels && (
                    <text x="173" y="16" textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#1e293b">
                      MASTER SUITE 1
                    </text>
                  )}

                  {/* Bedroom 2 (Mid-Suite, Bay 2) */}
                  {renderBed(156, 82, 34, 42, showLabels ? 'BEDROOM 2' : '')}
                  <rect x="194" y="88" width="10" height="28" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />
                  {showLabels && (
                    <text x="173" y="80" textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#1e293b">
                      BEDROOM 2
                    </text>
                  )}

                  {/* Bedroom 3 (Front-Suite, Bay 3) */}
                  {renderBed(156, 146, 34, 42, showLabels ? 'BEDROOM 3' : '')}
                  <rect x="194" y="152" width="10" height="28" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />
                  {showLabels && (
                    <text x="173" y="144" textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#1e293b">
                      BEDROOM 3
                    </text>
                  )}

                  {/* Left Wing Transverse Wall partitioning Bedroom 4 (Y = 138) */}
                  <line x1="14" y1="138" x2="84" y2="138" stroke={interiorWallStroke} strokeWidth="2.5" />

                  {/* Left Spine Wall for Bedroom 4 Door */}
                  <line x1="84" y1="138" x2="84" y2="144" stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(84, 144, 14, 'v', 'w', showLabels ? 'BED 4' : '')}
                  <line x1="84" y1="158" x2="84" y2={bottomWallY} stroke={interiorWallStroke} strokeWidth="2.5" />

                  {/* Bedroom 4 (Front-Left Enclosed Suite, Bay 3) */}
                  {renderBed(24, 146, 34, 42, showLabels ? 'BEDROOM 4' : '')}
                  <rect x="68" y="152" width="10" height="28" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />
                  {showLabels && (
                    <text x="41" y="144" textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#1e293b">
                      BEDROOM 4
                    </text>
                  )}

                  {/* Left Wing Rear Bay: Chef's Kitchen & Dining Nook */}
                  {renderKitchen(18, 16, 48, 15)}
                  <rect x="28" y="44" width="38" height="20" rx="3" fill={woodTable} stroke="#451a03" strokeWidth="1" />
                  <rect x="34" y="40" width="8" height="3" rx="0.5" fill="#78350f" />
                  <rect x="50" y="40" width="8" height="3" rx="0.5" fill="#78350f" />
                  <rect x="34" y="65" width="8" height="3" rx="0.5" fill="#78350f" />
                  <rect x="50" y="65" width="8" height="3" rx="0.5" fill="#78350f" />
                  {showLabels && (
                    <text x="47" y="38" textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#1e293b">
                      CHEF&apos;S KITCHEN &amp; DINING
                    </text>
                  )}

                  {/* Left Wing Middle Bay: Living Room Lounge with 3-Seater Sofa & TV */}
                  <rect x="18" y="78" width="58" height="54" rx="3" fill="#e0e7ff" opacity="0.6" />
                  {renderDetailedSofa(20, 84, 14, 42, 'east')}
                  <rect x="42" y="95" width="14" height="20" rx="2" fill={woodTable} stroke="#451a03" strokeWidth="1" />
                  {hasTvConsole && (
                    <rect x="81" y="88" width="3" height="34" rx="1" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
                  )}
                  {showLabels && (
                    <text x="48" y="76" textAnchor="middle" fontSize="4" fontWeight="bold" fill="#1e293b">
                      LIVING ROOM LOUNGE
                    </text>
                  )}

                  {showLabels && (
                    <text x="110" y={bottomWallY - 20} textAnchor="middle" fontSize="4" fontWeight="bold" fill="#ea580c">
                      FOYER ENTRY
                    </text>
                  )}
                </>
              ) : (
                /* Standard 20ft / 30ft Quad Dormitory Plan */
                <>
                  {/* Transverse Dividers */}
                  <line x1="14" y1={Math.round(bottomWallY / 2)} x2="84" y2={Math.round(bottomWallY / 2)} stroke={interiorWallStroke} strokeWidth="2.5" />
                  <line x1="136" y1={Math.round(bottomWallY / 2)} x2="204" y2={Math.round(bottomWallY / 2)} stroke={interiorWallStroke} strokeWidth="2.5" />

                  {/* Left Spine Wall with 2 Doors */}
                  <line x1="84" y1="12" x2="84" y2={Math.round(bottomWallY / 2) - 18} stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(84, Math.round(bottomWallY / 2) - 4, 14, 'v', 'w', showLabels ? 'BED 1' : '')}
                  <line x1="84" y1={Math.round(bottomWallY / 2) - 4} x2="84" y2={Math.round(bottomWallY / 2) + 4} stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(84, Math.round(bottomWallY / 2) + 4, 84, Math.round(bottomWallY / 2) + 18, 70, Math.round(bottomWallY / 2) + 4, 1, showLabels ? 'BED 2' : '')}
                  <line x1="84" y1={Math.round(bottomWallY / 2) + 18} x2="84" y2={bottomWallY} stroke={interiorWallStroke} strokeWidth="2.5" />

                  {/* Right Spine Wall with 2 Doors */}
                  <line x1="136" y1="12" x2="136" y2={Math.round(bottomWallY / 2) - 18} stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, Math.round(bottomWallY / 2) - 4, 14, 'v', 'e', showLabels ? 'BED 3' : '')}
                  <line x1="136" y1={Math.round(bottomWallY / 2) - 4} x2="136" y2={Math.round(bottomWallY / 2) + 4} stroke={interiorWallStroke} strokeWidth="2.5" />
                  {renderDoor(136, Math.round(bottomWallY / 2) + 4, 136, Math.round(bottomWallY / 2) + 18, 150, Math.round(bottomWallY / 2) + 4, 0, showLabels ? 'BED 4' : '')}
                  <line x1="136" y1={Math.round(bottomWallY / 2) + 18} x2="136" y2={bottomWallY} stroke={interiorWallStroke} strokeWidth="2.5" />

                  {renderBed(34, 18, 32, 38, showLabels ? 'BED 1' : '')}
                  {renderBed(34, bottomWallY - 46, 32, 38, showLabels ? 'BED 2' : '')}
                  {renderBed(156, 18, 32, 38, showLabels ? 'BED 3' : '')}
                  {renderBed(156, bottomWallY - 46, 32, 38, showLabels ? 'BED 4' : '')}
                  {showLabels && (
                    <text x="110" y={bottomWallY / 2 + 3} textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="#ea580c">
                      HALLWAY SPINE
                    </text>
                  )}
                </>
              )}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
