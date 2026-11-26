import { impressoraModel } from '../models/impressoraModel.js';
import { erro } from '../routes/erro.js';

const camposEditaveis = ['modelo', 'marca', 'areaDeImpressao'];

function validarTexto(valor, campo) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw erro(400, `O campo "${campo}" é obrigatório`);
  }
}

function validarAreaDeImpressao(areaDeImpressao) {
  if (typeof areaDeImpressao === 'number') {
    if (!Number.isFinite(areaDeImpressao) || areaDeImpressao <= 0) {
      throw erro(400, 'A área de impressão deve ser maior que zero');
    }
    return;
  }
  if (typeof areaDeImpressao !== 'string' || areaDeImpressao.trim() === '') {
    throw erro(400, 'A área de impressão é obrigatória');
  }
}

function validarImpressora({ modelo, marca, areaDeImpressao }) {
  validarTexto(modelo, 'modelo');
  validarTexto(marca, 'marca');
  validarAreaDeImpressao(areaDeImpressao);
}

function validarCamposEditaveis(dados) {
  const campoInvalido = Object.keys(dados).find((campo) => !camposEditaveis.includes(campo));
  if (campoInvalido) throw erro(400, `Campo "${campoInvalido}" não é válido para Impressora`);
}

export const impressoraService = {
  listar() {
    return impressoraModel.listar();
  },

  buscarPorId(id) {
    const impressora = impressoraModel.buscarPorId(id);
    if (!impressora) throw erro(404, 'Impressora não encontrada');
    return impressora;
  },

  criar(dados = {}) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      throw erro(400, 'Os dados da impressora devem ser um objeto');
    }
    validarCamposEditaveis(dados);
    const { modelo, marca, areaDeImpressao } = dados;
    const dadosImpressora = { modelo, marca, areaDeImpressao };
    validarImpressora(dadosImpressora);
    return impressoraModel.inserir(dadosImpressora);
  },

  atualizar(id, dados = {}) {
    const atual = impressoraModel.buscarPorId(id);
    if (!atual) throw erro(404, 'Impressora não encontrada');
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      throw erro(400, 'Os dados de atualização devem ser um objeto');
    }
    validarCamposEditaveis(dados);
    validarImpressora({ ...atual, ...dados });
    return impressoraModel.atualizar(id, dados);
  },

  remover(id) {
    if (!impressoraModel.buscarPorId(id)) throw erro(404, 'Impressora não encontrada');
    impressoraModel.remover(id);
  },
};
