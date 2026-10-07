export const FEEDBACK_TYPES = [
  "General Feedback",
  "Feature Request",
  "Bug Report",
  "App Performance",
  "Others",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export type FeedbackValues = {
  name: string;
  phone: string;
  type: FeedbackType | "";
  message: string;
};

export type FeedbackField = keyof FeedbackValues;
export type FeedbackErrors = Partial<Record<FeedbackField, string>>;

export const EMPTY_FEEDBACK: FeedbackValues = { name: "", phone: "", type: "", message: "" };

export const MESSAGE_LIMIT = 1000;
export const MAX_IMAGES = 3;
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png"];
export const IMAGE_ERROR = "Image must be JPG or PNG and smaller than 5 MB";
export const IMAGE_LIMIT_ERROR = `You can attach up to ${MAX_IMAGES} images`;

/** Nepali mobile numbers: 10 digits starting 96, 97 or 98. */
const NEPAL_MOBILE = /^9[678]\d{8}$/;

export function validateFeedback(values: FeedbackValues): FeedbackErrors {
  const errors: FeedbackErrors = {};
  if (values.name.trim().length < 2) errors.name = "Enter your full name";
  if (!NEPAL_MOBILE.test(values.phone)) errors.phone = "Enter a valid phone number";
  if (!values.type) errors.type = "Select a feedback type";
  if (!values.message.trim()) errors.message = "Tell us your feedback";
  return errors;
}

export function isValidImage(file: File) {
  return IMAGE_TYPES.includes(file.type) && file.size <= IMAGE_MAX_BYTES;
}

export function formatFileSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
