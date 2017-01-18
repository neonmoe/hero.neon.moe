export default class NetDB {
  /** The values to be sent. */
  values: {[key: string]: any} = {};
  /** The times of the latest updates to the values. */
  syncTimes: {[key: string]: number} = {};

  /** This exists just so everyone is on the same page about the way time is gotten. */
  static getTime() {
    return Date.now();
  }

  updateValue(key: string, value: any, syncTime: number = NetDB.getTime()) {
    if (this.syncTimes[key] < syncTime) {
      this.syncTimes[key] = syncTime;
      this.values[key] = value;
    }
  }

  getNewValues(previousSyncTime: number): {[key: string]: any} {
    let updatePackage: {[key: string]: any} = {};
    Object.keys(this.values).forEach(key => {
      if (this.syncTimes[key] > previousSyncTime) {
        updatePackage[key] = this.values[key];
      }
    });
    return updatePackage;
  }
}
