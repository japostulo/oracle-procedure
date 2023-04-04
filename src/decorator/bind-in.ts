import * as oracledb from "oracledb";
import { Procedure } from "src/Procedure";

export function BindIn(type: string = "string"): PropertyDecorator {
  return function (target: Procedure, key: string) {
    Object.defineProperty(target, key, {
      get() {
        return this.inputs[key];
      },
      set(value: any) {
        this.inputs[key] = {
          dir: oracledb.BIND_IN,
          val: value ?? null,
          type: oracledb[type.toUpperCase()],
        };
      },
      enumerable: true,
      configurable: true,
    });
  };
}
