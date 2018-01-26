import { createAction } from "../action.js"
import { passed } from "../passed/passed.js"

export const createIterator = (iterable) => {
	const iterator = iterable[Symbol.iterator]()
	let currentIndex = 0

	const iterate = () => {
		const next = iterator.next()
		const index = currentIndex
		currentIndex++
		return {
			done: next.done,
			value: next.value,
			index,
			iterable,
		}
	}

	return {
		iterate,
		iterable,
	}
}

export const compose = ({ from, iterator, composer }) => {
	const action = createAction()
	const { pass, fail } = action

	const { iterable, iterate } = iterator

	let pending = true

	const breakAndPass = (value) => {
		pending = false
		pass(value)
	}

	const breakAndFail = (value) => {
		pending = false
		fail(value)
	}

	const unwrap = (value, handler) => {
		const action = passed(value)
		action.then(
			(value) => handler(action, value, "passed"),
			(value) => handler(action, value, "failed"),
		)
	}

	const handleUnknown = (action, value, state) => {
		const { done, value: nextValue, index: nextIndex } = iterate()

		const composerResult = composer({
			index: nextIndex - 1,
			nextIndex,
			value,
			nextValue,
			action,
			state,
			iterable,
			done,
			pass: breakAndPass,
			fail: breakAndFail,
		})

		if (pending) {
			if (done) {
				const handleLast = (action, value, state) => {
					composer({
						index: nextIndex,
						nextIndex: nextIndex + 1,
						value,
						nextValue: undefined,
						action,
						state,
						iterable,
						done,
						pass: breakAndPass,
						fail: breakAndFail,
					})
					if (pending) {
						throw new Error("composer must fail or pass when iteration is done")
					}
				}
				unwrap(composerResult, handleLast)
			} else {
				unwrap(composerResult, handleUnknown)
			}
		}
	}

	unwrap(from, handleUnknown)

	return action
}
