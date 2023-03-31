import Procedure from "./Procedure";
import BindIn from "./decorator/bind-in";
import BindOut from "./decorator/bind-out";

export class APIConsultaItemPepOnline extends Procedure {
  protected name = "api_consulta_item_pep_online";

  @BindIn()
  public cd_pessoa_fisica = null;

  @BindIn("number")
  public nr_atendimento = null;

  @BindIn()
  public item = null;

  @BindIn()
  public filtro = null;

  @BindIn()
  public opcao_retorno = null;

  @BindOut()
  public status = null;

  @BindOut("cursor")
  public cursor = null;
}
