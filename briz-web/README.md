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

## Search results

Enter a query in the navbar or choose **View all results** to open `/search?q=...`.
Try `/search?q=thermal+paper` for the full card-state demo, or `/search` for the complete sample catalog.

- Products and Stores views have separate sorting options. A compact row of up to three nearby matching stores appears above products. Selecting a store narrows the product list to its inventory.
- Price bounds, main category, dependent sub-category, store selection, sorting, and pagination are reflected in the URL and support refresh and browser history. Price filters exclude products with undisclosed prices; on the Stores view they select stores with inventory in range. Verified sorting puts verified stores first.
- Mobile layouts use a native filter dialog, a horizontally scrollable matching-store row, two product columns, and footer accordions.
- Product, store, and footer components follow Figma nodes `225:15896`, `252:19910`, and `379:52853`. Exact exported assets are kept under `public/figma/results`. Loading cards reproduce the exported 2.4-second Figma timelines and respect reduced motion.
- Data, distances, stock, ratings, and dates are local samples. Favorites and product quantities are visit-only previews; checkout is not connected. Price requests save locally. Footer links without configured destinations open an explanatory dialog; footer contact details reproduce the supplied design.

Run `npm test` for catalog matching, filtering, URL validation, and all sorting modes, alongside `npm run lint` and `npm run build`.

### Shared category browsing

The homepage **View category** button opens `/search` with no category selected and the complete product/store catalog available in the two tabs. **All categories** in the sidebar clears category and sub-category selections. A specific category is still directly available at `/search?category=Books+%26+Stationery`. Category browsing and text search use the same results component, with context-aware headings and breadcrumbs. Existing `category=Office+Supplies` links map to Books & Stationery.

The filter sidebar follows Figma node `782:26923`: category text buttons, sub-category radios, then price inputs. Lists initially show up to six options; **View more** expands longer lists. Sub-categories come from the sample catalog. Prices apply on Enter or when focus leaves the two price fields, and invalid ranges keep the previous results. Reset controls remain available above the results and inside the mobile drawer.

## Figma 12 Designs Implementation

The 12 designs from Figma file `WBxilPJIVmVdEMutum6eXp` are implemented across `/search` and interactive preview `/search-preview`:

1. **`780:25540` (Product Searched result)**: Search results view with `Results for “<query>”`, Products tab active, 4-column product grid, Sort By input field, and filter sidebar.
2. **`787:28094` (Input field)**: Custom `SortDropdown` trigger with `Sort by:` 12px label and 40px select trigger with chevron-down.
3. **`836:3686` (Categories -> Products)**: Category discovery view with `All categories` header, Products tab active, and centered `Load More Products` button (`836:28812`).
4. **`811:37415` (Filter applied state)**: Active filter bar (`822:39486`) displaying filter chips (`#f0f4ff`, `#3e63dd`, remove icon) and red `Clear All` button (`822:39543`).
5. **`836:28820` (Categories -> Stores)**: Category discovery view with Stores tab active, 3-column store cards, and `Load More Stores` button.
6. **`832:40193` (Product: Sort by)**: 200px popup menu with soft drop shadow, checkmark indicators, and keyboard accessibility for product sort options.
7. **`836:30472` (Category Selected: Agriculture & Farming - Stores)**: Specific category breadcrumb `Home › Categories › Agriculture & Farming` with Stores tab active.
8. **`811:36363` (Store searched results)**: Search query view with Stores tab active displaying 3-column store cards grid.
9. **`822:38234` (No result found)**: Search empty state with 180x180 empty illustration (`empty-state-illustration.png`), `No results found` 20px heading, subtitle, and clear filters action.
10. **`832:40248` (Stores: Sort by)**: 200px popup menu with checkmark indicators for Nearest, Top Rated, Verified, and Newly Joined.
11. **`836:31246` (Category Selected: Agriculture & Farming - Products)**: Specific category breadcrumb and sidebar subcategory radio options (Seeds, Fertilizers, Pesticides, Farm Equipments, Animal Feed, Greenhouse Materials) with Products tab active.
12. **`836:32569` (Category Selected: No Result found)**: Category empty state card with 180x180 illustration, `No results found` heading, and guidance.

