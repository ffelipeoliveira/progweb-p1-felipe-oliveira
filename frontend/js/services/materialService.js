import { api } from '../api.js';

function preparar({ tipo, marca, precoPorKg }) {
  const precoTexto = String(precoPorKg ?? '').trim();
  const dados = {
    tipo: String(tipo ?? '').trim(),
    marca: String(marca ?? '').trim(),
    precoPorKg: Number(precoTexto),
  };

  if (!dados.tipo || !dados.marca) throw new Error('Informe o tipo e a marca do material.');
  if (!precoTexto || !Number.isFinite(dados.precoPorKg) || dados.precoPorKg < 0) {
    throw new Error('Informe um preço por kg válido, maior ou igual a zero.');
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
