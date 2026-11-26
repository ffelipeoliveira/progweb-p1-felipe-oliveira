import { embalagemModel } from '../models/embalagemModel.js';
import { erro } from '../routes/erro.js';

const camposEditaveis = ['custo', 'tamanho', 'opcionais'];

function validarTamanho(tamanho) {
  if (typeof tamanho === 'number') {
    if (!Number.isFinite(tamanho) || tamanho <= 0) {
      throw erro(400, 'O tamanho deve ser um número maior que zero');
    }
    return;
  }
  if (typeof tamanho !== 'string' || tamanho.trim() === '') {
    throw erro(400, 'O tamanho é obrigatório');
  }
}

function validarEmbalagem({ custo, tamanho, opcionais }) {
  if (typeof custo !== 'number' || !Number.isFinite(custo) || custo < 0) {
    throw erro(400, 'O custo deve ser um número maior ou igual a zero');
  }
  validarTamanho(tamanho);
  if (!Array.isArray(opcionais) || opcionais.some((opcional) => typeof opcional !== 'string')) {
    throw erro(400, 'Os opcionais devem ser uma lista de textos');
  }
}

function validarCamposEditaveis(dados) {
  const campoInvalido = Object.keys(dados).find((campo) => !camposEditaveis.includes(campo));
  if (campoInvalido) throw erro(400, `Campo "${campoInvalido}" não é válido para Embalagem`);
}

export const embalagemService = {
  listar() {
    return embalagemModel.listar();
  },

  buscarPorId(id) {
    const embalagem = embalagemModel.buscarPorId(id);
    if (!embalagem) throw erro(404, 'Embalagem não encontrada');
    return embalagem;
  },

  criar(dados = {}) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      throw erro(400, 'Os dados da embalagem devem ser um objeto');
    }
    validarCamposEditaveis(dados);
    const { custo, tamanho, opcionais = [] } = dados;
    const dadosEmbalagem = { custo, tamanho, opcionais };
    validarEmbalagem(dadosEmbalagem);
    return embalagemModel.inserir(dadosEmbalagem);
  },

  atualizar(id, dados = {}) {
    const atual = embalagemModel.buscarPorId(id);
    if (!atual) throw erro(404, 'Embalagem não encontrada');
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      throw erro(400, 'Os dados de atualização devem ser um objeto');
    }
    validarCamposEditaveis(dados);
    validarEmbalagem({ ...atual, ...dados });
    return embalagemModel.atualizar(id, dados);
  },

  remover(id) {
    if (!embalagemModel.buscarPorId(id)) throw erro(404, 'Embalagem não encontrada');
    embalagemModel.remover(id);
  },
};
