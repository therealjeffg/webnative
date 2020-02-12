interface RegisterChallengeOpts {
  id?: string
  name?: string
  alg?: number
  timeout?: number
}

interface RegisterChallenge {
  challenge: string,
  rp: PublicKeyCredentialRpEntity,
  pubKeyCredParams: PublicKeyCredentialParameters[],
  timeout?: number
  user: {
    id: string
    name: string
    displayName: string
  }
}

type GetChallengeFn = (username: string) => Promise<RegisterChallenge>
