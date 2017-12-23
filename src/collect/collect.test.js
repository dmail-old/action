import { collectSequence, collectSequenceWithAllocatedMs } from "./collect.js"
import { test } from "@dmail/test-cheap"
import { createAction } from "../action.js"
// import { mapIterable } from "../mapIterable.js"
import { assert, assertPassed, assertFailed, assertResult, assertRunning } from "../assertions.js"
import { install } from "lolex"
import { passed } from "../passed/passed.js"
import { failed } from "../failed/failed.js"

test("collect.js", ({ ensure }) => {
	ensure("with action passed after", () => {
		const action = createAction()
		const collectAction = collectSequence([action])
		action.pass()
		assertPassed(collectAction)
	})

	ensure("with values", () => {
		const action = collectSequence([0, 1])
		assertPassed(action)
		assert.deepEqual(action.getResult(), [
			{ state: "passed", result: 0 },
			{ state: "passed", result: 1 },
		])
	})

	ensure("with passed actions", () => {
		const action = collectSequence([passed(0), passed(1)])
		assertPassed(action)
		assert.deepEqual(action.getResult(), [
			{ state: "passed", result: 0 },
			{ state: "passed", result: 1 },
		])
	})

	ensure("with failed actions", () => {
		const action = collectSequence([failed(0), failed(1)])
		assertFailed(action)
		assert.deepEqual(action.getResult(), [
			{ state: "failed", result: 0 },
			{ state: "failed", result: 1 },
		])
	})

	ensure("with a mix of failed and passed actions", () => {
		const action = collectSequence([passed(0), failed(1), passed(2)])
		assert.deepEqual(action.getResult(), [
			{ state: "passed", result: 0 },
			{ state: "failed", result: 1 },
			{ state: "passed", result: 2 },
		])
	})

	ensure("with critical failure", () => {
		const action = collectSequence([failed(0), failed(1), passed(2)], {
			failureIsCritical: (failure) => failure === 1,
		})
		assertFailed(action)
		assertResult(action, 1)
	})

	ensure("action passed in time", () => {
		const clock = install()
		const action = createAction()
		const collectAction = collectSequenceWithAllocatedMs([action], {
			allocatedMs: 10,
		})
		clock.tick(5)
		action.pass("hello")
		assertPassed(collectAction)
		assert.deepEqual(collectAction.getResult(), [{ state: "passed", result: "hello" }])
		clock.tick(10)
	})

	ensure("action taking too long to pass", () => {
		const clock = install()
		const action = createAction()
		const collectAction = collectSequenceWithAllocatedMs([action], {
			allocatedMs: 10,
		})

		clock.tick(2)
		assertRunning(collectAction)
		clock.tick(8)
		assertFailed(collectAction)
		assertResult(collectAction, `must pass or fail in less than 10ms`)

		action.pass()

		clock.uninstall()
	})

	ensure("first action fails in 2ms, next fails in 7ms having 10ms", () => {
		const clock = install()
		const firstAction = createAction()
		const secondAction = createAction()
		const collectAction = collectSequenceWithAllocatedMs([firstAction, secondAction], {
			allocatedMs: 10,
		})
		clock.tick(2)
		firstAction.fail("a")
		clock.tick(7)
		secondAction.fail("b")
		assertFailed(collectAction)
		assert.deepEqual(collectAction.getResult(), [
			{ state: "failed", result: "a" },
			{ state: "failed", result: "b" },
		])
		clock.uninstall()
	})

	ensure("first action passed in 2ms, next pass in 8ms having 10ms", () => {
		const clock = install()
		const firstAction = createAction()
		const secondAction = createAction()
		const collectAction = collectSequenceWithAllocatedMs([firstAction, secondAction], {
			allocatedMs: 10,
		})
		clock.tick(2)
		firstAction.pass("a")
		clock.tick(8)
		secondAction.pass("b")
		assertFailed(collectAction)
		assert.deepEqual(collectAction.getResult(), "must pass or fail in less than 8ms")
		clock.uninstall()
	})

	ensure("allocatedMs is very big dy default (actually it's infinity)", () => {
		const clock = install()
		const collectAction = collectSequenceWithAllocatedMs([createAction()])
		clock.tick(10000000)
		assertRunning(collectAction)
		clock.uninstall()
	})
})
