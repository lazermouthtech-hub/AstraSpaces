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
  Sliders,
  Info,
  Zap,
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
  isAdvancedMode?: boolean;
  onToggleAdvancedMode?: () => void;
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
  isAdvancedMode = false,
  onToggleAdvancedMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [localRoofRemoved, setLocalRoofRemoved] = useState(false);
  const isRoofRemoved = roofRemoved !== undefined ? roofRemoved : localRoofRemoved;

  const handleToggleRoof = () => {
    const nextRemoved = !isRoofRemoved;

    // Immediately apply visibility change directly to Three.js roof group & its children
    if (homeModelRef.current?.roofGroup) {
      homeModelRef.current.roofGroup.visible = !nextRemoved;
      homeModelRef.current.roofGroup.traverse((child) => {
        child.visible = !nextRemoved;
      });
      if (!nextRemoved) {
        const liftY = (roofLiftPercent / 100) * 2.5;
        homeModelRef.current.roofGroup.position.y = liftY;
      }
    }

    // If removing the roof and current perspective was rooftop-observatory, switch to clean top-down floorplan
    if (nextRemoved && currentPerspective === 'rooftop-observatory') {
      onPerspectiveChange('top-down-floorplan');
    }

    if (onRoofRemovedToggle) {
      onRoofRemovedToggle();
    } else {
      setLocalRoofRemoved(nextRemoved);
    }
  };

  const handleToggleFrontSide = () => {
    const nextCutaway = !cutawayMode;

    // Immediately toggle visibility on Three.js frontWallGroup directly
    if (homeModelRef.current?.frontWallGroup) {
      homeModelRef.current.frontWallGroup.visible = !nextCutaway;
      homeModelRef.current.frontWallGroup.traverse((child) => {
        child.visible = !nextCutaway;
      });
      homeModelRef.current.frontWallGroup.position.y = nextCutaway ? -2.2 : 0;
    }

    if (onCutawayModeToggle) {
      onCutawayModeToggle();
    }
  };

  const [autoRotate, setAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [viewerFlooringSubFilter, setViewerFlooringSubFilter] = useState<string>('all');
  const [isFlooringOverlayOpen, setIsFlooringOverlayOpen] = useState(true);
  const [activeVerticalMenu, setActiveVerticalMenu] = useState<'quick' | 'info' | 'structure' | 'views' | 'addons' | 'hotspots' | 'mode' | 'lighting' | null>(null);

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
    // Apply current roof and cutaway states immediately upon building
    homeModel.roofGroup.visible = !isRoofRemoved;
    homeModel.roofGroup.traverse((child) => {
      child.visible = !isRoofRemoved;
    });
    if (!isRoofRemoved) {
      homeModel.roofGroup.position.y = (roofLiftPercent / 100) * 2.5;
    }
    if (cutawayMode) {
      homeModel.frontWallGroup.position.y = -2.2;
      homeModel.frontWallGroup.visible = false;
    }

    homeModelRef.current = homeModel;
    scene.add(homeModel.rootGroup);
  }, [state, lightingMode, config]);

  // Update dynamic transforms: Roof Lift & Cutaway Mode & Roof Visibility
  useEffect(() => {
    if (!homeModelRef.current) return;
    const { roofGroup, frontWallGroup } = homeModelRef.current;

    // Totally remove roof or put it back
    roofGroup.visible = !isRoofRemoved;
    roofGroup.traverse((child) => {
      child.visible = !isRoofRemoved;
    });
    if (!isRoofRemoved) {
      // Roof lift height: 0 to 2.5 meters
      const liftY = (roofLiftPercent / 100) * 2.5;
      roofGroup.position.y = liftY;
    }

    // Cutaway mode lowers front wall or restores it
    if (frontWallGroup) {
      frontWallGroup.visible = !cutawayMode;
      frontWallGroup.traverse((child) => {
        child.visible = !cutawayMode;
      });
      frontWallGroup.position.y = cutawayMode ? -2.2 : 0;
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

      {/* Vertical Icon Menu Layer - Placed on the Left side with icons only, revealing words on select to keep canvas completely clear (Mobile Only) */}
      <div className="md:hidden absolute top-3 sm:top-4 left-3 sm:left-4 z-20 pointer-events-none flex flex-col items-start">
        {/* Transparent Dismiss Backdrop when flyout is open */}
        {activeVerticalMenu && (
          <div
            className="fixed inset-0 z-20 pointer-events-auto bg-black/20 backdrop-blur-2xs sm:bg-transparent"
            onClick={() => setActiveVerticalMenu(null)}
          />
        )}

        <div className="relative pointer-events-auto flex items-start gap-2">
          {/* Vertical Icon Rail */}
          <div className="bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-gray-200/90 shadow-lg flex flex-col items-center gap-1 sm:gap-1.5 ring-1 ring-black/5 z-30 md:hidden">
            {/* 0. Quick House Controls (All Essential Features in One Place) */}
            <button
              type="button"
              onClick={() => setActiveVerticalMenu(activeVerticalMenu === 'quick' ? null : 'quick')}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeVerticalMenu === 'quick'
                  ? 'bg-orange-600 text-white shadow-xs ring-2 ring-orange-500/40'
                  : 'text-orange-600 bg-orange-50/90 hover:bg-orange-100 hover:text-orange-700 border border-orange-200/90'
              }`}
              title="⚡ Quick House Controls (Views, Roof, Front Wall, Add-ons & Tools)"
            >
              <Zap className="w-4 h-4 fill-current" />
            </button>

            {/* 1. Model / Viewport Info Icon */}
            <button
              type="button"
              onClick={() => setActiveVerticalMenu(activeVerticalMenu === 'info' ? null : 'info')}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeVerticalMenu === 'info'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="House Specifications & Live Viewport Info"
            >
              <Info className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* 2. 3D Views Icon */}
            <button
              type="button"
              onClick={() => setActiveVerticalMenu(activeVerticalMenu === 'views' ? null : 'views')}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeVerticalMenu === 'views'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="3D Views (Exterior, Top Plan, Inside View, Camera)"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* 3. Structure (Roof & Walls) Toggle Icon */}
            <button
              type="button"
              onClick={() => setActiveVerticalMenu(activeVerticalMenu === 'structure' ? null : 'structure')}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeVerticalMenu === 'structure'
                  ? 'bg-orange-600 text-white shadow-xs ring-2 ring-orange-500/40'
                  : (cutawayMode || isRoofRemoved)
                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="Structure: Cover/Remove Front Wall & Roof"
            >
              <Home className="w-4 h-4" />
            </button>

            {/* 4. Furniture & Add-ons Icon */}
            <button
              type="button"
              onClick={() => setActiveVerticalMenu(activeVerticalMenu === 'addons' ? null : 'addons')}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeVerticalMenu === 'addons'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : (Boolean(state.hasLuxuryBedSuite) || Boolean(state.hasLivingSofa) || Boolean(state.hasExteriorPergolaDeck))
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="Add-ons & Furniture (Bed, Sofa, Pergola)"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* 5. Hotspots & Architectural Components (Inspect & Focus) */}
            <button
              type="button"
              onClick={() => setActiveVerticalMenu(activeVerticalMenu === 'hotspots' ? null : 'hotspots')}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeVerticalMenu === 'hotspots'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="Architectural Hotspots & Components"
            >
              <Compass className="w-4 h-4" />
            </button>

            {/* 6. Lighting Mode (Daylight / Sunset / Night) */}
            <button
              type="button"
              onClick={() => setActiveVerticalMenu(activeVerticalMenu === 'lighting' ? null : 'lighting')}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeVerticalMenu === 'lighting'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : lightingMode === 'night-ambient'
                  ? 'bg-slate-900 text-amber-300'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="Lighting & Sun Ambiance"
            >
              {lightingMode === 'night-ambient' ? (
                <Moon className="w-4 h-4" />
              ) : lightingMode === 'golden-hour' ? (
                <Sunset className="w-4 h-4 text-amber-600" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            {/* 7. Mode Switcher (Basic vs Advanced Pro) */}
            <button
              type="button"
              onClick={() => setActiveVerticalMenu(activeVerticalMenu === 'mode' ? null : 'mode')}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeVerticalMenu === 'mode'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : isAdvancedMode
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="Tools & Workspace Mode (Basic vs Advanced Pro)"
            >
              {isAdvancedMode ? <Sliders className="w-4 h-4 text-orange-400" /> : <Box className="w-4 h-4" />}
            </button>

            {/* 8. Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => {
                toggleFullscreen();
                setActiveVerticalMenu(null);
              }}
              className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D Viewer'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Reveal Words & Options Flyout Card when any icon is selected */}
          {activeVerticalMenu && (
            <div className="z-30 w-[calc(100vw-64px)] max-w-xs sm:w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/90 shadow-2xl p-3 sm:p-3.5 space-y-3 animate-in fade-in slide-in-from-left-2 duration-150 ring-1 ring-black/5 pointer-events-auto max-h-[calc(100dvh-135px)] sm:max-h-[75vh] flex flex-col overflow-y-auto">
              {/* Header with Title and Close Button */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                  {activeVerticalMenu === 'quick' && '⚡ Quick House Controls'}
                  {activeVerticalMenu === 'info' && 'House Specifications'}
                  {activeVerticalMenu === 'views' && '3D Camera Views'}
                  {activeVerticalMenu === 'structure' && 'Structure: Roof & Walls'}
                  {activeVerticalMenu === 'addons' && 'Furniture & Add-ons'}
                  {activeVerticalMenu === 'hotspots' && 'Architectural Hotspots'}
                  {activeVerticalMenu === 'lighting' && 'Lighting & Sun Ambiance'}
                  {activeVerticalMenu === 'mode' && 'Workspace Mode'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveVerticalMenu(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reveal Words: QUICK HOUSE CONTROLS (All essential features consolidated in one clean card) */}
              {activeVerticalMenu === 'quick' && (
                <div className="space-y-3">
                  {/* Model Quick Summary Header */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-orange-50/70 border border-orange-200/80">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-gray-950 truncate">{currentModel.name}</span>
                        <span className="text-[9px] font-mono font-bold uppercase text-orange-800 bg-white px-1.5 py-0.2 rounded border border-orange-200">
                          {currentModel.series || 'PREFAB'}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-600 font-medium">
                        {currentModel.sqft} sq ft · {currentModel.bedrooms} Bed · {currentModel.bathrooms} Bath
                      </div>
                    </div>
                  </div>

                  {/* 1. 3D Views */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                      3D Views:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onPerspectiveChange('exterior-iso');
                        }}
                        className={`py-2 px-1.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                          currentPerspective === 'exterior-iso' || currentPerspective === 'front-3-4'
                            ? 'bg-black text-white shadow-2xs font-black'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                        }`}
                      >
                        <div>🏡</div>
                        <div className="text-[10px] mt-0.5 truncate">3D Exterior</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onPerspectiveChange('top-down-floorplan');
                          if (!isRoofRemoved) handleToggleRoof();
                        }}
                        className={`py-2 px-1.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                          currentPerspective === 'top-down-floorplan'
                            ? 'bg-black text-white shadow-2xs font-black'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                        }`}
                      >
                        <div>📐</div>
                        <div className="text-[10px] mt-0.5 truncate">Top Plan</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onPerspectiveChange('interior-walkthrough');
                        }}
                        className={`py-2 px-1.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                          currentPerspective === 'interior-walkthrough' || currentPerspective === 'bedroom-suite'
                            ? 'bg-black text-white shadow-2xs font-black'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                        }`}
                      >
                        <div>🛋️</div>
                        <div className="text-[10px] mt-0.5 truncate">Inside View</div>
                      </button>
                    </div>
                  </div>

                  {/* 2. Structure (Roof & Front Wall) */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                      Structure Enclosure:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={handleToggleRoof}
                        className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isRoofRemoved
                            ? 'bg-orange-600 text-white shadow-2xs font-black ring-1 ring-orange-500/50'
                            : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200/80'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{isRoofRemoved ? 'Put Roof Back' : 'Remove Roof'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleFrontSide}
                        className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          cutawayMode
                            ? 'bg-orange-600 text-white shadow-2xs font-black ring-1 ring-orange-500/50'
                            : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200/80'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{cutawayMode ? 'Cover Front' : 'Remove Front'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. Furniture & Add-ons */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                        Add-ons &amp; Furniture:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCategory('Add-ons');
                          setActiveVerticalMenu(null);
                        }}
                        className="text-[10px] font-bold text-orange-600 hover:underline cursor-pointer"
                      >
                        Open Panel →
                      </button>
                    </div>

                    <div className="space-y-1">
                      {/* Bed Suite */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onStateChange) {
                            onStateChange((prev) => ({
                              ...prev,
                              hasLuxuryBedSuite: !prev.hasLuxuryBedSuite,
                            }));
                          }
                        }}
                        className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                          state.hasLuxuryBedSuite
                            ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-black'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>🛏️</span>
                          <span>Bed Suite</span>
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          state.hasLuxuryBedSuite ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {state.hasLuxuryBedSuite ? '✓ Added' : '+ Add'}
                        </span>
                      </button>

                      {/* Living Sofa */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onStateChange) {
                            onStateChange((prev) => ({
                              ...prev,
                              hasLivingSofa: !prev.hasLivingSofa,
                            }));
                          }
                        }}
                        className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                          state.hasLivingSofa
                            ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-black'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>🛋️</span>
                          <span>Living Sofa</span>
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          state.hasLivingSofa ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {state.hasLivingSofa ? '✓ Added' : '+ Add'}
                        </span>
                      </button>

                      {/* Pergola Deck */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onStateChange) {
                            onStateChange((prev) => ({
                              ...prev,
                              hasExteriorPergolaDeck: !prev.hasExteriorPergolaDeck,
                            }));
                          }
                        }}
                        className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                          state.hasExteriorPergolaDeck
                            ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-black'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>🌿</span>
                          <span>Pergola Deck</span>
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          state.hasExteriorPergolaDeck ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {state.hasExteriorPergolaDeck ? '✓ Installed' : '+ Add'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 4. Tools Mode (Basic vs Advanced) */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                      Mode:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (onToggleAdvancedMode) onToggleAdvancedMode();
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isAdvancedMode
                          ? 'bg-black text-white shadow-2xs font-black'
                          : 'bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5 text-orange-400" />
                      <span>{isAdvancedMode ? 'Advanced Pro Active' : 'Switch to Advanced Pro'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Reveal Words: 3D VIEWS */}
              {activeVerticalMenu === 'views' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 font-medium">
                    Select a camera angle to inspect the house:
                  </p>
                  
                  {/* 3 Core Essential Views */}
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onPerspectiveChange('exterior-iso');
                        setActiveVerticalMenu(null);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        currentPerspective === 'exterior-iso' || currentPerspective === 'front-3-4'
                          ? 'bg-black text-white shadow-2xs font-black'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>🏡</span>
                        <span>3D Exterior View</span>
                      </div>
                      {(currentPerspective === 'exterior-iso' || currentPerspective === 'front-3-4') && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onPerspectiveChange('top-down-floorplan');
                        if (!isRoofRemoved) handleToggleRoof();
                        setActiveVerticalMenu(null);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        currentPerspective === 'top-down-floorplan'
                          ? 'bg-black text-white shadow-2xs font-black'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>📐</span>
                        <span>Top Plan (Open Floor Plan)</span>
                      </div>
                      {currentPerspective === 'top-down-floorplan' && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onPerspectiveChange('interior-walkthrough');
                        setActiveVerticalMenu(null);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        currentPerspective === 'interior-walkthrough' || currentPerspective === 'bedroom-suite'
                          ? 'bg-black text-white shadow-2xs font-black'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>🛋️</span>
                        <span>Inside Walkthrough View</span>
                      </div>
                      {(currentPerspective === 'interior-walkthrough' || currentPerspective === 'bedroom-suite') && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onPerspectiveChange('front-elevation');
                        setActiveVerticalMenu(null);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        currentPerspective === 'front-elevation'
                          ? 'bg-black text-white shadow-2xs font-black'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>🚪</span>
                        <span>Front Facade Elevation</span>
                      </div>
                      {currentPerspective === 'front-elevation' && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>

                  {/* Turntable and Zoom Controls */}
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => setAutoRotate(!autoRotate)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        autoRotate
                          ? 'bg-orange-600 text-white shadow-2xs font-black'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
                        <span>{autoRotate ? 'Stop Rotation' : 'Auto 360° Orbit'}</span>
                      </div>
                      {autoRotate && <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded">ON</span>}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleZoom(1)}
                        className="py-1.5 px-3 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200/80 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span className="text-base font-black">+</span>
                        <span>Zoom In</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleZoom(-1)}
                        className="py-1.5 px-3 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200/80 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span className="text-base font-black">-</span>
                        <span>Zoom Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Reveal Words: STRUCTURE (ROOF & WALLS) */}
              {activeVerticalMenu === 'structure' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-gray-600 font-medium">
                    Cover or remove components to see interior or exterior:
                  </p>

                  {/* Front Wall Enclosure */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                      Front Wall:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (cutawayMode) handleToggleFrontSide();
                      }}
                      className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        !cutawayMode
                          ? 'bg-orange-600 text-white shadow-2xs font-black'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 shrink-0" />
                        <span>+ Cover / Add Front Side</span>
                      </div>
                      {!cutawayMode && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!cutawayMode) handleToggleFrontSide();
                      }}
                      className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        cutawayMode
                          ? 'bg-orange-600 text-white shadow-2xs font-black'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 shrink-0" />
                        <span>Remove Front Side (See Inside)</span>
                      </div>
                      {cutawayMode && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  </div>

                  {/* Roof Enclosure */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                      Roof Structure:
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleRoof}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        isRoofRemoved
                          ? 'bg-orange-600 text-white shadow-2xs font-black ring-2 ring-orange-500/40'
                          : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 shrink-0" />
                        <span>{isRoofRemoved ? 'Put Roof Back' : 'Remove Roof (Open Interior)'}</span>
                      </div>
                      {isRoofRemoved && <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded">REMOVED</span>}
                    </button>
                  </div>
                </div>
              )}

              {/* Reveal Words: FURNITURE & ADD-ONS */}
              {activeVerticalMenu === 'addons' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-gray-600 font-medium">
                    Configure interior furniture & outdoor modules:
                  </p>

                  <div className="space-y-1.5">
                    {/* Bed Suite */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onStateChange) {
                          onStateChange((prev) => ({
                            ...prev,
                            hasLuxuryBedSuite: !prev.hasLuxuryBedSuite,
                          }));
                        }
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        state.hasLuxuryBedSuite
                          ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-black'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>🛏️</span>
                        <span>Luxury Bed Suite</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        state.hasLuxuryBedSuite ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {state.hasLuxuryBedSuite ? '✓ Added' : '+ Add'}
                      </span>
                    </button>

                    {/* Living Sofa */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onStateChange) {
                          onStateChange((prev) => ({
                            ...prev,
                            hasLivingSofa: !prev.hasLivingSofa,
                          }));
                        }
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        state.hasLivingSofa
                          ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-black'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>🛋️</span>
                        <span>Living Lounge Sofa</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        state.hasLivingSofa ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {state.hasLivingSofa ? '✓ Added' : '+ Add'}
                      </span>
                    </button>

                    {/* Pergola Deck */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onStateChange) {
                          onStateChange((prev) => ({
                            ...prev,
                            hasExteriorPergolaDeck: !prev.hasExteriorPergolaDeck,
                          }));
                        }
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        state.hasExteriorPergolaDeck
                          ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-black'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>🌿</span>
                        <span>Pergola Patio Deck</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        state.hasExteriorPergolaDeck ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {state.hasExteriorPergolaDeck ? '✓ Installed' : '+ Add'}
                      </span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory('Add-ons');
                        setActiveVerticalMenu(null);
                      }}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-orange-600 text-white shadow-2xs hover:bg-orange-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Open Full Add-ons Manager</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Reveal Words: ARCHITECTURAL HOTSPOTS & COMPONENTS */}
              {activeVerticalMenu === 'hotspots' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-gray-600 font-medium">
                    Quick-focus camera and inspect architectural components:
                  </p>
                  
                  <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
                    {/* 1. Exterior Walls */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory('Wall Panels');
                        onPerspectiveChange('exterior-iso');
                        if (cutawayMode) onCutawayModeToggle();
                        setActiveVerticalMenu(null);
                      }}
                      className="w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-gray-800 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0" />
                        <span>Exterior Walls</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">Exterior</span>
                    </button>

                    {/* 2. Interior Walls */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory('Wall Panels');
                        onPerspectiveChange('interior-walkthrough');
                        if (!cutawayMode) onCutawayModeToggle();
                        if (roofLiftPercent < 30) onRoofLiftChange(50);
                        setActiveVerticalMenu(null);
                      }}
                      className="w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-gray-800 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <span>Interior Walls</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">Cutaway</span>
                    </button>

                    {/* 3. Glazing */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory('Glazing & Windows');
                        setActiveVerticalMenu(null);
                      }}
                      className="w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-gray-800 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <span>Glazing & Windows</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">Windows</span>
                    </button>

                    {/* 4. Lighting */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory('Lighting System');
                        setActiveVerticalMenu(null);
                      }}
                      className="w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-gray-800 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        <span>Lighting System</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">Illumination</span>
                    </button>

                    {/* 5. Roof & Observatory */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory('Roof & Energy');
                        if (cutawayMode) onCutawayModeToggle();
                        if (roofLiftPercent > 0) onRoofLiftChange(0);
                        onPerspectiveChange('rooftop-observatory');
                        setActiveVerticalMenu(null);
                      }}
                      className="w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-gray-800 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span>Roof & Observatory</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">Deck/Roof</span>
                    </button>

                    {/* 6. Cabinetry */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory('Cabinetry');
                        if (!cutawayMode) onCutawayModeToggle();
                        onPerspectiveChange('interior-walkthrough');
                        setActiveVerticalMenu(null);
                      }}
                      className="w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-gray-800 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-800 shrink-0" />
                        <span>Cabinetry</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">Interior</span>
                    </button>

                    {/* 7. Pods & Modules */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory('Interior Modules');
                        setActiveVerticalMenu(null);
                      }}
                      className="w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-gray-800 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                        <span>Pods & Modules</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">Modular</span>
                    </button>

                    {/* 8. Bed Suite */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory('Interior Modules');
                        if (!cutawayMode) onCutawayModeToggle();
                        onPerspectiveChange('bedroom-suite');
                        setActiveVerticalMenu(null);
                      }}
                      className="w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-gray-800 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                        <span>Bed Suite</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">Bedroom</span>
                    </button>

                    {/* 9. Flooring */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory('Flooring');
                        onPerspectiveChange('floor-inspection');
                        if (roofLiftPercent < 30) onRoofLiftChange(75);
                        setIsFlooringOverlayOpen(true);
                        setActiveVerticalMenu(null);
                      }}
                      className="w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-gray-800 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                        <span>Flooring ({flooringList.length} Finishes)</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">Flooring</span>
                    </button>

                    {/* 10. Living Lounge */}
                    {state.modelId !== 'studio' && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCategory('Interior Modules');
                          if (!cutawayMode) onCutawayModeToggle();
                          onPerspectiveChange('living-lounge');
                          setActiveVerticalMenu(null);
                        }}
                        className="w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 border border-gray-200/80 text-gray-800 flex items-center justify-between transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          <span>Living Lounge</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">Lounge</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Reveal Words: MODE SWITCHER */}
              {activeVerticalMenu === 'mode' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 font-medium">
                    Choose your editing experience:
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (isAdvancedMode && onToggleAdvancedMode) onToggleAdvancedMode();
                      setActiveVerticalMenu(null);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      !isAdvancedMode
                        ? 'bg-orange-600 text-white shadow-2xs font-black'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <div className="text-left">
                        <div className="font-bold">Basic Tools</div>
                        <div className="text-[10px] opacity-80 font-normal">Clean default essential tools</div>
                      </div>
                    </div>
                    {!isAdvancedMode && <Check className="w-4 h-4 text-white shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isAdvancedMode && onToggleAdvancedMode) onToggleAdvancedMode();
                      setActiveVerticalMenu(null);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isAdvancedMode
                        ? 'bg-black text-white shadow-2xs font-black'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sliders className="w-4 h-4 text-orange-400 shrink-0" />
                      <div className="text-left">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>Advanced Pro</span>
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-orange-500 text-white font-bold">PRO</span>
                        </div>
                        <div className="text-[10px] opacity-80 font-normal">Technical elevations, sliders & telemetry</div>
                      </div>
                    </div>
                    {isAdvancedMode && <Check className="w-4 h-4 text-white shrink-0" />}
                  </button>
                </div>
              )}

              {/* Reveal Words: LIGHTING MODE */}
              {activeVerticalMenu === 'lighting' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 font-medium">
                    Select natural daylight or ambient scene:
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onLightingModeChange('daylight');
                      setActiveVerticalMenu(null);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      lightingMode === 'daylight'
                        ? 'bg-orange-600 text-white shadow-2xs font-black'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="text-left">
                        <div className="font-bold">Daylight (5500K)</div>
                        <div className="text-[10px] opacity-80 font-normal">Natural high daylight illumination</div>
                      </div>
                    </div>
                    {lightingMode === 'daylight' && <Check className="w-4 h-4 text-white shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLightingModeChange('golden-hour');
                      setActiveVerticalMenu(null);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      lightingMode === 'golden-hour'
                        ? 'bg-orange-600 text-white shadow-2xs font-black'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sunset className="w-4 h-4 text-amber-500 shrink-0" />
                      <div className="text-left">
                        <div className="font-bold">Golden Hour Sunset</div>
                        <div className="text-[10px] opacity-80 font-normal">Warm dusk architectural horizon</div>
                      </div>
                    </div>
                    {lightingMode === 'golden-hour' && <Check className="w-4 h-4 text-white shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLightingModeChange('night-ambient');
                      setActiveVerticalMenu(null);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      lightingMode === 'night-ambient'
                        ? 'bg-black text-white shadow-2xs font-black'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Moon className="w-4 h-4 text-blue-300 shrink-0" />
                      <div className="text-left">
                        <div className="font-bold">Night LED Glow</div>
                        <div className="text-[10px] opacity-80 font-normal">Architectural night accent lighting</div>
                      </div>
                    </div>
                    {lightingMode === 'night-ambient' && <Check className="w-4 h-4 text-white shrink-0" />}
                  </button>
                </div>
              )}

              {/* Reveal Words: MODEL INFO */}
              {activeVerticalMenu === 'info' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-950">{currentModel.name}</span>
                    <span className="text-[9px] font-mono font-bold uppercase text-orange-800 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                      {currentModel.series || 'PREFAB'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200/70 space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Living Area:</span>
                      <span className="font-bold text-gray-900">{currentModel.sqft} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Layout:</span>
                      <span className="font-bold text-gray-900">{currentModel.bedrooms} Bed · {currentModel.bathrooms} Bath</span>
                    </div>
                    {currentModel.dimensions?.lengthFt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Dimensions:</span>
                        <span className="font-mono font-semibold text-gray-800">{currentModel.dimensions.lengthFt}ft × {currentModel.dimensions.widthFt}ft</span>
                      </div>
                    )}
                    {isPubliclyAvailable && (
                      <div className="flex justify-between items-center pt-1 border-t border-gray-200/60">
                        <span className="text-gray-500">Availability:</span>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          Publicly Available
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>Real-time Interactive 3D Canvas Active</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Architectural Hotspots and Component Inspection are consolidated in the Left Vertical Menu */}

      {/* Floating Floor Selector & Expandable Size Matrix Bar - Only in Advanced Mode */}
      {isAdvancedMode && (isFlooringOverlayOpen ? (
        <div className="hidden md:block absolute bottom-16 sm:bottom-18 left-3 sm:left-5 right-3 sm:right-auto z-20 pointer-events-auto max-w-xl bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl shadow-xl p-3 sm:p-3.5 space-y-2 ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
              { id: 'expandable-10ft', label: '10FT (18 m²)', desc: '195 sq ft' },
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
                      onStateChange((prev) => ({
                        ...prev,
                        modelId: sz.id as any,
                        floorPlan: sz.id === 'expandable-10ft' ? '10ft-1bed' : (prev.floorPlan === '10ft-1bed' ? '2-bed-1-bath' : prev.floorPlan),
                        bedroomLayout: sz.id === 'expandable-10ft' ? '1-bedroom' : (prev.floorPlan === '10ft-1bed' ? '2-bedroom' : prev.bedroomLayout),
                      }));
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
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
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
        <div className="hidden md:flex absolute bottom-16 sm:bottom-18 left-3 sm:left-5 z-20 pointer-events-auto items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsFlooringOverlayOpen(true)}
            className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-md flex items-center gap-2 hover:bg-orange-50/70 transition-all cursor-pointer text-xs font-bold text-gray-800 ring-1 ring-black/5"
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
              Finish
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectCategory('Add-ons')}
            className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-orange-200 shadow-md flex items-center gap-2 hover:bg-orange-50 transition-all cursor-pointer text-xs font-bold text-gray-800 ring-1 ring-black/5"
            title="Manage Add-ons & Furniture (Add/Remove Bed & Sofa)"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span className="text-[11px] font-black text-gray-900">
              Furniture &amp; Add-ons
            </span>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
              (Boolean(state.hasLuxuryBedSuite) || Boolean(state.hasLivingSofa))
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-orange-100 text-orange-800 border border-orange-200'
            }`}>
              {Boolean(state.hasLuxuryBedSuite) && Boolean(state.hasLivingSofa)
                ? 'Bed + Sofa Added'
                : Boolean(state.hasLuxuryBedSuite)
                ? 'Bed Added'
                : Boolean(state.hasLivingSofa)
                ? 'Sofa Added'
                : 'Add Bed / Sofa'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onStateChange) {
                onStateChange((prev) => ({
                  ...prev,
                  hasExteriorPergolaDeck: !prev.hasExteriorPergolaDeck,
                }));
              }
            }}
            className={`px-3 py-1.5 rounded-full backdrop-blur-md border shadow-md flex items-center gap-2 transition-all cursor-pointer text-xs font-bold ring-1 ring-black/5 active:scale-95 ${
              state.hasExteriorPergolaDeck
                ? 'bg-orange-50 border-orange-300 text-orange-950 hover:bg-orange-100'
                : 'bg-white/95 border-gray-200/90 text-gray-800 hover:bg-orange-50/70'
            }`}
            title="Toggle Exterior Louvered Pergola & Patio Deck on the house"
          >
            <span className="text-sm">🌿</span>
            <span className="text-[11px] font-black text-gray-900">
              Pergola Deck
            </span>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
              state.hasExteriorPergolaDeck
                ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                : 'bg-orange-100 text-orange-800 border border-orange-200'
            }`}>
              {state.hasExteriorPergolaDeck ? '✓ Installed' : '+ Add Pergola'}
            </span>
          </button>
        </div>
      ))}

      {/* Bento Bottom Telemetry & Controls Bar - Hidden on mobile screens so it does not block the canvas or house */}
      <div className="hidden md:flex relative z-10 bg-white/90 backdrop-blur-md border-t border-gray-200/80 px-3 sm:px-5 py-2.5 flex-wrap items-center justify-between gap-3">
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

          {/* Orientation Telemetry (Shown in Advanced Mode) */}
          {isAdvancedMode && (
            <div className="text-left hidden md:block animate-in fade-in duration-150">
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
          )}

          {/* Daylight Factor (Shown in Advanced Mode) */}
          {isAdvancedMode && (
            <div className="text-left hidden lg:block animate-in fade-in duration-150">
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
          )}
        </div>

        {/* CONTROLS AREA: BASIC TOOLS (DEFAULT) vs ADVANCED STUDIO TOOLS */}
        {!isAdvancedMode ? (
          /* =========================================================================
             BASIC TOOLS (DEFAULT MODE): Clean, intuitive, uncluttered & professional
             ========================================================================= */
          <div className="flex items-center gap-2 flex-wrap">
            {/* 3 Core Essential Views */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 shadow-2xs">
              <button
                type="button"
                onClick={() => onPerspectiveChange('exterior-iso')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentPerspective === 'exterior-iso' || currentPerspective === 'front-3-4'
                    ? 'bg-black text-white shadow-xs font-black'
                    : 'hover:text-gray-900 hover:bg-gray-200/60'
                }`}
                title="3D Exterior Angle View"
              >
                🏡 3D Exterior
              </button>

              <button
                type="button"
                onClick={() => {
                  onPerspectiveChange('top-down-floorplan');
                  if (!isRoofRemoved) {
                    handleToggleRoof();
                  }
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentPerspective === 'top-down-floorplan'
                    ? 'bg-black text-white shadow-xs font-black'
                    : 'hover:text-gray-900 hover:bg-gray-200/60'
                }`}
                title="Top-Down Aerial Floor Plan"
              >
                📐 Top Plan
              </button>

              <button
                type="button"
                onClick={() => onPerspectiveChange('interior-walkthrough')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentPerspective === 'interior-walkthrough' || currentPerspective === 'bedroom-suite'
                    ? 'bg-black text-white shadow-xs font-black'
                    : 'hover:text-gray-900 hover:bg-gray-200/60'
                }`}
                title="Step inside the living room / bedroom interior"
              >
                🛋️ Inside View
              </button>
            </div>

            {/* Quick Manage Add-ons & Furniture Button */}
            <button
              type="button"
              onClick={() => onSelectCategory('Add-ons')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200/90 shadow-2xs group"
              title="Open Add-on Manager to add or customize beds, sofa lounge, HVAC, etc."
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600 group-hover:scale-110 transition-transform" />
              <span>Add-ons &amp; Furniture</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                (Boolean(state.hasLuxuryBedSuite) || Boolean(state.hasLivingSofa))
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-orange-800 border border-orange-200'
              }`}>
                {Boolean(state.hasLuxuryBedSuite) && Boolean(state.hasLivingSofa)
                  ? 'Bed + Sofa'
                  : Boolean(state.hasLuxuryBedSuite)
                  ? 'Bed'
                  : Boolean(state.hasLivingSofa)
                  ? 'Sofa'
                  : '+ Add'}
              </span>
            </button>

            {/* Primary Action Button: Remove Roof / Put Roof Back */}
            <button
              type="button"
              onClick={handleToggleRoof}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isRoofRemoved
                  ? 'bg-orange-600 text-white shadow-xs ring-2 ring-orange-500/40 hover:bg-orange-700 active:scale-95'
                  : 'bg-white text-gray-800 border border-gray-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 shadow-2xs active:scale-95'
              }`}
              title={
                isRoofRemoved
                  ? 'Click to put the roof back onto the home'
                  : 'Click to completely remove the roof for open top-down interior inspection'
              }
            >
              {isRoofRemoved ? (
                <>
                  <Home className="w-3.5 h-3.5 text-white animate-pulse" />
                  <span>Put Roof Back</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-gray-600" />
                  <span>Remove Roof</span>
                </>
              )}
            </button>

            {/* Primary Action Button: Cover or Add Front Side of the House */}
            <button
              type="button"
              onClick={handleToggleFrontSide}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                cutawayMode
                  ? 'bg-orange-600 text-white shadow-xs ring-2 ring-orange-500/40 hover:bg-orange-700 active:scale-95'
                  : 'bg-white text-gray-800 border border-gray-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 shadow-2xs active:scale-95'
              }`}
              title={
                cutawayMode
                  ? 'Front side is currently open/removed. Click to cover and add the front side back onto the house.'
                  : 'Click to remove the front side of the house for an open view inside.'
              }
            >
              {cutawayMode ? (
                <>
                  <Home className="w-3.5 h-3.5 text-white animate-pulse" />
                  <span>Cover / Add Front Side</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-gray-600" />
                  <span>Remove Front Side</span>
                </>
              )}
            </button>

            {/* The Advanced Button */}
            <button
              type="button"
              onClick={() => onToggleAdvancedMode && onToggleAdvancedMode()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white text-gray-700 hover:text-black hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-2xs group"
              title="Click to reveal all advanced platform tools: fine roof elevation slider, cutaway slicing, 8 architectural catalog views, and telemetry"
            >
              <Sliders className="w-3.5 h-3.5 text-orange-600 group-hover:rotate-45 transition-transform" />
              <span>Advanced Tools</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-orange-100 text-orange-800">
                Pro
              </span>
            </button>
          </div>
        ) : (
          /* =========================================================================
             ADVANCED STUDIO MODE: All Platform Architectural & Engineering Tools Unlocked
             ========================================================================= */
          <div className="flex flex-wrap items-center gap-2 animate-in fade-in duration-150">
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
              <button
                type="button"
                onClick={handleToggleRoof}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isRoofRemoved
                    ? 'bg-orange-600 text-white shadow-xs ring-2 ring-orange-500/50 hover:bg-orange-700 active:scale-95'
                    : 'bg-white text-gray-800 border border-gray-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 shadow-2xs active:scale-95'
                }`}
                title={
                  isRoofRemoved
                    ? 'Click to put the roof back onto the home'
                    : 'Click to completely remove the roof for open top-down interior inspection'
                }
              >
                {isRoofRemoved ? (
                  <>
                    <Home className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span>Put Roof Back</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-3.5 h-3.5 text-gray-600" />
                    <span>Remove Roof</span>
                  </>
                )}
              </button>

              {/* Cover or Add Front Side Toggle */}
              <button
                type="button"
                onClick={handleToggleFrontSide}
                className={`flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  cutawayMode
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-gray-800 border border-gray-200 hover:bg-orange-50 hover:text-orange-700'
                }`}
                title={
                  cutawayMode
                    ? 'Front wall is currently open. Click to cover and add the front side back onto the house.'
                    : 'Click to remove the front side of the house to see inside.'
                }
              >
                {cutawayMode ? (
                  <>
                    <Home className="w-3 h-3 text-white" />
                    <span>Cover Front Side</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 text-gray-600" />
                    <span>Remove Front Side</span>
                  </>
                )}
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
                  value={isRoofRemoved ? 0 : roofLiftPercent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (isRoofRemoved) {
                      handleToggleRoof();
                    }
                    onRoofLiftChange(val);
                  }}
                  className="w-14 accent-orange-600 cursor-pointer h-1 bg-gray-300 rounded-lg"
                  title="Elevate roof height"
                />
                <span className="font-mono text-[10px] font-bold text-gray-800">
                  {isRoofRemoved ? 'Off' : `${roofLiftPercent}%`}
                </span>
              </div>
            </div>

            {/* Back to Basic Mode Toggle */}
            <button
              type="button"
              onClick={() => onToggleAdvancedMode && onToggleAdvancedMode()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-black text-white shadow-xs hover:bg-gray-800"
              title="Return to clean basic mode"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Basic View</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
