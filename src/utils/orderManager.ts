import { CustomerOrder, OrderStatus, HomeModelId } from '../types';
import { normalizeCurrency } from './currency';

const STORAGE_KEY = 'boxabl_customer_orders';
const ORDERS_EVENT = 'boxabl_orders_updated';

export const getSystemCurrency = (): string => {
  try {
    const raw = localStorage.getItem('boxabl_app_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.currency) {
        return normalizeCurrency(parsed.currency);
      }
    }
  } catch (e) {}
  return 'USD';
};

export const SAMPLE_ORDERS: CustomerOrder[] = [
  {
    id: 'BX-2026-9841',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'deposit_received',
    customer: {
      fullName: 'Dr. Evelyn Vance',
      email: 'evelyn.vance@neurotech.org',
      phone: '(512) 893-4412',
      deliveryAddress: '4820 Scenic Ridge Way, Spicewood',
      zipCode: '78669',
      landStatus: 'own-land',
      notes: 'Customer requested foundation engineering guide for hill country slope.',
    },
    customization: {
      modelId: 'one-bedroom',
      modelName: 'Casita 1-Bedroom',
      wallCladdingName: 'Fluorocarbon Aviation Silver',
      wallCladdingColor: '#cbd5e1',
      glazingName: 'Floor-to-Ceiling Low-E Curtain Wall',
      lightingName: 'Architectural Luxe Cove + Dimmables',
      electricalName: 'Smart IoT 200A Automation Hub',
      flooringName: 'Rigid Core American Walnut SPC',
      roofName: '3.6kW Integrated Monocrystalline Solar Array',
      cabinetryName: 'Matte Onyx Black Flat-Panel',
      addonsList: [
        'Luxury Bath Pod with Glass Rain Shower',
        'Smart Thermostat HVAC Mini-Split (18k BTU)',
        'Smart Biometric Entry Door Lock',
        'Motorized Architectural Blackout Blinds',
      ],
    },
    pricing: {
      basePrice: 84900,
      optionsTotal: 9650,
      freightCost: 4500,
      sitePrepCost: 5500,
      taxAmount: 0,
      totalPrice: 104550,
      depositDue: 250,
      depositPaid: true,
      currency: 'USD',
    },
    estimatedDeliveryDate: '2026-11-15',
    internalNotes: [
      {
        id: 'note-1',
        author: 'System',
        text: 'Deposit of $250.00 secured online via 3D Configurator.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: 'note-2',
        author: 'Admin',
        text: 'Sent Travis County permit checklist to buyer.',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
  },
  {
    id: 'BX-2026-9214',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // Yesterday
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    status: 'in_production',
    customer: {
      fullName: 'Marcus Sterling',
      email: 'msterling@highlandcap.com',
      phone: '(415) 302-8871',
      deliveryAddress: '142 Sunset Crest Trail',
      zipCode: '92252',
      landStatus: 'own-land',
      notes: 'Off-grid desert retreat installation in Joshua Tree.',
    },
    customization: {
      modelId: 'studio',
      modelName: 'Casita 20ft Studio',
      wallCladdingName: 'Carved Metal Slate Charcoal',
      wallCladdingColor: '#334155',
      glazingName: 'Panoramic Low-E Clear Tempered Glass',
      lightingName: 'Warm Ambient Halo LED Strips',
      electricalName: 'Off-Grid Hybrid Solar Ready 100A',
      flooringName: 'Nordic White Oak SPC Plank',
      roofName: 'Standard Architectural Parapet Roof',
      cabinetryName: 'Satin White Modern Minimalist',
      addonsList: [
        'Luxury Bath Pod with Glass Rain Shower',
        'Smart Thermostat HVAC Mini-Split (18k BTU)',
        'Exterior Pergola Decking Extension',
        'Eco Bio-Digester Blackwater System',
      ],
    },
    pricing: {
      basePrice: 54900,
      optionsTotal: 8400,
      freightCost: 4500,
      sitePrepCost: 5500,
      taxAmount: 0,
      totalPrice: 73300,
      depositDue: 250,
      depositPaid: true,
      currency: 'USD',
    },
    estimatedDeliveryDate: '2026-10-28',
    internalNotes: [
      {
        id: 'note-1',
        author: 'Production Line B',
        text: 'Steel frame welded and anti-corrosion galvanized coating applied.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
      {
        id: 'note-2',
        author: 'Factory Manager',
        text: 'Wall panel insulation injected; electrical rough-in scheduled for tomorrow.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
    ],
  },
  {
    id: 'BX-2026-8902',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    status: 'site_assessment',
    customer: {
      fullName: 'Elena Rostova',
      email: 'elena.rostova@designarch.com',
      phone: '(303) 555-0198',
      deliveryAddress: '780 Pinecrest Blvd, Boulder',
      zipCode: '80302',
      landStatus: 'backyard-adu',
      notes: 'Urban backyard ADU rental unit. City clearance approved.',
    },
    customization: {
      modelId: 'two-bedroom',
      modelName: 'Casita 2-Bedroom',
      wallCladdingName: 'Fluorocarbon Snow White',
      wallCladdingColor: '#f8fafc',
      glazingName: 'Privacy Smart Glass (Switchable Tint)',
      lightingName: 'Architectural Luxe Cove + Dimmables',
      electricalName: 'Smart IoT 200A Automation Hub',
      flooringName: 'Terrazzo Grey Polished Core SPC',
      roofName: 'Rooftop Terrace Observation Deck with Railings',
      cabinetryName: 'Deep Forest Green Modern Accent',
      addonsList: [
        'Luxury Bath Pod with Glass Rain Shower',
        'Built-in Master Bed Suite & Wardrobe',
        'Smart Thermostat HVAC Mini-Split (18k BTU)',
        'Exterior Pergola Decking Extension',
        'Motorized Architectural Blackout Blinds',
      ],
    },
    pricing: {
      basePrice: 119900,
      optionsTotal: 14200,
      freightCost: 4500,
      sitePrepCost: 5500,
      taxAmount: 0,
      totalPrice: 144100,
      depositDue: 250,
      depositPaid: true,
      currency: 'USD',
    },
    estimatedDeliveryDate: '2026-12-05',
    internalNotes: [
      {
        id: 'note-1',
        author: 'Surveyor Team',
        text: 'Conducted drone site survey. Access gate width is 14ft, sufficient for hydraulic trailer.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      },
    ],
  },
  {
    id: 'BX-2026-8519',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    status: 'ready_for_dispatch',
    customer: {
      fullName: 'Red Rock Eco Resort LLC',
      email: 'procurement@redrockresort.io',
      phone: '(928) 449-1120',
      deliveryAddress: 'Highway 179 Mile Marker 8',
      zipCode: '86336',
      landStatus: 'commercial-resort',
      notes: 'First of 6 luxury guest cabins for canyon resort expansion.',
    },
    customization: {
      modelId: 'studio',
      modelName: 'Casita 20ft Studio',
      wallCladdingName: 'WPC Natural Nordic Oak Slats',
      wallCladdingColor: '#78350f',
      glazingName: 'Floor-to-Ceiling Low-E Curtain Wall',
      lightingName: 'Architectural Luxe Cove + Dimmables',
      electricalName: 'Smart IoT 200A Automation Hub',
      flooringName: 'Nordic White Oak SPC Plank',
      roofName: 'Solar + Rooftop Deck Combo Setup',
      cabinetryName: 'Matte Onyx Black Flat-Panel',
      addonsList: [
        'Luxury Bath Pod with Glass Rain Shower',
        'Smart Thermostat HVAC Mini-Split (18k BTU)',
        'Smart Biometric Entry Door Lock',
      ],
    },
    pricing: {
      basePrice: 54900,
      optionsTotal: 11200,
      freightCost: 4500,
      sitePrepCost: 5500,
      taxAmount: 0,
      totalPrice: 76100,
      depositDue: 250,
      depositPaid: true,
      currency: 'USD',
    },
    estimatedDeliveryDate: '2026-10-05',
    internalNotes: [
      {
        id: 'note-1',
        author: 'Quality Inspector #4',
        text: 'Pressure test passed. Water tightness 100%. Electrical circuits verified.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: 'note-2',
        author: 'Logistics Desk',
        text: 'Flatbed oversized transport booked with Western Heavy Haul for Oct 3rd departure.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      },
    ],
  },
];

export const getOrders = (enforceCurrency?: string): CustomerOrder[] => {
  const activeCurrency = normalizeCurrency(enforceCurrency || getSystemCurrency());
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let loaded: CustomerOrder[] = [];
    if (!raw) {
      loaded = SAMPLE_ORDERS;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_ORDERS));
    } else {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        loaded = parsed;
      } else {
        loaded = SAMPLE_ORDERS;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_ORDERS));
      }
    }
    // Strict Single Currency Type guarantee: All orders match the active system currency
    return loaded.map((o) => ({
      ...o,
      pricing: {
        ...o.pricing,
        currency: activeCurrency,
      },
    }));
  } catch (err) {
    console.error('Failed to load orders from localStorage:', err);
    return SAMPLE_ORDERS.map((o) => ({
      ...o,
      pricing: { ...o.pricing, currency: activeCurrency },
    }));
  }
};

export const syncOrdersCurrency = (targetCurrency: string): CustomerOrder[] => {
  const active = normalizeCurrency(targetCurrency);
  const current = getOrders(active);
  const updated = current.map((o) => ({
    ...o,
    pricing: {
      ...o.pricing,
      currency: active,
    },
  }));
  saveOrders(updated);
  return updated;
};

export const saveOrders = (orders: CustomerOrder[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent(ORDERS_EVENT, { detail: orders }));
  } catch (err) {
    console.error('Failed to save orders to localStorage:', err);
  }
};

export const subscribeToOrders = (callback: (orders: CustomerOrder[]) => void): (() => void) => {
  const handler = () => {
    callback(getOrders());
  };
  window.addEventListener(ORDERS_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(ORDERS_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
};

export const addOrder = (orderData: Omit<CustomerOrder, 'id' | 'createdAt' | 'updatedAt' | 'internalNotes'> & { initialNote?: string }): CustomerOrder => {
  const activeCurrency = normalizeCurrency(orderData.pricing?.currency || getSystemCurrency());
  const orders = getOrders(activeCurrency);
  const now = new Date().toISOString();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newOrder: CustomerOrder = {
    ...orderData,
    id: `BX-2026-${randomSuffix}`,
    createdAt: now,
    updatedAt: now,
    pricing: {
      ...orderData.pricing,
      currency: activeCurrency,
    },
    internalNotes: orderData.initialNote
      ? [
          {
            id: `note-${Date.now()}`,
            author: 'System',
            text: orderData.initialNote,
            createdAt: now,
          },
        ]
      : [
          {
            id: `note-${Date.now()}`,
            author: 'System',
            text: 'Order placed online through 3D Configurator reservation form.',
            createdAt: now,
          },
        ],
  };

  const updatedOrders = [newOrder, ...orders];
  saveOrders(updatedOrders);
  return newOrder;
};

export const updateOrderStatus = (orderId: string, status: OrderStatus, noteText?: string): CustomerOrder | null => {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const target = orders[index];
  const newNotes = [...(target.internalNotes || [])];

  if (noteText) {
    newNotes.unshift({
      id: `note-${Date.now()}`,
      author: 'Admin',
      text: noteText,
      createdAt: now,
    });
  } else {
    newNotes.unshift({
      id: `note-${Date.now()}`,
      author: 'Admin',
      text: `Status updated to: ${status.replace(/_/g, ' ').toUpperCase()}`,
      createdAt: now,
    });
  }

  const updatedOrder: CustomerOrder = {
    ...target,
    status,
    updatedAt: now,
    internalNotes: newNotes,
  };

  orders[index] = updatedOrder;
  saveOrders(orders);
  return updatedOrder;
};

export const updateOrderDetails = (orderId: string, updates: Partial<CustomerOrder>): CustomerOrder | null => {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const updatedOrder: CustomerOrder = {
    ...orders[index],
    ...updates,
    updatedAt: now,
  };

  orders[index] = updatedOrder;
  saveOrders(orders);
  return updatedOrder;
};

export const addOrderNote = (orderId: string, noteText: string, author: string = 'Admin'): CustomerOrder | null => {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const newNote = {
    id: `note-${Date.now()}`,
    author,
    text: noteText,
    createdAt: now,
  };

  const updatedOrder: CustomerOrder = {
    ...orders[index],
    updatedAt: now,
    internalNotes: [newNote, ...(orders[index].internalNotes || [])],
  };

  orders[index] = updatedOrder;
  saveOrders(orders);
  return updatedOrder;
};

export const deleteOrderNote = (orderId: string, noteId: string): CustomerOrder | null => {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const updatedOrder: CustomerOrder = {
    ...orders[index],
    updatedAt: new Date().toISOString(),
    internalNotes: (orders[index].internalNotes || []).filter((n) => n.id !== noteId),
  };

  orders[index] = updatedOrder;
  saveOrders(orders);
  return updatedOrder;
};

export const deleteOrder = (orderId: string): boolean => {
  const orders = getOrders();
  const filtered = orders.filter((o) => o.id !== orderId);
  if (filtered.length === orders.length) return false;
  saveOrders(filtered);
  return true;
};

export const resetSampleOrders = (): CustomerOrder[] => {
  saveOrders(SAMPLE_ORDERS);
  return SAMPLE_ORDERS;
};
