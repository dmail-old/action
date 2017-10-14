import { isAction, createAction } from "../action.js"
import { all } from "../all/all.js"
import { sequence } from "../sequence/sequence.js"
import { passed } from "../passed/passed.js"
import { failed } from "../failed/failed.js"
import { mutateAction } from "../fromFunction/fromFunction.js"

import { mapIterable } from "../mapIterable.js"

const defaultHandle = (_, value) => passed(value)

const compose = (iterable, { handle = defaultHandle, composer }) => {
	const map = (value, index) =>
		mutateAction(isAction(value) ? value : createAction(), action =>
			handle(action, value, index, iterable)
		).then(
			result => ({ state: "passed", result }),
			// transform failed into passed so that sequence & all does not stop on first failure
			result => passed({ state: "failed", result })
		)

	iterable = mapIterable(iterable, map)

	return composer(iterable).then(
		// but once are done, refails it when needed
		reports => (reports.some(({ state }) => state === "failed") ? failed(reports) : passed(reports))
	)
}

export const composeSequence = (iterable, handle) =>
	compose(iterable, { composer: sequence, handle })

export const composeTogether = (iterable, handle) => compose(iterable, { composer: all, handle })
