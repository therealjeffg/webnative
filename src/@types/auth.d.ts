type GetChallengeFn = (username: string) => Promise<RegisterChallenge>
interface RegisterChallengeOpts {
  id?: string
  name?: string
  alg?: number
  timeout?: number
}

interface RegisterChallenge {
  challenge: string
  rp: PublicKeyCredentialRpEntity
  pubKeyCredParams: PublicKeyCredentialParameters[]
  timeout?: number
  user: {
    id: string
    name: string
    displayName: string
  }
}

interface DecodedCredential {
  rawId: ArrayBuffer
  clientData: ClientData
  credentialId: string
  keyInfo: KeyInfo
}

interface ClientData {
  challenge: string
  origin: string
  type: string
}

interface KeyInfo {
  pubkey: string
  keyType: number
  keyAlg: number
  keyCurve: number
}
