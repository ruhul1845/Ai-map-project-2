export const areaNodes = [
  { id: 'A_MOTIJHEEL', type: 'area', area: 'Motijheel', name: 'Motijheel Junction', lat: 23.7330, lng: 90.4172 },
  { id: 'A_SHAHBAG', type: 'area', area: 'Shahbag', name: 'Shahbag Junction', lat: 23.7383, lng: 90.3957 },
  { id: 'A_MIRPUR', type: 'area', area: 'Mirpur', name: 'Mirpur-10 Junction', lat: 23.8067, lng: 90.3686 },
  { id: 'A_DHANMONDI', type: 'area', area: 'Dhanmondi', name: 'Dhanmondi-27 Junction', lat: 23.7465, lng: 90.3760 },
  { id: 'A_NILKHET', type: 'area', area: 'Nilkhet', name: 'Nilkhet Junction', lat: 23.7336, lng: 90.3842 },
  { id: 'A_PALTAN', type: 'area', area: 'Paltan', name: 'Paltan Junction', lat: 23.7368, lng: 90.4147 },
  { id: 'A_SHANTINAGAR', type: 'area', area: 'Shantinagar', name: 'Shantinagar Junction', lat: 23.7489, lng: 90.4149 },
  { id: 'A_JATRABARI', type: 'area', area: 'Jatrabari', name: 'Jatrabari Junction', lat: 23.7104, lng: 90.4349 }
]

export const stationPool = [
  { id: 'S1', type: 'station', name: 'Motijheel Central Fuel Hub', area: 'Motijheel', lat: 23.7318, lng: 90.4184, capacity: 170, openFrom: 6, openTo: 23 },
  { id: 'S2', type: 'station', name: 'Shahbag Emergency Pump', area: 'Shahbag', lat: 23.7392, lng: 90.3938, capacity: 145, openFrom: 7, openTo: 22 },
  { id: 'S3', type: 'station', name: 'Mirpur 10 Supply Station', area: 'Mirpur', lat: 23.8079, lng: 90.3697, capacity: 210, openFrom: 6, openTo: 23 },
  { id: 'S4', type: 'station', name: 'Dhanmondi Road Pump', area: 'Dhanmondi', lat: 23.7478, lng: 90.3744, capacity: 130, openFrom: 8, openTo: 21 },
  { id: 'S5', type: 'station', name: 'Nilkhet University Pump', area: 'Nilkhet', lat: 23.7348, lng: 90.3824, capacity: 95, openFrom: 8, openTo: 20 },
  { id: 'S6', type: 'station', name: 'Paltan Transit Fuel Point', area: 'Paltan', lat: 23.7358, lng: 90.4129, capacity: 125, openFrom: 7, openTo: 22 },
  { id: 'S7', type: 'station', name: 'Shantinagar City Pump', area: 'Shantinagar', lat: 23.7496, lng: 90.4162, capacity: 110, openFrom: 7, openTo: 21 },
  { id: 'S8', type: 'station', name: 'Jatrabari South Gate Station', area: 'Jatrabari', lat: 23.7096, lng: 90.4367, capacity: 160, openFrom: 6, openTo: 22 },
  { id: 'S9', type: 'station', name: 'Mirpur Hospital Reserve Pump', area: 'Mirpur', lat: 23.8008, lng: 90.3652, capacity: 100, openFrom: 9, openTo: 19 },
  { id: 'S10', type: 'station', name: 'Dhanmondi Lake Fuel Booth', area: 'Dhanmondi', lat: 23.7521, lng: 90.3811, capacity: 85, openFrom: 10, openTo: 20 },
  { id: 'S11', type: 'station', name: 'Motijheel Night Reserve', area: 'Motijheel', lat: 23.7278, lng: 90.4218, capacity: 90, openFrom: 16, openTo: 24 },
  { id: 'S12', type: 'station', name: 'Jatrabari Cargo Fuel Depot', area: 'Jatrabari', lat: 23.7141, lng: 90.4411, capacity: 140, openFrom: 5, openTo: 18 }
]

export const userPool = [
  { id: 'U1', type: 'user', name: 'Motijheel Ambulance Team', area: 'Motijheel', vehicleType: 'Ambulance', lat: 23.7345, lng: 90.4201, baseCurrentFuel: 4.5, kmPerLiter: 7.5, demand: 42, priority: 5, availableFrom: 8, availableTo: 14, maxDistance: 10 },
  { id: 'U2', type: 'user', name: 'Shahbag Hospital Van', area: 'Shahbag', vehicleType: 'Hospital Van', lat: 23.7406, lng: 90.3971, baseCurrentFuel: 5.2, kmPerLiter: 8.0, demand: 38, priority: 5, availableFrom: 7, availableTo: 15, maxDistance: 9 },
  { id: 'U3', type: 'user', name: 'Mirpur School Bus 1', area: 'Mirpur', vehicleType: 'School Bus', lat: 23.8116, lng: 90.3715, baseCurrentFuel: 6.0, kmPerLiter: 5.5, demand: 34, priority: 4, availableFrom: 9, availableTo: 16, maxDistance: 8 },
  { id: 'U4', type: 'user', name: 'Dhanmondi Food Supply Van', area: 'Dhanmondi', vehicleType: 'Supply Van', lat: 23.7488, lng: 90.3720, baseCurrentFuel: 4.0, kmPerLiter: 9.0, demand: 28, priority: 4, availableFrom: 10, availableTo: 18, maxDistance: 8 },
  { id: 'U5', type: 'user', name: 'Nilkhet Book Market Carrier', area: 'Nilkhet', vehicleType: 'Mini Carrier', lat: 23.7333, lng: 90.3865, baseCurrentFuel: 3.5, kmPerLiter: 10.0, demand: 22, priority: 3, availableFrom: 11, availableTo: 19, maxDistance: 7 },
  { id: 'U6', type: 'user', name: 'Paltan Police Patrol', area: 'Paltan', vehicleType: 'Patrol Car', lat: 23.7385, lng: 90.4122, baseCurrentFuel: 4.8, kmPerLiter: 9.5, demand: 30, priority: 5, availableFrom: 8, availableTo: 18, maxDistance: 7 },
  { id: 'U7', type: 'user', name: 'Shantinagar Office Shuttle', area: 'Shantinagar', vehicleType: 'Microbus', lat: 23.7510, lng: 90.4129, baseCurrentFuel: 4.2, kmPerLiter: 7.0, demand: 24, priority: 3, availableFrom: 9, availableTo: 21, maxDistance: 7 },
  { id: 'U8', type: 'user', name: 'Jatrabari Cargo Pickup', area: 'Jatrabari', vehicleType: 'Cargo Pickup', lat: 23.7078, lng: 90.4331, baseCurrentFuel: 5.5, kmPerLiter: 7.2, demand: 46, priority: 4, availableFrom: 6, availableTo: 17, maxDistance: 8 },
  { id: 'U9', type: 'user', name: 'Motijheel Bank Security Car', area: 'Motijheel', vehicleType: 'Security Car', lat: 23.7297, lng: 90.4166, baseCurrentFuel: 3.2, kmPerLiter: 11.0, demand: 18, priority: 3, availableFrom: 10, availableTo: 20, maxDistance: 6 },
  { id: 'U10', type: 'user', name: 'Shahbag University Shuttle', area: 'Shahbag', vehicleType: 'Shuttle Bus', lat: 23.7373, lng: 90.3921, baseCurrentFuel: 5.8, kmPerLiter: 6.0, demand: 31, priority: 4, availableFrom: 8, availableTo: 17, maxDistance: 7 },
  { id: 'U11', type: 'user', name: 'Mirpur Grocery Truck', area: 'Mirpur', vehicleType: 'Truck', lat: 23.8034, lng: 90.3629, baseCurrentFuel: 7.0, kmPerLiter: 4.8, demand: 36, priority: 3, availableFrom: 12, availableTo: 20, maxDistance: 8 },
  { id: 'U12', type: 'user', name: 'Dhanmondi Clinic Backup Car', area: 'Dhanmondi', vehicleType: 'Clinic Car', lat: 23.7434, lng: 90.3783, baseCurrentFuel: 3.8, kmPerLiter: 10.5, demand: 26, priority: 5, availableFrom: 8, availableTo: 16, maxDistance: 7 },
  { id: 'U13', type: 'user', name: 'Nilkhet Student Bus', area: 'Nilkhet', vehicleType: 'Student Bus', lat: 23.7311, lng: 90.3825, baseCurrentFuel: 5.1, kmPerLiter: 5.8, demand: 33, priority: 3, availableFrom: 9, availableTo: 18, maxDistance: 7 },
  { id: 'U14', type: 'user', name: 'Paltan Courier Rider Group', area: 'Paltan', vehicleType: 'Motorbike Group', lat: 23.7342, lng: 90.4096, baseCurrentFuel: 2.2, kmPerLiter: 32.0, demand: 16, priority: 2, availableFrom: 11, availableTo: 22, maxDistance: 6 },
  { id: 'U15', type: 'user', name: 'Shantinagar Emergency Generator', area: 'Shantinagar', vehicleType: 'Generator Van', lat: 23.7469, lng: 90.4181, baseCurrentFuel: 4.5, kmPerLiter: 6.5, demand: 40, priority: 5, availableFrom: 7, availableTo: 14, maxDistance: 7 },
  { id: 'U16', type: 'user', name: 'Jatrabari Night Shuttle', area: 'Jatrabari', vehicleType: 'Night Shuttle', lat: 23.7139, lng: 90.4315, baseCurrentFuel: 4.7, kmPerLiter: 7.3, demand: 29, priority: 3, availableFrom: 18, availableTo: 23, maxDistance: 8 },
  { id: 'U17', type: 'user', name: 'Motijheel Office Microbus', area: 'Motijheel', vehicleType: 'Microbus', lat: 23.7361, lng: 90.4141, baseCurrentFuel: 3.6, kmPerLiter: 7.5, demand: 21, priority: 2, availableFrom: 9, availableTo: 19, maxDistance: 6 },
  { id: 'U18', type: 'user', name: 'Shahbag Fire Support Vehicle', area: 'Shahbag', vehicleType: 'Fire Support Vehicle', lat: 23.7414, lng: 90.3996, baseCurrentFuel: 6.2, kmPerLiter: 5.0, demand: 44, priority: 5, availableFrom: 6, availableTo: 14, maxDistance: 9 },
  { id: 'U19', type: 'user', name: 'Mirpur School Bus 2', area: 'Mirpur', vehicleType: 'School Bus', lat: 23.8131, lng: 90.3658, baseCurrentFuel: 5.7, kmPerLiter: 5.5, demand: 35, priority: 4, availableFrom: 8, availableTo: 15, maxDistance: 8 },
  { id: 'U20', type: 'user', name: 'Dhanmondi Delivery Rider Team', area: 'Dhanmondi', vehicleType: 'Motorbike Group', lat: 23.7508, lng: 90.3834, baseCurrentFuel: 1.8, kmPerLiter: 35.0, demand: 19, priority: 2, availableFrom: 13, availableTo: 22, maxDistance: 6 },
  { id: 'U21', type: 'user', name: 'Nilkhet Medical Courier', area: 'Nilkhet', vehicleType: 'Medical Bike', lat: 23.7352, lng: 90.3881, baseCurrentFuel: 2.0, kmPerLiter: 33.0, demand: 17, priority: 4, availableFrom: 9, availableTo: 20, maxDistance: 6 },
  { id: 'U22', type: 'user', name: 'Paltan Government Pool Car', area: 'Paltan', vehicleType: 'Government Car', lat: 23.7332, lng: 90.4170, baseCurrentFuel: 3.9, kmPerLiter: 10.0, demand: 27, priority: 3, availableFrom: 10, availableTo: 18, maxDistance: 6 },
  { id: 'U23', type: 'user', name: 'Shantinagar Family Car Group', area: 'Shantinagar', vehicleType: 'Family Car', lat: 23.7524, lng: 90.4178, baseCurrentFuel: 2.5, kmPerLiter: 12.0, demand: 14, priority: 1, availableFrom: 17, availableTo: 22, maxDistance: 5 },
  { id: 'U24', type: 'user', name: 'Jatrabari Vegetable Carrier', area: 'Jatrabari', vehicleType: 'Vegetable Carrier', lat: 23.7052, lng: 90.4388, baseCurrentFuel: 4.9, kmPerLiter: 7.0, demand: 32, priority: 3, availableFrom: 5, availableTo: 13, maxDistance: 8 },
  { id: 'U25', type: 'user', name: 'Motijheel Cash Logistics Van', area: 'Motijheel', vehicleType: 'Logistics Van', lat: 23.7306, lng: 90.4231, baseCurrentFuel: 5.0, kmPerLiter: 8.5, demand: 37, priority: 4, availableFrom: 7, availableTo: 16, maxDistance: 7 },
  { id: 'U26', type: 'user', name: 'Shahbag Cultural Center Bus', area: 'Shahbag', vehicleType: 'Mini Bus', lat: 23.7366, lng: 90.3983, baseCurrentFuel: 4.4, kmPerLiter: 6.0, demand: 25, priority: 2, availableFrom: 14, availableTo: 21, maxDistance: 7 },
  { id: 'U27', type: 'user', name: 'Mirpur Diagnostic Van', area: 'Mirpur', vehicleType: 'Diagnostic Van', lat: 23.7981, lng: 90.3722, baseCurrentFuel: 4.1, kmPerLiter: 8.2, demand: 30, priority: 5, availableFrom: 9, availableTo: 17, maxDistance: 8 },
  { id: 'U28', type: 'user', name: 'Dhanmondi School Pickup', area: 'Dhanmondi', vehicleType: 'School Pickup', lat: 23.7449, lng: 90.3709, baseCurrentFuel: 3.4, kmPerLiter: 9.2, demand: 23, priority: 3, availableFrom: 8, availableTo: 15, maxDistance: 6 },
  { id: 'U29', type: 'user', name: 'Nilkhet Printing Supply Van', area: 'Nilkhet', vehicleType: 'Printing Van', lat: 23.7292, lng: 90.3841, baseCurrentFuel: 3.0, kmPerLiter: 10.0, demand: 20, priority: 2, availableFrom: 10, availableTo: 19, maxDistance: 6 },
  { id: 'U30', type: 'user', name: 'Paltan News Distribution Bike', area: 'Paltan', vehicleType: 'News Bike', lat: 23.7395, lng: 90.4161, baseCurrentFuel: 1.5, kmPerLiter: 36.0, demand: 12, priority: 2, availableFrom: 6, availableTo: 12, maxDistance: 5 },
  { id: 'U31', type: 'user', name: 'Shantinagar Clinic Oxygen Van', area: 'Shantinagar', vehicleType: 'Oxygen Van', lat: 23.7477, lng: 90.4111, baseCurrentFuel: 4.6, kmPerLiter: 7.0, demand: 39, priority: 5, availableFrom: 8, availableTo: 15, maxDistance: 8 },
  { id: 'U32', type: 'user', name: 'Jatrabari Long Route Bus', area: 'Jatrabari', vehicleType: 'Long Route Bus', lat: 23.7178, lng: 90.4385, baseCurrentFuel: 8.0, kmPerLiter: 4.5, demand: 48, priority: 4, availableFrom: 7, availableTo: 18, maxDistance: 9 }
]

const areaId = (area) => `A_${area.toUpperCase().replace(/ /g, '_')}`

const roadBackbone = [
  ['A_MIRPUR', 'A_DHANMONDI'],
  ['A_MIRPUR', 'A_SHAHBAG'],
  ['A_DHANMONDI', 'A_NILKHET'],
  ['A_NILKHET', 'A_SHAHBAG'],
  ['A_SHAHBAG', 'A_PALTAN'],
  ['A_PALTAN', 'A_MOTIJHEEL'],
  ['A_PALTAN', 'A_SHANTINAGAR'],
  ['A_SHANTINAGAR', 'A_MOTIJHEEL'],
  ['A_MOTIJHEEL', 'A_JATRABARI'],
  ['A_SHANTINAGAR', 'A_JATRABARI'],
  ['A_SHAHBAG', 'A_SHANTINAGAR'],
  ['A_NILKHET', 'A_PALTAN']
]

export function buildScenario({
  userCount = 20,
  stationCount = 8,
  capacityScale = 70,
  maxDistanceBoost = 0,
  distanceMode = 'manual',
  currentFuelScale = 100,
  reserveDistance = 1
} = {}) {
  const users = userPool.slice(0, Number(userCount))
  const stations = stationPool.slice(0, Number(stationCount)).map((station) => ({
    ...station,
    capacity: Math.max(35, Math.round(station.capacity * Number(capacityScale) / 100))
  }))
  const boostedUsers = users.map((user) => {
    const currentFuel = Number((user.baseCurrentFuel * Number(currentFuelScale) / 100).toFixed(1))
    const fuelBasedRange = Math.max(0, Number((currentFuel * user.kmPerLiter - Number(reserveDistance)).toFixed(1)))
    const manualRange = user.maxDistance + Number(maxDistanceBoost)
    return {
      ...user,
      currentFuel,
      fuelBasedRange,
      manualRange,
      maxDistance: distanceMode === 'fuelBased' ? fuelBasedRange : manualRange,
      distanceMode
    }
  })

  const connectorRoads = [
    ...boostedUsers.map((user) => [user.id, areaId(user.area)]),
    ...stations.map((station) => [station.id, areaId(station.area)])
  ]

  return {
    users: boostedUsers,
    stations,
    areaNodes,
    allNodes: [...areaNodes, ...stations, ...boostedUsers],
    roads: [...roadBackbone, ...connectorRoads]
  }
}

export const defaultScenario = buildScenario()
export const stations = defaultScenario.stations
export const users = defaultScenario.users
export const allNodes = defaultScenario.allNodes
export const roads = defaultScenario.roads
