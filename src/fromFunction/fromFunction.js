import { isAction, createAction } from "../action.js"

export const fromFunction = fn => {
	const action = createAction()
	const returnValue = fn(action)
	if (isAction(returnValue)) {
		returnValue.then(action.pass, action.fail)
	}
	return action
}
