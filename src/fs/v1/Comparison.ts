import { CID } from '../../ipfs'


// TYPES


export type Comparison =
  | InSync
  | AheadOfRemote
  | BehindRemote
  | DivergedAt CID


export enum State = {
  InSync = "IN_SYNC",
  AheadOfRemote = "AHEAD_OF_REMOTE",
  BehindRemote = "BEHIND_REMOTE",
  DivergedAt = "DIVERGED_AT"
}


export type InSync = { state: State.InSync }
export type AheadOfRemote = { state: State.AheadOfRemote }
export type BehindRemote = { state: State.BehindRemote }
export type DivergedAt = { state: State.DivergedAt, cid: CID }


export const inSync = { state: State.InSync }
export const aheadOfRemote = { state: State.AheadOfRemote }
export const behindRemote = { state: State.BehindRemote }
export const divergedAt = cid => { state: State.DivergedAt, cid }
