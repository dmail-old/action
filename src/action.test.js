import { createAction } from "./action.js"
import { test } from "@dmail/test-cheap"
import { assert, assertPassed, assertFailed, assertResult } from "./assertions.js"

test("action.js", ({ ensure }) => {
	ensure("pass(itself) throw", () => {
		const action = createAction()

		assert.throws(() => {
			action.pass(action)
		})
	})

	ensure("pass(compositeOfItSelf)", () => {
		const action = createAction()
		const otherAction = Object.create(action)

		assert.throws(() => {
			action.pass(otherAction)
		})
	})

	ensure("fail(itself) throw", () => {
		const action = createAction()

		assert.throws(() => {
			action.fail(action)
		})
	})

	ensure("fail(compositeOfItself)", () => {
		const action = createAction()
		const otherAction = Object.create(action)

		assert.throws(() => {
			action.fail(otherAction)
		})
	})

	ensure("pass throw when called more than once", () => {
		const action = createAction()
		action.pass()

		assert.throws(() => {
			action.pass()
		})
	})

	ensure("shortcircuit(pass) prevent next pass throw", () => {
		const action = createAction()
		action.shortcircuit(action.pass, "foo")

		assertPassed(action)
		assertResult(action, "foo")
		assert.doesNotThrow(action.pass)
		assert.throws(action.pass)
		assert.throws(action.fail)
		assertResult(action, "foo")
	})

	ensure("shortcircuit(fail) prevent next fail throw", () => {
		const action = createAction()
		action.shortcircuit(action.fail, "foo")

		assertFailed(action)
		assertResult(action, "foo")
		assert.doesNotThrow(action.fail)
		assert.throws(action.pass)
		assert.throws(action.fail)
		assertResult(action, "foo")
	})

	ensure("shortcircuit(pass) prevent next fail throw", () => {
		const action = createAction()
		action.shortcircuit(action.pass)

		assert.doesNotThrow(action.fail)
		assert.throws(action.pass)
		assert.throws(action.fail)
	})

	ensure("shortcircuit(fail) prevent next pass throw", () => {
		const action = createAction()
		action.shortcircuit(action.fail)

		assert.doesNotThrow(action.pass)
		assert.throws(action.pass)
		assert.throws(action.fail)
	})

	ensure("action.fail throw when called more than once", () => {
		const action = createAction()
		action.fail()

		assert.throws(() => {
			action.fail()
		})
	})

	ensure("action.pass throw when called after action.fail", () => {
		const action = createAction()
		action.fail()

		assert.throws(() => {
			action.pass()
		})
	})

	ensure("action.fail throw when called after action.pass", () => {
		const action = createAction()
		action.pass()

		assert.throws(() => {
			action.fail()
		})
	})

	ensure("action.fail(failedAction), fail with action wrapped value", () => {
		const failedAction = createAction()
		failedAction.fail(10)
		const action = createAction()
		action.fail(failedAction)
		assertFailed(action)
		assertResult(action, 10)
	})

	ensure("then(onPass) call onpass immediatly when passed", () => {
		const action = createAction()
		const value = 1
		action.pass(value)
		let passedValue
		action.then((value) => {
			passedValue = value
		})

		assert.equal(passedValue, value)
	})

	ensure("action.then(onPass) calls onpass as soon as passed", () => {
		const action = createAction()
		const value = 1
		let passedValue
		action.then((value) => {
			passedValue = value
		})

		assert.equal(passedValue, undefined)

		action.pass(value)

		assert.equal(passedValue, value)
	})

	ensure("action.then(null, onFail) call onFail immediatly when failed", () => {
		const action = createAction()
		const value = 1
		action.fail(value)
		let failedValue
		action.then(null, (value) => {
			failedValue = value
		})

		assert.equal(failedValue, value)
	})

	ensure("action.then(null, onFail) calls onFail as soon as failed", () => {
		const action = createAction()
		const value = 1
		let failedValue
		action.then(null, (value) => {
			failedValue = value
		})

		assert.equal(failedValue, undefined)

		action.fail(value)

		assert.equal(failedValue, value)
	})

	ensure("action.then() when passed", () => {
		const action = createAction()
		const nextAction = action.then()
		const value = 1
		action.pass(value)

		assertPassed(nextAction)
		assertResult(nextAction, value)
	})

	ensure("action.then() when failed", () => {
		const action = createAction()
		const nextAction = action.then()
		const value = 1
		action.fail(value)

		assertFailed(nextAction)
		assertResult(nextAction, value)
	})

	ensure("action.pass(resolvedThenable) pass with a thenable", () => {
		const resolvedThenable = {
			then: () => {},
		}
		const action = createAction()
		action.pass(resolvedThenable)

		assertPassed(action)
		assertResult(action, resolvedThenable)
	})

	ensure("action.fail(resolvedThenable) pass with resolvedThenable wrapped value", () => {
		const resolvedThenable = {
			then: () => {},
		}
		const action = createAction()
		action.fail(resolvedThenable)

		assertFailed(action)
		assertResult(action, resolvedThenable)
	})
})
