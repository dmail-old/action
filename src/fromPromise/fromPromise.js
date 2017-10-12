import { fromFunction } from "../fromFunction/fromFunction.js"

export const fromPromise = promise =>
	fromFunction(({ pass, fail }) => {
		promise.then(value => setTimeout(pass, 0, value), reason => setTimeout(fail, 1, reason))
	})
