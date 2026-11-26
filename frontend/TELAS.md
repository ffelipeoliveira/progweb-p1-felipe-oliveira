Front: `npx http-server -p 5500 -c-1` em `frontend/` · API: `npm run dev` em `backend/`

| Lista | Estado | Como provocar | O que aparece |
|---|---|---|---|
| Modelos 3D | carregando | Network → throttling 3G → F5 | spinner "Carregando modelos 3D…" |
| Modelos 3D | vazio | API recém-iniciada | "Nenhum modelo cadastrado. Use o formulário para adicionar o primeiro." |
| Modelos 3D | erro | Ctrl+C na API → F5 | "Não consegui falar com a API. Ela está rodando?" + Tentar de novo |
| Modelos 3D | sucesso | cadastrar "modelo" | tabela com 1 linha |
| Impressões | vazio | sem impressões | "Nenhuma impressão registrada. Cadastre um modelo e registre a primeira." |
| Impressões | erro de regra | custo -1 | aviso "Selecione um valor que seja maior que zero" (400) |
| Materiais, impressoras, embalagens e vendas | carregando | Network → throttling 3G → F5 | spinner até a API responder |
| Materiais, impressoras, embalagens e vendas | vazio | API recém-iniciada | mensagem para cadastrar o primeiro item |
| Materiais, impressoras, embalagens e vendas | erro | Ctrl+C na API → F5 | erro da API e botão "Tentar de novo" |
| Materiais, impressoras, embalagens e vendas | sucesso | cadastrar um item | tabela com ações de editar e remover |

## Camadas
- api: `js/api.js` · services: `js/services/` · state: `js/state/store.js` · ui: `js/ui/`

## Entidades disponíveis

O menu superior leva às telas de modelos 3D, impressões, materiais, impressoras,
embalagens e vendas. Cada entidade permite criar, listar, editar e remover registros.
O lucro da venda é calculado pela API a partir do preço e do custo.