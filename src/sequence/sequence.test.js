import { test } from "@dmail/test-cheap"
import { createAction } from "../action.js"
import { sequence } from "./sequence.js"
import { assert, assertPassed, assertFailed, assertResult } from "../assertions.js"

test("sequence.js", ({ ensure }) => {
	ensure("with only values", () => {
		const firstValue = "foo"
		const secondValue = "bar"
		const action = sequence([firstValue, secondValue])
		assertPassed(action)
		assert.deepEqual(action.getResult(), [firstValue, secondValue])
	})

	ensure("with value mixed with thenable", () => {
		const firstValue = "foo"
		const secondValue = "bar"
		const secondValueInAction = createAction()
		const action = sequence([firstValue, secondValueInAction])
		secondValueInAction.pass(secondValue)
		assertPassed(action)
		assert.deepEqual(action.getResult(), [firstValue, secondValue])
	})

	ensure("first fail fails everything", () => {
		const firstAction = createAction()
		const secondAction = createAction()
		const value = 1
		const action = sequence([firstAction, secondAction])
		firstAction.fail(value)

		assertFailed(action)
		assertResult(action, value)
	})

	ensure("second argument is used to dynamically create action/value", () => {
		const value = 1
		const action = sequence([value], v => v + 1)

		assertPassed(action)
		assertResult(action, value + 1)
	})
})
