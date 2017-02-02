export default class NetDB {
  /** The values to be sent. */
  values: {[key: string]: any} = {};
  /** The times of the latest updates to the values. */
  syncTimes: {[key: string]: number} = {};

  /** This exists just so everyone is on the same page about the way time is gotten. */
  static getTime() {
    return Date.now();
  }

  get(key: string) {
    return this.values[key];
  }

  getAsInt(key: string) {
    return parseInt(this.values[key]);
  }

  removeValue(key: string) {
    delete this.values[key];
    delete this.syncTimes[key];
  }

  updateValue(key: string, value: any, syncTime: number = NetDB.getTime()) {
    if (Object.keys(this.values).indexOf(key) == -1 || this.syncTimes[key] < syncTime) {
      this.syncTimes[key] = syncTime;
      this.values[key] = value;
    }
  }

  updateValues(newValues: {[key: string]: any}, newTime: number) {
    Object.keys(newValues).forEach(key => {
      this.updateValue(key, newValues[key], newTime);
    });
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

  save(): {[key: string]: any} {
    let savedata: {[key: string]: any} = {}
    savedata["values"] = this.values;

    return savedata;
  }

  static load(data: {[key: string]: any}): NetDB {
    let db = new NetDB();
    db.values = data["values"];
    Object.keys(db.values).forEach(key => {
      db.syncTimes[key] = NetDB.getTime();
    });

    return db;
  }
}
