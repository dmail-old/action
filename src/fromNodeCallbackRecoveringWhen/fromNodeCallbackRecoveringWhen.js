import { fromFunction } from "../fromFunction/fromFunction.js"

export const fromNodeCallbackRecoveringWhen = (fn, recoverWhen, recoverValue) => (...args) =>
	fromFunction(({ pass }) => {
		fn(...args, (error, data) => {
			if (error) {
				if (recoverWhen(error)) {
					pass(recoverValue)
				} else {
					throw error
				}
			} else {
				pass(data)
			}
		})
	})
