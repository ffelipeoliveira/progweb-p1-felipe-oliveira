# Testes da API — Projeto 1 (S3)

API: Gráfica · entidades: Impressão e Modelo 3D · servidor: `npm run dev` em http://localhost:3000

| # | Método | URL | Body | Status obtido | Observação |
|---|---|---|---|---|---|
| 1 | POST | /impressoes | {"custo": 12.5, "tamanho": "10x10x10 cm" }| 201 | |
| 2 | POST | /modelos | {"peso": 50, "tamanho": "10x10x10 cm", "tempoDeImpressao": 3600} | 201 | |
| 3 | GET | /modelos | — | 200 | |
| 4 | GET | /modelos/99 | — | 404 | |
| 5 | POST | /impressoes | {"custo": -12.5, "tamanho": "10x10x10 cm" } | 400 | "O custo deve ser um número maior ou igual a zero" |
| 6 | POST | /modelos | {"peso": 50, "tamanho": "10x10x10 cm", "tempoDeImpressao": -3600} | 422 | "O tempo de impressão deve ser um número maior ou igual a zero" |
| 7 | DELETE | /modelos/1 | — | 204 | 