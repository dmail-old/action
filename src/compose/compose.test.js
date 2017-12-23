import { createIterator, compose } from "./compose.js"
import { test } from "@dmail/test-cheap"
import assert from "assert"

test("compose.js", ({ ensure }) => {
	ensure("composer must call fail or pass on last iteration", () => {
		assert.throws(() => {
			compose({
				iterator: createIterator([]),
				composer: () => {},
			})
		}, (e) => e.message === "composer must fail or pass when iteration is done")
	})

	ensure("composer calling fail or pass on last iteration", () => {
		const action = compose({
			iterator: createIterator([]),
			composer: ({ pass }) => {
				pass(10)
			},
		})
		assert.equal(action.getResult(), 10)
	})
})
