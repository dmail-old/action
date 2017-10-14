import { passed } from "../passed/passed.js"
import { withAllocableMs } from "../withAllocableMs/withAllocableMs.js"
import { composeSequence, composeTogether } from "../compose/compose.js"

const defaultHandle = (_, value) => passed(value)

const composeWithAllocatedMs = (
	iterable,
	{ handle = defaultHandle, composer, allocatedMs = Infinity }
) => {
	let previousAction
	return composer(iterable, (composedAction, value, index) => {
		composedAction.mixin(withAllocableMs)
		composedAction.allocateMs(index === 0 ? allocatedMs : previousAction.getRemainingMs())
		previousAction = composedAction
		return handle(composedAction, value, index, iterable)
	})
}

export const composeSequenceWithAllocatedMs = (iterable, handle, allocatedMs) =>
	composeWithAllocatedMs(iterable, { handle, composer: composeSequence, allocatedMs })

export const composeTogetherWithAllocatedMs = (iterable, handle, allocatedMs) =>
	composeWithAllocatedMs(iterable, { handle, composer: composeTogether, allocatedMs })
