export function mapGetter(mapName: Map<string, number>, mapKey: string) {
  return mapName.get(mapKey);
}

export function mapSetter(
  mapName: Map<string, number>,
  mapKey: string,
  mapValue: number,
) {
  return mapName.set(mapKey, mapValue);
}

export function toDeleteMapKey(mapName: Map<string, number>, mapKey: string) {
  return mapName.delete(mapKey);
}
