import { createAction } from "../action.js"
import { all } from "../all/all.js"
import { sequence } from "../sequence/sequence.js"
import { passed } from "../passed/passed.js"
import { failed } from "../failed/failed.js"

import { mapIterable } from "../mapIterable.js"

const defaultHandle = value => value

export const compose = (iterable, { handle = defaultHandle, how }) => {
	const mapAction = (value, index) => {
		const action = createAction()
		return passed(handle(value, { index, iterable, action })).then(
			result => ({ state: "passed", result }),
			// transform failed into passed so that sequence & all does not stop on first failure
			result => passed({ state: "failed", result })
		)
	}

	iterable = mapIterable(iterable, mapAction)

	return how(iterable).then(
		// but once are done, refails it when needed
		reports => (reports.some(({ state }) => state === "failed") ? failed(reports) : passed(reports))
	)
}

export const composeSequence = (iterable, handle) => compose(iterable, { how: sequence, handle })

export const composeTogether = (iterable, handle) => compose(iterable, { how: all, handle })
