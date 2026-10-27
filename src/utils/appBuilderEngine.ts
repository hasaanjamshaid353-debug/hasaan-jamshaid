export interface SchemaTable {
  table: string;
  description: string;
  fields: string[];
}

export interface AppScreen {
  name: string;
  route: string;
  description: string;
  components: string[];
  userActions: string[];
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  body?: string;
}

export interface AppMilestone {
  phase: string;
  title: string;
  timeline: string;
  tasks: string[];
}

export interface AppBlueprint {
  appName: string;
  tagline: string;
  platform: 'web' | 'mobile' | 'fullstack';
  category: string;
  targetAudience: string;
  summary: string;
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    auth: string;
    styling: string;
    deployment: string;
  };
  databaseSchema: SchemaTable[];
  screens: AppScreen[];
  apiEndpoints: ApiEndpoint[];
  starterCode: string;
  roadmap: AppMilestone[];
  bestPractices: string[];
}

export const APP_TEMPLATES = [
  {
    id: 'ai-studio-assistant',
    name: 'Fast GPT & AI Studio (Like This App)',
    category: 'AI Assistant / Studio',
    icon: 'Sparkles',
    description: 'Complete multi-modal AI Studio app with real-time streaming chat, voice input deduplication, Code Playground, Image Studio, 10s Video Director, and App Architect.',
    defaultPlatform: 'fullstack' as const,
  },
  {
    id: 'saas-dashboard',
    name: 'AI SaaS Platform & Dashboard',
    category: 'SaaS / AI Tools',
    icon: 'Brain',
    description: 'Complete subscription-based SaaS app with API key management, analytics dashboard, team workspaces, and Stripe billing.',
    defaultPlatform: 'fullstack' as const,
  },
  {
    id: 'ecommerce-store',
    name: 'Modern E-Commerce Store',
    category: 'E-Commerce / Shopping',
    icon: 'ShoppingBag',
    description: 'High-conversion online store with product catalog, smart search, cart drawer, checkout flow, customer reviews, and order tracking.',
    defaultPlatform: 'web' as const,
  },
  {
    id: 'social-community',
    name: 'Community & Social Network',
    category: 'Social / Community',
    icon: 'Users',
    description: 'Interactive social platform with activity feed, user profiles, instant direct messaging, media posts, comments, and like reactions.',
    defaultPlatform: 'mobile' as const,
  },
  {
    id: 'food-delivery',
    name: 'On-Demand Food & Grocery Delivery',
    category: 'Delivery / Marketplace',
    icon: 'Truck',
    description: 'Multi-vendor food ordering app with restaurant menus, real-time rider tracking on maps, basket management, and order status.',
    defaultPlatform: 'mobile' as const,
  },
  {
    id: 'fitness-tracker',
    name: 'AI Habit & Fitness Coach',
    category: 'Health / Fitness',
    icon: 'Activity',
    description: 'Personal workout and habit tracking app with streak counters, calorie logging, daily progress charts, and AI motivation coach.',
    defaultPlatform: 'mobile' as const,
  },
  {
    id: 'lms-academy',
    name: 'Online Academy & Course LMS',
    category: 'Education / EdTech',
    icon: 'GraduationCap',
    description: 'E-learning system with video lecture player, quiz engine, course certificate downloads, student progress bars, and tutor Q&A.',
    defaultPlatform: 'web' as const,
  },
];

export function generateLocalAppBlueprint(
  concept: string,
  category: string = 'SaaS / AI Tools',
  platform: 'web' | 'mobile' | 'fullstack' = 'web',
  customName?: string
): AppBlueprint {
  const cleanConcept = concept.trim() || 'A high-impact web and mobile app with modern UI and seamless user experience';
  
  // Extract or invent app name
  let appName = customName?.trim() || '';
  if (!appName) {
    const words = cleanConcept.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    if (words.length >= 2) {
      appName = `${words[0].charAt(0).toUpperCase() + words[0].slice(1)}${words[1].charAt(0).toUpperCase() + words[1].slice(1)}`;
    } else {
      appName = 'NovaCore App';
    }
  }

  const isEcom = /shop|store|cart|product|buy|sell|ecommerce|market/i.test(cleanConcept);
  const isSocial = /social|community|chat|friend|post|feed|message/i.test(cleanConcept);
  const isDelivery = /delivery|food|ride|uber|driver|order|track/i.test(cleanConcept);
  const isFitness = /fit|gym|workout|health|calorie|habit|track/i.test(cleanConcept);
  const isEdTech = /course|learn|school|student|study|academy|quiz|teach/i.test(cleanConcept);

  // Recommended Tech Stack
  const techStack = {
    frontend: platform === 'mobile' ? 'React Native (Expo SDK 52) / Flutter' : 'React 19 + TypeScript + Vite / Next.js 15 App Router',
    backend: 'Node.js + Express / Next.js Server Actions with TypeScript',
    database: 'PostgreSQL (Supabase / Neon) with Drizzle ORM',
    auth: 'Firebase Auth / NextAuth.js / Supabase Auth (Google, GitHub, Email OTP)',
    styling: 'Tailwind CSS v4 + Framer Motion for cinematic micro-interactions',
    deployment: platform === 'mobile' ? 'iOS App Store & Google Play Store (EAS Build)' : 'Vercel / Cloud Run (Dockerized Container)',
  };

  // Database Schema Tables
  let databaseSchema: SchemaTable[] = [];
  if (isEcom) {
    databaseSchema = [
      {
        table: 'users',
        description: 'Customer and Admin credentials, contact info, and addresses',
        fields: ['id: UUID (PK)', 'email: VARCHAR UNIQUE', 'password_hash: VARCHAR', 'full_name: VARCHAR', 'role: "customer" | "admin"', 'created_at: TIMESTAMP']
      },
      {
        table: 'products',
        description: 'Store inventory items, pricing, images, and categories',
        fields: ['id: UUID (PK)', 'title: VARCHAR', 'slug: VARCHAR UNIQUE', 'price: DECIMAL(10,2)', 'inventory_count: INT', 'images: JSONB[]', 'category_id: UUID (FK)', 'rating: DECIMAL(2,1)']
      },
      {
        table: 'orders',
        description: 'Customer purchase receipts and fulfillment status',
        fields: ['id: UUID (PK)', 'user_id: UUID (FK)', 'total_amount: DECIMAL(10,2)', 'status: "pending" | "paid" | "shipped" | "delivered"', 'payment_intent_id: VARCHAR', 'shipping_address: JSONB']
      },
      {
        table: 'order_items',
        description: 'Individual items contained inside each order',
        fields: ['id: UUID (PK)', 'order_id: UUID (FK)', 'product_id: UUID (FK)', 'quantity: INT', 'unit_price: DECIMAL(10,2)']
      }
    ];
  } else if (isSocial) {
    databaseSchema = [
      {
        table: 'users',
        description: 'Registered user profiles, handles, avatars, and bios',
        fields: ['id: UUID (PK)', 'username: VARCHAR UNIQUE', 'email: VARCHAR UNIQUE', 'display_name: VARCHAR', 'avatar_url: VARCHAR', 'bio: TEXT', 'created_at: TIMESTAMP']
      },
      {
        table: 'posts',
        description: 'User-created text, photo, and video publications',
        fields: ['id: UUID (PK)', 'author_id: UUID (FK)', 'content: TEXT', 'media_urls: JSONB[]', 'likes_count: INT DEFAULT 0', 'comments_count: INT DEFAULT 0', 'created_at: TIMESTAMP']
      },
      {
        table: 'comments',
        description: 'Discussions and replies threaded on posts',
        fields: ['id: UUID (PK)', 'post_id: UUID (FK)', 'user_id: UUID (FK)', 'comment_text: TEXT', 'created_at: TIMESTAMP']
      },
      {
        table: 'follows',
        description: 'Social graph connections between users',
        fields: ['follower_id: UUID (FK)', 'following_id: UUID (FK)', 'created_at: TIMESTAMP (Composite PK)']
      }
    ];
  } else {
    databaseSchema = [
      {
        table: 'users',
        description: 'Account owners, access privileges, and profile settings',
        fields: ['id: UUID (PK)', 'email: VARCHAR UNIQUE', 'name: VARCHAR', 'avatar_url: VARCHAR', 'plan: "free" | "pro" | "enterprise"', 'created_at: TIMESTAMP']
      },
      {
        table: 'workspaces',
        description: 'Collaborative containers for user projects and data',
        fields: ['id: UUID (PK)', 'owner_id: UUID (FK)', 'name: VARCHAR', 'slug: VARCHAR UNIQUE', 'settings: JSONB']
      },
      {
        table: 'app_items',
        description: 'Core entities, tasks, or resources created within the app',
        fields: ['id: UUID (PK)', 'workspace_id: UUID (FK)', 'title: VARCHAR', 'status: "active" | "completed" | "archived"', 'metadata: JSONB', 'updated_at: TIMESTAMP']
      },
      {
        table: 'api_keys',
        description: 'Encrypted tokens for developer access and integrations',
        fields: ['id: UUID (PK)', 'user_id: UUID (FK)', 'key_hash: VARCHAR', 'name: VARCHAR', 'last_used_at: TIMESTAMP']
      }
    ];
  }

  // Screens and UI Navigation Flow
  const screens: AppScreen[] = [
    {
      name: 'Landing & Onboarding Screen',
      route: '/',
      description: 'High-converting hero introduction, value proposition, live interactive demo, and 1-click Google sign-up.',
      components: ['HeroSection', 'FeatureShowcase', 'SocialProofBadge', 'InteractiveDemoCard', 'PricingTable'],
      userActions: ['View key features', 'Sign up via Google/Email', 'Test interactive preview'],
    },
    {
      name: 'Authentication & Profile Setup',
      route: '/auth',
      description: 'Streamlined sign-in and sign-up with passwordless magic links, biometric login, and role selection.',
      components: ['AuthForm', 'OAuthButtons', 'PasswordStrengthMeter', 'TermsAgreementCheck'],
      userActions: ['Login', 'Register account', 'Reset password', 'Accept terms'],
    },
    {
      name: 'Main App Dashboard & Hub',
      route: '/dashboard',
      description: 'The operational command center where users manage their core resources, see real-time metrics, and take quick actions.',
      components: ['StatsOverviewBar', 'ResourceListGrid', 'QuickActionFab', 'FilterToolbar', 'NotificationBell'],
      userActions: ['Create new item', 'Filter & search records', 'View analytics trends', 'Export reports'],
    },
    {
      name: 'Detail & Resource Management View',
      route: '/items/:id',
      description: 'In-depth editor and inspector for individual assets, providing granular edits, status toggles, and live previews.',
      components: ['DetailHeader', 'TabbedInspector', 'LivePreviewPane', 'AuditHistoryLog', 'DeleteConfirmationModal'],
      userActions: ['Edit attributes', 'Upload attachments', 'Share with collaborators', 'Archive or delete'],
    },
    {
      name: 'Settings & Workspace Configuration',
      route: '/settings',
      description: 'User preferences, team invitations, theme switcher, billing plan management, and API access keys.',
      components: ['ProfileSettingsForm', 'BillingSubscriptionCard', 'ApiKeyManager', 'DangerZoneDeleteAccount'],
      userActions: ['Upgrade plan via Stripe', 'Regenerate API keys', 'Toggle dark mode', 'Invite team members'],
    },
  ];

  // API Endpoints
  const apiEndpoints: ApiEndpoint[] = [
    {
      method: 'POST',
      endpoint: '/api/auth/register',
      description: 'Registers a new user and issues a secure JWT session cookie',
      body: '{\n  "email": "user@example.com",\n  "password": "SecurePassword123!",\n  "fullName": "Alex Smith"\n}'
    },
    {
      method: 'GET',
      endpoint: '/api/items',
      description: 'Retrieves paginated items with search query and filter parameters',
    },
    {
      method: 'POST',
      endpoint: '/api/items',
      description: 'Creates a new item and triggers instant WebSocket or SSE notification',
      body: '{\n  "title": "New Project Asset",\n  "category": "Design",\n  "metadata": { "priority": "high" }\n}'
    },
    {
      method: 'PUT',
      endpoint: '/api/items/:id',
      description: 'Updates properties of an existing item with optimistic UI updates',
      body: '{\n  "status": "completed",\n  "notes": "Finished review"\n}'
    },
    {
      method: 'DELETE',
      endpoint: '/api/items/:id',
      description: 'Permanently deletes or soft-archives a specific record',
    },
  ];

  // Complete, runnable starter code for the main screen
  const starterCode = `import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Plus, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Layers, 
  TrendingUp, 
  ArrowUpRight,
  ChevronRight,
  MoreVertical
} from 'lucide-react';

interface AppItem {
  id: string;
  title: string;
  category: string;
  status: 'active' | 'in_progress' | 'completed';
  metric: string;
  updatedAt: string;
}

export default function ${appName.replace(/[^a-zA-Z0-9]/g, '')}Dashboard() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [items, setItems] = useState<AppItem[]>([
    {
      id: 'item-1',
      title: 'Automated Growth Engine',
      category: 'Marketing',
      status: 'active',
      metric: '+48.2% Growth',
      updatedAt: '2 hours ago',
    },
    {
      id: 'item-2',
      title: 'Realtime Data Sync Pipeline',
      category: 'Engineering',
      status: 'in_progress',
      metric: '99.98% Uptime',
      updatedAt: 'Yesterday',
    },
    {
      id: 'item-3',
      title: 'Customer Onboarding Flow',
      category: 'Product',
      status: 'completed',
      metric: '3.4k Users',
      updatedAt: '3 days ago',
    },
  ]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.category.toLowerCase().includes(search.toLowerCase());
      if (filter === 'all') return matchSearch;
      if (filter === 'completed') return matchSearch && item.status === 'completed';
      return matchSearch && item.status !== 'completed';
    });
  }, [items, search, filter]);

  const handleCreate = () => {
    const title = prompt('Enter a new item title:') || 'New Smart Task';
    const newItem: AppItem = {
      id: \`item-\${Date.now()}\`,
      title,
      category: 'General',
      status: 'active',
      metric: 'Active',
      updatedAt: 'Just now',
    };
    setItems([newItem, ...items]);
  };

  return (
    <div className="min-h-screen bg-[#0e1117] text-slate-100 p-4 sm:p-8 font-sans antialiased">
      {/* Top Navbar */}
      <header className="max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-white/10 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 font-bold text-lg">
            ${appName.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">${appName}</h1>
            <p className="text-xs text-slate-400">${cleanConcept.slice(0, 45)}...</p>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#161a23] border border-white/5 space-y-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Active Metrics
            </span>
            <div className="text-2xl font-bold text-white tracking-tight">98.4%</div>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +14% this week
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#161a23] border border-white/5 space-y-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              Total Items
            </span>
            <div className="text-2xl font-bold text-white tracking-tight">{items.length}</div>
            <p className="text-[11px] text-slate-400">Synchronized via real-time DB</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#161a23] border border-white/5 space-y-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Efficiency Score
            </span>
            <div className="text-2xl font-bold text-white tracking-tight">A+ Tier</div>
            <p className="text-[11px] text-purple-300">Fast responsive layout</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-[#161a23] rounded-2xl border border-white/5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items, tags, or categories..."
              className="w-full pl-9 pr-4 py-2 bg-transparent text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {(['all', 'active', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={\`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer \${
                  filter === tab
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'text-slate-400 hover:text-white'
                }\`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Resource List Items */}
        <div className="space-y-2.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[#161a23] hover:bg-[#1b202c] border border-white/5 transition flex items-center justify-between gap-4 group cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-cyan-300 transition shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition truncate">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 font-medium">
                      {item.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {item.updatedAt}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono font-bold text-cyan-400 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  {item.metric}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}`;

  // Step-by-step Execution Roadmap
  const roadmap: AppMilestone[] = [
    {
      phase: 'Sprint 1',
      title: 'Foundation & Authentication',
      timeline: 'Days 1 - 3',
      tasks: [
        'Initialize Vite React / Next.js project with Tailwind CSS and TypeScript',
        'Configure PostgreSQL database connection and deploy initial migration tables',
        'Set up secure Authentication (Google OAuth + Email magic link) with session cookies',
        'Establish global state management and layout shells'
      ]
    },
    {
      phase: 'Sprint 2',
      title: 'Core Feature Engine & CRUD Operations',
      timeline: 'Days 4 - 8',
      tasks: [
        'Build main dashboard view with live data fetching and optimistic UI mutations',
        'Implement creation modal and granular resource detail inspector',
        'Integrate real-time search, category filtering, and sorting algorithms',
        'Connect server-side API endpoints with error boundary handlers'
      ]
    },
    {
      phase: 'Sprint 3',
      title: 'Polishing, Micro-Interactions & Payments',
      timeline: 'Days 9 - 12',
      tasks: [
        'Add smooth Framer Motion entrance transitions and responsive mobile drawer navigation',
        'Integrate Stripe Checkout webhook listener for recurring subscriptions',
        'Implement dark/light mode persistence and localized UI text',
        'Run end-to-end user testing and Lighthouse audit optimization (>95 score)'
      ]
    },
    {
      phase: 'Sprint 4',
      title: 'Production Launch & Growth Tracking',
      timeline: 'Days 13 - 15',
      tasks: [
        'Configure domain DNS, SSL certificates, and CI/CD automated deployment',
        'Set up error monitoring (Sentry) and privacy-first analytics (PostHog)',
        'Submit to Product Hunt, Reddit communities, and Google Play / App Store',
        'Gather user feedback loop to drive next iteration cycle'
      ]
    }
  ];

  // Best practices to make it the best app
  const bestPractices = [
    'Zero-Latency Optimistic UI: Update screens immediately on user clicks before server response for an ultra-fast native feel.',
    'Mobile-First Responsive Discipline: Ensure bottom-navigation touch targets are at least 44x44px for effortless thumb navigation.',
    'Progressive Web App (PWA) Offline Cache: Allow users to view recent data even without internet access.',
    'Clear Frictionless Onboarding: Provide interactive pre-filled sample templates so new users experience value in under 30 seconds.',
    'Strict Data Security & RBAC: Enforce database Row-Level Security (RLS) on every table to guarantee data isolation between users.'
  ];

  return {
    appName,
    tagline: `Next-generation ${category} application engineered for speed and conversion.`,
    platform,
    category,
    targetAudience: 'Modern professionals, creators, and teams seeking seamless digital productivity.',
    summary: cleanConcept,
    techStack,
    databaseSchema,
    screens,
    apiEndpoints,
    starterCode,
    roadmap,
    bestPractices,
  };
}
