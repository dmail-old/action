import { isAction } from "../action.js"
import { fromFunction } from "../fromFunction/fromFunction.js"

export const any = iterable =>
	fromFunction(({ fail, pass }) => {
		let failedOrPassed = false
		const compositePass = value => {
			if (failedOrPassed === false) {
				failedOrPassed = true
				pass(value)
			}
		}
		const compositeFail = value => {
			if (failedOrPassed === false) {
				failedOrPassed = true
				fail(value)
			}
		}

		for (const value of iterable) {
			if (isAction(value)) {
				value.then(compositePass, compositeFail)
			} else {
				compositePass(value)
			}

			if (failedOrPassed) {
				break
			}
		}
	})
