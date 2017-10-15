import { test } from "@dmail/test-cheap"
import { createAction } from "../action.js"
import { mapFailed } from "./mapFailed.js"
import { assert, assertFailed, assertResult } from "../assertions.js"

test("mapFailed.js", ({ ensure }) => {
	ensure("transforms failure value", () => {
		const action = createAction()
		const value = 1
		const mappedValue = 2
		action.fail(value)
		let callArgs
		const mappedAction = mapFailed(action, (...args) => {
			callArgs = args
			return mappedValue
		})

		assert.deepEqual(callArgs, [value])
		assertFailed(mappedAction)
		assertResult(mappedAction, mappedValue)
	})
})
