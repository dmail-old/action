import { mixin, pure } from "@dmail/mixin"

export const createTimer = () => {
	return mixin(pure, ({ self: timer }) => {
		let expiredCallback
		let timeoutid
		let startMs
		let endMs
		let hasExpired = false
		let allocatedMs

		const hasStarted = () => typeof startMs === "number"

		const hasEnded = () => typeof endMs === "number"

		const cancelTimeout = () => {
			if (timeoutid !== undefined) {
				clearTimeout(timeoutid)
				timeoutid = undefined
			}
		}

		const getConsumedMs = () => {
			if (hasEnded()) {
				return endMs - startMs
			}
			if (hasStarted()) {
				return Date.now() - startMs
			}
			return undefined
		}

		const getAllocatedMs = () => allocatedMs

		const getRemainingMs = () => {
			return hasStarted() ? allocatedMs - getConsumedMs() : undefined
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
			if (hasStarted()) {
				cancelTimeout()
			} else {
				startMs = Date.now()
			}

			allocatedMs = ms
			if (allocatedMs < 0) {
				expire()
			} else if (allocatedMs !== Infinity) {
				timeoutid = setTimeout(expire, allocatedMs)
			}
		}

		const increaseAllocatedMs = (ms) => {
			if (hasStarted()) {
				allocateMs(getRemainingMs() + ms)
			}
		}

		const decreaseAllocatedMs = (ms) => {
			if (hasStarted()) {
				allocateMs(getRemainingMs() - ms)
			}
		}

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
