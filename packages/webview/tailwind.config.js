/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        aibc: {
          bg: "var(--vscode-editor-background)",
          fg: "var(--vscode-foreground)",
          muted: "var(--vscode-descriptionForeground)",
          border: "var(--vscode-panel-border, rgba(255,255,255,0.08))",
          accent: "var(--vscode-button-background)",
          accentFg: "var(--vscode-button-foreground)",
          hover: "var(--vscode-list-hoverBackground)",
          card: "var(--vscode-editorWidget-background, rgba(255,255,255,0.03))",
        },
      },
      fontFamily: {
        sans: [
          "var(--vscode-font-family)",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.18)",
      },
    },
  },
  plugins: [],
};
