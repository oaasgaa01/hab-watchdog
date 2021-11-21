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
const tolerance = 2;
const pollingInterval = 60; // I seconds
const logToConsole = true;

const {
  groupThermostats,
  groupThermostatsFloorFast,
  groupTempSensors,
  groupPowerSwitches,
} = config.get("tempZones");

class TempZone {
  #interval = pollingInterval * 1000;
  zone;
  zoneName;
  desiredTemp;
  actualTemp;
  desiredTempFloorFast;
  actualTempFloorFast;
  heatingOn;
  status;

  constructor(params) {
    this.zoneName = params.zoneName;

    // Initial reading
    this.readZone();

    // Start the polling loop
    setInterval(() => {
      this.readZone();
    }, this.#interval);
  }

  async readZone() {
    let result;
    result = await http.get(
      config.get("baseEndpoint") + "/items/" + this.zoneName
    );
    this.zone = result.data.members;

    // Set initial values
    this.desiredTemp = 0;
    this.actualTemp = 0;
    this.desiredTempFloorFast = 0;
    this.actualTempFloorFast = 0;
    this.heatingOn = false;
    this.status = { code: 0, msg: "Zone is healthy" };

    // Walk through all items and get/set current values
    for (let i = 0; i < this.zone.length; i++) {
      const item = this.zone[i];

      if (item.groupNames.find((x) => x === groupThermostats))
        this.desiredTemp = parseFloat(item.state);

      if (item.groupNames.find((x) => x === groupTempSensors)) {
        const temp = parseFloat(item.state);
        if (typeof temp === "number" && temp > 0)
          this.actualTemp = parseFloat(item.state);
      }

      // Not yet implemented
      // if (item.groupNames.find((x) => x === groupThermostatsFloorFast)) {
      //   this.desiredTempFloorFast = parseFloat(item.state);
      //   // ********* How to get actual temp? **************
      // }

      if (item.groupNames.find((x) => x === groupPowerSwitches)) {
        if (item.state === "ON") this.heatingOn = true;
      }
    }

    if (logToConsole) {
      console.log("\n-----------------------------");
      console.log("\nzoneName:\t", this.zoneName);
      console.log("desiredTemp:\t", this.desiredTemp);
      if (this.desiredTempFloorFast)
        console.log("desiredTempFloor:\t", this.desiredTempFloorFast);
      console.log("actualTemp:\t", this.actualTemp);
      console.log("heatingOn:\t", this.heatingOn);
    }
  }

  async isHealthy() {
    const { desiredTemp, actualTemp, heatingOn } = this;

    if (desiredTemp < 5 || desiredTemp > 35) {
      this.status = {
        zoneName: this.zoneName,
        code: 1,
        msg: "Desired temp is out of range",
      };
      return false;
    }

    if (actualTemp < 5 || actualTemp > 35) {
      this.status = {
        zoneName: this.zoneName,
        code: 2,
        msg: "Actual temp is out of range",
      };
      return false;
    }

    if (actualTemp < desiredTemp - tolerance && !heatingOn) {
      this.status = {
        zoneName: this.zoneName,
        code: 3,
        msg: "Heating is failing",
      };
      return false;
    }

    if (actualTemp > desiredTemp + tolerance && heatingOn) {
      this.status = {
        zoneName: this.zoneName,
        code: 1,
        msg: "The zone is overheating",
      };
      return false;
    }

    return true;
  }
}

module.exports = TempZone;
