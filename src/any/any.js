import { isAction, createAction } from "../action.js"

export const any = (iterable) => {
	const action = createAction()

	let running = true
	let someHasFailed = false
	let lastFailure
	let count = 0
	let endedCount = 0
	const compositePass = (value) => {
		endedCount++
		if (running) {
			running = false
			action.pass(value)
		}
	}

	const compositeFail = (value) => {
		endedCount++
		if (running) {
			lastFailure = value
			someHasFailed = true
			if (endedCount === count) {
				running = false
				action.fail(lastFailure)
			}
		}
	}

	for (const value of iterable) {
		if (isAction(value)) {
			value.then(compositePass, compositeFail)
		} else {
			compositePass(value)
		}

		if (running === false) {
			break
		}
		count++
	}

	if (endedCount === count && running && someHasFailed) {
		running = false
		action.fail(lastFailure)
	}

	return action
}
