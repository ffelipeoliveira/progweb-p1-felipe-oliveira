# Testes da API — Projeto 1 (S3)

API: Gráfica · entidades: Impressão e Modelo 3D · servidor: `npm run dev` em http://localhost:3000

| # | Método | URL | Body | Status obtido | Observação |
|---|---|---|---|---|---|
| 1 | POST | /modelos | {"peso": 50, "tamanho": "10x10x10 cm"} | 201 | |
| 2 | POST | /materiais | {"tipo": "PLA", "marca": "Exemplo", "precoPorKg": 100} | 201 | |
| 3 | POST | /impressoes | {"modelo3DId": 1, "materialId": 1} | 201 | Custo calculado: R$ 5,00 |
| 3 | GET | /modelos | — | 200 | |
| 4 | GET | /modelos/99 | — | 404 | |
| 5 | POST | /materiais | {"tipo": "PLA", "marca": "Exemplo", "precoPorKg": -100} | 400 | "O preço por kg deve ser um número maior ou igual a zero" |
| 6 | POST | /modelos | {"peso": -50, "tamanho": "10x10x10 cm"} | 400 | "O peso deve ser um número maior que zero" |
| 7 | DELETE | /modelos/1 | — | 409 | Modelo associado a uma impressão não pode ser removido |