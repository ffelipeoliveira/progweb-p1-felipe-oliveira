import { criarStore } from './js/state/store.js';
import { impressaoService } from './js/services/impressaoService.js';
import { modelo3DService } from './js/services/modelo3DService.js';
import { materialService } from './js/services/materialService.js';
import { impressaoView } from './js/ui/impressaoView.js';
import { modelo3DView } from './js/ui/modelo3DView.js';
import { materialView } from './js/ui/materialView.js';
import { aviso } from './js/ui/aviso.js';

const modelos = criarStore({
  status: 'carregando',
  modelos: [],
  erro: null,
  editandoId: null,
  salvando: false,
});

const impressoes = criarStore({
  status: 'carregando',
  impressoes: [],
  modelos: [],
  materiais: [],
  erro: null,
  editandoId: null,
  salvando: false,
});

modelos.assinar(modelo3DView.render);
impressoes.assinar(impressaoView.render);

async function carregarMateriaisParaImpressoes() {
  try {
    const lista = await materialService.listar();
    impressoes.set({ materiais: lista });
    impressaoView.preencherMateriais(lista);
  } catch (e) {
    impressoes.set({ materiais: [] });
    impressaoView.preencherMateriais([]);
  }
}

async function carregarModelos() {
  modelos.set({ status: 'carregando', erro: null });
  try {
    const lista = await modelo3DService.listar();
    modelos.set({
      status: lista.length ? 'sucesso' : 'vazio',
      modelos: lista,
    });
    impressoes.set({ modelos: lista });
    impressaoView.preencherModelos(lista);
  } catch (e) {
    modelos.set({ status: 'erro', erro: e.message });
    impressoes.set({ modelos: [] });
    impressaoView.preencherModelos([]);
  }
}

async function carregarImpressoes() {
  impressoes.set({ status: 'carregando', erro: null });
  try {
    const lista = await impressaoService.listar();
    impressoes.set({
      status: lista.length ? 'sucesso' : 'vazio',
      impressoes: lista,
    });
  } catch (e) {
    impressoes.set({ status: 'erro', erro: e.message });
  }
}

async function salvarModelo(dados) {
  const { editandoId } = modelos.get();
  aviso.limpar();
  modelos.set({ salvando: true });
  try {
    if (editandoId) await modelo3DService.atualizar(editandoId, dados);
    else await modelo3DService.criar(dados);

    aviso.sucesso(editandoId ? 'Modelo 3D atualizado.' : 'Modelo 3D cadastrado.');
    modelo3DView.limparForm();
    modelos.set({ editandoId: null });
    await carregarModelos();
  } catch (e) {
    aviso.erro(e.message);
  } finally {
    modelos.set({ salvando: false });
  }
}

async function salvarImpressao(dados) {
  const { editandoId } = impressoes.get();
  aviso.limpar();
  impressoes.set({ salvando: true });
  try {
    if (editandoId) await impressaoService.atualizar(editandoId, dados);
    else await impressaoService.criar(dados);

    aviso.sucesso(editandoId ? 'Impressão atualizada.' : 'Impressão registrada.');
    impressaoView.limparForm();
    impressoes.set({ editandoId: null });
    await carregarImpressoes();
  } catch (e) {
    aviso.erro(e.message);
  } finally {
    impressoes.set({ salvando: false });
  }
}

function editarModelo(id) {
  const modelo = modelos.get().modelos.find((item) => item.id === id);
  if (!modelo) return;
  modelo3DView.preencherForm(modelo);
  modelos.set({ editandoId: id });
}

function editarImpressao(id) {
  const impressao = impressoes.get().impressoes.find((item) => item.id === id);
  if (!impressao) return;
  impressaoView.preencherForm(impressao);
  impressoes.set({ editandoId: id });
}

function cancelarEdicaoModelo() {
  modelo3DView.limparForm();
  modelos.set({ editandoId: null });
}

function cancelarEdicao() {
  impressaoView.limparForm();
  impressoes.set({ editandoId: null });
}

function iniciarCrud({ service, view, mensagens }) {
  const estado = criarStore({
    status: 'carregando',
    items: [],
    erro: null,
    editandoId: null,
    salvando: false,
  });

  estado.assinar(view.render);

  async function carregar() {
    estado.set({ status: 'carregando', erro: null });
    try {
      const items = await service.listar();
      estado.set({ status: items.length ? 'sucesso' : 'vazio', items });
    } catch (e) {
      estado.set({ status: 'erro', erro: e.message });
    }
  }

  async function salvar(dados) {
    const { editandoId } = estado.get();
    aviso.limpar();
    estado.set({ salvando: true });
    try {
      if (editandoId) await service.atualizar(editandoId, dados);
      else await service.criar(dados);

      aviso.sucesso(editandoId ? mensagens.atualizado : mensagens.cadastrado);
      view.limparForm();
      estado.set({ editandoId: null });
      await carregar();
    } catch (e) {
      aviso.erro(e.message);
    } finally {
      estado.set({ salvando: false });
    }
  }

  function editar(id) {
    const item = estado.get().items.find((entidade) => entidade.id === id);
    if (!item) return;
    view.preencherForm(item);
    estado.set({ editandoId: id });
  }

  function cancelar() {
    view.limparForm();
    estado.set({ editandoId: null });
  }

  async function remover(id) {
    if (!confirm(`Remover ${mensagens.artigo} #${id}?`)) return;
    aviso.limpar();
    try {
      await service.remover(id);
      aviso.sucesso(mensagens.removido);
      if (estado.get().editandoId === id) cancelar();
      await carregar();
    } catch (e) {
      aviso.erro(e.message);
    }
  }

  view.aoEnviar(salvar);
  view.aoCancelar(cancelar);
  view.aoRecarregar(carregar);
  view.aoClicarNaLista({ editar, remover });
  carregar();
}

async function removerModelo(id) {
  if (!confirm(`Remover o modelo 3D #${id}?`)) return;
  aviso.limpar();
  try {
    await modelo3DService.remover(id);
    aviso.sucesso('Modelo 3D removido.');
    if (modelos.get().editandoId === id) cancelarEdicaoModelo();
    await carregarModelos();
  } catch (e) {
    aviso.erro(e.message);
  }
}

async function removerImpressao(id) {
  if (!confirm(`Remover a impressão #${id}?`)) return;
  aviso.limpar();
  try {
    await impressaoService.remover(id);
    aviso.sucesso('Impressão removida.');
    if (impressoes.get().editandoId === id) cancelarEdicao();
    await carregarImpressoes();
  } catch (e) {
    aviso.erro(e.message);
  }
}

modelo3DView.aoEnviar(salvarModelo);
modelo3DView.aoCancelar(cancelarEdicaoModelo);
modelo3DView.aoRecarregar(carregarModelos);
modelo3DView.aoClicarNaLista({
  editar: editarModelo,
  remover: removerModelo,
});

impressaoView.aoEnviar(salvarImpressao);
impressaoView.aoCancelar(cancelarEdicao);
impressaoView.aoRecarregar(carregarImpressoes);
impressaoView.aoClicarNaLista({
  editar: editarImpressao,
  remover: removerImpressao,
});

iniciarCrud({
  service: materialService,
  view: materialView,
  mensagens: {
    artigo: 'o material',
    cadastrado: 'Material cadastrado.',
    atualizado: 'Material atualizado.',
    removido: 'Material removido.',
  },
});
carregarModelos();
carregarImpressoes();
carregarMateriaisParaImpressoes();
