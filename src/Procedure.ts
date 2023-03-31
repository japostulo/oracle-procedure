import { DataSource, QueryRunner } from "typeorm";
import * as oracledb from "oracledb";

export default class Procedure {
  protected name: string = null;

  private inputs: Inputs = {};
  private outputs: Outputs = {};

  constructor(private connection: DataSource) {}

  async execute() {
    const queryRunner = this.connection.createQueryRunner();

    try {
      const runner = await queryRunner.query(this.procedure, this.bindings);
      return await this.getData(runner);
    } catch (error) {
      throw error;
    }
  }

  private get indexCursor(): number {
    return Object.values(this.outputs).findIndex(
      (f: any) => f.type == oracledb.CURSOR
    );
  }

  private async getData(runner: QueryRunner) {
    let cursor = null;

    if (this.indexCursor != -1) cursor = runner[this.indexCursor];

    const data: Outputs = {};

    const keys = Object.keys(this.outputs);

    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];

      if (index == this.indexCursor) {
        data[key] = await this.getDataFromCursor(cursor);
        continue;
      }

      data[key] = runner[index];
    }

    return data;
  }

  private async getDataFromCursor(cursor: oracledb.Result<any>) {
    const columns = cursor.metaData.map((column: any) => column.name);

    const data = [];

    let row = null;

    while ((row = await cursor.getRow())) {
      const line = {};
      columns.forEach(
        (column: any) => (line[column.toLowerCase()] = row[column])
      );

      data.push(line);
    }

    await cursor.close();

    return data;
  }

  private get bindings() {
    return Object.values(this.fields);
  }

  private get fields() {
    return Object.assign(this.inputs, this.outputs);
  }

  private get parameters(): string {
    const keys = Object.keys(this.fields);

    if (!keys) return;

    return keys.map((field: string) => `:${field}`).join(", ");
  }

  public get procedure(): string {
    if (!this.name)
      throw new ReferenceError(
        `A propriedade name não está definida em ${this.constructor.name}`
      );

    return `BEGIN ${this.name}(${this.parameters}); END;`;
  }
}

interface Inputs {
  [key: string]: IBinding;
}

export interface Outputs {
  [key: string]: any;
}

interface IBinding {
  dir: oracledb.BindDirection;
  val: any;
  type: oracledb.DataType;
}
