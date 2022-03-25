import { CryptoSystem } from "keystore-idb/types"
import { Keypair, KeyType } from "ucans/dist/types"
import * as uint8arrays from "uint8arrays"

import { impl } from "./implementation.ts"

/**
 * Use the write key-pair from the keystore
 * to create a key-pair that can be used with UCANs.
 */
export async function ucanKeyPair(): Promise<Keypair> {
  const publicKey = await impl.keystore.publicWriteKey()
  const ksAlg = await impl.keystore.getAlg()

  return {
    publicKey: uint8arrays.fromString(publicKey, "base64pad"),
    keyType: keyTypeFromSystem(ksAlg),
    sign: async (msg: Uint8Array): Promise<Uint8Array> => {
      const msgString = uint8arrays.toString(msg, "utf8")
      // Sign with the private write key:
      // https://github.com/fission-suite/keystore-idb/blob/c1cf7c42a525500b2874e0715f1ff87997337901/src/rsa/keystore.ts#L31
      const signedString = await impl.keystore.sign(msgString)
      return uint8arrays.fromString(signedString, "utf8")
    },
  }
}

/**
 * Translate a `CryptoSystem` from the keystore-idb library
 * to a `KeyType` from the ucans library.
 *
 * @param system The `CryptoSystem` we want to translate
 */
export function keyTypeFromSystem(system: CryptoSystem, curve?: NamedCurve): KeyType {
  switch (system) {
    case "ecc":
      switch (curve) {
        // TODO: Next ucans release
        // case "P-256":
        //   return "p256"
        // case "P-384":
        //   return "p384"
        // case "P-521":
        //   return "p521"
        default:
          if (!curve) throw new Error("Missing `curve` parameter (necessary for `ecc`)")
          throw new Error("Invalid `curve` (not supported by keystore-idb)")
      }

    case "rsa":
      return "rsa"

    default:
      throw new Error("Invalid `CryptoSystem`")
  }
}
