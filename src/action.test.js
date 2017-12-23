import { createAction } from "./action.js"
import { test } from "@dmail/test-cheap"
import { assert, assertPassed, assertFailed, assertResult } from "./assertions.js"
import { mixin } from "@dmail/mixin"

test("action.js", ({ ensure }) => {
	ensure("action.pass(itself) throw", () => {
		const action = createAction()
		assert.throws(() => {
			action.pass(action)
		})
	})

	ensure("action.fail(itself) throw", () => {
		const action = createAction()
		assert.throws(() => {
			action.fail(action)
		})
	})

	ensure("action.pass throw when called more than once", () => {
		const action = createAction()
		action.pass()
		assert.throws(() => {
			action.pass()
		})
	})

	ensure("action.shortcircuit(action.pass) prevent next pass throw", () => {
		const action = createAction()
		action.shortcircuit(action.pass, "foo")
		assertPassed(action)
		assertResult(action, "foo")
		assert.doesNotThrow(action.pass)
		assert.throws(action.pass)
		assert.throws(action.fail)
		assertResult(action, "foo")
	})

	ensure("action.shortcircuit(action.fail) prevent next fail throw", () => {
		const action = createAction()
		action.shortcircuit(action.fail, "foo")
		assertFailed(action)
		assertResult(action, "foo")
		assert.doesNotThrow(action.fail)
		assert.throws(action.pass)
		assert.throws(action.fail)
		assertResult(action, "foo")
	})

	ensure("action.shortcircuit(action.pass) prevent next fail throw", () => {
		const action = createAction()
		action.shortcircuit(action.pass)
		assert.doesNotThrow(action.fail)
		assert.throws(action.pass)
		assert.throws(action.fail)
	})

	ensure("action.shortcircuit(action.fail) prevent next pass throw", () => {
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

	ensure("action.pass(resolvedThenable) pass with resolvedThenable wrapped value", () => {
		const value = 1
		const resolvedThenable = {
			then: (onPassed) => onPassed(value),
		}
		const action = createAction()
		action.pass(resolvedThenable)
		assertPassed(action)
		assertResult(action, value)
	})

	ensure("action.fail(resolvedThenable) pass with resolvedThenable wrapped value", () => {
		const value = 1
		const resolvedThenable = {
			then: (onPassed) => onPassed(value),
		}
		const action = createAction()
		action.fail(resolvedThenable)
		assertPassed(action)
		assertResult(action, value)
	})

	ensure("action.pass(rejectedThenable) fail with rejectedThenable wrapped value", () => {
		const value = 1
		const rejectedThenable = {
			then: (onPassed, onFailed) => onFailed(value),
		}
		const action = createAction()
		action.pass(rejectedThenable)
		assertFailed(action)
		assertResult(action, value)
	})

	ensure("action.fail(rejectedThenable) fail with rejectedThenable wrapped value", () => {
		const value = 1
		const rejectedThenable = {
			then: (onPassed, onFailed) => onFailed(value),
		}
		const action = createAction()
		action.fail(rejectedThenable)
		assertFailed(action)
		assertResult(action, value)
	})

	ensure("action.fail(failedAction), fail with action wrapped value", () => {
		const failedAction = createAction()
		failedAction.fail(10)
		const action = createAction()
		action.fail(failedAction)
		assertFailed(action)
		assertResult(action, 10)
	})

	ensure("action.then(onPass) call onpass immediatly when passed", () => {
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

	ensure("pass on talentedAction", () => {
		const action = createAction()
		const passedValues = []
		action.then((value) => {
			passedValues.push(value)
		})
		const talentedAction = mixin(action, () => ({ foo: true }))
		talentedAction.then((value) => {
			passedValues.push(value)
		})
		talentedAction.pass("yo")
		assertPassed(action)
		assertPassed(talentedAction)
		assert.deepEqual(passedValues, ["yo", "yo"])
	})
})
