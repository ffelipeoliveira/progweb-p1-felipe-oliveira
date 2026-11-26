const el = {
  form: document.querySelector('#form-modelo'),
  peso: document.querySelector('#mod-peso'),
  tamanho: document.querySelector('#mod-tamanho'),
  tempo: document.querySelector('#mod-tempo'),
  salvar: document.querySelector('#mod-salvar'),
  cancelar: document.querySelector('#mod-cancelar'),
  carregando: document.querySelector('#modelos-carregando'),
  erro: document.querySelector('#modelos-erro'),
  erroMsg: document.querySelector('#modelos-erro-msg'),
  recarregar: document.querySelector('#modelos-recarregar'),
  vazio: document.querySelector('#modelos-vazio'),
  sucesso: document.querySelector('#modelos-sucesso'),
  linhas: document.querySelector('#modelos-linhas'),
  total: document.querySelector('#modelos-total'),
};

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

function linha(modelo, editandoId, salvando) {
  const tr = document.createElement('tr');
  if (modelo.id === editandoId) tr.className = 'editando';

  const acoes = celula('', 'text-end text-nowrap');
  const editar = botao('Editar', 'editar', modelo.id, 'btn-outline-primary me-1');
  const remover = botao('Remover', 'remover', modelo.id, 'btn-outline-danger');
  editar.disabled = salvando;
  remover.disabled = salvando;
  acoes.append(editar, remover);

  tr.append(
    celula(String(modelo.id), 'numero'),
    celula(modelo.tamanho),
    celula(`${modelo.peso} g`, 'numero text-nowrap'),
    celula(`${modelo.tempoDeImpressao} s`, 'numero text-nowrap'),
    acoes,
  );
  return tr;
}

export const modelo3DView = {
  render({ status, modelos, erro, editandoId, salvando }) {
    el.carregando.classList.toggle('d-none', status !== 'carregando');
    el.erro.classList.toggle('d-none', status !== 'erro');
    el.vazio.classList.toggle('d-none', status !== 'vazio');
    el.sucesso.classList.toggle('d-none', status !== 'sucesso');

    el.erroMsg.textContent = erro ?? '';
    el.linhas.replaceChildren(
      ...modelos.map((modelo) => linha(modelo, editandoId, salvando)),
    );
    el.total.textContent = String(modelos.length);
    el.salvar.disabled = salvando;
    el.salvar.textContent = salvando
      ? 'Salvando…'
      : editandoId ? 'Salvar alterações' : 'Cadastrar modelo';
    el.cancelar.classList.toggle('d-none', !editandoId);
  },

  preencherForm(modelo) {
    el.peso.value = modelo.peso;
    el.tamanho.value = modelo.tamanho;
    el.tempo.value = modelo.tempoDeImpressao;
    el.peso.focus();
  },

  limparForm() {
    el.form.reset();
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
