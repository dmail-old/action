import { test } from "@dmail/test-cheap"
import { failed } from "../failed/failed.js"
import { passed } from "./passed.js"
import { assert, assertPassed, assertResult } from "../assertions.js"

test("passed.js", ({ ensure }) => {
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
