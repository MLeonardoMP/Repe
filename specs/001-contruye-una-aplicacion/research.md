# Research: Technical Decisions and Best Practices

## NextJS 15 Best Practices for Mobile Web Applications

### Decision: App Router + Server Components Strategy
**Rationale**: NextJS 15 App Router provides better performance and simpler data fetching for mobile web apps. Server Components reduce JavaScript bundle size, critical for mobile performance.

**Implementation Approach**:
- Use Server Components for static content (layout, navigation)
- Client Components only for interactive elements (forms, timers)
- Route-level data fetching with async/await patterns

**Alternatives Considered**: 
- Pages Router: More familiar but less performant
- Full client-side: Would increase bundle size significantly

### Decision: Mobile-First Performance Optimizations
**Rationale**: Gym environments have varying network conditions. Performance is critical for user experience.

**Implementation Approach**:
- Static generation where possible
- Progressive enhancement for JavaScript features
- Optimized images and minimal asset loading
- Service Worker for offline capabilities (future iteration)

## shadcn/ui Component Selection and Theming

### Decision: Minimal Component Set + Custom Dark Theme
**Rationale**: Align with constitutional principle of minimalismo. Only include necessary components to reduce bundle size.

**Selected Components**:
- Button, Input, Card, Dialog, Form
- Select, Textarea, Toast
- Sheet (for mobile drawer navigation)

**Theme Configuration**:
```css
:root {
  --background: #000000;
  --foreground: #ffffff;
  --primary: #ffffff;
  --primary-foreground: #000000;
  --secondary: #1a1a1a;
  --secondary-foreground: #ffffff;
  --border: #333333;
  --input: #1a1a1a;
}
```

**Alternatives Considered**:
- Full shadcn/ui installation: Too heavy for minimal approach
- Custom components from scratch: Would increase development time

## JSON Storage Architecture

### Decision: Single JSON File with Structured Schema
**Rationale**: Simplest possible storage for v1. No database complexity, easy to debug and migrate later.

**File Structure**:
```json
{
  "users": {
    "default": {
      "id": "default",
      "workouts": []
    }
  },
  "exercises": [
    {
      "id": "string",
      "name": "string",
      "category": "string",
      "defaultWeightUnit": "kg"
    }
  ]
}
```

**Read/Write Strategy**:
- Atomic writes using temp files + rename
- In-memory caching for session duration
- Validation before every write operation

**Alternatives Considered**:
- SQLite: Too complex for v1, violates minimalismo
- Multiple JSON files: Would complicate data relationships
- LocalStorage only: Would lose data on browser clear

## Mobile UX Research and Patterns

### Decision: Touch-First Interface Design
**Rationale**: Gym environment requires easy touch targets, minimal cognitive load during exercise.

**Design Patterns**:
- Minimum 44px touch targets (iOS guidelines)
- Bottom navigation for primary actions
- Swipe gestures for quick actions
- Large, clear typography (16px minimum)

### Decision: Dark Theme Accessibility
**Rationale**: Gym environments often have bright lighting. Dark theme reduces eye strain and battery usage.

**Implementation Standards**:
- WCAG AA contrast ratios (4.5:1 minimum)
- White text on black background
- Subtle gray (#333333) for borders and dividers
- No color-only information conveyance

**Form Interaction Patterns**:
- Auto-advance between related inputs
- Clear visual feedback for validation
- Minimal required fields
- Smart defaults where possible

### Decision: Progressive Enhancement
**Rationale**: Ensure basic functionality works even with JavaScript disabled or slow loading.

**Implementation Strategy**:
- HTML forms work without JavaScript
- CSS-only loading states
- JavaScript enhances with real-time features
- Graceful degradation for all features

## State Management Strategy

### Decision: React Hook State + Context for Global Data
**Rationale**: Keeps complexity minimal while providing needed functionality. No external state libraries needed for v1.

**Architecture**:
- `useWorkout` hook for active workout state
- React Context for user preferences
- Local state for component-specific data
- JSON storage service for persistence

**Data Flow**:
1. Component requests data via hook
2. Hook checks local state cache
3. If not cached, loads from JSON storage
4. Updates propagate through hook subscriptions

**Alternatives Considered**:
- Zustand/Redux: Too complex for current scope
- React Query: Overkill for file-based storage
- Pure useState: Would lead to prop drilling

## Performance Targets and Metrics

### Decision: Mobile-First Performance Budget
**Rationale**: Gym users expect fast, responsive interactions. Performance directly impacts user experience.

**Targets**:
- First Contentful Paint: <1.5s on 3G
- Largest Contentful Paint: <2.5s on 3G
- Time to Interactive: <3s on 3G
- Bundle size: <200KB gzipped JavaScript

**Measurement Strategy**:
- Lighthouse CI in development
- Real User Monitoring for production
- Performance budgets in build process

**Optimization Techniques**:
- Code splitting at route level
- Dynamic imports for heavy components
- Image optimization and lazy loading
- Critical CSS inlining

## Error Handling and Validation

### Decision: Client-Side Validation + Graceful Error Recovery
**Rationale**: Provide immediate feedback while maintaining data integrity.

**Validation Strategy**:
- TypeScript for compile-time type safety
- Zod schemas for runtime validation
- Form validation with react-hook-form
- Graceful error boundaries for component failures

**Error Recovery**:
- Auto-save draft data to localStorage
- Retry mechanisms for storage operations
- Clear error messages in user language
- Fallback UI for component errors

This research phase resolves all technical uncertainties and provides a clear foundation for Phase 1 design work.