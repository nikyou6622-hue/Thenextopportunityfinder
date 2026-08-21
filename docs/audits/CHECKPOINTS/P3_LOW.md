# P3 — LOW PRIORITY CHECKPOINTS

```text
CHECKPOINT: CP-301
TASK: PWA Manifest & Service Worker
PRIORITY: P3
CURRENT STATUS: No manifest.json or service worker configured
FILES: web/public/manifest.json, web/src/serviceWorker.js, web/index.html
DEPENDENCIES: Workbox / Vanilla ServiceWorker
IMPLEMENTATION REQUIREMENTS:
  Create web manifest with 192x192 and 512x512 icons, dark theme colors, and offline static asset cache.
TEST REQUIREMENTS:
  Lighthouse PWA audit passes with 100%.
SECURITY REQUIREMENTS:
  Cache only public static assets, never sensitive user data.
DONE WHEN:
  Browser shows "Install Thenextopportunity" prompt.
STATUS: NOT STARTED
```

```text
CHECKPOINT: CP-302
TASK: Global Command Palette (Cmd+K)
PRIORITY: P3
CURRENT STATUS: Navigation via Sidebar / Top bar only
FILES: web/src/components/CommandPaletteModal.jsx, web/src/App.jsx
DEPENDENCIES: Lucide-React
IMPLEMENTATION REQUIREMENTS:
  Listen for `Cmd+K` / `Ctrl+K` keydown event, display floating search dialog for quick-jumping to any tab, role, or DSA challenge.
TEST REQUIREMENTS:
  Verify keyboard navigation inside palette.
SECURITY REQUIREMENTS:
  None.
DONE WHEN:
  User can press Cmd+K and jump instantly to any feature.
STATUS: NOT STARTED
```
