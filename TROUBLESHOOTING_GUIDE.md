# 🔧 Troubleshooting Guide — Common Issues & Solutions

**Version:** 1.0.0 (August 2026)  
**Status:** Production Ready  
**Last Updated:** August 12, 2026  

---

## 📋 Table of Contents

1. [Installation Issues](#installation-issues)
2. [Development Issues](#development-issues)
3. [Testing Issues](#testing-issues)
4. [Build Issues](#build-issues)
5. [Runtime Issues](#runtime-issues)
6. [API Issues](#api-issues)
7. [Performance Issues](#performance-issues)
8. [Deployment Issues](#deployment-issues)
9. [Browser Issues](#browser-issues)

---

## 📦 Installation Issues

### Issue: `npm install` fails

**Symptoms:** Error during dependency installation

**Solutions:**

```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Delete lock file and node_modules
rm -rf node_modules package-lock.json
npm install

# 3. Use different npm registry
npm install --registry https://registry.npmmirror.com

# 4. Check Node version
node --version  # Should be 18.x or higher

# 5. Install Node 18 via NVM
nvm install 18
nvm use 18
```

**Common Causes:**
- Outdated npm cache
- Node version mismatch
- Network issues
- Corrupted lock file

---

### Issue: Missing peer dependencies

**Symptoms:** Warning about peer dependency conflicts

**Solution:**

```bash
# See warnings
npm install --verbose

# Install peer dependencies
npm install react@18 react-dom@18 --save

# Verify
npm ls react
```

---

## 🛠️ Development Issues

### Issue: Dev server won't start

**Symptoms:** `npm run dev` fails or server doesn't respond

**Solutions:**

```bash
# 1. Kill existing process on port 5173
lsof -i :5173
kill -9 <PID>

# 2. Check if port is available
netstat -an | grep 5173

# 3. Use different port
npm run dev -- --port 5174

# 4. Check Vite config
cat vite.config.ts  # Verify port setting

# 5. Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

**Common Causes:**
- Port already in use
- Node process stuck
- Vite cache corrupted
- File system issues

---

### Issue: Hot module reload (HMR) not working

**Symptoms:** Changes don't reflect when saving files

**Solutions:**

```bash
# 1. Hard reload browser
Cmd/Ctrl + Shift + R  # Chrome/Firefox
Cmd + Shift + R       # Safari

# 2. Check Vite config for HMR settings
# vite.config.ts
export default {
  server: {
    hmr: {
      host: 'localhost',
      port: 5173,
    }
  }
}

# 3. Clear browser cache
# DevTools → Application → Clear Storage

# 4. Restart dev server
npm run dev
```

---

### Issue: TypeScript errors not showing in dev server

**Symptoms:** Errors only appear after build

**Solutions:**

```bash
# 1. Run type check
npm run type-check

# 2. Check tsconfig.json
cat tsconfig.json

# 3. Enable strict mode in IDE
# .vscode/settings.json
{
  "typescript.validate.enable": true,
  "typescript.tsserver.log": "verbose"
}

# 4. Restart TypeScript server
# VS Code: Cmd + Shift + P → TypeScript: Restart TS Server
```

---

## 🧪 Testing Issues

### Issue: Tests won't run

**Symptoms:** `npm run test` fails

**Solutions:**

```bash
# 1. Check test configuration
cat vitest.config.ts

# 2. Ensure test file pattern matches
ls tests/unit/*.test.ts

# 3. Install test dependencies
npm install --save-dev vitest @testing-library/react

# 4. Run with verbose output
npm run test -- --reporter=verbose

# 5. Check for import errors
npm run type-check
```

---

### Issue: Tests timeout

**Symptoms:** Test takes > 10s and fails

**Solutions:**

```bash
# 1. Increase timeout
npm run test -- --testTimeout=30000

# 2. Check for infinite loops
# Review test code for:
# - Missing await
# - Infinite recursion
# - Missing cleanup

# 3. Debug test
npm run test -- --inspect-brk <test-file>
# Then open chrome://inspect

# 4. Check for heavy operations
# - Database queries
# - API calls
# - File operations
```

---

### Issue: E2E tests fail in CI but pass locally

**Symptoms:** Cypress tests fail in GitHub Actions

**Solutions:**

```bash
# 1. Run headless locally
npm run cypress:headless

# 2. Check CI environment
# .github/workflows/test.yml
- name: Run E2E Tests
  run: npm run cypress:headless
  env:
    VITE_API_URL: ${{ secrets.API_URL }}

# 3. Add debug output
npm run cypress:headless -- --headed --debug

# 4. Check for timing issues
# Add cy.wait() between operations
cy.get('[data-testid="button"]').click();
cy.wait(500);
cy.contains('Success').should('be.visible');

# 5. Record test run
npm run cypress -- --record
```

---

## 🏗️ Build Issues

### Issue: Build fails

**Symptoms:** `npm run build` errors

**Solutions:**

```bash
# 1. Check for TypeScript errors
npm run type-check

# 2. Run linter
npm run lint

# 3. Build with verbose output
npm run build -- --debug

# 4. Clear build cache
rm -rf dist
npm run build

# 5. Check Vite config
cat vite.config.ts

# 6. Check for missing imports
grep -r "from.*\.js'" src/  # No .js in imports

# 7. Verify all dependencies installed
npm ls
```

**Common Causes:**
- TypeScript errors
- Import errors
- Missing dependencies
- Syntax errors

---

### Issue: Build succeeds but bundle is too large

**Symptoms:** `npm run build` completes, but dist > 200KB

**Solutions:**

```bash
# 1. Analyze bundle
npm run analyze:bundle

# 2. Check for duplicate packages
npm ls lodash  # Find duplicates

# 3. Remove unused dependencies
npm list --depth=0

# 4. Check for large images
find dist -name "*.png" -o -name "*.jpg" | xargs ls -lh

# 5. Enable gzip compression
# vite.config.ts
import compression from 'vite-plugin-compression';

export default {
  plugins: [
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    })
  ]
}

# 6. Code split routes
const Medical = lazy(() => import('./sections/PlayerMedicalSection'));
```

---

## 🚀 Runtime Issues

### Issue: Blank white screen

**Symptoms:** Page loads but shows nothing

**Solutions:**

```bash
# 1. Check browser console
F12 → Console tab
# Look for red error messages

# 2. Check index.html
cat dist/index.html
# Verify <div id="root"></div> exists

# 3. Check App.tsx
cat src/App.tsx
# Verify main render logic

# 4. Check for render errors
# Try wrapping in Error Boundary
<ErrorBoundary>
  <App />
</ErrorBoundary>

# 5. Verify assets loaded
F12 → Network tab
# Check for 404 errors on .js/.css files

# 6. Check environment variables
# F12 → Console
console.log(import.meta.env.VITE_API_URL)
```

**Common Causes:**
- Render error
- Missing app root
- Asset not found
- Environment variable missing

---

### Issue: "Cannot find module" error

**Symptoms:** Runtime error: Cannot find module 'X'

**Solutions:**

```bash
# 1. Check import path
# Find file location
find src -name "*.ts" | grep "PlayerMedicalSection"

# 2. Verify export exists
grep "export.*PlayerMedicalSection" \
  src/modules/players/components/sections/PlayerMedicalSection.tsx

# 3. Check barrel exports
cat src/modules/players/components/index.ts
# Should include: export { PlayerMedicalSection } from './sections/...'

# 4. Fix import path
// ❌ Wrong
import { PlayerMedicalSection } from '../PlayerMedicalSection'

// ✅ Right
import { PlayerMedicalSection } from '@/modules/players/components'

# 5. Verify file exists
ls -la src/modules/players/components/sections/PlayerMedicalSection.tsx
```

---

### Issue: React hook errors

**Symptoms:** "Rules of Hooks" warning or error

**Solutions:**

```bash
# 1. Check hook placement
// ❌ Wrong - hook in condition
if (condition) {
  usePlayerMedical(playerId);
}

// ✅ Right - hook at top level
const { data } = usePlayerMedical(playerId);
if (condition) { ... }

# 2. Check hook names
// ❌ Wrong
const medical = playerMedical(playerId);

// ✅ Right
const medical = usePlayerMedical(playerId);

# 3. Enable ESLint rule
// .eslintrc
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error"
  }
}
```

---

## 🔗 API Issues

### Issue: API calls return 401 Unauthorized

**Symptoms:** API endpoints return 401 error

**Solutions:**

```bash
# 1. Check auth token
# Browser DevTools → Application → Local Storage
localStorage.getItem('authToken')

# 2. Check token format
# Should be: "Bearer eyJhbGciOiJIUzI1NiIs..."

# 3. Verify token not expired
# Decode token at jwt.io
# Check 'exp' claim

# 4. Check API auth logic
// src/config/api.ts
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

# 5. Try login again
# Test: POST /auth/login/
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

---

### Issue: CORS error

**Symptoms:** "Access to XMLHttpRequest blocked by CORS policy"

**Solutions:**

```bash
# 1. Check API CORS headers
curl -I -H "Origin: http://localhost:5173" \
  http://localhost:8000/api/v1/players/

# Should include:
# Access-Control-Allow-Origin: http://localhost:5173
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE

# 2. Verify API URL in env
cat .env.local
# VITE_API_URL should match CORS origin

# 3. Check Django CORS settings
# Backend: settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://bolayetu.com",
]

# 4. Test API directly
curl http://localhost:8000/api/v1/health/

# 5. Check if API is running
nc -zv localhost 8000
```

---

### Issue: API timeout

**Symptoms:** Request never completes, times out after 30s

**Solutions:**

```bash
# 1. Check API is running
curl http://localhost:8000/api/v1/health/

# 2. Check network tab
# F12 → Network
# Look for pending requests
# Kill and retry

# 3. Increase timeout
// src/config/api.ts
const apiClient = axios.create({
  timeout: 60000, // 60 seconds
});

# 4. Check for network issues
# Try: ping api.example.com
# Try: curl http://api.example.com/health/

# 5. Check API server logs
# Backend: Check Django logs
python manage.py runserver --verbosity=3
```

---

## ⚡ Performance Issues

### Issue: App loads slowly

**Symptoms:** Initial load takes > 3 seconds

**Solutions:**

```bash
# 1. Check bundle size
npm run analyze:bundle

# 2. Check lighthouse performance
npm run build
npm run preview
# Open: https://web.dev/measure

# 3. Enable code splitting
// Lazy load heavy components
const Medical = lazy(() =>
  import('./sections/PlayerMedicalSection')
);

// Use Suspense
<Suspense fallback={<Skeleton />}>
  <Medical />
</Suspense>

# 4. Check network tab
# F12 → Network
# See what's taking longest
# Often: CSS, JS, fonts

# 5. Optimize images
# Use next-gen formats (WebP)
# Use appropriate sizes

# 6. Enable gzip on server
nginx.conf:
gzip on;
gzip_types text/plain text/css application/javascript;
```

---

### Issue: Page becomes unresponsive

**Symptoms:** UI freezes, can't click buttons

**Solutions:**

```bash
# 1. Check for heavy operations
# Look for:
// ❌ Heavy for loop without yield
for (let i = 0; i < 1000000; i++) { ... }

// ✅ Use Web Worker
const worker = new Worker('heavy-work.js');
worker.postMessage(data);

# 2. Check for memory leaks
# F12 → Memory → Take snapshot
# Compare before/after operations
# Should stay relatively constant

# 3. Use React DevTools Profiler
# F12 → Profiler tab
# Record interactions
# Look for slow components

# 4. Reduce re-renders
// Use useMemo
const memoized = useMemo(() => expensiveCalc(), [deps]);

// Use useCallback
const memoizedFn = useCallback(() => { ... }, [deps]);

# 5. Enable performance monitoring
// Measure long tasks
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Long task:', entry.duration);
  }
});
observer.observe({ entryTypes: ['longtask'] });
```

---

## 🌐 Deployment Issues

### Issue: Site not accessible after deployment

**Symptoms:** Deploy succeeds but site returns 404 or 502

**Solutions:**

```bash
# 1. Check deployment status
# Vercel: vercel.com → Project → Deployments
# Netlify: netlify.com → Site → Deploys

# 2. Check build logs
# Look for errors during build
# May need to rebuild

# 3. Verify domain DNS
# DNS should point to CDN
nslookup bolayetu.com
dig bolayetu.com

# 4. Check SSL certificate
# Certificate should be valid
# Not expired

# 5. Clear CDN cache
# Vercel: vercel deploy --prod --force
# Netlify: netlify deploy --prod --clear-cache
# AWS: aws cloudfront create-invalidation

# 6. Check server response
curl -I https://bolayetu.com
# Should return 200 with HTML
```

---

### Issue: Build takes too long in CI

**Symptoms:** GitHub Actions/GitLab CI timeout (> 30 min)

**Solutions:**

```bash
# 1. Cache dependencies
# .github/workflows/build.yml
- uses: actions/setup-node@v3
  with:
    node-version: 18
    cache: npm

# 2. Use npm ci instead of npm install
npm ci

# 3. Skip unused builds
# Only build on main/release branches
if: github.ref == 'refs/heads/main'

# 4. Parallel tests
# Run tests and build in parallel
jobs:
  test:
    runs-on: ubuntu-latest
  build:
    runs-on: ubuntu-latest
    needs: test

# 5. Use faster runners
# GitHub Actions: ubuntu-latest is slowest
runs-on: ubuntu-22.04  # Faster than latest
```

---

## 🌍 Browser Issues

### Issue: Works in Chrome but not Firefox/Safari

**Symptoms:** Feature works on Chrome only

**Solutions:**

```bash
# 1. Check browser support
# caniuse.com for feature support
# E.g., CSS Grid, Fetch API, etc.

# 2. Add polyfills
// For older browsers
import 'core-js/stable';
import 'regenerator-runtime/runtime';

# 3. Use feature detection
if (typeof localStorage !== 'undefined') {
  // Use localStorage
} else {
  // Use fallback
}

# 4. Test in all browsers
# Chrome: DevTools → Emulation
# Firefox: DevTools → Responsive Design Mode
# Safari: Open page in Safari
# Mobile: Use BrowserStack or Appetize

# 5. Check console for errors
# F12 in each browser
# Note any red errors

# 6. Use CSS vendor prefixes
// Tailwind handles this
// But may need manual:
-webkit-box-shadow: 0 0 10px rgba(0,0,0,0.1);
-moz-box-shadow: 0 0 10px rgba(0,0,0,0.1);
box-shadow: 0 0 10px rgba(0,0,0,0.1);
```

---

### Issue: Mobile page looks broken

**Symptoms:** Layout breaks on phone or tablet

**Solutions:**

```bash
# 1. Check viewport meta tag
// index.html
<meta name="viewport" 
      content="width=device-width, initial-scale=1.0">

# 2. Test responsive design
F12 → Toggle device toolbar → Select device

# 3. Check breakpoints
// tailwind.config.js
theme: {
  screens: {
    sm: '640px',   // Mobile
    md: '768px',   // Tablet
    lg: '1024px',  // Desktop
    xl: '1280px',  // Large desktop
  }
}

# 4. Verify touch targets
// All buttons/links should be ≥ 48px
<button className="h-12 w-12">  // 48px square

# 5. Test with real device
# USB cable to computer
# Or use BrowserStack

# 6. Check for overflow
// ❌ Wrong
<div className="w-screen">  // Can overflow

// ✅ Right
<div className="w-full max-w-screen-xl">  // Contained
```

---

## 📞 Still Having Issues?

1. **Check logs:**
   - Browser console: F12
   - Server logs: `npm run dev` terminal
   - API logs: Backend terminal

2. **Search documentation:**
   - DEVELOPER_GUIDE.md
   - API_ENDPOINTS.md
   - Component documentation

3. **Review code:**
   - Similar components in codebase
   - Test files for usage examples
   - GitHub commits for recent changes

4. **Ask for help:**
   - GitHub Issues
   - Slack #frontend-dev
   - Code review

---

**Last Updated:** August 12, 2026  
**Status:** Production Ready  
**Created:** August 12, 2026

