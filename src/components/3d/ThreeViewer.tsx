import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CustomizationState, LightingMode, ViewPerspective } from '../../types';
import { BASE_MODELS } from '../../data/models';
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
} from 'lucide-react';

interface ThreeViewerProps {
  state: CustomizationState;
  lightingMode: LightingMode;
  onLightingModeChange: (mode: LightingMode) => void;
  onSelectCategory: (categoryId: string) => void;
  roofLiftPercent: number;
  onRoofLiftChange: (val: number) => void;
  cutawayMode: boolean;
  onCutawayModeToggle: () => void;
  currentPerspective: ViewPerspective;
  onPerspectiveChange: (p: ViewPerspective) => void;
  config?: any;
}

export const ThreeViewer: React.FC<ThreeViewerProps> = ({
  state,
  lightingMode,
  onLightingModeChange,
  onSelectCategory,
  roofLiftPercent,
  onRoofLiftChange,
  cutawayMode,
  onCutawayModeToggle,
  currentPerspective,
  onPerspectiveChange,
  config,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [autoRotate, setAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);

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
    let dist = 9;
    if (state.modelId === 'one-bedroom') {
      length = 6.2;
      dist = 11;
    } else if (state.modelId === 'two-bedroom') {
      length = 9.4;
      dist = 14;
    }

    switch (currentPerspective) {
      case 'exterior-iso':
        targetCamPosRef.current.set(dist * 0.75, dist * 0.5, dist * 0.85);
        targetLookAtRef.current.set(0, 1.2, 0);
        break;
      case 'front-elevation':
        targetCamPosRef.current.set(0, 1.5, dist * 0.95);
        targetLookAtRef.current.set(0, 1.3, 0);
        break;
      case 'top-down-floorplan':
        targetCamPosRef.current.set(0.1, dist * 1.2, 0.1);
        targetLookAtRef.current.set(0, 0, 0);
        break;
      case 'interior-walkthrough':
        targetCamPosRef.current.set(0, 1.4, 1.8);
        targetLookAtRef.current.set(0, 1.2, -1.0);
        break;
      case 'back-patio':
        targetCamPosRef.current.set(-dist * 0.6, dist * 0.4, -dist * 0.8);
        targetLookAtRef.current.set(0, 1.2, 0);
        break;
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
    groundMesh.position.y = -0.01;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Elegant architectural boundary grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x94a3b8, 0xe2e8f0);
    gridHelper.position.y = 0;
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
      glassOpt: config.glazingOptions.find((o: any) => o.id === state.glazing) || config.glazingOptions[0],
      lightOpt: config.lightingOptions.find((o: any) => o.id === state.lightingPackage) || config.lightingOptions[0],
      floorOpt: config.flooringOptions.find((o: any) => o.id === state.flooring) || config.flooringOptions[0],
      cabOpt: config.cabinetryOptions.find((o: any) => o.id === state.cabinetry) || config.cabinetryOptions[0],
    } : null;

    const materials = createMaterialLibrary(state, lightingMode, activeOptions);
    materialsRef.current = materials;

    const currentModelSpec = config ? (config.models.find((m: any) => m.id === state.modelId) || config.models[0]) : (BASE_MODELS.find((m) => m.id === state.modelId) || BASE_MODELS[0]);

    const homeModel = buildHomeModel(state, materials, lightingMode, currentModelSpec);
    homeModelRef.current = homeModel;
    scene.add(homeModel.rootGroup);
  }, [state, lightingMode, config]);

  // Update dynamic transforms: Roof Lift & Cutaway Mode
  useEffect(() => {
    if (!homeModelRef.current) return;
    const { roofGroup, frontWallGroup } = homeModelRef.current;

    // Roof lift height: 0 to 2.5 meters
    const liftY = (roofLiftPercent / 100) * 2.5;
    roofGroup.position.y = liftY;

    // Cutaway mode lowers front wall or makes it semi-transparent
    if (cutawayMode) {
      frontWallGroup.position.y = -2.2;
      frontWallGroup.visible = false;
    } else {
      frontWallGroup.position.y = 0;
      frontWallGroup.visible = true;
    }
  }, [roofLiftPercent, cutawayMode]);

  const currentModel =
    BASE_MODELS.find((m) => m.id === state.modelId) || BASE_MODELS[0];

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
      className="relative w-full h-full min-h-[440px] bg-gradient-to-br from-blue-50/40 via-white to-gray-50/80 flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full block cursor-grab active:cursor-grabbing outline-none" />

      {/* Bento Floating Top Action Layer */}
      <div className="absolute top-4 sm:top-5 left-4 sm:left-5 right-4 sm:right-5 flex items-start justify-between pointer-events-none gap-2 z-10">
        {/* Real-time Render Active Badge */}
        <div className="pointer-events-auto bg-white/85 backdrop-blur-md px-3.5 sm:px-4 py-2 rounded-full border border-gray-200 flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
            Real-time Render Active
          </span>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <span className="text-[10px] font-semibold text-gray-500 hidden sm:inline">
            {currentModel.name}
          </span>
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
              onClick={() => onSelectCategory('Wall Panels')}
              className="px-3 py-1 bg-white/90 hover:bg-white border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
              Wall Panels
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
              onClick={() => onSelectCategory('Roof & Energy')}
              className="px-3 py-1 bg-white/90 hover:bg-white border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Roof & Solar
            </button>
            <button
              onClick={() => onSelectCategory('Cabinetry')}
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
          </div>
        </div>
      )}

      {/* Bento Bottom Telemetry & Controls Bar */}
      <div className="relative z-10 bg-white/85 backdrop-blur-md border-t border-gray-200/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Bento Architectural Telemetry Stats */}
        <div className="flex items-center gap-5 sm:gap-8">
          <div className="text-left">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Orientation
            </p>
            <p className="text-xs sm:text-sm font-semibold text-gray-900">
              {currentPerspective === 'front-elevation'
                ? 'Front Facade'
                : currentPerspective === 'top-down-floorplan'
                ? 'Top Plan'
                : currentPerspective === 'interior-walkthrough'
                ? 'Interior'
                : 'South-Facing'}
            </p>
          </div>

          <div className="text-left">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Daylight Factor
            </p>
            <p className="text-xs sm:text-sm font-semibold text-gray-900">
              {lightingMode === 'night-ambient'
                ? '18% (Night)'
                : lightingMode === 'golden-hour'
                ? '64% (Sunset)'
                : '92% (High)'}
            </p>
          </div>

          <div className="text-left hidden sm:block">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Footprint
            </p>
            <p className="text-xs sm:text-sm font-semibold text-gray-900">
              {currentModel.sqft} sq. ft.
            </p>
          </div>
        </div>

        {/* Camera Perspectives & Cutaway Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Perspectives Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600">
            <button
              onClick={() => onPerspectiveChange('exterior-iso')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentPerspective === 'exterior-iso'
                  ? 'bg-black text-white shadow-xs'
                  : 'hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              3D Iso
            </button>
            <button
              onClick={() => onPerspectiveChange('front-elevation')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentPerspective === 'front-elevation'
                  ? 'bg-black text-white shadow-xs'
                  : 'hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => {
                onPerspectiveChange('top-down-floorplan');
                if (roofLiftPercent < 30) onRoofLiftChange(75);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentPerspective === 'top-down-floorplan'
                  ? 'bg-black text-white shadow-xs'
                  : 'hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              Plan
            </button>
            <button
              onClick={() => {
                onPerspectiveChange('interior-walkthrough');
                if (!cutawayMode) onCutawayModeToggle();
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentPerspective === 'interior-walkthrough'
                  ? 'bg-black text-white shadow-xs'
                  : 'hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              Interior
            </button>
          </div>

          {/* Cutaway & Roof Lift Tools */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={onCutawayModeToggle}
              className={`flex items-center gap-1.5 font-bold px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                cutawayMode
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/60 hover:text-gray-900'
              }`}
              title="Toggle front wall visibility"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{cutawayMode ? 'Shell Off' : 'Cutaway'}</span>
            </button>

            <div className="hidden lg:flex items-center gap-1.5 px-2 text-gray-600 text-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Roof
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={roofLiftPercent}
                onChange={(e) => onRoofLiftChange(Number(e.target.value))}
                className="w-16 accent-orange-600 cursor-pointer h-1 bg-gray-300 rounded-lg"
                title="Elevate roof"
              />
              <span className="font-mono text-[10px] font-bold text-gray-800">
                {roofLiftPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
