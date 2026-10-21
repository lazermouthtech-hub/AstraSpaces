import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CustomerOrder, ProductionMilestone, ProductionProgressInfo } from '../../types';
import { DEFAULT_PRODUCTION_STAGES, addOrderNote } from '../../utils/orderManager';
import { formatCurrency } from '../../utils/currency';
import {
  Building,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Sparkles,
  MapPin,
  ChevronRight,
  ExternalLink,
  Box,
  FileText,
  Activity,
  Send,
  Check,
  Award,
  Layers,
  Phone,
  Mail,
  User,
  Info,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';

interface CustomerProgressTrackerProps {
  orders: CustomerOrder[];
  selectedOrderId?: string;
  onSelectOrder?: (orderId: string) => void;
  currency?: string;
  onDownloadBlueprint?: (order: CustomerOrder) => void;
}

export const CustomerProgressTracker: React.FC<CustomerProgressTrackerProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  currency = 'USD',
  onDownloadBlueprint,
}) => {
  // Active selected order
  const [activeOrderId, setActiveOrderId] = useState<string>(
    selectedOrderId || (orders.length > 0 ? orders[0].id : '')
  );

  const activeOrder = orders.find((o) => o.id === activeOrderId) || orders[0];

  // Expanded milestone details
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);

  // Customer Site Readiness modal / confirmation state
  const [showSitePrompt, setShowSitePrompt] = useState(false);
  const [siteNote, setSiteNote] = useState('');
  const [siteConfirmed, setSiteConfirmed] = useState(false);
  const [contactSuccessToast, setContactSuccessToast] = useState<string | null>(null);

  if (!activeOrder) {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-10 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
          <Activity className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-black text-gray-950">No Production Orders Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
            Once you place a reservation for your 3D modular home, your factory development pipeline,
            real-time manufacturing milestones, and official admin progress dispatches will be tracked here.
          </p>
        </div>
        <Link
          to="/configurator"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
        >
          <Box className="w-4 h-4" />
          <span>Configure &amp; Reserve in 3D</span>
        </Link>
      </div>
    );
  }

  const progress: ProductionProgressInfo = activeOrder.progress || {
    progressPercent: 25,
    currentStage: '1. Order Intake & Deposit Confirmed',
    estimatedCompletionDate: activeOrder.estimatedDeliveryDate || '2026-11-15',
    factoryFacility: '10Apples MegaFactory Plant #1 • Line Alpha',
    lastUpdated: new Date().toISOString(),
    milestones: DEFAULT_PRODUCTION_STAGES.map((s, idx) => ({
      id: `ms-${s.stageKey}`,
      stageKey: s.stageKey,
      title: s.title,
      description: s.description,
      completed: idx === 0,
      current: idx === 1,
      date: idx === 0 ? 'Completed' : 'Active Workstation',
      updatedBy: 'Plant Lead',
      notes: idx === 0 ? 'Stage verified and QA stamped.' : undefined,
    })),
  };

  const handleOrderChange = (id: string) => {
    setActiveOrderId(id);
    if (onSelectOrder) onSelectOrder(id);
  };

  const handleSendSiteConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    addOrderNote(
      activeOrder.id,
      `[Customer Site Update]: ${siteNote.trim() || 'Customer confirmed foundation and access road ready for delivery truck.'}`,
      activeOrder.customer.fullName
    );
    setSiteConfirmed(true);
    setShowSitePrompt(false);
    setSiteNote('');
    setContactSuccessToast('Site readiness verification received by the Plant Logistics Desk.');
    setTimeout(() => setContactSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {contactSuccessToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{contactSuccessToast}</span>
          </div>
          <span className="text-[10px] text-emerald-700 uppercase font-mono tracking-wider">Transmitted</span>
        </div>
      )}

      {/* Multi-Order Selector Pills if user has multiple orders */}
      {orders.length > 1 && (
        <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 shrink-0">
            Tracked Units:
          </span>
          <div className="flex items-center gap-2">
            {orders.map((o) => {
              const isSelected = o.id === activeOrderId;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => handleOrderChange(o.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  <span className="font-mono text-[11px]">{o.id}</span>
                  <span>•</span>
                  <span>{o.customization.modelName}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {o.progress?.progressPercent ?? 25}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* HERO COCKPIT: REAL-TIME PRODUCTION METER */}
      <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 text-white rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* Left Info Column */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-orange-500 text-white flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Live Factory Production
              </span>
              <span className="text-gray-400 text-xs font-mono">
                Order <span className="text-white font-bold">{activeOrder.id}</span>
              </span>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-300 text-xs font-medium">
                {activeOrder.customization.modelName}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {progress.currentStage}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed max-w-2xl">
                {progress.adminPublicNotes ||
                  'Your modular home is actively moving through automated precision assembly lines. Real-time updates from the plant engineering desk appear below.'}
              </p>
            </div>

            {/* Quick Metrics Badge Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Target Handover</span>
                <span className="text-xs font-black text-white font-mono mt-0.5 block">
                  {progress.estimatedCompletionDate || activeOrder.estimatedDeliveryDate || 'Nov 15, 2026'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Manufacturing Line</span>
                <span className="text-xs font-bold text-orange-300 truncate mt-0.5 block">
                  {progress.factoryFacility || 'MegaFactory Plant #1'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Delivery Site</span>
                <span className="text-xs font-bold text-gray-200 truncate mt-0.5 block" title={activeOrder.customer.deliveryAddress || activeOrder.customer.zipCode}>
                  {activeOrder.customer.stateOrRegion
                    ? `${activeOrder.customer.districtOrCounty ? `${activeOrder.customer.districtOrCounty}, ` : ''}${activeOrder.customer.stateOrRegion}`
                    : `${activeOrder.customer.zipCode || 'Factory Staging'}`}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Last Synchronized</span>
                <span className="text-xs font-medium text-gray-300 mt-0.5 block">
                  {new Date(progress.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Active Project Blueprint Download Button */}
            {onDownloadBlueprint && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onDownloadBlueprint(activeOrder)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 border border-emerald-400/40"
                  title="Download official architectural CAD blueprint and engineering specification sheet PDF for this active reserved project"
                >
                  <Download className="w-4 h-4 text-emerald-200" />
                  <span>Download Active Project Blueprint &amp; CAD Specs</span>
                  <span className="text-[9px] font-mono bg-white/20 text-white px-1.5 py-0.5 rounded font-extrabold uppercase border border-white/20">
                    PDF • Ready
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Right Progress Dial Column */}
          <div className="lg:w-72 flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md shrink-0">
            <div className="relative flex items-center justify-center">
              {/* Circular SVG Ring */}
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="text-gray-800"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="text-orange-500 transition-all duration-700 ease-out"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 * (1 - (progress.progressPercent || 0) / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center text-center">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  {progress.progressPercent}%
                </span>
                <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">
                  Complete
                </span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <span className="text-xs font-bold text-gray-200 block">
                {progress.progressPercent >= 100
                  ? 'Ready for Site Handover'
                  : progress.progressPercent >= 80
                  ? 'Final QC & Prep'
                  : 'Active Fabrication'}
              </span>
              <span className="text-[11px] text-gray-400">
                Verified by Factory Lead
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: 8-STAGE INTERACTIVE DEVELOPMENT PIPELINE */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-950 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-600" />
              <span>Modular Development &amp; Manufacturing Stages</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Follow every engineering checkpoint from raw Q235 steel framing to final on-site unfolding.
            </p>
          </div>
          <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-xl font-bold self-start sm:self-center">
            8 Total Inspection Stages
          </span>
        </div>

        {/* Vertical Pipeline Stepper */}
        <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
          {progress.milestones.map((m, idx) => {
            const isExpanded = expandedMilestoneId === m.id;

            return (
              <div
                key={m.id}
                className={`relative rounded-2xl border transition-all text-xs overflow-hidden ${
                  m.completed
                    ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                    : m.current
                    ? 'bg-orange-50/60 border-orange-300 ring-2 ring-orange-200 shadow-xs'
                    : 'bg-gray-50/60 border-gray-200'
                }`}
              >
                {/* Node Indicator on the line */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-4 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] border-2 shadow-xs transition-colors ${
                    m.completed
                      ? 'bg-emerald-600 border-white text-white'
                      : m.current
                      ? 'bg-orange-600 border-white text-white ring-2 ring-orange-400'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {m.completed ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <span>0{idx + 1}</span>
                  )}
                </div>

                {/* Stage Header Summary */}
                <div
                  onClick={() => setExpandedMilestoneId(isExpanded ? null : m.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-gray-950 text-sm">
                        {m.title}
                      </span>
                      {m.completed && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          Passed &amp; Certified
                        </span>
                      )}
                      {m.current && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-ping" />
                          Active Assembly Station
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                      {m.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-gray-800 block">
                        {m.date || 'Queued in Plant'}
                      </span>
                      {m.updatedBy && (
                        <span className="text-[10px] text-gray-400 block font-medium">
                          Signed by {m.updatedBy}
                        </span>
                      )}
                    </div>

                    <div className="p-1 text-gray-400 hover:text-gray-700 rounded-lg">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expandable Engineering & Inspection Notes */}
                {isExpanded && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-gray-200/60 bg-white/60 space-y-2">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Factory Quality Verification Details:
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-700 space-y-1">
                      <p className="font-medium leading-relaxed">
                        {m.notes ||
                          'Robotic assembly tolerances calibrated within ±1.5mm. Meets international ISO9001 and structural prefab building codes.'}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] text-gray-400 pt-1 font-mono">
                        <span>Station: Plant Line Alpha</span>
                        <span>•</span>
                        <span>Inspector Seal: QA-10APPLES-PASS</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: OFFICIAL FACTORY PROGRESS DISPATCHES (ADMIN FEED) */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-950">
                Official Plant Dispatches &amp; Admin Progress Log
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Official announcements published directly by the platform administration and manufacturing leads.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-50 text-orange-800 border border-orange-200">
            Real-Time Feed
          </span>
        </div>

        {progress.progressLogs && progress.progressLogs.length > 0 ? (
          <div className="space-y-3">
            {progress.progressLogs.map((log) => {
              const isInspection = log.category === 'inspection_passed';
              const isMilestone = log.category === 'milestone_completed';

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-gray-950 text-xs sm:text-sm flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-orange-600" />
                        {log.author}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isInspection
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isMilestone
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-white text-gray-800 border-gray-200'
                        }`}
                      >
                        {log.stageTitle} ({log.percent}%)
                      </span>
                    </div>

                    <span className="font-mono text-[11px] text-gray-400">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                    {log.message}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
            <Info className="w-6 h-6 text-gray-400 mx-auto" />
            <p className="text-xs text-gray-500">
              No custom dispatches published yet. Factory lead will post updates as milestones complete.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 4: ACTIONS & CUSTOMER SITE READINESS */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h4 className="text-base font-black text-gray-950">
              Site Readiness &amp; Handover Consultation
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Notify the operations team when your foundation slab, driveway crane access, and utility connections are ready.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onDownloadBlueprint && (
              <button
                type="button"
                onClick={() => onDownloadBlueprint(activeOrder)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
                title="Download official architectural blueprint and specification sheet PDF for this active project"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Blueprint &amp; Specs</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/20 text-white font-extrabold uppercase">
                  PDF
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowSitePrompt(!showSitePrompt)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{siteConfirmed ? 'Update Site Status' : 'Confirm Site Readiness'}</span>
            </button>

            <Link
              to={`/configurator?model=${activeOrder.customization.modelId}`}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Box className="w-3.5 h-3.5 text-orange-600" />
              <span>Inspect 3D Blueprint</span>
            </Link>
          </div>
        </div>

        {/* Site readiness modal / inline form */}
        {showSitePrompt && (
          <form onSubmit={handleSendSiteConfirmation} className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-orange-950">
                Confirm Site Foundation &amp; Delivery Access:
              </span>
              <span className="text-[10px] text-orange-700 uppercase font-mono">
                Direct to Logistics Lead
              </span>
            </div>
            <textarea
              rows={2}
              value={siteNote}
              onChange={(e) => setSiteNote(e.target.value)}
              placeholder="e.g. Concrete slab foundation poured and cured. Driveway gate width is 15 feet with clear crane overhead clearance..."
              className="w-full px-3 py-2 text-xs bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSitePrompt(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Send Confirmation to Plant
              </button>
            </div>
          </form>
        )}

        {/* Technical Spec Summary Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Modular Model</span>
            <span className="font-bold text-gray-900 block mt-0.5">{activeOrder.customization.modelName}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Exterior Wall Skin</span>
            <span className="font-bold text-gray-900 block mt-0.5 truncate">{activeOrder.customization.wallCladdingName}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Glazing &amp; Windows</span>
            <span className="font-bold text-gray-900 block mt-0.5 truncate">{activeOrder.customization.glazingName}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Turnkey Value</span>
            <span className="font-bold text-orange-600 font-mono block mt-0.5">
              {formatCurrency(activeOrder.pricing.totalPrice, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
