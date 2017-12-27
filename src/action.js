// more or less equivalent to
// http://folktale.origamitower.com/api/v2.0.0/en/folktale.result.html
// http://folktale.origamitower.com/api/v2.0.0/en/folktale.validation.html

import { createFactory, pure, replicate, isProductOf, isComposedOf } from "@dmail/mixin"

export const isThenable = (value) => {
	if (typeof value === "object" || typeof value === "function") {
		return typeof value.then === "function"
	}
	return false
}

export const createAction = createFactory(
	pure,
	({ unwrapThenable = true } = {}) => ({ unwrapThenable }),
	({ unwrapThenable, getComposite, getLastComposite }) => {
		let state = "unknown"
		let result
		let willShortCircuit = false
		let ignoreNext = false

		const isPassing = () => state === "passing"

		const isFailing = () => state === "failing"

		const isPassed = () => state === "passed"

		const isFailed = () => state === "failed"

		const isRunning = () => state === "unknown" || isPassing() || isFailing()

		const isEnded = () => isPassed() || isFailed()

		const pendingHandlers = []

		const runPendingHandlers = () => {
			pendingHandlers.forEach((handler) => handler())
			pendingHandlers.length = 0
		}

		const handleResult = (value, passing) => {
			state = passing ? "passing" : "failing"

			if (isProductOf(createAction, value)) {
				const action = getComposite()
				if (value === action || isComposedOf(action, value)) {
					throw new Error("an action cannot pass/fail with itself")
				}
				value.then((value) => handleResult(value, true), (value) => handleResult(value, false))
			} else if (unwrapThenable && isThenable(value)) {
				value.then((value) => handleResult(value, true), (value) => handleResult(value, false))
			} else {
				state = passing ? "passed" : "failed"
				result = value
				runPendingHandlers()
			}
		}

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
			const nextAction = replicate(getLastComposite())

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

		const getState = () => state

		const getResult = () => result

		const shortcircuit = (fn, value) => {
			willShortCircuit = true
			return fn(value)
		}

		return {
			getState,
			getResult,
			isPassing,
			isFailing,
			isPassed,
			isFailed,
			isRunning,
			isEnded,
			pass,
			fail,
			shortcircuit,
			then,
		}
	},
)

export const isAction = (value) => isProductOf(createAction, value)

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
