import { compose, createIterator } from "../compose/compose.js"

export const reduce = (iterable, reducer, initialValue) => {
	const iterator = createIterator(iterable)
	if (initialValue === undefined) {
		const { done, value } = iterator.iterate()
		if (done) {
			throw new Error("reduce called on empty iterable without initialValue")
		}
		initialValue = value
	}

	return compose({
		from: initialValue,
		iterator,
		composer: ({ state, value, nextValue, nextIndex, iterable, done, fail, pass }) => {
			if (done) {
				return state === "passed" ? pass(value) : fail(value)
			}
			if (state === "passed") {
				return reducer(value, nextValue, nextIndex, iterable)
			}
			return fail(value)
		},
	})
}
