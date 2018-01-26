import { createActionTimer } from "./createActionTimer.js"
import { createAction } from "../action.js"
import { test } from "@dmail/test-cheap"
import { install } from "lolex"
import { assert } from "../assertions.js"

test("withAllocableMs.js", ({ ensure }) => {
	const createActionAndTimer = () => {
		const action = createAction()
		const timer = createActionTimer(action)

		return { action, timer }
	}

	ensure("an action passed fast enough", () => {
		const { action, timer } = createActionAndTimer()
		timer.allocateMs(1)
		action.pass()

		assert.equal(action.getState(), "passed")
	})

	ensure("an action failed fast enough", () => {
		const { action, timer } = createActionAndTimer()
		const failedValue = 2
		timer.allocateMs(1)
		action.fail(failedValue)

		assert.equal(action.getState(), "failed")
		assert.equal(action.getResult(), failedValue)
	})

	ensure("an action still pending after allocatedMs", () => {
		const clock = install()

		const { action, timer } = createActionAndTimer()
		const allocatedMs = 10

		timer.allocateMs(allocatedMs)
		clock.tick(allocatedMs + 1)

		assert.equal(action.getState(), "failed")
		assert.equal(action.getResult(), timer)

		clock.uninstall()
	})

	ensure("an action call pass too late", () => {
		const clock = install()

		const { action, timer } = createActionAndTimer()
		timer.allocateMs(10)
		setTimeout(action.pass, 11)
		clock.tick(10)

		assert.equal(action.getResult(), timer)
		assert.doesNotThrow(() => clock.tick(1))

		clock.uninstall()
	})

	ensure("an action call fail too late", () => {
		const clock = install()

		const { action, timer } = createActionAndTimer()
		timer.allocateMs(10)
		setTimeout(action.fail, 11)
		clock.tick(10)

		assert.equal(action.getResult(), timer)
		assert.doesNotThrow(() => clock.tick(1))

		clock.uninstall()
	})

	ensure("allocateMs called with negative ms", () => {
		const { action, timer } = createActionAndTimer()
		timer.allocateMs(-1)

		assert.equal(action.getState(), "failed")
		assert.equal(action.getResult(), timer)
	})

	ensure("allocateMs() throw when action is passed", () => {
		const { action, timer } = createActionAndTimer()
		action.pass()

		assert.throws(() => timer.allocateMs(10))
	})

	ensure("allocateMs() throw when action is failed", () => {
		const { action, timer } = createActionAndTimer()
		action.fail()

		assert.throws(() => timer.allocateMs(10))
	})
})
