import { fromFunction } from "../fromFunction/fromFunction.js"

export const failed = value => fromFunction(({ fail }) => fail(value))
