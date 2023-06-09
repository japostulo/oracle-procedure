# Classe Procedure

A classe `Procedure` é uma classe base que permite chamar _stored procedures_ do _Oracle Database_ através do TypeORM. Ela possui dois decorators (`BindIn` e `BindOut`) para definir argumentos de entrada e saída. Qualquer propriedade da classe que recebe um desses decorators é transformada automaticamente em um binding na mesma ordem em que foi declarada.

## Instalação

```bash
npm install oracle-procedure
```

## Construtor

O construtor da classe Procedure recebe uma conexão iniciada do TypeORM `DataSource` ou `oracledb.Connection`

```typescript
constructor(connection: DataSource | oracledb.Connection);
```

## Propriedades Procedure

A implementação da classe procedure precisa de uma variável `protected` **name** que será usado como o nome da procedure

## Argumento _Store Procedure_

Os decorators `@BindIn()` e `@BindOut()` são usados para definir argumentos de entrada e saída em uma classe que estende
a classe base `Procedure`,

> **Warning**
> Todas as propriedades da classe com `BindIn` e `BindOut` serão adicionados como argumento da _store procedure_ na mesma ordem de declaração

### `@BindIn()`

O decorator `@BindIn()` é usado para definir argumentos de entrada, ele possui um parâmetro não obrigatório que define o tipo do argumento da procedure,
por padrão é assumido o tipo `string` (converte-se para `oracledb.STRING`)

> **_Observação:_** Todas as constantes do driver `oracledb` são aceitas

```typescript
@BindIn('number')
codigo:number = 1
```

### `@BindOut()`

O decorator @BindOut() é usado para definir argumentos de saída, todos argumentos de saída são retornados como resultados da execução da procedure conforme o tipo declarado.

```typescript
@BindOut('boolean')
active:boolean

@BindOut('cursor')
data:any
```

## Execução

O método `execute()` é responsável por executar a _stored procedure_ e devolver os resultados. Ele não recebe nenhum parâmetro e devolve uma promise das propriedades definidas pelo decorator `BindOut`.

## Uso

Para utilizar a classe base `Procedure`, você precisa criar uma nova classe que extenda a classe `Procedure`. Nessa nova classe, você pode definir as entradas e saídas da _stored procedure_ usando os decorators `BindIn` e `BindOut`, respectivamente. Qualquer propriedade da classe que recebe um decorator de entrada ou saída é transformado automaticamente em bindings na mesma ordem que foi declarado.

Aqui está um exemplo de chamada da procedure `RECOVERY_USER_DATA` que possui o argumento number `year` e me devolve uma string `status` e um `cursor`
que serão os resultados encontrados com a data de contratação maior que o argumento `year`:

```typescript
class RecoveryUserData extends Procedure {
  protected name = "recovery_user_data";

  @BindIn("number")
  year: number;

  @BindOut()
  status: string;

  @BindOut("cursor")
  data: any;
}

async function executeProcedure() {
  //Cria e inicia a conexão com o banco de dados
  const connection = new DataSource({
    /* sua configuração */
  });
  await connection.initialize();

  //Instancia da nossa classe RecoveryUserData
  const procedure = new RecoveryUserData(connection);

  procedure.year = 2023;

  //Recuperação dos resultados de execução
  const results = await procedure.execute();
  console.log(results);
  /*
    {
      "status": "active",
      "data": [
        {
          "id": 1,
          "name": "John Doe"
          "year_hire": "2023"
        }
      ]
    }
  */
}

executeProcedure();
```

## Exceções

- `ReferenceError`: lançada quando a propriedade name não está definida na classe que herda a classe Procedure.

- `TypeError`: lançada quando os tipos de dados dos valores de entrada ou saída não estão corretos.

- `Error`: lançada quando ocorre um erro durante a execução da procedure.
