import { createAction } from "../action.js"

export const fromNodeCallbackCatching = (fn, catchPredicate, recoverValue) => (...args) => {
	const action = createAction()

	fn(...args, (error, data) => {
		if (error) {
			if (catchPredicate(error)) {
				action.pass(recoverValue)
			} else {
				throw error
			}
		} else {
			action.pass(data)
		}
	})

	return action
}
