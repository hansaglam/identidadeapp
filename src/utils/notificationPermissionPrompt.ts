/** In-app rationale before the OS notification permission dialog (user-initiated only). */

type Choice = "allow" | "deny";

let pending: ((choice: Choice) => void) | null = null;
const listeners = new Set<(visible: boolean) => void>();

export function subscribeNotificationPermissionRationale(
  listener: (visible: boolean) => void
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function showNotificationPermissionRationale(): Promise<Choice> {
  return new Promise((resolve) => {
    pending = resolve;
    listeners.forEach((l) => l(true));
  });
}

export function completeNotificationPermissionRationale(choice: Choice): void {
  listeners.forEach((l) => l(false));
  pending?.(choice);
  pending = null;
}
