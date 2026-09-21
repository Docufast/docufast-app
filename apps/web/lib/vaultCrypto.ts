// Client-side, zero-knowledge encryption for the Docufast Vault.
//
// Every customer gets an ECDH P-256 keypair, generated in their browser.
// The public key is safe to store on our server. The private key is
// encrypted twice before storage — once wrapped with a key derived from
// the customer's password, and once wrapped with a key derived from a
// one-time recovery phrase shown at sign-up. Neither wrapping key, nor
// the raw private key, is ever sent to the server.

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// Generates the customer's personal keypair. Public key is used to
// encrypt documents for them; private key is used to decrypt.
export async function generateVaultKeyPair() {
  return crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );
}

export async function exportPublicKeyBase64(publicKey: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", publicKey);
  return toBase64(raw);
}

export async function importPublicKeyFromBase64(base64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    fromBase64(base64),
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );
}

async function exportPrivateKeyRaw(privateKey: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.exportKey("pkcs8", privateKey);
}

async function importPrivateKeyRaw(raw: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "pkcs8",
    raw,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );
}

// Derives a symmetric AES-GCM key from a password (or recovery phrase)
// and a salt, using PBKDF2. This is the key used to "wrap" (encrypt) the
// customer's actual private key for storage.
async function deriveWrappingKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 210000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

interface WrappedKey {
  ciphertext: string;
  salt: string;
  iv: string;
}

// Encrypts the customer's private key using a key derived from their
// password or recovery phrase. Returns everything needed to store and
// later reverse this, none of which is useful without the original
// secret (password / recovery phrase).
export async function wrapPrivateKey(
  privateKey: CryptoKey,
  secret: string
): Promise<WrappedKey> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrappingKey = await deriveWrappingKey(secret, salt);
  const rawPrivateKey = await exportPrivateKeyRaw(privateKey);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    wrappingKey,
    rawPrivateKey
  );

  return {
    ciphertext: toBase64(ciphertext),
    salt: toBase64(salt.buffer),
    iv: toBase64(iv.buffer),
  };
}

// Reverses wrapPrivateKey — given the original secret and the stored
// wrapped key data, recovers the actual usable private key.
export async function unwrapPrivateKey(
  wrapped: WrappedKey,
  secret: string
): Promise<CryptoKey> {
  const salt = new Uint8Array(fromBase64(wrapped.salt));
  const iv = new Uint8Array(fromBase64(wrapped.iv));
  const wrappingKey = await deriveWrappingKey(secret, salt);

  const rawPrivateKey = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    wrappingKey,
    fromBase64(wrapped.ciphertext)
  );

  return importPrivateKeyRaw(rawPrivateKey);
}

// --- Document encryption/decryption (used by admin delivery + vault download) ---

interface EncryptedDocument {
  ciphertext: ArrayBuffer;
  iv: string;
  senderEphemeralPublicKey: string;
}

// Called in the ADMIN's browser when delivering a document. Encrypts the
// file specifically for one customer, using their public key. Only that
// customer's private key can ever decrypt the result.
export async function encryptDocumentForRecipient(
  fileBytes: ArrayBuffer,
  recipientPublicKeyBase64: string
): Promise<EncryptedDocument> {
  const recipientPublicKey = await importPublicKeyFromBase64(recipientPublicKeyBase64);

  // Ephemeral keypair: used once, for this document only.
  const ephemeralKeyPair = await generateVaultKeyPair();

  const sharedKey = await crypto.subtle.deriveKey(
    { name: "ECDH", public: recipientPublicKey },
    ephemeralKeyPair.privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    sharedKey,
    fileBytes
  );

  const senderEphemeralPublicKey = await exportPublicKeyBase64(ephemeralKeyPair.publicKey);

  return {
    ciphertext,
    iv: toBase64(iv.buffer),
    senderEphemeralPublicKey,
  };
}

// Called in the CUSTOMER's browser when downloading a document. Uses
// their own unlocked private key plus the sender's ephemeral public key
// (stored alongside the document) to recover the shared secret and
// decrypt the file.
export async function decryptDocumentForRecipient(
  ciphertext: ArrayBuffer,
  ivBase64: string,
  senderEphemeralPublicKeyBase64: string,
  recipientPrivateKey: CryptoKey
): Promise<ArrayBuffer> {
  const senderEphemeralPublicKey = await importPublicKeyFromBase64(
    senderEphemeralPublicKeyBase64
  );

  const sharedKey = await crypto.subtle.deriveKey(
    { name: "ECDH", public: senderEphemeralPublicKey },
    recipientPrivateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const iv = new Uint8Array(fromBase64(ivBase64));
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as BufferSource }, sharedKey, ciphertext);
}

export { toBase64, fromBase64 };
