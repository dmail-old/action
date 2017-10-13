import { test } from "../test.js"
import { isAction, createAction } from "../action.js"
import { passed } from "../passed/passed.js"
import { failed } from "../failed/failed.js"
import { composeSequence, composeTogether } from "./compose.js"

test("compose.js", ({ ensure, assert, assertPassed, assertFailed }) => {
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

	ensure("composeSequence complex example", () => {
		let composedAction
		const action = composeSequence([0, 1, 2], (value, { index, action }) => {
			composedAction = action
			if (index === 0) {
				return value
			}
			if (index === 1) {
				return failed(value + 1)
			}
			return passed(value + 1)
		})
		assert(isAction(composedAction))
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
		composeSequence([0, 1], (value, { index }) => {
			callCount++
			return index === 0 ? firstAction : secondAction
		})
		assert.equal(callCount, 1)
		firstAction.pass()
		assert.equal(callCount, 2)
	})

	ensure("composeTogether called concurrently", () => {
		let callCount = 0
		composeTogether([0, 1], () => {
			callCount++
			return createAction()
		})
		assert.equal(callCount, 2)
	})
})
