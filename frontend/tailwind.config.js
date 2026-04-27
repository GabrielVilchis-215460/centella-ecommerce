/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {

      colors: {
        primary:    "var(--color-primary)",
        aux:        "var(--color-aux)",
        secondary:  "var(--color-secondary)",

        bg: {
          DEFAULT: "var(--color-bg)",
          dark:    "var(--color-bg-dark)",
          light:   "var(--color-bg-light)",
        },

        text: {
          dark:    "var(--color-text-dark)",
          regular: "var(--color-text-regular)",
          light:   "var(--color-text-light)",
        },

        states: {
          red:      "var(--color-states-red)",
          green:    "var(--color-states-green)",
          blue:     "var(--color-states-blue)",
          orange:   "var(--color-states-orange)",
          gray:     "var(--color-states-gray)",
        },

        success: "var(--color-success)",
        error:   "var(--color-error)",
        warning: "var(--color-warning)",

      },

      fontFamily: {
        heading: "var(--font-heading)",
        body:    "var(--font-body)",
      },

      fontSize: {
        sm:   "var(--text-sm)",
        base: "var(--text-base)",
        md:   "var(--text-md)",
        lg:   "var(--text-lg)",
        xl:   "var(--text-xl)",
      },

      fontWeight: {
        light:    "var(--font-light)",
        regular:  "var(--font-regular)",
        medium:   "var(--font-medium)",
        semibold: "var(--font-semibold)",
        bold:     "var(--font-bold)",
      },

      spacing: {
        1:  "var(--space-1)",
        2:  "var(--space-2)",
        3:  "var(--space-3)",
        4:  "var(--space-4)",
        5:  "var(--space-5)",
        6:  "var(--space-6)",
        8:  "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        16: "var(--space-16)",
      },

      borderRadius: {
        sm:   "var(--radius-sm)",
        md:   "var(--radius-md)",
        lg:   "var(--radius-lg)",
        xl:   "var(--radius-xl)",
        xxl:   "var(--radius-xxl)",
      },

      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },

      transitionDuration: {
        fast:   "150ms",
        normal: "300ms",
        slow:   "500ms",
      },

    },
  },
  plugins: [],
};
