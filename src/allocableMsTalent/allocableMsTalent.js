export const failureIsOutOfMs = (failure) =>
	typeof failure === "string" && failure.startsWith("must pass or fail in less")

export const createOutOfMsMessage = (allocatedMs) => {
	return `must pass or fail in less than ${allocatedMs}ms`
}

export const allocableMsTalent = ({ fail, shortcircuit, then, isEnded, getState }) => {
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

	const allocateMs = (ms) => {
		if (isEnded()) {
			throw new Error(`cannot allocateMs once the action has ${getState()}`)
		}
		allocatedMs = ms
		startMs = undefined
		endMs = undefined
		cancelTimeout()

		if (allocatedMs < 0) {
			shortcircuit(fail, createOutOfMsMessage(allocatedMs))
		} else if (allocatedMs !== Infinity) {
			startMs = Date.now()
			timeoutid = setTimeout(
				() => shortcircuit(fail, createOutOfMsMessage(allocatedMs)),
				allocatedMs,
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

	const increaseAllocatedMs = (ms) => allocateMs(getRemainingMs() + ms)

	const decreaseAllocatedMs = (ms) => allocateMs(getRemainingMs() - ms)

	const onEnded = () => {
		endMs = Date.now()
		cancelTimeout()
	}

	then(onEnded, onEnded)

	return {
		allocateMs,
		getAllocatedMs,
		getConsumedMs,
		getRemainingMs,
		increaseAllocatedMs,
		decreaseAllocatedMs,
	}
}
