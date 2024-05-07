import { DataSource, QueryRunner } from "typeorm";
import * as oracledb from "oracledb";

export class Procedure {
  protected name: string = null;

  private inputs: Inputs = {};
  private outputs: Outputs = {};
  protected orderedParameters = []

  constructor(protected connection: DataSource | oracledb.Connection) { }

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

  private async getData(runner: QueryRunner | oracledb.Result) {
    const data: Outputs = {};

    Object.entries(this.outputs).forEach(([key, value], index) => {
      if (value.type == oracledb.CURSOR)
          data[key] = this.getDataFromCursor(runner[index]);
      else
          data[key] = runner[index]
    })

    for (const key in data) {
      if (data[key] instanceof Promise) {
        data[key] = await data[key];
      }
    }

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

  private get fields(): Fields {
    const orderedParameters: Fields = {}

    const fields = Object.assign(this.inputs, this.outputs)

    this.orderedParameters.forEach((key: string) => {
      orderedParameters[key] = fields[key]
    })

    return orderedParameters;
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

export interface Fields extends Inputs, Outputs { }

interface IBinding {
  dir: oracledb.BindDirection;
  val: any;
  type: oracledb.DataType;
}
