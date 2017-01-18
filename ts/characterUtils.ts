export default class CharacterUtils {
  static getRoll(points: number): number {
    return 9 + Math.floor(points / 5);
  }

  static getValue(stat: string, points: number): number {
    let vals = CharacterUtils.characteristicValues[stat];
    return Math.round(vals[0] + points / vals[1] * vals[2]);
  }

  static getHTHDmg(strPoints: number): number {
    return Math.floor(CharacterUtils.getValue("str", strPoints) / 5 * 2) / 2;
  }

  static getLift(strPoints: number): number {
    const vals = CharacterUtils.strengthLiftValues;
    return vals[Math.max(0, Math.min(vals.length - 1, CharacterUtils.getValue("str", strPoints)))];
  }

  static getSpentExperience(netdb: any) {
    const vals = CharacterUtils.characteristicValues;
    let total = 0;
    Object.keys(vals).forEach(stat => {
      total += netdb.values[stat];
    });
    return total;
  }

  static increaseStat(netdb: any, stat: string) {
    const exp = CharacterUtils.characteristicValues[stat][1];
    if (CharacterUtils.getSpentExperience(netdb) + exp <= netdb.get("exp")) {
      netdb.updateValue(stat, netdb.get(stat) + exp);
    }
  }

  static decreaseStat(netdb: any, stat: string) {
    const exp = CharacterUtils.characteristicValues[stat][1];
    const valueInc = CharacterUtils.characteristicValues[stat][2];
    if (CharacterUtils.getSpentExperience(netdb) - exp >= 0 &&
        CharacterUtils.getValue(stat, netdb.get(stat)) - valueInc >= 0) {
      netdb.updateValue(stat, netdb.get(stat) - exp);
    }
  }

  /** "stat": [base points, requiredPoints, value per required points, does stat have a characteristic roll? ] */
  static characteristicValues = {
    "str": [10, 1, 1, true], "dex": [10, 2, 1, true], "con": [10, 1, 1, true], "int": [10, 1, 1, true], "ego": [10, 1, 1, true], "pre": [10, 1, 1, true], "ocv": [3, 5, 1, false], "dcv": [3, 5, 1, false], "omcv": [3, 3, 1, false], "dmcv": [3, 3, 1, false], "spd": [2, 10, 1, false], "pd": [2, 1, 1, false], "ed": [2, 1, 1, false], "rec": [4, 1, 1, false], "end": [20, 1, 5, false], "body": [10, 1, 1, false], "stun": [20, 1, 2, false]
  };

  static strengthLiftValues = [
    0, 8, 16, 25, 38, 50, 50, 50, 75, 75, 100, 100, 100, 150, 150, 200, 200, 200, 300, 300, 400, 400, 500, 600, 600, 800, 800, 800, 1200, 1200, 1600, 1600, 1600, 1600, 1600, 3200, 3200, 3200, 3200, 3200, 6400, 6400, 6400, 6400, 6400, 12500, 12500, 12500, 12500, 12500, 25000, 25000, 25000, 25000, 25000, 50000, 50000, 50000, 50000, 50000, 100000, 100000, 100000, 100000, 100000, 200000, 200000, 200000, 200000, 200000, 400000, 400000, 400000, 400000, 400000, 800000, 800000, 800000, 800000, 800000, 1600000, 1600000, 1600000, 1600000, 1600000, 3200000, 3200000, 3200000, 3200000, 3200000, 6400000, 6400000, 6400000, 6400000, 6400000, 12500000, 12500000, 12500000, 12500000, 12500000, 25000000
  ];

  static statusCharacteristics = [ "end", "body", "stun" ];
}
