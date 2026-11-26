import { api } from '../api.js';

function preparar({ modelo, marca, areaDeImpressao }) {
  const dados = {
    modelo: String(modelo ?? '').trim(),
    marca: String(marca ?? '').trim(),
    areaDeImpressao: String(areaDeImpressao ?? '').trim(),
  };

  if (!dados.modelo || !dados.marca || !dados.areaDeImpressao) {
    throw new Error('Informe o modelo, a marca e a área de impressão.');
  }
  return dados;
}

export const impressoraService = {
  listar() {
    return api.get('/impressoras');
  },

  criar(dados) {
    return api.post('/impressoras', preparar(dados));
  },

  atualizar(id, dados) {
    return api.put(`/impressoras/${id}`, preparar(dados));
  },

  remover(id) {
    return api.delete(`/impressoras/${id}`);
  },
};
