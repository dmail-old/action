// import assert from "assert"
// import { fromNodeCallbackRecoveringWhen } from "./fromNodeCallbackRecoveringWhen.js"

// console.log("fromNodeCallbackRecoveringWhen with recovered errored callback")
// const nodeCallbackError = (error, callback) => callback(error)
// const recoveredException = 2
// const recoverValue = 3
// const action = fromNodeCallbackRecoveringWhen(
// 	nodeCallbackError,
// 	error => error === recoveredException,
// 	recoverValue
// )(recoveredException)
// assertPassed(action)
// assertResult(action, recoverValue)
