import expect from "expect"
import * as fc from "fast-check"
import { fromBytes, toBytes } from "./hex.js"

describe("hex", () => {

  it("round trips to bytes and back out", () => {
    fc.assert(
      fc.property(fc.array(fc.integer(16, 255)), data => {
        const hexData = []
        const buffers = []
        const returnData = []

        for (const num of data) {
          hexData.push(num.toString(16))
        }

        for (const hex of hexData) {
          buffers.push(toBytes(hex))
        }

        for (const buffer of buffers) {
          returnData.push(fromBytes(buffer))
        }

        expect(returnData).toEqual(hexData)
      })
    )
  })

})