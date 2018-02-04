import { isAction, createAction } from "../action.js"
import { passed } from "../passed/passed.js"
import { createIterator } from "../compose/compose.js"

// ptet supprimer fn, maintenant qu'on a mapIterable non?
// surtout qu'on utilisera surement composeSequence et pas sequence directement du coup
export const sequence = (iterable, fn = (v) => v) => {
	const action = createAction()

	const { iterate } = createIterator(iterable)

	const results = []

	const visit = () => {
		const { done, value, index } = iterate()
		if (done) {
			return action.pass(results)
		}

		const valueModified = fn(value, index, iterable)
		if (isAction(valueModified)) {
			valueModified.then(
				(result) => {
					results.push(result)
					visit()
				},
				(result) => {
					action.fail(result)
				},
			)
		} else {
			results.push(valueModified)
			visit()
		}
	}

	visit()

	return action
}

export const chainFunctions = (firstFunction = () => {}, ...remainingFunctions) =>
	remainingFunctions.reduce((accumulator, fn) => accumulator.then(fn), passed(firstFunction()))
