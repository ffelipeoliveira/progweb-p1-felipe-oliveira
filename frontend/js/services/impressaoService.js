import { api } from '../api.js';

function preparar({ modelo3DId, materialId, tamanho }) {
  const dados = {
    modelo3DId: Number(modelo3DId),
    materialId: Number(materialId),
    tamanho: String(tamanho ?? '').trim(),
  };

  if (!Number.isInteger(dados.modelo3DId) || dados.modelo3DId <= 0) {
    throw new Error('Selecione um modelo 3D válido.');
  }
  if (!Number.isInteger(dados.materialId) || dados.materialId <= 0) {
    throw new Error('Selecione um material válido.');
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
