import { createAction, isAction } from "../action.js"

export const fromFunction = (fn) => {
	const returnValue = fn()

	if (isAction(returnValue)) {
		return returnValue
	}

	const action = createAction()
	action.pass(returnValue)

	return action
}
