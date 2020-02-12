import { Authenticator } from './auth'
import { getChallengeFn } from './auth/mock'

const run = async() => {
  const getChallenge = getChallengeFn({})
  const auth = new Authenticator(getChallenge)
  const cred = await auth.user("dholms")
  console.log(cred)
}

run()

export const test = true
