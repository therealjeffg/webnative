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

beforeAll(async () => {
  ipfs = await Ipfs.create({ offline: true, silent: true })
  ipfsConfig.set(ipfs)
})

afterAll(async () => {
  await ipfs.stop()
})


describe("the filsystem", () => {
  it("has expected namefilter structure", async () => {
    const rootKey = await crypto.aes.genKeyStr()
    console.log(rootKey)
    const tree = await RootTree.empty({ rootKey })

    const filePath = path.file("private", "test.txt")
    const [privatePath, privateTree] = tree.findPrivateTree(filePath)
    const subPath = path.unwrap(filePath).slice(path.unwrap(privatePath).length)
    await privateTree.write(subPath, "lol")
    const file: PrivateFile = await privateTree.read(subPath) as any

    const rootNameFilter = await namefilter.createBare(rootKey)
    const fileNameFilter = await namefilter.addToBare(rootNameFilter, file.header.key)
    const revisionFilter = await namefilter.addRevision(fileNameFilter, file.header.key, 1)

    expect(fileNameFilter).toEqual(file.header.bareNameFilter)

    const bloomFilter = namefilter.fromHex(fileNameFilter)
    expect(bloomFilter.has(await crypto.hash.sha256Str(file.key))).toEqual(true)

    const cid = await tree.mmpt.get(await namefilter.toPrivateName(revisionFilter))

    expect(cid).toEqual(file.header.content)

    const headerNameFilter = await namefilter.addRevision(fileNameFilter, file.key, 1)
    const headerCID = await tree.mmpt.get(await namefilter.toPrivateName(headerNameFilter))

    expect(headerCID).toEqual(privateTree.header.skeleton["test.txt"].cid)

    expect(file.content).toEqual("lol")
  })

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


  it("falls back on older revisions if newer ones are corrupt", async () => {
    // We initialize a "RootTree", because a "FileSystem"
    // would try to register event listeners on the global object
    // (and therefore couldn't be run in node)
    const rootKey = await crypto.aes.genKeyStr()
    const tree = await RootTree.empty({ rootKey })

    const filename = "test.txt"
    const filePath = path.file("private", filename)
    const directoryPath = path.parent(filePath)

    // We need to reimplement parts of the logic of FileSystem.runOnTree:
    // We look for the private tree that controls the given file path
    const [privatePath, privateTree] = tree.findPrivateTree(filePath)
    const toPrivateTreePath = (p: path.DistinctivePath) => path.unwrap(p).slice(path.unwrap(privatePath).length)

    // We write revision 1 to our file path
    await privateTree.write(toPrivateTreePath(filePath), "lol")
    const fileRevision1: PrivateFile = await privateTree.read(toPrivateTreePath(filePath)) as any

    expect(fileRevision1.content).toEqual("lol")

    // Now we setup the "adverserial" part.
    // This is pretty hard to do, as obviously webnative is built
    // to avoid accidentally corrupting filesystems.
    // We essentially replicate all of the logic for adding another
    // revision of our file into the filesystem, _except_ that we
    // skip adding the actual file's content: Instead, we add refer
    // to some CID that doesn't exist in our ipfs.
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
      // Some random CID. This is a v1 CID of some version of this repo's rollup.config.ts file.
      // Make sure you haven't accidentally added that when running the test
      content: "bafkreic26wmegbdz5ke6eetajcx3efceowy6yxfp6v52id4gs7cszuzehu"
    }
    const privateFileAddResult = await adverserialAddNode(tree.mmpt, privateFileHeader, key)
    directory.updateLink(filename, privateFileAddResult)

    // Now we're set up with a corrupt file system and we can start testing.
    async function readRevision2OrTimeout() {
      return await Promise.race([
        privateTree.read(toPrivateTreePath(filePath)) as Promise<PrivateFile>,
        new Promise((resolve, reject) =>
          setTimeout(() =>
            reject(new Error("timed out: webnative didn't realize that the CID can't be fetched."))
          , 500)
        )
      ])
    }

    await expect(readRevision2OrTimeout())
      .resolves
      .toEqual(fileRevision1)
  })

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