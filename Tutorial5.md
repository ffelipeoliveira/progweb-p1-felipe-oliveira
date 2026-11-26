# Tutorial S5 — Persistência com SQLite

**Semana 5 · Mãos à Obra · Programação Web · UEPB 2026.2**
**Prof. Rodrigo Alves Costa · quarta-feira, 18/11/2026**

Hoje o array em memória vira um banco de dados de verdade. Na Parte A trocamos juntos os models da `banco-api`; na Parte B você faz o mesmo no `backend/` do **seu Projeto 1**.

> **Faltou hoje?** Este tutorial é completo: siga do começo ao fim. A `banco-api` pronta da Parte A está em `S5_banco-api-sqlite.zip`, anexado à atividade. Depois, siga o `S5_Roteiro_Documentacao_Deploy.md` para fechar o Projeto 1.

---

## Na Aula 1 vimos…

1. **Persistência** (slide 5): o array mora na RAM do processo e some a cada reinício. Persistir é gravar em disco, de forma estruturada.
2. **Modelo relacional e SQL** (slides 6 a 9): dados em tabelas, ligadas por valor (chave primária e chave estrangeira); `INSERT`, `SELECT`, `UPDATE` e `DELETE` são o CRUD em SQL (Structured Query Language).
3. **SQLite e o DIP** (slides 10 a 14): o banco é um arquivo, e o Node 22+ já traz o módulo `node:sqlite`. Só a camada **Model** muda, porque o service depende do contrato, não da implementação (DIP, o Princípio da Inversão de Dependência da S2).
4. **SQL Injection** (slide 15): nunca montar SQL com `+`. Sempre `?`, para o dado viajar separado do comando.
5. **Integridade** (slide 16): a chave estrangeira impede a conta órfã da S4; a regra de negócio, com mensagem clara, mora no service.

---

## Roteiro da aula (2h)

| Bloco | Tempo | O que acontece |
|---|---|---|
| Setup | 10 min | Conferir o ambiente; **merge do PR da S4**; branch de hoje |
| Parte A | 50 min | O professor troca os models da `s3/banco-api`; você replica |
| Parte B | 50 min | Você troca os models do `backend/` do **seu** Projeto 1 |
| Fechamento | 10 min | Commit, push, pull request, plenária |

**Entregável:** hoje não há entrega semanal separada. A entrega é o **Projeto 1** (vídeo + link do repositório + links do deploy), na atividade **"Projeto 1"** do Google Classroom, até **quinta 19/11, 23h59**. O que falta depois da aula está no `S5_Roteiro_Documentacao_Deploy.md`.

---

# Setup (10 min)

## Passo 0.1 — Conferir o ambiente

```bash
node -v      # v22 ou superior
git --version
```

### ✅ Checkpoint 0.1
`node -v` mostra `v22.x` ou maior. O módulo `node:sqlite` só existe a partir do Node 22.

> **Node menor que 22 e sem como atualizar agora?** Veja [Plano B: better-sqlite3](#plano-b-better-sqlite3) no fim do tutorial.

## Passo 0.2 — Merge do pull request da S4

O PR `feature/s4-frontend` ficou aberto. Hoje ele entra na `main`.

**Pelo terminal** (com o `gh` autenticado), dentro da pasta do repositório:

```bash
cd progweb-p1-nome-sobrenome      # ajuste para o seu nome
gh pr list                        # mostra o PR aberto e o número dele
gh pr merge 4 --merge --delete-branch     # troque 4 pelo número que apareceu
```

<details>
<summary><strong>Sem o gh? Caminho pelo site</strong></summary>

1. Abra `https://github.com/SEU-USUARIO/progweb-p1-nome-sobrenome/pulls`.
2. Abra o PR da S4 → botão verde **Merge pull request** → **Confirm merge** → **Delete branch**.

</details>

Agora traga a `main` atualizada e crie a branch de hoje:

```bash
git switch main
git pull
git switch -c feature/s5-sqlite
```

### ✅ Checkpoint 0.2
`ls` mostra `MODELAGEM.md`, `README.md`, `backend/`, `frontend/`, `s1/`, `s2/`, `s3/` e `s4/`. `git branch` mostra `* feature/s5-sqlite`.

> **Faltou na S4, ou a sua `s3/banco-api` não roda?** Descompacte o `S5_banco-api-sqlite.zip` por cima da pasta `s3/banco-api`, rode `npm install` e acompanhe a Parte A lendo os arquivos prontos.

---

# Parte A — A banco-api ganha um banco (50 min)

Trabalhamos em **`s3/banco-api`**, a mesma API da S3, que na S4 ganhou o CORS. O plano:

```
routes        →  não muda
controllers   →  não muda
services      →  não muda   (até o Passo A7, que acrescenta UMA regra)
models        →  array  →  SQLite     ← só aqui
```

O contrato que os services usam fica igual:

| Model | Métodos (os mesmos da S3) |
|---|---|
| `clienteModel` | `listar` · `buscarPorId` · `existeCpf` · `inserir` · `atualizar` · `remover` |
| `contaModel` | `listar` · `listarPorCliente` · `buscarPorId` · `inserir` · `atualizar` · `remover` |

## Passo A1 — Ver o problema uma última vez

```bash
cd s3/banco-api
npm install        # se ainda não instalou nesta máquina
npm run dev
```

No Thunder Client: `POST http://localhost:3000/clientes` com

```json
{ "nome": "Ana Silva", "cpf": "111", "email": "ana@x.com" }
```

Depois `GET /clientes`: a Ana está lá. Agora, no terminal, **`Ctrl+C`** e `npm run dev` de novo. `GET /clientes` → `[]`.

### ✅ Checkpoint A1
Depois do restart, `GET /clientes` devolve `[]`. É a última vez.

## Passo A2 — `src/db.js`: a conexão e o schema

Crie o arquivo `s3/banco-api/src/db.js`:

```javascript
import { DatabaseSync } from 'node:sqlite';

// O banco inteiro é um arquivo. Se não existir, o SQLite cria.
const arquivo = process.env.DB_FILE ?? 'banco.db';
export const db = new DatabaseSync(arquivo);

// No SQLite a checagem de chave estrangeira vem desligada.
// Tem de ligar a cada conexão.
db.exec('PRAGMA foreign_keys = ON;');

// O schema. IF NOT EXISTS: este arquivo roda toda vez que o servidor sobe.
db.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    nome  TEXT NOT NULL,
    cpf   TEXT NOT NULL UNIQUE,
    email TEXT
  );

  CREATE TABLE IF NOT EXISTS contas (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo       TEXT NOT NULL CHECK (tipo IN ('corrente', 'poupanca')),
    saldo      REAL NOT NULL,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    criada_em  TEXT NOT NULL
  );
`);
```

**Pare e explique:**
- **`node:sqlite`** é módulo embutido (o prefixo `node:` indica isso). Não há `npm install`.
- **`DatabaseSync`**: API síncrona, sem `await`. Abre o arquivo; se ele não existe, cria.
- **`process.env.DB_FILE ?? 'banco.db'`**: o nome do arquivo pode vir de uma variável de ambiente (vamos usar no deploy). Sem ela, vale `banco.db`.
- **`PRAGMA foreign_keys = ON`**: no SQLite, a checagem de chave estrangeira vem **desligada**. Sem esta linha, a conta órfã da S4 continua possível.
- **`IF NOT EXISTS`**: este arquivo roda toda vez que o servidor sobe.
- **`PRIMARY KEY AUTOINCREMENT`** substitui o `proximoId++`. **`NOT NULL`** e **`UNIQUE`** repetem, dentro do banco, regras que já existiam no service.
- **`CHECK (tipo IN (...))`**: o banco só aceita os dois tipos de conta.
- **`REFERENCES clientes(id)`**: a chave estrangeira (FK, Foreign Key).
- No banco os nomes são `snake_case` (`cliente_id`); no JSON da API, `camelCase` (`clienteId`). O model traduz, no Passo A5.

> **Dinheiro em `REAL`?** Em sistema de verdade, não: ponto flutuante erra centavos, e o usual é `INTEGER` em centavos. Mantemos `REAL` para não mudar o contrato da S3.

## Passo A3 — `src/models/clienteModel.js` com SQL

**Substitua todo o conteúdo** do arquivo por:

```javascript
import { db } from '../db.js';

// Mesmo contrato da S3 (listar, buscarPorId, existeCpf, inserir,
// atualizar, remover). Só o "como" mudou: o array virou tabela.
export const clienteModel = {
  listar() {
    return db.prepare('SELECT * FROM clientes ORDER BY id').all();
  },

  buscarPorId(id) {
    return db.prepare('SELECT * FROM clientes WHERE id = ?').get(id) ?? null;
  },

  existeCpf(cpf) {
    const linha = db.prepare('SELECT 1 FROM clientes WHERE cpf = ?').get(cpf);
    return linha !== undefined;
  },

  inserir({ nome, cpf, email }) {
    const r = db
      .prepare('INSERT INTO clientes (nome, cpf, email) VALUES (?, ?, ?)')
      .run(nome, cpf, email ?? null);
    return this.buscarPorId(r.lastInsertRowid);
  },

  atualizar(id, dados) {
    const atual = this.buscarPorId(id);
    if (!atual) return null;
    const novo = { ...atual, ...dados };
    db.prepare('UPDATE clientes SET nome = ?, cpf = ?, email = ? WHERE id = ?')
      .run(novo.nome, novo.cpf, novo.email ?? null, id); // o id nunca muda
    return this.buscarPorId(id);
  },

  remover(id) {
    const r = db.prepare('DELETE FROM clientes WHERE id = ?').run(id);
    return r.changes > 0; // true = removeu
  },
};
```

**Pare e explique:**
- `db.prepare(sql)` compila a instrução. Depois: **`.all()`** devolve um array de linhas; **`.get()`** devolve uma linha ou `undefined`; **`.run()`** executa `INSERT`, `UPDATE` ou `DELETE` e devolve `{ changes, lastInsertRowid }`.
- Os **`?`** são placeholders: o valor viaja separado do SQL. É o que impede a SQL Injection (slide 15). **Nunca** monte SQL com `+` ou `${}` usando dados que vieram de `req`.
- `email ?? null`: o `node:sqlite` não aceita `undefined` como valor. Campo opcional precisa virar `null`.
- `inserir` grava e **relê a linha** do banco, para devolver o mesmo objeto de antes: `{ id, nome, cpf, email }`.
- `atualizar` lê a linha atual, mistura com os dados novos e grava. O `id` fica fora do `SET`: ele nunca muda.
- `r.changes > 0` responde "removeu ou não?", o mesmo `true`/`false` que o service já esperava.
- **Compare os nomes e os parâmetros dos métodos com os da S3: são idênticos.**

## Passo A4 — Rodar, testar e reiniciar

O `node --watch` já reiniciou o servidor. Se você o tinha parado: `npm run dev`.

No terminal aparece um aviso:

```
ExperimentalWarning: SQLite is an experimental feature and might change at any time
```

É **esperado** no Node 22: o módulo funciona, e o aviso só informa que a API ainda pode mudar em versões futuras.

Repita, no Thunder Client, os testes da S3:

| # | Requisição | Body | Esperado |
|---|---|---|---|
| 1 | `POST /clientes` | `{ "nome": "Ana Silva", "cpf": "111", "email": "ana@x.com" }` | **201** + objeto com `id: 1` |
| 2 | `POST /clientes` | `{ "nome": "Bruno Costa", "cpf": "222" }` | **201**, com `"email": null` |
| 3 | `POST /clientes` | `{ "nome": "X", "cpf": "111" }` | **409** (regra do service) |
| 4 | `POST /clientes` | `{ "cpf": "333" }` | **400** |
| 5 | `GET /clientes` | | **200**, dois clientes |
| 6 | `GET /clientes/999` | | **404** |
| 7 | `PUT /clientes/1` | `{ "email": "ana@uepb.edu.br" }` | **200**, só o e-mail mudou |

Agora a prova: no terminal, **`Ctrl+C`**, depois `npm run dev`, depois `GET /clientes`.

### ✅ Checkpoint A4
Depois do restart, `GET /clientes` **devolve a Ana e o Bruno**. Na pasta `s3/banco-api` apareceu o arquivo `banco.db`.

> As rotas de `contas` ainda usam o array da S3. Vamos trocar no próximo passo.

## Passo A5 — `src/models/contaModel.js` com SQL

**Substitua todo o conteúdo** do arquivo por:

```javascript
import { db } from '../db.js';

// No banco: snake_case (cliente_id). No JSON da API: camelCase (clienteId).
// O AS traduz aqui, na única camada que conhece o banco.
const COLUNAS = `id, tipo, saldo,
  cliente_id AS clienteId, criada_em AS criadaEm`;

export const contaModel = {
  listar() {
    return db.prepare(`SELECT ${COLUNAS} FROM contas ORDER BY id`).all();
  },

  listarPorCliente(clienteId) {
    return db
      .prepare(`SELECT ${COLUNAS} FROM contas WHERE cliente_id = ? ORDER BY id`)
      .all(clienteId);
  },

  buscarPorId(id) {
    return db
      .prepare(`SELECT ${COLUNAS} FROM contas WHERE id = ?`)
      .get(id) ?? null;
  },

  inserir({ tipo, saldo, clienteId }) {
    const r = db
      .prepare(`INSERT INTO contas (tipo, saldo, cliente_id, criada_em)
                VALUES (?, ?, ?, ?)`)
      .run(tipo, Number(saldo), Number(clienteId), new Date().toISOString());
    return this.buscarPorId(r.lastInsertRowid);
  },

  atualizar(id, dados) {
    const atual = this.buscarPorId(id);
    if (!atual) return null;
    const novo = { ...atual, ...dados };
    db.prepare('UPDATE contas SET tipo = ?, saldo = ?, cliente_id = ? WHERE id = ?')
      .run(novo.tipo, Number(novo.saldo), Number(novo.clienteId), id);
    return this.buscarPorId(id);
  },

  remover(id) {
    const r = db.prepare('DELETE FROM contas WHERE id = ?').run(id);
    return r.changes > 0;
  },
};
```

**Pare e explique:**
- **`COLUNAS`** lista as colunas e usa **`AS`** para devolver `clienteId` e `criadaEm`, os nomes que a API da S3 e o front da S4 já usam. A tradução fica na única camada que conhece o banco.
- `${COLUNAS}` dentro do SQL **não** é injeção: é uma constante escrita por nós, não um dado do usuário.
- `Number(saldo)` e `Number(clienteId)`: o JSON pode trazer `"1500"` como texto; o model garante o tipo.

Teste:

| # | Requisição | Body | Esperado |
|---|---|---|---|
| 8 | `POST /contas` | `{ "tipo": "poupanca", "saldo": 1500.5, "clienteId": 1 }` | **201**, com `clienteId` e `criadaEm` |
| 9 | `POST /contas` | `{ "tipo": "corrente", "saldo": 1, "clienteId": 999 }` | **422** |
| 10 | `POST /contas` | `{ "tipo": "salario", "saldo": 1, "clienteId": 1 }` | **400** |
| 11 | `GET /contas?clienteId=1` | | **200**, uma conta |
| 12 | `PUT /contas/1` | `{ "saldo": 2000 }` | **200**, saldo novo |

### ✅ Checkpoint A5
A resposta do teste 8 tem as chaves `clienteId` e `criadaEm` (e **não** `cliente_id`). Reinicie o servidor: a conta continua lá.

## Passo A6 — A prova do DIP: `git diff --stat`

No terminal, na pasta `s3/banco-api`:

```bash
git add -A
git status --short
git diff --cached --stat
```

### ✅ Checkpoint A6
A lista tem **só** `src/db.js` (novo), `src/models/clienteModel.js` e `src/models/contaModel.js`. Nenhum arquivo de `services/`, `controllers/` ou `routes/`. Trocamos o banco inteiro mexendo em três arquivos.

Se `banco.db` apareceu na lista, tire-o do Git e ignore-o. Edite `s3/banco-api/.gitignore`:

```
node_modules/
.env
banco.db
```

```bash
git rm --cached banco.db      # só se ele apareceu no git status
git add -A
```

> O que vai para o Git é o **schema** (no `db.js`). Os dados são de cada máquina.

## Passo A7 — A conta órfã, do 500 ao 409

Na S4 você removeu um cliente e a conta dele ficou órfã. Tente agora, com a conta do teste 8 ainda cadastrada:

`DELETE /clientes/1` → **500** `{ "erro": "FOREIGN KEY constraint failed" }`

O banco **recusou**: o dado está protegido. Mas a resposta é ruim: 500 significa "erro do servidor", e a mensagem não ajuda o usuário. "Cliente com contas não pode ser removido" é uma **regra de negócio**, e regra de negócio mora no **service**.

Em `src/services/clienteService.js`, acrescente o `import` do `contaModel` e a regra no `remover`:

```javascript
import { clienteModel } from '../models/clienteModel.js';
import { contaModel } from '../models/contaModel.js';
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
    // Regra nova (S5): cliente com contas não pode ser removido
    if (contaModel.listarPorCliente(id).length > 0) {
      throw erro(409, 'Cliente possui contas. Remova as contas primeiro.');
    }
    const removido = clienteModel.remover(id);
    if (!removido) throw erro(404, 'Cliente não encontrado');
  },
};
```

Teste de novo:

| # | Requisição | Esperado |
|---|---|---|
| 13 | `DELETE /clientes/1` (com conta) | **409** `Cliente possui contas. Remova as contas primeiro.` |
| 14 | `DELETE /contas/1` | **204** |
| 15 | `DELETE /clientes/1` (sem conta) | **204** |
| 16 | `DELETE /clientes/1` de novo | **404** |

**Pare e explique:**
- Isto **não** contradiz o "services não mudam". A troca do banco não exigiu mudança nenhuma (Checkpoint A6). O que entrou agora foi uma **regra nova**, que o array escondia.
- As duas barreiras se completam: o **banco** garante que o dado nunca fica inconsistente; o **service** explica a regra, com o status e a mensagem certos.
- Abra o front da S4 (`npx http-server -p 5500 -c-1` em `s4/banco-frontend`) e tente remover um cliente com conta: a mensagem do 409 aparece na tela, sem mudar uma linha do front.

### ✅ Checkpoint A7
`DELETE` de um cliente com conta devolve **409** com a mensagem acima.

## Passo A8 — Tentar uma SQL Injection

`POST /clientes` com:

```json
{ "nome": "Mallory", "cpf": "' OR '1'='1" }
```

### ✅ Checkpoint A8
A resposta é **201**, e o `cpf` foi gravado como o texto `' OR '1'='1`. Nada quebrou e nada vazou: com `?`, o valor é **dado**, nunca comando. `GET /clientes` mostra a Mallory com um CPF esquisito. (Remova-a depois.)

## Passo A9 — Olhar dentro do banco (opcional)

Instale no VS Code a extensão **SQLite Viewer** e clique em `banco.db`: aparecem as tabelas `clientes` e `contas`, com as linhas que você criou. Também aparece `sqlite_sequence`, que o SQLite usa para o `AUTOINCREMENT`.

## Passo A10 — Commit da Parte A

```bash
cd ../..            # volta para a raiz do repositório
git add s3/
git commit -m "feat(s5): banco-api persiste em SQLite (node:sqlite)"
git push -u origin feature/s5-sqlite
```

### ✅ Checkpoint A10
`git status` limpo. No GitHub, a branch `feature/s5-sqlite` existe e **não** contém `banco.db`.

## Desafio (para quem terminou antes)

`PUT /clientes/2` com `{ "cpf": "111" }`, sendo `111` o CPF de outro cliente. Na S3 isso passava e duplicava o CPF; agora o `UNIQUE` barra, com **500** `UNIQUE constraint failed: clientes.cpf`. Corrija do jeito certo: uma regra no `clienteService.atualizar` que responda **409**. Dica: você vai precisar de um método novo no model, `buscarPorCpf(cpf)`, para saber se o CPF pertence a **outro** cliente.

---

# Parte B — O banco do seu Projeto 1 (50 min)

Agora o mesmo, na pasta **`backend/`** da raiz do repositório, com as suas duas entidades.

```bash
cd backend
npm install        # se ainda não instalou nesta máquina
```

## Passo B1 — Planejar as tabelas

Abra os seus dois models. Para cada entidade, anote os campos e decida o tipo de cada coluna:

| No JavaScript | No SQLite | Observação |
|---|---|---|
| texto | `TEXT` | |
| número inteiro | `INTEGER` | |
| número com casas decimais | `REAL` | |
| `true` / `false` | `INTEGER` | o SQLite não tem booleano: grave `1` ou `0` |
| data e hora | `TEXT` | grave o `toISOString()` |
| id do "pai" | `INTEGER NOT NULL REFERENCES pai(id)` | a chave estrangeira |

E as restrições:
- campo obrigatório no service → `NOT NULL`;
- valor único no service (código, matrícula, e-mail) → `UNIQUE`;
- valor dentro de uma lista (status, tipo) → `CHECK (campo IN ('a', 'b'))`.

## Passo B2 — `backend/src/db.js`

Copie o `db.js` da Parte A e troque os dois `CREATE TABLE` pelos seus. Exemplo, para quem modelou **categorias** e **produtos**:

```javascript
db.exec(`
  CREATE TABLE IF NOT EXISTS categorias (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS produtos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    nome         TEXT NOT NULL,
    preco        REAL NOT NULL,
    ativo        INTEGER NOT NULL DEFAULT 1,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id)
  );
`);
```

A tabela "pai" (a que é referenciada) vem **primeiro**. Não esqueça o `PRAGMA foreign_keys = ON`.

Acrescente `banco.db` ao `backend/.gitignore`.

### ✅ Checkpoint B2
`npm run dev` sobe sem erro e o arquivo `backend/banco.db` aparece. Se der `SQLITE_ERROR ... syntax error`, confira vírgulas e parênteses do `CREATE TABLE` (a última coluna **não** leva vírgula).

> **Mudou o schema depois de o `banco.db` já existir?** O `CREATE TABLE IF NOT EXISTS` não altera uma tabela que já existe. Em desenvolvimento, pare o servidor, **apague o `banco.db`** e suba de novo.

## Passo B3 — Reescrever o model da entidade "pai"

Use o `clienteModel.js` da Parte A como molde. Regra de ouro: **os nomes dos métodos, os parâmetros e o formato do objeto devolvido ficam exatamente como estavam**. Só o corpo muda.

Para cada método do seu model:

| O model em memória fazia | Agora |
|---|---|
| `return lista;` | `db.prepare('SELECT ... ORDER BY id').all()` |
| `lista.find(...) ?? null` | `db.prepare('SELECT ... WHERE id = ?').get(id) ?? null` |
| `lista.some(...)` | `db.prepare('SELECT 1 FROM ... WHERE campo = ?').get(valor) !== undefined` |
| `lista.push(novo); return novo;` | `INSERT` com `.run(...)` e `return this.buscarPorId(r.lastInsertRowid)` |
| `lista[i] = {...}` | ler o atual, misturar, `UPDATE ... WHERE id = ?`, reler |
| `lista = lista.filter(...)` | `DELETE ... WHERE id = ?` e `return r.changes > 0` |

Lembre: todo campo opcional vai com `?? null`, e nenhum SQL é montado com `+`.

### ✅ Checkpoint B3
No Thunder Client, o `backend/TESTES.md` da S3 passa para essa entidade: 201, 200, 404 e o erro da sua regra. **Sem alterar o service nem o controller.**

## Passo B4 — Reescrever o model da entidade "filha"

Use o `contaModel.js` como molde. Se uma coluna tem nome composto (`categoria_id`), traduza com `AS` para o nome que o seu front já usa (`categoriaId`), como fizemos com `COLUNAS`.

Se você tem um campo booleano, converta na saída, dentro do model:

```javascript
// o banco devolve 1 ou 0; a API devolvia true ou false
const paraApi = (linha) => linha && { ...linha, ativo: linha.ativo === 1 };
```

e use `paraApi(...)` nos retornos (`.all().map(paraApi)`, `paraApi(... .get(id)) ?? null`). Na entrada, grave `ativo ? 1 : 0`.

### ✅ Checkpoint B4
Os testes do `TESTES.md` passam para a segunda entidade, incluindo o 422 de "o pai precisa existir".

## Passo B5 — Testar pela tela e reiniciar

Com o backend rodando, em **outro terminal**:

```bash
cd frontend
npx http-server -p 5500 -c-1
```

Abra `http://localhost:5500` e faça o CRUD das duas entidades pela tela. Depois, no terminal do backend, `Ctrl+C` e `npm run dev`. Recarregue a página.

### ✅ Checkpoint B5
Depois do restart, **os dados continuam na tela**. O front da S4 não mudou uma linha.

## Passo B6 — A regra do pai com filhos

Tente remover, pela tela, um "pai" que tem "filhos". O banco recusa e a tela mostra `FOREIGN KEY constraint failed`. Decida o que faz sentido no seu domínio:

- **Bloquear:** acrescente a regra no service do pai, como no Passo A7 (409 com mensagem clara). É o mais comum.
- **Cascatear:** se os filhos não fazem sentido sem o pai (itens de um pedido), troque a coluna para `REFERENCES pai(id) ON DELETE CASCADE`, apague o `banco.db` e suba de novo.

### ✅ Checkpoint B6
Remover um pai com filhos mostra uma mensagem que o usuário entende, ou remove os filhos junto, conforme a sua decisão.

## Passo B7 — Conferir o DIP, commit, push e pull request

```bash
cd ..               # raiz do repositório
git add -A
git status --short
```

Confira: em `backend/`, mudaram `src/db.js`, os dois models, o `.gitignore` e, **no máximo**, o service onde entrou a regra do Passo B6. Nenhum controller, nenhuma route, nada em `frontend/`. E `banco.db` **não** está na lista.

```bash
git commit -m "feat(s5): backend do Projeto 1 persiste em SQLite"
git push
gh pr create --base main --head feature/s5-sqlite \
  --title "S5: persistência com SQLite" \
  --body "Parte A: banco-api com node:sqlite. Parte B: backend/ do Projeto 1 com SQLite; services e controllers preservados."
```

<details>
<summary><strong>Sem o gh? Caminho pelo site</strong></summary>

1. Abra `https://github.com/SEU-USUARIO/progweb-p1-nome-sobrenome`.
2. Clique na faixa amarela **Compare & pull request** (base `main`, compare `feature/s5-sqlite`).
3. Título: `S5: persistência com SQLite`. **Create pull request**.

</details>

### ✅ Checkpoint B7
O PR está **aberto**, e a aba **Files changed** não mostra `banco.db` nem `node_modules/`.

**Desta vez o merge é seu.** Você continua nesta mesma branch em casa (README, variáveis de ambiente, dados de exemplo) e faz o merge antes do deploy. O passo a passo está no `S5_Roteiro_Documentacao_Deploy.md`.

---

# Entrega

Hoje não há atividade semanal separada: a entrega é o **Projeto 1**, na atividade **"Projeto 1"** do Google Classroom, até **quinta 19/11, 23h59**:

- vídeo individual de 5 a 10 minutos (tela + voz);
- link do repositório público `progweb-p1-nome-sobrenome`;
- links do deploy (front e API).

## Checklist do que a aula de hoje deixa pronto

- [ ] O PR da S4 foi mesclado: `frontend/` está na `main`.
- [ ] `s3/banco-api` persiste em SQLite e passa nos 16 testes da Parte A.
- [ ] `backend/src/db.js` tem as duas tabelas, com `PRIMARY KEY`, `NOT NULL`, `REFERENCES` e o `PRAGMA foreign_keys = ON`.
- [ ] Os dois models do `backend/` usam SQL puro, com `?` em todos os valores.
- [ ] Nenhum SQL montado com `+` ou `${}` a partir de dados de `req`.
- [ ] Controllers e routes do `backend/` não foram alterados; services, só para a regra do Passo B6.
- [ ] O CRUD das duas entidades funciona pelo `frontend/`.
- [ ] Os dados sobrevivem ao restart do servidor.
- [ ] `banco.db` está no `.gitignore` e fora do repositório.
- [ ] O PR `feature/s5-sqlite → main` está aberto.

**Próximo passo:** `S5_Roteiro_Documentacao_Deploy.md`.

**Para a S6 (quarta 25/11):** traga o Projeto 1 rodando no notebook (back e front). Começa a Trilha 2: vamos avaliar a sua tela com as heurísticas de Nielsen.

---

# Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module: node:sqlite` | Node menor que 22 | Atualize o Node, ou use o [Plano B](#plano-b-better-sqlite3) |
| `ExperimentalWarning: SQLite is an experimental feature` | Aviso do Node 22 | É esperado; não é erro |
| `Provided value cannot be bound to SQLite parameter 2` | Um valor `undefined` foi passado ao `.run()` ou `.get()` | Use `campo ?? null`; confira se o nome do campo no body está certo |
| `SQLITE_ERROR ... near "...": syntax error` | Erro no SQL | Vírgula sobrando antes do `)`, aspas trocadas, nome de coluna errado |
| `no such table: ...` | O `CREATE TABLE` não rodou, ou o nome está diferente | Confira o `db.js` e se o model importa `{ db }` de `'../db.js'` |
| `no such column: ...` | O schema mudou, mas o `banco.db` é antigo | Pare o servidor, apague o `banco.db`, suba de novo |
| `NOT NULL constraint failed: tabela.campo` | Faltou um campo obrigatório no `INSERT` | Confira a validação do service e a ordem dos `?` |
| `UNIQUE constraint failed` com status 500 | O banco barrou um valor repetido que o service não checou | Acrescente a regra no service (veja o Desafio da Parte A) |
| `FOREIGN KEY constraint failed` com status 500 | Remoção de um pai com filhos, ou filho com pai inexistente | Regra no service (Passos A7 e B6) |
| A conta órfã ainda acontece | Faltou o `PRAGMA foreign_keys = ON` | Ele precisa rodar logo depois de abrir o banco |
| O front mostra `undefined` em um campo | O model devolve `snake_case` e o front espera `camelCase` | Use `AS` no `SELECT` (Passo A5) |
| `TypeError: Cannot read properties of undefined (reading 'buscarPorId')` | O método foi chamado sem o objeto (perdeu o `this`) | Chame sempre como `clienteModel.inserir(...)` |
| `database is locked` | Dois servidores abertos no mesmo `banco.db`, ou o arquivo aberto em outro programa | Feche o outro terminal ou o programa |
| `banco.db` aparece no `git status` | Falta a linha no `.gitignore` | Acrescente `banco.db`; se já foi adicionado, `git rm --cached banco.db` |
| `Error: listen EADDRINUSE :::3000` | A API da Parte A ainda está rodando | `Ctrl+C` nela, ou `PORT=3001 npm run dev` (PowerShell: `$env:PORT=3001; npm run dev`) |

---

# Plano B: better-sqlite3

Só para quem não consegue ter o Node 22. A API é quase idêntica.

```bash
npm install better-sqlite3
```

No `db.js`, troque as três primeiras instruções:

```javascript
import Database from 'better-sqlite3';

const arquivo = process.env.DB_FILE ?? 'banco.db';
export const db = new Database(arquivo);
db.pragma('foreign_keys = ON');
// db.exec(...) e db.prepare(...).all() / .get() / .run() continuam iguais
```

Atenção: no deploy, o `better-sqlite3` precisa ser compilado na instalação. Se possível, atualize o Node e use o módulo nativo.

---

# Código completo da Parte A

Os arquivos que mudaram na `s3/banco-api`. Todo o resto está como na S4. O projeto inteiro está no `S5_banco-api-sqlite.zip`.

`src/db.js`:

```javascript
import { DatabaseSync } from 'node:sqlite';

// O banco inteiro é um arquivo. Se não existir, o SQLite cria.
const arquivo = process.env.DB_FILE ?? 'banco.db';
export const db = new DatabaseSync(arquivo);

// No SQLite a checagem de chave estrangeira vem desligada.
// Tem de ligar a cada conexão.
db.exec('PRAGMA foreign_keys = ON;');

// O schema. IF NOT EXISTS: este arquivo roda toda vez que o servidor sobe.
db.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    nome  TEXT NOT NULL,
    cpf   TEXT NOT NULL UNIQUE,
    email TEXT
  );

  CREATE TABLE IF NOT EXISTS contas (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo       TEXT NOT NULL CHECK (tipo IN ('corrente', 'poupanca')),
    saldo      REAL NOT NULL,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    criada_em  TEXT NOT NULL
  );
`);
```

`src/models/clienteModel.js`:

```javascript
import { db } from '../db.js';

// Mesmo contrato da S3 (listar, buscarPorId, existeCpf, inserir,
// atualizar, remover). Só o "como" mudou: o array virou tabela.
export const clienteModel = {
  listar() {
    return db.prepare('SELECT * FROM clientes ORDER BY id').all();
  },

  buscarPorId(id) {
    return db.prepare('SELECT * FROM clientes WHERE id = ?').get(id) ?? null;
  },

  existeCpf(cpf) {
    const linha = db.prepare('SELECT 1 FROM clientes WHERE cpf = ?').get(cpf);
    return linha !== undefined;
  },

  inserir({ nome, cpf, email }) {
    const r = db
      .prepare('INSERT INTO clientes (nome, cpf, email) VALUES (?, ?, ?)')
      .run(nome, cpf, email ?? null);
    return this.buscarPorId(r.lastInsertRowid);
  },

  atualizar(id, dados) {
    const atual = this.buscarPorId(id);
    if (!atual) return null;
    const novo = { ...atual, ...dados };
    db.prepare('UPDATE clientes SET nome = ?, cpf = ?, email = ? WHERE id = ?')
      .run(novo.nome, novo.cpf, novo.email ?? null, id); // o id nunca muda
    return this.buscarPorId(id);
  },

  remover(id) {
    const r = db.prepare('DELETE FROM clientes WHERE id = ?').run(id);
    return r.changes > 0; // true = removeu
  },
};
```

`src/models/contaModel.js`:

```javascript
import { db } from '../db.js';

// No banco: snake_case (cliente_id). No JSON da API: camelCase (clienteId).
// O AS traduz aqui, na única camada que conhece o banco.
const COLUNAS = `id, tipo, saldo,
  cliente_id AS clienteId, criada_em AS criadaEm`;

export const contaModel = {
  listar() {
    return db.prepare(`SELECT ${COLUNAS} FROM contas ORDER BY id`).all();
  },

  listarPorCliente(clienteId) {
    return db
      .prepare(`SELECT ${COLUNAS} FROM contas WHERE cliente_id = ? ORDER BY id`)
      .all(clienteId);
  },

  buscarPorId(id) {
    return db
      .prepare(`SELECT ${COLUNAS} FROM contas WHERE id = ?`)
      .get(id) ?? null;
  },

  inserir({ tipo, saldo, clienteId }) {
    const r = db
      .prepare(`INSERT INTO contas (tipo, saldo, cliente_id, criada_em)
                VALUES (?, ?, ?, ?)`)
      .run(tipo, Number(saldo), Number(clienteId), new Date().toISOString());
    return this.buscarPorId(r.lastInsertRowid);
  },

  atualizar(id, dados) {
    const atual = this.buscarPorId(id);
    if (!atual) return null;
    const novo = { ...atual, ...dados };
    db.prepare('UPDATE contas SET tipo = ?, saldo = ?, cliente_id = ? WHERE id = ?')
      .run(novo.tipo, Number(novo.saldo), Number(novo.clienteId), id);
    return this.buscarPorId(id);
  },

  remover(id) {
    const r = db.prepare('DELETE FROM contas WHERE id = ?').run(id);
    return r.changes > 0;
  },
};
```

`src/services/clienteService.js`:

```javascript
import { clienteModel } from '../models/clienteModel.js';
import { contaModel } from '../models/contaModel.js';
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
    // Regra nova (S5): cliente com contas não pode ser removido
    if (contaModel.listarPorCliente(id).length > 0) {
      throw erro(409, 'Cliente possui contas. Remova as contas primeiro.');
    }
    const removido = clienteModel.remover(id);
    if (!removido) throw erro(404, 'Cliente não encontrado');
  },
};
```

`.gitignore`:

```
node_modules/
.env
banco.db
```

## Extra: a conta com o nome do dono (JOIN)

O slide 17 mostrou o `JOIN`. Se quiser experimentar, acrescente ao `contaModel`:

```javascript
  listarComDono() {
    return db.prepare(`
      SELECT contas.id, contas.tipo, contas.saldo,
             clientes.nome AS dono
      FROM contas
      JOIN clientes ON clientes.id = contas.cliente_id
    `).all();
  },
```

Para usar na API, o caminho é o de sempre: um método no service, um no controller e uma rota (por exemplo, `GET /contas/com-dono`, registrada **antes** de `GET /contas/:id`).

---

## Referências

- Node.js — módulo `node:sqlite`: https://nodejs.org/api/sqlite.html
- SQLite — *Appropriate Uses for SQLite*: https://sqlite.org/whentouse.html
- SQLite — *Foreign Key Support*: https://sqlite.org/foreignkeys.html
- SQLite — *Datatypes*: https://sqlite.org/datatype3.html
- OWASP — *SQL Injection Prevention Cheat Sheet*: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
- Codd, E. F. (1970). *A Relational Model of Data for Large Shared Data Banks*. Communications of the ACM, 13(6), 377–387.