import { isAction } from "../action.js"
import { fromFunction } from "../fromFunction/fromFunction.js"

export const collect = iterable =>
	fromFunction(({ fail, pass }) => {
		const results = []
		let callCount = 0
		let passedOrFailedCount = 0
		let someHasFailed = false

		const checkEnded = () => {
			passedOrFailedCount++
			if (passedOrFailedCount === callCount) {
				if (someHasFailed) {
					fail(results)
				} else {
					pass(results)
				}
			}
		}
		const compositeOnPassed = (result, index) => {
			results[index] = {
				state: "passed",
				result
			}
			checkEnded()
		}
		const compositeOnFailed = (result, index) => {
			results[index] = {
				state: "failed",
				result
			}
			checkEnded()
		}
		const run = (value, index) => {
			if (isAction(value)) {
				value.then(
					result => compositeOnPassed(result, index),
					result => compositeOnFailed(result, index)
				)
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
		checkEnded()
	})
