import { isAction, createAction } from "../action.js"

export const failed = (value) => {
	if (isAction(value)) {
		return value
	}

	const action = createAction()
	action.fail(value)

	return action
}
