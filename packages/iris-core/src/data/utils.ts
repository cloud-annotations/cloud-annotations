import { Project } from "./types";

export function labelNameExists(
  labels: { [key: string]: Project.Label },
  label: string
) {
  const names = Object.values(labels).map((l) => l.name);
  return names.includes(label);
}
