import { createAction } from "../action.js"

export const fromNodeCallback = (fn) => (...args) => {
	const action = createAction()

	fn(...args, (error, data) => {
		if (error) {
			throw error
		} else {
			action.pass(data)
		}
	})

	return action
}
