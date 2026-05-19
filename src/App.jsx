import { useEffect, useMemo, useState } from 'react'
import { Fuel, MapPinned, Network, Maximize2, Minimize2 } from 'lucide-react'
import MapView from './components/MapView'
import ControlPanel from './components/ControlPanel'
import MetricCard from './components/MetricCard'
import { solveCSP } from './utils/cspSolver'
import { buildScenario, stationPool, userPool } from './data'

export default function App() {
  const [options, setOptions] = useState({
    useAC3: true,
    useMRV: true,
    useDegree: true,
    useLCV: true,
    userCount: 24,
    stationCount: 8,
    capacityScale: 70,
    maxDistanceBoost: 1,
    distanceMode: 'manual',
    currentFuelScale: 100,
    reserveDistance: 1,
    maxSearchCalls: 4500
  })

  const [isMapFullscreen, setIsMapFullscreen] = useState(false)

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
  const [selectedUserId, setSelectedUserId] = useState('')

  useEffect(() => {
    if (!solution.rows.some((row) => row.userId === selectedUserId)) {
      setSelectedUserId(solution.rows[0]?.userId || '')
    }
  }, [solution.rows, selectedUserId])

  useEffect(() => {
    if (isMapFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMapFullscreen])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 font-display text-slate-900">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-soft">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-indigo-100">
                <MapPinned className="h-4 w-4" /> Dhaka Fuel Crisis CSP + OpenStreetMap + A*
              </p>

              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
                AI Map Project 2
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                A CSP/COP fuel allocation simulator for Motijheel, Shahbag, Mirpur,
                Dhanmondi, Nilkhet, Paltan, Shantinagar, and Jatrabari. Users are
                variables, reachable fuel stations are domains, and constraints include
                station capacity, time window, maximum route distance, current fuel based
                range, and priority.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-3xl bg-white/10 p-4 text-center backdrop-blur">
              <HeroStat label="Active Users" value={`${scenario.users.length}/${userPool.length}`} />
              <HeroStat label="Stations" value={`${scenario.stations.length}/${stationPool.length}`} />
              <HeroStat label="Solver" value="A* + CSP" />
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <MetricCard
            label="Satisfied users"
            value={`${solution.score.satisfiedUsers}/${solution.score.totalUsers}`}
            sub="Legal allocations found"
          />
          <MetricCard
            label="Demand coverage"
            value={`${solution.score.demandCoverage}%`}
            sub={`${solution.score.satisfiedDemand}/${solution.score.totalDemand} liters`}
          />
          <MetricCard
            label="Priority coverage"
            value={`${solution.score.priorityCoverage}%`}
            sub="Weighted by emergency need"
          />
          <MetricCard
            label="Average distance"
            value={`${solution.score.averageDistance} km`}
            sub="A* route distance"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_390px]">
          <div
            className={
              isMapFullscreen
                ? 'fixed inset-0 z-[9999] bg-slate-950 p-4'
                : 'relative h-[calc(100vh-180px)] min-h-[680px]'
            }
          >
            <button
              onClick={() => setIsMapFullscreen((prev) => !prev)}
              className="absolute right-6 top-6 z-[10000] inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-lg hover:bg-slate-100"
            >
              {isMapFullscreen ? (
                <>
                  <Minimize2 className="h-4 w-4" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4" />
                  Fullscreen Map
                </>
              )}
            </button>

            <MapView
              scenario={scenario}
              solution={solution}
              selectedUserId={selectedUserId}
              onSelectUser={setSelectedUserId}
              isFullscreen={isMapFullscreen}
            />
          </div>

          {!isMapFullscreen && (
            <ControlPanel
              options={options}
              setOptions={setOptions}
              solution={solution}
              selectedUserId={selectedUserId}
              setSelectedUserId={setSelectedUserId}
            />
          )}
        </section>

        {!isMapFullscreen && (
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="mb-4 flex items-center gap-2">
                <Network className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-bold">CSP Formulation</h2>
              </div>

              <div className="space-y-3 text-sm leading-6 text-slate-700">
                <p>
                  <strong>Real problem:</strong> fuel crisis and limited resource
                  distribution across Dhaka fuel stations.
                </p>
                <p>
                  <strong>Variables:</strong> each user/fuel request from Motijheel,
                  Shahbag, Mirpur, Dhanmondi, Nilkhet, Paltan, Shantinagar, and Jatrabari.
                </p>
                <p>
                  <strong>Domains:</strong> the legal station choices reachable through
                  the road graph using A* route search. The distance domain can be
                  filtered by either manual tolerance or current-fuel range.
                </p>
                <p>
                  <strong>Hard constraints:</strong> station capacity, opening time vs
                  user availability, maximum route distance, current fuel vehicle range,
                  and no over-allocation.
                </p>
                <p>
                  <strong>Heuristics:</strong> AC-3 preprocessing reduces domains; MRV
                  chooses the user with fewest legal stations; Degree breaks ties using
                  conflict count; LCV chooses the station that keeps the most future
                  options open.
                </p>
                <p>
                  <strong>COP relaxation:</strong> when all users cannot be satisfied,
                  the solver maximizes priority and demand coverage instead of returning
                  zero result.
                </p>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="mb-4 flex items-center gap-2">
                <Fuel className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-bold">Final Allocation Table</h2>
              </div>

              <div className="max-h-[360px] overflow-auto rounded-2xl border border-slate-100">
                <table className="min-w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Area</th>
                      <th className="px-4 py-3">Station</th>
                      <th className="px-4 py-3">Demand</th>
                      <th className="px-4 py-3">Current fuel</th>
                      <th className="px-4 py-3">Distance</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {solution.rows.map((row) => (
                      <tr
                        key={row.userId}
                        className="cursor-pointer hover:bg-indigo-50/60"
                        onClick={() => setSelectedUserId(row.userId)}
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {row.userName}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{row.userArea}</td>
                        <td className="px-4 py-3 text-slate-600">{row.stationName}</td>
                        <td className="px-4 py-3 text-slate-600">{row.demand} L</td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.currentFuel} L
                        </td>
                        <td className="px-4 py-3 text-slate-600">{row.distance} km</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        )}
      </section>
    </main>
  )
}

function HeroStat({ label, value }) {
  return (
    <div>
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-widest text-slate-300">
        {label}
      </p>
    </div>
  )
}