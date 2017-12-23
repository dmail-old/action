import { allocableMsTalent, failureIsOutOfMs } from "../allocableMsTalent/allocableMsTalent.js"
import { mixin } from "@dmail/mixin"
import { createAction } from "../action"
import { passed } from "../passed/passed.js"
import { createIterator, compose } from "../compose/compose.js"

export const collectSequence = (iterable, { failureIsCritical = () => false } = {}) => {
	const results = []
	let someHasFailed = false

	return compose({
		iterator: createIterator(iterable),
		composer: ({ value, state, index, nextValue, done, fail, pass }) => {
			if (index > -1) {
				results.push({ state, result: value })
			}
			if (state === "failed") {
				if (failureIsCritical(value)) {
					return fail(value)
				}
				someHasFailed = true
			}
			if (done) {
				if (someHasFailed) {
					return fail(results)
				}
				return pass(results)
			}
			return nextValue
		},
	})
}

const createPassedActionWithAllocatedMs = (allocatedMs) => {
	const action = mixin(createAction(), allocableMsTalent)
	action.allocateMs(allocatedMs)
	action.pass()
	return action
}

export const collectSequenceWithAllocatedMs = (iterable, { allocatedMs = Infinity } = {}) => {
	const results = []
	let someHasFailed = false

	return compose({
		from: createPassedActionWithAllocatedMs(allocatedMs),
		iterator: createIterator(iterable),
		composer: ({ action, value, state, index, nextValue, done, fail, pass }) => {
			if (index > -1) {
				results.push({ state, result: value })
			}
			if (state === "failed") {
				if (failureIsOutOfMs(value)) {
					return fail(value)
				}
				someHasFailed = true
			}
			if (done) {
				if (someHasFailed) {
					return fail(results)
				}
				return pass(results)
			}

			const nextActionWithAllocableMs = mixin(passed(nextValue), allocableMsTalent)
			nextActionWithAllocableMs.allocateMs(action.getRemainingMs())
			return nextActionWithAllocableMs
		},
	})
}

// export const collectConcurrent = (iterable, allocatedMs = Infinity)
// export const collectConcurrentWithAllocatedMs = (iterable, allocatedMs = Infinity)
