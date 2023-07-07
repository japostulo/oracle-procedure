import * as oracledb from "oracledb";
import { Procedure } from "src/Procedure";

export function BindOut(type: string = "string"): PropertyDecorator {
  return function (target: Procedure, key: string) {
    Object.defineProperty(target, key, {
      get() {
        return this.outputs[key];
      },
      set() {
        this.outputs[key] = {
          dir: oracledb.BIND_OUT,
          type: oracledb[type.toUpperCase()],
        };

        if (!this.orderedParameters.includes(key))
          this.orderedParameters.push(key)
      },
      enumerable: true,
      configurable: true,
    });
  };
}
