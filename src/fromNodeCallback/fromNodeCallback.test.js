// import assert from "assert"
// import { fromNodeCallback } from "./fromNodeCallback.js"

// const nodeCallbackError = (error, callback) => callback(error)

// {
// 	console.log("fromNodeCallback with sucessfull callback")
// 	const nodeCallbackSuccess = (value, callback) => callback(null, value)
// 	const value = 1
// 	const action = fromNodeCallback(nodeCallbackSuccess)(value)
// 	assertPassed(action)
// 	assertResult(action, value)
// }
// {
// 	console.log("fromNodeCallback with errored callback")
// 	const exception = 1
// 	assert.throws(() => {
// 		fromNodeCallback(nodeCallbackError)(exception)
// 	}, error => error === exception)
// }
