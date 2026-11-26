# 🛠️ S3 · Mãos à Obra — Sua primeira API em camadas (Express 5)

**Programação Web · UEPB · 2026.2 · Semana 3 · quarta 04/11/2026 · Aula 2 (2h, após o intervalo)**
**Prof. Rodrigo Alves Costa · rodrigo@servidor.uepb.edu.br**

> Este tutorial é completo o bastante para quem faltou fazer sozinho. Cada passo tem um **checkpoint**: só avance quando ele bater. Travou? Vá direto a [Problemas comuns](#problemas-comuns).

---

## Na Aula 1 vimos…

1. **A web é cliente-servidor** (slide 6): quem pede não sabe como quem serve funciona. Hoje o cliente é o Thunder Client; na S4 será o navegador.
2. **HTTP é texto** (slides 7 e 8): método + URI + headers + body de um lado; status + headers + body do outro. Os status que vamos usar: 200, 201, 204, 400, 404, 409, 422.
3. **REST** (slides 9 a 11): recursos com URI no plural (`/clientes`, `/clientes/42`), verbos com significado. Nosso alvo é o nível 2 de Richardson.
4. **Express 5** (slides 14 a 16): `app.use()` registra middleware, `Router()` agrupa rotas, `req.params`/`req.query`/`req.body` são a entrada, `res.status().json()` é a saída.
5. **Camadas** (slides 17 a 19): Route → Controller → Service → Model. O service lança erros com `status`; o `errorHandler` responde. É o SRP e o DIP da S2 em código.

---

## Roteiro da aula (2h)

| Bloco | Tempo | O que acontece |
|---|---|---|
| Setup | 10 min | Conferir Node e Thunder Client; **merge dos PRs da S2**; branch de hoje |
| Parte A | 50 min | O professor constrói a API bancária (`clientes`); você replica em `s3/banco-api/` |
| Parte B | 50 min | Você constrói a API do **seu** Projeto 1 em `backend/`, com duas entidades |
| Fechamento | 10 min | `TESTES.md`, commit, push, pull request, plenária |

**Entregável:** link do pull request `feature/s3-backend → main` postado na atividade **"S3 · Mãos à Obra"** do Google Classroom, até **quinta 05/11, 23h59**.

---

# Setup (10 min)

## Passo 0.1 — Conferir o ambiente

```bash
node -v      # v22 ou superior (node --watch e, na S5, node:sqlite)
npm -v
git --version
```

No VS Code, confira que a extensão **Thunder Client** (ícone de raio na barra lateral) está instalada. Se não estiver: `Ctrl+Shift+X` → procure `Thunder Client` (autor: Thunder Client) → **Install**.

### ✅ Checkpoint 0.1
`node -v` mostra `v22.x`, `v24.x` ou `v26.x`. O ícone do raio aparece na barra lateral do VS Code.

## Passo 0.2 — Merge dos pull requests da S2

Os dois PRs da S2 (`feature/s2-smells` e `feature/modelagem`) ficaram abertos. Hoje eles entram na `main`.

**Pelo terminal** (com o `gh` autenticado, como na S1), dentro da pasta do repositório:

```bash
cd progweb-p1-nome-sobrenome      # ajuste para o seu nome
gh pr list                        # mostra os PRs abertos e seus números
gh pr merge 1 --merge --delete-branch
gh pr merge 2 --merge --delete-branch
```

<details>
<summary><strong>Sem o gh? Caminho pelo site</strong></summary>

1. Abra `https://github.com/SEU-USUARIO/progweb-p1-nome-sobrenome/pulls`.
2. Abra o PR dos smells → botão verde **Merge pull request** → **Confirm merge** → **Delete branch**.
3. Repita para o PR da modelagem.

Se o GitHub disser que há **conflito** (acontece se a `feature/modelagem` nasceu da `feature/s2-smells`), chame o professor: resolve-se em um minuto, mas não tente sozinho hoje.

</details>

Agora traga a `main` atualizada para o seu computador e crie a branch de hoje:

```bash
git switch main
git pull
git branch -d feature/s2-smells feature/modelagem   # limpa as branches locais (opcional)
git switch -c feature/s3-backend
```

### ✅ Checkpoint 0.2
`git log --oneline -5` mostra os commits "Merge pull request #1…" e "#2…". `ls` mostra `MODELAGEM.md`, `README.md`, `s1/` e `s2/`. `git branch` mostra `* feature/s3-backend`.

> **Faltou na S2?** Você não tem `MODELAGEM.md`. Siga a Parte A normalmente; antes da Parte B, escolha **duas entidades** do seu domínio (uma depende da outra, se possível: Pedido/Item, Turma/Aluno, Consulta/Paciente) e anote atributos e regras em um papel. A modelagem completa fica como débito para antes da S4.

---

# Parte A — Demo do professor, replicada (50 min)

Vamos construir a **API bancária** (Cliente e Conta) **já em camadas**, de baixo para cima: model → service → controller → route → middleware → app. Tudo em memória; o SQLite chega na S5.

A estrutura final:

```
s3/banco-api/
├── src/
│   ├── app.js                      # monta o Express: middleware + rotas
│   ├── server.js                   # listen()
│   ├── routes/
│   │   ├── clientes.js             # URL → controller
│   │   └── contas.js
│   ├── controllers/
│   │   ├── clienteController.js    # lê req, chama service, monta res
│   │   └── contaController.js
│   ├── services/
│   │   ├── clienteService.js       # regras de negócio (sem HTTP)
│   │   └── contaService.js
│   ├── models/
│   │   ├── clienteModel.js         # dados + "repositório" em memória
│   │   └── contaModel.js
│   ├── middleware/
│   │   ├── logger.js
│   │   └── errorHandler.js
│   └── utils/
│       └── erro.js                 # fábrica de erros com status
├── package.json
└── .gitignore
```

**Regra de ouro (a S2 em código):**

| Camada | Faz | Não faz |
|---|---|---|
| **Route** | mapeia `GET /clientes/:id` → `clienteController.buscarPorId` | não lê `req.body`, não valida, não decide |
| **Controller** | lê `req`, converte tipos, chama o service, monta `res` | não contém regra de negócio |
| **Service** | regras de negócio; lança erro com `status` | não conhece `req`, `res` nem Express |
| **Model** | guarda e devolve dados (array hoje, SQL na S5) | não valida regra, não sabe de HTTP |

## Passo A1 — Criar o projeto dentro do repositório

```bash
mkdir -p s3/banco-api
cd s3/banco-api
npm init -y
npm install express
mkdir -p src/routes src/controllers src/services src/models src/middleware src/utils
code .    # opcional: abre uma janela do VS Code nesta pasta
```

> `npm install express` instala a versão **5.x** (é a `latest` do npm desde 31/03/2025; hoje, 5.3). Confira em `node_modules/express/package.json` ou com `npm ls express`.

## Passo A2 — `package.json`

Substitua o conteúdo gerado por este:

```json
{
  "name": "banco-api",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  },
  "dependencies": {
    "express": "^5.1.0"
  }
}
```

- `"type": "module"` liga os ES Modules (`import`/`export`), como na S1. **Sem isso, o `import` dá erro.**
- `node --watch` (Node 22+) reinicia o servidor a cada arquivo salvo. Não precisa de `nodemon`.

## Passo A3 — `.gitignore`

Crie `s3/banco-api/.gitignore`:

```
node_modules/
.env
```

### ✅ Checkpoint A3
`git status` mostra `s3/banco-api/package.json` e `package-lock.json` como novos, e **não** mostra `node_modules/`.

## Passo A4 — A fábrica de erros: `src/utils/erro.js`

O service precisa dizer "isto é um 404" sem conhecer HTTP. Um `Error` com um número pendurado resolve:

```javascript
// Fábrica de erros com status. O service usa; o errorHandler lê.
export function erro(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}
```

## Passo A5 — Camada Model: `src/models/clienteModel.js`

```javascript
// "Banco de dados" em memória: um array. Na S5 vira SQLite.
let clientes = [];
let proximoId = 1;

export const clienteModel = {
  listar() {
    return clientes;
  },

  buscarPorId(id) {
    return clientes.find((c) => c.id === id) ?? null;
  },

  existeCpf(cpf) {
    return clientes.some((c) => c.cpf === cpf);
  },

  inserir({ nome, cpf, email }) {
    const novo = { id: proximoId++, nome, cpf, email: email ?? null };
    clientes.push(novo);
    return novo;
  },

  atualizar(id, dados) {
    const i = clientes.findIndex((c) => c.id === id);
    if (i === -1) return null;
    clientes[i] = { ...clientes[i], ...dados, id }; // o id nunca muda
    return clientes[i];
  },

  remover(id) {
    const antes = clientes.length;
    clientes = clientes.filter((c) => c.id !== id);
    return clientes.length < antes; // true = removeu
  },
};
```

**Pare e explique:**
- O model não sabe o que é HTTP, `req`, `res` ou Express. Só dados.
- Ele expõe operações: listar, buscar, existe, inserir, atualizar, remover. **É o contrato** que o service vai usar.
- Na S5, só este arquivo muda (o array vira tabela). O service não vai nem saber: é o **DIP** da S2.

## Passo A6 — Camada Service: `src/services/clienteService.js`

```javascript
import { clienteModel } from '../models/clienteModel.js';
import { erro } from '../utils/erro.js';

export const clienteService = {
  listar() {
    return clienteModel.listar();
  },

  buscarPorId(id) {
    const cliente = clienteModel.buscarPorId(id);
    if (!cliente) throw erro(404, 'Cliente não encontrado');
    return cliente;
  },

  criar({ nome, cpf, email } = {}) {
    // Regra 1: nome e cpf são obrigatórios
    if (!nome || !cpf) throw erro(400, 'Campos "nome" e "cpf" são obrigatórios');
    // Regra 2: cpf é único
    if (clienteModel.existeCpf(cpf)) throw erro(409, 'Já existe um cliente com este CPF');
    return clienteModel.inserir({ nome, cpf, email });
  },

  atualizar(id, dados = {}) {
    const atualizado = clienteModel.atualizar(id, dados);
    if (!atualizado) throw erro(404, 'Cliente não encontrado');
    return atualizado;
  },

  remover(id) {
    const removido = clienteModel.remover(id);
    if (!removido) throw erro(404, 'Cliente não encontrado');
  },
};
```

**Pare e explique:**
- As regras de negócio moram aqui, e só aqui.
- O service **lança** (`throw`) quando a regra é violada. Ele não faz `res.status(400)`: não sabe que HTTP existe.
- O `= {}` nos parâmetros protege contra `req.body` **undefined** (no Express 5, sem body o `req.body` não é `{}`).
- Note o import com **`.js` no final**: nos ES Modules do Node a extensão é obrigatória.

## Passo A7 — Camada Controller: `src/controllers/clienteController.js`

```javascript
import { clienteService } from '../services/clienteService.js';

export const clienteController = {
  listar(req, res) {
    res.json(clienteService.listar());
  },

  buscarPorId(req, res) {
    res.json(clienteService.buscarPorId(Number(req.params.id)));
  },

  criar(req, res) {
    const novo = clienteService.criar(req.body);
    res.status(201).json(novo);
  },

  atualizar(req, res) {
    res.json(clienteService.atualizar(Number(req.params.id), req.body));
  },

  remover(req, res) {
    clienteService.remover(Number(req.params.id));
    res.status(204).end();
  },
};
```

**Pare e explique:**
- Cada método tem uma ou duas linhas: lê `req`, converte (`Number(req.params.id)`: **tudo que vem da URL é string**), chama o service, responde.
- Nenhum `try/catch`. Se o service lançar, o **Express 5** pega o erro e manda para o `errorHandler` (no Express 4 isso exigia `try/catch` em funções async).
- 201 ao criar, 204 (sem corpo) ao remover.

## Passo A8 — Camada Route: `src/routes/clientes.js`

```javascript
import { Router } from 'express';
import { clienteController } from '../controllers/clienteController.js';

const router = Router();

router.get('/', clienteController.listar);
router.get('/:id', clienteController.buscarPorId);
router.post('/', clienteController.criar);
router.put('/:id', clienteController.atualizar);
router.delete('/:id', clienteController.remover);

export default router;
```

**Pare e explique:** cinco linhas, zero lógica. Quem lê este arquivo sabe quais endpoints existem. O prefixo `/clientes` entra no `app.js`.

## Passo A9 — Middleware

`src/middleware/logger.js`:

```javascript
export function logger(req, res, next) {
  const hora = new Date().toISOString();
  console.log(`[${hora}] ${req.method} ${req.url}`);
  next(); // sem isto, a requisição trava para sempre
}
```

`src/middleware/errorHandler.js`:

```javascript
// Quatro argumentos: é assim que o Express reconhece um tratador de erro.
export function errorHandler(err, req, res, next) {
  const status = err.status ?? 500;
  console.error(`❌ ${req.method} ${req.url} → ${status}: ${err.message}`);
  res.status(status).json({ erro: err.message ?? 'Erro interno do servidor' });
}
```

**Pare e explique:**
- O `errorHandler` tem **quatro** parâmetros, mesmo sem usar `next`. Com três, o Express o trata como middleware comum.
- Erro com `status` (vindo do service) vira aquele status. Erro sem status (um `TypeError` seu) vira 500 e aparece no console: é o comportamento certo.
- Um único lugar formata erros. Nenhum controller faz `res.status(404)`.

## Passo A10 — `src/app.js` (composição) e `src/server.js`

`src/app.js`:

```javascript
import express from 'express';
import clientesRouter from './routes/clientes.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// --- Middleware global (antes das rotas) ---
app.use(express.json()); // lê o body JSON para req.body
app.use(logger);         // loga toda requisição

// --- Health check ---
app.get('/', (req, res) => {
  res.json({ api: 'Banco API', versao: '1.0.0', rotas: ['/clientes'] });
});

// --- Rotas ---
app.use('/clientes', clientesRouter);

// --- 404 para rotas que não existem ---
app.use((req, res) => {
  res.status(404).json({ erro: `Rota ${req.method} ${req.url} não existe` });
});

// --- Tratador de erro: SEMPRE o último ---
app.use(errorHandler);

export default app;
```

`src/server.js`:

```javascript
import app from './app.js';

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`🚀 Banco API rodando em http://localhost:${PORT}`);
});
```

**Pare e explique:**
- A **ordem** dos `app.use` é a ordem da cadeia (slide 15): `express.json()` antes das rotas, senão `req.body` chega vazio; `errorHandler` por último, senão não pega nada.
- `app.js` e `server.js` separados: na S13 vamos testar o `app` sem abrir porta.
- `process.env.PORT`: na S5, o Render escolhe a porta.

Suba o servidor:

```bash
npm run dev
```

### ✅ Checkpoint A10
O terminal mostra `🚀 Banco API rodando em http://localhost:3000`. No navegador, `http://localhost:3000` mostra `{"api":"Banco API","versao":"1.0.0","rotas":["/clientes"]}`. Salve qualquer arquivo e veja o servidor reiniciar sozinho (`--watch`).

## Passo A11 — Testar no Thunder Client

1. Clique no **raio** na barra lateral → **New Request**.
2. Escolha o **método** (dropdown à esquerda da URL) e digite a URL.
3. Para POST/PUT: aba **Body** → **JSON** → cole o JSON. O header `Content-Type: application/json` é adicionado sozinho.
4. **Send**. Olhe o **status** (canto superior direito da resposta) e o corpo.
5. Depois do primeiro teste, clique em **Collections** → **New Collection** → `Banco API` e salve cada requisição nela (botão **Save**). As coleções ficam no seu VS Code; sincronizar com o Git é recurso pago, por isso o entregável é o `TESTES.md`.

Faça **nesta ordem** (o estado da memória importa):

| # | Método | URL | Body (JSON) | Status esperado |
|---|---|---|---|---|
| 1 | GET | `http://localhost:3000/` | — | 200 |
| 2 | POST | `http://localhost:3000/clientes` | `{"nome":"Ana Silva","cpf":"123.456.789-00","email":"ana@email.com"}` | **201** |
| 3 | POST | `http://localhost:3000/clientes` | `{"nome":"Bruno Costa","cpf":"987.654.321-00"}` | 201 |
| 4 | GET | `http://localhost:3000/clientes` | — | 200 (lista com 2) |
| 5 | GET | `http://localhost:3000/clientes/1` | — | 200 |
| 6 | GET | `http://localhost:3000/clientes/99` | — | **404** |
| 7 | PUT | `http://localhost:3000/clientes/1` | `{"email":"ana.nova@email.com"}` | 200 |
| 8 | POST | `http://localhost:3000/clientes` | `{"nome":"Ana Dup","cpf":"123.456.789-00"}` | **409** |
| 9 | POST | `http://localhost:3000/clientes` | `{"cpf":"111"}` | **400** |
| 10 | DELETE | `http://localhost:3000/clientes/2` | — | **204** |
| 11 | GET | `http://localhost:3000/clientes/2` | — | 404 |

Pelo terminal, se preferir (no Windows, use `curl.exe` no PowerShell):

```bash
curl http://localhost:3000/clientes
curl -X POST http://localhost:3000/clientes -H "Content-Type: application/json" -d '{"nome":"Ana Silva","cpf":"123.456.789-00"}'
curl -i -X DELETE http://localhost:3000/clientes/1
```

### ✅ Checkpoint A11
Você viu, no Thunder Client, um **201**, um **404**, um **409**, um **400** e um **204**. No terminal do servidor, cada requisição apareceu no log, e os erros apareceram com ❌ e o status.

> **Reiniciou o servidor?** A memória zera: os clientes somem. É o esperado hoje; é exatamente o problema que o SQLite resolve na S5.

## Passo A12 — Commit da Parte A

```bash
cd ../..            # volta para a raiz do repositório
git add s3/
git commit -m "feat(s3): API bancária em camadas com Express 5 (clientes)"
git push -u origin feature/s3-backend
```

### ✅ Checkpoint A12
`git status` limpo. No GitHub, a branch `feature/s3-backend` aparece com a pasta `s3/banco-api/` **sem** `node_modules/`.

## Passo A13 (se der tempo) — O segundo recurso: `contas`

É o padrão de **relação 1:N** (um cliente tem várias contas) que a maioria de vocês vai precisar na Parte B. O código completo está na seção [Código completo: contas](#código-completo-contas) no final. O que ele acrescenta:

- `contaModel.js` com `listarPorCliente(clienteId)`;
- `contaService.js` com três regras: campos obrigatórios (400), tipo válido (400) e **cliente precisa existir** (422, consultando o `clienteModel`);
- `GET /contas?clienteId=1` lendo `req.query` no controller;
- no `app.js`: `import contasRouter from './routes/contas.js'` e `app.use('/contas', contasRouter)`.

Testes extras: `POST /contas` com `{"tipo":"corrente","saldo":1500,"clienteId":1}` → 201; com `clienteId: 999` → **422**; com `tipo: "salario"` → 400; `GET /contas?clienteId=1` → 200.

---

# Parte B — A API do seu Projeto 1 (50 min)

Agora o mesmo esqueleto, no seu domínio, no lugar definitivo: a pasta **`backend/` na raiz do repositório** (a S4 cria `frontend/` ao lado; a S5 troca o model por SQLite aqui dentro).

## Passo B1 — Escolher duas entidades

Abra o seu `MODELAGEM.md`. Escolha **as duas entidades mais importantes** do domínio. Se há uma relação 1:N entre elas (Pedido → Itens, Turma → Alunos, Consulta → Paciente), escolha essas: você vai copiar o padrão de `contas`.

Para cada entidade, anote:
- os **campos** (3 a 6) e quais são obrigatórios;
- **uma regra de negócio** além de "campo obrigatório": algo único (CPF, matrícula, código), um valor válido (status dentro de uma lista, quantidade > 0) ou uma dependência (o pai precisa existir → 422).

## Passo B2 — Criar o `backend/`

Na raiz do repositório:

```bash
mkdir backend && cd backend
npm init -y
npm install express
mkdir -p src/routes src/controllers src/services src/models src/middleware src/utils
```

Copie da Parte A, **sem mudar nada**: `package.json` (troque só o `name`), `.gitignore`, `src/utils/erro.js`, `src/middleware/logger.js`, `src/middleware/errorHandler.js`, `src/server.js`.

## Passo B3 — Model, service, controller e route da primeira entidade

Copie os quatro arquivos de `cliente` e renomeie (exemplo com `produto`):

| Parte A | Seu projeto |
|---|---|
| `models/clienteModel.js` → `clienteModel` | `models/produtoModel.js` → `produtoModel` |
| `services/clienteService.js` | `services/produtoService.js` |
| `controllers/clienteController.js` | `controllers/produtoController.js` |
| `routes/clientes.js` | `routes/produtos.js` |

Depois adapte:
- no **model**: os campos do `inserir({ ... })` e a função de busca da sua regra (ex.: `existeCodigo(codigo)` no lugar de `existeCpf`);
- no **service**: a validação de obrigatórios e a sua regra (400 ou 409);
- no **controller** e na **route**: só os nomes.

## Passo B4 — A segunda entidade

Repita o B3. Se ela depende da primeira (1:N), use `contas` como molde: campo `<pai>Id`, regra "o pai precisa existir" (422) consultando o model do pai, e o filtro `GET /filhos?<pai>Id=1`.

## Passo B5 — `app.js`

Copie o da Parte A e troque as rotas:

```javascript
import produtosRouter from './routes/produtos.js';
import categoriasRouter from './routes/categorias.js';
// ...
app.use('/produtos', produtosRouter);
app.use('/categorias', categoriasRouter);
```

Atualize também o health check (`rotas: ['/produtos', '/categorias']`) e o nome da API.

```bash
npm run dev
```

### ✅ Checkpoint B5
`http://localhost:3000` responde com o nome da **sua** API e as **suas** rotas. (Se a Parte A ainda está rodando na 3000, pare-a com `Ctrl+C` ou rode esta com `PORT=3001 npm run dev`.)

## Passo B6 — Testar e registrar em `backend/TESTES.md`

Teste no Thunder Client, na ordem: criar (201), listar (200), buscar um (200), buscar inexistente (404), violar a sua regra (400/409/422), atualizar (200), remover (204). Registre em `backend/TESTES.md`:

```markdown
# Testes da API — Projeto 1 (S3)

API: Loja de Bairro · entidades: Produto e Categoria · servidor: `npm run dev` em http://localhost:3000

| # | Método | URL | Body | Status obtido | Observação |
|---|---|---|---|---|---|
| 1 | POST | /categorias | {"nome":"Bebidas"} | 201 | |
| 2 | POST | /produtos | {"nome":"Água 500ml","preco":3.5,"categoriaId":1} | 201 | |
| 3 | GET | /produtos?categoriaId=1 | — | 200 | filtro 1:N |
| 4 | GET | /produtos/99 | — | 404 | |
| 5 | POST | /produtos | {"nome":"X","preco":-1,"categoriaId":1} | 400 | regra: preço > 0 |
| 6 | POST | /produtos | {"nome":"Y","preco":2,"categoriaId":999} | 422 | categoria não existe |
| 7 | DELETE | /categorias/1 | — | 204 | |
```

Mínimo: **5 linhas**, com pelo menos **um 201, um 404 e um erro de regra (400, 409 ou 422)**.

## Passo B7 — Commit, push e pull request

```bash
cd ..               # raiz do repositório
git add backend/ 
git commit -m "feat(backend): API do Projeto 1 em camadas (produtos e categorias)"
git push
```

Abra o pull request **pelo terminal**:

```bash
gh pr create --base main --head feature/s3-backend --title "S3: API em camadas (banco-api + backend do Projeto 1)" --body "Parte A: s3/banco-api (clientes). Parte B: backend/ com duas entidades, regras de negócio e TESTES.md."
gh pr view --web
```

<details>
<summary><strong>Sem o gh? Caminho pelo site</strong></summary>

1. Abra `https://github.com/SEU-USUARIO/progweb-p1-nome-sobrenome`.
2. Clique na faixa amarela **Compare & pull request** (ou **Pull requests → New pull request**, base `main`, compare `feature/s3-backend`).
3. Título: `S3: API em camadas`. **Create pull request**.

</details>

**Não clique em "Merge pull request".** O PR fica aberto; o merge é combinado na S4.

### ✅ Checkpoint B7
Na página do PR: estado **Open**; aba **Files changed** mostra `s3/banco-api/...` e `backend/...`, com `package.json`, `src/` e `TESTES.md`, e **nenhum** `node_modules/`. O endereço (`.../pull/3`, ou outro número) é o link da entrega.

---

# Entrega

Na atividade **"S3 · Mãos à Obra"** do Google Classroom, cole o link do pull request e clique em **Entregar**. Prazo: **quinta 05/11, 23h59**. A aula serve para fazer a Parte A inteira e começar a Parte B; quem não terminar fecha em casa.

## Checklist final

- [ ] Os PRs da S2 foram mesclados: `MODELAGEM.md` está na `main`.
- [ ] O PR `feature/s3-backend → main` está **aberto**.
- [ ] `s3/banco-api/` roda com `npm run dev` e responde 201, 404, 409, 400 e 204.
- [ ] `backend/` tem `package.json` com `"type": "module"` e `.gitignore` com `node_modules/`.
- [ ] `backend/src/` tem `routes/`, `controllers/`, `services/`, `models/`, `middleware/` e `utils/`.
- [ ] Duas entidades, cada uma com model, service, controller e route.
- [ ] Pelo menos uma regra de negócio por entidade, no **service**, com `throw erro(...)`.
- [ ] Nenhum controller tem `if` de negócio nem `try/catch`; nenhum service importa `express`.
- [ ] `backend/TESTES.md` com 5+ requisições, incluindo 201, 404 e um erro de regra.
- [ ] `node_modules/` não está no repositório.

## O que o professor vai conferir

Repositório público; PR aberto a partir de `feature/s3-backend`; a estrutura em camadas respeitada (os quatro "não faz" da tabela da Parte A); o `TESTES.md` coerente com o código (vou rodar uma ou duas linhas dele).

## Para a próxima quarta (S4 · 11/11)

Traga **a API do seu Projeto 1 rodando** (`cd backend && npm run dev`). Na S4 construímos a tela: HTML, CSS, Bootstrap e uma SPA em Vanilla JS que chama a sua API com `fetch()`. O primeiro passo da S4 é habilitar o **CORS** na API, mais um `app.use` na cadeia de middleware.

---

# Problemas comuns

**`SyntaxError: Cannot use import statement outside a module`**
Faltou `"type": "module"` no `package.json` (Passo A2).

**`Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../services/clienteService'`**
Nos ES Modules a extensão é obrigatória: `import ... from '../services/clienteService.js'`. Confira também maiúsculas e minúsculas no nome do arquivo (no Linux, `ClienteService.js` ≠ `clienteService.js`).

**`Error: Cannot find package 'express'`**
Você rodou `node` fora da pasta do projeto, ou não rodou `npm install express` nela. `ls node_modules/express` tem de existir.

**`Error: listen EADDRINUSE: address already in use :::3000`**
Outra API já está na porta 3000 (a da Parte A, provavelmente). Pare-a com `Ctrl+C` no terminal dela, ou suba esta em outra porta: `PORT=3001 npm run dev` (no PowerShell: `$env:PORT=3001; npm run dev`).

**`req.body` é `undefined` / POST sempre dá 400**
(1) `app.use(express.json())` precisa vir **antes** de `app.use('/clientes', ...)`. (2) No Thunder Client, o body precisa estar na aba **Body → JSON**, não em Form. (3) JSON inválido (vírgula a mais, aspas simples) devolve 400 antes de chegar ao service.

**A requisição fica "carregando" para sempre**
Um middleware sem `next()` (o `logger`, quase sempre), ou um controller que não chamou `res.json()`/`res.end()`.

**`GET /clientes/1` devolve 404 mesmo com o cliente criado**
Faltou `Number(req.params.id)` no controller: `'1' === 1` é `false`.

**O erro do service vira 500 em vez de 404/409**
O `errorHandler` tem só três parâmetros, ou não é o último `app.use`. Ou o `throw` está dentro de um callback (`forEach`, `setTimeout`) que o Express não acompanha: use `return`/`throw` direto na função do service.

**`TypeError: Missing parameter name at index 1: *`** (ao subir)
Sintaxe de rota do Express 4 que o 5 não aceita (`'*'`, `'/:id?'` com regex). Para "qualquer rota", use um middleware sem caminho, como no `app.js` do Passo A10.

**Os dados somem quando salvo um arquivo**
`node --watch` reinicia o processo e a memória zera. Esperado. S5.

**No PowerShell, `curl -X POST ... -d '{...}'` dá erro**
`curl` no PowerShell é um alias de `Invoke-WebRequest`. Use `curl.exe` e aspas duplas escapadas: `curl.exe -X POST http://localhost:3000/clientes -H "Content-Type: application/json" -d "{\"nome\":\"Ana\",\"cpf\":\"1\"}"`. Ou use o Thunder Client.

**`git push` pede usuário e senha / `gh: not logged in`**
`gh auth login` de novo (S1). Senha de conta não funciona no push; é token ou SSH.

**O PR da S3 mostra arquivos da S2 que já foram mesclados**
Você criou `feature/s3-backend` antes do `git pull` da `main`. Resolva: `git switch main && git pull && git switch feature/s3-backend && git merge main`. Se houver conflito, chame o professor.

**`node_modules/` foi para o GitHub**
Faltou o `.gitignore` antes do primeiro commit. Corrija: crie o `.gitignore`, rode `git rm -r --cached backend/node_modules s3/banco-api/node_modules`, faça commit e push.

---

# Código completo: contas

Os arquivos do segundo recurso da Parte A (Passo A13). Com eles, o `app.js` ganha `import contasRouter from './routes/contas.js';` e `app.use('/contas', contasRouter);`, e o health check lista `['/clientes', '/contas']`.

`src/models/contaModel.js`:

```javascript
let contas = [];
let proximoId = 1;

export const contaModel = {
  listar() {
    return contas;
  },

  listarPorCliente(clienteId) {
    return contas.filter((c) => c.clienteId === clienteId);
  },

  buscarPorId(id) {
    return contas.find((c) => c.id === id) ?? null;
  },

  inserir({ tipo, saldo, clienteId }) {
    const nova = {
      id: proximoId++,
      tipo,
      saldo: Number(saldo),
      clienteId: Number(clienteId),
      criadaEm: new Date().toISOString(),
    };
    contas.push(nova);
    return nova;
  },

  atualizar(id, dados) {
    const i = contas.findIndex((c) => c.id === id);
    if (i === -1) return null;
    contas[i] = { ...contas[i], ...dados, id };
    return contas[i];
  },

  remover(id) {
    const antes = contas.length;
    contas = contas.filter((c) => c.id !== id);
    return contas.length < antes;
  },
};
```

`src/services/contaService.js`:

```javascript
import { contaModel } from '../models/contaModel.js';
import { clienteModel } from '../models/clienteModel.js';
import { erro } from '../utils/erro.js';

const TIPOS = ['corrente', 'poupanca'];

export const contaService = {
  listar(clienteId) {
    if (clienteId) return contaModel.listarPorCliente(Number(clienteId));
    return contaModel.listar();
  },

  buscarPorId(id) {
    const conta = contaModel.buscarPorId(id);
    if (!conta) throw erro(404, 'Conta não encontrada');
    return conta;
  },

  criar({ tipo, saldo, clienteId } = {}) {
    if (!tipo || saldo === undefined || !clienteId) {
      throw erro(400, 'Campos "tipo", "saldo" e "clienteId" são obrigatórios');
    }
    if (!TIPOS.includes(tipo)) throw erro(400, `Tipo deve ser um de: ${TIPOS.join(', ')}`);
    // Regra: o cliente precisa existir
    if (!clienteModel.buscarPorId(Number(clienteId))) throw erro(422, 'Cliente informado não existe');
    return contaModel.inserir({ tipo, saldo, clienteId });
  },

  atualizar(id, dados = {}) {
    const atualizada = contaModel.atualizar(id, dados);
    if (!atualizada) throw erro(404, 'Conta não encontrada');
    return atualizada;
  },

  remover(id) {
    const removida = contaModel.remover(id);
    if (!removida) throw erro(404, 'Conta não encontrada');
  },
};
```

`src/controllers/contaController.js`:

```javascript
import { contaService } from '../services/contaService.js';

export const contaController = {
  listar(req, res) {
    res.json(contaService.listar(req.query.clienteId));
  },

  buscarPorId(req, res) {
    res.json(contaService.buscarPorId(Number(req.params.id)));
  },

  criar(req, res) {
    const nova = contaService.criar(req.body);
    res.status(201).json(nova);
  },

  atualizar(req, res) {
    res.json(contaService.atualizar(Number(req.params.id), req.body));
  },

  remover(req, res) {
    contaService.remover(Number(req.params.id));
    res.status(204).end();
  },
};
```

`src/routes/contas.js`:

```javascript
import { Router } from 'express';
import { contaController } from '../controllers/contaController.js';

const router = Router();

router.get('/', contaController.listar);
router.get('/:id', contaController.buscarPorId);
router.post('/', contaController.criar);
router.put('/:id', contaController.atualizar);
router.delete('/:id', contaController.remover);

export default router;
```

> O projeto completo da Parte A (clientes + contas, sem `node_modules/`) está no arquivo `S3_banco-api.zip` anexado à atividade: descompacte, `npm install`, `npm run dev`.

---

## Referências

- Express 5 — *Moving to Express 5*: https://expressjs.com/en/guide/migrating-5.html
- Express — *Error Handling*: https://expressjs.com/en/guide/error-handling.html
- MDN — *An overview of HTTP*: https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview
- MDN — *HTTP response status codes*: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- Node.js — *ECMAScript modules*: https://nodejs.org/api/esm.html
- Node.js Best Practices (Yoni Goldberg), seção 1, *Project Architecture Practices*: https://github.com/goldbergyoni/nodebestpractices
- Thunder Client: https://www.thunderclient.com/
- Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures*, cap. 5: https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm