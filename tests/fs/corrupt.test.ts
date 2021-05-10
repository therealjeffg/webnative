import Ipfs, { IPFS } from "ipfs"

import "../setup-node"

import RootTree from "../../src/fs/root/tree"
import * as path from "../../src/path"
import * as ipfsConfig from "../../src/ipfs"
import * as crypto from '../../src/crypto'


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

describe("the filsystem", () => {

  it("handles corrupt filesystems", async () => {
    const rootKey = await crypto.aes.genKeyStr()
    const tree = await RootTree.empty({ rootKey })

    const filePath = path.file("private", "test.txt")
    const [privatePath, privateTree] = tree.findPrivateTree(filePath)
    const subPath = path.unwrap(filePath).slice(path.unwrap(privatePath).length)
    await privateTree.write(subPath, "lol")
    const content = await privateTree.read(subPath)

    expect(content).toEqual("lol")
  })
})