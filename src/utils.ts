export function toUint8Array(str: string) {
  return Uint8Array.from(str, c => c.charCodeAt(0))
}

export function fromUint8Array(arr: Uint8Array) {
  console.log(Buffer.from(arr))
  return Buffer.from(arr).toString('hex')
}

export default {
  toUint8Array,
  fromUint8Array,
}
