import * as THREE from 'three';
import { CustomizationState, LightingMode } from '../../types';

// Procedural procedural canvas textures for crisp realism without heavy image downloads
export function createMgoPvcTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 18mm fireproof glass-magnesium core topped with 2mm industrial PVC wear layer
    ctx.fillStyle = '#b0b8c4'; // Industrial composite base
    ctx.fillRect(0, 0, 512, 512);

    // Micro-speckle PVC wear layer texture
    for (let i = 0; i < 5000; i++) {
      const px = Math.floor(Math.random() * 512);
      const py = Math.floor(Math.random() * 512);
      const shade = Math.random() > 0.5 ? '#9aa4b2' : '#c8cfd9';
      ctx.fillStyle = shade;
      ctx.fillRect(px, py, 1.5, 1.5);
    }

    // Subtle 600x600mm commercial tile grid seams
    ctx.strokeStyle = '#8592a3';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 512, 512);
    ctx.strokeRect(256, 0, 256, 512);
    ctx.strokeRect(0, 256, 512, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 8);
  return texture;
}

export function createBambooPlywoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 18mm high-density strand-woven bamboo plywood with 2mm PVC top layer
    ctx.fillStyle = '#d4a373'; // Warm natural bamboo amber
    ctx.fillRect(0, 0, 512, 512);

    // Fine linear fibrous bamboo grain
    ctx.fillStyle = '#b88350';
    for (let y = 0; y < 512; y += 4) {
      if (Math.random() > 0.3) {
        ctx.fillRect(0, y, 512, 1);
      }
    }

    // Strand bamboo darker grain variations
    ctx.fillStyle = '#9e6738';
    for (let i = 0; i < 35; i++) {
      const nx = Math.random() * 512;
      const ny = Math.random() * 512;
      ctx.fillRect(nx, ny, Math.random() * 40 + 20, 2);
    }

    // 120mm plank strip seams
    ctx.strokeStyle = '#8c5828';
    ctx.lineWidth = 1;
    for (let x = 0; x < 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 8);
  return texture;
}

export function createBambooWoodFiberWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 75mm bamboo-wood-fiber composite insulation board
    ctx.fillStyle = '#f3f4f6'; // Clean architectural board finish
    ctx.fillRect(0, 0, 512, 512);

    // Subtle composite bamboo fiber micro-texture
    ctx.fillStyle = '#e5e7eb';
    for (let i = 0; i < 4000; i++) {
      const fx = Math.floor(Math.random() * 512);
      const fy = Math.floor(Math.random() * 512);
      ctx.fillRect(fx, fy, 2, 1);
    }

    // Modular V-groove architectural board seams (representing 600mm panels)
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 2, 0);
      ctx.lineTo(x + 2, 512);
      ctx.stroke();
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  return texture;
}

export function createBambooGrapheneWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 50mm bamboo wood fiber graphene insulation integrated board
    ctx.fillStyle = '#f8fafc'; // Architectural graphene-enhanced off-white
    ctx.fillRect(0, 0, 512, 512);

    // Graphene micro-composite conductive matrix
    ctx.fillStyle = '#e2e8f0';
    for (let i = 0; i < 4000; i++) {
      const fx = Math.floor(Math.random() * 512);
      const fy = Math.floor(Math.random() * 512);
      ctx.fillRect(fx, fy, 2, 1);
    }
    // Graphene charcoal nano-flecks
    ctx.fillStyle = '#94a3b8';
    for (let i = 0; i < 600; i++) {
      const gx = Math.floor(Math.random() * 512);
      const gy = Math.floor(Math.random() * 512);
      ctx.fillRect(gx, gy, 1.2, 1.2);
    }

    // Modular V-groove architectural board seams
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 2, 0);
      ctx.lineTo(x + 2, 512);
      ctx.stroke();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  return texture;
}

export function createGalvanizedSteelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Q235 hot-dip galvanized steel with distinctive crystalline zinc spangle
    ctx.fillStyle = '#3f4b5b';
    ctx.fillRect(0, 0, 512, 512);

    // Zinc spangle crystalline polygon facets
    const spangleColors = ['#4d5b6e', '#59687c', '#333f4e', '#66788f', '#3a4655'];
    for (let i = 0; i < 300; i++) {
      const cx = Math.random() * 512;
      const cy = Math.random() * 512;
      const r = Math.random() * 18 + 6;
      ctx.fillStyle = spangleColors[Math.floor(Math.random() * spangleColors.length)];
      ctx.beginPath();
      const sides = Math.floor(Math.random() * 3) + 4;
      for (let s = 0; s < sides; s++) {
        const angle = (s / sides) * Math.PI * 2 + Math.random() * 0.4;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

export function createProceduralPlankTexture(colorHex: string, grainDarkHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle grain lines
    ctx.fillStyle = grainDarkHex;
    for (let y = 0; y < 512; y += 32) {
      ctx.fillRect(0, y, 512, 1);
      // Random subtle plank seams
      for (let x = (y * 37) % 128; x < 512; x += 128) {
        ctx.fillRect(x, y, 1, 32);
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function createProceduralFabricTexture(
  baseHex: string,
  threadHex: string,
  darkThreadHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 512, 512);

    // Fine interwoven textile grid
    for (let x = 0; x < 512; x += 4) {
      for (let y = 0; y < 512; y += 4) {
        const isWarp = (x + y) % 8 === 0;
        ctx.fillStyle = isWarp ? threadHex : darkThreadHex;
        ctx.fillRect(x, y, 3, 3);
      }
    }

    // Organic yarn micro-fuzz / bouclé variation
    ctx.fillStyle = threadHex;
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      ctx.fillRect(rx, ry, Math.random() * 2 + 1, 1);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

export function createProceduralMetalTexture(
  baseHex: string,
  streakHex: string,
  isSand = false
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 512, 512);

    if (isSand) {
      // Sandblasted anodized stipple
      for (let i = 0; i < 9000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? streakHex : '#ffffff';
        ctx.globalAlpha = 0.18;
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
      }
      ctx.globalAlpha = 1.0;
    } else {
      // Hairline directional brushed metal grain
      ctx.fillStyle = streakHex;
      ctx.globalAlpha = 0.25;
      for (let y = 0; y < 512; y += 2) {
        const len = 120 + Math.random() * 380;
        const startX = Math.random() * (512 - len);
        ctx.fillRect(startX, y, len, 1);
      }
      ctx.globalAlpha = 1.0;
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function createProceduralMarbleTexture(
  baseHex: string,
  veinHex: string,
  accentVeinHex: string,
  isSlate = false
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 1024, 1024);

    if (isSlate) {
      // Natural cleft split slate layers
      ctx.globalAlpha = 0.22;
      for (let y = 0; y < 1024; y += 6) {
        ctx.fillStyle = Math.random() > 0.5 ? veinHex : accentVeinHex;
        ctx.fillRect(0, y, 1024, Math.random() * 4 + 1);
      }
      ctx.globalAlpha = 1.0;
    } else {
      // Flowing natural marble veins
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 4 Primary meandering vein streams
      for (let v = 0; v < 5; v++) {
        ctx.strokeStyle = v % 2 === 0 ? veinHex : accentVeinHex;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = Math.random() * 4 + 2;

        ctx.beginPath();
        let curX = Math.random() * 1024;
        let curY = 0;
        ctx.moveTo(curX, curY);

        while (curY < 1024) {
          curX += (Math.random() - 0.5) * 60;
          curY += Math.random() * 50 + 20;
          ctx.lineTo(curX, curY);

          // Branching micro-veins
          if (Math.random() > 0.65) {
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(curX, curY);
            ctx.lineTo(curX + (Math.random() - 0.5) * 80, curY + Math.random() * 40);
            ctx.stroke();
            ctx.beginPath();
            ctx.lineWidth = Math.random() * 3 + 1.5;
            ctx.moveTo(curX, curY);
          }
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

export function createProceduralWaterRippleTexture(
  baseHex: string,
  crestHex: string,
  troughHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 512, 512);

    // Multi-center liquid ripple loops
    const centers = [
      { x: 120, y: 140 },
      { x: 380, y: 160 },
      { x: 260, y: 340 },
      { x: 440, y: 420 },
      { x: 90, y: 400 },
    ];

    centers.forEach(({ x, y }) => {
      for (let r = 20; r < 240; r += 28) {
        ctx.strokeStyle = troughHex;
        ctx.lineWidth = 6;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = crestHex;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, r - 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1.0;
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

export function createCompositeWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // High-grade waterproof composite wood flooring (Warm honey oak / Scandinavian wenge)
    ctx.fillStyle = '#a67c52';
    ctx.fillRect(0, 0, 512, 512);

    // Multi-tone fibrous wood grain
    const grainShades = ['#8d633c', '#be956b', '#734f2d', '#966e46'];
    for (let y = 0; y < 512; y += 2) {
      if (Math.random() > 0.25) {
        ctx.fillStyle = grainShades[Math.floor(Math.random() * grainShades.length)];
        ctx.fillRect(0, y, 512, 1);
      }
    }

    // Wood knot and whorl accents
    for (let k = 0; k < 6; k++) {
      const kx = Math.random() * 512;
      const ky = Math.random() * 512;
      ctx.fillStyle = '#5c3a1e';
      ctx.beginPath();
      ctx.ellipse(kx, ky, Math.random() * 12 + 6, Math.random() * 3 + 1.5, Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Precision lock-edge plank bevel grooves (125mm wide planks)
    ctx.strokeStyle = '#4e3319';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();

      // Staggered butt joints
      for (let y = (x * 47) % 128; y < 512; y += 128) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 64, y);
        ctx.stroke();
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 6);
  return texture;
}

export function createCarvedRibbedNormalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#8080ff'; // flat normal base
    ctx.fillRect(0, 0, 128, 128);

    // Horizontal ridges
    for (let y = 0; y < 128; y += 8) {
      ctx.fillStyle = '#6060ff';
      ctx.fillRect(0, y, 128, 4);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 8);
  return texture;
}

export function createSovietPineWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#c88a4a';
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 3) {
      ctx.fillStyle = Math.random() > 0.5 ? '#b8793b' : '#d89b5c';
      ctx.fillRect(0, y, 512, 1.5);
    }
    ctx.strokeStyle = '#9c602a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      const sx = (i * 26) % 512;
      ctx.moveTo(sx, 0);
      for (let y = 0; y < 512; y += 40) {
        ctx.lineTo(sx + Math.sin(y * 0.05 + i) * 6, y);
      }
      ctx.stroke();
    }
    // Vertical panel slats (representing modular vertical siding)
    ctx.strokeStyle = '#6f411b';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

export function createRedChickenWingWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#782b1d';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#43120b';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      const sx = (i * 18) % 512;
      ctx.moveTo(sx, 0);
      for (let y = 0; y < 512; y += 30) {
        ctx.lineTo(sx + Math.sin(y * 0.08 + i * 0.5) * 12, y);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = '#983d2e';
    ctx.lineWidth = 1;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      const sx = (i * 36) % 512;
      ctx.moveTo(sx, 0);
      for (let y = 0; y < 512; y += 40) {
        ctx.lineTo(sx + Math.cos(y * 0.06) * 8, y);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = '#320b06';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

export function createDarkGreyWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#2d323b';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#262a32' : '#353a45';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
    }
    ctx.strokeStyle = '#1d2026';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

export function createWhiteWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#f1f5f9' : '#ffffff';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
    }
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

export function createHeTianJadeWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#c5d8d6';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 25; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(164, 196, 192, 0.4)' : 'rgba(235, 245, 244, 0.5)';
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 80 + 30, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(132, 168, 163, 0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      const sx = (i * 64) % 512;
      ctx.moveTo(sx, 0);
      for (let y = 0; y < 512; y += 30) {
        ctx.lineTo(sx + Math.sin(y * 0.04 + i) * 20, y);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = '#a6c2bf';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

export function createDigitalCamoWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const colors = ['#8c8466', '#5b6345', '#353c29', '#c4baa0', '#746d52'];
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, 512, 512);

    const pixelSize = 16;
    for (let x = 0; x < 512; x += pixelSize) {
      for (let y = 0; y < 512; y += pixelSize) {
        const n = Math.sin(x * 0.03) + Math.cos(y * 0.03) + Math.sin((x + y) * 0.05);
        let colorIdx = Math.floor(((n + 3) / 6) * colors.length) % colors.length;
        if (Math.random() > 0.4) {
          colorIdx = (colorIdx + Math.floor(Math.random() * 2)) % colors.length;
        }
        ctx.fillStyle = colors[colorIdx];
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 3);
  return tex;
}

export function createOrangeYellowWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 32) {
      ctx.fillStyle = '#c2410c';
      ctx.fillRect(0, y, 512, 4);
      ctx.fillStyle = '#fb923c';
      ctx.fillRect(0, y + 4, 512, 2);
    }
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 3);
  return tex;
}

export function createWhiteBrickWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 512, 512);

    const brickH = 32;
    const brickW = 80;
    const mortar = 4;

    let row = 0;
    for (let y = 0; y < 512; y += brickH) {
      const offset = (row % 2) * (brickW / 2);
      for (let x = -brickW; x < 512 + brickW; x += brickW) {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(x + offset + mortar / 2, y + mortar / 2, brickW - mortar, brickH - mortar);

        for (let i = 0; i < 15; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? '#e2e8f0' : '#ffffff';
          ctx.fillRect(
            x + offset + mortar / 2 + Math.random() * (brickW - mortar),
            y + mortar / 2 + Math.random() * (brickH - mortar),
            3,
            2
          );
        }
      }
      row++;
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

export function createSilverGrayWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 2) {
      ctx.fillStyle = Math.random() > 0.5 ? '#8d95a2' : '#abb3bf';
      ctx.fillRect(0, y, 512, 1);
    }
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

export function createDarkGrayCultureStoneWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 512, 512);

    let y = 0;
    while (y < 512) {
      const stoneH = Math.floor(Math.random() * 14 + 18);
      let x = 0;
      while (x < 512) {
        const stoneW = Math.floor(Math.random() * 45 + 35);
        const shades = ['#334155', '#475569', '#2d3748', '#3e4c59', '#52606d'];
        ctx.fillStyle = shades[Math.floor(Math.random() * shades.length)];
        ctx.fillRect(x + 2, y + 2, stoneW - 4, stoneH - 4);

        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.fillRect(x + 2, y + 2, stoneW - 4, 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.fillRect(x + 2, y + stoneH - 4, stoneW - 4, 2);

        x += stoneW;
      }
      y += stoneH;
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export function createBeigeWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#e2ceb1';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#d4bf9f' : '#eddcc7';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
    }
    ctx.strokeStyle = '#c4ae8f';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

export function createSpottedMarbleWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#dce1e7';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 3500; i++) {
      const roll = Math.random();
      ctx.fillStyle = roll < 0.4 ? '#374151' : roll < 0.7 ? '#6b7280' : '#ffffff';
      const size = Math.random() * 2.5 + 1;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, size, size);
    }
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#1f2937' : '#9ca3af';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 4, 3);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

// =========================================================================
// 12 EXPANDABLE HOUSE FACTORY CATALOG EXTERIOR TEXTURES (OFFICIAL SPEC)
// =========================================================================

export function createWengeWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#421d12';
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 2) {
      ctx.fillStyle = Math.random() > 0.4 ? '#5c2c16' : '#2b1008';
      ctx.fillRect(0, y, 512, 1);
    }
    ctx.strokeStyle = '#1d0905';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      const sx = (i * 13) % 512;
      ctx.moveTo(sx, 0);
      for (let y = 0; y < 512; y += 25) {
        ctx.lineTo(sx + Math.sin(y * 0.08 + i) * 6, y);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = '#150603';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

export function createBigEyeWoodWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#c68a4c';
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 3) {
      ctx.fillStyle = Math.random() > 0.5 ? '#b8793b' : '#d49b5c';
      ctx.fillRect(0, y, 512, 1.5);
    }

    ctx.strokeStyle = '#9c602a';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      const sx = (i * 22) % 512;
      ctx.moveTo(sx, 0);
      for (let y = 0; y < 512; y += 30) {
        ctx.lineTo(sx + Math.sin(y * 0.04 + i) * 8, y);
      }
      ctx.stroke();
    }

    const knots = [
      { x: 120, y: 160, r: 24 },
      { x: 380, y: 240, r: 32 },
      { x: 220, y: 400, r: 26 },
      { x: 450, y: 80, r: 20 },
    ];
    for (const knot of knots) {
      ctx.fillStyle = '#42210b';
      ctx.beginPath();
      ctx.ellipse(knot.x, knot.y, knot.r * 0.4, knot.r * 0.3, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#5a3012';
      ctx.lineWidth = 1.5;
      for (let r = knot.r * 0.6; r <= knot.r * 1.6; r += 4) {
        ctx.beginPath();
        ctx.ellipse(knot.x, knot.y, r, r * 0.75, Math.PI / 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = '#6f411b';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

export function createAncientWallGreyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#6b7075';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 4000; i++) {
      const roll = Math.random();
      ctx.fillStyle = roll < 0.4 ? '#4e5358' : roll < 0.7 ? '#868c93' : '#a0a6ad';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    const rowH = 32;
    for (let y = 0; y < 512; y += rowH) {
      ctx.fillStyle = 'rgba(30, 35, 40, 0.45)';
      ctx.fillRect(0, y, 512, 3);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, y + 3, 512, 1.5);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

export function createAngelWhiteWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 512);

    const rowH = 32;
    for (let y = 0; y < 512; y += rowH) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.fillRect(0, y, 512, 2.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, y + 2.5, 512, 1.5);
    }

    ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
    for (let r = 0; r < 512 / rowH; r++) {
      const y = r * rowH;
      const offset = (r % 2) * 64;
      for (let x = offset; x < 512; x += 128) {
        ctx.fillRect(x, y, 2, rowH);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

export function createDesertYellowWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#d9a74a';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 3500; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#b8852c' : '#edbe66';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    const rowH = 32;
    for (let y = 0; y < 512; y += rowH) {
      ctx.fillStyle = '#8f6118';
      ctx.fillRect(0, y, 512, 2.5);
      ctx.fillStyle = '#fce29d';
      ctx.fillRect(0, y + 2.5, 512, 1);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

export function createMultiColorBrickTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#dedad4';
    ctx.fillRect(0, 0, 512, 512);

    const brickH = 26;
    const brickW = 60;
    const colors = ['#8c4d62', '#a35e72', '#b67484', '#9e5347', '#b36b5e', '#caa892', '#824156'];

    let rowIndex = 0;
    for (let y = 2; y < 512; y += brickH + 4) {
      const offsetX = (rowIndex % 2) * (brickW / 2);
      for (let x = -brickW; x < 512 + brickW; x += brickW + 4) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = color;
        ctx.fillRect(x + offsetX, y, brickW, brickH);

        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(x + offsetX, y + brickH - 2, brickW, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x + offsetX, y, brickW, 1.5);
      }
      rowIndex++;
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export function createGrassGreenWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#58933b';
    ctx.fillRect(0, 0, 512, 512);

    const rowH = 40;
    for (let y = 0; y < 512; y += rowH) {
      const grad = ctx.createLinearGradient(0, y, 0, y + rowH);
      grad.addColorStop(0, '#66a845');
      grad.addColorStop(0.3, '#58933b');
      grad.addColorStop(0.95, '#477a2e');
      grad.addColorStop(1, '#335820');
      ctx.fillStyle = grad;
      ctx.fillRect(0, y, 512, rowH);

      ctx.fillStyle = '#223c14';
      ctx.fillRect(0, y + rowH - 2, 512, 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, y, 512, 1.5);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export function createPineKnotWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#93452c';
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 3) {
      ctx.fillStyle = Math.random() > 0.5 ? '#803822' : '#a85338';
      ctx.fillRect(0, y, 512, 1.5);
    }

    const knots = [
      { x: 180, y: 120, r: 18 },
      { x: 340, y: 320, r: 24 },
      { x: 100, y: 440, r: 16 },
    ];
    for (const knot of knots) {
      ctx.fillStyle = '#3a1309';
      ctx.beginPath();
      ctx.ellipse(knot.x, knot.y, knot.r * 0.4, knot.r * 0.3, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#5c2214';
      ctx.lineWidth = 1.5;
      for (let r = knot.r * 0.6; r <= knot.r * 1.5; r += 3.5) {
        ctx.beginPath();
        ctx.ellipse(knot.x, knot.y, r, r * 0.7, Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = '#4e1b0e';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

export function createCultureStoneWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#2d2621';
    ctx.fillRect(0, 0, 512, 512);

    const stoneColors = ['#5e544c', '#756960', '#4a423b', '#8a7d73', '#685e55', '#3d3630'];
    let y = 4;
    while (y < 512) {
      const h = Math.floor(Math.random() * 20 + 24);
      let x = 4;
      while (x < 512) {
        const w = Math.floor(Math.random() * 45 + 40);
        const col = stoneColors[Math.floor(Math.random() * stoneColors.length)];
        ctx.fillStyle = col;
        ctx.fillRect(x, y, Math.min(w, 512 - x), Math.min(h, 512 - y));

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x, y + h - 3, w, 3);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x, y, w, 2);

        x += w + 4;
      }
      y += h + 4;
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export function createGoldenBuffBrickTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ded2ba';
    ctx.fillRect(0, 0, 512, 512);

    const brickH = 26;
    const brickW = 60;
    const colors = ['#cb9652', '#dca660', '#ba8644', '#e2b36e', '#bf8c48'];

    let rowIndex = 0;
    for (let y = 3; y < 512; y += brickH + 4) {
      const offsetX = (rowIndex % 2) * (brickW / 2);
      for (let x = -brickW; x < 512 + brickW; x += brickW + 4) {
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(x + offsetX, y, brickW, brickH);

        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + offsetX, y + brickH - 2, brickW, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x + offsetX, y, brickW, 1.5);
      }
      rowIndex++;
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export function createClassicRedBrickTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#d1cecb';
    ctx.fillRect(0, 0, 512, 512);

    const brickH = 26;
    const brickW = 60;
    const colors = ['#8c3e34', '#9e493e', '#793027', '#aa5448', '#84372e'];

    let rowIndex = 0;
    for (let y = 3; y < 512; y += brickH + 4) {
      const offsetX = (rowIndex % 2) * (brickW / 2);
      for (let x = -brickW; x < 512 + brickW; x += brickW + 4) {
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(x + offsetX, y, brickW, brickH);

        ctx.fillStyle = 'rgba(0,0,0,0.14)';
        ctx.fillRect(x + offsetX, y + brickH - 2, brickW, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(x + offsetX, y, brickW, 1.5);
      }
      rowIndex++;
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export function createAntiqueBlueBrickTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#b8c0c8';
    ctx.fillRect(0, 0, 512, 512);

    const brickH = 26;
    const brickW = 60;
    const colors = ['#4e5d6c', '#5b6c7d', '#42505e', '#65778a', '#475664'];

    let rowIndex = 0;
    for (let y = 3; y < 512; y += brickH + 4) {
      const offsetX = (rowIndex % 2) * (brickW / 2);
      for (let x = -brickW; x < 512 + brickW; x += brickW + 4) {
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(x + offsetX, y, brickW, brickH);

        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + offsetX, y + brickH - 2, brickW, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x + offsetX, y, brickW, 1.5);
      }
      rowIndex++;
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export function createSolarGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 1. Deep Midnight Obsidian Anti-Reflective Silicon Base
    ctx.fillStyle = '#060d19';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle crystalline depth gradient
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, 'rgba(8, 20, 38, 0.9)');
    grad.addColorStop(0.5, 'rgba(10, 24, 46, 0.7)');
    grad.addColorStop(1, 'rgba(6, 14, 26, 0.9)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. High-Efficiency Half-Cut Cell Matrix: 6 Columns x 12 Rows
    const cols = 6;
    const rows = 12;
    const marginX = 24;
    const marginY = 24;
    const gapX = 4;
    const gapY = 4;
    const centerSplitGap = 16; // Central half-cut module string division

    const totalW = 1024 - marginX * 2;
    const cellW = (totalW - (cols - 1) * gapX) / cols;
    const totalH = 1024 - marginY * 2 - centerSplitGap;
    const cellH = totalH / rows;

    for (let c = 0; c < cols; c++) {
      const x0 = marginX + c * (cellW + gapX);

      for (let r = 0; r < rows; r++) {
        // Split rows between top 6 and bottom 6 for half-cut module design
        const isBottomHalf = r >= 6;
        const y0 = marginY + r * (cellH + gapY) + (isBottomHalf ? centerSplitGap : 0);

        // Silicon wafer background
        ctx.fillStyle = '#08172c';
        ctx.fillRect(x0, y0, cellW, cellH);

        // Chamfered Monocrystalline pseudo-square corners
        const cornerCut = 9;
        ctx.fillStyle = '#02050a'; // Dark composite backsheet in corner gaps
        // Top-left
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 + cornerCut, y0);
        ctx.lineTo(x0, y0 + cornerCut);
        ctx.closePath();
        ctx.fill();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(x0 + cellW, y0);
        ctx.lineTo(x0 + cellW - cornerCut, y0);
        ctx.lineTo(x0 + cellW, y0 + cornerCut);
        ctx.closePath();
        ctx.fill();
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(x0, y0 + cellH);
        ctx.lineTo(x0 + cornerCut, y0 + cellH);
        ctx.lineTo(x0, y0 + cellH - cornerCut);
        ctx.closePath();
        ctx.fill();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(x0 + cellW, y0 + cellH);
        ctx.lineTo(x0 + cellW - cornerCut, y0 + cellH);
        ctx.lineTo(x0 + cellW, y0 + cellH - cornerCut);
        ctx.closePath();
        ctx.fill();

        // 3. Ultra-Dense Silicon Micro-Fingers (horizontal conductive grid)
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.22)';
        ctx.lineWidth = 1;
        for (let fy = y0 + 3; fy < y0 + cellH - 2; fy += 4) {
          ctx.beginPath();
          ctx.moveTo(x0 + 1, fy);
          ctx.lineTo(x0 + cellW - 1, fy);
          ctx.stroke();
        }

        // 4. Multi-Busbar (MBB) Technology: 9 ultra-fine silver busbars per cell
        const busbars = 9;
        const busbarSpacing = cellW / (busbars + 1);
        ctx.strokeStyle = '#e2e8f0'; // Metallic silver conductor
        ctx.lineWidth = 1.6;

        for (let b = 1; b <= busbars; b++) {
          const bx = x0 + b * busbarSpacing;
          ctx.beginPath();
          ctx.moveTo(bx, y0);
          ctx.lineTo(bx, y0 + cellH);
          ctx.stroke();

          // Conductor solder bonding pads at cell borders
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(bx - 1.5, y0, 3, 3);
          ctx.fillRect(bx - 1.5, y0 + cellH - 3, 3, 3);
        }
      }
    }

    // 5. Central Half-Cut String Division Bridge
    const splitY = marginY + 6 * (cellH + gapY);
    ctx.fillStyle = '#030712';
    ctx.fillRect(marginX - 6, splitY, totalW + 12, centerSplitGap);

    // Silver bypass ribbon connectors across central division
    ctx.fillStyle = '#94a3b8';
    for (let i = 0; i < cols; i++) {
      const ribbonX = marginX + i * (cellW + gapX) + cellW * 0.45;
      ctx.fillRect(ribbonX, splitY + 2, cellW * 0.1, centerSplitGap - 4);
    }

    // 6. Perimeter Anti-Reflective Margin Border inside Aluminum Frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 1004, 1004);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  return texture;
}

export interface MaterialLibrary {
  wallMaterial: THREE.MeshPhysicalMaterial;
  chassisMaterial: THREE.MeshStandardMaterial;
  glassMaterial: THREE.MeshPhysicalMaterial;
  floorMaterial: THREE.MeshStandardMaterial;
  roofMaterial: THREE.MeshStandardMaterial;
  solarMaterial: THREE.MeshStandardMaterial;
  ledStripMaterial: THREE.MeshStandardMaterial;
  downlightMaterial: THREE.MeshStandardMaterial;
  woodDeckMaterial: THREE.MeshStandardMaterial;
  interiorWallMaterial: THREE.MeshStandardMaterial;
  countertopMaterial: THREE.MeshStandardMaterial;
  cabinetMaterial: THREE.MeshStandardMaterial;
  cabinetWoodNicheMaterial: THREE.MeshStandardMaterial;
  brassHandleMaterial: THREE.MeshStandardMaterial;
  applianceGlassMaterial: THREE.MeshStandardMaterial;
  backsplashMaterial: THREE.MeshStandardMaterial;
  metalTrimMaterial: THREE.MeshStandardMaterial;
  furnitureFabricMaterial: THREE.MeshStandardMaterial;
  rugMaterial: THREE.MeshStandardMaterial;
  bedLinenMaterial: THREE.MeshStandardMaterial;
  bedDuvetMaterial: THREE.MeshStandardMaterial;
  bedAccentThrowMaterial: THREE.MeshStandardMaterial;
  nightstandWoodMaterial: THREE.MeshStandardMaterial;
  lampGlowMaterial: THREE.MeshStandardMaterial;
  sofaBoucleMaterial: THREE.MeshStandardMaterial;
  sofaWoodFrameMaterial: THREE.MeshStandardMaterial;
  sofaLegMaterial: THREE.MeshStandardMaterial;
  sofaCushionAccent1: THREE.MeshStandardMaterial;
  sofaCushionAccent2: THREE.MeshStandardMaterial;
  sofaThrowBlanketMaterial: THREE.MeshStandardMaterial;
  travertineTableMaterial: THREE.MeshStandardMaterial;
  ceramicVesselMaterial: THREE.MeshStandardMaterial;
  candleGlowMaterial: THREE.MeshStandardMaterial;
  solarFrameMaterial: THREE.MeshStandardMaterial;
  solarRailMaterial: THREE.MeshStandardMaterial;
  solarClampMaterial: THREE.MeshStandardMaterial;
  solarMicroinverterMaterial: THREE.MeshStandardMaterial;
  solarConduitMaterial: THREE.MeshStandardMaterial;
  solarStatusLedMaterial: THREE.MeshStandardMaterial;
  solarDecalMaterial: THREE.MeshStandardMaterial;
  telescopeBodyMaterial: THREE.MeshStandardMaterial;
  stairTreadMaterial: THREE.MeshStandardMaterial;
  terraceLightMaterial: THREE.MeshStandardMaterial;
  terraceFabricMaterial: THREE.MeshStandardMaterial;
  terraceTableMaterial: THREE.MeshStandardMaterial;
  capsuleGlowMaterial: THREE.MeshStandardMaterial;
  isoCornerCastingMaterial: THREE.MeshStandardMaterial;
  corrugatedPanelMaterial: THREE.MeshStandardMaterial;
  q235SteelMaterial: THREE.MeshStandardMaterial;
  whiteDoorFrameMaterial: THREE.MeshStandardMaterial;
  darkDoorFrameMaterial: THREE.MeshStandardMaterial;
  windowFrameMaterial: THREE.MeshStandardMaterial;
  windowGasketMaterial: THREE.MeshStandardMaterial;
  windowSillMaterial: THREE.MeshStandardMaterial;
  windowSpacerMaterial: THREE.MeshStandardMaterial;
  windowHardwareMaterial: THREE.MeshStandardMaterial;
  bambooPlywoodMaterial: THREE.MeshStandardMaterial;
  mgoBoardMaterial: THREE.MeshStandardMaterial;
  bambooCharcoalWallMaterial: THREE.MeshStandardMaterial;
  bambooGrapheneWallMaterial: THREE.MeshStandardMaterial;
  compositeWoodFloorMaterial: THREE.MeshStandardMaterial;
  woodgrainSteelMaterial: THREE.MeshStandardMaterial;
}

export function createMaterialLibrary(
  state: CustomizationState,
  lightingMode: LightingMode,
  activeOptions?: any
): MaterialLibrary {
  // Wall cladding parameters based on state
  let wallColor = activeOptions?.wallOpt?.color || '#f8fafc';
  let wallRoughness = activeOptions?.wallOpt?.roughness ?? 0.35;
  let wallMetalness = activeOptions?.wallOpt?.metalness ?? 0.15;
  let wallClearcoat = activeOptions?.wallOpt?.clearcoat ?? 0;
  let wallMap: THREE.Texture | null = null;
  let wallBumpMap: THREE.Texture | null = null;
  let wallBumpScale = 0.04;

  switch (state.wallCladding) {
    // --- 12 Factory Catalog Expandable House Exterior Designs ---
    case 'wenge':
      wallMap = createWengeWallTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.05;
      wallRoughness = 0.50;
      wallMetalness = 0.05;
      break;
    case 'big-eye-wood':
      wallMap = createBigEyeWoodWallTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.05;
      wallRoughness = 0.52;
      wallMetalness = 0.05;
      break;
    case 'ancient-wall-grey':
      wallMap = createAncientWallGreyTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.08;
      wallRoughness = 0.65;
      wallMetalness = 0.10;
      break;
    case 'angel-white':
      wallMap = createAngelWhiteWallTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.06;
      wallRoughness = 0.28;
      wallMetalness = 0.08;
      break;
    case 'desert-yellow':
      wallMap = createDesertYellowWallTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.07;
      wallRoughness = 0.60;
      wallMetalness = 0.08;
      break;
    case 'multi-color-brick':
      wallMap = createMultiColorBrickTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.09;
      wallRoughness = 0.72;
      wallMetalness = 0.05;
      break;
    case 'grass-green':
      wallMap = createGrassGreenWallTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.05;
      wallRoughness = 0.38;
      wallMetalness = 0.22;
      break;
    case 'pine-knot':
      wallMap = createPineKnotWallTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.06;
      wallRoughness = 0.55;
      wallMetalness = 0.05;
      break;
    case 'culture-stone':
      wallMap = createCultureStoneWallTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.14;
      wallRoughness = 0.85;
      wallMetalness = 0.05;
      break;
    case 'golden-buff-brick':
      wallMap = createGoldenBuffBrickTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.08;
      wallRoughness = 0.70;
      wallMetalness = 0.05;
      break;
    case 'classic-red-brick':
      wallMap = createClassicRedBrickTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.09;
      wallRoughness = 0.75;
      wallMetalness = 0.05;
      break;
    case 'antique-blue-brick':
      wallMap = createAntiqueBlueBrickTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.09;
      wallRoughness = 0.68;
      wallMetalness = 0.08;
      break;

    // --- Extended Color Steel Plate Finishes ---
    case 'soviet-pine':
      wallMap = createSovietPineWallTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.05;
      wallRoughness = 0.55;
      wallMetalness = 0.05;
      break;
    case 'red-chicken-wing':
      wallMap = createRedChickenWingWallTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.05;
      wallRoughness = 0.5;
      wallMetalness = 0.05;
      break;
    case 'dark-grey':
      wallMap = createDarkGreyWallTexture();
      wallRoughness = 0.35;
      wallMetalness = 0.2;
      break;
    case 'fluoro-white':
      wallMap = createWhiteWallTexture();
      wallRoughness = 0.25;
      wallMetalness = 0.1;
      break;
    case 'he-tian-jade':
      wallMap = createHeTianJadeWallTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.02;
      wallRoughness = 0.2;
      wallMetalness = 0.1;
      wallClearcoat = 0.3;
      break;
    case 'digital-camo':
      wallMap = createDigitalCamoWallTexture();
      wallRoughness = 0.7;
      wallMetalness = 0.05;
      break;
    case 'orange-yellow':
      wallMap = createOrangeYellowWallTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.04;
      wallRoughness = 0.35;
      wallMetalness = 0.15;
      break;
    case 'white-brick':
      wallMap = createWhiteBrickWallTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.08;
      wallRoughness = 0.75;
      wallMetalness = 0.05;
      break;
    case 'silver-gray':
      wallMap = createSilverGrayWallTexture();
      wallRoughness = 0.3;
      wallMetalness = 0.6;
      break;
    case 'dark-gray-stone':
      wallMap = createDarkGrayCultureStoneWallTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.12;
      wallRoughness = 0.8;
      wallMetalness = 0.05;
      break;
    case 'beige':
      wallMap = createBeigeWallTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.03;
      wallRoughness = 0.6;
      wallMetalness = 0.05;
      break;
    case 'spotted-marble':
      wallMap = createSpottedMarbleWallTexture();
      wallBumpMap = wallMap;
      wallBumpScale = 0.03;
      wallRoughness = 0.25;
      wallMetalness = 0.1;
      wallClearcoat = 0.2;
      break;
    case 'carved-metal-slate':
      wallBumpMap = createCarvedRibbedNormalTexture();
      wallBumpScale = 0.08;
      break;
    case 'wpc-nordic-oak':
      break;
  }

  // Glazing parameters - optimized for crystal-clear architectural visibility
  let glassColor = '#cbe4f8';
  let glassTransmission = 0.70;
  let glassOpacity = 0.58;
  let glassRoughness = 0.04;

  switch (state.glazing) {
    case 'casement-window':
    case 'sliding-window':
    case 'tophanging-window':
    case 'overhanging-window':
    case 'broken-bridge-sliding-door':
    case 'broken-bridge-double-door':
    case 'aluminum-alloy-double-door':
    case 'kfc-double-door':
    case 'broken-bridge-grille-door':
    case 'low-e-clear':
      glassColor = '#e0f2fe'; // High-clarity architectural float glass with subtle pale sky specular sheen
      glassTransmission = 0.85;
      glassOpacity = 0.35;
      glassRoughness = 0.02;
      break;
    case 'low-e-bronze':
      glassColor = '#b45309';
      glassTransmission = 0.65;
      glassOpacity = 0.65;
      break;
    case 'floor-ceiling-curtain':
      glassColor = '#93c5fd';
      glassTransmission = 0.78;
      glassOpacity = 0.45;
      break;
    case 'privacy-smart-glass':
      glassColor = state.hasElectricBlinds ? '#f1f5f9' : '#e0e7ff';
      glassTransmission = state.hasElectricBlinds ? 0.25 : 0.75;
      glassOpacity = state.hasElectricBlinds ? 0.90 : 0.50;
      glassRoughness = state.hasElectricBlinds ? 0.5 : 0.05;
      break;
    default:
      if (activeOptions?.glassOpt?.color) {
        glassColor = activeOptions.glassOpt.color;
      }
      break;
  }

  // Flooring parameters - 6 Collections, 24 Material Finishes from Catalog
  let floorBaseColor = activeOptions?.floorOpt?.color || '#d6c4a8';
  let floorRoughness = 0.42;
  let floorMetalness = 0.05;
  let floorClearcoat = 0;
  let floorTexture: THREE.CanvasTexture | null = null;

  switch (state.flooring) {
    // =========================================================================
    // 1. WOOD GRAIN ("Natural texture, warm and timeless")
    // =========================================================================
    case 'wood-nordic-pale-oak':
    case 'spc-nordic-oak':
      floorBaseColor = '#d6c4a8';
      floorRoughness = 0.42;
      floorMetalness = 0.05;
      floorTexture = createProceduralPlankTexture(floorBaseColor, '#b8a383');
      break;
    case 'wood-honey-oak':
      floorBaseColor = '#a67b4f';
      floorRoughness = 0.38;
      floorMetalness = 0.05;
      floorTexture = createProceduralPlankTexture(floorBaseColor, '#7a5127');
      break;
    case 'wood-rich-teak':
    case 'spc-american-walnut':
      floorBaseColor = '#754b28';
      floorRoughness = 0.35;
      floorMetalness = 0.05;
      floorTexture = createProceduralPlankTexture(floorBaseColor, '#4a2c14');
      break;
    case 'wood-smoked-walnut':
      floorBaseColor = '#2b211b';
      floorRoughness = 0.40;
      floorMetalness = 0.05;
      floorTexture = createProceduralPlankTexture(floorBaseColor, '#17120e');
      break;

    // =========================================================================
    // 2. FABRIC ("Soft touch, elegant and cozy")
    // =========================================================================
    case 'fabric-cream-linen':
      floorBaseColor = '#ded8ce';
      floorRoughness = 0.88;
      floorMetalness = 0.02;
      floorTexture = createProceduralFabricTexture(floorBaseColor, '#f0ebe1', '#b8b0a2');
      break;
    case 'fabric-oatmeal-tweed':
      floorBaseColor = '#968a78';
      floorRoughness = 0.85;
      floorMetalness = 0.02;
      floorTexture = createProceduralFabricTexture(floorBaseColor, '#b3a794', '#6e6252');
      break;
    case 'fabric-charcoal-boucle':
      floorBaseColor = '#4f4841';
      floorRoughness = 0.82;
      floorMetalness = 0.02;
      floorTexture = createProceduralFabricTexture(floorBaseColor, '#6e655c', '#302c27');
      break;
    case 'fabric-midnight-obsidian':
      floorBaseColor = '#1c1c1f';
      floorRoughness = 0.80;
      floorMetalness = 0.04;
      floorTexture = createProceduralFabricTexture(floorBaseColor, '#323238', '#0f0f12');
      break;

    // =========================================================================
    // 3. METAL ("Sleek and modern, stylish and luxurious")
    // =========================================================================
    case 'metal-silver-sand':
      floorBaseColor = '#a1a8b0';
      floorRoughness = 0.30;
      floorMetalness = 0.82;
      floorTexture = createProceduralMetalTexture(floorBaseColor, '#c4cbd4', true);
      break;
    case 'metal-brushed-steel':
      floorBaseColor = '#b8bcc2';
      floorRoughness = 0.22;
      floorMetalness = 0.88;
      floorTexture = createProceduralMetalTexture(floorBaseColor, '#dee2e6', false);
      break;
    case 'metal-brushed-bronze':
      floorBaseColor = '#7a5a3a';
      floorRoughness = 0.24;
      floorMetalness = 0.86;
      floorTexture = createProceduralMetalTexture(floorBaseColor, '#a37c55', false);
      break;
    case 'metal-matte-obsidian':
      floorBaseColor = '#181b1f';
      floorRoughness = 0.26;
      floorMetalness = 0.85;
      floorTexture = createProceduralMetalTexture(floorBaseColor, '#2f343b', false);
      break;

    // =========================================================================
    // 4. MARBLE/ROCK ("Natural stone look, bold and impressive")
    // =========================================================================
    case 'stone-calacatta-white':
    case 'polished-marble-white':
      floorBaseColor = '#f3f6fa';
      floorRoughness = 0.12;
      floorMetalness = 0.10;
      floorClearcoat = 0.8;
      floorTexture = createProceduralMarbleTexture(floorBaseColor, '#5a626d', '#9aa1ab', false);
      break;
    case 'stone-grey-slate':
    case 'spc-terrazzo-grey':
    case 'industrial-cement':
      floorBaseColor = '#8a8d91';
      floorRoughness = 0.55;
      floorMetalness = 0.08;
      floorTexture = createProceduralMarbleTexture(floorBaseColor, '#5e6166', '#adb0b5', true);
      break;
    case 'stone-nero-marquina':
      floorBaseColor = '#14171c';
      floorRoughness = 0.10;
      floorMetalness = 0.12;
      floorClearcoat = 0.85;
      floorTexture = createProceduralMarbleTexture(floorBaseColor, '#edf2f7', '#cbd5e1', false);
      break;
    case 'stone-golden-sahara':
      floorBaseColor = '#f5edd6';
      floorRoughness = 0.15;
      floorMetalness = 0.12;
      floorClearcoat = 0.75;
      floorTexture = createProceduralMarbleTexture(floorBaseColor, '#b8893d', '#7a5820', false);
      break;

    // =========================================================================
    // 5. MIRROR ("Reflective beauty, expand the space")
    // =========================================================================
    case 'mirror-silver-chrome':
      floorBaseColor = '#c8d1db';
      floorRoughness = 0.02;
      floorMetalness = 0.96;
      floorClearcoat = 1.0;
      floorTexture = createProceduralMetalTexture(floorBaseColor, '#ffffff', false);
      break;
    case 'mirror-polished-gold':
      floorBaseColor = '#c9963f';
      floorRoughness = 0.03;
      floorMetalness = 0.95;
      floorClearcoat = 1.0;
      floorTexture = createProceduralMetalTexture(floorBaseColor, '#ffe29a', false);
      break;
    case 'mirror-smoked-bronze':
      floorBaseColor = '#6e4c2c';
      floorRoughness = 0.04;
      floorMetalness = 0.92;
      floorClearcoat = 0.95;
      floorTexture = createProceduralMetalTexture(floorBaseColor, '#a8784e', false);
      break;
    case 'mirror-piano-black':
      floorBaseColor = '#0a0b0d';
      floorRoughness = 0.02;
      floorMetalness = 0.90;
      floorClearcoat = 1.0;
      floorTexture = createProceduralMetalTexture(floorBaseColor, '#22252b', false);
      break;

    // =========================================================================
    // 6. WATER RIPPLE ("Unique ripple effect, artistic and dynamic")
    // =========================================================================
    case 'ripple-silver-fluid':
      floorBaseColor = '#cfd8e3';
      floorRoughness = 0.14;
      floorMetalness = 0.88;
      floorClearcoat = 0.90;
      floorTexture = createProceduralWaterRippleTexture(floorBaseColor, '#ffffff', '#8794a3');
      break;
    case 'ripple-titanium-grey':
      floorBaseColor = '#7a828c';
      floorRoughness = 0.16;
      floorMetalness = 0.86;
      floorClearcoat = 0.85;
      floorTexture = createProceduralWaterRippleTexture(floorBaseColor, '#b0b8c2', '#424852');
      break;
    case 'ripple-amber-bronze':
      floorBaseColor = '#6e4e2e';
      floorRoughness = 0.15;
      floorMetalness = 0.88;
      floorClearcoat = 0.85;
      floorTexture = createProceduralWaterRippleTexture(floorBaseColor, '#bfa075', '#3d2914');
      break;
    case 'ripple-midnight-black':
      floorBaseColor = '#121417';
      floorRoughness = 0.14;
      floorMetalness = 0.90;
      floorClearcoat = 0.95;
      floorTexture = createProceduralWaterRippleTexture(floorBaseColor, '#454c57', '#050608');
      break;

    // Legacy fallbacks
    case 'deep-forest-green':
      floorBaseColor = '#09250c';
      floorRoughness = 0.1;
      floorMetalness = 0.1;
      floorTexture = createProceduralPlankTexture(floorBaseColor, '#041005');
      break;
    case 'peechit-navy':
      floorBaseColor = '#00004d';
      floorRoughness = 0.2;
      floorMetalness = 0.1;
      floorTexture = createProceduralPlankTexture(floorBaseColor, '#000026');
      break;
    case 'patterned-parquet':
      floorBaseColor = '#c29b6e';
      floorRoughness = 0.35;
      floorMetalness = 0.05;
      floorTexture = createProceduralPlankTexture(floorBaseColor, '#8c683e');
      break;

    default:
      floorTexture = createProceduralPlankTexture(floorBaseColor, '#b8a383');
      break;
  }

  // Cabinetry parameters
  let cabinetColor = activeOptions?.cabOpt?.color || '#1e293b';
  let cabinetRoughness = 0.4;
  let cabinetMetalness = 0.2;

  switch (state.cabinetry) {
    case 'matte-black':
      cabinetRoughness = 0.6;
      cabinetMetalness = 0.1;
      break;
    case 'gloss-white':
      cabinetRoughness = 0.1;
      cabinetMetalness = 0.05;
      break;
    case 'deep-forest-green':
      cabinetRoughness = 0.6;
      cabinetMetalness = 0.1;
      break;
    case 'peechit-navy':
      cabinetRoughness = 0.6;
      cabinetMetalness = 0.1;
      break;
  }

  // Indoor / Interior Wall Panel parameters
  let intWallColor = activeOptions?.interiorWallOpt?.color || '#f8fafc';
  let intWallRoughness = 0.55;
  let intWallMetalness = 0.05;
  let intWallClearcoat = 0;
  let intWallMap: THREE.Texture | null = createBambooWoodFiberWallTexture();
  let intWallBumpMap: THREE.Texture | null = null;
  let intWallBumpScale = 0.03;

  switch (state.interiorWall) {
    // =========================================================================
    // 1. WOOD GRAIN ("Natural texture, warm and timeless")
    // =========================================================================
    case 'wood-nordic-pale-oak':
      intWallColor = '#d6c4a8';
      intWallRoughness = 0.45;
      intWallMetalness = 0.04;
      intWallMap = createProceduralPlankTexture('#d6c4a8', '#b89f7d');
      intWallBumpMap = intWallMap;
      break;
    case 'wood-honey-oak':
      intWallColor = '#a67b4f';
      intWallRoughness = 0.42;
      intWallMetalness = 0.04;
      intWallMap = createProceduralPlankTexture('#a67b4f', '#7d552c');
      intWallBumpMap = intWallMap;
      break;
    case 'wood-rich-teak':
      intWallColor = '#754b28';
      intWallRoughness = 0.40;
      intWallMetalness = 0.04;
      intWallMap = createProceduralPlankTexture('#754b28', '#4d2d14');
      intWallBumpMap = intWallMap;
      break;
    case 'wood-smoked-walnut':
      intWallColor = '#2b211b';
      intWallRoughness = 0.38;
      intWallMetalness = 0.05;
      intWallMap = createProceduralPlankTexture('#2b211b', '#17110c');
      intWallBumpMap = intWallMap;
      break;

    // =========================================================================
    // 2. FABRIC ("Soft touch, elegant and cozy")
    // =========================================================================
    case 'fabric-cream-linen':
      intWallColor = '#ded8ce';
      intWallRoughness = 0.85;
      intWallMetalness = 0.02;
      intWallMap = createProceduralFabricTexture('#ded8ce', '#ebe5dc', '#b8b0a2');
      break;
    case 'fabric-oatmeal-tweed':
      intWallColor = '#968a78';
      intWallRoughness = 0.88;
      intWallMetalness = 0.02;
      intWallMap = createProceduralFabricTexture('#968a78', '#b3a692', '#6b6152');
      break;
    case 'fabric-charcoal-boucle':
      intWallColor = '#4f4841';
      intWallRoughness = 0.85;
      intWallMetalness = 0.03;
      intWallMap = createProceduralFabricTexture('#4f4841', '#6e655c', '#2e2a25');
      break;
    case 'fabric-midnight-obsidian':
      intWallColor = '#1c1c1f';
      intWallRoughness = 0.82;
      intWallMetalness = 0.04;
      intWallMap = createProceduralFabricTexture('#1c1c1f', '#323238', '#0f0f12');
      break;

    // =========================================================================
    // 3. METAL ("Sleek and modern, stylish and luxurious")
    // =========================================================================
    case 'metal-silver-sand':
      intWallColor = '#a1a8b0';
      intWallRoughness = 0.28;
      intWallMetalness = 0.85;
      intWallMap = createProceduralMetalTexture(intWallColor, '#c4cbd4', true);
      break;
    case 'metal-brushed-steel':
      intWallColor = '#b8bcc2';
      intWallRoughness = 0.20;
      intWallMetalness = 0.90;
      intWallMap = createProceduralMetalTexture(intWallColor, '#dee2e6', false);
      break;
    case 'metal-brushed-bronze':
      intWallColor = '#7a5a3a';
      intWallRoughness = 0.22;
      intWallMetalness = 0.88;
      intWallMap = createProceduralMetalTexture(intWallColor, '#a37c55', false);
      break;
    case 'metal-matte-obsidian':
      intWallColor = '#181b1f';
      intWallRoughness = 0.25;
      intWallMetalness = 0.85;
      intWallMap = createProceduralMetalTexture(intWallColor, '#2f343b', false);
      break;

    // =========================================================================
    // 4. MARBLE/ROCK ("Natural stone look, bold and impressive")
    // =========================================================================
    case 'stone-calacatta-white':
      intWallColor = '#f1f4f8';
      intWallRoughness = 0.10;
      intWallMetalness = 0.10;
      intWallClearcoat = 0.90;
      intWallMap = createProceduralMarbleTexture(intWallColor, '#5a626d', '#9aa1ab', false);
      break;
    case 'stone-grey-slate':
      intWallColor = '#8a8d91';
      intWallRoughness = 0.55;
      intWallMetalness = 0.08;
      intWallMap = createProceduralMarbleTexture(intWallColor, '#5e6166', '#adb0b5', true);
      break;
    case 'stone-nero-marquina':
      intWallColor = '#14171c';
      intWallRoughness = 0.10;
      intWallMetalness = 0.12;
      intWallClearcoat = 0.90;
      intWallMap = createProceduralMarbleTexture(intWallColor, '#edf2f7', '#cbd5e1', false);
      break;
    case 'stone-golden-sahara':
      intWallColor = '#f5edd6';
      intWallRoughness = 0.12;
      intWallMetalness = 0.10;
      intWallClearcoat = 0.80;
      intWallMap = createProceduralMarbleTexture(intWallColor, '#b8893d', '#7a5820', false);
      break;

    // =========================================================================
    // 5. MIRROR ("Reflective beauty, expand the space")
    // =========================================================================
    case 'mirror-silver-chrome':
      intWallColor = '#c8d1db';
      intWallRoughness = 0.02;
      intWallMetalness = 0.96;
      intWallClearcoat = 1.0;
      intWallMap = createProceduralMetalTexture(intWallColor, '#ffffff', false);
      break;
    case 'mirror-polished-gold':
      intWallColor = '#c9963f';
      intWallRoughness = 0.03;
      intWallMetalness = 0.95;
      intWallClearcoat = 1.0;
      intWallMap = createProceduralMetalTexture(intWallColor, '#ffe29a', false);
      break;
    case 'mirror-smoked-bronze':
      intWallColor = '#6e4c2c';
      intWallRoughness = 0.04;
      intWallMetalness = 0.92;
      intWallClearcoat = 0.95;
      intWallMap = createProceduralMetalTexture(intWallColor, '#a8784e', false);
      break;
    case 'mirror-piano-black':
      intWallColor = '#0a0b0d';
      intWallRoughness = 0.02;
      intWallMetalness = 0.90;
      intWallClearcoat = 1.0;
      intWallMap = createProceduralMetalTexture(intWallColor, '#22252b', false);
      break;

    // =========================================================================
    // 6. WATER RIPPLE ("Unique ripple effect, artistic and dynamic")
    // =========================================================================
    case 'ripple-silver-fluid':
      intWallColor = '#cfd8e3';
      intWallRoughness = 0.12;
      intWallMetalness = 0.90;
      intWallClearcoat = 0.90;
      intWallMap = createProceduralWaterRippleTexture(intWallColor, '#ffffff', '#8794a3');
      break;
    case 'ripple-titanium-grey':
      intWallColor = '#7a828c';
      intWallRoughness = 0.15;
      intWallMetalness = 0.88;
      intWallClearcoat = 0.85;
      intWallMap = createProceduralWaterRippleTexture(intWallColor, '#b0b8c2', '#424852');
      break;
    case 'ripple-amber-bronze':
      intWallColor = '#6e4e2e';
      intWallRoughness = 0.14;
      intWallMetalness = 0.90;
      intWallClearcoat = 0.85;
      intWallMap = createProceduralWaterRippleTexture(intWallColor, '#bfa075', '#3d2914');
      break;
    case 'ripple-midnight-black':
      intWallColor = '#121417';
      intWallRoughness = 0.12;
      intWallMetalness = 0.92;
      intWallClearcoat = 0.95;
      intWallMap = createProceduralWaterRippleTexture(intWallColor, '#454c57', '#050608');
      break;

    // Legacy Fallbacks
    case 'bamboo-charcoal-offwhite':
    default:
      intWallColor = '#f8fafc';
      intWallRoughness = 0.55;
      intWallMetalness = 0.05;
      intWallMap = createBambooWoodFiberWallTexture();
      break;
    case 'graphene-insulation-board':
      intWallColor = '#f1f5f9';
      intWallRoughness = 0.45;
      intWallMetalness = 0.08;
      intWallMap = createBambooGrapheneWallTexture();
      break;
    case 'nordic-oak-slat':
      intWallColor = '#d4a373';
      intWallRoughness = 0.45;
      intWallMetalness = 0.05;
      intWallMap = createProceduralPlankTexture('#c89658', '#8f5c2c');
      intWallBumpMap = intWallMap;
      break;
    case 'smoked-walnut-slat':
      intWallColor = '#3d2b1f';
      intWallRoughness = 0.40;
      intWallMetalness = 0.05;
      intWallMap = createProceduralPlankTexture('#3d2b1f', '#20160e');
      intWallBumpMap = intWallMap;
      break;
    case 'calacatta-marble-uv':
      intWallColor = '#ffffff';
      intWallRoughness = 0.12;
      intWallMetalness = 0.08;
      intWallClearcoat = 0.90;
      intWallMap = createProceduralMarbleTexture('#ffffff', '#64748b', '#94a3b8', false);
      break;
    case 'ivory-acoustic-linen':
      intWallColor = '#f3ede2';
      intWallRoughness = 0.85;
      intWallMetalness = 0.02;
      intWallMap = createProceduralFabricTexture('#f3ede2', '#faf6ee', '#d4c8b6');
      break;
    case 'industrial-slate-concrete':
      intWallColor = '#94a3b8';
      intWallRoughness = 0.70;
      intWallMetalness = 0.08;
      intWallMap = createProceduralMarbleTexture('#94a3b8', '#64748b', '#475569', true);
      break;
    case 'muted-sage-fiber':
      intWallColor = '#849688';
      intWallRoughness = 0.55;
      intWallMetalness = 0.05;
      intWallMap = createBambooWoodFiberWallTexture();
      break;
  }

  // LED and lighting colors
  const isNight = lightingMode === 'night-ambient';
  const isGolden = lightingMode === 'golden-hour';

  const ledGlowIntensity = isNight ? 3.0 : isGolden ? 1.8 : 0.8;
  const downlightIntensity = isNight ? 2.5 : isGolden ? 1.4 : 0.5;

  let ledColorHex = '#ffedd5';
  if (state.lightingPackage === 'halo-strip-ambient') {
    ledColorHex = '#f59e0b';
  } else if (state.lightingPackage === 'architectural-luxe-smart') {
    ledColorHex = isNight ? '#38bdf8' : '#fbbf24';
  }

  return {
    wallMaterial: new THREE.MeshPhysicalMaterial({
      color: wallMap ? new THREE.Color('#ffffff') : new THREE.Color(wallColor),
      map: wallMap,
      roughness: wallRoughness,
      metalness: wallMetalness,
      clearcoat: wallClearcoat,
      bumpMap: wallBumpMap,
      bumpScale: wallBumpScale,
    }),
    chassisMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#111827'), // Boxabl / Apple Cabin deep graphite frame
      roughness: 0.3,
      metalness: 0.7,
    }),
    glassMaterial: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(glassColor),
      transparent: true,
      opacity: glassOpacity,
      transmission: glassTransmission,
      roughness: glassRoughness,
      metalness: 0.1,
      ior: 1.52,
      thickness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      depthWrite: false, // Prevents depth buffer clipping with interior geometry and hollow frames
    }),
    floorMaterial: new THREE.MeshPhysicalMaterial({
      color: floorTexture ? new THREE.Color('#ffffff') : new THREE.Color(floorBaseColor),
      map: floorTexture,
      roughness: floorRoughness,
      metalness: floorMetalness,
      clearcoat: floorClearcoat,
      clearcoatRoughness: 0.04,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
    roofMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#334155'),
      roughness: 0.4,
      metalness: 0.3,
    }),
    solarMaterial: new THREE.MeshStandardMaterial({
      map: createSolarGridTexture(),
      roughness: 0.15,
      metalness: 0.85,
    }),
    ledStripMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color(ledColorHex),
      emissive: new THREE.Color(ledColorHex),
      emissiveIntensity: ledGlowIntensity,
      roughness: 0.2,
    }),
    downlightMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fffbeb'),
      emissive: new THREE.Color('#fef08a'),
      emissiveIntensity: downlightIntensity,
      roughness: 0.1,
    }),
    woodDeckMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#a16207'),
      roughness: 0.7,
      metalness: 0.05,
    }),
    interiorWallMaterial: new THREE.MeshPhysicalMaterial({
      color: intWallMap ? new THREE.Color('#ffffff') : new THREE.Color(intWallColor),
      map: intWallMap,
      roughness: intWallRoughness,
      metalness: intWallMetalness,
      clearcoat: intWallClearcoat,
      bumpMap: intWallBumpMap,
      bumpScale: intWallBumpScale,
      side: THREE.DoubleSide,
    }),
    countertopMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f1f5f9'),
      roughness: 0.2,
      metalness: 0.1,
    }),
    cabinetMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color(cabinetColor),
      roughness: cabinetRoughness,
      metalness: cabinetMetalness,
    }),
    cabinetWoodNicheMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#92400e'),
      roughness: 0.6,
      metalness: 0.05,
    }),
    brassHandleMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e2b36e'),
      roughness: 0.25,
      metalness: 0.85,
    }),
    applianceGlassMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0f172a'),
      roughness: 0.1,
      metalness: 0.8,
    }),
    backsplashMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f8fafc'),
      roughness: 0.15,
      metalness: 0.05,
    }),
    metalTrimMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e2e8f0'),
      roughness: 0.25,
      metalness: 0.8,
    }),
    furnitureFabricMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#64748b'),
      roughness: 0.8,
      metalness: 0.05,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    rugMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ded9d0'), // luxury warm heathered oatmeal wool
      roughness: 0.96,
      metalness: 0.01,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    }),
    bedLinenMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f8fafc'),
      roughness: 0.82,
      metalness: 0.02,
    }),
    bedDuvetMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#94a3b8'),
      roughness: 0.75,
      metalness: 0.03,
    }),
    bedAccentThrowMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#78350f'),
      roughness: 0.88,
      metalness: 0.02,
    }),
    nightstandWoodMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#451a03'),
      roughness: 0.55,
      metalness: 0.05,
    }),
    lampGlowMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fffbeb'),
      emissive: new THREE.Color('#fef08a'),
      emissiveIntensity: 0.75,
      roughness: 0.2,
    }),
    sofaBoucleMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e2ded8'),
      roughness: 0.86,
      metalness: 0.02,
    }),
    sofaWoodFrameMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3e2723'),
      roughness: 0.45,
      metalness: 0.05,
    }),
    sofaLegMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1e293b'),
      roughness: 0.35,
      metalness: 0.85,
    }),
    sofaCushionAccent1: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#9a3412'),
      roughness: 0.55,
      metalness: 0.08,
    }),
    sofaCushionAccent2: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3f4f3e'),
      roughness: 0.78,
      metalness: 0.03,
    }),
    sofaThrowBlanketMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#475569'),
      roughness: 0.92,
      metalness: 0.02,
    }),
    travertineTableMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f5f0eb'),
      roughness: 0.65,
      metalness: 0.04,
    }),
    ceramicVesselMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#c2410c'),
      roughness: 0.88,
      metalness: 0.02,
    }),
    candleGlowMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d97706'),
      emissive: new THREE.Color('#f59e0b'),
      emissiveIntensity: 0.6,
      roughness: 0.15,
      metalness: 0.1,
    }),
    solarFrameMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#18181b'),
      roughness: 0.32,
      metalness: 0.88,
    }),
    solarRailMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#475569'),
      roughness: 0.38,
      metalness: 0.82,
    }),
    solarClampMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0f172a'),
      roughness: 0.25,
      metalness: 0.95,
    }),
    solarMicroinverterMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#334155'),
      roughness: 0.45,
      metalness: 0.70,
    }),
    solarConduitMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#09090b'),
      roughness: 0.55,
      metalness: 0.25,
    }),
    solarStatusLedMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#22c55e'),
      emissive: new THREE.Color('#22c55e'),
      emissiveIntensity: 2.5,
      roughness: 0.1,
    }),
    solarDecalMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#eab308'),
      roughness: 0.5,
      metalness: 0.1,
    }),
    telescopeBodyMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0f172a'),
      roughness: 0.22,
      metalness: 0.85,
    }),
    stairTreadMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1e293b'),
      roughness: 0.45,
      metalness: 0.60,
    }),
    terraceLightMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fef08a'),
      emissive: new THREE.Color('#f59e0b'),
      emissiveIntensity: 2.2,
      roughness: 0.1,
    }),
    terraceFabricMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#475569'),
      roughness: 0.85,
      metalness: 0.05,
    }),
    terraceTableMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d1d5db'),
      roughness: 0.5,
      metalness: 0.2,
    }),
    capsuleGlowMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#00e5ff'),
      emissive: new THREE.Color('#00e5ff'),
      emissiveIntensity: isNight ? 3.5 : isGolden ? 2.5 : 1.6,
      roughness: 0.1,
    }),
    isoCornerCastingMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1f2937'),
      roughness: 0.35,
      metalness: 0.85,
    }),
    corrugatedPanelMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color(wallColor),
      roughness: 0.4,
      metalness: 0.3,
    }),
    q235SteelMaterial: new THREE.MeshStandardMaterial({
      map: createGalvanizedSteelTexture(),
      color: new THREE.Color('#94a3b8'),
      roughness: 0.35,
      metalness: 0.85,
    }),
    whiteDoorFrameMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f8fafc'),
      roughness: 0.35,
      metalness: 0.25,
    }),
    darkDoorFrameMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2b303a'),
      roughness: 0.4,
      metalness: 0.6,
    }),
    windowFrameMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color(
        state.glazing === 'aluminum-alloy-double-door' || state.glazing === 'broken-bridge-grille-door'
          ? '#f8fafc'
          : '#1a1f26' // Deep architectural broken-bridge charcoal slate
      ),
      roughness: 0.32,
      metalness: 0.75,
    }),
    windowGasketMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0a0c0e'), // EPDM black weatherstrip gasket
      roughness: 0.92,
      metalness: 0.05,
    }),
    windowSillMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#242932'), // Extruded aluminum drip-edge sub-sill
      roughness: 0.28,
      metalness: 0.80,
    }),
    windowSpacerMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#374151'), // Warm-edge dual-seal spacer bar
      roughness: 0.25,
      metalness: 0.85,
    }),
    windowHardwareMaterial: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e2e8f0'), // 304 brushed architectural stainless steel
      roughness: 0.16,
      metalness: 0.95,
    }),
    bambooPlywoodMaterial: new THREE.MeshStandardMaterial({
      map: createBambooPlywoodTexture(),
      color: new THREE.Color('#d4a373'),
      roughness: 0.45,
      metalness: 0.05,
    }),
    mgoBoardMaterial: new THREE.MeshStandardMaterial({
      map: createMgoPvcTexture(),
      color: new THREE.Color('#cbd5e1'),
      roughness: 0.50,
      metalness: 0.05,
    }),
    bambooCharcoalWallMaterial: new THREE.MeshPhysicalMaterial({
      map: intWallMap,
      color: intWallMap ? new THREE.Color('#ffffff') : new THREE.Color(intWallColor),
      roughness: intWallRoughness,
      metalness: intWallMetalness,
      clearcoat: intWallClearcoat,
      bumpMap: intWallBumpMap,
      bumpScale: intWallBumpScale,
      side: THREE.DoubleSide,
    }),
    bambooGrapheneWallMaterial: new THREE.MeshStandardMaterial({
      map: createBambooGrapheneWallTexture(),
      color: new THREE.Color('#f8fafc'),
      roughness: 0.50,
      metalness: 0.05,
    }),
    compositeWoodFloorMaterial: new THREE.MeshStandardMaterial({
      map: createCompositeWoodTexture(),
      color: new THREE.Color('#b48256'),
      roughness: 0.40,
      metalness: 0.05,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
    woodgrainSteelMaterial: new THREE.MeshStandardMaterial({
      map: createProceduralPlankTexture('#854d0e', '#593006'),
      color: new THREE.Color('#a16207'),
      roughness: 0.45,
      metalness: 0.20,
    }),
  };
}
