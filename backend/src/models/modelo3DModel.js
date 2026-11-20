// "Banco de dados" em memória: um array. Na S5 vira SQLite.
let modelos3D = [];
let proximoId = 1;

export const modelo3DModel = {
  listar() {
    return modelos3D;
  },

  buscarPorId(id) {
    return modelos3D.find((modelo3D) => modelo3D.id === id) ?? null;
  },

  inserir({ peso, tamanho, tempoDeImpressao }) {
    const novoModelo3D = {
      id: proximoId++,
      peso,
      tamanho,
      tempoDeImpressao,
    };
    modelos3D.push(novoModelo3D);
    return novoModelo3D;
  },

  atualizar(id, dados) {
    const i = modelos3D.findIndex((modelo3D) => modelo3D.id === id);
    if (i === -1) return null;
    modelos3D[i] = { ...modelos3D[i], ...dados, id }; // o id nunca muda
    return modelos3D[i];
  },

  remover(id) {
    const antes = modelos3D.length;
    modelos3D = modelos3D.filter((modelo3D) => modelo3D.id !== id);
    return modelos3D.length < antes; // true = removeu
  },
};
