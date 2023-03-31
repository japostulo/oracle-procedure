import { DataSource } from "typeorm";
import { APIConsultaItemPepOnline } from "./api-consulta-item-pep-online";
import { UppercaseNamingStrategy } from "./UppercaseNamingStrategy";

const connection = new DataSource({
  type: "oracle",
  database: "tasy",
  username: "tasy",
  password: "haoc_teste",
  connectString:
    "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=scan-dbprojeto1.oswaldocruz.intranet)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=dbprojeto1.oswaldocruz.intranet)(FAILOVER_MODE=(TYPE=select)(METHOD=basic))))",
  port: 1521,
  logging: true,
  namingStrategy: new UppercaseNamingStrategy(),
});

async function connect() {
  await connection.initialize();

  const procedure = new APIConsultaItemPepOnline(connection);

  procedure.cd_pessoa_fisica = "366630";
  procedure.nr_atendimento = 4394417;
  procedure.item = "VA";
  procedure.opcao_retorno = "DADOS";

  await procedure.execute();
}

connect();
