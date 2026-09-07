import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppConfig } from '../context/AppConfigContext';
import { LogOut, Home, Palette, DollarSign, Settings, Save, Plus, Trash2, Box, Eye, Edit3 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function Dashboard() {
  const navigate = useNavigate();
  const { config, updateConfig } = useAppConfig();
  
  const [activeTab, setActiveTab] = useState<'models' | 'colors' | 'pricing' | 'addons' | 'branding' | 'viewer'>('models');
  
  // Local state initialized from global config
  const [models, setModels] = useState(config.models);
  const [wallColors, setWallColors] = useState(config.wallOptions);
  const [baseCurrency, setBaseCurrency] = useState(config.currency);
  const [markup, setMarkup] = useState(config.markup);
  const [addons, setAddons] = useState(config.addons);
  const [branding, setBranding] = useState(config.branding);
  const [viewerControls, setViewerControls] = useState(config.viewerControls);
  const [logistics, setLogistics] = useState(config.logistics);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const handleSave = () => {
    updateConfig({
      ...config,
      models,
      wallOptions: wallColors,
      currency: baseCurrency,
      markup,
      addons,
      branding,
      viewerControls,
      logistics
    });
    alert('Changes saved successfully! Return to Configurator to see updates.');
  };

  const addColor = () => {
    setWallColors([
      ...wallColors,
      { id: `wall-custom-${Date.now()}`, name: 'New Color', color: '#000000', price: 0, roughness: 0.5, metalness: 0, clearcoat: 0 }
    ]);
  };

  const removeColor = (id: string) => {
    setWallColors(wallColors.filter((c: any) => c.id !== id));
  };

  const addAddon = () => {
    setAddons([
      ...addons,
      { id: `addon-${Date.now()}`, name: 'New Add-on', description: 'Description', price: 0 }
    ]);
  };

  const removeAddon = (id: string) => {
    setAddons(addons.filter((a: any) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F4F4F7] flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 text-white rounded-lg flex items-center justify-center font-black text-sm">
              B
            </div>
            <span className="font-extrabold text-gray-900 tracking-tight">Admin OS</span>
          </div>
        </div>
        
        <div className="p-4 space-y-1 flex-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('models')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'models' ? 'bg-orange-50 text-orange-700' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Home className="w-4 h-4" /> Properties & Sizes
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'colors' ? 'bg-orange-50 text-orange-700' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Palette className="w-4 h-4" /> Colors & Materials
          </button>
          <button
            onClick={() => setActiveTab('addons')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'addons' ? 'bg-orange-50 text-orange-700' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Box className="w-4 h-4" /> Modular Add-ons
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'pricing' ? 'bg-orange-50 text-orange-700' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <DollarSign className="w-4 h-4" /> Pricing & Logistics
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'branding' ? 'bg-orange-50 text-orange-700' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Edit3 className="w-4 h-4" /> Branding & Copy
          </button>
          <button
            onClick={() => setActiveTab('viewer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'viewer' ? 'bg-orange-50 text-orange-700' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-4 h-4" /> 3D Viewer Settings
          </button>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900 capitalize">
            Manage {activeTab}
          </h2>
          <button 
            onClick={handleSave}
            className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </header>

        <main className="p-8">
          <div className="max-w-4xl space-y-6">
            
            {activeTab === 'models' && (
              <div className="space-y-4">
                {models.map((model: any, idx: number) => (
                  <div key={model.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">{model.name}</h3>
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{model.id}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Display Name</label>
                        <input
                          type="text"
                          value={model.name}
                          onChange={(e) => {
                            const newModels = [...models];
                            newModels[idx].name = e.target.value;
                            setModels(newModels);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Base Price</label>
                        <input
                          type="number"
                          value={model.basePrice}
                          onChange={(e) => {
                            const newModels = [...models];
                            newModels[idx].basePrice = Number(e.target.value);
                            setModels(newModels);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Square Footage</label>
                        <input
                          type="number"
                          value={model.sqft}
                          onChange={(e) => {
                            const newModels = [...models];
                            newModels[idx].sqft = Number(e.target.value);
                            setModels(newModels);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dimensions (ft)</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            value={model.dimensions.lengthFt}
                            onChange={(e) => {
                              const newModels = [...models];
                              newModels[idx].dimensions.lengthFt = Number(e.target.value);
                              setModels(newModels);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
                          />
                          <span className="text-gray-400">×</span>
                          <input
                            type="number"
                            value={model.dimensions.widthFt}
                            onChange={(e) => {
                              const newModels = [...models];
                              newModels[idx].dimensions.widthFt = Number(e.target.value);
                              setModels(newModels);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'colors' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Exterior Wall Cladding</h3>
                  <button onClick={addColor} className="text-sm font-bold text-orange-600 flex items-center gap-1 hover:text-orange-700">
                    <Plus className="w-4 h-4" /> Add Swatch
                  </button>
                </div>
                {wallColors.map((color: any, idx: number) => (
                  <div key={color.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full border border-gray-200 shrink-0 shadow-sm" style={{ backgroundColor: color.color }} />
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Color Name</label>
                          <input
                            type="text"
                            value={color.name}
                            onChange={(e) => {
                              const newCols = [...wallColors];
                              newCols[idx].name = e.target.value;
                              setWallColors(newCols);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hex Code</label>
                          <input
                            type="text"
                            value={color.color}
                            onChange={(e) => {
                              const newCols = [...wallColors];
                              newCols[idx].color = e.target.value;
                              setWallColors(newCols);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Upgrade Price</label>
                          <input
                            type="number"
                            value={color.price}
                            onChange={(e) => {
                              const newCols = [...wallColors];
                              newCols[idx].price = Number(e.target.value);
                              setWallColors(newCols);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-semibold"
                          />
                        </div>
                      </div>
                      <button onClick={() => removeColor(color.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    {/* Material Advanced Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Roughness (0-1)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={color.roughness ?? 0.35}
                            onChange={(e) => {
                              const newCols = [...wallColors];
                              newCols[idx].roughness = Number(e.target.value);
                              setWallColors(newCols);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Metalness (0-1)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={color.metalness ?? 0.15}
                            onChange={(e) => {
                              const newCols = [...wallColors];
                              newCols[idx].metalness = Number(e.target.value);
                              setWallColors(newCols);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Clearcoat (0-1)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={color.clearcoat ?? 0}
                            onChange={(e) => {
                              const newCols = [...wallColors];
                              newCols[idx].clearcoat = Number(e.target.value);
                              setWallColors(newCols);
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                          />
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'addons' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Modular Add-Ons & Upgrades</h3>
                  <button onClick={addAddon} className="text-sm font-bold text-orange-600 flex items-center gap-1 hover:text-orange-700">
                    <Plus className="w-4 h-4" /> Add Upgrade
                  </button>
                </div>
                {addons.map((addon: any, idx: number) => (
                  <div key={addon.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col gap-4">
                     <div className="flex justify-between items-start">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mr-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Display Name</label>
                                <input
                                type="text"
                                value={addon.name}
                                onChange={(e) => {
                                    const newAddons = [...addons];
                                    newAddons[idx].name = e.target.value;
                                    setAddons(newAddons);
                                }}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Price</label>
                                <input
                                type="number"
                                value={addon.price}
                                onChange={(e) => {
                                    const newAddons = [...addons];
                                    newAddons[idx].price = Number(e.target.value);
                                    setAddons(newAddons);
                                }}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-semibold"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                                <input
                                type="text"
                                value={addon.description}
                                onChange={(e) => {
                                    const newAddons = [...addons];
                                    newAddons[idx].description = e.target.value;
                                    setAddons(newAddons);
                                }}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                />
                            </div>
                        </div>
                        <button onClick={() => removeAddon(addon.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                    <div>
                    <h3 className="font-bold text-gray-900 mb-4">Global Currency Settings</h3>
                    <div className="max-w-xs">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Display Currency</label>
                        <select
                        value={baseCurrency}
                        onChange={(e) => setBaseCurrency(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[var(--primary)]"
                        >
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                        <option value="GBP">GBP (£) - British Pound</option>
                        <option value="CAD">CAD ($) - Canadian Dollar</option>
                        <option value="AUD">AUD ($) - Australian Dollar</option>
                        <option value="GHS">GHS (GH₵) - Ghana Cedi</option>
                        <option value="NGN">NGN (₦) - Nigerian Naira</option>
                        <option value="ZAR">ZAR (R) - South African Rand</option>
                        <option value="KES">KES (KSh) - Kenyan Shilling</option>
                        <option value="EGP">EGP (E£) - Egyptian Pound</option>
                        </select>
                    </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Markup Rules</h3>
                    <div className="max-w-xs space-y-4">
                        <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Global Base Price Modifier (%)</label>
                        <input
                            type="number"
                            value={markup}
                            onChange={(e) => setMarkup(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-semibold focus:outline-none focus:border-orange-500"
                        />
                        </div>
                    </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                      <h3 className="font-bold text-gray-900 mb-4">Logistics & Fees</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Flat Freight Estimate</label>
                            <input
                                type="number"
                                value={logistics.freightCost}
                                onChange={(e) => setLogistics({...logistics, freightCost: Number(e.target.value)})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Site Prep Baseline</label>
                            <input
                                type="number"
                                value={logistics.sitePrepCost}
                                onChange={(e) => setLogistics({...logistics, sitePrepCost: Number(e.target.value)})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Local Tax Rate (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={logistics.taxRate}
                                onChange={(e) => setLogistics({...logistics, taxRate: Number(e.target.value)})}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-semibold"
                            />
                        </div>
                      </div>
                  </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                  <h3 className="font-bold text-gray-900 mb-4">Branding & Content</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Brand Name</label>
                        <input
                            type="text"
                            value={branding.brandName || ''}
                            onChange={(e) => setBranding({...branding, brandName: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Support Email</label>
                        <input
                            type="text"
                            value={branding.supportEmail || ''}
                            onChange={(e) => setBranding({...branding, supportEmail: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Header Title</label>
                        <input
                            type="text"
                            value={branding.headerText}
                            onChange={(e) => setBranding({...branding, headerText: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tagline</label>
                        <input
                            type="text"
                            value={branding.tagline || ''}
                            onChange={(e) => setBranding({...branding, tagline: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">CTA Button Text</label>
                        <input
                            type="text"
                            value={branding.ctaText}
                            onChange={(e) => setBranding({...branding, ctaText: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Reservation Fee Amount</label>
                        <input
                            type="number"
                            value={branding.reservationFee}
                            onChange={(e) => setBranding({...branding, reservationFee: Number(e.target.value)})}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-semibold"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Primary Theme Color (Hex)</label>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg shadow-sm border border-gray-200 shrink-0" style={{ backgroundColor: branding.primaryColor }} />
                                <input
                                    type="text"
                                    value={branding.primaryColor}
                                    onChange={(e) => setBranding({...branding, primaryColor: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-semibold"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {['#000000', '#ea580c', '#0D3512', '#000066', '#0f172a', '#be123c', '#0369a1', '#7c3aed'].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setBranding({...branding, primaryColor: color})}
                                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200 cursor-pointer hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                      </div>
                  </div>
              </div>
            )}

            {activeTab === 'viewer' && (
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                  <h3 className="font-bold text-gray-900 mb-4">Environmental & Viewer Controls</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Default Lighting Time of Day</label>
                        <div className="flex gap-2">
                            {['day', 'sunset', 'night'].map((time) => (
                                <button
                                    key={time}
                                    onClick={() => setViewerControls({...viewerControls, defaultLighting: time})}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
                                        viewerControls.defaultLighting === time ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Default Initial View State</label>
                         <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={viewerControls.defaultCutaway}
                                onChange={(e) => setViewerControls({...viewerControls, defaultCutaway: e.target.checked})}
                                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <span className="text-sm font-semibold text-gray-900">Enable Roof-Lift/Cutaway Mode</span>
                        </label>
                      </div>
                  </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
