import { Authenticator, decodeCredential } from './auth'
import { getChallengeFn } from './auth/mock'

const run = async() => {
  const getChallenge = getChallengeFn({})
  const auth = new Authenticator(getChallenge)
  const cred = await auth.user("dholms")
  console.log('cred:', cred)
  const decoded = decodeCredential(cred)
  console.log('decoded: ', decoded)
}

run()

export const test = true
