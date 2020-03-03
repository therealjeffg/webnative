import { toUint8Array } from '../utils'

export class Authenticator {
  getChallenge: (username: string) => Promise<RegisterChallenge>

  constructor(getChallenge: GetChallengeFn){
    this.getChallenge = getChallenge
  }

  async user(username: string) {
    const challenge = await this.getChallenge(username)
    return credentialFromChallenge(challenge)
  }
}

export async function credentialFromChallenge(challenge: RegisterChallenge) {
  const publicKey = formatCredReq(challenge)
  const cred = await navigator.credentials.create({ publicKey });
  return cred as PublicKeyAttestationCredential
}

export function formatCredReq(challenge: RegisterChallenge) {
  return {
    challenge: toUint8Array(challenge.challenge),
    rp: challenge.rp, 
    pubKeyCredParams: challenge.pubKeyCredParams,
    timeout: challenge.timeout,
    attestation: "indirect" as const,
    user: {
      id: toUint8Array(challenge.user.id),
      name: challenge.user.name,
      displayName: challenge.user.displayName,
    }
  }
}
