import { fromFunction } from "../fromFunction/fromFunction.js"

export const fromNodeCallbackCatching = (fn, catchCondition, recoverValue) => (...args) =>
	fromFunction(({ pass }) => {
		fn(...args, (error, data) => {
			if (error) {
				if (catchCondition(error)) {
					pass(recoverValue)
				} else {
					throw error
				}
			} else {
				pass(data)
			}
		})
	})
