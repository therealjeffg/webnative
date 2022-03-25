import keystore from "keystore-idb"
import { RSAKeyStore } from "keystore-idb/rsa"
import { CryptoSystem } from "keystore-idb/types"

//
// ⛰
//

const KEYSTORE_CFG = { type: CryptoSystem.RSA }

//
// 🏷
//

let ks: RSAKeyStore | null = null

//
// 🛠
//

export async function clear(): Promise<void> {
  ks = await get()
  await ks.destroy()
  ks = null
}

export async function create(): Promise<RSAKeyStore> {
  return (await keystore.init(KEYSTORE_CFG)) as RSAKeyStore
}

export async function get(): Promise<RSAKeyStore> {
  if (ks) return ks
  ks = await create()
  return ks
}

export function set(userKeystore: RSAKeyStore): void {
  ks = userKeystore
}
