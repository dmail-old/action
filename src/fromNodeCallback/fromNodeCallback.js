import { fromFunction } from "../fromFunction/fromFunction.js"

export const fromNodeCallback = fn => (...args) =>
	fromFunction(({ pass }) => {
		fn(...args, (error, data) => {
			if (error) {
				throw error
			} else {
				pass(data)
			}
		})
	})
