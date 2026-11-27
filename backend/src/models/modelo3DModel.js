import { db } from '../db.js';

const campos = 'id, peso, tamanho, url';

export const modelo3DModel = {
  listar() {
    return db.prepare(`SELECT ${campos} FROM modelos3d ORDER BY id`).all();
  },

  buscarPorId(id) {
    return db.prepare(`SELECT ${campos} FROM modelos3d WHERE id = ?`).get(id) ?? null;
  },

  inserir({ peso, tamanho, url }) {
    const resultado = db
      .prepare('INSERT INTO modelos3d (peso, tamanho, url) VALUES (?, ?, ?)')
      .run(peso, tamanho, url);
    return this.buscarPorId(Number(resultado.lastInsertRowid));
  },

  atualizar(id, dados) {
    const atual = this.buscarPorId(id);
    if (!atual) return null;
    const atualizado = { ...atual, ...dados, id };
    db.prepare(
      'UPDATE modelos3d SET peso = ?, tamanho = ?, url = ? WHERE id = ?',
    ).run(atualizado.peso, atualizado.tamanho, atualizado.url, id);
    return this.buscarPorId(id);
  },

  remover(id) {
    const resultado = db.prepare('DELETE FROM modelos3d WHERE id = ?').run(id);
    return resultado.changes > 0;
  },
};
