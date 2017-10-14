export const withAllocableMs = ({ fail, then }) => {
	let timeoutid
	let allocatedMs = Infinity
	let startMs
	let endMs
	const cancelTimeout = () => {
		if (timeoutid !== undefined) {
			clearTimeout(timeoutid)
			timeoutid = undefined
		}
	}
	const allocateMs = ms => {
		allocatedMs = ms < 0 ? Infinity : ms
		startMs = undefined
		endMs = undefined
		cancelTimeout()
		if (ms !== Infinity) {
			startMs = Date.now()
			timeoutid = setTimeout(
				() => fail(`must pass or fail in less than ${allocatedMs}ms`),
				allocatedMs
			)
		}
	}
	const getConsumedMs = () => {
		if (startMs === undefined) {
			return undefined
		}
		if (endMs === undefined) {
			return Date.now() - startMs
		}
		return endMs - startMs
	}
	const getAllocatedMs = () => allocatedMs
	const getRemainingMs = () => (allocatedMs === Infinity ? Infinity : allocatedMs - getConsumedMs())
	const onEnded = () => {
		endMs = Date.now()
		cancelTimeout()
	}
	then(onEnded, onEnded)

	return { allocateMs, getAllocatedMs, getConsumedMs, getRemainingMs }
}
