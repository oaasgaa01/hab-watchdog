const debug = require("debug")("app:/services/tempZones");
const config = require("config");
const http = require("./http");
const {
  groupTempZones,
  groupThermostats,
  groupThermostatsFloorFast,
  groupTempSensors,
  groupPowerSwitches,
  outdoorTempSensor,
  itemAwayFromHome,
  itemHoliday,
} = config.get("tempZones");

// Read during loading - without having to wait for next polling
readZones();

// Start the polling loop
setInterval(function () {
  readZones();
}, 30000);

async function readZones() {
  debug("readZones()");
  // Get all temp zone names
  const { data } = await http.get(
    config.get("baseEndpoint") + "/items/" + groupTempZones
  );

  const tempZoneNames = data.members.map((a) => a.name);
  // Walk trough all temp zones
  for (let i = 0; i < tempZoneNames.length; i++) {
    debug("\n----------------", tempZoneNames[i], "------------------");
    console.log("\n----------------", tempZoneNames[i], "------------------");
    tempZone = await readZone(tempZoneNames[i]);
  }
}

async function readZone(zoneName) {
  const { data } = await http.get(
    config.get("baseEndpoint") + "/items/" + groupTempZones
  );
  debug(data);
  console.log(JSON.stringify(data.members));
}
