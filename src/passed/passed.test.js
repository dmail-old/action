import { test } from "../test.js"
import { failed } from "../failed/failed.js"
import { passed } from "./passed.js"

test("passed.js", ({ ensure, assert, assertPassed, assertResult }) => {
	ensure("passed return an action passed with the value", () => {
		const value = 1
		const action = passed(value)
		assertPassed(action)
		assertResult(action, value)
	})

	ensure("passed with failed action", () => {
		const failedAction = failed()
		const action = passed(failedAction)
		assert.equal(action, failedAction)
	})

	ensure("passed with passed action", () => {
		const passedAction = passed()
		const action = passed(passedAction)
		assert.equal(action, passedAction)
	})
})
