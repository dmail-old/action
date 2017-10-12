import { fromFunction } from "../fromFunction/fromFunction.js"

export const passed = value => fromFunction(({ pass }) => pass(value))
