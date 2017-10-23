import { test } from "@dmail/test-cheap"
import { install } from "lolex"
import { createAction } from "../action.js"
import { withAllocableMs, failureIsOutOfMs } from "./withAllocableMs.js"
import { assert } from "../assertions.js"

test("withAllocableMs.js", ({ ensure }) => {
	const clock = install()
	const createActionWithAllocableMs = () => createAction().mixin(withAllocableMs)

	ensure("an action passed fast enough", () => {
		const actionPassedQuickly = createActionWithAllocableMs()
		actionPassedQuickly.allocateMs(1)
		actionPassedQuickly.pass()
		assert.equal(actionPassedQuickly.getState(), "passed")
	})

	ensure("an action failed fast enough", () => {
		const failedValue = 2
		const actionFailedQuickly = createActionWithAllocableMs()
		actionFailedQuickly.allocateMs(1)
		actionFailedQuickly.fail(failedValue)
		assert.equal(actionFailedQuickly.getState(), "failed")
		assert.equal(actionFailedQuickly.getResult(), failedValue)
	})

	ensure("an action still pending after allocatedMs", () => {
		const tooLongAction = createActionWithAllocableMs()
		assert.equal(tooLongAction.getConsumedMs(), undefined)
		assert.equal(tooLongAction.getRemainingMs(), Infinity)
		assert.equal(tooLongAction.getAllocatedMs(), Infinity)

		tooLongAction.allocateMs(Infinity)
		assert.equal(tooLongAction.getAllocatedMs(), Infinity)

		const allocatedMs = 10
		const consumedMs = 2

		tooLongAction.allocateMs(allocatedMs)
		assert.equal(tooLongAction.getConsumedMs(), 0)
		assert.equal(tooLongAction.getRemainingMs(), allocatedMs)

		clock.tick(consumedMs)
		assert.equal(tooLongAction.getConsumedMs(), consumedMs)
		assert.equal(tooLongAction.getRemainingMs(), allocatedMs - consumedMs)

		clock.tick(allocatedMs - consumedMs)
		assert.equal(tooLongAction.getConsumedMs(), allocatedMs)
		assert.equal(tooLongAction.getState(), "failed")
		assert.equal(tooLongAction.getResult(), `must pass or fail in less than 10ms`)
	})

	ensure("an action call pass too late", () => {
		const action = createActionWithAllocableMs()
		action.allocateMs(10)
		setTimeout(action.pass, 11)
		clock.tick(10)
		assert(failureIsOutOfMs(action.getResult()))
		assert.doesNotThrow(() => clock.tick(1))
	})

	ensure("an action call fail too late", () => {
		const action = createActionWithAllocableMs()
		action.allocateMs(10)
		setTimeout(action.fail, 11)
		clock.tick(10)
		assert(failureIsOutOfMs(action.getResult()))
		assert.doesNotThrow(() => clock.tick(1))
	})

	ensure("allocateMs called with negative ms", () => {
		const action = createActionWithAllocableMs()
		action.allocateMs(-1)
		assert.equal(action.getState(), "failed")
		assert(failureIsOutOfMs(action.getResult()))
	})

	ensure("allocateMs() throw when action is passed", () => {
		const action = createActionWithAllocableMs()
		action.pass()
		assert.throws(() => action.allocateMs(10))
	})

	ensure("allocateMs() throw when action is failed", () => {
		const action = createActionWithAllocableMs()
		action.fail()
		assert.throws(() => action.allocateMs(10))
	})

	ensure("increaseAllocatedMs", () => {
		const clock = install()
		const action = createActionWithAllocableMs()
		action.allocateMs(10)
		clock.tick(5)
		action.increaseAllocatedMs(20)
		assert.equal(action.getAllocatedMs(), 25)
		clock.uninstall()
	})

	ensure("decreaseAllocatedMs", () => {
		const clock = install()
		const action = createActionWithAllocableMs()
		action.allocateMs(30)
		clock.tick(5)
		action.decreaseAllocatedMs(10)
		assert.equal(action.getAllocatedMs(), 15)
		clock.uninstall()
	})

	clock.uninstall()
})
