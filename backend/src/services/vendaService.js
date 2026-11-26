import { vendaModel } from '../models/vendaModel.js';
import { erro } from '../routes/erro.js';

const camposEditaveis = ['preco', 'custo'];

function validarVenda({ preco, custo }) {
  if (typeof preco !== 'number' || !Number.isFinite(preco) || preco < 0) {
    throw erro(400, 'O preço deve ser um número maior ou igual a zero');
  }
  if (typeof custo !== 'number' || !Number.isFinite(custo) || custo < 0) {
    throw erro(400, 'O custo deve ser um número maior ou igual a zero');
  }
}

function validarCamposEditaveis(dados) {
  const campoInvalido = Object.keys(dados).find((campo) => !camposEditaveis.includes(campo));
  if (campoInvalido) throw erro(400, `Campo "${campoInvalido}" não é válido para Venda`);
}

function lucroDaVenda({ preco, custo }) {
  return Number((preco - custo).toFixed(2));
}

export const vendaService = {
  listar() {
    return vendaModel.listar();
  },

  buscarPorId(id) {
    const venda = vendaModel.buscarPorId(id);
    if (!venda) throw erro(404, 'Venda não encontrada');
    return venda;
  },

  criar(dados = {}) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      throw erro(400, 'Os dados da venda devem ser um objeto');
    }
    validarCamposEditaveis(dados);
    const { preco, custo } = dados;
    const dadosVenda = { preco, custo };
    validarVenda(dadosVenda);
    return vendaModel.inserir({ ...dadosVenda, lucro: lucroDaVenda(dadosVenda) });
  },

  atualizar(id, dados = {}) {
    const atual = vendaModel.buscarPorId(id);
    if (!atual) throw erro(404, 'Venda não encontrada');
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      throw erro(400, 'Os dados de atualização devem ser um objeto');
    }
    validarCamposEditaveis(dados);
    const dadosAtualizados = { ...atual, ...dados };
    validarVenda(dadosAtualizados);
    return vendaModel.atualizar(id, {
      ...dados,
      lucro: lucroDaVenda(dadosAtualizados),
    });
  },

  remover(id) {
    if (!vendaModel.buscarPorId(id)) throw erro(404, 'Venda não encontrada');
    vendaModel.remover(id);
  },
};
