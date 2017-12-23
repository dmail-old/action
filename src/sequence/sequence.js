import { isAction } from "../action.js"
import { fromFunction } from "../fromFunction/fromFunction.js"
import { passed } from "../passed/passed.js"
import { createIterator } from "../compose/compose.js"

// ptet supprimer fn, maintenant qu'on a mapIterable non?
// surtout qu'on utilisera surement composeSequence et pas sequence directement du coup
export const sequence = (iterable, fn = (v) => v) =>
	fromFunction(({ pass, fail }) => {
		const { iterate } = createIterator(iterable)

		const results = []

		const visit = () => {
			const { done, value, index } = iterate()
			if (done) {
				return pass(results)
			}
			const valueModified = fn(value, index, iterable)
			if (isAction(valueModified)) {
				valueModified.then(
					(result) => {
						results.push(result)
						visit()
					},
					(result) => {
						fail(result)
					},
				)
			} else {
				results.push(valueModified)
				visit()
			}
		}
		visit()
	})

export const chainFunctions = (firstFunction = () => {}, ...remainingFunctions) =>
	remainingFunctions.reduce((accumulator, fn) => accumulator.then(fn), passed(firstFunction()))
