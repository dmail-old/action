import { fromFunctionWithAllocableMs } from "../fromFunctionWithAllocableMs/fromFunctionWithAllocableMs.js"
import { compose } from "../compose/compose.js"

const fromFunctionWithAllocatedMs = (fn, allocatedMs) =>
	fromFunctionWithAllocableMs(action => {
		action.allocateMs(allocatedMs)
		return fn(action)
	})

export const composeWithAllocableMs = (
	iterable,
	{ handle = (v, { pass }) => pass(v), how, allocatedMs = Infinity } = {}
) =>
	fromFunctionWithAllocatedMs(
		({ getRemainingMs }) =>
			compose(iterable, {
				handle: value =>
					fromFunctionWithAllocatedMs(action => handle(value, action), getRemainingMs()),
				how
			}),
		allocatedMs
	)
