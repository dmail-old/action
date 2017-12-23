import { isAction } from "../action.js"
import { fromFunction } from "../fromFunction/fromFunction.js"

export const passed = (value) => (isAction(value) ? value : fromFunction(({ pass }) => pass(value)))
