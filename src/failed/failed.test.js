import { test } from "../test.js"
import { failed } from "./failed.js"

test("failed.js", ({ ensure, assertFailed, assertResult }) => {
	ensure("failed return an action failed with the value", () => {
		const value = 1
		const action = failed(value)
		assertFailed(action)
		assertResult(action, value)
	})
})
