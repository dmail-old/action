import { createTimer } from "./createTimer.js"
import { test } from "@dmail/test-cheap"
import { install } from "lolex"
import { assert } from "../assertions.js"

test("createTimer.js", ({ ensure }) => {
	ensure("when allocateMs was not called yet", () => {
		const { getAllocatedMs, getRemainingMs, getConsumedMs, done } = createTimer()

		assert.equal(getAllocatedMs(), undefined)
		assert.equal(getConsumedMs(), undefined)
		assert.equal(getRemainingMs(), undefined)

		done()
	})

	ensure("once 10ms were allocated", () => {
		const { getConsumedMs, getRemainingMs, getAllocatedMs, allocateMs, done } = createTimer()
		allocateMs(10)

		assert.equal(getAllocatedMs(), 10)
		assert.equal(getConsumedMs(), 0)
		assert.equal(getRemainingMs(), 10)

		done()
	})

	ensure("once 10ms were allocated and 1ms ellapsed", () => {
		const clock = install()

		const { getConsumedMs, getRemainingMs, getAllocatedMs, allocateMs, done } = createTimer()
		allocateMs(10)
		clock.tick(1)

		assert.equal(getAllocatedMs(), 10)
		assert.equal(getConsumedMs(), 1)
		assert.equal(getRemainingMs(), 9)

		done()

		clock.uninstall()
	})

	ensure("once 10ms were allocated and 11ms ellapsed", () => {
		const clock = install()

		const {
			getConsumedMs,
			getRemainingMs,
			getAllocatedMs,
			allocateMs,
			setExpiredCallback,
			self: timer,
		} = createTimer()
		let expiredArgs
		allocateMs(10)
		setExpiredCallback((...args) => {
			expiredArgs = args
		})
		clock.tick(11)

		assert.deepEqual(expiredArgs, [timer])
		assert.equal(getAllocatedMs(), 10)
		assert.equal(getConsumedMs(), 11)
		assert.equal(getRemainingMs(), -1)
	})
})
