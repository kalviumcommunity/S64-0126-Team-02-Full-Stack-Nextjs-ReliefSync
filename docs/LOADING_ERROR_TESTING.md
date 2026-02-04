# Loading States & Error Boundaries - Testing Guide

## 🎯 Purpose

This guide explains how to test loading skeletons and error boundaries in the ReliefSync application.

---

## 📁 Implemented Routes

We've implemented loading and error states for the following routes:

### 1. **Dashboard** (`/dashboard`)
- **Loading:** [src/app/dashboard/loading.tsx](../src/app/dashboard/loading.tsx)
- **Error:** [src/app/dashboard/error.tsx](../src/app/dashboard/error.tsx)
- **Features:**
  - Stats cards skeleton
  - Recent activity skeleton
  - Animated spinner with message

### 2. **Requests List** (`/requests`)
- **Loading:** [src/app/requests/loading.tsx](../src/app/requests/loading.tsx)
- **Error:** [src/app/requests/error.tsx](../src/app/requests/error.tsx)
- **Features:**
  - Request cards skeleton
  - Filter tabs skeleton
  - Contextual error messages

### 3. **Request Detail** (`/requests/[id]`)
- **Loading:** [src/app/requests/[id]/loading.tsx](../src/app/requests/[id]/loading.tsx)
- **Error:** [src/app/requests/[id]/error.tsx](../src/app/requests/[id]/error.tsx)
- **Features:**
  - Detailed page skeleton
  - Navigation options in error state
  - Multi-action error recovery

### 4. **Users Management** (`/users`)
- **Loading:** [src/app/users/loading.tsx](../src/app/users/loading.tsx)
- **Error:** [src/app/users/error.tsx](../src/app/users/error.tsx)
- **Features:**
  - Table skeleton with rows
  - Pagination skeleton
  - Permission-aware error messages

---

## 🧪 Testing Methods

### Method 1: Browser DevTools Network Throttling

1. **Open DevTools** (F12 or Ctrl+Shift+I)
2. Go to **Network** tab
3. Click the throttling dropdown (usually shows "No throttling")
4. Select **Slow 3G** or **Fast 3G**
5. Navigate to any route to see loading states

**Recommended Settings:**
- **Slow 3G:** Best for testing loading states (500ms delay)
- **Fast 3G:** More realistic mobile experience
- **Custom:** Create custom profiles for specific scenarios

---

### Method 2: Using Testing Utilities

We've created `src/lib/testingUtils.ts` with helpful functions:

#### Enable Delays (In your page component):

```typescript
import { simulateDelay } from '@/lib/testingUtils';

export default async function MyPage() {
  // Simulate 2 second delay
  await simulateDelay(2000);
  
  // Fetch your data...
  const data = await fetchData();
  
  return <div>...</div>;
}
```

#### Force Errors (For error boundary testing):

```typescript
import { simulateError } from '@/lib/testingUtils';

export default async function MyPage() {
  // Uncomment to test error boundary
  // simulateError('Database connection failed');
  
  const data = await fetchData();
  return <div>...</div>;
}
```

#### Random Errors (20% chance):

```typescript
import { simulateRandomError } from '@/lib/testingUtils';

export default async function MyPage() {
  // 20% chance of error
  simulateRandomError(0.2, 'Random API failure');
  
  const data = await fetchData();
  return <div>...</div>;
}
```

---

### Method 3: Browser Console Commands

In development mode, testing utilities are available in the console:

```javascript
// View current config
__devTools.getSimulationConfig()

// Change default delay to 5 seconds
__devTools.updateSimulationConfig({ defaultDelay: 5000 })

// Enable 30% error rate
__devTools.updateSimulationConfig({ errorProbability: 0.3 })

// Disable simulation
__devTools.toggleSimulation(false)
```

---

## 📸 What to Capture

For your submission, capture these scenarios:

### 1. Loading State
- [ ] Navigate to route while throttled
- [ ] Screenshot showing skeleton UI
- [ ] Note: Loading spinner and "Loading..." text visible

**Best Routes to Test:**
- `/dashboard` - Shows cards skeleton
- `/requests` - Shows list skeleton
- `/users` - Shows table skeleton

### 2. Error State
- [ ] Trigger an error (use testing utils or disconnect network)
- [ ] Screenshot showing error message
- [ ] Error details visible
- [ ] "Try Again" button present

### 3. Retry Functionality
- [ ] Click "Try Again" button
- [ ] Capture successful reload
- [ ] Or capture error persisting

**Recording a GIF:**
1. Use tools like **ScreenToGif** (Windows) or **Kap** (Mac)
2. Record: Navigate → See Loading → See Error → Click Retry
3. Keep it under 30 seconds

---

## 🎬 Step-by-Step Demo Script

### Demo 1: Loading States

```bash
# 1. Start the dev server
npm run dev

# 2. Open browser to http://localhost:3000/dashboard

# 3. Open DevTools (F12)
# 4. Go to Network tab
# 5. Set throttling to "Slow 3G"
# 6. Refresh page (Ctrl+R)

# ✅ You should see:
# - Skeleton cards with gray backgrounds
# - Pulsing animation
# - Loading spinner
# - "Loading dashboard data..." text
```

### Demo 2: Error Boundaries

#### Option A: Disconnect Network

```bash
# 1. Open browser to http://localhost:3000/requests

# 2. Open DevTools → Network tab
# 3. Check "Offline" checkbox
# 4. Refresh the page

# ✅ You should see:
# - Red error card
# - Error message
# - "Try Again" button
# - "Go to Dashboard" button
```

#### Option B: Code Simulation

```typescript
// In src/app/requests/page.tsx
// Add at the top of the component:
import { simulateError } from '@/lib/testingUtils';

export default function RequestsPage() {
  // Uncomment to test error boundary
  simulateError('Failed to load requests from API');
  
  // ... rest of component
}
```

Then refresh the page to see the error boundary.

---

## 🎨 Visual Design Features

### Loading Skeletons

**Design Elements:**
- `bg-slate-200 dark:bg-slate-700` - Neutral background
- `animate-pulse` - Pulsing effect
- `rounded` - Smooth corners
- Matches actual content layout

**Why This Design?**
- Provides visual continuity
- Reduces perceived wait time
- Shows structure while loading
- Accessible in dark mode

### Error Boundaries

**Design Elements:**
- Color-coded severity (red = error)
- Clear error messages
- Actionable buttons
- Support contact info
- Error reference IDs

**Why This Design?**
- Builds user trust
- Provides clear next steps
- Professional appearance
- Helpful troubleshooting info

---

## 🔧 Customization

### Change Loading Delay

```typescript
// src/lib/testingUtils.ts
const SIMULATION_CONFIG = {
  enabled: process.env.NODE_ENV === 'development',
  defaultDelay: 3000, // Change to 3 seconds
  errorProbability: 0,
};
```

### Change Skeleton Colors

```tsx
// In any loading.tsx file
<div className="h-8 w-48 bg-blue-200 dark:bg-blue-700 rounded animate-pulse" />
//                     ↑ Change colors here
```

### Customize Error Messages

```tsx
// In any error.tsx file
<p className="text-sm text-red-700">
  Your custom error message here
</p>
```

---

## 📊 Testing Checklist

Before submission, ensure:

- [ ] All 4 routes have `loading.tsx` files
- [ ] All 4 routes have `error.tsx` files
- [ ] Loading skeletons match page structure
- [ ] Skeletons use `animate-pulse`
- [ ] Error boundaries have "Try Again" buttons
- [ ] `reset()` function works correctly
- [ ] Error messages are user-friendly
- [ ] Screenshots/GIFs captured:
  - [ ] Dashboard loading
  - [ ] Requests loading
  - [ ] Users loading
  - [ ] Error state with message
  - [ ] Retry functionality
- [ ] README updated with findings

---

## 🚀 Quick Test Commands

```bash
# Test loading states (throttled network)
# 1. Open DevTools → Network → Set "Slow 3G"
# 2. Visit these URLs:
http://localhost:3000/dashboard
http://localhost:3000/requests
http://localhost:3000/users

# Test error states (offline mode)
# 1. Open DevTools → Network → Check "Offline"
# 2. Refresh any page
# 3. Click "Try Again" to test reset()

# Test in production build
npm run build
npm start
# Loading should be faster, errors still caught
```

---

## 💡 Tips for Best Results

1. **Loading States:**
   - Use realistic network speeds (3G/4G)
   - Test on actual mobile devices
   - Ensure skeletons are visually similar to loaded content

2. **Error States:**
   - Test various error scenarios (network, auth, server)
   - Verify retry actually works
   - Check error messages are helpful

3. **Screenshots:**
   - Use full-screen browser
   - Crop to relevant content
   - Include URL bar to show route
   - Annotate important features

4. **GIFs:**
   - Keep under 30 seconds
   - Show full flow (load → error → retry)
   - Optimize file size (< 5MB)

---

## 📚 Additional Resources

- [Next.js Loading UI Docs](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Next.js Error Handling Docs](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Tailwind Animations](https://tailwindcss.com/docs/animation)

---

## 🆘 Troubleshooting

**Problem:** Loading state doesn't show
- **Solution:** Network too fast - increase throttling or add delays

**Problem:** Error boundary not catching errors
- **Solution:** Ensure error is thrown in component, not in event handler

**Problem:** Reset button doesn't work
- **Solution:** Verify `reset()` is called correctly in onClick

**Problem:** Skeletons don't match content
- **Solution:** Review actual page structure and adjust skeleton layout

---

Happy Testing! 🎉
