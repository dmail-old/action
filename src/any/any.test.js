import { test } from "../test.js"
import { createAction } from "../action.js"
import { any } from "./any.js"

test("any.js", ({ ensure, assertPassed, assertFailed, assertResult }) => {
	ensure("any with only values", () => {
		const value = "a"
		const secondValue = "b"
		const action = any([value, secondValue])
		assertPassed(action)
		assertResult(action, value)
	})

	ensure("with value mixed with thenable", () => {
		const value = "b"
		const thenable = createAction()
		const action = any([thenable, value])
		assertPassed(action)
		assertResult(action, value)
	})

	ensure("with resolved thenable", () => {
		const value = 1
		const thenable = createAction()
		thenable.pass(value)
		const action = any([thenable])
		assertPassed(action)
		assertResult(action, value)
	})

	ensure("with rejected thenable", () => {
		const value = 1
		const thenable = createAction()
		thenable.fail(value)
		const action = any([thenable])
		assertFailed(action)
		assertResult(action, value)
	})

	ensure("thenable resolved once passed are ignored", () => {
		const value = 1
		const firstAction = createAction()
		const secondAction = createAction()
		const action = any([firstAction, secondAction])

		firstAction.pass(value)
		assertPassed(action)
		assertResult(action, value)
		secondAction.pass()
		assertResult(action, value)
	})

	ensure("thenable rejected once passed are ignored", () => {
		const value = 1
		const firstAction = createAction()
		const secondAction = createAction()
		const action = any([firstAction, secondAction])

		firstAction.pass(value)
		assertPassed(action)
		assertResult(action, value)
		secondAction.fail()
		assertResult(action, value)
	})
})
