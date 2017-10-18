import { test } from "@dmail/test-cheap"
import { createAction } from "../action.js"
// import { passed } from "../passed/passed.js"
// import { failed } from "../failed/failed.js"
import { reduce } from "./reduce.js"
import { assert, assertPassed, assertResult, assertRunning, assertFailed } from "../assertions.js"

test("reduce.js", ({ ensure }) => {
	ensure("throw when called without initialValue on empty iterable", () => {
		assert.throws(() => {
			reduce([], () => {})
		})
	})

	ensure("called on a medium sized iterable", () => {
		const action = reduce([0, 1, 2, 3, 4, 5], (accumulator, value) => accumulator + value)
		assertPassed(action)
		assertResult(action, 15)
	})

	ensure("pass to initialValue when called on empty iterable", () => {
		const value = 1
		const action = reduce([], () => {}, value)
		assertPassed(action)
		assertResult(action, value)
	})

	ensure("return first iterable value when no initialValue", () => {
		const action = reduce([0], () => {})
		assertPassed(action)
		assertResult(action, 0)
	})

	ensure("calls reducer with first & second iterable value when no initialValue", () => {
		let calledWith
		const firstValue = "a"
		const secondValue = "b"
		const iterable = [firstValue, secondValue]
		reduce(iterable, (...args) => {
			calledWith = args
		})
		assert.equal(calledWith.length, 4)
		assert.equal(calledWith[0], firstValue)
		assert.equal(calledWith[1], secondValue)
		assert.equal(calledWith[2], 1)
		assert.equal(calledWith[3], iterable)
	})

	ensure("calls reducer with initialValue and first iterable value when initialValue", () => {
		let calledWith
		const firstValue = "a"
		const initialValue = "b"
		const iterable = [firstValue]
		reduce(
			iterable,
			(...args) => {
				calledWith = args
			},
			initialValue
		)
		assert.equal(calledWith[0], initialValue)
		assert.equal(calledWith[1], firstValue)
		assert.equal(calledWith[2], 0)
	})

	ensure("initialValue can be an action", () => {
		const initialAction = createAction()
		const action = reduce([0], () => {}, initialAction)

		assertRunning(action)
		initialAction.pass()
		assertPassed(action)
		assertResult(action, undefined)
	})

	ensure("reducer can return action and is called with previous action result", () => {
		const firstAction = createAction()
		const firstValue = 1
		const secondAction = createAction()
		const secondValue = 2
		firstAction.pass(firstValue)
		const action = reduce([firstAction, secondAction], (accumulator, value) => {
			assert.equal(accumulator, firstValue)
			assert.equal(value, secondAction)
			return secondAction
		})
		assertRunning(action)
		secondAction.pass(secondValue)
		assertPassed(action)
		assertResult(action, secondValue)
	})

	ensure("when initialValue fails, action fails", () => {
		const failedAction = createAction()
		const value = 1
		failedAction.fail(value)
		const action = reduce([], () => {}, failedAction)
		assertFailed(action)
		assertResult(action, value)
	})

	ensure("when reducer returns a failed action, reduced action fails", () => {
		const value = 1
		const action = reduce([0, 1], () => {
			const failedAction = createAction()
			failedAction.fail(value)
			return failedAction
		})
		assertFailed(action)
		assertResult(action, value)
	})
})
