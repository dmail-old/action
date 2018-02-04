import { mixin } from "@dmail/mixin"
import { createTimer } from "../createTimer/createTimer.js"

export const createTimerControllingAction = (timer, action) => {
	const timerControllingAction = mixin(timer, ({ self: actionTimer }) => {
		const allocateMs = (ms) => {
			if (action.isEnded()) {
				throw new Error(`cannot allocateMs once the action has ${action.getState()}`)
			}

			timer.setExpiredCallback(() => {
				action.shortcircuit(action.fail, actionTimer)
			})
			timer.allocateMs(ms)
			action.then(timer.done, timer.done)
		}

		return { allocateMs }
	})
	return timerControllingAction
}

export const createActionTimer = (action) => {
	return createTimerControllingAction(createTimer(), action)
}
