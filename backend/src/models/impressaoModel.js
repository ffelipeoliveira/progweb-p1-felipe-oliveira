import { db } from '../db.js';

const campos = 'id, modelo_3d_id AS modelo3DId, custo, tamanho';

export const impressaoModel = {
  listar() {
    return db.prepare(`SELECT ${campos} FROM impressoes ORDER BY id`).all();
  },

  buscarPorId(id) {
    return db.prepare(`SELECT ${campos} FROM impressoes WHERE id = ?`).get(id) ?? null;
  },

  inserir({ modelo3DId, custo, tamanho }) {
    const resultado = db
      .prepare('INSERT INTO impressoes (modelo_3d_id, custo, tamanho) VALUES (?, ?, ?)')
      .run(modelo3DId, custo, tamanho);
    return this.buscarPorId(Number(resultado.lastInsertRowid));
  },

  atualizar(id, dados) {
    const atual = this.buscarPorId(id);
    if (!atual) return null;
    const atualizado = { ...atual, ...dados, id };
    db.prepare(
      'UPDATE impressoes SET modelo_3d_id = ?, custo = ?, tamanho = ? WHERE id = ?',
    ).run(atualizado.modelo3DId, atualizado.custo, atualizado.tamanho, id);
    return this.buscarPorId(id);
  },

  remover(id) {
    const resultado = db.prepare('DELETE FROM impressoes WHERE id = ?').run(id);
    return resultado.changes > 0;
  },
};
