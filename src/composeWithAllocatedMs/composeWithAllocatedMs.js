import { passed } from "../passed/passed.js"
import { withAllocableMs, failureIsOutOfMs } from "../withAllocableMs/withAllocableMs.js"
import { composeSequence, composeTogether } from "../compose/compose.js"

const defaultHandle = (_, value) => passed(value)

const composeWithAllocatedMs = (
	iterable,
	{ handle = defaultHandle, composer, allocatedMs = Infinity }
) => {
	let previousAction
	return composer(iterable, {
		handle: (composedAction, value, index) => {
			composedAction.mixin(withAllocableMs)
			composedAction.allocateMs(index === 0 ? allocatedMs : previousAction.getRemainingMs())
			const allocateMs = composedAction.allocateMs
			composedAction.allocateMs = allocatedMs =>
				allocateMs(composedAction.getRemainingMs() + allocatedMs)
			previousAction = composedAction
			return handle(composedAction, value, index, iterable)
		},
		failureIsCritical: failureIsOutOfMs
	})
}

export const composeSequenceWithAllocatedMs = (iterable, params) =>
	composeWithAllocatedMs(iterable, Object.assign({ composer: composeSequence }, params))

export const composeTogetherWithAllocatedMs = (iterable, params) =>
	composeWithAllocatedMs(iterable, Object.assign({ composer: composeTogether }, params))
