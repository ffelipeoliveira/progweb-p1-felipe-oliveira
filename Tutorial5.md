# Roteiro S5 — Documentação, deploy e entrega do Projeto 1

**Semana 5 · roteiro de casa · Programação Web · UEPB 2026.2**
**Prof. Rodrigo Alves Costa**

Este roteiro começa onde o `S5_Tutorial_SQLite.md` termina: o `backend/` do seu Projeto 1 já persiste em SQLite e o pull request `feature/s5-sqlite` está aberto. Aqui você documenta, publica e entrega.

**Prazo do Projeto 1: quinta 19/11, 23h59**, na atividade **"Projeto 1"** do Google Classroom.

> As telas do Render e da Vercel mudam com frequência. Este roteiro descreve cada campo pelo que ele faz; se o nome de um botão estiver diferente, procure o equivalente.

## Visão geral

| # | Etapa | Onde | Tempo |
|---|---|---|---|
| 1 | Variáveis de ambiente | `backend/` | 15 min |
| 2 | Dados de exemplo | `backend/src/db.js` | 10 min |
| 3 | README | raiz do repositório | 30 min |
| 4 | Merge na `main` | GitHub | 5 min |
| 5 | Deploy do backend | Render | 20 min |
| 6 | Deploy do frontend | Vercel | 15 min |
| 7 | Ligar um ao outro e testar | Render + navegador | 10 min |
| 8 | Vídeo | seu computador | 40 min |
| 9 | Entrega | Google Classroom | 5 min |

As etapas 1 a 3 são feitas na branch `feature/s5-sqlite`:

```bash
git switch feature/s5-sqlite
```

---

## 1. Variáveis de ambiente

Três valores mudam entre o seu notebook e o servidor: a porta, o arquivo do banco e a origem liberada no CORS (Cross-Origin Resource Sharing). O código lê de `process.env`; o valor vem de fora.

### 1.1 — CORS configurável

Em `backend/src/app.js`, troque o bloco do `cors` da S4 por:

```javascript
// Em produção, a origem do front vem da variável CORS_ORIGIN.
const origens = (process.env.CORS_ORIGIN
  ?? 'http://localhost:5500,http://127.0.0.1:5500').split(',');
app.use(cors({ origin: origens }));
```

Sem a variável, vale o que você já tinha. Com ela, vale a lista informada (separada por vírgula).

O `db.js` já lê `process.env.DB_FILE` e o `server.js` já lê `process.env.PORT`.

### 1.2 — `.env` e `.env.example`

Crie `backend/.env` (ele **não** vai para o Git; já está no `.gitignore` desde a S3):

```
PORT=3000
DB_FILE=banco.db
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

Crie `backend/.env.example`, com o mesmo conteúdo. Este **vai** para o Git: mostra a quem clona o que precisa ser configurado.

### 1.3 — `package.json`

Em `backend/package.json`, ajuste o script `dev` e acrescente `engines`:

```json
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch --env-file-if-exists=.env src/server.js"
  },
  "engines": {
    "node": ">=22"
  },
```

- `--env-file-if-exists=.env` (Node 22) carrega o `.env` sem precisar do pacote `dotenv`.
- `engines` avisa ao Render qual versão do Node usar.

### ✅ Checkpoint 1
`npm run dev` sobe normalmente e o front local continua funcionando. Mude `PORT=3001` no `.env`, salve, reinicie: a API sobe na 3001. Volte para 3000.

Confira o `backend/.gitignore`:

```
node_modules/
.env
banco.db
```

---

## 2. Dados de exemplo

No plano grátis do Render, o disco é **efêmero**: o serviço é suspenso após 15 minutos sem acesso e, a cada reinício, o `banco.db` é apagado. Para a demonstração nunca abrir vazia, o `db.js` insere dados de exemplo **quando o banco está vazio**.

No fim de `backend/src/db.js`, adapte para as suas tabelas (o exemplo usa as da `banco-api`):

```javascript
// Dados de exemplo: só entram se o banco estiver vazio.
// No Render grátis o arquivo some a cada reinício; assim a demo nunca abre vazia.
const { total } = db.prepare('SELECT COUNT(*) AS total FROM clientes').get();
if (total === 0) {
  const r = db
    .prepare('INSERT INTO clientes (nome, cpf, email) VALUES (?, ?, ?)')
    .run('Ana Silva', '11122233344', 'ana@exemplo.com');
  db.prepare(`INSERT INTO contas (tipo, saldo, cliente_id, criada_em)
              VALUES (?, ?, ?, ?)`)
    .run('corrente', 1500, r.lastInsertRowid, new Date().toISOString());
}
```

Insira dois ou três registros de cada entidade. Use **dados fictícios**: nada de CPF, e-mail ou telefone de pessoas reais em um repositório público.

### ✅ Checkpoint 2
Pare o servidor, apague o `banco.db`, suba de novo: `GET` na sua rota principal já devolve os dados de exemplo. Reinicie sem apagar: os dados **não** duplicam.

> **Isto resolve a persistência em produção?** Não. É um paliativo para a demonstração. A solução de verdade é um disco persistente (pago) ou um banco gerenciado, como o PostgreSQL. E, graças às camadas, essa troca aconteceria só no model. A prova de persistência do Projeto 1 é **local** e vai no vídeo (etapa 8).

---

## 3. README

Substitua o `README.md` da raiz por um que responda, nesta ordem: o que é, onde está no ar, como rodar, quais são as rotas e como o código se organiza. Modelo:

````markdown
# Nome do seu sistema

Uma ou duas frases: o que o sistema faz e para quem.
Projeto 1 da disciplina Programação Web (UEPB, 2026.2).

- **Aplicação:** https://SEU-FRONT.vercel.app
- **API:** https://SEU-SERVICO.onrender.com
- **Vídeo de apresentação:** (link)

> A API está no plano grátis do Render: o primeiro acesso pode levar cerca de
> um minuto, e os dados voltam aos de exemplo a cada reinício do serviço.

## Tecnologias

- Backend: Node.js 22, Express 5, SQLite (`node:sqlite`, SQL puro)
- Frontend: HTML, CSS, Bootstrap 5, JavaScript puro (ES Modules, `fetch`)

## Como rodar localmente

Pré-requisito: Node.js 22 ou superior.

```bash
# 1. API
cd backend
npm install
cp .env.example .env
npm run dev                      # http://localhost:3000

# 2. Frontend (em outro terminal)
cd frontend
npx http-server -p 5500 -c-1     # http://localhost:5500
```

## Rotas da API

| Método | Rota | O que faz | Respostas |
|---|---|---|---|
| GET | /categorias | Lista as categorias | 200 |
| POST | /categorias | Cria uma categoria | 201, 400, 409 |
| GET | /categorias/:id | Busca uma categoria | 200, 404 |
| PUT | /categorias/:id | Atualiza uma categoria | 200, 404 |
| DELETE | /categorias/:id | Remove uma categoria | 204, 404, 409 |
| ... | ... | ... | ... |

Erros seguem o formato `{ "erro": "mensagem" }`.

## Regras de negócio

- (uma linha por regra: o que é validado e qual status devolve)

## Estrutura

```
backend/
  src/
    routes/        mapeia URL → controller
    controllers/   lê a requisição, chama o service, responde
    services/      regras de negócio
    models/        acesso ao banco (SQL)
    middleware/    logger e tratamento de erros
    db.js          conexão e schema do SQLite
frontend/
  js/
    api.js         camada HTTP (fetch)
    services/      regras da tela
    state/         estado da aplicação
    ui/            desenho da tela
MODELAGEM.md       modelagem de classes (S2)
s1/ … s4/          exercícios das semanas
```

## Autor

Seu nome · Ciência da Computação · UEPB
````

Dicas:
- As rotas e os status já estão no seu `backend/TESTES.md` da S3.
- Os links do topo você preenche nas etapas 5, 6 e 8.
- Teste do README: um colega consegue rodar o projeto só com ele?

Commit do que foi feito até aqui:

```bash
git add -A
git commit -m "docs(p1): README, variáveis de ambiente e dados de exemplo"
git push
```

---

## 4. Merge na `main`

O Render e a Vercel publicam a partir da `main`.

```bash
gh pr list
gh pr merge 5 --merge --delete-branch     # troque 5 pelo número do PR da S5
git switch main
git pull
```

(Sem o `gh`: no site do GitHub, abra o PR → **Merge pull request** → **Confirm merge** → **Delete branch**; depois `git switch main` e `git pull`.)

### ✅ Checkpoint 4
No GitHub, a `main` tem `backend/src/db.js` e o README novo. Daqui em diante, os ajustes pequenos de deploy podem ser feitos direto na `main`.

---

## 5. Deploy do backend (Render)

1. Crie uma conta em https://render.com entrando **com o GitHub**.
2. **New → Web Service** e escolha o repositório `progweb-p1-nome-sobrenome` (autorize o acesso do Render ao repositório, se pedir).
3. Preencha:

| Campo | Valor |
|---|---|
| Nome | algo como `p1-seunome-api` (vira parte da URL) |
| Branch | `main` |
| **Root Directory** (pasta raiz) | `backend` |
| Runtime / Language | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type / Plano | **Free** |

4. Em **Environment Variables**, por enquanto, nenhuma é obrigatória. (O Render define a `PORT` sozinho, e o `server.js` já a lê.)
5. **Create Web Service** e acompanhe o log até aparecer a linha `🚀 … em http://localhost:…` do seu `server.js`.

### ✅ Checkpoint 5
`https://SEU-SERVICO.onrender.com/` devolve o JSON do health check, e `https://SEU-SERVICO.onrender.com/SUA-ROTA` devolve os dados de exemplo.

Se o log mostrar `No such built-in module: node:sqlite`, o Render usou um Node antigo: confira o `engines` do `package.json` (etapa 1.3) ou crie a variável de ambiente `NODE_VERSION` com o valor `22` e faça um novo deploy.

---

## 6. Deploy do frontend (Vercel)

### 6.1 — O front precisa saber onde a API mora

Na S4, o comentário do `frontend/js/config.js` avisava: "No deploy (S5), o endereço muda aqui e em mais nenhum lugar". Troque o conteúdo por:

```javascript
// O único arquivo que sabe onde a API mora.
// No seu notebook, a API local; publicado, a API do Render.
const LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);

export const API_URL = LOCAL
  ? 'http://localhost:3000'
  : 'https://SEU-SERVICO.onrender.com';   // sem barra no final
```

```bash
git add frontend/js/config.js
git commit -m "chore(p1): front aponta para a API publicada"
git push
```

### 6.2 — Publicar

1. Crie uma conta em https://vercel.com entrando **com o GitHub**.
2. **Add New → Project** e importe o repositório.
3. Preencha:

| Campo | Valor |
|---|---|
| **Root Directory** | `frontend` |
| Framework Preset | **Other** |
| Build Command | (vazio) |
| Output Directory | (padrão) |

4. **Deploy**. Ao terminar, a Vercel mostra a URL (algo como `https://p1-seunome.vercel.app`).

> Prefere a Netlify? Funciona do mesmo jeito: **Add new site → Import an existing project**, com *Base directory* `frontend`, *Build command* vazio e *Publish directory* `frontend`.

### ✅ Checkpoint 6
A página abre no endereço da Vercel, com o Bootstrap aplicado. A lista ainda mostra o **estado de erro**: o CORS da API não conhece essa origem. É o esperado; a etapa 7 resolve.

---

## 7. Ligar um ao outro e testar

No Render, abra o seu serviço → **Environment** → adicione:

| Variável | Valor |
|---|---|
| `CORS_ORIGIN` | `https://p1-seunome.vercel.app` (a URL da Vercel, **sem barra no final**) |

Salve. O Render faz um novo deploy sozinho (aguarde o log).

### ✅ Checkpoint 7 — o teste de produção

No endereço da Vercel:

- [ ] a lista carrega os dados de exemplo (o primeiro acesso pode levar cerca de 1 minuto, com a tela em "carregando");
- [ ] criar, editar e remover funcionam nas duas entidades;
- [ ] violar uma regra mostra a mensagem da API na tela;
- [ ] no DevTools (F12), a aba Console não tem erro de CORS.

Atualize os links no topo do `README.md`, faça commit e push.

---

## 8. Vídeo (5 a 10 minutos)

Grave a **tela com a sua voz**. Ferramentas que servem: OBS Studio, a gravação de tela do próprio sistema (Windows: `Win+Alt+R`; macOS: `Cmd+Shift+5`), o Loom ou uma chamada do Google Meet gravada só com você.

Roteiro sugerido:

| Tempo | O que mostrar |
|---|---|
| 0:00 – 0:30 | Quem é você, qual é o domínio do sistema |
| 0:30 – 3:00 | **A aplicação no ar** (link da Vercel): o CRUD das duas entidades, uma mensagem de erro de regra e os estados de tela |
| 3:00 – 4:30 | **A prova de persistência, local:** criar um registro, `Ctrl+C` no terminal da API, `npm run dev`, recarregar a página: o registro continua lá |
| 4:30 – 8:00 | **O código:** as pastas do `backend/`; um caminho completo (route → controller → service → model); o `db.js`; um model com SQL e `?` |
| 8:00 – 9:00 | **O DIP:** o que mudou da S3 para a S5 e o que não mudou; uma regra que mora no service |
| 9:00 – 10:00 | O front em camadas, em uma frase por pasta; o que você faria diferente |

Dicas:
- Abra o link da API um minuto antes de gravar, para o Render "acordar".
- Aumente a fonte do editor e do terminal.
- Fale com as suas palavras. O que vale é você explicar o **seu** código.

Publique como vídeo **não listado** no YouTube ou como arquivo no Google Drive com acesso "qualquer pessoa com o link". Coloque o link no README.

---

## 9. Entrega

Na atividade **"Projeto 1"** do Google Classroom, até **quinta 19/11, 23h59**, envie:

1. o link do vídeo;
2. o link do repositório público `progweb-p1-nome-sobrenome`;
3. os links do deploy (front e API).

### Checklist final

**Repositório**
- [ ] É público, e a entrega está na branch `main`.
- [ ] `backend/`: routes, controllers, services, models, middleware e `db.js`.
- [ ] Models com SQL puro; todos os valores com `?`.
- [ ] `PRAGMA foreign_keys = ON` e chave estrangeira entre as duas tabelas.
- [ ] `frontend/`: camadas `api / services / state / ui` e os quatro estados de tela.
- [ ] CRUD completo das duas entidades, pela tela.
- [ ] `README.md` com links, como rodar, rotas e estrutura.
- [ ] `backend/.env.example` presente; `.env`, `banco.db` e `node_modules/` ausentes.
- [ ] Nenhum dado pessoal real nos dados de exemplo.

**Deploy**
- [ ] A API responde no Render.
- [ ] O front abre na Vercel e conversa com a API (sem erro de CORS).

**Vídeo**
- [ ] Tem de 5 a 10 minutos, com tela e voz.
- [ ] Mostra a aplicação, a prova de persistência local e o código.
- [ ] O link abre em uma janela anônima (teste antes de enviar).

> **O deploy não funcionou até o prazo?** Entregue assim mesmo: vídeo com tudo rodando localmente e, no README, o que você tentou e o erro que apareceu.

---

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| Render: `No such built-in module: node:sqlite` | Versão antiga do Node | `engines` no `package.json` ou variável `NODE_VERSION=22`; novo deploy |
| Render: `Cannot find module …/src/server.js` ou `package.json not found` | Root Directory errado | Tem de ser `backend` |
| Render: o deploy termina, mas a página dá erro 502 | O servidor não subiu, ou não usa `process.env.PORT` | Leia o log; confira o `server.js` |
| A API demora cerca de um minuto no primeiro acesso | Serviço grátis suspenso por inatividade | É o esperado; aguarde |
| Os dados que criei ontem sumiram | Disco efêmero do plano grátis | É o esperado; por isso os dados de exemplo |
| Console: `blocked by CORS policy` em produção | `CORS_ORIGIN` ausente ou diferente da URL do front | Copie a URL da Vercel, com `https://` e **sem** barra no final |
| Console: `Mixed Content` | O front (https) chama a API por `http://` | No `config.js`, a URL da API começa com `https://` |
| Em produção, o front tenta `localhost:3000` | O `config.js` antigo foi publicado | Confira o commit e o push; veja o deploy mais recente na Vercel |
| Vercel: página 404 | Root Directory errado | Tem de ser `frontend` (onde está o `index.html`) |
| `.env` apareceu no GitHub | Faltou no `.gitignore` | `git rm --cached backend/.env`, acrescente ao `.gitignore`, commit |
| Localmente, `--env-file-if-exists` não é reconhecido | Node anterior ao 22.9 | Atualize o Node, ou use `--env-file=.env` (exige que o arquivo exista) |

---

## Para ir além (não é exigido)

- **OpenAPI/Swagger:** descreva a sua API em um arquivo `openapi.yaml` e veja a documentação interativa em https://editor.swagger.io. É o "README que máquinas leem": https://learn.openapis.org
- **PostgreSQL no lugar do SQLite em produção:** o Render oferece um banco gratuito por tempo limitado. A troca aconteceria só nos models; vamos retomar bancos em servidor na Trilha 3.

## Referências

- Render — *Deploy for Free* (limites do plano grátis): https://render.com/docs/free
- Render — *Deploy a Node Express App*: https://render.com/docs/deploy-node-express-app
- Vercel — *Project Configuration: Root Directory*: https://vercel.com/docs/deployments/configure-a-build
- Node.js — *Environment variables* (`--env-file`): https://nodejs.org/api/environment_variables.html
- Material PUC-Rio — aula "Documentação e Deploy"