import { passed } from "../passed/passed.js"
import { fromFunction } from "../fromFunction/fromFunction.js"

export const reduce = (iterable, reducer, initialValue) =>
	fromFunction(() => {
		const iterator = iterable[Symbol.iterator]()
		let index = 0
		let reducedValue
		let { done, value } = iterator.next()

		if (done) {
			if (initialValue === undefined) {
				throw new Error("reduce called on empty iterable without initialValue")
			}
			return passed(initialValue)
		}
		if (initialValue === undefined) {
			reducedValue = passed(value)

			const nextResult = iterator.next()
			if (nextResult.done) {
				return reducedValue
			}
			value = nextResult.value
			index++
		} else {
			reducedValue = passed(initialValue)
		}

		const iterate = currentValue =>
			reducedValue.then(result => {
				reducedValue = passed(reducer(result, currentValue, index, iterable))
				index++
				const { value, done } = iterator.next()
				if (done) {
					return reducedValue
				}
				return iterate(value)
			})
		return iterate(value)
	})
