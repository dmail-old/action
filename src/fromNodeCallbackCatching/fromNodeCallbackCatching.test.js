import { test } from "../test.js"
import { fromNodeCallbackCatching } from "./fromNodeCallbackCatching.js"

test("fromNodeCallbackCatching.js", ({ ensure, assert, assertPassed, assertResult }) => {
	const nodeCallbackError = (error, callback) => callback(error)
	const nodeCallbackSuccess = (value, callback) => callback(null, value)

	ensure("when callback is sucessfull", () => {
		const value = 1
		const action = fromNodeCallbackCatching(nodeCallbackSuccess)(value)
		assertPassed(action)
		assertResult(action, value)
	})

	ensure("when callback is errored and catched", () => {
		const exception = 1
		const recoverValue = 2
		const action = fromNodeCallbackCatching(nodeCallbackError, e => e === exception, recoverValue)(
			exception
		)
		assertPassed(action)
		assertResult(action, recoverValue)
	})

	ensure("when callback is errored and not catched", () => {
		const exception = 1
		assert.throws(
			() => fromNodeCallbackCatching(nodeCallbackError, () => false)(exception),
			error => error === exception
		)
	})
})

// import assert from "assert"
// import { fromNodeCallbackRecoveringWhen } from "./fromNodeCallbackRecoveringWhen.js"

// console.log("fromNodeCallbackRecoveringWhen with recovered errored callback")

// const action = fromNodeCallbackRecoveringWhen(
// 	nodeCallbackError,
// 	error => error === recoveredException,
// 	recoverValue
// )(recoveredException)
// assertPassed(action)
// assertResult(action, recoverValue)
