// Design tokens (the styling source of truth). The light palette stays
// utilitarian, high-contrast for bright-sunlight field use; dark + AMOLED
// black are opt-in via the theme toggle (product decision 2026-07-12).
// Values live as HSL variables in `global.css` (light `:root`, dark
// `.dark:root`); `src/theme/tokens.ts` mirrors the hexes for programmatic
// (non-className) use — keep the three in sync. Large touch targets come
// from the spacing scale.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  // Class strategy so the scheme is driven by the theme store's
  // colorScheme.set(...) (src/stores/theme-store.ts), not only the OS.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand — agricultural green/teal.
        brand: {
          DEFAULT: "hsl(var(--brand))",
          light: "hsl(var(--brand-light))",
          dark: "hsl(var(--brand-dark))",
        },
        // Status — green = success, red = failure (mobile/AGENTS.md).
        success: { DEFAULT: "hsl(var(--success))", bg: "hsl(var(--success-bg))" },
        danger: { DEFAULT: "hsl(var(--danger))", bg: "hsl(var(--danger-bg))" },
        warning: { DEFAULT: "hsl(var(--warning))", bg: "hsl(var(--warning-bg))" },
        // Surfaces + text.
        surface: { DEFAULT: "hsl(var(--surface))", muted: "hsl(var(--surface-muted))" },
        ink: {
          DEFAULT: "hsl(var(--ink))",
          muted: "hsl(var(--ink-muted))",
          inverse: "hsl(var(--ink-inverse))",
        },
        line: "hsl(var(--line))",
      },
      borderRadius: { card: "12px" },
      minHeight: { touch: "48px" }, // WCAG-AA / one-handed target
      minWidth: { touch: "48px" },
    },
  },
  plugins: [],
};
