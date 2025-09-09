/* path: tailwind.config.ts */
/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* Logo colors */
        orange: {
          DEFAULT: "hsl(var(--orange))",
          foreground: "hsl(var(--orange-foreground))",
          light: "hsl(var(--orange-light, var(--orange)))",
          dark: "hsl(var(--orange-dark, var(--orange)))",
        },
        purple: {
          DEFAULT: "hsl(var(--purple))",
          foreground: "hsl(var(--purple-foreground))",
          light: "hsl(var(--purple-light, var(--purple)))",
          dark: "hsl(var(--purple-dark, var(--purple)))",
        },
        yellow: {
          DEFAULT: "hsl(var(--yellow))",
          foreground: "hsl(var(--yellow-foreground))",
          light: "hsl(var(--yellow-light, var(--yellow)))",
          dark: "hsl(var(--yellow-dark, var(--yellow)))",
        },
        pink: {
          DEFAULT: "hsl(var(--pink))",
          foreground: "hsl(var(--pink-foreground))",
          light: "hsl(var(--pink-light, var(--pink)))",
          dark: "hsl(var(--pink-dark, var(--pink)))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "bounce-slow": {
          "0%, 100%": {
            transform: "translateY(-25%)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
        glow: "glow 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "bounce-slow": "bounce-slow 2s infinite",
      },

      /* === T Y P O G R A P H Y (.prose) === */
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme("colors.foreground"),
            maxWidth: "none",

            a: {
              color: theme("colors.primary.DEFAULT"),
              textDecorationThickness: "0.05em",
              textUnderlineOffset: "0.15em",
              "&:hover": { textDecorationThickness: "0.08em" },
            },

            "h1,h2,h3": {
              color: theme("colors.foreground"),
              fontWeight: "700",
              letterSpacing: "-0.01em",
              scrollMarginTop: "6rem",
            },
            h1: {
              fontSize: theme("fontSize.2xl")[0],
              marginTop: "1.5rem",
              marginBottom: "0.75rem",
            },
            h2: {
              fontSize: theme("fontSize.xl")[0],
              marginTop: "2rem",
              marginBottom: "0.75rem",
            },
            h3: {
              fontSize: theme("fontSize.lg")[0],
              marginTop: "1.5rem",
              marginBottom: "0.5rem",
            },

            p: { color: theme("colors.muted-foreground") },

            strong: { color: theme("colors.foreground") },

            code: {
              backgroundColor: theme("colors.muted.DEFAULT"),
              borderRadius: theme("borderRadius.md"),
              padding: "0.15rem 0.35rem",
            },
            pre: {
              backgroundColor: theme("colors.muted.DEFAULT"),
              border: `1px solid ${theme("colors.border")}`,
              borderRadius: theme("borderRadius.xl"),
            },

            hr: { borderColor: theme("colors.border") },

            /* Tabele */
            table: { width: "100%", borderCollapse: "collapse" },
            thead: {
              borderBottom: `1px solid ${theme("colors.border")}`,
            },
            "thead th": {
              backgroundColor: theme("colors.muted.DEFAULT"),
              color: theme("colors.foreground"),
              padding: "0.75rem",
              fontWeight: "600",
              textAlign: "left",
            },
            "tbody tr": {
              borderBottom: `1px solid ${theme("colors.border")}`,
            },
            "tbody td": { padding: "0.75rem", verticalAlign: "top" },
          },
        },

        /* Dark */
        invert: {
          css: {
            color: theme("colors.card-foreground"),
            a: { color: theme("colors.primary.DEFAULT") },
            "h1,h2,h3": { color: theme("colors.card-foreground") },
            p: { color: theme("colors.muted-foreground") },
            code: { backgroundColor: theme("colors.muted.DEFAULT") },
            pre: {
              backgroundColor: theme("colors.muted.DEFAULT"),
              borderColor: theme("colors.border"),
            },
            "thead th": { backgroundColor: theme("colors.muted.DEFAULT") },
            "tbody tr": { borderColor: theme("colors.border") },
          },
        },
      }),
    },
  },
  plugins: [
    typography, // <<<<<<<<<<<<<< WŁĄCZA .prose
  ],
};
