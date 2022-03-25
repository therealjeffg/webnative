import { publicKeyToDid } from "ucans/dist/did"
import * as crypto from "../crypto/index.ts"

/**
 * Create a DID based on the exchange key-pair.
 */
export async function exchange(): Promise<string> {
  const pubKeyB64 = await crypto.keystore.publicExchangeKey()
  const ksAlg = await crypto.keystore.getAlg()

  return publicKeyToDid(
    pubKeyB64,
    crypto.keyTypeFromSystem(ksAlg),
  )
}

/**
 * Alias `write` to `ucan`
 */
export { write as ucan }

/**
 * Create a DID based on the write key-pair.
 */
export async function write(): Promise<string> {
  const pubKeyB64 = await crypto.keystore.publicWriteKey()
  const ksAlg = await crypto.keystore.getAlg()

  return publicKeyToDid(
    pubKeyB64,
    crypto.keyTypeFromSystem(ksAlg),
  )
}
