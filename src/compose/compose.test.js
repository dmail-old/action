import { test } from "@dmail/test-cheap"
import { createAction } from "../action.js"
import { passed } from "../passed/passed.js"
import { failed } from "../failed/failed.js"
import { composeSequence, composeTogether } from "./compose.js"
import { assert, assertPassed, assertFailed, assertResult } from "../assertions.js"

test("compose.js", ({ ensure }) => {
	ensure("composeSequence with values", () => {
		const action = composeSequence([0, 1])
		assertPassed(action)
		assert.deepEqual(action.getResult(), [
			{ state: "passed", result: 0 },
			{ state: "passed", result: 1 }
		])
	})

	ensure("composeSequence collect passed action", () => {
		const action = composeSequence([passed(0), passed(1)])
		assertPassed(action)
		assert.deepEqual(action.getResult(), [
			{ state: "passed", result: 0 },
			{ state: "passed", result: 1 }
		])
	})

	ensure("composeSequence collect failed action", () => {
		const action = composeSequence([failed(0), failed(1)])
		assertFailed(action)
		assert.deepEqual(action.getResult(), [
			{ state: "failed", result: 0 },
			{ state: "failed", result: 1 }
		])
	})

	ensure("composeSequence with critical failure", () => {
		const action = composeSequence([failed(0), failed(1), passed(2)], {
			failureIsCritical: failure => failure === 1
		})
		assertFailed(action)
		assertResult(action, 1)
	})

	ensure("composeSequence complex example", () => {
		const action = composeSequence([0, 1, 2], {
			handle: (action, value, index) => {
				if (index === 0) {
					return passed(value)
				}
				if (index === 1) {
					return failed(value + 1)
				}
				return passed(value + 1)
			}
		})
		assert.deepEqual(action.getResult(), [
			{ state: "passed", result: 0 },
			{ state: "failed", result: 2 },
			{ state: "passed", result: 3 }
		])
	})

	ensure("composeSequence called in serie", () => {
		const firstAction = createAction()
		const secondAction = createAction()
		let callCount = 0
		composeSequence([firstAction, secondAction], {
			handle: action => {
				callCount++
				return action
			}
		})
		assert.equal(callCount, 1)
		firstAction.pass()
		assert.equal(callCount, 2)
	})

	ensure("composeTogether called concurrently", () => {
		let callCount = 0
		composeTogether([0, 1], {
			handle: () => {
				callCount++
				return createAction()
			}
		})
		assert.equal(callCount, 2)
	})
})
