import { criarCrudView } from './crudView.js';

export const impressoraView = criarCrudView({
  prefixo: 'impr',
  campos: [
    { nome: 'modelo' },
    { nome: 'marca' },
    { nome: 'areaDeImpressao' },
  ],
  colunas: [
    { valor: (impressora) => impressora.modelo },
    { valor: (impressora) => impressora.marca },
    { valor: (impressora) => impressora.areaDeImpressao },
  ],
});
