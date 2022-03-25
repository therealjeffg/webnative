# Code organisation

```shell
src/example.ts
# This path implies that the functions exported in this file
# will be available as `webnative.example()`

src/${OTHER}/index.ts
# These exported properties however should be made
# available as: `webnative.other.thing()`

src/internal/*.ts
# Internal modules, not to be exported
```
