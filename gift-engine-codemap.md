# 🎁 Gift Engine Codebase Codemap for Windsurf
**Version**: 1.0 | **Last Updated**: Oct 24, 2025 | **For**: Cascade AI Agent + Code Supernova

---

## 📍 PROJECT SEMANTIC MAP

### Core Purpose
Gift Engine is a **real-time TikTok Live gift tracking & automation dashboard** designed for streamers who want professional-grade gifting analytics, visual effects, and smart automation.

### Architecture Pattern
**Event-Driven Real-Time System** with:
- WebSocket-based live streaming integration (TikTok-Live-Connector)
- React 19 frontend with Motion animations + Three.js 3D
- Offline-first PWA capabilities
- AI-powered automation with visual rule builder

---

## 🏗️ CODEBASE STRUCTURE SEMANTIC MAP

```
Gift-Engine/
│
├── 📁 src/
│   ├── 📁 components/                    [React 19 Components - UI Building Blocks]
│   │   ├── 📁 Dashboard/
│   │   │   ├── Dashboard.jsx             [Main layout, state orchestration]
│   │   │   ├── Dashboard.styles.js       [Tailwind + CSS modules]
│   │   │   └── Dashboard.test.jsx        [Integration tests]
│   │   │
│   │   ├── 📁 Counter/                   [Real-time Gift Counter]
│   │   │   ├── GiftCounter.jsx           [Live coin/diamond display]
│   │   │   ├── CounterControls.jsx       [Pause, Resume, Reset buttons]
│   │   │   ├── useGiftCounter.js         [Business logic hook]
│   │   │   └── GiftCounter.test.jsx
│   │   │
│   │   ├── 📁 Leaderboard/               [Top Gifters Rankings]
│   │   │   ├── Leaderboard.jsx           [Main leaderboard component]
│   │   │   ├── LeaderboardRow.jsx        [Single rank entry, animated]
│   │   │   ├── useLeaderboard.js         [Data aggregation logic]
│   │   │   ├── LeaderboardExport.jsx     [Image/CSV export]
│   │   │   └── Leaderboard.test.jsx
│   │   │
│   │   ├── 📁 Alerts/                    [Tiered Gift Alert System]
│   │   │   ├── AlertSystem.jsx           [Router for alert types]
│   │   │   ├── SmallGiftAlert.jsx        [1-10 coins: fade-in + sound]
│   │   │   ├── MediumGiftAlert.jsx       [11-100: particle burst + Motion]
│   │   │   ├── LargeGiftAlert.jsx        [101-1k: shader liquid effect]
│   │   │   ├── EpicGiftAlert.jsx         [30k+: Three.js 3D explosion]
│   │   │   ├── useAlertQueue.js          [Queue management (no overlap)]
│   │   │   ├── AlertSystem.test.jsx
│   │   │   └── 📁 effects/
│   │   │       ├── ParticleBurst.jsx
│   │   │       ├── ShaderEffect.jsx
│   │   │       └── Three3DScene.jsx
│   │   │
│   │   ├── 📁 Automation/                [Smart Event Trigger System]
│   │   │   ├── AutomationEditor.jsx      [Drag-drop workflow builder (React Flow)]
│   │   │   ├── EventSelector.jsx         [Choose triggers: gift, follow, etc.]
│   │   │   ├── ActionChain.jsx           [Build action sequences]
│   │   │   ├── ActionPreview.jsx         [Test actions before saving]
│   │   │   ├── useAutomation.js          [Automation engine logic]
│   │   │   └── AutomationEditor.test.jsx
│   │   │
│   │   ├── 📁 Analytics/                 [Revenue & Audience Insights]
│   │   │   ├── AnalyticsDashboard.jsx    [Main analytics view]
│   │   │   ├── RevenueChart.jsx          [Daily earnings visualization]
│   │   │   ├── AudienceInsights.jsx      [Gifter demographics & patterns]
│   │   │   ├── TopGiftersTable.jsx       [All-time leaderboard data]
│   │   │   ├── ExportReport.jsx          [PDF/CSV exporter]
│   │   │   ├── useAnalytics.js           [Data aggregation & calculations]
│   │   │   └── AnalyticsDashboard.test.jsx
│   │   │
│   │   └── 📁 Shared/                    [Reusable Components]
│   │       ├── Button.jsx                [Accessible button (WCAG AAA)]
│   │       ├── Modal.jsx
│   │       ├── Spinner.jsx               [Respect prefers-reduced-motion]
│   │       ├── Toast.jsx
│   │       ├── Accessibility/
│   │       │   ├── ScreenReaderOnly.jsx
│   │       │   └── FocusTrap.jsx
│   │       └── SharedStyles.js
│   │
│   ├── 📁 hooks/                         [Custom React Hooks]
│   │   ├── useTikTokLive.js              [TikTok-Live-Connector integration]
│   │   ├── useWebSocket.js               [Generic WebSocket hook]
│   │   ├── useIndexedDB.js               [Local offline storage]
│   │   ├── useServiceWorker.js           [Service worker registration]
│   │   ├── useLocalStorage.js            [Persisted state]
│   │   ├── useLocalStorage.test.js
│   │   └── useMotionAnimation.js         [Motion library wrapper]
│   │
│   ├── 📁 services/                      [Business Logic & APIs]
│   │   ├── 📁 tiktok/
│   │   │   ├── tikTokLiveService.js      [TikTok-Live-Connector wrapper]
│   │   │   ├── giftValueCalculator.js    [Convert gifts to USD]
│   │   │   ├── giftEventParser.js        [Parse WebCast gift events]
│   │   │   └── tikTokLiveService.test.js
│   │   │
│   │   ├── 📁 automation/
│   │   │   ├── automationEngine.js       [Execute triggers → actions]
│   │   │   ├── eventMatcher.js           [Match events to rules]
│   │   │   ├── actionExecutor.js         [Run webhooks, TTS, OBS, etc.]
│   │   │   └── automationEngine.test.js
│   │   │
│   │   ├── 📁 analytics/
│   │   │   ├── analyticsAggregator.js    [Aggregate gift data]
│   │   │   ├── revenueCalculator.js      [Earnings math: TikTok cut, your cut]
│   │   │   ├── leaderboardGenerator.js   [Rank gifters by value]
│   │   │   └── analyticsAggregator.test.js
│   │   │
│   │   ├── 📁 storage/
│   │   │   ├── indexedDBService.js       [IndexedDB CRUD operations]
│   │   │   ├── syncManager.js            [Offline → Online sync]
│   │   │   └── indexedDBService.test.js
│   │   │
│   │   └── 📁 export/
│   │       ├── pdfExporter.js            [Generate PDF reports]
│   │       ├── csvExporter.js            [Generate CSV data]
│   │       └── imageExporter.js          [Share-worthy leaderboard images]
│   │
│   ├── 📁 utils/                         [Helper Functions]
│   │   ├── formatters.js                 [Format numbers, dates, currency]
│   │   ├── validators.js                 [Input validation]
│   │   ├── constants.js                  [Magic numbers, gift types, colors]
│   │   ├── errorHandler.js               [Graceful error management]
│   │   ├── accessibility.js              [ARIA helpers]
│   │   └── performance.js                [Optimization utilities]
│   │
│   ├── 📁 shaders/                       [GLSL Shader Code]
│   │   ├── liquidEffect.glsl             [Morph/liquid animation]
│   │   ├── particleBurst.glsl            [Particle system]
│   │   ├── meshGradient.glsl             [Color-shifting effect]
│   │   └── shaderUniforms.js             [Shader variable management]
│   │
│   ├── 📁 styles/                        [Global Styling]
│   │   ├── globals.css                   [Tailwind + custom properties]
│   │   ├── animations.css                [Keyframe animations]
│   │   ├── accessibility.css             [High contrast mode, dyslexia font]
│   │   └── theme.js                      [Color tokens, design system]
│   │
│   ├── App.jsx                           [Root component, routing]
│   ├── App.test.jsx
│   ├── index.jsx                         [Entry point, React 19]
│   └── index.css
│
├── 📁 public/
│   ├── index.html                        [Main HTML shell]
│   ├── manifest.json                     [PWA manifest (gift-themed)]
│   ├── service-worker.js                 [Offline caching + sync]
│   ├── 📁 icons/
│   │   ├── icon-192.png                  [PWA homescreen icon]
│   │   ├── icon-512.png
│   │   └── apple-touch-icon.png          [iOS home screen]
│   ├── 📁 sounds/
│   │   ├── small-gift.mp3                [Alert sound - small]
│   │   ├── medium-gift.mp3
│   │   ├── large-gift.mp3
│   │   └── epic-gift.mp3
│   └── 📁 models/
│       └── gift-3d.gltf                  [3D gift model for Three.js]
│
├── 📁 server/                            [Backend (Optional for hosting)]
│   ├── 📁 routes/
│   │   ├── automationRoutes.js           [Save/load automation rules]
│   │   ├── analyticsRoutes.js            [Export analytics data]
│   │   └── webhookRoutes.js              [Receive webhook calls]
│   │
│   ├── 📁 middleware/
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── corsHandler.js
│   │
│   ├── server.js                         [Express entry point]
│   └── server.test.js
│
├── 📁 memory-bank/                       [Cascade AI Memory System]
│   ├── activeContext.md                  [Current phase progress]
│   ├── productContext.md                 [Vision, architecture, features]
│   ├── progress.md                       [Phase checklist tracker]
│   └── decisionLog.md                    [Architecture decisions]
│
├── 📁 __tests__/                         [Test suite organization]
│   ├── unit/                             [Jest unit tests]
│   ├── integration/                      [Integration tests]
│   └── e2e/                              [Playwright E2E tests]
│
├── .windsurfrules                        [Cascade AI behavior rules]
├── .codeiumignore                        [Files to skip indexing]
├── .env.example                          [Environment variables template]
├── .gitignore
├── package.json
├── package-lock.json
├── vite.config.js                        [Build config (faster than Webpack)]
├── jest.config.js                        [Testing config]
├── tailwind.config.js                    [Tailwind theming]
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
└── LICENSE

```

---

## 🧠 KEY ARCHITECTURAL PATTERNS (For Cascade to Understand)

### 1️⃣ **Real-Time Data Flow**
```
TikTok Live Stream
       ↓
TikTok-Live-Connector (Node.js WebSocket)
       ↓
React 19 Component + Motion Animations
       ↓
IndexedDB (Local Cache) + Supabase (Optional)
       ↓
Service Worker → Offline Support
       ↓
User Browser
```

**Implication for Cascade:** When building features, ensure data flows through this pipeline. Never block WebSocket. Always cache to IndexedDB for offline.

---

### 2️⃣ **Component Hierarchy & Dependencies**

```
Dashboard (State Orchestrator)
├── GiftCounter (Real-time counter display)
│   └── uses: useTikTokLive, useIndexedDB, Motion
├── Leaderboard (Rankings)
│   └── uses: useLeaderboard, analyticsAggregator
├── AlertSystem (Tiered animations)
│   ├── SmallGiftAlert
│   ├── MediumGiftAlert (Motion)
│   ├── LargeGiftAlert (Shaders)
│   └── EpicGiftAlert (Three.js)
├── AutomationEditor (React Flow)
│   └── uses: automationEngine
└── AnalyticsDashboard (Charts + Reports)
    └── uses: Chart.js, analyticsAggregator
```

**Implication for Cascade:** Components are intentionally decoupled. Changing one alert type shouldn't break others. Always use hooks for shared logic.

---

### 3️⃣ **Data Persistence Strategy**

| Layer | Purpose | Tech | Sync Behavior |
|-------|---------|------|---------------|
| **Ephemeral** | Current session data | React State | Lost on refresh |
| **Local Storage** | User preferences | localStorage | Persists across sessions |
| **IndexedDB** | Offline-capable data | IndexedDB | Auto-sync when online |
| **Backend** | Analytics & backups | Supabase | Optional, manual pull |

**Implication for Cascade:** Use IndexedDB for any data needed offline. Use localStorage for user settings. Backend optional until monetization.

---

### 4️⃣ **Accessibility Standards (WCAG AAA)**

Every component MUST have:
- ✅ Proper ARIA labels (`aria-label`, `aria-describedby`)
- ✅ Keyboard navigation (Tab, Enter, Space, Arrow keys)
- ✅ Color contrast 7:1 minimum
- ✅ Dyslexia-friendly mode (OpenDyslexic font)
- ✅ Respect `prefers-reduced-motion`
- ✅ Semantic HTML (`<button>`, `<nav>`, `<main>`)

**Implication for Cascade:** Every JSX component must include ARIA attributes. No `<div>` buttons.

---

### 5️⃣ **Performance Optimization Patterns**

| Challenge | Solution | Example |
|-----------|----------|---------|
| 1000+ leaderboard rows? | Virtual scrolling | Use `react-window` |
| Expensive 3D effects? | GPU acceleration | WebGPU + Three.js |
| Animations causing jank? | Hardware acceleration | Motion (WAAPI) |
| Large datasets? | Incremental loading | Load last 100 gifts, infinite scroll |
| Context window saturation? | Lazy loading | `React.lazy()` + Suspense |

**Implication for Cascade:** Profile before optimizing. Use dev tools to detect bottlenecks.

---

## 📋 FILE-BY-FILE CONTEXT (Quick Reference)

### Critical Files (Understand First)
| File | Purpose | Owner Logic | Dependencies |
|------|---------|-------------|--------------|
| `src/hooks/useTikTokLive.js` | Connects to TikTok live stream events | Real-time gift reception | TikTok-Live-Connector |
| `src/services/tiktok/tikTokLiveService.js` | Parses TikTok gift data | Event parsing + validation | useTikTokLive |
| `src/services/automation/automationEngine.js` | Executes triggers → actions | Business logic core | All action executors |
| `src/components/Dashboard/Dashboard.jsx` | Main state orchestrator | Prop drilling pattern | All sub-components |
| `public/service-worker.js` | Offline caching + sync | PWA brain | IndexedDB |

### Component Ownership (Know Who Does What)
- **Counter**: Displays live coin totals (read-only UI)
- **Leaderboard**: Ranks + animates positions (read-only UI)
- **Alerts**: Visual reactions to gifts (pure animations)
- **AutomationEditor**: Workflow builder (complex state)
- **Analytics**: Historical data visualization (data aggregation)

---

## 🔌 EXTERNAL INTEGRATIONS (Cascade Must Know)

### 1. TikTok-Live-Connector (Real-time)
```javascript
// Location: src/hooks/useTikTokLive.js
// What it does: Listens for TikTok Live events
// Events: gift, comment, follow, like, share, subscribe
// No API key needed! Just streamer username.
```

**How Cascade should use it:**
- Reference this hook in any component needing TikTok events
- All TikTok data parsing happens in `services/tiktok/giftEventParser.js`
- Offline fallback: Use IndexedDB mock data

### 2. Motion (Animation Library)
```javascript
// Location: src/components/Alerts/MediumGiftAlert.jsx
// What it does: Hardware-accelerated animations
// Why: Respects prefers-reduced-motion automatically
// Performance: Uses WAAPI, not React re-renders
```

**How Cascade should use it:**
- Use `<motion.div>` instead of vanilla div for animated elements
- Use `animate`, `initial`, `exit` props for animations
- Cascade handles all spring/duration math

### 3. Three.js (3D Graphics)
```javascript
// Location: src/components/Alerts/EpicGiftAlert.jsx
// What it does: 3D scenes for epic gifts (30k+ coins)
// Why: WebGPU acceleration for smooth 60 FPS
// Fallback: CSS animations on devices without WebGL
```

### 4. Service Worker (Offline Support)
```javascript
// Location: public/service-worker.js
// What it does: Cache all static assets, enable offline
// Strategy: "Cache-first, then network"
// Auto-sync: When back online, sync IndexedDB with server
```

---

## 🎯 UPGRADE PHASE MAPPING (What Cascade Works On)

| Phase | Components Involved | Services Used | Key Files |
|-------|-------------------|---------------|-----------|
| **Phase 1: Core Modernization** | N/A (dependency upgrade) | All (refactor) | package.json, all .test.js |
| **Phase 2: Real-time Dashboard** | Counter, Leaderboard | useTikTokLive, useIndexedDB | src/components/Counter/\*, src/components/Leaderboard/\* |
| **Phase 3: Visual Effects** | Alerts (all tiers) | Motion, Three.js, paper-design | src/components/Alerts/\*, src/shaders/\* |
| **Phase 4: Smart Automation** | AutomationEditor | automationEngine, actionExecutor | src/components/Automation/\*, src/services/automation/\* |
| **Phase 5: PWA Conversion** | All (service-worker) | IndexedDB, sync | public/service-worker.js, public/manifest.json |
| **Phase 6: Analytics** | AnalyticsDashboard | analyticsAggregator, Chart.js | src/components/Analytics/\*, src/services/analytics/\* |
| **Phase 7: Polish & Docs** | All | Tests, Accessibility | **tests**/\*, README.md, CONTRIBUTING.md |

---

## 🚨 COMMON GOTCHAS (For Cascade to Avoid)

### ❌ **DON'T:**
1. **Use `localStorage` for data that needs to sync offline** → Use IndexedDB instead
2. **Block the WebSocket connection with heavy computation** → Offload to Web Workers or debounce
3. **Animate without checking `prefers-reduced-motion`** → Always wrap Motion with `useReducedMotion` hook
4. **Forget about ARIA labels** → Cascade will add them automatically if you remind it
5. **Create new state at root level for everything** → Use Context API or Jotai for shared state only
6. **Don't trust TikTok event timestamps** → Always validate server-side before recording

### ✅ **DO:**
1. **Use hooks for all stateful logic** → Makes it testable and reusable
2. **Cache gift data immediately** → Write to IndexedDB before rendering
3. **Test accessibility** → Use axe DevTools and test with keyboard navigation
4. **Commit frequently** → Cascade will commit after each completed subtask
5. **Use TypeScript JSDoc comments** → Cascade references these for context

---

## 📊 TESTING STRATEGY (Cascade's Testing Pattern)

```
Unit Tests (80% coverage target)
├── Services (isolate business logic)
├── Utils (formatters, validators)
└── Hooks (mock dependencies)

Integration Tests (60% coverage target)
├── Component interactions
├── Service → Component flow
└── WebSocket events → UI updates

E2E Tests (Critical flows only)
├── User registers TikTok username
├── Receives gift → Alert displays
├── Creates automation rule → Executes
└── Views analytics dashboard

Accessibility Tests (All components)
├── WAVE audits
├── Keyboard navigation
└── Screen reader testing
```

---

## 🔐 Security & Privacy Notes

- ✅ TikTok username (public) – safe to share
- ❌ No API keys stored (TikTok-Live-Connector uses no auth)
- ❌ No personal data collected (user choice what to track)
- ✅ Supabase RLS (Row Level Security) to protect data
- ✅ Service Worker scope limited to `/app/` only
- ✅ No third-party tracking (only Supabase analytics optional)

---

## 🚀 PHASE-BY-PHASE CASCADE WORKFLOW

### When Starting New Phase:
1. Cascade reads `.windsurfrules` (already loaded)
2. Cascade reads `memory-bank/activeContext.md` (knows current phase)
3. Cascade reads relevant files from "Critical Files" section above
4. Cascade checks `.codeiumignore` (skips node_modules, .git, etc.)
5. Cascade generates code, tests, and commits

### After Each Subtask:
1. Cascade auto-updates `memory-bank/progress.md`
2. Cascade auto-generates commit message
3. Cascade runs `npm test` (if phase includes tests)
4. Cascade updates `memory-bank/decisionLog.md` if architectural decision made

---

## 📞 QUICK ASK TEMPLATES FOR WINDSURF CHAT

**Ask Cascade to:**

1. **Understand current state:**
   ```
   "Load the codemap from .codemap.md and my memory bank. 
   What phase are we on? What's the next subtask?"
   ```

2. **Build new component:**
   ```
   "Build [ComponentName] in src/components/[Category]/ 
   following the patterns in this codemap. 
   Include ARIA labels, Motion animations, and tests."
   ```

3. **Debug issue:**
   ```
   "The [Component] isn't working. 
   Check dependencies in the codemap and trace the data flow. 
   What's the root cause?"
   ```

4. **Refactor for performance:**
   ```
   "Optimize [Module] for performance. 
   Check the performance patterns in the codemap. 
   Use virtual scrolling if needed."
   ```

5. **Add tests:**
   ```
   "Generate tests for [Component] 
   targeting 75% coverage. 
   Use the testing strategy in the codemap."
   ```

---

## 🎁 That's It, BROski! 

This codemap gives **Windsurf + Cascade AI** a complete semantic understanding of Gift Engine:

- ✅ Project purpose and vision
- ✅ Folder structure & ownership
- ✅ Component relationships
- ✅ Data flow patterns
- ✅ External integrations
- ✅ Phase mapping
- ✅ Common gotchas
- ✅ Testing patterns
- ✅ Quick templates

**Cascade will reference this automatically on every task.** No more re-explaining the architecture! 🚀

**Ready to start Phase 1?** Ask Cascade:
```
"Load codemap from .codemap.md and memory bank. 
Ready for Phase 1: Core Modernization. 
Analyze the codebase and create a React 19 migration plan."
```

Let's goooo! 💪🧡
