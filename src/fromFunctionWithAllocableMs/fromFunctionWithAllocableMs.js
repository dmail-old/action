import { fromFunction } from "../fromFunction/fromFunction.js"

const composeFunctionParams = (createParams, fnCalledWithComposedParams) => inputParams =>
	fnCalledWithComposedParams(Object.assign({}, inputParams, createParams(inputParams)))

export const fromFunctionWithAllocableMs = fn =>
	fromFunction(
		composeFunctionParams(({ fail, then }) => {
			let timeoutid
			let allocatedMs = Infinity
			let startMs
			const cancelTimeout = () => {
				if (timeoutid !== undefined) {
					clearTimeout(timeoutid)
					timeoutid = undefined
				}
			}
			const allocateMs = ms => {
				allocatedMs = ms < 0 ? Infinity : ms
				cancelTimeout()
				if (ms !== Infinity) {
					startMs = Date.now()
					timeoutid = setTimeout(
						() => fail(`must pass or fail in less than ${allocatedMs}ms`),
						allocatedMs
					)
				}
			}
			const getConsumedMs = () => (startMs === undefined ? undefined : Date.now() - startMs)
			const getAllocatedMs = () => allocatedMs
			const getRemainingMs = () =>
				allocatedMs === Infinity ? Infinity : allocatedMs - getConsumedMs()
			then(cancelTimeout, cancelTimeout)

			return { allocateMs, getAllocatedMs, getConsumedMs, getRemainingMs }
		}, fn)
	)
