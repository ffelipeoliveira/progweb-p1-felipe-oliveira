# Tutorial — Frontend SPA em Vanilla JS + Bootstrap, em camadas

**Semana 4 · Mãos à Obra (Aula 2) · Programação Web · UEPB · 2026.2**
**Prof. Rodrigo Alves Costa · quarta-feira, 11/11/2026**

Hoje a API da Semana 3 ganha uma tela. Na Parte A construímos juntos o painel de **clientes** do banco; na Parte B você cria a pasta `frontend/` do **seu Projeto 1**.

> **Faltou hoje?** Este tutorial é completo: siga do começo ao fim. O projeto pronto da Parte A está em `S4_banco-frontend.zip`, anexado à atividade.

---

## Na Aula 1 vimos…

1. **HTML semântico e o DOM** (slides 4, 6 e 13): a tag certa (`<form>`, `<label>`, `<button>`) já traz comportamento; o JavaScript altera a árvore do DOM (Document Object Model) e a tela muda. Usamos `textContent`, nunca `innerHTML`, com dado do usuário.
2. **Bootstrap, grid e CDN com SRI** (slides 10 e 12): `container > row > col-lg-4 + col-lg-8`, carregado de uma CDN (Content Delivery Network) com versão fixa e `integrity`.
3. **`fetch()` e suas pegadinhas** (slide 15): só rejeita quando não há resposta; 404 e 500 exigem `resp.ok`; 204 não tem corpo.
4. **CORS** (slide 16): front em `:5500` e API em `:3000` são origens diferentes; quem autoriza é o servidor, com o middleware `cors`.
5. **Camadas e os quatro estados** (slides 17 e 19): `api / services / state / ui`, e toda lista com **carregando, vazio, erro e sucesso**.

---

## Roteiro da aula (2h)

| Bloco | Tempo | O que acontece |
|---|---|---|
| Setup | 10 min | Conferir o ambiente; **merge do PR da S3**; branch de hoje |
| Parte A | 50 min | O professor constrói a tela de clientes; você replica em `s4/banco-frontend/` |
| Parte B | 50 min | Você cria `frontend/` no **seu** Projeto 1, com as suas duas entidades |
| Fechamento | 10 min | `TELAS.md`, commit, push, pull request, plenária |

**Entregável:** link do pull request `feature/s4-frontend → main`, postado na atividade **"S4 · Mãos à Obra"** do Google Classroom, até **quinta 12/11, 23h59**.

---

# Setup (10 min)

## Passo 0.1 — Conferir o ambiente

```bash
node -v      # v22 ou superior
git --version
```

Você também precisa de um navegador com DevTools (Chrome, Edge ou Firefox: tecla `F12`).

### ✅ Checkpoint 0.1
`node -v` mostra `v22.x` ou maior.

## Passo 0.2 — Merge do pull request da S3

O PR `feature/s3-backend` ficou aberto. Hoje ele entra na `main`.

**Pelo terminal** (com o `gh` autenticado), dentro da pasta do repositório:

```bash
cd progweb-p1-nome-sobrenome      # ajuste para o seu nome
gh pr list                        # mostra o PR aberto e o número dele
gh pr merge 3 --merge --delete-branch     # troque 3 pelo número que apareceu
```

<details>
<summary><strong>Sem o gh? Caminho pelo site</strong></summary>

1. Abra `https://github.com/SEU-USUARIO/progweb-p1-nome-sobrenome/pulls`.
2. Abra o PR da S3 → botão verde **Merge pull request** → **Confirm merge** → **Delete branch**.

</details>

Agora traga a `main` atualizada e crie a branch de hoje:

```bash
git switch main
git pull
git switch -c feature/s4-frontend
```

### ✅ Checkpoint 0.2
`ls` mostra `MODELAGEM.md`, `README.md`, `backend/`, `s1/`, `s2/` e `s3/`. `git branch` mostra `* feature/s4-frontend`.

> **Faltou na S3, ou a sua `s3/banco-api` não roda?** Descompacte o `S4_banco-frontend.zip`: ele traz uma `s3/banco-api/` completa (clientes e contas, já com CORS). Copie-a para o seu repositório, rode `npm install` dentro dela e siga. A Parte B exige o **seu** `backend/`: sem ele, faça a Parte A hoje e deixe a Parte B para depois de fechar a S3.

---

# Parte A — Demo do professor, replicada (50 min)

Vamos construir o **painel de clientes** em camadas, na ordem em que os dados viajam: HTML → camada HTTP → service → estado → view → `main.js`.

A estrutura final:

```
s4/banco-frontend/
├── index.html                  # estrutura + Bootstrap
├── css/
│   └── style.css               # só os ajustes próprios
└── js/
    ├── config.js               # URL da API
    ├── api.js                  # camada HTTP (fetch)
    ├── services/
    │   └── clienteService.js   # regras do front: limpar e validar
    ├── state/
    │   └── store.js            # o estado da tela e quem o assina
    ├── ui/
    │   ├── aviso.js            # faixa de mensagens
    │   └── clienteView.js      # desenha no DOM e avisa dos eventos
    └── main.js                 # liga tudo
```

**Regra de ouro (a mesma da S3, do outro lado do fio):**

| Camada | Faz | Não faz |
|---|---|---|
| **api** | `fetch`, URL, headers, status, JSON | não valida regra, não toca no DOM |
| **services** | limpa e valida os dados; chama a `api` | não conhece `fetch` nem o DOM |
| **state** | guarda o estado da tela; avisa quem assinou | não busca dados, não desenha |
| **ui** | desenha o estado no DOM; captura eventos | não faz `fetch`, não decide regra |
| **main.js** | liga store, service e view | não contém regra nem HTML |

## Passo A1 — Subir a API da S3

Em um terminal, que vai ficar aberto a aula toda:

```bash
cd s3/banco-api
npm run dev
```

### ✅ Checkpoint A1
O terminal mostra `Banco API em http://localhost:3000`. No navegador, `http://localhost:3000/clientes` mostra `[]`.

## Passo A2 — Criar a pasta do front

Em um **segundo terminal**, na raiz do repositório:

```bash
mkdir -p s4/banco-frontend
cd s4/banco-frontend
mkdir -p css js/services js/state js/ui
code .        # opcional: abre o VS Code nesta pasta
```

Repare: **não há `npm init`**. O front de hoje não tem dependências nem etapa de build. O navegador executa os arquivos como estão.

## Passo A3 — `index.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Banco · Painel</title>
  <!-- Bootstrap 5.3.8 via CDN, com SRI: o navegador confere o hash do arquivo -->
  <link rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
    integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
    crossorigin="anonymous">
  <link rel="stylesheet" href="css/style.css">
</head>
<body class="bg-body-tertiary">
  <header class="bg-primary text-white py-3 mb-4">
    <div class="container">
      <h1 class="h3 mb-0">Banco · Painel</h1>
      <p class="mb-0 small">SPA em Vanilla JS consumindo a API da Semana 3</p>
    </div>
  </header>

  <main class="container">
    <!-- Resultado das ações (criar, editar, remover) -->
    <div id="aviso" class="alert d-none" role="status" aria-live="polite"></div>

    <!-- ===================== CLIENTES ===================== -->
    <section class="row g-4 mb-5" aria-labelledby="titulo-clientes">
      <!-- Grid de 12 colunas: 4 para o formulário, 8 para a lista -->
      <div class="col-lg-4">
        <div class="card shadow-sm">
          <div class="card-header">
            <h2 id="titulo-clientes" class="h5 mb-0">Clientes</h2>
          </div>
          <form id="form-cliente" class="card-body" novalidate>
            <div class="mb-3">
              <label for="cli-nome" class="form-label">Nome</label>
              <input id="cli-nome" name="nome" type="text" class="form-control" required>
            </div>
            <div class="mb-3">
              <label for="cli-cpf" class="form-label">CPF</label>
              <input id="cli-cpf" name="cpf" type="text" class="form-control"
                inputmode="numeric" placeholder="000.000.000-00" required>
            </div>
            <div class="mb-3">
              <label for="cli-email" class="form-label">E-mail (opcional)</label>
              <input id="cli-email" name="email" type="email" class="form-control">
            </div>
            <div class="d-flex gap-2">
              <button id="cli-salvar" type="submit" class="btn btn-primary">Cadastrar cliente</button>
              <button id="cli-cancelar" type="button" class="btn btn-outline-secondary d-none">Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-body">
            <!-- Os quatro estados da lista: só um aparece por vez -->
            <div id="clientes-carregando" class="text-center py-4">
              <div class="spinner-border text-primary" aria-hidden="true"></div>
              <p class="text-muted mt-2 mb-0">Carregando clientes…</p>
            </div>

            <div id="clientes-erro" class="alert alert-danger mb-0 d-none" role="alert">
              <p id="clientes-erro-msg" class="mb-2"></p>
              <button id="clientes-recarregar" type="button" class="btn btn-sm btn-outline-danger">Tentar de novo</button>
            </div>

            <p id="clientes-vazio" class="text-muted text-center py-4 mb-0 d-none">
              Nenhum cliente ainda. Cadastre o primeiro no formulário.
            </p>

            <div id="clientes-sucesso" class="table-responsive d-none">
              <table class="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                  <th scope="col">#</th>
                  <th scope="col">Nome</th>
                  <th scope="col">CPF</th>
                  <th scope="col">E-mail</th>
                  <th scope="col" class="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody id="clientes-linhas"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>

  </main>

  <footer class="container text-muted small pb-4">
    Programação Web · UEPB · 2026.2 · Semana 4
  </footer>

  <!-- type="module": habilita import/export e só roda depois de o HTML virar DOM -->
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

**Pare e explique:**
- **HTML semântico:** `<header>`, `<main>`, `<section>`, `<form>`, `<label for>`, `<button type="submit">`. Cada campo tem `name`: é o que o `FormData` vai ler no Passo A10.
- **Bootstrap pela CDN com SRI** (Subresource Integrity): versão fixa `@5.3.8` e o hash no `integrity`. Se o arquivo da CDN for adulterado, o navegador o recusa. Copie o hash exatamente; um caractere errado e a página fica sem estilo.
- **Grid:** `row` com `col-lg-4` (formulário) e `col-lg-8` (lista). Abaixo de 992 px as duas colunas empilham.
- **Os quatro estados já estão no HTML**, como quatro blocos irmãos. Três nascem escondidos com `d-none`; o `carregando` nasce visível. O JavaScript só vai trocar qual deles aparece.
- **`<script type="module">`** no fim: habilita `import`/`export` e só executa depois de o HTML virar DOM.

## Passo A4 — Servir o front por HTTP

No segundo terminal, dentro de `s4/banco-frontend`:

```bash
npx http-server -p 5500 -c-1
```

Na primeira vez o `npx` pergunta `Ok to proceed? (y)`: responda `y`. `-p 5500` é a porta; `-c-1` desliga o cache, para você sempre ver a última versão.

Abra **http://localhost:5500** e aperte `F12`.

<details>
<summary><strong>Alternativa: extensão Live Server do VS Code</strong></summary>

Instale a extensão **Live Server** (Ritwick Dey), abra `index.html` e clique em **Go Live** na barra inferior. Ela abre em `http://127.0.0.1:5500` e recarrega a página a cada salvamento. Se a porta for outra (5501, por exemplo), use essa porta no Passo A7.

</details>

> **Por que não dar duplo clique no `index.html`?** Aberto como `file://`, o navegador **bloqueia os módulos** (`type="module"`). Front é servido por HTTP, sempre.

### ✅ Checkpoint A4
A página aparece estilizada (cabeçalho azul, formulário à esquerda) e a lista mostra o **spinner girando para sempre**. No Console há um erro 404 para `js/main.js`: ele ainda não existe. É o esperado.

## Passo A5 — `js/config.js` e `js/api.js` (camada HTTP)

`js/config.js`:

```javascript
// O único arquivo que sabe onde a API mora.
// No deploy (S5), o endereço muda aqui e em mais nenhum lugar.
export const API_URL = 'http://localhost:3000';
```

`js/api.js`:

```javascript
import { API_URL } from './config.js';

// Camada HTTP: a única que conhece fetch, URL, headers e status.
async function request(metodo, caminho, dados) {
  const opcoes = { method: metodo, headers: {} };
  if (dados !== undefined) {
    opcoes.headers['Content-Type'] = 'application/json';
    opcoes.body = JSON.stringify(dados); // objeto JS → texto JSON
  }

  let resp;
  try {
    resp = await fetch(`${API_URL}${caminho}`, opcoes);
  } catch {
    // O fetch só rejeita quando NÃO houve resposta:
    // API fora do ar, bloqueio de CORS ou falta de rede.
    throw new Error('Não consegui falar com a API. Ela está rodando?');
  }

  if (resp.status === 204) return null; // sem corpo: nada de .json()

  const corpo = await resp.json().catch(() => null);

  // 4xx e 5xx NÃO rejeitam o fetch. Quem decide é o resp.ok.
  if (!resp.ok) throw new Error(corpo?.erro ?? `Erro ${resp.status}`);

  return corpo;
}

export const api = {
  get: (caminho) => request('GET', caminho),
  post: (caminho, dados) => request('POST', caminho, dados),
  put: (caminho, dados) => request('PUT', caminho, dados),
  delete: (caminho) => request('DELETE', caminho),
};
```

**Pare e explique** (são as quatro pegadinhas do slide 15, resolvidas uma única vez):
- **`try/catch` em volta do `fetch`:** ele só rejeita quando **não houve resposta** (API fora do ar, CORS, sem rede). Trocamos o `TypeError: Failed to fetch` por uma frase que o usuário entende.
- **`resp.status === 204`:** o `DELETE` da nossa API responde sem corpo. Chamar `.json()` ali lança erro.
- **`resp.ok`:** 400, 404, 409 e 500 **não** rejeitam o `fetch`. Nós lançamos, usando a mensagem que o backend mandou em `{ "erro": "…" }` (formato definido no `errorHandler` da S3).
- **`Content-Type` só quando há corpo.** Sem ele, o `express.json()` ignora o body.
- Quem chama `api.get('/clientes')` não sabe nada disso. É a camada que fala com o mundo de fora, como o model no backend.

## Passo A6 — Ver o erro de CORS (de propósito)

Crie um `js/main.js` **provisório**, só para testar a camada HTTP:

```javascript
import { api } from './api.js';

console.log(await api.get('/clientes'));
```

Salve e recarregue a página (`F5`), com o Console aberto.

### ✅ Checkpoint A6
O Console mostra, em vermelho, algo como:

```
Access to fetch at 'http://localhost:3000/clientes' from origin 'http://localhost:5500'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
on the requested resource.
```

seguido de `Uncaught Error: Não consegui falar com a API. Ela está rodando?`.

Olhe o **terminal da API**: a linha `GET /clientes` apareceu no log. A requisição **chegou** e foi respondida; foi o **navegador** que se recusou a entregar a resposta ao JavaScript. É a same-origin policy: `:5500` e `:3000` são origens diferentes.

## Passo A7 — Habilitar o CORS no backend

No **terminal da API**, pare o servidor (`Ctrl+C`) e instale o middleware:

```bash
npm install cors
```

Em `s3/banco-api/src/app.js`, acrescente o `import` e o `app.use`, **antes** dos outros middlewares e das rotas:

```javascript
import express from 'express';
import cors from 'cors';                      // ← novo
import clientesRouter from './routes/clientes.js';
// ...demais imports iguais

const app = express();

// --- Middleware global (antes das rotas) ---
app.use(cors({                                // ← novo
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
}));
app.use(express.json());
app.use(logger);
// ...o resto do arquivo não muda
```

Suba de novo: `npm run dev`. Recarregue o front.

**Pare e explique:**
- O `cors` responde o **preflight** (`OPTIONS`) e põe o cabeçalho `Access-Control-Allow-Origin` nas respostas.
- **Antes das rotas**, porque middleware roda na ordem de registro (S3).
- Liberamos **só as origens do nosso front**, nas duas grafias (`localhost` e `127.0.0.1` são origens diferentes). `cors()` vazio liberaria para qualquer site.

### ✅ Checkpoint A7
O Console mostra `[]` (um array vazio), sem erro vermelho. Na aba **Network**, clique na requisição `clientes` → **Headers** → *Response Headers*: lá está `Access-Control-Allow-Origin: http://localhost:5500`.

## Passo A8 — `js/services/clienteService.js`

```javascript
import { api } from '../api.js';

// Regras do lado do front: limpar e validar ANTES de gastar uma requisição.
// O backend valida de novo: nunca confie só no front.
function preparar({ nome, cpf, email }) {
  const dados = {
    nome: (nome ?? '').trim(),
    cpf: (cpf ?? '').replace(/\D/g, ''), // fica só com os dígitos
    email: (email ?? '').trim() || null,
  };
  if (!dados.nome) throw new Error('Informe o nome.');
  if (dados.cpf.length !== 11) throw new Error('O CPF precisa ter 11 dígitos.');
  return dados;
}

export const clienteService = {
  listar() {
    return api.get('/clientes');
  },

  async criar(dados) {
    return api.post('/clientes', preparar(dados));
  },

  async atualizar(id, dados) {
    return api.put(`/clientes/${id}`, preparar(dados));
  },

  remover(id) {
    return api.delete(`/clientes/${id}`);
  },
};
```

**Pare e explique:**
- O service **prepara** os dados (tira espaços, deixa só os dígitos do CPF) e **valida** antes de gastar uma requisição.
- Ele lança `Error` com uma mensagem pronta para a tela. Não conhece `fetch` e não toca no DOM.
- **Validar no front não dispensa validar no back.** A do front é conforto (resposta imediata); a do back é segurança (qualquer um chama a API pelo Thunder Client).
- `criar` e `atualizar` são `async` para que o erro de validação vire uma Promise rejeitada, tratada no mesmo `catch` que os erros da API.

## Passo A9 — `js/state/store.js`

```javascript
// O estado da tela em um lugar só.
// Quem muda o estado (set) avisa quem desenha (os assinantes).
export function criarStore(inicial) {
  let estado = { ...inicial };
  const assinantes = [];

  return {
    get() {
      return estado;
    },

    set(parcial) {
      estado = { ...estado, ...parcial };
      assinantes.forEach((fn) => fn(estado));
    },

    assinar(fn) {
      assinantes.push(fn);
      fn(estado); // desenha o estado inicial
    },
  };
}
```

**Pare e explique:**
- São 20 linhas e é a ideia mais importante do dia: **o estado da tela mora em um lugar só**. Quem quer mudar a tela chama `set`; quem desenha se inscreve com `assinar`.
- `set` cria um objeto novo com `{ ...estado, ...parcial }` e avisa todos os assinantes.
- É o padrão **Observer**. Na S8 você vai reencontrá-lo com o nome de `useState`.

## Passo A10 — `js/ui/aviso.js` e `js/ui/clienteView.js`

`js/ui/aviso.js`:

```javascript
// Faixa de mensagem no topo: resultado das ações (criar, editar, remover).
const caixa = document.querySelector('#aviso');

function mostrar(tipo, texto) {
  caixa.className = `alert alert-${tipo}`;
  caixa.textContent = texto; // textContent: nunca interpreta HTML
}

export const aviso = {
  sucesso: (texto) => mostrar('success', texto),
  erro: (texto) => mostrar('danger', texto),
  limpar() {
    caixa.className = 'alert d-none';
    caixa.textContent = '';
  },
};
```

`js/ui/clienteView.js`:

```javascript
// Camada de UI: a única que toca no DOM dos clientes.
// Não faz fetch e não valida regra: desenha o estado e avisa dos eventos.
const el = {
  form: document.querySelector('#form-cliente'),
  salvar: document.querySelector('#cli-salvar'),
  cancelar: document.querySelector('#cli-cancelar'),
  carregando: document.querySelector('#clientes-carregando'),
  erro: document.querySelector('#clientes-erro'),
  erroMsg: document.querySelector('#clientes-erro-msg'),
  recarregar: document.querySelector('#clientes-recarregar'),
  vazio: document.querySelector('#clientes-vazio'),
  sucesso: document.querySelector('#clientes-sucesso'),
  linhas: document.querySelector('#clientes-linhas'),
};

function formatarCpf(cpf) {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

function celula(texto, classe = '') {
  const td = document.createElement('td');
  td.textContent = texto; // dado do usuário entra como TEXTO, nunca como HTML
  td.className = classe;
  return td;
}

function botao(texto, acao, id, classe) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = texto;
  b.className = `btn btn-sm ${classe}`;
  b.dataset.acao = acao; // vira data-acao="editar" no HTML
  b.dataset.id = id;
  return b;
}

function linha(cliente, editandoId) {
  const tr = document.createElement('tr');
  if (cliente.id === editandoId) tr.className = 'editando';

  const acoes = celula('', 'text-end text-nowrap');
  acoes.append(
    botao('Editar', 'editar', cliente.id, 'btn-outline-primary me-1'),
    botao('Remover', 'remover', cliente.id, 'btn-outline-danger'),
  );

  tr.append(
    celula(cliente.id),
    celula(cliente.nome),
    celula(formatarCpf(cliente.cpf), 'numero text-nowrap'),
    celula(cliente.email ?? '—'),
    acoes,
  );
  return tr;
}

export const clienteView = {
  // Desenha a tela a partir do estado: a UI é função do estado.
  render({ status, clientes, erro, editandoId, salvando }) {
    el.carregando.classList.toggle('d-none', status !== 'carregando');
    el.erro.classList.toggle('d-none', status !== 'erro');
    el.vazio.classList.toggle('d-none', status !== 'vazio');
    el.sucesso.classList.toggle('d-none', status !== 'sucesso');

    el.erroMsg.textContent = erro ?? '';
    el.linhas.replaceChildren(...clientes.map((c) => linha(c, editandoId)));

    el.salvar.disabled = salvando;
    el.salvar.textContent = salvando
      ? 'Salvando…'
      : editandoId ? 'Salvar alterações' : 'Cadastrar cliente';
    el.cancelar.classList.toggle('d-none', !editandoId);
  },

  preencherForm(cliente) {
    el.form.nome.value = cliente.nome;
    el.form.cpf.value = formatarCpf(cliente.cpf);
    el.form.email.value = cliente.email ?? '';
    el.form.nome.focus();
  },

  limparForm() {
    el.form.reset();
  },

  // --- Eventos: a view avisa; quem decide o que fazer é o main.js ---
  aoEnviar(fn) {
    el.form.addEventListener('submit', (evento) => {
      evento.preventDefault(); // sem isto, o navegador recarrega a página
      fn(Object.fromEntries(new FormData(el.form)));
    });
  },

  aoCancelar(fn) {
    el.cancelar.addEventListener('click', fn);
  },

  aoRecarregar(fn) {
    el.recarregar.addEventListener('click', fn);
  },

  // Delegação: UM listener no <tbody> atende os botões de todas as linhas.
  aoClicarNaLista({ editar, remover }) {
    el.linhas.addEventListener('click', (evento) => {
      const alvo = evento.target.closest('button[data-acao]');
      if (!alvo) return;
      const id = Number(alvo.dataset.id); // tudo que vem do DOM é string
      if (alvo.dataset.acao === 'editar') editar(id);
      if (alvo.dataset.acao === 'remover') remover(id);
    });
  },
};
```

**Pare e explique:**
- **`render(estado)`** é o coração: recebe o estado e deixa a tela igual a ele. `classList.toggle('d-none', condição)` esconde três dos quatro blocos; não há como dois aparecerem juntos.
- **`textContent`**, sempre. O nome do cliente veio de fora; se fosse para o `innerHTML`, um nome com `<img onerror=…>` executaria código (XSS — Cross-Site Scripting). Vamos testar no Passo A13.
- **`replaceChildren(...)`** troca todas as linhas da tabela de uma vez.
- **`new FormData(el.form)`** lê todos os campos que têm `name`; `Object.fromEntries` transforma em `{ nome, cpf, email }`.
- **`evento.preventDefault()`**: sem ele, o `submit` recarrega a página e a SPA deixa de ser SPA.
- **Delegação de eventos:** um único `addEventListener` no `<tbody>` atende os botões de todas as linhas, inclusive as que ainda nem existem. `closest('button[data-acao]')` descobre qual botão foi clicado; `dataset.id` devolve **string**, por isso o `Number(...)`.
- A view **não decide nada**: os métodos `ao…` só entregam o evento para quem se inscreveu.

## Passo A11 — `js/main.js` (definitivo)

Apague o conteúdo provisório do Passo A6 e escreva:

```javascript
// Ponto de entrada: liga store, service e view. Nenhuma regra mora aqui.
import { criarStore } from './state/store.js';
import { clienteService } from './services/clienteService.js';
import { clienteView } from './ui/clienteView.js';
import { aviso } from './ui/aviso.js';

// ===================== CLIENTES =====================
const clientes = criarStore({
  status: 'carregando', // 'carregando' | 'erro' | 'vazio' | 'sucesso'
  clientes: [],
  erro: null,
  editandoId: null,
  salvando: false,
});

// Toda vez que o estado mudar, a view redesenha.
clientes.assinar(clienteView.render);

async function carregarClientes() {
  clientes.set({ status: 'carregando', erro: null });
  try {
    const lista = await clienteService.listar();
    clientes.set({ status: lista.length ? 'sucesso' : 'vazio', clientes: lista });
  } catch (e) {
    clientes.set({ status: 'erro', erro: e.message });
  }
}

async function salvarCliente(dados) {
  const { editandoId } = clientes.get();
  aviso.limpar();
  clientes.set({ salvando: true });
  try {
    if (editandoId) await clienteService.atualizar(editandoId, dados);
    else await clienteService.criar(dados);

    aviso.sucesso(editandoId ? 'Cliente atualizado.' : 'Cliente cadastrado.');
    clienteView.limparForm();
    clientes.set({ editandoId: null });
    await carregarClientes();
  } catch (e) {
    aviso.erro(e.message); // o formulário fica como está, para corrigir
  } finally {
    clientes.set({ salvando: false });
  }
}

function editarCliente(id) {
  const cliente = clientes.get().clientes.find((c) => c.id === id);
  clienteView.preencherForm(cliente);
  clientes.set({ editandoId: id });
}

function cancelarEdicaoCliente() {
  clienteView.limparForm();
  clientes.set({ editandoId: null });
}

async function removerCliente(id) {
  if (!confirm(`Remover o cliente #${id}?`)) return;
  aviso.limpar();
  try {
    await clienteService.remover(id);
    aviso.sucesso('Cliente removido.');
    if (clientes.get().editandoId === id) cancelarEdicaoCliente();
    await carregarClientes();
  } catch (e) {
    aviso.erro(e.message);
  }
}

clienteView.aoEnviar(salvarCliente);
clienteView.aoCancelar(cancelarEdicaoCliente);
clienteView.aoRecarregar(carregarClientes);
clienteView.aoClicarNaLista({ editar: editarCliente, remover: removerCliente });


// ===================== INÍCIO =====================
carregarClientes();
```

**Pare e explique:**
- `clientes.assinar(clienteView.render)`: daqui em diante, **todo `set` redesenha a tela**. Ninguém mais chama `render` à mão.
- `carregarClientes` percorre os quatro estados: `carregando` → (`sucesso` | `vazio`) ou `erro`.
- `salvarCliente` serve para criar **e** editar: quem decide é o `editandoId` do estado. Se der erro (validação ou 409), o `catch` mostra o aviso e **o formulário fica preenchido**. O `finally` reabilita o botão nos dois casos.
- `confirm()` antes de remover: prevenção de erro, que volta na S6 como heurística de Nielsen.
- O arquivo não tem uma linha de `fetch` e nenhuma de `document.`: só liga as camadas.

## Passo A12 — `css/style.css`

```css
/* O Bootstrap faz quase tudo. Aqui ficam só os ajustes próprios. */

/* A linha que está sendo editada fica destacada */
tr.editando > td {
  background-color: var(--bs-warning-bg-subtle);
}

/* Números alinhados em colunas (saldo, CPF) */
.numero {
  font-variant-numeric: tabular-nums;
}
```

Dois ajustes; o resto é Bootstrap. O nosso CSS vem **depois** do Bootstrap no `<head>`: no empate da cascata, vence o último.

### ✅ Checkpoint A12
Recarregue. A lista mostra **"Nenhum cliente ainda. Cadastre o primeiro no formulário."** e o Console está limpo.

## Passo A13 — Provocar os quatro estados e testar o CRUD

Com as abas **Console** e **Network** abertas, faça na ordem:

| # | Ação | O que deve acontecer |
|---|---|---|
| 1 | Abrir a página com a API recém-iniciada | Estado **vazio** |
| 2 | Enviar com Nome `Ana Lima` e CPF `123` | Aviso vermelho "O CPF precisa ter 11 dígitos." **Nenhuma** requisição na aba Network |
| 3 | Corrigir o CPF para `111.222.333-44`, e-mail `ana@exemplo.com`, enviar | Aviso verde; estado **sucesso** com a linha na tabela. Na Network: `OPTIONS` (preflight) e depois `POST` com status **201** |
| 4 | Cadastrar `Outra Ana` com o **mesmo CPF** | Aviso vermelho "Já existe um cliente com este CPF" (mensagem do service da S3, status **409**). O formulário continua preenchido |
| 5 | Cadastrar com Nome `<img src=x onerror=alert(1)>` e CPF `222.333.444-55` | O texto aparece **como texto** na tabela. Nenhum alerta abre |
| 6 | Clicar em **Editar** na Ana, mudar o nome, **Salvar alterações** | Linha amarela durante a edição; depois, nome atualizado. Na Network: `PUT /clientes/1` → **200** |
| 7 | Clicar em **Remover**, cancelar; depois remover de verdade | No cancelar, nada na Network. No confirmar, `DELETE` → **204** e a linha some |
| 8 | No terminal da API, `Ctrl+C`. No navegador, `F5` | Estado de **erro**: "Não consegui falar com a API. Ela está rodando?" e o botão **Tentar de novo** |
| 9 | Subir a API (`npm run dev`) e clicar em **Tentar de novo** | Volta ao estado **vazio**: a memória zerou (é o problema que o SQLite resolve na S5) |
| 10 | Aba Network → *No throttling* → **3G** (ou *Slow 4G*) → `F5` | O estado **carregando** fica visível por alguns segundos. Volte para *No throttling* |

### ✅ Checkpoint A13
Você viu os **quatro estados** com os próprios olhos e os status 201, 200, 204 e 409 na aba Network.

> **Curiosidade para o Console:** na linha 3 da tabela, clique na requisição `OPTIONS` da aba Network. É o navegador perguntando ao servidor, antes do `POST`, se a origem `:5500` pode enviar JSON. Quem respondeu foi o middleware `cors` do Passo A7.

## Passo A14 — Commit da Parte A

```bash
cd ../..            # volta para a raiz do repositório
git add s3/banco-api/package.json s3/banco-api/package-lock.json s3/banco-api/src/app.js s4/
git commit -m "feat(s4): SPA de clientes em camadas, com CORS e os quatro estados"
git push -u origin feature/s4-frontend
```

### ✅ Checkpoint A14
`git status` limpo. No GitHub, a branch `feature/s4-frontend` mostra `s4/banco-frontend/`.

## Passo A15 (se der tempo) — A segunda entidade: `contas`

É o padrão de **relação 1:N na tela**: o formulário de conta tem um `<select>` preenchido com os clientes. A maioria de vocês vai precisar disso na Parte B. Os arquivos e os trechos a acrescentar estão em [Código completo: contas](#código-completo-contas), no final. Pré-requisito: a sua `s3/banco-api` precisa ter o recurso `contas` (Passo A13 da S3); se não tiver, use a do zip.

---

# Parte B — O front do seu Projeto 1 (50 min)

Mesma receita, no seu domínio, no lugar definitivo: a pasta **`frontend/` na raiz do repositório**, ao lado do `backend/`.

## Passo B1 — CORS no seu `backend/`

Pare a `banco-api` (`Ctrl+C`), para liberar a porta 3000. Depois:

```bash
cd backend
npm install cors
```

No `backend/src/app.js`, o mesmo do Passo A7: `import cors from 'cors';` e o `app.use(cors({ origin: [...] }))` **antes** das rotas. Suba com `npm run dev`.

### ✅ Checkpoint B1
`http://localhost:3000` mostra o nome da **sua** API.

## Passo B2 — Criar `frontend/` e copiar o que não muda

Na raiz do repositório:

```bash
mkdir -p frontend/css frontend/js/services frontend/js/state frontend/js/ui
cp s4/banco-frontend/js/config.js      frontend/js/
cp s4/banco-frontend/js/api.js         frontend/js/
cp s4/banco-frontend/js/state/store.js frontend/js/state/
cp s4/banco-frontend/js/ui/aviso.js    frontend/js/ui/
cp s4/banco-frontend/css/style.css     frontend/css/
```

Esses cinco arquivos servem para **qualquer** domínio, **sem mudar uma letra**. É a recompensa por ter separado as camadas.

## Passo B3 — A primeira entidade

Escolha no seu `backend/` a entidade que **não depende** de outra (a "pai": Categoria, Turma, Paciente…). Copie os três arquivos de `cliente` e adapte:

| Parte A | Seu projeto (exemplo: `categoria`) | O que muda |
|---|---|---|
| `index.html` | `frontend/index.html` | título, rótulos, os `<input>` (um por campo, cada um com `name`), os `id` (`cli-` → `cat-`, `clientes-` → `categorias-`), os `<th>` |
| `js/services/clienteService.js` | `js/services/categoriaService.js` | a rota (`/categorias`), os campos e as validações do `preparar` |
| `js/ui/clienteView.js` | `js/ui/categoriaView.js` | os seletores do objeto `el`, as células da função `linha`, o `preencherForm`, o texto do botão |
| `js/main.js` | `js/main.js` | os nomes (`clientes` → `categorias`) e as mensagens dos avisos |

Dicas:
- O `name` de cada `<input>` deve ser **igual ao campo que a sua API espera** no body. O `FormData` usa o `name` como chave.
- Campo numérico chega como **string**: converta no `preparar` com `Number(...)`.
- A chave do estado com a lista (`clientes: []`) vira `categorias: []` em **três** lugares: no `criarStore`, no `set` do `carregar…` e na desestruturação do `render`.

Sirva o front (dentro de `frontend/`): `npx http-server -p 5500 -c-1`.

### ✅ Checkpoint B3
A primeira entidade lista, cria, edita e remove pela tela. Derrubando o backend e apertando `F5`, aparece o estado de **erro**.

## Passo B4 — A segunda entidade, com `<select>`

Agora a entidade que **depende** da primeira (Produto → Categoria, Aluno → Turma, Consulta → Paciente). Use `contas` como molde ([código completo no final](#código-completo-contas)):

- no `index.html`, uma segunda `<section class="row g-4 mb-5">`, com um `<select name="<pai>Id">` no formulário;
- `js/services/<filho>Service.js`, com `Number(...)` no id do pai e nos campos numéricos;
- `js/ui/<filho>View.js`, com o método `preencherClientes` renomeado (por exemplo, `preencherCategorias`);
- no `main.js`, o segundo store, o bloco de funções e a linha que religa o `<select>` quando a lista do pai muda.

Se o seu backend responde **422** quando o pai não existe, teste: a mensagem do service precisa aparecer no aviso vermelho.

### ✅ Checkpoint B4
Você cria um registro "filho" escolhendo o "pai" no `<select>`, e a tabela mostra o **nome** do pai, não o id.

## Passo B5 — Registrar em `frontend/TELAS.md`

Crie `frontend/TELAS.md` dizendo como provocar cada estado em cada lista:

```markdown
# Telas do Projeto 1 (S4)

Front: `npx http-server -p 5500 -c-1` em `frontend/` · API: `npm run dev` em `backend/`

| Lista | Estado | Como provocar | O que aparece |
|---|---|---|---|
| Categorias | carregando | Network → throttling 3G → F5 | spinner "Carregando categorias…" |
| Categorias | vazio | API recém-iniciada | "Nenhuma categoria ainda…" |
| Categorias | erro | Ctrl+C na API → F5 | "Não consegui falar com a API…" + Tentar de novo |
| Categorias | sucesso | cadastrar "Bebidas" | tabela com 1 linha |
| Produtos | vazio | sem produtos | "Nenhum produto ainda…" |
| Produtos | erro de regra | preço -1 | aviso "Preço deve ser maior que zero" (400) |

## Camadas
- api: `js/api.js` · services: `js/services/` · state: `js/state/store.js` · ui: `js/ui/`
```

Mínimo: os **quatro estados de uma lista** e **um erro de regra** vindo do backend (400, 409 ou 422).

## Passo B6 — Commit, push e pull request

```bash
cd ..               # raiz do repositório
git add backend/package.json backend/package-lock.json backend/src/app.js frontend/
git commit -m "feat(frontend): SPA do Projeto 1 em camadas (categorias e produtos)"
git push
```

Abra o pull request:

```bash
gh pr create --base main --head feature/s4-frontend --title "S4: frontend em camadas (banco-frontend + frontend do Projeto 1)" --body "Parte A: s4/banco-frontend (clientes), CORS na banco-api. Parte B: frontend/ com duas entidades, quatro estados e TELAS.md."
gh pr view --web
```

<details>
<summary><strong>Sem o gh? Caminho pelo site</strong></summary>

1. Abra `https://github.com/SEU-USUARIO/progweb-p1-nome-sobrenome`.
2. Clique na faixa amarela **Compare & pull request** (ou **Pull requests → New pull request**, base `main`, compare `feature/s4-frontend`).
3. Título: `S4: frontend em camadas`. **Create pull request**.

</details>

**Não clique em "Merge pull request".** O PR fica aberto; o merge é no começo da S5.

### ✅ Checkpoint B6
Na página do PR: estado **Open**; a aba **Files changed** mostra `s4/banco-frontend/...` e `frontend/...`, e **nenhum** `node_modules/`.

---

# Entrega

Na atividade **"S4 · Mãos à Obra"** do Google Classroom, cole o link do pull request e clique em **Entregar**. Prazo: **quinta 12/11, 23h59**. A aula serve para fazer a Parte A inteira e a primeira entidade da Parte B; quem não terminar a segunda entidade fecha em casa.

## Checklist final

- [ ] O PR da S3 foi mesclado: `backend/` está na `main`.
- [ ] O PR `feature/s4-frontend → main` está **aberto**.
- [ ] `s3/banco-api` e `backend/` têm `cors` registrado **antes** das rotas.
- [ ] `s4/banco-frontend/` lista, cria, edita e remove clientes.
- [ ] `frontend/` tem as camadas `api / services / state / ui` e o `main.js`.
- [ ] `frontend/` faz o CRUD de **duas** entidades; a segunda escolhe a primeira em um `<select>`.
- [ ] Cada lista mostra os quatro estados: carregando, vazio, erro e sucesso.
- [ ] Um erro de regra do backend (400, 409 ou 422) aparece na tela com a mensagem da API.
- [ ] Nenhum `innerHTML` com dado vindo da API ou do usuário.
- [ ] `frontend/TELAS.md` está preenchido.

**Para a S5 (quarta 18/11):** traga o `backend/` com as duas entidades rodando e Node 22 ou superior. Vamos trocar os models em memória por SQLite; o front de hoje não muda.

---

# Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| Console: `blocked by CORS policy` | `cors` não instalado, registrado depois das rotas, ou origem diferente da liberada | Confira o Passo A7. A origem da mensagem (`from origin '…'`) tem de estar na lista `origin`, com a **porta** certa |
| Funciona em `localhost:5500`, falha em `127.0.0.1:5500` (ou o contrário) | São origens diferentes | Deixe as duas na lista `origin` e reinicie a API |
| Console: `Failed to load module script` ou `CORS request not HTTP` | Página aberta com duplo clique (`file://`) | Sirva com `npx http-server` ou Live Server |
| Console: `GET …/js/api 404` | `import` sem a extensão | No navegador, o `.js` é obrigatório: `from './api.js'` |
| Página sem estilo nenhum; Console fala em `integrity` | Hash do `integrity` copiado errado ou versão trocada | Copie o `<link>` do tutorial de novo, inteiro |
| Página sem estilo e sem internet | A CDN não foi alcançada | Verifique a rede. O HTML continua funcionando, só sem estilo |
| `Cannot read properties of null (reading 'addEventListener')` | `id` no HTML diferente do seletor na view | Compare os `id` do `index.html` com o objeto `el` |
| Clico em enviar e a página recarrega | Faltou `evento.preventDefault()` ou o `<script>` não carregou | Veja o Console logo após o `F5` |
| O objeto do formulário vem vazio | `<input>` sem `name` | Todo campo precisa de `name` |
| Aviso mostra `Erro 400` em vez da mensagem | A sua API responde com outra chave (`error`, `message`) | Padronize o `errorHandler` do backend para `{ erro }`, como na S3 |
| `Unexpected end of JSON input` ao remover | `.json()` chamado em resposta 204 | Use o `api.js` do tutorial, que trata o 204 |
| Editei o arquivo e nada mudou | Cache do navegador | Rode o `http-server` com `-c-1`; no DevTools, marque **Disable cache** |
| `EADDRINUSE: address already in use :::3000` | A `banco-api` e o seu `backend/` disputam a porta | Pare uma delas, ou suba com `PORT=3001 npm run dev` e troque a URL em `config.js` |
| `npx http-server` pede confirmação e trava | Primeira execução | Responda `y` e Enter |
| O `<select>` da segunda entidade fica vazio | A linha que religa o select não foi adicionada, ou a chave do estado tem outro nome | Veja o bloco "as contas dependem dos clientes" no `main.js` |

---

# Código completo: contas

O segundo recurso da Parte A (Passo A15). São dois arquivos novos e dois trechos a acrescentar.

**1. No `index.html`**, logo depois do `</section>` de clientes e antes de `</main>`:

```html
    <!-- ===================== CONTAS ===================== -->
    <section class="row g-4 mb-5" aria-labelledby="titulo-contas">
      <!-- Grid de 12 colunas: 4 para o formulário, 8 para a lista -->
      <div class="col-lg-4">
        <div class="card shadow-sm">
          <div class="card-header">
            <h2 id="titulo-contas" class="h5 mb-0">Contas</h2>
          </div>
          <form id="form-conta" class="card-body" novalidate>
            <div class="mb-3">
              <label for="conta-cliente" class="form-label">Cliente</label>
              <!-- As opções vêm da lista de clientes, via JS -->
              <select id="conta-cliente" name="clienteId" class="form-select" required>
                <option value="">Selecione…</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="conta-tipo" class="form-label">Tipo</label>
              <select id="conta-tipo" name="tipo" class="form-select" required>
                <option value="corrente">Corrente</option>
                <option value="poupanca">Poupança</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="conta-saldo" class="form-label">Saldo (R$)</label>
              <input id="conta-saldo" name="saldo" type="number" step="0.01" class="form-control" required>
            </div>
            <div class="d-flex gap-2">
              <button id="conta-salvar" type="submit" class="btn btn-primary">Abrir conta</button>
              <button id="conta-cancelar" type="button" class="btn btn-outline-secondary d-none">Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-body">
            <!-- Os quatro estados da lista: só um aparece por vez -->
            <div id="contas-carregando" class="text-center py-4">
              <div class="spinner-border text-primary" aria-hidden="true"></div>
              <p class="text-muted mt-2 mb-0">Carregando contas…</p>
            </div>

            <div id="contas-erro" class="alert alert-danger mb-0 d-none" role="alert">
              <p id="contas-erro-msg" class="mb-2"></p>
              <button id="contas-recarregar" type="button" class="btn btn-sm btn-outline-danger">Tentar de novo</button>
            </div>

            <p id="contas-vazio" class="text-muted text-center py-4 mb-0 d-none">
              Nenhuma conta ainda. Cadastre um cliente e abra a primeira.
            </p>

            <div id="contas-sucesso" class="table-responsive d-none">
              <table class="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                  <th scope="col">#</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Tipo</th>
                  <th scope="col" class="text-end">Saldo</th>
                  <th scope="col" class="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody id="contas-linhas"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
```

**2. `js/services/contaService.js`** (novo):

```javascript
import { api } from '../api.js';

const TIPOS = ['corrente', 'poupanca'];

function preparar({ tipo, saldo, clienteId }) {
  if (!clienteId) throw new Error('Selecione o cliente.');
  if (!TIPOS.includes(tipo)) throw new Error('Tipo de conta inválido.');
  if (saldo === '' || Number.isNaN(Number(saldo))) {
    throw new Error('Informe o saldo em números.');
  }
  // Formulário só entrega string: convertemos antes de enviar
  return { tipo, saldo: Number(saldo), clienteId: Number(clienteId) };
}

export const contaService = {
  listar() {
    return api.get('/contas');
  },

  async criar(dados) {
    return api.post('/contas', preparar(dados));
  },

  async atualizar(id, dados) {
    return api.put(`/contas/${id}`, preparar(dados));
  },

  remover(id) {
    return api.delete(`/contas/${id}`);
  },
};
```

**3. `js/ui/contaView.js`** (novo):

```javascript
// Camada de UI das contas. Mesmo molde da clienteView, com um <select> a mais.
const el = {
  form: document.querySelector('#form-conta'),
  cliente: document.querySelector('#conta-cliente'),
  salvar: document.querySelector('#conta-salvar'),
  cancelar: document.querySelector('#conta-cancelar'),
  carregando: document.querySelector('#contas-carregando'),
  erro: document.querySelector('#contas-erro'),
  erroMsg: document.querySelector('#contas-erro-msg'),
  recarregar: document.querySelector('#contas-recarregar'),
  vazio: document.querySelector('#contas-vazio'),
  sucesso: document.querySelector('#contas-sucesso'),
  linhas: document.querySelector('#contas-linhas'),
};

const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const NOME_TIPO = { corrente: 'Corrente', poupanca: 'Poupança' };

// id → nome, para mostrar o dono da conta sem outra requisição
let nomeDoCliente = new Map();

function celula(texto, classe = '') {
  const td = document.createElement('td');
  td.textContent = texto;
  td.className = classe;
  return td;
}

function botao(texto, acao, id, classe) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = texto;
  b.className = `btn btn-sm ${classe}`;
  b.dataset.acao = acao;
  b.dataset.id = id;
  return b;
}

function linha(conta, editandoId) {
  const tr = document.createElement('tr');
  if (conta.id === editandoId) tr.className = 'editando';

  const dono = nomeDoCliente.get(conta.clienteId)
    ?? `cliente #${conta.clienteId} (removido)`; // conta órfã: assunto da S5

  const acoes = celula('', 'text-end text-nowrap');
  acoes.append(
    botao('Editar', 'editar', conta.id, 'btn-outline-primary me-1'),
    botao('Remover', 'remover', conta.id, 'btn-outline-danger'),
  );

  tr.append(
    celula(conta.id),
    celula(dono),
    celula(NOME_TIPO[conta.tipo] ?? conta.tipo),
    celula(reais.format(conta.saldo), 'numero text-end text-nowrap'),
    acoes,
  );
  return tr;
}

export const contaView = {
  // Preenche o <select> com os clientes que existem agora
  preencherClientes(clientes) {
    nomeDoCliente = new Map(clientes.map((c) => [c.id, c.nome]));
    const escolhido = el.cliente.value;

    const opcoes = clientes.map((c) => new Option(`${c.nome} (#${c.id})`, c.id));
    el.cliente.replaceChildren(new Option('Selecione…', ''), ...opcoes);

    // mantém a escolha, se o cliente ainda existir
    if (nomeDoCliente.has(Number(escolhido))) el.cliente.value = escolhido;
  },

  render({ status, contas, erro, editandoId, salvando }) {
    el.carregando.classList.toggle('d-none', status !== 'carregando');
    el.erro.classList.toggle('d-none', status !== 'erro');
    el.vazio.classList.toggle('d-none', status !== 'vazio');
    el.sucesso.classList.toggle('d-none', status !== 'sucesso');

    el.erroMsg.textContent = erro ?? '';
    el.linhas.replaceChildren(...contas.map((c) => linha(c, editandoId)));

    el.salvar.disabled = salvando;
    el.salvar.textContent = salvando
      ? 'Salvando…'
      : editandoId ? 'Salvar alterações' : 'Abrir conta';
    el.cancelar.classList.toggle('d-none', !editandoId);
  },

  preencherForm(conta) {
    el.form.clienteId.value = conta.clienteId;
    el.form.tipo.value = conta.tipo;
    el.form.saldo.value = conta.saldo;
    el.form.saldo.focus();
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
```

**4. No `js/main.js`**, acrescente os dois imports no topo:

```javascript
import { contaService } from './services/contaService.js';
import { contaView } from './ui/contaView.js';
```

depois, o bloco abaixo, **antes** da seção `INÍCIO`:

```javascript
// ===================== CONTAS =====================
const contas = criarStore({
  status: 'carregando',
  contas: [],
  erro: null,
  editandoId: null,
  salvando: false,
});

contas.assinar(contaView.render);

// As contas dependem dos clientes: mudou a lista de clientes,
// refaz o <select> e redesenha os nomes na tabela de contas.
clientes.assinar((estado) => {
  contaView.preencherClientes(estado.clientes);
  contaView.render(contas.get());
});

async function carregarContas() {
  contas.set({ status: 'carregando', erro: null });
  try {
    const lista = await contaService.listar();
    contas.set({ status: lista.length ? 'sucesso' : 'vazio', contas: lista });
  } catch (e) {
    contas.set({ status: 'erro', erro: e.message });
  }
}

async function salvarConta(dados) {
  const { editandoId } = contas.get();
  aviso.limpar();
  contas.set({ salvando: true });
  try {
    if (editandoId) await contaService.atualizar(editandoId, dados);
    else await contaService.criar(dados);

    aviso.sucesso(editandoId ? 'Conta atualizada.' : 'Conta aberta.');
    contaView.limparForm();
    contas.set({ editandoId: null });
    await carregarContas();
  } catch (e) {
    aviso.erro(e.message);
  } finally {
    contas.set({ salvando: false });
  }
}

function editarConta(id) {
  const conta = contas.get().contas.find((c) => c.id === id);
  contaView.preencherForm(conta);
  contas.set({ editandoId: id });
}

function cancelarEdicaoConta() {
  contaView.limparForm();
  contas.set({ editandoId: null });
}

async function removerConta(id) {
  if (!confirm(`Remover a conta #${id}?`)) return;
  aviso.limpar();
  try {
    await contaService.remover(id);
    aviso.sucesso('Conta removida.');
    if (contas.get().editandoId === id) cancelarEdicaoConta();
    await carregarContas();
  } catch (e) {
    aviso.erro(e.message);
  }
}

contaView.aoEnviar(salvarConta);
contaView.aoCancelar(cancelarEdicaoConta);
contaView.aoRecarregar(carregarContas);
contaView.aoClicarNaLista({ editar: editarConta, remover: removerConta });
```

e, na última linha do arquivo, a segunda carga:

```javascript
carregarClientes();
carregarContas();
```

**Para testar:** cadastre um cliente; ele aparece no `<select>` de contas. Abra uma conta poupança com saldo `1500.5`: a tabela mostra o **nome** do cliente e `R$ 1.500,50`. Agora **remova o cliente**: a conta continua lá, como `cliente #1 (removido)`. É uma **conta órfã**: o model em memória não garante integridade referencial. Guarde essa cena para a S5, quando a chave estrangeira do SQLite vai impedir isso.

> O projeto completo (clientes + contas, mais a `banco-api` com CORS) está em `S4_banco-frontend.zip`. Para rodar: `npm install` e `npm run dev` em `s3/banco-api`; `npx http-server -p 5500 -c-1` em `s4/banco-frontend`.

---

## Referências

- MDN — *Using the Fetch API*: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- MDN — *Same-origin policy*: https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
- MDN — *Cross-Origin Resource Sharing (CORS)*: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- MDN — *JavaScript modules*: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- MDN — *Subresource Integrity*: https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
- Bootstrap 5.3 — *Grid system*: https://getbootstrap.com/docs/5.3/layout/grid/
- Bootstrap 5.3 — *Download (CDN via jsDelivr)*: https://getbootstrap.com/docs/5.3/getting-started/download/
- Express — middleware `cors`: https://expressjs.com/en/resources/middleware/cors.html
- OWASP — *Cross Site Scripting Prevention Cheat Sheet*: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- Garrett, J. J. (2005). *Ajax: A New Approach to Web Applications*. Adaptive Path.