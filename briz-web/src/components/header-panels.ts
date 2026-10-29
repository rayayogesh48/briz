// Opens one of the header's panels (My orders, Chat, Become a seller, Download
// app) from anywhere on the page, such as the account sidebar.

export type HeaderPanel = "orders" | "cart" | "chat" | "seller" | "download";

export const OPEN_HEADER_PANEL = "briz:open-panel";

export function openHeaderPanel(panel: HeaderPanel) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<HeaderPanel>(OPEN_HEADER_PANEL, { detail: panel }));
}
