import CBOR from 'cbor-js'
import { toUint8Array, fromUint8Array } from './utils'

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

  return navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions
  });
}

export function decodeCredential(credential: PublicKeyAttestationCredential) {
  // decode the clientDataJSON into a utf-8 string
  const utf8Decoder = new TextDecoder('utf-8');
  const decodedClientData = utf8Decoder.decode(credential.response.clientDataJSON)

  // parse the string as an object
  const clientDataObj = JSON.parse(decodedClientData);
  console.log("client data: ", clientDataObj)

  const decodedAttestationObj = CBOR.decode(credential.response.attestationObject);
  console.log(decodedAttestationObj);

  const { authData } = decodedAttestationObj
  const dataView = new DataView( new ArrayBuffer(2));

  const idLenBytes = authData.slice(53, 55);
  idLenBytes.forEach(
      (value: any, index:any) => dataView.setUint8(
          index, value));

  const credentialIdLength = dataView.getUint16(0);

  // get the credential ID
  const credentialId = authData.slice(55, 55 + credentialIdLength);
  console.log("credential id: ", credentialId)

  // get the public key object
  const publicKeyBytes = authData.slice(
      55 + credentialIdLength);

  // the publicKeyBytes are encoded again as CBOR
  const publicKeyObject = CBOR.decode(
      publicKeyBytes.buffer);

  console.log(publicKeyObject)
  console.log("PUBLIC KEY: ", fromUint8Array(publicKeyObject[-2]))

}
