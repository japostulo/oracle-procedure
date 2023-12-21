
import { Procedure } from './Procedure'
import { BindIn } from './decorator/bind-in'
import { BindOut } from './decorator/bind-out'

export class HaocObterDadosPfV2Procedure extends Procedure {
    public name = 'tasy.api_jornada_consulta_pck_3.haoc_obter_dados_pf_v2'

    @BindIn()
    cd_pessoa_fisica: string = null

    @BindOut('cursor')
    items: Array<PessoaFisica> = null

}

export interface PessoaFisica {
    cd_pessoa_fisica: string,
    pr_nome_pf: string
}