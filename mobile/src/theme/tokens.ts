// Programmatic mirror of the color variables in `global.css` (light `:root`,
// dark `.dark:root`) — keep the three files in sync (this, global.css,
// tailwind.config.js). Use these for non-className APIs: StatusBar, the
// navigation theme, ActivityIndicator, SVG fills. className styling should
// use the Tailwind classes, not these.

type Palette = {
  brand: string;
  brandLight: string;
  brandDark: string;
  success: string;
  danger: string;
  warning: string;
  surface: string;
  surfaceMuted: string;
  ink: string;
  inkMuted: string;
  inkInverse: string;
  line: string;
};

export const palettes: Record<"light" | "dark", Palette> = {
  light: {
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
  },
  dark: {
    brand: "#1D9E75",
    brandLight: "#3EBD94",
    brandDark: "#0F6E56",
    success: "#22c55e",
    danger: "#ef4444",
    warning: "#f59e0b",
    surface: "#0f172a",
    surfaceMuted: "#1e293b",
    ink: "#f8fafc",
    inkMuted: "#94a3b8",
    inkInverse: "#ffffff",
    line: "#334155",
  },
} as const;

// Resolved palette for a concrete scheme. AMOLED black uses the dark
// palette (its only delta — the true-black canvas — is a className-layer
// override in the theme store, not a separate palette).
export function palette(scheme: "light" | "dark"): Palette {
  return palettes[scheme];
}

export const radius = { card: 12 } as const;

// Minimum touch target (WCAG-AA, one-handed field use).
export const touchTarget = 48 as const;
