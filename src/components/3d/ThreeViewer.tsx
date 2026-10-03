import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CustomizationState, LightingMode, ViewPerspective } from '../../types';
import { BASE_MODELS } from '../../data/models';
import { FLOORING_OPTIONS } from '../../data/options';
import { createMaterialLibrary, MaterialLibrary } from './materials';
import { buildHomeModel, BuiltHomeModel } from './modelBuilder';
import {
  Sun,
  Sunset,
  Moon,
  Eye,
  Layers,
  RotateCw,
  Compass,
  Maximize2,
  Minimize2,
  ZoomIn,
  Sparkles,
  Check,
  Home,
  Box,
  X,
} from 'lucide-react';

interface ThreeViewerProps {
  state: CustomizationState;
  onStateChange?: (updater: (prev: CustomizationState) => CustomizationState) => void;
  lightingMode: LightingMode;
  onLightingModeChange: (mode: LightingMode) => void;
  onSelectCategory: (categoryId: string) => void;
  roofLiftPercent: number;
  onRoofLiftChange: (val: number) => void;
  roofRemoved?: boolean;
  onRoofRemovedToggle?: () => void;
  cutawayMode: boolean;
  onCutawayModeToggle: () => void;
  currentPerspective: ViewPerspective;
  onPerspectiveChange: (p: ViewPerspective) => void;
  config?: any;
}

export const ThreeViewer: React.FC<ThreeViewerProps> = ({
  state,
  onStateChange,
  lightingMode,
  onLightingModeChange,
  onSelectCategory,
  roofLiftPercent,
  onRoofLiftChange,
  roofRemoved,
  onRoofRemovedToggle,
  cutawayMode,
  onCutawayModeToggle,
  currentPerspective,
  onPerspectiveChange,
  config,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [localRoofRemoved, setLocalRoofRemoved] = useState(false);
  const isRoofRemoved = roofRemoved !== undefined ? roofRemoved : localRoofRemoved;

  const handleToggleRoof = () => {
    if (onRoofRemovedToggle) {
      onRoofRemovedToggle();
    } else {
      setLocalRoofRemoved((prev) => !prev);
    }
  };

  const [autoRotate, setAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [viewerFlooringSubFilter, setViewerFlooringSubFilter] = useState<string>('all');
  const [isFlooringOverlayOpen, setIsFlooringOverlayOpen] = useState(true);

  const flooringList = config?.flooringOptions?.length ? config.flooringOptions : FLOORING_OPTIONS;
  const activeFloorOpt = flooringList.find((f: any) => f.id === state.flooring) || flooringList[0];
  const activeFlooringList = flooringList.filter((f: any) => {
    if (viewerFlooringSubFilter === 'all') return true;
    return f.category === viewerFlooringSubFilter;
  });

  // References to Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const homeModelRef = useRef<BuiltHomeModel | null>(null);
  const materialsRef = useRef<MaterialLibrary | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Target camera positions for smooth interpolation
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(8, 5, 8));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.2, 0));
  const isTransitioningRef = useRef<boolean>(false);

  // Update target camera based on perspective
  useEffect(() => {
    isTransitioningRef.current = true;
    let length = 5.8;
    let depth = 2.4;
    let height = 2.5;

    const modelSpec = config?.models?.find((m: any) => m.id === state.modelId) || BASE_MODELS.find((m) => m.id === state.modelId);
    if (modelSpec?.dimensions?.lengthFt) {
      length = modelSpec.dimensions.lengthFt * 0.3048;
      depth = modelSpec.dimensions.widthFt * 0.3048;
      height = modelSpec.dimensions.heightFt * 0.3048;
    }
    const maxDim = Math.max(length, depth);
    const dist = Math.max(9.5, maxDim * 1.35);

    if (state.modelId === 'studio' && currentPerspective === 'living-lounge') {
      onPerspectiveChange('bedroom-suite');
      return;
    }

    switch (currentPerspective) {
      case 'front-3-4':
      case 'exterior-iso':
        targetCamPosRef.current.set(dist * 0.75, dist * 0.52, dist * 0.85);
        targetLookAtRef.current.set(0, height * 0.45, 0);
        break;
      case 'rear-3-4':
      case 'back-patio':
        targetCamPosRef.current.set(-dist * 0.72, dist * 0.48, -dist * 0.85);
        targetLookAtRef.current.set(0, height * 0.45, 0);
        break;
      case 'side-elevation':
        targetCamPosRef.current.set(dist * 1.05, height * 0.5, 0);
        targetLookAtRef.current.set(0, height * 0.5, 0);
        break;
      case 'top-down-floorplan':
        targetCamPosRef.current.set(0.1, dist * 1.25, 0.1);
        targetLookAtRef.current.set(0, 0, 0);
        break;
      case 'floor-inspection': {
        const isExp = state.modelId.includes('expandable');
        const expD = state.modelId.includes('20ft') ? 6.4 : (state.modelId.includes('30ft') ? 9.0 : 11.8);
        const expW = state.modelId.includes('20ft') ? 5.9 : 6.4;
        const distVal = Math.max(expW, expD);
        targetCamPosRef.current.set(expW * 0.72, distVal * 0.76, expD * 0.70);
        targetLookAtRef.current.set(0, 0.15, 0);
        break;
      }
      case 'interior-walkthrough': {
        const isExp = state.modelId.includes('expandable');
        const expD = state.modelId.includes('20ft') ? 6.4 : (state.modelId.includes('30ft') ? 9.0 : 11.8);
        targetCamPosRef.current.set(
          isExp ? 0.0 : (state.modelId === 'studio' ? 0.6 : (state.modelId === 'one-bedroom' ? 0.8 : 1.1)),
          1.42,
          isExp ? expD / 2 - 0.6 : Math.min(1.8, depth * 0.35)
        );
        targetLookAtRef.current.set(
          isExp ? -0.2 : (state.modelId === 'studio' ? -0.5 : (state.modelId === 'one-bedroom' ? -1.3 : -1.8)),
          1.05,
          isExp ? 0.2 : -depth * 0.25
        );
        break;
      }
      case 'sectional-cutaway':
        targetCamPosRef.current.set(dist * 0.45, dist * 0.65, dist * 0.75);
        targetLookAtRef.current.set(0, 0.8, 0);
        break;
      case 'front-elevation': {
        const isExp = state.modelId.includes('expandable');
        const expD = state.modelId.includes('20ft') ? 6.4 : (state.modelId.includes('30ft') ? 9.0 : 11.8);
        const frontZVal = isExp ? expD / 2 : depth / 2;
        // Eye-level close-up perspective framing the entrance door and wing windows in crisp detail
        targetCamPosRef.current.set(0, 1.45, frontZVal + 4.6);
        targetLookAtRef.current.set(0, 1.35, frontZVal);
        break;
      }
      case 'bedroom-suite': {
        const isCapsule = state.modelId.startsWith('space-capsule');
        const isExp = state.modelId.includes('expandable');
        const isDuplex = state.modelId === 'apple-cabin-ad01' || state.modelId === 'apple-cabin-ad03';
        const expW = state.modelId.includes('20ft') ? 5.9 : 6.4;
        const expD = state.modelId.includes('20ft') ? 6.4 : (state.modelId.includes('30ft') ? 9.0 : 11.8);
        const targetBedX = isDuplex ? 1.0 : (isCapsule ? length / 2 - 1.45 : (isExp ? (2.2 / 2 + (expW - 2.2) / 4) : length / 2 - 1.5));
        const targetBedZ = isDuplex ? 0 : (isCapsule ? 0 : (isExp ? -expD / 2 + 1.1 : (depth > 4 ? 0.4 : -depth / 4)));
        const targetBedY = isDuplex ? 2.48 + 0.5 : 0.85;
        targetCamPosRef.current.set(
          isExp ? targetBedX - 1.0 : targetBedX - (isCapsule ? 1.6 : 1.8),
          isDuplex ? 2.48 + 1.2 : 1.45,
          isExp ? targetBedZ + 1.5 : targetBedZ + 1.2
        );
        targetLookAtRef.current.set(
          targetBedX,
          targetBedY,
          targetBedZ
        );
        break;
      }
      case 'living-lounge': {
        const isExp = state.modelId.includes('expandable');
        const is40 = state.modelId.includes('40ft');
        const expD = state.modelId.includes('20ft') ? 6.4 : (state.modelId.includes('30ft') ? 9.0 : 11.8);
        targetCamPosRef.current.set(
          isExp ? 0.35 : 1.6,
          1.40,
          isExp ? (is40 ? 4.9 : (expD > 7 ? 3.6 : 2.8)) : Math.min(2.0, depth * 0.45)
        );
        targetLookAtRef.current.set(
          isExp ? -0.1 : 0,
          0.70,
          isExp ? (is40 ? 3.45 : (expD > 7 ? 2.3 : 1.9)) : 0.35
        );
        break;
      }
      case 'rooftop-observatory':
      case 'rooftop-terrace': {
        const deckElev = state.modelId === 'apple-cabin-ac03' ? 2.48 : height;
        targetCamPosRef.current.set(
          -length * 0.42,
          deckElev + 1.8,
          depth * 0.65 + 1.8
        );
        targetLookAtRef.current.set(
          0.05,
          deckElev + 0.45,
          0.0
        );
        break;
      }
    }
  }, [currentPerspective, state.modelId]);

  // Handle Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Background color based on lighting mode
    scene.background = new THREE.Color('#f8fafc');

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(8, 5, 8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      logarithmicDepthBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 0.5; // Reduced from 3.5 to allow interior views
    controls.maxDistance = 25;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent going beneath the floor
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // Global Daylight Illumination
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0xf1f5f9, 0.9);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    dirLight.position.set(12, 18, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 40;
    const d = 12;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0003;
    dirLight.shadow.radius = 2.5;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Subtle soft fill light
    const fillLight = new THREE.DirectionalLight(0xbfdbfe, 0.8);
    fillLight.position.set(-10, 12, -8);
    scene.add(fillLight);

    // Architectural Ground Grid & Shadow Receiver
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.95,
      metalness: 0.05,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.041;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Elegant architectural boundary grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x94a3b8, 0xe2e8f0);
    gridHelper.position.y = 0.002;
    scene.add(gridHelper);

    // Concrete patio podium under cabin
    const podiumGeo = new THREE.BoxGeometry(16, 0.04, 12);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      roughness: 0.85,
    });
    const podium = new THREE.Mesh(podiumGeo, podiumMat);
    podium.position.set(0, -0.02, 0.8);
    podium.receiveShadow = true;
    scene.add(podium);

    // Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth camera interpolation towards target perspective
      if (isTransitioningRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.06);
        controls.target.lerp(targetLookAtRef.current, 0.06);
        
        if (
          camera.position.distanceTo(targetCamPosRef.current) < 0.05 &&
          controls.target.distanceTo(targetLookAtRef.current) < 0.05
        ) {
          isTransitioningRef.current = false;
        }
      }

      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 1.0;
      controls.update();

      renderer.render(scene, camera);
    };
    animate();

    // Resize observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const handlePointerDown = () => {
      isTransitioningRef.current = false;
    };
    canvas.addEventListener('pointerdown', handlePointerDown);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Update Environment Lighting when lightingMode changes
  useEffect(() => {
    const scene = sceneRef.current;
    const dirLight = dirLightRef.current;
    const hemiLight = hemiLightRef.current;
    if (!scene || !dirLight || !hemiLight) return;

    if (lightingMode === 'daylight') {
      scene.background = new THREE.Color('#f8fafc');
      hemiLight.color.setHex(0xe0f2fe);
      hemiLight.groundColor.setHex(0xf1f5f9);
      hemiLight.intensity = 0.95;

      dirLight.color.setHex(0xfffbeb);
      dirLight.intensity = 2.2;
      dirLight.position.set(12, 18, 10);
    } else if (lightingMode === 'golden-hour') {
      scene.background = new THREE.Color('#fef3c7');
      hemiLight.color.setHex(0xfde68a);
      hemiLight.groundColor.setHex(0xfef08a);
      hemiLight.intensity = 0.8;

      dirLight.color.setHex(0xf97316);
      dirLight.intensity = 2.8;
      dirLight.position.set(18, 7, 12);
    } else if (lightingMode === 'night-ambient') {
      scene.background = new THREE.Color('#0b1120');
      hemiLight.color.setHex(0x1e293b);
      hemiLight.groundColor.setHex(0x0f172a);
      hemiLight.intensity = 0.35;

      dirLight.color.setHex(0x38bdf8);
      dirLight.intensity = 0.5;
      dirLight.position.set(6, 12, 8);
    }
  }, [lightingMode]);

  // Rebuild 3D model whenever state or lighting changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing model if any
    if (homeModelRef.current) {
      scene.remove(homeModelRef.current.rootGroup);
    }

    const activeOptions = config ? {
      wallOpt: config.wallOptions.find((o: any) => o.id === state.wallCladding) || config.wallOptions[0],
      interiorWallOpt: (config.interiorWallOptions || []).find((o: any) => o.id === state.interiorWall) ||
        (config.interiorWallOptions || [])[0],
      glassOpt: config.glazingOptions.find((o: any) => o.id === state.glazing) || config.glazingOptions[0],
      lightOpt: config.lightingOptions.find((o: any) => o.id === state.lightingPackage) || config.lightingOptions[0],
      floorOpt: config.flooringOptions.find((o: any) => o.id === state.flooring) || config.flooringOptions[0],
      cabOpt: config.cabinetryOptions.find((o: any) => o.id === state.cabinetry) || config.cabinetryOptions[0],
    } : null;

    const materials = createMaterialLibrary(state, lightingMode, activeOptions);
    materialsRef.current = materials;

    const currentModelSpec =
      config?.models?.find((m: any) => m.id === state.modelId) ||
      BASE_MODELS.find((m) => m.id === state.modelId) ||
      BASE_MODELS[0];

    const homeModel = buildHomeModel(state, materials, lightingMode, currentModelSpec);
    homeModelRef.current = homeModel;
    scene.add(homeModel.rootGroup);
  }, [state, lightingMode, config]);

  // Update dynamic transforms: Roof Lift & Cutaway Mode & Roof Visibility
  useEffect(() => {
    if (!homeModelRef.current) return;
    const { roofGroup, frontWallGroup } = homeModelRef.current;

    // Totally remove roof or put it back
    if (isRoofRemoved) {
      roofGroup.visible = false;
    } else {
      roofGroup.visible = true;
      // Roof lift height: 0 to 2.5 meters
      const liftY = (roofLiftPercent / 100) * 2.5;
      roofGroup.position.y = liftY;
    }

    // Cutaway mode lowers front wall or makes it semi-transparent
    if (cutawayMode) {
      frontWallGroup.position.y = -2.2;
      frontWallGroup.visible = false;
    } else {
      frontWallGroup.position.y = 0;
      frontWallGroup.visible = true;
    }
  }, [roofLiftPercent, cutawayMode, isRoofRemoved]);

  const currentModel =
    config?.models?.find((m: any) => m.id === state.modelId) ||
    BASE_MODELS.find((m) => m.id === state.modelId) ||
    BASE_MODELS[0];

  const isPubliclyAvailable =
    currentModel.isAvailable !== false && currentModel.isActive !== false;

  const handleZoom = (delta: number) => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    if (delta > 0) {
      controls.dollyIn(1.2);
    } else {
      controls.dollyOut(1.2);
    }
    controls.update();
  };

  return (
    <div
      ref={containerRef}
      id="three-viewer-container"
      className="relative w-full h-full min-h-[380px] sm:min-h-[440px] bg-gradient-to-br from-blue-50/40 via-white to-gray-50/80 flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 w-full h-full block cursor-grab active:cursor-grabbing outline-none touch-none transition-all duration-500 will-change-transform drop-shadow-[0_25px_60px_rgba(0,0,0,0.18)] select-none filter contrast-[1.03] brightness-[1.02]"
      />

      {/* Bento Floating Top Action Layer */}
      <div className="absolute top-4 sm:top-5 left-4 sm:left-5 right-4 sm:right-5 flex items-start justify-between pointer-events-none gap-2 z-10">
        {/* Real-time Render Active Badge */}
        <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-3.5 sm:px-4 py-2 rounded-full border border-gray-200/90 flex items-center gap-2 shadow-sm ring-1 ring-black/5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
            Live 3D Viewport
          </span>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <span className="text-[10px] font-bold text-gray-900 hidden sm:inline">
            {currentModel.name}
          </span>
          {isPubliclyAvailable && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[9px] font-extrabold text-emerald-700 border border-emerald-200 hidden md:inline-flex items-center gap-1">
              <Check className="w-2.5 h-2.5" />
              Publicly Available
            </span>
          )}
        </div>

        {/* Bento Top-Right Action Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Lighting Mode Selector */}
          <div className="bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-gray-200 flex items-center gap-1 shadow-sm">
            <button
              onClick={() => onLightingModeChange('daylight')}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                lightingMode === 'daylight'
                  ? 'bg-orange-50 text-orange-600 shadow-xs font-bold'
                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Daylight (5500K)"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => onLightingModeChange('golden-hour')}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                lightingMode === 'golden-hour'
                  ? 'bg-orange-50 text-orange-600 shadow-xs font-bold'
                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Golden Hour Sunset"
            >
              <Sunset className="w-4 h-4" />
            </button>
            <button
              onClick={() => onLightingModeChange('night-ambient')}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                lightingMode === 'night-ambient'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Night LED Glow"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Camera Manipulation Bento Buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-gray-200 shadow-sm">
            <button
              onClick={() => handleZoom(1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors font-bold text-base cursor-pointer"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => handleZoom(-1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors font-bold text-base cursor-pointer"
              title="Zoom Out"
            >
              -
            </button>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                autoRotate
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title={autoRotate ? 'Stop Rotation' : 'Auto 360° Rotate'}
            >
              <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D Viewer'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Interactive 3D Hotspot Tags */}
      {showHotspots && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <div className="absolute bottom-20 left-5 pointer-events-auto flex flex-wrap gap-1.5 max-w-sm">
            <button
              onClick={() => {
                onSelectCategory('Wall Panels');
                onPerspectiveChange('exterior-iso');
                if (cutawayMode) onCutawayModeToggle();
              }}
              className="px-3 py-1 bg-white/90 hover:bg-white border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
              Exterior Walls
            </button>
            <button
              onClick={() => {
                onSelectCategory('Wall Panels');
                onPerspectiveChange('interior-walkthrough');
                if (!cutawayMode) onCutawayModeToggle();
                if (roofLiftPercent < 30) onRoofLiftChange(50);
              }}
              className="px-3 py-1 bg-white/90 hover:bg-white border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Interior Walls
            </button>
            <button
              onClick={() => onSelectCategory('Glazing & Windows')}
              className="px-3 py-1 bg-white/90 hover:bg-white border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Glazing
            </button>
            <button
              onClick={() => onSelectCategory('Lighting System')}
              className="px-3 py-1 bg-white/90 hover:bg-white border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Lighting
            </button>
            <button
              onClick={() => {
                onSelectCategory('Roof & Energy');
                if (cutawayMode) onCutawayModeToggle();
                if (roofLiftPercent > 0) onRoofLiftChange(0);
                onPerspectiveChange('rooftop-observatory');
              }}
              className="px-3 py-1 bg-white/90 hover:bg-white border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Roof & Observatory
            </button>
            <button
              onClick={() => {
                onSelectCategory('Cabinetry');
                if (!cutawayMode) onCutawayModeToggle();
                onPerspectiveChange('interior-walkthrough');
              }}
              className="px-3 py-1 bg-white/90 hover:bg-white border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              Cabinetry
            </button>
            <button
              onClick={() => onSelectCategory('Interior Modules')}
              className="px-3 py-1 bg-white/90 hover:bg-white border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Pods & Modules
            </button>
            <button
              onClick={() => {
                onSelectCategory('Interior Modules');
                if (!cutawayMode) onCutawayModeToggle();
                onPerspectiveChange('bedroom-suite');
              }}
              className="px-3 py-1 bg-white/90 hover:bg-white border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Bed Suite
            </button>
            <button
              onClick={() => {
                onSelectCategory('Flooring');
                onPerspectiveChange('floor-inspection');
                if (roofLiftPercent < 30) onRoofLiftChange(75);
                setIsFlooringOverlayOpen(true);
              }}
              className="px-3 py-1 bg-white/90 hover:bg-white border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              Flooring ({flooringList.length})
            </button>
            {state.modelId !== 'studio' && (
              <button
                onClick={() => {
                  onSelectCategory('Interior Modules');
                  if (!cutawayMode) onCutawayModeToggle();
                  onPerspectiveChange('living-lounge');
                }}
                className="px-3 py-1 bg-white/90 hover:bg-white border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Living Lounge
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Floor Selector & Expandable Size Matrix Bar */}
      {isFlooringOverlayOpen ? (
        <div className="absolute bottom-16 sm:bottom-18 left-3 sm:left-5 right-3 sm:right-auto z-20 pointer-events-auto max-w-xl bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl shadow-xl p-3 sm:p-3.5 space-y-2 ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header with Active Floor Info & View Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-5 h-5 rounded-md border border-black/20 shadow-2xs shrink-0"
                style={{ backgroundColor: activeFloorOpt?.color || '#d6c4a8' }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-gray-950 truncate">
                    {activeFloorOpt?.name || 'Flooring Finish'}
                  </span>
                  <span className="text-[9px] font-bold text-orange-800 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 shrink-0">
                    {activeFloorOpt?.category || 'Catalog Finish'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono truncate block">
                  {activeFloorOpt?.specDetail || 'Rigid core acoustic SPC'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onPerspectiveChange('floor-inspection');
                  if (roofLiftPercent < 30) onRoofLiftChange(75);
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer ${
                  currentPerspective === 'floor-inspection'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200'
                }`}
                title="Elevated 45° perspective to inspect flooring textures"
              >
                👁️ Floor Angle
              </button>
              <button
                type="button"
                onClick={() => {
                  onPerspectiveChange('top-down-floorplan');
                  if (!isRoofRemoved) {
                    if (onRoofRemovedToggle) onRoofRemovedToggle();
                    else setLocalRoofRemoved(true);
                  }
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer ${
                  currentPerspective === 'top-down-floorplan'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                title="Top-down aerial view of entire floor plan"
              >
                📐 Plan
              </button>
              <button
                type="button"
                onClick={() => setIsFlooringOverlayOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Minimize Flooring Switcher"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Double-Wing Expandable House Size Row: 20FT, 30FT, 40FT */}
          <div className="flex items-center gap-1.5 bg-gray-100/90 p-1 rounded-xl">
            <span className="text-[9px] font-extrabold text-gray-500 uppercase px-1.5 shrink-0 hidden sm:inline">
              Expandable Size:
            </span>
            {[
              { id: 'expandable-20ft', label: '20FT (38 m²)', desc: '409 sq ft' },
              { id: 'expandable-30ft', label: '30FT (58 m²)', desc: '624 sq ft' },
              { id: 'expandable-40ft', label: '40FT (75 m²)', desc: '807 sq ft' },
            ].map((sz) => {
              const isCurrent = state.modelId === sz.id;
              return (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => {
                    if (onStateChange) {
                      onStateChange((prev) => ({ ...prev, modelId: sz.id as any }));
                    }
                  }}
                  className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer truncate ${
                    isCurrent
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white/80'
                  }`}
                  title={`Switch to ${sz.label} double-wing expandable house`}
                >
                  <span>{sz.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-Collection Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {[
              { id: 'all', label: 'All 24' },
              { id: 'Wood Grain', label: 'Wood Grain' },
              { id: 'Fabric', label: 'Fabric' },
              { id: 'Metal', label: 'Metal' },
              { id: 'Marble/Rock', label: 'Marble/Rock' },
              { id: 'Mirror', label: 'Mirror' },
              { id: 'Water Ripple', label: 'Water Ripple' },
            ].map((col) => {
              const isSelected = viewerFlooringSubFilter === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setViewerFlooringSubFilter(col.id)}
                  className={`px-2 py-0.5 rounded-md text-[9px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-black text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {col.label}
                </button>
              );
            })}
          </div>

          {/* Horizontal Swatches Carousel: 1-Click Select */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-gray-200">
            {activeFlooringList.map((f: any) => {
              const isSel = state.flooring === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    if (onStateChange) {
                      onStateChange((prev) => ({ ...prev, flooring: f.id }));
                    }
                  }}
                  title={`${f.name} · ${f.category} (${f.specDetail || ''})`}
                  className={`relative shrink-0 w-8 h-8 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                    isSel
                      ? 'border-orange-600 ring-2 ring-orange-500/50 shadow-xs scale-105'
                      : 'border-black/15 hover:border-black/30 hover:scale-105'
                  }`}
                  style={{ backgroundColor: f.color || '#ccc' }}
                >
                  {isSel && (
                    <span className="w-3.5 h-3.5 rounded-full bg-white/95 text-orange-600 text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsFlooringOverlayOpen(true)}
          className="absolute bottom-16 sm:bottom-18 left-3 sm:left-5 z-20 pointer-events-auto px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-md flex items-center gap-2 hover:bg-orange-50/70 transition-all cursor-pointer text-xs font-bold text-gray-800 ring-1 ring-black/5"
          title="Open Flooring Switcher"
        >
          <span
            className="w-3.5 h-3.5 rounded-md border border-black/20"
            style={{ backgroundColor: activeFloorOpt?.color || '#d6c4a8' }}
          />
          <span className="text-[11px] font-black text-gray-900">
            Flooring: {activeFloorOpt?.name.split(' ')[0] || 'Selected'}
          </span>
          <span className="text-[9px] text-orange-700 font-extrabold uppercase bg-orange-100 px-1.5 py-0.5 rounded">
            Choose Finish
          </span>
        </button>
      )}

      {/* Bento Bottom Telemetry & Controls Bar */}
      <div className="relative z-10 bg-white/85 backdrop-blur-md border-t border-gray-200/80 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Selected House Identification & Architectural Telemetry */}
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
          {/* Active House Card synchronized with Left Side Panel */}
          <button
            type="button"
            onClick={() => onSelectCategory('Base House')}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-orange-50/80 border border-orange-200/90 text-left hover:bg-orange-100/70 transition-all cursor-pointer group shadow-2xs"
            title="Click to view or change Base House in the left panel"
          >
            <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Home className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-gray-950 truncate max-w-[150px] sm:max-w-[210px]">
                  {currentModel.name}
                </span>
                <span className="text-[9px] font-mono font-black uppercase text-orange-800 bg-white px-1.5 py-0.2 rounded border border-orange-200/80">
                  {currentModel.series ? currentModel.series.toUpperCase() : 'PREFAB'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600 font-medium">
                <span className="font-bold text-gray-900">{currentModel.sqft} sq ft</span>
                <span className="text-gray-300">•</span>
                <span>{currentModel.bedrooms} Bed · {currentModel.bathrooms} Bath</span>
                {currentModel.dimensions?.lengthFt && (
                  <>
                    <span className="text-gray-300 hidden md:inline">•</span>
                    <span className="hidden md:inline font-mono text-gray-500">{currentModel.dimensions.lengthFt}ft × {currentModel.dimensions.widthFt}ft</span>
                  </>
                )}
              </div>
            </div>
          </button>

          {/* Orientation Telemetry */}
          <div className="text-left hidden md:block">
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
              Orientation
            </p>
            <p className="text-xs font-semibold text-gray-900">
              {currentPerspective === 'front-elevation'
                ? 'Front Facade'
                : currentPerspective === 'top-down-floorplan'
                ? 'Top Plan'
                : currentPerspective === 'floor-inspection'
                ? 'Floor Inspection'
                : currentPerspective === 'rooftop-observatory' || currentPerspective === 'rooftop-terrace'
                ? 'Rooftop Observatory'
                : currentPerspective === 'interior-walkthrough'
                ? 'Kitchen Suite'
                : currentPerspective === 'bedroom-suite'
                ? 'Master Bedroom'
                : currentPerspective === 'living-lounge'
                ? 'Living Lounge'
                : 'South-Facing'}
            </p>
          </div>

          {/* Daylight Factor */}
          <div className="text-left hidden lg:block">
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
              Daylight
            </p>
            <p className="text-xs font-semibold text-gray-900">
              {lightingMode === 'night-ambient'
                ? '18% (Night)'
                : lightingMode === 'golden-hour'
                ? '64% (Sunset)'
                : '92% (High)'}
            </p>
          </div>
        </div>

        {/* Camera Perspectives & Cutaway Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Architectural Perspectives Tabs (Views 1 to 6 per Catalog) */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 overflow-x-auto max-w-full scrollbar-none">
            <button
              onClick={() => onPerspectiveChange('front-elevation')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                currentPerspective === 'front-elevation'
                  ? 'bg-black text-white shadow-xs font-bold'
                  : 'hover:text-gray-900 hover:bg-gray-200/60'
              }`}
              title="Doors & Windows front elevation view"
            >
              🚪 Front Facade
            </button>
            <button
              onClick={() => onPerspectiveChange('front-3-4')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                currentPerspective === 'front-3-4' || currentPerspective === 'exterior-iso'
                  ? 'bg-black text-white shadow-xs'
                  : 'hover:text-gray-900 hover:bg-gray-200/60'
              }`}
              title="View 1: Front three-quarter exterior view"
            >
              V1 Front 3/4
            </button>
            <button
              onClick={() => onPerspectiveChange('rear-3-4')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentPerspective === 'rear-3-4' || currentPerspective === 'back-patio'
                  ? 'bg-black text-white shadow-xs'
                  : 'hover:text-gray-900 hover:bg-gray-200/60'
              }`}
              title="View 2: Rear three-quarter exterior view"
            >
              V2 Rear 3/4
            </button>
            <button
              onClick={() => onPerspectiveChange('side-elevation')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentPerspective === 'side-elevation'
                  ? 'bg-black text-white shadow-xs'
                  : 'hover:text-gray-900 hover:bg-gray-200/60'
              }`}
              title="View 3: Side elevation"
            >
              V3 Side
            </button>
            <button
              onClick={() => {
                onPerspectiveChange('top-down-floorplan');
                if (!isRoofRemoved) {
                  if (onRoofRemovedToggle) onRoofRemovedToggle();
                  else setLocalRoofRemoved(true);
                }
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentPerspective === 'top-down-floorplan'
                  ? 'bg-black text-white shadow-xs'
                  : 'hover:text-gray-900 hover:bg-gray-200/60'
              }`}
              title="View 4: Top or aerial floor plan view"
            >
              V4 Aerial Plan
            </button>
            <button
              onClick={() => {
                onPerspectiveChange('floor-inspection');
                if (roofLiftPercent < 30) onRoofLiftChange(75);
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                currentPerspective === 'floor-inspection'
                  ? 'bg-orange-600 text-white shadow-xs font-bold'
                  : 'hover:text-gray-900 hover:bg-gray-200/60'
              }`}
              title="Inspect Floor: 45° elevated isometric perspective"
            >
              🪵 Floor View
            </button>
            <button
              onClick={() => {
                onPerspectiveChange('interior-walkthrough');
                if (!cutawayMode) onCutawayModeToggle();
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentPerspective === 'interior-walkthrough'
                  ? 'bg-black text-white shadow-xs'
                  : 'hover:text-gray-900 hover:bg-gray-200/60'
              }`}
              title="View 5: Interior perspective"
            >
              V5 Interior
            </button>
            <button
              onClick={() => {
                onPerspectiveChange('sectional-cutaway');
                if (!cutawayMode) onCutawayModeToggle();
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentPerspective === 'sectional-cutaway'
                  ? 'bg-black text-white shadow-xs'
                  : 'hover:text-gray-900 hover:bg-gray-200/60'
              }`}
              title="View 6: Floor plan / sectional configuration"
            >
              V6 Sectional
            </button>
          </div>

          {/* Catalog-Mandated Expandable Transport / Deployed Mode Toggle */}
          {(currentModel.series === 'expandable' || state.modelId.startsWith('expandable')) && (
            <div className="flex items-center bg-orange-50/90 p-1 rounded-xl border border-orange-200 text-xs font-bold text-orange-950">
              <button
                type="button"
                onClick={() => {
                  if (onStateChange) {
                    onStateChange((prev) => ({
                      ...prev,
                      isFoldedTransportMode: !prev.isFoldedTransportMode,
                    }));
                  }
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  state.isFoldedTransportMode
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-orange-900 shadow-xs border border-orange-200'
                }`}
                title="Toggle between deployed living width and 2.2m transported shipping profile"
              >
                <span>{state.isFoldedTransportMode ? '📦 Folded Transport (2.2m)' : '🏡 Fully Deployed'}</span>
              </button>
            </div>
          )}

          {/* Catalog-Mandated Duplex Upper / Lower Sectional View Toggle */}
          {(state.modelId === 'apple-cabin-ad01' || state.modelId === 'apple-cabin-ad03') && (
            <div className="flex items-center bg-blue-50/90 p-1 rounded-xl border border-blue-200 text-xs font-bold text-blue-950">
              <button
                type="button"
                onClick={() => {
                  if (onStateChange) {
                    onStateChange((prev) => ({
                      ...prev,
                      duplexLevelView: prev.duplexLevelView === 'upper' ? 'ground' : prev.duplexLevelView === 'ground' ? 'both' : 'upper',
                    }));
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white text-blue-900 border border-blue-200 shadow-xs cursor-pointer"
                title="Toggle between 2-storey exterior and cutaway view"
              >
                🏢 Duplex: {state.duplexLevelView === 'upper' ? 'Upper Suite' : state.duplexLevelView === 'ground' ? 'Ground Floor' : 'Full 2-Storey (4.96m)'}
              </button>
            </div>
          )}

          {/* Cutaway & Roof Removal / Lift Tools */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-2xs">
            {/* Primary Requested Button: Totally Remove Roof or Put It Back */}
            <button
              type="button"
              onClick={handleToggleRoof}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                isRoofRemoved
                  ? 'bg-orange-600 text-white font-black shadow-xs ring-1 ring-orange-500'
                  : 'bg-white text-gray-800 font-bold border border-gray-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 shadow-2xs'
              }`}
              title={
                isRoofRemoved
                  ? 'Put roof back on the house'
                  : 'Totally remove the roof for a clear aerial view of the floor'
              }
            >
              {isRoofRemoved ? (
                <>
                  <Home className="w-3.5 h-3.5 text-white" />
                  <span>Put Roof Back</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-gray-600" />
                  <span>Remove Roof</span>
                </>
              )}
            </button>

            {/* Cutaway Mode Toggle */}
            <button
              type="button"
              onClick={onCutawayModeToggle}
              className={`flex items-center gap-1 font-bold px-2 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                cutawayMode
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/60 hover:text-gray-900'
              }`}
              title="Toggle front wall cutaway visibility"
            >
              <span>{cutawayMode ? 'Wall Off' : 'Cutaway'}</span>
            </button>

            {/* Roof Elevation Slider */}
            <div className="hidden lg:flex items-center gap-1.5 px-2 text-gray-600 text-xs border-l border-gray-200/80">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Lift
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={isRoofRemoved ? 100 : roofLiftPercent}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onRoofLiftChange(val);
                  if (val === 100) {
                    if (!isRoofRemoved) handleToggleRoof();
                  } else if (isRoofRemoved) {
                    handleToggleRoof();
                  }
                }}
                className="w-14 accent-orange-600 cursor-pointer h-1 bg-gray-300 rounded-lg"
                title="Elevate roof height"
              />
              <span className="font-mono text-[10px] font-bold text-gray-800">
                {isRoofRemoved ? 'Off' : `${roofLiftPercent}%`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
