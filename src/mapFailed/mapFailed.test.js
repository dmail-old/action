import { test } from "../test.js"
import { createAction } from "../action.js"
import { mapFailed } from "./mapFailed.js"

test("mapFailed.js", ({ ensure, assert, assertFailed, assertResult }) => {
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
