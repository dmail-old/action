import assert from "assert"

export const test = (name, fn) => {
	let someHasFailed = false
	const ensure = (description, fn) => {
		process.stdout.write(`${description}: `)
		const returnValue = fn()
		if (returnValue === false) {
			someHasFailed = true
			process.stdout.write("failed\n")
		} else {
			process.stdout.write("passed\n")
		}
	}

	const assertPassed = action => assert.equal(action.getState(), "passed")
	const assertFailed = action => assert.equal(action.getState(), "failed")
	const assertResult = (action, expectedResult) => assert.equal(action.getResult(), expectedResult)
	const assertRunning = action => assert.equal(action.getState(), "running")
	const assertPassing = action => assert.equal(action.getState(), "passing")
	const assertFailing = action => assert.equal(action.getState(), "failing")

	console.log(`test ${name}`)
	fn({
		ensure,
		assert,
		assertPassed,
		assertFailed,
		assertRunning,
		assertPassing,
		assertFailing,
		assertResult
	})
	process.exit(someHasFailed ? 1 : 0)
}
