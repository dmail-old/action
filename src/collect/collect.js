import {
	allocableMsTalent,
	failureIsOutOfMs,
	createOutOfMsMessage,
} from "../allocableMsTalent/allocableMsTalent.js"
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
				// I should also measure duration before action pass/fail
				results.push({ state, result: value })
			}
			if (state === "failed") {
				if (failureIsOutOfMs(value)) {
					// fail saying we are out of 10ms
					// even if the action may say it failed because it had only 8ms
					// because the composedAction has 10ms
					// even if its subaction may have less
					return fail(createOutOfMsMessage(allocatedMs))
				}
				someHasFailed = true
			}
			if (done) {
				if (someHasFailed) {
					return fail(results)
				}
				return pass(results)
			}

			// ah bah oui allocableMsTalent apelle then
			// qui apelle replicate sur lastValueOf
			// qui du coup rapelle allocableMsTalent
			// dans une boucle infinie
			// le then qu'on utilise dans allocableMsTalent
			// ne "devrait" par réappliquer le talent
			// soit then n'utilise pas lastValueOf
			// soit c'est l'utilisation même du then qui est foireuse

			const nextActionWithAllocableMs = mixin(passed(nextValue), allocableMsTalent)
			nextActionWithAllocableMs.allocateMs(action.getRemainingMs())
			return nextActionWithAllocableMs
		},
	})
}

// export const collectConcurrent = (iterable, allocatedMs = Infinity)
// export const collectConcurrentWithAllocatedMs = (iterable, allocatedMs = Infinity)
