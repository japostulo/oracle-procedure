import { UppercaseNamingStrategy } from "./src/UppercaseNamingStrategy";
import * as oracledb from "oracledb";
import { HaocObterDadosPfV2Procedure, PessoaFisica } from "src/haoc-obter-dados-pf-v2.procedure";

async function connect() {
    const config: any = {
        type: "oracle",
        database: "tasy",
        username: "tasy",
        password: "haoc_teste",
        connectString:
            "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=scan-dbprojeto1.oswaldocruz.intranet)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=dbprojeto1.oswaldocruz.intranet)(FAILOVER_MODE=(TYPE=select)(METHOD=basic))))",
        port: 1521,
        logging: true,
        namingStrategy: new UppercaseNamingStrategy(),
    };

    // const connection = new DataSource(config);

    // await connection.initialize();

    const oracleConnection = await oracledb.getConnection({
        user: config.username,
        password: config.password,
        connectString: config.connectString,

        externalAuth: false,
    });



    try {
        const procedure = new HaocObterDadosPfV2Procedure(oracleConnection)

        procedure.cd_pessoa_fisica = '1303467'

        const { items: pessoas } = await procedure.execute()

        pessoas.forEach((pessoa: PessoaFisica) => console.log(pessoa));
    } catch (err) {
        console.log("deu erro", err);
    }

}

connect();