import { test } from "../test.js"
import { fromFunction } from "./fromFunction.js"

test("fromFunction.js", ({ ensure, assertPassed, assertFailed, assertResult }) => {
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
})
