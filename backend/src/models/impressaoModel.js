// "Banco de dados" em memória: um array. Na S5 vira SQLite.
let impressoes = [];
let proximoId = 1;

export const impressaoModel = {
  listar() {
    return impressoes;
  },

  buscarPorId(id) {
    return impressoes.find((impressao) => impressao.id === id) ?? null;
  },

  inserir({ custo, tamanho }) {
    const novaImpressao = { id: proximoId++, custo, tamanho };
    impressoes.push(novaImpressao);
    return novaImpressao;
  },

  atualizar(id, dados) {
    const i = impressoes.findIndex((impressao) => impressao.id === id);
    if (i === -1) return null;
    impressoes[i] = { ...impressoes[i], ...dados, id }; // o id nunca muda
    return impressoes[i];
  },

  remover(id) {
    const antes = impressoes.length;
    impressoes = impressoes.filter((impressao) => impressao.id !== id);
    return impressoes.length < antes; // true = removeu
  },
};
