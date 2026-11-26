import { api } from '../api.js';

function preparar({ preco, custo }) {
  const precoTexto = String(preco ?? '').trim();
  const custoTexto = String(custo ?? '').trim();
  const dados = {
    preco: Number(precoTexto),
    custo: Number(custoTexto),
  };

  if (!precoTexto || !Number.isFinite(dados.preco) || dados.preco < 0) {
    throw new Error('Informe um preço válido, maior ou igual a zero.');
  }
  if (!custoTexto || !Number.isFinite(dados.custo) || dados.custo < 0) {
    throw new Error('Informe um custo válido, maior ou igual a zero.');
  }
  return dados;
}

export const vendaService = {
  listar() {
    return api.get('/vendas');
  },

  criar(dados) {
    return api.post('/vendas', preparar(dados));
  },

  atualizar(id, dados) {
    return api.put(`/vendas/${id}`, preparar(dados));
  },

  remover(id) {
    return api.delete(`/vendas/${id}`);
  },
};
