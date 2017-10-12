import { test } from "../test.js"
import { passed } from "./passed.js"

test("passed.js", ({ ensure, assertPassed, assertResult }) => {
	ensure("passed return an action passed with the value", () => {
		const value = 1
		const action = passed(value)
		assertPassed(action)
		assertResult(action, value)
	})
})
