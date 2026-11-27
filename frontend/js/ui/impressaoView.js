const el = {
  form: document.querySelector('#form-impressao'),
  modelo: document.querySelector('#imp-modelo'),
  material: document.querySelector('#imp-material'),
  salvar: document.querySelector('#imp-salvar'),
  cancelar: document.querySelector('#imp-cancelar'),
  carregando: document.querySelector('#impressoes-carregando'),
  erro: document.querySelector('#impressoes-erro'),
  erroMsg: document.querySelector('#impressoes-erro-msg'),
  recarregar: document.querySelector('#impressoes-recarregar'),
  vazio: document.querySelector('#impressoes-vazio'),
  sucesso: document.querySelector('#impressoes-sucesso'),
  linhas: document.querySelector('#impressoes-linhas'),
  total: document.querySelector('#impressoes-total'),
  custoTotal: document.querySelector('#impressoes-custo-total'),
};

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function celula(texto, classe = '') {
  const td = document.createElement('td');
  td.textContent = texto;
  td.className = classe;
  return td;
}

function botao(texto, acao, id, classe) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = texto;
  button.className = `btn btn-sm ${classe}`;
  button.dataset.acao = acao;
  button.dataset.id = id;
  return button;
}

function linha(impressao, modelos, materiais, editandoId, salvando) {
  const tr = document.createElement('tr');
  if (impressao.id === editandoId) tr.className = 'editando';
  const modelo = modelos.find((item) => item.id === impressao.modelo3DId);
  const material = materiais.find((item) => item.id === impressao.materialId);

  const acoes = celula('', 'text-end text-nowrap');
  const editar = botao('Editar', 'editar', impressao.id, 'btn-outline-primary me-1');
  const remover = botao('Remover', 'remover', impressao.id, 'btn-outline-danger');
  editar.disabled = salvando;
  remover.disabled = salvando;
  acoes.append(editar, remover);

  tr.append(
    celula(String(impressao.id), 'numero'),
    celula(modelo ? `#${modelo.id} · ${modelo.tamanho}` : `#${impressao.modelo3DId}`),
    celula(material ? `#${material.id} · ${material.tipo} · ${material.marca}` : `#${impressao.materialId}`),
    celula(moeda.format(impressao.custo), 'numero text-nowrap'),
    acoes,
  );
  return tr;
}

export const impressaoView = {
  render({ status, impressoes, modelos, materiais, erro, editandoId, salvando }) {
    el.carregando.classList.toggle('d-none', status !== 'carregando');
    el.erro.classList.toggle('d-none', status !== 'erro');
    el.vazio.classList.toggle('d-none', status !== 'vazio');
    el.sucesso.classList.toggle('d-none', status !== 'sucesso');

    el.erroMsg.textContent = erro ?? '';
    el.linhas.replaceChildren(
      ...impressoes.map((impressao) => linha(impressao, modelos, materiais, editandoId, salvando)),
    );
    el.total.textContent = String(impressoes.length);
    el.custoTotal.textContent = moeda.format(
      impressoes.reduce((total, impressao) => total + impressao.custo, 0),
    );

    el.salvar.disabled = salvando
      || el.modelo.dataset.temModelos !== 'true'
      || el.material.dataset.temMateriais !== 'true';
    el.salvar.textContent = salvando
      ? 'Salvando…'
      : editandoId ? 'Salvar alterações' : 'Registrar impressão';
    el.cancelar.classList.toggle('d-none', !editandoId);
  },

  preencherForm(impressao) {
    el.modelo.value = String(impressao.modelo3DId);
    el.material.value = String(impressao.materialId);
  },

  limparForm() {
    el.form.reset();
  },

  preencherModelos(modelos) {
    const selecionado = el.modelo.value;
    const opcoes = modelos.map((modelo) => {
      const option = document.createElement('option');
      option.value = String(modelo.id);
      option.textContent = `#${modelo.id} · ${modelo.tamanho} · ${modelo.peso} g`;
      return option;
    });
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = modelos.length
      ? 'Selecione um modelo…'
      : 'Cadastre um modelo primeiro';
    el.modelo.replaceChildren(placeholder, ...opcoes);
    el.modelo.value = modelos.some((modelo) => String(modelo.id) === selecionado)
      ? selecionado
      : '';
    el.modelo.disabled = modelos.length === 0;
    el.modelo.dataset.temModelos = String(modelos.length > 0);
    el.salvar.disabled = modelos.length === 0;
  },

  preencherMateriais(materiais) {
    const selecionado = el.material.value;
    const opcoes = materiais.map((material) => {
      const option = document.createElement('option');
      option.value = String(material.id);
      option.textContent = `#${material.id} · ${material.tipo} · ${material.marca} · R$ ${material.precoPorKg}/kg`;
      return option;
    });
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = materiais.length
      ? 'Selecione um material…'
      : 'Cadastre um material primeiro';
    el.material.replaceChildren(placeholder, ...opcoes);
    el.material.value = materiais.some((material) => String(material.id) === selecionado)
      ? selecionado
      : '';
    el.material.disabled = materiais.length === 0;
    el.material.dataset.temMateriais = String(materiais.length > 0);
  },

  aoEnviar(fn) {
    el.form.addEventListener('submit', (evento) => {
      evento.preventDefault();
      fn(Object.fromEntries(new FormData(el.form)));
    });
  },

  aoCancelar(fn) {
    el.cancelar.addEventListener('click', fn);
  },

  aoRecarregar(fn) {
    el.recarregar.addEventListener('click', fn);
  },

  aoClicarNaLista({ editar, remover }) {
    el.linhas.addEventListener('click', (evento) => {
      const alvo = evento.target.closest('button[data-acao]');
      if (!alvo) return;
      const id = Number(alvo.dataset.id);
      if (alvo.dataset.acao === 'editar') editar(id);
      if (alvo.dataset.acao === 'remover') remover(id);
    });
  },
};
