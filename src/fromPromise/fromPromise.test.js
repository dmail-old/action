import { test } from "../test.js"
import { fromPromise } from "./fromPromise.js"

test("fromPromise.js", ({ assert, waitUntil }) => {
	const done = waitUntil()

	const passException = 1
	let caughtException
	process.once("uncaughtException", e => {
		caughtException = e
	})
	const thenableCatchingOnResolve = {
		then: onResolve => {
			try {
				onResolve()
			} catch (e) {}
		}
	}
	fromPromise(thenableCatchingOnResolve).then(() => {
		throw passException
	})
	setTimeout(() => {
		assert.equal(caughtException, passException)

		const failException = 2
		process.once("uncaughtException", e => {
			caughtException = e
		})
		// we create a promise like behaviour and not native promise
		// because rejected native promise does strange stuff on node
		const thenableCatchingOnReject = {
			then: (onResolve, onReject) => {
				try {
					onReject()
				} catch (e) {}
			}
		}
		fromPromise(thenableCatchingOnReject).then(null, () => {
			throw failException
		})
		setTimeout(() => {
			assert.equal(caughtException, failException)
			done()
		}, 20)
	}, 20)
})
