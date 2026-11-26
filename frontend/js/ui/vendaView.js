import { criarCrudView } from './crudView.js';

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const vendaView = criarCrudView({
  prefixo: 'ven',
  campos: [{ nome: 'preco' }, { nome: 'custo' }],
  colunas: [
    { valor: (venda) => moeda.format(venda.preco), classe: 'numero text-nowrap' },
    { valor: (venda) => moeda.format(venda.custo), classe: 'numero text-nowrap' },
    { valor: (venda) => moeda.format(venda.lucro), classe: 'numero text-nowrap' },
  ],
});
