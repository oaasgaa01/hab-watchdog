/**
 * name
 * desiredTemp
 * actualTemp
 * heatingOn
 *
 * readZone()
 * isHealthy()
 * getUnhealthyState()
 *
 * desiredTemp and actualTemp must be within a defined range (0-40)
 * if(desiredTemp > actualtemp && !heatingOn) warning
 * if(desiredTemp < actualtemp && heatingOn) warning
 *
 * heatingOn: Check all powerSwitches with OR
 */

const debug = require("debug")("app:/services/tempZone");
const config = require("config");
const http = require("./http");

const {
  groupThermostats,
  groupThermostatsFloorFast,
  groupTempSensors,
  groupPowerSwitches,
} = config.get("tempZones");

class TempZone {
  zone;
  zoneName;
  desiredTemp;
  actualTemp;
  desiredTempFloorFast;
  actualTempFloorFast;
  heatingOn;

  constructor(name) {
    this.zoneName = name;
  }

  async readZone() {
    const { data } = await http.get(
      config.get("baseEndpoint") + "/items/" + this.zoneName
    );
    this.zone = data.members;

    // Set initial values
    this.desiredTemp = 0;
    this.actualTemp = 0;
    this.desiredTempFloorFast = 0;
    this.actualTempFloorFast = 0;
    this.heatingOn = false;

    // Walk through all items and get/set current values
    for (let i = 0; i < this.zone.length; i++) {
      const item = this.zone[i];

      if (item.groupNames.find((x) => x === groupThermostats))
        this.desiredTemp = item.state;

      if (item.groupNames.find((x) => x === groupTempSensors))
        this.actualTemp = item.state;

      if (item.groupNames.find((x) => x === groupThermostatsFloorFast)) {
        // console.log(item);
        this.desiredTempFloorFast = item.state;
        // ********* How to get actual temp? **************
      }

      if (item.groupNames.find((x) => x === groupPowerSwitches))
        if (item.state === "ON") this.heatingOn = true;
    }

    console.log("\nzoneName:\t", this.zoneName);
    console.log("desiredTemp:\t", this.desiredTemp);
    if (this.desiredTempFloorFast)
      console.log("desiredTempFloor:\t", this.desiredTempFloorFast);
    console.log("actualTemp:\t", this.actualTemp);
    console.log("heatingOn:\t", this.heatingOn);
  }

  async isHealthy() {
    await this.readZone();
  }
}

module.exports = TempZone;
