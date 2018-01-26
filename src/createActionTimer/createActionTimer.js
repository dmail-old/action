import { mixin, pure } from "@dmail/mixin"

export const createTimer = () => {
	return mixin(pure, ({ self: timer }) => {
		let expiredCallback
		let timeoutid
		let startMs
		let endMs
		let hasExpired = false
		let allocatedMs

		const cancelTimeout = () => {
			if (timeoutid !== undefined) {
				clearTimeout(timeoutid)
				timeoutid = undefined
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

		const getRemainingMs = () => {
			return allocatedMs === Infinity ? Infinity : allocatedMs - getConsumedMs()
		}

		const setExpiredCallback = (fn) => {
			if (expiredCallback) {
				throw new Error("expiredCallback already set")
			}
			expiredCallback = fn
		}

		const expire = () => {
			hasExpired = true
			if (expiredCallback) {
				expiredCallback(timer)
			}
		}

		const done = () => {
			endMs = Date.now()
			cancelTimeout()
		}

		const allocateMs = (ms = Infinity) => {
			if (typeof ms !== "number") {
				throw new TypeError(`unexpected allocateMs first argument, must be a number`)
			}

			if (hasExpired) {
				throw new Error("cannot allocateMs once hasExpired")
			}
			if (startMs === undefined) {
				startMs = Date.now()
			} else {
				cancelTimeout()
			}

			allocatedMs = ms
			if (allocatedMs < 0) {
				expire()
			} else if (allocatedMs !== Infinity) {
				timeoutid = setTimeout(expire, allocatedMs)
			}
		}

		const increaseAllocatedMs = (ms) => allocateMs(getRemainingMs() + ms)

		const decreaseAllocatedMs = (ms) => allocateMs(getRemainingMs() - ms)

		const createOutOfMsMessage = () => `must terminates in less than ${getAllocatedMs()}ms`

		return {
			setExpiredCallback,
			allocateMs,
			createOutOfMsMessage,
			done,
			getAllocatedMs,
			getConsumedMs,
			getRemainingMs,
			increaseAllocatedMs,
			decreaseAllocatedMs,
		}
	})
}

export const createTimerControllingAction = (timer, action) => {
	const timerControllingAction = mixin(timer, ({ self: actionTimer }) => {
		const allocateMs = (ms) => {
			if (action.isEnded()) {
				throw new Error(`cannot allocateMs once the action has ${action.getState()}`)
			}

			timer.setExpiredCallback(() => {
				action.shortcircuit(action.fail, actionTimer)
			})
			timer.allocateMs(ms)
			action.then(timer.done, timer.done)
		}

		return { allocateMs }
	})
	return timerControllingAction
}

export const createActionTimer = (action) => {
	return createTimerControllingAction(createTimer(), action)
}
