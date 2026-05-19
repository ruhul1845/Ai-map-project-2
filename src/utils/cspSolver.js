import { buildScenario } from '../data'
import { createAStarContext } from './astar'

function overlaps(user, station) {
  return Math.max(user.availableFrom, station.openFrom) <= Math.min(user.availableTo, station.openTo)
}

function isLegal(user, station, route) {
  return Number.isFinite(route.distance) && station.capacity >= user.demand && overlaps(user, station) && route.distance <= user.maxDistance
}

function valueScore(user, station, route) {
  const priorityBenefit = user.priority * 18
  const distancePenalty = route.distance * 3
  const supplySafety = (station.capacity - user.demand) / 8
  return priorityBenefit + supplySafety - distancePenalty
}

function cloneDomains(domains) {
  return Object.fromEntries(Object.entries(domains).map(([id, values]) => [id, values.map((v) => ({ ...v }))]))
}

function buildDomains(scenario, astar) {
  const domains = {}
  for (const user of scenario.users) {
    domains[user.id] = scenario.stations
      .map((station) => ({ station, route: astar.aStarSearch(user.id, station.id) }))
      .filter(({ station, route }) => isLegal(user, station, route))
      .map(({ station, route }) => ({
        stationId: station.id,
        route,
        score: valueScore(user, station, route),
        prunedReason: null
      }))
  }
  return domains
}

export function ac3Preprocess(rawDomains, scenario) {
  const domains = cloneDomains(rawDomains)
  let removed = 0

  // Unary/node consistency is already applied in buildDomains. This AC-3 style pass
  // removes values that have no reasonable capacity support when compared with
  // other users competing for the same station.
  const queue = []
  for (const xi of scenario.users) {
    for (const xj of scenario.users) {
      if (xi.id !== xj.id) queue.push([xi.id, xj.id])
    }
  }

  while (queue.length > 0) {
    const [xiId, xjId] = queue.shift()
    const before = domains[xiId].length
    domains[xiId] = domains[xiId].filter((xiValue) => hasSupport(xiId, xiValue, xjId, domains, scenario))
    removed += Math.max(0, before - domains[xiId].length)

    if (domains[xiId].length === 0) continue
    if (domains[xiId].length !== before) {
      for (const xk of scenario.users) {
        if (xk.id !== xiId && xk.id !== xjId) queue.push([xk.id, xiId])
      }
    }
  }

  return { domains, removed }
}

function hasSupport(xiId, xiValue, xjId, domains, scenario) {
  const xi = scenario.users.find((u) => u.id === xiId)
  const xj = scenario.users.find((u) => u.id === xjId)
  const station = scenario.stations.find((s) => s.id === xiValue.stationId)

  // If xj has another station option, xiValue is still supported.
  if (domains[xjId].some((xjValue) => xjValue.stationId !== xiValue.stationId)) return true

  // If both are forced to the same station, station capacity must support both.
  return xi.demand + xj.demand <= station.capacity
}

export function solveCSP(options = {}, scenario = buildScenario(options)) {
  const {
    useAC3 = true,
    useMRV = true,
    useDegree = true,
    useLCV = true,
    maxSearchCalls = 4500
  } = options

  const astar = createAStarContext(scenario.allNodes, scenario.roads)
  const rawDomains = buildDomains(scenario, astar)
  const rawDomainSize = totalDomainSize(rawDomains)
  const ac3Result = useAC3 ? ac3Preprocess(rawDomains, scenario) : { domains: rawDomains, removed: 0 }
  const domains = ac3Result.domains

  const metrics = {
    calls: 0,
    backtracks: 0,
    assignmentsTried: 0,
    prunedByForwardChecking: 0,
    ac3Removed: ac3Result.removed,
    rawDomainSize,
    revisedDomainSize: totalDomainSize(domains),
    stoppedByLimit: false
  }

  const greedy = greedyCOP(domains, scenario)
  const best = { assignment: greedy, score: evaluateAssignment(greedy, scenario) }
  backtrack({}, domains, emptyUsage(scenario), metrics, { useMRV, useDegree, useLCV, maxSearchCalls }, scenario, best)

  return summarizeSolution(best.assignment, domains, metrics, { useAC3, useMRV, useDegree, useLCV }, scenario, astar.nodesById)
}

function backtrack(assignment, domains, stationUsage, metrics, options, scenario, best) {
  if (metrics.calls >= options.maxSearchCalls) {
    metrics.stoppedByLimit = true
    return
  }

  metrics.calls += 1
  const currentScore = evaluateAssignment(assignment, scenario)
  if (isBetterScore(currentScore, best.score)) {
    best.assignment = { ...assignment }
    best.score = currentScore
  }

  const variable = selectUnassignedVariable(assignment, domains, options, scenario)
  if (!variable) return

  const orderedValues = orderDomainValues(variable, domains, assignment, stationUsage, options, scenario)

  for (const value of orderedValues) {
    metrics.assignmentsTried += 1
    if (!isConsistent(variable, value, stationUsage, scenario)) continue

    const nextAssignment = { ...assignment, [variable.id]: value }
    const nextUsage = { ...stationUsage, [value.stationId]: stationUsage[value.stationId] + variable.demand }
    const nextDomains = forwardCheck(variable, value, domains, assignment, nextUsage, metrics, scenario)

    backtrack(nextAssignment, nextDomains, nextUsage, metrics, options, scenario, best)
  }

  // COP relaxation: user may remain unsatisfied if no legal allocation is possible.
  const skipped = { ...assignment, [variable.id]: null }
  const skipScore = evaluateAssignment(skipped, scenario)
  if (isBetterScore(skipScore, best.score)) {
    best.assignment = skipped
    best.score = skipScore
  }
  metrics.backtracks += 1
}

function selectUnassignedVariable(assignment, domains, options, scenario) {
  const unassigned = scenario.users.filter((u) => !(u.id in assignment))
  return unassigned.sort((a, b) => {
    const mrv = options.useMRV ? domains[a.id].length - domains[b.id].length : 0
    if (mrv !== 0) return mrv

    const degree = options.useDegree ? degreeOf(b, domains, assignment, scenario) - degreeOf(a, domains, assignment, scenario) : 0
    if (degree !== 0) return degree

    return b.priority - a.priority || b.demand - a.demand
  })[0]
}

function degreeOf(user, domains, assignment, scenario) {
  const ownStations = new Set((domains[user.id] || []).map((v) => v.stationId))
  return scenario.users
    .filter((other) => other.id !== user.id && !(other.id in assignment))
    .filter((other) => (domains[other.id] || []).some((v) => ownStations.has(v.stationId))).length
}

function orderDomainValues(user, domains, assignment, stationUsage, options, scenario) {
  const values = [...(domains[user.id] || [])]
  if (!options.useLCV) return values.sort((a, b) => b.score - a.score)

  return values.sort((a, b) => {
    const lcvDiff = lcvCost(a, user, domains, assignment, stationUsage, scenario) - lcvCost(b, user, domains, assignment, stationUsage, scenario)
    if (lcvDiff !== 0) return lcvDiff
    return b.score - a.score
  })
}

function lcvCost(value, user, domains, assignment, stationUsage, scenario) {
  let removed = 0
  const projectedUsage = { ...stationUsage, [value.stationId]: stationUsage[value.stationId] + user.demand }

  for (const other of scenario.users) {
    if (other.id === user.id || other.id in assignment) continue
    for (const otherValue of domains[other.id] || []) {
      const station = scenario.stations.find((s) => s.id === otherValue.stationId)
      if (projectedUsage[otherValue.stationId] + other.demand > station.capacity) removed += 1
    }
  }

  return removed
}

function isConsistent(user, value, stationUsage, scenario) {
  const station = scenario.stations.find((s) => s.id === value.stationId)
  return stationUsage[value.stationId] + user.demand <= station.capacity
}

function forwardCheck(user, value, domains, assignment, nextUsage, metrics, scenario) {
  const next = cloneDomains(domains)
  for (const other of scenario.users) {
    if (other.id === user.id || other.id in assignment) continue
    const before = next[other.id].length
    next[other.id] = next[other.id].filter((otherValue) => {
      const station = scenario.stations.find((s) => s.id === otherValue.stationId)
      return nextUsage[otherValue.stationId] + other.demand <= station.capacity
    })
    metrics.prunedByForwardChecking += Math.max(0, before - next[other.id].length)
  }
  return next
}

function greedyCOP(domains, scenario) {
  const assignment = {}
  const stationUsage = emptyUsage(scenario)
  const sortedUsers = [...scenario.users].sort((a, b) => {
    const mrv = (domains[a.id] || []).length - (domains[b.id] || []).length
    return mrv || b.priority - a.priority || b.demand - a.demand
  })

  for (const user of sortedUsers) {
    const values = [...(domains[user.id] || [])].sort((a, b) => b.score - a.score)
    const choice = values.find((value) => isConsistent(user, value, stationUsage, scenario))
    assignment[user.id] = choice || null
    if (choice) stationUsage[choice.stationId] += user.demand
  }
  return assignment
}

function summarizeSolution(assignment, domains, metrics, options, scenario, nodesById) {
  const rows = Object.entries(assignment)
    .filter(([, value]) => value)
    .map(([userId, value]) => {
      const user = scenario.users.find((u) => u.id === userId)
      const station = scenario.stations.find((s) => s.id === value.stationId)
      return {
        userId,
        userName: user.name,
        userArea: user.area,
        stationId: station.id,
        stationName: station.name,
        stationArea: station.area,
        demand: user.demand,
        priority: user.priority,
        vehicleType: user.vehicleType,
        currentFuel: user.currentFuel,
        kmPerLiter: user.kmPerLiter,
        fuelBasedRange: user.fuelBasedRange,
        manualRange: user.manualRange,
        maxDistance: user.maxDistance,
        distanceMode: user.distanceMode,
        distance: Number(value.route.distance.toFixed(2)),
        nodesExpanded: value.route.nodesExpanded,
        path: value.route.path,
        pathNames: value.route.path.map((id) => nodesById[id]?.name || id)
      }
    })
    .sort((a, b) => b.priority - a.priority || a.distance - b.distance)

  const unassignedUsers = scenario.users
    .filter((user) => !assignment[user.id])
    .map((user) => ({ ...user, legalOptions: domains[user.id]?.length || 0 }))

  const stationUsage = emptyUsage(scenario)
  rows.forEach((row) => { stationUsage[row.stationId] += row.demand })

  const stationSummary = scenario.stations.map((station) => ({
    ...station,
    used: stationUsage[station.id],
    remaining: station.capacity - stationUsage[station.id],
    utilization: station.capacity ? Math.round((stationUsage[station.id] / station.capacity) * 100) : 0
  }))

  const satisfiedDemand = rows.reduce((sum, row) => sum + row.demand, 0)
  const totalDemand = scenario.users.reduce((sum, user) => sum + user.demand, 0)
  const weightedPriority = rows.reduce((sum, row) => sum + row.priority, 0)
  const totalPriority = scenario.users.reduce((sum, user) => sum + user.priority, 0)
  const avgDistance = rows.length ? rows.reduce((sum, row) => sum + row.distance, 0) / rows.length : 0

  return {
    rows,
    unassignedUsers,
    stationSummary,
    domains,
    metrics,
    options,
    scenario,
    score: {
      satisfiedUsers: rows.length,
      totalUsers: scenario.users.length,
      unsatisfiedUsers: unassignedUsers.length,
      satisfiedDemand,
      totalDemand,
      demandCoverage: totalDemand ? Math.round((satisfiedDemand / totalDemand) * 100) : 0,
      priorityCoverage: totalPriority ? Math.round((weightedPriority / totalPriority) * 100) : 0,
      averageDistance: Number(avgDistance.toFixed(2)),
      constraintViolations: stationSummary.filter((s) => s.used > s.capacity).length
    }
  }
}

function evaluateAssignment(assignment, scenario) {
  let satisfiedUsers = 0
  let demand = 0
  let priority = 0
  let distance = 0

  for (const [userId, value] of Object.entries(assignment)) {
    if (!value) continue
    const user = scenario.users.find((u) => u.id === userId)
    satisfiedUsers += 1
    demand += user.demand
    priority += user.priority
    distance += value.route.distance
  }

  return { satisfiedUsers, demand, priority, distance }
}

function isBetterScore(a, b) {
  if (a.priority !== b.priority) return a.priority > b.priority
  if (a.demand !== b.demand) return a.demand > b.demand
  if (a.satisfiedUsers !== b.satisfiedUsers) return a.satisfiedUsers > b.satisfiedUsers
  return a.distance < b.distance
}

function emptyUsage(scenario) {
  return Object.fromEntries(scenario.stations.map((station) => [station.id, 0]))
}

function totalDomainSize(domains) {
  return Object.values(domains).reduce((sum, domain) => sum + domain.length, 0)
}
