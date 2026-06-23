---
name: Bolayetu Design System
colors:
  surface: '#031427'
  surface-dim: '#031427'
  surface-bright: '#2a3a4f'
  surface-container-lowest: '#000f21'
  surface-container-low: '#0b1c30'
  surface-container: '#102034'
  surface-container-high: '#1b2b3f'
  surface-container-highest: '#26364a'
  on-surface: '#d3e4fe'
  on-surface-variant: '#bfc9c4'
  inverse-surface: '#d3e4fe'
  inverse-on-surface: '#213145'
  outline: '#89938f'
  outline-variant: '#3f4945'
  surface-tint: '#94d3c1'
  primary: '#94d3c1'
  on-primary: '#00382e'
  primary-container: '#004d40'
  on-primary-container: '#7ebdac'
  inverse-primary: '#29695b'
  secondary: '#bec6e0'
  on-secondary: '#283044'
  secondary-container: '#3f465c'
  on-secondary-container: '#adb4ce'
  tertiary: '#e9c349'
  on-tertiary: '#3c2f00'
  tertiary-container: '#cca730'
  on-tertiary-container: '#4f3e00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#afefdd'
  primary-fixed-dim: '#94d3c1'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#065043'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffe088'
  tertiary-fixed-dim: '#e9c349'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574500'
  background: '#031427'
  on-background: '#d3e4fe'
  surface-variant: '#26364a'
typography:
  display-lg:
    fontFamily: Archivo Narrow
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Archivo Narrow
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Archivo Narrow
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-tabular:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '450'
    lineHeight: 16px
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1440px
  gutter: 20px
---

## Brand & Style

The design system is engineered for a high-performance football digital ecosystem, balancing the raw energy of sports with the clinical precision of enterprise SaaS. The brand personality is **Authoritative, Scalable, and Performance-focused**, aimed at professionals who manage complex data, player scouting, and club operations.

The aesthetic follows a **Corporate Modern** style with **Minimalist** leanings to prioritize data clarity. It draws inspiration from the technical rigor of developer tools and the immersive quality of premium sports broadcasting. 

**Key Visual Principles:**
- **Data-First Utility:** Interfaces are designed for high information density without sacrificing legibility.
- **Athletic Precision:** Use of sharp geometric forms and subtle technical details (like monospaced numbers) to evoke a sense of professional sports technology.
- **Premium Reliability:** A sophisticated dark-mode-first approach that uses depth and light to guide the user's focus during high-stakes decision-making.

## Colors

The palette is anchored in deep, "Pitch Green" and "Stadium Blue" tones to provide a professional foundation, accented by a "Championship Gold" for premium tiers and critical call-to-actions.

- **Primary (Pitch Green):** `#004D40`. Used for primary actions, success states, and brand-defining moments.
- **Secondary (Midnight Blue):** `#0F172A`. The core surface color for dark mode backgrounds and primary navigation.
- **Tertiary (Championship Gold):** `#D4AF37`. Reserved for premium badges, highlighted statistics, and secondary highlights.
- **Neutrals:** A vast range of cool grays designed for high-density data tables and subtle borders. 

**Implementation Note:** In Dark Mode, surfaces use elevated shades of Midnight Blue rather than pure black to maintain softness and depth. In Light Mode, the primary green is used more sparingly to ensure high accessibility.

## Typography

The typography system utilizes a dual-font strategy to separate editorial energy from functional utility.

- **Headlines (Archivo Narrow):** A condensed, impactful sans-serif that mirrors the urgency of a stadium scoreboard. Use this for page titles, section headers, and big metric numbers.
- **Body & UI (Geist):** A technical, high-legibility sans-serif designed for SaaS environments. Its geometric clarity ensures that long-form scouting reports and dashboard labels remain readable.
- **Data (JetBrains Mono):** Used specifically for tabular data, jersey numbers, and technical timestamps. The monospaced nature ensures that columns of numbers align perfectly for easy comparison.

**Formatting:**
- Use `display-lg` only for hero sections or significant milestones.
- `label-sm` should always be used with a 5% letter-spacing increase to ensure readability at small sizes.

## Layout & Spacing

This design system employs a **Fluid Grid** model based on a 4px baseline rhythm. This ensures that every element—from an icon to a large data table—scales predictably.

**The Grid:**
- **Desktop:** 12-column grid with 20px gutters and 48px side margins. Max container width is 1440px.
- **Tablet:** 8-column grid with 16px gutters and 24px side margins.
- **Mobile:** 4-column grid with 12px gutters and 16px side margins.

**Density:**
As a data-heavy SaaS, we utilize "Compact" and "Default" spacing modes. "Compact" (8px padding in cells) is the standard for player comparison tables, while "Default" (16px padding) is used for marketing-led overview pages.

## Elevation & Depth

The design system uses **Tonal Layers** and **Low-Contrast Outlines** rather than heavy drop shadows to define hierarchy. This creates a "glass-cockpit" feel that is modern and precise.

- **Level 0 (Background):** The base canvas (e.g., Midnight Blue in dark mode).
- **Level 1 (Cards/Sections):** A slightly lighter shade with a 1px border. In dark mode, the border is a low-opacity white (10%); in light mode, a soft gray.
- **Level 2 (Modals/Popovers):** Higher contrast with a subtle "Ambient Shadow" (0px 8px 24px rgba(0,0,0, 0.2)).
- **Interactive States:** Use a glow effect (Primary Green) with a 2px spread to indicate focus or active selection, mimicking the look of digital stadium displays.

## Shapes

The shape language is **Soft (Level 1)**. We avoid fully round "pill" shapes for primary UI elements to maintain a professional, architectural feel.

- **Standard Elements (Buttons, Inputs, Cards):** 0.25rem (4px) corner radius. This provides a clean, precise look.
- **Large Components (Modals, Feature Sections):** 0.75rem (12px) corner radius.
- **Data Points:** Small badges and status indicators may use a slightly higher 0.5rem (8px) radius for visual distinction from structural UI.

## Components

The component library is built for high-performance interaction and data visualization.

- **Buttons:** Solid Primary Green for main actions. Secondary buttons use an "Outlined" style with a 1px border. All buttons use `title-md` typography.
- **Data Tables:** High-density rows with `data-tabular` font. Alternating row colors (zebra striping) should be very subtle (2% contrast difference).
- **Interactive Charts:** Lines and bars should use the Primary Green and Tertiary Gold. Use "soft" transitions for hover states to reveal monospaced tooltips.
- **Statistics Widgets:** Bold `headline-lg` numbers paired with a small `label-sm` trend indicator (up/down arrows in green/red).
- **Cards:** Clean containers with a 1px border (`#FFFFFF10` in dark mode) and no shadow. Headers within cards should have a subtle bottom divider.
- **Input Fields:** Darker than the card background to create an "inset" feel. Focus states utilize a 1px Primary Green border.