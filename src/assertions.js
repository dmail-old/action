import assert from "assert"

export { assert }
export const assertPassed = (action) => assert.equal(action.getState(), "passed")

export const assertFailed = (action) => assert.equal(action.getState(), "failed")

export const assertResult = (action, expectedResult) =>
	assert.equal(action.getResult(), expectedResult)

export const assertRunning = (action) => assert.equal(action.getState(), "unknown")

export const assertPassing = (action) => assert.equal(action.getState(), "passing")

export const assertFailing = (action) => assert.equal(action.getState(), "failing")
