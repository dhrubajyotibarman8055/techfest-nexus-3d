import { FEST } from "../data";

/** Opens the registration flow. If VITE_REGISTER_URL is set, goes there instead of the built-in modal. */
export function openRegister(eventId?: string) {
  if (FEST.registerUrl) {
    window.open(FEST.registerUrl, "_blank", "noopener,noreferrer");
    return;
  }
  window.dispatchEvent(new CustomEvent("open-register", { detail: { eventId } }));
}
