import { modelo3DModel } from '../models/modelo3DModel.js';
import { impressaoModel } from '../models/impressaoModel.js';
import { erro } from '../routes/erro.js';

const camposEditaveis = ['peso', 'tamanho', 'url'];

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

function validarModelo3D({ peso, tamanho, url }) {
  if (peso == null || tamanho == null) {
    throw erro(400, 'Campos "peso" e "tamanho" são obrigatórios');
  }
  if (typeof peso !== 'number' || !Number.isFinite(peso) || peso <= 0) {
    throw erro(400, 'O peso deve ser um número maior que zero');
  }
  validarTamanho(tamanho);
  if (url != null && (typeof url !== 'string' || url.trim() === '')) {
    throw erro(400, 'A URL deve ser um texto não vazio');
  }
}

function validarCamposEditaveis(dados) {
  const campoInvalido = Object.keys(dados).find((campo) => !camposEditaveis.includes(campo));
  if (campoInvalido) throw erro(400, `Campo "${campoInvalido}" não é válido para Modelo3D`);
}

export const modelo3DService = {
  listar() {
    return modelo3DModel.listar();
  },

  buscarPorId(id) {
    const modelo3D = modelo3DModel.buscarPorId(id);
    if (!modelo3D) throw erro(404, 'Modelo 3D não encontrado');
    return modelo3D;
  },

  criar(dados = {}) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      throw erro(400, 'Os dados do modelo 3D devem ser um objeto');
    }
    validarCamposEditaveis(dados);
    const { peso, tamanho, url = null } = dados;
    const dadosModelo3D = { peso, tamanho, url };
    validarModelo3D(dadosModelo3D);
    return modelo3DModel.inserir(dadosModelo3D);
  },

  atualizar(id, dados = {}) {
    const atual = modelo3DModel.buscarPorId(id);
    if (!atual) throw erro(404, 'Modelo 3D não encontrado');
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      throw erro(400, 'Os dados de atualização devem ser um objeto');
    }
    validarCamposEditaveis(dados);
    const dadosAtualizados = { ...atual, ...dados };
    validarModelo3D(dadosAtualizados);
    return modelo3DModel.atualizar(id, dados);
  },

  remover(id) {
    if (!modelo3DModel.buscarPorId(id)) throw erro(404, 'Modelo 3D não encontrado');
    if (impressaoModel.listar().some((impressao) => impressao.modelo3DId === id)) {
      throw erro(409, 'Não é possível remover um modelo 3D associado a impressões');
    }
    modelo3DModel.remover(id);
  },
};
