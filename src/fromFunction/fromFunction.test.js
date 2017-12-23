import { test } from "@dmail/test-cheap"
import { fromFunction } from "./fromFunction.js"
import { assert, assertPassed, assertFailed, assertResult } from "../assertions.js"

test("fromFunction.js", ({ ensure }) => {
	ensure("function returning resolved thenable pass action", () => {
		const value = 1
		const thenable = {
			then: (onFulfill) => {
				onFulfill(value)
			},
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
			},
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
			}),
		)
	})

	ensure("returning the action itself", () => {
		const action = fromFunction((act) => act)
		action.pass()
		assert.equal(action.getState(), "passed")
	})

	ensure("returning an other passed action", () => {
		const passedWith10 = fromFunction(({ pass }) => pass(10))
		const action = fromFunction(() => passedWith10)
		assert.equal(action.getState(), "passed")
		assert.equal(action.getResult(), 10)
	})

	ensure("returning an other failed action", () => {
		const failedWith10 = fromFunction(({ fail }) => fail(10))
		const action = fromFunction(() => failedWith10)
		assert.equal(action.getState(), "failed")
		assert.equal(action.getResult(), 10)
	})
})
