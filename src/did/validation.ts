import * as uint8arrays from "uint8arrays"

import * as crypto from "../crypto/index.js"
import * as utils from "keystore-idb/lib/utils.js"
import { didToPublicKey } from "./transformers.js"
import { KeyType } from "./types.js"


/**
 * Verify the signature of some data (string, ArrayBuffer or Uint8Array), given a DID.
 */
export async function verifySignedData({ data, did, signature }: {
  data: string
  did: string
  signature: string
}): Promise<boolean> {
  try {
    const { type, publicKey } = didToPublicKey(did)

    const sigBytes = uint8arrays.fromString(signature, "base64pad")
    const dataBytes = utils.normalizeAssumingUtf8(data)
    const keyBytes = uint8arrays.fromString(publicKey, "base64pad")

    switch (type) {

      case KeyType.Edwards:
        return await crypto.ed25519.verify(dataBytes, sigBytes, keyBytes)

      case KeyType.RSA:
        return await crypto.rsa.verify(dataBytes, sigBytes, keyBytes)

      default: return false
    }

  } catch (_) {
    return false

  }
}
