import { api } from '../api.js';

function preparar({ tipo, marca, preco, qtdEmGramas }) {
  const precoTexto = String(preco ?? '').trim();
  const quantidadeTexto = String(qtdEmGramas ?? '').trim();
  const dados = {
    tipo: String(tipo ?? '').trim(),
    marca: String(marca ?? '').trim(),
    preco: Number(precoTexto),
    qtdEmGramas: Number(quantidadeTexto),
  };

  if (!dados.tipo || !dados.marca) throw new Error('Informe o tipo e a marca do material.');
  if (!precoTexto || !Number.isFinite(dados.preco) || dados.preco < 0) {
    throw new Error('Informe um preço válido, maior ou igual a zero.');
  }
  if (
    !quantidadeTexto ||
    !Number.isFinite(dados.qtdEmGramas) ||
    dados.qtdEmGramas <= 0
  ) {
    throw new Error('Informe uma quantidade em gramas maior que zero.');
  }
  return dados;
}

export const materialService = {
  listar() {
    return api.get('/materiais');
  },

  criar(dados) {
    return api.post('/materiais', preparar(dados));
  },

  atualizar(id, dados) {
    return api.put(`/materiais/${id}`, preparar(dados));
  },

  remover(id) {
    return api.delete(`/materiais/${id}`);
  },
};
