// A customer who is sent to sign in part-way through an order form should not lose what they typed.
// The draft is saved just before the redirect and kept in this tab only (session storage, never sent
// anywhere) for up to two hours. Each form restores it when it loads and clears it once the order is placed.
const PREFIX = "docufast-draft:";
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

export function saveDraft(key: string, data: unknown): void {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify({ t: Date.now(), data }));
  } catch {
    // Storage blocked or full: the form still works, it just cannot keep a draft.
  }
}

export function loadDraft<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.t !== "number" || Date.now() - parsed.t > MAX_AGE_MS) {
      sessionStorage.removeItem(PREFIX + key);
      return null;
    }
    return parsed.data as T;
  } catch {
    return null;
  }
}

export function clearDraft(key: string): void {
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch {
    // Nothing to clear.
  }
}
