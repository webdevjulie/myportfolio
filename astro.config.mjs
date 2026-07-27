export default defineConfig({
  site: "https://webdevjulie.github.io",
  base: "/myportfolio/",

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },
});