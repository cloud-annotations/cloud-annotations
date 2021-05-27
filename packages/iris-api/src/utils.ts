export function stripEmptyKeys<T>(o: { [key: string]: T | undefined }) {
  let safe: { [key: string]: T } = {};
  for (const [key, val] of Object.entries(o)) {
    if (val !== undefined && val !== null) {
      safe[key] = val;
    }
  }
  return safe;
}
