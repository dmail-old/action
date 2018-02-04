// more or less equivalent to
// http://folktale.origamitower.com/api/v2.0.0/en/folktale.result.html
// http://folktale.origamitower.com/api/v2.0.0/en/folktale.validation.html

import { mixin, pure, replicate, hasTalent, isComposedOf, hasTalentOf } from "@dmail/mixin"

const actionTalent = ({ self: action }) => {
	let state = "unknown"

	const getState = () => state

	const isPassing = () => state === "passing"

	const isFailing = () => state === "failing"

	const isPassed = () => state === "passed"

	const isFailed = () => state === "failed"

	const isRunning = () => state === "unknown" || isPassing() || isFailing()

	const isEnded = () => isPassed() || isFailed()

	let result
	const getResult = () => result

	const pendingHandlers = []
	const runPendingHandlers = () => {
		pendingHandlers.forEach((handler) => handler())
		pendingHandlers.length = 0
	}

	const handleResult = (value, passing) => {
		state = passing ? "passing" : "failing"

		if (hasTalentOf(action, value)) {
			if (value === action) {
				throw new Error("an action cannot pass/fail with itself")
			}
			if (isComposedOf(action, value)) {
				throw new Error("an action cannot pass/fail with a composite of itself")
			}
			value.then((value) => handleResult(value, true), (value) => handleResult(value, false))
		} else {
			state = passing ? "passed" : "failed"
			result = value
			runPendingHandlers()
		}
	}

	let willShortCircuit = false
	const shortcircuit = (fn, value) => {
		willShortCircuit = true
		return fn(value)
	}

	let ignoreNext = false
	const fail = (value) => {
		if (ignoreNext) {
			ignoreNext = false
			return
		}
		if (willShortCircuit) {
			ignoreNext = true
			willShortCircuit = false
		}
		if (isFailed() || isFailing()) {
			throw new Error(`fail must be called once, it was already called with ${result}`)
		}
		if (isPassed()) {
			throw new Error(`fail must not be called after pass was called`)
		}
		handleResult(value, false)
	}

	const pass = (value) => {
		if (ignoreNext) {
			ignoreNext = false
			return
		}
		if (willShortCircuit) {
			ignoreNext = true
			willShortCircuit = false
		}
		if (isPassing() || isPassed()) {
			throw new Error(`pass must be called once, it was already called with ${result}`)
		}
		if (isFailed()) {
			throw new Error(`pass must not be called after fail was called`)
		}
		handleResult(value, true)
	}

	const then = (onPassed, onFailed) => {
		const nextAction = replicate(action)

		const nextActionHandler = () => {
			let nextActionResult = result

			if (isFailed()) {
				if (onFailed) {
					nextActionResult = onFailed(result)
				}
				nextAction.fail(nextActionResult)
			} else {
				if (onPassed) {
					nextActionResult = onPassed(result)
				}
				nextAction.pass(nextActionResult)
			}
		}

		if (isRunning()) {
			pendingHandlers.push(nextActionHandler)
		} else {
			nextActionHandler()
		}

		return nextAction
	}

	return {
		getState,
		isPassing,
		isFailing,
		isPassed,
		isFailed,
		isRunning,
		isEnded,
		getResult,
		pass,
		fail,
		shortcircuit,
		then,
	}
}

export const createAction = () => mixin(pure, actionTalent)

export const isAction = (value) => hasTalent(actionTalent, value)

// passed("foo").then(console.log)

// const fs = require("fs")
// const path = require("path")

// const readFile = path =>
// 	createAction(({ pass }) =>
// 		fs.readFile(path, (error, buffer) => {
// 			if (error) {
// 				throw error
// 			}
// 			pass(buffer)
// 		})
// 	)
// const readFileAsString = path => readFile(path).chain(String)
// readFileAsString(path.resolve(__dirname, "./test.js")).then(console.log)
