// Design tokens (the styling source of truth). Utilitarian, high-contrast for
// bright-sunlight field use; large touch targets come from spacing scale.
// `src/theme/tokens.ts` mirrors the color hexes for programmatic (non-className)
// use — keep the two in sync.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand — agricultural green/teal.
        brand: { DEFAULT: "#0F6E56", light: "#1D9E75", dark: "#085041" },
        // Status — green = success, red = failure (mobile/AGENTS.md).
        success: { DEFAULT: "#16a34a", bg: "#dcfce7" },
        danger: { DEFAULT: "#dc2626", bg: "#fee2e2" },
        warning: { DEFAULT: "#d97706", bg: "#fef3c7" },
        // Surfaces + text.
        surface: { DEFAULT: "#ffffff", muted: "#f1f5f9" },
        ink: { DEFAULT: "#0f172a", muted: "#475569", inverse: "#ffffff" },
        line: "#e2e8f0",
      },
      borderRadius: { card: "12px" },
      minHeight: { touch: "48px" }, // WCAG-AA / one-handed target
      minWidth: { touch: "48px" },
    },
  },
  plugins: [],
};
