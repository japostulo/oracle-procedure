import ProcedureTest from "./mock/ProcedureTest";
import DataSource from "./mock/DataSource";
import { Procedure } from "../src/Procedure";

test("should be throw exception when property name not exists", async () => {
  expect.assertions(2);

  const dataSource = new DataSource();
  const procedure = new Procedure(dataSource);

  try {
    await procedure.execute();
  } catch (error) {
    expect(error).toBeInstanceOf(ReferenceError);
    expect(error.message).toBe(
      "A propriedade name não está definida em Procedure"
    );
  }
});

test("should build procedure when is valid", () => {
  const dataSource = new DataSource();

  const procedureTest = new ProcedureTest(dataSource);

  expect(procedureTest.procedure).toBe("BEGIN proceduretest(:text); END;");
});

test("should be pass a correct binding and procedure name when execute", () => {
  const query = jest.fn();

  const dataSource = new DataSource();

  dataSource.createQueryRunner = jest.fn().mockReturnValue({
    query,
  });

  const procedureTest = new ProcedureTest(dataSource);

  procedureTest.execute();

  expect(query).toHaveBeenCalledWith("BEGIN proceduretest(:text); END;", [
    {
      dir: 3001,
      val: null,
      type: 2001,
    },
  ]);
});
