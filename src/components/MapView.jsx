import { useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  useMap
} from 'react-leaflet'
import L from 'leaflet'

const stationIcon = new L.DivIcon({
  className: 'custom-marker station-marker',
  html: '<div>⛽</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17]
})

const userIcon = new L.DivIcon({
  className: 'custom-marker user-marker',
  html: '<div>👤</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
})

const areaIcon = new L.DivIcon({
  className: 'custom-marker area-marker',
  html: '<div>•</div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
})

function ResizeMap({ isFullscreen }) {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => clearTimeout(timer)
  }, [map, isFullscreen])

  return null
}

export default function MapView({
  scenario,
  solution,
  selectedUserId,
  onSelectUser,
  isFullscreen = false
}) {
  const nodesById = Object.fromEntries(scenario.allNodes.map((node) => [node.id, node]))
  const selected = solution.rows.find((row) => row.userId === selectedUserId) || solution.rows[0]
  const pathPositions = selected?.path?.map((id) => [nodesById[id].lat, nodesById[id].lng]) || []
  const assignedUserIds = new Set(solution.rows.map((row) => row.userId))
  const assignedStationIds = new Set(solution.rows.map((row) => row.stationId))

  return (
    <div
      className={
        isFullscreen
          ? 'h-full w-full overflow-hidden rounded-2xl border border-slate-700 bg-white shadow-soft'
          : 'h-full w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft'
      }
    >
      <MapContainer
        center={[23.756, 90.401]}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <ResizeMap isFullscreen={isFullscreen} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {scenario.roads.map(([a, b]) => {
          const from = nodesById[a]
          const to = nodesById[b]

          if (!from || !to) return null

          return (
            <Polyline
              key={`${a}-${b}`}
              positions={[
                [from.lat, from.lng],
                [to.lat, to.lng]
              ]}
              pathOptions={{ weight: 1, opacity: 0.25 }}
            />
          )
        })}

        {scenario.areaNodes.map((area) => (
          <Marker key={area.id} position={[area.lat, area.lng]} icon={areaIcon}>
            <Popup>
              <strong>{area.area}</strong>
              <br />
              Road graph junction
            </Popup>
          </Marker>
        ))}

        {scenario.stations.map((station) => {
          const used = solution.stationSummary.find((s) => s.id === station.id)?.used || 0

          return (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={stationIcon}
            >
              <Popup>
                <strong>{station.name}</strong>
                <br />
                Area: {station.area}
                <br />
                Capacity: {station.capacity} L
                <br />
                Used: {used} L
                <br />
                Remaining: {station.capacity - used} L
                <br />
                Status: {assignedStationIds.has(station.id) ? 'Assigned' : 'Available'}
                <br />
                Open: {station.openFrom}:00 - {station.openTo}:00
              </Popup>
            </Marker>
          )
        })}

        {scenario.users.map((user) => (
          <Marker
            key={user.id}
            position={[user.lat, user.lng]}
            icon={userIcon}
            eventHandlers={{
              click: () => onSelectUser(user.id)
            }}
          >
            <Popup>
              <strong>{user.name}</strong>
              <br />
              Area: {user.area}
              <br />
              Vehicle: {user.vehicleType}
              <br />
              Demand: {user.demand} L
              <br />
              Current fuel: {user.currentFuel} L
              <br />
              Mileage: {user.kmPerLiter} km/L
              <br />
              Manual range: {user.manualRange} km
              <br />
              Fuel-based range: {user.fuelBasedRange} km
              <br />
              Priority: {user.priority}
              <br />
              Active Max Distance: {user.maxDistance} km
              <br />
              Assigned: {assignedUserIds.has(user.id) ? 'Yes' : 'No'}
            </Popup>
          </Marker>
        ))}

        {pathPositions.length > 1 && (
          <>
            <Polyline
              positions={pathPositions}
              pathOptions={{ weight: 6, opacity: 0.85 }}
            />

            {pathPositions.map((position, index) => (
              <CircleMarker
                key={index}
                center={position}
                radius={5}
                pathOptions={{ weight: 2 }}
              />
            ))}
          </>
        )}
      </MapContainer>
    </div>
  )
}