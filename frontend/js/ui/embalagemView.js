import { criarCrudView } from './crudView.js';

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const embalagemView = criarCrudView({
  prefixo: 'emb',
  campos: [
    { nome: 'tamanho' },
    { nome: 'custo' },
    {
      nome: 'opcionais',
      paraFormulario: (embalagem) => embalagem.opcionais.join(', '),
    },
  ],
  colunas: [
    { valor: (embalagem) => embalagem.tamanho },
    { valor: (embalagem) => moeda.format(embalagem.custo), classe: 'numero text-nowrap' },
    { valor: (embalagem) => embalagem.opcionais.join(', ') || '—' },
  ],
});
