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
