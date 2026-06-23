# Bolayetu Design System Specification
## "The Digital Pulse of African Football"

This specification defines the enterprise-grade visual language for Bolayetu, a high-performance football ecosystem platform. It is architected for implementation using React, Tailwind CSS, and shadcn/ui.

---

## 1. Foundation

### Color Palette (Tailwind Config)
Bolayetu utilizes a deep, high-contrast palette to ensure legibility and professional sports aesthetics.

- **Brand Primary:** `#004d40` (Deep Emerald) - Used for primary actions, branding, and status indicators.
- **Surface (Backgrounds):**
  - `background`: `#031427` (Deep Navy)
  - `surface-dim`: `#031427`
  - `surface-bright`: `#2a3a4f`
  - `surface-container-low`: `#0b1c30`
- **Text & Foreground:**
  - `on-surface`: `#FFFFFF` (900)
  - `on-surface-variant`: `#A1A1AA` (400)
- **Functional/Status:**
  - `success`: `#10B981` (Emerald 500)
  - `warning`: `#F59E0B` (Amber 500)
  - `error`: `#EF4444` (Red 500)
  - `info`: `#3B82F6` (Blue 500)

### Typography
- **Primary Font:** `Archivo Narrow` (Sans-serif) - Clean, high-density, perfect for sports data.
- **Scale:**
  - `Display`: 48px / 1.2 leading / Bold
  - `Headline`: 32px / 1.2 leading / Semibold
  - `Title`: 20px / 1.5 leading / Medium
  - `Body`: 16px / 1.5 leading / Regular
  - `Label`: 12px / 1.5 leading / Medium (Caps for metadata)

---

## 2. Core Components (shadcn/ui based)

### Buttons
- **Primary:** Background `#004d40`, Text White, Rounded 4px. Hover: Brightness 110%.
- **Secondary:** Border `#2a3a4f`, Background Transparent, Text White.
- **Ghost:** Transparent background, Text `#A1A1AA`. Hover: Background `#2a3a4f`.
- **States:** `loading` (spinner + 0.7 opacity), `disabled` (0.5 opacity, grayscale).

### Forms & Inputs
- **Inputs:** Background `#0b1c30`, Border `#2a3a4f`, Focus: Border `#004d40` + 2px Ring.
- **Labels:** Archivo Narrow, Text `#A1A1AA`, 12px, Uppercase.
- **Selects/Dropdowns:** Deep Navy background with subtle glassmorphism (`backdrop-blur-md`).

---

## 3. Data Visualization

### Tables (High Density)
- **Header:** Background `#0b1c30`, Text `#A1A1AA`, Border-bottom.
- **Row:** Hover background `#2a3a4f`, Transition 200ms.
- **Cells:** Vertical alignment center, padding 12px 16px.

### Cards
- **Base:** Background `#0b1c30`, Border 1px `#2a3a4f`, Roundness 4px.
- **Interactive:** Scale 101% on hover, shadow-lg.

### Charts
- **Lines:** Gradient stroke (Emerald to Transparent).
- **Grids:** Color `#2a3a4f` (Opacity 0.1).
- **Tooltips:** Background `#031427`, Border `#004d40`, Shadow-2xl.

---

## 4. Layout & Navigation

### Drawers & Modals
- **Overlay:** Black (0.7 opacity) + Backdrop blur 4px.
- **Sheet (Drawer):** Right-aligned, Background `#0b1c30`, Full height.
- **Dialog (Modal):** Centered, max-width 600px, Padding 32px.

### Notifications (Toasts)
- **Standard:** Bottom-right, rounded-sm, border-left 4px (Success/Error/Warning).
- **Animation:** Slide-in from right, duration 300ms.

---

## 5. System States

### Empty States
- **Visual:** Centered 48px icon (outlined), Opacity 0.3.
- **Copy:** 18px Title + 14px Subtext + "Primary Action" button.

### Loading States (Skeleton)
- **Pulse Effect:** Background `#2a3a4f`, pulse animation.
- **Usage:** Used for Table Rows, Cards, and Stats widgets during data fetch.

### Icons (Lucide-React/Material)
- **Style:** 2px stroke, minimal, consistent sizing (20px/24px).
- **Brand Marks:** Stylized football, Trophy, Analytics-bars, User-scout.

---

## 6. CSS Architecture (Tailwind)
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: '#004d40',
        surface: {
          DEFAULT: '#031427',
          dim: '#031427',
          bright: '#2a3a4f',
          container: '#0b1c30',
        }
      },
      fontFamily: {
        archivo: ['"Archivo Narrow"', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
      }
    }
  }
}
```