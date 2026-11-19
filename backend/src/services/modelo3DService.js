import { modelo3DModel } from '../models/modelo3DModel.js';
import { erro } from '../routes/erro.js';

const camposEditaveis = ['peso', 'tamanho', 'tempoDeImpressao'];

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

function validarModelo3D({ peso, tamanho, tempoDeImpressao }) {
  if (
    peso == null ||
    tamanho == null ||
    tempoDeImpressao == null ||
    tempoDeImpressao === ''
  ) {
    throw erro(400, 'Campos "peso", "tamanho" e "tempoDeImpressao" são obrigatórios');
  }
  if (typeof peso !== 'number' || !Number.isFinite(peso) || peso <= 0) {
    throw erro(400, 'O peso deve ser um número maior que zero');
  }
  validarTamanho(tamanho);
  if (
    typeof tempoDeImpressao !== 'number' ||
    !Number.isFinite(tempoDeImpressao) ||
    tempoDeImpressao < 0
  ) {
    throw erro(400, 'O tempo de impressão deve ser um número maior ou igual a zero');
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
    const { peso, tamanho, tempoDeImpressao } = dados;
    const dadosModelo3D = { peso, tamanho, tempoDeImpressao };
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
    const removido = modelo3DModel.remover(id);
    if (!removido) throw erro(404, 'Modelo 3D não encontrado');
  },
};
