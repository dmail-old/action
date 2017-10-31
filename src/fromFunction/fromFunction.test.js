import { test } from "@dmail/test-cheap"
import { fromFunction } from "./fromFunction.js"
import { assert, assertPassed, assertFailed, assertResult } from "../assertions.js"

test("fromFunction.js", ({ ensure }) => {
	ensure("function returning resolved thenable pass action", () => {
		const value = 1
		const thenable = {
			then: onFulfill => {
				onFulfill(value)
			}
		}
		const action = fromFunction(() => thenable)
		assertPassed(action)
		assertResult(action, value)
	})

	ensure("function returning rejected thenable fails action", () => {
		const value = 1
		const thenable = {
			then: (onFulfill, onReject) => {
				onReject(value)
			}
		}
		const action = fromFunction(() => thenable)
		assertFailed(action)
		assertResult(action, value)
	})

	ensure("function returning a value", () => {
		const value = 1
		const action = fromFunction(() => value)
		assert.equal(action.getState(), "unknown")
	})

	ensure("function throwing", () => {
		const exception = 1
		assert.throws(() =>
			fromFunction(() => {
				throw exception
			})
		)
	})
})
