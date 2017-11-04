import { any } from "./any.js"
import { test } from "@dmail/test-cheap"
import { createAction } from "../action.js"
import { passed } from "../passed/passed.js"
import { failed } from "../failed/failed.js"
import { assertPassed, assertFailed, assertResult } from "../assertions.js"

test("any.js", ({ ensure }) => {
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

	ensure("fails with last failure", () => {
		const action = any([failed(0), failed(1), failed(2)])
		assertFailed(action)
		assertResult(action, 2)
	})

	ensure("pass even if passed surrounded by failure", () => {
		const action = any([failed(0), passed(1), failed(2)])
		assertPassed(action)
		assertResult(action, 1)
	})

	ensure("multiple disordonned failure", () => {
		const first = createAction()
		const second = createAction()
		const action = any([first, second])
		second.fail(0)
		first.fail(1)
		assertFailed(action)
		assertResult(action, 1)
	})
})
