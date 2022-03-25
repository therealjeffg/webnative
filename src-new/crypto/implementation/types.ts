export type Implementation = {
  hash: {
    sha256: (bytes: Uint8Array) => Promise<Uint8Array>
  }
  aes: {
    decrypt: (data: Uint8Array, keyStr: string) => Promise<Uint8Array>
    encrypt: (data: Uint8Array, keyStr: string) => Promise<Uint8Array>
    genKeyStr: () => Promise<string>
  }
  rsa: {
    decrypt: (data: Uint8Array, privateKey: CryptoKey) => Promise<Uint8Array>
    encrypt: (data: Uint8Array, keyStr: string) => Promise<Uint8Array>
    genKeyPair: () => Promise<CryptoKeyPair>
    verify: (message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array) => Promise<boolean>
  }
  ed25519: {
    verify: (message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array) => Promise<boolean>
  }
  keystore: {
    clear: () => Promise<void>
    decrypt: (encrypted: string) => Promise<string>
    exchangeKeyPair: () => Promise<CryptoKeyPair>
    exportSymmKey: (name: string) => Promise<string>
    getAlg: () => Promise<string>
    importSymmKey: (key: string, name: string) => Promise<void>
    keyExists: (keyName: string) => Promise<boolean>
    publicExchangeKey: () => Promise<string>
    publicWriteKey: () => Promise<string>
    sign: (message: string) => Promise<string>
    writeKeyPair: () => Promise<CryptoKeyPair>
  }
}
