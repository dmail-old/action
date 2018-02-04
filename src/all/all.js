import { isAction, createAction } from "../action.js"

export const all = (iterable) => {
	const action = createAction()

	let callCount = 0
	let passedCount = 0
	let failedOrPassed = false
	const results = []

	const compositeOnPassed = (result, index) => {
		results[index] = result
		passedCount++
		if (failedOrPassed === false && passedCount === callCount) {
			failedOrPassed = true
			action.pass(results)
		}
	}

	const compositeOnFailed = (result) => {
		if (failedOrPassed === false) {
			failedOrPassed = true
			action.fail(result)
		}
	}

	const run = (value, index) => {
		if (isAction(value)) {
			value.then((result) => compositeOnPassed(result, index), compositeOnFailed)
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
		action.pass(results)
	}

	return action
}
