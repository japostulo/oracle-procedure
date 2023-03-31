import BindIn from "../../src/decorator/bind-in";
import Procedure from "../../src/Procedure";

export default class ProcedureTest extends Procedure {
  protected name = "proceduretest";

  @BindIn()
  text: string = null;
}
