import { test } from "@dmail/test-cheap"
import { createAction } from "../action.js"
import { aroundAction } from "./aroundAction.js"
import { assert, assertPassed, assertFailed, assertResult } from "../assertions.js"

test("aroundAction.js", ({ ensure }) => {
	ensure("on passed action", () => {
		let beforeArgs
		const before = (...args) => {
			beforeArgs = args
		}
		let afterArgs
		const after = (...args) => {
			afterArgs = args
		}
		const value = 1
		const action = aroundAction(
			before,
			() => {
				const action = createAction()
				action.pass(value)
				return action
			},
			after
		)

		assert.deepEqual(beforeArgs, [])
		assert.deepEqual(afterArgs, [value, true])
		assertPassed(action)
		assertResult(action, value)
	})

	ensure("on failed action", () => {
		let beforeArgs
		const before = (...args) => {
			beforeArgs = args
		}
		let afterArgs
		const after = (...args) => {
			afterArgs = args
		}
		const value = 1
		const action = aroundAction(
			before,
			() => {
				const action = createAction()
				action.fail(value)
				return action
			},
			after
		)

		assert.deepEqual(beforeArgs, [])
		assert.deepEqual(afterArgs, [value, false])
		assertFailed(action)
		assertResult(action, value)
	})
})
