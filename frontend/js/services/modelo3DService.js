import { api } from '../api.js';

function preparar({ peso, tamanho, url }) {
  const pesoTexto = String(peso ?? '').trim();
  const dados = {
    peso: Number(pesoTexto),
    tamanho: String(tamanho ?? '').trim(),
    url: String(url ?? '').trim(),
  };

  if (!pesoTexto || !Number.isFinite(dados.peso) || dados.peso <= 0) {
    throw new Error('Informe um peso válido, maior que zero.');
  }
  if (!dados.tamanho) throw new Error('Informe o tamanho do modelo.');
  return dados;
}

export const modelo3DService = {
  listar() {
    return api.get('/modelos');
  },

  criar(dados) {
    return api.post('/modelos', preparar(dados));
  },

  atualizar(id, dados) {
    return api.put(`/modelos/${id}`, preparar(dados));
  },

  remover(id) {
    return api.delete(`/modelos/${id}`);
  },
};
