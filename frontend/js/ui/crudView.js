function celula(texto, classe = '') {
  const td = document.createElement('td');
  td.textContent = String(texto ?? '');
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

export function criarCrudView({ prefixo, campos, colunas }) {
  const el = {
    form: document.querySelector(`#${prefixo}-form`),
    salvar: document.querySelector(`#${prefixo}-salvar`),
    cancelar: document.querySelector(`#${prefixo}-cancelar`),
    carregando: document.querySelector(`#${prefixo}-carregando`),
    erro: document.querySelector(`#${prefixo}-erro`),
    erroMsg: document.querySelector(`#${prefixo}-erro-msg`),
    recarregar: document.querySelector(`#${prefixo}-recarregar`),
    vazio: document.querySelector(`#${prefixo}-vazio`),
    sucesso: document.querySelector(`#${prefixo}-sucesso`),
    linhas: document.querySelector(`#${prefixo}-linhas`),
    total: document.querySelector(`#${prefixo}-total`),
  };

  function linha(item, editandoId, salvando) {
    const tr = document.createElement('tr');
    if (item.id === editandoId) tr.className = 'editando';

    const acoes = celula('', 'text-end text-nowrap');
    const editar = botao('Editar', 'editar', item.id, 'btn-outline-primary me-1');
    const remover = botao('Remover', 'remover', item.id, 'btn-outline-danger');
    editar.disabled = salvando;
    remover.disabled = salvando;
    acoes.append(editar, remover);

    tr.append(
      celula(String(item.id), 'numero'),
      ...colunas.map(({ valor, classe = '' }) => celula(valor(item), classe)),
      acoes,
    );
    return tr;
  }

  return {
    render({ status, items, erro, editandoId, salvando }) {
      el.carregando.classList.toggle('d-none', status !== 'carregando');
      el.erro.classList.toggle('d-none', status !== 'erro');
      el.vazio.classList.toggle('d-none', status !== 'vazio');
      el.sucesso.classList.toggle('d-none', status !== 'sucesso');
      el.erroMsg.textContent = erro ?? '';
      el.linhas.replaceChildren(...items.map((item) => linha(item, editandoId, salvando)));
      el.total.textContent = String(items.length);
      el.salvar.disabled = salvando;
      el.salvar.textContent = salvando
        ? 'Salvando…'
        : editandoId ? 'Salvar alterações' : 'Cadastrar';
      el.cancelar.classList.toggle('d-none', !editandoId);
    },

    preencherForm(item) {
      for (const campo of campos) {
        const entrada = el.form.elements.namedItem(campo.nome);
        entrada.value = campo.paraFormulario ? campo.paraFormulario(item) : item[campo.nome];
      }
      el.form.elements.namedItem(campos[0].nome).focus();
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
}
