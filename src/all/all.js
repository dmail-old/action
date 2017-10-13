import { isAction } from "../action.js"
import { fromFunction } from "../fromFunction/fromFunction.js"

export const all = iterable =>
	fromFunction(({ fail, pass }) => {
		let callCount = 0
		let passedCount = 0
		let failedOrPassed = false
		const results = []

		const compositeOnPassed = (result, index) => {
			results[index] = result
			passedCount++
			if (failedOrPassed === false && passedCount === callCount) {
				failedOrPassed = true
				pass(results)
			}
		}
		const compositeOnFailed = result => {
			if (failedOrPassed === false) {
				failedOrPassed = true
				fail(result)
			}
		}
		const run = (value, index) => {
			if (isAction(value)) {
				value.then(result => compositeOnPassed(result, index), compositeOnFailed)
			} else {
				compositeOnPassed(value, index)
			}
		}

		let index = 0
		for (const value of iterable) {
			run(value, index)
			callCount++
			index++
		}

		if (passedCount === callCount) {
			pass(results)
		}
	})
