import { isAction, createAction } from "../action.js"

export const mutateAction = (action, fn) => {
	const returnValue = fn(action)
	if (isAction(returnValue)) {
		returnValue.then(action.pass, action.fail)
	}
	return action
}

export const fromFunction = fn => mutateAction(createAction(), fn)
