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
  ChevronUp,
  ChevronDown,
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
  const [isControlsDropdownOpen, setIsControlsDropdownOpen] = useState(false);
  const controlsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (controlsDropdownRef.current && !controlsDropdownRef.current.contains(event.target as Node)) {
        setIsControlsDropdownOpen(false);
      }
    };
    if (isControlsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isControlsDropdownOpen]);

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
      className="relative w-full h-full min-h-[220px] sm:min-h-[260px] lg:min-h-[440px] landscape:min-h-0 landscape:h-full bg-gradient-to-br from-blue-50/40 via-white to-gray-50/80 flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 w-full h-full block cursor-grab active:cursor-grabbing outline-none touch-none transition-all duration-500 will-change-transform drop-shadow-[0_25px_60px_rgba(0,0,0,0.18)] select-none filter contrast-[1.03] brightness-[1.02]"
      />

      {/* Vertical Icon Menu Layer - Placed on the Left side with icons only, revealing words on select to keep canvas completely clear (Mobile Only) */}
      <div className="lg:hidden absolute top-2 sm:top-3 landscape:top-1.5 left-2 sm:left-3 landscape:left-2 z-20 pointer-events-none flex flex-col items-start max-h-[calc(100%-12px)]">
        {/* Transparent Dismiss Backdrop when flyout is open */}
        {activeVerticalMenu && (
          <div
            className="fixed inset-0 z-20 pointer-events-auto bg-black/20 backdrop-blur-2xs sm:bg-transparent"
            onClick={() => setActiveVerticalMenu(null)}
          />
        )}

        <div className="relative pointer-events-auto flex items-start gap-2">
          {/* Vertical Icon Rail */}
          <div className="mobile-landscape-rail bg-white/95 backdrop-blur-md p-1 sm:p-1.5 landscape:p-1 rounded-2xl border border-gray-200/90 shadow-lg flex flex-col items-center gap-1 sm:gap-1.5 landscape:gap-1 ring-1 ring-black/5 z-30 lg:hidden max-h-[calc(100dvh-75px)] landscape:max-h-[calc(100dvh-25px)] overflow-y-auto overscroll-contain touch-pan-y [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* 0. Quick House Controls (All Essential Features in One Place) */}
            <button
              type="button"
              onClick={() => setActiveVerticalMenu(activeVerticalMenu === 'quick' ? null : 'quick')}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 landscape:w-7 landscape:h-7 rounded-xl landscape:rounded-lg shrink-0 flex items-center justify-center transition-all cursor-pointer relative ${
                activeVerticalMenu === 'quick'
                  ? 'bg-orange-600 text-white shadow-xs ring-2 ring-orange-500/40'
                  : 'text-orange-600 bg-orange-50/90 hover:bg-orange-100 hover:text-orange-700 border border-orange-200/90'
              }`}
              title="⚡ Quick House Controls (Views, Roof, Front Wall, Add-ons & Tools)"
            >
              <Zap className="w-4 h-4 landscape:w-3.5 landscape:h-3.5 fill-current" />
            </button>

            {/* 1. Model / Viewport Info Icon */}
            <button
              type="button"
              onClick={() => setActiveVerticalMenu(activeVerticalMenu === 'info' ? null : 'info')}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 landscape:w-7 landscape:h-7 rounded-xl landscape:rounded-lg shrink-0 flex items-center justify-center transition-all cursor-pointer relative ${
                activeVerticalMenu === 'info'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="House Specifications & Live Viewport Info"
            >
              <Info className="w-4 h-4 landscape:w-3.5 landscape:h-3.5" />
              <span className="absolute top-1.5 right-1.5 landscape:top-1 landscape:right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* 2. 3D Views Icon */}
            <button
              type="button"
              onClick={() => setActiveVerticalMenu(activeVerticalMenu === 'views' ? null : 'views')}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 landscape:w-7 landscape:h-7 rounded-xl landscape:rounded-lg shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                activeVerticalMenu === 'views'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="3D Views (Exterior, Top Plan, Inside View, Camera)"
            >
              <Eye className="w-4 h-4 landscape:w-3.5 landscape:h-3.5" />
            </button>

            {/* 3. Structure (Roof & Walls) Toggle Icon */}
            <button
              type="button"
              onClick={() => setActiveVerticalMenu(activeVerticalMenu === 'structure' ? null : 'structure')}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 landscape:w-7 landscape:h-7 rounded-xl landscape:rounded-lg shrink-0 flex items-center justify-center transition-all cursor-pointer relative ${
                activeVerticalMenu === 'structure'
                  ? 'bg-orange-600 text-white shadow-xs ring-2 ring-orange-500/40'
                  : (cutawayMode || isRoofRemoved)
                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="Structure: Cover/Remove Front Wall & Roof"
            >
              <Home className="w-4 h-4 landscape:w-3.5 landscape:h-3.5" />
            </button>

            {/* 4. Furniture & Add-ons Icon */}
            <button
              type="button"
              onClick={() => setActiveVerticalMenu(activeVerticalMenu === 'addons' ? null : 'addons')}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 landscape:w-7 landscape:h-7 rounded-xl landscape:rounded-lg shrink-0 flex items-center justify-center transition-all cursor-pointer relative ${
                activeVerticalMenu === 'addons'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : (Boolean(state.hasLuxuryBedSuite) || Boolean(state.hasLivingSofa) || Boolean(state.hasExteriorPergolaDeck))
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="Add-ons & Furniture (Bed, Sofa, Pergola)"
            >
              <Sparkles className="w-4 h-4 landscape:w-3.5 landscape:h-3.5" />
            </button>

            {/* 5. Hotspots & Architectural Components (Inspect & Focus) */}
            <button
              type="button"
              onClick={() => setActiveVerticalMenu(activeVerticalMenu === 'hotspots' ? null : 'hotspots')}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 landscape:w-7 landscape:h-7 rounded-xl landscape:rounded-lg shrink-0 flex items-center justify-center transition-all cursor-pointer relative ${
                activeVerticalMenu === 'hotspots'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="Architectural Hotspots & Components"
            >
              <Compass className="w-4 h-4 landscape:w-3.5 landscape:h-3.5" />
            </button>

            {/* 6. Lighting Mode (Daylight / Sunset / Night) */}
            <button
              type="button"
              onClick={() => setActiveVerticalMenu(activeVerticalMenu === 'lighting' ? null : 'lighting')}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 landscape:w-7 landscape:h-7 rounded-xl landscape:rounded-lg shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                activeVerticalMenu === 'lighting'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : lightingMode === 'night-ambient'
                  ? 'bg-slate-900 text-amber-300'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="Lighting & Sun Ambiance"
            >
              {lightingMode === 'night-ambient' ? (
                <Moon className="w-4 h-4 landscape:w-3.5 landscape:h-3.5" />
              ) : lightingMode === 'golden-hour' ? (
                <Sunset className="w-4 h-4 landscape:w-3.5 landscape:h-3.5 text-amber-600" />
              ) : (
                <Sun className="w-4 h-4 landscape:w-3.5 landscape:h-3.5 text-amber-500" />
              )}
            </button>

            {/* 7. Mode Switcher (Basic vs Advanced Pro) */}
            <button
              type="button"
              onClick={() => setActiveVerticalMenu(activeVerticalMenu === 'mode' ? null : 'mode')}
              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 landscape:w-7 landscape:h-7 rounded-xl landscape:rounded-lg shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                activeVerticalMenu === 'mode'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : isAdvancedMode
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="Tools & Workspace Mode (Basic vs Advanced Pro)"
            >
              {isAdvancedMode ? <Sliders className="w-4 h-4 landscape:w-3.5 landscape:h-3.5 text-orange-400" /> : <Box className="w-4 h-4 landscape:w-3.5 landscape:h-3.5" />}
            </button>

            {/* 8. Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => {
                toggleFullscreen();
                setActiveVerticalMenu(null);
              }}
              className="w-8.5 h-8.5 sm:w-9 sm:h-9 landscape:w-7 landscape:h-7 rounded-xl landscape:rounded-lg shrink-0 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D Viewer'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 landscape:w-3.5 landscape:h-3.5" /> : <Maximize2 className="w-4 h-4 landscape:w-3.5 landscape:h-3.5" />}
            </button>
          </div>

          {/* Reveal Words & Options Flyout Card when any icon is selected */}
          {activeVerticalMenu && (
            <div className="z-30 w-[calc(100vw-64px)] max-w-xs sm:w-80 landscape:w-72 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/90 shadow-2xl p-3 sm:p-3.5 landscape:p-2.5 space-y-3 landscape:space-y-2 animate-in fade-in slide-in-from-left-2 duration-150 ring-1 ring-black/5 pointer-events-auto max-h-[calc(100dvh-135px)] sm:max-h-[75vh] landscape:max-h-[calc(100dvh-25px)] flex flex-col overflow-y-auto">
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

      {/* Selected features, flooring, and tools are consolidated cleanly into the top-right unified dropdown menu to prevent canvas crowding */}

      {/* Bento Floating Top Controls Bar - Controls drop downward clearly without overlapping */}
      <div className="flex order-first relative z-20 px-2 sm:px-4 pt-2 sm:pt-3 pb-1 landscape:pt-1.5 landscape:px-2 items-center justify-between pointer-events-none">
        {/* Architectural Telemetry (Shown in Advanced Mode) */}
        {isAdvancedMode ? (
          <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap pointer-events-auto">
            {/* Orientation Telemetry (Shown in Advanced Mode) */}
            <div className="text-left hidden lg:block bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-gray-200/90 shadow-2xs">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold leading-none">
                Orientation
              </p>
              <p className="text-xs font-semibold text-gray-900 leading-none mt-0.5">
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

            {/* Daylight Factor (Shown in Advanced Mode) */}
            <div className="text-left hidden xl:block bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-gray-200/90 shadow-2xs">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold leading-none">
                Daylight
              </p>
              <p className="text-xs font-semibold text-gray-900 leading-none mt-0.5">
                {lightingMode === 'night-ambient'
                  ? '18% (Night)'
                  : lightingMode === 'golden-hour'
                  ? '64% (Sunset)'
                  : '92% (High)'}
              </p>
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* UNIFIED CONTROLS & FEATURES DROPDOWN (Clean, compact, non-intrusive) */}
        <div ref={controlsDropdownRef} className="relative pointer-events-auto ml-auto">
          {/* Dropdown Menu Trigger Button */}
          <button
            type="button"
            onClick={() => setIsControlsDropdownOpen(!isControlsDropdownOpen)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-2 landscape:px-2.5 landscape:py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs border select-none ${
              isControlsDropdownOpen
                ? 'bg-zinc-950 text-white border-zinc-900 shadow-md ring-2 ring-zinc-900/20'
                : 'bg-white/95 backdrop-blur-md text-gray-800 border-gray-200/90 hover:border-gray-300 hover:bg-white'
            }`}
            title="Open 3D views, structure enclosure, modular add-ons & tools"
          >
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-orange-500" />
              <span>{isAdvancedMode ? 'Controls & Features' : 'Controls & Views'}</span>
            </div>
            {isAdvancedMode && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 border border-orange-200">
                PRO
              </span>
            )}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border hidden sm:inline-block ${
              isControlsDropdownOpen
                ? 'bg-zinc-800 text-gray-200 border-zinc-700'
                : 'bg-gray-100 text-gray-700 border-gray-200/80'
            }`}>
              {currentPerspective === 'top-down-floorplan'
                ? '📐 Top Plan'
                : currentPerspective === 'floor-inspection'
                ? '🪵 Floor'
                : currentPerspective === 'front-elevation'
                ? '🚪 Facade'
                : currentPerspective === 'interior-walkthrough' || currentPerspective === 'bedroom-suite' || currentPerspective === 'living-lounge'
                ? '🛋️ Inside'
                : currentPerspective === 'sectional-cutaway'
                ? '✂️ Cutaway'
                : '🏡 3D View'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isControlsDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* The Unified Dropdown Menu (Drops Downwards cleanly into open canvas viewport) */}
          {isControlsDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 landscape:w-80 bg-white/98 backdrop-blur-md rounded-2xl border border-gray-200/90 shadow-2xl p-3 sm:p-3.5 landscape:p-2.5 space-y-3 landscape:space-y-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-black/5 select-none max-h-[calc(100vh-140px)] sm:max-h-[520px] landscape:max-h-[calc(100dvh-40px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
              {/* Header with Title and Close button */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-900">
                    {isAdvancedMode ? 'Advanced Studio Controls' : 'Viewer Controls'}
                  </span>
                  {isAdvancedMode && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 border border-orange-200">
                      Pro Unlocked
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsControlsDropdownOpen(false)}
                  className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {!isAdvancedMode ? (
                /* -----------------------------------------------------------------
                   BASIC MODE CONTENT
                   ----------------------------------------------------------------- */
                <>
                  {/* 1. Core Essential 3D Views */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                      Perspective &amp; View
                    </span>
                    <div className="grid grid-cols-3 gap-1 bg-gray-100/90 p-1 rounded-xl border border-gray-200/80">
                      <button
                        type="button"
                        onClick={() => {
                          onPerspectiveChange('exterior-iso');
                          setIsControlsDropdownOpen(false);
                        }}
                        className={`py-1.5 px-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center truncate ${
                          currentPerspective === 'exterior-iso' || currentPerspective === 'front-3-4'
                            ? 'bg-black text-white shadow-xs font-black'
                            : 'text-gray-700 hover:text-gray-950 hover:bg-white/80'
                        }`}
                        title="3D Exterior Angle View"
                      >
                        🏡 Exterior
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onPerspectiveChange('top-down-floorplan');
                          if (!isRoofRemoved) handleToggleRoof();
                          setIsControlsDropdownOpen(false);
                        }}
                        className={`py-1.5 px-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center truncate ${
                          currentPerspective === 'top-down-floorplan'
                            ? 'bg-black text-white shadow-xs font-black'
                            : 'text-gray-700 hover:text-gray-950 hover:bg-white/80'
                        }`}
                        title="Top-Down Aerial Floor Plan"
                      >
                        📐 Top Plan
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onPerspectiveChange('interior-walkthrough');
                          setIsControlsDropdownOpen(false);
                        }}
                        className={`py-1.5 px-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center truncate ${
                          currentPerspective === 'interior-walkthrough' || currentPerspective === 'bedroom-suite' || currentPerspective === 'living-lounge'
                            ? 'bg-black text-white shadow-xs font-black'
                            : 'text-gray-700 hover:text-gray-950 hover:bg-white/80'
                        }`}
                        title="Step inside the living room / bedroom interior"
                      >
                        🛋️ Inside
                      </button>
                    </div>
                  </div>

                  {/* 2. Structure Enclosure Toggles */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                      Structure Enclosure
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

                  {/* 3. Quick Manage Add-ons & Furniture */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                        Add-ons &amp; Furniture
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCategory('Add-ons');
                          setIsControlsDropdownOpen(false);
                        }}
                        className="text-[10px] font-bold text-orange-600 hover:underline cursor-pointer"
                      >
                        Manage →
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory('Add-ons');
                        setIsControlsDropdownOpen(false);
                      }}
                      className="w-full py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200/90 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span className="truncate">Modular Furniture &amp; Deck</span>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
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
                  </div>

                  {/* 4. Advanced Studio Mode Toggle */}
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        if (onToggleAdvancedMode) onToggleAdvancedMode();
                        setIsControlsDropdownOpen(false);
                      }}
                      className="w-full py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white text-gray-700 hover:text-black hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-2xs flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-orange-600 group-hover:rotate-45 transition-transform" />
                        <span>Unlock Advanced Pro Tools</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-orange-100 text-orange-800">
                        Pro
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                /* -----------------------------------------------------------------
                   ADVANCED MODE CONTENT: All Selected Features & Tools in One Compact Menu
                   ----------------------------------------------------------------- */
                <>
                  {/* Status Strip: Active Configuration Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-xl bg-gray-50 border border-gray-200/70 text-[10px]">
                    <span className="font-bold text-gray-900 truncate">
                      {currentModel.name}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className={`px-1.5 py-0.2 rounded font-mono font-bold ${
                      isRoofRemoved ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isRoofRemoved ? 'Roof Off' : 'Roof On'}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded font-mono font-bold ${
                      cutawayMode ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {cutawayMode ? 'Cutaway Open' : 'Front Wall Intact'}
                    </span>
                    {state.hasExteriorPergolaDeck && (
                      <span className="px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-100 text-emerald-800">
                        Pergola
                      </span>
                    )}
                    {state.hasLuxuryBedSuite && (
                      <span className="px-1.5 py-0.2 rounded font-mono font-bold bg-indigo-100 text-indigo-800">
                        Bed Suite
                      </span>
                    )}
                    {state.hasLivingSofa && (
                      <span className="px-1.5 py-0.2 rounded font-mono font-bold bg-amber-100 text-amber-800">
                        Sofa
                      </span>
                    )}
                  </div>

                  {/* 1. All 8 Architectural Perspectives (Compact 4x2 Grid) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                      Architectural Perspectives (8 Catalog Views)
                    </span>
                    <div className="grid grid-cols-4 gap-1 bg-gray-100/90 p-1 rounded-xl border border-gray-200/80 text-[11px]">
                      <button
                        type="button"
                        onClick={() => onPerspectiveChange('front-elevation')}
                        className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center truncate ${
                          currentPerspective === 'front-elevation'
                            ? 'bg-black text-white shadow-xs font-black'
                            : 'text-gray-700 hover:text-gray-950 hover:bg-white/80'
                        }`}
                        title="Front Facade Elevation"
                      >
                        🚪 Facade
                      </button>
                      <button
                        type="button"
                        onClick={() => onPerspectiveChange('front-3-4')}
                        className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center truncate ${
                          currentPerspective === 'front-3-4' || currentPerspective === 'exterior-iso'
                            ? 'bg-black text-white shadow-xs font-black'
                            : 'text-gray-700 hover:text-gray-950 hover:bg-white/80'
                        }`}
                        title="View 1: Front 3/4 Exterior Angle"
                      >
                        🏡 Front 3/4
                      </button>
                      <button
                        type="button"
                        onClick={() => onPerspectiveChange('rear-3-4')}
                        className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center truncate ${
                          currentPerspective === 'rear-3-4' || currentPerspective === 'back-patio'
                            ? 'bg-black text-white shadow-xs font-black'
                            : 'text-gray-700 hover:text-gray-950 hover:bg-white/80'
                        }`}
                        title="View 2: Rear 3/4 Exterior Angle"
                      >
                        🔄 Rear 3/4
                      </button>
                      <button
                        type="button"
                        onClick={() => onPerspectiveChange('side-elevation')}
                        className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center truncate ${
                          currentPerspective === 'side-elevation'
                            ? 'bg-black text-white shadow-xs font-black'
                            : 'text-gray-700 hover:text-gray-950 hover:bg-white/80'
                        }`}
                        title="View 3: Side Elevation"
                      >
                        📐 Side
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onPerspectiveChange('top-down-floorplan');
                          if (!isRoofRemoved) handleToggleRoof();
                        }}
                        className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center truncate ${
                          currentPerspective === 'top-down-floorplan'
                            ? 'bg-black text-white shadow-xs font-black'
                            : 'text-gray-700 hover:text-gray-950 hover:bg-white/80'
                        }`}
                        title="View 4: Top-Down Aerial Floor Plan"
                      >
                        🗺️ Top Plan
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onPerspectiveChange('floor-inspection');
                          if (roofLiftPercent < 30) onRoofLiftChange(75);
                        }}
                        className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center truncate ${
                          currentPerspective === 'floor-inspection'
                            ? 'bg-orange-600 text-white shadow-xs font-black'
                            : 'text-gray-700 hover:text-gray-950 hover:bg-white/80'
                        }`}
                        title="Inspect Flooring: 45° Elevated Isometric View"
                      >
                        🪵 Floor View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onPerspectiveChange('interior-walkthrough');
                          if (!cutawayMode) onCutawayModeToggle();
                        }}
                        className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center truncate ${
                          currentPerspective === 'interior-walkthrough' || currentPerspective === 'bedroom-suite' || currentPerspective === 'living-lounge'
                            ? 'bg-black text-white shadow-xs font-black'
                            : 'text-gray-700 hover:text-gray-950 hover:bg-white/80'
                        }`}
                        title="View 5: Interior Walkthrough"
                      >
                        🛋️ Interior
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onPerspectiveChange('sectional-cutaway');
                          if (!cutawayMode) onCutawayModeToggle();
                        }}
                        className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center truncate ${
                          currentPerspective === 'sectional-cutaway'
                            ? 'bg-black text-white shadow-xs font-black'
                            : 'text-gray-700 hover:text-gray-950 hover:bg-white/80'
                        }`}
                        title="View 6: Cross-Sectional Cutaway"
                      >
                        ✂️ Cutaway
                      </button>
                    </div>
                  </div>

                  {/* 2. Structure Enclosure & Roof Lift Slider */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                      Structure &amp; Cutaway Enclosure
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={handleToggleRoof}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isRoofRemoved
                            ? 'bg-orange-600 text-white shadow-2xs ring-1 ring-orange-500/50'
                            : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200/80'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{isRoofRemoved ? 'Put Roof Back' : 'Remove Roof'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleFrontSide}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          cutawayMode
                            ? 'bg-orange-600 text-white shadow-2xs ring-1 ring-orange-500/50'
                            : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200/80'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{cutawayMode ? 'Cover Front' : 'Remove Front'}</span>
                      </button>
                    </div>

                    {/* Continuous Roof Lift Slider */}
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200/70 text-xs">
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider shrink-0">
                        Roof Elevation:
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={isRoofRemoved ? 0 : roofLiftPercent}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (isRoofRemoved) handleToggleRoof();
                          onRoofLiftChange(val);
                        }}
                        className="flex-1 accent-orange-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                        title="Continuous architectural roof lift slider"
                      />
                      <span className="font-mono text-xs font-black text-gray-900 w-10 text-right shrink-0">
                        {isRoofRemoved ? 'Off' : `${roofLiftPercent}%`}
                      </span>
                    </div>
                  </div>

                  {/* 3. Expandable Transport & Duplex Sectional View (Conditional) */}
                  {(currentModel.series === 'expandable' || state.modelId.startsWith('expandable') || state.modelId.includes('apple-cabin-ad')) && (
                    <div className="space-y-1.5 pt-2 border-t border-gray-100">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                        Deployment &amp; Spatial Modes
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(currentModel.series === 'expandable' || state.modelId.startsWith('expandable')) && (
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
                            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              state.isFoldedTransportMode
                                ? 'bg-orange-600 text-white shadow-xs'
                                : 'bg-orange-50 text-orange-950 border border-orange-200 hover:bg-orange-100'
                            }`}
                            title="Toggle between deployed living width and 2.2m transport shipping profile"
                          >
                            <span>{state.isFoldedTransportMode ? '📦 Folded Transport (2.2m)' : '🏡 Fully Deployed Wing'}</span>
                          </button>
                        )}
                        {(state.modelId === 'apple-cabin-ad01' || state.modelId === 'apple-cabin-ad03') && (
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
                            className="flex-1 py-1.5 px-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold cursor-pointer hover:bg-blue-100 truncate"
                          >
                            🏢 Duplex: {state.duplexLevelView === 'upper' ? 'Upper' : state.duplexLevelView === 'ground' ? 'Ground' : '2-Storey'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 4. Selected Features & Modular Add-ons */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                        Selected Modular Features
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCategory('Add-ons');
                          setIsControlsDropdownOpen(false);
                        }}
                        className="text-[10px] font-bold text-orange-600 hover:underline cursor-pointer"
                      >
                        All Catalog Add-ons →
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
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
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          state.hasLuxuryBedSuite
                            ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-400/30'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">🛏️</span>
                          <span className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded ${
                            state.hasLuxuryBedSuite ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {state.hasLuxuryBedSuite ? '✓ ON' : '+ ADD'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-900 block truncate mt-1">Bed Suite</span>
                      </button>

                      {/* Living Room Sofa */}
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
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          state.hasLivingSofa
                            ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400/30'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">🛋️</span>
                          <span className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded ${
                            state.hasLivingSofa ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {state.hasLivingSofa ? '✓ ON' : '+ ADD'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-900 block truncate mt-1">Living Sofa</span>
                      </button>

                      {/* Louvered Pergola Deck */}
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
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          state.hasExteriorPergolaDeck
                            ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/30'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">🌿</span>
                          <span className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded ${
                            state.hasExteriorPergolaDeck ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {state.hasExteriorPergolaDeck ? '✓ ON' : '+ ADD'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-900 block truncate mt-1">Pergola Deck</span>
                      </button>
                    </div>
                  </div>

                  {/* 5. Selected Flooring Finish & Quick Swatches */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                        Selected Flooring Finish
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCategory('Flooring');
                          setIsControlsDropdownOpen(false);
                        }}
                        className="text-[10px] font-bold text-orange-600 hover:underline cursor-pointer"
                      >
                        24 SPC Catalog →
                      </button>
                    </div>
                    <div className="p-2 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-5 h-5 rounded-md border border-black/20 shadow-2xs shrink-0"
                          style={{ backgroundColor: activeFloorOpt?.color || '#d6c4a8' }}
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-gray-950 truncate block">
                            {activeFloorOpt?.name || 'Acoustic SPC Flooring'}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono truncate block">
                            {activeFloorOpt?.category || 'Collection'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onPerspectiveChange('floor-inspection');
                          if (roofLiftPercent < 30) onRoofLiftChange(75);
                        }}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white border border-gray-200 text-gray-800 hover:bg-orange-50 hover:text-orange-900 shrink-0 cursor-pointer"
                      >
                        👁️ View Floor
                      </button>
                    </div>
                  </div>

                  {/* 6. Sun Ambiance & Lighting Mode */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                      Sun Position &amp; Ambiance
                    </span>
                    <div className="grid grid-cols-3 gap-1 bg-gray-100/90 p-1 rounded-xl border border-gray-200/80 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => onLightingModeChange('daylight')}
                        className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          lightingMode === 'daylight'
                            ? 'bg-white text-gray-950 shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>Daylight</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onLightingModeChange('golden-hour')}
                        className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          lightingMode === 'golden-hour'
                            ? 'bg-white text-gray-950 shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Sunset className="w-3.5 h-3.5 text-amber-600" />
                        <span>Sunset</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onLightingModeChange('night-ambient')}
                        className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          lightingMode === 'night-ambient'
                            ? 'bg-slate-900 text-amber-300 shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5 text-amber-300" />
                        <span>Night</span>
                      </button>
                    </div>
                  </div>

                  {/* 7. Switch back to Basic View */}
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        if (onToggleAdvancedMode) onToggleAdvancedMode();
                        setIsControlsDropdownOpen(false);
                      }}
                      className="w-full py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white text-gray-700 hover:text-black hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-2xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                        <span>Switch to Basic View</span>
                      </div>
                      <span className="text-[10px] text-gray-400">Default Clean Mode →</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
