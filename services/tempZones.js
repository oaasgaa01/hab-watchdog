const debug = require("debug")("app:/services/tempZones");
const TempZone = require("./tempZone");
const config = require("config");
const http = require("./http");
const { groupTempZones } = config.get("tempZones");
const { sendNotification } = require("./notifications");

const checkInterval = 15; // Polling interval in minutes
const zones = [];
initZones();

async function initZones() {
  const { data } = await http.get(
    config.get("baseEndpoint") + "/items/" + groupTempZones
  );

  // For testing one temp zone
  // const zoneClass = new TempZone({ zoneName: "gTempZone_H_FF_Kitchen" });
  // zones.push(zoneClass);

  data.members.forEach((zone) => {
    const zoneClass = new TempZone({ zoneName: zone.name });
    zones.push(zoneClass);
  });
}

async function checkZones() {
  debug("checkZones()");

  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i];
    const isHealty = await zone.isHealthy();
    console.log(zone.zoneName, "\t", zone.status.msg);

    if (zone.status && zone.status.code !== 0)
      notify(zone.zoneName, zone.status.msg);
  }
}

// Start the polling loop for checking zones
setInterval(function () {
  checkZones();
}, checkInterval * 60 * 1000);

function notify(name, msg) {
  const params = {
    subject: "Warning from hab-watchdog",
    html: `<h1>TempZone '${name}': ${msg}</h1>`,
    text: `TempZone '${name}': ${msg}`,
  };
  sendNotification(params);
}
