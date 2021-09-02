export const crypto = (globalThis.crypto as any).webcrypto || globalThis.crypto

if (crypto == null || crypto.subtle == null) {
  throw new Error("Couldn't find access to the WebCrypto API on this platform.")
}

export const webcrypto = crypto.subtle
