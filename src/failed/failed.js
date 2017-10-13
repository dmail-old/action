import { isAction } from "../action.js"
import { fromFunction } from "../fromFunction/fromFunction.js"

export const failed = value => (isAction(value) ? value : fromFunction(({ fail }) => fail(value)))
