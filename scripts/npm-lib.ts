import { build } from "https://deno.land/x/dnt/mod.ts";

const VERSION = Deno.args[ 0 ];
if (!VERSION) throw new Error("Couldn't parse version argument.");

await build({
  entryPoints: [ "./src-new/index.ts" ],
  outDir: "./lib/",
  importMap: "./import-map.json",
  shims: {
    deno: true,
    crypto: true,
  },
  compilerOptions: {
    sourceMap: true,
  },
  test: false, // TODO
  package: {
    name: "webnative",
    version: VERSION,
    description: "The Webnative SDK",
    license: "Apache-2.0",
    homepage: "https://guide.fission.codes",
    repository: {
      type: "git",
      url: "https://github.com/fission-suite/webnative",
    },
    bugs: {
      url: "https://github.com/fission-suite/webnative/issues",
    },
    exports: {
      "./*": {
        "import": "./esm/*",
        "require": "./umd/*",
        "types": "./types/*",
      },
    },
  },
});

Deno.copyFileSync("LICENSE", "lib/LICENSE");
Deno.copyFileSync("README.md", "lib/README.md");
