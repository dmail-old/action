import { fromFunction } from "../fromFunction/fromFunction.js"
import { withAllocableMs } from "../withAllocableMs/withAllocableMs.js"
import { compose } from "../compose/compose.js"

const defaultHandle = ({ value, pass }) => pass(value)

export const composeWithAllocableMs = (
	iterable,
	{ handle = defaultHandle, how, allocatedMs = Infinity } = {}
) =>
	fromFunction(action => {
		action.mixin(withAllocableMs)
		action.allocateMs(allocatedMs)
		return compose(iterable, {
			handle: composedAction => {
				composedAction.mixin(withAllocableMs)
				composedAction.allocateMs(action.getRemainingMs())
				return handle(composedAction)
			},
			how
		})
	})
