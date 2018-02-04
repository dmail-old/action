import { createAction } from "../action.js"

export const fromPromise = (promise) => {
	const action = createAction()

	promise.then(
		// setTimeout to avoid promise catching mecanism
		(value) => setTimeout(action.pass, 0, value),
		(reason) => setTimeout(action.fail, 0, reason),
	)

	return action
}
