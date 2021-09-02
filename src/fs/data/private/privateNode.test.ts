import expect from "expect"
import * as fc from "fast-check"
import * as uint8arrays from "uint8arrays"

import * as privateNode from "./privateNode.js"
import * as namefilter from "./namefilter.js"


function createMemoryPrivateStore(): privateNode.PrivateStore {
  const memoryMap = new Map<string, Uint8Array>()
  const keyForRef = (ref: privateNode.PrivateRef) => uint8arrays.toString(ref.namefilter, "base64url")
  return {

    async getBlock(ref) {
      // No need to decrypt if you never encrypt <insert tapping head meme>
      const key = keyForRef(ref)
      console.log(`Accessing ${key}`)
      return memoryMap.get(key) || null
    },

    async putBlock(ref, block) {
      // Don't encrypt
      const key = keyForRef(ref)
      console.log(`writing to ${key}`)
      memoryMap.set(key, block)
    }

  }
}

describe("the private node module", () => {

  it("", async () => {
    const store = createMemoryPrivateStore()
    const ctx = { ...store, now: 0 }

    const path: [string, ...string[]] = ["Apps", "Flatmate", "state.json"]
    const content = new TextEncoder().encode(JSON.stringify({
      hello: "World!"
    }))

    let directory = await privateNode.newDirectory(namefilter.empty(), ctx)
    directory = await privateNode.write(path, content, directory, ctx)
    
    const ref = await privateNode.storeNode(directory, ctx)
    const reconstructed = await privateNode.loadNode(ref, ctx) as privateNode.PrivateDirectory
    
    const contentRead = await privateNode.read(path, reconstructed, ctx)
    expect(contentRead).toEqual(content)
  })
})
