import cbor from 'borc'
import crypto from "crypto"
import * as aes from "keystore-idb/aes/index"
import { SymmKeyLength } from "keystore-idb/types"
import { NODE_IMPLEMENTATION } from "../setup-node"

// @ts-ignore
globalThis.crypto = crypto.webcrypto


describe("aes", () => {
  it("correctly encrypts & decrypts again", async () => {
    const key = await aes.makeKey({ length: SymmKeyLength.B256 })
    const keyStr = await aes.exportKey(key)

    const message = {
      hello: "world!"
    }
    const encoded: Uint8Array = Uint8Array.from(cbor.encode(message))
    const cipher: Uint8Array = await NODE_IMPLEMENTATION.aes.encrypt(encoded, keyStr)
    const decipher: Uint8Array = await NODE_IMPLEMENTATION.aes.decrypt(cipher, keyStr)
    const decoded = cbor.decode(Buffer.from(decipher))

    expect(decoded).toEqual(message)
  })
})