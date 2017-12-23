import { isAction, isThenable, createAction } from "../action.js"

export const fromFunction = (fn) => {
	const action = createAction()
	const returnValue = fn(action)
	if (returnValue === action) {
		return action
	}
	if (isAction(returnValue)) {
		returnValue.then(action.pass, action.fail)
	} else if (isThenable(returnValue)) {
		returnValue.then(action.pass, action.fail)
	}
	return action
}
