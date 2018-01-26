import { isAction, createAction } from "../action.js"

export const passed = (value) => {
	if (isAction(value)) {
		return value
	}
	const action = createAction()
	action.pass(value)
	return action
}
