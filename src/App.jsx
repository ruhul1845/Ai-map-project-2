import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Fuel, MapPinned, Network } from 'lucide-react'
import MapView from './components/MapView'
import ControlPanel from './components/ControlPanel'
import MetricCard from './components/MetricCard'
import { compareSolverVariants, solveCSP } from './utils/cspSolver'
import { buildScenario, stationPool, userPool } from './data'

export default function App() {
  const [options, setOptions] = useState({
    useAC3: true,
    useMRV: true,
    useDegree: true,
    useLCV: true,
    useForwardChecking: true,
    useMAC: false,
    useBackjumping: false,
    useLocalSearch: false,
    userCount: 24,
    stationCount: 8,
    capacityScale: 70,
    maxDistanceBoost: 1,
    distanceMode: 'manual',
    currentFuelScale: 100,
    reserveDistance: 1,
    maxSearchCalls: 4500
  })

  const scenario = useMemo(
    () => buildScenario(options),
    [
      options.userCount,
      options.stationCount,
      options.capacityScale,
      options.maxDistanceBoost,
      options.distanceMode,
      options.currentFuelScale,
      options.reserveDistance
    ]
  )

  const solution = useMemo(() => solveCSP(options, scenario), [options, scenario])
  const comparisonRows = useMemo(() => compareSolverVariants(options, scenario), [options, scenario])
  const [selectedUserId, setSelectedUserId] = useState('')

  useEffect(() => {
    if (!solution.rows.some((row) => row.userId === selectedUserId)) {
      setSelectedUserId(solution.rows[0]?.userId || '')
    }
  }, [solution.rows, selectedUserId])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 font-display text-slate-900">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-soft">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-indigo-100">
                <MapPinned className="h-4 w-4" /> Dhaka Fuel Crisis CSP + OpenStreetMap
              </p>
              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">AI Map Project 2</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                A CSP/COP fuel allocation simulator for Motijheel, Shahbag, Mirpur, Dhanmondi, Nilkhet, Paltan, Shantinagar, and Jatrabari. Users are variables, reachable fuel stations are domains, and constraints include station capacity, time window, route distance, current fuel based range, and priority.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-3xl bg-white/10 p-4 text-center backdrop-blur">
              <HeroStat label="Active Users" value={`${scenario.users.length}/${userPool.length}`} />
              <HeroStat label="Stations" value={`${scenario.stations.length}/${stationPool.length}`} />
              <HeroStat label="Solver" value="CSP/COP" />
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <MetricCard label="Satisfied users" value={`${solution.score.satisfiedUsers}/${solution.score.totalUsers}`} sub={`${solution.score.satisfactionPercent}% satisfied`} />
          <MetricCard label="Demand coverage" value={`${solution.score.demandCoverage}%`} sub={`${solution.score.satisfiedDemand}/${solution.score.totalDemand} liters`} />
          <MetricCard label="Priority coverage" value={`${solution.score.priorityCoverage}%`} sub="Weighted by emergency need" />
          <MetricCard label="Average distance" value={`${solution.score.averageDistance} km`} sub="Route distance on map graph" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_390px]">
          <MapView scenario={scenario} solution={solution} selectedUserId={selectedUserId} onSelectUser={setSelectedUserId} />
          <ControlPanel options={options} setOptions={setOptions} />
        </section>

        <ResultsDashboard
          solution={solution}
          comparisonRows={comparisonRows}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
        />

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <Network className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-bold">CSP Formulation</h2>
            </div>
            <div className="space-y-3 text-sm leading-6 text-slate-700">
              <p><strong>Variables:</strong> each user/fuel request from Dhaka areas.</p>
              <p><strong>Domains:</strong> legal fuel station choices for each user after capacity, time, distance, current fuel, and route checks.</p>
              <p><strong>Node consistency:</strong> removes individually invalid station values before search.</p>
              <p><strong>Arc consistency / AC-3:</strong> removes unsupported values when users compete for the same limited station capacity.</p>
              <p><strong>Heuristics:</strong> MRV selects the most constrained user, Degree breaks ties, LCV chooses the least damaging station value, Forward Checking prunes future domains, MAC maintains arc consistency after each assignment, Backjumping jumps to the real conflict variable, and Local Search improves the COP result when complete satisfaction is hard.</p>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <Fuel className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-bold">Station Capacity Summary</h2>
            </div>
            <div className="max-h-[360px] overflow-auto rounded-2xl border border-slate-100">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Station</th>
                    <th className="px-4 py-3">Area</th>
                    <th className="px-4 py-3">Used</th>
                    <th className="px-4 py-3">Remaining</th>
                    <th className="px-4 py-3">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {solution.stationSummary.map((station) => (
                    <tr key={station.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{station.name}</td>
                      <td className="px-4 py-3 text-slate-600">{station.area}</td>
                      <td className="px-4 py-3 text-slate-600">{station.used} L</td>
                      <td className="px-4 py-3 text-slate-600">{station.remaining} L</td>
                      <td className="px-4 py-3 text-slate-600">{station.utilization}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </section>
    </main>
  )
}

function ResultsDashboard({ solution, comparisonRows, selectedUserId, setSelectedUserId }) {
  const metricRows = [
    ['Active solver', solution.metrics.algorithmLabel],
    ['Satisfied users', `${solution.score.satisfiedUsers}/${solution.score.totalUsers} (${solution.score.satisfactionPercent}%)`],
    ['Unsatisfied users', solution.score.unsatisfiedUsers],
    ['Demand coverage', `${solution.score.demandCoverage}% (${solution.score.satisfiedDemand}/${solution.score.totalDemand} L)`],
    ['Priority coverage', `${solution.score.priorityCoverage}%`],
    ['Total route distance', `${solution.score.totalDistance} km`],
    ['Average route distance', `${solution.score.averageDistance} km`],
    ['Capacity utilization', `${solution.score.capacityUtilization}% (${solution.score.capacityUsed}/${solution.score.totalCapacity} L)`],
    ['Constraint violations', solution.score.constraintViolations],
    ['Users with empty domains', solution.score.emptyDomains],
    ['Full domain size', solution.metrics.fullDomainSize],
    ['After node consistency', `${solution.metrics.rawDomainSize} values`],
    ['Node consistency removed', solution.metrics.nodeConsistencyRemoved],
    ['AC-3 removed', solution.metrics.ac3Removed],
    ['AC-3 arc checks', solution.metrics.ac3ArcChecks],
    ['Final domain size', solution.metrics.revisedDomainSize],
    ['Domain reduction', `${solution.metrics.domainReductionPercent}%`],
    ['Backtracking calls', solution.metrics.calls],
    ['Assignments tried', solution.metrics.assignmentsTried],
    ['Consistency checks', solution.metrics.consistencyChecks],
    ['Backtracks', solution.metrics.backtracks],
    ['Forward checking runs', solution.metrics.forwardCheckingRuns],
    ['Forward checking pruned', solution.metrics.prunedByForwardChecking],
    ['MAC runs', solution.metrics.macRuns],
    ['MAC arc checks', solution.metrics.macArcChecks],
    ['MAC removed values', solution.metrics.macRemoved],
    ['MAC failures', solution.metrics.macFailures],
    ['Backjump checks', solution.metrics.backjumpChecks],
    ['Backjumps', solution.metrics.backjumps],
    ['Backjump pruned branches', solution.metrics.backjumpPrunedBranches],
    ['Conflict set total', solution.metrics.conflictSetSizeTotal],
    ['Local search steps', solution.metrics.localSearchSteps],
    ['Local improvements', solution.metrics.localSearchImprovements],
    ['Runtime', `${solution.metrics.runtimeMs} ms`],
    ['Stopped by safety limit', solution.metrics.stoppedByLimit ? 'Yes' : 'No']
  ]

  return (
    <section className="mt-8 space-y-6">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-bold">Detailed Solver Metrics</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metricRows.map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-xl font-bold">Comparison Table: Algorithm / Heuristic Effect</h2>
        <div className="overflow-auto rounded-2xl border border-slate-100">
          <table className="min-w-[1320px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Satisfied</th>
                <th className="px-4 py-3">Demand</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Avg Dist.</th>
                <th className="px-4 py-3">Calls</th>
                <th className="px-4 py-3">Backtracks</th>
                <th className="px-4 py-3">Tried</th>
                <th className="px-4 py-3">AC-3 Removed</th>
                <th className="px-4 py-3">Forward Pruned</th>
                <th className="px-4 py-3">MAC Removed</th>
                <th className="px-4 py-3">MAC Checks</th>
                <th className="px-4 py-3">Backjumps</th>
                <th className="px-4 py-3">BJ Pruned</th>
                <th className="px-4 py-3">Local Steps</th>
                <th className="px-4 py-3">Domain ↓</th>
                <th className="px-4 py-3">Runtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonRows.map((row) => (
                <tr key={row.name} className="hover:bg-indigo-50/40">
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.name}</td>
                  <td className="px-4 py-3 text-slate-600">{row.satisfied}</td>
                  <td className="px-4 py-3 text-slate-600">{row.demandCoverage}%</td>
                  <td className="px-4 py-3 text-slate-600">{row.priorityCoverage}%</td>
                  <td className="px-4 py-3 text-slate-600">{row.averageDistance} km</td>
                  <td className="px-4 py-3 text-slate-600">{row.calls}</td>
                  <td className="px-4 py-3 text-slate-600">{row.backtracks}</td>
                  <td className="px-4 py-3 text-slate-600">{row.tried}</td>
                  <td className="px-4 py-3 text-slate-600">{row.ac3Removed}</td>
                  <td className="px-4 py-3 text-slate-600">{row.forwardPruned}</td>
                  <td className="px-4 py-3 text-slate-600">{row.macRemoved}</td>
                  <td className="px-4 py-3 text-slate-600">{row.macArcChecks}</td>
                  <td className="px-4 py-3 text-slate-600">{row.backjumps}</td>
                  <td className="px-4 py-3 text-slate-600">{row.backjumpPrunedBranches}</td>
                  <td className="px-4 py-3 text-slate-600">{row.localSteps}</td>
                  <td className="px-4 py-3 text-slate-600">{row.domainReductionPercent}%</td>
                  <td className="px-4 py-3 text-slate-600">{row.runtimeMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-xl font-bold">Final Allocation Table</h2>
        <div className="max-h-[420px] overflow-auto rounded-2xl border border-slate-100">
          <table className="min-w-[950px] text-left text-sm">
            <thead className="sticky top-0 bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Station</th>
                <th className="px-4 py-3">Demand</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Current Fuel</th>
                <th className="px-4 py-3">Allowed Range</th>
                <th className="px-4 py-3">Distance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {solution.rows.map((row) => (
                <tr
                  key={row.userId}
                  className={`cursor-pointer hover:bg-indigo-50/60 ${selectedUserId === row.userId ? 'bg-indigo-50' : ''}`}
                  onClick={() => setSelectedUserId(row.userId)}
                >
                  <td className="px-4 py-3 font-medium text-slate-900">{row.userName}</td>
                  <td className="px-4 py-3 text-slate-600">{row.userArea}</td>
                  <td className="px-4 py-3 text-slate-600">{row.stationName}</td>
                  <td className="px-4 py-3 text-slate-600">{row.demand} L</td>
                  <td className="px-4 py-3 text-slate-600">{row.priority}</td>
                  <td className="px-4 py-3 text-slate-600">{row.vehicleType}</td>
                  <td className="px-4 py-3 text-slate-600">{row.currentFuel} L</td>
                  <td className="px-4 py-3 text-slate-600">{row.maxDistance} km</td>
                  <td className="px-4 py-3 text-slate-600">{row.distance} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {solution.unassignedUsers.length > 0 && (
          <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-bold">Unsatisfied users</p>
            <p className="mt-1">
              {solution.unassignedUsers.map((user) => `${user.name} (${user.legalOptions} legal options)`).join(' · ')}
            </p>
          </div>
        )}
      </article>
    </section>
  )
}

function HeroStat({ label, value }) {
  return (
    <div>
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-widest text-slate-300">{label}</p>
    </div>
  )
}
