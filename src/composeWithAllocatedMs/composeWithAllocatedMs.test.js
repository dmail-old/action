import { test } from "../test.js"
import { createAction, isAction } from "../action.js"
import {
	composeSequenceWithAllocatedMs,
	composeTogetherWithAllocatedMs
} from "./composeWithAllocatedMs.js"

test("composeWithAllocableMs.js", ({ ensure, assert }) => {
	ensure("by default compositeAction is given infinite ms", () => {
		const action = composeSequenceWithAllocatedMs([0])
		assert.equal(action.getRemainingMs(), Infinity)
	})

	ensure("compositeAction is given the allocatedMs", () => {
		const compositeAction = composeSequenceWithAllocatedMs([0], undefined, 10)
		const compositeActionRemainingMs = compositeAction.getRemainingMs()

		assert.equal(typeof compositeActionRemainingMs, "number")
		assert(compositeActionRemainingMs < 11)
	})

	ensure("each composed action is allocated the compositeAction remainingMs", () => {
		const firstAction = createAction()
		const secondAction = createAction()
		const compositeAction = composeSequenceWithAllocatedMs(
			[firstAction, secondAction],
			undefined,
			10
		)

		const firstActionRemainingMs = firstAction.getRemainingMs()
		assert.equal(typeof firstActionRemainingMs, "number")
		assert(firstActionRemainingMs <= compositeAction.getRemainingMs())

		assert.equal(secondAction.getRemainingMs, undefined) // because first action is running
		firstAction.pass()

		const secondActionRemainingMs = secondAction.getRemainingMs()
		assert.equal(typeof secondActionRemainingMs, "number")
		assert(secondActionRemainingMs <= compositeAction.getRemainingMs())
	})

	ensure("handle always receive an action as first arg", () => {
		const action = createAction()
		const calls = []
		const iterable = [1, action]
		composeTogetherWithAllocatedMs(iterable, (...args) => {
			calls.push(args)
		})
		assert.equal(calls.length, 2)

		assert(isAction(calls[0][0]))
		assert.equal(calls[0][1], 1)
		assert.equal(calls[0][2], 0)
		assert.equal(calls[0][3], iterable)
		assert.equal(calls[1].length, 4)

		assert.equal(calls[1][0], action)
		assert.equal(calls[1][1], action)
		assert.equal(calls[1][2], 1)
		assert.equal(calls[1][3], iterable)
		assert.equal(calls[1].length, 4)
	})
})
