# Regis3D Archiver

Sistema de registro de impressões e materiais para gráficas 3D.
Projeto 1 da disciplina Programação Web (UEPB, 2026.2).

- **Aplicação:** https://regis3darchiver.vercel.app
- **API:** https://regis3darchiver.onrender.com
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
| GET | /impressoes | Lista as impressões | 200 |
| GET | /modelos | Lista os modelos 3D | 200 |
| GET | /materiais | Lista os materiais e filamentos disponíveis | 200 |
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

Francisco Felipe Vieira de Oliveira · Ciência da Computação · UEPB
