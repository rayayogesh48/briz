# Briz Web

Next.js App Router + TypeScript implementation of the Briz Figma navbar and search system. Styling uses CSS Modules, shared color tokens, and Inter via next/font.

## Run

```sh
npm install
npm run dev
```

- `/`: responsive navbar with interactive search.
- `/preview`: four original navbar variants at their design widths.
- `/search-preview`: all search states, row hover variants, skeleton animations, operating statuses, and suggestion icon. Reset previews restores the Figma examples after interaction.

## Search

The implementation follows Figma nodes 753:50423, 759:50862, 753:41430, 743:40328, and 743:39184 in Briz-Web (WBxilPJIVmVdEMutum6eXp).

- The idle field is 400px and expands to 540px over 300ms on focus without moving the other navbar controls. The filled state stays 540px, matching Figma. Clearing and dismissing an empty field restores 400px.
- Recent history, suggestion chips, product/store filtering, keyboard navigation, empty results, and product-request forms are interactive. Narrow layouts open search in a native dialog.
- `src/components/navbar-search.tsx` owns interactions; `search-parts.tsx` contains reusable panels and rows; `search-data.ts` supplies the local demo catalog.
- Original Figma assets are saved in `public/figma`. The sample product image is the exact avatar used in the supplied designs.
- Skeletons use the exported Motion timeline: a shared two-second loop, opacity 1 → 0.35 → 1, 80ms phase offsets, and cubic-bezier(0.4, 0, 0.6, 1). Reduced motion disables pulsing and width transitions.

Catalog search simulates a cancellable 650ms lookup; it is not connected to a live API or AI service. Product requests save in localStorage and do not notify sellers. Accounts, orders, seller registration, and app-store destinations remain demo integrations.

## Validation

```sh
npm run lint
npm run build
```

Browser checks cover focus widths, stationary navbar controls, history and suggestions, result filtering, all operating statuses, request saving, cancellation, keyboard dismissal, mobile overflow, and the exported animation keyframes.
