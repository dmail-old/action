import { reduceIterable } from "../mapIterable.js"

export const reduce = (
	iterable,
	reducer = (accumulator, value) => value(accumulator),
	initialValue
) =>
	reduceIterable(
		iterable,
		(accumulator, value, index, iterable) => {
			// si on retourne une action il faudrais alors attendre que l'action se termine
			// et passer cette valeur au prochain
			// sequence ne suffit pas ici
			// je suis pas sur de comment obtenir ce qu'on veut
			// en fait il faut commencer à itérer sur l'iterable
			// apeller le reducer
			// lorsque c'est une action faudrais attendre la fin de l'action avant d'itérer sur le suivant
			// autrement dit on peut pas utiliser sequence
		},
		initialValue
	)
