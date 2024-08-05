export function randomArrayElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function arrayUnique<T>(
  array: T[],
  compare: (a: T, b: T) => boolean = (a, b) => a === b,
): T[] {
  return array.filter((v, i, a) => a.findIndex((x) => compare(v, x)) === i)
}
