// Programmatic mirror of the color tokens in `tailwind.config.js` (keep the two
// in sync). Use these for non-className APIs: StatusBar, the navigation theme,
// SVG fills. className styling should use the Tailwind classes, not these.
export const colors = {
  brand: "#0F6E56",
  brandLight: "#1D9E75",
  brandDark: "#085041",
  success: "#16a34a",
  danger: "#dc2626",
  warning: "#d97706",
  surface: "#ffffff",
  surfaceMuted: "#f1f5f9",
  ink: "#0f172a",
  inkMuted: "#475569",
  inkInverse: "#ffffff",
  line: "#e2e8f0",
} as const;

export const radius = { card: 12 } as const;

// Minimum touch target (WCAG-AA, one-handed field use).
export const touchTarget = 48 as const;
