/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#db2777",
        "primary-hover": "#be185d",
        secondary: "#2563eb",
        success: "#16a34a",
        warning: "#d97706",
        danger: "#dc2626",
        bg: "#0f0f0f",
        surface: "#1a1a2e",
        "surface-2": "#252540",
        ink: "#f5f5f5",
        muted: "#9ca3af",
        border: "#2d2d44",
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        xs: "14px",
        sm: "16px",
        base: "18px",
        lg: "24px",
        xl: "32px",
        "2xl": "40px",
      },
      boxShadow: {
        bold: "4px 4px 0px #db2777",
        "bold-blue": "4px 4px 0px #2563eb",
        "bold-sm": "2px 2px 0px #db2777",
        "bold-lg": "6px 6px 0px #db2777",
      },
      borderRadius: {
        card: "1rem",
        btn: "0.5rem",
      },
    },
  },
  plugins: [],
};
