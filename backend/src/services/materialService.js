import { materialModel } from '../models/materialModel.js';
import { erro } from '../routes/erro.js';

const camposEditaveis = ['tipo', 'marca', 'precoPorKg', 'preco'];

function validarTexto(valor, campo) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw erro(400, `O campo "${campo}" é obrigatório`);
  }
}

function validarMaterial({ tipo, marca, precoPorKg }) {
  validarTexto(tipo, 'tipo');
  validarTexto(marca, 'marca');
  if (typeof precoPorKg !== 'number' || !Number.isFinite(precoPorKg) || precoPorKg < 0) {
    throw erro(400, 'O preço por kg deve ser um número maior ou igual a zero');
  }
}

function validarCamposEditaveis(dados) {
  const campoInvalido = Object.keys(dados).find((campo) => !camposEditaveis.includes(campo));
  if (campoInvalido) throw erro(400, `Campo "${campoInvalido}" não é válido para Material`);
}

export const materialService = {
  listar() {
    return materialModel.listar();
  },

  buscarPorId(id) {
    const material = materialModel.buscarPorId(id);
    if (!material) throw erro(404, 'Material não encontrado');
    return material;
  },

  criar(dados = {}) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      throw erro(400, 'Os dados do material devem ser um objeto');
    }
    validarCamposEditaveis(dados);
    const precoPorKg = dados.precoPorKg ?? dados.preco;
    const { tipo, marca } = dados;
    const dadosMaterial = { tipo, marca, precoPorKg };
    validarMaterial(dadosMaterial);
    return materialModel.inserir(dadosMaterial);
  },

  atualizar(id, dados = {}) {
    const atual = materialModel.buscarPorId(id);
    if (!atual) throw erro(404, 'Material não encontrado');
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      throw erro(400, 'Os dados de atualização devem ser um objeto');
    }
    validarCamposEditaveis(dados);
    const dadosNormalizados = {
      ...dados,
      ...(dados.precoPorKg == null && dados.preco != null
        ? { precoPorKg: dados.preco }
        : {}),
    };
    delete dadosNormalizados.preco;
    const dadosAtualizados = { ...atual, ...dadosNormalizados };
    validarMaterial(dadosAtualizados);
    return materialModel.atualizar(id, dadosNormalizados);
  },

  remover(id) {
    if (!materialModel.buscarPorId(id)) throw erro(404, 'Material não encontrado');
    materialModel.remover(id);
  },
};
