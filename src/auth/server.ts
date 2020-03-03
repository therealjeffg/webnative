import CBOR from 'cbor-js'
import { fromUint8Array, uint8ArrayToUint16 } from '../utils'

const CRED_ID_START = 55

function verifyCredential(credential: PublicKeyAttestationCredential) {

}

export function decodeCredential(credential: PublicKeyAttestationCredential): DecodedCredential {
  const { rawId, response} = credential;
  const utf8Decoder = new TextDecoder('utf-8');

  const decodedClientData = utf8Decoder.decode(response.clientDataJSON)
  const decodedAttestationObj = CBOR.decode(response.attestationObject);

  const { attStmt, authData } = decodedAttestationObj;
  console.log('attStmt:', attStmt)
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
