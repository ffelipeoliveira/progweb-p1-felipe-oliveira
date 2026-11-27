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
    { nome: 'precoPorKg' },
  ],
  colunas: [
    { valor: (material) => material.tipo },
    { valor: (material) => material.marca },
    { valor: (material) => moeda.format(material.precoPorKg), classe: 'numero text-nowrap' },
  ],
});
