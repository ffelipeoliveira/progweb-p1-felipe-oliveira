import { db } from '../db.js';

const campos = 'id, modelo_3d_id AS modelo3DId, material_id AS materialId, custo';

export const impressaoModel = {
  listar() {
    return db.prepare(`SELECT ${campos} FROM impressoes ORDER BY id`).all();
  },

  buscarPorId(id) {
    return db.prepare(`SELECT ${campos} FROM impressoes WHERE id = ?`).get(id) ?? null;
  },

  inserir({ modelo3DId, materialId, custo }) {
    const resultado = db
      .prepare('INSERT INTO impressoes (modelo_3d_id, material_id, custo) VALUES (?, ?, ?)')
      .run(modelo3DId, materialId, custo);
    return this.buscarPorId(Number(resultado.lastInsertRowid));
  },

  atualizar(id, dados) {
    const atual = this.buscarPorId(id);
    if (!atual) return null;
    const atualizado = { ...atual, ...dados, id };
    db.prepare(
      'UPDATE impressoes SET modelo_3d_id = ?, material_id = ?, custo = ? WHERE id = ?',
    ).run(atualizado.modelo3DId, atualizado.materialId, atualizado.custo, id);
    return this.buscarPorId(id);
  },

  remover(id) {
    const resultado = db.prepare('DELETE FROM impressoes WHERE id = ?').run(id);
    return resultado.changes > 0;
  },
};
