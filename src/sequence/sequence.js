import { isAction } from "../action.js"
import { fromFunction } from "../fromFunction/fromFunction.js"

export const sequence = (iterable, fn = v => v) =>
	fromFunction(({ pass, fail }) => {
		const iterator = iterable[Symbol.iterator]()
		const results = []

		const iterate = () => {
			const { done, value } = iterator.next()
			if (done) {
				return pass(results)
			}
			const valueModified = fn(value)
			if (isAction(valueModified)) {
				valueModified.then(
					result => {
						results.push(result)
						iterate()
					},
					result => {
						fail(result)
					}
				)
			} else {
				results.push(valueModified)
				iterate()
			}
		}
		iterate()
	})
// sequence(["a", "b"]).then(console.log)
