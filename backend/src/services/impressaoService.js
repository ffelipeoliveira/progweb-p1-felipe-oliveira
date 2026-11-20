import { impressaoModel } from '../models/impressaoModel.js';
import { erro } from '../routes/erro.js';

const camposEditaveis = ['custo', 'tamanho'];

function validarTamanho(tamanho) {
  if (typeof tamanho === 'number') {
    if (!Number.isFinite(tamanho) || tamanho < 0) {
      throw erro(400, 'O tamanho deve ser um número maior ou igual a zero');
    }
    return;
  }

  if (
    typeof tamanho !== 'string' ||
    tamanho.trim() === '' ||
    /(?:^|[xX×,*;\s])-\s*(?:\d+(?:[.,]\d*)?|[.,]\d+)/.test(tamanho)
  ) {
    throw erro(400, 'O tamanho é obrigatório e não pode conter valores negativos');
  }
}

function validarImpressao({ custo, tamanho }) {
  if (custo == null || tamanho == null) {
    throw erro(400, 'Campos "custo" e "tamanho" são obrigatórios');
  }
  if (typeof custo !== 'number' || !Number.isFinite(custo) || custo < 0) {
    throw erro(400, 'O custo deve ser um número maior ou igual a zero');
  }
  validarTamanho(tamanho);
}

function validarCamposEditaveis(dados) {
  const campoInvalido = Object.keys(dados).find((campo) => !camposEditaveis.includes(campo));
  if (campoInvalido) throw erro(400, `Campo "${campoInvalido}" não é válido para Impressão`);
}

export const impressaoService = {
  listar() {
    return impressaoModel.listar();
  },

  buscarPorId(id) {
    const impressao = impressaoModel.buscarPorId(id);
    if (!impressao) throw erro(404, 'Impressão não encontrada');
    return impressao;
  },

  criar(dados = {}) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      throw erro(400, 'Os dados da impressão devem ser um objeto');
    }
    validarCamposEditaveis(dados);
    const { custo, tamanho } = dados;
    const dadosImpressao = { custo, tamanho };
    validarImpressao(dadosImpressao);
    return impressaoModel.inserir(dadosImpressao);
  },

  atualizar(id, dados = {}) {
    const atual = impressaoModel.buscarPorId(id);
    if (!atual) throw erro(404, 'Impressão não encontrada');
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      throw erro(400, 'Os dados de atualização devem ser um objeto');
    }
    validarCamposEditaveis(dados);
    validarImpressao({ ...atual, ...dados });
    return impressaoModel.atualizar(id, dados);
  },

  remover(id) {
    const removido = impressaoModel.remover(id);
    if (!removido) throw erro(404, 'Impressão não encontrada');
  },
};
