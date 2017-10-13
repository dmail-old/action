import { test } from "../test.js"
import { createAction } from "../action.js"
import { failed } from "./failed.js"

test("failed.js", ({ ensure, assertFailed, assertPassed, assertResult }) => {
	ensure("failed return an action failed with the value", () => {
		const value = 1
		const action = failed(value)
		assertFailed(action)
		assertResult(action, value)
	})

	ensure("failed with failed action", () => {
		const failedAction = createAction()
		const value = 1
		failedAction.fail(value)
		const action = failed(failedAction)
		assertFailed(action)
		assertResult(action, value)
	})

	ensure("failed with passed action", () => {
		const passedAction = createAction()
		const value = 1
		passedAction.pass(value)
		const action = failed(passedAction)
		assertPassed(action)
		assertResult(action, value)
	})
})
