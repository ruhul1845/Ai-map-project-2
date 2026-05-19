export function distanceKm(a, b) {
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export function toRad(value) {
  return (value * Math.PI) / 180
}

export function routeCostKm(path, nodesById) {
  if (!path || path.length < 2) return 0
  let total = 0
  for (let i = 0; i < path.length - 1; i++) {
    total += distanceKm(nodesById[path[i]], nodesById[path[i + 1]])
  }
  return total
}
