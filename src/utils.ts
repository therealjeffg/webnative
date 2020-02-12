export function toUint8Array(str: string) {
  return Uint8Array.from(str, c => c.charCodeAt(0))
}

export function fromUint8Array(arr: Uint8Array) {
  return Buffer.from(arr).toString('hex')
}

export function uint8ArrayToUint16(arr: Uint8Array): number {
  const dataView = new DataView(new ArrayBuffer(2));
  arr.forEach((value: number, index: number) => dataView.setUint8(index, value));
  return dataView.getUint16(0);
}

export default {
  toUint8Array,
  fromUint8Array,
  uint8ArrayToUint16,
}
