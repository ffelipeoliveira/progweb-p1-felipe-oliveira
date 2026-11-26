import { criarCrudView } from './crudView.js';

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const materialView = criarCrudView({
  prefixo: 'mat',
  campos: [
    { nome: 'tipo' },
    { nome: 'marca' },
    { nome: 'preco' },
    { nome: 'qtdEmGramas' },
  ],
  colunas: [
    { valor: (material) => material.tipo },
    { valor: (material) => material.marca },
    { valor: (material) => moeda.format(material.preco), classe: 'numero text-nowrap' },
    {
      valor: (material) => `${material.qtdEmGramas} g`,
      classe: 'numero text-nowrap',
    },
  ],
});
