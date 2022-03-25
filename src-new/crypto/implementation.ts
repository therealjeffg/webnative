import * as browser from "./implementation/browser.ts"
import { Implementation } from "./implementation/types.ts"

//
// 🏷
//

export let impl: Implementation = browser.IMPLEMENTATION

//
// 🛠
//

export function set(i: Partial<Implementation>): void {
  impl = { ...impl, ...i }
}
