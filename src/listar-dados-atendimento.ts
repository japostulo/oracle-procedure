
import { Procedure } from './Procedure'
import { BindIn } from './decorator/bind-in'
import { BindOut } from './decorator/bind-out'

export class ListarDadosAtendimento extends Procedure {
    public name = 'tasy.api_jornada_cardapio_haoc.prc_haoc_listar_dados_atendimento'

    @BindIn()
    cd_pessoa_fisica: string = '2820776'

    @BindOut('cursor')
    dados_atendimento: string = null

    @BindOut('cursor')
    dados_calendario: string = null

    @BindOut()
    erro: string = null

    @BindOut()
    descricao: string = null
}