const createIterable = createIterator => {
	return {
		[Symbol.iterator]: createIterator
	}
}

const createIterator = next => {
	return {
		next
	}
}

// https://github.com/dmail/iterable/blob/master/lib/iterable-map.js

export const mapIterable = (iterable, fn) =>
	createIterable(() => {
		let index = 0
		const iterator = iterable[Symbol.iterator]()
		return createIterator(() => {
			const { done, value } = iterator.next()

			if (done) {
				return { done, value }
			}

			const mappedValue = fn(value, index, iterable)
			index++
			return {
				done,
				value: mappedValue
			}
		})
	})

export const reduceIterable = (iterable, fn, initialValue) =>
	createIterable(() => {
		let index = 0
		const iterator = iterable[Symbol.iterator]()
		let accumulator
		return createIterator(() => {
			let { done, value } = iterator.next()

			if (done) {
				if (index === 0) {
					if (initialValue === undefined) {
						throw new TypeError("reduce of empty iterable with no initialValue")
					}
					value = initialValue
				}
				return { done, value }
			}

			if (index === 0) {
				if (initialValue === undefined) {
					const nextResult = iterator.next()
					if (nextResult.done) {
						done = true
					}
					index++
					accumulator = value
					value = nextResult.value
				} else {
					accumulator = initialValue
				}
			}
			accumulator = fn(accumulator, value, index, iterable)
			index++
			return {
				done,
				value: accumulator
			}
		})
	})
