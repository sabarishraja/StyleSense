/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        surface: "#1A1A1A",
        surface2: "#222222",
        "surface-light": "#2A2A2A",
        "border-soft": "#1F1F1F",
        accent: "#D4A574",
        "accent-soft": "rgba(212,165,116,0.14)",
        "accent-light": "#E8C9A0",
        "accent-dark": "#B8894E",
        "text-primary": "#F5F5F5",
        "text-secondary": "#AAAAAA",
        "text-muted": "#6B6B6B",
        success: "#7FB685",
        warning: "#E0B857",
        error: "#EF5350",
      },
      fontFamily: {
        sans: ["Inter_400Regular", "System"],
        "sans-medium": ["Inter_500Medium", "System"],
        "sans-semibold": ["Inter_600SemiBold", "System"],
        "sans-bold": ["Inter_700Bold", "System"],
        serif: ["Fraunces_400Regular", "Georgia", "serif"],
        "serif-medium": ["Fraunces_500Medium", "Georgia", "serif"],
        mono: ["JetBrainsMono_400Regular", "monospace"],
        "mono-medium": ["JetBrainsMono_500Medium", "monospace"],
      },
      borderRadius: {
        card: "20px",
        button: "28px",
        pill: "999px",
        input: "16px",
      },
    },
  },
  plugins: [],
};
