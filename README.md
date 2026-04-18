# Conjecture Visualization

A standalone static HTML visualization of **Conjecture 0.5** and **Corollary 1.5**. Ported from the React `hidden_page.tsx` component.

## Files

- `index.html` — page structure; links KaTeX (CDN) and the pre-built Tailwind stylesheet.
- `app.js` — vanilla JavaScript state, math derivations, rendering, and event wiring.
- `src/input.css` — Tailwind entry (`@tailwind base/components/utilities`).
- `tailwind.config.cjs` — Tailwind config scanning `index.html` and `app.js`.
- `dist/tailwind.css` — generated Tailwind bundle (checked in so the page works without a build).

## Building the CSS

```sh
npm install
npm run build:css
```

Use `npm run watch:css` during development.

## Viewing

Open `index.html` directly in a browser. No server required.
