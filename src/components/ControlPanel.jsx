import { BrainCircuit, Settings2, SlidersHorizontal } from 'lucide-react'
import { stationPool, userPool } from '../data'

export default function ControlPanel({ options, setOptions }) {
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
          <Slider label="Search safety limit" value={options.maxSearchCalls} min={500} max={8000} step={500} suffix=" calls" onChange={(v) => setNumber('maxSearchCalls', v)} />
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
          <Toggle label="Forward Checking" checked={options.useForwardChecking} onChange={() => toggle('useForwardChecking')} />
          <Toggle label="Local Search / Min-conflict COP" checked={options.useLocalSearch} onChange={() => toggle('useLocalSearch')} />
        </div>
        <div className="mt-4 rounded-2xl bg-indigo-50 p-4 text-xs leading-5 text-indigo-900">
          Turning these controls on/off immediately changes the assignment result, domain pruning, search calls, backtracks, runtime, and comparison metrics below the map.
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Active Solver</h2>
        </div>
        <div className="space-y-2 text-sm text-slate-700">
          <p><span className="font-semibold">AC-3:</span> {options.useAC3 ? 'On' : 'Off'}</p>
          <p><span className="font-semibold">Variable ordering:</span> {options.useMRV ? 'MRV enabled' : 'Static priority order'}</p>
          <p><span className="font-semibold">Tie-breaker:</span> {options.useDegree ? 'Degree heuristic' : 'Priority/demand order'}</p>
          <p><span className="font-semibold">Value ordering:</span> {options.useLCV ? 'LCV enabled' : 'Score order'}</p>
          <p><span className="font-semibold">Inference during search:</span> {options.useForwardChecking ? 'Forward checking enabled' : 'No forward checking'}</p>
          <p><span className="font-semibold">COP improvement:</span> {options.useLocalSearch ? 'Local search enabled' : 'Backtracking/COP only'}</p>
        </div>
      </section>
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
    <label className={`flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${checked ? 'bg-indigo-50 text-indigo-900 ring-1 ring-indigo-200' : 'bg-slate-50 text-slate-700'}`}>
      <span>{label}</span>
      <input type="checkbox" className="h-5 w-5 accent-indigo-600" checked={checked} onChange={onChange} />
    </label>
  )
}
