import React from 'react';
import { FloorPlanId } from '../types';

interface FloorPlanDiagramProps {
  planId: FloorPlanId;
  hasWardrobe?: boolean;
  className?: string;
}

export function FloorPlanDiagram({ planId, hasWardrobe = false, className = 'w-full h-44' }: FloorPlanDiagramProps) {
  // Architectural color palette
  const wallFill = '#e2e8f0';
  const wallStroke = '#475569';
  const interiorWallStroke = '#64748b';
  const floorFill = '#fdf8f0';
  const bedWood = '#b45309';
  const bedLinen = '#ffffff';
  const duvetFill = '#475569';
  const bathFloor = '#cbd5e1';
  const fixtureFill = '#f8fafc';
  const sofaFill = '#94a3b8';
  const woodTable = '#78350f';

  // Common Central Restroom Pod (at top center in spine)
  const renderRestroom = () => (
    <g id="restroom-pod">
      {/* Restroom room background (Porcelain / Slate tile) */}
      <rect x="85" y="12" width="50" height="42" fill={bathFloor} stroke={interiorWallStroke} strokeWidth="2" rx="1" />
      {/* Walk-in Shower enclosure (Rear-Left) */}
      <rect x="87" y="14" width="21" height="22" fill="#93c5fd" opacity="0.65" stroke="#3b82f6" strokeWidth="1" />
      <circle cx="97.5" cy="25" r="3.5" fill="#1d4ed8" />
      {/* Frameless Shower Glass Divider */}
      <line x1="108" y1="14" x2="108" y2="36" stroke="#0284c7" strokeWidth="1.5" />
      {/* Toilet Suite (Rear-Right, Flush against rear wall) */}
      <rect x="112" y="14" width="12" height="5" rx="1.5" fill={fixtureFill} stroke="#94a3b8" strokeWidth="1" />
      <ellipse cx="118" cy="24" rx="5" ry="6" fill={fixtureFill} stroke="#94a3b8" strokeWidth="1" />
      {/* Vanity Suite (Front-Right, along right wall) */}
      <rect x="122" y="32" width="11" height="18" rx="1" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
      <ellipse cx="127.5" cy="41" rx="3.5" ry="5.5" fill="#ffffff" stroke="#64748b" strokeWidth="1" />
      {/* Backlit Smart Mirror on right wall */}
      <line x1="133.5" y1="33" x2="133.5" y2="49" stroke="#38bdf8" strokeWidth="1.5" />
      {/* Entrance Access Doorway on Front Wall (Z = 54) */}
      <line x1="94" y1="54" x2="110" y2="54" stroke="#fdf8f0" strokeWidth="3" />
      <path d="M 94 54 Q 94 40 106 42" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="1.5,1.5" />
      <line x1="94" y1="54" x2="106" y2="42" stroke="#475569" strokeWidth="1.5" />
    </g>
  );

  // Detailed Luxury Designer Sofa with Plinth, Armrests, Cushions & Pillows
  const renderDetailedSofa = (x: number, y: number, w: number, h: number, facing: 'east' | 'south' = 'east') => {
    if (facing === 'east') {
      return (
        <g id="detailed-sofa-east">
          {/* Walnut plinth outline */}
          <rect x={x - 1} y={y - 1} width={w + 2} height={h + 2} rx="2" fill="#78350f" opacity="0.6" />
          {/* Main upholstered base */}
          <rect x={x} y={y} width={w} height={h} rx="3" fill={sofaFill} stroke="#475569" strokeWidth="1" />
          {/* Backrest against exterior wall */}
          <rect x={x} y={y} width="4" height={h} rx="1" fill="#475569" />
          {/* Armrests on both ends */}
          <rect x={x} y={y} width={w} height="4" rx="1.5" fill="#334155" />
          <rect x={x} y={y + h - 4} width={w} height="4" rx="1.5" fill="#334155" />
          {/* Segmented Seat Cushions */}
          <rect x={x + 4} y={y + 5} width={w - 5} height={(h - 12) / 2} rx="1.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x={x + 4} y={y + 7 + (h - 12) / 2} width={w - 5} height={(h - 12) / 2} rx="1.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
          {/* Accent throw pillows */}
          <rect x={x + 4} y={y + 6} width="5" height="7" rx="1" fill="#f59e0b" transform={`rotate(-15, ${x + 6}, ${y + 9})`} />
          <rect x={x + 4} y={y + h - 13} width="5" height="7" rx="1" fill="#059669" transform={`rotate(15, ${x + 6}, ${y + h - 10})`} />
          {/* Draped throw blanket on arm */}
          <rect x={x + 2} y={y + h - 5} width={w - 2} height="3" rx="0.5" fill="#d97706" />
        </g>
      );
    } else {
      return (
        <g id="detailed-sofa-south">
          {/* Walnut plinth outline */}
          <rect x={x - 1} y={y - 1} width={w + 2} height={h + 2} rx="2" fill="#78350f" opacity="0.6" />
          {/* Main upholstered base */}
          <rect x={x} y={y} width={w} height={h} rx="3" fill={sofaFill} stroke="#475569" strokeWidth="1" />
          {/* Backrest against rear wall */}
          <rect x={x} y={y} width={w} height="4" rx="1" fill="#475569" />
          {/* Armrests */}
          <rect x={x} y={y} width="4" height={h} rx="1.5" fill="#334155" />
          <rect x={x + w - 4} y={y} width="4" height={h} rx="1.5" fill="#334155" />
          {/* Segmented Seat Cushions */}
          <rect x={x + 5} y={y + 4} width={(w - 12) / 2} height={h - 5} rx="1.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x={x + 7 + (w - 12) / 2} y={y + 4} width={(w - 12) / 2} height={h - 5} rx="1.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
          {/* Throw pillows */}
          <rect x={x + 6} y={y + 4} width="7" height="5" rx="1" fill="#f59e0b" transform={`rotate(15, ${x + 9}, ${y + 6})`} />
          <rect x={x + w - 13} y={y + 4} width="7" height="5" rx="1" fill="#059669" transform={`rotate(-15, ${x + w - 10}, ${y + 6})`} />
        </g>
      );
    }
  };

  // Common Bed Component
  const renderBed = (x: number, y: number, w = 32, h = 40, isRotated = false) => {
    return (
      <g transform={`translate(${x}, ${y})`}>
        {/* Headboard */}
        <rect x="0" y="0" width={w} height="4" rx="1" fill={bedWood} />
        {/* Mattress frame */}
        <rect x="1" y="4" width={w - 2} height={h - 4} rx="2" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
        {/* Pillows */}
        <rect x="3" y="6" width={(w - 8) / 2} height="8" rx="2" fill={bedLinen} stroke="#cbd5e1" strokeWidth="0.8" />
        <rect x="5 + (w - 8) / 2" y="6" width={(w - 8) / 2} height="8" rx="2" fill={bedLinen} stroke="#cbd5e1" strokeWidth="0.8" />
        {/* Duvet / folded quilt */}
        <rect x="2" y="17" width={w - 4} height={h - 19} rx="1.5" fill={duvetFill} opacity="0.85" />
        {/* Nightstand left */}
        <rect x="-8" y="2" width="6" height="8" rx="1" fill={bedWood} />
        <circle cx="-5" cy="6" r="1.5" fill="#fef08a" />
        {/* Nightstand right */}
        <rect x={w + 2} y="2" width="6" height="8" rx="1" fill={bedWood} />
        <circle cx={w + 5} cy="6" r="1.5" fill="#fef08a" />
      </g>
    );
  };

  // Kitchen counter with sink & stove
  const renderKitchen = (x: number, y: number, w: number, h: number, horizontal = true) => {
    return (
      <g transform={`translate(${x}, ${y})`}>
        <rect x="0" y="0" width={w} height={h} rx="1.5" fill="#334155" stroke="#1e293b" strokeWidth="1" />
        {horizontal ? (
          <>
            {/* Sink */}
            <rect x="4" y="3" width="14" height={h - 6} rx="2" fill="#94a3b8" />
            <circle cx="11" cy={h / 2} r="2" fill="#e2e8f0" />
            {/* Stove burners */}
            <circle cx={w - 18} cy={h / 2} r="4" fill="#0f172a" stroke="#f97316" strokeWidth="1" />
            <circle cx={w - 8} cy={h / 2} r="4" fill="#0f172a" stroke="#f97316" strokeWidth="1" />
            {/* Fridge */}
            <rect x={w + 2} y="0" width="18" height={h} rx="1" fill="#64748b" />
          </>
        ) : (
          <>
            <rect x="3" y="4" width={w - 6} height="14" rx="2" fill="#94a3b8" />
            <circle cx={w / 2} cy="11" r="2" fill="#e2e8f0" />
            <circle cx={w / 2} cy={h - 12} r="4" fill="#0f172a" stroke="#f97316" strokeWidth="1" />
          </>
        )}
      </g>
    );
  };

  return (
    <div className={`relative flex items-center justify-center p-2 bg-gradient-to-b from-[#FAF7F2] to-[#F2EDE4] rounded-2xl border border-amber-200/60 shadow-inner overflow-hidden select-none ${className}`}>
      <svg
        viewBox="0 0 220 180"
        className="w-full h-full max-h-52 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="parquet-grid" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 0 6 L 12 6 M 6 0 L 6 12" fill="none" stroke="#f1e5d3" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* 1. Exterior Footprint Floor Slab (Left Wing, Center Core, Right Wing) */}
        {/* Left Wing Floor */}
        <rect x="14" y="12" width="70" height="156" fill={floorFill} />
        {/* Center Spine Floor */}
        <rect x="84" y="12" width="52" height="156" fill={floorFill} />
        {/* Right Wing Floor */}
        <rect x="136" y="12" width="70" height="156" fill={floorFill} />
        {/* Subtle floor grid overlay */}
        <rect x="14" y="12" width="192" height="156" fill="url(#parquet-grid)" opacity="0.6" />

        {/* 2. Structural Exterior Outer Walls */}
        <path
          d="
            M 14 12 L 206 12 L 206 168 L 126 168
            M 94 168 L 14 168 Z
          "
          fill="none"
          stroke={wallStroke}
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Front Entrance Opening at Z=168 (between X=94 and X=126) */}
        <g id="main-entrance">
          <line x1="94" y1="168" x2="126" y2="168" stroke="#38bdf8" strokeWidth="2.5" />
          {/* Swing door arc */}
          <path d="M 94 168 Q 110 152 110 168" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
          <path d="M 126 168 Q 110 152 110 168" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
        </g>

        {/* Architectural Windows: Two windows on Left Side, Two windows on Right Side */}
        <g id="side-windows">
          {/* Left Side: Window 1 (Rear Zone) & Window 2 (Front Zone) */}
          <line x1="14" y1="42" x2="14" y2="64" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="square" />
          <line x1="12" y1="42" x2="16" y2="42" stroke="#64748b" strokeWidth="1" />
          <line x1="12" y1="64" x2="16" y2="64" stroke="#64748b" strokeWidth="1" />

          <line x1="14" y1="116" x2="14" y2="138" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="square" />
          <line x1="12" y1="116" x2="16" y2="116" stroke="#64748b" strokeWidth="1" />
          <line x1="12" y1="138" x2="16" y2="138" stroke="#64748b" strokeWidth="1" />

          {/* Right Side: Window 1 (Master Bedroom) & Window 2 (Bedroom 2) */}
          <line x1="206" y1="42" x2="206" y2="64" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="square" />
          <line x1="204" y1="42" x2="208" y2="42" stroke="#64748b" strokeWidth="1" />
          <line x1="204" y1="64" x2="208" y2="64" stroke="#64748b" strokeWidth="1" />

          <line x1="206" y1="116" x2="206" y2="138" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="square" />
          <line x1="204" y1="116" x2="208" y2="116" stroke="#64748b" strokeWidth="1" />
          <line x1="204" y1="138" x2="208" y2="138" stroke="#64748b" strokeWidth="1" />
        </g>

        {/* 3. Common Bathroom Pod in Spine */}
        {renderRestroom()}

        {/* 4. Plan-Specific Partitions, Furniture & Layouts */}
        {planId === '2-bed-1-bath' && (
          // Plan 1: 2 Bedrooms, 1 Restroom, 1 Living Room (Executive Family Suite)
          <g id="layout-2-bed-1-bath">
            {/* Right Wing Center Divider Wall (splits into 2 bedrooms) */}
            <line x1="136" y1="88" x2="204" y2="88" stroke={interiorWallStroke} strokeWidth="3" />
            <line x1="136" y1="12" x2="136" y2="168" stroke={interiorWallStroke} strokeWidth="3" strokeDasharray="54,16,18,16,52" />

            {/* Bedroom 1 (Top-Right Master) */}
            {renderBed(156, 18, 34, 42)}
            {/* Wardrobe */}
            {hasWardrobe && <rect x="194" y="24" width="10" height="28" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />}

            {/* Bedroom 2 (Bottom-Right Second Bedroom) */}
            {renderBed(156, 114, 32, 40)}
            {/* Wardrobe */}
            {hasWardrobe && <rect x="194" y="118" width="10" height="24" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />}

            {/* Left Wing: Kitchenette at top-left */}
            {renderKitchen(18, 16, 44, 15)}

            {/* Left Wing: Living Room Lounge (detailed sofa, coffee table, rug) */}
            {/* Rug */}
            <rect x="20" y="112" width="56" height="52" rx="3" fill="#e0e7ff" opacity="0.7" />
            {/* Detailed Sofa against left wall facing East */}
            {renderDetailedSofa(22, 116, 14, 46, 'east')}
            {/* Travertine Coffee Table */}
            <rect x="44" y="128" width="14" height="22" rx="2" fill={woodTable} stroke="#451a03" strokeWidth="1" />
            <rect x="47" y="134" width="8" height="10" rx="1" fill="#f8fafc" />

            {/* TV Console on the Wall of the Right Side of the Walkway (x=136) just before Bedroom 2 entrance */}
            {/* Vertical Acoustic Slat Accent Panel on Right Corridor Wall */}
            <line x1="134.5" y1="122" x2="134.5" y2="158" stroke="#b45309" strokeWidth="1.5" />
            {/* Wall-Mounted 65" 4K OLED TV */}
            <rect x="133" y="127" width="2" height="30" rx="0.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
            {/* Floating Media Credenza Console on Right Wall */}
            <rect x="127.5" y="125" width="5.5" height="34" rx="1" fill="#334155" stroke="#1e293b" strokeWidth="0.8" />
          </g>
        )}

        {planId === '3-bed-split-1-bath' && (
          // Plan 2: 3 Bedrooms, 1 Restroom, 1 Living Room (Split Wing)
          <g id="layout-3-bed-split">
            {/* Right Wing Divider Wall (2 Bedrooms) */}
            <line x1="136" y1="88" x2="204" y2="88" stroke={interiorWallStroke} strokeWidth="3" />
            <line x1="136" y1="12" x2="136" y2="168" stroke={interiorWallStroke} strokeWidth="3" strokeDasharray="54,16,18,16,52" />

            {/* Left Wing Divider Wall (Separating Kitchen from Bedroom 1) */}
            <line x1="14" y1="92" x2="84" y2="92" stroke={interiorWallStroke} strokeWidth="3" />
            <line x1="84" y1="12" x2="84" y2="168" stroke={interiorWallStroke} strokeWidth="3" strokeDasharray="72,16,68" />

            {/* Top-Left Kitchen */}
            {renderKitchen(18, 16, 48, 15)}
            {/* Dining nook / small table in kitchen zone */}
            <circle cx="56" cy="58" r="10" fill={woodTable} />
            <circle cx="42" cy="58" r="3" fill="#94a3b8" />
            <circle cx="70" cy="58" r="3" fill="#94a3b8" />

            {/* Bottom-Left Bedroom 1 */}
            {renderBed(34, 114, 32, 40)}
            {hasWardrobe && <rect x="18" y="118" width="8" height="24" rx="1" fill="#475569" />}

            {/* Top-Right Bedroom 2 */}
            {renderBed(156, 18, 34, 42)}

            {/* Bottom-Right Bedroom 3 */}
            {renderBed(156, 114, 32, 40)}
          </g>
        )}

        {planId === '3-bed-kitchen-lounge' && (
          // Plan 3: 3 Bedrooms, 1 Restroom, 1 Living Room (Peninsula Kitchen & Living)
          <g id="layout-3-bed-lounge">
            {/* Right Wing Divider (2 Bedrooms) */}
            <line x1="136" y1="88" x2="204" y2="88" stroke={interiorWallStroke} strokeWidth="3" />
            <line x1="136" y1="12" x2="136" y2="168" stroke={interiorWallStroke} strokeWidth="3" strokeDasharray="54,16,18,16,52" />

            {/* Left Wing: Bedroom 1 at Top-Left */}
            <line x1="14" y1="74" x2="84" y2="74" stroke={interiorWallStroke} strokeWidth="3" />
            <line x1="84" y1="12" x2="84" y2="168" stroke={interiorWallStroke} strokeWidth="3" strokeDasharray="58,16,82" />
            {renderBed(34, 18, 32, 40)}

            {/* Kitchen Peninsula Counter dividing Top Bed from Bottom Lounge */}
            <rect x="18" y="80" width="56" height="14" rx="1.5" fill="#334155" stroke="#1e293b" strokeWidth="1" />
            <circle cx="34" cy="87" r="3.5" fill="#f97316" />
            <circle cx="48" cy="87" r="3.5" fill="#f97316" />

            {/* Bottom-Left Living Lounge */}
            <rect x="20" y="110" width="54" height="46" rx="2" fill="#e0e7ff" opacity="0.6" />
            {renderDetailedSofa(22, 114, 14, 38, 'east')}
            <rect x="42" y="122" width="13" height="20" rx="1.5" fill={woodTable} stroke="#451a03" strokeWidth="0.8" />
            {/* TV Console on Wall of Right Side of Walkway (x=136) just before Bedroom 3 entrance */}
            <line x1="134.5" y1="122" x2="134.5" y2="156" stroke="#b45309" strokeWidth="1.5" />
            <rect x="133" y="126" width="2" height="28" rx="0.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
            <rect x="127.5" y="124" width="5.5" height="32" rx="1" fill="#334155" stroke="#1e293b" strokeWidth="0.8" />

            {/* Top-Right Bedroom 2 */}
            {renderBed(156, 18, 34, 42)}

            {/* Bottom-Right Bedroom 3 */}
            {renderBed(156, 114, 32, 40)}
          </g>
        )}

        {planId === '1-bed-grand-dining' && (
          // Plan 4: 1 Bedroom, 1 Restroom, 1 Living Room (Grand Dining & Entertainer)
          <g id="layout-1-bed-grand-dining">
            {/* Bedroom partition enclosing Top-Right Master Suite only */}
            <line x1="136" y1="78" x2="204" y2="78" stroke={interiorWallStroke} strokeWidth="3" />
            <line x1="136" y1="12" x2="136" y2="78" stroke={interiorWallStroke} strokeWidth="3" strokeDasharray="50,16" />

            {/* Top-Right Master Bedroom */}
            {renderBed(156, 18, 34, 42)}
            {hasWardrobe && <rect x="194" y="24" width="10" height="28" rx="1" fill="#475569" />}

            {/* Left Wall Gourmet Kitchen */}
            {renderKitchen(18, 16, 52, 16)}

            {/* Massive 8-Person Banquet Dining Table in Central/Left Great Room */}
            <rect x="88" y="76" width="44" height="66" rx="4" fill={woodTable} stroke="#451a03" strokeWidth="1.5" />
            {/* Table center runner & place settings */}
            <rect x="94" y="80" width="32" height="58" rx="2" fill="#fef3c7" opacity="0.8" />
            {/* 8 Dining Chairs */}
            <rect x="78" y="84" width="7" height="12" rx="2" fill="#475569" />
            <rect x="78" y="102" width="7" height="12" rx="2" fill="#475569" />
            <rect x="78" y="120" width="7" height="12" rx="2" fill="#475569" />
            <rect x="135" y="84" width="7" height="12" rx="2" fill="#475569" />
            <rect x="135" y="102" width="7" height="12" rx="2" fill="#475569" />
            <rect x="135" y="120" width="7" height="12" rx="2" fill="#475569" />
            <rect x="100" y="66" width="14" height="7" rx="2" fill="#475569" />
            <rect x="100" y="145" width="14" height="7" rx="2" fill="#475569" />

            {/* Open Right Wing Lounge Area */}
            <rect x="156" y="102" width="38" height="14" rx="2" fill={sofaFill} />
            <rect x="162" y="124" width="26" height="12" rx="1.5" fill={woodTable} />
          </g>
        )}

        {planId === '1-bed-studio-suite' && (
          // Plan 5: 1 Bedroom, 1 Restroom, 1 Living Room (Studio Kitchen & Office)
          <g id="layout-1-bed-studio">
            {/* Right Wing Divider for Dedicated Bedroom */}
            <line x1="136" y1="12" x2="136" y2="168" stroke={interiorWallStroke} strokeWidth="3" strokeDasharray="56,18,80" />

            {/* Large Executive Master Bedroom with Study Desk on Right Wing */}
            {renderBed(156, 22, 34, 42)}
            {/* Work Desk with Laptop & Chair */}
            <rect x="154" y="128" width="38" height="16" rx="2" fill={woodTable} stroke="#451a03" strokeWidth="1" />
            <rect x="168" y="132" width="10" height="7" rx="1" fill="#94a3b8" />
            <circle cx="173" cy="118" r="5" fill="#475569" />

            {/* Left Wing Chef Kitchen (Top-Left) */}
            {renderKitchen(18, 16, 56, 16)}

            {/* 4-Person Dining Nook (Bottom-Left) */}
            <rect x="26" y="112" width="36" height="24" rx="3" fill={woodTable} stroke="#451a03" strokeWidth="1" />
            <rect x="36" y="98" width="16" height="7" rx="1.5" fill="#475569" />
            <rect x="36" y="142" width="16" height="7" rx="1.5" fill="#475569" />
            <rect x="14" y="116" width="7" height="16" rx="1.5" fill="#475569" />
            <rect x="67" y="116" width="7" height="16" rx="1.5" fill="#475569" />
          </g>
        )}

        {planId === '4-bed-quad-suite' && (
          // Plan 6: 4 Bedrooms, 1 Restroom (Quad Suite)
          <g id="layout-4-bed-quad">
            {/* Left Wing Split Wall */}
            <line x1="14" y1="88" x2="84" y2="88" stroke={interiorWallStroke} strokeWidth="3" />
            {/* Right Wing Split Wall */}
            <line x1="136" y1="88" x2="204" y2="88" stroke={interiorWallStroke} strokeWidth="3" />

            {/* Central Corridor Walls (Direct access to all 4 bedrooms) */}
            <line x1="84" y1="12" x2="84" y2="168" stroke={interiorWallStroke} strokeWidth="3" strokeDasharray="54,16,18,16,52" />
            <line x1="136" y1="12" x2="136" y2="168" stroke={interiorWallStroke} strokeWidth="3" strokeDasharray="54,16,18,16,52" />

            {/* Bed 1: Top-Left Bedroom */}
            {renderBed(34, 18, 32, 40)}

            {/* Bed 2: Bottom-Left Bedroom */}
            {renderBed(34, 114, 32, 40)}

            {/* Bed 3: Top-Right Bedroom */}
            {renderBed(156, 18, 32, 40)}

            {/* Bed 4: Bottom-Right Bedroom */}
            {renderBed(156, 114, 32, 40)}
          </g>
        )}

        {/* Outer Door Frame Accents */}
        <rect x="12" y="10" width="196" height="160" fill="none" stroke="#cbd5e1" strokeWidth="0.8" rx="2" />
      </svg>
    </div>
  );
}
