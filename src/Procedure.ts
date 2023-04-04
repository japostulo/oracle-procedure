import { DataSource, QueryRunner } from "typeorm";
import * as oracledb from "oracledb";

export class Procedure {
  protected name: string = null;

  private inputs: Inputs = {};
  private outputs: Outputs = {};

  constructor(protected connection: DataSource | oracledb.Connection) {}

  async execute() {
    try {
      switch (true) {
        case this.connection instanceof DataSource:
          return await this.executeDataSource();
        case this.connection instanceof oracledb.Connection:
          return await this.executeOracle();
        default:
          throw new Error("Conexão recebida não é suportada!");
      }
    } catch (error) {
      throw error;
    }
  }

  async executeOracle() {
    try {
      const runner = await this.connection.execute(this.procedure, this.fields);

      if (!runner.outBinds)
        throw Error(
          `Execução da procedure ${this.constructor.name} não foi concluída`
        );

      const values = Object.values(runner.outBinds);

      return await this.getData(values);
    } finally {
      this.connection.close();
    }
  }

  async executeDataSource() {
    const queryRunner = this.connection.createQueryRunner();
    try {
      await queryRunner.connect();

      const runner = await queryRunner.query(this.procedure, this.bindings);

      return await this.getData(runner);
    } finally {
      queryRunner.release();
    }
  }

  private get indexCursor(): number {
    return Object.values(this.outputs).findIndex(
      (f: any) => f.type == oracledb.CURSOR
    );
  }

  private async getData(runner: QueryRunner | oracledb.Result) {
    const data: Outputs = {};

    const keys = Object.keys(this.outputs);

    if (this.indexCursor != -1) {
      const { 0: cursorKey } = keys.splice(this.indexCursor, 1);

      const cursor = runner[this.indexCursor];

      data[cursorKey] = await this.getDataFromCursor(cursor);
    }

    keys.forEach((key: string, index: number) => (data[key] = runner[index]));

    return data;
  }

  private async getDataFromCursor(cursor: oracledb.Result<any>) {
    const columns = cursor.metaData.map((column: any) => column.name);

    const data = [];

    let row = null;

    while ((row = await cursor.getRow())) {
      const line = {};

      columns.forEach((column: any, index: number) => {
        line[column.toLowerCase()] = Array.isArray(row)
          ? row[index]
          : row[column];
      });

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
