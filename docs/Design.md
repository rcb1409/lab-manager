# MSE Department Design System

A shared reference for maintaining visual consistency across all internal MSE web applications (KnowledgeHub, Email Builder, etc.).

---

## Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `ncsu-red` | `#CC0000` | Primary brand color. Used for headers, buttons, active states, links, toggles. |
| `ncsu-gray` | `#333333` | Dark text, footer background, secondary buttons, avatars. |
| Page background | `#f2f2f2` | Light gray background for all pages. |
| White | `#FFFFFF` | Cards, modals, input backgrounds. |

### Extended Palette (Tailwind defaults used throughout)

| Purpose | Classes |
|---------|---------|
| Muted text | `text-gray-500`, `text-gray-400` |
| Borders | `border-gray-200`, `border-gray-300` |
| Hover backgrounds | `hover:bg-gray-100`, `hover:bg-gray-50` |
| Disabled states | `opacity-50` on buttons |
| Tag/badge backgrounds | `bg-ncsu-red/10` with `text-ncsu-red` |

---

## Typography

### Fonts (Google Fonts)

Add this to your `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&family=Roboto+Condensed:wght@400;700&family=Roboto+Slab:wght@300;400;700&display=swap" rel="stylesheet">
```

| Font | Tailwind Class | Usage |
|------|---------------|-------|
| **Roboto** | `font-sans` (default) | All body text, labels, inputs, buttons |
| **Roboto Slab** | `font-slab` | Page titles, card headings, section headers |

### Scale

| Element | Classes |
|---------|---------|
| Page heading | `text-3xl md:text-4xl font-slab font-bold` |
| Card title | `text-base md:text-lg font-bold` |
| Section label | `text-sm font-medium text-gray-700` |
| Body text | `text-sm text-gray-700 leading-relaxed` |
| Small/meta text | `text-xs text-gray-500` |
| Filter label | `text-xs font-bold uppercase tracking-wide` |

---

## Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "ncsu-red": "#CC0000",
        "ncsu-gray": "#333333",
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
        slab: ["Roboto Slab", "serif"],
      },
    },
  },
  plugins: [],
}
```

### CSS Theme Layer (Tailwind v4)

```css
@import "tailwindcss";

@theme {
  --font-sans: "Roboto", system-ui, -apple-system, sans-serif;
  --font-slab: "Roboto Slab", "Times New Roman", serif;
  --color-ncsu-red: #CC0000;
  --color-ncsu-gray: #333333;
}

*, *::before, *::after {
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
}

body {
  background-color: #f2f2f2;
  color: #333333;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

---

## Page Layout Structure

```
┌─────────────────────────────────────────────┐
│  Utility Bar  (black, 10px uppercase links) │
├─────────────────────────────────────────────┤
│  Header  (ncsu-red, sticky, h-16/h-20)     │
│  ┌─ Logo ──── App Title ──── Nav + Logout ┐ │
├─────────────────────────────────────────────┤
│  Main Content  (bg-[#f2f2f2])               │
│  max-w-7xl mx-auto px-4 py-6               │
│  ┌─────┬──────────┬──────┐                  │
│  │Left │  Center  │Right │  (12-col grid)   │
│  │ 3   │    6     │  3   │                  │
│  └─────┴──────────┴──────┘                  │
├─────────────────────────────────────────────┤
│  Footer  (ncsu-gray #333, white text)       │
│  2-column grid: address | quick links       │
└─────────────────────────────────────────────┘
```

### Utility Bar (top)

```
bg-black text-white text-[10px] px-4 py-1
flex justify-end gap-4 uppercase font-bold tracking-wider
```

Links: `hover:underline`

### Header

```
sticky top-0 z-50 bg-ncsu-red text-white shadow-lg
max-w-7xl mx-auto h-16 md:h-20
```

- App title: `font-slab font-bold text-lg md:text-xl uppercase tracking-tight`
- Nav buttons: `font-bold text-sm uppercase` with `hover:text-white/80`
- Active nav: `underline decoration-2 underline-offset-4`

### Footer

```
bg-[#333333] text-white px-4 py-12
max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8
```

- Section heading: `font-bold uppercase text-sm mb-4 border-b border-white/20 pb-2`
- Links: `text-sm text-gray-300 hover:text-white`

### Mobile Navigation

```
md:hidden fixed bottom-0 left-0 right-0
bg-white border-t border-gray-200 px-6 py-3
flex justify-between items-center z-50
```

Active icon: `text-[#CC0000]`, Inactive: `text-gray-400`

---

## Component Patterns

### Cards

```
bg-white rounded-lg border border-gray-200 shadow-sm
hover:shadow-md hover:border-ncsu-red/40
transition-shadow duration-200
```

Padding: `px-4 pt-4 pb-2` for header, `px-4 pb-3` for content sections.

### Buttons

| Type | Classes |
|------|---------|
| Primary | `bg-ncsu-red text-white rounded-full px-6 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50` |
| Secondary | `bg-ncsu-gray text-white px-3 py-2 rounded text-sm font-medium hover:opacity-90` |
| Ghost | `text-gray-600 hover:bg-gray-100 rounded-md px-4 py-2 text-sm` |
| Pill / Filter | `px-3 py-1.5 text-xs font-bold uppercase rounded-full border` |
| Pill Active | Add `bg-ncsu-red text-white border-ncsu-red` |
| Pill Inactive | `text-gray-500 border-gray-200 hover:border-ncsu-red hover:text-ncsu-red` |
| Danger | `bg-red-500 text-white rounded-md hover:bg-red-600 text-xs` |
| Link-style | `text-ncsu-red hover:underline text-sm` |

### Inputs

```
w-full px-3 py-2 border border-gray-300 rounded-md text-sm
focus:outline-none focus:ring-2 focus:ring-ncsu-red
```

### Toggle Switch

```
Outer: relative inline-flex h-5 w-9 items-center rounded-full transition-colors
  Active:   bg-ncsu-red
  Inactive: bg-gray-300

Inner: inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform
  Active:   translate-x-4.5
  Inactive: translate-x-0.5
```

### Avatar / Initials Circle

```
w-10 h-10 rounded-full bg-ncsu-gray text-white
flex items-center justify-center text-sm font-bold
```

Larger variant (modals): `w-12 h-12`

### Tags / Badges

```
px-2 py-0.5 rounded text-xs font-medium bg-ncsu-red/10 text-ncsu-red
```

### Modal / Overlay

```
Backdrop: fixed inset-0 z-50 bg-black/80 flex items-center justify-center
Panel:    bg-white rounded-lg shadow-2xl overflow-hidden max-h-[90vh]
Close:    text-gray-400 hover:text-gray-600 text-2xl
```

---

## Iconography

Using [Lucide React](https://lucide.dev/) icons throughout.

```bash
npm install lucide-react
```

Common icons used: `LogOut`, `Home`, `User`, `Search`, `SlidersHorizontal`, `Edit3`, `Bookmark`, `ArrowLeft`, `PlusSquare`, `Image`

Default size: `size={20}` for nav, `size={16}` for inline, `size={18}` for action buttons, `size={24}` for mobile nav.

---

## Spacing & Layout Conventions

| Pattern | Classes |
|---------|---------|
| Page container | `max-w-7xl mx-auto px-4 py-6` |
| Card gap | `space-y-4` (vertical list) |
| Grid layout | `lg:grid lg:grid-cols-12 gap-6` |
| Sidebar | `lg:col-span-3`, sticky: `lg:sticky lg:top-20` |
| Main content | `lg:col-span-6` |
| Section spacing | `space-y-4` or `space-y-6` |
| Border separator | `border-t border-gray-200` |

---

## Quick Start Checklist

To match this design system in a new app:

1. Install Tailwind CSS and configure with the colors/fonts above
2. Add the Google Fonts `<link>` tags to `index.html`
3. Copy the CSS theme layer into your `index.css`
4. Install `lucide-react` for icons
5. Reuse the Layout shell (utility bar + red header + footer)
6. Follow the card, button, and input patterns above
7. Keep page background as `#f2f2f2`, cards as white with `rounded-lg border border-gray-200 shadow-sm`
