import { setup } from "../setup/internal.ts"

export function log(...args: unknown[]): void {
  if (setup.debug) console.log(...args)
}

export function warn(...args: unknown[]): void {
  if (setup.debug) console.warn(...args)
}
