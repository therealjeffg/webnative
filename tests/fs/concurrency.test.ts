import { loadWebnativePage } from "../helpers/page"


describe("FS", () => {
  async function privatePathsCreated(paths) {
    const fs = await webnative.fs.empty({
      localOnly: true,
      permissions: { fs: { private: [{ directory: [] }] } }
    })

    await Promise.all(paths.map(path => fs.write(path, "asdf")))

    return await filesAt(["private"])

    // Helper function. Works similar to unix's tree function
    async function filesAt(path) {
      let paths = []
      for (const [key, elem] of Object.entries(await fs.ls({ directory: path }))) {
        if (elem.isFile) {
          paths.push({ file: [...path, key] })
        } else {
          paths = paths.concat(await filesAt([...path, key]))
        }
      }
      return paths
    }
  }

  it("performs concurrent file additions", async () => {
    await loadWebnativePage()

    const toBeCreated = [
      { file: ["private", "0", "0", "file.txt"] },
      { file: ["private", "0", "1", "file.txt"] },
    ]

    const createdPaths = await page.evaluate(privatePathsCreated, toBeCreated)

    expect(createdPaths).toEqual(toBeCreated)
  })

  it("perform actions concurrently", async () => {
    await loadWebnativePage()

    const string = await page.evaluate(async () => {
      const wn = webnative

      const fs = await wn.fs.empty({
        localOnly: true,
        permissions: {
          fs: { private: [wn.path.root()] }
        }
      })

      const amount = 50

      let paths = []

      for (const i of Array(amount).keys()) {
        const num = `${i + 10}`
        let digits = []
        for (const i of Array(num.length).keys()) {
          digits.push(num.charAt(i))
        }
        paths.push(wn.path.file(wn.path.Branch.Private, ...digits, "file.txt"))
      }

      await Promise.all(paths.map((path, index) => fs.write(path, `${index}`)))

      try {
        const files = await Promise.all(paths.map(path => fs.read(path)))
        return files.join(",")
      } catch (e) {
        async function tree(path) {
          let dir = {}
          for (const [key, elem] of Object.entries(await fs.ls({ directory: path }))) {
            if (elem.isFile) {
              dir[key] = "file"
            } else {
              dir[key] = await tree([...path, key])
            }
          }
          return dir
        }
        throw new Error(`${e.message}.\nTree:\n${JSON.stringify(await tree(["private"]), null, 2)}`)
      }
    })

    const amount = 50

    let contents = []

    for (const i of Array(amount).keys()) {
      contents.push(`${i}`)
    }

    expect(string).toEqual(contents.join(","))
  })

});
