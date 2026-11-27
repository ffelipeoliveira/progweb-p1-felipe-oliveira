import { impressaoModel } from '../models/impressaoModel.js';
import { modelo3DModel } from '../models/modelo3DModel.js';
import { materialModel } from '../models/materialModel.js';
import { erro } from '../routes/erro.js';

const camposEditaveis = ['modelo3DId', 'materialId'];

function validarImpressao({ modelo3DId, materialId }) {
  if (modelo3DId == null || materialId == null) {
    throw erro(400, 'Campos "modelo3DId" e "materialId" são obrigatórios');
  }
  if (!Number.isInteger(modelo3DId) || modelo3DId <= 0) {
    throw erro(400, 'O modelo 3D informado é inválido');
  }
  if (!modelo3DModel.buscarPorId(modelo3DId)) {
    throw erro(404, 'Modelo 3D não encontrado');
  }
  if (!Number.isInteger(materialId) || materialId <= 0) {
    throw erro(400, 'O material informado é inválido');
  }
  if (!materialModel.buscarPorId(materialId)) {
    throw erro(404, 'Material não encontrado');
  }
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
    const { modelo3DId, materialId } = dados;
    const dadosImpressao = { modelo3DId, materialId };
    validarImpressao(dadosImpressao);
    const modelo = modelo3DModel.buscarPorId(modelo3DId);
    const material = materialModel.buscarPorId(materialId);
    const custo = Number(((material.precoPorKg / 1000) * modelo.peso).toFixed(2));
    return impressaoModel.inserir({ ...dadosImpressao, custo });
  },

  atualizar(id, dados = {}) {
    const atual = impressaoModel.buscarPorId(id);
    if (!atual) throw erro(404, 'Impressão não encontrada');
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      throw erro(400, 'Os dados de atualização devem ser um objeto');
    }
    validarCamposEditaveis(dados);
    const dadosAtualizados = { ...atual, ...dados };
    validarImpressao(dadosAtualizados);
    const modelo = modelo3DModel.buscarPorId(dadosAtualizados.modelo3DId);
    const material = materialModel.buscarPorId(dadosAtualizados.materialId);
    const custo = Number(((material.precoPorKg / 1000) * modelo.peso).toFixed(2));
    return impressaoModel.atualizar(id, { ...dados, custo });
  },

  remover(id) {
    const removido = impressaoModel.remover(id);
    if (!removido) throw erro(404, 'Impressão não encontrada');
  },
};
