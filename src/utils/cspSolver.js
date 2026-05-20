import { buildScenario } from '../data'
import { createAStarContext } from './astar'

function overlaps(user, station) {
  return Math.max(user.availableFrom, station.openFrom) <= Math.min(user.availableTo, station.openTo)
}

function baseLegalStatus(user, station, route) {
  if (!Number.isFinite(route.distance)) return { ok: false, reason: 'No route' }
  if (station.capacity < user.demand) return { ok: false, reason: 'Capacity < demand' }
  if (!overlaps(user, station)) return { ok: false, reason: 'Time mismatch' }
  if (route.distance > user.maxDistance) return { ok: false, reason: 'Distance/range limit' }
  return { ok: true, reason: 'Legal' }
}

function isLegal(user, station, route) {
  return baseLegalStatus(user, station, route).ok
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
  const reasonCounts = {
    noRoute: 0,
    capacity: 0,
    time: 0,
    distance: 0
  }

  for (const user of scenario.users) {
    domains[user.id] = []
    for (const station of scenario.stations) {
      const route = astar.aStarSearch(user.id, station.id)
      const status = baseLegalStatus(user, station, route)
      if (!status.ok) {
        if (status.reason === 'No route') reasonCounts.noRoute += 1
        if (status.reason === 'Capacity < demand') reasonCounts.capacity += 1
        if (status.reason === 'Time mismatch') reasonCounts.time += 1
        if (status.reason === 'Distance/range limit') reasonCounts.distance += 1
        continue
      }
      domains[user.id].push({
        stationId: station.id,
        route,
        score: valueScore(user, station, route),
        prunedReason: null
      })
    }
  }

  return { domains, reasonCounts }
}

export function ac3Preprocess(rawDomains, scenario) {
  const domains = cloneDomains(rawDomains)
  let removed = 0
  let arcChecks = 0
  const queue = []

  for (const xi of scenario.users) {
    for (const xj of scenario.users) {
      if (xi.id !== xj.id) queue.push([xi.id, xj.id])
    }
  }

  while (queue.length > 0) {
    const [xiId, xjId] = queue.shift()
    arcChecks += 1
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

  return { domains, removed, arcChecks }
}

function hasSupport(xiId, xiValue, xjId, domains, scenario) {
  const xi = scenario.users.find((u) => u.id === xiId)
  const xj = scenario.users.find((u) => u.id === xjId)
  const station = scenario.stations.find((s) => s.id === xiValue.stationId)

  if (!xi || !xj || !station) return false

  // If xj has another station option, xiValue is still supported.
  if ((domains[xjId] || []).some((xjValue) => xjValue.stationId !== xiValue.stationId)) return true

  // If both are forced to the same station, station capacity must support both.
  return xi.demand + xj.demand <= station.capacity
}

export function solveCSP(options = {}, scenario = buildScenario(options)) {
  const startTime = performance.now()
  const {
    useAC3 = true,
    useMRV = true,
    useDegree = true,
    useLCV = true,
    useForwardChecking = true,
    useLocalSearch = false,
    maxSearchCalls = 4500
  } = options

  const astar = createAStarContext(scenario.allNodes, scenario.roads)
  const built = buildDomains(scenario, astar)
  const rawDomains = built.domains
  const fullDomainSize = scenario.users.length * scenario.stations.length
  const rawDomainSize = totalDomainSize(rawDomains)
  const nodeConsistencyRemoved = Math.max(0, fullDomainSize - rawDomainSize)
  const ac3Result = useAC3 ? ac3Preprocess(rawDomains, scenario) : { domains: rawDomains, removed: 0, arcChecks: 0 }
  const domains = ac3Result.domains

  const metrics = {
    calls: 0,
    backtracks: 0,
    assignmentsTried: 0,
    consistencyChecks: 0,
    prunedByForwardChecking: 0,
    forwardCheckingRuns: 0,
    ac3Removed: ac3Result.removed,
    ac3ArcChecks: ac3Result.arcChecks,
    nodeConsistencyRemoved,
    fullDomainSize,
    rawDomainSize,
    revisedDomainSize: totalDomainSize(domains),
    domainReductionPercent: 0,
    stoppedByLimit: false,
    localSearchSteps: 0,
    localSearchImprovements: 0,
    localSearchConflicts: 0,
    runtimeMs: 0,
    reasonCounts: built.reasonCounts,
    algorithmLabel: solverLabel({ useAC3, useMRV, useDegree, useLCV, useForwardChecking, useLocalSearch })
  }

  metrics.domainReductionPercent = fullDomainSize
    ? Math.round(((fullDomainSize - metrics.revisedDomainSize) / fullDomainSize) * 100)
    : 0

  const greedy = greedyCOP(domains, scenario, { useLCV })
  const best = { assignment: greedy, score: evaluateAssignment(greedy, scenario) }

  if (useLocalSearch) {
    const local = localSearchCOP(domains, scenario, metrics, { useLCV, maxSteps: Math.max(250, Math.min(2500, maxSearchCalls)) })
    const localScore = evaluateAssignment(local, scenario)
    if (isBetterScore(localScore, best.score)) {
      best.assignment = local
      best.score = localScore
    }
  }

  backtrack(
    {},
    domains,
    emptyUsage(scenario),
    metrics,
    { useMRV, useDegree, useLCV, useForwardChecking, maxSearchCalls },
    scenario,
    best
  )

  metrics.runtimeMs = Number((performance.now() - startTime).toFixed(2))
  return summarizeSolution(best.assignment, domains, metrics, { useAC3, useMRV, useDegree, useLCV, useForwardChecking, useLocalSearch }, scenario, astar.nodesById)
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
    metrics.consistencyChecks += 1
    if (!isConsistent(variable, value, stationUsage, scenario)) continue

    const nextAssignment = { ...assignment, [variable.id]: value }
    const nextUsage = { ...stationUsage, [value.stationId]: stationUsage[value.stationId] + variable.demand }
    const nextDomains = options.useForwardChecking
      ? forwardCheck(variable, value, domains, assignment, nextUsage, metrics, scenario)
      : domains

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
    const mrv = options.useMRV ? (domains[a.id] || []).length - (domains[b.id] || []).length : 0
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
  return station && stationUsage[value.stationId] + user.demand <= station.capacity
}

function forwardCheck(user, value, domains, assignment, nextUsage, metrics, scenario) {
  metrics.forwardCheckingRuns += 1
  const next = cloneDomains(domains)
  for (const other of scenario.users) {
    if (other.id === user.id || other.id in assignment) continue
    const before = next[other.id].length
    next[other.id] = next[other.id].filter((otherValue) => {
      const station = scenario.stations.find((s) => s.id === otherValue.stationId)
      return station && nextUsage[otherValue.stationId] + other.demand <= station.capacity
    })
    metrics.prunedByForwardChecking += Math.max(0, before - next[other.id].length)
  }
  return next
}

function greedyCOP(domains, scenario, options = {}) {
  const assignment = {}
  const stationUsage = emptyUsage(scenario)
  const sortedUsers = [...scenario.users].sort((a, b) => {
    const mrv = (domains[a.id] || []).length - (domains[b.id] || []).length
    return mrv || b.priority - a.priority || b.demand - a.demand
  })

  for (const user of sortedUsers) {
    const values = orderDomainValues(user, domains, assignment, stationUsage, { useLCV: options.useLCV ?? true }, scenario)
    const choice = values.find((value) => isConsistent(user, value, stationUsage, scenario))
    assignment[user.id] = choice || null
    if (choice) stationUsage[choice.stationId] += user.demand
  }
  return assignment
}

function localSearchCOP(domains, scenario, metrics, options = {}) {
  const assignment = greedyCOP(domains, scenario, { useLCV: options.useLCV })
  let usage = usageFromAssignment(assignment, scenario)
  let best = { assignment: { ...assignment }, score: evaluateAssignment(assignment, scenario) }

  for (let step = 0; step < options.maxSteps; step += 1) {
    metrics.localSearchSteps += 1
    const conflicts = conflictedUsers(assignment, usage, scenario)
    metrics.localSearchConflicts += conflicts.length
    const candidates = conflicts.length > 0
      ? conflicts
      : scenario.users.filter((user) => !assignment[user.id] && (domains[user.id] || []).length > 0)

    if (candidates.length === 0) break

    const user = candidates.sort((a, b) => b.priority - a.priority || b.demand - a.demand)[0]
    const nextChoice = minConflictValue(user, domains, assignment, usage, scenario)
    const previous = assignment[user.id]
    if (previous?.stationId === nextChoice?.stationId) continue

    assignment[user.id] = nextChoice || null
    usage = usageFromAssignment(assignment, scenario)
    const score = evaluateAssignment(assignment, scenario)
    if (isBetterScore(score, best.score)) {
      best = { assignment: { ...assignment }, score }
      metrics.localSearchImprovements += 1
    }
  }

  return best.assignment
}

function conflictedUsers(assignment, usage, scenario) {
  const overCapacityStations = new Set(
    scenario.stations.filter((station) => usage[station.id] > station.capacity).map((station) => station.id)
  )
  if (overCapacityStations.size === 0) return []
  return scenario.users.filter((user) => assignment[user.id] && overCapacityStations.has(assignment[user.id].stationId))
}

function minConflictValue(user, domains, assignment, usage, scenario) {
  const values = [...(domains[user.id] || [])]
  if (values.length === 0) return null
  return values.sort((a, b) => {
    const aPenalty = conflictPenalty(user, a, assignment, usage, scenario)
    const bPenalty = conflictPenalty(user, b, assignment, usage, scenario)
    if (aPenalty !== bPenalty) return aPenalty - bPenalty
    return b.score - a.score
  })[0]
}

function conflictPenalty(user, value, assignment, usage, scenario) {
  const current = assignment[user.id]
  const station = scenario.stations.find((s) => s.id === value.stationId)
  const currentReduction = current ? user.demand : 0
  const projected = usage[value.stationId] - (current?.stationId === value.stationId ? currentReduction : 0) + user.demand
  const overCapacity = Math.max(0, projected - station.capacity)
  return overCapacity * 20 + value.route.distance
}

function usageFromAssignment(assignment, scenario) {
  const usage = emptyUsage(scenario)
  for (const [userId, value] of Object.entries(assignment)) {
    if (!value) continue
    const user = scenario.users.find((u) => u.id === userId)
    if (user) usage[value.stationId] += user.demand
  }
  return usage
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
  const totalDistance = rows.reduce((sum, row) => sum + row.distance, 0)
  const totalCapacity = scenario.stations.reduce((sum, station) => sum + station.capacity, 0)
  const capacityUsed = satisfiedDemand
  const overCapacityViolations = stationSummary.filter((s) => s.used > s.capacity).length
  const emptyDomains = scenario.users.filter((user) => (domains[user.id] || []).length === 0).length
  const satisfactionPercent = scenario.users.length ? Math.round((rows.length / scenario.users.length) * 100) : 0

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
      satisfactionPercent,
      satisfiedDemand,
      totalDemand,
      demandCoverage: totalDemand ? Math.round((satisfiedDemand / totalDemand) * 100) : 0,
      priorityCoverage: totalPriority ? Math.round((weightedPriority / totalPriority) * 100) : 0,
      averageDistance: Number(avgDistance.toFixed(2)),
      totalDistance: Number(totalDistance.toFixed(2)),
      totalCapacity,
      capacityUsed,
      capacityUtilization: totalCapacity ? Math.round((capacityUsed / totalCapacity) * 100) : 0,
      constraintViolations: overCapacityViolations,
      emptyDomains
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

function solverLabel(options) {
  const active = []
  if (options.useAC3) active.push('AC-3')
  if (options.useMRV) active.push('MRV')
  if (options.useDegree) active.push('Degree')
  if (options.useLCV) active.push('LCV')
  if (options.useForwardChecking) active.push('Forward checking')
  if (options.useLocalSearch) active.push('Local search')
  return active.length ? active.join(' + ') : 'Plain backtracking'
}

export function compareSolverVariants(baseOptions = {}, scenario = buildScenario(baseOptions)) {
  const shared = {
    ...baseOptions,
    maxSearchCalls: Math.min(Number(baseOptions.maxSearchCalls || 4500), 2200)
  }

  const variants = [
    {
      name: 'Plain backtracking',
      options: { ...shared, useAC3: false, useMRV: false, useDegree: false, useLCV: false, useForwardChecking: false, useLocalSearch: false }
    },
    {
      name: 'Backtracking + AC-3',
      options: { ...shared, useAC3: true, useMRV: false, useDegree: false, useLCV: false, useForwardChecking: false, useLocalSearch: false }
    },
    {
      name: 'AC-3 + MRV + Degree',
      options: { ...shared, useAC3: true, useMRV: true, useDegree: true, useLCV: false, useForwardChecking: false, useLocalSearch: false }
    },
    {
      name: 'AC-3 + MRV + Degree + LCV',
      options: { ...shared, useAC3: true, useMRV: true, useDegree: true, useLCV: true, useForwardChecking: false, useLocalSearch: false }
    },
    {
      name: 'Full CSP with Forward Checking',
      options: { ...shared, useAC3: true, useMRV: true, useDegree: true, useLCV: true, useForwardChecking: true, useLocalSearch: false }
    },
    {
      name: 'Full CSP + Local Search COP',
      options: { ...shared, useAC3: true, useMRV: true, useDegree: true, useLCV: true, useForwardChecking: true, useLocalSearch: true }
    }
  ]

  return variants.map((variant) => {
    const result = solveCSP(variant.options, scenario)
    return {
      name: variant.name,
      options: result.options,
      satisfied: `${result.score.satisfiedUsers}/${result.score.totalUsers}`,
      satisfactionPercent: result.score.satisfactionPercent,
      demandCoverage: result.score.demandCoverage,
      priorityCoverage: result.score.priorityCoverage,
      averageDistance: result.score.averageDistance,
      totalDistance: result.score.totalDistance,
      calls: result.metrics.calls,
      backtracks: result.metrics.backtracks,
      tried: result.metrics.assignmentsTried,
      ac3Removed: result.metrics.ac3Removed,
      forwardPruned: result.metrics.prunedByForwardChecking,
      localSteps: result.metrics.localSearchSteps,
      runtimeMs: result.metrics.runtimeMs,
      domainReductionPercent: result.metrics.domainReductionPercent,
      stoppedByLimit: result.metrics.stoppedByLimit
    }
  })
}
