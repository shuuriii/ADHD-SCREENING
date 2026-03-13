/**
 * Client-side AES-GCM encryption for localStorage/sessionStorage data.
 * Uses a per-browser key stored in IndexedDB (not accessible via JS injection on localStorage).
 */

const DB_NAME = "fayth-keystore";
const STORE_NAME = "keys";
const KEY_ID = "storage-key";

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getOrCreateKey(): Promise<CryptoKey> {
  const db = await openDB();

  // Try to load existing key
  const existing = await new Promise<CryptoKey | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(KEY_ID);
    req.onsuccess = () => resolve(req.result as CryptoKey | undefined);
    req.onerror = () => reject(req.error);
  });

  if (existing) return existing;

  // Generate new key
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false, // not extractable
    ["encrypt", "decrypt"]
  );

  // Store in IndexedDB
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(key, KEY_ID);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  return key;
}

/** Encrypt a string and return base64-encoded IV + ciphertext */
export async function encryptData(plaintext: string): Promise<string> {
  const key = await getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  // Prepend IV to ciphertext
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  // Base64 encode
  return btoa(String.fromCharCode(...combined));
}

/** Decrypt a base64-encoded IV + ciphertext string */
export async function decryptData(encrypted: string): Promise<string> {
  const key = await getOrCreateKey();

  // Base64 decode
  const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Encrypted wrapper around localStorage/sessionStorage.
 * Falls back to plaintext if Web Crypto is unavailable.
 */
export const secureStorage = {
  async setItem(storage: Storage, key: string, value: string): Promise<void> {
    try {
      if (typeof crypto !== "undefined" && crypto.subtle) {
        const encrypted = await encryptData(value);
        storage.setItem(key, `enc:${encrypted}`);
      } else {
        storage.setItem(key, value);
      }
    } catch {
      // Fallback to plain storage
      storage.setItem(key, value);
    }
  },

  async getItem(storage: Storage, key: string): Promise<string | null> {
    const raw = storage.getItem(key);
    if (!raw) return null;

    // Check if encrypted
    if (raw.startsWith("enc:")) {
      try {
        return await decryptData(raw.slice(4));
      } catch {
        // Decryption failed — data may be corrupt or key changed
        storage.removeItem(key);
        return null;
      }
    }

    // Plain text (legacy data) — return as-is
    return raw;
  },

  removeItem(storage: Storage, key: string): void {
    storage.removeItem(key);
  },
};
