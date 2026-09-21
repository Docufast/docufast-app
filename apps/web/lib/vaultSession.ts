// Holds the customer's unlocked vault private key for their current
// browser session, using IndexedDB. The key is stored as non-extractable
// once here — meaning it can be USED for decryption, but its raw bytes
// can never be read back out again, even by our own code. This survives
// page reloads within the same browser, but is cleared on sign-out and
// never leaves the device.

import { get, set, del } from "idb-keyval";

function storageKey(userId: string): string {
  return `docufast-vault-key-${userId}`;
}

export async function storeUnlockedPrivateKey(
  userId: string,
  extractablePrivateKey: CryptoKey
): Promise<void> {
  const raw = await crypto.subtle.exportKey("pkcs8", extractablePrivateKey);
  const nonExtractableKey = await crypto.subtle.importKey(
    "pkcs8",
    raw,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveKey", "deriveBits"]
  );
  await set(storageKey(userId), nonExtractableKey);
}

export async function getUnlockedPrivateKey(userId: string): Promise<CryptoKey | null> {
  try {
    const key = await get(storageKey(userId));
    return key || null;
  } catch (err) {
    return null;
  }
}

export async function clearUnlockedPrivateKey(userId: string): Promise<void> {
  await del(storageKey(userId));
}
