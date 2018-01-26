import { test } from "@dmail/test-cheap"
import { fromFunction } from "./fromFunction.js"
import { failed } from "../failed/failed.js"
import { assert } from "../assertions.js"

test("fromFunction.js", ({ ensure }) => {
	ensure("function returning a value", () => {
		const value = 1
		const action = fromFunction(() => value)

		assert.equal(action.getState(), "passed")
		assert.equal(action.getResult(), value)
	})

	ensure("function throwing", () => {
		const exception = 1

		assert.throws(() =>
			fromFunction(() => {
				throw exception
			}),
		)
	})

	ensure("returning an other passed action", () => {
		const passedWith10 = fromFunction(() => 10)
		const action = fromFunction(() => passedWith10)

		assert.equal(action.getState(), "passed")
		assert.equal(action.getResult(), 10)
	})

	ensure("returning an other failed action", () => {
		const failedWith10 = failed(10)
		const action = fromFunction(() => failedWith10)

		assert.equal(action.getState(), "failed")
		assert.equal(action.getResult(), 10)
	})
})
