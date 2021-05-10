import crypto from "crypto"
import * as aes from "keystore-idb/aes/index"
import { SymmKeyLength } from "keystore-idb/types"

// @ts-ignore
globalThis.crypto = crypto.webcrypto


describe("aes", () => {
  it("correctly encrypts & decrypts again", async () => {
    const key = await aes.makeKey({ length: SymmKeyLength.B256 })
    const message = "Hello, World!"
    const cipher = await aes.encrypt(message, key)
    const decipher = await aes.decrypt(cipher, key)
    expect(decipher).toEqual(message)
  })
})