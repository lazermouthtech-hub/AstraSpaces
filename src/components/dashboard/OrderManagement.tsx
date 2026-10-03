import React, { useState, useEffect } from 'react';
import {
  CustomerOrder,
  OrderStatus,
  HomeModelId,
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
import { OrderWorkOrderSheet } from './OrderWorkOrderSheet';
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

export const OrderManagement: React.FC<OrderManagementProps> = ({ onGoToConfigurator }) => {
  const { config, updateConfig, setCurrency } = useAppConfig();
  const activeCurrency: PrimaryCurrencyCode = normalizeCurrency(config?.currency);

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [dossierTab, setDossierTab] = useState<'work_order' | 'crm'>('work_order');
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

    const newOrder = addOrder({
      status: manualOrder.status,
      customer: {
        fullName: manualOrder.fullName.trim(),
        email: manualOrder.email.trim(),
        phone: manualOrder.phone.trim(),
        deliveryAddress: manualOrder.deliveryAddress.trim() || undefined,
        zipCode: manualOrder.zipCode.trim(),
        landStatus: manualOrder.landStatus,
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
      initialNote: 'Order manually created by operator through Boxabl Admin OS.',
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
    link.setAttribute('download', `boxabl_orders_export_${new Date().toISOString().split('T')[0]}.csv`);
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
          filename: `BOXABL-WORK-ORDER-${selectedOrder.id}.pdf`,
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

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.customer.fullName.toLowerCase().includes(q) ||
      order.customer.email.toLowerCase().includes(q) ||
      order.customer.phone.toLowerCase().includes(q) ||
      order.customer.zipCode.toLowerCase().includes(q) ||
      order.customization.modelName.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesModel = modelFilter === 'all' || order.customization.modelId === modelFilter;

    return matchesSearch && matchesStatus && matchesModel;
  });

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

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, order ID (BX-...), email, phone, zip..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-gray-900 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Model Filter */}
        <div className="flex items-center gap-2">
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

          {/* Status Filter */}
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
        </div>
      </div>

      {/* Orders Table */}
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
                          <span className="font-extrabold text-gray-900 block leading-tight">
                            {order.customization.modelName}
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
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
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
                <div className="inline-flex p-1 bg-gray-100 rounded-2xl border border-gray-200">
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
                    <span>📐 Technical Work Order &amp; Blueprint (Start Working)</span>
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
                    <span>📋 Pipeline Status &amp; Operations Notes (CRM)</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-gray-500 hidden sm:block">
                  {dossierTab === 'work_order'
                    ? 'All measures, CAD drawings, foundation grid & MEP included'
                    : 'Customer communication, milestone timeline & financial ledger'}
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Delivery Zip Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 78701"
                    value={manualOrder.zipCode}
                    onChange={(e) => setManualOrder({ ...manualOrder, zipCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
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
    </div>
  );
};
