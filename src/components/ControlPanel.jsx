import { BrainCircuit, Route, Settings2, SlidersHorizontal } from 'lucide-react'
import { stationPool, userPool } from '../data'

export default function ControlPanel({ options, setOptions, solution, selectedUserId, setSelectedUserId }) {
  const selectedRow = solution.rows.find((row) => row.userId === selectedUserId) || solution.rows[0]

  function toggle(key) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function setNumber(key, value) {
    setOptions((prev) => ({ ...prev, [key]: Number(value) }))
  }

  return (
    <aside className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Problem Scale Sliders</h2>
        </div>
        <div className="space-y-4">
          <Slider label="Active users" value={options.userCount} min={8} max={userPool.length} step={1} suffix={` / ${userPool.length}`} onChange={(v) => setNumber('userCount', v)} />
          <Slider label="Active fuel stations" value={options.stationCount} min={4} max={stationPool.length} step={1} suffix={` / ${stationPool.length}`} onChange={(v) => setNumber('stationCount', v)} />
          <Slider label="Fuel supply level" value={options.capacityScale} min={35} max={130} step={5} suffix="%" onChange={(v) => setNumber('capacityScale', v)} />
          <DistanceModeSelector value={options.distanceMode} onChange={(value) => setOptions((prev) => ({ ...prev, distanceMode: value }))} />
          <Slider label="Manual distance tolerance boost" value={options.maxDistanceBoost} min={0} max={8} step={1} suffix=" km" onChange={(v) => setNumber('maxDistanceBoost', v)} />
          <Slider label="Current fuel level" value={options.currentFuelScale} min={25} max={200} step={5} suffix="%" onChange={(v) => setNumber('currentFuelScale', v)} />
          <Slider label="Fuel safety reserve" value={options.reserveDistance} min={0} max={5} step={0.5} suffix=" km" onChange={(v) => setNumber('reserveDistance', v)} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">CSP Heuristic Controls</h2>
        </div>
        <div className="space-y-3">
          <Toggle label="AC-3 preprocessing" checked={options.useAC3} onChange={() => toggle('useAC3')} />
          <Toggle label="MRV / Most Constrained Variable" checked={options.useMRV} onChange={() => toggle('useMRV')} />
          <Toggle label="Degree Heuristic tie-breaker" checked={options.useDegree} onChange={() => toggle('useDegree')} />
          <Toggle label="LCV / Least Constraining Value" checked={options.useLCV} onChange={() => toggle('useLCV')} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <Route className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">A* Route Search</h2>
        </div>
        <select
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
          value={selectedRow?.userId || ''}
          onChange={(event) => setSelectedUserId(event.target.value)}
        >
          {solution.rows.map((row) => (
            <option key={row.userId} value={row.userId}>{row.userName} → {row.stationArea}</option>
          ))}
        </select>
        {selectedRow ? (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            <p><span className="font-semibold">Path:</span> {selectedRow.pathNames.join(' → ')}</p>
            <p><span className="font-semibold">Distance:</span> {selectedRow.distance} km</p>
            <p><span className="font-semibold">Vehicle:</span> {selectedRow.vehicleType}</p>
            <p><span className="font-semibold">Current fuel:</span> {selectedRow.currentFuel} L · {selectedRow.kmPerLiter} km/L</p>
            <p><span className="font-semibold">Allowed range:</span> {selectedRow.maxDistance} km ({selectedRow.distanceMode === 'fuelBased' ? 'fuel-based' : 'manual tolerance'})</p>
            <p><span className="font-semibold">A* nodes expanded:</span> {selectedRow.nodesExpanded}</p>
            <p><span className="font-semibold">Heuristic:</span> h(n) = straight-line distance to station</p>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">No user is currently assigned. Increase fuel supply or distance tolerance.</div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Solver Metrics</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <SmallMetric label="Calls" value={solution.metrics.calls} />
          <SmallMetric label="Backtracks" value={solution.metrics.backtracks} />
          <SmallMetric label="Tried" value={solution.metrics.assignmentsTried} />
          <SmallMetric label="Forward pruned" value={solution.metrics.prunedByForwardChecking} />
          <SmallMetric label="AC-3 removed" value={solution.metrics.ac3Removed} />
          <SmallMetric label="Domains" value={`${solution.metrics.revisedDomainSize}/${solution.metrics.rawDomainSize}`} />
        </div>
        {solution.metrics.stoppedByLimit && <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs text-amber-700">Search reached the safety limit, so the displayed answer is the best COP solution found so far.</p>}
      </section>

      {solution.unassignedUsers.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Unsatisfied Users</h2>
          <div className="max-h-40 space-y-2 overflow-auto text-sm text-slate-600">
            {solution.unassignedUsers.map((user) => (
              <p key={user.id} className="rounded-2xl bg-slate-50 px-3 py-2">{user.name} · {user.area} · legal options: {user.legalOptions}</p>
            ))}
          </div>
        </section>
      )}
    </aside>
  )
}

function Slider({ label, value, min, max, step, suffix, onChange }) {
  return (
    <label className="block rounded-2xl bg-slate-50 px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
        <span>{label}</span>
        <span className="font-bold text-slate-900">{value}{suffix}</span>
      </div>
      <input className="w-full accent-indigo-600" type="range" value={value} min={min} max={max} step={step} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

function DistanceModeSelector({ value, onChange }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
      <p className="mb-2 font-semibold text-slate-700">Max distance source</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange('manual')}
          className={`rounded-xl px-3 py-2 font-medium ${value === 'manual' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
        >
          Manual tolerance
        </button>
        <button
          type="button"
          onClick={() => onChange('fuelBased')}
          className={`rounded-xl px-3 py-2 font-medium ${value === 'fuelBased' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
        >
          Current fuel
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Manual uses user max distance + boost. Current fuel uses current fuel × vehicle km/L − safety reserve.
      </p>
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input type="checkbox" className="h-5 w-5 accent-indigo-600" checked={checked} onChange={onChange} />
    </label>
  )
}

function SmallMetric({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  )
}
