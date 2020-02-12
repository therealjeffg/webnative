// import crypto from 'crypto'

const EDDSA_ALG = -8

function randomBase64(len = 32){
  return "asdfoiu"
  // if(crypto && crypto.randomBytes){
  //   return crypto.randomBytes(len).toString('base64')
  // }else{
  //   return "asodfiu"
  // }
}

export function getChallengeFn(opts: RegisterChallengeOpts): GetChallengeFn {
  return (username: string) => {
    return Promise.resolve({
      challenge: randomBase64(32),
      rp: {
        id: opts.id || 'localhost',
        name: opts.name || 'Fission'
      },
      pubKeyCredParams: [{
        alg: opts.alg || EDDSA_ALG,
        type: "public-key" as const
      }],
      timeout: opts.timeout,
      user: {
        id: "testuserid",
        name: username,
        displayName: username
      }
    })
  }
}

export default {
  getChallengeFn
}
