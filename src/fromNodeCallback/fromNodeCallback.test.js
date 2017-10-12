import { test } from "../test.js"
import { fromNodeCallback } from "./fromNodeCallback.js"

test("fromNodeCallback.js", ({ ensure, assert, assertPassed, assertResult }) => {
	const nodeCallbackError = (error, callback) => callback(error)
	const nodeCallbackSuccess = (value, callback) => callback(null, value)

	ensure("when callback is sucessfull", () => {
		const value = 1
		const action = fromNodeCallback(nodeCallbackSuccess)(value)
		assertPassed(action)
		assertResult(action, value)
	})

	ensure("when callback is errored", () => {
		const exception = 1
		assert.throws(
			() => fromNodeCallback(nodeCallbackError)(exception),
			error => error === exception
		)
	})
})
