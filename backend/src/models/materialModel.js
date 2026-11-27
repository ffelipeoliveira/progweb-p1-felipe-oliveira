import { db } from '../db.js';

const campos = 'id, tipo, marca, preco AS precoPorKg';

export const materialModel = {
  listar() {
    return db.prepare(`SELECT ${campos} FROM materiais ORDER BY id`).all();
  },

  buscarPorId(id) {
    return db.prepare(`SELECT ${campos} FROM materiais WHERE id = ?`).get(id) ?? null;
  },

  inserir({ tipo, marca, precoPorKg }) {
    const resultado = db
      .prepare('INSERT INTO materiais (tipo, marca, preco, qtd_em_gramas) VALUES (?, ?, ?, ?)')
      .run(tipo, marca, precoPorKg, 0);
    return this.buscarPorId(Number(resultado.lastInsertRowid));
  },

  atualizar(id, dados) {
    const atual = this.buscarPorId(id);
    if (!atual) return null;
    const atualizado = { ...atual, ...dados, id };
    db.prepare(
      'UPDATE materiais SET tipo = ?, marca = ?, preco = ? WHERE id = ?',
    ).run(atualizado.tipo, atualizado.marca, atualizado.precoPorKg, id);
    return this.buscarPorId(id);
  },

  remover(id) {
    const resultado = db.prepare('DELETE FROM materiais WHERE id = ?').run(id);
    return resultado.changes > 0;
  },
};
