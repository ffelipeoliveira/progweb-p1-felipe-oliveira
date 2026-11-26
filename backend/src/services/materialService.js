import { materialModel } from '../models/materialModel.js';
import { erro } from '../routes/erro.js';

const camposEditaveis = ['tipo', 'marca', 'preco', 'qtdEmGramas'];

function validarTexto(valor, campo) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw erro(400, `O campo "${campo}" é obrigatório`);
  }
}

function validarMaterial({ tipo, marca, preco, qtdEmGramas }) {
  validarTexto(tipo, 'tipo');
  validarTexto(marca, 'marca');
  if (typeof preco !== 'number' || !Number.isFinite(preco) || preco < 0) {
    throw erro(400, 'O preço deve ser um número maior ou igual a zero');
  }
  if (
    typeof qtdEmGramas !== 'number' ||
    !Number.isFinite(qtdEmGramas) ||
    qtdEmGramas <= 0
  ) {
    throw erro(400, 'A quantidade em gramas deve ser um número maior que zero');
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
    const { tipo, marca, preco, qtdEmGramas } = dados;
    const dadosMaterial = { tipo, marca, preco, qtdEmGramas };
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
    const dadosAtualizados = { ...atual, ...dados };
    validarMaterial(dadosAtualizados);
    return materialModel.atualizar(id, dados);
  },

  remover(id) {
    if (!materialModel.buscarPorId(id)) throw erro(404, 'Material não encontrado');
    materialModel.remover(id);
  },
};
