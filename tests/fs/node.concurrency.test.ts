import Ipfs, { IPFS } from "ipfs"

import * as ipfsConfig from "../../src/ipfs/config"
import { FileSystem } from "../../src/fs/filesystem"

let ipfs: IPFS;


beforeAll(async done => {
  ipfs = await Ipfs.create({ offline: true, silent: true })
  ipfsConfig.set(ipfs)
  done()
})

afterAll(async done => {
  await ipfs.stop()
  done()
})

describe("the filesystem", () => {
  it("handles concurrent deeply-nested private writes", async () => {
    const fs = await FileSystem.empty({
      localOnly: true,
      permissions: { fs: { private: [{ directory: [] }] } }
    })

    const paths = [
      { file: [ "private", "0", "0", "file.txt" ] },
      { file: [ "private", "0", "1", "file.txt" ] },
    ]

    await Promise.all(paths.map(path => fs.write(path, "asfd")))

    console.log(JSON.stringify(tree(fs, ["private"]), null, 2))

    // Ensure that all files are actually created
  })
})


async function tree(fs: FileSystem, path: string[]) {
  let dir = {}
  for (const [key, elem] of Object.entries(await fs.ls({ directory: path }))) {
    if (elem.isFile) {
      dir[key] = "file"
    } else {
      dir[key] = await tree(fs, [...path, key])
    }
  }
  return dir
}
