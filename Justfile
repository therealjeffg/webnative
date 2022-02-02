deno-imports 		:= "import-map.json"
deno-opts 			:= "--import-map " + deno-imports + " --unstable"
src							:= "./src-new"


docs:
	rm -rf docs
	mkdir docs
	deno doc --json --unstable --import-map {{deno-imports}} {{src}}/index.ts > docs/webnative.json

install-deps:
	deno cache {{deno-opts}} {{src}}/**/*.ts
	deno cache {{deno-opts}} scripts/*.ts

lint:
	deno lint {{src}}/**/*.ts

repl:
	deno repl {{deno-opts}}

test:
	deno test {{deno-opts}} --doc {{src}}/**/*.ts



# Packaging


bundle:
	mkdir -p lib/dist/
	deno run {{deno-opts}} --allow-all scripts/umd-bundle.ts

lib:
	#!/usr/bin/env bash
	version=$(cat VERSION | xargs)
	rm -rf lib
	mkdir -p lib
	deno run {{deno-opts}} --allow-all scripts/npm-lib.ts $version

package: lib bundle
