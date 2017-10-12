export const aroundAction = (before, actionCreator, after) => {
	before()
	return actionCreator().then(
		result => {
			after(result, true)
			return result
		},
		result => {
			after(result, true)
			return result
		}
	)
}
