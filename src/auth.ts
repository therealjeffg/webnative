import CBOR from 'cbor-js'
import { toUint8Array, fromUint8Array, uint8ArrayToUint16 } from './utils'

const CRED_ID_START = 55

interface AuthenticatorOptions {
  name: string,
  id: string,
  alg?: number,
  timeout?: number,
}
export interface PublicKeyAttestationCredential extends PublicKeyCredential {
    readonly response: AuthenticatorAttestationResponse;
}

export class Authenticator {
  getChallenge: (username: string) => Promise<RegisterChallenge>
  // opts: AuthenticatorOptions

  constructor(getChallenge: GetChallengeFn){
    this.getChallenge = getChallenge
  }

  async user(username: string) {
    const challenge = await this.getChallenge(username)
    return credentialFromChallenge(challenge)
  }
}

export async function credentialFromChallenge(challenge: RegisterChallenge) {
  const publicKeyCredentialCreationOptions = {
    challenge: toUint8Array(challenge.challenge),
    rp: challenge.rp, 
    pubKeyCredParams: challenge.pubKeyCredParams,
    timeout: challenge.timeout,
    user: {
      id: toUint8Array(challenge.user.id),
      name: challenge.user.name,
      displayName: challenge.user.displayName,
    }
  };

  const cred = await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions
  });
  return cred as PublicKeyAttestationCredential
}

export function decodeCredential(credential: PublicKeyAttestationCredential): DecodedCredential {
  // decode the clientDataJSON into a utf-8 string
  const { rawId, response} = credential;
  const utf8Decoder = new TextDecoder('utf-8');

  const decodedClientData = utf8Decoder.decode(response.clientDataJSON)
  const decodedAttestationObj = CBOR.decode(response.attestationObject);

  const { authData } = decodedAttestationObj;
  const credIdLen = uint8ArrayToUint16(authData.slice(53, CRED_ID_START));

  const publicKeyStart = CRED_ID_START + credIdLen;

  const credentialId = fromUint8Array(authData.slice(CRED_ID_START, publicKeyStart));

  const publicKeyBytes = authData.slice(publicKeyStart);
  const publicKeyObject = CBOR.decode(publicKeyBytes.buffer); 

  return {
    rawId,
    clientData: JSON.parse(decodedClientData),
    credentialId,
    keyInfo: {
      pubkey: fromUint8Array(publicKeyObject[-2]),
      keyType: publicKeyObject[1],
      keyAlg: publicKeyObject[3],
      keyCurve: publicKeyObject[-1],
    }
  }
}
