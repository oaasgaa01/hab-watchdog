const debug = require("debug")("app:/services/tempZones");
const TempZone = require("./tempZone");
const config = require("config");
const http = require("./http");
const { groupTempZones } = config.get("tempZones");

const zones = [];
initZones();

async function initZones() {
  const { data } = await http.get(
    config.get("baseEndpoint") + "/items/" + groupTempZones
  );

  data.members.forEach((zone) => {
    // console.log(zone.name);
    const zoneClass = new TempZone(zone.name);
    zones.push(zoneClass);
  });
}

async function readZones() {
  debug("readZones()");

  zones.forEach((zone) => {
    // console.log(zone.zoneName);
    // await zone.readZone();
    const isHealty = zone.isHealthy();
  });
}

// Start the polling loop
setInterval(function () {
  readZones();
}, 3000);
