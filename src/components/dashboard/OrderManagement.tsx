import React, { useState, useEffect } from 'react';
import {
  CustomerOrder,
  OrderStatus,
  HomeModelId,
  CustomizationState,
  LightingMode,
  ViewPerspective,
} from '../../types';
import {
  getOrders,
  saveOrders,
  updateOrderStatus,
  updateOrderDetails,
  addOrder,
  addOrderNote,
  deleteOrderNote,
  deleteOrder,
  resetSampleOrders,
  subscribeToOrders,
  syncOrdersCurrency,
} from '../../utils/orderManager';
import { useAppConfig } from '../../context/AppConfigContext';
import { formatCurrency, normalizeCurrency, TWO_CURRENCIES, PrimaryCurrencyCode } from '../../utils/currency';
import { BASE_MODELS } from '../../data/models';
import {
  COUNTRIES,
  getCountryByCode,
  getSubdivisions,
  getDistricts,
} from '../../data/regions';
import { OrderWorkOrderSheet } from './OrderWorkOrderSheet';
import { ProductLineDrawing } from './ProductLineDrawing';
import { ThreeViewer } from '../3d/ThreeViewer';
import { DevelopmentProgressManager } from './DevelopmentProgressManager';
import { FeatureVisibilityModal, getHiddenFeatureCount } from './FeatureVisibilityModal';
import { exportElementToPDF } from '../../utils/pdfGenerator';
import {
  Search,
  Filter,
  Plus,
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  Truck,
  Building,
  ShieldCheck,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  X,
  Send,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  DollarSign,
  User,
  Copy,
  Check,
  Loader2,
  Compass,
  Activity,
  CreditCard,
  Ship,
  Wrench,
  Home,
  CheckSquare,
  Square,
  Maximize2,
  Sun,
  Moon,
  Info,
  Box,
  Columns3,
  List,
  Kanban,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Landmark,
  Award,
  PhoneCall,
} from 'lucide-react';

interface OrderManagementProps {
  onGoToConfigurator?: () => void;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ElementType;
    stepIndex: number;
    description: string;
  }
> = {
  pending_review: {
    label: 'Pending Review',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: Clock,
    stepIndex: 0,
    description: 'Initial reservation placed. Awaiting admin site review and verification.',
  },
  deposit_received: {
    label: 'Deposit Received',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200',
    icon: ShieldCheck,
    stepIndex: 1,
    description: 'Reservation deposit confirmed. Production queue slot locked.',
  },
  site_assessment: {
    label: 'Site Assessment',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    icon: MapPin,
    stepIndex: 2,
    description: 'Zoning clearance, soil grading, and foundation engineering checks.',
  },
  in_production: {
    label: 'In Production',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    icon: Building,
    stepIndex: 3,
    description: 'Chassis framing, wall panel assembly, and electrical/plumbing rough-in.',
  },
  quality_check: {
    label: 'Quality Check',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    icon: AlertCircle,
    stepIndex: 4,
    description: 'Water-tightness pressure test, insulation verification, and electrical load testing.',
  },
  ready_for_dispatch: {
    label: 'Ready for Dispatch',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: Truck,
    stepIndex: 5,
    description: 'Packaged, crated, and scheduled for hydraulic low-bed transport.',
  },
  delivered: {
    label: 'Delivered & Installed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: CheckCircle2,
    stepIndex: 6,
    description: 'Delivered to customer site, crane placed, and factory warranty activated.',
  },
  cancelled: {
    label: 'Cancelled / Refunded',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    icon: X,
    stepIndex: -1,
    description: 'Order cancelled and reservation deposit refunded.',
  },
};

const ORDER_STEPS: OrderStatus[] = [
  'deposit_received',
  'site_assessment',
  'in_production',
  'quality_check',
  'ready_for_dispatch',
  'delivered',
];

export const KANBAN_PIPELINE: {
  key: OrderStatus;
  title: string;
  shortLabel: string;
  icon: React.ElementType;
  color: string;
  bgLight: string;
  borderCol: string;
  accentBar: string;
  description: string;
}[] = [
  {
    key: 'pending_review',
    title: 'New Leads & Inquiries',
    shortLabel: 'New Leads',
    icon: Clock,
    color: 'text-amber-800',
    bgLight: 'bg-amber-50/70',
    borderCol: 'border-amber-200',
    accentBar: 'bg-amber-500',
    description: 'Fresh intakes & inquiries. Site check and lead qualification pending.',
  },
  {
    key: 'deposit_received',
    title: 'Deposit Secured',
    shortLabel: 'Deposit Locked',
    icon: ShieldCheck,
    color: 'text-sky-800',
    bgLight: 'bg-sky-50/70',
    borderCol: 'border-sky-200',
    accentBar: 'bg-sky-500',
    description: 'Reservation fee secured. Priority factory queue placement locked.',
  },
  {
    key: 'site_assessment',
    title: 'Site Assessment',
    shortLabel: 'Site Feasibility',
    icon: MapPin,
    color: 'text-purple-800',
    bgLight: 'bg-purple-50/70',
    borderCol: 'border-purple-200',
    accentBar: 'bg-purple-500',
    description: 'Grading inspection, crane access route, and municipal zoning check.',
  },
  {
    key: 'in_production',
    title: 'Factory Assembly',
    shortLabel: 'In Production',
    icon: Building,
    color: 'text-orange-800',
    bgLight: 'bg-orange-50/70',
    borderCol: 'border-orange-200',
    accentBar: 'bg-orange-500',
    description: 'Steel chassis, sandwich panels, and pods fabrication in line.',
  },
  {
    key: 'quality_check',
    title: 'Quality & Testing',
    shortLabel: 'Quality QC',
    icon: AlertCircle,
    color: 'text-indigo-800',
    bgLight: 'bg-indigo-50/70',
    borderCol: 'border-indigo-200',
    accentBar: 'bg-indigo-500',
    description: 'Waterproofing, structural seal, and electrical load tests.',
  },
  {
    key: 'ready_for_dispatch',
    title: 'Ready for Dispatch',
    shortLabel: 'Ready Freight',
    icon: Truck,
    color: 'text-blue-800',
    bgLight: 'bg-blue-50/70',
    borderCol: 'border-blue-200',
    accentBar: 'bg-blue-500',
    description: 'Crated in 40HQ container, awaiting flatbed or ocean shipping.',
  },
  {
    key: 'delivered',
    title: 'Delivered & Installed',
    shortLabel: 'Delivered',
    icon: CheckCircle2,
    color: 'text-emerald-800',
    bgLight: 'bg-emerald-50/70',
    borderCol: 'border-emerald-200',
    accentBar: 'bg-emerald-500',
    description: 'Crane placed, wings expanded, keys handed over to client.',
  },
];

export const PIPELINE_STATUS_KEYS: OrderStatus[] = [
  'pending_review',
  'deposit_received',
  'site_assessment',
  'in_production',
  'quality_check',
  'ready_for_dispatch',
  'delivered',
];

export const OrderManagement: React.FC<OrderManagementProps> = ({ onGoToConfigurator }) => {
  const { config, updateConfig, setCurrency } = useAppConfig();
  const activeCurrency: PrimaryCurrencyCode = normalizeCurrency(config?.currency);

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showFeatureVisibilityModal, setShowFeatureVisibilityModal] = useState(false);
  const hiddenFeaturesCount = getHiddenFeatureCount(config);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [dossierTab, setDossierTab] = useState<'visual' | 'work_order' | 'crm' | 'progress'>('visual');
  const [visualSubView, setVisualSubView] = useState<'3d' | 'blueprints' | 'gallery'>('3d');
  const [visualLighting, setVisualLighting] = useState<LightingMode>('daylight');
  const [visualPerspective, setVisualPerspective] = useState<ViewPerspective>('front-3-4');
  const [visualRoofLift, setVisualRoofLift] = useState<number>(0);
  const [visualRoofRemoved, setVisualRoofRemoved] = useState<boolean>(false);
  const [visualCutawayMode, setVisualCutawayMode] = useState<boolean>(false);
  const [qcCheckedItems, setQcCheckedItems] = useState<Record<string, boolean>>({});
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);

  // Kanban view mode switch and payment follow-up filters
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>(() => {
    try {
      const saved = localStorage.getItem('10apples_orders_view_mode');
      return (saved === 'table' || saved === 'kanban') ? saved : 'kanban';
    } catch {
      return 'kanban';
    }
  });

  const handleSetViewMode = (mode: 'kanban' | 'table') => {
    setViewMode(mode);
    try {
      localStorage.setItem('10apples_orders_view_mode', mode);
    } catch {}
  };

  const [paymentFilter, setPaymentFilter] = useState<
    'all' | 'needs_followup' | 'special_requests' | 'mortgage' | 'gov_scheme' | 'milestone' | 'full'
  >('all');

  // Drag and Drop state
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<OrderStatus | null>(null);

  // Quick Inline Note logging on card
  const [inlineNoteOrderId, setInlineNoteOrderId] = useState<string | null>(null);
  const [inlineNoteText, setInlineNoteText] = useState<string>('');

  // Show cancelled column in kanban toggle
  const [showCancelledCol, setShowCancelledCol] = useState<boolean>(false);

  useEffect(() => {
    if (selectedOrder) {
      try {
        const stored = localStorage.getItem(`10apples_order_qc_${selectedOrder.id}`);
        if (stored) {
          setQcCheckedItems(JSON.parse(stored));
        } else {
          setQcCheckedItems({});
        }
      } catch {
        setQcCheckedItems({});
      }
      setActiveGalleryIndex(0);
      setVisualRoofLift(0);
      setVisualRoofRemoved(false);
      setVisualCutawayMode(false);
    }
  }, [selectedOrder?.id]);

  const toggleQcItem = (key: string) => {
    if (!selectedOrder) return;
    setQcCheckedItems((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(`10apples_order_qc_${selectedOrder.id}`, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save QC state', e);
      }
      return next;
    });
  };

  const handleMarkAllQc = (allChecked: boolean) => {
    if (!selectedOrder) return;
    const next: Record<string, boolean> = {};
    const keys = [
      'qc_envelope',
      'qc_glazing',
      'qc_roof',
      'qc_flooring',
      'qc_cabinetry',
      'qc_mep_electrical',
      'qc_lighting',
      'qc_addons',
    ];
    keys.forEach((k) => {
      next[k] = allChecked;
    });
    setQcCheckedItems(next);
    try {
      localStorage.setItem(`10apples_order_qc_${selectedOrder.id}`, JSON.stringify(next));
    } catch (e) {
      console.error('Failed to save QC state', e);
    }
  };

  const visualCustomizationState: CustomizationState | null = React.useMemo(() => {
    if (!selectedOrder) return null;
    if (selectedOrder.customization?.rawState) {
      return {
        ...selectedOrder.customization.rawState,
        modelId: selectedOrder.customization.modelId,
      };
    }
    const addons = selectedOrder.customization?.addonsList || [];
    const hasAddon = (kw: string) =>
      addons.some((a) => a.toLowerCase().includes(kw.toLowerCase()));

    return {
      modelId: selectedOrder.customization.modelId || 'expandable-20ft',
      wallCladding: 'wood-grain-embossed',
      wallCladdingColor: selectedOrder.customization?.wallCladdingColor || '#c2a68c',
      glazing: 'broken-bridge-sliding-door',
      lightingPackage: 'standard-recessed',
      electricalTier: 'smart-iot-200a',
      flooring: 'wood-nordic-pale-oak',
      roofOption: 'factory-standard-roof',
      cabinetry: 'melamine-flat-panel',
      hasKitchenetteModule: hasAddon('kitchen') || true,
      hasLuxuryBathPod: hasAddon('bath') || true,
      hasLuxuryBedSuite: hasAddon('bed') || hasAddon('bedroom'),
      hasLivingSofa: hasAddon('sofa') || hasAddon('living'),
      hasHvacMiniSplit: hasAddon('hvac') || hasAddon('split') || hasAddon('air'),
      hasExteriorPergolaDeck: hasAddon('pergola') || hasAddon('deck'),
      hasBioDigester: hasAddon('bio') || hasAddon('digester'),
      hasSmartDoorLock: hasAddon('smart lock') || hasAddon('door lock'),
      hasElectricBlinds: hasAddon('blind'),
    };
  }, [selectedOrder]);

  const printableWorkOrderRef = React.useRef<HTMLDivElement>(null);
  const [editedCustomer, setEditedCustomer] = useState({
    fullName: '',
    email: '',
    phone: '',
    deliveryAddress: '',
    zipCode: '',
    landStatus: 'own-land',
  });

  // Manual new order state
  const [manualOrder, setManualOrder] = useState({
    fullName: '',
    email: '',
    phone: '',
    deliveryAddress: '',
    zipCode: '',
    landStatus: 'own-land',
    modelId: 'studio' as HomeModelId,
    status: 'deposit_received' as OrderStatus,
    notes: '',
  });

  const [manualCountryCode, setManualCountryCode] = useState(config.currency === 'GHS' ? 'GH' : 'US');
  const manualCountry = getCountryByCode(manualCountryCode);
  const manualSubdivisions = getSubdivisions(manualCountryCode);
  const [manualSubdivisionId, setManualSubdivisionId] = useState(manualSubdivisions[0]?.id || '');
  const manualDistricts = getDistricts(manualCountryCode, manualSubdivisionId);
  const [manualDistrict, setManualDistrict] = useState(manualDistricts[0] || '');

  const handleManualCountryChange = (code: string) => {
    setManualCountryCode(code);
    const newSubs = getSubdivisions(code);
    const firstSub = newSubs[0]?.id || '';
    setManualSubdivisionId(firstSub);
    const newDistricts = getDistricts(code, firstSub);
    setManualDistrict(newDistricts[0] || '');
  };

  const handleManualSubdivisionChange = (subId: string) => {
    setManualSubdivisionId(subId);
    const newDistricts = getDistricts(manualCountryCode, subId);
    setManualDistrict(newDistricts[0] || '');
  };

  // Switch unified currency across entire order book and application
  const handleCurrencySwitch = (newCurrency: PrimaryCurrencyCode) => {
    if (setCurrency) {
      setCurrency(newCurrency);
    } else {
      updateConfig({ ...config, currency: newCurrency });
    }
    const updated = syncOrdersCurrency(newCurrency);
    setOrders(updated);
  };

  // Load orders and subscribe to updates
  useEffect(() => {
    setOrders(getOrders(activeCurrency));
    const unsubscribe = subscribeToOrders((updated) => {
      setOrders(updated);
      if (selectedOrder) {
        const found = updated.find((o) => o.id === selectedOrder.id);
        if (found) setSelectedOrder(found);
      }
    });
    return unsubscribe;
  }, [selectedOrder, activeCurrency]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = updateOrderStatus(orderId, newStatus);
    if (updated && selectedOrder?.id === orderId) {
      setSelectedOrder(updated);
    }
  };

  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    const currentIndex = PIPELINE_STATUS_KEYS.indexOf(currentStatus);
    if (currentIndex !== -1 && currentIndex < PIPELINE_STATUS_KEYS.length - 1) {
      const nextStatus = PIPELINE_STATUS_KEYS[currentIndex + 1];
      handleQuickStatusChange(orderId, nextStatus);
    }
  };

  const handleRetreatStatus = (orderId: string, currentStatus: OrderStatus) => {
    const currentIndex = PIPELINE_STATUS_KEYS.indexOf(currentStatus);
    if (currentIndex > 0) {
      const prevStatus = PIPELINE_STATUS_KEYS[currentIndex - 1];
      handleQuickStatusChange(orderId, prevStatus);
    }
  };

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('text/plain', orderId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedOrderId(orderId);
  };

  const handleDragOver = (e: React.DragEvent, status: OrderStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== status) {
      setDragOverCol(status);
    }
  };

  const handleDragLeave = (status: OrderStatus) => {
    if (dragOverCol === status) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: OrderStatus) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain') || draggedOrderId;
    setDragOverCol(null);
    setDraggedOrderId(null);
    if (orderId) {
      handleQuickStatusChange(orderId, targetStatus);
    }
  };

  const handleSaveInlineNote = (orderId: string) => {
    if (!inlineNoteText.trim()) {
      setInlineNoteOrderId(null);
      return;
    }
    const updated = addOrderNote(orderId, inlineNoteText.trim(), 'Lead Manager');
    if (updated && selectedOrder?.id === orderId) {
      setSelectedOrder(updated);
    }
    setInlineNoteText('');
    setInlineNoteOrderId(null);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newNoteText.trim()) return;
    const updated = addOrderNote(selectedOrder.id, newNoteText.trim(), 'Operator');
    if (updated) {
      setSelectedOrder(updated);
      setNewNoteText('');
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (!selectedOrder) return;
    const updated = deleteOrderNote(selectedOrder.id, noteId);
    if (updated) setSelectedOrder(updated);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm(`Are you sure you want to permanently delete order ${orderId}? This cannot be undone.`)) {
      deleteOrder(orderId);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    }
  };

  const handleStartEditCustomer = (order: CustomerOrder) => {
    setEditedCustomer({
      fullName: order.customer.fullName,
      email: order.customer.email,
      phone: order.customer.phone,
      deliveryAddress: order.customer.deliveryAddress || '',
      zipCode: order.customer.zipCode,
      landStatus: order.customer.landStatus,
    });
    setIsEditingCustomer(true);
  };

  const handleSaveCustomer = () => {
    if (!selectedOrder) return;
    const updated = updateOrderDetails(selectedOrder.id, {
      customer: {
        ...selectedOrder.customer,
        ...editedCustomer,
      },
    });
    if (updated) {
      setSelectedOrder(updated);
      setIsEditingCustomer(false);
    }
  };

  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const model = BASE_MODELS.find((m) => m.id === manualOrder.modelId) || BASE_MODELS[0];
    const freight = config.logistics?.freightCost || 4500;
    const sitePrep = config.logistics?.sitePrepCost || 5500;
    const basePrice = model.basePrice;
    const totalPrice = basePrice + freight + sitePrep;
    const deposit = config.branding?.reservationFee || 250;

    const subObj = manualSubdivisions.find((s) => s.id === manualSubdivisionId);
    const subName = subObj?.name || manualSubdivisionId;
    const fullDeliveryAddr = [
      manualOrder.deliveryAddress.trim(),
      manualDistrict,
      subName,
      manualCountry.name,
    ]
      .filter(Boolean)
      .join(', ');

    const newOrder = addOrder({
      status: manualOrder.status,
      customer: {
        fullName: manualOrder.fullName.trim(),
        email: manualOrder.email.trim(),
        phone: manualOrder.phone.trim(),
        deliveryAddress: fullDeliveryAddr,
        zipCode: manualOrder.zipCode.trim(),
        landStatus: manualOrder.landStatus,
        country: manualCountry.name,
        stateOrRegion: subName,
        districtOrCounty: manualDistrict,
        notes: manualOrder.notes.trim() || undefined,
      },
      customization: {
        modelId: manualOrder.modelId,
        modelName: model.name,
        wallCladdingName: 'Standard Fluorocarbon Panels',
        wallCladdingColor: '#334155',
        glazingName: 'Panoramic Low-E Clear Glass',
        lightingName: 'Standard Architectural Lighting',
        electricalName: 'Standard 100A Service',
        flooringName: 'Rigid Core SPC Plank',
        roofName: 'Standard Architectural Parapet Roof',
        cabinetryName: 'Satin Minimalist Flat-Panel',
        addonsList: ['Luxury Bath Pod & Rain Shower', 'Pre-wired Factory Utilities'],
      },
      pricing: {
        basePrice,
        optionsTotal: 0,
        freightCost: freight,
        sitePrepCost: sitePrep,
        taxAmount: 0,
        totalPrice,
        depositDue: deposit,
        depositPaid: true,
        currency: activeCurrency,
      },
      estimatedDeliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
      initialNote: 'Order manually created by operator through 10Apples Admin OS.',
    });

    setShowNewOrderModal(false);
    setSelectedOrder(newOrder);
    setManualOrder({
      fullName: '',
      email: '',
      phone: '',
      deliveryAddress: '',
      zipCode: '',
      landStatus: 'own-land',
      modelId: 'studio',
      status: 'deposit_received',
      notes: '',
    });
  };

  const handleExportCSV = () => {
    if (!orders.length) return;
    const headers = [
      'Order ID',
      'Date Placed',
      'Status',
      'Customer Name',
      'Email',
      'Phone',
      'Zip Code',
      'Site Address',
      'Land Status',
      'Model',
      'Wall Cladding',
      'Glazing',
      'Lighting',
      'Flooring',
      'Roof',
      'Cabinetry',
      'Addons',
      'Total Price',
      'Deposit Paid',
      'Currency',
    ];

    const rows = orders.map((o) => [
      `"${o.id}"`,
      `"${new Date(o.createdAt).toLocaleString()}"`,
      `"${STATUS_CONFIG[o.status]?.label || o.status}"`,
      `"${o.customer.fullName.replace(/"/g, '""')}"`,
      `"${o.customer.email}"`,
      `"${o.customer.phone}"`,
      `"${o.customer.zipCode}"`,
      `"${(o.customer.deliveryAddress || '').replace(/"/g, '""')}"`,
      `"${o.customer.landStatus}"`,
      `"${o.customization.modelName}"`,
      `"${o.customization.wallCladdingName}"`,
      `"${o.customization.glazingName}"`,
      `"${o.customization.lightingName}"`,
      `"${o.customization.flooringName}"`,
      `"${o.customization.roofName}"`,
      `"${o.customization.cabinetryName}"`,
      `"${(o.customization.addonsList || []).join('; ')}"`,
      o.pricing.totalPrice,
      o.pricing.depositDue,
      activeCurrency,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `10apples_orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintSpecSheet = () => {
    setDossierTab('work_order');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleDownloadWorkOrderPDF = async () => {
    if (!selectedOrder) return;
    try {
      setIsExportingPDF(true);
      // Ensure tab is set to work_order so element is mounted
      if (dossierTab !== 'work_order') {
        setDossierTab('work_order');
        await new Promise((r) => setTimeout(r, 200));
      }
      if (printableWorkOrderRef.current) {
        await exportElementToPDF(printableWorkOrderRef.current, {
          filename: `10APPLES-WORK-ORDER-${selectedOrder.id}.pdf`,
          orderId: selectedOrder.id,
          onSuccess: () => {
            setIsExportingPDF(false);
          },
          onError: (err) => {
            console.error('PDF export failed:', err);
            setIsExportingPDF(false);
          },
        });
      } else {
        window.print();
        setIsExportingPDF(false);
      }
    } catch (err) {
      console.error('Error downloading work order PDF:', err);
      setIsExportingPDF(false);
    }
  };

  // Filtered orders with lead search, status, model, and payment follow-up filter
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.customer.fullName.toLowerCase().includes(q) ||
      order.customer.email.toLowerCase().includes(q) ||
      order.customer.phone.toLowerCase().includes(q) ||
      (order.customer.deliveryAddress && order.customer.deliveryAddress.toLowerCase().includes(q)) ||
      (order.customer.stateOrRegion && order.customer.stateOrRegion.toLowerCase().includes(q)) ||
      (order.customer.country && order.customer.country.toLowerCase().includes(q)) ||
      (order.customer.zipCode && order.customer.zipCode.toLowerCase().includes(q)) ||
      order.customization.modelName.toLowerCase().includes(q) ||
      (order.pricing.financingDetails?.providerName && order.pricing.financingDetails.providerName.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesModel = modelFilter === 'all' || order.customization.modelId === modelFilter;

    let matchesPayment = true;
    if (paymentFilter === 'needs_followup') {
      matchesPayment =
        order.status === 'pending_review' ||
        order.status === 'deposit_received' ||
        order.status === 'in_production' ||
        (order.pricing.totalPrice - order.pricing.depositDue > 0);
    } else if (paymentFilter === 'special_requests') {
      matchesPayment = Boolean(order.isSpecialRequest || order.id.startsWith('SR-') || order.customization?.modelId === 'special-request');
    } else if (paymentFilter === 'mortgage') {
      matchesPayment = order.pricing.paymentOption === 'bank_mortgage';
    } else if (paymentFilter === 'gov_scheme') {
      matchesPayment = order.pricing.paymentOption === 'gov_scheme';
    } else if (paymentFilter === 'milestone') {
      matchesPayment = order.pricing.paymentOption === 'milestone';
    } else if (paymentFilter === 'full') {
      matchesPayment = order.pricing.paymentOption === 'full';
    }

    return matchesSearch && matchesStatus && matchesModel && matchesPayment;
  });

  // Follow-up & Payment Filter metrics
  const needsFollowUpCount = orders.filter(
    (o) =>
      o.status === 'pending_review' ||
      o.status === 'deposit_received' ||
      o.status === 'in_production' ||
      (o.pricing.totalPrice - o.pricing.depositDue > 0)
  ).length;
  const specialRequestsCount = orders.filter(
    (o) => o.isSpecialRequest || o.id.startsWith('SR-') || o.customization?.modelId === 'special-request'
  ).length;
  const mortgageCount = orders.filter((o) => o.pricing.paymentOption === 'bank_mortgage').length;
  const govSchemeCount = orders.filter((o) => o.pricing.paymentOption === 'gov_scheme').length;
  const milestoneCount = orders.filter((o) => o.pricing.paymentOption === 'milestone').length;
  const fullCount = orders.filter((o) => o.pricing.paymentOption === 'full').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  // Key performance indicators (KPIs)
  const totalOrders = orders.length;
  const totalBookValue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.pricing.totalPrice || 0), 0);
  const totalDeposits = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.pricing.depositDue || 250), 0);
  const inProductionCount = orders.filter((o) => o.status === 'in_production').length;
  const readyOrDeliveredCount = orders.filter((o) => o.status === 'ready_for_dispatch' || o.status === 'delivered').length;

  // Active Kanban columns to display (including cancelled if toggled)
  const activeKanbanColumns = showCancelledCol
    ? [
        ...KANBAN_PIPELINE,
        {
          key: 'cancelled' as OrderStatus,
          title: 'Cancelled / Lost Leads',
          shortLabel: 'Cancelled',
          icon: X,
          color: 'text-rose-800',
          bgLight: 'bg-rose-50/70',
          borderCol: 'border-rose-200',
          accentBar: 'bg-rose-500',
          description: 'Cancelled orders or refunded lead slots.',
        },
      ]
    : KANBAN_PIPELINE;

  return (
    <div className="space-y-6">
      {/* Top Welcome / Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black shadow-xs">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                Order & Production Queue Manager
              </h3>
              <p className="text-xs text-gray-500">
                Manage all reservation requests, customer site specs, build timelines, and delivery logistics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-orange-400" />
            <span>New Manual Order</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Download CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset order database to sample production queue?')) {
                resetSampleOrders();
              }
            }}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-200"
            title="Reload realistic sample orders"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Unified Single Currency Control Strip */}
      <div className="bg-white p-4 px-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <div className="text-xs font-black text-gray-900 flex items-center gap-2 flex-wrap">
              <span>SINGLE CURRENCY ENFORCED:</span>
              <span className="font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-xs font-black">
                {activeCurrency === 'GHS' ? 'GH₵ GHS (Ghana Cedi)' : '$ USD (US Dollar)'}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              All website pricing, models, options, pipeline metrics, and production orders strictly maintain this single currency type without mixing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowFeatureVisibilityModal(true)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95 ${
              hiddenFeaturesCount > 0
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
                : 'bg-gray-900 hover:bg-gray-800 text-white border-gray-900'
            }`}
            title="Show or hide any configurator features, models, add-ons, walls, or solar packages from the public or clients"
          >
            {hiddenFeaturesCount > 0 ? (
              <EyeOff className="w-3.5 h-3.5 text-amber-700" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-orange-400" />
            )}
            <span>Show / Hide Features</span>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                hiddenFeaturesCount > 0
                  ? 'bg-amber-200 text-amber-950'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {hiddenFeaturesCount > 0 ? `${hiddenFeaturesCount} Hidden` : 'All Public'}
            </span>
          </button>

          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Two Currencies:</span>
          <div className="inline-flex p-1 bg-gray-100 rounded-2xl border border-gray-200">
            {TWO_CURRENCIES.map((curr) => {
              const isActive = activeCurrency === curr.code;
              return (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => handleCurrencySwitch(curr.code)}
                  className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? curr.code === 'GHS'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-black text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                  }`}
                  title={`Switch entire catalog, pricing, and all orders to single currency: ${curr.name} (${curr.symbol})`}
                >
                  <span className="font-mono">{curr.symbol}</span>
                  <span>{curr.code}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold mb-1">
            <span>Total Orders</span>
            <FileText className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-gray-950 font-mono tracking-tight">{totalOrders}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Across all models</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold mb-1">
            <span>Pipeline Value</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
            {formatCurrency(totalBookValue, activeCurrency)}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">Gross order book</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold mb-1">
            <span>Deposits Secured</span>
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-800 font-mono tracking-tight">
            {formatCurrency(totalDeposits, activeCurrency)}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">Refundable slot fees</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold mb-1">
            <span>In Production</span>
            <Building className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 font-mono tracking-tight">{inProductionCount}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Factory assembly line</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold mb-1">
            <span>Ready / Delivered</span>
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-800 font-mono tracking-tight">{readyOrDeliveredCount}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Crated & installed</div>
        </div>
      </div>

      {/* View Switcher & Follow-Up Quick Filter Bar */}
      <div className="space-y-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-3">
            <div className="inline-flex p-1 bg-gray-100 rounded-2xl border border-gray-200 shrink-0">
              <button
                type="button"
                onClick={() => handleSetViewMode('kanban')}
                className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
                title="Switch to Kanban Pipeline View to track leads and monitor payments by stage"
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span>Kanban Pipeline</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    viewMode === 'kanban' ? 'bg-orange-700 text-orange-100' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {orders.filter((o) => o.status !== 'cancelled').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSetViewMode('table')}
                className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
                title="Switch to Tabular Order List"
              >
                <List className="w-3.5 h-3.5" />
                <span>Table View</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    viewMode === 'table' ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {orders.length}
                </span>
              </button>
            </div>

            {viewMode === 'kanban' && (
              <label className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showCancelledCol}
                  onChange={(e) => setShowCancelledCol(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-gray-600">
                  Show Cancelled ({cancelledCount})
                </span>
              </label>
            )}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads, customer, phone, bank, order ID (BX-...)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-gray-900 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Cabin Model Filter & Status Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="all">All Cabin Models</option>
              <option value="studio">Studio (20ft)</option>
              <option value="one-bedroom">1-Bedroom Suite</option>
              <option value="two-bedroom">2-Bedroom Family</option>
            </select>

            {viewMode === 'table' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="all">All Statuses ({orders.length})</option>
                <option value="pending_review">Pending Review</option>
                <option value="deposit_received">Deposit Received</option>
                <option value="site_assessment">Site Assessment</option>
                <option value="in_production">In Production</option>
                <option value="quality_check">Quality Check</option>
                <option value="ready_for_dispatch">Ready for Dispatch</option>
                <option value="delivered">Delivered & Installed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            )}
          </div>
        </div>

        {/* Lead & Payment Monitoring Focus Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 pl-1">
            Focus Filter:
          </span>

          <button
            type="button"
            onClick={() => setPaymentFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              paymentFilter === 'all'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Pipeline ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setPaymentFilter('needs_followup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              paymentFilter === 'needs_followup'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
            title="Orders requiring payment follow-up: pending review, uncollected deposit or unpaid balance"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Needs Payment Follow-up</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                paymentFilter === 'needs_followup' ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'
              }`}
            >
              {needsFollowUpCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentFilter('special_requests')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              paymentFilter === 'special_requests'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
            }`}
            title="Special Model & Custom Build Requests submitted by customers"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Special Requests</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                paymentFilter === 'special_requests' ? 'bg-amber-600 text-white' : 'bg-amber-200 text-amber-950'
              }`}
            >
              {specialRequestsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentFilter('mortgage')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              paymentFilter === 'mortgage'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-indigo-500" />
            <span>Bank Mortgages</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                paymentFilter === 'mortgage' ? 'bg-indigo-700 text-white' : 'bg-indigo-200 text-indigo-900'
              }`}
            >
              {mortgageCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentFilter('gov_scheme')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              paymentFilter === 'gov_scheme'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span>Gov Housing Schemes</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                paymentFilter === 'gov_scheme' ? 'bg-emerald-700 text-white' : 'bg-emerald-200 text-emerald-900'
              }`}
            >
              {govSchemeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentFilter('milestone')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              paymentFilter === 'milestone'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <Banknote className="w-3.5 h-3.5 text-blue-500" />
            <span>Milestone Tranches</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                paymentFilter === 'milestone' ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-900'
              }`}
            >
              {milestoneCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentFilter('full')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              paymentFilter === 'full'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            <span>Full Turnkey ({fullCount})</span>
          </button>
        </div>
      </div>

      {/* VIEW RENDERER: KANBAN BOARD OR ORDERS TABLE */}
      {viewMode === 'kanban' ? (
        <div className="space-y-3">
          {/* Kanban Board Container */}
          <div className="flex gap-4 overflow-x-auto pb-6 pt-1 select-none min-h-[650px] items-start">
            {activeKanbanColumns.map((col) => {
              const colOrders = filteredOrders.filter((o) => o.status === col.key);
              const colTotalValue = colOrders.reduce((sum, o) => sum + (o.pricing.totalPrice || 0), 0);
              const isDragOver = dragOverCol === col.key;
              const IconComp = col.icon;

              return (
                <div
                  key={col.key}
                  onDragOver={(e) => handleDragOver(e, col.key)}
                  onDragLeave={() => handleDragLeave(col.key)}
                  onDrop={(e) => handleDrop(e, col.key)}
                  className={`w-80 shrink-0 flex flex-col rounded-3xl border transition-all duration-200 ${
                    isDragOver
                      ? 'border-orange-500 bg-orange-50/50 shadow-md ring-2 ring-orange-400/30'
                      : 'border-gray-200 bg-[#F8F9FB] shadow-xs'
                  }`}
                >
                  {/* Column Header */}
                  <div className="p-3.5 pb-2.5 border-b border-gray-200/80 bg-white/70 rounded-t-3xl backdrop-blur-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${col.accentBar}`} />
                        <h4 className="font-extrabold text-xs text-gray-900 tracking-tight flex items-center gap-1.5">
                          <IconComp className={`w-3.5 h-3.5 ${col.color}`} />
                          <span>{col.title}</span>
                        </h4>
                      </div>
                      <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-800 shadow-xs">
                        {colOrders.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                      <span className="truncate max-w-[170px]" title={col.description}>
                        {col.description}
                      </span>
                      <span className="font-mono font-bold text-gray-900 shrink-0">
                        {formatCurrency(colTotalValue, activeCurrency)}
                      </span>
                    </div>
                  </div>

                  {/* Cards Dropzone Area */}
                  <div className="p-2.5 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[350px]">
                    {colOrders.length === 0 ? (
                      <div className="h-44 flex flex-col items-center justify-center border-2 border-dashed border-gray-200/80 rounded-2xl text-center p-4 text-gray-400">
                        <IconComp className="w-5 h-5 mb-2 opacity-40" />
                        <p className="text-xs font-semibold">No orders in this stage</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Drag an order card here to advance stage</p>
                      </div>
                    ) : (
                      colOrders.map((order) => {
                        const financing = order.pricing?.financingDetails;
                        const isMortgage = order.pricing?.paymentOption === 'bank_mortgage';
                        const isGov = order.pricing?.paymentOption === 'gov_scheme';
                        const isMilestone = order.pricing?.paymentOption === 'milestone';
                        const depositPaid = order.pricing?.depositPaid;
                        const outstanding = Math.max(
                          0,
                          (order.pricing?.totalPrice || 0) - (depositPaid ? order.pricing?.depositDue || 250 : 0)
                        );
                        const isDragging = draggedOrderId === order.id;
                        const isEditingNote = inlineNoteOrderId === order.id;
                        const latestInternalNote = order.internalNotes?.[order.internalNotes.length - 1];

                        return (
                          <div
                            key={order.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, order.id)}
                            className={`bg-white rounded-2xl border p-3.5 shadow-xs hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing group ${
                              isDragging
                                ? 'opacity-40 scale-95 border-orange-400'
                                : 'border-gray-200/90 hover:border-orange-300'
                            }`}
                          >
                            {/* Card Top: Order ID + Model Tag */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-black text-gray-950 tracking-tight">
                                  {order.id}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyId(order.id);
                                  }}
                                  className="text-gray-400 hover:text-gray-700 p-0.5 rounded cursor-pointer transition-colors"
                                  title="Copy Order ID"
                                >
                                  {copiedId === order.id ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              {order.isSpecialRequest || order.id.startsWith('SR-') || order.customization?.modelId === 'special-request' ? (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                                  <Sparkles className="w-2.5 h-2.5 text-amber-700" />
                                  <span>Special Request</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200/60 uppercase tracking-wider">
                                  {order.customization?.modelName || 'Cabin Unit'}
                                </span>
                              )}
                            </div>

                            {/* Customer & Lead Info */}
                            <div className="mb-2.5">
                              <h5 className="font-extrabold text-xs text-gray-900 group-hover:text-orange-600 transition-colors">
                                {order.customer.fullName}
                              </h5>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                                <a
                                  href={`tel:${order.customer.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1 text-gray-600 hover:text-orange-600 hover:underline font-mono"
                                  title="Call lead directly"
                                >
                                  <PhoneCall className="w-3 h-3 text-orange-500" />
                                  <span>{order.customer.phone}</span>
                                </a>
                                <span className="text-gray-300">•</span>
                                <span
                                  className="truncate max-w-[110px]"
                                  title={order.customer.stateOrRegion || order.customer.country || 'Local Site'}
                                >
                                  {order.customer.stateOrRegion || order.customer.country || 'Site TBD'}
                                </span>
                              </div>
                            </div>

                            {/* Special Model Request Details Banner */}
                            {order.specialRequestDetails && (
                              <div className="mb-2.5 bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-200/90 rounded-xl p-2.5 text-[11px] text-amber-950 space-y-1">
                                <div className="font-black text-amber-900 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span className="truncate">Requested: {order.specialRequestDetails.requestedModelName}</span>
                                </div>
                                <div className="text-[10px] text-gray-700 flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-amber-800">{order.specialRequestDetails.requestedSeries}</span>
                                  <span>•</span>
                                  <span>{order.specialRequestDetails.desiredDimensions}</span>
                                </div>
                                {order.specialRequestDetails.customRequirements && (
                                  <div className="text-[10px] text-gray-600 italic line-clamp-2 pt-0.5 border-t border-amber-200/60">
                                    "{order.specialRequestDetails.customRequirements}"
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Payment & Financing Tracking Box */}
                            <div className="bg-[#F8F9FA] rounded-xl p-2.5 border border-gray-200/70 mb-2.5 space-y-1.5">
                              {/* Financing Method Badge */}
                              <div className="flex items-center justify-between gap-1 text-[11px]">
                                {isMortgage && (
                                  <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 rounded-md truncate max-w-[170px]">
                                    <Landmark className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{financing?.providerName || 'Bank Mortgage'}</span>
                                  </span>
                                )}
                                {isGov && (
                                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md truncate max-w-[170px]">
                                    <Award className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{financing?.schemeName || 'Gov Housing Scheme'}</span>
                                  </span>
                                )}
                                {isMilestone && (
                                  <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-md">
                                    <Banknote className="w-3 h-3 shrink-0" />
                                    <span>Milestone (4-Tranche)</span>
                                  </span>
                                )}
                                {!isMortgage && !isGov && !isMilestone && (
                                  <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 border border-purple-200/70 px-2 py-0.5 rounded-md">
                                    <DollarSign className="w-3 h-3 shrink-0" />
                                    <span>100% Upfront Turnkey</span>
                                  </span>
                                )}

                                {/* Deposit Paid Badge */}
                                {depositPaid ? (
                                  <span className="font-mono text-[10px] font-extrabold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded shrink-0">
                                    Deposit Secured
                                  </span>
                                ) : (
                                  <span className="font-mono text-[10px] font-extrabold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded shrink-0 animate-pulse">
                                    Deposit Due
                                  </span>
                                )}
                              </div>

                              {/* Amount Breakdown */}
                              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60 font-mono">
                                <div>
                                  <span className="text-[10px] text-gray-400 block font-sans">Total Contract</span>
                                  <span className="font-extrabold text-gray-900">
                                    {formatCurrency(order.pricing.totalPrice, activeCurrency)}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-gray-400 block font-sans">Outstanding</span>
                                  <span className="font-extrabold text-orange-700">
                                    {formatCurrency(outstanding, activeCurrency)}
                                  </span>
                                </div>
                              </div>

                              {/* Mortgage / Gov Scheme Sub-details if applicable */}
                              {isMortgage && financing?.estimatedMonthlyPayment && (
                                <div className="text-[10px] text-indigo-900/80 bg-indigo-50/60 rounded p-1 flex items-center justify-between">
                                  <span>Est. Monthly:</span>
                                  <span className="font-mono font-bold">
                                    {formatCurrency(financing.estimatedMonthlyPayment, activeCurrency)}/mo (
                                    {financing.tenureYears || 15}y)
                                  </span>
                                </div>
                              )}

                              {isGov && financing?.schemeName && (
                                <div className="text-[10px] text-emerald-900/80 bg-emerald-50/60 rounded p-1 flex items-center justify-between">
                                  <span>Gov Support:</span>
                                  <span className="font-mono font-bold text-emerald-700">
                                    Subsidized Rate ({financing.tenureYears || 20}y)
                                  </span>
                                </div>
                              )}

                              {/* Milestone 4-tranche progress dots */}
                              {isMilestone && order.pricing?.paymentMilestones && (
                                <div className="pt-1 border-t border-gray-200/50">
                                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                                    <span>Milestones:</span>
                                    <span className="font-mono text-gray-600">
                                      {order.pricing.paymentMilestones.filter((m) => m.status === 'paid').length}/4 Paid
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-4 gap-1">
                                    {order.pricing.paymentMilestones.map((ms, idx) => (
                                      <div
                                        key={ms.id || idx}
                                        className={`h-1.5 rounded-full transition-colors ${
                                          ms.status === 'paid'
                                            ? 'bg-emerald-500'
                                            : ms.status === 'due_now'
                                            ? 'bg-amber-500 animate-pulse'
                                            : 'bg-gray-200'
                                        }`}
                                        title={`${ms.title}: ${ms.status}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* CRM Follow-up Note & Inline Logger */}
                            <div className="mb-2.5">
                              {latestInternalNote ? (
                                <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 flex items-start gap-1.5 mb-1.5">
                                  <MessageSquare className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                                  <div className="line-clamp-2 italic">
                                    "{latestInternalNote.text}"
                                    <span className="text-[9px] text-amber-700/70 block not-italic font-mono mt-0.5">
                                      — {latestInternalNote.author} ({new Date(latestInternalNote.createdAt).toLocaleDateString()})
                                    </span>
                                  </div>
                                </div>
                              ) : null}

                              {isEditingNote ? (
                                <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                                  <textarea
                                    value={inlineNoteText}
                                    onChange={(e) => setInlineNoteText(e.target.value)}
                                    placeholder="Add payment / lead follow-up note (e.g. called customer, bank pre-approval verified)..."
                                    rows={2}
                                    className="w-full text-xs p-2 rounded-xl border border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                                    autoFocus
                                  />
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setInlineNoteOrderId(null);
                                        setInlineNoteText('');
                                      }}
                                      className="px-2 py-1 text-[10px] font-bold text-gray-500 hover:text-gray-700 rounded cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveInlineNote(order.id)}
                                      className="px-2.5 py-1 text-[10px] font-black bg-orange-600 hover:bg-orange-500 text-white rounded-lg shadow-xs cursor-pointer"
                                    >
                                      Save Note
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between text-[11px]">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInlineNoteOrderId(order.id);
                                      setInlineNoteText('');
                                    }}
                                    className="text-gray-400 hover:text-gray-700 flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Edit className="w-3 h-3 text-orange-500" />
                                    <span>+ Add CRM Follow-up Note</span>
                                  </button>

                                  <span className="text-[10px] text-gray-400 font-mono">
                                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Card Footer: Fast Stage Movement & Dossier Access */}
                            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1.5">
                              {/* Stage movement arrows */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRetreatStatus(order.id, order.status);
                                  }}
                                  disabled={col.key === 'pending_review'}
                                  className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                                  title="Move to previous pipeline stage"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAdvanceStatus(order.id, order.status);
                                  }}
                                  disabled={col.key === 'delivered' || col.key === 'cancelled'}
                                  className="p-1 text-orange-600 hover:text-white hover:bg-orange-600 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer border border-orange-200 hover:border-orange-600"
                                  title="Advance to next pipeline stage"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Direct Jump Selector */}
                              <select
                                value={order.status}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleQuickStatusChange(order.id, e.target.value as OrderStatus);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] font-bold bg-gray-50 border border-gray-200 rounded-lg px-1.5 py-1 text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 max-w-[105px] truncate"
                              >
                                <option value="pending_review">1. Review</option>
                                <option value="deposit_received">2. Deposit</option>
                                <option value="site_assessment">3. Site</option>
                                <option value="in_production">4. Build</option>
                                <option value="quality_check">5. QA</option>
                                <option value="ready_for_dispatch">6. Dispatch</option>
                                <option value="delivered">7. Installed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>

                              {/* Inspect Full Dossier */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                }}
                                className="px-2 py-1 text-[10px] font-extrabold text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-gray-200"
                                title="Open Full Work Order Dossier"
                              >
                                <Eye className="w-3 h-3 text-orange-600" />
                                <span>Dossier</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">No orders match your filter</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try adjusting your search criteria or reset filters to display all customer records.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setModelFilter('all');
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFAFC] border-b border-gray-200 text-gray-500 uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="py-3.5 px-4 font-bold">Order ID</th>
                  <th className="py-3.5 px-4 font-bold">Date</th>
                  <th className="py-3.5 px-4 font-bold">Customer</th>
                  <th className="py-3.5 px-4 font-bold">Cabin Model & Finish</th>
                  <th className="py-3.5 px-4 font-bold">Total / Deposit</th>
                  <th className="py-3.5 px-4 font-bold">Status Pipeline</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_review;
                  const StatusIcon = statusInfo.icon;
                  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order ID */}
                      <td className="py-4 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {order.id}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyId(order.id);
                            }}
                            className="p-1 text-gray-300 hover:text-gray-700 rounded-md transition-colors"
                            title="Copy Order ID"
                          >
                            {copiedId === order.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-800 font-black text-[11px] flex items-center justify-center shrink-0">
                            {order.customer.fullName.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 leading-tight">
                              {order.customer.fullName}
                            </div>
                            <div className="text-[11px] text-gray-500 font-mono flex items-center gap-2 mt-0.5">
                              <span>{order.customer.phone}</span>
                              <span className="text-gray-300">•</span>
                              <span>Zip: {order.customer.zipCode}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cabin Model */}
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-extrabold text-gray-900 block leading-tight flex items-center gap-1.5 flex-wrap">
                            <span>{order.customization.modelName}</span>
                            {(order.isSpecialRequest || order.id.startsWith('SR-') || order.customization.modelId === 'special-request') && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                ⭐ Special Request
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500">
                            {order.customization.wallCladdingColor && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0 inline-block"
                                style={{ backgroundColor: order.customization.wallCladdingColor }}
                              />
                            )}
                            <span className="truncate max-w-[140px] text-gray-600">
                              {order.customization.wallCladdingName}
                            </span>
                            {order.customization.addonsList?.length > 0 && (
                              <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                                +{order.customization.addonsList.length} upgrades
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Price / Deposit */}
                      <td className="py-4 px-4 font-mono">
                        <div className="font-extrabold text-gray-950">
                          {formatCurrency(order.pricing.totalPrice, activeCurrency)}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>
                            {formatCurrency(order.pricing.depositDue, activeCurrency)} Deposit Paid
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-sans font-bold ${
                            order.pricing.paymentOption === 'full'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : order.pricing.paymentOption === 'bank_mortgage'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : order.pricing.paymentOption === 'gov_scheme'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}>
                            <CreditCard className="w-2.5 h-2.5" />
                            <span>
                              {order.pricing.paymentOption === 'full'
                                ? 'Full Turnkey'
                                : order.pricing.paymentOption === 'bank_mortgage'
                                ? `Bank Mortgage (${order.pricing.financingDetails?.providerName?.split(' ')[0] || 'Bank'})`
                                : order.pricing.paymentOption === 'gov_scheme'
                                ? 'Gov Scheme (NHF)'
                                : 'Milestone (4 Tranches)'}
                            </span>
                          </span>
                        </div>
                      </td>

                      {/* Status Dropdown / Pill */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            onChange={(e) => handleQuickStatusChange(order.id, e.target.value as OrderStatus)}
                            className={`text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl border appearance-none pr-7 cursor-pointer transition-all ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                          >
                            <option value="pending_review">Pending Review</option>
                            <option value="deposit_received">Deposit Received</option>
                            <option value="site_assessment">Site Assessment</option>
                            <option value="in_production">In Production</option>
                            <option value="quality_check">Quality Check</option>
                            <option value="ready_for_dispatch">Ready for Dispatch</option>
                            <option value="delivered">Delivered & Installed</option>
                            <option value="cancelled">Cancelled / Refunded</option>
                          </select>
                          <ChevronRight className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
                        </div>
                        {/* Progress level bar */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="w-14 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-orange-500 h-full rounded-full transition-all"
                              style={{ width: `${order.progress?.progressPercent ?? 25}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-gray-500">
                            {order.progress?.progressPercent ?? 25}%
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setDossierTab('progress');
                            }}
                            className="p-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer border border-orange-200 flex items-center gap-1"
                            title="Manage Factory Progress & Live Sync"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold hidden xl:inline">Progress</span>
                          </button>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-gray-500 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="Inspect Complete Order Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete / Cancel Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-[#FAFAFC] border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>
            Showing <span className="font-bold text-gray-900">{filteredOrders.length}</span> of{' '}
            <span className="font-bold text-gray-900">{orders.length}</span> total orders
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-time local state synchronization active</span>
          </div>
        </div>
      </div>
      )}

      {/* ORDER INSPECTION DRAWER / MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full border border-gray-200 shadow-2xl overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#FAFAFC] border-b border-gray-200 p-4 sm:p-5 flex items-center justify-between shrink-0 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base tracking-tight text-gray-950">
                      Work Order Dossier: {selectedOrder.id}
                    </h3>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        STATUS_CONFIG[selectedOrder.status]?.bg
                      } ${STATUS_CONFIG[selectedOrder.status]?.text} ${
                        STATUS_CONFIG[selectedOrder.status]?.border
                      }`}
                    >
                      {STATUS_CONFIG[selectedOrder.status]?.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()} • Target Delivery:{' '}
                    <span className="font-bold font-mono text-gray-800">
                      {selectedOrder.estimatedDeliveryDate || 'TBD'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap no-print">
                {/* PDF Download Action Button */}
                <button
                  type="button"
                  onClick={handleDownloadWorkOrderPDF}
                  disabled={isExportingPDF}
                  className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  title="Download complete high-detail engineering work order with line drawings as PDF"
                >
                  {isExportingPDF ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF Work Order</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrintSpecSheet}
                  className="p-2 text-gray-600 hover:text-gray-950 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200"
                  title="Print Spec Sheet / Blueprint"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Dossier View Mode Tabs */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 gap-3 flex-wrap no-print">
                <div className="inline-flex p-1 bg-gray-100 rounded-2xl border border-gray-200 flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setDossierTab('visual')}
                    className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                      dossierTab === 'visual'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Eye className="w-4 h-4 text-white" />
                    <span>🏠 3D Visual House &amp; Customizations</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDossierTab('work_order')}
                    className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                      dossierTab === 'work_order'
                        ? 'bg-black text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Compass className="w-4 h-4 text-orange-400" />
                    <span>📐 Technical Work Order &amp; Blueprint</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDossierTab('crm')}
                    className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                      dossierTab === 'crm'
                        ? 'bg-black text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-orange-400" />
                    <span>📋 Pipeline &amp; CRM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDossierTab('progress')}
                    className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                      dossierTab === 'progress'
                        ? 'bg-black text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Activity className="w-4 h-4 text-orange-400" />
                    <span>🏗️ Factory Progress &amp; Live Sync</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-gray-500 hidden sm:block">
                  {dossierTab === 'visual'
                    ? 'Interactive 3D model inspection & factory customization work packages'
                    : dossierTab === 'work_order'
                    ? 'All measures, CAD drawings, foundation grid & MEP included'
                    : 'Customer communication, milestone timeline & financial ledger'}
                </div>
              </div>

              {/* TAB 0 (NEW): 3D VISUAL HOUSE & CUSTOMIZATIONS INSPECTION */}
              {dossierTab === 'visual' && (() => {
                const modelSpec =
                  BASE_MODELS.find((m) => m.id === selectedOrder.customization.modelId) || BASE_MODELS[0];
                const galleryImages =
                  modelSpec?.gallery && modelSpec.gallery.length > 0
                    ? modelSpec.gallery
                    : modelSpec?.image
                    ? [modelSpec.image]
                    : [];

                const qcKeys = [
                  'qc_envelope',
                  'qc_glazing',
                  'qc_roof',
                  'qc_flooring',
                  'qc_cabinetry',
                  'qc_mep_electrical',
                  'qc_lighting',
                  'qc_addons',
                ];
                const verifiedCount = qcKeys.filter((k) => qcCheckedItems[k]).length;
                const totalQc = qcKeys.length;
                const qcPercent = Math.round((verifiedCount / totalQc) * 100);

                return (
                  <div className="space-y-6">
                    {/* Visual Stage & Model Showcase Card */}
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs space-y-4 p-5 sm:p-6">
                      {/* Model Title & Quick Action Bar */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
                              {modelSpec.series || 'PREFAB'} SERIES
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gray-100 text-gray-700">
                              SKU: {selectedOrder.customization.modelId.toUpperCase()}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {modelSpec.dimensions?.metricStr || `${modelSpec.dimensions?.lengthFt}' × ${modelSpec.dimensions?.widthFt}'`}
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-black text-gray-950 flex items-center gap-2">
                            <span>{selectedOrder.customization.modelName || modelSpec.name}</span>
                          </h3>
                          <p className="text-xs text-gray-500">
                            Customized for client{' '}
                            <span className="font-bold text-gray-900">{selectedOrder.customer.fullName}</span>{' '}
                            • Delivery to {selectedOrder.customer.deliveryAddress || 'Site TBD'}
                          </p>
                        </div>

                        {/* Top Controls: View Mode Switcher & Configurator Launcher */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200">
                            <button
                              type="button"
                              onClick={() => setVisualSubView('3d')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                visualSubView === '3d'
                                  ? 'bg-white text-gray-900 shadow-xs'
                                  : 'text-gray-500 hover:text-gray-900'
                              }`}
                            >
                              <Box className="w-3.5 h-3.5 text-orange-600" />
                              <span>3D Interactive</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setVisualSubView('blueprints')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                visualSubView === 'blueprints'
                                  ? 'bg-white text-gray-900 shadow-xs'
                                  : 'text-gray-500 hover:text-gray-900'
                              }`}
                            >
                              <Compass className="w-3.5 h-3.5 text-blue-600" />
                              <span>CAD Elevations</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setVisualSubView('gallery')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                visualSubView === 'gallery'
                                  ? 'bg-white text-gray-900 shadow-xs'
                                  : 'text-gray-500 hover:text-gray-900'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Photo Gallery</span>
                            </button>
                          </div>

                          <a
                            href={`/configurator?model=${selectedOrder.customization.modelId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            title="Launch this house build in the live 3D Configurator in a new window"
                          >
                            <Maximize2 className="w-3.5 h-3.5 text-orange-400" />
                            <span>Full 3D Configurator</span>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </a>
                        </div>
                      </div>

                      {/* SUB-VIEW 1: LIVE 3D INTERACTIVE HOUSE VIEWER */}
                      {visualSubView === '3d' && (
                        <div className="space-y-3">
                          <div className="relative w-full h-[460px] sm:h-[520px] rounded-2xl overflow-hidden border border-gray-300 bg-gray-950 shadow-md">
                            {visualCustomizationState && (
                              <ThreeViewer
                                state={visualCustomizationState}
                                onStateChange={() => {}}
                                lightingMode={visualLighting}
                                onLightingModeChange={setVisualLighting}
                                onSelectCategory={() => {}}
                                roofLiftPercent={visualRoofLift}
                                onRoofLiftChange={setVisualRoofLift}
                                roofRemoved={visualRoofRemoved}
                                onRoofRemovedToggle={() => setVisualRoofRemoved(!visualRoofRemoved)}
                                cutawayMode={visualCutawayMode}
                                onCutawayModeToggle={() => setVisualCutawayMode(!visualCutawayMode)}
                                currentPerspective={visualPerspective}
                                onPerspectiveChange={setVisualPerspective}
                                config={config}
                                isAdvancedMode={false}
                              />
                            )}

                            {/* Floating Perspective Bar */}
                            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1.5 rounded-xl border border-white/10 text-white text-[11px]">
                              <span className="text-gray-400 font-mono text-[10px] px-1 hidden sm:inline">Camera:</span>
                              <button
                                type="button"
                                onClick={() => setVisualPerspective('front-3-4')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                  visualPerspective === 'front-3-4'
                                    ? 'bg-orange-600 text-white shadow-xs'
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                              >
                                3/4 Isometric
                              </button>
                              <button
                                type="button"
                                onClick={() => setVisualPerspective('front-elevation')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                  visualPerspective === 'front-elevation'
                                    ? 'bg-orange-600 text-white shadow-xs'
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                              >
                                Front Facade
                              </button>
                              <button
                                type="button"
                                onClick={() => setVisualPerspective('side-elevation')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                  visualPerspective === 'side-elevation'
                                    ? 'bg-orange-600 text-white shadow-xs'
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                              >
                                Side Profile
                              </button>
                              <button
                                type="button"
                                onClick={() => setVisualPerspective('top-down-floorplan')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                  visualPerspective === 'top-down-floorplan'
                                    ? 'bg-orange-600 text-white shadow-xs'
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                              >
                                Top Floorplan
                              </button>
                            </div>

                            {/* Floating Lighting Mode */}
                            <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-black/75 backdrop-blur-md p-1.5 rounded-xl border border-white/10 text-white text-[11px]">
                              <button
                                type="button"
                                onClick={() => setVisualLighting('daylight')}
                                className={`px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                  visualLighting === 'daylight'
                                    ? 'bg-amber-500 text-black shadow-xs'
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                                title="Daylight Lighting"
                              >
                                <Sun className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Day</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setVisualLighting('golden-hour')}
                                className={`px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                  visualLighting === 'golden-hour'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                                title="Golden Hour Lighting"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Sunset</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setVisualLighting('night-ambient')}
                                className={`px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                  visualLighting === 'night-ambient'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                                title="Night Interior Glow"
                              >
                                <Moon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Night</span>
                              </button>
                            </div>

                            {/* Bottom Floating Roof & Cutaway Controls Bar */}
                            <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-3 bg-black/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-white text-xs flex-wrap">
                              <div className="flex items-center gap-3 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => setVisualRoofRemoved(!visualRoofRemoved)}
                                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    visualRoofRemoved
                                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                                      : 'bg-white/10 text-gray-200 hover:bg-white/20'
                                  }`}
                                >
                                  <Layers className="w-3.5 h-3.5" />
                                  <span>{visualRoofRemoved ? 'Roof Removed (Interior Exposed)' : 'Remove Roof'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setVisualCutawayMode(!visualCutawayMode)}
                                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    visualCutawayMode
                                      ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                      : 'bg-white/10 text-gray-200 hover:bg-white/20'
                                  }`}
                                >
                                  <span>{visualCutawayMode ? 'Wall Cutaway Active' : 'Front Cutaway'}</span>
                                </button>

                                {/* Roof Lift Slider */}
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
                                  <span className="text-[11px] text-gray-400">Roof Lift:</span>
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={visualRoofLift}
                                    onChange={(e) => setVisualRoofLift(Number(e.target.value))}
                                    className="w-24 sm:w-32 accent-orange-500 cursor-pointer"
                                  />
                                  <span className="text-[11px] font-mono text-orange-400 font-bold min-w-8">
                                    {visualRoofLift}%
                                  </span>
                                </div>
                              </div>

                              <div className="text-[10px] text-gray-400 hidden md:flex items-center gap-1">
                                <Info className="w-3 h-3 text-gray-400" />
                                <span>Drag to rotate • Scroll to zoom • Inspect room furniture &amp; pods</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUB-VIEW 2: CAD ARCHITECTURAL ELEVATIONS & BLUEPRINTS */}
                      {visualSubView === 'blueprints' && (
                        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white p-3 sm:p-5">
                          <ProductLineDrawing
                            modelId={selectedOrder.customization.modelId}
                            modelName={selectedOrder.customization.modelName || modelSpec.name}
                            floorPlanId={selectedOrder.customization.floorPlan || selectedOrder.customization.floorPlanId}
                            customization={selectedOrder.customization}
                            initialView="all"
                            compact={false}
                          />
                        </div>
                      )}

                      {/* SUB-VIEW 3: HIGH-RES PHOTO GALLERY */}
                      {visualSubView === 'gallery' && (
                        <div className="space-y-4">
                          {galleryImages.length > 0 ? (
                            <div className="space-y-3">
                              <div className="relative aspect-16/9 sm:aspect-21/9 rounded-2xl overflow-hidden bg-gray-900 border border-gray-200">
                                <img
                                  src={galleryImages[activeGalleryIndex] || galleryImages[0]}
                                  alt={selectedOrder.customization.modelName}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs font-mono font-bold">
                                  Photo {activeGalleryIndex + 1} of {galleryImages.length}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                {galleryImages.map((img, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveGalleryIndex(idx)}
                                    className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                                      activeGalleryIndex === idx
                                        ? 'border-orange-600 ring-2 ring-orange-200 scale-102'
                                        : 'border-gray-200 opacity-60 hover:opacity-100'
                                    }`}
                                  >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-2xl">
                              No photo renders uploaded for this model. Switch to 3D Interactive or CAD Drawings view.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Architecture & Engineering Footprint Specs Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                            Usable Footprint
                          </span>
                          <span className="text-sm font-black text-gray-900 block font-mono">
                            {modelSpec.sqft || 400} sq ft ({modelSpec.areaM2 || 37} m²)
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {modelSpec.bedrooms || 1} Bed • {modelSpec.bathrooms || 1} Bath
                          </span>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                            Exterior Dimensions
                          </span>
                          <span className="text-xs font-bold text-gray-900 block font-mono">
                            {modelSpec.dimensions?.lengthFt || 20}'L × {modelSpec.dimensions?.widthFt || 20}'W × {modelSpec.dimensions?.heightFt || 8.5}'H
                          </span>
                          <span className="text-[10px] text-gray-500 truncate block">
                            {modelSpec.dimensions?.metricStr || 'Standard modular footprint'}
                          </span>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                            Frame &amp; Tare Weight
                          </span>
                          <span className="text-xs font-bold text-gray-900 block font-mono">
                            {modelSpec.weightKg ? `${modelSpec.weightKg.toLocaleString()} kg` : 'Heavy Galvanized Q235'}
                          </span>
                          <span className="text-[10px] text-gray-500 block">
                            Q235 Hot-Dip Galvanized
                          </span>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                            Shipping Container
                          </span>
                          <span className="text-xs font-bold text-emerald-700 block font-mono flex items-center gap-1">
                            <Ship className="w-3.5 h-3.5" />
                            <span>1× 40HQ Sea Container</span>
                          </span>
                          <span className="text-[10px] text-gray-500 block">
                            Factory folded &amp; pallet secured
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2. CUSTOMIZATIONS TO BE DONE: PRODUCTION WORK PACKAGES & QC CHECKLIST */}
                    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs p-5 sm:p-6 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-orange-600" />
                            <h4 className="text-base font-black text-gray-900">
                              Customizations To Be Done (Factory Work Packages)
                            </h4>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Verify each customer-selected customization, material finish, and modular pod before factory sign-off.
                          </p>
                        </div>

                        {/* QC Completion Tracker & Toggle Buttons */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[11px] font-bold text-gray-700 block">
                              QC Readiness: <span className="text-orange-600 font-mono">{verifiedCount}/{totalQc}</span> ({qcPercent}%)
                            </span>
                            <div className="w-28 h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  qcPercent === 100 ? 'bg-emerald-500' : 'bg-orange-500'
                                }`}
                                style={{ width: `${qcPercent}%` }}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleMarkAllQc(verifiedCount < totalQc)}
                            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer shrink-0"
                          >
                            {verifiedCount < totalQc ? 'Verify All (QC Pass)' : 'Reset QC'}
                          </button>
                        </div>
                      </div>

                      {/* 6 Structured Production Work Packages Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Package 1: Exterior Cladding & Color */}
                        <div
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                            qcCheckedItems['qc_envelope']
                              ? 'bg-emerald-50/40 border-emerald-200 ring-1 ring-emerald-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                                01 • Envelope &amp; Facade
                              </span>
                              {qcCheckedItems['qc_envelope'] ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                  Needs Prep
                                </span>
                              )}
                            </div>

                            <div className="space-y-1">
                              <span className="text-xs text-gray-500 font-medium">Selected Wall Cladding:</span>
                              <div className="text-sm font-extrabold text-gray-900">
                                {selectedOrder.customization.wallCladdingName || 'Wood Grain Embossed Composite'}
                              </div>
                            </div>

                            {/* Color Swatch Preview */}
                            <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-200">
                              <div
                                className="w-8 h-8 rounded-lg shadow-inner border border-black/10 shrink-0"
                                style={{
                                  backgroundColor: selectedOrder.customization.wallCladdingColor || '#c2a68c',
                                }}
                              />
                              <div className="text-[11px]">
                                <span className="font-bold text-gray-800 block">
                                  Color: {selectedOrder.customization.wallCladdingColor || '#c2a68c'}
                                </span>
                                <span className="text-gray-500 text-[10px]">
                                  Fluorocarbon Anti-UV Coating
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              75mm/100mm fireproof polyurethane / EPS sandwich insulation core (R-30 rating), water-resistant perimeter flashings.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleQcItem('qc_envelope')}
                            className={`mt-3 w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              qcCheckedItems['qc_envelope']
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {qcCheckedItems['qc_envelope'] ? (
                              <>
                                <CheckSquare className="w-4 h-4" />
                                <span>Envelope Specs Verified</span>
                              </>
                            ) : (
                              <>
                                <Square className="w-4 h-4 text-gray-400" />
                                <span>Mark Envelope Inspected</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Package 2: Glazing & Openings */}
                        <div
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                            qcCheckedItems['qc_glazing']
                              ? 'bg-emerald-50/40 border-emerald-200 ring-1 ring-emerald-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                02 • Fenestration &amp; Glazing
                              </span>
                              {qcCheckedItems['qc_glazing'] ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                  Needs Prep
                                </span>
                              )}
                            </div>

                            <div className="space-y-1">
                              <span className="text-xs text-gray-500 font-medium">Selected Door &amp; Window System:</span>
                              <div className="text-sm font-extrabold text-gray-900">
                                {selectedOrder.customization.glazingName || 'Broken-Bridge Aluminum Sliding Doors'}
                              </div>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-[11px] space-y-1">
                              <div className="flex justify-between text-gray-700">
                                <span>Glass Spec:</span>
                                <span className="font-bold">5mm+12A+5mm Tempered Low-E</span>
                              </div>
                              <div className="flex justify-between text-gray-700">
                                <span>Frame:</span>
                                <span className="font-bold">Thermal-Break Architectural Black</span>
                              </div>
                              <div className="flex justify-between text-gray-700">
                                <span>Sound Rating:</span>
                                <span className="font-bold text-emerald-700">STC 38 dB Acoustic</span>
                              </div>
                            </div>

                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              Double casement side windows with built-in stainless fly-screens and heavy-duty sliding locks.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleQcItem('qc_glazing')}
                            className={`mt-3 w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              qcCheckedItems['qc_glazing']
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {qcCheckedItems['qc_glazing'] ? (
                              <>
                                <CheckSquare className="w-4 h-4" />
                                <span>Glazing Installed &amp; Sealed</span>
                              </>
                            ) : (
                              <>
                                <Square className="w-4 h-4 text-gray-400" />
                                <span>Mark Glazing Inspected</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Package 3: Roof Architecture */}
                        <div
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                            qcCheckedItems['qc_roof']
                              ? 'bg-emerald-50/40 border-emerald-200 ring-1 ring-emerald-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                                03 • Roofing &amp; Drainage
                              </span>
                              {qcCheckedItems['qc_roof'] ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                  Needs Prep
                                </span>
                              )}
                            </div>

                            <div className="space-y-1">
                              <span className="text-xs text-gray-500 font-medium">Selected Roof Profile:</span>
                              <div className="text-sm font-extrabold text-gray-900">
                                {selectedOrder.customization.roofName || 'Factory Standard Standing Seam Roof'}
                              </div>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-[11px] space-y-1">
                              <div className="flex justify-between text-gray-700">
                                <span>Drainage:</span>
                                <span className="font-bold">Internal Concealed Downspouts</span>
                              </div>
                              <div className="flex justify-between text-gray-700">
                                <span>Insulation:</span>
                                <span className="font-bold">100mm Glass Wool + Waterproof Membrane</span>
                              </div>
                              <div className="flex justify-between text-gray-700">
                                <span>Solar Prep:</span>
                                <span className="font-bold text-indigo-700">PV Mounting Brackets Ready</span>
                              </div>
                            </div>

                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              Snow-load tested to 1.8 kN/m² with dual continuous rubber seals at all expansion joints.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleQcItem('qc_roof')}
                            className={`mt-3 w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              qcCheckedItems['qc_roof']
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {qcCheckedItems['qc_roof'] ? (
                              <>
                                <CheckSquare className="w-4 h-4" />
                                <span>Roof Weatherproof Verified</span>
                              </>
                            ) : (
                              <>
                                <Square className="w-4 h-4 text-gray-400" />
                                <span>Mark Roof Inspected</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Package 4: Interior Flooring & Millwork */}
                        <div
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                            qcCheckedItems['qc_flooring']
                              ? 'bg-emerald-50/40 border-emerald-200 ring-1 ring-emerald-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                04 • Flooring &amp; Millwork
                              </span>
                              {qcCheckedItems['qc_flooring'] ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                  Needs Prep
                                </span>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Flooring Selection:</span>
                                <div className="text-xs font-extrabold text-gray-900">
                                  {selectedOrder.customization.flooringName || 'Nordic Pale Oak SPC Plank'}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Cabinetry Package:</span>
                                <div className="text-xs font-extrabold text-gray-900">
                                  {selectedOrder.customization.cabinetryName || 'Melamine Flat Panel E0 Grade'}
                                </div>
                              </div>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-[11px] space-y-1">
                              <div className="flex justify-between text-gray-700">
                                <span>Plank Core:</span>
                                <span className="font-bold">6.5mm Rigid Core + IXPE Pad</span>
                              </div>
                              <div className="flex justify-between text-gray-700">
                                <span>Subfloor:</span>
                                <span className="font-bold">18mm Fireproof MGO Board</span>
                              </div>
                            </div>

                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              Zero formaldehyde emission, waterproof click-lock assembly, and soft-close Blum hinges.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleQcItem('qc_flooring')}
                            className={`mt-3 w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              qcCheckedItems['qc_flooring']
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {qcCheckedItems['qc_flooring'] ? (
                              <>
                                <CheckSquare className="w-4 h-4" />
                                <span>Flooring &amp; Millwork QC Passed</span>
                              </>
                            ) : (
                              <>
                                <Square className="w-4 h-4 text-gray-400" />
                                <span>Mark Flooring Inspected</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Package 5: MEP & Architectural Lighting */}
                        <div
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                            qcCheckedItems['qc_mep_electrical']
                              ? 'bg-emerald-50/40 border-emerald-200 ring-1 ring-emerald-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                                05 • Electrical &amp; MEP
                              </span>
                              {qcCheckedItems['qc_mep_electrical'] ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                  Needs Prep
                                </span>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Electrical Center:</span>
                                <div className="text-xs font-extrabold text-gray-900">
                                  {selectedOrder.customization.electricalName || 'Smart IoT 200A Distribution Panel'}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500 font-medium">Lighting Scheme:</span>
                                <div className="text-xs font-extrabold text-gray-900">
                                  {selectedOrder.customization.lightingName || 'Standard Recessed LED Downlights'}
                                </div>
                              </div>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-[11px] space-y-1">
                              <div className="flex justify-between text-gray-700">
                                <span>Voltage Tier:</span>
                                <span className="font-bold">110V / 220V Dual Compatible</span>
                              </div>
                              <div className="flex justify-between text-gray-700">
                                <span>Safety Breakers:</span>
                                <span className="font-bold">GFCI &amp; AFCI Certified</span>
                              </div>
                            </div>

                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              Pre-wired copper conduits with labeled breaker circuits and exterior waterproof disconnect switch.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleQcItem('qc_mep_electrical')}
                            className={`mt-3 w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              qcCheckedItems['qc_mep_electrical']
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {qcCheckedItems['qc_mep_electrical'] ? (
                              <>
                                <CheckSquare className="w-4 h-4" />
                                <span>Electrical Load Tested</span>
                              </>
                            ) : (
                              <>
                                <Square className="w-4 h-4 text-gray-400" />
                                <span>Mark Electrical Inspected</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Package 6: Modular Add-on Pods & Equipment */}
                        <div
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                            qcCheckedItems['qc_addons']
                              ? 'bg-emerald-50/40 border-emerald-200 ring-1 ring-emerald-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                06 • Modular Add-On Pods
                              </span>
                              {qcCheckedItems['qc_addons'] ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                  Needs Prep
                                </span>
                              )}
                            </div>

                            <span className="text-xs text-gray-500 font-medium block">
                              Selected Factory Add-Ons ({selectedOrder.customization.addonsList?.length || 0}):
                            </span>

                            {selectedOrder.customization.addonsList && selectedOrder.customization.addonsList.length > 0 ? (
                              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                {selectedOrder.customization.addonsList.map((addon, aIdx) => (
                                  <div
                                    key={aIdx}
                                    className="p-2 bg-white rounded-xl border border-gray-200 text-xs font-bold text-gray-900 flex items-center gap-2"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                    <span className="truncate">{addon}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-3 bg-white rounded-xl border border-gray-200 text-gray-500 text-xs italic">
                                Standard baseline package — no optional add-on pods selected for this build.
                              </div>
                            )}

                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              Pods are pre-plumbed, tested under 80 PSI hydrostatic water pressure, and bolted with ISO twistlocks.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleQcItem('qc_addons')}
                            className={`mt-3 w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              qcCheckedItems['qc_addons']
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {qcCheckedItems['qc_addons'] ? (
                              <>
                                <CheckSquare className="w-4 h-4" />
                                <span>All Modular Pods Verified</span>
                              </>
                            ) : (
                              <>
                                <Square className="w-4 h-4 text-gray-400" />
                                <span>Mark Add-On Pods Inspected</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Order Context & Financial Snapshot Footer */}
                      <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-gray-50/70 p-4 rounded-2xl">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                              Total Order Value
                            </span>
                            <span className="text-base font-black text-gray-950 font-mono">
                              {formatCurrency(selectedOrder.pricing.totalPrice, activeCurrency)}
                            </span>
                          </div>

                          <div className="h-8 w-px bg-gray-200 hidden sm:block" />

                          <div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                              Payment Structure
                            </span>
                            <span className="font-extrabold text-orange-600 flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>
                                {selectedOrder.paymentOption === 'milestone'
                                  ? 'Milestone Payments (House / Freight / Clearance / Installation)'
                                  : 'Full Single Payment'}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDossierTab('work_order')}
                            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Compass className="w-3.5 h-3.5 text-orange-400" />
                            <span>View Engineering CAD Sheet</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 1: DETAILED TECHNICAL WORK ORDER & BLUEPRINT */}
              {dossierTab === 'work_order' && (
                <div ref={printableWorkOrderRef} className="print:p-0">
                  <OrderWorkOrderSheet
                    order={selectedOrder}
                    activeCurrency={activeCurrency}
                    onPrint={handlePrintSpecSheet}
                    onDownloadPDF={handleDownloadWorkOrderPDF}
                    isDownloadingPDF={isExportingPDF}
                  />
                </div>
              )}

              {/* TAB 2: PIPELINE LOGISTICS & CRM */}
              {dossierTab === 'crm' && (
                <div className="space-y-6">
                  {/* Interactive Pipeline Stepper */}
                  <div className="p-4 bg-[#F8F9FB] rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-orange-600" />
                        <span>Manufacturing & Fulfillment Pipeline</span>
                      </span>
                      <span className="text-[11px] text-gray-500 font-normal">
                        Click any stage to fast-forward order status
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                      {ORDER_STEPS.map((stepKey) => {
                        const stepCfg = STATUS_CONFIG[stepKey];
                        const isCurrent = selectedOrder.status === stepKey;
                        const currentIndex = STATUS_CONFIG[selectedOrder.status]?.stepIndex ?? 0;
                        const isPassed = stepCfg.stepIndex <= currentIndex && selectedOrder.status !== 'cancelled';

                        return (
                          <button
                            key={stepKey}
                            onClick={() => handleQuickStatusChange(selectedOrder.id, stepKey)}
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between h-20 ${
                              isCurrent
                                ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-200'
                                : isPassed
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold">
                                0{stepCfg.stepIndex}
                              </span>
                              {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            </div>
                            <div className="font-extrabold text-[11px] leading-tight text-gray-900 mt-1">
                              {stepCfg.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2-Column Split: Customer & Financials */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Information Card */}
                    <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                          <User className="w-4 h-4 text-orange-600" />
                          <span>Customer & Installation Site</span>
                        </span>
                        <button
                          onClick={() => handleStartEditCustomer(selectedOrder)}
                          className="text-[11px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>

                      {!isEditingCustomer ? (
                        <div className="space-y-2 text-gray-700">
                          <div>
                            <span className="text-gray-400 text-[10px] uppercase font-bold block">Full Name</span>
                            <span className="font-bold text-gray-950 text-sm">{selectedOrder.customer.fullName}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-gray-400 text-[10px] uppercase font-bold block">Email</span>
                              <a
                                href={`mailto:${selectedOrder.customer.email}`}
                                className="font-medium text-orange-600 hover:underline flex items-center gap-1"
                              >
                                <Mail className="w-3 h-3 shrink-0" />
                                <span className="truncate">{selectedOrder.customer.email}</span>
                              </a>
                            </div>
                            <div>
                              <span className="text-gray-400 text-[10px] uppercase font-bold block">Phone</span>
                              <a
                                href={`tel:${selectedOrder.customer.phone}`}
                                className="font-mono text-gray-900 hover:underline flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3 shrink-0 text-gray-400" />
                                <span>{selectedOrder.customer.phone}</span>
                              </a>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                            <div>
                              <span className="text-gray-400 text-[10px] uppercase font-bold block">Delivery Zip</span>
                              <span className="font-mono font-bold text-gray-900">{selectedOrder.customer.zipCode}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 text-[10px] uppercase font-bold block">Site Status</span>
                              <span className="capitalize font-medium text-gray-800">
                                {selectedOrder.customer.landStatus?.replace(/-/g, ' ')}
                              </span>
                            </div>
                          </div>

                          {selectedOrder.customer.deliveryAddress && (
                            <div className="pt-1">
                              <span className="text-gray-400 text-[10px] uppercase font-bold block">Street Address</span>
                              <span className="text-gray-900">{selectedOrder.customer.deliveryAddress}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500">Full Name</label>
                            <input
                              type="text"
                              value={editedCustomer.fullName}
                              onChange={(e) => setEditedCustomer({ ...editedCustomer, fullName: e.target.value })}
                              className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-gray-500">Email</label>
                              <input
                                type="email"
                                value={editedCustomer.email}
                                onChange={(e) => setEditedCustomer({ ...editedCustomer, email: e.target.value })}
                                className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500">Phone</label>
                              <input
                                type="text"
                                value={editedCustomer.phone}
                                onChange={(e) => setEditedCustomer({ ...editedCustomer, phone: e.target.value })}
                                className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500">Delivery Address</label>
                            <input
                              type="text"
                              value={editedCustomer.deliveryAddress}
                              onChange={(e) => setEditedCustomer({ ...editedCustomer, deliveryAddress: e.target.value })}
                              className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={() => setIsEditingCustomer(false)}
                              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveCustomer}
                              className="px-3 py-1 bg-black text-white hover:bg-gray-800 rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Financial Ledger Card */}
                    <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <span>Financial Ledger & Invoicing</span>
                        </span>
                        <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                          Deposit Secured
                        </span>
                      </div>

                      <div className="space-y-1.5 font-mono text-xs">
                        <div className="flex justify-between text-gray-600">
                          <span>Base Model ({selectedOrder.customization.modelName})</span>
                          <span>
                            {formatCurrency(
                              selectedOrder.pricing.basePrice,
                              activeCurrency
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between text-gray-600">
                          <span>Custom Upgrades & Add-ons</span>
                          <span>
                            {formatCurrency(
                              selectedOrder.pricing.optionsTotal,
                              activeCurrency
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between text-gray-600">
                          <span>Factory Oversized Freight</span>
                          <span>
                            {formatCurrency(
                              selectedOrder.pricing.freightCost,
                              activeCurrency
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between text-gray-600">
                          <span>Site Crane Hookup & Prep</span>
                          <span>
                            {formatCurrency(
                              selectedOrder.pricing.sitePrepCost,
                              activeCurrency
                            )}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-gray-200 flex justify-between font-extrabold text-gray-950 text-sm">
                          <span>Total Turnkey Contract</span>
                          <span>
                            {formatCurrency(
                              selectedOrder.pricing.totalPrice,
                              activeCurrency
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/80 p-2 rounded-xl border border-emerald-200/80 text-[11px]">
                          <span>Paid Reservation Deposit</span>
                          <span>
                            -{formatCurrency(
                              selectedOrder.pricing.depositDue,
                              activeCurrency
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between text-gray-500 text-[11px] pt-1">
                          <span>Balance Due on Factory Inspection</span>
                          <span className="font-bold text-gray-900">
                            {formatCurrency(
                              selectedOrder.pricing.totalPrice - selectedOrder.pricing.depositDue,
                              activeCurrency
                            )}
                          </span>
                        </div>

                        {/* Customer Payment Structure Breakdown */}
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Agreed Payment Structure
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              selectedOrder.pricing.paymentOption === 'full'
                                ? 'bg-blue-100 text-blue-800'
                                : selectedOrder.pricing.paymentOption === 'bank_mortgage'
                                ? 'bg-indigo-100 text-indigo-800'
                                : selectedOrder.pricing.paymentOption === 'gov_scheme'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {selectedOrder.pricing.paymentOption === 'full'
                                ? 'Full Turnkey Invoice'
                                : selectedOrder.pricing.paymentOption === 'bank_mortgage'
                                ? `Bank Mortgage (${selectedOrder.pricing.financingDetails?.providerName || 'Partner Bank'})`
                                : selectedOrder.pricing.paymentOption === 'gov_scheme'
                                ? 'Government Housing Scheme (NHF)'
                                : 'Milestone Schedule (4 Tranches)'}
                            </span>
                          </div>

                          {selectedOrder.pricing.paymentOption === 'full' ? (
                            <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200/60 text-[11px] text-blue-900 font-sans space-y-1">
                              <div className="font-bold">Consolidated Turnkey Settlement</div>
                              <p className="text-[10px] text-blue-700">
                                Single comprehensive payment covering house manufacturing, ocean container freight, port clearance, and certified on-site assembly.
                              </p>
                            </div>
                          ) : selectedOrder.pricing.paymentOption === 'bank_mortgage' ? (
                            <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200/60 text-[11px] text-blue-900 font-sans space-y-1">
                              <div className="font-bold flex items-center justify-between">
                                <span>Bank Mortgage Facility ({selectedOrder.pricing.financingDetails?.providerName || 'Partner Bank'})</span>
                                <span className="font-mono text-blue-800 font-black">
                                  ~{formatCurrency(selectedOrder.pricing.financingDetails?.estimatedMonthlyPayment || 0, activeCurrency)}/mo
                                </span>
                              </div>
                              <p className="text-[10px] text-blue-700">
                                Tenor: {selectedOrder.pricing.financingDetails?.tenureYears || 15} Years • Down Payment: {selectedOrder.pricing.financingDetails?.downPaymentPercent || 20}% ({formatCurrency(selectedOrder.pricing.financingDetails?.downPaymentAmount || 0, activeCurrency)}) • Pre-approval: {selectedOrder.pricing.financingDetails?.preApprovalRequested ? 'Requested' : 'Self'}.
                              </p>
                            </div>
                          ) : selectedOrder.pricing.paymentOption === 'gov_scheme' ? (
                            <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-[11px] text-emerald-900 font-sans space-y-1">
                              <div className="font-bold flex items-center justify-between">
                                <span>National Housing Fund (NHF) Subsidized Facility</span>
                                <span className="font-mono text-emerald-800 font-black">
                                  ~{formatCurrency(selectedOrder.pricing.financingDetails?.estimatedMonthlyPayment || 0, activeCurrency)}/mo
                                </span>
                              </div>
                              <p className="text-[10px] text-emerald-700">
                                11.5% Subsidized Concessional Rate • Down Payment: 15% ({formatCurrency(selectedOrder.pricing.financingDetails?.downPaymentAmount || 0, activeCurrency)}) • {selectedOrder.pricing.financingDetails?.notes || 'Subsidy verification staged'}.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1.5 text-[11px] font-sans">
                              {/* Tranche 1 */}
                              <div className="p-2 bg-orange-50/70 rounded-xl border border-orange-200/70 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Home className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                  <div>
                                    <div className="font-bold text-gray-900 text-[11px]">1. House Manufacturing</div>
                                    <div className="text-[10px] text-gray-500">Paid separately upfront</div>
                                  </div>
                                </div>
                                <div className="text-right font-mono font-bold text-gray-900">
                                  {formatCurrency(selectedOrder.pricing.basePrice + (selectedOrder.pricing.optionsTotal || 0), activeCurrency)}
                                </div>
                              </div>

                              {/* Tranche 2 */}
                              <div className="p-2 bg-blue-50/70 rounded-xl border border-blue-200/70 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Ship className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <div>
                                    <div className="font-bold text-gray-900 text-[11px]">2. International Freight</div>
                                    <div className="text-[10px] text-gray-500">Due post-factory completion</div>
                                  </div>
                                </div>
                                <div className="text-right font-mono font-bold text-gray-900">
                                  {formatCurrency(selectedOrder.pricing.freightCost || 4500, activeCurrency)}
                                </div>
                              </div>

                              {/* Tranche 3 */}
                              <div className="p-2 bg-purple-50/70 rounded-xl border border-purple-200/70 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Truck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                  <div>
                                    <div className="font-bold text-gray-900 text-[11px]">3. Port Clearing &amp; Transport</div>
                                    <div className="text-[10px] text-gray-500">Due on port arrival</div>
                                  </div>
                                </div>
                                <div className="text-right font-mono font-bold text-gray-900">
                                  {formatCurrency(selectedOrder.pricing.clearingTransportCost || 2800, activeCurrency)}
                                </div>
                              </div>

                              {/* Tranche 4 */}
                              <div className="p-2 bg-emerald-50/70 rounded-xl border border-emerald-200/70 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Wrench className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <div>
                                    <div className="font-bold text-gray-900 text-[11px]">4. On-Site Installation</div>
                                    <div className="text-[10px] text-gray-500">Due upon arrival on site</div>
                                  </div>
                                </div>
                                <div className="text-right font-mono font-bold text-gray-900">
                                  {formatCurrency(selectedOrder.pricing.installationCost || 2700, activeCurrency)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Architectural Specs Summary */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-orange-600" />
                        <span>Manufactured Cabin Specifications</span>
                      </span>
                      <span className="text-[11px] font-mono text-gray-500">
                        Model: {selectedOrder.customization.modelId}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Exterior Wall Skin</span>
                        <span className="font-bold text-gray-900 block mt-0.5">
                          {selectedOrder.customization.wallCladdingName}
                        </span>
                      </div>

                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Glazing & Glass</span>
                        <span className="font-bold text-gray-900 block mt-0.5">
                          {selectedOrder.customization.glazingName}
                        </span>
                      </div>

                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Lighting & Electric</span>
                        <span className="font-bold text-gray-900 block mt-0.5">
                          {selectedOrder.customization.lightingName}
                        </span>
                      </div>

                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Flooring Core</span>
                        <span className="font-bold text-gray-900 block mt-0.5">
                          {selectedOrder.customization.flooringName}
                        </span>
                      </div>

                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Roof & Solar</span>
                        <span className="font-bold text-gray-900 block mt-0.5">
                          {selectedOrder.customization.roofName}
                        </span>
                      </div>

                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Kitchen Cabinetry</span>
                        <span className="font-bold text-gray-900 block mt-0.5">
                          {selectedOrder.customization.cabinetryName}
                        </span>
                      </div>

                      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                          Active Modules & Upgrades
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedOrder.customization.addonsList?.length > 0 ? (
                            selectedOrder.customization.addonsList.map((addon, i) => (
                              <span
                                key={i}
                                className="bg-white text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-gray-200"
                              >
                                ✓ {addon}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">Standard included baseline equipment</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Internal Operator Notes & Timeline */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-orange-600" />
                        <span>Internal Operations Log & Notes</span>
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {selectedOrder.internalNotes?.length || 0} entries
                      </span>
                    </div>

                    {/* Add Note Form */}
                    <form onSubmit={handleAddNote} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add an internal operations note (e.g. 'Customer confirmed crane access width...')"
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={!newNoteText.trim()}
                        className="px-3.5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3 text-orange-400" />
                        <span>Add Note</span>
                      </button>
                    </form>

                    {/* Notes List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedOrder.internalNotes?.map((note) => (
                        <div
                          key={note.id}
                          className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 font-mono text-[11px]">{note.author}</span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(note.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-700 mt-1 text-[11px] leading-relaxed">{note.text}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-gray-300 hover:text-rose-600 p-1 transition-colors"
                            title="Delete note"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DEVELOPMENT PROGRESS & LIVE CUSTOMER SYNC */}
              {dossierTab === 'progress' && (
                <DevelopmentProgressManager
                  order={selectedOrder}
                  onUpdateOrder={(updated) => {
                    setSelectedOrder(updated);
                    setOrders(getOrders(activeCurrency));
                  }}
                  activeCurrency={activeCurrency}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#FAFAFC] border-t border-gray-200 p-4 flex items-center justify-between shrink-0 flex-wrap gap-2 no-print">
              <button
                type="button"
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Order</span>
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleDownloadWorkOrderPDF}
                  disabled={isExportingPDF}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isExportingPDF ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF Work Order</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW MANUAL ORDER MODAL */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#FAFAFC] border-b border-gray-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight text-gray-900">
                    Create Manual Customer Order
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Enter customer reservation taken over phone, email, or in showroom.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Bell"
                  value={manualOrder.fullName}
                  onChange={(e) => setManualOrder({ ...manualOrder, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="jordan@example.com"
                    value={manualOrder.email}
                    onChange={(e) => setManualOrder({ ...manualOrder, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="(555) 000-0000"
                    value={manualOrder.phone}
                    onChange={(e) => setManualOrder({ ...manualOrder, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                  />
                </div>
              </div>

              {/* Dynamic Country, State/Region, and District Hierarchy */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="font-bold text-gray-700 text-xs flex items-center justify-between">
                  <span>Destination Logistics</span>
                  <span className="text-[10px] text-gray-400 font-mono">{manualCountry.flag} {manualCountry.name}</span>
                </div>

                <div>
                  <label className="block font-bold text-gray-600 mb-1 text-[11px]">Country</label>
                  <select
                    value={manualCountryCode}
                    onChange={(e) => handleManualCountryChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs bg-white cursor-pointer font-semibold"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-600 mb-1 text-[11px]">{manualCountry.subdivisionLabel}</label>
                    <select
                      value={manualSubdivisionId}
                      onChange={(e) => handleManualSubdivisionChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs bg-white cursor-pointer font-medium"
                    >
                      {manualSubdivisions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1 text-[11px]">{manualCountry.districtLabel}</label>
                    <select
                      value={manualDistrict}
                      onChange={(e) => setManualDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs bg-white cursor-pointer font-medium"
                    >
                      {manualDistricts.map((d, idx) => (
                        <option key={idx} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{manualCountry.postalLabel}</label>
                  <input
                    type="text"
                    required
                    placeholder={manualCountry.postalPlaceholder}
                    value={manualOrder.zipCode}
                    onChange={(e) => setManualOrder({ ...manualOrder, zipCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Land / Site Status</label>
                  <select
                    value={manualOrder.landStatus}
                    onChange={(e) => setManualOrder({ ...manualOrder, landStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs bg-white"
                  >
                    <option value="own-land">I own land ready for installation</option>
                    <option value="purchasing-land">Currently purchasing land</option>
                    <option value="backyard-adu">Backyard ADU / Guest house</option>
                    <option value="commercial-resort">Commercial glamping / Resort</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Street Address (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 104 Willow Lake Drive"
                  value={manualOrder.deliveryAddress}
                  onChange={(e) => setManualOrder({ ...manualOrder, deliveryAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Cabin Model</label>
                  <select
                    value={manualOrder.modelId}
                    onChange={(e) => setManualOrder({ ...manualOrder, modelId: e.target.value as HomeModelId })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs bg-white"
                  >
                    <option value="studio">Casita 20ft Studio ({formatCurrency(54900, activeCurrency)})</option>
                    <option value="one-bedroom">Casita 1-Bedroom ({formatCurrency(84900, activeCurrency)})</option>
                    <option value="two-bedroom">Casita 2-Bedroom ({formatCurrency(119900, activeCurrency)})</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Initial Status</label>
                  <select
                    value={manualOrder.status}
                    onChange={(e) => setManualOrder({ ...manualOrder, status: e.target.value as OrderStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs bg-white"
                  >
                    <option value="pending_review">Pending Review</option>
                    <option value="deposit_received">Deposit Received</option>
                    <option value="site_assessment">Site Assessment</option>
                    <option value="in_production">In Production</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Admin Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Customer called about crane delivery clearance..."
                  value={manualOrder.notes}
                  onChange={(e) => setManualOrder({ ...manualOrder, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Create & Lock Production Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FeatureVisibilityModal
        isOpen={showFeatureVisibilityModal}
        onClose={() => setShowFeatureVisibilityModal(false)}
      />
    </div>
  );
};
