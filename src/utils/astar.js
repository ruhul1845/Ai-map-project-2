import { distanceKm } from './geo'

function buildGraph(allNodes, roads) {
  const nodesById = Object.fromEntries(allNodes.map((node) => [node.id, node]))
  const graph = Object.fromEntries(allNodes.map((node) => [node.id, []]))

  roads.forEach(([a, b]) => {
    if (!nodesById[a] || !nodesById[b]) return
    const weight = distanceKm(nodesById[a], nodesById[b])
    graph[a].push({ id: b, weight })
    graph[b].push({ id: a, weight })
  })

  return { graph, nodesById }
}

export function createAStarContext(allNodes, roads) {
  const { graph, nodesById } = buildGraph(allNodes, roads)

  function heuristic(fromId, toId) {
    return distanceKm(nodesById[fromId], nodesById[toId])
  }

  function aStarSearch(startId, goalId) {
    const open = new Set([startId])
    const closed = new Set()
    const cameFrom = {}
    const gScore = Object.fromEntries(allNodes.map((node) => [node.id, Infinity]))
    const fScore = Object.fromEntries(allNodes.map((node) => [node.id, Infinity]))
    const expandedOrder = []

    gScore[startId] = 0
    fScore[startId] = heuristic(startId, goalId)

    while (open.size > 0) {
      const current = [...open].sort((a, b) => fScore[a] - fScore[b])[0]
      expandedOrder.push(current)

      if (current === goalId) {
        return {
          path: reconstructPath(cameFrom, current),
          distance: gScore[current],
          nodesExpanded: expandedOrder.length,
          expandedOrder,
          heuristicName: 'Straight-line Haversine distance',
          formula: 'f(n) = g(n) + h(n)'
        }
      }

      open.delete(current)
      closed.add(current)

      for (const neighbor of graph[current] || []) {
        if (closed.has(neighbor.id)) continue
        const tentativeG = gScore[current] + neighbor.weight
        if (tentativeG < gScore[neighbor.id]) {
          cameFrom[neighbor.id] = current
          gScore[neighbor.id] = tentativeG
          fScore[neighbor.id] = tentativeG + heuristic(neighbor.id, goalId)
          open.add(neighbor.id)
        }
      }
    }

    return {
      path: [],
      distance: Infinity,
      nodesExpanded: expandedOrder.length,
      expandedOrder,
      heuristicName: 'Straight-line Haversine distance',
      formula: 'f(n) = g(n) + h(n)'
    }
  }

  return { aStarSearch, nodesById, graph }
}

function reconstructPath(cameFrom, current) {
  const total = [current]
  while (cameFrom[current]) {
    current = cameFrom[current]
    total.unshift(current)
  }
  return total
}
