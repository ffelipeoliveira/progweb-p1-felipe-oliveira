import { api } from '../api.js';

function preparar({ modelo3DId, custo, tamanho }) {
  const custoTexto = String(custo ?? '').trim();
  const dados = {
    modelo3DId: Number(modelo3DId),
    custo: Number(custoTexto),
    tamanho: String(tamanho ?? '').trim(),
  };

  if (!Number.isInteger(dados.modelo3DId) || dados.modelo3DId <= 0) {
    throw new Error('Selecione um modelo 3D válido.');
  }
  if (!custoTexto || !Number.isFinite(dados.custo) || dados.custo < 0) {
    throw new Error('Informe um custo válido, maior ou igual a zero.');
  }
  if (!dados.tamanho) throw new Error('Informe o tamanho da impressão.');
  return dados;
}

export const impressaoService = {
  listar() {
    return api.get('/impressoes');
  },

  criar(dados) {
    return api.post('/impressoes', preparar(dados));
  },

  atualizar(id, dados) {
    return api.put(`/impressoes/${id}`, preparar(dados));
  },

  remover(id) {
    return api.delete(`/impressoes/${id}`);
  },
};
