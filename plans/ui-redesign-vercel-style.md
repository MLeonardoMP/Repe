# UI Redesign Plan: Vercel/Geist Aesthetic (Black & White)

## Objective
Transform the current homepage and global styles to match a strict minimalist, black-and-white aesthetic inspired by Vercel's design system (Geist).

## Design Principles
1.  **Strict Monochrome**: Remove all colors (Emerald/Green). Use only Black (#000), White (#FFF), and Grays.
2.  **High Contrast**: Primary actions should be White bg/Black text. Secondary actions should be Black bg/Gray border.
3.  **Typography First**: Use Geist Sans/Mono weights to establish hierarchy, not colors.
4.  **Subtle Borders**: Use `1px` borders in dark gray (`#333` or `#262626`) to define areas instead of background shades.
5.  **No Background Gradients**: Remove heavy background gradients on cards.

## Proposed Changes

### 1. Global Styles (`src/app/globals.css`)
- [ ] Refine the color palette to strictly use Vercel's gray scale.
- [ ] Update `.dark` theme variables to ensure true black background.
- [ ] Remove custom utility classes that add color glows or heavy gradients.
- [ ] Add utility for "subtle-border" (e.g., `border-neutral-800`).

### 2. Home Page (`src/app/page.tsx`)
- [ ] **Header**: Remove gradient text on "Repe". Make it solid White, bold, tracking-tight.
- [ ] **Active Workout Card**:
    - Remove `bg-gradient-to-br from-emerald-950`.
    - Change to solid Black background with a thin white/20 border.
    - Change "In Progress" badge from Green to White/Black high contrast or simple outline.
- [ ] **Buttons**:
    - "Start New Workout": Solid White background, Black text, hover gray-200.
    - "View History": Transparent background, Border neutral-700, hover neutral-600.
- [ ] **Recent Workouts**:
    - Simplify the list items. Use Geist Mono for numbers/dates.
- [ ] **Empty State**:
    - Remove the "glow" behind the icon.
    - Simplify the icon container.

### 3. Components (General)
- [ ] Ensure `Badge`, `Button`, and `Card` components in `src/components/ui` support the new monochrome variants.

## Reference Palette (Geist Dark)
- Background: `#000000`
- Surface (Cards): `#0A0A0A` or `#000000`
- Border: `#333333`
- Text Primary: `#EDEDED`
- Text Secondary: `#A1A1A1`
- Text Tertiary: `#666666`
