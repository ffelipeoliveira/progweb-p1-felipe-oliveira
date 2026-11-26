import { api } from '../api.js';

function preparar({ custo, tamanho, opcionais }) {
  const custoTexto = String(custo ?? '').trim();
  const dados = {
    custo: Number(custoTexto),
    tamanho: String(tamanho ?? '').trim(),
    opcionais: String(opcionais ?? '')
      .split(',')
      .map((opcional) => opcional.trim())
      .filter(Boolean),
  };

  if (!custoTexto || !Number.isFinite(dados.custo) || dados.custo < 0) {
    throw new Error('Informe um custo válido, maior ou igual a zero.');
  }
  if (!dados.tamanho) throw new Error('Informe o tamanho da embalagem.');
  return dados;
}

export const embalagemService = {
  listar() {
    return api.get('/embalagens');
  },

  criar(dados) {
    return api.post('/embalagens', preparar(dados));
  },

  atualizar(id, dados) {
    return api.put(`/embalagens/${id}`, preparar(dados));
  },

  remover(id) {
    return api.delete(`/embalagens/${id}`);
  },
};
