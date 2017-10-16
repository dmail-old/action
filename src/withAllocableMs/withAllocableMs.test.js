import { test } from "@dmail/test-cheap"
import { createAction } from "../action.js"
import { withAllocableMs } from "./withAllocableMs.js"
import { assert } from "../assertions.js"

test("withAllocableMs.js", ({ waitUntil }) => {
	const done = waitUntil()
	const createActionWithAllocableMs = () => createAction().mixin(withAllocableMs)

	const actionPassedQuickly = createActionWithAllocableMs()
	actionPassedQuickly.allocateMs(1)
	actionPassedQuickly.pass()
	assert.equal(actionPassedQuickly.getState(), "passed")

	const failedValue = 2
	const actionFailedQuickly = createActionWithAllocableMs()
	actionFailedQuickly.allocateMs(1)
	actionFailedQuickly.fail(failedValue)
	assert.equal(actionFailedQuickly.getState(), "failed")
	assert.equal(actionFailedQuickly.getResult(), failedValue)

	const tooLongAction = createActionWithAllocableMs()
	assert.equal(tooLongAction.getConsumedMs(), undefined)
	assert.equal(tooLongAction.getRemainingMs(), Infinity)
	assert.equal(tooLongAction.getAllocatedMs(), Infinity)

	tooLongAction.allocateMs(Infinity)
	assert.equal(tooLongAction.getAllocatedMs(), Infinity)
	tooLongAction.allocateMs(-1)
	assert.equal(tooLongAction.getAllocatedMs(), Infinity)
	tooLongAction.allocateMs(-2)
	assert.equal(tooLongAction.getAllocatedMs(), Infinity)

	tooLongAction.allocateMs(10)
	assert(tooLongAction.getConsumedMs() <= 5)
	assert(tooLongAction.getRemainingMs() >= 10)

	setTimeout(() => {
		assert(tooLongAction.getConsumedMs() > 0)
		assert.equal(tooLongAction.getState(), "failed")
		assert.equal(tooLongAction.getResult(), `must pass or fail in less than 10ms`)
		done()
	}, 50)
})
