# UI/UX Best Practices for Repe Workout Tracking App

**Date**: 2025-11-01  
**Purpose**: Document UI/UX best practices based on Vercel Geist design system and fitness app research

## Overview

This document outlines the UI/UX principles and best practices for the Repe workout tracking application, combining Vercel's Geist design system with industry-leading fitness app UX patterns.

## Design System Foundation: Vercel Geist

### Why Geist?

Geist is Vercel's open-source design system that embodies:
- **Swiss Design Influence**: Clean, understated aesthetic focusing on clarity and precision
- **Modern Minimalism**: Every element serves a purpose
- **Accessibility First**: High contrast ratios, scalable typography
- **Performance**: Optimized fonts and components for web performance
- **Next.js Integration**: Native support in Next.js 15+

### Core Principles

1. **Clarity Over Decoration**: Every visual element must serve a functional purpose
2. **Consistency**: Use system tokens for colors, spacing, typography
3. **Hierarchy**: Clear visual hierarchy guides user attention
4. **Accessibility**: WCAG AA compliance minimum, AAA preferred

## Typography

### Geist Font Family

**Geist Sans** (Primary)
- Modern, geometric, highly readable
- Perfect for UI text, buttons, labels, body copy
- Variable font with full glyph support
- Optimized for digital clarity

**Geist Mono** (Secondary)
- Monospaced variant for code, data, numbers
- Use for: workout stats, weight/rep inputs, timer displays
- Maintains tabular alignment for numerical data

### Type Scale

```
Headings:
- H1: text-4xl (36px) - Page titles, app name
- H2: text-3xl (30px) - Section headers
- H3: text-2xl (24px) - Card titles, workout names
- H4: text-xl (20px) - Subsection headers
- H5: text-lg (18px) - Component headers

Body Text:
- Large: text-lg (18px) - Primary actions, important info
- Base: text-base (16px) - Standard body text
- Small: text-sm (14px) - Supporting text, metadata
- XSmall: text-xs (12px) - Labels, captions

Mobile Optimized:
- Minimum readable size: 16px (prevents zoom on iOS)
- Touch target labels: 14-16px
- Headers scale up 20-30% on mobile for impact
```

### Font Weight

```
- Regular (400): Body text, descriptions
- Medium (500): Emphasized text, labels
- Semibold (600): Buttons, action text
- Bold (700): Headers, important stats
```

### Line Height

```
- Tight (1.2): Headers, titles
- Normal (1.5): Body text, paragraphs
- Relaxed (1.75): Long-form content, instructions
```

## Color System

### Base Colors (Dark Theme Primary)

```css
/* Background Layers */
--background: #000000;        /* Pure black base */
--surface: #0a0a0a;           /* Slightly elevated surfaces */
--surface-elevated: #1a1a1a;  /* Cards, modals */
--surface-hover: #262626;     /* Hover states */

/* Text Colors */
--foreground: #ffffff;        /* Primary text - pure white */
--foreground-secondary: #a3a3a3; /* Secondary text - neutral-400 */
--foreground-tertiary: #737373;  /* Tertiary text - neutral-500 */
--foreground-disabled: #525252;  /* Disabled text - neutral-600 */

/* Border & Dividers */
--border: #262626;            /* Default borders - neutral-800 */
--border-hover: #404040;      /* Hover borders - neutral-700 */
--border-focus: #525252;      /* Focus borders - neutral-600 */
```

### Accent Colors

```css
/* Primary Action (Blue) */
--primary: #3b82f6;           /* Blue-500 - CTAs, links */
--primary-hover: #2563eb;     /* Blue-600 - Hover state */
--primary-active: #1d4ed8;    /* Blue-700 - Active state */
--primary-foreground: #ffffff; /* Text on primary */

/* Success (Green) */
--success: #10b981;           /* Emerald-500 - Completed, PRs */
--success-hover: #059669;     /* Emerald-600 */
--success-foreground: #ffffff;

/* Warning (Amber) */
--warning: #f59e0b;           /* Amber-500 - Caution, rest timer */
--warning-hover: #d97706;     /* Amber-600 */
--warning-foreground: #000000;

/* Destructive (Red) */
--destructive: #ef4444;       /* Red-500 - Delete, errors */
--destructive-hover: #dc2626; /* Red-600 */
--destructive-foreground: #ffffff;

/* Info (Teal) */
--info: #14b8a6;              /* Teal-500 - Stats, info */
--info-hover: #0d9488;        /* Teal-600 */
--info-foreground: #ffffff;
```

### Semantic Colors

```css
/* Workout States */
--workout-active: #10b981;    /* Green - active workout */
--workout-rest: #f59e0b;      /* Amber - rest timer */
--workout-complete: #3b82f6;  /* Blue - completed */

/* Progress & Stats */
--progress-low: #ef4444;      /* Red - below target */
--progress-medium: #f59e0b;   /* Amber - on track */
--progress-high: #10b981;     /* Green - exceeding */

/* Chart Colors */
--chart-1: #3b82f6;           /* Blue */
--chart-2: #10b981;           /* Green */
--chart-3: #f59e0b;           /* Amber */
--chart-4: #8b5cf6;           /* Violet */
--chart-5: #ec4899;           /* Pink */
```

## Spacing System

### Base Unit: 4px (0.25rem)

```
Mobile-Optimized Spacing:
- xs: 8px (0.5rem)   - Tight spacing within components
- sm: 12px (0.75rem) - Small gaps, compact lists
- md: 16px (1rem)    - Default spacing, comfortable padding
- lg: 24px (1.5rem)  - Section spacing
- xl: 32px (2rem)    - Major section breaks
- 2xl: 48px (3rem)   - Page-level spacing

Touch-Friendly:
- Minimum padding: 16px (1rem)
- Comfortable padding: 20px (1.25rem)
- Generous padding: 24px (1.5rem)
```

### Component Spacing

```
Cards:
- Padding: 16px (mobile), 20px (tablet), 24px (desktop)
- Gap between cards: 12px (mobile), 16px (tablet+)

Buttons:
- Padding: 12px 24px (default)
- Padding: 16px 32px (large/primary)
- Padding: 8px 16px (small/secondary)

Forms:
- Field spacing: 16px vertical
- Label-to-input: 8px
- Form sections: 32px
```

## Touch Targets (Critical for Gym Use)

### Size Guidelines

```
Minimum (iOS/Android Standard):
- Touch target: 44px × 44px
- Actual visual: Can be smaller, but tap area must be 44px

Comfortable (Recommended):
- Touch target: 48px × 48px
- Better for gym environment, sweaty hands

Large (Primary Actions):
- Touch target: 56px × 56px
- "Start Workout", "Complete Set" buttons
```

### Implementation

```jsx
// Minimum touch target
<Button className="min-h-[44px] min-w-[44px] px-4">

// Comfortable touch target  
<Button className="min-h-[48px] min-w-[48px] px-6">

// Large primary action
<Button className="h-14 px-8 text-lg">
```

### Spacing Between Targets

- Minimum separation: 8px
- Comfortable separation: 12px
- Generous separation: 16px

## Layout Patterns

### Mobile-First Approach

```
1. Single Column Layout
   - Max width: 640px (sm breakpoint)
   - Centered on larger screens
   - Full bleed on mobile

2. Sticky Navigation
   - Bottom nav for thumb reach
   - Top app bar for context
   - Hide on scroll (optional)

3. Card-Based Content
   - Rounded corners: 8-12px
   - Border: 1px solid var(--border)
   - Shadow: subtle or none (minimalist)
```

### Workout-Specific Layouts

```
Active Workout Screen:
┌─────────────────────────┐
│  [Timer] [Rest]     [⋮] │ ← Top bar (fixed)
├─────────────────────────┤
│                         │
│   Exercise Name         │ ← Large, bold
│   Set 3 of 4           │ ← Context
│                         │
│   [Weight] [Reps]      │ ← Large inputs
│                         │
│   [Complete Set] (56px) │ ← Primary action
│                         │
│   Previous: 80kg × 10   │ ← Reference data
│                         │
├─────────────────────────┤
│ [Add Set] [Finish] [+]  │ ← Bottom bar (fixed)
└─────────────────────────┘

Dashboard:
┌─────────────────────────┐
│  Repe                   │ ← App name
│  Track your strength    │ ← Tagline
├─────────────────────────┤
│  [Active Workout Card]  │ ← If active
├─────────────────────────┤
│  [Start New Workout]    │ ← Primary CTA (56px)
│  [View History]         │ ← Secondary
├─────────────────────────┤
│  Recent Workouts        │ ← Section
│  [Workout Card]         │
│  [Workout Card]         │
│  [Workout Card]         │
└─────────────────────────┘
```

## Component Styles

### Buttons

```jsx
// Primary Action
<Button className="
  h-14 px-8 
  bg-primary hover:bg-primary-hover 
  text-white text-lg font-semibold
  rounded-lg
  transition-colors duration-150
">
  Start Workout
</Button>

// Secondary Action
<Button className="
  h-12 px-6
  bg-transparent hover:bg-surface-hover
  text-foreground
  border border-border hover:border-border-hover
  rounded-lg
">
  View History
</Button>

// Icon Button (48×48)
<Button className="
  h-12 w-12
  bg-transparent hover:bg-surface-hover
  rounded-lg
">
  <Icon size={24} />
</Button>
```

### Cards

```jsx
<Card className="
  bg-surface-elevated
  border border-border
  rounded-xl
  p-4 md:p-6
  hover:border-border-hover
  transition-colors duration-150
">
  <CardHeader className="pb-3">
    <CardTitle className="text-xl font-semibold">
      Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### Input Fields

```jsx
<Input className="
  h-12 px-4
  bg-surface border border-border
  text-base
  rounded-lg
  focus:border-primary focus:ring-2 focus:ring-primary/20
  transition-all duration-150
" />

// Number inputs for gym data (monospace)
<Input 
  type="number"
  className="
    h-14 px-4
    bg-surface border-2 border-border
    text-xl font-mono text-center
    rounded-lg
    focus:border-primary
  "
/>
```

## Gym-Specific UX Patterns

### 1. Distraction-Free Workout Mode

```
During Active Workout:
- Hide navigation
- Large, bold text for current exercise
- Minimal UI chrome
- "Do Not Disturb" option to silence notifications
- Keep only essential actions visible
```

### 2. Quick Logging

```
Goals:
- Log a set in 3 taps or less
- Auto-fill from previous set
- Large numeric keyboards
- Haptic feedback on completion

Pattern:
1. Tap weight input → Numeric keyboard
2. Tap reps input → Numeric keyboard  
3. Tap "Complete Set" → Haptic + visual feedback
```

### 3. Rest Timer

```
States:
- Inactive: Button to start rest
- Active: Full-screen countdown (optional)
- Complete: Alert (vibration + sound + visual)

Display:
- Large numbers (48px+)
- Circular progress indicator
- Skip/Add time buttons (±30s)
```

### 4. Progress Indicators

```
Workout Progress:
- Exercise X of Y
- Set M of N  
- Total volume: XXX kg
- Duration: MM:SS

Visual:
- Progress bar at top of screen
- Completion checkmarks
- Next exercise preview
```

## Animations & Transitions

### Performance-First

```
Principles:
- Use CSS transforms (GPU accelerated)
- Avoid layout thrashing
- 60fps or don't animate
- Reduce motion for accessibility
```

### Key Animations

```css
/* Button Press */
.button:active {
  transform: scale(0.97);
  transition: transform 100ms ease-out;
}

/* Card Hover */
.card:hover {
  border-color: var(--border-hover);
  transition: border-color 150ms ease-out;
}

/* Page Transitions (subtle) */
.page-enter {
  opacity: 0;
  transform: translateY(8px);
}
.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 200ms, transform 200ms ease-out;
}

/* Skeleton Loading */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface) 0%,
    var(--surface-hover) 50%,
    var(--surface) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

## Accessibility

### WCAG Compliance

```
Level AA (Minimum):
- Contrast ratio 4.5:1 for normal text
- Contrast ratio 3:1 for large text (18px+)
- Contrast ratio 3:1 for UI components

Level AAA (Target):
- Contrast ratio 7:1 for normal text
- Contrast ratio 4.5:1 for large text
```

### Implementation

```
1. Color Contrast
   - White (#ffffff) on Black (#000000) = 21:1 ✓
   - Primary Blue (#3b82f6) on Black = 8.6:1 ✓
   - Secondary Gray (#a3a3a3) on Black = 5.9:1 ✓

2. Keyboard Navigation
   - All interactive elements focusable
   - Visible focus indicators
   - Logical tab order

3. Screen Readers
   - Semantic HTML
   - ARIA labels where needed
   - Alt text for images/icons
   - Role attributes

4. Motion Preferences
   - Respect prefers-reduced-motion
   - Provide static alternatives
```

## Mobile Performance

### Load Time Targets

```
Initial Page Load:
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3s

Navigation:
- Page transitions: <200ms
- Component updates: <100ms
```

### Optimization Strategies

```
1. Code Splitting
   - Route-based splitting
   - Component lazy loading
   - Dynamic imports for heavy features

2. Image Optimization
   - WebP format
   - Responsive images
   - Lazy loading
   - Proper sizing

3. Font Loading
   - font-display: swap
   - Preload critical fonts
   - Subset fonts if possible

4. Caching
   - Service worker for offline
   - Aggressive caching for static assets
   - Stale-while-revalidate for data
```

## Implementation Checklist

### Phase 1: Foundation
- [ ] Install and configure Geist fonts
- [ ] Update color tokens to Geist system
- [ ] Implement base typography classes
- [ ] Set up spacing utilities
- [ ] Configure touch target classes

### Phase 2: Components
- [ ] Update Button component with Geist styles
- [ ] Update Card component with minimalist design
- [ ] Update Input component for gym use
- [ ] Create workout-specific components
- [ ] Implement loading states

### Phase 3: Layouts
- [ ] Update app layout with Geist
- [ ] Optimize dashboard for minimalism
- [ ] Create distraction-free workout mode
- [ ] Implement bottom navigation
- [ ] Add sticky headers where needed

### Phase 4: Polish
- [ ] Add subtle animations
- [ ] Implement haptic feedback
- [ ] Optimize for performance
- [ ] Test accessibility
- [ ] Mobile device testing

## Resources

### Design System
- [Vercel Geist Typography](https://vercel.com/geist/typography)
- [Vercel Geist Colors](https://vercel.com/geist/colors)
- [Geist Design System](https://vercel.com/geist/introduction)

### Fitness App UX
- Strong App (iOS/Android) - Minimalist workout tracking
- Nike Training Club - Exercise flow patterns
- Freeletics - Distraction-free workout mode
- MyFitnessPal - Data entry optimization

### Inspiration
- [Dribbble Fitness Apps](https://dribbble.com/tags/fitness-app)
- [Behance Fitness UI](https://www.behance.net/search/projects?search=fitness+app+dark)
- [Vercel Design](https://vercel.com) - Reference implementation

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-01  
**Next Review**: After Phase 1 implementation
