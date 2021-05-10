import Ipfs, { IPFS } from "ipfs"

import "../setup-node"

import RootTree from "../../src/fs/root/tree"
import * as path from "../../src/path"
import * as ipfsConfig from "../../src/ipfs"
import * as crypto from '../../src/crypto'
import MMPT from "../../src/fs/protocol/private/mmpt"
import { DecryptedNode, PrivateAddResult } from "../../src/fs/protocol/private/types"
import * as check from "../../src/fs/protocol/private/types/check"
import { basic } from "../../src/fs/protocol"
import * as namefilter from "../../src/fs/protocol/private/namefilter"
import { PrivateFile } from "../../src/fs/v1/PrivateFile"
import PrivateTree from "../../src/fs/v1/PrivateTree"
import * as metadata from '../../src/fs/metadata'


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

async function adverserialAddNode(mmpt: MMPT, node: DecryptedNode, key: string): Promise<PrivateAddResult> {
  const { cid, size } = await basic.putEncryptedFile(node, key)
  const filter = await namefilter.addRevision(node.bareNameFilter, key, node.revision)
  const name = await namefilter.toPrivateName(filter)
  await mmpt.add(name, cid)

  // We adverserially don't add the file's content
  // if (check.isPrivateFileInfo(node)) {
  //   const contentBareFilter = await namefilter.addToBare(node.bareNameFilter, node.key)
  //   const contentFilter = await namefilter.addRevision(contentBareFilter, node.key, node.revision)
  //   const contentName = await namefilter.toPrivateName(contentFilter)
  //   await mmpt.add(contentName, node.content)
  // }

  const [skeleton, isFile] = check.isPrivateFileInfo(node) ? [{}, true] : [node.skeleton, false]
  return { cid, name, key, size, isFile, skeleton }
}


describe("the filsystem", () => {

  it("handles non-corrupt filesystems", async () => {
    const rootKey = await crypto.aes.genKeyStr()
    const tree = await RootTree.empty({ rootKey })

    const filePath = path.file("private", "test.txt")
    const [privatePath, privateTree] = tree.findPrivateTree(filePath)
    const subPath = path.unwrap(filePath).slice(path.unwrap(privatePath).length)
    await privateTree.write(subPath, "lol")
    const file: PrivateFile = await privateTree.read(subPath) as any

    expect(file.content).toEqual("lol")
  })


  it("handles corrupt filesystems", async () => {
    const rootKey = await crypto.aes.genKeyStr()
    const tree = await RootTree.empty({ rootKey })

    const filename = "test.txt"
    const filePath = path.file("private", filename)
    const directoryPath = path.parent(filePath)

    const [privatePath, privateTree] = tree.findPrivateTree(filePath)
    const toPrivateTreePath = (p: path.DistinctivePath) => path.unwrap(p).slice(path.unwrap(privatePath).length)

    await privateTree.write(toPrivateTreePath(filePath), "lol")
    const fileRevision1: PrivateFile = await privateTree.read(toPrivateTreePath(filePath)) as any

    expect(fileRevision1.content).toEqual("lol")

    const directory: PrivateTree = await privateTree.get(toPrivateTreePath(directoryPath)) as any
    const parentNameFilter = directory.header.bareNameFilter
    const key = await crypto.aes.genKeyStr()
    const contentKey = await crypto.aes.genKeyStr()
    const bareNameFilter = await namefilter.addToBare(parentNameFilter, key)
    const privateFileHeader = {
      bareNameFilter,
      key: contentKey,
      revision: 2,
      metadata: metadata.empty(true),
      content: "bafkreifcgpcwakiuvxmhq5zlcvxywryykp2vlciqjoz33sargh3cpdxj6q" // Some random CID
    }
    const privateFileAddResult = await adverserialAddNode(tree.mmpt, privateFileHeader, key)
    directory.updateLink(filename, privateFileAddResult)

    async function readRevision2OrTimeout() {
      return await Promise.race([
        privateTree.read(toPrivateTreePath(filePath)) as Promise<PrivateFile>,
        new Promise((resolve, reject) => setTimeout(() => resolve("timed out"), 1000))
      ])
    }

    expect(await readRevision2OrTimeout()).toEqual("timed out")
  })

})
