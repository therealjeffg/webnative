import { crypto } from "crypto"
import * as ed25519 from "ed25519"
import * as aes from "keystore-idb/aes"
import * as rsa from "keystore-idb/rsa"
import { SymmAlg, SymmKeyLength } from "keystore-idb/types"
import * as uint8arrays from "uint8arrays"

import { Implementation } from "../implementation/types.ts"
import * as keystore from "./browser/keystore.ts"

//
// ⛰
//

const AES_ALGORITHM: SymmAlg = SymmAlg.AES_GCM

//
// 🛳
//

export const IMPLEMENTATION: Implementation = {
  hash: {
    sha256,
  },
  aes: {
    decrypt: aesDecrypt,
    encrypt: aesEncrypt,
    genKeyStr: aesGenKeyStr,
  },
  rsa: {
    decrypt: rsaDecrypt,
    encrypt: rsaEncrypt,
    genKeyPair: rsaGenKeyPair,
    verify: rsaVerify,
  },
  ed25519: {
    verify: ed25519Verify,
  },
  keystore: {
    clear: ksClear,
    decrypt: ksDecrypt,
    exchangeKeyPair: ksExchangeKeyPair,
    exportSymmKey: ksExportSymmKey,
    getAlg: ksGetAlg,
    importSymmKey: ksImportSymmKey,
    keyExists: ksKeyExists,
    publicExchangeKey: ksPublicExchangeKey,
    publicWriteKey: ksPublicWriteKey,
    sign: ksSign,
    writeKeyPair: ksWriteKeyPair,
  },
}

//
// HASH
//

async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))
}

//
// AES
//

export async function aesDecrypt(data: Uint8Array, keyStr: string): Promise<Uint8Array> {
  const key = await aes.importKey(keyStr, { length: SymmKeyLength.B256, alg: AES_ALGORITHM })
  const decryptedBuf = await aes.decryptBytes(data, key, { alg: AES_ALGORITHM })
  return new Uint8Array(decryptedBuf)
}

export async function aesEncrypt(data: Uint8Array, keyStr: string): Promise<Uint8Array> {
  const key = await aes.importKey(keyStr, { length: SymmKeyLength.B256, alg: AES_ALGORITHM })
  const encrypted = await aes.encryptBytes(data, key, { alg: AES_ALGORITHM })
  return new Uint8Array(encrypted)
}

export async function aesGenKeyStr(): Promise<string> {
  const key = await aes.makeKey({ length: SymmKeyLength.B256, alg: AES_ALGORITHM })
  return aes.exportKey(key)
}

//
// RSA
//

export async function rsaDecrypt(data: Uint8Array, privateKey: CryptoKey): Promise<Uint8Array> {
  const buffer = await crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    data,
  )

  return new Uint8Array(buffer)
}

export async function rsaEncrypt(data: Uint8Array, keyStr: string): Promise<Uint8Array> {
  const buffer = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    await crypto.subtle.importKey(
      "spki",
      uint8arrays.fromString(keyStr, "base64pad").buffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"],
    ),
    data,
  )

  return new Uint8Array(buffer)
}

export function rsaGenKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: "SHA-256" },
    },
    true,
    ["encrypt", "decrypt"],
  )
}

export function rsaVerify(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): Promise<boolean> {
  const keyStr = uint8arrays.toString(publicKey, "base64pad")
  return rsa.verify(message, signature, keyStr)
}

//
// ED25519
//

export function ed25519Verify(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): Promise<boolean> {
  return Promise.resolve(
    ed25519.verify(publicKey, message, signature),
  )
}

//
// KEYSTORE
//

export function ksClear(): Promise<void> {
  return keystore.clear()
}

export async function ksDecrypt(encrypted: string): Promise<string> {
  const ks = await keystore.get()
  return ks.decrypt(encrypted)
}

export async function ksExchangeKeyPair(): Promise<CryptoKeyPair> {
  const ks = await keystore.get()
  return ks.exchangeKeyPair
}

export async function ksExportSymmKey(name: string): Promise<string> {
  const ks = await keystore.get()
  return ks.exportSymmKey(name)
}

export async function ksGetAlg(): Promise<string> {
  const ks = await keystore.get()
  return ks.cfg.type
}

export async function ksImportSymmKey(key: string, name: string): Promise<void> {
  const ks = await keystore.get()
  return ks.importSymmKey(key, name)
}

export async function ksKeyExists(name: string): Promise<boolean> {
  const ks = await keystore.get()
  return ks.keyExists(name)
}

export async function ksPublicExchangeKey(): Promise<string> {
  const ks = await keystore.get()
  return ks.publicExchangeKey()
}

export async function ksPublicWriteKey(): Promise<string> {
  const ks = await keystore.get()
  return ks.publicWriteKey()
}

export async function ksSign(message: string): Promise<string> {
  const ks = await keystore.get()
  return ks.sign(message, { charSize: 8 })
}

export async function ksWriteKeyPair(): Promise<CryptoKeyPair> {
  const ks = await keystore.get()
  return ks.writeKeyPair
}
