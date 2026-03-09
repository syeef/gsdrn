const ENCRYPTED_PREFIX = "enc:v1";
const IV_LENGTH_BYTES = 12;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const keyCache = new Map<string, Promise<CryptoKey>>();

const readKeyMaterial = (env: unknown): string => {
  if (!env || typeof env !== "object") {
    throw new Error("Missing environment bindings for data encryption");
  }

  const key = (env as Record<string, unknown>).DATA_ENCRYPTION_KEY;
  if (typeof key !== "string" || key.trim().length < 16) {
    throw new Error(
      "DATA_ENCRYPTION_KEY must be set to a strong secret (minimum 16 chars)",
    );
  }

  return key.trim();
};

const toBase64 = (value: Uint8Array): string =>
  Buffer.from(value).toString("base64");

const fromBase64 = (value: string): ArrayBuffer => {
  const bytes = Buffer.from(value, "base64");
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
};

const getKey = async (env: unknown): Promise<CryptoKey> => {
  const keyMaterial = readKeyMaterial(env);
  const cached = keyCache.get(keyMaterial);
  if (cached) return cached;

  const imported = (async () => {
    // Derive a fixed-length AES key from the provided secret material.
    const digest = await crypto.subtle.digest(
      "SHA-256",
      textEncoder.encode(keyMaterial),
    );
    return crypto.subtle.importKey(
      "raw",
      digest,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );
  })();

  keyCache.set(keyMaterial, imported);
  return imported;
};

export const isEncryptedValue = (value: string): boolean =>
  value.startsWith(`${ENCRYPTED_PREFIX}:`);

export const encryptAtRest = async (
  plaintext: string,
  env: unknown,
): Promise<string> => {
  const key = await getKey(env);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    textEncoder.encode(plaintext),
  );

  return `${ENCRYPTED_PREFIX}:${toBase64(iv)}:${toBase64(new Uint8Array(ciphertext))}`;
};

export const decryptAtRest = async (
  encryptedOrPlaintext: string,
  env: unknown,
): Promise<string> => {
  if (!isEncryptedValue(encryptedOrPlaintext)) {
    return encryptedOrPlaintext;
  }

  const parts = encryptedOrPlaintext.split(":");
  if (parts.length !== 4) {
    throw new Error("Invalid encrypted payload format");
  }

  const ivBuffer = fromBase64(parts[2]);
  const iv = new Uint8Array(ivBuffer);
  const ciphertext = fromBase64(parts[3]);
  if (iv.byteLength !== IV_LENGTH_BYTES) {
    throw new Error("Invalid encrypted payload IV");
  }

  const key = await getKey(env);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );

  return textDecoder.decode(plaintext);
};
