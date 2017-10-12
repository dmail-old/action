import { test } from "../test.js"
import { createAction } from "../action.js"
import { all } from "./all.js"

test("all.js", ({ ensure, assert, assertPassed, assertFailed, assertResult }) => {
	ensure("all with only values", () => {
		const firstValue = "foo"
		const secondValue = "bar"
		const action = all([firstValue, secondValue])
		assertPassed(action)
		assert.deepEqual(action.getResult(), [firstValue, secondValue])
	})

	ensure("all with value mixed with thenable", () => {
		const firstValue = "foo"
		const secondValue = "bar"
		const secondValueInAction = createAction()
		const action = all([firstValue, secondValueInAction])
		secondValueInAction.pass(secondValue)
		assertPassed(action)
		assert.deepEqual(action.getResult(), [firstValue, secondValue])
	})

	ensure("action passed/failed after fail are ignored", () => {
		const firstAction = createAction()
		const secondAction = createAction()
		const thirdAction = createAction()
		const action = all([firstAction, secondAction, thirdAction])
		const firstValue = 1
		const secondValue = 2
		const thirdValue = 3

		firstAction.fail(firstValue)
		secondAction.pass(secondValue)
		thirdAction.fail(thirdValue)

		assertFailed(action)
		assertResult(action, firstValue)
	})
})
