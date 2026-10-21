import React, { useState } from 'react';
import {
  CustomerOrder,
  ProductionMilestone,
  ProductionProgressInfo,
  ProgressLogEntry,
} from '../../types';
import {
  DEFAULT_PRODUCTION_STAGES,
  updateOrderProgress,
  addProgressDispatch,
  updateMilestoneStatus,
} from '../../utils/orderManager';
import {
  Building,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Sparkles,
  Send,
  Save,
  Trash2,
  Layers,
  Award,
  Check,
  Sliders,
  FileText,
  Activity,
  UserCheck,
  Eye,
  CheckSquare,
  Square,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface DevelopmentProgressManagerProps {
  order: CustomerOrder;
  onUpdateOrder: (updated: CustomerOrder) => void;
  activeCurrency?: string;
}

export const DevelopmentProgressManager: React.FC<DevelopmentProgressManagerProps> = ({
  order,
  onUpdateOrder,
}) => {
  const progress: ProductionProgressInfo = order.progress || {
    progressPercent: 25,
    currentStage: '1. Order Intake & Deposit Confirmed',
    estimatedCompletionDate: order.estimatedDeliveryDate || '2026-11-15',
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
      notes: idx === 0 ? 'Order verified and QA stamped.' : undefined,
    })),
  };

  // Local editable states
  const [percent, setPercent] = useState<number>(progress.progressPercent ?? 25);
  const [currentStage, setCurrentStage] = useState<string>(progress.currentStage || DEFAULT_PRODUCTION_STAGES[0].title);
  const [targetDate, setTargetDate] = useState<string>(progress.estimatedCompletionDate || order.estimatedDeliveryDate || '2026-11-15');
  const [facility, setFacility] = useState<string>(progress.factoryFacility || '10Apples MegaFactory Plant #1 • Line Alpha');
  
  // New dispatch form state
  const [dispatchMessage, setDispatchMessage] = useState('');
  const [dispatchAuthor, setDispatchAuthor] = useState('Senior Plant Engineer');
  const [dispatchCategory, setDispatchCategory] = useState<ProgressLogEntry['category']>('engineering_update');
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Milestone notes editing
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [milestoneNoteText, setMilestoneNoteText] = useState('');

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Quick preset percentages
  const PRESET_STAGES = [
    { percent: 10, label: 'Intake (10%)', stage: DEFAULT_PRODUCTION_STAGES[0].title },
    { percent: 25, label: 'CAD & Permits (25%)', stage: DEFAULT_PRODUCTION_STAGES[1].title },
    { percent: 38, label: 'Chassis Welding (38%)', stage: DEFAULT_PRODUCTION_STAGES[2].title },
    { percent: 50, label: 'Wall Panels (50%)', stage: DEFAULT_PRODUCTION_STAGES[3].title },
    { percent: 65, label: 'Interior & MEP (65%)', stage: DEFAULT_PRODUCTION_STAGES[4].title },
    { percent: 80, label: '48-Pt QC Test (80%)', stage: DEFAULT_PRODUCTION_STAGES[5].title },
    { percent: 92, label: 'Flatpack Transit (92%)', stage: DEFAULT_PRODUCTION_STAGES[6].title },
    { percent: 100, label: 'Site Handover (100%)', stage: DEFAULT_PRODUCTION_STAGES[7].title },
  ];

  const handleApplyPreset = (item: (typeof PRESET_STAGES)[0]) => {
    setPercent(item.percent);
    setCurrentStage(item.stage);

    // Auto update milestones alignment
    const targetIdx = DEFAULT_PRODUCTION_STAGES.findIndex((s) => s.title === item.stage);
    const updatedMilestones = progress.milestones.map((m, idx) => {
      const isDone = idx < targetIdx || (idx === targetIdx && item.percent === 100);
      const isCurr = idx === targetIdx && item.percent < 100;
      return {
        ...m,
        completed: isDone,
        current: isCurr,
        date: isDone ? (m.date && m.date !== 'Queued' ? m.date : 'Completed') : isCurr ? 'Active Workstation' : 'Queued',
      };
    });

    const updated = updateOrderProgress(order.id, {
      progressPercent: item.percent,
      currentStage: item.stage,
      milestones: updatedMilestones,
    });

    if (updated) {
      onUpdateOrder(updated);
      showToast(`Progress preset applied: ${item.percent}% • ${item.stage}`);
    }
  };

  const handleSaveGeneralProgress = () => {
    const updated = updateOrderProgress(order.id, {
      progressPercent: percent,
      currentStage: currentStage,
      estimatedCompletionDate: targetDate,
      factoryFacility: facility,
    });

    if (updated) {
      onUpdateOrder(updated);
      showToast('Progress settings saved and synced to customer portal.');
    }
  };

  const handleToggleMilestone = (milestone: ProductionMilestone) => {
    const willBeCompleted = !milestone.completed;
    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const updated = updateMilestoneStatus(order.id, milestone.id, {
      completed: willBeCompleted,
      current: false,
      date: willBeCompleted ? `Completed on ${nowStr}` : 'Queued in Production',
      updatedBy: 'Admin / QC Lead',
    });

    if (updated) {
      onUpdateOrder(updated);
      showToast(`Milestone "${milestone.title}" updated.`);
    }
  };

  const handleSetCurrentMilestone = (milestone: ProductionMilestone) => {
    const updatedMilestones = progress.milestones.map((m) => ({
      ...m,
      current: m.id === milestone.id,
      completed: m.id === milestone.id ? false : m.completed,
      date: m.id === milestone.id ? 'Active Workstation' : m.date,
    }));

    const updated = updateOrderProgress(order.id, {
      currentStage: milestone.title,
      milestones: updatedMilestones,
    });

    if (updated) {
      setCurrentStage(milestone.title);
      onUpdateOrder(updated);
      showToast(`Active workstation switched to: ${milestone.title}`);
    }
  };

  const handleSaveMilestoneNotes = (milestoneId: string) => {
    const updated = updateMilestoneStatus(order.id, milestoneId, {
      notes: milestoneNoteText.trim(),
    });
    if (updated) {
      onUpdateOrder(updated);
      setEditingMilestoneId(null);
      setMilestoneNoteText('');
      showToast('Milestone engineering note recorded.');
    }
  };

  const handlePublishDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchMessage.trim()) return;

    setIsSubmittingDispatch(true);
    const updated = addProgressDispatch(order.id, {
      message: dispatchMessage.trim(),
      author: dispatchAuthor,
      category: dispatchCategory,
      percent: percent,
      stageTitle: currentStage,
    });

    setIsSubmittingDispatch(false);
    if (updated) {
      onUpdateOrder(updated);
      setDispatchMessage('');
      showToast('🚀 Progress dispatch published! Customer portal now reflects this update.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
          <span className="text-[10px] text-emerald-700 uppercase font-mono tracking-wider">Live Synced</span>
        </div>
      )}

      {/* Main Top Banner: Customer Sync Status */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-950 to-orange-950 text-white rounded-3xl p-5 sm:p-6 border border-gray-800 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse" />
                Live Customer Progress Bridge
              </span>
              <span className="text-gray-400 text-xs font-mono">
                Order: <span className="text-white font-bold">{order.id}</span>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Factory Development &amp; Manufacturing Management
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">
              Changes made here immediately synchronize to customer{' '}
              <span className="text-orange-300 font-bold">{order.customer.fullName}</span>'s portal.
              Update completion percentages, certify quality inspection milestones, and publish plant progress dispatches.
            </p>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                Current Level
              </span>
              <span className="text-3xl font-black text-orange-400 font-mono">
                {percent}%
              </span>
            </div>
            <div className="w-36 bg-gray-800 h-2.5 rounded-full overflow-hidden mt-1 border border-gray-700">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: PROGRESS CONTROLLER & STAGE PRESETS */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-orange-600" />
            <h4 className="font-extrabold text-sm text-gray-950">
              1. Production Progress Level &amp; Stage Control
            </h4>
          </div>
          <button
            type="button"
            onClick={handleSaveGeneralProgress}
            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Progress Settings</span>
          </button>
        </div>

        {/* Interactive Percentage Slider */}
        <div className="space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-gray-700 flex items-center gap-1.5">
              <span>Overall Factory Development Completion:</span>
              <span className="font-mono text-orange-600 font-black text-sm">{percent}%</span>
            </label>
            <span className="text-[11px] text-gray-400">Drag slider or select quick stage preset below</span>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={percent}
              onChange={(e) => setPercent(parseInt(e.target.value) || 0)}
              className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                min="0"
                max="100"
                value={percent}
                onChange={(e) => setPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-16 px-2 py-1 text-center font-mono font-bold text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-xs font-bold text-gray-500">%</span>
            </div>
          </div>

          {/* Quick Stage Preset Buttons */}
          <div className="pt-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5 tracking-wider">
              Quick Factory Stage Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
              {PRESET_STAGES.map((preset) => (
                <button
                  key={preset.percent}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all text-center cursor-pointer ${
                    percent === preset.percent
                      ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Active Stage & Metadata Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Current Active Development Stage
            </label>
            <select
              value={currentStage}
              onChange={(e) => setCurrentStage(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              {DEFAULT_PRODUCTION_STAGES.map((s) => (
                <option key={s.stageKey} value={s.title}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-gray-400" />
              <span>Plant Facility &amp; Assembly Line</span>
            </label>
            <input
              type="text"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              placeholder="e.g. 10Apples MegaFactory Plant #1 • Line Alpha"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Target Delivery / Site Handover</span>
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: 8-STAGE DEVELOPMENT MILESTONES PIPELINE EDITOR */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-600" />
            <h4 className="font-extrabold text-sm text-gray-950">
              2. 8-Stage Milestone Verification &amp; QA Checkpoints
            </h4>
          </div>
          <span className="text-[11px] text-gray-500">
            Check off completed steps or switch the active factory workstation
          </span>
        </div>

        <div className="space-y-2.5">
          {progress.milestones.map((m, idx) => {
            const isEditing = editingMilestoneId === m.id;

            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border transition-all text-xs ${
                  m.completed
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : m.current
                    ? 'bg-orange-50/70 border-orange-300 ring-1 ring-orange-200'
                    : 'bg-gray-50/50 border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleMilestone(m)}
                      className="mt-0.5 text-gray-400 hover:text-emerald-600 cursor-pointer transition-colors shrink-0"
                      title={m.completed ? 'Mark uncompleted' : 'Mark completed'}
                    >
                      {m.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-gray-950 text-xs sm:text-sm">
                          {m.title}
                        </span>
                        {m.completed && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ Verified &amp; Passed
                          </span>
                        )}
                        {m.current && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-ping" />
                            Active Workstation
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{m.description}</p>
                      {m.notes && (
                        <p className="text-[11px] text-gray-800 font-semibold bg-white/80 px-2.5 py-1 rounded-lg border border-gray-200/80 mt-1 inline-block">
                          Note: {m.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className="font-mono text-[11px] text-gray-500">{m.date || 'Queued'}</span>

                    {!m.current && !m.completed && (
                      <button
                        type="button"
                        onClick={() => handleSetCurrentMilestone(m)}
                        className="px-2 py-1 bg-white hover:bg-orange-50 text-orange-700 border border-gray-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                        title="Set as current active production stage"
                      >
                        Set Active
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (isEditing) {
                          setEditingMilestoneId(null);
                        } else {
                          setEditingMilestoneId(m.id);
                          setMilestoneNoteText(m.notes || '');
                        }
                      }}
                      className="px-2 py-1 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      {isEditing ? 'Cancel Note' : 'Add Note'}
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                    <input
                      type="text"
                      value={milestoneNoteText}
                      onChange={(e) => setMilestoneNoteText(e.target.value)}
                      placeholder="e.g. Ultrasonic weld inspection completed by Tech #42. Zero microfissures found."
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveMilestoneNotes(m.id)}
                      className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Save Note
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: PUBLISH OFFICIAL PROGRESS DISPATCH TO CUSTOMER PORTAL */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-orange-600" />
            <h4 className="font-extrabold text-sm text-gray-950">
              3. Publish Official Progress Dispatch to Customer Portal
            </h4>
          </div>
          <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider">
            Customer Feed
          </span>
        </div>

        <form onSubmit={handlePublishDispatch} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Progress Message &amp; Inspection Update:
            </label>
            <textarea
              rows={3}
              required
              value={dispatchMessage}
              onChange={(e) => setDispatchMessage(e.target.value)}
              placeholder="e.g. Q235 galvanized chassis structural frame welding passed ultrasonic weld inspection. Framing meets seismic code Grade 8. Unit moving to station #4 for rockwool wall panel encapsulation..."
              className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-gray-900 leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Dispatch Author:
                </label>
                <select
                  value={dispatchAuthor}
                  onChange={(e) => setDispatchAuthor(e.target.value)}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="Senior Plant Engineer">Senior Plant Engineer</option>
                  <option value="Plant Operations Lead">Plant Operations Lead</option>
                  <option value="Chief Structural Specialist">Chief Structural Specialist</option>
                  <option value="Quality Assurance Director">Quality Assurance Director</option>
                  <option value="Platform Admin & Logistics Desk">Platform Admin &amp; Logistics</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Update Category:
                </label>
                <select
                  value={dispatchCategory}
                  onChange={(e) => setDispatchCategory(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="engineering_update">Engineering Update</option>
                  <option value="inspection_passed">Inspection Passed</option>
                  <option value="milestone_completed">Milestone Completed</option>
                  <option value="dispatch_ready">Transit &amp; Delivery Ready</option>
                  <option value="general">General Operations</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingDispatch || !dispatchMessage.trim()}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>{isSubmittingDispatch ? 'Publishing...' : 'Publish Update to Customer Portal'}</span>
            </button>
          </div>
        </form>

        {/* Previous Dispatches Feed */}
        {progress.progressLogs && progress.progressLogs.length > 0 && (
          <div className="pt-4 border-t border-gray-100 space-y-2.5">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
              Published Progress Updates History ({progress.progressLogs.length} updates visible to customer)
            </span>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {progress.progressLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{log.author}</span>
                      <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-white text-orange-700 border border-gray-200">
                        {log.stageTitle} ({log.percent}%)
                      </span>
                    </div>
                    <span className="font-mono text-gray-400 text-[10px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-xs leading-relaxed">{log.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
