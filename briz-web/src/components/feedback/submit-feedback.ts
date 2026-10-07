import type { FeedbackValues } from "./feedback-data";

export type FeedbackPayload = FeedbackValues & { images: File[] };

let attempts = 0;

/**
 * Stand-in for the feedback API — replace the body with the real request.
 * It fails when the device is offline, and once per page load when the URL
 * has `?simulate=error`, so the failure state can be previewed.
 */
export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  void payload;
  attempts += 1;
  await new Promise((resolve) => setTimeout(resolve, 1400));
  const simulateError = new URLSearchParams(window.location.search).get("simulate") === "error";
  if (!navigator.onLine || (simulateError && attempts === 1)) {
    throw new Error("Feedback could not be sent");
  }
}
